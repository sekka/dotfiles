# デザインリソース

デザイン実装に役立つリソース集。カラーパレット、UIトレンド、グラデーション技法などを収録。

---

## カテゴリ

### [color-palettes/](color-palettes/) - カラーパレット
実装可能なカラーパレット集。CSS変数形式で提供。

- [earth-colors.md](color-palettes/earth-colors.md) - アースカラー配色（ナチュラル、オーガニック）
- [luxury-colors.md](color-palettes/luxury-colors.md) - 高級感カラー（プレミアム、エレガント）
- [healing-gradients.md](color-palettes/healing-gradients.md) - 癒しグラデーション（リラックス、ウェルネス）

### [gradients/](gradients/) - グラデーション技法
モダンなグラデーション実装テクニック。

- [mesh-gradients.md](gradients/mesh-gradients.md) - メッシュグラデーション（CSS実装）

### [ui-trends/](ui-trends/) - UIトレンド
最新のUIデザイントレンドと実装方法。

- [liquid-glass.md](ui-trends/liquid-glass.md) - Liquid Glass UI（iOS 26、glassmorphism）

---

## 使い方

### カラーパレットの活用

各パレットはCSS変数形式で提供されているため、そのままコピー&ペーストで使用可能:

```css
/* earth-colors.md から */
:root {
  --forest-primary: #2D5A27;
  --forest-secondary: #4A7C4E;
  --forest-accent: #8FBC8F;
}

.card {
  background: var(--forest-bg);
  border-left: 4px solid var(--forest-primary);
}
```

### 用途タグで検索

各ナレッジファイルには用途タグが付与されている:
- `#ナチュラル` `#オーガニック` - アースカラー
- `#プレミアム` `#エレガント` - 高級感カラー
- `#リラックス` `#ウェルネス` - 癒しグラデーション

---

## 関連カテゴリ

- [css/visual/](../css/visual/) - CSS ビジュアル表現（filter、clip-path、mask）
- [css/theming/](../css/theming/) - CSS テーマ設計（カスタムプロパティ、ダークモード）
- [cross-cutting/ux/](../cross-cutting/ux/) - UXパターン
