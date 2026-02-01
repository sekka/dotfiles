---
title: VueUse - Vue.js Composition API ユーティリティ集
category: javascript/patterns
tags: [vue, composition-api, vueuse, composables, reactivity, hooks]
browser_support: Vue 3対応ブラウザ
created: 2026-02-01
updated: 2026-02-01
---

# VueUse - Vue.js Composition API ユーティリティ集

> 出典: https://ics.media/entry/230606/
> 執筆日: 2023-06-06
> 追加日: 2026-02-01

VueUseは「Vue.jsのComposition APIで構築された関数のパッケージ」。再利用可能なロジックをcomposable関数として提供します。

## 概要

**Composable関数とは**:
「Vue.jsのComposition APIを活用したステートフルな関数」で、リアクティブな値を返し、複数のコンポーネントでロジックを再利用できます。

**VueUseの特徴**:
- 200以上の便利な関数
- TypeScript完全対応
- Tree-shaking対応（使う関数のみバンドル）
- SSR対応

## インストール

```bash
npm install @vueuse/core
```

## 3つのカテゴリ

### 1. ブラウザAPI

ブラウザのAPIをVueのリアクティブシステムでラップ。

#### useMouse - マウス座標

```vue
<script setup>
import { useMouse } from '@vueuse/core';

const { x, y } = useMouse();
</script>

<template>
  <div>マウス座標: {{ x }}, {{ y }}</div>
</template>
```

**自動的にリアクティブ**: `x` と `y` はマウス移動に応じて自動更新されます。

#### useEventListener - イベントリスナー

```vue
<script setup>
import { ref } from 'vue';
import { useEventListener } from '@vueuse/core';

const count = ref(0);

// コンポーネントがアンマウントされると自動でクリーンアップ
useEventListener('click', () => {
  count.value++;
});
</script>

<template>
  <div>クリック回数: {{ count }}</div>
</template>
```

**従来の方法との比較**:

```vue
<!-- VueUse以前 -->
<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const count = ref(0);

const handleClick = () => {
  count.value++;
};

onMounted(() => {
  window.addEventListener('click', handleClick);
});

onUnmounted(() => {
  window.removeEventListener('click', handleClick);
});
</script>
```

VueUseなら3行で済みます。

#### useClipboard - クリップボード

```vue
<script setup>
import { useClipboard } from '@vueuse/core';

const { text, copy, copied, isSupported } = useClipboard();

const copyText = () => {
  copy('コピーされたテキスト');
};
</script>

<template>
  <div v-if="isSupported">
    <button @click="copyText">コピー</button>
    <p v-if="copied">コピーしました！</p>
    <p>クリップボード: {{ text }}</p>
  </div>
</template>
```

#### useWindowSize - ウィンドウサイズ

```vue
<script setup>
import { useWindowSize } from '@vueuse/core';

const { width, height } = useWindowSize();
</script>

<template>
  <div>
    ウィンドウサイズ: {{ width }} x {{ height }}
  </div>
</template>
```

**レスポンシブ対応**:

```vue
<script setup>
import { computed } from 'vue';
import { useWindowSize } from '@vueuse/core';

const { width } = useWindowSize();

const isMobile = computed(() => width.value < 768);
const isTablet = computed(() => width.value >= 768 && width.value < 1024);
const isDesktop = computed(() => width.value >= 1024);
</script>

<template>
  <div>
    <p v-if="isMobile">モバイル表示</p>
    <p v-else-if="isTablet">タブレット表示</p>
    <p v-else>デスクトップ表示</p>
  </div>
</template>
```

### 2. Reactiveユーティリティ

リアクティブシステムを拡張する便利な関数。

#### computedAsync - 非同期computed

```vue
<script setup>
import { ref } from 'vue';
import { computedAsync } from '@vueuse/core';

const userId = ref(1);

// 非同期処理の結果をcomputedとして扱える
const userProfile = computedAsync(
  async () => {
    const response = await fetch(`/api/users/${userId.value}`);
    return response.json();
  },
  { name: 'Loading...', email: '' } // 初期値
);
</script>

<template>
  <div>
    <p>名前: {{ userProfile.name }}</p>
    <p>メール: {{ userProfile.email }}</p>
  </div>
</template>
```

**従来の方法**:

```vue
<script setup>
import { ref, watch } from 'vue';

const userId = ref(1);
const userProfile = ref({ name: 'Loading...', email: '' });

watch(userId, async (newId) => {
  const response = await fetch(`/api/users/${newId}`);
  userProfile.value = await response.json();
}, { immediate: true });
</script>
```

`computedAsync` の方がシンプルで意図が明確です。

#### useToggle - boolean切り替え

```vue
<script setup>
import { useToggle } from '@vueuse/core';

const [isOpen, toggle] = useToggle();
</script>

<template>
  <button @click="toggle()">トグル</button>
  <p v-if="isOpen">開いています</p>
</template>
```

**引数で制御**:

```vue
<script setup>
import { useToggle } from '@vueuse/core';

const [isOpen, toggle] = useToggle();

// 明示的に開く/閉じる
const open = () => toggle(true);
const close = () => toggle(false);
</script>
```

#### useCounter - カウンター

```vue
<script setup>
import { useCounter } from '@vueuse/core';

const { count, inc, dec, set, reset } = useCounter(0, { min: 0, max: 10 });
</script>

<template>
  <div>
    <button @click="dec()">-</button>
    <span>{{ count }}</span>
    <button @click="inc()">+</button>
    <button @click="reset()">リセット</button>
  </div>
</template>
```

### 3. ユーティリティヘルパー

汎用的な便利関数。

#### promiseTimeout - タイムアウト付きPromise

```vue
<script setup>
import { ref } from 'vue';
import { promiseTimeout } from '@vueuse/core';

const status = ref('待機中');

const fetchWithTimeout = async () => {
  try {
    status.value = '取得中...';

    const result = await promiseTimeout(
      fetch('/api/data'),
      3000 // 3秒でタイムアウト
    );

    status.value = '成功';
  } catch (error) {
    status.value = 'タイムアウト';
  }
};
</script>
```

#### toReactive - refをreactiveに変換

```vue
<script setup>
import { toReactive, useMouse } from '@vueuse/core';

// useMouse() は { x: Ref<number>, y: Ref<number> } を返す
const mouse = toReactive(useMouse());

// mouse.x.value ではなく mouse.x でアクセス可能
console.log(mouse.x, mouse.y);
</script>
```

## 実用的なパターン

### カスタムComposableの作成

VueUseの思想を応用して、独自のcomposableを作成できます。

```typescript
// composables/useCounter.ts
import { ref, computed } from 'vue';

export function useCounter(initialValue = 0) {
  const count = ref(initialValue);

  const increment = () => {
    count.value++;
  };

  const decrement = () => {
    count.value--;
  };

  const reset = () => {
    count.value = initialValue;
  };

  const double = computed(() => count.value * 2);

  return {
    count,
    double,
    increment,
    decrement,
    reset,
  };
}
```

**使用例**:

```vue
<script setup>
import { useCounter } from './composables/useCounter';

const { count, double, increment, decrement, reset } = useCounter(10);
</script>

<template>
  <div>
    <p>カウント: {{ count }}</p>
    <p>2倍: {{ double }}</p>
    <button @click="increment">+</button>
    <button @click="decrement">-</button>
    <button @click="reset">リセット</button>
  </div>
</template>
```

### ロジックの抽出と再利用

**Before（ロジックがコンポーネントに散在）**:

```vue
<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const x = ref(0);
const y = ref(0);

const updateMouse = (event) => {
  x.value = event.pageX;
  y.value = event.pageY;
};

onMounted(() => {
  window.addEventListener('mousemove', updateMouse);
});

onUnmounted(() => {
  window.removeEventListener('mousemove', updateMouse);
});
</script>
```

**After（ロジックをcomposableに抽出）**:

```vue
<script setup>
import { useMouse } from '@vueuse/core';

const { x, y } = useMouse();
</script>
```

**メリット**:
- 複数コンポーネントで再利用可能
- テストが容易
- コードの見通しが良い

## よく使う関数一覧

### ブラウザAPI系

| 関数 | 説明 |
|------|------|
| `useMouse` | マウス座標 |
| `useWindowSize` | ウィンドウサイズ |
| `useEventListener` | イベントリスナー |
| `useClipboard` | クリップボード |
| `useLocalStorage` | localStorage |
| `useFetch` | fetch API |
| `useMediaQuery` | メディアクエリ |
| `useIntersectionObserver` | Intersection Observer |

### Reactive系

| 関数 | 説明 |
|------|------|
| `computedAsync` | 非同期computed |
| `useToggle` | boolean切り替え |
| `useCounter` | カウンター |
| `useDebounceFn` | デバウンス |
| `useThrottleFn` | スロットル |

### ユーティリティ系

| 関数 | 説明 |
|------|------|
| `promiseTimeout` | タイムアウト付きPromise |
| `toReactive` | refをreactiveに変換 |
| `until` | 条件待機 |

## パフォーマンス最適化

### useDebounceFn - デバウンス

```vue
<script setup>
import { ref } from 'vue';
import { useDebounceFn } from '@vueuse/core';

const searchQuery = ref('');
const results = ref([]);

// 500ms待ってから検索実行
const debouncedSearch = useDebounceFn(async () => {
  const response = await fetch(`/api/search?q=${searchQuery.value}`);
  results.value = await response.json();
}, 500);
</script>

<template>
  <input v-model="searchQuery" @input="debouncedSearch" placeholder="検索" />
  <ul>
    <li v-for="result in results" :key="result.id">{{ result.name }}</li>
  </ul>
</template>
```

### useThrottleFn - スロットル

```vue
<script setup>
import { ref } from 'vue';
import { useThrottleFn } from '@vueuse/core';

const scrollY = ref(0);

// 100msに1回だけ実行
const handleScroll = useThrottleFn(() => {
  scrollY.value = window.scrollY;
}, 100);
</script>

<template>
  <div @scroll="handleScroll">
    スクロール位置: {{ scrollY }}
  </div>
</template>
```

## TypeScriptとの統合

VueUseは完全なTypeScript対応。

```typescript
import { ref, Ref } from 'vue';
import { useMouse, UseMouseReturn } from '@vueuse/core';

// 型推論が効く
const { x, y }: UseMouseReturn = useMouse();

// カスタムcomposableでも型定義
export function useCustomHook(): { count: Ref<number>; increment: () => void } {
  const count = ref(0);
  const increment = () => {
    count.value++;
  };

  return { count, increment };
}
```

## SSR対応

```typescript
import { useWindowSize } from '@vueuse/core';

// SSR環境では安全なデフォルト値を返す
const { width, height } = useWindowSize({
  initialWidth: 1920,
  initialHeight: 1080,
});
```

## まとめ

| カテゴリ | 用途 | 例 |
|---------|------|-----|
| ブラウザAPI | DOM/BOM操作 | useMouse, useWindowSize |
| Reactive | リアクティブ拡張 | computedAsync, useToggle |
| ユーティリティ | 汎用ヘルパー | promiseTimeout, useDebounceFn |

**採用すべき理由**:
- コードの再利用性向上
- 保守性の向上
- TypeScript完全対応
- パフォーマンス最適化が容易

## 関連ナレッジ

- [Vue.js Composition API](./vue-composition-api.md)
- [Reactivity Fundamentals](./reactivity.md)
- [カスタムComposables](./custom-composables.md)
- [デバウンス・スロットル](./debounce-throttle.md)
