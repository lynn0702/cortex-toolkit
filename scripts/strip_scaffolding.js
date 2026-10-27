// Strip empty scaffolding from js/templates.js (safe: only deletes keys
// whose absence carries the same meaning) plus retired stress keys, plus
// blank slot objects (an empty slot is not a trait: sets show
// reservedSlots blanks via render-time expansion, never stored objects).
// Unlike realign_templates.js this never blanks values or descriptions.
// Slots carrying content (ratings, text, subtraits, view markers) stay;
// only fully-empty blanks drop, and sets losing blanks without a
// reservedSlots count get one backfilled to the original length.
// Usage: node scripts/strip_scaffolding.js  (rewrites js/templates.js)
const fs = require('fs');
const path = require('path');

const templatesPath = path.join(__dirname, '../js/templates.js');
let templates = require(templatesPath);
const M = require('../js/migration.ts').cortexMigration;
let stripped = 0;
let droppedBlanks = 0;
const backfilled = [];
const keptSamples = [];

const stripNode = (node) => {
  if (!node || typeof node !== 'object' || Array.isArray(node)) return;
  if (node.custom && typeof node.custom === 'object' && !Array.isArray(node.custom)) {
    delete node.custom.stress;
    delete node.custom.isStressOut;
    // custom.traits is a structural doppelganger nothing reads (render
    // reads trait.sfx; shared hinder filters it anyway). Verified absent
    // from every reader before deleting.
    if (node.custom.traits !== undefined) { delete node.custom.traits; stripped++; }
    if (Object.keys(node.custom).length === 0) { delete node.custom; stripped++; }
  }
  if (typeof node.stress === 'number') { delete node.stress; stripped++; }
  if (node.tags && Array.isArray(node.tags) && node.tags.length === 0) { delete node.tags; stripped++; }
  if (node.description === '') { delete node.description; stripped++; }
};

// A blank slot object: blank name and nothing but default/empty state.
// Anything meaningful (rating, text, subtraits, sfx, view, custom, id,
// label, or any unknown key) keeps it. _lid never blocks (app-local).
const BLANK_KEYS = new Set(['name', 'value', 'dice', 'traits', 'sfx', 'description', 'tags', 'counter', 'xp', '_lid']);
function isBlankSlot(tr) {
  if (!tr || typeof tr !== 'object' || Array.isArray(tr)) return false;
  if (tr.name !== '') return false;
  if (tr.id !== undefined || tr.label !== undefined) return false;
  if (tr.value !== undefined && tr.value !== 0) return false;
  if (tr.dice !== undefined && !(Array.isArray(tr.dice) && tr.dice.length === 0)) return false;
  if (tr.traits !== undefined && !(Array.isArray(tr.traits) && tr.traits.length === 0)) return false;
  if (tr.sfx !== undefined && !(Array.isArray(tr.sfx) && tr.sfx.length === 0)) return false;
  if (tr.description !== undefined && tr.description !== '') return false;
  if (tr.tags !== undefined && !(Array.isArray(tr.tags) && tr.tags.length === 0)) return false;
  if (tr.counter !== undefined && tr.counter !== 0 && tr.counter !== '') return false;
  if (tr.xp !== undefined && tr.xp !== 0 && tr.xp !== '') return false;
  if (tr.view !== undefined || tr.custom !== undefined) return false;
  if (Object.keys(tr).some((k) => !BLANK_KEYS.has(k))) return false;
  return true;
}

const SFX_KEYS = new Set(['name', 'description', 'tags', 'custom', 'view']);
function isBlankSfx(s) {
  if (typeof s === 'string') return s.length === 0;
  if (!s || typeof s !== 'object' || Array.isArray(s)) return false;
  if (typeof s.name === 'string' && s.name.length) return false;
  if (typeof s.description === 'string' && s.description.length) return false;
  if (Array.isArray(s.tags) && s.tags.length) return false;
  if (s.custom !== undefined || s.view !== undefined) return false;
  if (Object.keys(s).some((k) => !SFX_KEYS.has(k))) return false;
  return true;
}

function stripTrait(tr, where) {
  if (!tr || typeof tr !== 'object') return false;
  stripNode(tr);
  if (Array.isArray(tr.traits)) {
    tr.traits = tr.traits.filter((st) => {
      stripTrait(st, where);
      if (isBlankSlot(st)) { droppedBlanks++; return false; }
      if (keptSamples.length < 12 && st && typeof st === 'object' && st.name === '') keptSamples.push(where + ' sub:' + JSON.stringify(st).slice(0, 100));
      return true;
    });
  }
  if (Array.isArray(tr.sfx)) {
    const before = tr.sfx.length;
    tr.sfx = tr.sfx.filter((s) => !isBlankSfx(s));
    droppedBlanks += before - tr.sfx.length;
    tr.sfx.forEach((s) => { if (s && typeof s === 'object') stripNode(s); });
  }
  return true;
}

templates.forEach((item) => {
  const char = item && item.character;
  if (!char) return;
  M.normalizeView(char);
  if (char.portrait && typeof char.portrait === 'object' && !Array.isArray(char.portrait)) stripNode(char.portrait);
  if (!Array.isArray(char.traitSets)) return;
  char.traitSets.forEach((ts) => {
    if (!ts || typeof ts !== 'object') return;
    stripNode(ts);
    if (Array.isArray(ts.traits)) {
      const before = ts.traits.length;
      ts.traits = ts.traits.filter((tr) => {
        if (!tr || typeof tr !== 'object') return true;
        stripTrait(tr, item.id + '/' + ts.name);
        if (isBlankSlot(tr)) { droppedBlanks++; return false; }
        if (keptSamples.length < 12 && (tr.name === '')) keptSamples.push(item.id + '/' + ts.name + ': ' + JSON.stringify(tr).slice(0, 110));
        return true;
      });
      const dropped = before - ts.traits.length;
      if (dropped > 0) {
        const bag = ts.view || (ts.custom && ts.custom.cortexToolkit);
        if (bag && typeof bag === 'object' && (bag.reservedSlots === undefined || bag.reservedSlots === null)) {
          bag.reservedSlots = before;
          backfilled.push(item.id + '/' + ts.name + '=' + before);
        } else if (!bag || typeof bag !== 'object') {
          ts.view = { reservedSlots: before };
          backfilled.push(item.id + '/' + ts.name + '=' + before + ' (new bag)');
        }
      }
    }
    if (Array.isArray(ts.sfx)) {
      const before = ts.sfx.length;
      ts.sfx = ts.sfx.filter((s) => !isBlankSfx(s));
      droppedBlanks += before - ts.sfx.length;
      ts.sfx.forEach((s) => { if (s && typeof s === 'object') stripNode(s); });
    }
  });
});

const output = `/**\n * Cortex Toolkit - Spotlight Templates Repository (Blank Spotlight Sheets)\n */\nconst cortexSpotlightTemplates = ${JSON.stringify(templates, null, 2)};\n\nif (typeof module !== "undefined" && module.exports) {\n\tmodule.exports = cortexSpotlightTemplates;\n}\n`;
fs.writeFileSync(templatesPath, output, 'utf8');
console.log('stripped', stripped, 'empty keys,', droppedBlanks, 'blank slot objects in', templates.length, 'templates');
console.log('backfilled reservedSlots: ' + (backfilled.join('; ') || 'none'));
console.log('kept blanks sample: ' + (keptSamples.join(' | ') || 'none'));
