# Navigation（ナビゲーション）

効果的なナビゲーションは、ユーザーがアプリ内のコンテンツを簡単に見つけて移動できるようにします。

## 出典

- **公式URL**: https://developer.apple.com/design/human-interface-guidelines/navigation
- **日本語版**: https://developer.apple.com/jp/design/human-interface-guidelines/navigation
- **最終更新**: 2026-01-19

## 概要

ナビゲーションは、アプリの情報アーキテクチャを定義し、ユーザーがコンテンツ間を移動する方法を決定します。適切に設計されたナビゲーションは、直感的で予測可能であり、ユーザーの認知的負荷を最小限に抑えます。

## ナビゲーションパターン

### 1. Hierarchical Navigation（階層型ナビゲーション）

親から子へのツリー構造。

**特徴**:
- 1つの選択肢が次の画面につながる
- 戻るボタンで前の画面に戻る
- 深い階層に適している

**例**: 設定アプリ、メールアプリ

```swift
NavigationStack {
    List {
        NavigationLink("設定項目1") {
            DetailView1()
        }
        NavigationLink("設定項目2") {
            DetailView2()
        }
    }
    .navigationTitle("設定")
}
```

### 2. Flat Navigation（フラットナビゲーション）

複数のカテゴリ間を横断的に移動。

**特徴**:
- 同じレベルのコンテンツカテゴリ
- タブバーやセグメントコントロール
- 直接的なアクセス

**例**: App Store（Today、ゲーム、App、Arcade、Search）

```swift
TabView {
    HomeView()
        .tabItem {
            Label("ホーム", systemImage: "house")
        }

    SearchView()
        .tabItem {
            Label("検索", systemImage: "magnifyingglass")
        }

    ProfileView()
        .tabItem {
            Label("プロフィール", systemImage: "person")
        }
}
```

### 3. Content-Driven Navigation（コンテンツ駆動型）

コンテンツ自体がナビゲーションを促す。

**特徴**:
- 自由な移動
- リンクや関連コンテンツ
- 発見的な体験

**例**: ゲーム、読書アプリ、マップ

```swift
ScrollView {
    VStack(alignment: .leading) {
        ForEach(articles) { article in
            ArticleCard(article: article)
                .onTapGesture {
                    navigate(to: article)
                }
        }
    }
}
```

## iOS / iPadOS のナビゲーション

### NavigationStack（iOS 16+）

```swift
struct ContentView: View {
    @State private var path = NavigationPath()

    var body: some View {
        NavigationStack(path: $path) {
            List {
                ForEach(items) { item in
                    NavigationLink(value: item) {
                        ItemRow(item: item)
                    }
                }
            }
            .navigationDestination(for: Item.self) { item in
                ItemDetailView(item: item)
            }
            .navigationTitle("アイテム")
        }
    }
}
```

### NavigationSplitView（iOS 16+）

```swift
struct SplitNavigationView: View {
    @State private var selectedItem: Item?

    var body: some View {
        NavigationSplitView {
            // Sidebar
            List(items, selection: $selectedItem) { item in
                NavigationLink(value: item) {
                    Label(item.title, systemImage: item.icon)
                }
            }
            .navigationTitle("カテゴリ")
        } detail: {
            // Detail
            if let item = selectedItem {
                ItemDetailView(item: item)
            } else {
                Text("項目を選択してください")
            }
        }
    }
}
```

### Tab Navigation

```swift
struct TabNavigationView: View {
    @State private var selectedTab = 0

    var body: some View {
        TabView(selection: $selectedTab) {
            HomeView()
                .tabItem {
                    Label("ホーム", systemImage: "house.fill")
                }
                .tag(0)

            SearchView()
                .tabItem {
                    Label("検索", systemImage: "magnifyingglass")
                }
                .tag(1)

            SettingsView()
                .tabItem {
                    Label("設定", systemImage: "gearshape.fill")
                }
                .tag(2)
        }
    }
}
```

## macOS のナビゲーション

### Sidebar Navigation

```swift
NavigationSplitView {
    // Primary sidebar
    List(selection: $selectedCategory) {
        ForEach(categories) { category in
            NavigationLink(value: category) {
                Label(category.name, systemImage: category.icon)
            }
        }
    }
    .navigationSplitViewColumnWidth(min: 200, ideal: 250)
} content: {
    // Secondary sidebar（オプション）
    if let category = selectedCategory {
        List(itemsFor(category), selection: $selectedItem) { item in
            NavigationLink(value: item) {
                ItemRow(item: item)
            }
        }
    }
} detail: {
    // Detail view
    if let item = selectedItem {
        ItemDetailView(item: item)
    } else {
        Text("項目を選択してください")
    }
}
```

### Toolbar Navigation

```swift
struct ContentView: View {
    var body: some View {
        NavigationStack {
            ContentListView()
                .toolbar {
                    ToolbarItemGroup(placement: .navigation) {
                        Button {
                            toggleSidebar()
                        } label: {
                            Label("サイドバー", systemImage: "sidebar.left")
                        }
                    }

                    ToolbarItemGroup(placement: .primaryAction) {
                        Button("新規作成") {
                            createNew()
                        }
                    }
                }
        }
    }
}
```

## watchOS のナビゲーション

### Page-Based Navigation

```swift
TabView {
    WorkoutView()
    HeartRateView()
    SummaryView()
}
.tabViewStyle(.page)
```

### Hierarchical Navigation

```swift
NavigationStack {
    List {
        NavigationLink("ワークアウト") {
            WorkoutListView()
        }
        NavigationLink("アクティビティ") {
            ActivityView()
        }
    }
    .navigationTitle("Fitness")
}
```

## ベストプラクティス

### ✅ 推奨

1. **一貫したナビゲーションパターン**
   - アプリ全体で統一
   - プラットフォームの慣習に従う

2. **明確な現在位置の表示**
   ```swift
   NavigationStack {
       ContentView()
           .navigationTitle("現在のページ")
           .navigationBarTitleDisplayMode(.large)
   }
   ```

3. **簡単に戻れる**
   - 常に戻る方法を提供
   - ジェスチャーをサポート（スワイプバック）

4. **階層の深さを制限**
   - 3-4レベル以内が理想
   - 深すぎると迷いやすい

5. **モーダルの適切な使用**
   ```swift
   .sheet(isPresented: $showingDetail) {
       DetailView()
   }
   .presentationDetents([.medium, .large])  // カスタマイズ可能な高さ
   ```

### ❌ 避けるべき

1. **複雑すぎるナビゲーション**
   - 複数のパターンの混在
   - 予測不可能な動作

2. **行き止まりの画面**
   ```swift
   // Bad: 戻る方法がない
   .navigationBarBackButtonHidden(true)

   // Good: カスタム戻るボタンを提供
   .toolbar {
       ToolbarItem(placement: .navigationBarLeading) {
           Button("戻る") { dismiss() }
       }
   }
   ```

3. **タブバーの過剰な使用**
   - 最大5タブまで
   - それ以上は "More" タブに

4. **不要なモーダル**
   - 重要でない操作にモーダルを使わない
   - プッシュナビゲーションを優先

## プログラマティックナビゲーション

### Path-based Navigation

```swift
struct NavigationExample: View {
    @State private var path = NavigationPath()

    var body: some View {
        NavigationStack(path: $path) {
            Button("詳細へ移動") {
                path.append(Item(id: 1, name: "Item 1"))
            }
            .navigationDestination(for: Item.self) { item in
                ItemDetailView(item: item, path: $path)
            }
        }
    }
}

// 詳細ビューから直接ルートに戻る
struct ItemDetailView: View {
    let item: Item
    @Binding var path: NavigationPath

    var body: some View {
        Button("ホームに戻る") {
            path.removeLast(path.count)  // すべてポップ
        }
    }
}
```

### Environment-based Dismiss

```swift
struct DetailView: View {
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        Button("閉じる") {
            dismiss()
        }
    }
}
```

## Deep Linking

### URL Schemes

```swift
struct ContentView: View {
    var body: some View {
        NavigationStack {
            HomeView()
        }
        .onOpenURL { url in
            handleDeepLink(url)
        }
    }

    func handleDeepLink(_ url: URL) {
        // myapp://item/123 のようなURLを処理
        if url.scheme == "myapp",
           url.host == "item",
           let itemID = url.pathComponents.last {
            navigate(to: itemID)
        }
    }
}
```

### Universal Links

```swift
.onContinueUserActivity(NSUserActivityTypeBrowsingWeb) { userActivity in
    guard let url = userActivity.webpageURL else { return }
    handleUniversalLink(url)
}
```

## アクセシビリティ

### ナビゲーションのラベル

```swift
NavigationLink {
    DetailView()
} label: {
    Text("詳細")
}
.accessibilityLabel("詳細を表示")
.accessibilityHint("このアイテムの詳細情報を表示します")
```

### Focus Management

```swift
@AccessibilityFocusState private var isFocused: Bool

NavigationLink {
    DetailView()
} label: {
    Text("次へ")
}
.accessibilityFocused($isFocused)
.onAppear {
    DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
        isFocused = true
    }
}
```

## コード例集

### 完全なナビゲーション例

```swift
struct AppNavigationView: View {
    @StateObject private var navigationModel = NavigationModel()

    var body: some View {
        TabView {
            // Home Tab
            NavigationStack(path: $navigationModel.homePath) {
                HomeView()
                    .navigationDestination(for: Article.self) { article in
                        ArticleDetailView(article: article)
                    }
            }
            .tabItem {
                Label("ホーム", systemImage: "house")
            }

            // Search Tab
            NavigationStack(path: $navigationModel.searchPath) {
                SearchView()
                    .navigationDestination(for: SearchResult.self) { result in
                        ResultDetailView(result: result)
                    }
            }
            .tabItem {
                Label("検索", systemImage: "magnifyingglass")
            }

            // Profile Tab
            NavigationStack(path: $navigationModel.profilePath) {
                ProfileView()
                    .navigationDestination(for: ProfileSection.self) { section in
                        SectionDetailView(section: section)
                    }
            }
            .tabItem {
                Label("プロフィール", systemImage: "person")
            }
        }
        .environmentObject(navigationModel)
    }
}

@MainActor
class NavigationModel: ObservableObject {
    @Published var homePath = NavigationPath()
    @Published var searchPath = NavigationPath()
    @Published var profilePath = NavigationPath()

    func navigateToHome() {
        homePath = NavigationPath()
    }

    func popToRoot(for tab: Tab) {
        switch tab {
        case .home: homePath = NavigationPath()
        case .search: searchPath = NavigationPath()
        case .profile: profilePath = NavigationPath()
        }
    }
}
```

### モーダルナビゲーション

```swift
struct ModalNavigationExample: View {
    @State private var showingSheet = false
    @State private var showingFullScreen = false

    var body: some View {
        VStack {
            Button("シート表示") {
                showingSheet = true
            }
            .sheet(isPresented: $showingSheet) {
                NavigationStack {
                    SheetContentView()
                        .toolbar {
                            ToolbarItem(placement: .confirmationAction) {
                                Button("完了") {
                                    showingSheet = false
                                }
                            }
                        }
                }
                .presentationDetents([.medium, .large])
                .presentationDragIndicator(.visible)
            }

            Button("フルスクリーン表示") {
                showingFullScreen = true
            }
            .fullScreenCover(isPresented: $showingFullScreen) {
                NavigationStack {
                    FullScreenContentView()
                        .toolbar {
                            ToolbarItem(placement: .cancellationAction) {
                                Button("閉じる") {
                                    showingFullScreen = false
                                }
                            }
                        }
                }
            }
        }
    }
}
```

## 関連トピック

- [Tab Bars](../components/navigation/tab-bars.md) - タブナビゲーション
- [Navigation Bars](../components/navigation/navigation-bars.md) - ナビゲーションバー
- [Sidebars](../components/navigation/sidebars.md) - サイドバーナビゲーション
- [Modality](./modality.md) - モーダルプレゼンテーション
- [Layout](../foundations/layout.md) - レイアウトとナビゲーション

## 参考リソース

- [Human Interface Guidelines - Navigation](https://developer.apple.com/design/human-interface-guidelines/navigation)
- [WWDC: The SwiftUI cookbook for navigation](https://developer.apple.com/videos/)
- [NavigationStack Documentation](https://developer.apple.com/documentation/swiftui/navigationstack)
- [NavigationSplitView Documentation](https://developer.apple.com/documentation/swiftui/navigationsplitview)

---

**注**: この内容は一般的なHIGのナビゲーションガイドラインに基づいています。最新の詳細は[公式ドキュメント](https://developer.apple.com/design/human-interface-guidelines/navigation)を参照してください。
