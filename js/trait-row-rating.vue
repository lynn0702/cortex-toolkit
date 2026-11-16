<script setup lang="ts">
import { computed } from 'vue';
import { getView, resolveCurrencyLabel } from './model.ts';
import { injectTraitSet } from './use-trait-set.ts';

const props = withDefaults(
	defineProps<{
		item: any;
		inPartsGrid?: boolean;
		placementAbove?: boolean;
	}>(),
	{
		inPartsGrid: false,
		placementAbove: false,
	},
);

const {
	traitSet,
	s,
	submode,
	printBlank,
	character,
	getTraitSetRatings,
	renderDieValueForPrint,
	getRatingPlacement,
	getRatingDisplay,
	handleSingleDieClick,
	handleDieClick,
	handleSteppedDieClick,
	handleOutClick,
	shouldShowOut,
	isTraitOut,
	getTraitDice,
	resolveTraitRating,
	isDieSpent,
	toggleDieSpentInPlay,
	isSpendable,
	firstDie,
	isDieActive,
	isTraitRated,
	getSetRatingDie,
	getTraitSetLabel,
	getTraitPipBubbles,
	toggleTraitPipBubble,
	getAltRoll,
	handleAltRollClick,
	stageTrackDie,
	stepTraitCounter,
	isCanvasTraitActive,
	toggleCanvasTrait,
	isPoolAddOpen,
	togglePoolAdd,
	canMutatePoolOnCanvas,
	getPoolAddRange,
	addDieToPoolTrait,
	removeDieFromPoolTrait,
} = injectTraitSet();

const currencyLabel = computed(() => resolveCurrencyLabel(character.value));

function formatAltRollPpTag(ppDelta: number | undefined | null): string {
	if (!ppDelta) return '';
	const cur = currencyLabel.value;
	if (ppDelta === 1) return `+${cur}`;
	if (ppDelta === -1) return `-${cur}`;
	return (ppDelta > 0 ? '+' : '') + ppDelta + cur;
}

function formatAltRollAriaLabel(tr: any, ts: any): string {
	const alt = getAltRoll(tr, ts);
	const die = alt?.die || 4;
	const tag = formatAltRollPpTag(alt?.ppDelta);
	return tag ? `Take d${die} ${tag}` : `Take d${die}`;
}

function formatAltRollTitle(tr: any, ts: any): string {
	const alt = getAltRoll(tr, ts);
	const die = alt?.die || 4;
	const ppDelta = alt?.ppDelta;
	if (!ppDelta) return `Take d${die}`;
	return `Take d${die} (${ppDelta > 0 ? '+' : ''}${ppDelta} ${currencyLabel.value})`;
}

function canMutateItem(item: any): boolean {
	return !printBlank.value && !item.isPlaceholder;
}

function activateSingleDie(item: any, dieSize: number | null) {
	if (!canMutateItem(item)) return;
	handleSingleDieClick(item.trait, dieSize, traitSet.value, s.value, item.originalIndex);
}

function activateSteppedDie(item: any, size: number) {
	if (!canMutateItem(item)) return;
	handleSteppedDieClick(s.value, item.originalIndex, size);
}

function activateOut(item: any) {
	if (!canMutateItem(item)) return;
	handleOutClick(s.value, item.originalIndex);
}

function activatePoolDie(item: any, dieSize: number, dIdx: number) {
	if (!canMutateItem(item)) return;
	handleDieClick(item.trait, dieSize, dIdx, traitSet.value, s.value, item.originalIndex);
}

function activatePipBubble(trait: any, pIdx: number) {
	if (printBlank.value) return;
	toggleTraitPipBubble(trait, pIdx);
}
</script>

<template>
	<div v-if="!props.placementAbove && getView(traitSet)?.style?.body === 'die-track'" class="trait-value stress-value">
		<span
			v-for="size in getTraitSetRatings(traitSet)"
			:key="size"
			:class="{ active: canMutateItem(item) && isDieActive(item.trait, size) }"
			role="button"
			tabindex="0"
			:aria-label="`Stage d${size} from ${item.trait.name || 'trait'}`"
			:aria-pressed="isDieActive(item.trait, size) ? 'true' : 'false'"
			@click.stop="activateSteppedDie(item, size)"
			@keydown.enter.prevent="activateSteppedDie(item, size)"
			@keydown.space.prevent="activateSteppedDie(item, size)"
			v-html="renderDieValueForPrint(size, canMutateItem(item) && isDieActive(item.trait, size))"
		></span>
		<span
			v-if="shouldShowOut(traitSet)"
			:class="{ 'out-badge': true, active: canMutateItem(item) && isTraitOut(item.trait, traitSet) }"
			role="button"
			tabindex="0"
			:aria-label="`Out for ${item.trait.name || 'trait'}`"
			:aria-pressed="isTraitOut(item.trait, traitSet) ? 'true' : 'false'"
			@click.stop="activateOut(item)"
			@keydown.enter.prevent="activateOut(item)"
			@keydown.space.prevent="activateOut(item)"
			title="Out"
			>{{ getTraitSetLabel(traitSet, 'out') }}</span
		>
		<button
			v-if="submode === 'play' && canMutateItem(item) && firstDie(item.trait) > 0"
			type="button"
			class="btn-stage-stress"
			@click.stop="
				stageTrackDie(item.trait, firstDie(item.trait), item.trait.name || traitSet.noun || 'Trait', traitSet)
			"
			title="Stage die into pool"
			aria-label="Stage die into pool"
		>
			+<i class="fas fa-dice" aria-hidden="true"></i>
		</button>
	</div>

	<div v-else-if="!props.placementAbove && getView(traitSet)?.style?.body === 'list'" class="trait-value"></div>

	<div
		v-else-if="!props.placementAbove && !props.inPartsGrid && !printBlank && getRatingPlacement(traitSet) === 'none'"
		class="trait-value"
	></div>

	<div
		v-else-if="!props.placementAbove && resolveTraitRating(item.trait)?.type === 'Pip'"
		class="trait-value pip-value"
	>
		<span
			v-for="(filled, pIdx) in getTraitPipBubbles(item.trait)"
			:key="pIdx"
			class="pip-bubble"
			:class="{ filled: !printBlank && filled }"
			role="checkbox"
			:tabindex="printBlank ? -1 : 0"
			:aria-checked="filled ? 'true' : 'false'"
			:aria-label="`Pip ${pIdx + 1} of ${item.trait.name || 'trait'}`"
			@click.stop="activatePipBubble(item.trait, pIdx)"
			@keydown.enter.prevent="activatePipBubble(item.trait, pIdx)"
			@keydown.space.prevent="activatePipBubble(item.trait, pIdx)"
		></span>
		<button
			v-if="submode === 'edit' && canMutateItem(item)"
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

	<div
		v-else-if="!props.placementAbove && resolveTraitRating(item.trait)?.type === 'Counter'"
		class="trait-value counter-value"
	>
		<template v-if="(submode === 'play' || submode === 'edit') && canMutateItem(item)">
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
		v-else-if="
			!props.placementAbove &&
			canMutateItem(item) &&
			!resolveTraitRating(item.trait) &&
			!getSetRatingDie(traitSet) &&
			getRatingDisplay(traitSet) === 'rating'
		"
		class="trait-value unrated-value"
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

	<div
		v-else-if="!props.placementAbove && resolveTraitRating(item.trait)?.type === 'Dice'"
		class="trait-value multidie-value"
	>
		<div
			v-for="(dieSize, dIdx) in printBlank || item.isPlaceholder
				? getTraitSetRatings(traitSet)
				: getTraitDice(item.trait)"
			:key="dIdx"
			class="multidie-badge-wrap"
			:class="{ spent: canMutateItem(item) && isDieSpent(item.trait, dIdx) }"
		>
			<span
				:class="{ active: canMutateItem(item) }"
				role="button"
				tabindex="0"
				:aria-label="`Stage d${dieSize} from ${item.trait.name || 'trait'}`"
				:aria-pressed="!isDieSpent(item.trait, dIdx) ? 'true' : 'false'"
				@click.stop="activatePoolDie(item, dieSize, dIdx)"
				@keydown.enter.prevent="activatePoolDie(item, dieSize, dIdx)"
				@keydown.space.prevent="activatePoolDie(item, dieSize, dIdx)"
				:title="submode === 'play' && canMutateItem(item) ? 'Click to add d' + dieSize + ' to roller pool' : ''"
				v-html="renderDieValueForPrint(dieSize, canMutateItem(item))"
			></span>
			<div
				class="die-play-controls"
				v-if="submode === 'play' && canMutateItem(item) && isSpendable(item.trait, traitSet)"
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
					<i :class="isDieSpent(item.trait, dIdx) ? 'fas fa-rotate-left' : 'fas fa-xmark'" aria-hidden="true"></i>
				</button>
			</div>
			<div
				class="die-play-controls"
				v-else-if="
					canMutateItem(item) && canMutatePoolOnCanvas(item.trait, traitSet) && getTraitDice(item.trait).length > 1
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
			v-if="canMutateItem(item) && canMutatePoolOnCanvas(item.trait, traitSet)"
			type="button"
			class="btn-pool-add-die"
			:class="{ active: isPoolAddOpen(item.originalIndex) }"
			:aria-expanded="isPoolAddOpen(item.originalIndex)"
			:aria-label="`Add die to ${item.trait.name || 'pool'}`"
			title="Add die"
			@click.stop="togglePoolAdd(item.originalIndex)"
		>
			<i :class="isPoolAddOpen(item.originalIndex) ? 'fas fa-times' : 'fas fa-plus'" aria-hidden="true"></i>
		</button>
		<div
			v-if="canMutateItem(item) && canMutatePoolOnCanvas(item.trait, traitSet) && isPoolAddOpen(item.originalIndex)"
			class="pool-add-picker"
			role="group"
			:aria-label="`Add die size to ${item.trait.name || 'pool'}`"
			@click.stop
		>
			<button
				v-for="addSize in getPoolAddRange(item.trait, traitSet)"
				:key="'pool-add-' + addSize"
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
				!props.placementAbove &&
				canMutateItem(item) &&
				getRatingDisplay(traitSet) === 'rating' &&
				isTraitOut(item.trait, traitSet),
			'has-hinder-pill':
				!props.placementAbove && submode === 'play' && canMutateItem(item) && Boolean(getAltRoll(item.trait, traitSet)),
		}"
		@click.stop="
			!props.placementAbove && submode === 'play' && canMutateItem(item)
				? activateSingleDie(item, firstDie(item.trait))
				: null
		"
	>
		<template v-if="(props.placementAbove || !printBlank) && getRatingDisplay(traitSet) === 'rating'">
			<span
				v-if="!props.placementAbove && !item.isPlaceholder && isTraitOut(item.trait, traitSet)"
				class="out-badge active"
				role="button"
				tabindex="0"
				:aria-label="`Out for ${item.trait.name || 'trait'}`"
				aria-pressed="true"
				@click.stop="activateSingleDie(item, null)"
				@keydown.enter.prevent="activateSingleDie(item, null)"
				@keydown.space.prevent="activateSingleDie(item, null)"
				title="Out"
				>{{ getTraitSetLabel(traitSet, 'out') }}</span
			>
			<span
				v-else
				:class="{ active: canMutateItem(item) && Boolean(firstDie(item.trait)) }"
				role="button"
				tabindex="0"
				:aria-label="`Stage d${firstDie(item.trait) || getSetRatingDie(traitSet) || 4} from ${item.trait.name || 'trait'}`"
				:aria-pressed="canMutateItem(item) && Boolean(firstDie(item.trait)) ? 'true' : 'false'"
				@click.stop="activateSingleDie(item, firstDie(item.trait) || getSetRatingDie(traitSet) || 4)"
				@keydown.enter.prevent="activateSingleDie(item, firstDie(item.trait) || getSetRatingDie(traitSet) || 4)"
				@keydown.space.prevent="activateSingleDie(item, firstDie(item.trait) || getSetRatingDie(traitSet) || 4)"
				v-html="
					renderDieValueForPrint(
						firstDie(item.trait) || getSetRatingDie(traitSet) || 4,
						canMutateItem(item) && Boolean(firstDie(item.trait)),
					)
				"
			></span>
		</template>
		<template v-else>
			<span
				v-for="size in getTraitSetRatings(traitSet)"
				:key="size"
				:class="{ active: canMutateItem(item) && isDieActive(item.trait, size) }"
				role="button"
				tabindex="0"
				:aria-label="`Stage d${size} from ${item.trait.name || 'trait'}`"
				:aria-pressed="isDieActive(item.trait, size) ? 'true' : 'false'"
				@click.stop="activateSingleDie(item, size)"
				@keydown.enter.prevent="activateSingleDie(item, size)"
				@keydown.space.prevent="activateSingleDie(item, size)"
				v-html="renderDieValueForPrint(size, canMutateItem(item) && isDieActive(item.trait, size))"
			></span>
		</template>
		<button
			v-if="
				!props.placementAbove &&
				submode === 'play' &&
				canMutateItem(item) &&
				!isTraitOut(item.trait, traitSet) &&
				getAltRoll(item.trait, traitSet)
			"
			type="button"
			class="btn-hinder-pill"
			@click.stop="handleAltRollClick(item.trait, traitSet)"
			:title="formatAltRollTitle(item.trait, traitSet)"
			:aria-label="formatAltRollAriaLabel(item.trait, traitSet)"
		>
			<span aria-hidden="true">d{{ getAltRoll(item.trait, traitSet)?.die || 4 }}</span
			><span v-if="getAltRoll(item.trait, traitSet)?.ppDelta" class="hinder-pp-tag" aria-hidden="true">{{
				formatAltRollPpTag(getAltRoll(item.trait, traitSet)?.ppDelta)
			}}</span>
		</button>
		<span
			v-if="
				!props.placementAbove &&
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
			v-if="!props.placementAbove && (printBlank || getRatingDisplay(traitSet) !== 'rating') && shouldShowOut(traitSet)"
			:class="{ 'out-badge': true, active: canMutateItem(item) && isTraitOut(item.trait, traitSet) }"
			role="button"
			tabindex="0"
			:aria-label="`Out for ${item.trait.name || 'trait'}`"
			:aria-pressed="isTraitOut(item.trait, traitSet) ? 'true' : 'false'"
			@click.stop="activateOut(item)"
			@keydown.enter.prevent="activateOut(item)"
			@keydown.space.prevent="activateOut(item)"
			title="Out"
			>{{ getTraitSetLabel(traitSet, 'out') }}</span
		>
	</div>
</template>
