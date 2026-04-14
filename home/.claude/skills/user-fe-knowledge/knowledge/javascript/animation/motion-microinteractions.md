# Motion Microinteractions with React

## 概要

**Motion**（旧Framer Motion）を使ったReactアプリケーションでのマイクロインタラクション実装ガイド。宣言的なアプローチでスムーズな60fps アニメーションを実現する。

---

## セットアップ

### インストール

```bash
npm install motion
```

### 基本インポート

```javascript
import { motion } from "motion/react";
```

---

## 基本パターン

### 1. クリックフィードバックボタン

**`whileTap` プロップでタップ時の視覚フィードバック**

```jsx
import { motion } from "motion/react";

function Button() {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.1 }}
    >
      クリック
    </motion.button>
  );
}
```

**ポイント:**
- `whileTap`: タップ中の状態を定義
- `scale: 0.95`: 95%に縮小（触覚的フィードバック）
- `duration: 0.1`: 0.1秒で即座に反応

---

### 2. リップルエフェクト

**`key` プロップでアニメーションをリセット**

```jsx
import { motion } from "motion/react";
import { useState } from "react";

function RippleButton() {
  const [rippleKey, setRippleKey] = useState(0);

  const handleClick = () => {
    setRippleKey(prev => prev + 1);
  };

  return (
    <button onClick={handleClick} style={{ position: 'relative', overflow: 'hidden' }}>
      <motion.div
        key={rippleKey}
        initial={{ scale: 0, opacity: 1 }}
        animate={{ scale: 2, opacity: 0 }}
        transition={{ duration: 0.6 }}
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.5)',
        }}
      />
      リップル
    </button>
  );
}
```

**ポイント:**
- **`key` プロップでアニメーションリセット**: Reactが新しい要素として扱う
- `initial`: 開始状態（scale: 0, opacity: 1）
- `animate`: 終了状態（scale: 2, opacity: 0）
- クリックごとに波紋が再生

---

### 3. モーダルダイアログ

**`variants` で入退場アニメーション定義**

```jsx
import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";

const modalVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.8 }
};

function Modal() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)}>モーダルを開く</button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onAnimationComplete={() => {
              // 退場アニメーション完了後にクローズ
            }}
            transition={{ duration: 0.3 }}
          >
            <h2>モーダルタイトル</h2>
            <button onClick={() => setIsOpen(false)}>閉じる</button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
```

**ポイント:**
- **`variants`**: 複数の状態を定義
- **`AnimatePresence`**: DOM削除時の `exit` アニメーションを有効化
- **`onAnimationComplete`**: アニメーション完了後のコールバック（重要: アニメーション後にcloseを呼ぶ）

---

### 4. アコーディオン展開

**高さとopacityを同時にアニメーション**

```jsx
import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";

function Accordion() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <button onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? '▼' : '▶'} 詳細を表示
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{ overflow: 'hidden' }}
          >
            <p>アコーディオンの内容</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
```

**ポイント:**
- **`height: 'auto'`**: コンテンツに応じた高さ
- **`overflow: 'hidden'`**: アニメーション中のはみ出し防止
- **`AnimatePresence`**: 閉じるアニメーションを有効化

---

### 5. セグメントボタン

**`variants` と状態でスムーズな背景移動**

```jsx
import { motion } from "motion/react";
import { useState } from "react";

const segments = ['オプション1', 'オプション2', 'オプション3'];

const backgroundVariants = {
  0: { x: 0 },
  1: { x: '100%' },
  2: { x: '200%' }
};

function SegmentButton() {
  const [activeSegment, setActiveSegment] = useState(0);

  return (
    <div style={{ position: 'relative', display: 'flex' }}>
      <motion.div
        variants={backgroundVariants}
        animate={activeSegment}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        style={{
          position: 'absolute',
          width: '33.333%',
          height: '100%',
          background: 'blue',
          borderRadius: '8px',
        }}
      />

      {segments.map((segment, index) => (
        <button
          key={index}
          onClick={() => setActiveSegment(index)}
          style={{ flex: 1, position: 'relative', zIndex: 1 }}
        >
          {segment}
        </button>
      ))}
    </div>
  );
}
```

**ポイント:**
- **状態値をvariantsにマップ**: `animate={activeSegment}` で 0/1/2 に応じて背景を移動
- **`type: 'spring'`**: バネアニメーション（自然な動き）

---

## 高度なテクニック

### スクロールトリガーアニメーション

**`whileInView` でビューポート進入時にアニメーション**

```jsx
import { motion } from "motion/react";

function ScrollReveal() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ amount: 0.4, once: true }}
      transition={{ duration: 0.6 }}
    >
      スクロールで表示
    </motion.div>
  );
}
```

**ポイント:**
- **`whileInView`**: ビューポート内に入ったら実行
- **`viewport.amount`**: 要素の40%が見えたら発火
- **`viewport.once`**: 一度だけ実行（再スクロールでは発火しない）

---

### スタッガーリスト（順次表示）

**`stagger()` で子要素を順次アニメーション**

```jsx
import { motion } from "motion/react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1, // 0.1秒ずつ遅延
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 }
};

function StaggeredList() {
  const items = ['アイテム1', 'アイテム2', 'アイテム3'];

  return (
    <motion.ul
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {items.map((item, index) => (
        <motion.li key={index} variants={itemVariants}>
          {item}
        </motion.li>
      ))}
    </motion.ul>
  );
}
```

**ポイント:**
- **`staggerChildren`**: 子要素のアニメーション開始を遅延
- 親の `variants` で `transition.staggerChildren` を設定
- 子要素は自動的に順次アニメーション

---

### 数値カウンターアニメーション

**`useMotionValue()` と `useTransform()` で数値をアニメーション**

```jsx
import { motion, useMotionValue, useTransform, animate } from "motion/react";
import { useEffect } from "react";

function Counter({ target = 100 }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));

  useEffect(() => {
    const controls = animate(count, target, { duration: 2 });
    return controls.stop;
  }, [target]);

  return (
    <motion.div>
      <motion.span>{rounded}</motion.span>
    </motion.div>
  );
}
```

**ポイント:**
- **`useMotionValue()`**: アニメーション可能な値を作成
- **`useTransform()`**: 値を変換（小数を整数に丸める）
- **`animate()`**: プログラムでアニメーション実行

---

### SVG パスアニメーション

**`pathLength` でSVGパスを描画**

```jsx
import { motion } from "motion/react";

function DrawSVG() {
  return (
    <svg width="200" height="200">
      <motion.path
        d="M 10 80 Q 95 10 180 80"
        stroke="black"
        strokeWidth="3"
        fill="transparent"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 2, ease: "easeInOut" }}
      />
    </svg>
  );
}
```

**ポイント:**
- **`pathLength`**: 0（非表示）→ 1（完全表示）
- SVGの描画アニメーション

---

## パフォーマンスベストプラクティス

### 1. `transform` プロパティを優先

**GPU最適化される `transform` を使用**

```jsx
// ✅ Good: transformを使用（GPU加速）
<motion.div
  animate={{ x: 100, scale: 1.2, rotate: 45 }}
/>

// ❌ Bad: レイアウトプロパティ（再レンダリング発生）
<motion.div
  animate={{ left: '100px', width: '200px' }}
/>
```

**推奨プロパティ:**
- `x`, `y`, `scale`, `rotate`, `opacity`

**避けるべきプロパティ:**
- `left`, `top`, `width`, `height`, `margin`, `padding`

---

### 2. `transition` で滑らかさを制御

```jsx
<motion.div
  animate={{ x: 100 }}
  transition={{
    duration: 0.5,
    ease: "easeInOut"
  }}
/>
```

**イージング関数:**
- `linear`: 一定速度
- `easeIn`: 加速
- `easeOut`: 減速
- `easeInOut`: 加速→減速（最も自然）

---

### 3. `key` プロップでアニメーションリセット

**Reactの `key` プロップを使って効率的にリセット**

```jsx
// クリックごとにkeyを変更 → Reactが新しい要素として扱う
<motion.div
  key={clickCount}
  initial={{ scale: 0 }}
  animate={{ scale: 1 }}
/>
```

**メリット:**
- 複雑な状態管理不要
- Reactの仕組みを活用

---

### 4. `will-change` は不要

**Motion が自動的に最適化**

```jsx
// Motion が自動で will-change を適用するため不要
<motion.div animate={{ x: 100 }} />
```

---

## 実用例

### ボタンホバー + クリックフィードバック

```jsx
import { motion } from "motion/react";

function InteractiveButton() {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      style={{
        padding: '12px 24px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
      }}
    >
      クリック
    </motion.button>
  );
}
```

---

### トースト通知

```jsx
import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";

function Toast() {
  const [isVisible, setIsVisible] = useState(false);

  const showToast = () => {
    setIsVisible(true);
    setTimeout(() => setIsVisible(false), 3000);
  };

  return (
    <>
      <button onClick={showToast}>通知を表示</button>

      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.3 }}
            style={{
              position: 'fixed',
              top: '20px',
              right: '20px',
              padding: '16px',
              background: '#333',
              color: 'white',
              borderRadius: '8px',
            }}
          >
            操作が完了しました
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
```

---

## トラブルシューティング

### アニメーションが実行されない

**原因1: `AnimatePresence` の欠如**

```jsx
// ❌ Bad: exit アニメーションが動かない
{isOpen && <motion.div exit={{ opacity: 0 }} />}

// ✅ Good: AnimatePresence で囲む
<AnimatePresence>
  {isOpen && <motion.div exit={{ opacity: 0 }} />}
</AnimatePresence>
```

**原因2: `key` プロップがない（リスト内）**

```jsx
// ❌ Bad
{items.map(item => <motion.div>{item}</motion.div>)}

// ✅ Good
{items.map(item => <motion.div key={item.id}>{item}</motion.div>)}
```

---

### アニメーションがカクつく

**原因: レイアウトプロパティを使用**

```jsx
// ❌ Bad: width/height はリフロー発生
<motion.div animate={{ width: 200 }} />

// ✅ Good: scale を使用
<motion.div animate={{ scale: 1.2 }} />
```

---

## 参考資料

- **出典**: [React + Motionライブラリでマイクロインタラクション（ICS MEDIA）](https://ics.media/entry/251204/)
- **公式ドキュメント**: [Motion Documentation](https://motion.dev/)
- **旧Framer Motion**: [Framer Motion（レガシー）](https://www.framer.com/motion/)

---

## まとめ

- **宣言的アプローチ**: `initial` / `animate` / `exit` で状態を定義
- **`AnimatePresence`**: DOM削除時のアニメーションを有効化
- **`variants`**: 複数の状態を管理
- **`key` プロップ**: アニメーションリセットに活用
- **`transform` 優先**: GPU加速で60fps実現
- **Reactとの統合**: コンポーネントモデルとシームレスに連携
