<script setup lang="ts">
import { getView } from './model.ts';
import { injectTraitSet } from './use-trait-set.ts';

const {
	traitSet, s, submode, printBlank, isSelected, selectElement, getPipConfig, getPipRowCount, getPipRowCols, getPipIndex, isPipFilled, handlePipClick,
	isPipLabels, pipRows, togglePipRow, openPipRow, addPipRow
} = injectTraitSet();
</script>

<template>
	<div class="trait-pips-body"
		v-if="getView(traitSet)?.style?.body === 'pips'"
		@click.stop="submode === 'edit' ? selectElement([ 'traitSet', s ]) : null"
	>
		<!-- LABELED ROWS (named checkable entries): one bubble plus its
			name per row, stacked. Blank rows render bare. -->
		<div class="pip-label-list" v-if="isPipLabels(traitSet)">
			<div
				v-for="row in pipRows(traitSet)"
				:key="'prow-' + row.index"
				class="pip-label-row"
				:class="{ 'filled': row.filled, 'selected': isSelected(['trait', s, row.index]) }"
			>
				<div
					class="pip-bubble-wrap"
					tabindex="0"
					role="button"
					@keydown.enter.prevent="togglePipRow(s, row.index)"
					@keydown.space.prevent="togglePipRow(s, row.index)"
					@click.stop="togglePipRow(s, row.index)"
					:title="submode === 'play' ? (row.filled ? 'Uncheck' : 'Check') : 'Click to toggle'"
				>
					<div
						class="pip-bubble"
						:class="{ 'filled': row.filled }"
					></div>
				</div>
				<span class="pip-label-name" v-if="row.name" @click.stop="openPipRow(s, row.index)">{{ row.name }}</span>
				<span class="pip-label-blank" v-else-if="submode === 'edit' && !printBlank" @click.stop="openPipRow(s, row.index)">Row...</span>
			</div>
			<div class="preview-button-container" v-show="submode === 'edit'">
				<div class="preview-button-container-inner">
					<div class="preview-button" @click.stop="addPipRow( s )">
						<span><i class="fas fa-plus"></i> {{ ( traitSet.nounSingular && traitSet.nounSingular.length ) ? traitSet.nounSingular : 'Row' }}</span>
					</div>
				</div>
			</div>
		</div>
		<div class="pips-track-container" v-else :class="{ 'connected': getPipConfig(traitSet).connected, 'pips-connected': getPipConfig(traitSet).connected, 'vertical': getPipConfig(traitSet).perRow === 1, ['pips-per-row-' + getPipConfig(traitSet).perRow]: true }">
			<div class="pip-spine-line" v-if="getPipConfig(traitSet).connected && getPipConfig(traitSet).perRow === 1"></div>
			<div
				v-for="rowIdx in getPipRowCount(traitSet)"
				:key="'prow-' + rowIdx"
				class="pip-row"
			>
				<div class="pip-row-line" v-if="getPipConfig(traitSet).connected && getPipConfig(traitSet).perRow > 1"></div>
				<div
					v-for="colIdx in getPipRowCols(traitSet, rowIdx)"
					:key="'pcol-' + colIdx"
					class="pip-bubble-wrap"
					tabindex="0"
					role="button"
					@keydown.enter.prevent="handlePipClick(s, getPipIndex(traitSet, rowIdx, colIdx))"
					@keydown.space.prevent="handlePipClick(s, getPipIndex(traitSet, rowIdx, colIdx))"
					@click.stop="handlePipClick(s, getPipIndex(traitSet, rowIdx, colIdx))"
					:title="submode === 'play' ? ('XP: ' + (getPipIndex(traitSet, rowIdx, colIdx) + 1)) : ''"
				>
					<div
						class="pip-bubble"
						:class="{ 'filled': isPipFilled(traitSet, getPipIndex(traitSet, rowIdx, colIdx)) }"
					></div>
				</div>
			</div>
		</div>
	</div>
</template>
