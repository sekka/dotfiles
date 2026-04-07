---
name: user-researching-creative-cases
description: Research the latest Japanese creative work (web, ads, products, music videos, landing pages, typography, packaging, spaces, UI/UX, exhibitions, etc.) from awards and trends. Generates a curated Markdown report. Suggests related fields. Useful for team inspiration, client proposals, and design trend analysis.
disable-model-invocation: false
---

<objective>
Automatically research and document the latest Japanese creative work from major domestic and international award sites (Awwwards, Red Dot, D&AD, ADC, Cannes Lions, Japan Media Arts Festival, etc.) and specialized galleries (SANKOU!, MUUUUU.ORG, VIMEO Staff Picks, etc.). Fields covered: web design, advertising campaigns, product design, music videos and video production, landing pages, typography, packaging, spatial design, UI/UX, motion graphics, exhibitions, installations, and more. Prioritizes work from featured production companies and suggests adjacent fields based on user interests. Generates a structured Markdown report that includes award information, production company/director, techniques and methods, and trend analysis. Useful for team inspiration and client proposals.
</objective>

<quick_start>
**Basic usage:**
```
/researching-creative-cases
```
Collects 20 cases from the last 2 months and saves to `creative-cases/YYYYMMDD-web-creative-cases-YYYYMM-YYYYMM.md`

**Items to confirm before starting:**
1. Target field (Web, advertising, MV/video, product, UI/UX, typography, packaging, spatial, LP, etc.)
2. Whether to also research adjacent fields (recommended: automatically suggest genres related to the selected field)
3. Target period (last 1 week to 6 months)
4. Number of cases to collect (10-30)
5. Purpose (inspiration, client proposal, trend analysis, competitive research)

**What the skill does automatically:**
- Runs parallel WebSearch across multiple award sites (Awwwards, Red Dot, D&AD, ADC, Cannes Lions, Japan Media Arts Festival, MVA, Web Grand Prix, JAGDA, Tokyo TDC, JPDA)
- Searches specialized galleries and media (SANKOU!, MUUUUU.ORG, VIMEO Staff Picks, AXIS, Advertising TIMES, Sendenkaigi, SpaceDesign) and trend articles
- Prioritizes searching for the latest work from featured production companies (16 companies listed in featured-companies.md)
- Automatically suggests adjacent fields based on the user's selected field (e.g., when Web is selected → suggest MV/video, UI/UX, motion graphics)
- Verifies URLs and extracts detailed information for each case (production methods, technology, materials, concept, director, etc.)
- Generates a Markdown file including a table of contents, field-by-field category breakdown, and trend analysis
</quick_start>

## Iron Law

1. Do not fill in information about inaccessible sites with guesswork.

<success_criteria>
**Completeness:**
- Collect the target number of cases (default: 20)
- Each case includes: URL/reference, award information, production company/creator/director, techniques/methods/materials, evaluation points
- Includes multiple works from featured production companies (listed in featured-companies.md)
- When adjacent fields are enabled, includes cases from the suggested related genres
- The Markdown file includes: target period, field-by-field category breakdown, industry-by-industry breakdown, featured production company work count, table of contents, cross-field trend analysis (10 or more trends), adjacent field discoveries section, reference links

**Quality:**
- All URLs/references are verified and working (or provide archive links)
- Award dates and event dates are accurate
- Production company names/creator names/director names are in official notation
- Techniques/methods/materials match the actual production content
- Field-specific expert information is included where appropriate (MV: length and shooting method, product: materials, spatial: area in sqm, etc.)
- The relevance of adjacent fields is explained logically
- File name format: `YYYYMMDD-creative-cases-YYYYMM-YYYYMM.md` (with field specified: `YYYYMMDD-[field]-cases-YYYYMM-YYYYMM.md`)
- File size: 500+ lines for 20 cases (more when adjacent fields are included)
</success_criteria>

<workflow>
**1. Gather Requirements**
Use AskUserQuestion to confirm the following:

**Question 1: Target field**
- Options: "Web-focused (recommended)", "Advertising & marketing", "MV & video production", "Product design", "UI/UX & apps", "Typography", "Packaging design", "Spatial design", "LP-focused", "All fields (multiple)"
- multiSelect: true (multiple selections allowed)
- Note: Featured production company work will be prioritized.

**Question 2: Also research adjacent fields?**
- Options: "Yes (recommended)", "No"
- multiSelect: false
- Note: Automatically suggests adjacent genres related to the selected field (e.g., Web → suggests MV, motion graphics, UI/UX)

**Question 3: Target period**
- Options: "Last 1 week", "Last 2 weeks", "Last 1 month", "Last 2 months (recommended)", "Last 3 months", "Last 6 months"
- multiSelect: false

**Question 4: Number of cases to collect**
- Options: "10", "15", "20 (recommended)", "30"
- multiSelect: false

**Question 5: Purpose**
- Options: "Team inspiration (recommended)", "Client proposal", "Trend analysis", "Competitive research"
- multiSelect: true (multiple selections allowed)

**Adjacent field auto-suggestion logic:**
- **Web selected** → MV/video, motion graphics, UI/UX, interactive works
- **Advertising selected** → MV/video, graphics, packaging, spatial design (store fixtures, etc.)
- **MV/video selected** → Web (special sites), motion graphics, installations
- **Product selected** → Packaging, graphics, spatial design
- **UI/UX selected** → Web, motion graphics, product
- **Typography selected** → Graphics, packaging, Web
- **Packaging selected** → Product, graphics, typography
- **Spatial selected** → Installations, graphics, product

**2. Parallel Research**
Run multiple WebSearch queries simultaneously based on the target field:

**Web design:**
- Awwwards Japan (SOTD, Developer Award, Honorable Mention)
- CSS Design Awards (WOTD, Special Kudos)
- CSS Winner, FWA, Japan Web Grand Prix
- Design galleries (SANKOU!, MUUUUU.ORG, 81-web.com, S5-Style, URAGAWA)

**Advertising & marketing:**
- Cannes Lions, D&AD Awards, ADC Awards, ACC TOKYO CREATIVITY AWARDS
- Sendenkaigi, Advertising TIMES, Brain
- Marketing Native, AdverTimes

**MV & video production:**
- MVA (Music Video Awards), Japan Media Arts Festival
- VIMEO Staff Picks, VIMEO Awards
- Shots, The One Show
- Video work from featured production companies (Garden Eight, mount inc., IN FOCUS, TryMore, mont., etc.)

**Product:**
- Red Dot Design Award, iF Design Award, Good Design Award
- AXIS, Design no Hikidashi

**UI/UX & apps:**
- Awwwards (Mobile Excellence), FWA (Mobile of the Day)
- App Design Inspiration, UI Movement
- Good Design Award (app category)

**Typography:**
- Tokyo TDC, JAGDA newcomer award
- Typography Gallery, Typography Yearbook

**Packaging design:**
- JPDA (Japan Package Design Association), Pentawards
- Design no Hikidashi, AXIS

**Spatial design:**
- JCD (Japan Commercial Environment Design Association), DSA (Japan Space Design Association)
- Space Design, Shotenkenchiku

**Motion graphics:**
- VIMEO Staff Picks (Motion Graphics)
- Motionographer, STASH

**Exhibitions, events, installations:**
- Japan Media Arts Festival, Ars Electronica
- Tokyo Midtown DESIGN TOUCH, 21_21 DESIGN SIGHT, GOOD DESIGN EXHIBITION

**Featured production company work:**
- Prioritize searching for the latest work from the 16 companies listed in featured-companies.md
- Works/portfolio pages on each company's official site
- Company-specific work on URAGAWA

**Trend articles:**
- Design trends for 2025-2026 (by field)

**3. Selection and Detailed Research**
- Prioritize award-winning works and notable cases
- Ensure diversity: categories, production companies/creators, techniques/methods/materials
- Verify each URL/reference with WebFetch and extract details
- Research production company/creator information and production methods/technology
- Collect field-specific expert information (materials, printing techniques, exhibition methods, etc.)

**URL/Reference verification (required)**
For each case, do the following:
a) Access the URL/reference with WebFetch
b) 404/403/timeout → Search for the correct URL/article (brand name/project name + "award" or "case study")
c) Not found → Check Archive.org, or look for a media article
d) Private/password protected → Search for an alternative reference (media article, award press release, etc.)
e) No reference available → Find a different case

**Verification notes:**
- Do not guess domains (always confirm with WebSearch)
- Verify production company/creator URLs the same way
- Confirm the redirect destination is correct
- For advertising/products with no website, use media articles or award pages as the reference

**4. Document Generation**
Generate Markdown that includes:
- Header (target period, creation date, field-by-field breakdown, industry-by-industry breakdown)
- Table of contents with award/field annotations
- Structured case details (standard format based on field)
- Cross-field trend analysis table
- Reference links (award sites, specialized media, galleries)
</workflow>

<advanced_features>
**Priority search for featured production companies:**
Search and collect the latest work from the 16 companies listed in featured-companies.md:
- Browse the Works/portfolio pages on each company's official site
- Search by company on gallery sites like URAGAWA
- Search across fields (Web, MV/video, graphics, etc.)
- Clearly state the number of works per production company in the report

**Auto-suggestion for adjacent fields:**
Suggest related genres based on the user's selected field:
- Web selected → MV/video, motion graphics, UI/UX, interactive works
- Advertising selected → MV/video, graphics, packaging, spatial design
- MV/video selected → Web (special sites), motion graphics, installations
- Automatically discover work in adjacent fields by the same production company

**Automatic trend extraction:**
Group keywords from cases and classify them into trend categories:
- Technology trends: WebGL/3D, generative AI, React frameworks, interactive technology, real-time rendering
- Design trends: retro/nostalgia, minimalism, glassmorphism, variable fonts, hand-drawn elements, Y2K
- Material/method trends: sustainable materials, special printing, digital fabrication, mixed media
- Content trends: recruitment campaigns, anniversary campaigns, sustainability, D2C, experiential exhibitions, personalization
- Cross-field trends: Web × video collaboration, physical × digital fusion

**Automatic category classification:**
Cross-field case classification:
- **By industry**: corporate branding, fashion/lifestyle, entertainment/music, B2B, hospitality/tourism, education/culture, tech/experimental, products/e-commerce, food/consumer goods
- **By field**: web design, advertising campaigns, MV/video production, product design, UI/UX, LP, typography, packaging, spatial design, motion graphics, exhibitions, installations

**Curation for client proposals:**
Filter by industry and field: `--industry fashion` `--field advertising,mv` `--client-type corporate`

**Ongoing tracking:**
Compare with the previous file to identify new cases, new trends, and production company/creator/director rankings
</advanced_features>

<validation>
**URL/Reference verification:**
- All URLs/references and reference links are working (use WebFetch)
- When there is no website, use a media article or award page as the reference
- Markdown link syntax is correct

**Specific steps for URL/reference verification:**
1. Access each URL/reference with WebFetch (required for all cases)
2. Check HTTP status (anything other than 200 needs to be addressed)
3. Verify the accuracy of the domain/URL (do not assume)
   - Example: Confirm whether `words.inc` or `words-inc.co.jp` is correct by searching
4. Check the redirect destination (is it the intended page?)
5. When there is no website for advertising/products:
   - Search for media articles (Sendenkaigi, Advertising TIMES, etc.)
   - Refer to the award page on the award site
   - Check the brand's press release

**When verification fails:**
1. First search for the correct URL (project name + "official site" or "award" or "case study")
2. Search for a media article (project name + "Sendenkaigi" or "Advertising TIMES")
3. Check past URLs on Archive.org
4. If not found, exclude the case and collect a replacement

**Information accuracy:**
- Award dates match the search results
- Production company names are in official notation
- Verify that the tech stack matches the actual implementation

**Document structure:**
- Target period is clearly stated
- Field and industry categories are distributed evenly (avoid categories with only 1-2 cases)
- Analysis table has at least 10 trends (including a cross-field perspective)
- Table of contents links to all cases
- Field-specific information is appropriately included
</validation>

<examples>
**Example 1: Standard execution (Web-focused)**
```
/researching-creative-cases
```
Output: `20260122-creative-cases-2025-12-2026-01.md` (20 cases from Dec 2025–Jan 2026)

**Example 2: Advertising campaign focused**
```
/researching-creative-cases --field advertising --period "last 3 months" --count 15
```
Output: `20260122-advertising-cases-2025-11-2026-01.md` (15 advertising cases from the last 3 months)

**Example 3: Product design focused**
```
/researching-creative-cases --field product --industry fashion --count 10
```
Output: 10 product design cases from the fashion industry

**Example 4: Typography and LP mix**
```
/researching-creative-cases --field "typography,lp" --count 20
```
Output: 20 mixed typography and LP cases

**Example 5: MV/video focused (featured companies first)**
```
/researching-creative-cases --field "mv" --period "last 3 months" --count 15
```
Output: `20260122-mv-cases-2025-11-2026-01.md` (prioritizes work from Garden Eight, mount inc., IN FOCUS, etc.)

**Example 6: Web + adjacent field suggestions**
```
/researching-creative-cases --field "web" --adjacent-fields true
```
→ Automatically includes MV/video, motion graphics, UI/UX in the research scope

**Example 7: All fields (multiple)**
```
/researching-creative-cases --field "web,advertising,mv,product" --count 30
```
Output: 30 comprehensive cases spanning 4 fields

**Example 8: Output format**
```markdown
# Latest 2-month Japan Creative Case Studies (25 picks)

**Target period**: December 2025 – January 2026
**Created**: January 22, 2026

**Field breakdown**:
- Web design: 7
- Advertising campaigns: 5
- MV & video production: 4
- Product design: 3
- UI/UX: 2
- Typography: 2
- Packaging design: 1
- Spatial design: 1

**Industry breakdown**:
- Corporate branding & anniversaries: 4
- Fashion & lifestyle: 6
- Entertainment & music: 5
- Corporate & B2B: 4
...

**Featured production company work**:
- Garden Eight: 2
- mount inc.: 2 (Web 1, video 1)
- IN FOCUS: 1
- SUPER CROWDS: 1
...

## 📋 Table of Contents
### 🏆 Award-winning works
1. [KOKUYO - Curiosity is Life](https://example.com) - Awwwards SOTD (Web)
2. [BEAMS 50th Anniversary Campaign](https://example.com) - ACC TOKYO (advertising)
3. [Ado - Uta](https://vimeo.com/xxx) - MVA 2025 (MV/video) [Garden Eight]
4. [MUJI Folding Umbrella](https://example.com) - Good Design Award (product)
5. [Sony Music App](https://example.com) - Awwwards Mobile Excellence (UI/UX)
...

## Cross-field Trend Analysis
| Trend | Overview | Main fields | Example cases |
|---------|------|---------|---------|
| **3D + WebGL** | Immersive 3D experiences | Web, MV | KOKUYO, Video work A |
| **Retro Revival** | Showa-era retro, hand-drawn elements | Web, advertising, packaging | Marugame Seimen, BEAMS, Product B |
| **Variable fonts** | Responsive typography | Typography, Web, UI | Sony Type, Morisawa |
| **Generative AI use** | AI-assisted video generation | MV, advertising | MV work C, Campaign D |
| **Sustainable materials** | Eco-friendly materials | Product, packaging | MUJI, Patagonia |
| **Interactive experiences** | Touch and move experience design | Web, spatial, exhibitions | Site E, Store F |
...

## Adjacent Field Discoveries
While researching web design cases, excellent cases from the following adjacent fields were also found:
- **MV/video**: Video works by the same production companies (Garden Eight, mount inc., etc.)
- **Motion graphics**: Web motion → independent MG works
- **UI/UX**: App design as an extension of web

→ Researching these fields together provides more comprehensive inspiration
...
```
</examples>

<anti_patterns>
**Things to avoid:**
- Including old cases outside the target period (recency matters)
- Unbalanced categories or fields (all corporate websites, etc.)
- Not researching featured production company work (use featured-companies.md)
- Ignoring adjacent field suggestions (missing cross-field works by the same company)
- Unverified URLs/references (broken links damage credibility)
- Inaccurate production company names/creator names/director names or techniques/methods
- Lack of cross-case trend analysis
- Lack of cross-field perspective (staying within only Web, only MV, etc.)
- Lack of field-specific expert information (MV: length and shooting method, product: materials, advertising: media, etc.)
- Not explaining the relevance of adjacent fields (why that field should also be researched)
- Documents over 1000 lines (add an executive summary as needed)
- Insufficient reference links to award sites and specialized media

**URL-related prohibitions:**
- Guessing or assuming domains (always confirm by searching)
- Recording URLs without verification
- Omitting or guessing production company URLs
- Including private or inaccessible sites

**Quality checklist:**
1. Verify each URL/reference with WebFetch (also consider archive links)
2. Confirm award dates and event dates match the source
3. Use official production company names/creator names/director names
4. Verify that techniques/methods/materials match the actual production content
5. Check that featured production company (featured-companies.md) work has been prioritized
6. When adjacent fields are enabled, confirm that cases from the suggested fields are included
7. Check whether cross-field works by the same company (e.g., Web + MV) have been discovered
8. Keep trend analysis objective (avoid subjective expressions like "trendy right now")
9. Include a cross-field perspective (do not stay within a single field)
10. Ensure field-specific expertise (Web: technology, MV: length and shooting method, advertising: media, product: materials, etc.)
11. Logically explain the relevance of adjacent fields (why that field should also be researched)
12. Make tips for designers/creators practical (avoid unrealistic idealism)
</anti_patterns>

<common_patterns>
**Standard case formats:**

**Web design:**
```markdown
## N. Site Name

| Item | Content |
|------|------|
| **URL** | [https://example.com](https://example.com) |
| **Field** | Web design |
| **Award** | Awwwards SOTD (2025/12/14) |
| **Production** | [Production company name](https://company.com) |
| **Technology** | WebGL, Three.js, Next.js |
| **Category** | Corporate branding |

### Evaluation points and novelty
[1-2 sentence overview of the concept]

**Design and technical features:**
- Impactful feature 1
- Innovative feature 2
- Feature 3 with implementation notes

### Points to note for designers
- Practical technique 1
- Practical technique 2

### Use in client proposals
- Proposal scenario 1
- Proposal scenario 2
```

**Advertising & marketing:**
```markdown
## N. Campaign Name

| Item | Content |
|------|------|
| **Reference** | [Article URL](https://example.com) |
| **Field** | Advertising campaign |
| **Award** | ACC TOKYO CREATIVITY AWARDS (2025) |
| **Client** | Brand name |
| **Production** | [Ad agency / production company](https://company.com) |
| **Media** | TV, Web, OOH, social media |
| **Category** | Fashion & lifestyle |

### Campaign overview
[1-2 sentences explaining the campaign concept]

**Creative features:**
- Communication strategy
- Integrated campaign measures
- Impact and response

### Points to note
- Creative approach
- Media usage innovations

### Use in proposals
- Applicable scenarios
```

**Product design:**
```markdown
## N. Product Name

| Item | Content |
|------|------|
| **Reference** | [Product info URL](https://example.com) |
| **Field** | Product design |
| **Award** | Good Design Award 2025 |
| **Brand** | Brand name |
| **Designer** | Designer name |
| **Materials** | Aluminum, recycled plastic |
| **Category** | Daily goods |

### Design concept
[1-2 sentences explaining the concept]

**Design features:**
- Functional innovations
- Rationale for material selection
- Usability

### Points to note
- Innovation elements
- Sustainability considerations

### Use in proposals
- Applicable perspectives
```

**Typography:**
```markdown
## N. Work title / Project name

| Item | Content |
|------|------|
| **Reference** | [Work URL](https://example.com) |
| **Field** | Typography |
| **Award** | Tokyo TDC Award 2025 |
| **Client** | Brand name (or self-initiated) |
| **Type designer** | Designer name |
| **Typeface** | Original typeface or existing typeface name |
| **Use** | Branding, packaging, web |

### Design concept
[1-2 sentences explaining the concept]

**Typography features:**
- Character design innovations
- Consideration for legibility and visibility
- Harmony with context

### Points to note
- Rationale for typeface selection
- Typesetting innovations

### Use in proposals
- Applicable methods
```

**MV & video production:**
```markdown
## N. Work title (Artist name - Song title)

| Item | Content |
|------|------|
| **Reference** | [VIMEO/YouTube URL](https://example.com) |
| **Field** | MV & video production |
| **Award** | MVA 2025, Japan Media Arts Festival |
| **Artist** | Artist name |
| **Production company** | [Production company name](https://company.com) |
| **Director** | Director name |
| **Cinematography** | Cinematographer name |
| **Editing** | Editor name |
| **Method** | Live action, CG, animation, mixed |
| **Length** | 3 min 45 sec |

### Concept and story
[1-2 sentences explaining the concept or story]

**Video features:**
- Visual expression innovations
- Camera work and editing techniques
- VFX and CG use

**Harmony with the music:**
- Method of syncing with the track
- Coordination with rhythm

### Points to note
- Technical challenges
- Unique expression methods

### Use in proposals
- Applicable ideas
```

**Spatial design:**
```markdown
## N. Project Name

| Item | Content |
|------|------|
| **Reference** | [Project URL](https://example.com) |
| **Field** | Spatial design |
| **Award** | JCD Design Award 2025 |
| **Client** | Brand name |
| **Spatial designer** | Designer / design firm name |
| **Use** | Store, exhibition, office, event |
| **Area** | XX sqm |
| **Location** | XX ward, Tokyo |

### Design concept
[1-2 sentences explaining the concept]

**Spatial design features:**
- Flow and layout innovations
- Material and lighting selection
- Brand experience design

### Points to note
- Experience design innovations
- Sustainability considerations

### Use in proposals
- Applicable perspectives
```

**Packaging design:**
```markdown
## N. Product Name

| Item | Content |
|------|------|
| **Reference** | [Product info URL](https://example.com) |
| **Field** | Packaging design |
| **Award** | JPDA Award 2025 |
| **Brand** | Brand name |
| **Designer** | Designer name |
| **Materials** | Paper, plastic, metal, etc. |
| **Printing technique** | Offset, letterpress, foil stamping, etc. |
| **Product category** | Food, cosmetics, miscellaneous goods, etc. |

### Design concept
[1-2 sentences explaining the concept]

**Design features:**
- Graphic expression
- Structure and shape innovations
- Environmental considerations

### Points to note
- Shelf presence design
- Unboxing experience design

### Use in proposals
- Applicable ideas
```

**Trend analysis table:**
```markdown
| Trend | Overview | Main fields | Example cases | Featured companies |
|---------|------|---------|---------|-------------|
| **3D + WebGL** | Immersive realistic experiences | Web, MV | Case A, Case B | Garden Eight |
| **Generative AI** | AI-assisted video and content generation | Web, advertising, MV | Case C | mount inc. |
| **Variable fonts** | Responsive typography | Typography, Web, UI | Case D | Quoitworks |
| **Sustainable materials** | Use of eco-friendly materials | Product, packaging | Case E | - |
| **Integrated campaigns** | Online and offline fusion | Advertising, spatial | Case F | SUPER CROWDS |
| **Interactive experiences** | Touch and move experience design | Web, spatial, exhibitions | Case G | HOMUNCULUS |
| **Retro Revival** | Showa-era retro, hand-drawn elements | Web, advertising, packaging | Case H | TryMore |
| **Phygital fusion** | Physical × digital integration | Spatial, Web, installations | Case I | IN FOCUS |
```

**Adjacent field discovery pattern:**
```markdown
## Adjacent Field Discoveries
While researching web design cases, excellent cases from the following adjacent fields were also found:

### Cross-field works by the same production company
- **Garden Eight**: Website (Awwwards SOTD) + MV production (MVA winner)
- **mount inc.**: Campaign site + brand video
- **IN FOCUS**: Corporate site + product video

### Repurposing techniques and methods
- Web motion graphics → independent MG works
- UI animations → MV production techniques
- Interactive web → experiential installations

### Recommended adjacent fields
Including these fields in the next research will provide more comprehensive inspiration:
- MV/video production (especially video works by web production companies)
- Motion graphics
- UI/UX design (apps as an extension of web)
```

**URL/reference verification examples:**

**Example 1: Verifying a website**
```
# Bad (assumption)
Site URL: https://words.inc ← recorded by guessing

# Good (verified)
1. WebSearch "WORDS Inc. official site"
2. Found https://words-inc.co.jp from results
3. Confirmed with WebFetch → 200 OK
Site URL: https://words-inc.co.jp ← verified
```

**Example 2: Verifying an advertising campaign (no website)**
```
# Bad (no reference)
Reference: none ← not recorded because there is no campaign site

# Good (using a media article as reference)
1. WebSearch "BEAMS 50th anniversary campaign 2025 Sendenkaigi"
2. Found a Sendenkaigi article
3. Confirmed with WebFetch → 200 OK
Reference: https://www.sendenkaigi.com/... ← media article verified as reference

or
1. WebSearch "BEAMS 50th anniversary ACC TOKYO award"
2. Found the ACC TOKYO award page
Reference: https://www.acc-awards.com/... ← award page verified as reference
```

**Example 3: Verifying a product design**
```
# Good (product information page)
1. WebSearch "MUJI folding umbrella Good Design Award"
2. Found the product page and Good Design Award page
3. Confirmed both with WebFetch
Reference: https://www.muji.com/... (product page), https://www.g-mark.org/... (award page) ← multiple references
```
</common_patterns>

<reference_guides>
**Award sites:**

**Web design:**
- [Awwwards Japan](https://www.awwwards.com/websites/Japan/) - International web design award
- [CSS Design Awards](https://www.cssdesignawards.com/) - Focused on CSS/UI/UX
- [CSS Winner](https://www.csswinner.com/) - CSS/web design award
- [FWA](https://thefwa.com/) - Creativity-focused award
- [Web Grand Prix](https://award.dmi.jaa.or.jp/) - National Japanese award

**Advertising & marketing:**
- [Cannes Lions](https://www.canneslions.com/) - One of the world's largest advertising festivals
- [D&AD Awards](https://www.dandad.org/) - Prestigious UK advertising award
- [ADC Awards](https://www.oneclub.org/) - New York ADC
- [ACC TOKYO CREATIVITY AWARDS](https://www.acc-awards.com/) - Japanese creative award
- [Sendenkaigi Award](https://www.sendenkaigi.com/) - Japanese advertising award

**Product design:**
- [Red Dot Design Award](https://www.red-dot.org/) - Internationally prestigious design award
- [iF Design Award](https://ifdesign.com/) - German international design award
- [Good Design Award](https://www.g-mark.org/) - Japan's Good Design Award

**Typography:**
- [Tokyo TDC](https://www.tdctokyo.org/) - Tokyo Type Directors Club
- [JAGDA](https://www.jagda.or.jp/) - Japan Graphic Designers Association

**MV & video:**
- [MVA (Music Video Awards)](https://www.mvajapan.com/) - Japanese MV award
- [Japan Media Arts Festival](https://j-mediaarts.jp/) - Animation and video category
- [VIMEO Staff Picks](https://vimeo.com/channels/staffpicks) - VIMEO curated works
- [Shots](https://shots.net/) - International video work platform

**Packaging design:**
- [JPDA](https://www.jpda.or.jp/) - Japan Package Design Association
- [Pentawards](https://www.pentawards.com/) - International packaging design award

**Spatial design:**
- [JCD](https://www.jcd.or.jp/) - Japan Commercial Environment Design Association
- [DSA](https://www.dsa.or.jp/) - Japan Space Design Association

**UI/UX:**
- [App Design Inspiration](https://www.awwwards.com/websites/mobile-excellence/) - Awwwards Mobile
- [UI Movement](https://uimovement.com/) - UI animation collection

**Design galleries and media:**

**Web:**
- [SANKOU!](https://sankoudesign.com/) - Japanese web design gallery
- [MUUUUU.ORG](https://muuuuu.org/) - Gallery focused on long-scroll web design
- [81-web.com](https://81-web.com/) - Japanese web design link collection
- [S5-Style](https://www.s5-style.com/) - Collection of excellent web design
- [URAGAWA](https://mirai-works.co.jp/uragawa/) - Web design reference collection

**General design:**
- [AXIS](https://www.axisinc.co.jp/) - Design specialty magazine
- [Design no Hikidashi](https://www.amazon.co.jp/gp/bookseries/B00CL6YPLC) - Graphic and product design

**Advertising & marketing:**
- [Advertising TIMES](https://www.sendenkaigi.com/books/advertisingtimes/) - Advertising industry magazine
- [Brain](https://www.sendenkaigi.com/books/brain/) - Creative specialty magazine
- [Marketing Native](https://marketingnative.jp/) - Marketing media
- [AdverTimes](https://www.advertimes.com/) - Advertising industry news

**Video & MV:**
- [VIMEO](https://vimeo.com/) - High-quality video platform
- [Motionographer](https://motionographer.com/) - Motion graphics specialty media
- [STASH](https://www.stashmedia.tv/) - Design, video, and VFX

**Spatial:**
- [Space Design](https://www.shotenkenchiku.com/space-design/) - Spatial design specialty magazine
- [Shotenkenchiku](https://www.shotenkenchiku.com/) - Store and commercial space specialty magazine

**Events & exhibitions:**
- [21_21 DESIGN SIGHT](https://www.2121designsight.jp/) - Design facility at Tokyo Midtown
- [GOOD DESIGN EXHIBITION](https://www.g-mark.org/exhibition/) - Good Design Award exhibition
- [Tokyo Midtown DESIGN TOUCH](https://www.tokyo-midtown.com/jp/designtouch/) - Design event

**Search query templates:**

**Web:**
- Awwwards: `Awwwards Japan 2025 December site of the day`
- Japanese awards: `2025 Web Grand Prix winners`

**Advertising:**
- Cannes Lions: `Cannes Lions 2025 Japan Grand Prix`
- ACC: `ACC TOKYO CREATIVITY AWARDS 2025 winners`
- Sendenkaigi: `Sendenkaigi Award 2025 Grand Prix`

**Product:**
- Good Design: `Good Design Award 2025 Best 100`
- Red Dot: `Red Dot Design Award 2025 Japan winner`

**Typography:**
- Tokyo TDC: `Tokyo TDC 2025 Grand Prix`
- JAGDA: `JAGDA newcomer award 2025`

**MV & video:**
- MVA: `MVA 2025 award winners`
- VIMEO: `VIMEO Staff Picks Japan 2025`
- Japan Media Arts: `Japan Media Arts Festival 2025 animation category`

**Packaging:**
- JPDA: `JPDA Award 2025 winners`
- Pentawards: `Pentawards 2025 Japan`

**Spatial:**
- JCD: `JCD Design Award 2025`
- DSA: `DSA Design Award 2025`

**UI/UX:**
- App Design: `Awwwards Mobile Excellence 2025`
- Good Design: `Good Design Award 2025 app`

**Trends:**
- By field: `Japan [field name] design 2025 trends`

**Production company/creator:**
- `[production company name] 2025 work`
- `[production company name] MV video 2025`
- `[director name] 2025 award`

**Searching for featured production company work:**
- Garden Eight: `Garden Eight 2025 works`
- mount inc: `mount inc 2025 video MV`
- IN FOCUS: `IN FOCUS 2025 portfolio`
- TryMore: `TryMore 2025 video production`
- mont: `mont 2025 video branding`

**Featured production company list:**
See [featured-companies.md](./featured-companies.md) for details.
This file covers 16 companies to prioritize in searches (Garden Eight, SUPER CROWDS, MONOPO, mount inc., MEFILAS, STUDIO DETAILS, HOMUNCULUS, Quoitworks, TANE-be, mont., THREE Inc., IN FOCUS, TryMore, NEWTOWN, Fivestar Interactive, ARUTEGA) with their characteristics, strengths, and active fields.
</reference_guides>
