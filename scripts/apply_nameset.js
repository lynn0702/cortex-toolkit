// Give every template a Name set: the name block as the first trait set.
// Traits are presentation records (label + hidden; values stay on the
// character fields). Labels/view carry today's rendering; legacy
// view.nameLabels bags fold into trait labels, then the bag is deleted.
// Usage: node scripts/apply_nameset.js  (rewrites js/templates.js)
const fs = require('fs');
const path = require('path');

const LABELS = {
  name: 'Name',
  player: 'Player',
  nickname: 'Nickname',
  pronouns: 'Pronouns',
  description: 'Description',
  game: 'Game',
  plotPoints: 'PP',
};
const ORDER = ['name', 'player', 'nickname', 'pronouns', 'description', 'game', 'portrait', 'caption', 'plotPoints', 'notes'];
// Spotlight styles render no zone for these: stored visibility stays
// honest (hidden) rather than claiming "shown".
const HIDDEN_IN_SPOTLIGHT = ['game', 'plotPoints', 'notes'];

const templatesPath = path.join(__dirname, '../js/templates.js');
const templates = require(templatesPath);
let added = 0, migrated = 0, collapsed = 0, honest = 0;

function resolveSheet(view) {
  if (!view || typeof view !== 'object') return 'spotlight';
  const st = view.style && typeof view.style === 'object' ? view.style.sheet : undefined;
  if (st === 'classic' || st === 'spotlight') return st;
  if (view.sheetStyle === 'classic' || view.sheetStyle === 'spotlight') return view.sheetStyle;
  if (view.style && view.style.hasAttributes === false) return 'spotlight';
  if (view.spotlight) return 'spotlight';
  return 'spotlight';
}

templates.forEach((entry) => {
  const char = entry && entry.character;
  if (!char || !Array.isArray(char.traitSets)) return;
  // Pass A (always): character view carries one style key (style.sheet).
  if (char.view && typeof char.view === 'object') {
    const sheet = resolveSheet(char.view);
    const style = (char.view.style && typeof char.view.style === 'object' && !Array.isArray(char.view.style))
      ? char.view.style : {};
    delete style.hasAttributes;
    style.sheet = sheet;
    char.view.style = style;
    if (char.view.sheetStyle !== undefined) { delete char.view.sheetStyle; collapsed++; }
  }
  let set = char.traitSets.find((s) => s && ((s.view || {}).style || {}).body === 'name');
  if (!set) {
    const bag = char.view && char.view.nameLabels;
    const traits = ORDER.map((key) => {
      const tr = { name: key, value: 0, dice: [], traits: [], sfx: [] };
      if (LABELS[key] !== undefined) tr.label = LABELS[key];
      if (key === 'pronouns' && bag && typeof bag.pronouns === 'string' && bag.pronouns.trim().length) {
        tr.label = bag.pronouns.trim();
        migrated++;
      }
      return tr;
    });
    set = {
      id: 'name',
      name: 'Name',
      traits,
      sfx: [],
      view: { style: { header: 'default', body: 'name' }, page: 1 },
    };
    char.traitSets.unshift(set);
    if (char.view && typeof char.view === 'object' && char.view.nameLabels !== undefined) {
      delete char.view.nameLabels;
      migrated++;
    }
    added++;
  }
  // Pass B (always): spotlight renders no game/PP/notes zone, so those
  // traits hide unless a stored hidden flag says otherwise. The retired
  // visibility word converts here too ('hidden' carries, else absent).
  const sheet = resolveSheet(char.view);
  if (set && Array.isArray(set.traits)) {
    set.traits.forEach((tr) => {
      if (!tr || typeof tr !== 'object') return;
      const vw = tr.view && typeof tr.view === 'object' && !Array.isArray(tr.view) ? tr.view : undefined;
      if (vw && vw.visibility !== undefined) {
        if (vw.visibility === 'hidden') vw.hidden = true;
        delete vw.visibility;
      }
      if (sheet !== 'spotlight' || !HIDDEN_IN_SPOTLIGHT.includes(tr.name)) return;
      if (tr.view && typeof tr.view === 'object' && tr.view.hidden !== undefined) return;
      if (!tr.view || typeof tr.view !== 'object' || Array.isArray(tr.view)) tr.view = {};
      tr.view.hidden = true;
      honest++;
    });
  }
});

const output = `/**\n * Cortex Toolkit - Spotlight Templates Repository (Blank Spotlight Sheets)\n */\nconst cortexSpotlightTemplates = ${JSON.stringify(templates, null, 2)};\n\nif (typeof module !== "undefined" && module.exports) {\n\tmodule.exports = cortexSpotlightTemplates;\n}\n`;
fs.writeFileSync(templatesPath, output, 'utf8');
console.log('name sets added: ' + added + ', legacy labels migrated: ' + migrated + ', views collapsed: ' + collapsed + ', visibility honest: ' + honest);
