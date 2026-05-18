#!/usr/bin/env bun
/**
 * scan-self-duplicates.ts
 *
 * Scan a font directory (e.g. FontExplorer library) for:
 *   - Self-duplicates: identical files (same SHA256) within the same tree
 *   - Format pairs:    same basename, different extension (.otf vs .ttf), different hashes
 *   - Anomalies:       cloud placeholders, Dropbox conflicted copies, suspect/empty files
 *
 * Usage:
 *   bun scripts/system/scan-self-duplicates.ts --root ~/Library/Fonts --report out.tsv
 *   bun scripts/system/scan-self-duplicates.ts --root /path/to/FontExplorer --limit 500
 *
 * Output TSV columns: relpath, kind, group_id, role, sha256, data_bytes, rsrc_bytes, anomaly_reason
 *
 * Note: --apply flag is intentionally absent. This script is dry-run / analysis only.
 *       Isolation and deletion are handled in a separate phase.
 */

import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import { basename, extname, relative, resolve } from "node:path";
import { parseArgs } from "node:util";
import { escapeTsv, fmtBytes, fmtDuration, hashFile, Progress, walk } from "./_font-hash.ts";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type FileEntry = {
  path: string;
  relPath: string;
  hash: string;
  dataSize: number;
  rsrcSize: number;
  suspect: boolean;
  suspectReason: string;
};

type AnomalyKind =
  | "cloud_placeholder"
  | "conflicted_name"
  | "zero_byte_data"
  | "suspect_size_mismatch"
  | "suspect_both_forks_empty"
  | "hash_error";

type AnomalyEntry = {
  path: string;
  relPath: string;
  reasons: AnomalyKind[];
  hash: string;
  dataSize: number;
  rsrcSize: number;
};

type ReportRow = {
  relpath: string;
  kind: "DUP_GROUP" | "FORMAT_PAIR" | "ANOMALY" | "SOLO";
  group_id: string;
  role: string;
  sha256: string;
  data_bytes: string;
  rsrc_bytes: string;
  anomaly_reason: string;
};

// ---------------------------------------------------------------------------
// Font file extensions
// ---------------------------------------------------------------------------

const FONT_EXTS = new Set([
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

function isFontFile(path: string): boolean {
  return FONT_EXTS.has(extname(path).toLowerCase());
}

// ---------------------------------------------------------------------------
// Pure helper functions (exported for testing)
// ---------------------------------------------------------------------------

/** Dropbox conflicted copy pattern (English and Japanese). */
const CONFLICTED_RE =
  /\(conflicted copy \d{4}-\d{2}-\d{2}\)|\(.+ のコンフリクトしたコピー \d{4}-\d{2}-\d{2}\)/;

export function isConflictedName(filename: string): boolean {
  return CONFLICTED_RE.test(filename);
}

/**
 * Strip only the last extension so "Foo.bold.ttf" → "Foo.bold".
 * Used to group format pairs.
 */
export function formatPairBasename(filename: string): string {
  const ext = extname(filename);
  if (!ext) return filename;
  return filename.slice(0, filename.length - ext.length);
}

/**
 * Detect Dropbox/macOS numbered-suffix folder pattern.
 * "Foo 2", "Foo 3", "Foo 10" → true (conflict copy of "Foo")
 * "Foo", "Foo Bold", "Foo 2 Bold" → false
 */
const NUMBERED_SUFFIX_RE = /\s\d+$/;
const COPY_MARKER_RE = /\(\d+\)|copy|Copy|\(conflicted copy/;

/** True if any path segment looks like a conflict-copy marker. */
export function hasConflictMarker(path: string): boolean {
  for (const seg of path.split("/")) {
    if (COPY_MARKER_RE.test(seg)) return true;
    if (NUMBERED_SUFFIX_RE.test(seg)) return true;
  }
  return false;
}

/**
 * From a group of duplicate (same-hash) entries, pick one as the keeper.
 * Tie-breaking:
 *   1. Shallowest path (fewest path segments)
 *   2. Path has no copy/conflicted markers (including " 2", " 3" folder suffixes)
 *   3. Lexicographic minimum
 */
export function selectKeeper(group: FileEntry[]): { keeper: FileEntry; candidates: FileEntry[] } {
  if (group.length === 0) throw new Error("selectKeeper: empty group");
  const sorted = [...group].sort((a, b) => {
    const depthA = a.path.split("/").length;
    const depthB = b.path.split("/").length;
    if (depthA !== depthB) return depthA - depthB;
    const cleanA = hasConflictMarker(a.path) ? 1 : 0;
    const cleanB = hasConflictMarker(b.path) ? 1 : 0;
    if (cleanA !== cleanB) return cleanA - cleanB;
    return a.path < b.path ? -1 : a.path > b.path ? 1 : 0;
  });
  const [keeper, ...candidates] = sorted as [FileEntry, ...FileEntry[]];
  return { keeper, candidates };
}

// ---------------------------------------------------------------------------
// Cloud placeholder detection
// ---------------------------------------------------------------------------

function isCloudPlaceholder(path: string): boolean {
  if (path.endsWith(".icloud")) return true;
  const r = spawnSync("/usr/bin/xattr", ["-p", "com.apple.fileprovider.fpfs#P", path]);
  if (r.status === 0 && r.stdout && r.stdout.length > 0) return true;
  return false;
}

// ---------------------------------------------------------------------------
// Argument parsing
// ---------------------------------------------------------------------------

type Args = {
  root: string;
  report: string;
  limit: number;
};

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

  if (values.help || !values.root) {
    printUsage();
    process.exit(values.help ? 0 : 1);
  }

  const root = resolve(values.root);
  if (!existsSync(root)) {
    console.error(`Error: root directory does not exist: ${root}`);
    process.exit(2);
  }

  const report = resolve(values.report ?? "./font-self-duplicates.tsv");
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

function printUsage(): void {
  console.error(`Usage:
  bun scripts/system/scan-self-duplicates.ts \\
    --root <dir>           Required: directory to scan
    [--report <path>]      Output TSV path (default: ./font-self-duplicates.tsv)
    [--limit N]            Debug: process only first N font files

This script is analysis-only (dry-run). No files are moved or deleted.
Report columns: relpath, kind, group_id, role, sha256, data_bytes, rsrc_bytes, anomaly_reason
`);
}

// ---------------------------------------------------------------------------
// Anomaly reason mapping from hashFile.suspectReason
// ---------------------------------------------------------------------------

function mapSuspectReasons(suspectReason: string): AnomalyKind[] {
  const reasons: AnomalyKind[] = [];
  if (suspectReason.includes("empty_both_forks")) {
    reasons.push("zero_byte_data");
  } else if (suspectReason.includes("size_mismatch")) {
    reasons.push("suspect_size_mismatch");
  }
  return reasons;
}

// ---------------------------------------------------------------------------
// Main scan logic
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  const args = parseArgsOrExit();
  const t0 = Date.now();

  console.error(`root:   ${args.root}`);
  console.error(`report: ${args.report}`);
  if (Number.isFinite(args.limit)) console.error(`limit:  ${args.limit}`);
  console.error("");

  // Phase 1: enumerate font files
  console.error("[1/3] Enumerating font files...");
  const allFiles: string[] = [];
  for await (const p of walk(args.root)) {
    if (isFontFile(p)) allFiles.push(p);
  }
  const cappedFiles = Number.isFinite(args.limit) ? allFiles.slice(0, args.limit) : allFiles;
  console.error(
    `  Found ${allFiles.length} font files${
      cappedFiles.length !== allFiles.length ? ` (capped to ${cappedFiles.length})` : ""
    }.`,
  );

  // Phase 2: pre-hash anomaly detection + hashing
  console.error("\n[2/3] Hashing files...");
  const prog = new Progress("hashing", cappedFiles.length);

  const entries: FileEntry[] = [];
  const anomalyMap = new Map<string, AnomalyEntry>(); // path → AnomalyEntry
  let skippedCount = 0;

  for (const path of cappedFiles) {
    const relPath = relative(args.root, path);
    const name = basename(path);

    // Pre-hash anomaly: cloud placeholder
    if (isCloudPlaceholder(path)) {
      const ae = anomalyMap.get(path) ?? {
        path,
        relPath,
        reasons: [] as AnomalyKind[],
        hash: "",
        dataSize: 0,
        rsrcSize: 0,
      };
      ae.reasons.push("cloud_placeholder");
      anomalyMap.set(path, ae);
      skippedCount++;
      prog.tick(0);
      continue;
    }

    // Try to hash
    let fh;
    try {
      fh = await hashFile(path);
    } catch (err) {
      const ae = anomalyMap.get(path) ?? {
        path,
        relPath,
        reasons: [] as AnomalyKind[],
        hash: "",
        dataSize: 0,
        rsrcSize: 0,
      };
      ae.reasons.push("hash_error");
      anomalyMap.set(path, ae);
      console.error(`\n  ! hash failed: ${path} (${(err as Error).message})`);
      prog.tick(0);
      continue;
    }

    const entry: FileEntry = {
      path,
      relPath,
      hash: fh.hash,
      dataSize: fh.dataSize,
      rsrcSize: fh.rsrcSize,
      suspect: fh.suspect,
      suspectReason: fh.suspectReason,
    };
    entries.push(entry);

    // Post-hash anomaly detection
    const ae = anomalyMap.get(path);
    const postReasons: AnomalyKind[] = [];

    // conflicted_name (hash computed, but also ANOMALY)
    if (isConflictedName(name)) {
      postReasons.push("conflicted_name");
    }
    // suspect from hashFile
    if (fh.suspect) {
      const mapped = mapSuspectReasons(fh.suspectReason);
      postReasons.push(...mapped);
    }

    if (postReasons.length > 0) {
      const existing = ae ?? {
        path,
        relPath,
        reasons: [] as AnomalyKind[],
        hash: fh.hash,
        dataSize: fh.dataSize,
        rsrcSize: fh.rsrcSize,
      };
      existing.reasons.push(...postReasons);
      existing.hash = fh.hash;
      existing.dataSize = fh.dataSize;
      existing.rsrcSize = fh.rsrcSize;
      anomalyMap.set(path, existing);
    }

    prog.tick(fh.dataSize + fh.rsrcSize);
  }
  prog.finish();

  // Phase 3: grouping
  console.error("\n[3/3] Grouping...");

  // A. DUP_GROUP: same hash, multiple files
  const hashToEntries = new Map<string, FileEntry[]>();
  for (const e of entries) {
    const arr = hashToEntries.get(e.hash) ?? [];
    arr.push(e);
    hashToEntries.set(e.hash, arr);
  }
  const dupGroups = new Map<string, { keeper: FileEntry; candidates: FileEntry[] }>();
  for (const [hash, group] of hashToEntries) {
    if (group.length >= 2) {
      dupGroups.set(hash, selectKeeper(group));
    }
  }

  // B. FORMAT_PAIR: same basename (no ext), different extensions, different hashes
  // Group by (basename, directory) — actually just basename across whole tree
  const basenameToEntries = new Map<string, FileEntry[]>();
  for (const e of entries) {
    const name = basename(e.path);
    const bname = formatPairBasename(name).toLowerCase(); // case-insensitive grouping
    const arr = basenameToEntries.get(bname) ?? [];
    arr.push(e);
    basenameToEntries.set(bname, arr);
  }
  // format pair: same basename, at least 2 different extensions, at least 2 different hashes
  const formatPairGroups = new Map<string, FileEntry[]>(); // basename → entries
  for (const [bname, group] of basenameToEntries) {
    const exts = new Set(group.map((e) => extname(e.path).toLowerCase()));
    const hashes = new Set(group.map((e) => e.hash));
    if (exts.size >= 2 && hashes.size >= 2) {
      formatPairGroups.set(bname, group);
    }
  }

  // Compute group_id for format pairs: sha256 of the lowercase basename, first 12 hex chars
  function formatPairGroupId(bname: string): string {
    const h = createHash("sha256").update(bname).digest("hex").slice(0, 12);
    return `fp-${h}`;
  }

  // Track which paths are in DUP_GROUP or FORMAT_PAIR or ANOMALY
  const pathInDupGroup = new Set<string>();
  for (const [, { keeper, candidates }] of dupGroups) {
    pathInDupGroup.add(keeper.path);
    for (const c of candidates) pathInDupGroup.add(c.path);
  }
  const pathInFormatPair = new Set<string>();
  for (const [, group] of formatPairGroups) {
    for (const e of group) pathInFormatPair.add(e.path);
  }
  const pathInAnomaly = new Set(anomalyMap.keys());

  // Build rows
  const rows: ReportRow[] = [];

  // DUP_GROUP rows
  for (const [hash, { keeper, candidates }] of dupGroups) {
    const group_id = hash.slice(0, 12);
    const allInGroup = [keeper, ...candidates];
    for (const e of allInGroup) {
      const role = e.path === keeper.path ? "keeper" : "candidate";
      rows.push({
        relpath: escapeTsv(e.relPath),
        kind: "DUP_GROUP",
        group_id,
        role,
        sha256: e.hash,
        data_bytes: String(e.dataSize),
        rsrc_bytes: String(e.rsrcSize),
        anomaly_reason: "",
      });
    }
  }

  // FORMAT_PAIR rows
  for (const [bname, group] of formatPairGroups) {
    const group_id = formatPairGroupId(bname);
    for (const e of group) {
      rows.push({
        relpath: escapeTsv(e.relPath),
        kind: "FORMAT_PAIR",
        group_id,
        role: "",
        sha256: e.hash,
        data_bytes: String(e.dataSize),
        rsrc_bytes: String(e.rsrcSize),
        anomaly_reason: "",
      });
    }
  }

  // ANOMALY rows
  let anomalySeq = 0;
  for (const [, ae] of anomalyMap) {
    anomalySeq++;
    const group_id = `an-${anomalySeq}`;
    rows.push({
      relpath: escapeTsv(ae.relPath),
      kind: "ANOMALY",
      group_id,
      role: "",
      sha256: ae.hash,
      data_bytes: ae.dataSize > 0 || ae.rsrcSize > 0 ? String(ae.dataSize) : "",
      rsrc_bytes: ae.dataSize > 0 || ae.rsrcSize > 0 ? String(ae.rsrcSize) : "",
      anomaly_reason: ae.reasons.join("|"),
    });
  }

  // SOLO rows: entries not in any other kind
  for (const e of entries) {
    if (
      !pathInDupGroup.has(e.path) &&
      !pathInFormatPair.has(e.path) &&
      !pathInAnomaly.has(e.path)
    ) {
      rows.push({
        relpath: escapeTsv(e.relPath),
        kind: "SOLO",
        group_id: "",
        role: "",
        sha256: e.hash,
        data_bytes: String(e.dataSize),
        rsrc_bytes: String(e.rsrcSize),
        anomaly_reason: "",
      });
    }
  }

  // Write report
  const header = "relpath\tkind\tgroup_id\trole\tsha256\tdata_bytes\trsrc_bytes\tanomaly_reason";
  const lines = [
    header,
    ...rows.map((r) =>
      [
        r.relpath,
        r.kind,
        r.group_id,
        r.role,
        r.sha256,
        r.data_bytes,
        r.rsrc_bytes,
        r.anomaly_reason,
      ].join("\t"),
    ),
  ];
  await writeFile(args.report, lines.join("\n") + "\n", "utf8");

  // Compute reclaimable bytes per dup group
  type DupGroupStats = { reclaimBytes: number; count: number; exampleRel: string };
  const dupStats: DupGroupStats[] = [];
  for (const [, { keeper, candidates }] of dupGroups) {
    let reclaimBytes = 0;
    for (const c of candidates) reclaimBytes += c.dataSize + c.rsrcSize;
    dupStats.push({
      reclaimBytes,
      count: 1 + candidates.length,
      exampleRel: keeper.relPath,
    });
  }
  dupStats.sort((a, b) => b.reclaimBytes - a.reclaimBytes);
  const totalReclaimBytes = dupStats.reduce((s, d) => s + d.reclaimBytes, 0);
  const totalDupFiles = dupStats.reduce((s, d) => s + d.count, 0);

  // Anomaly sub-counts
  const anomalyCounts: Record<string, number> = {};
  for (const [, ae] of anomalyMap) {
    for (const r of ae.reasons) {
      anomalyCounts[r] = (anomalyCounts[r] ?? 0) + 1;
    }
  }

  const soloCount = rows.filter((r) => r.kind === "SOLO").length;
  const elapsed = (Date.now() - t0) / 1000;

  // Console summary (stderr)
  process.stderr.write("\n=== scan-self-duplicates summary ===\n");
  process.stderr.write(`root: ${args.root}\n`);
  process.stderr.write(
    `total font files scanned: ${cappedFiles.length} (hashed: ${entries.length}, skipped: ${skippedCount + (anomalyMap.size - [...anomalyMap.values()].filter((a) => a.reasons.includes("hash_error")).length - [...anomalyMap.values()].filter((a) => a.reasons.includes("cloud_placeholder")).length)})\n`,
  );
  process.stderr.write(
    `duplicate groups: ${dupGroups.size} (total dup files: ${totalDupFiles}, reclaimable: ${totalReclaimBytes} bytes / ${fmtBytes(totalReclaimBytes)})\n`,
  );
  process.stderr.write(`format pairs: ${formatPairGroups.size}\n`);
  process.stderr.write(`anomalies: ${anomalyMap.size}\n`);
  for (const [kind, count] of Object.entries(anomalyCounts)) {
    process.stderr.write(`  - ${kind}: ${count}\n`);
  }
  process.stderr.write(`solo files: ${soloCount}\n`);

  if (dupStats.length > 0) {
    process.stderr.write("\ntop 10 reclaimable groups by size:\n");
    for (const [i, d] of dupStats.slice(0, 10).entries()) {
      process.stderr.write(
        `  ${i + 1}. ${fmtBytes(d.reclaimBytes).padEnd(12)} (${d.count} files)  ${d.exampleRel}\n`,
      );
    }
  }

  process.stderr.write(`\nreport written: ${args.report} (line count: ${lines.length})\n`);
  process.stderr.write(`elapsed: ${fmtDuration(elapsed)}\n`);
}

if (import.meta.main) {
  main().catch((err) => {
    console.error("Fatal:", err);
    process.exit(1);
  });
}
