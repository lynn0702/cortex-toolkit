<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue';
import { cortexFunctions } from './functions.ts';
import { getView, ensureView } from './model.ts';

interface DicePreset {
	name: string;
	style: string;
	backgroundType: string;
	backgroundColor1: string;
	backgroundColor2: string;
	numeralColor: string;
	borderColor: string;
	borderWidth: number;
	gradientAngle?: number;
	unfilledBackground: string;
	unfilledNumeral: string;
	unfilledBorder: string;
}

const DICE_PRESETS: DicePreset[] = [
	{
		name: 'Classic Ink',
		style: 'custom',
		backgroundType: 'solid',
		backgroundColor1: '#ffffff',
		backgroundColor2: '#f1f5f9',
		numeralColor: '#000000',
		borderColor: '#000000',
		borderWidth: 1,
		unfilledBackground: 'none',
		unfilledNumeral: '#000000',
		unfilledBorder: '#000000'
	},
	{
		name: 'Inverted Noir',
		style: 'custom',
		backgroundType: 'solid',
		backgroundColor1: '#000000',
		backgroundColor2: '#0f172a',
		numeralColor: '#ffffff',
		borderColor: '#ffffff',
		borderWidth: 1.7,
		unfilledBackground: 'none',
		unfilledNumeral: '#334155',
		unfilledBorder: '#334155'
	},
	{
		name: 'Cyberpunk Neon',
		style: 'custom',
		backgroundType: 'gradient',
		backgroundColor1: '#06b6d4',
		backgroundColor2: '#d946ef',
		gradientAngle: 135,
		numeralColor: '#ffffff',
		borderColor: '#06b6d4',
		borderWidth: 2,
		unfilledBackground: 'none',
		unfilledNumeral: '#0284c7',
		unfilledBorder: '#0284c7'
	},
	{
		name: 'Solar Flare',
		style: 'custom',
		backgroundType: 'gradient',
		backgroundColor1: '#f59e0b',
		backgroundColor2: '#dc2626',
		gradientAngle: 135,
		numeralColor: '#ffffff',
		borderColor: '#f59e0b',
		borderWidth: 1.8,
		unfilledBackground: 'none',
		unfilledNumeral: '#d97706',
		unfilledBorder: '#d97706'
	},
	{
		name: 'Arcane Violet',
		style: 'custom',
		backgroundType: 'gradient',
		backgroundColor1: '#8b5cf6',
		backgroundColor2: '#3b82f6',
		gradientAngle: 135,
		numeralColor: '#ffffff',
		borderColor: '#c084fc',
		borderWidth: 1.8,
		unfilledBackground: 'none',
		unfilledNumeral: '#7c3aed',
		unfilledBorder: '#7c3aed'
	},
	{
		name: 'Emerald Forge',
		style: 'custom',
		backgroundType: 'gradient',
		backgroundColor1: '#10b981',
		backgroundColor2: '#047857',
		gradientAngle: 135,
		numeralColor: '#ffffff',
		borderColor: '#34d399',
		borderWidth: 1.8,
		unfilledBackground: 'none',
		unfilledNumeral: '#059669',
		unfilledBorder: '#059669'
	}
];

const props = withDefaults( defineProps<{
	character: any;
	open: boolean;
	initialTab?: string;
}>(), {
	initialTab: 'sheet',
} );

const emit = defineEmits<{
	( e: 'selectElement', selector: any[] ): void;
	( e: 'updateCharacter', character: any ): void;
	( e: 'saveSheetTemplate' ): void;
	( e: 'exportSheetTemplate' ): void;
}>();

const currentTab = ref( 'sheet' );
const fontPreview = ref<{ heading: string; primary: string; secondary: string }>( { heading: '', primary: '', secondary: '' } );
const watermarkError = ref( '' );
const fontUploadError = ref( '' );
const dicePresets = DICE_PRESETS;
const presetColors = [
	{ name: 'Cortex Sky', hex: '#0ea5e9' },
	{ name: 'Crimson Ruby', hex: '#e11d48' },
	{ name: 'Emerald', hex: '#10b981' },
	{ name: 'Indigo Purple', hex: '#6366f1' },
	{ name: 'Amber Gold', hex: '#f59e0b' },
	{ name: 'Rose Coral', hex: '#f43f5e' },
	{ name: 'Teal Cyan', hex: '#14b8a6' },
	{ name: 'Slate Dark', hex: '#475569' }
];

const inputName = ref<HTMLInputElement | null>( null );
const watermarkFileInput = ref<HTMLInputElement | null>( null );
const fontFileInput = ref<HTMLInputElement | null>( null );

function targetValue( e: Event ) {
	return ( e.target as HTMLInputElement ).value;
}

const name = computed( {
	get() {
		return props.character?.name ?? '';
	},
	set( val: string ) {
		setCharacterProperty( 'name', val );
	},
} );

const game = computed( {
	get() {
		return props.character?.game ?? '';
	},
	set( val: string ) {
		setCharacterProperty( 'game', val );
	},
} );

const player = computed( {
	get() {
		return props.character?.player ?? '';
	},
	set( val: string ) {
		setCharacterProperty( 'player', val );
	},
} );

const nickname = computed( {
	get() {
		return props.character?.nickname ?? getView( props.character )?.nickname ?? '';
	},
	set( val: string ) {
		setCharacterProperty( 'nickname', val );
		ensureView( props.character ).nickname = val;
	},
} );

const description = computed( {
	get() {
		return props.character?.description ?? '';
	},
	set( val: string ) {
		setCharacterProperty( 'description', val );
	},
} );

const pronouns = computed( {
	get() {
		return props.character?.pronouns ?? '';
	},
	set( val: string ) {
		setCharacterProperty( 'pronouns', val );
	},
} );

const notes = computed( {
	get() {
		return props.character?.notes ?? '';
	},
	set( val: string ) {
		setCharacterProperty( 'notes', val );
	},
} );

const plotPoints = computed( {
	get() {
		return Number( props.character?.plotPoints ) || 0;
	},
	set( val: any ) {
		setCharacterProperty( 'plotPoints', Math.max( 0, parseInt( val, 10 ) || 0 ) );
	},
} );

const sheetStyle = computed( {
	get() {
		const s = getView( props.character )?.sheetStyle;
		if ( s === 'spotlight' || s === 'classic' ) return s;
		if ( getView( props.character )?.style?.body === 'spotlight' ) return 'spotlight';
		if ( getView( props.character )?.style?.hasAttributes === false ) return 'spotlight';
		return 'classic';
	},
	set( style: string ) {
		if ( !props.character ) return;
		const view = ensureView( props.character );
		if ( !view.style ) view.style = {};
		view.style.body = style;
		view.style.hasAttributes = ( style !== 'spotlight' );
		emit( 'updateCharacter', props.character );
	},
} );

const pageCount = computed( {
	get() {
		return Math.max( 1, Number( getView( props.character )?.pageCount ) || 1 );
	},
	set( count: any ) {
		if ( !props.character ) return;
		ensureView( props.character ).pageCount = Math.max( 1, parseInt( count, 10 ) || 1 );
		emit( 'updateCharacter', props.character );
	},
} );

const columnCount = computed( {
	get() {
		const c = Number( getView( props.character )?.columns );
		return ( c === 2 || c === 3 ) ? c : 2;
	},
	set( count: any ) {
		if ( !props.character ) return;
		ensureView( props.character ).columns = Number( count ) || 2;
		emit( 'updateCharacter', props.character );
	},
} );

// Per-page override: page 2 may run a different column grid.
// Null/0 = same as page 1.
const columnsPage2 = computed( {
	get() {
		const v = Number( getView( props.character )?.columnsPage2 );
		return ( v === 2 || v === 3 ) ? v : 0;
	},
	set( count: any ) {
		if ( !props.character ) return;
		if ( count === 2 || count === 3 ) ensureView( props.character ).columnsPage2 = Number( count );
		else delete ensureView( props.character ).columnsPage2;
		emit( 'updateCharacter', props.character );
	},
} );

const pageOrientation = computed( {
	get() {
		return getView( props.character )?.pageOrientation || getView( props.character )?.orientation || 'portrait';
	},
	set( val: string ) {
		if ( !props.character ) return;
		ensureView( props.character ).pageOrientation = val === 'landscape' ? 'landscape' : 'portrait';
		emit( 'updateCharacter', props.character );
	},
} );

// Static id of the sheet template this character's layout resolves
// against (values not set locally fall through to the template).
const sheetTemplateId = computed( () => {
	const t = props.character?.sheet?.template;
	if ( !t ) return '';
	if ( typeof t === 'string' ) return t;
	return t.id || '';
} );

const pageJustification = computed( {
	get() {
		return getView( props.character )?.pageJustification || 'top-base';
	},
	set( mode: string ) {
		if ( !props.character ) return;
		ensureView( props.character ).pageJustification = mode;
		emit( 'updateCharacter', props.character );
	},
} );

const accentColor = computed( {
	get() {
		return getView( props.character )?.accentColor || '#0ea5e9';
	},
	set( val: string ) {
		if ( !props.character ) return;
		ensureView( props.character ).accentColor = val;
		emit( 'updateCharacter', props.character );
	},
} );

const primaryColor = computed( {
	get() {
		return getView( props.character )?.primaryColor || accentColor.value;
	},
	set( val: string ) {
		if ( !props.character ) return;
		ensureView( props.character ).primaryColor = val;
		emit( 'updateCharacter', props.character );
	},
} );

const headingFont = computed( {
	get() {
		return getView( props.character )?.theme?.fonts?.heading || 'Josefin Sans';
	},
	set( val: string ) {
		setThemeFont( 'heading', val );
	},
} );

const primaryFont = computed( {
	get() {
		return getView( props.character )?.theme?.fonts?.primary || 'Open Sans';
	},
	set( val: string ) {
		setThemeFont( 'primary', val );
	},
} );

const secondaryFont = computed( {
	get() {
		return getView( props.character )?.theme?.fonts?.secondary || 'Alegreya Sans SC';
	},
	set( val: string ) {
		setThemeFont( 'secondary', val );
	},
} );

const customFontsList = computed( () => ( getView( props.character )?.customFonts || [] ).map( ( f: any ) => f.name ) );

const diceConfig = computed( {
	get() {
		return getView( props.character )?.diceConfig || {
			style: 'default',
			backgroundType: 'solid',
			backgroundColor1: '#ffffff',
			backgroundColor2: '#f1f5f9',
			gradientAngle: 135,
			numeralColor: '#000000',
			borderColor: '#000000',
			borderWidth: 1.7,
			unfilledBackground: 'none',
			unfilledNumeral: '#000000',
			unfilledBorder: '#000000'
		};
	},
	set( cfg: any ) {
		if ( !props.character ) return;
		ensureView( props.character ).diceConfig = { ...cfg };
		if ( typeof window !== 'undefined' ) {
			( window as any ).__cortexActiveDiceConfig = { ...cfg };
		}
		emit( 'updateCharacter', props.character );
	},
} );

const watermarkEnabled = computed( {
	get() {
		return Boolean( getView( props.character )?.watermark?.enabled );
	},
	set( val: any ) {
		setWatermarkProperty( 'enabled', Boolean( val ) );
	},
} );

const watermarkURL = computed( {
	get() {
		return getView( props.character )?.watermark?.url ?? '';
	},
	set( val: string ) {
		setWatermarkProperty( 'url', val );
		if ( val && !watermarkEnabled.value ) {
			setWatermarkProperty( 'enabled', true );
		}
	},
} );

const watermarkOpacity = computed( {
	get() {
		return getView( props.character )?.watermark?.opacity ?? 0.08;
	},
	set( val: any ) {
		setWatermarkProperty( 'opacity', Number( val ) || 0.08 );
	},
} );

const watermarkScale = computed( {
	get() {
		return getView( props.character )?.watermark?.scale ?? 75;
	},
	set( val: any ) {
		setWatermarkProperty( 'scale', Number( val ) || 75 );
	},
} );

const watermarkPage = computed( {
	get() {
		return getView( props.character )?.watermark?.page ?? 'all';
	},
	set( val: string ) {
		setWatermarkProperty( 'page', val );
	},
} );

watch( () => props.open, ( isOpen, wasOpen ) => {
	if ( isOpen && !wasOpen ) {
		if ( props.initialTab ) {
			currentTab.value = props.initialTab;
		}
		if ( currentTab.value === 'sheet' ) {
			focusFirstInput();
		}
	}
} );

watch( () => props.initialTab, ( newTab ) => {
	if ( newTab ) {
		currentTab.value = newTab;
	}
} );

function selectElement( selector: any[] ) {
	emit( 'selectElement', selector );
}

async function focusFirstInput() {
	await nextTick();
	if ( inputName.value ) {
		inputName.value.focus( { preventScroll: true } );
	}
}

function setCharacterProperty( key: string, val: any ) {
	const character = props.character;
	character[ key ] = val;
	updateCharacter( character );
}

function ensureWatermarkStruct() {
	if ( !props.character ) return;
	const view = ensureView( props.character );
	if ( !view.watermark ) {
		view.watermark = {
			enabled: false,
			url: '',
			opacity: 0.08,
			scale: 75,
			page: 'all'
		};
	}
}

function setWatermarkProperty( key: string, val: any ) {
	ensureWatermarkStruct();
	( ensureView( props.character ).watermark as any )[ key ] = val;
	updateCharacter( props.character );
}

function uploadWatermarkStart() {
	watermarkFileInput.value?.click();
}

function uploadWatermarkProcess( event: Event ) {
	const input = event.target as HTMLInputElement;

	watermarkError.value = '';
	if ( !input.files || !input.files.length ) return;
	cortexFunctions.processImageFile( input.files[ 0 ], 1280, 0.8 ).then(
		( dataURL: string ) => {
			watermarkURL.value = dataURL;
			watermarkEnabled.value = true;
			input.value = null as any;
		},
		( error: any ) => {
			watermarkError.value = error?.message || 'Could not process that image.';
			input.value = null as any;
		}
	);
}

function removeWatermark() {
	watermarkURL.value = '';
	watermarkEnabled.value = false;
}

function setAccent( hex: string ) {
	accentColor.value = hex;
}

function resetAccent() {
	if ( !props.character ) return;
	delete ensureView( props.character ).accentColor;
	emit( 'updateCharacter', props.character );
}

function setThemeFont( target: string, fontName: string ) {
	if ( !props.character ) return;
	const view = ensureView( props.character );
	if ( !view.theme ) view.theme = {};
	if ( !view.theme.fonts ) view.theme.fonts = {};
	( view.theme.fonts as any )[ target ] = fontName;
	if ( typeof cortexFunctions !== 'undefined' && cortexFunctions.loadGoogleFont ) {
		cortexFunctions.loadGoogleFont( fontName );
	}
	emit( 'updateCharacter', props.character );
}

function previewFont( target: 'heading' | 'primary' | 'secondary', fontName: string ) {
	fontPreview.value[ target ] = fontName;
	const clean = ( fontName || '' ).trim();
	if ( clean && typeof cortexFunctions !== 'undefined' && cortexFunctions.loadGoogleFont ) {
		cortexFunctions.loadGoogleFont( clean );
	}
}

function triggerFontUpload() {
	fontFileInput.value?.click();
}

function handleFontUpload( event: Event ) {
	const input = event.target as HTMLInputElement;
	const file = input.files?.[ 0 ];
	if ( !file ) return;
	fontUploadError.value = '';
	if ( file.size > 2 * 1024 * 1024 ) {
		fontUploadError.value = 'Font files must be under 2 MB.';
		input.value = null as any;
		return;
	}
	const fontName = file.name.replace( /\.[^/.]+$/, '' ).replace( /[^a-zA-Z0-9_-]/g, ' ' ).trim();
	const reader = new FileReader();
	reader.onload = ( e ) => {
		const base64Data = ( e.target as FileReader ).result as string;
		if ( typeof cortexFunctions !== 'undefined' && cortexFunctions.applyCustomFont ) {
			cortexFunctions.applyCustomFont( fontName, base64Data );
		}
		const view = ensureView( props.character );
		if ( !view.customFonts ) view.customFonts = [];
		view.customFonts.push( { name: fontName, data: base64Data } );
		headingFont.value = fontName;
		emit( 'updateCharacter', props.character );
	};
	reader.readAsDataURL( file );
}

function updateDiceProp( key: string, val: any ) {
	const newCfg = { ...diceConfig.value, style: 'custom', [ key ]: val };
	diceConfig.value = newCfg;
}

function applyDicePreset( preset: any ) {
	const newCfg = { ...diceConfig.value, ...preset, style: 'custom' };
	diceConfig.value = newCfg;
}

function resetDiceConfig() {
	const defaultCfg = {
		style: 'default',
		backgroundType: 'solid',
		backgroundColor1: '#ffffff',
		backgroundColor2: '#f1f5f9',
		gradientAngle: 135,
		numeralColor: '#000000',
		borderColor: '#000000',
		borderWidth: 1,
		unfilledBackground: 'none',
		unfilledNumeral: '#000000',
		unfilledBorder: '#000000'
	};
	diceConfig.value = defaultCfg;
}

function renderDicePreview( size: any, isFilled: any ) {
	if ( typeof cortexFunctions !== 'undefined' && cortexFunctions.renderDieconSVG ) {
		return cortexFunctions.renderDieconSVG( size, isFilled, '', diceConfig.value );
	}
	return size;
}

function updateCharacter( character: any ) {
	emit( 'updateCharacter', character );
}
</script>

<template>
	<aside :class="{ 'editor': true, 'editor-character': true, 'open': open, 'scrollable': true }" @click.stop="">

		<div class="editor-arrow"></div>

		<div class="editor-controls">
			<button @click.stop="selectElement([])" title="Close"><i class="fas fa-times"></i></button>
		</div>

		<div class="editor-inner">
			<div>

				<!-- 4-TIER INSPECTOR TAB NAVIGATION -->
				<div class="editor-tabs">
					<button type="button" class="editor-tab-btn" :class="{ active: currentTab === 'sheet' }" @click.stop="currentTab = 'sheet'" title="Sheet Details">
						<i class="fas fa-id-card"></i> Sheet
					</button>
					<button type="button" class="editor-tab-btn" :class="{ active: currentTab === 'page' }" @click.stop="currentTab = 'page'" title="Page &amp; Columns Justification">
						<i class="fas fa-columns"></i> Page
					</button>
					<button type="button" class="editor-tab-btn" :class="{ active: currentTab === 'theme' }" @click.stop="currentTab = 'theme'" title="Fonts &amp; Colors">
						<i class="fas fa-font"></i> Fonts &amp; Colors
					</button>
					<button type="button" class="editor-tab-btn" :class="{ active: currentTab === 'dice' }" @click.stop="currentTab = 'dice'" title="Dice Editor">
						<i class="fas fa-dice-d20"></i> Dice
					</button>
				</div>

				<div class="editor-fields">

					<!-- ================= TAB 1: SHEET LEVEL ================= -->
					<template v-if="currentTab === 'sheet'">
						<div class="editor-field">
							<label for="char-field-name">Character Name</label>
							<input type="text" id="char-field-name" name="characterName" v-model="name" ref="inputName" placeholder="e.g. Maya Lin, Vance Astro">
						</div>

						<div class="editor-field">
							<label for="char-field-game">Game / Campaign Title</label>
							<input type="text" id="char-field-game" name="gameTitle" v-model="game" placeholder="e.g. Terraverse, Dragon Brigade...">
						</div>

						<div class="editor-field">
							<label for="char-field-nickname">Nickname / Call-Sign</label>
							<input type="text" id="char-field-nickname" name="nickname" v-model="nickname" placeholder="e.g. Apex, Kid">
						</div>

						<div class="editor-field">
							<label for="char-field-player">Player Name</label>
							<input type="text" id="char-field-player" name="playerName" v-model="player" placeholder="Player name...">
						</div>

						<div class="editor-field">
							<label for="char-field-pronouns">Pronouns</label>
							<input type="text" id="char-field-pronouns" name="pronouns" v-model="pronouns" placeholder="e.g. she/her, they/them">
						</div>

						<div class="editor-field">
							<label for="char-field-plot-points">Plot Points</label>
							<input type="number" id="char-field-plot-points" name="plotPoints" min="0" v-model.number="plotPoints">
						</div>

						<div class="editor-field">
							<label for="char-field-description">Description / Bio</label>
							<textarea id="char-field-description" name="description" v-model="description" rows="3" placeholder="Character narrative background..."></textarea>
						</div>

						<div class="editor-field">
							<label for="char-field-sheet-style">Sheet Layout Style</label>
							<select id="char-field-sheet-style" name="sheetStyle" v-model="sheetStyle">
								<option value="spotlight">Spotlight Style</option>
								<option value="classic">Classic Style</option>
							</select>
						</div>

						<div class="editor-field">
							<div class="editor-label">Layout Template</div>
							<div style="font-size: 0.75rem; opacity: 0.85; margin-bottom: 0.4rem;">
								<span v-if="sheetTemplateId">Resolves against <strong>{{ sheetTemplateId }}</strong> — values you haven't changed come from the template, keeping this file clean.</span>
								<span v-else>Inline layout (no template) — everything is stored on this character.</span>
							</div>
							<div class="editor-button-container">
								<div class="editor-button-container-inner">
									<div class="editor-button" @click.stop="emit('saveSheetTemplate')">
										<span><i class="fas fa-bookmark"></i> Save Layout as Template</span>
									</div>
									<div class="editor-button" @click.stop="emit('exportSheetTemplate')">
										<span><i class="fas fa-download"></i> Export Layout File</span>
									</div>
								</div>
							</div>
						</div>

						<!-- WATERMARK CONFIGURATION -->
						<div class="editor-field">
							<label for="name-editor-watermark-enabled">Watermark Image</label>
							<div class="editor-checkbox-row" style="margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.4rem;">
								<input type="checkbox" id="name-editor-watermark-enabled" name="watermarkEnabled" v-model="watermarkEnabled">
								<label for="name-editor-watermark-enabled" style="margin: 0; font-size: 0.8rem; cursor: pointer;">Enable Background Watermark</label>
							</div>

							<div v-if="watermarkEnabled" class="watermark-settings" style="display: flex; flex-direction: column; gap: 0.5rem; padding: 0.5rem; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.15); border-radius: 4px;">
								<div v-if="watermarkURL" style="text-align: center; padding: 0.25rem;">
									<img :src="watermarkURL" style="max-height: 70px; max-width: 100%; object-fit: contain; border-radius: 3px; border: 1px solid #cbd5e1;">
								</div>

								<div class="editor-button-container">
									<div class="editor-button-container-inner">
										<div class="editor-button" @click.prevent="uploadWatermarkStart">
											<span><i class="fas fa-upload"></i> {{ watermarkURL ? 'Change' : 'Upload' }} Watermark</span>
										</div>
										<div class="editor-button" v-if="watermarkURL" style="background: #ef4444; color: #ffffff;" @click.prevent="removeWatermark">
											<span><i class="fas fa-trash-alt"></i> Remove</span>
										</div>
									</div>
								</div>

								<input type="file" id="char-field-watermark-file" name="watermarkFile" ref="watermarkFileInput" style="display:none" @change="uploadWatermarkProcess" accept="image/*">

								<div class="editor-upload-error" v-if="watermarkError">{{ watermarkError }}</div>

								<div>
									<label for="char-field-watermark-url" style="font-size: 0.7rem; color: #94a3b8; display: block; margin-bottom: 0.2rem;">Image URL</label>
									<input type="text" id="char-field-watermark-url" name="watermarkUrl" v-model.lazy="watermarkURL" placeholder="https://example.com/watermark.png">
								</div>

								<div class="slider-row">
									<div class="slider-header" style="display: flex; justify-content: space-between; font-size: 0.7rem; font-weight: 700; color: #cbd5e1; margin-bottom: 0.2rem;">
										<label for="char-field-watermark-opacity">Opacity</label>
										<span>{{ Math.round(watermarkOpacity * 100) }}%</span>
									</div>
									<input type="range" id="char-field-watermark-opacity" name="watermarkOpacity" min="0.02" max="0.35" step="0.01" v-model.number="watermarkOpacity">
								</div>

								<div class="slider-row">
									<div class="slider-header" style="display: flex; justify-content: space-between; font-size: 0.7rem; font-weight: 700; color: #cbd5e1; margin-bottom: 0.2rem;">
										<label for="char-field-watermark-scale">Scale</label>
										<span>{{ watermarkScale }}%</span>
									</div>
									<input type="range" id="char-field-watermark-scale" name="watermarkScale" min="30" max="130" step="5" v-model.number="watermarkScale">
								</div>
							</div>
						</div>
					</template>

					<!-- ================= TAB 2: PAGE LEVEL ================= -->
					<template v-else-if="currentTab === 'page'">
						<div class="editor-field">
							<div class="editor-label">Page Justification</div>
							<div class="editor-segmented-wrap" style="display: flex; flex-direction: column; gap: 0.4rem; margin-top: 0.25rem;">
								<label for="char-field-just-top" style="font-size: 0.8rem; display: flex; align-items: center; gap: 0.4rem; cursor: pointer; color: #f1f5f9;">
									<input type="radio" id="char-field-just-top" name="pageJustification" value="top-base" v-model="pageJustification">
									<strong>Top Base</strong>
								</label>
								<p style="font-size: 0.7rem; color: #94a3b8; margin: 0 0 0 1.4rem; line-height: 1.3;">
									Columns start strictly level at the top base with flush vertical baselines.
								</p>

								<label for="char-field-just-dist" style="font-size: 0.8rem; display: flex; align-items: center; gap: 0.4rem; cursor: pointer; color: #f1f5f9;">
									<input type="radio" id="char-field-just-dist" name="pageJustification" value="distributed" v-model="pageJustification">
									<strong>Distributed</strong>
								</label>
								<p style="font-size: 0.7rem; color: #94a3b8; margin: 0 0 0 1.4rem; line-height: 1.3;">
									Sections distribute vertically to fill the full printable page height.
								</p>
							</div>
						</div>

						<div class="editor-field">
							<label for="char-field-page-orientation">Page Orientation</label>
							<select id="char-field-page-orientation" name="pageOrientation" v-model="pageOrientation">
								<option value="portrait">Portrait</option>
								<option value="landscape">Landscape</option>
							</select>
							<span class="editor-field-hint" style="font-size: 0.72rem; color: #94a3b8; margin-top: 0.25rem; display: block;">
								Selects page aspect ratio and printable page rotation.
							</span>
						</div>

						<div class="editor-field">
							<label for="char-field-column-count">Columns Layout</label>
							<select id="char-field-column-count" name="columnCount" v-model.number="columnCount">
								<option :value="2">2 Columns</option>
								<option :value="3">3 Columns</option>
							</select>
							<span class="editor-field-hint" style="font-size: 0.72rem; color: #94a3b8; margin-top: 0.25rem; display: block;">
								Sets whether the printable sheet layout divides into 2 or 3 parallel columns.
							</span>
						</div>

						<div class="editor-field">
							<label for="char-field-page-count">Page Count</label>
							<select id="char-field-page-count" name="pageCount" v-model.number="pageCount">
								<option :value="1">1 Page</option>
								<option :value="2">2 Pages</option>
							</select>
						</div>

						<div class="editor-field" v-if="pageCount > 1">
							<label for="char-field-columns-p2">Page 2 Columns</label>
							<select id="char-field-columns-p2" name="columnsPage2" v-model.number="columnsPage2">
								<option :value="0">Same as page 1 ({{ columnCount }})</option>
								<option :value="2">2 Columns</option>
								<option :value="3">3 Columns</option>
							</select>
							<span class="editor-field-hint" style="font-size: 0.72rem; color: #94a3b8; margin-top: 0.25rem; display: block;">
								Lets page 2 run a different grid — e.g. 2-column sheets with a 3-across power set page.
							</span>
						</div>
					</template>

					<!-- ================= TAB 3: THEME & FONTS ================= -->
					<template v-else-if="currentTab === 'theme'">
						<div class="editor-field">
							<label for="char-field-accent-color">Theme Accent Color</label>
							<div class="theme-accent-swatches">
								<button
									v-for="swatch in presetColors"
									:key="swatch.hex"
									type="button"
									class="color-swatch-btn"
									:class="{ active: accentColor === swatch.hex }"
									:style="{ backgroundColor: swatch.hex }"
									:title="swatch.name + ' (' + swatch.hex + ')'"
									@click.stop="setAccent(swatch.hex)"
								></button>
							</div>
							<div style="display: flex; align-items: center; gap: 0.5rem; margin-top: 0.35rem;">
								<input type="color" id="char-field-accent-color" name="accentColorPicker" v-model="accentColor" style="width: 2.2rem; height: 1.8rem; padding: 0; border: none; cursor: pointer; border-radius: 4px;">
								<input type="text" id="char-field-accent-hex" name="accentColorHex" v-model="accentColor" placeholder="#0ea5e9" style="font-family: monospace; font-size: 0.8rem;">
								<button type="button" class="editor-tab-btn" style="border: 1px solid rgba(255,255,255,0.2);" @click.stop="resetAccent" title="Reset">
									Reset
								</button>
							</div>
						</div>

						<!-- TYPOGRAPHY PICKERS WITH LIVE PREVIEW -->
						<div class="editor-field">
							<label for="char-field-heading-font">Heading Font</label>
							<div class="font-picker-preview" :style="{ fontFamily: '\'' + (fontPreview.heading || headingFont) + '\', sans-serif' }">
								<span class="font-picker-sample">Ag</span>
								<span class="font-picker-name">{{ fontPreview.heading || headingFont }}</span>
							</div>
							<input type="text" id="char-field-heading-font" name="headingFont" :value="headingFont" @input="previewFont('heading', targetValue($event))" @change="headingFont = targetValue($event)" placeholder="Type any Google Font family, e.g. Syne">
							<div class="font-picker-custom" v-if="customFontsList.length">
								<button type="button" v-for="cf in customFontsList" :key="cf" class="btn-scale-preset" @click.stop="headingFont = cf">{{ cf }}</button>
							</div>
						</div>

						<div class="editor-field">
							<label for="char-field-body-font">Body Font</label>
							<div class="font-picker-preview" :style="{ fontFamily: '\'' + (fontPreview.primary || primaryFont) + '\', sans-serif' }">
								<span class="font-picker-sample">Ag</span>
								<span class="font-picker-name">{{ fontPreview.primary || primaryFont }}</span>
							</div>
							<input type="text" id="char-field-body-font" name="bodyFont" :value="primaryFont" @input="previewFont('primary', targetValue($event))" @change="primaryFont = targetValue($event)" placeholder="Type any Google Font family, e.g. Inter">
							<div class="font-picker-custom" v-if="customFontsList.length">
								<button type="button" v-for="cf in customFontsList" :key="cf" class="btn-scale-preset" @click.stop="primaryFont = cf">{{ cf }}</button>
							</div>
						</div>

						<div class="editor-field">
							<label for="char-field-secondary-font">Trait / Label Font</label>
							<div class="font-picker-preview" :style="{ fontFamily: '\'' + (fontPreview.secondary || secondaryFont) + '\', sans-serif' }">
								<span class="font-picker-sample">Ag</span>
								<span class="font-picker-name">{{ fontPreview.secondary || secondaryFont }}</span>
							</div>
							<input type="text" id="char-field-secondary-font" name="secondaryFont" :value="secondaryFont" @input="previewFont('secondary', targetValue($event))" @change="secondaryFont = targetValue($event)" placeholder="Type any Google Font family, e.g. Oswald">
							<div class="font-picker-custom" v-if="customFontsList.length">
								<button type="button" v-for="cf in customFontsList" :key="cf" class="btn-scale-preset" @click.stop="secondaryFont = cf">{{ cf }}</button>
							</div>
							<span class="editor-field-hint" style="font-size: 0.68rem; color: #94a3b8; margin-top: 0.25rem; display: block;">
								Any family name from fonts.google.com works — it loads and previews as you type, and applies on Enter.
							</span>
						</div>

						<!-- CUSTOM FONT UPLOAD -->
						<div class="editor-field" style="background: rgba(255,255,255,0.05); padding: 0.6rem; border-radius: 4px; border: 1px solid rgba(255,255,255,0.15);">
							<label for="char-field-font-upload" style="font-size: 0.75rem;"><i class="fas fa-file-arrow-up"></i> Upload Custom Font</label>
							<input type="file" id="char-field-font-upload" name="fontUpload" ref="fontFileInput" style="display:none" @change="handleFontUpload" accept=".woff,.woff2,.ttf,.otf">
							<button type="button" class="editor-tab-btn" style="width: 100%; margin-top: 0.3rem; border: 1px solid rgba(255,255,255,0.25); text-align: center;" @click.stop="triggerFontUpload">
								<i class="fas fa-upload"></i> Choose Font File (.woff2, .woff, .ttf)
							</button>
							<div class="editor-upload-error" v-if="fontUploadError">{{ fontUploadError }}</div>
							<span class="editor-field-hint" style="font-size: 0.68rem; color: #94a3b8; margin-top: 0.25rem; display: block;">
								Uploaded fonts are embedded into the character JSON and available immediately.
							</span>
						</div>
					</template>

					<!-- ================= TAB 4: VISUAL DICE EDITOR ================= -->
					<template v-else-if="currentTab === 'dice'">
						<!-- LIVE SVG PREVIEW OF ALL 5 DICE -->
						<div class="editor-field" style="text-align: center; background: #ffffff; padding: 0.75rem; border-radius: 6px; border: 1px solid #cbd5e1;">
							<div class="editor-label" style="font-size: 0.75rem; color: #1e293b; margin-bottom: 0.4rem; display: block; font-weight: 700;">Live Dice Appearance Preview</div>
							<div style="display: flex; justify-content: center; gap: 0.6rem; align-items: center; margin-bottom: 0.5rem;">
								<span v-for="d in [4, 6, 8, 10, 12]" :key="'filled-' + d" v-html="renderDicePreview(d, true)" :title="'d' + d + ' (Active / Filled)'"></span>
							</div>
							<div style="font-size: 0.68rem; color: #64748b; margin-top: 0.2rem; font-weight: 600;">Unfilled / Reserved Slots Preview:</div>
							<div style="display: flex; justify-content: center; gap: 0.6rem; align-items: center; margin-top: 0.3rem;">
								<span v-for="d in [4, 6, 8, 10, 12]" :key="'unfilled-' + d" v-html="renderDicePreview(d, false)" :title="'d' + d + ' (Unfilled / Inactive)'"></span>
							</div>
						</div>

						<!-- PRESET PALETTES -->
						<div class="editor-field">
							<div class="editor-label">Dice Themes &amp; Presets</div>
							<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.4rem; margin-top: 0.25rem;">
								<button
									v-for="p in dicePresets"
									:key="p.name"
									type="button"
									class="editor-tab-btn"
									style="font-size: 0.75rem; padding: 0.35rem; border: 1px solid rgba(255,255,255,0.2); text-align: left; display: flex; align-items: center; gap: 0.4rem;"
									@click.stop="applyDicePreset(p)"
								>
									<span :style="{ width: '12px', height: '12px', borderRadius: '2px', background: p.backgroundColor1, display: 'inline-block', border: '1px solid ' + p.borderColor }"></span>
									{{ p.name }}
								</button>
							</div>
						</div>

						<!-- BACKGROUND TYPE: SOLID VS GRADIENT -->
						<div class="editor-field">
							<div class="editor-label">Die Fill Background</div>
							<div class="editor-button-group" style="margin-bottom: 0.5rem;">
								<button
									type="button"
									class="editor-group-btn"
									:class="{ active: diceConfig.backgroundType === 'solid' }"
									@click.stop="updateDiceProp('backgroundType', 'solid')"
								>
									Solid Color
								</button>
								<button
									type="button"
									class="editor-group-btn"
									:class="{ active: diceConfig.backgroundType === 'gradient' }"
									@click.stop="updateDiceProp('backgroundType', 'gradient')"
								>
									Linear Gradient
								</button>
							</div>

							<div style="display: flex; flex-direction: column; gap: 0.5rem;">
								<div style="display: flex; align-items: center; justify-content: space-between;">
									<label for="char-field-dice-bg1" style="font-size: 0.75rem; color: #cbd5e1; margin: 0;">{{ diceConfig.backgroundType === 'gradient' ? 'Start Color' : 'Fill Color' }}</label>
									<div style="display: flex; align-items: center; gap: 0.4rem;">
										<input type="color" id="char-field-dice-bg1" name="diceBgColor1" :value="diceConfig.backgroundColor1 || '#ffffff'" @input="updateDiceProp('backgroundColor1', targetValue($event))" style="width: 2rem; height: 1.6rem; border: none; cursor: pointer; border-radius: 3px;">
										<input type="text" id="char-field-dice-bg1-text" name="diceBgColor1Text" :value="diceConfig.backgroundColor1 || '#ffffff'" @input="updateDiceProp('backgroundColor1', targetValue($event))" style="font-family: monospace; font-size: 0.75rem; width: 5.5rem;">
									</div>
								</div>

								<div v-if="diceConfig.backgroundType === 'gradient'" style="display: flex; align-items: center; justify-content: space-between;">
									<label for="char-field-dice-bg2" style="font-size: 0.75rem; color: #cbd5e1; margin: 0;">End Color</label>
									<div style="display: flex; align-items: center; gap: 0.4rem;">
										<input type="color" id="char-field-dice-bg2" name="diceBgColor2" :value="diceConfig.backgroundColor2 || '#f1f5f9'" @input="updateDiceProp('backgroundColor2', targetValue($event))" style="width: 2rem; height: 1.6rem; border: none; cursor: pointer; border-radius: 3px;">
										<input type="text" id="char-field-dice-bg2-text" name="diceBgColor2Text" :value="diceConfig.backgroundColor2 || '#f1f5f9'" @input="updateDiceProp('backgroundColor2', targetValue($event))" style="font-family: monospace; font-size: 0.75rem; width: 5.5rem;">
									</div>
								</div>

								<div v-if="diceConfig.backgroundType === 'gradient'" class="slider-row">
									<div class="slider-header" style="display: flex; justify-content: space-between; font-size: 0.7rem; font-weight: 700; color: #cbd5e1; margin-bottom: 0.2rem;">
										<label for="char-field-dice-gradient-angle">Gradient Angle</label>
										<span>{{ diceConfig.gradientAngle || 135 }}°</span>
									</div>
									<input type="range" id="char-field-dice-gradient-angle" name="diceGradientAngle" min="0" max="360" step="15" :value="diceConfig.gradientAngle || 135" @input="updateDiceProp('gradientAngle', Number(targetValue($event)))">
								</div>
							</div>
						</div>

						<!-- NUMERAL COLOR -->
						<div class="editor-field">
							<div style="display: flex; align-items: center; justify-content: space-between;">
								<label for="char-field-dice-numeral-color" style="margin: 0;">Numeral / Text Color</label>
								<div style="display: flex; align-items: center; gap: 0.4rem;">
									<input type="color" id="char-field-dice-numeral-color" name="diceNumeralColor" :value="diceConfig.numeralColor || '#000000'" @input="updateDiceProp('numeralColor', targetValue($event))" style="width: 2rem; height: 1.6rem; border: none; cursor: pointer; border-radius: 3px;">
									<input type="text" id="char-field-dice-numeral-color-text" name="diceNumeralColorText" :value="diceConfig.numeralColor || '#000000'" @input="updateDiceProp('numeralColor', targetValue($event))" style="font-family: monospace; font-size: 0.75rem; width: 5.5rem;">
								</div>
							</div>
						</div>

						<!-- BORDER COLOR & WIDTH -->
						<div class="editor-field">
							<div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.4rem;">
								<label for="char-field-dice-border-color" style="margin: 0;">Border Color</label>
								<div style="display: flex; align-items: center; gap: 0.4rem;">
									<input type="color" id="char-field-dice-border-color" name="diceBorderColor" :value="diceConfig.borderColor || '#000000'" @input="updateDiceProp('borderColor', targetValue($event))" style="width: 2rem; height: 1.6rem; border: none; cursor: pointer; border-radius: 3px;">
									<input type="text" id="char-field-dice-border-color-text" name="diceBorderColorText" :value="diceConfig.borderColor || '#000000'" @input="updateDiceProp('borderColor', targetValue($event))" style="font-family: monospace; font-size: 0.75rem; width: 5.5rem;">
								</div>
							</div>
							<div class="slider-row">
								<div class="slider-header" style="display: flex; justify-content: space-between; font-size: 0.7rem; font-weight: 700; color: #cbd5e1; margin-bottom: 0.2rem;">
									<label for="char-field-dice-border-width">Border Width</label>
									<span>{{ diceConfig.borderWidth || 1 }}px</span>
								</div>
								<input type="range" id="char-field-dice-border-width" name="diceBorderWidth" min="0.5" max="3" step="0.1" :value="diceConfig.borderWidth || 1" @input="updateDiceProp('borderWidth', Number(targetValue($event)))">
							</div>
						</div>

						<!-- RESET DICE BUTTON -->
						<div class="editor-field" style="margin-top: 0.75rem;">
							<button type="button" class="editor-tab-btn" style="width: 100%; border: 1px solid rgba(255,255,255,0.25); text-align: center;" @click.stop="resetDiceConfig">
								<i class="fas fa-undo"></i> Reset to Default Dice Appearance
							</button>
						</div>
					</template>

				</div>

			</div>
		</div>
		
	</aside>
</template>
