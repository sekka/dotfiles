# 癒しグラデーション配色パレット

## メタデータ

- **用途タグ**: `#グラデーション` `#癒し` `#メッシュグラデーション` `#配色` `#カラーパレット` `#リラックス`
- **出典**:
  - [ふわっと美しい、癒しメッシュグラデーション配色12選 - PhotoshopVIP](https://photoshopvip.net/165928)
  - [全部かわいい、チルな空グラデーション配色12選 - PhotoshopVIP](https://photoshopvip.net/165878)
  - [濁りなし！美しいグラデーションの基本ルールとCSSオンラインツール - PhotoshopVIP](https://photoshopvip.net/127675)
- **最終更新**: 2025年

---

## 概要

ふわっとした美しいグラデーションで、癒しとリラックス感を演出するカラーパレット集。メッシュグラデーション、空のグラデーション、パステルグラデーションを中心に、CSS変数形式で提供する。

---

## パレット1: Sunset Peach（夕焼けピーチ）

### カラーコード

- **Color 1**: `#FFE5B4` (ピーチ)
- **Color 2**: `#FFB6C1` (ライトピンク)
- **Color 3**: `#FFA07A` (ライトサーモン)
- **Color 4**: `#FFD700` (ゴールド)
- **Color 5**: `#FF8C69` (サーモン)

### CSS変数定義

```css
:root {
  --gradient-sunset-1: #FFE5B4;
  --gradient-sunset-2: #FFB6C1;
  --gradient-sunset-3: #FFA07A;
  --gradient-sunset-4: #FFD700;
  --gradient-sunset-5: #FF8C69;
}
```

### グラデーション例

```css
/* 線形グラデーション */
.gradient-sunset-linear {
  background: linear-gradient(
    135deg,
    var(--gradient-sunset-1),
    var(--gradient-sunset-2),
    var(--gradient-sunset-3)
  );
}

/* 放射状グラデーション */
.gradient-sunset-radial {
  background: radial-gradient(
    circle at top right,
    var(--gradient-sunset-1),
    var(--gradient-sunset-2),
    var(--gradient-sunset-3)
  );
}

/* メッシュグラデーション風 */
.gradient-sunset-mesh {
  background:
    radial-gradient(
      circle at 20% 30%,
      var(--gradient-sunset-1) 0%,
      transparent 50%
    ),
    radial-gradient(
      circle at 80% 70%,
      var(--gradient-sunset-2) 0%,
      transparent 50%
    ),
    radial-gradient(
      circle at 50% 50%,
      var(--gradient-sunset-3) 0%,
      transparent 50%
    ),
    linear-gradient(
      135deg,
      var(--gradient-sunset-4),
      var(--gradient-sunset-5)
    );
}
```

### 適用シーン

- リラクゼーション系サイト
- ヨガ、メディテーション
- 温かみのあるヒーローセクション

---

## パレット2: Ocean Breeze（海のそよ風）

### カラーコード

- **Color 1**: `#E0F7FA` (ライトシアン)
- **Color 2**: `#B2EBF2` (ライトターコイズ)
- **Color 3**: `#80DEEA` (ターコイズ)
- **Color 4**: `#4DD0E1` (ダークターコイズ)
- **Color 5**: `#26C6DA` (シアン)

### CSS変数定義

```css
:root {
  --gradient-ocean-1: #E0F7FA;
  --gradient-ocean-2: #B2EBF2;
  --gradient-ocean-3: #80DEEA;
  --gradient-ocean-4: #4DD0E1;
  --gradient-ocean-5: #26C6DA;
}
```

### グラデーション例

```css
.gradient-ocean-linear {
  background: linear-gradient(
    180deg,
    var(--gradient-ocean-1),
    var(--gradient-ocean-2),
    var(--gradient-ocean-3),
    var(--gradient-ocean-4)
  );
}

.gradient-ocean-wave {
  background: linear-gradient(
    to bottom,
    var(--gradient-ocean-1) 0%,
    var(--gradient-ocean-2) 25%,
    var(--gradient-ocean-3) 50%,
    var(--gradient-ocean-4) 75%,
    var(--gradient-ocean-5) 100%
  );
}

/* アニメーション付き */
@keyframes ocean-flow {
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

.gradient-ocean-animated {
  background: linear-gradient(
    -45deg,
    var(--gradient-ocean-1),
    var(--gradient-ocean-2),
    var(--gradient-ocean-3),
    var(--gradient-ocean-4)
  );
  background-size: 200% 200%;
  animation: ocean-flow 15s ease infinite;
}
```

### 適用シーン

- マリン系サイト、ダイビングショップ
- 涼しげなサマーキャンペーン
- リフレッシュ感を演出したいページ

---

## パレット3: Lavender Dream（ラベンダーの夢）

### カラーコード

- **Color 1**: `#F3E5F5` (ラベンダーブラッシュ)
- **Color 2**: `#E1BEE7` (プラムライト)
- **Color 3**: `#CE93D8` (ライトパープル)
- **Color 4**: `#BA68C8` (ミディアムパープル)
- **Color 5**: `#AB47BC` (パープル)

### CSS変数定義

```css
:root {
  --gradient-lavender-1: #F3E5F5;
  --gradient-lavender-2: #E1BEE7;
  --gradient-lavender-3: #CE93D8;
  --gradient-lavender-4: #BA68C8;
  --gradient-lavender-5: #AB47BC;
}
```

### グラデーション例

```css
.gradient-lavender-soft {
  background: linear-gradient(
    135deg,
    var(--gradient-lavender-1),
    var(--gradient-lavender-2),
    var(--gradient-lavender-3)
  );
}

.gradient-lavender-card {
  background: linear-gradient(
    to bottom,
    var(--gradient-lavender-1) 0%,
    var(--gradient-lavender-2) 100%
  );
  border: 1px solid var(--gradient-lavender-3);
  box-shadow: 0 8px 32px rgba(206, 147, 216, 0.2);
}

/* グラスモーフィズムとの組み合わせ */
.gradient-lavender-glass {
  background: linear-gradient(
    135deg,
    rgba(243, 229, 245, 0.4),
    rgba(225, 190, 231, 0.4)
  );
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(206, 147, 216, 0.3);
}
```

### 適用シーン

- スパ、美容サロン
- ウェルネス、リラクゼーション
- 女性向けファッション、コスメ

---

## パレット4: Mint Fresh（ミントフレッシュ）

### カラーコード

- **Color 1**: `#E0F2F1` (ミントクリーム)
- **Color 2**: `#B2DFDB` (ライトティール)
- **Color 3**: `#80CBC4` (ミディアムティール)
- **Color 4**: `#4DB6AC` (ティール)
- **Color 5**: `#26A69A` (ダークティール)

### CSS変数定義

```css
:root {
  --gradient-mint-1: #E0F2F1;
  --gradient-mint-2: #B2DFDB;
  --gradient-mint-3: #80CBC4;
  --gradient-mint-4: #4DB6AC;
  --gradient-mint-5: #26A69A;
}
```

### グラデーション例

```css
.gradient-mint-fresh {
  background: linear-gradient(
    to right,
    var(--gradient-mint-1),
    var(--gradient-mint-2),
    var(--gradient-mint-3)
  );
}

.gradient-mint-button {
  background: linear-gradient(
    135deg,
    var(--gradient-mint-4),
    var(--gradient-mint-5)
  );
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 50px;
  box-shadow: 0 4px 12px rgba(77, 182, 172, 0.3);
  transition: all 0.3s;
}

.gradient-mint-button:hover {
  box-shadow: 0 6px 20px rgba(38, 166, 154, 0.4);
  transform: translateY(-2px);
}

/* テキストグラデーション */
.gradient-mint-text {
  background: linear-gradient(
    90deg,
    var(--gradient-mint-3),
    var(--gradient-mint-4),
    var(--gradient-mint-5)
  );
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
}
```

### 適用シーン

- ヘルスケア、自然療法
- オーガニック商品
- フレッシュ感を演出したいサイト

---

## パレット5: Rose Garden（バラ園）

### カラーコード

- **Color 1**: `#FCE4EC` (ローズブラッシュ)
- **Color 2**: `#F8BBD0` (ライトピンク)
- **Color 3**: `#F48FB1` (ピンク)
- **Color 4**: `#F06292` (ホットピンク)
- **Color 5**: `#EC407A` (ローズ)

### CSS変数定義

```css
:root {
  --gradient-rose-1: #FCE4EC;
  --gradient-rose-2: #F8BBD0;
  --gradient-rose-3: #F48FB1;
  --gradient-rose-4: #F06292;
  --gradient-rose-5: #EC407A;
}
```

### グラデーション例

```css
.gradient-rose-soft {
  background: linear-gradient(
    135deg,
    var(--gradient-rose-1),
    var(--gradient-rose-2),
    var(--gradient-rose-3)
  );
}

.gradient-rose-hero {
  background: linear-gradient(
    to bottom,
    var(--gradient-rose-1) 0%,
    var(--gradient-rose-2) 50%,
    var(--gradient-rose-3) 100%
  );
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* ボーダーグラデーション */
.gradient-rose-border {
  border: 3px solid;
  border-image: linear-gradient(
    135deg,
    var(--gradient-rose-3),
    var(--gradient-rose-4),
    var(--gradient-rose-5)
  ) 1;
}
```

### 適用シーン

- ウェディング、ブライダル
- 女性向けファッション
- ロマンティックなデザイン

---

## パレット6: Sky Blue（空の青）

### カラーコード

- **Color 1**: `#E3F2FD` (ライトブルー)
- **Color 2**: `#BBDEFB` (スカイブルー)
- **Color 3**: `#90CAF9` (ライトスカイブルー)
- **Color 4**: `#64B5F6` (ブルー)
- **Color 5**: `#42A5F5` (ミディアムブルー)

### CSS変数定義

```css
:root {
  --gradient-sky-1: #E3F2FD;
  --gradient-sky-2: #BBDEFB;
  --gradient-sky-3: #90CAF9;
  --gradient-sky-4: #64B5F6;
  --gradient-sky-5: #42A5F5;
}
```

### グラデーション例

```css
/* 空のグラデーション */
.gradient-sky {
  background: linear-gradient(
    to bottom,
    var(--gradient-sky-1) 0%,
    var(--gradient-sky-2) 30%,
    var(--gradient-sky-3) 60%,
    var(--gradient-sky-4) 90%,
    var(--gradient-sky-5) 100%
  );
}

/* 雲のような効果 */
.gradient-sky-clouds {
  background:
    radial-gradient(
      ellipse at 30% 20%,
      rgba(255, 255, 255, 0.8) 0%,
      transparent 50%
    ),
    radial-gradient(
      ellipse at 70% 40%,
      rgba(255, 255, 255, 0.6) 0%,
      transparent 50%
    ),
    linear-gradient(
      to bottom,
      var(--gradient-sky-1),
      var(--gradient-sky-3),
      var(--gradient-sky-5)
    );
}
```

### 適用シーン

- 航空会社、旅行サイト
- 空をテーマにしたデザイン
- 清潔感、爽快感を演出

---

## パレット7: Peach Melba（ピーチメルバ）

### カラーコード

- **Color 1**: `#FFF3E0` (ピーチクリーム)
- **Color 2**: `#FFE0B2` (ピーチ)
- **Color 3**: `#FFCC80` (ライトオレンジ)
- **Color 4**: `#FFB74D` (オレンジ)
- **Color 5**: `#FFA726` (ダークオレンジ)

### CSS変数定義

```css
:root {
  --gradient-peach-1: #FFF3E0;
  --gradient-peach-2: #FFE0B2;
  --gradient-peach-3: #FFCC80;
  --gradient-peach-4: #FFB74D;
  --gradient-peach-5: #FFA726;
}
```

### グラデーション例

```css
.gradient-peach-warm {
  background: linear-gradient(
    135deg,
    var(--gradient-peach-1),
    var(--gradient-peach-2),
    var(--gradient-peach-3)
  );
}

.gradient-peach-alert {
  background: linear-gradient(
    to right,
    var(--gradient-peach-1),
    var(--gradient-peach-2)
  );
  border-left: 4px solid var(--gradient-peach-4);
  padding: 1rem;
  border-radius: 8px;
}

.gradient-peach-overlay {
  background: linear-gradient(
    to bottom,
    rgba(255, 243, 224, 0.9),
    rgba(255, 224, 178, 0.9)
  );
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
}
```

### 適用シーン

- カフェ、ベーカリー
- 温かみのあるブランド
- 食品、スイーツ系サイト

---

## パレット8: Forest Mist（森の霧）

### カラーコード

- **Color 1**: `#E8F5E9` (ライトグリーン)
- **Color 2**: `#C8E6C9` (ミントグリーン)
- **Color 3**: `#A5D6A7` (ライトグリーン)
- **Color 4**: `#81C784` (グリーン)
- **Color 5**: `#66BB6A` (ミディアムグリーン)

### CSS変数定義

```css
:root {
  --gradient-forest-1: #E8F5E9;
  --gradient-forest-2: #C8E6C9;
  --gradient-forest-3: #A5D6A7;
  --gradient-forest-4: #81C784;
  --gradient-forest-5: #66BB6A;
}
```

### グラデーション例

```css
.gradient-forest-calm {
  background: linear-gradient(
    to bottom,
    var(--gradient-forest-1),
    var(--gradient-forest-2),
    var(--gradient-forest-3)
  );
}

.gradient-forest-card {
  background: linear-gradient(
    135deg,
    var(--gradient-forest-1) 0%,
    var(--gradient-forest-2) 100%
  );
  border: 2px solid var(--gradient-forest-3);
  box-shadow: 0 4px 16px rgba(165, 214, 167, 0.3);
  border-radius: 12px;
  padding: 2rem;
}

/* フォグ効果 */
.gradient-forest-fog {
  background:
    linear-gradient(
      to bottom,
      rgba(232, 245, 233, 0.7),
      rgba(200, 230, 201, 0.7)
    ),
    url('forest-background.jpg') center/cover no-repeat;
}
```

### 適用シーン

- 環境保護、エコロジー
- ガーデニング、園芸
- 自然、アウトドア

---

## パレット9: Sunset Sky（夕焼け空）

### カラーコード

- **Color 1**: `#FFEBEE` (ライトピンク)
- **Color 2**: `#FFCDD2` (ピンク)
- **Color 3**: `#EF9A9A` (ローズ)
- **Color 4**: `#E57373` (レッドピンク)
- **Color 5**: `#EF5350` (レッド)

### CSS変数定義

```css
:root {
  --gradient-sunset-sky-1: #FFEBEE;
  --gradient-sunset-sky-2: #FFCDD2;
  --gradient-sunset-sky-3: #EF9A9A;
  --gradient-sunset-sky-4: #E57373;
  --gradient-sunset-sky-5: #EF5350;
}
```

### グラデーション例

```css
.gradient-sunset-sky {
  background: linear-gradient(
    to bottom,
    var(--gradient-sunset-sky-1) 0%,
    var(--gradient-sunset-sky-2) 30%,
    var(--gradient-sunset-sky-3) 60%,
    var(--gradient-sunset-sky-4) 90%,
    var(--gradient-sunset-sky-5) 100%
  );
  min-height: 100vh;
}

/* サンセットメッシュ */
.gradient-sunset-mesh {
  background:
    radial-gradient(
      circle at 10% 20%,
      var(--gradient-sunset-sky-1) 0%,
      transparent 50%
    ),
    radial-gradient(
      circle at 90% 80%,
      var(--gradient-sunset-sky-3) 0%,
      transparent 50%
    ),
    linear-gradient(
      135deg,
      var(--gradient-sunset-sky-2),
      var(--gradient-sunset-sky-4)
    );
}
```

### 適用シーン

- リゾート、ビーチホテル
- サンセットツアー
- ロマンティックなイベント

---

## パレット10: Aqua Marine（アクアマリン）

### カラーコード

- **Color 1**: `#E0F7FA` (アクアライト)
- **Color 2**: `#B2EBF2` (ライトシアン)
- **Color 3**: `#80DEEA` (ターコイズ)
- **Color 4**: `#4DD0E1` (シアン)
- **Color 5**: `#00BCD4` (ダークシアン)

### CSS変数定義

```css
:root {
  --gradient-aqua-1: #E0F7FA;
  --gradient-aqua-2: #B2EBF2;
  --gradient-aqua-3: #80DEEA;
  --gradient-aqua-4: #4DD0E1;
  --gradient-aqua-5: #00BCD4;
}
```

### グラデーション例

```css
.gradient-aqua-fresh {
  background: linear-gradient(
    135deg,
    var(--gradient-aqua-1),
    var(--gradient-aqua-2),
    var(--gradient-aqua-3)
  );
}

.gradient-aqua-wave {
  background: linear-gradient(
    to right,
    var(--gradient-aqua-1) 0%,
    var(--gradient-aqua-3) 50%,
    var(--gradient-aqua-5) 100%
  );
}

/* 水面のような効果 */
@keyframes aqua-shimmer {
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

.gradient-aqua-animated {
  background: linear-gradient(
    -45deg,
    var(--gradient-aqua-1),
    var(--gradient-aqua-2),
    var(--gradient-aqua-3),
    var(--gradient-aqua-4)
  );
  background-size: 400% 400%;
  animation: aqua-shimmer 10s ease infinite;
}
```

### 適用シーン

- マリンスポーツ
- プール、アクアパーク
- 清涼感を演出したいサイト

---

## パレット11: Cherry Blossom（桜）

### カラーコード

- **Color 1**: `#FFF0F5` (ラベンダーブラッシュ)
- **Color 2**: `#FFE4E1` (ミスティローズ)
- **Color 3**: `#FFB6C1` (ライトピンク)
- **Color 4**: `#FFA0B4` (ピンク)
- **Color 5**: `#FF91A4` (ローズピンク)

### CSS変数定義

```css
:root {
  --gradient-cherry-1: #FFF0F5;
  --gradient-cherry-2: #FFE4E1;
  --gradient-cherry-3: #FFB6C1;
  --gradient-cherry-4: #FFA0B4;
  --gradient-cherry-5: #FF91A4;
}
```

### グラデーション例

```css
.gradient-cherry-soft {
  background: linear-gradient(
    to bottom,
    var(--gradient-cherry-1),
    var(--gradient-cherry-2),
    var(--gradient-cherry-3)
  );
}

/* 桜吹雪風 */
.gradient-cherry-petals {
  background:
    radial-gradient(
      circle at 20% 30%,
      rgba(255, 182, 193, 0.4) 0%,
      transparent 40%
    ),
    radial-gradient(
      circle at 80% 70%,
      rgba(255, 160, 180, 0.3) 0%,
      transparent 40%
    ),
    radial-gradient(
      circle at 50% 50%,
      rgba(255, 145, 164, 0.2) 0%,
      transparent 40%
    ),
    linear-gradient(
      to bottom,
      var(--gradient-cherry-1),
      var(--gradient-cherry-2)
    );
}
```

### 適用シーン

- 春のキャンペーン
- 和風デザイン
- ロマンティックなイベント

---

## パレット12: Lemon Sorbet（レモンシャーベット）

### カラーコード

- **Color 1**: `#FFFDE7` (レモンクリーム)
- **Color 2**: `#FFF9C4` (レモン)
- **Color 3**: `#FFF59D` (ライトイエロー)
- **Color 4**: `#FFF176` (イエロー)
- **Color 5**: `#FFEE58` (ブライトイエロー)

### CSS変数定義

```css
:root {
  --gradient-lemon-1: #FFFDE7;
  --gradient-lemon-2: #FFF9C4;
  --gradient-lemon-3: #FFF59D;
  --gradient-lemon-4: #FFF176;
  --gradient-lemon-5: #FFEE58;
}
```

### グラデーション例

```css
.gradient-lemon-fresh {
  background: linear-gradient(
    135deg,
    var(--gradient-lemon-1),
    var(--gradient-lemon-2),
    var(--gradient-lemon-3)
  );
}

.gradient-lemon-banner {
  background: linear-gradient(
    to right,
    var(--gradient-lemon-1) 0%,
    var(--gradient-lemon-3) 50%,
    var(--gradient-lemon-5) 100%
  );
  padding: 2rem;
  text-align: center;
}

.gradient-lemon-text {
  background: linear-gradient(
    90deg,
    var(--gradient-lemon-3),
    var(--gradient-lemon-4),
    var(--gradient-lemon-5)
  );
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
  font-weight: bold;
}
```

### 適用シーン

- レモネード、ジューススタンド
- サマーキャンペーン
- フレッシュ感、元気を演出

---

## 美しいグラデーションの基本ルール

### 1. 色相の近さ

**良い例:**

```css
/* 隣接する色相（青→緑） */
.good-gradient {
  background: linear-gradient(
    135deg,
    #E0F7FA, /* ライトシアン */
    #E0F2F1  /* ミントクリーム */
  );
}
```

**悪い例:**

```css
/* 離れた色相（青→オレンジ） */
.bad-gradient {
  background: linear-gradient(
    135deg,
    #E0F7FA, /* ライトシアン */
    #FFE0B2  /* ピーチ */
  );
  /* 中間に濁った色が発生 */
}
```

### 2. 明度の調整

**良い例:**

```css
/* 明度の差が小さい */
.good-gradient {
  background: linear-gradient(
    to bottom,
    #FFE5B4, /* 明度90% */
    #FFD700  /* 明度85% */
  );
}
```

**悪い例:**

```css
/* 明度の差が大きすぎる */
.bad-gradient {
  background: linear-gradient(
    to bottom,
    #FFFFFF, /* 明度100% */
    #000000  /* 明度0% */
  );
  /* 急激な変化で美しくない */
}
```

### 3. 彩度のバランス

**良い例:**

```css
/* 彩度が近い */
.good-gradient {
  background: linear-gradient(
    135deg,
    #E1BEE7, /* 彩度30% */
    #CE93D8  /* 彩度35% */
  );
}
```

**悪い例:**

```css
/* 彩度の差が大きい */
.bad-gradient {
  background: linear-gradient(
    135deg,
    #E1BEE7, /* 彩度30% */
    #8B00FF  /* 彩度100% */
  );
}
```

---

## 実装テクニック

### 1. メッシュグラデーション

```css
.mesh-gradient {
  background:
    radial-gradient(
      circle at 20% 30%,
      var(--color-1) 0%,
      transparent 50%
    ),
    radial-gradient(
      circle at 80% 70%,
      var(--color-2) 0%,
      transparent 50%
    ),
    radial-gradient(
      circle at 50% 50%,
      var(--color-3) 0%,
      transparent 50%
    ),
    linear-gradient(
      135deg,
      var(--color-4),
      var(--color-5)
    );
}
```

### 2. アニメーショングラデーション

```css
@keyframes gradient-shift {
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

.animated-gradient {
  background: linear-gradient(
    -45deg,
    var(--color-1),
    var(--color-2),
    var(--color-3),
    var(--color-4)
  );
  background-size: 400% 400%;
  animation: gradient-shift 15s ease infinite;
}
```

### 3. グラスモーフィズムとの組み合わせ

```css
.glass-gradient {
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.2),
    rgba(255, 255, 255, 0.1)
  );
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}
```

### 4. テキストグラデーション

```css
.gradient-text {
  background: linear-gradient(
    90deg,
    var(--color-1),
    var(--color-2),
    var(--color-3)
  );
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
}
```

---

## CSSグラデーションジェネレーター

- [WebGradients](https://webgradients.com/): 180種類のグラデーション
- [CSS Gradient](https://cssgradient.io/): カスタマイズ可能
- [Coolors Gradient Maker](https://coolors.co/gradient-maker): 色相環ベース
- [uiGradients](https://uigradients.com/): 美しいグラデーション集

---

## まとめ

癒しのグラデーションは、以下の要素が重要：

### カラー選択

- **パステルカラー**: 淡く優しい色
- **近い色相**: 隣接する色を選ぶ
- **明度の調整**: 急激な変化を避ける

### グラデーション方向

- **上から下**: 空のグラデーション
- **斜め**: 動的な印象
- **放射状**: 柔らかな広がり

### 適用箇所

- **背景**: ページ全体、セクション
- **カード**: 背景、ボーダー
- **ボタン**: ホバーエフェクト
- **テキスト**: 見出し、強調

癒しのグラデーションは、ユーザーにリラックス感を与え、サイト全体の雰囲気を柔らかく演出する。12種類のパレットから、プロジェクトの雰囲気に合った配色を選択して活用すること。

---

## Sources

- [ふわっと美しい、癒しメッシュグラデーション配色12選 - PhotoshopVIP](https://photoshopvip.net/165928)
- [全部かわいい、チルな空グラデーション配色12選 - PhotoshopVIP](https://photoshopvip.net/165878)
- [濁りなし！美しいグラデーションの基本ルールとCSSオンラインツール - PhotoshopVIP](https://photoshopvip.net/127675)
- [コピペ自由！美しいグラデーションを180種類揃えた WebGradients - PhotoshopVIP](https://photoshopvip.net/98951)
