# System UI除外ルール

## 実装してはいけないOS描画要素

FigmaデザインにはOS/デバイスのUI要素がモックアップとして含まれることがある。
これらはOSが自動的に描画するため、アプリ側で実装する必要はない（してはいけない）。

## 除外対象一覧

### iOS

| 要素 | Figmaでの表示名 | 理由 |
|------|----------------|------|
| ホームインジケーター | Home Indicator / 底部の細いバー | iOS が描画 |
| ステータスバー | Status Bar | iOS が描画（時刻・バッテリー・電波） |
| Dynamic Island | Dynamic Island | iOS が描画 |
| ノッチ | Notch | ハードウェア |
| キーボード | Keyboard | iOS が表示 |
| アクションシート背景 | Action Sheet background | システムUI |

### Android

| 要素 | Figmaでの表示名 | 理由 |
|------|----------------|------|
| ナビゲーションバー | Navigation Bar（戻る・ホーム・タスク） | Android が描画 |
| ステータスバー | Status Bar | Android が描画 |
| ジェスチャーバー | Gesture Navigation Bar | Android が描画 |

### Web（ブラウザ）

| 要素 | 理由 |
|------|------|
| ブラウザのアドレスバー | ブラウザが描画 |
| スクロールバー（OS標準） | OSが描画（CSSでカスタマイズは可能だが再実装は不要） |
| ブラウザのモーダルダイアログ | `alert()`, `confirm()` 等 |

## 判断基準

Figmaに含まれているが実装すべきか迷う場合:

```
Q: この要素はアプリのコードで制御できるか？
  → NO（OSが制御） → 実装しない
  → YES（アプリが制御） → 実装する
```

## 実装すべきもの（紛らわしい例）

- **カスタムナビゲーションバー**（アプリ固有のタブバー、ヘッダー）→ 実装する
- **カスタムステータスバー風デザイン**（時刻表示をアプリUI上に置く場合）→ 実装する
- **セーフエリア対応**（ホームインジケーター分の余白）→ `safe-area-inset-bottom` で対応

## セーフエリアの実装

iOSホームインジケーターの領域を避けるためのCSS:

```css
/* iOS セーフエリア対応 */
.bottom-nav {
  padding-bottom: env(safe-area-inset-bottom);
}

/* または */
.bottom-nav {
  padding-bottom: max(1rem, env(safe-area-inset-bottom));
}
```
