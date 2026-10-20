<script setup lang="ts">
import { computed, getCurrentInstance, onMounted, ref, watch } from 'vue';
import { cortexFunctions } from './functions.ts';
import { getView, ensureView, type Character, type TraitSet, type Trait, type ViewBag, type CortexToolkitCustom } from './model.ts';
import {
	getTraitSetColumn as gridTraitSetColumn,
	isFullWidthClassic as gridIsFullWidthClassic,
	hasClassicFullSets as gridHasClassicFullSets,
	getSpotlightSections as gridGetSpotlightSections,
	getSpotlightGridStyle as gridGetSpotlightGridStyle,
	getSpotlightGridCells as gridGetSpotlightGridCells,
	type SpotlightSection,
	type SpotlightCell,
} from './spotlight-grid.ts';
import TraitSetBlock from './trait-set-block.vue';
import StyleGallery from './style-gallery.vue';
import PrintToolbar from './print-toolbar.vue';
import RingAttributes from './ring-attributes.vue';

const props = defineProps<{
	submode?: string | null;
	character?: Character;
	editing?: unknown[] | null;
	viewY?: number | null;
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
const printStyle = ref<string | null>( null );
const printBlank = ref( false );
const printBW = ref( false );
const designerPrintPreview = ref( false );
const showStyleGallery = ref( false );

const name = computed( () => props.character?.name ?? '' );
const description = computed( () => props.character?.description ?? '' );
const player = computed( () => props.character?.player ?? '' );
const pronouns = computed( () => props.character?.pronouns ?? '' );
const nickname = computed( () => props.character?.nickname ?? getView( props.character )?.nickname ?? '' );
const hasNickname = computed( () => Boolean( nickname.value || ( isSpotlightStyle.value && getView( props.character )?.hasNickname ) ) );
// Name-block field labels are editable (Name itself is fixed); games like
// Strange Towns relabel Pronouns to Ruin. Stored in the character view.
const nameLabels = computed( () => getView( props.character )?.nameLabels ?? {} );
function nameLabel( key: 'nickname' | 'pronouns' | 'description', fallback: string ) {
	const custom = ( nameLabels.value as Record<string, unknown> )[ key ];
	if ( typeof custom === 'string' && custom.trim().length ) return custom.trim().toUpperCase();
	return fallback;
}
const nicknameLabel = computed( () => nameLabel( 'nickname', 'NICKNAME' ) );
const pronounsLabel = computed( () => nameLabel( 'pronouns', 'PRONOUNS' ) );
const descriptionLabel = computed( () => nameLabel( 'description', 'DESCRIPTION' ) );
const plotPoints = computed( () => Number( props.character?.plotPoints ) || 0 );
const portrait = computed( () => props.character?.portrait ?? null );
const effectivePortraitUrl = computed( () => portrait.value?.url || '' );
const notes = computed( () => props.character?.notes ?? '' );
const game = computed( () => props.character?.game ?? '' );
const traitSets = computed( () => props.character?.traitSets ?? [] );

const ringTraitSetIndex = computed( () => {
	let idx = traitSets.value.findIndex( ( ts ) => {
		const view = getView( ts );
		const body = view?.style?.body;
		if ( body === 'portrait-ring' || body === 'attributes' ) return true;
		if ( cortexFunctions.getRingTrait( ts ) === true ) return true;
		if ( view?.location === 'attributes' && cortexFunctions.getRingTrait( ts ) !== false ) return true;
		return false;
	} );
	if ( idx !== -1 ) return idx;

	idx = traitSets.value.findIndex( ( ts ) => {
		const view = getView( ts );
		const isAttr = view?.isAttributes ||
			ts.nounSingular?.toLowerCase() === 'attribute' ||
			ts.name?.trim().toLowerCase() === 'attributes';
		if ( !isAttr ) return false;
		if ( cortexFunctions.getRingTrait( ts ) === false ) return false;
		const body = view?.style?.body;
		return !body || body === 'default' || body === 'attributes' || body === 'portrait-ring';
	} );
	return idx;
} );

const explicitRingSetIndex = computed( () => traitSets.value.findIndex( ( ts ) => {
	const view = getView( ts );
	const body = view?.style?.body;
	if ( body === 'portrait-ring' || body === 'attributes' ) return true;
	if ( cortexFunctions.getRingTrait( ts ) === true ) return true;
	if ( view?.location === 'attributes' && cortexFunctions.getRingTrait( ts ) !== false ) return true;
	return false;
} ) );

const hasRingTrait = computed( () => {
	if ( isSpotlightStyle.value ) return false;
	if ( explicitRingSetIndex.value !== -1 ) return true;
	const pSize = getView( portrait.value )?.size;
	if ( pSize === 'spotlight' || pSize === 'none' ) return false;
	return ringTraitSetIndex.value !== -1;
} );

const ringTraitID = computed( () => ( hasRingTrait.value ? ringTraitSetIndex.value : -1 ) );
const ringTraitSet = computed( () => ( hasRingTrait.value ? traitSets.value[ ringTraitID.value ] : null ) );
const isRingChallengePool = computed( () => {
	const ts = ringTraitSet.value;
	const view = getView( ts );
	return Boolean( view?.isChallengePool || view?.challengePool );
} );
const ringNounSingular = computed( () => {
	const ts = ringTraitSet.value;
	return ( ts?.nounSingular && ts.nounSingular.length ) ? ts.nounSingular : 'Attribute';
} );
const scaleTrait = computed( () => {
	const attrSet = ringTraitSet.value;
	if ( !attrSet || !Array.isArray( attrSet.traits ) ) return null;
	return attrSet.traits.find( ( t ) => t.name?.trim().toLowerCase() === 'scale' || t.custom?.isScale );
} );
const attributes = computed( () => {
	if ( !hasRingTrait.value ) return [];
	const all = ringTraitSet.value?.traits || [];
	return all.filter( ( t ) => !( t.name?.trim().toLowerCase() === 'scale' || t.custom?.isScale ) );
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
// (ring: attributes ring + scale die + drag now live in ring-attributes.vue)

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

const sheetStyle = computed( () => {
	if ( props.submode === 'print' && printStyle.value ) {
		return printStyle.value;
	}
	const charView = getView( props.character );
	const explicit = charView?.sheetStyle;
	if ( explicit ) return explicit;
	if ( charView?.style?.hasAttributes === false ) {
		return 'spotlight';
	}
	if ( charView?.spotlight ) {
		return 'spotlight';
	}
	if ( ( props.character as any )?.sheet?.template ) {
		return 'spotlight';
	}
	return 'classic';
} );

const isSpotlightStyle = computed( () => sheetStyle.value === 'spotlight' );
const isPrintSubmode = computed( () => props.submode === 'print' || designerPrintPreview.value );
const isSpotlightPrintStyle = computed( () => isPrintSubmode.value && isSpotlightStyle.value );
const effectivePrintBW = computed( () => isPrintSubmode.value && printBW.value );
const effectivePrintBlank = computed( () => isPrintSubmode.value && printBlank.value );
const pageJustification = computed( () => getView( props.character )?.pageJustification || 'top-base' );

const nameEditorInitialTab = computed( () => {
	if ( isSelected( [ 'page' ] ) ) return 'page';
	if ( isSelected( [ 'theme' ] ) ) return 'theme';
	if ( isSelected( [ 'dice' ] ) ) return 'dice';
	return 'sheet';
} );

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

const hasHeaderPortrait = computed( () => {
	if ( !isSpotlightStyle.value ) return false;
	const pView = getView( portrait.value );
	const size = pView?.size;
	if ( size === 'none' ) return false;
	const loc = pView?.location;
	if ( loc && loc !== 'header' ) return false;
	return true;
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

function shouldShowClassicPortrait() {
	if ( isSpotlightStyle.value ) return false;
	if ( explicitRingSetIndex.value !== -1 ) return true;
	const s = getView( portrait.value )?.size;
	if ( s === 'none' || s === 'spotlight' ) return false;
	return true;
}

function shouldShowColumnSmallPortrait( pageLocation: string, pageIndex: number ) {
	if ( isSpotlightStyle.value ) return false;
	if ( pageIndex !== 1 ) return false;
	const pView = getView( portrait.value );
	const s = pView?.size;
	const loc = pView?.location;
	if ( s === 'spotlight' && loc === pageLocation ) return true;
	return false;
}

function getSpotlightSections( pageIndex: number ) { return gridGetSpotlightSections( traitSets.value, pageIndex ); }
function getSpotlightGridStyle( section: SpotlightSection ) { return gridGetSpotlightGridStyle( section ); }
function getSpotlightGridCells( section: SpotlightSection ) { return gridGetSpotlightGridCells( section ); }

function renderNameHtml( value: unknown ) {
	if ( !value ) return '';
	return cortexFunctions.renderText( value );
}

function removeHeaderPortrait() {
	const character = props.character as Character;
	if ( !character.portrait ) character.portrait = {};
	character.portrait.url = '';
	ensureView( character.portrait ).size = 'none';
	updateCharacter( character );
	if ( isSelected( [ 'portrait' ] ) ) {
		selectElement( [] );
	}
}

function addHeaderPortrait() {
	const character = props.character as Character;
	if ( !character.portrait ) character.portrait = {};
	const pView = ensureView( character.portrait );
	pView.size = 'spotlight';
	pView.location = 'header';
	updateCharacter( character );
	selectElement( [ 'portrait' ] );
}

// SELECTING
function selectElement( selector: unknown[] ) {
	if ( props.submode === 'edit' ) {
		emit( 'selectElement', selector );
	}
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

	const traitSet: any = structuredClone( cortexFunctions.defaultTraitSet );
	const tsView = ensureView( traitSet );
	tsView.page = page ?? 1;
	if ( !isSpotlightStyle.value && location ) {
		tsView.location = location;
	}

	cortexFunctions.ensureTraitSetIds( { traitSets: [ ...( character.traitSets || [] ), traitSet ] } );
	traitSet.traits.push( structuredClone( cortexFunctions.defaultTrait ) );

	character.traitSets.push( traitSet );

	updateCharacter( character );

	const newTraitSetID = character.traitSets.length - 1;
	selectElement( [ 'traitSet', newTraitSetID ] );
}

function removeTraitSet( traitSetID: number ) {
	clearSelected();

	const character = props.character as Character;

	const entry = cortexFunctions.resolveTemplateFor( character, rootTemplates() );
	cortexFunctions.removeTraitSetFromSheet( character, entry, traitSetID );

	updateCharacter( character );
}

function addGallerySet( styleEntry: { id?: string; name?: string; sing?: string; plur?: string }, location: string, page: number ) {
	const character = props.character as Character;
	if ( !character || !styleEntry ) return;

	const styleId = styleEntry.id || 'default';
	const traitSet: any = structuredClone( cortexFunctions.defaultTraitSet );
	const styleDefaults = cortexFunctions.defaultFeaturesForStyle( styleId );
	traitSet.name = styleEntry.name || 'New trait set';
	traitSet.nounSingular = styleEntry.sing || 'Trait';
	traitSet.nounPlural = styleEntry.plur || 'Traits';
	const tsView = ensureView( traitSet );
	tsView.style = { header: styleId, body: styleId };
	tsView.features = Object.assign( tsView.features || {}, styleDefaults.features );
	if ( styleDefaults.multiDie ) {
		tsView.multiDie = true;
	}
	if ( !isSpotlightStyle.value ) {
		tsView.location = location ?? 'left';
	}
	tsView.page = page ?? 1;
	cortexFunctions.ensureTraitSetIds( { traitSets: [ ...( character.traitSets || [] ), traitSet ] } );
	if ( styleId === 'pips' ) {
		tsView.pips = { count: 25, perRow: 5, connected: true, filled: 0 };
	}
	if ( styleId === 'session-record' || styleId === 'angled-lines' ) {
		tsView.sessionRecord = { count: 20 };
		tsView.reservedSlots = 20;
	}
	if ( styleId !== 'pips' && styleId !== 'notes' && styleId !== 'image' &&
	     styleId !== 'session-record' && styleId !== 'angled-lines' ) {
		const blank: any = structuredClone( cortexFunctions.defaultTrait );
		blank.name = '';
		blank.value = 0;
		blank.dice = [];
		blank.description = '';
		traitSet.traits.push( blank );
	}

	character.traitSets.push( traitSet );

	updateCharacter( character );
	showStyleGallery.value = false;

	const newTraitSetID = character.traitSets.length - 1;
	selectElement( [ 'traitSet', newTraitSetID ] );
}

function getTraitSetRatings( traitSet: TraitSet ) {
	return cortexFunctions.getTraitSetRatings( traitSet );
}

function addTrait( traitSetID: number ) {
	const character = props.character as Character;
	const traitSet = character.traitSets[ traitSetID ];
	const noun = ( traitSet.nounSingular && traitSet.nounSingular.length ) ? traitSet.nounSingular : 'Trait';

	const trait: any = structuredClone( cortexFunctions.defaultTrait );
	trait.name = 'New ' + noun;
	const allowed = cortexFunctions.getTraitSetRatings( traitSet );
	if ( allowed.length > 0 && !allowed.includes( trait.value ) ) {
		trait.value = allowed[ 0 ];
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

onMounted( () => {
	applyFonts();
} );

watch( () => props.character, () => {
	applyFonts();
}, { immediate: true, deep: true } );
</script>

<template>
	<section ref="rootEl" :class="['character-sheet', 'submode-' + submode, 'orientation-' + pageOrientation, { 'spotlight-print-style': isSpotlightPrintStyle, 'spotlight-style': isSpotlightStyle, 'print-blank-mode': effectivePrintBlank, 'print-bw': effectivePrintBW, 'has-watermark': hasAnyWatermark, 'designer-print-preview': designerPrintPreview }]" :style="characterSheetStyle">
	
		<!-- PRINT TOOLBAR -->
		<PrintToolbar
			v-if="submode === 'print'"
			:printStyle="printStyle"
			:sheetStyle="sheetStyle"
			:printBlank="printBlank"
			:printBW="printBW"
			:printPageView="printPageView"
			:pageCount="pageCount"
			@print="print"
			@export="exportCharacter"
			@update:printStyle="printStyle = $event"
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

					<header class="page-header" v-if="pageIndex === 1">

						<!-- SPOTLIGHT HEADER (EDIT, PLAY, PRINT) -->
						<div
							v-if="isSpotlightStyle"
							class="page-header-inner spotlight-header-card"
							:class="{ 'has-portrait': hasHeaderPortrait, 'selected': isSelected(['name']) }"
						>
							<!-- LEFT BOX: NAME | PRONOUNS (TRAIT SET STYLE) -->
							<div class="spotlight-header-meta-box trait-set-box" @click.stop="selectElement(['name'])">
								<div class="spotlight-meta-name-cell">
									<div class="spotlight-cell-header">
										<span class="spotlight-cell-label">NAME</span>
										<span class="spotlight-cell-sublabel" v-if="player && !printBlank">PLAYER: {{ player }}</span>
									</div>
									<div class="spotlight-cell-content name-content" v-if="!printBlank && name" v-html="renderNameHtml(name)"></div>
									<div class="spotlight-blank-line" v-else-if="printBlank"></div>
									<div class="spotlight-cell-content name-content placeholder-dim" v-else-if="submode === 'edit'">Click to set name...</div>
									<div class="spotlight-blank-line" v-else></div>
								</div>

								<div class="spotlight-meta-divider"></div>

								<div class="spotlight-meta-nickname-cell" v-if="hasNickname">
									<span class="spotlight-cell-label">{{ nicknameLabel }}</span>
									<span class="spotlight-nickname-val" v-if="!printBlank && nickname" v-html="renderText(nickname)"></span>
									<span class="spotlight-blank-line" v-else-if="printBlank"></span>
									<span class="spotlight-nickname-val placeholder-dim" v-else-if="submode === 'edit'">Click to set...</span>
									<span class="spotlight-blank-line" v-else></span>
								</div>

								<div class="spotlight-meta-divider" v-if="hasNickname"></div>

								<div class="spotlight-meta-pronoun-cell">
									<span class="spotlight-cell-label">{{ pronounsLabel }}</span>
									<span class="spotlight-pronoun-val" v-if="!printBlank && pronouns" v-html="renderText(pronouns)"></span>
									<span class="spotlight-blank-line" v-else-if="printBlank"></span>
									<span class="spotlight-pronoun-val placeholder-dim" v-else-if="submode === 'edit'">Click to set...</span>
									<span class="spotlight-blank-line" v-else></span>
								</div>
							</div>

							<!-- CENTER BOX: DESCRIPTION (TRAIT SET STYLE) -->
							<div class="spotlight-header-desc-box trait-set-box" @click.stop="selectElement(['name'])">
								<div class="spotlight-cell-header">
									<label for="spotlight-header-desc" class="spotlight-cell-label">{{ descriptionLabel }}</label>
									<button
										v-if="!hasHeaderPortrait && submode === 'edit' && !designerPrintPreview"
										type="button"
										class="spotlight-add-portrait-link"
										@click.stop="addHeaderPortrait"
										title="Add Portrait to Header"
									>
										<i class="fas fa-plus"></i> Add Portrait
									</button>
								</div>
								<textarea
									v-if="submode === 'edit' && !designerPrintPreview"
									id="spotlight-header-desc"
									name="spotlightHeaderDesc"
									class="spotlight-desc-textarea"
									v-model="descriptionText"
									placeholder="Character description..."
									aria-label="Character description"
									@click.stop
								></textarea>
								<div class="desc-content" v-else-if="!printBlank && description" v-html="renderText(description)"></div>
								<div class="desc-blank-area" v-else>
									<div class="desc-blank-line"></div>
									<div class="desc-blank-line"></div>
								</div>
							</div>

							<!-- RIGHT BOX: PORTRAIT (25% OF HEADER WIDTH, HALF SIZE, REMOVABLE) -->
							<div
								v-if="hasHeaderPortrait"
								class="spotlight-header-portrait-box"
								:class="{ 'selected': isSelected(['portrait']), 'has-image': Boolean(effectivePortraitUrl) }"
								@click.stop="selectElement(['portrait'])"
								title="Click to edit portrait"
							>
								<img
									v-if="effectivePortraitUrl"
									class="portrait-small-image"
									:class="'portrait-alignment-' + (getView(portrait)?.alignment || 'center')"
									:src="safeImageUrl(effectivePortraitUrl)"
									alt="Portrait / Logo"
								/>
								<div v-else class="portrait-small-placeholder" title="Click to add portrait">
									<img class="portrait-placeholder-logo" src="images/cortex_prime_logo_light_transparent.png" alt="Portrait placeholder" />
									<span class="spotlight-add-hint" v-if="submode === 'edit' && !designerPrintPreview">Click to add portrait</span>
								</div>

								<button
									v-if="submode === 'edit' && !designerPrintPreview"
									type="button"
									class="btn-remove-header-portrait"
									@click.stop="removeHeaderPortrait"
									title="Remove portrait"
								>
									<i class="fas fa-trash-alt"></i>
								</button>
							</div>
						</div>

						<!-- CLASSIC HEADER -->
						<div
							v-else
							:class="{'page-header-inner': true, 'selected': isSelected(['name'])}"
							@click.stop="selectElement([ 'name' ])"
						>
							<div>

								<!-- CHARACTER NAME -->
								<div class="title-container">

									<div class="character-game-title" v-if="game" v-html="renderText(game)"></div>

									<div class="title">{{ name }}</div>

									<div class="title-decoration">
										<svg height="4" width="100%"><line x1="0" y1="0" x2="10000" y2="0" style="stroke:#C50852;stroke-width:4pt"/></svg>
									</div>

								</div>

								<!-- CHARACTER DESCRIPTION -->
								<div class="character-meta">
						
									<div class="character-player" v-if="player && player.length">
										<span class="meta-label">Player:</span> <span>{{ player }}</span>
									</div>

									<div class="character-pronouns" v-if="pronouns.length">
										<span v-html="renderText(pronouns)"></span>
									</div>

									<div class="character-description" v-if="description.length">
										<span v-html="renderText(description)"></span>
									</div>

									<div class="character-pp-badge" v-if="submode === 'play'">
										<span class="pp-badge-label">PP</span>
										<button type="button" class="btn-pp-step" @click.stop="adjustPlotPoints(-1)" :disabled="plotPoints <= 0" title="Spend Plot Point">-</button>
										<span class="pp-count">{{ plotPoints }}</span>
										<button type="button" class="btn-pp-step" @click.stop="adjustPlotPoints(1)" title="Gain Plot Point">+</button>
									</div>

									<div class="character-notes-summary" v-if="notes && notes.length">
										<div class="character-notes-body" v-html="renderNotesText(notes)"></div>
									</div>
			
								</div>

							</div>
						</div>
					</header>

					<!-- PAGE 2+ HEADER -->
					<header class="page-header page-2-header" v-if="pageIndex > 1">
						<div class="page-2-header-inner">
							<div class="page-2-title">{{ name }}</div>
							<div class="page-2-badge">{{ game ? game + ' — ' : '' }}Page {{ pageIndex }} of {{ pageCount }}</div>
						</div>
					</header>

					<!-- SPOTLIGHT MODE LAYOUT (NESTED GRIDS, EXPLICIT COORDINATES) -->
					<div v-if="isSpotlightStyle" class="spotlight-layout">
						<template v-for="(section, secIdx) in getSpotlightSections(pageIndex)" :key="secIdx">
							<div
								v-if="section.type === 'full-width'"
								:class="['columns', 'spotlight-columns', 'spotlight-full-width']"
							>
								<div :class="['spotlight-column', 'spotlight-full-column']">
									<template v-for="{ traitSet, index: s } in section.ordered" :key="s">
										<TraitSetBlock :character="character" :traitSetID="s" :submode="submode" :editing="editing" :viewY="viewY" :printBlank="effectivePrintBlank" :designerPrintPreview="designerPrintPreview" :printStyle="printStyle" @selectElement="selectElement" @updateCharacter="updateCharacter" @removeTrait="removeTrait" @removeTraitSet="removeTraitSet" @addTrait="addTrait" @addDieToRoller="emit('addDieToRoller', $event)"></TraitSetBlock>
									</template>
								</div>
							</div>
							<div
								v-else
								:class="['columns', 'spotlight-columns', 'spotlight-grid']"
								:style="getSpotlightGridStyle(section)"
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
									:designerPrintPreview="designerPrintPreview"
									:printStyle="printStyle"
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
							v-if="submode === 'edit' && !designerPrintPreview"
						>
						<div class="add-set-slot slot-center">
							<button type="button" class="btn-spotlight-add" @click.stop="addTraitSet(pageIndex)">
								<i class="fas fa-plus"></i> Add Set
							</button>
						</div>
						</div>
					</div>

					<!-- COLUMNS: CLASSIC MODE -->
					<div class="columns" v-else>

						<div v-for="pageLocation in ['left', 'right']" :class="'column-' + pageLocation">

							<!-- SMALL PORTRAIT (COLUMN PLACEMENT) -->
							<div
								class="portrait-small-card"
								:class="{ 'selected': isSelected(['portrait']) }"
								v-if="shouldShowColumnSmallPortrait(pageLocation, pageIndex)"
								@click.stop="selectElement([ 'portrait' ])"
								title="Click to edit portrait"
							>
								<img
									v-if="effectivePortraitUrl"
									class="portrait-small-image"
									:class="'portrait-alignment-' + (getView(portrait)?.alignment || 'top-center')"
									:src="safeImageUrl(effectivePortraitUrl)"
									alt="Portrait"
								/>
								<div v-else class="portrait-small-placeholder">
									<img class="portrait-placeholder-logo" src="images/cortex_prime_logo_light_transparent.png" alt="Portrait placeholder" />
								</div>
							</div>

							<!-- CLASSIC PORTRAIT & RING (PAGE 1 RIGHT ONLY) -->
							<div :class="{ 'portrait': true, 'portrait-standalone': !hasRingTrait }" v-if="pageIndex === 1 && pageLocation === 'right' && shouldShowClassicPortrait()">

								<div :class="{ 'portrait-inner': true, 'selected': isSelected(['portrait']) }"
									@click.stop="selectElement([ 'portrait' ])"
								>
									<div :class="'portrait-circle portrait-alignment-' + (getView(portrait)?.alignment || 'top-center')" width="100%" height="100%" :style="'background-image: url(' + safeImageUrl(effectivePortraitUrl) + ');'">
										<img class="portrait-placeholder" v-if="!effectivePortraitUrl" src="images/cortex_prime_logo_light_transparent.png" alt="Portrait placeholder" />
									</div>
								</div>

								<!-- ATTRIBUTES GRID (RING OVERLAY) -->
								<RingAttributes
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
							<div :class="{ 'attributes': true, 'vertical': attributes.length > 5 }" v-if="pageLocation === 'right' && hasRingTrait && ringTraitID > -1">

								<!-- BUTTON: ADD ATTRIBUTE / SCALE DIE (EDIT) OR CHALLENGE POOL (PLAY) -->
								<transition appear>
								<div class="preview-button-container"
									v-if="pageLocation === 'right' && !designerPrintPreview"
								>
									<div class="preview-button-container-inner" v-show="submode === 'edit' && !designerPrintPreview">
										<div class="preview-button"
											@click.stop="addTrait( ringTraitID )"
										>
											<span><i class="fas fa-plus"></i> {{ ringNounSingular }}</span>
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
									<div class="preview-button-container-inner" v-if="submode === 'play' && isRingChallengePool && attributes.length > 0">
										<div class="preview-button"
											@click.stop="ringRef?.handleAttributeClick( ringTraitID, 0, attributes[0] )"
											title="Add all Challenge Pool dice to roller"
										>
											<span><i class="fas fa-dice-d20"></i> Roll Challenge Pool ({{ attributes.length }} dice)</span>
										</div>
									</div>
								</div>
								</transition>
							</div>
								

							<template v-for="(traitSet, s) in traitSets" :key="s">
								<TraitSetBlock
									v-if="s !== ringTraitID && ((getView(traitSet)?.page || 1) === pageIndex) && getTraitSetColumn(traitSet) === pageLocation && !isFullWidthClassic(traitSet)"
									:character="character" :traitSetID="s" :submode="submode" :editing="editing" :viewY="viewY" :printBlank="effectivePrintBlank" :designerPrintPreview="designerPrintPreview" :printStyle="printStyle" @selectElement="selectElement" @updateCharacter="updateCharacter" @removeTrait="removeTrait" @removeTraitSet="removeTraitSet" @addTrait="addTrait" @addDieToRoller="emit('addDieToRoller', $event)"
								></TraitSetBlock>
							</template>

							<!-- BUTTON: ADD TRAIT SET -->
							<transition appear>
							<div class="preview-button-container"
								v-show="submode === 'edit' && !designerPrintPreview"
							>
								<div class="preview-button-container-inner">
									<div class="preview-button"
										@click.stop="addTraitSet( pageIndex, pageLocation )"
									>
										<span><i class="fas fa-plus"></i> Trait Set{{ pageCount > 1 ? ' (P' + pageIndex + ')' : '' }}</span>
									</div>
								</div>
							</div>
							</transition>
							
						</div>

					</div> <!-- .columns -->

					<!-- CLASSIC FULL-WIDTH SETS -->
					<div class="classic-full-band" v-if="!isSpotlightStyle && hasClassicFullSets(pageIndex)">
						<template v-for="(traitSet, s) in traitSets" :key="'full-' + s">
							<TraitSetBlock
								v-if="s !== ringTraitID && ((getView(traitSet)?.page || 1) === pageIndex) && isFullWidthClassic(traitSet)"
								:character="character" :traitSetID="s" :submode="submode" :editing="editing" :viewY="viewY" :printBlank="effectivePrintBlank" :designerPrintPreview="designerPrintPreview" :printStyle="printStyle" @selectElement="selectElement" @updateCharacter="updateCharacter" @removeTrait="removeTrait" @removeTraitSet="removeTraitSet" @addTrait="addTrait" @addDieToRoller="emit('addDieToRoller', $event)"
							></TraitSetBlock>
						</template>
					</div>

				</div> <!-- .page-inner -->
			</div> <!-- .page -->
		</div> <!-- .pages -->

		<StyleGallery
			v-if="submode === 'edit'"
			:open="showStyleGallery"
			:columnCount="columnCount"
			:pageCount="pageCount"
			:allowCenter="isSpotlightStyle && columnCount === 3"
			@close="showStyleGallery = false"
			@addGallerySet="addGallerySet"
		></StyleGallery>
	</section>
</template>
