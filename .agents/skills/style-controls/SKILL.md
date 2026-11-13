---
name: style-controls
description: >-
  Enforce the 9 CSS and template style controls covering tokens, z-index, !important budget, shallow selectors, units, Prettier, and self-hosted fonts/icons. Use when editing CSS, Vue templates, HTML, or reviewing style-adjacent changes.
---

# Style Controls

Prevent specificity bloat, token drift, hardcoded values, and external asset dependencies from re-entering the stylesheets or templates.

## The 9 standing controls

1. **No static inline styles**: Do not put static `style="..."` attributes in `js/*.vue` or `index.html`. Dynamic `:style="..."` bindings are permitted only for computed runtime geometry/data values (e.g., portrait crop/zoom or grid spans).
2. **No hardcoded numeric `z-index`**: Use `css/app.css` `:root` layering tokens (`--z-chip-drag` through `--z-modal-close`). Prefer native top-layer `<dialog>` (`showModal()`) and `[popover]` elements, which render in the browser top layer and need no `z-index`.
3. **No new `!important`**: Baseline count across source stylesheets (`css/*.css`, excluding `css/app.min.css`) is **`4`**. Count may go down, never up.
4. **Shallow selector depth**: Maximum **3 combinators** of effective nesting depth. Keep component rules flat and scoped by block class.
5. **Palette tokens only**: No raw hex, `rgb()`, or `hsl()` colors outside token definitions. Use `var(--*)`, `color-mix(in oklch, var(--token) ..., ...)`, or standard CSS keywords (`transparent`, `currentColor`, `CanvasText` for forced-colors/focus rings).
6. **Prettier-clean**: `npm run gate` runs `prettier --write --cache .` during Step 1 (Build) and enforces `npx prettier --check --cache .` in Step 2 (Code Style). Keep CSS and Vue style blocks Prettier-clean.
7. **Units discipline**: Reserve `px` for 1–2px hairlines, border widths, fixed icon frames, or print geometry (`css/print.css`). Use `rem` for spacing/typography and `%` for positioning offsets. Exclude generated `css/fonts.css` and `css/fontawesome.css` alongside `css/app.min.css` and `css/print.css` when checking screen `px` usage.
8. **No empty rulesets**: Delete unused selectors rather than leaving empty `{}` blocks.
9. **Self-hosted fonts & subset icons only**: Zero external font or icon CDNs (`fonts.googleapis.com`, `fonts.gstatic.com`, Font Awesome CDN). Sheet fonts belong in `css/fonts.css` (`scripts/fetch-fonts.mjs`) and icons in `css/fontawesome.css` (`scripts/generate-fa-subset.py`, enforced by Gate Step 7).

## Cross-platform self-check

Run via `node -e` (works identically in PowerShell, cmd, and POSIX shells):

```sh
node -e "const fs=require('fs'),p=require('path');const cssFiles=fs.readdirSync('css').filter(f=>f.endsWith('.css')&&!['app.min.css','print.css','fonts.css','fontawesome.css'].includes(f));let imp=0,zHard=0,empty=0,pxHits=[];for(const f of cssFiles){const s=fs.readFileSync(p.join('css',f),'utf8');imp+=(s.match(/!important/g)||[]).length;zHard+=(s.match(/z-index:\s*\d+/g)||[]).length;empty+=(s.match(/\{[\s]*\}/g)||[]).length;s.split(/\r?\n/).forEach((l,i)=>{if(/\b\d+px\b/.test(l)&&!/1px|2px/.test(l))pxHits.push(f+':'+(i+1)+': '+l.trim());});}const vueFiles=[];(function w(d){for(const e of fs.readdirSync(d,{withFileTypes:true})){const fp=p.join(d,e.name);if(e.isDirectory())w(fp);else if(e.name.endsWith('.vue'))vueFiles.push(fp);}})('js');let staticStyle=0;for(const f of vueFiles){const s=fs.readFileSync(f,'utf8');staticStyle+=(s.match(/\sstyle=\x22/g)||[]).length;}console.log({staticStyle,zHard,importantCount:imp,emptyRulesets:empty,screenPxSampleCount:pxHits.length});"
```

Verify `importantCount <= 4`, `staticStyle === 0`, `zHard === 0`, and `emptyRulesets === 0`, then review any `pxHits`.
