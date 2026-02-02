---
title: WAI-ARIA の基礎
category: cross-cutting/accessibility
tags: [aria, accessibility, a11y, semantics, roles, states, screen-reader]
browser_support: 全モダンブラウザ対応
created: 2025-01-16
updated: 2026-02-01
---

# WAI-ARIA の基礎

> 出典: https://zenn.dev/yusukehirao/articles/e3512a58df58fd
> 執筆日: 2021年3月
> 追加日: 2025-01-16

WAI-ARIAを学ぶときに整理しておきたい基礎知識。

## 学習の基本原則

### 1. ロールの理解が最優先

ARIA属性を使う前に、以下を理解する:
- **暗黙のロール**: HTML要素が自動的に持つロール
- **role属性**: 明示的にロールを指定
- **抽象ロール**: 継承関係を理解するための概念

### 2. プロパティとステートはロールに依存

各ARIA属性は、特定のロールに対してのみ有効。

### 3. HTMLセマンティクスを優先

既存のHTML要素で表現できる場合は、ARIAより優先する。

## 暗黙のロール

各HTML要素には自動的にロールが割り当てられている。

```html
<!-- button ロール -->
<button>クリック</button>

<!-- link ロール -->
<a href="/page">リンク</a>

<!-- navigation ロール -->
<nav>...</nav>

<!-- main ロール -->
<main>...</main>
```

### よくある誤解

```html
<!-- ❌ 不要: buttonは既にbuttonロールを持つ -->
<button role="button">クリック</button>

<!-- ✅ 正しい: 余計なARIA不要 -->
<button>クリック</button>
```

## role 属性

HTML要素のロールを明示的に変更または追加する。

### 適切な使用例

```html
<!-- タブUI: 適切なHTML要素がないため -->
<ul role="tablist">
  <li role="tab" aria-selected="true">タブ1</li>
  <li role="tab">タブ2</li>
</ul>

<!-- アラート -->
<div role="alert">エラーが発生しました</div>

<!-- スライダー -->
<div role="slider" aria-valuenow="50" aria-valuemin="0" aria-valuemax="100"></div>
```

### 避けるべき使用例

```html
<!-- ❌ buttonがあるのにdivを使う -->
<div role="button" tabindex="0" onclick="...">クリック</div>

<!-- ✅ 正しい: ネイティブ要素を使う -->
<button onclick="...">クリック</button>
```

## アクセシブルな名前

ロールにより、コンテンツまたはaria-labelから名前を取得する方法が異なる。

### コンテンツから名前を取得

```html
<!-- button: テキストコンテンツが名前になる -->
<button>送信</button>

<!-- link: リンクテキストが名前になる -->
<a href="/about">会社概要</a>
```

### aria-label で名前を指定

```html
<!-- アイコンボタン: 視覚的なテキストがない -->
<button aria-label="メニューを開く">
  <svg>...</svg>
</button>

<!-- 検索フィールド -->
<input type="search" aria-label="サイト内を検索" />
```

### aria-labelledby で関連付け

```html
<h2 id="section-title">プロフィール</h2>
<section aria-labelledby="section-title">
  <!-- セクションの内容 -->
</section>
```

## ステートとプロパティ

### ステート（動的に変化）

```html
<!-- チェックボックス -->
<div role="checkbox" aria-checked="false">
  オプション
</div>

<!-- 展開/折りたたみ -->
<button aria-expanded="false" aria-controls="menu">
  メニュー
</button>

<!-- 無効状態 -->
<button aria-disabled="true">
  送信
</button>
```

### プロパティ（ほぼ静的）

```html
<!-- 必須フィールド -->
<input type="text" aria-required="true" />

<!-- 説明テキストの関連付け -->
<input type="text" aria-describedby="hint" />
<span id="hint">半角英数字で入力してください</span>

<!-- ラベルの関連付け -->
<span id="label">ユーザー名</span>
<input type="text" aria-labelledby="label" />
```

## よくある間違い

### 1. ステートの手動管理

```html
<!-- ❌ 危険: aria-checkedを手動で管理 -->
<div role="checkbox" aria-checked="false" onclick="toggleCheck()">
  オプション
</div>

<script>
function toggleCheck() {
  // aria-checkedを更新し忘れると、支援技術に誤情報
}
</script>

<!-- ✅ 正しい: ネイティブ要素を使う -->
<input type="checkbox" />
```

### 2. 不要なARIA

```html
<!-- ❌ 不要 -->
<button role="button" aria-label="クリック">クリック</button>

<!-- ✅ 正しい -->
<button>クリック</button>
```

### 3. 非インタラクティブ要素へのロール適用

```html
<!-- ❌ imgはインタラクティブではない -->
<img role="button" src="icon.png" />

<!-- ✅ 正しい: buttonを使う -->
<button>
  <img src="icon.png" alt="" />
  送信
</button>
```

## 実践的なパターン

### タブUI

> 追加出典: https://zenn.dev/necscat/articles/bc9bba54babaf5

アクセシブルなタブUIの実装には、適切なARIA属性とキーボード操作の実装が必要です。

#### button要素を使った実装

```html
<div class="tabs">
  <div role="tablist">
    <button role="tab" aria-selected="true" aria-controls="panel1" id="tab1" tabindex="0">
      タブ1
    </button>
    <button role="tab" aria-selected="false" aria-controls="panel2" id="tab2" tabindex="-1">
      タブ2
    </button>
  </div>

  <div role="tabpanel" id="panel1" aria-labelledby="tab1" tabindex="0">
    パネル1の内容
  </div>

  <div role="tabpanel" id="panel2" aria-labelledby="tab2" tabindex="0" hidden>
    パネル2の内容
  </div>
</div>
```

#### a要素を使った実装（ページ内リンクと併用）

```html
<div role="tablist">
  <a href="#tab-panel-1" id="tab1" role="tab" aria-controls="tab-panel-1" aria-selected="true" tabindex="0">
    タブ1
  </a>
  <a href="#tab-panel-2" id="tab2" role="tab" aria-controls="tab-panel-2" aria-selected="false" tabindex="-1">
    タブ2
  </a>
</div>

<div id="tab-panel-1" role="tabpanel" aria-labelledby="tab1" tabindex="0">
  コンテンツ1
</div>

<div id="tab-panel-2" role="tabpanel" aria-labelledby="tab2" tabindex="0" hidden>
  コンテンツ2
</div>
```

**重要な属性:**
- `tabindex="0"`: 選択されているタブはフォーカス可能
- `tabindex="-1"`: 非選択のタブはフォーカス不可（矢印キーで移動）
- `aria-labelledby`: タブパネルとタブを関連付け
- `aria-controls`: タブが制御するパネルを指定

参考: [アクセシブルなタブを実装する](https://baigie.me/engineerblog/building-accessible-tabs/)

### モーダルダイアログ

```html
<div role="dialog" aria-labelledby="dialog-title" aria-modal="true">
  <h2 id="dialog-title">確認</h2>
  <p>本当に削除しますか？</p>
  <button>キャンセル</button>
  <button>削除</button>
</div>
```

### アラート

```html
<!-- 重要な通知 -->
<div role="alert">
  エラーが発生しました。もう一度お試しください。
</div>

<!-- ライブリージョン -->
<div role="status" aria-live="polite">
  保存しました
</div>
```

## 学習の順序

1. **暗黙のロールを理解**
   - 各HTML要素が持つロールを把握

2. **ネイティブ要素を優先**
   - ARIAより先にHTML要素を検討

3. **必要な場合のみARIAを使用**
   - 適切なHTML要素がない場合

4. **ステート管理に注意**
   - JavaScriptでの状態更新を忘れない

5. **支援技術でテスト**
   - スクリーンリーダーで実際に確認

## チェックリスト

- [ ] ネイティブHTML要素で表現できないか確認
- [ ] role属性が必要な理由を説明できる
- [ ] アクセシブルな名前が適切に設定されている
- [ ] ステートの更新がJavaScriptで管理されている
- [ ] キーボード操作が可能
- [ ] スクリーンリーダーでテスト済み

## スクリーンリーダーでの読み上げ例

> 出典: https://ics.media/entry/230821/
> 執筆日: 2023-08-21
> 追加日: 2026-02-01

実際のスクリーンリーダーでARIA属性がどう読み上げられるかを確認。テスト環境: VoiceOver（macOS/iOS）、Narrator（Windows）、NVDA（Windows）、PC-Talker Neo Plus（Windows）。

### aria-current

**用途**: ナビゲーションで現在のページを示す

```html
<nav>
  <a href="/html">HTML</a>
  <a href="/css">CSS</a>
  <a href="/javascript" aria-current="page">JavaScript</a>
</nav>
```

**読み上げ**:

| スクリーンリーダー | 読み上げ内容 |
|------------------|-------------|
| VoiceOver (macOS) | "JavaScript、現在のページ、リンク" |
| Narrator (Windows) | "JavaScript、リンク、現在のページ" |
| NVDA | "JavaScript、リンク、current page" |
| PC-Talker | "JavaScript、リンク" |

**注意**: PC-Talkerは `aria-current` を読み上げない場合があります。CSSで視覚的な区別も必須。

### aria-label

**用途**: アイコンのみのボタンに説明的なラベルを付与

```html
<!-- ページトップボタン -->
<a href="#top" aria-label="ページの先頭へ戻る">
  <svg><!-- 上矢印アイコン --></svg>
</a>

<!-- ハンバーガーメニュー -->
<button aria-label="メニューを開く" aria-haspopup="true">
  <span class="hamburger-icon"></span>
</button>
```

**読み上げ**:

| スクリーンリーダー | 読み上げ内容（ページトップ） |
|------------------|---------------------------|
| VoiceOver | "ページの先頭へ戻る、リンク" |
| Narrator | "ページの先頭へ戻る、リンク" |
| NVDA | "ページの先頭へ戻る、リンク" |
| PC-Talker | "ページの先頭へ戻る、リンク" |

**ベストプラクティス**:
- アイコンのみのUI要素には必ず `aria-label` を付与
- ラベルは動作を説明する（「クリック」は不要）
- 簡潔でわかりやすい表現

### aria-haspopup

**用途**: サブメニューやポップアップの存在を示す

```html
<nav>
  <ul>
    <li>
      <a href="#" aria-haspopup="true">製品</a>
      <ul>
        <li><a href="/product1">製品1</a></li>
        <li><a href="/product2">製品2</a></li>
      </ul>
    </li>
  </ul>
</nav>
```

**読み上げ**:

| スクリーンリーダー | 読み上げ内容 |
|------------------|-------------|
| VoiceOver | "製品、サブメニュー、リンク" |
| Narrator | "製品、リンク、サブメニューあり" |
| NVDA | "製品、リンク、has popup" |
| PC-Talker | "製品、リンク、サブメニュー" |

**aria-haspopupの値**:

```html
aria-haspopup="menu"      <!-- メニュー -->
aria-haspopup="dialog"    <!-- ダイアログ -->
aria-haspopup="listbox"   <!-- リストボックス -->
aria-haspopup="tree"      <!-- ツリー -->
aria-haspopup="grid"      <!-- グリッド -->
aria-haspopup="true"      <!-- メニュー（デフォルト） -->
```

### aria-hidden

**用途**: 装飾的要素をスクリーンリーダーから隠す

```html
<button>
  <span aria-hidden="true">🔍</span>
  検索
</button>

<p>
  重要なお知らせ
  <span class="icon" aria-hidden="true">⚠️</span>
</p>
```

**読み上げ**:

| 要素 | aria-hidden | 読み上げ |
|------|------------|---------|
| `<span>🔍</span> 検索` | なし | "虫眼鏡、検索、ボタン" |
| `<span aria-hidden="true">🔍</span> 検索` | あり | "検索、ボタン" |

**使用すべき場面**:
- 装飾的な絵文字・アイコン
- 視覚的な区切り線
- 意味を持たないSVG要素
- CSSで生成された装飾要素

**注意**:
- 重要な情報には使わない
- `aria-hidden="true"` の子要素も全て隠される

### aria-labelledby / aria-describedby

**用途**: 要素に説明を関連付ける

```html
<dialog aria-labelledby="dialog-title" aria-describedby="dialog-description">
  <h2 id="dialog-title">確認</h2>
  <p id="dialog-description">この操作を実行してもよろしいですか?</p>
  <button>実行</button>
  <button>キャンセル</button>
</dialog>
```

**読み上げ（ダイアログ表示時）**:

| スクリーンリーダー | 読み上げ内容 |
|------------------|-------------|
| VoiceOver | "確認、ダイアログ。この操作を実行してもよろしいですか?" |
| NVDA | "確認、ダイアログ、この操作を実行してもよろしいですか?" |

**違い**:
- `aria-labelledby`: 要素の「タイトル」を指定
- `aria-describedby`: 要素の「説明」を指定

## スクリーンリーダーテストのベストプラクティス

### 1. 複数のスクリーンリーダーでテスト

| スクリーンリーダー | プラットフォーム | 入手方法 |
|------------------|---------------|---------|
| VoiceOver | macOS/iOS | 標準搭載 |
| Narrator | Windows | 標準搭載 |
| NVDA | Windows | 無料ダウンロード |
| JAWS | Windows | 有料（試用版あり） |
| PC-Talker | Windows | 有料 |
| TalkBack | Android | 標準搭載 |

### 2. 基本的な操作を覚える

**VoiceOver（Mac）**:
- 起動: `Cmd + F5`
- 次の要素: `Ctrl + Option + →`
- 前の要素: `Ctrl + Option + ←`
- クリック: `Ctrl + Option + Space`

**NVDA（Windows）**:
- 起動: インストール後、`Ctrl + Alt + N`
- 次の要素: `↓`
- 前の要素: `↑`
- クリック: `Enter`

### 3. チェックポイント

- [ ] ページタイトルが読み上げられる
- [ ] ナビゲーションで現在位置がわかる
- [ ] ボタン・リンクの目的が理解できる
- [ ] フォームのラベルが適切
- [ ] エラーメッセージが伝わる
- [ ] モーダル表示時にフォーカスが移動する

## 関連ナレッジ

- [アクセシビリティの基本](./web-accessibility-basics-2024.md)
- [キーボード操作](./keyboard-navigation.md)
- [スクリーンリーダー対応](./screen-reader.md)
- [強制カラーモード](./forced-colors-mode.md)
