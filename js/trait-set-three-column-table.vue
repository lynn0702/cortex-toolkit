<script setup lang="ts">
import { injectTraitSet } from './use-trait-set.ts';
import TraitEditor from './trait-editor.vue';

const {
	traitSet, s, submode, printBlank, designerPrintPreview, viewY, character,
	isSelected, selectElement, updateCharacter, removeTrait, addTrait,
	getRenderedTraits, getTraitClasses, getTraitSetLabel, renderText, getTalentEffect
} = injectTraitSet();
</script>

<template>
	<div class="trait-three-column-table" v-if="traitSet?.custom?.cortexToolkit?.style?.body === 'three-column-table'">
		<div class="three-col-head"><span>{{ getTraitSetLabel(traitSet, 'col1') }}</span><span>{{ getTraitSetLabel(traitSet, 'col2') }}</span><span>{{ getTraitSetLabel(traitSet, 'col3') }}</span></div>
		<template v-for="(item, t) in getRenderedTraits(traitSet, s)" :key="item.trait._lid || ('t' + t)">
			<div :class="getTraitClasses(item.trait)">
				<div :class="{ 'trait-inner': true, 'selected': !item.isPlaceholder && isSelected(['trait', s, item.originalIndex]), 'trait-placeholder-slot': item.isPlaceholder }"
					tabindex="0"
					role="button"
					@keydown.enter.prevent="!item.isPlaceholder ? selectElement([ 'trait', s, item.originalIndex ]) : null"
					@keydown.space.prevent="!item.isPlaceholder ? selectElement([ 'trait', s, item.originalIndex ]) : null"
					@click.stop="!item.isPlaceholder ? selectElement([ 'trait', s, item.originalIndex ]) : null">
					<div class="three-col-row">
						<span class="three-col-name" v-if="!printBlank && !item.isPlaceholder && item.trait.name">{{ item.trait.name }}</span>
						<span class="three-col-name three-col-blank" v-else-if="printBlank || item.isPlaceholder"><span class="trait-blank-line"></span></span>
						<span class="three-col-name" v-else>{{ item.trait.name || '' }}</span>
						<span class="three-col-activation" v-if="!printBlank && !item.isPlaceholder && item.trait.description" v-html="renderText(item.trait.description)"></span>
						<span class="three-col-activation three-col-blank" v-else-if="printBlank || item.isPlaceholder"><span class="trait-blank-line"></span></span>
						<span class="three-col-activation" v-else></span>
						<span class="three-col-effect" v-if="!printBlank && !item.isPlaceholder && getTalentEffect(item.trait)" v-html="renderText(getTalentEffect(item.trait))"></span>
						<span class="three-col-effect three-col-blank" v-else-if="printBlank || item.isPlaceholder"><span class="trait-blank-line"></span></span>
						<span class="three-col-effect" v-else></span>
					</div>
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
