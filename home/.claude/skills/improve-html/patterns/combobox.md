# コンボボックス (Combobox / Autocomplete)

## 必要なARIA属性
- input: `role="combobox"`, `aria-expanded`, `aria-controls`, `aria-activedescendant`, `aria-autocomplete`
- listbox: `role="listbox"`
- option: `role="option"`, `aria-selected`

## 最小実装例
```html
<label for="city-input">都市</label>
<div class="combobox-wrapper">
  <input
    id="city-input"
    role="combobox"
    aria-expanded="true"
    aria-controls="city-listbox"
    aria-activedescendant="city-opt-2"
    aria-autocomplete="list"
  >
  <ul id="city-listbox" role="listbox" aria-label="都市候補">
    <li id="city-opt-1" role="option" aria-selected="false">東京</li>
    <li id="city-opt-2" role="option" aria-selected="true">大阪</li>
    <li id="city-opt-3" role="option" aria-selected="false">名古屋</li>
  </ul>
</div>
```

## キーボード操作
- `↓`: リスト開く / 次の候補
- `↑`: 前の候補
- `Enter`: 選択確定
- `Escape`: リスト閉じる
- 文字入力: フィルタリング

## よくある間違い
- `aria-expanded`の切り替えがない
- `aria-activedescendant`が更新されない
- リスト非表示時に`aria-expanded="false"`にしていない
- `listbox`に`aria-label`がない
