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
import { characterCurioFunctions } from './functions.ts';
import { characterCurioStorage } from './storage.ts';
import { cloneDeep } from './clone-deep.ts';
import { dicePool as dicePoolModel, type NamedPool } from './dice-pool.ts';
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
import { useHistory } from './use-history.ts';
import { usePersistence } from './use-persistence.ts';
import { DREAMER_ARCHITECT_SHOWCASE } from './showcase-templates.ts';

const Roster = defineAsyncComponent(() => import('./roster.vue'));
const AddCharacterModal = defineAsyncComponent(() => import('./add-character-modal.vue'));
const CommandPalette = defineAsyncComponent(() => import('./command-palette.vue'));
import {
	getView,
	getTemplateTitle,
	hasPlotPoints,
	resolveCurrencyLabel,
	resolvePlotPoints,
	getCuriosityGame,
	getCuriosityThumbnailUrl,
} from './model.ts';

declare const characterCurioLibraryTemplates: any;

// ---- state ----
const localData = ref<any>({});
const characters = ref<any[]>([]);
const characterID = ref<string | null>(null);
const openCharacterIDs = ref<string[]>([]);
const previewCharacter = ref<any>(null);
const previewTemplateEntry = ref<any>(null);
const isPreview = computed(() => Boolean(previewCharacter.value));
const previewDismissed = ref<boolean>(false);
const sheetTemplates = ref<any[]>([]);
const customSetPresets = ref<any[]>(characterCurioFunctions.getCustomSetPresets());
const prefs = ref<any>({ version: 1, global: {}, characters: {} });
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
const editing = ref<any>(null);
const viewY = ref<number | null>(null);
const fallbackDicePool = ref(new dicePoolModel.DicePool());
const oppositionPool = ref(new dicePoolModel.DicePool());
const activeRollerSide = ref<'player' | 'opposition'>('player');
const namedPools = ref<NamedPool[]>([]);
const activePoolId = ref<string>('');
const explicitlyAddedPoolIds = new Set<string>();
const manuallyRemovedPoolKeys = new Set<string>();
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
const storeError = ref<any>(null);
const mouseDownInsideEditor = ref(false);

const history = ref<string[]>([]);
const historyIndex = ref(-1);
const isNavigatingHistory = ref(false);
const isHandlingHash = ref(false);

const { toastMessage, toastActionLabel, toastTone, showToast, triggerToastAction, pauseToast, resumeToast } =
	useToast();
provide('showToast', showToast);

const main = ref<HTMLElement | null>(null);

let _libraryLoading: any = null;

// ---- dark mode state ----
const colorSchemePref = ref<'light' | 'dark' | 'system'>(
	(typeof localStorage !== 'undefined' && (localStorage.getItem('characterCurioColorScheme') as any)) || 'system',
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

const characterRef = ref<any>(null);
const splitCharacterRefs = new Map<string, any>();

function setSplitCharacterRef(id: string, el: any) {
	if (el) {
		splitCharacterRefs.set(id, el);
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
const characterIndex = computed(() =>
	characters.value.findIndex((character: any) => character.id === characterID.value),
);
const character = computed(() => {
	if (previewCharacter.value) return activeFound.value?.node ?? previewCharacter.value;
	return activeFound.value?.node ?? characters.value[characterIndex.value];
});
const activeHostRoot = computed(() => activeFound.value?.hostRoot ?? null);
const canPlay = computed(() => Boolean(character.value || openCharacterIDs.value.length));

function resolveOwnerCuriosity(ownerId: string | null | undefined): any | null {
	if (!ownerId) return null;
	const targetId = String(ownerId);
	if (previewCharacter.value) {
		if (String(previewCharacter.value.id) === targetId) return previewCharacter.value;
		if (previewCharacter.value.curiosities?.[targetId]) return previewCharacter.value.curiosities[targetId];
	}
	for (const c of characters.value) {
		if (!c) continue;
		if (String(c.id) === targetId) return c;
		if (c.curiosities && typeof c.curiosities === 'object' && c.curiosities[targetId]) {
			return c.curiosities[targetId];
		}
	}
	return null;
}

const activeNamedPool = computed<NamedPool | null>(
	() => namedPools.value.find((p) => p.id === activePoolId.value) || namedPools.value[0] || null,
);

const dicePool = computed(() => activeNamedPool.value?.pool || fallbackDicePool.value);

const totalStagedDiceCount = computed(() =>
	namedPools.value.reduce((sum, entry) => sum + (entry.pool?.items?.length || 0), 0),
);

const nonEmptyNamedPools = computed(() => namedPools.value.filter((entry) => (entry.pool?.items?.length || 0) > 0));

const activePlayPlotPoints = computed(() => {
	if (submode.value === 'play' && activeNamedPool.value) {
		const owner = resolveOwnerCuriosity(activeNamedPool.value.ownerId);
		if (owner) return resolvePlotPoints(owner);
		if (typeof activeNamedPool.value.plotPoints === 'number') {
			return Math.max(0, Math.floor(activeNamedPool.value.plotPoints));
		}
		return 0;
	}
	return character.value ? resolvePlotPoints(character.value) : 0;
});

function resolveEntityPpBaseLabel(entity: any): string {
	return resolveCurrencyLabel(entity);
}

const activePlayPlotPointsLabel = computed(() => {
	if (submode.value === 'play' && activeNamedPool.value) {
		const owner = resolveOwnerCuriosity(activeNamedPool.value.ownerId);
		const base = resolveEntityPpBaseLabel(owner);
		const isSingleMatchingOwner =
			owner &&
			character.value &&
			String(owner.id) === String(character.value.id) &&
			namedPools.value.filter((p) => p.id !== 'opposition').length <= 1;
		if (isSingleMatchingOwner) return base;
		const resolvedOwnerName = owner
			? String(owner.name || 'Unnamed').trim() || 'Unnamed'
			: activeNamedPool.value.ownerName;
		return `${resolvedOwnerName} ${base}`;
	}
	return resolveEntityPpBaseLabel(character.value);
});

const showPlayPlotPoints = computed(() => {
	if (mode.value !== 'character' || (submode.value !== 'play' && submode.value !== 'edit')) {
		return false;
	}
	if (submode.value === 'play') {
		if (!activeNamedPool.value) return Boolean(character.value && hasPlotPoints(character.value));
		const owner = resolveOwnerCuriosity(activeNamedPool.value.ownerId);
		if (owner) return hasPlotPoints(owner);
		return typeof activeNamedPool.value.plotPoints === 'number' && Number.isFinite(activeNamedPool.value.plotPoints);
	}
	return Boolean(character.value && hasPlotPoints(character.value));
});

function restoreCharacterForHistory(restored: any) {
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

const openCharacters = computed(() => {
	if (previewCharacter.value) return [character.value || previewCharacter.value];
	const list: any[] = [];
	for (const id of openCharacterIDs.value) {
		const found = findCuriosityEverywhere(id, characters.value, null, false);
		if (found?.node) list.push(found.node);
	}
	if (character.value && !list.some((c: any) => String(c.id) === String(character.value.id))) {
		const host = activeHostRoot.value;
		const hostIdx = host ? list.findIndex((c: any) => String(c.id) === String(host.id)) : -1;
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

function resolveCuriosity(refOrName: string | null | undefined): any | null {
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
		(c: any) =>
			c && !c.isTemplate && String(c.id) !== rootId && !(bundleRoot.curiosities && bundleRoot.curiosities[c.id]),
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

const rollerCuriosities = computed(() => {
	const seen = new Set<string>();
	const list: any[] = [];
	const add = (c: any) => {
		if (!c || typeof c !== 'object' || c.isTemplate) return;
		const id = String(c.id || '');
		if (id && seen.has(id)) return;
		if (id) seen.add(id);
		list.push(c);
		if (c.curiosities && typeof c.curiosities === 'object') {
			for (const sub of Object.values(c.curiosities)) add(sub);
		}
	};
	for (const oc of openCharacters.value) add(oc);
	for (const c of characters.value) add(c);
	return list;
});

function syncSessionPools(preferCharacterId?: string | null) {
	const targets = openCharacters.value;
	const targetIds = new Set(targets.map((c: any) => String(c?.id || '')).filter(Boolean));
	const next: NamedPool[] = [];

	// Keep existing pools unless they are empty session pools for closed sheets
	for (const entry of namedPools.value) {
		if (entry.ownerId) {
			const owner = resolveOwnerCuriosity(entry.ownerId);
			if (owner) {
				entry.ownerName = String(owner.name || 'Unnamed').trim() || 'Unnamed';
			}
			const isEmpty = (entry.pool?.items?.length || 0) === 0 && (entry.pool?.wordBank?.length || 0) === 0;
			if (!owner || (!targetIds.has(String(entry.ownerId)) && isEmpty && !explicitlyAddedPoolIds.has(entry.id))) {
				continue;
			}
		}
		next.push(entry);
	}

	// Ensure every open sheet in the session has a NamedPool (inserted before Opposition)
	for (const c of targets) {
		if (!c || !c.id) continue;
		const cid = String(c.id);
		if (manuallyRemovedPoolKeys.has('owner:' + cid)) continue;
		if (!next.some((p) => p.ownerId && String(p.ownerId) === cid)) {
			const created = dicePoolModel.createNamedPool(String(c.name || 'Unnamed').trim() || 'Unnamed', cid);
			const oppIdx = next.findIndex((p) => p.id === 'opposition');
			if (oppIdx !== -1) {
				next.splice(oppIdx, 0, created);
			} else {
				next.push(created);
			}
		}
	}

	// Ensure default Opposition pool exists unless manually removed
	if (!manuallyRemovedPoolKeys.has('opposition') && !next.some((p) => p.id === 'opposition')) {
		next.push({
			id: 'opposition',
			ownerId: null,
			ownerName: 'Opposition',
			pool: oppositionPool.value,
		});
	}

	// Fallback if everything was removed
	if (next.length === 0) {
		next.push({
			id: 'opposition',
			ownerId: null,
			ownerName: 'Opposition',
			pool: oppositionPool.value,
		});
	}

	namedPools.value = next;

	if (preferCharacterId) {
		const preferred = next.find((p) => p.ownerId && String(p.ownerId) === String(preferCharacterId));
		if (preferred) {
			activePoolId.value = preferred.id;
			activeRollerSide.value = 'player';
			return;
		}
	}

	if (!activePoolId.value || !next.some((p) => p.id === activePoolId.value)) {
		const forCurrent =
			character.value && next.find((p) => p.ownerId && String(p.ownerId) === String(character.value.id));
		const chosen = forCurrent || next[0];
		activePoolId.value = chosen?.id || '';
		activeRollerSide.value = chosen?.id === 'opposition' ? 'opposition' : 'player';
	}
}

watch(
	[openCharacters, character, () => character.value?.name],
	() => {
		syncSessionPools();
	},
	{ immediate: true },
);

const availableToOpen = computed(() => {
	const q = (sessionCharacterSearch.value || '').toLowerCase().trim();
	return characters.value.filter((c: any) => {
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

// Template version switch prompt (D16): the bundle moved on but
// this character still resolves against its pinned snapshot.
const pendingTemplateUpdate = computed(() => {
	if (mode.value !== 'character' || !character.value) return null;
	const t = character.value.sheet && character.value.sheet.template;
	const id = t && typeof t === 'object' ? t.id : null;
	if (!id) return null;
	const pinned = (typeof t === 'object' && t.version) || 1;
	if (typeof characterCurioLibraryTemplates === 'undefined') return null;
	const builtin = characterCurioFunctions.findLibraryTemplate(id);
	if (!builtin) return null;
	const current = builtin.version || 1;
	if (current <= pinned) return null;
	const declined =
		prefs.value && prefs.value.characters && prefs.value.characters[character.value.id]
			? prefs.value.characters[character.value.id].declinedTemplateVersions
			: null;
	if (declined && declined[id] && declined[id] >= current) return null;
	return { id: id, pinned: pinned, current: current };
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
function openPreview(showcase: any = DREAMER_ARCHITECT_SHOWCASE) {
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
		characterID.value = previewCharacter.value.id;
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

function selectActivePoolId(poolId: string) {
	if (!poolId) return;
	activePoolId.value = poolId;
	activeRollerSide.value = poolId === 'opposition' ? 'opposition' : 'player';
}

function handleActivePoolSideChange(side: 'player' | 'opposition') {
	activeRollerSide.value = side;
	if (side === 'opposition') {
		const opp = namedPools.value.find((p) => p.id === 'opposition') || namedPools.value[1];
		if (opp) activePoolId.value = opp.id;
	} else if (activePoolId.value === 'opposition') {
		const primary = namedPools.value.find((p) => p.id !== 'opposition') || namedPools.value[0];
		if (primary) activePoolId.value = primary.id;
	}
}

function cycleActiveNamedPool() {
	if (namedPools.value.length <= 1) return;
	const idx = Math.max(
		0,
		namedPools.value.findIndex((p) => p.id === activePoolId.value),
	);
	const next = namedPools.value[(idx + 1) % namedPools.value.length];
	if (next) selectActivePoolId(next.id);
}

function handleAddNamedPool(payload: { ownerId: string | null; ownerName: string; withPP?: boolean }) {
	if (payload.ownerId) {
		const cid = String(payload.ownerId);
		manuallyRemovedPoolKeys.delete('owner:' + cid);
		const existing = namedPools.value.find((p) => p.ownerId && String(p.ownerId) === cid);
		if (existing) {
			selectActivePoolId(existing.id);
			return;
		}
		const owner = resolveOwnerCuriosity(cid);
		const created = dicePoolModel.createNamedPool(
			String(owner?.name || payload.ownerName || 'Unnamed').trim() || 'Unnamed',
			cid,
		);
		explicitlyAddedPoolIds.add(created.id);
		const oppIdx = namedPools.value.findIndex((p) => p.id === 'opposition');
		if (oppIdx !== -1) {
			namedPools.value.splice(oppIdx, 0, created);
		} else {
			namedPools.value.push(created);
		}
		selectActivePoolId(created.id);
		return;
	}

	const cleanName = String(payload.ownerName || '').trim();
	if (!cleanName) return;
	if (cleanName.toLowerCase() === 'opposition' && !namedPools.value.some((p) => p.id === 'opposition')) {
		manuallyRemovedPoolKeys.delete('opposition');
		const oppEntry: NamedPool = {
			id: 'opposition',
			ownerId: null,
			ownerName: 'Opposition',
			pool: oppositionPool.value,
			...(payload.withPP ? { plotPoints: 1 } : {}),
		};
		namedPools.value.push(oppEntry);
		selectActivePoolId(oppEntry.id);
		return;
	}
	const created = dicePoolModel.createNamedPool(cleanName, null, payload.withPP ? 1 : undefined);
	explicitlyAddedPoolIds.add(created.id);
	namedPools.value.push(created);
	selectActivePoolId(created.id);
}

function handleRemoveNamedPool(poolId: string) {
	if (namedPools.value.length <= 1) return;
	const idx = namedPools.value.findIndex((p) => p.id === poolId);
	if (idx === -1) return;
	const removed = namedPools.value[idx];
	explicitlyAddedPoolIds.delete(removed.id);
	if (removed.id === 'opposition') {
		manuallyRemovedPoolKeys.add('opposition');
	} else if (removed.ownerId) {
		manuallyRemovedPoolKeys.add('owner:' + String(removed.ownerId));
	}
	removed.pool?.clear?.();
	namedPools.value.splice(idx, 1);
	if (activePoolId.value === poolId) {
		const fallback = namedPools.value[Math.max(0, idx - 1)] || namedPools.value[0];
		if (fallback) selectActivePoolId(fallback.id);
	}
}

function persistOwnerMutation(owner: any) {
	if (!owner) return;
	if (character.value && String(character.value.id) === String(owner.id)) {
		updateCharacter(owner);
		return;
	}
	const topIdx = characters.value.findIndex((c: any) => c && String(c.id) === String(owner.id));
	if (topIdx !== -1) {
		owner.dateModified = new Date().toISOString();
		characters.value[topIdx] = characterCurioFunctions.orderCharacterKeys(owner);
		persist();
		return;
	}
	// Nested curiosity inside a parent root
	for (let i = 0; i < characters.value.length; i++) {
		const parent = characters.value[i];
		if (parent?.curiosities && parent.curiosities[owner.id]) {
			parent.dateModified = new Date().toISOString();
			persist();
			return;
		}
	}
	persist();
}

function handleTogglePoolPP(poolId: string) {
	const entry = namedPools.value.find((p) => p.id === poolId);
	if (!entry) return;
	const owner = resolveOwnerCuriosity(entry.ownerId);
	if (owner) {
		characterCurioFunctions.setPlotPoints(owner, hasPlotPoints(owner) ? null : 1);
		persistOwnerMutation(owner);
	} else {
		entry.plotPoints = typeof entry.plotPoints === 'number' ? null : 1;
	}
}

function addDieToRoller(dieData: any) {
	if (namedPools.value.length === 0) {
		syncSessionPools();
	}
	const targetEntry = activeNamedPool.value;
	const targetPool = targetEntry ? targetEntry.pool : dicePool.value;
	targetPool.add(dieData);
	if (submode.value === 'play' && !isNarrowViewport()) {
		isStudioPanelOpen.value = true;
		studioPanelTab.value = 'roller';
	}
	let label;
	if (Array.isArray(dieData)) {
		const poolName = dieData[0]?.source || 'Pool';
		label = `${dieData.length} dice (${poolName})`;
	} else {
		label = dieData.source ? dieData.source : `d${dieData.size}`;
	}
	const ownerTag = targetEntry ? `${targetEntry.ownerName} pool` : 'dice pool';
	showToast(`Added ${label} to ${ownerTag}`);
}

const studioPanelRef = ref<any>(null);
const showPlaySaveConfirm = ref(false);
let pendingNavigation: (() => void) | null = null;
const baselineCharacters = new Map<string, string>();

function initBaseline(chars: any[]) {
	baselineCharacters.clear();
	(chars || []).forEach((c: any) => {
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

function removeDieFromRoller(index: number) {
	const target = activeNamedPool.value?.pool || dicePool.value;
	target.removeAt(index);
}

function clearDicePool() {
	for (const entry of namedPools.value) {
		entry.pool.clear();
	}
	fallbackDicePool.value.clear();
}

function clearOppositionPool() {
	oppositionPool.value.clear();
}

function handleSettlePP(delta: number, poolId?: string) {
	if (delta === 0) return;
	if (submode.value === 'play' || poolId) {
		const target = (poolId ? namedPools.value.find((p) => p.id === poolId) : activeNamedPool.value) || null;
		if (target) {
			const owner = resolveOwnerCuriosity(target.ownerId);
			if (owner) {
				const currentPP = characterCurioFunctions.resolvePlotPoints(owner);
				characterCurioFunctions.setPlotPoints(owner, Math.max(0, currentPP + delta));
				persistOwnerMutation(owner);
				return;
			}
			if (typeof target.plotPoints === 'number') {
				target.plotPoints = Math.max(0, target.plotPoints + delta);
				return;
			}
		}
	}
	if (character.value) {
		const currentPP = characterCurioFunctions.resolvePlotPoints(character.value);
		characterCurioFunctions.setPlotPoints(character.value, Math.max(0, currentPP + delta));
		updateCharacter(character.value);
	}
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

function safeImageUrl(url: any) {
	return characterCurioFunctions.safeImageUrl(url);
}

// ---------- Sheet template layer ----------
// Templates resolve store-first, then the built-in library
// library. Static ids dedupe: re-imports replace, never append.
function ensureLibraryTemplates(): Promise<boolean> {
	if (typeof characterCurioLibraryTemplates !== 'undefined') return Promise.resolve(true);
	if (_libraryLoading) return _libraryLoading;
	_libraryLoading = new Promise<boolean>((resolve) => {
		const script = document.createElement('script');
		// `?v=` is rewritten to the content hash of js/templates.bundle.js by
		// scripts/version-assets.js during `npm run build`.
		script.src = 'js/templates.bundle.js?v=33';
		script.onload = () => resolve(true);
		script.onerror = () => resolve(false);
		document.head.appendChild(script);
	});
	return _libraryLoading;
}

function resolveTemplateEntry(id: string | null, version?: number | null) {
	if (!id) return null;
	const store = sheetTemplates.value || [];
	if (version) {
		const snap = store.find((t: any) => t.id === id && (t.version || 1) === version);
		if (snap) return snap;
		const builtin = characterCurioFunctions.findLibraryTemplate(id);
		if (builtin && (builtin.version || 1) === version) return builtin;
		if (builtin) return builtin; // degraded: snapshot lost, use current
		const any = store.filter((t: any) => t.id === id).sort((a: any, b: any) => (b.version || 1) - (a.version || 1));
		return any[0] || null;
	}
	const any = store.filter((t: any) => t.id === id).sort((a: any, b: any) => (b.version || 1) - (a.version || 1));
	if (any.length) return any[0];
	const builtin = characterCurioFunctions.findLibraryTemplate(id);
	if (builtin) return builtin;
	return null;
}

// Preference layer (brief D11): arrangement lives here, applied
// after every merge so user arrangement always wins.
function charPrefs(charId: string) {
	if (!prefs.value) prefs.value = { version: 1, global: {}, characters: {} };
	if (!prefs.value.characters[charId]) prefs.value.characters[charId] = {};
	return prefs.value.characters[charId];
}

function applyPrefs(characterData: any) {
	if (!characterData || !characterData.id) return characterData;
	const cp = prefs.value && prefs.value.characters ? prefs.value.characters[characterData.id] : null;
	if (!cp) return characterData;
	if (Array.isArray(cp.setOrder) && cp.setOrder.length && Array.isArray(characterData.traitSets)) {
		const byId = new Map();
		characterData.traitSets.forEach((ts: any) => {
			if (ts && ts.id && !byId.has(ts.id)) byId.set(ts.id, ts);
		});
		const ordered: any[] = [];
		cp.setOrder.forEach((id: any) => {
			if (byId.has(id)) {
				ordered.push(byId.get(id));
				byId.delete(id);
			}
		});
		byId.forEach((ts: any) => ordered.push(ts));
		characterData.traitSets.forEach((ts: any) => {
			if (!ordered.includes(ts)) ordered.push(ts);
		});
		characterData.traitSets = ordered;
	}
	if (cp.traitOrders && Array.isArray(characterData.traitSets)) {
		characterData.traitSets.forEach((ts: any) => {
			const order = ts && ts.id ? cp.traitOrders[ts.id] : null;
			if (!Array.isArray(order) || !order.length || !Array.isArray(ts.traits)) return;
			const byLid = new Map();
			ts.traits.forEach((tr: any) => {
				if (tr && tr._lid && !byLid.has(tr._lid)) byLid.set(tr._lid, tr);
			});
			const ordered: any[] = [];
			order.forEach((lid: any) => {
				if (byLid.has(lid)) {
					ordered.push(byLid.get(lid));
					byLid.delete(lid);
				}
			});
			byLid.forEach((tr: any) => ordered.push(tr));
			ts.traits.forEach((tr: any) => {
				if (!ordered.includes(tr)) ordered.push(tr);
			});
			ts.traits = ordered;
		});
	}
	return characterData;
}

function recordCharOrder(characterData: any) {
	if (!characterData || !characterData.id) return;
	const cp = charPrefs(characterData.id);
	if (!Array.isArray(characterData.traitSets)) return;
	cp.setOrder = characterData.traitSets.map((ts: any) => ts && ts.id).filter(Boolean);
	cp.traitOrders = cp.traitOrders || {};
	characterData.traitSets.forEach((ts: any) => {
		if (ts && ts.id && Array.isArray(ts.traits)) {
			cp.traitOrders[ts.id] = ts.traits.map((tr: any) => tr && tr._lid).filter(Boolean);
		}
	});
}

// Normalize one stored character: stable set ids, sheet.template
// forms (full embed -> upsert + collapse to a pinned { id, version }),
// snapshot-on-first-see for unversioned refs (D16), then merge +
// internal ids + preferences.
function resolveStoredCharacter(c: any) {
	if (!c || typeof c !== 'object') return c;
	characterCurioFunctions.ensureTraitSetIds(c);
	let ref: any = null;
	const t = c.sheet && c.sheet.template;
	if (t && typeof t === 'object') {
		if (t.character && t.id) {
			sheetTemplates.value = characterCurioStorage.upsertTemplate(sheetTemplates.value, t);
			ref = { id: t.id, version: t.version || 1 };
			c.sheet = { template: { id: t.id, version: t.version || 1 } };
		} else if (t.id) {
			ref = { id: t.id, version: t.version || null };
			c.sheet = { template: t.version ? { id: t.id, version: t.version } : { id: t.id } };
		}
	}
	if (ref) {
		let entry = resolveTemplateEntry(ref.id, ref.version);
		if (entry) {
			const ver = ref.version || entry.version || 1;
			// Snapshot the exact pinned base into the store (D16):
			// a later bundle update must never move existing
			// characters until the user accepts the switch.
			const inStore = (sheetTemplates.value || []).some((s: any) => s.id === entry.id && (s.version || 1) === ver);
			if (!inStore && characterCurioFunctions.findLibraryTemplate(entry.id) === entry) {
				sheetTemplates.value = characterCurioStorage.upsertTemplate(sheetTemplates.value, entry);
			}
			ref = { id: ref.id, version: ver };
			c.sheet = { template: { id: ref.id, version: ver } };
			entry = resolveTemplateEntry(ref.id, ref.version) || entry;
		}
		if (entry) {
			const templateChar = characterCurioFunctions.findTemplateCharacter(entry);
			if (templateChar && c.sets) {
				// Layered storage form: fold content onto the template.
				c = characterCurioFunctions.materializeCharacter(c, templateChar);
				c.sheet = ref.version ? { template: { id: ref.id, version: ref.version } } : { template: { id: ref.id } };
			} else {
				c = characterCurioFunctions.mergeTemplateIntoCharacter(c, entry);
			}
		} else if (c.sets) {
			c = characterCurioFunctions.materializeCharacter(c, null);
		}
	} else if (c.sets && !Array.isArray(c.traitSets)) {
		c = characterCurioFunctions.materializeCharacter(c, null);
	}
	if (c.curiosities && typeof c.curiosities === 'object' && !Array.isArray(c.curiosities)) {
		for (const [cid, sub] of Object.entries(c.curiosities) as Array<[string, any]>) {
			if (sub && typeof sub === 'object') {
				if (sub.sets && !Array.isArray(sub.traitSets)) {
					c.curiosities[cid] = characterCurioFunctions.materializeCharacter(sub, null);
				}
				if (!c.curiosities[cid].id) c.curiosities[cid].id = cid;
			}
		}
	}
	characterCurioFunctions.ensureTraitSetIds(c);
	characterCurioFunctions.assignLids(c);
	applyPrefs(c);
	return c;
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
	const char = characters.value.find((c: any) => c.id === id);
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
function createCharacter(isTemplate: boolean | string = false, templateId?: string | null) {
	if (previewCharacter.value) {
		previewCharacter.value = null;
		previewTemplateEntry.value = null;
		previewDismissed.value = true;
	}
	let asTemplate = false;
	let targetTemplateId: string | null = null;
	if (typeof isTemplate === 'boolean') {
		asTemplate = isTemplate;
		targetTemplateId = templateId || null;
	} else if (typeof isTemplate === 'string') {
		targetTemplateId = isTemplate;
		asTemplate = false;
	}

	if (targetTemplateId) {
		const template = characters.value.find((c: any) => c.id === targetTemplateId);
		if (template) {
			const currentRef =
				template.sheet && template.sheet.template && typeof template.sheet.template === 'object'
					? template.sheet.template.id
					: null;
			const reuse =
				currentRef && !characterCurioFunctions.findLibraryTemplate(currentRef) ? currentRef : 'custom-' + template.id;
			const entry = characterCurioFunctions.extractSheetTemplate(template, {
				id: reuse,
				version: 1,
				title:
					getView(template)?.listing?.title || (!getCuriosityGame(template) ? template.name || 'Template' : undefined),
			});
			sheetTemplates.value = characterCurioStorage.upsertTemplate(sheetTemplates.value, {
				...cloneDeep(entry),
				userSaved: true,
			});

			const now = new Date().toISOString();
			const entity = {
				name: asTemplate ? template.name || 'New Template' : '',
				sets: {},
				template: { id: entry.id, version: entry.version || 1 },
				id: characterCurioFunctions.generateUUID(),
				...(asTemplate ? { isTemplate: true } : {}),
				dateCreated: now,
				dateModified: now,
				dateTouched: now,
			};
			let characterData: any = characterCurioFunctions.materializeCharacter(entity, entry.character);
			characterData.sheet = { template: { id: entry.id, version: entry.version || 1 } };
			characterData = characterCurioFunctions.orderCharacterKeys(characterData);
			characterCurioFunctions.ensureTraitSetIds(characterData);
			characterCurioFunctions.assignLids(characterData);
			recordCharOrder(characterData);

			characters.value.push(characterData);
			webTrailIds.value = [characterData.id];
			characterID.value = characterData.id;
			if (!openCharacterIDs.value.includes(characterData.id)) {
				openCharacterIDs.value.push(characterData.id);
			}
			saveOpenCharacterIDs();
			initHistory();
			setMode('character', submode.value ?? 'edit', true);

			saveLocalData();
			showToast(
				asTemplate
					? `Created template from "${template.name || 'Template'}"`
					: `Created sheet from "${template.name || 'Template'}"`,
			);
			return;
		}
	}

	let characterData: any = structuredClone(characterCurioFunctions.defaultCharacter);

	characterData.id = characterCurioFunctions.generateUUID();
	if (asTemplate) {
		characterData.isTemplate = true;
		characterData.name = 'New Template';
	} else {
		delete characterData.isTemplate;
	}

	const now = new Date().toISOString();
	characterData.dateCreated = now;
	characterData.dateModified = now;
	characterData.dateTouched = now;
	characterData = characterCurioFunctions.orderCharacterKeys(characterData);
	characterCurioFunctions.ensureTraitSetIds(characterData);
	characterCurioFunctions.assignLids(characterData);

	characters.value.push(characterData);
	webTrailIds.value = [characterData.id];
	characterID.value = characterData.id;
	if (!openCharacterIDs.value.includes(characterData.id)) {
		openCharacterIDs.value.push(characterData.id);
	}
	saveOpenCharacterIDs();
	if (totalStagedDiceCount.value === 0) {
		syncSessionPools(characterData.id);
	}
	initHistory();
	setMode('character', templateId ? (submode.value ?? 'edit') : 'edit', true);

	saveLocalData();
}

function createTemplate() {
	createCharacter(true);
}

function createFromTemplate(templateId: string) {
	createCharacter(false, templateId);
}

function createFromLibrary(libraryItem: any, asTemplate = false, openPrint = false) {
	if (!libraryItem || !libraryItem.character) return;

	const itemTitle = getTemplateTitle(libraryItem);
	// New character = an empty layered entity folded onto the
	// template at the seam; nothing is cloned from the array form.
	const now = new Date().toISOString();
	const entity = {
		name: asTemplate ? (itemTitle ? itemTitle.replace(/\s*\([^)]*\)/g, '').trim() : 'Template') : '',
		sets: {},
		template: { id: libraryItem.id, version: libraryItem.version || 1 },
		id: characterCurioFunctions.generateUUID(),
		...(asTemplate ? { isTemplate: true } : {}),
		dateCreated: now,
		dateModified: now,
		dateTouched: now,
	};
	const characterData: any = characterCurioFunctions.materializeCharacter(entity, libraryItem.character);
	characterCurioFunctions.ensureTraitSetIds(characterData);
	characterCurioFunctions.assignLids(characterData);
	// D16: snapshot the exact pinned base now — a later bundle
	// update must never move this character unasked.
	sheetTemplates.value = characterCurioStorage.upsertTemplate(sheetTemplates.value, cloneDeep(libraryItem));
	recordCharOrder(characterData);

	characters.value.push(characterData);
	webTrailIds.value = [characterData.id];
	characterID.value = characterData.id;
	if (!openCharacterIDs.value.includes(characterData.id)) {
		openCharacterIDs.value.push(characterData.id);
	}
	saveOpenCharacterIDs();
	initHistory();

	if (openPrint) {
		setMode('character', 'print', true);
	} else {
		setMode('character', 'edit', true);
	}

	saveLocalData();
	showToast(asTemplate ? `Added "${itemTitle}" to templates` : `Created character from "${itemTitle}"`);
}

function toggleTemplate(characterId: string) {
	const characterIndex = characters.value.findIndex((c: any) => c.id === characterId);
	if (characterIndex === -1) return;
	const characterData = characters.value[characterIndex];
	if (characterData.isTemplate) {
		delete characterData.isTemplate;
	} else {
		characterData.isTemplate = true;
	}
	characterData.dateModified = new Date().toISOString();
	characters.value[characterIndex] = characterCurioFunctions.orderCharacterKeys(characterData);
	saveLocalData();
	showToast(characterData.isTemplate ? 'Saved as template' : 'Converted to regular character');
}

function deleteCharacter(id: string) {
	openCharacterIDs.value = openCharacterIDs.value.filter((x: string) => x !== id);
	saveOpenCharacterIDs();

	const c = characters.value.findIndex((characterData: any) => characterData.id === id);
	if (c === -1) return;

	characters.value.splice(c, 1);
	if (prefs.value && prefs.value.characters) delete prefs.value.characters[id];

	if (characterID.value === id) {
		if (openCharacterIDs.value.length) {
			characterID.value = openCharacterIDs.value[0];
			initHistory();
		} else {
			characterID.value = null;
			setMode('roster', null, true);
		}
	}

	setPageTitle();
	saveLocalData();
}

function deleteAllCharacters() {
	const count = characters.value.length;
	characters.value = [];
	characterID.value = null;
	openCharacterIDs.value = [];
	if (prefs.value) prefs.value.characters = {};
	saveOpenCharacterIDs();
	setMode('roster', null, true);
	setPageTitle();
	saveLocalData();
	showToast(`Deleted all ${count} characters`);
}

function duplicateCharacter(id: string) {
	const original = characters.value.find((characterData: any) => characterData.id === id);
	if (!original) return;

	const characterData = cloneDeep(original);
	characterData.id = characterCurioFunctions.generateUUID();
	characterData.name = characterData.name && characterData.name.length ? `${characterData.name} (Copy)` : 'Copy';
	characterCurioFunctions.stripInternalIds(characterData);
	characterCurioFunctions.ensureTraitSetIds(characterData);
	characterCurioFunctions.assignLids(characterData);
	recordCharOrder(characterData);
	characterData.dateCreated = new Date().toISOString();
	characterData.dateModified = new Date().toISOString();
	characterData.dateTouched = new Date().toISOString();

	characters.value.push(characterData);
	saveLocalData();
}

function loadCharacter(id: string, targetSubmode?: string | null) {
	if (previewCharacter.value) {
		previewCharacter.value = null;
		previewTemplateEntry.value = null;
		previewDismissed.value = true;
	}
	const wasAllEmpty = totalStagedDiceCount.value === 0;
	manuallyRemovedPoolKeys.delete('owner:' + String(id));
	if (!openCharacterIDs.value.includes(id)) {
		openCharacterIDs.value.push(id);
	}
	webTrailIds.value = [id];
	characterID.value = id;
	touchCharacter(id);
	saveOpenCharacterIDs();
	syncSessionPools(wasAllEmpty ? id : null);
	persist();
	initHistory();
	setMode('character', targetSubmode ?? submode.value ?? 'edit', true);
}

function importSheetTemplate(entry: any) {
	if (!entry || !entry.id) return;
	if (!characterCurioFunctions.isValidCurrentCharacter(entry)) {
		showToast(characterCurioFunctions.INVALID_FILE_MESSAGE, { tone: 'error' });
		return;
	}
	sheetTemplates.value = characterCurioStorage.upsertTemplate(sheetTemplates.value, {
		...cloneDeep(entry),
		userSaved: true,
	});
	saveLocalData();
	showToast(`Saved layout template “${getTemplateTitle(entry) || entry.id}”`);
}

function deleteSheetTemplate(id: string) {
	if (!id) return;
	const removed = (sheetTemplates.value || []).find((t: any) => t?.id === id);
	sheetTemplates.value = (sheetTemplates.value || []).filter((t: any) => t?.id !== id);
	saveLocalData();
	showToast(
		'Removed saved template',
		removed
			? {
					actionLabel: 'Undo',
					onAction: () => {
						sheetTemplates.value = characterCurioStorage.upsertTemplate(sheetTemplates.value, removed);
						saveLocalData();
					},
				}
			: undefined,
	);
}

// D16 switch: rebase pure overrides (strip vs pinned snapshot)
// onto the newer bundle version, then re-merge and re-apply
// preferences. Stay records a decline so it stops nagging.
async function applyTemplateUpdate() {
	const u = pendingTemplateUpdate.value;
	if (!u || !character.value) return;
	await ensureLibraryTemplates();
	const oldEntry = resolveTemplateEntry(u.id, u.pinned);
	const newEntry = characterCurioFunctions.findLibraryTemplate(u.id);
	if (!newEntry) return;
	const stripped = oldEntry
		? characterCurioFunctions.stripCharacterToDeltas(character.value, oldEntry)
		: cloneDeep(character.value);
	const rebased = characterCurioFunctions.mergeTemplateIntoCharacter(stripped, newEntry);
	rebased.sheet = { template: { id: u.id, version: newEntry.version || 1 } };
	characterCurioFunctions.assignLids(rebased);
	characters.value[characterIndex.value] = rebased;
	applyPrefs(rebased);
	recordCharOrder(rebased);
	initHistory();
	saveLocalData();
	showToast('Layout updated — your content and arrangement were kept');
}

function stayOnTemplateSnapshot() {
	const u = pendingTemplateUpdate.value;
	if (!u || !character.value) return;
	const cp = charPrefs(character.value.id);
	cp.declinedTemplateVersions = cp.declinedTemplateVersions || {};
	cp.declinedTemplateVersions[u.id] = u.current;
	saveLocalData();
	showToast('Staying on your saved layout version');
}

function importCharacter(characterData: any) {
	if (!characterCurioFunctions.isValidCurrentCharacter(characterData)) {
		showToast(characterCurioFunctions.INVALID_FILE_MESSAGE, { tone: 'error' });
		return;
	}
	// Embedded template travels with the file: upsert by static
	// (id, version) — replace, never duplicate — then resolve the
	// sparse overlay. No template link: the file renders exactly
	// as-is (D17 sacred).
	let incoming = characterData;
	const tref = incoming && incoming.sheet && incoming.sheet.template;
	if (tref && typeof tref === 'object') {
		let tplEntry = null;
		if (tref.character && tref.id) {
			sheetTemplates.value = characterCurioStorage.upsertTemplate(sheetTemplates.value, tref);
			tplEntry = tref;
		} else if (tref.id) {
			tplEntry = resolveTemplateEntry(tref.id, tref.version || null);
		}
		const templateChar = tplEntry ? characterCurioFunctions.findTemplateCharacter(tplEntry) : null;
		if (templateChar) {
			// Layered seam: the file's content + overrides fold onto
			// the template (lossless — presentation is preserved). Input
			// already in layered form (JSON tab) folds directly.
			const layered =
				incoming &&
				!Array.isArray(incoming.traitSets) &&
				incoming.sets &&
				typeof incoming.sets === 'object' &&
				!Array.isArray(incoming.sets)
					? incoming
					: characterCurioFunctions.toLayeredEntity(incoming);
			incoming = characterCurioFunctions.materializeCharacter(layered, templateChar);
			incoming.sheet = { template: { id: tplEntry.id, version: tplEntry.version || 1 } };
		} else if (tplEntry) {
			incoming = characterCurioFunctions.mergeTemplateIntoCharacter(incoming, tplEntry);
		}
	} else if (
		incoming &&
		!Array.isArray(incoming.traitSets) &&
		incoming.sets &&
		typeof incoming.sets === 'object' &&
		!Array.isArray(incoming.sets)
	) {
		// Layered input with no template link: fold standalone (no
		// presentation base; entity sets render as custom sets).
		incoming = characterCurioFunctions.materializeCharacter(incoming);
	}
	if (typeof incoming.id !== 'string' || !incoming.id.length) {
		incoming.id = characterCurioFunctions.generateUUID();
	}
	if (typeof incoming.name !== 'string') {
		incoming.name = '';
	}
	characterCurioFunctions.ensureTraitSetIds(incoming);
	characterCurioFunctions.assignLids(incoming);

	// Save new character (preserve existing dateCreated when updating in-place via JSON editor).
	const c = characters.value.findIndex((existingCharacter: any) => existingCharacter.id === incoming.id);
	const embeddedHostIdx =
		c === -1
			? characters.value.findIndex(
					(root: any) =>
						root?.curiosities && typeof root.curiosities === 'object' && Boolean(root.curiosities[incoming.id]),
				)
			: -1;
	const now = new Date().toISOString();
	const prev =
		c !== -1
			? characters.value[c]
			: embeddedHostIdx !== -1
				? characters.value[embeddedHostIdx].curiosities[incoming.id]
				: null;
	if (!incoming.dateCreated) {
		incoming.dateCreated = prev?.dateCreated || now;
	}
	if (!incoming.dateModified) {
		incoming.dateModified = now;
	}
	if (!incoming.dateTouched) {
		incoming.dateTouched = now;
	}
	incoming = characterCurioFunctions.orderCharacterKeys(incoming);

	if (c !== -1) {
		characters.value[c] = incoming;
	} else if (embeddedHostIdx !== -1) {
		characters.value[embeddedHostIdx].curiosities[incoming.id] = incoming;
		characters.value[embeddedHostIdx].dateModified = now;
	} else {
		characters.value.push(incoming);
	}

	// Arrangement: file prefs (name-keyed) convert to live form;
	// otherwise the file's own order is recorded fresh.
	if (incoming.prefs && typeof incoming.prefs === 'object') {
		const live = characterCurioFunctions.prefsFromImport(incoming.prefs, incoming);
		if (live) {
			if (!prefs.value) prefs.value = { version: 1, global: {}, characters: {} };
			prefs.value.characters[incoming.id] = live;
		} else if (prefs.value && prefs.value.characters) {
			delete prefs.value.characters[incoming.id];
		}
		delete incoming.prefs;
	} else {
		recordCharOrder(incoming);
	}
	applyPrefs(incoming);
	touchCharacter(incoming.id);
	saveLocalData();
	showToast(`Imported ${incoming.name || 'character'}`);
}

function downloadJson(filename: string, payload: any) {
	const uri = encodeURI('data:application/json;charset=utf-8,' + JSON.stringify(payload, null, 2)).replace(/#/g, '%23');

	const link = document.createElement('a');
	document.body.appendChild(link); // Required for Firefox
	link.setAttribute('href', uri);
	link.setAttribute('download', filename);
	link.click();
	link.remove();
}

function sheetTemplateForExport(characterData: any) {
	if (!characterData) return null;
	const t = characterData.sheet && characterData.sheet.template;
	const ref = t && typeof t === 'object' ? { id: t.id, version: t.version || null } : null;
	if (!ref || !ref.id) return null;
	if (t.character) return t;
	return resolveTemplateEntry(ref.id, ref.version);
}

async function exportCharacter(id: string) {
	const characterData = characters.value.find((c: any) => c.id === id);
	if (!characterData) return;

	await ensureLibraryTemplates();
	const entry = sheetTemplateForExport(characterData);
	let out = characterCurioFunctions.stripCharacterForExport(characterData, entry);
	// Arrangement travels name-keyed (D18 same-user-new-device).
	const filePrefs = characterCurioFunctions.prefsForExport(
		prefs.value && prefs.value.characters ? prefs.value.characters[characterData.id] : null,
		characterData,
	);
	if (filePrefs) out.prefs = filePrefs;
	out = characterCurioFunctions.orderCharacterKeys(out);

	let name = out.name && out.name.length ? out.name : 'Name';
	const timestamp = new Date(out.dateModified || Date.now()).getTime() || Date.now();
	name = name.replaceAll(/\s+/g, '_');
	const filename = `${name}_${timestamp}.curio.json`;

	downloadJson(filename, out);
}

function fallbackTemplateTitle(characterData: any) {
	return (
		getView(characterData)?.listing?.title ||
		(getCuriosityGame(characterData)
			? undefined
			: characterData.name
				? `${characterData.name} Layout`
				: 'Custom Layout')
	);
}

function saveSheetTemplate() {
	const characterData = character.value;
	if (!characterData) return;
	const currentRef =
		characterData.sheet && characterData.sheet.template && typeof characterData.sheet.template === 'object'
			? characterData.sheet.template.id
			: null;
	// Re-saving a custom template updates it in place (version bump);
	// forking off a built-in (or nothing) mints a fresh static id.
	const reuse = currentRef && !characterCurioFunctions.findLibraryTemplate(currentRef) ? currentRef : null;
	const prev = reuse ? resolveTemplateEntry(reuse) : null;
	const entry = characterCurioFunctions.extractSheetTemplate(characterData, {
		id: reuse || undefined,
		version: reuse ? ((prev && prev.version) || 1) + 1 : 1,
		title: fallbackTemplateTitle(characterData),
	});
	sheetTemplates.value = characterCurioStorage.upsertTemplate(sheetTemplates.value, {
		...cloneDeep(entry),
		userSaved: true,
	});
	characterData.sheet = { template: { id: entry.id, version: entry.version } };
	saveLocalData();
	showToast(`Saved layout as reusable template`);
}

function exportSheetTemplate() {
	const characterData = character.value;
	if (!characterData) return;
	const ref =
		characterData.sheet && characterData.sheet.template && typeof characterData.sheet.template === 'object'
			? characterData.sheet.template.id
			: null;
	let entry = ref ? resolveTemplateEntry(ref) : null;
	if (!entry)
		entry = characterCurioFunctions.extractSheetTemplate(characterData, {
			title: fallbackTemplateTitle(characterData),
		});
	const slug = String(getTemplateTitle(entry) || entry.id || 'template').replace(/\s+/g, '_');
	downloadJson(`${slug}.curio-template.json`, entry);
}

function importSetPresets(entries: any[]) {
	const { importedCount } = characterCurioFunctions.upsertCustomSetPresets(entries);
	if (importedCount > 0) {
		showToast(`Imported ${importedCount} ${importedCount === 1 ? 'preset' : 'presets'}`);
	}
}

async function exportAllCharacters() {
	await ensureLibraryTemplates();
	const out = (characters.value || []).map((c: any) => {
		const entry = sheetTemplateForExport(c);
		const o = characterCurioFunctions.stripCharacterForExport(c, entry);
		const filePrefs = characterCurioFunctions.prefsForExport(
			prefs.value && prefs.value.characters ? prefs.value.characters[c.id] : null,
			c,
		);
		if (filePrefs) o.prefs = filePrefs;
		return characterCurioFunctions.orderCharacterKeys(o);
	});
	const exportedPresets = characterCurioStorage.normalizePresets(customSetPresets.value);

	const bundle = {
		version: '0.2',
		type: 'bundle',
		dateExported: new Date().toISOString(),
		count: out.length,
		characters: out,
		presets: cloneDeep(exportedPresets),
	};

	const timestamp = new Date().getTime();
	const filename = `Character_Curio_Bundle_${timestamp}.json`;

	downloadJson(filename, bundle);
	showToast(
		exportedPresets.length > 0
			? `Exported ${out.length} curiosities and ${exportedPresets.length} ${exportedPresets.length === 1 ? 'preset' : 'presets'}`
			: `Exported ${out.length} curiosities`,
	);
}

function updateCharacter(characterData: any) {
	if (previewCharacter.value) {
		if (previewCharacter.value.id === characterData.id) {
			previewCharacter.value = characterData;
		} else if (previewCharacter.value.curiosities?.[characterData.id]) {
			previewCharacter.value.curiosities[characterData.id] = characterData;
		}
		return Promise.resolve();
	}

	const c = characters.value.findIndex((savedCharacter: any) => savedCharacter.id === characterData.id);
	let hostIdx = -1;
	if (c === -1) {
		hostIdx = characters.value.findIndex(
			(root: any) =>
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
		hostRoot.curiosities[characterData.id] = characterCurioFunctions.orderCharacterKeys(characterData);
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
			if (event.target && typeof (event.target as any).blur === 'function') {
				(event.target as any).blur();
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
	const c = characters.value.findIndex((savedCharacter: any) => savedCharacter.id === id);

	if (c === -1) return;

	const characterData = characters.value[c];

	characterData.dateTouched = new Date().toISOString();

	characters.value[c] = characterData;
}

function selectElement(selector: any) {
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
		event &&
		event.target &&
		(event.target as any).closest &&
		(event.target as any).closest(
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
		event &&
		event.target &&
		(event.target as any).closest &&
		(event.target as any).closest(
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
					<button type="button" class="btn-update-primary" @click.stop="usePreviewTemplate">Use this template</button>
					<button type="button" class="btn-update-secondary" @click.stop="closePreview">Close preview</button>
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
						<a href="https://www.cortexrpg.com" target="_blank">CortexRPG.com</a>.
					</p>

					<p>
						Cortex is ©️ {{ year }} Dire Wolf Digital, LLC. Cortex, Cortex Prime, associated logos and trade dress are
						the trademarks of Dire Wolf Digital, LLC. Iconography used with permission.
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
