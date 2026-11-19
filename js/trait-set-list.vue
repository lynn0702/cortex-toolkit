<script setup lang="ts">
import { getView, type Trait } from './model.ts';
import { characterCurioFunctions } from './functions.ts';
import { injectTraitSet } from './use-trait-set.ts';
import TraitSetPips from './trait-set-pips.vue';
import InlineRatingBar from './inline-rating-bar.vue';
import TraitRowTitle from './trait-row-title.vue';
import TraitRowRating from './trait-row-rating.vue';
import TraitRowPart from './trait-row-part.vue';

const props = withDefaults(defineProps<{ hideSetActions?: boolean }>(), {
	hideSetActions: false,
});

const {
	traitSet,
	s,
	submode,
	printBlank,
	character,
	isSelected,
	selectElement,
	updateCharacter,
	removeTrait,
	addTrait,
	getRenderedTraits,
	getTraitClasses,
	renderDieValueForPrint,
	getRatingPlacement,
	isTraitOut,
	isChildPipFilled,
	isDieActive,
	firstDie,
	resolveTraitRating,
	getPipChild,
	hasTrackPart,
	hasChildPartCell,
	partsGridFor,
	partCellStyle,
	partsGridStyle,
	isPartsInline,
	getTraitPipBubbles,
	toggleTraitPipBubble,
	getDynamicChildParts,
	parseChildPartKey,
	isPipChildPart,
	getChildTraitByNoun,
	isPlayMutableSet,
	isTraitPartMenuOpen,
	toggleTraitPartMenu,
	hasTraitPartActive,
	toggleTraitPart,
	isCanvasTraitActive,
	closeCanvasTrait,
	resolvedBorder,
	traitArrayMode,
	showPortraitHub,
} = injectTraitSet();

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

function childTraitFor(trait: Trait | null | undefined, partKey: string) {
	return getChildTraitByNoun(trait ?? undefined, parseChildPartKey(partKey).noun);
}

function childRatingFor(trait: Trait | null | undefined, partKey: string) {
	return resolveTraitRating(childTraitFor(trait, partKey), [trait]);
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
							<!-- NAME -->
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
									<TraitRowTitle :item="item" in-parts-grid />
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
								<TraitRowRating :item="item" in-parts-grid />
							</div>

							<!-- TRACK LABEL -->
							<div
								v-if="partsGridFor(traitSet)?.cells.trackLabel"
								class="trait-part trait-part-track-label"
								:style="partCellStyle(partsGridFor(traitSet), 'trackLabel')"
							>
								<TraitRowPart :item="item" part="track-label" in-parts-grid />
							</div>

							<!-- TRACK CELLS -->
							<div
								v-if="partsGridFor(traitSet)?.cells.track"
								class="trait-part trait-part-track"
								:style="
									partCellStyle(partsGridFor(traitSet), 'track') +
									'; --track-faces: ' +
									characterCurioFunctions.getTrackScale(traitSet).length
								"
							>
								<TraitRowPart :item="item" part="track" in-parts-grid />
							</div>

							<!-- DESCRIPTION -->
							<div
								v-if="partsGridFor(traitSet)?.cells.description"
								class="trait-part trait-part-description"
								:style="partCellStyle(partsGridFor(traitSet), 'description')"
							>
								<TraitRowPart :item="item" part="description" in-parts-grid />
							</div>

							<!-- BADGE -->
							<div
								v-if="partsGridFor(traitSet)?.cells.badge && getView(item.trait)?.badge"
								class="trait-part trait-part-badge"
								:style="partCellStyle(partsGridFor(traitSet), 'badge')"
							>
								<TraitRowPart :item="item" part="badge" in-parts-grid />
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
								<TraitRowPart :item="item" part="block" in-parts-grid />
							</div>

							<!-- SUBTRAITS -->
							<div
								v-if="partsGridFor(traitSet)?.cells.subtraits"
								class="trait-part trait-part-subtraits"
								:style="partCellStyle(partsGridFor(traitSet), 'subtraits')"
							>
								<TraitRowPart :item="item" part="subtraits" in-parts-grid />
							</div>

							<!-- DYNAMIC CHILD TRAIT PARTS -->
							<template v-for="partKey in getDynamicChildParts(traitSet)" :key="partKey">
								<div
									v-if="partsGridFor(traitSet)?.cells[partKey]"
									:class="'trait-part trait-part-' + partKey.replace(/[^a-zA-Z0-9_-]/g, '-')"
									:style="partCellStyle(partsGridFor(traitSet), partKey)"
								>
									<template v-if="parseChildPartKey(partKey).kind === 'label'">
										<TraitRowTitle v-if="isPipChildPart(partKey)" :item="item" mode="pip-box" in-parts-grid />
										<template v-else>
											<span class="child-part-label" v-if="getView(traitSet)?.parts?.[partKey]?.marker === 'L'">
												{{ childTraitFor(item.trait, partKey)?.name || parseChildPartKey(partKey).noun }}
											</span>
											<span class="child-part-text" v-else>
												{{
													childTraitFor(item.trait, partKey)?.description ||
													childTraitFor(item.trait, partKey)?.name ||
													''
												}}
											</span>
										</template>
									</template>
									<template v-else-if="parseChildPartKey(partKey).kind === 'rating'">
										<TraitRowTitle v-if="isPipChildPart(partKey)" :item="item" mode="pip-checkbox" in-parts-grid />
										<div class="trait-value child-part-value" v-else>
											<template v-if="childRatingFor(item.trait, partKey)?.type === 'Pip'">
												<span
													v-for="(filled, pIdx) in getTraitPipBubbles(childTraitFor(item.trait, partKey))"
													:key="pIdx"
													class="pip-bubble"
													:class="{ filled: !printBlank && filled }"
													role="checkbox"
													:aria-checked="filled ? 'true' : 'false'"
													@click.stop="toggleTraitPipBubble(childTraitFor(item.trait, partKey), pIdx)"
												></span>
											</template>
											<template v-else-if="childRatingFor(item.trait, partKey)?.type === 'Die'">
												<span
													v-for="size in childRatingFor(item.trait, partKey)?.range || [4, 6, 8, 10, 12]"
													:key="size"
													:class="{
														active: !printBlank && isDieActive(childTraitFor(item.trait, partKey)!, size),
													}"
													v-html="
														renderDieValueForPrint(
															size,
															!printBlank && isDieActive(childTraitFor(item.trait, partKey)!, size),
														)
													"
												></span>
											</template>
											<template v-else-if="childRatingFor(item.trait, partKey)?.type === 'Dice'">
												<div
													v-for="(dieSize, dIdx) in childRatingFor(item.trait, partKey)?.value || []"
													:key="dIdx"
													class="multidie-badge-wrap"
												>
													<span
														class="active"
														v-html="renderDieValueForPrint(Number(dieSize) || 6, !printBlank)"
													></span>
												</div>
											</template>
											<template v-else-if="childRatingFor(item.trait, partKey)?.type === 'Counter'">
												<span class="counter-display">{{ childRatingFor(item.trait, partKey)?.value?.[0] ?? 0 }}</span>
											</template>
										</div>
									</template>
								</div>
							</template>
						</div>

						<!-- FLEX LAYOUT (non-parts fallback) -->
						<div
							v-else
							:class="{
								'trait-inner': true,
								selected: !item.isPlaceholder && isSelected(['trait', s, item.originalIndex]),
								'trait-placeholder-slot': item.isPlaceholder,
							}"
						>
							<div v-if="getRatingPlacement(traitSet) === 'above'" class="trait-asset-card">
								<TraitRowRating :item="item" placement-above />
								<TraitRowTitle :item="item" mode="asset" />
							</div>

							<template v-else>
								<div
									class="trait-title"
									:class="{
										'trait-title-pip': Boolean(getPipChild(item.trait)),
										'trait-title-stacked': getRatingPlacement(traitSet) === 'below',
									}"
								>
									<span class="list-bullet" v-if="getView(traitSet)?.style?.body === 'list'">•</span>
									<TraitRowTitle :item="item" />
									<TraitRowRating :item="item" />
								</div>
								<TraitRowPart :item="item" part="description" />
							</template>

							<TraitRowPart :item="item" part="subtraits" />

							<div class="attached-stress-block" v-if="hasTrackPart(traitSet)">
								<div class="attached-stress-divider"></div>
								<div class="attached-stress-header">
									<TraitRowPart :item="item" part="track-label" />
								</div>
								<TraitRowPart :item="item" part="track" />
							</div>

							<span v-if="getView(item.trait)?.badge" class="trait-part trait-part-badge trait-part-badge-fallback">
								<TraitRowPart :item="item" part="badge" />
							</span>

							<TraitRowPart :item="item" part="block" />
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
							if (item.originalIndex !== null) removeTrait(s, item.originalIndex);
						"
					/>
					<div
						v-if="submode === 'edit' && !printBlank && !item.isPlaceholder"
						class="trait-active-part-bar"
						@click.stop
					>
						<button
							type="button"
							class="btn-trait-part-toggle"
							:class="{ active: isTraitPartMenuOpen(s, item.originalIndex) }"
							:aria-expanded="isTraitPartMenuOpen(s, item.originalIndex)"
							:aria-label="
								'Part options for ' +
								(item.trait.name || (traitSet.noun || 'Trait') + ' ' + ((item.originalIndex ?? 0) + 1))
							"
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
