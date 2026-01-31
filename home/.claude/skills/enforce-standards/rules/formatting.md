# フォーマット統一ルール

## 目的

コードのフォーマットを統一し、可読性と保守性を向上させる。

---

## 基本方針

Prettier の設定に準拠する。

---

## フォーマットルール

### 1. インデント

**ルール:** スペース2個

```typescript
// Good
function example() {
  if (condition) {
    doSomething();
  }
}

// Bad
function example() {
    if (condition) {
        doSomething();
    }
}
```

### 2. セミコロン

**ルール:** 必須

```typescript
// Good
const value = 123;
const result = calculate(value);

// Bad
const value = 123
const result = calculate(value)
```

### 3. クォート

**ルール:** シングルクォート（文字列）、ダブルクォート（JSX属性）

```typescript
// Good
const message = 'Hello, World!';
const element = <div className="container">Content</div>;

// Bad
const message = "Hello, World!";
const element = <div className='container'>Content</div>;
```

### 4. 末尾カンマ

**ルール:** ES5準拠（オブジェクト・配列は追加、関数引数は不要）

```typescript
// Good
const obj = {
  name: 'Alice',
  age: 30,  // ← 末尾カンマ
};

const arr = [
  1,
  2,
  3,  // ← 末尾カンマ
];

function example(a: number, b: number) {  // ← 関数引数は不要
  return a + b;
}

// Bad
const obj = {
  name: 'Alice',
  age: 30  // ← カンマなし
};
```

### 5. 改行

**ルール:**
- 1行の最大文字数: 100文字
- 長い式は適切に改行

```typescript
// Good
const result = calculateVeryLongFunctionName(
  argument1,
  argument2,
  argument3
);

// Bad
const result = calculateVeryLongFunctionName(argument1, argument2, argument3, argument4, argument5);
```

### 6. スペース

**ルール:**

```typescript
// Good
if (condition) {
  // スペースあり: if と ( の間、) と { の間
}

const sum = a + b;  // 演算子の前後にスペース

// Bad
if(condition){
  // スペースなし
}

const sum=a+b;  // スペースなし
```

### 7. ブロック

**ルール:** 必ず `{}` を使用（1行でも）

```typescript
// Good
if (condition) {
  doSomething();
}

// Bad
if (condition) doSomething();
```

---

## Prettier 設定ファイル

`.prettierrc.json`

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "arrowParens": "avoid",
  "endOfLine": "lf"
}
```

---

## ESLint 設定（フォーマット関連）

`.eslintrc.json`

```json
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier"
  ],
  "rules": {
    "semi": ["error", "always"],
    "quotes": ["error", "single", { "avoidEscape": true }],
    "indent": ["error", 2],
    "max-len": ["error", { "code": 100 }],
    "curly": ["error", "all"],
    "brace-style": ["error", "1tbs"]
  }
}
```

---

## 自動修正

### Prettier で自動修正

```bash
# 全ファイルをフォーマット
npx prettier --write .

# 特定ファイルのみ
npx prettier --write src/auth/login.ts
```

### ESLint で自動修正

```bash
# 自動修正可能な問題を修正
npx eslint --fix .
```

---

## 除外設定

`.prettierignore`

```
node_modules/
dist/
build/
coverage/
*.min.js
*.min.css
```

---

## エディタ統合

### VS Code

`.vscode/settings.json`

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

---

## チェックリスト

- [ ] インデントがスペース2個
- [ ] セミコロンがある
- [ ] シングルクォート使用
- [ ] 末尾カンマ（ES5準拠）
- [ ] 1行100文字以内
- [ ] 適切なスペース
- [ ] ブロックに `{}` を使用
- [ ] Prettier 実行済み

---

## 参考資料

- [Prettier Options](https://prettier.io/docs/en/options.html)
- [ESLint: Stylistic Rules](https://eslint.org/docs/latest/rules/#stylistic-issues)
- [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)
