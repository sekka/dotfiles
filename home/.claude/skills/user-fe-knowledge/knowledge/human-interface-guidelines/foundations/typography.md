# Typography（タイポグラフィ）

タイポグラフィは、読みやすく、アクセシブルで、視覚的に魅力的なインターフェースを作成するための基礎です。

## 出典

- **公式URL**: https://developer.apple.com/design/human-interface-guidelines/typography
- **日本語版**: https://developer.apple.com/jp/design/human-interface-guidelines/typography
- **最終更新**: 2026-01-19

## 概要

Apple プラットフォームは、システムフォント（San Francisco）を提供し、Dynamic Type をサポートすることで、すべてのユーザーに最適な読書体験を提供します。

## San Francisco フォントファミリー

### SF Pro
- **用途**: iOS、iPadOS、macOS、tvOS の標準フォント
- **特徴**: 読みやすく、幅広いウェイトとスタイル
- **バリエーション**:
  - SF Pro Text: 19pt 以下のテキスト用
  - SF Pro Display: 20pt 以上のテキスト用

### SF Compact
- **用途**: watchOS
- **特徴**: 小さな画面に最適化された圧縮フォント

### SF Mono
- **用途**: コード表示、ターミナル
- **特徴**: 等幅フォント、コードの可読性に優れる

### New York
- **用途**: セリフフォント、読み物コンテンツ
- **特徴**: 長文の読書に適したクラシックなスタイル

## Dynamic Type（ダイナミックタイプ）

### 概要

Dynamic Type は、ユーザーが設定したテキストサイズの好みを尊重し、アプリ全体でテキストサイズを調整する機能です。

### テキストスタイル（Text Styles）

| スタイル | 用途 | デフォルトサイズ（iOS） |
|---------|------|----------------------|
| Large Title | ナビゲーションバーのタイトル | 34pt |
| Title 1 | セクションのタイトル | 28pt |
| Title 2 | サブセクションのタイトル | 22pt |
| Title 3 | グループのタイトル | 20pt |
| Headline | 見出し、強調 | 17pt (Bold) |
| Body | 本文テキスト | 17pt |
| Callout | 補足情報 | 16pt |
| Subheadline | 補助的な見出し | 15pt |
| Footnote | 脚注、キャプション | 13pt |
| Caption 1 | キャプション | 12pt |
| Caption 2 | より小さなキャプション | 11pt |

### Dynamic Type の実装

#### SwiftUI

```swift
struct ContentView: View {
    var body: some View {
        VStack(alignment: .leading) {
            Text("Large Title")
                .font(.largeTitle)

            Text("Title")
                .font(.title)

            Text("Body text")
                .font(.body)

            Text("Caption")
                .font(.caption)
        }
    }
}

// カスタムフォントでDynamic Typeをサポート
Text("Custom scaled text")
    .font(.custom("CustomFont", size: 17, relativeTo: .body))
```

#### UIKit

```swift
// テキストスタイルの使用
label.font = UIFont.preferredFont(forTextStyle: .body)
label.adjustsFontForContentSizeCategory = true  // Dynamic Type対応

// カスタムフォントでDynamic Type対応
let customFont = UIFont(name: "CustomFont", size: 17)!
label.font = UIFontMetrics(forTextStyle: .body).scaledFont(for: customFont)
```

## タイポグラフィの階層

### 1. 視覚的階層の確立

テキストサイズ、ウェイト、カラーを使用して情報の重要度を表現：

```swift
VStack(alignment: .leading, spacing: 8) {
    // 最も重要（タイトル）
    Text("Main Title")
        .font(.title)
        .fontWeight(.bold)

    // 中程度の重要度（本文）
    Text("Body content goes here...")
        .font(.body)

    // 補助情報（キャプション）
    Text("Additional details")
        .font(.caption)
        .foregroundColor(.secondary)
}
```

### 2. フォントウェイト

| ウェイト | SwiftUI | UIKit | 用途 |
|---------|---------|-------|------|
| Ultra Light | `.ultraLight` | `.ultraLight` | 装飾的 |
| Thin | `.thin` | `.thin` | 装飾的 |
| Light | `.light` | `.light` | 軽い印象 |
| Regular | `.regular` | `.regular` | デフォルト |
| Medium | `.medium` | `.medium` | 中程度の強調 |
| Semibold | `.semibold` | `.semibold` | 強調 |
| Bold | `.bold` | `.bold` | 重要な情報 |
| Heavy | `.heavy` | `.heavy` | 非常に強い強調 |
| Black | `.black` | `.black` | 最大の強調 |

### 3. 行間と字間

#### 行間（Line Spacing）

```swift
Text("Multiple lines of text that need proper spacing for readability.")
    .lineSpacing(8)  // 行間を8pt追加
```

#### 字間（Letter Spacing / Tracking）

```swift
Text("UPPERCASE TEXT")
    .tracking(2)  // 字間を2pt追加
    .kerning(1)   // カーニング調整
```

## アクセシビリティ

### コントラストと可読性

1. **十分なコントラスト**
   - 本文テキスト: 最低 4.5:1
   - 大きなテキスト (18pt+): 最低 3:1

2. **背景との分離**
   ```swift
   Text("Readable text")
       .foregroundColor(.primary)  // 自動的に適切なコントラスト
   ```

### Large Text のサポート

```swift
// 大きなテキストサイズでのレイアウト対応
Text("This text scales with user settings")
    .font(.body)
    .lineLimit(nil)  // 行数制限なし
    .minimumScaleFactor(0.5)  // 最小50%まで縮小可能
```

### Bold Text 設定への対応

ユーザーが「太字テキスト」設定を有効にしている場合：

```swift
@Environment(\.legibilityWeight) var legibilityWeight

Text("Respects Bold Text setting")
    .fontWeight(legibilityWeight?.bold ?? .regular)
```

## プラットフォーム別の考慮事項

### iOS / iPadOS

- **Large Title**: スクロールに応じてサイズが変化
- **Inline Title**: コンパクトなナビゲーションバータイトル
- **Reading content**: 長文には New York フォントを検討

### macOS

- **System font**: SF Pro
- **Window titles**: 標準的なタイトルスタイル
- **Toolbar items**: 小さめのフォントサイズ

### watchOS

- **SF Compact**: 丸いディスプレイに最適化
- **Larger text**: 小さな画面での可読性重視
- **Minimal text**: 簡潔な表現を心がける

### tvOS

- **Distance viewing**: 遠くから見ることを考慮
- **Larger sizes**: 通常より大きめのフォントサイズ
- **Focus-driven**: フォーカス時のテキスト拡大

### visionOS

- **Spatial typography**: 3D 空間でのテキスト配置
- **Depth and scale**: 距離に応じたサイズ調整
- **Readability**: 没入環境での可読性

## ベストプラクティス

### ✅ 推奨

1. **システムテキストスタイルを使用**
   ```swift
   // Good
   Text("Content")
       .font(.body)

   // Bad
   Text("Content")
       .font(.system(size: 17))
   ```

2. **適切な階層を確立**
   - タイトル → 見出し → 本文 → キャプション
   - サイズとウェイトで視覚的な差をつける

3. **十分な行間を確保**
   - 密集したテキストは読みにくい
   - 長文には広めの行間

4. **中央揃えは控えめに**
   - 左揃えが基本（LTR言語）
   - 中央揃えは短いテキストやタイトルのみ

5. **カスタムフォントでもDynamic Type対応**
   ```swift
   .font(.custom("CustomFont", size: 17, relativeTo: .body))
   ```

### ❌ 避けるべき

1. **ハードコードされたフォントサイズ**
   ```swift
   // Bad
   .font(.system(size: 14))

   // Good
   .font(.subheadline)
   ```

2. **極端に小さなテキスト**
   - 最小でも 11pt 以上
   - アクセシビリティを考慮

3. **長い行長**
   - 1行あたり 50-75 文字が理想
   - 長すぎると読みにくい

4. **不要なスタイル混在**
   - フォントファミリー、ウェイト、スタイルを統一
   - 一貫性を保つ

## テキストの調整

### テキストの切り詰め

```swift
// 末尾を省略
Text("Long text that needs to be truncated")
    .lineLimit(1)
    .truncationMode(.tail)  // "Long text that needs to be..."

// 中央を省略
Text("Long text that needs to be truncated")
    .lineLimit(1)
    .truncationMode(.middle)  // "Long text...truncated"

// 先頭を省略
Text("Long text that needs to be truncated")
    .lineLimit(1)
    .truncationMode(.head)  // "...needs to be truncated"
```

### マルチラインテキスト

```swift
Text("Multi-line text content that wraps to multiple lines")
    .lineLimit(3)  // 最大3行
    .multilineTextAlignment(.leading)  // 左揃え
```

### テキストの結合

```swift
// Text連結
Text("Bold ")
    .bold() +
Text("Regular ") +
Text("Italic")
    .italic()

// Markdown（iOS 15+）
Text("**Bold** *Italic* `Code`")
```

## 多言語対応

### 文字方向（RTL対応）

```swift
Text("Respects language direction")
    .multilineTextAlignment(.leading)  // 自動的にRTL対応
```

### ローカライズされたテキスト

```swift
Text("Hello, World!")  // 自動的にローカライズ
```

### CJK（中国語・日本語・韓国語）対応

- 適切な行の高さ
- 縦書き対応（必要に応じて）
- フォントのフォールバック

## コード例集

### 標準的なテキスト階層

```swift
struct TypographyHierarchyExample: View {
    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Large Title")
                .font(.largeTitle)
                .fontWeight(.bold)

            Text("Title 1")
                .font(.title)

            Text("Title 2")
                .font(.title2)

            Text("Headline")
                .font(.headline)

            Text("Body text provides the main content. It should be easy to read and appropriately sized.")
                .font(.body)

            Text("Callout for important information")
                .font(.callout)

            Text("Footnote for additional details")
                .font(.footnote)
                .foregroundColor(.secondary)

            Text("Caption")
                .font(.caption)
                .foregroundColor(.secondary)
        }
        .padding()
    }
}
```

### Dynamic Type 対応のカスタムフォント

```swift
struct CustomTypographyView: View {
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            // システムフォント + カスタムサイズ
            Text("Scaled System Font")
                .font(.system(size: 20, weight: .semibold, design: .rounded))
                .dynamicTypeSize(...DynamicTypeSize.xxxLarge)  // 最大サイズ制限

            // カスタムフォント + Dynamic Type
            Text("Scaled Custom Font")
                .font(.custom("Georgia", size: 18, relativeTo: .body))

            // Fixed size（Dynamic Type無効）
            Text("Fixed Size Text")
                .font(.system(size: 14))
                .dynamicTypeSize(.large)  // 固定サイズ
        }
    }
}
```

### 複雑なテキストスタイリング

```swift
struct RichTextView: View {
    var body: some View {
        (
            Text("Important: ").bold().foregroundColor(.red) +
            Text("This is a ") +
            Text("combined").italic() +
            Text(" text with ") +
            Text("multiple").underline() +
            Text(" styles.")
        )
        .font(.body)
    }
}
```

## 関連トピック

- [Accessibility](./accessibility.md) - アクセシブルなタイポグラフィ
- [Layout](./layout.md) - テキストレイアウト
- [Color](./color.md) - テキストカラー
- [SF Symbols](./sf-symbols.md) - アイコンとテキストの組み合わせ

## 参考リソース

- [San Francisco Font Family](https://developer.apple.com/fonts/)
- [Human Interface Guidelines - Typography](https://developer.apple.com/design/human-interface-guidelines/typography)
- [WWDC: Designing for Accessibility](https://developer.apple.com/videos/)
- [Apple Design Resources](https://developer.apple.com/design/resources/)

---

**注**: この内容は一般的なHIGのタイポグラフィガイドラインに基づいています。最新の詳細は[公式ドキュメント](https://developer.apple.com/design/human-interface-guidelines/typography)を参照してください。
