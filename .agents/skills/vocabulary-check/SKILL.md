---
name: vocabulary-check
description: Check every key and field in new JSON data against the current cortex-toolkit vocabulary before it ships. Use when writing or reviewing templates, presets, trait sets, or any view data, or when a spec's example JSON looks pre-refactor. Prevents stale, renamed, or dissolved fields from entering the corpus.
---

# Vocabulary check

Vocabulary drift is a defect class in this repo, not a
style nit. Renames and dissolves are total: when a field is
renamed or dissolved, every occurrence goes — code, data,
presets, templates, tests, and docs. A single stale key in
a new file is a defect, even if nothing visibly breaks yet.

## Current vocabulary (check against this, then verify in
## the tree — this list is a starting point, not the law)

Layout areas (view language, never Cortex or set language):
`name`, `rating`, `description`, `block`, `subtraits`,
`trackLabel`, `track`. Renamed from: `sfx` → `block`,
`stress` → `track`, `stressLabel` → `trackLabel`,
`stressDice` → `trackDice`. `includeOut` → `outIndicator`.

Dissolved — these must NOT appear in new data:
- `trait.sfx` (SFX are ordinary child traits, found by
  name, never by a field).
- `attachedStress` as a declaration or in migration
  handling (attached stress is a companion subtrait; the
  declaration is deleted, not deprecated).
- Trait-level `statement` / `questioned` (statements are
  pip child traits; filled means questioned).

Live and NOT dead — do not strip these:
- Set-level `statement` / `hasQuestionedPip` (presentation
  flags that do appear in the layered corpus).
- `features.sfx`, `span`, `header`, track keys, companions.
- `view.frame`, `view.pillar`, `view.place`,
  `view.playMutable`, `view.reservedSlots`,
  `view.labels.pillars`, visibility values `shown` /
  `editor-only` / `hidden` / `play-only`.

Model rules that constrain data:
- Rating shape: `rating { type: Counter | Die | Dice |
  Pip, value: [], range: [] }`; `spendable` and `pool`
  are separate flags; spent state lives in
  `view.spentDice`, never in the rating.
- `range` is the ladder, never `scale`.
- JSON stays hand-editable: sparse storage, nulls allowed
  on optional fields, NO trait-level ids or
  database-management values in exported JSON.
- `custom` is an open extension bag; never emit it empty.

## Procedure

1. For every key in the new data, ask: does the current
   renderer read it, and does the current corpus use it?
   Grep the renderer and one current corpus example.
2. For every key in a spec's example JSON, do the same —
   spec examples are the most common carrier of stale
   vocabulary.
3. If a key is renamed, rename it everywhere the change
   touches (data, code, tests, docs). A partial rename is
   a defect.
4. If a key is dissolved, remove it. Do not reintroduce it
   under a new name, and do not keep a "migration" path
   for it unless the user explicitly asks — in this repo,
   migration is partner import, not legacy support, and
   there is no legacy file carrying the dissolved fields.
5. If a key's status is unclear (live flag versus dead
   field), check the layered corpus and the renderer, and
   ask one question rather than guessing. Stripping a live
   field is as much a defect as shipping a dead one.

## Do not

- Copy example JSON from a spec into data without this
  check.
- Treat a spec's vocabulary as current. Specs go stale;
  the tree is current.
- Ship a new file that mixes current and pre-refactor
  fields.
