<script setup lang="ts">
import { getView } from './model.ts';
import { injectTraitSet } from './use-trait-set.ts';

const {
	traitSet, s, submode, editing, printBlank, viewY, character,
	isSelected, selectElement, updateCharacter, removeTrait,
	isSessionHorizontal, sessionViewBox, sessionSpine, sessionHit, sessionLine, sessionBubble,
	sessionLabelTransform, getSessionRecordItems, handleSessionBubbleClick, handleSessionLineClick, addSessionRecordRow
} = injectTraitSet();
</script>

<template>
	<div class="trait-session-record-body"
		v-if="getView(traitSet)?.style?.body === 'session-record' || getView(traitSet)?.style?.body === 'angled-lines'"
		@click="submode === 'edit' ? selectElement([ 'traitSet', s ]) : null"
	>
		<svg
			class="session-record-svg"
			:class="{ 'session-horizontal': isSessionHorizontal(traitSet) }"
			:viewBox="sessionViewBox(traitSet)"
			preserveAspectRatio="xMidYMin meet"
		>
			<line
				:x1="sessionSpine(traitSet).x1"
				:y1="sessionSpine(traitSet).y1"
				:x2="sessionSpine(traitSet).x2"
				:y2="sessionSpine(traitSet).y2"
				class="session-spine"
			/>

			<g
				v-for="item in getSessionRecordItems(traitSet)"
				:key="'srec-' + item.index"
				class="session-record-row"
				:class="{ 'filled': item.isFilled, 'selected': isSelected(['trait', s, item.index]) }"
				@click.stop="handleSessionLineClick(s, item.index)"
			>
				<rect :x="sessionHit(traitSet, item.index).x" :y="sessionHit(traitSet, item.index).y" :width="sessionHit(traitSet, item.index).width" :height="sessionHit(traitSet, item.index).height" fill="transparent" class="session-hit-area" />
				<line
					:x1="sessionLine(traitSet, item.index).x1"
					:y1="sessionLine(traitSet, item.index).y1"
					:x2="sessionLine(traitSet, item.index).x2"
					:y2="sessionLine(traitSet, item.index).y2"
					class="session-line"
					@click.stop="handleSessionLineClick(s, item.index)"
				/>

				<circle
					:cx="sessionBubble(traitSet, item.index).cx"
					:cy="sessionBubble(traitSet, item.index).cy"
					r="6.5"
					class="session-bubble"
					:class="{ 'filled': item.isFilled }"
					@click.stop="handleSessionBubbleClick(s, item.index)"
					:title="submode === 'play' ? (item.isFilled ? 'Uncheck' : 'Check') : 'Click to toggle'"
				/>

				<text
					v-if="item.name && (!printBlank || submode !== 'print')"
					:transform="sessionLabelTransform(traitSet, item.index)"
					class="session-label"
					@click.stop="handleSessionLineClick(s, item.index)"
				>
					{{ item.name }}
				</text>
			</g>
		</svg>

		<transition appear>
			<div class="preview-button-container" v-show="submode === 'edit'">
				<div class="preview-button-container-inner">
					<div class="preview-button" @click.stop="addSessionRecordRow( s )">
						<span><i class="fas fa-plus"></i> {{ ( traitSet.nounSingular && traitSet.nounSingular.length ) ? traitSet.nounSingular : 'Row' }}</span>
					</div>
				</div>
			</div>
		</transition>
	</div>
</template>
