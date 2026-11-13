---
name: measure-before-you-build
description: >-
  Verify every constant, CSS token, schema key, field name, validator rule, and formula against the current repo tree before writing code or data. Use when starting implementation from a brief or spec, adding styles or fa-* icons, or authoring JSON templates and presets.
---

# Measure Before You Build

Never build from asserted constants, memory, or invented schema keys. Measure every key, type, constraint, and style token directly against the current repository before editing.

## What to verify before editing

1. **Model and `view` keys**: Read `js/model.ts`, `js/sheet-grid.ts`, and `js/frame-geometry.ts` (not prose summaries) to confirm live interfaces (`ViewBag`, `Rating`, `Portrait`, `PlaceRect`, `PartCell`, `FrameConfig`) and `KNOWN_PARTS`.
2. **Schema & validation constraints**: Check `schema/0.1/*.schema.json` and `scripts/validate.js` for required fields, allowed patterns (for example, `tags` must match `/^[A-Za-z0-9-./]+$/`), and retired keys/body IDs that fail validation.
3. **Reference sheet example**: Inspect `data/templates/Dreamer_Architect.curio.json` when verifying current layered sheet structure in practice.
4. **Icons and fonts**: Before using any `fa-*` class in a template or component, check `scripts/generate-fa-subset.py` and `css/fontawesome.css` so only included subset icons are referenced (or add the icon to the subset script and rebuild). Check `css/fonts.css` for self-hosted font families.
5. **Layout styles and tokens**: Search `css/*.css` (excluding built bundles) and `js/*.vue` to verify existing `--*` custom properties, class names, and breakpoints before adding CSS.

## Cross-platform search commands

Exclude built and generated artifacts (`*.min.js`, `*.bundle.js`, `*.min.css`, `js/model.generated.ts`) so searches measure source truth only.

- **POSIX / Git Bash (`grep`)**:
  ```sh
  grep -rn --include='*.css' --include='*.ts' --include='*.vue' \
    --exclude='*.min.js' --exclude='*.bundle.js' --exclude='*.min.css' --exclude='model.generated.ts' \
    'PATTERN' css js
  ```
- **Windows PowerShell (`Select-String`)**:
  ```powershell
  Get-ChildItem -Path css,js -Recurse -Include *.css,*.ts,*.vue |
    Where-Object { $_.Name -notmatch '\.(min|bundle)\.(js|css)$' -and $_.Name -ne 'model.generated.ts' } |
    Select-String -Pattern 'PATTERN'
  ```
- **Portable Node (`node -e`)**:
  ```sh
  node -e "const fs=require('fs'),p=require('path');function walk(d){for(const e of fs.readdirSync(d,{withFileTypes:true})){const f=p.join(d,e.name);if(e.isDirectory())walk(f);else if(/\.(css|ts|vue)$/.test(e.name)&&!/\.(min|bundle)\./.test(e.name)&&e.name!=='model.generated.ts'){const s=fs.readFileSync(f,'utf8').split(/\r?\n/);s.forEach((l,i)=>{if(l.includes('PATTERN'))console.log(f+':'+(i+1)+': '+l.trim());});}}}walk('css');walk('js');"
  ```

## Common measurement traps in this repo

- **Ring portrait keys**: Rings live on `view.ring` (`boolean` on a trait), `view.frame` (`shape: 'ring'`, `span`, `traitsSpan`, `ring`), and `view.ringConfig` on sets — never invent wrapper keys or unverified trait-level ring flags.
- **Span & track placement**: `span` lives only under `view.frame.span` / `view.frame.traitsSpan`, and `track` / `trackLabel` live only under `view.parts` — not directly on a trait set.
- **Restricted `tags`**: `tags` are valid on Character, Portrait, TraitSet, Trait, and Subtrait nodes, but values must satisfy `/^[A-Za-z0-9-./]+$/` (no spaces or arbitrary punctuation).
- **Font Awesome subset**: Full Font Awesome Free is not bundled; using an unlisted `fa-*` icon causes Step 7 of `npm run gate` (`Icon Subset Coverage`) to fail unless added to `scripts/generate-fa-subset.py`.
- **Root print zoom vs viewport units**: On-screen print preview scales via `.submode-print .pages { zoom: 0.8125 }` while `@media print` sets `html { font-size: 13px }`; verify actual CSS values rather than guessing pixel ratios.
