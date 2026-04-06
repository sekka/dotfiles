# Color（色）

カラーシステムは、Apple プラットフォームのデザインにおいて重要な役割を果たします。

## 出典

- **公式URL**: https://developer.apple.com/design/human-interface-guidelines/color
- **日本語版**: https://developer.apple.com/jp/design/human-interface-guidelines/color
- **最終更新**: 2026-01-19

## 概要

色は、ブランドアイデンティティを伝え、視覚的な連続性を提供し、ステータスや状態を伝達し、ユーザーのアクションに対するフィードバックを提供し、ユーザーが視覚的なデータを視覚化するのを助けます。

## 主要な原則

### 1. システムカラーの使用

Apple は各プラットフォームで標準的なシステムカラーを提供しています：

- **Semantic colors**: 目的ベースの色（label、separator、background など）
- **Dynamic colors**: ライトモード・ダークモードで自動適応
- **Accessibility**: 十分なコントラスト比を保証

### 2. カラーマネジメント

#### Wide color（広色域）
- Display P3 カラースペースのサポート
- より鮮やかで自然な色表現
- sRGB との互換性維持

#### ダイナミックカラー
```swift
// システムカラーの使用例
Color.primary       // テキストやアイコン
Color.secondary     // 補助的なテキスト
Color.accentColor   // インタラクティブ要素
```

### 3. アクセシビリティ

#### コントラスト比
- **WCAG AA 基準**: テキストは最低 4.5:1
- **大きなテキスト**: 最低 3:1
- **グラフィック要素**: 最低 3:1

#### カラーブラインドへの配慮
- 色だけに依存しない情報伝達
- アイコンやパターンの併用
- テキストラベルの提供

### 4. ライト・ダークモードの対応

#### 自動適応カラー
```swift
// SwiftUI
Color(uiColor: .systemBackground)  // 背景色（自動切替）
Color(uiColor: .label)              // ラベル色（自動切替）

// アセットカタログでの定義
// Any Appearance: ライトモード用の色
// Dark Appearance: ダークモード用の色
```

#### カラーの定義ベストプラクティス
- セマンティックカラーを優先
- ハードコードされた色を避ける
- アセットカタログで一元管理

## プラットフォーム別の考慮事項

### iOS / iPadOS
- **Vibrant colors**: iOS は鮮やかな色を好む傾向
- **Translucency**: 透過効果との組み合わせ
- **Accessibility settings**: ユーザー設定に応じた調整

### macOS
- **System accents**: ユーザーが選択したアクセントカラーを尊重
- **Control tints**: システムコントロールの色調整
- **Window backgrounds**: ウィンドウ背景の階層的な色使い

### watchOS
- **High contrast**: 小さな画面での視認性重視
- **Always-On display**: 常時表示時の色の調整

### tvOS
- **Focus-driven**: フォーカスされた要素の色の強調
- **Distance viewing**: 遠くから見ることを考慮

### visionOS
- **Spatial context**: 3D 空間における色の見え方
- **Materials**: ガラスやメタルとの組み合わせ

## システムカラー一覧（主要）

### Label colors
| カラー | 用途 | UIKit | SwiftUI |
|--------|------|-------|---------|
| Primary | 主要なテキスト | `.label` | `.primary` |
| Secondary | 補助的なテキスト | `.secondaryLabel` | `.secondary` |
| Tertiary | 第三階層のテキスト | `.tertiaryLabel` | - |
| Quaternary | 第四階層のテキスト | `.quaternaryLabel` | - |

### Fill colors
| カラー | 用途 | UIKit | SwiftUI |
|--------|------|-------|---------|
| Primary fill | 主要な塗りつぶし | `.systemFill` | - |
| Secondary fill | 補助的な塗りつぶし | `.secondarySystemFill` | - |
| Tertiary fill | 第三階層の塗りつぶし | `.tertiarySystemFill` | - |
| Quaternary fill | 第四階層の塗りつぶし | `.quaternarySystemFill` | - |

### Background colors
| カラー | 用途 | UIKit | SwiftUI |
|--------|------|-------|---------|
| Primary background | 主要な背景 | `.systemBackground` | `.background` |
| Secondary background | グループ化された背景 | `.secondarySystemBackground` | - |
| Tertiary background | 第三階層の背景 | `.tertiarySystemBackground` | - |

### Semantic colors（意味論的な色）
| カラー | 用途 | UIKit | SwiftUI |
|--------|------|-------|---------|
| Red | エラー、削除 | `.systemRed` | `.red` |
| Orange | 警告 | `.systemOrange` | `.orange` |
| Yellow | 注意 | `.systemYellow` | `.yellow` |
| Green | 成功、完了 | `.systemGreen` | `.green` |
| Blue | リンク、情報 | `.systemBlue` | `.blue` |
| Indigo | - | `.systemIndigo` | `.indigo` |
| Purple | - | `.systemPurple` | `.purple` |
| Pink | - | `.systemPink` | `.pink` |
| Brown | - | `.systemBrown` | `.brown` |
| Gray | 無効、非アクティブ | `.systemGray` | `.gray` |

## ベストプラクティス

### ✅ 推奨

1. **システムカラーを優先的に使用する**
   - 自動的にライト・ダークモードに対応
   - アクセシビリティ設定を尊重
   - プラットフォームとの調和

2. **セマンティックな色の命名**
   ```swift
   // Good
   extension Color {
       static let errorText = Color.red
       static let successBackground = Color.green.opacity(0.1)
   }

   // Bad
   extension Color {
       static let color1 = Color.red
       static let color2 = Color.green
   }
   ```

3. **コントラストを確認する**
   - Xcode の Accessibility Inspector を使用
   - 実機で明るい環境・暗い環境で確認

4. **カスタムカラーはアセットカタログで管理**
   - ライト・ダーク両方のバリエーションを定義
   - 名前付きカラーとして一元管理

### ❌ 避けるべき

1. **ハードコードされたRGB値**
   ```swift
   // Bad
   Color(red: 0.5, green: 0.5, blue: 0.5)

   // Good
   Color(.systemGray)
   ```

2. **色だけに依存した情報伝達**
   - アイコンやテキストラベルを併用
   - パターンや形状での区別も追加

3. **極端な彩度や明度**
   - 目が疲れやすい
   - 長時間の使用に不向き

4. **プラットフォームの慣習を無視**
   - iOS/iPadOS: 鮮やかな色が好まれる
   - macOS: より落ち着いた色調

## カラーパレットの構築

### ブランドカラーの定義

1. **Primary color**: ブランドの主要色
2. **Secondary color**: 補助色
3. **Accent color**: 強調色（ボタン、リンクなど）
4. **Neutral colors**: グレースケール（背景、テキストなど）

### カラースケール

各色に対して複数のシェードを用意：

```
Primary-100 (最も薄い)
Primary-200
Primary-300 ← デフォルト
Primary-400
Primary-500 (最も濃い)
```

### アクセシブルなパレット

- すべての組み合わせでコントラスト比を確認
- AA/AAA 基準を満たす色の組み合わせ表を作成
- ツール: [Contrast Checker](https://webaim.org/resources/contrastchecker/)

## 色の心理学

| 色 | 一般的な印象 | 推奨用途 |
|----|------------|----------|
| 赤 | 緊急、エラー、情熱 | エラーメッセージ、削除アクション |
| オレンジ | 警告、注意 | 警告メッセージ、通知バッジ |
| 黄 | 注意、楽観 | 注意喚起、ハイライト |
| 緑 | 成功、安全、自然 | 成功メッセージ、完了状態 |
| 青 | 信頼、情報、リンク | 主要アクション、リンク、情報 |
| 紫 | 創造性、豪華 | プレミアム機能、特別な要素 |
| グレー | 中立、非アクティブ | 無効状態、補助情報 |

## コード例

### SwiftUI

```swift
// システムカラーの使用
struct ContentView: View {
    var body: some View {
        VStack {
            Text("Primary Label")
                .foregroundColor(.primary)

            Text("Secondary Label")
                .foregroundColor(.secondary)

            Button("Action") {
                // アクション
            }
            .tint(.accentColor)  // アクセントカラー
        }
        .background(Color(.systemBackground))
    }
}

// カスタムカラーの定義
extension Color {
    static let brandPrimary = Color("BrandPrimary")  // アセットカタログの名前
    static let brandSecondary = Color("BrandSecondary")
}

// ダークモード対応のカスタムカラー
struct ThemedView: View {
    @Environment(\.colorScheme) var colorScheme

    var adaptiveColor: Color {
        colorScheme == .dark ? .white : .black
    }

    var body: some View {
        Text("Adaptive Color")
            .foregroundColor(adaptiveColor)
    }
}
```

### UIKit

```swift
// システムカラーの使用
label.textColor = .label
view.backgroundColor = .systemBackground

// ダイナミックカラーの定義
let customColor = UIColor { traitCollection in
    switch traitCollection.userInterfaceStyle {
    case .dark:
        return UIColor(red: 0.8, green: 0.8, blue: 0.8, alpha: 1.0)
    default:
        return UIColor(red: 0.2, green: 0.2, blue: 0.2, alpha: 1.0)
    }
}

// アセットカタログからのカラー読み込み
let brandColor = UIColor(named: "BrandPrimary")
```

## 関連トピック

- [Accessibility](./accessibility.md) - アクセシブルなカラーコントラスト
- [Materials](./materials.md) - マテリアルとカラーの組み合わせ
- [Dark Mode](../patterns/dark-mode.md) - ダークモード対応

## 参考リソース

- [WWDC: What's New in Color](https://developer.apple.com/videos/)
- [Human Interface Guidelines - Color](https://developer.apple.com/design/human-interface-guidelines/color)
- [Apple Design Resources](https://developer.apple.com/design/resources/)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)

---

**注**: この内容は一般的なHIGのカラーガイドラインに基づいています。最新の詳細は[公式ドキュメント](https://developer.apple.com/design/human-interface-guidelines/color)を参照してください。
