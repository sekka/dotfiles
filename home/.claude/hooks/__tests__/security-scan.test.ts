import { describe, expect, test, beforeEach, afterEach } from "bun:test";
import {
  scanForCredentials,
  maskCredential,
  extractScanTarget,
  collectStrings,
} from "../security-scan";

describe("scanForCredentials", () => {
  describe("allow: benign content", () => {
    const benignInputs = [
      "https://example.com/api/v1/users",
      "What is the capital of France?",
      "How do I use React hooks?",
      "https://api.github.com/repos/owner/repo",
      "sk_test_abc123",
      "https://docs.anthropic.com/en/api",
      "",
    ];

    for (const input of benignInputs) {
      test(`allow: ${input.slice(0, 60)}`, () => {
        const result = scanForCredentials(input);
        expect(result.found).toBe(false);
      });
    }
  });

  describe("deny: AWS access key", () => {
    test("deny: AKIA access key in URL", () => {
      const result = scanForCredentials("https://example.com/?key=AKIAIOSFODNN7EXAMPLE123");
      expect(result.found).toBe(true);
      expect(result.reason).toContain("AKIA");
    });

    test("deny: AKIA key in text", () => {
      const result = scanForCredentials("Use key AKIAIOSFODNN7EXAMPLE123 to authenticate");
      expect(result.found).toBe(true);
    });
  });

  describe("deny: GitHub tokens", () => {
    const ghTokens = [
      ["ghp_" + "a".repeat(36), "ghp_ prefix (PAT)"],
      ["gho_" + "a".repeat(36), "gho_ prefix (OAuth)"],
      ["ghu_" + "a".repeat(36), "ghu_ prefix (user-to-server)"],
      ["ghs_" + "a".repeat(36), "ghs_ prefix (server-to-server)"],
      ["ghr_" + "a".repeat(36), "ghr_ prefix (refresh)"],
    ];

    for (const [token, description] of ghTokens) {
      test(`deny: ${description}`, () => {
        const result = scanForCredentials(`token: ${token}`);
        expect(result.found).toBe(true);
      });
    }
  });

  describe("deny: OpenAI key", () => {
    test("deny: sk- prefix with sufficient length", () => {
      const result = scanForCredentials("sk-abcdefghijklmnopqrstu");
      expect(result.found).toBe(true);
    });
  });

  describe("deny: Anthropic key", () => {
    test("deny: sk-ant- prefix", () => {
      const result = scanForCredentials("sk-ant-api03-abcdefghijklmnopqrstu");
      expect(result.found).toBe(true);
    });
  });

  describe("deny: Stripe live keys", () => {
    test("deny: sk_live_ key", () => {
      const result = scanForCredentials("sk_live_" + "a".repeat(24));
      expect(result.found).toBe(true);
    });

    test("deny: rk_live_ key", () => {
      const result = scanForCredentials("rk_live_" + "a".repeat(24));
      expect(result.found).toBe(true);
    });

    test("allow: sk_test_ key (not a live secret)", () => {
      const result = scanForCredentials("sk_test_" + "a".repeat(24));
      expect(result.found).toBe(false);
    });
  });

  describe("deny: Slack tokens", () => {
    test("deny: xoxb- bot token", () => {
      const result = scanForCredentials("xoxb-1234567890-abcdefghij");
      expect(result.found).toBe(true);
    });

    test("deny: xoxp- user token", () => {
      const result = scanForCredentials("xoxp-1234567890-abcdefghij");
      expect(result.found).toBe(true);
    });
  });

  describe("deny: private key BEGIN block", () => {
    test("deny: RSA PRIVATE KEY header", () => {
      const result = scanForCredentials("-----BEGIN RSA PRIVATE KEY-----");
      expect(result.found).toBe(true);
    });

    test("deny: OPENSSH PRIVATE KEY header", () => {
      const result = scanForCredentials("-----BEGIN OPENSSH PRIVATE KEY-----");
      expect(result.found).toBe(true);
    });

    test("deny: bare PRIVATE KEY header", () => {
      const result = scanForCredentials("-----BEGIN PRIVATE KEY-----");
      expect(result.found).toBe(true);
    });
  });
});

describe("extractScanTarget", () => {
  describe("Context7 MCP tools", () => {
    test("extracts query field from mcp__plugin_context7_context7__query-docs", () => {
      const target = extractScanTarget("mcp__plugin_context7_context7__query-docs", {
        query: "How to use React hooks",
        libraryName: "react",
      });
      expect(target).toContain("How to use React hooks");
    });

    test("extracts code field containing credential from context7 tool", () => {
      const credCode = "sk-ant-api03-" + "a".repeat(20);
      const target = extractScanTarget("mcp__plugin_context7_context7__resolve-library-id", {
        code: credCode,
        libraryName: "react",
      });
      expect(target).toContain(credCode);
    });
  });

  describe("SECURITY_SCAN_INTERNAL_HOSTS env var (renamed from AUTH_GUARD_INTERNAL_HOSTS)", () => {
    const origSecurity = process.env["SECURITY_SCAN_INTERNAL_HOSTS"];
    const origAuth = process.env["AUTH_GUARD_INTERNAL_HOSTS"];

    beforeEach(() => {
      delete process.env["AUTH_GUARD_INTERNAL_HOSTS"];
      process.env["SECURITY_SCAN_INTERNAL_HOSTS"] = "internal.corp.com";
    });

    afterEach(() => {
      if (origSecurity === undefined) {
        delete process.env["SECURITY_SCAN_INTERNAL_HOSTS"];
      } else {
        process.env["SECURITY_SCAN_INTERNAL_HOSTS"] = origSecurity;
      }
      if (origAuth === undefined) {
        delete process.env["AUTH_GUARD_INTERNAL_HOSTS"];
      } else {
        process.env["AUTH_GUARD_INTERNAL_HOSTS"] = origAuth;
      }
    });

    test("deny: internal host detected via SECURITY_SCAN_INTERNAL_HOSTS", () => {
      const result = scanForCredentials("https://internal.corp.com/api/secret");
      expect(result.found).toBe(true);
      expect(result.reason).toContain("internal.corp.com");
    });

    test("allow: old env var AUTH_GUARD_INTERNAL_HOSTS is not used", () => {
      delete process.env["SECURITY_SCAN_INTERNAL_HOSTS"];
      process.env["AUTH_GUARD_INTERNAL_HOSTS"] = "internal.corp.com";
      const result = scanForCredentials("https://internal.corp.com/api/secret");
      expect(result.found).toBe(false);
    });
  });
});

describe("scanForCredentials via Context7 tool (integration)", () => {
  test("deny: credential in context7 query-docs code field", () => {
    const credText = "sk-ant-api03-" + "a".repeat(20);
    const result = scanForCredentials(credText);
    expect(result.found).toBe(true);
    expect(result.reason).toContain("Anthropic API key");
  });
});

describe("fail-closed on error", () => {
  test("invalid JSON stdin produces permissionDecision: ask", async () => {
    const proc = Bun.spawn(["bun", "/Users/kei/dotfiles/home/.claude/hooks/security-scan.ts"], {
      stdin: new TextEncoder().encode("this is not json"),
      stdout: "pipe",
      stderr: "pipe",
    });
    await proc.exited;
    const stderrText = await new Response(proc.stderr).text();
    const parsed = JSON.parse(stderrText);
    expect(parsed.hookSpecificOutput.permissionDecision).toBe("ask");
    expect(parsed.hookSpecificOutput.permissionDecisionReason).toContain("failing closed");
  });
});

describe("collectStrings", () => {
  test("collects strings from nested object", () => {
    const acc: string[] = [];
    collectStrings({ a: "hello", b: { c: "world" } }, acc);
    expect(acc).toContain("hello");
    expect(acc).toContain("world");
  });

  test("collects strings from array", () => {
    const acc: string[] = [];
    collectStrings(["foo", 42, "bar"], acc);
    expect(acc).toEqual(["foo", "bar"]);
  });

  test("skips numbers, booleans, null", () => {
    const acc: string[] = [];
    collectStrings({ a: 1, b: true, c: null }, acc);
    expect(acc).toHaveLength(0);
  });
});

describe("extractScanTarget: recursive scan for default branch", () => {
  test("detects credential in nested params.input.secret", () => {
    const target = extractScanTarget("mcp__plugin_context7_context7__query-docs", {
      params: { input: { secret: "ghp_" + "x".repeat(36) } },
    });
    const result = scanForCredentials(target);
    expect(result.found).toBe(true);
  });

  test("detects credential in nested array messages[].content", () => {
    const target = extractScanTarget("mcp__plugin_context7_context7__query-docs", {
      messages: [{ content: "AKIAIOSFODNN7EXAMPLE" }],
    });
    const result = scanForCredentials(target);
    expect(result.found).toBe(true);
  });
});

describe("maskCredential", () => {
  test("shows first 4 chars followed by ****", () => {
    expect(maskCredential("AKIAIOSFODNN7EXAMPLE")).toBe("AKIA****");
  });

  test("short strings: shows available chars + ****", () => {
    expect(maskCredential("AB")).toBe("AB****");
  });

  test("empty string: returns ****", () => {
    expect(maskCredential("")).toBe("****");
  });
});
