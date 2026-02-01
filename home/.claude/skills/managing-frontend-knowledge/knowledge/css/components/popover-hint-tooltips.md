---
title: popover="hint" 属性によるツールチップ実装
category: css/components
tags: [popover, tooltip, hint, accessibility, anchor-positioning]
browser_support: Chrome 133+, Edge 133+（2026年1月時点）
created: 2025-02-01
updated: 2025-02-01
---

# popover="hint" 属性によるツールチップ実装

## 一時的なUIに最適な新しいpopover属性値

> 出典: https://ics.media/entry/250417/
> 執筆日: 2025-04-17
> 追加日: 2025-02-01

HTMLの `popover="hint"` 属性により、ツールチップなど一時的なUIを簡潔に実装できる。JavaScriptで表示制御しつつ、Escキーやクリックによる自動非表示機能が組み込まれている。

### 3つのpopover属性値の比較

| 属性値 | 用途 | 表示制御 | 複数同時表示 | 自動非表示 |
|--------|------|---------|------------|----------|
| `auto` | メニュー、ダイアログ | HTML/JS | 1つのみ | Esc/クリック |
| `manual` | トースト通知 | JS必須 | 可能 | なし（JS必須） |
| `hint` | ツールチップ | JS推奨 | 可能 | Esc/クリック |

### popover="hint" の特徴

- **JS制御の表示**: `showPopover()` / `hidePopover()` で制御
- **組み込み非表示**: Escキーや外部クリックで自動的に閉じる
- **複数同時表示**: 他のpopoverと干渉しない
- **軽量トップレイヤー**: `auto` より低い優先度

### 基本的な実装パターン

```html
<button id="trigger">ヘルプ</button>

<span popover="hint" id="tooltip" style="position-anchor: --trigger">
  <span class="hint__inner">ここに説明テキスト</span>
</span>
```

```css
#trigger {
  anchor-name: --trigger; /* アンカー名を定義 */
}

#tooltip {
  position: absolute;
  position-anchor: --trigger;
  inset-area: top; /* トリガーの上に表示 */
  margin-bottom: 8px;

  background: #333;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-size: 0.875rem;
}

/* 三角形の矢印 */
#tooltip::before {
  content: '';
  position: absolute;
  bottom: -6px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-top: 6px solid #333;
}
```

```javascript
const trigger = document.getElementById('trigger');
const tooltip = document.getElementById('tooltip');

trigger.addEventListener('mouseenter', () => {
  tooltip.showPopover();
});

trigger.addEventListener('mouseleave', () => {
  tooltip.hidePopover();
});
```

### アニメーション対応（@starting-style）

```css
#tooltip {
  opacity: 0;
  scale: 0.8;
  transition: opacity 0.2s ease, scale 0.2s ease;
}

#tooltip:popover-open {
  opacity: 1;
  scale: 1;
}

/* 開始状態を定義 */
@starting-style {
  #tooltip:popover-open {
    opacity: 0;
    scale: 0.8;
  }
}
```

### inset-area による位置指定

```css
/* 上部中央 */
#tooltip {
  inset-area: top;
}

/* 右側中央 */
#tooltip {
  inset-area: right;
}

/* 下部左寄せ */
#tooltip {
  inset-area: bottom left;
}

/* 左側上寄せ */
#tooltip {
  inset-area: left top;
}
```

### フォールバック位置（try-fallbacks）

画面端でツールチップがはみ出す場合、自動的に位置を変更：

```css
@position-try --fallback-top {
  inset-area: top;
}

@position-try --fallback-bottom {
  inset-area: bottom;
}

@position-try --fallback-left {
  inset-area: left;
}

@position-try --fallback-right {
  inset-area: right;
}

#tooltip {
  inset-area: top; /* デフォルト */
  position-try-fallbacks:
    --fallback-bottom,
    --fallback-left,
    --fallback-right;
}
```

### フォーカス時の表示

```javascript
trigger.addEventListener('focus', () => {
  tooltip.showPopover();
});

trigger.addEventListener('blur', () => {
  tooltip.hidePopover();
});
```

### 遅延表示（ユーザビリティ向上）

```javascript
let showTimeout;
let hideTimeout;

trigger.addEventListener('mouseenter', () => {
  clearTimeout(hideTimeout);
  showTimeout = setTimeout(() => {
    tooltip.showPopover();
  }, 500); // 0.5秒後に表示
});

trigger.addEventListener('mouseleave', () => {
  clearTimeout(showTimeout);
  hideTimeout = setTimeout(() => {
    tooltip.hidePopover();
  }, 100); // 0.1秒後に非表示
});
```

### マルチトリガー対応

```html
<button class="help-trigger" data-tooltip="tooltip1">ヘルプ1</button>
<span popover="hint" id="tooltip1">説明1</span>

<button class="help-trigger" data-tooltip="tooltip2">ヘルプ2</button>
<span popover="hint" id="tooltip2">説明2</span>
```

```javascript
document.querySelectorAll('.help-trigger').forEach(trigger => {
  const tooltipId = trigger.dataset.tooltip;
  const tooltip = document.getElementById(tooltipId);

  trigger.addEventListener('mouseenter', () => {
    tooltip.showPopover();
  });

  trigger.addEventListener('mouseleave', () => {
    tooltip.hidePopover();
  });
});
```

### リッチコンテンツのツールチップ

```html
<span popover="hint" id="rich-tooltip">
  <div class="hint__inner">
    <h4>ショートカットキー</h4>
    <ul>
      <li><kbd>Ctrl</kbd> + <kbd>C</kbd>: コピー</li>
      <li><kbd>Ctrl</kbd> + <kbd>V</kbd>: ペースト</li>
    </ul>
  </div>
</span>
```

```css
#rich-tooltip {
  max-width: 300px;
  background: white;
  color: #333;
  border: 1px solid #ddd;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 1rem;
}

#rich-tooltip h4 {
  margin-top: 0;
  font-size: 1rem;
}

#rich-tooltip ul {
  list-style: none;
  padding: 0;
  margin: 0.5rem 0 0;
}

#rich-tooltip kbd {
  padding: 2px 6px;
  background: #f5f5f5;
  border: 1px solid #ccc;
  border-radius: 3px;
  font-family: monospace;
}
```

### アクセシビリティ配慮

```html
<!-- aria-describedby で関連付け -->
<button id="trigger" aria-describedby="tooltip">
  ヘルプ
</button>

<span popover="hint" id="tooltip" role="tooltip">
  説明テキスト
</span>
```

```javascript
// スクリーンリーダー対応
trigger.addEventListener('focus', () => {
  tooltip.showPopover();
  trigger.setAttribute('aria-expanded', 'true');
});

trigger.addEventListener('blur', () => {
  tooltip.hidePopover();
  trigger.setAttribute('aria-expanded', 'false');
});
```

### モバイル対応

```javascript
// タッチデバイスではクリックで表示/非表示を切り替え
let isTouch = false;

trigger.addEventListener('touchstart', () => {
  isTouch = true;
});

trigger.addEventListener('click', (e) => {
  if (isTouch) {
    e.preventDefault();
    if (tooltip.matches(':popover-open')) {
      tooltip.hidePopover();
    } else {
      tooltip.showPopover();
    }
  }
});
```

### ダークモード対応

```css
#tooltip {
  background: #333;
  color: white;
}

@media (prefers-color-scheme: dark) {
  #tooltip {
    background: #e0e0e0;
    color: #222;
  }

  #tooltip::before {
    border-top-color: #e0e0e0;
  }
}
```

### ブラウザサポート

**対応状況**（2026年1月時点）:
- ✅ Chrome 133+
- ✅ Edge 133+
- ❌ Safari（未対応）
- ❌ Firefox（未対応）

### フォールバック対応

```javascript
// popover="hint" 未対応ブラウザ向け
if (!('popover' in HTMLElement.prototype)) {
  // フォールバック: 手動でクラス切り替え
  trigger.addEventListener('mouseenter', () => {
    tooltip.classList.add('visible');
  });

  trigger.addEventListener('mouseleave', () => {
    tooltip.classList.remove('visible');
  });
}
```

```css
/* フォールバック用スタイル */
#tooltip.visible {
  display: block;
}

#tooltip:not(.visible) {
  display: none;
}
```

### ユースケース

- **ヘルプアイコン**: 説明テキストの表示
- **フォームフィールド**: 入力ヒント
- **ボタン**: 機能説明
- **アイコン**: ラベル表示
- **略語**: 完全な表記の表示

### 注意点

- **パフォーマンス**: 大量のツールチップは遅延初期化を検討
- **位置調整**: `inset-area` と `position-try-fallbacks` で画面端対応
- **モバイル**: タッチデバイスではhoverが使えないため、クリック対応必須

### auto, manual との使い分け

```
ツールチップ・ヘルプテキスト → hint（推奨）
メニュー・ダイアログ → auto
トースト通知・永続UI → manual
```

### 参考資料

- [Popover API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Popover_API)
- [CSS Anchor Positioning - W3C Draft](https://drafts.csswg.org/css-anchor-position-1/)

---
