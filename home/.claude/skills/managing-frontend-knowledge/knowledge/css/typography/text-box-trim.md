---
title: text-box-trim - テキストの上下余白を調整
category: css/typography
tags: [text-box-trim, text-box-edge, typography, vertical-spacing, half-leading]
browser_support: Safari 18.2+, Chrome 133+, Edge 133+（Firefox 未対応 2026年1月時点）
created: 2025-02-01
updated: 2025-02-01
---

# text-box-trim - テキストの上下余白を調整

## ハーフ・レディング（半行送り）の制御

> 出典: https://ics.media/entry/250319/
> 執筆日: 2025-03-19
> 追加日: 2025-02-01

`text-box-trim` と `text-box-edge` プロパティにより、テキストの上下に自動的に追加される余白（ハーフ・レディング）をCSSで制御できる。Safari 18.2、Chrome 133、Edge 133から対応。

### ハーフ・レディング（Half-leading）とは

`line-height` が `font-size` より大きい場合、差分が上下に均等に配分される余白。

**計算例**:
- `font-size: 60px`
- `line-height: 2` → 実際の行の高さは `120px`
- 差分: `120px - 60px = 60px`
- 上下に `30px` ずつ追加される

### text-box-trim プロパティ

**値**:
- `none`（デフォルト）: 余白を残す
- `trim-both`: 上下両方の余白を削除
- `trim-start`: 上の余白のみ削除
- `trim-end`: 下の余白のみ削除

```css
.text {
  font-size: 60px;
  line-height: 2;
  text-box-trim: trim-both; /* 上下の余白を削除 */
}
```

### text-box-edge プロパティ

**トリミング基準**を指定：

- `text`（デフォルト）: テキストの実際の高さ
- `cap`: 大文字の高さ（Cap Height）
- `alphabetic`: 小文字のベースライン
- `ex`: x-height（小文字の高さ）

```css
.text {
  text-box-trim: trim-both;
  text-box-edge: cap alphabetic;
  /* 上はCap Heightから、下はベースラインまで */
}
```

### ショートハンド構文

```css
.text {
  text-box: trim-both cap alphabetic;
  /* text-box-trim text-box-edge */
}
```

### 実践例1: 角丸背景のタイトル

**問題**: デフォルトでは上下に不要な余白が入る

```css
/* 従来の方法（余白あり） */
.title {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1rem 2rem;
  border-radius: 12px;
  font-size: 2rem;
  line-height: 1.5;
}
```

**解決**: `text-box-trim` で余白削除

```css
.title {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1rem 2rem;
  border-radius: 12px;
  font-size: 2rem;
  line-height: 1.5;
  text-box: trim-both cap alphabetic;
}
```

### 実践例2: アイコンとテキストの垂直揃え

**問題**: テキストの余白でアイコンと中央揃えにならない

```html
<div class="icon-text">
  <svg class="icon">...</svg>
  <span class="label">ラベル</span>
</div>
```

```css
/* 従来の方法（微調整が必要） */
.icon-text {
  display: flex;
  align-items: center;
}

.label {
  margin-top: -2px; /* 手動で調整 */
}
```

**解決**: `text-box-trim` で自動的に揃う

```css
.icon-text {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.label {
  font-size: 1rem;
  text-box: trim-both cap alphabetic;
}
```

### 実践例3: 画像とテキストの水平レイアウト

```html
<div class="card">
  <img src="thumbnail.jpg" alt="">
  <h3 class="title">タイトル</h3>
</div>
```

```css
.card {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.card img {
  width: 100px;
  height: 100px;
  border-radius: 8px;
}

.card .title {
  font-size: 1.5rem;
  line-height: 1.4;
  text-box: trim-start cap; /* 上の余白のみ削除 */
}
```

### edge値の組み合わせ

```css
/* 大文字基準で上下トリミング */
.text-1 {
  text-box: trim-both cap cap;
}

/* 上は大文字、下はベースライン */
.text-2 {
  text-box: trim-both cap alphabetic;
}

/* x-height基準 */
.text-3 {
  text-box: trim-both ex alphabetic;
}
```

### デフォルト値の明示

```css
/* デフォルト（トリミングなし） */
.text {
  text-box-trim: none;
  text-box-edge: text;
}
```

### 段落での使用

```css
.paragraph p {
  font-size: 1rem;
  line-height: 1.8;
  text-box: trim-start cap; /* 段落の最初の行のみトリミング */
}

.paragraph p:last-child {
  text-box: trim-both cap alphabetic; /* 最後の段落は上下トリミング */
}
```

### レスポンシブ対応

```css
.title {
  font-size: 2rem;
  line-height: 1.2;
  text-box: trim-both cap alphabetic;
}

@media (max-width: 768px) {
  .title {
    font-size: 1.5rem;
    /* text-boxは自動的に調整される */
  }
}
```

### フォールバック対応

```css
/* フォールバック: paddingで調整 */
.title {
  padding: 1rem 2rem;
  background: #667eea;
}

/* 対応ブラウザではtext-boxを使用 */
@supports (text-box-trim: trim-both) {
  .title {
    padding: 0.5rem 2rem; /* paddingを減らす */
    text-box: trim-both cap alphabetic;
  }
}
```

### ブラウザサポート

**対応状況**（2026年1月時点）:
- ✅ Safari 18.2+
- ✅ Chrome 133+
- ✅ Edge 133+
- ❌ Firefox（未対応）

### アクセシビリティ配慮

```css
/* 行間が狭すぎると可読性低下 */
.text {
  line-height: 1.5; /* 最低1.5推奨 */
  text-box: trim-both cap alphabetic;
}
```

### デバッグ用の可視化

```css
.text {
  background: rgba(255, 0, 0, 0.1); /* 背景で範囲を確認 */
  text-box: trim-both cap alphabetic;
}
```

### 複数行テキストでの注意

```css
/* 複数行では最初と最後の行のみトリミング */
.multiline {
  font-size: 1.5rem;
  line-height: 1.6;
  text-box: trim-both cap alphabetic;
}
```

### ユースケース

- **見出しの背景**: 角丸やグラデーション背景の余白削減
- **アイコン+テキスト**: 垂直方向の自動揃え
- **カードレイアウト**: 画像とタイトルの配置
- **ボタン**: パディングの最適化
- **バッジ**: 小さなテキスト表示の余白制御

### 注意点

- **フォント依存**: フォントによって効果が異なる
- **複数行**: 最初と最後の行のみ影響
- **デバッグ**: DevToolsで計算値を確認
- **パフォーマンス**: 影響は最小限

### 従来の回避策との比較

| 方法 | メリット | デメリット |
|------|---------|----------|
| **負のmargin** | 互換性高い | フォント変更で調整必要 |
| **line-height: 1** | シンプル | 複数行で読みにくい |
| **text-box-trim** | 自動調整 | ブラウザサポート限定 |

### 参考資料

- [CSS Inline Layout Module Level 3 - W3C Draft](https://drafts.csswg.org/css-inline-3/)
- [Leading-Trim - Microsoft Design](https://medium.com/microsoft-design/leading-trim-the-future-of-digital-typesetting-d082d84b202)

---
