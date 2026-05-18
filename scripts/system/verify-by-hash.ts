#!/usr/bin/env bun
/**
 * verify-by-hash.ts
 *
 * Independent second-opinion tool. Confirms every file in a candidate
 * directory (typically the quarantine produced by dedupe-by-master)
 * has at least one content-identical match in the master directory.
 *
 * The intended workflow:
 *   1. Run dedupe-by-master with --apply to move duplicates to --backup.
 *   2. Before deleting --backup, run verify-by-hash with --master pointing
 *      at the surviving source-of-truth and --backup pointing at the same
 *      quarantine directory.
 *   3. Exit code 0 ⇒ safe to delete the quarantine. Anything else ⇒ stop.
 *
 * The hash function is shared with dedupe-by-master (data fork + resource
 * fork, length-prefixed) so results are commensurable.
 */

import { existsSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import { basename, relative, resolve } from "node:path";
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
  readHashlist,
  realpathAllowMissing,
  writeHashlist,
} from "./_font-hash.ts";

type Args = {
  master: string; // the master dir (master mode) OR the recorded source_root (hashlist mode)
  masterHashlist: string; // absolute path to .hashlist; empty when in master mode
  saveMasterHashlist: string; // absolute path to write a hashlist; empty when not requested
  backup: string;
  report: string;
  limit: number;
  allowSuspect: boolean;
};

type Status = "VERIFIED" | "UNVERIFIED" | "SUSPECT" | "ERROR";

type ResultEntry = {
  status: Status;
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
      backup: { type: "string" },
      report: { type: "string" },
      limit: { type: "string" },
      "allow-suspect": { type: "boolean", default: false },
      help: { type: "boolean", default: false },
    },
    allowPositionals: false,
  });

  const masterMode = !!values.master;
  const hashlistMode = !!values["master-hashlist"];

  if (values.help || (!masterMode && !hashlistMode) || !values.backup) {
    console.error(`Usage:
  bun scripts/system/verify-by-hash.ts \\
    --master <dir>                Source of truth (every backup file must hash-match a master file)
    --master-hashlist <file>      Use a previously-saved hashlist instead of re-scanning master
                                  (mutually exclusive with --master)
    --backup <dir>                Quarantine to verify (typically the --backup from dedupe-by-master)
    [--report <path>]             Report TSV path (default: ./verify-report-<ts>.tsv)
    [--limit <N>]                 Process at most N files per directory (for testing)
    [--allow-suspect]             Treat SUSPECT files as warnings instead of failures
                                  (use only when you have manually confirmed they are safe)
    [--save-master-hashlist <f>]  After indexing, write a hashlist that --master-hashlist
                                  can later consume (only valid with --master)

Exit codes:
  0  All backup files verified against master. Safe to delete the backup.
     (with --allow-suspect: SUSPECT files were present but downgraded to warnings)
  1  At least one backup file is UNVERIFIED (no match in master). DO NOT DELETE.
  2  At least one backup file is SUSPECT (size mismatch or empty forks) and
     --allow-suspect was not set. Audit them or pass --allow-suspect to override.

Independence:
  This tool re-hashes everything from disk; it does not consult any
  report file produced by dedupe-by-master. The verdict therefore catches
  silent corruption between dedupe and delete.
  In --master-hashlist mode the master is trusted via the artifact rather
  than re-hashed; this is faster but assumes the hashlist was generated
  by a previous run with --save-master-hashlist on the same content.
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
    // master is filled in at load time from the hashlist's source_root.
  }
  const saveMasterHashlist = values["save-master-hashlist"]
    ? resolve(values["save-master-hashlist"])
    : "";

  const backupArg = resolve(values.backup);
  if (!existsSync(backupArg)) {
    console.error(`Backup directory does not exist: ${backupArg}`);
    process.exit(1);
  }
  const backup = realpathAllowMissing(backupArg);

  if (master) {
    if (master === backup) {
      console.error(`Master and backup point at the same directory: ${master}`);
      process.exit(1);
    }
    if (master.startsWith(backup + "/") || backup.startsWith(master + "/")) {
      console.error(`Master and backup overlap: ${master} vs ${backup}`);
      process.exit(1);
    }
  }

  const ts = new Date().toISOString().replace(/[-:T]/g, "").slice(0, 14);
  const report = resolve(values.report ?? `./verify-report-${ts}.tsv`);
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
    backup,
    report,
    limit,
    allowSuspect: values["allow-suspect"] ?? false,
  };
}

type Index = {
  hashToPath: Map<string, string>;
  entries: HashlistEntry[]; // one per non-suspect file (for hashlist serialization)
  totalFiles: number;
  bytes: number;
  suspects: { path: string; reason: string }[];
};

async function indexDir(dir: string, label: string, limit: number): Promise<Index> {
  const files = await listFiles(dir);
  const capped = Number.isFinite(limit) ? files.slice(0, limit) : files;
  console.error(
    `  Discovered ${files.length} files${
      capped.length !== files.length ? ` (processing first ${capped.length})` : ""
    }. Hashing...`,
  );
  const hashToPath = new Map<string, string>();
  const entries: HashlistEntry[] = [];
  const suspects: { path: string; reason: string }[] = [];
  const prog = new Progress(label, capped.length);
  let bytes = 0;
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
          relPath: relative(dir, f),
          hash: r.hash,
          dataSize: r.dataSize,
          rsrcSize: r.rsrcSize,
        });
      }
      prog.tick(r.dataSize + r.rsrcSize);
    } catch (err) {
      suspects.push({ path: f, reason: `hash_error:${(err as Error).message}` });
      console.error(`\n  ! hash failed: ${f} (${(err as Error).message})`);
    }
  }
  prog.finish();
  return { hashToPath, entries, totalFiles: capped.length, bytes, suspects };
}

// See dedupe-by-master's loadMasterFromHashlist for the rationale on
// suspects=[] in hashlist mode (operator already saw them at build time).
async function loadMasterFromHashlist(
  hashlistPath: string,
): Promise<{ index: Index; sourceRoot: string; generated: string }> {
  console.error(`[1/2] Loading master hashlist: ${hashlistPath}`);
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
      bytes,
      suspects: [],
    },
    sourceRoot: hl.sourceRoot,
    generated: hl.generated,
  };
}

async function verifyBackup(
  backup: string,
  masterHashes: Map<string, string>,
  limit: number,
): Promise<ResultEntry[]> {
  const files = await listFiles(backup);
  const capped = Number.isFinite(limit) ? files.slice(0, limit) : files;
  console.error(
    `  Discovered ${files.length} files${
      capped.length !== files.length ? ` (processing first ${capped.length})` : ""
    }. Hashing and verifying...`,
  );
  const results: ResultEntry[] = [];
  const prog = new Progress(`backup ${basename(backup)}`, capped.length);
  for (const f of capped) {
    const rel = relative(backup, f);
    try {
      const r = await hashFile(f);
      let status: Status;
      let masterExample = "";
      if (r.suspect) {
        status = "SUSPECT";
      } else {
        masterExample = masterHashes.get(r.hash) ?? "";
        status = masterExample ? "VERIFIED" : "UNVERIFIED";
      }
      results.push({
        status,
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
      results.push({
        status: "ERROR",
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
  return results;
}

function summarize(results: ResultEntry[]): {
  verified: number;
  unverified: number;
  suspect: number;
  error: number;
  verifiedBytes: number;
  unverifiedBytes: number;
} {
  let verified = 0;
  let unverified = 0;
  let suspect = 0;
  let error = 0;
  let verifiedBytes = 0;
  let unverifiedBytes = 0;
  for (const r of results) {
    const bytes = r.dataSize + r.rsrcSize;
    if (r.status === "VERIFIED") {
      verified++;
      verifiedBytes += bytes;
    } else if (r.status === "UNVERIFIED") {
      unverified++;
      unverifiedBytes += bytes;
    } else if (r.status === "SUSPECT") suspect++;
    else error++;
  }
  return { verified, unverified, suspect, error, verifiedBytes, unverifiedBytes };
}

async function writeReport(
  reportPath: string,
  master: string,
  backup: string,
  masterSuspects: { path: string; reason: string }[],
  results: ResultEntry[],
): Promise<void> {
  const lines: string[] = [];
  lines.push(`# verify-by-hash report`);
  lines.push(`# generated: ${new Date().toISOString()}`);
  lines.push(`# master: ${master}`);
  lines.push(`# backup: ${backup}`);
  lines.push(
    `# columns: status\trel_path\tdata_bytes\trsrc_bytes\tsha256\tmaster_example_or_suspect_reason\terror`,
  );
  // Paths are escaped because macOS filenames may legally contain tab
  // and newline bytes, and mojibake names can contain anything the
  // source system permitted.
  for (const s of masterSuspects) {
    lines.push(
      [
        "MASTER_SUSPECT",
        escapeTsv(relative(master, s.path)),
        "",
        "",
        "",
        escapeTsv(s.reason),
        "",
      ].join("\t"),
    );
  }
  for (const r of results) {
    lines.push(
      [
        r.status,
        escapeTsv(r.relPath),
        String(r.dataSize),
        String(r.rsrcSize),
        r.hash,
        escapeTsv(r.status === "SUSPECT" ? r.suspectReason : r.masterExample),
        escapeTsv(r.error ?? ""),
      ].join("\t"),
    );
  }
  await writeFile(reportPath, lines.join("\n") + "\n", "utf8");
}

async function main() {
  const args = parseArgsOrExit();

  if (args.masterHashlist) {
    console.error(`Master hashlist: ${args.masterHashlist}`);
  } else {
    console.error(`Master:  ${args.master}`);
  }
  console.error(`Backup:  ${args.backup}`);
  console.error(`Report:  ${args.report}`);
  console.error(`SUSPECT: ${args.allowSuspect ? "warn only (--allow-suspect)" : "fail (exit 2)"}`);
  if (args.saveMasterHashlist) {
    console.error(`Save hashlist: ${args.saveMasterHashlist}`);
  }
  console.error("");

  const t0 = Date.now();

  let masterIdx: Index;
  if (args.masterHashlist) {
    const loaded = await loadMasterFromHashlist(args.masterHashlist);
    masterIdx = loaded.index;
    args.master = loaded.sourceRoot;
    // Re-check overlap now that source_root is known.
    if (args.master === args.backup) {
      console.error(`Master and backup point at the same directory: ${args.master}`);
      process.exit(1);
    }
    if (args.master.startsWith(args.backup + "/") || args.backup.startsWith(args.master + "/")) {
      console.error(`Master and backup overlap: ${args.master} vs ${args.backup}`);
      process.exit(1);
    }
  } else {
    console.error(`[1/2] Indexing master: ${args.master}`);
    masterIdx = await indexDir(args.master, "master", args.limit);
    console.error(
      `  Master: ${masterIdx.totalFiles} files, ${masterIdx.hashToPath.size} unique hashes, ${fmtBytes(masterIdx.bytes)}`,
    );
    if (masterIdx.suspects.length > 0) {
      console.error(
        `  WARN: ${masterIdx.suspects.length} master files SUSPECT (excluded from index). First 5:`,
      );
      for (const s of masterIdx.suspects.slice(0, 5)) {
        console.error(`    - ${s.path}  [${s.reason}]`);
      }
    }
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

  console.error(`\n[2/2] Verifying backup: ${args.backup}`);
  const results = await verifyBackup(args.backup, masterIdx.hashToPath, args.limit);

  const s = summarize(results);
  console.error("");
  console.error("Summary:");
  console.error(`  Verified:    ${s.verified} (${fmtBytes(s.verifiedBytes)})`);
  console.error(`  Unverified:  ${s.unverified} (${fmtBytes(s.unverifiedBytes)})`);
  console.error(`  Suspect:     ${s.suspect}`);
  console.error(`  Errors:      ${s.error}`);
  console.error(`  Elapsed:     ${((Date.now() - t0) / 1000).toFixed(1)}s`);

  await writeReport(args.report, args.master, args.backup, masterIdx.suspects, results);
  console.error(`\nReport written: ${args.report}`);

  if (s.unverified > 0) {
    console.error(
      `\nFAIL: ${s.unverified} backup files have NO MATCH in master. DO NOT delete the backup until you have audited them.`,
    );
    process.exit(1);
  }
  if (s.error > 0) {
    console.error(`\nFAIL: ${s.error} files errored. Audit before deleting backup.`);
    process.exit(1);
  }
  if (s.suspect > 0) {
    // SUSPECT files weren't compared against master (size mismatch or
    // both forks empty during re-hash), so we cannot assert they have a
    // master match. Exit code 0 is reserved for "all verified, safe to
    // delete" — never claim safety when even one file is unverified.
    // --allow-suspect opts into the permissive path for cases where the
    // user has manually confirmed the SUSPECT files (e.g. legitimate
    // 0-byte data forks for resource-fork-only fonts).
    if (!args.allowSuspect) {
      console.error(
        `\nFAIL: ${s.suspect} SUSPECT files in backup were not verified (size mismatch or empty forks). ` +
          `Audit them manually or re-run with --allow-suspect to override.`,
      );
      process.exit(2);
    }
    console.error(
      `\nWARN: ${s.suspect} SUSPECT files in backup were not verified. ` +
        `--allow-suspect was set, so they are downgraded to warnings — confirm manually that they are safe to lose.`,
    );
  }
  console.error(
    `\nOK: all ${s.verified} backup files have a content-identical match in master. Backup is safe to delete.`,
  );
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
