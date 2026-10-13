<script setup lang="ts">
import { injectTraitSetEditor } from './use-trait-set-editor.ts';

const {
	isHalo, haloAngle, haloAngleLabel, haloSpread, haloDistance, scaleAngle, scaleAngleLabel,
	scaleDistance, haloScaleX, haloScaleY, resetHaloPlacement, scaleDieValue
} = injectTraitSetEditor();
</script>

<template>
	<!-- HALO & SCALE DIE POSITIONING CONTROLS -->
	<div class="editor-field" v-if="isHalo">
		<label>Halo & Scale Die Placement</label>

		<div class="halo-sliders">
			<div class="slider-row">
				<div class="slider-header">
					<span>Arc Position</span>
					<span class="slider-val">{{ haloAngleLabel }}</span>
				</div>
				<div class="halo-presets">
				<button type="button" class="btn-preset" :class="{ active: haloAngle === 0 }" @click.stop="haloAngle = 0">Bottom</button>
				<button type="button" class="btn-preset" :class="{ active: haloAngle === 90 }" @click.stop="haloAngle = 90">Left</button>
				<button type="button" class="btn-preset" :class="{ active: haloAngle === -90 }" @click.stop="haloAngle = -90">Right</button>
				<button type="button" class="btn-preset" :class="{ active: Math.abs(haloAngle) === 180 }" @click.stop="haloAngle = 180">Top</button>
				</div>
				<input type="range" min="-180" max="180" step="5" v-model.number="haloAngle">
			</div>

			<div class="slider-row">
				<div class="slider-header">
					<span>Arc Spread</span>
					<span class="slider-val">{{ haloSpread }}%</span>
				</div>
				<input type="range" min="40" max="160" step="5" v-model.number="haloSpread">
			</div>

			<div class="slider-row">
				<div class="slider-header">
					<span>Arc Distance</span>
					<span class="slider-val">{{ haloDistance > 0 ? '+' + haloDistance : haloDistance }} mm</span>
				</div>
				<input type="range" min="-15" max="25" step="1" v-model.number="haloDistance">
			</div>

			<div class="slider-row">
				<div class="slider-header">
					<span>Scale Die Angle</span>
					<span class="slider-val">{{ scaleAngleLabel }}</span>
				</div>
				<div class="halo-presets">
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
					<span class="slider-val">{{ haloScaleX > 0 ? '+' + haloScaleX : haloScaleX }} mm</span>
				</div>
				<input type="range" min="-40" max="40" step="1" v-model.number="haloScaleX">
			</div>

			<div class="slider-row">
				<div class="slider-header">
					<span>Scale Die Offset Y</span>
					<span class="slider-val">{{ haloScaleY > 0 ? '+' + haloScaleY : haloScaleY }} mm</span>
				</div>
				<input type="range" min="-40" max="40" step="1" v-model.number="haloScaleY">
			</div>

			<div class="slider-actions">
				<button type="button" class="btn-reset-halo" @click.stop="resetHaloPlacement">
					<i class="fas fa-rotate-left"></i> Reset to Defaults
				</button>
			</div>
		</div>
	</div>

	<!-- SCALE DIE OPTION FOR HALO -->
	<div class="editor-field" v-if="isHalo">
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
