<script setup lang="ts">
import { injectTraitSet } from './use-trait-set.ts';
import TraitEditor from './trait-editor.vue';

const {
	traitSet, s, submode, printBlank, designerPrintPreview, viewY, character,
	isSelected, selectElement, updateCharacter, removeTrait, addTrait,
	getRenderedTraits, getTraitClasses, getTraitSetRatings, isSpotlightPrintStyle, renderDieValueForPrint,
	handleSingleDieClick, hasCounterColumn, getCounterLabel, getTraitCounter
} = injectTraitSet();
</script>

<template>
	<div class="trait-badges-table" v-if="traitSet?.custom?.cortexToolkit?.style?.body === 'badges-table'">
		<div class="badges-head" v-if="hasCounterColumn(traitSet)">
			<span class="badges-head-name">{{ traitSet.name }}</span>
			<span class="badges-head-counter">{{ getCounterLabel(traitSet) }}</span>
		</div>
		<template v-for="(item, t) in getRenderedTraits(traitSet, s)" :key="item.trait._lid || ('t' + t)">
			<div :class="getTraitClasses(item.trait)">
				<div :class="{ 'trait-inner': true, 'badge-row': true, 'selected': !item.isPlaceholder && isSelected(['trait', s, item.originalIndex]), 'trait-placeholder-slot': item.isPlaceholder }"
					@click.stop="!item.isPlaceholder ? selectElement([ 'trait', s, item.originalIndex ]) : null">
					<span class="badge-name" v-if="!printBlank && !item.isPlaceholder && item.trait.name">{{ item.trait.name }}</span>
					<span class="badge-name badge-blank" v-else-if="printBlank || item.isPlaceholder"><span class="trait-blank-line"></span></span>
					<span class="badge-name" v-else>{{ item.trait.name || '' }}</span>
					<div class="trait-value single-die-value" @click.stop="!printBlank && !item.isPlaceholder ? handleSingleDieClick(item.trait, item.trait.value, traitSet, s, item.originalIndex) : null">
						<span v-for="size in getTraitSetRatings(traitSet)" :key="size"
							:class="{ 'c': !isSpotlightPrintStyle, 'active': !printBlank && !item.isPlaceholder && item.trait.value === size }"
							v-html="renderDieValueForPrint(size, !printBlank && !item.isPlaceholder && item.trait.value === size)"></span>
					</div>
					<span class="badge-counter-box" v-if="hasCounterColumn(traitSet)">
						{{ (!printBlank && !item.isPlaceholder) ? getTraitCounter(item.trait) : '' }}
					</span>
				</div>
				<transition name="editor" appear>
					<TraitEditor
						v-if="!item.isPlaceholder"
						:character="character"
						:open="isSelected(['trait', s, item.originalIndex])"
						v-show="submode === 'edit' && isSelected(['trait', s, item.originalIndex])"
						:traitSetID="s"
						:traitID="item.originalIndex"
						:viewY="viewY"
						@selectElement="selectElement"
						@updateCharacter="updateCharacter"
						@removeTrait="removeTrait"
					></TraitEditor>
				</transition>
			</div>
		</template>
		<transition appear>
			<div class="preview-button-container" v-show="submode === 'edit' && !designerPrintPreview">
				<div class="preview-button-container-inner">
					<div class="preview-button" @click.stop="addTrait( s )">
						<span><i class="fas fa-plus"></i> {{ ( traitSet.nounSingular && traitSet.nounSingular.length ) ? traitSet.nounSingular : 'Trait' }}</span>
					</div>
				</div>
			</div>
		</transition>
	</div>
</template>
