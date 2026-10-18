<script setup lang="ts">
import { getView } from './model.ts';
import { injectTraitSet } from './use-trait-set.ts';

const { traitSet, s, submode, selectElement, getPipConfig, getPipRowCount, getPipRowCols, getPipIndex, isPipFilled, handlePipClick } = injectTraitSet();
</script>

<template>
	<div class="trait-pips-body"
		v-if="getView(traitSet)?.style?.body === 'pips'"
		@click.stop="submode === 'edit' ? selectElement([ 'traitSet', s ]) : null"
	>
		<div class="pips-track-container" :class="{ 'connected': getPipConfig(traitSet).connected, 'pips-connected': getPipConfig(traitSet).connected, 'vertical': getPipConfig(traitSet).perRow === 1, ['pips-per-row-' + getPipConfig(traitSet).perRow]: true }">
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
