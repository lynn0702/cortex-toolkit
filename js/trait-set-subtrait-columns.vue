<script setup lang="ts">
import { computed } from 'vue';
import { getView } from './model.ts';
import { injectTraitSet, type BranchSubEntry, type RenderedTraitItem } from './use-trait-set.ts';
import { resolveBranchShares } from './use-trait-set-editor.ts';

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
	handleSingleDieClick,
	getTraitSetLabel,
	getSetRatingDie,
	firstDie,
	isDieActive,
	isTraitRated,
	getBranchGroups,
	branchSubs,
	hasBranchSplit,
	hasBranchFlank,
	getFlankColumns,
	handleBranchFlatClick,
	isFixedSystemTrait,
} = injectTraitSet();

const renderedTraits = computed(() => getRenderedTraits(traitSet.value, s.value));
const isTopHeader = computed(() => getView(traitSet.value)?.header === 'top');
const isFlank = computed(() => hasBranchFlank(traitSet.value, renderedTraits.value));
const isSplit = computed(() => hasBranchSplit(traitSet.value, renderedTraits.value));
const flankCols = computed(() => getFlankColumns(traitSet.value, renderedTraits.value));
const subtraitRatings = computed(() => getSubtraitRatings(traitSet.value));

function isFilledSubEntry(entry: BranchSubEntry | null | undefined): boolean {
	const t = entry?.kind === 'sub' ? entry.sub : entry?.item?.trait;
	if (!t) return false;
	return Boolean((t.name && String(t.name).trim()) || isTraitRated(t));
}

const flankCenterEntries = computed(() =>
	printBlank.value ? [] : (flankCols.value.center || []).filter(isFilledSubEntry),
);

const flankBlankSlotCount = computed(() => {
	if (submode.value !== 'print' && !printBlank.value) return 0;
	const rowCount = Math.max(flankCols.value.left.length, flankCols.value.right.length);
	return Math.max(0, rowCount - flankCenterEntries.value.length);
});

// Stored branch column shares (view.branch), from the section miniature.
// Absent means the CSS default (1.4 / 1 / 1.4); flank rows keep theirs.
const branchGridStyle = computed(() => {
	const shares = resolveBranchShares(getView(traitSet.value)?.branch);
	if (!shares) return '';
	return (
		'--branch-split-left: minmax(0, ' +
		shares.left +
		'fr); --branch-split-center: minmax(0, ' +
		shares.center +
		'fr); --branch-split-right: minmax(0, ' +
		shares.right +
		'fr);'
	);
});

function showTraitName(item: RenderedTraitItem | null | undefined): boolean {
	if (!item || item.isPlaceholder || !item.trait?.name) return false;
	return !printBlank.value || isFixedSystemTrait(traitSet.value, item.trait);
}

function visibleSideEntries(entries: BranchSubEntry[] | null | undefined): BranchSubEntry[] {
	if (printBlank.value) return [];
	const list = entries || [];
	if (submode.value === 'print') {
		return list.filter(isFilledSubEntry);
	}
	return list;
}

function showBlankSlotForSide(entries: BranchSubEntry[] | null | undefined): boolean {
	if (visibleSideEntries(entries).length > 0) return false;
	return submode.value === 'print' || Boolean(printBlank.value);
}

function connectedSubCount(entries: BranchSubEntry[] | null | undefined): number {
	if (printBlank.value) return 0;
	return (entries || []).filter(isFilledSubEntry).length;
}

function connClass(entries: BranchSubEntry[] | null | undefined): string {
	const n = connectedSubCount(entries);
	if (n <= 0) return 'branch-conn-none';
	return n === 1 ? 'branch-conn-single' : 'branch-conn-multi';
}

function sideCountClass(entries: BranchSubEntry[] | null | undefined): string {
	const n = connectedSubCount(entries);
	if (n <= 0) return 'branch-side-none';
	return n === 1 ? 'branch-side-single' : 'branch-side-multi';
}
</script>

<template>
	<div class="trait-subtrait-columns" v-if="getView(traitSet)?.style?.body === 'subtrait-columns'">
		<!-- FLANK LAYOUT: parent traits in the outer columns, subtraits down the middle -->
		<template v-if="isFlank">
			<div
				class="branch-head branch-flank-head"
				:class="{ 'branch-top-head': isTopHeader }"
				:role="isTopHeader ? 'button' : undefined"
				:tabindex="isTopHeader ? 0 : undefined"
				@click.stop="isTopHeader ? selectElement(['traitSet', s]) : null"
				@keydown.enter.prevent="isTopHeader ? selectElement(['traitSet', s]) : null"
				@keydown.space.prevent="isTopHeader ? selectElement(['traitSet', s]) : null"
				:title="isTopHeader ? traitSet.name + ' — click to edit section' : ''"
			>
				<span class="branch-head-col">{{ getTraitSetLabel(traitSet, 'left') }}</span
				><span class="branch-head-col branch-head-center"
					>{{ getTraitSetLabel(traitSet, 'center') || getTraitSetLabel(traitSet, 'right')
					}}<span
						v-if="subtraitRatings.length === 1"
						class="set-rating-die"
						v-html="renderDieValueForPrint(subtraitRatings[0], true)"
					></span></span
				><span class="branch-head-col">{{ getTraitSetLabel(traitSet, 'left') }}</span>
			</div>
			<div class="branch-flank-grid">
				<div class="branch-flank-col branch-flank-col-left">
					<template v-for="(group, gi) in flankCols.left" :key="'flankl-' + gi">
						<div
							v-if="group.traitItem"
							:class="group.traitItem ? getTraitClasses(group.traitItem.trait) : {}"
							:data-trait-name="group.traitItem.trait.name || undefined"
							:data-trait-rating="firstDie(group.traitItem.trait) ? 'd' + firstDie(group.traitItem.trait) : undefined"
						>
							<div
								:class="{
									'trait-inner': true,
									selected: !group.traitItem.isPlaceholder && isSelected(['trait', s, group.traitItem.originalIndex]),
									'trait-placeholder-slot': group.traitItem.isPlaceholder,
								}"
							>
								<div
									class="branch-main"
									@click="
										submode === 'play' &&
										!printBlank &&
										!group.traitItem.isPlaceholder &&
										!isTraitRated(group.traitItem.trait) &&
										getSetRatingDie(traitSet)
											? handleSingleDieClick(
													group.traitItem.trait,
													getSetRatingDie(traitSet),
													traitSet,
													s,
													group.traitItem.originalIndex,
												)
											: null
									"
								>
									<button
										type="button"
										class="trait-title-btn branch-name-btn"
										:aria-label="
											!group.traitItem.isPlaceholder && group.traitItem.trait.name
												? group.traitItem.trait.name + (submode === 'play' ? ' options' : ' edit')
												: (traitSet.noun || 'Name') + ' edit'
										"
										@click.stop="openTraitAt(s, group.traitItem)"
									>
										<span class="trait-name" v-if="showTraitName(group.traitItem)">{{
											group.traitItem.trait.name
										}}</span>
										<span class="trait-name trait-name-blank" v-else>
											<template v-if="submode === 'edit' && !printBlank && !group.traitItem.trait.name">
												<span class="trait-name-hint">{{ traitSet.noun || 'Name' }}...</span>
											</template>
											<template v-else>
												<span class="trait-blank-line"></span>
											</template>
										</span>
									</button>
									<span
										class="branch-leader"
										aria-hidden="true"
										v-if="isTraitRated(group.traitItem.trait) || !getSetRatingDie(traitSet)"
									></span>
									<div
										class="trait-value single-die-value"
										v-if="isTraitRated(group.traitItem.trait) || !getSetRatingDie(traitSet)"
										@click.stop="
											!printBlank && !group.traitItem.isPlaceholder
												? handleSingleDieClick(
														group.traitItem.trait,
														firstDie(group.traitItem.trait) || getSetRatingDie(traitSet),
														traitSet,
														s,
														group.traitItem.originalIndex,
													)
												: null
										"
									>
										<span
											v-for="size in getTraitSetRatings(traitSet)"
											:key="size"
											:class="{
												active:
													!printBlank && !group.traitItem.isPlaceholder && isDieActive(group.traitItem.trait, size),
											}"
											role="button"
											tabindex="0"
											:aria-label="`Stage d${size} from ${group.traitItem.trait.name || (traitSet.noun || 'trait').toLowerCase()}`"
											:aria-pressed="isDieActive(group.traitItem.trait, size) ? 'true' : 'false'"
											@click.stop="
												!printBlank && !group.traitItem.isPlaceholder
													? handleSingleDieClick(
															group.traitItem.trait,
															size,
															traitSet,
															s,
															group.traitItem.originalIndex,
														)
													: null
											"
											@keydown.enter.prevent="
												!printBlank && !group.traitItem.isPlaceholder
													? handleSingleDieClick(
															group.traitItem.trait,
															size,
															traitSet,
															s,
															group.traitItem.originalIndex,
														)
													: null
											"
											@keydown.space.prevent="
												!printBlank && !group.traitItem.isPlaceholder
													? handleSingleDieClick(
															group.traitItem.trait,
															size,
															traitSet,
															s,
															group.traitItem.originalIndex,
														)
													: null
											"
											v-html="
												renderDieValueForPrint(
													size,
													!printBlank && !group.traitItem.isPlaceholder && isDieActive(group.traitItem.trait, size),
												)
											"
										></span>
									</div>
								</div>
							</div>
						</div>
					</template>
				</div>
				<div class="branch-flank-center">
					<template v-for="(entry, ei) in flankCenterEntries" :key="entry._lid || 'flankc-' + ei">
						<div
							class="branch-slot"
							v-if="entry.kind === 'sub' && entry.traitIndex !== null && entry.traitIndex !== undefined"
							role="button"
							tabindex="0"
							:aria-label="`Stage d${firstDie(entry.sub)} from ${entry.sub.name || 'subtrait'}`"
							@click.stop="
								!printBlank && !entry.traitItem?.isPlaceholder
									? handleSingleDieClick(entry.sub, firstDie(entry.sub), traitSet, s, entry.traitIndex)
									: null
							"
							@keydown.enter.prevent="
								!printBlank && !entry.traitItem?.isPlaceholder
									? handleSingleDieClick(entry.sub, firstDie(entry.sub), traitSet, s, entry.traitIndex)
									: null
							"
							@keydown.space.prevent="
								!printBlank && !entry.traitItem?.isPlaceholder
									? handleSingleDieClick(entry.sub, firstDie(entry.sub), traitSet, s, entry.traitIndex)
									: null
							"
						>
							<span class="subtrait-name" v-if="!printBlank && entry.sub.name">{{ entry.sub.name }}</span>
							<span class="subtrait-name" v-else><span class="trait-blank-line subtrait-blank-line"></span></span>
							<div class="subtrait-value" v-if="subtraitRatings.length > 1">
								<span
									v-for="size in subtraitRatings"
									:key="size"
									:class="{ active: !printBlank && isDieActive(entry.sub, size) }"
									v-html="renderDieValueForPrint(size, !printBlank && isDieActive(entry.sub, size))"
								></span>
							</div>
						</div>
						<div
							class="branch-slot"
							v-if="entry.kind === 'flat'"
							role="button"
							tabindex="0"
							:aria-label="`Stage d${firstDie(entry.item.trait)} from ${entry.item.trait.name || 'trait'}`"
							@click.stop="!printBlank ? handleBranchFlatClick(s, entry.item.originalIndex, entry.item.trait) : null"
							@keydown.enter.prevent="
								!printBlank ? handleBranchFlatClick(s, entry.item.originalIndex, entry.item.trait) : null
							"
							@keydown.space.prevent="
								!printBlank ? handleBranchFlatClick(s, entry.item.originalIndex, entry.item.trait) : null
							"
						>
							<span class="subtrait-name" v-if="!printBlank && entry.item.trait.name">{{ entry.item.trait.name }}</span>
							<span class="subtrait-name" v-else><span class="trait-blank-line subtrait-blank-line"></span></span>
							<div class="subtrait-value" v-if="getTraitSetRatings(traitSet).length">
								<span
									v-for="size in getTraitSetRatings(traitSet)"
									:key="size"
									:class="{ active: !printBlank && isDieActive(entry.item.trait, size) }"
									v-html="renderDieValueForPrint(size, !printBlank && isDieActive(entry.item.trait, size))"
								></span>
							</div>
						</div>
					</template>
					<div class="branch-slot branch-slot-blank" v-for="bi in flankBlankSlotCount" :key="'flankb-' + bi">
						<span class="subtrait-name"><span class="trait-blank-line subtrait-blank-line"></span></span>
						<div class="subtrait-value" v-if="subtraitRatings.length > 1">
							<span v-for="size in subtraitRatings" :key="size" v-html="renderDieValueForPrint(size, false)"></span>
						</div>
					</div>
					<div class="branch-slot-empty" v-if="!flankCenterEntries.length && !printBlank && submode === 'edit'">
						Select a {{ (traitSet.noun || 'trait').toLowerCase() }} to add subtraits
					</div>
				</div>
				<div class="branch-flank-col branch-flank-col-right">
					<template v-for="(group, gi) in flankCols.right" :key="'flankr-' + gi">
						<div
							v-if="group.traitItem"
							:class="group.traitItem ? getTraitClasses(group.traitItem.trait) : {}"
							:data-trait-name="group.traitItem.trait.name || undefined"
							:data-trait-rating="firstDie(group.traitItem.trait) ? 'd' + firstDie(group.traitItem.trait) : undefined"
						>
							<div
								:class="{
									'trait-inner': true,
									selected: !group.traitItem.isPlaceholder && isSelected(['trait', s, group.traitItem.originalIndex]),
									'trait-placeholder-slot': group.traitItem.isPlaceholder,
								}"
							>
								<div
									class="branch-main"
									@click="
										submode === 'play' &&
										!printBlank &&
										!group.traitItem.isPlaceholder &&
										!isTraitRated(group.traitItem.trait) &&
										getSetRatingDie(traitSet)
											? handleSingleDieClick(
													group.traitItem.trait,
													getSetRatingDie(traitSet),
													traitSet,
													s,
													group.traitItem.originalIndex,
												)
											: null
									"
								>
									<button
										type="button"
										class="trait-title-btn branch-name-btn"
										:aria-label="
											!group.traitItem.isPlaceholder && group.traitItem.trait.name
												? group.traitItem.trait.name + (submode === 'play' ? ' options' : ' edit')
												: (traitSet.noun || 'Name') + ' edit'
										"
										@click.stop="openTraitAt(s, group.traitItem)"
									>
										<span class="trait-name" v-if="showTraitName(group.traitItem)">{{
											group.traitItem.trait.name
										}}</span>
										<span class="trait-name trait-name-blank" v-else>
											<template v-if="submode === 'edit' && !printBlank && !group.traitItem.trait.name">
												<span class="trait-name-hint">{{ traitSet.noun || 'Name' }}...</span>
											</template>
											<template v-else>
												<span class="trait-blank-line"></span>
											</template>
										</span>
									</button>
									<span
										class="branch-leader"
										aria-hidden="true"
										v-if="isTraitRated(group.traitItem.trait) || !getSetRatingDie(traitSet)"
									></span>
									<div
										class="trait-value single-die-value"
										v-if="isTraitRated(group.traitItem.trait) || !getSetRatingDie(traitSet)"
										@click.stop="
											!printBlank && !group.traitItem.isPlaceholder
												? handleSingleDieClick(
														group.traitItem.trait,
														firstDie(group.traitItem.trait) || getSetRatingDie(traitSet),
														traitSet,
														s,
														group.traitItem.originalIndex,
													)
												: null
										"
									>
										<span
											v-for="size in getTraitSetRatings(traitSet)"
											:key="size"
											:class="{
												active:
													!printBlank && !group.traitItem.isPlaceholder && isDieActive(group.traitItem.trait, size),
											}"
											role="button"
											tabindex="0"
											:aria-label="`Stage d${size} from ${group.traitItem.trait.name || (traitSet.noun || 'trait').toLowerCase()}`"
											:aria-pressed="isDieActive(group.traitItem.trait, size) ? 'true' : 'false'"
											@click.stop="
												!printBlank && !group.traitItem.isPlaceholder
													? handleSingleDieClick(
															group.traitItem.trait,
															size,
															traitSet,
															s,
															group.traitItem.originalIndex,
														)
													: null
											"
											@keydown.enter.prevent="
												!printBlank && !group.traitItem.isPlaceholder
													? handleSingleDieClick(
															group.traitItem.trait,
															size,
															traitSet,
															s,
															group.traitItem.originalIndex,
														)
													: null
											"
											@keydown.space.prevent="
												!printBlank && !group.traitItem.isPlaceholder
													? handleSingleDieClick(
															group.traitItem.trait,
															size,
															traitSet,
															s,
															group.traitItem.originalIndex,
														)
													: null
											"
											v-html="
												renderDieValueForPrint(
													size,
													!printBlank && !group.traitItem.isPlaceholder && isDieActive(group.traitItem.trait, size),
												)
											"
										></span>
									</div>
								</div>
							</div>
						</div>
					</template>
				</div>
			</div>
		</template>
		<template v-else>
			<div
				class="branch-head"
				:class="{ 'branch-split-head': isSplit, 'branch-top-head': isTopHeader }"
				:style="isSplit ? branchGridStyle : ''"
				:role="isSplit || isTopHeader ? 'button' : undefined"
				:tabindex="isSplit || isTopHeader ? 0 : undefined"
				@click.stop="isSplit || isTopHeader ? selectElement(['traitSet', s]) : null"
				@keydown.enter.prevent="isSplit || isTopHeader ? selectElement(['traitSet', s]) : null"
				@keydown.space.prevent="isSplit || isTopHeader ? selectElement(['traitSet', s]) : null"
				:title="isSplit || isTopHeader ? traitSet.name + ' — click to edit section' : ''"
			>
				<template v-if="isSplit"
					><span class="branch-head-col">{{ getTraitSetLabel(traitSet, 'left') }}</span
					><span class="branch-head-gutter" aria-hidden="true"></span
					><span class="branch-head-col branch-head-center"
						>{{ getTraitSetLabel(traitSet, 'center')
						}}<span
							v-if="getSetRatingDie(traitSet)"
							class="set-rating-die"
							v-html="renderDieValueForPrint(getSetRatingDie(traitSet), true)"
						></span></span
					><span class="branch-head-gutter" aria-hidden="true"></span
					><span class="branch-head-col">{{ getTraitSetLabel(traitSet, 'right') }}</span></template
				>
				<template v-else
					><span class="branch-head-col">{{ getTraitSetLabel(traitSet, 'left') }}</span
					><span class="branch-head-gutter" aria-hidden="true"></span
					><span class="branch-head-col">{{ getTraitSetLabel(traitSet, 'right') }}</span></template
				>
			</div>
			<template v-for="(group, gi) in getBranchGroups(traitSet, renderedTraits)" :key="gi">
				<div
					v-if="group.traitItem"
					:class="group.traitItem ? getTraitClasses(group.traitItem.trait) : {}"
					:data-trait-name="group.traitItem.trait.name || undefined"
					:data-trait-rating="firstDie(group.traitItem.trait) ? 'd' + firstDie(group.traitItem.trait) : undefined"
				>
					<div
						:class="{
							'trait-inner': true,
							selected: !group.traitItem.isPlaceholder && isSelected(['trait', s, group.traitItem.originalIndex]),
							'trait-placeholder-slot': group.traitItem.isPlaceholder,
						}"
					>
						<div
							class="branch-row"
							:class="{
								'branch-split-row': group.split,
								'branch-row-single': !group.split && connectedSubCount(group.subs) === 1,
							}"
							:style="group.split ? branchGridStyle : ''"
						>
							<div
								class="branch-side branch-left"
								:class="sideCountClass(branchSubs(group.subs, 'left'))"
								v-if="group.split"
							>
								<template
									v-for="(entry, ei) in visibleSideEntries(branchSubs(group.subs, 'left'))"
									:key="entry._lid || 'subl-' + ei"
								>
									<div
										class="branch-slot"
										v-if="entry.kind === 'sub'"
										role="button"
										tabindex="0"
										:aria-label="`Stage d${firstDie(entry.sub)} from ${entry.sub.name || 'subtrait'}`"
										@click.stop="
											!printBlank && !group.traitItem.isPlaceholder
												? handleSingleDieClick(
														entry.sub,
														firstDie(entry.sub),
														traitSet,
														s,
														group.traitItem.originalIndex,
													)
												: null
										"
										@keydown.enter.prevent="
											!printBlank && !group.traitItem.isPlaceholder
												? handleSingleDieClick(
														entry.sub,
														firstDie(entry.sub),
														traitSet,
														s,
														group.traitItem.originalIndex,
													)
												: null
										"
										@keydown.space.prevent="
											!printBlank && !group.traitItem.isPlaceholder
												? handleSingleDieClick(
														entry.sub,
														firstDie(entry.sub),
														traitSet,
														s,
														group.traitItem.originalIndex,
													)
												: null
										"
									>
										<span v-if="isFilledSubEntry(entry)" class="branch-slot-conn" aria-hidden="true"></span>
										<span class="subtrait-name" v-if="!printBlank && entry.sub.name">{{ entry.sub.name }}</span>
										<span class="subtrait-name" v-else><span class="trait-blank-line subtrait-blank-line"></span></span>
										<div class="subtrait-value" v-if="subtraitRatings.length">
											<span
												v-for="size in subtraitRatings"
												:key="size"
												:class="{ active: !printBlank && isDieActive(entry.sub, size) }"
												v-html="renderDieValueForPrint(size, !printBlank && isDieActive(entry.sub, size))"
											></span>
										</div>
									</div>
									<div
										class="branch-slot"
										v-if="entry.kind === 'flat'"
										role="button"
										tabindex="0"
										:aria-label="`Stage d${firstDie(entry.item.trait)} from ${entry.item.trait.name || 'trait'}`"
										@click.stop="
											!printBlank ? handleBranchFlatClick(s, entry.item.originalIndex, entry.item.trait) : null
										"
										@keydown.enter.prevent="
											!printBlank ? handleBranchFlatClick(s, entry.item.originalIndex, entry.item.trait) : null
										"
										@keydown.space.prevent="
											!printBlank ? handleBranchFlatClick(s, entry.item.originalIndex, entry.item.trait) : null
										"
									>
										<span v-if="isFilledSubEntry(entry)" class="branch-slot-conn" aria-hidden="true"></span>
										<span class="subtrait-name" v-if="!printBlank && entry.item.trait.name">{{
											entry.item.trait.name
										}}</span>
										<span class="subtrait-name" v-else><span class="trait-blank-line subtrait-blank-line"></span></span>
										<div class="subtrait-value" v-if="getTraitSetRatings(traitSet).length">
											<span
												v-for="size in getTraitSetRatings(traitSet)"
												:key="size"
												:class="{ active: !printBlank && isDieActive(entry.item.trait, size) }"
												v-html="renderDieValueForPrint(size, !printBlank && isDieActive(entry.item.trait, size))"
											></span>
										</div>
									</div>
								</template>
								<div class="branch-slot branch-slot-blank" v-if="showBlankSlotForSide(branchSubs(group.subs, 'left'))">
									<span class="subtrait-name"><span class="trait-blank-line subtrait-blank-line"></span></span>
									<div class="subtrait-value" v-if="subtraitRatings.length">
										<span
											v-for="size in subtraitRatings"
											:key="size"
											v-html="renderDieValueForPrint(size, false)"
										></span>
									</div>
								</div>
								<div
									class="branch-slot-empty"
									v-if="
										!visibleSideEntries(branchSubs(group.subs, 'left')).length &&
										!showBlankSlotForSide(branchSubs(group.subs, 'left')) &&
										!printBlank &&
										!group.traitItem.isPlaceholder &&
										submode === 'edit'
									"
								>
									Select to add subtraits
								</div>
							</div>
							<div
								v-if="group.split"
								class="branch-link branch-link-left"
								:class="connClass(branchSubs(group.subs, 'left'))"
								aria-hidden="true"
							></div>
							<div
								class="branch-main"
								@click="
									submode === 'play' &&
									!printBlank &&
									!group.traitItem.isPlaceholder &&
									!isTraitRated(group.traitItem.trait) &&
									getSetRatingDie(traitSet)
										? handleSingleDieClick(
												group.traitItem.trait,
												getSetRatingDie(traitSet),
												traitSet,
												s,
												group.traitItem.originalIndex,
											)
										: null
								"
							>
								<button
									type="button"
									class="trait-title-btn branch-name-btn"
									:aria-label="
										!group.traitItem.isPlaceholder && group.traitItem.trait.name
											? group.traitItem.trait.name + (submode === 'play' ? ' options' : ' edit')
											: (traitSet.noun || 'Name') + ' edit'
									"
									@click.stop="openTraitAt(s, group.traitItem)"
								>
									<span class="trait-name" v-if="showTraitName(group.traitItem)">{{ group.traitItem.trait.name }}</span>
									<span class="trait-name trait-name-blank" v-else>
										<template v-if="submode === 'edit' && !printBlank && !group.traitItem.trait.name">
											<span class="trait-name-hint">{{ traitSet.noun || 'Name' }}...</span>
										</template>
										<template v-else>
											<span class="trait-blank-line"></span>
										</template>
									</span>
								</button>
								<span
									class="branch-leader"
									aria-hidden="true"
									v-if="!group.split && (isTraitRated(group.traitItem.trait) || !getSetRatingDie(traitSet))"
								></span>
								<div
									class="trait-value single-die-value"
									v-if="isTraitRated(group.traitItem.trait) || !getSetRatingDie(traitSet)"
									@click.stop="
										!printBlank && !group.traitItem.isPlaceholder
											? handleSingleDieClick(
													group.traitItem.trait,
													firstDie(group.traitItem.trait) || getSetRatingDie(traitSet),
													traitSet,
													s,
													group.traitItem.originalIndex,
												)
											: null
									"
								>
									<span
										v-for="size in getTraitSetRatings(traitSet)"
										:key="size"
										:class="{
											active: !printBlank && !group.traitItem.isPlaceholder && isDieActive(group.traitItem.trait, size),
										}"
										role="button"
										tabindex="0"
										:aria-label="`Stage d${size} from ${group.traitItem.trait.name || (traitSet.noun || 'trait').toLowerCase()}`"
										:aria-pressed="isDieActive(group.traitItem.trait, size) ? 'true' : 'false'"
										@click.stop="
											!printBlank && !group.traitItem.isPlaceholder
												? handleSingleDieClick(group.traitItem.trait, size, traitSet, s, group.traitItem.originalIndex)
												: null
										"
										@keydown.enter.prevent="
											!printBlank && !group.traitItem.isPlaceholder
												? handleSingleDieClick(group.traitItem.trait, size, traitSet, s, group.traitItem.originalIndex)
												: null
										"
										@keydown.space.prevent="
											!printBlank && !group.traitItem.isPlaceholder
												? handleSingleDieClick(group.traitItem.trait, size, traitSet, s, group.traitItem.originalIndex)
												: null
										"
										v-html="
											renderDieValueForPrint(
												size,
												!printBlank && !group.traitItem.isPlaceholder && isDieActive(group.traitItem.trait, size),
											)
										"
									></span>
								</div>
							</div>
							<div
								class="branch-link branch-link-right"
								:class="connClass(group.split ? branchSubs(group.subs, 'right') : group.subs)"
								aria-hidden="true"
							></div>
							<div
								class="branch-side"
								:class="[
									{ 'branch-right': group.split },
									sideCountClass(group.split ? branchSubs(group.subs, 'right') : group.subs),
								]"
							>
								<template
									v-for="(entry, ei) in visibleSideEntries(group.split ? branchSubs(group.subs, 'right') : group.subs)"
									:key="entry._lid || 'sub-' + ei"
								>
									<div
										class="branch-slot"
										v-if="entry.kind === 'sub'"
										role="button"
										tabindex="0"
										:aria-label="`Stage d${firstDie(entry.sub)} from ${entry.sub.name || 'subtrait'}`"
										@click.stop="
											!printBlank && !group.traitItem.isPlaceholder
												? handleSingleDieClick(
														entry.sub,
														firstDie(entry.sub),
														traitSet,
														s,
														group.traitItem.originalIndex,
													)
												: null
										"
										@keydown.enter.prevent="
											!printBlank && !group.traitItem.isPlaceholder
												? handleSingleDieClick(
														entry.sub,
														firstDie(entry.sub),
														traitSet,
														s,
														group.traitItem.originalIndex,
													)
												: null
										"
										@keydown.space.prevent="
											!printBlank && !group.traitItem.isPlaceholder
												? handleSingleDieClick(
														entry.sub,
														firstDie(entry.sub),
														traitSet,
														s,
														group.traitItem.originalIndex,
													)
												: null
										"
									>
										<span v-if="isFilledSubEntry(entry)" class="branch-slot-conn" aria-hidden="true"></span>
										<span class="subtrait-name" v-if="!printBlank && entry.sub.name">{{ entry.sub.name }}</span>
										<span class="subtrait-name" v-else><span class="trait-blank-line subtrait-blank-line"></span></span>
										<div class="subtrait-value" v-if="subtraitRatings.length">
											<span
												v-for="size in subtraitRatings"
												:key="size"
												:class="{ active: !printBlank && isDieActive(entry.sub, size) }"
												v-html="renderDieValueForPrint(size, !printBlank && isDieActive(entry.sub, size))"
											></span>
										</div>
									</div>
									<div
										class="branch-slot"
										v-if="entry.kind === 'flat'"
										role="button"
										tabindex="0"
										:aria-label="`Stage d${firstDie(entry.item.trait)} from ${entry.item.trait.name || 'trait'}`"
										@click.stop="
											!printBlank ? handleBranchFlatClick(s, entry.item.originalIndex, entry.item.trait) : null
										"
										@keydown.enter.prevent="
											!printBlank ? handleBranchFlatClick(s, entry.item.originalIndex, entry.item.trait) : null
										"
										@keydown.space.prevent="
											!printBlank ? handleBranchFlatClick(s, entry.item.originalIndex, entry.item.trait) : null
										"
									>
										<span v-if="isFilledSubEntry(entry)" class="branch-slot-conn" aria-hidden="true"></span>
										<span class="subtrait-name" v-if="!printBlank && entry.item.trait.name">{{
											entry.item.trait.name
										}}</span>
										<span class="subtrait-name" v-else><span class="trait-blank-line subtrait-blank-line"></span></span>
										<div class="subtrait-value" v-if="getTraitSetRatings(traitSet).length">
											<span
												v-for="size in getTraitSetRatings(traitSet)"
												:key="size"
												:class="{ active: !printBlank && isDieActive(entry.item.trait, size) }"
												v-html="renderDieValueForPrint(size, !printBlank && isDieActive(entry.item.trait, size))"
											></span>
										</div>
									</div>
								</template>
								<div
									class="branch-slot branch-slot-blank"
									v-if="showBlankSlotForSide(group.split ? branchSubs(group.subs, 'right') : group.subs)"
								>
									<span class="subtrait-name"><span class="trait-blank-line subtrait-blank-line"></span></span>
									<div class="subtrait-value" v-if="subtraitRatings.length">
										<span
											v-for="size in subtraitRatings"
											:key="size"
											v-html="renderDieValueForPrint(size, false)"
										></span>
									</div>
								</div>
								<div
									class="branch-slot-empty"
									v-if="
										!visibleSideEntries(group.split ? branchSubs(group.subs, 'right') : group.subs).length &&
										!showBlankSlotForSide(group.split ? branchSubs(group.subs, 'right') : group.subs) &&
										!printBlank &&
										!group.traitItem.isPlaceholder &&
										submode === 'edit'
									"
								>
									Select to add subtraits
								</div>
							</div>
						</div>
					</div>
				</div>
				<div class="branch-orphans" v-else>
					<div
						class="branch-row"
						:class="{ 'branch-split-row': group.split }"
						:style="group.split ? branchGridStyle : ''"
					>
						<div class="branch-side branch-left branch-side-none" v-if="group.split">
							<template
								v-for="(entry, ei) in visibleSideEntries(branchSubs(group.subs, 'left'))"
								:key="entry._lid || 'orphl-' + ei"
							>
								<div
									class="branch-slot"
									v-if="entry.kind === 'flat'"
									@click.stop="
										!printBlank ? handleBranchFlatClick(s, entry.item.originalIndex, entry.item.trait) : null
									"
								>
									<span class="subtrait-name" v-if="!printBlank && entry.item.trait.name">{{
										entry.item.trait.name
									}}</span>
									<span class="subtrait-name" v-else><span class="trait-blank-line subtrait-blank-line"></span></span>
									<div class="subtrait-value" v-if="getTraitSetRatings(traitSet).length">
										<span
											v-for="size in getTraitSetRatings(traitSet)"
											:key="size"
											:class="{ active: !printBlank && isDieActive(entry.item.trait, size) }"
											v-html="renderDieValueForPrint(size, !printBlank && isDieActive(entry.item.trait, size))"
										></span>
									</div>
								</div>
							</template>
						</div>
						<div v-if="group.split" class="branch-link branch-link-left branch-conn-none" aria-hidden="true"></div>
						<div class="branch-main"></div>
						<div class="branch-link branch-link-right branch-conn-none" aria-hidden="true"></div>
						<div class="branch-side branch-side-none" :class="{ 'branch-right': group.split }">
							<template
								v-for="(entry, ei) in visibleSideEntries(group.split ? branchSubs(group.subs, 'right') : group.subs)"
								:key="entry._lid || 'orph-' + ei"
							>
								<div
									class="branch-slot"
									v-if="entry.kind === 'flat'"
									@click.stop="
										!printBlank ? handleBranchFlatClick(s, entry.item.originalIndex, entry.item.trait) : null
									"
								>
									<span class="subtrait-name" v-if="!printBlank && entry.item.trait.name">{{
										entry.item.trait.name
									}}</span>
									<span class="subtrait-name" v-else><span class="trait-blank-line subtrait-blank-line"></span></span>
									<div class="subtrait-value" v-if="getTraitSetRatings(traitSet).length">
										<span
											v-for="size in getTraitSetRatings(traitSet)"
											:key="size"
											:class="{ active: !printBlank && isDieActive(entry.item.trait, size) }"
											v-html="renderDieValueForPrint(size, !printBlank && isDieActive(entry.item.trait, size))"
										></span>
									</div>
								</div>
							</template>
						</div>
					</div>
				</div>
			</template>
		</template>
		<transition appear>
			<div class="preview-button-container" v-if="submode === 'edit'">
				<div class="preview-button-container-inner">
					<button type="button" class="preview-button" @click.stop="addTrait(s)">
						<span
							><i class="fas fa-plus" aria-hidden="true"></i>
							{{ traitSet.noun && traitSet.noun.length ? traitSet.noun : 'Trait' }}</span
						>
					</button>
				</div>
			</div>
		</transition>
	</div>
</template>
