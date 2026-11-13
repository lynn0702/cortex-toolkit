// Export emit tests: canonical scaffolding stays out of every emit path,
// internal ids never leak, explicit nulls survive.
// Usage: node scripts/export-tests.js  (exit 1 on failure)
const F = require('../js/functions.ts').characterCurioFunctions;
const { toLayeredEntity } = require('../js/layered-materialize.ts');

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

const die = (n) => ({ type: 'Die', value: [n], range: [4, 6, 8, 10, 12] });

function walk(node, fn) {
	if (!node || typeof node !== 'object') return;
	fn(node);
	Object.values(node).forEach((v) => {
		if (v && typeof v === 'object') walk(v, fn);
	});
}

// ---- 1. toLayeredEntity (storage emit): no ids, no scaffolding.
{
	const render = {
		id: 'c1',
		name: 'Test',
		game: 'G',
		traitSets: [
			{
				id: 'distinctions',
				name: 'Distinctions',
				description: '',
				tags: [],
				custom: {},
				traits: [
					{
						name: 'Brawn',
						rating: die(8),
						description: '',
						tags: [],
						custom: {},
						_lid: 'x1',
						traits: [{ name: 'Lift', rating: die(6), tags: [], custom: {} }],
						sfx: [],
					},
					{ name: 'Gone', rating: null, description: '', tags: [], custom: {}, _lid: 'x2' },
				],
				sfx: [],
			},
		],
	};
	const e = toLayeredEntity(render);
	ok(e.id === 'c1', 'layered emit: character identity kept');
	// Set ids are the stable join key (kept); trait-level ids stay out.
	let lids = 0,
		traitIds = 0,
		emptyCustom = 0,
		emptyTags = 0;
	walk(e.sets, (n) => {
		if (n._lid !== undefined) lids++;
		if (
			n.custom !== undefined &&
			typeof n.custom === 'object' &&
			!Array.isArray(n.custom) &&
			!Object.keys(n.custom).length
		)
			emptyCustom++;
		if (Array.isArray(n.tags) && !n.tags.length) emptyTags++;
	});
	Object.values(e.sets).forEach((s) => {
		Object.values(s.traits || {}).forEach((tr) => {
			if (tr && typeof tr === 'object' && tr.id !== undefined) traitIds++;
		});
	});
	ok(lids === 0, 'layered emit: no _lid', lids);
	ok(e.sets.Distinctions.id === 'distinctions', 'layered emit: set id kept');
	ok(traitIds === 0, 'layered emit: no trait-level ids', traitIds);
	ok(emptyCustom === 0, 'layered emit: no empty custom', emptyCustom);
	ok(emptyTags === 0, 'layered emit: no empty tags', emptyTags);
	// Sparse emit: empty description "" and empty traits [] are omitted
	// (explicit nulls are still kept to clear inherited values).
	ok(e.sets.Distinctions.traits.Brawn.description === undefined, 'layered emit: empty description omitted');
	ok(e.sets.Distinctions.traits.Gone.traits === undefined, 'layered emit: empty traits omitted');
	ok(
		JSON.stringify(e.sets.Distinctions.traits.Brawn.rating) ===
			JSON.stringify({ type: 'Die', value: [8], range: [4, 6, 8, 10, 12] }),
		'rated rating kept',
		e.sets.Distinctions.traits.Brawn.rating,
	);
	ok(
		JSON.stringify(e.sets.Distinctions.traits.Brawn.traits.Lift.rating) ===
			JSON.stringify({ type: 'Die', value: [6], range: [4, 6, 8, 10, 12] }),
		'subtrait kept',
	);
	ok(e.sets.Distinctions.traits.Gone.rating === null, 'explicit unrated null kept');
}

// ---- 5. File export: no _lid, no trait-level id, no scaffolding in deltas.
{
	const base = {
		id: 'tpl',
		title: 'T',
		version: 1,
		character: {
			name: '',
			traitSets: [
				{
					id: 'distinctions',
					name: 'Distinctions',
					description: '',
					tags: [],
					custom: {},
					traits: [{ name: 'Brawn', rating: die(8), description: '', traits: [], sfx: [], tags: [], custom: {} }],
					sfx: [],
				},
			],
		},
	};
	const live = JSON.parse(JSON.stringify(base.character));
	live.id = 'c9';
	live.name = 'Hero';
	live.sheet = { template: { id: 'tpl', version: 1 } };
	live.traitSets[0].traits[0]._lid = 'z1';
	live.traitSets[0].traits[0].description = 'Edited';
	live.traitSets[0].traits.push({
		name: 'Custom Made',
		rating: die(6),
		description: '',
		traits: [],
		sfx: [],
		tags: [],
		custom: {},
		_lid: 'z2',
	});
	const out = F.stripCharacterForExport(live, base);
	let lids = 0,
		traitIds = 0,
		empties = 0;
	walk(out, (n) => {
		if (n._lid !== undefined) lids++;
	});
	(out.traitSets || []).forEach((ts) => {
		(ts.traits || []).forEach((tr) => {
			if (tr.id !== undefined) traitIds++;
			if (tr.custom !== undefined && typeof tr.custom === 'object' && !Object.keys(tr.custom).length) empties++;
			if (Array.isArray(tr.tags) && !tr.tags.length) empties++;
		});
	});
	ok(lids === 0, 'export deltas: no _lid', lids);
	ok(traitIds === 0, 'export deltas: no trait-level id', traitIds);
	ok(empties === 0, 'export deltas: no empty custom/tags', empties);
	const customMade = out.traitSets[0].traits.find((tr) => tr.name === 'Custom Made');
	ok(customMade && customMade.description === undefined, 'export deltas: empty description omitted', customMade);
	ok(customMade && customMade.traits === undefined, 'export deltas: empty traits omitted', customMade);

	// Explicit null clears survive stripCharacterForExport.
	live.traitSets[0].traits[0].description = null;
	live.traitSets[0].traits[0].traits = null;
	const nullOut = F.stripCharacterForExport(live, base);
	const nullBrawn = nullOut.traitSets[0].traits.find((tr) => tr.name === 'Brawn');
	ok(nullBrawn && nullBrawn.description === null, 'export deltas: explicit description null kept', nullBrawn);
	ok(nullBrawn && nullBrawn.traits === null, 'export deltas: explicit traits null kept', nullBrawn);
	ok(out.traitSets[0].id === 'distinctions', 'export deltas: set join id kept');
	ok(out.sheet.template.character, 'export: template embedded');
}

// ---- 5b. Rename-only set survives delta pruning (name is display truth).
{
	const base = {
		id: 'tpl',
		title: 'T',
		version: 1,
		character: {
			name: '',
			traitSets: [
				{ id: 'distinctions', name: 'Distinctions', traits: [], sfx: [] },
				{ id: 'values', name: 'Values', traits: [], sfx: [] },
			],
		},
	};
	const live = JSON.parse(JSON.stringify(base.character));
	live.id = 'c9';
	live.traitSets[0].name = 'Personas';
	const deltas = F.stripCharacterToDeltas(live, base);
	const renamed = (deltas.traitSets || []).find((s) => s.id === 'distinctions');
	ok(renamed && renamed.name === 'Personas', 'rename-only delta kept', renamed);
	const ent = toLayeredEntity(deltas);
	ok(
		ent.sets.Personas && ent.sets.Personas.id === 'distinctions',
		'rename reaches layered entity',
		Object.keys(ent.sets),
	);
}

// ---- 6. Renamed set (new key, kept id) heals onto its template set.
{
	const F2 = require('../js/layered-materialize.ts');
	const templateChar = {
		traitSets: [
			{
				id: 'distinctions',
				name: 'Distinctions',
				view: { style: { body: 'default' } },
				traits: [{ name: 'Brawn', rating: die(8) }],
				sfx: [],
			},
			{ id: 'values', name: 'Values', view: { style: { body: 'default' } }, traits: [], sfx: [] },
		],
	};
	const entity = {
		sets: {
			Distinctions: { id: 'distinctions', traits: { Brawn: { rating: die(8) } } },
			Virtues: { id: 'values', traits: { Honor: { rating: die(10) } } },
		},
	};
	const back = F2.materializeCharacter(entity, templateChar);
	ok(back.traitSets.length === 2, 'rename: no duplication', back.traitSets.length);
	const renamed = back.traitSets.find((s) => s.name === 'Virtues');
	ok(
		renamed && renamed.view && renamed.view.style && renamed.view.style.body === 'default',
		'rename: template presentation kept',
		renamed && renamed.view,
	);
	ok(renamed && renamed.traits.find((t) => t.name === 'Honor'), 'rename: entity content kept');
}

// ---- 7. Duplicate display names serialize to suffixed keys, round-trip whole.
{
	const F2 = require('../js/layered-materialize.ts');
	const render = {
		id: 'c7',
		name: 'Fam',
		traitSets: [
			{ id: 'gmc-a', name: 'GMC', traits: [{ name: 'Kin', rating: die(8) }], sfx: [] },
			{ id: 'gmc-b', name: 'GMC', traits: [{ name: 'Foe', rating: die(6) }], sfx: [] },
		],
	};
	const ent = F2.toLayeredEntity(render);
	ok(Object.keys(ent.sets).join(',') === 'GMC,GMC~2', 'dupes: suffixed keys in order', Object.keys(ent.sets));
	ok(ent.sets['GMC~2'].id === 'gmc-b', 'dupes: ids ride along', ent.sets['GMC~2'].id);
	const back = F2.materializeCharacter(ent, render);
	ok(back.traitSets.length === 2, 'dupes: both survive', back.traitSets.length);
	const names = back.traitSets.map((s) => (s.traits[0] || {}).name).join(',');
	ok(names === 'Kin,Foe', 'dupes: contents pair correctly', names);
}

// ---- 8. Fresh template renders export no slot objects (blanks expand at
// render time; nothing blank is stored).
{
	const F2 = require('../js/layered-materialize.ts');
	const render = {
		id: 'c8',
		name: 'Fresh',
		traitSets: [
			{
				id: 'distinctions',
				name: 'Distinctions',
				view: { reservedSlots: 3 },
				traits: [{ name: 'Brawn', rating: die(8) }],
				sfx: [],
			},
		],
	};
	const ent = F2.toLayeredEntity(render);
	const names = Object.keys(ent.sets.Distinctions.traits || {});
	ok(JSON.stringify(names) === JSON.stringify(['Brawn']), 'no blank traits stored', names);
	ok(!ent.sets.Distinctions.slots, 'no slots map stored');
	let lids = 0;
	walk(ent, (n) => {
		if (n._lid !== undefined) lids++;
	});
	ok(lids === 0, 'no internal ids stored', lids);
}

console.log(`export-tests: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
