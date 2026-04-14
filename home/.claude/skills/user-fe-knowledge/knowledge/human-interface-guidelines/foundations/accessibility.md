# Accessibility（アクセシビリティ）

アクセシビリティは、すべてのユーザーがアプリを使用できるようにするための重要な要素です。

## 出典

- **公式URL**: https://developer.apple.com/design/human-interface-guidelines/accessibility
- **日本語版**: https://developer.apple.com/jp/design/human-interface-guidelines/accessibility
- **最終更新**: 2026-01-19

## 概要

アクセシビリティは、障がいのある人々を含むすべてのユーザーがアプリを快適に使用できるようにする設計アプローチです。Apple プラットフォームは豊富なアクセシビリティ機能を提供しており、これらを適切に実装することが重要です。

## 主要な原則

### 1. すべての人のためのデザイン

- **視覚障がい**: VoiceOver、拡大鏡、カラーフィルター
- **聴覚障がい**: 字幕、ビジュアルアラート
- **運動障がい**: スイッチコントロール、音声制御
- **認知障がい**: シンプルなUI、一貫性

### 2. Apple のアクセシビリティ機能

| 機能 | 対象 | 説明 |
|------|------|------|
| VoiceOver | 視覚障がい | スクリーンリーダー |
| Voice Control | 運動障がい | 音声による操作 |
| Switch Control | 運動障がい | 外部スイッチデバイス対応 |
| Dynamic Type | 視覚障がい | テキストサイズの調整 |
| Bold Text | 視覚障がい | テキストを太字に |
| Increase Contrast | 視覚障がい | コントラストを強化 |
| Reduce Motion | 前庭障がい | アニメーションを削減 |
| Reduce Transparency | 視覚障がい | 透明効果を削減 |
| Closed Captions | 聴覚障がい | ビデオの字幕表示 |
| Mono Audio | 聴覚障がい | ステレオをモノラルに |
| AssistiveTouch | 運動障がい | ジェスチャーの代替手段 |

## VoiceOver 対応

### アクセシビリティラベル

```swift
// SwiftUI
Image(systemName: "star.fill")
    .accessibilityLabel("お気に入り")

Button(action: { }) {
    Image(systemName: "trash")
}
.accessibilityLabel("削除")

// UIKit
button.accessibilityLabel = "削除"
imageView.accessibilityLabel = "プロフィール写真"
```

### アクセシビリティヒント

```swift
Button("送信") { }
    .accessibilityHint("フォームを送信します")

// UIKit
button.accessibilityHint = "ダブルタップして送信します"
```

### アクセシビリティ特性（Traits）

```swift
Text("エラー: 入力が無効です")
    .accessibilityAddTraits(.isStaticText)
    .accessibilityRemoveTraits(.isButton)

// UIKit
label.accessibilityTraits = .staticText
button.accessibilityTraits = [.button, .startsMediaSession]
```

### グループ化

```swift
// 複数の要素を1つとして扱う
VStack {
    Text("タイトル")
    Text("サブタイトル")
    Text("説明")
}
.accessibilityElement(children: .combine)
.accessibilityLabel("タイトル、サブタイトル、説明")
```

### 非表示要素

```swift
// VoiceOverから隠す
DecorativeImage()
    .accessibilityHidden(true)

// UIKit
decorativeView.isAccessibilityElement = false
```

### カスタムアクション

```swift
VStack {
    Text("メッセージ")
}
.accessibilityAction(named: "削除") {
    deleteMessage()
}
.accessibilityAction(named: "返信") {
    replyToMessage()
}
```

## Dynamic Type 対応

### テキストサイズの対応

```swift
// SwiftUI
Text("サイズ調整可能なテキスト")
    .font(.body)  // Dynamic Type対応
    .lineLimit(nil)  // 複数行に対応

// UIKit
label.font = UIFont.preferredFont(forTextStyle: .body)
label.adjustsFontForContentSizeCategory = true
label.numberOfLines = 0  // 複数行対応
```

### カスタムフォントでのDynamic Type

```swift
Text("カスタムフォント")
    .font(.custom("CustomFont", size: 17, relativeTo: .body))

// UIKit
let customFont = UIFont(name: "CustomFont", size: 17)!
let scaledFont = UIFontMetrics(forTextStyle: .body).scaledFont(for: customFont)
label.font = scaledFont
```

### サイズ制限

```swift
Text("サイズ制限あり")
    .font(.body)
    .dynamicTypeSize(...DynamicTypeSize.xxxLarge)  // 最大サイズ制限
```

## カラーとコントラスト

### 十分なコントラスト

#### WCAG基準

| コンテンツ | AA基準 | AAA基準 |
|-----------|--------|---------|
| 通常のテキスト | 4.5:1 | 7:1 |
| 大きなテキスト（18pt+） | 3:1 | 4.5:1 |
| UI要素 | 3:1 | - |

```swift
// システムカラーは自動的に適切なコントラストを提供
Text("読みやすいテキスト")
    .foregroundColor(.primary)  // 背景に応じて自動調整

// カスタムカラーのコントラスト確認
// Xcode の Accessibility Inspector を使用
```

### 色だけに依存しない

```swift
// Bad: 色だけで状態を表現
Circle()
    .fill(isError ? Color.red : Color.green)

// Good: 色 + アイコン/テキスト
HStack {
    Image(systemName: isError ? "xmark.circle" : "checkmark.circle")
    Text(isError ? "エラー" : "成功")
}
.foregroundColor(isError ? .red : .green)
```

### Increase Contrast 設定への対応

```swift
@Environment(\.colorSchemeContrast) var contrast

var textColor: Color {
    contrast == .increased ? .primary : .secondary
}
```

## モーションとアニメーション

### Reduce Motion 設定への対応

```swift
@Environment(\.accessibilityReduceMotion) var reduceMotion

var body: some View {
    Text("Content")
        .scaleEffect(isPresented ? 1 : 0.5)
        .opacity(isPresented ? 1 : 0)
        .animation(
            reduceMotion ? nil : .spring(),
            value: isPresented
        )
}

// または
if reduceMotion {
    // モーションなしのUI
    SimpleView()
} else {
    // アニメーション付きUI
    AnimatedView()
}
```

### 必須モーションの判断

アニメーションが情報伝達に不可欠かどうかを判断：

- **装飾的**: 削除可能
- **機能的**: 代替手段を提供

## 音声とフィードバック

### 音声フィードバック

```swift
// ハプティクスフィードバック
import CoreHaptics

let generator = UINotificationFeedbackGenerator()
generator.notificationOccurred(.success)

// 音声通知
import AVFoundation

AudioServicesPlaySystemSound(SystemSoundID(1016))  // ビープ音
```

### 字幕とトランスクリプト

- ビデオには字幕を提供
- オーディオコンテンツにはトランスクリプト
- 自動生成 + 手動確認

## インタラクション

### タッチターゲットサイズ

```swift
// 最小44×44ptのタップ領域
Button("Tap") { }
    .frame(minWidth: 44, minHeight: 44)

// UIKit
button.frame = CGRect(x: 0, y: 0, width: 44, height: 44)
```

### ジェスチャーの代替手段

```swift
// スワイプジェスチャーの代替としてボタンを提供
HStack {
    Button("削除") { }
    Button("編集") { }
}

// UIKit: Accessibility Custom Actions
let deleteAction = UIAccessibilityCustomAction(
    name: "削除",
    target: self,
    selector: #selector(deleteItem)
)
cell.accessibilityCustomActions = [deleteAction]
```

## フォーカス管理

### アクセシビリティフォーカス

```swift
// SwiftUI
@AccessibilityFocusState private var isFocused: Bool

TextField("名前", text: $name)
    .accessibilityFocused($isFocused)

Button("フォーカス") {
    isFocused = true
}
```

### フォーカス順序

```swift
// タブオーダーの制御
TextField("First", text: $first)
    .accessibilitySortPriority(3)

TextField("Second", text: $second)
    .accessibilitySortPriority(2)

TextField("Third", text: $third)
    .accessibilitySortPriority(1)
```

## プラットフォーム別の考慮事項

### iOS / iPadOS

- **VoiceOver gestures**: 標準ジェスチャーをサポート
- **Reachability**: 片手操作への配慮
- **Keyboard navigation**: 外部キーボード対応

### macOS

- **Keyboard navigation**: Tab キーでのナビゲーション
- **VoiceOver**: macOS 固有のジェスチャー
- **Accessibility Keyboard**: オンスクリーンキーボード

### watchOS

- **VoiceOver**: Digital Crown でのナビゲーション
- **Taptic Engine**: ハプティクスフィードバック
- **Large text**: 小さな画面での可読性

### tvOS

- **Focus engine**: フォーカス駆動のナビゲーション
- **VoiceOver**: リモート操作対応
- **Accessibility shortcuts**: Siri Remote のショートカット

### visionOS

- **Eye tracking**: 視線追跡による操作
- **Voice commands**: 音声コマンド
- **Spatial audio**: 立体音響

## ベストプラクティス

### ✅ 推奨

1. **意味のあるラベル**
   ```swift
   // Good
   Image(systemName: "heart.fill")
       .accessibilityLabel("お気に入りに追加")

   // Bad
   Image(systemName: "heart.fill")
       .accessibilityLabel("ハート")
   ```

2. **論理的な読み上げ順序**
   - 視覚的な順序と一致させる
   - 重要な情報を最初に

3. **状態の明示**
   ```swift
   Toggle("通知", isOn: $notifications)
       .accessibilityValue(notifications ? "オン" : "オフ")
   ```

4. **コンテキストの提供**
   ```swift
   Button("削除") { }
       .accessibilityLabel("メッセージを削除")
       .accessibilityHint("この操作は取り消せません")
   ```

### ❌ 避けるべき

1. **曖昧なラベル**
   ```swift
   // Bad
   .accessibilityLabel("ボタン")

   // Good
   .accessibilityLabel("送信ボタン")
   ```

2. **装飾的要素のラベル**
   ```swift
   // 装飾的な画像はVoiceOverから隠す
   DecorativeImage()
       .accessibilityHidden(true)
   ```

3. **色だけに依存**
   - アイコンやテキストも併用

4. **小さすぎるターゲット**
   - 最小44×44pt

## テストとツール

### Xcode Accessibility Inspector

1. Xcode > Open Developer Tool > Accessibility Inspector
2. 実行中のアプリを検査
3. Issue検出と修正提案

### VoiceOver でのテスト

1. 設定 > アクセシビリティ > VoiceOver
2. 実際にVoiceOverをオンにしてテスト
3. すべての要素が適切に読み上げられるか確認

### Accessibility Audit

```swift
// SwiftUI Preview でアクセシビリティを確認
struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView()
            .environment(\.sizeCategory, .accessibilityExtraExtraExtraLarge)
            .previewDisplayName("XXXL Text")
    }
}
```

## コード例集

### アクセシブルなフォーム

```swift
struct AccessibleForm: View {
    @State private var name = ""
    @State private var email = ""
    @State private var agreedToTerms = false

    var body: some View {
        Form {
            Section {
                TextField("名前", text: $name)
                    .accessibilityLabel("名前入力欄")
                    .accessibilityHint("あなたの氏名を入力してください")

                TextField("メールアドレス", text: $email)
                    .keyboardType(.emailAddress)
                    .textContentType(.emailAddress)
                    .accessibilityLabel("メールアドレス入力欄")
            } header: {
                Text("個人情報")
            }

            Section {
                Toggle("利用規約に同意する", isOn: $agreedToTerms)
                    .accessibilityHint("利用規約を確認の上、同意してください")
            }

            Section {
                Button("送信") {
                    submit()
                }
                .disabled(!agreedToTerms || name.isEmpty || email.isEmpty)
                .accessibilityLabel("フォームを送信")
                .accessibilityHint(
                    agreedToTerms && !name.isEmpty && !email.isEmpty
                        ? "タップして送信します"
                        : "すべての必須項目を入力してください"
                )
            }
        }
    }

    func submit() {
        // 送信処理
    }
}
```

### アクセシブルなカスタムコントロール

```swift
struct AccessibleRatingControl: View {
    @Binding var rating: Int
    @AccessibilityFocusState private var isFocused: Bool

    var body: some View {
        HStack {
            ForEach(1...5, id: \.self) { index in
                Button {
                    rating = index
                } label: {
                    Image(systemName: index <= rating ? "star.fill" : "star")
                        .foregroundColor(.yellow)
                }
                .accessibilityHidden(true)  // 個別の星は隠す
            }
        }
        .accessibilityElement()  // グループ化
        .accessibilityLabel("評価")
        .accessibilityValue("\(rating)つ星")
        .accessibilityAdjustableAction { direction in
            switch direction {
            case .increment:
                if rating < 5 { rating += 1 }
            case .decrement:
                if rating > 1 { rating -= 1 }
            @unknown default:
                break
            }
        }
        .accessibilityFocused($isFocused)
    }
}
```

### Reduce Motion 対応アニメーション

```swift
struct ReduceMotionExample: View {
    @State private var isExpanded = false
    @Environment(\.accessibilityReduceMotion) var reduceMotion

    var body: some View {
        VStack {
            Button("展開") {
                if reduceMotion {
                    isExpanded.toggle()
                } else {
                    withAnimation(.spring()) {
                        isExpanded.toggle()
                    }
                }
            }

            if isExpanded {
                DetailView()
                    .transition(
                        reduceMotion
                            ? .identity  // アニメーションなし
                            : .scale.combined(with: .opacity)
                    )
            }
        }
    }
}
```

## 関連トピック

- [Color](./color.md) - アクセシブルなカラーコントラスト
- [Typography](./typography.md) - Dynamic Type とテキストアクセシビリティ
- [Layout](./layout.md) - アクセシブルなレイアウト
- [Inclusion](./inclusion.md) - 包括的なデザイン

## 参考リソース

- [Human Interface Guidelines - Accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility)
- [WWDC: Design for Accessibility](https://developer.apple.com/videos/)
- [Accessibility Programming Guide](https://developer.apple.com/library/archive/documentation/UserExperience/Conceptual/iPhoneAccessibility/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

---

**注**: この内容は一般的なHIGのアクセシビリティガイドラインに基づいています。最新の詳細は[公式ドキュメント](https://developer.apple.com/design/human-interface-guidelines/accessibility)を参照してください。
