// Template parity tests: old form → layered → old form, every template.
// Bar: each round-trip is deep-equal and load-bearing elements are explicitly
// asserted, so the renderer cannot see a difference.
// Usage: node scripts/template-parity-tests.js  (exit 1 on failure)
const fs = require('fs');
const path = require('path');
const F = require('../js/functions.ts').cortexFunctions;
const M = require('../js/migration.ts').cortexMigration;

let pass = 0, fail = 0;
function ok(cond, name, extra) {
  if (cond) { pass++; }
  else { fail++; console.log('  FAIL ' + name + (extra !== undefined ? ' :: ' + JSON.stringify(extra) : '')); }
}

const root = path.join(__dirname, '..');
const T = require(path.join(root, 'js/templates.js'));
const slug = (id) => String(id).replace(/^spotlight-/, '') + '.template.layered.json';
const readLayered = (id) => JSON.parse(fs.readFileSync(path.join(root, 'data/templates', slug(id)), 'utf8'));

// ---- 1. Every template round-trips deep-equal with marker-only warnings.
{
  ok(T.length === 28, '28 templates in library', T.length);
  T.forEach((orig) => {
    const layeredFile = readLayered(orig.id);
    const fresh = M.migrateTemplateEntry(orig);
    ok(fresh.data && F.deepEqual(fresh.data, layeredFile), `checked-in file matches fresh migration (${orig.id})`);
    const back = M.unmigrateTemplateEntry(layeredFile);
    ok(back.data && F.deepEqual(back.data, orig), `round-trip deep-equal (${orig.id})`);
    ok(back.warnings.length === 0, `unmigrate warning-free (${orig.id})`, back.warnings);
    const allowed = fresh.warnings.every((w) => w.indexOf('$schema') !== -1 || w.indexOf('duplicate set name') !== -1);
    ok(allowed, `migrate warnings are markers/dupe-labels only (${orig.id})`, fresh.warnings);
  });
}

// ---- 2. Bewilderwood reference assertions.
{
  const L = readLayered('spotlight-camp-bewilderwood');
  const orig = T.find((t) => t.id === 'spotlight-camp-bewilderwood');
  ok(!!orig, 'bewilderwood entry exists');
  ok(L.id === 'spotlight-camp-bewilderwood' && L.version === 1, 'entry wrapper kept');
  ok(L.character.$schema === undefined && L.character.version === undefined, 'old-format markers dropped in layered form');
  const sets = L.character.sets;
  ok(JSON.stringify(Object.keys(sets)) === JSON.stringify(['Distinctions', 'Values', 'Signature Assets', 'Attributes', 'Standing', 'Badges', 'Talents']),
    'seven sets in template order', Object.keys(sets));
  ok(sets.Distinctions.id === 'distinctions' && sets.Talents.id === 'talents', 'set ids kept');
  ok(sets.Distinctions.traits['HERITAGE:'].value === 'd8', 'distinction die');
  ok(sets.Values.traits.Bravery.value === undefined, 'unrated stays valueless');
  const sfx = sets.Distinctions.traits['HERITAGE:'].traits.SFX.traits;
  ok(sfx && sfx.Heritage.description === 'Spend a PP to step up an attribute when you connect to your heritage.',
    'trait sfx kept with description');
  const dctk = sets.Distinctions.view;
  ok(dctk.sharedHinder === true &&
    dctk.sharedHinderText === 'Hinder: Gain a PP when you trade out your distinction\'s d8 rating for a d4.',
    'shared hinder banner kept');
  ok(sets.Values.traits.Bravery.questioned === false && sets.Values.traits.Bravery.statement === '', 'values statement keys kept');
  ok(Object.keys(sets['Signature Assets'].slots).join(',') === '0,1,2', 'sig-asset slot indices');
  ok(sets['Signature Assets'].slots['0'].statement === '', 'blank sig-asset statement kept');
  ok(sets['Signature Assets'].slots['1'].statement === undefined, 'slot without statement stays keyless (presence preserved)');
  ok(Object.keys(sets.Standing.slots).length === 6, 'standing slots count');
  ok(sets.Standing.slots['0'].traits.COMPLICATION !== undefined && sets.Standing.slots['0'].traits.BONUS !== undefined,
    'complication/bonus pairs survive');
  ok(Object.keys(sets.Talents.slots).length === 2, 'talent slots count');
  ok(sets['Signature Assets'].view.reservedSlots === 3 && sets.Standing.view.reservedSlots === 6, 'reservedSlots intact');
  ok(JSON.stringify(sets.Values.view.ratingScale) === '[4,6,8,10,12]', 'rating scale kept');
  ok(sets.Badges.hasCounterColumn === true && sets.Badges.counterLabel === 'XP', 'counter column kept');
  const tctk = sets.Talents.view;
  ok(tctk.place === undefined && tctk.span === undefined && tctk.colSpan === undefined && tctk.columnSpan === undefined, 'talents stacks sparsely full-width');
  ok(JSON.stringify(sets.Standing.view.place) === JSON.stringify({ left: '0%', top: 2, width: '40%', height: 1 }) &&
    sets.Standing.view.row === undefined &&
    sets.Standing.view.rowBreak === undefined &&
    sets.Standing.view.colWidth === undefined &&
    sets.Standing.view.widths === undefined &&
    sets.Standing.view.track === undefined &&
    sets.Standing.view.span === undefined, 'standing has explicit coordinates, no band keys', sets.Standing.view.place);
  // Nested grids: flags became parts (inline 70/30, above pushes name down, below adds a row).
  const dp = sets.Distinctions.view.parts;
  ok(dp && dp.name.width === '70%' && dp.rating.width === '30%' && dp.rating.top === 0 &&
    dp.description.top === 1 && dp.sfx.top === 2, 'distinctions inline parts with description + sfx rows', dp);
  ok(sets.Distinctions.ratingPosition === undefined && sets.Distinctions.view.ratingPosition === undefined, 'distinctions flags removed');
  const vp = sets.Values.view.parts;
  ok(vp && vp.name.width === '70%' && vp.rating.width === '30%', 'values inline parts', vp);
  const sap = sets['Signature Assets'].view.parts;
  ok(sap && sap.rating.top === 0 && sap.name.top === 1, 'above pushes name to row 1', sap);
  const atp = sets.Attributes.view.parts;
  ok(atp && atp.name.top === 0 && atp.rating.top === 1, 'below adds a row', atp);
  ok(sets.Standing.view.parts === undefined, 'bespoke bodies keep legacy flex (no parts)');
  ok(sets.Attributes.view.attributesRing === false, 'ring flag kept');
  ok(L.character.view.columns === undefined &&
    L.character.view.watermark.opacity === 0.08, 'columns removed from sheet custom, watermark kept');
  ok(L.character.plotPoints === 1, 'plotPoints kept');
  ok(L.character.portrait.view.size === 'spotlight', 'portrait custom kept');
  const blob = JSON.stringify(L.character.sets);
  ok(blob.indexOf('"traitSets"') === -1, 'no array-form traitSets');
  ok(blob.indexOf('"traits":[') === -1, 'no array-form traits');
  ok(blob.indexOf('"sfx":[') === -1, 'no array-form sfx');
  ok(blob.indexOf('"_lid"') === -1 && blob.indexOf('"removedTraits"') === -1, 'no lids or tombstones');
}

// ---- 3. Leading blanks keep their positions (strange-towns distinctions ___).
// Ruin is a name-block field, not a distinction trait: all three rows are blanks.
{
  const L = readLayered('spotlight-strange-towns');
  const keys = Object.keys(L.character.sets.Distinctions.slots || {});
  ok(JSON.stringify(keys) === JSON.stringify(['0', '1', '2']), 'leading slots indexed 0,1,2', keys);
  const back = M.unmigrateTemplateEntry(L).data;
  const orig = T.find((t) => t.id === 'spotlight-strange-towns');
  const pat = (ts) => ts.traits.map((t) => (t.name && t.name.length ? 'N' : '_')).join('');
  const ds = (ch) => ch.character.traitSets.find((ts) => ts.id === 'distinctions');
  ok(pat(ds(back)) === pat(ds(orig)), 'blank/name order restored');
}

// ---- 4. Duplicate set names keep ids, content, and order (inheritors-family).
{
  const L = readLayered('spotlight-inheritors-family');
  const gmcKeys = Object.keys(L.character.sets).filter((k) => k === 'GMC' || k.indexOf('GMC~') === 0);
  ok(JSON.stringify(gmcKeys) === JSON.stringify(['GMC', 'GMC~2', 'GMC~3', 'GMC~4', 'GMC~5', 'GMC~6']), 'suffixed keys in order', gmcKeys);
  ok(L.character.sets['GMC~2'].label === 'GMC', 'display name in label');
  ok(L.character.sets['GMC~2'].id === 'gmc-b', 'each instance keeps its id');
  ok(L.character.sets['GMC'].view.place.left === '0%' &&
    L.character.sets['GMC~2'].view.place.left === '50%', 'per-instance placement kept');
}

// ---- 5. Blank sfx rows survive with order (retired-crystalline Archetype [_]).
{
  const L = readLayered('spotlight-retired-crystalline');
  const arch = L.character.sets.Distinctions.traits.Archetype;
  ok(arch.traits.SFX && Object.keys(arch.traits.SFX.slots || {}).length === 2, 'sfx slots count', arch.traits.SFX);
}

// ---- 5b. Alien Us branch content: set die, sides, skills, statements.
{
  const L = readLayered('spotlight-alien-us');
  const ss = L.character.sets['Skills & Specialties'];
  ok(ss.view.setDie === 6, 'set die authored');
  ok(ss.view.labels &&
    ss.view.labels.left === 'Specialties' &&
    ss.view.labels.center === 'Skills' &&
    ss.view.labels.right === 'Specialties', 'branch labels authored');
  ok(JSON.stringify(ss.view.subtraitRatingScale) === '[8,10,12]', 'specialty scale authored');
  ok(JSON.stringify(Object.keys(ss.traits)) === JSON.stringify(['Bout', 'Chat', 'Find', 'Make', 'Play', 'Operate', 'Work']),
    'seven skills in sheet order', Object.keys(ss.traits));
  ok(ss.traits.Bout.value === undefined, 'skills unrated');
  ok(ss.traits.Bout.traits === undefined, 'no pre-filled specialties');
  ok(Object.keys(ss.traits.Bout.slots).join(',') === '0,1', 'blank specialty slots indexed');
  ok(ss.traits.Bout.slots['0'].view.branchSide === 'left', 'left slot marked');
  ok(ss.traits.Bout.slots['1'].view.branchSide === 'right', 'right slot marked');
  ok(L.character.sets['Session Record'].view.sessionRecord.orientation === 'horizontal', 'session horizontal authored');
  ok(L.version === 1, 'alien-us version baseline');
  const v = L.character.sets.Values;
  ok(v.view.style.body === 'default' && v.view.traitColumns === 2, 'values two-column style');
  ok((v.traits.Alien.description ?? '') === '', 'no pre-filled value statements');
  ok(JSON.stringify(Object.keys(v.traits)) === JSON.stringify(['Alien', 'Conformity', 'Materialism', 'Paranoia', 'Patriotism', 'Secrecy', 'Spirituality']), 'value names kept');
}

// ---- 6. Synthetic pool: canonical string out, expanded dice back.
{
  const d = M.unmigrateDieString('2d8d6', [], 'test');
  ok(d.value === 8 && JSON.stringify(d.dice) === JSON.stringify([8, 8, 6]), 'pool expands to dice array', d);
}

// ---- 7. Materialized characters from both forms are identical (spot check).
{
  const L = readLayered('spotlight-camp-bewilderwood');
  const orig = T.find((t) => t.id === 'spotlight-camp-bewilderwood');
  const back = M.unmigrateTemplateEntry(L).data;
  const fromOrig = F.mergeTemplateIntoCharacter({ id: 'c1', traitSets: [] }, orig);
  const fromBack = F.mergeTemplateIntoCharacter({ id: 'c1', traitSets: [] }, back);
  ok(F.deepEqual(fromOrig, fromBack), 'merged characters identical from both forms');
}

console.log(`template-parity-tests: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
