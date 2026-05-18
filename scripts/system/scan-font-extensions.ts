#!/usr/bin/env bun
/**
 * scan-font-extensions.ts
 *
 * Scan a directory for files whose extension does not match their actual
 * font format as determined by magic number inspection of the first 12
 * bytes.  Dry-run only — no renaming is performed.
 *
 * Usage:
 *   bun scripts/system/scan-font-extensions.ts \
 *     --root <dir>          Required: directory to scan
 *     [--report <path>]     TSV output path (default: ./font-extensions.tsv)
 *     [--limit N]           Debug: process only first N files
 *
 * Note: --apply (rename) is intentionally absent; that is a separate phase.
 *
 * Output TSV columns:
 *   relpath, status, current_ext, detected, expected_ext, size_bytes
 *
 * Rows with status OK / OK_OTC are NOT written to TSV (counted only).
 *
 * Magic-number → expected extension table:
 *   0x4F54544F  OTTO  → .otf
 *   0x00010000  -     → .ttf
 *   0x74727565  true  → .ttf
 *   0x74797031  typ1  → .ttf
 *   0x74746366  ttcf  → .ttc   (includes .otc files, handled by OTC exception)
 *   0x774F4646  wOFF  → .woff
 *   0x774F4632  wOF2  → .woff2
 *   anything else     → unknown (not a recognised font format)
 *
 * .otc note: magic-level .otc is indistinguishable from .ttc (both use "ttcf"
 * magic). Files with extension .otc and detected type "ttc" are treated as OK
 * (OTC exception).
 *
 * .dfont / .suit / .pfb / .pfm: these formats store font data in the macOS
 * resource fork; the data fork has no detectable magic. Files with these
 * extensions and unknown data-fork magic are classified as OK_RESOURCE_FORK
 * (not flagged as anomalies). If one of these files has a recognised font magic
 * in the data fork it is still classified normally.
 */

import { existsSync } from "node:fs";
import { mkdir, open, stat, writeFile } from "node:fs/promises";
import { basename, dirname, extname, relative, resolve } from "node:path";
import { parseArgs } from "node:util";
import { escapeTsv, walk } from "./_font-hash.ts";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/**
 * Extensions that store font data in the macOS resource fork (or use a legacy
 * format with no detectable data-fork magic). Data-fork magic is not
 * meaningful for these — unknown magic is treated as OK_RESOURCE_FORK.
 */
export const RESOURCE_FORK_EXTS = new Set([
  ".dfont", // Datafork font (Mac resource manager format)
  ".suit", // Font Suitcase
  ".pfb", // Type 1 PostScript binary
  ".pfm", // PostScript font metrics
]);

/** Font file extensions (same set as scan-self-duplicates.ts). */
export const FONT_EXTS = new Set([
  ".otf",
  ".ttf",
  ".ttc",
  ".otc",
  ".dfont",
  ".suit",
  ".woff",
  ".woff2",
  ".pfb",
  ".pfm",
]);

// Magic numbers as 32-bit big-endian values (first 4 bytes of the file).
const MAGIC_OTTO = 0x4f54544f; // "OTTO" → OpenType/CFF
const MAGIC_TTF1 = 0x00010000; // standard TrueType
const MAGIC_TRUE = 0x74727565; // "true" (Apple TrueType)
const MAGIC_TYP1 = 0x74797031; // "typ1" (older Apple TrueType)
const MAGIC_TTCF = 0x74746366; // "ttcf" → TTC / OTC
const MAGIC_WOFF = 0x774f4646; // "wOFF"
const MAGIC_WOF2 = 0x774f4632; // "wOF2"

export type DetectedType = "otf" | "ttf" | "ttc" | "woff" | "woff2" | "unknown";

/**
 * Detect font format from the first 4 bytes (read from a 12-byte buffer).
 * Exported for unit tests — pure function, no I/O.
 */
export function detectMagic(buf: Buffer): DetectedType {
  if (buf.length < 4) return "unknown";
  const magic = buf.readUInt32BE(0);
  if (magic === MAGIC_OTTO) return "otf";
  if (magic === MAGIC_TTF1 || magic === MAGIC_TRUE || magic === MAGIC_TYP1) return "ttf";
  if (magic === MAGIC_TTCF) return "ttc";
  if (magic === MAGIC_WOFF) return "woff";
  if (magic === MAGIC_WOF2) return "woff2";
  return "unknown";
}

export type ExtStatus =
  | "OK"
  | "OK_OTC"
  | "OK_RESOURCE_FORK"
  | "MISSING_EXT"
  | "WRONG_FONT_EXT"
  | "WRONG_NON_FONT_EXT"
  | "NOT_FONT_BUT_FONT_EXT";

export type ClassifyResult = {
  status: ExtStatus;
  expectedExt: string; // empty for NOT_FONT_BUT_FONT_EXT
};

/**
 * Classify a file given its current lowercase extension and detected type.
 * Exported for unit tests — pure function, no I/O.
 */
export function classifyExtension(currentExt: string, detected: DetectedType): ClassifyResult {
  if (detected === "unknown") {
    // Resource-fork-only formats: data fork has no magic, treat as OK
    if (RESOURCE_FORK_EXTS.has(currentExt)) {
      return { status: "OK_RESOURCE_FORK", expectedExt: "" };
    }
    // Font extension but unrecognised magic → anomaly
    if (FONT_EXTS.has(currentExt)) {
      return { status: "NOT_FONT_BUT_FONT_EXT", expectedExt: "" };
    }
    // Non-font file with non-font extension → skip (caller handles this)
    return { status: "OK", expectedExt: "" };
  }

  const expectedExt = "." + detected; // e.g. ".otf", ".ttc"

  // OTC exception: .otc files use the same "ttcf" magic as .ttc
  if (currentExt === ".otc" && detected === "ttc") {
    return { status: "OK_OTC", expectedExt };
  }

  if (currentExt === expectedExt) {
    return { status: "OK", expectedExt };
  }

  if (currentExt === "") {
    return { status: "MISSING_EXT", expectedExt };
  }

  if (FONT_EXTS.has(currentExt)) {
    return { status: "WRONG_FONT_EXT", expectedExt };
  }

  return { status: "WRONG_NON_FONT_EXT", expectedExt };
}

// ---------------------------------------------------------------------------
// TSV row type
// ---------------------------------------------------------------------------

type ReportRow = {
  relpath: string;
  status: ExtStatus;
  current_ext: string;
  detected: DetectedType;
  expected_ext: string;
  size_bytes: number;
};

// ---------------------------------------------------------------------------
// Argument parsing
// ---------------------------------------------------------------------------

type Args = {
  root: string;
  report: string;
  limit: number;
};

function printUsage(): void {
  console.error(`Usage:
  bun scripts/system/scan-font-extensions.ts \\
    --root <dir>           Required: directory to scan
    [--report <path>]      Output TSV path (default: ./font-extensions.tsv)
    [--limit N]            Debug: process only first N files

This script is analysis-only (dry-run). No files are renamed.
Report columns: relpath, status, current_ext, detected, expected_ext, size_bytes
`);
}

function parseArgsOrExit(): Args {
  let rawValues: ReturnType<typeof parseArgs>["values"];
  try {
    ({ values: rawValues } = parseArgs({
      args: process.argv.slice(2),
      options: {
        root: { type: "string" },
        report: { type: "string" },
        limit: { type: "string" },
        help: { type: "boolean", default: false },
      },
      allowPositionals: false,
    }));
  } catch (err) {
    console.error(`Error: ${(err as Error).message}`);
    printUsage();
    process.exit(1);
  }

  const values = rawValues as {
    root?: string;
    report?: string;
    limit?: string;
    help?: boolean;
  };

  const helpFlag = values.help ?? false;
  if (helpFlag || !values.root) {
    printUsage();
    process.exit(helpFlag ? 0 : 1);
  }

  const root = resolve(values.root as string);
  if (!existsSync(root)) {
    console.error(`Error: root directory does not exist: ${root}`);
    process.exit(2);
  }

  const report = resolve(values.report ?? "./font-extensions.tsv");
  let limit = Number.POSITIVE_INFINITY;
  if (values.limit !== undefined) {
    limit = Number.parseInt(values.limit, 10);
    if (!Number.isFinite(limit) || limit <= 0) {
      console.error(`Invalid --limit value: "${values.limit}" (must be a positive integer).`);
      printUsage();
      process.exit(1);
    }
  }

  return { root, report, limit };
}

// ---------------------------------------------------------------------------
// Read first 12 bytes of a file
// ---------------------------------------------------------------------------

async function readMagicBytes(filePath: string): Promise<Buffer | null> {
  let fh;
  try {
    fh = await open(filePath, "r");
    const buf = Buffer.alloc(12);
    const { bytesRead } = await fh.read(buf, 0, 12, 0);
    return buf.subarray(0, bytesRead);
  } catch {
    return null;
  } finally {
    await fh?.close();
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  const args = parseArgsOrExit();

  // Ensure report directory exists
  const reportDir = dirname(args.report);
  await mkdir(reportDir, { recursive: true });

  console.log(`=== ${args.root} ===`);

  let scanned = 0;
  let okCount = 0;
  let otcCount = 0;
  let resourceForkCount = 0;
  let missingExtCount = 0;
  let wrongFontExtCount = 0;
  let wrongNonFontExtCount = 0;
  let notFontButFontExtCount = 0;

  const rows: ReportRow[] = [];

  for await (const filePath of walk(args.root)) {
    const name = basename(filePath);

    // Skip dotfiles (files starting with ".")
    if (name.startsWith(".")) continue;

    // Get file size and skip 0-byte files
    let fileSize: number;
    try {
      const st = await stat(filePath);
      fileSize = st.size;
    } catch {
      continue;
    }
    if (fileSize === 0) continue;

    scanned++;
    if (Number.isFinite(args.limit) && scanned > args.limit) {
      scanned--;
      break;
    }

    const currentExt = extname(name).toLowerCase();
    const relPath = relative(args.root, filePath);

    // Read magic bytes
    const buf = await readMagicBytes(filePath);
    if (buf === null) continue;

    const detected = detectMagic(buf);
    const { status, expectedExt } = classifyExtension(currentExt, detected);

    // Skip completely non-font files (unknown magic + non-font extension)
    if (status === "OK" && detected === "unknown") continue;

    if (status === "OK") {
      okCount++;
    } else if (status === "OK_OTC") {
      okCount++;
      otcCount++;
    } else if (status === "OK_RESOURCE_FORK") {
      okCount++;
      resourceForkCount++;
    } else {
      // Write anomalies to TSV
      if (status === "MISSING_EXT") missingExtCount++;
      else if (status === "WRONG_FONT_EXT") wrongFontExtCount++;
      else if (status === "WRONG_NON_FONT_EXT") wrongNonFontExtCount++;
      else if (status === "NOT_FONT_BUT_FONT_EXT") notFontButFontExtCount++;

      rows.push({
        relpath: relPath,
        status,
        current_ext: currentExt,
        detected,
        expected_ext: expectedExt,
        size_bytes: fileSize,
      });
    }
  }

  // Write TSV
  const header = "relpath\tstatus\tcurrent_ext\tdetected\texpected_ext\tsize_bytes";
  const lines = [
    header,
    ...rows.map((r) =>
      [
        escapeTsv(r.relpath),
        r.status,
        r.current_ext,
        r.detected,
        r.expected_ext,
        String(r.size_bytes),
      ].join("\t"),
    ),
  ];
  await writeFile(args.report, lines.join("\n") + "\n", "utf8");

  // Console summary
  const totalAnomalies =
    missingExtCount + wrongFontExtCount + wrongNonFontExtCount + notFontButFontExtCount;
  console.log(`Total files scanned: ${scanned}`);
  console.log(`  OK:                       ${okCount}`);
  console.log(`    内 OTC:                 ${otcCount}`);
  console.log(`    内 resource-fork:       ${resourceForkCount}`);
  console.log(`  MISSING_EXT:              ${missingExtCount}`);
  console.log(`  WRONG_FONT_EXT:           ${wrongFontExtCount}`);
  console.log(`  WRONG_NON_FONT_EXT:       ${wrongNonFontExtCount}`);
  console.log(`  NOT_FONT_BUT_FONT_EXT:    ${notFontButFontExtCount}`);
  console.log(`Report: ${args.report}`);

  if (totalAnomalies === 0 && rows.length === 0) {
    console.log("(no anomalies found)");
  }
}

if (import.meta.main) {
  main().catch((err) => {
    console.error("Fatal:", err);
    process.exit(1);
  });
}
