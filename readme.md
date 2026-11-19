# Character Curio

Character Curio is a browser-based Cortex Prime character sheet builder, multi-pool dice roller, and connected curiosity workspace built with Vue 3, TypeScript, and Vite.

Live app: https://characters.lynnjones.rocks/

## Features

- **Sheet Studio (Create & Edit):** Build character sheets with nested CSS-grid placement (`view.place`), trait-part layouts (`view.parts`), portrait rings & arcs, stepped die tracks, pip tracks, SFX groups, custom palettes/fonts, and dice styles.
- **Play Mode & Multi-Pool Dice Roller:** Stage dice directly from traits across open Curiosities into named owner pools, track per-owner Plot Points, step/hitch dice, run multi-way contests, and search/stage rapidly via the Command Palette (`Ctrl+K` / `/`).
- **Connected Curiosity Graph:** Link characters, locations, factions, and assets via `trait.ref`, `traitSet.ref`, and `[[wikilinks]]`, navigate trails and backlinks in `CuriosityWebBar`, and pop curiosities out or pull them in.
- **Template Library & Local Persistence:** Create sheets from bundled templates, save and manage custom sheet templates and set presets, export/import current-format `.curio.json` files and full bundles, and persist state locally in IndexedDB (with a `localStorage` fallback).
- **Offline-Ready PWA & Printable:** Self-hosted `.woff2` fonts, Font Awesome icon subsets, Web App Manifest, auto-versioned offline service worker, and WYSIWYG Print tab with `@media print` styling.

## Development

Requires Node.js >= 24.

```bash
npm install
npm run dev        # Vite dev server
npm run build      # Self-hosted font check, generated model types, Vite bundle, template chunk, asset versioning
npm run check      # vue-tsc --noEmit
npm test           # Vitest unit/component specs + 8 Node logic suites
npm run validate   # Schema and template corpus validation
npm run gate       # Full 8-step gate (build, Prettier check, types, tests, validate, v-html scan, icon subset, CSS/budgets)
npm run smoke      # Playwright headless browser smoke check
```

## Project Layout

- `js/` — Vue 3 SFCs (`*.vue`) and TypeScript modules (`*.ts`), with `js/app.js` as the Vite entry.
- `css/` — Stylesheets compiled into `css/app.min.css`.
- `schema/0.2/` — JSON Schemas (`curiosity.schema.json`, `sheet-template.schema.json`).
- `data/templates/` — Bundled character and template corpus (`*.curio.json`, `*.template.layered.json`).
- `scripts/` — Build, validation, Node test suites, and Playwright smoke runner.
- `tests/` — Vitest component and geometry test suites.
