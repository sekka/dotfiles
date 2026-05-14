"""Write cells in an xlsm file without corrupting VBA, extLst, customXml, or
sharedStrings. Uses zipfile + lxml to edit sheet XML directly, bypassing openpyxl.

Reading is still done by openpyxl (lib/excel_io.py / lib/migrate.py) — that is safe
because reading does not write back to disk.

Public API
----------
write_cells(xlsm_path, sheet_name, updates)
    Write individual cells. updates = [(row_num, col_letter, value), ...]

append_rows(xlsm_path, sheet_name, rows, start_row=None) -> int
    Append rows dict-keyed by col_letter. Returns first inserted row number.
"""
from __future__ import annotations

import datetime
import os
import zipfile
from pathlib import Path
from typing import Any

from lxml import etree

# ---------------------------------------------------------------------------
# Namespaces
# ---------------------------------------------------------------------------

NS = "http://schemas.openxmlformats.org/spreadsheetml/2006/main"
NS_R = "http://schemas.openxmlformats.org/officeDocument/2006/relationships"

_NSMAP = {
    None: NS,
    "r": NS_R,
}


# ---------------------------------------------------------------------------
# Internal: sheet name → xl/worksheets/sheetN.xml resolution
# ---------------------------------------------------------------------------


def _resolve_sheet_path(zf: zipfile.ZipFile, sheet_name: str) -> str:
    """Resolve sheet_name to the zip entry path (e.g. 'xl/worksheets/sheet1.xml').

    Reads xl/workbook.xml for <sheet name="..." r:id="rIdN"/> then follows
    xl/_rels/workbook.xml.rels to get the Target path.
    """
    wb_xml = zf.read("xl/workbook.xml")
    wb_root = etree.fromstring(wb_xml)

    # Find the rId for sheet_name
    r_id: str | None = None
    for sheet_el in wb_root.iter(f"{{{NS}}}sheet"):
        if sheet_el.get("name") == sheet_name:
            r_id = sheet_el.get(f"{{{NS_R}}}id")
            break

    if r_id is None:
        raise KeyError(f"Sheet '{sheet_name}' not found in workbook")

    # Resolve rId → Target in xl/_rels/workbook.xml.rels
    rels_xml = zf.read("xl/_rels/workbook.xml.rels")
    rels_root = etree.fromstring(rels_xml)
    ns_rel = "http://schemas.openxmlformats.org/package/2006/relationships"

    target: str | None = None
    for rel in rels_root.iter(f"{{{ns_rel}}}Relationship"):
        if rel.get("Id") == r_id:
            target = rel.get("Target")
            break

    if target is None:
        raise KeyError(f"rId '{r_id}' not found in workbook.xml.rels")

    # Target may be:
    #   absolute: "/xl/worksheets/sheet1.xml" -> strip leading "/"
    #   relative: "worksheets/sheet1.xml"     -> prepend "xl/"
    if target.startswith("/"):
        return target.lstrip("/")
    return f"xl/{target}"


# ---------------------------------------------------------------------------
# Internal: column letter → 1-based index
# ---------------------------------------------------------------------------


def _col_to_index(col: str) -> int:
    """Convert column letter(s) to 1-based index. 'A'→1, 'Z'→26, 'AA'→27."""
    col = col.upper()
    result = 0
    for ch in col:
        result = result * 26 + (ord(ch) - ord("A") + 1)
    return result


def _cell_ref(row: int, col: str) -> str:
    """Build Excel cell reference like 'A1' from (row, col_letter)."""
    return f"{col.upper()}{row}"


# ---------------------------------------------------------------------------
# Internal: value → XML encoding
# ---------------------------------------------------------------------------


def _encode_value(cell_el: etree._Element, value: Any) -> None:
    """Set the type attribute and <v> or <is><t> child on a cell element.

    Encoding rules:
      str   → t="inlineStr", <is><t>value</t></is>  (no sharedStrings touch)
      int/float → no t, <v>value</v>
      bool  → t="b", <v>1 or 0</v>  (must be checked before int since bool is int)
      datetime.date / datetime.datetime → Excel serial number, no t, <v>serial</v>
      None  → caller should remove the element (not called in that case)
    """
    # Remove existing value children
    for child in list(cell_el):
        cell_el.remove(child)

    if isinstance(value, bool):
        cell_el.set("t", "b")
        v_el = etree.SubElement(cell_el, f"{{{NS}}}v")
        v_el.text = "1" if value else "0"

    elif isinstance(value, datetime.datetime):
        # Remove t= (numeric)
        cell_el.attrib.pop("t", None)
        serial = _datetime_to_serial(value)
        v_el = etree.SubElement(cell_el, f"{{{NS}}}v")
        v_el.text = str(serial)

    elif isinstance(value, datetime.date):
        cell_el.attrib.pop("t", None)
        serial = _date_to_serial(value)
        v_el = etree.SubElement(cell_el, f"{{{NS}}}v")
        v_el.text = str(serial)

    elif isinstance(value, (int, float)):
        cell_el.attrib.pop("t", None)
        v_el = etree.SubElement(cell_el, f"{{{NS}}}v")
        v_el.text = str(value)

    elif isinstance(value, str):
        cell_el.set("t", "inlineStr")
        is_el = etree.SubElement(cell_el, f"{{{NS}}}is")
        t_el = etree.SubElement(is_el, f"{{{NS}}}t")
        t_el.text = value

    else:
        raise TypeError(f"Unsupported value type: {type(value)}")


# ---------------------------------------------------------------------------
# Internal: date serial helpers (Excel 1900 date system)
# ---------------------------------------------------------------------------

_EXCEL_EPOCH = datetime.date(1899, 12, 30)  # day 0 in Excel's 1900 system


def _date_to_serial(d: datetime.date) -> int:
    """Convert a date to Excel serial number (days since 1900-01-00)."""
    return (d - _EXCEL_EPOCH).days


def _datetime_to_serial(dt: datetime.datetime) -> float:
    """Convert a datetime to Excel serial number (fractional days)."""
    epoch = datetime.datetime(1899, 12, 30)
    delta = dt - epoch
    return delta.days + delta.seconds / 86400.0


# ---------------------------------------------------------------------------
# Internal: max occupied row in a sheet
# ---------------------------------------------------------------------------


def _max_row(root: etree._Element) -> int:
    """Return the highest r= row number currently in the sheet data."""
    sheet_data = root.find(f"{{{NS}}}sheetData")
    if sheet_data is None:
        return 0
    max_r = 0
    for row_el in sheet_data.findall(f"{{{NS}}}row"):
        r = row_el.get("r")
        if r is not None:
            max_r = max(max_r, int(r))
    return max_r


# ---------------------------------------------------------------------------
# Internal: get or create a <row r="N"> element in sorted order
# ---------------------------------------------------------------------------


def _get_or_create_row(sheet_data: etree._Element, row_num: int) -> etree._Element:
    """Return the existing <row r="row_num"> or create it at the correct position."""
    for row_el in sheet_data.findall(f"{{{NS}}}row"):
        if row_el.get("r") == str(row_num):
            return row_el

    # Create a new row element inserted in sorted row order
    new_row = etree.Element(f"{{{NS}}}row")
    new_row.set("r", str(row_num))

    # Find insertion point
    rows = sheet_data.findall(f"{{{NS}}}row")
    insert_before: etree._Element | None = None
    for row_el in rows:
        r = int(row_el.get("r", "0"))
        if r > row_num:
            insert_before = row_el
            break

    if insert_before is not None:
        idx = list(sheet_data).index(insert_before)
        sheet_data.insert(idx, new_row)
    else:
        sheet_data.append(new_row)

    return new_row


# ---------------------------------------------------------------------------
# Internal: set a single cell in the sheet XML tree
# ---------------------------------------------------------------------------


def _set_cell(root: etree._Element, row_num: int, col_letter: str, value: Any) -> None:
    """Update or create a cell in the XML tree.

    - If value is None, remove the cell element.
    - Otherwise upsert the cell, preserving the s= (style) attribute.
    - New cells in an existing row are inserted in column-sorted order.
    """
    col_upper = col_letter.upper()
    ref = _cell_ref(row_num, col_upper)

    sheet_data = root.find(f"{{{NS}}}sheetData")
    if sheet_data is None:
        sheet_data = etree.SubElement(root, f"{{{NS}}}sheetData")

    row_el = _get_or_create_row(sheet_data, row_num)

    # Find existing cell
    existing: etree._Element | None = None
    for c in row_el.findall(f"{{{NS}}}c"):
        if c.get("r") == ref:
            existing = c
            break

    if value is None:
        if existing is not None:
            row_el.remove(existing)
        return

    if existing is not None:
        # Preserve s= attribute; update value encoding only
        style = existing.get("s")
        # Remove t= so _encode_value can set the correct one
        existing.attrib.pop("t", None)
        _encode_value(existing, value)
        if style is not None:
            existing.set("s", style)
    else:
        # Create new cell element, inserted in column-sorted order
        new_cell = etree.Element(f"{{{NS}}}c")
        new_cell.set("r", ref)
        _encode_value(new_cell, value)

        # Insert in column order
        col_idx = _col_to_index(col_upper)
        cells = row_el.findall(f"{{{NS}}}c")
        insert_before_cell: etree._Element | None = None
        for c in cells:
            c_ref = c.get("r", "")
            c_col = "".join(ch for ch in c_ref if ch.isalpha())
            if _col_to_index(c_col) > col_idx:
                insert_before_cell = c
                break

        if insert_before_cell is not None:
            idx = list(row_el).index(insert_before_cell)
            row_el.insert(idx, new_cell)
        else:
            row_el.append(new_cell)


# ---------------------------------------------------------------------------
# Internal: zip round-trip with modified sheet XML
# ---------------------------------------------------------------------------


def _rewrite_zip(xlsm_path: Path, sheet_zip_path: str, new_sheet_xml: bytes) -> None:
    """Replace sheet_zip_path in xlsm_path with new_sheet_xml atomically.

    All other zip entries are copied verbatim.
    On failure, the tmp file is deleted and the original is untouched.
    """
    tmp = xlsm_path.with_suffix(".tmp.xlsm")
    try:
        with zipfile.ZipFile(xlsm_path, "r") as src_zip:
            with zipfile.ZipFile(tmp, "w", compression=zipfile.ZIP_DEFLATED) as dst_zip:
                for info in src_zip.infolist():
                    if info.filename == sheet_zip_path:
                        dst_zip.writestr(info, new_sheet_xml)
                    else:
                        dst_zip.writestr(info, src_zip.read(info.filename))
        os.replace(tmp, xlsm_path)
    except Exception:
        if tmp.exists():
            tmp.unlink()
        raise


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------


def write_cells(
    xlsm_path: Path,
    sheet_name: str,
    updates: list[tuple[int, str, Any]],
) -> None:
    """Write individual cells into an xlsm without touching any other zip parts.

    Args:
        xlsm_path:  Path to the .xlsm file (modified in place).
        sheet_name: Worksheet name (supports Unicode / Japanese names).
        updates:    List of (row_num, col_letter, value). 1-based row numbers.
                    value=None deletes the cell element.
    """
    with zipfile.ZipFile(xlsm_path, "r") as zf:
        sheet_zip_path = _resolve_sheet_path(zf, sheet_name)
        sheet_xml = zf.read(sheet_zip_path)

    root = etree.fromstring(sheet_xml)

    for row_num, col_letter, value in updates:
        _set_cell(root, row_num, col_letter, value)

    new_xml = etree.tostring(root, xml_declaration=True, encoding="UTF-8", standalone=True)
    _rewrite_zip(xlsm_path, sheet_zip_path, new_xml)


def append_rows(
    xlsm_path: Path,
    sheet_name: str,
    rows: list[dict[str, Any]],
    start_row: int | None = None,
) -> int:
    """Append rows to a sheet at the end (or at start_row if specified).

    Args:
        xlsm_path:  Path to the .xlsm file.
        sheet_name: Worksheet name.
        rows:       List of dicts {col_letter: value, ...}.
        start_row:  Override the insertion row. If None, appends after max row.

    Returns:
        The 1-based row number where insertion started.
    """
    if not rows:
        return 0

    with zipfile.ZipFile(xlsm_path, "r") as zf:
        sheet_zip_path = _resolve_sheet_path(zf, sheet_name)
        sheet_xml = zf.read(sheet_zip_path)

    root = etree.fromstring(sheet_xml)

    if start_row is None:
        start_row = _max_row(root) + 1

    for i, row_dict in enumerate(rows):
        row_num = start_row + i
        for col_letter, value in row_dict.items():
            _set_cell(root, row_num, col_letter, value)

    new_xml = etree.tostring(root, xml_declaration=True, encoding="UTF-8", standalone=True)
    _rewrite_zip(xlsm_path, sheet_zip_path, new_xml)

    return start_row
