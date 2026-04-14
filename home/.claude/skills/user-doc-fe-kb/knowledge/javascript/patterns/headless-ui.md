# ヘッドレスUI（Headless UI）

## 概要

ヘッドレスUIとは、スタイルを含まない、機能とアクセシビリティに特化したUIコンポーネントライブラリのアプローチ。ロジックとアクセシビリティの実装を提供しながら、見た目は完全に開発者に委ねる設計哲学。

WAI-ARIAパターンとキーボードナビゲーションを自動的に処理し、開発者はスタイリングとカスタマイズに集中できる。

---

## 主要なヘッドレスUIライブラリ

### Radix UI

**特徴:**

- WAI-ARIAデザインパターンに完全準拠
- デフォルトで完全にスタイルなし
- フルキーボードナビゲーション対応
- 広範なブラウザとスクリーンリーダーでテスト済み

**パッケージ:**

```bash
npm install @radix-ui/react-dialog
npm install @radix-ui/react-dropdown-menu
npm install @radix-ui/react-popover
```

**基本的な使い方（Dialog例）:**

```tsx
import * as Dialog from '@radix-ui/react-dialog';

function MyDialog() {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button>設定を開く</button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay" />
        <Dialog.Content className="dialog-content">
          <Dialog.Title>設定</Dialog.Title>
          <Dialog.Description>
            アプリケーションの設定を変更します
          </Dialog.Description>
          {/* コンテンツ */}
          <Dialog.Close asChild>
            <button>閉じる</button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
```

**スタイリング（TailwindCSS例）:**

```tsx
<Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
<Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-6 shadow-xl max-w-md w-full">
  {/* ... */}
</Dialog.Content>
```

**利点:**

- shadcn/uiなど多くのライブラリの基盤として採用
- Radix Themes（プリスタイル版）も提供
- 25k+ GitHub stars、高い人気

---

### Headless UI

**特徴:**

- Tailwind Labs製（Tailwind CSSとの統合を想定）
- React、Vue対応
- 完全にアクセシブル
- シンプルなAPI

**パッケージ:**

```bash
npm install @headlessui/react
```

**基本的な使い方（Menu例）:**

```tsx
import { Menu } from '@headlessui/react';

function MyDropdown() {
  return (
    <Menu as="div" className="relative">
      <Menu.Button className="btn">オプション</Menu.Button>
      <Menu.Items className="absolute mt-2 bg-white shadow-lg rounded-md">
        <Menu.Item>
          {({ active }) => (
            <a
              className={`block px-4 py-2 ${active ? 'bg-blue-500 text-white' : 'text-gray-900'}`}
              href="/account"
            >
              アカウント
            </a>
          )}
        </Menu.Item>
        <Menu.Item>
          {({ active }) => (
            <a
              className={`block px-4 py-2 ${active ? 'bg-blue-500 text-white' : 'text-gray-900'}`}
              href="/settings"
            >
              設定
            </a>
          )}
        </Menu.Item>
      </Menu.Items>
    </Menu>
  );
}
```

**利点:**

- Tailwind CSSとの統合が容易
- 1.35M weekly downloads（npm）
- シンプルで学習コストが低い

---

### React Aria

**特徴:**

- Adobeが開発
- 最も包括的なWAI-ARIAパターン実装
- 国際化（i18n）対応
- モバイル対応

**パッケージ:**

```bash
npm install react-aria
```

**基本的な使い方（Button例）:**

```tsx
import { useButton } from 'react-aria';
import { useRef } from 'react';

function MyButton(props) {
  const ref = useRef(null);
  const { buttonProps } = useButton(props, ref);

  return (
    <button {...buttonProps} ref={ref} className="btn">
      {props.children}
    </button>
  );
}
```

**利点:**

- 最も堅牢なアクセシビリティ実装
- 複雑なWAI-ARIAパターンを自動処理
- Adobe Spectrumのベース

---

## WAI-ARIAパターンとの関係

ヘッドレスUIライブラリは、WAI-ARIA Authoring Practices Guide（APG）のパターンを実装している。

**主要なパターン:**

| コンポーネント | WAI-ARIAパターン | 対応ライブラリ |
|---------------|------------------|---------------|
| Dialog | `role="dialog"`, `aria-modal="true"`, フォーカストラップ | Radix, Headless UI, React Aria |
| Menu | `role="menu"`, 矢印キーナビゲーション | Radix, Headless UI, React Aria |
| Combobox | `role="combobox"`, `aria-expanded`, `aria-autocomplete` | Radix, Headless UI, React Aria |
| Tabs | `role="tablist"`, `role="tab"`, `role="tabpanel"` | Radix, Headless UI, React Aria |
| Accordion | `role="region"`, `aria-expanded` | Radix, Headless UI, React Aria |

**自動処理される機能:**

- **キーボードナビゲーション**: Tab、Enter、Space、矢印キー
- **フォーカス管理**: フォーカストラップ、初期フォーカス、フォーカス復帰
- **ARIA属性**: `aria-expanded`, `aria-hidden`, `aria-labelledby`等
- **スクリーンリーダー対応**: 適切なロール、ラベル、状態の通知

---

## アクセシビリティ考慮事項

### ヘッドレスUIを使うべき理由

WAI-ARIA標準に準拠したアクセシブルなコンポーネントを作成するのは大きな作業。ヘッドレスUIライブラリは、以下を自動的に処理する:

1. **キーボードナビゲーション**
   - Tab順序の管理
   - 矢印キー、Enter、Space、Escapeキーの処理
   - フォーカストラップ（モーダル内でフォーカスを閉じ込める）

2. **スクリーンリーダー対応**
   - 適切なARIAロールとプロパティ
   - ライブリージョン（`aria-live`）
   - 状態の通知（開閉、選択、展開）

3. **フォーカス管理**
   - モーダル開閉時のフォーカス移動
   - フォーカスの復帰（モーダルを閉じたら元の位置に戻る）
   - 初期フォーカスの設定

### 実装例: アクセシブルなDialog

```tsx
import * as Dialog from '@radix-ui/react-dialog';

function AccessibleDialog() {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button aria-label="設定ダイアログを開く">
          設定
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        {/* 背景をクリックしたら閉じる */}
        <Dialog.Overlay className="dialog-overlay" />
        <Dialog.Content
          className="dialog-content"
          aria-describedby="dialog-description"
        >
          {/* スクリーンリーダーが最初に読み上げる */}
          <Dialog.Title>設定</Dialog.Title>

          {/* 説明文 */}
          <Dialog.Description id="dialog-description">
            アプリケーションの設定を変更できます
          </Dialog.Description>

          {/* コンテンツ */}
          <form>
            <label>
              テーマ
              <select>
                <option>ライト</option>
                <option>ダーク</option>
              </select>
            </label>
          </form>

          {/* 閉じるボタン */}
          <Dialog.Close asChild>
            <button aria-label="ダイアログを閉じる">
              閉じる
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
```

**自動処理される機能:**

- Escキーでダイアログを閉じる
- 背景クリックでダイアログを閉じる
- フォーカスをダイアログ内に閉じ込める（外部にフォーカスが移動しない）
- ダイアログを閉じたら、元のトリガーボタンにフォーカスが戻る
- `aria-modal="true"`が自動的に設定される
- 背景コンテンツが`inert`になる（スクリーンリーダーから隠れる）

---

## ライブラリ比較

| 観点 | Radix UI | Headless UI | React Aria |
|------|----------|-------------|------------|
| **スタイル** | 完全にスタイルなし | 完全にスタイルなし | 完全にスタイルなし |
| **WAI-ARIA準拠** | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |
| **学習コスト** | 中 | 低 | 高 |
| **国際化** | なし | なし | あり（組み込み） |
| **フレームワーク** | React | React, Vue | React |
| **人気度（GitHub stars）** | 25k+ | 25k+ | 12k+ |
| **週間DL（npm）** | 1M+ | 1.35M+ | 500k+ |
| **推奨ケース** | React、柔軟性重視 | Tailwind CSS使用時 | 最高のa11y、Adobe製品 |

---

## ブラウザサポート

**Radix UI:**

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**Headless UI:**

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**React Aria:**

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- iOS Safari 14+（モバイル最適化）

**注意:** すべてモダンブラウザのみサポート。IE11非対応。

---

## まとめ

**ヘッドレスUIを選ぶべき場合:**

- 独自のデザインシステムを構築したい
- Tailwind CSS等でスタイリングする
- WAI-ARIA準拠のアクセシビリティが必須
- キーボードナビゲーションを自動処理したい

**選び方:**

```
Tailwind CSSを使う？
  YES → Headless UI（公式統合）
  NO  → 次へ

最高のアクセシビリティと国際化が必要？
  YES → React Aria
  NO  → Radix UI（バランス良い、人気高い）
```

---

## 出典

- [15 Best React UI Libraries for 2026 - Builder.io](https://www.builder.io/blog/react-component-libraries-2026)
- [Headless UI alternatives: Radix Primitives, React Aria, Ark UI - LogRocket Blog](https://blog.logrocket.com/headless-ui-alternatives-radix-primitives-react-aria-ark-ui/)
- [Radix UI adoption guide: Overview, examples, and alternatives - LogRocket Blog](https://blog.logrocket.com/radix-ui-adoption-guide/)
- [Top 7 Headless UI Libraries for React Developers - DEV Community](https://dev.to/joodi/top-6-headless-ui-libraries-for-react-developers-3mfi)
- [Navigating the World of Accessibility: React ARIA vs Radix UI - DhiWise](https://www.dhiwise.com/post/react-aria-vs-radix-ui-what-best-ui-toolkit)
- [WAI-ARIA Authoring Practices Guide (APG)](https://www.w3.org/WAI/ARIA/apg/)
