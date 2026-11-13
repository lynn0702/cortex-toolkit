---
name: paired-corpus-and-gates
description: >-
  Keep paired templates, generated model types, font/icon subsets, Vite module imports, and built outputs synchronized, and enforce the 7-step Definition of Done before handoff. Use when editing paired files, schemas, templates, icons, or finishing any change.
---

# Paired Corpus and Gates

Whenever you modify one half of a paired corpus, schema, asset manifest, or component graph, update its counterpart in the same change and finish with the full Definition of Done gate.

## Paired files, generated outputs, and build wiring

1. **Templates corpus (`npm run validate`)**
   - Paired files: `js/templates.js` ↔ `data/templates/*.template.layered.json` (+ `data/templates/Dreamer_Architect.curio.json`).
   - Built bundle: `js/templates.bundle.js` (generated via `scripts/combine-templates.js`).
   - Mirror hand-authored template content across `js/templates.js` and its `.template.layered.json` file; `scripts/realign_templates.js` normalizes formatting/columns in `js/templates.js` only.

2. **Schemas and TypeScript model (`npm run types`)**
   - Source: `schema/0.1/*.schema.json` → Generated: `js/model.generated.ts` (never hand-edit generated types).
   - App-only `view` types and runtime helpers live in `js/model.ts`.

3. **Icons, fonts, and cache-busted HTML**
   - `fa-*` icon classes used in `js/*.vue` / `js/*.ts` ↔ `scripts/generate-fa-subset.py` (`css/fontawesome.css` + `fonts/fa-*.woff2`).
   - Self-hosted fonts: `css/fonts.css` + `fonts/*.woff2` (managed via `scripts/fetch-fonts.mjs`).
   - Built outputs: `js/app.min.js`, `js/templates.bundle.js`, `css/app.min.css`, and `?v=` query hashes stamped into `index.html` by `scripts/version-assets.js`. Never hand-edit compiled bundles.

4. **Vite module graph**
   - `js/app.js` is the Vite entry point. Components are `.vue` SFCs imported explicitly by their consumers (no global registration). Any new `.ts` or `.vue` file must be imported into the Vite module graph or Rollup/Vite will tree-shake it away silently.

5. **`v-html` security rule**
   - Never bind user-controlled text with raw `v-html`. Only vetted sanitizers and fixed-SVG/token renderers are permitted by Gate Step 6:
     `renderText`, `renderMarkdown`, `renderNotesText`, `renderNameHtml`, `getDieDisplayValue`, `renderDieValueForPrint`, `renderDieValue`, `renderDate`, `renderDicePreview`, `singleDieSVG`, `bundleDiceSVG`, `renderDieconSVG`.

## Definition of Done (`npm run gate`)

Run `npm run gate` (`node scripts/gate.js`) after your very last edit. It enforces all **7** gates in sequence:

1. Production Build (`vite` + `combine-templates` + `gen-types` + `version-assets`)
2. Code Style (`prettier`)
3. Type Check (`vue-tsc`)
4. Test Suites (`vitest` + Node suites)
5. Schema & Corpus Validation (`scripts/validate.js`)
6. Security Audit (`v-html` scan)
7. Icon Subset Coverage (`fa-*` check)

Confirm all **seven** `[PASS]` lines and `ALL GATES PASSED` in tool output before handing work over.

## Browser smoke for UI & rendering changes

When touching templates, CSS, layout, routing, roller, or print views, also run:
- `npm run smoke` (`node scripts/smoke.cjs`) to verify desktop (`1440×900`) and mobile (`390×844`) boot, navigation, roller, print, and roster flows with zero console/page errors or remote font requests.
- Add `--shots` (`node scripts/smoke.cjs --shots`) whenever visual or geometric changes need screenshot inspection.
