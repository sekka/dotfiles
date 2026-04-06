# メニュー / メニューバー (Menu / Menubar)

## 必要なARIA属性
- menubar: `role="menubar"`, `aria-label`
- menu: `role="menu"`
- menuitem: `role="menuitem"`
- サブメニュートリガー: `aria-haspopup="true"`, `aria-expanded`

## 最小実装例
```html
<nav aria-label="メインメニュー">
  <ul role="menubar" aria-label="メインメニュー">
    <li role="none">
      <a role="menuitem" href="/home">ホーム</a>
    </li>
    <li role="none">
      <button role="menuitem" aria-haspopup="true" aria-expanded="false" aria-controls="sub-products">
        製品
      </button>
      <ul id="sub-products" role="menu" aria-label="製品" hidden>
        <li role="none">
          <a role="menuitem" href="/products/a">製品A</a>
        </li>
        <li role="none">
          <a role="menuitem" href="/products/b">製品B</a>
        </li>
      </ul>
    </li>
    <li role="none">
      <a role="menuitem" href="/about">会社情報</a>
    </li>
  </ul>
</nav>
```

## キーボード操作
- `←` `→`: menubar内の項目間移動
- `↓`: サブメニューを開く / サブメニュー内で次の項目
- `↑`: サブメニュー内で前の項目
- `Enter` / `Space`: 項目を実行
- `Escape`: サブメニューを閉じて親に戻る

## よくある間違い
- ナビゲーション用途に`role="menu"`を使用（navを使うべき）
- サブメニュートリガーに`aria-expanded`がない
- `aria-haspopup`がない
- `li`に`role="none"`を付けていない（リスト構造がmenu構造と干渉）
