# Presentation visual style guide — "Trident" design system

You are building slides for a presentation builder. This document is the complete visual specification. Follow it exactly. The user controls two things: **theme** (`dark` or `light`) and **text content**. Everything else — layout, colors, typography, spacing, the Trident mark — is defined here and must not be improvised.

---

## Design philosophy

The aesthetic is **institutional minimalism with a single accent color**. Think: a government ministry that hired a world-class design agency. Every slide has massive breathing room, confident typography, and exactly one visual anchor. There is no decoration — every element communicates.

**Core rules:**

- One accent color (periwinkle `#7B6EF6`) used everywhere — never introduce a second brand color
- The 4px left-edge accent bar appears on every slide, without exception
- Left-aligned text, generous bottom anchoring — titles sit in the lower third, never centered vertically
- No icons, illustrations, stock photos, or clip art — only typography, geometry, the Trident, and data charts
- At least 40% of every slide is empty space
- No gradients, drop shadows, glows, or textures

---

## Color system

### Dark theme

| Token             | Hex                         | Usage                                                                                                     |
| ----------------- | --------------------------- | --------------------------------------------------------------------------------------------------------- |
| `bg`              | `#0C0C0E`                   | Slide background (content, divider, chart, text slides)                                                   |
| `bg-accent`       | `#7B6EF6`                   | Title and ending slide backgrounds (light theme only — in dark theme this is the accent, not the bg)      |
| `fg-primary`      | `#FFFFFF`                   | Titles, headings, primary text                                                                            |
| `fg-secondary`    | `#FFFFFF` at 40% opacity    | Subtitles, descriptions, body text                                                                        |
| `fg-tertiary`     | `#FFFFFF` at 20–25% opacity | Footer labels, page numbers, metadata                                                                     |
| `accent`          | `#7B6EF6`                   | Left-edge bar, accent bars next to text items, section numbers, title highlight line, chart primary color |
| `accent-muted`    | `#7B6EF6` at 30–40% opacity | Decorative rules, short accent lines                                                                      |
| `chart-secondary` | `#3A3A4A` at 50% opacity    | Chart comparison bars (target/baseline)                                                                   |
| `rule`            | `#FFFFFF` at 6–8% opacity   | Horizontal divider rules, axis lines                                                                      |
| `trident`         | `#FFFFFF` at 12% opacity    | Watermark Trident on ending slide                                                                         |
| `trident-header`  | `#7B6EF6` at 90% opacity    | Trident in header position (title slide)                                                                  |

### Light theme

| Token                         | Hex                         | Usage                                                           |
| ----------------------------- | --------------------------- | --------------------------------------------------------------- |
| `bg-content`                  | `#F3F2FA`                   | Content, divider, chart, text slide backgrounds                 |
| `bg-statement`                | `#7B6EF6`                   | Title and ending slide backgrounds                              |
| `fg-primary` on content       | `#1A1A2E`                   | Titles, headings on content slides                              |
| `fg-primary` on statement     | `#FFFFFF`                   | Text on periwinkle backgrounds                                  |
| `fg-secondary` on content     | `#1A1A2E` at 45% opacity    | Subtitles, body text                                            |
| `fg-secondary` on statement   | `#1A1A2E` at 50% opacity    | Subtitles on periwinkle backgrounds                             |
| `fg-tertiary`                 | `#1A1A2E` at 25–30% opacity | Footer labels, page numbers                                     |
| `accent` on content           | `#7B6EF6`                   | Accent bars, section numbers, chart color                       |
| `accent` on statement         | `#1A1A2E`                   | Left-edge bar and accent elements on periwinkle background      |
| `highlight-text` on statement | `#FFFFFF`                   | The second line of the title (contrast against dark first line) |
| `chart-secondary`             | `#D4D0F0`                   | Light-theme chart comparison bars                               |
| `rule` on content             | `#1A1A2E` at 6–8% opacity   | Horizontal divider rules                                        |
| `trident-header` on statement | `#1A1A2E` at 80% opacity    | Trident in header on periwinkle                                 |
| `trident` on statement        | `#1A1A2E` at 10% opacity    | Watermark Trident on ending slide                               |

### Key theme logic

- **Dark theme**: all slides use the same dark background `#0C0C0E`. Periwinkle appears only as accent strokes, text highlights, and the left-edge bar.
- **Light theme**: content slides (text, chart, divider) use lavender-tinted white `#F3F2FA`. Statement slides (title, ending) use solid periwinkle `#7B6EF6` as the full background — this is the signature move.
- The left-edge bar color flips: periwinkle on dark bg, navy `#1A1A2E` on periwinkle bg.
- The Trident mark color flips: periwinkle strokes on dark, navy strokes on periwinkle.

---

## Typography

**Font stack:** `'DM Sans', 'Inter', sans-serif`

Use DM Sans as the primary typeface. Fall back to Inter. Never use serif fonts, decorative fonts, or monospaced fonts anywhere in the deck.

### Type scale

| Element                 | Size (pt) | Weight         | Letter-spacing | Case          | Notes                                             |
| ----------------------- | --------- | -------------- | -------------- | ------------- | ------------------------------------------------- |
| Title line (large)      | 54pt      | 700 (bold)     | -1pt (tight)   | Sentence case | Two-line titles split into separate text elements |
| Section title (divider) | 42pt      | 600 (semibold) | -0.5pt         | Sentence case |                                                   |
| Slide heading           | 22pt      | 600 (semibold) | -0.3pt         | Sentence case | Top of content/chart slides                       |
| Body item heading       | 15pt      | 500 (medium)   | 0              | Sentence case | Bold line in text item blocks                     |
| Body text               | 13pt      | 300 (light)    | 0              | Sentence case | Description under item headings                   |
| Subtitle / tagline      | 16pt      | 300 (light)    | 0.5pt          | Sentence case | Below title, muted opacity                        |
| Section number          | 14pt      | 500 (medium)   | 3pt            | Numerals      | "01", "02" etc. on divider slides                 |
| Organization label      | 13pt      | 400 (regular)  | 0.3pt          | Sentence case | Next to Trident mark                              |
| Ending main text        | 40pt      | 300 (light)    | 1pt            | Sentence case | "Thank you" — intentionally thin                  |
| Contact info            | 13–14pt   | 400 (regular)  | 0              | lowercase     | URL, email on ending slide                        |
| Footer text             | 11pt      | 400 (regular)  | 0.5–1.5pt      | ALL CAPS      | Date, "CONFIDENTIAL", org name                    |
| Chart label             | 11pt      | 400–500        | 0              | Sentence case | Axis labels, data values, legend                  |

### Title split rule

Titles are always split across two lines, rendered as two separate text elements. **The second line uses the accent/contrast color** — periwinkle `#7B6EF6` on dark theme, white `#FFFFFF` on light (periwinkle bg). This two-tone treatment is the primary visual signature of the deck.

Example on dark theme:

- Line 1: "C-UAS pilot" → white `#FFFFFF`
- Line 2: "digital cabinet" → periwinkle `#7B6EF6`

Example on light theme (periwinkle background):

- Line 1: "C-UAS pilot" → navy `#1A1A2E`
- Line 2: "digital cabinet" → white `#FFFFFF`

---

## The Trident mark (Ukrainian coat of arms)

The Trident is drawn as a clean line-art SVG path, never as a raster image. It appears in two contexts:

### 1. Header mark (title slide)

Position: top-left corner, approximately 36×48 unit bounding box, at coordinates matching the left margin. Drawn with stroke only (no fill), stroke-width ~1.8, with rounded caps and joins.

The SVG path for the Trident (relative coordinates, translate to position):

```
Center prong top:     M18 6 L18 -2 L16 -6 L18 -12 L20 -6 L18 -2
Center prong shaft:   M18 6 L18 36
Left prong curve:     M4 14 C4 4, 8 0, 13 -4
Left prong shaft:     M4 14 L4 36
Right prong curve:    M32 14 C32 4, 28 0, 23 -4
Right prong shaft:    M32 14 L32 36
Base connecting arc:  M4 36 Q4 44, 11 44 L25 44 Q32 44, 32 36
Center base:          M18 36 L18 44
```

- On dark theme: stroke color = `#7B6EF6`, opacity 0.9
- On light theme (periwinkle bg): stroke color = `#1A1A2E`, opacity 0.8

Beside the Trident (to its right, vertically centered), place the organization name in the organization label style.

### 2. Watermark (ending slide)

Same path, scaled ~2× larger, centered on the slide. Stroke-width ~2, opacity very low (10–12%). It sits behind the "Thank you" text as a subtle background element.

- On dark theme: stroke color = `#FFFFFF`, opacity 0.12
- On light theme (periwinkle bg): stroke color = `#1A1A2E`, opacity 0.10

### PptxGenJS implementation note

Since PptxGenJS doesn't support arbitrary SVG paths natively, render the Trident as an SVG, convert to PNG with a transparent background using a tool like `sharp`, and embed it as an image via `addImage({ data: base64png, ... })`.

---

## Layout system

**Slide dimensions:** 16:9 (960×540 units / 10"×5.625" in PptxGenJS)

### Margins and spacing

| Element           | Value                       | Notes                            |
| ----------------- | --------------------------- | -------------------------------- |
| Left margin       | 60px (0.625")               | All content starts here          |
| Right margin      | 60px (0.625")               | Content ends at 900px (9.375")   |
| Top margin        | 48–56px (0.5")              | First content element            |
| Bottom margin     | ~30px above footer          | Content breathing room           |
| Footer y-position | 510px (5.3")                | Bottom metadata line             |
| Left-edge bar     | x=0, width=4px, full height | Always present                   |
| Item spacing      | 72px between item blocks    | Vertical rhythm for text slides  |
| Accent bar width  | 3px                         | Vertical bars next to text items |
| Accent bar height | 48px                        | Matches two-line item block      |
| Horizontal rule   | full width, 0.5px           | Below headings                   |
| Short accent rule | 40px wide, 1px tall         | Below Trident header area        |

### Content zones

```
┌──────────────────────────────────────────┐
│▌                                          │  ← 4px accent bar, full height
│  [Trident + Org label]      TOP ZONE      │  y: 48–120
│  ─── (short accent rule) ───              │
│                                           │
│                                           │
│                             MID ZONE      │  y: 120–400
│                             (empty on     │
│                              title slide) │
│                                           │
│  TITLE LINE 1               LOWER ZONE   │  y: 300–420
│  TITLE LINE 2 (accent color)             │
│  Subtitle text                            │
│                                           │
│  DATE                    CONFIDENTIAL     │  y: 510 (footer)
└──────────────────────────────────────────┘
```

---

## Slide types

### 1. Title slide

**Purpose:** Opening slide. Sets the tone.

**Background:**

- Dark theme: `#0C0C0E`
- Light theme: `#7B6EF6` (solid periwinkle)

**Elements:**

1. Left-edge bar (4px, full height)
2. Trident header mark (top-left, at left margin, ~y=48)
3. Organization label (to right of Trident, vertically centered with mark)
4. Short accent rule (40px wide, 1px, below org label area, at ~y=108)
5. Title line 1 (54pt bold, at ~y=310, primary text color)
6. Title line 2 (54pt bold, at ~y=375, accent/contrast color)
7. Subtitle (16pt light, at ~y=420, secondary text color)
8. Footer left: date (11pt, ALL CAPS, tertiary color, y=510)
9. Footer right: "CONFIDENTIAL" or classification (11pt, ALL CAPS, tertiary, y=510, right-aligned)

**No other elements.** No decorative shapes, no background patterns, no imagery.

### 2. Divider slide

**Purpose:** Section separator. Creates a pause between content sections.

**Background:**

- Dark theme: `#0C0C0E`
- Light theme: `#F3F2FA`

**Elements:**

1. Left-edge bar (4px, full height)
2. Section number ("01", "02", etc.) — 14pt medium, accent color, letter-spacing 3pt, at ~y=235
3. Short accent rule (24px wide, 2px tall, accent color at 35–40% opacity, at ~y=252)
4. Section title (42pt semibold, primary text color, at ~y=310)
5. Section description (16pt light, secondary text color, at ~y=350)

**Vertical centering:** The section number + rule + title + description block should sit roughly in the vertical middle of the slide, biased slightly above center.

### 3. Text content slide

**Purpose:** Structured information. Key points, objectives, features.

**Background:**

- Dark theme: `#0C0C0E`
- Light theme: `#F3F2FA`

**Elements:**

1. Left-edge bar (4px, full height)
2. Slide heading (22pt semibold, primary text color, at ~y=56)
3. Horizontal rule (full content width, 0.5px, rule color, at ~y=74)
4. Content items — repeating block structure (see below)
5. Footer left: org name (11pt, tertiary)
6. Footer right: page number (11pt, tertiary)

**Content item block** (repeats vertically, 72px apart):

```
│▌ [3px accent bar, 48px tall, periwinkle]
│   Item heading (15pt medium, primary text)
│   Item description (13pt light, secondary text)
```

- The 3px accent bar sits at x=60, aligned left with the item text at x=78 (18px indent)
- Each block is 48px tall (accent bar height)
- Space between blocks: 24px (totaling 72px from top of one block to top of next)
- Maximum 4–5 items per slide — if more, split across slides

### 4. Chart slide

**Purpose:** Data visualization with clean, branded appearance.

**Background:**

- Dark theme: `#0C0C0E`
- Light theme: `#F3F2FA`

**Elements:**

1. Left-edge bar (4px, full height)
2. Chart title (22pt semibold, primary text, at ~y=56)
3. Chart subtitle / date range (13pt light, secondary text, at ~y=78)
4. Legend (top-right area, using small colored squares 10×10px with labels)
5. Horizontal rule (full width, 0.5px, at ~y=100)
6. Chart area (from ~y=120 to ~y=430)
7. X-axis labels (11pt, 35% opacity)
8. Data value labels above bars (11pt medium, 70% opacity)
9. Footer (same as text slide)

**Chart styling:**

- Primary data bars: accent color `#7B6EF6`, border-radius 3px on top corners
- Secondary/target bars: `#3A3A4A` at 50% opacity (dark) or `#D4D0F0` (light)
- X-axis line: 0.5px, rule color
- No Y-axis line, no gridlines — data labels on bars replace the need for a Y-axis scale
- Bar width: ~40px with ~20px gap between paired bars
- Bar groups spaced ~130px apart
- No chart background fill — transparent to slide background

**PptxGenJS chart implementation:**

```javascript
slide.addChart(pres.charts.BAR, chartData, {
  x: 0.6,
  y: 1.1,
  w: 8.5,
  h: 3.5,
  barDir: 'col',
  chartColors: ['7B6EF6', '3A3A4A'], // dark theme; use '7B6EF6','D4D0F0' for light
  barGapWidthPct: 50,
  chartArea: { fill: { color: bgColor, transparency: 100 } },
  plotArea: { fill: { color: bgColor, transparency: 100 } },
  catAxisLabelColor: textTertiary,
  catAxisLineShow: true,
  catAxisLineColor: ruleColor,
  catAxisLineSize: 0.5,
  valAxisLineShow: false,
  valGridLine: { style: 'none' },
  catGridLine: { style: 'none' },
  showValue: true,
  dataLabelPosition: 'outEnd',
  dataLabelColor: textSecondary,
  showLegend: false,
})
```

**For donut/pie charts:**

- Use accent color for primary segment, progressively lighter/muted for others
- Dark theme series: `['7B6EF6', '5B4EC6', '3A3A4A', '2A2A3A']`
- Light theme series: `['7B6EF6', 'A49BF8', 'D4D0F0', 'E8E6F5']`
- Place legend to the right of the chart, not below

### 5. Ending slide

**Purpose:** Closing. Clean, centered, resolved.

**Background:**

- Dark theme: `#0C0C0E`
- Light theme: `#7B6EF6` (solid periwinkle — mirrors title slide)

**Elements:**

1. Left-edge bar (4px, full height)
2. Watermark Trident (centered, large, very low opacity — see Trident section)
3. Main text: "Thank you" (40pt light weight, centered horizontally at x=480, ~y=310, primary text at 90–95% opacity)
4. Short accent rule (100px wide, centered, 2px tall, at ~y=330)
5. Organization name (14pt regular, centered, secondary text, at ~y=370)
6. Contact email/URL (13pt regular, accent color or contrasting, centered, at ~y=395)
7. Footer center: date (11pt, tertiary, centered, y=510)

**The ending slide is the only slide with centered composition.** All other slides are left-aligned.

---

## Additional slide types (extend as needed)

### Two-column slide

For comparisons, before/after, or side-by-side content.

- Left column: x=60 to x=450 (content width ~390px)
- Right column: x=500 to x=900 (content width ~400px)
- Vertical divider: 0.5px line at x=475, from y=100 to y=430, rule color
- Each column follows the same item block structure as the text content slide
- Column headers: 15pt medium, primary text

### Metrics / KPI slide

For large stat callouts.

- 2–4 metric cards arranged horizontally
- Each card: large number (48pt bold, accent color) + label below (13pt, secondary text)
- Cards spaced evenly across the content width
- Optional: thin accent rule (40px, 1px) between number and label
- No card backgrounds, borders, or boxes — just the numbers floating on the slide background

### Timeline / process slide

For sequential steps.

- Horizontal layout: steps arranged left to right
- Each step: section number (14pt, accent) + step title (15pt medium) + description (13pt light)
- Connected by thin horizontal lines (0.5px, rule color) between steps
- Active/current step highlighted with accent color number; completed steps use primary text; future steps use tertiary opacity
- Maximum 4–5 steps per slide

### Quote / highlight slide

For a key quote, stat, or callout.

- Single large text element, centered vertically and left-aligned
- Quote text: 32pt, weight 300 (light), primary color at 90% opacity
- Attribution: 14pt, secondary text, below the quote
- Large accent bar (4px wide, matching quote height) at x=52, positioned as a pull-quote marker
- No quotation marks — the bar and typography signal it's a quote

---

## Implementation checklist

When building any slide, verify these requirements:

1. **Left-edge bar present** — 4px wide, full slide height, correct color for theme
2. **Background correct** — statement slides (title/ending) use different bg from content slides in light theme
3. **Typography matches scale** — check size, weight, letter-spacing, and case for each element against the type scale table
4. **Two-tone title** — line 1 and line 2 use different colors per the title split rule
5. **Opacity values correct** — secondary text at 40–45%, tertiary at 20–25%, rules at 6–8%
6. **No extra decoration** — no icons, shadows, gradients, patterns, borders (except the defined accent bars and rules)
7. **Spacing consistent** — 72px between item blocks, 60px margins, footer at y=510
8. **Trident rendered correctly** — line-art style, correct color/opacity for context, properly scaled
9. **Footer present on all slides except title** — org name left, page number right
10. **Chart styling follows spec** — no gridlines, data labels above bars, branded colors, no chart bg fill

---

## Color quick-reference

### Hex values you will use repeatedly

```
#0C0C0E   — dark slide background
#F3F2FA   — light content slide background
#7B6EF6   — periwinkle accent (the ONE brand color)
#1A1A2E   — navy text on light/periwinkle backgrounds
#FFFFFF   — white text on dark backgrounds
#3A3A4A   — dark chart secondary
#D4D0F0   — light chart secondary
#3C3489   — dark periwinkle for data labels on light bg
```

### Do not use

- Any color not listed above (no reds, greens, oranges, blues other than periwinkle)
- Any gradient
- Any transparency/opacity encoded in hex — always use separate opacity/transparency properties
- Black `#000000` — use `#0C0C0E` or `#1A1A2E` instead
