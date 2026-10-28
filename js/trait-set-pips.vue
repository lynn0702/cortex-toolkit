<script setup lang="ts">
import { getView } from './model.ts';
import { injectTraitSet } from './use-trait-set.ts';

const {
	traitSet, s, submode, printBlank, isSelected, selectElement, getPipConfig, getPipRowCount, getPipRowCols, getPipIndex, isPipFilled, handlePipClick,
	isPipLabels, pipRows, togglePipRow, addPipRow, setPipRowName, getPipTrack, setPipTrack
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
					role="checkbox"
					:aria-checked="row.filled ? 'true' : 'false'"
					:aria-label="row.name || ((traitSet.noun || 'Milestone') + ' ' + (row.index + 1))"
					@keydown.enter.prevent="togglePipRow(s, row.index)"
					@keydown.space.prevent="togglePipRow(s, row.index)"
					@click.stop="togglePipRow(s, row.index)"
					:title="submode === 'play' ? (row.filled ? 'Uncheck' : 'Check') : 'Click to toggle'"
				>
					<div
						class="pip-bubble"
						:class="{ 'filled': row.filled }"
						aria-hidden="true"
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
		<template v-else>
			<div
				class="pip-play-stepper"
				v-if="submode === 'play' && !printBlank"
				role="group"
				:aria-label="(traitSet.name || 'XP') + ' Track'"
			>
				<button
					type="button"
					class="btn-pip-step"
					:disabled="getPipTrack(traitSet).filled <= 0"
					@click.stop="setPipTrack(s, getPipTrack(traitSet).count, Math.max(0, getPipTrack(traitSet).filled - 1))"
					title="Decrease filled pips"
					aria-label="Decrease filled pips"
				>
					<i class="fas fa-minus" aria-hidden="true"></i>
				</button>
				<span
					class="pip-play-stepper-count"
					role="spinbutton"
					tabindex="0"
					:aria-label="(traitSet.name || 'XP') + ' Track'"
					:aria-valuemin="0"
					:aria-valuemax="getPipTrack(traitSet).count"
					:aria-valuenow="getPipTrack(traitSet).filled"
					@keydown.up.prevent="setPipTrack(s, getPipTrack(traitSet).count, Math.min(getPipTrack(traitSet).count, getPipTrack(traitSet).filled + 1))"
					@keydown.right.prevent="setPipTrack(s, getPipTrack(traitSet).count, Math.min(getPipTrack(traitSet).count, getPipTrack(traitSet).filled + 1))"
					@keydown.down.prevent="setPipTrack(s, getPipTrack(traitSet).count, Math.max(0, getPipTrack(traitSet).filled - 1))"
					@keydown.left.prevent="setPipTrack(s, getPipTrack(traitSet).count, Math.max(0, getPipTrack(traitSet).filled - 1))"
				>
					{{ getPipTrack(traitSet).filled }} / {{ getPipTrack(traitSet).count }}
				</span>
				<button
					type="button"
					class="btn-pip-step"
					:disabled="getPipTrack(traitSet).filled >= getPipTrack(traitSet).count"
					@click.stop="setPipTrack(s, getPipTrack(traitSet).count, Math.min(getPipTrack(traitSet).count, getPipTrack(traitSet).filled + 1))"
					title="Increase filled pips"
					aria-label="Increase filled pips"
				>
					<i class="fas fa-plus" aria-hidden="true"></i>
				</button>
			</div>
			<div
				class="pips-track-container"
				:class="{ 'connected': getPipConfig(traitSet).connected, 'pips-connected': getPipConfig(traitSet).connected, 'vertical': getPipConfig(traitSet).perRow === 1, ['pips-per-row-' + getPipConfig(traitSet).perRow]: true }"
				:aria-hidden="submode === 'play' ? 'true' : undefined"
			>
			<div class="pip-spine-line" v-if="getPipConfig(traitSet).connected && getPipConfig(traitSet).perRow === 1"></div>
			<div
				v-for="rowIdx in getPipRowCount(traitSet)"
				:key="'prow-' + rowIdx"
				class="pip-row"
			>
				<div class="pip-row-line" v-if="getPipConfig(traitSet).connected && getPipRowCols(traitSet, rowIdx) > 1"></div>
				<div
					v-for="colIdx in getPipRowCols(traitSet, rowIdx)"
					:key="'pcol-' + colIdx"
					class="pip-bubble-wrap"
					:tabindex="submode === 'play' ? -1 : 0"
					:role="submode === 'play' ? undefined : 'button'"
					:aria-label="submode === 'play' ? undefined : ('Pip ' + (getPipIndex(traitSet, rowIdx, colIdx) + 1))"
					:aria-hidden="submode === 'play' ? 'true' : undefined"
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
		</template>
	</div>
</template>
