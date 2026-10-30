<script setup lang="ts">
import { injectTraitSetEditor } from './use-trait-set-editor.ts';

const {
	needsDiceUI, isRatingIncluded, toggleRatingOption, getDieDisplayValue,
	setRating, isSubtraitRatingIncluded, toggleSubtraitRatingOption,
	isPool, setSpendable, setHitches, traitSetID,
	styleBody, allowsTraitColumns, hasTrackPart
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
	<div class="editor-field" v-if="needsDiceUI">
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
		<div class="editor-label">Options</div>
		<div style="display: flex; flex-wrap: wrap; gap: 0.85rem 1.25rem; align-items: center; margin-bottom: 0.5rem;">
			<div class="editor-checkbox-row" style="display: flex; align-items: center; gap: 0.35rem;">
				<input type="checkbox" :id="'trait-set-' + traitSetID + '-pool'" :true-value="true" :false-value="false" v-model="isPool">
				<label :for="'trait-set-' + traitSetID + '-pool'" style="margin: 0; font-size: 0.8rem; cursor: pointer;" title="Clicking a trait adds its whole array of available dice to the roller">Pool</label>
			</div>

			<div class="editor-checkbox-row" style="display: flex; align-items: center; gap: 0.35rem;">
				<input type="checkbox" :id="'trait-set-' + traitSetID + '-spendable'" :true-value="true" :false-value="false" v-model="setSpendable">
				<label :for="'trait-set-' + traitSetID + '-spendable'" style="margin: 0; font-size: 0.8rem; cursor: pointer;">Spendable</label>
			</div>


			<div v-if="allowsTraitColumns && styleBody !== 'notes' && styleBody !== 'image' && styleBody !== 'pips' && styleBody !== 'die-track'" class="editor-checkbox-row" style="display: flex; align-items: center; gap: 0.35rem;">
				<input type="checkbox" :id="'trait-set-' + traitSetID + '-attached-track'" v-model="hasTrackPart">
				<label :for="'trait-set-' + traitSetID + '-attached-track'" style="margin: 0; font-size: 0.8rem; cursor: pointer;">Attached track</label>
			</div>
		</div>


		<div style="display: flex; align-items: center; justify-content: space-between; margin-top: 0.4rem;">
			<label :for="'trait-set-' + traitSetID + '-hitches'" style="font-size: 0.8rem; margin: 0;">Hitches on</label>
			<div class="num-stepper">
				<button type="button" class="btn-step" @click.stop="setHitches = Math.max(0, (setHitches ?? 1) - 1)" :disabled="(setHitches ?? 1) <= 0" title="Lower hitch threshold" aria-label="Lower hitch threshold">-</button>
				<input type="number" :id="'trait-set-' + traitSetID + '-hitches'" name="setHitches" min="0" max="2" v-model.number="setHitches" placeholder="1" inputmode="numeric" aria-label="Hitches on">
				<button type="button" class="btn-step" @click.stop="setHitches = Math.min(2, (setHitches ?? 1) + 1)" :disabled="(setHitches ?? 1) >= 2" title="Raise hitch threshold" aria-label="Raise hitch threshold">+</button>
			</div>
		</div>
	</div>
</template>
