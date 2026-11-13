<script setup lang="ts">
import { injectTraitSetEditor } from './use-trait-set-editor.ts';
import type { BorderShape } from './frame-geometry.ts';
import TraitSetEditorRowMini from './trait-set-editor-row-mini.vue';
import ColorPicker from './color-picker.vue';

const {
	traitSetID,
	isName,
	isPartsPreview,
	hasCustomParts,
	hasCustomBranch,
	resetParts,
	borderOptions,
	borderShape,
	setBorderShape,
	borderWidth,
	borderColor,
	borderCorner,
	borderDash,
	frameColorTokens,
	frameTint,
	setFrameTint,
} = injectTraitSetEditor();
</script>

<template>
	<!-- SECTION LAYOUT (set header + inline parts palette & row cells) -->
	<div class="editor-field" v-if="!isName">
		<div class="editor-row-between mb-sm">
			<div class="editor-label m-0">Section Layout</div>
			<button
				v-if="hasCustomParts || hasCustomBranch"
				type="button"
				class="editor-group-btn"
				@click.stop="resetParts"
				title="Restore default parts layout"
			>
				Reset
			</button>
		</div>
		<div class="editor-field-hint" v-if="isPartsPreview">Drag cells to arrange; toggle parts below.</div>
		<TraitSetEditorRowMini />
	</div>

	<!-- SECTION BORDER (None | Block | Line) -->
	<div class="editor-field" v-if="!isName">
		<div class="editor-label">Border</div>
		<div class="editor-button-group">
			<button
				v-for="opt in borderOptions"
				:key="opt.id"
				type="button"
				class="editor-group-btn"
				:class="{ active: borderShape === opt.id }"
				:aria-pressed="borderShape === opt.id"
				@click.stop="setBorderShape(opt.id as BorderShape)"
			>
				{{ opt.label }}
			</button>
		</div>
	</div>

	<template v-if="!isName && borderShape !== 'none'">
		<div class="editor-field" v-if="borderShape === 'block'">
			<div class="editor-label">Corner</div>
			<div class="editor-button-group">
				<button
					v-for="opt in [
						{ id: 'square', label: 'Square' },
						{ id: 'round', label: 'Round' },
						{ id: 'cut', label: 'Cut' },
					]"
					:key="opt.id"
					type="button"
					class="editor-group-btn"
					:class="{ active: borderCorner === opt.id }"
					:aria-pressed="borderCorner === opt.id"
					@click.stop="borderCorner = opt.id as 'square' | 'round' | 'cut'"
				>
					{{ opt.label }}
				</button>
			</div>
		</div>

		<div class="editor-field">
			<div class="editor-label">Width</div>
			<div class="editor-button-group">
				<button
					v-for="w in ['1px', '1.5px', '2px', '3px', '4px']"
					:key="w"
					type="button"
					class="editor-group-btn"
					:class="{ active: borderWidth === w }"
					:aria-pressed="borderWidth === w"
					@click.stop="borderWidth = w"
				>
					{{ w }}
				</button>
			</div>
		</div>

		<div class="editor-field">
			<div class="editor-label">Color</div>
			<ColorPicker
				:model-value="borderColor"
				:input-id="'ts-' + traitSetID + '-border-color'"
				label="Border Color"
				:tokens="frameColorTokens"
				@update:model-value="borderColor = $event"
			/>
		</div>

		<div class="editor-field" v-if="borderShape === 'block'">
			<div class="editor-label">Fill</div>
			<ColorPicker
				:model-value="frameTint"
				:input-id="'ts-' + traitSetID + '-border-tint'"
				label="Border Fill"
				fallback-hex="#ffffff"
				:allow-clear="true"
				clear-label="Clear"
				@update:model-value="setFrameTint"
				@clear="setFrameTint('')"
			/>
		</div>

		<div class="editor-field">
			<label :for="'ts-' + traitSetID + '-border-dash'">Dash</label>
			<input
				:id="'ts-' + traitSetID + '-border-dash'"
				type="text"
				:value="borderDash"
				placeholder="Solid"
				@change="borderDash = ($event.target as HTMLInputElement).value"
			/>
		</div>
	</template>
</template>
