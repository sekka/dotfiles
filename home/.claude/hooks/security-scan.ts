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
    permissionDecision: "allow" | "deny";
    permissionDecisionReason: string;
  };
}

export interface ScanResult {
  found: boolean;
  reason: string;
}

// Credential detection patterns
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
    // sk- followed by 20+ alphanumeric chars (OpenAI style)
    // Exclude sk_test_, sk_live_ (those are Stripe, handled below)
    pattern: /sk-[A-Za-z0-9]{20,}/,
    label: "OpenAI API key",
  },
  {
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
      // Context7 MCP and similar: scan all string fields
      const parts: string[] = [];
      for (const key of ["code", "query", "question", "topic", "libraryName"]) {
        if (typeof toolInput[key] === "string") parts.push(toolInput[key] as string);
      }
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
          permissionDecision: "allow",
          permissionDecisionReason: `Security scan error: ${error instanceof Error ? error.message : String(error)}`,
        },
      }),
    );
    process.exit(0);
  }
}

if (import.meta.main) {
  await main();
}
