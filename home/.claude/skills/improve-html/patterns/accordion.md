# アコーディオン (Accordion)

## 必要なARIA属性
- トリガー: `<button>`, `aria-expanded`, `aria-controls`
- パネル: `role="region"`, `aria-labelledby`
- 見出し: `<h3>` 等で `<button>` をラップ

## 最小実装例
```html
<h3>
  <button aria-expanded="true" aria-controls="sect1">セクション1</button>
</h3>
<div id="sect1" role="region" aria-labelledby="sect1-btn">
  <p>セクション1の内容</p>
</div>

<h3>
  <button id="sect2-btn" aria-expanded="false" aria-controls="sect2">セクション2</button>
</h3>
<div id="sect2" role="region" aria-labelledby="sect2-btn" hidden>
  <p>セクション2の内容</p>
</div>
```

## キーボード操作
- `Enter` / `Space`: パネルの開閉
- `↓`: 次のアコーディオンヘッダー
- `↑`: 前のアコーディオンヘッダー
- `Home`: 最初のヘッダー
- `End`: 最後のヘッダー

## よくある間違い
- `<div>`を使いボタンでない（キーボード操作不可）
- `aria-expanded`がない（開閉状態が伝わらない）
- 見出し要素でラップしていない（文書構造が壊れる）
- `aria-controls`の参照先IDが存在しない
