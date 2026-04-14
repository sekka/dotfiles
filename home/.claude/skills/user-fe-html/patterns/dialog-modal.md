# モーダルダイアログ (Modal Dialog)

## 必要なARIA属性
- dialog: `role="dialog"`, `aria-modal="true"`, `aria-labelledby`
- 閉じるボタン: アクセシブルネーム

## 最小実装例（native dialog）
```html
<dialog id="my-dialog" aria-labelledby="dialog-title">
  <h2 id="dialog-title">確認</h2>
  <p>この操作を実行しますか？</p>
  <button onclick="this.closest('dialog').close()">キャンセル</button>
  <button onclick="confirm()">OK</button>
</dialog>
```

## 最小実装例（ARIA）
```html
<div role="dialog" aria-modal="true" aria-labelledby="dlg-title" aria-describedby="dlg-desc">
  <h2 id="dlg-title">確認</h2>
  <p id="dlg-desc">この操作は取り消せません。</p>
  <button>キャンセル</button>
  <button>OK</button>
</div>
```

## キーボード操作
- `Escape`: ダイアログを閉じる
- `Tab` / `Shift+Tab`: ダイアログ内でフォーカス循環（フォーカストラップ）
- オープン時: 最初のフォーカス可能要素にフォーカス
- クローズ時: トリガー要素にフォーカスを戻す

## よくある間違い
- `aria-modal`がない（背景コンテンツにアクセスできてしまう）
- フォーカストラップがない
- `Escape`で閉じられない
- 閉じた後にフォーカスが戻らない
- アクセシブルネームがない
