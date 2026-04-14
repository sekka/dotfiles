# CSS 下線表現テクニック

## 概要

CSSで下線を引く方法は、シンプルな`text-decoration: underline`から、グラデーションを使った装飾的な表現まで様々です。ホバーアニメーション、カラフルな下線、波線など、用途に合わせた実装方法を理解することで、リンクやテキストの表現力が大幅に向上します。

## 基本的な使い方

### text-decoration プロパティ

最もシンプルで標準的な方法。

```css
/* 基本の下線 */
a {
  text-decoration: underline;
}

/* 詳細な指定 */
a {
  text-decoration-line: underline;        /* 線の種類 */
  text-decoration-color: #667eea;         /* 線の色 */
  text-decoration-style: solid;           /* 線のスタイル */
  text-decoration-thickness: 2px;         /* 線の太さ */
}

/* ショートハンド */
a {
  text-decoration: underline #667eea solid 2px;
}
```

### 線のスタイル

```css
/* 様々な線スタイル */
.solid { text-decoration-style: solid; }      /* 実線（デフォルト） */
.double { text-decoration-style: double; }    /* 二重線 */
.dotted { text-decoration-style: dotted; }    /* 点線 */
.dashed { text-decoration-style: dashed; }    /* 破線 */
.wavy { text-decoration-style: wavy; }        /* 波線 */
```

### 下線の位置調整

```css
a {
  text-decoration: underline;
  text-underline-offset: 0.3em; /* 下線とテキストの間隔 */
  text-decoration-thickness: 2px;
}
```

## ホバーアニメーション

### 左から右へスライドイン

```css
a {
  position: relative;
  text-decoration: none;
  color: #333;
}

a::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: -2px;
  width: 0;
  height: 2px;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  transition: width 0.3s ease;
}

a:hover::after {
  width: 100%;
}
```

### 中央から左右へ展開

```css
a {
  position: relative;
  text-decoration: none;
}

a::after {
  content: '';
  position: absolute;
  left: 50%;
  bottom: -2px;
  width: 0;
  height: 2px;
  background: #667eea;
  transition: all 0.3s ease;
  transform: translateX(-50%);
}

a:hover::after {
  width: 100%;
}
```

### フェードイン

```css
a {
  position: relative;
  text-decoration: none;
}

a::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: -2px;
  width: 100%;
  height: 2px;
  background: #667eea;
  opacity: 0;
  transition: opacity 0.3s ease;
}

a:hover::after {
  opacity: 1;
}
```

## グラデーション下線

### background-image を使った手法

`text-decoration`ではグラデーションが使えないため、`background-image`で実装します。

```css
a {
  text-decoration: none;
  background-image: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  background-position: 0 100%;
  background-repeat: no-repeat;
  background-size: 100% 2px;
  padding-bottom: 2px;
}

/* ホバーで太くする */
a:hover {
  background-size: 100% 4px;
  transition: background-size 0.3s ease;
}
```

### カラフルなアニメーション下線

```css
a {
  position: relative;
  text-decoration: none;
  background: linear-gradient(
    90deg,
    #ff6b6b,
    #f9ca24,
    #6ab04c,
    #4834d4,
    #eb4d4b
  );
  background-size: 200% 2px;
  background-position: 0 100%;
  background-repeat: no-repeat;
  animation: gradient-shift 3s linear infinite;
}

@keyframes gradient-shift {
  0% {
    background-position: 0% 100%;
  }
  100% {
    background-position: 200% 100%;
  }
}
```

## 波線・ギザギザ下線

### SVG を使った波線

```css
a {
  text-decoration: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 4'%3E%3Cpath fill='none' stroke='%23667eea' stroke-width='1' d='M0,3 Q5,0 10,3 T20,3'/%3E%3C/svg%3E");
  background-position: 0 100%;
  background-repeat: repeat-x;
  background-size: 20px 4px;
  padding-bottom: 4px;
}
```

### ギザギザ下線

```css
a {
  text-decoration: none;
  background-image: linear-gradient(
    45deg,
    transparent 65%,
    #667eea 65%,
    #667eea 70%,
    transparent 70%
  ), linear-gradient(
    -45deg,
    transparent 65%,
    #667eea 65%,
    #667eea 70%,
    transparent 70%
  );
  background-position: 0 100%;
  background-repeat: repeat-x;
  background-size: 8px 4px;
  padding-bottom: 4px;
}
```

## マーカー風の下線

蛍光ペンで引いたような太い下線。

```css
a {
  position: relative;
  text-decoration: none;
  background: linear-gradient(transparent 60%, #ffeb3b 60%, #ffeb3b 85%, transparent 85%);
  transition: background 0.3s ease;
}

a:hover {
  background: linear-gradient(transparent 50%, #ffeb3b 50%, #ffeb3b 95%, transparent 95%);
}
```

## 点線アニメーション

```css
a {
  position: relative;
  text-decoration: none;
  border-bottom: 2px dashed #667eea;
  animation: dash-move 0.5s linear infinite;
}

@keyframes dash-move {
  to {
    border-bottom-color: #764ba2;
  }
}
```

## 二重線

```css
a {
  text-decoration: none;
  border-bottom: 3px double #667eea;
  padding-bottom: 2px;
}

/* または */
a {
  text-decoration-line: underline;
  text-decoration-style: double;
  text-decoration-color: #667eea;
  text-decoration-thickness: 3px;
  text-underline-offset: 2px;
}
```

## 使用場面

- **リンクテキスト**: ホバー時の視覚的フィードバック
- **見出し**: 装飾的なアクセント
- **強調表現**: マーカー風の強調
- **ナビゲーションメニュー**: アクティブ状態の表示
- **引用文**: 引用元の明示

## アクセシビリティの注意点

- 下線はリンクの視覚的な手がかりとして重要
- 色だけで区別せず、下線やアイコンを併用
- コントラスト比を確保（WCAG 2.1 AA基準: 4.5:1以上）
- ホバー時のアニメーションは速すぎないこと（0.3秒程度を推奨）

```css
/* 良い例: 色 + 下線 */
a {
  color: #0066cc;
  text-decoration: underline;
}

/* 悪い例: 色だけで区別 */
a {
  color: #0066cc;
  text-decoration: none; /* 視覚障害者が判別困難 */
}
```

## ブラウザサポート

### text-decoration 関連プロパティ

- `text-decoration-thickness`: Chrome 89+, Firefox 70+, Safari 12.1+
- `text-underline-offset`: Chrome 87+, Firefox 70+, Safari 12.1+
- `text-decoration-style: wavy`: Chrome 57+, Firefox 6+, Safari 12.1+

### background-image による下線

- 全モダンブラウザでサポート
- IE11でも使用可能

## パフォーマンスの注意点

- `background-image`を使った手法は、`text-decoration`よりわずかに重い
- アニメーションは`transform`や`opacity`を優先（リフローを避ける）
- 大量のテキストにグラデーション下線を適用する場合は注意

```css
/* パフォーマンス良: transformを使用 */
a::after {
  transform: scaleX(0);
  transition: transform 0.3s ease;
}

a:hover::after {
  transform: scaleX(1);
}

/* パフォーマンス悪: widthを使用（リフロー発生） */
a::after {
  width: 0;
  transition: width 0.3s ease;
}

a:hover::after {
  width: 100%;
}
```

## 出典

- [CSSで下線を引く方法まとめ - 様々な装飾方法とアニメーションに適した指定まで - ICS MEDIA](https://ics.media/entry/230123/)
- [HTMLとCSSでつくる！ リンクテキストのホバー時アニメーション11選 - ICS MEDIA](https://ics.media/entry/240801/)
- [コピペ可能！ナビメニューやリンクの参考にしたいCSSホバーエフェクト集まとめ | PhotoshopVIP](https://photoshopvip.net/127960)
- [MDN Web Docs: text-decoration](https://developer.mozilla.org/en-US/docs/Web/CSS/text-decoration)
