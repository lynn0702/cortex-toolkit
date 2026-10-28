<script setup lang="ts">
import { computed } from 'vue';
import { getView } from './model.ts';
import { injectTraitSet } from './use-trait-set.ts';
import { resolveBranchShares } from './use-trait-set-editor.ts';

const {
	traitSet, s, submode, printBlank, viewY, character,
	isSelected, selectElement, openTraitAt, updateCharacter, removeTrait, addTrait,
	getRenderedTraits, getTraitClasses, getTraitSetRatings, getSubtraitRatings, isSpotlightStyle,
	renderDieValueForPrint, handleSingleDieClick, getTraitSetLabel, getSetRatingDie, firstDie, isDieActive, isTraitRated,
	getBranchGroups, branchSubs, hasBranchSplit, hasBranchFlank, getFlankColumns, handleBranchFlatClick
} = injectTraitSet();

// Stored branch column shares (view.branch), from the section miniature.
// Absent means the CSS default (1.4 / 1 / 1.4); flank rows keep theirs.
const branchGridStyle = computed( () => {
	const shares = resolveBranchShares( getView( traitSet.value )?.branch );
	if ( !shares ) return '';
	return 'grid-template-columns: ' + shares.left + 'fr ' + shares.center + 'fr 2rem ' + shares.right + 'fr;';
} );
</script>

<template>
	<div class="trait-subtrait-columns" v-if="getView(traitSet)?.style?.body === 'subtrait-columns'">
		<!-- FLANK LAYOUT: skills in the outer columns, specialties down the middle -->
		<template v-if="hasBranchFlank(traitSet, getRenderedTraits(traitSet, s))">
			<div class="branch-head branch-flank-head">
				<span>{{ getTraitSetLabel(traitSet, 'left') }}</span><span>{{ getTraitSetLabel(traitSet, 'center') || getTraitSetLabel(traitSet, 'right') }}</span><span>{{ getTraitSetLabel(traitSet, 'left') }}</span>
			</div>
			<div class="branch-flank-grid">
				<div class="branch-flank-col" v-for="(col, ci) in [getFlankColumns(traitSet, getRenderedTraits(traitSet, s)).left, getFlankColumns(traitSet, getRenderedTraits(traitSet, s)).right]" :key="'flank-col-' + ci">
					<template v-for="(group, gi) in col" :key="gi">
						<div
							v-if="group.skillItem"
							:class="group.skillItem ? getTraitClasses(group.skillItem.trait) : {}"
							:data-trait-name="group.skillItem.trait.name || undefined"
							:data-trait-rating="firstDie(group.skillItem.trait) ? ('d' + firstDie(group.skillItem.trait)) : undefined"
						>
							<div :class="{ 'trait-inner': true, 'selected': !group.skillItem.isPlaceholder && isSelected(['trait', s, group.skillItem.originalIndex]), 'trait-placeholder-slot': group.skillItem.isPlaceholder }">
								<div class="branch-main" @click="submode === 'play' && !printBlank && !group.skillItem.isPlaceholder && !isTraitRated(group.skillItem.trait) && getSetRatingDie(traitSet) ? handleSingleDieClick(group.skillItem.trait, getSetRatingDie(traitSet), traitSet, s, group.skillItem.originalIndex) : null">
									<button
										type="button"
										class="trait-title-btn branch-name-btn"
										:aria-label="(!group.skillItem.isPlaceholder && group.skillItem.trait.name) ? (group.skillItem.trait.name + (submode === 'play' ? ' options' : ' edit')) : ((traitSet.noun || 'Name') + ' edit')"
										@click.stop="openTraitAt(s, group.skillItem)"
									>
										<span class="trait-name" v-if="!printBlank && !group.skillItem.isPlaceholder && group.skillItem.trait.name">{{ group.skillItem.trait.name }}</span>
										<span class="trait-name trait-name-blank" v-else-if="printBlank || group.skillItem.isPlaceholder || !group.skillItem.trait.name">
											<template v-if="submode === 'edit' && !printBlank && !group.skillItem.trait.name">
												<span class="trait-name-hint">{{ traitSet.noun || 'Name' }}...</span>
											</template>
											<template v-else>
												<span class="trait-blank-line"></span>
											</template>
										</span>
										<span class="trait-name" v-else>{{ group.skillItem.trait.name || '' }}</span>
									</button>
									<div class="trait-value single-die-value" v-if="isTraitRated(group.skillItem.trait) || !getSetRatingDie(traitSet)" @click.stop="!printBlank && !group.skillItem.isPlaceholder ? handleSingleDieClick(group.skillItem.trait, firstDie(group.skillItem.trait) || getSetRatingDie(traitSet), traitSet, s, group.skillItem.originalIndex) : null">
										<span
											v-for="size in getTraitSetRatings(traitSet)"
											:key="size"
											:class="{ 'c': true, 'active': !printBlank && !group.skillItem.isPlaceholder && isDieActive(group.skillItem.trait, size) }"
											role="button"
											tabindex="0"
											:aria-label="`Stage d${size} from ${group.skillItem.trait.name || 'skill'}`"
											:aria-pressed="isDieActive(group.skillItem.trait, size) ? 'true' : 'false'"
											@click.stop="!printBlank && !group.skillItem.isPlaceholder ? handleSingleDieClick(group.skillItem.trait, size, traitSet, s, group.skillItem.originalIndex) : null"
											@keydown.enter.prevent="!printBlank && !group.skillItem.isPlaceholder ? handleSingleDieClick(group.skillItem.trait, size, traitSet, s, group.skillItem.originalIndex) : null"
											@keydown.space.prevent="!printBlank && !group.skillItem.isPlaceholder ? handleSingleDieClick(group.skillItem.trait, size, traitSet, s, group.skillItem.originalIndex) : null"
											v-html="renderDieValueForPrint(size, !printBlank && !group.skillItem.isPlaceholder && isDieActive(group.skillItem.trait, size))"
										></span>
									</div>
								</div>
							</div>
						</div>
					</template>
				</div>
				<div class="branch-flank-center">
					<template v-for="(entry, ei) in getFlankColumns(traitSet, getRenderedTraits(traitSet, s)).center" :key="entry._lid || ('flankc-' + ei)">
						<div
							class="branch-slot"
							v-if="entry.kind === 'sub' && entry.skillIndex !== null && entry.skillIndex !== undefined"
							role="button"
							tabindex="0"
							:aria-label="`Stage d${firstDie(entry.sub)} from ${entry.sub.name || 'specialty'}`"
							@click.stop="!printBlank && !entry.skillItem.isPlaceholder ? handleSingleDieClick(entry.sub, firstDie(entry.sub), traitSet, s, entry.skillIndex) : null"
							@keydown.enter.prevent="!printBlank && !entry.skillItem.isPlaceholder ? handleSingleDieClick(entry.sub, firstDie(entry.sub), traitSet, s, entry.skillIndex) : null"
							@keydown.space.prevent="!printBlank && !entry.skillItem.isPlaceholder ? handleSingleDieClick(entry.sub, firstDie(entry.sub), traitSet, s, entry.skillIndex) : null"
						>
							<span class="subtrait-name" v-if="!printBlank && entry.sub.name">{{ entry.sub.name }}</span>
							<span class="subtrait-name" v-else-if="printBlank"><span class="trait-blank-line subtrait-blank-line"></span></span>
							<div class="subtrait-value">
								<span
									v-for="size in getSubtraitRatings(traitSet)"
									:key="size"
									:class="{ 'c': true, 'active': !printBlank && isDieActive(entry.sub, size) }"
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
							@keydown.enter.prevent="!printBlank ? handleBranchFlatClick(s, entry.item.originalIndex, entry.item.trait) : null"
							@keydown.space.prevent="!printBlank ? handleBranchFlatClick(s, entry.item.originalIndex, entry.item.trait) : null"
						>
							<span class="subtrait-name" v-if="!printBlank && entry.item.trait.name">{{ entry.item.trait.name }}</span>
							<span class="subtrait-name" v-else-if="printBlank"><span class="trait-blank-line subtrait-blank-line"></span></span>
							<div class="subtrait-value">
								<span
									v-for="size in getTraitSetRatings(traitSet)"
									:key="size"
									:class="{ 'c': true, 'active': !printBlank && isDieActive(entry.item.trait, size) }"
									v-html="renderDieValueForPrint(size, !printBlank && isDieActive(entry.item.trait, size))"
								></span>
							</div>
						</div>
					</template>
					<div class="branch-slot-empty" v-if="!getFlankColumns(traitSet, getRenderedTraits(traitSet, s)).center.length && !printBlank && submode === 'edit'">Select a skill to add specialties</div>
				</div>
			</div>
		</template>
		<template v-else>
		<div class="branch-head" :class="{ 'branch-split-head': hasBranchSplit(traitSet, getRenderedTraits(traitSet, s)) }" :style="hasBranchSplit(traitSet, getRenderedTraits(traitSet, s)) ? branchGridStyle : ''" @click.stop="hasBranchSplit(traitSet, getRenderedTraits(traitSet, s)) ? selectElement(['traitSet', s]) : null" :title="hasBranchSplit(traitSet, getRenderedTraits(traitSet, s)) ? (traitSet.name + ' — click to edit section') : ''">
		<template v-if="hasBranchSplit(traitSet, getRenderedTraits(traitSet, s))"><span>{{ getTraitSetLabel(traitSet, 'left') }}</span><span class="branch-head-center">{{ getTraitSetLabel(traitSet, 'center') }}<span v-if="getSetRatingDie(traitSet)" class="c set-rating-die" v-html="renderDieValueForPrint(getSetRatingDie(traitSet), true)"></span></span><span></span><span>{{ getTraitSetLabel(traitSet, 'right') }}</span></template>
		<template v-else><span>{{ getTraitSetLabel(traitSet, 'left') }}</span><span>{{ getTraitSetLabel(traitSet, 'right') }}</span></template>
	</div>
		<template v-for="(group, gi) in getBranchGroups(traitSet, getRenderedTraits(traitSet, s))" :key="gi">
			<div
				v-if="group.skillItem"
				:class="group.skillItem ? getTraitClasses(group.skillItem.trait) : {}"
				:data-trait-name="group.skillItem.trait.name || undefined"
				:data-trait-rating="firstDie(group.skillItem.trait) ? ('d' + firstDie(group.skillItem.trait)) : undefined"
			>
				<div :class="{ 'trait-inner': true, 'selected': !group.skillItem.isPlaceholder && isSelected(['trait', s, group.skillItem.originalIndex]), 'trait-placeholder-slot': group.skillItem.isPlaceholder }">
					<div class="branch-row" :class="{ 'branch-split-row': group.split }" :style="group.split ? branchGridStyle : ''">
						<div class="branch-side branch-left" v-if="group.split">
							<template v-for="(entry, ei) in branchSubs(group.subs, 'left')" :key="entry._lid || ('subl-' + ei)">
								<div
									class="branch-slot"
									v-if="entry.kind === 'sub'"
									role="button"
									tabindex="0"
									:aria-label="`Stage d${firstDie(entry.sub)} from ${entry.sub.name || 'specialty'}`"
									@click.stop="!printBlank && !group.skillItem.isPlaceholder ? handleSingleDieClick(entry.sub, firstDie(entry.sub), traitSet, s, group.skillItem.originalIndex) : null"
									@keydown.enter.prevent="!printBlank && !group.skillItem.isPlaceholder ? handleSingleDieClick(entry.sub, firstDie(entry.sub), traitSet, s, group.skillItem.originalIndex) : null"
									@keydown.space.prevent="!printBlank && !group.skillItem.isPlaceholder ? handleSingleDieClick(entry.sub, firstDie(entry.sub), traitSet, s, group.skillItem.originalIndex) : null"
								>
									<span class="subtrait-name" v-if="!printBlank && entry.sub.name">{{ entry.sub.name }}</span>
									<span class="subtrait-name" v-else-if="printBlank"><span class="trait-blank-line subtrait-blank-line"></span></span>
									<div class="subtrait-value">
										<span
											v-for="size in getSubtraitRatings(traitSet)"
											:key="size"
											:class="{ 'c': true, 'active': !printBlank && isDieActive(entry.sub, size) }"
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
									@keydown.enter.prevent="!printBlank ? handleBranchFlatClick(s, entry.item.originalIndex, entry.item.trait) : null"
									@keydown.space.prevent="!printBlank ? handleBranchFlatClick(s, entry.item.originalIndex, entry.item.trait) : null"
								>
									<span class="subtrait-name" v-if="!printBlank && entry.item.trait.name">{{ entry.item.trait.name }}</span>
									<span class="subtrait-name" v-else-if="printBlank"><span class="trait-blank-line subtrait-blank-line"></span></span>
									<div class="subtrait-value">
										<span
											v-for="size in getTraitSetRatings(traitSet)"
											:key="size"
											:class="{ 'c': true, 'active': !printBlank && isDieActive(entry.item.trait, size) }"
											v-html="renderDieValueForPrint(size, !printBlank && isDieActive(entry.item.trait, size))"
										></span>
									</div>
								</div>
							</template>
							<div class="branch-slot branch-slot-blank" v-if="printBlank && !branchSubs(group.subs, 'left').length">
								<span class="subtrait-name"><span class="trait-blank-line subtrait-blank-line"></span></span>
								<div class="subtrait-value">
									<span v-for="size in getSubtraitRatings(traitSet)" :key="size" class="c" v-html="renderDieValueForPrint(size, false)"></span>
								</div>
							</div>
							<div class="branch-slot-empty" v-if="!branchSubs(group.subs, 'left').length && !printBlank && !group.skillItem.isPlaceholder && submode === 'edit'">Select to add specialties</div>
						</div>
						<div class="branch-main" @click="submode === 'play' && !printBlank && !group.skillItem.isPlaceholder && !isTraitRated(group.skillItem.trait) && getSetRatingDie(traitSet) ? handleSingleDieClick(group.skillItem.trait, getSetRatingDie(traitSet), traitSet, s, group.skillItem.originalIndex) : null">
							<button
								type="button"
								class="trait-title-btn branch-name-btn"
								:aria-label="(!group.skillItem.isPlaceholder && group.skillItem.trait.name) ? (group.skillItem.trait.name + (submode === 'play' ? ' options' : ' edit')) : ((traitSet.noun || 'Name') + ' edit')"
								@click.stop="openTraitAt(s, group.skillItem)"
							>
								<span class="trait-name" v-if="!printBlank && !group.skillItem.isPlaceholder && group.skillItem.trait.name">{{ group.skillItem.trait.name }}</span>
								<span class="trait-name trait-name-blank" v-else-if="printBlank || group.skillItem.isPlaceholder || !group.skillItem.trait.name">
									<template v-if="submode === 'edit' && !printBlank && !group.skillItem.trait.name">
										<span class="trait-name-hint">{{ traitSet.noun || 'Name' }}...</span>
									</template>
									<template v-else>
										<span class="trait-blank-line"></span>
									</template>
								</span>
								<span class="trait-name" v-else>{{ group.skillItem.trait.name || '' }}</span>
							</button>
							<div class="trait-value single-die-value" v-if="isTraitRated(group.skillItem.trait) || !getSetRatingDie(traitSet)" @click.stop="!printBlank && !group.skillItem.isPlaceholder ? handleSingleDieClick(group.skillItem.trait, firstDie(group.skillItem.trait) || getSetRatingDie(traitSet), traitSet, s, group.skillItem.originalIndex) : null">
								<span
									v-for="size in getTraitSetRatings(traitSet)"
									:key="size"
									:class="{ 'c': true, 'active': !printBlank && !group.skillItem.isPlaceholder && isDieActive(group.skillItem.trait, size) }"
									role="button"
									tabindex="0"
									:aria-label="`Stage d${size} from ${group.skillItem.trait.name || 'skill'}`"
									:aria-pressed="isDieActive(group.skillItem.trait, size) ? 'true' : 'false'"
									@click.stop="!printBlank && !group.skillItem.isPlaceholder ? handleSingleDieClick(group.skillItem.trait, size, traitSet, s, group.skillItem.originalIndex) : null"
									@keydown.enter.prevent="!printBlank && !group.skillItem.isPlaceholder ? handleSingleDieClick(group.skillItem.trait, size, traitSet, s, group.skillItem.originalIndex) : null"
									@keydown.space.prevent="!printBlank && !group.skillItem.isPlaceholder ? handleSingleDieClick(group.skillItem.trait, size, traitSet, s, group.skillItem.originalIndex) : null"
									v-html="renderDieValueForPrint(size, !printBlank && !group.skillItem.isPlaceholder && isDieActive(group.skillItem.trait, size))"
								></span>
							</div>
						</div>
						<div class="branch-link" aria-hidden="true"></div>
						<div class="branch-side" :class="{ 'branch-right': group.split }">
							<template v-for="(entry, ei) in (group.split ? branchSubs(group.subs, 'right') : group.subs)" :key="entry._lid || ('sub-' + ei)">
								<div
									class="branch-slot"
									v-if="entry.kind === 'sub'"
									role="button"
									tabindex="0"
									:aria-label="`Stage d${firstDie(entry.sub)} from ${entry.sub.name || 'specialty'}`"
									@click.stop="!printBlank && !group.skillItem.isPlaceholder ? handleSingleDieClick(entry.sub, firstDie(entry.sub), traitSet, s, group.skillItem.originalIndex) : null"
									@keydown.enter.prevent="!printBlank && !group.skillItem.isPlaceholder ? handleSingleDieClick(entry.sub, firstDie(entry.sub), traitSet, s, group.skillItem.originalIndex) : null"
									@keydown.space.prevent="!printBlank && !group.skillItem.isPlaceholder ? handleSingleDieClick(entry.sub, firstDie(entry.sub), traitSet, s, group.skillItem.originalIndex) : null"
								>
									<span class="subtrait-name" v-if="!printBlank && entry.sub.name">{{ entry.sub.name }}</span>
									<span class="subtrait-name" v-else-if="printBlank"><span class="trait-blank-line subtrait-blank-line"></span></span>
									<div class="subtrait-value">
										<span
											v-for="size in getSubtraitRatings(traitSet)"
											:key="size"
											:class="{ 'c': true, 'active': !printBlank && isDieActive(entry.sub, size) }"
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
									@keydown.enter.prevent="!printBlank ? handleBranchFlatClick(s, entry.item.originalIndex, entry.item.trait) : null"
									@keydown.space.prevent="!printBlank ? handleBranchFlatClick(s, entry.item.originalIndex, entry.item.trait) : null"
								>
									<span class="subtrait-name" v-if="!printBlank && entry.item.trait.name">{{ entry.item.trait.name }}</span>
									<span class="subtrait-name" v-else-if="printBlank"><span class="trait-blank-line subtrait-blank-line"></span></span>
									<div class="subtrait-value">
										<span
											v-for="size in getTraitSetRatings(traitSet)"
											:key="size"
											:class="{ 'c': true, 'active': !printBlank && isDieActive(entry.item.trait, size) }"
											v-html="renderDieValueForPrint(size, !printBlank && isDieActive(entry.item.trait, size))"
										></span>
									</div>
								</div>
							</template>
							<div class="branch-slot branch-slot-blank" v-if="printBlank && !(group.split ? branchSubs(group.subs, 'right') : group.subs).length">
								<span class="subtrait-name"><span class="trait-blank-line subtrait-blank-line"></span></span>
								<div class="subtrait-value">
									<span v-for="size in getSubtraitRatings(traitSet)" :key="size" class="c" v-html="renderDieValueForPrint(size, false)"></span>
								</div>
							</div>
							<div class="branch-slot-empty" v-if="!(group.split ? branchSubs(group.subs, 'right') : group.subs).length && !printBlank && !group.skillItem.isPlaceholder && submode === 'edit'">Select to add specialties</div>
						</div>
					</div>
				</div>
			</div>
			<div class="branch-orphans" v-else>
				<div class="branch-row" :class="{ 'branch-split-row': group.split }" :style="group.split ? branchGridStyle : ''">
					<div class="branch-side branch-left" v-if="group.split">
						<template v-for="(entry, ei) in branchSubs(group.subs, 'left')" :key="entry._lid || ('orphl-' + ei)">
							<div class="branch-slot" v-if="entry.kind === 'flat'"
								@click.stop="!printBlank ? handleBranchFlatClick(s, entry.item.originalIndex, entry.item.trait) : null">
								<span class="subtrait-name" v-if="!printBlank && entry.item.trait.name">{{ entry.item.trait.name }}</span>
								<span class="subtrait-name" v-else-if="printBlank"><span class="trait-blank-line subtrait-blank-line"></span></span>
								<div class="subtrait-value">
									<span v-for="size in getTraitSetRatings(traitSet)" :key="size"
										:class="{ 'c': true, 'active': !printBlank && isDieActive(entry.item.trait, size) }"
										v-html="renderDieValueForPrint(size, !printBlank && isDieActive(entry.item.trait, size))"></span>
								</div>
							</div>
						</template>
					</div>
					<div class="branch-main"></div>
					<div class="branch-link" aria-hidden="true"></div>
					<div class="branch-side">
						<template v-for="(entry, ei) in (group.split ? branchSubs(group.subs, 'right') : group.subs)" :key="entry._lid || ('orph-' + ei)">
							<div class="branch-slot" v-if="entry.kind === 'flat'"
								@click.stop="!printBlank ? handleBranchFlatClick(s, entry.item.originalIndex, entry.item.trait) : null">
								<span class="subtrait-name" v-if="!printBlank && entry.item.trait.name">{{ entry.item.trait.name }}</span>
								<span class="subtrait-name" v-else-if="printBlank"><span class="trait-blank-line subtrait-blank-line"></span></span>
								<div class="subtrait-value">
									<span v-for="size in getTraitSetRatings(traitSet)" :key="size"
										:class="{ 'c': true, 'active': !printBlank && isDieActive(entry.item.trait, size) }"
										v-html="renderDieValueForPrint(size, !printBlank && isDieActive(entry.item.trait, size))"></span>
								</div>
							</div>
						</template>
					</div>
				</div>
			</div>
		</template>
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
