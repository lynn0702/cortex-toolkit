# Character Curio

Character Curio is a browser-based character sheet builder and solo dice roller built with Vue 3, TypeScript, and Vite.

## Features

- **Sheet Studio (Create & Edit):** Build character sheets with nested CSS-grid placement (`view.place`), trait-part layouts (`view.parts`), portrait rings, stepped die tracks, pip tracks, SFX groups, and custom CSS themes.
- **Play Mode & Dice Roller:** Stage dice directly from traits into Player or Opposition pools, step/hitch dice, track Plot Points at roll time, manage Crisis/Challenge pools, and search/stage rapidly via the Quick-Palette (`Ctrl+K` / `/`).
- **Template Library & Local Persistence:** Create sheets from bundled templates, save and manage custom sheet templates, export/import current-format `.curio.json` files, and persist state locally in IndexedDB (with a full-record `localStorage` fallback).
- **Offline-Ready & Printable:** Self-hosted `.woff2` fonts and Font Awesome icon subsets with a WYSIWYG Print tab and `@media print` styling.

## Development

Requires Node.js >= 24.

```bash
npm install
npm run dev        # Vite dev server
npm run build      # Prettier format, generated model types, Vite bundle, template chunk, asset versioning
npm run check      # vue-tsc --noEmit
npm test           # Vitest unit/component specs + 8 Node logic suites
npm run validate   # Schema and template corpus validation
npm run gate       # Full verification gate (build, style, types, tests, validate, v-html scan, icon subset)
npm run smoke      # Playwright headless browser smoke check
```

## Project Layout

- `js/` — Vue 3 SFCs (`*.vue`) and TypeScript modules (`*.ts`), with `js/app.js` as the Vite entry.
- `css/` — Stylesheets compiled into `css/app.min.css`.
- `schema/0.1/` — JSON Schemas (`character.schema.json`, `sheet-template.schema.json`).
- `data/templates/` — Bundled character and template corpus (`*.curio.json`, `*.template.layered.json`).
- `scripts/` — Build, validation, Node test suites, and Playwright smoke runner.
- `tests/` — Vitest component and geometry test suites.
