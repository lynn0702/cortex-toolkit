// One-shot: convert Sendak_Eggers.layered.json shorthand/dice strings to
// rating objects (no entry-level synthesis — it is a character file).
// Usage: node scripts/migrate_sendak.cjs
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const M = require('../js/migration.ts').cortexMigration;

const fp = path.join(root, 'data/templates/Sendak_Eggers.layered.json');
const data = JSON.parse(fs.readFileSync(fp, 'utf8'));

function diceInts(s) {
  if (typeof s !== 'string' || !s.length) return [];
  const out = [];
  const re = /(\d*)\s*d(20|12|10|8|6|4|2)/g;
  let m;
  while ((m = re.exec(s)) !== null) {
    const n = m[1] === '' ? 1 : parseInt(m[1], 10);
    const size = parseInt(m[2], 10);
    if (!(n >= 1)) continue;
    for (let i = 0; i < n; i++) out.push(size);
  }
  return out;
}

function convertNode(v, isSet) {
  if (v === null) return v;
  if (typeof v === 'string') {
    const dice = diceInts(v);
    return dice.length
      ? { rating: { type: dice.length > 1 ? 'Dice' : 'Die', value: dice.slice().sort((a, b) => b - a), range: [4, 6, 8, 10, 12] } }
      : {};
  }
  if (!v || typeof v !== 'object' || Array.isArray(v)) return v;
  M.migrateNodeRating(v, isSet);
  if (isSet) {
    M.migratePipSet(v);
    M.migrateResourceSet(v);
  }
  if (v.traits) {
    for (const k of Object.keys(v.traits)) v.traits[k] = convertNode(v.traits[k], false);
  }
  if (v.slots) {
    for (const k of Object.keys(v.slots)) v.slots[k] = convertNode(v.slots[k], false);
  }
  return v;
}

for (const k of Object.keys(data.sets || {})) {
  data.sets[k] = convertNode(data.sets[k], true);
}
fs.writeFileSync(fp, JSON.stringify(data, null, 2) + '\n', 'utf8');
console.log('Sendak converted');
