<script setup lang="ts">
import { injectTraitSetEditor } from './use-trait-set-editor.ts';

const {
	isHalo, columnLocation, setColumn, characterColumnCount, canMoveUp, canMoveDown,
	moveTraitSetUp, moveTraitSetDown, isFullWidthSpan, colSpan, setTrackCount, colWidth,
	isSpotlightSheet, rowBreak, editorDock, pageNumber, targetValue
} = injectTraitSetEditor();
</script>

<template>
	<!-- COLUMN & REORDER CONTROLS -->
	<div class="editor-field" v-if="!isHalo">
		<label>Column & Position</label>
		<div class="editor-position-controls">
			<div class="editor-button-group">
				<button
					type="button"
					class="editor-group-btn"
					:class="{ active: columnLocation === 'left' }"
					@click.stop="setColumn('left')"
				>
					<i class="fas fa-arrow-left" v-if="characterColumnCount === 2"></i> Left{{ characterColumnCount === 3 ? ' (Col 1)' : ' Column' }}
				</button>
				<button
					type="button"
					class="editor-group-btn"
					v-if="characterColumnCount === 3"
					:class="{ active: columnLocation === 'center' }"
					@click.stop="setColumn('center')"
				>
					Center (Col 2)
				</button>
				<button
					type="button"
					class="editor-group-btn"
					:class="{ active: columnLocation === 'right' }"
					@click.stop="setColumn('right')"
				>
					Right{{ characterColumnCount === 3 ? ' (Col 3)' : ' Column' }} <i class="fas fa-arrow-right" v-if="characterColumnCount === 2"></i>
				</button>
			</div>
			<div class="editor-reorder-buttons">
				<button
					type="button"
					class="editor-step-btn"
					:disabled="!canMoveUp"
					@click.stop="moveTraitSetUp"
				>
					<i class="fas fa-arrow-up"></i> Move Up
				</button>
				<button
					type="button"
					class="editor-step-btn"
					:disabled="!canMoveDown"
					@click.stop="moveTraitSetDown"
				>
					<i class="fas fa-arrow-down"></i> Move Down
				</button>
			</div>
		</div>
	</div>

	<!-- COLUMN SPAN -->
	<div class="editor-field" v-if="!isHalo">
		<label>Column Span</label>
		<div class="editor-button-group">
			<button
				type="button"
				class="editor-group-btn"
				:class="{ active: !isFullWidthSpan && colSpan === 1 }"
				@click.stop="colSpan = 1"
			>
				1 Column
			</button>
			<button
				type="button"
				class="editor-group-btn"
				v-if="setTrackCount === 3"
				:class="{ active: !isFullWidthSpan && colSpan === 2 }"
				@click.stop="colSpan = 2"
				title="Span two columns"
			>
				Span 2 Cols
			</button>
			<button
				type="button"
				class="editor-group-btn"
				:class="{ active: isFullWidthSpan }"
				@click.stop="isFullWidthSpan = !isFullWidthSpan"
			>
				<i class="fas fa-arrows-alt-h"></i> Full Width Span
			</button>
		</div>
	</div>

	<!-- COLUMN WIDTH (SPOTLIGHT ROWS) -->
	<div class="editor-field" v-if="!isHalo && !isFullWidthSpan && isSpotlightSheet">
		<label>Column Width — Row Share</label>
		<div class="editor-button-group">
			<button
				type="button"
				class="editor-group-btn"
				:class="{ active: colWidth === null }"
				@click.stop="colWidth = null"
				title="Share the row equally with the other column(s)"
			>
				Equal
			</button>
			<button
				v-for="w in [25, 33, 50, 66, 75]"
				:key="'colw-' + w"
				type="button"
				class="editor-group-btn"
				:class="{ active: colWidth === w }"
				@click.stop="colWidth = (colWidth === w ? null : w)"
				:title="'Take ' + w + '% of the row; the other column(s) share the rest'"
			>
				{{ w }}%
			</button>
		</div>
		<div class="slider-row" style="margin-top: 0.4rem;">
			<div class="slider-header">
				<span>Fine tune</span>
				<span class="slider-val">{{ colWidth === null ? 'Equal' : colWidth + '%' }}</span>
			</div>
			<input type="range" min="10" max="90" step="1" :value="colWidth || 50" @input.stop="colWidth = Number(targetValue($event))" @click.stop title="Exact column width percent">
		</div>
		<div class="editor-hint">Set 66% here and the other column takes ~33%, forming a row band like the source sheets.</div>
	</div>

	<!-- ROW BREAK (SPOTLIGHT BANDS) -->
	<div class="editor-field" v-if="!isHalo && !isFullWidthSpan && isSpotlightSheet">
		<label>Row Band</label>
		<div class="editor-button-group">
			<button
				type="button"
				class="editor-group-btn"
				:class="{ active: !rowBreak }"
				@click.stop="rowBreak = false"
				title="Keep flowing in the current row band"
			>
				Continue band
			</button>
			<button
				type="button"
				class="editor-group-btn"
				:class="{ active: rowBreak }"
				@click.stop="rowBreak = true"
				title="Start a fresh row band here, so this band can use different column shares"
			>
				<i class="fas fa-grip-lines"></i> New band
			</button>
		</div>
	</div>

	<!-- PANEL POSITION (FULL-WIDTH SETS) -->
	<div class="editor-field" v-if="isFullWidthSpan">
		<label>Panel Position</label>

		<div class="editor-button-group">
			<button
				type="button"
				class="editor-group-btn"
				:class="{ active: editorDock === 'left' }"
				@click.stop="editorDock = 'left'"
			>
				<i class="fas fa-arrow-left"></i> Left
			</button>
			<button
				type="button"
				class="editor-group-btn"
				:class="{ active: editorDock === 'right' }"
				@click.stop="editorDock = 'right'"
			>
				Right <i class="fas fa-arrow-right"></i>
			</button>
		</div>
	</div>

	<!-- PAGE SELECTOR -->
	<div class="editor-field" v-if="!isHalo">
		<label>Page</label>
		<div class="editor-position-controls">
			<div class="editor-button-group">
				<button
					type="button"
					class="editor-group-btn"
					:class="{ active: pageNumber === 1 }"
					@click.stop="pageNumber = 1"
				>
					<i class="fas fa-file"></i> Page 1
				</button>
				<button
					type="button"
					class="editor-group-btn"
					:class="{ active: pageNumber === 2 }"
					@click.stop="pageNumber = 2"
				>
					Page 2 <i class="fas fa-copy"></i>
				</button>
			</div>
		</div>
	</div>
</template>
