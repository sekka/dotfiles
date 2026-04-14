---
name: user-research-creative
description: Research the latest Japanese creative work (web, ads, products, music videos, landing pages, typography, packaging, spaces, UI/UX, exhibitions, etc.) from awards and trends. Generates a curated Markdown report. Suggests related fields. Useful for team inspiration, client proposals, and design trend analysis.
disable-model-invocation: false
---

<objective>
Automatically research and document the latest Japanese creative work from major domestic and international award sites (Awwwards, Red Dot, D&AD, ADC, Cannes Lions, Japan Media Arts Festival, etc.) and specialized galleries (SANKOU!, MUUUUU.ORG, VIMEO Staff Picks, etc.). Fields covered: web design, advertising campaigns, product design, music videos and video production, landing pages, typography, packaging, spatial design, UI/UX, motion graphics, exhibitions, installations, and more. Prioritizes work from featured production companies and suggests adjacent fields based on user interests. Generates a structured Markdown report that includes award information, production company/director, techniques and methods, and trend analysis. Useful for team inspiration and client proposals.
</objective>

<quick_start>
**Basic usage:**
```
/user-research-creative
```
Collects 20 cases from the last 2 months and saves to `creative-cases/YYYYMMDD-web-creative-cases-YYYYMM-YYYYMM.md`

**Items to confirm before starting:**
1. Target field (Web, advertising, MV/video, product, UI/UX, typography, packaging, spatial, LP, etc.)
2. Whether to also research adjacent fields (recommended: automatically suggest genres related to the selected field)
3. Target period (last 1 week to 6 months)
4. Number of cases to collect (10-30)
5. Purpose (inspiration, client proposal, trend analysis, competitive research)

> For complete source lists by creative field, see [references/research-sources.md](references/research-sources.md)
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
Run multiple WebSearch queries simultaneously based on the target field.

| Field | Key award sites | Key galleries/media |
|-------|----------------|---------------------|
| Web | Awwwards, CSS Design Awards, Web Grand Prix | SANKOU!, MUUUUU.ORG |
| Advertising | Cannes Lions, D&AD, ADC, ACC TOKYO | Advertising TIMES, Brain |
| MV/video | MVA, VIMEO Staff Picks, Japan Media Arts Festival | Motionographer, STASH |
| Product | Red Dot, iF Design, Good Design Award | AXIS, Design no Hikidashi |
| UI/UX | Awwwards Mobile Excellence, FWA Mobile | UI Movement |
| Typography | Tokyo TDC, JAGDA | Typography Gallery |
| Packaging | JPDA, Pentawards | Design no Hikidashi |
| Spatial | JCD, DSA | Space Design, Shotenkenchiku |
| Motion graphics | VIMEO Staff Picks | Motionographer, STASH |
| Exhibitions | Japan Media Arts Festival, Ars Electronica | 21_21 DESIGN SIGHT |

Also search: trend articles (`Japan [field name] design 2025 trends`) and the latest work from the 16 featured companies in featured-companies.md.

> For complete source lists and search strategies per field, see [references/research-sources.md](references/research-sources.md)

**3. Data Collection**
- Prioritize award-winning works; ensure diversity across categories, companies, and techniques
- Verify each URL/reference with WebFetch: 404/403 → search correct URL → try Archive.org → use media article or award page → replace case if still unavailable
- Never guess domains; confirm all URLs by search before recording
- Collect field-specific data required per case (MV: length + shooting method; product/packaging: materials; spatial: area sqm + location)

> See [references/case-formats.md](references/case-formats.md) for detailed case entry format and field-specific data requirements.

**4. Featured Companies**
Search and collect the latest work from the 16 companies listed in featured-companies.md. Browse each company's official Works/portfolio page and their URAGAWA entries. Search across fields (Web, MV/video, graphics, etc.). State the work count per company clearly in the report.

**5. Report Generation**
Generate a Markdown file including: header with period and field/industry breakdowns, table of contents with award annotations, structured case entries, cross-field trend analysis table (10+ trends), adjacent field discoveries section, and reference links. Save with the naming format `YYYYMMDD-[field]-cases-YYYYMM-YYYYMM.md`.

> See [references/case-formats.md](references/case-formats.md) for the report file structure template and all case entry formats.
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
</anti_patterns>

## Status

Add one of the following at the end of every response:
- `## Status: DONE` — all target cases collected, URLs verified, Markdown report saved with trend analysis
- `## Status: DONE_WITH_CONCERNS` — report saved but some URLs could not be verified or case count fell short of target
- `## Status: BLOCKED` — unable to access required research sources or browser tool is unavailable
- `## Status: NEEDS_CONTEXT` — target field, period, or case count not yet confirmed by the user
