---
name: improve-html
description: HTMLのセマンティクス・アクセシビリティ・ARIA属性を網羅的にチェックし改善提案を行う。「HTML改善」「a11yチェック」「アクセシビリティ」「ARIA」「セマンティクス」「マークアップ改善」で起動。
---

# HTML セマンティクス・アクセシビリティチェック

マークアップのセマンティクス・アクセシビリティ・ARIA属性をルールベースで網羅的にチェックし、具体的な改善提案を行う。

## 進捗報告ルール（必須）

各Phase開始時・完了時にユーザーに進捗を報告すること。報告フォーマット:

```
[HTML Check Phase N/4] {Phase名} — {状態}
  検出: errors=X, warnings=Y, info=Z
  次: {次のアクション}
```

## 実行ルール（必須）

- **check-html.ts の実行は常にサブエージェント（implementer）に委譲する。** メインエージェントのコンテキストを消費しない。
- サブエージェントにはファイルパス/URL、期待する出力形式を明示して渡す。
- サブエージェント完了後、メインエージェントはJSON結果を元に定性分析とレポートを作成する。

## 前提条件チェック（必須・最初に実行）

スキル起動時、**他の一切の作業より先に**以下を確認し、失敗したら即座にユーザーに報告して停止する:

```bash
CHECK_HTML="$HOME/.claude/skills/improve-html/scripts/check-html.ts"
test -f "$CHECK_HTML" || { echo "ERROR: $CHECK_HTML が見つかりません"; exit 1; }
command -v bun >/dev/null || { echo "ERROR: bun がインストールされていません"; exit 1; }
```

両方パスしたら次のPhaseに進む。失敗したらユーザーに報告して終了。

## 入力タイプ

| 入力 | 処理 |
|------|------|
| ファイルパス（.html） | そのまま check-html.ts に渡す |
| URL | ブラウザツールでHTML取得 → 一時ファイルに保存 → check-html.ts |
| git diff | 変更されたHTML/TSX/JSXファイルを特定 → 各ファイルをチェック |
| コードブロック | 一時ファイルに保存 → check-html.ts |

URL入力の場合、ブラウザ自動化ツール（chrome MCP）を使用してページを取得する。

## ワークフロー

### Phase 1: 入力の準備

1. 入力タイプを判定
2. URLの場合: ブラウザツールでページHTMLを取得し `/tmp/html-check/` に保存
3. git diffの場合: 変更ファイルを特定

### Phase 2: 自動チェック（サブエージェント委譲）

implementer サブエージェントに以下を実行させる:

```bash
bun "$CHECK_HTML" <file> --format=json --severity=info
```

複数ファイルの場合は glob パターンまたは個別実行。

JSON結果を受け取る。

### Phase 3: 定性分析（Claude推論）

自動チェックでは検出困難な以下を分析:

- **文脈に応じたARIA使用の適切さ**: roleの選択が用途に合っているか
- **altテキスト品質**: コンテンツを踏まえた具体性があるか
- **論理的な読み上げ順序**: DOM順序が視覚的順序と一致しているか
- **コンポーネントレベルのa11yパターン**: WAI-ARIA APGに準拠しているか
- **ナレッジベース照合**: `knowledge/cross-cutting/accessibility/` の知見を適用

パターン違反を検出した場合、`patterns/` ディレクトリの対応テンプレートを参照して正しい実装例を提示する。

### Phase 4: レポート生成

Markdown形式で以下を出力:

```markdown
# HTML セマンティクス・アクセシビリティレポート

## サマリー

| カテゴリ | Error | Warning | Info |
|---------|-------|---------|------|
| ARIA属性 | 2 | 1 | 0 |
| ...     | ...   | ...     | ...  |

## 課題一覧（優先度順）

### Error: [rule-id] ルール名
- **要素**: `<element ...>`
- **WCAG**: 達成基準 X.Y.Z
- **影響**: 支援技術ユーザーへの具体的影響
- **修正例**:
  ```html
  修正後のコード
  ```

### Warning: ...

## 定性分析の所見

（Phase 3で検出した構造的な問題や改善提案）

## 参考パターン

（違反に関連するAPGパターンへのリンク）
```

## プロジェクト設定

プロジェクトルートに `.htmlcheckrc.yaml` がある場合、CLI が自動で読み込む:

```yaml
ignore:
  - seo-meta-description    # 特定ルールを無視
severity_overrides:
  heading-hierarchy: error   # severity変更
custom_rules: []             # カスタムルール追加
```

## ルールカテゴリ

| # | ファイル | 概要 | ルール数 |
|---|---------|------|---------|
| 01 | aria-attributes | ARIA属性の妥当性・完全性 | 15 |
| 02 | aria-widgets | ARIAウィジェットパターン | 12 |
| 03 | accessible-names | アクセシブルネーム | 8 |
| 04 | forms | フォームアクセシビリティ | 10 |
| 05 | focus-keyboard | フォーカス・キーボード | 10 |
| 06 | images-media | 画像・メディア代替テキスト | 8 |
| 07 | live-regions | ライブリージョン・動的コンテンツ | 6 |
| 08 | semantic-structure | セマンティック構造・ランドマーク | 12 |
| 09 | tables | テーブルアクセシビリティ | 5 |
| 10 | language | 言語・国際化（日本語固有含む） | 5 |
| 11 | css-a11y | CSS起因アクセシビリティ問題 | 8 |
| 12 | seo | SEO基本 | 5 |
| 13 | performance | パフォーマンス | 5 |

## リソース

- ルール定義: `rules/*.yaml`
- ARIAデータ: `data/aria-role-map.yaml`, `data/valid-aria-attrs.yaml`
- APGパターン: `patterns/*.md`
- CLIスクリプト: `~/.claude/skills/improve-html/scripts/check-html.ts`
- a11yナレッジ: `home/.claude/skills/managing-frontend-knowledge/knowledge/cross-cutting/accessibility/`
