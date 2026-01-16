---
name: creating-agent-skills
description: ドメイン固有の知識を持つ再利用可能なagent skillsを作成します。プログレッシブディスクロージャとXML構造を使用し、効果的なスキルプロンプトを生成します。新しいスキルの作成、既存スキルのリファクタリング、スキル構造のベストプラクティス適用が必要な場合に使用してください。
extends: shared/template-generator
template_type: agent-skill
model: haiku
---

<objective>
Agent Skills are modular, filesystem-based capabilities that get loaded on-demand and provide domain-specific expertise. This skill teaches you how to create effective skills using XML structure, progressive disclosure, and clear workflows.
</objective>

## About This Skill

This skill extends **shared/template-generator** which handles common creation workflows (naming, validation, file generation).

**Agent-skill-specific focus**: XML structure, progressive disclosure, and writing effective skill content.

## What Are Skills?

- **Organized prompts** loaded on-demand when Claude needs specific expertise
- **Filesystem-based** - stored in `.claude/skills/` directories
- **Discoverable** - Claude finds and uses them automatically
- **Reusable patterns** - capture knowledge for future tasks

## When to Create Skills

**Create skills for:**
- Reusable patterns across multiple tasks
- Domain knowledge that doesn't change frequently
- Complex workflows that benefit from structured guidance
- Reference materials (schemas, APIs, libraries)
- Validation scripts and quality checks

**Use prompts for:**
- One-off tasks that won't be reused

**Use slash commands for:**
- Explicit user-triggered workflows with fresh context

## Skill Structure

All skills require:

```markdown
---
name: verb-noun-skill          # kebab-case
description: What it does AND when to use it
---

<objective>
What the skill accomplishes and why it matters.
</objective>

<quick_start>
Immediate, actionable guidance to get started quickly.
</quick_start>

<success_criteria>
How to know the skill worked successfully.
</success_criteria>
```

## Required Content

**`<objective>`** - Explain what the skill does and the value it provides.

**`<quick_start>`** - Give Claude enough context to start using it immediately. Avoid lengthy preamble.

**`<success_criteria>`** - Define measurable completion criteria.

## Optional, Conditional Tags

Add these based on skill complexity:

```markdown
<context>
Situational/background information

<workflow> or <process>
Step-by-step procedures

<advanced_features>
Deep-dive topics (progressive disclosure)

<validation>
How to verify outputs

<examples>
Multi-shot learning examples

<anti_patterns>
Common mistakes to avoid

<testing>
Testing workflows

<common_patterns>
Code recipes and examples

<reference_guides>
Links to detailed reference files
```

## Writing Effective Skills

1. **Concise** - Share context window efficiently. Assume Claude is smart.
2. **Progressive disclosure** - Start simple, add complexity gradually
3. **Pure XML structure** - No markdown headings, use semantic tags
4. **Specific** - Provide depth where it matters
5. **Actionable** - Include examples and clear next steps

## Naming Conventions

Directory and file names use verb-noun patterns:

- `create-*` - Create new things (create-prompts, create-scripts)
- `manage-*` - Manage existing things (manage-files, manage-versions)
- `setup-*` - Set up systems or tools (setup-database, setup-ci)
- `generate-*` - Generate content (generate-tests, generate-docs)
- `optimize-*` - Improve performance (optimize-queries, optimize-images)
- `debug-*` - Find and fix issues (debug-auth, debug-performance)

## Skill Examples

**Simple skill** (text extraction):
```markdown
---
name: extract-tables
description: Extract tables from text, PDFs, or images using pattern matching
---

<objective>
Extract structured table data from various formats into CSV or JSON.
</objective>

<quick_start>
For text tables, use regex. For PDFs, use pdfplumber. For images, use image analysis.

[Specific patterns for each format]
</quick_start>

<success_criteria>
- Correct number of rows/columns extracted
- Data types preserved
- Special characters handled properly
</success_criteria>
```

**Complex skill** (includes workflow, examples, reference):
```markdown
---
name: build-api
description: Design and build REST APIs with validation, documentation, and testing
---

<objective>
Build production-ready REST APIs with proper structure, validation, and test coverage.
</objective>

<quick_start>
1. Define endpoints with clear purposes
2. Add input validation
3. Write tests first
4. Generate documentation

[Quick example for each step]
</quick_start>

<workflow>
1. Understand requirements and design schema
2. Define endpoint contracts
3. Implement with error handling
4. Add validation middleware
5. Write comprehensive tests
6. Generate OpenAPI docs
</workflow>

<examples>
[Real-world patterns with code]
</examples>

<anti_patterns>
- Returning raw database errors
- Missing input validation
- No error status codes
- [Other common mistakes]
</anti_patterns>

<reference_guides>
- [api-design.md](references/api-design.md) - Design patterns
- [validation.md](references/validation.md) - Input validation patterns
```

## XML Structure Rules

**Critical rule**: Remove all markdown headings (#, ##, ###). Use semantic XML tags instead.

Keep markdown formatting **within** content:
- Bold: `**text**`
- Italic: `*text*`
- Lists: `- item`
- Code blocks: ` ``` `
- Links: `[text](url)`

## YAML Frontmatter

```yaml
---
name: skill-name                    # Required: kebab-case
description: Concise description    # Required: what + when to use
---
```

Description should be clear and specific about when Claude should use this skill.

## File Organization

Skills live in `.claude/skills/` with structure:

```
.claude/skills/
├── create-prompts/
│   ├── SKILL.md
│   └── references/
│       ├── xml-structure.md
│       ├── examples.md
│       └── anti-patterns.md
├── manage-database/
│   ├── SKILL.md
│   └── references/
└── debug-api/
    └── SKILL.md
```

Reference files go in `references/` subdirectory.

## Progressive Disclosure Pattern

Structure complex skills to build understanding gradually:

```markdown
<quick_start>
Simple case that works immediately
</quick_start>

<workflow>
Full step-by-step procedure
</workflow>

<advanced_features>
Optional patterns and edge cases
</advanced_features>
```

This way Claude starts with what's essential, then learns more advanced patterns as needed.

## Reference Guides

For detailed guidance, see:

- [references/core-principles.md](references/core-principles.md) - XML structure, conciseness, degrees of freedom
- [references/skill-structure.md](references/skill-structure.md) - Structure requirements and naming conventions
- [references/workflows-and-validation.md](references/workflows-and-validation.md) - Complex workflows with validation
- [references/common-patterns.md](references/common-patterns.md) - Template and example patterns
- [references/executable-code.md](references/executable-code.md) - Using utility scripts and dependencies
- [references/api-security.md](references/api-security.md) - Securing credentials in skills
- [references/iteration-and-testing.md](references/iteration-and-testing.md) - Evaluation-driven development
