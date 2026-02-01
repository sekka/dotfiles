# アースカラー配色パレット

## メタデータ

- **用途タグ**: `#アースカラー` `#ナチュラル` `#配色` `#カラーパレット` `#Webデザイン`
- **出典**: [まず覚えたい、おしゃれに見えるアースカラー配色15選 - PhotoshopVIP](https://photoshopvip.net/166051)
- **最終更新**: 2025年

---

## 概要

アースカラーは、大地・植物・空・海など自然界に存在する色を基調とした配色。温かみがあり、落ち着いた雰囲気を演出できる。

Web デザイン、イラスト、バナー作成に最適な15種類のアースカラーパレット（各5色）を、CSS変数形式で提供する。

---

## パレット1: Warm Earth（温かみのある大地）

### カラーコード

- **Primary**: `#D4A574` (サンドベージュ)
- **Secondary**: `#C67B5C` (テラコッタ)
- **Accent**: `#8B6F47` (ダークブラウン)
- **Background**: `#F5E6D3` (アイボリー)
- **Text**: `#3E2723` (エスプレッソ)

### CSS変数定義

```css
:root {
  --earth-warm-primary: #D4A574;
  --earth-warm-secondary: #C67B5C;
  --earth-warm-accent: #8B6F47;
  --earth-warm-bg: #F5E6D3;
  --earth-warm-text: #3E2723;
}
```

### 使用例

```css
.card {
  background: var(--earth-warm-bg);
  color: var(--earth-warm-text);
  border-left: 4px solid var(--earth-warm-primary);
}

.button {
  background: var(--earth-warm-primary);
  color: var(--earth-warm-text);
  border: 2px solid var(--earth-warm-accent);
}

.button:hover {
  background: var(--earth-warm-secondary);
}
```

### 適用シーン

- カフェ、ベーカリーのサイト
- オーガニック製品、自然派化粧品
- 温かみのあるブログデザイン

---

## パレット2: Forest Green（森の緑）

### カラーコード

- **Primary**: `#6B8E23` (オリーブグリーン)
- **Secondary**: `#8FBC8F` (ダークシーグリーン)
- **Accent**: `#556B2F` (ダークオリーブグリーン)
- **Background**: `#F0F8E8` (ミントクリーム)
- **Text**: `#2F4F2F` (ダークグリーン)

### CSS変数定義

```css
:root {
  --earth-forest-primary: #6B8E23;
  --earth-forest-secondary: #8FBC8F;
  --earth-forest-accent: #556B2F;
  --earth-forest-bg: #F0F8E8;
  --earth-forest-text: #2F4F2F;
}
```

### 使用例

```css
header {
  background: var(--earth-forest-primary);
  color: var(--earth-forest-bg);
}

.hero {
  background: linear-gradient(
    135deg,
    var(--earth-forest-secondary),
    var(--earth-forest-primary)
  );
  color: white;
}

.tag {
  background: var(--earth-forest-accent);
  color: var(--earth-forest-bg);
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
}
```

### 適用シーン

- 環境保護団体、エコロジー系サイト
- アウトドア、キャンプ用品
- 自然療法、健康食品

---

## パレット3: Desert Sand（砂漠の砂）

### カラーコード

- **Primary**: `#E6B87E` (サンド)
- **Secondary**: `#D2A679` (ベージュ)
- **Accent**: `#A67C52` (キャメル)
- **Background**: `#FAF3E0` (リネン)
- **Text**: `#5D4E37` (ダークカーキ)

### CSS変数定義

```css
:root {
  --earth-desert-primary: #E6B87E;
  --earth-desert-secondary: #D2A679;
  --earth-desert-accent: #A67C52;
  --earth-desert-bg: #FAF3E0;
  --earth-desert-text: #5D4E37;
}
```

### 使用例

```css
.container {
  background: var(--earth-desert-bg);
  color: var(--earth-desert-text);
}

.card-header {
  background: var(--earth-desert-primary);
  padding: 1rem;
  border-bottom: 2px solid var(--earth-desert-accent);
}

blockquote {
  border-left: 4px solid var(--earth-desert-secondary);
  padding-left: 1rem;
  color: var(--earth-desert-text);
  background: rgba(230, 184, 126, 0.1);
}
```

### 適用シーン

- 旅行、リゾート系サイト
- クラフト、ハンドメイド製品
- ミニマルなブログ

---

## パレット4: Ocean Blue（海の青）

### カラーコード

- **Primary**: `#4A7C7E` (ティール)
- **Secondary**: `#6BA5A8` (ライトティール)
- **Accent**: `#2F5C5E` (ダークティール)
- **Background**: `#E8F4F5` (ライトシアン)
- **Text**: `#1F3A3C` (ダークスレートグレイ)

### CSS変数定義

```css
:root {
  --earth-ocean-primary: #4A7C7E;
  --earth-ocean-secondary: #6BA5A8;
  --earth-ocean-accent: #2F5C5E;
  --earth-ocean-bg: #E8F4F5;
  --earth-ocean-text: #1F3A3C;
}
```

### 使用例

```css
nav {
  background: var(--earth-ocean-primary);
  color: white;
}

.link {
  color: var(--earth-ocean-secondary);
  text-decoration: none;
  border-bottom: 2px solid transparent;
  transition: border-color 0.3s;
}

.link:hover {
  border-bottom-color: var(--earth-ocean-accent);
}

.section {
  background: var(--earth-ocean-bg);
  padding: 3rem 1rem;
}
```

### 適用シーン

- マリンスポーツ、サーフショップ
- 水産業、海洋関連企業
- 涼しげなサマーキャンペーン

---

## パレット5: Autumn Leaves（紅葉）

### カラーコード

- **Primary**: `#C1876B` (バーントシエナ)
- **Secondary**: `#D4A574` (ゴールデンブラウン)
- **Accent**: `#8B4513` (サドルブラウン)
- **Background**: `#FFF8DC` (コーンシルク)
- **Text**: `#4A2511` (ダークチョコレート)

### CSS変数定義

```css
:root {
  --earth-autumn-primary: #C1876B;
  --earth-autumn-secondary: #D4A574;
  --earth-autumn-accent: #8B4513;
  --earth-autumn-bg: #FFF8DC;
  --earth-autumn-text: #4A2511;
}
```

### 使用例

```css
.hero-banner {
  background: linear-gradient(
    135deg,
    var(--earth-autumn-primary),
    var(--earth-autumn-secondary)
  );
  color: var(--earth-autumn-bg);
  padding: 4rem 2rem;
  text-align: center;
}

.card-autumn {
  background: var(--earth-autumn-bg);
  border: 2px solid var(--earth-autumn-accent);
  box-shadow: 0 4px 12px rgba(139, 69, 19, 0.15);
}

.badge {
  background: var(--earth-autumn-accent);
  color: var(--earth-autumn-bg);
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: bold;
}
```

### 適用シーン

- 秋のキャンペーン、イベント
- 温かみのある飲食店サイト
- 伝統工芸、和風デザイン

---

## パレット6: Lavender Field（ラベンダー畑）

### カラーコード

- **Primary**: `#9B8AA4` (ラベンダーグレイ)
- **Secondary**: `#BFA7C4` (ライトラベンダー)
- **Accent**: `#735C78` (ダークラベンダー)
- **Background**: `#F5F0F6` (ラベンダーブラッシュ)
- **Text**: `#4A3F4D` (ダークプラム)

### CSS変数定義

```css
:root {
  --earth-lavender-primary: #9B8AA4;
  --earth-lavender-secondary: #BFA7C4;
  --earth-lavender-accent: #735C78;
  --earth-lavender-bg: #F5F0F6;
  --earth-lavender-text: #4A3F4D;
}
```

### 使用例

```css
.sidebar {
  background: var(--earth-lavender-bg);
  border-right: 2px solid var(--earth-lavender-primary);
}

.sidebar-item:hover {
  background: rgba(191, 167, 196, 0.2);
  border-left: 3px solid var(--earth-lavender-accent);
}

.form-input {
  border: 2px solid var(--earth-lavender-primary);
  background: var(--earth-lavender-bg);
  color: var(--earth-lavender-text);
}

.form-input:focus {
  border-color: var(--earth-lavender-accent);
  outline: none;
}
```

### 適用シーン

- スパ、リラクゼーション施設
- ウェルネス、ヨガスタジオ
- 女性向けファッション、コスメ

---

## パレット7: Clay & Stone（粘土と石）

### カラーコード

- **Primary**: `#A0826D` (クレイ)
- **Secondary**: `#C9B8A8` (ストーン)
- **Accent**: `#6E5C4E` (ダーククレイ)
- **Background**: `#EAE4DC` (ライトストーン)
- **Text**: `#3D3129` (エスプレッソ)

### CSS変数定義

```css
:root {
  --earth-clay-primary: #A0826D;
  --earth-clay-secondary: #C9B8A8;
  --earth-clay-accent: #6E5C4E;
  --earth-clay-bg: #EAE4DC;
  --earth-clay-text: #3D3129;
}
```

### 使用例

```css
.gallery-item {
  background: var(--earth-clay-bg);
  border: 3px solid var(--earth-clay-primary);
  transition: transform 0.3s;
}

.gallery-item:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 24px rgba(110, 92, 78, 0.2);
}

.caption {
  background: var(--earth-clay-accent);
  color: var(--earth-clay-bg);
  padding: 1rem;
}
```

### 適用シーン

- 陶芸、工芸品サイト
- インテリアデザイン、建築
- アート、ギャラリー

---

## パレット8: Moss & Fern（苔とシダ）

### カラーコード

- **Primary**: `#6F8F72` (モスグリーン)
- **Secondary**: `#8CAA8D` (ファーングリーン)
- **Accent**: `#4A5F4C` (ダークモス)
- **Background**: `#EFF5EF` (ミントティント)
- **Text**: `#2E3D2F` (ディープグリーン)

### CSS変数定義

```css
:root {
  --earth-moss-primary: #6F8F72;
  --earth-moss-secondary: #8CAA8D;
  --earth-moss-accent: #4A5F4C;
  --earth-moss-bg: #EFF5EF;
  --earth-moss-text: #2E3D2F;
}
```

### 使用例

```css
.pricing-card {
  background: var(--earth-moss-bg);
  border: 2px solid var(--earth-moss-primary);
  border-radius: 12px;
  padding: 2rem;
}

.pricing-card-header {
  background: var(--earth-moss-accent);
  color: white;
  padding: 1rem;
  border-radius: 8px 8px 0 0;
}

.pricing-card-button {
  background: var(--earth-moss-primary);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
}

.pricing-card-button:hover {
  background: var(--earth-moss-secondary);
}
```

### 適用シーン

- ガーデニング、園芸用品
- 自然保護、環境団体
- リラックス系サービス

---

## パレット9: Wheat Field（麦畑）

### カラーコード

- **Primary**: `#D4AF37` (ゴールデンウィート)
- **Secondary**: `#E8C878` (ライトウィート)
- **Accent**: `#A47E3B` (ダークウィート)
- **Background**: `#FFF9E5` (クリーム)
- **Text**: `#5C4A2F` (ブラウンシュガー)

### CSS変数定義

```css
:root {
  --earth-wheat-primary: #D4AF37;
  --earth-wheat-secondary: #E8C878;
  --earth-wheat-accent: #A47E3B;
  --earth-wheat-bg: #FFF9E5;
  --earth-wheat-text: #5C4A2F;
}
```

### 使用例

```css
.banner {
  background: linear-gradient(
    90deg,
    var(--earth-wheat-primary),
    var(--earth-wheat-secondary)
  );
  color: var(--earth-wheat-text);
  padding: 2rem;
  text-align: center;
}

.alert-info {
  background: var(--earth-wheat-bg);
  border-left: 4px solid var(--earth-wheat-accent);
  padding: 1rem;
  color: var(--earth-wheat-text);
}

.icon {
  color: var(--earth-wheat-primary);
  font-size: 2rem;
}
```

### 適用シーン

- 農業、オーガニック食品
- パン屋、製菓店
- 豊かさを演出したいサイト

---

## パレット10: River Rock（川の石）

### カラーコード

- **Primary**: `#90A4AE` (ブルーグレイ)
- **Secondary**: `#B0BEC5` (ライトブルーグレイ)
- **Accent**: `#607D8B` (スレートグレイ)
- **Background**: `#ECEFF1` (クールグレイ)
- **Text**: `#37474F` (ダークスレート)

### CSS変数定義

```css
:root {
  --earth-river-primary: #90A4AE;
  --earth-river-secondary: #B0BEC5;
  --earth-river-accent: #607D8B;
  --earth-river-bg: #ECEFF1;
  --earth-river-text: #37474F;
}
```

### 使用例

```css
.footer {
  background: var(--earth-river-accent);
  color: var(--earth-river-bg);
  padding: 3rem 1rem;
}

.footer-link {
  color: var(--earth-river-secondary);
  text-decoration: none;
  transition: color 0.3s;
}

.footer-link:hover {
  color: white;
}

.divider {
  border: 0;
  height: 2px;
  background: linear-gradient(
    to right,
    transparent,
    var(--earth-river-primary),
    transparent
  );
}
```

### 適用シーン

- テクノロジー系企業（自然とテクノロジーの融合）
- 建築、デザイン事務所
- クールでモダンなサイト

---

## パレット11: Sunset Clay（夕焼けの粘土）

### カラーコード

- **Primary**: `#D4816E` (テラコッタオレンジ)
- **Secondary**: `#E9A896` (サーモンピンク)
- **Accent**: `#A45A49` (ダークテラコッタ)
- **Background**: `#FFF3E0` (ウォームクリーム)
- **Text**: `#4E2A1F` (ダークチョコレート)

### CSS変数定義

```css
:root {
  --earth-sunset-primary: #D4816E;
  --earth-sunset-secondary: #E9A896;
  --earth-sunset-accent: #A45A49;
  --earth-sunset-bg: #FFF3E0;
  --earth-sunset-text: #4E2A1F;
}
```

### 使用例

```css
.testimonial {
  background: var(--earth-sunset-bg);
  border-left: 5px solid var(--earth-sunset-primary);
  padding: 2rem;
  border-radius: 8px;
}

.testimonial-author {
  color: var(--earth-sunset-accent);
  font-weight: bold;
}

.cta-button {
  background: var(--earth-sunset-primary);
  color: white;
  padding: 1rem 2rem;
  border: none;
  border-radius: 30px;
  box-shadow: 0 4px 12px rgba(212, 129, 110, 0.3);
}

.cta-button:hover {
  background: var(--earth-sunset-accent);
  box-shadow: 0 6px 16px rgba(164, 90, 73, 0.4);
}
```

### 適用シーン

- 温かみのあるブランド
- 手作り、工芸品
- サンセットビーチリゾート

---

## パレット12: Pine Forest（松林）

### カラーコード

- **Primary**: `#4F7942` (パイングリーン)
- **Secondary**: `#6B9A5B` (ライトパイン)
- **Accent**: `#3A5A2F` (ダークパイン)
- **Background**: `#EBF4E8` (ペールグリーン)
- **Text**: `#263C1F` (フォレストグリーン)

### CSS変数定義

```css
:root {
  --earth-pine-primary: #4F7942;
  --earth-pine-secondary: #6B9A5B;
  --earth-pine-accent: #3A5A2F;
  --earth-pine-bg: #EBF4E8;
  --earth-pine-text: #263C1F;
}
```

### 使用例

```css
.navigation {
  background: var(--earth-pine-primary);
  box-shadow: 0 2px 8px rgba(79, 121, 66, 0.2);
}

.navigation-link {
  color: var(--earth-pine-bg);
  padding: 1rem 1.5rem;
  text-decoration: none;
  transition: background 0.3s;
}

.navigation-link:hover {
  background: var(--earth-pine-accent);
}

.highlight-box {
  background: var(--earth-pine-bg);
  border: 2px dashed var(--earth-pine-secondary);
  padding: 1.5rem;
}
```

### 適用シーン

- キャンプ、アウトドア用品
- 林業、木材関連
- 自然との共生を訴求するサイト

---

## パレット13: Sandstone（砂岩）

### カラーコード

- **Primary**: `#C4A57B` (サンドストーンベージュ)
- **Secondary**: `#D9C3A3` (ライトサンドストーン)
- **Accent**: `#9A7B4F` (ダークサンドストーン)
- **Background**: `#F7F0E7` (ソフトベージュ)
- **Text**: `#5C4A33` (ウォールナット)

### CSS変数定義

```css
:root {
  --earth-sandstone-primary: #C4A57B;
  --earth-sandstone-secondary: #D9C3A3;
  --earth-sandstone-accent: #9A7B4F;
  --earth-sandstone-bg: #F7F0E7;
  --earth-sandstone-text: #5C4A33;
}
```

### 使用例

```css
.article {
  background: var(--earth-sandstone-bg);
  color: var(--earth-sandstone-text);
  max-width: 800px;
  margin: 0 auto;
  padding: 3rem 2rem;
}

.article-title {
  color: var(--earth-sandstone-accent);
  border-bottom: 3px solid var(--earth-sandstone-primary);
  padding-bottom: 0.5rem;
}

.quote {
  background: rgba(196, 165, 123, 0.1);
  border-left: 4px solid var(--earth-sandstone-secondary);
  padding: 1rem 1.5rem;
  font-style: italic;
}
```

### 適用シーン

- 歴史、博物館
- 石材、建築資材
- 古代文明をテーマにしたサイト

---

## パレット14: Sage & Olive（セージとオリーブ）

### カラーコード

- **Primary**: `#9CAF88` (セージグリーン)
- **Secondary**: `#B8C5A8` (ライトセージ)
- **Accent**: `#7A8F6A` (オリーブグリーン)
- **Background**: `#F2F6EF` (セージティント)
- **Text**: `#3F4F35` (ダークセージ)

### CSS変数定義

```css
:root {
  --earth-sage-primary: #9CAF88;
  --earth-sage-secondary: #B8C5A8;
  --earth-sage-accent: #7A8F6A;
  --earth-sage-bg: #F2F6EF;
  --earth-sage-text: #3F4F35;
}
```

### 使用例

```css
.menu-card {
  background: var(--earth-sage-bg);
  border: 2px solid var(--earth-sage-primary);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 16px rgba(156, 175, 136, 0.15);
}

.menu-card-header {
  background: var(--earth-sage-accent);
  color: white;
  padding: 1rem;
  margin: -1.5rem -1.5rem 1rem;
  border-radius: 10px 10px 0 0;
}

.price {
  color: var(--earth-sage-primary);
  font-weight: bold;
  font-size: 1.25rem;
}
```

### 適用シーン

- ヘルスケア、自然療法
- オーガニックカフェ、レストラン
- ガーデニング、ハーブ専門店

---

## パレット15: Copper & Bronze（銅と青銅）

### カラーコード

- **Primary**: `#B87333` (カッパー)
- **Secondary**: `#CD7F32` (ブロンズ)
- **Accent**: `#8B4513` (ダークブロンズ)
- **Background**: `#FAF0E6` (リネン)
- **Text**: `#3E2723` (ダークブラウン)

### CSS変数定義

```css
:root {
  --earth-copper-primary: #B87333;
  --earth-copper-secondary: #CD7F32;
  --earth-copper-accent: #8B4513;
  --earth-copper-bg: #FAF0E6;
  --earth-copper-text: #3E2723;
}
```

### 使用例

```css
.achievement-badge {
  background: linear-gradient(
    135deg,
    var(--earth-copper-primary),
    var(--earth-copper-secondary)
  );
  color: white;
  padding: 1rem 2rem;
  border-radius: 50px;
  box-shadow:
    0 4px 12px rgba(184, 115, 51, 0.3),
    inset 0 1px 1px rgba(255, 255, 255, 0.3);
}

.timeline-item::before {
  content: '';
  display: block;
  width: 12px;
  height: 12px;
  background: var(--earth-copper-accent);
  border: 3px solid var(--earth-copper-secondary);
  border-radius: 50%;
}

.sidebar-widget {
  background: var(--earth-copper-bg);
  border-top: 3px solid var(--earth-copper-primary);
  padding: 1.5rem;
}
```

### 適用シーン

- アンティーク、ヴィンテージショップ
- 歴史、文化遺産サイト
- 高級感のあるブランド

---

## 全パレットの一括定義

### CSS変数（全パレット）

```css
:root {
  /* Warm Earth */
  --earth-warm-primary: #D4A574;
  --earth-warm-secondary: #C67B5C;
  --earth-warm-accent: #8B6F47;
  --earth-warm-bg: #F5E6D3;
  --earth-warm-text: #3E2723;

  /* Forest Green */
  --earth-forest-primary: #6B8E23;
  --earth-forest-secondary: #8FBC8F;
  --earth-forest-accent: #556B2F;
  --earth-forest-bg: #F0F8E8;
  --earth-forest-text: #2F4F2F;

  /* Desert Sand */
  --earth-desert-primary: #E6B87E;
  --earth-desert-secondary: #D2A679;
  --earth-desert-accent: #A67C52;
  --earth-desert-bg: #FAF3E0;
  --earth-desert-text: #5D4E37;

  /* Ocean Blue */
  --earth-ocean-primary: #4A7C7E;
  --earth-ocean-secondary: #6BA5A8;
  --earth-ocean-accent: #2F5C5E;
  --earth-ocean-bg: #E8F4F5;
  --earth-ocean-text: #1F3A3C;

  /* Autumn Leaves */
  --earth-autumn-primary: #C1876B;
  --earth-autumn-secondary: #D4A574;
  --earth-autumn-accent: #8B4513;
  --earth-autumn-bg: #FFF8DC;
  --earth-autumn-text: #4A2511;

  /* Lavender Field */
  --earth-lavender-primary: #9B8AA4;
  --earth-lavender-secondary: #BFA7C4;
  --earth-lavender-accent: #735C78;
  --earth-lavender-bg: #F5F0F6;
  --earth-lavender-text: #4A3F4D;

  /* Clay & Stone */
  --earth-clay-primary: #A0826D;
  --earth-clay-secondary: #C9B8A8;
  --earth-clay-accent: #6E5C4E;
  --earth-clay-bg: #EAE4DC;
  --earth-clay-text: #3D3129;

  /* Moss & Fern */
  --earth-moss-primary: #6F8F72;
  --earth-moss-secondary: #8CAA8D;
  --earth-moss-accent: #4A5F4C;
  --earth-moss-bg: #EFF5EF;
  --earth-moss-text: #2E3D2F;

  /* Wheat Field */
  --earth-wheat-primary: #D4AF37;
  --earth-wheat-secondary: #E8C878;
  --earth-wheat-accent: #A47E3B;
  --earth-wheat-bg: #FFF9E5;
  --earth-wheat-text: #5C4A2F;

  /* River Rock */
  --earth-river-primary: #90A4AE;
  --earth-river-secondary: #B0BEC5;
  --earth-river-accent: #607D8B;
  --earth-river-bg: #ECEFF1;
  --earth-river-text: #37474F;

  /* Sunset Clay */
  --earth-sunset-primary: #D4816E;
  --earth-sunset-secondary: #E9A896;
  --earth-sunset-accent: #A45A49;
  --earth-sunset-bg: #FFF3E0;
  --earth-sunset-text: #4E2A1F;

  /* Pine Forest */
  --earth-pine-primary: #4F7942;
  --earth-pine-secondary: #6B9A5B;
  --earth-pine-accent: #3A5A2F;
  --earth-pine-bg: #EBF4E8;
  --earth-pine-text: #263C1F;

  /* Sandstone */
  --earth-sandstone-primary: #C4A57B;
  --earth-sandstone-secondary: #D9C3A3;
  --earth-sandstone-accent: #9A7B4F;
  --earth-sandstone-bg: #F7F0E7;
  --earth-sandstone-text: #5C4A33;

  /* Sage & Olive */
  --earth-sage-primary: #9CAF88;
  --earth-sage-secondary: #B8C5A8;
  --earth-sage-accent: #7A8F6A;
  --earth-sage-bg: #F2F6EF;
  --earth-sage-text: #3F4F35;

  /* Copper & Bronze */
  --earth-copper-primary: #B87333;
  --earth-copper-secondary: #CD7F32;
  --earth-copper-accent: #8B4513;
  --earth-copper-bg: #FAF0E6;
  --earth-copper-text: #3E2723;
}
```

---

## 使用上のヒント

### 1. 組み合わせのコツ

- **Primary**: メインカラー（ヘッダー、ボタン）
- **Secondary**: サブカラー（ホバー、アクセント）
- **Accent**: 強調色（CTA、重要な要素）
- **Background**: 背景色（ページ全体、カード背景）
- **Text**: テキスト色（本文、見出し）

### 2. コントラスト確保

**WCAG 2.1 AA基準**: テキストと背景のコントラスト比 4.5:1 以上

各パレットは、テキスト色と背景色のコントラスト比を確保している。

### 3. ダークモード対応

```css
[data-theme="dark"] {
  --earth-warm-primary: #E6B684;
  --earth-warm-bg: #2E2723;
  --earth-warm-text: #F5E6D3;
}
```

### 4. グラデーション活用

```css
.gradient-bg {
  background: linear-gradient(
    135deg,
    var(--earth-warm-primary),
    var(--earth-warm-secondary)
  );
}
```

---

## まとめ

アースカラーは、温かみと落ち着きを演出し、自然との調和を感じさせる。Web デザインでは、ユーザーにリラックス感を与え、信頼性を高める効果がある。

15種類のパレットから、プロジェクトの雰囲気に合ったカラーを選択して活用すること。

---

## Sources

- [まず覚えたい、おしゃれに見えるアースカラー配色15選 - PhotoshopVIP](https://photoshopvip.net/166051)
