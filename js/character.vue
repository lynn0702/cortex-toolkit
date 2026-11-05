<script setup lang="ts">
import { computed, getCurrentInstance, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import { cortexFunctions, cortexSetPresets, type SetPresetEntry } from './functions.ts';
import { getView, ensureView, isNameSet, resolveVisibility, isHiddenIn, resolveSetPillar, getPillarLabel, type Character, type TraitSet, type Trait, type ViewBag, type CortexToolkitCustom } from './model.ts';
import {
	getTraitSetColumn as gridTraitSetColumn,
	isFullWidthClassic as gridIsFullWidthClassic,
	hasClassicFullSets as gridHasClassicFullSets,
	getSpotlightSections as gridGetSpotlightSections,
	getSpotlightGridStyle as gridGetSpotlightGridStyle,
	placeOf as gridPlaceOf,
	type SpotlightSection,
	type SpotlightCell,
} from './spotlight-grid.ts';
import TraitSetBlock from './trait-set-block.vue';
import PrintToolbar from './print-toolbar.vue';
import PortraitRing from './portrait-ring.vue';
import TraitSetMini from './trait-set-mini.vue';

const props = defineProps<{
	submode?: string | null;
	character?: Character;
	editing?: unknown[] | null;
	viewY?: number | null;
	dicePool?: any;
	isDesktopPillars?: boolean;
}>();

const emit = defineEmits<{
	( e: 'selectElement', selector: unknown[] ): void;
	( e: 'updateCharacter', character: Character ): void;
	( e: 'exportCharacter', id: string ): void;
	( e: 'saveSheetTemplate' ): void;
	( e: 'exportSheetTemplate' ): void;
	( e: 'addDieToRoller', die: unknown ): void;
}>();

const instance = getCurrentInstance();
const rootTemplates = () => ( instance?.proxy as any )?.$root?.sheetTemplates ?? null;

const rootEl = ref<HTMLElement | null>( null );
const ringRef = ref<any>( null );

const printPageView = ref<any>( 'all' );
const printBlank = ref( false );
const printBW = ref( false );
const showInlineAddSet = ref( false );
const inlineAddPage = ref( 1 );
const inlineAddLocation = ref( 'left' );
const inlineBuiltInPresets = Object.values( cortexSetPresets );
const inlineCustomPresets = ref<SetPresetEntry[]>( [] );

function toggleInlineAdd( page = 1, location = 'left' ) {
	inlineAddPage.value = page;
	inlineAddLocation.value = location;
	inlineCustomPresets.value = cortexFunctions.getCustomSetPresets();
	showInlineAddSet.value = !showInlineAddSet.value;
}

function removeInlineCustomPreset( id: string ) {
	inlineCustomPresets.value = cortexFunctions.deleteCustomSetPreset( id );
}

function openMiniFromInline() {
	showInlineAddSet.value = false;
	showPlayMini.value = true;
}

function openPlayMini() {
	showPlayPresetPicker.value = false;
	showPlayMini.value = true;
}
const showPlayPresetPicker = ref( false );
const showPlayMini = ref( false );
const playBuiltInPresets = Object.values( cortexSetPresets );
const playCustomPresets = ref<SetPresetEntry[]>( [] );
const isMobileViewport = ref( typeof window !== 'undefined' && Boolean( window.matchMedia && window.matchMedia( '(max-width: 768px)' ).matches ) );
const internalDesktopPillars = ref<boolean>(
	typeof localStorage !== 'undefined' ? localStorage.getItem( 'cortexPlayPillars' ) === 'true' : false
);
const effectiveDesktopPillars = computed( () => {
	if ( props.isDesktopPillars !== undefined ) return props.isDesktopPillars;
	return internalDesktopPillars.value;
} );
const isPillarPlay = computed( () => props.submode === 'play' && ( isMobileViewport.value || effectiveDesktopPillars.value ) );

function toggleDesktopPillars() {
	const next = !effectiveDesktopPillars.value;
	if ( next && typeof window !== 'undefined' ) {
		savedSheetScrollY = window.scrollY || document.documentElement.scrollTop || 0;
	}
	internalDesktopPillars.value = next;
	if ( typeof localStorage !== 'undefined' ) {
		localStorage.setItem( 'cortexPlayPillars', String( next ) );
	}
	setupCarouselObserver();
}

let savedSheetScrollY = 0;
watch( isPillarPlay, ( isPillar, wasPillar ) => {
	if ( !wasPillar && isPillar ) {
		if ( typeof window !== 'undefined' && !savedSheetScrollY ) {
			savedSheetScrollY = window.scrollY || document.documentElement.scrollTop || 0;
		}
	} else if ( wasPillar && !isPillar ) {
		const targetY = savedSheetScrollY;
		savedSheetScrollY = 0;
		nextTick( () => {
			if ( typeof window !== 'undefined' ) {
				window.scrollTo( 0, targetY );
				requestAnimationFrame( () => {
					window.scrollTo( 0, targetY );
				} );
			}
		} );
	}
} );
watch( () => props.character?.id, () => {
	savedSheetScrollY = 0;
} );

const name = computed( () => props.character?.name ?? '' );
const portrait = computed( () => props.character?.portrait ?? null );
const game = computed( () => props.character?.game ?? '' );
const traitSets = computed( () => props.character?.traitSets ?? [] );

const ringTraitSetIndex = computed( () => traitSets.value.findIndex( ( ts ) => {
	const view = getView( ts );
	const body = view?.style?.body;
	if ( body === 'portrait-ring' ) return true;
	if ( cortexFunctions.getRingTrait( ts ) === true ) return true;
	return false;
} ) );

const hasRingTrait = computed( () => ringTraitSetIndex.value !== -1 );

const ringTraitID = computed( () => ( hasRingTrait.value ? ringTraitSetIndex.value : -1 ) );
const ringTraitSet = computed( () => ( hasRingTrait.value ? traitSets.value[ ringTraitID.value ] : null ) );
const effectivePortraitUrl = computed( () => getView( ringTraitSet.value )?.imageConfig?.url || portrait.value?.url || '' );
const isRingPool = computed( () => {
	const ts = ringTraitSet.value as unknown as Record<string, unknown> | null;
	if ( ts && typeof ts.pool === 'boolean' ) return ts.pool;
	return Boolean( getView( ts )?.pool );
} );
const ringNoun = computed( () => {
	const ts = ringTraitSet.value;
	return ( ts?.noun && ts.noun.length ) ? ts.noun : 'Trait';
} );
const scaleTrait = computed( () => {
	const attrSet = ringTraitSet.value;
	if ( !attrSet || !Array.isArray( attrSet.traits ) ) return null;
	return attrSet.traits.find( ( t ) => t.name?.trim().toLowerCase() === 'scale' || ( typeof t.keepsExtra === 'number' && t.keepsExtra > 0 ) );
} );
const ringTraits = computed( () => {
	if ( !hasRingTrait.value ) return [];
	const all = ringTraitSet.value?.traits || [];
	return all.filter( ( t ) => !( t.name?.trim().toLowerCase() === 'scale') );
} );
const scaleDieValue = computed( () => {
	const st = scaleTrait.value;
	if ( st ) return Number( st.value ) || 8;
	const attrSet = ringTraitSet.value;
	const attrView = getView( attrSet );
	if ( attrView?.scaleDie ) {
		return Number( attrView.scaleDie );
	}
	const charView = getView( props.character );
	if ( charView?.scale ) {
		return Number( charView.scale );
	}
	return 0;
} );
// (ring: portrait ring + scale die + drag now live in portrait-ring.vue)

const pageCount = computed( () => {
	const charView = getView( props.character );
	if ( charView?.pageCount ) {
		return Math.max( 1, Number( charView.pageCount ) );
	}
	let maxPage = 1;
	for ( const ts of ( props.character?.traitSets || [] ) ) {
		const p = getView( ts )?.page;
		if ( p && p > maxPage ) {
			maxPage = p;
		}
	}
	return maxPage;
} );

const isPrintSubmode = computed( () => props.submode === 'print' );
const effectivePrintBW = computed( () => isPrintSubmode.value && printBW.value );
const effectivePrintBlank = computed( () => isPrintSubmode.value && printBlank.value );
const pageJustification = computed( () => getView( props.character )?.pageJustification || 'top-base' );

const pageOrientation = computed( () => {
	const charView = getView( props.character );
	const o = charView?.pageOrientation || charView?.orientation;
	return o === 'landscape' ? 'landscape' : 'portrait';
} );
const isLandscape = computed( () => pageOrientation.value === 'landscape' );

const columnCount = computed( () => {
	const c = Number( getView( props.character )?.columns );
	return ( c === 2 || c === 3 ) ? c : 2;
} );

const descriptionText = computed( {
	get() {
		return props.character?.description ?? '';
	},
	set( val: string ) {
		if ( !props.character ) return;
		props.character.description = val;
		updateCharacter( props.character );
	},
} );

const printPages = computed( () => {
	if ( isPillarPlay.value ) return [ 1 ];
	if ( props.submode === 'print' && printPageView.value !== 'all' ) {
		return [ Number( printPageView.value ) ];
	}
	const pages: number[] = [];
	for ( let i = 1; i <= pageCount.value; i++ ) {
		pages.push( i );
	}
	return pages;
} );

const hasAnyWatermark = computed( () => {
	const wm = getView( props.character )?.watermark;
	return Boolean( wm?.enabled && wm?.url );
} );

const columnAlignmentMode = computed( () => getView( props.character )?.columnAlignment || 'top-base' );

const characterSheetStyle = computed( () => {
	const ctk: ViewBag = getView( props.character ) || {};
	const style: Record<string, string> = {};

	if ( isLandscape.value ) {
		style[ '--page-width' ] = '297.1mm';
		style[ '--page-height' ] = '210mm';
	} else {
		style[ '--page-width' ] = '210mm';
		style[ '--page-height' ] = '297.1mm';
	}

	const offsets = ctk.columnOffsets || {};
	if ( ctk.columnAlignment === 'custom' ) {
		style[ '--column-left-offset' ] = ( Number( offsets.left ) || 0 ) + 'px';
		style[ '--column-center-offset' ] = ( Number( offsets.center ) || 0 ) + 'px';
		style[ '--column-right-offset' ] = ( Number( offsets.right ) || 0 ) + 'px';
	} else {
		style[ '--column-left-offset' ] = '0px';
		style[ '--column-center-offset' ] = '0px';
		style[ '--column-right-offset' ] = '0px';
	}

	if ( ctk.accentColor ) style[ '--color-interactive' ] = ctk.accentColor;
	if ( ctk.primaryColor ) style[ '--color-primary' ] = ctk.primaryColor;
	if ( ctk.secondaryColor ) style[ '--color-secondary' ] = ctk.secondaryColor;

	if ( ctk.theme?.fonts?.heading ) style[ '--font-heading' ] = `'${ctk.theme.fonts.heading}', sans-serif`;
	if ( ctk.theme?.fonts?.primary ) style[ '--font-primary' ] = `'${ctk.theme.fonts.primary}', sans-serif`;
	if ( ctk.theme?.fonts?.secondary ) style[ '--font-secondary' ] = `'${ctk.theme.fonts.secondary}', sans-serif`;

	return style;
} );

// PRESENTATION
function isSelected( selector: unknown[] ) {
	return cortexFunctions.arraysMatch( props.editing, selector );
}

function openThemeEditor() { selectElement( [ 'theme' ] ); }
function openSheetEditor() { selectElement( [ 'name' ] ); }
function openPageEditor() { selectElement( [ 'page' ] ); }
function openDiceEditor() { selectElement( [ 'dice' ] ); }

function applyFonts() {
	const ctk = getView( props.character );
	if ( !ctk || typeof cortexFunctions === 'undefined' ) return;
	if ( ctk.theme?.fonts ) {
		if ( ctk.theme.fonts.heading && cortexFunctions.loadGoogleFont ) cortexFunctions.loadGoogleFont( ctk.theme.fonts.heading );
		if ( ctk.theme.fonts.primary && cortexFunctions.loadGoogleFont ) cortexFunctions.loadGoogleFont( ctk.theme.fonts.primary );
		if ( ctk.theme.fonts.secondary && cortexFunctions.loadGoogleFont ) cortexFunctions.loadGoogleFont( ctk.theme.fonts.secondary );
	}
	if ( Array.isArray( ctk.customFonts ) && cortexFunctions.applyCustomFont ) {
		ctk.customFonts.forEach( ( f ) => {
			if ( f.name && f.data ) {
				cortexFunctions.applyCustomFont( f.name, f.data );
			}
		} );
	}
	if ( ctk.diceConfig && typeof window !== 'undefined' ) {
		( window as any ).__cortexActiveDiceConfig = ctk.diceConfig;
	}
}

function renderText( text: unknown ) { return cortexFunctions.renderText( text ); }
function renderDieValue( value: number ) { return cortexFunctions.getDieDisplayValue( value ); }

function getTraitSetColumn( traitSet: TraitSet ) { return gridTraitSetColumn( traitSet ); }
function isFullWidthClassic( traitSet: TraitSet ) { return gridIsFullWidthClassic( traitSet ); }
function hasClassicFullSets( pageIndex: number ) { return gridHasClassicFullSets( traitSets.value, ringTraitID.value, pageIndex ); }
function hasPlace( traitSet: TraitSet ) { return gridPlaceOf( traitSet ) !== null; }
function hasClassicUnplacedFullSets( pageIndex: number ) {
	return ( traitSets.value || [] ).some( ( traitSet, s ) =>
		s !== ringTraitID.value &&
		( ( getView( traitSet )?.page || 1 ) === pageIndex ) &&
		isFullWidthClassic( traitSet ) &&
		!hasPlace( traitSet )
	);
}
function isColumnSet( ts: TraitSet ): boolean {
	if ( isFullWidthClassic( ts ) || hasPlace( ts ) ) return false;
	const v = getView( ts );
	if ( isNameSet( ts ) ) {
		return v?.location === 'left' || v?.location === 'right' || v?.track !== undefined;
	}
	return true;
}
function hasColumnContent( pageIndex: number ): boolean {
	if ( hasRingTrait.value && ringTraitID.value > -1 && pageIndex === 1 ) return true;
	const sets = traitSets.value || [];
	return sets.some( ( ts, s ) =>
		s !== ringTraitID.value &&
		( ( getView( ts )?.page || 1 ) === pageIndex ) &&
		isColumnSet( ts )
	);
}
function getClassicGridSections( pageIndex: number ): SpotlightSection[] {
	const sections = getSpotlightSections( pageIndex );
	const out: SpotlightSection[] = [];
	for ( const section of sections ) {
		const ordered = section.ordered.filter( ( { traitSet, index: s } ) => {
			if ( s === ringTraitID.value ) return false;
			if ( section.type === 'full-width' ) {
				return !isColumnSet( traitSet ) && !isFullWidthClassic( traitSet );
			}
			return true;
		} );
		if ( ordered.length === 0 ) continue;
		const cells: Record<number, SpotlightCell> = {};
		for ( const { index: s } of ordered ) {
			if ( section.cells[ s ] ) cells[ s ] = section.cells[ s ];
		}
		out.push( { ...section, ordered, cells } );
	}
	return out;
}
function getLeadingGridSections( pageIndex: number ): SpotlightSection[] {
	const all = getClassicGridSections( pageIndex );
	if ( !hasColumnContent( pageIndex ) ) return all;
	const firstColIdx = ( traitSets.value || [] ).findIndex( ( ts, s ) =>
		s !== ringTraitID.value &&
		( ( getView( ts )?.page || 1 ) === pageIndex ) &&
		isColumnSet( ts )
	);
	if ( firstColIdx === -1 ) return [];
	const cut = all.findIndex( ( sec ) => sec.ordered.some( ( item ) => item.index > firstColIdx ) );
	return cut === -1 ? all : all.slice( 0, cut );
}
function getTrailingGridSections( pageIndex: number ): SpotlightSection[] {
	const all = getClassicGridSections( pageIndex );
	if ( !hasColumnContent( pageIndex ) ) return [];
	const firstColIdx = ( traitSets.value || [] ).findIndex( ( ts, s ) =>
		s !== ringTraitID.value &&
		( ( getView( ts )?.page || 1 ) === pageIndex ) &&
		isColumnSet( ts )
	);
	if ( firstColIdx === -1 ) return all;
	const cut = all.findIndex( ( sec ) => sec.ordered.some( ( item ) => item.index > firstColIdx ) );
	return cut === -1 ? [] : all.slice( cut );
}

function getSpotlightSections( pageIndex: number ) { return gridGetSpotlightSections( traitSets.value, pageIndex, props.submode ); }
function getSpotlightGridStyle( section: SpotlightSection ) { return gridGetSpotlightGridStyle( section ); }

// SELECTING
function selectElement( selector: unknown[] ) {
	if ( props.submode === 'print' ) return;
	if ( props.submode === 'play' ) {
		if ( !selector.length || selector[ 0 ] === 'trait' ) {
			emit( 'selectElement', selector );
		}
		return;
	}
	emit( 'selectElement', selector );
}

function clearSelected() {
	emit( 'selectElement', [] );
}

// EDITING
// New sets carry no place: they stack full-width in document order, which
// lands them on their own row at the end of the target page (sparse).
// Classic sheets keep their left/right columns via location.
function addTraitSet( page = 1, location?: string ) {
	const character = props.character as Character;
	if ( !character ) return;

	const styleId = 'default';
	const traitSet: any = structuredClone( cortexFunctions.defaultTraitSet );

	traitSet.name = 'New trait set';
	traitSet.noun = 'Trait';
	traitSet.plural = 'Traits';
	const tsView = ensureView( traitSet );
	tsView.style = { header: styleId, body: styleId };

	tsView.location = location ?? 'left';
	tsView.page = page ?? 1;
	cortexFunctions.ensureTraitSetIds( { traitSets: [ ...( character.traitSets || [] ), traitSet ] } );
	const blank: any = structuredClone( cortexFunctions.defaultTrait );
	blank.name = '';
	delete blank.rating;
	blank.description = '';
	traitSet.traits.push( blank );

	character.traitSets.push( traitSet );
	updateCharacter( character );
	showInlineAddSet.value = false;

	const newTraitSetID = character.traitSets.length - 1;
	selectElement( [ 'traitSet', newTraitSetID ] );
	nextTick( () => {
		const nameInput = document.querySelector<HTMLInputElement>( 'input[name="traitSetName"]' );
		nameInput?.focus();
	} );
}

function removeTraitSet( traitSetID: number ) {
	const character = props.character as Character;
	if ( isNameSet( character?.traitSets?.[ traitSetID ] ) ) return;

	clearSelected();

	const entry = cortexFunctions.resolveTemplateFor( character, rootTemplates() );
	cortexFunctions.removeTraitSetFromSheet( character, entry, traitSetID );

	updateCharacter( character );
}

function addPresetSet( preset: SetPresetEntry, location?: string, page?: number ) {
	const character = props.character as Character;
	if ( !character || !preset ) return;
	const loc = location ?? 'left';
	const traitSet = cortexFunctions.instantiateSetPreset( preset, character, page ?? 1, loc );
	character.traitSets.push( traitSet );
	updateCharacter( character );
	showInlineAddSet.value = false;
	showPlayPresetPicker.value = false;
	const newTraitSetID = character.traitSets.length - 1;
	if ( props.submode === 'edit' ) {
		selectElement( [ 'traitSet', newTraitSetID ] );
	} else if ( props.submode === 'play' ) {
		const pKey = resolveSetPillar( traitSet );
		nextTick( () => scrollToPillar( pKey, newTraitSetID ) );
	}
}

function openPlayPresetPicker() {
	playCustomPresets.value = cortexFunctions.getCustomSetPresets();
	showPlayPresetPicker.value = true;
}

function removePlayCustomPreset( id: string ) {
	playCustomPresets.value = cortexFunctions.deleteCustomSetPreset( id );
}


function getTraitSetRatings( traitSet: TraitSet ) {
	return cortexFunctions.getTraitSetRatings( traitSet );
}

function addTrait( traitSetID: number ) {
	const character = props.character as Character;
	const traitSet = character.traitSets[ traitSetID ];
	const noun = ( traitSet.noun && traitSet.noun.length ) ? traitSet.noun : 'Trait';

	const trait: any = structuredClone( cortexFunctions.defaultTrait );
	trait.name = 'New ' + noun;
	const allowed = cortexFunctions.getTraitSetRatings( traitSet );
	const cur = trait.rating && trait.rating.type === 'Die' && Array.isArray( trait.rating.value ) ? trait.rating.value[0] : 0;
	if ( allowed.length > 0 && !allowed.includes( cur ) ) {
		trait.rating = { type: 'Die', value: [ allowed[ 0 ] ], range: allowed.slice() };
	}

	character.traitSets[ traitSetID ].traits.push( trait );

	updateCharacter( character );

	const newTraitID = character.traitSets[ traitSetID ].traits.length - 1;
	selectElement( [ 'trait', traitSetID, newTraitID ] );
}

function removeTrait( traitSetID: number, traitID: number ) {
	clearSelected();

	setTimeout( () => {
		const character = props.character as Character;
		const entry = cortexFunctions.resolveTemplateFor( character, rootTemplates() );
		cortexFunctions.removeTraitFromSheet( character, entry, traitSetID, traitID );
		updateCharacter( character );
	}, 200 );
}

function updateCharacter( character: Character ) {
	emit( 'updateCharacter', character );
}

function adjustPlotPoints( delta: number ) {
	if ( !props.character ) return;
	const current = Number( props.character.plotPoints ) || 0;
	props.character.plotPoints = Math.max( 0, current + delta );
	updateCharacter( props.character );
}

function exportCharacter() {
	emit( 'exportCharacter', ( props.character as Character ).id );
}

function renderNotesText( text: unknown ) {
	if ( !text ) return '';
	return cortexFunctions.renderMarkdown( text );
}

function hasWatermark( pageIndex: number ) {
	const wm = getView( props.character )?.watermark;
	if ( !wm || !wm.enabled || !wm.url ) return false;
	if ( !wm.page || wm.page === 'all' ) return true;
	return Number( wm.page ) === Number( pageIndex );
}

function getWatermarkStyle( pageIndex: number ) {
	const wm = getView( props.character )?.watermark;
	if ( !wm ) return '';
	const url = cortexFunctions.safeImageUrl( wm.url );
	if ( !url ) return '';
	const opacity = Number( wm.opacity );
	const scale = Number( wm.scale );
	return `background-image: url('${url}'); opacity: ${isNaN( opacity ) ? 0.08 : opacity}; background-size: ${isNaN( scale ) ? 75 : scale}%;`;
}

function safeImageUrl( url: unknown ) {
	return cortexFunctions.safeImageUrl( url );
}

function print() {
	let cleanup: ( () => void ) | null = null;
	if ( isLandscape.value ) {
		const style = document.createElement( 'style' );
		style.id = 'dynamic-print-page';
		style.textContent = '@page { size: landscape; margin: 8mm; }';
		document.head.appendChild( style );
		cleanup = () => {
			style.remove();
			window.removeEventListener( 'afterprint', cleanup! );
		};
		window.addEventListener( 'afterprint', cleanup, { once: true } );
	}
	window.print();
	if ( cleanup ) {
		setTimeout( cleanup, 1000 );
	}
}

interface MobilePillarSetItem {
	traitSet: TraitSet;
	index: number;
	label: string;
}

interface MobilePillarColumn {
	key: string;
	label: string;
	hasClassicRing: boolean;
	sets: MobilePillarSetItem[];
	stagedCount: number;
}

const activeMobilePillarKey = ref<string>( 'identity' );
const jumpStripRef = ref<HTMLElement | null>( null );
let carouselObserver: IntersectionObserver | null = null;
let mediaQuery: MediaQueryList | null = null;
let handleMediaChange: ( () => void ) | null = null;

function getMobileJumpPillLabel( traitSet: any, orderIdx: number ): string {
	if ( isNameSet( traitSet ) ) return props.character?.name?.trim() || traitSet?.name || 'Name';
	if ( traitSet?.name && String( traitSet.name ).trim().length ) return String( traitSet.name ).trim();
	if ( traitSet?.noun && String( traitSet.noun ).trim().length ) return String( traitSet.noun ).trim();
	const body = getView( traitSet )?.style?.body;
	if ( body === 'image' ) return 'Portrait';
	if ( body === 'notes' ) return 'Notes';
	return `Set ${ orderIdx + 1 }`;
}

function countStagedDiceForSets( sets: TraitSet[] ): number {
	const items = props.dicePool?.items;
	if ( !Array.isArray( items ) || !items.length || !sets.length ) return 0;
	const names = new Set<string>();
	for ( const ts of sets ) {
		if ( !ts ) continue;
		if ( ts.name?.trim() ) names.add( ts.name.trim().toLowerCase() );
		if ( ts.noun?.trim() ) names.add( ts.noun.trim().toLowerCase() );
		for ( const tr of ( ts.traits || [] ) ) {
			if ( tr?.name?.trim() ) {
				const n = tr.name.trim().toLowerCase();
				names.add( n );
				names.add( `${n} (hinder)` );
			}
			for ( const sub of ( tr?.traits || [] ) ) {
				if ( sub?.name?.trim() ) names.add( sub.name.trim().toLowerCase() );
			}
		}
	}
	if ( !names.size ) return 0;
	let count = 0;
	for ( const item of items ) {
		const src = String( item?.source || '' ).trim().toLowerCase();
		if ( src && names.has( src ) ) count++;
	}
	return count;
}

const mobilePillarColumns = computed<MobilePillarColumn[]>( () => {
	if ( props.submode !== 'play' || !props.character ) return [];
	const allSets = Array.isArray( props.character.traitSets ) ? props.character.traitSets : [];
	const byPillar = new Map<string, MobilePillarSetItem[]>();
	const seenCustomKeys: string[] = [];
	const standardOrder = [ 'prime', 'plus', 'play' ];

	const ensureBucket = ( key: string ) => {
		if ( !byPillar.has( key ) ) {
			byPillar.set( key, [] );
			if ( key !== 'identity' && !standardOrder.includes( key ) ) {
				seenCustomKeys.push( key );
			}
		}
		return byPillar.get( key )!;
	};

	ensureBucket( 'identity' );

	let ringPillarKey: string | null = null;
	if ( hasRingTrait.value && ringTraitSet.value && !isHiddenIn( ringTraitSet.value, 'play' ) ) {
		ringPillarKey = resolveSetPillar( ringTraitSet.value );
		ensureBucket( ringPillarKey );
	}

	allSets.forEach( ( ts, idx ) => {
		if ( hasRingTrait.value && idx === ringTraitID.value ) return;
		if ( isHiddenIn( ts, 'play' ) ) return;
		const pKey = resolveSetPillar( ts );
		const bucket = ensureBucket( pKey );
		bucket.push( {
			traitSet: ts,
			index: idx,
			label: getMobileJumpPillLabel( ts, bucket.length ),
		} );
	} );

	const orderedKeys: string[] = [ 'identity' ];
	for ( const stdKey of standardOrder ) {
		if ( byPillar.has( stdKey ) ) orderedKeys.push( stdKey );
	}
	for ( const customKey of seenCustomKeys ) {
		if ( byPillar.has( customKey ) ) orderedKeys.push( customKey );
	}

	return orderedKeys
		.map( ( key ) => {
			const sets = byPillar.get( key ) || [];
			const hasClassicRing = ringPillarKey === key;
			const setsForCount = sets.map( ( s ) => s.traitSet );
			if ( hasClassicRing && hasRingTrait.value && ringTraitSet.value ) {
				setsForCount.unshift( ringTraitSet.value );
			}
			return {
				key,
				label: getPillarLabel( props.character, key ),
				hasClassicRing,
				sets,
				stagedCount: countStagedDiceForSets( setsForCount ),
			};
		} )
		.filter( ( col ) => col.sets.length > 0 || col.hasClassicRing );
} );

function columnStackItems( col: MobilePillarColumn ): { index: number; label: string }[] {
	const items: { index: number; label: string }[] = [];
	if ( col.hasClassicRing && hasRingTrait.value && ringTraitSet.value ) {
		items.push( {
			index: -2,
			label: getMobileJumpPillLabel( ringTraitSet.value, 0 ),
		} );
	}
	for ( const s of col.sets ) {
		items.push( { index: s.index, label: s.label } );
	}
	return items;
}

function centerActiveJumpPill( pillarKey: string ) {
	if ( !jumpStripRef.value ) return;
	const pill = jumpStripRef.value.querySelector( `[data-pillar-pill="${ pillarKey }"]` ) as HTMLElement | null;
	if ( pill && typeof pill.scrollIntoView === 'function' ) {
		pill.scrollIntoView( { behavior: 'smooth', inline: 'center', block: 'nearest' } );
	}
}

function scrollToPillar( pillarKey: string, targetSetIndex?: number ) {
	activeMobilePillarKey.value = pillarKey;
	const root = rootEl.value || document;
	const colEl = root.querySelector( `.mobile-pillar-column[data-pillar-key="${ pillarKey }"]` ) as HTMLElement | null;
	if ( colEl && typeof colEl.scrollIntoView === 'function' ) {
		colEl.scrollIntoView( { behavior: 'smooth', inline: 'center', block: 'nearest' } );
	}
	if ( targetSetIndex !== undefined ) {
		setTimeout( () => scrollToSetInColumn( pillarKey, targetSetIndex ), 180 );
	}
	centerActiveJumpPill( pillarKey );
}

function scrollToSetInColumn( pillarKey: string, setIndex: number ) {
	const root = rootEl.value || document;
	const colEl = root.querySelector( `.mobile-pillar-column[data-pillar-key="${ pillarKey }"]` ) as HTMLElement | null;
	const scope = colEl || root;
	const card = setIndex === -2
		? ( scope.querySelector( '.portrait[data-set-index="-2"]' ) as HTMLElement | null )
		: ( scope.querySelector( `.trait-set[data-set-index="${ setIndex }"]` ) as HTMLElement | null );
	if ( card && typeof card.scrollIntoView === 'function' ) {
		card.scrollIntoView( { behavior: 'smooth', block: 'start', inline: 'nearest' } );
	}
}

function setupCarouselObserver() {
	if ( carouselObserver ) {
		carouselObserver.disconnect();
		carouselObserver = null;
	}
	if ( !isPillarPlay.value ) {
		return;
	}
	nextTick( () => {
		const root = rootEl.value || document;
		const cols = root.querySelectorAll( '.mobile-pillar-column[data-pillar-key]' );
		if ( !cols.length ) return;

		carouselObserver = new IntersectionObserver( ( entries ) => {
			for ( const entry of entries ) {
				if ( entry.isIntersecting ) {
					const rawKey = entry.target.getAttribute( 'data-pillar-key' );
					if ( rawKey ) {
						activeMobilePillarKey.value = rawKey;
						centerActiveJumpPill( rawKey );
					}
				}
			}
		}, {
			threshold: 0.55
		} );

		cols.forEach( ( col ) => carouselObserver!.observe( col ) );
	} );
}

onMounted( () => {
	applyFonts();
	if ( typeof window !== 'undefined' && window.matchMedia ) {
		mediaQuery = window.matchMedia( '(max-width: 768px)' );
		isMobileViewport.value = mediaQuery.matches;
		handleMediaChange = () => {
			isMobileViewport.value = Boolean( mediaQuery && mediaQuery.matches );
			setupCarouselObserver();
		};
		mediaQuery.addEventListener( 'change', handleMediaChange );
	}
	setupCarouselObserver();
} );

onUnmounted( () => {
	if ( mediaQuery && handleMediaChange ) {
		mediaQuery.removeEventListener( 'change', handleMediaChange );
	}
	if ( carouselObserver ) {
		carouselObserver.disconnect();
		carouselObserver = null;
	}
} );

watch( () => props.character, () => {
	applyFonts();
}, { immediate: true, deep: true } );

watch( () => mobilePillarColumns.value, ( cols ) => {
	if ( cols.length > 0 && !cols.some( ( c ) => c.key === activeMobilePillarKey.value ) ) {
		activeMobilePillarKey.value = cols[ 0 ].key;
	}
	setupCarouselObserver();
}, { immediate: true } );

watch( () => props.submode, () => {
	setupCarouselObserver();
} );
</script>

<template>
	<section ref="rootEl" :class="['character-sheet', 'submode-' + submode, 'orientation-' + pageOrientation, { 'spotlight-print-style': isPrintSubmode, 'spotlight-style': true, 'print-blank-mode': effectivePrintBlank, 'print-bw': effectivePrintBW, 'has-watermark': hasAnyWatermark, 'pillar-deck-view': isPillarPlay }]" :style="characterSheetStyle">
	
		<!-- PRINT TOOLBAR -->
		<PrintToolbar
			v-if="submode === 'print'"
			:printBlank="printBlank"
			:printBW="printBW"
			:printPageView="printPageView"
			:pageCount="pageCount"
			@print="print"
			@export="exportCharacter"
			@update:printBlank="printBlank = $event"
			@update:printBW="printBW = $event"
			@update:printPageView="printPageView = $event"
		/>


		<div class="pages" :class="['orientation-' + pageOrientation]">

			<!-- PAGE (SUPPORTS MULTI-PAGE) -->
			<div
				v-for="pageIndex in printPages"
				:key="'page-' + pageIndex"
				:class="['page', 'page-' + pageIndex, 'orientation-' + pageOrientation, 'page-justification-' + pageJustification]"
			>
				<div
					v-if="hasWatermark(pageIndex)"
					class="page-watermark"
					:style="getWatermarkStyle(pageIndex)"
				></div>

				<div class="page-inner">

					<!-- 2D MOBILE PILLAR JUMP STRIP (PLAY MODE) -->
					<nav
						v-if="isPillarPlay && pageIndex === 1 && mobilePillarColumns.length > 0"
						ref="jumpStripRef"
						class="mobile-set-jump-strip"
						aria-label="Character pillars"
					>
						<button
							v-for="col in mobilePillarColumns"
							:key="'jump-pillar-' + col.key"
							type="button"
							class="jump-pill"
							:class="{ active: activeMobilePillarKey === col.key }"
							:data-pillar-pill="col.key"
							:aria-current="activeMobilePillarKey === col.key ? 'true' : undefined"
							@click.stop="scrollToPillar(col.key)"
						>
							<span class="jump-pill-label">{{ col.label }}</span>
							<span v-if="col.stagedCount > 0" class="jump-pill-badge">{{ col.stagedCount }}</span>
						</button>
						<button
							type="button"
							class="jump-pill jump-pill-add-card"
							title="Add Play Card / Set Preset"
							@click.stop="openPlayPresetPicker"
						>
							<i class="fas fa-plus"></i> <span class="jump-pill-label">Card</span>
						</button>
						<button
							v-if="!isMobileViewport && submode === 'play'"
							type="button"
							class="jump-pill jump-pill-view-toggle"
							@click.stop="toggleDesktopPillars"
							:title="effectiveDesktopPillars ? 'Switch to Sheet View' : 'Switch to Pillars Deck'"
						>
							<i :class="effectiveDesktopPillars ? 'fas fa-file-alt' : 'fas fa-building-columns'"></i>
							<span class="jump-pill-label">{{ effectiveDesktopPillars ? 'Sheet' : 'Pillars' }}</span>
						</button>
					</nav>

					<!-- 2D MOBILE PILLAR & STACK DECK (PLAY MODE) -->
					<div v-if="isPillarPlay && pageIndex === 1" class="mobile-pillar-track">
						<div
							v-for="col in mobilePillarColumns"
							:key="'pillar-col-' + col.key"
							class="mobile-pillar-column"
							:data-pillar-key="col.key"
						>
							<div class="mobile-substack-bar" v-if="columnStackItems(col).length > 1">
								<button
									v-for="sub in columnStackItems(col)"
									:key="'substack-' + col.key + '-' + sub.index"
									type="button"
									class="substack-pill"
									@click.stop="scrollToSetInColumn(col.key, sub.index)"
								>
									{{ sub.label }}
								</button>
							</div>

							<!-- PORTRAIT RING IN PILLAR COLUMN -->
							<div v-if="col.hasClassicRing" :class="{ 'portrait': true, 'portrait-standalone': !hasRingTrait }" :data-set-index="-2">
								<div class="portrait-inner" @click.stop="selectElement(['traitSet', ringTraitID])">
									<div :class="'portrait-circle portrait-alignment-' + (getView(ringTraitSet)?.imageConfig?.alignment || getView(portrait)?.alignment || 'top-center')" width="100%" height="100%" :style="'background-image: url(' + safeImageUrl(effectivePortraitUrl) + ');'">
										<img class="portrait-placeholder" v-if="!effectivePortraitUrl" src="images/cortex_prime_logo_light_transparent.png" alt="Portrait placeholder" />
									</div>
								</div>
								<PortraitRing
									v-if="hasRingTrait && ringTraitID > -1"
									ref="ringRef"
									:character="character"
									:editing="editing"
									:submode="submode"
									:viewY="viewY"
									:ringTraitID="ringTraitID"
									@selectElement="selectElement"
									@updateCharacter="updateCharacter"
									@addDieToRoller="emit('addDieToRoller', $event)"
									@removeTrait="removeTrait"
								/>
							</div>

							<TraitSetBlock
								v-for="item in col.sets"
								:key="'mobile-set-' + item.index"
								:character="character"
								:traitSetID="item.index"
								:submode="submode"
								:editing="editing"
								:viewY="viewY"
								:printBlank="effectivePrintBlank"
								@selectElement="selectElement"
								@updateCharacter="updateCharacter"
								@removeTrait="removeTrait"
								@removeTraitSet="removeTraitSet"
								@addTrait="addTrait"
								@addDieToRoller="emit('addDieToRoller', $event)"
							></TraitSetBlock>

							<button
								v-if="col.key === 'play'"
								type="button"
								class="btn-mobile-add-play-card"
								@click.stop="openPlayPresetPicker"
							>
								<i class="fas fa-plus"></i> Add Play Card
							</button>
						</div>
					</div>

					<div v-else class="mobile-carousel-track">

					<!-- PAGE 2+ HEADER -->
					<header class="page-header page-2-header" v-if="pageIndex > 1">
						<div class="page-2-header-inner">
							<div class="page-2-title">{{ name }}</div>
							<div class="page-2-badge">{{ game ? game + ' — ' : '' }}Page {{ pageIndex }} of {{ pageCount }}</div>
						</div>
					</header>

					<!-- LEADING PLACED / FULL-WIDTH SECTIONS (BEFORE COLUMNS) -->
					<div class="spotlight-layout classic-grid-sections" v-if="!isPillarPlay && getLeadingGridSections(pageIndex).length">
						<template v-for="(section, secIdx) in getLeadingGridSections(pageIndex)" :key="'leading-grid-' + secIdx">
							<div
								:class="['columns', 'spotlight-columns', section.type === 'grid' ? 'spotlight-grid' : 'cols-1']"
								:style="section.type === 'grid' ? getSpotlightGridStyle(section) : undefined"
							>
								<TraitSetBlock
									v-for="{ traitSet, index: s } in section.ordered"
									:key="s"
									:character="character"
									:traitSetID="s"
									:submode="submode"
									:editing="editing"
									:viewY="viewY"
									:printBlank="effectivePrintBlank"
									:style="section.cells[s] && section.cells[s].style"
									:class="{ 'trait-set-content': getView(traitSet)?.flex === false }"
									@selectElement="selectElement"
									@updateCharacter="updateCharacter"
									@removeTrait="removeTrait"
									@removeTraitSet="removeTraitSet"
									@addTrait="addTrait"
									@addDieToRoller="emit('addDieToRoller', $event)"
								></TraitSetBlock>
							</div>
						</template>
					</div>

					<!-- COLUMNS: CLASSIC MODE -->
					<div class="columns" v-if="!isPillarPlay && (hasColumnContent(pageIndex) || !getClassicGridSections(pageIndex).length)">

						<div v-for="pageLocation in ['left', 'right']" :class="'column-' + pageLocation">

							<!-- PORTRAIT RING (PAGE 1 RIGHT ONLY) -->
							<div :class="{ 'portrait': true }" v-if="pageIndex === 1 && pageLocation === 'right' && hasRingTrait && ringTraitID > -1">

								<div :class="{ 'portrait-inner': true, 'selected': isSelected(['traitSet', ringTraitID]) }"
									@click.stop="selectElement([ 'traitSet', ringTraitID ])"
								>
									<div :class="'portrait-circle portrait-alignment-' + (getView(ringTraitSet)?.imageConfig?.alignment || getView(portrait)?.alignment || 'top-center')" width="100%" height="100%" :style="'background-image: url(' + safeImageUrl(effectivePortraitUrl) + ');'">
										<img class="portrait-placeholder" v-if="!effectivePortraitUrl" src="images/cortex_prime_logo_light_transparent.png" alt="Portrait placeholder" />
									</div>
								</div>

								<!-- ATTRIBUTES GRID (RING OVERLAY) -->
								<PortraitRing
									v-if="hasRingTrait && ringTraitID > -1"
									ref="ringRef"
									:character="character"
									:editing="editing"
									:submode="submode"
									:viewY="viewY"
									:ringTraitID="ringTraitID"
									@selectElement="selectElement"
									@updateCharacter="updateCharacter"
									@addDieToRoller="emit('addDieToRoller', $event)"
									@removeTrait="removeTrait"
								/>

							</div>

							<!-- ATTRIBUTES -->
							<div :class="{ 'attributes': true, 'vertical': ringTraits.length > 5 }" v-if="pageLocation === 'right' && hasRingTrait && ringTraitID > -1">

								<!-- BUTTON: ADD ATTRIBUTE / SCALE DIE (EDIT) OR POOL (PLAY) -->
								<transition appear>
							<div class="preview-button-container"
								v-if="pageLocation === 'right'"
							>
									<div class="preview-button-container-inner" v-if="submode === 'edit'">
										<div class="preview-button"
											@click.stop="addTrait( ringTraitID )"
										>
											<span><i class="fas fa-plus"></i> {{ ringNoun }}</span>
										</div>
										<div class="preview-button"
											v-if="!scaleDieValue"
											@click.stop="ringRef?.setScaleDieValue(8); selectElement(['scaleDie'])"
										>
											<span><i class="fas fa-plus"></i> Scale Die</span>
										</div>
										<div class="preview-button"
											@click.stop="selectElement(['traitSet', ringTraitID])"
										>
											<span><i class="fas fa-cog"></i> Settings</span>
										</div>
									</div>
									<div class="preview-button-container-inner" v-if="submode === 'play' && isRingPool && ringTraits.length > 0">
										<div class="preview-button"
											@click.stop="ringRef?.handleTraitClick( ringTraitID, 0, ringTraits[0] )"
											title="Add all pool dice to roller"
										>
											<span><i class="fas fa-dice-d20"></i> Roll Pool ({{ ringTraits.length }} dice)</span>
										</div>
									</div>
								</div>
								</transition>
							</div>
								

							<template v-for="(traitSet, s) in traitSets" :key="s">
								<TraitSetBlock
									v-if="s !== ringTraitID && ((getView(traitSet)?.page || 1) === pageIndex) && getTraitSetColumn(traitSet) === pageLocation && isColumnSet(traitSet)"
									:character="character" :traitSetID="s" :submode="submode" :editing="editing" :viewY="viewY" :printBlank="effectivePrintBlank" @selectElement="selectElement" @updateCharacter="updateCharacter" @removeTrait="removeTrait" @removeTraitSet="removeTraitSet" @addTrait="addTrait" @addDieToRoller="emit('addDieToRoller', $event)"
								></TraitSetBlock>
							</template>

							<!-- BUTTON: ADD TRAIT SET -->
							<transition appear>
							<div class="preview-button-container"
								v-if="submode === 'edit'"
							>
								<div class="preview-button-container-inner">
									<div class="preview-button"
										@click.stop="addTraitSet( pageIndex, pageLocation )"
									>
										<span><i class="fas fa-plus"></i> Trait Set{{ pageCount > 1 ? ' (P' + pageIndex + ')' : '' }}</span>
									</div>
									<div class="preview-button preview-button-secondary"
										@click.stop="toggleInlineAdd( pageIndex, pageLocation )"
									>
										<span><i class="fas fa-layer-group"></i> Presets</span>
									</div>
								</div>

								<!-- INLINE NON-MODAL ADD AREA (CLASSIC) -->
								<div
									class="inline-add-set-area classic-inline-add"
									v-if="showInlineAddSet && inlineAddPage === pageIndex && inlineAddLocation === pageLocation"
								>
									<div class="inline-add-header">
										<span class="inline-add-title"><i class="fas fa-layer-group"></i> Add Trait Set</span>
										<div class="inline-add-quick-actions">
											<button type="button" class="btn-inline-quick" @click.stop="addTraitSet(pageIndex, pageLocation)">
												<i class="fas fa-plus"></i> Blank
											</button>
											<button type="button" class="btn-inline-quick btn-inline-mini" @click.stop="openMiniFromInline">
												<i class="fas fa-th-large"></i> Mini
											</button>
											<button type="button" class="btn-inline-close" title="Close" @click.stop="showInlineAddSet = false">
												<i class="fas fa-times"></i>
											</button>
										</div>
									</div>
									<div class="inline-presets-list">
										<div class="inline-preset-card" v-for="preset in inlineBuiltInPresets" :key="'classic-builtin-' + preset.id">
											<div class="inline-preset-main">
												<div class="inline-preset-name">{{ preset.label }}</div>
												<div class="inline-preset-blurb" v-if="preset.blurb">{{ preset.blurb }}</div>
											</div>
											<button type="button" class="btn-inline-add" @click.stop="addPresetSet(preset, pageLocation, pageIndex)">
												<i class="fas fa-plus"></i> Add
											</button>
										</div>
										<div class="inline-preset-card" v-for="preset in inlineCustomPresets" :key="'classic-custom-' + preset.id">
											<div class="inline-preset-main">
												<div class="inline-preset-name">{{ preset.label }}</div>
												<div class="inline-preset-blurb" v-if="preset.blurb">{{ preset.blurb }}</div>
											</div>
											<div class="inline-preset-actions">
												<button type="button" class="btn-inline-delete" title="Delete custom preset" @click.stop="removeInlineCustomPreset(preset.id)">
													<i class="fas fa-trash-alt"></i>
												</button>
												<button type="button" class="btn-inline-add" @click.stop="addPresetSet(preset, pageLocation, pageIndex)">
													<i class="fas fa-plus"></i> Add
												</button>
											</div>
										</div>
									</div>
								</div>
							</div>
							</transition>
							
						</div>

					</div> <!-- .columns -->

					<!-- TRAILING PLACED (GRID) SETS -->
					<div class="spotlight-layout classic-grid-sections" v-if="!isPillarPlay && (getTrailingGridSections(pageIndex).length || !hasColumnContent(pageIndex))">
						<template v-for="(section, secIdx) in getTrailingGridSections(pageIndex)" :key="'classic-grid-' + secIdx">
							<div
								:class="['columns', 'spotlight-columns', section.type === 'grid' ? 'spotlight-grid' : 'cols-1']"
								:style="section.type === 'grid' ? getSpotlightGridStyle(section) : undefined"
							>
								<TraitSetBlock
									v-for="{ traitSet, index: s } in section.ordered"
									:key="s"
									:character="character"
									:traitSetID="s"
									:submode="submode"
									:editing="editing"
									:viewY="viewY"
									:printBlank="effectivePrintBlank"
									:style="section.cells[s] && section.cells[s].style"
									:class="{ 'trait-set-content': getView(traitSet)?.flex === false }"
									@selectElement="selectElement"
									@updateCharacter="updateCharacter"
									@removeTrait="removeTrait"
									@removeTraitSet="removeTraitSet"
									@addTrait="addTrait"
									@addDieToRoller="emit('addDieToRoller', $event)"
								></TraitSetBlock>
							</div>
						</template>
<!-- BUTTON: ADD TRAIT SET IN SPOTLIGHT MODE -->
						<div
							class="spotlight-add-set-bar"
							v-if="submode === 'edit'"
						>
							<div class="add-set-slot slot-center">
								<button type="button" class="btn-spotlight-add" @click.stop="addTraitSet(pageIndex)">
									<i class="fas fa-plus"></i> Add Set
								</button>
								<button type="button" class="btn-spotlight-add btn-presets-toggle" @click.stop="toggleInlineAdd(pageIndex)">
									<i class="fas fa-layer-group"></i> Presets
								</button>
							</div>

							<!-- INLINE NON-MODAL ADD AREA -->
							<div
								class="inline-add-set-area"
								v-if="showInlineAddSet"
							>
								<div class="inline-add-header">
									<span class="inline-add-title"><i class="fas fa-layer-group"></i> Add Trait Set</span>
									<div class="inline-add-quick-actions">
										<button type="button" class="btn-inline-quick" @click.stop="addTraitSet(pageIndex)">
											<i class="fas fa-plus"></i> Blank Set
										</button>
										<button type="button" class="btn-inline-quick btn-inline-mini" @click.stop="openMiniFromInline">
											<i class="fas fa-th-large"></i> New Card in Mini
										</button>
										<button type="button" class="btn-inline-close" title="Close" @click.stop="showInlineAddSet = false">
											<i class="fas fa-times"></i>
										</button>
									</div>
								</div>
								<div class="inline-presets-list">
									<div class="inline-preset-card" v-for="preset in inlineBuiltInPresets" :key="'builtin-' + preset.id">
										<div class="inline-preset-main">
											<div class="inline-preset-name">{{ preset.label }}</div>
											<div class="inline-preset-blurb" v-if="preset.blurb">{{ preset.blurb }}</div>
										</div>
										<button type="button" class="btn-inline-add" @click.stop="addPresetSet(preset, undefined, pageIndex)">
											<i class="fas fa-plus"></i> Add Preset
										</button>
									</div>
									<div class="inline-preset-card" v-for="preset in inlineCustomPresets" :key="'custom-' + preset.id">
										<div class="inline-preset-main">
											<div class="inline-preset-name">{{ preset.label }}</div>
											<div class="inline-preset-blurb" v-if="preset.blurb">{{ preset.blurb }}</div>
										</div>
										<div class="inline-preset-actions">
											<button type="button" class="btn-inline-delete" title="Delete custom preset" @click.stop="removeInlineCustomPreset(preset.id)">
												<i class="fas fa-trash-alt"></i>
											</button>
											<button type="button" class="btn-inline-add" @click.stop="addPresetSet(preset, undefined, pageIndex)">
												<i class="fas fa-plus"></i> Add Preset
											</button>
										</div>
									</div>
								</div>
							</div>
						</div>
										</div>

					<!-- CLASSIC FULL-WIDTH SETS -->
<div class="classic-full-band" v-if="!isPillarPlay && hasClassicUnplacedFullSets(pageIndex)">
		<template v-for="(traitSet, s) in traitSets" :key="'full-' + s">
			<TraitSetBlock
				v-if="s !== ringTraitID && ((getView(traitSet)?.page || 1) === pageIndex) && isFullWidthClassic(traitSet) && !hasPlace(traitSet)"
								:character="character" :traitSetID="s" :submode="submode" :editing="editing" :viewY="viewY" :printBlank="effectivePrintBlank" @selectElement="selectElement" @updateCharacter="updateCharacter" @removeTrait="removeTrait" @removeTraitSet="removeTraitSet" @addTrait="addTrait" @addDieToRoller="emit('addDieToRoller', $event)"
							></TraitSetBlock>
						</template>
					</div> <!-- .classic-full-band -->

					</div> <!-- .mobile-carousel-track -->

				</div> <!-- .page-inner -->
			</div> <!-- .page -->
		</div> <!-- .pages -->

		<teleport to="body">
			<transition>
				<div class="modal-veil" v-if="showPlayPresetPicker" @click.stop="showPlayPresetPicker = false"></div>
			</transition>
			<transition>
				<aside class="modal modal-style-gallery" v-if="showPlayPresetPicker">
					<div class="modal-close" @click.prevent="showPlayPresetPicker = false"><i class="fas fa-times"></i></div>
					<div class="modal-inner">
						<div style="display: flex; align-items: center; justify-content: space-between; gap: 0.75rem;">
							<h2><i class="fas fa-gamepad"></i> Add Play Card</h2>
							<button type="button" class="btn-gallery-add btn-open-mini" style="width: auto; padding: 0.35rem 0.75rem;" @click.stop="openPlayMini">
								<i class="fas fa-th-large"></i> New Card in Mini
							</button>
						</div>
						<p class="gallery-sub">Drop a temporary or reusable set card into the active session.</p>
						<div class="style-gallery-grid">
							<div class="style-gallery-card" v-for="preset in playBuiltInPresets" :key="'play-builtin-' + preset.id">
								<div class="style-gallery-name">{{ preset.label }}</div>
								<div class="style-gallery-blurb" v-if="preset.blurb">{{ preset.blurb }}</div>
								<button type="button" class="btn-gallery-add" @click.stop="addPresetSet(preset)">
									<i class="fas fa-plus"></i> Add to Session
								</button>
							</div>
							<div class="style-gallery-card" v-for="preset in playCustomPresets" :key="'play-custom-' + preset.id">
								<div style="display: flex; align-items: center; justify-content: space-between; gap: 0.35rem;">
									<div class="style-gallery-name">{{ preset.label }}</div>
									<button type="button" class="editor-header-btn" title="Delete saved preset" @click.stop="removePlayCustomPreset(preset.id)">
										<i class="fas fa-trash-alt"></i>
									</button>
								</div>
								<div class="style-gallery-blurb" v-if="preset.blurb">{{ preset.blurb }}</div>
								<button type="button" class="btn-gallery-add" @click.stop="addPresetSet(preset)">
									<i class="fas fa-plus"></i> Add to Session
								</button>
							</div>
						</div>
					</div>
				</aside>
			</transition>
			<TraitSetMini
				v-if="showPlayMini"
				@close="showPlayMini = false"
				@saved="playCustomPresets = cortexFunctions.getCustomSetPresets()"
			/>
		</teleport>
	</section>
</template>

