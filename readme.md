# Cortex Prime Toolkit

A web application and layout engine for creating, managing, playing, and printing character sheets for the [Cortex Prime](https://www.cortexrpg.com) tabletop roleplaying game system.

Offline-capable, client-side, and zero-backend. Runs in any modern browser.

---

## Key Features

### Studio Workspace & Interactive Editing
- **Docked Studio Panel**: Tabbed sidebar inspector (`[Properties] [Roller]`) with bidirectional docking (`left` / `right`), drawer collapse, and responsive layout pushing on desktop displays.
- **Contextual Inspection**: Selecting any trait row, trait set, portrait, or sheet background routes inspection directly into the panel with hierarchical breadcrumbs.
- **Live Edit History**: Robust local undo and redo tracking across sectional, trait, and sheet-level modifications.

### Multi-Column Layout & Grid Engine
- **Spotlight Grid Engine**: Structural multi-column rendering engine supporting both portrait (1–2 columns) and landscape (1–3 columns) formats.
- **Geometric Banding**: Flexible column spanning (`span: 1 | 2 | 3`), explicit row breaks (`rowBreak: true`), track balancing, and section clustering.
- **Layout-Driven Styles**: Built with structural layouts rather than hardcoded game concepts:
  - `subtrait-columns`: Split-branch parent-child hierarchies (e.g. Skills with Specialties).
  - `paired-slots`: Two-slot pairings with bonus/complication ratings (e.g. Standings).
  - `die-rows`: Scaled horizontal rows with counter columns (e.g. Badges & Commendations).
  - `three-column-table`: Three-column activation and effect tables (e.g. Talents).
  - `dice-ladder`: Multi-rung dice ladders (e.g. Growth pools).
  - `dice-count`: Clustered resource dice pools with count controls.
  - `labeled-fields`: Dossier records with title-value pairings.
  - `pips`: Connected progress or stress pip tracks.
  - `session-record`: Angled session lines with fillable check bubbles.
  - `portrait-ring`: Halo attribute dice arranged along the portrait boundary.
  - `notes`: Markdown-supported freeform text blocks.

### Spotlight Template Library
- **29 Pre-Configured Templates**: Comprehensive corpus covering genre archetypes from space opera and cyberpunk to gothic mystery, supernatural drama, and mecha.
- **Dual Format Showcases**: Reference templates providing side-by-side implementations of portrait (Kitchen Sink Showcase) and true landscape (Panorama Showcase) sheets.
- **Sparse Layered Inheritance**: Character files pin exact template snapshots, storing only local differences while preserving underlying template updates.

### Integrated Dice Roller & CortexPal Integration
- **Interactive Roller**: Tap-to-stage ratings directly from sheet traits or halo attributes into active pools.
- **Challenge Pools**: Dedicated opposition pool staging alongside player dice.
- **Pool Modifiers**: Step up, step down, keep, and drop mechanics.
- **CortexPal Export**: Live formula export formatted for Discord integration via [CortexPal](https://github.com/lynn0702/CortexPalGS).

### WYSIWYG Print Engine
- **Pixel-Accurate Print Simulation**: Dedicated Print tab mirroring physical paper output at 13px baseline density (`zoom: 0.8125` on screen).
- **Physical Orientation Matching**: Automatic `@page` orientation switching for portrait and landscape printing.
- **Zero-Spill Geometry**: Dynamic page box calculations ensuring multi-page sheets print cleanly without overflow spill.
- **Hand-Fillable Blank Sheets**: Toggleable blank print mode for physical pencil-and-paper play.

### Data Architecture & Backward Compatibility
- **JSON Schema Validation**: Strict schema enforcement against `schema/0.1/character.schema.json` and `schema/0.1/sheet-template.schema.json`.
- **Generated Model Types**: TypeScript interfaces generated directly from JSON Schema specifications.
- **One Migration Path**: Unbroken backward compatibility with legacy formats from the original toolkit and Kaelri fork.

---

## Technology Stack

- **Framework**: [Vue 3](https://vuejs.org/) Single-File Components (`<script setup lang="ts">`) with runtime-only ESM bundler.
- **Language**: [TypeScript](https://www.typescriptlang.org/) with `vue-tsc` type-checking.
- **Styling**: Modular SCSS compiling to production-minified CSS.
- **Build System**: [Webpack Mix](https://laravel-mix.com/) with automated asset version fingerprinting.
- **Storage**: Client-side `localStorage` with JSON import and export.

---

## Developer Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (v20+ recommended)
- `npm`

### Setup
Clone the repository and install dependencies:
```bash
git clone https://github.com/lynn0702/cortex-toolkit.git
cd cortex-toolkit
npm install
```

### Development Scripts
```bash
# Start local dev server on http://localhost:3000
npm run serve

# Compile development assets
npm run dev

# Watch for changes and recompile
npm run watch

# Regenerate TypeScript types from JSON schemas
npm run types

# Type-check TypeScript and Vue components
npm run check

# Run schema validation across all template and character fixtures
npm run validate

# Run the 6 automated test suites (550+ tests)
npm test

# Build production bundle with minification and cache-busting
npm run build
```

---

## Quality Gates & Testing

Every change committed to `main` must pass the repository definition of done:

1. `npm run build`: Webpack Mix compilation with zero errors or warnings.
2. `npm run check`: `vue-tsc --noEmit` type verification.
3. `npm test`: All 6 test suites passing:
   - `cortex-pal-tests`: Dice pool notation, rolling, and syntax export.
   - `spotlight-grid-tests`: Grid engine column tracks, spans, and row breaks.
   - `merge-tests`: 3-state layered entity inheritance and null-clearing.
   - `migration-tests`: Legacy format import normalization and schema migration.
   - `materialize-tests`: Template snapshot pinning and layered materialization.
   - `template-parity-tests`: Round-trip parity between `templates.js` and layered JSON fixtures.
4. `npm run validate`: JSON schema validation with 0 errors and 0 warnings.
5. Security: Strict HTML escaping on all text interpolations; raw `v-html` restricted to audited SVG vector generators and safe markdown formatters.

---

## Credits

- Originally based on the [Cortex Prime character sheet](https://tamas-rabel.github.io/cortex/sheet.html) by [@tamas-rabel](https://github.com/tamas-rabel/tamas-rabel.github.io).
- Forked and restructured from the original work by [@kaelri](https://github.com/kaelri/cortex-toolkit) (Michael Engard).
- Maintained and modernized by [Lynn Jones](https://github.com/lynn0702) with design and testing contributions from Riley Routh.

---

## Legal & Licensing

Cortex Prime is the award-winning world-building tabletop RPG system for forging unique, compelling game experiences from a set of modular rules mechanics available at [CortexRPG.com](https://www.cortexrpg.com).

Cortex is © Dire Wolf Digital, LLC. Cortex, Cortex Prime, associated logos, and trade dress are trademarks of Dire Wolf Digital, LLC. Iconography used with permission.

If you wish to publish or sell materials created using this toolkit, it is your responsibility to ensure you have the proper license or rights from Dire Wolf Digital, LLC. No commercial rights are granted through the use of this software.
