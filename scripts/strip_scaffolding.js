// Strip empty scaffolding from js/templates.js (safe: only deletes keys
// whose absence carries the same meaning) plus retired stress keys.
// Unlike realign_templates.js this never blanks values or descriptions.
// Usage: node scripts/strip_scaffolding.js  (rewrites js/templates.js)
const fs = require('fs');
const path = require('path');

const templatesPath = path.join(__dirname, '../js/templates.js');
let templates = require(templatesPath);
let stripped = 0;

const stripNode = (node) => {
  if (!node || typeof node !== 'object' || Array.isArray(node)) return;
  if (node.custom && typeof node.custom === 'object' && !Array.isArray(node.custom)) {
    delete node.custom.stress;
    delete node.custom.isStressOut;
    if (Object.keys(node.custom).length === 0) { delete node.custom; stripped++; }
  }
  if (typeof node.stress === 'number') { delete node.stress; stripped++; }
  if (node.tags && Array.isArray(node.tags) && node.tags.length === 0) { delete node.tags; stripped++; }
  if (node.description === '') { delete node.description; stripped++; }
};
const stripTrait = (tr) => {
  if (!tr || typeof tr !== 'object') return;
  stripNode(tr);
  if (Array.isArray(tr.traits)) tr.traits.forEach(stripTrait);
  if (Array.isArray(tr.sfx)) tr.sfx.forEach((s) => { if (s && typeof s === 'object') stripNode(s); });
};

templates.forEach((item) => {
  const char = item && item.character;
  if (!char) return;
  if (char.portrait && typeof char.portrait === 'object' && !Array.isArray(char.portrait)) stripNode(char.portrait);
  if (!Array.isArray(char.traitSets)) return;
  char.traitSets.forEach((ts) => {
    if (!ts || typeof ts !== 'object') return;
    stripNode(ts);
    if (Array.isArray(ts.traits)) ts.traits.forEach(stripTrait);
    if (Array.isArray(ts.sfx)) ts.sfx.forEach((s) => { if (s && typeof s === 'object') stripNode(s); });
  });
});

const output = `/**\n * Cortex Toolkit - Spotlight Templates Repository (Blank Spotlight Sheets)\n */\nconst cortexSpotlightTemplates = ${JSON.stringify(templates, null, 2)};\n\nif (typeof module !== "undefined" && module.exports) {\n\tmodule.exports = cortexSpotlightTemplates;\n}\n`;
fs.writeFileSync(templatesPath, output, 'utf8');
console.log('stripped', stripped, 'empty keys in', templates.length, 'templates');
