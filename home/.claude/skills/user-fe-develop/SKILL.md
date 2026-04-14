---
name: user-fe-develop
description: Help with frontend UI/UX implementation and optimization. Covers React/Vue/Next.js, performance, and accessibility. Use proactively when implementing components, building layouts, or optimizing performance — also triggered by questions about React, Vue, Next.js, Tailwind, animation, or accessibility in a web project.
disable-model-invocation: false
---

# Frontend Development and Performance Optimization

## Overview

A skill for comprehensive support of frontend development, React/Vue/Next.js implementation, TypeScript type design, and performance optimization.

## Iron Law

1. Do not make breaking changes to existing components without permission
2. Do not make accessibility worse

## Execution Flow

### Step 1: Project Setup

#### Framework Selection Criteria

| Framework | Use case                           | Features                       |
| -------------- | ------------------------------ | -------------------------- |
| React          | General-purpose SPA                    | Largest ecosystem         |
| Next.js        | Web apps that need SEO             | SSR/SSG/ISR support        |
| Vue 3          | Simple and easy to learn         | Composition API            |
| Astro          | Content-focused sites           | Zero JS by default           |
| Svelte         | Minimum bundle size           | Compile-time optimization         |

### Step 2: TypeScript Type Design

#### Advanced Type System

**Generics and constraints:**

```typescript
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}
```

**Discriminated unions and exhaustiveness checks:**

```typescript
type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };
```

**Using utility types:**

- `Partial<T>`, `Pick<T, K>`, `Omit<T, K>`, `Record<K, V>`, `Required<T>`

**Branded types:**

```typescript
type UserId = string & { readonly brand: unique symbol };
```

### Step 3: Component Design

#### React Component Architecture

- Follow the single responsibility principle
- Composition over inheritance
- Define Props types clearly

**Custom hooks:**

```typescript
function useUser(userId: string) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  // ...
  return { user, loading, error };
}
```

### Step 4: State Management

#### Choosing a State Management Approach

| Approach         | Use case                   | Learning curve |
| ------------ | ---------------------- | -------- |
| useState     | Local state           | Low       |
| Context API  | Themes, authentication info       | Medium       |
| Zustand      | Global state (lightweight) | Low       |
| Redux Toolkit| Complex state management         | High       |
| React Query  | Server state management       | Medium       |

**Zustand (recommended):**

```typescript
const useCartStore = create<CartStore>((set) => ({
  items: [],
  addItem: (item) => set((state) => ({ items: [...state.items, item] })),
}));
```

### Step 5: Performance Optimization

#### React Optimization Techniques

- **React.memo**: Prevent unnecessary re-renders
- **useCallback/useMemo**: Memoize functions and computed values
- **Code splitting**: Dynamic imports with `lazy()` and `Suspense`
- **Virtualization**: Handle large lists with `@tanstack/react-virtual`

#### Core Web Vitals Targets

```
FCP (First Contentful Paint) < 1.8s
LCP (Largest Contentful Paint) < 2.5s
FID (First Input Delay) < 100ms
CLS (Cumulative Layout Shift) < 0.1
```

### Step 6: Tailwind CSS Styling

**Responsive design:**

```tsx
<div className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4 p-4">
```

### Step 7: Testing

**Testing Library:**

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
```

## Output Deliverables

1. **Project setup**: Initialized project structure
2. **Type definitions**: TypeScript type definition files
3. **Component library**: Reusable UI parts
4. **State management**: Stores and custom hooks
5. **Style system**: Tailwind config and design tokens
6. **Test code**: Unit and integration tests

## Best Practices

1. **TypeScript Strict Mode**: Ensure maximum type safety
2. **Component design**: Follow the single responsibility principle
3. **Performance**: Use React.memo, useCallback, and useMemo appropriately
4. **Accessibility**: Semantic HTML, ARIA attributes, keyboard navigation
5. **Testing**: Test behavior with Testing Library

## Related Files

- [PATTERNS.md](./PATTERNS.md) - Implementation patterns
- [PERFORMANCE.md](./PERFORMANCE.md) - Performance checklist
- [corrections.md](./corrections.md) - Known pitfalls and past mistakes
