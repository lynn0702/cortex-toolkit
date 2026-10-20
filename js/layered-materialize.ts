// layered-materialize — the render seam for the layered model.
//
// The renderer (character.js / trait-set-block.js) reads the legacy array
// shape: `character.traitSets` is an array, traits carry integer `value` +
// `dice:int[]`, SFX is a `sfx` array, and all presentation (style, layout,
// reserved slots, noun labels) is inline under `custom.cortexToolkit`.
//
// The layered model stores `sets` as a name-keyed map, dice as strings, SFX
// folded into `traits.SFX`. This module is the two-way codec at the seam:
//
//   materializeCharacter(file, templateChar)  layered -> render (load path)
//   toLayeredEntity(renderChar)               render  -> layered (store path)
//
// Both are LOSSLESS: any field on a set/trait (content or presentation) is a
// per-entity override that survives the round trip. Presentation the entity
// does not carry is inherited from the template character.

import { asTrait, parseDice } from "./cortex-toolkit-trait-helpers.ts";
import type { TraitRaw, TraitObject, SetObject } from "./cortex-toolkit-trait-helpers.ts";
import { cloneDeep } from "./clone-deep.ts";

// ---------- legacy (render) shapes ----------

export interface LegacyTrait {
	name?: string;
	value?: number | null;
	dice?: number[] | null;
	description?: string;
	traits?: LegacyTrait[];
	sfx?: unknown[];
	tags?: unknown[];
	custom?: Record<string, unknown>;
	statement?: string | null;
	questioned?: boolean | null;
	xp?: unknown;
	counter?: unknown;
	_lid?: string;
	id?: string | null;
	[key: string]: unknown;
}

export interface LegacySet {
	id?: string | null;
	name?: string;
	description?: string;
	traits?: LegacyTrait[];
	sfx?: unknown[];
	tags?: unknown[];
	custom?: Record<string, unknown>;
	[key: string]: unknown;
}

export interface LegacyCharacter {
	traitSets?: LegacySet[];
	[key: string]: unknown;
}

const clone = cloneDeep;

const dieSize = (die: string): number => parseInt(String(die).slice(1), 10);

const diceFromValue = (value: unknown): number[] =>
	typeof value === "string" ? parseDice(value).map(dieSize) : [];

// render trait -> dice ints (the app's getTraitDice read rule)
const traitDice = (t: LegacyTrait): number[] =>
	Array.isArray(t.dice) && t.dice.length
		? t.dice.filter((x) => typeof x === "number" && x > 0)
		: typeof t.value === "number" && t.value > 0
			? [t.value]
			: [];

// dice ints -> canonical string: descending size, count prefix, no separators.
function canonDice(dice: number[]): string {
	const counts = new Map<number, number>();
	for (const d of dice) counts.set(d, (counts.get(d) ?? 0) + 1);
	return [...counts.entries()]
		.sort((a, b) => b[0] - a[0])
		.map(([s, n]) => (n > 1 ? n : "") + "d" + s)
		.join("");
}

// ---------- render <- layered (materialize) ----------

// entity SFX container -> legacy sfx array.
function sfxArrayFrom(container: unknown): unknown[] | undefined {
	if (!container || typeof container !== "object" || Array.isArray(container)) return undefined;
	const node = container as { traits?: Record<string, TraitRaw>; slots?: Record<string, unknown> };
	const subs = node.traits && typeof node.traits === "object" && !Array.isArray(node.traits) ? node.traits : {};
	const out: unknown[] = [];
	for (const [key, raw] of Object.entries(subs)) {
		if (raw === null) continue;
		const o = asTrait(raw as TraitRaw);
		const empty = Object.keys(o).filter((k) => k !== "traits").length === 0;
		if (key === "Hinder" && empty) {
			out.push("hinder");
			continue;
		}
		const entry: Record<string, unknown> = { name: key };
		entry.description = typeof o.description === "string" ? o.description : "";
		if (o.tags !== undefined) entry.tags = clone(o.tags);
		if (o.view !== undefined) entry.view = clone(o.view);
		if (o.custom !== undefined) entry.custom = clone(o.custom);
		out.push(entry);
	}
	const slots = node.slots && typeof node.slots === "object" && !Array.isArray(node.slots) ? node.slots : {};
	for (const raw of Object.values(slots)) {
		const o = raw && typeof raw === "object" ? (raw as TraitObject) : {};
		const entry: Record<string, unknown> = { name: "" };
		entry.description = typeof o.description === "string" ? o.description : "";
		if (o.tags !== undefined) entry.tags = clone(o.tags);
		if (o.view !== undefined) entry.view = clone(o.view);
		if (o.custom !== undefined) entry.custom = clone(o.custom);
		out.push(entry);
	}
	return out.length ? out : undefined;
}

// entity traits map -> legacy traits array. `pres` supplies order; entity keys win.
function buildTraits(pres: LegacyTrait[] | undefined, map: Record<string, TraitRaw> | undefined): LegacyTrait[] {
	const out: LegacyTrait[] = [];
	const used = new Set<string>();
	const entityTraits = map && typeof map === "object" && !Array.isArray(map) ? map : {};

	if (Array.isArray(pres)) {
		for (const pt of pres) {
			const name = typeof pt.name === "string" ? pt.name : "";
			if (!name.length) {
				out.push(clone(pt));
				continue;
			}
			if (name === "SFX") continue; // container, not a positional trait
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
		if (name === "SFX" || used.has(name)) continue;
		if (raw === null) continue;
		out.push(buildTrait(null, raw, name));
	}
	return out;
}

function mergeCustom(base: unknown, override: unknown): Record<string, unknown> {
	if (!base || typeof base !== "object" || Array.isArray(base)) {
		return (override && typeof override === "object" && !Array.isArray(override))
			? (clone(override) as Record<string, unknown>)
			: {};
	}
	if (!override || typeof override !== "object" || Array.isArray(override)) {
		return clone(base) as Record<string, unknown>;
	}
	const result = clone(base) as Record<string, unknown>;
	for (const [k, v] of Object.entries(override as Record<string, unknown>)) {
		if (
			v &&
			typeof v === "object" &&
			!Array.isArray(v) &&
			typeof result[k] === "object" &&
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

// Presentation moved from legacy `custom.cortexToolkit` to top-level `view`.
// Pinned snapshots and legacy stored entities may still carry the old key, so
// fold it UNDER the current bag on both sides of the merge. A partial view
// override (e.g. span/track written by the layout editor) must never shadow
// the full presentation (e.g. the set's style) sitting in the legacy bag.
function legacyBag(node: unknown): Record<string, unknown> {
	if (!node || typeof node !== "object") return {};
	const record = node as Record<string, unknown>;
	const bag = record.custom;
	if (!bag || typeof bag !== "object" || Array.isArray(bag)) return {};
	const inner = (bag as Record<string, unknown>).cortexToolkit;
	if (!inner || typeof inner !== "object" || Array.isArray(inner)) return {};
	return inner as Record<string, unknown>;
}

// After folding the legacy presentation bag into `view`, drop the old key so
// the render object carries a single presentation bag (getView prefers `view`).
function dropLegacyBag(node: Record<string, unknown>): void {
	const bag = node.custom;
	if (!bag || typeof bag !== "object" || Array.isArray(bag)) return;
	const inner = bag as Record<string, unknown>;
	if (inner.cortexToolkit !== undefined) {
		delete inner.cortexToolkit;
		if (Object.keys(inner).length === 0) delete node.custom;
	}
}

// Split-brain heal: a node carrying BOTH the current `view` bag and the
// legacy `custom.cortexToolkit` bag renders only the first (getView prefers
// `view`), so the legacy presentation is silently shadowed — e.g. a stale
// span/track-only view hiding the set's style, which drops the whole style
// dispatch. Fold legacy UNDER view and drop the old key. Single-bag nodes
// pass through untouched (the exact-codec tests depend on verbatim
// passthrough), so this only fires on genuinely dual-bagged nodes.
function healSplitView(node: { view?: unknown; custom?: unknown }): void {
	const rec = node as Record<string, unknown>;
	if (rec.view === undefined) return; // legacy-only: keep verbatim
	if (!Object.keys(legacyBag(rec)).length) return; // view-only: keep verbatim
	rec.view = mergeCustom(legacyBag(rec), rec.view);
	dropLegacyBag(rec);
}

function buildTrait(pres: LegacyTrait | null, raw: TraitRaw, name: string): LegacyTrait {
	const et = asTrait(raw);
	const t: LegacyTrait = pres ? clone(pres) : { name };
	if (!pres) t.name = name;
	for (const [k, v] of Object.entries(et)) {
		if (k === "traits" || k === "pool") continue;
		if (k === "custom") {
			t.custom = mergeCustom(pres?.custom, v);
			continue;
		}
		if (k === "view") {
			t.view = mergeCustom(pres?.view, v);
			continue;
		}
		if (k === "value") {
			const hadDice = pres ? Object.prototype.hasOwnProperty.call(pres, "dice") : true;
			if (v === null) {
				// layered "explicitly unrated" -> legacy sentinel
				t.value = 0;
				if (hadDice) t.dice = [];
			} else if (typeof v === "string") {
				const dice = diceFromValue(v);
				if (dice.length === 1) {
					t.value = dice[0];
					if (hadDice) t.dice = [];
				} else if (dice.length > 1) {
					t.value = dice[0];
					t.dice = dice;
				}
			}
			continue;
		}
		(t as Record<string, unknown>)[k] = clone(v);
	}
	healSplitView(t);
	const subs = et.traits as Record<string, TraitRaw> | undefined;
	if (subs) {
		const sfx = sfxArrayFrom(subs.SFX);
		const rest: Record<string, TraitRaw> = { ...subs };
		delete rest.SFX;
		t.traits = buildTraits(pres?.traits, rest);
		if (sfx) t.sfx = sfx;
	}
	return t;
}

function buildSet(pres: LegacySet | null, eset: SetObject, name: string): LegacySet {
	const set: LegacySet = pres ? clone(pres) : { name };
	if (!pres) set.name = name;
	for (const [k, v] of Object.entries(eset)) {
		if (k === "traits") continue;
		if (k === "custom") {
			set.custom = mergeCustom(pres?.custom, v);
			continue;
		}
		if (k === "view") {
			set.view = mergeCustom(pres?.view, v);
			continue;
		}
		(set as Record<string, unknown>)[k] = clone(v);
	}
	healSplitView(set);
	const traitsMap = eset.traits as Record<string, TraitRaw> | undefined;
	const sfx = sfxArrayFrom(traitsMap?.SFX);
	const rest: Record<string, TraitRaw> = { ...(traitsMap ?? {}) };
	delete rest.SFX;
	set.traits = buildTraits(pres?.traits, rest);
	if (sfx) set.sfx = sfx;
	return set;
}

/**
 * Fold a layered file (envelope + entity) onto its presentation template and
 * return the legacy array-shaped character the renderer reads. `presentation`
 * is the template character (legacy array shape): its character-level fields
 * (view, custom, portrait, nouns, $schema…) fill whatever the entity does not set,
 * and its `traitSets` supply set/trait order + presentation. Omit it for
 * entity-only output.
 */
export function materializeCharacter(
	file: Record<string, unknown>,
	presentation?: LegacyCharacter | null,
): LegacyCharacter {
	const sets = (file.sets && typeof file.sets === "object" && !Array.isArray(file.sets))
		? (file.sets as Record<string, SetObject | null>)
		: {};

	const base: LegacyCharacter = presentation && typeof presentation === "object"
		? clone(presentation)
		: {};
	const out: LegacyCharacter = base;
	// entity character-level keys win over the presentation base
	for (const [k, v] of Object.entries(file)) {
		if (k === "sets" || k === "template") continue;
		if (k === "custom") {
			out.custom = mergeCustom(base.custom, v);
			continue;
		}
		if (k === "view") {
			out.view = mergeCustom(base.view, v);
			continue;
		}
		out[k] = clone(v);
	}
	healSplitView(out as { view?: unknown; custom?: unknown });
	if (file.portrait && typeof file.portrait === "object") {
		const fp = file.portrait as Record<string, unknown>;
		const bp = (base.portrait && typeof base.portrait === "object") ? (base.portrait as Record<string, unknown>) : {};
		const p: Record<string, unknown> = clone(bp);
		for (const [pk, pv] of Object.entries(fp)) {
			if (pk === "view") p.view = mergeCustom(bp.view, pv);
			else if (pk === "custom") p.custom = mergeCustom(bp.custom, pv);
			else p[pk] = clone(pv);
		}
		healSplitView(p as { view?: unknown; custom?: unknown });
		out.portrait = p;
	}
	// isTemplate belongs to the entity, not the presentation template it folds onto.
	out.isTemplate = file.isTemplate === true;
	// the template ref rides under `template` in layered form, `sheet.template` in render form.
	if (file.template !== undefined) out.sheet = { template: clone(file.template) };

	const presentationSets: LegacySet[] = Array.isArray(presentation?.traitSets)
		? ( presentation!.traitSets as LegacySet[] )
		: ( Array.isArray(file.traitSets) ? ( file.traitSets as LegacySet[] ) : [] );
	const used = new Set<string>();
	const traitSets: LegacySet[] = [];
	// Stable identity: when both sides carry a set id, the ids must agree
	// for a name match to hold. A renamed set (new key, kept id) heals onto
	// its template presentation; a same-named stranger stays a custom set.
	// Missing ids on either side stay name-matched (legacy-tolerant).
	const idOf = (s: unknown) => {
		const id = (s as Record<string, unknown> | null)?.id;
		return typeof id === "string" && id.length ? id : "";
	};
	const presById = new Map<string, LegacySet>();
	for (const pset of presentationSets) {
		const pid = idOf(pset);
		if (pid && !presById.has(pid)) presById.set(pid, pset);
	}
	const orphans: LegacySet[] = [];
	for (const pset of presentationSets) {
		const name = typeof pset.name === "string" ? pset.name : "";
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
		let healed = "";
		if (pid) {
			for (const [ename, eset] of Object.entries(sets)) {
				if (used.has(ename) || ename === "SFX" || eset === null) continue;
				if (idOf(eset) === pid) { healed = ename; break; }
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
		if (used.has(name) || name === "SFX") continue;
		if (eset === null) continue;
		traitSets.push(buildSet(null, eset, name));
	}
	out.traitSets = traitSets;
	return out;
}

// ---------- render -> layered (serialize) ----------

// legacy sfx array -> entity SFX container (the inverse of sfxArrayFrom).
function sfxContainerFrom(arr: unknown[]): Record<string, unknown> {
	const traits: Record<string, unknown> = {};
	const slots: Record<string, unknown> = {};
	(arr || []).forEach((e, i) => {
		if (typeof e === "string") {
			if (!e.length) return;
			const k = /^hinder$/i.test(e) ? "Hinder" : e;
			if (traits[k] === undefined) traits[k] = {};
			return;
		}
	if (e && typeof e === "object" && !Array.isArray(e)) {
		const src = e as Record<string, unknown>;
		const name = typeof src.name === "string" ? src.name : "";
		const o: Record<string, unknown> = {};
		o.description = src.description !== undefined ? clone(src.description) : "";
		if (src.tags !== undefined) o.tags = clone(src.tags);
		if (src.view !== undefined) o.view = clone(src.view);
		if (src.custom !== undefined) o.custom = clone(src.custom);
		if (!name.length) slots[String(i)] = o;
		else traits[name] = o;
	}
	});
	const c: Record<string, unknown> = {};
	if (Object.keys(traits).length) c.traits = traits;
	if (Object.keys(slots).length) c.slots = slots;
	return c;
}

function layeredTraitFrom(t: LegacyTrait): TraitObject {
	const node: TraitObject = {};
	const dice = traitDice(t);
	if (dice.length > 1) {
		node.value = canonDice(dice);
		node.pool = true;
	} else if (dice.length === 1) {
		node.value = "d" + dice[0];
	} else if (t.dice !== undefined || t.value !== undefined) {
		node.value = null; // explicitly unrated
	}
	for (const [k, v] of Object.entries(t)) {
		if (k === "name" || k === "traits" || k === "sfx" || k === "dice" || k === "value" ||
			k === "_lid" || k === "id" || k === "removedTraits") continue;
		// Canonical emit: empty custom/tags stay out (absence carries the
		// same meaning). description "" is KEPT: in a delta it is an
		// explicit clear of an inherited description. Explicit nulls
		// (removals, unrated) are kept.
		if (k === "custom" && v && typeof v === "object" && !Array.isArray(v) && !Object.keys(v).length) continue;
		if (k === "tags" && Array.isArray(v) && !v.length) continue;
		(node as Record<string, unknown>)[k] = clone(v);
	}
	const subs: Record<string, TraitRaw> = {};
	for (const st of Array.isArray(t.traits) ? t.traits : []) {
		if (!st || typeof st.name !== "string" || !st.name.length) continue;
		subs[st.name] = layeredTraitFrom(st);
	}
	if (Array.isArray(t.sfx) && t.sfx.length) {
		const c = sfxContainerFrom(t.sfx);
		if (Object.keys(c).length) subs.SFX = c as TraitObject;
	}
	if (Object.keys(subs).length) node.traits = subs;
	return node;
}

function layeredSetFrom(set: LegacySet): SetObject {
	const s: Record<string, unknown> = {};
	for (const [k, v] of Object.entries(set)) {
		// Set id is the stable join key (kept); trait-level ids stay out.
		if (k === "name" || k === "traits" || k === "sfx" ||
			k === "removedTraits" || k === "removedSets") continue;
		if (k === "custom" && v && typeof v === "object" && !Array.isArray(v) && !Object.keys(v as Record<string, unknown>).length) continue;
		if (k === "tags" && Array.isArray(v) && !v.length) continue;
		s[k] = clone(v);
	}
	const traits: Record<string, TraitRaw> = {};
	for (const tr of Array.isArray(set.traits) ? set.traits : []) {
		if (!tr || typeof tr.name !== "string" || !tr.name.length) continue;
		traits[tr.name] = layeredTraitFrom(tr);
	}
	if (Array.isArray(set.sfx) && set.sfx.length) {
		const c = sfxContainerFrom(set.sfx);
		if (Object.keys(c).length) traits.SFX = c as TraitObject;
	}
	s.traits = traits;
	return s as SetObject;
}

/**
 * Serialize a legacy render character to the layered entity (content + any
 * per-entity overrides, all preserved). Set ids are kept (stable join key);
 * trait-level ids and app-local `_lid` are dropped; `sheet` (the template
 * ref) is left to the caller. This is the lossless inverse of
 * `materializeCharacter` when folded back onto the same template.
 */
export function toLayeredEntity(ch: Record<string, unknown>): Record<string, unknown> {
	const entity: Record<string, unknown> = {};
	for (const [k, v] of Object.entries(ch)) {
		if (k === "traitSets" || k === "sheet" || k === "removedSets") continue;
		entity[k] = clone(v);
	}
	const sets: Record<string, SetObject> = {};
	const seen: Record<string, number> = {};
	for (const set of Array.isArray(ch.traitSets) ? (ch.traitSets as LegacySet[]) : []) {
		if (!set || typeof set.name !== "string" || !set.name.length) continue;
		// Duplicate display names (GMC x6) take suffixed keys in document
		// order, mirroring the template convention — otherwise all but one
		// would collide on the same key and be lost.
		seen[set.name] = (seen[set.name] || 0) + 1;
		const key = seen[set.name] === 1 ? set.name : set.name + "~" + seen[set.name];
		sets[key] = layeredSetFrom(set);
	}
	entity.sets = sets;
	return entity;
}
