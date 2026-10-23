// One-shot corpus migration (2026-10-24): session-record / angled-lines
// bodies unify into pips with the labels opt-in. Runs the normal
// normalizeView over every template entry (idempotent: second pass is a
// no-op) and rewrites js/templates.js; regenerate the layered files
// after (see scratch/regen pattern in convert-corpus-place.js).
// Usage: node scripts/migrate_session_pips.cjs
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const M = require('../js/migration.ts').cortexMigration;
const templatesPath = path.join(root, 'js/templates.js');
const templates = require(templatesPath);

let converted = 0;
templates.forEach((entry) => {
  const before = JSON.stringify(
    ((entry && entry.character && entry.character.traitSets) || []).map((s) => (s && s.view && s.view.style && s.view.style.body) || null)
  );
  M.normalizeView(entry);
  const after = JSON.stringify(
    ((entry && entry.character && entry.character.traitSets) || []).map((s) => (s && s.view && s.view.style && s.view.style.body) || null)
  );
  if (before !== after) converted++;
});

const header = '/**\n * Cortex Toolkit - Spotlight Templates Repository (Blank Spotlight Sheets)\n */\n';
const footer = '\n\nif (typeof module !== "undefined" && module.exports) {\n\tmodule.exports = cortexSpotlightTemplates;\n}\n';
fs.writeFileSync(templatesPath, header + 'const cortexSpotlightTemplates = ' + JSON.stringify(templates, null, 2) + ';' + footer, 'utf8');
console.log('session bodies unified in ' + converted + ' templates');
