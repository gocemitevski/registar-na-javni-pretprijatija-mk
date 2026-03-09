# Project Skill Set

This document outlines the core skills and best practices required to work on the **Registar na javni pretprijatija MK** React application.

## 🛠 Core Technical Stack

- **Framework:** React 19 (React Compiler) with Vite 7
- **Build Tool:** Vite 7 – fast HMR, ES‑module based build
- **Styling:** Bootstrap 5 + SCSS
- **Routing:** react‑router‑dom 7
- **Data Processing:** `xlsx` library for reading Excel/ODS files on the client
- **State & Data Flow:** Local component state, custom hook (`useData`) – no external state manager
- **Testing / Linting:** ESLint 9 (React Hooks + React Refresh plugins)
- **Utilities:** Small helper modules for decimal formatting, transliteration, file reading, and chart constants.

## 📐 Architectural Principles

- **Component‑first**: Each UI piece lives in its own component file (`src/components`).
- **Hooks for logic**: Shared data fetching is encapsulated in `useData.jsx`.
- **URL‑driven state**: Filter parameters (year, quarter, sorting, order) are stored in the URL, not localStorage. This ensures consistent behavior across page navigation.
- **Server‑side rendering not used** – the app is purely client‑side; data is loaded from static ODS files bundled with the build.
- **Performance focus**: Use `React.memo`, `useMemo`, and `useCallback` where re‑renders are expensive (e.g., list rendering, chart calculations).
- **Accessibility**: Components use semantic HTML and Bootstrap utility classes; ARIA attributes added where necessary.

## 🚀 Common Workflows

### Component Creation

1. Create a new `.jsx` file in `src/components/`.
2. Export the component as default.
3. Import styles via SCSS or Bootstrap classes.
4. If the component needs data, consume it from `useData` or pass props.
5. Wrap heavy rendering logic with `React.memo` if needed.

### Data Fetching & Processing

- The ODS file is loaded once in `useData.jsx`. Subsequent components read from the cached state.
- Use `xlsx.read` to parse and convert sheets into plain JavaScript objects.
- All numeric values are formatted using `decimalNumbers.jsx` (use `formatDecimalNumber` for parsing, `parseDecimalNumber` for display).

### Filter & Sorting

- Filter definitions are centralized in `src/utils/filterDefinitions.jsx`.
- URL parameters: `:year`, `:quarter`, `:sorting`, `:order`.
- Default values are computed at module level using constants (e.g., `DEFAULT_SORTING`, `DEFAULT_ORDER`).
- Sorting/ordering logic should handle the default case specially (no sorting applied when both sorting and order are at defaults).

### Chart Rendering

- Chart configuration constants live in `src/utils/charts.js`.
- Components import these constants and pass data directly to chart libraries (e.g., Chart.js).

## ⚠️ Constraints & Best Practices

- **No class components** – only functional components with hooks.
- **Avoid prop drilling** – use context or custom hooks for shared state.
- **Keep side‑effects minimal** – `useEffect` is used only for data fetching; cleanup functions are provided when necessary.
- **Linting rules**: Follow ESLint config in `eslint.config.js`; no unused variables unless prefixed with `_`.
- **Testing**: Although not yet configured, future tests should use Vitest + React Testing Library.

---

_Skill set last updated: March 2026_
