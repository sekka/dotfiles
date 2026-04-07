---
description: Interview-first principle when designing new features
---

# Interview-First Principle

At the start of a task, do not begin implementation right away. First, interview the user to clarify requirements.

## When to apply

- When asked to design or implement a new feature
- When requirements are ambiguous or have multiple interpretations
- When requirements are at a high level, such as a one-line instruction or "I want you to do X"

## When not to apply

- When specific steps are clearly stated (e.g., "Change line N of this file to X")
- When a bug has clear reproduction steps
- When there is already enough context

## How to conduct the interview

1. **State your purpose before starting**: Declare "Let me ask some questions to understand X correctly"
2. **Avoid obvious questions. Limit to 3 questions maximum**: Look up things you can find in the code or context yourself. Only ask about judgments, intentions, and priorities that only the user can answer
3. **Know when to stop**: Once you have enough information, stop and move forward. End with "Is there anything else you want me to confirm?"
