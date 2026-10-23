<script setup lang="ts">
import { injectTraitSetEditor } from './use-trait-set-editor.ts';

const {
	needsDiceUI, isRatingIncluded, toggleRatingOption, getDieDisplayValue,
	setDie, isSubtraitRatingIncluded, toggleSubtraitRatingOption,
	featureSubtraits, isRing, multiDie, isPool, isChallengePool, traitSetID
} = injectTraitSetEditor();

function toggleSetDie( size: number | null ) {
	setDie.value = ( size !== null && setDie.value === size ) ? null : size;
}
</script>

<template>
	<!-- RATING SCALE (OPT IN/OUT OF RATINGS) -->
	<div class="editor-field" v-if="needsDiceUI">
		<label>Rating scale</label>
		<div class="rating-scale-container">
			<div class="rating-scale-chips">
				<button
					type="button"
					v-for="size in [4, 6, 8, 10, 12]"
					:key="size"
					class="rating-scale-chip"
					:class="{ active: isRatingIncluded(size) }"
					@click.stop="toggleRatingOption(size)"
					:title="(isRatingIncluded(size) ? 'Exclude d' : 'Include d') + size"
				>
					<span class="c" v-html="getDieDisplayValue(size)"></span>
					<span class="chip-label">d{{ size }}</span>
				</button>
			</div>
		</div>
	</div>

	<!-- SET DIE (ONE VALUE) -->
	<div class="editor-field" v-if="needsDiceUI">
		<label>Set die</label>
		<div class="rating-scale-container">
			<div class="rating-scale-chips set-die-chips">
				<button
					type="button"
					class="rating-scale-chip set-die-none"
					:class="{ active: setDie === null }"
					@click.stop="toggleSetDie(null)"
					title="No set die"
				>
					<span class="chip-label">None</span>
				</button>
				<button
					type="button"
					v-for="size in [4, 6, 8, 10, 12]"
					:key="size"
					class="rating-scale-chip"
					:class="{ active: setDie === size }"
					@click.stop="toggleSetDie(size)"
					:title="(setDie === size ? 'Clear the set die (was d' : 'Set the die to d') + size + (setDie === size ? ')' : '')"
				>
					<span class="c" v-html="getDieDisplayValue(size)"></span>
					<span class="chip-label">d{{ size }}</span>
				</button>
			</div>
		</div>
	</div>

	<!-- SUB-TRAIT RATING SCALE -->
	<div class="editor-field" v-if="needsDiceUI && featureSubtraits">
		<label>Subtrait scale</label>
		<div class="rating-scale-container">
			<div class="rating-scale-chips">
				<button
					type="button"
					v-for="size in [4, 6, 8, 10, 12]"
					:key="size"
					class="rating-scale-chip"
					:class="{ active: isSubtraitRatingIncluded(size) }"
					@click.stop="toggleSubtraitRatingOption(size)"
					:title="(isSubtraitRatingIncluded(size) ? 'Exclude d' : 'Include d') + size"
				>
					<span class="c" v-html="getDieDisplayValue(size)"></span>
					<span class="chip-label">d{{ size }}</span>
				</button>
			</div>
		</div>
	</div>

	<!-- POOL & MULTI-DIE OPTIONS -->
	<div class="editor-field" v-if="needsDiceUI">
		<label>Pool Options</label>
		<div class="editor-toggles">
			<template v-if="!isRing">
				<div><input type="checkbox" :id="'trait-set-' + traitSetID + '-multi-die'" :true-value="true" :false-value="false" v-model="multiDie"></div>
				<div><label :for="'trait-set-' + traitSetID + '-multi-die'">Multiple dice</label></div>
			</template>

			<div><input type="checkbox" :id="'trait-set-' + traitSetID + '-pool'" :true-value="true" :false-value="false" v-model="isPool"></div>
			<div><label :for="'trait-set-' + traitSetID + '-pool'" title="Clicking a trait adds its whole pool to the roller">Pool</label></div>

			<div><input type="checkbox" :id="'trait-set-' + traitSetID + '-challenge-pool'" :true-value="true" :false-value="false" v-model="isChallengePool"></div>
			<div><label :for="'trait-set-' + traitSetID + '-challenge-pool'">Challenge pool</label></div>
		</div>
	</div>
</template>
