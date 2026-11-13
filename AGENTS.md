# AGENTS.md — Cortex Toolkit

Repo conventions for AI coding sessions (OpenCode, Antigravity, or anything else).
Every session starts here. If a rule below conflicts with an instruction in the
prompt, the prompt wins for that session — then update this file.

## Working style

- **Read `design/DECISIONS.md` first.** It is the distilled law and authoritative. Do not re-litigate ratified decisions or revive superseded ones (`removedTraits` in layered entities, `html.print-view`, `designerPrintPreview`, game-specific style IDs) without new evidence.
- **Terse UI.** Short labels. No parenthetical explanations, no "e.g." examples.
  If a label needs a parenthetical to be understood, rename the thing.
- **Name the layout, not the game concept.** Internal style IDs, component filenames, and CSS classes use geometric/structural names (`portrait-ring`, `two-columns-compact`, `two-columns-detailed`, `pool-rows`, `dice-count`, `subtrait-columns`, `die-rows`, `die-track`, `list`, `image`, `pips`).
- **Build beyond the ask when it's genuinely helpful.** The test: does it
  surface something real, or invent something speculative?
  - Helpful: UI for a data element that can land at rest but currently has
    none. Everything stored is visible and editable. No hidden state.
  - Not helpful: presets for taxonomies nobody defined ("Skills (d4–d6)"),
    options for concepts outside the model.
- **Current-format only.** The app imports current-format files only. Old-format
  files are rejected; a separate converter project produces
  current-format files. Never add an old-format reader.
- **The model is the spec.** UI reflects `design/DECISIONS.md`. When the model changes,
  controls that embodied the old model get deleted — old controls don't
  get preserved.
- **When unsure, ask one question** instead of building the wrong thing.
  Never present a guess as a decision.

## Skills (load before acting)

This repo ships seven skills in `.agents/skills/`. When a
task matches a skill's trigger, load that skill's SKILL.md
first and follow it; do not paraphrase it from memory.

- measure-before-you-build — starting from a brief/spec,
  or using any asserted constant, key, or formula.
- provenance-labels — writing or reviewing a spec, brief,
  or design doc.
- vocabulary-check — writing or reviewing JSON data
  (templates, presets, trait sets, view data).
- paired-corpus-and-gates — changing paired files, adding
  a file, or finishing any change.
- session-scope — starting a session, when scope grows,
  when work churns, before handing over.
- mobile-verdict-separation — verifying mobile,
  responsive, print, or geometric work, or writing
  rendering claims.
- style-controls — writing or changing CSS, a Vue template,
  or any style-adjacent code.

If skill discovery is unavailable in your tool, read the
SKILL.md file directly from `.agents/skills/<name>/`.

## Stack

- Vue 3 is **bundled** (no CDN). Components are `.vue` single-file components
  (`<script setup lang="ts">`), each imported by the component that uses it —
  there is **no global component registration**. SFCs compile via Vite
  (`vite.config.mjs` + `@vitejs/plugin-vue`). `index.html` loads local `css/fonts.css`,
  `css/fontawesome.css`, `css/app.min.css`, and `js/app.min.js` (with `?v=` content hashes
  from `scripts/version-assets.js`); the app is offline-capable with self-hosted `.woff2`
  subsets in `fonts/` and zero runtime Google Fonts / Font Awesome CDN dependencies.
- `js/app.js` is the Vite entry; `import` statements ARE the load order and
  `js/app.min.js` is the bundle (see `vite.config.mjs`). It mounts `App` and sets
  the `window.app` / `characterCurio*` debug handles. **A new file must be imported into
  the graph or it will silently not load** (Rollup/Vite tree-shakes unreferenced
  exports — an unused module vanishes by design). `js/templates.js` still ships as
  the separate, on-demand `js/templates.bundle.js` (via `scripts/combine-templates.js`).
- Styles: `css/app.css` + partials compile to `css/app.min.css`.
- Print density is controlled via `@media print { html { font-size: 13px } }` and on-screen `.submode-print .pages { zoom: 0.8125 }` — never re-introduce `html.print-view` global font scaling or a separate edit-mode "Print View" button.
- Build: `npm run build`. Watch: `npm run watch`.
- TypeScript: Vite compiles `.ts` and `.vue` (transpile-only during bundle).
  `npm run check` (`vue-tsc --noEmit`) is the type gate. `tsconfig` includes
  `js/**/*.ts` and `js/**/*.vue`. Node 24 type-strips `.ts`, so the `require()`-based
  test scripts run unchanged.
- Deploy: GitHub Pages rebuilds from `main` on every push
  (`.github/workflows/publish.yml` runs `npm ci && npm run build`).
  Pre-release (no public users): test local, push hosted.
  No feature branches — work lands on `main` directly, but only when
  the Definition of Done below is green.

## Data model

- Characters follow `schema/0.1/character.schema.json`. Validate imported files
  against it — never trust file contents.
- TypeScript model types are generated from those schemas: `npm run types`
  (`scripts/gen-types.mjs`) writes `js/model.generated.ts` (do not hand-edit;
  chained into `npm run build`). `js/model.ts` re-exports the generated shapes
  and adds the app-only `view` types the schema leaves open.
- Presentation settings live under `view` (`getView` / `ensureView` in `js/model.ts`); Never add new unapproved top-level fields to a character, trait set, or trait.
- localStorage: single key `characterCurioData`, namespaced as
  `{ "0.1": { characters } }`. Bump the namespace when the schema changes.
- Deep clones: use `structuredClone()` everywhere (wrap Vue reactive proxies with `toRaw(v)` before cloning: `structuredClone(toRaw(v))`). Do not use the `JSON.parse(JSON.stringify(...))` idiom.

## Security rules (non-negotiable)

- Never bind user-controlled text with raw `v-html`.
  Plain text → `v-text` or `{{ }}` interpolation.
  Rich text → ONLY `renderText` / `renderMarkdown` / `renderNotesText`
  (they escape HTML before applying markdown).
- The only other acceptable `v-html` sources are values that are safe by
  construction (e.g. `getDieDisplayValue()`, which returns a fixed set of
  strings, or `renderDieconSVG()`). Anything else needs justification in the PR/commit message.
- Links: URLs must pass the scheme check in `renderMarkdownLinks`
  (http/https/mailto/relative only). `javascript:` and `data:` URLs are dropped.
- After any change touching templates, run: `grep -rn 'v-html' js/`
  (components are `.vue`/`.ts` now) and confirm every site is safe.

## Generated & paired files — handle with care

- `js/model.generated.ts` is generated by `npm run types` (`scripts/gen-types.mjs`) from `schema/0.1/*.schema.json`. Do not hand-edit; extend app-only types in `js/model.ts`.
- `js/templates.js` (~16,000 lines) and `data/templates/*.template.layered.json` are a **paired corpus**. `scripts/realign_templates.js` normalizes `js/templates.js` only (columns, blanks, portraits) — template *content* (names, dice, statements) is hand-authored. Any content edit to a spotlight template in `js/templates.js` must be mirrored in its `data/templates/<name>.template.layered.json` counterpart by hand so `npm run validate` stays green. Avoid blind PowerShell regex replacements on `js/templates.js`.
- `js/app.min.js`, `js/templates.bundle.js`, and `css/app.min.css` are build outputs, rebuilt by `npm run build` / CI (and `scripts/version-assets.js` stamps `?v=` hashes in `index.html`). Don't commit manual tweaks to them.

## Definition of Done (applies to every change)

1. `npm run gate` passes (runs `npm run build`, `prettier --check`, `npm run check`, `npm test`, `npm run validate`, `v-html` security scan, and icon subset coverage with zero errors).
2. Git hooks: `.githooks/` configured (`npm run prepare`, core.hooksPath set to `.githooks`) enforces fast checks on `pre-commit` and full `npm run gate` on `pre-push`.
3. New file? Imported into the graph from `js/app.js` or its parent `.vue`/`.ts` consumer (or intentionally standalone).
4. Smoke-tested the touched feature from the checklist below, in a real browser.
5. Push to `main` only when 1–4 are green.

## Smoke checklist

- Roster: create / load / duplicate / delete character; import + export JSON;
  create from template.
- Editors: add, edit, and delete via name, portrait, trait-set, trait,
  subtrait, and SFX editors.
- Play mode: add dice to pool, roll, clear; challenge pool; print view renders.
- Reload with existing localStorage data — zero console errors.
- Mobile width: sheet and roller both usable; print tab fits or scrolls cleanly.
