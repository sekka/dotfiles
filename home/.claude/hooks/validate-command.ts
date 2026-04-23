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
    pattern: /\bgit\s+push\s+[^&|;]*--force(?:-with-lease)?\b/,
    reason: "git push --force is prohibited. Risk of overwriting remote changes.",
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

// Dangerous command chain patterns
const DANGEROUS_CHAINS = [
  // Pipe to dangerous commands
  /\|\s*(rm|sudo|dd|shred|mkfs)\s+/,
  // xargs with dangerous commands
  /xargs\s+(?:-[^\s]*\s+)*(rm|sudo|dd|shred)(?:\s+|$)/,
  // Dangerous operations in subshells
  /\$\([^)]*(?:rm -rf|sudo|dd|shred)[^)]*\)/,
  // Dangerous operations in backticks
  /`[^`]*(?:rm -rf|sudo|dd|shred)[^`]*`/,
  // Semicolon chaining with dangerous commands
  /;\s*(?:rm -rf|sudo|dd|shred)\s+/,
  // && chaining with dangerous commands
  /&&\s*(?:rm -rf|sudo|dd|shred)\s+/,
  // || chaining with dangerous commands (destructive on error)
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
