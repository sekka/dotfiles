# explaining-tech-articles

複雑な技術記事、論文、技術ドキュメントを図解を含めてわかりやすく解説するスキル。

## 特徴

- **TL;DR（3行要約）**: 記事の核心を即座に把握
- **Why & Context**: 技術の背景と重要性を説明
- **図解（Mermaid）**: 概念を視覚的に理解
- **キーワード解説**: 専門用語を平易に説明

## 使い方

### 基本的な使用例

```
/explaining-tech-articles https://arxiv.org/abs/1706.03762
```

または

```
Transformer アーキテクチャについて図解して
```

### 入力形式

1. **URL**: 技術記事や論文のURL
2. **テキスト**: 記事の本文やPDF
3. **概念名**: 技術用語やアーキテクチャ名

## 出力例

```markdown
**TL;DR:**
1. Transformer はアテンション機構のみで構成された NLP モデル
2. RNN/LSTM を使わず並列処理が可能
3. BERT、GPT の基盤技術

**Why & Context:**
従来の RNN/LSTM は並列化が困難で...（省略）

**図解:**
[Mermaid 図]

**キーワード解説:**
- Self-Attention: 入力シーケンス内の各要素が...
- Multi-Head Attention: 複数の異なる視点で...
```

## トリガーキーワード

- 「この記事を解説して」
- 「論文を要約して」
- 「〜の概念を図解して」
- 「技術記事をわかりやすく」

## 参考

元ネタ: [Google Gemini の Gem](https://github.com/p-t-a-p-1/gem-prompts/tree/main/tech-explainer)
