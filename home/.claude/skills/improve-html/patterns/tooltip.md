# ツールチップ (Tooltip)

## 必要なARIA属性
- tooltip: `role="tooltip"`, `id`
- トリガー: `aria-describedby`（tooltip IDを参照）

## 最小実装例
```html
<button aria-describedby="tip-save">
  <svg aria-hidden="true"><!-- save icon --></svg>
  <span class="visually-hidden">保存</span>
</button>
<div id="tip-save" role="tooltip" hidden>
  変更を保存します (Ctrl+S)
</div>
```

## キーボード操作
- フォーカスで表示、ブラーで非表示
- `Escape`: ツールチップを非表示
- ホバーでも表示（マウスユーザー向け）

## よくある間違い
- `aria-label`をツールチップ代わりに使用（ツールチップ内容が視覚的に見えない）
- トリガーに`aria-describedby`がない
- キーボードフォーカスで表示されない
- `Escape`で閉じられない
- ツールチップが素早く消えて読めない
