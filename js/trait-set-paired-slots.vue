<script setup lang="ts">
import { getView } from './model.ts';
import { injectTraitSet } from './use-trait-set.ts';

const {
	traitSet, s, submode, printBlank, viewY, character,
	isSelected, selectElement, updateCharacter, removeTrait, addTrait,
	getRenderedTraits, getTraitClasses, getTraitSetRatings, getSubtraitRatings, isSpotlightStyle,
	renderDieValueForPrint, handleSingleDieClick, getTraitStatement, renderText, getSubtraitNameOr,
	getStandingComplication, getStandingBonus, getStandingBonusRatings
} = injectTraitSet();
</script>

<template>
	<div class="trait-paired-slots" v-if="getView(traitSet)?.style?.body === 'paired-slots'">
		<template v-for="(item, t) in getRenderedTraits(traitSet, s)" :key="item.trait._lid || ('t' + t)">
			<div :class="getTraitClasses(item.trait)">
				<div :class="{ 'trait-inner': true, 'paired-slot-row-wrap': true, 'selected': !item.isPlaceholder && isSelected(['trait', s, item.originalIndex]), 'trait-placeholder-slot': item.isPlaceholder }"
					tabindex="0"
					role="button"
					@keydown.enter.prevent="!item.isPlaceholder ? selectElement([ 'trait', s, item.originalIndex ]) : null"
					@keydown.space.prevent="!item.isPlaceholder ? selectElement([ 'trait', s, item.originalIndex ]) : null"
					@click.stop="!item.isPlaceholder ? selectElement([ 'trait', s, item.originalIndex ]) : null">
					<div class="paired-slot-header-row">
						<span class="paired-slot-name-box">
							<span class="paired-slot-name-text" v-if="!printBlank && !item.isPlaceholder && item.trait.name">{{ item.trait.name }}</span>
							<span class="paired-slot-blank-line" v-else-if="printBlank || item.isPlaceholder"></span>
							<span class="paired-slot-placeholder-hint" v-else-if="submode === 'edit'">Name</span>
							<span class="paired-slot-blank-line" v-else></span>
						</span>
						<span class="paired-slot-statement-box">
							<span class="paired-slot-statement-text" v-if="!printBlank && !item.isPlaceholder && getTraitStatement(item.trait)" v-html="renderText(getTraitStatement(item.trait))"></span>
							<span class="paired-slot-blank-line" v-else-if="printBlank || item.isPlaceholder"></span>
							<span class="paired-slot-placeholder-hint" v-else-if="submode === 'edit'">Statement</span>
							<span class="paired-slot-blank-line" v-else></span>
						</span>
					</div>
					<div class="paired-slot-dice-row">
						<div class="paired-slot-main-dice single-die-value" @click.stop="!printBlank && !item.isPlaceholder ? handleSingleDieClick(item.trait, item.trait.value, traitSet, s, item.originalIndex) : null">
							<span v-for="size in getTraitSetRatings(traitSet)" :key="size"
								:class="{ 'c': true, 'active': !printBlank && !item.isPlaceholder && item.trait.value === size }"
								v-html="renderDieValueForPrint(size, !printBlank && !item.isPlaceholder && item.trait.value === size)"></span>
						</div>
						<div class="paired-slot-sub-group">
							<div class="paired-slot-sub-row">
								<span class="paired-slot-sub-label">{{ getSubtraitNameOr(item.trait, traitSet, 0) }} •</span>
								<div class="subtrait-value" v-if="!item.isPlaceholder && getStandingComplication(item.trait)"
									@click.stop="!printBlank ? handleSingleDieClick(getStandingComplication(item.trait), getStandingComplication(item.trait).value, traitSet, s, item.originalIndex) : null">
									<span v-for="size in getSubtraitRatings(traitSet)" :key="size"
										:class="{ 'c': true, 'active': !printBlank && getStandingComplication(item.trait).value === size }"
										v-html="renderDieValueForPrint(size, !printBlank && getStandingComplication(item.trait).value === size)"></span>
								</div>
								<div class="subtrait-value" v-else>
									<span v-for="size in getSubtraitRatings(traitSet)" :key="size"
										:class="{ 'c': true, 'active': false }"
										v-html="renderDieValueForPrint(size, false)"></span>
								</div>
							</div>
							<div class="paired-slot-sub-row">
								<span class="paired-slot-sub-label">{{ getSubtraitNameOr(item.trait, traitSet, 1) }} •</span>
								<div class="subtrait-value" v-if="!item.isPlaceholder && getStandingBonus(item.trait)"
									@click.stop="!printBlank ? handleSingleDieClick(getStandingBonus(item.trait), getStandingBonus(item.trait).value, traitSet, s, item.originalIndex) : null">
									<span v-for="size in getStandingBonusRatings(traitSet)" :key="size"
										:class="{ 'c': true, 'active': !printBlank && getStandingBonus(item.trait).value === size }"
										v-html="renderDieValueForPrint(size, !printBlank && getStandingBonus(item.trait).value === size)"></span>
								</div>
								<div class="subtrait-value" v-else>
									<span v-for="size in getStandingBonusRatings(traitSet)" :key="size"
										:class="{ 'c': true, 'active': false }"
										v-html="renderDieValueForPrint(size, false)"></span>
								</div>
							</div>
						</div>
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
