import { describe, expect, test } from "bun:test";
import { fileURLToPath } from "node:url";
import { checkAuthCommand } from "../auth-guard";

const hookPath = fileURLToPath(new URL("../auth-guard.ts", import.meta.url));

describe("auth-guard main(): fail-closed on anomalous input (Fix #2)", () => {
  test("empty stdin → permissionDecision: ask", async () => {
    const proc = Bun.spawn(["bun", hookPath], {
      stdin: new TextEncoder().encode(""),
      stdout: "pipe",
      stderr: "pipe",
    });
    await proc.exited;
    const stderrText = await new Response(proc.stderr).text();
    const parsed = JSON.parse(stderrText);
    expect(parsed.hookSpecificOutput.permissionDecision).toBe("ask");
    expect(parsed.hookSpecificOutput.permissionDecisionReason).toContain("Please verify manually");
  });

  test("invalid JSON stdin → permissionDecision: ask", async () => {
    const proc = Bun.spawn(["bun", hookPath], {
      stdin: new TextEncoder().encode("this is not json"),
      stdout: "pipe",
      stderr: "pipe",
    });
    await proc.exited;
    const stderrText = await new Response(proc.stderr).text();
    const parsed = JSON.parse(stderrText);
    expect(parsed.hookSpecificOutput.permissionDecision).toBe("ask");
    expect(parsed.hookSpecificOutput.permissionDecisionReason).toContain("Please verify manually");
  });

  test("command field missing → permissionDecision: ask", async () => {
    const input = JSON.stringify({ tool_name: "Bash", tool_input: {} });
    const proc = Bun.spawn(["bun", hookPath], {
      stdin: new TextEncoder().encode(input),
      stdout: "pipe",
      stderr: "pipe",
    });
    await proc.exited;
    const stderrText = await new Response(proc.stderr).text();
    const parsed = JSON.parse(stderrText);
    expect(parsed.hookSpecificOutput.permissionDecision).toBe("ask");
    expect(parsed.hookSpecificOutput.permissionDecisionReason).toContain("Please verify manually");
  });
});

describe("checkAuthCommand", () => {
  describe("allow: safe commands", () => {
    const safeCommands = [
      "ls -la",
      "git status",
      "npm install",
      "echo hello",
      "gcloud projects list",
      "aws s3 ls",
      "gh pr list",
      "cat /etc/passwd",
      "grep pattern /etc/passwd",
      "ssh-keyscan github.com",
      "export MY_VAR=value",
      "export PATH=/usr/local/bin:$PATH",
      "export DEBUG=true",
      "op read op://vault/item/field",
    ];

    for (const command of safeCommands) {
      test(`allow: ${command}`, () => {
        const result = checkAuthCommand(command);
        expect(result.decision).toBe("allow");
      });
    }
  });

  describe("deny: irreversible credential changes", () => {
    describe("passwd", () => {
      const denyCommands = ["passwd", "passwd root", "passwd myuser", "sudo passwd root"];

      for (const command of denyCommands) {
        test(`deny: ${command}`, () => {
          const result = checkAuthCommand(command);
          expect(result.decision).toBe("deny");
        });
      }
    });

    describe("chpasswd and usermod -p", () => {
      const denyCommands = [
        "echo 'user:password' | chpasswd",
        "chpasswd",
        "usermod -p newpassword username",
      ];

      for (const command of denyCommands) {
        test(`deny: ${command}`, () => {
          const result = checkAuthCommand(command);
          expect(result.decision).toBe("deny");
        });
      }
    });
  });

  describe("ask: interactive auth flows", () => {
    describe("gcloud auth", () => {
      const askCommands = [
        "gcloud auth login",
        "gcloud auth revoke",
        "gcloud auth application-default login",
      ];

      for (const command of askCommands) {
        test(`ask: ${command}`, () => {
          const result = checkAuthCommand(command);
          expect(result.decision).toBe("ask");
        });
      }
    });

    describe("aws configure", () => {
      const askCommands = [
        "aws configure",
        "aws configure set aws_access_key_id AKIAIOSFODNN7EXAMPLE",
        "aws configure --profile myprofile",
      ];

      for (const command of askCommands) {
        test(`ask: ${command}`, () => {
          const result = checkAuthCommand(command);
          expect(result.decision).toBe("ask");
        });
      }
    });

    describe("gh auth", () => {
      const askCommands = [
        "gh auth login",
        "gh auth logout",
        "gh auth refresh",
        "gh auth setup-git",
      ];

      for (const command of askCommands) {
        test(`ask: ${command}`, () => {
          const result = checkAuthCommand(command);
          expect(result.decision).toBe("ask");
        });
      }
    });

    describe("ssh-keygen", () => {
      test("ask: ssh-keygen", () => {
        const result = checkAuthCommand("ssh-keygen");
        expect(result.decision).toBe("ask");
      });

      test("ask: ssh-keygen -t ed25519 -C email", () => {
        const result = checkAuthCommand("ssh-keygen -t ed25519 -C email@example.com");
        expect(result.decision).toBe("ask");
      });
    });

    describe("op (1Password CLI)", () => {
      const askCommands = ["op signin", "op item edit Login title=new-title"];

      for (const command of askCommands) {
        test(`ask: ${command}`, () => {
          const result = checkAuthCommand(command);
          expect(result.decision).toBe("ask");
        });
      }
    });

    describe("credential env var exports", () => {
      const askCommands = [
        "export AWS_SECRET_ACCESS_KEY=dummy-value",
        "export AWS_ACCESS_KEY_ID=dummy-value",
        "export GITHUB_TOKEN=dummy-value",
        "export OPENAI_API_KEY=dummy-value",
        "export ANTHROPIC_API_KEY=dummy-value",
        "export STRIPE_SECRET_KEY=dummy-value",
      ];

      for (const command of askCommands) {
        test(`ask: ${command}`, () => {
          const result = checkAuthCommand(command);
          expect(result.decision).toBe("ask");
        });
      }
    });
  });

  describe("deny: sudo flag bypass for passwd", () => {
    const denyCommands = [
      ["sudo -u root passwd", "sudo -u root passwd"],
      ["sudo --user=root passwd", "sudo --user=root passwd"],
      ["sudo --user root passwd", "sudo --user root passwd"],
    ];

    for (const [command, description] of denyCommands) {
      test(`deny: ${description}`, () => {
        const result = checkAuthCommand(command);
        expect(result.decision).toBe("deny");
      });
    }

    test("allow: cat /etc/passwd (no false match on path)", () => {
      const result = checkAuthCommand("cat /etc/passwd");
      expect(result.decision).toBe("allow");
    });

    test("allow: grep root /etc/passwd", () => {
      const result = checkAuthCommand("grep root /etc/passwd");
      expect(result.decision).toBe("allow");
    });
  });

  describe("Fix #1: passwd basename detection (path-prefixed forms)", () => {
    const denyCommands = [
      "/usr/bin/passwd root",
      "/bin/passwd root",
      "sudo /usr/bin/passwd root",
      "sudo /bin/passwd root",
      "sudo -u root /usr/bin/passwd target",
    ];

    for (const command of denyCommands) {
      test(`deny: ${command}`, () => {
        const result = checkAuthCommand(command);
        expect(result.decision).toBe("deny");
      });
    }

    test("allow: grep passwd /etc/passwd (passwd as arg)", () => {
      const result = checkAuthCommand("grep passwd /etc/passwd");
      expect(result.decision).toBe("allow");
    });

    test('allow: echo "/usr/bin/passwd" (quoted path as arg)', () => {
      const result = checkAuthCommand('echo "/usr/bin/passwd"');
      expect(result.decision).toBe("allow");
    });
  });

  describe("Fix 1-4: passwd false-positive fixes", () => {
    describe("allow: passwd as argument/string, not command", () => {
      const allowCommands = [
        "grep passwd /etc/passwd",
        "echo passwd",
        "cat /var/log/passwd.log",
        "echo 'check passwd file'",
      ];

      for (const command of allowCommands) {
        test(`allow: ${command}`, () => {
          const result = checkAuthCommand(command);
          expect(result.decision).toBe("allow");
        });
      }
    });

    describe("deny: passwd as executed command", () => {
      const denyCommands = [
        "passwd",
        "passwd root",
        "sudo passwd root",
        "sudo -u root passwd",
        "sudo --user=root passwd",
        "sudo --user root passwd",
      ];

      for (const command of denyCommands) {
        test(`deny: ${command}`, () => {
          const result = checkAuthCommand(command);
          expect(result.decision).toBe("deny");
        });
      }
    });
  });

  describe("Fix #1 (CodeRabbit round 4): env var assignment prefix bypass for passwd", () => {
    describe("deny: leading env var assignment before passwd command", () => {
      const denyCommands = [
        "PATH=/tmp passwd root",
        "FOO=1 sudo passwd root",
        "FOO=1 BAR=2 sudo -u root /usr/bin/passwd target",
      ];

      for (const command of denyCommands) {
        test(`deny: ${command}`, () => {
          const result = checkAuthCommand(command);
          expect(result.decision).toBe("deny");
        });
      }
    });

    describe("allow: env var assignment as argument (not prefix)", () => {
      test("allow: echo FOO=bar", () => {
        const result = checkAuthCommand("echo FOO=bar");
        expect(result.decision).toBe("allow");
      });

      test("allow: grep passwd /etc/passwd", () => {
        const result = checkAuthCommand("grep passwd /etc/passwd");
        expect(result.decision).toBe("allow");
      });
    });
  });

  describe("Fix #2 (CodeRabbit round 4): multi-variable export credential bypass", () => {
    describe("ask: credential var among multiple exports", () => {
      const askCommands = [
        "export PATH=/tmp OPENAI_API_KEY=dummy",
        "export FOO=1 BAR=2 GITHUB_TOKEN=xxx BAZ=3",
        "export AWS_SECRET_ACCESS_KEY=abc",
      ];

      for (const command of askCommands) {
        test(`ask: ${command}`, () => {
          const result = checkAuthCommand(command);
          expect(result.decision).toBe("ask");
        });
      }
    });

    describe("allow: export without credential vars", () => {
      const allowCommands = ["export FOO=1 BAR=2 BAZ=3", "echo export OPENAI_API_KEY=x"];

      for (const command of allowCommands) {
        test(`allow: ${command}`, () => {
          const result = checkAuthCommand(command);
          expect(result.decision).toBe("allow");
        });
      }
    });
  });

  describe("reason string is non-empty for non-allow decisions", () => {
    test("deny: passwd has a reason", () => {
      const result = checkAuthCommand("passwd");
      expect(result.reason.length).toBeGreaterThan(0);
    });

    test("ask: gcloud auth login has a reason", () => {
      const result = checkAuthCommand("gcloud auth login");
      expect(result.reason.length).toBeGreaterThan(0);
    });
  });
});
