<script setup lang="ts">
import { injectTraitSetEditor } from './use-trait-set-editor.ts';

const {
	isRing, ringAngle, ringAngleLabel, ringSpread, ringDistance, scaleAngle, scaleAngleLabel,
	scaleDistance, ringScaleX, ringScaleY, resetRingPlacement, scaleDieValue
} = injectTraitSetEditor();
</script>

<template>
	<!-- RING & SCALE DIE POSITIONING CONTROLS -->
	<div class="editor-field" v-if="isRing">
		<label>Ring & Scale Die Placement</label>

		<div class="ring-sliders">
			<div class="slider-row">
				<div class="slider-header">
					<span>Arc Position</span>
					<span class="slider-val">{{ ringAngleLabel }}</span>
				</div>
				<div class="ring-presets">
				<button type="button" class="btn-preset" :class="{ active: ringAngle === 0 }" @click.stop="ringAngle = 0">Bottom</button>
				<button type="button" class="btn-preset" :class="{ active: ringAngle === 90 }" @click.stop="ringAngle = 90">Left</button>
				<button type="button" class="btn-preset" :class="{ active: ringAngle === -90 }" @click.stop="ringAngle = -90">Right</button>
				<button type="button" class="btn-preset" :class="{ active: Math.abs(ringAngle) === 180 }" @click.stop="ringAngle = 180">Top</button>
				</div>
				<input type="range" min="-180" max="180" step="5" v-model.number="ringAngle">
			</div>

			<div class="slider-row">
				<div class="slider-header">
					<span>Arc Spread</span>
					<span class="slider-val">{{ ringSpread }}%</span>
				</div>
				<input type="range" min="40" max="160" step="5" v-model.number="ringSpread">
			</div>

			<div class="slider-row">
				<div class="slider-header">
					<span>Arc Distance</span>
					<span class="slider-val">{{ ringDistance > 0 ? '+' + ringDistance : ringDistance }} mm</span>
				</div>
				<input type="range" min="-15" max="25" step="1" v-model.number="ringDistance">
			</div>

			<div class="slider-row">
				<div class="slider-header">
					<span>Scale Die Angle</span>
					<span class="slider-val">{{ scaleAngleLabel }}</span>
				</div>
				<div class="ring-presets">
					<button type="button" class="btn-preset" :class="{ active: scaleAngle === 0 }" @click.stop="scaleAngle = 0">Bottom (0°)</button>
					<button type="button" class="btn-preset" :class="{ active: scaleAngle === 90 }" @click.stop="scaleAngle = 90">Left (+90°)</button>
					<button type="button" class="btn-preset" :class="{ active: scaleAngle === -90 }" @click.stop="scaleAngle = -90">Right (-90°)</button>
					<button type="button" class="btn-preset" :class="{ active: Math.abs(scaleAngle) === 180 }" @click.stop="scaleAngle = 180">Top (180°)</button>
				</div>
				<input type="range" min="-180" max="180" step="5" v-model.number="scaleAngle">
			</div>

			<div class="slider-row">
				<div class="slider-header">
					<span>Scale Die Distance</span>
					<span class="slider-val">{{ scaleDistance > 0 ? '+' + scaleDistance : scaleDistance }} mm</span>
				</div>
				<input type="range" min="-15" max="25" step="1" v-model.number="scaleDistance">
			</div>

			<div class="slider-row">
				<div class="slider-header">
					<span>Scale Die Offset X</span>
					<span class="slider-val">{{ ringScaleX > 0 ? '+' + ringScaleX : ringScaleX }} mm</span>
				</div>
				<input type="range" min="-40" max="40" step="1" v-model.number="ringScaleX">
			</div>

			<div class="slider-row">
				<div class="slider-header">
					<span>Scale Die Offset Y</span>
					<span class="slider-val">{{ ringScaleY > 0 ? '+' + ringScaleY : ringScaleY }} mm</span>
				</div>
				<input type="range" min="-40" max="40" step="1" v-model.number="ringScaleY">
			</div>

			<div class="slider-actions">
				<button type="button" class="btn-reset-ring" @click.stop="resetRingPlacement">
					<i class="fas fa-rotate-left"></i> Reset to Defaults
				</button>
			</div>
		</div>
	</div>

	<!-- SCALE DIE OPTION FOR RING -->
	<div class="editor-field" v-if="isRing">
		<label>Scale Die</label>
		<select v-model.number="scaleDieValue">
			<option :value="0">None</option>
			<option :value="4">d4</option>
			<option :value="6">d6</option>
			<option :value="8">d8</option>
			<option :value="10">d10</option>
			<option :value="12">d12</option>
		</select>
	</div>
</template>
