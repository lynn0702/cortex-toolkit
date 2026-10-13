// cortex-pal (dice model) regression tests.
// Usage: node scripts/cortex-pal-tests.js  (exit 1 on failure)
const { CortexDie, CortexDicePool, CORTEX_D4, DIE_SIZES } = require('../js/cortex-pal.ts');

let pass = 0, fail = 0;
function ok(cond, name, extra) {
  if (cond) { pass++; }
  else { fail++; console.log('  FAIL ' + name + (extra !== undefined ? ' :: ' + JSON.stringify(extra) : '')); }
}

// ---- CortexDie parsing
{
  const d = new CortexDie('2d8');
  ok(d.qty === 2 && d.size === 8, 'parse 2d8', { qty: d.qty, size: d.size });
  ok(d.toString() === '2D8', 'toString 2D8', d.toString());
  const s = new CortexDie('d10');
  ok(s.qty === 1 && s.size === 10, 'parse d10', { qty: s.qty, size: s.size });
  ok(s.toString() === 'D10', 'toString D10', s.toString());
  const bare = new CortexDie('12');
  ok(bare.size === 12, 'parse bare 12', bare.size);
}

// ---- roll range
{
  const d = new CortexDie(null, 'D8', 8, 3, [], '');
  const vals = d.roll();
  ok(vals.length === 3 && vals.every(v => v >= 1 && v <= 8), 'roll 3d8 in range', vals);
  ok(d.isRolled(), 'isRolled');
  const ones = new CortexDie(null, 'D6', 6, 2, [1, 1], '');
  ok(ones.isBotch(), 'all ones is botch');
}

// ---- pool add / output / remove
{
  const p = new CortexDicePool();
  p.add([8, 8, 10]);
  ok(p.output() === '2D8, D10', 'pool output 2D8, D10', p.output());
  ok(p.items.length === 3, 'items length 3', p.items.length);
  ok(p.hitchCount(1) === 0, 'no hitches before roll');
  const removed = p.removeAt(0);
  ok(removed && removed.size === 8 && p.items.length === 2, 'removeAt syncs', p.output());
  ok(p.output() === 'D8, D10', 'output after remove', p.output());
  p.removeBySize(10);
  ok(p.items.length === 1 && p.output() === 'D8', 'removeBySize', p.output());
  p.clear();
  ok(p.is_empty() && p.output() === 'empty', 'clear empties', p.output());
}

// ---- hitches + eligible dice
{
  const p = new CortexDicePool();
  p.add([6, 6]);
  // force values deterministically
  p.dice = [null, new CortexDie(null, 'D6', 6, 2, [1, 4], ''), null, null, null];
  ok(p.hitchCount(1) === 1, 'hitchCount counts <=1', p.hitchCount(1));
  const elig = p.eligibleDice(1);
  ok(elig.length === 1 && elig[0].values[0] === 4, 'eligibleDice excludes hitches', elig.map(e => e.values));
}

// ---- scale/resource staging metadata
{
  const p = new CortexDicePool();
  p.add([{ size: 8, qty: 1, source: 'Scale', isScale: true }]);
  ok(p.items.length === 1 && p.items[0].isScale === true, 'isScale staged', p.items[0]);
  const p2 = new CortexDicePool();
  p2.add([{ size: 6, qty: 2, isResource: true, resourceType: 'Gear' }]);
  ok(p2.items.length === 2 && p2.items[0].isResource === true && p2.items[0].resourceType === 'Gear', 'isResource staged', p2.items[0]);
}

// ---- constants
ok(DIE_SIZES.length === 5 && CORTEX_D4.size === 4, 'constants intact');

console.log(`cortex-pal-tests: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
