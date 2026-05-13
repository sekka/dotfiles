import { describe, expect, test } from "bun:test";
import { validateCommand } from "../validate-command";

describe("validateCommand", () => {
  describe("安全なコマンド → isValid: true", () => {
    const safeCommands = [
      // 基本コマンド
      "ls -la",
      "pwd",
      "whoami",
      "date",
      "echo 'hello world'",

      // ファイル操作
      "cat file.txt",
      "grep 'pattern' file.txt",
      "find . -name '*.js'",
      "head file.txt",
      "tail file.txt",
      "wc file.txt",
      "sort file.txt",
      "cp file.txt /tmp/",
      "mkdir -p /tmp/test",
      "touch /tmp/file.txt",

      // Git
      "git status",
      "git diff",
      "git log",

      // 開発ツール
      "npm install",
      "npm run build",
      "pnpm install",
      "bun install",
      "node index.js",
      "python script.py",

      // データベース
      "psql -d database",
      "mysql -u user",
      "sqlite3 database.db",
      "mongo",

      // 安全なチェーンコマンド
      "npm install && npm run build",
      "source venv/bin/activate && python script.py",
      "cd /tmp && ls -la && pwd",

      // Docker 安全操作
      "docker ps",
      "docker ps -a",
      "docker logs my-container",
      "docker build -t myapp .",
      "docker run -d myapp",
      "docker exec -it myapp bash",

      // Prisma 安全操作
      "npx prisma generate",
      "npx prisma migrate dev",
      "npx prisma db push",
      "npx prisma studio",
    ];

    for (const command of safeCommands) {
      test(`許可: ${command}`, () => {
        const result = validateCommand(command);
        expect(result.isValid).toBe(true);
        expect(result.reason).toBe("");
      });
    }
  });

  describe("CRITICAL_PATTERNS → isValid: false, reason に 'Critical' を含む", () => {
    const criticalCommands = [
      ["rm -rf /", "rm -rf / with space"],
      ["rm -rf /  ", "rm -rf / with trailing space"],
      ["rm -rf ~//*", "rm -rf ~/* at end of line"],
      ["dd if=/dev/zero of=/dev/sda", "dd to physical disk /dev/sda"],
      ["dd if=/dev/zero of=/dev/hda", "dd to physical disk /dev/hda"],
    ];

    for (const [command, description] of criticalCommands) {
      test(`ブロック: ${description}`, () => {
        const result = validateCommand(command);
        expect(result.isValid).toBe(false);
        expect(result.reason).toContain("Critical");
      });
    }
  });

  describe("DANGEROUS_CHAINS → isValid: false, reason に 'Dangerous chain' を含む", () => {
    describe("パイプで危険なコマンドに渡す", () => {
      const pipeCommands = [
        "echo test | rm -f file.txt",
        "cat files.txt | sudo reboot",
        "ls | dd if=/dev/zero of=/tmp/test",
        "find . | shred -n 3 file",
      ];

      for (const command of pipeCommands) {
        test(`ブロック: ${command}`, () => {
          const result = validateCommand(command);
          expect(result.isValid).toBe(false);
          expect(result.reason).toContain("Dangerous chain");
        });
      }
    });

    describe("xargs で危険なコマンドを実行", () => {
      const xargsCommands = [
        "ls *.txt | xargs rm -f",
        "find . -name '*.tmp' | xargs sudo rm",
        "cat files.txt | xargs dd if=/dev/zero",
        "echo files | xargs shred",
      ];

      for (const command of xargsCommands) {
        test(`ブロック: ${command}`, () => {
          const result = validateCommand(command);
          expect(result.isValid).toBe(false);
          expect(result.reason).toContain("Dangerous chain");
        });
      }
    });

    describe("サブシェルでの危険な操作", () => {
      const subshellCommands = [
        "echo $(rm -rf /tmp/test)",
        "ls $(sudo reboot)",
        "cat $(dd if=/dev/zero of=/tmp/test)",
        "find $(shred file.txt)",
      ];

      for (const command of subshellCommands) {
        test(`ブロック: ${command}`, () => {
          const result = validateCommand(command);
          expect(result.isValid).toBe(false);
          expect(result.reason).toContain("Dangerous chain");
        });
      }
    });

    describe("バッククォートでの危険な操作", () => {
      const backtickCommands = [
        "echo `rm -rf /tmp/test`",
        "ls `sudo reboot`",
        "cat `dd if=/dev/zero of=/tmp/test`",
        "find `shred file.txt`",
      ];

      for (const command of backtickCommands) {
        test(`ブロック: ${command}`, () => {
          const result = validateCommand(command);
          expect(result.isValid).toBe(false);
          expect(result.reason).toContain("Dangerous chain");
        });
      }
    });

    describe("セミコロンで危険なコマンドをチェーン", () => {
      const semicolonCommands = [
        "ls; rm -rf /tmp/test",
        "pwd; sudo reboot",
        "date; dd if=/dev/zero of=/tmp/test",
        "echo test; shred file.txt",
      ];

      for (const command of semicolonCommands) {
        test(`ブロック: ${command}`, () => {
          const result = validateCommand(command);
          expect(result.isValid).toBe(false);
          expect(result.reason).toContain("Dangerous chain");
        });
      }
    });

    describe("&& で危険なコマンドをチェーン", () => {
      const andCommands = [
        "ls && rm -rf /tmp/test",
        "pwd && sudo reboot",
        "date && dd if=/dev/zero of=/tmp/test",
        "echo test && shred file.txt",
      ];

      for (const command of andCommands) {
        test(`ブロック: ${command}`, () => {
          const result = validateCommand(command);
          expect(result.isValid).toBe(false);
          expect(result.reason).toContain("Dangerous chain");
        });
      }
    });

    describe("|| で危険なコマンドをチェーン", () => {
      const orCommands = [
        "ls || rm -rf /tmp/test",
        "pwd || sudo reboot",
        "date || dd if=/dev/zero of=/tmp/test",
        "echo test || shred file.txt",
      ];

      for (const command of orCommands) {
        test(`ブロック: ${command}`, () => {
          const result = validateCommand(command);
          expect(result.isValid).toBe(false);
          expect(result.reason).toContain("Dangerous chain");
        });
      }
    });
  });

  describe("PROHIBITED_COMMANDS → isValid: false, severity: 'prohibited'", () => {
    describe("sed は禁止", () => {
      const sedCommands = [
        "sed 's/foo/bar/g' file.txt",
        "sed -i 's/old/new/g' file.txt",
        "cat file.txt | sed 's/foo/bar/'",
        "git add . && sed 's/foo/bar/' file.txt",
        "gsed 's/foo/bar/g' file.txt",
        "gsed -i 's/old/new/g' file.txt",
      ];

      for (const command of sedCommands) {
        test(`ブロック: ${command}`, () => {
          const result = validateCommand(command);
          expect(result.isValid).toBe(false);
          expect(result.severity).toBe("prohibited");
        });
      }
    });

    describe("awk は禁止", () => {
      const awkCommands = [
        "awk '{print $1}' file.txt",
        "awk -F',' '{print $2}' data.csv",
        "cat file.txt | awk '{print NR, $0}'",
        "gawk '{print $1}' file.txt",
      ];

      for (const command of awkCommands) {
        test(`ブロック: ${command}`, () => {
          const result = validateCommand(command);
          expect(result.isValid).toBe(false);
          expect(result.severity).toBe("prohibited");
        });
      }
    });

    describe("git add -A/--all/. は禁止", () => {
      const gitAddCommands = [
        ["git add -A", "git add -A"],
        ["git add --all", "git add --all"],
        ["git add .", "git add ."],
        ["git add . && git commit -m 'msg'", "git add . in chain"],
      ];

      for (const [command, description] of gitAddCommands) {
        test(`ブロック: ${description}`, () => {
          const result = validateCommand(command);
          expect(result.isValid).toBe(false);
          expect(result.severity).toBe("prohibited");
        });
      }
    });

    describe("誤検出なし（許可されるべきコマンド）", () => {
      const allowedCommands = [
        ["git add specific-file.ts", "個別ファイル指定は許可"],
        ["git add -u", "-u は tracked files のみで許可"],
        ["perl -pe 's/foo/bar/g' file.txt", "perl は sed の代替として許可"],
        ["perl -lane 'print $F[0]' file.txt", "perl は awk の代替として許可"],
        ["category_list", "awk の部分一致でない"],
        ["sed_like_variable=1", "sed の部分一致でない"],
        ["awkward", "awk の部分一致でない"],
        ["sediment", "sed の部分一致でない"],
      ];

      for (const [command, description] of allowedCommands) {
        test(`許可: ${description} (${command})`, () => {
          const result = validateCommand(command);
          expect(result.isValid).toBe(true);
        });
      }
    });
  });

  describe("境界値", () => {
    test("rm -rf /tmp/test → isValid: true（サブパスは対象外）", () => {
      const result = validateCommand("rm -rf /tmp/test");
      expect(result.isValid).toBe(true);
    });

    test("rm -rf ./node_modules → isValid: true（相対パス）", () => {
      const result = validateCommand("rm -rf ./node_modules");
      expect(result.isValid).toBe(true);
    });

    test("npm install && npm run build → isValid: true（安全なチェーン）", () => {
      const result = validateCommand("npm install && npm run build");
      expect(result.isValid).toBe(true);
    });

    test("ls | grep pattern → isValid: true（パイプだが危険コマンドではない）", () => {
      const result = validateCommand("ls | grep pattern");
      expect(result.isValid).toBe(true);
    });

    test("find . -name '*.js' | xargs cat → isValid: true（xargs だが危険コマンドではない）", () => {
      const result = validateCommand("find . -name '*.js' | xargs cat");
      expect(result.isValid).toBe(true);
    });
  });

  describe("WIDE_KILL_PATTERNS → wide pkill/killall on user apps", () => {
    describe("deny: pkill -f with user-visible app names", () => {
      const denyCommands = [
        [`pkill -f "Google Chrome"`, "quoted Google Chrome"],
        [`pkill -f Google Chrome`, "unquoted Google Chrome"],
        [`pkill -f "node"`, "quoted node (exact)"],
        [`pkill -f node`, "bare node"],
        [`pkill -f "python"`, "quoted python (exact)"],
        [`pkill -f python`, "bare python"],
        [`pkill -f "chrome"`, "bare chrome"],
        [`pkill -f "firefox"`, "bare firefox"],
        [`pkill -f "safari"`, "bare safari"],
        [`pkill -f "Slack"`, "Slack app"],
      ];

      for (const [command, description] of denyCommands) {
        test(`ブロック: ${description} (${command})`, () => {
          const result = validateCommand(command as string);
          expect(result.isValid).toBe(false);
          expect(result.severity).toBe("prohibited");
        });
      }
    });

    describe("deny: pkill -9 -f (signal before -f flag)", () => {
      const denyCommands = [
        [`pkill -9 -f "node"`, "pkill -9 -f node"],
        [`pkill -9 -f node`, "pkill -9 -f node unquoted"],
        [`pkill -KILL -f "Google Chrome"`, "pkill -KILL -f Google Chrome"],
        [`pkill --signal KILL -f chrome`, "pkill --signal KILL -f chrome"],
      ];

      for (const [command, description] of denyCommands) {
        test(`ブロック: ${description}`, () => {
          const result = validateCommand(command as string);
          expect(result.isValid).toBe(false);
          expect(result.severity).toBe("prohibited");
        });
      }
    });

    describe("deny: killall with user-visible app names", () => {
      const denyCommands = [
        [`killall Chrome`, "killall Chrome"],
        [`killall "Google Chrome"`, "killall quoted Google Chrome"],
        [`killall node`, "killall node"],
        [`killall python`, "killall python"],
        [`killall firefox`, "killall firefox"],
      ];

      for (const [command, description] of denyCommands) {
        test(`ブロック: ${description}`, () => {
          const result = validateCommand(command as string);
          expect(result.isValid).toBe(false);
          expect(result.severity).toBe("prohibited");
        });
      }
    });

    describe("allow: pkill -f with specific wrapper/script names", () => {
      const allowCommands = [
        [`pkill -f "chrome-devtools-mcp"`, "chrome-devtools-mcp wrapper"],
        [`pkill -f chrome-devtools-mcp`, "unquoted chrome-devtools-mcp"],
        [`pkill -f "node-server"`, "node-server wrapper"],
        [`pkill -f "python3.11-foo"`, "python3.11-foo wrapper"],
        [`pkill -9 -f "chrome-devtools-mcp"`, "pkill -9 -f chrome-devtools-mcp wrapper"],
        [`kill 12345`, "kill by PID"],
        [`kill -9 12345`, "kill -9 by PID"],
        [`kill -TERM 12345`, "kill -TERM by PID"],
      ];

      for (const [command, description] of allowCommands) {
        test(`許可: ${description} (${command})`, () => {
          const result = validateCommand(command as string);
          expect(result.isValid).toBe(true);
        });
      }
    });

    describe("deny: pkill -f python3 (should not early-return on python prefix)", () => {
      test("ブロック: pkill -f python3", () => {
        const result = validateCommand("pkill -f python3");
        expect(result.isValid).toBe(false);
        expect(result.severity).toBe("prohibited");
      });
    });

    describe("deny: killall with flags", () => {
      const denyCommands = [
        [`killall python3`, "killall python3"],
        [`killall -9 chrome`, "killall -9 chrome (signal flag)"],
        [`killall -KILL chrome`, "killall -KILL chrome (named signal)"],
        [`killall -- chrome`, "killall -- chrome (separator)"],
      ];

      for (const [command, description] of denyCommands) {
        test(`ブロック: ${description}`, () => {
          const result = validateCommand(command as string);
          expect(result.isValid).toBe(false);
          expect(result.severity).toBe("prohibited");
        });
      }
    });

    describe("deny: pkill combined short options with -f", () => {
      const denyCommands = [
        [`pkill -fx chrome`, "pkill -fx chrome (combined)"],
        [`pkill -xf chrome`, "pkill -xf chrome (reversed)"],
      ];

      for (const [command, description] of denyCommands) {
        test(`ブロック: ${description}`, () => {
          const result = validateCommand(command as string);
          expect(result.isValid).toBe(false);
          expect(result.severity).toBe("prohibited");
        });
      }
    });

    describe("Fix 1-1: deny: pkill combined short flags + quoted pattern", () => {
      const denyCommands = [
        [`pkill -fx "node"`, "pkill -fx quoted node"],
        [`pkill -xf "Google Chrome"`, "pkill -xf quoted Google Chrome"],
        [`pkill -fx "chrome"`, "pkill -fx quoted chrome"],
      ];

      for (const [command, description] of denyCommands) {
        test(`ブロック: ${description}`, () => {
          const result = validateCommand(command as string);
          expect(result.isValid).toBe(false);
          expect(result.severity).toBe("prohibited");
        });
      }
    });

    describe("Fix 1-3: deny: pkill with option-with-arg before -f", () => {
      const denyCommands = [
        [`pkill -u alice -f chrome`, "pkill -u alice -f chrome"],
        [`pkill -G admin -f node`, "pkill -G admin -f node"],
        [`pkill -U root -f python`, "pkill -U root -f python"],
        [`pkill --user=alice -f chrome`, "pkill --user=alice -f chrome"],
      ];

      for (const [command, description] of denyCommands) {
        test(`ブロック: ${description}`, () => {
          const result = validateCommand(command as string);
          expect(result.isValid).toBe(false);
          expect(result.severity).toBe("prohibited");
        });
      }

      const allowCommands = [
        [
          `pkill -u alice -f chrome-devtools-mcp`,
          "pkill -u alice -f chrome-devtools-mcp (wrapper)",
        ],
      ];

      for (const [command, description] of allowCommands) {
        test(`許可: ${description}`, () => {
          const result = validateCommand(command as string);
          expect(result.isValid).toBe(true);
        });
      }
    });

    describe("Fix 1-2: deny: killall with option-with-arg before process name", () => {
      const denyCommands = [
        [`killall -u alice chrome`, "killall -u alice chrome"],
        [`killall -s KILL chrome`, "killall -s KILL chrome"],
        [`killall --user alice chrome`, "killall --user alice chrome"],
        [`killall --signal=KILL chrome`, "killall --signal=KILL chrome"],
        [`killall --signal KILL chrome`, "killall --signal KILL chrome"],
      ];

      for (const [command, description] of denyCommands) {
        test(`ブロック: ${description}`, () => {
          const result = validateCommand(command as string);
          expect(result.isValid).toBe(false);
          expect(result.severity).toBe("prohibited");
        });
      }
    });

    describe("Fix #1 round5: pkill -n is standalone selector (no-arg), not option-with-arg", () => {
      const denyCommands = [
        [`pkill -n -f chrome`, "pkill -n -f chrome (newest selector + wide pattern)"],
        [`pkill -n -f node`, "pkill -n -f node"],
        [`pkill --newest -f chrome`, "pkill --newest -f chrome"],
        [`pkill -n -u alice -f chrome`, "pkill -n -u alice -f chrome"],
      ];

      for (const [command, description] of denyCommands) {
        test(`ブロック: ${description}`, () => {
          const result = validateCommand(command as string);
          expect(result.isValid).toBe(false);
          expect(result.severity).toBe("prohibited");
        });
      }

      const allowCommands = [
        [`pkill -n -f myspecificdaemon`, "pkill -n -f myspecificdaemon (not wide-kill)"],
      ];

      for (const [command, description] of allowCommands) {
        test(`許可: ${description}`, () => {
          const result = validateCommand(command as string);
          expect(result.isValid).toBe(true);
        });
      }
    });

    describe("Fix #2 round5: shellTokenize handles backslash-escaped space as one token", () => {
      test(`ブロック: pkill -f Google\\ Chrome`, () => {
        const result = validateCommand(`pkill -f Google\\ Chrome`);
        expect(result.isValid).toBe(false);
        expect(result.severity).toBe("prohibited");
      });

      test(`許可: pkill -f my\\ specific\\ daemon (not a wide-kill app)`, () => {
        const result = validateCommand(`pkill -f my\\ specific\\ daemon`);
        expect(result.isValid).toBe(true);
      });
    });
  });
});
