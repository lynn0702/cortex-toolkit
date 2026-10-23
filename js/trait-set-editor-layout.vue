<script setup lang="ts">
import { injectTraitSetEditor } from './use-trait-set-editor.ts';
import TraitSetEditorRowMini from './trait-set-editor-row-mini.vue';

const {
	isRing, isSpotlightSheet,
	isPartsPreview, hasParts, hasCustomParts, hasCustomBranch, resetParts,
} = injectTraitSetEditor();
</script>

<template>
	<!-- SECTION LAYOUT (set header always; trait-row cells for every row body) -->
	<div class="editor-field" v-if="!isRing && isSpotlightSheet">
		<div class="editor-label">Section Layout</div>
		<div class="editor-field-hint" v-if="isPartsPreview" style="font-size: 0.72rem; color: #94a3b8; margin-bottom: 0.4rem;">
			Preset row — dragging any box writes the layout shown here.
		</div>
		<div class="editor-button-group" style="margin-bottom: 0.4rem;" v-if="hasCustomParts || hasCustomBranch">
			<button
				type="button"
				class="editor-group-btn"
				@click.stop="resetParts"
				title="Restore the preset arrangement"
			>
				Reset
			</button>
		</div>
		<TraitSetEditorRowMini />
	</div>
</template>
