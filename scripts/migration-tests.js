// Migration shim regression tests (Phase-1 freeze, design/DECISIONS.md).
// Usage: node scripts/migration-tests.js  (exit 1 on failure)
const fs = require('fs');
const path = require('path');
const M = require('../js/migration.ts').cortexMigration;

let pass = 0, fail = 0;
function ok(cond, name, extra) {
  if (cond) { pass++; }
  else { fail++; console.log('  FAIL ' + name + (extra !== undefined ? ' :: ' + JSON.stringify(extra) : '')); }
}

const root = path.join(__dirname, '..');
const cortex = JSON.parse(fs.readFileSync(path.join(root, 'data/templates/Sendak_Eggers.cortex.json'), 'utf8'));
const layered = JSON.parse(fs.readFileSync(path.join(root, 'data/templates/Sendak_Eggers.layered.json'), 'utf8'));

// ---- 1. Reference file migrates to the reference shape.
{
  const { data, warnings } = M.migrateCharacter(cortex);
  ok(data && typeof data === 'object', 'migrate returns data');
  ok(warnings.length > 0, 'filler/presentation drops are reported', warnings.length);
  ok(JSON.stringify(Object.keys(data.sets).sort()) === JSON.stringify(Object.keys(layered.sets).sort()),
    'set names match reference', Object.keys(data.sets));
  const asRating = (raw) => (raw && typeof raw === 'object' ? raw.rating : undefined);
  for (const setName of Object.keys(layered.sets)) {
    for (const tName of Object.keys(layered.sets[setName].traits)) {
      const want = asRating(layered.sets[setName].traits[tName]);
      const got = asRating(data.sets[setName] && data.sets[setName].traits[tName]);
      ok(got && want && got.type === want.type && JSON.stringify(got.value) === JSON.stringify(want.value), `die kept ${setName}/${tName}`, got);
    }
  }
  ok(data.sets.Attributes.traits.Strength.rating && data.sets.Attributes.traits.Strength.rating.type === 'Die' &&
    JSON.stringify(data.sets.Attributes.traits.Strength.rating.value) === '[8]', 'single-die rating object');
  ok(data.sets.Distinctions.traits.Druid.rating && data.sets.Distinctions.traits.Druid.rating.type === 'Die' &&
    JSON.stringify(data.sets.Distinctions.traits.Druid.rating.value) === '[10]', 'die kept alongside SFX traits');
  const hinder = (((data.sets.Distinctions.traits['Half-Orc'] || {}).traits || {}).SFX || {}).traits;
  ok(hinder && hinder.Hinder !== undefined, 'hinder literal becomes Hinder trait');
  const ath = data.sets.Skills.traits.Athletics;
  const subVal = (t, n) => t && t.traits && t.traits[n] && t.traits[n].rating && t.traits[n].rating.value;
  ok(ath && ath.rating && JSON.stringify(ath.rating.value) === '[6]' &&
    JSON.stringify(subVal(ath, 'Jump')) === '[6]' && JSON.stringify(subVal(ath, 'Swim')) === '[10]' && JSON.stringify(subVal(ath, 'Climb')) === '[8]',
    'subtraits recurse as maps', ath);
}

// ---- 2. Entity core carries top-level fields; envelope stays file-level.
{
  const { data } = M.migrateCharacter(cortex);
  ok(data.id === cortex.id, 'envelope id preserved');
  ok(data.version === cortex.version, 'envelope version preserved');
  ok(data.name === 'Sendak Eggers', 'name kept');
  ok(data.pronouns === 'he/him', 'pronouns kept');
  ok(data.description && data.description.length > 0, 'description kept');
  ok(data.game === undefined, 'empty game omitted');
  ok(data.plotPoints === undefined, 'zero plotPoints omitted');
  ok(data.portrait && typeof data.portrait.url === 'string' && data.portrait.url.length > 10, 'portrait preserved');
  ok(data.$schema === undefined, 'stale $schema pointer dropped');
}

// ---- 3. No old-model keys survive anywhere in the sets tree.
{
  const { data } = M.migrateCharacter(cortex);
  const blob = JSON.stringify(data.sets);
  for (const bad of ['"Trait description"', '"Trait set description"', '"_lid"', '"removedTraits"', '"removedSets"', '"cortexToolkit"', '"nounSingular"', '"ratingPosition"']) {
    ok(blob.indexOf(bad) === -1, `no ${bad} in sets tree`);
  }
  ok(blob.indexOf('"traits":[') === -1, 'no array-form traits');
  ok(blob.indexOf('"sfx":[') === -1, 'no array-form sfx');
}

// ---- 4. Multi-die ratings become Dice ratings (spendable, no pool flag).
{
  const old = {
    id: 'c1', name: 'P', traitSets: [
      { name: 'Resources', traits: [{ name: 'Ammo', value: 8, dice: [8, 8, 6], description: '', traits: [], sfx: [], tags: [], custom: {} }] },
    ],
  };
  const { data } = M.migrateCharacter(old);
  const ammo = data.sets.Resources.traits.Ammo;
  ok(ammo && ammo.rating && ammo.rating.type === 'Dice' && JSON.stringify(ammo.rating.value) === '[8,8,6]' &&
    ammo.spendable === true && ammo.pool === undefined, 'multi-die to Dice rating', ammo);
}

// ---- 5. removedTraits become local nulls.
{
  const old = {
    id: 'c1', name: 'P',
    traitSets: [{ name: 'S', traits: [], removedTraits: ['Gone'] }],
  };
  const { data, warnings } = M.migrateCharacter(old);
  ok(data.sets.S.traits.Gone === null, 'removal is a local null');
  ok(warnings.length === 0 || true, 'warnings optional here');
}

// ---- 6. removedSets resolve via template ids, need template context.
{
  const tplChar = { traitSets: [{ id: 'a1', name: 'Alpha', traits: [] }] };
  const old = { id: 'c1', name: 'P', traitSets: [], removedSets: ['a1'] };
  const withTpl = M.migrateCharacter(old, tplChar);
  ok(withTpl.data.sets.Alpha === null, 'removed set resolves to null by name');
  const noTpl = M.migrateCharacter(old);
  ok(noTpl.data.sets.Alpha === undefined && noTpl.warnings.some((w) => w.indexOf('removedSets') !== -1),
    'removedSets without template are reported, not kept');
}

// ---- 7. sfx objects keep descriptions; set-level sfx folds to traits.SFX.
{
  const old = {
    id: 'c1', name: 'P',
    traitSets: [{
      name: 'S', traits: [],
      sfx: [{ name: 'Push', description: 'Push it', tags: [], custom: {} }],
    }],
  };
  const { data } = M.migrateCharacter(old);
  ok(data.sets.S.traits.SFX.traits.Push.description === 'Push it', 'set sfx folds to SFX map');
}

// ---- 8. sheet.template becomes a merge-layer reference; prefs re-key to names.
{
  const old = {
    id: 'c1', name: 'P',
    sheet: { template: { id: 'tpl-x', version: 3 } },
    traitSets: [{ id: 's1', name: 'S', traits: [] }],
    prefs: { setOrder: ['s1', 'nope'], traitOrders: { s1: ['A'], nope: ['B'] } },
  };
  const { data, warnings } = M.migrateCharacter(old);
  ok(data.template && data.template.id === 'tpl-x' && data.template.version === 3, 'template ref kept');
  ok(data.sheet === undefined, 'sheet link leaves the entity core');
  ok(data.prefs && JSON.stringify(data.prefs.setOrder) === JSON.stringify(['S']), 'prefs setOrder re-keyed', data.prefs);
  ok(data.prefs && JSON.stringify(data.prefs.traitOrders) === JSON.stringify({ S: ['A'] }), 'prefs traitOrders re-keyed');
  ok(warnings.some((w) => w.indexOf('nope') !== -1), 'unresolvable prefs reported');
}

// ---- 9. Upstream envelopes unwrap; bad input returns null data.
{
  const up = { version: 2, data: { name: 'Up', traitSets: [] } };
  const r = M.migrateCharacter(up);
  ok(r.data && typeof r.data.id === 'string' && r.data.name === 'Up', 'upstream unwraps with fresh id');
  ok(M.migrateCharacter(null).data === null, 'null input fails clean');
  ok(M.migrateCharacter({ name: 'x' }).data === null, 'traitSets-less input fails clean');
}

// ---- 10. Unknown die sizes pass through with a warning, never invented.
{
  const old = {
    id: 'c1', name: 'P',
    traitSets: [{ name: 'S', traits: [{ name: 'Weird', value: 2, description: '', traits: [], sfx: [], tags: [], custom: {} }] }],
  };
  const { data, warnings } = M.migrateCharacter(old);
  const w = data.sets.S.traits.Weird;
  ok((w && w.rating && w.rating.type === 'Die' && JSON.stringify(w.rating.value) === '[2]') && warnings.some((x) => x.indexOf('unknown die size 2') !== -1),
    'unknown size surfaces with warning', w);
}

// ---- 11. Nested-grid placement migration (2026-10-19).
// Band keys become view.place (top from row, left/width from colWidth
// shares); full-width sets omit place; flags become view.parts.
{
  const char = {
    view: { columns: 2, columnsPage2: 3 },
    traitSets: [
      { name: 'A', view: { page: 1, track: 1, colWidth: 40, row: 2 } },
      { name: 'B', view: { page: 1, track: 2, row: 2 } },
      { name: 'C', view: { page: 1, span: 3, row: 3 } },
      { name: 'D', view: { page: 1, track: 1, colWidth: 30, row: 4, ratingPosition: 'below', ratingScale: [4, 6, 8, 10, 12] } },
      { name: 'E', view: { page: 1, track: 2, colWidth: 70, row: 4, attachedStress: { enabled: true, label: 'Stress', scale: [4, 6, 8, 10, 12] }, ratingScale: [4, 6, 8, 10, 12] } },
      { name: 'F', view: { page: 1, track: 1, row: 5, ratingPosition: 'vertical' } },
    ],
  };
  const warnings = M.migratePlacement(char);
  const sets = char.traitSets;
  const byName = (n) => sets.find((s) => s.name === n);
  // Row 2 (top 0): A 0/40 + B 40/60 (undeclared remainder splits two-track).
  ok(JSON.stringify(byName('A').view.place) === JSON.stringify({ left: '0%', top: 0, width: '40%', height: 1 }), 'set A place', byName('A').view.place);
  ok(JSON.stringify(byName('B').view.place) === JSON.stringify({ left: '40%', top: 0, width: '60%', height: 1 }), 'set B place', byName('B').view.place);
  // Full-width C omits place.
  ok(byName('C').view.place === undefined, 'full-width set omits place');
  // Below + inline stress become parts; flags removed.
  ok(byName('D').view.parts && byName('D').view.parts.name.top === 0 && byName('D').view.parts.rating.top === 1, 'below becomes parts rows', byName('D').view.parts);
  ok(byName('D').view.ratingPosition === undefined, 'ratingPosition removed');
  ok(byName('E').view.parts && byName('E').view.parts.track && byName('E').view.parts.trackLabel, 'stress becomes track cells', byName('E').view.parts);
  ok(byName('E').view.attachedStress === undefined, 'attachedStress removed');
  // Vertical ladders keep the legacy flag.
  ok(byName('F').view.parts === undefined && byName('F').view.ratingPosition === 'vertical', 'vertical stays legacy');
  // Band keys are gone everywhere.
  ok(sets.every((s) => ['track', 'span', 'widths', 'rowBreak', 'colWidth', 'rowSpan', 'colSpan', 'columnSpan', 'row'].every((k) => s.view[k] === undefined)), 'band keys deleted');
  // Sheet level
  ok(char.view.columns === undefined, 'columns deleted from sheet');
  ok(char.view.columnsPage2 === undefined, 'columnsPage2 deleted from sheet');
  // No collisions in this fixture.
  ok(warnings.filter((w) => w.indexOf('collision') !== -1).length === 0, 'zero collisions', warnings);
}

// ---- 11b. Collisions surface, bare numbers normalize, classic untouched.
{
  const char = {
    traitSets: [
      { name: 'A', view: { page: 1, place: { left: '0%', top: 0, width: '60%', height: 1 } } },
      { name: 'B', view: { page: 1, place: { left: '50%', top: 0, width: '50%', height: 1 } } },
      { name: 'C', view: { page: 1, place: { left: 0, top: 1, width: 100, height: 1 } } },
      { name: 'D', view: { page: 1, location: 'right' } },
    ],
  };
  const warnings = M.migratePlacement(char);
  ok(warnings.some((w) => w.indexOf('collision') !== -1), 'overlap surfaces', warnings);
  ok(char.traitSets[3].view.place.left === '0%' && char.traitSets[3].view.place.width === '100%', 'bare numbers normalize to "%" strings', char.traitSets[3].view.place);
  ok(char.traitSets[4].view.location === 'right' && char.traitSets[4].view.place === undefined, 'classic set untouched');
}

// ---- 11c. Idempotent: a second pass changes nothing (first pass may add
// the Name set; the second must be stable).
{
  const char = {
    traitSets: [
      { name: 'A', view: { page: 1, place: { left: '0%', top: 0, width: '40%', height: 1 }, parts: { name: { left: '0%', top: 0, width: '100%', height: 1 } } } },
    ],
  };
  M.migratePlacement(char);
  const afterFirst = JSON.stringify(char);
  ok(char.traitSets[0].id === 'name', 'first pass synthesizes the name set first');
  M.migratePlacement(char);
  ok(JSON.stringify(char) === afterFirst, 'second pass is a no-op');
}

// ---- 12. normalizeView migration seam.
{
  // 12a. The cortexToolkit compartment passes through normalizeView
  // untouched (access-time promotion lives in ensureView, not here).
  const obj1 = {
    custom: { cortexToolkit: { columns: 2 } },
    portrait: { custom: { cortexToolkit: { size: 'spotlight' } } },
    traitSets: [
      { name: 'Distinctions', custom: { cortexToolkit: { style: { header: 'default', body: 'default' } } } },
    ],
  };
  M.normalizeView(obj1);
  ok(obj1.custom && obj1.custom.cortexToolkit && obj1.custom.cortexToolkit.columns === 2, 'char compartment passes through');
  ok(obj1.portrait.custom && obj1.portrait.custom.cortexToolkit, 'portrait compartment passes through');
  const dset = obj1.traitSets.find((s) => s.name === 'Distinctions');
  ok(dset.custom && dset.custom.cortexToolkit, 'set compartment passes through');

  // 12b. View bags pass through untouched.
  const obj2 = {
    view: { columns: 3, pageCount: 2 },
    custom: { cortexToolkit: { columns: 2, pageCount: 1, extraKey: 'legacy' } },
  };
  M.normalizeView(obj2);
  ok(obj2.view.columns === 3, 'view untouched (columns)');
  ok(obj2.view.pageCount === 2, 'view untouched (pageCount)');
  ok(obj2.view.extraKey === undefined, 'nothing merges into view');
  ok(obj2.custom && obj2.custom.cortexToolkit, 'compartment untouched');

  // 12c. Non-compartment custom keys pass through untouched.
  const obj3 = {
    custom: {
      stress: { physical: 6, mental: 8 },
    },
  };
  M.normalizeView(obj3);
  ok(obj3.custom && obj3.custom.stress && obj3.custom.stress.physical === 6, 'custom.stress preserved');

  // 12d. Name set synthesis: legacy files predate the name block.
  const obj4 = {
    name: 'Hero', player: 'Maya',
    view: {},
    traitSets: [{ id: 'd', name: 'Distinctions', traits: [], sfx: [] }],
  };
  M.normalizeView(obj4);
  ok(obj4.traitSets[0].id === 'name' && obj4.traitSets[0].view.style.body === 'name', 'name set synthesized first');
  ok(obj4.traitSets[0].traits.length === 0, 'synthesis adds no traits');
  ok(obj4.traitSets[1].name === 'Distinctions', 'content sets keep order');

  // 12e. Existing name sets pass through untouched (no duplicates).
  const obj5 = {
    traitSets: [{ id: 'name', name: 'Name', traits: [{ name: 'player', label: 'Coach' }], sfx: [], view: { style: { body: 'name' } } }],
  };
  M.normalizeView(obj5);
  ok(obj5.traitSets.length === 1 && obj5.traitSets[0].traits.length === 1, 'name set untouched', obj5.traitSets.length);

  // 12f. Layered entities gain a Name key.
  const obj6 = { sets: { Distinctions: { id: 'distinctions', traits: {} } } };
  M.normalizeView(obj6);
  ok(obj6.sets.Name && obj6.sets.Name.id === 'name', 'layered name set synthesized', Object.keys(obj6.sets));

  // 12g. Pruned stored name sets (view bag dropped as inherited) are
  // recognized by id and never overwritten with empty shells.
  const obj7 = { sets: { Name: { id: 'name', traits: { pronouns: { label: 'Ruin' } } } } };
  M.normalizeView(obj7);
  ok(obj7.sets.Name.traits.pronouns && obj7.sets.Name.traits.pronouns.label === 'Ruin', 'stored name overrides survive normalize', obj7.sets.Name.traits);
}

// ---- 13. Sheet style: view.style.sheet is the only stored key.
{
  // 13a. Stored style.sheet passes through untouched.
  const a = { view: { style: { sheet: 'spotlight' }, columns: 2 }, traitSets: [] };
  M.normalizeView(a);
  ok(a.view.style.sheet === 'spotlight', 'style.sheet passes through', a.view);

  // 13b. Bare files carry no sheet key (reads default classic).
  const d = { view: {}, traitSets: [] };
  M.normalizeView(d);
  ok(d.view.style === undefined, 'no sheet key synthesized', d.view);

  // 13c. Visibility words pass through untouched.
  const h = {
    view: {},
    traitSets: [{
      id: 'd', name: 'Distinctions', traits: [
        { name: 'A', value: 8, dice: [8], traits: [], sfx: [], view: { visibility: 'hidden' } },
        { name: 'B', value: 8, dice: [8], traits: [], sfx: [], view: { visibility: 'shown' } },
        { name: 'C', value: 8, dice: [8], traits: [], sfx: [], view: { visibility: 'editor-only' } },
      ], sfx: [],
    }],
  };
  M.normalizeView(h);
  const [ha, hb, hc] = h.traitSets[1].traits;
  ok(ha.view.visibility === 'hidden', 'hidden carries', ha.view);
  ok(hb.view.visibility === 'shown', 'shown carries', hb.view);
  ok(hc.view.visibility === 'editor-only', 'editor-only carries', hc.view);
  ok(ha.rating && ha.rating.type === 'Die' && JSON.stringify(ha.rating.value) === '[8]', 'ratings convert alongside', ha.rating);
}

// ---- 14. Canonical data passes through untouched (normalize is idempotent).
{
  const s = {
    view: { style: { sheet: 'spotlight' } },
    traitSets: [{
      id: 'sr', name: 'Sessions', noun: 'Session', plural: 'Sessions',
      rating: { type: 'Pip', value: [true, false], range: [12] },
      traits: [{ name: 'First', rating: { type: 'Pip', value: [true], range: [1] }, description: '', traits: [], sfx: [], tags: [] }],
      sfx: [],
      view: { style: { header: 'default', body: 'pips' }, pips: { labels: true, perRow: 12 }, reservedSlots: 12 },
    }],
  };
  M.normalizeView(s);
  const before = JSON.stringify(s);
  M.normalizeView(s);
  ok(JSON.stringify(s) === before, 'second pass is a no-op');
  const set = s.traitSets.find((x) => x.id === 'sr');
  ok(set.rating && set.rating.type === 'Pip' && set.rating.range[0] === 12, 'set Pip rating untouched', set.rating);
  ok(set.noun === 'Session' && set.plural === 'Sessions', 'nouns untouched');
}

// ---- 14. Statement dissolve: the old trait-level pair becomes a child trait.
{
  const { toLayeredEntity } = require('../js/layered-materialize.ts');
  const oldChar = (trait, setExtra) => ({
    id: 's1', name: 'Statements',
    traitSets: [{
      id: 'bond', name: 'Bonds', traits: [trait],
      view: { style: { header: 'default', body: 'default' } },
      ...(setExtra || {}),
    }],
  });
  const trait = (extra) => ({
    name: 'Bond', description: '', traits: [], sfx: [], tags: [],
    ...(extra || {}),
  });
  const migrated = (extra, setExtra) => M.migrateCharacter(oldChar(trait(extra), setExtra)).data.sets.Bonds.traits.Bond;

  // 14a. statement + questioned true -> child named for the sentence, filled.
  const q = migrated({ statement: 'saved my life', questioned: true }, { statement: true });
  ok(q.statement === undefined && q.questioned === undefined,
    'old statement/questioned keys gone after migration', q);
  ok(q.traits.Statement.traits['saved my life'].rating.value[0] === true,
    'questioned statement becomes a filled child pip', q);

  // 14b. statement without questioned -> unfilled child.
  const u = migrated({ statement: 'owes me big', questioned: false }, { statement: true });
  ok(u.traits.Statement.traits['owes me big'].rating.value[0] === false,
    'unquestioned statement becomes an unfilled child pip', u);

  // 14c. description is the fallback sentence in a statement context.
  const d = migrated({ description: 'They owe me a drydock bay.' }, { statement: true });
  ok(d.traits.Statement.traits['They owe me a drydock bay.'].rating.value[0] === false,
    'description falls back to a statement child in a statement set', d);
  ok(d.description === 'They owe me a drydock bay.', 'description is kept alongside the child');

  // 14d. outside a statement context a description stays a description.
  const n = migrated({ description: 'Just a note' });
  ok(n.traits === undefined && n.description === 'Just a note',
    'non-statement description does not grow a statement child', n);

  // 14e. questioned without any sentence has no home: warn, never invent.
  const x = M.migrateCharacter(oldChar(trait({ questioned: true }), { statement: true }));
  const xTrait = x.data.sets.Bonds.traits.Bond;
  ok(xTrait.traits === undefined, 'questioned with no text leaves no child', xTrait);
  ok(x.warnings.some((w) => w.indexOf('questioned statement had no text') !== -1),
    'questioned with no text is reported', x.warnings);

  // 14f. Template slots dissolve too (blank print slots keep their index).
  const tpl = M.migrateTemplateEntry({
    id: 'x', version: 1,
    character: oldChar({ name: '', description: '', traits: [], sfx: [], tags: [], statement: 'saved my life', questioned: true }, { statement: true }),
  });
  const ts = tpl.data.character.sets.Bonds.slots['0'];
  ok(ts && ts.statement === undefined && ts.traits.Statement.traits['saved my life'].rating.value[0] === true,
    'template slot statement dissolves into a filled child', ts);

  // 14g. Stored-character normalization dissolves the same pair in place.
  const stored = {
    traitSets: [{
      name: 'Values', statement: true, traits: [
        { name: 'Craft', description: '', statement: 'Form and function', questioned: true, traits: [], sfx: [], tags: [], custom: { questioned: true } },
      ],
    }],
  };
  M.normalizeView(stored);
  const st = stored.traitSets.find((s) => s.name === 'Values').traits[0];
  ok(st.statement === undefined && st.questioned === undefined && st.custom === undefined,
    'normalizeView removes old keys', st);
  ok(st.traits[0].name === 'Statement' && st.traits[0].traits[0].name === 'Form and function'
    && st.traits[0].traits[0].rating.value[0] === true, 'normalizeView writes the filled child', st.traits);
  const storedBefore = JSON.stringify(stored);
  M.normalizeView(stored);
  ok(JSON.stringify(stored) === storedBefore, 'normalizeView dissolve is idempotent');

  // 14h. Export emits no trait-level statement/questioned, even from a render
  // character still carrying the old keys.
  const render = {
    name: 'Export', traitSets: [{
      id: 'bond', name: 'Bonds', traits: [trait({
        statement: 'saved my life', questioned: true, custom: { questioned: true }, view: { questioned: true },
        traits: [{ name: 'Statement', traits: [{ name: 'saved my life', rating: { type: 'Pip', value: [true] }, traits: [] }] }],
      })],
    }],
  };
  const entity = toLayeredEntity(render);
  const raw = JSON.stringify(entity);
  ok(raw.indexOf('"statement"') === -1 && raw.indexOf('"questioned"') === -1,
    'export has zero trait-level statement/questioned keys', raw);
  ok(entity.sets.Bonds.traits.Bond.traits.Statement.traits['saved my life'].rating.value[0] === true,
    'export keeps the child pip');

  // 14i. Re-normalizing migrated layered data is a no-op.
  const again = M.migrateTemplateEntry({ id: 'x', version: 1, character: oldChar({ name: '', description: '', traits: [], sfx: [], tags: [], statement: 'saved my life', questioned: true }, { statement: true }) });
  const before = JSON.stringify(again.data);
  M.normalizeView(again.data);
  ok(JSON.stringify(again.data) === before, 're-normalizing migrated layered data is a no-op');
}

// ---- 15. Attached stress dissolve & layout area rename (Phase 2, item 3)
{
  // 15a. Custom-scale migration seeds value-less companions with the scale and sets labels.stress
  const customScaleSet = {
    name: 'Attributes',
    ratingPosition: 'below',
    view: {
      ratingScale: [6, 8, 10, 12],
      attachedStress: {
        enabled: true,
        label: 'STRESS',
        ratingScale: [6, 8, 10, 12],
        scale: [6, 8, 10, 12],
        includeOut: false,
      },
    },
    traits: [
      { name: 'Prowess', traits: [] },
      { name: 'Control', traits: [] },
      { name: 'Renown', traits: [] },
    ],
  };
  const resCustom = M.migrateSetParts(customScaleSet, customScaleSet.view);
  ok(resCustom === 'parts', 'custom scale migrates to parts instead of bailing to legacy');
  ok(customScaleSet.view.attachedStress === undefined, 'declaration removed');
  ok(customScaleSet.view.labels && customScaleSet.view.labels.track === 'STRESS', 'label migrated to labels.track');
  ok(customScaleSet.view.parts && customScaleSet.view.parts.track && customScaleSet.view.parts.trackLabel, 'track parts created');
  ok(customScaleSet.traits[0].traits.length === 1, 'Prowess has 1 companion seeded');
  const seeded = customScaleSet.traits[0].traits[0];
  ok(seeded.name === 'STRESS' && seeded.rating.type === 'Die' && seeded.rating.value.length === 0, 'value-less companion seeded');
  ok(JSON.stringify(seeded.rating.range) === '[6,8,10,12]', 'companion carries custom scale range');
  ok(customScaleSet.traits[1].traits.length === 1 && customScaleSet.traits[2].traits.length === 1, 'all traits in set seeded');

  // 15b. Default-scale migration seeds nothing
  const defaultScaleSet = {
    name: 'Skills',
    ratingPosition: 'inline',
    view: {
      ratingScale: [4, 6, 8, 10, 12],
      attachedStress: {
        enabled: true,
        label: 'Stress',
        scale: [4, 6, 8, 10, 12],
      },
    },
    traits: [
      { name: 'Fight', traits: [] },
      { name: 'Sneak', traits: [] },
    ],
  };
  const resDefault = M.migrateSetParts(defaultScaleSet, defaultScaleSet.view);
  ok(resDefault === 'parts', 'default scale migrates to parts');
  ok(defaultScaleSet.view.attachedStress === undefined, 'default declaration removed');
  ok(defaultScaleSet.view.labels?.track === undefined, 'default label stays implicit');
  ok(defaultScaleSet.traits[0].traits.length === 0 && defaultScaleSet.traits[1].traits.length === 0, 'default scale seeds nothing');

  // 15c. includeOut: true migrates to outIndicator: true
  const includeOutSet = {
    name: 'Powers',
    ratingPosition: 'inline',
    view: {
      outIndicator: false,
      attachedStress: {
        enabled: true,
        includeOut: true,
      },
    },
    traits: [{ name: 'Flight', traits: [] }],
  };
  M.migrateSetParts(includeOutSet, includeOutSet.view);
  ok(includeOutSet.view.outIndicator === true, 'includeOut: true migrates to outIndicator: true');
  ok(includeOutSet.view.attachedStress === undefined, 'declaration deleted');

  // 15d. Layered format with non-default scale seeds object-form companions
  const layeredSet = {
    name: 'Attributes',
    view: {
      attachedStress: {
        enabled: true,
        label: 'STRESS',
        scale: [6, 8, 10, 12],
      },
    },
    traits: {
      Prowess: {},
      Control: {},
    },
  };
  M.migrateSetParts(layeredSet, layeredSet.view);
  ok(layeredSet.traits.Prowess.traits && layeredSet.traits.Prowess.traits.STRESS, 'layered trait received STRESS companion');
  ok(JSON.stringify(layeredSet.traits.Prowess.traits.STRESS.rating.range) === '[6,8,10,12]', 'layered companion range matches scale');
}

// =====================================================================
// Section 16: migrateStyleBody (game-named style.body -> structural ID)
// =====================================================================
{
  const ch = {
    name: 'Legacy Styles',
    traitSets: [
      { name: 'Distinctions', view: { style: { header: 'distinctions', body: 'distinctions' } }, traits: [] },
      { name: 'Assets', view: { style: { header: 'assets', body: 'assets' } }, traits: [] },
      { name: 'Resources', view: { style: { header: 'resources', body: 'resources' } }, traits: [] },
      { name: 'Stress', view: { style: { header: 'stress', body: 'stress' } }, traits: [] },
      { name: 'Attributes', view: { style: { header: 'attributes', body: 'attributes' } }, traits: [] },
    ],
  };
  M.normalizeView(ch);
  const byName = Object.fromEntries(ch.traitSets.map(s => [s.name, s]));
  ok(byName.Distinctions.view.style.body === 'sfx-rows' && byName.Distinctions.view.style.header === 'sfx-rows', 'distinctions migrated to sfx-rows');
  ok(byName.Assets.view.style.body === 'boxed-rows' && byName.Assets.view.style.header === 'boxed-rows', 'assets migrated to boxed-rows');
  ok(byName.Resources.view.style.body === 'pool-rows' && byName.Resources.view.style.header === 'pool-rows', 'resources migrated to pool-rows');
  ok(byName.Stress.view.style.body === 'die-track' && byName.Stress.view.style.header === 'die-track', 'stress migrated to die-track');
  ok(byName.Attributes.view.style.body === 'portrait-ring' && byName.Attributes.view.style.header === 'portrait-ring', 'attributes migrated to portrait-ring');
}

console.log(`migration-tests: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);

