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

/** `custom.cortexToolkit.style` — also carries character-level `hasAttributes`. */
export interface SetStyle {
	header?: string;
	body?: string;
	hasAttributes?: boolean;
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

/** Dice-render styling (`view.diceConfig`). */
export interface DiceConfig {
	[ k: string ]: unknown;
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

	// layout
	track?: 1 | 2 | 3;
	span?: 1 | 2 | 3;
	widths?: [number, number, number] | number[];
	flex?: boolean;
	cluster?: string;
	location?: 'left' | 'right' | 'center' | 'attributes' | 'header' | 'col-1' | 'col-2' | 'col-3' | 'col-4' | string;
	/** Set header placement: vertical sidebar label, or a horizontal top bar. */
	header?: 'sidebar' | 'top';
	/** Header text alignment (respected in both orientations). */
	headerAlign?: 'left' | 'center' | 'right';
	page?: number;
	/** Explicit row number within the page (1-based). Sets sharing a page and row band together. */
	row?: number | null;
	colSpan?: number | 'full';
	columnSpan?: number | 'full';
	/** @deprecated superseded by explicit row; read for legacy migration only. */
	rowBreak?: boolean | null;
	/** This set's singular share of its band's columns (e.g. 28 of a 28/72 split). Band widths derive from members. */
	colWidth?: number | null;
	editorDock?: 'left' | 'right';
	headerRight?: string;
	traitColumns?: number;
	multiDie?: boolean;
	ratingScale?: number[];
	subtraitRatingScale?: number[];
	reservedSlots?: number | null;
	blankSlots?: number | null;

	// behavior / labels
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
	xp?: number | string;
	counter?: number | string;
	branchRole?: 'skill' | 'specialty';
	branchSide?: 'left' | 'right';
	linkTo?: number;

	// character-scope
	columns?: number;
	columnsPage2?: number;
	pageCount?: number;
	pageOrientation?: 'portrait' | 'landscape';
	orientation?: 'portrait' | 'landscape';
	sheetStyle?: 'classic' | 'spotlight';
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
