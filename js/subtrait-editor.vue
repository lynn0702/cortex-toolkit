<script setup lang="ts">
import { computed, getCurrentInstance, onMounted, ref, watch } from 'vue';
import { cortexFunctions } from './functions.ts';
import {
	getView,
	ensureView,
	getRating,
	ratingDice,
	setRatingDie,
	DIE_LADDER,
	type Character,
	type Trait,
} from './model.ts';

const props = defineProps<{
	character: Character;
	traitSetID: number;
	traitID: number | null;
	subtraitID: number;
	submode?: string | null;
	entries?: Trait[];
	entryLabel?: string;
}>();

const isPlay = computed(() => props.submode === 'play');

const emit = defineEmits<{
	(e: 'updateCharacter', character: Character): void;
	(e: 'removeSubtrait', subtraitID: number): void;
}>();

const instance = getCurrentInstance();
const rootTemplates = () => (instance?.proxy as any)?.$root?.sheetTemplates ?? null;

const inputName = ref<HTMLInputElement | null>(null);
const confirmDelete = ref(false);

watch(
	() => props.subtraitID,
	() => {
		confirmDelete.value = false;
	},
);

onMounted(() => {
	if (inputName.value && (!name.value || name.value.startsWith('New '))) {
		inputName.value.focus();
		inputName.value.select();
	}
});

const parent = computed<any>(() => {
	const traitSet = props.character.traitSets[props.traitSetID];
	return props.traitID === null ? traitSet : traitSet?.traits?.[props.traitID];
});

const subtrait = computed<Trait>(() => {
	if (props.entries) return props.entries[props.subtraitID];
	return parent.value.traits![props.subtraitID];
});

const entryLabel = computed(() => props.entryLabel || 'Subtrait');

const name = computed({
	get() {
		return subtrait.value.name;
	},
	set(value: string) {
		setSubtraitProperty('name', value);
	},
});

const description = computed({
	get() {
		return subtrait.value.description || '';
	},
	set(value: string) {
		setSubtraitProperty('description', value);
	},
});

const availableValues = computed(() => {
	const s = props.traitSetID;
	const traitSet = props.character.traitSets[s];
	return cortexFunctions.getSubtraitSlotRatings(traitSet, props.subtraitID);
});

const RATING_TYPES = ['Die', 'Dice', 'Counter', 'Pip'] as const;
type RatingType = (typeof RATING_TYPES)[number] | 'None';

const currentRatingType = computed<RatingType>(() => {
	const r = getRating(subtrait.value);
	if (!r || !r.type) return 'None';
	return r.type;
});

const confirmRatingChange = ref<RatingType | null>(null);

function requestRatingType(targetType: RatingType) {
	if (currentRatingType.value === targetType) return;
	const hasChildValues =
		Array.isArray(subtrait.value.traits) &&
		subtrait.value.traits.some(
			(ct: any) => getRating(ct) !== undefined || (Array.isArray(ct.traits) && ct.traits.length > 0),
		);
	if (hasChildValues) {
		confirmRatingChange.value = targetType;
	} else {
		applyRatingType(targetType);
	}
}

function applyRatingType(type: RatingType) {
	confirmRatingChange.value = null;
	const st = subtrait.value as unknown as Record<string, any>;
	if (type === 'None') {
		delete st.rating;
	} else if (type === 'Die') {
		const scale = availableValues.value;
		const size = scale[0] || 6;
		setRatingDie(st, size, scale);
	} else if (type === 'Dice') {
		const scale = availableValues.value;
		const size = scale[0] || 6;
		st.rating = { type: 'Dice', value: [size], range: scale && scale.length ? scale : [...DIE_LADDER] };
	} else if (type === 'Counter') {
		st.rating = { type: 'Counter', value: [0], range: [0, 20] };
	} else if (type === 'Pip') {
		st.rating = { type: 'Pip', value: [false] };
	}
	updateCharacter(props.character);
}

function counterBounds(): [number, number] {
	const r = getRating(subtrait.value);
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

const counterNumber = computed({
	get() {
		const r = getRating(subtrait.value);
		if (r && r.type === 'Counter' && typeof r.value[0] === 'number') return r.value[0];
		return 0;
	},
	set(val: any) {
		const st = subtrait.value as unknown as Record<string, any>;
		if (!st) return;
		const [lo, hi] = counterBounds();
		let n = Math.floor(Number(val));
		if (!Number.isFinite(n)) n = lo;
		n = Math.max(lo, Math.min(hi, n));
		st.rating = { type: 'Counter', value: [n], range: [lo, hi] };
		updateCharacter(props.character);
	},
});

function stepCounterDown() {
	const [lo] = counterBounds();
	if (counterNumber.value > lo) counterNumber.value = counterNumber.value - 1;
}

function stepCounterUp() {
	const [, hi] = counterBounds();
	if (counterNumber.value < hi) counterNumber.value = counterNumber.value + 1;
}

function setCounterBound(which: 0 | 1, val: any) {
	const st = subtrait.value as unknown as Record<string, any>;
	if (!st) return;
	let [lo, hi] = counterBounds();
	const n = Math.floor(Number(val));
	if (!Number.isFinite(n)) return;
	if (which === 0) {
		lo = n;
		if (lo > hi) hi = lo;
	} else {
		hi = n;
		if (hi < lo) lo = hi;
	}
	const cur = typeof getRating(st)?.value[0] === 'number' ? ((getRating(st) as any).value[0] as number) : lo;
	st.rating = { type: 'Counter', value: [Math.max(lo, Math.min(hi, cur))], range: [lo, hi] };
	updateCharacter(props.character);
}

const pipValue = computed({
	get() {
		const r = getRating(subtrait.value);
		return Boolean(r && r.type === 'Pip' && r.value[0] === true);
	},
	set(val: boolean) {
		const st = subtrait.value as unknown as Record<string, any>;
		st.rating = { type: 'Pip', value: [Boolean(val)] };
		updateCharacter(props.character);
	},
});

function togglePip() {
	pipValue.value = !pipValue.value;
}

const diceList = computed<number[]>(() => {
	const r = getRating(subtrait.value);
	if (r && r.type === 'Dice' && Array.isArray(r.value)) {
		return r.value.filter((v): v is number => typeof v === 'number');
	}
	return [];
});

function addDieToDice() {
	const st = subtrait.value as unknown as Record<string, any>;
	const r = getRating(st);
	if (r && r.type === 'Dice') {
		const scale = availableValues.value;
		r.value.push(scale[0] || 6);
		updateCharacter(props.character);
	}
}

function removeDieFromDice(index: number) {
	const st = subtrait.value as unknown as Record<string, any>;
	const r = getRating(st);
	if (r && r.type === 'Dice' && r.value.length > 1) {
		r.value.splice(index, 1);
		updateCharacter(props.character);
	}
}

function stepDieInDice(index: number, direction: 'up' | 'down') {
	const st = subtrait.value as unknown as Record<string, any>;
	const r = getRating(st);
	if (!r || r.type !== 'Dice' || typeof r.value[index] !== 'number') return;
	const cur = r.value[index] as number;
	const scale = availableValues.value;
	const next = direction === 'up' ? getSubtraitStepNext(cur, scale) : getSubtraitStepPrev(cur, scale);
	if (next !== null) {
		r.value[index] = next;
		updateCharacter(props.character);
	}
}

const parentIsBranch = computed(() => {
	const s = props.traitSetID;
	const traitSet = props.character?.traitSets?.[s];
	return getView(traitSet)?.style?.body === 'subtrait-columns';
});

const branchSide = computed({
	get() {
		return getView(subtrait.value)?.branchSide === 'left' ? 'left' : 'right';
	},
	set(val: string) {
		ensureView(subtrait.value).branchSide = val === 'left' ? 'left' : 'right';
		updateCharacter(props.character);
	},
});

const templateSubtraitMatched = computed(() => {
	const s = props.traitSetID,
		t = props.traitID;
	if (props.entries || t === null) return false;
	const ts = props.character?.traitSets?.[s];
	const tr = ts?.traits?.[t];
	if (!tr || !subtrait.value || !subtrait.value.name || !ts || !ts.id || !tr.name) return false;
	const entry = cortexFunctions.resolveTemplateFor(props.character, rootTemplates());
	const base = cortexFunctions.templateSetById(entry, ts.id);
	const btr = base && Array.isArray(base.traits) ? base.traits.find((b: any) => b && b.name === tr.name) : null;
	return Boolean(btr && Array.isArray(btr.traits) && btr.traits.some((b: any) => b && b.name === subtrait.value.name));
});

function setSubtraitProperty(key: string, value: any) {
	const character = props.character;
	(subtrait.value as Record<string, any>)[key] = value;
	updateCharacter(character);
}

function toggleSubtraitValue(val: any) {
	const st = subtrait.value as unknown as Record<string, any>;
	const cur = ratingDice(getRating(st))[0] || 0;
	if (val === cur) {
		delete st.rating;
	} else {
		setRatingDie(st, val, availableValues.value);
	}
	updateCharacter(props.character);
}

function updateCharacter(character: any) {
	emit('updateCharacter', character);
}

function removeSubtrait() {
	confirmDelete.value = false;
	emit('removeSubtrait', props.subtraitID);
}

function removeFromSheet() {
	if (props.traitID === null) return;
	const entry = cortexFunctions.resolveTemplateFor(props.character, rootTemplates());
	cortexFunctions.removeSubtraitFromSheet(props.character, entry, props.traitSetID, props.traitID, props.subtraitID);
	confirmDelete.value = false;
	updateCharacter(props.character);
}

function getDieDisplayValue(value: any) {
	return cortexFunctions.renderDieconSVG(value, false, '', getView(props.character)?.diceConfig);
}

function subFirstDie() {
	return ratingDice(getRating(subtrait.value))[0] || 0;
}

function getSubtraitStepPrev(currentSize: number, range: number[] = availableValues.value): number | null {
	if (!range.length) return null;
	const idx = range.indexOf(currentSize);
	if (idx !== -1) return idx > 0 ? range[idx - 1] : null;
	const smaller = range.filter((s) => s < currentSize);
	return smaller.at(-1) ?? null;
}

function getSubtraitStepNext(currentSize: number, range: number[] = availableValues.value): number | null {
	if (!range.length) return null;
	const idx = range.indexOf(currentSize);
	if (idx !== -1) return idx < range.length - 1 ? range[idx + 1] : null;
	const larger = range.filter((s) => s > currentSize);
	return larger.length ? larger[0] : null;
}

const subtraitStepPrev = computed(() => getSubtraitStepPrev(subFirstDie()));
const subtraitStepNext = computed(() => getSubtraitStepNext(subFirstDie()));

function stepSubtraitDown() {
	const prev = subtraitStepPrev.value;
	if (prev !== null && subtrait.value) {
		setRatingDie(subtrait.value as unknown as Record<string, any>, prev, availableValues.value);
		updateCharacter(props.character);
	}
}

function stepSubtraitUp() {
	const next = subtraitStepNext.value;
	if (next !== null && subtrait.value) {
		setRatingDie(subtrait.value as unknown as Record<string, any>, next, availableValues.value);
		updateCharacter(props.character);
	}
}
</script>

<template>
	<section class="editor-subgroup">
		<div class="editor-fields">
			<!-- 1. IDENTITY: NAME FIRST, THEN DESCRIPTION -->
			<div class="editor-field">
				<label :for="'subtrait-name-' + traitSetID + '-' + traitID + '-' + subtraitID">{{ entryLabel }} Name</label>
				<div class="editor-readonly-title" v-if="isPlay">{{ name }}</div>
				<input
					v-else
					type="text"
					:id="'subtrait-name-' + traitSetID + '-' + traitID + '-' + subtraitID"
					name="subtraitName"
					ref="inputName"
					v-model="name"
				/>
			</div>

			<div class="editor-field">
				<label :for="'subtrait-desc-' + traitSetID + '-' + traitID + '-' + subtraitID"
					>{{ entryLabel }} Description</label
				>
				<div class="editor-readonly-text" v-if="isPlay">{{ description }}</div>
				<textarea
					v-else
					:id="'subtrait-desc-' + traitSetID + '-' + traitID + '-' + subtraitID"
					name="subtraitDescription"
					v-model="description"
					rows="2"
				></textarea>
			</div>

			<!-- 2. RATING: TYPE PICKER THEN VALUE/SCALE -->
			<div class="editor-field">
				<div class="editor-label" v-if="!isPlay">Rating</div>

				<!-- Warning Prompt if child values would be cleared -->
				<div class="editor-warning-prompt editor-warning-banner mb-sm" v-if="confirmRatingChange">
					<span>Changing rating type will clear existing ratings. Proceed?</span>
					<div class="mt-xs">
						<button
							type="button"
							class="btn-step btn-warning-confirm px-2"
							@click.stop="applyRatingType(confirmRatingChange)"
						>
							Proceed
						</button>
						<button type="button" class="btn-step px-2 ms-2" @click.stop="confirmRatingChange = null">Cancel</button>
					</div>
				</div>

				<!-- RATING TYPE PICKER (Die | Dice | Counter | Pip | None) -->
				<div class="editor-button-group mb-sm" v-if="!isPlay">
					<button
						type="button"
						v-for="rt in RATING_TYPES"
						:key="'sub-rating-type-' + rt"
						class="editor-group-btn"
						:class="{ active: currentRatingType === rt }"
						@click.stop="requestRatingType(rt)"
					>
						{{ rt }}
					</button>
					<button
						type="button"
						class="editor-group-btn"
						:class="{ active: currentRatingType === 'None' }"
						@click.stop="requestRatingType('None')"
					>
						None
					</button>
				</div>

				<!-- DIE RATING -->
				<template v-if="currentRatingType === 'Die'">
					<ul class="editor-values" v-if="!isPlay">
						<li
							v-for="size in availableValues"
							:key="size"
							:class="{ active: size === subFirstDie() }"
							tabindex="0"
							role="button"
							@keydown.enter.prevent="toggleSubtraitValue(size)"
							@keydown.space.prevent="toggleSubtraitValue(size)"
							@click.stop="toggleSubtraitValue(size)"
						>
							<span v-html="getDieDisplayValue(size)"></span>
						</li>
					</ul>

					<div class="die-rating-stepper" v-else-if="subFirstDie() > 0">
						<button
							type="button"
							class="btn-step"
							:disabled="subtraitStepPrev === null"
							@click.stop="stepSubtraitDown()"
							title="Step down"
							aria-label="Step down"
						>
							-
						</button>
						<div class="die-rating-current">
							<span v-html="getDieDisplayValue(subFirstDie())"></span>
							<span class="die-rating-text">d{{ subFirstDie() }}</span>
						</div>
						<button
							type="button"
							class="btn-step"
							:disabled="subtraitStepNext === null"
							@click.stop="stepSubtraitUp()"
							title="Step up"
							aria-label="Step up"
						>
							+
						</button>
						<button
							type="button"
							class="btn-unset-rating"
							@click.stop="
								setRatingDie(subtrait as unknown as Record<string, any>, null);
								updateCharacter(props.character);
							"
							title="Clear rating"
							aria-label="Clear rating"
						>
							<i class="fas fa-xmark" aria-hidden="true"></i>
						</button>
					</div>
				</template>

				<!-- DICE (MULTI-DIE) -->
				<template v-else-if="currentRatingType === 'Dice'">
					<div class="dice-list-chips">
						<div v-for="(dsize, dIndex) in diceList" :key="dIndex" class="dice-list-chip">
							<span v-html="getDieDisplayValue(dsize)"></span>
							<span class="chip-label">d{{ dsize }}</span>
							<button
								type="button"
								class="btn-step-mini"
								:disabled="getSubtraitStepPrev(dsize) === null"
								@click.stop="stepDieInDice(dIndex, 'down')"
								title="Step down"
							>
								-
							</button>
							<button
								type="button"
								class="btn-step-mini"
								:disabled="getSubtraitStepNext(dsize) === null"
								@click.stop="stepDieInDice(dIndex, 'up')"
								title="Step up"
							>
								+
							</button>
							<button
								type="button"
								class="btn-remove-mini"
								v-if="diceList.length > 1 && !isPlay"
								@click.stop="removeDieFromDice(dIndex)"
								title="Remove die"
							>
								×
							</button>
						</div>
					</div>
					<div class="editor-button-container mt-sm" v-if="!isPlay">
						<div class="editor-button-container-inner">
							<button type="button" class="editor-button" @click.stop="addDieToDice">
								<span><i class="fas fa-plus"></i> Add Die</span>
							</button>
						</div>
					</div>
				</template>

				<!-- COUNTER -->
				<template v-else-if="currentRatingType === 'Counter'">
					<div v-if="!isPlay" class="editor-row-inline">
						<div class="flex-1 min-w-4rem">
							<label :for="'subtrait-' + subtraitID + '-counter-val'" class="editor-sub-label">Count</label>
							<input
								type="number"
								:id="'subtrait-' + subtraitID + '-counter-val'"
								name="subtraitCounterVal"
								v-model.number="counterNumber"
								class="w-full"
							/>
						</div>
						<div class="flex-1 min-w-4rem">
							<label :for="'subtrait-' + subtraitID + '-counter-min'" class="editor-sub-label">Min</label>
							<input
								type="number"
								:id="'subtrait-' + subtraitID + '-counter-min'"
								name="subtraitCounterMin"
								:value="counterBounds()[0]"
								@change="setCounterBound(0, ($event.target as HTMLInputElement).value)"
								class="w-full"
							/>
						</div>
						<div class="flex-1 min-w-4rem">
							<label :for="'subtrait-' + subtraitID + '-counter-max'" class="editor-sub-label">Max</label>
							<input
								type="number"
								:id="'subtrait-' + subtraitID + '-counter-max'"
								name="subtraitCounterMax"
								:value="counterBounds()[1]"
								@change="setCounterBound(1, ($event.target as HTMLInputElement).value)"
								class="w-full"
							/>
						</div>
					</div>
					<div v-else class="num-stepper">
						<button
							type="button"
							class="btn-step"
							:disabled="counterNumber <= counterBounds()[0]"
							@click.stop="stepCounterDown()"
							title="Decrease count"
						>
							-
						</button>
						<span class="stepper-count">{{ counterNumber }}</span>
						<button
							type="button"
							class="btn-step"
							:disabled="counterNumber >= counterBounds()[1]"
							@click.stop="stepCounterUp()"
							title="Increase count"
						>
							+
						</button>
					</div>
				</template>

				<!-- PIP (STATEMENT QUESTIONED / RECORD) -->
				<template v-else-if="currentRatingType === 'Pip'">
					<div class="pip-toggle-row">
						<div
							class="pip-bubble-wrap"
							tabindex="0"
							role="checkbox"
							:aria-checked="pipValue ? 'true' : 'false'"
							@keydown.enter.prevent="togglePip()"
							@keydown.space.prevent="togglePip()"
							@click.stop="togglePip()"
							:title="pipValue ? 'Filled / Questioned' : 'Unfilled'"
						>
							<div class="pip-bubble" :class="{ filled: pipValue }"></div>
						</div>
						<span class="pip-editor-count">{{ pipValue ? 'Questioned / Filled' : 'Unfilled' }}</span>
					</div>
				</template>
			</div>

			<!-- 3. PARTS & BEHAVIOR -->
			<div class="editor-field" v-if="parentIsBranch && !isPlay && !entries">
				<div class="editor-label">Side</div>
				<div class="editor-button-group">
					<button
						type="button"
						class="editor-group-btn"
						:class="{ active: branchSide === 'left' }"
						@click.stop="branchSide = 'left'"
					>
						<i class="fas fa-arrow-left"></i> Left
					</button>
					<button
						type="button"
						class="editor-group-btn"
						:class="{ active: branchSide === 'right' }"
						@click.stop="branchSide = 'right'"
					>
						Right <i class="fas fa-arrow-right"></i>
					</button>
				</div>
			</div>

			<!-- 4. DELETE / ACTIONS -->
			<div class="editor-button-container" v-if="!isPlay">
				<div class="editor-button-container-inner">
					<div
						v-if="!confirmDelete"
						class="editor-button editor-button-remove editor-button-secondary"
						@click.prevent="confirmDelete = true"
					>
						<span><i class="fas fa-trash"></i> Remove {{ entryLabel }}</span>
					</div>
					<div
						v-else
						class="editor-button editor-button-remove editor-button-delete-confirm"
						@click.prevent="removeSubtrait"
					>
						<span><i class="fas fa-exclamation-triangle"></i> Confirm Remove?</span>
					</div>
					<div
						v-if="templateSubtraitMatched"
						class="editor-button editor-button-remove"
						@click.prevent="removeFromSheet"
						title="Remove from sheet — reversible via restore, no confirmation needed"
					>
						<span><i class="fas fa-eraser"></i> Remove from sheet</span>
					</div>
				</div>
			</div>
		</div>
	</section>
</template>
