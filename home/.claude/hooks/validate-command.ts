#!/usr/bin/env bun
// PreToolUse:Bash hook: 破壊的なシェルコマンドをブロックする安全フェンス
//
// すべての Bash ツール呼び出しを傍受し、コマンドを以下に分類する:
//   prohibited  sed, awk, git add -A, force-push, reset --hard  → deny（即時拒否）
//   critical    rm -rf /, 物理ディスクへの dd                    → deny（即時拒否）
//   dangerous   rm/sudo/dd/shred へのパイプ・チェーン            → ask（確認要求）
//   safe        上記以外                                        → allow
//
// 狙い: 誤操作によるデータ損失を防ぐ。.env ファイルの誤ステージングや、
// 失敗のリトライが破壊的コマンドにエスカレートするケースを事前に止める。

interface HookInput {
  tool_name: string;
  tool_input: {
    command?: string;
  };
  session_id?: string;
}

interface HookOutput {
  hookSpecificOutput: {
    hookEventName: "PreToolUse";
    permissionDecision: "allow" | "deny" | "ask";
    permissionDecisionReason: string;
  };
}

// Prohibited commands (immediate block)
const PROHIBITED_COMMANDS: { pattern: RegExp; reason: string }[] = [
  {
    pattern: /\bg?sed\b/,
    reason:
      "sed is prohibited. Use the Edit tool for file editing and 'perl -pe' for stream processing. Example: perl -pe 's/old/new/g' file",
  },
  {
    pattern: /\bg?awk\b/,
    reason:
      "awk is prohibited. Use the Edit tool for file editing and 'perl -lane' for field processing. Example: perl -lane 'print $F[0]' file",
  },
  {
    pattern: /\bgit\s+add\s+(-A\b|--all\b|\.(?:\s|$))/,
    reason:
      "git add -A/--all/. is prohibited. Specify files individually to prevent accidental staging of sensitive files. Example: git add specific-file.ts",
  },
  {
    pattern: /\bgit\s+push\s+[^&|;]*--force\b(?!-with-lease)/,
    reason: "git push --force is prohibited. Use --force-with-lease if rebase is necessary.",
  },
  {
    pattern: /\bgit\s+reset\s+--hard\b/,
    reason: "git reset --hard is prohibited. Uncommitted changes will be lost.",
  },
  {
    pattern: /\bgit\s+commit\b[^|;]*--no-verify\b/,
    reason:
      "git commit --no-verify is prohibited. Bypassing pre-commit hooks skips quality checks. Fix the root cause if a hook fails.",
  },
];

// User-visible applications that should not be targeted by wide pkill/killall patterns.
// Reference: home/.claude/rules/process-kill-targeting.md
// Incident: 2026-04-05 wide pkill caused Chrome browser kill.
const WIDE_KILL_APP_NAMES = [
  "Google Chrome",
  "chrome",
  "firefox",
  "safari",
  "node",
  "python",
  "python3",
  "Slack",
  "Discord",
  "Finder",
  "Code",
  "iTerm2",
  "Terminal",
];

// pkill options that take an argument (next token is the option's value, not the pattern).
// Reference: pkill(1) man page. Broad list to handle both macOS and GNU variants.
const PKILL_OPTIONS_WITH_ARG = new Set([
  "-u",
  "-U",
  "-G",
  "-g",
  "-P",
  "-s",
  "-t",
  "-n",
  "--euid",
  "--uid",
  "--gid",
  "--pgroup",
  "--session",
  "--terminal",
  "--ns",
  "--nslist",
  "--signal",
]);

// Strip surrounding single or double quotes from a token.
function unquoteToken(token: string): string {
  if (
    (token.startsWith('"') && token.endsWith('"')) ||
    (token.startsWith("'") && token.endsWith("'"))
  ) {
    return token.slice(1, -1);
  }
  return token;
}

// Shell-aware tokenizer: splits on whitespace but keeps quoted strings (with spaces) as one token.
// Strips surrounding quotes from each token.
function shellTokenize(command: string): string[] {
  const tokens: string[] = [];
  let i = 0;
  while (i < command.length) {
    // Skip whitespace
    while (i < command.length && /\s/.test(command[i] as string)) i++;
    if (i >= command.length) break;

    const quote = command[i] as string;
    if (quote === '"' || quote === "'") {
      // Quoted token — find closing quote
      const start = i + 1;
      i++;
      while (i < command.length && command[i] !== quote) i++;
      tokens.push(command.slice(start, i));
      if (i < command.length) i++; // skip closing quote
    } else {
      // Unquoted token — read until whitespace
      const start = i;
      while (i < command.length && !/\s/.test(command[i] as string)) i++;
      tokens.push(command.slice(start, i));
    }
  }
  return tokens;
}

// Matches a pkill -f argument (quoted or unquoted) extracting the pattern string.
// Handles flags before -f: pkill -9 -f, pkill -KILL -f, pkill --signal KILL -f.
// Also handles combined short options containing f: pkill -fx, pkill -xf.
// Skips option-with-arg pairs (e.g. -u alice) so the arg is not mistaken for the pattern.
// Returns undefined if the command is not a pkill -f (or combined form).
function extractPkillPattern(command: string): string | undefined {
  const tokens = shellTokenize(command);
  const pkillIdx = tokens.findIndex((t) => /^pkill$/i.test(t));
  if (pkillIdx === -1) return undefined;

  for (let i = pkillIdx + 1; i < tokens.length; i++) {
    const tok = tokens[i] as string;

    if (!tok.startsWith("-")) {
      // Non-flag token before any -f found — not a -f invocation
      return undefined;
    }

    // --long=value (no separate arg token needed)
    if (tok.startsWith("--") && tok.includes("=")) {
      continue;
    }

    // Known option that takes a separate arg — skip it and its value
    if (PKILL_OPTIONS_WITH_ARG.has(tok)) {
      i++; // skip next token (the option's value)
      continue;
    }

    if (tok === "-f") {
      // Standard -f: join remaining non-flag tokens as the pattern.
      // "pkill -f Google Chrome" → "Google Chrome"; "pkill -f node" → "node"
      if (i + 1 >= tokens.length) return undefined;
      const patternParts: string[] = [];
      for (let j = i + 1; j < tokens.length; j++) {
        const p = tokens[j] as string;
        if (p.startsWith("-")) break; // stop at next flag
        patternParts.push(p);
      }
      return patternParts.join(" ") || undefined;
    }

    if (!tok.startsWith("--") && tok.includes("f")) {
      // Combined short option like -fx, -xf — next non-flag token is the pattern
      for (let j = i + 1; j < tokens.length; j++) {
        const candidate = tokens[j] as string;
        if (!candidate.startsWith("-")) {
          return candidate;
        }
      }
    }

    // Other single-flag without arg (e.g. -9, -KILL, -x) — skip
  }

  return undefined;
}

// killall options that take a separate argument (next token is the option's value).
// Reference: killall(1) macOS + GNU variants.
const KILLALL_OPTIONS_WITH_ARG = new Set([
  "-s",
  "--signal",
  "-u",
  "--user",
  "-Z",
  "--context",
  "-g",
  "--pgroup",
  "-G",
  "--group",
  "-n",
  "-z",
]);

// Matches a killall argument (quoted or unquoted), skipping flag tokens and option args.
// Handles: killall -9 chrome, killall -KILL chrome, killall -- chrome, killall "App Name"
// Also handles: killall -u alice chrome, killall -s KILL chrome, killall --signal=KILL chrome
function extractKillallTarget(command: string): string | undefined {
  const tokens = shellTokenize(command);
  const killallIdx = tokens.findIndex((t) => /^killall$/i.test(t));
  if (killallIdx === -1) return undefined;

  for (let i = killallIdx + 1; i < tokens.length; i++) {
    const tok = tokens[i] as string;

    if (tok === "--") {
      // End of options — next token is the process name
      if (i + 1 < tokens.length) return tokens[i + 1] as string;
      return undefined;
    }

    if (tok.startsWith("-")) {
      // --long=value — no separate arg needed
      if (tok.startsWith("--") && tok.includes("=")) {
        continue;
      }
      // Known option that takes a separate arg — skip it and its value
      if (KILLALL_OPTIONS_WITH_ARG.has(tok)) {
        i++; // skip value token
        continue;
      }
      // Other flag (e.g. -9, -KILL, -q, -i, -w) — skip just this token
      continue;
    }

    // First non-flag token is the process name (shellTokenize already unquotes)
    return tok;
  }
  return undefined;
}

// Returns true if the pkill -f pattern is a wide pattern targeting a user-visible app.
// Allows wrapper script names like "chrome-devtools-mcp" (starts with known app but has suffix with dash/underscore).
function isWideKillPattern(pattern: string): boolean {
  for (const appName of WIDE_KILL_APP_NAMES) {
    const lower = pattern.toLowerCase();
    const lowerApp = appName.toLowerCase();

    // Multi-word app names (e.g. "Google Chrome"): deny if pattern starts with them
    if (appName.includes(" ")) {
      if (lower.startsWith(lowerApp)) return true;
      continue;
    }

    // Single-word names: deny if pattern exactly equals app name,
    // OR the pattern after the app name begins with a regex metachar or space
    // (i.e. "chrome.*something" is still a wide pattern).
    // Allow if the app name is followed by - or _ (wrapper script convention).
    if (lower === lowerApp) return true;
    if (lower.startsWith(lowerApp)) {
      const nextChar: string | undefined = lower[lowerApp.length];
      // Wrapper names are separated with -, _, ., or a digit (e.g. python3.11-foo)
      if (
        nextChar === "-" ||
        nextChar === "_" ||
        nextChar === "." ||
        (nextChar !== undefined && nextChar >= "0" && nextChar <= "9")
      )
        continue; // don't return false — another app name may still match exactly
      // Otherwise it's a wide pattern (metachar, space, etc.)
      return true;
    }
  }
  return false;
}

// Dangerous command chain patterns
const DANGEROUS_CHAINS = [
  /\|\s*(rm|sudo|dd|shred|mkfs)\s+/,
  /xargs\s+(?:-[^\s]*\s+)*(rm|sudo|dd|shred)(?:\s+|$)/,
  /\$\([^)]*(?:rm -rf|sudo|dd|shred)[^)]*\)/,
  /`[^`]*(?:rm -rf|sudo|dd|shred)[^`]*`/,
  /;\s*(?:rm -rf|sudo|dd|shred)\s+/,
  /&&\s*(?:rm -rf|sudo|dd|shred)\s+/,
  /\|\|\s*(?:rm -rf|sudo|dd|shred)\s+/,
];

// Critical patterns (system destruction risk)
const CRITICAL_PATTERNS = [
  /rm\s+-[rRf]*\s+\/(?!\S)/, // rm -rf /
  /rm\s+-[rRf]*\s+~\/+\*\s*$/, // rm -rf ~/* (or ~//* etc.)
  /dd\s+if=[^\s]+\s+of=\/dev\/[sh]d[a-z]/, // dd to physical disk
];

export function validateCommand(command: string): {
  isValid: boolean;
  reason: string;
  severity?: "prohibited" | "dangerous" | "critical";
} {
  // Prohibited commands — immediate block
  for (const { pattern, reason } of PROHIBITED_COMMANDS) {
    if (pattern.test(command)) {
      return {
        isValid: false,
        reason,
        severity: "prohibited",
      };
    }
  }

  // Wide kill patterns — block pkill -f and killall targeting user-visible applications
  const pkillPattern = extractPkillPattern(command);
  if (pkillPattern !== undefined && isWideKillPattern(pkillPattern)) {
    return {
      isValid: false,
      reason:
        "Wide kill pattern can match user applications. Use 'kill <PID>' after pgrep to confirm a single match.",
      severity: "prohibited",
    };
  }

  const killallTarget = extractKillallTarget(command);
  if (killallTarget !== undefined && isWideKillPattern(killallTarget)) {
    return {
      isValid: false,
      reason:
        "Wide kill pattern can match user applications. Use 'kill <PID>' after pgrep to confirm a single match.",
      severity: "prohibited",
    };
  }

  // Critical patterns — immediate block
  for (const pattern of CRITICAL_PATTERNS) {
    if (pattern.test(command)) {
      return {
        isValid: false,
        reason: `Critical: potentially destructive system command: ${command.slice(0, 100)}`,
        severity: "critical",
      };
    }
  }

  // Dangerous chain patterns — ask for confirmation
  for (const pattern of DANGEROUS_CHAINS) {
    if (pattern.test(command)) {
      return {
        isValid: false,
        reason: `Dangerous chain: command chain contains destructive operations: ${command.slice(0, 100)}`,
        severity: "dangerous",
      };
    }
  }

  return { isValid: true, reason: "" };
}

async function main() {
  try {
    const stdinText = await Bun.stdin.text();
    if (!stdinText) {
      console.error(
        JSON.stringify({
          hookSpecificOutput: {
            hookEventName: "PreToolUse",
            permissionDecision: "allow",
            permissionDecisionReason: "No input provided",
          },
        }),
      );
      process.exit(0);
    }

    const input: HookInput = JSON.parse(stdinText);
    const command = input.tool_input?.command;

    if (!command) {
      console.error(
        JSON.stringify({
          hookSpecificOutput: {
            hookEventName: "PreToolUse",
            permissionDecision: "allow",
            permissionDecisionReason: "No command to validate",
          },
        }),
      );
      process.exit(0);
    }

    const result = validateCommand(command);
    let permissionDecision: "allow" | "deny" | "ask";
    if (!result.isValid && (result.severity === "prohibited" || result.severity === "critical")) {
      permissionDecision = "deny";
    } else if (!result.isValid) {
      permissionDecision = "ask";
    } else {
      permissionDecision = "allow";
    }

    const output: HookOutput = {
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision,
        permissionDecisionReason: result.reason || "Command validated successfully",
      },
    };

    console.error(JSON.stringify(output));
    process.exit(0);
  } catch (error) {
    console.error(
      JSON.stringify({
        hookSpecificOutput: {
          hookEventName: "PreToolUse",
          permissionDecision: "allow",
          permissionDecisionReason: `Validation error: ${error instanceof Error ? error.message : String(error)}`,
        },
      }),
    );
    process.exit(0);
  }
}

if (import.meta.main) {
  await main();
}
