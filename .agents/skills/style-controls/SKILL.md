---
name: style-controls
description: The standing controls for styles: no static inline styles, no hardcoded z-index, no new !important, no selector deeper than 3 combinators of effective depth, no hardcoded color outside the palette tokens, px only for boundaries (rem for spacing, % for positioning offsets), no empty rulesets, Prettier-clean. Load it when writing or changing CSS, a Vue template, or any style-adjacent code, and when reviewing a change that touches styles. Prevents the specificity and token drift the CSS diet removed from creeping back.
---

# Style controls

These controls are the diet's aftermath: the CSS diet removed 652
`!important` declarations, flattened the deep selectors, and folded the
palette into tokens. The controls keep them from growing back. A style
change that breaks one of these rules is not a style change — it is a
regression, and it stops the session the way a red gate does.

## The controls

1. **No static inline styles.** A template carries no literal
   `style="..."` attribute. Layout, spacing, and color live in the
   stylesheet as classes, named for what the element IS or DOES, not for
   the declarations they carry. The only `style` a template may carry is
   a dynamic `:style=` binding, and only for a value that comes from
   data at runtime (a portrait background URL, grid placement from a
   `place` value, a watermark). A static declaration inside a `:style=`
   binding is still a static inline style — move it to a class.
   An inline style beats even `!important` in the stylesheet, and the
   print stylesheet cannot override it. That is why it is banned, not
   merely discouraged.
2. **No hardcoded `z-index`.** Every `z-index` is a `var(--z-...)`
   reference. The token scale lives in `css/app.css` `:root`. When a
   layer has no token, add one — named for the LAYER it is, not for the
   number it carries (a token for the layer between the frame and the
   editor, not `--z-950`). A literal that duplicates an existing token's
   value uses that token. A small local value (`0`, `1`, `-1`) that is
   purely ordering inside one component's stacking context may stay
   only with a one-line comment saying why it cannot escape — and the
   comment is the exception, not the rule.
3. **No new `!important`.** The diet drove the count down; it never goes
   up. If a rule needs `!important` to win, the selector it is fighting
   is too specific — flatten that selector instead. A new `!important`
   is a defect, not a fix.
4. **No selector deeper than 3 combinators of effective depth.** Measure
   effective depth: resolve native CSS nesting to the full descendant
   selector first (use a real CSS parser, for example PostCSS), then
   count combinators. A text-level count on nested CSS undercounts and
   is not evidence. If a selector must stay deeper than 3, the reason
   goes in the session report — the exception is reported, never silent.
5. **No hardcoded color outside the palette tokens.** A color in a rule
   or a template resolves through a CSS custom property (the palette
   tokens in `:root` and the theme variables). Normalize before
   comparing: 3-digit and 8-digit hex, `rgb()`/`rgba()`,
   `hsl()`/`hsla()`, and named colors can spell the same value four
   ways. If a color has no token, add one and say so.
6. **Prettier-clean.** The gate's first step is `npx prettier --check .`.
   Run `npx prettier --write` on every file you touch before the gate.
   Do not hand-format around Prettier.
7. **px only for boundaries; rem for spacing, % for positioning
   offsets.** A `px` value in screen CSS marks a boundary — a hard
   line — and nothing else. The allowed uses are media-query
   breakpoints (a viewport width; you have to draw a line somewhere),
   borders and outlines, and frame strokes (a stroke is a line: 2px,
   muted 1.5px). Everything that is a distance *inside* the layout
   splits two ways: `%` for a positioning offset, because the offset
   is a fraction of something — `translate(-50%)` is half the
   element's own height, `left: 25%` is a quarter of the container —
   and `rem` for spacing (gaps, margins, padding), because the
   distance should grow when the user's font size grows. A `px`
   positioning offset is wrong twice over: it is not a boundary, and
   it is a fixed number where the distance is a fraction of an
   element whose size varies. The `-14px` ring offset was the proof:
   it assumed a single-line 28px trait (half of 28), and it broke
   the moment a trait carried a stress track and became ~75–80px
   tall — the block hung below its anchor and crowded the traits
   beneath it. The fix was `translate(-50%)` / `-75%` / `-25%`,
   fractions of the trait block's own height. Print CSS is the
   exception: it is a defined, confined space, so `px` is expected
   throughout it.
8. **No empty rulesets.** A stylesheet carries no empty rules
   (`selector {}`). Empty rulesets clutter stylesheets, trigger linter
   and IDE warnings, and usually indicate incomplete refactors or
   abandoned overrides. If a ruleset has no declarations or nested
   rules, delete it.

## Self-check (run before the gate)

```sh
# static inline styles: must return nothing
grep -rn '[^:]style="' js/*.vue
# hardcoded z-index: every hit must use var(--z-
grep -rn 'z-index:' css/*.css | grep -v 'var(--z-'
# new !important: count must not rise from the baseline in the brief
grep -rn '!important' css/*.css | grep -v 'app.min.css' | wc -l
# px in screen CSS: every hit must be a boundary (breakpoint, border,
# outline, frame stroke). A px gap, margin, padding, or positioning
# offset is a Control 7 violation. Print CSS (spotlight-print.css)
# is excluded — px is expected there.
grep -rn '[0-9]px' css/*.css | grep -v 'app.min.css' | grep -v 'spotlight-print.css'
# empty rulesets: must return nothing
node -e "const fs = require('fs'); const path = require('path'); const files = fs.readdirSync('css').filter(f => f.endsWith('.css') && !f.endsWith('.min.css')); let found = false; for (const f of files) { const content = fs.readFileSync(path.join('css', f), 'utf8'); const regex = /([^{}\r\n]+)\{\s*\}/g; let m; while ((m = regex.exec(content)) !== null) { console.error('Empty ruleset in ' + f + ': ' + m[1].trim()); found = true; } } if (found) process.exit(1);"
# Prettier
npx prettier --check .
```

For selector depth and colors, use a real CSS parser (PostCSS) on the
built `css/app.min.css` — a text grep cannot resolve nesting and cannot
normalize color spellings, so it is not evidence for those two.

## Enforcement

This skill is a playbook, not enforcement. Enforcement lives in the
gate and in the brief's acceptance greps: a brief that touches styles
carries the counts (inline styles, hardcoded `z-index`, `!important`,
effective depth) as acceptance, and the gate fails a Prettier violation
before anything else runs. If a brief and this skill conflict, the brief
wins for that session — note the conflict in one line (skill name +
item), follow the brief, and carry the note into the session report so
the skill can be refreshed. That note is how a frozen rule gets
corrected instead of re-stalling the next session.

