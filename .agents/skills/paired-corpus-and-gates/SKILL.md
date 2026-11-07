---
name: paired-corpus-and-gates
description: Change paired files together, wire new files into the build graph, and run the repo Definition of Done before handing work over. Use when changing templates or paired files, adding a file, or finishing any change. Prevents silent non-loading, corpus drift, and unverified handoffs.
---

# Paired corpus and gates

Files in this repo travel in pairs, and a change that
touches one half of a pair without the other is
incomplete. Gates are run by the agent at every ITEM, not
by the reviewer after the fact. In this skill, a turn is one
brief item (or one slice), not one tool call and not one
edit. Running the full suite after every edit is the chew
this revision removes; the item boundary is where the full
suite earns its keep.

## Paired files — change together

- `js/templates.js` and `data/templates/*.template.layered.json`
  are a paired corpus. Template content changes touch both
  sides. Never hand-edit one side and leave the other.
- `js/model.generated.ts` is generated. Never hand-edit it;
  regenerate it.
- Bundles are built, never hand-tweaked. A fix that edits
  a bundle directly will be overwritten and is not a fix.
- New files must be imported into the webpack graph or
  they silently do not load. A file that exists but is
  never imported is not shipped. Check the import graph
  after adding any file.
- Never bind user text with raw `v-html`. Only
  `renderText` / `renderMarkdown` / `renderNotesText` or
  values that are safe by construction. Grep for `v-html`
  before handing over.

## Definition of Done — run at every item boundary, and
## in full before handoff

The agent runs the full gates at every item boundary.
A handoff with ungreen gates is not a handoff; it is a
progress report that says so.

Tiers (all three, no skipping):

- Within an item: no full gates after every edit. Use
  targeted checks only — the test file or files covering
  the change, and editor/type feedback on the touched
  code. If an edit breaks the build, the item-boundary
  gates catch it; that is their job.
- At each item boundary: the full gates — build zero
  errors, type check zero errors, all test suites
  passing, validation zero errors and zero warnings,
  import-graph check if files were added, v-html grep
  accounted for.
- Browser smoke: once per RENDERING item (an item that
  changes what renders on screen or in print), plus one
  final smoke over all affected surfaces before handoff.
  Non-rendering items (data, model) get
  no browser smoke; their proof is gates plus a data
  census. A smoke pass that skips the affected surface
  is still not a smoke pass — batching WHEN it runs
  never narrows WHAT it covers.

- Full gates via `npm run gate`: type check zero errors, build zero errors, test suites all passing, validation zero errors and zero warnings, v-html scan clean.
- Git hooks: `.githooks/` configured (`npm run prepare`) enforcing fast checks on pre-commit and `npm run gate` on pre-push.
- Import-graph check: every new file reachable.
- Browser smoke: roster, editors, Play, reload, and the
  device width the change affects. A smoke pass that skips
  the affected surface is not a smoke pass.

Run the full gate (`npm run gate`) AFTER your last file edit. Do
not edit any file after the final gate run — an edit after the
gate makes the gate's result stale, and a stale gate is not
evidence. Paste the gate's full terminal output (all six `[PASS]`
lines plus `ALL GATES PASSED`) into the session report. A "gate
green" claim without the output is not evidence.

## What gates do not prove

Gates green is not a mobile verdict and not a visual
verdict. Desktop tooling cannot judge geometry, clipping,
alignment, overflow, or real phone behavior. See the
mobile-verdict-separation skill: keep the gate verdict and
the mobile/visual verdict separate in every report, and
name each limit where it occurs.

## Do not

- Hand over work with failing or unrung gates and call it
  done.
- Fix a gate failure by weakening the gate (skipping a
  suite, loosening a validator, deleting an assertion)
  without the user explicitly approving that change.
- Treat a file's existence as its shipment. Unimported
  code does not run.
