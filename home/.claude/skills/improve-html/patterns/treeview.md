# ツリービュー (Tree View)

## 必要なARIA属性
- tree: `role="tree"`, `aria-label`
- treeitem: `role="treeitem"`, `aria-expanded`（展開可能な場合）, `aria-selected`
- group: `role="group"`（子ツリーのコンテナ）

## 最小実装例
```html
<ul role="tree" aria-label="ファイルブラウザ">
  <li role="treeitem" aria-expanded="true" aria-selected="false">
    src/
    <ul role="group">
      <li role="treeitem" aria-selected="false">index.ts</li>
      <li role="treeitem" aria-expanded="false" aria-selected="false">
        components/
        <ul role="group" hidden>
          <li role="treeitem" aria-selected="true">Button.tsx</li>
          <li role="treeitem" aria-selected="false">Modal.tsx</li>
        </ul>
      </li>
    </ul>
  </li>
  <li role="treeitem" aria-selected="false">README.md</li>
</ul>
```

## キーボード操作
- `↓`: 次の表示アイテム
- `↑`: 前の表示アイテム
- `→`: 閉じたノードを展開 / 子に移動
- `←`: 開いたノードを閉じる / 親に移動
- `Home`: 最初のアイテム
- `End`: 最後の表示アイテム
- `Enter`: アイテムを実行

## よくある間違い
- 展開可能なアイテムに`aria-expanded`がない
- サブツリーを`role="group"`でラップしていない
- `aria-level`がネストから自動推論できない場合に未指定
- フォーカス管理がない（roving tabindex未実装）
