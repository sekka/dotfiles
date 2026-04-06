# 高級感カラーパレット

## メタデータ

- **用途タグ**: `#高級感` `#ラグジュアリー` `#エレガント` `#プレミアム` `#配色` `#カラーパレット`
- **出典**:
  - [高級感ただよう大人カラー15選 - PhotoshopVIP](https://photoshopvip.net/166017)
  - [高級感のある色合わせ5選 - マーキュリー・アド](https://note.com/mercuryad/n/na4592cc57616)
  - [高級感溢れるデザインに必須！洗練された配色とアイディア - Webデザインマスター](https://webdesign-master.com/webdesign/luxurious-design/color/)
- **最終更新**: 2025年

---

## 概要

高級感を演出するカラーパレット集。ゴールド、シルバー、深いトーンの色を基調とし、品格・優雅さ・特別感を表現する。

高級ブランド、プレミアム商品、ラグジュアリーなサービスに最適な配色を、CSS変数形式で提供する。

---

## パレット1: Deep Blue × Gold（深い青 × 金）

### カラーコード

- **Primary**: `#003366` (ディープブルー)
- **Secondary**: `#FFD700` (ゴールド)
- **Accent**: `#B8860B` (ダークゴールデンロッド)
- **Background**: `#F5F5F0` (アイボリー)
- **Text**: `#1A1A1A` (ほぼ黒)

### CSS変数定義

```css
:root {
  --luxury-blue-gold-primary: #003366;
  --luxury-blue-gold-secondary: #FFD700;
  --luxury-blue-gold-accent: #B8860B;
  --luxury-blue-gold-bg: #F5F5F0;
  --luxury-blue-gold-text: #1A1A1A;
}
```

### 使用例

```css
.hero-luxury {
  background: var(--luxury-blue-gold-primary);
  color: white;
  padding: 4rem 2rem;
  text-align: center;
}

.hero-luxury h1 {
  color: var(--luxury-blue-gold-secondary);
  font-weight: 300;
  letter-spacing: 0.1em;
  margin-bottom: 1rem;
}

.cta-button-gold {
  background: var(--luxury-blue-gold-secondary);
  color: var(--luxury-blue-gold-primary);
  border: 2px solid var(--luxury-blue-gold-accent);
  padding: 1rem 3rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(255, 215, 0, 0.3);
}

.cta-button-gold:hover {
  background: var(--luxury-blue-gold-accent);
  color: white;
  box-shadow: 0 6px 20px rgba(184, 134, 11, 0.4);
}
```

### 適用シーン

- 金融機関、プライベートバンク
- 高級時計、ジュエリー
- プレミアム会員サービス

---

## パレット2: Emerald Green × Silver（エメラルドグリーン × シルバー）

### カラーコード

- **Primary**: `#50C878` (エメラルドグリーン)
- **Secondary**: `#C0C0C0` (シルバー)
- **Accent**: `#A8A8A8` (ダークシルバー)
- **Background**: `#FAFAFA` (ほぼ白)
- **Text**: `#2C2C2C` (チャコール)

### CSS変数定義

```css
:root {
  --luxury-emerald-silver-primary: #50C878;
  --luxury-emerald-silver-secondary: #C0C0C0;
  --luxury-emerald-silver-accent: #A8A8A8;
  --luxury-emerald-silver-bg: #FAFAFA;
  --luxury-emerald-silver-text: #2C2C2C;
}
```

### 使用例

```css
.product-card-luxury {
  background: var(--luxury-emerald-silver-bg);
  border: 2px solid var(--luxury-emerald-silver-secondary);
  box-shadow: 0 8px 32px rgba(192, 192, 192, 0.2);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.product-card-luxury:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 48px rgba(80, 200, 120, 0.3);
  border-color: var(--luxury-emerald-silver-primary);
}

.product-badge {
  background: linear-gradient(
    135deg,
    var(--luxury-emerald-silver-primary),
    var(--luxury-emerald-silver-accent)
  );
  color: white;
  padding: 0.5rem 1.5rem;
  font-size: 0.875rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}
```

### 適用シーン

- 高級化粧品、スキンケア
- エコラグジュアリーブランド
- プレミアムウェルネス

---

## パレット3: Burgundy × Ivory（バーガンディ × アイボリー）

### カラーコード

- **Primary**: `#800020` (バーガンディ)
- **Secondary**: `#FFFFF0` (アイボリー)
- **Accent**: `#A0522D` (シエナ)
- **Background**: `#F8F6F0` (リネン)
- **Text**: `#3E2723` (エスプレッソ)

### CSS変数定義

```css
:root {
  --luxury-burgundy-ivory-primary: #800020;
  --luxury-burgundy-ivory-secondary: #FFFFF0;
  --luxury-burgundy-ivory-accent: #A0522D;
  --luxury-burgundy-ivory-bg: #F8F6F0;
  --luxury-burgundy-ivory-text: #3E2723;
}
```

### 使用例

```css
header.luxury-header {
  background: var(--luxury-burgundy-ivory-primary);
  color: var(--luxury-burgundy-ivory-secondary);
  padding: 1.5rem 3rem;
  box-shadow: 0 2px 8px rgba(128, 0, 32, 0.3);
}

.luxury-header .logo {
  color: var(--luxury-burgundy-ivory-secondary);
  font-weight: 300;
  font-size: 1.5rem;
  letter-spacing: 0.15em;
}

.section-title {
  color: var(--luxury-burgundy-ivory-primary);
  font-weight: 300;
  font-size: 2.5rem;
  letter-spacing: 0.05em;
  border-bottom: 1px solid var(--luxury-burgundy-ivory-accent);
  padding-bottom: 1rem;
  margin-bottom: 2rem;
}

.quote-luxury {
  background: var(--luxury-burgundy-ivory-bg);
  border-left: 4px solid var(--luxury-burgundy-ivory-primary);
  padding: 2rem;
  font-style: italic;
  color: var(--luxury-burgundy-ivory-text);
}
```

### 適用シーン

- ワイナリー、高級レストラン
- ホテル、リゾート
- アンティーク、クラシック家具

---

## パレット4: Charcoal Grey × Rose Gold（チャコールグレイ × ローズゴールド）

### カラーコード

- **Primary**: `#36454F` (チャコールグレイ)
- **Secondary**: `#B76E79` (ローズゴールド)
- **Accent**: `#E6B8C0` (ライトローズゴールド)
- **Background**: `#F9F9F9` (スノー)
- **Text**: `#2B2B2B` (ダークグレイ)

### CSS変数定義

```css
:root {
  --luxury-charcoal-rose-primary: #36454F;
  --luxury-charcoal-rose-secondary: #B76E79;
  --luxury-charcoal-rose-accent: #E6B8C0;
  --luxury-charcoal-rose-bg: #F9F9F9;
  --luxury-charcoal-rose-text: #2B2B2B;
}
```

### 使用例

```css
.pricing-table-luxury {
  background: var(--luxury-charcoal-rose-bg);
  border: 2px solid var(--luxury-charcoal-rose-accent);
  border-radius: 8px;
  overflow: hidden;
}

.pricing-table-luxury .header {
  background: var(--luxury-charcoal-rose-primary);
  color: white;
  padding: 2rem;
  text-align: center;
}

.pricing-table-luxury .price {
  font-size: 3rem;
  font-weight: 300;
  color: var(--luxury-charcoal-rose-secondary);
  margin: 1rem 0;
}

.pricing-table-luxury .feature-list li::before {
  content: '✓';
  color: var(--luxury-charcoal-rose-secondary);
  font-weight: bold;
  margin-right: 0.5rem;
}

.button-rose-gold {
  background: linear-gradient(
    135deg,
    var(--luxury-charcoal-rose-secondary),
    var(--luxury-charcoal-rose-accent)
  );
  color: white;
  border: none;
  padding: 1rem 2.5rem;
  border-radius: 50px;
  box-shadow: 0 4px 16px rgba(183, 110, 121, 0.3);
}
```

### 適用シーン

- 女性向け高級ブランド
- ブライダル、ウェディング
- 美容サロン、エステ

---

## パレット5: Navy Blue × Platinum（ネイビーブルー × プラチナ）

### カラーコード

- **Primary**: `#000080` (ネイビーブルー)
- **Secondary**: `#E5E4E2` (プラチナ)
- **Accent**: `#C0C0C0` (シルバー)
- **Background**: `#FFFFFF` (純白)
- **Text**: `#1C1C1C` (ほぼ黒)

### CSS変数定義

```css
:root {
  --luxury-navy-platinum-primary: #000080;
  --luxury-navy-platinum-secondary: #E5E4E2;
  --luxury-navy-platinum-accent: #C0C0C0;
  --luxury-navy-platinum-bg: #FFFFFF;
  --luxury-navy-platinum-text: #1C1C1C;
}
```

### 使用例

```css
.luxury-card {
  background: var(--luxury-navy-platinum-bg);
  border: 1px solid var(--luxury-navy-platinum-accent);
  box-shadow: 0 8px 40px rgba(0, 0, 128, 0.1);
  padding: 3rem;
  margin: 2rem 0;
}

.luxury-card-title {
  color: var(--luxury-navy-platinum-primary);
  font-weight: 300;
  font-size: 2rem;
  letter-spacing: 0.05em;
  margin-bottom: 1.5rem;
}

.luxury-divider {
  height: 1px;
  background: linear-gradient(
    to right,
    transparent,
    var(--luxury-navy-platinum-accent),
    transparent
  );
  margin: 2rem 0;
}

.icon-luxury {
  color: var(--luxury-navy-platinum-primary);
  background: var(--luxury-navy-platinum-secondary);
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}
```

### 適用シーン

- 法律事務所、コンサルティング
- プライベートジェット、ヨット
- 高級車、プレミアムサービス

---

## パレット6: Black × Gold × White（黒 × 金 × 白）

### カラーコード

- **Primary**: `#000000` (ブラック)
- **Secondary**: `#D4AF37` (ゴールド)
- **Accent**: `#B8860B` (ダークゴールデンロッド)
- **Background**: `#FFFFFF` (ホワイト)
- **Text**: `#1A1A1A` (ソフトブラック)

### CSS変数定義

```css
:root {
  --luxury-black-gold-primary: #000000;
  --luxury-black-gold-secondary: #D4AF37;
  --luxury-black-gold-accent: #B8860B;
  --luxury-black-gold-bg: #FFFFFF;
  --luxury-black-gold-text: #1A1A1A;
}
```

### 使用例

```css
.masthead {
  background: var(--luxury-black-gold-primary);
  color: var(--luxury-black-gold-bg);
  padding: 5rem 2rem;
  text-align: center;
  position: relative;
}

.masthead::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(
    to right,
    var(--luxury-black-gold-secondary),
    var(--luxury-black-gold-accent),
    var(--luxury-black-gold-secondary)
  );
}

.masthead h1 {
  font-weight: 200;
  font-size: 3.5rem;
  letter-spacing: 0.15em;
  margin-bottom: 1rem;
}

.masthead .subtitle {
  color: var(--luxury-black-gold-secondary);
  font-weight: 300;
  font-size: 1.25rem;
  letter-spacing: 0.1em;
}

.button-gold-outline {
  background: transparent;
  color: var(--luxury-black-gold-secondary);
  border: 2px solid var(--luxury-black-gold-secondary);
  padding: 1rem 3rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  transition: all 0.3s;
}

.button-gold-outline:hover {
  background: var(--luxury-black-gold-secondary);
  color: var(--luxury-black-gold-primary);
}
```

### 適用シーン

- 高級ファッションブランド
- 宝飾品、高級時計
- VIPイベント、パーティー

---

## パレット7: Maroon × Champagne（マルーン × シャンパン）

### カラーコード

- **Primary**: `#800000` (マルーン)
- **Secondary**: `#F7E7CE` (シャンパン)
- **Accent**: `#D4A574` (ゴールデンタン)
- **Background**: `#FAF8F3` (アイボリー)
- **Text**: `#3E2723` (ダークブラウン)

### CSS変数定義

```css
:root {
  --luxury-maroon-champagne-primary: #800000;
  --luxury-maroon-champagne-secondary: #F7E7CE;
  --luxury-maroon-champagne-accent: #D4A574;
  --luxury-maroon-champagne-bg: #FAF8F3;
  --luxury-maroon-champagne-text: #3E2723;
}
```

### 使用例

```css
.testimonial-luxury {
  background: var(--luxury-maroon-champagne-secondary);
  border: 2px solid var(--luxury-maroon-champagne-accent);
  border-radius: 12px;
  padding: 2.5rem;
  position: relative;
  box-shadow: 0 8px 32px rgba(128, 0, 0, 0.1);
}

.testimonial-luxury::before {
  content: '"';
  position: absolute;
  top: -20px;
  left: 20px;
  font-size: 5rem;
  color: var(--luxury-maroon-champagne-primary);
  font-family: Georgia, serif;
  opacity: 0.3;
}

.testimonial-luxury .author {
  color: var(--luxury-maroon-champagne-primary);
  font-weight: 600;
  margin-top: 1rem;
  letter-spacing: 0.05em;
}

.section-divider {
  border: 0;
  height: 2px;
  background: linear-gradient(
    to right,
    transparent,
    var(--luxury-maroon-champagne-primary),
    transparent
  );
  margin: 3rem auto;
  width: 50%;
}
```

### 適用シーン

- ワイン、シャンパン販売
- 高級レストラン、バー
- ヴィンテージ、クラシック商品

---

## パレット8: Teal × Copper（ティール × カッパー）

### カラーコード

- **Primary**: `#008080` (ティール)
- **Secondary**: `#B87333` (カッパー)
- **Accent**: `#CD7F32` (ブロンズ)
- **Background**: `#F5F5F5` (ホワイトスモーク)
- **Text**: `#2C3E50` (ミッドナイトブルー)

### CSS変数定義

```css
:root {
  --luxury-teal-copper-primary: #008080;
  --luxury-teal-copper-secondary: #B87333;
  --luxury-teal-copper-accent: #CD7F32;
  --luxury-teal-copper-bg: #F5F5F5;
  --luxury-teal-copper-text: #2C3E50;
}
```

### 使用例

```css
.gallery-item-luxury {
  position: relative;
  overflow: hidden;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 128, 128, 0.15);
}

.gallery-item-luxury img {
  transition: transform 0.5s;
}

.gallery-item-luxury:hover img {
  transform: scale(1.1);
}

.gallery-item-luxury .overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    rgba(0, 128, 128, 0.9),
    rgba(184, 115, 51, 0.9)
  );
  opacity: 0;
  transition: opacity 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.gallery-item-luxury:hover .overlay {
  opacity: 1;
}

.badge-teal {
  background: var(--luxury-teal-copper-primary);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  font-size: 0.75rem;
}
```

### 適用シーン

- モダンアート、ギャラリー
- デザイナーズホテル
- クリエイティブエージェンシー

---

## パレット9: Deep Purple × Silver（ディープパープル × シルバー）

### カラーコード

- **Primary**: `#4B0082` (インディゴ)
- **Secondary**: `#C0C0C0` (シルバー)
- **Accent**: `#9370DB` (ミディアムパープル)
- **Background**: `#F8F8FF` (ゴーストホワイト)
- **Text**: `#2F2F2F` (ダークグレイ)

### CSS変数定義

```css
:root {
  --luxury-purple-silver-primary: #4B0082;
  --luxury-purple-silver-secondary: #C0C0C0;
  --luxury-purple-silver-accent: #9370DB;
  --luxury-purple-silver-bg: #F8F8FF;
  --luxury-purple-silver-text: #2F2F2F;
}
```

### 使用例

```css
.premium-banner {
  background: linear-gradient(
    135deg,
    var(--luxury-purple-silver-primary),
    var(--luxury-purple-silver-accent)
  );
  color: white;
  padding: 4rem 2rem;
  text-align: center;
  position: relative;
}

.premium-banner::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 5px;
  background: var(--luxury-purple-silver-secondary);
}

.premium-feature {
  background: var(--luxury-purple-silver-bg);
  border: 2px solid var(--luxury-purple-silver-secondary);
  border-radius: 12px;
  padding: 2rem;
  transition: all 0.3s;
}

.premium-feature:hover {
  border-color: var(--luxury-purple-silver-accent);
  box-shadow: 0 8px 32px rgba(75, 0, 130, 0.2);
}

.premium-feature .icon {
  color: var(--luxury-purple-silver-primary);
  font-size: 3rem;
  margin-bottom: 1rem;
}
```

### 適用シーン

- テクノロジー系プレミアムサービス
- イノベーション、未来志向ブランド
- ラグジュアリーガジェット

---

## パレット10: Forest Green × Gold（フォレストグリーン × ゴールド）

### カラーコード

- **Primary**: `#228B22` (フォレストグリーン)
- **Secondary**: `#FFD700` (ゴールド)
- **Accent**: `#DAA520` (ゴールデンロッド)
- **Background**: `#F5F5DC` (ベージュ)
- **Text**: `#2F4F2F` (ダークグリーン)

### CSS変数定義

```css
:root {
  --luxury-forest-gold-primary: #228B22;
  --luxury-forest-gold-secondary: #FFD700;
  --luxury-forest-gold-accent: #DAA520;
  --luxury-forest-gold-bg: #F5F5DC;
  --luxury-forest-gold-text: #2F4F2F;
}
```

### 使用例

```css
.exclusive-offer {
  background: var(--luxury-forest-gold-primary);
  border: 3px solid var(--luxury-forest-gold-secondary);
  color: white;
  padding: 3rem;
  text-align: center;
  border-radius: 8px;
  box-shadow: 0 8px 40px rgba(34, 139, 34, 0.3);
}

.exclusive-offer .badge {
  background: var(--luxury-forest-gold-secondary);
  color: var(--luxury-forest-gold-primary);
  padding: 0.75rem 2rem;
  font-weight: bold;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  border-radius: 50px;
  display: inline-block;
  margin-bottom: 1.5rem;
}

.exclusive-offer h2 {
  font-weight: 300;
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.exclusive-offer .cta {
  background: var(--luxury-forest-gold-accent);
  color: white;
  border: none;
  padding: 1.25rem 3rem;
  font-weight: 600;
  border-radius: 4px;
  letter-spacing: 0.05em;
}
```

### 適用シーン

- エコラグジュアリー、サステナブルブランド
- オーガニック高級食品
- グリーンビジネス、環境配慮型企業

---

## 高級感を演出するデザインテクニック

### 1. タイポグラフィ

```css
.luxury-typography {
  font-family: 'Playfair Display', 'Cormorant Garamond', Georgia, serif;
  font-weight: 300;
  letter-spacing: 0.1em;
  line-height: 1.8;
}

.luxury-title {
  font-size: clamp(2rem, 5vw, 4rem);
  font-weight: 200;
  letter-spacing: 0.15em;
  text-transform: uppercase;
}

.luxury-subtitle {
  font-size: clamp(1rem, 2.5vw, 1.5rem);
  font-weight: 300;
  letter-spacing: 0.05em;
}
```

**ポイント:**
- **細いフォントウェイト**: 300以下（洗練された印象）
- **広い文字間隔**: `letter-spacing: 0.1em` 以上
- **セリフフォント**: 高級感を演出

---

### 2. 余白の取り方

```css
.luxury-section {
  padding: clamp(3rem, 8vw, 8rem) clamp(1rem, 5vw, 5rem);
}

.luxury-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

/* 十分な余白 */
.luxury-card {
  padding: 3rem;
  margin: 3rem 0;
}
```

**ポイント:**
- **十分な余白**: 詰め込まない
- **大きなパディング**: 3rem以上
- **広いマージン**: 要素間の間隔を広く

---

### 3. シャドウとボーダー

```css
.luxury-shadow {
  box-shadow:
    0 4px 16px rgba(0, 0, 0, 0.05),
    0 8px 32px rgba(0, 0, 0, 0.1);
}

.luxury-border {
  border: 1px solid rgba(0, 0, 0, 0.1);
}

/* 細いボーダー */
.luxury-divider {
  height: 1px;
  background: linear-gradient(
    to right,
    transparent,
    rgba(0, 0, 0, 0.2),
    transparent
  );
}
```

**ポイント:**
- **控えめなシャドウ**: 強すぎない影
- **細いボーダー**: 1px、繊細な線
- **グラデーション**: 境界をぼかす

---

### 4. アニメーション

```css
.luxury-hover {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.luxury-hover:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.15);
}

/* ゆっくりとした動き */
.luxury-fade-in {
  opacity: 0;
  animation: fadeIn 1.5s ease-in forwards;
}

@keyframes fadeIn {
  to {
    opacity: 1;
  }
}
```

**ポイント:**
- **ゆっくりとした動き**: 0.5s以上
- **滑らかなイージング**: `cubic-bezier(0.4, 0, 0.2, 1)`
- **控えめな変化**: 派手すぎない

---

### 5. カラーの使い方

```css
/* ゴールドのグラデーション */
.gold-gradient {
  background: linear-gradient(
    135deg,
    #FFD700,
    #B8860B,
    #DAA520
  );
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
}

/* シルバーのメタリック効果 */
.silver-metallic {
  background: linear-gradient(
    135deg,
    #C0C0C0,
    #E5E4E2,
    #A8A8A8
  );
  box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.5);
}
```

**ポイント:**
- **ゴールド・シルバーを効果的に**: アクセントとして
- **深いトーン**: 明度を下げる
- **単色背景**: 白・黒・ベージュ

---

## 避けるべきデザイン

### NG例

```css
/* NG: 派手すぎる色 */
.bad-luxury {
  background: #FF00FF; /* ビビッドすぎる */
  color: #00FF00;
}

/* NG: 太すぎるフォント */
.bad-luxury-title {
  font-weight: 900; /* 重すぎる */
  letter-spacing: 0; /* 狭すぎる */
}

/* NG: 余白が少ない */
.bad-luxury-card {
  padding: 0.5rem; /* 狭すぎる */
}

/* NG: 過度な装飾 */
.bad-luxury-decorated {
  text-shadow: 0 0 10px red, 0 0 20px blue; /* 派手すぎる */
  border: 5px double rainbow; /* 過剰 */
}
```

**避けるべきポイント:**
- 原色、ビビッドカラー
- 太いフォントウェイト（700以上）
- 狭い余白
- 過度な装飾

---

## まとめ

高級感を演出するには、以下の要素が重要：

### カラー

- **ゴールド、シルバー**: メタリックカラーをアクセントに
- **深いトーン**: ディープブルー、バーガンディ、ネイビー
- **単色背景**: 白、黒、ベージュ

### タイポグラフィ

- **細いフォント**: ウェイト300以下
- **広い文字間隔**: `letter-spacing: 0.1em` 以上
- **セリフフォント**: 高級感を演出

### レイアウト

- **十分な余白**: パディング3rem以上
- **控えめなシャドウ**: 強すぎない影
- **細いボーダー**: 1px、繊細な線

### アニメーション

- **ゆっくりとした動き**: 0.5s以上
- **滑らかなイージング**: `cubic-bezier(0.4, 0, 0.2, 1)`

高級感は、**引き算のデザイン**。余計な装飾を削ぎ落とし、洗練されたシンプルさを追求すること。

---

## Sources

- [高級感ただよう大人カラー15選 - PhotoshopVIP](https://photoshopvip.net/166017)
- [高級感のある色合わせ5選 - マーキュリー・アド](https://note.com/mercuryad/n/na4592cc57616)
- [高級感溢れるデザインに必須！洗練された配色とアイディア - Webデザインマスター](https://webdesign-master.com/webdesign/luxurious-design/color/)
