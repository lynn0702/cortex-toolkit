<script setup lang="ts">
import { injectTraitSetEditor } from './use-trait-set-editor.ts';
import SfxEditor from './sfx-editor.vue';

const { traitSet, traitSetID, character, addEffect, removeEffect, updateCharacter } = injectTraitSetEditor();
</script>

<template>
	<!-- SFX -->
	<div class="editor-field" v-if="traitSet.custom.cortexToolkit.features.sfx">

		<label>Trait Set SFX</label>

		<div class="editor-subgroups">

			<transition-group appear>
				<SfxEditor
					v-for="(effect, effectID) in traitSet.sfx"
					:key="traitSetID + '-' + effectID"
					:character="character"
					:traitSetID="traitSetID"
					:traitID="null"
					:effectID="effectID"
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
