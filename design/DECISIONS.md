# Cortex Toolkit — Architecture & Design Decisions

Positive-law reference describing the current architecture and ratified conventions of Character Curio (`cortex-toolkit`).

## Governance

- **Do not self-modify this document.** Agents MUST NEVER autonomously create, modify, append to, or rewrite `design/DECISIONS.md`.
- Updates to `design/DECISIONS.md` are permitted **only** when the user explicitly instructs an edit to `design/DECISIONS.md` in that prompt and approves the wording.
- Propose candidate architectural changes or open trade-offs in chat with provenance labels (`[SUGGESTION]`, `[OPEN]`) instead of recording them here unprompted.

## Core Principles

- **Structural naming over game jargon**: Layout IDs, body/header styles, CSS classes, and component filenames describe geometry and structure (`portrait-ring`, `two-columns-compact`, `two-columns-detailed`, `subtrait-columns`, `three-column-table`, `paired-slots`, `pool-rows`, `dice-count`, `die-rows`, `die-track`, `list`, `image`, `pips`), not game-system nouns.
- **Zero vocabulary sniffing**: Rendering, editing, search, and dice staging derive strictly from schema properties and explicit `view` flags (`noun`, `plural`, `ppDelta`, `keepsExtra`, `resolveRating`, `view.parts`, `view.altRoll`, `view.ringBadge`, `view.fixedNames`, `view.prompt`, `view.labels`, `view.notesMarkdown`, `view.listing`). Code never branches on game-specific trait or set names (`sfx`, `hinder`, `statement`, `scale`, `stress`, `distinction`, `notes`, trailing `:`).
- **Terse UI & visible state**: Keep labels short without parenthetical hints or `"e.g."` examples. Everything persisted in character/set data is visible and editable with no hidden state.
- **Current-format `0.1` only**: Imports, templates, and storage validate against `schema/0.1/character.schema.json`. Legacy formats are rejected outright.

## Data Model & Storage

- **Uniform 1-level recursive `Trait` model**: Parent traits store direct children (modifiers, effects, companions, subtraits, statements) in a single `traits[]` array. Wrapper containers (`{ name: 'SFX' | 'Statement', traits: [...] }`) are retired; behavior comes from each child's own rating (`Die` / `Dice` / `Pip` / `Counter`), `noun`, `ppDelta`, `keepsExtra`, `view.part` (`'block'`), and `view.altRoll`.
- **Schema & generated types**: `schema/0.1/*.schema.json` is the source of truth; `npm run types` (`scripts/gen-types.mjs`) generates `js/model.generated.ts` (never hand-edited), and `js/model.ts` adds runtime helpers and app-only `view` types (`getView`, `ensureView`).
- **Placement of presentation state**: Presentation settings belong under `view` (`style`, `border`, `frame`, `parts`, `labels`, `prompts`, `fixedNames`, `notesMarkdown`, `listing`, `diceConfig`, theme colors/fonts). Unapproved top-level fields on characters, trait sets, or traits are forbidden.
- **Layered templates & lossless codec**: `js/layered-materialize.ts` converts between name-keyed layered template files (`sets` map) and the runtime array shape (`traitSets[]`) losslessly without `removedTraits` tombstones. `js/templates.js` and `data/templates/*.template.layered.json` form a paired corpus validated together.
- **Local storage & cloning**: Persist under the single `localStorage` key `characterCurioData` namespaced by `"0.1"`. Deep-clone reactive objects with `structuredClone(toRaw(value))`.

## Independent Images

Three image channels exist and remain strictly independent with zero cross-channel fallback:

- **Character portrait (`character.portrait`)**: Owned exclusively by the Character Identity header and Name set header portrait. Never supplies images to `image` sets or trait-set frames.
- **Image set (`traitSet.view.imageConfig`)**: Owned exclusively by `style.body === 'image'` sets. Renders its own image, alignment, height, width, and caption (`traitSet.view.imageConfig.caption`) independently of Character Identity or any frame.
- **Portrait Frame / Ring / Arc (`traitSet.view.frame.image`)**: Owned exclusively by a set's `view.frame` configuration (reading same-set `imageConfig.url` only as an intra-set fallback). Editing or clearing one channel never mutates another.

## Layout, Borders, Frames & Print

- **Section border (`view.border`)**: Accepts `'none' | 'block' | 'line'` or a `BorderConfig` object (`{ shape, stroke, color, corner, dash, tint }`). Controls the outer card border orthogonally to inner trait layout.
- **Portrait frame & trait array (`view.frame`)**: `shape` (`'none' | 'circle' | 'square' | 'round' | 'cut'`) sets the frame clipping silhouette; `array` (`'none' | 'ring' | 'arc'`) distributes rated traits or set-level `Dice` values radially around the frame via `portrait-ring.vue`.
- **12-column `parts` grid**: Custom row composition uses fractional/percentage `parts` cells (`name`, `rating`, `description`, `badge`, `block`, `subtraits`, `trackLabel`, `track`, and dynamic `child:<Noun>[:label|:rating]`). Sets claiming a track companion declare `view.labels.track`; block-rendered modifiers declare `view.part === 'block'` or non-zero `ppDelta`.
- **CSS-first responsive layout & print scaling**: Adapt viewport layouts with CSS grid, flex, container queries, and media queries. Print density scales via `@media print { html { font-size: 13px } }` and on-screen print preview scales via `.submode-print .pages { zoom: 0.8125 }` without global `html.print-view` font overrides or legacy preview toggles.

## Roller, Glyphs & Mechanics

- **Roll staging & pools**: Clicking rated traits or dice stages dice into the active pool (player or opposition). `resolveAltRoll` resolves alternate roll pills (`view.altRoll` or rated `ppDelta` children) with explicit `die`, `ppDelta`, and `label`; `keepsExtraDice` counts extra kept dice (`keepsExtra`); `isRingBadgeTrait` marks a ring badge trait (`view.ringBadge`).
- **Crisp die glyphs**: `.diecon` SVG shapes (`renderDieconSVG`) center numerals optically inside polygon geometry (including tight `d4` triangular bounds) and respect theme/preset `diceConfig` strokes and fills without background hacks.
- **Showcase metadata (`view.listing`)**: Template library cards read showcase metadata (`quote`, `genre`, badge/image preview details) from template JSON data rather than hardcoded UI lookup tables.

## Security & Style Controls

- **Rich text & URL sanitization**: Bind plain text with `{{ }}` / `v-text`. Bind rich text with `v-html` **only** through `renderText`, `renderMarkdown`, or `renderNotesText` (gated by `view.notesMarkdown`), which escape HTML and restrict URLs to `http:`, `https:`, `mailto:`, and relative paths, or through fixed SVG/die outputs (`renderDieconSVG`, `getDieDisplayValue`).
- **Self-hosted assets**: All fonts (`fonts/*.woff2`, `css/fonts.css`) and Font Awesome subsets (`css/fontawesome.css`) ship locally for offline execution with zero external CDN requests.
- **Style & gate budgets**: Source stylesheets and Vue templates maintain zero static `style="..."` attributes, zero hardcoded numeric `z-index` values, zero empty rulesets, and `!important <= 4`. Every change passes `npm run gate` before completion.
