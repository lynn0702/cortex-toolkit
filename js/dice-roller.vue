<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useId, watch } from 'vue';
import {
	dicePool as dicePoolModel,
	DIE_SIZES,
	flattenCharacterTraits,
	flattenGraphTraits,
	loadRollLog,
	MAX_ROLL_LOG_ENTRIES,
	parseTraitShorthand,
	saveRollLog,
	type DiceItem,
	type FlattenedTraitSuggestion,
	type NamedPool,
	type PoolEvaluation,
	type RollLogEntry,
	type RollLogPoolSummary,
	type RollLogSideSummary,
	type RollResult,
	type SeparateGroup,
	type WordBankItem,
	type WordBankKind,
} from './dice-pool.ts';
import { characterCurioFunctions } from './functions.ts';
import { hasPlotPoints, resolvePlotPoints } from './model.ts';
import RollerOutcome from './roller-outcome.vue';

const props = withDefaults(
	defineProps<{
		open: boolean;
		pool?: any;
		oppositionPool?: any;
		activePoolSide?: 'player' | 'opposition';
		namedPools?: NamedPool[];
		activePoolId?: string;
		curiosities?: any[];
		character?: any;
		history?: any[];
		position?: string;
	}>(),
	{
		history: () => [],
		position: 'left',
	},
);

const emit = defineEmits<{
	(e: 'addDie', die: any): void;
	(e: 'removeDie', index: number): void;
	(e: 'clearPool'): void;
	(e: 'clearOppositionPool'): void;
	(e: 'settlePP', delta: number, poolId?: string): void;
	(e: 'update:activePoolSide', side: 'player' | 'opposition'): void;
	(e: 'update:activePoolId', poolId: string): void;
	(e: 'addNamedPool', payload: { ownerId: string | null; ownerName: string; withPP?: boolean }): void;
	(e: 'removeNamedPool', poolId: string): void;
	(e: 'togglePoolPP', poolId: string): void;
}>();

const savedCombine = typeof localStorage !== 'undefined' ? localStorage.getItem('characterCurioCombineSeparate') : null;
const newPoolInputId = useId();

const localPlayerPool = ref(new dicePoolModel.DicePool());
const localOppositionPool = ref(new dicePoolModel.DicePool());
const localSide = ref<'player' | 'opposition'>('player');
const localActivePoolId = ref<string>('');
const localPlotPoints = ref(1);
const rollLog = ref<RollLogEntry[]>(loadRollLog());
const activeLogEntryId = ref<string | null>(null);
const copiedEntryId = ref<string | null>(null);
const localWordsByPool = ref<Record<string, WordBankItem[]>>({});
const poolTablistRef = ref<HTMLElement | null>(null);

const isMultiPoolMode = computed(() => Array.isArray(props.namedPools) && props.namedPools.length > 0);

const playerPoolRef = computed(() => props.pool || localPlayerPool.value);
const oppositionPoolRef = computed(() => props.oppositionPool || localOppositionPool.value);

const effectivePools = computed<NamedPool[]>(() => {
	if (isMultiPoolMode.value && props.namedPools) {
		return props.namedPools;
	}
	return [
		{
			id: 'player',
			ownerId: props.character?.id ?? null,
			ownerName: 'Player',
			pool: playerPoolRef.value,
		},
		{
			id: 'opposition',
			ownerId: null,
			ownerName: 'Opposition',
			pool: oppositionPoolRef.value,
		},
	];
});

const currentSide = computed<'player' | 'opposition'>(() => props.activePoolSide || localSide.value);

const currentPoolId = computed<string>(() => {
	if (isMultiPoolMode.value) {
		if (props.activePoolId && effectivePools.value.some((p) => p.id === props.activePoolId)) {
			return props.activePoolId;
		}
		if (localActivePoolId.value && effectivePools.value.some((p) => p.id === localActivePoolId.value)) {
			return localActivePoolId.value;
		}
		return effectivePools.value[0]?.id || 'player';
	}
	return currentSide.value;
});

const activePoolEntry = computed<NamedPool>(
	() => effectivePools.value.find((p) => p.id === currentPoolId.value) || effectivePools.value[0],
);

const activePool = computed(() => activePoolEntry.value?.pool);

const isActiveChallengerTone = computed(() => {
	const entry = activePoolEntry.value;
	if (!entry) return false;
	if (entry.id === 'opposition') return true;
	const idx = effectivePools.value.findIndex((p) => p.id === entry.id);
	return !entry.ownerId && idx > 0;
});

function itemsForPool(poolObj: any): DiceItem[] {
	return poolObj && Array.isArray(poolObj.items) ? poolObj.items : [];
}

const stagedDice = computed<DiceItem[]>(() => itemsForPool(activePool.value));

function wordsForPool(poolObj: any, poolId: string): WordBankItem[] {
	if (poolObj && Array.isArray(poolObj.wordBank)) return poolObj.wordBank;
	if (!localWordsByPool.value[poolId]) {
		localWordsByPool.value[poolId] = [];
	}
	return localWordsByPool.value[poolId];
}

const activeWordBank = computed<WordBankItem[]>(() => wordsForPool(activePool.value, currentPoolId.value));

const allKnownCuriosities = computed<any[]>(() => {
	const seen = new Set<any>();
	const result: any[] = [];
	const pushEntity = (entity: any) => {
		if (!entity || typeof entity !== 'object') return;
		const key = entity.id ?? entity;
		if (seen.has(key)) return;
		seen.add(key);
		result.push(entity);
		if (entity.curiosities && typeof entity.curiosities === 'object') {
			for (const child of Object.values(entity.curiosities)) {
				pushEntity(child);
			}
		}
	};
	if (Array.isArray(props.curiosities)) {
		for (const c of props.curiosities) pushEntity(c);
	}
	if (props.character) {
		pushEntity(props.character);
	}
	return result;
});

function findOwnerEntity(entry: NamedPool | null | undefined): any | null {
	if (!entry) return null;
	if (entry.ownerId) {
		const found = allKnownCuriosities.value.find((c) => c && String(c.id) === String(entry.ownerId));
		if (found) return found;
	}
	if (!isMultiPoolMode.value && entry.id === 'player' && props.character) {
		return props.character;
	}
	return null;
}

function resolveEntryName(entry: NamedPool | null | undefined): string {
	if (!entry) return 'Pool';
	if (!isMultiPoolMode.value) return entry.ownerName;
	const owner = findOwnerEntity(entry);
	if (owner) {
		return String(owner.name || 'Unnamed').trim() || 'Unnamed';
	}
	return String(entry.ownerName || 'Unnamed').trim() || 'Unnamed';
}

function doesPoolTrackPP(entry: NamedPool | null | undefined): boolean {
	if (!entry) return false;
	if (!isMultiPoolMode.value) {
		if (entry.id === 'opposition') return false;
		if (props.character) return hasPlotPoints(props.character);
		return true;
	}
	const owner = findOwnerEntity(entry);
	if (owner) return hasPlotPoints(owner);
	return typeof entry.plotPoints === 'number' && Number.isFinite(entry.plotPoints);
}

function getPoolPP(entry: NamedPool | null | undefined): number {
	if (!entry) return 0;
	const owner = findOwnerEntity(entry);
	if (owner) return resolvePlotPoints(owner);
	if (typeof entry.plotPoints === 'number' && Number.isFinite(entry.plotPoints)) {
		return Math.max(0, Math.floor(entry.plotPoints));
	}
	if (!isMultiPoolMode.value && entry.id === 'player' && !props.character) {
		return localPlotPoints.value;
	}
	return 0;
}

function pendingPPForPool(entry: NamedPool | null | undefined): number {
	if (!entry) return 0;
	return itemsForPool(entry.pool).reduce(
		(sum, item) => sum + (!item.ppCommitted && item.ppDelta ? Number(item.ppDelta) : 0),
		0,
	);
}

const ppBearingPools = computed<NamedPool[]>(() => effectivePools.value.filter((p) => doesPoolTrackPP(p)));

const activePoolTracksPP = computed(() => doesPoolTrackPP(activePoolEntry.value));

const effectivePlotPoints = computed<number>(() => {
	if (activePoolTracksPP.value) {
		return getPoolPP(activePoolEntry.value);
	}
	if (!isMultiPoolMode.value && ppBearingPools.value.length > 0) {
		return getPoolPP(ppBearingPools.value[0]);
	}
	return 0;
});

function adjustPoolPP(poolId: string, delta: number) {
	if (delta === 0) return;
	const target = effectivePools.value.find((p) => p.id === poolId) || activePoolEntry.value;
	if (!target) return;
	const current = getPoolPP(target);
	if (delta < 0 && current + delta < 0) return;
	if (!isMultiPoolMode.value && !props.character && target.id === 'player') {
		localPlotPoints.value = Math.max(0, localPlotPoints.value + delta);
	}
	if (isMultiPoolMode.value) {
		emit('settlePP', delta, target.id);
	} else {
		emit('settlePP', delta);
	}
}

function adjustPP(delta: number) {
	const targetId = activePoolTracksPP.value
		? activePoolEntry.value.id
		: ppBearingPools.value[0]?.id || activePoolEntry.value.id;
	adjustPoolPP(targetId, delta);
}

// + Pool inline creation bar
const isAddPoolOpen = ref(false);
const newPoolName = ref('');
const newPoolWithPP = ref(false);
const newPoolInputRef = ref<HTMLInputElement | null>(null);

const unpooledCuriosities = computed<any[]>(() => {
	if (!isMultiPoolMode.value) return [];
	const ownedIds = new Set(effectivePools.value.map((p) => (p.ownerId ? String(p.ownerId) : '')).filter(Boolean));
	return allKnownCuriosities.value.filter((c) => c && c.id && !c.isTemplate && !ownedIds.has(String(c.id)));
});

function toggleAddPool() {
	isAddPoolOpen.value = !isAddPoolOpen.value;
	if (isAddPoolOpen.value) {
		newPoolName.value = '';
		newPoolWithPP.value = false;
		nextTick(() => {
			newPoolInputRef.value?.focus();
		});
	}
}

function quickAddCuriosityPool(curiosity: any) {
	if (!curiosity) return;
	emit('addNamedPool', {
		ownerId: String(curiosity.id),
		ownerName: String(curiosity.name || 'Unnamed').trim() || 'Unnamed',
	});
	isAddPoolOpen.value = false;
	newPoolName.value = '';
}

function submitNewPool() {
	const trimmed = newPoolName.value.trim();
	if (!trimmed) return;
	emit('addNamedPool', {
		ownerId: null,
		ownerName: trimmed,
		withPP: newPoolWithPP.value,
	});
	newPoolName.value = '';
	newPoolWithPP.value = false;
	isAddPoolOpen.value = false;
}

function onNewPoolKeydown(e: KeyboardEvent) {
	if (e.key === 'Escape') {
		e.preventDefault();
		isAddPoolOpen.value = false;
		newPoolName.value = '';
		return;
	}
	if (e.key === 'Enter') {
		e.preventDefault();
		if (e.isComposing || e.keyCode === 229) {
			return;
		}
		submitNewPool();
	}
}

function removeActivePool() {
	if (!isMultiPoolMode.value || effectivePools.value.length <= 1) return;
	const id = activePoolEntry.value.id;
	delete evaluationsByPool.value[id];
	rolledPoolOrder.value = rolledPoolOrder.value.filter((pid) => pid !== id);
	emit('removeNamedPool', id);
}

// Per-pool modifiers
const combineSeparateByPool = ref<Record<string, boolean>>({
	player: savedCombine !== null ? savedCombine === 'true' : false,
});
const keepOffsetByPool = ref<Record<string, number>>({});
const ppKeepBonusByPool = ref<Record<string, number>>({});

function getPoolCombineSeparate(poolId: string, idx = 0): boolean {
	if (poolId in combineSeparateByPool.value) return Boolean(combineSeparateByPool.value[poolId]);
	if (idx === 0 && savedCombine !== null) return savedCombine === 'true';
	return false;
}

function getPoolKeepOffset(poolId: string): number {
	return keepOffsetByPool.value[poolId] || 0;
}

function getPoolPpKeepBonus(poolId: string): number {
	return ppKeepBonusByPool.value[poolId] || 0;
}

const combineSeparate = computed({
	get: () => {
		const idx = effectivePools.value.findIndex((p) => p.id === currentPoolId.value);
		return getPoolCombineSeparate(currentPoolId.value, Math.max(0, idx));
	},
	set: (val: boolean) => {
		const id = currentPoolId.value;
		combineSeparateByPool.value[id] = val;
		const idx = effectivePools.value.findIndex((p) => p.id === id);
		if (idx <= 0) {
			try {
				localStorage.setItem('characterCurioCombineSeparate', val ? 'true' : 'false');
			} catch (_e) {}
		}
		if (isRolled.value) {
			reEvaluateRoll();
		}
	},
});

const diceSizes = computed(() => DIE_SIZES);
const isSeparateAddMode = ref(false);
const selectedDieId = ref<string | null>(null);

watch(currentPoolId, () => {
	selectedDieId.value = null;
	closePresearch();
});

const selectedDieIndex = computed(() => {
	if (!selectedDieId.value) return -1;
	return stagedDice.value.findIndex((d) => d.id === selectedDieId.value);
});

const selectedDie = computed<DiceItem | null>(() =>
	selectedDieIndex.value !== -1 ? stagedDice.value[selectedDieIndex.value] : null,
);

function toggleSelectDie(id: string) {
	selectedDieId.value = selectedDieId.value === id ? null : id;
}

// Staged item resolution helpers (sparse data, base default 1)
function itemHitches(d: any): number {
	const h =
		d && typeof d.hitches === 'number' && Number.isFinite(d.hitches) && d.hitches >= 0 ? Math.floor(d.hitches) : 1;
	return h;
}

function isExempt(d: any): boolean {
	return itemHitches(d) === 0;
}

function itemKeepsExtra(d: any): number {
	if (d && typeof d.keepsExtra === 'number' && Number.isFinite(d.keepsExtra) && d.keepsExtra > 0) {
		return Math.floor(d.keepsExtra);
	}
	if (d && d.isScale) return 1;
	return 0;
}

function computePoolKeepStats(
	items: DiceItem[],
	words: WordBankItem[],
	combineSep: boolean,
	ppKeep: number,
	offset: number,
) {
	const scaleWords = words.filter((w) => w.kind === 'scale').length;
	const keepsExtraTotal = items.reduce((sum, d) => sum + itemKeepsExtra(d), 0);
	const actionKeepsExtra = items.filter((d) => !isExempt(d)).reduce((sum, d) => sum + itemKeepsExtra(d), 0);
	const separateDiceList = items.filter((d) => isExempt(d));
	const sources = new Set<string>();
	for (const d of separateDiceList) {
		const src = String(d.source || 'Separate')
			.trim()
			.toLowerCase();
		if (src) sources.add(src);
	}
	const sepBonus = sources.size;
	const base = 2 + scaleWords + keepsExtraTotal + ppKeep + (combineSep ? sepBonus : 0);
	const effectiveKeep = Math.min(12, Math.max(1, base + offset));
	return {
		scaleWords,
		keepsExtraTotal,
		actionKeepsExtra,
		sepBonus,
		base,
		effectiveKeep,
	};
}

const activeKeepStats = computed(() =>
	computePoolKeepStats(
		stagedDice.value,
		activeWordBank.value,
		combineSeparate.value,
		getPoolPpKeepBonus(currentPoolId.value),
		getPoolKeepOffset(currentPoolId.value),
	),
);

const activeKeep = computed(() => activeKeepStats.value.effectiveKeep);
const separateDice = computed(() => stagedDice.value.filter((d) => isExempt(d)));
const hasSeparateDice = computed(() => separateDice.value.length > 0);
const separateKeepBonus = computed(() => activeKeepStats.value.sepBonus);

const actionThreshold = computed(() => {
	let top = 1;
	for (const d of stagedDice.value) {
		if (isExempt(d)) continue;
		top = Math.max(top, itemHitches(d));
	}
	return top;
});

const hitchLabel = computed(() => (actionThreshold.value > 1 ? '1–' + actionThreshold.value : '1'));

function adjustKeep(delta: number) {
	const nextKeep = Math.min(12, Math.max(1, activeKeep.value + delta));
	const diff = nextKeep - activeKeep.value;
	if (diff === 0) return;
	const id = currentPoolId.value;
	keepOffsetByPool.value[id] = getPoolKeepOffset(id) + diff;
	if (isRolled.value) {
		reEvaluateRoll();
	}
}

// Pool mutation helpers (work both on real DicePool instances & plain mock objects)
function getUuid(): string {
	return typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
		? crypto.randomUUID()
		: Math.random().toString(36).substring(2, 9);
}

function addWordToPool(targetPool: any, poolId: string, label: string, kind: WordBankKind = 'trait') {
	if (targetPool && typeof targetPool.addWord === 'function') {
		return targetPool.addWord(label, kind);
	}
	const trimmed = String(label || '').trim();
	if (!trimmed) return null;
	const item: WordBankItem = { id: getUuid(), label: trimmed, kind };
	wordsForPool(targetPool, poolId).push(item);
	return item;
}

function removeWordFromPool(targetPool: any, poolId: string, id: string) {
	if (targetPool && typeof targetPool.removeWord === 'function') {
		return targetPool.removeWord(id);
	}
	const list = wordsForPool(targetPool, poolId);
	const idx = list.findIndex((w) => w.id === id);
	if (idx !== -1) return list.splice(idx, 1)[0];
	return null;
}

function addDiceToTargetPool(targetPool: any, dicePayloads: any | any[], skipWordBank = true) {
	if (targetPool && typeof targetPool.add === 'function') {
		targetPool.add(dicePayloads, { skipWordBank });
	} else if (targetPool && Array.isArray(targetPool.items)) {
		const list = Array.isArray(dicePayloads) ? dicePayloads : [dicePayloads];
		for (const p of list) {
			const qty = Math.max(1, Number(p?.qty) || 1);
			for (let i = 0; i < qty; i++) {
				targetPool.items.push({
					id: getUuid(),
					size: Number(p?.size) || 6,
					source: p?.source || '',
					isScale: Boolean(p?.isScale),
					hitches: typeof p?.hitches === 'number' ? p.hitches : 1,
					keepsExtra: typeof p?.keepsExtra === 'number' ? p.keepsExtra : 0,
					ppDelta: typeof p?.ppDelta === 'number' ? p.ppDelta : 0,
					ppCommitted: Boolean(p?.ppCommitted),
				});
			}
		}
	}
	isRolled.value = false;
}

function tabDomId(entry: NamedPool): string {
	if (!isMultiPoolMode.value) {
		return entry.id === 'opposition' ? 'tabOpposition' : 'tabPlayer';
	}
	if (entry.id === 'opposition') return 'tabOpposition';
	return `tabPool-${entry.id}`;
}

function findTabButton(entry: NamedPool): HTMLElement | null {
	const domId = tabDomId(entry);
	const inList = Array.from(poolTablistRef.value?.querySelectorAll<HTMLElement>('[role="tab"]') || []).find(
		(el) => el.id === domId,
	);
	if (inList) return inList;
	return typeof document !== 'undefined' ? document.getElementById(domId) : null;
}

function selectPoolById(poolId: string) {
	if (isMultiPoolMode.value) {
		localActivePoolId.value = poolId;
		emit('update:activePoolId', poolId);
		const side: 'player' | 'opposition' = poolId === 'opposition' ? 'opposition' : 'player';
		localSide.value = side;
		emit('update:activePoolSide', side);
	} else {
		const side: 'player' | 'opposition' = poolId === 'opposition' ? 'opposition' : 'player';
		localSide.value = side;
		emit('update:activePoolSide', side);
	}
	nextTick(() => {
		const target = effectivePools.value.find((p) => p.id === poolId);
		if (!target) return;
		const btn = findTabButton(target);
		if (btn && typeof btn.scrollIntoView === 'function') {
			try {
				btn.scrollIntoView({ block: 'nearest', inline: 'nearest', container: 'nearest' } as ScrollIntoViewOptions);
			} catch {
				btn.scrollIntoView({ block: 'nearest', inline: 'nearest' });
			}
		}
	});
}

function onPoolTabKeydown(e: KeyboardEvent) {
	const pools = effectivePools.value;
	if (pools.length <= 1) return;
	if (e.key === 'ArrowRight' || e.key === 'ArrowLeft' || e.key === 'Home' || e.key === 'End') {
		e.preventDefault();
		const curIdx = Math.max(
			0,
			pools.findIndex((p) => p.id === currentPoolId.value),
		);
		let nextIdx = curIdx;
		if (e.key === 'Home') nextIdx = 0;
		else if (e.key === 'End') nextIdx = pools.length - 1;
		else if (e.key === 'ArrowRight') nextIdx = (curIdx + 1) % pools.length;
		else if (e.key === 'ArrowLeft') nextIdx = (curIdx - 1 + pools.length) % pools.length;
		const nextEntry = pools[nextIdx];
		if (!nextEntry) return;
		selectPoolById(nextEntry.id);
		nextTick(() => {
			findTabButton(nextEntry)?.focus();
		});
	}
}

// Word Bank & + Trait Pre-Search Combobox
const isTraitInputOpen = ref(false);
const isPresearchOpen = ref(false);
const traitQuery = ref('');
const highlightedIdx = ref(0);
const traitInputRef = ref<HTMLInputElement | null>(null);
const traitInputBarRef = ref<HTMLElement | null>(null);
const presearchPopoverRef = ref<HTMLElement | null>(null);

const allFlattenedTraits = computed<FlattenedTraitSuggestion[]>(() => {
	if (allKnownCuriosities.value.length > 0) {
		return flattenGraphTraits(allKnownCuriosities.value);
	}
	return flattenCharacterTraits(props.character);
});

const filteredSuggestions = computed<FlattenedTraitSuggestion[]>(() => {
	const q = traitQuery.value.trim().toLowerCase();
	if (!q) return allFlattenedTraits.value;
	return allFlattenedTraits.value.filter(
		(s) =>
			s.name.toLowerCase().includes(q) || s.noun.toLowerCase().includes(q) || s.description.toLowerCase().includes(q),
	);
});

const parsedShorthand = computed(() => parseTraitShorthand(traitQuery.value));

watch(filteredSuggestions, (list) => {
	if (highlightedIdx.value >= list.length) {
		highlightedIdx.value = Math.max(0, list.length - 1);
	}
});

function positionPopoverFallback() {
	const pop = presearchPopoverRef.value;
	const bar = traitInputBarRef.value;
	if (!pop || !bar) return;
	const supportsAnchor =
		typeof window !== 'undefined' &&
		typeof window.CSS?.supports === 'function' &&
		window.CSS.supports('anchor-name: --a');
	if (supportsAnchor) return;
	const rect = bar.getBoundingClientRect();
	const popHeight = Math.min(240, window.innerHeight * 0.4);
	const spaceBelow = window.innerHeight - rect.bottom;
	const top = spaceBelow >= 160 || spaceBelow >= rect.top ? rect.bottom + 4 : Math.max(8, rect.top - popHeight - 4);
	pop.style.setProperty('--fallback-popover-top', `${Math.round(top)}px`);
	pop.style.setProperty('--fallback-popover-left', `${Math.round(rect.left)}px`);
	pop.style.setProperty('--fallback-popover-width', `${Math.round(rect.width)}px`);
}

function openPresearch() {
	if (filteredSuggestions.value.length === 0) {
		closePresearch();
		return;
	}
	isPresearchOpen.value = true;
	highlightedIdx.value = 0;
	nextTick(() => {
		const pop = presearchPopoverRef.value as any;
		if (!pop) return;
		positionPopoverFallback();
		if (typeof pop.showPopover === 'function') {
			try {
				if (!pop.matches(':popover-open')) pop.showPopover();
			} catch (_e) {}
		}
	});
}

function closePresearch() {
	isPresearchOpen.value = false;
	const pop = presearchPopoverRef.value as any;
	if (pop && typeof pop.hidePopover === 'function') {
		try {
			if (pop.matches(':popover-open')) pop.hidePopover();
		} catch (_e) {}
	}
}

let suppressNextFocusOpen = false;
function onTraitInputFocus() {
	if (suppressNextFocusOpen) {
		suppressNextFocusOpen = false;
		return;
	}
	openPresearch();
}
function focusTraitInputQuietly() {
	suppressNextFocusOpen = true;
	traitInputRef.value?.focus();
}

function toggleTraitInput() {
	isTraitInputOpen.value = !isTraitInputOpen.value;
	if (isTraitInputOpen.value) {
		nextTick(() => {
			traitInputRef.value?.focus();
			if (filteredSuggestions.value.length > 0) {
				openPresearch();
			}
		});
	} else {
		closePresearch();
		traitQuery.value = '';
	}
}

function onTraitInput() {
	if (filteredSuggestions.value.length > 0) {
		openPresearch();
	} else {
		closePresearch();
	}
}

function selectSuggestion(sug: FlattenedTraitSuggestion) {
	addWordToPool(activePool.value, currentPoolId.value, sug.name, 'trait');
	const payloads = sug.dice.map((size) => ({
		size,
		qty: 1,
		source: sug.name,
		hitches: sug.hitches,
		keepsExtra: sug.keepsExtra,
	}));
	addDiceToTargetPool(activePool.value, payloads, true);
	traitQuery.value = '';
	closePresearch();
	focusTraitInputQuietly();
}

function hinderSuggestion(sug: FlattenedTraitSuggestion) {
	const alt = sug.altRoll;
	const dieSize = alt?.die || 4;
	const ppDelta = alt ? alt.ppDelta : 1;
	const altTag = alt?.label || 'Hinder';
	const sourceLabel = `${sug.name} (${altTag})`;
	addWordToPool(activePool.value, currentPoolId.value, sourceLabel, 'hinder');
	addDiceToTargetPool(
		activePool.value,
		{
			size: dieSize,
			qty: 1,
			source: sourceLabel,
			hitches: sug.hitches,
			keepsExtra: sug.keepsExtra,
			ppDelta: activePoolTracksPP.value ? ppDelta : 0,
			ppCommitted: false,
		},
		true,
	);
	traitQuery.value = '';
	closePresearch();
	focusTraitInputQuietly();
}

function submitTraitInput() {
	const raw = traitQuery.value.trim();
	if (!raw) return;
	const parsed = parseTraitShorthand(raw);
	if (parsed.label) {
		addWordToPool(activePool.value, currentPoolId.value, parsed.label, 'trait');
	}
	if (parsed.dice) {
		addDiceToTargetPool(
			activePool.value,
			{
				size: parsed.dice.size,
				qty: parsed.dice.count,
				source: parsed.label || '',
				hitches: 1,
			},
			true,
		);
	}
	traitQuery.value = '';
	closePresearch();
	focusTraitInputQuietly();
}

function onTraitInputKeydown(e: KeyboardEvent) {
	if (e.key === 'Escape') {
		e.preventDefault();
		if (isPresearchOpen.value) {
			closePresearch();
		} else {
			isTraitInputOpen.value = false;
			traitQuery.value = '';
		}
		return;
	}
	if (e.key === 'ArrowDown' && isPresearchOpen.value && filteredSuggestions.value.length > 0) {
		e.preventDefault();
		highlightedIdx.value = (highlightedIdx.value + 1) % filteredSuggestions.value.length;
		return;
	}
	if (e.key === 'ArrowUp' && isPresearchOpen.value && filteredSuggestions.value.length > 0) {
		e.preventDefault();
		highlightedIdx.value =
			(highlightedIdx.value - 1 + filteredSuggestions.value.length) % filteredSuggestions.value.length;
		return;
	}
	if (e.key === 'Enter') {
		e.preventDefault();
		if (e.isComposing || e.keyCode === 229) {
			return;
		}
		if (parsedShorthand.value.dice) {
			submitTraitInput();
			return;
		}
		const exact = filteredSuggestions.value.find((s) => s.name.toLowerCase() === traitQuery.value.trim().toLowerCase());
		if (exact) {
			selectSuggestion(exact);
			return;
		}
		submitTraitInput();
	}
}

function handleDocumentPointerDown(e: Event) {
	if (!isPresearchOpen.value) return;
	const target = e.target as Node | null;
	if (!target) return;
	if (traitInputBarRef.value?.contains(target) || presearchPopoverRef.value?.contains(target)) return;
	closePresearch();
}

function handleWindowReposition() {
	if (isPresearchOpen.value) positionPopoverFallback();
}

function addScalePill() {
	addWordToPool(activePool.value, currentPoolId.value, 'Scale', 'scale');
}

function removeWordPill(id: string) {
	removeWordFromPool(activePool.value, currentPoolId.value, id);
}

// Quick Add & Selected Die Action Bar (decoupled from Word Bank)
function addQuickDie(size: number) {
	const sep = isSeparateAddMode.value;
	addDiceToTargetPool(
		activePool.value,
		{
			size,
			qty: 1,
			source: sep ? 'Separate' : '',
			hitches: sep ? 0 : 1,
		},
		true,
	);
}

function stepDownSelected() {
	const idx = selectedDieIndex.value;
	if (idx === -1) return;
	if (typeof activePool.value?.stepDownAt === 'function') {
		activePool.value.stepDownAt(idx);
	} else {
		const item = stagedDice.value[idx];
		const cur = DIE_SIZES.indexOf(item.size);
		if (cur > 0) item.size = DIE_SIZES[cur - 1];
	}
	isRolled.value = false;
}

function stepUpSelected() {
	const idx = selectedDieIndex.value;
	if (idx === -1) return;
	if (typeof activePool.value?.stepUpAt === 'function') {
		activePool.value.stepUpAt(idx);
	} else {
		const item = stagedDice.value[idx];
		const cur = DIE_SIZES.indexOf(item.size);
		if (cur !== -1 && cur < DIE_SIZES.length - 1) item.size = DIE_SIZES[cur + 1];
	}
	isRolled.value = false;
}

function duplicateSelected() {
	const idx = selectedDieIndex.value;
	if (idx === -1) return;
	if (typeof activePool.value?.duplicateAt === 'function') {
		const created = activePool.value.duplicateAt(idx);
		if (created) selectedDieId.value = created.id;
	} else {
		const item = stagedDice.value[idx];
		const clone = { ...item, id: getUuid(), ppDelta: 0, ppCommitted: true };
		stagedDice.value.splice(idx + 1, 0, clone);
		selectedDieId.value = clone.id;
	}
	isRolled.value = false;
}

function removeSelected() {
	const idx = selectedDieIndex.value;
	if (idx === -1) return;
	if (typeof activePool.value?.removeAt === 'function') {
		activePool.value.removeAt(idx);
	} else {
		stagedDice.value.splice(idx, 1);
	}
	selectedDieId.value = null;
	isRolled.value = false;
}

function clearPoolById(poolId: string) {
	const entry = effectivePools.value.find((p) => p.id === poolId);
	const target = entry?.pool;
	if (target && typeof target.clear === 'function') {
		target.clear();
	} else if (target) {
		if (Array.isArray(target.items)) target.items = [];
		if (Array.isArray(target.wordBank)) target.wordBank = [];
	}
	localWordsByPool.value[poolId] = [];
	keepOffsetByPool.value[poolId] = 0;
	ppKeepBonusByPool.value[poolId] = 0;
	delete evaluationsByPool.value[poolId];
	rolledPoolOrder.value = rolledPoolOrder.value.filter((id) => id !== poolId);
	selectedDieId.value = null;
}

function clearActivePool() {
	clearPoolById(currentPoolId.value);
	if (orderedEvaluations.value.length === 0) {
		isRolled.value = false;
		dicePoolOutput.value = '';
	}
}

function clearPool() {
	for (const entry of effectivePools.value) {
		clearPoolById(entry.id);
	}
	evaluationsByPool.value = {};
	rolledPoolOrder.value = [];
	isRolled.value = false;
	isContestRoll.value = false;
	dicePoolOutput.value = '';
	closeOutcomeDialog();
}

// Pre-Roll PP Spend Bar (§5.3)
function spendPPForKeep() {
	if (effectivePlotPoints.value < 1) return;
	adjustPP(-1);
	const id = currentPoolId.value;
	addWordToPool(activePool.value, id, 'PP: +1 Keep', 'pp');
	ppKeepBonusByPool.value[id] = getPoolPpKeepBonus(id) + 1;
	if (isRolled.value) reEvaluateRoll();
}

function spendPPForD6() {
	if (effectivePlotPoints.value < 1) return;
	adjustPP(-1);
	addWordToPool(activePool.value, currentPoolId.value, 'PP: +d6', 'pp');
	addDiceToTargetPool(
		activePool.value,
		{
			size: 6,
			qty: 1,
			source: 'PP: +d6',
			hitches: 1,
		},
		true,
	);
}

// Roll Evaluation Engine
const isRolled = ref(false);
const isContestRoll = ref(false);
const evaluationsByPool = ref<Record<string, PoolEvaluation>>({});
const rolledPoolOrder = ref<string[]>([]);
const dicePoolOutput = ref('');
const rollDialogRef = ref<HTMLDialogElement | null>(null);
const isDialogOpen = ref(false);

const orderedEvaluations = computed<PoolEvaluation[]>(() =>
	rolledPoolOrder.value.map((id) => evaluationsByPool.value[id]).filter((ev): ev is PoolEvaluation => Boolean(ev)),
);

const playerEvaluation = computed<PoolEvaluation | null>(() => {
	if (!isMultiPoolMode.value) return evaluationsByPool.value.player || null;
	return orderedEvaluations.value[0] || null;
});

const oppEvaluation = computed<PoolEvaluation | null>(() => {
	if (!isMultiPoolMode.value) return evaluationsByPool.value.opposition || null;
	return orderedEvaluations.value[1] || null;
});

const poolPlotPointsMap = computed<Record<string, number | null>>(() => {
	const map: Record<string, number | null> = {};
	for (const entry of effectivePools.value) {
		map[entry.id] = doesPoolTrackPP(entry) ? getPoolPP(entry) : null;
	}
	return map;
});

const primaryEval = computed<PoolEvaluation | null>(() => {
	if (isContestRoll.value) return orderedEvaluations.value[0] || null;
	const activeEv = evaluationsByPool.value[currentPoolId.value];
	return activeEv || orderedEvaluations.value[0] || null;
});

const lastRollResults = computed<RollResult[]>(() => primaryEval.value?.results || []);
const bestTotalInfo = computed(() => primaryEval.value?.bestTotalInfo || null);
const bestEffectInfo = computed(() => primaryEval.value?.bestEffectInfo || null);
const manualTotal = computed(() => primaryEval.value?.manualTotal || 0);
const manualEffectDie = computed(() => primaryEval.value?.manualEffectDie || 'd4');
const totalHitches = computed(() => primaryEval.value?.totalHitches || 0);
const isBotch = computed(() => Boolean(primaryEval.value?.isBotch));

const contestSummary = computed(() => {
	if (!isContestRoll.value || orderedEvaluations.value.length < 2) return null;
	const pEval = orderedEvaluations.value[0];
	const challengers = orderedEvaluations.value.slice(1);
	const oEval = challengers.reduce((best, cur) => {
		const curScore = cur.isBotch ? 0 : cur.manualTotal;
		const bestScore = best.isBotch ? 0 : best.manualTotal;
		return curScore > bestScore ? cur : best;
	}, challengers[0]);
	return {
		playerLabel: pEval.label.replace(/\s+Pool$/i, '') || 'Player',
		oppLabel: oEval.label.replace(/\s+Pool$/i, '') || 'Opp',
		playerTotal: pEval.isBotch ? 0 : pEval.manualTotal,
		playerEffect: pEval.manualEffectDie,
		oppTotal: oEval.isBotch ? 0 : oEval.manualTotal,
		oppEffect: oEval.manualEffectDie,
	};
});

function buildRawResults(items: DiceItem[]): RollResult[] {
	const actionItems = items.filter((item) => !isExempt(item));
	const thresholdMax = actionItems.reduce((top, item) => Math.max(top, itemHitches(item)), 1);

	return items.map((item) => {
		const val = Math.floor(Math.random() * item.size) + 1;
		const h = itemHitches(item);
		const threshold = h === 0 ? 0 : thresholdMax;
		const isHitch = threshold > 0 && val <= threshold;
		return {
			id: getUuid(),
			size: item.size,
			value: val,
			source: item.source || '',
			isScale: Boolean(item.isScale),
			hitches: h,
			isHitch,
			hitchActivated: false,
			manualRole: 'none',
		};
	});
}

function poolDisplayLabel(entry: NamedPool): string {
	if (!isMultiPoolMode.value) {
		return entry.id === 'opposition' ? 'Opposition Pool' : 'Player Pool';
	}
	const base = resolveEntryName(entry);
	return /\bpool$/i.test(base) ? base : `${base} Pool`;
}

function evaluatePoolResults(
	entry: NamedPool,
	side: 'player' | 'opposition',
	results: RollResult[],
	items: DiceItem[],
	words: WordBankItem[],
	combineSep: boolean,
	ppKeep: number,
	offset: number,
	preserveManualRoles = false,
): PoolEvaluation {
	const stats = computePoolKeepStats(items, words, combineSep, ppKeep, offset);
	const keepCount = stats.effectiveKeep;
	const actionResults = results.filter((r) => r.hitches > 0);
	const separateResults = results.filter((r) => r.hitches === 0);
	const hasSeparate = separateResults.length > 0;
	const label = poolDisplayLabel(entry);

	const separateGroups: SeparateGroup[] = [];
	let bestTotal: any = null;
	let bestEffect: any = null;
	let log = '';
	const hitchesTotal = results.filter((r) => r.isHitch).length;
	const botch = results.length > 0 && results.every((r) => r.isHitch);

	if (!hasSeparate || combineSep) {
		const eligible = results.filter((r) => !r.isHitch);
		if (eligible.length === 0) {
			bestTotal = { isBotch: true };
			bestEffect = { isBotch: true };
			log = `${label} (Keep ${keepCount}): Botch`;
		} else {
			const sortedForTotal = [...eligible].sort((a, b) => b.value - a.value);
			const totalDice = sortedForTotal.slice(0, keepCount);
			const remainingForEffect = sortedForTotal.slice(keepCount).sort((a, b) => b.size - a.size);
			const effectDie = remainingForEffect.length > 0 ? 'd' + remainingForEffect[0].size : 'd4';
			const totalSum = totalDice.reduce((sum, d) => sum + d.value, 0);
			const totalFormula = totalDice.map((d) => d.value).join(' + ');

			bestTotal = { total: totalSum, formula: totalFormula, effect: effectDie, dice: totalDice };

			const sortedForEffect = [...eligible].sort((a, b) => (a.size !== b.size ? b.size - a.size : a.value - b.value));
			const effectBest = sortedForEffect.length > 0 ? 'd' + sortedForEffect[0].size : 'd4';
			const totalDiceForEffect = sortedForEffect
				.slice(1)
				.sort((a, b) => b.value - a.value)
				.slice(0, keepCount);
			const totalSumForEffect = totalDiceForEffect.reduce((sum, d) => sum + d.value, 0);
			const formulaForEffect = totalDiceForEffect.map((d) => d.value).join(' + ');

			bestEffect = { total: totalSumForEffect, formula: formulaForEffect, effect: effectBest };

			if (!preserveManualRoles) {
				for (const r of results) {
					if (r.isHitch) r.manualRole = 'none';
					else if (totalDice.some((c) => c.id === r.id)) r.manualRole = 'total';
					else if (remainingForEffect.length > 0 && remainingForEffect[0].id === r.id) r.manualRole = 'effect';
					else r.manualRole = 'none';
				}
			}

			log = `${label} (Keep ${keepCount}): ${results.map((r) => 'd' + r.size + ':' + r.value + (r.isHitch ? '(H)' : '')).join(', ')} | Best ${totalSum} (${effectDie}) | Hitches ${hitchesTotal}`;
		}
	} else {
		const actionKeep = Math.max(1, 2 + stats.actionKeepsExtra + stats.scaleWords + ppKeep + offset);
		const actionEligible = actionResults.filter((r) => !r.isHitch);
		let actionTotal = 0;
		let actionEffect = 'd4';
		let actionTotalDice: RollResult[] = [];
		let actionRemaining: RollResult[] = [];

		if (actionEligible.length > 0) {
			const sortedAction = [...actionEligible].sort((a, b) => b.value - a.value);
			actionTotalDice = sortedAction.slice(0, actionKeep);
			actionRemaining = sortedAction.slice(actionKeep).sort((a, b) => b.size - a.size);
			actionEffect = actionRemaining.length > 0 ? 'd' + actionRemaining[0].size : 'd4';
			actionTotal = actionTotalDice.reduce((sum, d) => sum + d.value, 0);
		}

		const groupMap: Record<string, RollResult[]> = {};
		for (const r of separateResults) {
			const name = (r.source || 'Separate').trim() || 'Separate';
			if (!groupMap[name]) groupMap[name] = [];
			groupMap[name].push(r);
		}

		let totalSeparateBonus = 0;
		for (const [name, dice] of Object.entries(groupMap)) {
			const sortedSep = [...dice].sort((a, b) => b.value - a.value);
			const keptDie = sortedSep[0];
			totalSeparateBonus += keptDie.value;
			if (!preserveManualRoles) {
				for (const d of dice) {
					d.manualRole = d.id === keptDie.id ? 'total' : 'none';
				}
			}
			separateGroups.push({ name, dice, keptDie, bonus: keptDie.value });
		}

		if (!preserveManualRoles) {
			for (const r of actionResults) {
				if (r.isHitch) r.manualRole = 'none';
				else if (actionTotalDice.some((c) => c.id === r.id)) r.manualRole = 'total';
				else if (actionRemaining.length > 0 && actionRemaining[0].id === r.id) r.manualRole = 'effect';
				else r.manualRole = 'none';
			}
		}

		const grandTotal = actionTotal + totalSeparateBonus;
		let actionEffectBestDie = 'd4';
		let actionEffectTotal = 0;
		if (actionEligible.length > 0) {
			const sortedActionForEffect = [...actionEligible].sort((a, b) =>
				a.size !== b.size ? b.size - a.size : a.value - b.value,
			);
			actionEffectBestDie = 'd' + sortedActionForEffect[0].size;
			const actionEffectTotalDice = sortedActionForEffect
				.slice(1)
				.sort((a, b) => b.value - a.value)
				.slice(0, actionKeep);
			actionEffectTotal = actionEffectTotalDice.reduce((sum, d) => sum + d.value, 0);
		}

		bestTotal = {
			total: grandTotal,
			actionTotal,
			separateBonus: totalSeparateBonus,
			formula: `${actionTotal} + ${totalSeparateBonus}`,
			effect: actionEffect,
		};
		bestEffect = {
			total: actionEffectTotal + totalSeparateBonus,
			actionTotal: actionEffectTotal,
			separateBonus: totalSeparateBonus,
			formula: `${actionEffectTotal} + ${totalSeparateBonus}`,
			effect: actionEffectBestDie,
		};
		log = `${label} (Keep ${actionKeep} + Separate): Grand ${grandTotal} (${actionEffect}) | Hitches ${hitchesTotal}`;
	}

	const mAction = results.filter((r) => r.hitches > 0 && r.manualRole === 'total').reduce((s, r) => s + r.value, 0);
	const mSep = results.filter((r) => r.hitches === 0 && r.manualRole === 'total').reduce((s, r) => s + r.value, 0);
	const mTotal = results.filter((r) => r.manualRole === 'total').reduce((s, r) => s + r.value, 0);
	const mEffects = results.filter((r) => r.manualRole === 'effect').sort((a, b) => b.size - a.size);
	const mEffectDie = mEffects.length > 0 ? 'd' + mEffects[0].size : 'd4';

	return {
		poolId: entry.id,
		side,
		label,
		keep: keepCount,
		combineSeparate: combineSep,
		results,
		actionResults,
		separateGroups,
		bestTotalInfo: bestTotal,
		bestEffectInfo: bestEffect,
		manualTotal: mTotal,
		manualActionTotal: mAction,
		manualSeparateBonus: mSep,
		manualEffectDie: mEffectDie,
		totalHitches: hitchesTotal,
		isBotch: botch,
		log,
	};
}

function updateCombinedLog() {
	const parts: string[] = [];
	for (const ev of orderedEvaluations.value) {
		parts.push(ev.log);
	}
	if (isContestRoll.value && contestSummary.value) {
		const diff = contestSummary.value.playerTotal - contestSummary.value.oppTotal;
		parts.push(`Contest Margin: ${diff >= 0 ? '+' + diff : diff}`);
	}
	dicePoolOutput.value = parts.join('\n');
}

function buildSideLogSummary(ev: PoolEvaluation | null | undefined): RollLogSideSummary | undefined {
	if (!ev) return undefined;
	return {
		total: ev.isBotch ? 0 : ev.manualTotal,
		effectDie: ev.manualEffectDie,
		hitches: ev.totalHitches,
		isBotch: ev.isBotch,
		diceSummary: ev.results.map((r) => `d${r.size}:${r.value}${r.isHitch ? '!' : ''}`).join(' '),
		log: ev.log,
	};
}

function buildPoolsLogSummary(): RollLogPoolSummary[] {
	return orderedEvaluations.value
		.map((ev) => {
			const base = buildSideLogSummary(ev);
			if (!base) return null;
			return {
				poolId: ev.poolId || ev.side,
				label: ev.label.replace(/\s+Pool$/i, '') || ev.label,
				...base,
			};
		})
		.filter((x): x is RollLogPoolSummary => Boolean(x));
}

function resolveLogCharacterName(): string {
	if (isMultiPoolMode.value && orderedEvaluations.value.length > 0) {
		const firstLabel = orderedEvaluations.value[0].label.replace(/\s+Pool$/i, '').trim();
		if (firstLabel) return firstLabel;
	}
	return String(props.character?.name || 'Sheet').trim() || 'Sheet';
}

function recordRollLogEntry() {
	const entry: RollLogEntry = {
		id: getUuid(),
		timestamp: Date.now(),
		characterName: resolveLogCharacterName(),
		contest: isContestRoll.value,
		player: buildSideLogSummary(playerEvaluation.value),
		opposition: buildSideLogSummary(oppEvaluation.value),
		pools: buildPoolsLogSummary(),
		summaryText: dicePoolOutput.value,
	};
	rollLog.value = [entry, ...rollLog.value].slice(0, MAX_ROLL_LOG_ENTRIES);
	activeLogEntryId.value = entry.id;
	saveRollLog(rollLog.value);
}

function syncActiveRollLogEntry() {
	if (!activeLogEntryId.value) return;
	const idx = rollLog.value.findIndex((e) => e.id === activeLogEntryId.value);
	if (idx === -1) return;
	const prev = rollLog.value[idx];
	const nextEntry: RollLogEntry = {
		...prev,
		contest: isContestRoll.value,
		player: buildSideLogSummary(playerEvaluation.value),
		opposition: buildSideLogSummary(oppEvaluation.value),
		pools: buildPoolsLogSummary(),
		summaryText: dicePoolOutput.value,
	};
	const updated = [...rollLog.value];
	updated[idx] = nextEntry;
	rollLog.value = updated;
	saveRollLog(rollLog.value);
}

async function copyTextSafe(text: string, markerId: string) {
	try {
		if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
			await navigator.clipboard.writeText(text);
		}
	} catch {
		// Ignore clipboard permission errors in headless/unfocused environments
	}
	copiedEntryId.value = markerId;
	setTimeout(() => {
		if (copiedEntryId.value === markerId) copiedEntryId.value = null;
	}, 1500);
}

function copyLogEntry(entry: RollLogEntry) {
	const text = `[${entry.characterName}] ${entry.summaryText}`;
	copyTextSafe(text, entry.id);
}

function copyAllLogEntries() {
	const text = rollLog.value
		.map((entry) => `[${formatLogTime(entry.timestamp)} | ${entry.characterName}]\n${entry.summaryText}`)
		.join('\n\n');
	copyTextSafe(text, '__all__');
}

function clearRollLog() {
	rollLog.value = [];
	activeLogEntryId.value = null;
	saveRollLog([]);
}

function formatLogTime(ts: number): string {
	try {
		return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
	} catch {
		return '';
	}
}

function reEvaluateRoll(preserveManualRoles = false) {
	const nextMap: Record<string, PoolEvaluation> = {};
	for (let i = 0; i < rolledPoolOrder.value.length; i++) {
		const poolId = rolledPoolOrder.value[i];
		const prevEval = evaluationsByPool.value[poolId];
		const entry = effectivePools.value.find((p) => p.id === poolId);
		if (!prevEval || !entry) continue;
		const poolIdx = effectivePools.value.findIndex((p) => p.id === poolId);
		const side: 'player' | 'opposition' = !isMultiPoolMode.value
			? poolId === 'opposition'
				? 'opposition'
				: 'player'
			: i === 0
				? 'player'
				: 'opposition';
		nextMap[poolId] = evaluatePoolResults(
			entry,
			side,
			prevEval.results,
			itemsForPool(entry.pool),
			wordsForPool(entry.pool, poolId),
			getPoolCombineSeparate(poolId, Math.max(0, poolIdx)),
			getPoolPpKeepBonus(poolId),
			getPoolKeepOffset(poolId),
			preserveManualRoles,
		);
	}
	evaluationsByPool.value = nextMap;
	updateCombinedLog();
	syncActiveRollLogEntry();
}

const nonEmptyPools = computed<NamedPool[]>(() =>
	effectivePools.value.filter((entry) => itemsForPool(entry.pool).length > 0),
);

const rollButtonLabel = computed(() => {
	const count = nonEmptyPools.value.length;
	if (count >= 2) return 'ROLL CONTEST';
	if (count === 1 && nonEmptyPools.value[0].id === 'opposition') return 'ROLL OPPOSITION';
	return 'ROLL POOL';
});

const hasAnyDiceToRoll = computed(() => nonEmptyPools.value.length > 0);

function isMobileViewport(): boolean {
	return Boolean(typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(max-width: 768px)').matches);
}

function openOutcomeDialog() {
	const dialog = rollDialogRef.value;
	if (!dialog) return;
	dialog.removeAttribute('data-closing');
	if (!dialog.open) {
		if (typeof dialog.showModal === 'function') {
			dialog.showModal();
		} else {
			dialog.setAttribute('open', '');
		}
	}
	isDialogOpen.value = true;
}

// Top-layer exit animation fallback (modern-web-guidance animate-to-from-top-layer)
let cachedCanTransitionDisplay: boolean | undefined;
function canTransitionDisplay(): boolean {
	if (cachedCanTransitionDisplay !== undefined) return cachedCanTransitionDisplay;
	if (
		typeof window === 'undefined' ||
		!window.CSS?.supports?.('transition-behavior', 'allow-discrete') ||
		!document.body
	) {
		cachedCanTransitionDisplay = false;
		return false;
	}
	const probe = document.createElement('div');
	probe.style.cssText = 'transition: display 1s allow-discrete; display: block;';
	document.body.appendChild(probe);
	getComputedStyle(probe).display;
	probe.style.display = 'none';
	cachedCanTransitionDisplay = getComputedStyle(probe).display === 'block';
	probe.remove();
	return cachedCanTransitionDisplay;
}

function supportsTopLayerExit(): boolean {
	return Boolean(typeof window !== 'undefined' && window.CSS?.supports?.('overlay', 'auto') && canTransitionDisplay());
}

async function closeOutcomeDialog() {
	const dialog = rollDialogRef.value;
	if (!dialog || !dialog.open) {
		isDialogOpen.value = false;
		return;
	}
	if (!supportsTopLayerExit() && typeof dialog.getAnimations === 'function') {
		dialog.setAttribute('data-closing', '');
		const animations = dialog.getAnimations({ subtree: true });
		if (animations.length > 0) {
			await Promise.race([
				Promise.allSettled(animations.map((a) => a.finished)),
				new Promise((r) => setTimeout(r, 350)),
			]);
		}
		if (!dialog.hasAttribute('data-closing')) return;
		dialog.removeAttribute('data-closing');
	}
	if (typeof dialog.close === 'function') {
		dialog.close();
	} else {
		dialog.removeAttribute('open');
	}
	isDialogOpen.value = false;
}

function onDialogClose() {
	isDialogOpen.value = false;
}

function onDialogCancel(event: Event) {
	event.preventDefault();
	closeOutcomeDialog();
}

// Backdrop dismiss fallback for browsers without native closedby="any"
let dialogPressedOutside = false;
function isOutsideDialogRect(e: PointerEvent, dialog: HTMLDialogElement): boolean {
	const r = dialog.getBoundingClientRect();
	return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
}
function onDialogPointerDown(e: PointerEvent) {
	const dialog = rollDialogRef.value;
	if (!dialog || 'closedBy' in HTMLDialogElement.prototype) return;
	dialogPressedOutside = isOutsideDialogRect(e, dialog);
}
function onDialogPointerUp(e: PointerEvent) {
	const dialog = rollDialogRef.value;
	if (!dialog || 'closedBy' in HTMLDialogElement.prototype) return;
	if (dialogPressedOutside && isOutsideDialogRect(e, dialog)) {
		closeOutcomeDialog();
	}
	dialogPressedOutside = false;
}

function orderedParticipatingPools(): NamedPool[] {
	const list = [...nonEmptyPools.value];
	if (!isMultiPoolMode.value || list.length <= 1) return list;
	const active = activePoolEntry.value;
	if (active && active.id !== 'opposition') {
		const idx = list.findIndex((p) => p.id === active.id);
		if (idx > 0) {
			const [picked] = list.splice(idx, 1);
			list.unshift(picked);
		}
	}
	return list;
}

function roll(opts?: { forceDialog?: boolean }) {
	const participating = orderedParticipatingPools();
	if (participating.length === 0) return;

	// Settle uncommitted Hinder / sheet PP deltas per pool owner at roll time
	for (const entry of participating) {
		let ppToSettle = 0;
		for (const item of itemsForPool(entry.pool)) {
			if (!item.ppCommitted && item.ppDelta) {
				ppToSettle += Number(item.ppDelta) || 0;
			}
			item.ppCommitted = true;
		}
		if (ppToSettle !== 0 && doesPoolTrackPP(entry)) {
			adjustPoolPP(entry.id, ppToSettle);
		}
	}

	isContestRoll.value = participating.length >= 2;
	const nextEvals: Record<string, PoolEvaluation> = {};
	const nextOrder: string[] = [];

	for (let i = 0; i < participating.length; i++) {
		const entry = participating[i];
		const items = itemsForPool(entry.pool);
		const raw = buildRawResults(items);
		const poolIdx = effectivePools.value.findIndex((p) => p.id === entry.id);
		const side: 'player' | 'opposition' = !isMultiPoolMode.value
			? entry.id === 'opposition'
				? 'opposition'
				: 'player'
			: i === 0
				? 'player'
				: 'opposition';
		nextEvals[entry.id] = evaluatePoolResults(
			entry,
			side,
			raw,
			items,
			wordsForPool(entry.pool, entry.id),
			getPoolCombineSeparate(entry.id, Math.max(0, poolIdx)),
			getPoolPpKeepBonus(entry.id),
			getPoolKeepOffset(entry.id),
		);
		nextOrder.push(entry.id);
	}

	evaluationsByPool.value = nextEvals;
	rolledPoolOrder.value = nextOrder;
	isRolled.value = true;
	updateCombinedLog();
	recordRollLogEntry();

	if (opts?.forceDialog || isMobileViewport()) {
		nextTick(() => openOutcomeDialog());
	}
}

function resolveEvalTarget(targetId: string): { poolId: string; ev: PoolEvaluation | null } {
	if (evaluationsByPool.value[targetId]) {
		return { poolId: targetId, ev: evaluationsByPool.value[targetId] };
	}
	if (targetId === 'opposition' && orderedEvaluations.value[1]) {
		const ev = orderedEvaluations.value[1];
		return { poolId: ev.poolId || 'opposition', ev };
	}
	const first = orderedEvaluations.value[0] || null;
	return { poolId: first?.poolId || targetId, ev: first };
}

function handleCycleRole(targetId: string, dieId: string) {
	const { ev: targetEval } = resolveEvalTarget(targetId);
	if (!targetEval) return;
	const die = targetEval.results.find((d) => d.id === dieId);
	if (!die || die.isHitch) return;

	if (!targetEval.combineSeparate && die.hitches === 0) {
		const group = targetEval.separateGroups.find((g) => g.dice.some((d) => d.id === die.id));
		if (group) {
			if (die.manualRole === 'total') {
				die.manualRole = 'none';
			} else {
				for (const d of group.dice) {
					d.manualRole = d.id === die.id ? 'total' : 'none';
				}
			}
			reEvaluateRoll(true);
			return;
		}
	}

	if (die.manualRole === 'none') die.manualRole = 'total';
	else if (die.manualRole === 'total') die.manualRole = 'effect';
	else die.manualRole = 'none';
	reEvaluateRoll(true);
}

function handleApplyPreset(targetId: string, preset: 'total' | 'effect') {
	const { poolId, ev: targetEval } = resolveEvalTarget(targetId);
	if (!targetEval || targetEval.isBotch) return;
	const entry = effectivePools.value.find((p) => p.id === poolId);
	if (!entry) return;

	if (preset === 'total') {
		const poolIdx = effectivePools.value.findIndex((p) => p.id === poolId);
		const posIdx = rolledPoolOrder.value.indexOf(poolId);
		const side: 'player' | 'opposition' = !isMultiPoolMode.value
			? poolId === 'opposition'
				? 'opposition'
				: 'player'
			: posIdx <= 0
				? 'player'
				: 'opposition';
		evaluationsByPool.value[poolId] = evaluatePoolResults(
			entry,
			side,
			targetEval.results,
			itemsForPool(entry.pool),
			wordsForPool(entry.pool, poolId),
			getPoolCombineSeparate(poolId, Math.max(0, poolIdx)),
			getPoolPpKeepBonus(poolId),
			getPoolKeepOffset(poolId),
			false,
		);
		updateCombinedLog();
		syncActiveRollLogEntry();
		return;
	}

	// Apply Best Effect
	const ppKeep = getPoolPpKeepBonus(poolId);
	const offset = getPoolKeepOffset(poolId);
	if (!targetEval.combineSeparate && targetEval.separateGroups.length > 0) {
		const stats = computePoolKeepStats(
			itemsForPool(entry.pool),
			wordsForPool(entry.pool, poolId),
			false,
			ppKeep,
			offset,
		);
		const actionKeep = Math.max(1, 2 + stats.actionKeepsExtra + stats.scaleWords + ppKeep + offset);
		const actionEligible = targetEval.actionResults
			.filter((r) => !r.isHitch)
			.sort((a, b) => (a.size !== b.size ? b.size - a.size : a.value - b.value));
		const effectSlice = actionEligible.slice(0, 1);
		const totalSlice = actionEligible
			.slice(1)
			.sort((a, b) => b.value - a.value)
			.slice(0, actionKeep);

		for (const r of targetEval.actionResults) {
			if (effectSlice.some((e) => e.id === r.id)) r.manualRole = 'effect';
			else if (totalSlice.some((t) => t.id === r.id)) r.manualRole = 'total';
			else r.manualRole = 'none';
		}
		for (const g of targetEval.separateGroups) {
			if (!g.dice.some((d) => d.manualRole === 'total') && g.dice.length > 0) {
				const topSep = [...g.dice].sort((a, b) => b.value - a.value)[0];
				topSep.manualRole = 'total';
			}
		}
	} else {
		const eligible = targetEval.results
			.filter((r) => !r.isHitch)
			.sort((a, b) => (a.size !== b.size ? b.size - a.size : a.value - b.value));
		const effectSlice = eligible.slice(0, 1);
		const totalSlice = eligible
			.slice(1)
			.sort((a, b) => b.value - a.value)
			.slice(0, targetEval.keep);
		for (const r of targetEval.results) {
			if (effectSlice.some((e) => e.id === r.id)) r.manualRole = 'effect';
			else if (totalSlice.some((t) => t.id === r.id)) r.manualRole = 'total';
			else r.manualRole = 'none';
		}
	}
	reEvaluateRoll(true);
}

function findPrimaryPPSpender(): NamedPool | null {
	if (activePoolTracksPP.value && getPoolPP(activePoolEntry.value) >= 1) {
		return activePoolEntry.value;
	}
	for (const id of rolledPoolOrder.value) {
		const p = effectivePools.value.find((entry) => entry.id === id);
		if (p && doesPoolTrackPP(p) && getPoolPP(p) >= 1) return p;
	}
	return ppBearingPools.value.find((p) => getPoolPP(p) >= 1) || ppBearingPools.value[0] || null;
}

// Interactive Post-Roll Hitch Activation (§5.4)
function handleActivateHitch(targetId: string, dieId: string) {
	const { poolId, ev: targetEval } = resolveEvalTarget(targetId);
	if (!targetEval) return;
	const die = targetEval.results.find((d) => d.id === dieId);
	if (!die || !die.isHitch || die.hitchActivated) return;
	const entry = effectivePools.value.find((p) => p.id === poolId);

	if (entry && doesPoolTrackPP(entry)) {
		die.hitchActivated = true;
		adjustPoolPP(entry.id, 1);
		addWordToPool(entry.pool, entry.id, 'Complication d6', 'hinder');
	} else {
		const spender = findPrimaryPPSpender();
		if (!spender || getPoolPP(spender) < 1) return;
		die.hitchActivated = true;
		adjustPoolPP(spender.id, -1);
		addWordToPool(spender.pool, spender.id, 'Opp Hitch Asset d6', 'asset');
	}
}

const hitchSpenderPlotPoints = computed<number>(() => {
	const spender = findPrimaryPPSpender();
	return spender ? getPoolPP(spender) : 0;
});

function getDieDisplayValue(value: number) {
	return characterCurioFunctions.renderDieconSVG(value, false, '', null);
}

onMounted(() => {
	if (typeof document !== 'undefined') {
		document.addEventListener('pointerdown', handleDocumentPointerDown);
	}
	if (typeof window !== 'undefined') {
		window.addEventListener('resize', handleWindowReposition);
		window.addEventListener('scroll', handleWindowReposition, true);
	}
});

onBeforeUnmount(() => {
	if (typeof document !== 'undefined') {
		document.removeEventListener('pointerdown', handleDocumentPointerDown);
	}
	if (typeof window !== 'undefined') {
		window.removeEventListener('resize', handleWindowReposition);
		window.removeEventListener('scroll', handleWindowReposition, true);
	}
	if (rollDialogRef.value?.open) {
		rollDialogRef.value.close();
	}
});

defineExpose({
	roll,
	clearPool,
	openOutcomeDialog,
	isRolled,
	lastRollResults,
	bestTotalInfo,
	bestEffectInfo,
	isContestRoll,
	contestSummary,
	orderedEvaluations,
	rollLog,
	clearRollLog,
});
</script>

<template>
	<aside class="dice-roller-sidebar dice-roller-sheet" :class="{ open: open, 'is-opposition': isActiveChallengerTone }">
		<div class="roller-body">
			<!-- POOL TABS + PER-OWNER PP TRACKERS -->
			<div class="roller-top-bar">
				<div class="pool-tabs-row">
					<div
						ref="poolTablistRef"
						class="pool-tabs"
						role="tablist"
						aria-label="Dice pools"
						@keydown="onPoolTabKeydown"
					>
						<button
							v-for="(entry, pIdx) in effectivePools"
							:id="tabDomId(entry)"
							:key="entry.id"
							type="button"
							role="tab"
							class="pool-tab-btn"
							:class="entry.id === 'opposition' || (!entry.ownerId && pIdx > 0) ? 'pool-tab-opp' : 'pool-tab-player'"
							:aria-selected="currentPoolId === entry.id"
							:tabindex="currentPoolId === entry.id ? 0 : -1"
							@click="selectPoolById(entry.id)"
						>
							<span class="pool-tab-label">{{ resolveEntryName(entry) }}</span>
							<span class="pool-tab-count">{{ itemsForPool(entry.pool).length }}</span>
						</button>
					</div>

					<button
						v-if="isMultiPoolMode"
						type="button"
						class="btn-add-pool"
						:aria-expanded="isAddPoolOpen"
						aria-label="Add dice pool"
						@click="toggleAddPool"
					>
						+ Pool
					</button>
				</div>

				<!-- + POOL INLINE PICKER & OWNER INPUT -->
				<div v-if="isAddPoolOpen && isMultiPoolMode" class="add-pool-bar">
					<div v-if="unpooledCuriosities.length > 0" class="add-pool-curiosity-chips">
						<button
							v-for="cur in unpooledCuriosities"
							:key="'add-cur-pool-' + cur.id"
							type="button"
							class="add-pool-curiosity-chip"
							@click="quickAddCuriosityPool(cur)"
						>
							<i class="fas fa-lightbulb" aria-hidden="true"></i>
							<span>+ {{ cur.name || 'Unnamed' }}</span>
						</button>
					</div>
					<div class="add-pool-custom-row">
						<label :for="newPoolInputId" class="sr-only">Pool owner name</label>
						<input
							:id="newPoolInputId"
							ref="newPoolInputRef"
							v-model="newPoolName"
							type="text"
							class="add-pool-input"
							placeholder="Owner name"
							@keydown="onNewPoolKeydown"
						/>
						<button
							type="button"
							class="add-pool-pp-chip"
							:class="{ active: newPoolWithPP }"
							:aria-pressed="newPoolWithPP"
							@click="newPoolWithPP = !newPoolWithPP"
						>
							<i class="fas fa-coins" aria-hidden="true"></i>
							<span>+ PP</span>
						</button>
						<button type="button" class="trait-submit-btn" :disabled="!newPoolName.trim()" @click="submitNewPool">
							Add
						</button>
					</div>
				</div>

				<!-- VISIBLE PP FOR EACH POOL-OWNING ENTITY -->
				<div v-if="ppBearingPools.length > 0 || (isMultiPoolMode && !activePoolTracksPP)" class="roller-owners-pp-bar">
					<div
						v-for="ppEntry in ppBearingPools"
						:key="'pp-' + ppEntry.id"
						class="pp-tracker"
						:class="{ 'is-active-owner': ppEntry.id === currentPoolId }"
						role="group"
						:aria-label="
							isMultiPoolMode || ppBearingPools.length > 1 ? resolveEntryName(ppEntry) + ' Plot Points' : 'Plot Points'
						"
					>
						<span class="pp-tracker-label">
							{{ isMultiPoolMode ? resolveEntryName(ppEntry) + ' PP' : 'PP' }}
						</span>
						<button
							type="button"
							class="pp-adj-btn"
							:disabled="getPoolPP(ppEntry) <= 0"
							:aria-label="
								isMultiPoolMode && ppBearingPools.length > 1
									? 'Spend Plot Point for ' + resolveEntryName(ppEntry)
									: 'Spend Plot Point'
							"
							@click="adjustPoolPP(ppEntry.id, -1)"
						>
							−
						</button>
						<span :id="ppEntry.id === currentPoolId ? 'ppCountDisplay' : undefined" class="pp-count-val">
							{{ getPoolPP(ppEntry)
							}}<small v-if="pendingPPForPool(ppEntry) > 0" class="pp-pending-tag"
								>+{{ pendingPPForPool(ppEntry) }}</small
							>
						</span>
						<button
							type="button"
							class="pp-adj-btn"
							:aria-label="
								isMultiPoolMode && ppBearingPools.length > 1
									? 'Gain Plot Point for ' + resolveEntryName(ppEntry)
									: 'Gain Plot Point'
							"
							@click="adjustPoolPP(ppEntry.id, 1)"
						>
							+
						</button>
					</div>

					<button
						v-if="isMultiPoolMode && !activePoolTracksPP"
						type="button"
						class="roller-enable-pp-chip"
						:aria-label="'Enable Plot Points for ' + resolveEntryName(activePoolEntry)"
						@click="emit('togglePoolPP', activePoolEntry.id)"
					>
						<i class="fas fa-coins" aria-hidden="true"></i>
						<span>+ {{ resolveEntryName(activePoolEntry) }} PP</span>
					</button>
				</div>
			</div>

			<!-- SECTION 1: DIVORCED WORD BANK -->
			<section class="roller-section word-bank-section" aria-label="Word Bank">
				<div class="roller-section-header">
					<span class="roller-label">WORD BANK</span>
					<div class="wb-header-actions">
						<button type="button" class="wb-action-btn wb-scale-btn" @click="addScalePill">+ Scale</button>
						<button
							type="button"
							class="wb-action-btn wb-trait-btn"
							:aria-expanded="isTraitInputOpen"
							aria-controls="traitInputContainer"
							@click="toggleTraitInput"
						>
							+ Trait
						</button>
					</div>
				</div>

				<!-- + TRAIT COMBOBOX BAR -->
				<div v-if="isTraitInputOpen" id="traitInputContainer" ref="traitInputBarRef" class="trait-input-bar">
					<input
						ref="traitInputRef"
						v-model="traitQuery"
						type="search"
						role="combobox"
						autocomplete="off"
						class="trait-shorthand-input"
						aria-label="Add trait or die shorthand"
						:aria-expanded="isPresearchOpen"
						aria-controls="traitPresearchDropdown"
						placeholder="Trait or Strength d6"
						@focus="onTraitInputFocus"
						@click="openPresearch"
						@input="onTraitInput"
						@keydown="onTraitInputKeydown"
					/>
					<span v-if="parsedShorthand.dice" class="shorthand-preview" aria-hidden="true">
						<span v-if="parsedShorthand.dice.count > 1" class="shorthand-qty">{{ parsedShorthand.dice.count }}×</span>
						<span v-html="getDieDisplayValue(parsedShorthand.dice.size)"></span>
					</span>
					<button type="button" class="trait-submit-btn" @click="submitTraitInput">Add</button>
				</div>

				<!-- PRE-SEARCH POPOVER (ANCHORED) -->
				<div
					id="traitPresearchDropdown"
					ref="presearchPopoverRef"
					popover="manual"
					class="trait-presearch-popover"
					:class="{ 'is-fallback-open': isPresearchOpen }"
					aria-label="Curiosity trait suggestions"
				>
					<ul v-if="filteredSuggestions.length > 0" class="presearch-list">
						<li
							v-for="(sug, sIdx) in filteredSuggestions"
							:key="sug.key"
							class="presearch-row"
							:class="{ 'is-highlighted': sIdx === highlightedIdx }"
						>
							<button type="button" class="presearch-item-btn" @click="selectSuggestion(sug)">
								<span class="presearch-main">
									<span class="presearch-name">{{ sug.name }}</span>
									<span v-if="sug.noun || sug.description" class="presearch-meta">
										{{ sug.noun }}{{ sug.noun && sug.description ? ' • ' : '' }}{{ sug.description }}
									</span>
								</span>
								<span class="presearch-dice">
									<span v-if="sug.dice.length > 1" class="presearch-qty">{{ sug.dice.length }}×</span>
									<span class="presearch-die-glyph" aria-hidden="true" v-html="getDieDisplayValue(sug.dice[0])"></span>
									<span class="presearch-notation">{{ sug.notation }}</span>
								</span>
							</button>
							<button
								v-if="sug.canHinder"
								type="button"
								class="presearch-hinder-btn"
								:aria-label="`${sug.altRoll?.label || 'Hinder'} ${sug.name} as d${sug.altRoll?.die || 4} for ${sug.altRoll ? (sug.altRoll.ppDelta > 0 ? `+${sug.altRoll.ppDelta}` : sug.altRoll.ppDelta) : '+1'} PP`"
								@click.stop="hinderSuggestion(sug)"
							>
								{{
									sug.altRoll
										? `d${sug.altRoll.die} ${sug.altRoll.ppDelta > 0 ? `+${sug.altRoll.ppDelta}` : sug.altRoll.ppDelta} PP`
										: 'd4 +1 PP'
								}}
							</button>
						</li>
					</ul>
				</div>

				<!-- WORD BANK PILLS -->
				<div v-if="activeWordBank.length > 0" class="word-bank-list">
					<span v-for="word in activeWordBank" :key="word.id" class="trait-chip" :class="'kind-' + word.kind">
						<span class="trait-chip-label">{{ word.label }}</span>
						<button
							type="button"
							class="trait-chip-remove"
							:aria-label="'Remove ' + word.label"
							@click="removeWordPill(word.id)"
						>
							×
						</button>
					</span>
				</div>
				<div v-else class="word-bank-empty">No labels staged</div>
			</section>

			<!-- SECTION 2: QUICK ADD DICE -->
			<section class="roller-section quick-add-section" aria-label="Quick Add Dice">
				<div class="roller-section-header">
					<span class="roller-label">QUICK ADD</span>
					<button
						type="button"
						class="sep-mode-toggle"
						:class="{ 'is-active': isSeparateAddMode }"
						:aria-pressed="isSeparateAddMode"
						@click="isSeparateAddMode = !isSeparateAddMode"
					>
						SEP Mode
					</button>
				</div>
				<div class="roller-adhoc-grid">
					<button
						v-for="size in diceSizes"
						:key="'adhoc-d' + size"
						type="button"
						class="die-btn roller-adhoc-btn"
						:class="{ 'is-sep-mode': isSeparateAddMode }"
						:aria-label="(isSeparateAddMode ? 'Add Separate d' : 'Add d') + size"
						@click="addQuickDie(size)"
					>
						<span aria-hidden="true" v-html="getDieDisplayValue(size)"></span>
					</button>
				</div>
			</section>

			<!-- SECTION 3: UNLABELED DICE POOL + CONTEXTUAL 4-BUTTON BAR -->
			<section class="roller-section dice-pool-section" aria-label="Dice Pool">
				<div class="roller-section-header">
					<span class="roller-label">
						{{ isMultiPoolMode ? resolveEntryName(activePoolEntry) + ' POOL' : 'DICE POOL' }}
						<span class="pool-count-badge">{{ stagedDice.length }}</span>
					</span>
					<div class="roller-pool-header-actions">
						<button
							v-if="stagedDice.length > 0 || activeWordBank.length > 0"
							type="button"
							class="roller-clear-link"
							@click="clearActivePool"
						>
							Clear
						</button>
						<button
							v-if="isMultiPoolMode && effectivePools.length > 1"
							type="button"
							class="roller-remove-pool-link"
							:aria-label="'Remove ' + resolveEntryName(activePoolEntry) + ' pool'"
							@click="removeActivePool"
						>
							Remove
						</button>
					</div>
				</div>

				<div class="roller-pool-grid" v-if="stagedDice.length > 0">
					<button
						v-for="item in stagedDice"
						:key="item.id"
						type="button"
						class="pool-die roller-chip"
						:class="{
							'is-selected': selectedDieId === item.id,
							'chip-resource': isExempt(item),
							'chip-scale': item.isScale,
						}"
						:aria-pressed="selectedDieId === item.id"
						:aria-label="'d' + item.size + (isExempt(item) ? ' separate die' : ' die')"
						:data-die-size="item.size"
						:data-die-source="item.source || 'ad-hoc'"
						:data-die-exempt="isExempt(item) ? 'true' : 'false'"
						@click="toggleSelectDie(item.id)"
					>
						<span aria-hidden="true" v-html="getDieDisplayValue(item.size)"></span>
						<span class="die-sep-badge" v-if="isExempt(item)" aria-hidden="true">SEP</span>
					</button>
				</div>

				<div class="roller-empty-pool" v-else>
					<p>Tap traits on any sheet or quick add above</p>
				</div>

				<div v-if="selectedDie" class="pool-action-bar" role="group" aria-label="Selected die actions">
					<button
						type="button"
						class="action-btn pool-act-step-down"
						:disabled="selectedDie.size <= 4"
						aria-label="Step down die"
						@click="stepDownSelected"
					>
						▼ Step
					</button>
					<button
						type="button"
						class="action-btn pool-act-step-up"
						:disabled="selectedDie.size >= 12"
						aria-label="Step up die"
						@click="stepUpSelected"
					>
						▲ Step
					</button>
					<button type="button" class="action-btn pool-act-dup" aria-label="Duplicate die" @click="duplicateSelected">
						×2
					</button>
					<button type="button" class="action-btn pool-act-remove" aria-label="Remove die" @click="removeSelected">
						✕ Remove
					</button>
				</div>
			</section>

			<!-- SECTION 4: PP SPEND BAR, MODIFIERS & ROLL CTA -->
			<section class="roller-controls" aria-label="Roll Controls">
				<div v-if="!isMultiPoolMode || activePoolTracksPP" class="pp-spend-bar">
					<button
						type="button"
						class="action-btn pp-spend-btn"
						:disabled="effectivePlotPoints < 1"
						@click="spendPPForKeep"
					>
						1 PP: +1 Keep
					</button>
					<button
						type="button"
						class="action-btn pp-spend-btn"
						:disabled="effectivePlotPoints < 1"
						@click="spendPPForD6"
					>
						1 PP: +d6
					</button>
				</div>

				<div class="roller-toggle-row" v-if="hasSeparateDice">
					<label class="roller-toggle-label">
						<input type="checkbox" id="roller-combine-separate" name="combineSeparate" v-model="combineSeparate" />
						<span class="toggle-text">Pool SEP Dice</span>
					</label>
					<span class="toggle-hint">{{ combineSeparate ? '+' + separateKeepBonus + ' Keep' : 'Separate' }}</span>
				</div>

				<div class="roller-modifiers-row">
					<div class="roller-option keep-stepper-group">
						<span class="option-label">Keep</span>
						<button
							type="button"
							class="step-btn"
							:disabled="activeKeep <= 1"
							aria-label="Decrease keep"
							@click="adjustKeep(-1)"
						>
							−
						</button>
						<span id="keepValue" class="keep-val">{{ activeKeep }}</span>
						<button
							type="button"
							class="step-btn"
							:disabled="activeKeep >= 12"
							aria-label="Increase keep"
							@click="adjustKeep(1)"
						>
							+
						</button>
					</div>

					<div class="roller-option">
						<span class="option-label">Hitches</span>
						<span class="roller-hitch-readout">{{ hitchLabel }}</span>
					</div>
				</div>
			</section>

			<!-- LIVE ACCESSIBILITY REGION (ALWAYS PRESENT) -->
			<div class="roller-results-announcement sr-only" aria-live="polite" role="status">
				<template v-if="isRolled && isContestRoll && contestSummary">
					Contest rolled. {{ contestSummary.playerLabel }} Total {{ contestSummary.playerTotal }}, Effect
					{{ contestSummary.playerEffect }}. {{ contestSummary.oppLabel }} Total {{ contestSummary.oppTotal }}, Effect
					{{ contestSummary.oppEffect }}.
				</template>
				<template v-else-if="isRolled && !isBotch && lastRollResults.length > 0">
					Rolled pool. Total: {{ manualTotal }}. Effect die: {{ manualEffectDie }}. Hitches: {{ totalHitches }}.
				</template>
				<template v-else-if="isRolled && isBotch">Botch! All dice rolled hitches.</template>
			</div>
			<output class="sr-only" aria-live="polite" aria-atomic="true">{{ dicePoolOutput }}</output>

			<!-- MOBILE RE-OPEN OUTCOME SUMMARY TRIGGER -->
			<button v-if="isRolled" type="button" class="mobile-outcome-trigger" @click="openOutcomeDialog">
				<span>
					<template v-if="isContestRoll && contestSummary">
						Contest: {{ contestSummary.playerTotal }} vs {{ contestSummary.oppTotal }}
					</template>
					<template v-else-if="isBotch">Last Roll: Botch</template>
					<template v-else>Last Roll: {{ manualTotal }} • {{ manualEffectDie }}</template>
				</span>
				<span class="mobile-outcome-open-label">View Outcome</span>
			</button>

			<!-- DESKTOP INLINE RESULTS -->
			<div v-if="isRolled && orderedEvaluations.length > 0" class="roller-results roller-inline-outcome">
				<RollerOutcome
					:isContest="isContestRoll"
					:playerEval="playerEvaluation"
					:oppositionEval="oppEvaluation"
					:evaluations="orderedEvaluations"
					:activeSide="currentSide"
					:activePoolId="currentPoolId"
					:plotPoints="hitchSpenderPlotPoints"
					:poolPlotPoints="poolPlotPointsMap"
					:isModal="false"
					:dicePoolOutput="dicePoolOutput"
					@cycleRole="handleCycleRole"
					@applyPreset="handleApplyPreset"
					@activateHitch="handleActivateHitch"
					@reroll="roll()"
					@expandDialog="openOutcomeDialog"
				/>
			</div>

			<!-- SESSION ROLL LOG -->
			<details class="roller-section roller-log-section" v-if="rollLog.length > 0">
				<summary class="roller-log-summary">
					<i class="fas fa-clock-rotate-left" aria-hidden="true"></i>
					<span>Roll Log ({{ rollLog.length }})</span>
				</summary>
				<div class="roller-log-toolbar">
					<button
						type="button"
						class="roller-log-btn"
						@click="copyAllLogEntries"
						aria-label="Copy all roll log entries"
					>
						<i class="fas fa-copy" aria-hidden="true"></i>
						<span>{{ copiedEntryId === '__all__' ? 'Copied' : 'Copy All' }}</span>
					</button>
					<button type="button" class="roller-log-btn" @click="clearRollLog" aria-label="Clear roll log">
						<i class="fas fa-trash" aria-hidden="true"></i>
						<span>Clear Log</span>
					</button>
				</div>
				<ul class="roller-log-list">
					<li class="roller-log-entry" v-for="entry in rollLog" :key="entry.id">
						<div class="roller-log-meta">
							<span>{{ entry.characterName }} · {{ formatLogTime(entry.timestamp) }}</span>
							<button
								type="button"
								class="roller-log-btn"
								@click="copyLogEntry(entry)"
								:aria-label="'Copy roll log entry for ' + entry.characterName"
							>
								<i class="fas fa-copy" aria-hidden="true"></i>
								<span>{{ copiedEntryId === entry.id ? 'Copied' : 'Copy' }}</span>
							</button>
						</div>
						<div class="roller-log-outcome" v-if="entry.contest && entry.pools && entry.pools.length >= 2">
							<span>
								{{
									entry.pools.map((p) => `${p.label} ${p.isBotch ? 'Botch' : p.total} (${p.effectDie})`).join(' vs ')
								}}
							</span>
							<span class="roller-log-hitch-badge" v-if="entry.pools.reduce((s, p) => s + p.hitches, 0) > 0">
								{{ entry.pools.reduce((s, p) => s + p.hitches, 0) }} Hitch
							</span>
						</div>
						<div class="roller-log-outcome" v-else-if="entry.contest && entry.player && entry.opposition">
							<span>
								Player {{ entry.player.isBotch ? 'Botch' : entry.player.total }} ({{ entry.player.effectDie }}) vs Opp
								{{ entry.opposition.isBotch ? 'Botch' : entry.opposition.total }} ({{ entry.opposition.effectDie }})
							</span>
							<span class="roller-log-hitch-badge" v-if="entry.player.hitches + entry.opposition.hitches > 0">
								{{ entry.player.hitches + entry.opposition.hitches }} Hitch
							</span>
						</div>
						<div class="roller-log-outcome" v-else-if="entry.player || entry.opposition">
							<template v-for="sideSum in [entry.player || entry.opposition]" :key="entry.id">
								<span v-if="sideSum">
									{{ sideSum.isBotch ? 'Botch' : 'Total ' + sideSum.total }} · Effect {{ sideSum.effectDie }}
								</span>
								<span class="roller-log-hitch-badge" v-if="sideSum && sideSum.hitches > 0">
									{{ sideSum.hitches }} Hitch
								</span>
							</template>
						</div>
						<div class="roller-log-dice" v-if="entry.pools && entry.pools.length > 0">
							{{
								entry.pools
									.map((p) => p.diceSummary)
									.filter(Boolean)
									.join(' | ')
							}}
						</div>
						<div class="roller-log-dice" v-else-if="entry.player?.diceSummary || entry.opposition?.diceSummary">
							{{ [entry.player?.diceSummary, entry.opposition?.diceSummary].filter(Boolean).join(' | ') }}
						</div>
					</li>
				</ul>
			</details>
		</div>

		<div class="roller-action-bar">
			<button type="button" class="roller-roll-btn" :disabled="!hasAnyDiceToRoll" @click="roll()">
				<i class="fas fa-dice" aria-hidden="true"></i> {{ rollButtonLabel }}
			</button>
		</div>

		<!-- TOP-LAYER MODAL OUTCOME DIALOG (MOBILE + DESKTOP EXPAND) -->
		<dialog
			id="rollDialog"
			ref="rollDialogRef"
			class="roll-outcome-dialog"
			:class="{ 'is-contest': isContestRoll }"
			closedby="any"
			aria-labelledby="rollDialogTitle"
			@close="onDialogClose"
			@cancel="onDialogCancel"
			@pointerdown="onDialogPointerDown"
			@pointerup="onDialogPointerUp"
		>
			<RollerOutcome
				v-if="isRolled && orderedEvaluations.length > 0"
				:isContest="isContestRoll"
				:playerEval="playerEvaluation"
				:oppositionEval="oppEvaluation"
				:evaluations="orderedEvaluations"
				:activeSide="currentSide"
				:activePoolId="currentPoolId"
				:plotPoints="hitchSpenderPlotPoints"
				:poolPlotPoints="poolPlotPointsMap"
				:isModal="true"
				:dicePoolOutput="dicePoolOutput"
				@cycleRole="handleCycleRole"
				@applyPreset="handleApplyPreset"
				@activateHitch="handleActivateHitch"
				@reroll="roll({ forceDialog: true })"
				@closeDialog="closeOutcomeDialog"
			/>
		</dialog>
	</aside>
</template>
