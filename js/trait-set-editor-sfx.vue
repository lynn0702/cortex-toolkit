<script setup lang="ts">
import { computed } from 'vue';
import { getView } from './model.ts';
import { cortexFunctions } from './functions.ts';
import { injectTraitSetEditor } from './use-trait-set-editor.ts';
import SfxEditor from './sfx-editor.vue';

const { traitSet, traitSetID, character, addEffect, removeEffect, updateCharacter, styleLabel, setStyleLabel, targetValue } = injectTraitSetEditor();

const sfxEntries = computed( () => cortexFunctions.sfxChildren( traitSet.value ) );
</script>

<template>
	<!-- SFX -->
	<div class="editor-field">

		<div style="display: flex; gap: 0.5rem; margin-bottom: 0.4rem;">
			<div style="flex: 1;">
				<label :for="'trait-set-' + traitSetID + '-sfx-badge'" style="font-size: 0.7rem; color: #64748b; display: block; margin-bottom: 0.2rem;">Badge Word</label>
				<input type="text" :id="'trait-set-' + traitSetID + '-sfx-badge'" name="sfxBadge" :value="styleLabel('sfxBadge')" @change="setStyleLabel('sfxBadge', targetValue($event))" :placeholder="styleLabel('sfxBadge')">
			</div>
			<div style="flex: 1;">
				<label :for="'trait-set-' + traitSetID + '-sfx-prefix'" style="font-size: 0.7rem; color: #64748b; display: block; margin-bottom: 0.2rem;">Line Prefix</label>
				<input type="text" :id="'trait-set-' + traitSetID + '-sfx-prefix'" name="sfxPrefix" :value="styleLabel('sfxPrefix')" @change="setStyleLabel('sfxPrefix', targetValue($event))" :placeholder="styleLabel('sfxPrefix')">
			</div>
		</div>

		<div class="editor-subgroups">

			<transition-group appear>
				<SfxEditor
					v-for="(effect, effectID) in sfxEntries"
					:key="traitSetID + '-' + effectID"
					:character="character"
					:traitSetID="traitSetID"
					:traitID="null"
					:effectID="Number(effectID)"
					@updateCharacter="updateCharacter"
					@removeEffect="removeEffect"
				></SfxEditor>
			</transition-group>

		</div>

		<div class="editor-button-container">
			<div class="editor-button-container-inner">
				<div class="editor-button" @click.stop="addEffect">
					<span><i class="fas fa-plus"></i> New SFX</span>
				</div>
			</div>
		</div>

	</div>
</template>
