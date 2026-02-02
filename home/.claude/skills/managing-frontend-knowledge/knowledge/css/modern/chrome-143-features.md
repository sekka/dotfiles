---
title: Chrome 143 の新しい CSS 機能
category: css/modern
tags: [chrome, anchor-positioning, background-position, font-language-override]
browser_support: Chrome 143+、Safari、Edge（一部機能はブラウザごとに異なる）
created: 2026-01-31
updated: 2026-01-31
source: https://coliss.com/articles/build-websites/operation/css/chrome-143-adds-4-new-css-feature.html
---

# Chrome 143 の新しい CSS 機能

## 概要

Chrome 143 では、`@container anchored(fallback)`、`background-position-x/y` 相対構文、`font-language-override` など、4つの新機能が追加されました。

---

## @container anchored(fallback)

### 概要

アンカーポジショニングで配置された要素のフォールバック位置を検出するコンテナクエリです。

### 基本構文

```css
#anchored {
  position-try-options: フォールバック名;
  container-type: anchored;
}

@container anchored(fallback: フォールバック名) {
  /* フォールバック位置が適用されたときのスタイル */
}
```

### 実装例

#### 1. ツールチップの矢印方向を自動調整

```html
<button id="anchor">ホバー</button>
<div id="tooltip">ツールチップ</div>

<style>
  #anchor {
    anchor-name: --my-anchor;
  }

  #tooltip {
    position: absolute;
    position-anchor: --my-anchor;
    bottom: anchor(top);
    left: anchor(center);
    translate: -50% -8px;

    /* フォールバック位置を設定 */
    position-try-options: flip-block;
    container-type: anchored;
  }

  /* 矢印のデフォルト（下向き） */
  #tooltip::after {
    content: "";
    position: absolute;
    bottom: -8px;
    left: 50%;
    translate: -50% 0;
    border: 8px solid transparent;
    border-top-color: black;
    --arrow-rotation: 0deg;
    rotate: var(--arrow-rotation);
  }

  /* フォールバック位置（上向き矢印） */
  @container anchored(fallback: flip-block) {
    #tooltip::after {
      --arrow-rotation: 180deg;
    }
  }
</style>
```

#### 2. ドロップダウンメニューの位置調整

```css
.dropdown-menu {
  position: absolute;
  position-anchor: --dropdown-anchor;
  top: anchor(bottom);
  left: anchor(left);

  position-try-options: flip-block, flip-inline;
  container-type: anchored;
}

/* 下にスペースがない場合: 上に表示 */
@container anchored(fallback: flip-block) {
  .dropdown-menu {
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
  }
}

/* 右にスペースがない場合: 左に表示 */
@container anchored(fallback: flip-inline) {
  .dropdown-menu {
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
  }
}
```

### ブラウザサポート

| ブラウザ | サポート状況 | 備考 |
|---------|------------|------|
| Chrome | 143+ | ✅ |
| Safari | ✅ | サポート済み |
| Edge | 143+ | ✅ |
| Firefox | 145 または 147 | 実装予定 |

---

## background-position-x/y 相対構文

### 概要

背景画像の位置を端を基準として相対値で定義できます。より柔軟でレスポンシブな実装が可能になります。

### 基本構文

```css
.element {
  background-position-x: エッジ 距離;
  background-position-y: エッジ 距離;
}
```

### 実装例

#### 1. 右下からの相対配置

```css
.element {
  background-image: url(flower.gif);
  background-repeat: no-repeat;
  background-position-x: right 30px;
  background-position-y: bottom 20px;
}
```

**効果:**
- 右端から 30px 左
- 下端から 20px 上

#### 2. レスポンシブな背景配置

```css
.hero {
  background-image: url(hero-image.jpg);
  background-repeat: no-repeat;
  background-size: cover;

  /* モバイル: 左上から配置 */
  background-position-x: left 10px;
  background-position-y: top 10px;
}

@media (min-width: 768px) {
  .hero {
    /* タブレット: 右下から配置 */
    background-position-x: right 50px;
    background-position-y: bottom 50px;
  }
}
```

#### 3. -webkit-mask-position への適用

```css
.masked-element {
  -webkit-mask-image: url(mask.svg);
  -webkit-mask-repeat: no-repeat;
  -webkit-mask-position-x: right 20px;
  -webkit-mask-position-y: bottom 20px;
}
```

### 従来の方法との比較

**従来:**

```css
.element {
  background-position: calc(100% - 30px) calc(100% - 20px);
}
```

**新しい構文:**

```css
.element {
  background-position-x: right 30px;
  background-position-y: bottom 20px;
}
```

**利点:**
- 直感的な記述
- calc() 不要
- 保守性向上

---

## font-language-override プロパティ

### 概要

CSS 内で直接 4 文字の言語タグを指定し、OpenType グリフの置換に使用されるシステム言語を上書きできます。

### 基本構文

```css
.element {
  font-language-override: "言語タグ";
}
```

### 実装例

#### 1. 日本語の異体字選択

```css
.kanji-traditional {
  font-family: "Noto Serif JP";
  font-language-override: "JAN"; /* 日本語の旧字体 */
}

.kanji-modern {
  font-family: "Noto Serif JP";
  font-language-override: "JPN"; /* 日本語の新字体 */
}
```

#### 2. 中国語の簡体字/繁体字切り替え

```css
.chinese-simplified {
  font-family: "Noto Sans SC";
  font-language-override: "ZHS"; /* 簡体字 */
}

.chinese-traditional {
  font-family: "Noto Sans TC";
  font-language-override: "ZHT"; /* 繁体字 */
}
```

#### 3. アラビア語のコンテキスト対応

```css
.arabic-standard {
  font-family: "Noto Sans Arabic";
  font-language-override: "ARA"; /* 標準アラビア語 */
}

.arabic-persian {
  font-family: "Noto Sans Arabic";
  font-language-override: "FAR"; /* ペルシャ語 */
}
```

### ユースケース

- **多言語コンテンツ**: 同じフォントで異なる言語バリアントを表示
- **歴史的文書**: 旧字体と新字体の切り替え
- **デザインの一貫性**: 言語固有のグリフバリアントを統一

### 言語タグの例

| 言語 | タグ | 説明 |
|------|------|------|
| 日本語（新字体） | `"JPN"` | 現代日本語 |
| 日本語（旧字体） | `"JAN"` | 歴史的日本語 |
| 中国語（簡体字） | `"ZHS"` | 簡体字 |
| 中国語（繁体字） | `"ZHT"` | 繁体字 |
| アラビア語 | `"ARA"` | 標準アラビア語 |
| ペルシャ語 | `"FAR"` | ペルシャ語 |

---

## TextFormat（EditContext API 関連）

### バグ修正

`underlineStyle` と `underlineThickness` プロパティの値が正常化されました。

### 正しい値

**underlineStyle:**
- `none`: 下線なし
- `solid`: 実線
- `dotted`: 点線
- `dashed`: 破線
- `wavy`: 波線

**underlineThickness:**
- `thin`: 細い
- `thick`: 太い

### 実装例

```javascript
const editContext = new EditContext();

editContext.addEventListener('textformatupdate', (event) => {
  event.formats.forEach((format) => {
    console.log(format.underlineStyle);  // "solid", "dotted", etc.
    console.log(format.underlineThickness);  // "thin", "thick"
  });
});
```

---

## 統合例

すべての機能を組み合わせた実装例：

```html
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    /* アンカーポジショニング */
    #anchor {
      anchor-name: --my-anchor;
      margin: 100px;
    }

    #tooltip {
      position: absolute;
      position-anchor: --my-anchor;
      bottom: anchor(top);
      left: anchor(center);
      translate: -50% -8px;
      position-try-options: flip-block;
      container-type: anchored;

      background: black;
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 4px;
    }

    #tooltip::after {
      content: "";
      position: absolute;
      bottom: -8px;
      left: 50%;
      translate: -50% 0;
      border: 8px solid transparent;
      border-top-color: black;
      --arrow-rotation: 0deg;
      rotate: var(--arrow-rotation);
    }

    @container anchored(fallback: flip-block) {
      #tooltip::after {
        --arrow-rotation: 180deg;
      }
    }

    /* 背景位置 */
    .hero {
      background-image: url(hero.jpg);
      background-repeat: no-repeat;
      background-size: cover;
      background-position-x: right 30px;
      background-position-y: bottom 20px;
      height: 400px;
    }

    /* フォント言語 */
    .kanji-traditional {
      font-family: "Noto Serif JP";
      font-language-override: "JAN";
    }
  </style>
</head>
<body>
  <button id="anchor">ホバー</button>
  <div id="tooltip">ツールチップ</div>

  <div class="hero"></div>

  <p class="kanji-traditional">漢字の旧字体表示</p>
</body>
</html>
```

---

## 参考資料

- [Chrome 143 Release Notes](https://developer.chrome.com/blog/new-in-chrome-143)
- [CSS Anchor Positioning - MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_anchor_positioning)
- [background-position - MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/background-position)
- [font-language-override - MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/font-language-override)

---

## 関連ナレッジ

- [Chrome 144 の新機能](./chrome-144-features.md)
- [Chrome 142 の新機能](./chrome-142-features.md)
- [Anchor Positioning](../components/anchor-positioning.md)
- [多言語対応](../../cross-cutting/i18n/multilingual.md)
