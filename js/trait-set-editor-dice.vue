<script setup lang="ts">
import { injectTraitSetEditor } from './use-trait-set-editor.ts';

const {
	needsDiceUI, isRatingIncluded, toggleRatingOption, getDieDisplayValue,
	setRating, isSubtraitRatingIncluded, toggleSubtraitRatingOption,
	featureSubtraits, isRing, multiDie, isPool, setSpendable, setHitches, traitSetID
} = injectTraitSetEditor();

function toggleSetRating( size: number | null ) {
	setRating.value = ( size !== null && setRating.value === size ) ? null : size;
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

	<!-- RATING (THE SET NODE'S OWN; UNRATED TRAITS FALL THROUGH TO IT) -->
	<div class="editor-field" v-if="needsDiceUI">
		<label>Rating</label>
		<div class="rating-scale-container">
			<div class="rating-scale-chips set-rating-die-chips">
				<button
					type="button"
					class="rating-scale-chip set-rating-die-none"
					:class="{ active: setRating === null }"
					@click.stop="toggleSetRating(null)"
					title="No rating"
				>
					<span class="chip-label">None</span>
				</button>
				<button
					type="button"
					v-for="size in [4, 6, 8, 10, 12]"
					:key="size"
					class="rating-scale-chip"
					:class="{ active: setRating === size }"
					@click.stop="toggleSetRating(size)"
					:title="(setRating === size ? 'Clear the rating (was d' : 'Set the rating to d') + size + (setRating === size ? ')' : '')"
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

	<!-- OPTIONS -->
	<div class="editor-field" v-if="needsDiceUI">
		<label>Options</label>
		<div class="editor-toggles">
			<template v-if="!isRing">
				<div><input type="checkbox" :id="'trait-set-' + traitSetID + '-multi-die'" :true-value="true" :false-value="false" v-model="multiDie"></div>
				<div><label :for="'trait-set-' + traitSetID + '-multi-die'">Multiple dice</label></div>
			</template>

			<div><input type="checkbox" :id="'trait-set-' + traitSetID + '-pool'" :true-value="true" :false-value="false" v-model="isPool"></div>
			<div><label :for="'trait-set-' + traitSetID + '-pool'" title="Clicking a trait adds its whole array of available dice to the roller">Pool</label></div>

			<div><input type="checkbox" :id="'trait-set-' + traitSetID + '-spendable'" :true-value="true" :false-value="false" v-model="setSpendable"></div>
			<div><label :for="'trait-set-' + traitSetID + '-spendable'">Spendable</label></div>
		</div>
		<div class="editor-toggles" style="margin-top: 0.4rem;">
			<div><label :for="'trait-set-' + traitSetID + '-hitches'">Hitches</label></div>
			<div><input type="number" :id="'trait-set-' + traitSetID + '-hitches'" name="setHitches" min="0" max="12" :placeholder="'1'" v-model.number="setHitches" style="width: 4rem;"></div>
		</div>
	</div>
</template>
