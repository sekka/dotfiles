---
title: アクセシビリティ対応タブメニュー
category: html
tags: [tabs, aria, accessibility, keyboard-navigation, hidden-until-found, 2025]
browser_support: モダンブラウザ
created: 2026-01-19
updated: 2026-01-19
---

# アクセシビリティ対応タブメニュー

> 出典: https://www.tak-dcxi.com/article/accessibility-conscious-tab-menu
> 執筆日: 2025年
> 追加日: 2026-01-19

ARIA属性と`hidden="until-found"`を活用したアクセシビリティ重視のタブメニュー実装。ページ内検索やSEO、キーボード操作に完全対応します。

## 主な技術

- **ARIA属性** - `role="tab"`, `aria-controls`, `aria-selected`
- **`hidden="until-found"`** - ページ内検索対応の非表示
- **キーボードナビゲーション** - 矢印キー、Home/Endキー
- **beforematchイベント** - 検索時の自動タブ切り替え

## 基本実装

### HTML構造

```html
<div class="tabs">
  <!-- タブリスト -->
  <div role="tablist" aria-label="コンテンツタブ">
    <a
      href="#panel1"
      role="tab"
      aria-selected="true"
      aria-controls="panel1"
      id="tab1"
    >
      タブ1
    </a>
    <a
      href="#panel2"
      role="tab"
      aria-selected="false"
      aria-controls="panel2"
      id="tab2"
    >
      タブ2
    </a>
    <a
      href="#panel3"
      role="tab"
      aria-selected="false"
      aria-controls="panel3"
      id="tab3"
    >
      タブ3
    </a>
  </div>

  <!-- タブパネル -->
  <div
    role="tabpanel"
    aria-labelledby="tab1"
    id="panel1"
  >
    <h2>タブ1の内容</h2>
    <p>コンテンツ...</p>
  </div>

  <div
    role="tabpanel"
    aria-labelledby="tab2"
    id="panel2"
    hidden="until-found"
  >
    <h2>タブ2の内容</h2>
    <p>コンテンツ...</p>
  </div>

  <div
    role="tabpanel"
    aria-labelledby="tab3"
    id="panel3"
    hidden="until-found"
  >
    <h2>タブ3の内容</h2>
    <p>コンテンツ...</p>
  </div>
</div>
```

### TypeScript実装

```typescript
const initializeTabs = () => {
  const tabLists = document.querySelectorAll('[role="tablist"]');

  tabLists.forEach((tabList) => {
    const tabs = Array.from(tabList.querySelectorAll('[role="tab"]'));

    tabs.forEach((tab, index) => {
      const isSelected = tab.getAttribute('aria-selected') === 'true';

      // tabindexの設定
      tab.setAttribute('tabindex', isSelected ? '0' : '-1');

      // クリックイベント
      tab.addEventListener('click', (e) => {
        e.preventDefault();
        activateTab(tab as HTMLAnchorElement, tabs);
      });

      // キーボードイベント
      tab.addEventListener('keydown', (e) => {
        handleTabKeydown(e as KeyboardEvent, tabs, index);
      });
    });

    // タブパネルの設定
    const panels = tabs.map((tab) => {
      const panelId = tab.getAttribute('aria-controls');
      return document.getElementById(panelId || '');
    });

    panels.forEach((panel, index) => {
      if (!panel) return;

      const isActive = tabs[index].getAttribute('aria-selected') === 'true';

      // アクティブなパネルのみtabindex="0"
      panel.setAttribute('tabindex', isActive ? '0' : '-1');

      // beforematchイベントで検索時の自動切り替え
      panel.addEventListener('beforematch', () => {
        activateTab(tabs[index] as HTMLAnchorElement, tabs);
      });
    });
  });
};

// タブを有効化
const activateTab = (
  tab: HTMLAnchorElement,
  tabs: Element[]
) => {
  const panelId = tab.getAttribute('aria-controls');
  const panel = document.getElementById(panelId || '');

  if (!panel) return;

  // すべてのタブを非アクティブに
  tabs.forEach((t) => {
    t.setAttribute('aria-selected', 'false');
    t.setAttribute('tabindex', '-1');

    const pId = t.getAttribute('aria-controls');
    const p = document.getElementById(pId || '');
    if (p) {
      p.setAttribute('hidden', 'until-found');
      p.setAttribute('tabindex', '-1');
    }
  });

  // 選択されたタブを有効化
  tab.setAttribute('aria-selected', 'true');
  tab.setAttribute('tabindex', '0');
  tab.focus();

  // パネルを表示
  panel.removeAttribute('hidden');
  panel.setAttribute('tabindex', '0');

  // URLフラグメント更新
  history.replaceState(null, '', `#${panelId}`);
};

// キーボードナビゲーション
const handleTabKeydown = (
  e: KeyboardEvent,
  tabs: Element[],
  currentIndex: number
) => {
  let newIndex = currentIndex;

  switch (e.key) {
    case 'ArrowLeft':
      e.preventDefault();
      newIndex = currentIndex - 1 < 0 ? tabs.length - 1 : currentIndex - 1;
      break;
    case 'ArrowRight':
      e.preventDefault();
      newIndex = currentIndex + 1 >= tabs.length ? 0 : currentIndex + 1;
      break;
    case 'Home':
      e.preventDefault();
      newIndex = 0;
      break;
    case 'End':
      e.preventDefault();
      newIndex = tabs.length - 1;
      break;
    default:
      return;
  }

  activateTab(tabs[newIndex] as HTMLAnchorElement, tabs);
};

// 初期化
document.addEventListener('DOMContentLoaded', initializeTabs);
```

## ARIA属性の役割

### role="tab"

タブとして機能することを示します。

```html
<a href="#panel1" role="tab">タブ1</a>
```

### role="tablist"

タブのコンテナを示します。

```html
<div role="tablist" aria-label="コンテンツタブ">
  <!-- タブ -->
</div>
```

### role="tabpanel"

タブに関連付けられたパネルを示します。

```html
<div role="tabpanel" aria-labelledby="tab1" id="panel1">
  <!-- コンテンツ -->
</div>
```

### aria-selected

タブの選択状態を示します。

```html
<!-- 選択中 -->
<a role="tab" aria-selected="true">タブ1</a>

<!-- 非選択 -->
<a role="tab" aria-selected="false">タブ2</a>
```

### aria-controls

タブが制御するパネルのIDを指定します。

```html
<a role="tab" aria-controls="panel1">タブ1</a>

<div id="panel1" role="tabpanel">
  <!-- パネル内容 -->
</div>
```

### aria-labelledby

パネルに関連付けられたタブを指定します。

```html
<a role="tab" id="tab1">タブ1</a>

<div role="tabpanel" aria-labelledby="tab1">
  <!-- パネル内容 -->
</div>
```

## hidden="until-found"の活用

### 通常のhidden属性との違い

| 属性 | ページ内検索 | SEO | フォーカス |
|------|------------|-----|----------|
| `hidden` | ✗ 検索不可 | ✗ | ✗ |
| `hidden="until-found"` | ○ 検索可能、自動表示 | ○ | ○（非表示でも） |

### beforematchイベント

```typescript
panel.addEventListener('beforematch', () => {
  // ページ内検索でヒットした際に自動でタブを切り替え
  activateTab(correspondingTab, tabs);
});
```

ブラウザのページ内検索（Ctrl+F/Cmd+F）で該当パネルに自動切り替えします。

### フォールバック実装

```css
/* hidden="until-found"非対応環境用 */
[role="tabpanel"][hidden] {
  display: none;
}

/* :target擬似クラスでフォールバック */
[role="tabpanel"][hidden]:target {
  display: revert;
}
```

## キーボードナビゲーション

### サポートするキー

| キー | 動作 |
|------|------|
| `ArrowLeft` | 前のタブへ移動 |
| `ArrowRight` | 次のタブへ移動 |
| `Home` | 最初のタブへ移動 |
| `End` | 最後のタブへ移動 |
| `Tab` | 次のフォーカス可能要素へ |
| `Shift+Tab` | 前のフォーカス可能要素へ |

### tabindex管理

```typescript
// アクティブなタブのみtabindex="0"
tab.setAttribute('tabindex', isSelected ? '0' : '-1');

// アクティブなパネルのみtabindex="0"
panel.setAttribute('tabindex', isActive ? '0' : '-1');
```

**理由**: `hidden="until-found"`は非表示要素でもフォーカス可能なため、アクティブパネルのみに`tabindex="0"`を設定します。

## 実装時の注意点

### 1. リスト要素使用時のrole="presentation"

```html
<ul role="tablist">
  <li role="presentation">
    <a role="tab">タブ1</a>
  </li>
  <li role="presentation">
    <a role="tab">タブ2</a>
  </li>
</ul>
```

**重要**: VoiceOverでのタブ個数読み上げ確保のため、`<li>`に`role="presentation"`が必須です。

### 2. tabindexの動的管理

```typescript
// ❌ マークアップで直接指定しない
<a role="tab" tabindex="0">タブ1</a>

// ✅ JS初期化時に属性付与
tab.setAttribute('tabindex', isSelected ? '0' : '-1');
```

**理由**: JS無効時のフォールバック性を確保するため。

### 3. a要素の使用

```html
<!-- ✅ 推奨：a要素 -->
<a href="#panel1" role="tab">タブ1</a>

<!-- ❌ 非推奨：button要素 -->
<button role="tab">タブ1</button>
```

**理由**:
- URLフラグメントとの統合が容易
- ブラウザの戻る/進む機能が使える
- ブックマーク可能

### 4. JavaScript無効時の対応

```css
/* JavaScript無効時は全パネルを表示 */
@media (scripting: none) {
  [role="tabpanel"][hidden] {
    display: block !important;
  }
}
```

または`<noscript>`タグを使用：

```html
<noscript>
  <style>
    [role="tabpanel"][hidden] {
      display: block !important;
    }
  </style>
</noscript>
```

## CSS実装

```css
/* タブリスト */
[role="tablist"] {
  display: flex;
  border-bottom: 2px solid #e5e7eb;
  gap: 0.5rem;
}

/* タブ */
[role="tab"] {
  padding: 0.75rem 1.5rem;
  border: none;
  background: transparent;
  color: #6b7280;
  text-decoration: none;
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
}

[role="tab"]:hover {
  color: #111827;
  background-color: #f9fafb;
}

[role="tab"][aria-selected="true"] {
  color: #3b82f6;
  border-bottom-color: #3b82f6;
  font-weight: 600;
}

[role="tab"]:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* タブパネル */
[role="tabpanel"] {
  padding: 1.5rem;
}

[role="tabpanel"][hidden] {
  display: none;
}

/* アニメーション */
@media (prefers-reduced-motion: no-preference) {
  [role="tabpanel"] {
    animation: fade-in 0.3s ease-out;
  }
}

@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
```

## ブラウザ対応

| 機能 | Chrome | Firefox | Safari |
|------|--------|---------|--------|
| ARIA属性 | ○ | ○ | ○ |
| `hidden="until-found"` | 102+ | ✗ | TP 152+ |
| `beforematch`イベント | 102+ | ✗ | TP 152+ |

**注意**: `hidden="until-found"`は比較的新しい機能です。フォールバック実装が推奨されます。

## ユースケース

- 複数情報セットの効率的な表示
- 検索結果内の該当タブへの自動切り替え
- キーボードユーザーのナビゲーション効率化
- SEOとアクセシビリティの両立

## 関連ナレッジ

- [モダンHTML](./modern-html.md)
- [WAI-ARIA基礎](../cross-cutting/accessibility/wai-aria-basics.md)
- [hidden="until-found"](./details-animation-2025.md)

## 参考リンク

- [ARIA: tab role](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/tab_role)
- [MDN: hidden="until-found"](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/hidden)
- [MDN: beforematch event](https://developer.mozilla.org/en-US/docs/Web/API/Element/beforematch_event)
- [W3C: ARIA Authoring Practices - Tabs Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/)
