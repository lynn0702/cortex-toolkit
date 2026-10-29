# DECISIONS.md — cortex-toolkit

New decisions: add one dated line here under the right topic, and the full entry to `DECISIONS-history.md`. Read this file before proposing anything; read the history only when an entry here points to it or a decision is disputed.

Scope: this repo is the sheet builder. KaelriMonsters
(https://github.com/lynn0702/KaelriMonsters) is a separate content repo —
monster-specific rules live there, not here. The original fork is
https://github.com/kaelri/cortex-toolkit.

## Decided

### Layer model
- 2026-10-10: Single layer type; `merge(...layers)` with later (more-local) winning.
- 2026-10-10: Per-key three states: absent inherits, null explicitly clears, value overrides.
- 2026-10-10: Fields reference layers (`game`, `type`); a field's presence can pull a mechanics layer.
- 2026-10-10: Sets and traits are name-keyed maps; duplicates at one level are structurally impossible.
- 2026-10-10: Identity is path-scoped (`/Distinctions/SFX` ≠  `/Distinctions/Chief Engineer/SFX`).
- 2026-10-10: Exported JSON carries no trait/subtrait ids. Sparse storage. Optional fields may be null.
- 2026-10-11: Null-emit rule: a null is emitted iff a less-local layer has the trait and the local layer explicitly clears it. Deleting a null un-clears it.
- 2026-10-11: Merge deletes on null; removals are local nulls (`removedTraits`/`removedSets` are gone).
- 2026-10-11: Envelope stays file-level (`id`, `version`, dates, `isTemplate`, `sheet`, `prefs` beside the entity).
- 2026-10-11: `slots` is an object keyed by 0-based position in the full trait order (set, trait, SFX levels).
- 2026-10-11: Repeated worksheet blocks take suffixed keys (`GMC`, `GMC~2`, …) with the display name in `label`; each keeps its id and content.
- 2026-10-11: Nameless sfx objects are blank SFX placeholder rows in position-preserved SFX slots.
- 2026-10-11: Sparse is not data loss: exports carry the presentation layer (ref in memory, embedded on export); the character layer stays values plus local nulls.

### Ratings
- 2026-10-23: One shape at every level: `{ type: Counter | Die | Dice | Pip, value: [], range: [] }`. Value is always a list; range is the ladder (die scale, Counter [min, max], Pip bubble count). A trait is rated iff it carries a rating.
- 2026-10-23: Stepping changes `value` along `range`; spending marks a die temporarily unavailable and never mutates `value` (spent state lives beside the rating).
- 2026-10-23: `spendable` drives the spend-one-at-a-time control; every Dice rating is spendable unless stated; stress and session/growth dice are never spendable. `pool` stages the whole available array; `keepsExtra` is the Scale effect (Scale stays a trait name).
- 2026-10-23: `hitches` (faces 1..hitches, sparse, inherited, default 1) floods the pool to its highest member; `hitches: 0` is an exemption that rolls apart (`rollSeparate` is derived, stored nowhere).
- 2026-10-23: Canonical emit writes rating objects only; dice strings and the `"d8"` shorthand parse on read for import compat.
- 2026-10-23: Challenge pools and boss pools are not flags: both are Dice ratings with pool and spendable true, differing only in size.
- 2026-10-22: The set-level die is the set node's own Rating; unrated traits fall through to it (editor: single-select chips, None first, presets gone).
- 2026-10-24: The trait editor exposes the rating type as a control (Die | Dice | Counter | Pip) and swaps its inputs: single die-size control, dice-list editor, number field with min/max, bubble-row editor. Die↔Dice preserves the dice; other changes start from that type's default.
- 2026-10-24: A trait is multi-die by having a Dice rating; the old multi-die flag and checkbox are gone.
- 2026-10-24: Multi-die rendering keys off the rating type (`Dice`) alone; the style exclusion list (stress/list/notes) is gone, so a Dice rating renders multidie UI in every body.
- 2026-10-24: Out is a range option for die ratings, defaulted off: `rating.out` opts a Die/Dice ladder in, and set flags that enable Out badges (outIndicator, stressConfig or attachedStress includeOut) put it in range. Out state is a die past the ladder top or the out flag; toggles stamp the opt-in, stepping preserves it, clearing drops the rating whole.
- 2026-10-27: Die rating stepping in Play lives in the Play panel (Properties tab) as value-stepping controls only: Die steps size along range; Dice steps each die independently along range; Counter steps +/- within [min, max]; Pip inline tracks and questioned toggling unchanged. Stepping disables at range bounds and never wraps. Inline row steppers rejected to protect row hitboxes and staging targets. Rating type, range editing, add/remove die in a pool, and adding ratings to unrated traits stay Edit-only.

### Dice & pools
- 2026-10-10: Compact dice notation (`"5d10"`, damaged `"2d10d8d6"`): descending size, count prefix with 1 omitted, no separators; spaces ignored. Tokenize on d4/d6/d8/d10/d12/d20.
- 2026-10-10: "Threat Pool" is rejected and never returns. A trait name takes no "Pool" when a single die can be its rating.
- 2026-10-23: `pool` on a node (trait or set) stages its whole available array on add; a set with pool never resource-flags its dice (Growth Pool). Explicit per-trait `isResource` still wins.
- 2026-10-11: `challenge` is not a core-repo keyword; challenge mechanics live in the monsters repo.
- 2026-10-16: Dice glyphs are Roboto 900 SVG vectors; d12 is an apex-up pentagon; 1px strokes with round joins.
- 2026-10-24: Apart-rolling derives from hitches (0 rolls apart, never hitches); the resource name/body gate is gone. Staged dice carry no kind flags; groups, the per-source keep bonus, and the combine toggle key off hitches-0 sources. keepsExtra (Scale) is untouched.

### Costs & selection
- 2026-10-26 (cost is dead): structured cost is removed from
  the model. Cost lives in the prose of the SFX description,
  which already carries cost and benefit in the majority of
  SFX; one presentation preference (separating cost from
  benefit for display) does not earn model-level treatment.
  The cost vocabulary, editor Cost section, validation, and
  codecs are removed, and cost payment machinery is removed
  with them. The table reads the description and applies it
  by hand with the app's own controls.
- 2026-10-10: Selection primitives: `usableBy` (owner|anyone|opposition), `select` (one|any), `requiresSelect` (bool); the Designer sets them on type layers, the roller enforces per pool.
- 2026-10-10: Selection defaults: usableBy owner, select any, requiresSelect false.

### SFX
- 2026-10-11: SFX do not inherit. Placement is presentation, not mechanical. An SFX in one set may reference a trait in another.
- 2026-10-11: SFX is a traits map: old `sfx` arrays fold into `traits` under an `SFX` node, Hinder among them.
- 2026-10-26 (SFX dissolve): `trait.sfx` / `set.sfx` die as named model fields. SFX are ordinary child traits grouped under an "SFX" child trait, distinguished by shape and view — no named field, no kind flag, no SFX boolean. Export stops emitting sfx arrays; old-format import still converts them into traits. Hinder shared-text behavior preserved.

### Stress & complications
- 2026-10-22: Stress lives as an ordinary rated companion subtrait (the "stress ring" is display of the companion's value); `custom.stress` / `custom.isStressOut` normalize to it, templates carry stress as real traits.
- 2026-10-18 (superseded by 2026-10-27 item 3 below): Attached stress is set-level config (`enabled`, `label`, scale) with an ordinary companion per trait; enabling forces the track on (default five-die scale), disabling deletes the cells.
- 2026-10-27 (Attached stress declaration dissolve + layout area rename): `view.attachedStress` declaration dies as a set-level configuration. Attached stress is recognized purely by the presence of `parts.track` in the layout grid; its label defaults to 'Stress' or reads `view.labels.stress`. Stress scale lives exclusively on companions (`rating.range`), not at the set or parts level; track scale for empty rows resolves to the range of the first companion found in the set, falling back to default `[4, 6, 8, 10, 12]`. Migration converts legacy non-default scale declarations by seeding one value-less companion per trait (`{ name: <label>, rating: { type: "Die", value: [], range: <scale> } }`), preserves existing companions, migrates `includeOut: true` to `outIndicator: true`, and deletes `attachedStress`. Editor toggle only builds or removes `parts.track` / `parts.trackLabel` cells without writing declarations or seeding companions. Layout areas and parts renamed: `parts.stress` → `parts.track`, `parts.stressLabel` → `parts.trackLabel`, `parts.sfx` → `parts.block`, `stressDice` → `trackDice`, `.trait-part-stress` → `.trait-part-track`, `.trait-part-stress-label` → `.trait-part-track-label`, `.trait-part-sfx` → `.trait-part-block`. CSS sizing wires `--track-faces` dynamically for responsive cell scaling.
- 2026-10-18: Stepped tracks get a generic `view.outIndicator` (default off); legacy `stressConfig.includeOut` still wins when set on `stress` bodies.
- 2026-10-27 (playMutable carve-out): Play add/remove is decided strictly by `view.playMutable === true`. Name-sniffing ('complication' substring) and the unflagged stress fallback are removed. Stress sets never add or remove traits in Play (stress only steps ratings). Complications sets keep full add and remove capability in Play. The 6 complication sets in the spotlight corpus are flagged by meaning: Misty Cove Complications, Necromancer Complications, Retired No More Aging Complications, Snowfall Initiative Complications, Strange Towns Complications, Titans vs Leviathans Handler Complications. Assets and stress sets remain unflagged.

### Visibility & name block
- 2026-10-28 (Play-only visibility, extends 2026-10-23): Node visibility (`view.visibility` on traits and trait sets) is `shown` | `play-only` | `editor-only` | `hidden` (`shown` is absence); `'play-only'` is visible in `edit` and `play` and hidden in `print` (and `@media print`). One shared 4-state eye toggle (`fa-eye` / `fa-gamepad` / `fa-eye-slash` / `fa-ban`); writes stay sparse against honest defaults.
- 2026-10-22: Visibility defaults tell the truth about the style: game/plotPoints/notes default hidden in spotlight (no zone renders them), shown in classic; stored visibility always wins.
- 2026-10-22: The name block is the first trait set; each magenta heading is the name trait's label edited in place; values stay on the character fields. Game identity, portrait, and plot points included.
- 2026-10-23: Plot Points is a spendable Counter `[0, 20]` on a name-set trait, mirrored to the character field; its stepper is the Counter's spend control.

### Pips & sessions
- 2026-10-24: Session record unified into pips with a labels opt-in (`view.pips.labels`): one bubble per row beside the trait name. Pure tracks (XP) keep count semantics and create no traits.
- 2026-10-23: Labeled rows are bubble plus write-in line (inline rename in edit, underlined text in play/print); the Pip rating reads filled/true with no description anywhere.
- 2026-10-23: Pip tracks live on the set node's Pip rating; labeled rows on row Pip ratings; `view.pips` keeps perRow/connected/labels only.
- 2026-10-16: Milestone sets are standard traited sets (`ratingPosition: "none"`, `features: { description: true }`).

### Statements
- 2026-10-27 (Statements dissolve): `trait.statement` and `trait.questioned` die as named model data fields. A statement is an ordinary child pip trait grouped under a "Statement" child trait (no named field, no kind flag, no statement boolean), with the sentence as the trait's name (and description as alternative). Its Pip rating value represents questioned state: filled (`value: [true]`) = questioned, unfilled (`value: [false]`) = not questioned. Pip range is degenerate (`[true, false]`) and is not stored. Marking questioned is a Play value edit by construction (no special carve-out needed). Set-level `statement` / `hasQuestionedPip` view flags remain presentation-only. Export stops emitting trait-level statement and questioned fields; old-format import converts them into statement child pip traits.

### Portrait ring
- 2026-10-12: The ring is generic, not attributes-only (`ringTrait` flag, `ring-*` vocabulary); `getRingTrait` still reads legacy `attributesRing`.
- 2026-10-12: Scale die offsets X/Y are sliders; the halo drag already consumed them.

### Editors
- 2026-10-11: The editor section holding rating options is Options, not Pool Options.
- 2026-10-24: The style gallery is the add-set flow (placement carried in); every card lands with that style's defaults, including the Sessions card.
- 2026-10-16: One docked Studio Panel (Properties + Roller tabs); selecting anything routes inspection there with breadcrumbs; sheet background clears selection.
- 2026-10-22: Editor chrome is not sheet property; dependents render adjacent and summon-only; every control exists only when it can act; numeric readouts are presentation-only; red is reserved for destructive actions; dropdowns never clip; dotted inputs read as editable; type never shrinks below .8125rem/13px; every touch target is spacious.
- 2026-10-22: Form-field hygiene: every input carries id/name plus a label association or aria-label.
- 2026-10-18: Every stored element has UI; no hidden state. No presets for undefined taxonomies.
- 2026-10-11: Style blurbs and halo degree readouts stay: descriptions, not labels.

### Sheet layout
- 2026-10-19: Layout is nested grids with explicit coordinates: sets carry `view.place {left, top, width, height}` (percent strings + row units, height is a floor); trait parts ride `view.parts` cells. Print rules unchanged.
- 2026-10-22: Branch shares are styled data: `view.branch {left, center, right}` fr numbers around the fixed 2rem link, defaulting to CSS 1.4/1/1.4; split head and rows take them inline, sheet and print alike.
- 2026-10-22: Both miniatures are direct-manipulation controls writing model units (half-percent columns, integer rows) with wall clamps; one gesture, one persist. The row miniature shows header plus parts; reset clears only geometry the renderer would ignore.
- 2026-10-22: Set editor holds row work; page arrangement lives on the Sheet Page tab (cross-page drops reorder, drill is press-timing on clean release).
- 2026-10-22: Styles are presets that never flip under arranging; re-selecting a preset clears geometry its renderer would ignore.
- 2026-10-22: The split-branch header is never hidden; the set Rating badge lives with the ratable content (branch center, unrated grid cells), never the union header.
- 2026-10-18: Max 3 columns system-wide; bands render sets as grid items (`track`/`span`); sets carry one `colWidth` share (≤100 capped); unplaced bands seed coordinates where grabbed.
- 2026-10-18: Rows are explicit and visual (`view.row`, header-inclusive); `rowBreak` is retired; bands derive from shared rows.
- 2026-10-12: Set header option `sidebar` | `top` with `headerAlign` left|center|right (top-bar labels flush left by default).
- 2026-10-18: Flank branch layout: `traitColumns: 2` spreads skills to outer columns with specialties down the middle; explicit split wins.
- 2026-10-12: Internal style ids name the layout (`sfx-rows`, `boxed-rows`, `pool-rows`, `die-track`, `subtrait-columns`, `paired-slots`, `die-rows`, `three-column-table`, `dice-ladder`, `labeled-fields`, `dice-count`, `portrait-ring`); component files, classes, and identifiers follow the same stems. Legacy Kaelri style ids (`distinctions`, `assets`, `resources`, `stress`, `attributes`) migrate on import (2026-10-28).
- 2026-10-24: Paired slots address subtraits by index (`getSubtraitAt`, slot labels for names); the bonus-slot d6 floor is one slot-indexed rule (`getSubtraitSlotRatings`) shared by sheet and editor — the positional wrappers and the BONUS name-sniff are gone.
- 2026-10-28 (2D Mobile Pillar Carousel & Set Preset Library, supersedes 2026-10-27 1D carousel): Mobile Play (`submode === 'play'` at `<= 768px`) is a data-driven 2D Pillar & Stack Deck powered by `view.pillar` (an open, permissive string with zero hardcoded whitelists; defaults to `'identity' | 'prime' | 'plus' | 'play'`) and customizable display labels under `view.labels.pillars[key]`. Top jump pills represent Pillar Columns (with staged dice count badges and a `+ Card` preset button); each `88vw` Pillar Column vertically stacks its assigned sets with a sticky `.mobile-substack-bar` when a column holds multiple cards. Session cards (`Scene Traits`, `Session Notes`, `Crisis Pool`, `Micro-GMC`) are dogfooded as standard `TraitSet` presets (`cortexSetPresets` + user-saved `cortexCustomSetPresets`), never bespoke widgets.

### Print
- 2026-10-12: Print density is `@media print { html { font-size: 13px } }` only; the print tab zooms `.pages` at 0.8125 with inverse-scaled page vars (WYSIWYG). No global shrink, no separate preview button.
- 2026-10-12: Print fits one page (Bewilderwood sheet the reference); the tab locks the desktop grid with horizontal scroll instead of reflowing.
- 2026-10-12: Black & White print option (`grayscale(1)`, screen and paper).
- 2026-10-24: Fixed system names (printed on blank sheets) match a central registry (`fixedNameSetKeys`), not inline name-sniffing; structural checks (columns, attached stress, spotlight membership) stay.
- 2026-10-12: Fidelity fixes: badge rows are a 3-column grid with centred dice; sections fill their bands; paired-slot dice share the main row; trait names centred; unrated rows keep full tracks (blank sheets stay pencil-usable).

### Migration
- 2026-10-11: The migration path is porting original toolkit files (kaelri/cortex-toolkit format). Sample files live in the KaelriMonsters repo. Never break old-format import.
- 2026-10-12: Migration targets originals only; the fork's own data has no users, so there is no stored-data upgrade path. The spotlight library files are the internal exception.
- 2026-10-11: Bewilderwood (`spotlight-camp-bewilderwood` v3) is the reference migration: round-trip deep-equal with byte-identical sheet DOM.
- 2026-10-11: Layered templates keep set `id` for join continuity; template layers are complete, not sparse; `$schema`/`version` markers drop in layered form and return on unmigrate.

### Persistence
- 2026-10-26 (multi-tab data loss): saves are granular by character — the app upserts and deletes whole character entries by id, and the storage layer merges them into the store (read-modify-write) instead of replacing the whole record, so a stale tab can no longer clobber another tab's characters. A stale save is flagged and surfaced as a toast, never a quiet drop.
- 2026-10-26 (multi-tab follow-up — atomicity + template merge, supersedes the two limitations above): the IDB save path is one `readwrite` transaction (get → merge → put), so simultaneous saves serialize; and the template registry merges by `id@version` with `written = (S ∪ C) − (T0 − C)`. The localStorage fallback is documented sequential-only. Per-tab UI state (open IDs, play view mode, roller position, preferences) stays last-write-wins by design.
- 2026-10-27 (Play session boundary + roll-time PP settlement): Play-to-character boundary is PROMPT, NOT ASSUME. In Play mode, `persist()` gates character writes (`upsert = []`, `remove = []`) while continuing to persist per-tab session preferences (panel position, play view mode, open characters). A baseline snapshot of each character is initialized at boot and updated only upon explicit save; switching modes out of Play with uncommitted session changes intercepts navigation and presents exactly two choices: "Save session into character" (writes changes to storage, advances baseline) vs. "Discard session changes" (reverts in-memory characters from baseline, clears dice pool), with Cancel as non-saving/non-discarding deferral. Plot Point timing is settled at ROLL-TIME: staging Hinder d4 adds no PP to the character (`ppDelta: 1`, `ppCommitted: false`), and roll-time settlement applies pending `ppDelta` to `character.plotPoints` upon `roll()`. Die removal and pool clear cancel pending dice without take-back subtraction, and removing a rolled die never takes PP back. Duplicating a die produces zero PP delta.

### Stack
- 2026-10-11: TypeScript migration, incremental. Vue 3 stays.
- 2026-10-12: Full SFC-first pivot (`<script setup lang="ts">`); `vue-tsc --noEmit` is the type gate; Node tests `require()` ESM sources (Node 24); unreferenced exports tree-shake by design.
- 2026-10-12: Vue is bundled (offline-capable); Google Fonts + Font Awesome stay remote.
- 2026-10-12: Build is `npm run types` + mix production + asset versioning; template library ships as a separate chunk with content-hash loader.
- 2026-10-11: Work order while still 0.x (fork was schema 0.1, site not live yet): spec freeze → TS scaffold → migration shim → UI pass.
- 2026-10-12: Model types generate from the schemas (`npm run types` → `model.generated.ts`); `model.ts` adds the app-only layer.

### Template system (from 2026-10-08, still in force)
- Template supplies starting content; user owns aesthetics; local user wins every conflict.
- Template updates never silently change existing characters (snapshot + explicit switch prompt).
- Existing characters pin an exact template snapshot; switching versions is explicit and preserves local overrides.
- Original-project imports without templates render unchanged.
- Removed traits stay removed across export/import.
- 2026-10-12: Template versions reset to v1 (no release yet; history is the archive); content edits are hand-authored and ship with validate plus round-trip parity green.
- 2026-10-11: Templates carry structure, never sample content.
- 2026-10-11: All 28 spotlight templates migrated and proven (template parity green, validate clean).
- 2026-10-11: The map key is the address, the set id the stable identity; trait renames stay add+remove.

### Agent working style
- 2026-10-11: Terse UI: short labels, no parentheticals, no "e.g." A label that needs explaining gets renamed.
- 2026-10-11: Agents may build beyond the ask when genuinely helpful. Test: surface something real (stored elements get UI; no hidden state) versus inventing the speculative (presets for undefined taxonomies).
- 2026-10-11: One migration path: users of the original fork (kaelri/cortex-toolkit) bring their files and they work; sample files live in the KaelriMonsters repo. Old-format import never breaks.
- 2026-10-11: The model (`trait-layers.md`, `trait-usage.md`) is the UI spec.
- 2026-10-10: Keep the `$noun` / default `"pronoun"` joke — load-bearing morale.
- 2026-10-11: Shell discipline: content edits to generated files go through the edit tool with read-verified context; byte-level verification via git diff hunks.

## Open (decisions needed)

- (none pending)

## Superseded (do not revive)

- 2026-10-10: `kind` field (mob/boss/challenge) — differences are table rulings, not data.
- 2026-10-10: `layers` array / namespaces — fields reference layers directly.
- 2026-10-10: `required` selection flag — renamed `requiresSelect`.
- 2026-10-10: Explicit `type: "set"` marker — position under `sets` identifies a set.
- 2026-10-11: "Build exactly what was asked, nothing more" — replaced by the genuinely-helpful rule.
- 2026-10-11: "v2" naming for the layered-model work — still 0.x.
- 2026-10-11: Trait shorthand as canonical emit — emit is rating objects; shorthand reads on import only.
- 2026-10-11: Dice-string ratings as canonical emit — emit is rating objects; strings parse on import only.
- 2026-10-11: `pool: true` auto-emitted on every multi-die rating — pool is staging intent, authored, not inferred.
- 2026-10-11: Challenge/boss pools as flags — Dice ratings with pool and spendable.
- 2026-10-11: Old multi-die ratings migrate with `pool: true` — see above.
- 2026-10-22: Trait visibility as a three-state enum, then as a hidden boolean — visibility is a word; booleans map onto it (superseded 2026-10-23).
- 2026-10-22: `custom.cortexToolkit.setDie` / branch-head set die / "Set Die" wording — the set node's own Rating.
- 2026-10-11: `nounSingular` / `nounPlural` — renamed `noun` / `plural` (2026-10-23).
- 2026-10-22: `custom.cortexToolkit` bag name — renamed `view` (single accessor, no branding).
- 2026-10-22: `view.sheetStyle` / `hasAttributes` sheet deduction — one stored key `view.style.sheet`.
- 2026-10-22: session-record / angled-lines bodies and spine renderer — unified into pips with labels.
- 2026-10-22: `custom.isScale` flag — the effect is `keepsExtra`, Scale stays a name.
- 2026-10-22: `custom.checked` pip mirrors — the Pip rating reads filled/true.
- 2026-10-22: `view.nameLabels` bag — name traits carry labels directly.
- 2026-10-19: Band model (track / span / widths / rowBreak) — nested grids with explicit coordinates.
- 2026-10-22: Arranging flips bespoke rows to a custom grid — presets never flip.
- 2026-10-22: Hide-redundant-header for split sets — split headers are never hidden.
- 2026-10-22: "Pool Options" section label — the section is Options.
- 2026-10-12: `html.print-view` global scaling; separate edit-mode Print View button.
- 2026-10-12: Vue from CDN — bundled.
- 2026-10-12: Global `.component()` registrations — consumers import locally.
- 2026-10-18: `ratingDirection` key — ladders use `ratingPosition: 'vertical'` + `labelPosition`.
- 2026-10-18: `widths` triples on sets — one `colWidth` share per set.
- 2026-10-18: `rowBreak` markers — explicit `view.row`, bands derive.
- 2026-10-18: Multi-die flag `view.multiDie` and "Multiple dice" checkbox — multi-die is a Dice rating (2026-10-24).
- 2026-10-18: `traitColumns` dead data — flank layout (kept where meaningful).
- 2026-10-12: `haloConfig` persisted key and halo-attributes vocabulary — `ringConfig` / ring vocabulary.
- 2026-10-12: `includeD4`, `styleHeader`/`styleHint`/`setStyle`, template `?v=33` confusion — removed/clarified.
- 2026-10-10/11: Structured cost (cost as an object; `{plotPoints}`, `{stepUp}/{stepDown}`, `{pool}`, `{narrative}` cases) — cost is dead (2026-10-26); cost lives in SFX description prose.
- 2026-10-24 (SFX costs are descriptive): kept the cost vocabulary, editor Cost section, validation, and codecs as descriptive data — superseded by 2026-10-26 (cost is dead).


### 2026-10-28 — Trait-block mini (`js/trait-set-mini.vue`) & creator preset cards (Phase 3a)
- **Standalone trait-block mini:** `js/trait-set-mini.vue` authors one `TraitSet` block in isolation (accessible directly from the Roster, Style Gallery, Play Preset Picker, or Set Editor without requiring an open character sheet). Every part (`name`, `rating`, `description`, `block`, `subtraits`, `trackLabel`, `track`) is a box on the 2D block grid (`view.parts`), dragged from the noun-grouped Inventory Grid, moved by drag or arrow keys, and resized by edge-grab or `Shift+Arrow`, with synced numeric readouts.
- **Icon language & noun consistency check:** Inventory tiles and grid part boxes use `T` (text), `L` (Edit-only label when `!playMutable`), the app's own die geometry SVG (`renderDieGeometrySVG`, single die = rating, bundle = pool, `aria-hidden="true"`), and `.pip-bubble` (pip). Grouping the inventory by trait and companion nouns surfaces any misspelled noun as an extra inventory group without validation gates.
- **Save as preset:** Creator-typed `label` (required) and optional `blurb` (never auto-generated); `id` derives from `label` (`derivePresetId`) and rejects collisions with existing built-in or custom presets (`hasPresetCollision`) rather than overwriting silently. Saved cards carry `view.pillar` (default `'play'`, open string) and optional `view.labels.pillars[key]`.
- **Model vocabulary & track synchronization:** Subrow controls mirror JSON schema properties: `Range` (`rating.range`) and `Rating` (`rating.value`). `view.labels.track` and legacy `view.labels.stress` are unified in `getTrackLabel`. Companion track nouns synchronize with the set's track label so renaming updates all companions, the preview, and the model in lockstep. Pillars icon is `fa-building-columns`.

### 2026-10-28 — Page mini (`js/page-layout-mini.vue`) & trait-block mini handoff (Phase 3b)
- **Page miniature as page placement control:** `js/page-layout-mini.vue` renders every trait set across all pages as a draggable box (`view.place = { left, top, width, height }`) on the page grid (`getSpotlightSections`, `layoutFor`). Moving a box commits on release; dragging across page miniatures reorders sets in document order and updates `view.page` while keeping vertical grouping intact. Dropping outside all miniatures or pressing `Escape` cancels the drag and leaves the model completely untouched.
- **Collision avoidance & live clamping:** Live movement and resizing clamp against canvas boundaries and existing placed obstacles on the target page, maintaining valid integer rows, minimum height 1, and `%`-suffixed string coordinates (`formatPct`) matching `validate.js` requirements. Unplaced sets render in full width or 2-column classic bands (`isFullWidthClassic`, `getTraitSetColumn`), and clearing placement (`clearPlace`) safely restores stacked-band document order.
- **Keyboard navigation:** Full keyboard alternatives (`tabindex="0"`, `role="button"`): Arrow keys nudge position (5% horizontal, 1 row vertical) with collision detection; `Shift + Arrow` resizes width (5%) or height (1 row); `Enter` or `Space` opens the Trait-Block Mini.
- **Bidirectional Trait-Block Mini handoff:** Double-click or activating "Edit Parts" opens `<TraitSetMini>` for the selected set via Teleport; closing or applying updates the set and smoothly returns the creator to the same page mini with the set still selected.
- **Pillar non-interference:** Page layout operations never mutate or reset `view.pillar`; the Play deck renders identically before and after page moves.

### 2026-10-28 — SVG Frames, Dynamic Positional Anchors, & Mobile Fallback (Phase 3c)
- **Data-driven SVG Frames (`view.frame`):** Frames live strictly in `traitSet.view.frame` alongside `place`, `parts`, and `pillar` (resolved via `resolveFrame` from shorthand string `"frame": "ring"` or sparse object `{ shape, span, corner, stroke, path }`). Shapes include `ring`, `ellipse`, `arc`, `block`, `line`, and `none`.
- **Frame places the Trait; `view.parts` shapes inside the Trait:** For radial/path frames (`ring`, `ellipse`, `arc`, `path`), `computeFrameAnchors` dynamically derives anchor coordinates $(x_i, y_i)$ and outward quadrant docking (`left`, `right`, `top`, `bottom`) for visible traits reactively ($0..N-1$), preventing multi-part stress tracks from colliding with the frame interior. At each anchor, the standard HTML `.trait` container renders its internal `view.parts` intact. Block frames (`shape: "block"`) render outer decorative SVG borders while traits flow in standard `view.parts`. Bare-path divider lines (`shape: "line"`) render a crisp SVG section divider.
- **Mobile Forced-Off & User Toggled-Off Fallback (Zero Overspill):** Radial/positioned frames automatically turn off in mobile card containers (`<= 768px`) or when toggled off via the header button (`aria-pressed`), dropping anchor positioning and falling back directly to the unframed stacked `view.parts` layout with zero horizontal overflow, zero data modification, and zero DOM remounting.
- **Strict A11y & Content Invariant:** All text, dice, and pips remain standard HTML elements in logical DOM order ($0..N-1$). The `<svg>` elements are purely decorative (`aria-hidden="true"`, `focusable="false"`) containing zero SVG `<text>` or `<textPath>` nodes.
