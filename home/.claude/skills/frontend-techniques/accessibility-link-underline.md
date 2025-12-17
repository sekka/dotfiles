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

## 参考

- [WCAG 2.1 達成基準 1.4.1 色の使用](https://waic.jp/translations/WCAG21/#use-of-color)
- [G183: 色が単独でリンク又はコントロールを特定する場所で、周囲のテキストと一緒に、3:1 のコントラスト比を提供する](https://waic.jp/translations/WCAG21/Techniques/general/G183)
