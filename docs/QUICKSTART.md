# クイックスタート

5分で Claude Code ワークフローの基本を体験するガイドです。

---

## Step 1: 利用可能なスキルを確認する

Claude Code を起動した状態で `/` を入力するとスキル一覧が表示されます。
主要なスキルは以下の通りです（全スキル一覧は [claude-code-cheatsheet.md](./claude-code-cheatsheet.md) を参照）。

- `/superpowers:brainstorming` — 要件探索・設計
- `/superpowers:writing-plans` — 実装計画の作成
- `/superpowers:executing-plans` — 計画のレビュー付き実行
- `/user-dev-review` — コードレビューと問題修正
- `/user-dev-commit` — 変更を論理単位で分析しコミット

---

## Step 2: 基本ワークフローを体験する

基本フロー: `brainstorming → writing-plans → executing-plans → user-dev-review → user-dev-commit`

シンプルな変更なら途中のステップをスキップして、直接の実装指示から始めても構いません。
各ユースケース（新機能・バグ修正・リファクタリング等）の詳細手順は [WORKFLOW.md](./WORKFLOW.md) を参照。

---

## 次のステップ

- ワークフローの全体像・デシジョンツリー → [WORKFLOW.md](./WORKFLOW.md)
- Claude Code スキル一覧 → [claude-code-cheatsheet.md](./claude-code-cheatsheet.md)
- Zsh/Tmux/Neovim キーバインド → [CHEATSHEET.md](./CHEATSHEET.md)
