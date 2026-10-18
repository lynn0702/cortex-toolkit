<script setup lang="ts">
import { getView } from './model.ts';
import { injectTraitSet } from './use-trait-set.ts';

const {
	traitSet, s, submode, printBlank, designerPrintPreview, viewY, character,
	isSelected, selectElement, updateCharacter, removeTrait, addTrait,
	getRenderedTraits, getTraitClasses, renderText
} = injectTraitSet();
</script>

<template>
	<div class="trait-labeled-fields" v-if="getView(traitSet)?.style?.body === 'labeled-fields'">
		<template v-for="(item, t) in getRenderedTraits(traitSet, s)" :key="item.trait._lid || ('t' + t)">
			<div :class="getTraitClasses(item.trait)">
				<div :class="{ 'trait-inner': true, 'field-block': true, 'selected': !item.isPlaceholder && isSelected(['trait', s, item.originalIndex]), 'trait-placeholder-slot': item.isPlaceholder }"
					tabindex="0"
					role="button"
					@keydown.enter.prevent="!item.isPlaceholder ? selectElement([ 'trait', s, item.originalIndex ]) : null"
					@keydown.space.prevent="!item.isPlaceholder ? selectElement([ 'trait', s, item.originalIndex ]) : null"
					@click.stop="!item.isPlaceholder ? selectElement([ 'trait', s, item.originalIndex ]) : null">
					<span class="field-label" v-if="!printBlank && !item.isPlaceholder && item.trait.name">{{ item.trait.name }}</span>
					<span class="field-label field-blank" v-else-if="printBlank || item.isPlaceholder"><span class="trait-blank-line"></span></span>
					<span class="field-label" v-else>{{ item.trait.name || '' }}</span>
					<span class="field-text" v-if="!printBlank && !item.isPlaceholder && item.trait.description" v-html="renderText(item.trait.description)"></span>
					<span class="field-text field-blank" v-else-if="printBlank || item.isPlaceholder"><span class="trait-blank-line"></span></span>
					<span class="field-text field-hint" v-else-if="submode === 'edit' && !designerPrintPreview">Click to add text...</span>
					<span class="field-text" v-else></span>
				</div>
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
