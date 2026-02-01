# HSB カラーシステムで色のバリエーションを作る

1つのテーマカラーから、明度・彩度を調整して多彩なバリエーションを生成する実用的なカラーシステム構築手法。

**出典**: [色は1つで十分！プロが教える、UIデザインを引き立てる色彩テクニック](https://photoshopvip.net/161663)
**参考**: [Why Color Theory Sucks - Learn UI Design](https://www.learnui.design/blog/color-in-ui-design-a-practical-framework.html)

---

## 基本原則

### 色彩理論より実用的なアプローチ

従来の色彩理論（補色、分割補色など）は実際のUIデザインで役に立たないことが多い。
代わりに **1つのベースカラーをさまざまな変化で使い分ける** スキルが重要。

### HSB カラーシステムとは

- **H**ue（色相）: 色の種類（赤、青、緑など）
- **S**aturation（彩度）: 色の鮮やかさ
- **B**rightness（明度）: 色の明るさ

**なぜ HSB か？**
- 直感的に色相・彩度・明度を調整可能
- RGB や HEX より色のバリエーション作成が簡単

---

## 影の色の変化のルール

現実世界の影を観察すると、以下のパターンが見られる：

### ルール

| 要素 | 変化 |
|------|------|
| **明度（Brightness）** | **下がる** |
| **彩度（Saturation）** | **上がる** |
| 色相（Hue） | わずかに変化（影響小） |

### 実例

**サンゴの色**
- 明るい部分: `HSB(10°, 60%, 90%)`
- 影の部分: `HSB(5°, 75%, 60%)`
  - 明度: 90% → 60%（-30%）
  - 彩度: 60% → 75%（+15%）

**青色**
- 明るい部分: `HSB(210°, 50%, 85%)`
- 影の部分: `HSB(210°, 65%, 55%)`
  - 明度: 85% → 55%（-30%）
  - 彩度: 50% → 65%（+15%）

---

## 暗い色・明るい色のバリエーション基本ルール

### 濃い色のバリエーション = 彩度を上げ、明度を下げる

```css
:root {
  --primary: hsl(210, 80%, 50%); /* ベースカラー */
  --primary-dark: hsl(210, 90%, 35%); /* 濃いバリエーション */
}

/* 変化:
   - 彩度: 80% → 90% (+10%)
   - 明度: 50% → 35% (-15%)
*/
```

**実装例: ホバー時のボタン**

```html
<button class="btn-primary">クリック</button>
```

```css
.btn-primary {
  background: hsl(210, 80%, 50%);
  color: #fff;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-primary:hover {
  /* 彩度を上げ、明度を下げる */
  background: hsl(210, 90%, 40%);
}

.btn-primary:active {
  /* さらに濃く */
  background: hsl(210, 95%, 35%);
}
```

### 明るい色のバリエーション = 彩度を下げ、明度を上げる

```css
:root {
  --primary: hsl(210, 80%, 50%); /* ベースカラー */
  --primary-light: hsl(210, 40%, 85%); /* 明るいバリエーション */
}

/* 変化:
   - 彩度: 80% → 40% (-40%)
   - 明度: 50% → 85% (+35%)
*/
```

**実装例: 背景色**

```html
<div class="card">
  <h3>カードタイトル</h3>
  <p>カードコンテンツ</p>
</div>
```

```css
.card {
  /* 明るいバリエーション: 背景色 */
  background: hsl(210, 30%, 95%);
  border: 1px solid hsl(210, 20%, 85%);
  padding: 1.5rem;
  border-radius: 0.75rem;
}

.card:hover {
  /* さらに明るく */
  background: hsl(210, 25%, 97%);
}
```

---

## 色相のシフト

明度・彩度の調整ほど大きな影響はないが、自然な色の変化に寄与する。

### 暗いバリエーション: RGB方向へシフト

色相を **赤（0°）、緑（120°）、青（240°）** に近づけると、明度が自然に減少。

```css
/* 青のバリエーション */
:root {
  --blue-base: hsl(210, 80%, 50%); /* ベース: 210° */
  --blue-dark: hsl(220, 90%, 40%); /* 濃い: 220° (青240°に近づく) */
}
```

### 明るいバリエーション: CMY方向へシフト

色相を **シアン（180°）、マゼンタ（300°）、イエロー（60°）** に近づけると、明度が増加。

```css
/* 青のバリエーション */
:root {
  --blue-base: hsl(210, 80%, 50%); /* ベース: 210° */
  --blue-light: hsl(200, 50%, 85%); /* 明るい: 200° (シアン180°に近づく) */
}
```

---

## 実装例: デザインシステムでの活用

### CSS変数で色のバリエーションを定義

```css
:root {
  /* ベースカラー */
  --color-primary-h: 210;
  --color-primary-s: 80%;
  --color-primary-l: 50%;

  /* プライマリカラーのバリエーション */
  --color-primary: hsl(
    var(--color-primary-h),
    var(--color-primary-s),
    var(--color-primary-l)
  );

  /* 濃いバリエーション（+10% 彩度、-15% 明度）*/
  --color-primary-dark: hsl(
    calc(var(--color-primary-h) + 10),
    calc(var(--color-primary-s) + 10%),
    calc(var(--color-primary-l) - 15%)
  );

  /* 明るいバリエーション（-30% 彩度、+35% 明度）*/
  --color-primary-light: hsl(
    calc(var(--color-primary-h) - 10),
    calc(var(--color-primary-s) - 30%),
    calc(var(--color-primary-l) + 35%)
  );

  /* 超薄いバリエーション（背景用）*/
  --color-primary-lightest: hsl(
    calc(var(--color-primary-h) - 10),
    calc(var(--color-primary-s) - 50%),
    calc(var(--color-primary-l) + 45%)
  );
}
```

### 使用例

```css
.btn {
  background: var(--color-primary);
  color: #fff;
}

.btn:hover {
  background: var(--color-primary-dark);
}

.card {
  background: var(--color-primary-lightest);
  border: 1px solid var(--color-primary-light);
}

.badge {
  background: var(--color-primary-light);
  color: var(--color-primary-dark);
}
```

---

## Figma での実装

### カラースタイルの作成

```
1. ベースカラーを定義
   - Color: #3b82f6 (HSB: 210°, 80%, 96%)

2. 濃いバリエーション
   - 彩度を +10% → 90%
   - 明度を -15% → 81%
   - 色相を +5° → 215°

3. 明るいバリエーション
   - 彩度を -40% → 40%
   - 明度を +4% → 100%
   - 色相を -10° → 200°
```

### カラースケールの生成

```
Primary 900 (最も濃い)
  HSB(215°, 95%, 30%)

Primary 700
  HSB(212°, 90%, 45%)

Primary 500 (ベース)
  HSB(210°, 80%, 50%)

Primary 300
  HSB(205°, 50%, 70%)

Primary 100 (最も明るい)
  HSB(200°, 30%, 95%)
```

---

## JavaScript での動的生成

### HSL からバリエーションを生成

```javascript
/**
 * HSL カラーから濃い・明るいバリエーションを生成
 * @param {number} h - 色相 (0-360)
 * @param {number} s - 彩度 (0-100)
 * @param {number} l - 明度 (0-100)
 * @returns {Object} バリエーションオブジェクト
 */
function generateColorVariations(h, s, l) {
  return {
    base: `hsl(${h}, ${s}%, ${l}%)`,

    // 濃いバリエーション
    dark: `hsl(${h + 5}, ${Math.min(s + 10, 100)}%, ${Math.max(l - 15, 0)}%)`,
    darker: `hsl(${h + 10}, ${Math.min(s + 15, 100)}%, ${Math.max(l - 25, 0)}%)`,

    // 明るいバリエーション
    light: `hsl(${h - 5}, ${Math.max(s - 20, 0)}%, ${Math.min(l + 20, 100)}%)`,
    lighter: `hsl(${h - 10}, ${Math.max(s - 40, 0)}%, ${Math.min(l + 35, 100)}%)`,
  };
}

// 使用例
const primaryColors = generateColorVariations(210, 80, 50);

console.log(primaryColors);
// {
//   base: "hsl(210, 80%, 50%)",
//   dark: "hsl(215, 90%, 35%)",
//   darker: "hsl(220, 95%, 25%)",
//   light: "hsl(205, 60%, 70%)",
//   lighter: "hsl(200, 40%, 85%)"
// }
```

### カラーパレット全体を生成

```javascript
/**
 * 9段階のカラースケールを生成
 * @param {number} h - 基準色相
 * @param {number} s - 基準彩度
 * @param {number} l - 基準明度
 * @returns {Array} 9段階のカラー配列
 */
function generateColorScale(h, s, l) {
  const scale = [];

  for (let i = 900; i >= 100; i -= 100) {
    const step = (900 - i) / 100; // 0-8

    // 彩度: 濃い色ほど高く
    const saturation = Math.max(s - step * 10, 10);

    // 明度: 900が最も暗く、100が最も明るい
    const lightness = l - 40 + step * 10;

    // 色相: 濃い色は +方向、明るい色は -方向へシフト
    const hue = h + (step < 4 ? step * 2 : -(step - 4) * 2);

    scale.push({
      name: i,
      value: `hsl(${hue}, ${saturation}%, ${lightness}%)`,
    });
  }

  return scale;
}

// 使用例
const blueScale = generateColorScale(210, 80, 50);

console.log(blueScale);
// [
//   { name: 900, value: "hsl(216, 80%, 10%)" },
//   { name: 800, value: "hsl(214, 70%, 20%)" },
//   { name: 700, value: "hsl(212, 60%, 30%)" },
//   { name: 600, value: "hsl(210, 50%, 40%)" },
//   { name: 500, value: "hsl(210, 50%, 50%)" },
//   { name: 400, value: "hsl(208, 40%, 60%)" },
//   { name: 300, value: "hsl(206, 30%, 70%)" },
//   { name: 200, value: "hsl(204, 20%, 80%)" },
//   { name: 100, value: "hsl(202, 10%, 90%)" }
// ]
```

### CSS変数に適用

```javascript
function applyColorScale(scale) {
  const root = document.documentElement;

  scale.forEach(({ name, value }) => {
    root.style.setProperty(`--color-primary-${name}`, value);
  });
}

// 使用
const blueScale = generateColorScale(210, 80, 50);
applyColorScale(blueScale);
```

---

## 実用例: フルデザインシステム

### HTML

```html
<div class="color-system-demo">
  <!-- プライマリボタン -->
  <button class="btn btn--primary">プライマリ</button>
  <button class="btn btn--primary" disabled>無効</button>

  <!-- セカンダリボタン -->
  <button class="btn btn--secondary">セカンダリ</button>

  <!-- カード -->
  <div class="card">
    <div class="card-header">
      <h3 class="card-title">カードタイトル</h3>
      <span class="badge">New</span>
    </div>
    <p class="card-content">
      1つのベースカラーから多彩なバリエーションを生成。
    </p>
  </div>

  <!-- アラート -->
  <div class="alert alert--info">
    <svg class="alert-icon"><!-- i --></svg>
    <p>これは情報メッセージです。</p>
  </div>
</div>
```

### CSS

```css
:root {
  /* ベースカラー定義 */
  --primary-h: 210;
  --primary-s: 80%;
  --primary-l: 50%;

  /* プライマリカラーのバリエーション */
  --color-primary: hsl(var(--primary-h), var(--primary-s), var(--primary-l));
  --color-primary-dark: hsl(
    calc(var(--primary-h) + 5),
    calc(var(--primary-s) + 10%),
    calc(var(--primary-l) - 15%)
  );
  --color-primary-darker: hsl(
    calc(var(--primary-h) + 10),
    calc(var(--primary-s) + 15%),
    calc(var(--primary-l) - 25%)
  );
  --color-primary-light: hsl(
    calc(var(--primary-h) - 5),
    calc(var(--primary-s) - 20%),
    calc(var(--primary-l) + 20%)
  );
  --color-primary-lighter: hsl(
    calc(var(--primary-h) - 10),
    calc(var(--primary-s) - 40%),
    calc(var(--primary-l) + 35%)
  );
  --color-primary-lightest: hsl(
    calc(var(--primary-h) - 10),
    calc(var(--primary-s) - 50%),
    calc(var(--primary-l) + 45%)
  );
}

/* ボタン */
.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}

.btn--primary {
  background: var(--color-primary);
  color: #fff;
}

.btn--primary:hover {
  background: var(--color-primary-dark);
}

.btn--primary:active {
  background: var(--color-primary-darker);
}

.btn--primary:disabled {
  background: var(--color-primary-lighter);
  cursor: not-allowed;
  opacity: 0.6;
}

.btn--secondary {
  background: var(--color-primary-lightest);
  color: var(--color-primary-dark);
  border: 1px solid var(--color-primary-light);
}

.btn--secondary:hover {
  background: var(--color-primary-lighter);
  border-color: var(--color-primary);
}

/* カード */
.card {
  background: #fff;
  border: 1px solid var(--color-primary-lightest);
  border-radius: 0.75rem;
  padding: 1.5rem;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.card-title {
  margin: 0;
  color: var(--color-primary-darker);
}

.badge {
  padding: 0.25rem 0.625rem;
  background: var(--color-primary-light);
  color: var(--color-primary-dark);
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 0.25rem;
}

/* アラート */
.alert {
  display: flex;
  gap: 0.75rem;
  padding: 1rem;
  border-radius: 0.5rem;
  background: var(--color-primary-lightest);
  border-left: 4px solid var(--color-primary);
}

.alert-icon {
  width: 1.25rem;
  height: 1.25rem;
  color: var(--color-primary);
  flex-shrink: 0;
}

.alert p {
  margin: 0;
  color: var(--color-primary-darker);
}
```

---

## よくある失敗パターン

### ❌ 黒を重ねて暗くする

```css
/* 悪い例: 黒を混ぜる */
.btn:hover {
  background: hsl(210, 80%, 50%);
  filter: brightness(0.8); /* 彩度も下がってしまう */
}
```

**問題点**: 彩度も一緒に下がり、色がくすんで見える。

### ✅ 明度を下げ、彩度を上げる

```css
/* 良い例: HSLで調整 */
.btn:hover {
  background: hsl(210, 90%, 40%); /* 彩度+10%, 明度-10% */
}
```

---

## ブラウザサポート

| 機能 | Chrome | Firefox | Safari | Edge |
|------|--------|---------|--------|------|
| HSL | 1+ | 1+ | 3.1+ | 12+ |
| CSS Variables | 49+ | 31+ | 9.1+ | 15+ |
| calc() | 26+ | 16+ | 7+ | 12+ |

---

## まとめ

### 重要なポイント

1. **暗い色のバリエーション = 明度を下げ、彩度を上げる**
2. **明るい色のバリエーション = 明度を上げ、彩度を下げる**
3. 色相のシフトは補助的（RGB方向で暗く、CMY方向で明るく）
4. 1つのテーマカラーから無限にバリエーション生成可能

### 推奨ツール

- **Figma**: HSBカラーピッカーで直感的に調整
- **CSS Variables**: 動的なカラーシステム構築
- **JavaScript**: 自動生成でスケーラブルに

**キーワード**: HSB, カラーシステム, デザインシステム, 配色, 色のバリエーション, Figma
