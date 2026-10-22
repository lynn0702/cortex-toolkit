<script setup lang="ts">
import { getView } from './model.ts';
import { injectTraitSet } from './use-trait-set.ts';

const {
	traitSet, s, submode, printBlank, viewY, character,
	isSelected, selectElement, openTraitAt, updateCharacter, removeTrait, addTrait,
	getRenderedTraits, getTraitClasses, getTraitSetRatings, isSpotlightStyle, renderDieValueForPrint,
	handleSingleDieClick, hasCounterColumn, getTraitCounter
} = injectTraitSet();
</script>

<template>
	<div class="trait-die-rows" v-if="getView(traitSet)?.style?.body === 'die-rows'">
		<template v-for="(item, t) in getRenderedTraits(traitSet, s)" :key="item.trait._lid || ('t' + t)">
			<div :class="getTraitClasses(item.trait)">
				<div :class="{ 'trait-inner': true, 'die-row': true, 'selected': !item.isPlaceholder && isSelected(['trait', s, item.originalIndex]), 'trait-placeholder-slot': item.isPlaceholder }"
					tabindex="0"
					role="button"
					@keydown.enter.prevent="openTraitAt(s, item)"
					@keydown.space.prevent="openTraitAt(s, item)"
					@click.stop="openTraitAt(s, item)">
					<span class="die-row-name" v-if="!printBlank && !item.isPlaceholder && item.trait.name">{{ item.trait.name }}</span>
					<span class="die-row-name die-row-blank" v-else-if="printBlank || item.isPlaceholder || !item.trait.name">
						<template v-if="submode === 'edit' && !printBlank && !item.trait.name">
							<span class="trait-name-hint">{{ traitSet.nounSingular || 'Name' }}...</span>
						</template>
						<template v-else>
							<span class="trait-blank-line"></span>
						</template>
					</span>
					<span class="die-row-name" v-else>{{ item.trait.name || '' }}</span>
					<div class="trait-value single-die-value" @click.stop="!printBlank && !item.isPlaceholder ? handleSingleDieClick(item.trait, item.trait.value, traitSet, s, item.originalIndex) : null">
						<span v-for="size in getTraitSetRatings(traitSet)" :key="size"
							:class="{ 'c': true, 'active': !printBlank && !item.isPlaceholder && item.trait.value === size }"
							v-html="renderDieValueForPrint(size, !printBlank && !item.isPlaceholder && item.trait.value === size)"></span>
					</div>
					<span class="die-row-counter" v-if="hasCounterColumn(traitSet)">
						{{ (!printBlank && !item.isPlaceholder) ? getTraitCounter(item.trait) : '' }}
					</span>
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
