# Trait Layers — the boiled-down model
2026-10-10. Everything is traits, all the way down. Layers merge by name
with one mechanism: the sparse three-state recursive merge
(absent → inherit · null → cleared · value → override wins).

## Defaults — the universal trait shape
Every trait is this. Specify only what differs.

```
trait: {
  name:      ...,   // join key
  type:      text,  // text | number | choice | ...
  label:     = name,
  example:   null,
  editable:  true,
  hidden:    false,
  cost:      null,  // PP cost to use — the complications hook
  rating:    null,  // die rating
  value:     null,  // the value
  options:   null,  // for type: choice
  traits:    [],    // subtraits — recursive

  addToRoller(): rating   // behavior: how it enters the pool
}
```

Behaviors (`addToRoller`) live in code, keyed by trait — JSON carries data.

## Layer: base — the name block, as traits

```
Name:  { label: "Character Name", example: "e.g. Maya Lin, Vance Astro" }
game:  { label: "Game",           example: "e.g. Torchlite, Bewilderwood, ..." }
call:  { label: "Sign",           example: "e.g. Apex, Kid" }
$noun: { value: "pronoun" }   // a pronoun IS a noun-reference :)
style: { type: choice, value: Spotlight, options: [Spotlight, Trait Halo] }
```

## Layer: character — values only, maximally sparse

```
Name: Dan
game: Torchlite
```

`{name, value}` pairs. Everything else falls through to base via merge.
Type less, edit less, read less.

## Layer: layout — sets are traits too

```
sets: [
  Distinctions: { sfx: [Hinder], traits: [...] },
  ...
]
```

## The merge

```
rendered = merge(defaults, base, template?, character)
```

One mechanism at every boundary. The template system (`sheet.template`)
is just another layer in the stack — the decision brief's merge semantics
*are* the layer semantics. `nameBlock.json` was the base layer;
`newCharacter.json` was the character layer; this doc is the realization
they were never two different things.

## The merge is open-ended: merge(...layers)

Not a fixed stack — an ordered list. Later wins. The merge doesn't know or
care about roles; it only needs the order.

```
merge(...layers: Layer[])   // bottom → top, least local → most local
```

The table below is the *default composition*, not the signature. The app
assembles the array per render context:

```js
layersFor(entity) = [
  systemDefaults,        // the universal trait shape (layer 0, reserved)
  baseLayer,             // data/nameBlock.json — name-block fields as traits
  gameLayer(entity),     // from entity.game — the layer named entity.game
  challengeLayer(entity),// from entity.challenge — iff the dice string is present
  typeLayer(entity),     // from entity.type — the layer named entity.type
  templateSnapshot(entity), // pinned template version, if linked
  campaignLayer(entity), // GM — if joined to a campaign
  entity.tree,           // player — the local user, always last
].filter(Boolean)

rendered = merge(...layersFor(entity))
```

One type: a layer is a layer. The merge never knows game from challenge
from template — each is an ordered trait-tree, and `merge(...layers)` folds
them. Entities reference their layers by field — no namespaces, no separate
`layers` array for the standard case. The field determines the role; the
value names the layer:

```json
{
  "name": "Adult Gold Dragon",
  "game": "Torchlite",
  "type": "Torchlite Monster",
  "challenge": "5d10",
  "sets": { "Drives": { "traits": { "...": "d8" } } }
}
```

- `game: "Torchlite"` references the game layer named "Torchlite" —
  usually just the label. Shallow, as it should be. (It's also the
  name-block trait, so editing the Game field re-points the layer.)
- `type: "Torchlite Monster"` references the layer named "Torchlite
  Monster" — the structural layer (sets, selection rules, presentation).
  **Type is layer:** the field names the layer that defines what the entity
  is. One classifier, called `type`. No `kind` — it said the same thing twice.
- `challenge: "5d10"` references the challenge mechanics layer — and carries
  the dice. Same double-duty pattern as `game`.

This gains us, all outside the merge:

1. **Shared addressing** — the challenge layer is referenced by 317 files,
   not duplicated into them.
2. **Order for free** — fields have a conventional order (game < type <
   template < campaign), so entities don't hand-order layers.
3. **Identity for pinning** — a versioned template ref; snapshots and update
   prompts hang off the ref.

Everything else — "the Designer authors this," "the player wins" — is human
convention documented here, not machinery. (The layer store namespaces
internally by field — `game:"Torchlite"` and `type:"Torchlite"` would be
different layers — but the JSON stays clean.)

What open-endedness buys:

- **New layer kinds without new machinery.** House-rules layer, event
  layer, *scene* layer (scene traits resolve for everyone at the table the
  same way), party layer — each is just another entry in the array.
- **Multiples of a kind.** Two templates? Two campaigns in a crossover?
  Ordering handles it; no special cases.
- **Per-context composition.** `layersForPrint`, `layersForRoller` —
  print can inject overrides without touching the sheet.
- **Mobs/bosses/challenges** become characters with a different
  composition (game + mob template + mob), not a different data model.
  The parked naming question rides on this when you unpark it.

Invariants that do NOT open up: the merge *semantics* (three-state,
name-join, recursive) and layer 0 (system defaults — overridable in
theory, reserved in practice). Version pinning and snapshots live at the
*composition* step (which layers are included), not in the merge.

## Conventional fields & authors

Layers are referenced by field. The field determines the role; the value
names the layer. (`defaults` and `base` are system-prepended, no field;
the entity's own tree is the player layer, always last.)

| Field | Author of the referenced layer | Carries | Also is |
|---|---|---|---|
| `game` | **Designer** | game identity — usually just the label | name-block trait |
| `type` | **Designer** | structure: sets, selection rules, presentation | — |
| `challenge` | system | challenge dice mechanics (roller semantics, spendable as informal resource) | the dice string (data) |
| `template` | template author | starting content (pinned version) | — |
| `campaign` | **GM** | campaign dressing: watermark, house rules | — |

### Dice notation

Challenge dice are compact table notation, not arrays: `"5d10"`,
`"2d10d8d6"` (damaged), `"d8"` (single — count of 1 omitted). Canonical
form: descending die size, count prefix, no separators — though spaces
between dice are allowed (`"2d10 d8 d6"`) and ignored by the parser.
It parses deterministically by tokenizing against known die sizes
(d4, d6, d8, d10, d12, d20) — so `"d122d10"` reads as d12 + 2d10, never d122.
Pool operations (step down, spend, roll) are multiset operations; no die
needs individual identity, which is why the array bought nothing.

Precedence rule: **the most local author wins**. For a character sheet, the
player's character layer is the most local thing there is — so a GM's
campaign watermark shows unless the player sets their own, and the
Designer's `game: Torchlite` fills the game field unless the player writes
their own. Same "local user wins" you've always had; now it scales to every
author.

## Layer: game — the Designer (shallow)

```
game: Torchlite
```

That's usually the whole layer: the label. Game identity, nothing
structural. (It's also the name-block trait, so editing the Game field
re-points the layer.)

## Layer: challenge — the Designer (structural)

```
sets: {
  Drives:           { ... },
  Signature Assets: { ... },
  SFX:              { ... },
}
```

The Designer defines what a Torchlite challenge *is* in the layer named
by the entity's `type` field: which sets exist, their SFX, their selection
rules. Templates and monsters join into these sets by name. No new
machinery.

## Layer: campaign — the GM

```
watermark: { url: "torchlite-logo.png", opacity: 0.15, scale: 80 }
```

The GM layers campaign dressing over the game. Rendered watermark =
merge(campaign.watermark, character.watermark) — the player's own watermark
wins if set, otherwise the campaign's shows through. Additive by default,
overridable by the most local author.

## File mapping

- `defaults` → in code (it *is* the trait schema)
- `base` → `data/nameBlock.json`
- `game` → `data/games/<game>.json` (Designer-authored)
- `template` → template library
- `campaign` → campaign file (GM-authored, shared with the table)
- `character` → the character file (was `newCharacter.json` at creation)

## Name-join is path-scoped — the SFX collision

Same name at different levels is expected, not ambiguous. The join key is
the full path (parent chain + name), never the bare name.

```
Distinctions (set)
├── SFX (trait)                      →  /Distinctions/SFX
│   └── Hinder
├── Lively Performer (trait)
└── Chief Engineer (trait)
    └── SFX (trait)                  →  /Distinctions/Chief Engineer/SFX
        ├── Hinder
        └── Push Ship  (cost: step up Energy Stress)
```

```json
"Distinctions": {
  "traits": {
    "SFX": { "traits": { "Hinder": {} } },
    "Lively Performer": { "label": "Persona", "value": "d8" },
    "Chief Engineer": {
      "label": "Profession", "value": "d8",
      "traits": {
        "SFX": { "traits": {
          "Hinder": {},
          "Push Ship": { "cost": { "stepUp": "Energy Stress" } }
        } }
      }
    }
  }
}
```

Each `SFX` merges only with the `SFX` at its own path across layers.
Contrast the dragon: its TWO sets named "SFX" sat at the SAME path
(entity root) — that was the genuine collision, now structurally impossible
in map form. `type: set` dissolves too — position under `sets` vs `traits`
is the type marker.

Note the cost vocabulary converging with the dragon conversion:
`{ "stepUp": "Energy Stress" }` alongside `{ "stepDown": "Legendary Resistance" }`.

- `cost` is where the assets/complications model hangs its price: assets
  are free to their handler, complications cost the opposition.
- `$noun` reserves the `$`-prefix convention: a trait whose value references
  another trait. Today it's a joke with a default. Tomorrow it might be real.
- New layers slot in without new machinery: a `scene` layer, a `campaign`
  layer — all traits, all merged the same way.
```


## Example composition: Kaelri monster

```
merge(defaults, base, Torchlite, challenge, Torchlite Monster, monster)
```

- `game: "Torchlite"` → the game layer (Designer). The label — game
  identity, nothing structural.
- `challenge: "5d10"` → the challenge mechanics layer (dice semantics,
  spendable as informal resource) — *and* the dice data. Same double-duty
  pattern as `game`: the field's presence pulls the layer.
- `type: "Torchlite Monster"` → the structural layer: sets (Drives,
  Signature Assets, SFX), selection rules (`select`/`requiresSelect`/
  `usableBy`), stat-block presentation. The empty Attributes set lives
  nowhere: it was dead in all 317 files.
- `monster`: sparse values — refs + local overrides (the dragon JSON).

A scene composes without the challenge layer — no dice, no mechanics:

```
merge(defaults, base, Torchlite, Torchlite Scene, scene)
```

**Classification decision (2026-10-10):** all 317 Kaelri monsters are
`type: "Torchlite Monster"` with a `challenge` dice string — the type names
the structural layer, the challenge field pulls the mechanics layer (and
carries the dice). One classifier, called `type`; no `kind`. The Cortex
Prime mob/boss/challenge mechanical nuances (core die step-down and
elimination vs. taking complications, turn order) are table rulings, not
schema.

## Phase-1 freeze (2026-10-11, from DECISIONS.md items 1–10)

Merge: null deletes. A null key is emitted iff a less-local layer has the
trait and the local layer clears it. Deleting the null re-inherits.
Removals are local nulls. `removedTraits` and `removedSets` are gone.
Envelope stays file-level. `id`, `version`, dates, `isTemplate`,
`sheet`, `prefs` ride beside the entity, never inside traits.
No-ids was always trait-level. Trait and subtrait objects never carry
`id` or `_lid`.
Entity top level: `name`, `game`, `type`, `pronouns`, `description`,
`portrait`, `plotPoints`, `notes`, `tags`, `sets`. Game, type, and
challenge keep their layer-reference double duty.
Layout lives in the type layer. `nounSingular`, `ratingPosition`,
columns, styles, and other presentation settle on the type layer.
A set object may carry a per-entity override. Content layers carry dice
and text only.
SFX is a traits map. Old `sfx` arrays become `traits` under an `SFX`
node. `Hinder` is one trait there. Path scoping keeps each `SFX`
addressable.
`custom` stays app-side. App settings never enter entity JSON.
`sheet.template` is a merge layer. The template reference joins the
`merge` stack with pinning and explicit switch, per the template rules.
Ratings are dice strings. A trait rating may be `"d8"` or a pool such
as `"3d6"`. Parse with `parseDice`. Canonical form per the dice rules.

## Presentation-layer content model (from the 26-template corpus, 2026-10-11)

All 26 spotlight templates migrate round-trip-exact
(`scripts/template-parity-tests.js`, 143 assertions). A presentation layer
carries, verbatim: set `id`, display name (`label` when the map key is a
suffixed duplicate such as `GMC~2`), description, nouns, rating position,
statement flags, counter column, and `custom.cortexToolkit` (features,
location, page, header/body styles, rating scales, multi-die flag, stress
config, notes, reserved slots, column widths and breaks, spans, ring flag,
shared-hinder banner). Character envelope beside it: name, game, pronouns,
plotPoints, notes, portrait, player, sheet-level custom (columns,
watermark, alignment, offsets).

Placeholders are positional: `slots` objects keyed by 0-based index in the
full trait order, at set, trait, and SFX levels. Blank SFX rows live in
SFX slots. Duplicate set names (repeated worksheet blocks) take suffixed
keys with the display name in `label`; trait-level duplicates remain
forbidden. SFX is unified under `traits.SFX`, including slot-bearing SFX.

Not yet in data: no template authors `select`, `requiresSelect`, or
`usableBy` — the defaults rule (owner, any, no-require) holds everywhere.
No template carries multi-die ratings — the pool shape
(`{ "value": "2d8d6", "pool": true }`) is defined but unproven on real
data. No subtrait sits below depth 1; no blank subtraits exist. Trait
`custom` is empty everywhere it appears.
