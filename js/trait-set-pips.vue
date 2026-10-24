<script setup lang="ts">
import { getView } from './model.ts';
import { injectTraitSet } from './use-trait-set.ts';

const {
	traitSet, s, submode, printBlank, isSelected, selectElement, getPipConfig, getPipRowCount, getPipRowCols, getPipIndex, isPipFilled, handlePipClick,
	isPipLabels, pipRows, togglePipRow, addPipRow, setPipRowName
} = injectTraitSet();

function commitPipRowName( traitSetIndex: number, itemIndex: number, event: Event ) {
	const el = event && ( event.target as HTMLInputElement );
	setPipRowName( traitSetIndex, itemIndex, el ? el.value : '' );
	if ( el && document.activeElement === el ) el.blur();
}
</script>

<template>
	<div class="trait-pips-body"
		v-if="getView(traitSet)?.style?.body === 'pips'"
		@click.stop="submode === 'edit' ? selectElement([ 'traitSet', s ]) : null"
	>
		<!-- LABELED ROWS (named checkable entries): one bubble plus its
			name per row, stacked. The name is a write-in line on the row;
			the Pip rating reads filled/true. Blank rows render bare. -->
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
				<input
					v-if="submode === 'edit' && !printBlank"
					class="pip-label-input"
					type="text"
					:value="row.name"
					placeholder="Row..."
					:aria-label="(traitSet.noun && traitSet.noun.length ? traitSet.noun : 'Row') + ' name'"
					@change="commitPipRowName(s, row.index, $event)"
					@click.stop
				>
				<span class="pip-label-name" v-else-if="row.name">{{ row.name }}</span>
			</div>
			<div class="preview-button-container" v-show="submode === 'edit'">
				<div class="preview-button-container-inner">
					<div class="preview-button" @click.stop="addPipRow( s )">
						<span><i class="fas fa-plus"></i> {{ ( traitSet.noun && traitSet.noun.length ) ? traitSet.noun : 'Row' }}</span>
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
