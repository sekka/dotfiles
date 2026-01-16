---
title: リンクの下線とアクセシビリティ
category: cross-cutting/accessibility
tags: [accessibility, wcag, links, underline, a11y]
browser_support: 全モダンブラウザ対応
created: 2025-01-16
updated: 2025-01-16
---

# リンクの下線とアクセシビリティ

<!-- 出典: https://qiita.com/ymrl/items/d8008146fd6d6736ed1f -->

## 結論

リンクの下線を消すことは特定の条件下で可能だが、**慎重な判断が必要**。
安易に下線を消すとアクセシビリティ上の問題が発生する。

## WCAG の基準

### WCAG 1.4.1「色の使用」

> 色が、情報を伝える、動作を示す、反応を促す、又は視覚的な要素を判別するための唯一の視覚的手段になっていない。

つまり、**色だけでリンクを判別させてはいけない**。

### 影響を受けるユーザー

- 色覚異常のあるユーザー（日本では男性約20人に1人、女性約500人に1人）
- ロービジョン（弱視）のユーザー
- グレースケール表示で閲覧するユーザー

## 下線を消せる条件

WCAG のガイダンスによると、以下の条件を満たせば下線なしも許容される:

### 1. コントラスト比 3:1 以上

リンクテキストと周囲のテキストの間に **3:1 以上のコントラスト比**が必要。

```css
/* 例: 黒テキスト (#333) に対するリンク色 */
a {
  color: #0066cc; /* 周囲テキストとの contrast ratio >= 3:1 */
  text-decoration: none;
}
```

### 2. ホバー/フォーカス時の視覚的フィードバック

```css
a:hover,
a:focus {
  text-decoration: underline;
  /* または他の視覚的変化 */
}
```

### 3. 文脈による識別

- 十分な余白
- 配置（ナビゲーション、ボタン風のUI）
- 確立されたUIパターン

## 問題点と注意事項

### モバイルデバイスでの問題

**ホバー状態が存在しない**ため、下線のないリンクは判別が困難。

```css
/* モバイルでは下線を維持する例 */
a {
  text-decoration: none;
}

@media (hover: none) {
  a {
    text-decoration: underline;
  }
}
```

### コントラスト比だけでは不十分

- 低彩度の色はコントラスト比を満たしても埋もれて見える
- 文脈によって認識しやすさが大きく変わる

### リンクと判別しにくいケース

| 状況 | リスク |
|------|--------|
| 長文の中のリンク | 高 - 周囲のテキストに埋もれる |
| 色覚異常ユーザー | 高 - 色の違いを認識できない |
| モバイル閲覧 | 高 - ホバーで確認できない |
| ナビゲーション内 | 低 - 文脈から判断可能 |
| ボタン風UI | 低 - 形状で判別可能 |

## 推奨アプローチ

### 本文中のリンク

**下線を維持する**のが最も安全。

```css
/* 本文中のリンク */
article a,
.prose a {
  text-decoration: underline;
  text-decoration-color: currentColor;
  text-underline-offset: 0.15em;
}
```

### ナビゲーション・UIコンポーネント

文脈が明確な場合は下線なしも可。

```css
/* ナビゲーション */
nav a {
  text-decoration: none;
  padding: 0.5em 1em;
}

nav a:hover,
nav a:focus {
  background-color: rgba(0, 0, 0, 0.1);
}

/* ボタン風リンク */
.button-link {
  text-decoration: none;
  padding: 0.75em 1.5em;
  border: 1px solid currentColor;
  border-radius: 4px;
}
```

### フォーカス表示の強化

```css
a:focus {
  outline: 2px solid currentColor;
  outline-offset: 2px;
}

/* または */
a:focus-visible {
  text-decoration: underline;
  text-decoration-thickness: 2px;
}
```

## チェックリスト

リンクの下線を消す前に確認:

- [ ] 周囲テキストとのコントラスト比が 3:1 以上か
- [ ] ホバー/フォーカス時に視覚的変化があるか
- [ ] モバイルでも判別可能か
- [ ] 色覚シミュレーションでテストしたか
- [ ] 文脈からリンクと判断できるか
- [ ] スクリーンリーダーでテストしたか

---

## 下線の視覚的ノイズを軽減する

> 出典: https://yuheiy.com/2025-03-18-underline-with-less-visual-noise
> 執筆日: 2025年3月18日
> 追加日: 2025-01-16

デフォルトの下線が持つアクセシビリティ上の問題を解決しつつ、視覚的な品質を向上させる手法。

### デフォルト下線の問題点

1. **ディセンダー（下に突き出る文字）との重なり**
   - p, g, y, q などの文字と下線が重なり、判読性が低下
   - 文字の形状が不明瞭になる

2. **ユーザーの注意散漫**
   - 下線が目立ちすぎて本文の読解を妨げる
   - 特に長文中では視覚的ノイズとなる

3. **美観上の課題**
   - デフォルトの下線は太く、デザインの質を下げる

### 推奨スタイリング

```css
html {
  /* グローバル設定 */
  text-underline-offset: 0.3em;
}

a:any-link {
  text-decoration: underline;
  text-decoration-color: oklch(0.67 0 0); /* 背景とのコントラスト比 3:1 以上 */
  text-decoration-thickness: 1px;
}
```

**重要なプロパティ:**

#### text-underline-offset: 0.3em

下線と文字の距離を確保し、ディセンダーとの重なりを防ぐ。

```css
a {
  text-underline-offset: 0.3em; /* 文字サイズに応じて調整 */
}
```

#### text-decoration-thickness: 1px

下線を細くして視覚的ノイズを軽減。

```css
a {
  text-decoration-thickness: 1px; /* デフォルトより細く */
}
```

#### text-decoration-color

下線の色を背景とのコントラスト比 3:1 以上に調整（WCAG要件）。

```css
a {
  color: #0066cc; /* リンクテキストの色 */
  text-decoration-color: oklch(0.67 0 0); /* 下線の色（グレー） */
}

/* ダークモード */
@media (prefers-color-scheme: dark) {
  a {
    text-decoration-color: oklch(0.5 0 0);
  }
}
```

### 完全な実装例

```css
/* グローバル設定 */
html {
  text-underline-offset: 0.3em;
  line-height: 1.7; /* 行間を広めに */
}

/* リンクのスタイル */
a:any-link {
  color: #0066cc;
  text-decoration: underline;
  text-decoration-color: oklch(0.67 0 0);
  text-decoration-thickness: 1px;
}

/* ホバー時 */
a:hover {
  text-decoration-color: currentColor; /* リンク色と同じにする */
  text-decoration-thickness: 2px; /* 少し太く */
}

/* フォーカス時 */
a:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 2px;
  text-decoration-color: currentColor;
}
```

### 追加の最適化

#### line-height の調整

```css
article {
  line-height: 1.7; /* デフォルトの1.5より広め */
}
```

**理由:**
- 下線が次行のテキストに干渉しない
- 全体的な可読性が向上

#### 本文中とナビゲーションの使い分け

```css
/* 本文中のリンク（下線を維持） */
article a,
.prose a {
  text-decoration: underline;
  text-decoration-color: oklch(0.67 0 0);
  text-decoration-thickness: 1px;
  text-underline-offset: 0.3em;
}

/* ナビゲーション（下線なし） */
nav a {
  text-decoration: none;
}

nav a:hover,
nav a:focus {
  text-decoration: underline;
}
```

### ブラウザ対応

- `text-underline-offset`: 全モダンブラウザ対応
- `text-decoration-thickness`: 全モダンブラウザ対応
- `text-decoration-color`: 全モダンブラウザ対応
- `oklch()`: Chrome 111+, Safari 15.4+, Firefox 113+

**フォールバック:**

```css
a {
  /* フォールバック（RGB） */
  text-decoration-color: rgb(170, 170, 170);

  /* モダンブラウザ（OKLCH） */
  text-decoration-color: oklch(0.67 0 0);
}
```

### before/after での実装（非推奨）

従来は疑似要素で下線を実装する手法もあったが、`text-decoration-*` プロパティの充実により不要。

```css
/* 旧手法（非推奨） */
a {
  text-decoration: none;
  position: relative;
}

a::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 100%;
  height: 1px;
  background: currentColor;
}

/* 新手法（推奨） */
a {
  text-decoration: underline;
  text-decoration-thickness: 1px;
  text-underline-offset: 0.3em;
}
```

**新手法のメリット:**
- コードがシンプル
- パフォーマンスが良い（疑似要素不要）
- スクリーンリーダーとの互換性が高い

---

## 参考

- [WCAG 2.1 達成基準 1.4.1 色の使用](https://waic.jp/translations/WCAG21/#use-of-color)
- [G183: 色が単独でリンク又はコントロールを特定する場所で、周囲のテキストと一緒に、3:1 のコントラスト比を提供する](https://waic.jp/translations/WCAG21/Techniques/general/G183)
- [リンクの下線の視覚的ノイズを軽減する](https://yuheiy.com/2025-03-18-underline-with-less-visual-noise)
