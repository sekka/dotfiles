#!/usr/bin/env bun
// PreToolUse:Bash hook: detects credential rotation and authentication changes
//
// Reference: home/.claude/rules/auth-changes-need-approval.md
// Incident: 2026 hieizan WordPress admin password rotation — unauthorized credential
// change broke the user's workflow and required manual recovery.
//
// Classification:
//   deny  — irreversible password/credential overwrites (passwd, chpasswd, usermod -p)
//   ask   — interactive auth flows and credential env-var exports that need user intent
//   allow — everything else

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

export interface AuthCheckResult {
  decision: "allow" | "deny" | "ask";
  reason: string;
}

// sudo options that consume the next token as their argument (not the command to run).
const SUDO_OPTIONS_WITH_ARG = new Set([
  "-u",
  "--user",
  "-g",
  "--group",
  "-r",
  "--role",
  "-t",
  "--type",
  "-C",
  "-c",
]);

// Returns the index of the first token that is NOT a shell env-var assignment (NAME=value).
// Assignments match bash identifier rules: [A-Za-z_][A-Za-z0-9_]*=...
function skipLeadingEnvAssignments(tokens: string[], startIdx: number): number {
  let i = startIdx;
  while (i < tokens.length && /^[A-Za-z_][A-Za-z0-9_]*=/.test(tokens[i] as string)) {
    i++;
  }
  return i;
}

// Returns true if `passwd` appears as an executed command token, not as a path or argument.
// Handles: passwd, passwd user, sudo passwd, sudo -u root passwd, sudo --user=root passwd,
//          PATH=/tmp passwd root, FOO=1 sudo passwd root.
// Rejects: grep passwd, echo passwd, cat /etc/passwd, /usr/bin/passwd (path-prefixed).
function isPasswdCommand(command: string): boolean {
  // Walk shell segments separated by ;  &&  ||  |
  // For each segment, detect if the effective command (after sudo + its flags) is "passwd".
  const segments = command.split(/;|&&|\|\||(?<!\|)\|(?!\|)/);
  for (const segment of segments) {
    const tokens = segment.trim().split(/\s+/).filter(Boolean);
    if (tokens.length === 0) continue;

    // Skip any leading NAME=value env-var assignments before the command
    let idx = skipLeadingEnvAssignments(tokens, 0);

    // Strip sudo and its flag/option tokens
    if (tokens[idx] === "sudo") {
      idx++;
      while (idx < tokens.length) {
        const t = tokens[idx] as string;
        if (t === "--") {
          idx++;
          break;
        }
        if (!t.startsWith("-")) break;
        // --option=value: no next token consumed
        if (t.startsWith("--") && t.includes("=")) {
          idx++;
          continue;
        }
        // Known option-with-arg: skip flag AND its value
        if (SUDO_OPTIONS_WITH_ARG.has(t)) {
          idx += 2;
          continue;
        }
        // Other short flags (e.g. -n, -S, -k) — skip just the flag
        idx++;
      }
    }

    // The effective command token — strip quotes and resolve basename
    // so that /usr/bin/passwd or "passwd" also match.
    const rawCmd = tokens[idx];
    if (!rawCmd) continue;
    const unquoted = rawCmd.replace(/^['"]|['"]$/g, "");
    const base = unquoted.split("/").pop() ?? unquoted;
    if (base === "passwd") return true;
  }
  return false;
}

// Patterns that result in an immediate deny (irreversible credential changes)
const DENY_PATTERNS: { pattern: RegExp; reason: string }[] = [
  {
    pattern: /\bchpasswd\b/,
    reason:
      "chpasswd bulk-updates passwords — irreversible without recovery. Requires explicit user approval.",
  },
  {
    pattern: /\busermod\s+[^;&|]*-p\b/,
    reason:
      "usermod -p overwrites a user password hash — irreversible without recovery. Requires explicit user approval.",
  },
];

// Known credential-related environment variable names
const CREDENTIAL_ENV_VARS = [
  "AWS_SECRET_ACCESS_KEY",
  "AWS_ACCESS_KEY_ID",
  "AWS_SESSION_TOKEN",
  "GITHUB_TOKEN",
  "GH_TOKEN",
  "OPENAI_API_KEY",
  "ANTHROPIC_API_KEY",
  "STRIPE_SECRET_KEY",
  "STRIPE_PUBLISHABLE_KEY",
  "STRIPE_RESTRICTED_KEY",
  "SLACK_BOT_TOKEN",
  "SLACK_APP_TOKEN",
  "DATABASE_URL",
  "REDIS_URL",
  "SENDGRID_API_KEY",
  "TWILIO_AUTH_TOKEN",
];

// Patterns that result in ask (interactive/reversible auth changes)
const ASK_PATTERNS: { pattern: RegExp; reason: string }[] = [
  {
    pattern: /\bgcloud\s+auth\s+(login|revoke|application-default)\b/,
    reason:
      "gcloud auth modifies Google Cloud authentication state. Confirm this is intended (auth-changes-need-approval.md).",
  },
  {
    pattern: /\baws\s+configure\b/,
    reason: "aws configure writes AWS credentials to ~/.aws/credentials. Confirm this is intended.",
  },
  {
    pattern: /\bgh\s+auth\s+(login|logout|refresh|setup-git)\b/,
    reason: "gh auth modifies GitHub CLI authentication state. Confirm this is intended.",
  },
  {
    pattern: /\bssh-keygen\b/,
    reason:
      "ssh-keygen generates or modifies SSH keys. Confirm the target path and key type are intended.",
  },
  {
    pattern: /\bop\s+(signin|item\s+edit)\b/,
    reason: "1Password CLI auth/edit command detected. Confirm credential change is intended.",
  },
];

// Build credential env-var export pattern dynamically
const CRED_ENV_VAR_PATTERN = new RegExp(`\\bexport\\s+(${CREDENTIAL_ENV_VARS.join("|")})\\s*=`);

const PASSWD_DENY_REASON =
  "passwd changes a user password — irreversible without recovery. Requires explicit user approval (auth-changes-need-approval.md).";

export function checkAuthCommand(command: string): AuthCheckResult {
  // passwd command check — must be in executed command position, not as arg/path
  if (isPasswdCommand(command)) {
    return { decision: "deny", reason: PASSWD_DENY_REASON };
  }

  // Deny patterns first
  for (const { pattern, reason } of DENY_PATTERNS) {
    if (pattern.test(command)) {
      return { decision: "deny", reason };
    }
  }

  // Ask patterns
  for (const { pattern, reason } of ASK_PATTERNS) {
    if (pattern.test(command)) {
      return { decision: "ask", reason };
    }
  }

  // Credential env var export
  if (CRED_ENV_VAR_PATTERN.test(command)) {
    return {
      decision: "ask",
      reason:
        "Exporting a known credential environment variable. Confirm this is intentional and the value is correct.",
    };
  }

  return { decision: "allow", reason: "" };
}

async function main() {
  try {
    const stdinText = await Bun.stdin.text();
    if (!stdinText) {
      console.error(
        JSON.stringify({
          hookSpecificOutput: {
            hookEventName: "PreToolUse",
            permissionDecision: "ask",
            permissionDecisionReason:
              "Auth guard could not inspect command: no input provided. Please verify manually.",
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
            permissionDecision: "ask",
            permissionDecisionReason:
              "Auth guard could not inspect command: command field missing. Please verify manually.",
          },
        }),
      );
      process.exit(0);
    }

    const result = checkAuthCommand(command);

    const output: HookOutput = {
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: result.decision,
        permissionDecisionReason: result.reason || "Command validated",
      },
    };

    console.error(JSON.stringify(output));
    process.exit(0);
  } catch (error) {
    console.error(
      JSON.stringify({
        hookSpecificOutput: {
          hookEventName: "PreToolUse",
          permissionDecision: "ask",
          permissionDecisionReason: `Auth guard could not inspect command: ${error instanceof Error ? error.message : String(error)}. Please verify manually.`,
        },
      }),
    );
    process.exit(0);
  }
}

if (import.meta.main) {
  await main();
}
