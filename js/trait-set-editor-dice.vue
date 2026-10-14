<script setup lang="ts">
import { injectTraitSetEditor } from './use-trait-set-editor.ts';

const {
	needsDiceUI, isRatingIncluded, toggleRatingOption, getDieDisplayValue, setRatingPreset,
	setDie, isSubtraitRatingIncluded, toggleSubtraitRatingOption, setSubtraitRatingPreset,
	featureSubtraits, isRing, multiDie, isChallengePool, traitSetID
} = injectTraitSetEditor();
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
			<div class="rating-scale-presets">
				<span class="preset-label">Presets:</span>
				<button type="button" class="btn-scale-preset" @click.stop="setRatingPreset('all')">All</button>
				<button type="button" class="btn-scale-preset" @click.stop="setRatingPreset('skills')">Skills</button>
				<button type="button" class="btn-scale-preset" @click.stop="setRatingPreset('specialties')">Specialties</button>
				<button type="button" class="btn-scale-preset" @click.stop="setRatingPreset('stress')">Stress</button>
			</div>
		</div>
	</div>

	<!-- SET DIE -->
	<div class="editor-field" v-if="needsDiceUI">
		<label>Set die</label>
		<div class="editor-button-group">
			<button type="button" class="editor-group-btn" :class="{ active: setDie === null }" @click.stop="setDie = null">
				None
			</button>
			<button
				type="button"
				v-for="size in [4, 6, 8, 10, 12, 20]"
				:key="size"
				class="editor-group-btn"
				:class="{ active: setDie === size }"
				@click.stop="setDie = size"
			>
				<span class="c" v-html="getDieDisplayValue(size)"></span> d{{ size }}
			</button>
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
			<div class="rating-scale-presets">
				<span class="preset-label">Presets:</span>
				<button type="button" class="btn-scale-preset" @click.stop="setSubtraitRatingPreset('all')">All</button>
				<button type="button" class="btn-scale-preset" @click.stop="setSubtraitRatingPreset('specialties')">Specialties</button>
				<button type="button" class="btn-scale-preset" @click.stop="setSubtraitRatingPreset('skills')">Skills</button>
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

			<div><input type="checkbox" :id="'trait-set-' + traitSetID + '-challenge-pool'" :true-value="true" :false-value="false" v-model="isChallengePool"></div>
			<div><label :for="'trait-set-' + traitSetID + '-challenge-pool'">Challenge pool</label></div>
		</div>
	</div>
</template>
