<script setup lang="ts">
import { getView } from './model.ts';
import { injectTraitSet } from './use-trait-set.ts';
import TraitSetPips from './trait-set-pips.vue';

const {
	traitSet, s, submode, printBlank, viewY, character,
	isSelected, selectElement, openTraitAt, updateCharacter, removeTrait, addTrait,
	getRenderedTraits, getTraitClasses, getTraitSetRatings, getSubtraitRatings,
	isSpotlightStyle, isSpotlightPrintStyle,
	renderDieValueForPrint, getRatingPosition, getTraitStatement, renderText, isStatementSet, isFixedSystemTrait,
	hasQuestionedPip, isTraitQuestioned, toggleTraitQuestioned, handleSingleDieClick, handleDieClick,
	handleStressClick, handleStressOutClick, shouldShowStressOut, shouldShowOut, isStressOut, isMultiDieTrait, getTraitDice,
	isDieSpent, toggleDieSpentInPlay, getSharedHinderLines, renderHinderLine, getDistinctionSfxText,
	hasAttachedStress, getAttachedStressLabel, getAttachedStressScale, getAttachedStressValue, visibleSubtraits,
	shouldShowAttachedStressOut, isAttachedStressOut, handleAttachedStressClick, handleAttachedStressOutClick,
	getDisplayTraitSfx, getHinderSentence, getTraitSetLabel, getParts, partsGridFor, partCellStyle, partsGridStyle, isPartsInline
} = injectTraitSet();
</script>

<template>
	<div class="trait-list" :class="[ getView(traitSet)?.style?.body === 'list' ? 'trait-list-unrated' : '', (Number(getView(traitSet)?.traitColumns) > 1 ? ('trait-list-cols-' + getView(traitSet)?.traitColumns) : '') ]">
		<!-- PIPS BODY (XP / TRACK) -->
		<TraitSetPips v-if="getView(traitSet)?.style?.body === 'pips'" />

		<template v-else>
		<!-- SHARED HINDER BANNER (COMPACT DISTINCTIONS) -->
		<div
			class="distinctions-shared-hinder"
			v-if="getView(traitSet)?.style?.body === 'distinctions' && getView(traitSet)?.sharedHinder"
		>
			<div v-for="(ruleLine, rIdx) in getSharedHinderLines(traitSet)" :key="rIdx" class="hinder-rule-line">
				<span class="hinder-bullet">•</span>
				<span class="hinder-text" v-html="renderHinderLine(ruleLine)"></span>
			</div>
		</div>

		<template v-for="(item, t) in getRenderedTraits(traitSet, s)" :key="item.trait._lid || ('t' + t)">
			<div :class="getTraitClasses(item.trait)">
				<transition name="trait" appear>
					<!-- PARTS GRID (explicit trait-part coordinates) -->
					<div v-if="partsGridFor(traitSet)" :class="{ 'trait-inner': true, 'trait-parts': true, 'trait-parts-inline': isPartsInline(traitSet), 'selected': !item.isPlaceholder && isSelected(['trait', s, item.originalIndex]), 'trait-placeholder-slot': item.isPlaceholder }"
						:style="partsGridStyle(partsGridFor(traitSet), !isStatementSet(traitSet))"
						tabindex="0"
						role="button"
						@keydown.enter.prevent="openTraitAt(s, item)"
						@keydown.space.prevent="openTraitAt(s, item)"
						@click.stop="openTraitAt(s, item)"
					>
						<!-- NAME (above: the asset box; the dice live in the rating cell) -->
						<div v-if="partsGridFor(traitSet).cells.name" class="trait-part trait-part-name" :class="{ 'trait-asset-card': getRatingPosition(traitSet) === 'above' }" :style="partCellStyle(partsGridFor(traitSet), 'name')">
							<div :class="{ 'trait-title': getRatingPosition(traitSet) !== 'above', 'trait-title-statement': isStatementSet(traitSet) && getRatingPosition(traitSet) !== 'above', 'trait-title-stacked': getRatingPosition(traitSet) === 'below', 'trait-asset-box': getRatingPosition(traitSet) === 'above' }">
								<span
									class="distinction-die"
									v-if="isSpotlightPrintStyle && getView(traitSet)?.style?.body === 'distinctions' && getTraitSetRatings(traitSet).length <= 1 && getRatingPosition(traitSet) !== 'none'"
									v-html="renderDieValueForPrint(item.trait.value || 8, !printBlank && !item.isPlaceholder && item.trait.value > 0)"
								></span>
								<template v-if="isStatementSet(traitSet) && getRatingPosition(traitSet) !== 'above'">
									<span class="trait-name" v-if="(!printBlank || isFixedSystemTrait(traitSet, item.trait)) && !item.isPlaceholder && item.trait.name">{{ item.trait.name }}</span>
									<span class="trait-name trait-name-blank" v-else-if="printBlank || item.isPlaceholder || !item.trait.name">
										<template v-if="isFixedSystemTrait(traitSet, item.trait) && !item.isPlaceholder">
											{{ item.trait.name }}
										</template>
										<template v-else-if="submode === 'edit' && !printBlank">
											<span class="trait-name-hint">{{ traitSet.nounSingular || 'Name' }}...</span>
										</template>
										<template v-else>
											<span class="trait-blank-line"></span>
										</template>
									</span>
									<span class="trait-name" v-else>{{ item.trait.name || '' }}</span>
									<span v-if="hasQuestionedPip(traitSet)" class="statement-pip" :class="{ 'questioned': isTraitQuestioned(item.trait) }" tabindex="0" role="button" @keydown.enter.prevent="toggleTraitQuestioned(s, item.originalIndex)" @keydown.space.prevent="toggleTraitQuestioned(s, item.originalIndex)" @click.stop="toggleTraitQuestioned(s, item.originalIndex)" :title="submode === 'play' ? (isTraitQuestioned(item.trait) ? 'Questioned (click to reset)' : 'Click to question') : ''"></span>
									<span class="trait-statement-box">
										<span class="trait-statement-text" v-if="!printBlank && !item.isPlaceholder && getTraitStatement(item.trait)" v-html="renderText(getTraitStatement(item.trait))"></span>
										<span class="trait-statement-blank" v-else-if="printBlank || item.isPlaceholder"></span>
										<span class="trait-statement-hint" v-else-if="submode === 'edit'">Statement...</span>
										<span class="trait-statement-blank" v-else></span>
									</span>
								</template>
								<template v-else-if="getRatingPosition(traitSet) === 'above'">
									<div class="trait-asset-name" v-if="!printBlank && !item.isPlaceholder && item.trait.name">{{ item.trait.name }}</div>
									<div class="trait-asset-desc" v-if="!printBlank && !item.isPlaceholder && getTraitStatement(item.trait)" v-html="renderText(getTraitStatement(item.trait))"></div>
									<div class="trait-asset-empty" v-else-if="printBlank || item.isPlaceholder"></div>
									<div class="trait-asset-hint" v-else-if="submode === 'edit'">Click to edit asset...</div>
									<div class="trait-asset-empty" v-else></div>
								</template>
								<template v-else>
									<span class="trait-name" v-if="(!printBlank || isFixedSystemTrait(traitSet, item.trait)) && !item.isPlaceholder && item.trait.name">{{ item.trait.name }}</span>
									<span class="trait-name trait-name-blank" v-else-if="printBlank || item.isPlaceholder || !item.trait.name">
										<template v-if="item.trait.name && item.trait.name.endsWith(':') && !item.isPlaceholder">
											{{ item.trait.name }} <span class="trait-blank-line"></span>
										</template>
										<template v-else-if="isFixedSystemTrait(traitSet, item.trait) && !item.isPlaceholder">
											{{ item.trait.name }}
										</template>
										<template v-else-if="submode === 'edit' && !printBlank">
											<span class="trait-name-hint">{{ traitSet.nounSingular || 'Name' }}...</span>
										</template>
										<template v-else>
											<span class="trait-blank-line"></span>
										</template>
									</span>
									<span class="trait-name" v-else>{{ item.trait.name || '' }}</span>
								</template>
							</div>
						</div>
						<!-- RATING -->
						<div v-if="partsGridFor(traitSet).cells.rating" class="trait-part trait-part-rating" :class="{ 'trait-asset-card': getRatingPosition(traitSet) === 'above', 'trait-title trait-title-stacked': getRatingPosition(traitSet) === 'below' }" :style="partCellStyle(partsGridFor(traitSet), 'rating')">
							<div class="trait-value stress-value" v-if="getView(traitSet)?.style?.body === 'stress'">
								<span
									v-for="size in getTraitSetRatings(traitSet)"
									:key="size"
									:class="{ 'c': true, 'active': !printBlank && !item.isPlaceholder && item.trait.value === size }"
									@click.stop="!printBlank && !item.isPlaceholder ? handleStressClick(s, item.originalIndex, size) : null"
									v-html="renderDieValueForPrint(size, !printBlank && !item.isPlaceholder && item.trait.value === size)"
								></span>
								<span v-if="shouldShowStressOut(traitSet)" :class="{ 'stress-out-badge': true, 'active': !printBlank && !item.isPlaceholder && isStressOut(item.trait) }" @click.stop="!printBlank && !item.isPlaceholder ? handleStressOutClick(s, item.originalIndex) : null" title="Out">{{ getTraitSetLabel(traitSet, 'out') }}</span>
							</div>
							<div class="trait-value" v-else-if="getView(traitSet)?.style?.body === 'list'"></div>
							<div class="trait-value" v-else-if="isSpotlightPrintStyle && getView(traitSet)?.style?.body === 'distinctions' && getTraitSetRatings(traitSet).length <= 1"></div>
							<div class="trait-value multidie-value" v-else-if="isMultiDieTrait(traitSet, item.trait)">
								<div
									v-for="(dieSize, dIdx) in (printBlank || item.isPlaceholder ? getTraitSetRatings(traitSet) : getTraitDice(item.trait))"
									:key="dIdx"
									class="multidie-badge-wrap"
									:class="{ 'spent': !printBlank && !item.isPlaceholder && isDieSpent(item.trait, dIdx) }"
								>
									<span
										:class="{ 'c active': !printBlank && !item.isPlaceholder }"
										@click.stop="!printBlank && !item.isPlaceholder ? handleDieClick(item.trait, dieSize, dIdx, traitSet, s, item.originalIndex) : null"
										:title="submode === 'play' && !printBlank && !item.isPlaceholder ? 'Click to add d' + dieSize + ' to roller pool' : ''"
										v-html="renderDieValueForPrint(dieSize, !printBlank && !item.isPlaceholder)"
									></span>
									<div class="die-play-controls" v-if="submode === 'play' && !printBlank && !item.isPlaceholder">
										<button type="button" class="btn-play-spend" @click.stop="toggleDieSpentInPlay(s, item.originalIndex, dIdx)" :title="isDieSpent(item.trait, dIdx) ? 'Restore die' : 'Spend die'">
											<i :class="isDieSpent(item.trait, dIdx) ? 'fas fa-rotate-left' : 'fas fa-xmark'"></i>
										</button>
									</div>
								</div>
							</div>
							<div class="trait-value single-die-value" v-else>
								<span
									v-for="size in getTraitSetRatings(traitSet)"
									:key="size"
									:class="{ 'c': true, 'active': !printBlank && !item.isPlaceholder && item.trait.value === size }"
									@click.stop="!printBlank && !item.isPlaceholder ? handleSingleDieClick(item.trait, size, traitSet, s, item.originalIndex) : null"
									v-html="renderDieValueForPrint(size, !printBlank && !item.isPlaceholder && item.trait.value === size)"
								></span>
								<span v-if="shouldShowOut(traitSet)" :class="{ 'stress-out-badge': true, 'active': !printBlank && !item.isPlaceholder && isStressOut(item.trait) }" @click.stop="!printBlank && !item.isPlaceholder ? handleStressOutClick(s, item.originalIndex) : null" title="Out">{{ getTraitSetLabel(traitSet, 'out') }}</span>
							</div>
						</div>
						<!-- STRESS LABEL -->
						<div v-if="partsGridFor(traitSet).cells.stressLabel" class="trait-part trait-part-stress-label" :style="partCellStyle(partsGridFor(traitSet), 'stressLabel')">
							<div class="attached-stress-divider" v-if="!isPartsInline(traitSet)"></div>
							<span class="attached-stress-label">{{ getAttachedStressLabel(traitSet) }}</span>
						</div>
						<!-- STRESS TRACK -->
						<div v-if="partsGridFor(traitSet).cells.stress" class="trait-part trait-part-stress" :style="partCellStyle(partsGridFor(traitSet), 'stress')">
							<div class="attached-stress-track">
								<span
									v-for="size in getAttachedStressScale(traitSet)"
									:key="size"
									:class="{
										'attached-stress-die': true,
										'c': true,
										'active': !printBlank && getAttachedStressValue(item.trait, traitSet) === size
									}"
									@click.stop="!printBlank ? handleAttachedStressClick(s, item.originalIndex, size) : null"
									v-html="renderDieValueForPrint(size, !printBlank && getAttachedStressValue(item.trait, traitSet) === size)"
								></span>
								<span
									v-if="shouldShowAttachedStressOut(traitSet)"
									:class="{ 'stress-out-badge': true, 'active': !printBlank && isAttachedStressOut(item.trait, traitSet) }"
									@click.stop="!printBlank ? handleAttachedStressOutClick(s, item.originalIndex) : null"
									title="Out"
								>{{ getTraitSetLabel(traitSet, 'out') }}</span>
							</div>
						</div>
						<!-- DESCRIPTION -->
						<div v-if="partsGridFor(traitSet).cells.description" class="trait-part trait-part-description" :style="partCellStyle(partsGridFor(traitSet), 'description')">
							<div class="trait-description">
								<div v-if="!printBlank && !item.isPlaceholder && item.trait.description" v-html="renderText(item.trait.description)"></div>
								<div class="desc-hint" v-else-if="submode === 'edit'">Description...</div>
								<div class="desc-blank-area" v-else-if="printBlank || item.isPlaceholder">
									<div class="desc-blank-line"></div>
								</div>
								<div class="desc-blank-line" v-else></div>
							</div>
						</div>
						<!-- SFX -->
						<div v-if="partsGridFor(traitSet).cells.sfx && !getView(traitSet)?.sharedHinder && getView(traitSet)?.features?.sfx && getDisplayTraitSfx(traitSet, item.trait).length" class="trait-part trait-part-sfx" :style="partCellStyle(partsGridFor(traitSet), 'sfx')">
							<ul class="trait-sfx">
								<li v-for="(sfx, sfIdx) in getDisplayTraitSfx(traitSet, item.trait)" :key="(sfx && sfx._lid) || ('sfx' + sfIdx)">
									<template v-if="sfx.isHinder">
										<span class="trait-sfx-name">Hinder</span>:
										<span class="trait-sfx-description"
											v-html="renderText(sfx.description)"
										></span>
									</template>
									<template v-else-if="typeof sfx === 'string'">
										<span class="trait-sfx-name">{{ sfx }}</span>
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
						<div v-if="partsGridFor(traitSet).cells.subtraits" class="trait-part trait-part-subtraits" :style="partCellStyle(partsGridFor(traitSet), 'subtraits')">
							<ul class="subtraits" v-if="getView(traitSet)?.features?.subtraits && (visibleSubtraits(traitSet, item.trait).length || printBlank)">
								<li class="subtrait" v-for="(subtrait, u) in (visibleSubtraits(traitSet, item.trait).length ? visibleSubtraits(traitSet, item.trait) : (printBlank ? [{ name: '', value: 0 }] : []))" :key="subtrait._lid || ('u' + u)" @click.stop="!printBlank ? handleSingleDieClick(subtrait, subtrait.value, traitSet, s, item.originalIndex) : null">
									<span class="subtrait-name" v-if="subtrait.name">{{ subtrait.name }}</span>
									<span class="subtrait-name" v-else>
										<span class="trait-blank-line subtrait-blank-line"></span>
									</span>
									<div class="subtrait-value">
										<span
											v-for="size in getSubtraitRatings(traitSet)"
											:key="size"
											:class="{ 'c': true, 'active': !printBlank && subtrait.value === size }"
											v-html="renderDieValueForPrint(size, !printBlank && subtrait.value === size)"
										></span>
									</div>
								</li>
							</ul>
						</div>
						<!-- COMPACT SFX SLOT FOR DISTINCTIONS WITH SHARED HINDER -->
						<div class="distinction-sfx-slot" style="grid-column: 1 / -1;" v-if="getView(traitSet)?.style?.body === 'distinctions' && getView(traitSet)?.sharedHinder && getView(traitSet)?.features?.sfx !== false">
							<div class="distinction-sfx-badge">{{ getTraitSetLabel(traitSet, 'sfxBadge') }}</div>
							<div class="distinction-sfx-line">
								<span class="sfx-bullet">•</span>
								<span class="sfx-prefix">{{ getTraitSetLabel(traitSet, 'sfxPrefix') }}</span>
								<span class="sfx-content" v-if="getDistinctionSfxText(item.trait)" v-html="renderText(getDistinctionSfxText(item.trait))"></span>
								<span class="sfx-blank-line" v-else-if="printBlank"></span>
								<span class="sfx-placeholder-hint" v-else-if="submode === 'edit'" @click.stop="openTraitAt(s, item)">Click to set SFX...</span>
								<span class="sfx-blank-line" v-else></span>
							</div>
						</div>
					</div>
					<div v-else :class="{ 'trait-inner': true, 'selected': !item.isPlaceholder && isSelected(['trait', s, item.originalIndex]), 'trait-placeholder-slot': item.isPlaceholder }"
						tabindex="0"
						role="button"
						@keydown.enter.prevent="openTraitAt(s, item)"
						@keydown.space.prevent="openTraitAt(s, item)"
						@click.stop="openTraitAt(s, item)"
					>
						<!-- RATING POSITION ABOVE (e.g. Signature Assets) -->
						<template v-if="getRatingPosition(traitSet) === 'above'">
							<div class="trait-asset-card">
								<div class="trait-value single-die-value">
									<span
										v-for="size in getTraitSetRatings(traitSet)"
										:key="size"
										:class="{ 'c': true, 'active': !printBlank && !item.isPlaceholder && item.trait.value === size }"
										@click.stop="!printBlank && !item.isPlaceholder ? handleSingleDieClick(item.trait, size, traitSet, s, item.originalIndex) : null"
										v-html="renderDieValueForPrint(size, !printBlank && !item.isPlaceholder && item.trait.value === size)"
									></span>
								</div>
								<div class="trait-asset-box">
									<div class="trait-asset-name" v-if="!printBlank && !item.isPlaceholder && item.trait.name">{{ item.trait.name }}</div>
									<div class="trait-asset-desc" v-if="!printBlank && !item.isPlaceholder && getTraitStatement(item.trait)" v-html="renderText(getTraitStatement(item.trait))"></div>
									<div class="trait-asset-empty" v-else-if="printBlank || item.isPlaceholder"></div>
									<div class="trait-asset-hint" v-else-if="submode === 'edit'">Click to edit asset...</div>
									<div class="trait-asset-empty" v-else></div>
								</div>
							</div>
						</template>

						<!-- STANDARD OR OTHER RATING POSITIONS (INLINE, BELOW, NONE) -->
						<template v-else>
							<h2 class="trait-title" :class="{ 'trait-title-statement': isStatementSet(traitSet), 'trait-title-stacked': getRatingPosition(traitSet) === 'below' }">
								<span class="list-bullet" v-if="getView(traitSet)?.style?.body === 'list'">•</span>
								<span
									class="distinction-die"
									v-if="isSpotlightPrintStyle && getView(traitSet)?.style?.body === 'distinctions' && getTraitSetRatings(traitSet).length <= 1 && getRatingPosition(traitSet) !== 'none'"
									v-html="renderDieValueForPrint(item.trait.value || 8, !printBlank && !item.isPlaceholder && item.trait.value > 0)"
								></span>

								<!-- STATEMENT MODE (e.g. Values) -->
								<template v-if="isStatementSet(traitSet)">
									<span class="trait-name" v-if="(!printBlank || isFixedSystemTrait(traitSet, item.trait)) && !item.isPlaceholder && item.trait.name">{{ item.trait.name }}</span>
									<span class="trait-name trait-name-blank" v-else-if="printBlank || item.isPlaceholder || !item.trait.name">
										<template v-if="isFixedSystemTrait(traitSet, item.trait) && !item.isPlaceholder">
											{{ item.trait.name }}
										</template>
										<template v-else-if="submode === 'edit' && !printBlank">
											<span class="trait-name-hint">{{ traitSet.nounSingular || 'Name' }}...</span>
										</template>
										<template v-else>
											<span class="trait-blank-line"></span>
										</template>
									</span>
									<span class="trait-name" v-else>{{ item.trait.name || '' }}</span>
									<span v-if="hasQuestionedPip(traitSet)" class="statement-pip" :class="{ 'questioned': isTraitQuestioned(item.trait) }" tabindex="0" role="button" @keydown.enter.prevent="toggleTraitQuestioned(s, item.originalIndex)" @keydown.space.prevent="toggleTraitQuestioned(s, item.originalIndex)" @click.stop="toggleTraitQuestioned(s, item.originalIndex)" :title="submode === 'play' ? (isTraitQuestioned(item.trait) ? 'Questioned (click to reset)' : 'Click to question') : ''"></span>
									<span class="trait-statement-box">
										<span class="trait-statement-text" v-if="!printBlank && !item.isPlaceholder && getTraitStatement(item.trait)" v-html="renderText(getTraitStatement(item.trait))"></span>
										<span class="trait-statement-blank" v-else-if="printBlank || item.isPlaceholder"></span>
										<span class="trait-statement-hint" v-else-if="submode === 'edit'">Statement...</span>
										<span class="trait-statement-blank" v-else></span>
									</span>
								</template>

								<!-- NORMAL TRAIT NAME -->
								<template v-else>
									<span class="trait-name" v-if="(!printBlank || isFixedSystemTrait(traitSet, item.trait)) && !item.isPlaceholder && item.trait.name">{{ item.trait.name }}</span>
									<span class="trait-name trait-name-blank" v-else-if="printBlank || item.isPlaceholder || !item.trait.name">
										<template v-if="item.trait.name && item.trait.name.endsWith(':') && !item.isPlaceholder">
											{{ item.trait.name }} <span class="trait-blank-line"></span>
										</template>
										<template v-else-if="isFixedSystemTrait(traitSet, item.trait) && !item.isPlaceholder">
											{{ item.trait.name }}
										</template>
										<template v-else-if="submode === 'edit' && !printBlank">
											<span class="trait-name-hint">{{ traitSet.nounSingular || 'Name' }}...</span>
										</template>
										<template v-else>
											<span class="trait-blank-line"></span>
										</template>
									</span>
									<span class="trait-name" v-else>{{ item.trait.name || '' }}</span>
								</template>

								<!-- STRESS VALUE TRACK -->
								<div class="trait-value stress-value" v-if="getView(traitSet)?.style?.body === 'stress'">
									<span
										v-for="size in getTraitSetRatings(traitSet)"
										:key="size"
										:class="{ 'c': true, 'active': !printBlank && !item.isPlaceholder && item.trait.value === size }"
										@click.stop="!printBlank && !item.isPlaceholder ? handleStressClick(s, item.originalIndex, size) : null"
										v-html="renderDieValueForPrint(size, !printBlank && !item.isPlaceholder && item.trait.value === size)"
									></span>
									<span v-if="shouldShowStressOut(traitSet)" :class="{ 'stress-out-badge': true, 'active': !printBlank && !item.isPlaceholder && isStressOut(item.trait) }" @click.stop="!printBlank && !item.isPlaceholder ? handleStressOutClick(s, item.originalIndex) : null" title="Out">{{ getTraitSetLabel(traitSet, 'out') }}</span>
								</div>

								<!-- LIST STYLE: NO VALUE -->
								<div class="trait-value" v-else-if="getView(traitSet)?.style?.body === 'list'"></div>

								<!-- DISTINCTIONS STYLE IN SPOTLIGHT: VALUE IS IN TITLE ONLY IF SINGLE FIXED RATING (EXCEPT ON BLANK PRINT SHEET WHERE FILLABLE DICE ARRAY IS EXPECTED) -->
								<div class="trait-value" v-else-if="isSpotlightPrintStyle && getView(traitSet)?.style?.body === 'distinctions' && getTraitSetRatings(traitSet).length <= 1"></div>

								<!-- NONE RATING POSITION: NO VALUE -->
								<div class="trait-value" v-else-if="!printBlank && getRatingPosition(traitSet) === 'none'"></div>

								<!-- MULTI-DIE TRAIT -->
								<div class="trait-value multidie-value" v-else-if="isMultiDieTrait(traitSet, item.trait)">
									<div
										v-for="(dieSize, dIdx) in (printBlank || item.isPlaceholder ? getTraitSetRatings(traitSet) : getTraitDice(item.trait))"
										:key="dIdx"
										class="multidie-badge-wrap"
										:class="{ 'spent': !printBlank && !item.isPlaceholder && isDieSpent(item.trait, dIdx) }"
									>
										<span
											:class="{ 'c active': !printBlank && !item.isPlaceholder }"
											@click.stop="!printBlank && !item.isPlaceholder ? handleDieClick(item.trait, dieSize, dIdx, traitSet, s, item.originalIndex) : null"
											:title="submode === 'play' && !printBlank && !item.isPlaceholder ? 'Click to add d' + dieSize + ' to roller pool' : ''"
											v-html="renderDieValueForPrint(dieSize, !printBlank && !item.isPlaceholder)"
										></span>
										<div class="die-play-controls" v-if="submode === 'play' && !printBlank && !item.isPlaceholder">
											<button type="button" class="btn-play-spend" @click.stop="toggleDieSpentInPlay(s, item.originalIndex, dIdx)" :title="isDieSpent(item.trait, dIdx) ? 'Restore die' : 'Spend die'">
												<i :class="isDieSpent(item.trait, dIdx) ? 'fas fa-rotate-left' : 'fas fa-xmark'"></i>
											</button>
										</div>
									</div>
								</div>

								<!-- STANDARD SINGLE-DIE TRAIT -->
								<div class="trait-value single-die-value" v-else>
									<span
										v-for="size in getTraitSetRatings(traitSet)"
										:key="size"
										:class="{ 'c': true, 'active': !printBlank && !item.isPlaceholder && item.trait.value === size }"
										@click.stop="!printBlank && !item.isPlaceholder ? handleSingleDieClick(item.trait, size, traitSet, s, item.originalIndex) : null"
										v-html="renderDieValueForPrint(size, !printBlank && !item.isPlaceholder && item.trait.value === size)"
									></span>
									<span v-if="shouldShowOut(traitSet)" :class="{ 'stress-out-badge': true, 'active': !printBlank && !item.isPlaceholder && isStressOut(item.trait) }" @click.stop="!printBlank && !item.isPlaceholder ? handleStressOutClick(s, item.originalIndex) : null" title="Out">{{ getTraitSetLabel(traitSet, 'out') }}</span>
								</div>
							</h2>

							<div
								class="trait-description"
								v-if="getView(traitSet)?.features?.description && !isStatementSet(traitSet)"
							>
								<div v-if="!printBlank && !item.isPlaceholder && item.trait.description" v-html="renderText(item.trait.description)"></div>
								<div class="desc-hint" v-else-if="submode === 'edit'">Description...</div>
								<div class="desc-blank-area" v-else-if="printBlank || item.isPlaceholder">
									<div class="desc-blank-line"></div>
								</div>
								<div class="desc-blank-line" v-else></div>
							</div>
						</template>

						<ul class="subtraits" v-if="getView(traitSet)?.features?.subtraits && (visibleSubtraits(traitSet, item.trait).length || printBlank)">
							<li class="subtrait" v-for="(subtrait, u) in (visibleSubtraits(traitSet, item.trait).length ? visibleSubtraits(traitSet, item.trait) : (printBlank ? [{ name: '', value: 0 }] : []))" :key="subtrait._lid || ('u' + u)" @click.stop="!printBlank ? handleSingleDieClick(subtrait, subtrait.value, traitSet, s, item.originalIndex) : null">
								<span class="subtrait-name" v-if="subtrait.name">{{ subtrait.name }}</span>
								<span class="subtrait-name" v-else>
									<span class="trait-blank-line subtrait-blank-line"></span>
								</span>
								<div class="subtrait-value">
									<span
										v-for="size in getSubtraitRatings(traitSet)"
										:key="size"
										:class="{ 'c': true, 'active': !printBlank && subtrait.value === size }"
										v-html="renderDieValueForPrint(size, !printBlank && subtrait.value === size)"
									></span>
								</div>
							</li>
						</ul>

						<!-- COMPACT SFX SLOT FOR DISTINCTIONS WITH SHARED HINDER -->
						<div class="distinction-sfx-slot" v-if="getView(traitSet)?.style?.body === 'distinctions' && getView(traitSet)?.sharedHinder && getView(traitSet)?.features?.sfx !== false">
							<div class="distinction-sfx-badge">{{ getTraitSetLabel(traitSet, 'sfxBadge') }}</div>
							<div class="distinction-sfx-line">
								<span class="sfx-bullet">•</span>
								<span class="sfx-prefix">{{ getTraitSetLabel(traitSet, 'sfxPrefix') }}</span>
								<span class="sfx-content" v-if="getDistinctionSfxText(item.trait)" v-html="renderText(getDistinctionSfxText(item.trait))"></span>
								<span class="sfx-blank-line" v-else-if="printBlank"></span>
								<span class="sfx-placeholder-hint" v-else-if="submode === 'edit'" @click.stop="openTraitAt(s, item)">Click to set SFX...</span>
								<span class="sfx-blank-line" v-else></span>
							</div>
						</div>

						<!-- ATTACHED STRESS / TRACK -->
						<div class="attached-stress-block" v-if="hasAttachedStress(traitSet)">
							<div class="attached-stress-divider"></div>
							<div class="attached-stress-header">
								<span class="attached-stress-label">{{ getAttachedStressLabel(traitSet) }}</span>
							</div>
							<div class="attached-stress-track">
								<span
									v-for="size in getAttachedStressScale(traitSet)"
									:key="size"
									:class="{
										'attached-stress-die': true,
										'c': true,
										'active': !printBlank && getAttachedStressValue(item.trait, traitSet) === size
									}"
									@click.stop="!printBlank ? handleAttachedStressClick(s, item.originalIndex, size) : null"
									v-html="renderDieValueForPrint(size, !printBlank && getAttachedStressValue(item.trait, traitSet) === size)"
								></span>
								<span
									v-if="shouldShowAttachedStressOut(traitSet)"
									:class="{ 'stress-out-badge': true, 'active': !printBlank && isAttachedStressOut(item.trait, traitSet) }"
									@click.stop="!printBlank ? handleAttachedStressOutClick(s, item.originalIndex) : null"
									title="Out"
								>{{ getTraitSetLabel(traitSet, 'out') }}</span>
							</div>
						</div>

						<ul class="trait-sfx" v-else-if="!getView(traitSet)?.sharedHinder && getView(traitSet)?.features?.sfx && getDisplayTraitSfx(traitSet, item.trait).length">
							<li v-for="(sfx, sfIdx) in getDisplayTraitSfx(traitSet, item.trait)" :key="(sfx && sfx._lid) || ('sfx' + sfIdx)">
								<template v-if="sfx.isHinder">
									<span class="trait-sfx-name">Hinder</span>:
									<span class="trait-sfx-description"
										v-html="renderText(sfx.description)"
									></span>
								</template>
								<template v-else-if="typeof sfx === 'string'">
									<span class="trait-sfx-name">{{ sfx }}</span>
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

		<!-- BUTTON: ADD TRAIT -->
		<transition appear>
			<div class="preview-button-container"
				v-show="submode === 'edit'"
			>
				<div class="preview-button-container-inner">
					<div class="preview-button"
						@click.stop="addTrait( s )"
					>
						<span><i class="fas fa-plus"></i> {{ ( traitSet.nounSingular && traitSet.nounSingular.length ) ? traitSet.nounSingular : 'Trait' }}</span>
					</div>
				</div>
			</div>
		</transition>
	</div>
</template>
