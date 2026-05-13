#!/usr/bin/env bun
// PreToolUse hook: scans outbound content (WebFetch, Context7 MCP) for credentials
// before they are sent to external services.
//
// Reference: home/.claude/rules/security.md
// Motivation: prevent accidental credential leakage in WebFetch URLs/prompts
// or context7 queries. Matches known credential patterns and denies the tool call
// with a masked match in the reason string.
//
// Internal host filtering: set SECURITY_SCAN_INTERNAL_HOSTS env var to a comma-separated
// list of hostnames to also block (e.g. "internal.corp.com,api.private.io").
// If unset, internal host checking is skipped.

interface HookInput {
  tool_name: string;
  tool_input: Record<string, unknown>;
  session_id?: string;
}

interface HookOutput {
  hookSpecificOutput: {
    hookEventName: "PreToolUse";
    permissionDecision: "allow" | "deny" | "ask";
    permissionDecisionReason: string;
  };
}

export interface ScanResult {
  found: boolean;
  reason: string;
}

// Credential detection patterns
// NOTE: Anthropic and Stripe patterns must precede the generic sk- pattern so that
// sk-ant-* and sk_live_* are not mis-labeled as "OpenAI API key".
const CREDENTIAL_PATTERNS: { pattern: RegExp; label: string }[] = [
  {
    pattern: /AKIA[0-9A-Z]{16}/,
    label: "AWS access key",
  },
  {
    pattern: /gh[pours]_[A-Za-z0-9]{36}/,
    label: "GitHub token",
  },
  {
    // Anthropic API key — must come before generic sk- pattern
    pattern: /sk-ant-[A-Za-z0-9_-]{20,}/,
    label: "Anthropic API key",
  },
  {
    pattern: /sk_live_[A-Za-z0-9]{24,}/,
    label: "Stripe secret key",
  },
  {
    pattern: /pk_live_[A-Za-z0-9]{24,}/,
    label: "Stripe publishable key",
  },
  {
    pattern: /rk_live_[A-Za-z0-9]{24,}/,
    label: "Stripe restricted key",
  },
  {
    // OpenAI API key (sk- prefix, excluding Anthropic sk-ant- and Stripe sk_live_).
    // Matches classic sk-xxxx and modern sk-proj-xxxx / sk-svcacct-xxxx forms.
    // Uses negative lookahead to avoid matching already-handled prefixes above.
    pattern: /sk-(?!ant-)(?!_)[A-Za-z0-9_-]{20,}/,
    label: "OpenAI API key",
  },
  {
    pattern: /xox[baprs]-[0-9A-Za-z-]{10,}/,
    label: "Slack token",
  },
  {
    pattern: /-----BEGIN (RSA |OPENSSH |EC |DSA |PGP )?PRIVATE KEY-----/,
    label: "Private key",
  },
];

export function maskCredential(match: string): string {
  if (match.length === 0) return "****";
  const prefix = match.slice(0, 4);
  return `${prefix}****`;
}

export function scanForCredentials(text: string): ScanResult {
  if (!text) return { found: false, reason: "" };

  for (const { pattern, label } of CREDENTIAL_PATTERNS) {
    const m = text.match(pattern);
    if (m) {
      const masked = maskCredential(m[0]);
      return {
        found: true,
        reason: `Detected potential credential '${masked}' (${label}) in outbound content. Remove credentials before sending to external services.`,
      };
    }
  }

  // Internal host check (optional, via env var)
  const internalHostsEnv = process.env["SECURITY_SCAN_INTERNAL_HOSTS"];
  if (internalHostsEnv) {
    const hosts = internalHostsEnv
      .split(",")
      .map((h) => h.trim())
      .filter(Boolean);
    for (const host of hosts) {
      if (text.includes(host)) {
        return {
          found: true,
          reason: `Detected internal host '${host}' in outbound content. Do not send internal URLs to external services (security.md).`,
        };
      }
    }
  }

  return { found: false, reason: "" };
}

// Recursively collect all string values from an arbitrary value tree
export function collectStrings(value: unknown, acc: string[]): void {
  if (typeof value === "string") {
    acc.push(value);
    return;
  }
  if (Array.isArray(value)) {
    for (const item of value) collectStrings(item, acc);
    return;
  }
  if (value !== null && typeof value === "object") {
    for (const v of Object.values(value as Record<string, unknown>)) {
      collectStrings(v, acc);
    }
  }
  // number/boolean/null/undefined → skip
}

// Extract the text content to scan from the tool input
export function extractScanTarget(toolName: string, toolInput: Record<string, unknown>): string {
  switch (toolName) {
    case "WebFetch": {
      const parts: string[] = [];
      if (typeof toolInput["url"] === "string") parts.push(toolInput["url"]);
      if (typeof toolInput["prompt"] === "string") parts.push(toolInput["prompt"]);
      return parts.join(" ");
    }
    default: {
      // Context7 MCP and similar: recursively scan all string values
      const parts: string[] = [];
      collectStrings(toolInput, parts);
      return parts.join(" ");
    }
  }
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
    const target = extractScanTarget(input.tool_name, input.tool_input ?? {});
    const result = scanForCredentials(target);

    const output: HookOutput = {
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: result.found ? "deny" : "allow",
        permissionDecisionReason: result.reason || "No credentials detected",
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
          permissionDecisionReason: `Security scan error (failing closed): ${error instanceof Error ? error.message : String(error)}. Please verify the outbound content has no credentials before approving.`,
        },
      }),
    );
    process.exit(0);
  }
}

if (import.meta.main) {
  await main();
}
