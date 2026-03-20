# CLAUDE.md — Report Builder Project Intelligence

## Project overview

**Report Builder** is a local-only, offline web application for building stylish 16:9 presentation-style PDF reports. It targets the Ukrainian Ministry of Digital Transformation. No backend, no network calls, no cloud deployment. The output is a `dist/` folder that opens directly in Chrome via `file://` protocol.

## Tech stack

| Layer | Technology | Notes |
|---|---|---|
| Build | Vite 6+ | `npm run build` → static `dist/` folder |
| Framework | React 18 + TypeScript | Strict mode, functional components only |
| UI library | Ant Design 5 | Builder interface (not PDF output) |
| Styling | Tailwind CSS 3 | Custom theming for PDF slide output |
| Charts | Chart.js 4 + react-chartjs-2 | Bar, donut, line charts |
| Gantt | Custom SVG renderer | No library — matches specific design reference |
| Choropleth | D3.js + Ukraine GeoJSON | Oblast-level map with data-driven fills |
| Grid layout | react-grid-layout v2 | Drag/resize tiles on slide canvas |
| PDF export | html2canvas + jsPDF | Render slides at 1920x1080 → assemble PDF |
| i18n | i18next + react-i18next | UA/EN toggle |
| Font | e-Ukraine (bundled .woff2) | Official MinDigit typeface, Cyrillic-first |

## Architecture principles

- **SOLID everywhere.** Single responsibility per component/hook. Depend on abstractions (interfaces), not implementations.
- **No network calls.** The app must function entirely offline. No CDN imports at runtime, no analytics, no telemetry. All libraries are bundled.
- **`file://` compatible output.** The `dist/` folder must work when opened directly in Chrome without a server. Use relative paths only. No absolute URLs. Test with `file://` after every build.
- **Separation of concerns.** Builder UI logic (React/Ant Design) is completely separate from slide rendering logic (Canvas/SVG for PDF). Slide renderers must be pure functions: `(slideData, theme) => HTMLElement`.
- **Type everything.** No `any` types. All slide data, chart configs, theme objects, and layout positions have explicit TypeScript interfaces.

## Project structure

```
report-builder/
├── CLAUDE.md                    # This file
├── BUILD_PLAN.md                # Phased build plan with prompts
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.ts
├── .eslintrc.cjs
├── .prettierrc
├── .github/
│   └── workflows/
│       └── ci.yml               # Lint + format check + test
├── public/
│   └── fonts/
│       └── e-ukraine/           # Bundled font files (.woff2)
├── src/
│   ├── main.tsx                 # Entry point
│   ├── App.tsx                  # Root with providers (i18n, theme)
│   ├── types/                   # All TypeScript interfaces
│   │   ├── slide.ts             # SlideType, SlideData, TitleSlideData, ChartSlideData...
│   │   ├── chart.ts             # ChartType, ChartConfig, BarChartConfig, DonutConfig...
│   │   ├── theme.ts             # ThemePreset, ThemeColors
│   │   └── layout.ts            # TileLayout, GridPosition
│   ├── store/                   # State management (React context + useReducer)
│   │   ├── ReportContext.tsx     # Global report state
│   │   ├── reportReducer.ts     # Pure reducer function, fully tested
│   │   ├── undoMiddleware.ts    # Wraps reducer with undo/redo history stack
│   │   └── actions.ts           # Action creators (includes UNDO, REDO)
│   ├── components/
│   │   ├── layout/              # Three-panel builder layout
│   │   │   ├── AppShell.tsx     # Top bar + three-panel grid
│   │   │   ├── SlidePanel.tsx   # Left sidebar: slide list
│   │   │   ├── Canvas.tsx       # Center: slide preview with react-grid-layout
│   │   │   └── PropertiesPanel.tsx  # Right: context-sensitive editor
│   │   ├── slides/              # Slide type components (for preview rendering)
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
│   │   ├── charts/              # Chart rendering components (used in both preview and PDF)
│   │   │   ├── BarChart.tsx
│   │   │   ├── DonutChart.tsx
│   │   │   ├── LineChart.tsx
│   │   │   ├── GanttChart.tsx
│   │   │   ├── ChoroplethMap.tsx
│   │   │   └── DataTable.tsx
│   │   └── toolbar/
│   │       └── TileToolbar.tsx  # Add-tile toolbar above canvas
│   ├── themes/                  # Theme preset definitions
│   │   ├── dark.ts              # NCSI / Diia City style
│   │   ├── mindigit.ts          # Dark green + gold
│   │   ├── light.ts             # White background, colored charts
│   │   └── slate.ts             # Dark gray, muted tones
│   ├── i18n/                    # Internationalization
│   │   ├── config.ts
│   │   ├── ua.json
│   │   └── en.json
│   ├── services/                # Business logic, no React dependencies
│   │   ├── pdfExport.ts         # html2canvas + jsPDF pipeline
│   │   ├── csvParser.ts         # Parse CSV/TSV input into chart data
│   │   └── slideFactory.ts      # Create default slide data by type
│   ├── hooks/                   # Custom React hooks
│   │   ├── useReport.ts         # Convenience hook for ReportContext
│   │   ├── useSelectedSlide.ts
│   │   ├── useSelectedTile.ts
│   │   └── useUndoRedo.ts       # Returns { canUndo, canRedo, undo, redo }
│   ├── assets/
│   │   └── ukraine-oblasts.geojson  # Oblast boundaries for choropleth
│   └── utils/
│       ├── constants.ts         # Slide dimensions, grid cols, etc.
│       └── formatters.ts        # Number formatting, date formatting
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
// Core types — these drive everything
interface Report {
  slides: Slide[];
  theme: ThemePreset;
  language: 'ua' | 'en';
}

type SlideType = 'title' | 'chart' | 'divider' | 'text' | 'ending';

interface Slide {
  id: string;
  type: SlideType;
  data: SlideData;          // Discriminated union by type
  tiles?: TileConfig[];     // Only for 'chart' type slides
}

interface TileConfig {
  id: string;
  type: ChartType | 'text';
  layout: GridLayout;       // x, y, w, h for react-grid-layout
  data: ChartData | TextData;
  options: ChartOptions;
}

type ChartType = 'bar-v' | 'bar-h' | 'donut' | 'line' | 'gantt' | 'choropleth' | 'data-table';

// Undo/redo — wraps the report state with history
interface UndoableState {
  past: Report[];       // Previous states (max 50 entries)
  present: Report;      // Current state
  future: Report[];     // States undone (cleared on new action)
  selectedSlideId: string | null;
  selectedTileId: string | null;
}

// Actions that modify report content push to history.
// UI-only actions (SELECT_SLIDE, SELECT_TILE, SET_LANGUAGE) do NOT push to history.
// SET_THEME DOES push to history (it changes the report output).
```

## Code quality rules

### Formatting and linting
- **Prettier** runs on every file before commit. Config: single quotes, no semicolons, 100 char line width, trailing commas.
- **ESLint** with `@typescript-eslint/recommended` + `react-hooks/recommended`. Zero warnings policy.
- **Before every commit:** Run `npm run format && npm run lint && npm run test`.
- **Before every push:** CI runs the same checks. Failing CI blocks merge.

### Testing
- **Vitest** for unit and component tests.
- **Coverage target:** 80%+ on `services/`, `store/`, and `utils/`.
- **What to test:**
  - `reportReducer` — every action type with edge cases
  - `csvParser` — various CSV/TSV formats, malformed input, empty input
  - `slideFactory` — default data for each slide type
  - `pdfExport` — mock html2canvas/jsPDF, test pipeline orchestration
  - Chart components — render with sample data, no runtime errors
- **What NOT to test:** Ant Design internals, react-grid-layout drag mechanics.

### Naming conventions
- Components: PascalCase (`BarChart.tsx`)
- Hooks: camelCase with `use` prefix (`useReport.ts`)
- Types/interfaces: PascalCase (`ChartConfig`)
- Constants: UPPER_SNAKE_CASE (`SLIDE_WIDTH`)
- Files match their default export name

### Git practices
- Conventional commits: `feat:`, `fix:`, `refactor:`, `test:`, `chore:`
- One logical change per commit
- Branch per milestone: `feat/phase-1-shell`, `feat/phase-2-charts`, etc.

## CI/CD pipeline (.github/workflows/ci.yml)

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

## Common pitfalls to avoid

1. **Don't import from CDN at runtime.** All libraries must be in `node_modules` and bundled by Vite. The app runs offline.
2. **Don't use `position: fixed` in slide renderers.** Slides are rendered to canvas for PDF — fixed positioning breaks html2canvas.
3. **Don't use CSS `calc()` in slide renderers.** html2canvas has limited support. Use explicit pixel values.
4. **Don't forget `file://` testing.** After `npm run build`, open `dist/index.html` directly in Chrome. If anything breaks, the build is wrong.
5. **Don't use `localStorage`.** The app has no persistence by design.
6. **Don't hardcode Ukrainian/English strings.** Everything user-facing goes through i18next, even if it seems small.
7. **Chart.js renders to `<canvas>` which html2canvas handles well.** But D3 renders to SVG — test that the choropleth map exports correctly to PDF.
8. **react-grid-layout v2 is TypeScript-native.** Don't install `@types/react-grid-layout` — it conflicts.

## Passive code audit checklist

After completing any task, review the codebase for:

- [ ] **Dead code** — unused imports, unreachable branches, commented-out code
- [ ] **Type safety** — any `as any` casts, missing return types, loose generics
- [ ] **Component size** — any component over 150 lines should be split
- [ ] **Prop drilling** — more than 2 levels of props? Use context or composition
- [ ] **Duplicate logic** — same pattern in 2+ places? Extract a hook or utility
- [ ] **Magic numbers** — any raw numbers? Move to constants
- [ ] **Error handling** — unhandled promise rejections, missing try/catch on PDF export
- [ ] **Accessibility** — form labels, keyboard navigation, ARIA attributes on custom controls
- [ ] **i18n coverage** — any hardcoded strings visible to the user?

If any issues are found, propose fixes as a separate commit with `refactor:` prefix.
