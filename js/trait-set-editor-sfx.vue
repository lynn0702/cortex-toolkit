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
