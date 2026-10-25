// SFX cost vocabulary regression tests (objects, never bare numbers;
// pool costs payable from the staged dice pool).
// Usage: node scripts/cost-tests.js  (exit 1 on failure)
const F = require('../js/functions.ts').cortexFunctions;
const M = require('../js/migration.ts').cortexMigration;
const { materializeCharacter, toLayeredEntity } = require('../js/layered-materialize.ts');

let pass = 0, fail = 0;
function ok(cond, name, extra) {
  if (cond) { pass++; }
  else { fail++; console.log('  FAIL ' + name + (extra !== undefined ? ' :: ' + JSON.stringify(extra) : '')); }
}

// ---- 1. Cost words.
{
  ok(F.sfxCostText(undefined) === '', 'absent cost renders empty');
  ok(F.sfxCostText('2') === '', 'bare number renders empty, never a bare number');
  ok(F.sfxCostText({}) === '', 'empty cost renders empty');
  ok(F.sfxCostText({ plotPoints: 2 }) === '2 PP', 'plot points words', F.sfxCostText({ plotPoints: 2 }));
  ok(F.sfxCostText({ pool: 'drop-highest' }) === 'drop highest die', 'drop-highest words');
  ok(F.sfxCostText({ pool: 'drop-die' }) === 'drop a die', 'drop-die words');
  ok(F.sfxCostText({ pool: 'split-largest' }) === 'split largest die', 'split-largest words');
  ok(F.sfxCostText({ stepUp: 'Strength' }) === 'step up Strength', 'step-up words');
  ok(F.sfxCostText({ stepDown: 'Smarts' }) === 'step down Smarts', 'step-down words');
  ok(F.sfxCostText({ narrative: true }) === 'narrative beat', 'narrative words');
  ok(F.sfxCostText({ plotPoints: 1, pool: 'drop-die' }) === '1 PP, drop a die', 'keys join in order');
  ok(F.sfxCostText({ pool: 'bogus' }) === '', 'unknown pool op renders empty');
  ok(F.sfxCostText({ plotPoints: 0 }) === '', 'zero plot points renders empty');
}

// ---- 2. Old-form sfx arrays carry costs into the layered map.
{
  const w = [];
  const got = M.migrateSfxArray([
    { name: 'Second Wind', description: 'Push on.', cost: { pool: 'drop-die' } },
    { name: 'Heavy Purse', description: 'Pay up.', cost: { plotPoints: 2, stepUp: 'Strength' } },
    { name: '', description: 'Blank row.', cost: { narrative: true } },
    { name: 'Bare', description: 'Bare number.', cost: 2 },
    'hinder',
  ], w, 'test');
  ok(got.map['Second Wind'] && JSON.stringify(got.map['Second Wind'].cost) === '{"pool":"drop-die"}', 'named cost carried', got.map['Second Wind']);
  ok(got.map['Heavy Purse'] && JSON.stringify(got.map['Heavy Purse'].cost) === '{"plotPoints":2,"stepUp":"Strength"}', 'multi-key cost carried');
  const slotKeys = Object.keys(got.slots);
  ok(slotKeys.length === 1 && JSON.stringify(got.slots[slotKeys[0]].cost) === '{"narrative":true}', 'slot cost carried', got.slots);
  ok(got.map['Bare'] && got.map['Bare'].cost === undefined, 'bare-number cost dropped');
  ok(w.some((x) => x.indexOf('non-object cost') !== -1), 'bare-number cost warns', w);
  ok(got.map['Hinder'] !== undefined, 'hinder literal still maps');
}

// ---- 3. Template entry round-trip keeps costs, warning-free.
const costEntry = {
  id: 'cost-test',
  character: {
    name: 'Cost Test',
    traitSets: [
      {
        id: 'dist', name: 'Distinctions',
        traits: [
          {
            name: 'Kind', description: 'Kindly.', dice: ['d8'],
            traits: [],
            sfx: [
              { name: 'Second Wind', description: 'Push on.', tags: [], cost: { pool: 'drop-die' } },
              { name: 'Heavy Purse', description: 'Pay up.', tags: [], cost: { plotPoints: 2, stepDown: 'Smarts' } },
            ],
          },
        ],
        sfx: [
          { name: 'Set Trick', description: 'Set-wide.', tags: [], cost: { pool: 'split-largest', narrative: true } },
        ],
      },
    ],
  },
};
{
  const wantKindCosts = costEntry.character.traitSets[0].traits[0].sfx.map((e) => e.cost);
  const wantSetCosts = costEntry.character.traitSets[0].sfx.map((e) => e.cost);
  const live = JSON.parse(JSON.stringify(costEntry));
  const fresh = M.migrateTemplateEntry(live);
  ok(fresh.data !== null, 'cost entry migrates');
  const dist = fresh.data && fresh.data.character && fresh.data.character.sets && fresh.data.character.sets['Distinctions'];
  const kindSfx = dist && dist.traits && dist.traits['Kind'] && dist.traits['Kind'].traits && dist.traits['Kind'].traits.SFX;
  ok(kindSfx && JSON.stringify(kindSfx.traits['Second Wind'].cost) === '{"pool":"drop-die"}', 'trait sfx cost lands layered');
  ok(kindSfx && JSON.stringify(kindSfx.traits['Heavy Purse'].cost) === '{"plotPoints":2,"stepDown":"Smarts"}', 'trait sfx keys land layered');
  const setSfx = dist && dist.traits && dist.traits.SFX;
  ok(setSfx && JSON.stringify(setSfx.traits['Set Trick'].cost) === '{"pool":"split-largest","narrative":true}', 'set sfx cost lands layered');
  const back = M.unmigrateTemplateEntry(fresh.data);
  const backDist = back.data && back.data.character.traitSets.find((ts) => ts.name === 'Distinctions');
  const backKind = backDist && backDist.traits.find((t) => t.name === 'Kind');
  ok(backKind && F.deepEqual(backKind.sfx.map((e) => e.cost), wantKindCosts), 'trait sfx costs restore', backKind && backKind.sfx);
  ok(backDist && F.deepEqual(backDist.sfx.map((e) => e.cost), wantSetCosts), 'set sfx costs restore', backDist && backDist.sfx);
  ok(back.warnings.length === 0, 'costed sfx stays warning-free', back.warnings);
}

// ---- 4. Render codec round-trips costs.
{
  const src = {
    name: 'Cost Codec', traitSets: [
      {
        id: 'dist', name: 'Distinctions',
        traits: [
          {
            name: 'Kind', description: 'Kindly.', traits: [], tags: [],
            rating: { type: 'Die', value: [8], range: [4, 6, 8, 10, 12] },
            sfx: [
              { name: 'Second Wind', description: 'Push on.', tags: [], cost: { pool: 'drop-highest' } },
            ],
          },
        ],
        sfx: [],
      },
    ],
  };
  const back = materializeCharacter(toLayeredEntity(JSON.parse(JSON.stringify(src))), src);
  const kind = back.traitSets[0].traits[0];
  ok(kind && JSON.stringify(kind.sfx[0].cost) === '{"pool":"drop-highest"}', 'render codec keeps sfx cost', kind && kind.sfx);
}

console.log(`cost-tests: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
