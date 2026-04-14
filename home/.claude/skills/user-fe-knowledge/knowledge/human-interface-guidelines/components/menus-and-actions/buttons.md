# Buttons（ボタン）

ボタンは、ユーザーがアクションを実行するための主要なインタラクティブ要素です。

## 出典

- **公式URL**: https://developer.apple.com/design/human-interface-guidelines/buttons
- **日本語版**: https://developer.apple.com/jp/design/human-interface-guidelines/buttons
- **最終更新**: 2026-01-19

## 概要

ボタンは、タップやクリックに応じてアプリ固有のアクションを実行します。システムは複数のボタンスタイルを提供し、それぞれが異なる視覚的な重みと意味を持ちます。

## ボタンのタイプ

### 1. Filled Button（塗りつぶしボタン）

最も目立つスタイル。主要なアクションに使用。

```swift
// SwiftUI
Button("保存") {
    save()
}
.buttonStyle(.borderedProminent)
.tint(.blue)
```

**使用場面**:
- 主要なアクション（保存、送信、完了）
- フローの次のステップ
- 最も重要な選択肢

### 2. Gray Button（グレーボタン）

中程度の強調。セカンダリアクションに使用。

```swift
Button("キャンセル") {
    cancel()
}
.buttonStyle(.bordered)
```

**使用場面**:
- セカンダリアクション
- キャンセルや戻る
- 追加オプション

### 3. Tinted Button（色付きボタン）

色を使って特定のアクションを強調。

```swift
Button("削除") {
    delete()
}
.buttonStyle(.bordered)
.tint(.red)
```

**使用場面**:
- 破壊的なアクション（削除、リセット）
- 特定の状態やカテゴリ
- ブランドカラーの適用

### 4. Plain Button（プレーンボタン）

最小限のスタイル。テキストのみ。

```swift
Button("詳細を表示") {
    showDetail()
}
.buttonStyle(.plain)
```

**使用場面**:
- インライン操作
- リストやテーブル内
- 補助的なアクション

## iOS ボタンスタイル

### Button Styles

```swift
// Bordered Prominent（塗りつぶし）
Button("Primary") { }
    .buttonStyle(.borderedProminent)

// Bordered（枠線）
Button("Secondary") { }
    .buttonStyle(.bordered)

// Borderless（枠なし）
Button("Tertiary") { }
    .buttonStyle(.borderless)

// Plain（プレーン）
Button("Link") { }
    .buttonStyle(.plain)
```

### Button Sizes

```swift
Button("Large") { }
    .controlSize(.large)

Button("Regular") { }
    .controlSize(.regular)

Button("Small") { }
    .controlSize(.small)

Button("Mini") { }
    .controlSize(.mini)
```

### Button Roles

```swift
// 破壊的アクション
Button("削除", role: .destructive) {
    delete()
}

// キャンセル
Button("キャンセル", role: .cancel) {
    cancel()
}
```

## macOS ボタンスタイル

### Push Button

```swift
// デフォルトのプッシュボタン
Button("OK") { }
    .buttonStyle(.borderedProminent)
    .keyboardShortcut(.defaultAction)  // Return キーでアクティブ化
```

### Help Button

```swift
Button {
    showHelp()
} label: {
    Label("ヘルプ", systemImage: "questionmark.circle")
}
```

## UIKit でのボタン実装

### UIButton Configuration（iOS 15+）

```swift
var configuration = UIButton.Configuration.filled()
configuration.title = "保存"
configuration.image = UIImage(systemName: "checkmark")
configuration.imagePlacement = .leading
configuration.imagePadding = 8
configuration.cornerStyle = .medium
configuration.baseBackgroundColor = .systemBlue
configuration.baseForegroundColor = .white

let button = UIButton(configuration: configuration)
button.addTarget(self, action: #selector(saveAction), for: .touchUpInside)
```

### スタイルバリエーション

```swift
// Filled
var filled = UIButton.Configuration.filled()

// Tinted
var tinted = UIButton.Configuration.tinted()

// Gray
var gray = UIButton.Configuration.gray()

// Plain
var plain = UIButton.Configuration.plain()

// Borderless
var borderless = UIButton.Configuration.borderless()
```

## ベストプラクティス

### ✅ 推奨

1. **明確なラベル**
   ```swift
   // Good
   Button("写真を保存") { }

   // Bad
   Button("OK") { }
   ```

2. **適切なサイズ**
   - 最小44×44ptのタップ領域
   - 十分なパディング

3. **視覚的階層**
   ```swift
   VStack {
       // Primary: 塗りつぶし
       Button("送信") { }
           .buttonStyle(.borderedProminent)

       // Secondary: 枠線
       Button("下書き保存") { }
           .buttonStyle(.bordered)

       // Tertiary: プレーン
       Button("キャンセル") { }
           .buttonStyle(.plain)
   }
   ```

4. **一貫した配置**
   - 確認アクションは右側
   - キャンセルは左側

### ❌ 避けるべき

1. **曖昧なラベル**
   ```swift
   // Bad
   Button("はい") { }  // 何に「はい」？

   // Good
   Button("削除する") { }
   ```

2. **複数の Primary ボタン**
   - 1画面に1つの主要アクション
   - それ以外はセカンダリ

3. **小さすぎるボタン**
   ```swift
   // Bad
   Button("Tap") { }
       .frame(width: 30, height: 30)  // 小さすぎる

   // Good
   Button("Tap") { }
       .frame(minWidth: 44, minHeight: 44)
   ```

## ボタンの状態

### 有効/無効

```swift
@State private var isValid = false

Button("送信") {
    submit()
}
.disabled(!isValid)
```

### ローディング状態

```swift
@State private var isLoading = false

Button {
    Task {
        isLoading = true
        await performTask()
        isLoading = false
    }
} label: {
    if isLoading {
        ProgressView()
    } else {
        Text("送信")
    }
}
.disabled(isLoading)
```

### プログレス付きボタン

```swift
Button {
    // アクション
} label: {
    Label("ダウンロード", systemImage: "arrow.down.circle")
}
.overlay(alignment: .bottom) {
    if isDownloading {
        ProgressView(value: progress)
            .progressViewStyle(.linear)
    }
}
```

## アクセシビリティ

### ラベルとヒント

```swift
Button {
    delete()
} label: {
    Image(systemName: "trash")
}
.accessibilityLabel("削除")
.accessibilityHint("このアイテムを削除します")
```

### Dynamic Type 対応

```swift
Button("Long Button Text") { }
    .font(.body)  // Dynamic Type対応
    .lineLimit(nil)  // 複数行許可
```

### 最小タップ領域

```swift
Button {
    // アクション
} label: {
    Image(systemName: "heart")
}
.frame(minWidth: 44, minHeight: 44)
```

## コード例集

### 標準的なボタングループ

```swift
struct ButtonGroup: View {
    var body: some View {
        HStack(spacing: 12) {
            Button("キャンセル", role: .cancel) {
                cancel()
            }
            .buttonStyle(.bordered)

            Button("保存") {
                save()
            }
            .buttonStyle(.borderedProminent)
        }
    }
}
```

### アイコン付きボタン

```swift
struct IconButton: View {
    var body: some View {
        Button {
            share()
        } label: {
            Label("共有", systemImage: "square.and.arrow.up")
        }
        .buttonStyle(.borderedProminent)
    }
}
```

### カスタムボタンスタイル

```swift
struct CapsuleButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .padding(.horizontal, 20)
            .padding(.vertical, 12)
            .background(
                Capsule()
                    .fill(configuration.isPressed ? Color.blue.opacity(0.7) : Color.blue)
            )
            .foregroundColor(.white)
            .scaleEffect(configuration.isPressed ? 0.95 : 1.0)
    }
}

// 使用
Button("Custom") { }
    .buttonStyle(CapsuleButtonStyle())
```

### メニュー付きボタン

```swift
Menu {
    Button("オプション1") { }
    Button("オプション2") { }
    Button("オプション3") { }
} label: {
    Label("アクション", systemImage: "ellipsis.circle")
}
.buttonStyle(.borderedProminent)
```

### 確認ダイアログ付きボタン

```swift
struct DeleteButton: View {
    @State private var showingConfirmation = false

    var body: some View {
        Button("削除", role: .destructive) {
            showingConfirmation = true
        }
        .confirmationDialog(
            "本当に削除しますか？",
            isPresented: $showingConfirmation
        ) {
            Button("削除", role: .destructive) {
                delete()
            }
            Button("キャンセル", role: .cancel) { }
        }
    }
}
```

## プラットフォーム別の考慮事項

### iOS / iPadOS

- **Prominent style**: iOS 15+ で利用可能
- **Tint color**: アクセントカラーでカスタマイズ
- **Context menus**: 長押しでメニュー表示

### macOS

- **Default button**: Return キーでアクティブ化
- **Keyboard shortcuts**: ショートカットキーの設定
- **Help button**: "?" アイコンのヘルプボタン

### watchOS

- **Full-width buttons**: 画面幅いっぱいに表示
- **Minimal text**: 簡潔なラベル
- **Digital Crown**: スクロールによる選択

### tvOS

- **Focus-driven**: フォーカス状態の強調
- **Large tap targets**: リモート操作に適したサイズ
- **Simple labels**: 遠くから見ても読みやすい

## 関連トピック

- [Menus](./menus.md) - メニューとボタンの組み合わせ
- [Toolbars](./toolbars.md) - ツールバーのボタン
- [Layout](../../foundations/layout.md) - ボタンの配置
- [Accessibility](../../foundations/accessibility.md) - アクセシブルなボタン

## 参考リソース

- [Human Interface Guidelines - Buttons](https://developer.apple.com/design/human-interface-guidelines/buttons)
- [UIButton Documentation](https://developer.apple.com/documentation/uikit/uibutton)
- [SwiftUI Button Documentation](https://developer.apple.com/documentation/swiftui/button)

---

**注**: この内容は一般的なHIGのボタンガイドラインに基づいています。最新の詳細は[公式ドキュメント](https://developer.apple.com/design/human-interface-guidelines/buttons)を参照してください。
