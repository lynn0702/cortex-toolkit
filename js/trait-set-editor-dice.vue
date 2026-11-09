<script setup lang="ts">
import { injectTraitSetEditor } from './use-trait-set-editor.ts';

const {
	needsDiceUI,
	isRatingIncluded,
	toggleRatingOption,
	getDieDisplayValue,
	setRating,
	setSubtraits,
	openSetSubtrait,
	removeSetSubtrait,
	createSubtrait,
	isPool,
	setSpendable,
	setHitches,
	traitSetID,
	includeOut,
} = injectTraitSetEditor();

function toggleSetRating(size: number | null) {
	setRating.value = size !== null && setRating.value === size ? null : size;
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
					@click.stop="toggleRatingOption(size)"
					:title="(isRatingIncluded(size) ? 'Exclude d' : 'Include d') + size"
				>
					<span v-html="getDieDisplayValue(size)"></span>
					<span class="chip-label">d{{ size }}</span>
				</button>
				<button
					type="button"
					class="rating-scale-chip rating-scale-chip-out"
					:class="{ active: includeOut }"
					@click.stop="includeOut = !includeOut"
					:title="(includeOut ? 'Disable' : 'Enable') + ' Out marker'"
				>
					<span class="chip-label chip-out-label">OUT</span>
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
					:title="
						(setRating === size ? 'Clear the rating (was d' : 'Set the rating to d') +
						size +
						(setRating === size ? ')' : '')
					"
				>
					<span v-html="getDieDisplayValue(size)"></span>
					<span class="chip-label">d{{ size }}</span>
				</button>
			</div>
		</div>
	</div>

	<!-- SUBTRAITS -->
	<div class="editor-field" v-if="needsDiceUI">
		<div class="editor-label" v-if="setSubtraits.length > 0">Subtraits</div>
		<div class="editor-subtrait-list" v-if="setSubtraits.length > 0">
			<div v-for="item in setSubtraits" :key="'set-sub-' + item.idx" class="editor-subtrait-row">
				<button
					type="button"
					class="editor-subtrait-drill"
					@click.stop="openSetSubtrait(item.idx)"
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
					@click.stop="removeSetSubtrait(item.idx)"
					:title="'Delete ' + item.label"
					:aria-label="'Delete ' + item.label"
				>
					<i class="fas fa-trash" aria-hidden="true"></i>
				</button>
			</div>
		</div>
		<div class="editor-button-container">
			<div class="editor-button-container-inner">
				<button type="button" class="editor-button" @click.stop="createSubtrait">
					<span><i class="fas fa-plus"></i> Create subtrait</span>
				</button>
			</div>
		</div>
	</div>

	<!-- OPTIONS -->
	<div class="editor-field" v-if="needsDiceUI">
		<div class="editor-label">Options</div>
		<div class="editor-row-inline flex-wrap mb-md">
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
		</div>

		<div class="editor-row-between mt-sm">
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
