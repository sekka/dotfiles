---
title: Noto Sans JP ウェブフォント最適化実装
category: css/typography
tags: [webfont, Noto Sans JP, performance, font-loading]
browser_support: Windows 11/10（標準搭載）、Android 15+（バリアブル版）、iOS/macOS（未搭載）
created: 2025-02-01
updated: 2025-02-01
---

# Noto Sans JP ウェブフォント最適化実装

## OS別フォント搭載状況とパフォーマンス最適化

> 出典: https://ics.media/entry/250718/
> 執筆日: 2025-07-18
> 追加日: 2025-02-01

Windows 11/10では2025年4月アップデートからNoto Sans JPが標準搭載されているため、ローカルフォントを優先的に使用することでウェブフォント配信のパフォーマンスを改善できる。しかし、Google Fontsはローカルファイル存在下でも配信される課題がある。

### OS別搭載状況

| OS | 搭載状況 | バリアブルフォント対応 |
|---|---|---|
| **Windows 11/10** | Noto Sans JP標準搭載（2025年4月〜） | 未対応 |
| **Android 15以降** | Noto Sans CJK JP搭載 | 対応 |
| **iOS/macOS** | 未搭載 | - |

### ローカルフォント優先実装パターン

```css
@font-face {
  font-family: 'Local Noto Sans JP';
  src:
    local('Noto Sans JP'),        /* Windows用 */
    local('Noto Sans CJK JP Regular'); /* Android用 */
  font-weight: normal;
  font-style: normal;
}

body {
  font-family: "Local Noto Sans JP", "Noto Sans JP", sans-serif;
}
```

### 3つの実装アプローチ

#### 1. 表示一貫性重視（ウェブフォントのみ）

```css
body {
  font-family: "Noto Sans JP", sans-serif;
}
```

**メリット**: 全デバイスで完全に同じ見た目
**デメリット**: 全環境でフォント配信が必要（パフォーマンス低下）

---

#### 2. 速度重視（ローカルフォント優先）

```css
@font-face {
  font-family: 'Local Noto Sans JP';
  src:
    local('Noto Sans JP'),
    local('Noto Sans CJK JP Regular');
}

body {
  font-family: "Local Noto Sans JP", sans-serif;
  /* フォールバックなし: iOS/macOSではシステムフォント */
}
```

**メリット**: Windows/Androidで配信不要（最速）
**デメリット**: iOS/macOSでは異なるフォントになる

---

#### 3. バランス型（推奨）

```css
@font-face {
  font-family: 'Local Noto Sans JP';
  src:
    local('Noto Sans JP'),
    local('Noto Sans CJK JP Regular');
}

body {
  font-family: "Local Noto Sans JP", "Noto Sans JP", sans-serif;
}
```

**メリット**: Windows/Androidは高速、iOS/macOSは統一感
**デメリット**: iOS/macOSでは配信が必要

### Google Fontsの課題

**問題**: Google Fontsはローカルにフォントがあっても配信を停止しない

**理由**: `local()`を使用しないポリシー（バージョン管理の一貫性確保のため）

**対策**:
- Adobe Fontsなど、ローカル優先のサービスを検討
- セルフホスティングで完全制御

### ユースケース

- **コーポレートサイト**: バランス型を推奨（統一感とパフォーマンスの両立）
- **メディアサイト**: 速度重視（LCP改善優先）
- **グローバルサイト**: 表示一貫性重視（ブランドイメージ優先）

### 注意点

- **バリアブルフォント対応**: Android 15+のみ。Windowsは静的フォント
- **ウェイト指定**: ローカルフォントでは各ウェイトを個別に`@font-face`定義が必要
- **font-display**: `swap`を指定してFOUTを防ぐ

```css
@font-face {
  font-family: 'Noto Sans JP';
  src: url('...') format('woff2');
  font-display: swap; /* フォント読み込み中も文字表示 */
}
```

### パフォーマンス測定

```javascript
// フォント読み込み完了を検知
document.fonts.ready.then(() => {
  console.log('Fonts loaded');
});
```

### 参考資料

- [Noto Sans JP - Google Fonts](https://fonts.google.com/noto/specimen/Noto+Sans+JP)
- [Web Font Optimization - Web.dev](https://web.dev/font-best-practices/)

---
