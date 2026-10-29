---
name: measure-before-you-build
description: Verify every constant, key, field, and formula in a brief or spec against the current repo tree before writing code or data. Use when starting implementation from a brief, when a spec asserts CSS values, config keys, viewport math, or geometry, or when data must match the current model. Prevents building from asserted constants that are wrong, stale, or invented.
---

# Measure before you build

A brief or spec that asserts a number, a key, or a formula is
not evidence. The repo tree is. Never copy a constant out of
a brief into code or data. Measure it first.

## Procedure

1. List every asserted fact in the brief that your change
   depends on: CSS values, view keys, function names, part
   keys, ranges, angles, sizes, breakpoints, file paths.
2. For each one, find it in the current tree before you use
   it:
   - Search source, not bundles: `grep -rn --include='*.vue'
     --include='*.ts' --include='*.js' --include='*.scss'
     <term> js css design scripts` — never trust a hit in a
     `.min.js` or bundle file, which may be stale.
   - Read the defining code, not a comment about it. A CSS
     value belongs to the rule that actually renders the
     element; check the selector, not just the number.
   - For data, check a current corpus example in
     `data/templates/` or `js/templates.js`, not the brief's
     example JSON, which may be pre-refactor.
3. If the measured value matches the brief, proceed and say
   so (one line: measured X at <file>).
4. If it does NOT match, stop. Report the mismatch with both
   values and the file that proves it. Do not silently use
   the brief's value, and do not silently use the tree's
   value when the brief's intent is unclear — the mismatch
   is a question for the user, not a choice to make alone.
5. If a fact cannot be measured (it depends on a rendered
   layout, a real viewport, or a visual result), say so
   plainly. Do not substitute an invented number. Route it
   to a real-browser check (see the mobile-verdict-separation
   skill).

## What counts as measured

- A key exists in current code or current data, and you
  opened the file that reads or writes it.
- A CSS value comes from the rule that styles the element
  in question, at the current commit.
- A formula or angle convention comes from the function
  that computes it (for example the ring-angle function),
  not from a spec's description of it.
- A vocabulary claim is checked against the current corpus
  and the current renderer, not against a previous spec.

## Known traps in this repo

- A number in a stylesheet may belong to a different
  component than the brief claims. (The 10px a spec cited
  for classic sets belonged to a stress button, not to a
  trait set.)
- A spec may cite config keys that were renamed. (Legacy
  ring keys in a spec did not match the real `view.ringConfig`
  and `view.ringTrait`.)
- A spec may describe geometry that only holds in one
  container shape. (Radial anchors computed in container
  percentages do not land on a drawn path in a non-square
  container.)
- A spec's example JSON may carry fields that were
  dissolved or renamed. Cross-check with the
  vocabulary-check skill before using any of it.

## Do not

- Copy constants from a brief into code, data, or tests
  without measuring them.
- Treat a previous spec, a previous review, or your own
  memory of the tree as a measurement. Measure at the
  current commit.
- Present an unmeasured value as verified. "Spec says X"
  is not verification.
