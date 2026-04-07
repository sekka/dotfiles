---
name: user-rules-maintainer
description: >
  Keep the harness (CLAUDE.md, rules, skills, memory) fresh and consistent.
  Detect gaps between the codebase and documentation, then propose updates.
  Apply changes only after user approval.
  Use when asked to "update rules", "check CLAUDE.md", "clean up memory",
  "check if docs are stale", "maintain rule files", or "review settings".
---

# Rules Maintainer

Compare the harness against the actual implementation. Detect outdated content and propose fixes.
Apply fixes only after user approval.

## Iron Law

1. Do not change rule files without user approval

## Flow

```
Phase 1〜3 は独立しており並列実行可能

Phase 1: ルールファイル照合（CLAUDE.md, rules）
Phase 2: スキル description 照合（skills/*/SKILL.md）
Phase 3: メモリ整理（memory/）
    ↓
Phase 4: エスカレーション提案（繰り返し違反の昇格判定）
    ↓
構造化レポート出力 → ユーザー承認 → 修正適用
```

## Phase 1: Check Rule Files

Targets: `.claude/CLAUDE.md`, `home/.claude/CLAUDE.md`, `home/.claude/rules/*.md`
Skip files that do not exist.

### Check Points

1. **Directory structure** — Use Glob to verify that paths inside code blocks actually exist
2. **Commands** — Check that file paths in bash blocks exist (do not run them)
3. **Toolchain** — Use `which` to confirm that listed tools are installed
4. **References** — Check that references to harness-related paths (`.claude/`, `home/.claude/`, `docs/`) are valid. Exclude references inside code examples and comments.
5. **Conflicts** — Check for contradictions on the same topic between global and project-specific CLAUDE.md

## Phase 2: Check Skill Descriptions

Targets: Extract and analyze frontmatter from `home/.claude/skills/*/SKILL.md`.
Read the full file only for skills that need a description gap check.

### Check Points

1. **Gap between description and content** — Do the trigger conditions and features in the description match the workflow?
2. **Invalid references** — Are allowed-tools and file paths valid?
3. **Duplicate skills** — Report only pairs that have completely overlapping functionality

## Phase 3: Clean Up Memory

Target: `~/.claude/projects/-Users-kei-dotfiles/memory/`
If the directory is empty, report "memory not used" and skip.

### Check Points

1. **Outdated** — Do file paths and setting names in memory still exist in the current codebase?
2. **Duplicates** — Items that record the same information in different wording
3. **MEMORY.md consistency** — 1:1 match between the index and actual files
4. **Classification validity** — Does the type (user/feedback/project/reference) match the content?

## Report Output

```markdown
## Phase N: [Phase Name] Results

| # | Type | Target File | Problem | Suggestion |
|---|------|-----------|------|------|
| 1 | Outdated | .claude/CLAUDE.md:45 | `scripts/foo.sh` does not exist | Delete the line |

No issues: ✅ [check item name]
```

Phases with zero problems are reported in one line: "✅ All items OK".

## Applying Fixes

1. Show a diff of "current text" vs "proposed text"
2. Confirm whether to apply all at once or select individually (AskUserQuestion)
3. Apply only approved fixes

**Do not apply fixes without user approval.**

## Phase 4: エスカレーション提案

Phase 1-3 で繰り返し違反パターンを検出した場合、エスカレーションラダー（`.claude/rules/escalation-ladder.md`）に基づいて昇格を提案する。

### チェック観点

1. **memory の feedback 記録** — 同じ違反が複数回記録されていないか
2. **現在のレベル判定** — 違反パターンが L1（ドキュメント）/ L2（AI検証）/ L3（ツール検証）/ L4（構造的ブロック）のどこにあるか
3. **昇格提案** — 3回以上の繰り返しがあれば次レベルへの昇格をレポートに含める

## Out of Scope

- Code quality review (→ `/review-and-improve`)
- Proposing new rules (this skill only checks existing consistency)
- Validating Nix / Brewfile content (only checks that tools exist)
- Creating new memory entries (only cleanup)
