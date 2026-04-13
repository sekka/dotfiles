# Evaluation Model & dotfiles Structure

## Directory layout

```
~/.claude/design-references/
  {slug}/
    metadata.yaml
    tokens.yaml
    tokens.json       ← AI/ツール向けJSONエクスポート
    evaluation.yaml
    analysis.md
    motion.yaml
    components/
      {name}.yaml
      {name}.png
    screenshots/
      full-page.png
      {component}.png
```

Slug rule: replace `.` with `-` in domain (e.g. `stripe.com` → `stripe-com`).

Each component subdirectory holds:
- `{name}.yaml` — scores, borrow value, qualitative notes
- `{name}.png` — screenshot of the component from the reference site

## metadata.yaml

```yaml
site: stripe.com
url: https://stripe.com
slug: stripe-com
date: 2026-04-13
overall: 9.1
dna: "余白主義 × モノトーン × タイポ主役 × CTAミニマル"
context: [B2B-SaaS, minimal, technical]
borrow: []
about_url: ""   # fill if About page was analyzed
```

## tokens.yaml

Raw format — preserves all extracted values as arrays for completeness.

```yaml
colors:
  - { value: "#635BFF", type: accent }
  - { value: "#0A2540", type: text-primary }
  - { value: "#425466", type: text-secondary }
  - { value: "#FFFFFF", type: background }
font_families:
  - "-apple-system, BlinkMacSystemFont, 'Segoe UI'"
font_sizes:
  - "14px"
  - "16px"
  - "24px"
  - "40px"
border_radii:
  - "6px"
  - "8px"
grid:
  max_width: "1280px"
  columns: 12
  gutter: "24px"
  margin: "80px"
  breakpoints: ["640px", "768px", "1024px", "1280px"]
```

## Mapping tokens.yaml → DESIGN.md frontmatter

When generating DESIGN.md from this file, apply this mapping:

| tokens.yaml (raw) | DESIGN.md frontmatter |
|---|---|
| `colors[].{type: "accent", value: "#X"}` | `tokens.colors.accent: "#X"` |
| `colors[].{type: "text-primary", value: "#X"}` | `tokens.colors.primary: "#X"` |
| `colors[].{type: "background", value: "#X"}` | `tokens.colors.bg: "#X"` |
| `font_sizes[0]` (smallest) | `tokens.typography.body` |
| `font_sizes[-1]` (largest) | `tokens.typography.h1` |
| `border_radii[0]` (first) | `tokens.border_radius` |
| `grid.*` | `grid.*` (direct copy) |

Ask the user to confirm or override the mapping before writing DESIGN.md.
Entries with ambiguous `type` values should be confirmed by the user.

## evaluation.yaml (full example)

```yaml
site: stripe.com
date: 2026-04-13
dna: "余白主義 × モノトーン × タイポ主役 × CTAミニマル"
context: [B2B-SaaS, minimal, technical]
borrow: []
overall: 9.1
dimensions:
  visual_hierarchy:
    score: 9
    excellent: "F字パターンを意識したテキスト配置で視線が自然にCTAへ誘導される"
    weak: "深階層のドキュメントページで迷子になりやすい"
  typography:
    score: 10
    excellent: "タイプスケールの比率が一貫しており教科書的な読みやすさを実現"
    weak: "-"
  color_system:
    score: 9
    excellent: "プライマリカラーの使用を節制しアクセントが際立つ"
    weak: "グレーの段数が多く実装時に迷いが生じる"
  spacing_rhythm:
    score: 9
    excellent: "4px基準の一貫した余白でページ全体にリズム感がある"
    weak: "-"
  grid:
    score: 9
    excellent: "12カラム・ガター24px・心地よいコンテンツ密度"
    weak: "-"
  emotional_impact:
    score: 9
    excellent: "信頼感と革新性が共存しB2B購買担当者の心理的障壁を下げる"
    weak: "温かみや親しみやすさは意図的に排除されており好みが分かれる"
  functional_clarity:
    score: 9
    excellent: "1ページ1行動の原則が徹底されCTAで迷わない"
    weak: "ナビゲーション構造が深く初訪問ユーザーが全体像を掴みにくい"
```

## component.yaml (per component)

```yaml
component: hero
screenshot: hero.png
scores:
  visual_hierarchy: { score: 9, note: "大見出しとサブテキストの対比が明快で情報階層が一目で分かる" }
  typography: { score: 9, note: "フォントサイズの差が情報優先度を視覚化している" }
  spacing_rhythm: { score: 8, note: "余白は十分だがモバイルでは若干の圧迫感あり" }
borrow_value: high   # high / medium / low
borrow_note: "グラデーションを使わないシンプルなヒーロー構成は多くのプロジェクトで参考になる"
```

## motion.yaml

```yaml
transitions:
  - selector: ".btn"
    value: "all 0.2s ease"
animations: []
motion_language: "スナッピーで機能的。0.2s/easeが標準。装飾的な動きはなく、ブランドの即応性と効率性を体現している。"
```

## Save procedure

Run in this order after all analysis is complete:

```bash
SLUG="stripe-com"
DIR="$HOME/.claude/design-references/$SLUG"
mkdir -p "$DIR/components" "$DIR/screenshots"

# Set DOMAIN to the actual domain being analyzed
DOMAIN="stripe.com"  # replace with actual domain
cp "/tmp/clone-${DOMAIN}/full-page.png" "$DIR/screenshots/full-page.png"
cp "/tmp/clone-${DOMAIN}/hero.png" "$DIR/screenshots/hero.png"
# (copy each component screenshot similarly)

# Copy component screenshots
cp "/tmp/clone-${DOMAIN}/nav.png" "$DIR/components/nav.png"
# (repeat for each component)
```

Then write `metadata.yaml`, `tokens.yaml`, `evaluation.yaml`, `analysis.md`, `motion.yaml`,
and each `components/{name}.yaml` using Write tool.

Finally, export `tokens.yaml` as JSON for programmatic use and AI context injection:

```bash
yq -o=json "$DIR/tokens.yaml" > "$DIR/tokens.json"
```

`tokens.json` can be passed directly to AI agents as structured context, or consumed by tools like Figma Tokens / Style Dictionary.
