# Claude Code ワークフロー

このdotfilesが提供するClaude Code開発体験の全体像と実践手順をまとめたドキュメントです。
具体的な行動指針は `~/.claude/CLAUDE.md`、スキル一覧は [claude-code-cheatsheet.md](./claude-code-cheatsheet.md) を参照。

---

## 全体フロー

```
brainstorming（要件探索・設計）
  ↓
writing-plans（実装計画作成）
  ↓
executing-plans（計画の実行）※worktreeで隔離してもよい
  ↓
review-and-improve（レビュー＋修正）
  ↓
verification-before-completion（完了前検証）
  ↓
commit / finishing-a-development-branch（コミット・PR作成）
```

各ステップは状況に応じてスキップ・短縮できる。
バグ修正なら `systematic-debugging → TDD → verification` で完結する。

---

## デシジョンツリー

```
何をしたいか？
  │
  ├─ 新機能を実装する
  │     → brainstorming → writing-plans → (worktree) → executing-plans → review-and-improve
  │
  ├─ バグを修正する
  │     → systematic-debugging → test-driven-development → verification-before-completion
  │
  ├─ リファクタリングする
  │     → writing-plans → executing-plans → review-and-improve
  │
  ├─ 複数タスクを並列で進める
  │     → using-git-worktrees + dispatching-parallel-agents
  │         または subagent-driven-development
  │
  ├─ コードレビューをする / 受ける
  │     → requesting-code-review / receiving-code-review
  │         または review-and-improve（自己レビュー）
  │
  ├─ PRを作成する
  │     → finishing-a-development-branch → commit-push-pr
  │
  └─ フロントエンドを実装する
        → (user-figma-implement) → user-doc-design-spec → user-fe-develop → user-fe-vrt
```

---

## ステップ別の詳細

### 1. brainstorming — 要件探索・設計

スキル: `/superpowers:brainstorming`

実装前にユーザーの意図・要件・設計を深掘りする。新機能や複雑な変更では必ず実施する。

- 何を作るか、なぜ作るか、どこまで作るかを明確にする
- 複数の設計案を出して比較する
- 曖昧さを排除してから次のステップへ進む

### 2. writing-plans — 実装計画の作成

スキル: `/superpowers:writing-plans`

brainstorming で得た要件を、チェック可能な実装計画に変換する。

- 実装ステップを箇条書きで列挙する
- 各ステップに完了基準を設定する
- 依存関係と実行順序を明確にする

計画作成後は `/user-dev-review` でプランレビューを行うことを推奨。

### 3. executing-plans — 計画の実行

スキル: `/superpowers:executing-plans`

レビューチェックポイントを挟みながら計画を実行する。

- 各チェックポイントで進捗を確認しながら進む
- 途中でうまくいかなくなったら立ち止まって再計画する
- 実装はサブエージェント（implementer）に委譲する

### 4. review-and-improve — レビューと改善

スキル: `/user-dev-review`

実装後または実装中に品質チェックと改善を行う。

- セキュリティ（OWASP Top 10）のチェック
- コーディング規約・可読性の確認
- バグや論理エラーの検出

### 5. verification-before-completion — 完了前検証

スキル: `/superpowers:verification-before-completion`

「完了した」と報告する前に、実際に動作することを証明する。

- ユニットテストの合格確認
- 実環境（ブラウザ、CLI等）での動作確認
- 変更が他の箇所を壊していないかの確認

### 6. commit / PR作成

スキル: `/user-dev-commit`, `/superpowers:finishing-a-development-branch`, `/commit-commands:commit-push-pr`

動作確認済みの変更をコミットし、必要であればPRを作成する。

---

## ケース別の手順

### 新機能を実装する

```
/superpowers:brainstorming           # 要件・設計を固める
/superpowers:writing-plans           # 実装計画を作成
/superpowers:using-git-worktrees     # （任意）隔離ブランチで作業
/superpowers:executing-plans         # 計画をレビュー付きで実行
/user-dev-review                     # レビューと修正
/superpowers:verification-before-completion  # 動作確認
/user-dev-commit                     # コミット
```

### バグを修正する

```
/superpowers:systematic-debugging    # 症状観察 → 仮説形成 → 最小再現 → 検証
/superpowers:test-driven-development # テストを書いてから修正（Red → Green）
/superpowers:verification-before-completion  # 修正確認
/user-dev-commit
```

### リファクタリングする

```
/superpowers:writing-plans           # 改善対象・方法・完了基準を明確に
/superpowers:executing-plans         # 実行
/user-dev-review             # 品質チェック
/superpowers:verification-before-completion  # 既存機能が壊れていないか確認
/user-dev-commit
```

### 複数タスクを並列で進める

```
/superpowers:using-git-worktrees     # 各タスクを worktree で分離
/superpowers:dispatching-parallel-agents  # 並列サブエージェントで実行
# または /superpowers:subagent-driven-development で全体フローを管理
```

### コードレビューをする / 受ける

```
/superpowers:requesting-code-review  # レビュー依頼の形式化
/superpowers:receiving-code-review   # フィードバックの整理・対応
/code-review:code-review             # PRのレビュー
/user-dev-review             # 自己レビュー
```

### PR を作成する

```
/superpowers:finishing-a-development-branch  # ブランチ完了処理
/commit-commands:commit-push-pr              # push + PR作成
```

### フロントエンドを実装する

```
/user-figma-implement             # Figmaデザイン確認
/user-doc-design-spec                   # UIコンポーネント設計
/user-fe-develop                  # 実装
/user-fe-vrt                      # ビジュアル回帰テスト
/user-fe-html                     # HTML品質改善（必要に応じて）
/user-dev-review                  # レビュー
```

---

## サブエージェント戦略

メインエージェントは「指揮」に専念し、調査・実装・レビューはサブエージェント（researcher / implementer / reviewer）に委譲する。
詳細は [claude-code-cheatsheet.md#サブエージェント](./claude-code-cheatsheet.md#サブエージェント) および `CLAUDE.md` セクション4 を参照。

---

## チェックリスト

### 実装開始前

- [ ] 要件は明確か？（曖昧なら `/superpowers:brainstorming` で整理）
- [ ] 複数タスクがあるか？（あれば `/superpowers:using-git-worktrees` で分離）
- [ ] 実装計画は作成済みか？（複雑な変更なら `/superpowers:writing-plans`）

### 実装中

- [ ] テストを先に書いたか？（TDD: `/superpowers:test-driven-development`）
- [ ] 不安な箇所はレビューしたか？（`/user-dev-review`）

### 実装完了後

- [ ] 実環境で動作確認したか？（`/superpowers:verification-before-completion`）
- [ ] 変更が他の箇所を壊していないか確認したか？
- [ ] コミットメッセージは適切か？（`/user-dev-commit`）

---

## ベストプラクティス

- **要件の明確化を優先する** — 曖昧なまま書いたコードは後で書き直しになる
- **実環境確認を怠らない** — テスト合格だけで完了としない。ブラウザ・CLIで動作確認する
- **サブエージェントを積極的に活用する** — 調査・実装・レビューを委譲してコンテキストを節約
- **小さく実装・小さくコミット** — 問題の切り分けとロールバックを容易にする
- **テストを先に書く** — 後から書くテストは実装に合わせて書かれるため検出力が低い
