// dice-pool (dice model) regression tests.
// Usage: node scripts/dice-pool-tests.js  (exit 1 on failure)
const fs = require('fs');
const path = require('path');
const {
	Die,
	DicePool,
	DEFAULT_D4,
	DIE_SIZES,
	parseTraitShorthand,
	flattenCharacterTraits,
} = require('../js/dice-pool.ts');

let pass = 0,
	fail = 0;
function ok(cond, name, extra) {
	if (cond) {
		pass++;
	} else {
		fail++;
		console.log('  FAIL ' + name + (extra !== undefined ? ' :: ' + JSON.stringify(extra) : ''));
	}
}

// ---- Die parsing
{
	const d = new Die('2d8');
	ok(d.qty === 2 && d.size === 8, 'parse 2d8', { qty: d.qty, size: d.size });
	ok(d.toString() === '2D8', 'toString 2D8', d.toString());
	const s = new Die('d10');
	ok(s.qty === 1 && s.size === 10, 'parse d10', { qty: s.qty, size: s.size });
	ok(s.toString() === 'D10', 'toString D10', s.toString());
	const bare = new Die('12');
	ok(bare.size === 12, 'parse bare 12', bare.size);
}

// ---- roll range
{
	const d = new Die(null, 'D8', 8, 3, [], '');
	const vals = d.roll();
	ok(vals.length === 3 && vals.every((v) => v >= 1 && v <= 8), 'roll 3d8 in range', vals);
	ok(d.isRolled(), 'isRolled');
	const ones = new Die(null, 'D6', 6, 2, [1, 1], '');
	ok(ones.isBotch(), 'all ones is botch');
}

// ---- pool add / output / remove
{
	const p = new DicePool();
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
	const p = new DicePool();
	p.add([6, 6]);
	// force values deterministically
	p.dice = [null, new Die(null, 'D6', 6, 2, [1, 4], ''), null, null, null];
	ok(p.hitchCount(1) === 1, 'hitchCount counts <=1', p.hitchCount(1));
	const elig = p.eligibleDice(1);
	ok(
		elig.length === 1 && elig[0].values[0] === 4,
		'eligibleDice excludes hitches',
		elig.map((e) => e.values),
	);
}

// ---- scale/apart staging metadata (hitches travel with the die)
{
	const p = new DicePool();
	p.add([{ size: 8, qty: 1, source: 'Scale', isScale: true }]);
	ok(p.items.length === 1 && p.items[0].isScale === true, 'isScale staged', p.items[0]);
	const p2 = new DicePool();
	p2.add([{ size: 6, qty: 2, source: 'Gear', hitches: 0 }]);
	ok(
		p2.items.length === 2 && p2.items[0].hitches === 0 && p2.items[0].source === 'Gear',
		'apart metadata staged',
		p2.items[0],
	);
}

// ---- ppDelta and ppCommitted metadata
{
	const p = new DicePool();
	p.add([{ size: 4, qty: 1, source: 'Distinction', ppDelta: 1, ppCommitted: false }]);
	ok(
		p.items.length === 1 && p.items[0].ppDelta === 1 && p.items[0].ppCommitted === false,
		'ppDelta and ppCommitted staged',
		p.items[0],
	);
}

// ---- shorthand parser
{
	const s1 = parseTraitShorthand('Strength d6');
	ok(s1.label === 'Strength' && s1.dice?.count === 1 && s1.dice?.size === 6, 'shorthand Strength d6', s1);

	const s2 = parseTraitShorthand('Reinforcements 2d8');
	ok(s2.label === 'Reinforcements' && s2.dice?.count === 2 && s2.dice?.size === 8, 'shorthand Reinforcements 2d8', s2);

	const s3 = parseTraitShorthand('High Ground');
	ok(s3.label === 'High Ground' && s3.dice === null, 'shorthand High Ground word-only', s3);

	const s4 = parseTraitShorthand('2d8');
	ok(s4.label === '' && s4.dice?.count === 2 && s4.dice?.size === 8, 'shorthand bare 2d8', s4);

	const s5 = parseTraitShorthand('The Architect (3d10)');
	ok(
		s5.label === 'The Architect' && s5.dice?.count === 3 && s5.dice?.size === 10,
		'shorthand The Architect (3d10)',
		s5,
	);
}

// ---- Dreamer flattening
{
	const dreamerPath = path.resolve(__dirname, '../data/templates/Dreamer_Architect.curio.json');
	const dreamer = JSON.parse(fs.readFileSync(dreamerPath, 'utf8'));
	const flat = flattenCharacterTraits(dreamer);
	const bossSingle = flat.find((t) => t.name === 'The Architect' && t.dice.length === 1);
	const bossPool = flat.find((t) => t.name === 'The Architect' && t.dice.length === 3);
	ok(bossSingle && bossSingle.dice[0] === 10 && bossSingle.notation === '1d10', 'Dreamer boss 1d10', bossSingle);
	ok(
		bossPool && bossPool.dice.every((d) => d === 10) && bossPool.notation === '3d10',
		'Dreamer boss 3d10 pool',
		bossPool,
	);

	const distinctions = flat.filter((t) => t.noun.toLowerCase() === 'distinction');
	ok(
		distinctions.length >= 2 && distinctions.every((t) => t.canHinder === true),
		'Dreamer Distinctions canHinder',
		distinctions.map((d) => ({ name: d.name, canHinder: d.canHinder })),
	);

	const dataVal = flat.find((t) => t.name === 'Data');
	const designVal = flat.find((t) => t.name === 'Design');
	const serviceVal = flat.find((t) => t.name === 'Service');
	ok(
		Boolean(dataVal?.description) && Boolean(designVal?.description) && Boolean(serviceVal?.description),
		'Dreamer Values carry descriptions',
		{ data: dataVal?.description, design: designVal?.description, service: serviceVal?.description },
	);
}

// ---- decoupled wordBank + die index operations
{
	const p = new DicePool();
	p.add([{ size: 8, qty: 1, source: 'Data' }]);
	ok(p.wordBank.length === 1 && p.wordBank[0].label === 'Data', 'add pushes to wordBank', p.wordBank);

	ok(p.stepUpAt(0) && p.items[0].size === 10, 'stepUpAt steps 8 -> 10', p.items[0]);
	ok(p.stepDownAt(0) && p.items[0].size === 8, 'stepDownAt steps 10 -> 8', p.items[0]);
	const dup = p.duplicateAt(0);
	ok(dup && p.items.length === 2 && p.wordBank.length === 1, 'duplicateAt leaves wordBank intact', {
		items: p.items.length,
		words: p.wordBank.length,
	});
	p.removeAt(1);
	p.removeAt(0);
	ok(p.items.length === 0 && p.wordBank.length === 1, 'removeAt leaves wordBank intact', {
		items: p.items.length,
		words: p.wordBank.length,
	});

	p.add([{ size: 6, qty: 1, source: 'Design' }]);
	const removedWord = p.removeWord(0);
	ok(
		removedWord?.label === 'Data' && p.wordBank.length === 1 && p.items.length === 1,
		'removeWord leaves dice items intact',
		{ wordBank: p.wordBank, items: p.items },
	);

	p.clear();
	ok(p.items.length === 0 && p.wordBank.length === 0, 'clear empties both items and wordBank');
}

// ---- constants
ok(DIE_SIZES.length === 5 && DEFAULT_D4.size === 4, 'constants intact');

console.log(`dice-pool-tests: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
