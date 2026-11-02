<script setup lang="ts">
import { computed } from 'vue';
import { cortexFunctions } from './functions.ts';
import { injectTraitSetEditor } from './use-trait-set-editor.ts';
import SubtraitEditor from './subtrait-editor.vue';

const { traitSet, traitSetID, character, updateCharacter } = injectTraitSetEditor();

const sfxEntries = computed( () => cortexFunctions.sfxChildren( traitSet.value ) );

function addSfxEntry() {
	const container = cortexFunctions.ensureSfxContainer( traitSet.value );
	if ( container && Array.isArray( container.traits ) ) {
		container.traits.push( structuredClone( cortexFunctions.defaultSFX ) );
	}
	updateCharacter( character );
}

function removeSfxEntry( entryIndex: number ) {
	cortexFunctions.removeSfxAt( traitSet.value, entryIndex );
	updateCharacter( character );
}
</script>

<template>
	<!-- SFX -->
	<div class="editor-field">

		<div class="editor-subgroups">

			<transition-group appear>
				<subtrait-editor
					v-for="(entry, entryIndex) in sfxEntries"
					:key="traitSetID + '-' + entryIndex"
					:character="character"
					:traitSetID="traitSetID"
					:traitID="null"
					:subtraitID="entryIndex"
					:entries="sfxEntries"
					entryLabel="SFX"
					@updateCharacter="updateCharacter"
					@removeSubtrait="removeSfxEntry"
				></subtrait-editor>
			</transition-group>

		</div>

		<div class="editor-button-container">
			<div class="editor-button-container-inner">
				<div class="editor-button" @click.stop="addSfxEntry">
					<span><i class="fas fa-plus"></i> New SFX</span>
				</div>
			</div>
		</div>

	</div>
</template>
