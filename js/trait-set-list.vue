<script setup lang="ts">
import { nextTick } from 'vue';
import { getView, resolveSubtraitNoun } from './model.ts';
import { characterCurioFunctions } from './functions.ts';
import { useCuriosityGraph } from './curiosity-graph.ts';
import { injectTraitSet } from './use-trait-set.ts';
import TraitSetPips from './trait-set-pips.vue';
import InlineRatingBar from './inline-rating-bar.vue';

const props = withDefaults(defineProps<{ hideSetActions?: boolean }>(), {
	hideSetActions: false,
});

const {
	traitSet,
	s,
	submode,
	printBlank,
	viewY,
	character,
	isSelected,
	selectElement,
	openTraitAt,
	updateCharacter,
	removeTrait,
	addTrait,
	getRenderedTraits,
	getTraitClasses,
	getTraitSetRatings,
	getSubtraitRatings,
	renderDieValueForPrint,
	getRatingPlacement,
	getRatingDisplay,
	renderText,
	renderNotesText,
	isFixedSystemTrait,
	getPipChild,
	isChildPipFilled,
	togglePip,
	canEditChildOnSheet,
	setPipChildName,
	handleSingleDieClick,
	handleDieClick,
	handleSteppedDieClick,
	handleOutClick,
	shouldShowOut,
	isTraitOut,
	getTraitDice,
	getRating,
	resolveTraitRating,
	isDieSpent,
	toggleDieSpentInPlay,
	isSpendable,
	firstDie,
	isDieActive,
	isTraitRated,
	hasTrackPart,
	getTrackLabel,
	getTraitTrackLabel,
	getTrackScale,
	getTrackValue,
	visibleSubtraits,
	getSetRatingDie,
	shouldShowTrackOut,
	isTrackOut,
	handleTrackClick,
	handleTrackOutClick,
	getTraitSetLabel,
	getParts,
	partsGridFor,
	partCellStyle,
	partsGridStyle,
	isPartsInline,
	getTraitPipBubbles,
	toggleTraitPipBubble,
	getDynamicChildParts,
	parseChildPartKey,
	isPipChildPart,
	hasChildPartCell,
	getChildTraitByNoun,
	isPlayMutableSet,
	getAltRoll,
	handleAltRollClick,
	stageTrackDie,
	stepTraitCounter,
	isCanvasTraitActive,
	toggleCanvasTrait,
	closeCanvasTrait,
	isInlineTrackLabelOpen,
	openInlineTrackLabel,
	setTraitTrackLabel,
	finalizeTraitTrackLabel,
	isPoolAddOpen,
	togglePoolAdd,
	canMutatePoolOnCanvas,
	getPoolAddRange,
	addDieToPoolTrait,
	removeDieFromPoolTrait,
	isTraitPartMenuOpen,
	toggleTraitPartMenu,
	isTraitDescInlineOpen,
	hasTraitPartActive,
	toggleTraitPart,
	resolvedBorder,
	traitArrayMode,
	showPortraitHub,
} = injectTraitSet();

const graph = useCuriosityGraph(
	() => character.value,
	(ch) => updateCharacter(ch),
);

function resolveTraitRefTitle(tr: any): string {
	return graph.resolveCuriosity(tr?.ref)?.name || tr?.name || 'Curiosity';
}

function formatAltRollPpTag(ppDelta: number | undefined | null): string {
	if (!ppDelta) return '';
	if (ppDelta === 1) return '+PP';
	if (ppDelta === -1) return '-PP';
	return (ppDelta > 0 ? '+' : '') + ppDelta + 'PP';
}

function formatAltRollAriaLabel(tr: any, ts: any): string {
	const alt = getAltRoll(tr, ts);
	const die = alt?.die || 4;
	const tag = formatAltRollPpTag(alt?.ppDelta);
	return tag ? `Take d${die} ${tag}` : `Take d${die}`;
}

function startInlineTrackLabel(tIdx: number | null | undefined, ev: Event) {
	openInlineTrackLabel(tIdx);
	const parent = (ev.currentTarget as HTMLElement | null)?.parentElement;
	nextTick(() => {
		const input = parent?.querySelector<HTMLInputElement>('input.track-label-inline-input');
		input?.focus();
		input?.select();
	});
}

const TRAIT_QUICK_PARTS: ReadonlyArray<{
	key: 'description' | 'subtraits' | 'block' | 'track' | 'badge';
	label: string;
}> = [
	{ key: 'description', label: 'Description' },
	{ key: 'subtraits', label: 'Subtrait' },
	{ key: 'block', label: 'SFX' },
	{ key: 'track', label: 'Track' },
	{ key: 'badge', label: 'Badge' },
];

function onTraitNameInlineInput(trait: any, event: Event) {
	if (!trait) return;
	trait.name = (event.target as HTMLInputElement).value;
	updateCharacter(character.value);
}

function onTraitDescInlineInput(trait: any, event: Event) {
	if (!trait) return;
	trait.description = (event.target as HTMLInputElement).value;
	updateCharacter(character.value);
}

function onSubtraitNameInlineInput(subtrait: any, event: Event) {
	if (!subtrait) return;
	subtrait.name = (event.target as HTMLInputElement).value;
	updateCharacter(character.value);
}

function onSfxFieldInlineInput(sfx: any, field: 'name' | 'description', event: Event) {
	if (!sfx) return;
	sfx[field] = (event.target as HTMLInputElement).value;
	updateCharacter(character.value);
}

function onTraitNameInlineEnter(event: KeyboardEvent) {
	if (event.isComposing || event.keyCode === 229) return;
	(event.target as HTMLElement | null)?.blur?.();
}

function pipPlaceholder(trait: any): string {
	const child = getPipChild(trait);
	const noun = child ? resolveSubtraitNoun(child, traitSet.value) : 'Detail';
	return `${noun || 'Detail'}...`;
}

function hasTraitSetDescription(ts: any) {
	const list = Array.isArray(ts?.traits) ? ts.traits : [];
	return list.some((t: any) => typeof t?.description === 'string' && t.description.trim().length > 0);
}
</script>

<template>
	<div
		class="trait-list"
		:class="[
			getView(traitSet)?.style?.body === 'list' ? 'trait-list-unrated' : '',
			Number(getView(traitSet)?.traitColumns) > 1 ? 'trait-list-cols-' + getView(traitSet)?.traitColumns : '',
		]"
	>
		<!-- PIPS BODY (XP / TRACK) -->
		<TraitSetPips v-if="getView(traitSet)?.style?.body === 'pips'" />

		<template v-else>
			<template v-for="(item, t) in getRenderedTraits(traitSet, s)" :key="item.trait._lid || 't' + t">
				<div
					:class="getTraitClasses(item.trait)"
					:data-trait-name="item.trait.name || undefined"
					:data-trait-rating="firstDie(item.trait) ? 'd' + firstDie(item.trait) : undefined"
					:data-trait-out="isTraitOut(item.trait, traitSet) ? 'true' : undefined"
					:data-trait-questioned="isChildPipFilled(item.trait) ? 'true' : undefined"
				>
					<transition name="trait" appear>
						<!-- PARTS GRID (explicit trait-part coordinates) -->
						<div
							v-if="partsGridFor(traitSet)"
							:class="{
								'trait-inner': true,
								'trait-parts': true,
								'trait-parts-inline': isPartsInline(traitSet),
								selected: !item.isPlaceholder && isSelected(['trait', s, item.originalIndex]),
								'trait-placeholder-slot': item.isPlaceholder,
							}"
							:style="partsGridStyle(partsGridFor(traitSet), !getPipChild(item.trait))"
						>
							<!-- NAME (above: the asset box; the dice live in the rating cell) -->
							<div
								v-if="partsGridFor(traitSet)?.cells.name"
								class="trait-part trait-part-name"
								:class="{ 'trait-asset-card': getRatingPlacement(traitSet) === 'above' }"
								:style="partCellStyle(partsGridFor(traitSet), 'name')"
							>
								<div
									:class="{
										'trait-title': getRatingPlacement(traitSet) !== 'above',
										'trait-title-pip':
											Boolean(getPipChild(item.trait)) &&
											getRatingPlacement(traitSet) !== 'above' &&
											!hasChildPartCell(traitSet, 'pip', 'label'),
										'trait-title-stacked': getRatingPlacement(traitSet) === 'below',
										'trait-asset-box': getRatingPlacement(traitSet) === 'above',
									}"
								>
									<template v-if="Boolean(getPipChild(item.trait)) && getRatingPlacement(traitSet) !== 'above'">
										<button
											type="button"
											class="trait-title-btn"
											:aria-label="
												!item.isPlaceholder && item.trait.name
													? item.trait.name + (submode === 'play' ? ' options' : ' edit')
													: (traitSet.noun || 'Name') + ' edit'
											"
											@click.stop="openTraitAt(s, item)"
										>
											<span
												class="trait-name"
												v-if="
													(!printBlank || isFixedSystemTrait(traitSet, item.trait)) &&
													!item.isPlaceholder &&
													item.trait.name
												"
												>{{ item.trait.name }}</span
											>
											<span
												class="trait-name trait-name-blank"
												v-else-if="printBlank || item.isPlaceholder || !item.trait.name"
											>
												<template v-if="isFixedSystemTrait(traitSet, item.trait) && !item.isPlaceholder">
													{{ item.trait.name }}
												</template>
												<template v-else-if="(submode === 'edit' || isPlayMutableSet(traitSet)) && !printBlank">
													<span class="trait-name-hint">{{ traitSet.noun || 'Name' }}...</span>
												</template>
												<template v-else>
													<span class="trait-blank-line"></span>
												</template>
											</span>
											<span class="trait-name" v-else>{{ item.trait.name || '' }}</span>
										</button>
										<span
											v-if="getPipChild(item.trait) && !hasChildPartCell(traitSet, 'pip', 'rating')"
											class="pip"
											:class="{ questioned: !printBlank && isChildPipFilled(item.trait) }"
											role="checkbox"
											tabindex="0"
											:aria-checked="isChildPipFilled(item.trait) ? 'true' : 'false'"
											:aria-label="`Toggle ${resolveSubtraitNoun(getPipChild(item.trait), traitSet).toLowerCase()} for ${item.trait.name || 'trait'}`"
											@keydown.enter.prevent="togglePip(s, item.originalIndex)"
											@keydown.space.prevent="togglePip(s, item.originalIndex)"
											@click.stop="togglePip(s, item.originalIndex)"
											:title="
												submode === 'play'
													? isChildPipFilled(item.trait)
														? 'Questioned (click to reset)'
														: 'Click to question'
													: ''
											"
										></span>
										<span v-if="getView(traitSet)?.pipSeparator" class="trait-pip-separator">{{
											getView(traitSet)?.pipSeparator
										}}</span>
										<span
											v-if="!hasChildPartCell(traitSet, 'pip', 'label')"
											class="trait-pip-box"
											@click.stop="openTraitAt(s, item)"
										>
											<input
												v-if="!printBlank && !item.isPlaceholder && canEditChildOnSheet(item.trait, traitSet)"
												type="text"
												class="trait-pip-input"
												:value="getPipChild(item.trait)?.name || item.trait?.description || ''"
												@input="setPipChildName(item.trait, ($event.target as HTMLInputElement).value)"
												@click.stop="openTraitAt(s, item)"
												:placeholder="pipPlaceholder(item.trait)"
											/>
											<span
												class="trait-pip-text"
												v-else-if="!printBlank && !item.isPlaceholder && getPipChild(item.trait)?.name"
												v-html="renderText(getPipChild(item.trait)?.name ?? '')"
											></span>
											<span class="trait-pip-blank" v-else-if="printBlank || item.isPlaceholder"></span>
											<span class="trait-pip-hint" v-else-if="submode === 'edit'">{{
												pipPlaceholder(item.trait)
											}}</span>
											<span class="trait-pip-blank" v-else></span>
										</span>
									</template>
									<template v-else-if="getRatingPlacement(traitSet) === 'above'">
										<button
											type="button"
											class="trait-title-btn trait-asset-box"
											:aria-label="
												!item.isPlaceholder && item.trait.name
													? item.trait.name + (submode === 'play' ? ' options' : ' edit')
													: 'Edit asset'
											"
											@click.stop="openTraitAt(s, item)"
										>
											<div class="trait-asset-name" v-if="!printBlank && !item.isPlaceholder && item.trait.name">
												{{ item.trait.name }}
											</div>
											<div
												class="trait-asset-desc"
												v-if="
													!printBlank &&
													!item.isPlaceholder &&
													(getPipChild(item.trait)?.name || item.trait.description)
												"
												v-html="renderText(getPipChild(item.trait)?.name || item.trait.description || '')"
											></div>
											<div class="trait-asset-empty" v-else-if="printBlank || item.isPlaceholder"></div>
											<div class="trait-asset-hint" v-else-if="submode === 'edit'">Click to edit asset...</div>
											<div class="trait-asset-empty" v-else></div>
										</button>
									</template>
									<template v-else>
										<div
											v-if="
												(submode === 'edit' || isPlayMutableSet(traitSet)) &&
												!printBlank &&
												!item.isPlaceholder &&
												isCanvasTraitActive(s, item.originalIndex)
											"
											class="trait-name-inline-wrap"
											@click.stop
										>
											<input
												type="text"
												class="trait-name-inline-input"
												:value="item.trait.name"
												:placeholder="(traitSet.noun || 'Trait') + ' name'"
												:aria-label="(traitSet.noun || 'Trait') + ' name'"
												@click.stop
												@input="onTraitNameInlineInput(item.trait, $event)"
												@keydown.enter="onTraitNameInlineEnter"
												@keydown.escape.stop.prevent="closeCanvasTrait()"
												@blur="submode === 'play' ? closeCanvasTrait() : null"
											/>
											<button
												v-if="submode === 'play'"
												type="button"
												class="btn-inline-rating-icon"
												title="Trait options"
												aria-label="Trait options"
												@mousedown.prevent
												@click.stop="
													closeCanvasTrait();
													selectElement(['trait', s, item.originalIndex]);
												"
											>
												<i class="fas fa-sliders" aria-hidden="true"></i>
											</button>
										</div>
										<button
											v-else
											type="button"
											class="trait-title-btn"
											:aria-label="
												!item.isPlaceholder && item.trait.name
													? item.trait.name + (submode === 'play' ? ' options' : ' edit')
													: (traitSet.noun || 'Name') + ' edit'
											"
											@click.stop="openTraitAt(s, item)"
										>
											<span
												class="trait-name"
												v-if="
													(!printBlank || isFixedSystemTrait(traitSet, item.trait)) &&
													!item.isPlaceholder &&
													item.trait.name
												"
												>{{ item.trait.name }}</span
											>
											<span
												class="trait-name trait-name-blank"
												v-else-if="printBlank || item.isPlaceholder || !item.trait.name"
											>
												<template v-if="item.trait.name && getView(item.trait)?.prompt && !item.isPlaceholder">
													{{ item.trait.name }} <span class="trait-blank-line"></span>
												</template>
												<template v-else-if="isFixedSystemTrait(traitSet, item.trait) && !item.isPlaceholder">
													{{ item.trait.name }}
												</template>
												<template v-else-if="(submode === 'edit' || isPlayMutableSet(traitSet)) && !printBlank">
													<span class="trait-name-hint">{{ traitSet.noun || 'Name' }}...</span>
												</template>
												<template v-else>
													<span class="trait-blank-line"></span>
												</template>
											</span>
											<span class="trait-name" v-else>{{ item.trait.name || '' }}</span>
										</button>
										<button
											v-if="!printBlank && !item.isPlaceholder && item.trait.ref && submode !== 'print'"
											type="button"
											class="trait-explore-btn"
											:title="'Explore ' + resolveTraitRefTitle(item.trait)"
											:aria-label="'Explore ' + resolveTraitRefTitle(item.trait)"
											@click.stop="graph.exploreCuriosity(item.trait.ref)"
										>
											<i class="fas fa-lightbulb" aria-hidden="true"></i>
										</button>
									</template>
								</div>
							</div>
							<!-- RATING -->
							<div
								v-if="partsGridFor(traitSet)?.cells.rating"
								class="trait-part trait-part-rating"
								:class="{
									'trait-asset-card': getRatingPlacement(traitSet) === 'above',
									'trait-title trait-title-stacked': getRatingPlacement(traitSet) === 'below',
								}"
								:style="partCellStyle(partsGridFor(traitSet), 'rating')"
							>
								<div class="trait-value stress-value" v-if="getView(traitSet)?.style?.body === 'die-track'">
									<span
										v-for="size in getTraitSetRatings(traitSet)"
										:key="size"
										:class="{ active: !printBlank && !item.isPlaceholder && isDieActive(item.trait, size) }"
										role="button"
										tabindex="0"
										:aria-label="`Stage d${size} from ${item.trait.name || 'trait'}`"
										:aria-pressed="isDieActive(item.trait, size) ? 'true' : 'false'"
										@click.stop="
											!printBlank && !item.isPlaceholder ? handleSteppedDieClick(s, item.originalIndex, size) : null
										"
										@keydown.enter.prevent="
											!printBlank && !item.isPlaceholder ? handleSteppedDieClick(s, item.originalIndex, size) : null
										"
										@keydown.space.prevent="
											!printBlank && !item.isPlaceholder ? handleSteppedDieClick(s, item.originalIndex, size) : null
										"
										v-html="
											renderDieValueForPrint(size, !printBlank && !item.isPlaceholder && isDieActive(item.trait, size))
										"
									></span>
									<span
										v-if="shouldShowOut(traitSet)"
										:class="{
											'out-badge': true,
											active: !printBlank && !item.isPlaceholder && isTraitOut(item.trait, traitSet),
										}"
										role="button"
										tabindex="0"
										:aria-label="`Out for ${item.trait.name || 'trait'}`"
										:aria-pressed="isTraitOut(item.trait, traitSet) ? 'true' : 'false'"
										@click.stop="!printBlank && !item.isPlaceholder ? handleOutClick(s, item.originalIndex) : null"
										@keydown.enter.prevent="
											!printBlank && !item.isPlaceholder ? handleOutClick(s, item.originalIndex) : null
										"
										@keydown.space.prevent="
											!printBlank && !item.isPlaceholder ? handleOutClick(s, item.originalIndex) : null
										"
										title="Out"
										>{{ getTraitSetLabel(traitSet, 'out') }}</span
									>
									<button
										v-if="submode === 'play' && !printBlank && !item.isPlaceholder && firstDie(item.trait) > 0"
										type="button"
										class="btn-stage-stress"
										@click.stop="
											stageTrackDie(
												item.trait,
												firstDie(item.trait),
												item.trait.name || traitSet.noun || 'Trait',
												traitSet,
											)
										"
										title="Stage die into pool"
										aria-label="Stage die into pool"
									>
										+<i class="fas fa-dice" aria-hidden="true"></i>
									</button>
								</div>
								<div class="trait-value" v-else-if="getView(traitSet)?.style?.body === 'list'"></div>
								<div class="trait-value pip-value" v-else-if="resolveTraitRating(item.trait)?.type === 'Pip'">
									<span
										v-for="(filled, pIdx) in getTraitPipBubbles(item.trait)"
										:key="pIdx"
										class="pip-bubble"
										:class="{ filled: !printBlank && filled }"
										role="checkbox"
										:tabindex="printBlank ? -1 : 0"
										:aria-checked="filled ? 'true' : 'false'"
										:aria-label="`Pip ${pIdx + 1} of ${item.trait.name || 'trait'}`"
										@click.stop="!printBlank ? toggleTraitPipBubble(item.trait, pIdx) : null"
										@keydown.enter.prevent="!printBlank ? toggleTraitPipBubble(item.trait, pIdx) : null"
										@keydown.space.prevent="!printBlank ? toggleTraitPipBubble(item.trait, pIdx) : null"
									></span>
									<button
										v-if="submode === 'edit' && !printBlank && !item.isPlaceholder"
										type="button"
										class="btn-canvas-edit-rating"
										:aria-expanded="isCanvasTraitActive(s, item.originalIndex)"
										:aria-label="`Edit ${item.trait.name || 'trait'} rating`"
										title="Edit rating"
										@click.stop="toggleCanvasTrait(s, item.originalIndex)"
									>
										<i class="fas fa-sliders" aria-hidden="true"></i>
									</button>
								</div>
								<div class="trait-value counter-value" v-else-if="resolveTraitRating(item.trait)?.type === 'Counter'">
									<template v-if="(submode === 'play' || submode === 'edit') && !printBlank && !item.isPlaceholder">
										<button
											type="button"
											class="btn-canvas-counter-step"
											:aria-label="`Decrease ${item.trait.name || 'trait'} counter`"
											@click.stop="stepTraitCounter(item.trait, traitSet, -1)"
										>
											-
										</button>
										<button
											v-if="submode === 'edit'"
											type="button"
											class="counter-display counter-display-btn"
											:aria-expanded="isCanvasTraitActive(s, item.originalIndex)"
											:aria-label="`Edit ${item.trait.name || 'trait'} rating`"
											@click.stop="toggleCanvasTrait(s, item.originalIndex)"
										>
											{{ resolveTraitRating(item.trait)?.value?.[0] ?? 0 }}
										</button>
										<span v-else class="counter-display">{{ resolveTraitRating(item.trait)?.value?.[0] ?? 0 }}</span>
										<button
											type="button"
											class="btn-canvas-counter-step"
											:aria-label="`Increase ${item.trait.name || 'trait'} counter`"
											@click.stop="stepTraitCounter(item.trait, traitSet, 1)"
										>
											+
										</button>
									</template>
									<span v-else class="counter-display">{{
										!printBlank ? (resolveTraitRating(item.trait)?.value?.[0] ?? 0) : ''
									}}</span>
								</div>
								<div
									class="trait-value unrated-value"
									v-else-if="
										!printBlank &&
										!item.isPlaceholder &&
										!resolveTraitRating(item.trait) &&
										!getSetRatingDie(traitSet) &&
										getRatingDisplay(traitSet) === 'rating'
									"
								>
									<button
										v-if="submode === 'edit'"
										type="button"
										class="btn-canvas-add-rating"
										:aria-expanded="isCanvasTraitActive(s, item.originalIndex)"
										:aria-label="`Add rating to ${item.trait.name || 'trait'}`"
										@click.stop="toggleCanvasTrait(s, item.originalIndex)"
									>
										<i class="fas fa-plus" aria-hidden="true"></i> Rating
									</button>
								</div>
								<div class="trait-value multidie-value" v-else-if="resolveTraitRating(item.trait)?.type === 'Dice'">
									<div
										v-for="(dieSize, dIdx) in printBlank || item.isPlaceholder
											? getTraitSetRatings(traitSet)
											: getTraitDice(item.trait)"
										:key="dIdx"
										class="multidie-badge-wrap"
										:class="{ spent: !printBlank && !item.isPlaceholder && isDieSpent(item.trait, dIdx) }"
									>
										<span
											:class="{ active: !printBlank && !item.isPlaceholder }"
											role="button"
											tabindex="0"
											:aria-label="`Stage d${dieSize} from ${item.trait.name || 'trait'}`"
											@click.stop="
												!printBlank && !item.isPlaceholder
													? handleDieClick(item.trait, dieSize, dIdx, traitSet, s, item.originalIndex)
													: null
											"
											@keydown.enter.prevent="
												!printBlank && !item.isPlaceholder
													? handleDieClick(item.trait, dieSize, dIdx, traitSet, s, item.originalIndex)
													: null
											"
											@keydown.space.prevent="
												!printBlank && !item.isPlaceholder
													? handleDieClick(item.trait, dieSize, dIdx, traitSet, s, item.originalIndex)
													: null
											"
											:title="
												submode === 'play' && !printBlank && !item.isPlaceholder
													? 'Click to add d' + dieSize + ' to roller pool'
													: ''
											"
											v-html="renderDieValueForPrint(dieSize, !printBlank && !item.isPlaceholder)"
										></span>
										<div
											class="die-play-controls"
											v-if="
												submode === 'play' && !printBlank && !item.isPlaceholder && isSpendable(item.trait, traitSet)
											"
										>
											<button
												type="button"
												class="btn-play-spend"
												@click.stop="toggleDieSpentInPlay(s, item.originalIndex, dIdx)"
												:title="isDieSpent(item.trait, dIdx) ? 'Restore die' : 'Spend die'"
												:aria-label="
													isDieSpent(item.trait, dIdx)
														? `Restore d${dieSize} on ${item.trait.name || 'trait'}`
														: `Spend d${dieSize} on ${item.trait.name || 'trait'}`
												"
											>
												<i
													:class="isDieSpent(item.trait, dIdx) ? 'fas fa-rotate-left' : 'fas fa-xmark'"
													aria-hidden="true"
												></i>
											</button>
										</div>
										<div
											class="die-play-controls"
											v-else-if="
												!printBlank &&
												!item.isPlaceholder &&
												canMutatePoolOnCanvas(item.trait, traitSet) &&
												getTraitDice(item.trait).length > 1
											"
										>
											<button
												type="button"
												class="btn-play-spend"
												@click.stop="removeDieFromPoolTrait(s, item.originalIndex, dIdx)"
												title="Remove die"
												:aria-label="`Remove d${dieSize} from ${item.trait.name || 'pool'}`"
											>
												<i class="fas fa-xmark" aria-hidden="true"></i>
											</button>
										</div>
									</div>
									<button
										v-if="!printBlank && !item.isPlaceholder && canMutatePoolOnCanvas(item.trait, traitSet)"
										type="button"
										class="btn-pool-add-die"
										:class="{ active: isPoolAddOpen(item.originalIndex) }"
										:aria-expanded="isPoolAddOpen(item.originalIndex)"
										:aria-label="`Add die to ${item.trait.name || 'pool'}`"
										title="Add die"
										@click.stop="togglePoolAdd(item.originalIndex)"
									>
										<i
											:class="isPoolAddOpen(item.originalIndex) ? 'fas fa-times' : 'fas fa-plus'"
											aria-hidden="true"
										></i>
									</button>
									<div
										v-if="
											!printBlank &&
											!item.isPlaceholder &&
											canMutatePoolOnCanvas(item.trait, traitSet) &&
											isPoolAddOpen(item.originalIndex)
										"
										class="pool-add-picker"
										role="group"
										:aria-label="`Add die size to ${item.trait.name || 'pool'}`"
										@click.stop
									>
										<button
											v-for="addSize in getPoolAddRange(item.trait, traitSet)"
											:key="'pg-pool-add-' + addSize"
											type="button"
											class="btn-pool-die-option"
											:aria-label="`Add d${addSize} to ${item.trait.name || 'pool'}`"
											:title="`Add d${addSize}`"
											@click.stop="addDieToPoolTrait(s, item.originalIndex, addSize)"
										>
											<span v-html="renderDieValueForPrint(addSize, false)"></span>
										</button>
									</div>
								</div>
								<div
									v-else
									class="trait-value single-die-value"
									:class="{
										'is-out-active':
											!printBlank &&
											!item.isPlaceholder &&
											getRatingDisplay(traitSet) === 'rating' &&
											isTraitOut(item.trait, traitSet),
										'has-hinder-pill':
											submode === 'play' &&
											!printBlank &&
											!item.isPlaceholder &&
											Boolean(getAltRoll(item.trait, traitSet)),
									}"
									@click.stop="
										submode === 'play' && !printBlank && !item.isPlaceholder
											? handleSingleDieClick(item.trait, firstDie(item.trait), traitSet, s, item.originalIndex)
											: null
									"
								>
									<template v-if="!printBlank && getRatingDisplay(traitSet) === 'rating'">
										<span
											v-if="!item.isPlaceholder && isTraitOut(item.trait, traitSet)"
											class="out-badge active"
											role="button"
											tabindex="0"
											:aria-label="`Out for ${item.trait.name || 'trait'}`"
											aria-pressed="true"
											@click.stop="handleSingleDieClick(item.trait, null, traitSet, s, item.originalIndex)"
											@keydown.enter.prevent="handleSingleDieClick(item.trait, null, traitSet, s, item.originalIndex)"
											@keydown.space.prevent="handleSingleDieClick(item.trait, null, traitSet, s, item.originalIndex)"
											title="Out"
											>{{ getTraitSetLabel(traitSet, 'out') }}</span
										>
										<span
											v-else
											:class="{ active: !printBlank && !item.isPlaceholder && Boolean(firstDie(item.trait)) }"
											role="button"
											tabindex="0"
											:aria-label="`Stage d${firstDie(item.trait) || getSetRatingDie(traitSet) || 4} from ${item.trait.name || 'trait'}`"
											:aria-pressed="
												!printBlank && !item.isPlaceholder && Boolean(firstDie(item.trait)) ? 'true' : 'false'
											"
											@click.stop="
												!printBlank && !item.isPlaceholder
													? handleSingleDieClick(
															item.trait,
															firstDie(item.trait) || getSetRatingDie(traitSet) || 4,
															traitSet,
															s,
															item.originalIndex,
														)
													: null
											"
											@keydown.enter.prevent="
												!printBlank && !item.isPlaceholder
													? handleSingleDieClick(
															item.trait,
															firstDie(item.trait) || getSetRatingDie(traitSet) || 4,
															traitSet,
															s,
															item.originalIndex,
														)
													: null
											"
											@keydown.space.prevent="
												!printBlank && !item.isPlaceholder
													? handleSingleDieClick(
															item.trait,
															firstDie(item.trait) || getSetRatingDie(traitSet) || 4,
															traitSet,
															s,
															item.originalIndex,
														)
													: null
											"
											v-html="
												renderDieValueForPrint(
													firstDie(item.trait) || getSetRatingDie(traitSet) || 4,
													!printBlank && !item.isPlaceholder && Boolean(firstDie(item.trait)),
												)
											"
										></span>
									</template>
									<template v-else>
										<span
											v-for="size in getTraitSetRatings(traitSet)"
											:key="size"
											:class="{ active: !printBlank && !item.isPlaceholder && isDieActive(item.trait, size) }"
											role="button"
											tabindex="0"
											:aria-label="`Stage d${size} from ${item.trait.name || 'trait'}`"
											:aria-pressed="isDieActive(item.trait, size) ? 'true' : 'false'"
											@click.stop="
												!printBlank && !item.isPlaceholder
													? handleSingleDieClick(item.trait, size, traitSet, s, item.originalIndex)
													: null
											"
											@keydown.enter.prevent="
												!printBlank && !item.isPlaceholder
													? handleSingleDieClick(item.trait, size, traitSet, s, item.originalIndex)
													: null
											"
											@keydown.space.prevent="
												!printBlank && !item.isPlaceholder
													? handleSingleDieClick(item.trait, size, traitSet, s, item.originalIndex)
													: null
											"
											v-html="
												renderDieValueForPrint(
													size,
													!printBlank && !item.isPlaceholder && isDieActive(item.trait, size),
												)
											"
										></span>
									</template>
									<button
										v-if="
											submode === 'play' &&
											!printBlank &&
											!item.isPlaceholder &&
											!isTraitOut(item.trait, traitSet) &&
											getAltRoll(item.trait, traitSet)
										"
										type="button"
										class="btn-hinder-pill"
										@click.stop="handleAltRollClick(item.trait, traitSet)"
										:title="`Take d${getAltRoll(item.trait, traitSet)?.die || 4}${getAltRoll(item.trait, traitSet)?.ppDelta ? ` (${(getAltRoll(item.trait, traitSet)!.ppDelta > 0 ? '+' : '') + getAltRoll(item.trait, traitSet)!.ppDelta} PP)` : ''}`"
										:aria-label="formatAltRollAriaLabel(item.trait, traitSet)"
									>
										<span aria-hidden="true">d{{ getAltRoll(item.trait, traitSet)?.die || 4 }}</span
										><span v-if="getAltRoll(item.trait, traitSet)?.ppDelta" class="hinder-pp-tag" aria-hidden="true">{{
											getAltRoll(item.trait, traitSet)!.ppDelta === 1
												? '+PP'
												: getAltRoll(item.trait, traitSet)!.ppDelta === -1
													? '-PP'
													: (getAltRoll(item.trait, traitSet)!.ppDelta > 0 ? '+' : '') +
														getAltRoll(item.trait, traitSet)!.ppDelta +
														'PP'
										}}</span>
									</button>
									<span
										v-if="
											(printBlank || getRatingDisplay(traitSet) !== 'rating') &&
											getSetRatingDie(traitSet) &&
											!item.isPlaceholder &&
											!isTraitRated(item.trait)
										"
										class="set-rating-die"
										v-html="renderDieValueForPrint(getSetRatingDie(traitSet), true)"
										:title="'Rating d' + getSetRatingDie(traitSet)"
										aria-hidden="true"
									></span>
									<span
										v-if="(printBlank || getRatingDisplay(traitSet) !== 'rating') && shouldShowOut(traitSet)"
										:class="{
											'out-badge': true,
											active: !printBlank && !item.isPlaceholder && isTraitOut(item.trait, traitSet),
										}"
										role="button"
										tabindex="0"
										:aria-label="`Out for ${item.trait.name || 'trait'}`"
										:aria-pressed="isTraitOut(item.trait, traitSet) ? 'true' : 'false'"
										@click.stop="!printBlank && !item.isPlaceholder ? handleOutClick(s, item.originalIndex) : null"
										@keydown.enter.prevent="
											!printBlank && !item.isPlaceholder ? handleOutClick(s, item.originalIndex) : null
										"
										@keydown.space.prevent="
											!printBlank && !item.isPlaceholder ? handleOutClick(s, item.originalIndex) : null
										"
										title="Out"
										>{{ getTraitSetLabel(traitSet, 'out') }}</span
									>
								</div>
							</div>
							<!-- TRACK LABEL -->
							<div
								v-if="partsGridFor(traitSet)?.cells.trackLabel"
								class="trait-part trait-part-track-label"
								:style="partCellStyle(partsGridFor(traitSet), 'trackLabel')"
							>
								<div class="attached-stress-divider" v-if="!isPartsInline(traitSet)"></div>
								<template v-if="submode === 'play' && !printBlank && !item.isPlaceholder">
									<input
										v-if="isInlineTrackLabelOpen(item.originalIndex)"
										type="text"
										class="track-label-inline-input"
										:value="getTraitTrackLabel(traitSet, item.trait)"
										:placeholder="getTraitSetLabel(traitSet, 'track')"
										:aria-label="`Track label for ${item.trait.name || 'trait'}`"
										@click.stop
										@input="setTraitTrackLabel(s, item.originalIndex, ($event.target as HTMLInputElement).value)"
										@keydown.enter="onTraitNameInlineEnter($event)"
										@keydown.escape.prevent="finalizeTraitTrackLabel(s, item.originalIndex)"
										@blur="finalizeTraitTrackLabel(s, item.originalIndex)"
									/>
									<button
										v-else
										type="button"
										class="attached-stress-label attached-stress-label-btn"
										:aria-label="`Edit track label for ${item.trait.name || 'trait'}`"
										title="Edit track label"
										@click.stop="startInlineTrackLabel(item.originalIndex, $event)"
									>
										{{ getTraitTrackLabel(traitSet, item.trait) }}
									</button>
								</template>
								<span v-else class="attached-stress-label">{{ getTraitTrackLabel(traitSet, item.trait) }}</span>
							</div>
							<!-- TRACK CELLS -->
							<div
								v-if="partsGridFor(traitSet)?.cells.track"
								class="trait-part trait-part-track"
								:style="
									partCellStyle(partsGridFor(traitSet), 'track') + '; --track-faces: ' + getTrackScale(traitSet).length
								"
							>
								<div class="attached-stress-track">
									<span
										v-for="size in getTrackScale(traitSet)"
										:key="size"
										:class="{
											'attached-stress-die': true,
											active: !printBlank && getTrackValue(item.trait, traitSet) === size,
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
										:class="{ 'out-badge': true, active: !printBlank && isTrackOut(item.trait, traitSet) }"
										role="button"
										tabindex="0"
										:aria-label="`Out for ${item.trait.name || 'trait'}`"
										:aria-pressed="isTrackOut(item.trait, traitSet) ? 'true' : 'false'"
										@click.stop="!printBlank ? handleTrackOutClick(s, item.originalIndex) : null"
										@keydown.enter.prevent="!printBlank ? handleTrackOutClick(s, item.originalIndex) : null"
										@keydown.space.prevent="!printBlank ? handleTrackOutClick(s, item.originalIndex) : null"
										title="Out"
										>{{ getTraitSetLabel(traitSet, 'out') }}</span
									>
									<button
										v-if="
											submode === 'play' &&
											!printBlank &&
											!item.isPlaceholder &&
											getTrackValue(item.trait, traitSet) > 0
										"
										type="button"
										class="btn-stage-stress"
										@click.stop="
											stageTrackDie(
												item.trait,
												getTrackValue(item.trait, traitSet),
												getTraitTrackLabel(traitSet, item.trait),
												traitSet,
											)
										"
										title="Stage track die into pool"
										aria-label="Stage track die into pool"
									>
										+<i class="fas fa-dice" aria-hidden="true"></i>
									</button>
								</div>
							</div>
							<!-- DESCRIPTION -->
							<div
								v-if="partsGridFor(traitSet)?.cells.description"
								class="trait-part trait-part-description"
								:style="partCellStyle(partsGridFor(traitSet), 'description')"
							>
								<div class="trait-description">
									<span v-if="getView(traitSet)?.pipSeparator && item.trait.description" class="trait-pip-separator">{{
										getView(traitSet)?.pipSeparator
									}}</span>
									<input
										v-if="
											submode === 'edit' &&
											!printBlank &&
											!item.isPlaceholder &&
											(isTraitDescInlineOpen(item.trait, item.originalIndex) ||
												isCanvasTraitActive(s, item.originalIndex))
										"
										type="text"
										class="trait-desc-inline-input"
										:value="item.trait.description || ''"
										placeholder="Description..."
										aria-label="Trait description"
										@click.stop
										@input="onTraitDescInlineInput(item.trait, $event)"
										@keydown.enter="onTraitNameInlineEnter"
									/>
									<span
										v-else-if="!printBlank && !item.isPlaceholder && item.trait.description"
										v-html="
											getView(traitSet)?.notesMarkdown
												? renderNotesText(item.trait.description)
												: renderText(item.trait.description)
										"
									></span>
									<span class="desc-hint" v-else-if="submode === 'edit'">Description...</span>
									<div class="desc-blank-area" v-else-if="printBlank || item.isPlaceholder">
										<div class="desc-blank-line"></div>
									</div>
									<div class="desc-blank-line" v-else></div>
								</div>
							</div>
							<!-- BADGE -->
							<div
								v-if="partsGridFor(traitSet)?.cells.badge && (getView(item.trait) as any)?.badge"
								class="trait-part trait-part-badge"
								:style="partCellStyle(partsGridFor(traitSet), 'badge')"
							>
								<span
									class="badge"
									:class="[
										'badge--' + ((getView(item.trait) as any)?.badge?.shape || 'vertical-bar'),
										'badge--' + ((getView(item.trait) as any)?.badge?.color || 'black'),
									]"
								>
									<i
										v-if="(getView(item.trait) as any)?.badge?.icon"
										:class="['fa', (getView(item.trait) as any).badge.icon]"
										aria-hidden="true"
									></i>
									<span class="badge-label">{{ (getView(item.trait) as any)?.badge?.text }}</span>
								</span>
							</div>
							<!-- BLOCK (SFX) -->
							<div
								v-if="
									partsGridFor(traitSet)?.cells.block &&
									characterCurioFunctions.blockChildren(item.trait, traitSet).length
								"
								class="trait-part trait-part-block"
								:style="partCellStyle(partsGridFor(traitSet), 'block')"
							>
								<ul class="trait-sfx">
									<li
										v-for="(sfx, sfIdx) in characterCurioFunctions.blockChildren(item.trait, traitSet)"
										:key="(sfx && sfx._lid) || 'sfx' + sfIdx"
									>
										<span class="block-prefix" v-if="(getView(item.trait) as any)?.prefix?.text"
											>{{ (getView(item.trait) as any).prefix.text }}
										</span>
										<template
											v-if="
												submode === 'edit' &&
												!printBlank &&
												!item.isPlaceholder &&
												isCanvasTraitActive(s, item.originalIndex)
											"
										>
											<input
												type="text"
												class="sfx-name-inline-input"
												:value="sfx.name || ''"
												placeholder="SFX"
												aria-label="SFX name"
												@click.stop
												@input="onSfxFieldInlineInput(sfx, 'name', $event)"
												@keydown.enter="onTraitNameInlineEnter"
											/>
											<input
												type="text"
												class="sfx-desc-inline-input"
												:value="sfx.description || ''"
												placeholder="Effect..."
												aria-label="SFX detail"
												@click.stop
												@input="onSfxFieldInlineInput(sfx, 'description', $event)"
												@keydown.enter="onTraitNameInlineEnter"
											/>
										</template>
										<template v-else>
											<span class="trait-sfx-name" v-if="sfx.name">{{ sfx.name }}</span
											><span v-if="sfx.name && sfx.description">: </span>
											<span
												class="trait-sfx-description"
												v-if="sfx.description"
												v-html="renderText(sfx.description)"
											></span>
											<span class="sfx-blank-line" v-else-if="submode === 'print'"></span>
											<span class="sfx-placeholder-hint" v-else-if="submode === 'edit'">Detail...</span>
										</template>
									</li>
								</ul>
							</div>
							<!-- SUBTRAITS -->
							<div
								v-if="partsGridFor(traitSet)?.cells.subtraits"
								class="trait-part trait-part-subtraits"
								:style="partCellStyle(partsGridFor(traitSet), 'subtraits')"
							>
								<ul class="subtraits" v-if="visibleSubtraits(traitSet, item.trait).length || printBlank">
									<li
										class="subtrait"
										v-for="(subtrait, u) in visibleSubtraits(traitSet, item.trait).length
											? visibleSubtraits(traitSet, item.trait)
											: printBlank
												? [{ name: '' }]
												: []"
										:key="subtrait._lid || 'u' + u"
										@click.stop="
											!printBlank
												? handleSingleDieClick(subtrait, firstDie(subtrait), traitSet, s, item.originalIndex)
												: null
										"
									>
										<input
											v-if="
												submode === 'edit' &&
												!printBlank &&
												!item.isPlaceholder &&
												isCanvasTraitActive(s, item.originalIndex)
											"
											type="text"
											class="subtrait-name-inline-input"
											:value="subtrait.name || ''"
											:placeholder="(resolveSubtraitNoun(subtrait, traitSet) || 'Subtrait') + ' name'"
											:aria-label="(resolveSubtraitNoun(subtrait, traitSet) || 'Subtrait') + ' name'"
											@click.stop
											@input="onSubtraitNameInlineInput(subtrait, $event)"
											@keydown.enter="onTraitNameInlineEnter"
										/>
										<span class="subtrait-name" v-else-if="subtrait.name">{{ subtrait.name }}</span>
										<span class="subtrait-name" v-else>
											<span class="trait-blank-line subtrait-blank-line"></span>
										</span>
										<div class="subtrait-value">
											<span
												v-for="size in getSubtraitRatings(traitSet)"
												:key="size"
												:class="{ active: !printBlank && isDieActive(subtrait, size) }"
												role="button"
												tabindex="0"
												:aria-label="`Stage d${size} from ${subtrait.name || 'subtrait'}`"
												:aria-pressed="isDieActive(subtrait, size) ? 'true' : 'false'"
												@keydown.enter.prevent="
													!printBlank ? handleSingleDieClick(subtrait, size, traitSet, s, item.originalIndex) : null
												"
												@keydown.space.prevent="
													!printBlank ? handleSingleDieClick(subtrait, size, traitSet, s, item.originalIndex) : null
												"
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
									:class="'trait-part trait-part-' + partKey.replace(/[^a-zA-Z0-9_-]/g, '-')"
									:style="partCellStyle(partsGridFor(traitSet), partKey)"
								>
									<template v-if="parseChildPartKey(partKey).kind === 'label'">
										<template v-if="isPipChildPart(partKey)">
											<span v-if="getView(traitSet)?.pipSeparator" class="trait-pip-separator">{{
												getView(traitSet)?.pipSeparator
											}}</span>
											<span v-if="getView(traitSet)?.pipSeparator" class="trait-pip-separator">{{
												getView(traitSet)?.pipSeparator
											}}</span>
											<span class="trait-pip-box" @click.stop="openTraitAt(s, item)">
												<input
													v-if="!printBlank && !item.isPlaceholder && canEditChildOnSheet(item.trait, traitSet)"
													type="text"
													class="trait-pip-input"
													:value="getPipChild(item.trait)?.name || item.trait?.description || ''"
													@input="setPipChildName(item.trait, ($event.target as HTMLInputElement).value)"
													@click.stop="openTraitAt(s, item)"
													:placeholder="pipPlaceholder(item.trait)"
												/>
												<span
													class="trait-pip-text"
													v-else-if="!printBlank && !item.isPlaceholder && getPipChild(item.trait)?.name"
													v-html="renderText(getPipChild(item.trait)?.name || '')"
												></span>
												<span class="trait-pip-blank" v-else-if="printBlank || item.isPlaceholder"></span>
												<span class="trait-pip-hint" v-else-if="submode === 'edit'">{{
													pipPlaceholder(item.trait)
												}}</span>
												<span class="trait-pip-blank" v-else></span>
											</span>
										</template>
										<template v-else>
											<span
												class="child-part-label"
												v-if="(getView(traitSet)?.parts?.[partKey] as any)?.marker === 'L'"
											>
												{{
													getChildTraitByNoun(item.trait, parseChildPartKey(partKey).noun)?.name ||
													parseChildPartKey(partKey).noun
												}}
											</span>
											<span class="child-part-text" v-else>
												{{
													getChildTraitByNoun(item.trait, parseChildPartKey(partKey).noun)?.description ||
													getChildTraitByNoun(item.trait, parseChildPartKey(partKey).noun)?.name ||
													''
												}}
											</span>
										</template>
									</template>
									<template v-else-if="parseChildPartKey(partKey).kind === 'rating'">
										<template v-if="isPipChildPart(partKey)">
											<span
												v-if="getPipChild(item.trait)"
												class="pip"
												:class="{ questioned: !printBlank && isChildPipFilled(item.trait) }"
												role="checkbox"
												tabindex="0"
												:aria-checked="isChildPipFilled(item.trait) ? 'true' : 'false'"
												:aria-label="`Toggle ${resolveSubtraitNoun(getPipChild(item.trait), traitSet).toLowerCase()} for ${item.trait.name || 'trait'}`"
												@keydown.enter.prevent="togglePip(s, item.originalIndex)"
												@keydown.space.prevent="togglePip(s, item.originalIndex)"
												@click.stop="togglePip(s, item.originalIndex)"
												:title="
													submode === 'play'
														? isChildPipFilled(item.trait)
															? 'Questioned (click to reset)'
															: 'Click to question'
														: ''
												"
											></span>
										</template>
										<div class="trait-value child-part-value" v-else>
											<template
												v-if="
													resolveTraitRating(getChildTraitByNoun(item.trait, parseChildPartKey(partKey).noun), [
														item.trait,
													])?.type === 'Pip'
												"
											>
												<span
													v-for="(filled, pIdx) in getTraitPipBubbles(
														getChildTraitByNoun(item.trait, parseChildPartKey(partKey).noun),
													)"
													:key="pIdx"
													class="pip-bubble"
													:class="{ filled: !printBlank && filled }"
													role="checkbox"
													:aria-checked="filled ? 'true' : 'false'"
													@click.stop="
														toggleTraitPipBubble(getChildTraitByNoun(item.trait, parseChildPartKey(partKey).noun), pIdx)
													"
												></span>
											</template>
											<template
												v-else-if="
													resolveTraitRating(getChildTraitByNoun(item.trait, parseChildPartKey(partKey).noun), [
														item.trait,
													])?.type === 'Die'
												"
											>
												<span
													v-for="size in resolveTraitRating(
														getChildTraitByNoun(item.trait, parseChildPartKey(partKey).noun),
														[item.trait],
													)?.range || [4, 6, 8, 10, 12]"
													:key="size"
													:class="{
														active:
															!printBlank &&
															isDieActive(getChildTraitByNoun(item.trait, parseChildPartKey(partKey).noun)!, size),
													}"
													v-html="
														renderDieValueForPrint(
															size,
															!printBlank &&
																isDieActive(getChildTraitByNoun(item.trait, parseChildPartKey(partKey).noun)!, size),
														)
													"
												></span>
											</template>
											<template
												v-else-if="
													resolveTraitRating(getChildTraitByNoun(item.trait, parseChildPartKey(partKey).noun), [
														item.trait,
													])?.type === 'Dice'
												"
											>
												<div
													v-for="(dieSize, dIdx) in resolveTraitRating(
														getChildTraitByNoun(item.trait, parseChildPartKey(partKey).noun),
														[item.trait],
													)?.value || []"
													:key="dIdx"
													class="multidie-badge-wrap"
												>
													<span
														class="active"
														v-html="renderDieValueForPrint(Number(dieSize) || 6, !printBlank)"
													></span>
												</div>
											</template>
											<template
												v-else-if="
													resolveTraitRating(getChildTraitByNoun(item.trait, parseChildPartKey(partKey).noun), [
														item.trait,
													])?.type === 'Counter'
												"
											>
												<span class="counter-display">{{
													resolveTraitRating(getChildTraitByNoun(item.trait, parseChildPartKey(partKey).noun), [
														item.trait,
													])?.value?.[0] ?? 0
												}}</span>
											</template>
										</div>
									</template>
								</div>
							</template>
						</div>
						<div
							v-else
							:class="{
								'trait-inner': true,
								selected: !item.isPlaceholder && isSelected(['trait', s, item.originalIndex]),
								'trait-placeholder-slot': item.isPlaceholder,
							}"
						>
							<!-- RATING POSITION ABOVE (e.g. Signature Assets) -->
							<template v-if="getRatingPlacement(traitSet) === 'above'">
								<div class="trait-asset-card">
									<div class="trait-value single-die-value">
										<template v-if="getRatingDisplay(traitSet) === 'rating'">
											<span
												:class="{ active: !printBlank && !item.isPlaceholder && Boolean(firstDie(item.trait)) }"
												role="button"
												tabindex="0"
												:aria-label="`Stage d${firstDie(item.trait) || getSetRatingDie(traitSet) || 4} from ${item.trait.name || 'trait'}`"
												:aria-pressed="
													!printBlank && !item.isPlaceholder && Boolean(firstDie(item.trait)) ? 'true' : 'false'
												"
												@click.stop="
													!printBlank && !item.isPlaceholder
														? handleSingleDieClick(
																item.trait,
																firstDie(item.trait) || getSetRatingDie(traitSet) || 4,
																traitSet,
																s,
																item.originalIndex,
															)
														: null
												"
												@keydown.enter.prevent="
													!printBlank && !item.isPlaceholder
														? handleSingleDieClick(
																item.trait,
																firstDie(item.trait) || getSetRatingDie(traitSet) || 4,
																traitSet,
																s,
																item.originalIndex,
															)
														: null
												"
												@keydown.space.prevent="
													!printBlank && !item.isPlaceholder
														? handleSingleDieClick(
																item.trait,
																firstDie(item.trait) || getSetRatingDie(traitSet) || 4,
																traitSet,
																s,
																item.originalIndex,
															)
														: null
												"
												v-html="
													renderDieValueForPrint(
														firstDie(item.trait) || getSetRatingDie(traitSet) || 4,
														!printBlank && !item.isPlaceholder && Boolean(firstDie(item.trait)),
													)
												"
											></span>
										</template>
										<template v-else>
											<span
												v-for="size in getTraitSetRatings(traitSet)"
												:key="size"
												:class="{ active: !printBlank && !item.isPlaceholder && isDieActive(item.trait, size) }"
												role="button"
												tabindex="0"
												:aria-label="`Stage d${size} from ${item.trait.name || 'trait'}`"
												:aria-pressed="isDieActive(item.trait, size) ? 'true' : 'false'"
												@click.stop="
													!printBlank && !item.isPlaceholder
														? handleSingleDieClick(item.trait, size, traitSet, s, item.originalIndex)
														: null
												"
												@keydown.enter.prevent="
													!printBlank && !item.isPlaceholder
														? handleSingleDieClick(item.trait, size, traitSet, s, item.originalIndex)
														: null
												"
												@keydown.space.prevent="
													!printBlank && !item.isPlaceholder
														? handleSingleDieClick(item.trait, size, traitSet, s, item.originalIndex)
														: null
												"
												v-html="
													renderDieValueForPrint(
														size,
														!printBlank && !item.isPlaceholder && isDieActive(item.trait, size),
													)
												"
											></span>
										</template>
									</div>
									<button
										type="button"
										class="trait-title-btn trait-asset-box"
										:aria-label="
											!item.isPlaceholder && item.trait.name
												? item.trait.name + (submode === 'play' ? ' options' : ' edit')
												: 'Edit asset'
										"
										@click.stop="openTraitAt(s, item)"
									>
										<div class="trait-asset-name" v-if="!printBlank && !item.isPlaceholder && item.trait.name">
											{{ item.trait.name }}
										</div>
										<div
											class="trait-asset-desc"
											v-if="
												!printBlank && !item.isPlaceholder && (getPipChild(item.trait)?.name || item.trait.description)
											"
											v-html="renderText(getPipChild(item.trait)?.name || item.trait.description || '')"
										></div>
										<div class="trait-asset-empty" v-else-if="printBlank || item.isPlaceholder"></div>
										<div class="trait-asset-hint" v-else-if="submode === 'edit'">Click to edit asset...</div>
										<div class="trait-asset-empty" v-else></div>
									</button>
								</div>
							</template>

							<!-- STANDARD OR OTHER RATING POSITIONS (INLINE, BELOW, NONE) -->
							<template v-else>
								<div
									class="trait-title"
									:class="{
										'trait-title-pip': Boolean(getPipChild(item.trait)),
										'trait-title-stacked': getRatingPlacement(traitSet) === 'below',
									}"
								>
									<span class="list-bullet" v-if="getView(traitSet)?.style?.body === 'list'">•</span>

									<!-- PIP CHILD MODE (e.g. Values) -->
									<template v-if="Boolean(getPipChild(item.trait))">
										<button
											type="button"
											class="trait-title-btn"
											:aria-label="
												!item.isPlaceholder && item.trait.name
													? item.trait.name + (submode === 'play' ? ' options' : ' edit')
													: (traitSet.noun || 'Name') + ' edit'
											"
											@click.stop="openTraitAt(s, item)"
										>
											<span
												class="trait-name"
												v-if="
													(!printBlank || isFixedSystemTrait(traitSet, item.trait)) &&
													!item.isPlaceholder &&
													item.trait.name
												"
												>{{ item.trait.name }}</span
											>
											<span
												class="trait-name trait-name-blank"
												v-else-if="printBlank || item.isPlaceholder || !item.trait.name"
											>
												<template v-if="isFixedSystemTrait(traitSet, item.trait) && !item.isPlaceholder">
													{{ item.trait.name }}
												</template>
												<template v-else-if="(submode === 'edit' || isPlayMutableSet(traitSet)) && !printBlank">
													<span class="trait-name-hint">{{ traitSet.noun || 'Name' }}...</span>
												</template>
												<template v-else>
													<span class="trait-blank-line"></span>
												</template>
											</span>
											<span class="trait-name" v-else>{{ item.trait.name || '' }}</span>
										</button>
										<span
											v-if="getPipChild(item.trait)"
											class="pip"
											:class="{ questioned: isChildPipFilled(item.trait) }"
											role="checkbox"
											tabindex="0"
											:aria-checked="isChildPipFilled(item.trait) ? 'true' : 'false'"
											:aria-label="`Toggle ${resolveSubtraitNoun(getPipChild(item.trait), traitSet).toLowerCase()} for ${item.trait.name || 'trait'}`"
											@keydown.enter.prevent="togglePip(s, item.originalIndex)"
											@keydown.space.prevent="togglePip(s, item.originalIndex)"
											@click.stop="togglePip(s, item.originalIndex)"
											:title="
												submode === 'play'
													? isChildPipFilled(item.trait)
														? 'Questioned (click to reset)'
														: 'Click to question'
													: ''
											"
										></span>
										<span v-if="getView(traitSet)?.pipSeparator" class="trait-pip-separator">{{
											getView(traitSet)?.pipSeparator
										}}</span>
										<span class="trait-pip-box" @click.stop="openTraitAt(s, item)">
											<input
												v-if="!printBlank && !item.isPlaceholder && canEditChildOnSheet(item.trait, traitSet)"
												type="text"
												class="trait-pip-input"
												:value="getPipChild(item.trait)?.name || item.trait?.description || ''"
												@input="setPipChildName(item.trait, ($event.target as HTMLInputElement).value)"
												@click.stop="openTraitAt(s, item)"
												:placeholder="pipPlaceholder(item.trait)"
											/>
											<span
												class="trait-pip-text"
												v-else-if="!printBlank && !item.isPlaceholder && getPipChild(item.trait)?.name"
												v-html="renderText(getPipChild(item.trait)?.name ?? '')"
											></span>
											<span class="trait-pip-blank" v-else-if="printBlank || item.isPlaceholder"></span>
											<span class="trait-pip-hint" v-else-if="submode === 'edit'">{{
												pipPlaceholder(item.trait)
											}}</span>
											<span class="trait-pip-blank" v-else></span>
										</span>
									</template>

									<!-- NORMAL TRAIT NAME -->
									<template v-else>
										<div
											v-if="
												(submode === 'edit' || isPlayMutableSet(traitSet)) &&
												!printBlank &&
												!item.isPlaceholder &&
												isCanvasTraitActive(s, item.originalIndex)
											"
											class="trait-name-inline-wrap"
											@click.stop
										>
											<input
												type="text"
												class="trait-name-inline-input"
												:value="item.trait.name"
												:placeholder="(traitSet.noun || 'Trait') + ' name'"
												:aria-label="(traitSet.noun || 'Trait') + ' name'"
												@click.stop
												@input="onTraitNameInlineInput(item.trait, $event)"
												@keydown.enter="onTraitNameInlineEnter"
												@keydown.escape.stop.prevent="closeCanvasTrait()"
												@blur="submode === 'play' ? closeCanvasTrait() : null"
											/>
											<button
												v-if="submode === 'play'"
												type="button"
												class="btn-inline-rating-icon"
												title="Trait options"
												aria-label="Trait options"
												@mousedown.prevent
												@click.stop="
													closeCanvasTrait();
													selectElement(['trait', s, item.originalIndex]);
												"
											>
												<i class="fas fa-sliders" aria-hidden="true"></i>
											</button>
										</div>
										<button
											v-else
											type="button"
											class="trait-title-btn"
											:aria-label="
												!item.isPlaceholder && item.trait.name
													? item.trait.name + (submode === 'play' ? ' options' : ' edit')
													: (traitSet.noun || 'Name') + ' edit'
											"
											@click.stop="openTraitAt(s, item)"
										>
											<span
												class="trait-name"
												v-if="
													(!printBlank || isFixedSystemTrait(traitSet, item.trait)) &&
													!item.isPlaceholder &&
													item.trait.name
												"
												>{{ item.trait.name }}</span
											>
											<span
												class="trait-name trait-name-blank"
												v-else-if="printBlank || item.isPlaceholder || !item.trait.name"
											>
												<template v-if="item.trait.name && getView(item.trait)?.prompt && !item.isPlaceholder">
													{{ item.trait.name }} <span class="trait-blank-line"></span>
												</template>
												<template v-else-if="isFixedSystemTrait(traitSet, item.trait) && !item.isPlaceholder">
													{{ item.trait.name }}
												</template>
												<template v-else-if="(submode === 'edit' || isPlayMutableSet(traitSet)) && !printBlank">
													<span class="trait-name-hint">{{ traitSet.noun || 'Name' }}...</span>
												</template>
												<template v-else>
													<span class="trait-blank-line"></span>
												</template>
											</span>
											<span class="trait-name" v-else>{{ item.trait.name || '' }}</span>
										</button>
										<button
											v-if="!printBlank && !item.isPlaceholder && item.trait.ref && submode !== 'print'"
											type="button"
											class="trait-explore-btn"
											:title="'Explore ' + resolveTraitRefTitle(item.trait)"
											:aria-label="'Explore ' + resolveTraitRefTitle(item.trait)"
											@click.stop="graph.exploreCuriosity(item.trait.ref)"
										>
											<i class="fas fa-lightbulb" aria-hidden="true"></i>
										</button>
									</template>

									<!-- STEPPED VALUE TRACK -->
									<div class="trait-value stress-value" v-if="getView(traitSet)?.style?.body === 'die-track'">
										<span
											v-for="size in getTraitSetRatings(traitSet)"
											:key="size"
											:class="{ active: !printBlank && !item.isPlaceholder && isDieActive(item.trait, size) }"
											role="button"
											tabindex="0"
											:aria-label="`Stage d${size} from ${item.trait.name || 'trait'}`"
											:aria-pressed="isDieActive(item.trait, size) ? 'true' : 'false'"
											@click.stop="
												!printBlank && !item.isPlaceholder ? handleSteppedDieClick(s, item.originalIndex, size) : null
											"
											@keydown.enter.prevent="
												!printBlank && !item.isPlaceholder ? handleSteppedDieClick(s, item.originalIndex, size) : null
											"
											@keydown.space.prevent="
												!printBlank && !item.isPlaceholder ? handleSteppedDieClick(s, item.originalIndex, size) : null
											"
											v-html="
												renderDieValueForPrint(
													size,
													!printBlank && !item.isPlaceholder && isDieActive(item.trait, size),
												)
											"
										></span>
										<span
											v-if="shouldShowOut(traitSet)"
											:class="{
												'out-badge': true,
												active: !printBlank && !item.isPlaceholder && isTraitOut(item.trait, traitSet),
											}"
											role="button"
											tabindex="0"
											:aria-label="`Out for ${item.trait.name || 'trait'}`"
											:aria-pressed="isTraitOut(item.trait, traitSet) ? 'true' : 'false'"
											@click.stop="!printBlank && !item.isPlaceholder ? handleOutClick(s, item.originalIndex) : null"
											@keydown.enter.prevent="
												!printBlank && !item.isPlaceholder ? handleOutClick(s, item.originalIndex) : null
											"
											@keydown.space.prevent="
												!printBlank && !item.isPlaceholder ? handleOutClick(s, item.originalIndex) : null
											"
											title="Out"
											>{{ getTraitSetLabel(traitSet, 'out') }}</span
										>
										<button
											v-if="submode === 'play' && !printBlank && !item.isPlaceholder && firstDie(item.trait) > 0"
											type="button"
											class="btn-stage-stress"
											@click.stop="
												stageTrackDie(
													item.trait,
													firstDie(item.trait),
													item.trait.name || traitSet.noun || 'Trait',
													traitSet,
												)
											"
											title="Stage die into pool"
											aria-label="Stage die into pool"
										>
											+<i class="fas fa-dice" aria-hidden="true"></i>
										</button>
									</div>

									<!-- LIST STYLE: NO VALUE -->
									<div class="trait-value" v-else-if="getView(traitSet)?.style?.body === 'list'"></div>

									<!-- NONE RATING POSITION: NO VALUE -->
									<div class="trait-value" v-else-if="!printBlank && getRatingPlacement(traitSet) === 'none'"></div>

									<!-- PIP-RATED TRAIT -->
									<div class="trait-value pip-value" v-else-if="resolveTraitRating(item.trait)?.type === 'Pip'">
										<span
											v-for="(filled, pIdx) in getTraitPipBubbles(item.trait)"
											:key="pIdx"
											class="pip-bubble"
											:class="{ filled: !printBlank && filled }"
											role="checkbox"
											:tabindex="printBlank ? -1 : 0"
											:aria-checked="filled ? 'true' : 'false'"
											:aria-label="`Pip ${pIdx + 1} of ${item.trait.name || 'trait'}`"
											@click.stop="!printBlank ? toggleTraitPipBubble(item.trait, pIdx) : null"
											@keydown.enter.prevent="!printBlank ? toggleTraitPipBubble(item.trait, pIdx) : null"
											@keydown.space.prevent="!printBlank ? toggleTraitPipBubble(item.trait, pIdx) : null"
										></span>
										<button
											v-if="submode === 'edit' && !printBlank && !item.isPlaceholder"
											type="button"
											class="btn-canvas-edit-rating"
											:aria-expanded="isCanvasTraitActive(s, item.originalIndex)"
											:aria-label="`Edit ${item.trait.name || 'trait'} rating`"
											title="Edit rating"
											@click.stop="toggleCanvasTrait(s, item.originalIndex)"
										>
											<i class="fas fa-sliders" aria-hidden="true"></i>
										</button>
									</div>

									<!-- COUNTER-RATED TRAIT -->
									<div class="trait-value counter-value" v-else-if="resolveTraitRating(item.trait)?.type === 'Counter'">
										<template v-if="(submode === 'play' || submode === 'edit') && !printBlank && !item.isPlaceholder">
											<button
												type="button"
												class="btn-canvas-counter-step"
												:aria-label="`Decrease ${item.trait.name || 'trait'} counter`"
												@click.stop="stepTraitCounter(item.trait, traitSet, -1)"
											>
												-
											</button>
											<button
												v-if="submode === 'edit'"
												type="button"
												class="counter-display counter-display-btn"
												:aria-expanded="isCanvasTraitActive(s, item.originalIndex)"
												:aria-label="`Edit ${item.trait.name || 'trait'} rating`"
												@click.stop="toggleCanvasTrait(s, item.originalIndex)"
											>
												{{ resolveTraitRating(item.trait)?.value?.[0] ?? 0 }}
											</button>
											<span v-else class="counter-display">{{ resolveTraitRating(item.trait)?.value?.[0] ?? 0 }}</span>
											<button
												type="button"
												class="btn-canvas-counter-step"
												:aria-label="`Increase ${item.trait.name || 'trait'} counter`"
												@click.stop="stepTraitCounter(item.trait, traitSet, 1)"
											>
												+
											</button>
										</template>
										<span v-else class="counter-display">{{
											!printBlank ? (resolveTraitRating(item.trait)?.value?.[0] ?? 0) : ''
										}}</span>
									</div>

									<!-- UNRATED TRAIT IN SINGLE-BADGE SET -->
									<div
										class="trait-value unrated-value"
										v-else-if="
											!printBlank &&
											!item.isPlaceholder &&
											!resolveTraitRating(item.trait) &&
											!getSetRatingDie(traitSet) &&
											getRatingDisplay(traitSet) === 'rating'
										"
									>
										<button
											v-if="submode === 'edit'"
											type="button"
											class="btn-canvas-add-rating"
											:aria-expanded="isCanvasTraitActive(s, item.originalIndex)"
											:aria-label="`Add rating to ${item.trait.name || 'trait'}`"
											@click.stop="toggleCanvasTrait(s, item.originalIndex)"
										>
											<i class="fas fa-plus" aria-hidden="true"></i> Rating
										</button>
									</div>

									<!-- DICE-RATED TRAIT -->
									<div class="trait-value multidie-value" v-else-if="resolveTraitRating(item.trait)?.type === 'Dice'">
										<div
											v-for="(dieSize, dIdx) in printBlank || item.isPlaceholder
												? getTraitSetRatings(traitSet)
												: getTraitDice(item.trait)"
											:key="dIdx"
											class="multidie-badge-wrap"
											:class="{ spent: !printBlank && !item.isPlaceholder && isDieSpent(item.trait, dIdx) }"
										>
											<span
												:class="{ active: !printBlank && !item.isPlaceholder }"
												role="button"
												tabindex="0"
												:aria-label="`Stage d${dieSize} from ${item.trait.name || 'trait'}`"
												:aria-pressed="!isDieSpent(item.trait, dIdx) ? 'true' : 'false'"
												@click.stop="
													!printBlank && !item.isPlaceholder
														? handleDieClick(item.trait, dieSize, dIdx, traitSet, s, item.originalIndex)
														: null
												"
												@keydown.enter.prevent="
													!printBlank && !item.isPlaceholder
														? handleDieClick(item.trait, dieSize, dIdx, traitSet, s, item.originalIndex)
														: null
												"
												@keydown.space.prevent="
													!printBlank && !item.isPlaceholder
														? handleDieClick(item.trait, dieSize, dIdx, traitSet, s, item.originalIndex)
														: null
												"
												:title="
													submode === 'play' && !printBlank && !item.isPlaceholder
														? 'Click to add d' + dieSize + ' to roller pool'
														: ''
												"
												v-html="renderDieValueForPrint(dieSize, !printBlank && !item.isPlaceholder)"
											></span>
											<div
												class="die-play-controls"
												v-if="
													submode === 'play' && !printBlank && !item.isPlaceholder && isSpendable(item.trait, traitSet)
												"
											>
												<button
													type="button"
													class="btn-play-spend"
													@click.stop="toggleDieSpentInPlay(s, item.originalIndex, dIdx)"
													:title="isDieSpent(item.trait, dIdx) ? 'Restore die' : 'Spend die'"
													:aria-label="
														isDieSpent(item.trait, dIdx)
															? `Restore d${dieSize} on ${item.trait.name || 'trait'}`
															: `Spend d${dieSize} on ${item.trait.name || 'trait'}`
													"
												>
													<i
														:class="isDieSpent(item.trait, dIdx) ? 'fas fa-rotate-left' : 'fas fa-xmark'"
														aria-hidden="true"
													></i>
												</button>
											</div>
											<div
												class="die-play-controls"
												v-else-if="
													!printBlank &&
													!item.isPlaceholder &&
													canMutatePoolOnCanvas(item.trait, traitSet) &&
													getTraitDice(item.trait).length > 1
												"
											>
												<button
													type="button"
													class="btn-play-spend"
													@click.stop="removeDieFromPoolTrait(s, item.originalIndex, dIdx)"
													title="Remove die"
													:aria-label="`Remove d${dieSize} from ${item.trait.name || 'pool'}`"
												>
													<i class="fas fa-xmark" aria-hidden="true" />
												</button>
											</div>
										</div>
										<button
											v-if="!printBlank && !item.isPlaceholder && canMutatePoolOnCanvas(item.trait, traitSet)"
											type="button"
											class="btn-pool-add-die"
											:class="{ active: isPoolAddOpen(item.originalIndex) }"
											:aria-expanded="isPoolAddOpen(item.originalIndex)"
											:aria-label="`Add die to ${item.trait.name || 'pool'}`"
											title="Add die"
											@click.stop="togglePoolAdd(item.originalIndex)"
										>
											<i
												:class="isPoolAddOpen(item.originalIndex) ? 'fas fa-times' : 'fas fa-plus'"
												aria-hidden="true"
											></i>
										</button>
										<div
											v-if="
												!printBlank &&
												!item.isPlaceholder &&
												canMutatePoolOnCanvas(item.trait, traitSet) &&
												isPoolAddOpen(item.originalIndex)
											"
											class="pool-add-picker"
											role="group"
											:aria-label="`Add die size to ${item.trait.name || 'pool'}`"
											@click.stop
										>
											<button
												v-for="addSize in getPoolAddRange(item.trait, traitSet)"
												:key="'std-pool-add-' + addSize"
												type="button"
												class="btn-pool-die-option"
												:aria-label="`Add d${addSize} to ${item.trait.name || 'pool'}`"
												:title="`Add d${addSize}`"
												@click.stop="addDieToPoolTrait(s, item.originalIndex, addSize)"
											>
												<span v-html="renderDieValueForPrint(addSize, false)"></span>
											</button>
										</div>
									</div>

									<!-- STANDARD SINGLE-DIE TRAIT -->
									<div
										v-else
										class="trait-value single-die-value"
										:class="{
											'has-hinder-pill':
												submode === 'play' &&
												!printBlank &&
												!item.isPlaceholder &&
												Boolean(getAltRoll(item.trait, traitSet)),
										}"
										@click.stop="
											submode === 'play' && !printBlank && !item.isPlaceholder
												? handleSingleDieClick(item.trait, firstDie(item.trait), traitSet, s, item.originalIndex)
												: null
										"
									>
										<template v-if="!printBlank && getRatingDisplay(traitSet) === 'rating'">
											<span
												v-if="!item.isPlaceholder && isTraitOut(item.trait, traitSet)"
												class="out-badge active"
												role="button"
												tabindex="0"
												:aria-label="`Out for ${item.trait.name || 'trait'}`"
												aria-pressed="true"
												@click.stop="handleSingleDieClick(item.trait, null, traitSet, s, item.originalIndex)"
												@keydown.enter.prevent="handleSingleDieClick(item.trait, null, traitSet, s, item.originalIndex)"
												@keydown.space.prevent="handleSingleDieClick(item.trait, null, traitSet, s, item.originalIndex)"
												title="Out"
												>{{ getTraitSetLabel(traitSet, 'out') }}</span
											>
											<span
												v-else
												:class="{ active: !printBlank && !item.isPlaceholder && Boolean(firstDie(item.trait)) }"
												role="button"
												tabindex="0"
												:aria-label="`Stage d${firstDie(item.trait) || getSetRatingDie(traitSet) || 4} from ${item.trait.name || 'trait'}`"
												:aria-pressed="
													!printBlank && !item.isPlaceholder && Boolean(firstDie(item.trait)) ? 'true' : 'false'
												"
												@click.stop="
													!printBlank && !item.isPlaceholder
														? handleSingleDieClick(
																item.trait,
																firstDie(item.trait) || getSetRatingDie(traitSet) || 4,
																traitSet,
																s,
																item.originalIndex,
															)
														: null
												"
												@keydown.enter.prevent="
													!printBlank && !item.isPlaceholder
														? handleSingleDieClick(
																item.trait,
																firstDie(item.trait) || getSetRatingDie(traitSet) || 4,
																traitSet,
																s,
																item.originalIndex,
															)
														: null
												"
												@keydown.space.prevent="
													!printBlank && !item.isPlaceholder
														? handleSingleDieClick(
																item.trait,
																firstDie(item.trait) || getSetRatingDie(traitSet) || 4,
																traitSet,
																s,
																item.originalIndex,
															)
														: null
												"
												v-html="
													renderDieValueForPrint(
														firstDie(item.trait) || getSetRatingDie(traitSet) || 4,
														!printBlank && !item.isPlaceholder && Boolean(firstDie(item.trait)),
													)
												"
											></span>
										</template>
										<template v-else>
											<span
												v-for="size in getTraitSetRatings(traitSet)"
												:key="size"
												:class="{ active: !printBlank && !item.isPlaceholder && isDieActive(item.trait, size) }"
												role="button"
												tabindex="0"
												:aria-label="`Stage d${size} from ${item.trait.name || 'trait'}`"
												:aria-pressed="isDieActive(item.trait, size) ? 'true' : 'false'"
												@click.stop="
													!printBlank && !item.isPlaceholder
														? handleSingleDieClick(item.trait, size, traitSet, s, item.originalIndex)
														: null
												"
												@keydown.enter.prevent="
													!printBlank && !item.isPlaceholder
														? handleSingleDieClick(item.trait, size, traitSet, s, item.originalIndex)
														: null
												"
												@keydown.space.prevent="
													!printBlank && !item.isPlaceholder
														? handleSingleDieClick(item.trait, size, traitSet, s, item.originalIndex)
														: null
												"
												v-html="
													renderDieValueForPrint(
														size,
														!printBlank && !item.isPlaceholder && isDieActive(item.trait, size),
													)
												"
											></span>
										</template>
										<button
											v-if="
												submode === 'play' &&
												!printBlank &&
												!item.isPlaceholder &&
												!isTraitOut(item.trait, traitSet) &&
												getAltRoll(item.trait, traitSet)
											"
											type="button"
											class="btn-hinder-pill"
											@click.stop="handleAltRollClick(item.trait, traitSet)"
											:title="`Take d${getAltRoll(item.trait, traitSet)?.die || 4}${getAltRoll(item.trait, traitSet)?.ppDelta ? ` (${(getAltRoll(item.trait, traitSet)!.ppDelta > 0 ? '+' : '') + getAltRoll(item.trait, traitSet)!.ppDelta} PP)` : ''}`"
											:aria-label="formatAltRollAriaLabel(item.trait, traitSet)"
										>
											<span aria-hidden="true">d{{ getAltRoll(item.trait, traitSet)?.die || 4 }}</span
											><span
												v-if="getAltRoll(item.trait, traitSet)?.ppDelta"
												class="hinder-pp-tag"
												aria-hidden="true"
												>{{
													getAltRoll(item.trait, traitSet)!.ppDelta === 1
														? '+PP'
														: getAltRoll(item.trait, traitSet)!.ppDelta === -1
															? '-PP'
															: (getAltRoll(item.trait, traitSet)!.ppDelta > 0 ? '+' : '') +
																getAltRoll(item.trait, traitSet)!.ppDelta +
																'PP'
												}}</span
											>
										</button>
										<span
											v-if="
												(printBlank || getRatingDisplay(traitSet) !== 'rating') &&
												getSetRatingDie(traitSet) &&
												!item.isPlaceholder &&
												!isTraitRated(item.trait)
											"
											class="set-rating-die"
											v-html="renderDieValueForPrint(getSetRatingDie(traitSet), true)"
											:title="'Rating d' + getSetRatingDie(traitSet)"
											aria-hidden="true"
										></span>
										<span
											v-if="(printBlank || getRatingDisplay(traitSet) !== 'rating') && shouldShowOut(traitSet)"
											:class="{
												'out-badge': true,
												active: !printBlank && !item.isPlaceholder && isTraitOut(item.trait, traitSet),
											}"
											role="button"
											tabindex="0"
											:aria-label="`Out for ${item.trait.name || 'trait'}`"
											:aria-pressed="isTraitOut(item.trait, traitSet) ? 'true' : 'false'"
											@click.stop="!printBlank && !item.isPlaceholder ? handleOutClick(s, item.originalIndex) : null"
											@keydown.enter.prevent="
												!printBlank && !item.isPlaceholder ? handleOutClick(s, item.originalIndex) : null
											"
											@keydown.space.prevent="
												!printBlank && !item.isPlaceholder ? handleOutClick(s, item.originalIndex) : null
											"
											title="Out"
											>{{ getTraitSetLabel(traitSet, 'out') }}</span
										>
									</div>
								</div>

								<div
									class="trait-description"
									v-if="
										!getPipChild(item.trait) &&
										(item.trait.description ||
											hasTraitSetDescription(traitSet) ||
											(submode === 'edit' && isTraitDescInlineOpen(item.trait, item.originalIndex)))
									"
								>
									<input
										v-if="
											submode === 'edit' &&
											!printBlank &&
											!item.isPlaceholder &&
											(isTraitDescInlineOpen(item.trait, item.originalIndex) ||
												(isCanvasTraitActive(s, item.originalIndex) && Boolean(item.trait.description)))
										"
										type="text"
										class="trait-desc-inline-input"
										:value="item.trait.description || ''"
										placeholder="Description..."
										aria-label="Trait description"
										@click.stop
										@input="onTraitDescInlineInput(item.trait, $event)"
										@keydown.enter="onTraitNameInlineEnter"
									/>
									<div
										v-else-if="!printBlank && !item.isPlaceholder && item.trait.description"
										v-html="
											getView(traitSet)?.notesMarkdown
												? renderNotesText(item.trait.description)
												: renderText(item.trait.description)
										"
									></div>
									<div class="desc-hint" v-else-if="submode === 'edit'">Description...</div>
									<div class="desc-blank-area" v-else-if="printBlank || item.isPlaceholder">
										<div class="desc-blank-line"></div>
									</div>
									<div class="desc-blank-line" v-else></div>
								</div>
							</template>

							<ul class="subtraits" v-if="visibleSubtraits(traitSet, item.trait).length || printBlank">
								<li
									class="subtrait"
									v-for="(subtrait, u) in visibleSubtraits(traitSet, item.trait).length
										? visibleSubtraits(traitSet, item.trait)
										: printBlank
											? [{ name: '' }]
											: []"
									:key="subtrait._lid || 'u' + u"
									@click.stop="
										!printBlank
											? handleSingleDieClick(subtrait, firstDie(subtrait), traitSet, s, item.originalIndex)
											: null
									"
								>
									<input
										v-if="
											submode === 'edit' &&
											!printBlank &&
											!item.isPlaceholder &&
											isCanvasTraitActive(s, item.originalIndex)
										"
										type="text"
										class="subtrait-name-inline-input"
										:value="subtrait.name || ''"
										:placeholder="(resolveSubtraitNoun(subtrait, traitSet) || 'Subtrait') + ' name'"
										:aria-label="(resolveSubtraitNoun(subtrait, traitSet) || 'Subtrait') + ' name'"
										@click.stop
										@input="onSubtraitNameInlineInput(subtrait, $event)"
										@keydown.enter="onTraitNameInlineEnter"
									/>
									<span class="subtrait-name" v-else-if="subtrait.name">{{ subtrait.name }}</span>
									<span class="subtrait-name" v-else>
										<span class="trait-blank-line subtrait-blank-line"></span>
									</span>
									<div class="subtrait-value">
										<span
											v-for="size in getSubtraitRatings(traitSet)"
											:key="size"
											:class="{ active: !printBlank && isDieActive(subtrait, size) }"
											role="button"
											tabindex="0"
											:aria-label="`Stage d${size} from ${subtrait.name || 'subtrait'}`"
											:aria-pressed="isDieActive(subtrait, size) ? 'true' : 'false'"
											@keydown.enter.prevent="
												!printBlank ? handleSingleDieClick(subtrait, size, traitSet, s, item.originalIndex) : null
											"
											@keydown.space.prevent="
												!printBlank ? handleSingleDieClick(subtrait, size, traitSet, s, item.originalIndex) : null
											"
											v-html="renderDieValueForPrint(size, !printBlank && isDieActive(subtrait, size))"
										></span>
									</div>
								</li>
							</ul>

							<!-- ATTACHED TRACK -->
							<div class="attached-stress-block" v-if="hasTrackPart(traitSet)">
								<div class="attached-stress-divider"></div>
								<div class="attached-stress-header">
									<template v-if="submode === 'play' && !printBlank && !item.isPlaceholder">
										<input
											v-if="isInlineTrackLabelOpen(item.originalIndex)"
											type="text"
											class="track-label-inline-input"
											:value="getTraitTrackLabel(traitSet, item.trait)"
											:placeholder="getTraitSetLabel(traitSet, 'track')"
											:aria-label="`Track label for ${item.trait.name || 'trait'}`"
											@click.stop
											@input="setTraitTrackLabel(s, item.originalIndex, ($event.target as HTMLInputElement).value)"
											@keydown.enter="onTraitNameInlineEnter($event)"
											@keydown.escape.prevent="finalizeTraitTrackLabel(s, item.originalIndex)"
											@blur="finalizeTraitTrackLabel(s, item.originalIndex)"
										/>
										<button
											v-else
											type="button"
											class="attached-stress-label attached-stress-label-btn"
											:aria-label="`Edit track label for ${item.trait.name || 'trait'}`"
											title="Edit track label"
											@click.stop="startInlineTrackLabel(item.originalIndex, $event)"
										>
											{{ getTraitTrackLabel(traitSet, item.trait) }}
										</button>
									</template>
									<span v-else class="attached-stress-label">{{ getTraitTrackLabel(traitSet, item.trait) }}</span>
								</div>
								<div class="attached-stress-track">
									<span
										v-for="size in getTrackScale(traitSet)"
										:key="size"
										:class="{
											'attached-stress-die': true,
											active: !printBlank && getTrackValue(item.trait, traitSet) === size,
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
										:class="{ 'out-badge': true, active: !printBlank && isTrackOut(item.trait, traitSet) }"
										role="button"
										tabindex="0"
										:aria-label="`Out for ${getTraitTrackLabel(traitSet, item.trait) || 'track'}`"
										:aria-pressed="isTrackOut(item.trait, traitSet) ? 'true' : 'false'"
										@click.stop="!printBlank ? handleTrackOutClick(s, item.originalIndex) : null"
										@keydown.enter.prevent="!printBlank ? handleTrackOutClick(s, item.originalIndex) : null"
										@keydown.space.prevent="!printBlank ? handleTrackOutClick(s, item.originalIndex) : null"
										title="Out"
										>{{ getTraitSetLabel(traitSet, 'out') }}</span
									>
									<button
										v-if="
											submode === 'play' &&
											!printBlank &&
											!item.isPlaceholder &&
											getTrackValue(item.trait, traitSet) > 0
										"
										type="button"
										class="btn-stage-stress"
										@click.stop="
											stageTrackDie(
												item.trait,
												getTrackValue(item.trait, traitSet),
												getTraitTrackLabel(traitSet, item.trait),
												traitSet,
											)
										"
										title="Stage track die into pool"
										aria-label="Stage track die into pool"
									>
										+<i class="fas fa-dice" aria-hidden="true"></i>
									</button>
								</div>
							</div>

							<span
								v-if="(getView(item.trait) as any)?.badge"
								class="trait-part trait-part-badge trait-part-badge-fallback"
							>
								<span
									class="badge"
									:class="[
										'badge--' + ((getView(item.trait) as any)?.badge?.shape || 'vertical-bar'),
										'badge--' + ((getView(item.trait) as any)?.badge?.color || 'black'),
									]"
								>
									<i
										v-if="(getView(item.trait) as any)?.badge?.icon"
										:class="['fa', (getView(item.trait) as any).badge.icon]"
										aria-hidden="true"
									></i>
									<span class="badge-label">{{ (getView(item.trait) as any)?.badge?.text }}</span>
								</span>
							</span>
							<ul class="trait-sfx" v-if="characterCurioFunctions.blockChildren(item.trait, traitSet).length">
								<li
									v-for="(sfx, sfIdx) in characterCurioFunctions.blockChildren(item.trait, traitSet)"
									:key="(sfx && sfx._lid) || 'sfx' + sfIdx"
								>
									<span class="block-prefix" v-if="(getView(item.trait) as any)?.prefix?.text"
										>{{ (getView(item.trait) as any).prefix.text }}
									</span>
									<template
										v-if="
											submode === 'edit' &&
											!printBlank &&
											!item.isPlaceholder &&
											isCanvasTraitActive(s, item.originalIndex)
										"
									>
										<input
											type="text"
											class="sfx-name-inline-input"
											:value="sfx.name || ''"
											placeholder="SFX"
											aria-label="SFX name"
											@click.stop
											@input="onSfxFieldInlineInput(sfx, 'name', $event)"
											@keydown.enter="onTraitNameInlineEnter"
										/>
										<input
											type="text"
											class="sfx-desc-inline-input"
											:value="sfx.description || ''"
											placeholder="Effect..."
											aria-label="SFX detail"
											@click.stop
											@input="onSfxFieldInlineInput(sfx, 'description', $event)"
											@keydown.enter="onTraitNameInlineEnter"
										/>
									</template>
									<template v-else>
										<span class="trait-sfx-name" v-if="sfx.name">{{ sfx.name }}</span
										><span v-if="sfx.name && sfx.description">: </span>
										<span
											class="trait-sfx-description"
											v-if="sfx.description"
											v-html="renderText(sfx.description)"
										></span>
										<span class="sfx-blank-line" v-else-if="submode === 'print'"></span>
										<span class="sfx-placeholder-hint" v-else-if="submode === 'edit'">Detail...</span>
									</template>
								</li>
							</ul>
						</div>
					</transition>
					<InlineRatingBar
						v-if="
							submode === 'edit' && !printBlank && !item.isPlaceholder && isCanvasTraitActive(s, item.originalIndex)
						"
						:node="item.trait"
						:parent-set="traitSet"
						:dice-config="getView(character)?.diceConfig"
						:subject-label="item.trait.name || traitSet.noun || 'Trait'"
						show-more
						show-delete
						@change="updateCharacter(character)"
						@close="closeCanvasTrait()"
						@open-more="
							closeCanvasTrait();
							selectElement(['trait', s, item.originalIndex]);
						"
						@delete="
							closeCanvasTrait();
							removeTrait(s, item.originalIndex);
						"
					/>
					<div
						v-if="
							submode === 'edit' && !printBlank && !item.isPlaceholder && isCanvasTraitActive(s, item.originalIndex)
						"
						class="trait-active-part-bar"
						@click.stop
					>
						<button
							type="button"
							class="btn-trait-part-toggle"
							:class="{ active: isTraitPartMenuOpen(s, item.originalIndex) }"
							:aria-expanded="isTraitPartMenuOpen(s, item.originalIndex)"
							@click.stop="toggleTraitPartMenu(s, item.originalIndex, $event.currentTarget as HTMLElement)"
						>
							<i class="fas fa-plus" aria-hidden="true"></i> Part
						</button>
						<div
							v-if="isTraitPartMenuOpen(s, item.originalIndex)"
							class="organic-part-chips trait-inline-part-chips"
							role="group"
							aria-label="Trait parts"
						>
							<button
								v-for="part in TRAIT_QUICK_PARTS"
								:key="part.key"
								type="button"
								class="organic-part-chip"
								:class="{ active: hasTraitPartActive(item.trait, part.key, item.originalIndex) }"
								:aria-pressed="hasTraitPartActive(item.trait, part.key, item.originalIndex)"
								@click.stop="toggleTraitPart(item.trait, part.key, item.originalIndex)"
							>
								<i
									:class="hasTraitPartActive(item.trait, part.key, item.originalIndex) ? 'fas fa-check' : 'fas fa-plus'"
									aria-hidden="true"
								></i>
								{{ part.label }}
							</button>
							<button
								type="button"
								class="organic-part-chip organic-part-chip-more"
								@click.stop="
									closeCanvasTrait();
									selectElement(['trait', s, item.originalIndex]);
								"
							>
								<i class="fas fa-sliders" aria-hidden="true"></i> More
							</button>
						</div>
					</div>
				</div>
			</template>
		</template>
	</div>

	<!-- BUTTON: ADD TRAIT -->
	<transition appear>
		<div
			class="preview-button-container"
			:class="{ 'ring-add-button': traitArrayMode !== 'none' }"
			v-if="
				!props.hideSetActions &&
				(resolvedBorder.shape !== 'line' || showPortraitHub || Boolean(traitSet?.traits?.length)) &&
				(submode === 'edit' || (submode === 'play' && isPlayMutableSet(traitSet)))
			"
		>
			<div class="preview-button-container-inner set-organic-actions">
				<button type="button" class="preview-button" @click.stop="addTrait(s)">
					<span
						><i class="fas fa-plus" aria-hidden="true"></i>
						{{ traitSet.noun && traitSet.noun.length ? traitSet.noun : 'Trait' }}</span
					>
				</button>
			</div>
		</div>
	</transition>
</template>
