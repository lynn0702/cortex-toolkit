<script setup lang="ts">
import { injectTraitSetEditor } from './use-trait-set-editor.ts';

const {
	isRing, pageNumber, track, span, bandWidths, rowBreak, flex,
	canMoveUp, canMoveDown, moveTraitSetUp, moveTraitSetDown,
	editorDock, isSpotlightSheet, targetValue
} = injectTraitSetEditor();

const WIDTH_PRESETS: { label: string; widths: [number, number, number] }[] = [
	{ label: 'Equal', widths: [33.333, 33.333, 33.334] },
	{ label: '33/67', widths: [33, 67, 0] },
	{ label: '50/50', widths: [50, 50, 0] },
	{ label: '25/50/25', widths: [25, 50, 25] },
	{ label: '30/50/20', widths: [30, 50, 20] },
	{ label: '100', widths: [100, 0, 0] },
];

function isPresetActive( preset: [number, number, number] ): boolean {
	const current = bandWidths.value;
	return Math.round( current[0] ) === Math.round( preset[0] ) &&
		Math.round( current[1] ) === Math.round( preset[1] ) &&
		Math.round( current[2] ) === Math.round( preset[2] );
}

function updateTrackWidth( index: number, event: Event ) {
	const val = Math.max( 0, Math.min( 100, Number( ( event.target as HTMLInputElement ).value ) || 0 ) );
	const copy: [number, number, number] = [ bandWidths.value[0], bandWidths.value[1], bandWidths.value[2] ];
	copy[ index ] = val;
	bandWidths.value = copy;
}
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

	<!-- TRACK -->
	<div class="editor-field" v-if="!isRing">
		<div class="editor-label">Track</div>
		<div class="editor-button-group">
			<button
				v-for="t in [1, 2, 3]"
				:key="'track-' + t"
				type="button"
				class="editor-group-btn"
				:class="{ active: track === t }"
				@click.stop="track = t"
			>
				Track {{ t }}
			</button>
		</div>
	</div>

	<!-- SPAN -->
	<div class="editor-field" v-if="!isRing">
		<div class="editor-label">Span</div>
		<div class="editor-button-group">
			<button
				v-for="s in [1, 2, 3]"
				:key="'span-' + s"
				type="button"
				class="editor-group-btn"
				:class="{ active: span === s }"
				@click.stop="span = s"
			>
				{{ s }}
			</button>
		</div>
	</div>

	<!-- WIDTHS -->
	<div class="editor-field" v-if="!isRing && isSpotlightSheet">
		<div class="editor-label">Widths</div>
		<div class="editor-button-group">
			<button
				v-for="p in WIDTH_PRESETS"
				:key="p.label"
				type="button"
				class="editor-group-btn"
				:class="{ active: isPresetActive( p.widths ) }"
				@click.stop="bandWidths = p.widths"
			>
				{{ p.label }}
			</button>
		</div>
		<div class="editor-button-group" style="margin-top: 0.35rem; display: flex; gap: 0.4rem;">
			<input
				type="number"
				min="0"
				max="100"
				:value="Math.round( bandWidths[0] )"
				@change.stop="updateTrackWidth( 0, $event )"
				class="editor-input"
				style="width: 33%; text-align: center;"
				title="Track 1 width percent"
			>
			<input
				type="number"
				min="0"
				max="100"
				:value="Math.round( bandWidths[1] )"
				@change.stop="updateTrackWidth( 1, $event )"
				class="editor-input"
				style="width: 33%; text-align: center;"
				title="Track 2 width percent"
			>
			<input
				type="number"
				min="0"
				max="100"
				:value="Math.round( bandWidths[2] )"
				@change.stop="updateTrackWidth( 2, $event )"
				class="editor-input"
				style="width: 33%; text-align: center;"
				title="Track 3 width percent"
			>
		</div>
	</div>

	<!-- NEW BAND -->
	<div class="editor-field" v-if="!isRing && isSpotlightSheet">
		<div class="editor-label">New Band</div>
		<div class="editor-button-group">
			<button
				type="button"
				class="editor-group-btn"
				:class="{ active: !rowBreak }"
				@click.stop="rowBreak = false"
			>
				Continue
			</button>
			<button
				type="button"
				class="editor-group-btn"
				:class="{ active: rowBreak }"
				@click.stop="rowBreak = true"
			>
				New Band
			</button>
		</div>
	</div>

	<!-- FLEX -->
	<div class="editor-field" v-if="!isRing && isSpotlightSheet">
		<div class="editor-label">Flex</div>
		<div class="editor-button-group">
			<button
				type="button"
				class="editor-group-btn"
				:class="{ active: !flex }"
				@click.stop="flex = false"
			>
				Content
			</button>
			<button
				type="button"
				class="editor-group-btn"
				:class="{ active: flex }"
				@click.stop="flex = true"
			>
				Fill Stack
			</button>
		</div>
	</div>

	<!-- PANEL POSITION (SPAN 3 FULL-WIDTH) -->
	<div class="editor-field" v-if="span === 3">
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
