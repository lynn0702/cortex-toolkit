---
name: mobile-verdict-separation
description: Keep gate results, mobile verdicts, and visual or geometric claims separate, and require a real browser for anything layout, mobile, or visual. Use when verifying mobile, responsive, print, or geometric work, or when writing test claims about rendering. Prevents desktop gate runs from being reported as mobile or visual proof.
---

# Mobile-verdict separation

Three verdicts, never merged: the code-gate verdict, the
mobile verdict, and the visual verdict. A clean gate run
is never quietly a mobile claim. A passing structure test
is never a geometry claim.

## The rule

- Desktop gates (build, type check, node suites, vitest
  structure tests, validation) prove code correctness.
  They do not prove anything about a phone, a viewport,
  or a rendered shape.
- jsdom has no layout engine. A jsdom test proves
  structure (elements exist, attributes are set, handlers
  are wired). It cannot prove alignment, clipping,
  overflow, letterboxing, corner rendering, or whether
  something is visible at a real width. Never cite a jsdom
  result for a geometric claim.
- Geometric and visual claims require a real browser:
  screenshots, eyeballs, or a measured viewport. That
  includes: anchors landing on a drawn path, tracks not
  clipping, corners rendering as specified, strokes
  rendering as specified (a named stroke that is not a
  real token renders invisible, not as an error), forced-off
  behavior at a real width, print output, and the phone
  deck (carousel, strip, pill clearance, ring-overlay
  visibility).
- The phone pass is the mobile QA. Until it judges a
  mobile change, the mobile verdict is open — no matter
  how green the gates are. The tabs-versus-jump-strip-
  versus-roller-pill judgment, ring-overlay visibility,
  and track and pill clearance in real mobile conditions
  are session evidence, not gate output.

## Test honesty

- A parity test must compare against independently
  computed legacy values. New code compared against
  itself proves nothing: new equals new is not parity.
- A structure test must be labelled a structure test. Do
  not write "visual parity verified" for an assertion
  that never rendered anything.
- When a browser check is required and has not happened,
  the report says so: "browser verification outstanding
  for X," not "verified."

## Reporting

In every report, name each verdict separately and each
limit where it occurs:

- Gates: green / red, with counts.
- Mobile: judged by the phone pass / outstanding / not
  applicable (and why).
- Visual: eyeballed in a real browser / outstanding /
  structure-only.

## Do not

- Write "mobile green," "visually verified," or "parity
  proven" from a desktop gate run.
- Use jsdom output to settle a geometry, clipping, or
  overflow question.
- Let a passing test suite absorb an outstanding browser
  check. The check stays outstanding until a browser runs.
