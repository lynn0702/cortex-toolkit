---
name: mobile-verdict-separation
description: >-
  Keep desktop gate checks, runtime browser smoke runs, and visual or geometric rendering verdicts strictly separate. Use when verifying mobile, responsive, print, layout, or CSS geometry changes, or when reporting rendering checks.
---

# Mobile Verdict Separation

Never conflate build/test pass status with runtime execution or visual geometry proof. Report each verification tier under its own exact scope and evidence.

## The three distinct verification tiers

1. **Desktop gate (`npm run gate`)**
   - Covers the 7 automated checks in `scripts/gate.js`: Production Build, Code Style (`prettier`), Type Check (`vue-tsc`), Test Suites (`vitest` + Node suites), Schema & Corpus Validation, Security Audit (`v-html` scan), and Icon Subset Coverage.
   - **Proves**: Compilation, types, unit logic, schema conformance, template security, and icon coverage.
   - **Does NOT prove**: Layout, overflow, touch ergonomics, font rendering, mobile deck behavior, or print fidelity.

2. **Runtime browser smoke (`npm run smoke` / `node scripts/smoke.cjs`)**
   - Runs headless Chromium at desktop (`1440×900`) and mobile (`390×844`) viewports across Splash → Edit → Play/Roller → Print → Roster.
   - **Proves**: App boot, navigation flows, zero console/page errors, and zero remote font CDN requests (`0` external requests).
   - **Does NOT prove**: Visual alignment, clipped labels, overlapping controls, or clean typography unless paired with visual inspection or bounding-box assertions.

3. **Visual and geometric verdict (`npm run smoke -- --shots`, DOM geometry checks, or real browser inspection)**
   - **Proves**: Actual rendered appearance, bounding boxes, tap targets, scroll containment, and print page fit.
   - **Required for any claim about layout, spacing, wrapping, overlapping, or mobile usability.**

## What visual checks must inspect in this app

- **2D Mobile Pillar & Stack Deck (`<= 768px`)**: `.mobile-set-jump-strip`, `.mobile-substack-bar`, and `88vw` pillar columns scroll smoothly without horizontal page bleed or clipped headers.
- **Mobile roller & outcome dialog**: Sticky `.mobile-roller-pill-bar` stays reachable above content and top-layer `<dialog id="rollDialog">` opens centered/full-sheet without body scroll lock issues.
- **Ring overlay & portraits**: Portrait frame alignment, `view.ring` chip placement, and ring-overlay visibility stay legible at both `1440×900` and `390×844`.
- **Print mode & horizontal scroll lock**: `.submode-print .pages` (`zoom: 0.8125`) fits or scrolls cleanly inside its container with zero accidental document-level horizontal overflow.

## Verification discipline

- **Independent reference values**: Compare geometry and math against independently computed reference values (hand-calculated math or specification ground truth), never by copying numbers from the implementation under test.
- **State unverified tiers honestly**: If you ran `npm run gate` and `npm run smoke` without inspecting `--shots` screenshots or DOM bounding rects, report runtime smoke as `[PASS]` and visual layout as **not visually inspected**.
