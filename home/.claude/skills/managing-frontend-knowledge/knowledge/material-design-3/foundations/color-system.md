# Color System（カラーシステム）

Material Design 3のカラーシステムは、Dynamic Color、セマンティックカラーロール、アクセシビリティを中心に設計されています。

## 概要

Material Design 3のカラーシステムは、以下の目標を達成するために設計されています：

- **パーソナライゼーション**: ユーザーの好みに応じた色の適応
- **アクセシビリティ**: すべてのユーザーが快適に使えるコントラスト
- **柔軟性**: ブランドの個性を表現しつつ、システムの一貫性を維持
- **スケーラビリティ**: ライトモード・ダークモードの自動対応

## Dynamic Color（ダイナミックカラー）

### 概念

Dynamic Colorは、ユーザーの壁紙や選択した色から自動的にカラーパレットを生成する機能です。

**目的**:
- ユーザーに個人的なつながりを感じさせる
- デバイス全体で一貫したカラー体験
- ブランドとユーザーの好みのバランス

### いつ使うべきか

#### 推奨される場合
- **Androidアプリ**: Android 12+で自動的にサポート
- **パーソナライゼーション重視**: ユーザーごとの体験をカスタマイズ
- **汎用的なアプリ**: ブランドカラーに強いこだわりがない場合

#### 慎重に検討すべき場合
- **強いブランドアイデンティティ**: ブランドカラーが重要な場合は固定カラーを使用
- **法人向けアプリ**: 企業ブランディングが優先される場合
- **アクセシビリティ厳守**: 特定の業界（医療、金融など）で色のコントラストが法的に規定されている場合

## Color Roles（カラーロール）

Material Design 3では、色を「役割」で定義します。色そのものではなく、その色が果たす機能を指定します。

### 主要なカラーロール

#### Primary（プライマリ）
- **用途**: 最も目立つアクションやコンポーネント（FAB、重要なボタン）
- **使用頻度**: 高
- **例**: CTAボタン、選択状態、リンク

#### Secondary（セカンダリ）
- **用途**: プライマリを補完する、やや控えめなアクション
- **使用頻度**: 中
- **例**: フィルタチップ、補助的なFAB

#### Tertiary（ターシャリー）
- **用途**: アクセントカラー、プライマリとセカンダリのバランスを取る
- **使用頻度**: 低
- **例**: ハイライト、特別な状態の強調

#### Error（エラー）
- **用途**: エラー状態、警告、破壊的アクション
- **使用頻度**: 必要時のみ
- **例**: エラーメッセージ、削除ボタン、フォームバリデーションエラー

#### Surface（サーフェス）
- **用途**: 背景やコンテナ
- **種類**: Surface, Surface Variant, Surface Container など複数のバリエーション
- **例**: カード、ダイアログの背景

#### On-色（On-colors）
- **用途**: 特定の背景色の上に配置されるテキストやアイコン
- **例**: On-Primary（Primary背景上のテキスト）、On-Surface（Surface背景上のテキスト）

### カラーロールの選び方

```
アクションの重要度を判断
  ↓
最も重要？ → Primary
やや重要？ → Secondary
アクセント・差別化？ → Tertiary
エラー・警告？ → Error
背景？ → Surface系
```

## トーンとバリエーション

Material Design 3では、各カラーロールに対して複数の「トーン」が用意されています。

### トーンシステム

- **0-100の数値**: 0が最も暗く、100が最も明るい
- **主要トーン**: 40, 80, 90など特定のトーンが役割に応じて使用される
- **ライトモード**: 通常40（濃い色）が使用される
- **ダークモード**: 通常80（明るい色）が使用される

### トーンの使い分け

#### ライトモード
- **Primary**: Primary-40（背景）、On-Primary-100（テキスト）
- **Surface**: Surface-98（背景）、On-Surface-10（テキスト）
- **Container**: Primary-90（コンテナ背景）、On-Primary-Container-10（テキスト）

#### ダークモード
- **Primary**: Primary-80（背景）、On-Primary-20（テキスト）
- **Surface**: Surface-10（背景）、On-Surface-90（テキスト）
- **Container**: Primary-30（コンテナ背景）、On-Primary-Container-90（テキスト）

## アクセシビリティとコントラスト

### WCAG基準

Material Design 3は、WCAG 2.1のコントラスト基準に準拠しています：

- **AAレベル**: 最低コントラスト比 4.5:1（通常テキスト）、3:1（大きなテキスト）
- **AAAレベル**: より高いコントラスト比 7:1（通常テキスト）、4.5:1（大きなテキスト）

### Material Design 3の対応

- **自動コントラスト調整**: カラートーンシステムがAAレベルを自動保証
- **On-色の仕組み**: 各背景色に対して、十分なコントラストのテキスト色を提供
- **テストツール**: Material Theme Builderでアクセシビリティチェックが可能

### コントラストの確認

```
デザイン時の確認事項:
1. Primary + On-Primary のコントラスト → 4.5:1以上
2. Surface + On-Surface のコントラスト → 4.5:1以上
3. Error + On-Error のコントラスト → 4.5:1以上
4. カスタムカラーを使用する場合 → 必ずコントラストチェッカーで確認
```

## カラーの使い方のベストプラクティス

### DO（推奨）

1. **セマンティックな使用**: カラーロールを目的に応じて使用
   ```
   ✓ Primary for CTAs (主要アクション)
   ✓ Error for error states (エラー状態)
   ✓ Surface for backgrounds (背景)
   ```

2. **一貫性**: 同じ意味には同じ色を使用
   ```
   ✓ すべてのエラーメッセージにError色
   ✓ すべての主要ボタンにPrimary色
   ```

3. **コントラストの確保**: すべてのテキストでWCAG AA以上
   ```
   ✓ On-色を使用して自動的にコントラスト確保
   ✓ カスタム色は必ずチェック
   ```

4. **ライト・ダークモード両対応**: カラートークンを使用
   ```
   ✓ 固定のHEXではなく、カラーロールを参照
   ```

### DON'T（避けるべき）

1. **固定のHEX値**: ハードコーディングされた色
   ```
   ✗ #6200EE を直接使用
   ✓ Primary を使用
   ```

2. **意味のない色**: 装飾のためだけの色
   ```
   ✗ 10種類の異なる色を無秩序に使用
   ✓ カラーロールに基づいた使用
   ```

3. **コントラスト不足**: 読みにくいテキスト
   ```
   ✗ 薄いグレーのテキストを白背景に
   ✓ On-Surface を使用
   ```

4. **ブランドカラーの過剰使用**: すべてをブランドカラーに
   ```
   ✗ 画面全体をブランドカラーで覆う
   ✓ アクセントとしてブランドカラーを使用
   ```

## カラーカスタマイゼーション

### カスタムカラーパレットの作成

1. **Material Theme Builderを使用**: https://m3.material.io/theme-builder
2. **ブランドカラーを入力**: Primary色を指定
3. **自動生成**: システムが harmonious なパレットを生成
4. **手動調整**: 必要に応じてトーンを微調整
5. **エクスポート**: Figma、CSS、Kotlin、Swiftなどに出力

### カスタマイズのポイント

- **Primary は慎重に選択**: ブランドの中心色
- **Secondary と Tertiary は自動生成を活用**: 調和の取れた色が自動生成される
- **Error は標準のまま**: ユーザーの学習済みパターンを尊重
- **アクセシビリティチェック**: カスタム色でもコントラスト確認

## 実装例（概念的）

### カラートークンの構造

```
// 概念的な構造（実装言語ではない）
Theme {
  light: {
    primary: Primary-40,
    onPrimary: Primary-100,
    primaryContainer: Primary-90,
    onPrimaryContainer: Primary-10,
    surface: Neutral-98,
    onSurface: Neutral-10,
    ...
  },
  dark: {
    primary: Primary-80,
    onPrimary: Primary-20,
    primaryContainer: Primary-30,
    onPrimaryContainer: Primary-90,
    surface: Neutral-6,
    onSurface: Neutral-90,
    ...
  }
}
```

### 使用方法（概念的）

```
// ボタンのスタイリング（概念）
Button {
  background: theme.primary,
  text: theme.onPrimary,
}

// カードのスタイリング（概念）
Card {
  background: theme.surfaceContainer,
  text: theme.onSurface,
}
```

## 参考リソース

- [Color Roles](https://m3.material.io/styles/color/roles)
- [Color System](https://m3.material.io/styles/color/system/how-the-system-works)
- [Material Theme Builder](https://m3.material.io/theme-builder)
- [Dynamic Color](https://m3.material.io/foundations/customization)

---

**出典**: Material Design 3 公式ドキュメント (https://m3.material.io/)
**最終取得日**: 2026-01-19
