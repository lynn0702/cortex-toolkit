/**
 * Canonical app model types.
 *
 * The core shapes (Character / TraitSet / Trait / Sfx / SheetTemplate) are
 * generated from `schema/0.1/*.schema.json` into `js/model.generated.ts` — see
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
	Character as GeneratedCharacter,
	TraitSet as GeneratedTraitSet,
	Trait as GeneratedTrait,
	SheetTemplate as GeneratedSheetTemplate,
	Tags,
} from './model.generated.ts';

// Primitives re-exported unchanged from the schema projection.
export type { Tags } from './model.generated.ts';

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
			value?: unknown;
			dice?: unknown;
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
	// Defensive read of pre-rating encodings.
	const dice = Array.isArray(n.dice) ? n.dice.filter((d): d is number => typeof d === 'number' && d > 0) : [];
	if (dice.length > 0) {
		return { type: dice.length > 1 ? 'Dice' : 'Die', value: dice, range: [...DIE_LADDER] };
	}
	if (typeof n.value === 'number' && n.value > 0) {
		return { type: 'Die', value: [n.value], range: [...DIE_LADDER] };
	}
	return undefined;
}

/** A node is rated iff it carries a rating. */
export function isRated(node: unknown): boolean {
	return getRating(node) !== undefined;
}

/** Dice staged to the roller from a rating (Die/Dice values only; Counter/Pip stage nothing). */
export function ratingDice(rating: Rating | undefined): number[] {
	if (!rating) return [];
	if (rating.type !== 'Die' && rating.type !== 'Dice') return [];
	return rating.value.filter((v): v is number => typeof v === 'number' && v > 0);
}

/** Write dice onto a node as a Die/Dice rating. Empty clears to unrated. Range options (out) survive the rewrite. */
export function setRatingDice(node: Record<string, any>, dice: number[], range?: number[]): void {
	const clean = Array.isArray(dice) ? dice.filter((d) => typeof d === 'number' && d > 0) : [];
	if (clean.length === 0) {
		delete node.rating;
		return;
	}
	const prev = node.rating && typeof node.rating === 'object' && !Array.isArray(node.rating) ? node.rating : {};
	node.rating = {
		...prev,
		type: clean.length > 1 ? 'Dice' : 'Die',
		value: clean,
		range:
			Array.isArray(range) && range.length
				? [...range]
				: Array.isArray(prev.range) && prev.range.length
					? [...prev.range]
					: [...DIE_LADDER],
	};
}

/** Step a single-die rating to a size (or clear when size is null/0). Never touches siblings. Range options (out) survive the rewrite. */
export function setRatingDie(node: Record<string, any>, size: number | null, range?: number[]): void {
	if (typeof size === 'number' && size > 0) {
		const prev = node.rating && typeof node.rating === 'object' && !Array.isArray(node.rating) ? node.rating : {};
		node.rating = {
			...prev,
			type: 'Die',
			value: [size],
			range:
				Array.isArray(range) && range.length
					? [...range]
					: Array.isArray(prev.range) && prev.range.length
						? [...prev.range]
						: [...DIE_LADDER],
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
export function availableDice(node: unknown): number[] {
	const dice = ratingDice(getRating(node));
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

/** keepsExtra: the Scale effect, named where data must name it. */
export function keepsExtraDice(node: unknown): number {
	const n = (node && typeof node === 'object' ? node : undefined) as RatedNode;
	const k = n && typeof n.keepsExtra === 'number' && Number.isFinite(n.keepsExtra) ? Math.floor(n.keepsExtra) : 0;
	return k > 0 ? k : 0;
}

/**
 * Out is a range option for die ratings, defaulted off: most ratings
 * lack it. Explicit `out: true` on the rating opts in; otherwise the
 * set flag that enables Out badges (outIndicator) puts it in range
 * for the set's dice.
 */
export function hasOutRange(node: unknown, fallbacks?: Array<unknown>): boolean {
	const r = getRating(node);
	if ((r?.type === 'Die' || r?.type === 'Dice') && (r as RatedNode & { out?: unknown }).out === true) return true;
	for (const fb of Array.isArray(fallbacks) ? fallbacks : []) {
		const v = getView(fb);
		if (!v || typeof v !== 'object') continue;
		const bag = v as Record<string, unknown>;
		if (bag.outIndicator === true) return true;
	}
	return false;
}

/** Top of a die ladder: max range step, default d12. Out sits one step past it. */
export function rangeTop(node: unknown): number {
	const r = getRating(node);
	const steps =
		r && Array.isArray((r as RatedNode & { range?: unknown }).range)
			? ((r as RatedNode & { range?: unknown }).range as unknown[]).filter((x): x is number => typeof x === 'number')
			: [];
	return steps.length ? Math.max(...steps) : 12;
}

/** Out state: out in range, and the die stepped past the top or flagged out. */
export function isOutDie(node: unknown, fallbacks?: Array<unknown>): boolean {
	if (!hasOutRange(node, fallbacks)) return false;
	const first = ratingDice(getRating(node))[0] || 0;
	if (first > rangeTop(node)) return true;
	const n = (node && typeof node === 'object' ? node : undefined) as { isOut?: unknown } | undefined;
	return n?.isOut === true;
}

/**
 * Applies a source trait's range to every rated trait of the same type in the set
 * (and subtraits recursively). Preserves target values verbatim.
 * No-op for Pip or unrated source.
 */
export function applyTypeScopedRange(traitSet: any, sourceTrait: any): void {
	if (!traitSet || !sourceTrait) return;
	const sourceRating = getRating(sourceTrait);
	if (!sourceRating || !sourceRating.type || sourceRating.type === 'Pip') return;
	const sourceType = sourceRating.type;
	const sourceRange = Array.isArray(sourceRating.range)
		? [...sourceRating.range]
		: sourceType === 'Counter'
			? [0, 20]
			: [4, 6, 8, 10, 12];

	function walk(targetTrait: any) {
		if (!targetTrait || typeof targetTrait !== 'object') return;
		const targetRating = getRating(targetTrait);
		if (targetRating && targetRating.type === sourceType) {
			targetTrait.rating = {
				type: targetRating.type,
				value: Array.isArray(targetRating.value) ? [...targetRating.value] : targetRating.value,
				range: [...sourceRange],
				...((sourceRating as any).out !== undefined ? { out: (sourceRating as any).out } : {}),
			};
		}
		if (Array.isArray(targetTrait.traits)) {
			for (const child of targetTrait.traits) {
				walk(child);
			}
		}
	}

	if (Array.isArray(traitSet.traits)) {
		for (const rootTrait of traitSet.traits) {
			walk(rootTrait);
		}
	}
}

/** Resolves the display noun for a child trait / subtrait definition. */
export function resolveSubtraitNoun(sub: any): string {
	if (!sub || typeof sub !== 'object') return 'Subtrait';
	if (typeof sub.noun === 'string' && sub.noun.trim().length > 0) return sub.noun.trim();
	const v = getView(sub);
	if (typeof v?.noun === 'string' && v.noun.trim().length > 0) return v.noun.trim();
	const r = getRating(sub);
	if (r?.type === 'Pip' && (!Array.isArray(r.value) || r.value.length <= 1)) return 'Statement';
	const name = String(sub.name || '').trim();
	if (name.includes(' ') && name.length > 20) return 'Statement';
	return name || 'Subtrait';
}

/** Resolves the plural noun for a child trait / subtrait definition. */
export function resolveSubtraitPlural(sub: any): string {
	if (!sub || typeof sub !== 'object') return 'Subtraits';
	if (typeof sub.plural === 'string' && sub.plural.trim().length > 0) return sub.plural.trim();
	const v = getView(sub);
	if (typeof v?.plural === 'string' && v.plural.trim().length > 0) return v.plural.trim();
	const n = resolveSubtraitNoun(sub);
	if (!n) return 'Subtraits';
	if (n.toLowerCase() === 'stress') return 'Stress';
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
		return 'identity';
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
 * Reads `view.labels.pillars[pillarKey]` or `view.labels['pillar_' + pillarKey]`,
 * falling back to capitalizing the pillar key.
 */
export function getPillarLabel(character: unknown, pillarKey: string): string {
	const key = String(pillarKey || '').trim();
	if (!key) return '';
	const labels = getView(character)?.labels as Record<string, any> | undefined;
	if (labels && typeof labels === 'object') {
		const map = labels.pillars;
		if (map && typeof map === 'object' && !Array.isArray(map)) {
			const custom = map[key];
			if (typeof custom === 'string' && custom.trim().length > 0) return custom.trim();
		}
		const flat = labels['pillar_' + key];
		if (typeof flat === 'string' && flat.trim().length > 0) return flat.trim();
	}
	const sets =
		character && typeof character === 'object' && Array.isArray((character as any).traitSets)
			? (character as any).traitSets
			: [];
	for (const ts of sets) {
		const tsLabels = getView(ts)?.labels as Record<string, any> | undefined;
		if (tsLabels && typeof tsLabels === 'object') {
			const tsMap = tsLabels.pillars;
			if (tsMap && typeof tsMap === 'object' && !Array.isArray(tsMap)) {
				const tsCustom = tsMap[key];
				if (typeof tsCustom === 'string' && tsCustom.trim().length > 0) return tsCustom.trim();
			}
			const tsFlat = tsLabels['pillar_' + key];
			if (typeof tsFlat === 'string' && tsFlat.trim().length > 0) return tsFlat.trim();
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
	arcSlide?: number;
	scaleAngle?: number;
	scaleDistance?: number;
	scaleDieX?: number;
	scaleDieY?: number;
}

export interface ImageConfig {
	url?: string;
	alignment?: string;
	height?: string;
	caption?: string;
	zoom?: number;
}

/** The character portrait, with the app-typed `view` and `custom` carriers. */
export interface Portrait {
	url?: string;
	alt?: string;
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
	ringConfig?: RingConfig;
	imageConfig?: ImageConfig;
	/** Generic Out indicator for any stepped track; default off. */
	outIndicator?: boolean;
	labels?: { [k: string]: any; pillars?: Record<string, string> };
	/** Open permissive pillar key for the 2D mobile Play carousel. */
	pillar?: string;
	notes?: string;

	// layout: nested grids with explicit coordinates (2026-10-19).
	// A set carries view.place {left, top, width, height} (percent-of-
	// parent "%" strings + relative row units) and view.parts places
	// trait parts as cells in the trait's grid. Both are sparse: omitted
	// for full-width document-order stacking (place) and legacy flex
	// trait rows (parts).
	place?: PlaceRect;
	ladder?: boolean;
	parts?: Record<string, PartCell>;
	flex?: boolean;
	cluster?: string;
	/** Set header placement: vertical sidebar label, a horizontal top bar, or a bottom bar. */
	header?: 'sidebar' | 'top' | 'bottom';
	/** Header text alignment (respected in both orientations). */
	headerAlign?: 'left' | 'center' | 'right';
	page?: number;
	editorDock?: 'left' | 'right';
	traitColumns?: number;
	ratingLadder?: number[];
	reservedSlots?: number | null;

	/** When true, trait is placed on the set's ring rather than the trait list. */
	ring?: boolean;
	hideRingNames?: boolean;
	statementSeparator?: string;
	/** Remove borders, backgrounds, and box-shadows around the section. */
	borderless?: boolean;
	/** Singular noun override for traits on a ring (e.g. "Boss Die"). */
	ringNoun?: string;
	// behavior / labels
	/** @deprecated superseded by parts; read for legacy data only (kept for vertical ladders). */
	ratingPosition?: 'inline' | 'above' | 'below' | 'none' | 'vertical';
	/** Rung label direction on ladder layouts: horizontal text or rotated vertical. */
	labelPosition?: 'horizontal' | 'vertical';
	counterLabel?: string;
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
	scaleDie?: number;
	scale?: number;

	// app-only trait-level flags that live under `trait.view`
	spentDice?: number[];
	/** @deprecated apart-rolling derives from hitches (0 rolls apart); read never, never write. */
	isResource?: boolean;
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
	customFonts?: Array<{ name?: string; data?: string }>;
	nickname?: string;
	hasNickname?: boolean;
	accentColor?: string;
	primaryColor?: string;
	secondaryColor?: string;
	editableOnSheet?: boolean;
	noun?: string;
	plural?: string;
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
	const v = getView(set);
	return Boolean(set && typeof set === 'object' && v && typeof v === 'object' && v.style?.body === 'name');
}

/**
 * Accessor for the presentation view bag on any character, set, trait, or portrait.
 * Routes through VIEW_KEY.
 */
export function getView<T = ViewBag>(obj: unknown): T | undefined {
	if (!obj || typeof obj !== 'object') return undefined;
	const record = obj as Record<string, any>;
	return record[VIEW_KEY] as T | undefined;
}

/**
 * Ensures the presentation view bag exists on an object and returns the mutable view bag.
 */
export function ensureView<T = ViewBag>(obj: unknown): T {
	if (!obj || typeof obj !== 'object') {
		throw new TypeError('ensureView called on non-object');
	}
	const record = obj as Record<string, any>;
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
	/** @deprecated apart-rolling derives from hitches (0 rolls apart); read never, never write. */
	isResource?: boolean;
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
	/** App-only: attached-stress value (mirrors `custom.stress`). */
	stress?: number;
	/** @deprecated apart-rolling derives from hitches (0 rolls apart); read never, never write. */
	isResource?: boolean;
	/** App-only: template trait names removed from this trait (D19 restore). */
	removedTraits?: string[];
	/** App-only: stable internal key for Vue :key / ordering. */
	_lid?: string;
	id?: string;
};

export type TraitSet = Omit<GeneratedTraitSet, 'custom' | 'view' | 'traits'> & {
	view?: ViewBag;
	custom?: Custom;
	traits: Trait[];
	/** App-only: stable internal key. */
	_lid?: string;
	/** App-only: template trait names removed from this set (D19 restore). */
	removedTraits?: string[];
};

export type Character = Omit<GeneratedCharacter, 'custom' | 'view' | 'traitSets' | 'portrait'> & {
	view?: ViewBag;
	custom?: Custom;
	traitSets: TraitSet[];
	portrait: Portrait;
	/** App-only: template set ids removed from this character. */
	removedSets?: string[];
	/** App-only: player name / nickname (not in the schema). */
	player?: string;
	nickname?: string;
};

export type SheetTemplate = Omit<GeneratedSheetTemplate, 'character'> & {
	character: Character;
};

// Convenience aliases used across the app.
export type CharacterCurio = CharacterCurioCustom;
