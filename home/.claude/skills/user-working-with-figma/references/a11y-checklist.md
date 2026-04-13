# Accessibility Checklist

Detailed rules for implementing accessible UI. Referenced from the Quality Checklist in `SKILL.md`.

Source: [toranoana-lab experiment](https://toranoana-lab.hatenablog.com/entry/2026/02/19/130000) — verified with Claude Code + WCAG 2.1 AA

---

## 5 Principles

| # | Principle | WCAG |
|---|-----------|------|
| 1 | **Contrast Guaranteed** — テキストのコントラスト比 4.5:1 以上 | 1.4.3 |
| 2 | **Not Color Alone** — 色 + アイコン + テキストの3重で情報を区別 | 1.4.1 |
| 3 | **Keyboard Navigable** — 全インタラクティブ要素にフォーカスインジケーター | 2.1.1, 2.4.7 |
| 4 | **Semantic Structure** — 適切なHTML要素とARIA属性を使用 | 1.3.1, 1.3.2 |
| 5 | **Reduced Motion Respected** — prefers-reduced-motion でアニメーション無効化 | 2.3.3 |

---

## Implementation Rules

### Contrast

- [ ] Glass/半透明背景上のテキストのコントラスト比 4.5:1 以上
- [ ] フォーカスリングは背景に溶け込まない色（明るい色 or アウトライン）
- [ ] `prefers-contrast: more` 時にコントラスト比をさらに強化する

### Color & Information

- [ ] 色だけで情報を伝えない（アイコン・テキストを必ず併用）
- [ ] エラー・警告・成功状態はテキストラベルでも識別可能

### Keyboard & Focus

- [ ] 全インタラクティブ要素（button, a, input, select）がTab操作可能
- [ ] フォーカス順序が視覚的な読み順と一致する
- [ ] モーダル等はフォーカストラップを実装する

### HTML Semantics

- [ ] `<caption>` と `scope` 属性をテーブルに付与
- [ ] プレースホルダーをラベル代わりにしない（`<label>` を必ず用意）
- [ ] DOM順序 = 視覚順序（`order` CSS で視覚だけ入れ替える禁止）
- [ ] 見出し階層を遵守（h1→h2→h3、レベル飛ばし禁止）
- [ ] ランドマーク設定（`<header>` `<nav>` `<main>` `<footer>` + aria-label）
- [ ] スキップリンク設置（`<a href="#main-content">` を先頭に配置）

### Motion & Transparency

- [ ] `prefers-reduced-motion: reduce` でトランジション/アニメーション無効化
- [ ] `prefers-reduced-transparency` 対応（Glass UI では特に重要）

### Touch Targets

- [ ] 最小タッチターゲットサイズ: 44×44px（モバイル）

---

## Verification Notes

> **Lighthouse over-trusts CSS.** スコアが高くても実際の a11y 問題の2〜3割しか検出できない。
> 数値指定（コントラスト比）はAIに忠実に実装されるが、構造指示（caption, scope, スキップリンク）は
> スキルファイルが長いと末尾でドロップアウトするリスクがある。

- 自動ツールの補完として必ず人による目視確認を行う
- コントラスト比の実測は `axe DevTools` または Chrome DevTools の Accessibility タブで確認
