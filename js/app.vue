<script setup lang="ts">
import {
	computed,
	defineAsyncComponent,
	nextTick,
	onMounted,
	onUnmounted,
	provide,
	reactive,
	ref,
	toRaw,
	watch,
} from 'vue';
import { characterCurioFunctions, type SetPresetEntry } from './functions.ts';
import { characterCurioStorage, type PreferencesRecord } from './storage.ts';
import { cloneDeep } from './clone-deep.ts';
import {
	CURIOSITY_GRAPH_KEY,
	collectAllGraphNodes,
	collectIncomingBacklinks,
	collectOutgoingLinks,
	createBlankEmbeddedCuriosity,
	findCuriosityEverywhere,
	popOutFromRoot,
	pullInToRoot,
	type SpawnCuriosityOptions,
} from './curiosity-graph.ts';
import Character from './character.vue';
import StudioPanel from './studio-panel.vue';
import AppHeader from './app-header.vue';
import AppFooter from './app-footer.vue';
import SessionNav from './session-nav.vue';
import CuriosityWebBar from './curiosity-web-bar.vue';
import ModalDialog from './modal-dialog.vue';
import { useToast } from './use-toast.ts';
import { useHistory, type EditingPath } from './use-history.ts';
import { usePersistence } from './use-persistence.ts';
import { useSheetTemplates, downloadJson } from './use-sheet-templates.ts';
import { useSessionPools } from './use-session-pools.ts';
import { useRosterActions } from './use-roster-actions.ts';
import { DREAMER_ARCHITECT_SHOWCASE } from './showcase-templates.ts';

const Roster = defineAsyncComponent(() => import('./roster.vue'));
const AddCharacterModal = defineAsyncComponent(() => import('./add-character-modal.vue'));
const CommandPalette = defineAsyncComponent(() => import('./command-palette.vue'));
import {
	getView,
	getTemplateTitle,
	getCuriosityGame,
	getCuriosityThumbnailUrl,
	type Character as CharacterModel,
	type SheetTemplate,
} from './model.ts';

type CharacterComponentInstance = InstanceType<typeof Character> & {
	openPlayPresetPicker?: () => void;
};
type StudioPanelInstance = InstanceType<typeof StudioPanel>;

// ---- state ----
const localData = ref<Record<string, unknown>>({});
const characters = ref<CharacterModel[]>([]);
const characterID = ref<string | null>(null);
const openCharacterIDs = ref<string[]>([]);
const previewCharacter = ref<CharacterModel | null>(null);
const previewTemplateEntry = ref<SheetTemplate | null>(null);
const isPreview = computed(() => Boolean(previewCharacter.value));
const previewDismissed = ref<boolean>(false);
const sheetTemplates = ref<SheetTemplate[]>([]);
const customSetPresets = ref<SetPresetEntry[]>(characterCurioFunctions.getCustomSetPresets());
const prefs = ref<PreferencesRecord>({ version: 1, global: {}, characters: {} });
const playViewMode = ref('split');
const isAddCharacterModalOpen = ref(false);
const hasOpenedAddModal = ref(false);
const isPaletteOpen = ref(false);
const hasOpenedPalette = ref(false);
watch(isAddCharacterModalOpen, (v) => {
	if (v) hasOpenedAddModal.value = true;
});
watch(isPaletteOpen, (v) => {
	if (v) hasOpenedPalette.value = true;
});
const sessionCharacterSearch = ref('');
const mode = ref('roster');
const submode = ref<string | null>(null);
const editing = ref<EditingPath>([]);
const viewY = ref<number | null>(null);
const isStudioPanelOpen = ref(true);
const studioPanelTab = ref<'properties' | 'roller' | 'json'>('properties');
const mobileDrawerState = ref<'staged' | 'split' | 'full'>('staged');

// The roller is a Play tool: leaving Play while on it lands on properties.
watch(submode, (sub) => {
	if (sub !== 'play' && studioPanelTab.value === 'roller') {
		studioPanelTab.value = 'properties';
	}
});
const panelPosition = ref<'left' | 'right'>('right');
const storeReady = ref(false);
const storeError = ref<unknown>(null);
const mouseDownInsideEditor = ref(false);

const history = ref<string[]>([]);
const historyIndex = ref(-1);
const isNavigatingHistory = ref(false);
const isHandlingHash = ref(false);

const { toastMessage, toastActionLabel, toastTone, showToast, triggerToastAction, pauseToast, resumeToast } =
	useToast();
provide('showToast', showToast);

const main = ref<HTMLElement | null>(null);

// ---- dark mode state ----
const storedColorScheme =
	typeof localStorage !== 'undefined' ? localStorage.getItem('characterCurioColorScheme') : null;
const colorSchemePref = ref<'light' | 'dark' | 'system'>(
	storedColorScheme === 'light' || storedColorScheme === 'dark' || storedColorScheme === 'system'
		? storedColorScheme
		: 'system',
);
const systemPrefersDark = ref(
	Boolean(
		typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches,
	),
);
const isMobileViewport = ref(
	Boolean(typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(max-width: 48rem)').matches),
);

const isDarkMode = computed(() => {
	// Print mode and Print preview must ALWAYS render in ink-friendly Light Mode
	if (submode.value === 'print') return false;
	if (colorSchemePref.value === 'dark') return true;
	if (colorSchemePref.value === 'light') return false;
	return systemPrefersDark.value;
});

function toggleDarkMode() {
	const next = isDarkMode.value ? 'light' : 'dark';
	colorSchemePref.value = next;
	try {
		localStorage.setItem('characterCurioColorScheme', next);
	} catch (_e) {}
}

const isDesktopPillars = ref<boolean>(
	typeof localStorage !== 'undefined' ? localStorage.getItem('characterCurioPlayPillars') === 'true' : false,
);

function toggleDesktopPillars() {
	isDesktopPillars.value = !isDesktopPillars.value;
	try {
		localStorage.setItem('characterCurioPlayPillars', String(isDesktopPillars.value));
	} catch (_e) {}
}

const characterRef = ref<CharacterComponentInstance | null>(null);
const splitCharacterRefs = new Map<string, CharacterComponentInstance>();

function setSplitCharacterRef(id: string, el: unknown) {
	if (el) {
		splitCharacterRefs.set(id, el as CharacterComponentInstance);
	} else {
		splitCharacterRefs.delete(id);
	}
}

function openActivePlayPresetPicker() {
	const splitTarget = characterID.value ? splitCharacterRefs.get(characterID.value) : null;
	const target = splitTarget || characterRef.value;
	target?.openPlayPresetPicker?.();
}

watch(
	isDarkMode,
	(dark) => {
		if (typeof document !== 'undefined') {
			document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
			document.documentElement.classList.toggle('theme-dark', dark);
			// Native UI (controls, scrollbars, canvas) follows the resolved theme.
			const schemeMeta = document.querySelector('meta[name="color-scheme"]');
			if (schemeMeta) schemeMeta.setAttribute('content', dark ? 'dark' : 'light');
			if (document.body) {
				document.body.classList.toggle('theme-dark', dark);
			}
		}
	},
	{ immediate: true },
);

// ---- computed ----
const baseURL = computed(() => window.location.href.replace('/index.html', '/'));
const year = computed(() => new Date().getFullYear());
const webTrailIds = ref<string[]>([]);
const activeFound = computed(() =>
	findCuriosityEverywhere(characterID.value, characters.value, previewCharacter.value, false),
);
const characterIndex = computed(() => characters.value.findIndex((character) => character.id === characterID.value));
const character = computed<CharacterModel | null>(() => {
	if (previewCharacter.value) return activeFound.value?.node ?? previewCharacter.value;
	return activeFound.value?.node ?? characters.value[characterIndex.value] ?? null;
});
const activeHostRoot = computed(() => activeFound.value?.hostRoot ?? null);
const canPlay = computed(() => Boolean(character.value || openCharacterIDs.value.length));

function restoreCharacterForHistory(restored: CharacterModel) {
	if (!restored || !restored.id) return;
	if (characterIndex.value !== -1) {
		characters.value[characterIndex.value] = restored;
		return;
	}
	const host = activeHostRoot.value;
	if (host?.curiosities && host.curiosities[restored.id]) {
		host.curiosities[restored.id] = restored;
		host.dateModified = new Date().toISOString();
	}
}

const {
	canUndo,
	canRedo,
	initHistory,
	commitHistorySnapshot,
	scheduleHistorySnapshot,
	markDirty,
	validateEditing,
	undo,
	redo,
} = useHistory({
	mode,
	character,
	characters,
	characterIndex,
	restoreCharacter: restoreCharacterForHistory,
	editing,
	isNavigatingHistory,
	history,
	historyIndex,
	showToast,
	saveLocalData: () => saveLocalData(),
});

const openCharacters = computed<CharacterModel[]>(() => {
	if (previewCharacter.value) return [character.value || previewCharacter.value];
	const list: CharacterModel[] = [];
	for (const id of openCharacterIDs.value) {
		const found = findCuriosityEverywhere(id, characters.value, null, false);
		if (found?.node) list.push(found.node);
	}
	if (character.value && !list.some((c) => String(c.id) === String(character.value?.id))) {
		const host = activeHostRoot.value;
		const hostIdx = host ? list.findIndex((c) => String(c.id) === String(host.id)) : -1;
		if (hostIdx !== -1) {
			list[hostIdx] = character.value;
		} else {
			list.push(character.value);
		}
	}
	if (!list.length && character.value) {
		return [character.value];
	}
	return list;
});

function resolveCuriosity(refOrName: string | null | undefined): CharacterModel | null {
	if (!refOrName) return null;
	const bundleRoot = activeHostRoot.value || character.value;
	const searchRoots = bundleRoot ? [bundleRoot, ...characters.value] : characters.value;
	return findCuriosityEverywhere(refOrName, searchRoots, previewCharacter.value, true)?.node || null;
}

const allGraphNodes = computed(() => collectAllGraphNodes(character.value, activeHostRoot.value, characters.value));

const linkableCuriosities = computed(() => {
	const selfId = String(character.value?.id || '');
	return allGraphNodes.value.filter((n) => n && String(n.id) !== selfId);
});

const outgoingLinks = computed(() => collectOutgoingLinks(character.value, resolveCuriosity));

const incomingBacklinks = computed(() =>
	collectIncomingBacklinks(character.value, allGraphNodes.value, resolveCuriosity),
);

const pullableCuriosities = computed(() => {
	const bundleRoot = activeHostRoot.value || character.value;
	if (!bundleRoot || isPreview.value) return [];
	const rootId = String(bundleRoot.id || '');
	return characters.value.filter(
		(c) => c && !c.isTemplate && String(c.id) !== rootId && !(bundleRoot.curiosities && bundleRoot.curiosities[c.id]),
	);
});

const webTrailCrumbs = computed(() => {
	const crumbs: Array<{ id: string; name: string }> = [];
	for (const id of webTrailIds.value) {
		const found = findCuriosityEverywhere(id, characters.value, previewCharacter.value, false);
		if (found?.node) {
			crumbs.push({
				id: String(found.node.id),
				name: String(found.node.name || 'Unnamed').trim() || 'Unnamed',
			});
		}
	}
	return crumbs;
});

const showCuriosityWebBar = computed(() => {
	if (mode.value !== 'character' || submode.value === 'print' || !character.value) return false;
	const hasEmbedded =
		character.value.curiosities &&
		typeof character.value.curiosities === 'object' &&
		Object.keys(character.value.curiosities).length > 0;
	return Boolean(
		activeHostRoot.value ||
		webTrailCrumbs.value.length > 1 ||
		outgoingLinks.value.length > 0 ||
		incomingBacklinks.value.length > 0 ||
		hasEmbedded,
	);
});

const {
	fallbackDicePool,
	oppositionPool,
	activeRollerSide,
	namedPools,
	activePoolId,
	manuallyRemovedPoolKeys,
	activeNamedPool,
	dicePool,
	totalStagedDiceCount,
	nonEmptyNamedPools,
	activePlayPlotPoints,
	activePlayPlotPointsLabel,
	showPlayPlotPoints,
	rollerCuriosities,
	syncSessionPools,
	selectActivePoolId,
	handleActivePoolSideChange,
	cycleActiveNamedPool,
	handleAddNamedPool,
	handleRemoveNamedPool,
	handleTogglePoolPP,
	addDieToRoller,
	removeDieFromRoller,
	clearDicePool,
	clearOppositionPool,
	handleSettlePP,
} = useSessionPools({
	mode,
	submode,
	character,
	characters,
	previewCharacter,
	openCharacters,
	isStudioPanelOpen,
	studioPanelTab,
	isNarrowViewport,
	updateCharacter: (c) => {
		updateCharacter(c);
	},
	persist: () => {
		persist();
	},
	showToast,
});

const {
	ensureLibraryTemplates,
	resolveTemplateEntry,
	charPrefs,
	applyPrefs,
	recordCharOrder,
	resolveStoredCharacter,
	pendingTemplateUpdate,
	importSheetTemplate,
	deleteSheetTemplate,
	applyTemplateUpdate,
	stayOnTemplateSnapshot,
	sheetTemplateForExport,
	fallbackTemplateTitle,
	saveSheetTemplate,
	exportSheetTemplate,
} = useSheetTemplates({
	mode,
	character,
	characters,
	characterIndex,
	sheetTemplates,
	prefs,
	initHistory,
	saveLocalData: () => {
		saveLocalData();
	},
	showToast,
});

const availableToOpen = computed(() => {
	const q = (sessionCharacterSearch.value || '').toLowerCase().trim();
	return characters.value.filter((c) => {
		if (c.isTemplate) return false;
		if (openCharacterIDs.value.includes(c.id)) return false;
		if (
			q.length &&
			!c.name?.toLowerCase().includes(q) &&
			!getCuriosityGame(c).toLowerCase().includes(q) &&
			!characterCurioFunctions.characterMatchesTagQuery(c, q)
		)
			return false;
		return true;
	});
});

watch(mode, () => {
	setPageTitle();
});
watch(characterID, () => {
	setPageTitle();
});

let deferredSaveTimer: ReturnType<typeof setTimeout> | null = null;

function cancelDeferredSave() {
	if (deferredSaveTimer !== null) {
		clearTimeout(deferredSaveTimer);
		deferredSaveTimer = null;
	}
}

function flushDeferredSave() {
	if (deferredSaveTimer === null) return Promise.resolve();
	cancelDeferredSave();
	return saveLocalData();
}

function handleVisibilityChange() {
	if (typeof document !== 'undefined' && document.visibilityState === 'hidden') {
		flushDeferredSave();
	}
}

function handleBeforeUnload() {
	flushDeferredSave();
}

let mobileViewportMql: MediaQueryList | null = null;
let mobileViewportHandler: ((e: MediaQueryListEvent) => void) | null = null;
const unsubscribeCustomPresets = characterCurioFunctions.onCustomSetPresetsChange((next) => {
	customSetPresets.value = cloneDeep(next);
	if (storeReady.value) {
		void persist({ allowSessionOnlyInPreview: true });
	}
});

onMounted(async () => {
	setViewY();
	await bootFromStorage();
	parseRouteHash();
	storeReady.value = true;
	window.addEventListener('hashchange', () => parseRouteHash());
	window.addEventListener('keydown', (e) => handleGlobalKeydown(e));
	window.addEventListener('pointerdown', (e) => handleGlobalPointerDown(e), true);
	window.addEventListener('mousedown', (e) => handleGlobalPointerDown(e), true);
	window.addEventListener('pointerup', () => {
		setTimeout(() => {
			mouseDownInsideEditor.value = false;
		}, 120);
	});
	window.addEventListener('mouseup', () => {
		setTimeout(() => {
			mouseDownInsideEditor.value = false;
		}, 120);
	});
	// Mobile: when the keyboard opens on an editor field, re-assert
	// the panel into view after the keyboard animation settles.
	document.addEventListener('focusin', (e) => handleEditorFocusIn(e));

	if (typeof window !== 'undefined' && window.matchMedia) {
		const mql = window.matchMedia('(prefers-color-scheme: dark)');
		const handler = (e: MediaQueryListEvent) => {
			systemPrefersDark.value = e.matches;
		};
		mql.addEventListener('change', handler);

		mobileViewportMql = window.matchMedia('(max-width: 48rem)');
		isMobileViewport.value = mobileViewportMql.matches;
		mobileViewportHandler = (e: MediaQueryListEvent) => {
			isMobileViewport.value = e.matches;
		};
		mobileViewportMql.addEventListener('change', mobileViewportHandler);
	}
	if (typeof document !== 'undefined') {
		document.addEventListener('visibilitychange', handleVisibilityChange);
	}
	if (typeof window !== 'undefined') {
		window.addEventListener('beforeunload', handleBeforeUnload);
	}
});

onUnmounted(() => {
	cancelDeferredSave();
	unsubscribeCustomPresets();
	if (mobileViewportMql && mobileViewportHandler) {
		mobileViewportMql.removeEventListener('change', mobileViewportHandler);
	}
	if (typeof document !== 'undefined') {
		document.removeEventListener('visibilitychange', handleVisibilityChange);
	}
	if (typeof window !== 'undefined') {
		window.removeEventListener('beforeunload', handleBeforeUnload);
	}
});

// ---- methods: view ----
function openPreview(showcase: SheetTemplate = DREAMER_ARCHITECT_SHOWCASE as SheetTemplate) {
	try {
		if (!showcase || !showcase.character) {
			console.warn('Dreamer & Architect template missing or invalid — falling back to roster');
			previewCharacter.value = null;
			previewTemplateEntry.value = null;
			characterID.value = null;
			setMode('roster', null, false);
			return;
		}
		previewTemplateEntry.value = showcase;
		previewCharacter.value = structuredClone(toRaw(showcase.character));
		characterID.value = previewCharacter.value?.id ?? null;
		setMode('character', 'play', false);
	} catch (err) {
		console.warn('Failed to load Dreamer & Architect template preview:', err);
		previewCharacter.value = null;
		previewTemplateEntry.value = null;
		characterID.value = null;
		setMode('roster', null, false);
	}
}

function closePreview() {
	previewCharacter.value = null;
	previewTemplateEntry.value = null;
	characterID.value = null;
	previewDismissed.value = true;
	setMode('roster', null, true);
}

function usePreviewTemplate() {
	const target = previewTemplateEntry.value || DREAMER_ARCHITECT_SHOWCASE;
	previewCharacter.value = null;
	previewTemplateEntry.value = null;
	previewDismissed.value = true;
	createFromLibrary(target, false, false);
}

function setMode(m: string, sub: string | null, updateHash = true) {
	if (mode.value === 'character' && submode.value === 'play' && (m !== 'character' || sub !== 'play')) {
		if (hasUncommittedSessionChanges()) {
			pendingNavigation = () => {
				setMode(m, sub, updateHash);
			};
			showPlaySaveConfirm.value = true;
			return;
		}
	}
	if (previewCharacter.value && m !== 'character') {
		previewCharacter.value = null;
		previewTemplateEntry.value = null;
		characterID.value = null;
		previewDismissed.value = true;
	}
	if (m === 'character' && sub === 'play') {
		if (!openCharacterIDs.value.length && characters.value.length) {
			if (characterID.value) {
				openCharacterIDs.value = [characterID.value];
			} else {
				openCharacterIDs.value = [characters.value[0].id];
			}
			saveOpenCharacterIDs();
		} else if (!characters.value.length && !openCharacterIDs.value.length && !previewCharacter.value) {
			openPreview();
			return;
		}
		if ((!characterID.value || !openCharacterIDs.value.includes(characterID.value)) && openCharacterIDs.value.length) {
			characterID.value = openCharacterIDs.value[0];
		}
	}
	if (m === 'character' && !character.value) return;
	if (m !== 'character' || sub !== 'edit') {
		flushDeferredSave();
		commitHistorySnapshot();
		editing.value = [];
	}
	mode.value = m;
	submode.value = sub;
	if (m === 'character' && sub === 'play') {
		if (totalStagedDiceCount.value === 0 && character.value?.id) {
			syncSessionPools(character.value.id);
		}
		// Narrow viewports (overlay drawer): land on the sheet, panel
		// closed — it would otherwise cover the sheet on arrival. The
		// Roller handle opens it explicitly.
		const narrow = isNarrowViewport();
		mobileDrawerState.value = 'staged';
		isStudioPanelOpen.value = !narrow;
		studioPanelTab.value = 'roller';
	} else if (m === 'character' && sub === 'edit') {
		// Same overlay rule as Play: land on the sheet with the drawer
		// closed. Tapping any trait opens it explicitly.
		mobileDrawerState.value = 'staged';
		const narrowEdit = isNarrowViewport();
		isStudioPanelOpen.value = !narrowEdit;
		studioPanelTab.value = 'properties';
	} else {
		mobileDrawerState.value = 'staged';
	}
	if (updateHash) {
		updateRouteHash();
	}
}

function parseRouteHash() {
	const hash = window.location.hash || '#/roster';
	isHandlingHash.value = true;
	const clean = hash.replace(/^#\/?/, '');
	const parts = clean.split('/');
	const primary = parts[0] || 'roster';

	if (primary === 'about') {
		setMode('about', null, false);
	} else if (primary === 'character') {
		const id = parts[1];
		let sub = parts[2] || 'edit';
		if (sub !== 'edit' && sub !== 'play' && sub !== 'print') sub = 'edit';
		const found = findCuriosityEverywhere(id, characters.value, null, false);
		if (found?.node) {
			const targetId = String(found.node.id);
			characterID.value = targetId;
			const trailIdx = webTrailIds.value.indexOf(targetId);
			if (trailIdx !== -1) {
				webTrailIds.value = webTrailIds.value.slice(0, trailIdx + 1);
			} else {
				webTrailIds.value = found.hostRoot ? [String(found.hostRoot.id), targetId] : [targetId];
			}
			setMode('character', sub, false);
			initHistory();
		} else {
			setMode('roster', null, true);
		}
	} else {
		const isDefaultOrEmptyHash =
			!window.location.hash ||
			window.location.hash === '#' ||
			window.location.hash === '#/' ||
			window.location.hash === '#/roster';

		if (characters.value.length && isDefaultOrEmptyHash && !window.location.hash.startsWith('#/roster')) {
			const targetId = openCharacterIDs.value[0] || characters.value[0].id;
			characterID.value = targetId;
			if (!openCharacterIDs.value.includes(targetId)) {
				openCharacterIDs.value = [targetId];
			}
			setMode('character', 'play', true);
			nextTick(() => {
				isHandlingHash.value = false;
			});
			return;
		}

		if (!characters.value.length && !openCharacterIDs.value.length && !previewDismissed.value && isDefaultOrEmptyHash) {
			openPreview();
			nextTick(() => {
				isHandlingHash.value = false;
			});
			return;
		}

		setMode('roster', null, false);
		if (window.location.hash !== '#/roster') {
			window.history.replaceState(null, '', '#/roster');
		}
	}
	nextTick(() => {
		isHandlingHash.value = false;
	});
}

function updateRouteHash() {
	if (isHandlingHash.value) return;
	if (isPreview.value) return;
	let target = '#/roster';
	if (mode.value === 'about') {
		target = '#/about';
	} else if (mode.value === 'character' && characterID.value) {
		target = `#/character/${characterID.value}/${submode.value || 'edit'}`;
	}
	if (window.location.hash !== target) {
		window.history.replaceState(null, '', target);
	}
}

function isMobilePlayViewport() {
	return Boolean(typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(max-width: 48rem)').matches);
}

function setMobileDrawerState(next: 'staged' | 'split' | 'full') {
	mobileDrawerState.value = next;
	if (mode.value === 'character' && submode.value === 'play') {
		isStudioPanelOpen.value = next !== 'staged';
	}
}

function setPanelOpen(open: boolean) {
	isStudioPanelOpen.value = open;
	if (submode.value === 'play' && isMobilePlayViewport()) {
		mobileDrawerState.value = open
			? mobileDrawerState.value === 'staged'
				? 'split'
				: mobileDrawerState.value
			: 'staged';
	}
}

function handleToggleStudio(tab: 'properties' | 'roller' | 'json') {
	if (tab === 'roller' && submode.value !== 'play') tab = 'properties';
	if (isStudioPanelOpen.value && studioPanelTab.value === tab) {
		isStudioPanelOpen.value = false;
	} else {
		isStudioPanelOpen.value = true;
		studioPanelTab.value = tab;
	}
}

function togglePanelPosition() {
	panelPosition.value = panelPosition.value === 'right' ? 'left' : 'right';
	persist();
}

function openSheetPropertiesFromHeader() {
	selectElement([]);
	isStudioPanelOpen.value = true;
	studioPanelTab.value = 'properties';
}

function toggleMobileEditStudio() {
	if (isStudioPanelOpen.value) {
		setPanelOpen(false);
	} else {
		if (studioPanelTab.value === 'roller') studioPanelTab.value = 'properties';
		setPanelOpen(true);
	}
}

// Below the wide push-aside layout the panel is an overlay drawer.
function isNarrowViewport() {
	return Boolean(window.matchMedia && window.matchMedia('(max-width: 1399px)').matches);
}

const studioPanelRef = ref<StudioPanelInstance | null>(null);
const showPlaySaveConfirm = ref(false);
let pendingNavigation: (() => void) | null = null;
const baselineCharacters = new Map<string, string>();

function initBaseline(chars: CharacterModel[]) {
	baselineCharacters.clear();
	(chars || []).forEach((c) => {
		if (c && c.id != null) {
			baselineCharacters.set(String(c.id), JSON.stringify(toRaw(c)));
		}
	});
}

function hasUncommittedSessionChanges(): boolean {
	for (const c of characters.value) {
		if (!c || c.id == null) continue;
		const id = String(c.id);
		const base = baselineCharacters.get(id);
		if (base !== undefined) {
			if (base !== JSON.stringify(toRaw(c))) {
				return true;
			}
		}
	}
	return false;
}

function triggerRollFromPill() {
	studioPanelTab.value = 'roller';
	nextTick(() => {
		if (studioPanelRef.value && typeof studioPanelRef.value.roll === 'function') {
			studioPanelRef.value.roll({ forceDialog: true });
		}
	});
}

function triggerClearFromPill() {
	const poolSnapshots = namedPools.value.map((entry) => ({
		id: entry.id,
		items: structuredClone(toRaw(entry.pool.items)),
		wordBank: structuredClone(toRaw(entry.pool.wordBank || [])),
	}));
	const fallbackSnapshot = {
		items: structuredClone(toRaw(fallbackDicePool.value.items)),
		wordBank: structuredClone(toRaw(fallbackDicePool.value.wordBank || [])),
	};
	const oppSnapshot = {
		items: structuredClone(toRaw(oppositionPool.value.items)),
		wordBank: structuredClone(toRaw(oppositionPool.value.wordBank || [])),
	};
	const clearedCount =
		poolSnapshots.reduce((sum, s) => sum + s.items.length, 0) +
		fallbackSnapshot.items.length +
		(poolSnapshots.some((s) => s.id === 'opposition') ? 0 : oppSnapshot.items.length);

	if (studioPanelRef.value && typeof studioPanelRef.value.clearPool === 'function') {
		studioPanelRef.value.clearPool();
	} else {
		clearDicePool();
		clearOppositionPool();
	}

	if (clearedCount > 0) {
		showToast('Pool cleared', {
			actionLabel: 'Undo',
			durationMs: 4500,
			onAction: () => {
				for (const snap of poolSnapshots) {
					const target = namedPools.value.find((p) => p.id === snap.id);
					if (target) {
						target.pool.items.splice(0, target.pool.items.length, ...structuredClone(snap.items));
						target.pool.wordBank = structuredClone(snap.wordBank);
						target.pool._syncDiceFromItems();
					}
				}
				fallbackDicePool.value.items.splice(
					0,
					fallbackDicePool.value.items.length,
					...structuredClone(fallbackSnapshot.items),
				);
				fallbackDicePool.value.wordBank = structuredClone(fallbackSnapshot.wordBank);
				fallbackDicePool.value._syncDiceFromItems();
				if (!poolSnapshots.some((s) => s.id === 'opposition')) {
					oppositionPool.value.items.splice(
						0,
						oppositionPool.value.items.length,
						...structuredClone(oppSnapshot.items),
					);
					oppositionPool.value.wordBank = structuredClone(oppSnapshot.wordBank);
					oppositionPool.value._syncDiceFromItems();
				}
			},
		});
	}
}

function closeStudioDrawer() {
	editing.value = [];
	if (submode.value === 'play' && isMobilePlayViewport()) {
		setMobileDrawerState('staged');
	} else {
		isStudioPanelOpen.value = false;
	}
}

function toggleMobileRollerDrawer() {
	if (mobileDrawerState.value === 'staged') {
		studioPanelTab.value = 'roller';
		setMobileDrawerState('split');
	} else {
		setMobileDrawerState('staged');
	}
}

let pillTouchStartX = 0;
let pillTouchStartY = 0;

function onPillTouchStart(event: TouchEvent) {
	const t = event.touches?.[0];
	if (!t) return;
	pillTouchStartX = t.clientX;
	pillTouchStartY = t.clientY;
}

function onPillTouchEnd(event: TouchEvent) {
	const t = event.changedTouches?.[0];
	if (!t) return;
	const dx = t.clientX - pillTouchStartX;
	const dy = t.clientY - pillTouchStartY;
	if (dy < -32 && Math.abs(dy) > Math.abs(dx)) {
		studioPanelTab.value = 'roller';
		setMobileDrawerState('split');
	}
}

async function confirmPlaySave() {
	showPlaySaveConfirm.value = false;
	await persist({ allowSessionCharacterSave: true });
	for (const c of characters.value) {
		if (c && c.id != null) {
			baselineCharacters.set(String(c.id), JSON.stringify(toRaw(c)));
		}
	}
	showToast('Saved session changes to character.');
	if (pendingNavigation) {
		const nav = pendingNavigation;
		pendingNavigation = null;
		nav();
	}
}

function discardPlaySession() {
	showPlaySaveConfirm.value = false;
	for (let i = 0; i < characters.value.length; i++) {
		const c = characters.value[i];
		if (c && c.id != null) {
			const baseJson = baselineCharacters.get(String(c.id));
			if (baseJson) {
				characters.value[i] = structuredClone(JSON.parse(baseJson));
			}
		}
	}
	clearDicePool();
	oppositionPool.value.clear();
	showToast('Discarded session changes.');
	if (pendingNavigation) {
		const nav = pendingNavigation;
		pendingNavigation = null;
		nav();
	}
}

function cancelPlaySave() {
	showPlaySaveConfirm.value = false;
	pendingNavigation = null;
	updateRouteHash();
}

function safeImageUrl(url: string | null | undefined) {
	return characterCurioFunctions.safeImageUrl(url);
}

function setViewY() {
	viewY.value = main.value ? main.value.scrollTop : null;
}

function setPageTitle() {
	let pageTitle = 'Character Curio';
	if (mode.value === 'character' && character.value && character.value.name?.length) {
		pageTitle = `${character.value.name} - ${pageTitle}`;
	}
	document.title = pageTitle;
}

// SESSION & MULTI-CHARACTER
function saveOpenCharacterIDs() {
	if (isPreview.value) return;
	persist();
}

function setPlayViewMode(m: string) {
	playViewMode.value = m;
	saveOpenCharacterIDs();
}

function focusCharacter(id: string) {
	const found = findCuriosityEverywhere(id, characters.value, previewCharacter.value, false);
	if (!found?.hostRoot && !openCharacterIDs.value.includes(id)) {
		openCharacterIDs.value.push(id);
	}
	const trailIdx = webTrailIds.value.indexOf(id);
	if (trailIdx !== -1) {
		webTrailIds.value = webTrailIds.value.slice(0, trailIdx + 1);
	} else {
		webTrailIds.value = found?.hostRoot ? [String(found.hostRoot.id), id] : [id];
	}
	characterID.value = id;
	initHistory();
	setPageTitle();
	updateRouteHash();
	saveOpenCharacterIDs();
}

function closeOpenCharacter(id: string) {
	const found = findCuriosityEverywhere(id, characters.value, null, false);
	const hostId = found?.hostRoot?.id ? String(found.hostRoot.id) : null;
	openCharacterIDs.value = openCharacterIDs.value.filter((x: string) => x !== id && x !== hostId);
	webTrailIds.value = webTrailIds.value.filter((x: string) => x !== id && x !== hostId);
	if (characterID.value === id) {
		characterID.value = openCharacterIDs.value[0] || null;
		if (!characterID.value) {
			setMode('roster', null, true);
		} else {
			webTrailIds.value = [characterID.value];
			initHistory();
			updateRouteHash();
		}
	}
	saveOpenCharacterIDs();
}

function exploreCuriosity(targetIdOrName: string): boolean {
	const bundleRoot = activeHostRoot.value || character.value;
	const searchRoots = bundleRoot ? [bundleRoot, ...characters.value] : characters.value;
	const found = findCuriosityEverywhere(targetIdOrName, searchRoots, previewCharacter.value, true);
	if (!found?.node?.id) return false;
	const targetId = String(found.node.id);
	const currentId = character.value?.id ? String(character.value.id) : null;

	commitHistorySnapshot();
	flushDeferredSave();
	editing.value = [];

	const nextTrail = [...webTrailIds.value];
	if (currentId && !nextTrail.includes(currentId)) {
		if (activeHostRoot.value?.id && !nextTrail.includes(String(activeHostRoot.value.id))) {
			nextTrail.push(String(activeHostRoot.value.id));
		}
		nextTrail.push(currentId);
	}
	const existingIdx = nextTrail.indexOf(targetId);
	if (existingIdx !== -1) {
		webTrailIds.value = nextTrail.slice(0, existingIdx + 1);
	} else {
		nextTrail.push(targetId);
		webTrailIds.value = nextTrail;
	}

	characterID.value = targetId;
	if (!found.hostRoot && !isPreview.value && !openCharacterIDs.value.includes(targetId)) {
		openCharacterIDs.value.push(targetId);
		saveOpenCharacterIDs();
	}
	initHistory();
	setPageTitle();
	if (mode.value !== 'character') {
		setMode('character', submode.value || 'edit', true);
	} else {
		updateRouteHash();
	}
	if (main.value) {
		main.value.scrollTop = 0;
	}
	return true;
}

function spawnCuriosity(opts: SpawnCuriosityOptions): string | null {
	const bundleRoot = activeHostRoot.value || character.value;
	if (!bundleRoot) return null;
	const created = createBlankEmbeddedCuriosity({
		name: opts.name,
		die: opts.die,
		dice: opts.dice,
	});
	characterCurioFunctions.ensureTraitSetIds(created);
	characterCurioFunctions.assignLids(created);
	if (!bundleRoot.curiosities || typeof bundleRoot.curiosities !== 'object' || Array.isArray(bundleRoot.curiosities)) {
		bundleRoot.curiosities = {};
	}
	bundleRoot.curiosities[created.id] = characterCurioFunctions.orderCharacterKeys(created);
	opts.onCreated?.(created.id, bundleRoot.curiosities[created.id]);
	updateCharacter(bundleRoot);
	if (opts.navigate) {
		exploreCuriosity(created.id);
	} else {
		showToast(`Created curiosity "${created.name || 'Unnamed'}"`);
	}
	return created.id;
}

function popOutCuriosity(curiosityId: string): boolean {
	const found = findCuriosityEverywhere(curiosityId, characters.value, null, false);
	if (!found?.hostRoot) return false;
	const promoted = popOutFromRoot(found.hostRoot, curiosityId, characters.value);
	if (!promoted) return false;
	characterCurioFunctions.ensureTraitSetIds(promoted);
	characterCurioFunctions.assignLids(promoted);
	if (!openCharacterIDs.value.includes(promoted.id)) {
		openCharacterIDs.value.push(promoted.id);
	}
	saveOpenCharacterIDs();
	if (submode.value !== 'play') {
		saveLocalData();
	}
	showToast(`Popped out "${promoted.name || 'Unnamed'}" to Roster`);
	return true;
}

function pullInCuriosity(curiosityId: string): boolean {
	const bundleRoot = activeHostRoot.value || character.value;
	if (!bundleRoot || isPreview.value) return false;
	const pulled = pullInToRoot(bundleRoot, curiosityId, characters.value);
	if (!pulled) return false;
	openCharacterIDs.value = openCharacterIDs.value.filter((x: string) => x !== curiosityId);
	if (!openCharacterIDs.value.includes(bundleRoot.id)) {
		openCharacterIDs.value.push(bundleRoot.id);
	}
	characterCurioFunctions.ensureTraitSetIds(bundleRoot);
	characterCurioFunctions.assignLids(bundleRoot);
	saveOpenCharacterIDs();
	if (submode.value !== 'play') {
		saveLocalData();
	}
	showToast(`Pulled "${pulled.name || 'Unnamed'}" into ${bundleRoot.name || 'bundle'}`);
	return true;
}

provide(CURIOSITY_GRAPH_KEY, {
	activeNode: character,
	activeHostRoot,
	resolveCuriosity,
	linkableCuriosities,
	exploreCuriosity,
	spawnCuriosity,
	popOutCuriosity,
	pullInCuriosity,
});

function openAlongside(id: string) {
	if (!openCharacterIDs.value.includes(id)) {
		openCharacterIDs.value.push(id);
	}
	characterID.value = id;
	isAddCharacterModalOpen.value = false;
	saveOpenCharacterIDs();
	setMode('character', submode.value || 'play', true);
	const char = characters.value.find((c) => c.id === id);
	showToast(`Opened ${char?.name || 'character'} in session`);
}

function resumeSession() {
	if (!openCharacterIDs.value.length && characters.value.length) {
		openCharacterIDs.value = [characters.value[0].id];
	} else if (!characters.value.length && !openCharacterIDs.value.length && !previewCharacter.value) {
		openPreview();
		return;
	}
	if (!characterID.value && openCharacterIDs.value.length) {
		characterID.value = openCharacterIDs.value[0];
	}
	setMode('character', 'play', true);
}

function setModeForChar(charId: string, sub: string) {
	focusCharacter(charId);
	setMode('character', sub, true);
}

// DATA
const {
	createCharacter,
	createTemplate,
	createFromTemplate,
	createFromLibrary,
	toggleTemplate,
	deleteCharacter,
	deleteAllCharacters,
	duplicateCharacter,
	loadCharacter,
	importCharacter,
	exportCharacter,
	importSetPresets,
	exportAllCharacters,
} = useRosterActions({
	characters,
	characterID,
	openCharacterIDs,
	webTrailIds,
	submode,
	sheetTemplates,
	customSetPresets,
	prefs,
	previewCharacter,
	previewTemplateEntry,
	previewDismissed,
	totalStagedDiceCount,
	manuallyRemovedPoolKeys,
	cloneDeep,
	ensureLibraryTemplates,
	resolveTemplateEntry,
	sheetTemplateForExport,
	downloadJson,
	recordCharOrder,
	applyPrefs,
	saveOpenCharacterIDs,
	syncSessionPools,
	initHistory,
	setMode,
	setPageTitle,
	touchCharacter,
	saveLocalData: () => saveLocalData(),
	persist: () => persist(),
	showToast,
});

function updateCharacter(characterData: CharacterModel) {
	if (previewCharacter.value) {
		if (previewCharacter.value.id === characterData.id) {
			previewCharacter.value = characterData;
		} else if (previewCharacter.value.curiosities?.[characterData.id]) {
			previewCharacter.value.curiosities[characterData.id] = characterData;
		}
		return Promise.resolve();
	}

	const c = characters.value.findIndex((savedCharacter) => savedCharacter.id === characterData.id);
	let hostIdx = -1;
	if (c === -1) {
		hostIdx = characters.value.findIndex(
			(root) =>
				root?.curiosities && typeof root.curiosities === 'object' && Boolean(root.curiosities[characterData.id]),
		);
		if (hostIdx === -1) return Promise.resolve();
	}

	const now = new Date().toISOString();
	characterData.dateModified = now;
	characterData.dateTouched = now;
	characterCurioFunctions.ensureTraitSetIds(characterData);
	characterCurioFunctions.assignLids(characterData);

	if (c !== -1) {
		characters.value[c] = characterData;
		recordCharOrder(characterData);
		touchCharacter(characterData.id);
	} else {
		const hostRoot = characters.value[hostIdx];
		if (hostRoot.curiosities) {
			hostRoot.curiosities[characterData.id] = characterCurioFunctions.orderCharacterKeys(characterData);
		}
		hostRoot.dateModified = now;
		hostRoot.dateTouched = now;
		recordCharOrder(characterData);
	}
	setPageTitle();
	if (submode.value === 'play') {
		return Promise.resolve();
	}
	markDirty();
	if (editing.value && editing.value.length > 0) {
		cancelDeferredSave();
		deferredSaveTimer = setTimeout(() => {
			deferredSaveTimer = null;
			saveLocalData();
		}, 120);
		scheduleHistorySnapshot(400);
		return Promise.resolve();
	}
	const saved = saveLocalData();
	commitHistorySnapshot();
	return saved;
}

// history (initHistory / commitHistorySnapshot / validateEditing / undo / redo)
// now lives in use-history.ts

function handleGlobalKeydown(event: KeyboardEvent) {
	if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
		event.preventDefault();
		isPaletteOpen.value = !isPaletteOpen.value;
		return;
	}

	const el = event.target as HTMLElement | null;
	const target = el ? el.tagName : '';
	const isTypingTarget =
		target === 'INPUT' || target === 'TEXTAREA' || target === 'SELECT' || Boolean(el?.isContentEditable);

	if (
		event.key === '/' &&
		!event.ctrlKey &&
		!event.metaKey &&
		!event.altKey &&
		!isTypingTarget &&
		!isPaletteOpen.value
	) {
		event.preventDefault();
		isPaletteOpen.value = true;
		return;
	}

	if (
		mode.value === 'character' &&
		submode.value === 'play' &&
		event.key === 'Escape' &&
		!isPaletteOpen.value &&
		isMobilePlayViewport() &&
		mobileDrawerState.value !== 'staged'
	) {
		const rollDlg = document.querySelector('#rollDialog');
		if (!rollDlg || !rollDlg.hasAttribute('open')) {
			event.preventDefault();
			setMobileDrawerState('staged');
			return;
		}
	}

	if (mode.value !== 'character' || submode.value !== 'edit') return;

	if (event.key === 'Escape') {
		if (isPaletteOpen.value) return;
		if (editing.value && editing.value.length) {
			event.preventDefault();
			if (event.target instanceof HTMLElement) {
				event.target.blur();
			}
			clearSelected();
			return;
		}
	}

	if (isTypingTarget) return;

	if ((event.ctrlKey || event.metaKey) && !event.shiftKey && event.key.toLowerCase() === 'z') {
		event.preventDefault();
		undo();
	} else if (
		((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'y') ||
		((event.ctrlKey || event.metaKey) && event.shiftKey && event.key.toLowerCase() === 'z')
	) {
		event.preventDefault();
		redo();
	}
}

function touchCharacter(id: string) {
	const c = characters.value.findIndex((savedCharacter) => savedCharacter.id === id);

	if (c === -1) return;

	const characterData = characters.value[c];

	characterData.dateTouched = new Date().toISOString();

	characters.value[c] = characterData;
}

function selectElement(selector: EditingPath) {
	// Re-clicking the open element keeps its editor open (it never toggles
	// shut); deselect via Done, Escape, or clicking empty canvas instead.
	if (Array.isArray(selector) && selector.length && characterCurioFunctions.arraysMatch(editing.value, selector)) {
		isStudioPanelOpen.value = true;
		studioPanelTab.value = 'properties';
		if (submode.value === 'play' && isMobilePlayViewport() && mobileDrawerState.value === 'staged') {
			setMobileDrawerState('split');
		}
		return;
	}

	commitHistorySnapshot();
	editing.value = selector;

	if (selector.length > 0) {
		isStudioPanelOpen.value = true;
		studioPanelTab.value = 'properties';
		if (submode.value === 'play' && isMobilePlayViewport() && mobileDrawerState.value === 'staged') {
			setMobileDrawerState('split');
		}
	} else if (submode.value === 'play' && isMobilePlayViewport() && studioPanelTab.value === 'properties') {
		studioPanelTab.value = 'roller';
		setMobileDrawerState('staged');
	}

	// Mobile: bring active panel into view
	if (
		selector.length &&
		mode.value === 'character' &&
		submode.value !== 'print' &&
		window.matchMedia &&
		window.matchMedia('(max-width: 48rem)').matches
	) {
		nextTick(() => {
			const open =
				document.querySelector('.studio-panel') ||
				document.querySelector('.editor.open') ||
				document.querySelector('aside.editor');
			if (open && open.scrollIntoView) {
				try {
					open.scrollIntoView({ block: 'nearest' });
				} catch (err) {}
			}
		});
	}
}

function handleGlobalPointerDown(event: Event) {
	mouseDownInsideEditor.value = Boolean(
		event?.target instanceof Element &&
		event.target.closest(
			'.header, .editor, .modal, .studio-panel, .sheet-bar-btn, .mobile-sheet-popover, .mobile-roller-pill-bar, .curiosity-web-bar',
		),
	);
}

function handleMainClick(event: Event) {
	const wikiEl = (event?.target as HTMLElement | null)?.closest?.('a.curio-wikilink') as HTMLElement | null;
	if (wikiEl) {
		event.preventDefault();
		const refTarget = wikiEl.getAttribute('data-curio-ref') || '';
		if (refTarget) {
			if (!exploreCuriosity(refTarget) && !isPreview.value && character.value) {
				spawnCuriosity({ name: refTarget, navigate: true });
			}
		}
		return;
	}
	if (mouseDownInsideEditor.value) {
		return;
	}
	if (
		event?.target instanceof Element &&
		event.target.closest(
			'.header, .editor, .modal, .studio-panel, .sheet-bar-btn, .mobile-sheet-popover, .mobile-roller-pill-bar, .curiosity-web-bar',
		)
	) {
		return;
	}
	const selection = window.getSelection ? window.getSelection() : null;
	if (selection && !selection.isCollapsed && selection.toString().trim().length > 0) {
		return;
	}
	clearSelected();
}

function clearSelected() {
	flushDeferredSave();
	selectElement([]);
}

function removeTrait(traitSetID: number, traitID: number) {
	clearSelected();
	if (!character.value) return;
	const char = character.value;
	const entry = characterCurioFunctions.resolveTemplateFor(char, sheetTemplates.value);
	characterCurioFunctions.removeTraitFromSheet(char, entry, traitSetID, traitID);
	updateCharacter(char);
}

function removeTraitSet(traitSetID: number) {
	clearSelected();
	if (!character.value) return;
	const char = character.value;
	const entry = characterCurioFunctions.resolveTemplateFor(char, sheetTemplates.value);
	characterCurioFunctions.removeTraitSetFromSheet(char, entry, traitSetID);
	updateCharacter(char);
}

// Mobile: when the on-screen keyboard opens on an editor field,
// re-assert the focused field into view after the animation.
function handleEditorFocusIn(event: Event) {
	if (!window.matchMedia || !window.matchMedia('(max-width: 48rem)').matches) return;
	const t = event && (event.target as HTMLElement);
	if (!t || !t.closest) return;
	if (t.tagName !== 'INPUT' && t.tagName !== 'TEXTAREA' && t.tagName !== 'SELECT') return;
	const panel = t.closest('.editor');
	if (!panel) return;
	setTimeout(() => {
		try {
			const el =
				document.activeElement && (document.activeElement as HTMLElement).scrollIntoView
					? (document.activeElement as HTMLElement)
					: t;
			el.scrollIntoView({ block: 'nearest' });
		} catch (err) {}
	}, 350);
}

const { bootFromStorage, persist, saveLocalData } = usePersistence({
	characters,
	characterID,
	openCharacterIDs,
	isPreview,
	submode,
	sheetTemplates,
	customSetPresets,
	prefs,
	playViewMode,
	panelPosition,
	storeReady,
	storeError,
	showPlaySaveConfirm,
	baselineCharacters,
	ensureLibraryTemplates,
	resolveTemplateEntry,
	resolveStoredCharacter,
	initBaseline,
	cancelDeferredSave,
	showToast,
});

// The mounted proxy is the documented debug/test handle. With
// `<script setup>` bindings are closed by default, so expose them explicitly.
defineExpose({
	localData,
	characters,
	characterID,
	previewCharacter,
	isPreview,
	openPreview,
	closePreview,
	usePreviewTemplate,
	openCharacterIDs,
	sheetTemplates,
	customSetPresets,
	prefs,
	playViewMode,
	isAddCharacterModalOpen,
	isPaletteOpen,
	sessionCharacterSearch,
	mode,
	submode,
	editing,
	viewY,
	dicePool,
	oppositionPool,
	activeRollerSide,
	namedPools,
	activePoolId,
	selectActivePoolId,
	handleAddNamedPool,
	handleRemoveNamedPool,
	handleTogglePoolPP,
	isStudioPanelOpen,
	studioPanelTab,
	panelPosition,
	toastMessage,
	history,
	historyIndex,
	storeReady,
	storeError,
	character,
	openCharacters,
	availableToOpen,
	pendingTemplateUpdate,
	canUndo,
	canRedo,
	safeImageUrl,
	setMode,
	parseRouteHash,
	updateRouteHash,
	addDieToRoller,
	removeDieFromRoller,
	clearDicePool,
	showToast,
	ensureLibraryTemplates,
	resolveTemplateEntry,
	charPrefs,
	applyPrefs,
	recordCharOrder,
	resolveStoredCharacter,
	setViewY,
	setPageTitle,
	saveOpenCharacterIDs,
	setPlayViewMode,
	focusCharacter,
	closeOpenCharacter,
	exploreCuriosity,
	spawnCuriosity,
	popOutCuriosity,
	pullInCuriosity,
	webTrailIds,
	openAlongside,
	resumeSession,
	setModeForChar,
	createCharacter,
	createTemplate,
	createFromTemplate,
	createFromLibrary,
	toggleTemplate,
	deleteCharacter,
	deleteAllCharacters,
	duplicateCharacter,
	loadCharacter,
	importSheetTemplate,
	applyTemplateUpdate,
	stayOnTemplateSnapshot,
	importCharacter,
	downloadJson,
	sheetTemplateForExport,
	exportCharacter,
	saveSheetTemplate,
	exportSheetTemplate,
	importSetPresets,
	exportAllCharacters,
	updateCharacter,
	initHistory,
	commitHistorySnapshot,
	validateEditing,
	undo,
	redo,
	handleGlobalKeydown,
	touchCharacter,
	selectElement,
	handleGlobalPointerDown,
	handleMainClick,
	clearSelected,
	handleEditorFocusIn,
	bootFromStorage,
	persist,
	saveLocalData,
	isNarrowViewport,
	handleToggleStudio,
	studioPanelRef,
	showPlaySaveConfirm,
	confirmPlaySave,
	discardPlaySession,
	cancelPlaySave,
	hasUncommittedSessionChanges,
	baselineCharacters,
	triggerRollFromPill,
	triggerClearFromPill,
	toggleMobileRollerDrawer,
	mobileDrawerState,
	setMobileDrawerState,
	colorSchemePref,
	isDarkMode,
	toggleDarkMode,
});
</script>

<template>
	<app-header
		:mode="mode"
		:submode="submode"
		:hasCharacter="!!character"
		:canPlay="canPlay"
		:canUndo="canUndo"
		:canRedo="canRedo"
		:isDarkMode="isDarkMode"
		:openCharacters="openCharacters"
		:characterID="characterID"
		:activeCharacterName="character?.name || 'Unnamed'"
		:sessionDirty="submode === 'play' && hasUncommittedSessionChanges()"
		:drawerState="mobileDrawerState"
		:isStudioOpen="isStudioPanelOpen"
		@navigate="setMode"
		@undo="undo"
		@redo="redo"
		@toggleTheme="toggleDarkMode"
		@toggleStudio="toggleMobileEditStudio"
		@openPalette="isPaletteOpen = true"
		@focusCharacter="focusCharacter"
		@closeCharacter="closeOpenCharacter"
		@addCharacter="isAddCharacterModalOpen = true"
		@saveSession="saveLocalData"
		@openSheetProperties="openSheetPropertiesFromHeader"
		@exportCharacter="character && exportCharacter(character.id)"
	/>

	<!-- PLAY SHELL: STUDIO PANEL (INSPECTOR + ROLLER) + SHEET VIEWPORT -->
	<div
		v-show="storeReady || isPreview || Boolean(character)"
		class="play-shell"
		:data-mode="mode"
		:data-submode="submode || ''"
		:data-drawer-state="mobileDrawerState"
		:class="{
			'theme-dark': isDarkMode,
			'panel-open': isStudioPanelOpen && mode === 'character' && submode !== 'print',
			'panel-right': panelPosition === 'right',
			'panel-left': panelPosition === 'left',
		}"
	>
		<!-- STUDIO PANEL: PROPERTIES INSPECTOR & DICE ROLLER -->
		<studio-panel
			ref="studioPanelRef"
			v-if="mode === 'character' && submode !== 'print'"
			:character="character"
			:curiosities="rollerCuriosities"
			:editing="editing"
			:submode="submode"
			:mode="mode"
			:isOpen="isStudioPanelOpen"
			:drawerState="mobileDrawerState"
			:position="panelPosition"
			:panelTab="studioPanelTab"
			:dicePool="dicePool"
			:oppositionPool="oppositionPool"
			:activePoolSide="activeRollerSide"
			:namedPools="namedPools"
			:activePoolId="activePoolId"
			:viewY="viewY"
			@update:panelTab="studioPanelTab = $event"
			@update:activePoolSide="handleActivePoolSideChange"
			@update:activePoolId="selectActivePoolId"
			@addNamedPool="handleAddNamedPool"
			@removeNamedPool="handleRemoveNamedPool"
			@togglePoolPP="handleTogglePoolPP"
			@update:isOpen="setPanelOpen($event)"
			@update:drawerState="setMobileDrawerState($event)"
			@togglePosition="togglePanelPosition"
			@selectElement="selectElement"
			@updateCharacter="updateCharacter"
			@applyJson="importCharacter"
			@removeTrait="removeTrait"
			@removeTraitSet="removeTraitSet"
			@saveSheetTemplate="saveSheetTemplate"
			@exportSheetTemplate="exportSheetTemplate"
			@addDie="addDieToRoller"
			@removeDie="removeDieFromRoller"
			@clearPool="clearDicePool"
			@clearOppositionPool="clearOppositionPool"
			@settlePP="handleSettlePP"
		/>

		<div class="sheet-column">
			<session-nav
				v-if="mode === 'character' && submode !== 'print'"
				:openCharacters="openCharacters"
				:characterID="characterID"
				:submode="submode"
				:playViewMode="playViewMode"
				:isStudioPanelOpen="isStudioPanelOpen"
				:studioPanelTab="studioPanelTab"
				:rollerCount="totalStagedDiceCount"
				:isDesktopPillars="isDesktopPillars"
				@focus="focusCharacter"
				@close="closeOpenCharacter"
				@add="isAddCharacterModalOpen = true"
				@setPlayView="setPlayViewMode"
				@toggleStudio="handleToggleStudio"
				@saveSession="saveLocalData"
				@togglePillars="toggleDesktopPillars"
				@addPlayCard="openActivePlayPresetPicker"
			/>

			<main class="main" ref="main" @scroll="setViewY" @click.stop="handleMainClick">
				<!-- CURIOSITY GRAPH WEB BAR (BREADCRUMBS, BACKLINKS, OUTGOING EDGES, POP OUT / PULL IN) -->
				<CuriosityWebBar
					v-if="showCuriosityWebBar"
					:activeNode="character"
					:hostRoot="activeHostRoot"
					:trail="webTrailCrumbs"
					:incomingBacklinks="incomingBacklinks"
					:outgoingLinks="outgoingLinks"
					:pullableCuriosities="pullableCuriosities"
					:submode="submode"
					@navigate="exploreCuriosity"
					@popOut="popOutCuriosity"
					@pullIn="pullInCuriosity"
					@spawnPeer="spawnCuriosity"
				/>

				<!-- TEMPLATE PREVIEW BANNER -->
				<div class="template-update-banner template-preview-banner" v-if="isPreview">
					<span class="template-banner-label">
						<span class="template-banner-badge">Preview</span>
						<span class="template-banner-title">{{ previewCharacter?.name || 'Template' }}</span>
					</span>
					<div class="template-banner-actions">
						<button type="button" class="btn-update-primary" @click.stop="usePreviewTemplate">Use this template</button>
						<button type="button" class="btn-update-secondary" @click.stop="closePreview">Close preview</button>
					</div>
				</div>

				<!-- TEMPLATE VERSION SWITCH PROMPT -->
				<div class="template-update-banner" v-if="pendingTemplateUpdate && submode === 'edit'">
					<span
						><i class="fas fa-layer-group"></i> A newer layout (v{{ pendingTemplateUpdate.current }}) is available for
						this sheet — you are on your saved v{{ pendingTemplateUpdate.pinned }}. Your content and arrangement carry
						over.</span
					>
					<button type="button" class="btn-update-primary" @click.stop="applyTemplateUpdate">Update layout</button>
					<button type="button" class="btn-update-secondary" @click.stop="stayOnTemplateSnapshot">
						Stay on v{{ pendingTemplateUpdate.pinned }}
					</button>
				</div>

				<!-- CHARACTER SHEET -->
				<roster
					v-if="mode === 'roster' && storeReady"
					:characters="characters"
					:sheetTemplates="sheetTemplates"
					:customPresets="customSetPresets"
					@createCharacter="createCharacter"
					@createFromTemplate="createFromTemplate"
					@toggleTemplate="toggleTemplate"
					@loadCharacter="loadCharacter"
					@playCharacter="(id) => loadCharacter(id, 'play')"
					@duplicateCharacter="duplicateCharacter"
					@exportCharacter="exportCharacter"
					@exportAllCharacters="exportAllCharacters"
					@deleteCharacter="deleteCharacter"
					@deleteAllCharacters="deleteAllCharacters"
					@importCharacter="importCharacter"
					@importSheetTemplate="importSheetTemplate"
					@importSetPresets="importSetPresets"
					@deleteSheetTemplate="deleteSheetTemplate"
					@createFromLibrary="createFromLibrary"
					@previewTemplate="openPreview"
				></roster>

				<!-- PLAY MODE: MULTI-CHARACTER SPLIT VIEW -->
				<div
					class="multi-character-workspace"
					v-else-if="
						mode === 'character' &&
						submode === 'play' &&
						!isMobileViewport &&
						playViewMode === 'split' &&
						openCharacters.length > 1
					"
					key="multi-character-split"
				>
					<div
						v-for="char in openCharacters"
						:key="char.id"
						class="multi-character-column"
						:class="{ 'is-active-column': char.id === characterID }"
					>
						<div class="multi-character-banner">
							<div class="banner-title-group" @click="focusCharacter(char.id)">
								<span
									class="banner-avatar"
									v-if="getCuriosityThumbnailUrl(char)"
									:style="'background-image:url(' + safeImageUrl(getCuriosityThumbnailUrl(char)) + ')'"
								></span>
								<span class="banner-icon" v-else><i class="fas fa-lightbulb"></i></span>
								<span class="banner-name">{{ char.name || 'Unnamed' }}</span>
								<span class="banner-game" v-if="getCuriosityGame(char)">{{ getCuriosityGame(char) }}</span>
							</div>
							<div class="banner-actions">
								<button
									type="button"
									class="btn-banner-action"
									@click.stop="setModeForChar(char.id, 'edit')"
									title="Edit this character"
								>
									<i class="fas fa-pencil"></i>
								</button>
								<button
									type="button"
									class="btn-banner-action"
									@click.stop="setModeForChar(char.id, 'print')"
									title="Print this character"
								>
									<i class="fas fa-print"></i>
								</button>
								<button
									type="button"
									class="btn-banner-action"
									@click.stop="closeOpenCharacter(char.id)"
									title="Close from session"
								>
									<i class="fas fa-times"></i>
								</button>
							</div>
						</div>

						<Character
							:ref="(el) => setSplitCharacterRef(char.id, el)"
							submode="play"
							:character="char"
							:editing="editing"
							:viewY="viewY"
							:dicePool="dicePool"
							:isDesktopPillars="isDesktopPillars"
							@selectElement="selectElement"
							@updateCharacter="updateCharacter"
							@exportCharacter="exportCharacter"
							@saveSheetTemplate="saveSheetTemplate"
							@exportSheetTemplate="exportSheetTemplate"
							@addDieToRoller="addDieToRoller"
							@closeDrawer="closeStudioDrawer"
						></Character>
					</div>
				</div>

				<Character
					ref="characterRef"
					v-else-if="mode === 'character' && character"
					:submode="submode"
					:character="character"
					:editing="editing"
					:viewY="viewY"
					:dicePool="dicePool"
					:isDesktopPillars="isDesktopPillars"
					@selectElement="selectElement"
					@updateCharacter="updateCharacter"
					@exportCharacter="exportCharacter"
					@saveSheetTemplate="saveSheetTemplate"
					@exportSheetTemplate="exportSheetTemplate"
					@addDieToRoller="addDieToRoller"
					@closeDrawer="closeStudioDrawer"
				></Character>

				<article class="about" v-else-if="mode === 'about'">
					<h1>About Character Curio</h1>

					<p>
						Cortex Prime is the award-winning world-building tabletop RPG system for forging unique, compelling game
						experiences from a set of modular rules mechanics available at
						<a href="https://www.cortexrpg.com" target="_blank" rel="noopener noreferrer">CortexRPG.com</a>.
					</p>

					<p>
						Cortex is &copy; {{ year }} Dire Wolf Digital, LLC. Cortex, Cortex Prime, associated logos and trade dress
						are the trademarks of Dire Wolf Digital, LLC. Iconography used with permission.
					</p>

					<p>
						If you wish to publish or sell what you make using this tool, it is your responsibility to ensure you have
						the proper license or right for any resources used. No rights are granted through the use of this tool.
					</p>

					<p>
						<a href="https://github.com/lynn0702/cortex-toolkit" target="_blank" rel="noopener noreferrer">
							<i class="fab fa-github" aria-hidden="true"></i> Source on GitHub
						</a>
					</p>
				</article>
			</main>
			<!-- DOCKED MOBILE ROLLER PILL BAR -->
			<div
				class="mobile-roller-pill-bar"
				v-if="mode === 'character' && submode === 'play'"
				:class="{
					'has-dice': totalStagedDiceCount > 0,
					'is-open': isStudioPanelOpen && studioPanelTab === 'roller',
				}"
				@touchstart.passive="onPillTouchStart"
				@touchend.passive="onPillTouchEnd"
			>
				<div
					class="character-pp-badge footer-pp-badge"
					v-if="isMobileViewport && showPlayPlotPoints"
					@click.stop
					@touchstart.stop
					@touchend.stop
				>
					<span class="pp-badge-label">{{ activePlayPlotPointsLabel }}</span>
					<button
						type="button"
						class="btn-pp-step"
						@click.stop="handleSettlePP(-1)"
						:disabled="activePlayPlotPoints <= 0"
						title="Spend Plot Point"
						aria-label="Spend Plot Point"
					>
						-
					</button>
					<span class="pp-count">{{ activePlayPlotPoints }}</span>
					<button
						type="button"
						class="btn-pp-step"
						@click.stop="handleSettlePP(1)"
						title="Gain Plot Point"
						aria-label="Gain Plot Point"
					>
						+
					</button>
				</div>
				<div class="mobile-roller-pill-staged-group">
					<div
						class="mobile-roller-pill-left"
						@click="
							studioPanelRef?.diceRoller?.isRolled ? studioPanelRef.openOutcomeDialog() : toggleMobileRollerDrawer()
						"
					>
						<template
							v-if="
								studioPanelRef?.diceRoller?.isRolled &&
								studioPanelRef?.diceRoller?.isContestRoll &&
								studioPanelRef?.diceRoller?.contestSummary
							"
						>
							<span class="pill-result-total"
								>{{ studioPanelRef.diceRoller.contestSummary.playerLabel || 'Player' }}
								<strong>{{ studioPanelRef.diceRoller.contestSummary.playerTotal }}</strong></span
							>
							<span class="pill-bullet">vs</span>
							<span class="pill-result-effect"
								>{{ studioPanelRef.diceRoller.contestSummary.oppLabel || 'Opp' }}
								<strong>{{ studioPanelRef.diceRoller.contestSummary.oppTotal }}</strong></span
							>
						</template>
						<template v-else-if="studioPanelRef?.diceRoller?.isRolled && studioPanelRef?.diceRoller?.bestTotalInfo">
							<span class="pill-result-total"
								>Total: <strong>{{ studioPanelRef.diceRoller.bestTotalInfo.total }}</strong></span
							>
							<span class="pill-bullet">•</span>
							<span class="pill-result-effect"
								>Effect: <strong>{{ studioPanelRef.diceRoller.bestTotalInfo.effect }}</strong></span
							>
						</template>
						<template v-else-if="totalStagedDiceCount > 0">
							<template v-for="(npEntry, npIdx) in nonEmptyNamedPools" :key="'pill-np-' + npEntry.id">
								<span v-if="npIdx > 0" class="pill-vs-tag">vs</span>
								<span
									v-for="(item, dIdx) in npEntry.pool.items"
									:key="'pd-' + npEntry.id + '-' + dIdx"
									class="pill-die"
									:class="{ 'pill-die-opp': npEntry.id === 'opposition' || (!npEntry.ownerId && npIdx > 0) }"
								>
									<span v-html="characterCurioFunctions.renderDieconSVG(item.size, false, '', null)"></span>
									<span v-if="item.ppDelta" class="pill-pp-tag">+PP</span>
								</span>
							</template>
						</template>
						<template v-else>
							<span class="pill-empty-label"><i class="fas fa-dice" aria-hidden="true"></i> Tap traits</span>
						</template>
					</div>
					<button
						v-if="totalStagedDiceCount > 0"
						type="button"
						class="btn-pill-clear"
						@click.stop="triggerClearFromPill"
						title="Clear pool"
						aria-label="Clear pool"
					>
						<i class="fas fa-times" aria-hidden="true"></i>
					</button>
				</div>
				<div class="mobile-roller-pill-right">
					<button type="button" class="btn-pill-expand" @click.stop="toggleMobileRollerDrawer" title="Open dice roller">
						<i class="fas fa-dice" aria-hidden="true"></i>
						{{ totalStagedDiceCount > 0 ? 'Pool' : 'Roller' }}
					</button>
					<button
						v-if="totalStagedDiceCount > 0"
						type="button"
						class="btn-pill-roll"
						@click.stop="triggerRollFromPill"
						title="Roll dice"
					>
						<i class="fas fa-dice" aria-hidden="true"></i> Roll
					</button>
				</div>
			</div>
		</div>
		<!-- /.sheet-column -->
	</div>
	<!-- /.play-shell -->

	<add-character-modal
		v-if="hasOpenedAddModal || isAddCharacterModalOpen"
		:open="isAddCharacterModalOpen"
		:items="availableToOpen"
		:search="sessionCharacterSearch"
		@update:open="isAddCharacterModalOpen = $event"
		@update:search="sessionCharacterSearch = $event"
		@openAlongside="openAlongside"
		@gotoRoster="
			isAddCharacterModalOpen = false;
			setMode('roster', null);
		"
	/>

	<CommandPalette
		v-if="hasOpenedPalette || isPaletteOpen"
		:open="isPaletteOpen"
		:character="character"
		:characters="characters"
		:mode="mode"
		:submode="submode"
		:activePoolSide="activeRollerSide"
		:playerPoolCount="dicePool.items.length"
		:oppositionPoolCount="Math.max(0, totalStagedDiceCount - dicePool.items.length)"
		:isDarkMode="isDarkMode"
		@close="isPaletteOpen = false"
		@addDie="addDieToRoller"
		@rollPool="triggerRollFromPill"
		@clearPools="triggerClearFromPill"
		@togglePoolSide="cycleActiveNamedPool"
		@selectElement="selectElement"
		@navigate="setMode"
		@loadCharacter="loadCharacter"
		@exportCharacter="exportCharacter"
		@toggleTheme="toggleDarkMode"
	/>

	<!-- PLAY-SAVE CONFIRMATION MODAL -->
	<ModalDialog
		:open="showPlaySaveConfirm"
		label="Save session state"
		dialog-class="modal-confirm"
		@close="cancelPlaySave"
	>
		<button type="button" class="modal-close" aria-label="Close" @click.prevent="cancelPlaySave">
			<i class="fas fa-times"></i>
		</button>
		<div class="modal-inner">
			<p>
				Save session state to character <strong>{{ character?.name || 'this character' }}</strong
				>?
			</p>
			<p class="modal-warning-text">
				<i class="fas fa-exclamation-triangle"></i> This will overwrite the baseline character with current session
				changes.
			</p>
			<div class="modal-button-container">
				<div class="modal-button-container-inner">
					<button type="button" class="modal-button modal-button-primary" @click.stop="confirmPlaySave">
						<span><i class="fas fa-save"></i> Save session into character</span>
					</button>
					<button type="button" class="modal-button modal-button-danger" @click.stop="discardPlaySession">
						<span><i class="fas fa-undo"></i> Discard session changes</span>
					</button>
					<button type="button" class="modal-button modal-button-no" @click.stop="cancelPlaySave">
						<span><i class="fas fa-times"></i> Cancel</span>
					</button>
				</div>
			</div>
		</div>
	</ModalDialog>

	<!-- TOAST NOTIFICATION -->
	<div class="sr-only" role="status" aria-live="polite">
		{{
			toastMessage && toastTone !== 'error'
				? toastActionLabel
					? `${toastMessage} — Actions available`
					: toastMessage
				: ''
		}}
	</div>
	<div class="sr-only" role="alert" aria-live="assertive">
		{{
			toastMessage && toastTone === 'error'
				? toastActionLabel
					? `${toastMessage} — Actions available`
					: toastMessage
				: ''
		}}
	</div>
	<transition name="toast">
		<div
			v-if="toastMessage"
			class="toast-notification"
			:class="['toast-' + toastTone, { 'has-action': Boolean(toastActionLabel) }]"
			:aria-hidden="toastActionLabel ? undefined : 'true'"
			@mouseenter="pauseToast"
			@mouseleave="resumeToast()"
			@focusin="pauseToast"
			@focusout="resumeToast($event)"
		>
			<i
				class="fas"
				:class="
					toastTone === 'error'
						? 'fa-exclamation-circle'
						: toastTone === 'warn'
							? 'fa-exclamation-triangle'
							: 'fa-check-circle'
				"
				aria-hidden="true"
			></i>
			<span>{{ toastMessage }}</span>
			<button v-if="toastActionLabel" type="button" class="toast-action-btn" @click.stop="triggerToastAction">
				{{ toastActionLabel }}
			</button>
		</div>
	</transition>

	<app-footer
		:mode="mode"
		:year="year"
		:showPlotPoints="!isMobileViewport && showPlayPlotPoints"
		:plotPoints="activePlayPlotPoints"
		:plotPointsLabel="activePlayPlotPointsLabel"
		@navigate="setMode"
		@adjustPlotPoints="handleSettlePP"
	/>
</template>
