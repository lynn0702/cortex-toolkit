<script setup lang="ts">
import { getView } from './model.ts';
import { injectTraitSet } from './use-trait-set.ts';

const {
	traitSet, s, submode, printBlank, viewY, character,
	isSelected, selectElement, updateCharacter, removeTrait, addTrait,
	getRenderedTraits, getTraitClasses, getTraitSetRatings, getRatingPosition, isSpotlightStyle, renderDieValueForPrint,
	handleSingleDieClick
} = injectTraitSet();
</script>

<template>
	<div class="trait-dice-ladder" :class="{ 'rating-vertical': getRatingPosition(traitSet) === 'vertical', 'label-vertical': getView(traitSet)?.labelPosition === 'vertical' }" v-if="getView(traitSet)?.style?.body === 'dice-ladder'">
		<template v-for="(item, t) in getRenderedTraits(traitSet, s)" :key="item.trait._lid || ('t' + t)">
			<div :class="getTraitClasses(item.trait)">
				<div :class="{ 'trait-inner': true, 'ladder-rung': true, 'selected': !item.isPlaceholder && isSelected(['trait', s, item.originalIndex]), 'trait-placeholder-slot': item.isPlaceholder }"
					tabindex="0"
					role="button"
					@keydown.enter.prevent="!item.isPlaceholder ? selectElement([ 'trait', s, item.originalIndex ]) : null"
					@keydown.space.prevent="!item.isPlaceholder ? selectElement([ 'trait', s, item.originalIndex ]) : null"
					@click.stop="!item.isPlaceholder ? selectElement([ 'trait', s, item.originalIndex ]) : null">
					<span class="ladder-name" v-if="!printBlank && !item.isPlaceholder && item.trait.name">{{ item.trait.name }}</span>
					<span class="ladder-name ladder-blank" v-else-if="printBlank || item.isPlaceholder || !item.trait.name">
						<template v-if="submode === 'edit' && !printBlank && !item.trait.name">
							<span class="trait-name-hint">{{ traitSet.nounSingular || 'Name' }}...</span>
						</template>
						<template v-else>
							<span class="trait-blank-line"></span>
						</template>
					</span>
					<div class="trait-value single-die-value" @click.stop="!printBlank && !item.isPlaceholder ? handleSingleDieClick(item.trait, item.trait.value, traitSet, s, item.originalIndex) : null">
						<span v-for="size in getTraitSetRatings(traitSet)" :key="size"
							:class="{ 'c': true, 'active': !printBlank && !item.isPlaceholder && item.trait.value === size }"
							v-html="renderDieValueForPrint(size, !printBlank && !item.isPlaceholder && item.trait.value === size)"></span>
					</div>
				</div>
			</div>
		</template>
		<transition appear>
			<div class="preview-button-container" v-show="submode === 'edit'">
				<div class="preview-button-container-inner">
					<div class="preview-button" @click.stop="addTrait( s )">
						<span><i class="fas fa-plus"></i> {{ ( traitSet.nounSingular && traitSet.nounSingular.length ) ? traitSet.nounSingular : 'Trait' }}</span>
					</div>
				</div>
			</div>
		</transition>
	</div>
</template>
