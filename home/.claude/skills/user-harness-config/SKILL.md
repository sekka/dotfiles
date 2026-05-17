---
name: user-harness-config
description: >
  Use when Claude Code settings need review, a new skill or plugin needs
  integration, or best practices should be applied. Researches, audits, and
  applies Claude Code configuration: skills, plugins, CLAUDE.md rules, hooks,
  and settings.json. Triggers: "claude codeのベスプラを調査して適用して",
  "最新のナレッジ・推奨設定を取り込んで", "このスキルを取り入れたい [URL]",
  "Audit Claude Code config against best practices", "Integrate new skill/plugin".
allowed-tools: Bash, Read, Glob, Grep, Edit, Write, Agent, WebFetch, ToolSearch
effort: medium
context: fork
agent: general-purpose
---

# Claude Code Harness Configuration

Keep the Claude Code harness (CLAUDE.md, rules, skills, hooks, settings.json) current with official best practices and the user's evolving workflow. Covers: auditing existing config, integrating new skills or plugins, applying guidance from articles, and cleaning up stale settings.

Files to check first:
- `~/dotfiles/home/.claude/CLAUDE.md` and `~/dotfiles/home/.claude/rules/*.md`
- `~/dotfiles/home/.claude/skills/*/SKILL.md`
- `~/.claude/settings.json` (or project `.claude/settings.json`)
- `~/dotfiles/home/.claude/hooks/`

## Phase 1: Scope Identification

Determine what is being updated:
- **Article-driven**: User supplies a URL → WebFetch → extract applicable guidance
- **Best-practice audit**: Research official docs + existing config → find gaps
- **New skill/plugin**: Install (gh extension or plugin marketplace) → configure → test
- **Settings cleanup**: Find stale or conflicting settings → remove

## Phase 2: Research

For article-driven updates:
1. WebFetch the URL; if blocked, try context7 or DeepWiki (GitHub repos only); if all fail, ask the user to paste the article content
2. Extract: specific settings, rule changes, new patterns
3. Cross-check against current config (Grep for existing coverage)

For audits:
1. Read CLAUDE.md and all `rules/*.md`
2. Check official Claude Code documentation (via WebFetch or ToolSearch; fallback: context7 MCP or DeepWiki)
3. List gaps: settings not covered, outdated directives, missing rules

For skill/plugin integration:
1. Read the skill's SKILL.md (from URL or local path)
2. Check for name conflicts with existing skills (`Glob ~/dotfiles/home/.claude/skills/*/SKILL.md`)
3. To enable: add the plugin key to `enabledPlugins` in settings.json (Phase 3, step 3). For GitHub CLI extensions (not Claude Code plugins), use `gh extension install <repo>` instead.

## Phase 3: Apply Changes

Order of operations:
1. **CLAUDE.md / rules**: Edit existing file or create new rule file in `rules/`
2. **Skills**: Write new SKILL.md to `~/dotfiles/home/.claude/skills/{name}/SKILL.md`
3. **Settings — non-hook keys** (`enabledPlugins`, `env`, `model`, `language`, `extraKnownMarketplaces`): Edit `.claude/settings.json` directly.
4. **Settings — hooks and permissions** (`hooks.*`, `permissions.allow/deny/ask`): For a direct user request ("add a hook for X"), use the `update-config` plugin skill. For article-driven or multi-change audits, edit `.claude/settings.json` directly.
5. **Cleanup**: Remove stale settings, deprecated commands, duplicate rules

Constraints:
- Abstract all project-specific paths in skills
- Do not duplicate existing rules — merge or extend
- Keep CLAUDE.md under 200 lines where possible

## Phase 4: Verify

- For settings changes: run `claude --version` or trigger a test session
- For skill additions: check `claude skills list` or inspect the file
- For hook changes: run the hook script manually
- Summarize what changed and why

## Success Criteria

- [ ] Scope clearly identified (article / audit / plugin / cleanup)
- [ ] Existing config read before making changes
- [ ] Changes applied to correct files without introducing duplicates
- [ ] No project-specific paths in skill files
- [ ] Verification step completed
- [ ] Summary of changes presented to user

## Status: DONE
