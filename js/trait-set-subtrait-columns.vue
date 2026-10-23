<script setup lang="ts">
import { computed } from 'vue';
import { getView } from './model.ts';
import { injectTraitSet } from './use-trait-set.ts';

const {
	traitSet, s, submode, printBlank, viewY, character,
	isSelected, selectElement, openTraitAt, updateCharacter, removeTrait, addTrait,
	getRenderedTraits, getTraitClasses, getTraitSetRatings, getSubtraitRatings, isSpotlightStyle,
	renderDieValueForPrint, handleSingleDieClick, getTraitSetLabel, getSetDie,
	getBranchGroups, branchSubs, hasBranchSplit, hasBranchFlank, getFlankColumns, handleBranchFlatClick
} = injectTraitSet();

// Stored branch column shares (view.branch), from the section miniature.
// Absent means the CSS default (1.4 / 1 / 1.4); flank rows keep theirs.
const branchGridStyle = computed( () => {
	const b = getView( traitSet.value )?.branch as any;
	if ( !b || typeof b !== 'object' || Array.isArray( b ) ) return '';
	const num = ( v: unknown, fallback: number ) => ( typeof v === 'number' && Number.isFinite( v ) && v >= 0 ) ? v : fallback;
	return 'grid-template-columns: ' + num( b.left, 1.4 ) + 'fr ' + num( b.center, 1 ) + 'fr 2rem ' + num( b.right, 1.4 ) + 'fr;';
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
						<div :class="group.skillItem ? getTraitClasses(group.skillItem.trait) : {}" v-if="group.skillItem">
							<div :class="{ 'trait-inner': true, 'selected': !group.skillItem.isPlaceholder && isSelected(['trait', s, group.skillItem.originalIndex]), 'trait-placeholder-slot': group.skillItem.isPlaceholder }"
								tabindex="0"
								role="button"
								@keydown.enter.prevent="openTraitAt(s, group.skillItem)"
								@keydown.space.prevent="openTraitAt(s, group.skillItem)"
								@click.stop="openTraitAt(s, group.skillItem)">
								<div class="branch-main" @click="submode === 'play' && !printBlank && !group.skillItem.isPlaceholder && !group.skillItem.trait.value && getSetDie(traitSet) ? handleSingleDieClick(group.skillItem.trait, getSetDie(traitSet), traitSet, s, group.skillItem.originalIndex) : null">
									<span class="trait-name" v-if="!printBlank && !group.skillItem.isPlaceholder && group.skillItem.trait.name">{{ group.skillItem.trait.name }}</span>
									<span class="trait-name trait-name-blank" v-else-if="printBlank || group.skillItem.isPlaceholder || !group.skillItem.trait.name">
										<template v-if="submode === 'edit' && !printBlank && !group.skillItem.trait.name">
											<span class="trait-name-hint">{{ traitSet.nounSingular || 'Name' }}...</span>
										</template>
										<template v-else>
											<span class="trait-blank-line"></span>
										</template>
									</span>
									<span class="trait-name" v-else>{{ group.skillItem.trait.name || '' }}</span>
									<div class="trait-value single-die-value" v-if="group.skillItem.trait.value || !getSetDie(traitSet)" @click.stop="!printBlank && !group.skillItem.isPlaceholder ? handleSingleDieClick(group.skillItem.trait, group.skillItem.trait.value || getSetDie(traitSet), traitSet, s, group.skillItem.originalIndex) : null">
										<span v-for="size in getTraitSetRatings(traitSet)" :key="size"
											:class="{ 'c': true, 'active': !printBlank && !group.skillItem.isPlaceholder && group.skillItem.trait.value === size }"
											v-html="renderDieValueForPrint(size, !printBlank && !group.skillItem.isPlaceholder && group.skillItem.trait.value === size)"></span>
									</div>
								</div>
							</div>
						</div>
					</template>
				</div>
				<div class="branch-flank-center">
					<template v-for="(entry, ei) in getFlankColumns(traitSet, getRenderedTraits(traitSet, s)).center" :key="entry._lid || ('flankc-' + ei)">
						<div class="branch-slot" v-if="entry.kind === 'sub' && entry.skillIndex !== null && entry.skillIndex !== undefined"
							@click.stop="!printBlank && !entry.skillItem.isPlaceholder ? handleSingleDieClick(entry.sub, entry.sub.value, traitSet, s, entry.skillIndex) : null">
							<span class="subtrait-name" v-if="!printBlank && entry.sub.name">{{ entry.sub.name }}</span>
							<span class="subtrait-name" v-else-if="printBlank"><span class="trait-blank-line subtrait-blank-line"></span></span>
							<div class="subtrait-value">
								<span v-for="size in getSubtraitRatings(traitSet)" :key="size"
									:class="{ 'c': true, 'active': !printBlank && entry.sub.value === size }"
									v-html="renderDieValueForPrint(size, !printBlank && entry.sub.value === size)"></span>
							</div>
						</div>
						<div class="branch-slot" v-if="entry.kind === 'flat'"
							@click.stop="!printBlank ? handleBranchFlatClick(s, entry.item.originalIndex, entry.item.trait) : null">
							<span class="subtrait-name" v-if="!printBlank && entry.item.trait.name">{{ entry.item.trait.name }}</span>
							<span class="subtrait-name" v-else-if="printBlank"><span class="trait-blank-line subtrait-blank-line"></span></span>
							<div class="subtrait-value">
								<span v-for="size in getTraitSetRatings(traitSet)" :key="size"
									:class="{ 'c': true, 'active': !printBlank && entry.item.trait.value === size }"
									v-html="renderDieValueForPrint(size, !printBlank && entry.item.trait.value === size)"></span>
							</div>
						</div>
					</template>
					<div class="branch-slot-empty" v-if="!getFlankColumns(traitSet, getRenderedTraits(traitSet, s)).center.length && !printBlank && submode === 'edit'">Select a skill to add specialties</div>
				</div>
			</div>
		</template>
		<template v-else>
		<div class="branch-head" :class="{ 'branch-split-head': hasBranchSplit(traitSet, getRenderedTraits(traitSet, s)) }" :style="hasBranchSplit(traitSet, getRenderedTraits(traitSet, s)) ? branchGridStyle : ''" @click.stop="hasBranchSplit(traitSet, getRenderedTraits(traitSet, s)) ? selectElement(['traitSet', s]) : null" :title="hasBranchSplit(traitSet, getRenderedTraits(traitSet, s)) ? (traitSet.name + ' — click to edit section') : ''">
		<template v-if="hasBranchSplit(traitSet, getRenderedTraits(traitSet, s))"><span>{{ getTraitSetLabel(traitSet, 'left') }}</span><span class="branch-head-center">{{ getTraitSetLabel(traitSet, 'center') }}<span v-if="getSetDie(traitSet)" class="c set-die" v-html="renderDieValueForPrint(getSetDie(traitSet), true)"></span></span><span></span><span>{{ getTraitSetLabel(traitSet, 'right') }}</span></template>
		<template v-else><span>{{ getTraitSetLabel(traitSet, 'left') }}</span><span>{{ getTraitSetLabel(traitSet, 'right') }}</span></template>
	</div>
		<template v-for="(group, gi) in getBranchGroups(traitSet, getRenderedTraits(traitSet, s))" :key="gi">
			<div :class="group.skillItem ? getTraitClasses(group.skillItem.trait) : {}" v-if="group.skillItem">
				<div :class="{ 'trait-inner': true, 'selected': !group.skillItem.isPlaceholder && isSelected(['trait', s, group.skillItem.originalIndex]), 'trait-placeholder-slot': group.skillItem.isPlaceholder }"
					tabindex="0"
					role="button"
					@keydown.enter.prevent="openTraitAt(s, group.skillItem)"
					@keydown.space.prevent="openTraitAt(s, group.skillItem)"
					@click.stop="openTraitAt(s, group.skillItem)">
					<div class="branch-row" :class="{ 'branch-split-row': group.split }" :style="group.split ? branchGridStyle : ''">
						<div class="branch-side branch-left" v-if="group.split">
							<template v-for="(entry, ei) in branchSubs(group.subs, 'left')" :key="entry._lid || ('subl-' + ei)">
								<div class="branch-slot" v-if="entry.kind === 'sub'"
									@click.stop="!printBlank && !group.skillItem.isPlaceholder ? handleSingleDieClick(entry.sub, entry.sub.value, traitSet, s, group.skillItem.originalIndex) : null">
									<span class="subtrait-name" v-if="!printBlank && entry.sub.name">{{ entry.sub.name }}</span>
									<span class="subtrait-name" v-else-if="printBlank"><span class="trait-blank-line subtrait-blank-line"></span></span>
									<div class="subtrait-value">
										<span v-for="size in getSubtraitRatings(traitSet)" :key="size"
											:class="{ 'c': true, 'active': !printBlank && entry.sub.value === size }"
											v-html="renderDieValueForPrint(size, !printBlank && entry.sub.value === size)"></span>
									</div>
								</div>
								<div class="branch-slot" v-if="entry.kind === 'flat'"
									@click.stop="!printBlank ? handleBranchFlatClick(s, entry.item.originalIndex, entry.item.trait) : null">
									<span class="subtrait-name" v-if="!printBlank && entry.item.trait.name">{{ entry.item.trait.name }}</span>
									<span class="subtrait-name" v-else-if="printBlank"><span class="trait-blank-line subtrait-blank-line"></span></span>
									<div class="subtrait-value">
										<span v-for="size in getTraitSetRatings(traitSet)" :key="size"
											:class="{ 'c': true, 'active': !printBlank && entry.item.trait.value === size }"
											v-html="renderDieValueForPrint(size, !printBlank && entry.item.trait.value === size)"></span>
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
						<div class="branch-main" @click="submode === 'play' && !printBlank && !group.skillItem.isPlaceholder && !group.skillItem.trait.value && getSetDie(traitSet) ? handleSingleDieClick(group.skillItem.trait, getSetDie(traitSet), traitSet, s, group.skillItem.originalIndex) : null">
							<span class="trait-name" v-if="!printBlank && !group.skillItem.isPlaceholder && group.skillItem.trait.name">{{ group.skillItem.trait.name }}</span>
							<span class="trait-name trait-name-blank" v-else-if="printBlank || group.skillItem.isPlaceholder || !group.skillItem.trait.name">
								<template v-if="submode === 'edit' && !printBlank && !group.skillItem.trait.name">
									<span class="trait-name-hint">{{ traitSet.nounSingular || 'Name' }}...</span>
								</template>
								<template v-else>
									<span class="trait-blank-line"></span>
								</template>
							</span>
							<span class="trait-name" v-else>{{ group.skillItem.trait.name || '' }}</span>
							<div class="trait-value single-die-value" v-if="group.skillItem.trait.value || !getSetDie(traitSet)" @click.stop="!printBlank && !group.skillItem.isPlaceholder ? handleSingleDieClick(group.skillItem.trait, group.skillItem.trait.value || getSetDie(traitSet), traitSet, s, group.skillItem.originalIndex) : null">
								<span v-for="size in getTraitSetRatings(traitSet)" :key="size"
									:class="{ 'c': true, 'active': !printBlank && !group.skillItem.isPlaceholder && group.skillItem.trait.value === size }"
									v-html="renderDieValueForPrint(size, !printBlank && !group.skillItem.isPlaceholder && group.skillItem.trait.value === size)"></span>
							</div>
						</div>
						<div class="branch-link" aria-hidden="true"></div>
						<div class="branch-side" :class="{ 'branch-right': group.split }">
							<template v-for="(entry, ei) in (group.split ? branchSubs(group.subs, 'right') : group.subs)" :key="entry._lid || ('sub-' + ei)">
								<div class="branch-slot" v-if="entry.kind === 'sub'"
									@click.stop="!printBlank && !group.skillItem.isPlaceholder ? handleSingleDieClick(entry.sub, entry.sub.value, traitSet, s, group.skillItem.originalIndex) : null">
									<span class="subtrait-name" v-if="!printBlank && entry.sub.name">{{ entry.sub.name }}</span>
									<span class="subtrait-name" v-else-if="printBlank"><span class="trait-blank-line subtrait-blank-line"></span></span>
									<div class="subtrait-value">
										<span v-for="size in getSubtraitRatings(traitSet)" :key="size"
											:class="{ 'c': true, 'active': !printBlank && entry.sub.value === size }"
											v-html="renderDieValueForPrint(size, !printBlank && entry.sub.value === size)"></span>
									</div>
								</div>
								<div class="branch-slot" v-if="entry.kind === 'flat'"
									@click.stop="!printBlank ? handleBranchFlatClick(s, entry.item.originalIndex, entry.item.trait) : null">
									<span class="subtrait-name" v-if="!printBlank && entry.item.trait.name">{{ entry.item.trait.name }}</span>
									<span class="subtrait-name" v-else-if="printBlank"><span class="trait-blank-line subtrait-blank-line"></span></span>
									<div class="subtrait-value">
										<span v-for="size in getTraitSetRatings(traitSet)" :key="size"
											:class="{ 'c': true, 'active': !printBlank && entry.item.trait.value === size }"
											v-html="renderDieValueForPrint(size, !printBlank && entry.item.trait.value === size)"></span>
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
										:class="{ 'c': true, 'active': !printBlank && entry.item.trait.value === size }"
										v-html="renderDieValueForPrint(size, !printBlank && entry.item.trait.value === size)"></span>
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
										:class="{ 'c': true, 'active': !printBlank && entry.item.trait.value === size }"
										v-html="renderDieValueForPrint(size, !printBlank && entry.item.trait.value === size)"></span>
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
						<span><i class="fas fa-plus"></i> {{ ( traitSet.nounSingular && traitSet.nounSingular.length ) ? traitSet.nounSingular : 'Trait' }}</span>
					</div>
				</div>
			</div>
		</transition>
	</div>
</template>
