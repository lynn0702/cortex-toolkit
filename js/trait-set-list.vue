<script setup lang="ts">
import { getView } from './model.ts';
import { injectTraitSet } from './use-trait-set.ts';
import TraitSetPips from './trait-set-pips.vue';
import TraitSetFrame from './trait-set-frame.vue';

const {
	traitSet, s, submode, printBlank, viewY, character,
	isSelected, selectElement, openTraitAt, updateCharacter, removeTrait, addTrait,
	getRenderedTraits, getTraitClasses, getTraitSetRatings, getSubtraitRatings,
	isSpotlightStyle, isSpotlightPrintStyle,
	renderDieValueForPrint, getRatingPosition, getTraitStatement, renderText, isStatementSet, isFixedSystemTrait,
	hasQuestionedPip, isTraitQuestioned, toggleTraitQuestioned, handleSingleDieClick, handleDieClick,
	handleSteppedDieClick, handleOutClick, shouldShowOut, isTraitOut, getTraitDice, getRating,
	isDieSpent, toggleDieSpentInPlay, isSpendable, firstDie, isDieActive, isTraitRated, 	hasTrackPart, getTrackLabel, getTraitTrackLabel, getTrackScale, getTrackValue, visibleSubtraits,
	getSetRatingDie,
	shouldShowTrackOut, isTrackOut, handleTrackClick, handleTrackOutClick,
	getDisplayTraitSfx, getTraitSetLabel, getParts, partsGridFor, partCellStyle, partsGridStyle, isPartsInline,
	getTraitPipBubbles, toggleTraitPipBubble, getDynamicChildParts, parseChildPartKey, getChildTraitByNoun,
	isPlayAddRemovableSet, traitHasHinder, hinderDie, handleHinderDieClick, stageTrackDie,
	resolvedFrame, isFrameActive, isPositionalFrameActive, frameSvgPath, frameStrokeClass, frameStrokeStyle, getTraitAnchorStyle, getTraitAnchorDock, getTraitNameAnchorStyle
} = injectTraitSet();
</script>

<template>
	<div
		class="trait-list"
		:class="[
			getView(traitSet)?.style?.body === 'list' ? 'trait-list-unrated' : '',
			(Number(getView(traitSet)?.traitColumns) > 1 ? ('trait-list-cols-' + getView(traitSet)?.traitColumns) : ''),
			isPositionalFrameActive ? ('trait-list-framed frame-shape-' + resolvedFrame?.shape) : ''
		]"
	>
		<!-- Decorative SVG for positional frames (ring, ellipse, arc, path) -->
		<TraitSetFrame
			v-if="isPositionalFrameActive"
			:trait-set="traitSet"
		/>

		<!-- Center Hub / Portrait slot for ring frames -->
		<div
			v-if="isPositionalFrameActive && resolvedFrame?.shape === 'ring'"
			class="frame-ring-hub-slot"
			aria-hidden="true"
		>
			<slot name="hub">
				<div class="frame-hub-circle"></div>
			</slot>
		</div>

		<!-- PIPS BODY (XP / TRACK) -->
		<TraitSetPips v-if="getView(traitSet)?.style?.body === 'pips'" />

		<template v-else>

		<template v-for="(item, t) in getRenderedTraits(traitSet, s)" :key="item.trait._lid || ('t' + t)">
			<div
				:class="getTraitClasses(item.trait)"
				:data-trait-name="item.trait.name || undefined"
				:data-trait-rating="firstDie(item.trait) ? ('d' + firstDie(item.trait)) : undefined"
				:data-trait-out="isTraitOut(item.trait, traitSet) ? 'true' : undefined"
				:data-trait-questioned="isTraitQuestioned(item.trait) ? 'true' : undefined"
				:style="isPositionalFrameActive ? getTraitAnchorStyle(t) : undefined"
				:data-frame-dock="isPositionalFrameActive ? getTraitAnchorDock(t) : undefined"
			>
				<transition name="trait" appear>
					<!-- PARTS GRID (explicit trait-part coordinates) -->
					<div v-if="partsGridFor(traitSet)" :class="{ 'trait-inner': true, 'trait-parts': true, 'trait-parts-inline': isPartsInline(traitSet), 'selected': !item.isPlaceholder && isSelected(['trait', s, item.originalIndex]), 'trait-placeholder-slot': item.isPlaceholder }"
						:style="partsGridStyle(partsGridFor(traitSet), !isStatementSet(traitSet))"
					>
						<!-- NAME (above: the asset box; the dice live in the rating cell) -->
						<div v-if="partsGridFor(traitSet)?.cells.name" class="trait-part trait-part-name" :class="{ 'trait-asset-card': getRatingPosition(traitSet) === 'above' }" :style="[partCellStyle(partsGridFor(traitSet), 'name'), isPositionalFrameActive ? getTraitNameAnchorStyle(t) : undefined]">
							<div :class="{ 'trait-title': getRatingPosition(traitSet) !== 'above', 'trait-title-statement': isStatementSet(traitSet) && getRatingPosition(traitSet) !== 'above', 'trait-title-stacked': getRatingPosition(traitSet) === 'below', 'trait-asset-box': getRatingPosition(traitSet) === 'above' }">
								<span
									class="distinction-die"
									v-if="isSpotlightPrintStyle && getView(traitSet)?.style?.body === 'sfx-rows' && getTraitSetRatings(traitSet).length <= 1 && getRatingPosition(traitSet) !== 'none'"
									aria-hidden="true"
									v-html="renderDieValueForPrint(firstDie(item.trait) || 8, !printBlank && !item.isPlaceholder && isTraitRated(item.trait))"
								></span>
								<template v-if="isStatementSet(traitSet) && getRatingPosition(traitSet) !== 'above'">
									<button
										type="button"
										class="trait-title-btn"
										:aria-label="(!item.isPlaceholder && item.trait.name) ? (item.trait.name + (submode === 'play' ? ' options' : ' edit')) : ((traitSet.noun || 'Name') + ' edit')"
										@click.stop="openTraitAt(s, item)"
									>
										<span class="trait-name" v-if="(!printBlank || isFixedSystemTrait(traitSet, item.trait)) && !item.isPlaceholder && item.trait.name">{{ item.trait.name }}</span>
										<span class="trait-name trait-name-blank" v-else-if="printBlank || item.isPlaceholder || !item.trait.name">
											<template v-if="isFixedSystemTrait(traitSet, item.trait) && !item.isPlaceholder">
												{{ item.trait.name }}
											</template>
											<template v-else-if="submode === 'edit' && !printBlank">
												<span class="trait-name-hint">{{ traitSet.noun || 'Name' }}...</span>
											</template>
											<template v-else>
												<span class="trait-blank-line"></span>
											</template>
										</span>
										<span class="trait-name" v-else>{{ item.trait.name || '' }}</span>
									</button>
									<span
										v-if="hasQuestionedPip(traitSet)"
										class="statement-pip"
										:class="{ 'questioned': isTraitQuestioned(item.trait) }"
										role="checkbox"
										tabindex="0"
										:aria-checked="isTraitQuestioned(item.trait) ? 'true' : 'false'"
										:aria-label="`Question statement for ${item.trait.name || 'trait'}`"
										@keydown.enter.prevent="toggleTraitQuestioned(s, item.originalIndex)"
										@keydown.space.prevent="toggleTraitQuestioned(s, item.originalIndex)"
										@click.stop="toggleTraitQuestioned(s, item.originalIndex)"
										:title="submode === 'play' ? (isTraitQuestioned(item.trait) ? 'Questioned (click to reset)' : 'Click to question') : ''"
									></span>
									<span class="trait-statement-box">
										<span class="trait-statement-text" v-if="!printBlank && !item.isPlaceholder && getTraitStatement(item.trait, true)" v-html="renderText(getTraitStatement(item.trait, true))"></span>
										<span class="trait-statement-blank" v-else-if="printBlank || item.isPlaceholder"></span>
										<span class="trait-statement-hint" v-else-if="submode === 'edit'">Statement...</span>
										<span class="trait-statement-blank" v-else></span>
									</span>
								</template>
								<template v-else-if="getRatingPosition(traitSet) === 'above'">
									<button
										type="button"
										class="trait-title-btn trait-asset-box"
										:aria-label="(!item.isPlaceholder && item.trait.name) ? (item.trait.name + (submode === 'play' ? ' options' : ' edit')) : 'Edit asset'"
										@click.stop="openTraitAt(s, item)"
									>
										<div class="trait-asset-name" v-if="!printBlank && !item.isPlaceholder && item.trait.name">{{ item.trait.name }}</div>
										<div class="trait-asset-desc" v-if="!printBlank && !item.isPlaceholder && getTraitStatement(item.trait)" v-html="renderText(getTraitStatement(item.trait))"></div>
										<div class="trait-asset-empty" v-else-if="printBlank || item.isPlaceholder"></div>
										<div class="trait-asset-hint" v-else-if="submode === 'edit'">Click to edit asset...</div>
										<div class="trait-asset-empty" v-else></div>
									</button>
								</template>
								<template v-else>
									<button
										type="button"
										class="trait-title-btn"
										:aria-label="(!item.isPlaceholder && item.trait.name) ? (item.trait.name + (submode === 'play' ? ' options' : ' edit')) : ((traitSet.noun || 'Name') + ' edit')"
										@click.stop="openTraitAt(s, item)"
									>
										<span class="trait-name" v-if="(!printBlank || isFixedSystemTrait(traitSet, item.trait)) && !item.isPlaceholder && item.trait.name">{{ item.trait.name }}</span>
										<span class="trait-name trait-name-blank" v-else-if="printBlank || item.isPlaceholder || !item.trait.name">
											<template v-if="item.trait.name && item.trait.name.endsWith(':') && !item.isPlaceholder">
												{{ item.trait.name }} <span class="trait-blank-line"></span>
											</template>
											<template v-else-if="isFixedSystemTrait(traitSet, item.trait) && !item.isPlaceholder">
												{{ item.trait.name }}
											</template>
											<template v-else-if="submode === 'edit' && !printBlank">
												<span class="trait-name-hint">{{ traitSet.noun || 'Name' }}...</span>
											</template>
											<template v-else>
												<span class="trait-blank-line"></span>
											</template>
										</span>
										<span class="trait-name" v-else>{{ item.trait.name || '' }}</span>
									</button>
								</template>
							</div>
						</div>
						<!-- RATING -->
						<div v-if="partsGridFor(traitSet)?.cells.rating" class="trait-part trait-part-rating" :class="{ 'trait-asset-card': getRatingPosition(traitSet) === 'above', 'trait-title trait-title-stacked': getRatingPosition(traitSet) === 'below' }" :style="partCellStyle(partsGridFor(traitSet), 'rating')">
							<div class="trait-value stress-value" v-if="getView(traitSet)?.style?.body === 'die-track'">
								<span
									v-for="size in getTraitSetRatings(traitSet)"
									:key="size"
									:class="{ 'c': true, 'active': !printBlank && !item.isPlaceholder && isDieActive(item.trait, size) }"
									role="button"
									tabindex="0"
									:aria-label="`Stage d${size} from ${item.trait.name || 'trait'}`"
									:aria-pressed="isDieActive(item.trait, size) ? 'true' : 'false'"
									@click.stop="!printBlank && !item.isPlaceholder ? handleSteppedDieClick(s, item.originalIndex, size) : null"
									@keydown.enter.prevent="!printBlank && !item.isPlaceholder ? handleSteppedDieClick(s, item.originalIndex, size) : null"
									@keydown.space.prevent="!printBlank && !item.isPlaceholder ? handleSteppedDieClick(s, item.originalIndex, size) : null"
									v-html="renderDieValueForPrint(size, !printBlank && !item.isPlaceholder && isDieActive(item.trait, size))"
								></span>
								<span
									v-if="shouldShowOut(traitSet)"
									:class="{ 'stress-out-badge': true, 'active': !printBlank && !item.isPlaceholder && isTraitOut(item.trait, traitSet) }"
									role="button"
									tabindex="0"
									:aria-label="`Out for ${item.trait.name || 'trait'}`"
									:aria-pressed="isTraitOut(item.trait, traitSet) ? 'true' : 'false'"
									@click.stop="!printBlank && !item.isPlaceholder ? handleOutClick(s, item.originalIndex) : null"
									@keydown.enter.prevent="!printBlank && !item.isPlaceholder ? handleOutClick(s, item.originalIndex) : null"
									@keydown.space.prevent="!printBlank && !item.isPlaceholder ? handleOutClick(s, item.originalIndex) : null"
									title="Out"
								>{{ getTraitSetLabel(traitSet, 'out') }}</span>
								<button
									v-if="submode === 'play' && !printBlank && !item.isPlaceholder && firstDie(item.trait) > 0"
									type="button"
									class="btn-stage-stress"
									@click.stop="stageTrackDie(item.trait, firstDie(item.trait), item.trait.name || traitSet.noun || 'Trait', traitSet)"
									title="Stage die into pool"
									aria-label="Stage die into pool"
								>+<i class="fas fa-dice" aria-hidden="true"></i></button>
							</div>
							<div class="trait-value" v-else-if="getView(traitSet)?.style?.body === 'list'"></div>
							<div class="trait-value" v-else-if="isSpotlightPrintStyle && getView(traitSet)?.style?.body === 'sfx-rows' && getTraitSetRatings(traitSet).length <= 1"></div>
							<div class="trait-value pip-value" v-else-if="getRating(item.trait)?.type === 'Pip'">
								<span
									v-for="(filled, pIdx) in getTraitPipBubbles(item.trait)"
									:key="pIdx"
									class="pip-bubble"
									:class="{ filled: !printBlank && filled }"
									role="checkbox"
									:aria-checked="filled ? 'true' : 'false'"
									:aria-label="`Pip ${pIdx + 1} of ${item.trait.name || 'trait'}`"
									@click.stop="toggleTraitPipBubble(item.trait, pIdx)"
								></span>
							</div>
							<div class="trait-value counter-value" v-else-if="getRating(item.trait)?.type === 'Counter'">
								<span class="counter-display">{{ getRating(item.trait)?.value?.[0] ?? 0 }}</span>
							</div>
							<div class="trait-value multidie-value" v-else-if="getRating(item.trait)?.type === 'Dice'">
								<div
									v-for="(dieSize, dIdx) in (printBlank || item.isPlaceholder ? getTraitSetRatings(traitSet) : getTraitDice(item.trait))"
									:key="dIdx"
									class="multidie-badge-wrap"
									:class="{ 'spent': !printBlank && !item.isPlaceholder && isDieSpent(item.trait, dIdx) }"
								>
									<span
										:class="{ 'c active': !printBlank && !item.isPlaceholder }"
										role="button"
										tabindex="0"
										:aria-label="`Stage d${dieSize} from ${item.trait.name || 'trait'}`"
										@click.stop="!printBlank && !item.isPlaceholder ? handleDieClick(item.trait, dieSize, dIdx, traitSet, s, item.originalIndex) : null"
										@keydown.enter.prevent="!printBlank && !item.isPlaceholder ? handleDieClick(item.trait, dieSize, dIdx, traitSet, s, item.originalIndex) : null"
										@keydown.space.prevent="!printBlank && !item.isPlaceholder ? handleDieClick(item.trait, dieSize, dIdx, traitSet, s, item.originalIndex) : null"
										:title="submode === 'play' && !printBlank && !item.isPlaceholder ? 'Click to add d' + dieSize + ' to roller pool' : ''"
										v-html="renderDieValueForPrint(dieSize, !printBlank && !item.isPlaceholder)"
									></span>
									<div class="die-play-controls" v-if="submode === 'play' && !printBlank && !item.isPlaceholder && isSpendable(item.trait, traitSet)">
										<button
											type="button"
											class="btn-play-spend"
											@click.stop="toggleDieSpentInPlay(s, item.originalIndex, dIdx)"
											:title="isDieSpent(item.trait, dIdx) ? 'Restore die' : 'Spend die'"
											:aria-label="isDieSpent(item.trait, dIdx) ? (`Restore d${dieSize} on ${item.trait.name || 'trait'}`) : (`Spend d${dieSize} on ${item.trait.name || 'trait'}`)"
										>
											<i :class="isDieSpent(item.trait, dIdx) ? 'fas fa-rotate-left' : 'fas fa-xmark'" aria-hidden="true"></i>
										</button>
									</div>
								</div>
							</div>
							<div class="trait-value single-die-value"
								:class="{ 'has-hinder-pill': submode === 'play' && !printBlank && !item.isPlaceholder && traitHasHinder(item.trait, traitSet) }"
								@click.stop="submode === 'play' && !printBlank && !item.isPlaceholder ? handleSingleDieClick(item.trait, firstDie(item.trait), traitSet, s, item.originalIndex) : null"
							>
								<span
									v-for="size in getTraitSetRatings(traitSet)"
									:key="size"
									:class="{ 'c': true, 'active': !printBlank && !item.isPlaceholder && isDieActive(item.trait, size) }"
									role="button"
									tabindex="0"
									:aria-label="`Stage d${size} from ${item.trait.name || 'trait'}`"
									:aria-pressed="isDieActive(item.trait, size) ? 'true' : 'false'"
									@click.stop="!printBlank && !item.isPlaceholder ? handleSingleDieClick(item.trait, size, traitSet, s, item.originalIndex) : null"
									@keydown.enter.prevent="!printBlank && !item.isPlaceholder ? handleSingleDieClick(item.trait, size, traitSet, s, item.originalIndex) : null"
									@keydown.space.prevent="!printBlank && !item.isPlaceholder ? handleSingleDieClick(item.trait, size, traitSet, s, item.originalIndex) : null"
									v-html="renderDieValueForPrint(size, !printBlank && !item.isPlaceholder && isDieActive(item.trait, size))"
								></span>
								<button
									v-if="submode === 'play' && !printBlank && !item.isPlaceholder && traitHasHinder(item.trait, traitSet)"
									type="button"
									class="btn-hinder-pill"
									@click.stop="handleHinderDieClick(item.trait, traitSet, s, item.originalIndex)"
									title="Take d4 and gain 1 PP"
									aria-label="Take d4 and gain 1 PP"
								>
									<span class="c" aria-hidden="true">d{{ hinderDie(item.trait) || 4 }}</span><span class="hinder-pp-tag" aria-hidden="true">+PP</span>
								</button>
								<span v-if="getSetRatingDie(traitSet) && !item.isPlaceholder && !isTraitRated(item.trait)" class="c set-rating-die" v-html="renderDieValueForPrint(getSetRatingDie(traitSet), true)" :title="'Rating d' + getSetRatingDie(traitSet)" aria-hidden="true"></span>
								<span
									v-if="shouldShowOut(traitSet)"
									:class="{ 'stress-out-badge': true, 'active': !printBlank && !item.isPlaceholder && isTraitOut(item.trait, traitSet) }"
									role="button"
									tabindex="0"
									:aria-label="`Out for ${item.trait.name || 'trait'}`"
									:aria-pressed="isTraitOut(item.trait, traitSet) ? 'true' : 'false'"
									@click.stop="!printBlank && !item.isPlaceholder ? handleOutClick(s, item.originalIndex) : null"
									@keydown.enter.prevent="!printBlank && !item.isPlaceholder ? handleOutClick(s, item.originalIndex) : null"
									@keydown.space.prevent="!printBlank && !item.isPlaceholder ? handleOutClick(s, item.originalIndex) : null"
									title="Out"
								>{{ getTraitSetLabel(traitSet, 'out') }}</span>
							</div>
						</div>
						<!-- TRACK LABEL -->
						<div v-if="partsGridFor(traitSet)?.cells.trackLabel" class="trait-part trait-part-track-label" :style="partCellStyle(partsGridFor(traitSet), 'trackLabel')">
							<div class="attached-stress-divider" v-if="!isPartsInline(traitSet)"></div>
							<span class="attached-stress-label">{{ getTraitTrackLabel(traitSet, item.trait) }}</span>
						</div>
						<!-- TRACK CELLS -->
						<div v-if="partsGridFor(traitSet)?.cells.track" class="trait-part trait-part-track" :style="partCellStyle(partsGridFor(traitSet), 'track') + '; --track-faces: ' + getTrackScale(traitSet).length">
							<div class="attached-stress-track">
								<span
									v-for="size in getTrackScale(traitSet)"
									:key="size"
									:class="{
										'attached-stress-die': true,
										'c': true,
										'active': !printBlank && getTrackValue(item.trait, traitSet) === size
									}"
									role="button"
									tabindex="0"
									:aria-label="`Stage d${size} ${getTraitTrackLabel(traitSet, item.trait)} from ${item.trait.name || 'trait'}`"
									:aria-pressed="getTrackValue(item.trait, traitSet) === size ? 'true' : 'false'"
									@click.stop="!printBlank ? handleTrackClick(s, item.originalIndex, size) : null"
									@keydown.enter.prevent="!printBlank ? handleTrackClick(s, item.originalIndex, size) : null"
									@keydown.space.prevent="!printBlank ? handleTrackClick(s, item.originalIndex, size) : null"
									v-html="renderDieValueForPrint(size, !printBlank && getTrackValue(item.trait, traitSet) === size)"
								></span>
								<span
									v-if="shouldShowTrackOut(traitSet)"
									:class="{ 'stress-out-badge': true, 'active': !printBlank && isTrackOut(item.trait, traitSet) }"
									role="button"
									tabindex="0"
									:aria-label="`Out for ${item.trait.name || 'trait'}`"
									:aria-pressed="isTrackOut(item.trait, traitSet) ? 'true' : 'false'"
									@click.stop="!printBlank ? handleTrackOutClick(s, item.originalIndex) : null"
									@keydown.enter.prevent="!printBlank ? handleTrackOutClick(s, item.originalIndex) : null"
									@keydown.space.prevent="!printBlank ? handleTrackOutClick(s, item.originalIndex) : null"
									title="Out"
								>{{ getTraitSetLabel(traitSet, 'out') }}</span>
								<button
									v-if="submode === 'play' && !printBlank && !item.isPlaceholder && getTrackValue(item.trait, traitSet) > 0"
									type="button"
									class="btn-stage-stress"
									@click.stop="stageTrackDie(item.trait, getTrackValue(item.trait, traitSet), getTraitTrackLabel(traitSet, item.trait), traitSet)"
									title="Stage track die into pool"
									aria-label="Stage track die into pool"
								>+<i class="fas fa-dice" aria-hidden="true"></i></button>
							</div>
						</div>
						<!-- DESCRIPTION -->
						<div v-if="partsGridFor(traitSet)?.cells.description" class="trait-part trait-part-description" :style="partCellStyle(partsGridFor(traitSet), 'description')">
							<div class="trait-description">
								<div v-if="!printBlank && !item.isPlaceholder && item.trait.description" v-html="renderText(item.trait.description)"></div>
								<div class="desc-hint" v-else-if="submode === 'edit'">Description...</div>
								<div class="desc-blank-area" v-else-if="printBlank || item.isPlaceholder">
									<div class="desc-blank-line"></div>
								</div>
								<div class="desc-blank-line" v-else></div>
							</div>
						</div>
						<!-- BLOCK (SFX) -->
						<div v-if="partsGridFor(traitSet)?.cells.block && getDisplayTraitSfx(traitSet, item.trait).length" class="trait-part trait-part-block" :style="partCellStyle(partsGridFor(traitSet), 'block')">
							<ul class="trait-sfx">
								<li v-for="(sfx, sfIdx) in getDisplayTraitSfx(traitSet, item.trait)" :key="(sfx && sfx._lid) || ('sfx' + sfIdx)">
									<template v-if="sfx.isHinder">
										<span class="trait-sfx-name">Hinder</span>:
										<span class="trait-sfx-description"
											v-html="renderText(sfx.description)"
										></span>
									</template>
									<template v-else>
										<span class="trait-sfx-name" v-if="sfx.name">{{ sfx.name }}</span><span v-if="sfx.name && sfx.description">: </span>
										<span class="trait-sfx-description" v-if="sfx.description" v-html="renderText(sfx.description)"></span>
										<span class="sfx-blank-line" v-else-if="submode === 'print'"></span>
										<span class="sfx-placeholder-hint" v-else-if="submode === 'edit'">SFX...</span>
									</template>
								</li>
							</ul>
						</div>
						<!-- SUBTRAITS -->
						<div v-if="partsGridFor(traitSet)?.cells.subtraits" class="trait-part trait-part-subtraits" :style="partCellStyle(partsGridFor(traitSet), 'subtraits')">
							<ul class="subtraits" v-if="(visibleSubtraits(traitSet, item.trait).length || printBlank)">
								<li class="subtrait" v-for="(subtrait, u) in (visibleSubtraits(traitSet, item.trait).length ? visibleSubtraits(traitSet, item.trait) : (printBlank ? [{ name: '' }] : []))" :key="subtrait._lid || ('u' + u)" @click.stop="!printBlank ? handleSingleDieClick(subtrait, firstDie(subtrait), traitSet, s, item.originalIndex) : null">
									<span class="subtrait-name" v-if="subtrait.name">{{ subtrait.name }}</span>
									<span class="subtrait-name" v-else>
										<span class="trait-blank-line subtrait-blank-line"></span>
									</span>
									<div class="subtrait-value">
										<span
											v-for="size in getSubtraitRatings(traitSet)"
											:key="size"
											:class="{ 'c': true, 'active': !printBlank && isDieActive(subtrait, size) }"
											role="button"
											tabindex="0"
											:aria-label="`Stage d${size} from ${subtrait.name || 'subtrait'}`"
											:aria-pressed="isDieActive(subtrait, size) ? 'true' : 'false'"
											@keydown.enter.prevent="!printBlank ? handleSingleDieClick(subtrait, size, traitSet, s, item.originalIndex) : null"
											@keydown.space.prevent="!printBlank ? handleSingleDieClick(subtrait, size, traitSet, s, item.originalIndex) : null"
											v-html="renderDieValueForPrint(size, !printBlank && isDieActive(subtrait, size))"
										></span>
									</div>
								</li>
							</ul>
						</div>
						<!-- DYNAMIC CHILD TRAIT PARTS -->
						<template v-for="partKey in getDynamicChildParts(traitSet)" :key="partKey">
							<div
								v-if="partsGridFor(traitSet)?.cells[partKey]"
								:class="'trait-part trait-part-' + partKey.replace(/[^a-zA-Z0-9_-]/g, '-' )"
								:style="partCellStyle(partsGridFor(traitSet), partKey)"
							>
								<template v-if="parseChildPartKey(partKey).kind === 'label'">
									<span class="child-part-label" v-if="(getView(traitSet)?.parts?.[partKey] as any)?.marker === 'L'">
										{{ getChildTraitByNoun(item.trait, parseChildPartKey(partKey).noun)?.name || parseChildPartKey(partKey).noun }}
									</span>
									<span class="child-part-text" v-else>
										{{ getChildTraitByNoun(item.trait, parseChildPartKey(partKey).noun)?.description || getChildTraitByNoun(item.trait, parseChildPartKey(partKey).noun)?.name || '' }}
									</span>
								</template>
								<template v-else-if="parseChildPartKey(partKey).kind === 'rating'">
									<div class="trait-value child-part-value">
										<template v-if="getRating(getChildTraitByNoun(item.trait, parseChildPartKey(partKey).noun))?.type === 'Pip'">
											<span
												v-for="(filled, pIdx) in getTraitPipBubbles(getChildTraitByNoun(item.trait, parseChildPartKey(partKey).noun))"
												:key="pIdx"
												class="pip-bubble"
												:class="{ filled: !printBlank && filled }"
												role="checkbox"
												:aria-checked="filled ? 'true' : 'false'"
												@click.stop="toggleTraitPipBubble(getChildTraitByNoun(item.trait, parseChildPartKey(partKey).noun), pIdx)"
											></span>
										</template>
										<template v-else-if="getRating(getChildTraitByNoun(item.trait, parseChildPartKey(partKey).noun))?.type === 'Die'">
											<span
												v-for="size in (getRating(getChildTraitByNoun(item.trait, parseChildPartKey(partKey).noun))?.range || [4,6,8,10,12])"
												:key="size"
												class="c"
												:class="{ active: !printBlank && isDieActive(getChildTraitByNoun(item.trait, parseChildPartKey(partKey).noun)!, size) }"
												v-html="renderDieValueForPrint(size, !printBlank && isDieActive(getChildTraitByNoun(item.trait, parseChildPartKey(partKey).noun)!, size))"
											></span>
										</template>
										<template v-else-if="getRating(getChildTraitByNoun(item.trait, parseChildPartKey(partKey).noun))?.type === 'Dice'">
											<div
												v-for="(dieSize, dIdx) in (getRating(getChildTraitByNoun(item.trait, parseChildPartKey(partKey).noun))?.value || [])"
												:key="dIdx"
												class="multidie-badge-wrap"
											>
												<span class="c active" v-html="renderDieValueForPrint(Number(dieSize) || 6, !printBlank)"></span>
											</div>
										</template>
										<template v-else-if="getRating(getChildTraitByNoun(item.trait, parseChildPartKey(partKey).noun))?.type === 'Counter'">
											<span class="counter-display">{{ getRating(getChildTraitByNoun(item.trait, parseChildPartKey(partKey).noun))?.value?.[0] ?? 0 }}</span>
										</template>
									</div>
								</template>
							</div>
						</template>
					</div>
					<div v-else :class="{ 'trait-inner': true, 'selected': !item.isPlaceholder && isSelected(['trait', s, item.originalIndex]), 'trait-placeholder-slot': item.isPlaceholder }">
						<!-- RATING POSITION ABOVE (e.g. Signature Assets) -->
						<template v-if="getRatingPosition(traitSet) === 'above'">
							<div class="trait-asset-card">
								<div class="trait-value single-die-value">
									<span
										v-for="size in getTraitSetRatings(traitSet)"
										:key="size"
										:class="{ 'c': true, 'active': !printBlank && !item.isPlaceholder && isDieActive(item.trait, size) }"
										role="button"
										tabindex="0"
										:aria-label="`Stage d${size} from ${item.trait.name || 'trait'}`"
										:aria-pressed="isDieActive(item.trait, size) ? 'true' : 'false'"
										@click.stop="!printBlank && !item.isPlaceholder ? handleSingleDieClick(item.trait, size, traitSet, s, item.originalIndex) : null"
										@keydown.enter.prevent="!printBlank && !item.isPlaceholder ? handleSingleDieClick(item.trait, size, traitSet, s, item.originalIndex) : null"
										@keydown.space.prevent="!printBlank && !item.isPlaceholder ? handleSingleDieClick(item.trait, size, traitSet, s, item.originalIndex) : null"
										v-html="renderDieValueForPrint(size, !printBlank && !item.isPlaceholder && isDieActive(item.trait, size))"
									></span>
								</div>
								<button
									type="button"
									class="trait-title-btn trait-asset-box"
									:aria-label="(!item.isPlaceholder && item.trait.name) ? (item.trait.name + (submode === 'play' ? ' options' : ' edit')) : 'Edit asset'"
									@click.stop="openTraitAt(s, item)"
								>
									<div class="trait-asset-name" v-if="!printBlank && !item.isPlaceholder && item.trait.name">{{ item.trait.name }}</div>
									<div class="trait-asset-desc" v-if="!printBlank && !item.isPlaceholder && getTraitStatement(item.trait)" v-html="renderText(getTraitStatement(item.trait))"></div>
									<div class="trait-asset-empty" v-else-if="printBlank || item.isPlaceholder"></div>
									<div class="trait-asset-hint" v-else-if="submode === 'edit'">Click to edit asset...</div>
									<div class="trait-asset-empty" v-else></div>
								</button>
							</div>
						</template>

						<!-- STANDARD OR OTHER RATING POSITIONS (INLINE, BELOW, NONE) -->
						<template v-else>
							<div class="trait-title" :class="{ 'trait-title-statement': isStatementSet(traitSet), 'trait-title-stacked': getRatingPosition(traitSet) === 'below' }" :style="isPositionalFrameActive ? getTraitNameAnchorStyle(t) : undefined">
								<span class="list-bullet" v-if="getView(traitSet)?.style?.body === 'list'">•</span>
								<span
									class="distinction-die"
									v-if="isSpotlightPrintStyle && getView(traitSet)?.style?.body === 'sfx-rows' && getTraitSetRatings(traitSet).length <= 1 && getRatingPosition(traitSet) !== 'none'"
									v-html="renderDieValueForPrint(firstDie(item.trait) || 8, !printBlank && !item.isPlaceholder && isTraitRated(item.trait))"
								></span>

								<!-- STATEMENT MODE (e.g. Values) -->
								<template v-if="isStatementSet(traitSet)">
									<button
										type="button"
										class="trait-title-btn"
										:aria-label="(!item.isPlaceholder && item.trait.name) ? (item.trait.name + (submode === 'play' ? ' options' : ' edit')) : ((traitSet.noun || 'Name') + ' edit')"
										@click.stop="openTraitAt(s, item)"
									>
										<span class="trait-name" v-if="(!printBlank || isFixedSystemTrait(traitSet, item.trait)) && !item.isPlaceholder && item.trait.name">{{ item.trait.name }}</span>
										<span class="trait-name trait-name-blank" v-else-if="printBlank || item.isPlaceholder || !item.trait.name">
											<template v-if="isFixedSystemTrait(traitSet, item.trait) && !item.isPlaceholder">
												{{ item.trait.name }}
											</template>
											<template v-else-if="submode === 'edit' && !printBlank">
												<span class="trait-name-hint">{{ traitSet.noun || 'Name' }}...</span>
											</template>
											<template v-else>
												<span class="trait-blank-line"></span>
											</template>
										</span>
										<span class="trait-name" v-else>{{ item.trait.name || '' }}</span>
									</button>
									<span
										v-if="hasQuestionedPip(traitSet)"
										class="statement-pip"
										:class="{ 'questioned': isTraitQuestioned(item.trait) }"
										role="checkbox"
										tabindex="0"
										:aria-checked="isTraitQuestioned(item.trait) ? 'true' : 'false'"
										:aria-label="`Question statement for ${item.trait.name || 'trait'}`"
										@keydown.enter.prevent="toggleTraitQuestioned(s, item.originalIndex)"
										@keydown.space.prevent="toggleTraitQuestioned(s, item.originalIndex)"
										@click.stop="toggleTraitQuestioned(s, item.originalIndex)"
										:title="submode === 'play' ? (isTraitQuestioned(item.trait) ? 'Questioned (click to reset)' : 'Click to question') : ''"
									></span>
									<span class="trait-statement-box">
										<span class="trait-statement-text" v-if="!printBlank && !item.isPlaceholder && getTraitStatement(item.trait, true)" v-html="renderText(getTraitStatement(item.trait, true))"></span>
										<span class="trait-statement-blank" v-else-if="printBlank || item.isPlaceholder"></span>
										<span class="trait-statement-hint" v-else-if="submode === 'edit'">Statement...</span>
										<span class="trait-statement-blank" v-else></span>
									</span>
								</template>

								<!-- NORMAL TRAIT NAME -->
								<template v-else>
									<button
										type="button"
										class="trait-title-btn"
										:aria-label="(!item.isPlaceholder && item.trait.name) ? (item.trait.name + (submode === 'play' ? ' options' : ' edit')) : ((traitSet.noun || 'Name') + ' edit')"
										@click.stop="openTraitAt(s, item)"
									>
										<span class="trait-name" v-if="(!printBlank || isFixedSystemTrait(traitSet, item.trait)) && !item.isPlaceholder && item.trait.name">{{ item.trait.name }}</span>
										<span class="trait-name trait-name-blank" v-else-if="printBlank || item.isPlaceholder || !item.trait.name">
											<template v-if="item.trait.name && item.trait.name.endsWith(':') && !item.isPlaceholder">
												{{ item.trait.name }} <span class="trait-blank-line"></span>
											</template>
											<template v-else-if="isFixedSystemTrait(traitSet, item.trait) && !item.isPlaceholder">
												{{ item.trait.name }}
											</template>
											<template v-else-if="submode === 'edit' && !printBlank">
												<span class="trait-name-hint">{{ traitSet.noun || 'Name' }}...</span>
											</template>
											<template v-else>
												<span class="trait-blank-line"></span>
											</template>
										</span>
										<span class="trait-name" v-else>{{ item.trait.name || '' }}</span>
									</button>
								</template>

								<!-- STEPPED VALUE TRACK -->
								<div class="trait-value stress-value" v-if="getView(traitSet)?.style?.body === 'die-track'">
									<span
										v-for="size in getTraitSetRatings(traitSet)"
										:key="size"
										:class="{ 'c': true, 'active': !printBlank && !item.isPlaceholder && isDieActive(item.trait, size) }"
										role="button"
										tabindex="0"
										:aria-label="`Stage d${size} from ${item.trait.name || 'trait'}`"
										:aria-pressed="isDieActive(item.trait, size) ? 'true' : 'false'"
										@click.stop="!printBlank && !item.isPlaceholder ? handleSteppedDieClick(s, item.originalIndex, size) : null"
										@keydown.enter.prevent="!printBlank && !item.isPlaceholder ? handleSteppedDieClick(s, item.originalIndex, size) : null"
										@keydown.space.prevent="!printBlank && !item.isPlaceholder ? handleSteppedDieClick(s, item.originalIndex, size) : null"
										v-html="renderDieValueForPrint(size, !printBlank && !item.isPlaceholder && isDieActive(item.trait, size))"
									></span>
									<span
										v-if="shouldShowOut(traitSet)"
										:class="{ 'stress-out-badge': true, 'active': !printBlank && !item.isPlaceholder && isTraitOut(item.trait, traitSet) }"
										role="button"
										tabindex="0"
										:aria-label="`Out for ${item.trait.name || 'trait'}`"
										:aria-pressed="isTraitOut(item.trait, traitSet) ? 'true' : 'false'"
										@click.stop="!printBlank && !item.isPlaceholder ? handleOutClick(s, item.originalIndex) : null"
										@keydown.enter.prevent="!printBlank && !item.isPlaceholder ? handleOutClick(s, item.originalIndex) : null"
										@keydown.space.prevent="!printBlank && !item.isPlaceholder ? handleOutClick(s, item.originalIndex) : null"
										title="Out"
									>{{ getTraitSetLabel(traitSet, 'out') }}</span>
									<button
										v-if="submode === 'play' && !printBlank && !item.isPlaceholder && firstDie(item.trait) > 0"
										type="button"
										class="btn-stage-stress"
										@click.stop="stageTrackDie(item.trait, firstDie(item.trait), item.trait.name || traitSet.noun || 'Trait', traitSet)"
										title="Stage die into pool"
										aria-label="Stage die into pool"
									>+<i class="fas fa-dice" aria-hidden="true"></i></button>
								</div>

								<!-- LIST STYLE: NO VALUE -->
								<div class="trait-value" v-else-if="getView(traitSet)?.style?.body === 'list'"></div>

								<!-- DISTINCTIONS STYLE IN SPOTLIGHT: VALUE IS IN TITLE ONLY IF SINGLE FIXED RATING (EXCEPT ON BLANK PRINT SHEET WHERE FILLABLE DICE ARRAY IS EXPECTED) -->
								<div class="trait-value" v-else-if="isSpotlightPrintStyle && getView(traitSet)?.style?.body === 'sfx-rows' && getTraitSetRatings(traitSet).length <= 1"></div>

								<!-- NONE RATING POSITION: NO VALUE -->
								<div class="trait-value" v-else-if="!printBlank && getRatingPosition(traitSet) === 'none'"></div>

								<!-- DICE-RATED TRAIT -->
								<div class="trait-value multidie-value" v-else-if="getRating(item.trait)?.type === 'Dice'">
									<div
										v-for="(dieSize, dIdx) in (printBlank || item.isPlaceholder ? getTraitSetRatings(traitSet) : getTraitDice(item.trait))"
										:key="dIdx"
										class="multidie-badge-wrap"
										:class="{ 'spent': !printBlank && !item.isPlaceholder && isDieSpent(item.trait, dIdx) }"
									>
										<span
											:class="{ 'c active': !printBlank && !item.isPlaceholder }"
											role="button"
											tabindex="0"
											:aria-label="`Stage d${dieSize} from ${item.trait.name || 'trait'}`"
											:aria-pressed="!isDieSpent(item.trait, dIdx) ? 'true' : 'false'"
											@click.stop="!printBlank && !item.isPlaceholder ? handleDieClick(item.trait, dieSize, dIdx, traitSet, s, item.originalIndex) : null"
											@keydown.enter.prevent="!printBlank && !item.isPlaceholder ? handleDieClick(item.trait, dieSize, dIdx, traitSet, s, item.originalIndex) : null"
											@keydown.space.prevent="!printBlank && !item.isPlaceholder ? handleDieClick(item.trait, dieSize, dIdx, traitSet, s, item.originalIndex) : null"
											:title="submode === 'play' && !printBlank && !item.isPlaceholder ? 'Click to add d' + dieSize + ' to roller pool' : ''"
											v-html="renderDieValueForPrint(dieSize, !printBlank && !item.isPlaceholder)"
										></span>
										<div class="die-play-controls" v-if="submode === 'play' && !printBlank && !item.isPlaceholder && isSpendable(item.trait, traitSet)">
											<button
												type="button"
												class="btn-play-spend"
												@click.stop="toggleDieSpentInPlay(s, item.originalIndex, dIdx)"
												:title="isDieSpent(item.trait, dIdx) ? 'Restore die' : 'Spend die'"
												:aria-label="isDieSpent(item.trait, dIdx) ? (`Restore d${dieSize} on ${item.trait.name || 'trait'}`) : (`Spend d${dieSize} on ${item.trait.name || 'trait'}`)"
											>
												<i :class="isDieSpent(item.trait, dIdx) ? 'fas fa-rotate-left' : 'fas fa-xmark'" aria-hidden="true"></i>
											</button>
										</div>
									</div>
								</div>

								<!-- STANDARD SINGLE-DIE TRAIT -->
								<div class="trait-value single-die-value"
									:class="{ 'has-hinder-pill': submode === 'play' && !printBlank && !item.isPlaceholder && traitHasHinder(item.trait, traitSet) }"
									@click.stop="submode === 'play' && !printBlank && !item.isPlaceholder ? handleSingleDieClick(item.trait, firstDie(item.trait), traitSet, s, item.originalIndex) : null"
								>
									<span
										v-for="size in getTraitSetRatings(traitSet)"
										:key="size"
										:class="{ 'c': true, 'active': !printBlank && !item.isPlaceholder && isDieActive(item.trait, size) }"
										role="button"
										tabindex="0"
										:aria-label="`Stage d${size} from ${item.trait.name || 'trait'}`"
										:aria-pressed="isDieActive(item.trait, size) ? 'true' : 'false'"
										@click.stop="!printBlank && !item.isPlaceholder ? handleSingleDieClick(item.trait, size, traitSet, s, item.originalIndex) : null"
										@keydown.enter.prevent="!printBlank && !item.isPlaceholder ? handleSingleDieClick(item.trait, size, traitSet, s, item.originalIndex) : null"
										@keydown.space.prevent="!printBlank && !item.isPlaceholder ? handleSingleDieClick(item.trait, size, traitSet, s, item.originalIndex) : null"
										v-html="renderDieValueForPrint(size, !printBlank && !item.isPlaceholder && isDieActive(item.trait, size))"
									></span>
									<button
										v-if="submode === 'play' && !printBlank && !item.isPlaceholder && traitHasHinder(item.trait, traitSet)"
										type="button"
										class="btn-hinder-pill"
										@click.stop="handleHinderDieClick(item.trait, traitSet, s, item.originalIndex)"
										title="Take d4 and gain 1 PP"
										aria-label="Take d4 and gain 1 PP"
									>
										<span class="c" aria-hidden="true">d{{ hinderDie(item.trait) || 4 }}</span><span class="hinder-pp-tag" aria-hidden="true">+PP</span>
									</button>
									<span v-if="getSetRatingDie(traitSet) && !item.isPlaceholder && !isTraitRated(item.trait)" class="c set-rating-die" v-html="renderDieValueForPrint(getSetRatingDie(traitSet), true)" :title="'Rating d' + getSetRatingDie(traitSet)" aria-hidden="true"></span>
									<span
										v-if="shouldShowOut(traitSet)"
										:class="{ 'stress-out-badge': true, 'active': !printBlank && !item.isPlaceholder && isTraitOut(item.trait, traitSet) }"
										role="button"
										tabindex="0"
										:aria-label="`Out for ${item.trait.name || 'trait'}`"
										:aria-pressed="isTraitOut(item.trait, traitSet) ? 'true' : 'false'"
										@click.stop="!printBlank && !item.isPlaceholder ? handleOutClick(s, item.originalIndex) : null"
										@keydown.enter.prevent="!printBlank && !item.isPlaceholder ? handleOutClick(s, item.originalIndex) : null"
										@keydown.space.prevent="!printBlank && !item.isPlaceholder ? handleOutClick(s, item.originalIndex) : null"
										title="Out"
									>{{ getTraitSetLabel(traitSet, 'out') }}</span>
								</div>
							</div>

							<div
								class="trait-description"
								v-if="!isStatementSet(traitSet)"
							>
								<div v-if="!printBlank && !item.isPlaceholder && item.trait.description" v-html="renderText(item.trait.description)"></div>
								<div class="desc-hint" v-else-if="submode === 'edit'">Description...</div>
								<div class="desc-blank-area" v-else-if="printBlank || item.isPlaceholder">
									<div class="desc-blank-line"></div>
								</div>
								<div class="desc-blank-line" v-else></div>
							</div>
						</template>

						<ul class="subtraits" v-if="(visibleSubtraits(traitSet, item.trait).length || printBlank)">
							<li class="subtrait" v-for="(subtrait, u) in (visibleSubtraits(traitSet, item.trait).length ? visibleSubtraits(traitSet, item.trait) : (printBlank ? [{ name: '' }] : []))" :key="subtrait._lid || ('u' + u)" @click.stop="!printBlank ? handleSingleDieClick(subtrait, firstDie(subtrait), traitSet, s, item.originalIndex) : null">
								<span class="subtrait-name" v-if="subtrait.name">{{ subtrait.name }}</span>
								<span class="subtrait-name" v-else>
									<span class="trait-blank-line subtrait-blank-line"></span>
								</span>
								<div class="subtrait-value">
									<span
										v-for="size in getSubtraitRatings(traitSet)"
										:key="size"
										:class="{ 'c': true, 'active': !printBlank && isDieActive(subtrait, size) }"
										role="button"
										tabindex="0"
										:aria-label="`Stage d${size} from ${subtrait.name || 'subtrait'}`"
										:aria-pressed="isDieActive(subtrait, size) ? 'true' : 'false'"
										@keydown.enter.prevent="!printBlank ? handleSingleDieClick(subtrait, size, traitSet, s, item.originalIndex) : null"
										@keydown.space.prevent="!printBlank ? handleSingleDieClick(subtrait, size, traitSet, s, item.originalIndex) : null"
										v-html="renderDieValueForPrint(size, !printBlank && isDieActive(subtrait, size))"
									></span>
								</div>
							</li>
						</ul>


						<!-- ATTACHED TRACK -->
						<div class="attached-stress-block" v-if="hasTrackPart(traitSet)">
							<div class="attached-stress-divider"></div>
							<div class="attached-stress-header">
								<span class="attached-stress-label">{{ getTraitTrackLabel(traitSet, item.trait) }}</span>
							</div>
							<div class="attached-stress-track">
								<span
									v-for="size in getTrackScale(traitSet)"
									:key="size"
									:class="{
										'attached-stress-die': true,
										'c': true,
										'active': !printBlank && getTrackValue(item.trait, traitSet) === size
									}"
									role="button"
									tabindex="0"
									:aria-label="`Stage d${size} from ${getTraitTrackLabel(traitSet, item.trait) || 'track'}`"
									:aria-pressed="getTrackValue(item.trait, traitSet) === size ? 'true' : 'false'"
									@click.stop="!printBlank ? handleTrackClick(s, item.originalIndex, size) : null"
									@keydown.enter.prevent="!printBlank ? handleTrackClick(s, item.originalIndex, size) : null"
									@keydown.space.prevent="!printBlank ? handleTrackClick(s, item.originalIndex, size) : null"
									v-html="renderDieValueForPrint(size, !printBlank && getTrackValue(item.trait, traitSet) === size)"
								></span>
								<span
									v-if="shouldShowTrackOut(traitSet)"
									:class="{ 'stress-out-badge': true, 'active': !printBlank && isTrackOut(item.trait, traitSet) }"
									role="button"
									tabindex="0"
									:aria-label="`Out for ${getTraitTrackLabel(traitSet, item.trait) || 'track'}`"
									:aria-pressed="isTrackOut(item.trait, traitSet) ? 'true' : 'false'"
									@click.stop="!printBlank ? handleTrackOutClick(s, item.originalIndex) : null"
									@keydown.enter.prevent="!printBlank ? handleTrackOutClick(s, item.originalIndex) : null"
									@keydown.space.prevent="!printBlank ? handleTrackOutClick(s, item.originalIndex) : null"
									title="Out"
								>{{ getTraitSetLabel(traitSet, 'out') }}</span>
								<button
									v-if="submode === 'play' && !printBlank && !item.isPlaceholder && getTrackValue(item.trait, traitSet) > 0"
									type="button"
									class="btn-stage-stress"
									@click.stop="stageTrackDie(item.trait, getTrackValue(item.trait, traitSet), getTraitTrackLabel(traitSet, item.trait), traitSet)"
									title="Stage track die into pool"
									aria-label="Stage track die into pool"
								>+<i class="fas fa-dice" aria-hidden="true"></i></button>
							</div>
						</div>

						<ul class="trait-sfx" v-else-if="getDisplayTraitSfx(traitSet, item.trait).length">
							<li v-for="(sfx, sfIdx) in getDisplayTraitSfx(traitSet, item.trait)" :key="(sfx && sfx._lid) || ('sfx' + sfIdx)">
								<template v-if="sfx.isHinder">
									<span class="trait-sfx-name">Hinder</span>:
									<span class="trait-sfx-description"
										v-html="renderText(sfx.description)"
									></span>
								</template>
								<template v-else>
									<span class="trait-sfx-name" v-if="sfx.name">{{ sfx.name }}</span><span v-if="sfx.name && sfx.description">: </span>
									<span class="trait-sfx-description" v-if="sfx.description" v-html="renderText(sfx.description)"></span>
									<span class="sfx-blank-line" v-else-if="submode === 'print'"></span>
									<span class="sfx-placeholder-hint" v-else-if="submode === 'edit'">SFX...</span>
								</template>
							</li>
						</ul>
					</div>
				</transition>
			</div>
		</template>
		</template>
	</div>

	<!-- BUTTON: ADD TRAIT -->
	<transition appear>
		<div class="preview-button-container"
			v-show="resolvedFrame?.shape !== 'line' && (submode === 'edit' || (submode === 'play' && isPlayAddRemovableSet(traitSet)))"
		>
			<div class="preview-button-container-inner">
				<div class="preview-button"
					@click.stop="addTrait( s )"
				>
					<span><i class="fas fa-plus"></i> {{ ( traitSet.noun && traitSet.noun.length ) ? traitSet.noun : 'Trait' }}</span>
				</div>
			</div>
		</div>
	</transition>
</template>
