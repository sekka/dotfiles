# ライブラリ・ツール

JavaScriptライブラリとツールのナレッジ集。ライブラリ選定、実装ガイド、スニペット集を提供。

---

## カテゴリ

### [animation/](animation/) - アニメーションライブラリ
JavaScriptアニメーションライブラリの概要と採用判断基準。

- [gsap-overview.md](animation/gsap-overview.md) - GSAP（GreenSock Animation Platform）概要

### [snippets/](snippets/) - コードスニペット集
実用的なCSS/JavaScriptスニペット集。

- [css-js-2025.md](snippets/css-js-2025.md) - CSS/JSスニペット50選（2025年版）

---

## ライブラリナレッジの構成

各ライブラリナレッジには以下の情報を含む:

### 基本情報
- GitHubリポジトリ
- Stars数（人気度指標）
- 最終リリース日（メンテナンス状況）
- ライセンス

### 概要
- ライブラリの目的と特徴
- 主要機能
- ユースケース

### 採用判断の目安
- ✅ 推奨する場面
- ❌ 避けるべき場面

---

## 使い方

### ライブラリ選定時

```
質問: "アニメーションライブラリを導入したい"

1. animation/ カテゴリを参照
2. 各ライブラリの「採用判断の目安」を確認
3. プロジェクト要件と照合
```

### スニペット活用時

```
質問: "特定のUIパターンを実装したい"

1. snippets/ カテゴリを参照
2. 該当するスニペットを検索
3. コードをコピー&カスタマイズ
```

---

## 関連カテゴリ

- [javascript/patterns/](../javascript/patterns/) - JavaScriptデザインパターン
- [css/animation/](../css/animation/) - CSSアニメーション
- [cross-cutting/performance/](../cross-cutting/performance/) - パフォーマンス最適化

---

## ライブラリ追加ガイドライン

新規ライブラリを追加する際のフォーマット:

```markdown
# [ライブラリ名]

## 基本情報
- GitHub: [URL]
- Stars: ⭐ [数] ([更新日]時点)
- 最終リリース: [日付]
- ライセンス: [ライセンス名]

## 概要
[1-2文の説明]

## 主要機能
- 機能1
- 機能2

## 採用判断の目安
- ✅ [推奨場面]
- ❌ [非推奨場面]

## 出典
- 公式サイト: [URL]
- ドキュメント: [URL]
```
