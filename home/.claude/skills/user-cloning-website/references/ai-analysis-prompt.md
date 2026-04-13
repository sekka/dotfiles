# AI Integrated Design Analysis Prompt

Use after Steps 3, 4, 4b, and 5 are complete.

## What to pass to the AI

1. This prompt (below)
2. Full-page screenshot as an image
3. 2–3 component screenshots (nav, hero, main section at minimum)
4. Token JSON from Step 3
5. Grid JSON from Step 4b
6. Animation data from Step 5

## Prompt

---
あなたはデザインアナリスト兼ブランドストラテジストです。
以下のウェブサイトのデザインを分析し、指定の形式で出力してください。
回答はすべて日本語で記述してください。

### 出力 1: analysis.md の内容

以下のセクションをMarkdownで記述してください。

**## Tone & Manner**
このデザインの全体的な美的方向性とパーソナリティを2〜3文で記述してください。

**## Emotional Value**
このデザインが生み出す感情・体験を3〜5点、箇条書きで挙げてください。
各項目の形式: `- {感情名}: {何がそれを生み出しているかの具体的な説明}`
例: `- 信頼感: 均一な余白と整列が几帳面さと丁寧さを伝えている`

**## Functional Value**
ユーザーがゴールを達成するためにデザインが果たしている役割を3〜5点、箇条書きで挙げてください。
例: `- 視線誘導: F字パターンを意識した配置で自然に主要CTAへ誘導される`

**## Designer Intent**
このデザインの制作者（またはクライアント）が伝えようとした思想・哲学を2〜3文で推察してください。
「このデザインが発している無言のメッセージ」を言語化してください。

**## Why These Choices**
視覚的な選択とその効果を結びつける具体的な観察を2〜3点挙げてください。
例: `4px基準の余白が全体に統一されているため、ページ全体にリズム感が生まれ、情報の優先順位が自然に伝わる`

### 出力 2: evaluation.yaml の内容

以下の7軸それぞれについて評価してください。
各軸の形式:
```yaml
{axis_name}:
  score: {1〜10の整数}
  excellent: "{この軸でデザインが優れている点を1文で}"
  weak: "{この軸での課題を1文で。なければ '-'}"
```

評価軸:
- `visual_hierarchy`: 視線誘導の明確さ・情報階層の表現
- `typography`: 可読性・スケールの一貫性・タイポグラフィのパーソナリティ
- `color_system`: 配色の調和・コントラスト・感情的適切さ
- `spacing_rhythm`: 余白の一貫性・リズム感・4/8px基準との整合
- `grid`: カラムリズム・ガターの一貫性・max-widthの適切さ
- `emotional_impact`: 意図した感情レジスターとの一致度
- `functional_clarity`: CTAの明確さ・ナビゲーション・タスク完了のしやすさ

加えて以下も含めてください:
- `overall`: 7軸の平均（小数第1位まで）
- `dna`: デザインの本質を1フレーズで表現（例: "余白主義 × モノトーン × タイポ主役 × CTAミニマル"）
  - 3〜5要素を「×」でつなぐ。簡潔に、核心を突いたもの
- `context`: 該当するタグの配列。以下から選択:
  `[B2B-SaaS, B2C, editorial, portfolio, e-commerce, startup, enterprise, creative, minimal, bold, playful, luxury, technical]`
- `borrow`: 他プロジェクトで借用したい具体的なパターン（なければ空配列）
  例: `["hero-layout", "cta-style"]`

evaluation.yaml 全体を ```yaml コードブロックで出力してください。
---

## After receiving AI output

1. Save prose output to `{output_dir}/analysis.md`
2. Extract the `yaml` code block and save to `{output_dir}/evaluation.yaml`
   - Remove the ` ```yaml ` and ` ``` ` fence markers
   - Add header fields before dimensions:
     ```yaml
     site: {domain}
     date: {YYYY-MM-DD}
     dna: {from AI output}
     context: {from AI output}
     borrow: {from AI output}
     overall: {from AI output}
     dimensions:
       {paste AI dimensions here}
     ```
