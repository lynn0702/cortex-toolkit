<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, reactive, ref, toRaw, watch } from 'vue';
import { characterCurioFunctions } from './functions.ts';
import { characterCurioStorage } from './storage.ts';
import { dicePool as dicePoolModel } from './dice-pool.ts';
import Roster from './roster.vue';
import Character from './character.vue';
import DiceRoller from './dice-roller.vue';
import StudioPanel from './studio-panel.vue';
import AppHeader from './app-header.vue';
import AppFooter from './app-footer.vue';
import SessionNav from './session-nav.vue';
import AddCharacterModal from './add-character-modal.vue';
import ModalDialog from './modal-dialog.vue';
import { useToast } from './use-toast.ts';
import { useHistory } from './use-history.ts';
import { DREAMER_ARCHITECT_SHOWCASE } from './showcase-templates.ts';

declare const characterCurioLibraryTemplates: any;

// ---- state ----
const localData = ref<any>({});
const characters = ref<any[]>([]);
const characterID = ref<string | null>(null);
const openCharacterIDs = ref<string[]>([]);
const previewCharacter = ref<any>(null);
const isPreview = computed(() => Boolean(previewCharacter.value));
const previewDismissed = ref<boolean>(false);
const sheetTemplates = ref<any[]>([]);
const prefs = ref<any>({ version: 1, global: {}, characters: {} });
const playViewMode = ref('split');
const isAddCharacterModalOpen = ref(false);
const sessionCharacterSearch = ref('');
const mode = ref('roster');
const submode = ref<string | null>(null);
const editing = ref<any>(null);
const viewY = ref<number | null>(null);
const dicePool = ref(new dicePoolModel.DicePool());
const isRollerOpen = ref(false);
const rollerPosition = ref('right');
const isStudioPanelOpen = ref(true);
const studioPanelTab = ref<'properties' | 'roller' | 'json'>('properties');

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

const { toastMessage, showToast } = useToast();

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
const characterIndex = computed(() =>
	characters.value.findIndex((character: any) => character.id === characterID.value),
);
const character = computed(() => {
	if (previewCharacter.value) return previewCharacter.value;
	return characters.value[characterIndex.value];
});
const canPlay = computed(() => Boolean(character.value || openCharacterIDs.value.length));

const { canUndo, canRedo, initHistory, commitHistorySnapshot, markDirty, validateEditing, undo, redo } = useHistory({
	mode,
	character,
	characters,
	characterIndex,
	editing,
	isNavigatingHistory,
	history,
	historyIndex,
	showToast,
	saveLocalData,
});

const openCharacters = computed(() => {
	if (previewCharacter.value) return [previewCharacter.value];
	const list: any[] = [];
	for (const id of openCharacterIDs.value) {
		const found = characters.value.find((c: any) => c.id === id);
		if (found) list.push(found);
	}
	if (!list.length && character.value) {
		return [character.value];
	}
	return list;
});

const availableToOpen = computed(() => {
	const q = (sessionCharacterSearch.value || '').toLowerCase().trim();
	return characters.value.filter((c: any) => {
		if (c.isTemplate) return false;
		if (openCharacterIDs.value.includes(c.id)) return false;
		if (q.length && !c.name?.toLowerCase().includes(q) && !c.game?.toLowerCase().includes(q)) return false;
		return true;
	});
});

// Template version switch prompt (D16): the bundle moved on but
// this character still resolves against its pinned snapshot.
const pendingTemplateUpdate = computed(() => {
	if (mode.value !== 'character' || !character.value) return null;
	const t = character.value.sheet && character.value.sheet.template;
	const id = t ? (typeof t === 'string' ? t : t.id) : null;
	if (!id) return null;
	const pinned = (t && typeof t === 'object' && t.version) || 1;
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

onMounted(async () => {
	setViewY();
	await bootFromStorage();
	parseRouteHash();
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
		if (mql.addEventListener) {
			mql.addEventListener('change', handler);
		} else if ((mql as any).addListener) {
			(mql as any).addListener(handler);
		}
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
			characterID.value = null;
			setMode('roster', null, false);
			return;
		}
		previewCharacter.value = structuredClone(toRaw(showcase.character));
		characterID.value = previewCharacter.value.id;
		setMode('character', 'play', false);
	} catch (err) {
		console.warn('Failed to load Dreamer & Architect template preview:', err);
		previewCharacter.value = null;
		characterID.value = null;
		setMode('roster', null, false);
	}
}

function closePreview() {
	previewCharacter.value = null;
	characterID.value = null;
	previewDismissed.value = true;
	setMode('roster', null, true);
}

function usePreviewTemplate() {
	previewCharacter.value = null;
	previewDismissed.value = true;
	createFromLibrary(DREAMER_ARCHITECT_SHOWCASE, false, false);
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
		commitHistorySnapshot();
		editing.value = [];
	}
	mode.value = m;
	submode.value = sub;
	if (m === 'character' && sub === 'play') {
		// Narrow viewports (overlay drawer): land on the sheet, panel
		// closed — it would otherwise cover the sheet on arrival. The
		// Roller handle opens it explicitly.
		const narrow = isNarrowViewport();
		isStudioPanelOpen.value = !narrow;
		studioPanelTab.value = 'roller';
		isRollerOpen.value = !narrow;
	} else if (m === 'character' && sub === 'edit') {
		// Same overlay rule as Play: land on the sheet with the drawer
		// closed. Tapping any trait opens it explicitly.
		const narrowEdit = isNarrowViewport();
		isStudioPanelOpen.value = !narrowEdit;
		studioPanelTab.value = 'properties';
		isRollerOpen.value = !narrowEdit;
	} else {
		isRollerOpen.value = false;
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
		const found = characters.value.find((c: any) => c.id === id);
		if (found) {
			characterID.value = id;
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

function toggleRoller() {
	isStudioPanelOpen.value = !isStudioPanelOpen.value;
	isRollerOpen.value = isStudioPanelOpen.value;
	if (isStudioPanelOpen.value) {
		studioPanelTab.value = submode.value === 'play' ? 'roller' : 'properties';
	}
}

function setPanelOpen(open: boolean) {
	isStudioPanelOpen.value = open;
	isRollerOpen.value = open;
}

function handleToggleStudio(tab: 'properties' | 'roller' | 'json') {
	if (tab === 'roller' && submode.value !== 'play') tab = 'properties';
	if (isStudioPanelOpen.value && studioPanelTab.value === tab) {
		isStudioPanelOpen.value = false;
		isRollerOpen.value = false;
	} else {
		isStudioPanelOpen.value = true;
		isRollerOpen.value = true;
		studioPanelTab.value = tab;
	}
}

function togglePanelPosition() {
	panelPosition.value = panelPosition.value === 'right' ? 'left' : 'right';
	rollerPosition.value = panelPosition.value;
	persist();
}

function toggleRollerPosition() {
	togglePanelPosition();
}

// Below the wide push-aside layout the panel is an overlay drawer.
function isNarrowViewport() {
	return Boolean(window.matchMedia && window.matchMedia('(max-width: 1399px)').matches);
}

function addDieToRoller(dieData: any) {
	dicePool.value.add(dieData);
	if (submode.value === 'play' && !isNarrowViewport()) {
		isStudioPanelOpen.value = true;
		studioPanelTab.value = 'roller';
		isRollerOpen.value = true;
	}
	let label;
	if (Array.isArray(dieData)) {
		const poolName = dieData[0]?.source || 'Pool';
		label = `${dieData.length} dice (${poolName})`;
	} else {
		label = dieData.source ? dieData.source : `d${dieData.size}`;
	}
	showToast(`Added ${label} to dice pool`);
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
	dicePool.value.removeAt(index);
}

function clearDicePool() {
	dicePool.value.clear();
}

function handleSettlePP(delta: number) {
	if (character.value && delta > 0) {
		const currentPP = Number(character.value.plotPoints || 0);
		characterCurioFunctions.setPlotPoints(character.value, currentPP + delta);
		updateCharacter(character.value);
	}
}

function triggerRollFromPill() {
	if (studioPanelRef.value && typeof studioPanelRef.value.roll === 'function') {
		studioPanelRef.value.roll();
	}
}

function triggerClearFromPill() {
	clearDicePool();
}

function toggleMobileRollerDrawer() {
	if (isStudioPanelOpen.value && studioPanelTab.value === 'roller') {
		isStudioPanelOpen.value = false;
	} else {
		isStudioPanelOpen.value = true;
		studioPanelTab.value = 'roller';
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
	dicePool.value.clear();
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
	if (typeof t === 'string' && t.length) {
		ref = { id: t, version: null };
		c.sheet = { template: { id: t } };
	} else if (t && typeof t === 'object') {
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
	if (mode.value === 'character' && character.value && character.value.name.length) {
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
	if (!openCharacterIDs.value.includes(id)) {
		openCharacterIDs.value.push(id);
	}
	characterID.value = id;
	initHistory();
	setPageTitle();
	updateRouteHash();
	saveOpenCharacterIDs();
}

function closeOpenCharacter(id: string) {
	openCharacterIDs.value = openCharacterIDs.value.filter((x: string) => x !== id);
	if (characterID.value === id) {
		characterID.value = openCharacterIDs.value[0] || null;
		if (!characterID.value) {
			setMode('roster', null, true);
		} else {
			initHistory();
			updateRouteHash();
		}
	}
	saveOpenCharacterIDs();
}

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
				template.sheet && template.sheet.template
					? typeof template.sheet.template === 'string'
						? template.sheet.template
						: template.sheet.template.id
					: null;
			const reuse =
				currentRef && !characterCurioFunctions.findLibraryTemplate(currentRef) ? currentRef : 'custom-' + template.id;
			const entry = characterCurioFunctions.extractSheetTemplate(template, {
				id: reuse,
				version: 1,
				title: template.game || template.name || 'Template',
			});
			sheetTemplates.value = characterCurioStorage.upsertTemplate(
				sheetTemplates.value,
				JSON.parse(JSON.stringify(entry)),
			);

			const now = new Date().toISOString();
			const entity = {
				id: characterCurioFunctions.generateUUID(),
				isTemplate: asTemplate,
				name: asTemplate ? template.name || 'New Template' : '',
				game: template.game || template.name || '',
				dateCreated: now,
				dateModified: now,
				dateTouched: now,
				sets: {},
				template: { id: entry.id, version: entry.version || 1 },
			};
			const characterData: any = characterCurioFunctions.materializeCharacter(entity, entry.character);
			characterData.sheet = { template: { id: entry.id, version: entry.version || 1 } };
			characterCurioFunctions.ensureTraitSetIds(characterData);
			characterCurioFunctions.assignLids(characterData);
			recordCharOrder(characterData);

			characters.value.push(characterData);
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

	const characterData = structuredClone(characterCurioFunctions.defaultCharacter);

	characterData.id = characterCurioFunctions.generateUUID();
	characterData.isTemplate = asTemplate;
	if (asTemplate) {
		characterData.name = 'New Template';
	}

	characterData.dateCreated = new Date().toISOString();
	characterData.dateModified = new Date().toISOString();
	characterData.dateTouched = new Date().toISOString();
	characterCurioFunctions.ensureTraitSetIds(characterData);
	characterCurioFunctions.assignLids(characterData);

	characters.value.push(characterData);
	characterID.value = characterData.id;
	if (!openCharacterIDs.value.includes(characterData.id)) {
		openCharacterIDs.value.push(characterData.id);
	}
	saveOpenCharacterIDs();
	initHistory();
	setMode('character', submode.value ?? 'edit', true);

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

	// New character = an empty layered entity folded onto the
	// template at the seam; nothing is cloned from the array form.
	const now = new Date().toISOString();
	const entity = {
		id: characterCurioFunctions.generateUUID(),
		isTemplate: asTemplate,
		name: asTemplate ? (libraryItem.title ? libraryItem.title.replace(/\s*\([^)]*\)/g, '').trim() : 'Template') : '',
		game: libraryItem.game || libraryItem.title || '',
		dateCreated: now,
		dateModified: now,
		dateTouched: now,
		sets: {},
		template: { id: libraryItem.id, version: libraryItem.version || 1 },
	};
	const characterData: any = characterCurioFunctions.materializeCharacter(entity, libraryItem.character);
	characterCurioFunctions.ensureTraitSetIds(characterData);
	characterCurioFunctions.assignLids(characterData);
	// D16: snapshot the exact pinned base now — a later bundle
	// update must never move this character unasked.
	sheetTemplates.value = characterCurioStorage.upsertTemplate(
		sheetTemplates.value,
		JSON.parse(JSON.stringify(libraryItem)),
	);
	recordCharOrder(characterData);

	characters.value.push(characterData);
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
	showToast(asTemplate ? `Added "${libraryItem.title}" to templates` : `Created character from "${libraryItem.title}"`);
}

function toggleTemplate(characterId: string) {
	const characterData = characters.value.find((c: any) => c.id === characterId);
	if (!characterData) return;
	characterData.isTemplate = !characterData.isTemplate;
	characterData.dateModified = new Date().toISOString();
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

	const characterData = JSON.parse(JSON.stringify(original));
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

function loadCharacter(id: string) {
	if (!openCharacterIDs.value.includes(id)) {
		openCharacterIDs.value.push(id);
	}
	characterID.value = id;
	initHistory();
	setMode('character', submode.value ?? 'edit', true);

	touchCharacter(id);
	saveOpenCharacterIDs();
	saveLocalData();
}

function importSheetTemplate(entry: any) {
	if (!entry || !entry.id) return;
	if (characterCurioFunctions.isLegacyFile(entry)) {
		showToast(characterCurioFunctions.LEGACY_FILE_MESSAGE);
		return;
	}
	sheetTemplates.value = characterCurioStorage.upsertTemplate(sheetTemplates.value, entry);
	saveLocalData();
	showToast(`Saved layout template “${entry.title || entry.id}”`);
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
		: JSON.parse(JSON.stringify(character.value));
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
	if (characterCurioFunctions.isLegacyFile(characterData)) {
		showToast(characterCurioFunctions.LEGACY_FILE_MESSAGE);
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
	characterCurioFunctions.ensureTraitSetIds(incoming);
	characterCurioFunctions.assignLids(incoming);

	// Save new character.
	const c = characters.value.findIndex((existingCharacter: any) => existingCharacter.id === incoming.id);

	if (c !== -1) {
		characters.value[c] = incoming;
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
	const ref = t ? (typeof t === 'string' ? { id: t, version: null } : { id: t.id, version: t.version || null }) : null;
	if (!ref || !ref.id) return null;
	if (t && typeof t === 'object' && t.character) return t;
	return resolveTemplateEntry(ref.id, ref.version);
}

async function exportCharacter(id: string) {
	const characterData = characters.value.find((c: any) => c.id === id);
	if (!characterData) return;

	await ensureLibraryTemplates();
	const entry = sheetTemplateForExport(characterData);
	const out = entry
		? characterCurioFunctions.stripCharacterForExport(characterData, entry)
		: JSON.parse(JSON.stringify(characterData));
	// Arrangement travels name-keyed (D18 same-user-new-device).
	const filePrefs = characterCurioFunctions.prefsForExport(
		prefs.value && prefs.value.characters ? prefs.value.characters[characterData.id] : null,
		characterData,
	);
	if (filePrefs) out.prefs = filePrefs;

	let name = out.name && out.name.length ? out.name : 'Name';
	const timestamp = new Date(out.dateModified).getTime();
	name = name.replaceAll(/\s+/g, '_');
	const filename = `${name}_${timestamp}.curio.json`;

	downloadJson(filename, out);
}

function saveSheetTemplate() {
	const characterData = character.value;
	if (!characterData) return;
	const currentRef =
		characterData.sheet && characterData.sheet.template
			? typeof characterData.sheet.template === 'string'
				? characterData.sheet.template
				: characterData.sheet.template.id
			: null;
	// Re-saving a custom template updates it in place (version bump);
	// forking off a built-in (or nothing) mints a fresh static id.
	const reuse = currentRef && !characterCurioFunctions.findLibraryTemplate(currentRef) ? currentRef : null;
	const prev = reuse ? resolveTemplateEntry(reuse) : null;
	const entry = characterCurioFunctions.extractSheetTemplate(characterData, {
		id: reuse || undefined,
		version: reuse ? ((prev && prev.version) || 1) + 1 : 1,
		title: (characterData.game || characterData.name || 'Custom') + ' Layout',
	});
	sheetTemplates.value = characterCurioStorage.upsertTemplate(sheetTemplates.value, entry);
	characterData.sheet = { template: { id: entry.id, version: entry.version } };
	saveLocalData();
	showToast(`Saved layout as reusable template`);
}

function exportSheetTemplate() {
	const characterData = character.value;
	if (!characterData) return;
	const ref =
		characterData.sheet && characterData.sheet.template
			? typeof characterData.sheet.template === 'string'
				? characterData.sheet.template
				: characterData.sheet.template.id
			: null;
	let entry = ref ? resolveTemplateEntry(ref) : null;
	if (!entry)
		entry = characterCurioFunctions.extractSheetTemplate(characterData, {
			title: (characterData.game || characterData.name || 'Custom') + ' Layout',
		});
	const slug = String(entry.title || entry.id || 'template').replace(/\s+/g, '_');
	downloadJson(`${slug}.curio-template.json`, entry);
}

async function exportAllCharacters() {
	await ensureLibraryTemplates();
	const out = (characters.value || []).map((c: any) => {
		const entry = sheetTemplateForExport(c);
		const o = entry ? characterCurioFunctions.stripCharacterForExport(c, entry) : JSON.parse(JSON.stringify(c));
		const filePrefs = characterCurioFunctions.prefsForExport(
			prefs.value && prefs.value.characters ? prefs.value.characters[c.id] : null,
			c,
		);
		if (filePrefs) o.prefs = filePrefs;
		return o;
	});

	const bundle = {
		version: '0.1',
		type: 'bundle',
		dateExported: new Date().toISOString(),
		count: out.length,
		characters: out,
	};

	const timestamp = new Date().getTime();
	const filename = `Character_Curio_Bundle_${timestamp}.json`;

	downloadJson(filename, bundle);
	showToast(`Exported ${out.length} characters`);
}

function updateCharacter(characterData: any) {
	if (previewCharacter.value && previewCharacter.value.id === characterData.id) {
		previewCharacter.value = characterData;
		return Promise.resolve();
	}

	const c = characters.value.findIndex((savedCharacter: any) => savedCharacter.id === characterData.id);

	if (c === -1) return Promise.resolve();

	characterData.dateModified = new Date().toISOString();
	characterData.dateTouched = new Date().toISOString();
	characterCurioFunctions.assignLids(characterData);

	characters.value[c] = characterData;
	setPageTitle();

	recordCharOrder(characterData);
	touchCharacter(characterData.id);
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
		return Promise.resolve();
	}
	const saved = saveLocalData();
	commitHistorySnapshot();
	return saved;
}

// history (initHistory / commitHistorySnapshot / validateEditing / undo / redo)
// now lives in use-history.ts

function handleGlobalKeydown(event: KeyboardEvent) {
	if (mode.value !== 'character' || submode.value !== 'edit') return;

	if (event.key === 'Escape') {
		if (editing.value && editing.value.length) {
			event.preventDefault();
			if (event.target && typeof (event.target as any).blur === 'function') {
				(event.target as any).blur();
			}
			clearSelected();
			return;
		}
	}

	const target = event.target ? (event.target as HTMLElement).tagName : '';
	if (target === 'INPUT' || target === 'TEXTAREA') return;

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
		return;
	}

	commitHistorySnapshot();
	editing.value = selector;

	if (selector.length > 0) {
		isStudioPanelOpen.value = true;
		studioPanelTab.value = 'properties';
	}

	// Mobile: bring active panel into view
	if (
		selector.length &&
		mode.value === 'character' &&
		submode.value !== 'print' &&
		window.matchMedia &&
		window.matchMedia('(max-width: 768px)').matches
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
		(event.target as any).closest('.editor, .modal, .sidebar, .studio-panel, .sheet-bar-btn'),
	);
}

function handleMainClick(event: Event) {
	if (mouseDownInsideEditor.value) {
		return;
	}
	if (
		event &&
		event.target &&
		(event.target as any).closest &&
		(event.target as any).closest('.editor, .modal, .sidebar, .studio-panel, .sheet-bar-btn')
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
	if (!window.matchMedia || !window.matchMedia('(max-width: 768px)').matches) return;
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

async function bootFromStorage() {
	storeReady.value = false;
	storeError.value = null;

	try {
		const stored = await characterCurioStorage.load();
		sheetTemplates.value = characterCurioStorage.normalizeTemplates(stored.templates);
		prefs.value = characterCurioStorage.normalizePreferences(stored.preferences);
		await ensureLibraryTemplates();
		characters.value = (stored.characters || []).map((c: any) => resolveStoredCharacter(c));
		initBaseline(characters.value);
		lastSavedCharacters = {};
		(stored.characters || []).forEach((c: any) => {
			if (c && c.id != null) {
				lastSavedCharacters![String(c.id)] = JSON.stringify(c);
			}
		});
		playViewMode.value = stored.playViewMode || 'split';
		panelPosition.value =
			stored.rollerPosition === 'left' || stored.rollerPosition === 'right' ? stored.rollerPosition : 'right';
		rollerPosition.value = panelPosition.value;
		openCharacterIDs.value = (stored.openCharacterIDs || []).filter((id: string) =>
			characters.value.some((c: any) => c.id === id),
		);
		if (characterID.value && !openCharacterIDs.value.includes(characterID.value)) {
			openCharacterIDs.value.push(characterID.value);
		}
		lastSavedSession = JSON.stringify({
			openCharacterIDs: openCharacterIDs.value,
			playViewMode: playViewMode.value,
			rollerPosition: rollerPosition.value,
			templates: characterCurioStorage.pruneTemplates(sheetTemplates.value, characters.value),
			preferences: prefs.value,
		});
		if (stored.loadError) {
			storeError.value = stored.loadError;
			showToast('Saved data was damaged — starting fresh. Export backups regularly.');
		} else if (stored.migrationError) {
			showToast('Migrated your data, but the old copy could not be removed.');
		} else if (stored.migrated) {
			showToast('Library upgraded to the new local database.');
		}
	} catch (err) {
		storeError.value = err;
		showToast('Could not open the local library — starting empty.');
	}

	storeReady.value = true;
	characterCurioStorage.requestPersistence();
}

// Last successful save: characters keyed by id (storage form as JSON) and
// the session JSON. The next save skips no-ops and upserts only what changed.
let lastSavedCharacters: Record<string, string> | null = null;
let lastSavedSession: string | null = null;

async function persist(options?: { allowSessionCharacterSave?: boolean }) {
	if (isPreview.value) return;
	let upsert: any[] = [];
	let remove: string[] = [];
	let session: any;
	let snapshot: Record<string, string> | null = null;
	let sessionJson: string | null = null;
	try {
		await ensureLibraryTemplates();
		const sparse = (characters.value || []).map((c: any) => {
			const ct = c.sheet && c.sheet.template;
			const ref = ct
				? typeof ct === 'string'
					? { id: ct, version: null }
					: { id: ct.id, version: ct.version || null }
				: null;
			// Strip against the PINNED version (the base this
			// character was merged from), never the newer bundle.
			const entry = ref ? resolveTemplateEntry(ref.id, ref.version) : null;
			const templateChar = entry ? characterCurioFunctions.findTemplateCharacter(entry) : null;
			let out;
			if (entry && templateChar) {
				// Layered storage: lossless content + per-entity
				// override entity (presentation is preserved), pinned ref.
				const delta = characterCurioFunctions.stripCharacterToDeltas(c, entry);
				out = characterCurioFunctions.toLayeredEntity(delta);
			} else {
				// Standalone / no template: keep the array form.
				out = JSON.parse(JSON.stringify(c));
			}
			// Storage form keeps a pinned { id, version } reference —
			// the full template object lives in the template store
			// (embedded only on file export).
			if (ref && ref.id) {
				out.sheet = ref.version ? { template: { id: ref.id, version: ref.version } } : { template: { id: ref.id } };
			} else delete out.sheet;
			return out;
		});
		session = JSON.parse(
			JSON.stringify({
				openCharacterIDs: openCharacterIDs.value,
				playViewMode: playViewMode.value,
				rollerPosition: rollerPosition.value,
				templates: characterCurioStorage.pruneTemplates(sheetTemplates.value, characters.value),
				preferences: prefs.value,
			}),
		);
		// Dirty diff against the last save: whole entries by id, never
		// field-merged. New ids are upserts; vanished ids are deletes.
		const curr: Record<string, string> = {};
		const currObj: Record<string, any> = {};
		sparse.forEach((c: any) => {
			if (c && c.id != null) {
				const id = String(c.id);
				curr[id] = JSON.stringify(c);
				currObj[id] = c;
			}
		});
		if (lastSavedCharacters) {
			for (const id of Object.keys(curr)) {
				if (lastSavedCharacters[id] !== curr[id]) upsert.push(currObj[id]);
			}
			for (const id of Object.keys(lastSavedCharacters)) {
				if (curr[id] === undefined) remove.push(id);
			}
		} else {
			// No baseline yet (first save since boot): upsert the roster,
			// then the merge keeps anything this tab does not know about.
			upsert = sparse.filter((c: any) => c && c.id != null);
		}

		// Persist gating in Play:
		const isGatedPlay = submode.value === 'play' && !options?.allowSessionCharacterSave;
		if (isGatedPlay) {
			upsert = [];
			remove = [];
		}

		sessionJson = JSON.stringify(session);
		// No-op gate: nothing changed since the last save, no write.
		if (!upsert.length && !remove.length && lastSavedSession === sessionJson) return;
		snapshot = isGatedPlay ? lastSavedCharacters || {} : curr;
	} catch (err) {
		showToast('Could not save changes.');
		return;
	}

	try {
		const result = await characterCurioStorage.saveChanges({ upsert, remove, session });
		lastSavedCharacters = snapshot;
		lastSavedSession = sessionJson;
		if (submode.value !== 'play' || options?.allowSessionCharacterSave) {
			const changedIds = new Set(upsert.filter((u: any) => u && u.id != null).map((u: any) => String(u.id)));
			for (const c of characters.value) {
				if (c && c.id != null) {
					const id = String(c.id);
					if (changedIds.has(id) || !baselineCharacters.has(id)) {
						baselineCharacters.set(id, JSON.stringify(toRaw(c)));
					}
				}
			}
		}
		if (result.merged) showToast('Merged changes from another tab.');
	} catch (err: any) {
		if (err && (err.name === 'QuotaExceededError' || err.code === 22)) {
			showToast('Local storage is full — export a backup, then remove large images.');
		} else if (
			err &&
			/blocked|unavailable|security|denied|invalidstate/i.test((err.name || '') + ' ' + (err.message || ''))
		) {
			showToast('Browser storage is blocked — check site settings, then export a backup.');
		} else {
			showToast('Could not save changes. Export a backup to be safe.');
		}
	}
}

function saveLocalData() {
	cancelDeferredSave();
	if (submode.value === 'play') {
		showPlaySaveConfirm.value = true;
		return Promise.resolve();
	}
	return persist();
}

// The mounted proxy is the documented debug/test handle (legacy.md). With
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
	prefs,
	playViewMode,
	isAddCharacterModalOpen,
	sessionCharacterSearch,
	mode,
	submode,
	editing,
	viewY,
	dicePool,
	isRollerOpen,
	rollerPosition,
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
	toggleRoller,
	toggleRollerPosition,
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
		@navigate="setMode"
		@undo="undo"
		@redo="redo"
		@toggleTheme="toggleDarkMode"
	/>

	<!-- PLAY SHELL: STUDIO PANEL (INSPECTOR + ROLLER) + SHEET VIEWPORT -->
	<div
		class="play-shell"
		:class="{
			'theme-dark': isDarkMode,
			'panel-open': isStudioPanelOpen && mode === 'character' && submode !== 'print',
			'panel-right': panelPosition === 'right',
			'panel-left': panelPosition === 'left',
			'roller-open': isStudioPanelOpen && mode === 'character' && submode !== 'print',
			'roller-right': panelPosition === 'right',
		}"
	>
		<!-- STUDIO PANEL: PROPERTIES INSPECTOR & DICE ROLLER -->
		<studio-panel
			ref="studioPanelRef"
			v-if="mode === 'character' && submode !== 'print'"
			:character="character"
			:editing="editing"
			:submode="submode"
			:mode="mode"
			:isOpen="isStudioPanelOpen"
			:position="panelPosition"
			:panelTab="studioPanelTab"
			:dicePool="dicePool"
			:viewY="viewY"
			@update:panelTab="studioPanelTab = $event"
			@update:isOpen="setPanelOpen($event)"
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
				:rollerCount="dicePool.items.length"
				:isDesktopPillars="isDesktopPillars"
				@focus="focusCharacter"
				@close="closeOpenCharacter"
				@add="isAddCharacterModalOpen = true"
				@setPlayView="setPlayViewMode"
				@toggleStudio="handleToggleStudio"
				@saveSession="saveLocalData"
				@togglePillars="toggleDesktopPillars"
			/>

			<main class="main" ref="main" @scroll="setViewY" @click.stop="handleMainClick">
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
					v-if="mode === 'roster'"
					:characters="characters"
					@createCharacter="createCharacter"
					@createFromTemplate="createFromTemplate"
					@toggleTemplate="toggleTemplate"
					@loadCharacter="loadCharacter"
					@duplicateCharacter="duplicateCharacter"
					@exportCharacter="exportCharacter"
					@exportAllCharacters="exportAllCharacters"
					@deleteCharacter="deleteCharacter"
					@deleteAllCharacters="deleteAllCharacters"
					@importCharacter="importCharacter"
					@importSheetTemplate="importSheetTemplate"
					@createFromLibrary="createFromLibrary"
					@previewTemplate="openPreview"
				></roster>

				<!-- PLAY MODE: MULTI-CHARACTER SPLIT VIEW -->
				<div
					class="multi-character-workspace"
					v-else-if="
						mode === 'character' && submode === 'play' && playViewMode === 'split' && openCharacters.length > 1
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
									v-if="char.portrait && char.portrait.url"
									:style="'background-image:url(' + safeImageUrl(char.portrait.url) + ')'"
								></span>
								<span class="banner-icon" v-else><i class="fas fa-shield-alt"></i></span>
								<span class="banner-name">{{ char.name || 'Unnamed' }}</span>
								<span class="banner-game" v-if="char.game">{{ char.game }}</span>
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
						></Character>
					</div>
				</div>

				<Character
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
				</article>
			</main>
			<!-- DOCKED MOBILE ROLLER PILL BAR -->
			<div
				class="mobile-roller-pill-bar"
				v-if="mode === 'character' && submode === 'play'"
				:class="{ 'has-dice': dicePool.items.length > 0, 'is-open': isStudioPanelOpen && studioPanelTab === 'roller' }"
			>
				<div class="mobile-roller-pill-left" @click="toggleMobileRollerDrawer">
					<template v-if="studioPanelRef?.diceRoller?.isRolled && studioPanelRef?.diceRoller?.bestTotalInfo">
						<span class="pill-result-total"
							>Total: <strong>{{ studioPanelRef.diceRoller.bestTotalInfo.total }}</strong></span
						>
						<span class="pill-bullet">•</span>
						<span class="pill-result-effect"
							>Effect: <strong>{{ studioPanelRef.diceRoller.bestTotalInfo.effect }}</strong></span
						>
					</template>
					<template v-else-if="dicePool.items.length > 0">
						<span v-for="(item, pIdx) in dicePool.items" :key="pIdx" class="pill-die">
							<span v-html="characterCurioFunctions.renderDieconSVG(item.size, false, '', null)"></span>
							<span v-if="item.ppDelta" class="pill-pp-tag">+PP</span>
						</span>
					</template>
					<template v-else>
						<span class="pill-empty-label"
							><i class="fas fa-dice" aria-hidden="true"></i> 0 Dice Staged — Tap traits to build pool</span
						>
					</template>
				</div>
				<div class="mobile-roller-pill-right">
					<template v-if="dicePool.items.length > 0">
						<button type="button" class="btn-pill-roll" @click.stop="triggerRollFromPill" title="Roll dice">
							<i class="fas fa-dice"></i> Roll
						</button>
						<button type="button" class="btn-pill-clear" @click.stop="triggerClearFromPill" title="Clear pool">
							<i class="fas fa-times"></i>
						</button>
					</template>
					<template v-else>
						<button
							type="button"
							class="btn-pill-expand"
							@click.stop="toggleMobileRollerDrawer"
							title="Open dice roller"
						>
							<i class="fas fa-dice" aria-hidden="true"></i> Roller
						</button>
					</template>
				</div>
			</div>
		</div>
		<!-- /.sheet-column -->
	</div>
	<!-- /.play-shell -->

	<add-character-modal
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
	<div class="sr-only" role="status" aria-live="polite">{{ toastMessage }}</div>
	<transition name="toast">
		<div class="toast-notification" v-if="toastMessage" aria-hidden="true">
			<i class="fas fa-check-circle"></i> <span>{{ toastMessage }}</span>
		</div>
	</transition>

	<app-footer :mode="mode" :year="year" @navigate="setMode" />
</template>
