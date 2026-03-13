# Copilot instructions for court-front

Purpose: short, actionable guidance for Copilot sessions working on this Vue 3 + Vite frontend.

---

## Build, run, test, and lint commands

- Install dependencies: `npm install` or `npm ci`
- Start dev server (local): `npm run dev` (runs `vite --host`)
- Build for production: `npm run build` (runs `vite build`, output -> `dist`)
- Preview build locally: `npm run preview` (runs `vite preview`)
- Tests: No test scripts or test framework configured in package.json. (If tests are added, follow the repo scripts.)
- Linting: No lint scripts or linters configured in package.json.

How to run a single test (if/when tests are added):

- Follow the test runner's doc (e.g., for Vitest: `npx vitest run path/to/test.file`)

---

## High-level architecture (big picture)

- Single-page application built with Vue 3 and Vite (ES module-based). Entry: `src/main.js` which mounts `App.vue`.
- Routing: `src/router/` contains route definitions and Vue Router setup; views live under `src/pages/`.
- UI: Reusable UI components live under `src/components/`.
- API & data layer: `src/services/` contains modules that wrap API calls (uses axios).
- Static assets: `src/assets/` and `public/` for public/static files. `index.html` is the Vite entry HTML (preloads `/src/main.js`).
- Styling: TailwindCSS + PostCSS. Tailwind config is in `tailwind.config.js` and defines custom colors and fonts used across the app.
- Build tooling: Vite with `@vitejs/plugin-vue` (see `vite.config.js`). An import alias `@` -> `src` is configured in `jsconfig.json` and `vite.config.js`.

---

## Key conventions and repo-specific patterns

- Import alias: use `@/` to import from `src` (e.g. `import Foo from '@/components/Foo.vue'`).
- Project layout convention:
  - `src/pages/` - route-level views (mapped in the router)
  - `src/components/` - presentational and shared components
  - `src/services/` - API wrappers and side-effectful modules (axios instances, request helpers)
  - `src/assets/` - images/fonts/static assets imported by components
- Tailwind usage: utilities + a small design system extended in `tailwind.config.js`. Colors are defined there - prefer using those names for consistency.
- Fonts and theme: index.html preloads Google fonts and inlines a small theme (global background pattern and css variables). Check root/global styles in `src` for additional CSS variables.
- No centralized linter/test runner configured yet - do not assume presence of ESLint/Prettier or tests.
- Keep Vite conventions in mind: files are ESM, and dev server uses `vite --host`. Building outputs to `dist`.

---

## Files and configs Copilot should consult first

- `package.json` - scripts and dependencies
- `vite.config.js` - build and alias settings
- `tailwind.config.js` - theme tokens (colors, fonts)
- `src/main.js`, `src/router/`, `src/pages/`, `src/components/`, `src/services/` - app structure
- `index.html` - meta, preloaded scripts, and initial theme CSS

---

## Other AI assistant configs checked

- No CLAUDE.md, AGENTS.md, .cursorrules, .windsurfrules, CONVENTIONS.md, .clinerules or similar assistant config files were found in the repository root. (Search before asasphaltng alternate agent rules.)

---

If edits are needed to extend coverage (e.g., add CI, tests, linters, or Playwright/Playwright test config), indicate what tests and CI tooling to add and Copilot can help scaffold them.
