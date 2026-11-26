# AGENTS.md - Developer Guidelines for This Project

## Project Overview

This is a React 19 + Vite application that displays a registry of Macedonian public enterprises with financial data. The app fetches a JSON payload that is generated at build time from the source ODS/Excel file, and displays company information, financials, and search/filter capabilities.

## Tech Stack

- **Framework**: React 19 with React Compiler
- **Build Tool**: Vite 8
- **Styling**: Bootstrap 5 + SCSS (Dart Sass)
- **Routing**: React Router DOM 7
- **Data Processing**: xlsx (build scripts only, never shipped to the browser)
- **Charts**: Chart.js with explicit module registration (`src/utils/chartSetup.js`)
- **Linting**: ESLint 10 with react-hooks and react-refresh plugins

---

## Build / Lint / Test Commands

### Development

```bash
npm run dev          # Generate data, then start Vite dev server with HMR
npm run data         # Regenerate public/data/registar.json from the ODS file
```

`public/data/` is generated and gitignored, so run `npm run data` after changing the ODS file. `npm run dev` and `npm run build` do it automatically.

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
- **Static assets**: `public/img/` (hero images), `public/fonts/` (self-hosted fonts); both are referenced with absolute URLs from the HTML/SCSS
- **Build scripts**: `scripts/` (data, sitemap, static pages)

### Naming Conventions

- **Components**: PascalCase (e.g., `Company.jsx`, `Cards.jsx`)
- **Utility functions**: camelCase (e.g., `decimalNumbers.jsx`, `charts.js`)
- **CSS/SCSS files**: Match component name (e.g., `Company.scss`)
- **Constants**: PascalCase for exported constants (e.g., `AvailableYears`)

### Component Structure

```jsx
// 1. React imports
import { useState, useEffect, useMemo, useCallback } from "react";

// 2. Third-party library imports (grouped)
import { useParams } from "react-router-dom";

// 3. Local imports (grouped) - relative paths
import Icon from "./Icon";
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
3. Local imports (hooks, components, then utils - sorted alphabetically within group)

### CSS / Styling

- Use Bootstrap 5 classes for layout and styling
- Use SCSS for custom styles in `src/assets/scss/`
- Follow Bootstrap naming for custom CSS classes
- Use Bootstrap's utility classes for quick styling

#### Sass deprecation warnings

Bootstrap 5.3.x is still `@import`-based and calls legacy Sass globals, so compiling
`src/assets/scss/style.scss` emits ~300 deprecation warnings that cannot be fixed
from this repository (309 of 314 came from Bootstrap's own `_functions.scss`).
`vite.config.js` silences exactly four ids (`import`, `global-builtin`,
`if-function`, `color-functions`) and nothing else. Because silencing is global,
those four will not warn for our own files either, so the rule below matters:
always reach for the module functions by hand. Any *other* deprecation id still
surfaces.

- Write new SCSS with the module system: `@use "sass:color"` + `color.mix(...)`,
  `@use "sass:string"` + `string.quote(...)`. `_variables.scss` and
  `_variables-dark.scss` already do this.
- The two variable files are copies of Bootstrap's `_variables*.scss`; keep the
  module calls when you re-sync them from a new Bootstrap release.
- Drop the `silenceDeprecations` list when Bootstrap 6 (which uses `@use`) lands.
- Verification trick: if a Sass refactor only replaces deprecated globals with
  their module equivalents, the built CSS keeps the same content hash
  (`dist/assets/index-*.css` filename must not change).

### Constants and Configuration

- Hardcoded values (like dropdown options) are defined in `src/utils/` files
- Environment variables: Use `import.meta.env.VITE_*` for Vite env vars
- Create `.env` files for local development (not committed to git)
- Avoid inline transformations of constants (e.g., `cleanName(transliterate(...))`) - pre-process at definition
- For language-aware path manipulation, use `getPathWithLang` from `src/i18n/index.js`

### ESLint Configuration

The project uses ESLint with these rules:

- Extends: `js.configs.recommended`, `reactHooks.configs.flat.recommended`, `reactRefresh.configs.vite`
- Custom rule: `no-unused-vars` with pattern `^[A-Z_]` for allowed unused constants

### React Router Patterns

- Define routes in `main.jsx` using `Routes` and `Route`
- Language-prefixed routes live under `/:lang` with the `LangLayout` guard; unsupported language prefixes render `NotFound` instead of a page
- Other path params are `/:lang/filtered/:filter` and `/:lang/company/:company`
- Access params with `useParams()`
- Keep a `path="*"` catch-all route for unknown paths; `NotFound` also adds a client-side `noindex` when the path is not a valid language route

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

### URL Parameters and Currency

URL parameters are handled consistently using the `useUrlParams` hook from `src/hooks/useUrlParams.js`:

```js
const quarters = [0, 1, 2, 3, 4];

const { selectedYear, selectedQuarter, selectedCurrency } = useUrlParams(
  availableYears,
  quarters,
);
```

The `availableQuarters` argument accepts either an array (shown above) or a function `(selectedYear) => quarters[]`. Use the function form when quarters depend on the selected year's sheet (e.g., derived from `allMoney[selectedYear]`) so the Квартал dropdown and quarter validation always reflect the currently selected year:

```js
const getQuarters = useCallback(
  (year) => [
    ...new Set([
      0,
      ...(allMoney[year] || []).map((item) => item[MONEY_SHEET_COLUMNS.QUARTER]),
    ]),
  ],
  [allMoney],
);

const { selectedYear, selectedQuarter, selectedCurrency } = useUrlParams(
  availableYears,
  getQuarters,
);
```

The hook returns:

- `selectedYear` - validated year from URL or default
- `selectedQuarter` - validated quarter from URL or 0
- `selectedCurrency` - validated currency (MKD, EUR, USD, GBP) or default MKD
- `quarters` - the resolved quarters list used for validation (useful for rendering dropdown options)

All components that need URL params should use this hook for consistency.

#### Currency Feature

The currency conversion feature allows displaying financial data in different currencies:

- Exchange rates are stored in `src/utils/currencies.js`
- Currency is passed via URL parameter: `?currency=EUR`
- Default currency is MKD (not included in URL)
- `parseCurrencyParam()` validates currency against allowed list
- Chart values are converted before rendering, chart options format with correct suffix

### Comparison Page

- `YearComparison.jsx` reads `base`/`compare` from the URL through `useComparisonParams` and builds totals in `buildYearComparison`.
- The base/comparison year selects and currency switcher live in the shared `Navbar` via `showComparisonFilters`; leaving the page keeps only the currency.
- Renamed companies are merged through `src/utils/companyAliases.js`. When the ODS introduces a new rename, add an entry there so the comparison does not show one company closing and another opening.
- Companies present in only one of the compared years are kept, labeled “Only in {year}”, and sorted below comparable rows. Their financial values still count toward the year totals.

### Adding Chart Constants

Chart configuration constants should be placed in `src/utils/charts.js`:

```js
export const formatCurrency = (value) => ...;
export const CHART_OPTIONS = { ... };
export const INCOME_COLOR = { ... };
export const createChartOptions = (lang, showLegend, currency) => { ... };
export const createHorizontalChartOptions = (lang, labels, showLegend, labelWidth, currency) => { ... };
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
/>
```

The component accepts:

- `tableData` - array of company objects
- `money` - array of financial records
- `activeSort` - which field to sort by (income, expenses, financial-result)
- `filter` - filter type (positive-result, negative-result, income, no-income, earned-more, spent-more)

### OverviewChart Component

For the overview page, use the `OverviewChart` component:

```jsx
import OverviewChart from "./OverviewChart";

<OverviewChart
  chartData={chartData}
  selectedYear={selectedYear}
  selectedQuarter={selectedQuarter}
/>
```

The component accepts:

- `chartData` - Chart.js data object with labels and datasets
- `selectedYear` - currently selected year
- `selectedQuarter` - currently selected quarter (0 = all quarters)

### Charts

Charts are created with `Chart` imported from `src/utils/chartSetup.js`, **not** `chart.js/auto`:

```jsx
import Chart from "../utils/chartSetup";
```

`chartSetup.js` registers only the controllers/elements the app renders (bar + line, category/linear scales, tooltip, legend). `chart.js/auto` registers every chart type and roughly doubles the chart bundle. If a new chart type or plugin (e.g. `Filler`, `Title`, `RadialLinearScale`) is introduced, register it there.

Routes that render charts are lazy-loaded in `main.jsx`, so Chart.js is not part of the initial entry bundle.

### Icons

Icons are inline SVG, not an icon font. Use the `Icon` component:

```jsx
import Icon from "./Icon";

<Icon name="arrow-right" className="fs-3" />
```

- `name` is the Bootstrap Icons name **without** the `bi-` prefix (`arrow-down`, `box-arrow-up-right`, `twitter-x`, ...)
- `className` is merged with `bi-icon`, which sets `1em` sizing and `currentColor` fill, so Bootstrap text color and font-size utilities apply as usual
- Icons are decorative: the SVG is rendered with `aria-hidden="true"`. Pair it with a `visually-hidden` label or a `title` attribute when the icon carries meaning
- Only the icons listed in `src/components/Icon.jsx` exist. To add one, copy its `<path>` markup from `node_modules/bootstrap-icons/icons/<name>.svg` into the `ICONS` map (if the package is installed) or from [icons.getbootstrap.com](https://icons.getbootstrap.com)

### Fonts and Hero Images

- Noto Sans (variable, upright, weights 300–800) is self-hosted from `public/fonts/` as three `woff2` subsets: `cyrillic`, `latin`, `latin-ext`. Declarations live in `src/assets/scss/_fonts.scss` with `unicode-range`, so a browser only downloads the subsets a page actually needs
- `index.html` preloads the cyrillic subset; the others are discovered from the CSS
- The hero/footer background images live in `public/img/` (`hero-mobile.webp` for < 992px, `hero-desktop.webp` for wider viewports) and are preloaded with media-scoped `<link rel="preload" as="image">` tags. They are referenced with absolute URLs (`/img/...`) from `_custom.scss`, so the URLs are stable and can be preloaded
- The full-resolution source image is `src/assets/img/macedonian-denars.webp`; it is not shipped. Regenerate the derivatives with `cwebp`, e.g. `cwebp -q 55 -resize 900 0 src/assets/img/macedonian-denars.webp -o public/img/hero-mobile.webp`
- Keep both preload tags in sync with the SCSS media query if a breakpoint changes
- Do not reintroduce a Google Fonts `<link>`: it is render-blocking and needs two extra connections

### Loading State

`Loading.jsx` renders a lightweight skeleton instead of a spinner and reserves a full viewport of height (`.loading-skeleton` in `_custom.scss`). This keeps the footer below the fold while data loads, which is what prevents a large layout shift when content is swapped in. Don't remove the `min-height` without re-checking CLS.

### Data Pipeline

The ODS file in `public/ods/` is the source of truth, but it is **not** fetched by the browser:

1. `scripts/generate-data.js` parses the ODS with `xlsx` and writes `public/data/registar.json` (`{ companies, years, moneyByYear }`)
2. `npm run dev` and `npm run build` run it automatically (`npm run data` to run it alone)
3. `src/hooks/useData.jsx` fetches `data/registar.json` once and shares the promise between components
4. The request is versioned with the ODS date (`?v=...`) so a new deployment does not keep serving routinely cached old JSON

The generated file is gitignored. `xlsx` is a devDependency: if you need workbook access at runtime, don't — extend the generator instead.

GitHub Pages caches HTML and JSON for up to 10 minutes. Because lazy chunks are content-hashed, an open tab can reference chunks removed by a new deployment. `main.jsx` listens for Vite's `vite:preloadError` and reloads once (with a 10-second loop guard) so the tab picks up the current HTML and chunks.

### Generating Sitemap and Static Pages

The sitemap and per-route static HTML shells are generated dynamically at build time. The build chain is:

```bash
npm run data && node scripts/generate-sitemap.js && vite build && node scripts/generate-pages.js && node scripts/generate-404.js
```

- `scripts/generate-sitemap.js` reads company data from the ODS file and writes `public/sitemap.xml` (Vite copies it to `dist/`). It includes all static/company routes, a `lastmod` from the ODS `dc:date`, and `xhtml:link` alternates for `mk`, `en`, and `x-default`.
- `scripts/generate-pages.js` reads the built `dist/index.html` and writes a shell to `dist/<path>/index.html` for every route, plus the root `dist/index.html` canonicalized to `/mk/`. Each shell gets the correct `<html lang>`, title, description, canonical, `hreflang`, `og:locale`, OG/Twitter tags, JSON-LD, and a `<noscript>` fallback. Company shells include the company description, official website and latest financials; registry shells list all company links.
- `scripts/generate-404.js` reads the root shell, removes the canonical/hreflang tags, adds `noindex`, and writes `dist/404.html` with a not-found fallback (GitHub Pages serves this for unknown paths).
- `src/components/NotFound.jsx` is the client-side counterpart for unknown routes and unsupported language prefixes.

To customize the site URL, set the `VITE_SITE_URL` environment variable:

```bash
VITE_SITE_URL=https://example.com npm run build
```

Defaults to `https://pretprijatija.gocemitevski.com` if not set.

### SEO and Generated HTML

- Keep exactly one `<h1>` per page. The site header brand is a `<p>`, page titles use `<h1>`, and cards/sections use `<h2>`/`<h3>`. Registry and filtered pages use a visually hidden `<h1>`.
- Generated pages set `lang`, `hreflang`, and `og:locale`; the client updates them on SPA navigation in `src/hooks/usePageTitle.jsx`.
- Filtered/list views keep query parameters such as `year` and `currency`, but canonical URLs omit them.
- Public URLs use a trailing slash (`/mk/`, `/mk/registry/`, `/mk/company/<slug>/`). GitHub Pages serves directory indexes only in that form and 301s `/mk` → `/mk/`, so canonical tags, `hreflang`, sitemap entries, `Link` targets and `navigate()` calls must all keep the slash. `getPathWithLang` enforces this for generated paths.
- The root `/` canonicalizes to `/mk/` and redirects client-side to `/mk/`. Unknown paths are `noindex`; the generated `404.html` has no canonical/hreflang, and the client-side `NotFound` adds `noindex`.
- When adding a route, update `scripts/generate-pages.js` and `scripts/generate-sitemap.js` so the static shell and sitemap stay in sync.

### Adding a New Route

1. Import the component in `main.jsx`
2. Add a nested route under `/:lang` (or a top-level route if it is not language-specific); keep the `path="*"` catch-all last
3. Add route-specific title/description handling in `src/hooks/usePageTitle.jsx`
4. Add the route to `scripts/generate-pages.js` and `scripts/generate-sitemap.js`
5. Keep one `<h1>` per page and make sure the page works under both `/mk` and `/en`

### Analytics (Matomo)

Analytics uses self-hosted, cookieless Matomo — no cookies or consent banner. Logic lives in `src/utils/matomo.js`:

- `initMatomo()` - queued once from `main.jsx`; pushes `disableCookies`, tracker URL/site ID, and `enableLinkTracking`, then injects `matomo.js` async
- `trackPageView({ path, title, isUrlNormalization })` - SPA page view; consecutive duplicates are dropped. Normalisation navigations (e.g. `/mk` → `/mk?year=2026`) are suppressed so the same page isn't double-counted
- `getCurrentPath()` - returns `pathname + search`

Page views are **not** sent on route change. They are sent on the `TITLE_UPDATE_EVENT` dispatched by `updateDocumentMeta`, because company pages only resolve their title after their data loads. When adding a page that sets its own title outside `usePageTitle`, call `updateDocumentMeta` so the page view is reported.

Tracker URL and site ID default to the production values and can be overridden with `VITE_APP_MATOMO_URL` / `VITE_APP_MATOMO_SITE_ID`.

#### Normalisation suppression

List pages (`/mk`, `/mk/registry`) fill in default query params once their data loads, using a replace navigation that only adds defaults to the URL. Those navigations pass `state: URL_NORMALIZATION_STATE` (from `src/utils/url.js`), and `updateDocumentMeta` forwards `location.state.urlNormalization` to the tracker, which skips the view when it is still the same page. Use the same marker if you add another URL normalisation; do **not** infer it from `replace` alone, since user actions such as the company year selector also replace and must still be counted.

Two related rules live in the title update:

- The transient `/` render is skipped in `usePageTitle`; the redirect target (`/mk`) is what gets tracked.
- Unknown company slugs now dispatch a page view with the `company.notFound` title from `Company.jsx`, so stale links are not invisible in analytics.

---

## Notes

- This is a client-side SPA with no backend
- Data is fetched from `data/registar.json`, generated at build time from the ODS file in `public/ods/`
- The UI is bilingual (Macedonian and English) through i18next; keep both `mk` and `en` resources in sync
- No TypeScript is used - plain JavaScript with JSX
- Memory cleanup in useEffect is required for navigation subscriptions
- Use `useData` hook for shared data fetching to avoid duplicate loading
- Use `CompanyWrapper` for scroll-to-top on company detail pages
- Use semantic HTML elements: `<main>` for page content, `<article>` for cards, `<aside>` for sidebar/totals, `<nav>` for navigation

### Macedonian Grammar

When displaying counts with singular/plural forms, use proper Macedonian grammar:

```jsx
// правилно: 1 претпријатие, 11 претпријатија
{
  count % 10 === 1 && count !== 11 ? "претпријатие" : "претпријатија";
}
```

### Performance Tips

- Use `useMemo` for expensive computations (filtering, sorting, aggregations)
- Use `useCallback` for event handlers passed to child components
- Pre-compute lookup maps instead of filtering inside loops (O(n\*m) → O(n))
- Extract constants outside components for module-level caching
