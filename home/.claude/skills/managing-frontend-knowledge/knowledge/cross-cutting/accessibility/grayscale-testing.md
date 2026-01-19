---
title: グレースケール表示のアクセシビリティチェック
category: cross-cutting/accessibility
tags: [grayscale, accessibility, color-blindness, filter, wcag, 2025]
browser_support: モダンブラウザ
created: 2026-01-19
updated: 2026-01-19
---

# グレースケール表示のアクセシビリティチェック

> 出典: https://www.tak-dcxi.com/article/grayscale-display-should-be-added-to-post-implementation-checklist
> 執筆日: 2025年
> 追加日: 2026-01-19

ウェブ実装後のチェックリストに**グレースケール表示確認**を追加すべき理由と実装方法。色覚特性のある利用者の見え方をシミュレートします。

## なぜグレースケール表示をチェックするのか

### 対象ユーザー

1. **色覚特性のある利用者**
   - 日本人男性の約5%、女性の約0.2%
   - 全色覚タイプをカバーするわけではないが、基本チェックとして有効

2. **スマートフォン依存防止のためグレースケール利用者**
   - iOSやAndroidの設定で画面をグレースケール化
   - 刺激を減らすために使用

3. **電子ペーパーデバイスユーザー**
   - Kindle、電子書籍リーダー
   - モノクロ表示環境

### WCAG達成基準との関連

**WCAG 2.1 達成基準 1.4.1 色の使用（レベルA）**

> 色が、情報を伝える、動作を示す、反応を促す、又は視覚的な要素を判別するための唯一の視覚的手段になっていない。

色のみに依存したデザインは避ける必要があります。

## グレースケール表示のシミュレーション

### CSSフィルターによる実装

```css
body {
  filter: grayscale(1);
}
```

このシンプルなCSSルールで、ページ全体をグレースケールに変換できます。

### ブラウザ開発者ツールの使用

#### Chrome DevTools

1. DevToolsを開く（F12またはCmd+Opt+I）
2. Rendering パネルを開く（Command Menu > Show Rendering）
3. "Emulate vision deficiencies" で "Achromatopsia"（全色盲）を選択

#### Firefox DevTools

1. DevToolsを開く（F12またはCmd+Opt+I）
2. アクセシビリティパネル
3. "Simulate" で色覚シミュレーションを選択

## チェックポイント

### 1. 色のみに依存した情報伝達

```html
<!-- ❌ 非推奨：色のみで判別 -->
<p style="color: red;">必須項目</p>
<p style="color: green;">任意項目</p>

<!-- ✅ 推奨：記号やテキストも併用 -->
<p><span style="color: red;">*</span> 必須項目</p>
<p>任意項目</p>
```

### 2. ホバー状態やフォーカス状態

色変化のみで判別不可にしないことが重要です。

```css
/* ❌ 非推奨：色変化のみ */
.button {
  background-color: #3b82f6;
}
.button:hover {
  background-color: #2563eb;
}

/* ✅ 推奨：明度変化や形状変化も追加 */
.button {
  background-color: #3b82f6;
  transition: transform 0.2s;
}
.button:hover {
  background-color: #2563eb;
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
```

### 3. リンクテキストの識別

```css
/* ❌ 非推奨：色のみで識別 */
a {
  color: blue;
  text-decoration: none;
}

/* ✅ 推奨：下線を維持 */
a {
  color: blue;
  text-decoration: underline;
}

/* ✅ または：ホバー時に下線表示 */
a {
  color: blue;
  text-decoration: none;
}
a:hover {
  text-decoration: underline;
}
```

### 4. グラフやチャート

色のみで区別されるグラフは、パターンやラベルも併用します。

```html
<!-- ✅ 推奨：パターンとラベル併用 -->
<svg>
  <rect fill="url(#pattern-1)" />
  <text>売上</text>
  <rect fill="url(#pattern-2)" />
  <text>利益</text>
</svg>

<defs>
  <pattern id="pattern-1">
    <!-- ストライプパターン -->
  </pattern>
  <pattern id="pattern-2">
    <!-- ドットパターン -->
  </pattern>
</defs>
```

### 5. ステータス表示

```html
<!-- ❌ 非推奨：色のみで状態表示 -->
<span style="color: green;">●</span> オンライン
<span style="color: red;">●</span> オフライン

<!-- ✅ 推奨：アイコンやテキストも使用 -->
<span style="color: green;">✓</span> オンライン
<span style="color: red;">✗</span> オフライン
```

## 実装時の注意点

### 1. 濃い色のグレースケール変換

濃い赤などの色はグレースケール表示で確認しにくい場合があります。

```css
/* 赤色のボタン */
.danger-button {
  background-color: #dc2626; /* 濃い赤 */
}

/* グレースケールで暗くなりすぎる場合、明度を調整 */
@media (prefers-contrast: more) {
  .danger-button {
    background-color: #ef4444; /* やや明るい赤 */
  }
}
```

### 2. コントラスト比の確保

グレースケール時もコントラスト比4.5:1以上を維持します。

```css
/* コントラスト比をチェック */
.text {
  color: #1f2937; /* 濃いグレー */
  background-color: #ffffff; /* 白 */
  /* コントラスト比: 16.9:1 (十分) */
}
```

### 3. アイコンとテキストの併用

```html
<!-- ✅ 推奨：アイコン + テキスト -->
<button>
  <svg aria-hidden="true"><!-- 保存アイコン --></svg>
  保存
</button>

<!-- ❌ 非推奨：アイコンのみ -->
<button aria-label="保存">
  <svg><!-- 保存アイコン --></svg>
</button>
```

## テストワークフロー

### 1. 開発時の確認

```css
/* 開発用のデバッグCSS */
.debug-grayscale body {
  filter: grayscale(1);
}
```

ブラウザの拡張機能でクラスを切り替えて確認します。

### 2. 自動テストへの組み込み

視覚的回帰テストツール（Percy、Chromatic等）でグレースケール表示のスナップショットを取得します。

```javascript
// Playwrightでのテスト例
await page.addStyleTag({
  content: 'body { filter: grayscale(1); }'
});
await page.screenshot({ path: 'grayscale.png' });
```

### 3. 色覚タイプ別シミュレーション

グレースケールだけでなく、各色覚タイプのシミュレーションも実施します。

- **1型色覚（P型）** - 赤の感度が低い
- **2型色覚（D型）** - 緑の感度が低い
- **3型色覚（T型）** - 青の感度が低い

Chrome DevToolsの"Emulate vision deficiencies"で確認できます。

## チェックリスト

実装後の確認項目：

- [ ] リンクは下線または他の視覚的手がかりで識別可能
- [ ] ボタンのホバー状態は色以外でも判別可能
- [ ] フォームエラーは色だけでなくテキストも表示
- [ ] 必須項目は記号やテキストで明示
- [ ] グラフは色以外のパターンやラベル併用
- [ ] ステータス表示は色以外の要素も使用
- [ ] コントラスト比は4.5:1以上を維持

## ブラウザ対応

| ブラウザ | filter: grayscale | 開発者ツールシミュレーション |
|---------|-------------------|------------------------|
| Chrome | ○ | ○ |
| Edge | ○ | ○ |
| Firefox | ○ | ○ |
| Safari | ○ | ○ |

全モダンブラウザで`filter: grayscale()`がサポートされています。

## 関連ナレッジ

- [強制カラーモード対応](./forced-colors-mode.md)
- [WAI-ARIA基礎](./wai-aria-basics.md)
- [リンク下線の実装](./link-underline.md)
- [クリックターゲット領域](./click-target-areas.md)

## 参考リンク

- [WCAG 2.1: 1.4.1 色の使用](https://www.w3.org/WAI/WCAG21/Understanding/use-of-color.html)
- [MDN: filter](https://developer.mozilla.org/en-US/docs/Web/CSS/filter)
- [Chrome DevTools: Emulate vision deficiencies](https://developer.chrome.com/docs/devtools/accessibility/vision-deficiencies/)
- [色覚シミュレーションツール一覧](https://www.color-blindness.com/coblis-color-blindness-simulator/)
