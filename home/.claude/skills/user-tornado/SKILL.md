# Tornado Skill

Orchestrate codex + claude-code: codex implements, claude reviews.
Trigger when user says "tornado", "use tornado", or wants a dual-agent workflow.

## Invocation

```bash
mise run tornado              # fzf で plan ファイルを選択
mise run tornado ./plan.md    # 直接指定
```

`--dev=codex --review=claude` は mise タスク側で固定済み。引数は plan ファイルのパスのみ。

## Step 1: plan.md の確認・作成

plan.md がなければ作成する。最小構成:

```markdown
# Task: {タスク名}

## Goal
{1文で目標}

## Steps
1. {step 1}
2. {step 2}

## Success criteria
- {完了条件}
```

## Step 2: tornado を起動

```bash
mise run tornado ./plan.md
```

TUI は Claude Code の内蔵ターミナルでは動かない可能性がある。
その場合は `! mise run tornado ./plan.md` で別ターミナルとして実行する。

## Step 3: 完了後

TUI 終了後、変更ファイルを `/review-and-improve` でチェックすることを提案する。

## Status: DONE
