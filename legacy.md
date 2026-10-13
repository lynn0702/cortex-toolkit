# Legacy handoff — Cortex Toolkit agent context

The user (Lynn) asked for this file so a replacement agent can pick up with
consistency. It records project understanding, product goals, working style,
and active constraints. Date: 2026-10-10. Beta is UNRELEASED (no real users).

## 1. What this project is

Cortex Prime Toolkit: a Vue 3 (global prod build, no SFCs, no test framework
originally) character-sheet builder for the Cortex tabletop RPG, focused on
replicating official Spotlight character sheets as editable grids, with dice
roller, roster, import/export, and print output. Deploys to GitHub Pages from
`main` only (`publish.yml`: `npm ci && npm run build`).

Key files (`cortex-toolkit/`):
- `js/app.js` — root component: roster/character/print modes, routing (`#/…`),
  history (undo/redo cap 50), persistence orchestration, prefs, template
  version prompts. Mounts as global `app` in browser.
- `js/character.js` — sheet renderer: spotlight grid engine
  (`getSpotlightSections`, `getSpotlightGridCells`), halo attributes, editors
  wiring, add/remove trait/set, print toolbar.
- `js/trait-set-block.js` — per-set rendering for all 20 styles. Biggest file.
- `js/*-editor.js` — name/portrait/trait-set/trait/subtrait/sfx editors.
- `js/functions.js` — shared logic: markdown+sanitize render, dice helpers,
  defaults, merge/pruner/template helpers. Has `module.exports` shim for node.
- `js/storage.js` — IndexedDB (db `cortex-toolkit`) with localStorage
  fallback + legacy migration. Has `module.exports` shim.
- `js/templates.js` — 26 spotlight templates (character-shaped blanks, static
  slug ids, baked set ids, `version` per entry). Built into
  `js/templates.bundle.js` by mix; roster lazy-loads the bundle.
- `schema/0.1/` — `character.schema.json` (nulls on optionals; id+name
  required on characters/sets; trait-level `id` forbidden), plus
  `sheet-template.schema.json`.
- `scripts/` — `validate.js` (schema + join rules + sample file),
  `merge-tests.js` (66 merge/pruner regression tests), `realign_templates.js`
  (DANGER: rewrites templates.js wholesale, LF endings, knows nothing of
  colWidth/rowBreak/rowSpan/versions — do not run casually),
  `version-assets.js` (build hash rewriting; only touches asset URLs).
- `Spotlight_CharacterSheetSamples/` — 21 source PDFs (ground truth).
- Build: `npm run build` (laravel-mix --production + version-assets).
  `npm test`, `npm run validate`.

## 2. Architecture the previous agent built (must understand)

- **Grid engine** (`character.js`): page → sections split on full-width sets
  and `rowBreak`; per-section track template from `colWidth` shares;
  explicit placement with `colSpan` (incl. 2-of-3), `rowSpan` (data-only, no
  editor UI yet), lone-track stretch. Template binds `:style` (grid-area +
  -2px seam margins) onto `trait-set-block` roots via attribute fallthrough.
- **Layered template model**: templates are character-shaped blanks;
  characters store sparse overlays + `sheet.template = {id, version}`.
  Merge is recursive three-state (absent→inherit, null→cleared, value→wins);
  sets join by stable `id`, traits/subtraits by `name`, blanks positionally;
  sfx/tags union; `removedTraits`/`removedSets` (character-local, never
  inherited); `sheet` never merges. `stripCharacterToDeltas` is the inverse
  pruner. Materialize on load, prune on persist/export. Renderer untouched.
- **Identity**: set ids are baked slugs (unique per template); `_lid` UUIDs
  on traits/subtraits live at rest only, stripped on export; used for Vue
  `:key`s and preference keys.
- **Prefs** (`storage.preferences` + file `prefs` name-keyed on export):
  set/trait order applied post-merge; recorded on edit/import; declined
  template versions live here.
- **Snapshots**: store keyed `(id, version)`; refs pinned; Update/Stay banner
  on bundle drift; unreferenced pruned on persist. Legacy tamas-rabel
  `{version:2,data}` files import with NO linkage (sacred path).
- **Removal UI**: remove-from-sheet (trait/subtrait, no confirm) writes
  removal lists; set editor lists restorable template traits; renames warn
  (unlinking is expected/documented). Delete paths write removal memory.
- **Print**: no pencil footer; red cut-lines every page-height in preview
  only; tall sheets flow (`break-inside:auto`); trait titles wrap dice below
  instead of vertical stacking; trait dice 0.9rem in print rows.
- **Mobile (≤768px)**: fluid single-column sheet, stacked bands/header,
  wrapping editor groups, 40–44px coarse-pointer targets, bottom-sheet
  editors, `interactive-widget=resizes-content` + scroll-into-view vs keyboard.

## 3. Standing user decisions (do not relitigate without asking)

- Blank template = blank boxes: trait names printed on the PDF stay; anything
  varying per character (statements, sample assets like Grampa's Multitool)
  is blanked. Complication/Bonus subtrait dice stay as default labels.
- New missing blocks reuse EXISTING styles only (no new style types without
  explicit approval that a style is truly unique).
- Template trait renames allowed under version bumps (beta, no users).
- `createFromTemplate` yields blank name + game-from-template (intended).
- Upstream envelope files unwrap to fresh-id characters, never overwriting.
- Prefs travel in exports (reconciles D18 vs no-UI-language rule).
- Blank `""` trait names are positional slots, exempt from the no-duplicates
  rule; set-level deletion uses `removedSets` (brief extension).
- Style reuse over new styles; additive template changes preferred.

## 4. How Lynn likes to work (learned corrections)

- Short, factual, no superlatives/praise/emojis. `file:line` references.
- Verify by EXECUTION (run code/tests/browser), never by assertion. Read files
  before claiming. State discrepancies plainly, even when inconvenient.
- Batch independent tool calls; use TodoWrite for multi-step work.
- NEVER commit, push, amend, or PR without explicit request. No redeploys.
- Do not create files unless necessary (this file was explicitly requested).
- Corrections stick across turns: blank-name/game (1.6), unwrap direction,
  full-fidelity-with-reuse scope, D8 blank exemption, removedSets, prefs
  travel. When uncertain between two readings, ask via the question tool —
  Lynn answers decisively.
- Reports with code refs + line numbers were called out as good ("Validate
  and act on this" + patch-style briefs are a welcome input format).

## 5. Environment gotchas

- PowerShell 5.1: NO `&&`, NO grep/head/tail — use `;`, `Select-String`,
  node one-liners. Write node helpers to temp files, not `-e` quoting hell.
- CRLF line endings in `js/templates.js`, most `js/*.js` (storage.js and
  name-editor.js are LF). The edit tool matches loosely but inserts may mix
  endings — verify with node byte checks after bulk edits.
- Template surgery: use node scripts (require + mutate + stringify with
  `\r\n`), never hand-edit the 300KB file; always run validate+tests after.
- Browser testing: serve via `python -m http.server 8099` (Start-Process
  hidden), drive with chrome-devtools tools. The MCP chrome profile locks —
  kill only processes whose command line contains `chrome-devtools-mcp`,
  never the user's main Chrome. Isolated contexts / emulated viewports work
  (`mobile,touch` for coarse-pointer testing). Screenshots sometimes time
  out — retry or fall back to measurements.
- `app` is global in-page (mounted proxy). Evaluations must await
  `ensureSpotlightTemplates()` before touching the library. Test-profile IDB
  accumulates probe characters — clean up (`deleteCharacter`) after probes.
- `version-assets.js` only rewrites `?v=` hashes — safe around other edits.

## 6. Known pending / deferred (as of handoff)

- `rowSpan` has no editor UI (templates-only). Empty center track in 3-col
  renders blank (pre-existing). KitBash Team Roster page skipped (separate
  handout). Inheritors worksheets not modeled. No physical-print check yet
  (screen CSS + print rules only). Survivor Distinctions dice kept because
  the legacy `none→inline` migration would undo hiding — retire it if hidden
  dice are wanted. Dead `.spotlight-page-footer` CSS remains (harmless).
- Never run `realign_templates.js` without accounting for new keys/versions.
- The `?v=33` bundle URL in roster.js vs version-assets hash patching of
  app.min.js — know which loads the bundle before touching either.
