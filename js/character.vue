<script setup lang="ts">
import { computed, getCurrentInstance, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import { characterCurioFunctions, characterCurioSetPresets, type SetPresetEntry } from './functions.ts';
import {
	getView,
	ensureView,
	isNameSet,
	resolveVisibility,
	isHiddenIn,
	resolveSetPillar,
	getPillarLabel,
	resolveAltRoll,
	type Character,
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
import PrintToolbar from './print-toolbar.vue';
import TraitSetMini from './trait-set-mini.vue';
import PresetGalleryCard from './preset-gallery-card.vue';
import { isHexColor, isLightHex } from './color-palette.ts';

const props = defineProps<{
	submode?: string | null;
	character?: Character;
	editing?: unknown[] | null;
	viewY?: number | null;
	dicePool?: any;
	isDesktopPillars?: boolean;
}>();

const emit = defineEmits<{
	(e: 'selectElement', selector: unknown[]): void;
	(e: 'updateCharacter', character: Character): void;
	(e: 'exportCharacter', id: string): void;
	(e: 'saveSheetTemplate'): void;
	(e: 'exportSheetTemplate'): void;
	(e: 'addDieToRoller', die: unknown): void;
}>();

const instance = getCurrentInstance();
const rootTemplates = () => (instance?.proxy as any)?.$root?.sheetTemplates ?? null;

const rootEl = ref<HTMLElement | null>(null);

const printPageView = ref<any>('all');
const printBlank = ref(false);
const printBW = ref(false);
const showInlineAddSet = ref(false);
const inlineAddPage = ref(1);
const inlineBuiltInPresets = Object.values(characterCurioSetPresets);
const inlineCustomPresets = ref<SetPresetEntry[]>([]);

function toggleInlineAdd(page = 1) {
	inlineAddPage.value = page;
	inlineCustomPresets.value = characterCurioFunctions.getCustomSetPresets();
	showInlineAddSet.value = !showInlineAddSet.value;
}

function removeInlineCustomPreset(id: string) {
	inlineCustomPresets.value = characterCurioFunctions.deleteCustomSetPreset(id);
}

function openMiniFromInline() {
	showInlineAddSet.value = false;
	showPlayMini.value = true;
}

function openPlayMini() {
	showPlayPresetPicker.value = false;
	showPlayMini.value = true;
}
const showPlayPresetPicker = ref(false);
const showPlayMini = ref(false);
const playBuiltInPresets = Object.values(characterCurioSetPresets);
const playCustomPresets = ref<SetPresetEntry[]>([]);
const isMobileViewport = ref(
	typeof window !== 'undefined' && Boolean(window.matchMedia && window.matchMedia('(max-width: 768px)').matches),
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
const game = computed(() => props.character?.game ?? '');
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
		(window as any).__characterCurioActiveDiceConfig = ctk.diceConfig;
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
function selectElement(selector: unknown[]) {
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

	const styleId = 'default';
	const traitSet: any = structuredClone(characterCurioFunctions.defaultTraitSet);

	traitSet.name = 'New trait set';
	traitSet.noun = 'Trait';
	traitSet.plural = 'Traits';
	const tsView = ensureView(traitSet);
	tsView.style = { header: styleId, body: styleId };

	tsView.page = page ?? 1;
	characterCurioFunctions.ensureTraitSetIds({ traitSets: [...(character.traitSets || []), traitSet] });
	const blank: any = structuredClone(characterCurioFunctions.defaultTrait);
	blank.name = '';
	delete blank.rating;
	blank.description = '';
	traitSet.traits.push(blank);

	character.traitSets.push(traitSet);
	updateCharacter(character);
	showInlineAddSet.value = false;

	const newTraitSetID = character.traitSets.length - 1;
	selectElement(['traitSet', newTraitSetID]);
	nextTick(() => {
		const nameInput = document.querySelector<HTMLInputElement>('input[name="traitSetName"]');
		nameInput?.focus();
	});
}

function removeTraitSet(traitSetID: number) {
	const character = props.character as Character;
	if (isNameSet(character?.traitSets?.[traitSetID])) return;

	clearSelected();

	const entry = characterCurioFunctions.resolveTemplateFor(character, rootTemplates());
	characterCurioFunctions.removeTraitSetFromSheet(character, entry, traitSetID);

	updateCharacter(character);
}

function addPresetSet(preset: SetPresetEntry, page?: number) {
	const character = props.character as Character;
	if (!character || !preset) return;
	const traitSet = characterCurioFunctions.instantiateSetPreset(preset, character, page ?? 1);
	character.traitSets.push(traitSet);
	updateCharacter(character);
	showInlineAddSet.value = false;
	showPlayPresetPicker.value = false;
	const newTraitSetID = character.traitSets.length - 1;
	if (props.submode === 'edit') {
		selectElement(['traitSet', newTraitSetID]);
	} else if (props.submode === 'play') {
		const pKey = resolveSetPillar(traitSet);
		nextTick(() => scrollToPillar(pKey, newTraitSetID));
	}
}

function openPlayPresetPicker() {
	playCustomPresets.value = characterCurioFunctions.getCustomSetPresets();
	showPlayPresetPicker.value = true;
}

function removePlayCustomPreset(id: string) {
	playCustomPresets.value = characterCurioFunctions.deleteCustomSetPreset(id);
}

function getTraitSetRatings(traitSet: TraitSet) {
	return characterCurioFunctions.getTraitSetRatings(traitSet);
}

function addTrait(traitSetID: number) {
	const character = props.character as Character;
	const traitSet = character.traitSets[traitSetID];
	const noun = traitSet.noun && traitSet.noun.length ? traitSet.noun : 'Trait';

	const trait: any = structuredClone(characterCurioFunctions.defaultTrait);
	trait.name = 'New ' + noun;
	const allowed = characterCurioFunctions.getTraitSetRatings(traitSet);
	const cur =
		trait.rating && trait.rating.type === 'Die' && Array.isArray(trait.rating.value) ? trait.rating.value[0] : 0;
	if (allowed.length > 0 && !allowed.includes(cur)) {
		trait.rating = { type: 'Die', value: [allowed[0]], range: allowed.slice() };
	}

	if (!Array.isArray(traitSet.traits)) traitSet.traits = [];
	traitSet.traits.push(trait);

	updateCharacter(character);

	const newTraitID = traitSet.traits.length - 1;
	selectElement(['trait', traitSetID, newTraitID]);
}

function removeTrait(traitSetID: number, traitID: number) {
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
	const current = Number(props.character.plotPoints) || 0;
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

const activeMobilePillarKey = ref<string>('identity');
const jumpStripRef = ref<HTMLElement | HTMLElement[] | null>(null);
let carouselObserver: IntersectionObserver | null = null;
let mediaQuery: MediaQueryList | null = null;
let handleMediaChange: (() => void) | null = null;

function getMobileJumpPillLabel(traitSet: any, orderIdx: number): string {
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

const mobilePillarColumns = computed<MobilePillarColumn[]>(() => {
	if (props.submode !== 'play' || !props.character) return [];
	const allSets = Array.isArray(props.character.traitSets) ? props.character.traitSets : [];
	const byPillar = new Map<string, MobilePillarSetItem[]>();
	const seenCustomKeys: string[] = [];
	const standardOrder = ['prime', 'plus', 'play'];

	const ensureBucket = (key: string) => {
		if (!byPillar.has(key)) {
			byPillar.set(key, []);
			if (key !== 'identity' && !standardOrder.includes(key)) {
				seenCustomKeys.push(key);
			}
		}
		return byPillar.get(key)!;
	};

	ensureBucket('identity');

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

	const orderedKeys: string[] = ['identity'];
	for (const stdKey of standardOrder) {
		if (byPillar.has(stdKey)) orderedKeys.push(stdKey);
	}
	for (const customKey of seenCustomKeys) {
		if (byPillar.has(customKey)) orderedKeys.push(customKey);
	}

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
		.filter((col) => col.sets.length > 0);
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

onMounted(() => {
	applyFonts();
	if (typeof window !== 'undefined' && window.matchMedia) {
		mediaQuery = window.matchMedia('(max-width: 768px)');
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
						aria-label="Character pillars"
					>
						<template v-if="isSingleMobilePillar">
							<span class="jump-pillar-tag" :data-pillar-pill="mobilePillarColumns[0].key">
								<span class="jump-pill-label">{{ mobilePillarColumns[0].label }}</span>
								<span v-if="mobilePillarColumns[0].stagedCount > 0" class="jump-pill-badge">{{
									mobilePillarColumns[0].stagedCount
								}}</span>
							</span>
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
						<button
							type="button"
							class="jump-pill jump-pill-add-card"
							title="Add Play Card / Set Preset"
							@click.stop="openPlayPresetPicker"
						>
							<i class="fas fa-plus" aria-hidden="true"></i> <span class="jump-pill-label">Card</span>
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
					<div v-if="isPillarPlay && pageIndex === 1" class="mobile-pillar-track">
						<div
							v-for="col in mobilePillarColumns"
							:key="'pillar-col-' + col.key"
							class="mobile-pillar-column"
							:data-pillar-key="col.key"
						>
							<div class="mobile-substack-bar" v-if="!isSingleMobilePillar && columnStackItems(col).length > 1">
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
								<i class="fas fa-plus" aria-hidden="true"></i> Add Play Card
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
									</template>
								</div>
							</template>
							<!-- BUTTON: ADD TRAIT SET -->
							<div class="sheet-add-set-bar" v-if="submode === 'edit'">
								<div class="add-set-slot slot-center">
									<button type="button" class="btn-sheet-add" @click.stop="addTraitSet(pageIndex)">
										<i class="fas fa-plus" aria-hidden="true"></i> Add Set
									</button>
									<button
										type="button"
										class="btn-sheet-add btn-presets-toggle"
										@click.stop="toggleInlineAdd(pageIndex)"
									>
										<i class="fas fa-layer-group" aria-hidden="true"></i> Presets
									</button>
								</div>

								<!-- INLINE NON-MODAL ADD AREA -->
								<div class="inline-add-set-area" v-if="showInlineAddSet && inlineAddPage === pageIndex">
									<div class="inline-add-header">
										<span class="inline-add-title"
											><i class="fas fa-layer-group" aria-hidden="true"></i> Add Trait Set</span
										>
										<div class="inline-add-quick-actions">
											<button type="button" class="btn-inline-quick" @click.stop="addTraitSet(pageIndex)">
												<i class="fas fa-plus" aria-hidden="true"></i> Blank Set
											</button>
											<button type="button" class="btn-inline-quick btn-inline-mini" @click.stop="openMiniFromInline">
												<i class="fas fa-th-large" aria-hidden="true"></i> New Card in Mini
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
											action-label="Add Preset"
											@add="addPresetSet(preset, pageIndex)"
										/>
										<PresetGalleryCard
											v-for="preset in inlineCustomPresets"
											:key="'custom-' + preset.id"
											:preset="preset"
											action-label="Add Preset"
											deletable
											delete-label="Delete custom preset"
											@add="addPresetSet(preset, pageIndex)"
											@delete="removeInlineCustomPreset(preset.id)"
										/>
									</div>
								</div>
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
				label="Add play card"
				dialog-class="modal-style-gallery"
				@close="showPlayPresetPicker = false"
			>
				<button type="button" class="modal-close" aria-label="Close" @click.prevent="showPlayPresetPicker = false">
					<i class="fas fa-times" aria-hidden="true"></i>
				</button>
				<div class="modal-inner">
					<div class="modal-header-actions">
						<h2><i class="fas fa-gamepad" aria-hidden="true"></i> Add Play Card</h2>
						<button type="button" class="btn-preset-add btn-open-mini btn-gallery-mini" @click.stop="openPlayMini">
							<i class="fas fa-th-large" aria-hidden="true"></i> New Card in Mini
						</button>
					</div>
					<p class="gallery-sub">Drop a temporary or reusable set card into the active session.</p>
					<div class="preset-gallery-grid">
						<PresetGalleryCard
							v-for="preset in playBuiltInPresets"
							:key="'play-builtin-' + preset.id"
							:preset="preset"
							action-label="Add to Session"
							@add="addPresetSet(preset)"
						/>
						<PresetGalleryCard
							v-for="preset in playCustomPresets"
							:key="'play-custom-' + preset.id"
							:preset="preset"
							action-label="Add to Session"
							deletable
							delete-label="Delete saved preset"
							@add="addPresetSet(preset)"
							@delete="removePlayCustomPreset(preset.id)"
						/>
					</div>
				</div>
			</ModalDialog>
			<TraitSetMini
				v-if="showPlayMini"
				:character="props.character"
				@close="showPlayMini = false"
				@saved="playCustomPresets = characterCurioFunctions.getCustomSetPresets()"
			/>
		</teleport>
	</section>
</template>
