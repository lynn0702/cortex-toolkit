// layered-materialize — the render seam for the layered model.
//
// The renderer reads the array shape: `character.traitSets` is an array,
// traits carry `rating` objects ({ type, value: [], range: [] }), SFX is a
// child trait (grouped under an "SFX" child whose own children are the SFX
// entries), and presentation (style, layout, reserved slots, nouns) is
// inline under `view`.
//
// The layered model stores `sets` as a name-keyed map, ratings as objects
// (dice strings and shorthand parse on read for import compat), SFX folded
// into `traits.SFX`. This module is the two-way codec at the seam:
//
//   materializeCharacter(file, templateChar)  layered -> render (load path)
//   toLayeredEntity(renderChar)               render  -> layered (store path)
//
// Both are LOSSLESS: any field on a set/trait (content or presentation) is a
// per-entity override that survives the round trip. Presentation the entity
// does not carry is inherited from the template character.

import { asTrait } from './character-curio-trait-helpers.ts';
import type { TraitRaw, TraitObject, SetObject } from './character-curio-trait-helpers.ts';
import { cloneDeep } from './clone-deep.ts';

// ---------- render shapes ----------

export interface RenderTrait {
	name?: string;
	description?: string;
	traits?: RenderTrait[];
	tags?: unknown[];
	custom?: Record<string, unknown>;
	xp?: unknown;
	counter?: unknown;
	_lid?: string;
	id?: string | null;
	[key: string]: unknown;
}

export interface RenderSet {
	id?: string | null;
	name?: string;
	description?: string;
	traits?: RenderTrait[];
	tags?: unknown[];
	custom?: Record<string, unknown>;
	[key: string]: unknown;
}

export interface RenderCharacter {
	traitSets?: RenderSet[];
	[key: string]: unknown;
}

const clone = cloneDeep;

// render trait -> dice ints
const traitDice = (t: RenderTrait): number[] => {
	const r = (t as Record<string, unknown>).rating;
	if (r && typeof r === 'object' && !Array.isArray(r)) {
		const v = (r as Record<string, unknown>).value;
		if (Array.isArray(v)) {
			const nums = v.filter((x) => typeof x === 'number' && x > 0);
			if (nums.length) return nums;
		}
	}
	return [];
};

// rating object for ints (canonical layered emit)
const ratingForDice = (dice: number[]): Record<string, unknown> => ({
	type: dice.length > 1 ? 'Dice' : 'Die',
	value: dice.slice().sort((a, b) => b - a),
	range: [4, 6, 8, 10, 12],
});

// ---------- render <- layered (materialize) ----------

// entity traits map -> render traits array. `pres` supplies order; entity keys win.
function buildTraits(pres: RenderTrait[] | undefined, map: Record<string, TraitRaw> | undefined): RenderTrait[] {
	const out: RenderTrait[] = [];
	const used = new Set<string>();
	const entityTraits = map && typeof map === 'object' && !Array.isArray(map) ? map : {};

	if (Array.isArray(pres)) {
		for (const pt of pres) {
			const name = typeof pt.name === 'string' ? pt.name : '';
			if (!name.length) {
				out.push(clone(pt));
				continue;
			}
			if (Object.prototype.hasOwnProperty.call(entityTraits, name)) {
				used.add(name);
				const raw = entityTraits[name];
				if (raw === null) continue; // removed
				out.push(buildTrait(pt, raw, name));
			} else {
				out.push(clone(pt)); // inherited
			}
		}
	}
	for (const [name, raw] of Object.entries(entityTraits)) {
		if (used.has(name)) continue;
		if (raw === null) continue;
		out.push(buildTrait(null, raw, name));
	}
	return out;
}

function mergeCustom(base: unknown, override: unknown): Record<string, unknown> {
	if (!base || typeof base !== 'object' || Array.isArray(base)) {
		return override && typeof override === 'object' && !Array.isArray(override)
			? (clone(override) as Record<string, unknown>)
			: {};
	}
	if (!override || typeof override !== 'object' || Array.isArray(override)) {
		return clone(base) as Record<string, unknown>;
	}
	const result = clone(base) as Record<string, unknown>;
	for (const [k, v] of Object.entries(override as Record<string, unknown>)) {
		if (
			v &&
			typeof v === 'object' &&
			!Array.isArray(v) &&
			typeof result[k] === 'object' &&
			result[k] &&
			!Array.isArray(result[k])
		) {
			result[k] = mergeCustom(result[k], v);
		} else {
			result[k] = clone(v);
		}
	}
	return result;
}

function buildTrait(pres: RenderTrait | null, raw: TraitRaw, name: string): RenderTrait {
	const et = asTrait(raw);
	const t: RenderTrait = pres ? clone(pres) : { name };
	if (!pres) t.name = name;
	for (const [k, v] of Object.entries(et)) {
		if (k === 'traits') continue;
		if (k === 'custom') {
			t.custom = mergeCustom(pres?.custom, v);
			continue;
		}
		if (k === 'view') {
			t.view = mergeCustom(pres?.view, v);
			continue;
		}
		if (k === 'value') {
			if (v === null) {
				// layered "explicitly unrated" clears any inherited rating.
				(t as Record<string, unknown>).rating = null;
			}
			continue;
		}
		if (k === 'dice') continue; // retired encoding; rating carries it.
		(t as Record<string, unknown>)[k] = clone(v);
	}
	// Canonical wins: a rating drops any top-level value/dice the
	// presentation base carried.
	const tr = t as Record<string, unknown>;
	if (tr.rating && typeof tr.rating === 'object') {
		delete tr.value;
		delete tr.dice;
	}
	const subs = et.traits as Record<string, TraitRaw> | undefined;
	if (subs) {
		t.traits = buildTraits(pres?.traits, subs);
	}
	return t;
}

function buildSet(pres: RenderSet | null, eset: SetObject, name: string): RenderSet {
	const set: RenderSet = pres ? clone(pres) : { name };
	if (!pres) set.name = name;
	for (const [k, v] of Object.entries(eset)) {
		if (k === 'traits') continue;
		if (k === 'custom') {
			set.custom = mergeCustom(pres?.custom, v);
			continue;
		}
		if (k === 'view') {
			set.view = mergeCustom(pres?.view, v);
			continue;
		}
		(set as Record<string, unknown>)[k] = clone(v);
	}
	const traitsMap = eset.traits as Record<string, TraitRaw> | undefined;
	set.traits = buildTraits(pres?.traits, traitsMap);
	return set;
}

/**
 * Fold a layered file (envelope + entity) onto its presentation template and
 * return the array-shaped character the renderer reads. `presentation`
 * is the template character (render array shape): its character-level fields
 * (view, custom, portrait, nouns, $schema…) fill whatever the entity does not set,
 * and its `traitSets` supply set/trait order + presentation. Omit it for
 * entity-only output.
 */
export function materializeCharacter(
	file: Record<string, unknown>,
	presentation?: RenderCharacter | null,
): RenderCharacter {
	const sets =
		file.sets && typeof file.sets === 'object' && !Array.isArray(file.sets)
			? (file.sets as Record<string, SetObject | null>)
			: {};

	const base: RenderCharacter = presentation && typeof presentation === 'object' ? clone(presentation) : {};
	const out: RenderCharacter = base;
	// entity character-level keys win over the presentation base
	for (const [k, v] of Object.entries(file)) {
		if (k === 'sets' || k === 'template') continue;
		if (k === 'custom') {
			out.custom = mergeCustom(base.custom, v);
			continue;
		}
		if (k === 'view') {
			out.view = mergeCustom(base.view, v);
			continue;
		}
		out[k] = clone(v);
	}
	if (file.portrait && typeof file.portrait === 'object') {
		const fp = file.portrait as Record<string, unknown>;
		const bp = base.portrait && typeof base.portrait === 'object' ? (base.portrait as Record<string, unknown>) : {};
		const p: Record<string, unknown> = clone(bp);
		for (const [pk, pv] of Object.entries(fp)) {
			if (pk === 'view') p.view = mergeCustom(bp.view, pv);
			else if (pk === 'custom') p.custom = mergeCustom(bp.custom, pv);
			else p[pk] = clone(pv);
		}
		out.portrait = p;
	}
	// isTemplate belongs to the entity, not the presentation template it folds onto.
	out.isTemplate = file.isTemplate === true;
	// the template ref rides under `template` in layered form, `sheet.template` in render form.
	if (file.template !== undefined) out.sheet = { template: clone(file.template) };

	const presentationSets: RenderSet[] = Array.isArray(presentation?.traitSets)
		? (presentation!.traitSets as RenderSet[])
		: Array.isArray(file.traitSets)
			? (file.traitSets as RenderSet[])
			: [];
	const used = new Set<string>();
	const traitSets: RenderSet[] = [];
	// Stable identity: when both sides carry a set id, the ids must agree
	// for a name match to hold. A renamed set (new key, kept id) heals onto
	// its template presentation; a same-named stranger stays a custom set.
	// Missing ids on either side stay name-matched.
	const idOf = (s: unknown) => {
		const id = (s as Record<string, unknown> | null)?.id;
		return typeof id === 'string' && id.length ? id : '';
	};
	const presById = new Map<string, RenderSet>();
	for (const pset of presentationSets) {
		const pid = idOf(pset);
		if (pid && !presById.has(pid)) presById.set(pid, pset);
	}
	const orphans: RenderSet[] = [];
	for (const pset of presentationSets) {
		const name = typeof pset.name === 'string' ? pset.name : '';
		if (!name.length) {
			traitSets.push(clone(pset));
			continue;
		}
		if (Object.prototype.hasOwnProperty.call(sets, name)) {
			used.add(name);
			const eset = sets[name];
			if (eset === null) continue; // removed
			const eid = idOf(eset);
			if (!(eid && idOf(pset)) || eid === idOf(pset)) {
				traitSets.push(buildSet(pset, eset as SetObject, name));
				continue;
			}
		}
		// No compatible entity set under this address: hold the slot for a
		// possible id-healed rename; otherwise inherit below.
		orphans.push(pset);
	}
	for (const pset of orphans) {
		const pid = idOf(pset);
		let healed = '';
		if (pid) {
			for (const [ename, eset] of Object.entries(sets)) {
				if (used.has(ename) || eset === null) continue;
				if (idOf(eset) === pid) {
					healed = ename;
					break;
				}
			}
		}
		if (healed) {
			used.add(healed);
			const folded = buildSet(pset, sets[healed] as SetObject, healed);
			// The entity key is the display truth (the rename); the template
			// supplies presentation and position.
			(folded as Record<string, unknown>).name = healed;
			traitSets.push(folded);
		} else {
			traitSets.push(clone(pset)); // inherited presentation
		}
	}
	for (const [name, eset] of Object.entries(sets)) {
		if (used.has(name)) continue;
		if (eset === null) continue;
		traitSets.push(buildSet(null, eset, name));
	}
	out.traitSets = traitSets;
	return out;
}

// ---------- render -> layered (serialize) ----------

function layeredTraitFrom(t: RenderTrait): TraitObject {
	const node: TraitObject = {};
	const raw = (t as Record<string, unknown>).rating;
	if (raw === null) {
		node.rating = null; // explicitly unrated (clears inheritance)
	} else if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
		node.rating = clone(raw);
	} else {
		const dice = traitDice(t);
		if (dice.length) node.rating = ratingForDice(dice);
	}
	for (const [k, v] of Object.entries(t)) {
		if (k === 'name' || k === 'traits' || k === 'rating' || k === '_lid' || k === 'id' || k === 'removedTraits')
			continue;
		// Canonical emit: empty custom/tags stay out (absence carries the
		// same meaning). description "" is KEPT: in a delta it is an
		// explicit clear of an inherited description. Explicit nulls
		// (removals, unrated) are kept.
		if (k === 'custom' && v && typeof v === 'object' && !Array.isArray(v)) {
			const bag = clone(v) as Record<string, unknown>;
			if (!Object.keys(bag).length) continue;
			(node as Record<string, unknown>).custom = bag;
			continue;
		}
		if (k === 'view' && v && typeof v === 'object' && !Array.isArray(v)) {
			const bag = clone(v) as Record<string, unknown>;
			if (!Object.keys(bag).length) continue;
			(node as Record<string, unknown>).view = bag;
			continue;
		}
		if (k === 'tags' && Array.isArray(v) && !v.length) continue;
		(node as Record<string, unknown>)[k] = clone(v);
	}
	const subs: Record<string, TraitRaw> = {};
	for (const st of Array.isArray(t.traits) ? t.traits : []) {
		if (!st || typeof st.name !== 'string' || !st.name.length) continue;
		subs[st.name] = layeredTraitFrom(st);
	}
	if (Object.keys(subs).length) node.traits = subs;
	return node;
}

function layeredSetFrom(set: RenderSet): SetObject {
	const s: Record<string, unknown> = {};
	for (const [k, v] of Object.entries(set)) {
		// Set id is the stable join key (kept); trait-level ids stay out.
		if (k === 'name' || k === 'traits' || k === 'removedTraits' || k === 'removedSets') continue;
		if (
			k === 'custom' &&
			v &&
			typeof v === 'object' &&
			!Array.isArray(v) &&
			!Object.keys(v as Record<string, unknown>).length
		)
			continue;
		if (k === 'tags' && Array.isArray(v) && !v.length) continue;
		s[k] = clone(v);
	}
	const traits: Record<string, TraitRaw> = {};
	for (const tr of Array.isArray(set.traits) ? set.traits : []) {
		if (!tr || typeof tr.name !== 'string' || !tr.name.length) continue;
		traits[tr.name] = layeredTraitFrom(tr);
	}
	s.traits = traits;
	return s as SetObject;
}

/**
 * Serialize a render character to the layered entity (content + any
 * per-entity overrides, all preserved). Set ids are kept (stable join key);
 * trait-level ids and app-local `_lid` are dropped; `sheet` (the template
 * ref) is left to the caller. This is the lossless inverse of
 * `materializeCharacter` when folded back onto the same template.
 */
export function toLayeredEntity(ch: Record<string, unknown>): Record<string, unknown> {
	const entity: Record<string, unknown> = {};
	for (const [k, v] of Object.entries(ch)) {
		if (k === 'traitSets' || k === 'sheet' || k === 'removedSets') continue;
		entity[k] = clone(v);
	}
	const sets: Record<string, SetObject> = {};
	const seen: Record<string, number> = {};
	for (const set of Array.isArray(ch.traitSets) ? (ch.traitSets as RenderSet[]) : []) {
		if (!set || typeof set.name !== 'string' || !set.name.length) continue;
		// Duplicate display names (GMC x6) take suffixed keys in document
		// order, mirroring the template convention — otherwise all but one
		// would collide on the same key and be lost.
		seen[set.name] = (seen[set.name] || 0) + 1;
		const key = seen[set.name] === 1 ? set.name : set.name + '~' + seen[set.name];
		sets[key] = layeredSetFrom(set);
	}
	entity.sets = sets;
	return entity;
}
