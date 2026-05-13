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

// Patterns that result in an immediate deny (irreversible credential changes)
const DENY_PATTERNS: { pattern: RegExp; reason: string }[] = [
  {
    // passwd command — matches "passwd", "passwd <user>", "sudo passwd <user>"
    // Does NOT match /etc/passwd (path), grep passwd, cat passwd, etc.
    pattern: /(?:^|[;&|`]\s*|sudo\s+)passwd(?:\s+\S+)?(?:\s*[;&|`]|\s*$)/,
    reason:
      "passwd changes a user password — irreversible without recovery. Requires explicit user approval (auth-changes-need-approval.md).",
  },
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

export function checkAuthCommand(command: string): AuthCheckResult {
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
            permissionDecisionReason: "No command to check",
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
          permissionDecision: "allow",
          permissionDecisionReason: `Auth guard error: ${error instanceof Error ? error.message : String(error)}`,
        },
      }),
    );
    process.exit(0);
  }
}

if (import.meta.main) {
  await main();
}
