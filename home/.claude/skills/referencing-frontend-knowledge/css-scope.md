# CSS @scope 設計ガイド

<!-- 出典: https://gist.github.com/tak-dcxi/a0d3e1cfc9f612ba8131e5081aa96295 -->

> 基礎的な使い方は [CSS @scope 入門](./css-scope-basics.md) を参照

## @scope のメリット

- クラス名を複雑にしなくてすむ
- スタイルの衝突を防ぎやすくなる
- 保守性が高まる

ただし、**正しく利用できるなら**という前提がある。

## 重要: スコープリミットは必須

スコープリミット（`to` 句）を省略可能だが、運用上は**必須**と考える。

### スコープリミットなしの問題点

```css
/* スコープリミットなし */
@scope (.section) {
  p {
    color: green;
  }
}

/* ↓ これとほぼ同じ（大差なし） */
.section {
  p {
    color: green;
  }
}
```

違いは詳細度のみ:

- `@scope` 内の `p`: 詳細度 `0.0.1`
- ネストした `p`: 詳細度 `0.1.1`（`.section p`）

しかし現代では `:where()` があるため、大したメリットではない:

```css
:where(.section) {
  p {
    color: green; /* 詳細度 0.0.1 */
  }
}
```

### 子コンポーネントへのスタイル漏れ

スコープリミットがないと、独立した子コンポーネントにもスタイルが適用されてしまう:

```html
<div class="ComponentA">
  <p>...</p>
  <div class="ComponentB">
    <p>...</p>
    <!-- ← ComponentA のスタイルが適用されてしまう -->
  </div>
</div>
```

## アンチパターン: スコープリミットに具体性を持たせる

以下のような具体的なセレクタをスコープリミットに使うのは**NG**:

```css
@scope (.section_footer) to (.section_footer_textarea_inner) {
  p {
    color: green;
  }
}
```

### 問題点

新しいコンポーネントを追加するたびにスコープリミットを更新する必要がある:

```html
<div class="section">
  <div class="section_header">
    <hgroup class="hgroup">
      <!-- ← スコープリミットに含まれていないのでスタイルが漏れる -->
      <p class="hgroup_subtitle">サブタイトル</p>
    </hgroup>
  </div>
  <!-- ... -->
</div>
```

対処するには:

```css
/* セレクタを追加し続ける必要がある = 保守性が低い */
@scope (.section) to (.section_header, .section_footer_textarea_inner) {
  p {
    color: green;
  }
}
```

また、別コンポーネントをスコープリミットに含めるのは**絶対NG**:

```css
/* コンポーネントの独立性を破壊する */
@scope (.section) to (.hgroup) {
  p {
    color: green;
  }
}
```

## 推奨: スコープリミットの設計パターン

### パターン 1: カスタムデータ属性

```html
<div data-scope="ComponentA">
  <p class="_Description">...</p>
  <div data-scope="ComponentB">
    <p class="_Description">...</p>
  </div>
</div>
```

```css
@scope ([data-scope="ComponentA"]) to ([data-scope]) {
  & {
    color: oklch(from red calc(l - 0.1) c h);
    border: 2px solid;
    padding: 1em;
  }

  ._Description {
    background-color: #eee;
    padding: 1em;
  }
}

@scope ([data-scope="ComponentB"]) to ([data-scope]) {
  & {
    color: oklch(from blue calc(l + 0.1) c h);
    border: 2px solid;
  }
}
```

- 仕様書で紹介されている手法
- 副作用が少ない
- エキゾチックな設計になるため抵抗感がある人も

### パターン 2: ルートマーカークラス（推奨）

コンポーネントルートに `.scope` クラスを付与:

```html
<div class="scope ComponentA">
  <p class="_Description">...</p>
  <div class="scope ComponentB">
    <p class="_Description">...</p>
  </div>
</div>
```

```css
@scope (.scope.ComponentA) to (.scope) {
  & {
    color: oklch(from red calc(l - 0.1) c h);
    border: 2px solid;
    padding: 1em;
  }

  ._Description {
    background-color: #eee;
    padding: 1em;
  }
}

@scope (.scope.ComponentB) to (.scope) {
  & {
    color: oklch(from blue calc(l + 0.1) c h);
    border: 2px solid;
  }
}
```

- わかりやすい設計
- コンポーネントルートに `.scope` を必ず指定する強制力が必要

### パターン 3: プレフィックス方式（推奨）

FLOCSS 風にプレフィックスを使用:

```html
<div class="c-ComponentA">
  <p class="_Description">...</p>
  <div class="c-ComponentB">
    <p class="_Description">...</p>
  </div>
</div>
```

```css
@scope (.c-ComponentA) to ([class|="c"]) {
  & {
    color: oklch(from red calc(l - 0.1) c h);
    border: 2px solid;
    padding: 1em;
  }

  ._Description {
    background-color: #eee;
    padding: 1em;
  }
}

@scope (.c-ComponentB) to ([class|="c"]) {
  & {
    color: oklch(from blue calc(l + 0.1) c h);
    border: 2px solid;
  }
}
```

- FLOCSS を使っている現場では馴染みやすい
- デメリット:
  - Layout/Components/Projects を Components に集約する必要あり
  - `[class|="c"]` というまどろっこしい指定が必要
  - `class` 属性が `c-` から始まる必要がある（`class="foo c-Bar"` は破綻）

## 結論

1. **@scope でも命名規則は必要**
   - スコープルートにはユニークなクラス名が必要（コンフリクト防止）
   - スコープ内セレクタも `.title` のような汎用名は外部 CSS とバッティングの可能性あり

2. **スコープリミットの設計が重要**
   - 入念に設計しないと保守性が下がる
   - 不十分だとスタイルの衝突を防げない

3. **BEM から脱出できるわけではない**
   - 新しく @scope に適した命名規則を考える必要がある
   - BEM に満足している現場は移行しないほうが幸せかも

4. **優先すべき選択肢**
   - フレームワークの Scoped CSS が使える → そちらを優先
   - Tailwind CSS が使える → そちらを優先
   - 上記が使えない場合のみ @scope を検討
