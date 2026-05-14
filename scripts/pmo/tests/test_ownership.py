from lib.ownership import resolve_ownership, OwnerSide
from lib.yaml_io import ColumnSpec


def make_cols(*specs):
    return [ColumnSpec(col=c, field=f, owner=o) for c, f, o in specs]


def test_resolve_ownership_yaml_columns():
    cols = make_cols(("A", "id", "yaml"), ("B", "name", "yaml"))
    result = resolve_ownership(cols)
    assert result.yaml_fields == {"id", "name"}
    assert result.excel_fields == set()


def test_resolve_ownership_mixed():
    cols = make_cols(
        ("A", "id", "yaml"),
        ("B", "name", "yaml"),
        ("C", "status", "excel"),
        ("D", "note", "excel"),
    )
    result = resolve_ownership(cols)
    assert result.yaml_fields == {"id", "name"}
    assert result.excel_fields == {"status", "note"}


def test_resolve_ownership_invalid_owner_raises():
    import pytest
    cols = make_cols(("A", "id", "both"))
    with pytest.raises(ValueError, match="invalid owner"):
        resolve_ownership(cols)


def test_resolve_ownership_field_to_column_map():
    cols = make_cols(("A", "id", "yaml"), ("C", "status", "excel"))
    result = resolve_ownership(cols)
    assert result.column_of["id"] == "A"
    assert result.column_of["status"] == "C"


def test_resolve_ownership_owner_side_enum():
    assert OwnerSide.YAML.value == "yaml"
    assert OwnerSide.EXCEL.value == "excel"
