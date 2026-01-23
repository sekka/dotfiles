---
name: creating-slash-commands
description: カスタムClaude Codeスラッシュコマンド（/command-name構文）を作成します。ユーザーが明示的にトリガーするワークフローを実装し、新鮮なコンテキストで実行します。頻繁に使うワークフローのショートカット、明示的なユーザートリガー、コマンド形式のインターフェースが必要な場合に使用してください。
extends: shared/template-generator
template_type: slash-command
model: haiku
allowed-tools: Task, Read, Glob, Write, Edit
disable-model-invocation: true
---

<objective>
Slash commands are reusable prompts invoked with `/command-name` syntax that expand inline in the conversation. Commands can be **global** (`~/.claude/commands/`) for personal use or **project-specific** (`.claude/commands/`) for team sharing.

This skill creates well-structured slash commands using XML tags, YAML frontmatter, and argument handling.
</objective>

## About This Skill

This skill extends **shared/template-generator** which handles:
- Input validation and naming conventions
- Template loading and variable substitution
- File generation and error handling

**Slash-command-specific focus**: XML structure, argument patterns, and examples.

## File Locations

**Global commands** - Available everywhere:
- Path: `~/.claude/commands/command-name.md`
- Shows as `(user)` in `/help`
- Use for: Personal productivity, general utilities

**Project commands** - Shared with team:
- Path: `.claude/commands/command-name.md`
- Shows as `(project)` in `/help`
- Use for: Team workflows, project-specific operations
- Committed to git for team access

## YAML Frontmatter

```yaml
---
name: my-command                    # kebab-case, auto-validated
description: Brief purpose          # Required - shown in /help
argument-hint: [input]              # Optional - if command takes args
allowed-tools: [...]                # Optional - tool restrictions
---
```

**Field details:**
- `description`: Clear, concise statement of what the command does
- `argument-hint`: Only include if command processes `#$ARGUMENTS`
- `allowed-tools`: For security restrictions (e.g., `Bash(git :*)`)

## XML Command Structure

All slash commands use XML tags for clarity and consistency.

**Required tags** (always include):

```markdown
<objective>
What the command does and why it matters.
</objective>

<process>
1. First numbered step
2. Second step
3. Final step
</process>

<success_criteria>
- Measurable completion criteria
- Clear definition of done
</success_criteria>
```

**Conditional tags** (add as relevant):

```markdown
<context>
Current state: ! `git status`
Files: @ src/important/file.ts
</context>

<verification>
Before completing, verify:
- Specific test to run
- Expected result
</verification>

<testing>
Run tests: ! `npm test`
Check linting: ! `npm run lint`
</testing>

<output>
Files created/modified:
- `./path/to/file.ts` - Description
</output>
```

## Arguments Handling

### When to Use Arguments

**Commands that need user input:**
- `/fix-issue [issue-number]` → Operates on user-specified data
- `/review-pr [pr-number]` → Parameterized operation
- `/optimize [file-path]` → File-specific analysis

**Commands that don't:**
- `/check-todos` → Uses known file location
- `/first-principles` → Operates on current conversation
- `/git-log` → Uses implicit context

### Using Arguments

**All arguments** (`#$ARGUMENTS`):
```markdown
---
argument-hint: [issue-number]
---

<objective>
Fix issue #$ARGUMENTS following project standards.
</objective>

<process>
1. Understand issue #$ARGUMENTS from tracker
2. Locate relevant code
3. Implement fix
</process>
```

**Positional arguments** (`$1`, `$2`, `$3`):
```markdown
---
argument-hint: <pr-number> <priority> <assignee>
---

<objective>
Review PR #$1 with priority $2 and assign to $3.
</objective>
```

## Dynamic Context

Load state into commands with execution prefixes:

**Bash commands** - Prefix backticks with `!`:
```markdown
<context>
Current status: ! `git status`
Latest commits: ! `git log --oneline -5`
Test results: ! `npm test`
</context>
```

**File contents** - Prefix with `@`:
```markdown
Context from file: @ src/utils/helpers.ts
Project config: @ package.json
```

Note: Remove space after `!` and `@` in actual commands.

## Command Patterns

**Simple analysis:**
```markdown
---
description: Analyze code for security issues
---

<objective>
Review code for common vulnerabilities and suggest fixes.
</objective>

<process>
1. Scan code for vulnerability types (XSS, injection, auth, etc.)
2. Identify specific issues with line numbers
3. Suggest remediation for each
</process>

<success_criteria>
- All major vulnerability types checked
- Issues identified with locations
- Actionable fixes provided
</success_criteria>
```

**Git workflow with context:**
```markdown
---
description: Create a git commit
allowed-tools: Bash(git add:*), Bash(git status:*), Bash(git commit:*)
---

<objective>
Create a git commit for current changes following repository conventions.
</objective>

<context>
Current status: ! `git status`
Changes: ! `git diff HEAD`
Recent commits: ! `git log --oneline -5`
</context>

<process>
1. Review staged and unstaged changes
2. Stage relevant files
3. Write message following recent commit style
4. Create commit
</process>

<success_criteria>
- Relevant changes staged
- Commit message follows conventions
- Commit created successfully
</success_criteria>
```

## Best Practices

1. **Always use XML structure** after YAML frontmatter
2. **Clear descriptions** - Show up in `/help` list
3. **Dynamic context** - Load git state, files, test results
4. **Tool restrictions** - Use `allowed-tools` for security
5. **Keep it simple** - Don't over-engineer simple tasks
6. **Use arguments** - Make commands flexible with `#$ARGUMENTS`
7. **Reference files** - Use `@` to include file contents

## Quick Example

```markdown
---
name: optimize-code
description: Analyze code performance and suggest optimizations
argument-hint: [file-path]
---

<objective>
Analyze performance of @ #$ARGUMENTS and suggest specific optimizations.

This helps improve application efficiency through targeted improvements.
</objective>

<process>
1. Review code in @ #$ARGUMENTS for performance issues
2. Identify bottlenecks and inefficiencies
3. Suggest three concrete optimizations with rationale
4. Estimate performance impact of each
</process>

<success_criteria>
- Performance issues clearly identified
- Three concrete optimizations suggested
- Implementation guidance provided
- Performance impact estimated
</success_criteria>
```

**Usage**: `/optimize-code src/utils/helpers.ts`

## Reference Guides

Slash-command specific resources:
- **arguments.md** - Advanced argument patterns
- **patterns.md** - Real-world examples by use case
- **tool-restrictions.md** - Bash patterns and security
- **prompt-examples.md** - Pre-built command templates

Prompt engineering references from create-prompt skill:
- **clarity-principles.md** - Being clear and direct
- **xml-structure.md** - XML tag usage
- **anthropic-best-practices.md** - Claude-specific techniques
