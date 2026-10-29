<script setup lang="ts">
import { injectTraitSetEditor } from './use-trait-set-editor.ts';
import TraitSetEditorRowMini from './trait-set-editor-row-mini.vue';

const {
	isRing, isSpotlightSheet,
	isPartsPreview, hasParts, hasCustomParts, hasCustomBranch, resetParts,
	openBlockMini,
	frameOptions, frameShape, setFrameShape
} = injectTraitSetEditor();
</script>

<template>
	<!-- SECTION LAYOUT (set header always; trait-row cells for every row body) -->
	<div class="editor-field" v-if="!isRing && isSpotlightSheet">
		<div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.35rem;">
			<div class="editor-label" style="margin: 0;">Section Layout</div>
			<button
				type="button"
				class="editor-group-btn"
				style="font-size: 0.74rem; padding: 0.22rem 0.55rem; background: rgba(56, 189, 248, 0.16); border: 1px solid #38bdf8; color: #38bdf8; border-radius: 4px; cursor: pointer;"
				@click.stop="openBlockMini"
				title="Open full Trait Block Mini (2D drag & drop, inventory, preset builder)"
			>
				<i class="fas fa-th-large" aria-hidden="true"></i> Trait Block Mini
			</button>
		</div>
		<div class="editor-field-hint" v-if="isPartsPreview" style="font-size: 0.72rem; color: #94a3b8; margin-bottom: 0.4rem;">
			Preset row — dragging any box writes the row layout shown here.
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

	<!-- FRAME SELECTION -->
	<div class="editor-field" v-if="!isRing && isSpotlightSheet">
		<div class="editor-label">Frame</div>
		<div class="editor-button-group">
			<button
				v-for="opt in frameOptions"
				:key="opt.id"
				type="button"
				class="editor-group-btn"
				:class="{ 'active': (frameShape || 'none') === opt.id }"
				@click.stop="setFrameShape( opt.id )"
			>
				{{ opt.label }}
			</button>
		</div>
	</div>
</template>
