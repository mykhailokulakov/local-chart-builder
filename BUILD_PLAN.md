# BUILD_PLAN.md — Report Builder: Phased Build Plan

## How to use this file

Each phase has milestones, and each milestone has tasks with ready-to-use Claude Code prompts.
Run prompts in order within each phase. Each prompt assumes the previous ones are complete.

---

## Phase 1: Project scaffold and builder shell

**Branch:** `feat/phase-1-shell`
**Goal:** Working three-panel layout with slide management, theme switching, and i18n. No charts yet.

### Milestone 1.1: Project initialization

**Task 1.1.1 — Scaffold Vite + React + TypeScript project**

```
Create a new Vite project with React and TypeScript. Use the following config:
- Vite 6+ with React plugin and SWC
- TypeScript strict mode
- Tailwind CSS 3 with PostCSS
- Ant Design 5
- ESLint with @typescript-eslint/recommended and react-hooks/recommended
- Prettier with: singleQuote, no semicolons, printWidth 100, trailingComma all
- Vitest for testing with jsdom environment
- Package scripts: dev, build, preview, lint, format, format:check, typecheck, test

Initialize the project in the current directory. Create .eslintrc.cjs, .prettierrc, tsconfig.json, tailwind.config.ts, vite.config.ts.

Add a CI workflow at .github/workflows/ci.yml that runs: format:check, lint, typecheck, test (--run), and build on push and PR.

Ensure `npm run build` output works when opened via file:// protocol in Chrome (set base: './' in vite config).

Read CLAUDE.md for full project context before starting.
```

**Task 1.1.2 — Define TypeScript interfaces**

```
Create all TypeScript interfaces in src/types/. Read CLAUDE.md for the data model overview.

Create these files:
1. src/types/slide.ts — Report, Slide, SlideType, SlideData (discriminated union), TitleSlideData, ChartSlideData, DividerSlideData, TextSlideData, EndingSlideData
2. src/types/chart.ts — ChartType, ChartData (label/value pairs), GanttTask, ChoroplethRegionData, DataTableRow, ChartOptions (showValues, showLegend, showAxis)
3. src/types/theme.ts — ThemePreset enum (dark, mindigit, light, slate), ThemeColors interface (background, foreground, accent, chartColors array, fontFamily)
4. src/types/layout.ts — TileConfig, GridLayout (x, y, w, h as used by react-grid-layout), TextData (heading, body, alignment, fontSize)
5. src/types/index.ts — barrel export

Every type should be exported. No 'any'. Use string literal unions where appropriate. Add JSDoc comments on non-obvious fields.

Run format and lint after creating files.
```

**Task 1.1.3 — Set up state management**

```
Create the report state management using React Context + useReducer pattern. Read CLAUDE.md for architecture guidance.

Create:
1. src/store/actions.ts — Action type union with all action creators:
   - ADD_SLIDE, REMOVE_SLIDE, REORDER_SLIDE, UPDATE_SLIDE_DATA
   - SELECT_SLIDE, SELECT_TILE
   - ADD_TILE, REMOVE_TILE, UPDATE_TILE_DATA, UPDATE_TILE_LAYOUT
   - SET_THEME, SET_LANGUAGE
   - UNDO, REDO

2. src/store/reportReducer.ts — Pure reducer function handling all actions. Immutable updates only (spread/map, no mutations). Handle edge cases (reorder beyond bounds, remove selected slide, etc.)

3. src/store/undoMiddleware.ts — A higher-order reducer that wraps reportReducer with undo/redo history.
   - Maintains { past: Report[], present: Report, future: Report[] }
   - On UNDO: move present to future, pop past to present
   - On REDO: move present to past, pop future to present
   - On content-modifying actions (ADD_SLIDE, REMOVE_SLIDE, REORDER_SLIDE, UPDATE_SLIDE_DATA, ADD_TILE, REMOVE_TILE, UPDATE_TILE_DATA, UPDATE_TILE_LAYOUT, SET_THEME): push current present to past, clear future, apply action to get new present
   - On UI-only actions (SELECT_SLIDE, SELECT_TILE, SET_LANGUAGE): apply directly to present, do NOT push to history (these don't change report content)
   - Max history depth: 50 entries (drop oldest when exceeded)
   - Debounce text input: for UPDATE_SLIDE_DATA and UPDATE_TILE_DATA, if the previous action was the same type targeting the same id and happened within 500ms, replace the last history entry instead of adding a new one (prevents every keystroke from being a separate undo step)

4. src/store/ReportContext.tsx — Context provider using undoMiddleware-wrapped reducer. Expose: state, dispatch, canUndo, canRedo.

5. src/hooks/useReport.ts — Custom hook wrapping useContext for ReportContext. Throw if used outside provider.
6. src/hooks/useSelectedSlide.ts — Returns the currently selected slide data.
7. src/hooks/useSelectedTile.ts — Returns the currently selected tile data within the selected slide.
8. src/hooks/useUndoRedo.ts — Returns { canUndo, canRedo, undo, redo } from context. Convenience hook for UI buttons and keyboard shortcuts.

Write unit tests for:
- reportReducer: every action type
- undoMiddleware: undo, redo, history limit, debounce, UI-only actions not pushing history
Put tests in tests/unit/reportReducer.test.ts and tests/unit/undoMiddleware.test.ts.

Run format, lint, and tests before finishing.
```

### Milestone 1.2: Builder shell UI

**Task 1.2.1 — Create the three-panel AppShell layout**

```
Build the main application shell with Ant Design and Tailwind. Read CLAUDE.md for project structure.

Create src/components/layout/AppShell.tsx:
- Top bar: app title "Report Builder" (left), undo/redo buttons with Ctrl+Z/Ctrl+Shift+Z hints (center-left, disabled when canUndo/canRedo is false), language toggle UA/EN (center-right), theme selector dropdown (right), Export PDF button (far right, primary style)
- Three-panel layout below using CSS grid or flexbox:
  - Left: SlidePanel (fixed 200px width, scrollable)
  - Center: Canvas area (flex: 1)
  - Right: PropertiesPanel (fixed 280px width, scrollable)
- The layout should fill the viewport (100vh)
- Register global keyboard shortcuts: Ctrl+Z for undo, Ctrl+Shift+Z (or Ctrl+Y) for redo. Use useEffect with keydown listener. Only fire when not focused on an input/textarea (to avoid conflicting with native browser undo in text fields).

Create placeholder components for SlidePanel, Canvas, PropertiesPanel that just show their name.

Wire up the AppShell in App.tsx with ReportContext provider and i18n provider.

Use Ant Design components: Layout, Button, Select, Dropdown for the top bar controls.

Run format and lint after.
```

**Task 1.2.2 — Build the SlidePanel (left sidebar)**

```
Build the slide list panel in src/components/layout/SlidePanel.tsx.

Features:
- Lists all slides as thumbnail cards showing: slide number, type label, mini preview (just colored rectangle with text for now)
- Selected slide has highlighted border (use Ant Design's token colors)
- "Add slide" button at the bottom opens a dropdown with slide type options: Title, Chart, Section divider, Free text, Ending
- Each slide card has a context menu (right-click or ... button): Duplicate, Delete, Move up, Move down
- Drag-and-drop reordering using react-grid-layout's drag or a simpler solution like @dnd-kit/sortable
- Clicking a slide card dispatches SELECT_SLIDE action

Use Ant Design: Card, Button, Dropdown, Menu components.
Wire to ReportContext for state and dispatch.
Keep the component under 150 lines — extract sub-components if needed.

Run format and lint after.
```

**Task 1.2.3 — Build the PropertiesPanel (right sidebar)**

```
Build the context-sensitive properties panel in src/components/layout/PropertiesPanel.tsx.

Behavior:
- If a tile is selected: show the tile editor (delegate to specific editor component based on tile type)
- If no tile is selected but a slide is selected: show slide-level properties
- Show a "Back to slide" link when in tile editing mode

Create editor components (with placeholder content for now):
1. src/components/editors/TitleEditor.tsx — Fields: report title, subtitle, organization, date. All using Ant Design Input components.
2. src/components/editors/EndingEditor.tsx — Fields: closing text, contact info, disclaimer
3. src/components/editors/DividerEditor.tsx — Fields: section name, subtitle
4. src/components/editors/TextSlideEditor.tsx — Fields: heading, body (TextArea)
5. src/components/editors/ChartSlideEditor.tsx — Shows slide title field + list of tiles on this slide with "Edit" links

Each editor reads from and writes to ReportContext.

Run format and lint after.
```

**Task 1.2.4 — Build the Canvas (center panel)**

```
Build the slide preview canvas in src/components/layout/Canvas.tsx.

Features:
- Shows the currently selected slide at 16:9 aspect ratio, centered in the available space
- Scales to fit the available width while maintaining 16:9 ratio
- For chart-type slides: renders a react-grid-layout grid where tiles can be dragged and resized
- For other slide types: renders the slide preview directly (title slide, divider, text, ending)
- Tile toolbar appears above the canvas only for chart-type slides
- Status bar below shows: "Slide X of Y" (left), contextual hint (right)

Create src/components/toolbar/TileToolbar.tsx:
- Horizontal bar with pill-shaped buttons: Bar, Donut, Line, Gantt, Map, Table, Text
- Clicking a button dispatches ADD_TILE with the appropriate chart type and default layout
- Use Ant Design Button or custom styled pills

For now, tiles in the grid show their type name and a placeholder icon. Actual chart rendering comes in Phase 2.

Install react-grid-layout v2. Do NOT install @types/react-grid-layout (v2 has built-in types).

Run format, lint, and test after.
```

### Milestone 1.3: Theme system and i18n

**Task 1.3.1 — Implement theme presets**

```
Create the theme system. Read CLAUDE.md for theme definitions.

Create theme files in src/themes/:
1. dark.ts — Dark navy background (#111827), light blue accents (#3b82f6), white text. Inspired by NCSI/Diia City slides.
2. mindigit.ts — Dark green background (#0a2e1f), gold accents (#c5a24d), green highlights. Inspired by MinDigit branding.
3. light.ts — White/light gray background, colored chart fills (green, orange, blue). Inspired by the tech ecosystem dashboard.
4. slate.ts — Dark gray (#1e1e2e), muted blue/purple accents, neutral tones.

Each theme exports a ThemeColors object. Include: background, surface, foreground, muted, accent, accentSecondary, chartColors (array of 8 colors for chart series), fontFamily.

Create a ThemeContext or extend ReportContext to provide the current theme colors throughout the app.

Apply the theme to the slide preview canvas via CSS custom properties or inline styles. The builder UI (Ant Design) stays in its default theme — only the slide preview area changes.

Run format and lint after.
```

**Task 1.3.2 — Implement bilingual i18n**

```
Set up i18next for Ukrainian/English bilingual support.

Create:
1. src/i18n/config.ts — i18next initialization with language detector (default: 'ua'), no backend (bundled translations)
2. src/i18n/ua.json — Ukrainian translations for all UI labels: button text, slide type names, editor labels, toolbar items, status messages, placeholder text
3. src/i18n/en.json — English translations matching the same keys

Key groups:
- app: title, version
- slides: title, chart, divider, text, ending, addSlide
- toolbar: bar, donut, line, gantt, map, table, text
- editor: slideProperties, tileEditor, chartTitle, dataInput, manual, csv, addRow, display, showValues, showLegend, showAxis, deleteSlide, deleteTile, backToSlide
- export: exportPdf, exporting, done
- themes: dark, mindigit, light, slate

Wire the language toggle in AppShell to switch i18next language.
Replace all hardcoded strings in existing components with t() calls.

Run format and lint after.
```

### Milestone 1.4: Phase 1 checkpoint

**Task 1.4.1 — Integration test and cleanup**

```
Phase 1 is complete. Do a full integration check:

1. Run npm run format && npm run lint && npm run typecheck && npm run test -- --run && npm run build
2. Open dist/index.html in Chrome via file:// and verify the three-panel layout loads
3. Review all code for:
   - Dead imports or unused variables
   - Any 'as any' type casts
   - Components over 150 lines that should be split
   - Missing i18n translations (hardcoded strings)
   - Prop drilling deeper than 2 levels
   - Duplicate code that should be extracted

Fix any issues found. Commit as "refactor: phase 1 cleanup".

Then commit all Phase 1 work and merge to main.
```

---

## Phase 2: Chart renderers

**Branch:** `feat/phase-2-charts`
**Goal:** All chart types rendering in the slide preview with real data input.

### Milestone 2.1: Bar and donut charts

**Task 2.1.1 — Build BarChart component**

```
Create src/components/charts/BarChart.tsx using Chart.js and react-chartjs-2.

Props interface:
- data: { label: string; value: number }[]
- orientation: 'vertical' | 'horizontal'
- options: { showValues: boolean; showLegend: boolean; showAxis: boolean }
- theme: ThemeColors (for colors, fonts)

The component should:
- Register required Chart.js components (BarElement, CategoryScale, etc.)
- Apply theme colors to bars, axes, labels, background
- Support both vertical and horizontal orientation
- Show value labels on bars when showValues is true
- Handle empty data gracefully (show placeholder message)
- Be pure — no side effects, no state, just render from props

Write tests: render with sample data, render with empty data, render horizontal.

Run format, lint, test after.
```

**Task 2.1.2 — Build DonutChart component**

```
Create src/components/charts/DonutChart.tsx using Chart.js and react-chartjs-2.

Props: data (label/value pairs), options (showValues, showLegend), theme.

Features:
- Donut (not pie) — cutout at 60%
- Theme-colored segments using theme.chartColors array
- Optional center label showing total or main metric
- Legend below the chart when showLegend is true
- Value labels on segments when showValues is true

Write tests. Run format, lint, test.
```

**Task 2.1.3 — Build the ChartTileEditor with data input**

```
Create src/components/editors/ChartTileEditor.tsx — the right-panel editor that appears when a chart tile is selected.

Features:
- Chart type selector (visual grid of icons for bar-v, bar-h, donut, line, gantt, map, table)
- Chart title input
- Data input toggle: Manual | CSV paste
- Manual mode: Label/Value rows with add/delete. Each row is an Ant Design Input pair.
- CSV mode: Ant Design TextArea for pasting tab-separated or comma-separated data. "Parse & apply" button that calls csvParser service.
- Display toggles: show values, show legend, show axis (Ant Design Switch)
- Delete tile button (danger style)

Create src/services/csvParser.ts:
- Parse CSV (comma or tab separated) into { label: string; value: number }[]
- Handle: header row detection, empty lines, quoted values, number formatting with comma decimals
- Throw descriptive errors for malformed input

Write unit tests for csvParser with edge cases. Run format, lint, test.
```

### Milestone 2.2: Line and Gantt charts

**Task 2.2.1 — Build LineChart component**

```
Create src/components/charts/LineChart.tsx using Chart.js and react-chartjs-2.

Props: data (label/value pairs — labels are X axis, values are Y), options, theme.

Features:
- Smooth line with tension 0.3
- Filled area below line (theme accent color at 10% opacity)
- Data point dots
- Theme-colored axes and labels
- Support multiple datasets if data is provided as array of series

Write tests. Run format, lint, test.
```

**Task 2.2.2 — Build GanttChart component**

```
Create src/components/charts/GanttChart.tsx as a custom SVG renderer (no library).

Props:
- tasks: GanttTask[] where GanttTask = { name: string; startMonth: number; endMonth: number; status: 'done' | 'in-progress' | 'planned' }
- theme: ThemeColors

Design reference (from user-provided image):
- Y-axis: task names (left-aligned)
- X-axis: month labels (Jan–Dec)
- Horizontal bars for each task spanning start to end month
- Status label inside each bar ("Done" / "In progress" / "Planned")
- Color coding: done = teal/darker, in-progress = lighter blue, planned = gray
- Rounded bar ends (border-radius)

Render as SVG for crisp PDF export. No Chart.js — this is custom.

Also create src/components/editors/GanttEditor.tsx:
- Task list with: name (Input), start month (Select 1-12), end month (Select 1-12), status (Select)
- Add/remove task rows

Write tests for GanttChart rendering. Run format, lint, test.
```

### Milestone 2.3: Choropleth map and data table

**Task 2.3.1 — Build ChoroplethMap component**

```
Create src/components/charts/ChoroplethMap.tsx using D3.js.

Props:
- data: ChoroplethRegionData[] where each has { oblastName: string; value: number }
- theme: ThemeColors
- valueRange: { min: number; max: number } (for color scale)

Features:
- Load Ukraine oblasts GeoJSON from src/assets/ukraine-oblasts.geojson
- Color scale: linear interpolation between two theme colors based on value (0 = lightest, 1 = darkest)
- Oblast labels with values displayed on the map
- Legend bar showing the color scale with min/max values
- Crimea shown with special styling and "Crimea is Ukraine" note (matching the reference image)
- Render as SVG for PDF export

You need to find or create a Ukraine oblasts GeoJSON file. Search for an open-source one with oblast boundaries. Save to src/assets/ukraine-oblasts.geojson.

Create src/components/editors/MapEditor.tsx:
- List of all 25 oblasts (pre-populated from GeoJSON) with value input fields
- CSV paste support for bulk data entry
- Color range selector (optional, or use theme defaults)

Write tests. Run format, lint, test.
```

**Task 2.3.2 — Build DataTable component**

```
Create src/components/charts/DataTable.tsx.

Props:
- columns: { key: string; label: string }[]
- rows: Record<string, string | number>[]
- theme: ThemeColors
- options: { showHeader: boolean; striped: boolean; bordered: boolean }

Features:
- Styled table matching theme (dark background with light text for dark themes, etc.)
- Header row with bold text
- Alternating row colors when striped
- Right-aligned numbers, left-aligned text
- Renders as HTML table (works well with html2canvas)

Create src/components/editors/DataTableEditor.tsx:
- Column definition: add/remove/rename columns
- Row data: editable cells in a grid
- CSV paste support to populate the entire table

Write tests. Run format, lint, test.
```

### Milestone 2.4: Wire charts into canvas

**Task 2.4.1 — Connect chart components to the tile grid**

```
Update src/components/layout/Canvas.tsx and src/components/slides/ChartSlide.tsx to render actual charts inside react-grid-layout tiles.

For each tile in the selected slide:
- Read tile.type and tile.data from state
- Render the appropriate chart component (BarChart, DonutChart, etc.) inside the grid item
- Pass the current theme colors to each chart
- Charts should resize responsively within their grid cell
- Selected tile shows a blue highlight border
- Clicking a tile dispatches SELECT_TILE

Handle the slide title display above the chart grid area.

Ensure chart components are wrapped in error boundaries so a broken chart doesn't crash the whole canvas.

Run format, lint, test, build. Test file:// output.
```

---

## Phase 3: Slide renderers and PDF export

**Branch:** `feat/phase-3-pdf`
**Goal:** All slide types render correctly and export to a polished multi-page 16:9 PDF.

### Milestone 3.1: Non-chart slide renderers

**Task 3.1.1 — Build all slide type renderers**

```
Build the preview renderers for non-chart slides. Each renders a themed 16:9 slide.

Create/update:
1. src/components/slides/TitleSlide.tsx — Organization name (small, top), report title (large, center), subtitle (medium, below), date (small, bottom). All text centered. Apply theme background/foreground colors.

2. src/components/slides/DividerSlide.tsx — Section name (large, centered), optional subtitle below. Theme accent color as a horizontal rule or decorative element.

3. src/components/slides/TextSlide.tsx — Heading (left-aligned or centered based on data), body text below with proper line height. Support the text tile's fontSize (S/M/L) and alignment settings.

4. src/components/slides/EndingSlide.tsx — Closing text (large, centered, e.g. "Thank you"), contact info (smaller, below), disclaimer (smallest, bottom). Similar to title slide layout.

All slide renderers receive: slideData, theme. They render at the exact slide dimensions (1920x1080 conceptually, scaled down for preview).

Run format, lint, test.
```

### Milestone 3.2: PDF export pipeline

**Task 3.2.1 — Build the PDF export service**

```
Create src/services/pdfExport.ts — the core PDF generation pipeline.

Algorithm:
1. Create a hidden container div (off-screen, position: absolute, left: -9999px)
2. For each slide in the report:
   a. Render the slide component into the hidden container at 1920x1080px (actual pixel dimensions)
   b. Apply the theme as inline styles (no CSS classes — html2canvas needs inline)
   c. Wait for Chart.js animations to complete (if any charts)
   d. Use html2canvas to capture the container as a canvas element
   e. Convert canvas to JPEG data URL (quality 0.92 for good quality/size balance)
   f. Add as a page to jsPDF (landscape, 16:9 dimensions)
3. Save the PDF with a filename: "{report-title}_{date}.pdf"
4. Clean up the hidden container

Handle:
- Loading state (dispatch events for progress: "Exporting slide 1 of 5...")
- Errors (catch and display user-friendly message via Ant Design notification)
- Canvas font rendering (ensure e-Ukraine font is loaded before capturing)
- SVG in slides (D3 choropleth) — html2canvas handles inline SVG

Create a PDF export button handler in AppShell that calls this service.

Write tests with mocked html2canvas and jsPDF. Run format, lint, test.
```

**Task 3.2.2 — PDF export integration and testing**

```
Wire up the PDF export end-to-end.

1. Add a loading modal (Ant Design Modal/Spin) that shows during export with progress
2. Test export with:
   - A report with all slide types (title, chart, divider, text, ending)
   - Charts with real data (at least bar, donut, and line)
   - Both dark and light themes
   - Both languages (check that Ukrainian text renders correctly in PDF)
3. Verify the PDF looks correct:
   - 16:9 landscape pages
   - Theme colors match the preview
   - Charts render with correct data
   - Text is sharp (not blurry)
   - Font is correct (e-Ukraine if available, fallback to Inter/system)

Fix any rendering issues. Common problems:
- Chart.js canvas not ready: add a delay or wait for animation callback
- Fonts not loaded: use document.fonts.ready before capturing
- SVG not rendered: D3 elements need to be in the DOM

Run full CI pipeline. Build and test via file://.
```

---

## Phase 4: Polish and edge cases

**Branch:** `feat/phase-4-polish`
**Goal:** Production-ready quality. All edge cases handled, UX polished.

### Milestone 4.1: UX polish

**Task 4.1.1 — Empty states and onboarding**

```
Add polished empty states throughout the app:

1. Start screen (no slides) — centered icon, "Create a new report" heading, description text, primary "New report" button. The button creates a title slide and selects it.
2. Empty chart slide (no tiles) — dashed border area with "Click a tile type above to add it" message
3. Empty right panel (no selection) — helpful text about how to use the builder
4. Chart with no data — placeholder in chart area saying "Add data to see preview"

Also:
- Add keyboard shortcuts: Delete key removes selected tile/slide (with confirmation)
- Verify undo/redo keyboard shortcuts (Ctrl+Z, Ctrl+Shift+Z) work correctly across all actions — test: add slide → undo → redo, edit chart data → undo → verify data reverts, delete tile → undo → tile reappears
- Add confirmation dialog before deleting slides (Ant Design Popconfirm)
- Add slide duplication logic
- Ensure tab order makes sense for keyboard navigation

Run format, lint, test.
```

**Task 4.1.2 — Theme preview and switching polish**

```
Polish the theme switching experience:

1. Theme selector shows a preview of each theme (small 16:9 rectangles with theme colors)
2. Switching themes updates ALL slides instantly (live preview)
3. Ensure every chart type respects theme colors:
   - Bar chart bar colors
   - Donut segment colors
   - Line chart line and fill colors
   - Gantt bar colors
   - Choropleth map color scale
   - Data table header/row colors
   - Text colors on all slide types

Test each theme with a full report. Fix any color contrast issues.

Run format, lint, test.
```

### Milestone 4.2: Font bundling and final build

**Task 4.2.1 — Bundle e-Ukraine font**

```
Set up the e-Ukraine font for the application.

Note: The user will provide .otf files. For now, set up the infrastructure:

1. Create public/fonts/e-ukraine/ directory
2. Create a @font-face CSS declaration in src/index.css (or a dedicated fonts.css):
   - e-Ukraine Regular (400)
   - e-Ukraine Bold (700)
   - e-Ukraine Light (300) if available
3. Set the font as default for slide renderers via theme configuration
4. Ensure the font is loaded before PDF export (await document.fonts.ready)
5. Fallback chain: 'e-Ukraine', 'Inter', 'Helvetica Neue', Arial, sans-serif

If .otf files aren't available yet, use Inter as a placeholder (download from Google Fonts and bundle locally — no CDN).

For .otf to .woff2 conversion, the user can use an online tool or we can add a build script.

Run format, lint, test, build. Test file:// output.
```

**Task 4.2.2 — Final audit and release**

```
Final pre-release audit:

1. Run the full CI pipeline: format:check, lint, typecheck, test, build
2. Open dist/index.html via file:// in Chrome — verify everything works
3. Test the complete user flow:
   - Create new report
   - Add title slide, fill in data
   - Add chart slide, add bar chart tile, enter data manually
   - Add another tile (donut), paste CSV data
   - Rearrange tiles by dragging
   - Add text slide with narrative
   - Add ending slide
   - Switch themes, verify all slides update
   - Switch language to EN, verify labels change
   - Export PDF, verify all pages look correct
4. Run the passive code audit checklist from CLAUDE.md
5. Check bundle size (should be under 5MB for the dist folder)
6. Create a README.md with:
   - Project description
   - Screenshot
   - How to install (npm install)
   - How to develop (npm run dev)
   - How to build (npm run build)
   - How to use (open dist/index.html in Chrome)
   - How to share (zip the dist/ folder)

Commit everything. Merge to main. Tag as v1.0.0.
```

---

## Phase 5 (Future): Advanced features

These are not part of v1 but documented for planning:

- **Save/load report as JSON** — export report state as .json file, import to rebuild
- **Electron/Tauri wrapper** — .exe/.dmg distribution
- **Custom color picker** — per-chart color overrides beyond theme presets
- **Animation preview** — slide transitions for presentation mode
- **Template system** — pre-built report templates for common report types
- **Image tiles** — upload PNG/SVG to embed in slides
