/**
 * Canonical app model types.
 *
 * The core shapes (Character / TraitSet / Trait / Sfx / SheetTemplate) are
 * generated from `schema/0.1/*.schema.json` into `js/model.generated.ts` — see
 * `npm run types` (also chained into `npm run build`). The schema is the single
 * source of truth for those, so types never drift from validation.
 *
 * This module adds the **app-only** layer the schema intentionally leaves open:
 * the `custom.cortexToolkit` compartment (style, features, pips, ring, layout,
 * labels, …). The schema types `custom` as an open map on purpose (other apps
 * may compartmentalize their own keys); we refine our compartment here.
 *
 * Known `cortexToolkit` keys are typed; an index signature (`unknown`, never
 * `any`) keeps the bag open for forward-compatibility without blocking new keys.
 */
import type {
	Character as GeneratedCharacter,
	TraitSet as GeneratedTraitSet,
	Trait as GeneratedTrait,
	SheetTemplate as GeneratedSheetTemplate,
	Sfx,
	Tags,
} from './model.generated.ts';

// Primitives re-exported unchanged from the schema projection.
export type { Tags, SfxHinder, Sfx } from './model.generated.ts';

// ---------- custom.cortexToolkit sub-shapes (set + character scope) ----------

/** Character `view.style`: the single sheet-style object (`sheet`). */
export interface SetStyle {
	header?: string;
	body?: string;
	sheet?: 'classic' | 'spotlight';
}

export interface SetFeatures {
	description?: boolean;
	sfx?: boolean;
	subtraits?: boolean;
}

export interface PipsConfig {
	count?: number;
	rows?: number;
	perRow?: number;
	connected?: boolean;
	filled?: number;
}

export interface SessionRecordConfig {
	count?: number;
	boxCount?: number;
	orientation?: 'horizontal' | 'vertical';
	checked?: number[];
}

export interface AttachedStressConfig {
	enabled?: boolean;
	label?: string;
	scale?: number[];
	ratingScale?: number[];
	includeOut?: boolean;
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
}

/** The character portrait, with the app-typed `view` and `custom` carriers. */
export interface Portrait {
	url?: string;
	alt?: string;
	tags?: Tags;
	view?: ViewBag;
	custom?: Custom;
}

export interface StressConfig {
	includeOut?: boolean;
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
 * Known parts: name, rating, description, sfx, subtraits, stressLabel,
 * stress. Anything else is a validation error.
 */
export interface PartCell {
	left: string;
	top: number;
	width: string;
	height: number;
}

/** Dice-render styling (`view.diceConfig`). */
export interface DiceConfig {	[ k: string ]: unknown;
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
export interface CortexToolkitCustom {
	[ k: string ]: unknown;

	// style / features
	style?: SetStyle;
	features?: SetFeatures;

	// style-specific config
	pips?: PipsConfig;
	pipsConfig?: PipsConfig;
	sessionRecord?: SessionRecordConfig;
	attachedStress?: AttachedStressConfig;
	ringConfig?: RingConfig;
	imageConfig?: ImageConfig;
	stressConfig?: StressConfig;
	/** Generic Out indicator for any stepped track; default off. Supersedes stressConfig.includeOut when set. */
	outIndicator?: boolean;
	labels?: Record<string, string>;
	notes?: string;

	// layout: nested grids with explicit coordinates (2026-10-19).
	// A set carries view.place {left, top, width, height} (percent-of-
	// parent "%" strings + relative row units) and view.parts places
	// trait parts as cells in the trait's grid. Both are sparse: omitted
	// for full-width document-order stacking (place) and legacy flex
	// trait rows (parts).
	place?: PlaceRect;
	parts?: Record<string, PartCell>;
	/** @deprecated superseded by place; read for legacy migration only. */
	track?: 1 | 2 | 3;
	/** @deprecated superseded by place; read for legacy migration only. */
	span?: 1 | 2 | 3;
	/** @deprecated superseded by place; read for legacy migration only. */
	widths?: [number, number, number] | number[];
	flex?: boolean;
	cluster?: string;
	location?: 'left' | 'right' | 'center' | 'attributes' | 'header' | 'col-1' | 'col-2' | 'col-3' | 'col-4' | string;
	/** Set header placement: vertical sidebar label, or a horizontal top bar. */
	header?: 'sidebar' | 'top';
	/** Header text alignment (respected in both orientations). */
	headerAlign?: 'left' | 'center' | 'right';
	page?: number;
	/** @deprecated superseded by place.top; read for legacy migration only. */
	row?: number | null;
	colSpan?: number | 'full';
	columnSpan?: number | 'full';
	/** @deprecated superseded by explicit row; read for legacy migration only. */
	rowBreak?: boolean | null;
	/** @deprecated superseded by place; read for legacy migration only. */
	colWidth?: number | null;
	editorDock?: 'left' | 'right';
	traitColumns?: number;
	multiDie?: boolean;
	ratingScale?: number[];
	subtraitRatingScale?: number[];
	reservedSlots?: number | null;
	blankSlots?: number | null;

	// behavior / labels
	/** @deprecated superseded by parts; read for legacy migration only (kept for vertical ladders). */
	ratingPosition?: 'inline' | 'above' | 'below' | 'none' | 'vertical';
	/** Rung label direction on ladder layouts: horizontal text or rotated vertical. */
	labelPosition?: 'horizontal' | 'vertical';
	statement?: boolean;
	hasQuestionedPip?: boolean;
	hasCounterColumn?: boolean;
	counterLabel?: string;
	sharedHinder?: boolean;
	sharedHinderText?: string;
	branchArrows?: boolean;
	setDie?: number | null;
	isChallengePool?: boolean;
	challengePool?: boolean;

	// ring / portrait ring
	isAttributes?: boolean;
	/** Whether this set owns the portrait ring. Supersedes the legacy `attributesRing`. */
	ringTrait?: boolean;
	/** @deprecated legacy key (`attributesRing`); read for back-compat, never write. */
	attributesRing?: boolean;
	scaleDie?: number;
	scale?: number;

	// app-only trait-level flags that live under `trait.view`
	spentDice?: number[];
	rowSpan?: number;
	questioned?: boolean;
	isResource?: boolean;
	isScale?: boolean;
	/** Trait visibility: hidden true keeps the data off the sheet; absent or false shows it. No third state. */
	hidden?: boolean;
	xp?: number | string;
	counter?: number | string;
	branchRole?: 'skill' | 'specialty';
	branchSide?: 'left' | 'right';
	linkTo?: number;

	// character-scope
	/** @deprecated no column count under nested grids; deleted on load. */
	columns?: number;
	/** @deprecated no column count under nested grids; deleted on load. */
	columnsPage2?: number;
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
		[ k: string ]: unknown;
		fonts?: {
			heading?: string;
			primary?: string;
			secondary?: string;
		};
	};
	customFonts?: Array<{ name?: string; data?: string }>;
	nickname?: string;
	hasNickname?: boolean;
	columnOffsets?: { [ k: string ]: unknown; left?: number; center?: number; right?: number };
	columnAlignment?: string;
	accentColor?: string;
	primaryColor?: string;
	secondaryColor?: string;
}

export type ViewBag = CortexToolkitCustom;
export type ViewConfig = CortexToolkitCustom;

/**
 * The name block is the first trait set (view.style.body "name"): its
 * traits are the header fields, carrying labels as the trait `label`
 * field and visibility in trait `view`. Values stay on the character
 * fields; the traits are presentation records.
 *
 * Render-time check (views are always present in memory). Serialized
 * forms may prune the view away; migration's detector also accepts the
 * reserved id 'name' (which ensureTraitSetIds never assigns elsewhere).
 */
export function isNameSet( set: unknown ): boolean {
	const v = getView( set );
	return Boolean( set && typeof set === 'object' && v && typeof v === 'object' && v.style?.body === 'name' );
}

/**
 * Resolve the sheet style for a character holder. `view.style.sheet` is
 * the only stored key; the legacy fallbacks (top-level `sheetStyle`, the
 * `hasAttributes` set-type flag, the `spotlight` name string, a sheet
 * template link) resolve here so no reader hard-codes set-type checks.
 */
export function resolveSheetStyle( holder: unknown ): 'classic' | 'spotlight' {
	const h = ( holder && typeof holder === 'object' ) ? holder as any : undefined;
	const v = getView( h );
	const s = v && typeof v === 'object' ? v : undefined;
	const sheet = s?.style && typeof s.style === 'object' ? ( s.style as any ).sheet : undefined;
	if ( sheet === 'spotlight' || sheet === 'classic' ) return sheet;
	if ( s?.sheetStyle === 'spotlight' || s?.sheetStyle === 'classic' ) return s.sheetStyle;
	if ( s?.style && typeof s.style === 'object' && ( s.style as any ).hasAttributes === false ) return 'spotlight';
	if ( s?.spotlight ) return 'spotlight';
	if ( h?.sheet && typeof h.sheet === 'object' && ( h.sheet as any ).template ) return 'spotlight';
	return 'classic';
}

/**
 * Name-block traits with no sheet zone in spotlight styles (game, plot
 * points, notes) default to hidden there; everything else defaults to
 * shown. A stored `hidden` boolean always wins — this only fills the gap
 * so the editor never shows an open eye for something no layout renders.
 */
const NAME_HIDDEN_IN_SPOTLIGHT = [ 'game', 'plotPoints', 'notes' ];

export function defaultNameHidden( key: string, holder: unknown ): boolean {
	return NAME_HIDDEN_IN_SPOTLIGHT.includes( key ) && resolveSheetStyle( holder ) === 'spotlight';
}

/**
 * Accessor for the presentation view bag on any character, set, trait, or portrait.
 * Routes through VIEW_KEY and falls back to legacy custom.cortexToolkit for pre-migration data.
 */
export function getView<T = ViewBag>( obj: unknown ): T | undefined {
	if ( !obj || typeof obj !== 'object' ) return undefined;
	const record = obj as Record<string, any>;
	return ( record[ VIEW_KEY ] ?? record.custom?.cortexToolkit ) as T | undefined;
}

/**
 * Ensures the presentation view bag exists on an object, migrating legacy custom.cortexToolkit
 * if present, and returns the mutable view bag.
 */
export function ensureView<T = ViewBag>( obj: unknown ): T {
	if ( !obj || typeof obj !== 'object' ) {
		throw new TypeError( 'ensureView called on non-object' );
	}
	const record = obj as Record<string, any>;
	if ( !record[ VIEW_KEY ] ) {
		if ( record.custom && typeof record.custom === 'object' && record.custom.cortexToolkit ) {
			record[ VIEW_KEY ] = record.custom.cortexToolkit;
			delete record.custom.cortexToolkit;
			if ( Object.keys( record.custom ).length === 0 ) {
				delete record.custom;
			}
		} else {
			record[ VIEW_KEY ] = {};
		}
	}
	return record[ VIEW_KEY ] as T;
}

/** `trait.custom` — includes legacy nested `cortexToolkit` compartment for back-compat. */
export interface TraitCustom {
	[ k: string ]: unknown;
	checked?: boolean;
	stress?: number;
	isStressOut?: boolean;
	spentDice?: number[];
	linkTo?: number;
	branchRole?: 'skill' | 'specialty';
	branchSide?: 'left' | 'right';
	questioned?: boolean;
	isResource?: boolean;
	isScale?: boolean;
	xp?: number | string;
	counter?: number | string;
	cortexToolkit?: CortexToolkitCustom;
}

/** The open `custom` map, with legacy `cortexToolkit` compartment for back-compat. */
export interface Custom {
	[ k: string ]: unknown;
	cortexToolkit?: CortexToolkitCustom;
}

/** Per-character arrangement preferences (file-traveling + live). */
export interface CharacterPrefs {
	version?: number;
	setOrder?: string[];
	traitOrders?: Record<string, string[]>;
	declinedTemplateVersions?: Record<string, number>;
	[ k: string ]: unknown;
}

// ---------- app document types (schema shape + typed view & custom) ----------

export type Trait = Omit<GeneratedTrait, 'custom' | 'view' | 'traits' | 'sfx'> & {
	view?: ViewBag;
	custom?: TraitCustom;
	traits?: Trait[];
	sfx?: (Sfx | 'hinder')[];
	/** App-only: stress "out" marker (rendered as the 💥 OUT badge). */
	isOut?: boolean;
	/** App-only: attached-stress value (mirrors `custom.stress`). */
	stress?: number;
	/** App-only: resource-trait marker. */
	isResource?: boolean;
	/** App-only: template trait names removed from this trait (D19 restore). */
	removedTraits?: string[];
	/** App-only: stable internal key for Vue :key / ordering. */
	_lid?: string;
	id?: string;
};

export type TraitSet = Omit<GeneratedTraitSet, 'custom' | 'view' | 'traits' | 'sfx'> & {
	view?: ViewBag;
	custom?: Custom;
	traits: Trait[];
	sfx?: Sfx[];
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
export type CortexToolkit = CortexToolkitCustom;
