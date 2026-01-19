# Design Tokens Overview（デザイントークン概要）

Design Tokensは、Material Design 3のデザインシステムを支える基盤技術です。色、タイポグラフィ、スペーシングなどの視覚的属性を、プラットフォーム非依存の変数として管理します。

## Design Tokensとは

### 概念

Design Tokensは、デザインシステムの「原子」です。UIの視覚的属性を名前付きの値として定義し、デザインツール（Figma）とコード（CSS、Kotlin、Swift）の両方で共有します。

**例**:
```
トークン名: sys.color.primary
値（ライトモード）: #6750A4
値（ダークモード）: #D0BCFF
```

### なぜ Design Tokens が重要か

#### 1. 一貫性
- **デザインとコードの同期**: デザイナーと開発者が同じ値を参照
- **プラットフォーム間の統一**: Web、Android、iOSで同じデザイン言語

#### 2. 効率性
- **一元管理**: 色を変更したい場合、トークン定義を1箇所変更するだけ
- **迅速な更新**: ブランドカラーの変更がシステム全体に即座に反映

#### 3. スケーラビリティ
- **テーマの切り替え**: ライトモード・ダークモードの自動対応
- **ブランドバリエーション**: 複数ブランドやホワイトラベル製品に対応

#### 4. 保守性
- **命名規則**: セマンティックな名前で意図が明確
- **変更の影響範囲**: どこで何が使われているか追跡可能

## Material Design 3のトークン階層

### 3層構造

Material Design 3では、トークンを3つの層で管理します：

#### 1. Reference Tokens（参照トークン）
- **役割**: 基本パレット（色の生成値）
- **例**: `ref.palette.primary0`, `ref.palette.primary40`, `ref.palette.primary80`
- **使用者**: システム内部のみ（直接使用しない）

#### 2. System Tokens（システムトークン）
- **役割**: セマンティックな役割の定義
- **例**: `sys.color.primary`, `sys.color.on-primary`, `sys.color.surface`
- **使用者**: コンポーネントライブラリ

#### 3. Component Tokens（コンポーネントトークン）
- **役割**: 個別コンポーネントのスタイル
- **例**: `button.filled.container.color`, `card.elevated.container.color`
- **使用者**: 特定のコンポーネント

### なぜ3層が必要か

- **柔軟性**: コンポーネントごとに異なる値を設定可能
- **一貫性**: システムトークンで全体の一貫性を保つ
- **カスタマイズ性**: 必要なレベルだけをカスタマイズ

## トークンの種類

### 1. Color Tokens（カラートークン）

```
sys.color.primary          // プライマリカラー
sys.color.on-primary       // プライマリ背景上のテキスト
sys.color.primary-container // プライマリコンテナ
sys.color.surface          // サーフェス背景
sys.color.error            // エラー色
```

### 2. Typography Tokens（タイポグラフィトークン）

```
sys.typescale.headline-large.font-family
sys.typescale.headline-large.font-size
sys.typescale.headline-large.line-height
sys.typescale.body-medium.font-family
```

### 3. Shape Tokens（形状トークン）

```
sys.shape.corner.none       // 角丸なし
sys.shape.corner.extra-small // 4dp
sys.shape.corner.small      // 8dp
sys.shape.corner.medium     // 12dp
sys.shape.corner.large      // 16dp
sys.shape.corner.extra-large // 28dp
```

### 4. Elevation Tokens（エレベーショントークン）

```
sys.elevation.level0        // 影なし
sys.elevation.level1        // わずかな影
sys.elevation.level2        // 中程度の影
sys.elevation.level3-5      // 強い影
```

### 5. Spacing Tokens（スペーシングトークン）

```
sys.spacing.xs   // 4dp
sys.spacing.sm   // 8dp
sys.spacing.md   // 16dp
sys.spacing.lg   // 24dp
sys.spacing.xl   // 32dp
```

## Semantic Naming（セマンティック命名）

### 命名の原則

Design Tokensの名前は、**役割**を示し、**値**を示さない：

#### 良い例（役割ベース）
```
sys.color.primary           // 主要な色
sys.color.error             // エラー時の色
sys.color.on-surface        // サーフェス上のテキスト
```

#### 悪い例（値ベース）
```
color.purple-600            // 値を直接示している
color.light-gray            // 値を直接示している
color.rgb-103-80-164        // 値を直接示している
```

### なぜセマンティック命名か

1. **意図が明確**: 何のために使うかがわかる
2. **変更に強い**: 色を変えてもトークン名は変わらない
3. **ダークモード対応**: 同じトークン名で異なる値を使用

## Design Tokensの使い方

### デザインツール（Figma）

1. Material Theme Builderでテーマ作成
2. Figma Variablesとして自動生成
3. デザイン時にトークンを参照

### コード（実装）

#### CSS（概念的）
```css
.button-filled {
  background-color: var(--sys-color-primary);
  color: var(--sys-color-on-primary);
  border-radius: var(--sys-shape-corner-medium);
}
```

#### テーマ切り替え
```css
[data-theme="light"] {
  --sys-color-primary: #6750A4;
  --sys-color-on-primary: #FFFFFF;
}

[data-theme="dark"] {
  --sys-color-primary: #D0BCFF;
  --sys-color-on-primary: #381E72;
}
```

## カスタマイゼーション

### どのレベルをカスタマイズすべきか

#### Reference Tokens
- **カスタマイズ**: ブランドカラーを変更する場合
- **影響範囲**: システム全体
- **推奨方法**: Material Theme Builderを使用

#### System Tokens
- **カスタマイズ**: 特定の役割の色を変えたい場合
- **影響範囲**: その役割を使うすべてのコンポーネント
- **例**: Errorカラーを赤からオレンジに変更

#### Component Tokens
- **カスタマイズ**: 特定のコンポーネントだけを変えたい場合
- **影響範囲**: そのコンポーネントのみ
- **例**: ボタンだけの角丸を変更

## ベストプラクティス

### DO（推奨）

1. **トークンを使用**: 固定値ではなく、常にトークンを参照
2. **セマンティックな命名**: 役割に基づいた名前
3. **Material Theme Builderを活用**: 手動ではなくツールで生成
4. **ドキュメント化**: カスタムトークンは用途を明記

### DON'T（避けるべき）

1. **固定値のハードコーディング**: `#6750A4`を直接使用
2. **値ベースの命名**: `color-purple-600`のような名前
3. **過度なカスタマイズ**: システムトークンを無視して独自実装
4. **一貫性の欠如**: 同じ目的に異なるトークンを使用

## Design Tokensのメリット

### デザイナーにとって

- Figmaでデザインがそのままコードに反映
- ブランド変更時の作業量削減
- 一貫性のあるデザインが自動的に保証

### 開発者にとって

- スタイルの実装が高速化
- テーマ切り替えが容易
- デザイナーとの齟齬が減少

### プロダクトオーナーにとって

- ブランドリフレッシュのコスト削減
- 複数プラットフォームでの一貫性
- ホワイトラベル製品の展開が容易

## 参考リソース

- [Design Tokens](https://m3.material.io/foundations/design-tokens)
- [Material Theme Builder](https://m3.material.io/theme-builder)
- [Design Tokens Community Group](https://www.w3.org/community/design-tokens/)

---

**出典**: Material Design 3 公式ドキュメント (https://m3.material.io/)
**最終取得日**: 2026-01-19
