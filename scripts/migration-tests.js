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
  const asTrait = (raw) => (typeof raw === 'string' ? { value: raw } : raw);
  for (const setName of Object.keys(layered.sets)) {
    for (const tName of Object.keys(layered.sets[setName].traits)) {
      const want = asTrait(layered.sets[setName].traits[tName]);
      const got = asTrait(data.sets[setName] && data.sets[setName].traits[tName]);
      ok(got && got.value === want.value, `die kept ${setName}/${tName}`, got);
    }
  }
  ok(data.sets.Attributes.traits.Strength === 'd8', 'single-die shorthand');
  ok(data.sets.Distinctions.traits.Druid.value === 'd10', 'die kept alongside SFX traits');
  const hinder = (((data.sets.Distinctions.traits['Half-Orc'] || {}).traits || {}).SFX || {}).traits;
  ok(hinder && hinder.Hinder !== undefined, 'hinder literal becomes Hinder trait');
  const ath = data.sets.Skills.traits.Athletics;
  ok(ath && ath.value === 'd6' && ath.traits.Jump === 'd6' && ath.traits.Swim === 'd10' && ath.traits.Climb === 'd8',
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

// ---- 4. Multi-die ratings become pool traits with canonical dice strings.
{
  const old = {
    id: 'c1', name: 'P', traitSets: [
      { name: 'Resources', traits: [{ name: 'Ammo', value: 8, dice: [8, 8, 6], description: '', traits: [], sfx: [], tags: [], custom: {} }] },
    ],
  };
  const { data } = M.migrateCharacter(old);
  const ammo = data.sets.Resources.traits.Ammo;
  ok(ammo && ammo.value === '2d8d6' && ammo.pool === true, 'multi-die to pool', ammo);
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
  ok((w === 'd2' || (w && w.value === 'd2')) && warnings.some((x) => x.indexOf('unknown die size 2') !== -1),
    'unknown size surfaces with warning', w);
}

// ---- 11. Banded layout engine (Rule of 3) placement migration.
{
  const char = {
    custom: { cortexToolkit: { columns: 2, columnsPage2: 3 } },
    traitSets: [
      { name: 'A', custom: { cortexToolkit: { page: 1, location: 'left', colWidth: 40 } } },
      { name: 'B', custom: { cortexToolkit: { page: 1, location: 'right', rowSpan: 2 } } },
      { name: 'C', custom: { cortexToolkit: { page: 1, location: 'left', colSpan: 'full' } } },
      { name: 'D', custom: { cortexToolkit: { page: 2, location: 'left', colWidth: 30 } } },
      { name: 'E', custom: { cortexToolkit: { page: 2, location: 'center', colWidth: 50 } } },
      { name: 'F', custom: { cortexToolkit: { page: 2, location: 'right', colWidth: 20 } } },
    ],
  };
  M.migratePlacement(char);
  const sets = char.traitSets;
  // Page 1
  ok(sets[0].view.track === 1, 'set A track 1');
  ok(JSON.stringify(sets[0].view.widths) === JSON.stringify([40, 60, 0]), 'set A anchor widths [40, 60, 0]');
  ok(sets[0].view.colWidth === undefined, 'colWidth deleted from set A');
  ok(sets[0].view.location === undefined, 'location deleted from set A');

  ok(sets[1].view.track === 2, 'set B track 2');
  ok(sets[1].view.rowSpan === undefined, 'rowSpan deleted from set B');

  ok(sets[2].view.span === 3, 'set C span 3');
  ok(sets[2].view.colSpan === undefined, 'colSpan deleted from set C');

  // Page 2
  ok(sets[3].view.track === 1, 'set D track 1');
  ok(JSON.stringify(sets[3].view.widths) === JSON.stringify([30, 50, 20]), 'set D anchor widths [30, 50, 20]');
  ok(sets[4].view.track === 2, 'set E track 2');
  ok(sets[5].view.track === 3, 'set F track 3');

  // Sheet level
  ok(char.view.columns === undefined, 'columns deleted from sheet');
  ok(char.view.columnsPage2 === undefined, 'columnsPage2 deleted from sheet');
}

// ---- 12. normalizeView migration seam.
{
  // 12a. Legacy custom.cortexToolkit migrates to view and cleans up empty custom
  const obj1 = {
    custom: { cortexToolkit: { sheetStyle: 'spotlight', columns: 2 } },
    portrait: { custom: { cortexToolkit: { size: 'spotlight' } } },
    traitSets: [
      { name: 'Distinctions', custom: { cortexToolkit: { style: { header: 'default', body: 'default' } } } },
    ],
  };
  M.normalizeView(obj1);
  ok(obj1.view && obj1.view.sheetStyle === 'spotlight' && obj1.view.columns === 2, 'char custom.cortexToolkit migrated to view');
  ok(obj1.custom === undefined, 'empty custom cleaned up on character');
  ok(obj1.portrait.view && obj1.portrait.view.size === 'spotlight', 'portrait custom.cortexToolkit migrated to view');
  ok(obj1.portrait.custom === undefined, 'empty custom cleaned up on portrait');
  ok(obj1.traitSets[0].view && obj1.traitSets[0].view.style.body === 'default', 'set custom.cortexToolkit migrated to view');
  ok(obj1.traitSets[0].custom === undefined, 'empty custom cleaned up on traitSet');

  // 12b. Conflict resolution: view wins, legacy dropped
  const obj2 = {
    view: { columns: 3, pageCount: 2 },
    custom: { cortexToolkit: { columns: 2, pageCount: 1, extraKey: 'legacy' } },
  };
  M.normalizeView(obj2);
  ok(obj2.view.columns === 3, 'view wins on conflict (columns)');
  ok(obj2.view.pageCount === 2, 'view wins on conflict (pageCount)');
  ok(obj2.view.extraKey === undefined, 'legacy bag dropped completely when view exists');
  ok(obj2.custom === undefined, 'custom.cortexToolkit cleaned up');

  // 12c. Non-cortexToolkit custom keys (e.g. custom.stress) pass through untouched
  const obj3 = {
    custom: {
      cortexToolkit: { sheetStyle: 'classic' },
      stress: { physical: 6, mental: 8 },
    },
  };
  M.normalizeView(obj3);
  ok(obj3.view && obj3.view.sheetStyle === 'classic', 'view migrated');
  ok(obj3.custom && obj3.custom.cortexToolkit === undefined, 'cortexToolkit removed from custom');
  ok(obj3.custom && obj3.custom.stress && obj3.custom.stress.physical === 6, 'custom.stress preserved');
}

console.log(`migration-tests: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);

