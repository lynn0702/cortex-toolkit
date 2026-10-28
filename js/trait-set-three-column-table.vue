<script setup lang="ts">
import { getView } from './model.ts';
import { injectTraitSet } from './use-trait-set.ts';

const {
	traitSet, s, submode, printBlank, viewY, character,
	isSelected, selectElement, openTraitAt, updateCharacter, removeTrait, addTrait,
	getRenderedTraits, getTraitClasses, getTraitSetLabel, renderText, getThreeColEffect
} = injectTraitSet();
</script>

<template>
	<div class="trait-three-column-table" v-if="getView(traitSet)?.style?.body === 'three-column-table'">
		<div class="three-col-head"><span>{{ getTraitSetLabel(traitSet, 'col1') }}</span><span>{{ getTraitSetLabel(traitSet, 'col2') }}</span><span>{{ getTraitSetLabel(traitSet, 'col3') }}</span></div>
		<template v-for="(item, t) in getRenderedTraits(traitSet, s)" :key="item.trait._lid || ('t' + t)">
			<div :class="getTraitClasses(item.trait)">
				<div :class="{ 'trait-inner': true, 'selected': !item.isPlaceholder && isSelected(['trait', s, item.originalIndex]), 'trait-placeholder-slot': item.isPlaceholder }"
					tabindex="0"
					role="button"
					@keydown.enter.prevent="openTraitAt(s, item)"
					@keydown.space.prevent="openTraitAt(s, item)"
					@click.stop="openTraitAt(s, item)">
					<div class="three-col-row">
						<span class="three-col-name" v-if="!printBlank && !item.isPlaceholder && item.trait.name">{{ item.trait.name }}</span>
						<span class="three-col-name three-col-blank" v-else-if="printBlank || item.isPlaceholder"><span class="trait-blank-line"></span></span>
						<span class="three-col-name" v-else>{{ item.trait.name || '' }}</span>
						<span class="three-col-activation" v-if="!printBlank && !item.isPlaceholder && item.trait.description" v-html="renderText(item.trait.description)"></span>
						<span class="three-col-activation three-col-blank" v-else-if="printBlank || item.isPlaceholder"><span class="trait-blank-line"></span></span>
						<span class="three-col-activation" v-else></span>
						<span class="three-col-effect" v-if="!printBlank && !item.isPlaceholder && getThreeColEffect(item.trait)" v-html="renderText(getThreeColEffect(item.trait))"></span>
						<span class="three-col-effect three-col-blank" v-else-if="printBlank || item.isPlaceholder"><span class="trait-blank-line"></span></span>
						<span class="three-col-effect" v-else></span>
					</div>
				</div>
			</div>
		</template>
		<transition appear>
			<div class="preview-button-container" v-show="submode === 'edit'">
				<div class="preview-button-container-inner">
					<div class="preview-button" @click.stop="addTrait( s )">
						<span><i class="fas fa-plus"></i> {{ ( traitSet.noun && traitSet.noun.length ) ? traitSet.noun : 'Trait' }}</span>
					</div>
				</div>
			</div>
		</transition>
	</div>
</template>
