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

console.log(`migration-tests: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
