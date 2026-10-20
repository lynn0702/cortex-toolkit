// Seed style-header default labels into the template corpus (absent keys
// only — custom labels are never overwritten). Makes every on-sheet style
// word findable in the data; rendering is unchanged (these are the values
// the code defaults already produce).
// Usage: node scripts/seed_labels.js  (rewrites js/templates.js)
const fs = require('fs');
const path = require('path');

const SEEDS = {
  'subtrait-columns': { left: 'SKILL', right: 'SPECIALTIES' },
  'three-column-table': { col1: 'TALENT', col2: 'ACTIVATION', col3: 'EFFECT' },
  'dice-count': { rating: 'RATING', dice: '/ DICE' },
  'paired-slots': { slot0: 'COMPLICATION', slot1: 'BONUS' },
};

const templatesPath = path.join(__dirname, '../js/templates.js');
const templates = require(templatesPath);
let seeded = 0;

templates.forEach((item) => {
  const char = item && item.character;
  if (!char || !Array.isArray(char.traitSets)) return;
  char.traitSets.forEach((ts) => {
    if (!ts || typeof ts !== 'object') return;
    const view = ts.view || (ts.custom && ts.custom.cortexToolkit);
    const body = view && view.style && view.style.body;
    const seed = SEEDS[body];
    if (!seed) return;
    const bag = ts.view || (ts.custom && ts.custom.cortexToolkit);
    if (!bag || typeof bag !== 'object') return;
    if (!bag.labels || typeof bag.labels !== 'object') bag.labels = {};
    Object.keys(seed).forEach((k) => {
      if (bag.labels[k] === undefined || bag.labels[k] === null || bag.labels[k] === '') {
        bag.labels[k] = seed[k];
        seeded++;
      }
    });
    if (bag.labels && typeof bag.labels === 'object' && !Object.keys(bag.labels).length) delete bag.labels;
  });
});

const output = `/**\n * Cortex Toolkit - Spotlight Templates Repository (Blank Spotlight Sheets)\n */\nconst cortexSpotlightTemplates = ${JSON.stringify(templates, null, 2)};\n\nif (typeof module !== "undefined" && module.exports) {\n\tmodule.exports = cortexSpotlightTemplates;\n}\n`;
fs.writeFileSync(templatesPath, output, 'utf8');
console.log('seeded', seeded, 'style labels in', templates.length, 'templates');
