# DECISIONS.md — Architectural Decision Records

> **For humans.** This is the extended reference for architectural reasoning.
> Agent instructions are in `AGENTS.md`, which is self-contained — agents do not need to read this file.
> If you are an AI agent and you have read this far: return to `AGENTS.md`. Everything you need is there.

Each record explains a key architectural choice: what was decided, why, and what was
ruled out. The condensed version of each decision is inlined in `AGENTS.md`. This file
exists for engineers who want the full reasoning, or who are evaluating whether a decision
should be revisited.

---

## ADR-001: React Context + useReducer instead of an external state library

**Decision:** State management uses React's built-in `useReducer` + `createContext`. No Zustand, Redux, or Jotai.

**Why this choice:**

- **Zero additional runtime dependencies.** The app runs offline from `dist/`. Every dependency added is a bundle-size cost and a future maintenance burden. React ships with everything this app needs.
- **The reducer is a plain function.** `reportReducer(report, action) → Report` can be imported and called in a test with no setup, no mocks, no providers. This directness is why the test suite for the reducer is 41 tests and ~200 lines with no boilerplate.
- **The component tree is shallow.** Three panels. No cross-cutting subscription problem that would justify Redux's indirection. The cost of that indirection (action → store → selector → component) is only worth paying when the problem is complex enough to demand it.
- **TypeScript covers the entire action space.** The `ReportAction` discriminated union gives compile-time exhaustiveness checking on every `switch`. An unhandled action type is a type error, not a runtime bug.

**What was ruled out:**

- **Zustand:** Simpler API, but its mutable store model (`set(state => ...)`) conflicts with the immutability-first approach that makes the reducer testable. Also still an external dependency.
- **Redux Toolkit:** Appropriate for large teams managing many slices across many features. Overkill here — introduces `createSlice`, `configureStore`, `createSelector` machinery for a single-domain app.
- **Jotai / Recoil:** Atom-based models fragment what is naturally cohesive. A `Report` is one document; splitting it into atoms makes cross-cutting operations (undo, export) harder because you must compose many atoms.

---

## ADR-002: Undo middleware as a factory function with a closure

**Decision:** `createUndoReducer()` returns a reducer that closes over debounce tracking state. It is not a class, not a HOC, and not a singleton.

**Why this choice:**

- **The debounce state must persist across renders without being React state.** `lastDebounce` (the timestamp of the last UPDATE_SLIDE_DATA or UPDATE_TILE_DATA action) has no visual consequence — it should never trigger a re-render. Module-level closure is the right scope: longer-lived than a render cycle, shorter-lived than a module reload.
- **The factory makes each test instance independent.** `createUndoReducer()` is called once per test in `beforeEach`. Each test gets a fresh closure with no shared state. A singleton or class with persistent state would require manual reset between tests, which is error-prone and produces order-dependent tests.
- **No `this` binding.** `useReducer(reducer, initialState)` calls `reducer` as a plain function. A class method passed as `reducer` would lose its `this` context. A factory function has no `this` at all.
- **Composable by injection.** `createUndoReducer(baseReducer)` accepts the base reducer as a parameter. Tests can inject a mock `baseReducer` to test the undo/redo logic independently of `reportReducer`. This is dependency inversion applied to a reducer.

**What was ruled out:**

- **Class with instance methods:** Introduces `this`, requires `new`, and makes passing the reducer to `useReducer` awkward (you'd call `instance.reduce.bind(instance)` or use an arrow method).
- **HOC pattern:** Higher-Order Components wrap components, not reducers. Applying this concept to a reducer would mean wrapping it in a React component, which couples the undo history to the component lifecycle.
- **Module-level singleton reducer:** Would share debounce state across all tests and across all potential provider instances.

---

## ADR-003: Discriminated unions for SlideData and ReportAction

**Decision:** `SlideData` is `TitleSlideData | ChartSlideData | DividerSlideData | TextSlideData | EndingSlideData`. `ReportAction` is a union of all action interfaces. No `type?` optional fields. No string enums for switching.

**Why this choice:**

- **TypeScript narrows exhaustively.** A `switch (action.type)` that does not handle every variant is a **compile error** with `noFallthroughCasesInSwitch`. An optional field approach requires every use site to defensively check which fields are present, and TypeScript cannot verify completeness.
- **Adding a new slide type is safe by construction.** When a new member is added to `SlideData`, every `switch` on `slide.data.type` in the codebase that doesn't handle the new variant becomes a type error. The compiler finds the gaps; you don't have to.
- **Impossible states cannot be represented.** `TitleSlideData` cannot have a `ganttTasks` field. An optional-field approach (`{ type?: SlideType; heading?: string; tasks?: GanttTask[] }`) allows any combination of fields, creating states that must be guarded against at every use site.
- **Discriminated unions compose.** `TileData = ChartData | TextData | GanttData | ChoroplethData | DataTableData` follows the same pattern as `SlideData`. The consistency means any developer (or agent) who understands one understands all of them.

**What was ruled out:**

- **Single `SlideData` interface with optional fields:** Creates an inner platform where every component reimplements the type discrimination logic with `if (data.heading !== undefined)` guards. Fragile, verbose, and not exhaustively checked.
- **String enum for type:** `enum SlideType { title = 'title', ... }` adds indirection. Literal string unions (`'title' | 'chart' | ...`) are simpler, serialize naturally, and TypeScript handles them identically.

---

## ADR-004: Services in `services/` have zero React imports

**Decision:** `pdfExport.ts`, `csvParser.ts`, and `slideFactory.ts` are plain TypeScript. They do not import from `react`, `react-dom`, or any component.

**Why this choice:**

- **Plain functions are trivially testable.** A service test is `const result = csvParser(input); expect(result).toEqual(expected)`. No `renderHook`, no `act`, no `@testing-library/react`. This is why service tests are fast and have no flaky failures.
- **Services are decoupled from the UI framework.** If the rendering approach changes — say, moving from html2canvas to a headless browser for PDF export — the business logic in `pdfExport.ts` does not change. Only the integration point changes.
- **Dependency direction is explicit.** Components depend on services. Services depend on types. Types depend on nothing. Allowing services to import React would reverse this direction: the domain layer would depend on the UI framework layer.
- **A React import in a service is a design smell.** If you find yourself needing `useState` or `useRef` inside `csvParser`, that is a signal that you are mixing concerns. The part that needs React belongs in a hook; the pure transformation belongs in the service.

**What was ruled out:**

- **Services as React hooks:** Would make unit testing impossible without a React environment. The `csvParser` hook would need `renderHook` to test. The logic doesn't need React; only the wiring does. Keep them separate.

---

## ADR-005: No persistence

**Decision:** The application has no save, load, or autosave mechanism. State lives in memory for the session. The only output artifact is the exported PDF.

**Why this choice:**

- **The workflow does not need it.** Open the app → build the report → export PDF → close. The PDF is the deliverable. There is no "come back tomorrow and continue" workflow in scope.
- **Persistence adds a schema migration story.** Every structural change to `Report`, `Slide`, or `TileConfig` would require a migration for data saved in the old format. The first time a new field is added to `TitleSlideData`, all previously saved reports would need upgrading. This cost is not justified by the workflow.
- **`file://` protocol constraints.** Some browser configurations restrict `localStorage` and `IndexedDB` access in `file://` contexts. The app must work unconditionally in `file://` — adding persistence creates a failure mode.
- **Simpler testing.** No storage mocks, no `beforeEach` cleanup, no concern about test isolation from leftover state. Every test starts clean.

**What was ruled out:**

- **`localStorage` autosave:** Adds the migration story immediately. Also limited to ~5MB, which could be exceeded by a report with many chart data points.
- **File System Access API:** Not universally available in `file://` contexts. Adds a file picker UX, conflict resolution when the user moves the saved file, and a significant new feature scope.

---

## ADR-006: No abstraction for fewer than three real callsites

**Decision:** A shared hook, utility function, or component is only extracted when three distinct, real callsites exist in the codebase. Two similar-looking pieces of code are left as duplication with a comment.

**Why this choice:**

- **Two callsites are not enough information.** Two things that look alike today often represent different concerns that will diverge under different requirements. If you unify them, you create coupling between unrelated features. When one changes, you must either modify the shared abstraction (breaking the other callsite) or introduce a configuration parameter that makes the abstraction more complex than the original duplication.
- **The wrong abstraction is harder to remove than duplication.** Duplicated code can be independently changed. A shared abstraction that is used in 5 places requires changing all 5 when the abstraction turns out to be wrong. Duplication costs maintenance; a wrong abstraction costs a rewrite.
- **The third callsite reveals the pattern.** With three real examples, you have enough evidence to see what the genuine shared boundary is. The abstraction you extract at callsite three is almost always better than the one you would have extracted at callsite two.

**In practice:**

```typescript
// One callsite — inline it.

// Two callsites — duplicate it, mark it:
// NOTE: similar to the date formatting in SlidePanel.tsx — extract if a third callsite appears.

// Three callsites — extract to src/utils/formatters.ts and import everywhere.
```

**What was ruled out:**

- **Extracting at callsite one "for future use":** This is speculative abstraction. It creates an interface based on one use case, which is almost always wrong. The interface either over-generalises (accepting parameters no real caller needs) or under-generalises (missing what the second caller needs, forcing awkward extension).
- **Extracting at callsite two "to follow DRY":** DRY (Don't Repeat Yourself) is a heuristic, not a law. The full statement is "every piece of **knowledge** should have a single, unambiguous representation." Two pieces of code that look the same but represent different knowledge should stay separate.
