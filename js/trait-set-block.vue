<script setup lang="ts">
import { computed } from 'vue';
import TraitSetEditor from './trait-set-editor.vue';
import { useTraitSet } from './use-trait-set.ts';
import TraitSetImage from './trait-set-image.vue';
import TraitSetNotes from './trait-set-notes.vue';
import TraitSetPips from './trait-set-pips.vue';
import TraitSetSessionRecord from './trait-set-session-record.vue';
import TraitSetGrowthLadder from './trait-set-growth-ladder.vue';
import TraitSetDossier from './trait-set-dossier.vue';
import TraitSetSkills from './trait-set-skills.vue';
import TraitSetTalents from './trait-set-talents.vue';
import TraitSetStanding from './trait-set-standing.vue';
import TraitSetBadges from './trait-set-badges.vue';
import TraitSetResourcesCount from './trait-set-resources-count.vue';
import TraitSetList from './trait-set-list.vue';

const props = defineProps<{
	character?: any;
	traitSetID?: number;
	submode?: string | null;
	editing?: any;
	viewY?: number | null;
	printBlank?: boolean;
	designerPrintPreview?: boolean;
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
	getTraitSetClasses, isSelected, renderText, selectElement, updateCharacter, removeTraitSet
} = ts;

const BODY_COMPONENTS: Record<string, any> = {
	'image': TraitSetImage,
	'notes': TraitSetNotes,
	'pips': TraitSetPips,
	'session-record': TraitSetSessionRecord,
	'angled-lines': TraitSetSessionRecord,
	'growth-ladder': TraitSetGrowthLadder,
	'dossier-fields': TraitSetDossier,
	'skills-specialties': TraitSetSkills,
	'talents-table': TraitSetTalents,
	'standing': TraitSetStanding,
	'badges-table': TraitSetBadges,
	'resources-count': TraitSetResourcesCount
};

const bodyComponent = computed( () => {
	const style = traitSet.value?.custom?.cortexToolkit?.style?.body;
	return BODY_COMPONENTS[ style ] || TraitSetList;
} );
</script>

<template>
	<div :class="getTraitSetClasses(traitSet)">
		<div class="trait-set-header">
			<transition appear>
				<div :class="{'trait-set-header-inner': true, 'selected': isSelected(['traitSet', s])}"
					@click.stop="selectElement([ 'traitSet', s ])"
				>
					<div>{{ traitSet.name }}</div>
				</div>
			</transition>

			<transition name="editor" appear>
				<TraitSetEditor
					:character="character"
					:open="isSelected(['traitSet', s])"
					v-show="submode === 'edit' && isSelected(['traitSet', s])"
					:traitSetID="s"
					:viewY="viewY"
					@selectElement="selectElement"
					@updateCharacter="updateCharacter"
					@removeTraitSet="removeTraitSet"
				></TraitSetEditor>
			</transition>
		</div>

		<div class="trait-set-body">
			<component :is="bodyComponent" />

			<ul class="sfx" v-if="traitSet?.custom?.cortexToolkit?.features?.sfx && traitSet?.sfx?.length">
				<li v-for="(sfx, sfId) in (traitSet.sfx || [])" :key="(sfx && sfx._lid) || ('sfx' + sfId)">
					<span class="sfx-name">{{ sfx.name }}</span>:
					<span class="sfx-description" v-html="renderText(sfx.description)"></span>
				</li>
			</ul>
		</div>

		<!-- RIGHT HEADER (OPTIONAL VERTICAL LABEL) -->
		<div class="trait-set-header trait-set-header-right" v-if="traitSet?.custom?.cortexToolkit?.headerRight">
			<div class="trait-set-header-inner">
				<div>{{ traitSet.custom?.cortexToolkit?.headerRight || '' }}</div>
			</div>
		</div>
	</div>
</template>
