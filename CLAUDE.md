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

- **No network calls.** The app must function entirely offline. No CDN imports at runtime, no analytics, no telemetry. All libraries are bundled.
- **`file://` compatible output.** The `dist/` folder must work when opened directly in Chrome without a server. Use relative paths only. No absolute URLs. Test with `file://` after every build.
- **Separation of concerns.** Builder UI logic (React/Ant Design) is completely separate from slide rendering logic (Canvas/SVG for PDF). Slide renderers must be pure functions: `(slideData, theme) => HTMLElement`.
- **Type everything.** No `any` types. All slide data, chart configs, theme objects, and layout positions have explicit TypeScript interfaces.

## SOLID principles — mandatory, not optional

Every piece of code written or modified must conform to all five SOLID principles. These are hard requirements, not guidelines.

### S — Single Responsibility Principle
Each module, component, hook, or function does exactly one thing and has exactly one reason to change.

- A component renders UI. It does not fetch data, format strings, or compute derived values inline.
- A hook encapsulates one behavior (e.g. `useUndoRedo` manages undo/redo; it does not also manage selection).
- A service function does one transformation (e.g. `csvParser` parses CSV; it does not also validate chart config).
- **Violation signal:** a function/component name contains "and" or "or", or a file exceeds 150 lines.

### O — Open/Closed Principle
Code is open for extension, closed for modification. Add new behavior by adding new code, not by editing existing stable code.

- New slide types are added by creating a new file in `components/slides/` and registering in a map — never by adding another `if/else` branch inside existing renderers.
- New chart types extend `ChartType` union and get a new component in `components/charts/` — not a new `switch` arm in an existing chart component.
- New theme presets are new files in `themes/` — not new branches in `ThemeColors` resolution logic.
- **Violation signal:** adding a feature requires modifying 3+ existing files that previously worked correctly.

### L — Liskov Substitution Principle
Any implementation of an interface or abstract shape must be fully substitutable without breaking callers.

- All slide data types implement `SlideData` fully — no `type` field can be conditionally absent.
- Chart components must accept the same props interface and render without crashing when given valid but minimal data (e.g. empty `points` array).
- Hooks that return `null` must be explicitly typed as `T | null` — callers must not need to know the implementation to handle absence.
- **Violation signal:** a caller does `instanceof` checks or type-narrows on a concrete implementation class rather than using the discriminated union.

### I — Interface Segregation Principle
No module should be forced to depend on interfaces it does not use. Keep interfaces narrow and composable.

- Component props interfaces include only what that component needs — no passing a full `Report` object when only `report.theme` is needed.
- Hooks return only what callers need — `useSelectedSlide` returns `Slide | null`, not the entire `UndoableState`.
- Do not create a single `utils.ts` barrel file — split by domain (`formatters.ts`, `constants.ts`, etc.).
- **Violation signal:** a component receives a large object prop but only destructures one or two fields from it.

### D — Dependency Inversion Principle
High-level modules must not depend on low-level modules. Both should depend on abstractions.

- `reportReducer` depends on `Report`, `Slide`, `TileConfig` interfaces — not on concrete component implementations.
- `pdfExport.ts` accepts a `HTMLElement` — it does not import React components or call `ReactDOM.render`.
- Services (`csvParser`, `slideFactory`, `pdfExport`) have zero React imports — they are pure TypeScript functions.
- Test files inject dependencies via parameters or mocks — no hard-coded imports of singletons inside tested functions.
- **Violation signal:** a service file imports from `react`, `antd`, or any UI component.

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

## Best practices — non-negotiable standards

These apply to every file touched, regardless of task scope. Following them is not optional.

### Code correctness
- **Read before writing.** Never modify a file without reading it first. Understand the existing structure before proposing changes.
- **Immutability by default.** State is never mutated. Use spread, `map`, `filter`, `slice` for all updates. The `reportReducer` tests enforce this.
- **Pure functions wherever possible.** Functions with no side effects are preferred. Side effects are isolated to hooks, context, and services.
- **Fail loudly.** Do not swallow errors silently. Unhandled promise rejections must be caught and reported. Missing required data should throw, not return `undefined` silently.
- **Exhaustive switches.** Every `switch` on a discriminated union must cover all variants. TypeScript's `noFallthroughCasesInSwitch` enforces this at compile time — do not add `default` as an escape hatch.

### TypeScript strictness
- Zero `any`. If a type is unknown, use `unknown` and narrow explicitly.
- Zero `as X` type casts unless crossing a genuine system boundary (e.g. DOM API). Every cast must have a comment explaining why it is safe.
- Explicit return types on all exported functions and hooks.
- Prefer `interface` for object shapes, `type` for unions and aliases.
- Discriminated unions are preferred over optional fields. `SlideData` is a discriminated union — do not add `type?: SlideType` optional fields.
- No `!` non-null assertions. Narrow with `if` guards or use the nullish coalescing operator.

### React-specific
- Functional components only. No class components.
- Every `useEffect` must have a correct dependency array. ESLint's `react-hooks/exhaustive-deps` enforces this — fix the warning, do not disable it.
- `useMemo` and `useCallback` are used for expensive computations and stable references passed to child components. They are not used speculatively.
- Key props on lists must be stable, unique IDs — never array index.
- Do not read from context in components that render inside a hot loop (e.g. inside a tile grid). Derive data in the parent and pass it down.

### Anti-pattern identification and mandatory refactoring

When working on any task, if the following anti-patterns are encountered in touched files, **they must be fixed** in the same PR as a separate commit with the `refactor:` prefix. Do not leave known anti-patterns behind.

| Anti-pattern | What to do instead |
|---|---|
| God component (>150 lines, multiple concerns) | Split into focused sub-components and hooks |
| Prop drilling (>2 levels deep) | Lift to context or use composition |
| Inline object/array literals in JSX props | Extract to `useMemo` or module-level constant |
| Boolean prop flags controlling render variants (`isLarge`, `isError`) | Use discriminated union props or separate components |
| `useEffect` for derived state | Compute inline or with `useMemo`; `useEffect` is for synchronisation only |
| Direct DOM manipulation inside React components | Use refs with careful scoping; prefer declarative rendering |
| `any` or type cast in a data path | Introduce a proper interface or type guard |
| Business logic inside a component body | Extract to a hook or service function |
| Magic number or magic string inline | Move to `src/utils/constants.ts` with a named export |
| Multiple `useState` for related data | Combine into one `useReducer` or a single state object |
| Duplicate logic in 2+ components | Extract to a shared hook or utility |
| `console.log` left in committed code | Remove; use error boundaries for runtime errors |

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

## Mandatory post-task code audit

After completing any task, run this checklist against all files touched in the task. This is not optional — incomplete audits are a reason to not merge.

**If any item is found violated, fix it.** Fixes go in a separate commit with the `refactor:` prefix. Do not bundle refactoring with feature commits.

### Correctness
- [ ] No `any` types introduced
- [ ] No `as X` casts without an explanatory comment
- [ ] No `!` non-null assertions
- [ ] All `switch` statements on discriminated unions are exhaustive
- [ ] No unhandled promise rejections; PDF export pipeline has try/catch
- [ ] No silent `undefined` returns where the caller expects a value

### Design
- [ ] No component exceeds 150 lines — split if so
- [ ] No prop drilling deeper than 2 levels — use context or composition
- [ ] No duplicate logic across 2+ files — extract a hook or utility
- [ ] No `useEffect` used for derived state computation
- [ ] No business logic inside JSX or component render bodies
- [ ] No inline object/array literals in JSX props (creates new references every render)

### Code hygiene
- [ ] No dead code: unused imports, unreachable branches, commented-out blocks
- [ ] No magic numbers or magic strings — all in `src/utils/constants.ts`
- [ ] No `console.log` statements
- [ ] File names match their default export (PascalCase for components, camelCase for hooks/utils)

### Project constraints
- [ ] No hardcoded UI strings — all through i18next
- [ ] No `localStorage`, `sessionStorage`, or `IndexedDB` usage
- [ ] No runtime CDN imports — all dependencies in `node_modules`
- [ ] Services (`services/`) have zero React imports
- [ ] No `position: fixed` or CSS `calc()` in slide renderer components

### Accessibility
- [ ] Form inputs have associated `<label>` elements
- [ ] Interactive elements are keyboard-navigable
- [ ] Custom controls have appropriate ARIA attributes
