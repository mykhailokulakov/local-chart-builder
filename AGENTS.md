# AGENTS.md — Report Builder

> Universal agent instructions. These apply to Claude, Codex, Gemini, GPT-4o, and any
> other AI coding agent working in this repository. Instructions in this file are
> **mandatory**, not advisory. Read this file completely before writing a single line of code.

---

## What this project is

A local-only, offline web application for building 16:9 PDF reports targeting the Ukrainian
Ministry of Digital Transformation. There is no backend, no database, no cloud deployment.
The output is a `dist/` folder opened directly in Chrome via `file://`. Everything runs
in the browser.

**This constraint is absolute.** No network calls, no CDN imports at runtime, no
`localStorage`, no `fetch`.

---

## Before you write any code

1. **Read the files you will touch.** Do not infer structure from filenames. Open and read each file before modifying it.
2. **Run the test suite.** Confirm the baseline passes before making changes: `npm run test -- --run`
3. **Understand the data model.** Key types live in `src/types/`. The discriminated union `SlideData` and `ReportAction` drive the entire application. Know them.
4. **Check for existing utilities.** Before writing a helper, search `src/utils/`, `src/hooks/`, and `src/services/` for something that already does it.
5. **Read `DECISIONS.md`.** It explains the *why* behind every key architectural choice. When a situation isn't covered by the rules, the reasoning in `DECISIONS.md` is what enables correct judgment.

## Design-first ritual — mandatory for any non-trivial change

Answer all three questions before opening a source file to write implementation. If you cannot answer them in one sentence each, stop and redesign.

| Question | If you can't answer it in one sentence… |
|---|---|
| **What is the single responsibility of what I'm building?** If the sentence contains "and", redesign. | The abstraction is doing too much. Split it. |
| **What is the public TypeScript interface?** Write the signature/props/return type before the body. Does every caller need every field? | Narrow the interface — remove what callers don't need. |
| **How do I test this in isolation?** If the answer requires a React tree, DOM, or network, the design has a dependency problem. | Move logic to a pure function. Test the function, not the component. |

Only after all three answers are clear should you write implementation. Write the test structure (`describe` blocks and test names) before writing the function body.

---

## Commands

| Purpose | Command |
|---|---|
| Install dependencies | `npm ci` |
| Start dev server | `npm run dev` |
| Production build | `npm run build` |
| Type-check (no emit) | `npm run typecheck` |
| Lint (zero warnings) | `npm run lint` |
| Format (write) | `npm run format` |
| Format (check only) | `npm run format:check` |
| Run all tests | `npm run test -- --run` |
| Run single test file | `npx vitest run tests/unit/foo.test.ts` |

**Before every commit, run in order:**
```
npm run format && npm run lint && npm run typecheck && npm run test -- --run
```
All four must pass with zero errors and zero warnings. Do not commit if any fail.

---

## Project structure (authoritative)

```
src/
├── types/          # TypeScript interfaces only — no runtime code
├── store/          # React context, reducer, undo middleware, actions
├── components/
│   ├── layout/     # AppShell, SlidePanel, Canvas, PropertiesPanel
│   ├── slides/     # Slide type renderers (title, chart, divider, text, ending)
│   ├── editors/    # Right-panel editors per slide/tile type
│   ├── charts/     # Chart components used in both preview and PDF export
│   └── toolbar/    # TileToolbar
├── themes/         # One file per ThemePreset — no runtime branching
├── i18n/           # config.ts + ua.json + en.json
├── services/       # Pure TS functions — zero React imports allowed here
├── hooks/          # Custom React hooks — one concern per hook
├── assets/         # GeoJSON and other static data files
└── utils/          # constants.ts, formatters.ts
tests/
├── unit/           # Vitest unit tests for store/, services/, utils/
└── components/     # @testing-library/react component tests
```

---

## SOLID principles — all five, always

These are enforced on every task. Violations found in touched files must be fixed.

### S — Single Responsibility
- One file = one purpose. One function = one transformation. One hook = one behavior.
- A component renders UI. It does not compute data, format strings, or orchestrate side effects.
- Signal of violation: a name containing "and", or a file over 150 lines.

### O — Open/Closed
- New slide types → new file in `components/slides/`, registered in a map.
- New chart types → new file in `components/charts/`, extend `ChartType` union.
- New themes → new file in `themes/`.
- Never add new `if/else` or `switch` branches inside existing stable code to support new variants.
- Signal of violation: a feature requires modifying 3+ previously-working files.

### L — Liskov Substitution
- Every concrete type implementing an interface must be fully substitutable.
- Chart components must not crash on empty-but-valid data (e.g. `points: []`).
- Hooks returning `T | null` must be typed as such — callers must not `as T` the result.
- Signal of violation: caller uses `instanceof` or checks a property that only one variant has.

### I — Interface Segregation
- Props interfaces contain only what the component uses — no fat objects.
- Hooks return only what callers need — not the entire state tree.
- No catch-all `utils.ts` barrel. Split by domain.
- Signal of violation: a component receives a large prop object but uses one or two fields.

### D — Dependency Inversion
- High-level modules (`reportReducer`, `pdfExport`) depend on interfaces, not implementations.
- `services/` files have zero React imports. They are pure TypeScript.
- `pdfExport.ts` accepts `HTMLElement` — it does not import React components.
- Signal of violation: a service file imports from `react`, `antd`, or a component.

---

## Canonical patterns — before and after

These show the correct pattern for the two most commonly violated principles in this codebase. When in doubt, match these shapes.

### SRP: component that renders AND manages state (wrong) vs. separated concerns (right)

```tsx
// ❌ WRONG — ChartSlide manages tile selection state AND renders the grid.
//    Two reasons to change: selection logic changes, or rendering changes.
function ChartSlide({ slideId }: { slideId: string }) {
  const [selectedTileId, setSelectedTileId] = useState<string | null>(null)
  const { state, dispatch } = useReport()
  const slide = state.present.slides.find((s) => s.id === slideId)

  const handleClick = (tileId: string) => {
    setSelectedTileId(tileId)          // local state
    dispatch(selectTile(tileId))       // also updates global state — two sources of truth
  }
  return <TileGrid tiles={slide?.tiles ?? []} onTileClick={handleClick} selectedId={selectedTileId} />
}

// ✅ RIGHT — component only renders. Selection comes from context via a hook.
//    One reason to change: rendering changes.
function ChartSlide({ slideId }: { slideId: string }) {
  const slide = useSlideById(slideId)          // hook owns data-fetching concern
  const { selectedTileId } = useReport().state // selection is global state, read once
  const { dispatch } = useReport()
  return (
    <TileGrid
      tiles={slide?.tiles ?? []}
      selectedId={selectedTileId}
      onTileClick={(tileId) => dispatch(selectTile(tileId))}
    />
  )
}
```

### OCP: if/else chain for chart types (wrong) vs. registry map (right)

```tsx
// ❌ WRONG — every new ChartType requires modifying this file.
function TileRenderer({ tile }: { tile: TileConfig }) {
  if (tile.type === 'bar-v') return <BarChart data={tile.data} options={tile.options} />
  if (tile.type === 'bar-h') return <BarChart data={tile.data} options={tile.options} horizontal />
  if (tile.type === 'donut') return <DonutChart data={tile.data} options={tile.options} />
  if (tile.type === 'line')  return <LineChart data={tile.data} options={tile.options} />
  // Adding 'gantt' means editing this file. OCP violated.
  return null
}

// ✅ RIGHT — adding a new ChartType means adding one entry to the map.
//    TileRenderer itself is never modified.
import type { ChartType } from '../types/chart'
import type { TileConfig } from '../types/layout'

type TileProps = { tile: TileConfig }
const TILE_REGISTRY: Record<ChartType | 'text', React.ComponentType<TileProps>> = {
  'bar-v':      BarChart,
  'bar-h':      BarChartHorizontal,
  'donut':      DonutChart,
  'line':       LineChart,
  'gantt':      GanttChart,
  'choropleth': ChoroplethMap,
  'data-table': DataTable,
  'text':       TextTile,
}

function TileRenderer({ tile }: TileProps) {
  const Component = TILE_REGISTRY[tile.type]
  return <Component tile={tile} />
}
```

### ISP: fat props object (wrong) vs. narrow props (right)

```tsx
// ❌ WRONG — BarChart receives the full Report just to get theme colors.
//    It is now coupled to the Report schema.
function BarChart({ report, data }: { report: Report; data: ChartData }) {
  const colors = resolveTheme(report.theme).chartColors
  // ...
}

// ✅ RIGHT — BarChart receives only what it needs.
//    Caller decides how to source it.
function BarChart({ chartColors, data }: { chartColors: string[]; data: ChartData }) {
  // ...
}

// At the callsite, the caller resolves the theme:
const { chartColors } = resolveTheme(state.present.theme)
return <BarChart chartColors={chartColors} data={tile.data} />
```

---

## When NOT to apply the rules — judgment over mechanical compliance

Rules applied mechanically without judgment produce worse code than no rules at all.

| Rule | When NOT to apply it |
|---|---|
| Extract shared hook/utility | Fewer than 3 real callsites. Wait — two similar things are often coincidentally similar and will diverge. |
| Split component at 150 lines | The component has one concern and one reason to change. Split on concerns, not line count. |
| Apply OCP (extension point) | The code is not yet stable. Premature extension points add complexity with no payoff. Inline first; extract when the shape of variation is clear. |
| Use context instead of props | Data is only needed one level deep. Props are explicit and easier to trace. Use context for cross-cutting values only. |
| Add `useMemo` / `useCallback` | You have not profiled a problem. Speculative memoisation adds complexity and can hide bugs. |
| Enforce no-duplication | Two things look alike but represent different concerns. Duplication is sometimes the correct choice. |

**When you deviate from a rule**, mark it explicitly:
```typescript
// Intentional exception to [rule]: [one-sentence reason]
```

---

## TypeScript rules

| Rule | Requirement |
|---|---|
| `any` | Forbidden. Use `unknown` + type guard if truly unknown. |
| `as X` casts | Forbidden unless crossing a DOM boundary. Must have a comment explaining safety. |
| `!` non-null assertions | Forbidden. Use `if` guards or `??`. |
| Return types | Explicit on all exported functions and hooks. |
| Discriminated unions | Required for `SlideData`, `ReportAction`. Do not use optional flags as variant selectors. |
| `switch` exhaustiveness | All variants must be covered. `default` is not a substitute for covering cases. |
| Interfaces vs types | `interface` for object shapes. `type` for unions, aliases, and mapped types. |

---

## React rules

| Rule | Requirement |
|---|---|
| Component style | Functional components only. No class components. |
| `useEffect` | Only for synchronisation with external systems. Never for derived state. |
| `useEffect` deps | Must be correct and complete. Fix the ESLint warning — do not disable it. |
| Key props | Must be stable unique IDs. Never array index. |
| `useMemo` / `useCallback` | Use for expensive values and stable references passed to children. Not speculatively. |
| Inline objects in JSX | Never. Extract to `useMemo` or module-level constant. |
| Business logic in JSX | Never. Extract to a hook or service. |

---

## Anti-patterns to eliminate

If any of these are found in files touched during a task, fix them in a separate `refactor:` commit.

| Anti-pattern | Fix |
|---|---|
| God component / hook (>150 lines, multiple concerns) | Split by responsibility |
| Prop drilling >2 levels | Lift to context or use component composition |
| `useEffect` for derived state | Compute inline or with `useMemo` |
| Boolean variant flags on props (`isLarge`, `isError`, `isActive`) | Discriminated union props or separate components |
| Multiple `useState` for related fields | Consolidate into `useReducer` or one state object |
| Direct DOM manipulation in a component | Use refs; prefer declarative rendering |
| Business logic in a component body | Extract to a hook or `services/` |
| Duplicate logic across 2+ files | Extract a shared hook or utility |
| Magic number / string inline | Move to `src/utils/constants.ts` |
| `console.log` in committed code | Remove |
| Silent `undefined` return on error | Throw explicitly or return typed `null` |
| `any` or unsafe cast in a data path | Introduce a proper type guard |

---

## Testing requirements

- **Framework:** Vitest + @testing-library/react
- **Coverage target:** 80%+ on `store/`, `services/`, `utils/`
- **Every new function** in `store/` or `services/` requires unit tests.
- **Every new component** requires a render test (renders without crashing, key interactions).
- Tests use `describe` blocks named after the unit under test. Test names state the behaviour, not the implementation.
- Mocks are scoped to the test file using `vi.mock()` or `vi.spyOn()`. No global mocks.
- Do not test Ant Design internals or react-grid-layout drag mechanics.

### Test file placement

| Source file | Test file |
|---|---|
| `src/store/foo.ts` | `tests/unit/foo.test.ts` |
| `src/services/bar.ts` | `tests/unit/bar.test.ts` |
| `src/components/Baz.tsx` | `tests/components/Baz.test.tsx` |

---

## Git commit rules

- Format: `<type>(<scope>): <short description>` — max 72 characters on the subject line.
- Types: `feat`, `fix`, `refactor`, `test`, `chore`, `docs`
- One logical change per commit.
- Refactoring of anti-patterns found during a task goes in a **separate** `refactor:` commit.
- Never combine feature changes and refactoring in a single commit.
- Do not commit with lint errors, type errors, or failing tests.

---

## Naming conventions

| Thing | Convention | Example |
|---|---|---|
| React component file | PascalCase | `BarChart.tsx` |
| Hook file | camelCase, `use` prefix | `useSelectedSlide.ts` |
| Service file | camelCase | `csvParser.ts` |
| Type / Interface | PascalCase | `TileConfig` |
| Constant | UPPER_SNAKE_CASE | `MAX_HISTORY_DEPTH` |
| File name | Matches default export | `BarChart.tsx` exports `BarChart` |

---

## Project constraints (hard limits)

These are never negotiable regardless of task description.

1. **No runtime network calls.** No `fetch`, `axios`, WebSocket, CDN link, or dynamic `import()` of a remote URL.
2. **No `localStorage`, `sessionStorage`, or `IndexedDB`.** The app has no persistence by design.
3. **No class components.** Functional components and hooks only.
4. **No `any` types.** Zero. Use `unknown` + type narrowing.
5. **Services have no React imports.** `src/services/` is plain TypeScript.
6. **No `position: fixed` or CSS `calc()` in slide renderers.** html2canvas compatibility.
7. **No hardcoded UI strings.** Everything user-visible goes through i18next.
8. **No `@types/react-grid-layout`.** react-grid-layout v2 is TypeScript-native; that package conflicts.
9. **`dist/` must work via `file://`.** Use relative paths only. Test after every build.
10. **Zero ESLint warnings.** `--max-warnings 0` is enforced in CI.

---

## Common pitfalls

- `react-grid-layout v2` is TypeScript-native — do **not** install `@types/react-grid-layout`.
- D3 renders to SVG — verify the choropleth map exports correctly to PDF via html2canvas.
- Chart.js renders to `<canvas>` — html2canvas handles this well, but test explicitly.
- The e-Ukraine font is bundled in `public/fonts/` — reference it only via the CSS `@font-face` declaration, never via a URL.
- `ThemePreset` is an enum (`ThemePreset.dark`, not the string `'dark'`).

---

## Workflow summary

```
1.  Read AGENTS.md (this file) completely
2.  Read DECISIONS.md — understand the why behind the architecture
3.  Read every file you plan to touch
4.  Run: npm run test -- --run   (confirm baseline passes)
5.  Answer the design-first ritual (3 questions) before writing any code
6.  Write the test structure (describe + test names) before writing implementation
7.  Implement
8.  Run: npm run format && npm run lint && npm run typecheck && npm run test -- --run
9.  Fix any issues until all four pass with zero warnings
10. Run the post-task audit checklist (see CLAUDE.md)
11. Commit feature changes:  feat: or fix:
12. Fix any anti-patterns found; commit separately: refactor:
13. Push
```
