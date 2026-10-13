# Who can use my traits

Entities are sheets. Zhaf, Scene, Journal, a villain, a mob — same recursive
shape, different layer compositions. The roller holds one pool per sheet.

## Table language

1. **Your traits are yours.** Roll anything on your sheet for free —
   unless the trait itself has a cost.
2. **A cost is a price, spelled out.** Never a bare number — an object
   naming what you pay: a plot point, stepping up a stress, whatever the
   trait demands.
3. **Scene traits belong to the table.** Anyone can roll them.
4. **Stress belongs to the opposition.** Your stress dice are open to the boss.
5. **Everything has a price.** Anyone willing to pay a trait's cost can use
   it — even the boss's SFX, if you pay.

Denying is a price too: some tables let you pay to keep the opposition off
your stress. Same shape, other direction.

## Schema bridge

```
trait: {
  ...,
  usableBy: "owner",   // owner | anyone | opposition
  cost:     null,      // or { plotPoints: 1 }, { stress: { step: 1 } }
}
```

- `usableBy` falls back outward: trait → set → layer → `"owner"`. Set it
  once on the scene layer (`anyone`) or the stress set (`opposition`);
  traits inherit it. No per-trait bookkeeping.
- `cost` is per-trait, always explicit. Paid by anyone `usableBy` doesn't
  cover — and by the owner too, when the trait charges its own.
- Entity kinds are compositions: a scene is
  `merge(defaults, base, game, scene)` with the scene layer carrying
  `usableBy: anyone`; a boss is a character composition in an opposition
  role. Usage defaults ride the composition.

## The roller

- One pool per open sheet; the active pool follows the active sheet.
- Tapping a trait offers its die to the active pool only if the pool's
  owner may use it under the rules above.
- If the trait has a cost, the roller names the price and asks before the
  die enters the pool. No silent charges.

## Examples

| Trait | usableBy | cost | Who rolls |
|---|---|---|---|
| Zhaf's Dutiful d8 | owner (default) | — | Zhaf, free |
| Burning Warehouse d8 (scene) | anyone | — | anyone, free |
| Zhaf's Afraid d8 (stress) | opposition | — | the boss, free |
| Boss SFX "Crushing Blow" | owner | { plotPoints: 1 } | the boss free; Zhaf for 1 PP |

## Selection — how many, who, must you

Cortex's set categories (prime, plus, assets, complications, stress) are
five names for three primitives. Sets carry them; the roller enforces them.

```
set: {
  ...,
  usableBy: "owner",   // WHO selects — falls back outward, default owner
  select:   "any",     // HOW MANY may enter a pool: one | any
  requiresSelect: false, // MUST the pool include one from this set?
}
```

| Cortex term | usableBy | select | requiresSelect | meaning |
|---|---|---|---|---|
| prime | owner | one | true | mandatory select one |
| plus | owner | one | false | optional select one |
| assets | owner | any | false | select any |
| complications | opposition | any | false | opponent may select any |
| stress | opposition | one | false | opponent may select one |

- The Designer sets these once on the game layer's sets; traits inherit
  `usableBy` outward, `select`/`requiresSelect` live on the set.
- The roller validates each pool for the selecting party: `select: one`
  accepts at most one die from the set; `requiresSelect: true` demands at
  least one (combined with `select: one`: exactly one). `usableBy` decides which
  party the rule binds — opposition rules only constrain opposition pools.
- Defaults (`select: "any"`, `requiresSelect: false`, `usableBy: "owner"`) mean an
  unannotated set behaves like today's assets. Layout only where it matters.

## Challenge dice as informal resource

A challenge may spend its core (challenge) dice as a type of resource —
plot-point-like, informal. This is **not** the Resource trait type; don't
confuse them.

## Phase-1 freeze (2026-10-11, from DECISIONS.md items 1–10)

`pool` marks multi-die traits. `{ "value": "2d8", "pool": true }` rolls
every die into the roller on add. Single-die traits omit it.
`challenge` is not a core keyword. Challenge mechanics live in the
monsters repo. Core dice notation serves pools.
Cost is an object, never a bare number. Decided cases: spend plot
points, step a trait up or down, modify the roller pool, narrative
no-op carried by the description. Pool-modification key and narrative
representation stay open.
Selection rides the set. `usableBy` falls back outward with default
`owner`. `select` defaults `any`. `requiresSelect` defaults false.
The Designer sets them on type layers. The roller enforces per pool.
SFX do not inherit. Placement is presentation. An SFX may reference a
trait in another set. No inheritance needed.
