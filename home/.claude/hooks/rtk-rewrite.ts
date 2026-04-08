#!/usr/bin/env bun
export {};

/**
 * RTK auto-rewrite hook (PreToolUse:Bash)
 *
 * Bash コマンドを rtk 等価コマンドに透過的に書き換える。
 * 書き換えが発生した場合のみ JSON を stdout に出力する。
 * 書き換え不要の場合は exit 0 で無音終了する。
 *
 * 入力 (stdin, JSON):
 *   { "tool_name": "Bash", "tool_input": { "command": "git status" } }
 *
 * 出力 (stdout, JSON) — 書き換え時のみ:
 *   {
 *     "hookSpecificOutput": {
 *       "hookEventName": "PreToolUse",
 *       "permissionDecision": "allow",
 *       "permissionDecisionReason": "RTK auto-rewrite",
 *       "updatedInput": { "command": "rtk git status" }
 *     }
 *   }
 */

/**
 * 1 つの書き換えルール。
 * match が MATCH_CMD にマッチした場合に rewrite を呼び出す。
 * rewrite が null を返した場合はスキップ扱い（次のルールへ）。
 */
interface RewriteRule {
  match: RegExp;
  rewrite: (cmd: string, envPrefix: string) => string | null;
}

// ---------------------------------------------------------------------------
// ヘルパー: 先頭トークンを取り出すための flag stripping
// ---------------------------------------------------------------------------

/**
 * コマンド文字列から git/docker/kubectl 等の先頭フラグを除去してサブコマンドを得る。
 * @param cmd        元のコマンド文字列（ツール名を除いた部分）
 * @param valued     除去する値付きフラグのパターン（例: `/(-C|-c)\s+\S+\s*​/g`）
 * @param standalone 除去する単独フラグのパターン（例: `/--(no-pager|bare)\s*​/g`）
 */
function stripFlags(cmd: string, valued: RegExp, standalone?: RegExp): string {
  let s = cmd.replace(valued, "");
  if (standalone) s = s.replace(standalone, "");
  return s.replace(/--[a-z-]+=\S+\s*/g, "").replace(/^\s+/, "");
}

/**
 * 文字列がサブコマンドリストのいずれかで始まるか確認する。
 */
function startsWithSubcmd(s: string, subcmds: string[]): boolean {
  return subcmds.some((sub) => s === sub || s.startsWith(sub + " "));
}

// ---------------------------------------------------------------------------
// 書き換えルール定義
// ---------------------------------------------------------------------------

const RULES: RewriteRule[] = [
  // --- Git ---
  {
    match: /^git\s/,
    rewrite: (cmd, envPrefix) => {
      const body = cmd.replace(/^git\s+/, "");
      const stripped = stripFlags(
        body,
        /(-C|-c)\s+\S+\s*/g,
        /--(no-pager|no-optional-locks|bare|literal-pathspecs)\s*/g,
      );
      const subcmds = [
        "status",
        "diff",
        "log",
        "add",
        "commit",
        "push",
        "pull",
        "branch",
        "fetch",
        "stash",
        "show",
      ];
      if (startsWithSubcmd(stripped, subcmds)) {
        return `${envPrefix}rtk ${cmd}`;
      }
      return null;
    },
  },

  // --- GitHub CLI ---
  {
    match: /^gh\s+(pr|issue|run|api|release)(\s|$)/,
    rewrite: (cmd, envPrefix) => `${envPrefix}rtk ${cmd}`,
  },

  // --- Cargo ---
  {
    match: /^cargo\s/,
    rewrite: (cmd, envPrefix) => {
      // strip optional +toolchain
      const body = cmd.replace(/^cargo\s+(\+\S+\s+)?/, "");
      const subcmds = ["test", "build", "clippy", "check", "install", "fmt"];
      if (startsWithSubcmd(body, subcmds)) {
        return `${envPrefix}rtk ${cmd}`;
      }
      return null;
    },
  },

  // --- File ops: cat ---
  {
    match: /^cat\s+/,
    rewrite: (cmd, envPrefix) => `${envPrefix}rtk read ${cmd.replace(/^cat\s+/, "")}`,
  },

  // --- File ops: rg / grep ---
  {
    match: /^(rg|grep)\s+/,
    rewrite: (cmd, envPrefix) => `${envPrefix}rtk grep ${cmd.replace(/^(rg|grep)\s+/, "")}`,
  },

  // --- File ops: ls ---
  {
    match: /^ls(\s|$)/,
    rewrite: (cmd, envPrefix) => `${envPrefix}rtk ${cmd}`,
  },

  // --- File ops: tree ---
  {
    match: /^tree(\s|$)/,
    rewrite: (cmd, envPrefix) => `${envPrefix}rtk ${cmd}`,
  },

  // --- File ops: find ---
  {
    match: /^find\s+/,
    rewrite: (cmd, envPrefix) => `${envPrefix}rtk find ${cmd.replace(/^find\s+/, "")}`,
  },

  // --- File ops: diff ---
  {
    match: /^diff\s+/,
    rewrite: (cmd, envPrefix) => `${envPrefix}rtk diff ${cmd.replace(/^diff\s+/, "")}`,
  },

  // --- File ops: head -N file ---
  {
    match: /^head\s+-(\d+)\s+(.+)$/,
    rewrite: (cmd, envPrefix) => {
      const m = cmd.match(/^head\s+-(\d+)\s+(.+)$/);
      if (!m) return null;
      return `${envPrefix}rtk read ${m[2]} --max-lines ${m[1]}`;
    },
  },

  // --- File ops: head --lines=N file ---
  {
    match: /^head\s+--lines=(\d+)\s+(.+)$/,
    rewrite: (cmd, envPrefix) => {
      const m = cmd.match(/^head\s+--lines=(\d+)\s+(.+)$/);
      if (!m) return null;
      return `${envPrefix}rtk read ${m[2]} --max-lines ${m[1]}`;
    },
  },

  // --- JS/TS: vitest (pnpm/npx prefix variants) ---
  {
    match: /^(pnpm\s+)?(npx\s+)?vitest(\s|$)/,
    rewrite: (cmd, envPrefix) => {
      const rest = cmd.replace(/^(pnpm\s+)?(npx\s+)?vitest(\s+run)?/, "").trimStart();
      return `${envPrefix}rtk vitest run${rest ? " " + rest : ""}`;
    },
  },

  // --- JS/TS: pnpm test ---
  {
    match: /^pnpm\s+test(\s|$)/,
    rewrite: (cmd, envPrefix) => {
      const rest = cmd.replace(/^pnpm\s+test/, "").trimStart();
      return `${envPrefix}rtk vitest run${rest ? " " + rest : ""}`;
    },
  },

  // --- JS/TS: npm test ---
  {
    match: /^npm\s+test(\s|$)/,
    rewrite: (cmd, envPrefix) => `${envPrefix}rtk npm test${cmd.replace(/^npm\s+test/, "")}`,
  },

  // --- JS/TS: npm run ---
  {
    match: /^npm\s+run\s+/,
    rewrite: (cmd, envPrefix) => `${envPrefix}rtk npm ${cmd.replace(/^npm\s+run\s+/, "")}`,
  },

  // --- JS/TS: vue-tsc ---
  {
    match: /^(npx\s+)?vue-tsc(\s|$)/,
    rewrite: (cmd, envPrefix) => `${envPrefix}rtk tsc${cmd.replace(/^(npx\s+)?vue-tsc/, "")}`,
  },

  // --- JS/TS: pnpm tsc ---
  {
    match: /^pnpm\s+tsc(\s|$)/,
    rewrite: (cmd, envPrefix) => `${envPrefix}rtk tsc${cmd.replace(/^pnpm\s+tsc/, "")}`,
  },

  // --- JS/TS: tsc (npx prefix) ---
  {
    match: /^(npx\s+)?tsc(\s|$)/,
    rewrite: (cmd, envPrefix) => `${envPrefix}rtk tsc${cmd.replace(/^(npx\s+)?tsc/, "")}`,
  },

  // --- JS/TS: pnpm lint ---
  {
    match: /^pnpm\s+lint(\s|$)/,
    rewrite: (cmd, envPrefix) => `${envPrefix}rtk lint${cmd.replace(/^pnpm\s+lint/, "")}`,
  },

  // --- JS/TS: eslint ---
  {
    match: /^(npx\s+)?eslint(\s|$)/,
    rewrite: (cmd, envPrefix) => `${envPrefix}rtk lint${cmd.replace(/^(npx\s+)?eslint/, "")}`,
  },

  // --- JS/TS: prettier ---
  {
    match: /^(npx\s+)?prettier(\s|$)/,
    rewrite: (cmd, envPrefix) => `${envPrefix}rtk prettier${cmd.replace(/^(npx\s+)?prettier/, "")}`,
  },

  // --- JS/TS: playwright (npx prefix) ---
  {
    match: /^(npx\s+)?playwright(\s|$)/,
    rewrite: (cmd, envPrefix) =>
      `${envPrefix}rtk playwright${cmd.replace(/^(npx\s+)?playwright/, "")}`,
  },

  // --- JS/TS: pnpm playwright ---
  {
    match: /^pnpm\s+playwright(\s|$)/,
    rewrite: (cmd, envPrefix) =>
      `${envPrefix}rtk playwright${cmd.replace(/^pnpm\s+playwright/, "")}`,
  },

  // --- JS/TS: prisma ---
  {
    match: /^(npx\s+)?prisma(\s|$)/,
    rewrite: (cmd, envPrefix) => `${envPrefix}rtk prisma${cmd.replace(/^(npx\s+)?prisma/, "")}`,
  },

  // --- Containers: docker compose (優先チェック) ---
  {
    match: /^docker\s+compose(\s|$)/,
    rewrite: (cmd, envPrefix) => `${envPrefix}rtk ${cmd}`,
  },

  // --- Containers: docker (サブコマンドフィルタ付き) ---
  {
    match: /^docker\s/,
    rewrite: (cmd, envPrefix) => {
      const body = cmd.replace(/^docker\s+/, "");
      const stripped = stripFlags(body, /(-H|--context|--config)\s+\S+\s*/g);
      const subcmds = ["ps", "images", "logs", "run", "build", "exec"];
      if (startsWithSubcmd(stripped, subcmds)) {
        return `${envPrefix}rtk ${cmd}`;
      }
      return null;
    },
  },

  // --- Containers: kubectl ---
  {
    match: /^kubectl\s/,
    rewrite: (cmd, envPrefix) => {
      const body = cmd.replace(/^kubectl\s+/, "");
      const stripped = stripFlags(body, /(--context|--kubeconfig|--namespace|-n)\s+\S+\s*/g);
      const subcmds = ["get", "logs", "describe", "apply"];
      if (startsWithSubcmd(stripped, subcmds)) {
        return `${envPrefix}rtk ${cmd}`;
      }
      return null;
    },
  },

  // --- pnpm package management ---
  {
    match: /^pnpm\s+(list|ls|outdated)(\s|$)/,
    rewrite: (cmd, envPrefix) => `${envPrefix}rtk ${cmd}`,
  },

  // --- Python: pytest ---
  {
    match: /^pytest(\s|$)/,
    rewrite: (cmd, envPrefix) => `${envPrefix}rtk pytest${cmd.replace(/^pytest/, "")}`,
  },

  // --- Python: python -m pytest ---
  {
    match: /^python\s+-m\s+pytest(\s|$)/,
    rewrite: (cmd, envPrefix) =>
      `${envPrefix}rtk pytest${cmd.replace(/^python\s+-m\s+pytest/, "")}`,
  },

  // --- Python: ruff ---
  {
    match: /^ruff\s+(check|format)(\s|$)/,
    rewrite: (cmd, envPrefix) => `${envPrefix}rtk ruff ${cmd.replace(/^ruff\s+/, "")}`,
  },

  // --- Python: pip ---
  {
    match: /^pip\s+(list|outdated|install|show)(\s|$)/,
    rewrite: (cmd, envPrefix) => `${envPrefix}rtk pip ${cmd.replace(/^pip\s+/, "")}`,
  },

  // --- Python: uv pip ---
  {
    match: /^uv\s+pip\s+(list|outdated|install|show)(\s|$)/,
    rewrite: (cmd, envPrefix) => `${envPrefix}rtk pip ${cmd.replace(/^uv\s+pip\s+/, "")}`,
  },

  // --- Go: go test ---
  {
    match: /^go\s+test(\s|$)/,
    rewrite: (cmd, envPrefix) => `${envPrefix}rtk go test${cmd.replace(/^go\s+test/, "")}`,
  },

  // --- Go: go build ---
  {
    match: /^go\s+build(\s|$)/,
    rewrite: (cmd, envPrefix) => `${envPrefix}rtk go build${cmd.replace(/^go\s+build/, "")}`,
  },

  // --- Go: go vet ---
  {
    match: /^go\s+vet(\s|$)/,
    rewrite: (cmd, envPrefix) => `${envPrefix}rtk go vet${cmd.replace(/^go\s+vet/, "")}`,
  },

  // --- Go: golangci-lint ---
  {
    match: /^golangci-lint(\s|$)/,
    rewrite: (cmd, envPrefix) =>
      `${envPrefix}rtk golangci-lint${cmd.replace(/^golangci-lint/, "")}`,
  },
];

// ---------------------------------------------------------------------------
// メイン処理
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  // 依存ツールの確認
  if (!(await Bun.which("rtk")) || !(await Bun.which("jq"))) {
    process.exit(0);
  }

  // stdin から JSON を読み込む
  const raw = await new Response(Bun.stdin.stream()).text();
  if (!raw.trim()) {
    process.exit(0);
  }

  let input: Record<string, unknown>;
  try {
    input = JSON.parse(raw);
  } catch {
    process.exit(0);
  }

  const toolInput = input["tool_input"] as Record<string, unknown> | undefined;
  const cmd = toolInput?.["command"];
  if (typeof cmd !== "string" || !cmd) {
    process.exit(0);
  }

  // Skip: 既に rtk を使用している
  if (/^rtk\s/.test(cmd) || /\/rtk\s/.test(cmd)) {
    process.exit(0);
  }

  // Skip: heredoc を含む
  if (cmd.includes("<<")) {
    process.exit(0);
  }

  // 先頭の環境変数プレフィックスを抽出する
  // 例: "TEST_SESSION_ID=2 npx playwright test" → envPrefix="TEST_SESSION_ID=2 ", matchCmd="npx playwright test"
  const envPrefixMatch = cmd.match(/^([A-Za-z_][A-Za-z0-9_]*=[^ ]* +)+/);
  const envPrefix = envPrefixMatch ? envPrefixMatch[0] : "";
  const matchCmd = cmd.slice(envPrefix.length);

  // ルールを順番に試す
  let rewritten: string | null = null;
  for (const rule of RULES) {
    if (rule.match.test(matchCmd)) {
      rewritten = rule.rewrite(matchCmd, envPrefix);
      if (rewritten !== null) {
        break;
      }
    }
  }

  // 書き換えなし → 無音終了
  if (rewritten === null) {
    process.exit(0);
  }

  // updatedInput: 元の tool_input フィールドをすべて保持しつつ command だけ差し替える
  const updatedInput = { ...toolInput, command: rewritten };

  const output = {
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "allow",
      permissionDecisionReason: "RTK auto-rewrite",
      updatedInput,
    },
  };

  process.stdout.write(JSON.stringify(output) + "\n");
  process.exit(0);
}

main().catch(() => {
  process.exit(0);
});
