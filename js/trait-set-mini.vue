<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { getView, ensureView, type Rating, type RatingType, type PartCell, DIE_LADDER } from './model.ts';
import { cortexFunctions } from './functions.ts';
import { formatPct, parsePct, type PartName } from './spotlight-grid.ts';
import VisibilityEye from './visibility-eye.vue';
import TraitSetBlock from './trait-set-block.vue';

export interface PartBlueprint extends PartCell {
	marker?: 'L' | 'T';
	ratingType?: RatingType;
	range?: number[];
	pool?: boolean;
	spendable?: boolean;
	noun?: string;
}

export interface ChildSlotDef {
	id: string;
	noun: string;
	ratingType: RatingType | 'None';
	range?: number[];
	marker?: 'L' | 'T';
}

const props = defineProps<{
	initialSet?: any;
}>();

const emit = defineEmits<{
	( e: 'close' ): void;
	( e: 'saved', preset: any ): void;
	( e: 'applyToSet', updatedSet: any ): void;
}>();

// Canonical rating factory conforming to schema/0.1/character.schema.json
function createDefaultRatingForType( type: RatingType | 'None', customRange?: number[] ): Rating | undefined {
	if ( type === 'None' ) return undefined;
	if ( type === 'Pip' ) {
		const count = customRange && customRange[ 0 ] ? Math.max( 1, customRange[ 0 ] ) : 5;
		const bubbles: boolean[] = [];
		for ( let i = 0; i < count; i++ ) bubbles.push( false );
		return { type: 'Pip', value: bubbles, range: [ count ] };
	}
	if ( type === 'Dice' ) {
		const r = customRange && customRange.length ? [ ...customRange ] : [ 4, 6, 8, 10, 12 ];
		return { type: 'Dice', value: [ 6, 8 ], range: r };
	}
	if ( type === 'Counter' ) {
		const r = customRange && customRange.length >= 2 ? [ ...customRange ] : [ 0, 10 ];
		return { type: 'Counter', value: [ r[ 0 ] ], range: r };
	}
	// 'Die'
	const r = customRange && customRange.length ? [ ...customRange ] : [ 4, 6, 8, 10, 12 ];
	return { type: 'Die', value: [ r.includes( 8 ) ? 8 : ( r[ 0 ] || 8 ) ], range: r };
}

// Ensure every trait's rating uses canonical { type, value: [...], range: [...] }
function normalizeRating( r: any, defaultType: RatingType = 'Die' ): Rating {
	if ( !r || typeof r !== 'object' ) return createDefaultRatingForType( defaultType )!;
	const type: RatingType = ( r.type === 'Dice' || r.type === 'Pip' || r.type === 'Counter' ) ? r.type : 'Die';
	const rawVal = Array.isArray( r.value ) ? r.value : ( Array.isArray( r.values ) ? r.values : ( typeof r.value === 'number' || typeof r.value === 'boolean' ? [ r.value ] : [] ) );
	const rawRange = Array.isArray( r.range ) && r.range.length ? r.range : ( type === 'Pip' ? [ ( typeof r.max === 'number' ? r.max : 5 ) ] : [ 4, 6, 8, 10, 12 ] );

	if ( type === 'Pip' ) {
		const count = rawRange[ 0 ] || 5;
		const bubbles: boolean[] = [];
		for ( let i = 0; i < count; i++ ) {
			if ( typeof rawVal[ i ] === 'boolean' ) bubbles.push( rawVal[ i ] );
			else if ( typeof rawVal[ 0 ] === 'number' ) bubbles.push( i < rawVal[ 0 ] );
			else bubbles.push( false );
		}
		return { type: 'Pip', value: bubbles, range: [ count ] };
	}
	if ( type === 'Counter' ) {
		const val = typeof rawVal[ 0 ] === 'number' ? rawVal[ 0 ] : 0;
		const rMin = rawRange[ 0 ] ?? 0;
		const rMax = rawRange[ 1 ] ?? 10;
		return { type: 'Counter', value: [ val ], range: [ rMin, rMax ] };
	}
	if ( type === 'Dice' ) {
		const dice = rawVal.filter( ( d: any ) => typeof d === 'number' && d > 0 );
		return { type: 'Dice', value: dice.length ? dice : [ 6, 8 ], range: rawRange };
	}
	// Die
	const die = typeof rawVal[ 0 ] === 'number' && rawVal[ 0 ] > 0 ? rawVal[ 0 ] : 8;
	return { type: 'Die', value: [ die ], range: rawRange };
}

function createDefaultWorkingSet( source?: any ): any {
	if ( source ) {
		const copy = cortexFunctions.cloneDeep( source );
		const v = ensureView( copy );
		if ( !v.pillar ) v.pillar = 'play';
		if ( !v.parts || typeof v.parts !== 'object' || Array.isArray( v.parts ) || Object.keys( v.parts ).length === 0 ) {
			( v as any ).parts = {
				name: { left: '0%', top: 0, width: '65%', height: 1, marker: 'L' },
				rating: { left: '65%', top: 0, width: '35%', height: 1, ratingType: 'Die', range: [ 4, 6, 8, 10, 12 ] }
			};
		}
		if ( Array.isArray( copy.traits ) ) {
			copy.traits.forEach( ( t: any ) => {
				if ( t.rating ) t.rating = normalizeRating( t.rating );
				if ( Array.isArray( t.traits ) ) {
					t.traits.forEach( ( sub: any ) => {
						if ( sub.rating && sub.rating.type !== 'SFX' ) sub.rating = normalizeRating( sub.rating );
					} );
				}
			} );
		}
		return copy;
	}
	return {
		id: cortexFunctions.generateUUID(),
		name: 'New Card',
		noun: 'Trait',
		plural: 'Traits',
		traits: [
			{
				id: cortexFunctions.generateUUID(),
				name: 'Example Trait',
				rating: { type: 'Die', value: [ 8 ], range: [ 4, 6, 8, 10, 12 ] },
				traits: []
			}
		],
		view: {
			pillar: 'play',
			playMutable: false,
			features: {},
			parts: {
				name: { left: '0%', top: 0, width: '65%', height: 1, marker: 'L' },
				rating: { left: '65%', top: 0, width: '35%', height: 1, ratingType: 'Die', range: [ 4, 6, 8, 10, 12 ] }
			} as any
		}
	};
}

const workingSet = ref<any>( createDefaultWorkingSet( props.initialSet ) );

watch( () => props.initialSet, ( next ) => {
	if ( next ) {
		workingSet.value = createDefaultWorkingSet( next );
	}
} );

const previewSubmode = ref<'play' | 'edit'>( 'play' );
const previewCharacter = computed( () => ({
	id: 'mini-preview-character',
	name: 'Preview',
	dateCreated: new Date().toISOString(),
	dateModified: new Date().toISOString(),
	traitSets: [ workingSet.value ]
} as any) );
const selectedPartKey = ref<string>( 'name' );
const draggingKey = ref<string | null>( null );
const dragMode = ref<'move' | 'resize-e' | 'resize-s' | null>( null );
const dragStart = ref<{ x: number; y: number; left: number; width: number; top: number; height: number } | null>( null );
const gridEl = ref<HTMLElement | null>( null );

// Preset saving state
const presetLabel = ref<string>( '' );
const presetBlurb = ref<string>( '' );
const saveStatusMessage = ref<string>( '' );
const saveErrorMessage = ref<string>( '' );
const savedVersion = ref<number>( 0 );
const fileImportInput = ref<HTMLInputElement | null>( null );

// New child slot creation state in inventory bar
const showNewChildSlotForm = ref<boolean>( false );
const newChildNoun = ref<string>( '' );
const newChildRatingType = ref<RatingType | 'None'>( 'Pip' );

const derivedId = computed( () => cortexFunctions.derivePresetId( presetLabel.value ) );
const hasCollision = computed( () => {
	void savedVersion.value;
	if ( !derivedId.value ) return false;
	return cortexFunctions.hasPresetCollision( derivedId.value );
} );

function ensurePartsMap(): Record<string, PartBlueprint> {
	const v = ensureView( workingSet.value );
	if ( !v.parts || typeof v.parts !== 'object' || Array.isArray( v.parts ) || Object.keys( v.parts ).length === 0 ) {
		( v as any ).parts = {
			name: { left: '0%', top: 0, width: '65%', height: 1, marker: 'L' },
			rating: { left: '65%', top: 0, width: '35%', height: 1, ratingType: 'Die', range: [ 4, 6, 8, 10, 12 ] }
		};
	}
	return v.parts as Record<string, PartBlueprint>;
}

const activeParts = computed<{ kind: string; left: string; top: number; width: string; height: number; blueprint: PartBlueprint }[]>( () => {
	const v = getView( workingSet.value );
	const raw = v?.parts;
	if ( raw && typeof raw === 'object' && !Array.isArray( raw ) && Object.keys( raw ).length > 0 ) {
		return Object.keys( raw ).map( ( kind ) => {
			const cell = ( raw as Record<string, PartBlueprint> )[ kind ]!;
			return {
				kind,
				left: cell.left || '0%',
				top: Number( cell.top ) || 0,
				width: cell.width || '100%',
				height: Number( cell.height ) || 1,
				blueprint: cell
			};
		} );
	}
	return [
		{ kind: 'name', left: '0%', top: 0, width: '65%', height: 1, blueprint: { left: '0%', top: 0, width: '65%', height: 1, marker: 'L' } as PartBlueprint },
		{ kind: 'rating', left: '65%', top: 0, width: '35%', height: 1, blueprint: { left: '65%', top: 0, width: '35%', height: 1, ratingType: 'Die', range: [ 4, 6, 8, 10, 12 ] } as PartBlueprint }
	];
} );

const selectedPart = computed( () => {
	const map = ensurePartsMap();
	return map[ selectedPartKey.value ] || null;
} );

const isNotesCard = computed( () => {
	const p = ( getView( workingSet.value )?.pillar || '' ).toLowerCase();
	const n = ( workingSet.value?.name || '' ).toLowerCase();
	return p === 'notes' || n.includes( 'notes' );
} );

// Track label binding: uses view.labels.track (no references to labels.stress)
const trackLabelText = computed( {
	get: () => getView( workingSet.value )?.labels?.track || '',
	set: ( val: string ) => {
		const v = ensureView( workingSet.value );
		const trimmed = ( val || '' ).trim();
		if ( trimmed ) {
			if ( !v.labels ) v.labels = {};
			v.labels.track = trimmed;
		} else if ( v.labels ) {
			delete v.labels.track;
		}
		delete ( v.labels as any )?.stress;
	}
} );

const outIndicator = computed( {
	get: () => Boolean( getView( workingSet.value )?.outIndicator ),
	set: ( val: boolean ) => {
		const v = ensureView( workingSet.value );
		if ( val ) {
			v.outIndicator = true;
		} else {
			delete v.outIndicator;
		}
	}
} );

const headerPlacement = computed( () => getView( workingSet.value )?.header === 'top' ? 'top' : 'sidebar' );
const headerAlign = computed( () => getView( workingSet.value )?.headerAlign || 'center' );

function setHeaderPlacement( placement: 'sidebar' | 'top', align?: 'left' | 'center' | 'right' ) {
	const v = ensureView( workingSet.value );
	if ( placement === 'top' ) {
		v.header = 'top';
		v.headerAlign = align || 'center';
	} else {
		delete v.header;
		delete v.headerAlign;
	}
}

// Die SVGs for palette icons
const singleDieSVG = computed( () => cortexFunctions.renderDieGeometrySVG( 8, false, 'mini-icon-die' ) );
const bundleDiceSVG = computed( () => (
	cortexFunctions.renderDieGeometrySVG( 6, false, 'mini-icon-die mini-bundle-1' ) +
	cortexFunctions.renderDieGeometrySVG( 8, true, 'mini-icon-die mini-bundle-2' ) +
	cortexFunctions.renderDieGeometrySVG( 10, false, 'mini-icon-die mini-bundle-3' )
) );

// Part blueprint helpers
function getPartMarker( partKey: string ): 'L' | 'T' {
	const map = ensurePartsMap();
	const cell = map[ partKey ];
	if ( cell && ( cell.marker === 'T' || cell.marker === 'L' ) ) return cell.marker;
	if ( partKey === 'name' ) return getView( workingSet.value )?.playMutable ? 'T' : 'L';
	if ( partKey === 'description' || partKey === 'block' || partKey === 'sfx' ) return 'T';
	return 'L';
}

function toggleBlueprintMarker( partKey: string ) {
	const map = ensurePartsMap();
	const cell = map[ partKey ];
	if ( !cell ) return;
	const cur = getPartMarker( partKey );
	const next = cur === 'L' ? 'T' : 'L';
	cell.marker = next;
	if ( partKey === 'name' ) {
		const v = ensureView( workingSet.value );
		v.playMutable = ( next === 'T' );
	}
}

function getPartRatingType( partKey: string ): RatingType {
	const map = ensurePartsMap();
	const cell = map[ partKey ];
	if ( cell && cell.ratingType ) return cell.ratingType;
	if ( partKey === 'track' ) return 'Die';
	if ( partKey === 'subtraits' ) return 'Dice';
	return 'Die';
}

function setBlueprintRatingType( partKey: string, nextType: RatingType ) {
	const map = ensurePartsMap();
	const cell = map[ partKey ];
	if ( !cell ) return;
	cell.ratingType = nextType;

	if ( nextType === 'Pip' ) {
		cell.range = cell.range && cell.range.length ? [ cell.range[ 0 ] ] : [ 5 ];
	} else if ( nextType === 'Counter' ) {
		cell.range = cell.range && cell.range.length >= 2 ? [ cell.range[ 0 ], cell.range[ 1 ] ] : [ 0, 10 ];
	} else {
		cell.range = cell.range && cell.range.length ? cell.range : [ 4, 6, 8, 10, 12 ];
	}

	// Update matching rating structures on workingSet.traits to conform to blueprint
	if ( partKey === 'rating' ) {
		for ( const t of ( workingSet.value.traits || [] ) ) {
			t.rating = createDefaultRatingForType( nextType, cell.range );
		}
	} else if ( cell.noun ) {
		const noun = cell.noun;
		for ( const t of ( workingSet.value.traits || [] ) ) {
			const sub = ( t.traits || [] ).find( ( s: any ) => ( s.name || '' ).toLowerCase() === noun.toLowerCase() );
			if ( sub ) sub.rating = createDefaultRatingForType( nextType, cell.range );
		}
	}
}

function toggleBlueprintRangeSide( partKey: string, side: number ) {
	const map = ensurePartsMap();
	const cell = map[ partKey ];
	if ( !cell ) return;
	const cur = Array.isArray( cell.range ) && cell.range.length ? [ ...cell.range ] : [ 4, 6, 8, 10, 12 ];
	const idx = cur.indexOf( side );
	if ( idx >= 0 ) {
		if ( cur.length > 1 ) cur.splice( idx, 1 );
	} else {
		cur.push( side );
		cur.sort( ( a, b ) => a - b );
	}
	cell.range = cur;

	// Update traits in set
	if ( partKey === 'rating' ) {
		for ( const t of ( workingSet.value.traits || [] ) ) {
			if ( t.rating ) t.rating.range = [ ...cur ];
		}
	} else if ( partKey === 'track' ) {
		for ( const t of ( workingSet.value.traits || [] ) ) {
			for ( const sub of ( t.traits || [] ) ) {
				if ( sub?.rating && sub.rating.type !== 'SFX' ) {
					sub.rating.range = [ ...cur ];
				}
			}
		}
	} else if ( cell.noun ) {
		const noun = cell.noun;
		for ( const t of ( workingSet.value.traits || [] ) ) {
			const sub = ( t.traits || [] ).find( ( s: any ) => ( s.name || '' ).toLowerCase() === noun.toLowerCase() );
			if ( sub && sub.rating ) sub.rating.range = [ ...cur ];
		}
	}
}

function setBlueprintPipCount( partKey: string, count: number ) {
	const map = ensurePartsMap();
	const cell = map[ partKey ];
	if ( !cell ) return;
	const n = Math.max( 1, Math.min( 25, Math.floor( count ) || 1 ) );
	cell.range = [ n ];

	if ( partKey === 'rating' ) {
		for ( const t of ( workingSet.value.traits || [] ) ) {
			t.rating = createDefaultRatingForType( 'Pip', [ n ] );
		}
	} else if ( cell.noun ) {
		const noun = cell.noun;
		for ( const t of ( workingSet.value.traits || [] ) ) {
			const sub = ( t.traits || [] ).find( ( s: any ) => ( s.name || '' ).toLowerCase() === noun.toLowerCase() );
			if ( sub ) sub.rating = createDefaultRatingForType( 'Pip', [ n ] );
		}
	}
}

function setBlueprintCounterBounds( partKey: string, min: number, max: number ) {
	const map = ensurePartsMap();
	const cell = map[ partKey ];
	if ( !cell ) return;
	cell.range = [ min, Math.max( min, max ) ];
	if ( partKey === 'rating' ) {
		for ( const t of ( workingSet.value.traits || [] ) ) {
			t.rating = createDefaultRatingForType( 'Counter', cell.range );
		}
	}
}

// Child slots catalog on the set view
function ensureChildSlots(): ChildSlotDef[] {
	const v = ensureView( workingSet.value );
	if ( !Array.isArray( ( v as any ).childSlots ) ) {
		( v as any ).childSlots = [];
	}
	return ( v as any ).childSlots as ChildSlotDef[];
}

const childSlots = computed<ChildSlotDef[]>( () => {
	const v = getView( workingSet.value );
	const explicit = Array.isArray( ( v as any )?.childSlots ) ? ( v as any ).childSlots : [];
	const seen = new Set<string>( explicit.map( ( s: ChildSlotDef ) => s.noun.toLowerCase() ) );

	// Auto-detect any companion tracks from active parts or existing traits
	const configuredTrack = ( v?.labels?.track || '' ).trim();
	if ( configuredTrack && !seen.has( configuredTrack.toLowerCase() ) ) {
		explicit.unshift( { id: 'stress', noun: configuredTrack, ratingType: 'Die', range: [ 4, 6, 8, 10, 12 ], marker: 'L' } );
		seen.add( configuredTrack.toLowerCase() );
	}

	for ( const t of ( workingSet.value?.traits || [] ) ) {
		for ( const sub of ( t?.traits || [] ) ) {
			const sName = ( sub?.name || '' ).trim();
			if ( sName && !seen.has( sName.toLowerCase() ) && sub?.rating?.type && sub.rating.type !== 'SFX' ) {
				explicit.push( {
					id: cortexFunctions.generateUUID(),
					noun: sName,
					ratingType: sub.rating.type,
					range: sub.rating.range,
					marker: 'L'
				} );
				seen.add( sName.toLowerCase() );
			}
		}
	}

	return explicit;
} );

function onAddCompanionTrackClick() {
	const cNoun = trackLabelText.value || 'Stress';
	ensureChildTraitOnAllInstances( cNoun, 'Die' );
	addOrFocusPart( 'trackLabel', cNoun, 'label' );
	addOrFocusPart( 'track', cNoun, 'rating', 'Die' );
}

function onAddBlockSfxClick() {
	addOrFocusPart( 'block', undefined, 'primary' );
	for ( const t of ( workingSet.value.traits || [] ) ) {
		addTraitSfx( t );
	}
}

function addChildSlot() {
	const noun = newChildNoun.value.trim();
	if ( !noun ) return;
	const slots = ensureChildSlots();
	const rType = newChildRatingType.value;
	const slotDef: ChildSlotDef = {
		id: cortexFunctions.generateUUID(),
		noun,
		ratingType: rType,
		range: rType === 'Pip' ? [ 5 ] : ( rType === 'Counter' ? [ 0, 10 ] : [ 4, 6, 8, 10, 12 ] ),
		marker: 'L'
	};
	slots.push( slotDef );
	newChildNoun.value = '';
	showNewChildSlotForm.value = false;

	// Auto-opt in to the grid
	const labelKey = `child:${noun}:label`;
	const ratingKey = `child:${noun}:rating`;
	addOrFocusPart( labelKey, noun, 'label' );
	if ( rType !== 'None' ) {
		addOrFocusPart( ratingKey, noun, 'rating', rType );
	}
}

function removeChildSlot( noun: string ) {
	const v = ensureView( workingSet.value );
	if ( Array.isArray( ( v as any ).childSlots ) ) {
		( v as any ).childSlots = ( v as any ).childSlots.filter( ( s: ChildSlotDef ) => s.noun.toLowerCase() !== noun.toLowerCase() );
	}
	removePartByKey( `child:${noun}:label` );
	removePartByKey( `child:${noun}:rating` );
	removePartByKey( 'trackLabel' );
	removePartByKey( 'track' );
}

// Drag & drop inventory tiles
interface InventoryTile {
	kind: string;
	label: string;
	noun: string;
	slotKind?: 'label' | 'rating' | 'primary';
	marker: 'T' | 'L' | 'die' | 'pool' | 'pip' | 'counter';
	ratingType?: RatingType;
}

interface InventoryNounGroup {
	noun: string;
	category: 'primary' | 'child';
	tiles: InventoryTile[];
}

const inventoryGroups = computed<InventoryNounGroup[]>( () => {
	const groups: InventoryNounGroup[] = [];
	const primaryNouns = new Set<string>();
	const baseNoun = ( workingSet.value?.noun || 'Trait' ).trim() || 'Trait';
	primaryNouns.add( baseNoun );

	for ( const t of ( workingSet.value?.traits || [] ) ) {
		const tNoun = ( ( t as any )?.noun || ( getView( t ) as any )?.noun || '' ).trim();
		if ( tNoun ) primaryNouns.add( tNoun );
	}

	const pRatingType = getPartRatingType( 'rating' );
	for ( const noun of primaryNouns ) {
		groups.push( {
			noun,
			category: 'primary',
			tiles: [
				{ kind: 'name', label: `${noun} Name`, noun, slotKind: 'primary', marker: getPartMarker( 'name' ) },
				{ kind: 'rating', label: `${noun} Rating`, noun, slotKind: 'primary', marker: pRatingType === 'Pip' ? 'pip' : ( pRatingType === 'Dice' ? 'pool' : ( pRatingType === 'Counter' ? 'counter' : 'die' ) ), ratingType: pRatingType },
				{ kind: 'description', label: `${noun} Description`, noun, slotKind: 'primary', marker: getPartMarker( 'description' ) },
				{ kind: 'block', label: `${noun} SFX Block`, noun, slotKind: 'primary', marker: 'T' }
			]
		} );
	}

	// Child trait slots & companion nouns
	const companionNouns = new Set<string>();
	for ( const slot of childSlots.value ) {
		if ( slot.noun ) companionNouns.add( slot.noun );
	}
	for ( const t of ( workingSet.value?.traits || [] ) ) {
		for ( const sub of ( t?.traits || [] ) ) {
			const sName = ( sub?.name || '' ).trim();
			if ( sName && sub?.rating?.type && sub.rating.type !== 'SFX' ) {
				companionNouns.add( sName );
			}
		}
	}

	for ( const sNoun of companionNouns ) {
		const labelKey = ( sNoun.toLowerCase() === 'stress' || sNoun.toLowerCase() === trackLabelText.value.toLowerCase() ) ? 'trackLabel' : `child:${sNoun}:label`;
		const ratingKey = ( sNoun.toLowerCase() === 'stress' || sNoun.toLowerCase() === trackLabelText.value.toLowerCase() ) ? 'track' : `child:${sNoun}:rating`;
		const slot = childSlots.value.find( s => s.noun.toLowerCase() === sNoun.toLowerCase() );
		const sRatingType = ( slot && slot.ratingType !== 'None' ) ? slot.ratingType : 'Die';

		const tiles: InventoryTile[] = [
			{ kind: labelKey, label: `${sNoun} Label/Text`, noun: sNoun, slotKind: 'label', marker: getPartMarker( labelKey ) }
		];
		if ( sRatingType ) {
			tiles.push( {
				kind: ratingKey,
				label: `${sNoun} Rating`,
				noun: sNoun,
				slotKind: 'rating',
				marker: sRatingType === 'Pip' ? 'pip' : ( sRatingType === 'Dice' ? 'pool' : ( sRatingType === 'Counter' ? 'counter' : 'die' ) ),
				ratingType: sRatingType
			} );
		}
		groups.push( {
			noun: sNoun,
			category: 'child',
			tiles
		} );
	}

	return groups;
} );

function isPartActive( kind: string ): boolean {
	return activeParts.value.some( p => p.kind === kind );
}

function addOrFocusPart( kind: string, noun?: string, slotKind?: 'label' | 'rating' | 'primary', rType?: RatingType ) {
	const map = ensurePartsMap();
	const v = ensureView( workingSet.value );
	if ( !v.features || typeof v.features !== 'object' || Array.isArray( v.features ) ) {
		v.features = {};
	}

	if ( kind === 'description' ) v.features.description = true;
	if ( kind === 'block' ) v.features.sfx = true;

	if ( noun ) {
		ensureChildTraitOnAllInstances( noun, rType || 'Die' );
	}

	if ( map[ kind ] ) {
		selectedPartKey.value = kind;
		return;
	}

	let nextTop = 0;
	for ( const k of Object.keys( map ) ) {
		const cell = map[ k ];
		const bottom = ( Number( cell.top ) || 0 ) + ( Number( cell.height ) || 1 );
		if ( bottom > nextTop ) nextTop = bottom;
	}

	const marker: 'L' | 'T' = ( slotKind === 'label' || kind === 'name' || kind === 'trackLabel' ) ? 'L' : 'T';
	const ratingType: RatingType | undefined = slotKind === 'rating' || kind === 'rating' || kind === 'track' ? ( rType || 'Die' ) : undefined;
	const range = ratingType === 'Pip' ? [ 5 ] : ( ratingType === 'Counter' ? [ 0, 10 ] : [ 4, 6, 8, 10, 12 ] );

	if ( slotKind === 'label' || kind === 'trackLabel' ) {
		map[ kind ] = { left: '0%', top: nextTop, width: '35%', height: 1, marker, noun };
	} else if ( slotKind === 'rating' || kind === 'track' ) {
		map[ kind ] = { left: '35%', top: nextTop, width: '65%', height: 1, ratingType, range, noun };
	} else {
		map[ kind ] = { left: '0%', top: nextTop, width: '100%', height: 1, marker, ratingType, range, noun };
	}

	selectedPartKey.value = kind;
}

function removePartByKey( kind: string ) {
	const map = ensurePartsMap();
	if ( Object.keys( map ).length <= 1 || !map[ kind ] ) return;
	delete map[ kind ];
	const remaining = Object.keys( map );
	if ( selectedPartKey.value === kind && remaining.length > 0 ) {
		selectedPartKey.value = remaining[ 0 ];
	}
	const v = ensureView( workingSet.value );
	if ( v.features && typeof v.features === 'object' && !Array.isArray( v.features ) ) {
		if ( kind === 'description' ) delete v.features.description;
		if ( kind === 'block' ) delete v.features.sfx;
	}
}

function ensureChildTraitOnAllInstances( noun: string, rType: RatingType = 'Die' ) {
	const traits = workingSet.value.traits || [];
	for ( const t of traits ) {
		if ( !Array.isArray( t.traits ) ) t.traits = [];
		const existing = t.traits.find( ( sub: any ) => ( sub.name || '' ).toLowerCase() === noun.toLowerCase() );
		if ( !existing ) {
			t.traits.push( {
				id: cortexFunctions.generateUUID(),
				name: noun,
				description: '',
				rating: createDefaultRatingForType( rType )
			} );
		}
	}
}

// Drag & drop
const draggedInventoryTile = ref<InventoryTile | null>( null );

function onInventoryDragStart( ev: DragEvent, tile: InventoryTile ) {
	draggedInventoryTile.value = tile;
	if ( ev.dataTransfer ) {
		ev.dataTransfer.effectAllowed = 'copyMove';
		ev.dataTransfer.setData( 'text/plain', tile.kind );
	}
}

function onGridDragOver( ev: DragEvent ) {
	ev.preventDefault();
	if ( ev.dataTransfer ) ev.dataTransfer.dropEffect = 'copy';
}

function onGridDrop( ev: DragEvent ) {
	ev.preventDefault();
	const tile = draggedInventoryTile.value;
	draggedInventoryTile.value = null;
	if ( !tile ) return;

	addOrFocusPart( tile.kind, tile.noun, tile.slotKind, tile.ratingType );
	const map = ensurePartsMap();
	const cell = map[ tile.kind ];
	if ( cell && gridEl.value ) {
		const rect = gridEl.value.getBoundingClientRect();
		if ( rect.width > 0 && rect.height > 0 ) {
			const relX = Math.max( 0, Math.min( 0.9, ( ev.clientX - rect.left ) / rect.width ) );
			const relY = Math.max( 0, ( ev.clientY - rect.top ) / 38 );
			const snappedLeft = Math.round( ( relX * 100 ) / 5 ) * 5;
			const curWidth = parsePct( cell.width ) || 35;
			cell.left = formatPct( Math.min( 100 - curWidth, snappedLeft ) );
			cell.top = Math.max( 0, Math.min( 7, Math.floor( relY ) ) );
		}
	}
}

// Pointer drag & edge-grab resize
function onPartPointerDown( ev: PointerEvent, kind: string, mode: 'move' | 'resize-e' | 'resize-s' ) {
	ev.stopPropagation();
	selectedPartKey.value = kind;
	const map = ensurePartsMap();
	const cell = map[ kind ];
	if ( !cell ) return;

	draggingKey.value = kind;
	dragMode.value = mode;
	dragStart.value = {
		x: ev.clientX,
		y: ev.clientY,
		left: parsePct( cell.left ) ?? 0,
		width: parsePct( cell.width ) ?? 100,
		top: Number( cell.top ) || 0,
		height: Number( cell.height ) || 1
	};

	window.addEventListener( 'pointermove', onWindowPointerMove );
	window.addEventListener( 'pointerup', onWindowPointerUp );
}

function onWindowPointerMove( ev: PointerEvent ) {
	if ( !draggingKey.value || !dragStart.value || !gridEl.value ) return;
	const map = ensurePartsMap();
	const cell = map[ draggingKey.value ];
	if ( !cell ) return;

	const rect = gridEl.value.getBoundingClientRect();
	const dxPct = rect.width > 0 ? ( ( ev.clientX - dragStart.value.x ) / rect.width ) * 100 : 0;
	const dyRows = Math.round( ( ev.clientY - dragStart.value.y ) / 38 );

	if ( dragMode.value === 'move' ) {
		const rawLeft = Math.round( ( dragStart.value.left + dxPct ) / 5 ) * 5;
		const clampedLeft = Math.max( 0, Math.min( 100 - dragStart.value.width, rawLeft ) );
		const clampedTop = Math.max( 0, Math.min( 7, dragStart.value.top + dyRows ) );
		cell.left = formatPct( clampedLeft );
		cell.top = clampedTop;
	} else if ( dragMode.value === 'resize-e' ) {
		const rawWidth = Math.round( ( dragStart.value.width + dxPct ) / 5 ) * 5;
		const clampedWidth = Math.max( 10, Math.min( 100 - dragStart.value.left, rawWidth ) );
		cell.width = formatPct( clampedWidth );
	} else if ( dragMode.value === 'resize-s' ) {
		const clampedHeight = Math.max( 1, Math.min( 6, dragStart.value.height + dyRows ) );
		cell.height = clampedHeight;
	}
}

function onWindowPointerUp() {
	draggingKey.value = null;
	dragMode.value = null;
	dragStart.value = null;
	window.removeEventListener( 'pointermove', onWindowPointerMove );
	window.removeEventListener( 'pointerup', onWindowPointerUp );
}

function onPartKeyDown( ev: KeyboardEvent, kind: string ) {
	const map = ensurePartsMap();
	const cell = map[ kind ];
	if ( !cell ) return;

	const curLeft = parsePct( cell.left ) ?? 0;
	const curWidth = parsePct( cell.width ) ?? 100;
	const curTop = Number( cell.top ) || 0;
	const curHeight = Number( cell.height ) || 1;

	if ( ev.key === 'Delete' || ev.key === 'Backspace' ) {
		ev.preventDefault();
		removePartByKey( kind );
		return;
	}

	if ( ev.shiftKey ) {
		if ( ev.key === 'ArrowRight' ) {
			ev.preventDefault();
			cell.width = formatPct( Math.min( 100 - curLeft, curWidth + 5 ) );
		} else if ( ev.key === 'ArrowLeft' ) {
			ev.preventDefault();
			cell.width = formatPct( Math.max( 10, curWidth - 5 ) );
		} else if ( ev.key === 'ArrowDown' ) {
			ev.preventDefault();
			cell.height = Math.min( 6, curHeight + 1 );
		} else if ( ev.key === 'ArrowUp' ) {
			ev.preventDefault();
			cell.height = Math.max( 1, curHeight - 1 );
		}
		return;
	}

	if ( ev.key === 'ArrowRight' ) {
		ev.preventDefault();
		cell.left = formatPct( Math.min( 100 - curWidth, curLeft + 5 ) );
	} else if ( ev.key === 'ArrowLeft' ) {
		ev.preventDefault();
		cell.left = formatPct( Math.max( 0, curLeft - 5 ) );
	} else if ( ev.key === 'ArrowDown' ) {
		ev.preventDefault();
		cell.top = Math.min( 7, curTop + 1 );
	} else if ( ev.key === 'ArrowUp' ) {
		ev.preventDefault();
		cell.top = Math.max( 0, curTop - 1 );
	}
}

// Readout getters/setters
const selectedLeftNum = computed( {
	get: () => parsePct( selectedPart.value?.left ) ?? 0,
	set: ( val: number ) => {
		const map = ensurePartsMap();
		const cell = map[ selectedPartKey.value ];
		if ( !cell ) return;
		const w = parsePct( cell.width ) ?? 100;
		const clamped = Math.max( 0, Math.min( 100 - w, Math.round( Number( val ) || 0 ) ) );
		cell.left = formatPct( clamped );
	}
} );

const selectedWidthNum = computed( {
	get: () => parsePct( selectedPart.value?.width ) ?? 100,
	set: ( val: number ) => {
		const map = ensurePartsMap();
		const cell = map[ selectedPartKey.value ];
		if ( !cell ) return;
		const l = parsePct( cell.left ) ?? 0;
		const clamped = Math.max( 10, Math.min( 100 - l, Math.round( Number( val ) || 10 ) ) );
		cell.width = formatPct( clamped );
	}
} );

const selectedTopNum = computed( {
	get: () => Number( selectedPart.value?.top ) || 0,
	set: ( val: number ) => {
		const map = ensurePartsMap();
		const cell = map[ selectedPartKey.value ];
		if ( !cell ) return;
		cell.top = Math.max( 0, Math.min( 7, Math.round( Number( val ) || 0 ) ) );
	}
} );

const selectedHeightNum = computed( {
	get: () => Number( selectedPart.value?.height ) || 1,
	set: ( val: number ) => {
		const map = ensurePartsMap();
		const cell = map[ selectedPartKey.value ];
		if ( !cell ) return;
		cell.height = Math.max( 1, Math.min( 6, Math.round( Number( val ) || 1 ) ) );
	}
} );

function getPartBoxStyle( part: { left: string; top: number; width: string; height: number } ) {
	const left = parsePct( part.left ) ?? 0;
	const width = parsePct( part.width ) ?? 100;
	const top = Number( part.top ) || 0;
	const height = Number( part.height ) || 1;
	return {
		left: `${left}%`,
		width: `${width}%`,
		top: `${top * 38}px`,
		height: `${height * 38 - 4}px`
	};
}

// Instance data management
const DIE_SIDES = [ 4, 6, 8, 10, 12 ];

function addTraitRow() {
	if ( !Array.isArray( workingSet.value.traits ) ) workingSet.value.traits = [];
	const rType = getPartRatingType( 'rating' );
	const rRange = selectedPart.value?.range || [ 4, 6, 8, 10, 12 ];

	const newTrait: any = {
		id: cortexFunctions.generateUUID(),
		name: `New ${workingSet.value.noun || 'Trait'}`,
		rating: isPartActive( 'rating' ) ? createDefaultRatingForType( rType, rRange ) : undefined,
		traits: []
	};

	// Initialize active child slots on new trait
	for ( const slot of childSlots.value ) {
		const labelKey = `child:${slot.noun}:label`;
		const ratingKey = `child:${slot.noun}:rating`;
		if ( isPartActive( labelKey ) || isPartActive( ratingKey ) || isPartActive( 'track' ) || isPartActive( 'trackLabel' ) ) {
			newTrait.traits.push( {
				id: cortexFunctions.generateUUID(),
				name: slot.noun,
				description: '',
				rating: createDefaultRatingForType( slot.ratingType !== 'None' ? slot.ratingType : 'Die', slot.range )
			} );
		}
	}

	workingSet.value.traits.push( newTrait );
}

function removeTraitRow( tIdx: number ) {
	if ( !Array.isArray( workingSet.value.traits ) ) return;
	workingSet.value.traits.splice( tIdx, 1 );
}

function getChildTraitInstance( trait: any, noun: string ): any {
	if ( !Array.isArray( trait.traits ) ) trait.traits = [];
	let sub = trait.traits.find( ( s: any ) => ( s.name || '' ).toLowerCase() === noun.toLowerCase() );
	if ( !sub ) {
		sub = {
			id: cortexFunctions.generateUUID(),
			name: noun,
			description: '',
			rating: createDefaultRatingForType( 'Die' )
		};
		trait.traits.push( sub );
	}
	return sub;
}

// Value pickers on trait instances
function setTraitDieValue( trait: any, dieVal: number ) {
	if ( !trait.rating ) trait.rating = { type: 'Die', value: [ dieVal ], range: [ 4, 6, 8, 10, 12 ] };
	trait.rating.value = [ dieVal ];
}

function toggleTraitPoolDie( trait: any, dieVal: number ) {
	if ( !trait.rating ) trait.rating = { type: 'Dice', value: [ dieVal ], range: [ 4, 6, 8, 10, 12 ] };
	if ( !Array.isArray( trait.rating.value ) ) trait.rating.value = [];
	const idx = trait.rating.value.indexOf( dieVal );
	if ( idx >= 0 && trait.rating.value.length > 1 ) {
		trait.rating.value.splice( idx, 1 );
	} else {
		trait.rating.value.push( dieVal );
		trait.rating.value.sort( ( a: number, b: number ) => a - b );
	}
}

function toggleTraitPipValue( trait: any, pIdx: number ) {
	if ( !trait.rating ) trait.rating = createDefaultRatingForType( 'Pip' );
	if ( !Array.isArray( trait.rating.value ) ) trait.rating.value = [ false ];
	trait.rating.value[ pIdx ] = !trait.rating.value[ pIdx ];
}

function toggleChildPipValue( sub: any, pIdx: number ) {
	if ( !sub.rating ) sub.rating = createDefaultRatingForType( 'Pip' );
	if ( !Array.isArray( sub.rating.value ) ) sub.rating.value = [ false ];
	sub.rating.value[ pIdx ] = !sub.rating.value[ pIdx ];
}

function setChildDieValue( sub: any, dieVal: number ) {
	if ( !sub.rating ) sub.rating = { type: 'Die', value: [ dieVal ], range: [ 4, 6, 8, 10, 12 ] };
	sub.rating.value = [ dieVal ];
}

function addTraitSfx( trait: any ) {
	if ( !Array.isArray( trait.traits ) ) trait.traits = [];
	trait.traits.push( {
		id: cortexFunctions.generateUUID(),
		name: 'SFX',
		description: 'Spend 1 PP to activate.',
		rating: { type: 'SFX' }
	} );
}

function removeChildTraitInstance( trait: any, sIdx: number ) {
	if ( Array.isArray( trait.traits ) ) {
		trait.traits.splice( sIdx, 1 );
	}
}

// Preset library & Card JSON export/import
function saveAsPresetCard() {
	saveErrorMessage.value = '';
	saveStatusMessage.value = '';

	const label = ( presetLabel.value || '' ).trim();
	if ( !label ) {
		saveErrorMessage.value = 'Preset label is required.';
		return;
	}

	const id = derivedId.value;
	if ( !id ) {
		saveErrorMessage.value = 'Could not derive preset ID from label.';
		return;
	}

	const cardPayload = cortexFunctions.cloneDeep( workingSet.value );
	const v = ensureView( cardPayload );
	v.presetId = id;
	v.presetLabel = label;
	if ( presetBlurb.value.trim() ) {
		v.presetBlurb = presetBlurb.value.trim();
	}

	const saved = cortexFunctions.saveCustomSetPreset( cardPayload, {
		label,
		blurb: presetBlurb.value.trim() || undefined
	} );

	if ( saved ) {
		savedVersion.value++;
		saveStatusMessage.value = `Saved card "${label}" into preset library.`;
		emit( 'saved', saved );
	} else {
		saveErrorMessage.value = 'Could not save preset card.';
	}
}

function applyToCurrentSheet() {
	emit( 'applyToSet', cortexFunctions.cloneDeep( workingSet.value ) );
	emit( 'close' );
}

function exportCardJson() {
	const data = {
		format: 'cortex-card',
		version: '0.1',
		exportedAt: new Date().toISOString(),
		traitSet: workingSet.value
	};
	const jsonStr = JSON.stringify( data, null, 2 );
	const blob = new Blob( [ jsonStr ], { type: 'application/json' } );
	const url = URL.createObjectURL( blob );
	const a = document.createElement( 'a' );
	const filename = ( workingSet.value.name || 'cortex-card' ).toLowerCase().replace( /[^a-z0-9_-]/g, '-' ) + '.card.json';
	a.href = url;
	a.download = filename;
	document.body.appendChild( a );
	a.click();
	document.body.removeChild( a );
	URL.revokeObjectURL( url );
}

function triggerImportCardJson() {
	if ( fileImportInput.value ) {
		fileImportInput.value.click();
	}
}

function onFileImportSelected( ev: Event ) {
	const file = ( ev.target as HTMLInputElement )?.files?.[ 0 ];
	if ( !file ) return;
	const reader = new FileReader();
	reader.onload = ( e ) => {
		try {
			const parsed = JSON.parse( e.target?.result as string );
			const importedSet = parsed.traitSet || parsed;
			workingSet.value = createDefaultWorkingSet( importedSet );
			saveStatusMessage.value = `Imported card "${workingSet.value.name || 'Card'}".`;
		} catch ( err ) {
			saveErrorMessage.value = 'Invalid card JSON file.';
		}
	};
	reader.readAsText( file );
}
</script>

<template>
	<div
		class="trait-set-mini"
		role="dialog"
		aria-modal="true"
		aria-label="Trait Set Mini Editor"
	>
		<input
			ref="fileImportInput"
			type="file"
			accept=".json,application/json"
			style="display: none;"
			@change="onFileImportSelected"
		/>

		<!-- Top Header -->
		<header class="mini-header">
			<div class="mini-header-left">
				<span class="mini-header-icon" aria-hidden="true">
					<i class="fas fa-th-large"></i>
				</span>
				<div class="mini-header-titles">
					<h2 class="mini-title">Trait Block Mini</h2>
					<p class="mini-subtitle">Build one trait set from parts &amp; ship as a preset card</p>
				</div>
			</div>
			<div class="mini-header-actions">
				<span class="legend-chip"><span class="mini-marker-badge marker-label">L</span> Label (Edit-only)</span>
				<span class="legend-chip"><span class="mini-marker-badge marker-text">T</span> Text (Play-mutable)</span>
				<button
					type="button"
					class="mini-close-btn"
					aria-label="Close dialog"
					@click="emit('close')"
				>&times;</button>
			</div>
		</header>

		<!-- Main 2-Column Split: Authoring Left, Live Rendered Card Right -->
		<main class="mini-body">
			<div class="mini-authoring-column">
				<!-- Parts Inventory Palette -->
				<section class="mini-inventory-palette" aria-label="Parts Inventory">
					<div class="inventory-palette-header">
						<span class="inventory-palette-title">PARTS INVENTORY (BLUEPRINT)</span>
						<button
							type="button"
							class="btn-new-child-slot"
							title="Add Companion / Stress Track"
							@click="onAddCompanionTrackClick"
						><i class="fas fa-heartbeat"></i> +Track</button>
						<button
							type="button"
							class="btn-new-child-slot"
							title="Add Block / SFX Entry"
							@click="onAddBlockSfxClick"
						><i class="fas fa-bolt"></i> +Block</button>
						<button
							type="button"
							class="btn-new-child-slot"
							@click="showNewChildSlotForm = !showNewChildSlotForm"
						>
							<i class="fas fa-plus"></i> Add Child Trait Slot
						</button>
					</div>

					<!-- Inline Add Child Slot Form -->
					<div v-if="showNewChildSlotForm" class="new-child-slot-panel">
						<input
							v-model="newChildNoun"
							type="text"
							class="mini-input mini-input-sm"
							placeholder="Noun (e.g. Statement, Ammo, Stress, Specialty)"
							@keydown.enter.prevent="addChildSlot"
						/>
						<select v-model="newChildRatingType" class="mini-select-sm">
							<option value="Pip">Pip Track</option>
							<option value="Die">Die Track</option>
							<option value="Dice">Dice Pool</option>
							<option value="Counter">Counter</option>
							<option value="None">None (Text Only)</option>
						</select>
						<button type="button" class="mini-btn-add" @click="addChildSlot">Add Slot</button>
						<button type="button" class="mini-btn-cancel" @click="showNewChildSlotForm = false">Cancel</button>
					</div>

					<div class="inventory-groups-list">
						<div
							v-for="group in inventoryGroups"
							:key="group.noun"
							class="inventory-noun-group"
							:class="'inventory-group-' + group.category"
							:data-noun-group="group.noun"
						>
							<div class="inventory-group-header">
								<span class="inventory-group-noun">{{ group.noun }}</span>
								<span class="inventory-group-tag">{{ group.category === 'primary' ? 'Primary Trait' : 'Child Trait' }}</span>
								<button
									v-if="group.category === 'child'"
									type="button"
									class="mini-icon-btn mini-btn-danger"
									title="Remove child slot"
									@click="removeChildSlot( group.noun )"
								>&times;</button>
							</div>
							<div class="inventory-tiles-row">
								<div
									v-for="tile in group.tiles"
									:key="tile.kind"
									class="inventory-tile"
									:class="{ active: isPartActive( tile.kind ) }"
									draggable="true"
									@dragstart="onInventoryDragStart( $event, tile )"
									@click="addOrFocusPart( tile.kind, tile.noun, tile.slotKind, tile.ratingType )"
								>
									<button
										v-if="tile.marker === 'L' || tile.marker === 'T'"
										type="button"
										class="mini-marker-badge mini-marker-toggle"
										:class="getPartMarker( tile.kind ) === 'L' ? 'marker-label' : 'marker-text'"
										:title="`Click to toggle Label (L) vs Text (T)`"
										@click.stop="toggleBlueprintMarker( tile.kind )"
									>{{ getPartMarker( tile.kind ) }}</button>
									<span v-else-if="tile.marker === 'die'" class="mini-tile-svg" v-html="singleDieSVG"></span>
									<span v-else-if="tile.marker === 'pool'" class="mini-tile-svg mini-bundle" v-html="bundleDiceSVG"></span>
									<span v-else-if="tile.marker === 'pip'" class="pip-bubble" aria-hidden="true"></span>
									<span v-else-if="tile.marker === 'counter'" class="mini-counter-badge">#</span>
									<span class="inventory-tile-label">{{ tile.label }}</span>
								</div>
							</div>
						</div>
					</div>
				</section>

				<!-- Header Placement Options -->
				<section class="mini-header-controls" aria-label="Header Placement">
					<span class="mini-subheading">Header Placement</span>
					<div class="mini-btn-group">
						<button
							type="button"
							class="mini-toggle-btn"
							:class="{ active: headerPlacement === 'sidebar' }"
							@click="setHeaderPlacement('sidebar')"
						><i class="fas fa-columns"></i> Left Sidebar</button>
						<button
							type="button"
							class="mini-toggle-btn"
							:class="{ active: headerPlacement === 'top' && headerAlign === 'left' }"
							@click="setHeaderPlacement('top', 'left')"
						><i class="fas fa-align-left"></i> Top Left</button>
						<button
							type="button"
							class="mini-toggle-btn"
							:class="{ active: headerPlacement === 'top' && headerAlign === 'center' }"
							@click="setHeaderPlacement('top', 'center')"
						><i class="fas fa-align-center"></i> Top Center</button>
						<button
							type="button"
							class="mini-toggle-btn"
							:class="{ active: headerPlacement === 'top' && headerAlign === 'right' }"
							@click="setHeaderPlacement('top', 'right')"
						><i class="fas fa-align-right"></i> Top Right</button>
					</div>
				</section>

				<!-- 2D Drag-and-Place Grid Canvas -->
				<section class="mini-grid-section" aria-label="2D Trait Layout Canvas">
					<div class="mini-grid-container">
						<div
							ref="gridEl"
							class="mini-layout-canvas"
							@dragover="onGridDragOver"
							@drop="onGridDrop"
						>
							<div
								v-for="part in activeParts"
								:key="part.kind"
								class="block-mini-part"
								:class="{ selected: selectedPartKey === part.kind, dragging: draggingKey === part.kind }"
								:data-grid-part="part.kind"
								:style="getPartBoxStyle( part )"
								tabindex="0"
								@pointerdown="onPartPointerDown( $event, part.kind, 'move' )"
								@click.stop="selectedPartKey = part.kind"
								@keydown="onPartKeyDown( $event, part.kind )"
							>
								<div class="block-mini-part-inner">
									<button
										v-if="part.blueprint.marker === 'L' || part.blueprint.marker === 'T'"
										type="button"
										class="mini-marker-badge mini-marker-toggle"
										:class="getPartMarker( part.kind ) === 'L' ? 'marker-label' : 'marker-text'"
										:title="`Toggle Label / Text`"
										@pointerdown.stop
										@click.stop="toggleBlueprintMarker( part.kind )"
									>{{ getPartMarker( part.kind ) }}</button>
									<span v-else-if="part.blueprint.ratingType === 'Pip'" class="pip-bubble" aria-hidden="true"></span>
									<span v-else-if="part.blueprint.ratingType === 'Dice'" class="mini-tile-svg mini-bundle" v-html="bundleDiceSVG"></span>
									<span v-else-if="part.blueprint.ratingType === 'Counter'" class="mini-counter-badge">#</span>
									<span v-else class="mini-tile-svg" v-html="singleDieSVG"></span>
									<span class="block-mini-part-name">{{ part.kind }}</span>
									<span class="block-mini-part-coords">{{ part.left }} · {{ part.width }}</span>
								</div>
								<button
									v-if="activeParts.length > 1"
									type="button"
									class="block-mini-part-remove"
									@pointerdown.stop
									@click.stop="removePartByKey( part.kind )"
								>&times;</button>
								<span
									class="block-mini-edge block-mini-edge-e"
									@pointerdown.stop="onPartPointerDown( $event, part.kind, 'resize-e' )"
								></span>
								<span
									class="block-mini-edge block-mini-edge-s"
									@pointerdown.stop="onPartPointerDown( $event, part.kind, 'resize-s' )"
								></span>
							</div>
						</div>
					</div>

					<!-- Selected Part Readout & Rating Blueprint Controls -->
					<div v-if="selectedPart" class="block-mini-readout" aria-label="Selected Part Blueprint">
						<div class="readout-part-title-row">
							<span class="readout-part-title">Selected Part: <strong>{{ selectedPartKey }}</strong></span>

							<!-- Text Marker Toggle on Readout -->
							<div v-if="selectedPart.marker" class="readout-marker-toggle">
								<span class="readout-label">Behavior:</span>
								<button
									type="button"
									class="mini-toggle-btn mini-toggle-sm"
									:class="{ active: selectedPart.marker === 'L' }"
									@click="selectedPart.marker = 'L'"
								>L (Label)</button>
								<button
									type="button"
									class="mini-toggle-btn mini-toggle-sm"
									:class="{ active: selectedPart.marker === 'T' }"
									@click="selectedPart.marker = 'T'"
								>T (Text)</button>
							</div>

							<!-- Rating Type Selector on Readout -->
							<div v-if="selectedPart.ratingType || selectedPartKey === 'rating' || selectedPartKey === 'track'" class="readout-rating-controls">
								<span class="readout-label">Rating:</span>
								<div class="mini-btn-group mini-btn-group-sm">
									<button
										type="button"
										class="mini-toggle-btn mini-toggle-sm"
										:class="{ active: getPartRatingType( selectedPartKey ) === 'Die' }"
										@click="setBlueprintRatingType( selectedPartKey, 'Die' )"
									>Die</button>
									<button
										type="button"
										class="mini-toggle-btn mini-toggle-sm"
										:class="{ active: getPartRatingType( selectedPartKey ) === 'Dice' }"
										@click="setBlueprintRatingType( selectedPartKey, 'Dice' )"
									>Pool</button>
									<button
										type="button"
										class="mini-toggle-btn mini-toggle-sm"
										:class="{ active: getPartRatingType( selectedPartKey ) === 'Pip' }"
										@click="setBlueprintRatingType( selectedPartKey, 'Pip' )"
									>Pip</button>
									<button
										type="button"
										class="mini-toggle-btn mini-toggle-sm"
										:class="{ active: getPartRatingType( selectedPartKey ) === 'Counter' }"
										@click="setBlueprintRatingType( selectedPartKey, 'Counter' )"
									>Counter</button>
								</div>

								<!-- Die/Dice Range Chips -->
								<div v-if="getPartRatingType( selectedPartKey ) === 'Die' || getPartRatingType( selectedPartKey ) === 'Dice'" class="mini-die-picker">
									<button
										v-for="side in DIE_SIDES"
										:key="'blueprint-die-' + side"
										type="button"
										class="mini-die-chip"
										:aria-label="`Toggle d${side} in track range`"
										:class="{ active: (selectedPart.range || [4,6,8,10,12]).includes( side ) }"
										@click="toggleBlueprintRangeSide( selectedPartKey, side )"
									>
										<span class="c" v-html="cortexFunctions.getDieDisplayValue(side)"></span>
									</button>
								</div>

								<!-- Pip Count Stepper -->
								<div v-else-if="getPartRatingType( selectedPartKey ) === 'Pip'" class="readout-pip-stepper">
									<span>Bubbles:</span>
									<button
										type="button"
										class="mini-icon-btn"
										@click="setBlueprintPipCount( selectedPartKey, (selectedPart.range?.[0] || 5) - 1 )"
									>-</button>
									<span class="pip-count-val">{{ selectedPart.range?.[0] || 5 }}</span>
									<button
										type="button"
										class="mini-icon-btn"
										@click="setBlueprintPipCount( selectedPartKey, (selectedPart.range?.[0] || 5) + 1 )"
									>+</button>
								</div>
							</div>
						</div>

						<div class="readout-coords-row">
							<label class="readout-field">
								<span>Left %</span>
								<input v-model.number="selectedLeftNum" type="number" min="0" max="90" step="5" aria-label="Part Left Percent" />
							</label>
							<label class="readout-field">
								<span>Width %</span>
								<input v-model.number="selectedWidthNum" type="number" min="10" max="100" step="5" aria-label="Part Width Percent" />
							</label>
							<label class="readout-field">
								<span>Row</span>
								<input v-model.number="selectedTopNum" type="number" min="0" max="7" step="1" aria-label="Part Row" />
							</label>
							<label class="readout-field">
								<span>Span</span>
								<input v-model.number="selectedHeightNum" type="number" min="1" max="6" step="1" aria-label="Part Row Span" />
							</label>
						</div>
					</div>
				</section>

				<!-- Traits (Data Instances Driven by Blueprint) -->
				<section v-if="!isNotesCard" class="mini-traits-section" aria-label="Traits in Set">
					<div class="mini-traits-header">
						<span class="mini-section-title">Traits in Set</span>
						<label class="mini-inline-label">
							<span>Track Label:</span>
							<input
								v-model="trackLabelText"
								type="text"
								class="mini-input mini-input-sm"
								placeholder="Stress"
							/>
						</label>
						<label class="mini-inline-label">
							<input v-model="outIndicator" type="checkbox" />
							<span>Out Marker</span>
						</label>
						<button type="button" class="mini-btn-add" @click="addTraitRow">
							+ {{ workingSet.noun || 'Trait' }}
						</button>
					</div>

					<div class="mini-traits-list">
						<article
							v-for="(trait, tIdx) in (workingSet.traits || [])"
							:key="trait.id || tIdx"
							class="mini-trait-card"
						>
							<div class="mini-trait-row-main">
								<!-- Static L/T indicator matching blueprint -->
								<span
									v-if="isPartActive('name')"
									class="mini-marker-badge mini-marker-static"
									:class="getPartMarker('name') === 'L' ? 'marker-label' : 'marker-text'"
								>{{ getPartMarker('name') }}</span>

								<!-- Trait Name -->
								<input
									v-if="isPartActive('name')"
									v-model="trait.name"
									type="text"
									class="mini-input mini-trait-name-input"
									placeholder="Trait Name"
								/>

								<!-- Trait Noun -->
								<input
									v-model="trait.noun"
									type="text"
									class="mini-input mini-trait-noun-input"
									:placeholder="workingSet.noun || 'Trait'"
									:aria-label="`Trait ${Number(tIdx) + 1} Noun`"
								/>

								<!-- Rating Value Selector driven by blueprint -->
								<template v-if="isPartActive('rating') && trait.rating">
									<!-- Die Rating Picker -->
									<div v-if="trait.rating.type === 'Die'" class="mini-die-picker">
										<button
											v-for="side in (selectedPartKey === 'rating' ? (selectedPart?.range || DIE_SIDES) : (trait.rating.range || DIE_SIDES))"
											:key="'inst-die-' + side"
											type="button"
											class="mini-die-chip"
											:class="{ active: trait.rating.value?.[0] === side }"
											@click="setTraitDieValue( trait, side )"
										>
											<span class="c" v-html="cortexFunctions.getDieDisplayValue(side)"></span>
										</button>
									</div>

									<!-- Dice Pool Picker -->
									<div v-else-if="trait.rating.type === 'Dice'" class="mini-die-picker">
										<button
											v-for="side in (trait.rating.range || DIE_SIDES)"
											:key="'inst-pool-' + side"
											type="button"
											class="mini-die-chip"
											:class="{ active: (trait.rating.value || []).includes( side ) }"
											@click="toggleTraitPoolDie( trait, side )"
										>
											<span class="c" v-html="cortexFunctions.getDieDisplayValue(side)"></span>
										</button>
									</div>

									<!-- Pip Bubbles Picker -->
									<div v-else-if="trait.rating.type === 'Pip'" class="mini-pip-picker">
										<button
											v-for="(filled, pIdx) in (trait.rating.value || [])"
											:key="'inst-pip-' + pIdx"
											type="button"
											class="pip-bubble"
											:class="{ filled }"
											@click="toggleTraitPipValue( trait, Number(pIdx) )"
										></button>
									</div>

									<!-- Counter Numeric Input -->
									<div v-else-if="trait.rating.type === 'Counter'" class="mini-counter-input-wrap">
										<input
											v-model.number="trait.rating.value[0]"
											type="number"
											class="mini-input mini-input-sm mini-counter-input"
											:min="trait.rating.range?.[0] ?? 0"
											:max="trait.rating.range?.[1] ?? 10"
										/>
									</div>
								</template>

								<button
									v-if="isPartActive('block')"
									type="button"
									class="mini-btn-sub"
									@click="addTraitSfx( trait )"
								>+SFX</button>

								<button
									type="button"
									class="mini-icon-btn mini-btn-danger"
									@click="removeTraitRow( Number(tIdx) )"
								>&times;</button>
							</div>

							<!-- Optional Description -->
							<div v-if="isPartActive('description')" class="mini-trait-subrow">
								<span class="mini-marker-badge mini-marker-static" :class="getPartMarker('description') === 'L' ? 'marker-label' : 'marker-text'">
									{{ getPartMarker('description') }}
								</span>
								<input
									v-model="trait.description"
									type="text"
									class="mini-input"
									placeholder="Trait description..."
								/>
							</div>

							<!-- Dynamic Child Trait Slots on Instance -->
							<template v-for="slot in childSlots" :key="slot.noun">
								<div
									v-if="isPartActive(`child:${slot.noun}:label`) || isPartActive(`child:${slot.noun}:rating`) || isPartActive('trackLabel') || isPartActive('track')"
									class="mini-trait-subrow mini-child-slot-row"
								>
									<!-- Static L/T badge -->
									<span
										class="mini-marker-badge mini-marker-static"
										:class="getPartMarker(`child:${slot.noun}:label`) === 'L' ? 'marker-label' : 'marker-text'"
									>{{ getPartMarker(`child:${slot.noun}:label`) }}</span>

									<!-- Child Text/Name input -->
									<input
										v-model="getChildTraitInstance( trait, slot.noun ).name"
										type="text"
										class="mini-input mini-input-sm mini-subrow-noun"
										:placeholder="slot.noun"
										:aria-label="`Companion Track Noun ${Number(tIdx) + 1}`"
									/>

									<!-- Child Rating Picker -->
									<template v-if="getChildTraitInstance( trait, slot.noun ).rating">
										<template v-if="getChildTraitInstance( trait, slot.noun ).rating.type === 'Die'">
											<span class="mini-subrow-caption">Die:</span>
											<div class="mini-die-picker">
												<button
													v-for="side in (getChildTraitInstance( trait, slot.noun ).rating.range || DIE_SIDES)"
													:key="'child-die-' + side"
													type="button"
													class="mini-die-chip"
													:aria-label="`Select d${side}`"
													:class="{ active: getChildTraitInstance( trait, slot.noun ).rating.value?.[0] === side }"
													@click="setChildDieValue( getChildTraitInstance( trait, slot.noun ), side )"
												>
													<span class="c" v-html="cortexFunctions.getDieDisplayValue(side)"></span>
												</button>
											</div>
										</template>

										<template v-else-if="getChildTraitInstance( trait, slot.noun ).rating.type === 'Dice'">
											<span class="mini-subrow-caption">Pool:</span>
											<div class="mini-die-picker">
												<button
													v-for="side in (getChildTraitInstance( trait, slot.noun ).rating.range || DIE_SIDES)"
													:key="'child-pool-' + side"
													type="button"
													class="mini-die-chip"
													:class="{ active: (getChildTraitInstance( trait, slot.noun ).rating.value || []).includes( side ) }"
													@click="toggleTraitPoolDie( getChildTraitInstance( trait, slot.noun ), side )"
												>
													<span class="c" v-html="cortexFunctions.getDieDisplayValue(side)"></span>
												</button>
											</div>
										</template>

										<template v-else-if="getChildTraitInstance( trait, slot.noun ).rating.type === 'Pip'">
											<span class="mini-subrow-caption">Pips:</span>
											<div class="mini-pip-picker">
												<button
													v-for="(filled, pIdx) in (getChildTraitInstance( trait, slot.noun ).rating.value || [])"
													:key="'child-pip-' + pIdx"
													type="button"
													class="pip-bubble"
													:class="{ filled }"
													@click="toggleChildPipValue( getChildTraitInstance( trait, slot.noun ), Number(pIdx) )"
												></button>
											</div>
										</template>

										<template v-else-if="getChildTraitInstance( trait, slot.noun ).rating.type === 'Counter'">
											<span class="mini-subrow-caption">Val:</span>
											<input
												v-model.number="getChildTraitInstance( trait, slot.noun ).rating.value[0]"
												type="number"
												class="mini-input mini-input-sm mini-counter-input"
											/>
										</template>
									</template>
								</div>
							</template>

							<!-- SFX block items -->
							<div
								v-for="(sub, sIdx) in (trait.traits || []).filter( (s: any) => s.rating?.type === 'SFX' )"
								:key="sub.id || sIdx"
								class="mini-trait-subrow"
							>
								<span class="mini-marker-badge marker-text">T</span>
								<input
									v-model="sub.name"
									type="text"
									class="mini-input mini-input-sm mini-subrow-noun"
									placeholder="SFX Label"
								/>
								<input
									v-model="sub.description"
									type="text"
									class="mini-input"
									placeholder="SFX Effect..."
								/>
								<button
									type="button"
									class="mini-icon-btn mini-btn-danger"
									@click="removeChildTraitInstance( trait, Number(sIdx) )"
								>&times;</button>
							</div>
						</article>
					</div>
				</section>
			</div>

			<!-- Right Column: Live Rendered Card Preview & Card Actions -->
			<div class="mini-preview-column">
				<section class="mini-card-preview-section" aria-label="Live Card Preview">
					<div class="preview-mode-bar">
						<span class="preview-mode-title">LIVE PREVIEW</span>
						<div class="preview-mode-toggles">
							<button
								type="button"
								class="mini-toggle-btn mini-toggle-sm"
								:class="{ active: previewSubmode === 'play' }"
								@click="previewSubmode = 'play'"
							>Play</button>
							<button
								type="button"
								class="mini-toggle-btn mini-toggle-sm"
								:class="{ active: previewSubmode === 'edit' }"
								@click="previewSubmode = 'edit'"
							>Edit</button>
						</div>
					</div>

					<div class="mini-preview-sheet-frame">
						<TraitSetBlock
							:character="previewCharacter"
							:traitSetID="0"
							:submode="previewSubmode"
						/>
					</div>
				</section>

				<!-- Save as Preset Card & Single Card JSON Export/Import -->
				<section class="mini-save-section" aria-label="Save as Preset Card">
					<h3 class="mini-save-title">Ship as Preset Card</h3>

					<div class="mini-save-fields">
						<label class="mini-field">
							<span class="mini-field-label">Preset Label (Required)</span>
							<input
								v-model="presetLabel"
								type="text"
								class="mini-input"
								placeholder="e.g. Questioned Statements, Ammo Track"
								aria-label="Preset Label"
							/>
							<div v-if="hasCollision" class="mini-collision-alert">
								A preset with ID "{{ derivedId }}" already exists.
							</div>
						</label>

						<label class="mini-field">
							<span class="mini-field-label">Blurb (Optional)</span>
							<input
								v-model="presetBlurb"
								type="text"
								class="mini-input"
								placeholder="Single sentence description..."
							/>
						</label>

						<div v-if="saveStatusMessage" class="mini-save-status success">
							<i class="fas fa-check-circle"></i> {{ saveStatusMessage }}
						</div>
						<div v-if="saveErrorMessage" class="mini-save-status error">
							<i class="fas fa-exclamation-circle"></i> {{ saveErrorMessage }}
						</div>
					</div>

					<div class="mini-save-actions">
						<button
							type="button"
							class="btn-apply-sheet"
							@click="applyToCurrentSheet"
						>Apply to Current Sheet</button>

						<button
							type="button"
							class="btn-save-preset mini-save-preset-btn"
							:disabled="!presetLabel.trim() || hasCollision"
							@click="saveAsPresetCard"
						><i class="fas fa-bookmark"></i> Save as Preset Card</button>

						<!-- Card JSON Export & Import -->
						<div class="mini-json-card-actions">
							<button
								type="button"
								class="btn-json-action"
								title="Export standalone .json card"
								@click="exportCardJson"
							><i class="fas fa-file-download"></i> Export Card JSON</button>

							<button
								type="button"
								class="btn-json-action"
								title="Import standalone .json card"
								@click="triggerImportCardJson"
							><i class="fas fa-file-upload"></i> Import Card JSON</button>
						</div>
					</div>
				</section>
			</div>
		</main>
	</div>
</template>
