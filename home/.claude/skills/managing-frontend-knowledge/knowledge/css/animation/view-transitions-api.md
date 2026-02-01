# View Transitions API - 連続性のある画面遷移アニメーション

## 概要

View Transitions APIは、ページ遷移やDOM変更時に自動的に滑らかなアニメーションを適用できる新しいWeb技術です。従来のCSS transitionやanimation、Web Animations APIでは難しかった、DOM構造の違いを超えた連続性のあるアニメーションを、シンプルなコードで実現できます。

## 基本的な使い方

### startViewTransition()

JavaScript の `document.startViewTransition()` を使って、DOM更新をアニメーション付きで実行します。

```javascript
// 基本的な使い方
function updateContent() {
  document.startViewTransition(() => {
    // ここでDOMを更新
    document.querySelector('.content').textContent = '新しいコンテンツ';
  });
}
```

これだけで、変更前の状態から変更後の状態へ自動的にクロスフェードアニメーションが適用されます。

### view-transition-name

特定の要素に名前を付けることで、その要素だけを個別にアニメーションさせることができます。

```css
/* アニメーションさせたい要素に名前を付ける */
.hero-image {
  view-transition-name: hero;
}

.title {
  view-transition-name: title;
}
```

```javascript
function navigateToDetail() {
  document.startViewTransition(() => {
    // 一覧ページから詳細ページへ遷移
    showDetailPage();
  });
}
```

この設定により、`.hero-image`は画像として、`.title`はタイトルとして、それぞれ独立してアニメーションします。一覧ページの小さい画像が、詳細ページの大きい画像へスムーズに変形するような表現が可能です。

### アニメーションのカスタマイズ

デフォルトのクロスフェードから、独自のアニメーションに変更できます。

```css
/* 全体のアニメーション時間を変更 */
::view-transition-old(root),
::view-transition-new(root) {
  animation-duration: 0.5s;
}

/* 特定の要素のアニメーションをカスタマイズ */
::view-transition-old(hero),
::view-transition-new(hero) {
  animation-duration: 0.8s;
  animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

/* スライドインアニメーション */
@keyframes slide-in {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

::view-transition-new(root) {
  animation-name: slide-in;
}
```

### SPA（Single Page Application）での使用例

```javascript
// React での例
function navigateWithTransition(to) {
  if (!document.startViewTransition) {
    // フォールバック: APIが使えない場合は通常のナビゲーション
    navigate(to);
    return;
  }

  document.startViewTransition(() => {
    flushSync(() => {
      navigate(to);
    });
  });
}
```

### MPA（Multi Page Application）での使用

Chrome 126以降では、通常のページ遷移（リンククリック）でもView Transitions APIが使えます。

```css
/* ページ全体にView Transitionを有効化 */
@view-transition {
  navigation: auto;
}
```

```html
<!-- HTML側の設定 -->
<meta name="view-transition" content="same-origin">
```

## 使用場面

- **画像ギャラリー**: サムネイルから拡大表示への滑らかな遷移
- **リスト→詳細遷移**: 一覧アイテムが詳細ページへ展開するアニメーション
- **タブ切り替え**: タブコンテンツの滑らかな入れ替え
- **モーダル表示**: 要素がモーダルに変形する演出
- **テーマ切り替え**: ライトモード/ダークモードの切り替えアニメーション

## 実用例: 画像ギャラリー

```html
<div class="gallery">
  <img src="image1.jpg" class="thumbnail" data-id="1">
  <img src="image2.jpg" class="thumbnail" data-id="2">
</div>

<div class="lightbox" style="display: none;">
  <img src="" class="lightbox-image">
</div>
```

```css
.thumbnail {
  view-transition-name: var(--thumbnail-id);
}

.lightbox-image {
  view-transition-name: var(--thumbnail-id);
}
```

```javascript
document.querySelectorAll('.thumbnail').forEach(thumb => {
  thumb.addEventListener('click', (e) => {
    const id = e.target.dataset.id;

    document.startViewTransition(() => {
      // サムネイルを非表示
      document.querySelector('.gallery').style.display = 'none';

      // ライトボックスを表示
      const lightbox = document.querySelector('.lightbox');
      lightbox.style.display = 'block';
      lightbox.querySelector('img').src = e.target.src;
      lightbox.querySelector('img').style.setProperty('--thumbnail-id', `image-${id}`);
    });
  });
});
```

## ブラウザサポート

- Chrome: 111+ (2023年3月)
- Edge: 111+ (2023年3月)
- Safari: 18+ (2024年9月) - 部分的サポート
- Firefox: 未対応（開発中）

**重要:** 機能検出を行い、未対応ブラウザではフォールバックを用意すること。

```javascript
if (!document.startViewTransition) {
  // フォールバック処理
  updateDOM();
} else {
  document.startViewTransition(() => updateDOM());
}
```

## パフォーマンスの注意点

- View Transitionsは重い処理なので、多用しすぎない
- アニメーション中はユーザー操作を受け付けないため、短時間（0.3〜0.5秒）に抑える
- 大量の要素に`view-transition-name`を付けるとパフォーマンスが低下
- 実機でパフォーマンスを確認すること（特にモバイル）

## 出典

- [View Transitions API入門 - 連続性のある画面遷移アニメーションを実現するウェブの新技術 - ICS MEDIA](https://ics.media/entry/230510/)
- [MDN Web Docs: View Transitions API](https://developer.mozilla.org/en-US/docs/Web/API/View_Transitions_API)
