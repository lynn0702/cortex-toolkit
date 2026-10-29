// Rating model tests (2026-10-23 brief §1): one shape, canonical
// readings, spend/restore beside the rating, hitches flood + exemption.
// Usage: node scripts/rating-tests.js  (exit 1 on failure)
const M = require('../js/migration.ts').cortexMigration;
const { getRating, ratingDice, setRatingDice, setRatingDie, isRated,
  availableDice, getSpentIndices, resolveHitches, rollSeparate, keepsExtraDice,
  hasOutRange, rangeTop, isOutDie, applyTypeScopedRange,
  DIE_LADDER } = require('../js/model.ts');

let pass = 0, fail = 0;
function ok(cond, name, extra) {
  if (cond) { pass++; }
  else { fail++; console.log('  FAIL ' + name + (extra !== undefined ? ' :: ' + JSON.stringify(extra) : '')); }
}

// ---- 1. Rating read/write primitives.
{
  ok(JSON.stringify(DIE_LADDER) === '[4,6,8,10,12]', 'die ladder');
  const t = {};
  ok(!isRated(t), 'unrated is absence');
  setRatingDice(t, [10]);
  ok(isRated(t) && t.rating.type === 'Die' && JSON.stringify(t.rating.value) === '[10]', 'single die rates Die', t.rating);
  setRatingDice(t, [10, 8, 6]);
  ok(t.rating.type === 'Dice' && JSON.stringify(t.rating.value) === '[10,8,6]', 'several dice rate Dice', t.rating);
  ok(JSON.stringify(ratingDice(getRating(t))) === '[10,8,6]', 'ratingDice reads the array');
  setRatingDice(t, []);
  ok(!isRated(t) && t.rating === undefined, 'empty clears to unrated');
  setRatingDie(t, 8);
  ok(t.rating.type === 'Die' && JSON.stringify(t.rating.value) === '[8]', 'step sets the die');
  setRatingDie(t, null);
  ok(!isRated(t), 'step to null unrates');
  // Legacy reads through (import compat), never writes.
  ok(JSON.stringify(ratingDice(getRating({ value: 8 }))) === '[8]', 'legacy single reads');
  ok(JSON.stringify(ratingDice(getRating({ dice: [8, 6] }))) === '[8,6]', 'legacy multi reads');
}

// ---- 2. Canonical readings exist exactly as written.
{
  const resource = { name: 'Ammo', rating: { type: 'Dice', value: [8, 8], range: [4, 6, 8, 10, 12] }, spendable: true, hitches: 0, pool: false };
  ok(getRating(resource).type === 'Dice' && JSON.stringify(ratingDice(getRating(resource))) === '[8,8]', 'Resource: Dice [8,8]');
  ok(resource.spendable === true && resource.hitches === 0 && resource.pool === false, 'Resource: spendable, hitches 0, pool false');
  ok(rollSeparate(resource) === true, 'Resource segregates (derived, stored nowhere)');
  ok(resource.rollSeparate === undefined, 'rollSeparate stored nowhere');

  const challenge = { name: 'Challenge Pool', rating: { type: 'Dice', value: [10, 8, 6], range: [4, 6, 8, 10, 12] }, pool: true, spendable: true };
  ok(challenge.pool === true && challenge.spendable === true, 'Challenge Pool: pool + spendable');
  ok(challenge.isChallengePool === undefined, 'no challenge flag');
  ok(rollSeparate(challenge) === false, 'Challenge Pool shares the pool');

  const boss = { name: 'Boss Pool', rating: { type: 'Dice', value: [12, 10, 10, 8, 8], range: [4, 6, 8, 10, 12] }, pool: true, spendable: true };
  ok(JSON.stringify(ratingDice(getRating(boss))) === '[12,10,10,8,8]', 'Boss Pool: larger array, same shape');

  const pp = { name: 'plotPoints', rating: { type: 'Counter', value: [3], range: [0, 20] }, spendable: true };
  ok(getRating(pp).type === 'Counter' && JSON.stringify(getRating(pp).value) === '[3]', 'Plot Points: Counter on a name trait');
  ok(JSON.stringify(getRating(pp).range) === '[0,20]', 'Counter range [0,20]');
  ok(ratingDice(getRating(pp)).length === 0, 'Counters stage no dice');
}

// ---- 3. Spending never mutates value; restore returns the die.
{
  const t = { name: 'Ammo', rating: { type: 'Dice', value: [8, 8], range: [4, 6, 8, 10, 12] }, spendable: true, view: { spentDice: [] } };
  const before = JSON.stringify(t.rating.value);
  t.view.spentDice.push(0);
  ok(JSON.stringify(t.rating.value) === before, 'spend leaves value untouched', t.rating.value);
  ok(JSON.stringify(availableDice(t)) === '[8]', 'spent die leaves the staged array', availableDice(t));
  ok(JSON.stringify(getSpentIndices(t)) === '[0]', 'spent state lives beside the rating');
  t.view.spentDice.splice(0, 1);
  ok(JSON.stringify(availableDice(t)) === '[8,8]', 'restore returns the die');
}

// ---- 4. Hitches: sparse, inherited, default 1; flood takes the highest.
{
  ok(resolveHitches({}) === 1, 'base default 1');
  ok(resolveHitches({ hitches: 2 }) === 2, 'explicit wins');
  ok(resolveHitches({}, [{ hitches: 2 }, {}]) === 2, 'inherits nearest ancestor');
  ok(resolveHitches({ hitches: 0 }, [{ hitches: 2 }]) === 0, 'explicit 0 beats inheritance');
  const pool = [{ hitches: 1 }, { hitches: 2 }, {}];
  ok(Math.max(...pool.map((d) => resolveHitches(d))) === 2, 'flood: highest member wins');
  ok(rollSeparate({ hitches: 0 }) === true, 'rollSeparate is hitches == 0');
  ok(rollSeparate({ hitches: 2 }) === false, 'hitches 2 shares the pool');
}

// ---- 5. keepsExtra names the Scale effect.
{
  ok(keepsExtraDice({ keepsExtra: 1 }) === 1, 'keepsExtra reads');
  ok(keepsExtraDice({}) === 0, 'absent keeps nothing');
}

// ---- 6. Migration lands the readings (day-1 inputs only).
{
  // Day-1 nouns map onto noun/plural.
  const nn = { name: 'C', traitSets: [{ name: 'Doom', nounSingular: 'Die', nounPlural: 'Dice', traits: [] }] };
  M.normalizeView(nn);
  const doom = nn.traitSets.find((s) => s.name === 'Doom');
  ok(doom.noun === 'Die' && doom.plural === 'Dice', 'day-1 nouns map', { noun: doom.noun, plural: doom.plural });
  ok(doom.nounSingular === undefined && doom.nounPlural === undefined, 'old words gone');
  // Day-1 numeric ratings become Die/Dice ratings.
  const sd = { name: 'C', traitSets: [{ name: 'Skills', traits: [{ name: 'Bout', value: 8, dice: [] }] }] };
  M.normalizeView(sd);
  const bout = sd.traitSets.find((s) => s.name === 'Skills').traits[0];
  ok(bout.rating && bout.rating.type === 'Die' && JSON.stringify(bout.rating.value) === '[8]', 'numeric value becomes a Die rating', bout.rating);
  ok(bout.value === undefined && bout.dice === undefined, 'numeric keys gone');
  // Resources gain the exemption.
  const rs = { name: 'C', traitSets: [{ name: 'Gear', plural: 'Resources', traits: [{ name: 'Rope', value: 8, dice: [] }] }] };
  M.normalizeView(rs);
  const rope = rs.traitSets.find((s) => s.name === 'Gear').traits[0];
  ok(rope.spendable === true && rope.hitches === 0, 'resources: spendable + hitches 0', { spendable: rope.spendable, hitches: rope.hitches });
  // Plot Points Counter on the name trait.
  const pp = { name: 'C', plotPoints: 2, traitSets: [] };
  M.normalizeView(pp);
  const nset = pp.traitSets.find((s) => s.id === 'name');
  const ppt = nset && nset.traits.find((t) => t.name === 'plotPoints');
  ok(ppt && ppt.rating && ppt.rating.type === 'Counter' && JSON.stringify(ppt.rating.value) === '[2]' &&
    JSON.stringify(ppt.rating.range) === '[0,20]' && ppt.spendable === true, 'plotPoints Counter migrates', ppt && ppt.rating);
  // Canonical pool + keepsExtra pass through untouched.
  const sc = { name: 'C', traitSets: [{ name: 'A', pool: true, spendable: true, traits: [{ name: 'Scale', keepsExtra: 1, rating: { type: 'Die', value: [8], range: [4, 6, 8, 10, 12] } }] }] };
  M.normalizeView(sc);
  const st = sc.traitSets.find((s) => s.name === 'A').traits[0];
  const sset = sc.traitSets.find((s) => s.name === 'A');
  ok(st.keepsExtra === 1 && st.name === 'Scale', 'Scale effect is keepsExtra', { keepsExtra: st.keepsExtra, name: st.name });
  ok(sset.pool === true && sset.spendable === true, 'pool + spendable pass through');
}

// ---- Out is a range option for die ratings, defaulted off.
{
  const plain = { rating: { type: 'Die', value: [8], range: [4, 6, 8, 10, 12] } };
  ok(hasOutRange(plain) === false, 'no out key means no out in range');
  ok(hasOutRange({}) === false && hasOutRange(null) === false, 'unrated has no out in range');
  ok(hasOutRange({ rating: { type: 'Counter', value: [2], range: [0, 20], out: true } }) === false, 'out is die-only');
  ok(hasOutRange({ rating: { type: 'Dice', value: [8, 6], range: [4, 6, 8, 10, 12], out: true } }) === true, 'explicit out opts Dice in');
  const str = { rating: { type: 'Die', value: [8], range: [4, 6, 8, 10, 12] } };
  ok(hasOutRange(str, [{ view: { outIndicator: true } }]) === true, 'outIndicator puts out in range');
  ok(hasOutRange(str, [{ view: {} }]) === false, 'flags default off');
  ok(rangeTop(plain) === 12, 'standard top is d12');
  ok(rangeTop({ rating: { type: 'Die', value: [8], range: [6, 8, 10] } }) === 10, 'custom top is the max step');
  ok(rangeTop({}) === 12, 'unrated top defaults d12');
  ok(isOutDie(plain) === false, 'rated die is not out');
  ok(isOutDie({ rating: { type: 'Die', value: [14], range: [4, 6, 8, 10, 12], out: true } }) === true, 'past the top is out');
  ok(isOutDie({ rating: { type: 'Die', value: [14], range: [4, 6, 8, 10, 12] } }) === false, 'past the top without range is not out');
  ok(isOutDie({ rating: { type: 'Die', value: [8], range: [4, 6, 8, 10, 12] }, isOut: true }) === false, 'flag alone without range is not out');
  const flagged = { rating: { type: 'Die', value: [8], range: [4, 6, 8, 10, 12], out: true }, isOut: true };
  ok(isOutDie(flagged) === true, 'flagged out with range is out');
  ok(isOutDie(str, [{ view: { outIndicator: true } }]) === false, 'fallback range without out state is not out');
  // Stepping preserves the opt-in; clearing drops the rating whole.
  const t = { rating: { type: 'Die', value: [8], range: [4, 6, 8, 10, 12], out: true } };
  setRatingDie(t, 10);
  ok(t.rating.out === true && JSON.stringify(t.rating.value) === '[10]', 'stepping keeps out', t.rating);
  setRatingDice(t, [10, 8]);
  ok(t.rating.type === 'Dice' && t.rating.out === true, 'Dice rewrite keeps out', t.rating);
  setRatingDice(t, []);
  ok(t.rating === undefined, 'clearing drops the rating whole');
}


// ---- 7. Type-scoped set-all range (Phase 2 item 4 / Part B)
{
  const makeSet = () => ({
    name: 'Test Set',
    traits: [
      {
        name: 'Die 1',
        rating: { type: 'Die', value: [8], range: [6, 8, 10] },
        traits: [
          { name: 'Die Sub', rating: { type: 'Die', value: [6], range: [4, 6, 8] } },
          { name: 'Counter Sub', rating: { type: 'Counter', value: [1], range: [0, 5] } }
        ]
      },
      {
        name: 'Die 2',
        rating: { type: 'Die', value: [10], range: [4, 6, 8, 10, 12] }
      },
      {
        name: 'Dice Trait',
        rating: { type: 'Dice', value: [8, 6], range: [4, 6, 8, 10, 12] }
      },
      {
        name: 'Counter Trait',
        rating: { type: 'Counter', value: [3], range: [0, 10] }
      },
      {
        name: 'Pip Trait',
        rating: { type: 'Pip', value: [false] }
      },
      {
        name: 'Unrated Trait'
      }
    ]
  });

  // 1. Die source applies to Die traits only (including subtraits), preserving values verbatim
  const s1 = makeSet();
  applyTypeScopedRange(s1, s1.traits[0]);
  ok(JSON.stringify(s1.traits[1].rating.range) === '[6,8,10]', 'Die source updates Die 2 range');
  ok(JSON.stringify(s1.traits[1].rating.value) === '[10]', 'Die 2 value preserved verbatim');
  ok(JSON.stringify(s1.traits[0].traits[0].rating.range) === '[6,8,10]', 'Die subtrait updated');
  ok(JSON.stringify(s1.traits[0].traits[0].rating.value) === '[6]', 'Die subtrait value preserved');
  ok(JSON.stringify(s1.traits[0].traits[1].rating.range) === '[0,5]', 'Counter subtrait untouched by Die source');
  ok(JSON.stringify(s1.traits[2].rating.range) === '[4,6,8,10,12]', 'Dice trait untouched by Die source');
  ok(JSON.stringify(s1.traits[3].rating.range) === '[0,10]', 'Counter trait untouched by Die source');
  ok(s1.traits[4].rating.range === undefined, 'Pip trait untouched by Die source');
  ok(s1.traits[5].rating === undefined, 'Unrated trait untouched by Die source');

  // 2. Dice source applies to Dice only
  const s2 = makeSet();
  s2.traits[2].rating.range = [8, 10, 12];
  applyTypeScopedRange(s2, s2.traits[2]);
  ok(JSON.stringify(s2.traits[0].rating.range) === '[6,8,10]', 'Die 1 untouched by Dice source');
  ok(JSON.stringify(s2.traits[2].rating.range) === '[8,10,12]', 'Dice trait has its range');

  // 3. Counter source applies [lo, hi] to Counters only (including subtraits)
  const s3 = makeSet();
  s3.traits[3].rating.range = [2, 8];
  applyTypeScopedRange(s3, s3.traits[3]);
  ok(JSON.stringify(s3.traits[3].rating.range) === '[2,8]', 'Counter trait range set');
  ok(JSON.stringify(s3.traits[3].rating.value) === '[3]', 'Counter value preserved verbatim');
  ok(JSON.stringify(s3.traits[0].traits[1].rating.range) === '[2,8]', 'Counter subtrait updated by Counter source');
  ok(JSON.stringify(s3.traits[0].traits[1].rating.value) === '[1]', 'Counter subtrait value preserved');
  ok(JSON.stringify(s3.traits[0].rating.range) === '[6,8,10]', 'Die 1 untouched by Counter source');
  ok(JSON.stringify(s3.traits[2].rating.range) === '[4,6,8,10,12]', 'Dice untouched by Counter source');
  ok(s3.traits[4].rating.range === undefined, 'Pip untouched by Counter source');

  // 4. Pip source is a no-op
  const s4 = makeSet();
  applyTypeScopedRange(s4, s4.traits[4]);
  ok(JSON.stringify(s4) === JSON.stringify(makeSet()), 'Pip source is a no-op');

  // 5. Unrated source is a no-op
  const s5 = makeSet();
  applyTypeScopedRange(s5, s5.traits[5]);
  ok(JSON.stringify(s5) === JSON.stringify(makeSet()), 'Unrated source is a no-op');
}

console.log(`rating-tests: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
