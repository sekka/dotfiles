---
title: WAI-ARIA の基礎
category: cross-cutting/accessibility
tags: [aria, accessibility, a11y, semantics, roles, states]
browser_support: 全モダンブラウザ対応
created: 2025-01-16
updated: 2025-01-16
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

```html
<div class="tabs">
  <div role="tablist">
    <button role="tab" aria-selected="true" aria-controls="panel1">
      タブ1
    </button>
    <button role="tab" aria-selected="false" aria-controls="panel2">
      タブ2
    </button>
  </div>

  <div role="tabpanel" id="panel1">
    パネル1の内容
  </div>

  <div role="tabpanel" id="panel2" hidden>
    パネル2の内容
  </div>
</div>
```

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

## 関連ナレッジ

- [アクセシビリティの基本](./accessibility-basics.md)
- [キーボード操作](./keyboard-navigation.md)
- [スクリーンリーダー対応](./screen-reader.md)
