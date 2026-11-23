# Project Skill Set

This document outlines the core skills and best practices required to work on the **Registar na javni pretprijatija MK** React application.

## 🛠 Core Technical Stack

- **Framework:** React 19 (React Compiler) with Vite 8
- **Build Tool:** Vite 8 – fast HMR, ES‑module based build
- **Styling:** Bootstrap 5 + SCSS
- **Routing:** react‑router‑dom 7
- **Data Processing:** `xlsx` in build scripts only; the browser reads the generated `public/data/registar.json`
- **Charts:** Chart.js for data visualization
- **State & Data Flow:** Local component state, custom hook (`useData`) – no external state manager
- **Testing / Linting:** ESLint 10 (React Hooks + React Refresh plugins)
- **Utilities:** Small helper modules for decimal formatting, transliteration, URL state, SEO metadata, and chart constants.

## 📐 Architectural Principles

- **Component‑first**: Each UI piece lives in its own component file (`src/components`).
- **Hooks for logic**: Shared data fetching is encapsulated in `useData.jsx`.
- **URL‑driven state**: Filter parameters (year, quarter, sorting, order, currency) are stored in the URL, not localStorage. This ensures consistent behavior across page navigation.
- **Static shells, client runtime**: There is no backend or SSR. The build generates per-route HTML shells with SEO metadata and a `<noscript>` fallback; React renders the interactive app from `data/registar.json`.
- **Language routes**: Page routes live under `/:lang` with a `LangLayout` guard. Unsupported language prefixes and unknown paths render `NotFound`, which is `noindex`.
- **Semantic headings**: Keep one `<h1>` per page. The site header brand is a `<p>`; cards and section titles use `<h2>`/`<h3>`.
- **Performance focus**: React Compiler handles most memoization; `useMemo`/`useCallback` are still used for expensive derived values and stable effect dependencies.
- **Accessibility**: Components use semantic HTML and Bootstrap utility classes; ARIA attributes added where necessary.

## 🚀 Common Workflows

### Component Creation

1. Create a new `.jsx` file in `src/components/`.
2. Export the component as default.
3. Import styles via SCSS or Bootstrap classes.
4. If the component needs data, consume it from `useData` or pass props.
5. Extract a component or memoized value only where it measurably helps; React Compiler handles most of the baseline memoization.

### Data Fetching & Processing

- `scripts/generate-data.js` parses the ODS with `xlsx` at build time and writes `public/data/registar.json` (`{ companies, years, moneyByYear }`). `xlsx` is not shipped to the browser.
- `useData` fetches that JSON once and shares the promise between components. The request is versioned with the ODS date (`?v=...`) to avoid stale cached data after a deployment.
- Use the `?v=` version and the shared promise; do not fetch the ODS or JSON independently in components.
- All numeric values are formatted using `decimalNumbers.jsx` (use `formatDecimalNumber` for parsing, `parseDecimalNumber` for display).
- If a new deployment replaces lazy chunks, `main.jsx` reloads once on Vite's `vite:preloadError` event, with a 10-second guard against reload loops.

### Filter & Sorting

- Filter definitions are centralized in `src/utils/filterDefinitions.jsx`.
- URL state: path params `:lang`, `:filter`, `:company`; query params `year`, `quarter`, `sort`, `order`, `currency`, and compare-specific `base`/`compare`.
- Filter types: `positive-result`, `negative-result`, `income`, `no-income`, `earned-more`, `spent-more`
- Default values are computed at module level using constants (e.g., `DEFAULT_SORTING`, `DEFAULT_ORDER`).
- Sorting/ordering logic should handle the default case specially (no sorting applied when both sorting and order are at defaults).

### Comparison Page

- `YearComparison.jsx` reads `base`/`compare` through `useComparisonParams`; the shared `Navbar` renders both year selects and the currency switcher via `showComparisonFilters`.
- `buildYearComparison` merges renamed companies through `src/utils/companyAliases.js`. Add an alias when the ODS introduces a rename.
- One-sided companies stay in the table, are labeled “Only in {year}”, and are sorted last; their values still count toward the year totals.

### Chart Rendering

- Chart configuration constants live in `src/utils/charts.js`.
- Use `createChartOptions()` for vertical bar charts, `createHorizontalChartOptions()` for horizontal bar charts.
- The `dashedBorderPlugin` provides dashed borders for financial result bars.
- Overview page uses `OverviewChart` component for displaying total income, expenses, and financial results.
- Filtered pages use `FilteredChart` component which dynamically shows income, expenses, or financial results based on the filter type.

### Filtered Pages

- Filtered pages (e.g., `/:lang/filtered/positive-result`) show a chart of companies matching the filter criteria.
- The chart title is dynamic based on the filter type and displays localized text.
- Use `FILTER_TO_SORT` mapping to determine which column to highlight in DefinitionLists.

## ⚠️ Constraints & Best Practices

- **Functional components with hooks** – the only class component is `DataErrorBoundary`, because React error boundaries require a class.
- **Use custom hooks for shared logic** – avoid adding a global store unless the data flow genuinely requires it.
- **Keep side‑effects minimal** – `useEffect` is used for data fetching and chart lifecycle; cleanup functions are provided when necessary.
- **Linting rules**: Follow ESLint config in `eslint.config.js`; no unused variables unless prefixed with `_`.
- **Testing**: Although not yet configured, future tests should use Vitest + React Testing Library.

### Code Review

Use the `review` subagent to review code changes:

```bash
/review [commit|branch|pr]  # defaults to uncommitted changes
```

Review checklist:

- Null/undefined guard for values used as map/object keys
- Redundant undefined checks on values already guaranteed to be arrays
- Redundant `parseInt`/re-parsing of already-validated values
- Missing `to` block in `@keyframes` definitions
- Redundant CSS properties (e.g., `opacity: 1` on animated elements)

---

_Skill set last updated: November 2026_
