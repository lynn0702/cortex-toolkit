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
	frameSize,
	setFrameSize,
	framePosition,
	setFramePosition,
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
				:aria-pressed="(frameShape || 'none') === opt.id"
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
					:aria-pressed="frameWidth === w"
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
			<div class="editor-row-between">
				<div class="editor-label m-0">Ring Size</div>
				<div class="editor-row-actions">
					<span class="slider-val">{{ frameSize ? frameSize + 'px' : 'Auto' }}</span>
					<button
						v-if="frameSize !== null"
						type="button"
						class="editor-group-btn"
						@click.stop="setFrameSize(null)"
						aria-label="Reset ring size"
					>
						Auto
					</button>
				</div>
			</div>
			<input
				type="range"
				min="120"
				max="360"
				step="10"
				:value="frameSize ?? 240"
				@input="setFrameSize(Number(($event.target as HTMLInputElement).value))"
				aria-label="Ring Size"
			/>
		</div>

		<div class="editor-field" v-if="frameShape === 'ring'">
			<div class="editor-label">Ring Position</div>
			<div class="editor-button-group">
				<button
					type="button"
					class="editor-group-btn"
					:class="{ active: framePosition === 'left' }"
					:aria-pressed="framePosition === 'left'"
					@click.stop="setFramePosition('left')"
				>
					Left
				</button>
				<button
					type="button"
					class="editor-group-btn"
					:class="{ active: framePosition === 'center' }"
					:aria-pressed="framePosition === 'center'"
					@click.stop="setFramePosition('center')"
				>
					Center
				</button>
				<button
					type="button"
					class="editor-group-btn"
					:class="{ active: framePosition === 'right' }"
					:aria-pressed="framePosition === 'right'"
					@click.stop="setFramePosition('right')"
				>
					Right
				</button>
			</div>
		</div>

		<div class="editor-field" v-if="['ring', 'ellipse', 'arc'].includes(frameShape)">
			<div class="editor-label">Frame Box</div>
			<div class="editor-button-group">
				<button
					type="button"
					class="editor-group-btn"
					:class="{ active: frameBox }"
					:aria-pressed="frameBox"
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
				<div class="editor-focus-zoom-row">
					<div>
						<div class="editor-label">Image Focus</div>
						<div class="editor-portrait-alignment">
							<button
								v-for="pos in [
									'top-left',
									'top-center',
									'top-right',
									'center-left',
									'center',
									'center-right',
									'bottom-left',
									'bottom-center',
									'bottom-right',
								]"
								:key="pos"
								type="button"
								:aria-label="'Align ' + pos.replace('-', ' ')"
								:aria-pressed="frameImageAlignment === pos"
								:class="{ active: frameImageAlignment === pos }"
								@click.stop="frameImageAlignment = pos"
							></button>
						</div>
					</div>
					<div class="editor-focus-zoom-slider">
						<div class="editor-row-between">
							<div class="editor-label m-0">Image Zoom</div>
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
				</div>
			</div>
		</template>
	</template>
</template>
