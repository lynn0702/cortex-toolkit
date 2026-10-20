// One-shot corpus conversion: band model -> nested grids (2026-10-19).
// Rewrites js/templates.js in place (band keys become view.place, legacy
// flags become view.parts, via migratePlacement) plus the hand-authored
// Eidolon Alpha XP strip, then regenerates every
// data/templates/*.template.layered.json through migrateTemplateEntry.
// Idempotent: re-running converts nothing new (migratePlacement no-ops on
// converted sets; the Eidolon authoring is guarded by exact pre-state).
// Usage: node scripts/convert-corpus-place.js
const fs = require('fs');
const path = require('path');
const M = require('../js/migration.ts').cortexMigration;

const root = path.join(__dirname, '..');
const templatesPath = path.join(root, 'js/templates.js');
const templates = require(templatesPath);

const report = [];
templates.forEach((entry) => {
  const warnings = M.migratePlacement(entry);
  warnings.forEach((w) => report.push(entry.id + ': ' + w));
});

// Eidolon Alpha: the XP pips track is a vertical strip at the right edge
// running the full height (the source sheet's sidebar); the main columns
// rescale 33.3/66.7 into the freed 0-90 so nothing overlaps.
{
  const eidolon = templates.find((t) => t.id === 'spotlight-eidolon-alpha');
  if (!eidolon) throw new Error('eidolon template missing');
  const byName = {};
  eidolon.character.traitSets.forEach((ts) => { byName[ts.name] = ts; });
  const want = {
    Roles: { left: '0%', top: 0, width: '33%', height: 1 },
    Attributes: { left: '0%', top: 1, width: '33%', height: 1 },
    'Endarch Distinction': { left: '33%', top: 0, width: '67%', height: 1 },
    'Summoned Eidolon': { left: '33%', top: 1, width: '67%', height: 1 },
    'Role & Freeform Distinctions': { left: '33%', top: 2, width: '67%', height: 1 },
    XP: { left: '33%', top: 3, width: '67%', height: 1 },
  };
  const pre = Object.keys(want).every(
    (k) => byName[k] && JSON.stringify((byName[k].view || {}).place) === JSON.stringify(want[k])
  );
  const post = byName.XP && JSON.stringify((byName.XP.view || {}).place) ===
    JSON.stringify({ left: '90%', top: 0, width: '10%', height: 4 });
  if (!pre && !post) {
    throw new Error('eidolon pre-state drifted, refusing to author the XP strip');
  }
  if (pre) {
    ['Roles', 'Attributes'].forEach((k) => {
      byName[k].view.place = { left: '0%', top: byName[k].view.place.top, width: '30%', height: 1 };
    });
    ['Endarch Distinction', 'Summoned Eidolon', 'Role & Freeform Distinctions'].forEach((k) => {
      byName[k].view.place = { left: '30%', top: byName[k].view.place.top, width: '60%', height: 1 };
    });
    byName.XP.view.place = { left: '90%', top: 0, width: '10%', height: 4 };
    report.push('spotlight-eidolon-alpha: XP strip authored (90/10 full height), main columns rescaled to 0-90');
  }
}

const output = '/**\n * Cortex Toolkit - Spotlight Templates Repository (Blank Spotlight Sheets)\n */\nconst cortexSpotlightTemplates = ' +
  JSON.stringify(templates, null, 2) + ';\n\nif (typeof module !== "undefined" && module.exports) {\n\tmodule.exports = cortexSpotlightTemplates;\n}\n';
fs.writeFileSync(templatesPath, output, 'utf8');

const slug = (id) => String(id).replace(/^spotlight-/, '') + '.template.layered.json';
let regen = 0;
templates.forEach((orig) => {
  const fresh = M.migrateTemplateEntry(orig);
  const file = path.join(root, 'data/templates', slug(orig.id));
  fs.writeFileSync(file, JSON.stringify(fresh.data, null, 2) + '\n', 'utf8');
  regen++;
});

console.log('converted ' + templates.length + ' templates, regenerated ' + regen + ' layered files');
report.forEach((r) => console.log('  ' + r));
