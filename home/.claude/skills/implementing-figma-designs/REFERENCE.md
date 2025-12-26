# Figma 実装リファレンス

このファイルは、Figma デザインをコードに落とし込む際のリファレンスを提供します。

---

## スタイルシステムとの統合

### CSS Variables（カスタムプロパティ）

```css
:root {
  /* Colors */
  --color-primary-500: #0A84FF;
  --color-primary-600: #0070E0;
  --color-text-default: #0B1220;
  --color-background: #F8FAFF;

  /* Spacing */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-6: 24px;
  --space-8: 32px;

  /* Typography */
  --font-family-base: 'Inter', sans-serif;
  --font-size-sm: 14px;
  --font-size-md: 16px;
  --font-size-lg: 18px;
  --font-size-xl: 24px;
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-bold: 700;
  --line-height-tight: 1.25;
  --line-height-normal: 1.5;

  /* Border Radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-full: 9999px;

  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.08);
}
```

---

## Tailwind CSS マッピング

### 色

| Figma トークン | Tailwind クラス |
|---------------|----------------|
| primary/500 | `text-blue-500`, `bg-blue-500` |
| text/default | `text-gray-900` |
| background | `bg-gray-50` |

### スペーシング

| Figma 値 | Tailwind クラス |
|----------|----------------|
| 4px | `p-1`, `m-1`, `gap-1` |
| 8px | `p-2`, `m-2`, `gap-2` |
| 12px | `p-3`, `m-3`, `gap-3` |
| 16px | `p-4`, `m-4`, `gap-4` |
| 24px | `p-6`, `m-6`, `gap-6` |
| 32px | `p-8`, `m-8`, `gap-8` |

### タイポグラフィ

| Figma スタイル | Tailwind クラス |
|---------------|----------------|
| Heading/LG (28px/700) | `text-2xl font-bold` |
| Body/MD (16px/400) | `text-base font-normal` |
| Caption/SM (14px/400) | `text-sm font-normal` |

### Auto Layout → Flexbox

| Figma 設定 | Tailwind クラス |
|-----------|----------------|
| Horizontal | `flex flex-row` |
| Vertical | `flex flex-col` |
| Space between | `justify-between` |
| Center | `justify-center items-center` |
| Gap 8px | `gap-2` |
| Padding 16px | `p-4` |

---

## コンポーネント実装パターン

### ボタン

**Figma 設計**:

- Variant: primary, secondary, ghost
- Size: sm, md, lg
- State: default, hover, focus, disabled

**React 実装**:

```tsx
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  disabled = false,
  children,
  onClick,
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';

  const variantStyles = {
    primary: 'bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-500',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm rounded-md',
    md: 'px-4 py-2 text-base rounded-lg',
    lg: 'px-6 py-3 text-lg rounded-lg',
  };

  const disabledStyles = 'opacity-50 cursor-not-allowed';

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${disabled ? disabledStyles : ''}`}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
};
```

### カード

**Figma 設計**:

- Container: padding 24px, border-radius 12px, shadow
- Layout: vertical stack, gap 16px

**React 実装**:

```tsx
interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div
      className={`bg-white p-6 rounded-xl shadow-lg space-y-4 ${className}`}
    >
      {children}
    </div>
  );
};
```

### 入力フィールド

**Figma 設計**:

- State: default, focus, error, disabled
- Padding: 12px 16px
- Border: 1px gray, focus時 blue

**React 実装**:

```tsx
interface InputProps {
  label: string;
  error?: string;
  disabled?: boolean;
  value: string;
  onChange: (value: string) => void;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  disabled = false,
  value,
  onChange,
}) => {
  const baseStyles = 'w-full px-4 py-3 border rounded-lg transition-colors';
  const stateStyles = error
    ? 'border-red-500 focus:ring-red-500'
    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500';
  const disabledStyles = 'bg-gray-100 cursor-not-allowed';

  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        type="text"
        className={`${baseStyles} ${stateStyles} ${disabled ? disabledStyles : ''} focus:outline-none focus:ring-2`}
        disabled={disabled}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
};
```

---

## アクセシビリティチェックリスト

### 色

- [ ] コントラスト比が WCAG AA 基準（4.5:1）を満たしているか
- [ ] 色だけで情報を伝えていないか（アイコンやテキストも併用）

### インタラクション

- [ ] すべてのインタラクティブ要素がキーボードでアクセス可能か
- [ ] フォーカス状態が視覚的に明確か
- [ ] Tab キーでの移動順序が論理的か

### セマンティクス

- [ ] 適切な HTML 要素を使用しているか
- [ ] 必要な ARIA 属性が設定されているか
- [ ] 画像に alt テキストがあるか

### フォーム

- [ ] ラベルが入力フィールドに関連付けられているか
- [ ] エラーメッセージが明確で、どう修正すべきかわかるか
- [ ] 必須フィールドが明示されているか

---

## 実装チェックリスト

### ビジュアル

- [ ] 色が Figma と一致しているか
- [ ] フォントサイズ・ウェイトが一致しているか
- [ ] スペーシング（padding, margin, gap）が一致しているか
- [ ] 角丸・影が一致しているか

### インタラクション

- [ ] すべての状態（hover, focus, active, disabled）が実装されているか
- [ ] アニメーション・トランジションが適切か
- [ ] クリック/タップ領域が十分か（最小 44x44px）

### レスポンシブ

- [ ] 各ブレークポイントでの表示が正しいか
- [ ] テキストが折り返されても崩れないか
- [ ] 画像が適切にスケールするか
