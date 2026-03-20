# ディスクロージャー (Disclosure / Toggle)

## 必要なARIA属性

### ネイティブHTML（推奨）
- `<details>` + `<summary>`: ARIA不要、ブラウザがネイティブサポート

### ARIAアプローチ
- トリガー: `<button>`, `aria-expanded`, `aria-controls`
- パネル: `id`（aria-controlsの参照先）

## 最小実装例（native details/summary）
```html
<details>
  <summary>詳細を表示</summary>
  <p>追加情報がここに表示されます。</p>
</details>
```

## 最小実装例（ARIAアプローチ）
```html
<button aria-expanded="false" aria-controls="detail-panel">
  詳細を表示
</button>
<div id="detail-panel" hidden>
  <p>追加情報がここに表示されます。</p>
</div>
```

## キーボード操作
- `Enter` / `Space`: 開閉トグル

## よくある間違い
- ネイティブ`<details>`/`<summary>`が使えるのにARIAで再実装
- `<div>`をトリガーに使用（キーボード操作不可）
- `aria-expanded`がない（開閉状態が伝わらない）
- `aria-controls`の参照先が存在しない
