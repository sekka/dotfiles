# CLI Tools × Skill Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Install 6 CLI tools and integrate them into existing skills/hooks to strengthen code quality, security, and document workflows.

**Architecture:** Tools are managed by Nix (`nix/hosts/common.nix`) or mise (`home/config/mise/config.toml`) — never npm global or Homebrew for new CLI additions. Tools are wired into existing skills (user-dev-preflight, user-dev-review) as opt-in phases and into a new PostToolUse hook for mermaid validation.

**Tech Stack:** Nix/nix-darwin (semgrep, mermaid-cli), mise npm backend (type-coverage, textlint), Bun (hooks + tests), Markdown (SKILL.md)

**Installation summary:**

| Tool                    | Already installed? | Manager | Package name                                                     |
| ----------------------- | ------------------ | ------- | ---------------------------------------------------------------- |
| semgrep                 | No                 | Nix     | `semgrep`                                                        |
| mermaid-cli (mmdc)      | No                 | Nix     | `mermaid-cli`                                                    |
| type-coverage           | No                 | mise    | `npm:type-coverage`                                              |
| textlint                | No                 | mise    | `npm:textlint` + `npm:textlint-rule-preset-ja-technical-writing` |
| ncu (npm-check-updates) | **Yes**            | mise    | `npm:npm-check-updates`                                          |
| knip                    | **Yes**            | mise    | `npm:knip`                                                       |

---

## Risks

1. **semgrep `--config=auto` requires internet and may need auth** — recent versions (2024+) may require `semgrep login` on first run. Mitigation: mark as SKIP if semgrep exits non-zero, not just if it's missing.
2. **mermaid-cli (mmdc) uses puppeteer** — validation failures may be noisy on first run (Chromium sandbox issues). Mitigation: hook is `async: true` and exits 0 on all errors (non-fatal).
3. **Nix rebuild takes time** — `darwin-rebuild switch` can take several minutes. Not a blocker, just a time cost.

---

## File Map

| Action | File                                                    | Responsibility                                    |
| ------ | ------------------------------------------------------- | ------------------------------------------------- |
| Modify | `nix/hosts/common.nix`                                  | Add semgrep, mermaid-cli                          |
| Modify | `home/config/mise/config.toml`                          | Add type-coverage, textlint, textlint-rule-preset |
| Modify | `home/.claude/skills/user-dev-preflight/SKILL.md`       | Add textlint, ncu, type-coverage, semgrep phases  |
| Modify | `home/.claude/skills/user-dev-review/SKILL.md`          | Add hotspot analysis + semgrep to security        |
| Create | `home/.claude/hooks/mermaid-validate.ts`                | PostToolUse hook for mermaid syntax validation    |
| Create | `home/.claude/hooks/__tests__/mermaid-validate.test.ts` | Unit tests for mermaid-validate.ts                |
| Modify | `home/.claude/settings.json`                            | Register mermaid-validate hook                    |

---

## Task 1: Add semgrep and mermaid-cli to Nix

**Files:**

- Modify: `nix/hosts/common.nix`

- [ ] **Step 1: Find the lint/analysis tools section**

```bash
grep -n "shellcheck\|yamllint\|pre-commit" ~/dotfiles/nix/hosts/common.nix
```

Expected: lines near the shellcheck entry (around line 60).

- [ ] **Step 2: Add semgrep and mermaid-cli after shellcheck**

In `nix/hosts/common.nix`, find:

```
shellcheck      # https://github.com/koalaman/shellcheck      # シェルスクリプトリンター
```

Add two lines immediately after it:

```nix
semgrep         # https://github.com/semgrep/semgrep         # 静的解析・セキュリティスキャン
mermaid-cli  # https://github.com/mermaid-js/mermaid-cli  # Mermaid構文検証・SVG生成
```

- [ ] **Step 3: Apply Nix configuration**

```bash
cd ~/dotfiles/nix && darwin-rebuild switch --flake .
```

This will take a few minutes. Expected: ends with `darwin-rebuild switch: done`.

- [ ] **Step 4: Verify**

```bash
semgrep --version
mmdc --version
```

Both should print version strings without error.

- [ ] **Step 5: Commit**

```bash
git add nix/hosts/common.nix
git commit -m "chore: semgrep と mermaid-cli を Nix パッケージに追加"
```

---

## Task 2: Add type-coverage and textlint to mise

**Files:**

- Modify: `home/config/mise/config.toml`

Note: `npm:npm-check-updates` and `npm:knip` are already present in mise — no action needed for those.

- [ ] **Step 1: Find the Lint/Format section in mise config**

```bash
grep -n "# --- Lint / Format ---" ~/dotfiles/home/config/mise/config.toml
```

Expected: around line 574.

- [ ] **Step 2: Add type-coverage and textlint to the Lint/Format section**

Find this block (around line 574–578):

```toml
# --- Lint / Format ---
"npm:knip" = "latest" # 未使用コード / 依存 / export 検出
"npm:markdownlint-cli" = "latest" # Markdown リンター
"npm:oxfmt" = "latest" # Oxc Formatter
"npm:oxlint" = "latest" # Oxc Linter
```

Add three lines at the end of that section:

```toml
"npm:type-coverage" = "latest" # TypeScript any型カバレッジ計測
"npm:textlint" = "latest" # Markdownテキストリンター
"npm:textlint-rule-preset-ja-technical-writing" = "latest" # 日本語技術文書ルール
```

- [ ] **Step 3: Install new tools**

```bash
mise install
```

Expected: downloads and installs the three new packages. Already-installed packages are skipped.

- [ ] **Step 4: Verify**

```bash
type-coverage --version
textlint --version
ncu --version
```

All three should print version strings. (`ncu` verifies the existing install still works.)

- [ ] **Step 5: Commit**

```bash
git add home/config/mise/config.toml
git commit -m "chore: type-coverage と textlint を mise に追加"
```

---

## Task 3: Enhance user-dev-preflight

**Files:**

- Modify: `home/.claude/skills/user-dev-preflight/SKILL.md`

Four additions: (A) textlint phase, (B) ncu phase, (C) type-coverage in Phase 3, (D) semgrep in Phase 5, (E) update result table.

- [ ] **Step 1: Add Phase 2.6 (textlint) after the existing Phase 2.5 (knip)**

Find the block ending with:

```
If no knip config is detected, record as SKIP.
```

Insert immediately after it:

```markdown
## Phase 2.6: Text Lint (opt-in)

Run only when a textlint config is present: `.textlintrc`, `.textlintrc.json`, `.textlintrc.yaml`, or a `textlint` key in `package.json`.

- Command: `textlint --format compact $(git diff --cached --name-only | grep '\.md$')`
- If no staged markdown files, run on all `.md` files: `textlint --format compact "**/*.md"`
- Report findings as WARNING (never block)
- Fixing prose style is always a manual decision

If no textlint config is detected, record as SKIP.
```

- [ ] **Step 2: Add Phase 2.7 (ncu) after Phase 2.6**

Insert immediately after the textlint block:

```markdown
## Phase 2.7: Dependency Updates Check (opt-in)

Run only when `package.json` exists in the project root.

- Command: `ncu --format group --errorLevel 0`
- Report available updates as INFO (never block, never auto-update)
- Major version bumps are listed separately in `--format group` output

If no `package.json` is found, record as SKIP.
```

- [ ] **Step 3: Enhance Phase 3 (Type Check) to include type-coverage**

Find the entire Phase 3 section starting with `## Phase 3: Type Check`. Replace it with:

```markdown
## Phase 3: Type Check

Run the type checker if one exists.

| Language   | Command             |
| ---------- | ------------------- |
| TypeScript | `tsc --noEmit`      |
| Python     | `pyright` or `mypy` |

If a TypeScript project is detected (`tsconfig.json` exists) and `type-coverage` is installed, run an additional coverage check after tsc:

- Command: `type-coverage --detail --ignore-catch`
- Report the coverage percentage as INFO (e.g., "type coverage: 94.2%")
- Do not block on any coverage level — report only

If none is found, record as SKIP.
```

- [ ] **Step 4: Rename Phase 5 to "Security Scan" and add semgrep**

Find `## Phase 5: Secret Scan` and replace the entire Phase 5 section with:

````markdown
## Phase 5: Security Scan

### 5a: Secret Detection

Use Grep to check that staged files do not contain the following.

```bash
git diff --cached
```
````

Patterns to check:

- Staging of `.env` files
- Keywords such as `API_KEY`, `SECRET`, `TOKEN`, `PASSWORD` (in assignment form)
- Private key files (`-----BEGIN`, `.pem`, `.key`)

Report detections as WARNING (do not block). If any detections are found, set Status to `DONE_WITH_CONCERNS` in Phase 7.

### 5b: Semgrep Scan (opt-in)

Run only when `semgrep` is installed. Use `--config=auto` (requires internet + may need `semgrep login` on first use).

- Build the changed files list: `git diff --cached --name-only`
- Command: `semgrep --config=auto --quiet --error <changed files>`
- If semgrep exits non-zero for any reason (not installed, auth required, network unavailable), record as SKIP

````
- [ ] **Step 5: Update the Phase 7 result table**

Find the result table in Phase 7 and replace it with:

```markdown
| Check | Result |
|---------|------|
| lint/format | PASS / FAIL / SKIP |
| textlint | PASS / WARNING(n items) / SKIP |
| Dead code (knip) | PASS / WARNING(n items) / SKIP |
| Dependency updates (ncu) | N updates available / UP TO DATE / SKIP |
| Type check | PASS / FAIL / SKIP |
| Type coverage | N% / SKIP |
| Change review | OK / WARNING(n items) |
| Security scan | OK / WARNING(n items) / SKIP |
````

- [ ] **Step 6: Verify phase structure**

```bash
grep "^## Phase" ~/dotfiles/home/.claude/skills/user-dev-preflight/SKILL.md
```

Expected output (in order):

```
## Phase 1: Detect Changes
## Phase 2: lint/format Check
## Phase 2.5: Dead Code Check (opt-in)
## Phase 2.6: Text Lint (opt-in)
## Phase 2.7: Dependency Updates Check (opt-in)
## Phase 3: Type Check
## Phase 4: Change Review (lightweight)
## Phase 5: Security Scan
## Phase 6: Commit Message Draft
## Phase 7: Result Summary
```

- [ ] **Step 7: Commit**

```bash
git add home/.claude/skills/user-dev-preflight/SKILL.md
git commit -m "feat: user-dev-preflight に textlint/ncu/type-coverage/semgrep フェーズを追加"
```

---

## Task 4: Enhance user-dev-review

**Files:**

- Modify: `home/.claude/skills/user-dev-review/SKILL.md`

Two additions: (A) Phase 1.5 hotspot analysis, (B) semgrep in security check.

- [ ] **Step 1: Add Phase 1.5 (Hotspot Analysis) between Phase 1 and Phase 2**

Find `## Phase 2: Review` and insert immediately before it:

````markdown
## Phase 1.5: Hotspot Analysis (optional)

Run when 3 or more files are in scope and the project is a git repository. Skip for single-file reviews.

For each file in scope, measure commit frequency:

```bash
git log --oneline --follow -- <file> | wc -l
```
````

Build a churn table and include it in the Phase 3 report:

| File         | Commits | Churn  |
| ------------ | ------- | ------ |
| src/app.ts   | 42      | HIGH   |
| src/utils.ts | 8       | NORMAL |

Churn levels: **HIGH** (>20 commits), **NORMAL** (5–20), **LOW** (<5)

HIGH-churn files receive extra scrutiny in Phase 2 — focus the security and correctness checks there first.

```
- [ ] **Step 2: Add semgrep to Phase 2 Security check**

Find:
```

#### Security

- Injection (SQL, command, XSS)

`````
Replace with:
````markdown
#### Security
- If `semgrep` is installed: run `semgrep --config=auto --quiet <files>` as a first-pass scanner; skip if semgrep exits non-zero
- Injection (SQL, command, XSS)
- Hardcoded credentials or API keys
- Unsafe input handling
- Missing authentication or authorization
`````

- [ ] **Step 3: Verify phase structure**

```bash
grep "^## Phase" ~/dotfiles/home/.claude/skills/user-dev-review/SKILL.md
```

Expected output (in order):

```
## Phase 1: Identify Target
## Phase 1.5: Hotspot Analysis (optional)
## Phase 2: Review
## Phase 3: Report Results
## Phase 4: Fix
## Phase 5: Re-verify Loop
```

- [ ] **Step 4: Commit**

```bash
git add home/.claude/skills/user-dev-review/SKILL.md
git commit -m "feat: user-dev-review にホットスポット分析と semgrep セキュリティスキャンを追加"
```

---

## Task 5: Create mermaid-validate hook (with exported functions for testing)

**Files:**

- Create: `home/.claude/hooks/mermaid-validate.ts`

The hook exports `isMdFile` and `extractMermaidBlocks` so they can be unit-tested.

- [ ] **Step 1: Create the hook file**

Create `home/.claude/hooks/mermaid-validate.ts`:

````typescript
#!/usr/bin/env bun
export {};

import { readFileSync, writeFileSync, unlinkSync } from "node:fs";
import { extname, join } from "node:path";
import { tmpdir } from "node:os";

export function isMdFile(filePath: string): boolean {
  return extname(filePath).toLowerCase() === ".md";
}

export function extractMermaidBlocks(content: string): string[] {
  return [...content.matchAll(/```mermaid\n([\s\S]*?)```/g)].map(
    ([, block]) => block.trim()
  );
}

async function main() {
  try {
    const stdinText = await Bun.stdin.text();
    if (!stdinText) process.exit(0);

    const input = JSON.parse(stdinText);
    const filePath: string | undefined = input.tool_input?.file_path;

    if (!filePath) process.exit(0);
    if (!isMdFile(filePath)) process.exit(0);

    const content = readFileSync(filePath, "utf-8");
    const blocks = extractMermaidBlocks(content);
    if (blocks.length === 0) process.exit(0);

    for (const block of blocks) {
      const ts = Date.now();
      const tmpIn = join(tmpdir(), `mermaid-${ts}.mmd`);
      const tmpOut = join(tmpdir(), `mermaid-${ts}.svg`);

      writeFileSync(tmpIn, block);

      const proc = Bun.spawnSync({
        cmd: ["mmdc", "-i", tmpIn, "-o", tmpOut, "-q"],
        stdout: "ignore",
        stderr: "pipe",
      });

      try { unlinkSync(tmpIn); } catch {}
      try { unlinkSync(tmpOut); } catch {}

      if (proc.exitCode !== 0) {
        const stderr = new TextDecoder().decode(proc.stderr);
        console.error(`[mermaid-validate] Syntax error in ${filePath}:\n${stderr.slice(0, 300)}`);
      }
    }
  } catch {
    // Non-fatal — never block editing
    process.exit(0);
  }
}

if (import.meta.main) {
  await main();
}
````

- [ ] **Step 2: Type-check the hook**

```bash
bun check ~/dotfiles/home/.claude/hooks/mermaid-validate.ts
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add home/.claude/hooks/mermaid-validate.ts
git commit -m "feat: mermaid 構文自動検証フック mermaid-validate.ts を追加"
```

---

## Task 6: Write unit tests for mermaid-validate

**Files:**

- Create: `home/.claude/hooks/__tests__/mermaid-validate.test.ts`

- [ ] **Step 1: Create the test file**

Create `home/.claude/hooks/__tests__/mermaid-validate.test.ts`:

````typescript
import { describe, expect, test } from "bun:test";
import { isMdFile, extractMermaidBlocks } from "../mermaid-validate";

describe("isMdFile", () => {
  test(".md ファイルは true を返す", () => {
    expect(isMdFile("README.md")).toBe(true);
    expect(isMdFile("path/to/doc.md")).toBe(true);
    expect(isMdFile("SKILL.md")).toBe(true);
  });

  test("大文字拡張子も true を返す", () => {
    expect(isMdFile("README.MD")).toBe(true);
  });

  test(".md 以外は false を返す", () => {
    expect(isMdFile("script.ts")).toBe(false);
    expect(isMdFile("image.png")).toBe(false);
    expect(isMdFile("Makefile")).toBe(false);
    expect(isMdFile(".gitignore")).toBe(false);
    expect(isMdFile("data.json")).toBe(false);
  });

  test("拡張子なしは false を返す", () => {
    expect(isMdFile("no-extension")).toBe(false);
  });
});

describe("extractMermaidBlocks", () => {
  test("単一の mermaid ブロックを抽出する", () => {
    const content = `# doc\n\`\`\`mermaid\ngraph TD\n  A --> B\n\`\`\`\ntext`;
    expect(extractMermaidBlocks(content)).toEqual(["graph TD\n  A --> B"]);
  });

  test("複数の mermaid ブロックを抽出する", () => {
    const content = [
      "```mermaid",
      "graph TD",
      "  A --> B",
      "```",
      "```mermaid",
      "sequenceDiagram",
      "  Alice->>Bob: Hello",
      "```",
    ].join("\n");
    const blocks = extractMermaidBlocks(content);
    expect(blocks).toHaveLength(2);
    expect(blocks[0]).toBe("graph TD\n  A --> B");
    expect(blocks[1]).toBe("sequenceDiagram\n  Alice->>Bob: Hello");
  });

  test("mermaid ブロックがない場合は空配列を返す", () => {
    const content = "# No diagrams\n```typescript\nconst x = 1;\n```";
    expect(extractMermaidBlocks(content)).toEqual([]);
  });

  test("空文字列は空配列を返す", () => {
    expect(extractMermaidBlocks("")).toEqual([]);
  });

  test("前後の空白をトリムする", () => {
    const content = "```mermaid\n\ngraph TD\n  A --> B\n\n```";
    const blocks = extractMermaidBlocks(content);
    expect(blocks[0]).toBe("graph TD\n  A --> B");
  });

  test("mermaid 以外のコードブロックは無視する", () => {
    const content = "```typescript\nconst x = 1;\n```\n```bash\necho hi\n```";
    expect(extractMermaidBlocks(content)).toEqual([]);
  });
});
````

- [ ] **Step 2: Run the tests**

```bash
cd ~/dotfiles && bun test home/.claude/hooks/__tests__/mermaid-validate.test.ts
```

Expected: all tests pass (green).

- [ ] **Step 3: Commit**

```bash
git add home/.claude/hooks/__tests__/mermaid-validate.test.ts
git commit -m "test: mermaid-validate.ts のユニットテストを追加"
```

---

## Task 7: Register mermaid-validate in settings.json

**Files:**

- Modify: `home/.claude/settings.json`

- [ ] **Step 1: Read current PostToolUse Edit|Write hooks**

```bash
grep -A 20 '"PostToolUse"' ~/dotfiles/home/.claude/settings.json
```

Note the current hooks array under `"matcher": "Edit|Write"`.

- [ ] **Step 2: Add mermaid-validate as a third async hook**

In `home/.claude/settings.json`, find the `"matcher": "Edit|Write"` hooks array (currently has `post-format.ts` and `edit-counter-hook.ts`). Add `mermaid-validate.ts` as a third entry:

```json
{
  "type": "command",
  "command": "bun $HOME/.claude/hooks/mermaid-validate.ts",
  "async": true
}
```

The resulting array should look like:

```json
{
  "matcher": "Edit|Write",
  "hooks": [
    {
      "type": "command",
      "command": "bun $HOME/.claude/hooks/post-format.ts",
      "async": true
    },
    {
      "type": "command",
      "command": "bun $HOME/.claude/hooks/edit-counter-hook.ts"
    },
    {
      "type": "command",
      "command": "bun $HOME/.claude/hooks/mermaid-validate.ts",
      "async": true
    }
  ]
}
```

- [ ] **Step 3: Validate JSON**

```bash
node -e "const p=require('path').join(process.env.HOME,'dotfiles/home/.claude/settings.json'); JSON.parse(require('fs').readFileSync(p,'utf8')); console.log('valid')"
```

Expected: `valid`

- [ ] **Step 4: Manual smoke test**

Edit a `.md` file that contains a mermaid block with a deliberate syntax error:

````
```mermaid
graph TD
  A --> [invalid node
```
````

Within a few seconds you should see `[mermaid-validate] Syntax error in ...` in the Claude Code tool output (async hook). Fix the syntax and confirm no error appears.

- [ ] **Step 5: Commit**

```bash
git add home/.claude/settings.json
git commit -m "feat: mermaid-validate フックを PostToolUse Edit|Write に登録"
```

---

## Self-Review

**Spec coverage check:**

- ✅ semgrep → Task 1 (Nix) + Task 3 Phase 5b + Task 4 Phase 2
- ✅ mermaid-cli → Task 1 (Nix) + Task 5 (hook) + Task 7 (register)
- ✅ type-coverage → Task 2 (mise) + Task 3 Phase 3
- ✅ textlint → Task 2 (mise) + Task 3 Phase 2.6
- ✅ ncu → already installed + Task 3 Phase 2.7
- ✅ knip → already installed, no change needed
- ✅ hotspot analysis → Task 4 Phase 1.5
- ✅ mermaid-validate unit tests → Task 6

**Placeholder scan:** No TBDs. All code blocks are complete and runnable.

**Type consistency:** `isMdFile` and `extractMermaidBlocks` used in both Task 5 (implementation) and Task 6 (tests) with matching signatures.
