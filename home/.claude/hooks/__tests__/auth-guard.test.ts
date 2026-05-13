import { describe, expect, test } from "bun:test";
import { checkAuthCommand } from "../auth-guard";

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
        "export AWS_SECRET_ACCESS_KEY=abc123",
        "export AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE",
        "export GITHUB_TOKEN=ghp_1234567890",
        "export OPENAI_API_KEY=sk-abc",
        "export ANTHROPIC_API_KEY=sk-ant-abc",
        "export STRIPE_SECRET_KEY=sk_live_abc",
      ];

      for (const command of askCommands) {
        test(`ask: ${command}`, () => {
          const result = checkAuthCommand(command);
          expect(result.decision).toBe("ask");
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
