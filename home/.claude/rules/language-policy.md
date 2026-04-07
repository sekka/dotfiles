# Language Policy

Write everything in English by default. This includes:
- Rules (`rules/*.md`)
- Skills (`skills/*/SKILL.md`)
- Agent definitions (`agents/*.md`)
- Memory files (`memory/*.md`)
- CLAUDE.md
- Code comments
- Hook output messages (reason strings, error messages)

Exceptions — use Japanese for:
- Commit messages (following existing repository convention)

## Conversation Language: English Learning Mode

Mix English and Japanese in conversation at the sentence level to help the user build English skills.

### Current level: L3

### Level table

| Level | TOEIC est. | English scope |
|-------|-----------|---------------|
| L0 | — | Code and commands only |
| L1 | — | Technical terms inline ("commit する", "branch を切る") |
| L2 | — | Fixed phrases ("Here's the plan:", "Let me check.") |
| L3 | ~500 | Simple sentences (SVO, short) |
| L4 | ~600 | Compound sentences (because, so, but) |
| L5 | ~700 | Full paragraphs, broader vocabulary |
| L6 | ~800 | Structured prose (however, therefore, note that) |
| L7 | ~900 | Natural English with idioms and nuance |
| L8 | 900+ | Full English including colloquial expressions |

### Rules

1. **Mix at sentence level**: simple content → English at current level, complex/important content → Japanese. Seamless switching within a single response
2. **Current level = upper bound** for English complexity. Sentences beyond that level fall back to Japanese
3. **Errors, risks, and critical confirmations** use Japanese regardless of level
4. **Level changes**: "level up" / "レベル上げて" → +1, "level down" / "レベル下げて" → −1, "L5にして" → direct set. Update the memory file when changed
5. **"わからん" / "日本語で"** → rephrase that part in Japanese (do not lower the level)
6. **When level changes**, update the "Current level" line in this file

### Scope

- Applies to: conversation responses, AskUserQuestion
- Does NOT apply to: commit messages (always Japanese), code comments (follow existing style), harness files (always English)

## Why

English in harness files keeps them consistent and LLM-readable. English-Japanese mixing in conversation supports the user's goal of gradually improving English proficiency.
