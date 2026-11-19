<script setup lang="ts">
import { computed } from 'vue';
import {
	DIE_LADDER,
	getView,
	ensureView,
	hasOutRange,
	isOutDie,
	rangeTop,
	ratingDice,
	resolveRange,
	resolveRating,
	setRatingDie,
	type DiceConfig,
	type Trait,
	type TraitSet,
} from './model.ts';
import { characterCurioFunctions } from './functions.ts';

const props = withDefaults(
	defineProps<{
		node: Trait | TraitSet;
		parentSet?: TraitSet | null;
		diceConfig?: DiceConfig | null;
		subjectLabel?: string;
		showMore?: boolean;
		showDelete?: boolean;
	}>(),
	{
		parentSet: null,
		diceConfig: null,
		subjectLabel: 'Trait',
		showMore: false,
		showDelete: false,
	},
);

const emit = defineEmits<{
	(e: 'change'): void;
	(e: 'close'): void;
	(e: 'openMore'): void;
	(e: 'delete'): void;
}>();

type ModeOption = 'Die' | 'Dice' | 'Pip' | 'Counter' | 'None';
const MODE_OPTIONS: ReadonlyArray<{ id: ModeOption; label: string }> = [
	{ id: 'Die', label: 'Die' },
	{ id: 'Dice', label: 'Dice' },
	{ id: 'Pip', label: 'Pip' },
	{ id: 'Counter', label: 'Counter' },
	{ id: 'None', label: 'None' },
];

const fallbacks = computed(() => (props.parentSet ? [props.parentSet] : []));

const resolved = computed(() => resolveRating(props.node, fallbacks.value));

const activeMode = computed<ModeOption>(() => {
	const t = resolved.value?.type;
	if (t === 'Die' || t === 'Dice' || t === 'Pip' || t === 'Counter') return t;
	return 'None';
});

const dieScale = computed<number[]>(() => {
	const r = resolveRange(props.node, fallbacks.value);
	return Array.isArray(r) && r.length > 0 ? r : [...DIE_LADDER];
});

const activeSingleDie = computed<number>(() => {
	if (activeMode.value !== 'Die') return 0;
	return ratingDice(resolved.value)[0] || 0;
});

const canPickOut = computed<boolean>(
	() =>
		Boolean(props.parentSet && getView(props.parentSet)?.style?.body === 'die-track') ||
		hasOutRange(props.node, fallbacks.value),
);

const isNodeOut = computed<boolean>(() => isOutDie(props.node, fallbacks.value));

const outLabel = computed<string>(() => {
	const labels = props.parentSet ? getView(props.parentSet)?.labels : undefined;
	if (labels && typeof labels.out === 'string' && labels.out.length > 0) return labels.out;
	return 'OUT';
});

const isNodePool = computed<boolean>(() => {
	if (typeof props.node?.pool === 'boolean') return props.node.pool;
	return Boolean(props.parentSet?.pool === true);
});

const isNodeSpendable = computed<boolean>(() => {
	if (typeof props.node?.spendable === 'boolean') return props.node.spendable;
	return Boolean(props.parentSet?.spendable === true);
});

const activeDicePool = computed<number[]>(() => {
	if (activeMode.value !== 'Dice') return [];
	return ratingDice(resolved.value);
});

const pipValues = computed<boolean[]>(() => {
	if (activeMode.value !== 'Pip') return [];
	const r = resolved.value;
	const vals = Array.isArray(r?.value) ? r.value : [];
	const setR = props.parentSet?.rating;
	const inheritedSetCount =
		setR?.type === 'Pip'
			? Array.isArray(setR.range) && setR.range[0]
				? Number(setR.range[0])
				: Array.isArray(setR.value)
					? setR.value.length
					: 0
			: 0;
	const count =
		Array.isArray(r?.range) && r.range[0]
			? Number(r.range[0])
			: props.node?.rating?.type === 'Pip'
				? vals.length || inheritedSetCount || 1
				: inheritedSetCount || vals.length || 1;
	const clampedCount = Math.max(1, Math.min(12, Math.floor(count)));
	const out: boolean[] = [];
	for (let i = 0; i < clampedCount; i++) {
		out.push(Boolean(vals[i] === true));
	}
	return out;
});

const counterBounds = computed<[number, number]>(() => {
	const r = resolved.value;
	if (r?.type === 'Counter' && Array.isArray(r.range) && r.range.length >= 2) {
		const a = Number(r.range[0]);
		const b = Number(r.range[1]);
		if (Number.isFinite(a) && Number.isFinite(b)) {
			return a <= b ? [a, b] : [b, a];
		}
	}
	return [0, 20];
});

const counterVal = computed<number>(() => {
	const r = resolved.value;
	if (r?.type === 'Counter' && typeof r.value?.[0] === 'number' && Number.isFinite(r.value[0])) {
		return r.value[0] as number;
	}
	return 0;
});

function ownRangeIfPresent(): number[] | undefined {
	const own = props.node?.rating?.range;
	if (
		(resolved.value?.type === 'Die' || resolved.value?.type === 'Dice') &&
		Array.isArray(own) &&
		own.length > 0 &&
		own.every((x: unknown) => typeof x === 'number')
	) {
		return [...own];
	}
	return undefined;
}

function syncDiceCountIfNeeded(count: number) {
	if (props.parentSet && getView(props.parentSet)?.style?.body === 'dice-count') {
		ensureView(props.node).poolCount = count;
	}
}

function selectMode(mode: ModeOption) {
	if (!props.node || activeMode.value === mode) return;
	if (mode === 'None') {
		delete props.node.rating;
		delete props.node.pool;
		if ('isOut' in props.node) delete props.node.isOut;
		emit('change');
		return;
	}
	const cur = resolved.value;
	const ownRange = ownRangeIfPresent();
	const hadOwnOut = Boolean(props.node?.rating?.out === true);
	const defaultDie = dieScale.value.includes(8) ? 8 : dieScale.value[0] || 6;

	if (mode === 'Die') {
		const prevDice = cur && !isNodeOut.value ? ratingDice(cur) : [];
		const size = prevDice[0] || defaultDie;
		delete props.node.rating;
		delete props.node.pool;
		if ('isOut' in props.node) props.node.isOut = false;
		setRatingDie(props.node, size, ownRange);
		if (hadOwnOut && props.node.rating && typeof props.node.rating === 'object') {
			(props.node.rating as unknown as Record<string, unknown>).out = true;
		}
	} else if (mode === 'Dice') {
		const prevDice = cur && !isNodeOut.value ? ratingDice(cur) : [];
		const nextDice =
			prevDice.length >= 2
				? [...prevDice]
				: prevDice.length === 1
					? [prevDice[0], prevDice[0]]
					: [defaultDie, defaultDie];
		props.node.rating = {
			type: 'Dice',
			value: nextDice.sort((a, b) => b - a),
			...(ownRange ? { range: ownRange } : {}),
			...(hadOwnOut ? { out: true } : {}),
		};
		props.node.pool = true;
		if ('isOut' in props.node) props.node.isOut = false;
		syncDiceCountIfNeeded(nextDice.length);
	} else if (mode === 'Pip') {
		delete props.node.pool;
		if ('isOut' in props.node) props.node.isOut = false;
		props.node.rating = {
			type: 'Pip',
			value: [false, false, false],
		};
	} else if (mode === 'Counter') {
		delete props.node.pool;
		if ('isOut' in props.node) props.node.isOut = false;
		props.node.rating = {
			type: 'Counter',
			value: [0],
			range: [0, 20],
		};
	}
	emit('change');
}

function pickSingleDie(size: number) {
	if (!props.node) return;
	const ownRange = ownRangeIfPresent();
	if ('isOut' in props.node) props.node.isOut = false;
	setRatingDie(props.node, size, ownRange);
	emit('change');
}

function pickOut() {
	if (!props.node) return;
	const ownRange = ownRangeIfPresent();
	(props.node as { isOut?: boolean }).isOut = true;
	setRatingDie(props.node, rangeTop(props.node, fallbacks.value) + 2, ownRange);
	emit('change');
}

function toggleNodePool() {
	if (!props.node) return;
	const next = !isNodePool.value;
	props.node.pool = next;
	if (next && activeMode.value !== 'Dice') {
		selectMode('Dice');
		return;
	}
	emit('change');
}

function toggleNodeSpendable() {
	if (!props.node) return;
	props.node.spendable = !isNodeSpendable.value;
	emit('change');
}

function addPoolDie(size: number) {
	if (!props.node) return;
	const ownRange = ownRangeIfPresent();
	const next = [...activeDicePool.value, size].sort((a, b) => b - a);
	props.node.rating = {
		type: 'Dice',
		value: next,
		...(ownRange ? { range: ownRange } : {}),
	};
	syncDiceCountIfNeeded(next.length);
	emit('change');
}

function removePoolDieAt(index: number) {
	if (!props.node) return;
	const ownRange = ownRangeIfPresent();
	const next = [...activeDicePool.value];
	if (index < 0 || index >= next.length) return;
	next.splice(index, 1);
	props.node.rating = {
		type: 'Dice',
		value: next,
		...(ownRange ? { range: ownRange } : {}),
	};
	syncDiceCountIfNeeded(next.length);
	emit('change');
}

function togglePipAt(index: number) {
	if (!props.node) return;
	const next = [...pipValues.value];
	if (index < 0 || index >= next.length) return;
	next[index] = !next[index];
	props.node.rating = {
		type: 'Pip',
		value: next,
	};
	emit('change');
}

function adjustPipCount(delta: number) {
	if (!props.node) return;
	const cur = pipValues.value;
	const nextLen = Math.max(1, Math.min(12, cur.length + delta));
	if (nextLen === cur.length) return;
	const next: boolean[] = [];
	for (let i = 0; i < nextLen; i++) {
		next.push(Boolean(cur[i]));
	}
	props.node.rating = {
		type: 'Pip',
		value: next,
	};
	emit('change');
}

function setCounter(val: number) {
	if (!props.node) return;
	const [lo, hi] = counterBounds.value;
	const clamped = Math.max(lo, Math.min(hi, Math.floor(Number.isFinite(val) ? val : lo)));
	props.node.rating = {
		type: 'Counter',
		value: [clamped],
		range: [lo, hi],
	};
	emit('change');
}

function onCounterInput(event: Event) {
	const raw = Number((event.target as HTMLInputElement).value);
	if (Number.isFinite(raw)) {
		setCounter(raw);
	}
}

function onCounterEnter(event: KeyboardEvent) {
	if (event.isComposing || event.keyCode === 229) return;
	(event.target as HTMLElement | null)?.blur?.();
}

function handleClose() {
	if (activeMode.value === 'Dice' && activeDicePool.value.length === 0) {
		delete props.node.rating;
		emit('change');
	}
	emit('close');
}

function getDieDisplayValue(size: number, filled: boolean): string {
	return characterCurioFunctions.renderDieconSVG(size, filled, '', props.diceConfig ?? undefined);
}
</script>

<template>
	<div class="inline-rating-bar" role="region" :aria-label="`${subjectLabel} rating`" @click.stop>
		<div class="inline-rating-header">
			<div class="inline-rating-modes" role="group" aria-label="Rating type">
				<button
					v-for="opt in MODE_OPTIONS"
					:key="opt.id"
					type="button"
					class="inline-rating-mode-btn"
					:class="{ active: activeMode === opt.id }"
					:aria-pressed="activeMode === opt.id"
					@click.stop="selectMode(opt.id)"
				>
					{{ opt.label }}
				</button>
			</div>
			<div class="inline-rating-actions">
				<button
					v-if="showMore"
					type="button"
					class="btn-inline-rating-icon"
					title="More options"
					aria-label="More options"
					@click.stop="emit('openMore')"
				>
					<i class="fas fa-sliders" aria-hidden="true"></i>
				</button>
				<button
					v-if="showDelete"
					type="button"
					class="btn-inline-rating-icon is-danger"
					title="Delete"
					aria-label="Delete trait"
					@click.stop="emit('delete')"
				>
					<i class="fas fa-trash" aria-hidden="true"></i>
				</button>
				<button
					type="button"
					class="btn-inline-rating-icon"
					title="Done"
					aria-label="Close rating picker"
					@click.stop="handleClose"
				>
					<i class="fas fa-check" aria-hidden="true"></i>
				</button>
			</div>
		</div>

		<div v-if="activeMode === 'Die'" class="inline-rating-body">
			<div class="inline-rating-dice-row" role="group" :aria-label="`${subjectLabel} die size`">
				<button
					v-for="size in dieScale"
					:key="'ir-die-' + size"
					type="button"
					class="inline-rating-die-btn"
					:class="{ active: activeSingleDie === size && !isNodeOut }"
					:aria-pressed="activeSingleDie === size && !isNodeOut"
					:aria-label="`Set d${size}`"
					@click.stop="pickSingleDie(size)"
				>
					<span class="diecon-wrapper" v-html="getDieDisplayValue(size, activeSingleDie === size && !isNodeOut)"></span>
				</button>
				<button
					v-if="canPickOut"
					type="button"
					class="inline-rating-die-btn inline-rating-out-btn"
					:class="{ active: isNodeOut }"
					:aria-pressed="isNodeOut"
					:aria-label="`Set ${outLabel}`"
					@click.stop="pickOut"
				>
					<span class="inline-out-label">{{ outLabel }}</span>
				</button>
			</div>
		</div>

		<div v-else-if="activeMode === 'Dice'" class="inline-rating-body inline-rating-body-dice">
			<div class="inline-dice-pool" role="group" aria-label="Active dice">
				<button
					v-for="(dieSize, dIdx) in activeDicePool"
					:key="'ir-pool-' + dIdx + '-' + dieSize"
					type="button"
					class="inline-pool-die-chip"
					:aria-label="`Remove d${dieSize}`"
					:title="`Remove d${dieSize}`"
					@click.stop="removePoolDieAt(dIdx)"
				>
					<span class="diecon-wrapper" v-html="getDieDisplayValue(dieSize, true)"></span>
					<span class="inline-pool-remove-badge" aria-hidden="true"><i class="fas fa-xmark"></i></span>
				</button>
				<span v-if="activeDicePool.length === 0" class="inline-dice-empty">Tap + below to add dice</span>
			</div>
			<div class="inline-dice-palette" role="group" aria-label="Add die">
				<span class="inline-dice-add-label"><i class="fas fa-plus" aria-hidden="true"></i></span>
				<button
					v-for="size in dieScale"
					:key="'ir-add-' + size"
					type="button"
					class="inline-rating-die-btn"
					:aria-label="`Add d${size}`"
					:title="`Add d${size}`"
					@click.stop="addPoolDie(size)"
				>
					<span class="diecon-wrapper" v-html="getDieDisplayValue(size, false)"></span>
				</button>
			</div>
			<div class="inline-dice-options" role="group" aria-label="Dice options">
				<button
					type="button"
					class="inline-dice-option-chip"
					:class="{ active: isNodePool }"
					:aria-pressed="isNodePool"
					@click.stop="toggleNodePool"
				>
					Pool
				</button>
				<button
					type="button"
					class="inline-dice-option-chip"
					:class="{ active: isNodeSpendable }"
					:aria-pressed="isNodeSpendable"
					@click.stop="toggleNodeSpendable"
				>
					Spendable
				</button>
			</div>
		</div>

		<div v-else-if="activeMode === 'Pip'" class="inline-rating-body inline-rating-body-pip">
			<div class="inline-pip-bubbles" role="group" aria-label="Pips">
				<button
					v-for="(filled, pIdx) in pipValues"
					:key="'ir-pip-' + pIdx"
					type="button"
					class="inline-pip-btn"
					role="checkbox"
					:aria-checked="filled ? 'true' : 'false'"
					:aria-label="`Pip ${pIdx + 1}`"
					@click.stop="togglePipAt(pIdx)"
				>
					<span class="pip-bubble" :class="{ filled }"></span>
				</button>
			</div>
			<div class="inline-count-stepper" role="group" aria-label="Pip count">
				<button
					type="button"
					class="btn-inline-step"
					:disabled="pipValues.length <= 1"
					aria-label="Fewer pips"
					@click.stop="adjustPipCount(-1)"
				>
					<i class="fas fa-minus" aria-hidden="true"></i>
				</button>
				<span class="inline-step-count">{{ pipValues.length }}</span>
				<button
					type="button"
					class="btn-inline-step"
					:disabled="pipValues.length >= 12"
					aria-label="More pips"
					@click.stop="adjustPipCount(1)"
				>
					<i class="fas fa-plus" aria-hidden="true"></i>
				</button>
			</div>
		</div>

		<div v-else-if="activeMode === 'Counter'" class="inline-rating-body inline-rating-body-counter">
			<div class="inline-count-stepper">
				<button
					type="button"
					class="btn-inline-step"
					:disabled="counterVal <= counterBounds[0]"
					aria-label="Decrease counter"
					@click.stop="setCounter(counterVal - 1)"
				>
					<i class="fas fa-minus" aria-hidden="true"></i>
				</button>
				<input
					type="number"
					class="inline-counter-input"
					inputmode="numeric"
					:min="counterBounds[0]"
					:max="counterBounds[1]"
					:value="counterVal"
					:aria-label="`${subjectLabel} counter`"
					@change="onCounterInput"
					@keydown.enter="onCounterEnter"
				/>
				<button
					type="button"
					class="btn-inline-step"
					:disabled="counterVal >= counterBounds[1]"
					aria-label="Increase counter"
					@click.stop="setCounter(counterVal + 1)"
				>
					<i class="fas fa-plus" aria-hidden="true"></i>
				</button>
			</div>
		</div>
	</div>
</template>
