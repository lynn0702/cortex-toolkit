<script setup lang="ts">
import { getView } from './model.ts';
import { injectTraitSet } from './use-trait-set.ts';

const {
	traitSet, s, submode, printBlank, viewY, character,
	isSelected, selectElement, updateCharacter, removeTrait, addTrait,
	getRenderedTraits, getTraitClasses, getTraitSetRatings, getTraitSetLabel, isSpotlightStyle,
	renderDieValueForPrint, handleSingleDieClick, getResourceDiceCount, setResourceDiceCount,
	getResourcePoolDice, getPrintTallyPips, isDieSpent, toggleDieSpentInPlay, handleDieClick
} = injectTraitSet();
</script>

<template>
	<div class="trait-dice-count" v-if="getView(traitSet)?.style?.body === 'dice-count'">
		<template v-for="(item, t) in getRenderedTraits(traitSet, s)" :key="item.trait._lid || ('t' + t)">
			<div :class="getTraitClasses(item.trait)">
				<div :class="{ 'trait-inner': true, 'dice-count-row': true, 'selected': !item.isPlaceholder && isSelected(['trait', s, item.originalIndex]), 'trait-placeholder-slot': item.isPlaceholder }"
					tabindex="0"
					role="button"
					@keydown.enter.prevent="!item.isPlaceholder ? selectElement([ 'trait', s, item.originalIndex ]) : null"
					@keydown.space.prevent="!item.isPlaceholder ? selectElement([ 'trait', s, item.originalIndex ]) : null"
					@click.stop="!item.isPlaceholder ? selectElement([ 'trait', s, item.originalIndex ]) : null">
					<span class="trait-name" v-if="!printBlank && !item.isPlaceholder && item.trait.name">{{ item.trait.name }}</span>
					<span class="trait-name trait-name-blank" v-else-if="printBlank || item.isPlaceholder || !item.trait.name">
						<template v-if="submode === 'edit' && !printBlank && !item.trait.name">
							<span class="trait-name-hint">{{ traitSet.nounSingular || 'Name' }}...</span>
						</template>
						<template v-else>
							<span class="trait-blank-line"></span>
						</template>
					</span>
					<span class="trait-name" v-else>{{ item.trait.name || '' }}</span>

					<!-- ONLINE (EDIT / PLAY): DYNAMICALLY RENDER THE POOL -->
					<div class="trait-value multidie-value" v-if="submode !== 'print'">
						<div
							v-for="(dieSize, dIdx) in (item.isPlaceholder ? [6] : getResourcePoolDice(item.trait, traitSet))"
							:key="dIdx"
							class="multidie-badge-wrap"
							:class="{ 'spent': !item.isPlaceholder && isDieSpent(item.trait, dIdx) }"
						>
							<span
								:class="{ 'c active': !item.isPlaceholder, 'c': item.isPlaceholder }"
								@click.stop="!item.isPlaceholder ? handleDieClick(item.trait, dieSize, dIdx, traitSet, s, item.originalIndex) : null"
								:title="submode === 'play' && !item.isPlaceholder ? 'Click to add d' + dieSize + ' to roller pool' : ''"
								v-html="renderDieValueForPrint(dieSize, !item.isPlaceholder)"
							></span>
							<div class="die-play-controls" v-if="submode === 'play' && !item.isPlaceholder">
								<button type="button" class="btn-play-spend" @click.stop="toggleDieSpentInPlay(s, item.originalIndex, dIdx)" :title="isDieSpent(item.trait, dIdx) ? 'Restore die' : 'Spend die'">
									<i :class="isDieSpent(item.trait, dIdx) ? 'fas fa-rotate-left' : 'fas fa-xmark'"></i>
								</button>
							</div>
						</div>
					</div>

					<!-- PRINT TAB / PRINT PREVIEW: RATING LADDER + DICE COUNT TRACK -->
					<template v-else>
						<span class="dice-count-rating-label">{{ getTraitSetLabel(traitSet, 'rating') }}</span>
						<div class="trait-value single-die-value" @click.stop="!printBlank && !item.isPlaceholder ? handleSingleDieClick(item.trait, item.trait.value, traitSet, s, item.originalIndex) : null">
							<span v-for="size in getTraitSetRatings(traitSet)" :key="size"
								:class="{ 'c': true, 'active': !printBlank && !item.isPlaceholder && item.trait.value === size }"
								v-html="renderDieValueForPrint(size, !printBlank && !item.isPlaceholder && item.trait.value === size)"></span>
						</div>
						<span class="dice-count-count-label">{{ getTraitSetLabel(traitSet, 'dice') }}</span>
						<div class="dice-count-track">
							<span v-for="n in getPrintTallyPips(item.trait)" :key="n" class="dice-count-pip"
								:class="{ 'filled': !printBlank && !item.isPlaceholder && getResourceDiceCount(item.trait) >= n }"
								@click.stop="submode === 'edit' && !printBlank && !item.isPlaceholder ? setResourceDiceCount(s, item.originalIndex, n) : null"
								:title="submode === 'edit' && !item.isPlaceholder ? 'Set dice count to ' + n : ''">{{ n }}</span>
						</div>
					</template>
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
