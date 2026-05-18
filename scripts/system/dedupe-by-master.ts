#!/usr/bin/env bun
/**
 * dedupe-by-master.ts
 *
 * Walk one or more target directories and quarantine files that already
 * exist (by SHA256 of data fork + resource fork) under a master directory.
 *
 * Default mode is dry-run; --apply moves quarantined files into a backup
 * directory, preserving the original relative path. Master directory is
 * never modified.
 *
 * Dropbox safety:
 *   - Files where stat-reported size does not match bytes actually read
 *     are flagged as SUSPECT (possible unsynced placeholder).
 *   - Files with both forks empty (data + rsrc = 0 bytes) are flagged
 *     as SUSPECT — they coalesce to the SHA256-of-empty hash and are
 *     never considered a match for anything else.
 *   - --strict aborts before any move if any SUSPECT file is found in
 *     master or targets.
 */

import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { appendFile, mkdir, rename, writeFile } from "node:fs/promises";
import { basename, dirname, join, relative, resolve } from "node:path";
import { parseArgs } from "node:util";
import {
  escapeTsv,
  fmtBytes,
  hashFile,
  type Hashlist,
  type HashlistEntry,
  hashlistToMap,
  listFiles,
  Progress,
  pruneEmptyDirs,
  readHashlist,
  realpathAllowMissing,
  writeHashlist,
} from "./_font-hash.ts";

type Args = {
  master: string; // the master dir (master mode) OR the recorded source_root (hashlist mode)
  masterHashlist: string; // absolute path to .hashlist; empty when in master mode
  saveMasterHashlist: string; // absolute path to write a hashlist; empty when not requested
  targets: string[];
  backup: string;
  apply: boolean;
  strict: boolean;
  report: string;
  limit: number;
  keepEmptyDirs: boolean;
};

type Action = "MOVE" | "KEEP" | "ERROR" | "SUSPECT";

type PlanEntry = {
  action: Action;
  source: string;
  relPath: string;
  dataSize: number;
  rsrcSize: number;
  hash: string;
  masterExample: string;
  suspectReason: string;
  error?: string;
};

function parseArgsOrExit(): Args {
  const { values } = parseArgs({
    args: process.argv.slice(2),
    options: {
      master: { type: "string" },
      "master-hashlist": { type: "string" },
      "save-master-hashlist": { type: "string" },
      target: { type: "string", multiple: true },
      backup: { type: "string" },
      apply: { type: "boolean", default: false },
      strict: { type: "boolean", default: false },
      report: { type: "string" },
      limit: { type: "string" },
      "keep-empty-dirs": { type: "boolean", default: false },
      help: { type: "boolean", default: false },
    },
    allowPositionals: false,
  });

  const masterMode = !!values.master;
  const hashlistMode = !!values["master-hashlist"];

  if (values.help || (!masterMode && !hashlistMode) || !values.target || !values.backup) {
    console.error(`Usage:
  bun scripts/system/dedupe-by-master.ts \\
    --master <dir>                Master directory (kept intact, used as the source of truth)
    --master-hashlist <file>      Use a previously-saved hashlist instead of re-scanning master
                                  (mutually exclusive with --master)
    --target <dir>                Target directory to dedupe (repeatable)
    --backup <dir>                Quarantine directory (duplicates moved here)
    [--apply]                     Actually move files (default: dry-run)
    [--strict]                    Abort if any SUSPECT file is found
    [--report <path>]             Report TSV path (default: ./dedupe-report-<ts>.tsv)
    [--save-master-hashlist <f>]  After indexing, write a hashlist that --master-hashlist
                                  can later consume (only valid with --master)
    [--limit <N>]                 Process at most N files per directory (master and each target, for testing)
    [--keep-empty-dirs]           Skip post-apply cleanup of empty subdirectories under each target
                                  (default: prune empty subdirs and .DS_Store-only subdirs after --apply)

Safety:
  - Default is dry-run. Re-run with --apply to actually move files.
  - Files with size mismatches or fully empty forks are flagged SUSPECT
    and never participate in matching.
  - Move target preserves the original relative path beneath the target's
    basename, so the move is reversible by hand.
  - --master-hashlist trusts the artifact; the file paths recorded inside
    are display-only and do not need to exist on this machine.
`);
    process.exit(values.help ? 0 : 1);
  }

  if (masterMode && hashlistMode) {
    console.error("Use exactly one of --master or --master-hashlist, not both.");
    process.exit(1);
  }
  if (hashlistMode && values["save-master-hashlist"]) {
    console.error(
      "--save-master-hashlist requires --master (you cannot regenerate a hashlist from a hashlist).",
    );
    process.exit(1);
  }

  // Resolve symlinks before overlap checks so that two different argument
  // strings that point at the same physical directory (or one nested
  // inside the other) cannot bypass the safety guards. Without this,
  // `--master /a --target /b` where /b is a symlink to /a would let
  // --apply move files out of master.
  let master = "";
  let masterHashlist = "";
  if (masterMode) {
    const masterArg = resolve(values.master as string);
    if (!existsSync(masterArg)) {
      console.error(`Master directory does not exist: ${masterArg}`);
      process.exit(1);
    }
    master = realpathAllowMissing(masterArg);
  } else {
    masterHashlist = resolve(values["master-hashlist"] as string);
    if (!existsSync(masterHashlist)) {
      console.error(`Master hashlist file does not exist: ${masterHashlist}`);
      process.exit(1);
    }
    // master string is filled in at load time from the hashlist's source_root.
  }
  const saveMasterHashlist = values["save-master-hashlist"]
    ? resolve(values["save-master-hashlist"])
    : "";

  const targets = (values.target as string[]).map((raw) => {
    const t = resolve(raw);
    if (!existsSync(t)) {
      console.error(`Target directory does not exist: ${t}`);
      process.exit(1);
    }
    return realpathAllowMissing(t);
  });
  const backup = realpathAllowMissing(resolve(values.backup));

  // Overlap checks against `master`. In hashlist mode `master` is empty
  // here; the same checks are re-run after loading the hashlist (see
  // checkMasterOverlap) so an out-of-tree hashlist source_root cannot
  // create a hidden overlap with target/backup.
  if (master) {
    checkMasterOverlap(master, backup, targets);
  }
  for (const t of targets) {
    if (backup === t) {
      console.error(`Backup equals target: ${backup}`);
      process.exit(1);
    }
    if (backup.startsWith(t + "/") || t.startsWith(backup + "/")) {
      console.error(`Backup and target overlap: ${backup} vs ${t}`);
      process.exit(1);
    }
  }
  // Pairwise target overlap check. If `--target /a` and `--target /a/sub`
  // were both accepted, the recursive walk under /a would already include
  // /a/sub/*, and planTarget would schedule the same source file twice.
  // The first plan moves it; the second fails at apply time because the
  // source path no longer exists.
  for (let i = 0; i < targets.length; i++) {
    for (let j = i + 1; j < targets.length; j++) {
      const a = targets[i] ?? "";
      const b = targets[j] ?? "";
      if (a === b) {
        console.error(`Duplicate target: ${a}`);
        process.exit(1);
      }
      if (a.startsWith(b + "/") || b.startsWith(a + "/")) {
        console.error(`Targets overlap: ${a} vs ${b}`);
        process.exit(1);
      }
    }
  }

  const ts = new Date().toISOString().replace(/[-:T]/g, "").slice(0, 14);
  const report = resolve(values.report ?? `./dedupe-report-${ts}.tsv`);
  let limit = Number.POSITIVE_INFINITY;
  if (values.limit !== undefined) {
    limit = Number.parseInt(values.limit, 10);
    if (!Number.isFinite(limit) || limit <= 0) {
      console.error(`Invalid --limit value: "${values.limit}" (must be a positive integer).`);
      process.exit(1);
    }
  }

  return {
    master,
    masterHashlist,
    saveMasterHashlist,
    targets,
    backup,
    apply: values.apply ?? false,
    strict: values.strict ?? false,
    report,
    limit,
    keepEmptyDirs: values["keep-empty-dirs"] ?? false,
  };
}

// Pulled out of parseArgsOrExit so it can be re-applied after loading a
// hashlist (the source_root only becomes known then, and overlap with
// targets/backup must still be checked).
function checkMasterOverlap(master: string, backup: string, targets: string[]): void {
  if (backup === master) {
    console.error(`Backup equals master: ${backup}`);
    process.exit(1);
  }
  if (backup.startsWith(master + "/") || master.startsWith(backup + "/")) {
    console.error(`Backup and master overlap: ${backup} vs ${master}`);
    process.exit(1);
  }
  for (const t of targets) {
    if (t === master) {
      console.error(`Target equals master: ${t}`);
      process.exit(1);
    }
    if (master.startsWith(t + "/") || t.startsWith(master + "/")) {
      console.error(`Master and target overlap: ${master} vs ${t}`);
      process.exit(1);
    }
  }
}

type MasterIndex = {
  hashToPath: Map<string, string>;
  entries: HashlistEntry[]; // one per non-suspect file (for hashlist serialization)
  totalFiles: number;
  indexedFiles: number;
  bytes: number;
  suspects: { path: string; reason: string }[];
};

async function indexMaster(master: string, limit: number): Promise<MasterIndex> {
  console.error(`[1/3] Indexing master: ${master}`);
  const files = await listFiles(master);
  const capped = Number.isFinite(limit) ? files.slice(0, limit) : files;
  console.error(
    `  Discovered ${files.length} files${
      capped.length !== files.length ? ` (processing first ${capped.length})` : ""
    }. Hashing...`,
  );
  const hashToPath = new Map<string, string>();
  const entries: HashlistEntry[] = [];
  const suspects: { path: string; reason: string }[] = [];
  const prog = new Progress("master", capped.length);
  let bytes = 0;
  let indexed = 0;
  for (const f of capped) {
    try {
      const r = await hashFile(f);
      bytes += r.dataSize + r.rsrcSize;
      if (r.suspect) {
        suspects.push({ path: f, reason: r.suspectReason });
      } else {
        if (!hashToPath.has(r.hash)) {
          hashToPath.set(r.hash, f);
        }
        entries.push({
          relPath: relative(master, f),
          hash: r.hash,
          dataSize: r.dataSize,
          rsrcSize: r.rsrcSize,
        });
        indexed++; // counts every non-suspect file, including duplicate hashes
      }
      prog.tick(r.dataSize + r.rsrcSize);
    } catch (err) {
      suspects.push({ path: f, reason: `hash_error:${(err as Error).message}` });
      console.error(`\n  ! hash failed: ${f} (${(err as Error).message})`);
    }
  }
  prog.finish();
  console.error(
    `  Master: ${capped.length} files, ${hashToPath.size} unique hashes indexed, ${fmtBytes(bytes)}`,
  );
  if (suspects.length > 0) {
    console.error(
      `  WARN: ${suspects.length} master files SUSPECT (excluded from index). First 5:`,
    );
    for (const s of suspects.slice(0, 5)) {
      console.error(`    - ${s.path}  [${s.reason}]`);
    }
  }
  return {
    hashToPath,
    entries,
    totalFiles: capped.length,
    indexedFiles: indexed,
    bytes,
    suspects,
  };
}

// Build a MasterIndex from a previously-written hashlist artifact. Suspect
// files were already filtered at the time the hashlist was generated, so
// this loader yields suspects=[]; any --strict gate based on master
// suspects is therefore a no-op in hashlist mode (the operator already
// saw the suspects when they produced the artifact). The "source_root"
// recorded in the hashlist is returned so the caller can use it for
// display and overlap checks.
async function loadMasterFromHashlist(
  hashlistPath: string,
): Promise<{ index: MasterIndex; sourceRoot: string; generated: string }> {
  console.error(`[1/3] Loading master hashlist: ${hashlistPath}`);
  const hl = await readHashlist(hashlistPath);
  const hashToPath = hashlistToMap(hl);
  let bytes = 0;
  for (const e of hl.entries) bytes += e.dataSize + e.rsrcSize;
  console.error(
    `  Loaded ${hl.entries.length} entries, ${hashToPath.size} unique hashes, ${fmtBytes(bytes)}`,
  );
  console.error(`  source_root: ${hl.sourceRoot}`);
  console.error(`  generated:   ${hl.generated}`);
  return {
    index: {
      hashToPath,
      entries: hl.entries,
      totalFiles: hl.entries.length,
      indexedFiles: hl.entries.length,
      bytes,
      suspects: [],
    },
    sourceRoot: hl.sourceRoot,
    generated: hl.generated,
  };
}

async function planTarget(
  target: string,
  masterIndex: Map<string, string>,
  limit: number,
): Promise<PlanEntry[]> {
  console.error(`\n[2/3] Scanning target: ${target}`);
  const files = await listFiles(target);
  const capped = Number.isFinite(limit) ? files.slice(0, limit) : files;
  console.error(
    `  Discovered ${files.length} files${
      capped.length !== files.length ? ` (processing first ${capped.length})` : ""
    }. Hashing...`,
  );
  const plan: PlanEntry[] = [];
  const prog = new Progress(`target ${basename(target)}`, capped.length);
  for (const f of capped) {
    const rel = relative(target, f);
    try {
      const r = await hashFile(f);
      let action: Action;
      let masterExample = "";
      if (r.suspect) {
        action = "SUSPECT";
      } else {
        masterExample = masterIndex.get(r.hash) ?? "";
        action = masterExample ? "MOVE" : "KEEP";
      }
      plan.push({
        action,
        source: f,
        relPath: rel,
        dataSize: r.dataSize,
        rsrcSize: r.rsrcSize,
        hash: r.hash,
        masterExample,
        suspectReason: r.suspectReason,
      });
      prog.tick(r.dataSize + r.rsrcSize);
    } catch (err) {
      plan.push({
        action: "ERROR",
        source: f,
        relPath: rel,
        dataSize: 0,
        rsrcSize: 0,
        hash: "",
        masterExample: "",
        suspectReason: "",
        error: (err as Error).message,
      });
      prog.tick(0);
    }
  }
  prog.finish();
  return plan;
}

function summarize(
  label: string,
  plan: PlanEntry[],
): { move: number; keep: number; suspect: number; err: number; moveBytes: number } {
  let move = 0;
  let keep = 0;
  let suspect = 0;
  let err = 0;
  let moveBytes = 0;
  for (const p of plan) {
    if (p.action === "MOVE") {
      move++;
      moveBytes += p.dataSize + p.rsrcSize;
    } else if (p.action === "KEEP") keep++;
    else if (p.action === "SUSPECT") suspect++;
    else err++;
  }
  console.error(
    `  ${label}: MOVE=${move} (${fmtBytes(moveBytes)})  KEEP=${keep}  SUSPECT=${suspect}  ERROR=${err}`,
  );
  return { move, keep, suspect, err, moveBytes };
}

async function writeReport(
  reportPath: string,
  master: string,
  masterSuspects: { path: string; reason: string }[],
  targets: { dir: string; plan: PlanEntry[] }[],
  backup: string,
  apply: boolean,
): Promise<void> {
  const lines: string[] = [];
  lines.push(`# dedupe-by-master report`);
  lines.push(`# generated: ${new Date().toISOString()}`);
  lines.push(`# master: ${master}`);
  lines.push(`# backup: ${backup}`);
  lines.push(`# mode: ${apply ? "APPLY" : "DRY-RUN"}`);
  lines.push(
    `# columns: action\ttarget_root\trel_path\tdata_bytes\trsrc_bytes\tsha256\tmaster_example_or_suspect_reason\terror`,
  );
  // Master suspect rows so the user can audit them. Paths are escaped
  // because macOS filenames may legally contain tab/newline bytes, and
  // mojibake names can contain anything the source system permitted.
  for (const s of masterSuspects) {
    lines.push(
      [
        "MASTER_SUSPECT",
        escapeTsv(master),
        escapeTsv(relative(master, s.path)),
        "",
        "",
        "",
        escapeTsv(s.reason),
        "",
      ].join("\t"),
    );
  }
  for (const { dir, plan } of targets) {
    for (const p of plan) {
      lines.push(
        [
          p.action,
          escapeTsv(dir),
          escapeTsv(p.relPath),
          String(p.dataSize),
          String(p.rsrcSize),
          p.hash,
          escapeTsv(p.action === "SUSPECT" ? p.suspectReason : p.masterExample),
          escapeTsv(p.error ?? ""),
        ].join("\t"),
      );
    }
  }
  await writeFile(reportPath, lines.join("\n") + "\n", "utf8");
}

// Move with EXDEV fallback. rename(2) is atomic on the same filesystem,
// but fails with EXDEV across mount points. /bin/mv falls back to
// copyfile + unlink which preserves resource forks and xattrs on macOS,
// so duplicate fonts are quarantined intact even when --backup lives
// on an external drive.
//
// Note on `--`: macOS /bin/mv does not document `--` in its usage line,
// but its getopt(3) does honor it as the end-of-options marker
// (verified empirically: `/bin/mv -- src dst` exits 0 and moves the
// file). Since callers pass resolve()'d absolute paths that always
// start with `/`, `--` is strictly defensive — but it costs nothing
// and protects against future refactors that might pass relative paths.
async function moveWithFallback(src: string, dest: string): Promise<void> {
  try {
    await rename(src, dest);
    return;
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== "EXDEV") throw err;
  }
  const r = spawnSync("/bin/mv", ["--", src, dest]);
  if (r.error) throw r.error;
  if (r.status !== 0) {
    const msg = r.stderr?.toString().trim() || `/bin/mv exited with status ${r.status}`;
    throw new Error(`EXDEV fallback failed: ${msg}`);
  }
}

async function executeMoves(
  target: string,
  plan: PlanEntry[],
  backup: string,
  moveLogPath: string,
): Promise<{ moved: number; failed: number; collisions: number }> {
  const subDir = join(backup, basename(target));
  let moved = 0;
  let failed = 0;
  let collisions = 0;
  for (const p of plan) {
    if (p.action !== "MOVE") continue;
    const dest = join(subDir, p.relPath);
    let actualDest = dest;
    try {
      await mkdir(dirname(dest), { recursive: true });
      if (existsSync(dest)) {
        // Disambiguate against an already-quarantined file of the same name.
        // Loop until an unused name is found so that two collisions in the
        // same millisecond, or a prior run's leftover `.dup-<ts>` file, do
        // not silently overwrite each other via POSIX rename.
        const stamp = Date.now();
        let suffix = 0;
        // The first candidate uses just the timestamp; subsequent ones
        // append a counter. Bounded by an absurd ceiling so a buggy
        // filesystem cannot trap us in an infinite loop.
        while (true) {
          actualDest = suffix === 0 ? `${dest}.dup-${stamp}` : `${dest}.dup-${stamp}-${suffix}`;
          if (!existsSync(actualDest)) break;
          suffix++;
          if (suffix > 10000) {
            throw new Error(`too many quarantine collisions for ${dest}`);
          }
        }
        console.error(
          `  ! collision: ${p.source} → ${actualDest} (intended ${dest} already existed)`,
        );
        collisions++;
        await moveWithFallback(p.source, actualDest);
      } else {
        await moveWithFallback(p.source, dest);
      }
      moved++;
      await appendFile(
        moveLogPath,
        `MOVED\t${escapeTsv(p.source)}\t${escapeTsv(actualDest)}\t${
          actualDest === dest ? "" : "collision"
        }\n`,
      );
    } catch (err) {
      console.error(`  ! move failed: ${p.source} → ${actualDest} (${(err as Error).message})`);
      failed++;
      await appendFile(
        moveLogPath,
        `FAILED\t${escapeTsv(p.source)}\t${escapeTsv(actualDest)}\t${escapeTsv((err as Error).message)}\n`,
      );
    }
  }
  return { moved, failed, collisions };
}

async function main() {
  const args = parseArgsOrExit();

  console.error(`Mode: ${args.apply ? "APPLY (will move files)" : "DRY-RUN (no files moved)"}`);
  if (args.masterHashlist) {
    console.error(`Master hashlist: ${args.masterHashlist}`);
  } else {
    console.error(`Master:  ${args.master}`);
  }
  for (const t of args.targets) console.error(`Target:  ${t}`);
  console.error(`Backup:  ${args.backup}`);
  console.error(`Report:  ${args.report}`);
  console.error(
    `Strict:  ${args.strict ? "yes (abort on SUSPECT)" : "no (continue with warnings)"}`,
  );
  if (args.saveMasterHashlist) {
    console.error(`Save hashlist: ${args.saveMasterHashlist}`);
  }
  console.error("");

  const t0 = Date.now();
  let masterIdx: MasterIndex;
  if (args.masterHashlist) {
    const loaded = await loadMasterFromHashlist(args.masterHashlist);
    masterIdx = loaded.index;
    args.master = loaded.sourceRoot;
    // Re-run overlap checks now that we know source_root.
    checkMasterOverlap(args.master, args.backup, args.targets);
  } else {
    masterIdx = await indexMaster(args.master, args.limit);
    if (args.saveMasterHashlist) {
      const hl: Hashlist = {
        sourceRoot: args.master,
        generated: new Date().toISOString(),
        entries: masterIdx.entries,
      };
      await writeHashlist(args.saveMasterHashlist, hl);
      console.error(
        `  Saved hashlist: ${args.saveMasterHashlist} (${masterIdx.entries.length} entries)`,
      );
    }
  }

  if (args.strict && masterIdx.suspects.length > 0) {
    console.error(
      `\n--strict: aborting because master has ${masterIdx.suspects.length} SUSPECT files.`,
    );
    process.exit(2);
  }

  const targetResults: { dir: string; plan: PlanEntry[] }[] = [];
  const totals = { move: 0, keep: 0, suspect: 0, err: 0, moveBytes: 0 };
  for (const t of args.targets) {
    const plan = await planTarget(t, masterIdx.hashToPath, args.limit);
    const s = summarize(basename(t), plan);
    totals.move += s.move;
    totals.keep += s.keep;
    totals.suspect += s.suspect;
    totals.err += s.err;
    totals.moveBytes += s.moveBytes;
    targetResults.push({ dir: t, plan });
  }

  console.error("");
  console.error("[3/3] Summary across all targets:");
  console.error(`  Files to MOVE:   ${totals.move} (${fmtBytes(totals.moveBytes)})`);
  console.error(`  Files to KEEP:   ${totals.keep}`);
  console.error(`  Files SUSPECT:   ${totals.suspect}`);
  console.error(`  Errors:          ${totals.err}`);
  console.error(`  Elapsed:         ${((Date.now() - t0) / 1000).toFixed(1)}s`);

  await writeReport(
    args.report,
    args.master,
    masterIdx.suspects,
    targetResults,
    args.backup,
    args.apply,
  );
  console.error(`\nReport written: ${args.report}`);

  if (args.strict && totals.suspect > 0) {
    console.error(
      `\n--strict: aborting before move because targets contain ${totals.suspect} SUSPECT files.`,
    );
    process.exit(2);
  }

  if (!args.apply) {
    console.error("\nDry-run complete. Re-run with --apply to move files.");
    return;
  }

  const moveLogPath = args.report.replace(/\.tsv$/, "") + ".moves.tsv";
  await writeFile(moveLogPath, "status\tsource\tdestination\tnote\n", "utf8");
  console.error(`\nApplying moves... (per-file move log: ${moveLogPath})`);
  // Aggregate per-target failures so callers chaining `&& rm -rf source`
  // cannot mistake a partially-failed apply for a clean success.
  let totalFailed = 0;
  for (const { dir, plan } of targetResults) {
    const { moved, failed, collisions } = await executeMoves(dir, plan, args.backup, moveLogPath);
    totalFailed += failed;
    console.error(`  ${basename(dir)}: moved=${moved} failed=${failed} collisions=${collisions}`);
  }

  if (!args.keepEmptyDirs) {
    console.error("\nPruning empty subdirectories under each target...");
    for (const { dir } of targetResults) {
      const { removedDirs, removedJunk, errors } = await pruneEmptyDirs(dir);
      console.error(
        `  ${basename(dir)}: removed_dirs=${removedDirs.length} removed_junk=${removedJunk.length} errors=${errors.length}`,
      );
      if (errors.length > 0) {
        for (const e of errors.slice(0, 5)) {
          console.error(`    ! ${e.path}: ${e.reason}`);
        }
        if (errors.length > 5) {
          console.error(`    ... and ${errors.length - 5} more (see stderr above)`);
        }
      }
    }
  }

  console.error("\nDone. Verify backup directory before deleting.");
  if (totalFailed > 0) {
    console.error(`\n${totalFailed} file(s) failed to move. See ${moveLogPath} for details.`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
