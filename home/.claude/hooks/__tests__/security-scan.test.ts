import { describe, expect, test } from "bun:test";
import { scanForCredentials, maskCredential } from "../security-scan";

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
