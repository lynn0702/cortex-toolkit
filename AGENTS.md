# AGENTS.md — Cortex Toolkit

Repo conventions for AI coding sessions (OpenCode, Antigravity, or anything else).
Every session starts here. If a rule below conflicts with an instruction in the
prompt, the prompt wins for that session — then update this file.

## Working style

- **Terse UI.** Short labels. No parenthetical explanations, no "e.g." examples.
  If a label needs a parenthetical to be understood, rename the thing.
- **Build beyond the ask when it's genuinely helpful.** The test: does it
  surface something real, or invent something speculative?
  - Helpful: UI for a data element that can land at rest but currently has
    none. Everything stored is visible and editable. No hidden state.
  - Not helpful: presets for taxonomies nobody defined ("Skills (d4–d6)"),
    options for concepts outside the model.
- **One migration path.** A user of the original fork — or Kaelri's original
  app — brings their files and they work. Never break import of old-format
  data. New work carries old data forward; it doesn't strand it.
- **The model is the spec.** UI reflects `design/cortex-toolkit-trait-layers.md`
  and `design/cortex-toolkit-trait-usage.md`. When the model changes, controls
  that embodied the old model get deleted — the data migrates, the legacy
  controls don't get preserved.
- **When unsure, ask one question** instead of building the wrong thing.
  Never present a guess as a decision.

## Stack

- Vue 3 is loaded from a CDN as a global (`Vue`). Components are `.vue`
  single-file components (`<script setup lang="ts">`), each imported by the
  component that uses it — there is **no global component registration**. SFCs
  compile via `mix.vue({ version: 3 })`; an `externals: { vue: 'Vue' }` entry maps
  the `vue` import to the CDN global, so Vue is never bundled. `mix.vue()` also
  aliases `vue$` to the ESM bundler build — the externals entry is what keeps Vue
  out.
- `js/app.js` is the webpack entry; `import` statements ARE the load order and
  `js/app.min.js` is the bundle (see `webpack.mix.js`). It mounts `App` and sets
  the `window.app` / `cortex*` debug handles. **A new file must be imported into
  the graph or it will silently not load** (webpack tree-shakes unreferenced
  exports — an unused module vanishes by design). `js/templates.js` still ships as
  the separate, on-demand `js/templates.bundle.js`.
- Styles: `css/app.scss` + partials compile to `css/app.min.css`.
- Build: `npm run build`. Watch: `npm run watch`.
- TypeScript: the build compiles `.ts` and `.vue` (`mix.ts` + ts-loader
  `transpileOnly`, vue-loader). `npm run check` (`vue-tsc --noEmit`) is the type
  gate — ts-loader does not type-check. `tsconfig` includes `js/**/*.ts` and
  `js/**/*.vue`. Node 24 type-strips `.ts`, so the `require()`-based test scripts
  run unchanged.
- Deploy: GitHub Pages rebuilds from `main` on every push
  (`.github/workflows/publish.yml` runs `npm ci && npm run build`).
  Pre-release (no public users, 2026-10-11): test local, push hosted.
  No feature branches — work lands on `main` directly, but only when
  the Definition of Done below is green.

## Data model

- Characters follow `schema/0.1/character.schema.json`. Validate imported files
  against it — never trust file contents.
- TypeScript model types are generated from those schemas: `npm run types`
  (`scripts/gen-types.mjs`) writes `js/model.generated.ts` (do not hand-edit;
  chained into `npm run build`). `js/model.ts` re-exports the generated shapes
  and adds the app-only `custom.cortexToolkit` types the schema leaves open.
- App-only settings live under `custom.cortexToolkit`. Never add new
  top-level fields to a character, trait set, or trait.
- localStorage: single key `cortexToolkitData`, namespaced as
  `{ "0.1": { characters } }`. Bump the namespace when the schema changes.
- Deep clones: use `structuredClone()` everywhere. Do not use the
  `JSON.parse(JSON.stringify(...))` idiom.

## Security rules (non-negotiable)

- Never bind user-controlled text with raw `v-html`.
  Plain text → `v-text` or `{{ }}` interpolation.
  Rich text → ONLY `renderText` / `renderMarkdown` / `renderNotesText`
  (they escape HTML before applying markdown).
- The only other acceptable `v-html` sources are values that are safe by
  construction (e.g. `getDieDisplayValue()`, which returns a fixed set of
  strings). Anything else needs justification in the PR/commit message.
- Links: URLs must pass the scheme check in `renderMarkdownLinks`
  (http/https/mailto/relative only). `javascript:` and `data:` URLs are dropped.
- After any change touching templates, run: `grep -rn 'v-html' js/*.js`
  and confirm every site is safe.

## Generated files — do not hand-edit

- `js/templates.js` (~16,000 lines) is library data. `scripts/realign_templates.js`
  normalizes it only (columns, blanks, portraits) — template *content*
  (names, dice, statements) is hand-authored, then proven with
  `npm test` (round-trip parity) and `npm run validate`.
- `js/app.min.js`, `css/app.min.css`, `mix-manifest.json` are build outputs,
  rebuilt by CI. Don't commit manual tweaks to them.

## Definition of Done (applies to every change)

1. `npm run build` passes with no errors or warnings.
2. `npm run check` (`tsc --noEmit`) passes.
3. New file? Imported into the graph from `js/app.js` (or intentionally standalone).
4. `grep -rn 'v-html' js/*.js` — every site accounted for per Security rules.
5. Smoke-tested the touched feature from the checklist below, in a real browser.
6. Push to `main` only when 1–5 are green.

## Smoke checklist

- Roster: create / load / duplicate / delete character; import + export JSON;
  create from template.
- Editors: add, edit, and delete via name, portrait, trait-set, trait,
  subtrait, and SFX editors.
- Play mode: add dice to pool, roll, clear; challenge pool; print view renders.
- Reload with existing localStorage data — zero console errors.
- Mobile width: sheet and roller both usable.
