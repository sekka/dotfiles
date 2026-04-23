---
name: user-harness-gen-skills
description: Extract patterns from Claude Code session history using 3-axis analysis (WHAT/HOW/FLOW) and auto-generate skills. Triggered by "generate skills from history" or "extract patterns".
allowed-tools: Task, Read, Glob, Grep, Write, Edit, Bash
disable-model-invocation: false
effort: high
---

<objective>
Statistically analyze Claude Code session history, identify repetitive task patterns, and turn them into skills. Discovers reusable patterns based on actual usage frequency that are easy to miss when creating skills manually.

Relationship with the learn skill: The learn skill extracts knowledge in real time from the current session, while this skill analyzes all past session history across sessions to discover statistical patterns.
</objective>

<iron_law>

## Iron Law

1. Do not turn one-time operations into skills — skills exist to codify repeatable patterns; unique operations add noise and dilute the trigger matching quality.

</iron_law>

<quick_start>
How to start:

```
Generate skills from history
Extract patterns from session logs
```

Basic execution flow:

1. Select scope (interactive)
2. Collect session history and CLI history
3. Extract patterns using 3-axis analysis (WHAT/HOW/FLOW)
4. Evaluate skill candidates and remove duplicates
5. Generate skills based on user selection

Data sources for analysis:
- `~/.claude/projects/*/sessions-index.json` — Session metadata
- `~/.claude/projects/*/[sessionId].jsonl` — Session details
- `~/.local/state/zsh/history` — CLI operation history (optional)
</quick_start>

<workflow>
<phase_1>
**Phase 1: Confirm Scope (interactive)**

Present options to the user with AskUserQuestion:

**Question 1: Target project**
- Options:
  - "All projects (all 4)"
  - "dotfiles only"
  - "Specify a particular project"

**Question 2: Analysis period**
- Options:
  - "Last 30 days"
  - "Last 7 days"
  - "Last 60 days"
  - "Last 90 days"
  - "All time"

**Question 3: Include CLI history?**
- Options:
  - "No (session logs only)"
  - "Yes (more detailed analysis)"

After deciding the scope, proceed to Phase 2.
</phase_1>

<phase_2>
**Phase 2: Data Collection**

<step_2_1>
**Step 2-1: Collect session metadata**

Data source: `~/.claude/projects/*/sessions-index.json`

Filtering:
- Exclude entries where `isSidechain == true`
- Exclude sessions outside the specified period

Handling firstPrompt: Use only to help estimate the theme. Do not copy it directly into generated content.
</step_2_1>

<step_2_2>
**Step 2-2: Analyze history.jsonl (frequent prompts)**

Identify the most frequent user inputs:

```bash
jq -r 'select(.display | test("^[^/!]")) | .display[0:80]' ~/.claude/history.jsonl \
  | sort | uniq -c | sort -rn | head -30
```

Exclusion patterns:
- Slash commands starting with `/`
- History calls starting with `!`

Purpose:
- Used to match the WHAT axis (purpose)
- Verify alignment between summaries and actual prompts
</step_2_2>

<step_2_3>
**Step 2-3: Deep dive into session JSONL (selective)**

Target: Top 3 groups on the WHAT axis, 5 sessions each, up to 10 total.

Extract tool usage frequency:
```bash
jq -c 'select(.type=="assistant") | .message.content[]? | select(.type=="tool_use") | .name' \
  ~/.claude/projects/{project}/{sessionId}.jsonl \
  | sort | uniq -c | sort -rn | head -30
```
</step_2_3>

<step_2_4>
**Step 2-4: Collect CLI history (optional)**

Data source: `~/.local/state/zsh/history`

Extract: Frequency of git/test/build commands.
Purpose: Support the HOW axis, understand patterns outside sessions.
</step_2_4>
</phase_2>

<phase_3>
**Phase 3: Pattern Extraction — 3-axis Analysis**

<what_axis>
**WHAT Axis — Purpose Clustering**

Goal: Group sessions by "what they are for".

Steps:
1. List all summaries (use firstPrompt as a reference)
2. Group by overlapping keywords (2 or more words in common)
3. Assign a representative theme name
4. Rank by frequency
5. Cross-check with prompt frequency (summary vs actual inputs)

Example: "Docker environment setup", "Docker config fix" → "Docker Environment" group
</what_axis>

<how_axis>
**HOW Axis — Method Patterns**

Goal: Identify "how" things are accomplished.

Steps:
1. Compare tool usage frequency across sessions
2. Identify common tool combinations (top 3 in 60% or more of sessions)
3. Name the patterns:
   - `Task + Bash + Write` → "Subagent delegation"
   - `Read + Grep + Edit` → "Code research and editing"
   - `Glob + Read + Write` → "Cross-file processing"
4. Link to WHAT axis groups
</how_axis>

<flow_axis>
**FLOW Axis — Task Chains**

Goal: Discover repetitions and chains from time-series patterns.

Steps:
1. Sort by time (chronological order)
2. Analyze sequences of WHAT group labels
3. Repetition detection: Same theme 3 or more times within 7 days → repetitive pattern
4. Chain detection: Same order 2 or more times within 3 days → chain pattern
5. Pattern classification:
   - Repetitive: Regular task (high skill candidate)
   - Chain: Workflow (medium skill candidate)
   - One-off: Only once (low skill candidate)
</flow_axis>
</phase_3>

<phase_4>
**Phase 4: Skill Suitability Evaluation + Deduplication**

<evaluation_criteria>
**Evaluation Criteria**

| Criterion | Adopt (A) | Consider (B) | Reject (C) |
|------|-----------|-----------|-------------|
| Frequency | 5+ times | 3-4 times | 2 or fewer |
| Consistency | Tool variance <30% | 30-50% | >50% |
| Automation rate | >70% | 40-70% | <40% |

Decision: 2 or more A ratings → adopt, 2 or more C ratings → reject.
Consistency = 1 - (standard deviation / mean)
</evaluation_criteria>

<duplicate_detection>
**Duplicate Detection**

Steps:
1. Get existing skills: `Glob: ~/dotfiles/home/.claude/skills/*/SKILL.md`
2. Read the first 10 lines (extract name/description)
3. Keyword matching:
   - Exact match: name matches → confirmed duplicate
   - Partial match: 3 or more words in common in description → possible duplicate
   - Semantic similarity: Check synonyms
4. When a duplicate is found, exclude the candidate and show the reason
</duplicate_detection>

<fallback>
**Fallback**

If fewer than 2 candidates are found: Stop generation, report analysis results only (WHAT/HOW/FLOW rankings).
</fallback>
</phase_4>

<phase_5>
**Phase 5: User Selection**

Present candidates with AskUserQuestion:

Display information:
```
Candidate 1: docker-environment-setup
Summary: Automates Docker environment setup and configuration
Frequency: 8 times (30 days)
Related session examples:
  - Creating Docker Compose configuration
  - Container network setup
  - Image build optimization

Candidate 2: test-implementation-workflow
Summary: Standard workflow for test implementation
Frequency: 5 times (30 days)
Related session examples:
  - Creating unit tests
  - Configuring mock objects
  - Checking test coverage
```

Also show excluded candidates:
```
Excluded candidates:
- git-commit-automation: Duplicate with existing skill "learn"
- file-editing: Insufficient frequency (2 times)
```

Selection method:
- Multiple selections allowed
- "Generate all" option
- "Cancel" option
</phase_5>

<phase_6>
**Phase 6: Skill Generation + Quality Verification**

<generation_format>
**Generation Format**

frontmatter:
```yaml
---
name: {kebab-case-name}
description: {what-it-does} {when-to-use}
allowed-tools: {extracted-from-HOW-axis}
---
```

Required XML tags: objective, quick_start, workflow, success_criteria

Note: Do not copy firstPrompt directly. Abstract paths. Remove project-specific information.
</generation_format>

<quality_checks>
**Quality Checks**

Verification items: Required tags, no Markdown headings, kebab-case name, trigger phrases, no firstPrompt copied, no confidential information, under 500 lines.

On failure: Show error, suggest fix, regenerate.
</quality_checks>

<file_output>
**File Output**

Output location: `~/dotfiles/home/.claude/skills/{skill-name}/SKILL.md`

Steps: mkdir → Write → chmod 644

Include next steps in the completion message:
1. Run `empirical-prompt-tuning` to verify self-sufficiency (unclear_points = 0 is the target)
2. Manual adjustments based on eval report
3. git add
</file_output>
</phase_6>
</workflow>

<success_criteria>
Criteria for judging that skill generation succeeded:

**Data collection complete:**
- [ ] sessions-index.json loaded successfully
- [ ] Period and project filters applied
- [ ] 10 or more sessions collected

**Pattern extraction successful:**
- [ ] 3 or more groups identified on the WHAT axis
- [ ] 2 or more patterns identified on the HOW axis
- [ ] 1 or more repetitions or chains identified on the FLOW axis

**Skill generation quality:**
- [ ] 2 or more candidates generated
- [ ] Duplicate detection cross-checked with existing skills
- [ ] Generated skills comply with XML structure
- [ ] All quality checks passed

**Usability:**
- [ ] User was able to select from candidates
- [ ] Generated skills were saved to files
- [ ] Next steps were clearly presented
</success_criteria>

<anti_patterns>
<pitfall name="firstPrompt_transcription">
❌ Copying firstPrompt directly:

```yaml
description: Please set up Docker environment and configure the network
```

✅ Write in generalized form:

```yaml
description: Automates Docker environment setup and configuration. Used for Docker Compose, network settings, and image build optimization.
```
</pitfall>

<pitfall name="project_specific_paths">
❌ Contains project-specific paths:

```xml
<workflow>
Run /Users/kei/dotfiles/scripts/setup.sh
</workflow>
```

✅ Abstract it:

```xml
<workflow>
Run scripts/setup.sh in the project root
</workflow>
```
</pitfall>

<pitfall name="overfit_to_single_session">
❌ Over-fitted to a single session:

```xml
<objective>
Change the status bar color in the tmux config file.
</objective>
```

✅ Generalize as a pattern:

```xml
<objective>
Standardize config file editing and validation. Includes syntax checks, backups, and rollback functionality.
</objective>
```
</pitfall>

<pitfall name="insufficient_filtering">
❌ Forgetting to exclude isSidechain=true:

```
Analyze all 100 sessions → 80 are subagent executions
```

✅ Filter properly:

```
Extract main sessions only (20) → Find meaningful patterns
```
</pitfall>

<pitfall name="ignoring_tool_consistency">
❌ Ignoring tool usage consistency:

```
Candidate: "File processing"
Tools: Read+Edit in some sessions, Bash+Write in others
→ Inconsistent (hard to automate)
```

✅ Evaluate consistency:

```
Tool variance over 50% → Reject
Only adopt candidates with a clear pattern
```
</pitfall>

<pitfall name="cli_history_overload">
❌ Reading CLI history without limits:

```bash
Read: ~/.local/state/zsh/history
→ 1 million lines, truncated by 30K Bash output limit
```

✅ Aggregate before reading:

```bash
tail -10000 ~/.local/state/zsh/history | \
  awk '{print $2}' | sort | uniq -c | sort -rn | head -50
→ Top 50 commands only
```
</pitfall>
</anti_patterns>

<reference_guides>
**Data sources:**
- `~/.claude/projects/*/sessions-index.json` — Session metadata
- `~/.claude/history.jsonl` — Prompt history
- `~/.local/state/zsh/history` — CLI operation history
</reference_guides>

## Status

Add one of the following at the end of every response:
- `## Status: DONE` — All selected skills were generated, quality-checked, and saved to `~/dotfiles/home/.claude/skills/`
- `## Status: DONE_WITH_CONCERNS` — Skills generated but some quality checks raised warnings (e.g., possible duplicate, low frequency candidate included)
- `## Status: BLOCKED` — Cannot proceed (e.g., no session data found, fewer than 2 candidates passed evaluation)
- `## Status: NEEDS_CONTEXT` — Scope confirmation still needed (project target, period, or CLI history inclusion not answered)
