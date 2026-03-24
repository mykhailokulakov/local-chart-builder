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

## Design-first ritual — mandatory for any non-trivial change

Answer all three questions before opening a source file to write implementation. If you cannot answer them in one sentence each, stop and redesign.

| Question                                                                                                                                | If you can't answer it in one sentence…                              |
| --------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| **What is the single responsibility of what I'm building?** If the sentence contains "and", redesign.                                   | The abstraction is doing too much. Split it.                         |
| **What is the public TypeScript interface?** Write the signature/props/return type before the body. Does every caller need every field? | Narrow the interface — remove what callers don't need.               |
| **How do I test this in isolation?** If the answer requires a React tree, DOM, or network, the design has a dependency problem.         | Move logic to a pure function. Test the function, not the component. |

Only after all three answers are clear should you write implementation. Write the test structure (`describe` blocks and test names) before writing the function body.

---

## Commands

| Purpose              | Command                                     |
| -------------------- | ------------------------------------------- |
| Install dependencies | `npm ci`                                    |
| Start dev server     | `npm run dev`                               |
| Production build     | `npm run build`                             |
| Type-check (no emit) | `npm run typecheck`                         |
| Lint (zero warnings) | `npm run lint`                              |
| Format (write)       | `npm run format`                            |
| Format (check only)  | `npm run format:check`                      |
| Run all tests        | `npm run test -- --run`                     |
| Run single test file | `npx vitest run tests/unit/foo.test.ts`     |
| Run e2e tests        | `npm run test:e2e`                          |
| Run single e2e file  | `npx playwright test tests/e2e/foo.spec.ts` |

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
    setSelectedTileId(tileId) // local state
    dispatch(selectTile(tileId)) // also updates global state — two sources of truth
  }
  return (
    <TileGrid tiles={slide?.tiles ?? []} onTileClick={handleClick} selectedId={selectedTileId} />
  )
}

// ✅ RIGHT — component only renders. Selection comes from context via a hook.
//    One reason to change: rendering changes.
function ChartSlide({ slideId }: { slideId: string }) {
  const slide = useSlideById(slideId) // hook owns data-fetching concern
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
  if (tile.type === 'line') return <LineChart data={tile.data} options={tile.options} />
  // Adding 'gantt' means editing this file. OCP violated.
  return null
}

// ✅ RIGHT — adding a new ChartType means adding one entry to the map.
//    TileRenderer itself is never modified.
import type { ChartType } from '../types/chart'
import type { TileConfig } from '../types/layout'

type TileProps = { tile: TileConfig }
const TILE_REGISTRY: Record<ChartType | 'text', React.ComponentType<TileProps>> = {
  'bar-v': BarChart,
  'bar-h': BarChartHorizontal,
  donut: DonutChart,
  line: LineChart,
  gantt: GanttChart,
  choropleth: ChoroplethMap,
  'data-table': DataTable,
  text: TextTile,
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

| Rule                          | When NOT to apply it                                                                                                                              |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Extract shared hook/utility   | Fewer than 3 real callsites. Wait — two similar things are often coincidentally similar and will diverge.                                         |
| Split component at 150 lines  | The component has one concern and one reason to change. Split on concerns, not line count.                                                        |
| Apply OCP (extension point)   | The code is not yet stable. Premature extension points add complexity with no payoff. Inline first; extract when the shape of variation is clear. |
| Use context instead of props  | Data is only needed one level deep. Props are explicit and easier to trace. Use context for cross-cutting values only.                            |
| Add `useMemo` / `useCallback` | You have not profiled a problem. Speculative memoisation adds complexity and can hide bugs.                                                       |
| Enforce no-duplication        | Two things look alike but represent different concerns. Duplication is sometimes the correct choice.                                              |

**When you deviate from a rule**, mark it explicitly:

```typescript
// Intentional exception to [rule]: [one-sentence reason]
```

---

## TypeScript rules

| Rule                    | Requirement                                                                               |
| ----------------------- | ----------------------------------------------------------------------------------------- |
| `any`                   | Forbidden. Use `unknown` + type guard if truly unknown.                                   |
| `as X` casts            | Forbidden unless crossing a DOM boundary. Must have a comment explaining safety.          |
| `!` non-null assertions | Forbidden. Use `if` guards or `??`.                                                       |
| Return types            | Explicit on all exported functions and hooks.                                             |
| Discriminated unions    | Required for `SlideData`, `ReportAction`. Do not use optional flags as variant selectors. |
| `switch` exhaustiveness | All variants must be covered. `default` is not a substitute for covering cases.           |
| Interfaces vs types     | `interface` for object shapes. `type` for unions, aliases, and mapped types.              |

---

## React rules

| Rule                      | Requirement                                                                           |
| ------------------------- | ------------------------------------------------------------------------------------- |
| Component style           | Functional components only. No class components.                                      |
| `useEffect`               | Only for synchronisation with external systems. Never for derived state.              |
| `useEffect` deps          | Must be correct and complete. Fix the ESLint warning — do not disable it.             |
| Key props                 | Must be stable unique IDs. Never array index.                                         |
| `useMemo` / `useCallback` | Use for expensive values and stable references passed to children. Not speculatively. |
| Inline objects in JSX     | Never. Extract to `useMemo` or module-level constant.                                 |
| Business logic in JSX     | Never. Extract to a hook or service.                                                  |

---

## Anti-patterns to eliminate

If any of these are found in files touched during a task, fix them in a separate `refactor:` commit.

| Anti-pattern                                                      | Fix                                               |
| ----------------------------------------------------------------- | ------------------------------------------------- |
| God component / hook (>150 lines, multiple concerns)              | Split by responsibility                           |
| Prop drilling >2 levels                                           | Lift to context or use component composition      |
| `useEffect` for derived state                                     | Compute inline or with `useMemo`                  |
| Boolean variant flags on props (`isLarge`, `isError`, `isActive`) | Discriminated union props or separate components  |
| Multiple `useState` for related fields                            | Consolidate into `useReducer` or one state object |
| Direct DOM manipulation in a component                            | Use refs; prefer declarative rendering            |
| Business logic in a component body                                | Extract to a hook or `services/`                  |
| Duplicate logic across 2+ files                                   | Extract a shared hook or utility                  |
| Magic number / string inline                                      | Move to `src/utils/constants.ts`                  |
| `console.log` in committed code                                   | Remove                                            |
| Silent `undefined` return on error                                | Throw explicitly or return typed `null`           |
| `any` or unsafe cast in a data path                               | Introduce a proper type guard                     |
| CSS overrides fighting a UI framework's injected styles           | Configure the framework correctly at the root     |

---

## Framework integration — configure at the root, never suppress symptoms

When a UI framework (Ant Design, MUI, etc.) injects CSS variables or default styles that
conflict with your component, the conflict always indicates a **missing or incorrect root
configuration** — not a component that needs more overrides.

**Rule: fix at the origin, not at the observation point.**

| Symptom                                                    | Wrong fix                                          | Right fix                                                                |
| ---------------------------------------------------------- | -------------------------------------------------- | ------------------------------------------------------------------------ |
| Wrong text colour inside a dark header                     | Add `color: 'white'` to every child component      | Wrap header with `<ConfigProvider theme={{ algorithm: darkAlgorithm }}>` |
| Framework background overrides panel colour                | Repeated inline `background` props or `!important` | Set `colorBgContainer` / `colorBgLayout` tokens in root `ConfigProvider` |
| Buttons, typography, selects misbehave in a themed context | Override each component's style prop individually  | Create the correct CSS-variable scope via a nested `ConfigProvider`      |

A symptom-suppression fix creates maintenance debt: every new component added to that
context needs the same manual override. A root-cause fix is zero-maintenance — all
components automatically inherit the correct tokens.

**Corollary:** a constant whose only purpose is to compensate for a missing framework
configuration (e.g. `EXPORT_BTN_MIN_WIDTH_PX` to stabilise a button that should be stable
by design) is itself a symptom. Remove the constant; fix the configuration.

---

## Testing requirements

### Unit and component tests (Vitest + @testing-library/react)

- **Framework:** Vitest + @testing-library/react
- **Coverage target:** 80%+ on `store/`, `services/`, `utils/`
- **Every new function** in `store/` or `services/` requires unit tests.
- **Every new component** requires a render test (renders without crashing, key interactions).
- Tests use `describe` blocks named after the unit under test. Test names state the behaviour, not the implementation.
- Mocks are scoped to the test file using `vi.mock()` or `vi.spyOn()`. No global mocks.
- Do not test Ant Design internals or react-grid-layout drag mechanics.

### E2e tests (Playwright)

- **Framework:** Playwright (`npm run test:e2e`). Config is in `playwright.config.ts`.
- **Scope:** user-visible flows only — interactions a real user performs in the browser (clicks, keyboard, navigation). Do not use e2e tests to cover component rendering logic; that belongs in `tests/components/`.
- **When to add an e2e test:** a new user flow is reachable end-to-end in the built app (e.g. adding a tile, exporting PDF, toggling a setting). A component that is not yet wired into any user flow does **not** require an e2e test.
- **Language:** the app defaults to Ukrainian (`lng: 'ua'`). E2e tests use Ukrainian strings unless a semantic role selector (`getByRole`, `getByLabel`) is available. Add a comment mapping each hardcoded UA string to its i18n key.
- **Selectors:** prefer `getByRole` and `getByLabel` over text or CSS selectors. Use Ukrainian text only as a last resort.
- **Do not** run `npm run test:e2e` in the pre-commit step — e2e tests require a running dev/preview server and are slow. They are run separately in CI.

### Test file placement

| Source file                   | Test file                       |
| ----------------------------- | ------------------------------- |
| `src/store/foo.ts`            | `tests/unit/foo.test.ts`        |
| `src/services/bar.ts`         | `tests/unit/bar.test.ts`        |
| `src/components/Baz.tsx`      | `tests/components/Baz.test.tsx` |
| New user-visible flow or page | `tests/e2e/<feature>.spec.ts`   |

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

| Thing                | Convention              | Example                           |
| -------------------- | ----------------------- | --------------------------------- |
| React component file | PascalCase              | `BarChart.tsx`                    |
| Hook file            | camelCase, `use` prefix | `useSelectedSlide.ts`             |
| Service file         | camelCase               | `csvParser.ts`                    |
| Type / Interface     | PascalCase              | `TileConfig`                      |
| Constant             | UPPER_SNAKE_CASE        | `MAX_HISTORY_DEPTH`               |
| File name            | Matches default export  | `BarChart.tsx` exports `BarChart` |

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

## Key architectural decisions — the why

These are not rules; they are the reasoning behind the rules. When a situation is not explicitly covered elsewhere in this file, use this reasoning to extrapolate the correct answer.

### `useReducer` + Context, not Zustand or Redux

The reducer is a plain function — `reportReducer(report, action) → Report`. It can be imported and called in a test with no setup, no mocks, no providers. That testability is the entire point. Adding a library trades that simplicity for features this app does not need. The component tree is three panels — there is no cross-cutting subscription problem that justifies Redux's action → store → selector → component indirection.

Ruled out: **Zustand** — mutable store model (`set(state => ...)`) conflicts with the immutability that makes the reducer testable. **Redux Toolkit** — `createSlice`, `configureStore`, `createSelector` machinery is overkill for a single-domain app. **Jotai/Recoil** — atom-based models fragment a `Report` that is naturally one cohesive document, making cross-cutting operations (undo, PDF export) harder.

### Discriminated unions for `SlideData` and `ReportAction`, not optional fields

A `switch (action.type)` on a discriminated union is exhaustively checked at compile time with `noFallthroughCasesInSwitch`. Add a new `SlideType` without handling it in a switch and TypeScript reports a type error — not a silent runtime bug. `TitleSlideData` cannot have a `ganttTasks` field; an optional-field approach allows any combination of fields and every use site must defensively guard against impossible states.

Ruled out: **single interface with optional fields** — every component reimplements type discrimination with `if (data.heading !== undefined)` guards; none of those checks are compiler-verified. **String enums** — `enum SlideType { title = 'title' }` adds indirection; literal string unions are simpler and serialize naturally.

### `services/` have zero React imports

Services are plain TypeScript functions: `const result = csvParser(input)`. No `renderHook`, no `act`, no DOM setup. If a service imports React it can only be tested inside a React environment — a 5-line unit test becomes a 50-line integration test. Dependency direction must be: components depend on services, services depend on types, types depend on nothing. A React import in a service reverses that direction and is always a sign that concerns need to be split.

Ruled out: **services as hooks** — `useCsvParser()` requires `renderHook` to test; the parsing logic doesn't need React, only the wiring does.

### `createUndoReducer()` is a factory function, not a singleton or class

The debounce tracking state (`lastDebounce` — a timestamp and action type) must persist across React renders but has no visual consequence and must never trigger a re-render. Module-level closure is exactly the right scope for this. A factory function gives each test a fresh closure instance with no shared state between tests. A singleton would carry debounce timestamps between tests, producing order-dependent failures. `useReducer` calls the reducer as a plain function so a class method would lose its `this` binding.

Ruled out: **class with instance methods** — `this` binding, `new` required, awkward to pass to `useReducer`. **singleton module** — shared state between tests.

### No abstraction before three real callsites

Two similar-looking pieces of code are often coincidentally similar — they will diverge under different requirements. Unifying them creates coupling: when one changes, you must either modify the shared abstraction (breaking the other) or add a configuration parameter that makes it more complex than the original duplication. The third callsite provides enough evidence to identify the genuine shared boundary.

```typescript
// One callsite — inline it.
// Two callsites — duplicate it:
// NOTE: similar to X in Y.ts — extract if a third callsite appears.
// Three callsites — extract to src/utils/ and import everywhere.
```

Ruled out: **extract at callsite one** — speculative abstraction based on one example, almost always the wrong interface. **extract at callsite two to follow DRY** — DRY applies to knowledge, not to coincidentally similar syntax.

### No persistence (`localStorage`, IndexedDB, File System API)

The workflow is open → build → export PDF → close. The PDF is the deliverable. Persistence adds a schema migration story: every change to `Report`, `Slide`, or `TileConfig` must upgrade previously saved data. Some browser configurations also restrict storage APIs in `file://` contexts, and the app must work unconditionally in `file://`.

Ruled out: **`localStorage` autosave** — migration story starts immediately; 5MB limit is easily exceeded by a complex report. **File System Access API** — not universally available in `file://`; adds file picker UX, conflict resolution, and significant scope.

---

## Workflow summary

```
1.  Read AGENTS.md (this file) completely — it is self-contained
2.  Read every file you plan to touch
3.  Run: npm run test -- --run   (confirm unit/component baseline passes)
4.  Answer the design-first ritual (3 questions) before writing any code
5.  Write the test structure (describe + test names) before implementation
6.  Implement
7.  Run: npm run format && npm run lint && npm run typecheck && npm run test -- --run
8.  Fix any issues until all four pass with zero warnings
9.  Run the post-task audit checklist (see CLAUDE.md)
10. Commit feature changes:  feat: or fix:
11. Fix any anti-patterns found; commit separately: refactor:
12. Push
```
