<script setup lang="ts">
import { getView } from './model.ts';
import { cortexFunctions } from './functions.ts';
import { computed } from 'vue';
import { useTraitSet } from './use-trait-set.ts';
import TraitSetImage from './trait-set-image.vue';
import TraitSetNotes from './trait-set-notes.vue';
import TraitSetPips from './trait-set-pips.vue';
import TraitSetDiceLadder from './trait-set-dice-ladder.vue';
import TraitSetLabeledFields from './trait-set-labeled-fields.vue';
import TraitSetSubtraitColumns from './trait-set-subtrait-columns.vue';
import TraitSetThreeColumnTable from './trait-set-three-column-table.vue';
import TraitSetPairedSlots from './trait-set-paired-slots.vue';
import TraitSetDieRows from './trait-set-die-rows.vue';
import TraitSetDiceCount from './trait-set-dice-count.vue';
import TraitSetList from './trait-set-list.vue';

const props = defineProps<{
	character: any;
	traitSetID?: number;
	submode?: string | null;
	editing?: any;
	viewY?: number | null;
	printBlank?: boolean;
	printStyle?: string | null;
}>();

const emit = defineEmits<{
	( e: 'selectElement', selector: any[] ): void;
	( e: 'updateCharacter', character: any ): void;
	( e: 'removeTrait', traitSetID: number, traitID: number ): void;
	( e: 'removeTraitSet', traitSetID: number ): void;
	( e: 'addTrait', traitSetID: number ): void;
	( e: 'addDieToRoller', die: any ): void;
}>();

const ts = useTraitSet( props, emit );

const {
	traitSet, s, submode, viewY, character,
	getTraitSetClasses, isSelected, renderText, selectElement, updateCharacter, removeTraitSet,
	hasCounterColumn, getCounterLabel, isHiddenIn,
	resolvedFrame, isFrameActive, isFrameForcedOff, frameToggledOff, frameSvgPath, frameStrokeClass, frameStrokeStyle
} = ts;

const canRemoveSetInPlay = computed( () => {
	const v = getView( traitSet.value );
	return Boolean( v?.playMutable || v?.visibility === 'play-only' );
} );

const headerTop = computed( () => getView(traitSet.value)?.header === 'top' );

const setSfxEntries = computed( () => cortexFunctions.sfxChildren( traitSet.value ) );

const BODY_COMPONENTS: Record<string, any> = {
	'image': TraitSetImage,
	'notes': TraitSetNotes,
	'pips': TraitSetPips,
	'dice-ladder': TraitSetDiceLadder,
	'labeled-fields': TraitSetLabeledFields,
	'subtrait-columns': TraitSetSubtraitColumns,
	'three-column-table': TraitSetThreeColumnTable,
	'paired-slots': TraitSetPairedSlots,
	'die-rows': TraitSetDieRows,
	'dice-count': TraitSetDiceCount
};

const bodyComponent = computed( () => {
	const style = getView(traitSet.value)?.style?.body;
	return ( style && BODY_COMPONENTS[ style ] ) || TraitSetList;
} );
</script>

<template>
	<section
		v-if="traitSet && !isHiddenIn(traitSet, submode)"
		:class="getTraitSetClasses(traitSet)"
		:data-set-index="s"
		:data-set-name="traitSet.name || undefined"
		:aria-label="traitSet.name || 'Trait Set'"
	>
		<div class="trait-set-header">
			<transition appear>
				<div
					:class="{'trait-set-header-inner': true, 'selected': isSelected(['traitSet', s])}"
					:role="submode === 'edit' ? 'button' : undefined"
					:tabindex="submode === 'edit' ? 0 : undefined"
					:aria-label="submode === 'edit' ? ('Edit ' + (traitSet.name || 'trait set')) : undefined"
					@keydown.enter.prevent="submode === 'edit' ? selectElement([ 'traitSet', s ]) : null"
					@keydown.space.prevent="submode === 'edit' ? selectElement([ 'traitSet', s ]) : null"
					@click.stop="submode === 'edit' ? selectElement([ 'traitSet', s ]) : null"
				>
					<div class="trait-set-header-name">{{ traitSet.name }}</div>
					<div class="trait-set-header-counter" v-if="headerTop && hasCounterColumn(traitSet)">{{ getCounterLabel(traitSet) }}</div>
					<button
						v-if="submode === 'play' && canRemoveSetInPlay"
						type="button"
						class="trait-set-play-remove-btn"
						title="Remove card from session"
						aria-label="Remove card from session"
						@click.stop="removeTraitSet(s)"
					>
						<i class="fas fa-times"></i>
					</button>
				</div>
			</transition>
			<button
				v-if="resolvedFrame && resolvedFrame.shape !== 'line'"
				type="button"
				class="trait-set-frame-toggle-btn"
				:class="{ 'frame-off': !isFrameActive }"
				:aria-pressed="isFrameActive ? 'true' : 'false'"
				:title="isFrameActive ? 'Toggle frame off' : (isFrameForcedOff ? 'Frame forced off on mobile' : 'Toggle frame on')"
				:aria-label="isFrameActive ? 'Toggle frame off' : 'Toggle frame on'"
				@click.stop="frameToggledOff = !frameToggledOff"
			>
				<i class="fas fa-vector-square"></i>
			</button>
		</div>

		<div class="trait-set-body" :class="{ 'trait-set-body-framed': isFrameActive && resolvedFrame?.shape === 'block' }">
			<!-- Bare-path divider if line -->
			<svg
				v-if="resolvedFrame?.shape === 'line'"
				class="trait-set-frame-svg frame-line-svg"
				:class="frameStrokeClass"
				:style="frameStrokeStyle"
				aria-hidden="true"
				focusable="false"
				viewBox="0 0 100 12"
				preserveAspectRatio="none"
			>
				<path :d="frameSvgPath" vector-effect="non-scaling-stroke" />
			</svg>

			<!-- Block frame SVG behind body -->
			<svg
				v-if="isFrameActive && resolvedFrame?.shape === 'block'"
				class="trait-set-frame-svg frame-block-svg"
				:class="frameStrokeClass"
				:style="frameStrokeStyle"
				aria-hidden="true"
				focusable="false"
				viewBox="0 0 100 100"
				preserveAspectRatio="none"
			>
				<path :d="frameSvgPath" vector-effect="non-scaling-stroke" />
			</svg>

			<component :is="bodyComponent" />

			<ul class="sfx" v-if="getView(traitSet)?.features?.sfx && setSfxEntries.length">
				<li v-for="(sfx, sfId) in setSfxEntries" :key="(sfx && sfx._lid) || ('sfx' + sfId)">
					<span class="sfx-name">{{ sfx.name }}</span>:
					<span class="sfx-description" v-html="renderText(sfx.description)"></span>
				</li>
			</ul>
		</div>
	</section>
</template>
