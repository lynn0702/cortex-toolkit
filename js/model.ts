/**
 * Canonical app model types.
 *
 * The core shapes (Curiosity / Character / TraitSet / Trait / SheetTemplate) are
 * generated from `schema/0.2/*.schema.json` into `js/model.generated.ts` — see
 * `npm run types` (also chained into `npm run build`). The schema is the single
 * source of truth for those, so types never drift from validation.
 *
 * This module adds the **app-only** layer the schema intentionally leaves open:
 * the `view` compartment (style, features, pips, ring, layout, labels, …).
 * The schema types `custom` as an open map on purpose (other apps may
 * compartmentalize their own keys); we refine our presentation bag in `view`.
 *
 * Known `characterCurioCustom` / `view` keys are typed; an index signature
 * (`unknown`, never `any`) keeps the bag open for forward-compatibility without
 * blocking new keys.
 */
import type {
	Curiosity as GeneratedCuriosity,
	TraitSet as GeneratedTraitSet,
	Trait as GeneratedTrait,
	SheetTemplate as GeneratedSheetTemplate,
	Tags,
} from './model.generated.ts';

// Primitives re-exported unchanged from the schema projection.
export type { Tags } from './model.generated.ts';
export type {
	BorderShape,
	BorderConfig,
	PortraitFrameShape,
	TraitArrayMode,
	FrameShape,
	FrameConfig,
} from './frame-geometry.ts';

// ---------- ratings (2026-10-23: one shape at every level) ----------

/** Rating kinds. A pip is a bubble, filled or not; a track is a list of bubbles. */
export type RatingType = 'Counter' | 'Die' | 'Dice' | 'Pip';

/**
 * One recursive shape for every node — set, trait, subtrait. `value` is
 * always a list; the type interprets it. `range` is the ladder the value
 * may take: the die scale for Die/Dice, [min, max] for a Counter, the
 * bubble count for a Pip. A Pip may omit it: a lone bubble's [true, false]
 * pair is derived, so statement pips store only the value. Rated is not a
 * bool: a node is rated iff it carries a rating.
 */
export interface Rating {
	type: RatingType;
	value: Array<number | boolean>;
	range?: number[];
}

/** The die ladder. The word is `range`, never `scale` — Scale is a trait name. */
export const DIE_LADDER = [4, 6, 8, 10, 12] as number[];

/** Base default: faces 1..hitches hitch; absent inherits; 0 is the exemption. */
export const DEFAULT_HITCHES = 1;

/** Loose node access for rating helpers (array-model and layered nodes alike). */
type RatedNode =
	| {
			rating?: unknown;
			hitches?: unknown;
			pool?: unknown;
			spendable?: unknown;
			keepsExtra?: unknown;
	  }
	| null
	| undefined;

function asNumberList(v: unknown): number[] {
	return Array.isArray(v) ? v.filter((x): x is number => typeof x === 'number' && Number.isFinite(x)) : [];
}

function asRatingValue(v: unknown): Array<number | boolean> {
	if (!Array.isArray(v)) return [];
	return v.filter(
		(x): x is number | boolean => (typeof x === 'number' && Number.isFinite(x)) || typeof x === 'boolean',
	);
}

/** Read the rating off any node; undefined when unrated (containers of subtraits/SFX only). */
export function getRating(node: unknown): Rating | undefined {
	const n = (node && typeof node === 'object' ? node : undefined) as RatedNode;
	if (!n || typeof n !== 'object') return undefined;
	const r = n.rating;
	if (r && typeof r === 'object' && !Array.isArray(r)) {
		const rec = r as Record<string, unknown>;
		const type = rec.type;
		if (type === 'Counter' || type === 'Die' || type === 'Dice' || type === 'Pip') {
			return {
				type,
				value: asRatingValue(rec.value),
				range: asNumberList(rec.range),
				...(typeof rec.out === 'boolean' ? { out: rec.out } : {}),
			};
		}
		return undefined;
	}
	return undefined;
}

/**
 * Resolve the effective rating type for a node: own rating.type if present,
 * else the nearest fallback's rating.type. Explicit `rating: null` on the
 * node itself stops inheritance and returns undefined.
 */
export function resolveType(node: unknown, fallbacks?: Array<unknown>): RatingType | undefined {
	const chain: Array<unknown> = [node, ...(Array.isArray(fallbacks) ? fallbacks : [])];
	for (let i = 0; i < chain.length; i++) {
		const link = chain[i];
		const n = (link && typeof link === 'object' ? link : undefined) as RatedNode;
		if (!n || typeof n !== 'object') continue;
		const r = n.rating;
		if (i === 0 && r === null) return undefined;
		if (r && typeof r === 'object' && !Array.isArray(r)) {
			const t = (r as Record<string, unknown>).type;
			if (t === 'Counter' || t === 'Die' || t === 'Dice' || t === 'Pip') return t;
			if (i === 0 && t !== undefined && t !== null) return undefined;
		}
	}
	return undefined;
}

/**
 * Read the rating off a node, letting an omitted `rating.type` fall through
 * to `fallbacks` (nearest first, typically `[parentTrait, traitSet]`). A node
 * with no `rating` object (or `rating: null`) remains unrated (undefined).
 */
export function resolveRating(node: unknown, fallbacks?: Array<unknown>): Rating | undefined {
	const n = (node && typeof node === 'object' ? node : undefined) as RatedNode;
	if (!n || typeof n !== 'object') return undefined;
	const r = n.rating;
	if (!r || typeof r !== 'object' || Array.isArray(r)) return undefined;
	const rec = r as Record<string, unknown>;
	const rawType = rec.type;
	let type: RatingType | undefined;
	if (rawType === 'Counter' || rawType === 'Die' || rawType === 'Dice' || rawType === 'Pip') {
		type = rawType;
	} else if (rawType === undefined || rawType === null) {
		type = resolveType(undefined, fallbacks);
	}
	if (!type) return undefined;
	return {
		type,
		value: asRatingValue(rec.value),
		range: asNumberList(rec.range),
		...(typeof rec.out === 'boolean' ? { out: rec.out } : {}),
	};
}

/**
 * Stamp a set's own `rating.type` onto any descendant trait whose `rating`
 * omitted `type` before removing or clearing the set rating.
 */
export function preserveInheritedTraitTypes(traitSet: unknown): void {
	const setType = getRating(traitSet)?.type;
	if (!setType || !traitSet || typeof traitSet !== 'object') return;
	const stampNode = (node: unknown) => {
		if (!node || typeof node !== 'object') return;
		const rec = node as Record<string, unknown>;
		const r = rec.rating;
		if (r && typeof r === 'object' && !Array.isArray(r)) {
			const rr = r as Record<string, unknown>;
			if (rr.type === undefined || rr.type === null) {
				rr.type = setType;
			}
		}
		if (Array.isArray(rec.traits)) {
			rec.traits.forEach(stampNode);
		} else if (rec.traits && typeof rec.traits === 'object') {
			Object.values(rec.traits as Record<string, unknown>).forEach(stampNode);
		}
		if (rec.slots && typeof rec.slots === 'object' && !Array.isArray(rec.slots)) {
			Object.values(rec.slots as Record<string, unknown>).forEach(stampNode);
		}
	};
	const ts = traitSet as Record<string, unknown>;
	if (Array.isArray(ts.traits)) {
		ts.traits.forEach(stampNode);
	} else if (ts.traits && typeof ts.traits === 'object') {
		Object.values(ts.traits as Record<string, unknown>).forEach(stampNode);
	}
	if (ts.slots && typeof ts.slots === 'object' && !Array.isArray(ts.slots)) {
		Object.values(ts.slots as Record<string, unknown>).forEach(stampNode);
	}
}

/** A node is rated iff it carries a rating (optionally inheriting type from fallbacks). */
export function isRated(node: unknown, fallbacks?: Array<unknown>): boolean {
	return resolveRating(node, fallbacks) !== undefined;
}

/** Dice staged to the roller from a rating (Die/Dice values only; Counter/Pip stage nothing). */
export function ratingDice(rating: Rating | undefined): number[] {
	if (!rating) return [];
	if (rating.type !== 'Die' && rating.type !== 'Dice') return [];
	return rating.value.filter((v): v is number => typeof v === 'number' && v > 0);
}

/** Write dice onto a node as a Die/Dice rating. Empty clears to unrated. Range options (out) survive the rewrite. */
export function setRatingDice(node: { rating?: unknown }, dice: number[], range?: number[]): void {
	const clean = Array.isArray(dice) ? dice.filter((d) => typeof d === 'number' && d > 0) : [];
	if (clean.length === 0) {
		delete node.rating;
		return;
	}
	const prev =
		node.rating && typeof node.rating === 'object' && !Array.isArray(node.rating)
			? (node.rating as Record<string, unknown>)
			: {};
	const nextRange =
		Array.isArray(range) && range.length
			? [...range]
			: Array.isArray(prev.range) && prev.range.length
				? [...prev.range]
				: undefined;
	node.rating = {
		...prev,
		type: clean.length > 1 ? 'Dice' : 'Die',
		value: clean,
		...(nextRange ? { range: nextRange } : {}),
	};
}

/** Step a single-die rating to a size (or clear when size is null/0). Never touches siblings. Range options (out) survive the rewrite. */
export function setRatingDie(node: { rating?: unknown }, size: number | null, range?: number[]): void {
	if (typeof size === 'number' && size > 0) {
		const prev =
			node.rating && typeof node.rating === 'object' && !Array.isArray(node.rating)
				? (node.rating as Record<string, unknown>)
				: {};
		const nextRange =
			Array.isArray(range) && range.length
				? [...range]
				: Array.isArray(prev.range) && prev.range.length
					? [...prev.range]
					: undefined;
		node.rating = {
			...prev,
			type: 'Die',
			value: [size],
			...(nextRange ? { range: nextRange } : {}),
		};
	} else {
		delete node.rating;
	}
}

/** Spent indices live beside the rating (view.spentDice), never in it. */
export function getSpentIndices(node: unknown): number[] {
	const v = getView(node);
	const spent = v?.spentDice;
	return Array.isArray(spent) ? spent.filter((x): x is number => typeof x === 'number') : [];
}

/** Dice available for staging: rating dice minus spent. Value is never mutated. */
export function availableDice(node: unknown, fallbacks?: Array<unknown>): number[] {
	const dice = ratingDice(resolveRating(node, fallbacks));
	const spent = new Set(getSpentIndices(node));
	return dice.filter((_d, i) => !spent.has(i));
}

/**
 * Resolve hitches for a node: sparse, inherits from the nearest ancestor
 * that sets it, base default 1. `fallbacks` runs nearest-first (parent
 * trait … set). Only hitches 0 is special — the exemption.
 */
export function resolveHitches(node: unknown, fallbacks?: Array<unknown>): number {
	const chain: Array<unknown> = [node, ...(Array.isArray(fallbacks) ? fallbacks : [])];
	for (const link of chain) {
		const n = (link && typeof link === 'object' ? link : undefined) as RatedNode;
		if (n && typeof n.hitches === 'number' && Number.isFinite(n.hitches) && n.hitches >= 0) {
			return Math.floor(n.hitches);
		}
	}
	return DEFAULT_HITCHES;
}

/**
 * rollSeparate is a function, not data: traits whose resolved hitches is 0
 * roll in their own pool so the exemption holds. Computed where rolling
 * happens, stored nowhere.
 */
export function rollSeparate(node: unknown, fallbacks?: Array<unknown>): boolean {
	return resolveHitches(node, fallbacks) === 0;
}

/** keepsExtra: extra dice kept toward the total when rolled. */
export function keepsExtraDice(node: unknown): number {
	const n = (node && typeof node === 'object' ? node : undefined) as RatedNode;
	const k = n && typeof n.keepsExtra === 'number' && Number.isFinite(n.keepsExtra) ? Math.floor(n.keepsExtra) : 0;
	return k > 0 ? k : 0;
}

/** Whether a trait renders as the special ring badge die on portrait-ring sets. */
export function isRingBadgeTrait(t: unknown): boolean {
	if (!t || typeof t !== 'object') return false;
	const v = getView(t);
	if (v?.ringBadge === true) return true;
	if (v?.ringBadge === false) return false;
	return keepsExtraDice(t) > 0;
}

/** Return the primary die size of a set's `ringBadge` trait, or `0` if absent. */
export function getRingBadgeDie(setNode: unknown): number {
	if (!setNode || typeof setNode !== 'object') return 0;
	const traits = (setNode as { traits?: unknown[] }).traits;
	if (!Array.isArray(traits)) return 0;
	const st = traits.find((t) => isRingBadgeTrait(t));
	if (!st) return 0;
	return ratingDice(resolveRating(st, [setNode]))[0] || 8;
}

/** Create, update, or remove a set's `ringBadge` die trait (`dieSize <= 0` removes it). */
export function setRingBadgeDie(setNode: unknown, dieSize: number): void {
	if (!setNode || typeof setNode !== 'object') return;
	const rec = setNode as { traits?: Record<string, unknown>[] };
	if (!Array.isArray(rec.traits)) rec.traits = [];
	const num = Number(dieSize) || 0;
	const idx = rec.traits.findIndex((t) => isRingBadgeTrait(t));
	if (num <= 0) {
		if (idx !== -1) rec.traits.splice(idx, 1);
		return;
	}
	if (idx !== -1) {
		const st = rec.traits[idx];
		st.rating = { type: 'Die', value: [num], range: [4, 6, 8, 10, 12] };
		if (!keepsExtraDice(st)) st.keepsExtra = 1;
	} else {
		rec.traits.push({
			name: 'Ring Die',
			description: '',
			traits: [],
			tags: [],
			keepsExtra: 1,
			rating: { type: 'Die', value: [num], range: [4, 6, 8, 10, 12] },
			view: { ringBadge: true },
		});
	}
}

/** Return true iff this curiosity explicitly tracks Plot Points (`plotPoints` is a finite number). */
export function hasPlotPoints(curiosity: unknown): boolean {
	if (!curiosity || typeof curiosity !== 'object') return false;
	const pp = (curiosity as Record<string, unknown>).plotPoints;
	return typeof pp === 'number' && Number.isFinite(pp);
}

/** Resolve Plot Points on a curiosity; omitted or `null` returns `0` (check `hasPlotPoints` for presence). */
export function resolvePlotPoints(curiosity: unknown): number {
	if (!hasPlotPoints(curiosity)) return 0;
	const rec = curiosity as Record<string, unknown>;
	return Math.max(0, Math.floor(Number(rec.plotPoints) || 0));
}

/** Resolve custom currency/Plot Point short label from view labels or plotPoints trait. */
export function resolveCurrencyLabel(entity: unknown): string {
	if (!entity || typeof entity !== 'object') return 'PP';
	const viewPp = (getView(entity)?.labels as Record<string, unknown> | undefined)?.pp;
	if (typeof viewPp === 'string' && viewPp.trim().length) return viewPp.trim();
	const sets = (entity as { traitSets?: unknown[] }).traitSets;
	if (Array.isArray(sets)) {
		const nameSet = sets.find((s) => isNameSet(s)) as
			{ traits?: Array<{ name?: unknown; label?: unknown }> } | undefined;
		const ppTrait = Array.isArray(nameSet?.traits)
			? nameSet.traits.find((t) => t && typeof t === 'object' && t.name === 'plotPoints')
			: undefined;
		if (typeof ppTrait?.label === 'string' && ppTrait.label.trim().length) {
			return ppTrait.label.trim();
		}
	}
	return 'PP';
}

/** Resolve Plot Point delta (`ppDelta`) on a node or its ancestor chain. */
export function resolvePpDelta(node: unknown, ancestors: unknown[] = []): number {
	const chain: Array<unknown> = [node, ...(Array.isArray(ancestors) ? ancestors : [])];
	for (const link of chain) {
		const n = (link && typeof link === 'object' ? link : undefined) as { ppDelta?: unknown } | undefined;
		if (n && typeof n.ppDelta === 'number' && Number.isFinite(n.ppDelta) && n.ppDelta !== 0) {
			return Math.trunc(n.ppDelta);
		}
	}
	return 0;
}

export interface AltRollConfig {
	die: number;
	ppDelta: number;
	label?: string;
}

export interface AltRollOption {
	die: number;
	ppDelta: number;
	label: string;
	child?: Trait;
}

/**
 * Resolve an alternate roll option (e.g. step-down die + Plot Point delta)
 * from a trait's own rated child traits with non-zero `ppDelta`, falling back
 * to `trait.view.altRoll` or `traitSet.view.altRoll`.
 */
export function resolveAltRoll(trait: unknown, traitSet?: unknown): AltRollOption | null {
	const rec = (trait && typeof trait === 'object' ? trait : undefined) as Record<string, unknown> | undefined;
	if (rec && Array.isArray(rec.traits)) {
		for (const child of rec.traits) {
			if (!child || typeof child !== 'object') continue;
			if (resolveVisibility(child) === 'hidden') continue;
			const ppDelta = resolvePpDelta(child);
			if (ppDelta === 0) continue;
			const dice = ratingDice(resolveRating(child, [rec, traitSet]));
			if (dice.length > 0 && dice[0] > 0) {
				const childRec = child as Record<string, unknown>;
				return {
					die: dice[0],
					ppDelta,
					label: String(childRec.name || childRec.noun || '').trim(),
					child: child as Trait,
				};
			}
		}
	}
	const alt = (getView(trait)?.altRoll ?? getView(traitSet)?.altRoll) as AltRollConfig | undefined;
	if (
		alt &&
		typeof alt === 'object' &&
		typeof alt.die === 'number' &&
		Number.isFinite(alt.die) &&
		alt.die > 0 &&
		typeof alt.ppDelta === 'number' &&
		Number.isFinite(alt.ppDelta) &&
		alt.ppDelta !== 0
	) {
		return {
			die: Math.trunc(alt.die),
			ppDelta: Math.trunc(alt.ppDelta),
			label: typeof alt.label === 'string' ? alt.label.trim() : '',
		};
	}
	return null;
}

/**
 * Resolve a node's die ladder: sparse, inherits from the nearest ancestor
 * that states one. `fallbacks` runs nearest-first (parent trait … set).
 * A Die/Dice rating with a non-empty numeric range wins; then each
 * fallback's view.ratingLadder; then the base ladder. Counter bounds and
 * Pip counts are not ladders — they never inherit through this.
 */
export function resolveRange(node: unknown, fallbacks?: Array<unknown>): number[] {
	const chain: Array<unknown> = [node, ...(Array.isArray(fallbacks) ? fallbacks : [])];
	for (let i = 0; i < chain.length; i++) {
		const link = chain[i];
		const r = resolveRating(link, chain.slice(i + 1));
		if ((r?.type === 'Die' || r?.type === 'Dice') && Array.isArray(r.range) && r.range.length > 0) {
			return r.range.toSorted((a, b) => a - b);
		}
	}
	for (const link of chain) {
		const v = getView(link);
		const ladder = v && typeof v === 'object' ? (v as Record<string, unknown>).ratingLadder : undefined;
		if (Array.isArray(ladder) && ladder.length > 0 && ladder.every((x) => typeof x === 'number')) {
			return (ladder as number[]).toSorted((a, b) => a - b);
		}
	}
	return [...DIE_LADDER];
}

/**
 * Out is a range option for die ratings, defaulted off: most ratings
 * lack it. Explicit `out: true` on the rating opts in; otherwise the
 * set flag that enables Out badges (outIndicator) puts it in range
 * for the set's dice.
 */
export function hasOutRange(node: unknown, fallbacks?: Array<unknown>): boolean {
	const r = resolveRating(node, fallbacks);
	if ((r?.type === 'Die' || r?.type === 'Dice') && (r as RatedNode & { out?: unknown }).out === true) return true;
	for (const fb of Array.isArray(fallbacks) ? fallbacks : []) {
		const v = getView(fb);
		if (!v || typeof v !== 'object') continue;
		const bag = v as Record<string, unknown>;
		if (bag.outIndicator === true) return true;
	}
	return false;
}

/** Top of a die ladder: max effective range step, default d12. Out sits one step past it. */
export function rangeTop(node: unknown, fallbacks?: Array<unknown>): number {
	const steps = resolveRange(node, fallbacks);
	return steps.length ? Math.max(...steps) : 12;
}

/** Out state: out in range, and the die stepped past the top or flagged out. */
export function isOutDie(node: unknown, fallbacks?: Array<unknown>): boolean {
	if (!hasOutRange(node, fallbacks)) return false;
	const first = ratingDice(resolveRating(node, fallbacks))[0] || 0;
	if (first > rangeTop(node, fallbacks)) return true;
	const n = (node && typeof node === 'object' ? node : undefined) as { isOut?: unknown } | undefined;
	return n?.isOut === true;
}

/**
 * Lifts a source trait's die ladder to the set level — one write. The
 * ladder lands on the set's own rating range when the set is rated with
 * the same Die/Dice type, otherwise on the set's view.ratingLadder. The
 * source trait's own range is then cleared: it now equals the set level,
 * so stating it again would only re-densify the file. Counter bounds have
 * no set-level carrier, so they keep the sibling stamp (values
 * preserved verbatim, subtraits included). No-op for Pip, unrated
 * sources, or Die/Dice sources that state no range of their own.
 */
export function applyTypeScopedRange(traitSet: unknown, sourceTrait: unknown): void {
	if (!traitSet || typeof traitSet !== 'object' || !sourceTrait || typeof sourceTrait !== 'object') return;
	const ts = traitSet as Record<string, unknown>;
	const src = sourceTrait as Record<string, unknown>;
	const sourceRating = resolveRating(src, [ts]);
	if (!sourceRating || !sourceRating.type) return;
	const sourceType = sourceRating.type;
	const sourceRange = Array.isArray(sourceRating.range) ? sourceRating.range.filter((x) => typeof x === 'number') : [];

	if (sourceType === 'Counter') {
		const bounds = sourceRange.length >= 2 ? [...sourceRange] : [0, 20];
		function walk(targetTrait: unknown, parents: Array<unknown>) {
			if (!targetTrait || typeof targetTrait !== 'object') return;
			const targetRec = targetTrait as Record<string, unknown>;
			const targetRating = resolveRating(targetRec, parents);
			if (targetRating && targetRating.type === 'Counter') {
				targetRec.rating = {
					type: 'Counter',
					value: Array.isArray(targetRating.value) ? [...targetRating.value] : targetRating.value,
					range: [...bounds],
				};
			}
			if (Array.isArray(targetRec.traits)) {
				for (const child of targetRec.traits) {
					walk(child, [targetRec, ...parents]);
				}
			}
		}
		if (Array.isArray(ts.traits)) {
			for (const rootTrait of ts.traits) {
				walk(rootTrait, [ts]);
			}
		}
		return;
	}

	if (sourceType !== 'Die' && sourceType !== 'Dice') return;
	if (sourceRange.length === 0) return;

	const setRating = getRating(ts);
	if (
		setRating &&
		(setRating.type === 'Die' || setRating.type === 'Dice') &&
		setRating.type === sourceType &&
		ts.rating &&
		typeof ts.rating === 'object' &&
		!Array.isArray(ts.rating)
	) {
		(ts.rating as Record<string, unknown>).range = [...sourceRange];
	} else {
		ensureView(ts).ratingLadder = [...sourceRange];
	}
	if (src.rating && typeof src.rating === 'object' && !Array.isArray(src.rating)) {
		delete (src.rating as Record<string, unknown>).range;
	}
}

/** Resolves the display noun for a child trait / subtrait definition. */
export function resolveSubtraitNoun(sub: unknown, traitSet?: unknown): string {
	if (!sub || typeof sub !== 'object') return 'Subtrait';
	const rec = sub as Record<string, unknown>;
	if (typeof rec.noun === 'string' && rec.noun.trim().length > 0) return rec.noun.trim();
	const v = getView(rec);
	if (typeof v?.noun === 'string' && v.noun.trim().length > 0) return v.noun.trim();
	const setLabel = getView(traitSet)?.labels?.subtrait;
	if (typeof setLabel === 'string' && setLabel.trim().length > 0) return setLabel.trim();
	const name = String(rec.name || '').trim();
	return name || 'Subtrait';
}

/** Resolves the plural noun for a child trait / subtrait definition. */
export function resolveSubtraitPlural(sub: unknown, traitSet?: unknown): string {
	if (!sub || typeof sub !== 'object') return 'Subtraits';
	const rec = sub as Record<string, unknown>;
	if (typeof rec.plural === 'string' && rec.plural.trim().length > 0) return rec.plural.trim();
	const v = getView(rec);
	if (typeof v?.plural === 'string' && v.plural.trim().length > 0) return v.plural.trim();
	const setPlural = getView(traitSet)?.labels?.subtraits;
	if (typeof setPlural === 'string' && setPlural.trim().length > 0) return setPlural.trim();
	const n = resolveSubtraitNoun(rec, traitSet);
	if (!n) return 'Subtraits';
	const trackLabel = getView(traitSet)?.labels?.track;
	if (typeof trackLabel === 'string' && n.toLowerCase() === trackLabel.trim().toLowerCase()) return n;
	if (n.endsWith('s')) return n;
	return n + 's';
}

// ---------- visibility (2026-10-23: shown | editor-only | hidden) ----------

/** Trait visibility: a general capability, not a name-set special case. */
export type Visibility = 'shown' | 'play-only' | 'editor-only' | 'hidden';
export type VisibilityState = Visibility;

/** Resolve visibility; absent is shown. */
export function resolveVisibility(node: unknown): Visibility {
	const v = getView(node);
	if (v && typeof v === 'object') {
		const named = (v as Record<string, unknown>).visibility;
		if (named === 'hidden' || named === 'editor-only' || named === 'play-only' || named === 'shown') return named;
	}
	return 'shown';
}

/** Hidden in a render context: hidden everywhere, editor-only outside Edit. */
export function isHiddenIn(node: unknown, submode: unknown): boolean {
	const vis = resolveVisibility(node);
	if (vis === 'hidden') return true;
	if (vis === 'play-only') return submode === 'print';
	if (vis === 'editor-only') return submode !== 'edit';
	return false;
}

/** Cycle visibility state: shown -> play-only -> editor-only -> hidden -> shown. */
export function nextVisibility(cur: Visibility): Visibility {
	if (cur === 'shown') return 'play-only';
	if (cur === 'play-only') return 'editor-only';
	if (cur === 'editor-only') return 'hidden';
	return 'shown';
}

/**
 * Resolve a trait set's pillar key for the 2D mobile Play deck.
 * Explicit `view.pillar` in JSON always wins; otherwise falls back to
 * structural/behavioral conventions without mutating stored data.
 */
export function resolveSetPillar(traitSet: unknown): string {
	const v = getView(traitSet);
	if (v && typeof v.pillar === 'string' && v.pillar.trim().length > 0) {
		return v.pillar.trim();
	}
	if (isNameSet(traitSet)) {
		return 'prime';
	}
	if (v?.visibility === 'play-only' || v?.playMutable === true) {
		return 'play';
	}
	const body = v?.style?.body;
	if (body === 'portrait-ring') {
		return 'prime';
	}
	return 'plus';
}

/**
 * Resolve the display label for a pillar key on a character sheet.
 * Reads `view.labels.pillars[pillarKey]`, falling back to capitalizing the pillar key.
 */
export function getPillarLabel(character: unknown, pillarKey: string): string {
	const key = String(pillarKey || '').trim();
	if (!key) return '';
	const labels = getView(character)?.labels;
	if (labels && typeof labels === 'object') {
		const map = labels.pillars;
		if (map && typeof map === 'object' && !Array.isArray(map)) {
			const custom = map[key];
			if (typeof custom === 'string' && custom.trim().length > 0) return custom.trim();
		}
	}
	const charRec = character && typeof character === 'object' ? (character as { traitSets?: unknown[] }) : undefined;
	const sets = Array.isArray(charRec?.traitSets) ? charRec.traitSets : [];
	for (const ts of sets) {
		const tsLabels = getView(ts)?.labels;
		if (tsLabels && typeof tsLabels === 'object') {
			const tsMap = tsLabels.pillars;
			if (tsMap && typeof tsMap === 'object' && !Array.isArray(tsMap)) {
				const tsCustom = tsMap[key];
				if (typeof tsCustom === 'string' && tsCustom.trim().length > 0) return tsCustom.trim();
			}
		}
	}
	return key.charAt(0).toUpperCase() + key.slice(1);
}

// ---------- custom.characterCurio sub-shapes (set + character scope) ----------

export interface SetStyle {
	header?: string;
	body?: string;
}

export interface PipsConfig {
	rows?: number;
	perRow?: number;
	connected?: boolean;
	/** Named checkable entries: rows render as bubble-plus-label. */
	labels?: boolean;
}

export interface RingConfig {
	arcAngle?: number;
	arcSpread?: number;
	arcDistance?: number;
	scaleAngle?: number;
	scaleDistance?: number;
	scaleDieX?: number;
	scaleDieY?: number;
}

export type ImageLayoutMode = 'overlay' | 'above' | 'below';

export interface ImageConfig {
	url?: string;
	alignment?: string;
	height?: string | number;
	width?: string;
	caption?: string;
	zoom?: number;
	layout?: ImageLayoutMode;
}

/** The character portrait, with the app-typed `view` and `custom` carriers. */
export interface Portrait {
	url?: string | null;
	alt?: string | null;
	tags?: Tags;
	view?: ViewBag;
	custom?: Custom;
}

/**
 * Nested-grid placement (`view.place`): a set's cell in its page grid.
 * `left`/`width` are percent of the parent width stored as "%" strings
 * (decimals allowed); `top`/`height` are relative row units (integers,
 * `top >= 0`, `height >= 1`). `height` is a floor, not a cage: rows are
 * content-sized and grow. Omitted entirely for a full-width set stacked
 * in document order (sparse).
 */
export interface PlaceRect {
	left: string;
	top: number;
	width: string;
	height: number;
}

/**
 * Trait-part cell (`view.parts.<part>`): a part's cell in the trait's own
 * grid, percent of the set's width. Same shape as `PlaceRect`.
 * Known parts: name, rating, description, block, subtraits, trackLabel,
 * track. Anything else is a validation error.
 */
export interface PartCell {
	left: string;
	top: number;
	width: string;
	height: number;
	marker?: string;
}

/** Library catalog metadata carried under `character.view.listing`. */
export interface TemplateListing {
	id?: string;
	title?: string;
	subtitle?: string;
	genre?: string;
	variant?: string;
	url?: string;
	image?: string;
	quote?: string;
	setting?: string;
	prep?: string;
	complexity?: string;
}

/** Dice-render styling (`view.diceConfig`). */
export interface DiceConfig {
	[k: string]: unknown;
	style?: string;
	backgroundType?: string;
	background?: string;
	backgroundColor1?: string;
	backgroundColor2?: string;
	gradientAngle?: number;
	borderWidth?: number;
	borderColor?: string;
	numeralColor?: string;
	unfilledBorder?: string;
}

/**
 * The canonical view/presentation bag key.
 * Routed through a single constant so any future bag rename is a single-line change.
 */
export const VIEW_KEY = 'view' as const;

/**
 * The app presentation `view` bag. Known keys are typed; the index
 * signature keeps it open (`unknown`, not `any`) so a new key is allowed but
 * still has to be narrowed before use.
 */
export interface CharacterCurioCustom {
	[k: string]: unknown;

	// style / features
	style?: SetStyle;

	// style-specific config
	pips?: PipsConfig;
	imageConfig?: ImageConfig;
	/** Generic Out indicator for any stepped track; default off. */
	outIndicator?: boolean;
	labels?: {
		[k: string]: unknown;
		pp?: string;
		subtrait?: string;
		subtraits?: string;
		track?: string;
		out?: string;
		counter?: string;
		col1?: string;
		col2?: string;
		col3?: string;
		pillars?: Record<string, string>;
	};
	/** Open permissive pillar key for the 2D mobile Play carousel. */
	pillar?: string;
	notes?: string;

	// layout: nested grids with explicit coordinates (2026-10-19).
	// A set carries view.place {left, top, width, height} (percent-of-
	// parent "%" strings + relative row units) and view.parts places
	// trait parts as cells in the trait's grid. Both are sparse: omitted
	// for full-width document-order stacking (place) and flex
	// trait rows (parts).
	place?: PlaceRect;
	ladder?: boolean;
	parts?: Record<string, PartCell>;
	flex?: boolean;
	cluster?: string;
	/** Set header placement: vertical sidebar label, a horizontal top bar, a bottom bar, or hidden. */
	header?: 'sidebar' | 'top' | 'bottom' | 'none';
	/** Header text alignment (respected in both orientations). */
	headerAlign?: 'left' | 'center' | 'right';
	/** Vertical alignment of the set within its grid band row. */
	verticalAlign?: 'top' | 'center' | 'bottom';
	page?: number;
	editorDock?: 'left' | 'right';
	traitColumns?: number;
	ratingLadder?: number[];
	reservedSlots?: number | null;

	/** When true, trait is placed on the set's ring rather than the trait list. */
	ring?: boolean;
	pipSeparator?: string;
	/** Section border configuration (`none | block | line`). */
	border?: import('./frame-geometry.ts').BorderShape | Partial<import('./frame-geometry.ts').BorderConfig> | string;
	/** Singular noun override for traits on a ring (e.g. "Boss Die"). */
	ringNoun?: string;
	// behavior / labels
	/** Rung label direction on ladder layouts: horizontal text or rotated vertical. */
	labelPosition?: 'horizontal' | 'vertical';
	branchArrows?: boolean;
	endWord?: string;
	/** Pool staging on the set node (one recursive shape): clicks stage the whole array. */
	pool?: boolean;
	/** Spend control on the set node; spent state lives in spentDice beside the rating. */
	spendable?: boolean;
	/** Whether this set permits adding and removing traits during Play mode. */
	playMutable?: boolean;
	/** How die ratings are displayed on traits: full track (ladder) or rating only. Defaults to 'track'. */
	ratingDisplay?: 'track' | 'rating';
	/** SVG Frame & Border layout configuration (Phase 3c). */
	frame?:
		| import('./frame-geometry.ts').FrameConfig
		| Partial<import('./frame-geometry.ts').FrameConfig>
		| import('./frame-geometry.ts').FrameShape
		| string;

	// ring / portrait ring
	ringBadge?: boolean;
	ringBadgeDie?: number;

	// mechanics / printing / child routing
	altRoll?: AltRollConfig;
	fixedNames?: boolean;
	prompt?: boolean;
	part?: 'block' | 'subtraits' | 'track';
	notesMarkdown?: boolean;

	// app-only trait-level flags that live under `trait.view`
	spentDice?: number[];
	/** Trait visibility word: shown | editor-only | hidden. Shown is absence. */
	visibility?: Visibility;
	/** Badge part data (trait-level). */
	badge?: { text: string; shape: string; color: string; icon?: string };
	/** Prefix text rendered before each SFX line of this trait's block. */
	prefix?: { text: string };
	xp?: number | string;
	counter?: number | string;
	branchRole?: 'skill' | 'specialty';
	branchSide?: 'left' | 'right';
	linkTo?: number;

	// character-scope
	pageCount?: number;
	/** Explicit user-created pillar order for Play deck columns. */
	pillars?: string[];
	pageOrientation?: 'portrait' | 'landscape';
	orientation?: 'portrait' | 'landscape';
	diceConfig?: DiceConfig;
	watermark?: {
		enabled?: boolean;
		url?: string;
		page?: string | number;
		opacity?: number;
		scale?: number;
	};
	theme?: {
		[k: string]: unknown;
		fonts?: {
			heading?: string;
			primary?: string;
			secondary?: string;
		};
	};
	customFonts?: Array<{ name?: string; url?: string }>;
	nickname?: string;
	hasNickname?: boolean;
	accentColor?: string;
	primaryColor?: string;
	secondaryColor?: string;
	editableOnSheet?: boolean;
	noun?: string;
	plural?: string;
	listing?: TemplateListing;
}

export type ViewBag = CharacterCurioCustom;
export type ViewConfig = CharacterCurioCustom;

/**
 * The name block is the first trait set (view.style.body "name"): its
 * traits are the header fields, carrying labels as the trait `label`
 * field and visibility in trait `view`. Values stay on the character
 * fields; the traits are presentation records.
 *
 * Render-time check (views are always present in memory). Serialized
 * forms may prune the view away; the name-set detector also accepts the
 * reserved id 'name' (which ensureTraitSetIds never assigns elsewhere).
 */
export function isNameSet(set: unknown): boolean {
	if (!set || typeof set !== 'object') return false;
	if ((set as Record<string, unknown>).id === 'name') return true;
	const v = getView(set);
	return Boolean(v && typeof v === 'object' && v.style?.body === 'name');
}

export const RESERVED_NAME_IDENTITY_KEYS = new Set([
	'name',
	'game',
	'player',
	'nickname',
	'pronouns',
	'description',
	'notes',
	'portrait',
	'caption',
	'plotpoints',
]);

/**
 * True when a trait inside the Name set represents a reserved identity field
 * override (unrated metadata record) rather than a custom user trait.
 */
export function isNameIdentitySlotTrait(trait: unknown): boolean {
	if (!trait || typeof trait !== 'object' || Array.isArray(trait)) return false;
	const rec = trait as Record<string, unknown>;
	const key = typeof rec.name === 'string' ? rec.name.trim().toLowerCase() : '';
	if (!RESERVED_NAME_IDENTITY_KEYS.has(key)) return false;
	return getRating(trait) === undefined;
}

/**
 * Accessor for the presentation view bag on any character, set, trait, or portrait.
 * Routes through VIEW_KEY.
 */
export function getView<T = ViewBag>(obj: unknown): T | undefined {
	if (!obj || typeof obj !== 'object') return undefined;
	const record = obj as Record<string, unknown>;
	return record[VIEW_KEY] as T | undefined;
}

/**
 * Ensures the presentation view bag exists on an object and returns the mutable view bag.
 */
export function ensureView<T = ViewBag>(obj: unknown): T {
	if (!obj || typeof obj !== 'object') {
		throw new TypeError('ensureView called on non-object');
	}
	const record = obj as Record<string, unknown>;
	if (!record[VIEW_KEY]) {
		record[VIEW_KEY] = {};
	}
	return record[VIEW_KEY] as T;
}

/** `trait.custom`. */
export interface TraitCustom {
	[k: string]: unknown;
	spentDice?: number[];
	linkTo?: number;
	branchRole?: 'skill' | 'specialty';
	branchSide?: 'left' | 'right';
	xp?: number | string;
	counter?: number | string;
}

/** The open `custom` map. */
export interface Custom {
	[k: string]: unknown;
}

/** Per-character arrangement preferences (file-traveling + live). */
export interface CharacterPrefs {
	version?: number;
	setOrder?: string[];
	traitOrders?: Record<string, string[]>;
	declinedTemplateVersions?: Record<string, number>;
	[k: string]: unknown;
}

// ---------- app document types (schema shape + typed view & custom) ----------

export type Trait = Omit<GeneratedTrait, 'custom' | 'view' | 'traits'> & {
	view?: ViewBag;
	custom?: TraitCustom;
	traits?: Trait[];
	/** App-only: stress "out" marker (rendered as the 💥 OUT badge). */
	isOut?: boolean;
	/** App-only: single-use spent toggle (e.g. Plot-Point resource or asset). */
	spent?: boolean;
	/** App-only: attached-stress value (mirrors `custom.stress`). */
	stress?: number;
	/** App-only: template trait names removed from this trait (D19 restore). */
	removedTraits?: string[];
	/** App-only: stable internal key for Vue :key / ordering. */
	_lid?: string;
	id?: string;
};

export type TraitSet = Omit<GeneratedTraitSet, 'custom' | 'view' | 'traits' | 'portrait'> & {
	view?: ViewBag;
	custom?: Custom;
	traits: Trait[];
	portrait?: Portrait | null;
	/** App-only: stable internal key. */
	_lid?: string;
	/** App-only: template trait names removed from this set (D19 restore). */
	removedTraits?: string[];
};

export interface SheetRef {
	id: string;
	version?: number | null;
	character?: Curiosity;
	[k: string]: unknown;
}

export type Curiosity = Omit<GeneratedCuriosity, 'custom' | 'view' | 'traitSets' | 'curiosities' | 'sheet'> & {
	view?: ViewBag;
	custom?: Custom;
	traitSets: TraitSet[];
	curiosities?: Record<string, Curiosity> | null;
	sheet?: { template?: SheetRef | SheetTemplate | null; [k: string]: unknown } | null;
	/** App-only: template set ids removed from this curiosity. */
	removedSets?: string[];
};

export type Character = Curiosity;

export type SheetTemplate = Omit<GeneratedSheetTemplate, 'character' | 'id' | 'version'> & {
	id: string;
	version?: number;
	character: Curiosity;
	userSaved?: boolean;
};

// Convenience aliases used across the app.
export type CharacterCurio = CharacterCurioCustom;

export type IdentityFieldKey = 'pronouns' | 'player' | 'game' | 'nickname' | 'notes' | 'description';

/** Locate the primary `Name` (`body: 'name'` or `id: 'name'`) set on a render or layered curiosity. */
export function getNameSet(curiosity: unknown): Record<string, unknown> | undefined {
	if (!curiosity || typeof curiosity !== 'object' || Array.isArray(curiosity)) return undefined;
	const rec = curiosity as Record<string, unknown>;
	if (Array.isArray(rec.traitSets)) {
		const hit = rec.traitSets.find((ts: unknown) => isNameSet(ts));
		if (hit && typeof hit === 'object') return hit as Record<string, unknown>;
	}
	if (rec.sets && typeof rec.sets === 'object' && !Array.isArray(rec.sets)) {
		for (const [key, val] of Object.entries(rec.sets as Record<string, unknown>)) {
			if (!val || typeof val !== 'object' || Array.isArray(val)) continue;
			if (isNameSet(val) || key === 'Name') return val as Record<string, unknown>;
		}
	}
	return undefined;
}

/** Locate an identity child trait (`pronouns`, `player`, `game`, `nickname`, `notes`, `description`, `portrait`) inside a `Name` set. */
export function getIdentityTrait(
	curiosityOrSet: unknown,
	key: string,
	targetSet?: unknown,
): Record<string, unknown> | undefined {
	const ns =
		targetSet && typeof targetSet === 'object' && !Array.isArray(targetSet)
			? (targetSet as Record<string, unknown>)
			: isNameSet(curiosityOrSet)
				? (curiosityOrSet as Record<string, unknown>)
				: getNameSet(curiosityOrSet);
	if (!ns) return undefined;
	const needle = key.trim().toLowerCase();
	if (Array.isArray(ns.traits)) {
		const hit = ns.traits.find(
			(t: unknown) =>
				t &&
				typeof t === 'object' &&
				String((t as Record<string, unknown>).name || '')
					.trim()
					.toLowerCase() === needle,
		);
		return hit && typeof hit === 'object' ? (hit as Record<string, unknown>) : undefined;
	}
	if (ns.traits && typeof ns.traits === 'object') {
		for (const [k, v] of Object.entries(ns.traits as Record<string, unknown>)) {
			if (k.trim().toLowerCase() === needle && v && typeof v === 'object' && !Array.isArray(v)) {
				return v as Record<string, unknown>;
			}
		}
	}
	return undefined;
}

/** Read an identity text value from the `Name` set (falling back to root `description` when `key === 'description'`). */
export function getIdentityText(curiosity: unknown, key: IdentityFieldKey, targetSet?: unknown): string {
	if (!curiosity || typeof curiosity !== 'object') return '';
	const rec = curiosity as Record<string, unknown>;
	const ns =
		targetSet && typeof targetSet === 'object' && !Array.isArray(targetSet)
			? (targetSet as Record<string, unknown>)
			: getNameSet(rec);
	const tr = getIdentityTrait(rec, key, ns);
	if (tr && typeof tr.description === 'string' && tr.description.length > 0) {
		return tr.description;
	}
	if (key === 'description') {
		if (ns && typeof ns.description === 'string' && ns.description.length > 0) return ns.description;
		if (typeof rec.description === 'string') return rec.description;
	}
	return '';
}

/** Write an identity text value into the `Name` set (creating the child trait on demand). */
export function setIdentityText(curiosity: unknown, key: IdentityFieldKey, val: string, targetSet?: unknown): void {
	if (!curiosity || typeof curiosity !== 'object') return;
	const curRec = curiosity as Record<string, unknown>;
	const ns =
		targetSet && typeof targetSet === 'object' && !Array.isArray(targetSet)
			? (targetSet as Record<string, unknown>)
			: getNameSet(curRec);
	if (key === 'description') {
		if (ns) {
			ns.description = val;
			const tr = getIdentityTrait(curRec, 'description', ns);
			if (tr && typeof tr.description === 'string') delete tr.description;
			if (typeof curRec.description === 'string') delete curRec.description;
		} else {
			curRec.description = val;
		}
		return;
	}
	if (!ns) return;
	let tr = getIdentityTrait(curRec, key, ns);
	if (!tr) {
		if (!val) return;
		if (!Array.isArray(ns.traits)) ns.traits = [];
		tr = { name: key, description: val, traits: [] };
		(ns.traits as Record<string, unknown>[]).push(tr);
		return;
	}
	tr.description = val;
}

/** Read the portrait object attached to the `Name` set (if present). */
export function getCuriosityPortrait(curiosity: unknown, targetSet?: unknown): Portrait | undefined {
	const ns =
		targetSet && typeof targetSet === 'object' && !Array.isArray(targetSet)
			? (targetSet as Record<string, unknown>)
			: isNameSet(curiosity)
				? (curiosity as Record<string, unknown>)
				: getNameSet(curiosity);
	if (ns?.portrait && typeof ns.portrait === 'object' && !Array.isArray(ns.portrait)) {
		return ns.portrait as Portrait;
	}
	return undefined;
}

/** Ensure and return a mutable `portrait` object on the `Name` set. */
export function ensureCuriosityPortrait(curiosity: unknown, targetSet?: unknown): Portrait | undefined {
	const ns =
		targetSet && typeof targetSet === 'object' && !Array.isArray(targetSet)
			? (targetSet as Record<string, unknown>)
			: getNameSet(curiosity);
	if (!ns) return undefined;
	if (!ns.portrait || typeof ns.portrait !== 'object' || Array.isArray(ns.portrait)) {
		ns.portrait = { url: '', alt: '', tags: [] };
	}
	const p = ns.portrait as Portrait;
	p.url ??= '';
	p.alt ??= '';
	p.tags ??= [];
	return p;
}

/** Resolve the best available thumbnail image URL for Roster / Navigation cards. */
export function getCuriosityThumbnailUrl(curiosity: unknown): string {
	if (!curiosity || typeof curiosity !== 'object') return '';
	const p = getCuriosityPortrait(curiosity);
	if (typeof p?.url === 'string' && p.url.trim().length > 0) return p.url.trim();
	const listingImg = getView(curiosity)?.listing?.image;
	if (typeof listingImg === 'string' && listingImg.trim().length > 0) return listingImg.trim();
	const rec = curiosity as Record<string, unknown>;
	const sets = Array.isArray(rec.traitSets)
		? rec.traitSets
		: rec.sets && typeof rec.sets === 'object'
			? Object.values(rec.sets as Record<string, unknown>)
			: [];
	for (const ts of sets) {
		if (!ts || typeof ts !== 'object') continue;
		const v = getView(ts);
		const frameUrl = typeof v?.frame === 'object' ? v?.frame?.image?.url : undefined;
		if (typeof frameUrl === 'string' && frameUrl.trim().length > 0) return frameUrl.trim();
		const imgUrl = v?.imageConfig?.url;
		if (typeof imgUrl === 'string' && imgUrl.trim().length > 0) return imgUrl.trim();
	}
	return '';
}

/** Resolve the `game` label from `Name` set identity traits. */
export function getCuriosityGame(curiosity: unknown): string {
	return (
		getIdentityText(curiosity, 'game').trim() ||
		trimmedString((curiosity as Record<string, unknown> | null | undefined)?.game)
	);
}

function trimmedString(val: unknown): string {
	return typeof val === 'string' ? val.trim() : '';
}

function resolveTemplateRecords(tmplOrChar: unknown): {
	entry?: Record<string, unknown>;
	character?: Record<string, unknown>;
} {
	if (!tmplOrChar || typeof tmplOrChar !== 'object' || Array.isArray(tmplOrChar)) {
		return {};
	}
	const entry = tmplOrChar as Record<string, unknown>;
	const character =
		entry.character && typeof entry.character === 'object' && !Array.isArray(entry.character)
			? (entry.character as Record<string, unknown>)
			: entry;
	return { entry, character };
}

/** Read Library listing metadata from `character.view.listing`. */
export function getTemplateListing(tmplOrChar: unknown): TemplateListing | undefined {
	const { entry, character } = resolveTemplateRecords(tmplOrChar);
	if (!entry) return undefined;
	const viewListing = getView(character)?.listing;
	if (viewListing && typeof viewListing === 'object' && !Array.isArray(viewListing)) {
		return viewListing as TemplateListing;
	}
	return undefined;
}

/** Return true iff `listing` contains at least one non-empty trimmed string value. */
export function hasTemplateListing(listing: unknown): boolean {
	if (!listing || typeof listing !== 'object' || Array.isArray(listing)) return false;
	return Object.values(listing as Record<string, unknown>).some(
		(val) => typeof val === 'string' && val.trim().length > 0,
	);
}

/** Resolve the display title for a Library card or template picker entry. */
export function getTemplateTitle(tmpl: unknown): string {
	const { entry, character } = resolveTemplateRecords(tmpl);
	const listing = getTemplateListing(tmpl);
	return (
		trimmedString(listing?.title) ||
		trimmedString(entry?.title) ||
		trimmedString(getCuriosityGame(character)) ||
		trimmedString(character?.name) ||
		trimmedString(entry?.name) ||
		trimmedString(entry?.id)
	);
}

/** Resolve the subtitle for a Library card. */
export function getTemplateSubtitle(tmpl: unknown): string {
	const { entry } = resolveTemplateRecords(tmpl);
	const listing = getTemplateListing(tmpl);
	return trimmedString(listing?.subtitle) || trimmedString(entry?.subtitle);
}

/** Resolve the genre badge label for a Library card. */
export function getTemplateGenre(tmpl: unknown): string {
	const { entry } = resolveTemplateRecords(tmpl);
	const listing = getTemplateListing(tmpl);
	return trimmedString(listing?.genre) || trimmedString(entry?.genre);
}

/** Resolve the sheet variant badge label for a Library card. */
export function getTemplateVariant(tmpl: unknown): string {
	const { entry } = resolveTemplateRecords(tmpl);
	const listing = getTemplateListing(tmpl);
	return trimmedString(listing?.variant) || trimmedString(entry?.variant);
}

/** Resolve the Library card description from `view.listing.quote` or `character` / `Name` description. */
export function getTemplateDescription(tmpl: unknown): string {
	const { character } = resolveTemplateRecords(tmpl);
	const listing = getTemplateListing(tmpl);
	return trimmedString(listing?.quote) || trimmedString(getIdentityText(character, 'description'));
}

/** Resolve the hero portrait/cover image URL for a Library card. */
export function getTemplateHeroImage(tmpl: unknown): string {
	const { character } = resolveTemplateRecords(tmpl);
	const listing = getTemplateListing(tmpl);
	return trimmedString(listing?.image) || getCuriosityThumbnailUrl(character);
}

/** Wrap a `.curio.json` Character in a canonical `SheetTemplate` envelope. */
export function characterToSheetTemplate(character: Character, fallbackId?: string): SheetTemplate {
	const id = trimmedString(getView(character)?.listing?.id) || trimmedString(fallbackId) || character.id;
	return {
		id,
		character,
		version: 1,
	};
}
