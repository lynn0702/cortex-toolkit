<script setup lang="ts">
import { injectTraitSetEditor } from './use-trait-set-editor.ts';

const {
	isRing, pageNumber,
	hasPlace, placeLeft, placeWidth, placeTop, placeHeight, clearPlace,
	canMoveUp, canMoveDown, moveTraitSetUp, moveTraitSetDown,
	editorDock, isSpotlightSheet, isFullWidthSpan, targetValue
} = injectTraitSetEditor();
</script>

<template>
	<!-- PAGE -->
	<div class="editor-field" v-if="!isRing">
		<div class="editor-label">Page</div>
		<div class="editor-position-controls">
			<div class="editor-button-group">
				<button
					type="button"
					class="editor-group-btn"
					:class="{ active: pageNumber === 1 }"
					@click.stop="pageNumber = 1"
				>
					Page 1
				</button>
				<button
					type="button"
					class="editor-group-btn"
					:class="{ active: pageNumber === 2 }"
					@click.stop="pageNumber = 2"
				>
					Page 2
				</button>
			</div>
			<div class="editor-reorder-buttons">
				<button
					type="button"
					class="editor-step-btn"
					:disabled="!canMoveUp"
					@click.stop="moveTraitSetUp"
				>
					<i class="fas fa-arrow-up"></i>
				</button>
				<button
					type="button"
					class="editor-step-btn"
					:disabled="!canMoveDown"
					@click.stop="moveTraitSetDown"
				>
					<i class="fas fa-arrow-down"></i>
				</button>
			</div>
		</div>
	</div>

	<!-- PLACE (explicit coordinates in the page grid) -->
	<div class="editor-field" v-if="!isRing && isSpotlightSheet">
		<div class="editor-label">Place</div>
		<div class="editor-button-group" style="margin-bottom: 0.4rem;">
			<button
				type="button"
				class="editor-group-btn"
				:class="{ active: !hasPlace }"
				@click.stop="clearPlace"
				title="Full width, stacked in document order"
			>
				Full Width
			</button>
		</div>
		<div style="display: flex; gap: 0.5rem; margin-bottom: 0.4rem;">
			<div style="flex: 1;">
				<label :for="'trait-set-place-left'" style="font-size: 0.7rem; color: #64748b; display: block; margin-bottom: 0.2rem;">Left %</label>
				<input type="number" id="trait-set-place-left" name="placeLeft" min="0" max="100" step="0.5" :value="placeLeft" @change="placeLeft = Number(targetValue($event))">
			</div>
			<div style="flex: 1;">
				<label :for="'trait-set-place-width'" style="font-size: 0.7rem; color: #64748b; display: block; margin-bottom: 0.2rem;">Width %</label>
				<input type="number" id="trait-set-place-width" name="placeWidth" min="1" max="100" step="0.5" :value="placeWidth" @change="placeWidth = Number(targetValue($event))">
			</div>
		</div>
		<div style="display: flex; gap: 0.5rem; align-items: end;">
			<div style="flex: 1;">
				<label :for="'trait-set-place-top'" style="font-size: 0.7rem; color: #64748b; display: block; margin-bottom: 0.2rem;">Top</label>
				<div class="editor-button-group">
					<button
						type="button"
						class="editor-group-btn"
						:disabled="!canMoveUp"
						@click.stop="moveTraitSetUp"
						title="Move up one row"
					>
						<i class="fas fa-arrow-up"></i>
					</button>
					<button
						type="button"
						class="editor-group-btn"
						:class="{ active: true }"
						title="Row units from the page top"
					>
						{{ placeTop }}
					</button>
					<button
						type="button"
						class="editor-group-btn"
						:disabled="!canMoveDown"
						@click.stop="moveTraitSetDown"
						title="Move down one row"
					>
						<i class="fas fa-arrow-down"></i>
					</button>
				</div>
			</div>
			<div style="flex: 1;">
				<label :for="'trait-set-place-height'" style="font-size: 0.7rem; color: #64748b; display: block; margin-bottom: 0.2rem;">Height</label>
				<input type="number" id="trait-set-place-height" name="placeHeight" min="1" step="1" :value="placeHeight" @change="placeHeight = Math.max(1, Math.round(Number(targetValue($event)) || 1))">
			</div>
		</div>
		<div class="editor-field-hint" style="font-size: 0.72rem; color: #94a3b8; margin-top: 0.3rem;">
			<span v-if="hasPlace">Left {{ placeLeft }}% · Width {{ placeWidth }}% · Top {{ placeTop }} · Height {{ placeHeight }}</span>
			<span v-else>Full width · stacked in document order</span>
		</div>
	</div>

	<!-- PANEL POSITION (FULL-WIDTH SETS) -->
	<div class="editor-field" v-if="isFullWidthSpan">
		<div class="editor-label">Panel Position</div>
		<div class="editor-button-group">
			<button
				type="button"
				class="editor-group-btn"
				:class="{ active: editorDock === 'left' }"
				@click.stop="editorDock = 'left'"
			>
				Left
			</button>
			<button
				type="button"
				class="editor-group-btn"
				:class="{ active: editorDock === 'right' }"
				@click.stop="editorDock = 'right'"
			>
				Right
			</button>
		</div>
	</div>
</template>
