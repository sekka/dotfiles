# Getting Started with Human Interface Guidelines

Apple プラットフォーム向けのアプリやゲームを設計する際の基本的な考え方とアプローチを学びます。

## 出典

- **公式URL**: https://developer.apple.com/design/human-interface-guidelines/getting-started
- **日本語版**: https://developer.apple.com/jp/design/human-interface-guidelines/getting-started
- **最終更新**: 2026-01-19

## 概要

Human Interface Guidelines (HIG) は、すべての Apple プラットフォームで優れたユーザー体験を提供するための包括的なリソースです。このガイドは、デザイナー、開発者、プロダクトマネージャーが、直感的で美しく、使いやすいアプリを作成するための指針を提供します。

## HIG の使い方

### 1. デザイン原則を理解する

Apple のデザイン哲学の3つの柱：

#### Hierarchy（階層性）
- コントロールとインターフェース要素が明確な視覚的階層を確立
- 下層のコンテンツを際立たせる
- 重要な情報を目立たせる

#### Harmony（調和）
- ハードウェアとソフトウェアの同心円デザインに合わせる
- インターフェース要素、システム体験、デバイス間の調和
- 統一感のある体験

#### Consistency（一貫性）
- プラットフォームの慣習を採用
- ウィンドウサイズやディスプレイに継続的に適応
- 予測可能な動作

### 2. プラットフォームを選択する

各プラットフォームには固有の特性があります：

| プラットフォーム | 特徴 | 主要な入力方法 |
|----------------|------|---------------|
| iOS | モバイルファースト、タッチ操作 | タッチ、ジェスチャー |
| iPadOS | マルチタスキング、柔軟性 | タッチ、Apple Pencil、キーボード |
| macOS | デスクトップ、生産性 | マウス、トラックパッド、キーボード |
| watchOS | グランス、健康 | タッチ、Digital Crown |
| tvOS | 大画面、没入感 | Siri Remote、ゲームコントローラー |
| visionOS | 空間コンピューティング | 視線、ハンドジェスチャー |

### 3. Foundations（基礎）を学ぶ

デザインの基本要素：

- **[Color](./foundations/color.md)** - カラーシステム、アクセシビリティ、ダイナミックカラー
- **[Typography](./foundations/typography.md)** - フォント、Dynamic Type、テキスト階層
- **[Layout](./foundations/layout.md)** - グリッド、スペーシング、レスポンシブデザイン
- **[Icons](./foundations/icons.md)** - アイコンデザイン、SF Symbols
- **[Accessibility](./foundations/accessibility.md)** - すべての人のためのデザイン

### 4. Patterns（パターン）を適用する

一般的なユーザータスクのデザインパターン：

- **[Navigation](./patterns/navigation.md)** - ナビゲーション構造
- **[Entering data](./patterns/entering-data.md)** - データ入力
- **[Feedback](./patterns/feedback.md)** - ユーザーフィードバック
- **[Modality](./patterns/modality.md)** - モーダルとコンテキスト
- **[Searching](./patterns/searching.md)** - 検索機能

### 5. Components（コンポーネント）を使用する

システム提供のコンポーネント：

- **[Buttons](./components/menus-and-actions/buttons.md)** - ボタンスタイル
- **[Lists and tables](./components/layout-and-organization/lists-and-tables.md)** - リスト表示
- **[Navigation bars](./components/navigation/navigation-bars.md)** - ナビゲーションバー
- **[Tab bars](./components/navigation/tab-bars.md)** - タブバー

## デザインプロセス

### 1. リサーチと発見

**ユーザーを理解する**：
- ユーザーのニーズと目標
- 使用コンテキスト
- ペインポイント

**競合分析**：
- 類似アプリの調査
- ベストプラクティスの学習
- 差別化ポイントの特定

### 2. 情報アーキテクチャ

**コンテンツの構造化**：
- 主要な機能の特定
- ナビゲーション階層の設計
- ユーザーフローの定義

```
Example:
App
├── Home（タブ）
│   ├── Featured
│   └── Recommendations
├── Search（タブ）
│   ├── Results
│   └── Filters
└── Profile（タブ）
    ├── Settings
    └── History
```

### 3. ワイヤーフレームとプロトタイプ

**Low-fidelity wireframes**：
- 基本的なレイアウト
- ナビゲーションフロー
- 主要な機能配置

**High-fidelity prototypes**：
- 詳細なデザイン
- インタラクション
- アニメーション

**ツール**：
- Sketch
- Figma
- Adobe XD
- Keynote（プロトタイピング）

### 4. 視覚デザイン

**ブランドアイデンティティ**：
- カラーパレット
- タイポグラフィ
- アイコンスタイル

**Apple Design Resources を使用**：
- [SF Symbols](https://developer.apple.com/sf-symbols/)
- [デザインテンプレート](https://developer.apple.com/design/resources/)
- [UI Kits](https://developer.apple.com/design/resources/)

### 5. 実装とテスト

**SwiftUI / UIKit での実装**：
```swift
// SwiftUI Example
struct ContentView: View {
    var body: some View {
        NavigationStack {
            List {
                ForEach(items) { item in
                    NavigationLink(value: item) {
                        ItemRow(item: item)
                    }
                }
            }
            .navigationTitle("Items")
            .navigationDestination(for: Item.self) { item in
                ItemDetailView(item: item)
            }
        }
    }
}
```

**テスト**：
- 実機でのテスト
- 異なる画面サイズ
- Dynamic Type設定
- VoiceOver でのテスト
- ダークモードの確認

### 6. 反復と改善

**ユーザーフィードバック**：
- TestFlight でのベータテスト
- ユーザーレビューの分析
- アナリティクスデータの確認

**継続的な改善**：
- パフォーマンス最適化
- アクセシビリティの向上
- 新機能の追加

## プラットフォーム別のアプローチ

### iOS アプリの設計

**主要な考慮事項**：
1. **タッチファースト**: 指での操作を最適化
2. **画面サイズ**: iPhone SE から iPhone Pro Max まで
3. **オリエンテーション**: 縦向き/横向きの両対応
4. **システム統合**: ウィジェット、Live Activities、共有シート

**スタート地点**：
```swift
@main
struct MyApp: App {
    var body: some Scene {
        WindowGroup {
            ContentView()
        }
    }
}
```

### iPadOS アプリの設計

**主要な考慮事項**：
1. **マルチタスキング**: Split View、Slide Over
2. **Apple Pencil**: 描画、注釈
3. **キーボードショートカット**: 生産性向上
4. **Stage Manager**: ウィンドウ管理

**NavigationSplitView の使用**：
```swift
NavigationSplitView {
    SidebarView()
} detail: {
    DetailView()
}
```

### macOS アプリの設計

**主要な考慮事項**：
1. **ウィンドウ管理**: リサイズ、最小化、フルスクリーン
2. **メニューバー**: アプリケーションメニュー
3. **ツールバー**: アクションとコントロール
4. **ポインタ**: マウス/トラックパッド操作

**Settings Scene の使用**：
```swift
@main
struct MyApp: App {
    var body: some Scene {
        WindowGroup {
            ContentView()
        }

        Settings {
            SettingsView()
        }
    }
}
```

### watchOS アプリの設計

**主要な考慮事項**：
1. **グランス体験**: 素早い情報確認
2. **Digital Crown**: スクロールと入力
3. **コンプリケーション**: 文字盤への統合
4. **健康とフィットネス**: ワークアウトとアクティビティ

### visionOS アプリの設計

**主要な考慮事項**：
1. **空間デザイン**: 3D空間での配置
2. **深度とスケール**: 奥行きの表現
3. **視線とハンドジェスチャー**: 自然な操作
4. **没入感**: Immersive Spaces

## ベストプラクティス

### ✅ 推奨

1. **プラットフォームの慣習に従う**
   - システムコンポーネントを使用
   - 標準的なジェスチャーをサポート
   - プラットフォーム固有の機能を活用

2. **アクセシビリティを最初から考慮**
   - VoiceOver対応
   - Dynamic Type対応
   - 十分なコントラスト

3. **一貫性を保つ**
   - デザインパターンの統一
   - 色とタイポグラフィの一貫性
   - 予測可能な動作

4. **シンプルさを維持**
   - 不要な要素を削除
   - 明確な視覚的階層
   - 簡潔なテキスト

5. **パフォーマンスを最適化**
   - スムーズなアニメーション（60fps）
   - 高速な起動時間
   - 効率的なメモリ使用

### ❌ 避けるべき

1. **プラットフォームの無視**
   - iOS風のUIをmacOSに移植
   - タッチ操作をポインタに強制

2. **過度な装飾**
   - 不必要なアニメーション
   - 複雑すぎるレイアウト

3. **アクセシビリティの軽視**
   - VoiceOverのテストなし
   - 固定フォントサイズ

4. **独自の再発明**
   - 標準コンポーネントの再実装
   - 非標準のジェスチャー

## 学習リソース

### 公式リソース

1. **Human Interface Guidelines**
   - [英語版](https://developer.apple.com/design/human-interface-guidelines/)
   - [日本語版](https://developer.apple.com/jp/design/human-interface-guidelines/)

2. **Apple Design Resources**
   - [デザインテンプレート](https://developer.apple.com/design/resources/)
   - [SF Symbols App](https://developer.apple.com/sf-symbols/)
   - [UI Kit](https://developer.apple.com/design/resources/)

3. **WWDC Videos**
   - [Design Sessions](https://developer.apple.com/videos/design/)
   - [Developer Sessions](https://developer.apple.com/videos/)

4. **Apple Developer Documentation**
   - [SwiftUI](https://developer.apple.com/documentation/swiftui/)
   - [UIKit](https://developer.apple.com/documentation/uikit/)
   - [AppKit](https://developer.apple.com/documentation/appkit/)

### コミュニティリソース

- **Apple Developer Forums**: https://developer.apple.com/forums/
- **Stack Overflow**: SwiftUI、UIKit タグ
- **GitHub**: オープンソースサンプルアプリ
- **Medium**: Apple design articles

### 推奨書籍

- "Designing for iOS" by Mike Rundle
- "iOS App Development with SwiftUI" by Apple
- "The Design of Everyday Things" by Don Norman

## 次のステップ

1. **基礎を固める**
   - [Foundations](./foundations/) セクションを読む
   - Apple Design Resources をダウンロード
   - SF Symbols を探索

2. **実践する**
   - 小さなプロトタイプを作成
   - SwiftUI Tutorials を完了
   - サンプルアプリを研究

3. **フィードバックを得る**
   - デザインレビュー
   - ユーザーテスト
   - コミュニティでの共有

4. **継続的に学ぶ**
   - 毎年のWWDCを視聴
   - HIGの更新を追跡
   - 新しいプラットフォーム機能を探索

## まとめ

Human Interface Guidelines は、優れたAppleプラットフォームアプリを作成するための包括的なリソースです。この知識を活用して、ユーザーに愛される、美しく、使いやすいアプリを作成しましょう。

**重要なポイント**：
- プラットフォームの慣習を尊重
- アクセシビリティを優先
- シンプルさと一貫性を保つ
- ユーザーを中心に設計
- 継続的に学び、改善する

---

**注**: この内容は一般的なHIGの概要に基づいています。最新の詳細は[公式ドキュメント](https://developer.apple.com/design/human-interface-guidelines/getting-started)を参照してください。
