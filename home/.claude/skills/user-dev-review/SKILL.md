---
name: user-dev-review
description: Review code and fix found problems. Use for checking session changes, quality checks, and security audits. Triggered by "review this", "quality check", or "security check".
allowed-tools: Read, Grep, Glob, Edit, Bash
---

# Review & Improve

Review code and fix any problems found.

## Iron Law

1. Do not judge based only on code outside the diff
2. Do not make comments based on guesswork

## Flow

```
Identify target → Review → Report results → Fix → Re-verify loop
```

## Phase 1: Identify Target

### With arguments
Use the specified files or directories as the scope.

### Without arguments
```bash
git diff --name-only        # unstaged changes
git diff --cached --name-only  # staged changes
```
If there are no changed files, ask the user.

## Phase 2: Review

Get the target code with Read/Grep/Glob and evaluate it from the following perspectives.

### Check points (in priority order)

#### Security
- Injection (SQL, command, XSS)
- Hardcoded credentials or API keys
- Unsafe input handling
- Missing authentication or authorization

#### Correctness
- Logic errors, off-by-one
- Unhandled edge cases (null, empty, boundary values)
- Missing error handling
- Type mismatches

#### Performance
- O(n^2) or worse algorithms
- N+1 queries
- Unnecessary recalculation or re-rendering
- Excessive memory use

#### Maintainability
- Functions over 50 lines
- Unclear naming
- Duplicate code
- Excessive coupling

## Phase 3: Report Results

Report detected problems with priority levels.

```markdown
## Review Results

### Problems
- **[file:line]** Description of problem → Proposed fix

### Good points
- Note any implementation worth recognizing

### Summary: Security○ / Correctness○ / Performance○ / Maintainability○
```

If there are no problems, report "No issues found" and finish.

## Phase 4: Fix

When problems are detected:

1. List fix targets in priority order
2. Apply fixes using the Edit tool
3. Briefly report what was changed and why for each fix
4. After all fixes, verify that changes did not break other parts

### What not to fix
- Style preferences (follow existing code conventions)
- Proposals for excessive abstraction or generalization
- Refactoring that does not affect behavior (only if the user explicitly requests it)

## Phase 5: Re-verify Loop

If fixes were made in Phase 4, re-verify that the fixes did not introduce new problems.
Skip this phase if no problems were found in Phase 4.

### Loop conditions
- Repeat re-verification up to **2 times** (stop after 3 passes total)
- Continue to the next loop only if Critical-level problems remain
- Stop the loop and report if only Warning-level or lower problems remain

### What to do in each loop
1. Read the fixed files again
2. Re-check with the same perspectives as Phase 2 (security, correctness, performance, maintainability)
3. Apply fixes if new problems are found
4. End the loop if no new problems are found

### Final report
- Report the total number of passes and the number of problems detected and fixed in each pass
- List any remaining Warning-level or lower problems

## Scope Decision

| Situation | Action |
|------|------|
| 5 or fewer changed files | Complete within this skill |
| 6 or more changed files, or architecture-level | Suggest delegating to a reviewer agent |
