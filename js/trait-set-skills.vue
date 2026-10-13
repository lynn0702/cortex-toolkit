<script setup lang="ts">
import { injectTraitSet } from './use-trait-set.ts';
import TraitEditor from './trait-editor.vue';

const {
	traitSet, s, submode, printBlank, designerPrintPreview, viewY, character,
	isSelected, selectElement, updateCharacter, removeTrait, addTrait,
	getRenderedTraits, getTraitClasses, getTraitSetRatings, getSubtraitRatings, isSpotlightPrintStyle,
	renderDieValueForPrint, handleSingleDieClick, getTraitSetLabel, getSetDie,
	getBranchGroups, branchSubs, hasBranchSplit, handleBranchFlatClick
} = injectTraitSet();
</script>

<template>
	<div class="trait-skills-branch" v-if="traitSet?.custom?.cortexToolkit?.style?.body === 'skills-specialties'">
		<div class="skills-branch-head" :class="{ 'branch-split-head': hasBranchSplit(traitSet, getRenderedTraits(traitSet, s)) }">
		<template v-if="hasBranchSplit(traitSet, getRenderedTraits(traitSet, s))"><span>{{ getTraitSetLabel(traitSet, 'left') }}</span><span class="skills-branch-head-center">{{ getTraitSetLabel(traitSet, 'center') }}<span v-if="getSetDie(traitSet)" class="c set-die" v-html="renderDieValueForPrint(getSetDie(traitSet), true)"></span></span><span></span><span>{{ getTraitSetLabel(traitSet, 'right') }}</span></template>
		<template v-else><span>{{ getTraitSetLabel(traitSet, 'left') }}</span><span>{{ getTraitSetLabel(traitSet, 'right') }}</span></template>
	</div>
		<template v-for="(group, gi) in getBranchGroups(traitSet, getRenderedTraits(traitSet, s))" :key="gi">
			<div :class="group.skillItem ? getTraitClasses(group.skillItem.trait) : {}" v-if="group.skillItem">
				<div :class="{ 'trait-inner': true, 'selected': !group.skillItem.isPlaceholder && isSelected(['trait', s, group.skillItem.originalIndex]), 'trait-placeholder-slot': group.skillItem.isPlaceholder }" @click.stop="!group.skillItem.isPlaceholder ? selectElement([ 'trait', s, group.skillItem.originalIndex ]) : null">
					<div class="skill-branch-row" :class="{ 'branch-split-row': group.split }">
						<div class="skill-branch-specialties branch-left" v-if="group.split">
							<template v-for="(entry, ei) in branchSubs(group.subs, 'left')" :key="entry._lid || ('subl-' + ei)">
								<div class="specialty-row" v-if="entry.kind === 'sub'"
									@click.stop="!printBlank && !group.skillItem.isPlaceholder ? handleSingleDieClick(entry.sub, entry.sub.value, traitSet, s, group.skillItem.originalIndex) : null">
									<span class="subtrait-name" v-if="!printBlank && entry.sub.name">{{ entry.sub.name }}</span>
									<span class="subtrait-name" v-else-if="printBlank"><span class="trait-blank-line subtrait-blank-line"></span></span>
									<div class="subtrait-value">
										<span v-for="size in getSubtraitRatings(traitSet)" :key="size"
											:class="{ 'c': !isSpotlightPrintStyle, 'active': !printBlank && entry.sub.value === size }"
											v-html="renderDieValueForPrint(size, !printBlank && entry.sub.value === size)"></span>
									</div>
								</div>
								<div class="specialty-row" v-if="entry.kind === 'flat'"
									@click.stop="!printBlank ? handleBranchFlatClick(s, entry.item.originalIndex, entry.item.trait) : null">
									<span class="subtrait-name" v-if="!printBlank && entry.item.trait.name">{{ entry.item.trait.name }}</span>
									<span class="subtrait-name" v-else-if="printBlank"><span class="trait-blank-line subtrait-blank-line"></span></span>
									<div class="subtrait-value">
										<span v-for="size in getTraitSetRatings(traitSet)" :key="size"
											:class="{ 'c': !isSpotlightPrintStyle, 'active': !printBlank && entry.item.trait.value === size }"
											v-html="renderDieValueForPrint(size, !printBlank && entry.item.trait.value === size)"></span>
									</div>
									<transition name="editor" appear>
										<TraitEditor
											:character="character"
											:open="isSelected(['trait', s, entry.item.originalIndex])"
											v-show="submode === 'edit' && isSelected(['trait', s, entry.item.originalIndex])"
											:traitSetID="s"
											:traitID="entry.item.originalIndex"
											:viewY="viewY"
											@selectElement="selectElement"
											@updateCharacter="updateCharacter"
											@removeTrait="removeTrait"
										></TraitEditor>
									</transition>
								</div>
							</template>
							<div class="specialty-row specialty-blank-row" v-if="printBlank && !branchSubs(group.subs, 'left').length">
								<span class="subtrait-name"><span class="trait-blank-line subtrait-blank-line"></span></span>
								<div class="subtrait-value">
									<span v-for="size in getSubtraitRatings(traitSet)" :key="size" class="c" v-html="renderDieValueForPrint(size, false)"></span>
								</div>
							</div>
							<div class="specialty-empty" v-if="!branchSubs(group.subs, 'left').length && !printBlank && !group.skillItem.isPlaceholder && submode === 'edit' && !designerPrintPreview">Select to add specialties</div>
						</div>
						<div class="skill-branch-skill" @click="submode === 'play' && !printBlank && !group.skillItem.isPlaceholder && !group.skillItem.trait.value && getSetDie(traitSet) ? handleSingleDieClick(group.skillItem.trait, getSetDie(traitSet), traitSet, s, group.skillItem.originalIndex) : null">
							<span class="trait-name" v-if="!printBlank && !group.skillItem.isPlaceholder && group.skillItem.trait.name">{{ group.skillItem.trait.name }}</span>
							<span class="trait-name trait-name-blank" v-else-if="printBlank || group.skillItem.isPlaceholder"><span class="trait-blank-line"></span></span>
							<span class="trait-name" v-else>{{ group.skillItem.trait.name || '' }}</span>
							<div class="trait-value single-die-value" v-if="group.skillItem.trait.value || !getSetDie(traitSet)" @click.stop="!printBlank && !group.skillItem.isPlaceholder ? handleSingleDieClick(group.skillItem.trait, group.skillItem.trait.value || getSetDie(traitSet), traitSet, s, group.skillItem.originalIndex) : null">
								<span v-for="size in getTraitSetRatings(traitSet)" :key="size"
									:class="{ 'c': !isSpotlightPrintStyle, 'active': !printBlank && !group.skillItem.isPlaceholder && group.skillItem.trait.value === size }"
									v-html="renderDieValueForPrint(size, !printBlank && !group.skillItem.isPlaceholder && group.skillItem.trait.value === size)"></span>
							</div>
						</div>
						<div class="skill-branch-link" aria-hidden="true"></div>
						<div class="skill-branch-specialties" :class="{ 'branch-right': group.split }">
							<template v-for="(entry, ei) in (group.split ? branchSubs(group.subs, 'right') : group.subs)" :key="entry._lid || ('sub-' + ei)">
								<div class="specialty-row" v-if="entry.kind === 'sub'"
									@click.stop="!printBlank && !group.skillItem.isPlaceholder ? handleSingleDieClick(entry.sub, entry.sub.value, traitSet, s, group.skillItem.originalIndex) : null">
									<span class="subtrait-name" v-if="!printBlank && entry.sub.name">{{ entry.sub.name }}</span>
									<span class="subtrait-name" v-else-if="printBlank"><span class="trait-blank-line subtrait-blank-line"></span></span>
									<div class="subtrait-value">
										<span v-for="size in getSubtraitRatings(traitSet)" :key="size"
											:class="{ 'c': !isSpotlightPrintStyle, 'active': !printBlank && entry.sub.value === size }"
											v-html="renderDieValueForPrint(size, !printBlank && entry.sub.value === size)"></span>
									</div>
								</div>
								<div class="specialty-row" v-if="entry.kind === 'flat'"
									@click.stop="!printBlank ? handleBranchFlatClick(s, entry.item.originalIndex, entry.item.trait) : null">
									<span class="subtrait-name" v-if="!printBlank && entry.item.trait.name">{{ entry.item.trait.name }}</span>
									<span class="subtrait-name" v-else-if="printBlank"><span class="trait-blank-line subtrait-blank-line"></span></span>
									<div class="subtrait-value">
										<span v-for="size in getTraitSetRatings(traitSet)" :key="size"
											:class="{ 'c': !isSpotlightPrintStyle, 'active': !printBlank && entry.item.trait.value === size }"
											v-html="renderDieValueForPrint(size, !printBlank && entry.item.trait.value === size)"></span>
									</div>
									<transition name="editor" appear>
										<TraitEditor
											:character="character"
											:open="isSelected(['trait', s, entry.item.originalIndex])"
											v-show="submode === 'edit' && isSelected(['trait', s, entry.item.originalIndex])"
											:traitSetID="s"
											:traitID="entry.item.originalIndex"
											:viewY="viewY"
											@selectElement="selectElement"
											@updateCharacter="updateCharacter"
											@removeTrait="removeTrait"
										></TraitEditor>
									</transition>
								</div>
							</template>
							<div class="specialty-row specialty-blank-row" v-if="printBlank && !(group.split ? branchSubs(group.subs, 'right') : group.subs).length">
								<span class="subtrait-name"><span class="trait-blank-line subtrait-blank-line"></span></span>
								<div class="subtrait-value">
									<span v-for="size in getSubtraitRatings(traitSet)" :key="size" class="c" v-html="renderDieValueForPrint(size, false)"></span>
								</div>
							</div>
							<div class="specialty-empty" v-if="!(group.split ? branchSubs(group.subs, 'right') : group.subs).length && !printBlank && !group.skillItem.isPlaceholder && submode === 'edit' && !designerPrintPreview">Select to add specialties</div>
						</div>
					</div>
				</div>
				<transition name="editor" appear>
					<TraitEditor
						v-if="!group.skillItem.isPlaceholder"
						:character="character"
						:open="isSelected(['trait', s, group.skillItem.originalIndex])"
						v-show="submode === 'edit' && isSelected(['trait', s, group.skillItem.originalIndex])"
						:traitSetID="s"
						:traitID="group.skillItem.originalIndex"
						:viewY="viewY"
						@selectElement="selectElement"
						@updateCharacter="updateCharacter"
						@removeTrait="removeTrait"
					></TraitEditor>
				</transition>
			</div>
			<div class="skill-branch-orphans" v-else>
				<div class="skill-branch-row" :class="{ 'branch-split-row': group.split }">
					<div class="skill-branch-specialties branch-left" v-if="group.split">
						<template v-for="(entry, ei) in branchSubs(group.subs, 'left')" :key="entry._lid || ('orphl-' + ei)">
							<div class="specialty-row" v-if="entry.kind === 'flat'"
								@click.stop="!printBlank ? handleBranchFlatClick(s, entry.item.originalIndex, entry.item.trait) : null">
								<span class="subtrait-name" v-if="!printBlank && entry.item.trait.name">{{ entry.item.trait.name }}</span>
								<span class="subtrait-name" v-else-if="printBlank"><span class="trait-blank-line subtrait-blank-line"></span></span>
								<div class="subtrait-value">
									<span v-for="size in getTraitSetRatings(traitSet)" :key="size"
										:class="{ 'c': !isSpotlightPrintStyle, 'active': !printBlank && entry.item.trait.value === size }"
										v-html="renderDieValueForPrint(size, !printBlank && entry.item.trait.value === size)"></span>
								</div>
							</div>
						</template>
					</div>
					<div class="skill-branch-skill"></div>
					<div class="skill-branch-link" aria-hidden="true"></div>
					<div class="skill-branch-specialties">
						<template v-for="(entry, ei) in (group.split ? branchSubs(group.subs, 'right') : group.subs)" :key="entry._lid || ('orph-' + ei)">
							<div class="specialty-row" v-if="entry.kind === 'flat'"
								@click.stop="!printBlank ? handleBranchFlatClick(s, entry.item.originalIndex, entry.item.trait) : null">
								<span class="subtrait-name" v-if="!printBlank && entry.item.trait.name">{{ entry.item.trait.name }}</span>
								<span class="subtrait-name" v-else-if="printBlank"><span class="trait-blank-line subtrait-blank-line"></span></span>
								<div class="subtrait-value">
									<span v-for="size in getTraitSetRatings(traitSet)" :key="size"
										:class="{ 'c': !isSpotlightPrintStyle, 'active': !printBlank && entry.item.trait.value === size }"
										v-html="renderDieValueForPrint(size, !printBlank && entry.item.trait.value === size)"></span>
								</div>
								<transition name="editor" appear>
									<TraitEditor
										:character="character"
										:open="isSelected(['trait', s, entry.item.originalIndex])"
										v-show="submode === 'edit' && isSelected(['trait', s, entry.item.originalIndex])"
										:traitSetID="s"
										:traitID="entry.item.originalIndex"
										:viewY="viewY"
										@selectElement="selectElement"
										@updateCharacter="updateCharacter"
										@removeTrait="removeTrait"
									></TraitEditor>
								</transition>
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
