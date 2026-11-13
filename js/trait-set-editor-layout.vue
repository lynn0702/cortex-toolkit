<script setup lang="ts">
import { injectTraitSetEditor } from './use-trait-set-editor.ts';
import TraitSetEditorRowMini from './trait-set-editor-row-mini.vue';
import ColorPicker from './color-picker.vue';

const {
	traitSetID,
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
	frameColorTokens,
	setFrameColor,
	frameTint,
	setFrameTint,
	frameDash,
	setFrameDash,
	frameBox,
	setFrameBox,
	frameImageUrl,
	frameImageAlignment,
	frameImageZoom,
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
			<ColorPicker
				:model-value="frameColor"
				:input-id="'ts-' + traitSetID + '-frame-color'"
				label="Frame Color"
				:tokens="frameColorTokens"
				@update:model-value="setFrameColor"
			/>
		</div>

		<div class="editor-field" v-if="frameShape === 'block'">
			<div class="editor-label">Frame Fill</div>
			<ColorPicker
				:model-value="frameTint"
				:input-id="'ts-' + traitSetID + '-frame-tint'"
				label="Frame Fill"
				fallback-hex="#ffffff"
				:allow-clear="true"
				clear-label="Clear"
				@update:model-value="setFrameTint"
				@clear="setFrameTint('')"
			/>
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

		<!-- FRAME IMAGE CONTROLS -->
		<template v-if="frameShape !== 'line'">
			<div class="editor-field">
				<div class="editor-label">Frame Image URL</div>
				<input
					type="text"
					v-model.lazy="frameImageUrl"
					placeholder="https://example.com/illustration.jpg"
					aria-label="Frame Image URL"
				/>
			</div>

			<div class="editor-field" v-if="frameImageUrl">
				<div class="editor-label">Frame Image Focus</div>
				<div class="editor-portrait-alignment">
					<div
						@click.stop="frameImageAlignment = 'top-left'"
						:class="{ active: frameImageAlignment === 'top-left' }"
					></div>
					<div
						@click.stop="frameImageAlignment = 'top-center'"
						:class="{ active: frameImageAlignment === 'top-center' }"
					></div>
					<div
						@click.stop="frameImageAlignment = 'top-right'"
						:class="{ active: frameImageAlignment === 'top-right' }"
					></div>
					<div
						@click.stop="frameImageAlignment = 'center-left'"
						:class="{ active: frameImageAlignment === 'center-left' }"
					></div>
					<div @click.stop="frameImageAlignment = 'center'" :class="{ active: frameImageAlignment === 'center' }"></div>
					<div
						@click.stop="frameImageAlignment = 'center-right'"
						:class="{ active: frameImageAlignment === 'center-right' }"
					></div>
					<div
						@click.stop="frameImageAlignment = 'bottom-left'"
						:class="{ active: frameImageAlignment === 'bottom-left' }"
					></div>
					<div
						@click.stop="frameImageAlignment = 'bottom-center'"
						:class="{ active: frameImageAlignment === 'bottom-center' }"
					></div>
					<div
						@click.stop="frameImageAlignment = 'bottom-right'"
						:class="{ active: frameImageAlignment === 'bottom-right' }"
					></div>
				</div>
			</div>

			<div class="editor-field" v-if="frameImageUrl">
				<div class="editor-row-between">
					<div class="editor-label m-0">Frame Image Zoom</div>
					<span class="slider-val">{{ Math.round((frameImageZoom ?? 1) * 100) }}%</span>
				</div>
				<input
					type="range"
					min="0.5"
					max="2"
					step="0.05"
					v-model.number="frameImageZoom"
					aria-label="Frame Image Zoom"
				/>
			</div>
		</template>
	</template>
</template>
