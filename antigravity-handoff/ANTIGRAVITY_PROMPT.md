# Antigravity Task Brief — Cortex Toolkit Audit, Mobile/A11y, & Template Parity

Read `AGENTS.md` and `design/DECISIONS.md` before starting. Execute the following tasks in order, keeping `npm run check`, `npm test`, `npm run validate`, and `npm run build` green at each step.

---

## Task 1: Replace `AGENTS.md`
1. Copy the updated `AGENTS.md` from this handoff bundle into the repository root `AGENTS.md`.

---

## Task 2: Code Quality & Hygiene (`js/functions.ts`, `js/layered-materialize.ts`, `js/migration.ts`, CSS)
1. **Replace `JSON.parse(JSON.stringify(...))` with `structuredClone`:**
   - In `js/layered-materialize.ts`: replace `const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v)) as T;` with a helper that unwraps Vue proxies if present (or uses `structuredClone(v)` directly since `layered-materialize.ts` is also imported by Node test scripts without Vue runtime: if `v` is a proxy or plain object, `structuredClone` works natively on plain objects; in Vue components/functions where reactive objects may be passed, use `toRaw` from `'vue'` or a safe `structuredClone` wrapper).
   - In `js/functions.ts` and `js/migration.ts`: replace all `JSON.parse(JSON.stringify(...))` calls with a shared `cloneDeep` helper using `structuredClone`. Note: ensure Node test scripts (`npm test`) continue to pass without errors.
2. **Fix duplicate SVG `<linearGradient>` IDs in `js/functions.ts` (`renderDieconSVG`):**
   - Currently `gradId` only hashes `s` (die size), causing duplicate DOM IDs when multiple dice of the same size render.
   - Hash `${s}-${cfg.backgroundColor1}-${cfg.backgroundColor2}-${cfg.gradientAngle}` into a deterministic short alphanumeric slug for `gradId`.
3. **Remove dead `.designer-print-preview` & `.designer-print-banner` CSS:**
   - Per `design/DECISIONS.md` (2026-10-12: "kill designer preview"), remove the dead `.designer-print-preview` and `.designer-print-banner` selectors from `css/_character.scss` and `css/_spotlight-print.scss`.

---

## Task 3: Accessibility (a11y) Improvements (`js/functions.ts`, `css/app.scss`, Vue components)
1. **Screen-reader labels on Die Glyphs:**
   - In `js/functions.ts` (`renderInlineMarkdown`): add `role="img" aria-label="d4"` (and `d6`, `d8`, `d10`, `d12`) to the `<span class="c">` replacements so screen readers do not read `0` for `d10` or `2` for `d12`.
   - In `js/functions.ts` (`renderDieconSVG`): add `role="img" aria-label="d${s}"` to the `<svg>` root element, and `aria-hidden="true"` to the inner `<text>` element.
2. **Keyboard Focus Outlines (`css/app.scss`):**
   - Add global `:focus-visible` styling so keyboard users can see focus on buttons, inputs, selects, textareas, and `[role="button"]` elements:
     ```scss
     button:focus-visible,
     [role="button"]:focus-visible,
     input:focus-visible,
     select:focus-visible,
     textarea:focus-visible {
       outline: 2px solid var(--color-interactive);
       outline-offset: 2px;
     }
     ```
3. **Interactive Sheet Semantics:**
   - Add `tabindex="0"`, `role="button"`, and `@keydown.enter.prevent` / `@keydown.space.prevent` handlers alongside `@click` on `.trait-inner`, `.editor-values li`, `.pip-bubble-wrap`, and `.statement-pip`.

---

## Task 4: Mobile Experience & Print-Tab Visual Parity (`css/_editor.scss`, `css/_roster.scss`, `css/_spotlight-print.scss`, `css/_variants.scss`)
Apply the rules in `patches/parity-mobile-a11y.scss`:
1. **Mobile Editor Scrollable Height (`css/_editor.scss`):**
   - Inside `@media (max-width: 768px)` on `.editor`, override `&.scrollable { height: auto !important; }` so the bottom-sheet editor does not collide with virtual keyboards.
2. **Mobile Roster Item Layout (`css/_roster.scss`):**
   - At `@media (max-width: 600px)`, shrink the portrait column (`flex: 0 0 5rem`) and allow `.roster-item-name { white-space: normal; }` so character names and action buttons don't clip off-screen on 360px–390px phones.
3. **Mobile Print-Tab Proportional Zoom (`css/_spotlight-print.scss`):**
   - Add `@media screen and (max-width: 768px)` zoom scaling on `.character-sheet.submode-print .pages` (`zoom: 0.45` at `<= 520px`, `zoom: 0.62` at `521px–768px`) so the locked A4 desktop grid scales to fit mobile screens without requiring massive horizontal scrolling.
4. **PDF Print Visual Parity Fixes (`css/_spotlight-print.scss`):**
   - **Restore Table Row Dividers:** In `.character-sheet.spotlight-print-style`, `.trait-set-style-die-rows .trait` and `.trait-set-style-three-column-table .trait` set `border-bottom: none`, which accidentally strips the row border from `.die-row.trait` and `.three-col-row.trait`. Restore crisp `border-bottom: 1px solid #000000` on `.die-row:not(:last-child)` and `border-top: 1px solid #000000` on `.three-col-row`.
   - **Blank Sheet Mode (`print-blank-mode`) SVG Diecon Outlines:** When `.print-blank-mode` is active on `.character-sheet`, force `.diecon-filled polygon, .diecon-filled rect { fill: none !important; stroke: #000000 !important; }` and `.diecon-filled text { fill: #000000 !important; }` so pre-rated dice print as hollow write-in outlines.
   - **High-Contrast Print Borders for `dice-count`, `subtrait-columns`, `dice-ladder`, and `labeled-fields`:** Override `color-mix(in srgb, var(--color-primary)...)` borders with crisp `#000000` borders under `.character-sheet.spotlight-print-style`.

---

## Task 5: Eidolon Alpha Template Parity (`data/templates/eidolon-alpha.template.layered.json` & `js/templates.js`)
1. Copy `data/templates/eidolon-alpha.template.layered.json` from this handoff bundle into `data/templates/eidolon-alpha.template.layered.json`.
2. Update the `spotlight-eidolon-alpha` entry in `js/templates.js` so it is the exact unmigrated array equivalent of `data/templates/eidolon-alpha.template.layered.json` (use `unmigrateTemplateEntry` in `js/migration.ts` to generate the exact `js/templates.js` entry so `scripts/template-parity-tests.js` and `scripts/validate.js` pass with 0 diffs and 0 warnings!).
3. Check the Eidolon Alpha visual layout improvements in `js/trait-set-list.vue` and `css/_spotlight-print.scss`:
   - Left-align stacked trait titles (`.trait-title-stacked`) when `ratingPosition === 'below'` in Spotlight print style (`Roles` and `Attributes`).
   - Format `.attached-stress-block` as a compact inline U-bracket row (`STRESS` label on the left, stress dice on the right) under each Attribute.
   - Support vertical pips (`perRow: 1`) in `trait-set-pips.vue` / `css/_spotlight-print.scss` with a vertical connecting spine line when `perRow === 1`.

---

## Task 6: Add the "Kitchen Sink" Showcase Template
1. Copy `data/templates/kitchen-sink.template.layered.json` into `data/templates/kitchen-sink.template.layered.json`.
2. Use `cortexMigration.unmigrateTemplateEntry` to add the corresponding `spotlight-kitchen-sink` entry into `js/templates.js` (or keep it as an importable fixture if `template-parity-tests.js` asserts an exact count of 26 spotlight templates — if `template-parity-tests.js` checks the count, update the expected template count in `scripts/template-parity-tests.js` from 26 to 27).
3. Run `npm run validate`, `npm test`, `npm run check`, and `npm run build` and verify all gates are 100% green.
