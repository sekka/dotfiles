---
name: creating-meta-prompts
description: Claude間のパイプライン用に最適化されたメタプロンプトを作成します。リサーチ、計画、実行の各段階を含む多段階ワークフローを設計します。複雑なタスクの段階的処理、Claude間の連携、構造化されたワークフローが必要な場合に使用してください。
extends: shared/template-generator
template_type: meta-prompt
model: opus
disable-model-invocation: false
---

<objective>
Meta-prompts are optimized for Claude-to-Claude communication in multi-stage workflows. Outputs are structured with XML and metadata for efficient parsing by subsequent prompts, with executive summaries for human review.
</objective>

## About This Skill

This skill extends **shared/template-generator** for common creation workflows.

**Meta-prompt-specific focus**: Purpose-driven patterns, folder structure, output organization, and chaining.

## What Are Meta-Prompts?

Meta-prompts are designed for **pipelines** where one Claude output becomes input for another:

- **Research** → Gather information or understand something
- **Plan** → Create an approach, roadmap, or strategy
- **Do** → Execute a task and produce artifacts
- **Refine** → Improve existing research or plan outputs

Each stage produces outputs optimized for the next stage plus human-readable summaries.

## Purposes and Output

### Research
**Goal**: Understand a topic deeply

**Output structure**:
- XML-formatted analysis with findings
- Key insights and patterns
- Data supporting conclusions
- References and sources

**Consumed by**: Plan or Do prompts

### Plan
**Goal**: Create strategy or roadmap

**Output structure**:
- Phase-by-phase approach
- Dependencies and ordering
- Success criteria for each phase
- Alternative approaches

**Consumed by**: Do prompts for implementation

### Do
**Goal**: Execute and create artifacts

**Output structure**:
- Created files/code
- Execution decisions and rationale
- SUMMARY.md with completion status
- Files produced with locations

**Consumed by**: Human or next Do prompt

### Refine
**Goal**: Improve existing research/plans

**Output structure**:
- Updated output with improvements
- Rationale for changes
- Version history in archive/
- SUMMARY.md comparing versions

**Consumed by**: Do prompts or further refinement

## Folder Organization

Meta-prompts live in `.prompts/` with numbered, purpose-named folders:

```
.prompts/
├── 001-auth-research/
│   ├── completed/
│   │   └── 001-auth-research.md
│   ├── auth-research.md       # Output (XML for Claude)
│   └── SUMMARY.md             # Executive summary (human)
├── 002-auth-plan/
│   ├── completed/
│   │   └── 002-auth-plan.md
│   ├── auth-plan.md
│   └── SUMMARY.md
├── 003-auth-implement/
│   ├── completed/
│   │   └── 003-auth-implement.md
│   ├── code/                  # Output artifacts
│   └── SUMMARY.md
└── 004-auth-refine/
    ├── completed/
    │   └── 004-auth-refine.md
    ├── archive/
    │   └── auth-research-v1.md
    ├── auth-research.md
    └── SUMMARY.md
```

**Naming convention**:
- Folder: `NNN-topic-purpose` (e.g., `001-auth-research`)
- Prompt: `NNN-topic-purpose.md`
- Output: `topic-purpose.md` (XML for Claude)
- Summary: Always `SUMMARY.md` (markdown for humans)

## Creating Meta-Prompts

**Determine purpose**: Research, Plan, Do, or Refine?

**Reference prior work**: If refining or planning, reference completed research/plans:
```markdown
<context>
Prior research: @ .prompts/001-auth-research/auth-research.md
</context>
```

**Structure output for parsing**: Use XML tags that next prompt can extract:
```xml
<findings>
  <finding>...</finding>
</findings>

<plan>
  <phase number="1">
    <objective>...</objective>
    <tasks>...</tasks>
  </phase>
</plan>
```

**Create executive summary**: After prompt runs, generate `SUMMARY.md`:
```markdown
# Auth Research Summary

**Key Findings**:
- Finding 1
- Finding 2

**Next Steps**:
- Action for plan or implementation

**Full Details**: See `auth-research.md`
```

## Chaining Prompts

Reference outputs from previous prompts:

```markdown
---
name: 002-auth-plan
description: Create authentication implementation plan
---

<objective>
Based on auth research, create a detailed implementation plan.
</objective>

<research_findings>
@ .prompts/001-auth-research/auth-research.md
</research_findings>

<process>
1. Review research findings
2. Identify implementation phases
3. Define dependencies
4. Create success criteria
5. Document alternatives
</process>
```

The next Do prompt can then reference the plan.

## Output Format Best Practices

1. **XML structure** - Enable efficient parsing by next Claude
2. **Clear sections** - Use tags like `<findings>`, `<phases>`, `<decisions>`
3. **Metadata** - Include confidence levels, timestamps, version numbers
4. **Traceable** - Reference source files and prior work
5. **Summaries** - Always create human-readable SUMMARY.md

## Example: Research → Plan → Do

**001-auth-research.md**:
```markdown
---
purpose: Research
topic: User authentication
---

<objective>
Research authentication approaches for our application.
</objective>

[Research content with XML structure]
```

After execution: Produces `001-auth-research/auth-research.md` + `SUMMARY.md`

**002-auth-plan.md**:
```markdown
---
purpose: Plan
topic: User authentication
depends: [001-auth-research]
---

<objective>
Create implementation plan based on research findings.
</objective>

<research>
@ .prompts/001-auth-research/auth-research.md
</research>

[Planning content with phase breakdown]
```

After execution: Produces `002-auth-plan/auth-plan.md` + `SUMMARY.md`

**003-auth-implement.md**:
```markdown
---
purpose: Do
topic: User authentication
depends: [002-auth-plan]
---

<objective>
Implement authentication based on plan.
</objective>

<plan>
@ .prompts/002-auth-plan/auth-plan.md
</plan>

[Implementation steps and code]
```

After execution: Produces code artifacts in `003-auth-implement/code/` + `SUMMARY.md`

## Running Meta-Prompts

1. **Create folder**: `.prompts/NNN-topic-purpose/`
2. **Create prompt**: NNN-topic-purpose.md with frontmatter and structure
3. **Store prompt**: Place in completed/ after running
4. **Generate output**: Run prompt and save XML output
5. **Create summary**: Generate SUMMARY.md for human review
6. **Chain**: Reference output in next prompt

## Reference Files

For detailed guidance:

- [references/purposes.md](references/purposes.md) - Deep-dive on each purpose
- [references/output-formats.md](references/output-formats.md) - XML structure patterns
- [references/examples.md](references/examples.md) - Complete examples by type
- [references/chaining.md](references/chaining.md) - Multi-prompt workflows
