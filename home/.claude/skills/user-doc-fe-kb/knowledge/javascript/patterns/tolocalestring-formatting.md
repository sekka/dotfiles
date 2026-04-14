---
title: toLocaleString()で数値・日付を多言語フォーマット
category: javascript/patterns
tags: [JavaScript, i18n, toLocaleString, 数値フォーマット, 日付フォーマット, ロケール, 国際化]
browser_support: Chrome, Firefox, Safari, Edge（モダンブラウザ全対応、実装差異あり）
created: 2026-02-01
updated: 2026-02-01
---

# toLocaleString()で数値・日付を多言語フォーマット

## toLocaleString() メソッドの基本

> 出典: https://ics.media/entry/240529/
> 執筆日: 2024-05-29
> 追加日: 2026-02-01

JavaScriptの `toLocaleString()` メソッドを使用すると、数値や日付を各国のロケールに応じた文字列形式に変換できる。手動での文字列操作が不要で、国際化対応が容易になる。

### 基本構文

```javascript
value.toLocaleString(localeString, optionsObject)
```

**パラメータ:**
- `localeString`: ロケール指定（例: `"ja-JP"`, `"en-US"`）
- `optionsObject`: フォーマットオプション

---

## 数値フォーマット

### カンマ区切り

```javascript
const separateComma = (number) =>
  number.toLocaleString("ja-JP", {
    style: "decimal",
    useGrouping: true
  });

console.log(separateComma(1234567.89));
// "1,234,567.89"
```

### 小数点の丸め

```javascript
const roundDecimal = (number, digits) =>
  number.toLocaleString("ja-JP", {
    maximumFractionDigits: digits
  });

console.log(roundDecimal(3.14159, 2));
// "3.14"
```

### パーセンテージ表示

```javascript
const toPercent = (number) =>
  number.toLocaleString("ja-JP", {
    style: "percent",
    minimumFractionDigits: 1
  });

console.log(toPercent(0.456));
// "45.6%"
```

### 通貨フォーマット

```javascript
const toCurrency = (amount, currency = "JPY") =>
  amount.toLocaleString("ja-JP", {
    style: "currency",
    currency: currency
  });

console.log(toCurrency(1234567, "JPY"));
// "¥1,234,567"

console.log(toCurrency(1234.56, "USD"));
// "$1,234.56"（ロケールによって記号が変わる）
```

**主要通貨コード:**
- `JPY`: 日本円
- `USD`: 米ドル
- `EUR`: ユーロ
- `GBP`: 英ポンド

### コンパクト表記（4万、4億）

```javascript
const toCompact = (number) =>
  number.toLocaleString("ja-JP", {
    notation: "compact",
    compactDisplay: "short"
  });

console.log(toCompact(40000));
// "4万"

console.log(toCompact(400000000));
// "4億"
```

**英語圏の場合:**

```javascript
console.log(40000..toLocaleString("en-US", {
  notation: "compact"
}));
// "40K"

console.log(400000000..toLocaleString("en-US", {
  notation: "compact"
}));
// "400M"
```

### 単位付き表示

```javascript
const withUnit = (value, unit) =>
  value.toLocaleString("ja-JP", {
    style: "unit",
    unit: unit
  });

console.log(withUnit(123, "kilometer"));
// "123 km"

console.log(withUnit(45.6, "kilogram"));
// "45.6 kg"
```

**利用可能な単位例:**
- 距離: `kilometer`, `meter`, `mile`
- 重量: `kilogram`, `gram`, `pound`
- 時間: `hour`, `minute`, `second`
- 温度: `celsius`, `fahrenheit`

---

## 日付フォーマット

### YYYY/MM/DD 形式

```javascript
const formatDate = (date) =>
  date.toLocaleString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  });

console.log(formatDate(new Date(2024, 4, 29)));
// "2024/05/29"
```

### 和暦変換

```javascript
const toJapaneseCalendar = (date) =>
  date.toLocaleString("ja-JP-u-ca-japanese", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });

console.log(toJapaneseCalendar(new Date(2024, 4, 29)));
// "令和6年5月29日"
```

**ロケール拡張キー:**
- `u-ca-japanese`: 日本の和暦
- `u-ca-chinese`: 中国暦
- `u-ca-islamic`: イスラム暦

### 12/24時間表示

```javascript
// 24時間表示（日本）
const time24 = new Date().toLocaleString("ja-JP", {
  hour: "2-digit",
  minute: "2-digit"
});
// "14:30"

// 12時間表示（米国）
const time12 = new Date().toLocaleString("en-US", {
  hour: "2-digit",
  minute: "2-digit"
});
// "02:30 PM"
```

### 曜日付き表示

```javascript
const withWeekday = (date) =>
  date.toLocaleString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long"
  });

console.log(withWeekday(new Date(2024, 4, 29)));
// "2024年5月29日水曜日"
```

**weekday オプション:**
- `"long"`: 水曜日
- `"short"`: 水
- `"narrow"`: 水

---

## ユースケース

### EC サイトの価格表示

```javascript
const displayPrice = (price, locale = "ja-JP") => {
  const currency = locale === "ja-JP" ? "JPY" : "USD";
  return price.toLocaleString(locale, {
    style: "currency",
    currency: currency
  });
};

// 日本向け
console.log(displayPrice(1980));
// "¥1,980"

// 米国向け
console.log(displayPrice(19.80, "en-US"));
// "$19.80"
```

### SNS の投稿数表示

```javascript
const formatCount = (count) => {
  if (count >= 10000) {
    return count.toLocaleString("ja-JP", {
      notation: "compact",
      maximumFractionDigits: 1
    });
  }
  return count.toLocaleString("ja-JP");
};

console.log(formatCount(1234));
// "1,234"

console.log(formatCount(123456));
// "12.3万"
```

### 多言語対応の日付表示

```javascript
const formatDateByLocale = (date, locale) => {
  return date.toLocaleString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
};

const now = new Date(2024, 4, 29);

console.log(formatDateByLocale(now, "ja-JP"));
// "2024年5月29日"

console.log(formatDateByLocale(now, "en-US"));
// "May 29, 2024"

console.log(formatDateByLocale(now, "de-DE"));
// "29. Mai 2024"
```

---

## 注意点

### ブラウザ実装差異

**重要:** ECMAScript仕様では実装による差異が許容されているため、ブラウザ間で出力が異なる場合がある。

**例: 半角円記号の違い（2024年テスト結果）**
- Chrome, Edge, Firefox: `¥` (全角)
- Safari: `¥` (半角)

**対策:**
- 固定文字列との比較は避ける（表示用途に限定）
- データ検証には使用しない
- 必要に応じてロケールを明示的に指定

### ロケール指定の推奨

```javascript
// 悪い例: ロケール省略（ブラウザのデフォルトロケールに依存）
const ambiguous = number.toLocaleString();

// 良い例: ロケールを明示
const explicit = number.toLocaleString("ja-JP", {
  style: "decimal"
});
```

### パフォーマンス考慮

大量のデータをフォーマットする場合は、`Intl.NumberFormat` や `Intl.DateTimeFormat` のインスタンスを再利用する：

```javascript
// パフォーマンスが悪い
for (let i = 0; i < 10000; i++) {
  console.log(i.toLocaleString("ja-JP"));
}

// パフォーマンスが良い
const formatter = new Intl.NumberFormat("ja-JP");
for (let i = 0; i < 10000; i++) {
  console.log(formatter.format(i));
}
```

---

## ブラウザサポート

| 機能 | Chrome | Firefox | Safari | Edge |
|------|--------|---------|--------|------|
| 基本的な toLocaleString() | ✓ | ✓ | ✓ | ✓ |
| 数値フォーマット | ✓ | ✓ | ✓ | ✓ |
| 日付フォーマット | ✓ | ✓ | ✓ | ✓ |
| notation: "compact" | 77+ | 78+ | 14.1+ | 79+ |
| style: "unit" | 77+ | 78+ | 14.1+ | 79+ |

**注意:** 出力結果はブラウザ実装に依存するため、実装差異を考慮すること。

---

## 関連リソース

- [MDN: Number.prototype.toLocaleString()](https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Number/toLocaleString)
- [MDN: Date.prototype.toLocaleString()](https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Date/toLocaleString)
- [MDN: Intl.NumberFormat](https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat)
- [MDN: Intl.DateTimeFormat](https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat)
