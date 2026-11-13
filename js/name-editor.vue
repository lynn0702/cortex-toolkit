<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue';
import { characterCurioFunctions } from './functions.ts';
import {
	getView,
	ensureView,
	isNameSet,
	getRating,
	resolveVisibility,
	nextVisibility,
	resolveSetPillar,
	getPillarLabel,
	type Character,
	type Visibility,
} from './model.ts';
import VisibilityEye from './visibility-eye.vue';
import PageLayoutMini from './page-layout-mini.vue';
import TagEditor from './tag-editor.vue';

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
		unfilledBorder: '#000000',
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
		unfilledBorder: '#334155',
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
		unfilledBorder: '#0284c7',
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
		unfilledBorder: '#d97706',
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
		unfilledBorder: '#7c3aed',
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
		unfilledBorder: '#059669',
	},
];

const props = withDefaults(
	defineProps<{
		character: Character;
		open: boolean;
		tab?: string;
	}>(),
	{
		tab: 'sheet',
	},
);

const emit = defineEmits<{
	(e: 'selectElement', selector: any[]): void;
	(e: 'updateCharacter', character: any): void;
	(e: 'saveSheetTemplate'): void;
	(e: 'exportSheetTemplate'): void;
}>();

const currentTab = computed(() => props.tab);
const fontPreview = ref<{ heading: string; primary: string; secondary: string }>({
	heading: '',
	primary: '',
	secondary: '',
});
const watermarkError = ref('');
const fontUploadError = ref('');
const dicePresets = DICE_PRESETS;
const presetColors = [
	{ name: 'Curio Sky', hex: '#0ea5e9' },
	{ name: 'Crimson Ruby', hex: '#e11d48' },
	{ name: 'Emerald', hex: '#10b981' },
	{ name: 'Indigo Purple', hex: '#6366f1' },
	{ name: 'Amber Gold', hex: '#f59e0b' },
	{ name: 'Rose Coral', hex: '#f43f5e' },
	{ name: 'Teal Cyan', hex: '#14b8a6' },
	{ name: 'Slate Dark', hex: '#475569' },
];

const inputName = ref<HTMLInputElement | null>(null);
const watermarkFileInput = ref<HTMLInputElement | null>(null);
const fontFileInput = ref<HTMLInputElement | null>(null);

function targetValue(e: Event) {
	return (e.target as HTMLInputElement).value;
}

const name = computed({
	get() {
		return props.character?.name ?? '';
	},
	set(val: string) {
		setCharacterProperty('name', val);
	},
});

const game = computed({
	get() {
		return props.character?.game ?? '';
	},
	set(val: string) {
		setCharacterProperty('game', val);
	},
});

const player = computed({
	get() {
		return props.character?.player ?? '';
	},
	set(val: string) {
		setCharacterProperty('player', val);
	},
});

const nickname = computed({
	get() {
		return props.character?.nickname ?? getView(props.character)?.nickname ?? '';
	},
	set(val: string) {
		setCharacterProperty('nickname', val);
		ensureView(props.character).nickname = val;
	},
});

const description = computed({
	get() {
		return props.character?.description ?? '';
	},
	set(val: string) {
		setCharacterProperty('description', val);
	},
});

const pronouns = computed({
	get() {
		return props.character?.pronouns ?? '';
	},
	set(val: string) {
		setCharacterProperty('pronouns', val);
	},
});

const characterTags = computed<string[]>({
	get() {
		return Array.isArray(props.character?.tags) ? props.character.tags : [];
	},
	set(val: string[]) {
		setCharacterProperty('tags', val);
	},
});

function nameTraitLabel(key: string) {
	const t = characterCurioFunctions.getNameTrait(props.character, key);
	const v = t?.label;
	return typeof v === 'string' ? v : '';
}

function setNameTraitLabel(key: string, val: string) {
	const t = characterCurioFunctions.ensureNameTrait(props.character, key);
	if (!t) return;
	if (typeof val === 'string' && val.trim().length) t.label = val.trim();
	else delete t.label;
	updateCharacter(props.character);
}

function nameTraitVisibility(key: string) {
	const t = characterCurioFunctions.getNameTrait(props.character, key);
	const v = getView(t) as Record<string, unknown> | undefined;
	const word = v?.visibility;
	if (word === 'hidden' || word === 'editor-only' || word === 'play-only' || word === 'shown') return word;
	return 'shown';
}

function setNameTraitVisibility(key: string, vis: string) {
	const t = characterCurioFunctions.ensureNameTrait(props.character, key);
	if (!t) return;
	const v = ensureView(t) as Record<string, unknown>;
	// Sparse with the default: only a stored word that disagrees survives.
	const def = 'shown';
	if (vis === def) {
		delete v.visibility;
	} else if (vis === 'hidden' || vis === 'editor-only' || vis === 'play-only' || vis === 'shown') {
		v.visibility = vis;
	}
	updateCharacter(props.character);
}

function toggleNameVisibility(key: string) {
	const cur = nameTraitVisibility(key);
	setNameTraitVisibility(key, nextVisibility(cur as Visibility));
}

function ensureNameSet() {
	if (!props.character) return { set: null, index: -1 };
	if (!Array.isArray(props.character.traitSets)) props.character.traitSets = [];
	let idx = props.character.traitSets.findIndex((s: any) => isNameSet(s));
	if (idx === -1) {
		const set: any = { id: 'name', name: 'Name', traits: [], view: { style: { header: 'default', body: 'name' } } };
		props.character.traitSets.unshift(set);
		idx = 0;
	}
	return { set: props.character.traitSets[idx], index: idx };
}

function nameSetVisibility(): Visibility {
	const set = (props.character?.traitSets || []).find((s: any) => isNameSet(s));
	return resolveVisibility(set);
}

function toggleNameSetVisibility() {
	const { set } = ensureNameSet();
	if (!set) return;
	const cur = resolveVisibility(set);
	const next = nextVisibility(cur);
	const v = ensureView(set) as Record<string, unknown>;
	if (next === 'shown') delete v.visibility;
	else v.visibility = next;
	updateCharacter(props.character);
}

function openNameSetEditor() {
	const { index } = ensureNameSet();
	if (index === -1) return;
	updateCharacter(props.character);
	selectElement(['traitSet', index]);
}

const activePillarKeys = computed<string[]>(() => {
	const seen: string[] = ['identity'];
	const defaults = ['prime', 'plus', 'play'];
	const sets = props.character?.traitSets || [];
	const used = new Set<string>(['identity']);
	for (const ts of sets) {
		if (!ts || isNameSet(ts)) continue;
		used.add(resolveSetPillar(ts));
	}
	for (const d of defaults) {
		if (used.has(d) && !seen.includes(d)) seen.push(d);
	}
	for (const ts of sets) {
		if (!ts || isNameSet(ts)) continue;
		const p = resolveSetPillar(ts);
		if (!seen.includes(p)) seen.push(p);
	}
	return seen;
});

function pillarLabelValue(key: string): string {
	const labels = getView(props.character)?.labels as Record<string, any> | undefined;
	return labels?.pillars?.[key] ?? labels?.['pillar_' + key] ?? '';
}

function pillarLabelPlaceholder(key: string): string {
	return key ? key.charAt(0).toUpperCase() + key.slice(1) : '';
}

function setPillarLabel(key: string, val: string) {
	if (!props.character) return;
	const v = ensureView(props.character);
	if (!v.labels || typeof v.labels !== 'object') v.labels = {};
	if (!v.labels.pillars || typeof v.labels.pillars !== 'object' || Array.isArray(v.labels.pillars)) {
		v.labels.pillars = {};
	}
	const trimmed = String(val || '').trim();
	if (trimmed) {
		v.labels.pillars[key] = trimmed;
	} else {
		delete v.labels.pillars[key];
		delete v.labels['pillar_' + key];
	}
	updateCharacter(props.character);
}

const notes = computed({
	get() {
		return props.character?.notes ?? '';
	},
	set(val: string) {
		setCharacterProperty('notes', val);
	},
});

// Plot Points is a Counter on the name-set trait (spendable,
// [0, 20]); the stepper is the Counter's spend control. The character
// field stays the interchange value and mirrors the trait.
const plotPoints = computed({
	get() {
		const t = characterCurioFunctions.getNameTrait(props.character, 'plotPoints');
		const rating = getRating(t);
		if (rating && rating.type === 'Counter' && Array.isArray(rating.value) && typeof rating.value[0] === 'number') {
			return rating.value[0];
		}
		return Number(props.character?.plotPoints) || 0;
	},
	set(val: any) {
		const n = Math.max(0, parseInt(val, 10) || 0);
		setCharacterProperty('plotPoints', n);
		const t = characterCurioFunctions.ensureNameTrait(props.character, 'plotPoints');
		if (t) {
			(t as unknown as Record<string, any>).rating = { type: 'Counter', value: [n], range: [0, 20] };
			if ((t as unknown as Record<string, unknown>).spendable === undefined) {
				(t as unknown as Record<string, any>).spendable = true;
			}
			updateCharacter(props.character);
		}
	},
});

const pageCount = computed({
	get() {
		return Math.max(1, Number(getView(props.character)?.pageCount) || 1);
	},
	set(count: any) {
		if (!props.character) return;
		ensureView(props.character).pageCount = Math.max(1, parseInt(count, 10) || 1);
		emit('updateCharacter', props.character);
	},
});

const pageOrientation = computed({
	get() {
		return getView(props.character)?.pageOrientation || getView(props.character)?.orientation || 'portrait';
	},
	set(val: string) {
		if (!props.character) return;
		ensureView(props.character).pageOrientation = val === 'landscape' ? 'landscape' : 'portrait';
		emit('updateCharacter', props.character);
	},
});

// Static id of the sheet template this character's layout resolves
// against (values not set locally fall through to the template).
const sheetTemplateId = computed(() => {
	const t = props.character?.sheet?.template;
	if (!t) return '';
	if (typeof t === 'string') return t;
	return t.id || '';
});

const pageJustification = computed({
	get() {
		return getView(props.character)?.pageJustification || 'top-base';
	},
	set(mode: string) {
		if (!props.character) return;
		ensureView(props.character).pageJustification = mode;
		emit('updateCharacter', props.character);
	},
});

const accentColor = computed({
	get() {
		return getView(props.character)?.accentColor || '#0ea5e9';
	},
	set(val: string) {
		if (!props.character) return;
		ensureView(props.character).accentColor = val;
		emit('updateCharacter', props.character);
	},
});

const primaryColor = computed({
	get() {
		return getView(props.character)?.primaryColor || accentColor.value;
	},
	set(val: string) {
		if (!props.character) return;
		ensureView(props.character).primaryColor = val;
		emit('updateCharacter', props.character);
	},
});

const headingFont = computed({
	get() {
		return getView(props.character)?.theme?.fonts?.heading || 'Josefin Sans';
	},
	set(val: string) {
		setThemeFont('heading', val);
	},
});

const primaryFont = computed({
	get() {
		return getView(props.character)?.theme?.fonts?.primary || 'Open Sans';
	},
	set(val: string) {
		setThemeFont('primary', val);
	},
});

const secondaryFont = computed({
	get() {
		return getView(props.character)?.theme?.fonts?.secondary || 'Alegreya Sans SC';
	},
	set(val: string) {
		setThemeFont('secondary', val);
	},
});

const customFontsList = computed(() => (getView(props.character)?.customFonts || []).map((f: any) => f.name));

const diceConfig = computed({
	get() {
		return (
			getView(props.character)?.diceConfig || {
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
				unfilledBorder: '#000000',
			}
		);
	},
	set(cfg: any) {
		if (!props.character) return;
		ensureView(props.character).diceConfig = { ...cfg };
		if (typeof window !== 'undefined') {
			(window as any).__characterCurioActiveDiceConfig = { ...cfg };
		}
		emit('updateCharacter', props.character);
	},
});

const watermarkEnabled = computed({
	get() {
		return Boolean(getView(props.character)?.watermark?.enabled);
	},
	set(val: any) {
		setWatermarkProperty('enabled', Boolean(val));
	},
});

const watermarkURL = computed({
	get() {
		return getView(props.character)?.watermark?.url ?? '';
	},
	set(val: string) {
		setWatermarkProperty('url', val);
		if (val && !watermarkEnabled.value) {
			setWatermarkProperty('enabled', true);
		}
	},
});

const watermarkOpacity = computed({
	get() {
		return getView(props.character)?.watermark?.opacity ?? 0.08;
	},
	set(val: any) {
		setWatermarkProperty('opacity', Number(val) || 0.08);
	},
});

const watermarkScale = computed({
	get() {
		return getView(props.character)?.watermark?.scale ?? 75;
	},
	set(val: any) {
		setWatermarkProperty('scale', Number(val) || 75);
	},
});

const watermarkPage = computed({
	get() {
		return getView(props.character)?.watermark?.page ?? 'all';
	},
	set(val: string) {
		setWatermarkProperty('page', val);
	},
});

watch(
	() => props.open,
	(isOpen, wasOpen) => {
		if (isOpen && !wasOpen) {
			if (currentTab.value === 'sheet') {
				focusFirstInput();
			}
		}
	},
);

function selectElement(selector: any[]) {
	emit('selectElement', selector);
}

async function focusFirstInput() {
	await nextTick();
	if (inputName.value) {
		inputName.value.focus({ preventScroll: true });
	}
}

function setCharacterProperty(key: string, val: any) {
	const character = props.character;
	(character as Record<string, any>)[key] = val;
	updateCharacter(character);
}

function ensureWatermarkStruct() {
	if (!props.character) return;
	const view = ensureView(props.character);
	if (!view.watermark) {
		view.watermark = {
			enabled: false,
			url: '',
			opacity: 0.08,
			scale: 75,
			page: 'all',
		};
	}
}

function setWatermarkProperty(key: string, val: any) {
	ensureWatermarkStruct();
	(ensureView(props.character).watermark as any)[key] = val;
	updateCharacter(props.character);
}

function uploadWatermarkStart() {
	watermarkFileInput.value?.click();
}

function uploadWatermarkProcess(event: Event) {
	const input = event.target as HTMLInputElement;

	watermarkError.value = '';
	if (!input.files || !input.files.length) return;
	characterCurioFunctions.processImageFile(input.files[0], 1280, 0.8).then(
		(dataURL: string) => {
			watermarkURL.value = dataURL;
			watermarkEnabled.value = true;
			input.value = null as any;
		},
		(error: any) => {
			watermarkError.value = error?.message || 'Could not process that image.';
			input.value = null as any;
		},
	);
}

function removeWatermark() {
	watermarkURL.value = '';
	watermarkEnabled.value = false;
}

function setAccent(hex: string) {
	accentColor.value = hex;
}

function resetAccent() {
	if (!props.character) return;
	delete ensureView(props.character).accentColor;
	emit('updateCharacter', props.character);
}

function setThemeFont(target: string, fontName: string) {
	if (!props.character) return;
	const view = ensureView(props.character);
	if (!view.theme) view.theme = {};
	if (!view.theme.fonts) view.theme.fonts = {};
	(view.theme.fonts as any)[target] = fontName;
	if (typeof characterCurioFunctions !== 'undefined' && characterCurioFunctions.loadGoogleFont) {
		characterCurioFunctions.loadGoogleFont(fontName);
	}
	emit('updateCharacter', props.character);
}

function previewFont(target: 'heading' | 'primary' | 'secondary', fontName: string) {
	fontPreview.value[target] = fontName;
	const clean = (fontName || '').trim();
	if (clean && typeof characterCurioFunctions !== 'undefined' && characterCurioFunctions.loadGoogleFont) {
		characterCurioFunctions.loadGoogleFont(clean);
	}
}

function triggerFontUpload() {
	fontFileInput.value?.click();
}

function handleFontUpload(event: Event) {
	const input = event.target as HTMLInputElement;
	const file = input.files?.[0];
	if (!file) return;
	fontUploadError.value = '';
	if (file.size > 2 * 1024 * 1024) {
		fontUploadError.value = 'Font files must be under 2 MB.';
		input.value = null as any;
		return;
	}
	const fontName = file.name
		.replace(/\.[^/.]+$/, '')
		.replace(/[^a-zA-Z0-9_-]/g, ' ')
		.trim();
	const reader = new FileReader();
	reader.onload = (e) => {
		const base64Data = (e.target as FileReader).result as string;
		if (typeof characterCurioFunctions !== 'undefined' && characterCurioFunctions.applyCustomFont) {
			characterCurioFunctions.applyCustomFont(fontName, base64Data);
		}
		const view = ensureView(props.character);
		if (!view.customFonts) view.customFonts = [];
		view.customFonts.push({ name: fontName, data: base64Data });
		headingFont.value = fontName;
		emit('updateCharacter', props.character);
	};
	reader.readAsDataURL(file);
}

function updateDiceProp(key: string, val: any) {
	const newCfg = { ...diceConfig.value, style: 'custom', [key]: val };
	diceConfig.value = newCfg;
}

function applyDicePreset(preset: any) {
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
		unfilledBorder: '#000000',
	};
	diceConfig.value = defaultCfg;
}

function renderDicePreview(size: any, isFilled: any) {
	if (typeof characterCurioFunctions !== 'undefined' && characterCurioFunctions.renderDieconSVG) {
		return characterCurioFunctions.renderDieconSVG(size, isFilled, '', diceConfig.value);
	}
	return size;
}

function updateCharacter(character: any) {
	emit('updateCharacter', character);
}
</script>

<template>
	<aside :class="{ editor: true, 'editor-character': true, open: open, scrollable: true }" @click.stop="">
		<div class="editor-arrow"></div>

		<div class="editor-controls">
			<button type="button" aria-label="Close" @click.stop="selectElement([])" title="Close">
				<i class="fas fa-times" aria-hidden="true"></i>
			</button>
		</div>

		<div class="editor-inner">
			<div>
				<div class="editor-fields">
					<!-- ================= TAB 1: SHEET LEVEL ================= -->
					<template v-if="currentTab === 'sheet'">
						<div class="editor-field">
							<div class="name-heading-row editor-row-between mb-sm">
								<span class="editor-label m-0">Name Block Set</span>
								<visibility-eye :state="nameSetVisibility()" @toggle="toggleNameSetVisibility()" />
							</div>
							<div class="editor-button-container">
								<div class="editor-button-container-inner">
									<button type="button" class="editor-button" @click.stop="openNameSetEditor()">
										<span><i class="fas fa-sliders" aria-hidden="true"></i> Configure Name Set / Image</span>
									</button>
								</div>
							</div>
						</div>
						<div class="editor-field">
							<div class="name-heading-row">
								<input
									type="text"
									class="name-heading-input"
									:value="nameTraitLabel('name')"
									@change="setNameTraitLabel('name', targetValue($event))"
									placeholder="Character Name"
									title="Name heading (stored on the name trait)"
									aria-label="Name heading"
								/>
								<visibility-eye :state="nameTraitVisibility('name')" @toggle="toggleNameVisibility('name')" />
							</div>
							<input
								type="text"
								id="char-field-name"
								name="characterName"
								v-model="name"
								ref="inputName"
								placeholder="Character name"
								aria-label="Character name"
							/>
						</div>

						<div class="editor-field">
							<div class="name-heading-row">
								<input
									type="text"
									class="name-heading-input"
									:value="nameTraitLabel('game')"
									@change="setNameTraitLabel('game', targetValue($event))"
									placeholder="Game / Campaign Title"
									title="Game heading (stored on the game trait)"
									aria-label="Game heading"
								/>
								<visibility-eye :state="nameTraitVisibility('game')" @toggle="toggleNameVisibility('game')" />
							</div>
							<input
								type="text"
								id="char-field-game"
								name="gameTitle"
								v-model="game"
								placeholder="Game title"
								aria-label="Game title"
							/>
						</div>

						<div class="editor-field">
							<div class="name-heading-row">
								<input
									type="text"
									class="name-heading-input"
									:value="nameTraitLabel('nickname')"
									@change="setNameTraitLabel('nickname', targetValue($event))"
									placeholder="Nickname / Call-Sign"
									title="Nickname heading (stored on the nickname trait)"
									aria-label="Nickname heading"
								/>
								<visibility-eye :state="nameTraitVisibility('nickname')" @toggle="toggleNameVisibility('nickname')" />
							</div>
							<input
								type="text"
								id="char-field-nickname"
								name="nickname"
								v-model="nickname"
								placeholder="Nickname"
								aria-label="Nickname"
							/>
						</div>

						<div class="editor-field">
							<div class="name-heading-row">
								<input
									type="text"
									class="name-heading-input"
									:value="nameTraitLabel('player')"
									@change="setNameTraitLabel('player', targetValue($event))"
									placeholder="Player Name"
									title="Player heading (stored on the player trait)"
									aria-label="Player heading"
								/>
								<visibility-eye :state="nameTraitVisibility('player')" @toggle="toggleNameVisibility('player')" />
							</div>
							<input
								type="text"
								id="char-field-player"
								name="playerName"
								v-model="player"
								placeholder="Player name..."
								aria-label="Player name"
							/>
						</div>

						<div class="editor-field">
							<div class="name-heading-row">
								<input
									type="text"
									class="name-heading-input"
									:value="nameTraitLabel('pronouns')"
									@change="setNameTraitLabel('pronouns', targetValue($event))"
									placeholder="Pronouns"
									title="Pronouns heading (stored on the pronouns trait)"
									aria-label="Pronouns heading"
								/>
								<visibility-eye :state="nameTraitVisibility('pronouns')" @toggle="toggleNameVisibility('pronouns')" />
							</div>
							<input
								type="text"
								id="char-field-pronouns"
								name="pronouns"
								v-model="pronouns"
								placeholder="Pronouns"
								aria-label="Pronouns"
							/>
						</div>

						<div class="editor-field">
							<div class="name-heading-row">
								<input
									type="text"
									class="name-heading-input"
									:value="nameTraitLabel('plotPoints')"
									@change="setNameTraitLabel('plotPoints', targetValue($event))"
									placeholder="Plot Points"
									title="Plot points heading (stored on the plotPoints trait)"
									aria-label="Plot points heading"
								/>
								<visibility-eye
									:state="nameTraitVisibility('plotPoints')"
									@toggle="toggleNameVisibility('plotPoints')"
								/>
							</div>
							<div class="num-stepper">
								<button
									type="button"
									class="btn-step"
									@click.stop="plotPoints = Math.max(0, plotPoints - 1)"
									:disabled="plotPoints <= 0"
									title="Spend Plot Point"
									aria-label="Spend Plot Point"
								>
									-
								</button>
								<input
									type="number"
									id="char-field-plot-points"
									name="plotPoints"
									min="0"
									v-model.number="plotPoints"
									inputmode="numeric"
									aria-label="Plot Points"
								/>
								<button
									type="button"
									class="btn-step"
									@click.stop="plotPoints = plotPoints + 1"
									title="Gain Plot Point"
									aria-label="Gain Plot Point"
								>
									+
								</button>
							</div>
						</div>

						<div class="editor-field">
							<div class="name-heading-row">
								<input
									type="text"
									class="name-heading-input"
									:value="nameTraitLabel('description')"
									@change="setNameTraitLabel('description', targetValue($event))"
									placeholder="Description / Bio"
									title="Description heading (stored on the description trait)"
									aria-label="Description heading"
								/>
								<visibility-eye
									:state="nameTraitVisibility('description')"
									@toggle="toggleNameVisibility('description')"
								/>
							</div>
							<textarea
								id="char-field-description"
								name="description"
								v-model="description"
								rows="3"
								placeholder="Character narrative background..."
								aria-label="Description"
							></textarea>
						</div>

						<div class="editor-field">
							<div class="name-heading-row">
								<input
									type="text"
									class="name-heading-input"
									:value="nameTraitLabel('notes')"
									@change="setNameTraitLabel('notes', targetValue($event))"
									placeholder="Notes"
									title="Notes heading (stored on the notes trait)"
									aria-label="Notes heading"
								/>
								<visibility-eye :state="nameTraitVisibility('notes')" @toggle="toggleNameVisibility('notes')" />
							</div>
							<textarea
								id="char-field-notes"
								name="characterNotes"
								v-model="notes"
								rows="2"
								placeholder="Player notes..."
								aria-label="Notes"
							></textarea>
						</div>

						<div class="editor-field">
							<TagEditor v-model="characterTags" input-id="char-field-tags" label="Tags" />
						</div>

						<div class="editor-field">
							<div class="editor-label">Pillar Labels</div>
							<div class="editor-grid-2 mt-sm">
								<div v-for="pKey in activePillarKeys" :key="'pillar-lbl-' + pKey">
									<label :for="'char-pillar-label-' + pKey" class="editor-sub-label">{{ pKey }}</label>
									<input
										type="text"
										:id="'char-pillar-label-' + pKey"
										:name="'pillarLabel_' + pKey"
										:value="pillarLabelValue(pKey)"
										:placeholder="pillarLabelPlaceholder(pKey)"
										@change="setPillarLabel(pKey, targetValue($event))"
									/>
								</div>
							</div>
						</div>

						<div class="editor-field">
							<div class="editor-label">Layout Template</div>
							<div class="editor-field-hint">
								<span v-if="sheetTemplateId"
									>Resolves against <strong>{{ sheetTemplateId }}</strong> — values you haven't changed come from the
									template, keeping this file clean.</span
								>
								<span v-else>Inline layout — everything is stored on this character.</span>
							</div>
							<div class="editor-button-container">
								<div class="editor-button-container-inner">
									<button type="button" class="editor-button" @click.stop="emit('saveSheetTemplate')">
										<span><i class="fas fa-bookmark" aria-hidden="true"></i> Save Layout as Template</span>
									</button>
									<button type="button" class="editor-button" @click.stop="emit('exportSheetTemplate')">
										<span><i class="fas fa-download" aria-hidden="true"></i> Export Layout File</span>
									</button>
								</div>
							</div>
						</div>

						<!-- WATERMARK CONFIGURATION -->
						<div class="editor-field">
							<label for="name-editor-watermark-enabled">Watermark Image</label>
							<div class="editor-checkbox-row mb-md">
								<input
									type="checkbox"
									id="name-editor-watermark-enabled"
									name="watermarkEnabled"
									v-model="watermarkEnabled"
								/>
								<label for="name-editor-watermark-enabled">Enable Background Watermark</label>
							</div>

							<div v-if="watermarkEnabled" class="watermark-settings editor-watermark-preview-box">
								<div v-if="watermarkURL" class="text-center p-xs">
									<img :src="watermarkURL" class="editor-watermark-preview-img" />
								</div>

								<div class="editor-button-container">
									<div class="editor-button-container-inner">
										<button type="button" class="editor-button" @click.prevent="uploadWatermarkStart">
											<span>
												<i class="fas fa-upload" aria-hidden="true"></i>
												{{ watermarkURL ? 'Change' : 'Upload' }} Watermark
											</span>
										</button>
										<button
											type="button"
											class="editor-button editor-btn-danger-mini"
											v-if="watermarkURL"
											@click.prevent="removeWatermark"
										>
											<span><i class="fas fa-trash-alt" aria-hidden="true"></i> Remove</span>
										</button>
									</div>
								</div>

								<input
									type="file"
									id="char-field-watermark-file"
									name="watermarkFile"
									ref="watermarkFileInput"
									class="sr-only"
									aria-label="Upload watermark file"
									@change="uploadWatermarkProcess"
									accept="image/*"
								/>

								<div class="editor-upload-error" v-if="watermarkError">{{ watermarkError }}</div>

								<div>
									<label for="char-field-watermark-url" class="editor-sub-label">Image URL</label>
									<input
										type="text"
										id="char-field-watermark-url"
										name="watermarkUrl"
										v-model.lazy="watermarkURL"
										placeholder="https://example.com/watermark.png"
									/>
								</div>

								<div class="slider-row">
									<div class="slider-header">
										<label for="char-field-watermark-opacity">Opacity</label>
										<span>{{ Math.round(watermarkOpacity * 100) }}%</span>
									</div>
									<input
										type="range"
										id="char-field-watermark-opacity"
										name="watermarkOpacity"
										min="0.02"
										max="0.35"
										step="0.01"
										v-model.number="watermarkOpacity"
									/>
								</div>

								<div class="slider-row">
									<div class="slider-header">
										<label for="char-field-watermark-scale">Scale</label>
										<span>{{ watermarkScale }}%</span>
									</div>
									<input
										type="range"
										id="char-field-watermark-scale"
										name="watermarkScale"
										min="30"
										max="130"
										step="5"
										v-model.number="watermarkScale"
									/>
								</div>
							</div>
						</div>
					</template>

					<!-- ================= TAB 2: PAGE LEVEL ================= -->
					<template v-else-if="currentTab === 'page'">
						<div class="editor-field">
							<div class="editor-label">Page Justification</div>
							<div class="editor-segmented-wrap flex-col gap-sm mt-xs">
								<label for="char-field-just-top" class="editor-radio-row">
									<input
										type="radio"
										id="char-field-just-top"
										name="pageJustification"
										value="top-base"
										v-model="pageJustification"
									/>
									<strong>Top Base</strong>
								</label>
								<p class="editor-radio-hint">
									Columns start strictly level at the top base with flush vertical baselines.
								</p>

								<label for="char-field-just-dist" class="editor-radio-row">
									<input
										type="radio"
										id="char-field-just-dist"
										name="pageJustification"
										value="distributed"
										v-model="pageJustification"
									/>
									<strong>Distributed</strong>
								</label>
								<p class="editor-radio-hint">Sections distribute vertically to fill the full printable page height.</p>
							</div>
						</div>

						<div class="editor-field">
							<label for="char-field-page-orientation">Page Orientation</label>
							<select id="char-field-page-orientation" name="pageOrientation" v-model="pageOrientation">
								<option value="portrait">Portrait</option>
								<option value="landscape">Landscape</option>
							</select>
							<span class="editor-field-hint"> Selects page aspect ratio and printable page rotation. </span>
						</div>

						<div class="editor-field">
							<label for="char-field-page-count">Page Count</label>
							<select id="char-field-page-count" name="pageCount" v-model.number="pageCount">
								<option :value="1">1 Page</option>
								<option :value="2">2 Pages</option>
								<option :value="3">3 Pages</option>
							</select>
						</div>

						<div class="editor-field">
							<div class="editor-label">Page Layout</div>
							<PageLayoutMini :character="props.character" @updateCharacter="updateCharacter" />
						</div>
					</template>

					<!-- ================= TAB 3: THEME & DICE ================= -->
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
							<div class="editor-row-inline mt-sm">
								<input
									type="color"
									id="char-field-accent-color"
									name="accentColorPicker"
									v-model="accentColor"
									class="editor-color-swatch-input"
								/>
								<input
									type="text"
									id="char-field-accent-hex"
									name="accentColorHex"
									v-model="accentColor"
									placeholder="#0ea5e9"
									class="editor-hex-input"
								/>
								<button
									type="button"
									class="editor-tab-btn editor-border-subtle"
									@click.stop="resetAccent"
									title="Reset"
								>
									Reset
								</button>
							</div>
						</div>

						<!-- TYPOGRAPHY PICKERS WITH LIVE PREVIEW -->
						<div class="editor-field">
							<label for="char-field-heading-font">Heading Font</label>
							<div
								class="font-picker-preview"
								:style="{ fontFamily: '\'' + (fontPreview.heading || headingFont) + '\', sans-serif' }"
							>
								<span class="font-picker-sample">Ag</span>
								<span class="font-picker-name">{{ fontPreview.heading || headingFont }}</span>
							</div>
							<input
								type="text"
								id="char-field-heading-font"
								name="headingFont"
								:value="headingFont"
								@input="previewFont('heading', targetValue($event))"
								@change="headingFont = targetValue($event)"
								placeholder="Google Font family"
							/>
							<div class="font-picker-custom" v-if="customFontsList.length">
								<button
									type="button"
									v-for="cf in customFontsList"
									:key="cf"
									class="btn-scale-preset"
									@click.stop="headingFont = cf"
								>
									{{ cf }}
								</button>
							</div>
						</div>

						<div class="editor-field">
							<label for="char-field-body-font">Body Font</label>
							<div
								class="font-picker-preview"
								:style="{ fontFamily: '\'' + (fontPreview.primary || primaryFont) + '\', sans-serif' }"
							>
								<span class="font-picker-sample">Ag</span>
								<span class="font-picker-name">{{ fontPreview.primary || primaryFont }}</span>
							</div>
							<input
								type="text"
								id="char-field-body-font"
								name="bodyFont"
								:value="primaryFont"
								@input="previewFont('primary', targetValue($event))"
								@change="primaryFont = targetValue($event)"
								placeholder="Google Font family"
							/>
							<div class="font-picker-custom" v-if="customFontsList.length">
								<button
									type="button"
									v-for="cf in customFontsList"
									:key="cf"
									class="btn-scale-preset"
									@click.stop="primaryFont = cf"
								>
									{{ cf }}
								</button>
							</div>
						</div>

						<div class="editor-field">
							<label for="char-field-secondary-font">Trait / Label Font</label>
							<div
								class="font-picker-preview"
								:style="{ fontFamily: '\'' + (fontPreview.secondary || secondaryFont) + '\', sans-serif' }"
							>
								<span class="font-picker-sample">Ag</span>
								<span class="font-picker-name">{{ fontPreview.secondary || secondaryFont }}</span>
							</div>
							<input
								type="text"
								id="char-field-secondary-font"
								name="secondaryFont"
								:value="secondaryFont"
								@input="previewFont('secondary', targetValue($event))"
								@change="secondaryFont = targetValue($event)"
								placeholder="Google Font family"
							/>
							<div class="font-picker-custom" v-if="customFontsList.length">
								<button
									type="button"
									v-for="cf in customFontsList"
									:key="cf"
									class="btn-scale-preset"
									@click.stop="secondaryFont = cf"
								>
									{{ cf }}
								</button>
							</div>
							<span class="editor-field-hint">
								Any family name from fonts.google.com works — it loads and previews as you type, and applies on Enter.
							</span>
						</div>

						<!-- CUSTOM FONT UPLOAD -->
						<div class="editor-field editor-box-inset">
							<label for="char-field-font-upload"><i class="fas fa-file-arrow-up"></i> Upload Custom Font</label>
							<input
								type="file"
								id="char-field-font-upload"
								name="fontUpload"
								ref="fontFileInput"
								class="sr-only"
								@change="handleFontUpload"
								accept=".woff,.woff2,.ttf,.otf"
							/>
							<button type="button" class="editor-tab-btn editor-full-btn mt-xs" @click.stop="triggerFontUpload">
								<i class="fas fa-upload"></i> Choose Font File
							</button>
							<div class="editor-upload-error" v-if="fontUploadError">{{ fontUploadError }}</div>
							<span class="editor-field-hint">
								Uploaded fonts are embedded into the character JSON and available immediately.
							</span>
						</div>

						<!-- DIE STYLE & GEOMETRY -->
						<div id="die-style-anchor" class="editor-section-divider">Die Style &amp; Geometry</div>

						<!-- LIVE SVG PREVIEW OF ALL 5 DICE -->
						<div class="editor-field editor-box-white">
							<div class="editor-label font-bold text-dark mb-sm">Live Dice Appearance Preview</div>
							<div class="editor-dice-preview-row">
								<span
									v-for="d in [4, 6, 8, 10, 12]"
									:key="'filled-' + d"
									v-html="renderDicePreview(d, true)"
									:title="'d' + d + ' (Active / Filled)'"
								></span>
							</div>
							<div class="editor-field-hint font-semibold">Unfilled / Reserved Slots Preview:</div>
							<div class="editor-dice-preview-row is-unfilled">
								<span
									v-for="d in [4, 6, 8, 10, 12]"
									:key="'unfilled-' + d"
									v-html="renderDicePreview(d, false)"
									:title="'d' + d + ' (Unfilled / Inactive)'"
								></span>
							</div>
						</div>

						<!-- PRESET PALETTES -->
						<div class="editor-field">
							<div class="editor-label">Dice Themes &amp; Presets</div>
							<div class="editor-grid-2 mt-xs">
								<button
									v-for="p in dicePresets"
									:key="p.name"
									type="button"
									class="editor-tab-btn editor-dice-preset-btn"
									@click.stop="applyDicePreset(p)"
								>
									<span
										class="editor-dice-preset-swatch"
										:style="{
											backgroundColor: p.backgroundColor1,
											borderColor: p.borderColor,
										}"
									></span>
									{{ p.name }}
								</button>
							</div>
						</div>

						<!-- BACKGROUND TYPE: SOLID VS GRADIENT -->
						<div class="editor-field">
							<div class="editor-label">Die Fill Background</div>
							<div class="editor-button-group mb-md">
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

							<div class="flex-col gap-sm">
								<div class="editor-row-between">
									<label for="char-field-dice-bg1" class="editor-sub-label m-0">{{
										diceConfig.backgroundType === 'gradient' ? 'Start Color' : 'Fill Color'
									}}</label>
									<div class="editor-row-inline">
										<input
											type="color"
											id="char-field-dice-bg1"
											name="diceBgColor1"
											:value="diceConfig.backgroundColor1 || '#ffffff'"
											@input="updateDiceProp('backgroundColor1', targetValue($event))"
											class="editor-color-swatch-input"
										/>
										<input
											type="text"
											id="char-field-dice-bg1-text"
											name="diceBgColor1Text"
											:value="diceConfig.backgroundColor1 || '#ffffff'"
											@input="updateDiceProp('backgroundColor1', targetValue($event))"
											class="editor-hex-input"
										/>
									</div>
								</div>

								<div v-if="diceConfig.backgroundType === 'gradient'" class="editor-row-between">
									<label for="char-field-dice-bg2" class="editor-sub-label m-0">End Color</label>
									<div class="editor-row-inline">
										<input
											type="color"
											id="char-field-dice-bg2"
											name="diceBgColor2"
											:value="diceConfig.backgroundColor2 || '#f1f5f9'"
											@input="updateDiceProp('backgroundColor2', targetValue($event))"
											class="editor-color-swatch-input"
										/>
										<input
											type="text"
											id="char-field-dice-bg2-text"
											name="diceBgColor2Text"
											:value="diceConfig.backgroundColor2 || '#f1f5f9'"
											@input="updateDiceProp('backgroundColor2', targetValue($event))"
											class="editor-hex-input"
										/>
									</div>
								</div>

								<div v-if="diceConfig.backgroundType === 'gradient'" class="slider-row">
									<div class="slider-header">
										<label for="char-field-dice-gradient-angle">Gradient Angle</label>
										<span>{{ diceConfig.gradientAngle || 135 }}°</span>
									</div>
									<input
										type="range"
										id="char-field-dice-gradient-angle"
										name="diceGradientAngle"
										min="0"
										max="360"
										step="15"
										:value="diceConfig.gradientAngle || 135"
										@input="updateDiceProp('gradientAngle', Number(targetValue($event)))"
									/>
								</div>
							</div>
						</div>

						<!-- NUMERAL COLOR -->
						<div class="editor-field">
							<div class="editor-row-between">
								<label for="char-field-dice-numeral-color" class="m-0">Numeral / Text Color</label>
								<div class="editor-row-inline">
									<input
										type="color"
										id="char-field-dice-numeral-color"
										name="diceNumeralColor"
										:value="diceConfig.numeralColor || '#000000'"
										@input="updateDiceProp('numeralColor', targetValue($event))"
										class="editor-color-swatch-input"
									/>
									<input
										type="text"
										id="char-field-dice-numeral-color-text"
										name="diceNumeralColorText"
										:value="diceConfig.numeralColor || '#000000'"
										@input="updateDiceProp('numeralColor', targetValue($event))"
										class="editor-hex-input"
									/>
								</div>
							</div>
						</div>

						<!-- BORDER COLOR & WIDTH -->
						<div class="editor-field">
							<div class="editor-row-between mb-sm">
								<label for="char-field-dice-border-color" class="m-0">Border Color</label>
								<div class="editor-row-inline">
									<input
										type="color"
										id="char-field-dice-border-color"
										name="diceBorderColor"
										:value="diceConfig.borderColor || '#000000'"
										@input="updateDiceProp('borderColor', targetValue($event))"
										class="editor-color-swatch-input"
									/>
									<input
										type="text"
										id="char-field-dice-border-color-text"
										name="diceBorderColorText"
										:value="diceConfig.borderColor || '#000000'"
										@input="updateDiceProp('borderColor', targetValue($event))"
										class="editor-hex-input"
									/>
								</div>
							</div>
							<div class="slider-row">
								<div class="slider-header">
									<label for="char-field-dice-border-width">Border Width</label>
									<span>{{ diceConfig.borderWidth || 1 }}px</span>
								</div>
								<input
									type="range"
									id="char-field-dice-border-width"
									name="diceBorderWidth"
									min="0.5"
									max="3"
									step="0.1"
									:value="diceConfig.borderWidth || 1"
									@input="updateDiceProp('borderWidth', Number(targetValue($event)))"
								/>
							</div>
						</div>

						<!-- RESET DICE BUTTON -->
						<div class="editor-field mt-md">
							<button type="button" class="editor-tab-btn editor-full-btn" @click.stop="resetDiceConfig">
								<i class="fas fa-undo"></i> Reset to Default Dice Appearance
							</button>
						</div>
					</template>
				</div>
			</div>
		</div>
	</aside>
</template>
