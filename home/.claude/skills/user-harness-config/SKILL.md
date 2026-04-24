---
name: user-harness-config
description: Research, audit, and apply Claude Code configuration best practices. Updates skills, plugins, CLAUDE.md rules, and hooks based on latest official guidance or user-supplied articles. Triggered when Claude Code settings need review, a new skill/plugin needs integration, or best practices should be applied.
allowed-tools: Bash, Read, Glob, Grep, Edit, Write, Agent, WebFetch, ToolSearch
---

<objective>
Keep the Claude Code harness (CLAUDE.md, rules, skills, hooks, settings.json) current with official best practices and the user's evolving workflow. Covers: auditing existing config, integrating new skills or plugins, applying guidance from articles, and cleaning up stale settings.

Observed pattern: 14+ sessions in the dotfiles project over 60 days follow this shape — user supplies an article URL or asks a config question, Claude researches, proposes changes, edits config files, and verifies.
</objective>

<quick_start>
Trigger phrases:
- "claude codeのベスプラを調査して適用して"
- "最新のナレッジ・推奨設定を取り込んで"
- "このスキルを取り入れたい [URL]"
- "Audit Claude Code config against best practices"
- "Integrate new skill/plugin"

Basic flow:
1. Identify scope (article URL / specific config area / full audit)
2. Research current state (read existing config files)
3. Identify gaps or improvements
4. Propose and apply changes
5. Verify: run claude or check hooks
</quick_start>

<workflow>
<phase_1>
**Phase 1: Scope Identification**

Determine what is being updated:
- **Article-driven**: User supplies a URL → WebFetch → extract applicable guidance
- **Best-practice audit**: Research official docs + existing config → find gaps
- **New skill/plugin**: Install (gh extension or plugin marketplace) → configure → test
- **Settings cleanup**: Find stale or conflicting settings → remove

Files to check first:
- `~/dotfiles/home/.claude/CLAUDE.md` and `~/dotfiles/home/.claude/rules/*.md`
- `~/dotfiles/home/.claude/skills/*/SKILL.md`
- `~/.claude/settings.json` (or project `.claude/settings.json`)
- `~/dotfiles/home/.claude/hooks/` or hook scripts
</phase_1>

<phase_2>
**Phase 2: Research**

For article-driven updates:
1. WebFetch the URL; if blocked, try context7 or DeepWiki (GitHub repos only); if all fail, ask the user to paste the article content
2. Extract: specific settings, rule changes, new patterns
3. Cross-check against current config (Grep for existing coverage)

For audits:
1. Read CLAUDE.md and all rules/*.md
2. Check official Claude Code documentation (via WebFetch or ToolSearch; fallback: context7 MCP or DeepWiki if WebFetch is blocked)
3. List gaps: settings not covered, outdated directives, missing rules

For skill/plugin integration:
1. Read the skill's SKILL.md (from URL or local path)
2. Check for name conflicts with existing skills (Glob ~/dotfiles/home/.claude/skills/*/SKILL.md)
3. Install via `gh extension install` or plugin marketplace command
</phase_2>

<phase_3>
**Phase 3: Apply Changes**

Order of operations:
1. **CLAUDE.md / rules**: Edit existing file or create new rule file in `rules/`
2. **Skills**: Write new SKILL.md to `~/dotfiles/home/.claude/skills/{name}/SKILL.md`
3. **Settings**: Edit `.claude/settings.json` (use `update-config` plugin skill for hooks/permissions — it is a Claude Code plugin, not a local skill file)
4. **Cleanup**: Remove stale settings, deprecated commands, duplicate rules

Constraints:
- Abstract all project-specific paths in skills
- Do not duplicate existing rules — merge or extend
- Keep CLAUDE.md under 200 lines where possible
</phase_3>

<phase_4>
**Phase 4: Verify**

- For settings changes: run `claude --version` or trigger a test session
- For skill additions: check `claude skills list` or inspect the file
- For hook changes: run the hook script manually
- Summarize what changed and why
</phase_4>
</workflow>

<success_criteria>
- [ ] Scope clearly identified (article / audit / plugin / cleanup)
- [ ] Existing config read before making changes
- [ ] Changes applied to correct files without introducing duplicates
- [ ] No project-specific paths in skill files
- [ ] Verification step completed
- [ ] Summary of changes presented to user
</success_criteria>
