<script setup lang="ts">
import { injectTraitSet } from './use-trait-set.ts';
import TraitEditor from './trait-editor.vue';

const {
	traitSet, s, submode, printBlank, designerPrintPreview, viewY, character,
	isSelected, selectElement, updateCharacter, removeTrait, addTrait,
	getRenderedTraits, getTraitClasses, getTraitSetRatings, getTraitSetLabel, isSpotlightPrintStyle,
	renderDieValueForPrint, handleSingleDieClick, getResourceDiceCount, setResourceDiceCount
} = injectTraitSet();
</script>

<template>
	<div class="trait-dice-count" v-if="traitSet?.custom?.cortexToolkit?.style?.body === 'dice-count'">
		<template v-for="(item, t) in getRenderedTraits(traitSet, s)" :key="item.trait._lid || ('t' + t)">
			<div :class="getTraitClasses(item.trait)">
				<div :class="{ 'trait-inner': true, 'dice-count-row': true, 'selected': !item.isPlaceholder && isSelected(['trait', s, item.originalIndex]), 'trait-placeholder-slot': item.isPlaceholder }"
					@click.stop="!item.isPlaceholder ? selectElement([ 'trait', s, item.originalIndex ]) : null">
					<span class="trait-name" v-if="!printBlank && !item.isPlaceholder && item.trait.name">{{ item.trait.name }}</span>
					<span class="trait-name trait-name-blank" v-else-if="printBlank || item.isPlaceholder"><span class="trait-blank-line"></span></span>
					<span class="trait-name" v-else>{{ item.trait.name || '' }}</span>
					<span class="dice-count-rating-label">{{ getTraitSetLabel(traitSet, 'rating') }}</span>
					<div class="trait-value single-die-value" @click.stop="!printBlank && !item.isPlaceholder ? handleSingleDieClick(item.trait, item.trait.value, traitSet, s, item.originalIndex) : null">
						<span v-for="size in getTraitSetRatings(traitSet)" :key="size"
							:class="{ 'c': !isSpotlightPrintStyle, 'active': !printBlank && !item.isPlaceholder && item.trait.value === size }"
							v-html="renderDieValueForPrint(size, !printBlank && !item.isPlaceholder && item.trait.value === size)"></span>
					</div>
					<span class="dice-count-count-label">{{ getTraitSetLabel(traitSet, 'dice') }}</span>
					<div class="dice-count-track">
						<span v-for="n in [1, 2, 3, 4, 5]" :key="n" class="dice-count-pip"
							:class="{ 'filled': !printBlank && !item.isPlaceholder && getResourceDiceCount(item.trait) >= n }"
							@click.stop="submode === 'edit' && !printBlank && !item.isPlaceholder ? setResourceDiceCount(s, item.originalIndex, n) : null"
							:title="submode === 'edit' && !item.isPlaceholder ? 'Set dice count to ' + n : ''">{{ n }}</span>
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
