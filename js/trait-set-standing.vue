<script setup lang="ts">
import { injectTraitSet } from './use-trait-set.ts';
import TraitEditor from './trait-editor.vue';

const {
	traitSet, s, submode, printBlank, designerPrintPreview, viewY, character,
	isSelected, selectElement, updateCharacter, removeTrait, addTrait,
	getRenderedTraits, getTraitClasses, getTraitSetRatings, getSubtraitRatings, isSpotlightPrintStyle,
	renderDieValueForPrint, handleSingleDieClick, getTraitStatement, renderText, getSubtraitNameOr,
	getStandingComplication, getStandingBonus, getStandingBonusRatings
} = injectTraitSet();
</script>

<template>
	<div class="trait-standing" v-if="traitSet?.custom?.cortexToolkit?.style?.body === 'standing'">
		<template v-for="(item, t) in getRenderedTraits(traitSet, s)" :key="item.trait._lid || ('t' + t)">
			<div :class="getTraitClasses(item.trait)">
				<div :class="{ 'trait-inner': true, 'standing-row-wrap': true, 'selected': !item.isPlaceholder && isSelected(['trait', s, item.originalIndex]), 'trait-placeholder-slot': item.isPlaceholder }"
					@click.stop="!item.isPlaceholder ? selectElement([ 'trait', s, item.originalIndex ]) : null">
					<div class="standing-header-row">
						<span class="standing-name-box">
							<span class="standing-name-text" v-if="!printBlank && !item.isPlaceholder && item.trait.name">{{ item.trait.name }}</span>
							<span class="standing-blank-line" v-else-if="printBlank || item.isPlaceholder"></span>
							<span class="standing-placeholder-hint" v-else-if="submode === 'edit' && !designerPrintPreview">Name</span>
							<span class="standing-blank-line" v-else></span>
						</span>
						<span class="standing-statement-box">
							<span class="standing-statement-text" v-if="!printBlank && !item.isPlaceholder && getTraitStatement(item.trait)" v-html="renderText(getTraitStatement(item.trait))"></span>
							<span class="standing-blank-line" v-else-if="printBlank || item.isPlaceholder"></span>
							<span class="standing-placeholder-hint" v-else-if="submode === 'edit' && !designerPrintPreview">Statement</span>
							<span class="standing-blank-line" v-else></span>
						</span>
					</div>
					<div class="standing-dice-row">
						<div class="standing-main-dice single-die-value" @click.stop="!printBlank && !item.isPlaceholder ? handleSingleDieClick(item.trait, item.trait.value, traitSet, s, item.originalIndex) : null">
							<span v-for="size in getTraitSetRatings(traitSet)" :key="size"
								:class="{ 'c': !isSpotlightPrintStyle, 'active': !printBlank && !item.isPlaceholder && item.trait.value === size }"
								v-html="renderDieValueForPrint(size, !printBlank && !item.isPlaceholder && item.trait.value === size)"></span>
						</div>
						<div class="standing-sub-group">
							<div class="standing-sub-row">
								<span class="standing-sub-label">{{ getSubtraitNameOr(item.trait, traitSet, 0) }} •</span>
								<div class="subtrait-value" v-if="!item.isPlaceholder && getStandingComplication(item.trait)"
									@click.stop="!printBlank ? handleSingleDieClick(getStandingComplication(item.trait), getStandingComplication(item.trait).value, traitSet, s, item.originalIndex) : null">
									<span v-for="size in getSubtraitRatings(traitSet)" :key="size"
										:class="{ 'c': !isSpotlightPrintStyle, 'active': !printBlank && getStandingComplication(item.trait).value === size }"
										v-html="renderDieValueForPrint(size, !printBlank && getStandingComplication(item.trait).value === size)"></span>
								</div>
								<div class="subtrait-value" v-else>
									<span v-for="size in getSubtraitRatings(traitSet)" :key="size"
										:class="{ 'c': !isSpotlightPrintStyle, 'active': false }"
										v-html="renderDieValueForPrint(size, false)"></span>
								</div>
							</div>
							<div class="standing-sub-row">
								<span class="standing-sub-label">{{ getSubtraitNameOr(item.trait, traitSet, 1) }} •</span>
								<div class="subtrait-value" v-if="!item.isPlaceholder && getStandingBonus(item.trait)"
									@click.stop="!printBlank ? handleSingleDieClick(getStandingBonus(item.trait), getStandingBonus(item.trait).value, traitSet, s, item.originalIndex) : null">
									<span v-for="size in getStandingBonusRatings(traitSet)" :key="size"
										:class="{ 'c': !isSpotlightPrintStyle, 'active': !printBlank && getStandingBonus(item.trait).value === size }"
										v-html="renderDieValueForPrint(size, !printBlank && getStandingBonus(item.trait).value === size)"></span>
								</div>
								<div class="subtrait-value" v-else>
									<span v-for="size in getStandingBonusRatings(traitSet)" :key="size"
										:class="{ 'c': !isSpotlightPrintStyle, 'active': false }"
										v-html="renderDieValueForPrint(size, false)"></span>
								</div>
							</div>
						</div>
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
