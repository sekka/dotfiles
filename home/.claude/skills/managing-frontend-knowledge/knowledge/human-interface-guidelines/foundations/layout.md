# Layout（レイアウト）

適切なレイアウトは、コンテンツを整理し、ユーザーがアプリを簡単に操作できるようにします。

## 出典

- **公式URL**: https://developer.apple.com/design/human-interface-guidelines/layout
- **日本語版**: https://developer.apple.com/jp/design/human-interface-guidelines/layout
- **最終更新**: 2026-01-19

## 概要

レイアウトは、視覚的な階層を確立し、ナビゲーションを容易にし、すべてのデバイスサイズとオリエンテーションで一貫した体験を提供します。

## 主要な原則

### 1. 適応性（Adaptivity）

すべてのデバイスサイズ、画面向き、コンテキストに対応：

- **画面サイズ**: iPhone SE から iPad Pro、macOS まで
- **オリエンテーション**: 縦向き（Portrait）、横向き（Landscape）
- **Split View / Slide Over**: iPadOS のマルチタスキング
- **Dynamic Type**: テキストサイズの変更に対応

### 2. 安全領域（Safe Area）

画面の重要なコンテンツが表示される領域：

```swift
// SwiftUI
struct ContentView: View {
    var body: some View {
        VStack {
            Text("Content")
        }
        .ignoresSafeArea()  // 安全領域を無視（背景など）
    }
}
```

#### 主要な安全領域

- **Top**: ステータスバー、ノッチ、Dynamic Island
- **Bottom**: ホームインジケーター
- **Sides**: 丸い角、センサーハウジング
- **Keyboard**: ソフトウェアキーボード表示時

### 3. グリッドとスペーシング

#### 8pt グリッドシステム

Apple は一般的に 8pt の倍数を使用：

- **Padding**: 8pt, 16pt, 24pt, 32pt
- **Spacing**: 4pt, 8pt, 12pt, 16pt
- **Component sizes**: 44pt (最小タップ領域), 88pt, 176pt

```swift
VStack(spacing: 16) {  // 16pt間隔
    Text("Item 1")
        .padding(16)  // 16pt padding

    Text("Item 2")
        .padding(16)
}
```

#### レイアウトマージン

```swift
// 標準的なコンテンツマージン
.padding(.horizontal, 16)  // iOS: 左右16pt
.padding(.horizontal, 20)  // iPad: 左右20pt
```

## レイアウトシステム

### SwiftUI のレイアウト

#### Stack Views

```swift
// Vertical Stack（縦並び）
VStack(alignment: .leading, spacing: 12) {
    Text("Title")
    Text("Subtitle")
    Text("Description")
}

// Horizontal Stack（横並び）
HStack(alignment: .center, spacing: 8) {
    Image(systemName: "star.fill")
    Text("Favorite")
}

// Depth Stack（奥行き）
ZStack(alignment: .topLeading) {
    Rectangle().fill(Color.blue)
    Text("Overlay")
}
```

#### LazyStack（遅延読み込み）

```swift
ScrollView {
    LazyVStack {
        ForEach(items) { item in
            ItemRow(item: item)
        }
    }
}
```

#### Grid

```swift
// iOS 16+ のGrid
Grid {
    GridRow {
        Text("Row 1, Col 1")
        Text("Row 1, Col 2")
    }
    GridRow {
        Text("Row 2, Col 1")
        Text("Row 2, Col 2")
    }
}

// LazyVGrid/LazyHGrid
LazyVGrid(columns: [
    GridItem(.adaptive(minimum: 100))
]) {
    ForEach(items) { item in
        ItemCard(item: item)
    }
}
```

### UIKit のレイアウト

#### Auto Layout

```swift
// Constraints
view.translatesAutoresizingMaskIntoConstraints = false
NSLayoutConstraint.activate([
    view.topAnchor.constraint(equalTo: superview.topAnchor, constant: 16),
    view.leadingAnchor.constraint(equalTo: superview.leadingAnchor, constant: 16),
    view.trailingAnchor.constraint(equalTo: superview.trailingAnchor, constant: -16)
])
```

#### Stack Views

```swift
let stackView = UIStackView(arrangedSubviews: [label1, label2, label3])
stackView.axis = .vertical
stackView.spacing = 8
stackView.alignment = .leading
stackView.distribution = .fill
```

## プラットフォーム別のレイアウト

### iOS

#### Screen sizes

| デバイス | ポイント | スケール |
|---------|---------|---------|
| iPhone SE | 320×568 | @2x |
| iPhone 14 | 390×844 | @3x |
| iPhone 14 Pro | 393×852 | @3x |
| iPhone 14 Pro Max | 430×932 | @3x |

#### レイアウトガイド

- **Minimum tap target**: 44×44 pt
- **Margins**: 16pt (sides), 8-16pt (vertical)
- **Navigation bar**: 44pt height (standard), 96pt (large title)

### iPadOS

#### Size classes

- **Regular width, Regular height**: iPad 全画面
- **Compact width, Regular height**: iPad Split View（1/3）
- **Regular width, Compact height**: iPad 横向き

#### レイアウトガイド

- **Margins**: 20pt (sides)
- **Multitasking**: Split View, Slide Over に対応
- **Pointer interactions**: マウス/トラックパッド対応

### macOS

#### Window sizes

- **Minimum window size**: 定義必須
- **Resizable**: 可変サイズ対応
- **Toolbar**: 標準 52pt height

#### レイアウトガイド

- **Window margins**: 20pt
- **Controls**: macOS 固有のコントロールサイズ
- **Menu bar**: アプリケーションメニュー

### watchOS

#### Screen sizes

| デバイス | ポイント |
|---------|---------|
| 40mm | 162×197 |
| 41mm | 176×215 |
| 44mm | 184×224 |
| 45mm | 198×242 |

#### レイアウトガイド

- **Full-width content**: 画面いっぱいに表示
- **Minimal padding**: スペース効率重視
- **Scrolling**: Digital Crown でスクロール

### tvOS

#### Focus engine

- **Focused state**: フォーカスされた要素の拡大
- **Safe zones**: テレビのオーバースキャン対応
- **Large tap targets**: リモート操作に適したサイズ

### visionOS

#### Spatial layout

- **3D positioning**: 奥行きのあるレイアウト
- **Depth layering**: 前後関係の表現
- **Comfortable viewing distance**: 最適な視距離

## ベストプラクティス

### ✅ 推奨

1. **適応的なレイアウト**
   ```swift
   // Size classに応じたレイアウト
   @Environment(\.horizontalSizeClass) var sizeClass

   var body: some View {
       if sizeClass == .compact {
           VStack { content }  // 縦向き
       } else {
           HStack { content }  // 横向き
       }
   }
   ```

2. **Safe Area を尊重**
   ```swift
   VStack {
       content
   }
   .safeAreaInset(edge: .bottom) {
       BottomBar()
   }
   ```

3. **一貫したスペーシング**
   - 8pt の倍数を使用
   - 視覚的なリズムを確立

4. **十分なタップ領域**
   ```swift
   Button("Tap") { }
       .frame(minWidth: 44, minHeight: 44)  // 最小44pt
   ```

### ❌ 避けるべき

1. **固定サイズのレイアウト**
   ```swift
   // Bad
   Text("Title")
       .frame(width: 200, height: 50)  // 固定サイズ

   // Good
   Text("Title")
       .frame(maxWidth: .infinity)  // 柔軟なサイズ
   ```

2. **Safe Area の無視**
   - ノッチやホームインジケーターにコンテンツが重なる
   - 重要な情報が見えなくなる

3. **小さすぎるタップ領域**
   - 44pt 未満のボタン
   - 誤タップの原因

4. **過度に複雑なレイアウト**
   - ネストが深すぎる
   - パフォーマンスの低下

## レスポンシブレイアウト

### Size Classes

```swift
struct AdaptiveView: View {
    @Environment(\.horizontalSizeClass) var horizontalSizeClass
    @Environment(\.verticalSizeClass) var verticalSizeClass

    var body: some View {
        if horizontalSizeClass == .compact {
            CompactLayout()
        } else {
            RegularLayout()
        }
    }
}
```

### Geometry Reader

```swift
GeometryReader { geometry in
    VStack {
        if geometry.size.width > 600 {
            WideLayout()
        } else {
            NarrowLayout()
        }
    }
}
```

### ViewThatFits（iOS 16+）

```swift
ViewThatFits {
    // 最初に試すレイアウト
    HorizontalLayout()

    // 収まらない場合のフォールバック
    VerticalLayout()
}
```

## 階層とグルーピング

### 視覚的階層

```swift
VStack(alignment: .leading, spacing: 24) {
    // Primary content
    Text("Main Title")
        .font(.largeTitle)
        .fontWeight(.bold)

    // Secondary content
    VStack(alignment: .leading, spacing: 12) {
        Text("Subtitle")
            .font(.title2)

        Text("Description")
            .font(.body)
            .foregroundColor(.secondary)
    }

    // Tertiary content
    Text("Details")
        .font(.caption)
        .foregroundColor(.secondary)
}
```

### グループ化

```swift
Form {
    Section {
        Toggle("Option 1", isOn: $option1)
        Toggle("Option 2", isOn: $option2)
    } header: {
        Text("Group 1")
    }

    Section {
        Toggle("Option 3", isOn: $option3)
    } header: {
        Text("Group 2")
    }
}
```

## コード例集

### 標準的なリストレイアウト

```swift
struct StandardListLayout: View {
    var body: some View {
        List {
            ForEach(items) { item in
                HStack(spacing: 12) {
                    Image(systemName: item.icon)
                        .frame(width: 44, height: 44)
                        .background(Color.blue.opacity(0.1))
                        .cornerRadius(8)

                    VStack(alignment: .leading, spacing: 4) {
                        Text(item.title)
                            .font(.headline)

                        Text(item.subtitle)
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                    }

                    Spacer()

                    Image(systemName: "chevron.right")
                        .foregroundColor(.secondary)
                }
                .padding(.vertical, 8)
            }
        }
    }
}
```

### グリッドレイアウト

```swift
struct GridLayoutExample: View {
    let columns = [
        GridItem(.adaptive(minimum: 150), spacing: 16)
    ]

    var body: some View {
        ScrollView {
            LazyVGrid(columns: columns, spacing: 16) {
                ForEach(items) { item in
                    VStack {
                        Image(systemName: item.icon)
                            .font(.largeTitle)

                        Text(item.title)
                            .font(.headline)
                    }
                    .frame(height: 150)
                    .frame(maxWidth: .infinity)
                    .background(Color.gray.opacity(0.1))
                    .cornerRadius(12)
                }
            }
            .padding()
        }
    }
}
```

### 適応的な詳細ビュー

```swift
struct AdaptiveDetailView: View {
    @Environment(\.horizontalSizeClass) var sizeClass

    var body: some View {
        if sizeClass == .compact {
            // iPhone: 縦並び
            VStack(spacing: 0) {
                ImageSection()
                DetailSection()
            }
        } else {
            // iPad: 横並び
            HStack(spacing: 0) {
                ImageSection()
                    .frame(width: 300)
                DetailSection()
            }
        }
    }
}
```

## 関連トピック

- [Typography](./typography.md) - テキストレイアウト
- [Color](./color.md) - 色によるグルーピング
- [Accessibility](./accessibility.md) - アクセシブルなレイアウト
- [Navigation](../patterns/navigation.md) - ナビゲーション構造

## 参考リソース

- [Human Interface Guidelines - Layout](https://developer.apple.com/design/human-interface-guidelines/layout)
- [WWDC: Building Adaptive User Interfaces](https://developer.apple.com/videos/)
- [Apple Design Resources](https://developer.apple.com/design/resources/)
- [SwiftUI Layout Protocol](https://developer.apple.com/documentation/swiftui/layout)

---

**注**: この内容は一般的なHIGのレイアウトガイドラインに基づいています。最新の詳細は[公式ドキュメント](https://developer.apple.com/design/human-interface-guidelines/layout)を参照してください。
