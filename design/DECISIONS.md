# DECISIONS.md — cortex-toolkit

New decisions: add one dated line here under the right topic. Read this file before proposing anything.

Scope: this repo is the sheet builder. TorchliteMonsters
(https://github.com/lynn0702/TorchliteMonsters) is a separate content repo —
monster-specific rules live there, not here.

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
- 2026-10-11: SFX are traits in a traits map under an `SFX` node, Hinder among them.
- 2026-10-26 (SFX dissolve): `trait.sfx` / `set.sfx` die as named model fields. SFX are ordinary child traits grouped under an "SFX" child trait, distinguished by shape and view — no named field, no kind flag, no SFX boolean. Hinder shared-text behavior preserved.

- 2026-10-30: Badge is a trait part. trait.view.badge carries text, shape, color, and an optional Font Awesome icon; trait.view.prefix carries text. Badge renders by data presence: trait badge data present in a placed badge cell, no visibility flag, no set-level badge, no fallthrough. badge joins KNOWN_PARTS; the mini gains a badge tile (marker L, Edit-only); shape is orientation + corners only, color is a fixed token set, icon renders upright in all shapes, FA only. The corpus is seeded with badge data on every SFX trait plus a badge cell above its block (prefix unseeded, blank = no leaders). SFX is not model or render language: no sfx key, kind, class, or view key survives. This supersedes the 2026-10-30 dirty-commit note that left the badge object open.

### Stress & complications
- 2026-10-22: Stress lives as an ordinary rated companion subtrait (the "stress ring" is display of the companion's value); templates carry stress as real traits.
- 2026-10-27 (Attached stress declaration dissolve + layout area rename): `view.attachedStress` declaration dies as a set-level configuration. Attached stress is recognized purely by the presence of `parts.track` in the layout grid; its label defaults to 'Stress' or reads `view.labels.stress`. Stress scale lives exclusively on companions (`rating.range`), not at the set or parts level; track scale for empty rows resolves to the range of the first companion found in the set, falling back to default `[4, 6, 8, 10, 12]`. Editor toggle only builds or removes `parts.track` / `parts.trackLabel` cells without writing declarations or seeding companions. Layout areas and parts renamed: `parts.stress` → `parts.track`, `parts.stressLabel` → `parts.trackLabel`, `parts.sfx` → `parts.block`, `stressDice` → `trackDice`, `.trait-part-stress` → `.trait-part-track`, `.trait-part-stress-label` → `.trait-part-track-label`, `.trait-part-sfx` → `.trait-part-block`. CSS sizing wires `--track-faces` dynamically for responsive cell scaling.
- 2026-10-18: Stepped tracks get a generic `view.outIndicator` (default off).
- 2026-10-27 (playMutable carve-out): Play add/remove is decided strictly by `view.playMutable === true`. Name-sniffing ('complication' substring) and the unflagged stress fallback are removed. Stress sets never add or remove traits in Play (stress only steps ratings). Complications sets keep full add and remove capability in Play. The 6 complication sets in the template corpus are flagged by meaning: Misty Cove Complications, Necromancer Complications, Retired No More Aging Complications, Snowfall Initiative Complications, Strange Towns Complications, Titans vs Leviathans Handler Complications. Assets and stress sets remain unflagged.
- 2026-10-29: attachedStress code rip-out: all code
  references deleted, including preset normalization,
  validator branch, and tests. Delete, not deprecate, per
  the 2026-10-28 decision. Companions stay (ordinary
  traits now). stressConfig removed in the same pass per
  the 2026-10-29 call: type, reads, editor handling, and
  default gone; outIndicator is the only Out path.

### Visibility & name block
- 2026-10-28 (Play-only visibility, extends 2026-10-23): Node visibility (`view.visibility` on traits and trait sets) is `shown` | `play-only` | `editor-only` | `hidden` (`shown` is absence); `'play-only'` is visible in `edit` and `play` and hidden in `print` (and `@media print`). One shared 4-state eye toggle (`fa-eye` / `fa-gamepad` / `fa-eye-slash` / `fa-ban`); writes stay sparse against honest defaults.
- 2026-10-22: The name block is the first trait set; each magenta heading is the name trait's label edited in place; values stay on the character fields. Game identity, portrait, and plot points included.
- 2026-10-23: Plot Points is a spendable Counter `[0, 20]` on a name-set trait, mirrored to the character field; its stepper is the Counter's spend control.

### Pips & sessions
- 2026-10-24: Session record unified into pips with a labels opt-in (`view.pips.labels`): one bubble per row beside the trait name. Pure tracks (XP) keep count semantics and create no traits.
- 2026-10-23: Labeled rows are bubble plus write-in line (inline rename in edit, underlined text in play/print); the Pip rating reads filled/true with no description anywhere.
- 2026-10-23: Pip tracks live on the set node's Pip rating; labeled rows on row Pip ratings; `view.pips` keeps perRow/connected/labels only.
- 2026-11-10: Milestones sets ARE pip traits — a statement set with the pip on the other side (pip left of name, checklist-style); pip is the trait's own rating, not a child.

### Statements
- 2026-10-27 (Statements dissolve): `trait.statement` and `trait.questioned` die as named model data fields. A statement is an ordinary child pip trait grouped under a "Statement" child trait (no named field, no kind flag, no statement boolean), with the sentence as the trait's name (and description as alternative). Its Pip rating value represents questioned state: filled (`value: [true]`) = questioned, unfilled (`value: [false]`) = not questioned. Pip range is degenerate (`[true, false]`) and is not stored. Marking questioned is a Play value edit by construction (no special carve-out needed). Set-level `statement` / `hasQuestionedPip` view flags remain presentation-only. Export stops emitting trait-level statement and questioned fields.

### Portrait ring
- 2026-10-12: The ring is generic, not attributes-only (`ringTrait` flag, `ring-*` vocabulary).
- 2026-10-12: Scale die offsets X/Y are sliders; the halo drag already consumed them.
- 2026-11-10: Empty ring center: an interactive portrait drop-zone in Edit mode (when there is no portrait). Not a silhouette/monogram hub, not status quo.

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
- 2026-10-12: Internal style ids name the layout (`die-rows`, `die-track`, `subtrait-columns`, `portrait-ring`, `dice-count`); component files, classes, and identifiers follow the same stems. The dissolved ids (`sfx-rows`, `boxed-rows`, `notes`, `paired-slots`, `three-column-table`, `labeled-fields`, `distinctions`, `attributes`) are dead and validated as errors (see Mechanical consolidation).
- 2026-10-24: Paired slots address subtraits by index (`getSubtraitAt`, slot labels for names); the bonus-slot d6 floor is one slot-indexed rule (`getSubtraitSlotRatings`) shared by sheet and editor — the positional wrappers and the BONUS name-sniff are gone.
- 2026-10-28 (2D Mobile Pillar Carousel & Set Preset Library, supersedes 2026-10-27 1D carousel): Mobile Play (`submode === 'play'` at `<= 768px`) is a data-driven 2D Pillar & Stack Deck powered by `view.pillar` (an open, permissive string with zero hardcoded whitelists; defaults to `'identity' | 'prime' | 'plus' | 'play'`) and customizable display labels under `view.labels.pillars[key]`. Top jump pills represent Pillar Columns (with staged dice count badges and a `+ Card` preset button); each `88vw` Pillar Column vertically stacks its assigned sets with a sticky `.mobile-substack-bar` when a column holds multiple cards. Session cards (`Scene Traits`, `Session Notes`, `Crisis Pool`, `Micro-GMC`) are built as standard `TraitSet` presets (`cortexSetPresets` + user-saved `cortexCustomSetPresets`), never bespoke widgets.

### Print
- 2026-10-12: Print density is `@media print { html { font-size: 13px } }` only; the print tab zooms `.pages` at 0.8125 with inverse-scaled page vars (WYSIWYG). No global shrink, no separate preview button.
- 2026-10-12: Print fits one page (Bewilderwood sheet the reference); the tab locks the desktop grid with horizontal scroll instead of reflowing.
- 2026-10-12: Black & White print option (`grayscale(1)`, screen and paper).
- 2026-10-24: Fixed system names (printed on blank sheets) match a central registry (`fixedNameSetKeys`), not inline name-sniffing; structural checks (columns, attached stress) stay.
- 2026-10-12: Fidelity fixes: badge rows are a 3-column grid with centred dice; sections fill their bands; paired-slot dice share the main row; trait names centred; unrated rows keep full tracks (blank sheets stay pencil-usable).

### Files
- 2026-11-06: Only current-format files import, superseding the "One migration path" rule. Old-format and Kaelri files are rejected; a separate converter project produces current-format files. Layered templates keep set `id` for join continuity; template layers are complete, not sparse; `$schema`/`version` markers drop in layered form.
- 2026-11-06: `normalizeLayeredTraits` was import-only (its `slots` → traits conversion is a no-op on current-format data) and was deleted with the migration machinery, not relocated.
- 2026-11-10: All character template schema references point to the relative schema (`../schema/0.1/character.schema.json` / `../../schema/0.1/character.schema.json`). There are no `*.cortex.json` files in the project; character files have fully migrated to `*.curio.json`.

### Persistence
- 2026-10-26 (multi-tab data loss): saves are granular by character — the app upserts and deletes whole character entries by id, and the storage layer merges them into the store (read-modify-write) instead of replacing the whole record, so a stale tab can no longer clobber another tab's characters. A stale save is flagged and surfaced as a toast, never a quiet drop.
- 2026-10-26 (multi-tab follow-up — atomicity + template merge, supersedes the two limitations above): the IDB save path is one `readwrite` transaction (get → merge → put), so simultaneous saves serialize; and the template registry merges by `id@version` with `written = (S ∪ C) − (T0 − C)`. The localStorage fallback is documented sequential-only. Per-tab UI state (open IDs, play view mode, roller position, preferences) stays last-write-wins by design.
- 2026-10-27 (Play session boundary + roll-time PP settlement): Play-to-character boundary is PROMPT, NOT ASSUME. In Play mode, `persist()` gates character writes (`upsert = []`, `remove = []`) while continuing to persist per-tab session preferences (panel position, play view mode, open characters). A baseline snapshot of each character is initialized at boot and updated only upon explicit save; switching modes out of Play with uncommitted session changes intercepts navigation and presents exactly two choices: "Save session into character" (writes changes to storage, advances baseline) vs. "Discard session changes" (reverts in-memory characters from baseline, clears dice pool), with Cancel as non-saving/non-discarding deferral. Plot Point timing is settled at ROLL-TIME: staging Hinder d4 adds no PP to the character (`ppDelta: 1`, `ppCommitted: false`), and roll-time settlement applies pending `ppDelta` to `character.plotPoints` upon `roll()`. Die removal and pool clear cancel pending dice without take-back subtraction, and removing a rolled die never takes PP back. Duplicating a die produces zero PP delta.
- 2026-11-10: Do NOT reject valid characters on the stored-data load path. Characters live in IndexedDB (primary); localStorage is the fallback. Once the schema is defined and locked, ALWAYS provide a migration path when introducing changes, to keep characters loadable.

### Stack
- 2026-10-11: TypeScript migration, incremental. Vue 3 stays.
- 2026-10-12: Full SFC-first pivot (`<script setup lang="ts">`); `vue-tsc --noEmit` is the type gate; Node tests `require()` ESM sources (Node 24); unreferenced exports tree-shake by design.
- 2026-10-12: Vue is bundled (offline-capable); Google Fonts + Font Awesome stay remote.
- 2026-10-12: Build is `npm run types` + mix production + asset versioning; template library ships as a separate chunk with content-hash loader.
- 2026-10-11: Work order while still 0.x (fork was schema 0.1, site not live yet): spec freeze → TS scaffold → UI pass.
- 2026-10-12: Model types generate from the schemas (`npm run types` → `model.generated.ts`); `model.ts` adds the app-only layer.
- 2026-11-12: Compiled bundles (`js/app.min.js`, `css/app.min.css`, `js/templates.bundle.js`) are gitignored build outputs built locally and in CI; `scripts/version-assets.js` stamps the template chunk hash into `js/app.min.js` on build and stamps `?v=` asset hashes onto `_site/index.html` during Pages staging so tracked `index.html` stays clean.

### Template system (from 2026-10-08, still in force)
- Template supplies starting content; user owns aesthetics; local user wins every conflict.
- Template updates never silently change existing characters (snapshot + explicit switch prompt).
- Existing characters pin an exact template snapshot; switching versions is explicit and preserves local overrides.
- Removed traits stay removed across export/import.
- 2026-10-12: Template versions reset to v1 (no release yet); content edits are hand-authored and ship with validate green.
- 2026-10-11: Templates carry structure, never sample content.
- 2026-10-11: All 28 Library templates are current-format (validate clean).
- 2026-10-11: The map key is the address, the set id the stable identity; trait renames stay add+remove.

### Agent working style
- 2026-10-11: Terse UI: short labels, no parentheticals, no "e.g." A label that needs explaining gets renamed.
- 2026-10-11: Agents may build beyond the ask when genuinely helpful. Test: surface something real (stored elements get UI; no hidden state) versus inventing the speculative (presets for undefined taxonomies).
- 2026-10-11: The model is the UI spec.
- 2026-10-10: Keep the `$noun` / default `"pronoun"` joke — load-bearing morale.
- 2026-10-11: Shell discipline: content edits to generated files go through the edit tool with read-verified context; byte-level verification via git diff hunks.

- 2026-10-30: Rebrief remainder. The a03690d dirty commit landed the skill patches, the gallery death, Hinder as data, label removals, header consolidation, Hinder part 2, and the features plane. What remained - badge as a trait part, statement-flag derivation, SFX editor retirement, the vocabulary remainder, and the JSON textarea dark variant - is this brief. The phone pass, classic-on-place section 4d, and item 5 follow after, as planned, and are not in this brief.

- 2026-11-01: Supersedes the 2026-10-30 "Rebrief remainder" line's "statement-flag derivation" clause: statement flags were ratified and landed on 2026-10-31 and are not part of this brief. The rest of that line stands.
- 2026-11-01: Rebrief remainder part 2. Completed F1 (badge renders before SFX list), R3 (SFX editor retirement via shared SubtraitEditor), R4 (vocabulary rename: ratingLadder, subtraitRatingLadder, reservedSlots, trackDice, out-badge, ring-grid/ring-items, isPlayMutableSet), and R5 dark badge toggle. Remaining phone pass, classic-on-place section 4d, and item 5 remain out of scope.

### DOM diet: scoped v-show diet + pillar gating; page windowing deferred

Decided: shrink the live DOM in two scoped moves, with no visible change.
(1) Preview-button containers convert v-show → v-if (conditions unchanged):
buttons only, no state, and in Play they are hidden for every non-playMutable
set, so v-if removes them from the DOM instead of hiding them.
(2) JsonEditor v-ifs its textarea on its existing open prop; the draft stays
in a ref and refill-on-open-unless-mid-edit is preserved. The JSON pane div
stays v-show: v-if on the pane would destroy mid-edit drafts.
Explicitly NOT converted: the roller pane (roll results, text log, and tab
selection are component-local refs; unmounting wipes the last roll's record
even though the staged pool, a prop, would survive) and the properties pane
(its editors are already v-if'd by editing type; the idle pane is light).
(3) In pillar Play, the sheet sections (sheet layout, columns, full band,
and the classic-grid-sections region where it exists) gain !isPillarPlay, so
page-1 sets are no longer instantiated twice (sheet block hidden by
display:none + pillar block). The pillar track is untouched and the page loop
is NOT gated (the track lives inside page 1). Sheet scroll position is
preserved across the pillar toggle (record before, restore after re-mount).
Page windowing is DEFERRED, not rejected: it needs a screen page control
(screen has no current-page state; pages scroll, jump pills need targets in
DOM, browser find works across pages today) and must earn its UX cost with
measurement. This brief's before/after node counts (Vanguard + kitchen-sink,
Edit/Play/pillar) are the evidence that decides whether windowing is still
needed. Print renders all pages regardless and is untouched.


### Frame extension (box + arc frames, stroke as width, CSS-variable color/width/dash)

Decided: extend `view.frame` as the single carrier for borders and positional
frames (no `view.border` key).
(1) `box?: boolean` on `FrameConfig`: when `box: true` on a radial frame (`arc`,
`ring`, `ellipse`), the renderer draws both the rectangular box perimeter and
the shape path under one width and one color. Ignored on `block` and `line`.
(2) `stroke` is stroke width (`'1px' | '2px' | '3px'`, default `'2px'`); color
moves to `color` (`'primary' | 'accent' | 'muted' | 'strong' | 'black'`, default
`'primary'`); `dash?: string` sets `stroke-dasharray` (`none` when absent).
Pre-phase-1 files that stored a color token in `stroke` resolve cleanly: if
`raw.stroke` is a color token and `raw.color` is absent, `resolveFrame` maps it
to `color` and defaults `stroke` to `'2px'`.
(3) Styling flows through CSS custom properties (`--frame-stroke-color`,
`--frame-stroke-width`, `--frame-stroke-dash`) on `.frame-color-*` classes.
The `black` token resolves to `#000000` in light mode and print, and `#f1f5f9`
(`--dark-text-main`) under `html.dark-theme` on screen so black frames stay
visible on dark cards.
(4) (2026-11-12) `frame.color` accepts `secondary` and arbitrary CSS hex
colors (`#rgb` / `#rrggbb`) via `.frame-color-custom` (`--frame-color`) in
addition to the 5 base tokens; unrecognized non-hex strings continue to warn and
fall back to `primary`. Editors also expose `view.tint` (block frame fill),
`view.primaryColor`, `view.secondaryColor`, `view.accentColor`, and `diceConfig`
unfilled outline/numeral colors.


### Retire `view.style.sheet` as a behavior switch

Decided: retire `view.style.sheet` (`'classic' | 'spotlight'`) across the corpus,
validator, runtime, and editors. Supersedes the 2026-10-12 `view.style.sheet`
and `NAME_HIDDEN_IN_SPOTLIGHT` entries above.
(1) Sheet assembly is unified in `character.vue`: every page renders unplaced
column sets (`.columns`), placed grid sets (`view.place` via
`.sheet-layout.classic-grid-sections`), and unplaced full-width sets
(`.classic-full-band`) from the same template path without branching on sheet
style.
(2) Corpus rewrite: all 28 Library templates in `js/templates.js` and
`data/templates/*.template.layered.json` (plus `js/showcase-templates.ts` and
`defaultCharacter`) drop `view.style.sheet` and state their presentation
explicitly on each element: header portraits carry `portrait.view.location:
'header'`, hidden name-set traits (`game`, `plotPoints`, `notes`) carry explicit
`view: { visibility: 'hidden' }`, and framed sets carry explicit `view.frame`
configs (`shape: 'block', span: 'box', corner: 'square', stroke: '2px', color:
'black'`, with `header: 'sidebar'` where applicable).
(3) Ungated features: header vs column portrait renders from
`portrait.view.location === 'header'`; ring traits render whenever a set has
`ringTrait: true` or `body === 'portrait-ring'`; nickname renders from
`hasNickname`; name-set traits default to `'shown'` (`NAME_HIDDEN_IN_SPOTLIGHT`,
`defaultNameHidden`, and `resolveSheetStyle` are deleted); set editor layout and
frame controls are available on all sheets; and the style toggle is removed from
both the Sheet editor and the Print toolbar. `scripts/validate.js` rejects
`view.style.sheet`.


### Name block as a set (`96cb5f4`)

Decided: the name block is an ordinary set. It can render anywhere on the page
via `view.place`, can be placed or unplaced, and can be hidden via `view.visibility`.
The only limitation is that the name block cannot be deleted, because runtime
and shell hooks depend on its presence (e.g., document title, roster identification).
Portrait presentation unifies through the existing `image` style rather than
treating portrait as a bespoke hard-coded region.


### Place wins: Retire location, track, and span (`ca713e4`)

Decided: place wins. A set's position on the page is expressed solely through
`view.place` (`{ left, top, width, height }`). The classic column language retires:
`location`, `track`, `span`, `colSpan`, and `columnSpan` are removed from the
runtime layout path. Unplaced sets render full-width across page columns in
document order.


### Mechanical consolidation (957dbda & follow-up)

Decided: consolidate redundant and single-use trait-set bodies into general
mechanisms (`die-rows`, `parts`, `frame`):
(1) `dice-ladder` merges into `die-rows`: vertical rungs and ladder track styling
are preserved via `view.ladder: true` (`.trait-die-rows.ladder`), with `ks-growth-ladder`
reverted to canonical ID `ks-dice-ladder`.
(2) `sfx-rows` dissolves: all 25 distinction sets resolve directly to prime
pillar (`view.pillar: 'prime'`) and render via standard flex list rows with
existing SFX badge and child rendering.
(3) `boxed-rows` dissolves: "Signature Assets" expresses its boxed appearance via
`view.frame: { box: true }`.
(4) `notes` dissolves: sets with unstructured notes convert to single description-only
rows using `view.parts: { description: { left: '0%', top: 0, width: '100%', height: 1 } }`
under the play pillar.
(5) `paired-slots`, `three-column-table`, and `labeled-fields` dissolve to `view.parts`:
  - `labeled-fields` (22 sets) → stacked name above description (`name` row 0, `description` row 1).
  - `paired-slots` (3 sets) → side-by-side name and statement (`name` left 0%, `child:Statement` left 50%).
  - `three-column-table` (7 sets) → 3-column parts grid (`name` 28%, `description` 33%, `child:SFX` 39%).
  The three bespoke components (`trait-set-paired-slots.vue`, `trait-set-three-column-table.vue`,
  `trait-set-labeled-fields.vue`) are deleted.
(6) SFX editor dissolves into the group editor: `trait-set-editor-sfx.vue` is deleted;
SFX children remain fully editable via `SubtraitEditor` in `trait-editor.vue`.
(7) Retired bodies (`distinctions`, `attributes`, `sfx-rows`, `boxed-rows`, `notes`,
`paired-slots`, `three-column-table`, `labeled-fields`) are dead and validated as errors
by `scripts/validate.js`.
(8) Badge printing: `.badge` rules in `css/print.css` enforce `print-color-adjust: exact`
so that background colors (black, primary, interactive, secondary, muted) and white text
remain fully legible in print and economy print modes.

### Editor unification (Rule of 3)
- 2026-11-07: Unify trait/subtrait editing (Rule of 3): top-level trait sets, traits, and child traits follow an identical 4-stage hierarchy: (1) Identity (name first, then description), (2) Rating (type picker `Die | Dice | Counter | Pip` then scale/value), (3) Parts & Behavior (out marker, spendable, pool, etc.), (4) Children (unified "Add Child Trait" control).
- 2026-11-07: Separate statement, attached stress, and counter column checkboxes dissolve: statements are ordinary child traits with Pip rating; attached stress are ordinary child traits with Die rating; counter columns render structurally from `rating.type === 'Counter'` without set flags.
- 2026-11-07: Out marker sits in the scale row as an `[OUT]` glyph toggle chip beside the dice (`[4] [6] [8] [10] [12] [OUT]`). The word at the end of the scale is configured via `endWord` in Parts & Behavior (default "OUT").
- 2026-11-07: Rating-type switching clears values; warns if child values or subordinate data would be wiped; silent otherwise.
- 2026-11-07: `trait-editor.vue` is in scope alongside set and subtrait editors. Subtrait name input is hoisted to line 1 of the child editor block and auto-focuses on open.

### Spotlight dissolve (2026-11-10)
- The word 'spotlight' is dissolved everywhere — the style AND the Library. The Library is simply the Library. 'Spotlight' survives only in descriptive data, never in a field, CSS class, ID, code, file name, or UI string.
- `view.spotlight` → `view.template` at the data layer. The loader resolving the ref looks local first, Library second. No concern for existing characters (no end users yet — no migration, no fallback).
- Listing IDs drop the `spotlight-` prefix (`spotlight-alien-us` → `alien-us`). `size: 'spotlight'` was dead data and is deleted. Orientation (landscape/portrait) is a separate later design decision, not a rename of `size`.

### Kaelri break & Character Curio (2026-11-06, as amended 2026-11-10)
- Break with Kaelri: the repo becomes a standalone orphan (new root commit, loses her own history too) — hers to direct, NOT yet executed. The migration path in the app is DEAD (migration.ts deleted; old-format and Kaelri files are rejected on import). The converter lives INSIDE the TorchliteMonsters repo (two repos total, not three).
- Monsters repo: TorchliteMonsters, CONFIRMED 2026-11-10 (was the leading candidate). The repo has a `character-curio` folder for monster content prepped for Character Curio import — one repo with subfolders for the different destinations. Torchlite first-class support is a scope in itself, for LATER (parked).
- Sendak goes (data/templates/Sendak_Eggers.cortex.json + .layered.json), replaced by The Dreamer & the Architect (see below). The test fixture (`scripts/materialize-tests.js`) is re-pointed at the new example.
- Branding and naming move to Character Curio. 'Cortex' survives ONLY in license/attribution or similar descriptive text — no fields, no classes, no IDs, no code, no file names, no UI strings. Name form: `character-curio` for code (hyphenated), "Character Curio" for UI display. Storage keys BREAK CLEAN (no migration, no fallback). Save ONE Cortex logo for the attribution page; use the favicon (tarot World) for the footer logo. `.cortex.json` → `.curio.json`. `cortex.engard.me` stays for the attribution page.
- Licensing DEFERRED — do not add a license, do not re-raise. Domain purchase DEFERRED — do not re-raise until closer to the new repo's initial commit; the live app stays at characters.lynnjones.rocks until DNS + deploy move. Do NOT position as a VTT product; scope is characters AND solo play, could branch to room/multi-player.
- Day-1 goal: get ULTRA TIDY for a day-1 commit into the new home (CharacterCurio) — settle the divorce first. Sequencing: font diet, then prep for the move begins (CharacterCurio + TorchliteMonsters).

### The Dreamer & the Architect (2026-11-10)
- The new example character, replacing Sendak (and superseding The Scrivener). A tarot-card display, intentionally — two circular portraits, leader lines, centered composition. Three sets. "The Architect" (noun Distinction): portrait ring (De bouwmeester, 1919, Rijksmuseum) with 3 ring traits (Line, Light, Space — d10) + 3 distinctions (Function Before Form, Less is More, All My Darlings are Dead — d8). "Values" is the SINGLE shared set: Data (d8) "belongs to the people, not the builders", Design (d6) "what is built is but inspiration", Service (d10) "your fee is yours to set, mine is free". "The Dreamer" (noun Distinction): portrait (Corot, The Dreamer at the Fountain, 1855–63) + 3 distinctions (Beauty is all around us, I'll have another slice, Come darling, let's have tea — d8). The six persona traits are Distinctions, not Values.
- Surfacing: the example loads on splash but fades away when the user has their own saved characters — first run (no saved characters) auto-opens it as a template preview (not saved, with "Use this template"); once a saved character exists the app opens the user's character instead and the example stops auto-opening and leaves the roster, but stays in the Library.

### Retire trait ownership (`usableBy`) (2026-11-12)
- Trait ownership metadata (`usableBy`, `UsableBy`, `Party`) is retired. Various SFX allow players or opposition to pull dice from any trait, and there is no intuitive way to pre-assign ownership routing cleanly in Play mode.
- The Play-mode roller keeps explicit Player vs Opposition pool targets; schemas and helpers must not carry `usableBy` fields or ownership helpers.

## Open (decisions needed)

- (none pending)

## Corrections

- (2026-11-11) Schema of reference: `cortex.engard.me` is deprecated and is NOT the schema of reference. Schema URLs (`$schema` markers, `TEMPLATE_SCHEMA_URL`, schema `$id`s) point at `characters.lynnjones.rocks/schema/0.1/` (or repo-relative paths for in-tree data). This supersedes the engard URL usage implied above; engard remains ONLY for the attribution page. `data/templates/Dreamer_Architect.curio.json` was completed to satisfy the current character schema (dates, plotPoints, notes, tags, set ids/plurals/descriptions, trait descriptions/tags, empty-object portrait).
