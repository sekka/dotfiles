// Shared utilities for font deduplication tools (dedupe-by-master,
// verify-by-hash).
//
// Exposes:
//   - SKIP_NAMES, walk, listFiles (filesystem traversal, ignores macOS noise)
//   - FileHash, hashFile, streamHash (SHA256 of data fork + resource fork,
//     length-prefixed header so "A in data, B in rsrc" cannot collide with
//     "A<delim>B all in data fork")
//   - Progress (visual bar + throughput + ETA, written to stderr)
//   - fmtBytes, fmtDuration (formatters)
//   - realpathAllowMissing (resolve symlinks even for paths that may not
//     exist yet; safety guard against symlink-bypass of overlap checks)

import { createHash } from "node:crypto";
import { createReadStream, existsSync, realpathSync, statSync } from "node:fs";
import { readdir, readFile, rmdir, unlink, writeFile } from "node:fs/promises";
import { basename, dirname, join } from "node:path";

export const SKIP_NAMES = new Set([".DS_Store", "Icon\r"]);

export type FileHash = {
  hash: string;
  dataSize: number; // bytes actually read from data fork
  rsrcSize: number; // bytes actually read from resource fork
  expectedData: number; // stat-reported data fork size
  expectedRsrc: number; // stat-reported resource fork size (0 if no rsrc)
  suspect: boolean; // size mismatch OR both forks empty
  suspectReason: string;
};

export async function* walk(root: string): AsyncGenerator<string> {
  // Traversal errors must propagate — never swallow. verify-by-hash uses
  // this to enumerate a quarantine before declaring it safe to delete; a
  // silently skipped unreadable subdirectory would let the operator
  // delete files that were never verified to have a match in master.
  // The error is annotated with the failing path so the operator can
  // diagnose (typical cause: permission denied on a subdirectory).
  let entries;
  try {
    entries = await readdir(root, { withFileTypes: true });
  } catch (err) {
    throw new Error(`readdir failed: ${root} (${(err as Error).message})`);
  }
  for (const e of entries) {
    const name = e.name;
    if (SKIP_NAMES.has(name)) continue;
    if (name.startsWith("._")) continue; // AppleDouble sidecar
    const p = join(root, name);
    if (e.isDirectory()) {
      yield* walk(p);
    } else if (e.isFile()) {
      yield p;
    }
  }
}

export async function listFiles(root: string): Promise<string[]> {
  const out: string[] = [];
  for await (const p of walk(root)) out.push(p);
  return out;
}

export type PruneResult = {
  removedDirs: string[];
  removedJunk: string[];
  errors: { path: string; reason: string }[];
};

// Bottom-up removal of empty subdirectories under `root`. A directory is
// considered empty when it contains nothing, or only macOS metadata
// (.DS_Store, AppleDouble ._* sidecars). The metadata files are removed
// as part of the prune. `root` itself is never removed. Symlinks are not
// followed. readdir failures and rmdir/unlink failures are collected
// into `errors` rather than thrown, so a single problem dir does not
// abort cleanup of its siblings.
export async function pruneEmptyDirs(root: string): Promise<PruneResult> {
  const removedDirs: string[] = [];
  const removedJunk: string[] = [];
  const errors: { path: string; reason: string }[] = [];

  async function visit(dir: string, isRoot: boolean): Promise<void> {
    let entries;
    try {
      entries = await readdir(dir, { withFileTypes: true });
    } catch (err) {
      errors.push({ path: dir, reason: `readdir: ${(err as Error).message}` });
      return;
    }
    for (const e of entries) {
      if (e.isSymbolicLink()) continue;
      if (e.isDirectory()) {
        await visit(join(dir, e.name), false);
      }
    }
    if (isRoot) return;

    let post;
    try {
      post = await readdir(dir, { withFileTypes: true });
    } catch (err) {
      errors.push({ path: dir, reason: `readdir: ${(err as Error).message}` });
      return;
    }
    const junkOnly = post.every(
      (e) => e.isFile() && (SKIP_NAMES.has(e.name) || e.name.startsWith("._")),
    );
    if (!junkOnly) return;

    for (const e of post) {
      const p = join(dir, e.name);
      try {
        await unlink(p);
        removedJunk.push(p);
      } catch (err) {
        errors.push({ path: p, reason: `unlink: ${(err as Error).message}` });
        return;
      }
    }
    try {
      await rmdir(dir);
      removedDirs.push(dir);
    } catch (err) {
      errors.push({ path: dir, reason: `rmdir: ${(err as Error).message}` });
    }
  }

  await visit(root, true);
  return { removedDirs, removedJunk, errors };
}

export async function streamHash(path: string, h: ReturnType<typeof createHash>): Promise<number> {
  return await new Promise<number>((res, rej) => {
    let n = 0;
    const s = createReadStream(path);
    s.on("data", (c) => {
      h.update(c as Buffer);
      n += (c as Buffer).length;
    });
    s.on("end", () => res(n));
    s.on("error", rej);
  });
}

export async function hashFile(path: string): Promise<FileHash> {
  const h = createHash("sha256");

  // Probe both forks first to learn the lengths, then feed an unambiguous
  // length-prefixed header so that "A in data fork, B in resource fork"
  // cannot collide with "A<delimiter>B all in the data fork".
  const dataStat = statSync(path);
  const expectedData = dataStat.size;
  let expectedRsrc = 0;
  const rsrcPath = `${path}/..namedfork/rsrc`;
  let rsrcExists = false;
  try {
    const st = statSync(rsrcPath);
    expectedRsrc = st.size;
    rsrcExists = st.size > 0;
  } catch {
    // no resource fork
  }

  // Header: magic + dataLen + rsrcLen, little-endian 64-bit unsigned each
  const header = Buffer.alloc(8 + 16);
  header.write("FORK_V1\0", 0, 8, "binary");
  header.writeBigUInt64LE(BigInt(expectedData), 8);
  header.writeBigUInt64LE(BigInt(expectedRsrc), 16);
  h.update(header);

  const dataSize = await streamHash(path, h);
  let rsrcSize = 0;
  if (rsrcExists) {
    rsrcSize = await streamHash(rsrcPath, h);
  }

  let suspect = false;
  const reasons: string[] = [];
  if (dataSize !== expectedData) {
    suspect = true;
    reasons.push(`data_size_mismatch:stat=${expectedData},read=${dataSize}`);
  }
  if (rsrcSize !== expectedRsrc) {
    suspect = true;
    reasons.push(`rsrc_size_mismatch:stat=${expectedRsrc},read=${rsrcSize}`);
  }
  if (dataSize === 0 && rsrcSize === 0) {
    suspect = true;
    reasons.push("empty_both_forks");
  }

  return {
    hash: h.digest("hex"),
    dataSize,
    rsrcSize,
    expectedData,
    expectedRsrc,
    suspect,
    suspectReason: reasons.join("|"),
  };
}

// Escape a string for inclusion in a TSV column. macOS filenames may
// contain any byte except NUL and '/', so a literal tab, newline, or
// carriage return inside a font name would silently corrupt the
// report. Backslash itself is also escaped so the encoding is
// reversible by a downstream parser. Mojibake (filenames whose bytes
// happen to display as garbled glyphs) passes through unchanged
// because the bytes themselves are valid in a TSV cell.
export function escapeTsv(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/\t/g, "\\t").replace(/\n/g, "\\n").replace(/\r/g, "\\r");
}

// Inverse of escapeTsv. Walks the string left-to-right so a literal
// '\\\\' decodes to '\\' and does not interfere with adjacent escapes.
// Unknown escape sequences pass through verbatim (defensive: a future
// version of escapeTsv may introduce new escapes that older readers
// should ignore rather than corrupt).
export function unescapeTsv(s: string): string {
  let out = "";
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (c !== "\\" || i + 1 >= s.length) {
      out += c;
      continue;
    }
    const next = s[i + 1];
    i++;
    if (next === "t") out += "\t";
    else if (next === "n") out += "\n";
    else if (next === "r") out += "\r";
    else if (next === "\\") out += "\\";
    else out += "\\" + next;
  }
  return out;
}

// Master hashlist format — a portable artifact of an indexed master
// directory. Written by --save-master-hashlist, read by
// --master-hashlist. Lets the user index a 16 GB master once (~25s)
// and reuse the hashes across many dedupe/verify runs without
// re-scanning. Survives transport between machines because rel_path
// is relative to source_root.
//
// Format (TSV with `#`-prefixed header lines):
//   # font-hashlist v1
//   # generated: 2026-05-18T10:30:00Z
//   # source_root: <escaped path>
//   # count: 7438
//   # columns: rel_path, sha256, data_bytes, rsrc_bytes
//   <escaped rel_path>\t<hex sha256>\t<data bytes>\t<rsrc bytes>
//   ...

export type HashlistEntry = {
  relPath: string;
  hash: string;
  dataSize: number;
  rsrcSize: number;
};

export type Hashlist = {
  sourceRoot: string;
  generated: string;
  entries: HashlistEntry[];
};

const HASHLIST_VERSION = "v1";
const HASHLIST_MAGIC = `# font-hashlist ${HASHLIST_VERSION}`;

export async function writeHashlist(path: string, hl: Hashlist): Promise<void> {
  const lines: string[] = [
    HASHLIST_MAGIC,
    `# generated: ${hl.generated}`,
    `# source_root: ${escapeTsv(hl.sourceRoot)}`,
    `# count: ${hl.entries.length}`,
    // Columns header uses a non-tab separator on purpose: the read-side
    // parser distinguishes comments from entry rows by the presence of a
    // tab, so no comment line may contain a literal tab.
    `# columns: rel_path, sha256, data_bytes, rsrc_bytes`,
  ];
  for (const e of hl.entries) {
    lines.push([escapeTsv(e.relPath), e.hash, String(e.dataSize), String(e.rsrcSize)].join("\t"));
  }
  await writeFile(path, lines.join("\n") + "\n", "utf8");
}

export async function readHashlist(path: string): Promise<Hashlist> {
  const raw = await readFile(path, "utf8");
  const lines = raw.split("\n");
  if (lines[0] !== HASHLIST_MAGIC) {
    throw new Error(
      `${path}: not a font-hashlist file (expected first line "${HASHLIST_MAGIC}", got "${lines[0] ?? ""}")`,
    );
  }
  let sourceRoot = "";
  let generated = "";
  const entries: HashlistEntry[] = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i] ?? "";
    if (line === "") continue;
    // Comment/header lines never contain a tab. Entry rows always have
    // exactly 3 tabs (4 columns). Without the tab check, a filename
    // beginning with '#' (e.g. "#hashname.ttf") would be silently dropped.
    if (line.startsWith("#") && !line.includes("\t")) {
      const meta = /^# (\w+):\s*(.*)$/.exec(line);
      if (meta && meta[1] && meta[2] !== undefined) {
        if (meta[1] === "source_root") sourceRoot = unescapeTsv(meta[2]);
        else if (meta[1] === "generated") generated = meta[2];
        // count and columns are descriptive only; not needed at read time
      }
      continue;
    }
    const parts = line.split("\t");
    if (parts.length !== 4) {
      throw new Error(
        `${path}:${i + 1}: malformed entry (expected 4 columns, got ${parts.length})`,
      );
    }
    // Reject any non-digit content before parseInt can silently truncate
    // it — parseInt("10abc") returns 10 and parseInt("1.5") returns 1,
    // so a digits-only regex must run first. File sizes are always
    // non-negative integers, so /^\d+$/ is the right gate.
    const data = parts[2] ?? "";
    const rsrc = parts[3] ?? "";
    if (!/^\d+$/.test(data) || !/^\d+$/.test(rsrc)) {
      throw new Error(`${path}:${i + 1}: malformed sizes (data="${data}", rsrc="${rsrc}")`);
    }
    const dataSize = Number.parseInt(data, 10);
    const rsrcSize = Number.parseInt(rsrc, 10);
    // Sizes beyond 2^53-1 cannot be represented exactly as JS numbers;
    // a hashlist that records such a value is corrupt by construction
    // (no font fork is ~9 PB) and would silently lose precision.
    if (!Number.isSafeInteger(dataSize) || !Number.isSafeInteger(rsrcSize)) {
      throw new Error(
        `${path}:${i + 1}: size out of safe integer range (data="${data}", rsrc="${rsrc}")`,
      );
    }
    // SHA-256 hex is exactly 64 lowercase or uppercase hex digits. Accepting
    // anything else would silently fall through to "no match" in the map
    // lookup — safe but confusing; reject early with a clear error.
    const hash = parts[1] ?? "";
    if (!/^[0-9a-fA-F]{64}$/.test(hash)) {
      throw new Error(`${path}:${i + 1}: malformed hash (expected 64 hex chars, got "${hash}")`);
    }
    entries.push({
      relPath: unescapeTsv(parts[0] ?? ""),
      hash,
      dataSize,
      rsrcSize,
    });
  }
  return { sourceRoot, generated, entries };
}

// Build the in-memory hash → example-path map used by dedupe/verify.
// The "example path" is informational: it tells the user which master
// file a duplicate matches, and is reconstructed from source_root +
// rel_path. If source_root has moved or no longer exists, the verdict
// (hash present in master) is still correct — only the displayed
// example path becomes a dead pointer.
export function hashlistToMap(hl: Hashlist): Map<string, string> {
  const m = new Map<string, string>();
  for (const e of hl.entries) {
    if (!m.has(e.hash)) {
      m.set(e.hash, join(hl.sourceRoot, e.relPath));
    }
  }
  return m;
}

export function fmtBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  if (n < 1024 * 1024 * 1024) return `${(n / 1024 / 1024).toFixed(1)} MB`;
  return `${(n / 1024 / 1024 / 1024).toFixed(2)} GB`;
}

export function fmtDuration(sec: number): string {
  if (!Number.isFinite(sec) || sec < 0) return "--:--";
  const total = Math.round(sec);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export class Progress {
  private last = 0;
  private count = 0;
  private bytes = 0;
  private readonly start = Date.now();
  private static readonly BAR_WIDTH = 24;
  constructor(
    private readonly label: string,
    private readonly total: number,
  ) {}
  tick(bytes: number) {
    this.count++;
    this.bytes += bytes;
    const now = Date.now();
    if (now - this.last > 200 || this.count === this.total) {
      this.last = now;
      this.render(now);
    }
  }
  private render(now: number) {
    const ratio = this.total > 0 ? Math.min(this.count / this.total, 1) : 0;
    const pct = (ratio * 100).toFixed(1).padStart(5);
    const filled = Math.round(ratio * Progress.BAR_WIDTH);
    const bar = "█".repeat(filled) + "░".repeat(Progress.BAR_WIDTH - filled);
    const elapsedSec = (now - this.start) / 1000;
    const throughput = elapsedSec > 0 ? this.bytes / elapsedSec : 0;
    const eta = ratio > 0 && ratio < 1 ? fmtDuration(elapsedSec / ratio - elapsedSec) : "--:--";
    // Pad-right to clear stale chars from earlier longer lines on the same row.
    const line =
      `  ${this.label} ${bar} ${pct}%  ${this.count}/${this.total}  ` +
      `${fmtBytes(this.bytes)} @ ${fmtBytes(throughput)}/s  ETA ${eta}`;
    process.stderr.write(`\r${line.padEnd(120)}`);
  }
  finish() {
    if (this.count > 0) this.render(Date.now());
    process.stderr.write("\n");
  }
}

// Resolve a path that may not exist yet (e.g. --backup, which gets
// created lazily by the consumer). Walks up to the deepest existing
// ancestor, realpaths that, and re-attaches the missing tail — so a
// symlink anywhere in the existing prefix cannot bypass overlap checks.
//
// Fallback semantics: if no ancestor exists (`parent === cur` is reached
// without finding an existing directory), the input `p` is returned
// verbatim. On POSIX this branch is effectively unreachable because the
// walk always terminates at `/` or `.`, both of which exist — but it is
// kept as a defensive guard so the function is total over arbitrary
// input rather than throwing from realpathSync.
export function realpathAllowMissing(p: string): string {
  if (existsSync(p)) return realpathSync(p);
  const segments: string[] = [];
  let cur = p;
  while (!existsSync(cur)) {
    const parent = dirname(cur);
    if (parent === cur) return p; // defensive: no ancestor exists (unreachable on POSIX)
    segments.unshift(basename(cur));
    cur = parent;
  }
  return join(realpathSync(cur), ...segments);
}
