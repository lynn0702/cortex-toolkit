<script setup lang="ts">
import { injectTraitSetEditor } from './use-trait-set-editor.ts';
import TraitSetEditorRowMini from './trait-set-editor-row-mini.vue';

const {
	isRing,
	isPartsPreview,
	hasParts,
	hasCustomParts,
	hasCustomBranch,
	resetParts,
	openBlockMini,
	frameOptions,
	frameShape,
	setFrameShape,
	frameWidth,
	setFrameWidth,
	frameColor,
	setFrameColor,
	frameDash,
	setFrameDash,
	frameBox,
	setFrameBox,
} = injectTraitSetEditor();
</script>

<template>
	<!-- SECTION LAYOUT (set header always; trait-row cells for every row body) -->
	<div class="editor-field" v-if="!isRing">
		<div class="editor-row-between mb-sm">
			<div class="editor-label m-0">Section Layout</div>
			<button
				type="button"
				class="editor-group-btn btn-mini-open"
				@click.stop="openBlockMini"
				title="Open full Trait Block Mini (2D drag & drop, inventory, preset builder)"
			>
				<i class="fas fa-th-large" aria-hidden="true"></i> Trait Block Mini
			</button>
		</div>
		<div class="editor-field-hint" v-if="isPartsPreview">
			Preset row — dragging any box writes the row layout shown here.
		</div>
		<div class="editor-button-group mb-sm" v-if="hasCustomParts || hasCustomBranch">
			<button type="button" class="editor-group-btn" @click.stop="resetParts" title="Restore the preset arrangement">
				Reset
			</button>
		</div>
		<TraitSetEditorRowMini />
	</div>

	<!-- FRAME SELECTION -->
	<div class="editor-field" v-if="!isRing">
		<div class="editor-label">Frame</div>
		<div class="editor-button-group">
			<button
				v-for="opt in frameOptions"
				:key="opt.id"
				type="button"
				class="editor-group-btn"
				:class="{ active: (frameShape || 'none') === opt.id }"
				@click.stop="setFrameShape(opt.id)"
			>
				{{ opt.label }}
			</button>
		</div>
	</div>

	<!-- FRAME PARAMS -->
	<template v-if="!isRing && frameShape && frameShape !== 'none'">
		<div class="editor-field">
			<div class="editor-label">Frame Width</div>
			<div class="editor-button-group">
				<button
					v-for="w in ['1px', '1.5px', '2px', '3px', '4px']"
					:key="w"
					type="button"
					class="editor-group-btn"
					:class="{ active: frameWidth === w }"
					@click.stop="setFrameWidth(w)"
				>
					{{ w }}
				</button>
			</div>
		</div>

		<div class="editor-field">
			<div class="editor-label">Frame Color</div>
			<div class="editor-button-group">
				<button
					v-for="c in ['primary', 'accent', 'muted', 'strong', 'black']"
					:key="c"
					type="button"
					class="editor-group-btn"
					:class="{ active: frameColor === c }"
					@click.stop="setFrameColor(c)"
				>
					{{ c.charAt(0).toUpperCase() + c.slice(1) }}
				</button>
			</div>
		</div>

		<div class="editor-field">
			<div class="editor-label">Frame Dash</div>
			<input
				type="text"
				:value="frameDash"
				placeholder="Solid"
				@change="setFrameDash(($event.target as HTMLInputElement).value)"
			/>
		</div>

		<div class="editor-field" v-if="['ring', 'ellipse', 'arc'].includes(frameShape)">
			<div class="editor-label">Frame Box</div>
			<div class="editor-button-group">
				<button
					type="button"
					class="editor-group-btn"
					:class="{ active: frameBox }"
					@click.stop="setFrameBox(!frameBox)"
				>
					{{ frameBox ? 'Box On' : 'Box Off' }}
				</button>
			</div>
		</div>
	</template>
</template>
