<script setup lang="ts">
import { getView } from './model.ts';
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
	hasCounterColumn, getCounterLabel
} = ts;

const headerTop = computed( () => getView(traitSet.value)?.header === 'top' );

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
	<div :class="getTraitSetClasses(traitSet)">
		<div class="trait-set-header">
			<transition appear>
				<div :class="{'trait-set-header-inner': true, 'selected': isSelected(['traitSet', s])}"
					@click.stop="selectElement([ 'traitSet', s ])"
				>
					<div class="trait-set-header-name">{{ traitSet.name }}</div>
					<div class="trait-set-header-counter" v-if="headerTop && hasCounterColumn(traitSet)">{{ getCounterLabel(traitSet) }}</div>
				</div>
			</transition>
		</div>

		<div class="trait-set-body">
			<component :is="bodyComponent" />

			<ul class="sfx" v-if="getView(traitSet)?.features?.sfx && traitSet?.sfx?.length">
				<li v-for="(sfx, sfId) in (traitSet.sfx || [])" :key="(sfx && sfx._lid) || ('sfx' + sfId)">
					<span class="sfx-name">{{ sfx.name }}</span>:
					<span class="sfx-description" v-html="renderText(sfx.description)"></span>
				</li>
			</ul>
		</div>
	</div>
</template>
