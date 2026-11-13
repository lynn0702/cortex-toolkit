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
	hasTemplateListing,
	type Character,
	type TemplateListing,
	type Visibility,
} from './model.ts';
import VisibilityEye from './visibility-eye.vue';
import PageLayoutMini from './page-layout-mini.vue';
import TagEditor from './tag-editor.vue';
import ColorPicker from './color-picker.vue';
import FontPicker from './font-picker.vue';
import {
	describeExternalFontUrl,
	inferFontFamilyFromUrl,
	parseExternalFontUrl,
	sanitizeFontFamilyName,
} from './font-url.ts';
import {
	SHEET_THEME_PRESETS,
	DICE_PRESETS,
	expandHex6,
	type DicePreset,
	type SheetThemePreset,
} from './color-palette.ts';

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
const watermarkError = ref('');
const listingImageError = ref('');
const externalFontUrlDraft = ref('');
const externalFontNameDraft = ref('');
const externalFontNameTouched = ref(false);
const fontUrlError = ref('');
const fontUrlFieldError = ref<'url' | 'name' | ''>('');
const dicePresets = DICE_PRESETS;
const sheetThemePresets = SHEET_THEME_PRESETS;

const inputName = ref<HTMLInputElement | null>(null);
const watermarkFileInput = ref<HTMLInputElement | null>(null);
const listingImageFileInput = ref<HTMLInputElement | null>(null);
const fontUrlInput = ref<HTMLInputElement | null>(null);
const fontUrlNameInput = ref<HTMLInputElement | null>(null);

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

const LISTING_RATING_OPTIONS = ['', 'd4', 'd6', 'd8', 'd10', 'd12'] as const;
const LISTING_RATING_FIELDS: ReadonlyArray<{
	key: keyof TemplateListing;
	label: string;
	id: string;
	name: string;
}> = [
	{ key: 'setting', label: 'Setting', id: 'char-listing-setting', name: 'listingSetting' },
	{ key: 'prep', label: 'Prep', id: 'char-listing-prep', name: 'listingPrep' },
	{ key: 'complexity', label: 'Complexity', id: 'char-listing-complexity', name: 'listingComplexity' },
];

const hasListingOrTemplate = computed(() =>
	Boolean(props.character?.isTemplate || hasTemplateListing(getView(props.character)?.listing)),
);

const safeListingImage = computed(() => characterCurioFunctions.safeImageUrl(getListingField('image')));

function getListingField(key: keyof TemplateListing): string {
	return String(getView(props.character)?.listing?.[key] ?? '');
}

function setListingField(key: keyof TemplateListing, raw: string, trimValue = true) {
	if (!props.character) return;
	const str = String(raw ?? '');
	const trimmed = str.trim();
	const view = ensureView(props.character);
	if (trimmed.length > 0) {
		view.listing = { ...(view.listing || {}), [key]: trimValue ? trimmed : str };
	} else if (view.listing && typeof view.listing === 'object') {
		delete view.listing[key];
		if (!hasTemplateListing(view.listing)) {
			delete view.listing;
		}
	}
	updateCharacter(props.character);
}

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

const rawAccentColor = computed(() => getView(props.character)?.accentColor || '');
const rawPrimaryColor = computed(() => getView(props.character)?.primaryColor || '');
const rawSecondaryColor = computed(() => getView(props.character)?.secondaryColor || '');
const effectivePrimaryHex = computed(() => expandHex6(rawPrimaryColor.value || rawAccentColor.value || '#e11d48'));
const effectiveAccentHex = computed(() => expandHex6(rawAccentColor.value || '#0ea5e9'));
const effectiveSecondaryHex = computed(() => expandHex6(rawSecondaryColor.value || '#d0efda'));
const hasCustomSheetTheme = computed(() =>
	Boolean(rawPrimaryColor.value || rawAccentColor.value || rawSecondaryColor.value),
);

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

const customFontEntries = computed(() =>
	(getView(props.character)?.customFonts || []).filter((f): f is { name: string; url: string } =>
		Boolean(f?.name && f?.url && parseExternalFontUrl(f.url)),
	),
);
const customFontsList = computed(() => customFontEntries.value.map((f) => f.name));

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

function handleImageUpload(
	event: Event,
	errorTarget: { value: string },
	maxDimension: number,
	quality: number,
	onSuccess: (dataURL: string) => void,
) {
	const input = event.target as HTMLInputElement;
	errorTarget.value = '';
	if (!input.files || !input.files.length) return;
	characterCurioFunctions.processImageFile(input.files[0], maxDimension, quality).then(
		(dataURL: string) => {
			onSuccess(dataURL);
			input.value = null as any;
		},
		(error: any) => {
			errorTarget.value = error?.message || 'Could not process that image.';
			input.value = null as any;
		},
	);
}

function uploadWatermarkStart() {
	watermarkFileInput.value?.click();
}

function uploadWatermarkProcess(event: Event) {
	handleImageUpload(event, watermarkError, 1280, 0.8, (dataURL) => {
		watermarkURL.value = dataURL;
		watermarkEnabled.value = true;
	});
}

function removeWatermark() {
	watermarkURL.value = '';
	watermarkEnabled.value = false;
}

function uploadListingImageStart() {
	listingImageFileInput.value?.click();
}

function uploadListingImageProcess(event: Event) {
	handleImageUpload(event, listingImageError, 1024, 0.85, (dataURL) => {
		setListingField('image', dataURL);
	});
}

function removeListingImage() {
	listingImageError.value = '';
	setListingField('image', '');
}

function setPrimaryColor(hex: string) {
	if (!props.character) return;
	ensureView(props.character).primaryColor = hex;
	emit('updateCharacter', props.character);
}

function resetPrimary() {
	if (!props.character) return;
	delete ensureView(props.character).primaryColor;
	emit('updateCharacter', props.character);
}

function setAccentColor(hex: string) {
	if (!props.character) return;
	ensureView(props.character).accentColor = hex;
	emit('updateCharacter', props.character);
}

function resetAccent() {
	if (!props.character) return;
	delete ensureView(props.character).accentColor;
	emit('updateCharacter', props.character);
}

function setSecondaryColor(hex: string) {
	if (!props.character) return;
	ensureView(props.character).secondaryColor = hex;
	emit('updateCharacter', props.character);
}

function resetSecondary() {
	if (!props.character) return;
	delete ensureView(props.character).secondaryColor;
	emit('updateCharacter', props.character);
}

function isPaletteActive(p: SheetThemePreset): boolean {
	if (!rawPrimaryColor.value && !rawAccentColor.value && !rawSecondaryColor.value) return false;
	return (
		expandHex6(rawPrimaryColor.value) === p.primary &&
		expandHex6(rawAccentColor.value) === p.accent &&
		expandHex6(rawSecondaryColor.value) === p.secondary
	);
}

function applySheetPalette(p: SheetThemePreset) {
	if (!props.character) return;
	const v = ensureView(props.character);
	v.primaryColor = p.primary;
	v.accentColor = p.accent;
	v.secondaryColor = p.secondary;
	emit('updateCharacter', props.character);
}

function resetSheetPalette() {
	if (!props.character) return;
	const v = ensureView(props.character);
	delete v.primaryColor;
	delete v.accentColor;
	delete v.secondaryColor;
	emit('updateCharacter', props.character);
}

function setThemeFont(target: string, fontName: string) {
	if (!props.character) return;
	const view = ensureView(props.character);
	if (!view.theme) view.theme = {};
	if (!view.theme.fonts) view.theme.fonts = {};
	(view.theme.fonts as any)[target] = fontName;
	const isCustom = customFontEntries.value.some((f) => f.name.trim().toLowerCase() === fontName.trim().toLowerCase());
	if (!isCustom && typeof characterCurioFunctions !== 'undefined' && characterCurioFunctions.loadGoogleFont) {
		characterCurioFunctions.loadGoogleFont(fontName);
	}
	emit('updateCharacter', props.character);
}

function resetThemeFont(target: 'heading' | 'primary' | 'secondary') {
	if (!props.character) return;
	const view = getView(props.character);
	if (view?.theme?.fonts && target in view.theme.fonts) {
		delete (view.theme.fonts as Record<string, unknown>)[target];
		emit('updateCharacter', props.character);
	}
}

function onExternalFontUrlInput() {
	fontUrlError.value = '';
	fontUrlFieldError.value = '';
	if (!externalFontUrlDraft.value.trim()) {
		externalFontNameTouched.value = false;
		externalFontNameDraft.value = '';
		return;
	}
	if (!externalFontNameTouched.value) {
		const inferred = inferFontFamilyFromUrl(externalFontUrlDraft.value);
		if (inferred) {
			externalFontNameDraft.value = inferred;
		}
	}
}

function onExternalFontNameInput() {
	fontUrlError.value = '';
	fontUrlFieldError.value = '';
	externalFontNameTouched.value = externalFontNameDraft.value.trim().length > 0;
}

function upsertCustomFontEntry(name: string, url: string): boolean {
	if (!props.character) return false;
	const cleanName = sanitizeFontFamilyName(name);
	const parsed = parseExternalFontUrl(url);
	if (!cleanName || !parsed) return false;

	if (typeof characterCurioFunctions !== 'undefined' && characterCurioFunctions.applyCustomFont) {
		characterCurioFunctions.applyCustomFont(cleanName, parsed.url);
	}
	const view = ensureView(props.character);
	const existing = Array.isArray(view.customFonts)
		? view.customFonts.filter((f) => f?.name && f?.url && f.name.trim().toLowerCase() !== cleanName.toLowerCase())
		: [];
	existing.push({ name: cleanName, url: parsed.url });
	view.customFonts = existing;
	emit('updateCharacter', props.character);
	return true;
}

function addExternalFont() {
	const parsed = parseExternalFontUrl(externalFontUrlDraft.value);
	if (!parsed) {
		fontUrlError.value = 'Enter an https:// font or stylesheet URL.';
		fontUrlFieldError.value = 'url';
		fontUrlInput.value?.focus();
		return;
	}
	const cleanName = sanitizeFontFamilyName(externalFontNameDraft.value || inferFontFamilyFromUrl(parsed.url));
	if (!cleanName) {
		fontUrlError.value = 'Enter the font family name.';
		fontUrlFieldError.value = 'name';
		fontUrlNameInput.value?.focus();
		return;
	}
	if (upsertCustomFontEntry(cleanName, parsed.url)) {
		externalFontUrlDraft.value = '';
		externalFontNameDraft.value = '';
		externalFontNameTouched.value = false;
		fontUrlError.value = '';
		fontUrlFieldError.value = '';
	}
}

function onExternalFontEnter(e: KeyboardEvent) {
	if (e.isComposing) return;
	e.preventDefault();
	addExternalFont();
}

function removeExternalFont(fontName: string) {
	if (!props.character) return;
	if (typeof characterCurioFunctions !== 'undefined' && characterCurioFunctions.removeCustomFont) {
		characterCurioFunctions.removeCustomFont(fontName);
	}
	const view = getView(props.character);
	if (view && Array.isArray(view.customFonts)) {
		const target = fontName.trim().toLowerCase();
		const remaining = view.customFonts.filter((f) => (f?.name || '').trim().toLowerCase() !== target);
		if (remaining.length) {
			view.customFonts = remaining;
		} else {
			delete view.customFonts;
		}
		if (view.theme?.fonts) {
			for (const slot of ['heading', 'primary', 'secondary'] as const) {
				if ((view.theme.fonts[slot] || '').trim().toLowerCase() === target) {
					delete view.theme.fonts[slot];
				}
			}
		}
		emit('updateCharacter', props.character);
	}
}

function handlePrefillExternalUrl(url: string) {
	externalFontUrlDraft.value = url;
	externalFontNameTouched.value = false;
	externalFontNameDraft.value = inferFontFamilyFromUrl(url);
	fontUrlError.value = '';
	fontUrlFieldError.value = '';
	nextTick(() => fontUrlNameInput.value?.focus());
}

function updateDiceProp(key: string, val: any) {
	const newCfg = { ...diceConfig.value, style: 'custom', [key]: val };
	diceConfig.value = newCfg;
}

function applyDicePreset(preset: DicePreset) {
	const resolved = presetWithMode(preset);
	const newCfg = { ...diceConfig.value, ...resolved, style: 'custom' };
	diceConfig.value = newCfg;
}

const presetFillMode = ref<'solid' | 'gradient'>(
	diceConfig.value?.backgroundType === 'gradient' ? 'gradient' : 'solid',
);

watch(
	() => diceConfig.value?.backgroundType,
	(bgType) => {
		presetFillMode.value = bgType === 'gradient' ? 'gradient' : 'solid';
	},
);

function presetWithMode(p: DicePreset, mode: 'solid' | 'gradient' = presetFillMode.value): DicePreset {
	return { ...p, backgroundType: mode };
}

function setPresetFillMode(mode: 'solid' | 'gradient') {
	presetFillMode.value = mode;
	if (diceConfig.value?.style === 'custom') {
		updateDiceProp('backgroundType', mode);
	}
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

function renderDicePreview(size: any, isFilled: any, cfgOverride?: any) {
	if (typeof characterCurioFunctions !== 'undefined' && characterCurioFunctions.renderDieconSVG) {
		return characterCurioFunctions.renderDieconSVG(size, isFilled, '', cfgOverride ?? diceConfig.value);
	}
	return size;
}

const DICE_PREVIEW_SIZES = [4, 6, 8, 10, 12] as const;

function isDicePresetActive(p: DicePreset): boolean {
	const resolved = presetWithMode(p);
	const cfg = diceConfig.value;
	if (!cfg || cfg.style !== 'custom') return false;
	return (
		cfg.backgroundType === resolved.backgroundType &&
		expandHex6(cfg.backgroundColor1) === expandHex6(resolved.backgroundColor1) &&
		(resolved.backgroundType !== 'gradient' ||
			expandHex6(cfg.backgroundColor2) === expandHex6(resolved.backgroundColor2)) &&
		expandHex6(cfg.numeralColor) === expandHex6(resolved.numeralColor) &&
		expandHex6(cfg.borderColor) === expandHex6(resolved.borderColor) &&
		expandHex6(cfg.unfilledBorder) === expandHex6(resolved.unfilledBorder) &&
		expandHex6(cfg.unfilledNumeral) === expandHex6(resolved.unfilledNumeral)
	);
}

function updateCharacter(character: any) {
	emit('updateCharacter', character);
}
</script>

<template>
	<aside :class="{ editor: true, 'editor-character': true, open: open }" @click.stop="">
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

						<details class="editor-group" :open="hasListingOrTemplate">
							<summary class="editor-group-title">Library Listing</summary>
							<div class="editor-field">
								<label for="char-listing-title">Card Title</label>
								<input
									type="text"
									id="char-listing-title"
									name="listingTitle"
									:value="getListingField('title')"
									placeholder="Defaults to game or name"
									@input="setListingField('title', targetValue($event), false)"
									@change="setListingField('title', targetValue($event), true)"
								/>
							</div>

							<div class="editor-field">
								<label for="char-listing-subtitle">Subtitle</label>
								<input
									type="text"
									id="char-listing-subtitle"
									name="listingSubtitle"
									:value="getListingField('subtitle')"
									placeholder="Short tagline"
									@input="setListingField('subtitle', targetValue($event), false)"
									@change="setListingField('subtitle', targetValue($event), true)"
								/>
							</div>

							<div class="editor-field">
								<div class="editor-grid-2">
									<div>
										<label for="char-listing-genre" class="editor-sub-label">Genre</label>
										<input
											type="text"
											id="char-listing-genre"
											name="listingGenre"
											:value="getListingField('genre')"
											placeholder="Genre"
											@input="setListingField('genre', targetValue($event), false)"
											@change="setListingField('genre', targetValue($event), true)"
										/>
									</div>
									<div>
										<label for="char-listing-variant" class="editor-sub-label">Variant</label>
										<input
											type="text"
											id="char-listing-variant"
											name="listingVariant"
											:value="getListingField('variant')"
											placeholder="Edition or format"
											@input="setListingField('variant', targetValue($event), false)"
											@change="setListingField('variant', targetValue($event), true)"
										/>
									</div>
								</div>
							</div>

							<div class="editor-field">
								<label for="char-listing-url">External Link</label>
								<input
									type="url"
									id="char-listing-url"
									name="listingUrl"
									:value="getListingField('url')"
									placeholder="https://..."
									@input="setListingField('url', targetValue($event), false)"
									@change="setListingField('url', targetValue($event), true)"
								/>
							</div>

							<div class="editor-field">
								<label for="char-listing-image">Cover Image</label>
								<div class="editor-watermark-preview-box">
									<div v-if="safeListingImage" class="text-center p-xs">
										<img :src="safeListingImage" class="editor-watermark-preview-img" alt="Cover preview" />
									</div>

									<div class="editor-button-container">
										<div class="editor-button-container-inner">
											<button type="button" class="editor-button" @click.prevent="uploadListingImageStart">
												<span>
													<i class="fas fa-upload" aria-hidden="true"></i>
													{{ getListingField('image') ? 'Change' : 'Upload' }} Cover
												</span>
											</button>
											<button
												type="button"
												class="editor-button editor-btn-danger-mini"
												v-if="getListingField('image')"
												@click.prevent="removeListingImage"
											>
												<span><i class="fas fa-trash-alt" aria-hidden="true"></i> Remove</span>
											</button>
										</div>
									</div>

									<input
										type="file"
										id="char-listing-image-file"
										name="listingImageFile"
										ref="listingImageFileInput"
										class="sr-only"
										aria-label="Upload cover image"
										@change="uploadListingImageProcess"
										accept="image/*"
									/>

									<div class="editor-upload-error" v-if="listingImageError">{{ listingImageError }}</div>

									<div class="mt-sm">
										<label for="char-listing-image" class="editor-sub-label">Image URL</label>
										<input
											type="text"
											id="char-listing-image"
											name="listingImage"
											:value="getListingField('image')"
											placeholder="https://..."
											@input="setListingField('image', targetValue($event), false)"
											@change="setListingField('image', targetValue($event), true)"
										/>
									</div>
								</div>
							</div>

							<div class="editor-field">
								<label for="char-listing-quote">Card Copy</label>
								<textarea
									id="char-listing-quote"
									name="listingQuote"
									:value="getListingField('quote')"
									rows="3"
									placeholder="Defaults to description"
									@input="setListingField('quote', targetValue($event), false)"
									@change="setListingField('quote', targetValue($event), true)"
								></textarea>
							</div>

							<div class="editor-field">
								<div class="editor-label">Ratings</div>
								<div class="editor-listing-ratings-grid mt-xs">
									<div v-for="rf in LISTING_RATING_FIELDS" :key="rf.key">
										<label :for="rf.id" class="editor-sub-label">{{ rf.label }}</label>
										<select
											:id="rf.id"
											:name="rf.name"
											:value="getListingField(rf.key)"
											@change="setListingField(rf.key, targetValue($event))"
										>
											<option v-for="opt in LISTING_RATING_OPTIONS" :key="rf.key + '-' + opt" :value="opt">
												{{ opt || '—' }}
											</option>
										</select>
									</div>
								</div>
							</div>
						</details>

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
							<PageLayoutMini
								:character="props.character"
								@updateCharacter="updateCharacter"
								@selectElement="emit('selectElement', $event)"
							/>
						</div>
					</template>

					<!-- ================= TAB 3: THEME & DICE ================= -->
					<template v-else-if="currentTab === 'theme'">
						<div class="editor-field">
							<div class="editor-row-between mb-sm">
								<div class="editor-label m-0">Sheet Palettes</div>
								<button
									v-if="hasCustomSheetTheme"
									type="button"
									class="editor-tab-btn editor-border-subtle"
									@click.stop="resetSheetPalette"
								>
									Reset
								</button>
							</div>
							<div class="sheet-palette-grid" role="group" aria-label="Sheet palettes">
								<button
									v-for="pal in sheetThemePresets"
									:key="pal.name"
									type="button"
									class="sheet-palette-btn"
									:class="{ active: isPaletteActive(pal) }"
									:aria-pressed="isPaletteActive(pal)"
									@click.stop="applySheetPalette(pal)"
								>
									<span class="sheet-palette-dots" aria-hidden="true">
										<span class="sheet-palette-dot" :style="{ '--swatch-color': pal.primary }"></span>
										<span class="sheet-palette-dot" :style="{ '--swatch-color': pal.accent }"></span>
										<span class="sheet-palette-dot" :style="{ '--swatch-color': pal.secondary }"></span>
									</span>
									<span class="sheet-palette-name">{{ pal.name }}</span>
									<i v-if="isPaletteActive(pal)" class="fas fa-check sheet-palette-check" aria-hidden="true"></i>
								</button>
							</div>
						</div>

						<div class="editor-field">
							<div class="editor-label">Primary Color</div>
							<ColorPicker
								:model-value="rawPrimaryColor"
								input-id="char-primary-color"
								label="Primary Color"
								:fallback-hex="effectivePrimaryHex"
								:allow-clear="true"
								@update:model-value="setPrimaryColor"
								@clear="resetPrimary"
							/>
						</div>

						<div class="editor-field">
							<div class="editor-label">Accent Color</div>
							<ColorPicker
								:model-value="rawAccentColor"
								input-id="char-accent-color"
								label="Accent Color"
								:fallback-hex="effectiveAccentHex"
								:allow-clear="true"
								@update:model-value="setAccentColor"
								@clear="resetAccent"
							/>
						</div>

						<div class="editor-field">
							<div class="editor-label">Secondary Color</div>
							<ColorPicker
								:model-value="rawSecondaryColor"
								input-id="char-secondary-color"
								label="Secondary Color"
								:fallback-hex="effectiveSecondaryHex"
								:allow-clear="true"
								@update:model-value="setSecondaryColor"
								@clear="resetSecondary"
							/>
						</div>

						<!-- TYPOGRAPHY PICKERS WITH LIVE PREVIEW -->
						<div class="editor-field">
							<label for="char-field-heading-font">Heading Font</label>
							<FontPicker
								v-model="headingFont"
								default-font="Josefin Sans"
								input-id="char-field-heading-font"
								name="headingFont"
								label="Heading Font"
								:custom-fonts="customFontsList"
								@reset="resetThemeFont('heading')"
								@add-external-font="({ name, url }) => upsertCustomFontEntry(name, url)"
								@prefill-external-url="handlePrefillExternalUrl"
							/>
						</div>

						<div class="editor-field">
							<label for="char-field-body-font">Body Font</label>
							<FontPicker
								v-model="primaryFont"
								default-font="Open Sans"
								input-id="char-field-body-font"
								name="bodyFont"
								label="Body Font"
								:custom-fonts="customFontsList"
								@reset="resetThemeFont('primary')"
								@add-external-font="({ name, url }) => upsertCustomFontEntry(name, url)"
								@prefill-external-url="handlePrefillExternalUrl"
							/>
						</div>

						<div class="editor-field">
							<label for="char-field-secondary-font">Trait / Label Font</label>
							<FontPicker
								v-model="secondaryFont"
								default-font="Alegreya Sans SC"
								input-id="char-field-secondary-font"
								name="secondaryFont"
								label="Trait / Label Font"
								:custom-fonts="customFontsList"
								described-by="char-font-picker-hint"
								@reset="resetThemeFont('secondary')"
								@add-external-font="({ name, url }) => upsertCustomFontEntry(name, url)"
								@prefill-external-url="handlePrefillExternalUrl"
							/>
							<span id="char-font-picker-hint" class="editor-field-hint">
								Pick a font, type a Google Fonts name, or paste an HTTPS font URL.
							</span>
						</div>

						<!-- EXTERNAL FONTS (NON-GOOGLE HTTPS URLS) -->
						<div class="editor-field editor-box-inset external-fonts-box">
							<div class="editor-label">External Fonts</div>

							<ul v-if="customFontEntries.length" class="external-font-list" role="list">
								<li v-for="entry in customFontEntries" :key="entry.name" class="external-font-item">
									<span
										class="external-font-ag"
										aria-hidden="true"
										:style="{ fontFamily: '\'' + entry.name.replace(/'/g, '') + '\', \'Open Sans\', sans-serif' }"
									>
										Ag
									</span>
									<div class="external-font-meta">
										<span
											class="external-font-name"
											:style="{ fontFamily: '\'' + entry.name.replace(/'/g, '') + '\', \'Open Sans\', sans-serif' }"
										>
											{{ entry.name }}
										</span>
										<span class="external-font-host" :title="entry.url">
											{{ describeExternalFontUrl(entry.url) }}
										</span>
									</div>
									<button
										type="button"
										class="font-picker-icon-btn external-font-remove-btn"
										:title="'Remove ' + entry.name"
										:aria-label="'Remove external font ' + entry.name"
										@click.stop="removeExternalFont(entry.name)"
									>
										<i class="fas fa-xmark" aria-hidden="true"></i>
									</button>
								</li>
							</ul>

							<div class="external-font-form">
								<label for="char-field-font-url" class="editor-sub-label">Font or Stylesheet URL</label>
								<input
									ref="fontUrlInput"
									type="url"
									id="char-field-font-url"
									name="externalFontUrl"
									class="external-font-input"
									v-model="externalFontUrlDraft"
									placeholder="https://..."
									inputmode="url"
									autocomplete="off"
									autocorrect="off"
									autocapitalize="none"
									spellcheck="false"
									enterkeyhint="next"
									:aria-invalid="fontUrlFieldError === 'url' ? 'true' : undefined"
									:aria-describedby="fontUrlError ? 'char-font-url-error char-font-url-hint' : 'char-font-url-hint'"
									@input="onExternalFontUrlInput"
									@keydown.enter="onExternalFontEnter"
								/>

								<label for="char-field-font-url-name" class="editor-sub-label mt-xs">Font Family</label>
								<div class="external-font-name-row">
									<input
										ref="fontUrlNameInput"
										type="text"
										id="char-field-font-url-name"
										name="externalFontName"
										class="external-font-input"
										v-model="externalFontNameDraft"
										placeholder="Family name"
										autocomplete="off"
										autocorrect="off"
										autocapitalize="none"
										spellcheck="false"
										enterkeyhint="done"
										:aria-invalid="fontUrlFieldError === 'name' ? 'true' : undefined"
										:aria-describedby="fontUrlError ? 'char-font-url-error char-font-url-hint' : 'char-font-url-hint'"
										@input="onExternalFontNameInput"
										@keydown.enter="onExternalFontEnter"
									/>
									<button type="button" class="editor-tab-btn external-font-add-btn" @click.stop="addExternalFont">
										<i class="fas fa-plus" aria-hidden="true"></i> Add
									</button>
								</div>
							</div>

							<div v-if="fontUrlError" id="char-font-url-error" class="editor-upload-error" role="alert">
								{{ fontUrlError }}
							</div>
							<span id="char-font-url-hint" class="editor-field-hint">
								Supports HTTPS .woff2, .woff, .ttf, .otf files or CSS stylesheet URLs.
							</span>
						</div>

						<!-- DIE STYLE & GEOMETRY -->
						<div id="die-style-anchor" class="editor-section-divider">Die Style &amp; Geometry</div>

						<!-- DICE THEMES -->
						<div class="editor-field">
							<div class="editor-row-between">
								<div class="editor-label">Dice Themes</div>
								<div class="editor-dice-mode-toggle" role="group" aria-label="Dice theme fill style">
									<button
										type="button"
										class="editor-dice-mode-btn"
										:class="{ active: presetFillMode === 'solid' }"
										:aria-pressed="presetFillMode === 'solid'"
										@click.stop="setPresetFillMode('solid')"
									>
										Solid
									</button>
									<button
										type="button"
										class="editor-dice-mode-btn"
										:class="{ active: presetFillMode === 'gradient' }"
										:aria-pressed="presetFillMode === 'gradient'"
										@click.stop="setPresetFillMode('gradient')"
									>
										Gradient
									</button>
								</div>
							</div>
							<div class="editor-dice-preset-grid mt-xs" role="group" aria-label="Dice themes">
								<button
									v-for="p in dicePresets"
									:key="p.name"
									type="button"
									class="editor-dice-preset-btn"
									:class="{ active: isDicePresetActive(p) }"
									:title="p.name"
									:aria-label="p.name"
									:aria-pressed="isDicePresetActive(p)"
									@click.stop="applyDicePreset(p)"
								>
									<span
										v-for="d in DICE_PREVIEW_SIZES"
										:key="p.name + '-' + presetFillMode + '-d' + d"
										class="editor-dice-preset-die"
										aria-hidden="true"
										v-html="renderDicePreview(d, d !== 4 && d !== 12, presetWithMode(p))"
									></span>
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
								<div>
									<div class="editor-sub-label">
										{{ diceConfig.backgroundType === 'gradient' ? 'Start Color' : 'Fill Color' }}
									</div>
									<ColorPicker
										compact
										:model-value="diceConfig.backgroundColor1 || '#ffffff'"
										input-id="char-field-dice-bg1"
										:label="diceConfig.backgroundType === 'gradient' ? 'Die Fill Start Color' : 'Die Fill Color'"
										fallback-hex="#ffffff"
										@update:model-value="updateDiceProp('backgroundColor1', $event)"
									/>
								</div>

								<div v-if="diceConfig.backgroundType === 'gradient'">
									<div class="editor-sub-label">End Color</div>
									<ColorPicker
										compact
										:model-value="diceConfig.backgroundColor2 || '#f1f5f9'"
										input-id="char-field-dice-bg2"
										label="Die Fill End Color"
										fallback-hex="#f1f5f9"
										@update:model-value="updateDiceProp('backgroundColor2', $event)"
									/>
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
							<div class="editor-label">Numeral Color</div>
							<ColorPicker
								compact
								:model-value="diceConfig.numeralColor || '#000000'"
								input-id="char-field-dice-numeral-color"
								label="Die Numeral Color"
								fallback-hex="#000000"
								@update:model-value="updateDiceProp('numeralColor', $event)"
							/>
						</div>

						<!-- BORDER COLOR & WIDTH -->
						<div class="editor-field">
							<div class="editor-label">Border Color</div>
							<ColorPicker
								compact
								:model-value="diceConfig.borderColor || '#000000'"
								input-id="char-field-dice-border-color"
								label="Die Border Color"
								fallback-hex="#000000"
								@update:model-value="updateDiceProp('borderColor', $event)"
							/>
							<div class="slider-row mt-sm">
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

						<!-- UNFILLED OUTLINE & NUMERAL -->
						<div class="editor-field">
							<div class="editor-label">Unfilled Outline</div>
							<ColorPicker
								compact
								:model-value="
									typeof diceConfig.unfilledBorder === 'string' && diceConfig.unfilledBorder
										? diceConfig.unfilledBorder
										: '#000000'
								"
								input-id="char-field-dice-unfilled-border"
								label="Unfilled Die Outline"
								fallback-hex="#000000"
								@update:model-value="updateDiceProp('unfilledBorder', $event)"
							/>
						</div>

						<div class="editor-field">
							<div class="editor-label">Unfilled Numeral</div>
							<ColorPicker
								compact
								:model-value="
									typeof diceConfig.unfilledNumeral === 'string' && diceConfig.unfilledNumeral
										? diceConfig.unfilledNumeral
										: '#000000'
								"
								input-id="char-field-dice-unfilled-numeral"
								label="Unfilled Die Numeral"
								fallback-hex="#000000"
								@update:model-value="updateDiceProp('unfilledNumeral', $event)"
							/>
						</div>

						<!-- RESET DICE BUTTON -->
						<div class="editor-field mt-md">
							<button type="button" class="editor-tab-btn editor-full-btn" @click.stop="resetDiceConfig">
								<i class="fas fa-undo"></i> Reset Dice
							</button>
						</div>
					</template>
				</div>
			</div>
		</div>
	</aside>
</template>
