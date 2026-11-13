<script setup lang="ts">
import { computed, ref } from 'vue';
import { injectTraitSetEditor } from './use-trait-set-editor.ts';
import {
	getRating,
	getView,
	hasOutRange,
	isOutDie,
	preserveInheritedTraitTypes,
	rangeTop,
	ratingDice,
	resolveRange,
	resolveRating,
	setRatingDie,
} from './model.ts';

const {
	needsDiceUI,
	isRatingIncluded,
	toggleRatingOption,
	getDieDisplayValue,
	traitSet,
	setRating,
	ratingLadder,
	commitCharacter,
	setSubtraits,
	openSetSubtrait,
	removeSetSubtrait,
	createSubtrait,
	isPool,
	setSpendable,
	setEditableOnSheet,
	setHitches,
	traitSetID,
	includeOut,
	endWord,
	ratingDisplay,
} = injectTraitSetEditor();

const RATING_TYPES = ['Die', 'Dice', 'Counter', 'Pip'] as const;

const ratingType = computed(() => getRating(traitSet.value)?.type ?? null);

const confirmRatingChange = ref<'Counter' | 'Die' | 'Dice' | 'Pip' | null>(null);

const setDieRange = computed(() => resolveRange(traitSet.value));

const shouldShowSetOut = computed(
	() => getView(traitSet.value)?.style?.body === 'die-track' || hasOutRange(traitSet.value, [traitSet.value]),
);

const isSetOut = computed(() => isOutDie(traitSet.value, [traitSet.value]));

const setOutLabel = computed(() => {
	const labels = getView(traitSet.value)?.labels;
	if (labels && typeof labels.out === 'string' && labels.out.length) return labels.out;
	return 'OUT';
});

function requestRatingType(type: 'Counter' | 'Die' | 'Dice' | 'Pip') {
	const ts = traitSet.value as unknown as Record<string, any> | null;
	if (!ts) return;
	const cur = getRating(ts);
	if (cur?.type === type) return;
	const hasChildValues =
		Array.isArray(ts.traits) &&
		ts.traits.some(
			(ct: any) => resolveRating(ct, [ts]) !== undefined || (Array.isArray(ct?.traits) && ct.traits.length > 0),
		);
	if (hasChildValues) {
		confirmRatingChange.value = type;
	} else {
		setRatingType(type);
	}
}

function setRatingType(type: 'Counter' | 'Die' | 'Dice' | 'Pip') {
	confirmRatingChange.value = null;
	const ts = traitSet.value as unknown as Record<string, any> | null;
	if (!ts) return;
	const cur = getRating(ts);
	if (cur?.type === type) return;
	if (Array.isArray(ts.traits)) {
		ts.traits.forEach((ct: any) => {
			if (ct && typeof ct === 'object' && ct.rating) {
				ct.rating.value = [];
			}
		});
	}
	const scale = ratingLadder.value;
	const size = Array.isArray(scale) && scale.length ? scale[0] : 8;
	const ownPrevRange = cur && Array.isArray(cur.range) && cur.range.length ? [...cur.range] : undefined;
	if ((cur?.type === 'Die' || cur?.type === 'Dice') && (type === 'Die' || type === 'Dice')) {
		const dice = cur ? ratingDice(cur) : [];
		const list = dice.length ? dice : [size];
		if (type === 'Die') setRatingDie(ts, list[0], ownPrevRange);
		else
			ts.rating = {
				type: 'Dice',
				value: list,
				...(ownPrevRange ? { range: ownPrevRange } : {}),
				...(cur && (cur as any).out === true ? { out: true } : {}),
			};
	} else if (type === 'Die') {
		setRatingDie(ts, size);
	} else if (type === 'Dice') {
		ts.rating = { type: 'Dice', value: [size] };
	} else if (type === 'Counter') {
		ts.rating = { type: 'Counter', value: [0], range: [0, 20] };
	} else {
		ts.rating = { type: 'Pip', value: [false] };
	}
	commitCharacter();
}

function clearSetRating() {
	const ts = traitSet.value as unknown as Record<string, any> | null;
	if (!ts) return;
	preserveInheritedTraitTypes(ts);
	delete ts.rating;
	commitCharacter();
}

function toggleSetRating(size: number | null) {
	if (size === null) {
		clearSetRating();
		return;
	}
	setRating.value = !isSetOut.value && setRating.value === size ? null : size;
}

function toggleSetOutValue() {
	const ts = traitSet.value as unknown as Record<string, any> | null;
	if (!ts) return;
	if (isSetOut.value) {
		preserveInheritedTraitTypes(ts);
		delete ts.rating;
	} else {
		setRatingDie(ts, rangeTop(ts, [ts]) + 2);
		if (ts.rating && typeof ts.rating === 'object') {
			ts.rating.out = true;
		}
	}
	commitCharacter();
}

const setDiceList = computed(() => {
	const r = getRating(traitSet.value);
	return r && r.type === 'Dice' ? ratingDice(r) : [];
});

function writeSetDice(next: number[]) {
	const ts = traitSet.value as unknown as Record<string, any> | null;
	if (!ts) return;
	const prev = ts.rating && typeof ts.rating === 'object' && !Array.isArray(ts.rating) ? ts.rating : {};
	ts.rating = {
		...prev,
		type: 'Dice',
		value: next,
	};
	commitCharacter();
}

function getSetDieCount(size: number) {
	return setDiceList.value.filter((d) => d === size).length;
}

function addDieToSet(size: number) {
	writeSetDice([...setDiceList.value, size].sort((a, b) => b - a));
}

function removeDieFromSet(size: number) {
	const current = [...setDiceList.value];
	const idx = current.indexOf(size);
	if (idx !== -1) {
		current.splice(idx, 1);
		writeSetDice(current);
	}
}

function removeSetDieAtIndex(index: number) {
	const current = [...setDiceList.value];
	if (index >= 0 && index < current.length) {
		current.splice(index, 1);
		writeSetDice(current);
	}
}

function stepDownSetDieAtIndex(index: number) {
	const current = [...setDiceList.value];
	if (index >= 0 && index < current.length) {
		const sizes = [12, 10, 8, 6, 4];
		const sIdx = sizes.indexOf(current[index]);
		if (sIdx !== -1 && sIdx < sizes.length - 1) {
			current[index] = sizes[sIdx + 1];
		} else {
			current.splice(index, 1);
		}
		current.sort((a, b) => b - a);
		writeSetDice(current);
	}
}

function counterBounds(): [number, number] {
	const r = getRating(traitSet.value);
	if (r && r.type === 'Counter') {
		const nums = (r.range || []).filter((n): n is number => typeof n === 'number');
		if (nums.length >= 2) {
			const lo = nums[0],
				hi = nums[1];
			return lo <= hi ? [lo, hi] : [hi, lo];
		}
	}
	return [0, 20];
}

const setCounterNumber = computed({
	get() {
		const r = getRating(traitSet.value);
		if (r && r.type === 'Counter' && typeof r.value[0] === 'number') return r.value[0];
		return 0;
	},
	set(val: any) {
		const ts = traitSet.value as unknown as Record<string, any> | null;
		if (!ts) return;
		const [lo, hi] = counterBounds();
		let n = Math.floor(Number(val));
		if (!Number.isFinite(n)) n = lo;
		n = Math.max(lo, Math.min(hi, n));
		ts.rating = { type: 'Counter', value: [n], range: [lo, hi] };
		commitCharacter();
	},
});

function commitCounterBound(which: 0 | 1, event: Event) {
	const ts = traitSet.value as unknown as Record<string, any> | null;
	if (!ts) return;
	const el = event && (event.target as HTMLInputElement | null);
	let [lo, hi] = counterBounds();
	const n = Math.floor(Number(el ? el.value : NaN));
	if (Number.isFinite(n)) {
		if (which === 0) {
			lo = n;
			if (lo > hi) hi = lo;
		} else {
			hi = n;
			if (hi < lo) lo = hi;
		}
		const cur = typeof getRating(ts)?.value[0] === 'number' ? ((getRating(ts) as any).value[0] as number) : lo;
		ts.rating = { type: 'Counter', value: [Math.max(lo, Math.min(hi, cur))], range: [lo, hi] };
		commitCharacter();
	}
	if (el && document.activeElement === el) el.blur();
}

const setPipBubbleCount = computed(() => {
	const r = getRating(traitSet.value);
	if (!r || r.type !== 'Pip') return 0;
	return r.value.length;
});

function pipBubbleAt(index: number): boolean {
	const r = getRating(traitSet.value);
	return Boolean(r && r.type === 'Pip' && r.value[index] === true);
}

function togglePipBubble(index: number) {
	const ts = traitSet.value as unknown as Record<string, any> | null;
	if (!ts) return;
	const n = Math.max(setPipBubbleCount.value, index + 1);
	const cur = getRating(ts);
	const list: boolean[] = [];
	for (let i = 0; i < n; i++) {
		list.push(Boolean(cur && cur.type === 'Pip' && cur.value[i] === true));
	}
	list[index] = !list[index];
	ts.rating = { type: 'Pip', value: list };
	commitCharacter();
}

function updatePipBubbleCount(count: number) {
	const ts = traitSet.value as unknown as Record<string, any> | null;
	if (!ts) return;
	const clamped = Math.max(1, Math.min(100, Math.floor(Number(count)) || 1));
	const cur = getRating(ts);
	const list: boolean[] = [];
	for (let i = 0; i < clamped; i++) {
		list.push(Boolean(cur && cur.type === 'Pip' && cur.value[i] === true));
	}
	ts.rating = { type: 'Pip', value: list };
	commitCharacter();
}

function commitPipBubbleCount(event: Event) {
	const el = event && (event.target as HTMLInputElement | null);
	if (!el) return;
	updatePipBubbleCount(Number(el.value));
	if (document.activeElement === el) el.blur();
}
</script>

<template>
	<!-- RANGE (OPT IN/OUT OF RATINGS) -->
	<div class="editor-field" v-if="needsDiceUI">
		<label>Range</label>
		<div class="rating-scale-container">
			<div class="rating-scale-chips">
				<button
					type="button"
					v-for="size in [4, 6, 8, 10, 12]"
					:key="size"
					class="rating-scale-chip"
					:class="{ active: isRatingIncluded(size) }"
					:aria-pressed="isRatingIncluded(size)"
					:aria-label="(isRatingIncluded(size) ? 'Exclude d' : 'Include d') + size"
					@click.stop="toggleRatingOption(size)"
					:title="(isRatingIncluded(size) ? 'Exclude d' : 'Include d') + size"
				>
					<span v-html="getDieDisplayValue(size, isRatingIncluded(size))"></span>
				</button>
				<button
					type="button"
					class="rating-scale-chip rating-scale-chip-out"
					:class="{ active: includeOut }"
					:aria-pressed="includeOut"
					@click.stop="includeOut = !includeOut"
					:title="(includeOut ? 'Disable' : 'Enable') + ' Out marker'"
				>
					<span class="chip-label chip-out-label">OUT</span>
				</button>
			</div>
		</div>
		<div class="editor-row-between mt-sm" v-if="includeOut">
			<label :for="'trait-set-' + traitSetID + '-end-word'" class="m-0">End Word</label>
			<input
				type="text"
				:id="'trait-set-' + traitSetID + '-end-word'"
				name="endWord"
				v-model="endWord"
				placeholder="OUT"
				class="editor-input-short"
			/>
		</div>
	</div>

	<!-- RATING (THE SET NODE'S OWN; UNRATED TRAITS FALL THROUGH TO IT) -->
	<div class="editor-field" v-if="needsDiceUI">
		<label>Rating</label>

		<!-- Warning Prompt if child values would be cleared -->
		<div class="editor-warning-prompt editor-warning-banner mb-sm" v-if="confirmRatingChange">
			<span>Changing rating type will clear existing ratings. Proceed?</span>
			<div class="mt-xs">
				<button
					type="button"
					class="btn-step btn-warning-confirm px-2"
					@click.stop="setRatingType(confirmRatingChange)"
				>
					Proceed
				</button>
				<button type="button" class="btn-step px-2 ms-2" @click.stop="confirmRatingChange = null">Cancel</button>
			</div>
		</div>

		<!-- TYPE (Die | Dice | Counter | Pip) -->
		<div class="editor-button-group mb-sm">
			<button
				type="button"
				v-for="rt in RATING_TYPES"
				:key="'set-rating-type-' + rt"
				class="editor-group-btn"
				:class="{ active: ratingType === rt }"
				:aria-pressed="ratingType === rt"
				@click.stop="requestRatingType(rt)"
			>
				{{ rt }}
			</button>
		</div>

		<!-- SINGLE DIE SELECTOR -->
		<div class="rating-scale-container" v-if="ratingType === 'Die' || ratingType === null">
			<div class="rating-scale-chips set-rating-die-chips" :class="{ 'has-out-chip': shouldShowSetOut }">
				<button
					type="button"
					class="rating-scale-chip set-rating-die-none"
					:class="{ active: ratingType === null || (ratingType === 'Die' && setRating === null && !isSetOut) }"
					:aria-pressed="ratingType === null || (ratingType === 'Die' && setRating === null && !isSetOut)"
					@click.stop="toggleSetRating(null)"
					title="No rating"
				>
					<span class="chip-label">None</span>
				</button>
				<button
					type="button"
					v-for="size in setDieRange"
					:key="size"
					class="rating-scale-chip"
					:class="{ active: ratingType === 'Die' && setRating === size && !isSetOut }"
					:aria-pressed="ratingType === 'Die' && setRating === size && !isSetOut"
					:aria-label="(setRating === size && !isSetOut ? 'Clear d' : 'Set d') + size"
					@click.stop="toggleSetRating(size)"
					:title="
						(setRating === size && !isSetOut ? 'Clear the rating (was d' : 'Set the rating to d') +
						size +
						(setRating === size && !isSetOut ? ')' : '')
					"
				>
					<span v-html="getDieDisplayValue(size, ratingType === 'Die' && setRating === size && !isSetOut)"></span>
				</button>
				<button
					type="button"
					v-if="shouldShowSetOut"
					class="rating-scale-chip rating-scale-chip-out"
					:class="{ active: isSetOut }"
					:aria-pressed="isSetOut"
					@click.stop="toggleSetOutValue"
					title="Out"
				>
					<span class="chip-label chip-out-label">{{ setOutLabel }}</span>
				</button>
			</div>
		</div>

		<!-- DICE LIST EDITOR -->
		<div class="editor-multidie-container" v-else-if="ratingType === 'Dice'">
			<div class="editor-die-steppers">
				<div
					v-for="size in setDieRange"
					:key="'set-stepper-' + size"
					class="die-stepper-item"
					:class="{ active: getSetDieCount(size) > 0 }"
				>
					<span v-html="getDieDisplayValue(size, getSetDieCount(size) > 0)"></span>
					<div class="stepper-controls">
						<button
							type="button"
							class="btn-step"
							@click.stop="removeDieFromSet(size)"
							:disabled="getSetDieCount(size) === 0"
							:aria-label="'Remove d' + size"
							:title="'Remove d' + size"
						>
							-
						</button>
						<span class="stepper-count">{{ getSetDieCount(size) }}</span>
						<button
							type="button"
							class="btn-step"
							@click.stop="addDieToSet(size)"
							:aria-label="'Add d' + size"
							:title="'Add d' + size"
						>
							+
						</button>
					</div>
				</div>
			</div>

			<div class="multidie-active-list" v-if="setDiceList.length > 0">
				<span class="sub-label">Pool ({{ setDiceList.length }})</span>
				<div class="multidie-chips">
					<div v-for="(dieSize, dIdx) in setDiceList" :key="dIdx" class="multidie-chip">
						<span v-html="getDieDisplayValue(dieSize, true)"></span>
						<button
							type="button"
							class="btn-step-down"
							@click.stop="stepDownSetDieAtIndex(dIdx)"
							title="Step down die size"
							:aria-label="'Step down d' + dieSize"
						>
							-2
						</button>
						<button
							type="button"
							class="btn-remove-die"
							@click.stop="removeSetDieAtIndex(dIdx)"
							title="Remove die"
							:aria-label="'Remove d' + dieSize"
						>
							×
						</button>
					</div>
				</div>
			</div>
		</div>

		<!-- COUNTER NUMBER + RANGE -->
		<div v-else-if="ratingType === 'Counter'">
			<div class="editor-row-inline flex-wrap">
				<div class="flex-1 min-w-5rem">
					<label :for="'trait-set-' + traitSetID + '-counter-number'" class="editor-sub-label">Count</label>
					<input
						type="number"
						:id="'trait-set-' + traitSetID + '-counter-number'"
						name="setCounterNumber"
						v-model.number="setCounterNumber"
						inputmode="numeric"
						class="w-full"
					/>
				</div>
				<div class="flex-1 min-w-4rem">
					<label :for="'trait-set-' + traitSetID + '-counter-min'" class="editor-sub-label">Min</label>
					<input
						type="number"
						:id="'trait-set-' + traitSetID + '-counter-min'"
						name="setCounterMin"
						:value="counterBounds()[0]"
						@change="commitCounterBound(0, $event)"
						inputmode="numeric"
						class="w-full"
					/>
				</div>
				<div class="flex-1 min-w-4rem">
					<label :for="'trait-set-' + traitSetID + '-counter-max'" class="editor-sub-label">Max</label>
					<input
						type="number"
						:id="'trait-set-' + traitSetID + '-counter-max'"
						name="setCounterMax"
						:value="counterBounds()[1]"
						@change="commitCounterBound(1, $event)"
						inputmode="numeric"
						class="w-full"
					/>
				</div>
			</div>
		</div>

		<!-- PIP BUBBLE ROW -->
		<div v-else-if="ratingType === 'Pip'">
			<div class="pip-editor-row">
				<div
					v-for="bubbleIndex in setPipBubbleCount"
					:key="'set-pip-' + bubbleIndex"
					class="pip-bubble-wrap"
					tabindex="0"
					role="checkbox"
					:aria-checked="pipBubbleAt(bubbleIndex - 1) ? 'true' : 'false'"
					:aria-label="'Pip ' + bubbleIndex"
					@keydown.enter.prevent="togglePipBubble(bubbleIndex - 1)"
					@keydown.space.prevent="togglePipBubble(bubbleIndex - 1)"
					@click.stop="togglePipBubble(bubbleIndex - 1)"
					:title="pipBubbleAt(bubbleIndex - 1) ? 'Unfill bubble' : 'Fill bubble'"
				>
					<div class="pip-bubble" :class="{ filled: pipBubbleAt(bubbleIndex - 1) }"></div>
				</div>
				<span class="pip-editor-count" v-if="setPipBubbleCount === 0">No bubbles</span>
			</div>
			<div class="num-stepper mt-sm">
				<button
					type="button"
					class="btn-step"
					@click.stop="updatePipBubbleCount(setPipBubbleCount - 1)"
					:disabled="setPipBubbleCount <= 1"
					title="Fewer bubbles"
					aria-label="Fewer bubbles"
				>
					-
				</button>
				<input
					type="number"
					:id="'trait-set-' + traitSetID + '-pip-count'"
					name="setPipBubbleCount"
					min="1"
					max="100"
					:value="setPipBubbleCount"
					@change="commitPipBubbleCount($event)"
					inputmode="numeric"
					aria-label="Bubble count"
					class="editor-input-short"
				/>
				<button
					type="button"
					class="btn-step"
					@click.stop="updatePipBubbleCount(setPipBubbleCount + 1)"
					title="More bubbles"
					aria-label="More bubbles"
				>
					+
				</button>
			</div>
		</div>
	</div>

	<!-- RATING DISPLAY (FULL TRACK OR SINGLE DIE) -->
	<div class="editor-field" v-if="needsDiceUI">
		<label :for="'trait-set-' + traitSetID + '-rating-display'">Rating Display</label>
		<div class="editor-button-group">
			<button
				type="button"
				class="editor-group-btn"
				:class="{ active: (ratingDisplay || 'track') === 'track' }"
				:aria-pressed="(ratingDisplay || 'track') === 'track'"
				@click.stop="ratingDisplay = 'track'"
			>
				Full Track
			</button>
			<button
				type="button"
				class="editor-group-btn"
				:class="{ active: ratingDisplay === 'rating' }"
				:aria-pressed="ratingDisplay === 'rating'"
				@click.stop="ratingDisplay = 'rating'"
			>
				Single Die
			</button>
		</div>
	</div>

	<!-- SUBTRAITS -->
	<div class="editor-field" v-if="needsDiceUI">
		<div class="editor-row-between">
			<div class="editor-label m-0">Subtraits</div>
			<button type="button" class="editor-button" @click.stop="createSubtrait">
				<span><i class="fas fa-plus" aria-hidden="true"></i> Create subtrait</span>
			</button>
		</div>
		<div class="editor-subtrait-list mt-sm" v-if="setSubtraits.length > 0">
			<div
				v-for="(item, itemIdx) in setSubtraits"
				:key="'set-sub-' + item.idx + '-' + (item.sfxIdx ?? itemIdx)"
				class="editor-subtrait-row"
			>
				<button
					type="button"
					class="editor-subtrait-drill"
					@click.stop="openSetSubtrait(item)"
					:title="'Edit ' + item.label"
				>
					<span class="editor-subtrait-name">{{ item.label }}</span>
					<span class="editor-subtrait-meta">
						<span class="editor-subtrait-badge">{{ item.summary }}</span>
						<i class="fas fa-chevron-right editor-subtrait-chevron" aria-hidden="true"></i>
					</span>
				</button>
				<button
					type="button"
					class="editor-subtrait-delete"
					@click.stop="removeSetSubtrait(item)"
					:title="'Delete ' + item.label"
					:aria-label="'Delete ' + item.label"
				>
					<i class="fas fa-trash" aria-hidden="true"></i>
				</button>
			</div>
		</div>
	</div>

	<!-- OPTIONS -->
	<div class="editor-field" v-if="needsDiceUI">
		<div class="editor-label">Options</div>
		<div class="editor-row-inline flex-wrap">
			<div class="editor-checkbox-row">
				<input
					type="checkbox"
					:id="'trait-set-' + traitSetID + '-pool'"
					:true-value="true"
					:false-value="false"
					v-model="isPool"
				/>
				<label
					:for="'trait-set-' + traitSetID + '-pool'"
					title="Clicking a trait adds its whole array of available dice to the roller"
					>Pool</label
				>
			</div>

			<div class="editor-checkbox-row">
				<input
					type="checkbox"
					:id="'trait-set-' + traitSetID + '-spendable'"
					:true-value="true"
					:false-value="false"
					v-model="setSpendable"
				/>
				<label :for="'trait-set-' + traitSetID + '-spendable'">Spendable</label>
			</div>

			<div class="editor-checkbox-row">
				<input
					type="checkbox"
					:id="'trait-set-' + traitSetID + '-editable-sheet'"
					:true-value="true"
					:false-value="false"
					v-model="setEditableOnSheet"
				/>
				<label :for="'trait-set-' + traitSetID + '-editable-sheet'">Editable on sheet</label>
			</div>
		</div>

		<div class="editor-row-between mt-md">
			<label :for="'trait-set-' + traitSetID + '-hitches'" class="m-0">Hitches on</label>
			<div class="num-stepper">
				<button
					type="button"
					class="btn-step"
					@click.stop="setHitches = Math.max(0, (setHitches ?? 1) - 1)"
					:disabled="(setHitches ?? 1) <= 0"
					title="Lower hitch threshold"
					aria-label="Lower hitch threshold"
				>
					-
				</button>
				<input
					type="number"
					:id="'trait-set-' + traitSetID + '-hitches'"
					name="setHitches"
					min="0"
					max="2"
					v-model.number="setHitches"
					placeholder="1"
					inputmode="numeric"
					aria-label="Hitches on"
				/>
				<button
					type="button"
					class="btn-step"
					@click.stop="setHitches = Math.min(2, (setHitches ?? 1) + 1)"
					:disabled="(setHitches ?? 1) >= 2"
					title="Raise hitch threshold"
					aria-label="Raise hitch threshold"
				>
					+
				</button>
			</div>
		</div>
	</div>
</template>
