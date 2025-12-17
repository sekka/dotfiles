# JavaScript パターン

DOM操作、イベントハンドリング、非同期処理、ユーティリティに関するナレッジ集。

---

## ブロックリンク（カードUI）のアクセシブルな実装

> 出典: https://yuheiy.com/2025-04-17-building-better-block-links
> 執筆日: 2025-04-17
> 追加日: 2025-12-17

カードUI全体をクリック可能にしつつ、アクセシビリティの問題を解決するJavaScriptパターン。従来のCSS疑似要素（stretched link）手法の欠点を克服する。

### なぜこの方法が良いのか

**従来の stretched link 手法の問題点:**
- テキスト選択ができない
- 修飾キー（Cmd/Ctrl + クリック）が効かない
- 入れ子リンクの実装が困難

**この手法のメリット:**
- スクリーンリーダーの読み上げが冗長にならない
- テキスト選択が可能
- 修飾キー（新規タブで開く等）が正常に動作
- カード内に別リンクを配置可能

### コード例

```javascript
// @react-aria/utils の openLink を使用（修飾キー対応のため）
import { openLink } from '@react-aria/utils';

for (const card of document.querySelectorAll('.card')) {
  // カード内の主要リンクを取得
  const link = card.querySelector('h3 a');

  card.addEventListener('pointerup', (event) => {
    // カード内の別リンクをクリックした場合は何もしない
    if (event.target.closest('a:any-link')) return;

    // テキスト選択中は何もしない（選択操作を妨げない）
    if (document.getSelection().isCollapsed) {
      // openLink は修飾キーを考慮してリンクを開く
      openLink(link, event);
    }
  });
}
```

```css
.card {
  /* JSが有効な場合のみクリック可能なカーソルを表示 */
  @media (scripting: enabled) {
    cursor: pointer;
  }
}
```

### ユースケース

- ニュース記事カード
- 製品リストのアイテム
- ブログ記事プレビュー
- 検索結果のカード表示
- ダッシュボードのウィジェット

### 注意点

- **`@react-aria/utils` の使用推奨**: 修飾キー（Cmd/Ctrl/Shift + クリック）の挙動を正しく処理するため
- **JS無効環境**: 基本的なリンク機能のみに限定される（プログレッシブエンハンスメント）
- **`pointerup` を使用**: `click` ではなく `pointerup` で早期にイベントを処理
- **テキスト選択の考慮**: `getSelection().isCollapsed` でドラッグ選択を妨げない

### 関連

- アクセシビリティ観点の詳細は `accessibility.md` も参照

---
