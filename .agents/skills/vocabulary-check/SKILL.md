---
name: vocabulary-check
description: >-
  Audit every JSON key, view property, layout style ID, node field, and branding term against the current Character Curio vocabulary before data or examples ship. Use when authoring or reviewing templates, presets, trait sets, schemas, or example JSON.
---

# Vocabulary Check

Check all new or edited JSON, schemas, templates, and example payloads against the live Character Curio data model (`js/model.ts`, `js/sheet-grid.ts`, `js/use-trait-set-editor.ts`, `schema/0.1/*.schema.json`, `scripts/validate.js`).

## Branding and file conventions

- **App & format identity**: `character-curio` / `"Character Curio"`; character files end in `.curio.json`; storage keys are `characterCurioData` and `characterCurioRollLog`.
- **Schema references**: `https://characters.lynnjones.rocks/schema/0.1/...` or relative `../schema/0.1/character.schema.json`.
- **External URLs & attribution**: `'cortex'` is used only for system attribution; DriveThruRPG image URLs stay verbatim; keep all code, JSON keys, and docs free of retired naming.
- **Canonical reference character**: `data/templates/Dreamer_Architect.curio.json`.

## Live layout & `view` vocabulary

- **`KNOWN_PARTS` (`js/sheet-grid.ts`)**: `name`, `rating`, `description`, `badge`, `block`, `subtraits`, `trackLabel`, `track`, and dynamic `child:<Name>`.
- **Active `view.style.body` IDs (`js/use-trait-set-editor.ts`)**:
  - Structural & sheet layouts: `default`, `name` (identity set), `portrait-ring`, `two-columns-compact`, `two-columns-detailed`, `pool-rows`, `dice-count`, `subtrait-columns`, `die-rows` (paired with `view.ladder` when ladder display is desired), `die-track`, `list`, `image`, `pips`.
- **Live `view` keys & strict disambiguation**:
  - Frame & placement: `view.frame` (`shape`, `span`, `traitsSpan`, `ring`, `color`, `image`), `view.place`, `view.columns`.
  - Ring controls: `view.ring` (`boolean`, on a trait) and `view.ringConfig` (on a trait set).
  - Style & parts: `view.style` (`body`, header/layout config), `view.parts`, `view.ladder`.
  - **Disambiguation rules**:
    - `span` belongs **only** inside `view.frame.span` / `view.frame.traitsSpan` — never at set top level or directly under `view`.
    - `track` and `trackLabel` belong **only** inside `view.parts` — never as standalone set properties.

## Live node-level mechanics

- **`rating`**: `{ type, value, range?, out? }` (`range` for ranged/step-up traits; `out` for shut-down state).
- **Dice & pool modifiers**: `hitches` (numeric; `0` = apart-rolling), `keepsExtra`, `pool`, `spendable`, `select`, `requiresSelect`.
- **Metadata `tags`**: Optional array on Character, Portrait, TraitSet, Trait, or Subtrait; every tag must match `/^[A-Za-z0-9-./]+$/`.
- **Child trait conventions**: Child sets named `"SFX"` or `"Statement"`, plus companion stress patterns, represent nested mechanics without separate hardcoded node schemas.

## In transition (read-supported, do not emit in new data)

- `view.features`
- Set-level `statement` / `hasQuestionedPip`

