---
title: HTML select・option タグの新しいカスタマイズ方法
category: html
tags: [select, option, form, appearance, customization, picker]
browser_support: Chrome 134+, Edge 134+（2025年3月時点）
created: 2025-02-01
updated: 2025-02-01
---

# HTML select・option タグの新しいカスタマイズ方法

## appearance: base-select による完全なスタイル制御

> 出典: https://ics.media/entry/250307/
> 執筆日: 2025-03-07
> 追加日: 2025-02-01

Chrome 134、Edge 134から `appearance: base-select` が導入され、`<select>` と `<option>` タグを完全にCSSでカスタマイズできるようになった。従来のJavaScriptライブラリ不要で、ネイティブフォーム要素を保ちながらデザイン自由度が大幅に向上。

### 基本設定（必須）

```css
select,
::picker(select) {
  appearance: base-select;
}
```

**重要**: `<select>` 要素と `::picker(select)` 擬似要素の**両方**に指定が必要。

### ::picker(select) 擬似要素

**役割**: ドロップダウンリストの見た目を制御

```css
::picker(select) {
  appearance: base-select;
  background: white;
  border: 1px solid #ccc;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 0.5rem;
}
```

### option タグのカスタマイズ

```html
<select>
  <option value="1">オプション1</option>
  <option value="2" selected>オプション2</option>
  <option value="3">オプション3</option>
</select>
```

```css
select,
::picker(select) {
  appearance: base-select;
}

option {
  padding: 0.75rem 1rem;
  border-radius: 4px;
  margin-bottom: 0.25rem;
}

option:hover {
  background: #f0f0f0;
}

option:checked {
  background: #007bff;
  color: white;
}
```

### 画像・アイコンの追加

```html
<select>
  <option value="apple">
    <img src="apple.png" alt="">
    りんご
  </option>
  <option value="banana">
    <img src="banana.png" alt="">
    バナナ
  </option>
</select>
```

```css
option img {
  width: 24px;
  height: 24px;
  margin-right: 0.5rem;
  vertical-align: middle;
}
```

### 区切り線（hr要素）

```html
<select>
  <option value="1">オプション1</option>
  <option value="2">オプション2</option>
  <hr>
  <option value="3">オプション3</option>
</select>
```

```css
::picker(select) hr {
  border: none;
  border-top: 1px solid #ddd;
  margin: 0.5rem 0;
}
```

### カスタムボタン

```html
<select>
  <button type="button">
    <span class="selected-value">選択してください</span>
    <span class="arrow">▼</span>
  </button>
  <option value="1">オプション1</option>
  <option value="2">オプション2</option>
</select>
```

```css
select button {
  width: 100%;
  padding: 0.75rem 1rem;
  background: white;
  border: 1px solid #ccc;
  border-radius: 4px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
}

select button:hover {
  background: #f9f9f9;
}
```

### selectedcontent 要素

**現在選択中の値を表示する専用要素**:

```html
<select>
  <button type="button">
    <selectedcontent></selectedcontent>
  </button>
  <option value="apple">
    <img src="apple.png" alt="">
    りんご
  </option>
  <option value="banana">
    <img src="banana.png" alt="">
    バナナ
  </option>
</select>
```

`<selectedcontent>` には選択中の `<option>` の内容（画像含む）が自動的に表示される。

### 説明文の非表示

**ボタンには表示せず、ドロップダウンのみに表示**:

```html
<select>
  <button type="button">
    <selectedcontent></selectedcontent>
  </button>
  <option value="1">
    <span class="label">オプション1</span>
    <span class="description">詳細説明</span>
  </option>
</select>
```

```css
/* ボタン内では説明文を非表示 */
select button .description {
  display: none;
}

/* ドロップダウンでは表示 */
::picker(select) .description {
  display: block;
  font-size: 0.875rem;
  color: #666;
  margin-top: 0.25rem;
}
```

### selectedcontentelement 属性

**外部要素に選択値を表示**:

```html
<div id="external-display"></div>

<select selectedcontentelement="external-display">
  <option value="1">オプション1</option>
  <option value="2">オプション2</option>
</select>
```

```css
#external-display {
  padding: 1rem;
  background: #f0f0f0;
  border-radius: 4px;
  margin-bottom: 1rem;
}
```

### スタイル例: マテリアルデザイン風

```css
select,
::picker(select) {
  appearance: base-select;
}

select button {
  width: 100%;
  padding: 1rem;
  background: transparent;
  border: none;
  border-bottom: 2px solid #ccc;
  border-radius: 0;
  text-align: left;
  transition: border-color 0.3s ease;
}

select button:focus {
  outline: none;
  border-bottom-color: #007bff;
}

::picker(select) {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  margin-top: 0.5rem;
}

option {
  padding: 1rem;
  transition: background 0.2s ease;
}

option:hover {
  background: #f5f5f5;
}

option:checked {
  background: #e3f2fd;
  color: #007bff;
}
```

### レスポンシブ対応

```css
/* デスクトップ */
::picker(select) {
  max-width: 400px;
}

/* モバイル */
@media (max-width: 768px) {
  ::picker(select) {
    width: 100%;
    max-height: 60vh;
    overflow-y: auto;
  }

  option {
    padding: 1.25rem;
    font-size: 1.125rem;
  }
}
```

### Android Chrome の注意点

**問題**: モバイルブラウザでドロップダウンが画面をはみ出す

**対策**:

```css
@media (max-width: 768px) {
  ::picker(select) {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    max-height: 80vh;
    border-radius: 16px 16px 0 0;
  }
}
```

### アクセシビリティ配慮

```html
<!-- aria-label で説明 -->
<select aria-label="国を選択">
  <option value="jp">日本</option>
  <option value="us">アメリカ</option>
</select>

<!-- フォーカス可視性 -->
<style>
select button:focus {
  outline: 2px solid #007bff;
  outline-offset: 2px;
}
</style>
```

### キーボードナビゲーション

ネイティブフォームの機能が保持されるため、以下が自動的に動作：

- **Tab**: フォーカス移動
- **Enter/Space**: ドロップダウン開閉
- **↑↓**: オプション選択
- **Esc**: 閉じる
- **文字入力**: 最初の文字でジャンプ

### 制限事項

- **multiple属性**: 非対応（`appearance: base-select` が無効）
- **size属性**: 非対応（リストボックス表示は不可）
- **optgroup**: スタイル制約あり（一部カスタマイズ不可）

### ブラウザサポート

**対応状況**（2025年3月時点）:
- ✅ Chrome 134+
- ✅ Edge 134+
- ❌ Safari（未対応）
- ❌ Firefox（未対応）

### フォールバック対応

```css
/* デフォルトスタイル */
select {
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}

/* 対応ブラウザのみ */
@supports (appearance: base-select) {
  select,
  ::picker(select) {
    appearance: base-select;
  }

  /* カスタムスタイル */
}
```

### JavaScriptとの連携

```javascript
const select = document.querySelector('select');

select.addEventListener('change', (e) => {
  console.log('選択値:', e.target.value);

  // 選択中のoption要素を取得
  const selectedOption = e.target.selectedOptions[0];
  console.log('選択テキスト:', selectedOption.textContent);
});
```

### ユースケース

- **カスタムデザインのセレクトボックス**: ブランドカラー、独自UI
- **画像付きオプション**: アイコン、国旗、商品画像
- **リッチコンテンツ**: 説明文、価格、評価
- **アクセシブルなフォーム**: キーボード・スクリーンリーダー対応
- **モバイル最適化**: タッチフレンドリーなUI

### 参考資料

- [Customizable select element - Chrome Developers](https://developer.chrome.com/blog/rfc-customizable-select)
- [Open UI - Select Element](https://open-ui.org/components/selectmenu/)

---
