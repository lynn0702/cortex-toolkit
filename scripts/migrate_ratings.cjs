// One-shot corpus migration (2026-10-23): ratings have one shape.
// Runs normalizeView over every template entry (idempotent: second pass
// is a no-op), rewrites js/templates.js, and regenerates the layered
// files through migrateTemplateEntry. Also migrates the layered
// character sample (Sendak_Eggers.layered.json).
// Usage: node scripts/migrate_ratings.cjs
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const M = require('../js/migration.ts').cortexMigration;
const templatesPath = path.join(root, 'js/templates.js');
const templates = require(templatesPath);

let converted = 0;
templates.forEach((entry) => {
  const before = JSON.stringify(entry);
  M.normalizeView(entry);
  if (JSON.stringify(entry) !== before) converted++;
});

const header = '/**\n * Cortex Toolkit - Spotlight Templates Repository (Blank Spotlight Sheets)\n */\n';
const footer = '\n\nif (typeof module !== "undefined" && module.exports) {\n\tmodule.exports = cortexSpotlightTemplates;\n}\n';
fs.writeFileSync(templatesPath, header + 'const cortexSpotlightTemplates = ' + JSON.stringify(templates, null, 2) + ';' + footer, 'utf8');
console.log('ratings converted in ' + converted + ' templates');

const slug = (id) => String(id).replace(/^spotlight-/, '') + '.template.layered.json';
let regen = 0;
templates.forEach((orig) => {
  const fresh = M.migrateTemplateEntry(orig);
  const file = path.join(root, 'data/templates', slug(orig.id));
  fs.writeFileSync(file, JSON.stringify(fresh.data, null, 2) + '\n', 'utf8');
  regen++;
});
console.log('layered files regenerated: ' + regen);
// Note: Sendak_Eggers.layered.json is a character file, not a template
// entry — it has its own converter (scripts/migrate_sendak.cjs).
