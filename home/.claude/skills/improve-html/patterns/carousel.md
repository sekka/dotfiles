# カルーセル / スライダー (Carousel)

## 必要なARIA属性
- コンテナ: `role="region"`, `aria-roledescription="carousel"`, `aria-label`
- スライド: `role="group"`, `aria-roledescription="slide"`, `aria-label="N of M"`
- 回転制御: 一時停止ボタン、前/次ボタン

## 最小実装例
```html
<div role="region" aria-roledescription="carousel" aria-label="最新ニュース">
  <button aria-label="自動再生を停止">一時停止</button>
  <div aria-live="off">
    <div role="group" aria-roledescription="slide" aria-label="1 / 3">
      <h3>ニュース1</h3>
      <p>内容...</p>
    </div>
    <div role="group" aria-roledescription="slide" aria-label="2 / 3" hidden>
      <h3>ニュース2</h3>
      <p>内容...</p>
    </div>
    <div role="group" aria-roledescription="slide" aria-label="3 / 3" hidden>
      <h3>ニュース3</h3>
      <p>内容...</p>
    </div>
  </div>
  <button aria-label="前のスライド">前</button>
  <button aria-label="次のスライド">次</button>
</div>
```

## キーボード操作
- `Tab`: コントロール間移動
- 前/次ボタン: `Enter` / `Space`
- 一時停止ボタン: `Enter` / `Space`

## よくある間違い
- 自動回転の一時停止手段がない（WCAG 2.2.2）
- スライドにラベルがない（「1 / 3」等）
- `aria-roledescription`がない
- コントロールボタンにアクセシブルネームがない
- 自動回転中に`aria-live`を制御していない
