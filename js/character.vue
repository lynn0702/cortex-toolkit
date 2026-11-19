<script setup lang="ts">
import {
	computed,
	defineAsyncComponent,
	getCurrentInstance,
	inject,
	nextTick,
	onMounted,
	onUnmounted,
	provide,
	ref,
	watch,
} from 'vue';
import type { ToastOptions } from './use-toast.ts';
import type { EditingPath } from './use-history.ts';
import type { DiceItem, DicePool } from './dice-pool.ts';
import { characterCurioFunctions, characterCurioSetPresets, type SetPresetEntry } from './functions.ts';
import {
	DIE_LADDER,
	getView,
	ensureView,
	isNameSet,
	getRating,
	ratingDice,
	resolveVisibility,
	isHiddenIn,
	resolveSetPillar,
	getPillarLabel,
	resolveAltRoll,
	resolvePlotPoints,
	getCuriosityGame,
	type Character,
	type SheetTemplate,
	type TraitSet,
	type Trait,
	type ViewBag,
	type CharacterCurioCustom,
} from './model.ts';
import {
	getSheetSections as gridGetSheetSections,
	getSheetGridStyle as gridGetSheetGridStyle,
	type SheetSection,
} from './sheet-grid.ts';
import TraitSetBlock from './trait-set-block.vue';
import ModalDialog from './modal-dialog.vue';
import PresetGalleryCard from './preset-gallery-card.vue';
import { isHexColor, isLightHex } from './color-palette.ts';

const PrintToolbar = defineAsyncComponent(() => import('./print-toolbar.vue'));
const TraitSetMini = defineAsyncComponent(() => import('./trait-set-mini.vue'));

const props = defineProps<{
	submode?: string | null;
	character?: Character;
	editing?: EditingPath | null;
	viewY?: number | null;
	dicePool?: DicePool | { items?: DiceItem[] } | null;
	isDesktopPillars?: boolean;
}>();

const emit = defineEmits<{
	(e: 'selectElement', selector: EditingPath): void;
	(e: 'updateCharacter', character: Character): void;
	(e: 'exportCharacter', id: string): void;
	(e: 'saveSheetTemplate'): void;
	(e: 'exportSheetTemplate'): void;
	(e: 'addDieToRoller', die: Partial<DiceItem> | Partial<DiceItem>[]): void;
	(e: 'closeDrawer'): void;
}>();

const instance = getCurrentInstance();
const rootTemplates = (): SheetTemplate[] | null => {
	const root = (instance?.proxy?.$root as { sheetTemplates?: SheetTemplate[] } | null | undefined) ?? null;
	return root?.sheetTemplates ?? null;
};
const showToast = inject<((msg: string, options?: ToastOptions) => void) | null>('showToast', null);

const rootEl = ref<HTMLElement | null>(null);

const printPageView = ref<'all' | number>('all');
const printBlank = ref(false);
const printBW = ref(false);
const showInlineAddSet = ref(false);
const inlineAddPage = ref(1);
const inlineBuiltInPresets = Object.values(characterCurioSetPresets);
const inlineCustomPresets = ref<SetPresetEntry[]>([]);

const canvasInlineTrait = ref<[number, number] | null>(null);
const canvasInlineSet = ref<number | null>(null);
const canvasInlinePartSet = ref<number | null>(null);
const canvasInlinePartTrait = ref<[number, number] | null>(null);

function requestCanvasFocus(targetEl?: HTMLElement | null) {
	if (Array.isArray(props.editing) && props.editing.length > 0) {
		clearSelected();
	}
	emit('closeDrawer');
	if (!targetEl) return;
	nextTick(() => {
		const scrollRun = () => {
			if (typeof targetEl.scrollIntoView === 'function') {
				targetEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
			}
		};
		if (typeof requestAnimationFrame === 'function') requestAnimationFrame(scrollRun);
		else scrollRun();
	});
}

function setCanvasInlineTrait(target: [number, number] | null) {
	canvasInlineTrait.value = target;
	if (target) {
		if (
			canvasInlinePartTrait.value &&
			(canvasInlinePartTrait.value[0] !== target[0] || canvasInlinePartTrait.value[1] !== target[1])
		) {
			canvasInlinePartTrait.value = null;
		}
		canvasInlineSet.value = null;
		showInlineAddSet.value = false;
		isAddingPillar.value = false;
		if (props.submode === 'edit') {
			nextTick(() => {
				const el =
					rootEl.value?.querySelector<HTMLElement>(`[data-set-index="${target[0]}"] .inline-rating-bar`) ||
					rootEl.value?.querySelector<HTMLElement>(`[data-set-index="${target[0]}"] input.trait-name-inline-input`) ||
					null;
				requestCanvasFocus(el);
			});
		}
	} else {
		canvasInlinePartTrait.value = null;
	}
}

function setCanvasInlineSet(setIdx: number | null) {
	canvasInlineSet.value = setIdx;
	if (setIdx !== null) {
		canvasInlineTrait.value = null;
		canvasInlinePartTrait.value = null;
		canvasInlinePartSet.value = null;
		showInlineAddSet.value = false;
		isAddingPillar.value = false;
		if (props.submode === 'edit') {
			nextTick(() => {
				const el = rootEl.value?.querySelector<HTMLElement>(`[data-set-index="${setIdx}"]`) || null;
				requestCanvasFocus(el);
			});
		}
	}
}

function setCanvasInlinePartSet(setIdx: number | null) {
	canvasInlinePartSet.value = setIdx;
	if (setIdx !== null) {
		canvasInlinePartTrait.value = null;
		showInlineAddSet.value = false;
		isAddingPillar.value = false;
		if (props.submode === 'edit') {
			requestCanvasFocus();
		}
	}
}

function setCanvasInlinePartTrait(target: [number, number] | null, triggerEl?: HTMLElement | null) {
	canvasInlinePartTrait.value = target;
	if (target) {
		if (
			canvasInlineTrait.value &&
			(canvasInlineTrait.value[0] !== target[0] || canvasInlineTrait.value[1] !== target[1])
		) {
			canvasInlineTrait.value = null;
		}
		canvasInlineSet.value = null;
		canvasInlinePartSet.value = null;
		showInlineAddSet.value = false;
		isAddingPillar.value = false;
		if (props.submode === 'edit') {
			requestCanvasFocus(triggerEl);
		}
	}
}

provide('curioCanvasInline', {
	activeTrait: canvasInlineTrait,
	activeSet: canvasInlineSet,
	activePartSet: canvasInlinePartSet,
	activePartTrait: canvasInlinePartTrait,
	setActiveTrait: setCanvasInlineTrait,
	setActiveSet: setCanvasInlineSet,
	setActivePartSet: setCanvasInlinePartSet,
	setActivePartTrait: setCanvasInlinePartTrait,
	requestCanvasFocus,
});

watch(
	() => props.editing,
	(sel) => {
		if (Array.isArray(sel) && sel.length > 0) {
			canvasInlineTrait.value = null;
			canvasInlineSet.value = null;
			canvasInlinePartSet.value = null;
			canvasInlinePartTrait.value = null;
			showInlineAddSet.value = false;
			isAddingPillar.value = false;
		}
	},
);

watch(
	() => props.submode,
	() => {
		canvasInlineTrait.value = null;
		canvasInlineSet.value = null;
		canvasInlinePartSet.value = null;
		canvasInlinePartTrait.value = null;
		isAddingPillar.value = false;
	},
);

function toggleInlineAdd(page = 1, triggerEl?: HTMLElement | null) {
	const wasOpenHere = showInlineAddSet.value && inlineAddPage.value === page;
	inlineAddPage.value = page;
	inlineCustomPresets.value = characterCurioFunctions.getCustomSetPresets();
	canvasInlinePartSet.value = null;
	canvasInlinePartTrait.value = null;
	isAddingPillar.value = false;
	showInlineAddSet.value = !wasOpenHere;
	if (!wasOpenHere && props.submode === 'edit') {
		nextTick(() => {
			const area = rootEl.value?.querySelector<HTMLElement>('.inline-add-set-area') || triggerEl || null;
			requestCanvasFocus(area);
		});
	}
}

function removeCustomPreset(id: string) {
	const removed = characterCurioFunctions.getCustomSetPresets().find((p) => p.id === id);
	const next = characterCurioFunctions.deleteCustomSetPreset(id);
	inlineCustomPresets.value = next;
	playCustomPresets.value = next;
	if (removed && showToast) {
		showToast(`Removed preset "${removed.label}"`, {
			actionLabel: 'Undo',
			onAction: () => {
				characterCurioFunctions.upsertCustomSetPresets([removed]);
			},
		});
	}
}

function editCustomPreset(preset: SetPresetEntry, origin: 'edit' | 'play') {
	editingCustomPreset.value = preset;
	miniOrigin.value = origin;
	showInlineAddSet.value = false;
	showPlayPresetPicker.value = false;
	showPlayMini.value = true;
}

function openMiniFromInline() {
	editingCustomPreset.value = null;
	miniOrigin.value = 'edit';
	showInlineAddSet.value = false;
	showPlayMini.value = true;
}

function openPlayMini() {
	editingCustomPreset.value = null;
	miniOrigin.value = 'play';
	showPlayPresetPicker.value = false;
	showPlayMini.value = true;
}

function closePlayMini() {
	showPlayMini.value = false;
	editingCustomPreset.value = null;
}

const showPlayPresetPicker = ref(false);
const showPlayMini = ref(false);
const editingCustomPreset = ref<SetPresetEntry | null>(null);
const miniOrigin = ref<'edit' | 'play'>('play');
const targetPlayPillar = ref<string | null>(null);
const isAddingPillar = ref(false);
const newPillarName = ref('');
const pillarInputRef = ref<HTMLInputElement | HTMLInputElement[] | null>(null);
const PLAY_EXCLUDED_PRESET_IDS = new Set(['framed-ring', 'divider-line']);
const playBuiltInPresets = Object.values(characterCurioSetPresets).filter((p) => !PLAY_EXCLUDED_PRESET_IDS.has(p.id));
const playCustomPresets = ref<SetPresetEntry[]>([]);
const isMobileViewport = ref(
	typeof window !== 'undefined' && Boolean(window.matchMedia && window.matchMedia('(max-width: 48rem)').matches),
);
const internalDesktopPillars = ref<boolean>(
	typeof localStorage !== 'undefined' ? localStorage.getItem('characterCurioPlayPillars') === 'true' : false,
);
const effectiveDesktopPillars = computed(() => {
	if (props.isDesktopPillars !== undefined) return props.isDesktopPillars;
	return internalDesktopPillars.value;
});
const isPillarPlay = computed(
	() => props.submode === 'play' && (isMobileViewport.value || effectiveDesktopPillars.value),
);

function toggleDesktopPillars() {
	const next = !effectiveDesktopPillars.value;
	if (next && typeof window !== 'undefined') {
		savedSheetScrollY = window.scrollY || document.documentElement.scrollTop || 0;
	}
	internalDesktopPillars.value = next;
	if (typeof localStorage !== 'undefined') {
		localStorage.setItem('characterCurioPlayPillars', String(next));
	}
	setupCarouselObserver();
}

let savedSheetScrollY = 0;
watch(isPillarPlay, (isPillar, wasPillar) => {
	if (!wasPillar && isPillar) {
		if (typeof window !== 'undefined' && !savedSheetScrollY) {
			savedSheetScrollY = window.scrollY || document.documentElement.scrollTop || 0;
		}
	} else if (wasPillar && !isPillar) {
		const targetY = savedSheetScrollY;
		savedSheetScrollY = 0;
		nextTick(() => {
			if (typeof window !== 'undefined') {
				window.scrollTo(0, targetY);
				requestAnimationFrame(() => {
					window.scrollTo(0, targetY);
				});
			}
		});
	}
});
watch(
	() => props.character?.id,
	() => {
		savedSheetScrollY = 0;
	},
);

const name = computed(() => props.character?.name ?? '');
const game = computed(() => getCuriosityGame(props.character));
const traitSets = computed(() => props.character?.traitSets ?? []);

const pageCount = computed(() => {
	const charView = getView(props.character);
	if (charView?.pageCount) {
		return Math.max(1, Number(charView.pageCount));
	}
	let maxPage = 1;
	for (const ts of props.character?.traitSets || []) {
		const p = getView(ts)?.page;
		if (p && p > maxPage) {
			maxPage = p;
		}
	}
	return maxPage;
});

const isPrintSubmode = computed(() => props.submode === 'print');
const effectivePrintBW = computed(() => isPrintSubmode.value && printBW.value);
const effectivePrintBlank = computed(() => isPrintSubmode.value && printBlank.value);
const pageJustification = computed(() => getView(props.character)?.pageJustification || 'top-base');

const pageOrientation = computed(() => {
	const charView = getView(props.character);
	const o = charView?.pageOrientation || charView?.orientation;
	return o === 'landscape' ? 'landscape' : 'portrait';
});
const isLandscape = computed(() => pageOrientation.value === 'landscape');

const descriptionText = computed({
	get() {
		return props.character?.description ?? '';
	},
	set(val: string) {
		if (!props.character) return;
		props.character.description = val;
		updateCharacter(props.character);
	},
});

const printPages = computed(() => {
	if (isPillarPlay.value) return [1];
	if (props.submode === 'print' && printPageView.value !== 'all') {
		return [Number(printPageView.value)];
	}
	const pages: number[] = [];
	for (let i = 1; i <= pageCount.value; i++) {
		pages.push(i);
	}
	return pages;
});

const hasAnyWatermark = computed(() => {
	const wm = getView(props.character)?.watermark;
	return Boolean(wm?.enabled && wm?.url);
});

const characterSheetStyle = computed(() => {
	const ctk: ViewBag = getView(props.character) || {};
	const style: Record<string, string> = {};

	if (isLandscape.value) {
		style['--page-width'] = '297.1mm';
		style['--page-height'] = '210mm';
	} else {
		style['--page-width'] = '210mm';
		style['--page-height'] = '297.1mm';
	}

	if (ctk.accentColor) style['--color-interactive'] = ctk.accentColor;
	if (ctk.primaryColor) style['--color-primary'] = ctk.primaryColor;
	if (ctk.secondaryColor) {
		style['--color-secondary'] = ctk.secondaryColor;
		if (isHexColor(ctk.secondaryColor)) {
			style['--pp-badge-ink'] = isLightHex(ctk.secondaryColor) ? '#0f172a' : '#ffffff';
		}
	}

	if (ctk.theme?.fonts?.heading) style['--font-heading'] = `'${ctk.theme.fonts.heading}', sans-serif`;
	if (ctk.theme?.fonts?.primary) style['--font-primary'] = `'${ctk.theme.fonts.primary}', sans-serif`;
	if (ctk.theme?.fonts?.secondary) style['--font-secondary'] = `'${ctk.theme.fonts.secondary}', sans-serif`;

	return style;
});

// PRESENTATION
function isSelected(selector: unknown[]) {
	return characterCurioFunctions.arraysMatch(props.editing, selector);
}

function openThemeEditor() {
	selectElement(['theme']);
}
function openSheetEditor() {
	selectElement(['name']);
}
function openPageEditor() {
	selectElement(['page']);
}
function openDiceEditor() {
	selectElement(['dice']);
}

function applyFonts() {
	const ctk = getView(props.character);
	if (!ctk || typeof characterCurioFunctions === 'undefined') return;
	const customNames = new Set<string>();
	if (Array.isArray(ctk.customFonts) && characterCurioFunctions.applyCustomFont) {
		ctk.customFonts.forEach((f) => {
			if (f.name && f.url && characterCurioFunctions.applyCustomFont(f.name, f.url)) {
				customNames.add(f.name.trim().toLowerCase());
			}
		});
	}
	if (ctk.theme?.fonts) {
		const isCustom = (name?: string) => Boolean(name && customNames.has(name.trim().toLowerCase()));
		if (ctk.theme.fonts.heading && !isCustom(ctk.theme.fonts.heading) && characterCurioFunctions.loadGoogleFont)
			characterCurioFunctions.loadGoogleFont(ctk.theme.fonts.heading);
		if (ctk.theme.fonts.primary && !isCustom(ctk.theme.fonts.primary) && characterCurioFunctions.loadGoogleFont)
			characterCurioFunctions.loadGoogleFont(ctk.theme.fonts.primary);
		if (ctk.theme.fonts.secondary && !isCustom(ctk.theme.fonts.secondary) && characterCurioFunctions.loadGoogleFont)
			characterCurioFunctions.loadGoogleFont(ctk.theme.fonts.secondary);
	}
	if (ctk.diceConfig && typeof window !== 'undefined') {
		(window as Window & { __characterCurioActiveDiceConfig?: unknown }).__characterCurioActiveDiceConfig =
			ctk.diceConfig;
	}
}

function renderText(text: unknown) {
	return characterCurioFunctions.renderText(text);
}
function renderDieValue(value: number) {
	return characterCurioFunctions.renderDieconSVG(value, false, '', getView(props.character)?.diceConfig);
}

function getSheetSections(pageIndex: number) {
	return gridGetSheetSections(traitSets.value, pageIndex, props.submode);
}
function getSheetGridStyle(section: SheetSection) {
	return gridGetSheetGridStyle(section);
}

// SELECTING
function selectElement(selector: EditingPath) {
	if (props.submode === 'print') return;
	if (props.submode === 'play') {
		if (!selector.length || selector[0] === 'trait') {
			emit('selectElement', selector);
		}
		return;
	}
	emit('selectElement', selector);
}

function clearSelected() {
	emit('selectElement', []);
}

// EDITING
// New sets carry no place: they stack full-width in document order, which
// lands them on their own row at the end of the target page (sparse).
function addTraitSet(page = 1) {
	const character = props.character as Character;
	if (!character) return;

	const traitSet = structuredClone(characterCurioFunctions.defaultTraitSet) as unknown as TraitSet;

	traitSet.name = characterCurioFunctions.nextUniqueName(
		(character.traitSets || []).map((ts) => ts?.name),
		'New Set',
	);
	traitSet.traits = [];
	ensureView(traitSet).header = 'top';
	if ((page ?? 1) > 1) {
		ensureView(traitSet).page = page;
	}
	characterCurioFunctions.ensureTraitSetIds({ traitSets: [...(character.traitSets || []), traitSet] });

	character.traitSets.push(traitSet);
	updateCharacter(character);
	showInlineAddSet.value = false;
	isAddingPillar.value = false;

	const newTraitSetID = character.traitSets.length - 1;
	setCanvasInlineSet(newTraitSetID);
	nextTick(() => {
		const nameInput = rootEl.value?.querySelector<HTMLInputElement>(
			`[data-set-index="${newTraitSetID}"] input.trait-set-name-inline-input`,
		);
		nameInput?.focus();
		nameInput?.select();
	});
}

function removeTraitSet(traitSetID: number) {
	const character = props.character as Character;
	if (isNameSet(character?.traitSets?.[traitSetID])) return;

	canvasInlineSet.value = null;
	canvasInlineTrait.value = null;
	canvasInlinePartSet.value = null;
	clearSelected();

	const entry = characterCurioFunctions.resolveTemplateFor(character, rootTemplates());
	characterCurioFunctions.removeTraitSetFromSheet(character, entry, traitSetID);

	updateCharacter(character);
}

function stampPlaySetOptions(traitSet: TraitSet) {
	const v = ensureView(traitSet) as Record<string, unknown>;
	v.visibility = 'play-only';
	v.playMutable = true;
	if (sheetUsesPillars.value) {
		const pKey = targetPlayPillar.value || activeMobilePillarKey.value || mobilePillarColumns.value[0]?.key || 'sheet';
		v.pillar = pKey;
	} else {
		delete v.pillar;
	}
}

function addPresetSet(preset: SetPresetEntry, page?: number) {
	const character = props.character as Character;
	if (!character || !preset) return;
	const traitSet: TraitSet = characterCurioFunctions.instantiateSetPreset(preset, character, page ?? 1);
	if (props.submode === 'play') {
		stampPlaySetOptions(traitSet);
	} else if (props.submode === 'edit' && Boolean(characterCurioSetPresets[preset.id])) {
		const v = ensureView(traitSet) as Record<string, unknown>;
		if (v.visibility === 'play-only') delete v.visibility;
		if (v.pillar === 'play') delete v.pillar;
	}
	targetPlayPillar.value = null;
	character.traitSets.push(traitSet);
	updateCharacter(character);
	showInlineAddSet.value = false;
	showPlayPresetPicker.value = false;
	const newTraitSetID = character.traitSets.length - 1;
	if (props.submode === 'edit') {
		selectElement(['traitSet', newTraitSetID]);
	} else if (props.submode === 'play') {
		const pKey = sheetUsesPillars.value ? resolveSetPillar(traitSet) : 'sheet';
		nextTick(() => scrollToPillar(pKey, newTraitSetID));
	}
}

function applyMiniSet(builtSet: TraitSet) {
	const character = props.character as Character;
	if (!character || !builtSet) return;
	const traitSet: TraitSet = structuredClone(builtSet);
	if (typeof traitSet.name === 'string' && traitSet.name.trim().length > 0) {
		traitSet.name = characterCurioFunctions.nextUniqueName(
			(character.traitSets || []).map((ts) => ts?.name),
			traitSet.name.trim(),
		);
	}
	if (miniOrigin.value === 'play') {
		stampPlaySetOptions(traitSet);
	} else if ((inlineAddPage.value ?? 1) > 1) {
		ensureView(traitSet).page = inlineAddPage.value;
	}
	targetPlayPillar.value = null;
	characterCurioFunctions.ensureTraitSetIds({ traitSets: [...(character.traitSets || []), traitSet] });
	if (!Array.isArray(character.traitSets)) character.traitSets = [];
	character.traitSets.push(traitSet);
	updateCharacter(character);
	showPlayMini.value = false;
	const newTraitSetID = character.traitSets.length - 1;
	if (props.submode === 'edit') {
		selectElement(['traitSet', newTraitSetID]);
	} else if (props.submode === 'play') {
		const pKey = sheetUsesPillars.value ? resolveSetPillar(traitSet) : 'sheet';
		nextTick(() => scrollToPillar(pKey, newTraitSetID));
	}
}

function openPlayPresetPicker(pillarKey?: string) {
	targetPlayPillar.value = typeof pillarKey === 'string' && pillarKey.trim().length > 0 ? pillarKey.trim() : null;
	playCustomPresets.value = characterCurioFunctions.getCustomSetPresets();
	showPlayPresetPicker.value = true;
}

function startAddPillar(triggerEl?: HTMLElement | null) {
	showInlineAddSet.value = false;
	canvasInlinePartSet.value = null;
	canvasInlinePartTrait.value = null;
	isAddingPillar.value = true;
	newPillarName.value = '';
	if (props.submode === 'edit') {
		nextTick(() => {
			const formArea = rootEl.value?.querySelector<HTMLElement>('.inline-add-pillar-area') || triggerEl || null;
			requestCanvasFocus(formArea);
		});
	}
	nextTick(() => {
		const el = Array.isArray(pillarInputRef.value) ? pillarInputRef.value[0] : pillarInputRef.value;
		el?.focus();
	});
}

function cancelAddPillar() {
	isAddingPillar.value = false;
	newPillarName.value = '';
}

function onPillarInputKeydown(event: KeyboardEvent) {
	if (event.isComposing || event.keyCode === 229) return;
	if (event.key === 'Escape') {
		event.preventDefault();
		cancelAddPillar();
	} else if (event.key === 'Enter') {
		event.preventDefault();
		confirmAddPillar();
	}
}

function confirmAddPillar() {
	const character = props.character as Character;
	if (!character) return;
	const wasUnified = !sheetUsesPillars.value;
	const charView = ensureView(character);
	let existingKeys: string[];
	if (wasUnified) {
		existingKeys = ['sheet'];
	} else if (Array.isArray(charView.pillars) && charView.pillars.length > 0) {
		existingKeys = [...charView.pillars];
	} else if (mobilePillarColumns.value.length > 0) {
		existingKeys = mobilePillarColumns.value.map((c) => c.key);
	} else {
		const collected: string[] = [];
		for (const ts of character.traitSets || []) {
			if (!ts) continue;
			const p = resolveSetPillar(ts);
			if (p && !collected.includes(p)) collected.push(p);
		}
		existingKeys = collected.length ? collected : ['prime'];
	}
	const rawLabel = newPillarName.value.trim() || `Pillar ${existingKeys.length + 1}`;
	const baseSlug =
		rawLabel
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-+|-+$/g, '') || 'pillar';
	const taken = new Set(existingKeys);
	let newKey = baseSlug;
	let suffix = 2;
	while (taken.has(newKey)) {
		newKey = `${baseSlug}-${suffix++}`;
	}
	if (wasUnified && Array.isArray(character.traitSets)) {
		for (const ts of character.traitSets) {
			if (!ts || isHiddenIn(ts, 'play')) continue;
			const tsView = ensureView(ts);
			if (!tsView.pillar) {
				tsView.pillar = 'sheet';
			}
		}
	}
	existingKeys.push(newKey);
	charView.pillars = existingKeys;
	if (!charView.labels || typeof charView.labels !== 'object') charView.labels = {};
	if (!charView.labels.pillars || typeof charView.labels.pillars !== 'object') charView.labels.pillars = {};
	charView.labels.pillars[newKey] = rawLabel;
	isAddingPillar.value = false;
	newPillarName.value = '';
	updateCharacter(character);
	if (isPillarPlay.value) {
		nextTick(() => scrollToPillar(newKey));
	}
}

function getTraitSetRatings(traitSet: TraitSet) {
	return characterCurioFunctions.getTraitSetRatings(traitSet);
}

function addTrait(traitSetID: number) {
	const character = props.character as Character;
	const traitSet = character.traitSets[traitSetID];
	const noun = traitSet.noun && traitSet.noun.length ? traitSet.noun : 'Trait';

	const trait = structuredClone(characterCurioFunctions.defaultTrait) as unknown as Trait;
	trait.name = characterCurioFunctions.nextUniqueName(
		(Array.isArray(traitSet.traits) ? traitSet.traits : []).map((tr) => tr?.name),
		'New ' + noun,
	);
	const setR = isNameSet(traitSet) ? undefined : getRating(traitSet);
	if (setR?.type === 'Pip') {
		trait.rating = { value: [false] };
	} else if (setR?.type === 'Counter') {
		trait.rating = { value: [typeof setR.value?.[0] === 'number' ? setR.value[0] : 0] };
	} else if (setR?.type === 'Dice') {
		const setDice = ratingDice(setR);
		trait.rating = {
			value: setDice.length ? [...setDice] : [8, 8],
		};
		if (traitSet.pool === true) trait.pool = true;
	} else if (!isNameSet(traitSet) && traitSet.rating === null) {
		delete trait.rating;
	} else {
		const allowed = characterCurioFunctions.getTraitSetRatings(traitSet);
		const cur =
			trait.rating &&
			typeof trait.rating === 'object' &&
			trait.rating.type === 'Die' &&
			Array.isArray(trait.rating.value)
				? Number(trait.rating.value[0]) || 0
				: 0;
		const isDefaultLadder = allowed.length === DIE_LADDER.length && allowed.every((x, i) => x === DIE_LADDER[i]);
		if (allowed.length > 0 && !allowed.includes(cur)) {
			trait.rating = isDefaultLadder
				? { type: 'Die', value: [allowed[0]] }
				: { type: 'Die', value: [allowed[0]], range: allowed.slice() };
		} else if (!isDefaultLadder && allowed.length > 0 && trait.rating && typeof trait.rating === 'object') {
			trait.rating.range = allowed.slice();
		}
	}

	if (!Array.isArray(traitSet.traits)) traitSet.traits = [];
	traitSet.traits.push(trait);

	updateCharacter(character);

	const newTraitID = traitSet.traits.length - 1;
	const isPlayMutable = Boolean(getView(traitSet)?.playMutable || resolveVisibility(traitSet) === 'play-only');
	if (props.submode === 'edit' || (props.submode === 'play' && isPlayMutable)) {
		setCanvasInlineTrait([traitSetID, newTraitID]);
		nextTick(() => {
			const input = rootEl.value?.querySelector<HTMLInputElement>(
				`[data-set-index="${traitSetID}"] input.trait-name-inline-input`,
			);
			input?.focus();
			input?.select();
		});
	} else {
		selectElement(['trait', traitSetID, newTraitID]);
	}
}

function removeTrait(traitSetID: number, traitID: number) {
	canvasInlineTrait.value = null;
	clearSelected();

	setTimeout(() => {
		const character = props.character as Character;
		const entry = characterCurioFunctions.resolveTemplateFor(character, rootTemplates());
		characterCurioFunctions.removeTraitFromSheet(character, entry, traitSetID, traitID);
		updateCharacter(character);
	}, 200);
}

function updateCharacter(character: Character) {
	emit('updateCharacter', character);
}

function adjustPlotPoints(delta: number) {
	if (!props.character) return;
	const current = resolvePlotPoints(props.character);
	props.character.plotPoints = Math.max(0, current + delta);
	updateCharacter(props.character);
}

function exportCharacter() {
	emit('exportCharacter', (props.character as Character).id);
}

function renderNotesText(text: unknown) {
	if (!text) return '';
	return characterCurioFunctions.renderMarkdown(text);
}

function hasWatermark(pageIndex: number) {
	const wm = getView(props.character)?.watermark;
	if (!wm || !wm.enabled || !wm.url) return false;
	if (!wm.page || wm.page === 'all') return true;
	return Number(wm.page) === Number(pageIndex);
}

function getWatermarkStyle(pageIndex: number) {
	const wm = getView(props.character)?.watermark;
	if (!wm) return '';
	const url = characterCurioFunctions.safeImageUrl(wm.url);
	if (!url) return '';
	const opacity = Number(wm.opacity);
	const scale = Number(wm.scale);
	return `background-image: url('${url}'); opacity: ${isNaN(opacity) ? 0.08 : opacity}; background-size: ${isNaN(scale) ? 75 : scale}%;`;
}

function print() {
	let cleanup: (() => void) | null = null;
	if (isLandscape.value) {
		const style = document.createElement('style');
		style.id = 'dynamic-print-page';
		style.textContent = '@page { size: landscape; margin: 8mm; }';
		document.head.appendChild(style);
		cleanup = () => {
			style.remove();
			window.removeEventListener('afterprint', cleanup!);
		};
		window.addEventListener('afterprint', cleanup, { once: true });
	}
	window.print();
	if (cleanup) {
		setTimeout(cleanup, 1000);
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
	sets: MobilePillarSetItem[];
	stagedCount: number;
}

const activeMobilePillarKey = ref<string>('prime');
const jumpStripRef = ref<HTMLElement | HTMLElement[] | null>(null);
let carouselObserver: IntersectionObserver | null = null;
let mediaQuery: MediaQueryList | null = null;
let handleMediaChange: (() => void) | null = null;

function getMobileJumpPillLabel(traitSet: TraitSet | null | undefined, orderIdx: number): string {
	if (isNameSet(traitSet)) return props.character?.name?.trim() || traitSet?.name || 'Name';
	if (traitSet?.name && String(traitSet.name).trim().length) return String(traitSet.name).trim();
	if (traitSet?.noun && String(traitSet.noun).trim().length) return String(traitSet.noun).trim();
	const body = getView(traitSet)?.style?.body;
	if (body === 'image') return 'Portrait';
	return `Set ${orderIdx + 1}`;
}

function countStagedDiceForSets(sets: TraitSet[]): number {
	const items = props.dicePool?.items;
	if (!Array.isArray(items) || !items.length || !sets.length) return 0;
	const names = new Set<string>();
	for (const ts of sets) {
		if (!ts) continue;
		if (isNameSet(ts)) {
			const charName = props.character?.name?.trim().toLowerCase();
			if (charName) names.add(charName);
			names.add('sheet');
		}
		if (ts.name?.trim()) names.add(ts.name.trim().toLowerCase());
		if (ts.noun?.trim()) names.add(ts.noun.trim().toLowerCase());
		for (const tr of ts.traits || []) {
			if (tr?.name?.trim()) {
				const n = tr.name.trim().toLowerCase();
				names.add(n);
				const alt = resolveAltRoll(tr, ts);
				if (alt) names.add(`${n} (${alt.label.toLowerCase()})`);
			}
			for (const sub of tr?.traits || []) {
				if (sub?.name?.trim()) names.add(sub.name.trim().toLowerCase());
			}
		}
	}
	if (!names.size) return 0;
	let count = 0;
	for (const item of items) {
		const src = String(item?.source || '')
			.trim()
			.toLowerCase();
		if (src && names.has(src)) count++;
	}
	return count;
}

const sheetUsesPillars = computed<boolean>(() => {
	if (!props.character) return false;
	const explicitPillars = getView(props.character)?.pillars;
	if (Array.isArray(explicitPillars) && explicitPillars.length > 0) return true;
	if (pageCount.value > 1) return true;
	const allSets = Array.isArray(props.character.traitSets) ? props.character.traitSets : [];
	const visibleBaseSets = allSets.filter((ts) => {
		if (!ts || isHiddenIn(ts, 'play')) return false;
		const vis = resolveVisibility(ts);
		const v = getView(ts);
		if (vis === 'play-only' || v?.playMutable === true) return false;
		return true;
	});
	for (const ts of visibleBaseSets) {
		const v = getView(ts);
		if (typeof v?.pillar === 'string' && v.pillar.trim().length > 0) return true;
		const frameObj = typeof v?.frame === 'object' ? v.frame : null;
		if (
			(v?.style?.body === 'portrait-ring' || frameObj?.array === 'ring' || frameObj?.array === 'arc') &&
			visibleBaseSets.length > 1
		) {
			return true;
		}
		const place = v?.place;
		if (place && typeof place === 'object') {
			const rawW = (place as { width?: unknown }).width;
			const w = typeof rawW === 'string' ? Number(rawW.replace(/%/g, '')) : Number(rawW);
			if (Number.isFinite(w) && w > 0 && w < 99) return true;
			const rawL = (place as { left?: unknown }).left;
			const l = typeof rawL === 'string' ? Number(rawL.replace(/%/g, '')) : Number(rawL);
			if (Number.isFinite(l) && l > 0.5) return true;
		}
	}
	return false;
});

const pillarOptions = computed<ReadonlyArray<{ key: string; label: string }>>(() => {
	const baseKeys = ['prime', 'plus', 'play'];
	const explicit = Array.isArray(getView(props.character)?.pillars)
		? getView(props.character)!.pillars!.filter((k): k is string => typeof k === 'string' && k.trim().length > 0)
		: [];
	const keys: string[] = [...baseKeys];
	for (const k of explicit) {
		if (!keys.includes(k)) keys.push(k);
	}
	for (const ts of props.character?.traitSets || []) {
		if (!ts) continue;
		const p = resolveSetPillar(ts);
		if (p && !keys.includes(p)) keys.push(p);
	}
	return [{ key: '', label: 'Auto' }, ...keys.map((k) => ({ key: k, label: getPillarLabel(props.character, k) }))];
});

function setSetPillar(ts: TraitSet | null | undefined, val: string) {
	if (!ts || !props.character) return;
	const v = ensureView(ts) as Record<string, unknown>;
	const trimmed = String(val || '').trim();
	if (trimmed) v.pillar = trimmed;
	else delete v.pillar;
	updateCharacter(props.character);
}

provide('curioPillarContext', {
	sheetUsesPillars,
	pillarOptions,
	setSetPillar,
});

const mobilePillarColumns = computed<MobilePillarColumn[]>(() => {
	if (props.submode !== 'play' || !props.character) return [];
	const allSets = Array.isArray(props.character.traitSets) ? props.character.traitSets : [];

	if (!sheetUsesPillars.value) {
		const sheetSets: MobilePillarSetItem[] = [];
		allSets.forEach((ts, idx) => {
			if (isHiddenIn(ts, 'play')) return;
			sheetSets.push({
				traitSet: ts,
				index: idx,
				label: getMobileJumpPillLabel(ts, sheetSets.length),
			});
		});
		return [
			{
				key: 'sheet',
				label: getPillarLabel(props.character, 'sheet'),
				sets: sheetSets,
				stagedCount: countStagedDiceForSets(sheetSets.map((s) => s.traitSet)),
			},
		];
	}

	const explicitPillars = Array.isArray(getView(props.character)?.pillars)
		? getView(props.character)!.pillars!.filter((k): k is string => typeof k === 'string' && k.trim().length > 0)
		: [];
	const explicitSet = new Set<string>(explicitPillars);
	const byPillar = new Map<string, MobilePillarSetItem[]>();
	const seenCustomKeys: string[] = [];
	const standardOrder = ['prime', 'plus', 'play'];

	const ensureBucket = (key: string) => {
		if (!byPillar.has(key)) {
			byPillar.set(key, []);
			if (!standardOrder.includes(key) && !explicitSet.has(key)) {
				seenCustomKeys.push(key);
			}
		}
		return byPillar.get(key)!;
	};

	for (const expKey of explicitPillars) {
		ensureBucket(expKey);
	}

	allSets.forEach((ts, idx) => {
		if (isHiddenIn(ts, 'play')) return;
		const pKey = resolveSetPillar(ts);
		const bucket = ensureBucket(pKey);
		bucket.push({
			traitSet: ts,
			index: idx,
			label: getMobileJumpPillLabel(ts, bucket.length),
		});
	});

	const orderedKeys: string[] = [];
	const pushUnique = (k: string) => {
		if (byPillar.has(k) && !orderedKeys.includes(k)) orderedKeys.push(k);
	};
	for (const expKey of explicitPillars) pushUnique(expKey);
	for (const stdKey of standardOrder) pushUnique(stdKey);
	for (const customKey of seenCustomKeys) pushUnique(customKey);

	return orderedKeys
		.map((key) => {
			const sets = byPillar.get(key) || [];
			const setsForCount = sets.map((s) => s.traitSet);
			return {
				key,
				label: getPillarLabel(props.character, key),
				sets,
				stagedCount: countStagedDiceForSets(setsForCount),
			};
		})
		.filter((col) => col.sets.length > 0 || explicitSet.has(col.key));
});

function columnStackItems(col: MobilePillarColumn): { index: number; label: string }[] {
	return col.sets.map((s) => ({ index: s.index, label: s.label }));
}

const isSingleMobilePillar = computed(() => mobilePillarColumns.value.length === 1);
const singlePillarSubItems = computed(() =>
	isSingleMobilePillar.value ? columnStackItems(mobilePillarColumns.value[0]) : [],
);

function centerActiveJumpPill(pillarKey: string) {
	const stripEl = Array.isArray(jumpStripRef.value) ? jumpStripRef.value[0] : jumpStripRef.value;
	if (!stripEl || typeof stripEl.querySelector !== 'function') return;
	const pill = stripEl.querySelector(`[data-pillar-pill="${pillarKey}"]`) as HTMLElement | null;
	if (pill && typeof pill.scrollIntoView === 'function') {
		pill.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
	}
}

function scrollToPillar(pillarKey: string, targetSetIndex?: number) {
	activeMobilePillarKey.value = pillarKey;
	const root = rootEl.value || document;
	const colEl = root.querySelector(`.mobile-pillar-column[data-pillar-key="${pillarKey}"]`) as HTMLElement | null;
	if (colEl && typeof colEl.scrollIntoView === 'function') {
		colEl.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
	}
	if (targetSetIndex !== undefined) {
		setTimeout(() => scrollToSetInColumn(pillarKey, targetSetIndex), 180);
	}
	centerActiveJumpPill(pillarKey);
}

function scrollToSetInColumn(pillarKey: string, setIndex: number) {
	const root = rootEl.value || document;
	const colEl = root.querySelector(`.mobile-pillar-column[data-pillar-key="${pillarKey}"]`) as HTMLElement | null;
	const scope = colEl || root;
	const card = scope.querySelector(`.trait-set[data-set-index="${setIndex}"]`) as HTMLElement | null;
	if (card && typeof card.scrollIntoView === 'function') {
		card.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
	}
}

function setupCarouselObserver() {
	if (carouselObserver) {
		carouselObserver.disconnect();
		carouselObserver = null;
	}
	if (!isPillarPlay.value || typeof IntersectionObserver === 'undefined') {
		return;
	}
	nextTick(() => {
		const root = rootEl.value || document;
		const cols = root.querySelectorAll('.mobile-pillar-column[data-pillar-key]');
		if (!cols.length) return;

		carouselObserver = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						const rawKey = entry.target.getAttribute('data-pillar-key');
						if (rawKey) {
							activeMobilePillarKey.value = rawKey;
							centerActiveJumpPill(rawKey);
						}
					}
				}
			},
			{
				threshold: 0.55,
			},
		);

		cols.forEach((col) => carouselObserver!.observe(col));
	});
}

let unsubscribeCustomPresets: (() => void) | null = null;

onMounted(() => {
	applyFonts();
	inlineCustomPresets.value = characterCurioFunctions.getCustomSetPresets();
	playCustomPresets.value = inlineCustomPresets.value;
	unsubscribeCustomPresets = characterCurioFunctions.onCustomSetPresetsChange((next) => {
		inlineCustomPresets.value = next;
		playCustomPresets.value = next;
	});
	if (typeof window !== 'undefined' && window.matchMedia) {
		mediaQuery = window.matchMedia('(max-width: 48rem)');
		isMobileViewport.value = mediaQuery.matches;
		handleMediaChange = () => {
			isMobileViewport.value = Boolean(mediaQuery && mediaQuery.matches);
			setupCarouselObserver();
		};
		mediaQuery.addEventListener('change', handleMediaChange);
	}
	setupCarouselObserver();
});

onUnmounted(() => {
	if (unsubscribeCustomPresets) {
		unsubscribeCustomPresets();
		unsubscribeCustomPresets = null;
	}
	if (mediaQuery && handleMediaChange) {
		mediaQuery.removeEventListener('change', handleMediaChange);
	}
	if (carouselObserver) {
		carouselObserver.disconnect();
		carouselObserver = null;
	}
});

watch(
	() => props.character,
	() => {
		applyFonts();
	},
	{ immediate: true, deep: true },
);

watch(
	() => mobilePillarColumns.value,
	(cols) => {
		if (cols.length > 0 && !cols.some((c) => c.key === activeMobilePillarKey.value)) {
			activeMobilePillarKey.value = cols[0].key;
		}
		setupCarouselObserver();
	},
	{ immediate: true },
);

watch(
	() => props.submode,
	() => {
		setupCarouselObserver();
	},
);

defineExpose({
	openPlayPresetPicker,
});
</script>

<template>
	<section
		ref="rootEl"
		:class="[
			'character-sheet',
			'submode-' + submode,
			'orientation-' + pageOrientation,
			{
				'print-sheet': isPrintSubmode,
				'print-blank-mode': effectivePrintBlank,
				'print-bw': effectivePrintBW,
				'has-watermark': hasAnyWatermark,
				'pillar-deck-view': isPillarPlay,
			},
		]"
		:style="characterSheetStyle"
	>
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
				:class="[
					'page',
					'page-' + pageIndex,
					'orientation-' + pageOrientation,
					'page-justification-' + pageJustification,
				]"
			>
				<div v-if="hasWatermark(pageIndex)" class="page-watermark" :style="getWatermarkStyle(pageIndex)"></div>

				<div class="page-inner">
					<!-- 2D MOBILE PILLAR JUMP STRIP (PLAY MODE) -->
					<nav
						v-if="isPillarPlay && pageIndex === 1 && mobilePillarColumns.length > 0"
						ref="jumpStripRef"
						class="mobile-set-jump-strip"
						:class="{ 'is-unified-sheet-strip': isSingleMobilePillar && !sheetUsesPillars }"
						aria-label="Character pillars"
					>
						<template v-if="isSingleMobilePillar">
							<span v-if="sheetUsesPillars" class="jump-pillar-tag" :data-pillar-pill="mobilePillarColumns[0].key">
								<span class="jump-pill-label">{{ mobilePillarColumns[0].label }}</span>
								<span v-if="mobilePillarColumns[0].stagedCount > 0" class="jump-pill-badge">{{
									mobilePillarColumns[0].stagedCount
								}}</span>
							</span>
							<template v-if="sheetUsesPillars || singlePillarSubItems.length > 2">
								<button
									v-for="sub in singlePillarSubItems"
									:key="'jump-sub-' + sub.index"
									type="button"
									class="jump-pill jump-pill-sub"
									@click.stop="scrollToSetInColumn(mobilePillarColumns[0].key, sub.index)"
								>
									<span class="jump-pill-label">{{ sub.label }}</span>
								</button>
							</template>
							<button
								type="button"
								class="jump-pill jump-pill-add-card jump-pill-add-set"
								title="Add Set"
								@click.stop="openPlayPresetPicker()"
							>
								<i class="fas fa-plus" aria-hidden="true"></i> <span class="jump-pill-label">Set</span>
							</button>
						</template>
						<template v-else>
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
						</template>
						<form v-if="isAddingPillar" class="pillar-inline-form" @submit.prevent="confirmAddPillar" @click.stop>
							<input
								ref="pillarInputRef"
								v-model="newPillarName"
								type="text"
								class="pillar-inline-input"
								placeholder="Pillar name..."
								aria-label="New pillar name"
								@keydown="onPillarInputKeydown"
							/>
							<button type="submit" class="btn-pillar-inline" title="Create pillar" aria-label="Create pillar">
								<i class="fas fa-check" aria-hidden="true"></i>
							</button>
							<button
								type="button"
								class="btn-pillar-inline btn-pillar-inline-cancel"
								title="Cancel"
								aria-label="Cancel"
								@click.stop="cancelAddPillar"
							>
								<i class="fas fa-times" aria-hidden="true"></i>
							</button>
						</form>
						<button
							v-else
							type="button"
							class="jump-pill jump-pill-add-pillar"
							title="Add Pillar"
							@click.stop="startAddPillar()"
						>
							<i class="fas fa-plus" aria-hidden="true"></i> <span class="jump-pill-label">Pillar</span>
						</button>
						<button
							v-if="!isMobileViewport && submode === 'play'"
							type="button"
							class="jump-pill jump-pill-view-toggle"
							@click.stop="toggleDesktopPillars"
							:title="effectiveDesktopPillars ? 'Switch to Sheet View' : 'Switch to Pillars Deck'"
						>
							<i
								:class="effectiveDesktopPillars ? 'fas fa-file-alt' : 'fas fa-building-columns'"
								aria-hidden="true"
							></i>
							<span class="jump-pill-label">{{ effectiveDesktopPillars ? 'Sheet' : 'Pillars' }}</span>
						</button>
					</nav>

					<!-- 2D MOBILE PILLAR & STACK DECK (PLAY MODE) -->
					<div
						v-if="isPillarPlay && pageIndex === 1"
						class="mobile-pillar-track"
						:class="{ 'is-single-pillar': isSingleMobilePillar }"
					>
						<div
							v-for="col in mobilePillarColumns"
							:key="'pillar-col-' + col.key"
							class="mobile-pillar-column"
							:data-pillar-key="col.key"
						>
							<div class="mobile-substack-bar" v-if="!isSingleMobilePillar">
								<button
									v-for="sub in columnStackItems(col)"
									:key="'substack-' + col.key + '-' + sub.index"
									type="button"
									class="substack-pill"
									@click.stop="scrollToSetInColumn(col.key, sub.index)"
								>
									{{ sub.label }}
								</button>
								<button
									type="button"
									class="substack-pill substack-pill-add-set jump-pill-add-card"
									:title="'Add set to ' + col.label"
									:aria-label="'Add set to ' + col.label"
									@click.stop="openPlayPresetPicker(col.key)"
								>
									<i class="fas fa-plus" aria-hidden="true"></i> Set
								</button>
							</div>

							<TraitSetBlock
								v-for="item in col.sets"
								:key="'mobile-set-' + item.index"
								:character="character!"
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

							<button type="button" class="btn-mobile-add-play-card" @click.stop="openPlayPresetPicker(col.key)">
								<i class="fas fa-plus" aria-hidden="true"></i> Add Set
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

						<!-- PLACED & FULL-WIDTH PAGE SECTIONS -->
						<div class="sheet-layout classic-grid-sections" v-if="!isPillarPlay">
							<template v-for="(section, secIdx) in getSheetSections(pageIndex)" :key="'classic-grid-' + secIdx">
								<div
									:class="['columns', 'sheet-columns', section.type === 'grid' ? 'sheet-grid' : 'cols-1']"
									:style="section.type === 'grid' ? getSheetGridStyle(section) : undefined"
								>
									<template v-for="{ traitSet, index: s } in section.ordered" :key="s">
										<TraitSetBlock
											:character="character!"
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
									</template>
								</div>
							</template>
							<!-- BUTTONS: ORGANIC SHEET BUILDER BAR -->
							<div class="sheet-add-set-bar" v-if="submode === 'edit'">
								<div class="add-set-slot slot-center sheet-organic-builder">
									<button
										type="button"
										class="btn-sheet-add btn-sheet-add-primary"
										@click.stop="addTraitSet(pageIndex)"
									>
										<i class="fas fa-plus" aria-hidden="true"></i> Set
									</button>
									<button
										type="button"
										class="btn-sheet-add btn-presets-toggle"
										:class="{ active: showInlineAddSet && inlineAddPage === pageIndex }"
										:aria-expanded="showInlineAddSet && inlineAddPage === pageIndex"
										@click.stop="toggleInlineAdd(pageIndex, $event.currentTarget as HTMLElement)"
									>
										<i class="fas fa-layer-group" aria-hidden="true"></i> Presets
									</button>
									<button
										type="button"
										class="btn-sheet-add btn-pillar-toggle"
										:class="{ active: isAddingPillar }"
										:aria-expanded="isAddingPillar"
										@click.stop="
											isAddingPillar ? cancelAddPillar() : startAddPillar($event.currentTarget as HTMLElement)
										"
									>
										<i class="fas fa-building-columns" aria-hidden="true"></i> Pillar
									</button>
								</div>

								<!-- INLINE PILLAR CREATION (EDIT MODE) -->
								<div class="inline-add-pillar-area" v-if="isAddingPillar">
									<div class="inline-add-header">
										<span class="inline-add-title"
											><i class="fas fa-building-columns" aria-hidden="true"></i> Add Pillar</span
										>
										<button
											type="button"
											class="btn-inline-close"
											title="Close"
											aria-label="Close"
											@click.stop="cancelAddPillar"
										>
											<i class="fas fa-times" aria-hidden="true"></i>
										</button>
									</div>
									<form class="pillar-inline-form" @submit.prevent="confirmAddPillar" @click.stop>
										<input
											ref="pillarInputRef"
											v-model="newPillarName"
											type="text"
											class="pillar-inline-input"
											placeholder="Pillar name..."
											aria-label="New pillar name"
											@keydown="onPillarInputKeydown"
										/>
										<button type="submit" class="btn-pillar-inline" title="Create pillar" aria-label="Create pillar">
											<i class="fas fa-check" aria-hidden="true"></i>
										</button>
										<button
											type="button"
											class="btn-pillar-inline btn-pillar-inline-cancel"
											title="Cancel"
											aria-label="Cancel"
											@click.stop="cancelAddPillar"
										>
											<i class="fas fa-times" aria-hidden="true"></i>
										</button>
									</form>
								</div>

								<!-- INLINE NON-MODAL ADD AREA -->
								<div class="inline-add-set-area" v-if="showInlineAddSet && inlineAddPage === pageIndex">
									<div class="inline-add-header">
										<span class="inline-add-title"><i class="fas fa-layer-group" aria-hidden="true"></i> Presets</span>
										<div class="inline-add-quick-actions">
											<button type="button" class="btn-inline-quick btn-inline-mini" @click.stop="openMiniFromInline">
												<i class="fas fa-th-large" aria-hidden="true"></i> Set Builder
											</button>
											<button
												type="button"
												class="btn-inline-close"
												title="Close"
												aria-label="Close"
												@click.stop="showInlineAddSet = false"
											>
												<i class="fas fa-times" aria-hidden="true"></i>
											</button>
										</div>
									</div>
									<div class="preset-gallery-grid">
										<PresetGalleryCard
											v-for="preset in inlineBuiltInPresets"
											:key="'builtin-' + preset.id"
											:preset="preset"
											:dice-config="getView(character)?.diceConfig"
											@add="addPresetSet(preset, pageIndex)"
										/>
										<PresetGalleryCard
											v-for="preset in inlineCustomPresets"
											:key="'custom-' + preset.id"
											:preset="preset"
											:dice-config="getView(character)?.diceConfig"
											editable
											edit-label="Edit saved preset"
											deletable
											delete-label="Delete saved preset"
											@add="addPresetSet(preset, pageIndex)"
											@edit="editCustomPreset(preset, 'edit')"
											@delete="removeCustomPreset(preset.id)"
										/>
									</div>
								</div>
							</div>
							<div class="sheet-add-set-bar" v-else-if="submode === 'play' && pageIndex === pageCount">
								<button type="button" class="btn-mobile-add-play-card" @click.stop="openPlayPresetPicker()">
									<i class="fas fa-plus" aria-hidden="true"></i> Add Set
								</button>
							</div>
						</div>
					</div>
					<!-- .mobile-carousel-track -->
				</div>
				<!-- .page-inner -->
			</div>
			<!-- .page -->
		</div>
		<!-- .pages -->

		<teleport to="body">
			<ModalDialog
				:open="showPlayPresetPicker"
				label="Add set"
				dialog-class="modal-style-gallery"
				@close="showPlayPresetPicker = false"
			>
				<button type="button" class="modal-close" aria-label="Close" @click.prevent="showPlayPresetPicker = false">
					<i class="fas fa-times" aria-hidden="true"></i>
				</button>
				<div class="modal-inner">
					<div class="modal-header-actions">
						<h2><i class="fas fa-layer-group" aria-hidden="true"></i> Add Set</h2>
						<button type="button" class="btn-preset-add btn-open-mini btn-gallery-mini" @click.stop="openPlayMini">
							<i class="fas fa-th-large" aria-hidden="true"></i> Set Builder
						</button>
					</div>
					<div class="preset-gallery-grid">
						<PresetGalleryCard
							v-for="preset in playBuiltInPresets"
							:key="'play-builtin-' + preset.id"
							:preset="preset"
							:dice-config="getView(character)?.diceConfig"
							@add="addPresetSet(preset)"
						/>
						<PresetGalleryCard
							v-for="preset in playCustomPresets"
							:key="'play-custom-' + preset.id"
							:preset="preset"
							:dice-config="getView(character)?.diceConfig"
							editable
							edit-label="Edit saved preset"
							deletable
							delete-label="Delete saved preset"
							@add="addPresetSet(preset)"
							@edit="editCustomPreset(preset, 'play')"
							@delete="removeCustomPreset(preset.id)"
						/>
					</div>
				</div>
			</ModalDialog>
			<TraitSetMini
				v-if="showPlayMini"
				:editing-preset="editingCustomPreset"
				:character="props.character"
				:apply-label="miniOrigin === 'play' ? 'Add Set' : 'Add to Sheet'"
				@apply-to-set="applyMiniSet"
				@close="closePlayMini"
				@saved="playCustomPresets = characterCurioFunctions.getCustomSetPresets()"
			/>
		</teleport>
	</section>
</template>
