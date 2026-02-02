# ドキュメント一覧

## 概要

Claude Code の AI コーディングワークフロー関連のドキュメントをまとめています。
松尾研究所の実践的なノウハウを参考に、4つの Phase で構成されています。

---

## メインドキュメント

### 1. [AI_CODING_WORKFLOW.md](./AI_CODING_WORKFLOW.md)
**全体の概要とベストプラクティス**

- 4つの柱（Phase 1-4）の詳細
- 統合ワークフロー
- ベストプラクティスとアンチパターン
- 導入手順
- トラブルシューティング

**対象読者:** 全体像を理解したい人、設定を深く知りたい人

---

### 2. [QUICKSTART.md](./QUICKSTART.md)
**5分で始められるクイックスタートガイド**

- 動作確認（1分）
- 各スキルの簡単な試用
- よくあるユースケース
- 設定のカスタマイズ

**対象読者:** 初めて使う人、すぐに試したい人

---

### 3. [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md)
**開発時の実践的なチートシート**

- クイックリファレンス（状況別コマンド一覧）
- デシジョンツリー（「今、何をすべきか」のフローチャート）
- ケース別の詳細手順
- チェックリスト
- コマンドリファレンス

**対象読者:** 開発中に迷った人、コマンドを忘れた人

---

## ドキュメントの使い分け

```
初めて使う場合
  ↓
QUICKSTART.md（5分で動作確認）

全体を理解したい
  ↓
AI_CODING_WORKFLOW.md（4つの柱とベストプラクティス）

開発中に迷ったら
  ↓
DEVELOPMENT_GUIDE.md（「今、何をすべきか」をチェック）
```

---

## スキル・Hook のドキュメント

### Phase 1: 実装レビューループ

- **スキル:** `implement-with-review`
- **ドキュメント:** `../skills/implement-with-review/README.md`
- **目的:** 実装とレビューを自動的に交互実行し、品質を安定させる

---

### Phase 2: CLAUDE.md 自動同期更新

- **Hook:** `auto-sync-claude-md.ts`
- **ドキュメント:** `../hooks/auto-sync-claude-md.md`
- **目的:** コード変更時にドキュメントを自動更新し、仕様の鮮度を維持する

---

### Phase 3: コーディング規約強制

- **スキル:** `enforce-standards`
- **ドキュメント:** `../skills/enforce-standards/README.md`
- **目的:** コーディング規約を自動的にチェック・修正し、一貫性と品質を保つ

**ルール詳細:**
- `../skills/enforce-standards/rules/unused-code.md`
- `../skills/enforce-standards/rules/backward-compat.md`
- `../skills/enforce-standards/rules/console-log.md`
- `../skills/enforce-standards/rules/formatting.md`
- `../skills/enforce-standards/rules/type-safety.md`

---

### Phase 4: git worktree サポート

- **スキル:** `worktree-manager`
- **ドキュメント:** `../skills/worktree-manager/README.md`
- **Hook:** `auto-detect-worktree.ts`
- **Hook ドキュメント:** `../hooks/auto-detect-worktree.md`
- **目的:** 複数タスクの並列開発を可能にし、コンテキストを完全に分離する

---

## ディレクトリ構造

```
home/.claude/
├── docs/                              # このディレクトリ
│   ├── README.md                      # このファイル（ドキュメント一覧）
│   ├── AI_CODING_WORKFLOW.md          # 全体概要
│   ├── QUICKSTART.md                  # クイックスタート
│   └── DEVELOPMENT_GUIDE.md           # 開発ガイド
├── skills/
│   ├── implement-with-review/         # Phase 1
│   │   ├── skill.json
│   │   ├── prompt.md
│   │   ├── subagents/
│   │   │   ├── implementer.md
│   │   │   └── reviewer.md
│   │   └── README.md
│   ├── enforce-standards/             # Phase 3
│   │   ├── skill.json
│   │   ├── prompt.md
│   │   ├── rules/
│   │   │   ├── unused-code.md
│   │   │   ├── backward-compat.md
│   │   │   ├── console-log.md
│   │   │   ├── formatting.md
│   │   │   └── type-safety.md
│   │   └── README.md
│   └── worktree-manager/              # Phase 4
│       ├── skill.json
│       ├── prompt.md
│       └── README.md
└── hooks/
    ├── auto-sync-claude-md.ts         # Phase 2
    ├── auto-sync-claude-md.md
    ├── auto-detect-worktree.ts        # Phase 4
    └── auto-detect-worktree.md
```

---

## クイックリンク

### 状況別のドキュメント

| 状況 | ドキュメント |
|------|-------------|
| **初めて使う** | [QUICKSTART.md](./QUICKSTART.md) |
| **全体を理解したい** | [AI_CODING_WORKFLOW.md](./AI_CODING_WORKFLOW.md) |
| **開発中に迷った** | [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md) |
| **実装レビューループを知りたい** | [../skills/implement-with-review/README.md](../skills/implement-with-review/README.md) |
| **コーディング規約を知りたい** | [../skills/enforce-standards/README.md](../skills/enforce-standards/README.md) |
| **worktree を使いたい** | [../skills/worktree-manager/README.md](../skills/worktree-manager/README.md) |

---

## 関連リソース

### 外部リンク

- [松尾研究所の実践的なAIコーディング管理手法](https://zenn.dev/mkj/articles/868e0723efa060)
- [Git worktree 公式ドキュメント](https://git-scm.com/docs/git-worktree)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Prettier Options](https://prettier.io/docs/en/options.html)

### 内部ドキュメント

- TDD ワークフロー: `../rules/tdd-workflow.md`
- セマンティック検索: `../rules/semantic-search.md`
- 技術調査ガイド: `../rules/tech-research.md`
- レビューワークフロー: `../rules/code-review-workflow.md`
- フロントエンドナレッジ: `../rules/frontend-knowledge.md`
- セキュリティ原則: `../rules/security.md`

---

## フィードバック

問題や改善提案があれば、以下で報告してください：

- GitHub Issues: https://github.com/anthropics/claude-code/issues

---

**バージョン:** 1.0.0
**最終更新:** 2026-01-31
**ライセンス:** MIT
