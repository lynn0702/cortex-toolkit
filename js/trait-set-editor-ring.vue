<script setup lang="ts">
import { injectTraitSetEditor } from './use-trait-set-editor.ts';
import type { PortraitFrameShape, TraitArrayMode } from './frame-geometry.ts';
import ColorPicker from './color-picker.vue';

const {
	isName,
	styleBody,
	traitSetID,
	portraitFrameOptions,
	portraitFrameShape,
	hasPortraitOrArray,
	frameImageUrl,
	frameImageAlignment,
	frameImageZoom,
	imageFileInput,
	uploadError,
	uploadImageStart,
	uploadPortraitImageProcess,
	frameWidth,
	setFrameWidth,
	frameColor,
	frameColorTokens,
	setFrameColor,
	frameDash,
	setFrameDash,
	frameSize,
	setFrameSize,
	framePosition,
	setFramePosition,
	traitArrayOptions,
	traitArrayMode,
	arcStrokeMode,
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
} = injectTraitSetEditor();
</script>

<template>
	<template v-if="!isName && styleBody !== 'image' && styleBody !== 'pips'">
		<!-- PORTRAIT & PORTRAIT FRAME -->
		<div class="editor-field">
			<div class="editor-label">Portrait Frame</div>
			<div class="editor-button-group">
				<button
					v-for="opt in portraitFrameOptions"
					:key="opt.id"
					type="button"
					class="editor-group-btn"
					:class="{ active: portraitFrameShape === opt.id }"
					:aria-pressed="portraitFrameShape === opt.id"
					@click.stop="portraitFrameShape = opt.id as PortraitFrameShape"
				>
					{{ opt.label }}
				</button>
			</div>
		</div>

		<div class="editor-field">
			<label :for="'ts-' + traitSetID + '-portrait-url'">Portrait</label>
			<div class="editor-row-inline mb-sm">
				<button type="button" class="editor-button flex-1" @click.prevent="uploadImageStart">
					<span>
						<i class="fas fa-upload" aria-hidden="true"></i>
						{{ frameImageUrl ? 'Replace' : 'Upload' }}
					</span>
				</button>
				<button
					v-if="frameImageUrl"
					type="button"
					class="editor-button editor-btn-danger-mini"
					@click.prevent="frameImageUrl = ''"
					title="Remove portrait"
				>
					<span><i class="fas fa-trash-alt" aria-hidden="true"></i> Remove</span>
				</button>
			</div>
			<input
				type="file"
				:id="'ts-' + traitSetID + '-portrait-file'"
				name="portraitFile"
				ref="imageFileInput"
				class="sr-only"
				@change="uploadPortraitImageProcess"
				accept="image/*"
				aria-label="Upload portrait image"
			/>
			<div class="editor-upload-error" v-if="uploadError">{{ uploadError }}</div>
			<input
				type="text"
				:id="'ts-' + traitSetID + '-portrait-url'"
				name="portraitUrl"
				v-model.lazy="frameImageUrl"
				placeholder="Portrait URL"
				autocorrect="off"
				autocapitalize="none"
				spellcheck="false"
			/>
		</div>

		<template v-if="hasPortraitOrArray">
			<div class="editor-field" v-if="frameImageUrl">
				<div class="editor-focus-zoom-row">
					<div>
						<div class="editor-label">Focus</div>
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
							<label :for="'ts-' + traitSetID + '-portrait-zoom'" class="m-0">Zoom</label>
							<span class="slider-val">{{ Math.round((frameImageZoom ?? 1) * 100) }}%</span>
						</div>
						<input
							type="range"
							:id="'ts-' + traitSetID + '-portrait-zoom'"
							name="portraitZoom"
							min="0.5"
							max="2"
							step="0.05"
							v-model.number="frameImageZoom"
							aria-label="Portrait Zoom"
						/>
					</div>
				</div>
			</div>

			<div class="editor-field">
				<div class="editor-row-between">
					<div class="editor-label m-0">Portrait Size</div>
					<div class="editor-row-actions">
						<span class="slider-val">{{ frameSize ? frameSize + 'px' : 'Auto' }}</span>
						<button
							v-if="frameSize !== null"
							type="button"
							class="editor-group-btn"
							@click.stop="setFrameSize(null)"
							aria-label="Reset portrait size"
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
					aria-label="Portrait Size"
				/>
			</div>

			<div class="editor-field">
				<div class="editor-label">Portrait Position</div>
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
		</template>

		<template v-if="portraitFrameShape !== 'none'">
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
					:input-id="'ts-' + traitSetID + '-portrait-color'"
					label="Portrait Frame Color"
					:tokens="frameColorTokens"
					@update:model-value="setFrameColor"
				/>
			</div>

			<div class="editor-field">
				<label :for="'ts-' + traitSetID + '-portrait-dash'">Frame Dash</label>
				<input
					:id="'ts-' + traitSetID + '-portrait-dash'"
					type="text"
					:value="frameDash"
					placeholder="Solid"
					@change="setFrameDash(($event.target as HTMLInputElement).value)"
				/>
			</div>
		</template>

		<!-- TRAIT ARRAY (None | Ring | Arc) -->
		<div class="editor-field">
			<div class="editor-label">Trait Array</div>
			<div class="editor-button-group">
				<button
					v-for="opt in traitArrayOptions"
					:key="opt.id"
					type="button"
					class="editor-group-btn"
					:class="{ active: traitArrayMode === opt.id }"
					:aria-pressed="traitArrayMode === opt.id"
					@click.stop="traitArrayMode = opt.id as TraitArrayMode"
				>
					{{ opt.label }}
				</button>
			</div>
		</div>

		<template v-if="traitArrayMode !== 'none'">
			<div class="editor-field" v-if="traitArrayMode === 'arc' && portraitFrameShape === 'circle'">
				<div class="editor-label">Ring Stroke</div>
				<div class="editor-button-group">
					<button
						type="button"
						class="editor-group-btn"
						:class="{ active: arcStrokeMode === 'full' }"
						:aria-pressed="arcStrokeMode === 'full'"
						@click.stop="arcStrokeMode = 'full'"
					>
						Full
					</button>
					<button
						type="button"
						class="editor-group-btn"
						:class="{ active: arcStrokeMode === 'arc' }"
						:aria-pressed="arcStrokeMode === 'arc'"
						@click.stop="arcStrokeMode = 'arc'"
					>
						Arc
					</button>
				</div>
			</div>

			<div class="editor-field">
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

			<div class="editor-field">
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

			<div class="editor-field">
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
	</template>
</template>
