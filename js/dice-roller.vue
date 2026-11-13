<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import {
	dicePool as dicePoolModel,
	DIE_SIZES,
	flattenCharacterTraits,
	loadRollLog,
	MAX_ROLL_LOG_ENTRIES,
	parseTraitShorthand,
	saveRollLog,
	type DiceItem,
	type FlattenedTraitSuggestion,
	type PoolEvaluation,
	type RollLogEntry,
	type RollLogSideSummary,
	type RollResult,
	type SeparateGroup,
	type WordBankItem,
	type WordBankKind,
} from './dice-pool.ts';
import { characterCurioFunctions } from './functions.ts';
import RollerOutcome from './roller-outcome.vue';

const props = withDefaults(
	defineProps<{
		open: boolean;
		pool: any;
		oppositionPool?: any;
		activePoolSide?: 'player' | 'opposition';
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
	(e: 'close'): void;
	(e: 'addDie', die: any): void;
	(e: 'removeDie', index: number): void;
	(e: 'clearPool'): void;
	(e: 'clearOppositionPool'): void;
	(e: 'togglePosition'): void;
	(e: 'settlePP', delta: number): void;
	(e: 'update:activePoolSide', side: 'player' | 'opposition'): void;
}>();

const savedCombine = typeof localStorage !== 'undefined' ? localStorage.getItem('characterCurioCombineSeparate') : null;

const localOppositionPool = ref(new dicePoolModel.DicePool());
const localSide = ref<'player' | 'opposition'>('player');
const localPlotPoints = ref(1);
const rollLog = ref<RollLogEntry[]>(loadRollLog());
const activeLogEntryId = ref<string | null>(null);
const copiedEntryId = ref<string | null>(null);
const localPlayerWords = ref<WordBankItem[]>([]);

const currentSide = computed<'player' | 'opposition'>(() => props.activePoolSide || localSide.value);

const playerPoolRef = computed(() => props.pool);
const oppositionPoolRef = computed(() => props.oppositionPool || localOppositionPool.value);
const activePool = computed(() => (currentSide.value === 'opposition' ? oppositionPoolRef.value : playerPoolRef.value));

const playerItems = computed<DiceItem[]>(() => (playerPoolRef.value?.items ? playerPoolRef.value.items : []));
const oppItems = computed<DiceItem[]>(() => (oppositionPoolRef.value?.items ? oppositionPoolRef.value.items : []));
const stagedDice = computed<DiceItem[]>(() => (activePool.value?.items ? activePool.value.items : []));

function wordsForPool(poolObj: any, side: 'player' | 'opposition'): WordBankItem[] {
	if (poolObj && Array.isArray(poolObj.wordBank)) return poolObj.wordBank;
	return side === 'player' ? localPlayerWords.value : localOppositionPool.value.wordBank;
}

const activeWordBank = computed<WordBankItem[]>(() => wordsForPool(activePool.value, currentSide.value));

const effectivePlotPoints = computed<number>(() => {
	if (props.character && props.character.plotPoints !== undefined) {
		return Math.max(0, Math.floor(Number(props.character.plotPoints) || 0));
	}
	return localPlotPoints.value;
});

const pendingPPDelta = computed<number>(() =>
	playerItems.value.reduce((sum, item) => sum + (!item.ppCommitted && item.ppDelta ? Number(item.ppDelta) : 0), 0),
);

function adjustPP(delta: number) {
	if (delta < 0 && effectivePlotPoints.value + delta < 0) return;
	if (!props.character) {
		localPlotPoints.value = Math.max(0, localPlotPoints.value + delta);
	}
	emit('settlePP', delta);
}

// Per-side modifiers
const combineSeparatePlayer = ref(savedCombine !== null ? savedCombine === 'true' : false);
const combineSeparateOpp = ref(false);
const keepOffsetPlayer = ref(0);
const keepOffsetOpp = ref(0);
const ppKeepBonusPlayer = ref(0);
const ppKeepBonusOpp = ref(0);

const combineSeparate = computed({
	get: () => (currentSide.value === 'opposition' ? combineSeparateOpp.value : combineSeparatePlayer.value),
	set: (val: boolean) => {
		if (currentSide.value === 'opposition') {
			combineSeparateOpp.value = val;
		} else {
			combineSeparatePlayer.value = val;
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

watch(currentSide, () => {
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
	if (d && (d.isScale || (d.source && String(d.source).toLowerCase() === 'scale'))) return 1;
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
		currentSide.value === 'opposition' ? ppKeepBonusOpp.value : ppKeepBonusPlayer.value,
		currentSide.value === 'opposition' ? keepOffsetOpp.value : keepOffsetPlayer.value,
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
	if (currentSide.value === 'opposition') {
		keepOffsetOpp.value += diff;
	} else {
		keepOffsetPlayer.value += diff;
	}
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

function addWordToPool(targetPool: any, side: 'player' | 'opposition', label: string, kind: WordBankKind = 'trait') {
	if (targetPool && typeof targetPool.addWord === 'function') {
		return targetPool.addWord(label, kind);
	}
	const trimmed = String(label || '').trim();
	if (!trimmed) return null;
	const item: WordBankItem = { id: getUuid(), label: trimmed, kind };
	wordsForPool(targetPool, side).push(item);
	return item;
}

function removeWordFromPool(targetPool: any, side: 'player' | 'opposition', id: string) {
	if (targetPool && typeof targetPool.removeWord === 'function') {
		return targetPool.removeWord(id);
	}
	const list = wordsForPool(targetPool, side);
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

function selectPoolSide(side: 'player' | 'opposition') {
	localSide.value = side;
	emit('update:activePoolSide', side);
}

function onPoolTabKeydown(e: KeyboardEvent) {
	if (e.key === 'ArrowRight' || e.key === 'ArrowLeft' || e.key === 'Home' || e.key === 'End') {
		e.preventDefault();
		const nextSide: 'player' | 'opposition' =
			e.key === 'Home'
				? 'player'
				: e.key === 'End'
					? 'opposition'
					: currentSide.value === 'player'
						? 'opposition'
						: 'player';
		selectPoolSide(nextSide);
		nextTick(() => {
			document.getElementById(nextSide === 'player' ? 'tabPlayer' : 'tabOpposition')?.focus();
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

const allFlattenedTraits = computed<FlattenedTraitSuggestion[]>(() => flattenCharacterTraits(props.character));

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
	addWordToPool(activePool.value, currentSide.value, sug.name, 'trait');
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
	addWordToPool(activePool.value, currentSide.value, `${sug.name} (Hinder)`, 'hinder');
	addDiceToTargetPool(
		activePool.value,
		{
			size: 4,
			qty: 1,
			source: `${sug.name} (Hinder)`,
			hitches: sug.hitches,
			keepsExtra: sug.keepsExtra,
			ppDelta: currentSide.value === 'player' ? 1 : 0,
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
		addWordToPool(activePool.value, currentSide.value, parsed.label, 'trait');
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
	addWordToPool(activePool.value, currentSide.value, 'Scale', 'scale');
}

function removeWordPill(id: string) {
	removeWordFromPool(activePool.value, currentSide.value, id);
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

function clearSide(side: 'player' | 'opposition') {
	const target = side === 'opposition' ? oppositionPoolRef.value : playerPoolRef.value;
	if (target && typeof target.clear === 'function') {
		target.clear();
	} else if (target) {
		if (Array.isArray(target.items)) target.items = [];
		if (Array.isArray(target.wordBank)) target.wordBank = [];
		localPlayerWords.value = [];
	}
	if (side === 'opposition') {
		keepOffsetOpp.value = 0;
		ppKeepBonusOpp.value = 0;
		oppEvaluation.value = null;
	} else {
		keepOffsetPlayer.value = 0;
		ppKeepBonusPlayer.value = 0;
		playerEvaluation.value = null;
	}
	selectedDieId.value = null;
}

function clearActivePool() {
	clearSide(currentSide.value);
	if (!playerEvaluation.value && !oppEvaluation.value) {
		isRolled.value = false;
		dicePoolOutput.value = '';
	}
}

function clearPool() {
	clearSide('player');
	clearSide('opposition');
	isRolled.value = false;
	isContestRoll.value = false;
	dicePoolOutput.value = '';
	closeOutcomeDialog();
}

// Pre-Roll PP Spend Bar (§5.3)
function spendPPForKeep() {
	if (effectivePlotPoints.value < 1) return;
	adjustPP(-1);
	addWordToPool(activePool.value, currentSide.value, 'PP: +1 Keep', 'pp');
	if (currentSide.value === 'opposition') {
		ppKeepBonusOpp.value += 1;
	} else {
		ppKeepBonusPlayer.value += 1;
	}
	if (isRolled.value) reEvaluateRoll();
}

function spendPPForD6() {
	if (effectivePlotPoints.value < 1) return;
	adjustPP(-1);
	addWordToPool(activePool.value, currentSide.value, 'PP: +d6', 'pp');
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
const playerEvaluation = ref<PoolEvaluation | null>(null);
const oppEvaluation = ref<PoolEvaluation | null>(null);
const dicePoolOutput = ref('');
const rollDialogRef = ref<HTMLDialogElement | null>(null);
const isDialogOpen = ref(false);

const primaryEval = computed<PoolEvaluation | null>(() => {
	if (isContestRoll.value) return playerEvaluation.value || oppEvaluation.value;
	return currentSide.value === 'opposition'
		? oppEvaluation.value || playerEvaluation.value
		: playerEvaluation.value || oppEvaluation.value;
});

const lastRollResults = computed<RollResult[]>(() => primaryEval.value?.results || []);
const bestTotalInfo = computed(() => primaryEval.value?.bestTotalInfo || null);
const bestEffectInfo = computed(() => primaryEval.value?.bestEffectInfo || null);
const manualTotal = computed(() => primaryEval.value?.manualTotal || 0);
const manualEffectDie = computed(() => primaryEval.value?.manualEffectDie || 'd4');
const totalHitches = computed(() => primaryEval.value?.totalHitches || 0);
const isBotch = computed(() => Boolean(primaryEval.value?.isBotch));

const contestSummary = computed(() => {
	if (!isContestRoll.value || !playerEvaluation.value || !oppEvaluation.value) return null;
	return {
		playerTotal: playerEvaluation.value.isBotch ? 0 : playerEvaluation.value.manualTotal,
		playerEffect: playerEvaluation.value.manualEffectDie,
		oppTotal: oppEvaluation.value.isBotch ? 0 : oppEvaluation.value.manualTotal,
		oppEffect: oppEvaluation.value.manualEffectDie,
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

function evaluateSideResults(
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
	const label = side === 'opposition' ? 'Opposition Pool' : 'Player Pool';

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
	if (playerEvaluation.value) parts.push(playerEvaluation.value.log);
	if (oppEvaluation.value) parts.push(oppEvaluation.value.log);
	if (isContestRoll.value && contestSummary.value) {
		const diff = contestSummary.value.playerTotal - contestSummary.value.oppTotal;
		parts.push(`Contest Margin: ${diff >= 0 ? '+' + diff : diff}`);
	}
	dicePoolOutput.value = parts.join('\n');
}

function buildSideLogSummary(ev: PoolEvaluation | null): RollLogSideSummary | undefined {
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

function recordRollLogEntry() {
	const entry: RollLogEntry = {
		id: getUuid(),
		timestamp: Date.now(),
		characterName: String(props.character?.name || 'Sheet').trim() || 'Sheet',
		contest: isContestRoll.value,
		player: buildSideLogSummary(playerEvaluation.value),
		opposition: buildSideLogSummary(oppEvaluation.value),
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
	if (playerEvaluation.value) {
		playerEvaluation.value = evaluateSideResults(
			'player',
			playerEvaluation.value.results,
			playerItems.value,
			wordsForPool(playerPoolRef.value, 'player'),
			combineSeparatePlayer.value,
			ppKeepBonusPlayer.value,
			keepOffsetPlayer.value,
			preserveManualRoles,
		);
	}
	if (oppEvaluation.value) {
		oppEvaluation.value = evaluateSideResults(
			'opposition',
			oppEvaluation.value.results,
			oppItems.value,
			wordsForPool(oppositionPoolRef.value, 'opposition'),
			combineSeparateOpp.value,
			ppKeepBonusOpp.value,
			keepOffsetOpp.value,
			preserveManualRoles,
		);
	}
	updateCombinedLog();
	syncActiveRollLogEntry();
}

const rollButtonLabel = computed(() => {
	const hasP = playerItems.value.length > 0;
	const hasO = oppItems.value.length > 0;
	if (hasP && hasO) return 'ROLL CONTEST';
	if (hasO && !hasP) return 'ROLL OPPOSITION';
	return 'ROLL POOL';
});

const hasAnyDiceToRoll = computed(() => playerItems.value.length > 0 || oppItems.value.length > 0);

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

function roll(opts?: { forceDialog?: boolean }) {
	const hasP = playerItems.value.length > 0;
	const hasO = oppItems.value.length > 0;
	if (!hasP && !hasO) return;

	// Settle uncommitted Hinder / sheet PP deltas at roll time
	let ppToSettle = 0;
	for (const item of playerItems.value) {
		if (!item.ppCommitted && item.ppDelta) {
			ppToSettle += Number(item.ppDelta) || 0;
		}
		item.ppCommitted = true;
	}
	if (ppToSettle !== 0) {
		adjustPP(ppToSettle);
	}

	isContestRoll.value = hasP && hasO;

	if (hasP) {
		const rawP = buildRawResults(playerItems.value);
		playerEvaluation.value = evaluateSideResults(
			'player',
			rawP,
			playerItems.value,
			wordsForPool(playerPoolRef.value, 'player'),
			combineSeparatePlayer.value,
			ppKeepBonusPlayer.value,
			keepOffsetPlayer.value,
		);
	} else {
		playerEvaluation.value = null;
	}

	if (hasO) {
		const rawO = buildRawResults(oppItems.value);
		oppEvaluation.value = evaluateSideResults(
			'opposition',
			rawO,
			oppItems.value,
			wordsForPool(oppositionPoolRef.value, 'opposition'),
			combineSeparateOpp.value,
			ppKeepBonusOpp.value,
			keepOffsetOpp.value,
		);
	} else {
		oppEvaluation.value = null;
	}

	isRolled.value = true;
	updateCombinedLog();
	recordRollLogEntry();

	if (opts?.forceDialog || isMobileViewport()) {
		nextTick(() => openOutcomeDialog());
	}
}

function handleCycleRole(side: 'player' | 'opposition', dieId: string) {
	const targetEval = side === 'opposition' ? oppEvaluation.value : playerEvaluation.value;
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

function handleApplyPreset(side: 'player' | 'opposition', preset: 'total' | 'effect') {
	const targetEval = side === 'opposition' ? oppEvaluation.value : playerEvaluation.value;
	if (!targetEval || targetEval.isBotch) return;

	if (preset === 'total') {
		reEvaluateRoll(false);
		return;
	}

	// Apply Best Effect
	if (!targetEval.combineSeparate && targetEval.separateGroups.length > 0) {
		const stats = computePoolKeepStats(
			side === 'opposition' ? oppItems.value : playerItems.value,
			wordsForPool(side === 'opposition' ? oppositionPoolRef.value : playerPoolRef.value, side),
			false,
			side === 'opposition' ? ppKeepBonusOpp.value : ppKeepBonusPlayer.value,
			side === 'opposition' ? keepOffsetOpp.value : keepOffsetPlayer.value,
		);
		const actionKeep = Math.max(
			1,
			2 +
				stats.actionKeepsExtra +
				stats.scaleWords +
				(side === 'opposition'
					? ppKeepBonusOpp.value + keepOffsetOpp.value
					: ppKeepBonusPlayer.value + keepOffsetPlayer.value),
		);
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

// Interactive Post-Roll Hitch Activation (§5.4)
function handleActivateHitch(side: 'player' | 'opposition', dieId: string) {
	const targetEval = side === 'opposition' ? oppEvaluation.value : playerEvaluation.value;
	if (!targetEval) return;
	const die = targetEval.results.find((d) => d.id === dieId);
	if (!die || !die.isHitch || die.hitchActivated) return;

	if (side === 'player') {
		die.hitchActivated = true;
		adjustPP(1);
		addWordToPool(playerPoolRef.value, 'player', 'Complication d6', 'hinder');
	} else {
		if (effectivePlotPoints.value < 1) return;
		die.hitchActivated = true;
		adjustPP(-1);
		addWordToPool(playerPoolRef.value, 'player', 'Opp Hitch Asset d6', 'asset');
	}
}

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
	rollLog,
	clearRollLog,
});
</script>

<template>
	<aside
		class="dice-roller-sidebar dice-roller-sheet"
		:class="{ open: open, 'is-opposition': currentSide === 'opposition' }"
	>
		<div class="roller-header">
			<div class="roller-title"><i class="fas fa-dice" aria-hidden="true"></i> <span>Dice Roller</span></div>
			<div class="roller-header-actions">
				<button
					type="button"
					class="roller-btn-icon"
					@click="emit('togglePosition')"
					:title="position === 'left' ? 'Move panel right' : 'Move panel left'"
					:aria-label="position === 'left' ? 'Move panel right' : 'Move panel left'"
				>
					<i class="fas fa-arrows-left-right" aria-hidden="true"></i>
				</button>
				<button
					type="button"
					class="roller-btn-icon"
					@click="emit('close')"
					title="Close Roller"
					aria-label="Close Roller"
				>
					<i class="fas fa-times" aria-hidden="true"></i>
				</button>
			</div>
		</div>

		<div class="roller-body">
			<!-- DUAL-POOL TABS + PP TRACKER -->
			<div class="roller-top-bar">
				<div class="pool-tabs" role="tablist" aria-label="Dice pools" @keydown="onPoolTabKeydown">
					<button
						id="tabPlayer"
						type="button"
						role="tab"
						class="pool-tab-btn pool-tab-player"
						:aria-selected="currentSide === 'player'"
						:tabindex="currentSide === 'player' ? 0 : -1"
						@click="selectPoolSide('player')"
					>
						<span>Player</span>
						<span class="pool-tab-count">{{ playerItems.length }}</span>
					</button>
					<button
						id="tabOpposition"
						type="button"
						role="tab"
						class="pool-tab-btn pool-tab-opp"
						:aria-selected="currentSide === 'opposition'"
						:tabindex="currentSide === 'opposition' ? 0 : -1"
						@click="selectPoolSide('opposition')"
					>
						<span>Opposition</span>
						<span class="pool-tab-count">{{ oppItems.length }}</span>
					</button>
				</div>

				<div class="pp-tracker" role="group" aria-label="Plot Points">
					<span class="pp-tracker-label">PP</span>
					<button
						type="button"
						class="pp-adj-btn"
						:disabled="effectivePlotPoints <= 0"
						aria-label="Spend Plot Point"
						@click="adjustPP(-1)"
					>
						−
					</button>
					<span id="ppCountDisplay" class="pp-count-val">
						{{ effectivePlotPoints
						}}<small v-if="pendingPPDelta > 0" class="pp-pending-tag">+{{ pendingPPDelta }}</small>
					</span>
					<button type="button" class="pp-adj-btn" aria-label="Gain Plot Point" @click="adjustPP(1)">+</button>
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
					aria-label="Character trait suggestions"
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
								:aria-label="'Hinder ' + sug.name + ' as d4 for +1 PP'"
								@click.stop="hinderSuggestion(sug)"
							>
								d4 +1 PP
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
						DICE POOL <span class="pool-count-badge">{{ stagedDice.length }}</span>
					</span>
					<button
						v-if="stagedDice.length > 0 || activeWordBank.length > 0"
						type="button"
						class="roller-clear-link"
						@click="clearActivePool"
					>
						Clear
					</button>
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
					<p>Tap traits on sheet or quick add above</p>
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
				<div class="pp-spend-bar">
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
					Contest rolled. Player Total {{ contestSummary.playerTotal }}, Effect {{ contestSummary.playerEffect }}.
					Opposition Total {{ contestSummary.oppTotal }}, Effect {{ contestSummary.oppEffect }}.
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
			<div v-if="isRolled && (playerEvaluation || oppEvaluation)" class="roller-results roller-inline-outcome">
				<RollerOutcome
					:isContest="isContestRoll"
					:playerEval="playerEvaluation"
					:oppositionEval="oppEvaluation"
					:activeSide="currentSide"
					:plotPoints="effectivePlotPoints"
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
						<div class="roller-log-outcome" v-if="entry.contest && entry.player && entry.opposition">
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
						<div class="roller-log-dice" v-if="entry.player?.diceSummary || entry.opposition?.diceSummary">
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
				v-if="isRolled && (playerEvaluation || oppEvaluation)"
				:isContest="isContestRoll"
				:playerEval="playerEvaluation"
				:oppositionEval="oppEvaluation"
				:activeSide="currentSide"
				:plotPoints="effectivePlotPoints"
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
