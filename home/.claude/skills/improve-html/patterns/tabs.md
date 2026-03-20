# タブパネル (Tabs)

## 必要なARIA属性
- tablist: `role="tablist"`, `aria-label`
- tab: `role="tab"`, `aria-selected`, `aria-controls`, `tabindex`
- tabpanel: `role="tabpanel"`, `aria-labelledby`

## 最小実装例
```html
<div role="tablist" aria-label="サンプルタブ">
  <button role="tab" aria-selected="true" aria-controls="panel-1" id="tab-1">
    タブ1
  </button>
  <button role="tab" aria-selected="false" aria-controls="panel-2" id="tab-2" tabindex="-1">
    タブ2
  </button>
  <button role="tab" aria-selected="false" aria-controls="panel-3" id="tab-3" tabindex="-1">
    タブ3
  </button>
</div>

<div role="tabpanel" id="panel-1" aria-labelledby="tab-1">
  パネル1の内容
</div>
<div role="tabpanel" id="panel-2" aria-labelledby="tab-2" hidden>
  パネル2の内容
</div>
<div role="tabpanel" id="panel-3" aria-labelledby="tab-3" hidden>
  パネル3の内容
</div>
```

## キーボード操作
- `←` `→`: タブ間移動
- `Home`: 最初のタブ
- `End`: 最後のタブ
- `Tab`: tabpanelへ移動

## よくある間違い
- `aria-controls`の参照先IDが存在しない
- `aria-selected`が1つも`true`でない
- 非選択タブに`tabindex="-1"`がない
- `tabpanel`に`aria-labelledby`がない
- `tablist`にアクセシブルネームがない
