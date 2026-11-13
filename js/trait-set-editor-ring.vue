<script setup lang="ts">
import { injectTraitSetEditor } from './use-trait-set-editor.ts';
import ColorPicker from './color-picker.vue';

const {
	isRing,
	ringAngle,
	ringAngleLabel,
	ringSpread,
	ringDistance,
	scaleAngle,
	scaleAngleLabel,
	scaleDistance,
	ringScaleX,
	ringScaleY,
	resetRingPlacement,
	scaleDieValue,
	getDieDisplayValue,
	traitSetID,
	frameSize,
	setFrameSize,
	frameColor,
	frameColorTokens,
	setFrameColor,
} = injectTraitSetEditor();
</script>

<template>
	<!-- RING & SCALE DIE POSITIONING CONTROLS -->
	<div class="editor-field" v-if="isRing">
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

	<div class="editor-field" v-if="isRing">
		<div class="editor-label">Frame Color</div>
		<ColorPicker
			:model-value="frameColor"
			:input-id="'ts-ring-' + traitSetID + '-frame-color'"
			label="Frame Color"
			:tokens="frameColorTokens"
			@update:model-value="setFrameColor"
		/>
	</div>

	<div class="editor-field" v-if="isRing">
		<div class="ring-sliders">
			<div class="slider-row">
				<div class="slider-header">
					<span>Arc Position</span>
					<span class="slider-val">{{ ringAngleLabel }}</span>
				</div>
				<div class="ring-presets">
					<button
						type="button"
						class="btn-preset"
						:class="{ active: ringAngle === 0 }"
						:aria-pressed="ringAngle === 0"
						@click.stop="ringAngle = 0"
					>
						Bottom
					</button>
					<button
						type="button"
						class="btn-preset"
						:class="{ active: ringAngle === 90 }"
						:aria-pressed="ringAngle === 90"
						@click.stop="ringAngle = 90"
					>
						Left
					</button>
					<button
						type="button"
						class="btn-preset"
						:class="{ active: ringAngle === -90 }"
						:aria-pressed="ringAngle === -90"
						@click.stop="ringAngle = -90"
					>
						Right
					</button>
					<button
						type="button"
						class="btn-preset"
						:class="{ active: Math.abs(ringAngle) === 180 }"
						:aria-pressed="Math.abs(ringAngle) === 180"
						@click.stop="ringAngle = 180"
					>
						Top
					</button>
				</div>
				<input
					type="range"
					:id="'trait-set-' + traitSetID + '-ring-angle'"
					name="ringAngle"
					aria-label="Arc Position"
					min="-180"
					max="180"
					step="5"
					v-model.number="ringAngle"
				/>
			</div>

			<div class="editor-grid-2">
				<div class="slider-row">
					<div class="slider-header">
						<span>Arc Spread</span>
						<span class="slider-val">{{ ringSpread }}%</span>
					</div>
					<input
						type="range"
						:id="'trait-set-' + traitSetID + '-ring-spread'"
						name="ringSpread"
						aria-label="Arc Spread"
						min="40"
						max="160"
						step="5"
						v-model.number="ringSpread"
					/>
				</div>

				<div class="slider-row">
					<div class="slider-header">
						<span>Arc Distance</span>
						<span class="slider-val">{{ ringDistance > 0 ? '+' + ringDistance : ringDistance }} mm</span>
					</div>
					<input
						type="range"
						:id="'trait-set-' + traitSetID + '-ring-distance'"
						name="ringDistance"
						aria-label="Arc Distance"
						min="-15"
						max="25"
						step="1"
						v-model.number="ringDistance"
					/>
				</div>
			</div>
		</div>
	</div>

	<!-- SCALE DIE OPTION FOR RING -->
	<div class="editor-field" v-if="isRing">
		<div class="editor-label">Scale Die</div>
		<div class="rating-scale-container">
			<div class="rating-scale-chips">
				<button
					type="button"
					class="rating-scale-chip set-rating-die-none"
					:class="{ active: scaleDieValue === 0 }"
					:aria-pressed="scaleDieValue === 0"
					aria-label="Clear Scale Die"
					@click.stop="scaleDieValue = 0"
				>
					<span class="chip-label">None</span>
				</button>
				<button
					v-for="s in [4, 6, 8, 10, 12]"
					:key="'scale-opt-' + s"
					type="button"
					class="rating-scale-chip"
					:class="{ active: scaleDieValue === s }"
					:aria-pressed="scaleDieValue === s"
					:aria-label="'Set Scale Die d' + s"
					:title="'d' + s"
					@click.stop="scaleDieValue = s"
				>
					<span v-html="getDieDisplayValue(s, scaleDieValue === s)"></span>
				</button>
			</div>
		</div>
	</div>

	<div class="editor-field" v-if="isRing">
		<div class="ring-sliders">
			<div class="slider-row">
				<div class="slider-header">
					<span>Scale Die Angle</span>
					<span class="slider-val">{{ scaleAngleLabel }}</span>
				</div>
				<div class="ring-presets">
					<button
						type="button"
						class="btn-preset"
						:class="{ active: scaleAngle === 0 }"
						:aria-pressed="scaleAngle === 0"
						@click.stop="scaleAngle = 0"
					>
						Bottom
					</button>
					<button
						type="button"
						class="btn-preset"
						:class="{ active: scaleAngle === 90 }"
						:aria-pressed="scaleAngle === 90"
						@click.stop="scaleAngle = 90"
					>
						Left
					</button>
					<button
						type="button"
						class="btn-preset"
						:class="{ active: scaleAngle === -90 }"
						:aria-pressed="scaleAngle === -90"
						@click.stop="scaleAngle = -90"
					>
						Right
					</button>
					<button
						type="button"
						class="btn-preset"
						:class="{ active: Math.abs(scaleAngle) === 180 }"
						:aria-pressed="Math.abs(scaleAngle) === 180"
						@click.stop="scaleAngle = 180"
					>
						Top
					</button>
				</div>
				<input
					type="range"
					:id="'trait-set-' + traitSetID + '-scale-angle'"
					name="scaleAngle"
					aria-label="Scale Die Angle"
					min="-180"
					max="180"
					step="5"
					v-model.number="scaleAngle"
				/>
			</div>

			<div class="slider-row">
				<div class="slider-header">
					<span>Scale Die Distance</span>
					<span class="slider-val">{{ scaleDistance > 0 ? '+' + scaleDistance : scaleDistance }} mm</span>
				</div>
				<input
					type="range"
					:id="'trait-set-' + traitSetID + '-scale-distance'"
					name="scaleDistance"
					aria-label="Scale Die Distance"
					min="-15"
					max="25"
					step="1"
					v-model.number="scaleDistance"
				/>
			</div>

			<div class="editor-grid-2">
				<div class="slider-row">
					<div class="slider-header">
						<span>Offset X</span>
						<span class="slider-val">{{ ringScaleX > 0 ? '+' + ringScaleX : ringScaleX }} mm</span>
					</div>
					<input
						type="range"
						:id="'trait-set-' + traitSetID + '-ring-scale-x'"
						name="ringScaleX"
						aria-label="Scale Die Offset X"
						min="-40"
						max="40"
						step="1"
						v-model.number="ringScaleX"
					/>
				</div>

				<div class="slider-row">
					<div class="slider-header">
						<span>Offset Y</span>
						<span class="slider-val">{{ ringScaleY > 0 ? '+' + ringScaleY : ringScaleY }} mm</span>
					</div>
					<input
						type="range"
						:id="'trait-set-' + traitSetID + '-ring-scale-y'"
						name="ringScaleY"
						aria-label="Scale Die Offset Y"
						min="-40"
						max="40"
						step="1"
						v-model.number="ringScaleY"
					/>
				</div>
			</div>

			<div class="slider-actions">
				<button type="button" class="btn-reset-ring" @click.stop="resetRingPlacement">
					<i class="fas fa-rotate-left" aria-hidden="true"></i> Reset to Defaults
				</button>
			</div>
		</div>
	</div>
</template>
