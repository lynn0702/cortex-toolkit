<script setup lang="ts">
import { getView } from './model.ts';
import { injectTraitSet } from './use-trait-set.ts';

const {
	traitSet, s, submode, printBlank, designerPrintPreview, viewY, character,
	isSelected, selectElement, updateCharacter, removeTrait, addTrait,
	getRenderedTraits, getTraitClasses, getTraitSetRatings, getSubtraitRatings, isSpotlightStyle,
	renderDieValueForPrint, handleSingleDieClick, getTraitSetLabel, getSetDie,
	getBranchGroups, branchSubs, hasBranchSplit, handleBranchFlatClick
} = injectTraitSet();
</script>

<template>
	<div class="trait-subtrait-columns" v-if="getView(traitSet)?.style?.body === 'subtrait-columns'">
		<div class="branch-head" :class="{ 'branch-split-head': hasBranchSplit(traitSet, getRenderedTraits(traitSet, s)) }">
		<template v-if="hasBranchSplit(traitSet, getRenderedTraits(traitSet, s))"><span>{{ getTraitSetLabel(traitSet, 'left') }}</span><span class="branch-head-center">{{ getTraitSetLabel(traitSet, 'center') }}<span v-if="getSetDie(traitSet)" class="c set-die" v-html="renderDieValueForPrint(getSetDie(traitSet), true)"></span></span><span></span><span>{{ getTraitSetLabel(traitSet, 'right') }}</span></template>
		<template v-else><span>{{ getTraitSetLabel(traitSet, 'left') }}</span><span>{{ getTraitSetLabel(traitSet, 'right') }}</span></template>
	</div>
		<template v-for="(group, gi) in getBranchGroups(traitSet, getRenderedTraits(traitSet, s))" :key="gi">
			<div :class="group.skillItem ? getTraitClasses(group.skillItem.trait) : {}" v-if="group.skillItem">
				<div :class="{ 'trait-inner': true, 'selected': !group.skillItem.isPlaceholder && isSelected(['trait', s, group.skillItem.originalIndex]), 'trait-placeholder-slot': group.skillItem.isPlaceholder }"
					tabindex="0"
					role="button"
					@keydown.enter.prevent="!group.skillItem.isPlaceholder ? selectElement([ 'trait', s, group.skillItem.originalIndex ]) : null"
					@keydown.space.prevent="!group.skillItem.isPlaceholder ? selectElement([ 'trait', s, group.skillItem.originalIndex ]) : null"
					@click.stop="!group.skillItem.isPlaceholder ? selectElement([ 'trait', s, group.skillItem.originalIndex ]) : null">
					<div class="branch-row" :class="{ 'branch-split-row': group.split }">
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
							<div class="branch-slot-empty" v-if="!branchSubs(group.subs, 'left').length && !printBlank && !group.skillItem.isPlaceholder && submode === 'edit' && !designerPrintPreview">Select to add specialties</div>
						</div>
						<div class="branch-main" @click="submode === 'play' && !printBlank && !group.skillItem.isPlaceholder && !group.skillItem.trait.value && getSetDie(traitSet) ? handleSingleDieClick(group.skillItem.trait, getSetDie(traitSet), traitSet, s, group.skillItem.originalIndex) : null">
							<span class="trait-name" v-if="!printBlank && !group.skillItem.isPlaceholder && group.skillItem.trait.name">{{ group.skillItem.trait.name }}</span>
							<span class="trait-name trait-name-blank" v-else-if="printBlank || group.skillItem.isPlaceholder || !group.skillItem.trait.name">
								<template v-if="submode === 'edit' && !designerPrintPreview && !printBlank && !group.skillItem.trait.name">
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
							<div class="branch-slot-empty" v-if="!(group.split ? branchSubs(group.subs, 'right') : group.subs).length && !printBlank && !group.skillItem.isPlaceholder && submode === 'edit' && !designerPrintPreview">Select to add specialties</div>
						</div>
					</div>
				</div>
			</div>
			<div class="branch-orphans" v-else>
				<div class="branch-row" :class="{ 'branch-split-row': group.split }">
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
