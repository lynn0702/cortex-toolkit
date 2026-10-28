import { ref, computed, onMounted, onUnmounted, onUpdated, watch, nextTick, provide, inject, getCurrentInstance, toRaw, type InjectionKey } from 'vue';
import { cortexFunctions } from './functions.ts';
import { buildParts, formatPct, parsePct, KNOWN_PARTS } from './spotlight-grid.ts';
import { getView, ensureView, resolveSheetStyle, getRating, ratingDice, setRatingDie, resolveVisibility, nextVisibility, resolveSetPillar } from './model.ts';
import type { Character, TraitSet, CortexToolkitCustom, RingConfig, SetFeatures, ImageConfig, PipsConfig, Visibility } from './model.ts';

export type TraitSetEditorApi = ReturnType<typeof useTraitSetEditor>;

// Pure branch-share normalization shared by the editor miniature and the
// subtrait-columns renderer: finite numbers >= 0 win, else the CSS
// defaults (1.4 / 1 / 1.4). Null when no branch object is stored.
export function resolveBranchShares( branch: unknown ): { left: number; center: number; right: number } | null {
	const num = ( v: unknown, fallback: number ) => ( typeof v === 'number' && Number.isFinite( v ) && v >= 0 ) ? v : fallback;
	if ( !branch || typeof branch !== 'object' || Array.isArray( branch ) ) return null;
	const r = branch as Record<string, unknown>;
	return { left: num( r.left, 1.4 ), center: num( r.center, 1 ), right: num( r.right, 1.4 ) };
}

export interface TraitSetEditorProps {
	character: Character;
	traitSetID: number;
	open?: boolean;
	viewY?: number | null;
}

export const TRAIT_SET_EDITOR_KEY: InjectionKey<TraitSetEditorApi> = Symbol( 'traitSetEditorApi' );

export function useTraitSetEditor( props: TraitSetEditorProps, emit: any ) {
	const inst = getCurrentInstance();

	const rootEl = ref<any>( null );
	const inputName = ref<any>( null );
	const imageFileInput = ref<any>( null );

	const scrollPosition = ref( 'none' );
	const anchorPosition = ref( 'top' );
	const showDeleteConfirm = ref( false );
	const uploadError = ref( '' );

	// Live drag preview for the row miniature: the miniature writes the
	// box as it moves and commits on release. Cleared on set switch so
	// no stale box survives.
	const partPreview = ref<{ key: string; left: number; width: number; top: number; height: number } | null>( null );

	const styleOptions = [
		{ id: 'default',              label: 'Default' },
		{ id: 'portrait-ring',        label: 'Portrait Ring' },
		{ id: 'two-columns-compact',  label: 'Compact Columns' },
		{ id: 'two-columns-detailed', label: 'Detailed Columns' },
		{ id: 'sfx-rows',             label: 'SFX Rows' },
		{ id: 'boxed-rows',           label: 'Boxed Rows' },
		{ id: 'pool-rows',            label: 'Pool Rows' },
		{ id: 'dice-count',           label: 'Dice Count' },
		{ id: 'subtrait-columns',     label: 'Subtrait Columns' },
		{ id: 'paired-slots',         label: 'Paired Slots' },
		{ id: 'die-rows',             label: 'Die Rows' },
		{ id: 'three-column-table',   label: 'Three Column Table' },
		{ id: 'dice-ladder',          label: 'Dice Ladder' },
		{ id: 'labeled-fields',       label: 'Labeled Fields' },
		{ id: 'die-track',            label: 'Die Track' },
		{ id: 'list',                 label: 'List' },
		{ id: 'notes',                label: 'Notes' },
		{ id: 'image',                label: 'Image' },
		{ id: 'pips',                 label: 'Pips' },
	];

	const traitSet = computed( () => props.character?.traitSets?.[ props.traitSetID ] || null );
	const character = computed( () => props.character );
	const traitSetID = computed( () => props.traitSetID );

	const name = computed({
		get: () => traitSet.value?.name ?? '',
		set: ( v: string ) => setProperty( 'name', v )
	});

	const description = computed({
		get: () => traitSet.value?.description ?? '',
		set: ( v: string ) => setProperty( 'description', v )
	});

	const noun = computed({
		get: () => traitSet.value?.noun ?? '',
		set: ( v: string ) => setProperty( 'noun', v )
	});

	const plural = computed({
		get: () => {
			const stored = traitSet.value?.plural;
			if ( stored !== undefined && stored !== null && stored !== '' ) return stored;
			const singular = traitSet.value?.noun;
			return ( singular && singular.length ) ? singular + 's' : '';
		},
		set: ( v: string ) => setProperty( 'plural', v )
	});

	const styleBody = computed({
		get: () => {
			const body = getView( traitSet.value )?.style?.body;
			if ( body === 'portrait-ring' || body === 'attributes' ) {
				return 'portrait-ring';
			}
			// Backwards compatibility: default legacy ring-located trait sets to portrait-ring when no style (or default) is specified
			if ( !body || body === 'default' ) {
				if ( getView( traitSet.value )?.location === 'attributes' ||
					( isRingCandidateSet.value && cortexFunctions.getRingTrait( traitSet.value ) !== false ) ) {
					return 'portrait-ring';
				}
			}
			return body || 'default';
		},
		set: ( value: string ) => {
			if ( value === 'portrait-ring' ) {
				// 1. Unset ring on any other trait sets in this character
				props.character.traitSets.forEach( ( ts: any, idx: number ) => {
					if ( idx !== props.traitSetID ) {
						const tsBody = getView( ts )?.style?.body;
						if ( tsBody === 'portrait-ring' || tsBody === 'attributes' || getView( ts )?.location === 'attributes' || cortexFunctions.getRingTrait( ts ) ) {
							const view = ensureView( ts );
							if ( !view.style ) view.style = {};
							view.style.body = 'default';
							view.style.header = 'default';
							view.location = 'right';
							view.ringTrait = false;
						}
					}
				});

				// 2. Set ring on this trait set
				const view = ensureView( traitSet.value );
				if ( !view.style ) view.style = {};
				view.style.body = 'portrait-ring';
				view.style.header = 'portrait-ring';
				view.location = 'attributes';
				view.ringTrait = true;
			} else {
				const view = ensureView( traitSet.value );
				if ( !view.style ) view.style = {};
				view.style.body = value;
				view.style.header = value;
				// Preset flex layouts author their own rows: stale part
				// cells would hide, so re-selecting one clears them; branch
				// shares only survive on subtrait-columns.
				if ( ( FLEX_BODIES as readonly string[] ).includes( value ) ) {
					delete view.parts;
				}
				if ( value !== 'subtrait-columns' ) {
					delete ( view as Record<string, unknown> ).branch;
				}
				if ( view.location === 'attributes' ) {
					view.location = 'right';
				}
				view.ringTrait = false;
				// Spotlight PDF styles: seed the feature flags their layouts need.
				if ( !view.features ) {
					view.features = { description: false, sfx: false, subtraits: false };
				}
				const styleDefaults = cortexFunctions.defaultFeaturesForStyle( value );
				Object.assign( view.features, styleDefaults.features );
			}
			updateCharacter( props.character );
		}
	});

	const isRing = computed( () => styleBody.value === 'portrait-ring' );

	const isRingCandidateSet = computed( () => Boolean(
		getView( traitSet.value )?.location === 'attributes' ||
		getView( traitSet.value )?.isAttributes ||
		getView( traitSet.value )?.style?.body === 'attributes' ||
		getView( traitSet.value )?.style?.body === 'portrait-ring' ||
		traitSet.value?.noun?.toLowerCase() === 'attribute' ||
		traitSet.value?.name?.trim().toLowerCase() === 'attributes'
	) );

	const ringTrait = computed({
		get: () => isRing.value,
		set: ( value: boolean ) => { styleBody.value = value ? 'portrait-ring' : 'default'; }
	});

	const isFullWidthSpan = computed( () => {
		const place = getView( traitSet.value )?.place;
		if ( !place || typeof place !== 'object' || Array.isArray( place ) ) return true;
		const w = parsePct( ( place as unknown as Record<string, unknown> ).width );
		return w === null || w >= 99.9;
	} );

	// Trait-part cells (view.parts): the generator spec shared by rebuilds
	// and the default comparison, so hand-tuned widths survive control
	// changes and Reset restores exactly what the generator would emit.
	function partsSpec() {
		const view = getView( traitSet.value ) || {};
		const scale = Array.isArray( ( view as any ).ratingScale ) && ( view as any ).ratingScale.length
			? ( view as any ).ratingScale : [ 4, 6, 8, 10, 12 ];
		const trackOn = partsHaveTrack();
		const tScale = cortexFunctions.getTrackScale( traitSet.value );
		const rating = currentRatingPosition() === 'vertical' ? 'inline' : currentRatingPosition() as 'inline' | 'above' | 'below' | 'none';
		const statement = Boolean( ( traitSet.value as any )?.statement ?? ( view as any ).statement );
		const features = ( view as any ).features || {};
		return {
			rating,
			ratingDice: scale.length,
			trackDice: trackOn ? tScale.length : 0,
			description: Boolean( features.description ) && !statement && rating !== 'above',
			block: Boolean( features.sfx ),
			subtraits: Boolean( features.subtraits ),
		};
	}

	type PartCellEdit = { key: string; left: number; width: number; top: number; height: number };

	// Explicit part cells in stable part order. Absent = generated layout.
	const partCells = computed( (): PartCellEdit[] => {
		const parts = getView( traitSet.value )?.parts;
		if ( !parts || typeof parts !== 'object' ) return [];
		const out: PartCellEdit[] = [];
		for ( const key of KNOWN_PARTS as readonly string[] ) {
			const cell = ( parts as Record<string, any> )[key];
			if ( !cell || typeof cell !== 'object' ) continue;
			const left = parsePct( cell.left );
			const width = parsePct( cell.width );
			out.push( {
				key,
				left: left === null ? 0 : Math.round( left * 1000 ) / 1000,
				width: width === null ? 100 : Math.round( width * 1000 ) / 1000,
				top: Number.isInteger( cell.top ) && cell.top >= 0 ? cell.top : 0,
				height: Number.isInteger( cell.height ) && cell.height >= 1 ? cell.height : 1,
			} );
		}
		return out;
	} );

	// Explicit part cells: hand-tuning shows whenever a parts layout
	// exists (generated or hand-tuned); Reset restores the default.
	const hasParts = computed( () => {
		const parts = getView( traitSet.value )?.parts;
		return Boolean( parts && typeof parts === 'object' && Object.keys( parts ).length );
	} );

	// Style presets fall into three kinds: dedicated flex renderers (the
	// list below), non-row bodies with no trait rows at all, and everything
	// else, which the list renderer draws from the parts grid. The grid
	// never takes over a bespoke body: arranging one writes only what
	// that body can render (branch shares for subtrait-columns).
	// Ladders keep the legacy flag (no parts form).
	const FLEX_BODIES = [ 'image', 'notes', 'pips', 'dice-ladder', 'labeled-fields', 'subtrait-columns', 'three-column-table', 'paired-slots', 'die-rows', 'dice-count', 'portrait-ring' ];
	const NON_ROW_BODIES = [ 'image', 'notes', 'pips', 'portrait-ring' ];
	function isPartsDriven() {
		const body = getView( traitSet.value )?.style?.body;
		if ( typeof body === 'string' && ( FLEX_BODIES as readonly string[] ).includes( body ) ) return false;
		return currentRatingPosition() !== 'vertical';
	}
	function isRowBody() {
		const body = getView( traitSet.value )?.style?.body;
		if ( typeof body === 'string' && ( NON_ROW_BODIES as readonly string[] ).includes( body ) ) return false;
		return currentRatingPosition() !== 'vertical';
	}

	// Effective part cells: stored cells, or — for grid-driven sets with
	// no stored layout — the generated preview, marked implicit. The row
	// miniature shows both; the first drag on an implicit box writes the
	// generated map (the seed setPartCell uses) plus the change, so the
	// sheet switches from flex to the grid it previews.
	const effectivePartCells = computed( (): ( PartCellEdit & { implicit: boolean } )[] => {
		const stored = partCells.value.map( ( c ) => ( { ...c, implicit: false } ) );
		if ( stored.length || !isPartsDriven() ) return stored;
		const gen = buildParts( partsSpec() );
		const out: ( PartCellEdit & { implicit: boolean } )[] = [];
		for ( const key of KNOWN_PARTS as readonly string[] ) {
			const cell = ( gen as Record<string, any> )[key];
			if ( !cell || typeof cell !== 'object' ) continue;
			const left = parsePct( cell.left );
			const width = parsePct( cell.width );
			out.push( {
				key,
				left: left === null ? 0 : Math.round( left * 1000 ) / 1000,
				width: width === null ? 100 : Math.round( width * 1000 ) / 1000,
				top: Number.isInteger( cell.top ) && cell.top >= 0 ? cell.top : 0,
				height: Number.isInteger( cell.height ) && cell.height >= 1 ? cell.height : 1,
				implicit: true,
			} );
		}
		return out;
	} );

	// Generated preview on screen (no stored layout yet).
	const isPartsPreview = computed( () => partCells.value.length === 0 && effectivePartCells.value.length > 0 );

	// Non-default explicit parts: Reset restores the generated layout.
	// (No stored parts means nothing custom, however the preview reads.)
	const hasCustomParts = computed( () => {
		const parts = getView( traitSet.value )?.parts;
		if ( !parts || typeof parts !== 'object' || !Object.keys( parts ).length ) return false;
		const canon = ( o: Record<string, unknown> ) => {
			const out: Record<string, unknown> = {};
			Object.keys( o ).sort().forEach( ( k ) => { out[k] = o[k]; } );
			return JSON.stringify( out );
		};
		return canon( parts as Record<string, unknown> ) !== canon( buildParts( partsSpec() ) as Record<string, unknown> );
	} );

	function setPartCell( key: string, field: 'left' | 'width' | 'top' | 'height', val: number ) {
		const view = ensureView( traitSet.value );
		if ( !view.parts || typeof view.parts !== 'object' ) {
			view.parts = buildParts( partsSpec() );
		}
		const cells = view.parts as Record<string, any>;
		if ( !cells[key] || typeof cells[key] !== 'object' ) {
			cells[key] = { left: '0%', top: 0, width: '100%', height: 1 };
		}
		const cell = cells[key];
		if ( field === 'left' ) {
			const n = Number.isFinite( Number( val ) ) ? Math.max( 0, Math.min( 100, Number( val ) ) ) : 0;
			cell.left = formatPct( Math.round( n * 10 ) / 10 );
		} else if ( field === 'width' ) {
			const n = Number.isFinite( Number( val ) ) ? Math.max( 1, Math.min( 100, Number( val ) ) ) : 100;
			cell.width = formatPct( Math.round( n * 10 ) / 10 );
		} else if ( field === 'top' ) {
			cell.top = Number.isInteger( Number( val ) ) ? Math.max( 0, Number( val ) ) : 0;
		} else {
			cell.height = Number.isInteger( Number( val ) ) ? Math.max( 1, Number( val ) ) : 1;
		}
		updateCharacter( props.character );
	}

	// Branch column shares (subtrait-columns split rows): the three fr
	// shares around the fixed 2rem link column. Absent means the CSS
	// default (1.4 / 1 / 1.4); stored shares render wherever a split
	// row does, sheet and print alike.
	function branchShares() {
		const resolved = resolveBranchShares( getView( traitSet.value )?.branch );
		if ( !resolved ) {
			return { left: 1.4, center: 1, right: 1.4, implicit: true };
		}
		return { ...resolved, implicit: false };
	}

	function setBranchShare( key: 'left' | 'center' | 'right', val: number ) {
		const view = ensureView( traitSet.value );
		const cur = branchShares();
		const next = {
			left: key === 'left' ? val : cur.left,
			center: key === 'center' ? val : cur.center,
			right: key === 'right' ? val : cur.right,
		};
		( view as Record<string, unknown> ).branch = {
			left: Math.round( Math.max( 0, Number( next.left ) || 0 ) * 100 ) / 100,
			center: Math.round( Math.max( 0, Number( next.center ) || 0 ) * 100 ) / 100,
			right: Math.round( Math.max( 0, Number( next.right ) || 0 ) * 100 ) / 100,
		};
		updateCharacter( props.character );
	}

	const hasCustomBranch = computed( () => {
		const branch = getView( traitSet.value )?.branch;
		return Boolean( branch && typeof branch === 'object' && !Array.isArray( branch ) );
	} );

	function resetParts() {
		const view = getView( traitSet.value );
		if ( view && typeof view === 'object' ) {
			delete ( view as Record<string, unknown> ).branch;
		}
		const body = getView( traitSet.value )?.style?.body;
		if ( typeof body === 'string' && ( FLEX_BODIES as readonly string[] ).includes( body ) ) {
			// Flex layouts author their own rows: reset means no stored
			// geometry at all, not a generated map they would ignore.
			if ( view && typeof view === 'object' ) {
				delete ( view as Record<string, unknown> ).parts;
				updateCharacter( props.character );
			}
			return;
		}
		rebuildParts( currentRatingPosition() === 'vertical' ? 'inline' : currentRatingPosition() as 'inline' | 'above' | 'below' | 'none' );
	}

	const templateEntry = computed( () => {
		const root = inst?.proxy?.$root as any;
		return cortexFunctions.resolveTemplateFor( props.character, root ? root.sheetTemplates : null );
	});

	// Template traits by name not currently on this sheet (D19 restore menu).
	const restorableTraitNames = computed( () => cortexFunctions.restorableTraits( props.character, templateEntry.value, props.traitSetID ) );

	const isSpotlightSheet = computed( () => {
		return resolveSheetStyle( props.character ) === 'spotlight';
	} );

	const ringSpread = computed({
		get: () => getView( traitSet.value )?.ringConfig?.arcSpread ?? 100,
		set: ( val: number ) => { setRingConfig( 'arcSpread', Number( val ) ); }
	});

	const ringDistance = computed({
		get: () => getView( traitSet.value )?.ringConfig?.arcDistance ?? 0,
		set: ( val: number ) => { setRingConfig( 'arcDistance', Number( val ) ); }
	});

	const ringAngle = computed({
		get: () => {
			const cfg = getView( traitSet.value )?.ringConfig;
			return cfg?.arcAngle ?? ( cfg?.arcSlide !== undefined ? cfg.arcSlide * 3 : -90 );
		},
		set: ( val: number ) => { setRingConfig( 'arcAngle', Number( val ) ); }
	});

	const ringAngleLabel = computed( () => {
		const a = ringAngle.value;
		if ( a === 0 ) return 'Bottom';
		if ( a === -90 ) return 'Right';
		if ( a === 90 ) return 'Left';
		if ( a === 180 || a === -180 ) return 'Top';
		return ( a > 0 ? '+' + a : a ) + '°';
	});

	const scaleAngle = computed({
		get: () => getView( traitSet.value )?.ringConfig?.scaleAngle ?? 0,
		set: ( val: number ) => { setRingConfig( 'scaleAngle', Number( val ) ); }
	});

	const scaleAngleLabel = computed( () => {
		const a = scaleAngle.value;
		if ( a === 0 ) return 'Bottom';
		if ( a === -90 ) return 'Right';
		if ( a === 90 ) return 'Left';
		if ( a === 180 || a === -180 ) return 'Top';
		return ( a > 0 ? '+' + a : a ) + '°';
	});

	const scaleDistance = computed({
		get: () => getView( traitSet.value )?.ringConfig?.scaleDistance ?? 0,
		set: ( val: number ) => { setRingConfig( 'scaleDistance', Number( val ) ); }
	});

	const ringScaleY = computed({
		get: () => getView( traitSet.value )?.ringConfig?.scaleDieY ?? 0,
		set: ( val: number ) => { setRingConfig( 'scaleDieY', Number( val ) ); }
	});

	const ringScaleX = computed({
		get: () => getView( traitSet.value )?.ringConfig?.scaleDieX ?? 0,
		set: ( val: number ) => { setRingConfig( 'scaleDieX', Number( val ) ); }
	});

	const scaleDieValue = computed({
		get: () => getView( traitSet.value )?.scaleDie || getView( props.character )?.scale || 0,
		set: ( val: number ) => {
			ensureView( traitSet.value ).scaleDie = val;
			ensureView( props.character ).scale = val;
			updateCharacter( props.character );
		}
	});

	const imageURL = computed({
		get: () => getView( traitSet.value )?.imageConfig?.url ?? '',
		set: ( val: string ) => { setImageConfig( 'url', val ); }
	});

	const imageAlignment = computed({
		get: () => getView( traitSet.value )?.imageConfig?.alignment ?? 'center',
		set: ( val: string ) => { setImageConfig( 'alignment', val ); }
	});

	const imageHeight = computed({
		get: () => getView( traitSet.value )?.imageConfig?.height ?? 'auto',
		set: ( val: string ) => { setImageConfig( 'height', val ); }
	});

	const imageCaption = computed({
		get: () => getView( traitSet.value )?.imageConfig?.caption ?? '',
		set: ( val: string ) => { setImageConfig( 'caption', val ); }
	});

	const featureDescription = computed({
		get: () => Boolean( getView( traitSet.value )?.features?.description ),
		set: ( value: boolean ) => { setFeature( 'description', value ); }
	});

	const featureSubtraits = computed({
		get: () => Boolean( getView( traitSet.value )?.features?.subtraits ),
		set: ( value: boolean ) => { setFeature( 'subtraits', value ); }
	});

	const featureSFX = computed({
		get: () => Boolean( getView( traitSet.value )?.features?.sfx ),
		set: ( value: boolean ) => { setFeature( 'sfx', value ); }
	});

	// Generic Out indicator (default off); legacy stressConfig.includeOut
	// still wins when set so existing templates keep their behavior.
	const includeOut = computed({
		get: () => {
			const view = getView( traitSet.value );
			if ( view && typeof view.outIndicator === 'boolean' ) return view.outIndicator;
			const cfg = view?.stressConfig;
			if ( cfg && typeof cfg.includeOut === 'boolean' ) return cfg.includeOut;
			return false;
		},
		set: ( value: boolean ) => { setCustomProperty( 'outIndicator', Boolean( value ) ); }
	});

	const ratingScale = computed({
		get: () => cortexFunctions.getTraitSetRatings( traitSet.value ),
		set: ( scale: number[] ) => {
			let s = props.traitSetID;
			ctkFor( s ).ratingScale = scale;
			updateCharacter( structuredClone( toRaw( props.character ) ) );
		}
	});

	const subtraitRatingScale = computed({
		get: () => cortexFunctions.getSubtraitRatings( traitSet.value ),
		set: ( scale: number[] ) => {
			let s = props.traitSetID;
			ctkFor( s ).subtraitRatingScale = scale;
			updateCharacter( structuredClone( toRaw( props.character ) ) );
		}
	});

	// Pool sets add a whole trait pool to the roller on click, and their
	// dice are never flagged as resources (e.g. Growth Pool). Pool lives
	// on the set node.
	const isPool = computed({
		get: () => {
			const ts = traitSet.value as unknown as Record<string, unknown> | null;
			return ts !== null && ts.pool === true;
		},
		set: ( value: boolean ) => {
			const ts = traitSet.value as unknown as Record<string, any>;
			if ( !ts ) return;
			ts.pool = Boolean( value );
			updateCharacter( structuredClone( toRaw( props.character ) ) );
		}
	});

	// The set-level die is the set node's own Rating; unrated traits fall
	// through to it.
	const setRating = computed({
		get: () => {
			const dice = ratingDice( getRating( traitSet.value ) );
			if ( dice.length ) return dice[0];
			return null;
		},
		set: ( value: number | null ) => {
			const ts = traitSet.value as unknown as Record<string, any>;
			if ( !ts ) return;
			if ( Number( value ) > 0 ) {
				setRatingDie( ts, Number( value ) );
			} else {
				delete ts.rating;
			}
			updateCharacter( structuredClone( toRaw( props.character ) ) );
		}
	});

	// Spendable on the set node drives spend controls for its traits
	// unless a trait overrides it. Challenge/boss pools carry pool +
	// spendable together; no flag survives them.
	const setSpendable = computed({
		get: () => {
			const ts = traitSet.value as unknown as Record<string, unknown> | null;
			if ( ts && typeof ts.spendable === 'boolean' ) return ts.spendable;
			return false;
		},
		set: ( value: boolean ) => {
			const ts = traitSet.value as unknown as Record<string, any>;
			if ( !ts ) return;
			ts.spendable = Boolean( value );
			updateCharacter( structuredClone( toRaw( props.character ) ) );
		}
	});

	// Hitches on the set node: the top of the inheritance chain.
	const setHitches = computed({
		get: () => {
			const ts = traitSet.value as unknown as Record<string, unknown> | null;
			return ts && typeof ts.hitches === 'number' ? ts.hitches : null;
		},
		set: ( value: number | null ) => {
			const ts = traitSet.value as unknown as Record<string, any>;
			if ( !ts ) return;
			if ( value === null || value === undefined || value === '' as unknown as number ) {
				delete ts.hitches;
			} else {
				const n = Math.floor( Number( value ) );
				if ( Number.isFinite( n ) && n >= 0 ) ts.hitches = n;
			}
			updateCharacter( structuredClone( toRaw( props.character ) ) );
		}
	});

	const notesContent = computed({
		get: () => getView( traitSet.value )?.notes ?? ( traitSet.value?.description ?? '' ),
		set: ( value: string ) => { setCustomProperty( 'notes', value ); }
	});

	const reservedSlots = computed({
		get: () => {
			const val = getView( traitSet.value )?.reservedSlots;
			return ( val !== undefined && val !== null && String( val ) !== '' ) ? Number( val ) : '';
		},
		set: ( val: number | '' ) => {
			const num = ( val === '' || val === null || isNaN( val ) ) ? null : Math.max( 0, parseInt( String( val ), 10 ) );
			setCustomProperty( 'reservedSlots', num );
		}
	});

	const sharedHinder = computed({
		get: () => Boolean( getView( traitSet.value )?.sharedHinder ),
		set: ( val: boolean ) => { setCustomProperty( 'sharedHinder', Boolean( val ) ); }
	});

	const sharedHinderText = computed({
		get: () => getView( traitSet.value )?.sharedHinderText ?? '',
		set: ( val: string ) => { setCustomProperty( 'sharedHinderText', val ); }
	});

	const traitColumns = computed({
		get: () => getView( traitSet.value )?.traitColumns ?? 1,
		set: ( val: number ) => { setCustomProperty( 'traitColumns', parseInt( String( val ), 10 ) || 1 ); }
	});

	const setVisibility = computed<Visibility>({
		get: () => resolveVisibility( traitSet.value ),
		set: ( val: Visibility ) => {
			if ( !traitSet.value ) return;
			const v = ensureView( traitSet.value );
			if ( val === 'shown' ) {
				delete v.visibility;
			} else {
				v.visibility = val;
			}
			updateCharacter( props.character );
		}
	});

	function cycleSetVisibility() {
		setVisibility.value = nextVisibility( setVisibility.value );
	}

	const setPillar = computed<string>({
		get: () => getView( traitSet.value )?.pillar ?? '',
		set: ( val: string ) => {
			if ( !traitSet.value ) return;
			const v = ensureView( traitSet.value );
			const trimmed = String( val || '' ).trim();
			if ( trimmed ) {
				v.pillar = trimmed;
			} else {
				delete v.pillar;
			}
			updateCharacter( props.character );
		}
	});

	const resolvedPillar = computed<string>( () => resolveSetPillar( traitSet.value ) );

	const presetSaved = ref( false );
	function saveSetAsPreset() {
		if ( !traitSet.value ) return;
		cortexFunctions.saveCustomSetPreset( toRaw( traitSet.value ) );
		presetSaved.value = true;
		setTimeout( () => { presetSaved.value = false; }, 1600 );
	}

	const showBlockMini = ref( false );
	function openBlockMini() { showBlockMini.value = true; }
	function closeBlockMini() { showBlockMini.value = false; }

	const characterCustomPillars = computed<string[]>( () => {
		const list: string[] = [];
		const std = [ 'prime', 'plus', 'play', 'identity' ];
		for ( const ts of ( props.character?.traitSets || [] ) ) {
			const p = getView( ts )?.pillar;
			if ( typeof p === 'string' && p.trim() ) {
				const low = p.trim().toLowerCase();
				if ( !std.includes( low ) && !list.includes( low ) ) {
					list.push( low );
				}
			}
		}
		return list;
	} );

	// Rebuild this set's trait-part layout, preserving its track setup,
	// dice counts, features, and statement mode. Vertical ladders keep
	// the legacy flag (no parts form); bespoke bodies are left alone.
	// Pass track true/false to force the track on/off (the toggle);
	// otherwise the current setup carries over.
	function rebuildParts( rating: 'inline' | 'above' | 'below' | 'none', track?: boolean ) {
		const view = ensureView( traitSet.value );
		const spec = partsSpec();
		if ( track === true && !spec.trackDice ) spec.trackDice = 5;
		if ( track === false ) spec.trackDice = 0;
		view.parts = buildParts( { ...spec, rating } );
		if ( traitSet.value && typeof traitSet.value === 'object' ) delete ( traitSet.value as any ).ratingPosition;
		delete view.ratingPosition;
		updateCharacter( props.character );
	}

	function partsHaveTrack() {
		const parts = getView( traitSet.value )?.parts;
		return Boolean( parts && typeof parts === 'object' && ( parts as Record<string, unknown> ).track );
	}

	function currentRatingPosition(): 'inline' | 'above' | 'below' | 'none' | 'vertical' {
		const parts = getView( traitSet.value )?.parts;
		if ( parts && typeof parts === 'object' ) {
			const cells = parts as Record<string, { top?: unknown }>;
			if ( !cells.rating ) return 'none';
			const rTop = Number( cells.rating.top ) || 0;
			const nTop = cells.name ? ( Number( cells.name.top ) || 0 ) : 0;
			if ( rTop === 0 && nTop === 0 ) return 'inline';
			if ( rTop === 0 ) return 'above';
			return 'below';
		}
		const legacy = ( traitSet.value as any )?.ratingPosition || getView( traitSet.value )?.ratingPosition;
		if ( legacy === 'above' || legacy === 'below' || legacy === 'none' || legacy === 'vertical' ) return legacy;
		return 'inline';
	}

	const hasTrackPart = computed({
		get: () => partsHaveTrack(),
		set: ( val: boolean ) => {
			if ( !val ) {
				const parts = getView( traitSet.value )?.parts;
				if ( parts && typeof parts !== 'string' ) {
					delete ( parts as Record<string, unknown> ).trackLabel;
					delete ( parts as Record<string, unknown> ).track;
				}
				updateCharacter( props.character );
				return;
			}
			rebuildParts( currentRatingPosition() === 'vertical' ? 'inline' : currentRatingPosition() as 'inline' | 'above' | 'below' | 'none', true );
		}
	});

	const trackLabel = computed({
		get: () => {
			const labels = getView( traitSet.value )?.labels;
			if ( labels && typeof labels.track === 'string' && labels.track.length ) return labels.track;
			return 'Stress';
		},
		set: ( val: string ) => {
			const view = ensureView( traitSet.value );
			const prev = getView( traitSet.value )?.labels?.track ?? 'Stress';
			if ( !view.labels || typeof view.labels !== 'object' ) view.labels = {};
			if ( typeof val === 'string' && val.length ) view.labels.track = val;
			else delete view.labels.track;
			delete ( view.labels as any ).stress;
			// Keep track companions (subtraits named for the label) glued
			// to the label: rename matches, never clobbering an occupant.
			const next = ( typeof val === 'string' && val.length ) ? val : 'Stress';
			if ( next !== prev && Array.isArray( ( traitSet.value as any )?.traits ) ) {
				( traitSet.value as any ).traits.forEach( ( tr: any ) => {
					if ( !tr || typeof tr !== 'object' || !Array.isArray( tr.traits ) ) return;
					const hit = tr.traits.findIndex( ( st: any ) => st && typeof st === 'object' && st.name === prev );
					if ( hit === -1 ) return;
					const occupied = tr.traits.some( ( st: any ) => st && typeof st === 'object' && st.name === next );
					if ( !occupied ) tr.traits[ hit ].name = next;
				} );
			}
			updateCharacter( props.character );
		}
	});

	const ratingPosition = computed({
		get: () => currentRatingPosition(),
		set: ( val: 'inline' | 'above' | 'below' | 'none' | 'vertical' ) => {
			if ( val === 'vertical' ) {
				const view = ensureView( traitSet.value );
				delete view.parts;
				( traitSet.value as any ).ratingPosition = val;
				view.ratingPosition = val;
				updateCharacter( props.character );
				return;
			}
			rebuildParts( val );
		}
	});

	// Ladder rung label direction: horizontal text or rotated vertical
	// (sidebar-style) for narrow tracks such as Initiative and Hero Dice.
	const labelPosition = computed({
		get: () => getView( traitSet.value )?.labelPosition === 'vertical' ? 'vertical' : 'horizontal',
		set: ( val: 'horizontal' | 'vertical' ) => { setCustomProperty( 'labelPosition', val === 'vertical' ? 'vertical' : null ); }
	});

	const isStatementSet = computed({
		get: () => Boolean( traitSet.value?.statement ?? getView( traitSet.value )?.statement ),
		set: ( val: boolean ) => {
			setProperty( 'statement', Boolean( val ) );
			setCustomProperty( 'statement', Boolean( val ) );
		}
	});

	const hasQuestionedPip = computed({
		get: () => Boolean( traitSet.value?.hasQuestionedPip ?? getView( traitSet.value )?.hasQuestionedPip ),
		set: ( val: boolean ) => {
			setProperty( 'hasQuestionedPip', Boolean( val ) );
			setCustomProperty( 'hasQuestionedPip', Boolean( val ) );
		}
	});

	const hasCounterColumn = computed({
		get: () => Boolean( traitSet.value?.hasCounterColumn ?? getView( traitSet.value )?.hasCounterColumn ),
		set: ( val: boolean ) => {
			setProperty( 'hasCounterColumn', Boolean( val ) );
			setCustomProperty( 'hasCounterColumn', Boolean( val ) );
		}
	});

	const counterLabel = computed({
		get: () => traitSet.value?.counterLabel || getView( traitSet.value )?.counterLabel || 'XP',
		set: ( val: string ) => {
			setProperty( 'counterLabel', val );
			setCustomProperty( 'counterLabel', val );
		}
	});

	const pipCount = computed({
		get: () => {
			const rating = getRating( traitSet.value );
			if ( rating && rating.type === 'Pip' && Array.isArray( rating.range ) && typeof rating.range[0] === 'number' && rating.range[0] > 0 ) {
				return Math.floor( rating.range[0] );
			}
			return 25;
		},
		set: ( val: number ) => { setPipTrack( Math.max( 1, parseInt( String( val ), 10 ) || 25 ), pipsFilled.value ); }
	});

	const pipsPerRow = computed({
		get: () => getView( traitSet.value )?.pips?.perRow ?? 5,
		set: ( val: number ) => { setPipProperty( 'perRow', Math.max( 1, parseInt( String( val ), 10 ) || 5 ) ); }
	});

	const pipsConnected = computed({
		get: () => getView( traitSet.value )?.pips?.connected !== false,
		set: ( val: any ) => { setPipProperty( 'connected', Boolean( val ) ); }
	});

	const pipLabels = computed({
		get: () => getView( traitSet.value )?.pips?.labels === true,
		set: ( val: any ) => { setPipProperty( 'labels', Boolean( val ) ); }
	});

	const pipsFilled = computed({
		get: () => {
			const rating = getRating( traitSet.value );
			if ( rating && rating.type === 'Pip' && Array.isArray( rating.value ) ) {
				return rating.value.filter( ( v ) => v === true ).length;
			}
			return 0;
		},
		set: ( val: number ) => { setPipTrack( pipCount.value, Math.max( 0, parseInt( String( val ), 10 ) || 0 ) ); }
	});

	const scrollable = computed( () => true );

	// Styles sampled from the official Spotlight character sheet PDFs.
	// Talents rows and dossier fields carry no dice.
	const needsDiceUI = computed( () => styleBody.value !== 'three-column-table' && styleBody.value !== 'labeled-fields' );

	// Fixed-layout styles manage their own internal columns.
	const allowsTraitColumns = computed( () => ![ 'subtrait-columns', 'three-column-table', 'paired-slots', 'die-rows', 'dice-count', 'dice-ladder', 'labeled-fields' ].includes( styleBody.value ) );

	const editorDock = computed({
		get: () => getView( traitSet.value )?.editorDock === 'right' ? 'right' : 'left',
		set: ( val: 'left' | 'right' ) => { setCustomProperty( 'editorDock', val === 'right' ? 'right' : 'left' ); }
	});

	// Set header placement + alignment (generic; applies to every style).
	const headerMode = computed<'sidebar' | 'top'>({
		get: () => ( getView( traitSet.value )?.header === 'top' ? 'top' : 'sidebar' ),
		set: ( val: 'sidebar' | 'top' ) => { setCustomProperty( 'header', val === 'top' ? 'top' : 'sidebar' ); }
	});

	const headerAlign = computed<'left' | 'center' | 'right'>({
		get: () => {
			const a = getView( traitSet.value )?.headerAlign;
			return a === 'center' || a === 'right' ? a : 'left';
		},
		set: ( val: 'left' | 'center' | 'right' ) => { setCustomProperty( 'headerAlign', val === 'center' || val === 'right' ? val : 'left' ); }
	});

	// Branched Skills connectors (per-specialty arrows) are optional.
	const branchArrows = computed({
		get: () => {
			const v = getView( traitSet.value )?.branchArrows;
			return v !== false;
		},
		set: ( val: boolean ) => { setCustomProperty( 'branchArrows', Boolean( val ) ); }
	});

	const cssClass = computed( () => {
		let css: Record<string, boolean> = {
			'editor':     true,
			'open':       props.open === true,
			'scrollable': scrollable.value,
		};

		css[ 'anchor-position-' + anchorPosition.value ] = true;

		if ( isFullWidthSpan.value ) {
			css[ 'dock-' + editorDock.value ] = true;
		}

		if ( scrollable.value ) {
			css[ 'scroll-position-' + scrollPosition.value ] = true;
		}

		return css;
	});

	function selectElement( selector: any ) {
		emit( 'selectElement', selector );
	}

	function targetValue( event: any ) {
		return ( event?.target as any )?.value;
	}

	async function focusFirstInput() {
		await nextTick();
		if ( inputName.value ) {
			inputName.value.focus( { preventScroll: true } );
		}
	}

	// Ensure + return this set's view bag (typed).
	function ctkFor( s: number ): CortexToolkitCustom {
		return ensureView( props.character.traitSets[ s ] );
	}

	function setProperty( key: keyof TraitSet, value: any ) {
		let character = props.character;
		let s = props.traitSetID;

		character.traitSets[s][ key ] = value as never;

		updateCharacter( character );
	}

	function promptDeleteTraitSet() {
		showDeleteConfirm.value = true;
	}

	function cancelDeleteTraitSet() {
		showDeleteConfirm.value = false;
	}

	function confirmDeleteTraitSet() {
		showDeleteConfirm.value = false;
		emit( 'removeTraitSet', props.traitSetID );
	}

	function restoreTrait( name: string ) {
		if ( cortexFunctions.restoreTraitOnSheet( props.character, templateEntry.value, props.traitSetID, name ) ) {
			updateCharacter( props.character );
		}
	}

	function setRingConfig( key: keyof RingConfig, value: any ) {
		let s = props.traitSetID;
		const ctk = ctkFor( s );
		if ( !ctk.ringConfig ) {
			ctk.ringConfig = {
				arcAngle: -90,
				arcSpread: 100,
				arcDistance: 0,
				scaleAngle: 0,
				scaleDistance: 0,
				scaleDieX: 0,
				scaleDieY: 0,
				arcSlide: 0
			};
		}
		ctk.ringConfig[ key ] = value;
		updateCharacter( structuredClone( toRaw( props.character ) ) );
	}

	function resetRingPlacement() {
		let s = props.traitSetID;
		ctkFor( s ).ringConfig = {
			arcAngle: -90,
			arcSpread: 100,
			arcDistance: 0,
			scaleAngle: 0,
			scaleDistance: 0,
			scaleDieX: 0,
			scaleDieY: 0,
			arcSlide: 0
		};
		updateCharacter( structuredClone( toRaw( props.character ) ) );
	}

	function setFeature( featureID: keyof SetFeatures, value: any ) {
		let s = props.traitSetID;
		const ctk = ctkFor( s );
		if ( !ctk.features ) {
			ctk.features = {
				description: false,
				sfx: false,
				subtraits: false
			};
		}
		ctk.features[ featureID ] = value;

		updateCharacter( props.character );
	}

	function setCustomProperty( key: string, value: any ) {
		let s = props.traitSetID;
		ctkFor( s )[ key ] = value;
		updateCharacter( props.character );
	}

	// Generic trait-set label store: one flat dictionary for every
	// style's named regions; defaults resolve centrally per style.
	// Inputs bind :value/@change (and placeholder) to it.
	function styleLabel( key: string ) {
		const labels = getView( traitSet.value )?.labels;
		if ( labels && labels[ key ] !== undefined && labels[ key ] !== null && String( labels[ key ] ).length ) {
			return labels[ key ];
		}
		return cortexFunctions.labelDefaultForStyle( styleBody.value, key );
	}

	function setStyleLabel( key: string, value: any ) {
		let s = props.traitSetID;
		const ctk = ctkFor( s );
		if ( !ctk.labels || typeof ctk.labels !== 'object' ) {
			ctk.labels = {};
		}
		ctk.labels[ key ] = value;

		updateCharacter( props.character );
	}

	// Labels group content: style-region headings, nouns, stress label, or
	// hinder sentence. The group hides when nothing in it applies, so no
	// editor section can render empty.
	const hasLabelContent = computed( () => {
		const body = styleBody.value;
		if ( body === 'subtrait-columns' || body === 'three-column-table' || body === 'dice-count' ) return true;
		if ( body === 'sfx-rows' ) return true;
		if ( hasTrackPart.value ) return true;
		return body !== 'notes' && body !== 'image' && body !== 'pips';
	} );

	function setImageConfig( key: keyof ImageConfig, value: any ) {
		let s = props.traitSetID;
		const ctk = ctkFor( s );
		if ( !ctk.imageConfig ) {
			ctk.imageConfig = {};
		}
		ctk.imageConfig[ key ] = value;

		updateCharacter( props.character );
	}

	function uploadImageStart() {
		if ( imageFileInput.value ) {
			imageFileInput.value.click();
		}
	}

	function uploadImageProcess( event: any ) {
		uploadError.value = '';
		if ( !event.target.files || !event.target.files.length ) {
			imageURL.value = '';
			return;
		}
		cortexFunctions.processImageFile( event.target.files[0], 1280, 0.85 ).then(
			( dataURL: string ) => {
				imageURL.value = dataURL;
				event.target.value = null;
			},
			( error: any ) => {
				uploadError.value = error?.message || 'Could not process that image.';
				event.target.value = null;
			}
		);
	}

	function removeImage() {
		imageURL.value = '';
	}

	function isRatingIncluded( size: any ) {
		return ratingScale.value.includes( size );
	}

	function toggleRatingOption( size: any ) {
		let current = [ ...ratingScale.value ];
		if ( current.includes( size ) ) {
			if ( current.length > 1 ) {
				current = current.filter( ( s: number ) => s !== size );
			}
		} else {
			current.push( size );
			current.sort( ( a, b ) => a - b );
		}
		ratingScale.value = current;
	}

	function isSubtraitRatingIncluded( size: any ) {
		return subtraitRatingScale.value.includes( size );
	}

	function toggleSubtraitRatingOption( size: any ) {
		let current = [ ...subtraitRatingScale.value ];
		if ( current.includes( size ) ) {
			if ( current.length > 1 ) {
				current = current.filter( ( s: number ) => s !== size );
			}
		} else {
			current.push( size );
			current.sort( ( a, b ) => a - b );
		}
		subtraitRatingScale.value = current;
	}

	function getDieDisplayValue( value: any ) {
		return cortexFunctions.getDieDisplayValue( value );
	}

	function addEffect() {
		let character = props.character;
		let s = props.traitSetID;

		const container = cortexFunctions.ensureSfxContainer( character.traitSets[s] );
		if ( container && Array.isArray( container.traits ) ) {
			container.traits.push( structuredClone( cortexFunctions.defaultSFX ) );
		}

		updateCharacter( character );
	}

	function removeEffect( effectID: any ) {
		let character = props.character;
		let s = props.traitSetID;

		cortexFunctions.removeSfxAt( character.traitSets[s], effectID );

		updateCharacter( character );
	}

	function updateCharacter( character?: any ) {
		emit( 'updateCharacter', character );
	}

	function ensurePipStruct() {
		const ctk = ctkFor( props.traitSetID );
		if ( !ctk.pips ) {
			ctk.pips = {
				perRow: 5,
				connected: true
			};
		}
		const ts = traitSet.value as unknown as Record<string, any>;
		if ( ts && ( !ts.rating || typeof ts.rating !== 'object' || ( ts.rating as any ).type !== 'Pip' ) ) {
			ts.rating = { type: 'Pip', value: [], range: [ 25 ] };
		}
	}

	// The track count and fill live on the set node's Pip rating;
	// perRow/connected/labels stay presentation in view.pips.
	function setPipTrack( count: number, filled: number ) {
		const ts = traitSet.value as unknown as Record<string, any>;
		if ( !ts ) return;
		const bubbles: boolean[] = [];
		for ( let i = 0; i < count; i++ ) bubbles.push( i < filled );
		ts.rating = { type: 'Pip', value: bubbles, range: [ count ] };
		updateCharacter( props.character );
	}

	function setPipProperty( key: keyof PipsConfig, value: any ) {
		ensurePipStruct();
		let s = props.traitSetID;
		ctkFor( s ).pips![ key ] = value;
		updateCharacter( props.character );
	}

	function checkAnchorPosition() {
		if ( !rootEl.value || !rootEl.value.parentElement ) return;

		let windowHeight = ( window.innerHeight || document.documentElement.clientHeight );
		let parentRect = rootEl.value.parentElement.getBoundingClientRect();
		let traitMidpoint = parentRect.top + ( parentRect.height / 2 );

		if ( traitMidpoint < ( windowHeight / 2 ) ) {
			anchorPosition.value = 'top';
		} else {
			anchorPosition.value = 'bottom';
		}

		nextTick( () => {
			if ( !rootEl.value ) return;

			rootEl.value.style.setProperty( '--editor-shift-y', '0px' );
			rootEl.value.style.setProperty( '--arrow-shift-y', '0px' );

			let rect = rootEl.value.getBoundingClientRect();
			let pad = 16;
			let shiftY = 0;

			if ( rect.top < pad ) {
				shiftY = pad - rect.top;
			} else if ( rect.bottom > windowHeight - pad ) {
				shiftY = ( windowHeight - pad ) - rect.bottom;
			}

			if ( Math.abs( shiftY ) > 0.5 ) {
				rootEl.value.style.setProperty( '--editor-shift-y', `${shiftY}px` );
				let arrowNaturalY = ( anchorPosition.value === 'bottom' ) ? ( rect.height - 16 ) : 16;
				let targetArrowY = arrowNaturalY - shiftY;
				let clampedArrowY = Math.max( 16, Math.min( rect.height - 16, targetArrowY ) );
				let arrowShift = clampedArrowY - arrowNaturalY;
				rootEl.value.style.setProperty( '--arrow-shift-y', `${arrowShift}px` );
			}
			checkScrollPosition();
		});
	}

	function checkScrollPosition() {
		if ( !rootEl.value || typeof rootEl.value.querySelector !== 'function' ) return;
		let element = rootEl.value.querySelector( '.editor-inner > div' );
		if ( !element ) return;

		let distance = element.scrollTop;
		let max = element.scrollHeight - element.clientHeight;

		if ( max <= 0 ) {
			scrollPosition.value = 'none';
			return;
		}

		if ( distance === 0 ) {
			scrollPosition.value = 'top';
			return;
		}

		if ( distance >= max ) {
			scrollPosition.value = 'bottom';
			return;
		}

		scrollPosition.value = 'middle';
	}

	const api = {
		rootEl, inputName, imageFileInput, scrollPosition, anchorPosition, showDeleteConfirm, uploadError, styleOptions,
		traitSet, character, traitSetID, name, description, noun, plural, styleBody, isRing, isRingCandidateSet,
		ringTrait, isFullWidthSpan,
		partPreview,
		partCells, effectivePartCells, isPartsPreview, isRowBody, hasParts, hasCustomParts, setPartCell, resetParts,
		branchShares, setBranchShare, hasCustomBranch,
		templateEntry, restorableTraitNames, isSpotlightSheet,
		ringSpread, ringDistance, ringAngle, ringAngleLabel, scaleAngle, scaleAngleLabel, scaleDistance,
		ringScaleY, ringScaleX, scaleDieValue, imageURL, imageAlignment, imageHeight, imageCaption,
		featureDescription, featureSubtraits, featureSFX, includeOut, ratingScale, subtraitRatingScale,
		isPool, setRating, setSpendable, setHitches, notesContent, reservedSlots, sharedHinder, sharedHinderText, traitColumns,
		setVisibility, cycleSetVisibility, setPillar, resolvedPillar, presetSaved, saveSetAsPreset,
		showBlockMini, openBlockMini, closeBlockMini, characterCustomPillars,
		hasTrackPart, trackLabel, ratingPosition, labelPosition, isStatementSet,
		hasQuestionedPip, hasCounterColumn, counterLabel, pipCount, pipsPerRow, pipsConnected, pipsFilled, pipLabels,
		scrollable, needsDiceUI, allowsTraitColumns,
		editorDock, branchArrows, headerMode, headerAlign, cssClass,
		selectElement, focusFirstInput, targetValue, setProperty, promptDeleteTraitSet, cancelDeleteTraitSet, confirmDeleteTraitSet,
		restoreTrait,
		setRingConfig, resetRingPlacement, setFeature,
		setCustomProperty, styleLabel, setStyleLabel, hasLabelContent, setImageConfig, uploadImageStart,		uploadImageProcess, removeImage, isRatingIncluded, toggleRatingOption,
		isSubtraitRatingIncluded, toggleSubtraitRatingOption, getDieDisplayValue,
		addEffect, removeEffect, updateCharacter, ensurePipStruct, setPipProperty,
		checkAnchorPosition, checkScrollPosition,
	};

	onMounted( () => {
		checkAnchorPosition();
		window.addEventListener( 'resize', checkAnchorPosition );
	});

	onUnmounted( () => {
		window.removeEventListener( 'resize', checkAnchorPosition );
	});

	onUpdated( () => {
		if ( props.open ) {
			checkAnchorPosition();
		}
	});

	watch( () => props.traitSetID, () => { showDeleteConfirm.value = false; partPreview.value = null; } );
	watch( () => props.character, () => { checkAnchorPosition(); } );
	watch( () => props.viewY, () => { checkAnchorPosition(); } );
	watch( () => props.open, ( isOpen: boolean | undefined, wasOpen: boolean | undefined ) => {
		showDeleteConfirm.value = false;
		if ( isOpen && !wasOpen ) {
			focusFirstInput();
			nextTick( () => {
				checkAnchorPosition();
				setTimeout( () => {
					checkAnchorPosition();
				}, 220 );
			});
		} else if ( !isOpen ) {
			if ( rootEl.value ) {
				rootEl.value.style.setProperty( '--editor-shift-y', '0px' );
				rootEl.value.style.setProperty( '--arrow-shift-y', '0px' );
			}
		}
	});

	provide( TRAIT_SET_EDITOR_KEY, api );
	return api;
}

export function injectTraitSetEditor(): TraitSetEditorApi {
	const api = inject( TRAIT_SET_EDITOR_KEY );
	if ( !api ) throw new Error( 'use-trait-set-editor: injectTraitSetEditor() called outside TraitSetEditor' );
	return api;
}
