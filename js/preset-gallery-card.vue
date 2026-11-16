<script setup lang="ts">
import { computed } from 'vue';
import { getRating, getView, type DiceConfig } from './model.ts';
import { characterCurioFunctions } from './functions.ts';

const props = defineProps<{
	preset: { id: string; label: string; blurb?: string; preset?: any };
	diceConfig?: DiceConfig | null;
	deletable?: boolean;
	deleteLabel?: string;
}>();

const emit = defineEmits<{
	(e: 'add'): void;
	(e: 'delete'): void;
}>();

type PreviewKind = 'ring' | 'divider' | 'pips' | 'pool' | 'track' | 'notes' | 'curiosity' | 'subtraits' | 'traits';

const previewKind = computed<PreviewKind>(() => {
	const raw = props.preset?.preset;
	const v = getView(raw) || raw?.view || {};
	const frame = v?.frame && typeof v.frame === 'object' ? v.frame : null;
	const border = v?.border;
	const parts = v?.parts && typeof v.parts === 'object' ? v.parts : null;
	const rating = getRating(raw);
	const body = v?.style?.body;

	if (frame?.array === 'ring' || frame?.array === 'arc' || body === 'portrait-ring') return 'ring';
	if (border === 'line' || (border && typeof border === 'object' && border.shape === 'line')) return 'divider';
	if (body === 'pips' || rating?.type === 'Pip') return 'pips';
	if (raw?.pool === true || rating?.type === 'Dice' || parts?.rating?.ratingType === 'Dice') return 'pool';
	if (parts?.track || body === 'die-track') return 'track';
	if (v?.notesMarkdown === true) return 'notes';
	if (body === 'curiosity' || (raw && 'ref' in raw)) return 'curiosity';
	if (body === 'subtrait-columns') return 'subtraits';
	return 'traits';
});

function renderDieValue(size: number, filled: boolean): string {
	return characterCurioFunctions.renderDieGeometrySVG(size, filled);
}
</script>

<template>
	<div class="preset-gallery-card">
		<div class="preset-card-preview" :data-preview-kind="previewKind" aria-hidden="true">
			<template v-if="previewKind === 'ring'">
				<svg class="preset-preview-ring-svg" viewBox="0 0 64 44" width="64" height="44">
					<circle cx="32" cy="22" r="14" class="preview-ring-circle" />
					<circle cx="32" cy="6" r="3" class="preview-ring-node" />
					<circle cx="46" cy="14" r="3" class="preview-ring-node" />
					<circle cx="46" cy="30" r="3" class="preview-ring-node" />
					<circle cx="32" cy="38" r="3" class="preview-ring-node" />
					<circle cx="18" cy="30" r="3" class="preview-ring-node" />
					<circle cx="18" cy="14" r="3" class="preview-ring-node" />
				</svg>
			</template>
			<template v-else-if="previewKind === 'divider'">
				<div class="preview-bar w-lg muted"></div>
				<div class="preview-divider-rule"></div>
				<div class="preview-bar w-md muted"></div>
			</template>
			<template v-else-if="previewKind === 'pips'">
				<div class="preview-bar w-md"></div>
				<div class="preview-pip-row">
					<span class="preview-pip filled"></span>
					<span class="preview-pip filled"></span>
					<span class="preview-pip"></span>
					<span class="preview-pip"></span>
					<span class="preview-pip"></span>
				</div>
			</template>
			<template v-else-if="previewKind === 'pool'">
				<div class="preview-bar w-md"></div>
				<div class="preview-die-row">
					<span class="preview-die-chip" v-html="renderDieValue(8, true)"></span>
					<span class="preview-die-chip" v-html="renderDieValue(8, true)"></span>
					<span class="preview-die-chip" v-html="renderDieValue(6, true)"></span>
				</div>
			</template>
			<template v-else-if="previewKind === 'track'">
				<div class="preview-line-row">
					<div class="preview-bar w-lg"></div>
					<span class="preview-die-chip" v-html="renderDieValue(8, true)"></span>
				</div>
				<div class="preview-die-row">
					<span class="preview-die-chip muted" v-html="renderDieValue(4, false)"></span>
					<span class="preview-die-chip" v-html="renderDieValue(6, true)"></span>
					<span class="preview-die-chip muted" v-html="renderDieValue(8, false)"></span>
					<span class="preview-die-chip muted" v-html="renderDieValue(10, false)"></span>
					<span class="preview-die-chip muted" v-html="renderDieValue(12, false)"></span>
				</div>
			</template>
			<template v-else-if="previewKind === 'notes'">
				<div class="preview-bar w-full"></div>
				<div class="preview-bar w-lg muted"></div>
				<div class="preview-bar w-md muted"></div>
			</template>
			<template v-else-if="previewKind === 'curiosity'">
				<div class="preview-line-row">
					<span class="preview-badge-icon"><i class="fas fa-lightbulb"></i></span>
					<div class="preview-bar w-lg"></div>
				</div>
				<div class="preview-bar w-md muted"></div>
			</template>
			<template v-else-if="previewKind === 'subtraits'">
				<div class="preview-split-row">
					<div class="preview-bar w-md"></div>
					<div class="preview-branch-col">
						<div class="preview-bar w-full muted"></div>
						<div class="preview-bar w-lg muted"></div>
					</div>
				</div>
			</template>
			<template v-else>
				<div class="preview-line-row">
					<div class="preview-bar w-lg"></div>
					<span class="preview-die-chip" v-html="renderDieValue(8, true)"></span>
				</div>
				<div class="preview-line-row">
					<div class="preview-bar w-md muted"></div>
					<span class="preview-die-chip muted" v-html="renderDieValue(6, true)"></span>
				</div>
			</template>
		</div>
		<button type="button" class="btn-preset-add preset-card-action" @click.stop="emit('add')">
			<i class="fas fa-plus" aria-hidden="true"></i>
			<span class="preset-gallery-name">{{ preset.label }}</span>
		</button>
		<button
			v-if="deletable"
			type="button"
			class="btn-preset-delete"
			:title="deleteLabel || 'Delete saved preset'"
			:aria-label="deleteLabel || 'Delete saved preset'"
			@click.stop="emit('delete')"
		>
			<i class="fas fa-trash-alt" aria-hidden="true"></i>
		</button>
	</div>
</template>
