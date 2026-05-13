# Claude Code Guidelines

## 1. Core Principles

- **Read before modify**: Never modify code you have not read in the current session. Always use Read to understand the existing code before making changes.
- **Simplicity first**: Keep changes as simple as possible. Minimize the code affected.
- **No shortcuts**: Find the root cause. Avoid temporary fixes.
- **Minimize impact**: Change only what is needed. Do not introduce new bugs.
- **Always verify**: Do not mark a task complete until you can prove it works. **After implementing, always confirm with a browser or tool before reporting "done". Never report "done" based only on logic and guesswork.**
- **Be honest about uncertainty**: If unsure about a fact, API, or behavior, say "unverified" or "needs confirmation" rather than guessing. Silent hallucination is worse than admitting uncertainty.
- **See the whole picture**: Consider whether your change affects other pages or components, not just the part you were asked to fix. **Never make a quick fix that breaks something else.** If unsure, understand the overall design first, then fix it correctly in one pass.
- **Save context**: The main agent's context is a valuable resource. Delegate research, implementation, and review to external AI or subagents. The main agent focuses on directing and integrating.
- **Think before coding**: Before implementing, state assumptions explicitly. If multiple interpretations exist, surface them and ask rather than silently choosing one.
- **Surgical edits**: When editing existing code, do not improve adjacent code, comments, or formatting. Touch only what is asked. Flag unrelated issues separately, never inline.

---

## 2. Workflow Design

### Use Plan mode as the default
- Always start in Plan mode for tasks with 3 or more steps, or tasks that affect architecture.
- If things go wrong in the middle, stop immediately and re-plan instead of pushing forward.
- Write a detailed spec before implementing. Record it as a checkable plan.
- After ExitPlanMode, suggest a plan review with `user-dev-review`.

### Identify risks (during Plan)
- In Plan mode, list 1-3 things that could go wrong, in addition to the implementation plan.
- Consider: impact on existing features, performance degradation, broken dependencies.
- Risks that need no action can be marked as "accepted". (Not every risk needs a fix.)

### Subagent strategy
Assign one task per subagent for focused execution.
Use subagents actively to keep the main context window clean.

See section 4 for delegation rules by subagent type (researcher / implementer / reviewer).

**Parallel vs sequential execution:**
- Parallel: no shared files, no dependencies, independent domains
- Sequential: has dependencies, same file operations, scope needs confirmation

**5 elements needed for a high-quality subagent launch:**
1. Specific scope and problem
2. File references and paths
3. Relevant context
4. Clear success criteria
5. Constraints and dependencies

### Task breakdown (WBS)
- For implementations with 5 or more steps, break them down hierarchically with TaskCreate before starting.
- Granularity: 1 task = 1 subagent launch or 1 clear deliverable.
- Use addBlockedBy in TaskUpdate to make dependencies explicit.

### Definition of Done
- Always write a "completion condition" (1-2 lines) in the description when using TaskCreate.
- Examples: "Confirmed in browser", "lint passes", "no impact on existing pages"
- Do not mark a task as completed in TaskUpdate until the completion condition is met.

### Progress reporting
- For long or multi-step tasks, include "% progress toward the goal" and "estimated remaining steps" in work reports. (Details: `.claude/rules/progress-reporting.md`)
- This prevents stalling from over-breaking tasks and losing sight of the overall goal.

### Self-improvement loop
- When the user gives a correction, record the pattern in the memory system (`~/.claude/projects/*/memory/`).
- Write rules for yourself to avoid repeating the same mistakes.

### Pursue elegance (with balance)
- Before making an important change, pause once and ask: "Is there a more elegant way?"
- Skip this process for simple and obvious fixes. (Do not over-engineer.)

### Autonomous bug fixing
- If a bug has clear reproduction steps, fix it without asking the user for more confirmation.
- Look at logs, errors, and failing tests, then solve it yourself.
- If the spec is unclear, follow the "constraints and requirements confirmation" rule first.

---

## 3. Constraints and Requirements Confirmation

- Do not `git commit` / `push` without explicit instructions from the user.
- For new feature requests, clarify requirements by interviewing the user before implementing. (Details: `.claude/rules/interview-first.md`)
- Always confirm ambiguous requirements with AskUserQuestion before starting work.
- Do not send confidential information (API keys, environment variables, customer data, internal URLs) to external tools.
- When given a URL, use browser automation without hesitation. Execute, do not just suggest. Priority order: (1) agent-browser CLI with `-i -c` (fastest, compact output) → (2) playwright-cli (lower token baseline) → (3) Playwright MCP → (4) chrome MCP (chrome-devtools)
- When running agent-browser in parallel (subagents, multiple panes), always pass `--session <unique-name>` to isolate browser state. Without it, concurrent commands share one session and data will mix.
- Write tests before implementing (TDD). Do not defer failing tests — fix them immediately.

---

## 4. Forced Routing to Save Context

The main agent's context window is limited and expensive. Focus on **directing work**, not **executing work**.

### Operations the main agent may do directly

- Ask the user (AskUserQuestion)
- Progress management with TaskCreate / TaskUpdate
- Launch subagents (Agent tool)
- Check environment variables (1-line Bash)
- git commit / push (only when the user requests it)
- Edits of 3 lines or fewer to a known path

### Delegate everything else to subagents

| Operation | Delegate to | Model |
|------|--------|------|
| File search (Glob, Grep, multiple Reads) | researcher | haiku |
| Code implementation (Write, Edit, multiple Bash) | implementer | sonnet |
| Mechanical review (lint, format, typecheck, test parsing) | reviewer | haiku |
| Judgment review (security, architecture, pre-commit go/no-go) | reviewer-judgment | **opus** |
| Test execution and build | implementer | sonnet |
| Web research and documentation search | researcher | haiku |

### Delegation triggers (quantitative)

Launch a subagent BEFORE starting work if ANY apply:

- Need to Read 3+ files to understand the task
- Need 2+ Grep/Glob calls to locate something
- Implementation touches 2+ files OR exceeds ~30 lines total
  - **4-29 lines in a single known file**: delegate if it touches control flow, algorithm, or business logic. Keep with Opus only if purely mechanical: variable rename, import reorganization, comment/doc update, or trivial type annotation change. When unsure, delegate.
- Any build/test run expected to take >30s
- Any audit/security check (always delegate to reviewer-judgment)

If unsure, delegate. Subagent overhead < main context bloat cost.

### Review gate after Sonnet implementation

When implementer (Sonnet) finishes, the main agent (Opus) decides review depth based on what was changed:

| Change type | Review path |
|---|---|
| Rename, typo, ≤3-line edit | Skip review (verify diff only) |
| 1-2 files, mechanical | `reviewer` (haiku) — lint/test results |
| 3+ files OR 30+ lines OR design judgment | `reviewer-judgment` (opus) — independent second opinion |
| Security / auth / credential / secret-handling | `reviewer-judgment` (opus) — **always**, regardless of size |

`reviewer-judgment` runs on Opus in a fresh context, so the main agent's context is preserved while still getting Opus-quality judgment. The Sonnet-implementer + Opus-reviewer combination catches blindspots that a single-model pipeline misses.

### Automatically executed hooks

Check with the `/hooks` command. See RTK.md for details on rtk-rewrite.

---

## 5. Using Skills

Custom skills (`~/.claude/skills/`) and plugin skills are matched automatically by each SKILL.md description. To call them explicitly, use a slash command (e.g., `user-dev-review`, `commit-commands:commit`, `user-fe-develop`). See `docs/claude-code-cheatsheet.md` for the full skill list.

---

## References

- Security policy: `.claude/rules/security.md`
- Visual output policy (when to use visual-explainer skills): `.claude/rules/visual-output.md`
- Subagent definitions: `home/.claude/agents/`
- Skill list and usage: `docs/claude-code-cheatsheet.md`

@RTK.md
# graphify
- **graphify** (`~/.claude/skills/graphify/SKILL.md`) - any input to knowledge graph. Trigger: `/graphify`
When the user types `/graphify`, invoke the Skill tool with `skill: "graphify"` before doing anything else.
