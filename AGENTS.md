# AGENTS.md - Developer Guidelines for This Project

## Project Overview

This is a React 19 + Vite application that displays a registry of Macedonian public enterprises with financial data. The app loads data from ODS/Excel files and displays company information, financials, and search/filter capabilities.

## Tech Stack

- **Framework**: React 19 with React Compiler
- **Build Tool**: Vite 7
- **Styling**: Bootstrap 5 + SCSS (sass-embedded)
- **Routing**: React Router DOM 7
- **Data Processing**: xlsx library for Excel parsing
- **Linting**: ESLint 9 with react-hooks and react-refresh plugins

---

## Build / Lint / Test Commands

### Development

```bash
npm run dev          # Start Vite dev server with HMR
```

### Production Build

```bash
npm run build        # Build for production (outputs to dist/)
npm run preview      # Preview production build locally
```

### Linting

```bash
npm run lint         # Run ESLint on all files
```

### Testing

**No test framework is currently configured.** If you need to add tests:

- Consider using Vitest (matches Vite ecosystem)
- Run tests with: `npx vitest run`
- Run a single test file: `npx vitest run path/to/test.js`

---

## Code Style Guidelines

### File Organization

- **Components**: Place in `src/components/` - one file per component
- **Hooks**: Place custom hooks in `src/hooks/` (e.g., `useData.jsx`)
- **Utilities**: Place in `src/utils/` - one file per utility function
- **Routes/Pages**: Place in `src/` root - one file per page (e.g., `App.jsx`)
- **Styles**: Place in `src/assets/scss/`

### Naming Conventions

- **Components**: PascalCase (e.g., `Company.jsx`, `Cards.jsx`)
- **Utility functions**: camelCase (e.g., `file.jsx`, `decimalNumbers.jsx`)
- **CSS/SCSS files**: Match component name (e.g., `Company.scss`)
- **Constants**: PascalCase for exported constants (e.g., `AvailableYears`)

### Component Structure

```jsx
// 1. React imports
import { useState, useEffect, useMemo, useCallback } from "react";

// 2. Third-party library imports (grouped)
import { read, utils } from "xlsx";
import { useParams } from "react-router-dom";

// 3. Local imports (grouped) - relative paths
import { file } from "../utils/file";
import { transliterate } from "../utils/transliterate";

// 4. Constants (outside component for module-level caching)
const CHART_OPTIONS = { ... };

// 5. Component definition
function ComponentName() {
  // Hooks first
  const [state, setState] = useState(initialValue);

  // Memoized values
  const derivedValue = useMemo(() => {
    return computeValue(state);
  }, [state]);

  // Callback functions (useCallback for stable references)
  const handleEvent = useCallback((value) => {
    // handler logic
  }, [dependencies]);

  // Effects next
  useEffect(() => {
    // async IIFE for data fetching
    (async () => {
      // fetch logic
    })();

    // cleanup function
    return () => {
      // cleanup logic
    };
  }, [dependencies]);

  // Render
  return (
    <div>...</div>
  );
}

// 6. Named export at bottom
export default ComponentName;
```

### Formatting Rules

- **Quotes**: Use double quotes for strings `"string"` not `'string'`
- **Semicolons**: Include semicolons at end of statements
- **Indentation**: 2 spaces
- **Line breaks**: Use blank lines to separate logical sections in components
- **JSX attributes**: Use multi-line format for complex elements

### React Patterns

- **State**: Use `useState` for component-local state
- **Memoization**: Use `useMemo` for computed values, `useCallback` for stable function references
- **Effects**: Use `useEffect` for side effects (data fetching, subscriptions)
- **Async operations**: Use IIFE pattern: `(async () => { ... })()`
- **Fragment**: Use `<Fragment>` or `<>` for multiple root elements
- **Event handlers**: Inline arrow functions for simple handlers, or define separately with useCallback

### Scroll-to-Top Behavior

For pages that need to scroll to top on navigation (e.g., company detail pages), use the `CompanyWrapper` pattern:

```jsx
// CompanyWrapper.jsx - forces remount on route change
export default function CompanyWrapper() {
  const { company } = useParams();
  return <Company key={company} />;
}
```

This triggers a full remount when the company parameter changes, resetting all state and scroll position.

### Error Handling

- Currently minimal error handling in the codebase
- For data fetching: ensure to check `response.ok` or wrap in try/catch
- For potentially undefined values: use optional chaining or conditional rendering
- For useMemo: avoid including changing references in dependencies

### useEffect Patterns

```jsx
useEffect(() => {
  // cleanup function (important for subscriptions, timers, etc.)
  return () => {
    // cleanup logic
  };
}, [dependencies]);
```

### Imports Organization

Order imports in groups (with blank line between groups):

1. React built-ins (`react`)
2. Third-party libraries (`xlsx`, `react-router-dom`, etc.)
3. Local components (`./components/`)
4. Local utils (`../utils/`)

### CSS / Styling

- Use Bootstrap 5 classes for layout and styling
- Use SCSS for custom styles in `src/assets/scss/`
- Follow Bootstrap naming for custom CSS classes
- Use Bootstrap's utility classes for quick styling

### Constants and Configuration

- Hardcoded values (like dropdown options) are defined in `src/utils/` files
- Environment variables: Use `import.meta.env.VITE_*` for Vite env vars
- Create `.env` files for local development (not committed to git)
- Avoid inline transformations of constants (e.g., `cleanName(transliterate(...))`) - pre-process at definition

### ESLint Configuration

The project uses ESLint with these rules:

- Extends: `js.configs.recommended`, `reactHooks.configs.flat.recommended`, `reactRefresh.configs.vite`
- Custom rule: `no-unused-vars` with pattern `^[A-Z_]` for allowed unused constants

### React Router Patterns

- Define routes in `main.jsx` using `Routes` and `Route`
- Use dynamic parameters with colon syntax: `/:year`, `/:year/:quarter`
- Access params with `useParams()` hook

---

## Common Tasks

### Adding a New Component

1. Create file in `src/components/ComponentName.jsx`
2. Follow component structure pattern above
3. Import and use in parent component or route

### Adding a Utility Function

1. Create file in `src/utils/functionName.jsx`
2. Export function as named export
3. Import where needed

### Adding a Custom Hook

1. Create file in `src/hooks/useHookName.jsx`
2. Export function as named export
3. Import where needed

### Adding Chart Constants

Chart configuration constants should be placed in `src/utils/charts.js`:

```js
export const formatCurrency = (value) => ...;
export const CHART_OPTIONS = { ... };
export const INCOME_COLOR = { ... };
export const createChartOptions = (lang, showLegend) => { ... };
export const createHorizontalChartOptions = (lang, labels, showLegend, labelWidth) => { ... };
```

The charts utility provides:

- `INCOME_COLOR`, `EXPENSES_COLOR`, `FINRESULT_COLOR` - color objects with `bg` and `border` properties
- `CHART_HEIGHT` - default chart height (360)
- `createChartOptions()` - creates options for vertical bar charts
- `createHorizontalChartOptions()` - creates options for horizontal bar charts with configurable label width
- `dashedBorderPlugin` - Chart.js plugin for dashed borders on financial result bars

### Adding Filtered Chart

For filtered pages (e.g., positive-result, negative-result), use the `FilteredChart` component:

```jsx
import FilteredChart from "./FilteredChart";

<FilteredChart
  tableData={companies}
  money={money}
  activeSort="financial-result"
  selectedYear="2025"
  selectedQuarter={0}
  filter="positive-result"
/>;
```

The component accepts:

- `tableData` - array of company objects
- `money` - array of financial records
- `activeSort` - which field to sort by (income, expenses, financial-result)
- `filter` - filter type (positive-result, negative-result, income, no-income, earned-more, spent-more)

### Generating Sitemap

The sitemap is generated dynamically at build time using `scripts/generate-sitemap.mjs`. It runs automatically before `vite build` and:

- Reads company data from the ODS file
- Generates routes for all static pages and company detail pages
- Outputs to `dist/sitemap.xml`

To customize the site URL, set the `VITE_SITE_URL` environment variable:

```bash
VITE_SITE_URL=https://example.com npm run build
```

Defaults to `https://pretprijatija.mk` if not set.
- `selectedYear` - selected year
- `selectedQuarter` - selected quarter (0 for all)
- `filter` - filter type (positive-result, negative-result, income, no-income, earned-more, spent-more)

### Adding a New Route

1. Import component in `main.jsx`
2. Add `<Route path="/path" element={<Component />} />` inside `<Routes>`

---

## Notes

- This is a client-side SPA with no backend
- Data is loaded from static ODS files in `./ods/` directory
- The app uses Macedonian language for UI text
- No TypeScript is used - plain JavaScript with JSX
- Memory cleanup in useEffect is required for navigation subscriptions
- Use `useData` hook for shared data fetching to avoid duplicate loading
- Use `CompanyWrapper` for scroll-to-top on company detail pages

### Macedonian Grammar

When displaying counts with singular/plural forms, use proper Macedonian grammar:

```jsx
// правилно: 1 претпријатие, 11 претпријатија
{
  count;
}
{
  count % 10 === 1 && count !== 11 ? "едно" : "многу";
}
```

### Performance Tips

- Use `useMemo` for expensive computations (filtering, sorting, aggregations)
- Use `useCallback` for event handlers passed to child components
- Pre-compute lookup maps instead of filtering inside loops (O(n\*m) → O(n))
- Extract constants outside components for module-level caching
