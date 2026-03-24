@AGENTS.md

# CLAUDE.md — Report Builder (Claude-specific context)

> Shared principles, SOLID rules, design ritual, architectural decisions, patterns, and
> workflow are in `AGENTS.md` above. This file adds project-specific context that helps
> Claude understand the codebase: tech stack, full structure, data model, CI pipeline,
> pitfalls, and the mandatory post-task audit checklist.

## Tech stack

| Layer       | Technology                   | Notes                                                                                                                                            |
| ----------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Build       | Vite 6+                      | `npm run build` → static `dist/` folder                                                                                                          |
| Framework   | React 18 + TypeScript        | Strict mode, functional components only                                                                                                          |
| UI library  | Ant Design 6 (v6.3.3)        | Builder interface (not PDF output); v6 injects CSS custom properties (`--ant-*`) by default — this is relied upon in `AppShell.tsx` panel styles |
| Styling     | Tailwind CSS 3               | Custom theming for PDF slide output                                                                                                              |
| Charts      | Chart.js 4 + react-chartjs-2 | Bar, donut, line charts                                                                                                                          |
| Gantt       | Custom SVG renderer          | No library — matches specific design reference                                                                                                   |
| Choropleth  | D3.js + Ukraine GeoJSON      | Oblast-level map with data-driven fills                                                                                                          |
| Grid layout | react-grid-layout v2         | Drag/resize tiles on slide canvas                                                                                                                |
| PDF export  | html2canvas + jsPDF          | Render slides at 1920x1080 → assemble PDF                                                                                                        |
| i18n        | i18next + react-i18next      | UA/EN toggle                                                                                                                                     |
| Font        | e-Ukraine (bundled .woff2)   | Official MinDigit typeface, Cyrillic-first                                                                                                       |

## Project structure

```
report-builder/
├── CLAUDE.md
├── AGENTS.md
├── BUILD_PLAN.md
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.ts
├── .github/
│   └── workflows/
│       └── ci.yml
├── public/
│   └── fonts/
│       └── e-ukraine/           # Bundled .woff2 files
├── src/
│   ├── main.tsx
│   ├── App.tsx                  # Root — i18n + theme providers
│   ├── types/
│   │   ├── slide.ts             # SlideType, SlideData, Report, UndoableState
│   │   ├── chart.ts             # ChartType, ChartData, GanttTask, ChoroplethRegionData
│   │   ├── theme.ts             # ThemePreset enum, ThemeColors
│   │   └── layout.ts            # GridLayout, TileConfig, TileData
│   ├── store/
│   │   ├── actions.ts           # ReportAction union + action creators
│   │   ├── reportReducer.ts     # Pure reducer: Report × ReportAction → Report
│   │   ├── undoMiddleware.ts    # createUndoReducer() factory
│   │   └── ReportContext.tsx    # Provider exposing state, dispatch, canUndo, canRedo
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppShell.tsx     # Top bar + three-panel grid
│   │   │   ├── SlidePanel.tsx   # Left sidebar: slide list
│   │   │   ├── Canvas.tsx       # Center: slide preview + react-grid-layout
│   │   │   └── PropertiesPanel.tsx
│   │   ├── slides/              # One component per SlideType
│   │   │   ├── TitleSlide.tsx
│   │   │   ├── ChartSlide.tsx
│   │   │   ├── DividerSlide.tsx
│   │   │   ├── TextSlide.tsx
│   │   │   └── EndingSlide.tsx
│   │   ├── editors/             # Right-panel editors per slide/tile type
│   │   │   ├── TitleEditor.tsx
│   │   │   ├── ChartTileEditor.tsx
│   │   │   ├── TextTileEditor.tsx
│   │   │   ├── GanttEditor.tsx
│   │   │   ├── MapEditor.tsx
│   │   │   └── DataTableEditor.tsx
│   │   ├── charts/              # Shared between canvas preview and PDF export
│   │   │   ├── BarChart.tsx
│   │   │   ├── DonutChart.tsx
│   │   │   ├── LineChart.tsx
│   │   │   ├── GanttChart.tsx
│   │   │   ├── ChoroplethMap.tsx
│   │   │   └── DataTable.tsx
│   │   └── toolbar/
│   │       └── TileToolbar.tsx
│   ├── themes/
│   │   ├── dark.ts
│   │   ├── mindigit.ts
│   │   ├── light.ts
│   │   └── slate.ts
│   ├── i18n/
│   │   ├── config.ts
│   │   ├── ua.json
│   │   └── en.json
│   ├── services/                # Zero React imports — pure TypeScript
│   │   ├── pdfExport.ts
│   │   ├── csvParser.ts
│   │   └── slideFactory.ts
│   ├── hooks/
│   │   ├── useReport.ts
│   │   ├── useSelectedSlide.ts
│   │   ├── useSelectedTile.ts
│   │   └── useUndoRedo.ts
│   ├── assets/
│   │   └── ukraine-oblasts.geojson
│   └── utils/
│       ├── constants.ts
│       └── formatters.ts
└── tests/
    ├── unit/
    │   ├── reportReducer.test.ts
    │   ├── undoMiddleware.test.ts
    │   ├── csvParser.test.ts
    │   ├── slideFactory.test.ts
    │   └── pdfExport.test.ts
    └── components/
        ├── SlidePanel.test.tsx
        └── ChartTileEditor.test.tsx
```

## Key data model

```typescript
interface Report {
  slides: Slide[]
  theme: ThemePreset
  language: 'ua' | 'en'
}

type SlideType = 'title' | 'chart' | 'divider' | 'text' | 'ending'

interface Slide {
  id: string
  type: SlideType
  data: SlideData // discriminated union — narrow by data.type
  tiles?: TileConfig[] // only present on 'chart' slides
}

interface TileConfig {
  id: string
  type: ChartType | 'text'
  layout: GridLayout // x, y, w, h for react-grid-layout
  data: TileData
  options: ChartOptions
}

type ChartType = 'bar-v' | 'bar-h' | 'donut' | 'line' | 'gantt' | 'choropleth' | 'data-table'

// Undo/redo wrapper — selectedSlide/Tile are UI state, not part of undo history
interface UndoableState {
  past: Report[] // capped at 50
  present: Report
  future: Report[]
  selectedSlideId: string | null
  selectedTileId: string | null
}

// History rules:
// ADD_SLIDE, REMOVE_SLIDE, REORDER_SLIDE, UPDATE_SLIDE_DATA,
// ADD_TILE, REMOVE_TILE, UPDATE_TILE_DATA, UPDATE_TILE_LAYOUT, SET_THEME → push to history
// SELECT_SLIDE, SELECT_TILE, SET_LANGUAGE → apply directly, no history entry
// UPDATE_SLIDE_DATA / UPDATE_TILE_DATA within 500ms on the same id → debounced (replace last entry)
```

## CI/CD pipeline

```yaml
name: CI
on: [push, pull_request]
jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      - run: npm run format:check
      - run: npm run lint
      - run: npm run typecheck
      - run: npm run test -- --run
      - run: npm run build
```

## Common pitfalls

1. **Don't import from CDN at runtime.** All libraries must be in `node_modules`. The app runs offline.
2. **Don't use `position: fixed` in slide renderers.** html2canvas breaks on fixed positioning.
3. **Don't use CSS `calc()` in slide renderers.** html2canvas has limited support — use explicit pixel values.
4. **Test with `file://` after every build.** Open `dist/index.html` directly in Chrome. If it breaks, the build is wrong.
5. **Don't use `localStorage`.** No persistence by design.
6. **Don't hardcode strings.** Everything user-visible goes through i18next.
7. **D3 renders SVG, not canvas.** Test that the choropleth map exports correctly to PDF — html2canvas handles SVG differently from `<canvas>`.
8. **Don't install `@types/react-grid-layout`.** react-grid-layout v2 is TypeScript-native; that package conflicts.
9. **`ThemePreset` is an enum.** Use `ThemePreset.dark`, not the string `'dark'`.
10. **Don't fight Ant Design's CSS variables with inline overrides.** Conflicts mean the `ConfigProvider` is missing or misconfigured. Fix the token configuration at the root — not each component in isolation. Use a nested `ConfigProvider` with `darkAlgorithm` for dark-surfaced regions (e.g. the header) so all child components inherit correct tokens automatically.

## Mandatory post-task code audit

Run this against every file touched. Not optional — fix violations before committing.
Fixes go in a separate `refactor:` commit, never bundled with feature changes.

### Correctness

- [ ] No `any` types introduced
- [ ] No `as X` casts without an explanatory comment
- [ ] No `!` non-null assertions
- [ ] All `switch` on discriminated unions are exhaustive
- [ ] No unhandled promise rejections; PDF export has try/catch
- [ ] No silent `undefined` returns where the caller expects a value

### Design

- [ ] No component exceeds 150 lines
- [ ] No prop drilling deeper than 2 levels
- [ ] No duplicate logic across 2+ files
- [ ] No `useEffect` for derived state
- [ ] No business logic inside JSX or component render bodies
- [ ] No inline object/array literals in JSX props

### Code hygiene

- [ ] No dead code: unused imports, unreachable branches, commented-out blocks
- [ ] No magic numbers or strings — all in `src/utils/constants.ts`
- [ ] No `console.log` statements
- [ ] File names match their default export

### Project constraints

- [ ] No hardcoded UI strings — all through i18next
- [ ] No `localStorage`, `sessionStorage`, or `IndexedDB`
- [ ] No runtime CDN imports
- [ ] `services/` files have zero React imports
- [ ] No `position: fixed` or CSS `calc()` in slide renderer components

### Accessibility

- [ ] Form inputs have associated `<label>` elements
- [ ] Interactive elements are keyboard-navigable
- [ ] Custom controls have appropriate ARIA attributes
