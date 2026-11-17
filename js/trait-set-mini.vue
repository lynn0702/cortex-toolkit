<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, toRaw, watch } from 'vue';
import {
	DIE_LADDER,
	ensureView,
	getRating,
	getView,
	ratingDice,
	resolvePpDelta,
	resolveSubtraitNoun,
	type Character,
} from './model.ts';
import { characterCurioFunctions } from './functions.ts';
import ModalDialog from './modal-dialog.vue';
import TraitSetBlock from './trait-set-block.vue';
import TraitSetEditor from './trait-set-editor.vue';
import TraitEditor from './trait-editor.vue';

const props = defineProps<{
	initialSet?: any;
	character?: Character;
	applyLabel?: string;
}>();

const emit = defineEmits<{
	(e: 'close'): void;
	(e: 'saved', preset: any): void;
	(e: 'applyToSet', updatedSet: any): void;
}>();

function createWorkingSet(source?: any): any {
	if (source) {
		const copy = characterCurioFunctions.cloneDeep(source);
		if (!copy.id) copy.id = characterCurioFunctions.generateUUID();
		ensureView(copy);
		if (!Array.isArray(copy.traits)) copy.traits = [];
		return copy;
	}
	return {
		id: characterCurioFunctions.generateUUID(),
		name: 'New Set',
		noun: '',
		traits: [
			{
				id: characterCurioFunctions.generateUUID(),
				name: 'New Trait',
				rating: { type: 'Die', value: [8] },
				traits: [],
			},
		],
		view: {
			header: 'top',
			ratingDisplay: 'rating',
		},
	};
}

function buildWorkingCharacter(sourceSet?: any): any {
	const hostView = props.character ? getView(props.character) : undefined;
	return {
		id: 'mini-preview-character',
		name: props.character?.name || 'Preview',
		dateCreated: new Date().toISOString(),
		dateModified: new Date().toISOString(),
		...(hostView ? { view: structuredClone(toRaw(hostView)) } : {}),
		traitSets: [createWorkingSet(sourceSet)],
	};
}

const workingCharacter = ref<any>(buildWorkingCharacter(props.initialSet));
const editing = ref<any[]>(['traitSet', 0]);
const previewSubmode = ref<'edit' | 'play' | 'print'>('edit');

watch(
	() => props.initialSet,
	(next) => {
		if (next) {
			workingCharacter.value = buildWorkingCharacter(next);
			editing.value = ['traitSet', 0];
		}
	},
);

const workingSet = computed(() => workingCharacter.value?.traitSets?.[0] ?? null);

const editingType = computed<'traitSet' | 'trait' | 'subtrait'>(() => {
	const sel = editing.value;
	if (!Array.isArray(sel) || sel.length < 3) return 'traitSet';
	if (sel[0] === 'subtrait') return 'subtrait';
	if (sel[0] === 'trait') return 'trait';
	return 'traitSet';
});

const traitPath = computed<number[]>(() => {
	const sel = editing.value;
	if (!Array.isArray(sel)) return [];
	if (editingType.value === 'trait') {
		return sel
			.slice(2, 5)
			.map((n) => Number(n))
			.filter((n) => Number.isFinite(n) && n >= 0);
	}
	if (editingType.value === 'subtrait') {
		if (sel.length >= 4) {
			return sel
				.slice(2, 5)
				.map((n) => Number(n))
				.filter((n) => Number.isFinite(n) && n >= 0);
		}
		const u = Number(sel[2]);
		return Number.isFinite(u) && u >= 0 ? [0, u] : [];
	}
	return [];
});

const traitID = computed(() => (traitPath.value.length >= 1 ? traitPath.value[0] : -1));
const subtraitID = computed(() => (traitPath.value.length >= 2 ? traitPath.value[1] : -1));

const resolvedTraitChain = computed<any[]>(() => {
	const ts = workingSet.value;
	if (!ts || !Array.isArray(ts.traits) || !traitPath.value.length) return [];
	const chain: any[] = [];
	let currentList: any[] | undefined = ts.traits;
	for (const idx of traitPath.value) {
		if (!Array.isArray(currentList) || !currentList[idx]) return [];
		const node = currentList[idx];
		chain.push(node);
		currentList = node.traits;
	}
	return chain;
});

const activeTraitNode = computed(() =>
	resolvedTraitChain.value.length ? resolvedTraitChain.value[resolvedTraitChain.value.length - 1] : null,
);

interface Crumb {
	label: string;
	selector: any[] | null;
}

const crumbs = computed<Crumb[]>(() => {
	const setLabel = workingSet.value?.name || 'Set';
	const list: Crumb[] = [{ label: setLabel, selector: ['traitSet', 0] }];
	const chain = resolvedTraitChain.value;
	const path = traitPath.value;
	if (editingType.value === 'subtrait') {
		for (let k = 1; k < chain.length; k++) {
			const node = chain[k];
			const isLast = k === chain.length - 1;
			list.push({
				label: resolveSubtraitNoun(node, workingSet.value),
				selector: isLast ? null : ['subtrait', 0, ...path.slice(0, k + 1)],
			});
		}
	} else if (editingType.value === 'trait') {
		for (let k = 0; k < chain.length; k++) {
			const node = chain[k];
			const isLast = k === chain.length - 1;
			const label =
				k === 0
					? node?.name || (workingSet.value?.noun ? `New ${workingSet.value.noun}` : 'Trait')
					: node?.name || node?.noun || 'Subtrait';
			list.push({
				label,
				selector: isLast ? null : ['trait', 0, ...path.slice(0, k + 1)],
			});
		}
	}
	return list;
});

function onSelectElement(sel: any[]) {
	if (Array.isArray(sel) && (sel[0] === 'trait' || sel[0] === 'subtrait') && sel.length >= 3) {
		editing.value = [sel[0], 0, ...sel.slice(2)];
		return;
	}
	editing.value = ['traitSet', 0];
}

function onUpdateCharacter(nextChar: any) {
	if (nextChar) {
		workingCharacter.value = nextChar;
	}
}

function onAddTrait() {
	const ts = workingSet.value;
	if (!ts) return;
	const noun = ts.noun && ts.noun.length ? ts.noun : 'Trait';
	const trait: any = structuredClone(characterCurioFunctions.defaultTrait);
	trait.name = characterCurioFunctions.nextUniqueName(
		(Array.isArray(ts.traits) ? ts.traits : []).map((tr: any) => tr?.name),
		'New ' + noun,
	);
	const setR = getRating(ts);
	if (setR?.type === 'Pip') {
		trait.rating = { value: [false] };
	} else if (setR?.type === 'Counter') {
		trait.rating = { value: [typeof setR.value?.[0] === 'number' ? setR.value[0] : 0] };
	} else if (setR?.type === 'Dice') {
		const setDice = ratingDice(setR);
		trait.rating = { value: setDice.length ? [...setDice] : [8, 8] };
		if (ts.pool === true) trait.pool = true;
	} else if (ts.rating === null) {
		delete trait.rating;
	} else {
		const allowed = characterCurioFunctions.getTraitSetRatings(ts);
		const cur =
			trait.rating && trait.rating.type === 'Die' && Array.isArray(trait.rating.value) ? trait.rating.value[0] : 0;
		const isDefaultLadder = allowed.length === DIE_LADDER.length && allowed.every((x, i) => x === DIE_LADDER[i]);
		if (allowed.length > 0 && !allowed.includes(cur)) {
			trait.rating = isDefaultLadder
				? { type: 'Die', value: [allowed[0]] }
				: { type: 'Die', value: [allowed[0]], range: allowed.slice() };
		} else if (!isDefaultLadder && allowed.length > 0 && trait.rating) {
			trait.rating.range = allowed.slice();
		}
	}

	const templateSubs = Array.isArray(ts.traits?.[0]?.traits) ? ts.traits[0].traits : [];
	for (const st of templateSubs) {
		if (!st || typeof st !== 'object' || resolvePpDelta(st) !== 0 || getView(st)?.part === 'block') continue;
		const copySub = characterCurioFunctions.cloneDeep(st);
		copySub.id = characterCurioFunctions.generateUUID();
		trait.traits.push(copySub);
	}

	if (!Array.isArray(ts.traits)) ts.traits = [];
	ts.traits.push(trait);
}

function onRemoveTrait(_setIdx: number, tIdx: number) {
	const ts = workingSet.value;
	if (!ts || !Array.isArray(ts.traits)) return;
	if (tIdx >= 0 && tIdx < ts.traits.length) {
		ts.traits.splice(tIdx, 1);
	}
	editing.value = ['traitSet', 0];
}

// Preset saving & standalone .card.json state
const presetLabel = ref<string>('');
const presetBlurb = ref<string>('');
const saveStatusMessage = ref<string>('');
const saveErrorMessage = ref<string>('');
const savedVersion = ref<number>(0);
const fileImportInput = ref<HTMLInputElement | null>(null);

const derivedId = computed(() => characterCurioFunctions.derivePresetId(presetLabel.value));
const hasCollision = computed(() => {
	void savedVersion.value;
	if (!derivedId.value) return false;
	return characterCurioFunctions.hasPresetCollision(derivedId.value);
});

function saveAsPresetCard() {
	saveErrorMessage.value = '';
	saveStatusMessage.value = '';

	const label = (presetLabel.value || '').trim();
	if (!label) {
		saveErrorMessage.value = 'Preset label is required.';
		return;
	}

	const id = derivedId.value;
	if (!id) {
		saveErrorMessage.value = 'Could not derive preset ID from label.';
		return;
	}

	const cardPayload = characterCurioFunctions.cloneDeep(workingSet.value);
	const v = ensureView(cardPayload);
	v.presetId = id;
	v.presetLabel = label;
	if (presetBlurb.value.trim()) {
		v.presetBlurb = presetBlurb.value.trim();
	}

	const saved = characterCurioFunctions.saveCustomSetPreset(cardPayload, {
		label,
		blurb: presetBlurb.value.trim() || undefined,
	});

	if (saved) {
		savedVersion.value++;
		saveStatusMessage.value = `Saved "${label}" into preset library.`;
		emit('saved', saved);
	} else {
		saveErrorMessage.value = 'Could not save preset.';
	}
}

function applyToCurrentSheet() {
	emit('applyToSet', characterCurioFunctions.cloneDeep(workingSet.value));
	emit('close');
}

function exportCardJson() {
	const data = {
		format: 'character-curio-set',
		version: '0.2',
		exportedAt: new Date().toISOString(),
		traitSet: workingSet.value,
	};
	const jsonStr = JSON.stringify(data, null, 2);
	const blob = new Blob([jsonStr], { type: 'application/json' });
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	const filename =
		(workingSet.value?.name || 'character-curio-card').toLowerCase().replace(/[^a-z0-9_-]/g, '-') + '.card.json';
	a.href = url;
	a.download = filename;
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
	URL.revokeObjectURL(url);
}

function triggerImportCardJson() {
	fileImportInput.value?.click();
}

function onFileImportSelected(ev: Event) {
	const input = ev.target as HTMLInputElement | null;
	const file = input?.files?.[0];
	if (!file) return;
	const reader = new FileReader();
	reader.onload = (e) => {
		try {
			const parsed = JSON.parse(e.target?.result as string);
			const importedSet = parsed.traitSet || parsed;
			workingCharacter.value = buildWorkingCharacter(importedSet);
			editing.value = ['traitSet', 0];
			saveErrorMessage.value = '';
			saveStatusMessage.value = `Imported set "${workingSet.value?.name || 'Set'}".`;
		} catch {
			saveErrorMessage.value = 'Invalid set JSON file.';
		}
	};
	reader.readAsText(file);
	if (input) input.value = '';
}

const NARROW_MEDIA = '(max-width: 56.25rem)';
const NON_KEYBOARD_INPUT_TYPES = new Set([
	'checkbox',
	'radio',
	'range',
	'button',
	'submit',
	'reset',
	'file',
	'color',
	'hidden',
]);

const bodyEl = ref<HTMLElement | null>(null);
const isNarrowViewport = ref(false);
const userCollapsedPreview = ref(false);
const isTextEntryFocused = ref(false);
const isVisualViewportCompressed = ref(false);
const keyboardPeekOverride = ref(false);

const keyboardOpen = computed(
	() => isNarrowViewport.value && (isTextEntryFocused.value || isVisualViewportCompressed.value),
);
const effectivePreviewCollapsed = computed(
	() => isNarrowViewport.value && (keyboardOpen.value ? !keyboardPeekOverride.value : userCollapsedPreview.value),
);

let narrowMql: MediaQueryList | null = null;
let baselineHeight = 0;
let lastIsLandscape = false;
let focusOutTimer: ReturnType<typeof setTimeout> | null = null;

function isVirtualKeyboardTarget(target: EventTarget | null): boolean {
	if (!(target instanceof HTMLElement)) return false;
	if (!target.closest('.mini-inspector-pane, .mini-save-section')) return false;
	if ('disabled' in target && (target as HTMLInputElement).disabled) return false;
	if ('readOnly' in target && (target as HTMLInputElement).readOnly) return false;
	if (target instanceof HTMLTextAreaElement) return true;
	if (target.isContentEditable || target.getAttribute('contenteditable') === 'true') return true;
	if (target instanceof HTMLInputElement) {
		const type = (target.type || 'text').toLowerCase();
		return !NON_KEYBOARD_INPUT_TYPES.has(type);
	}
	return false;
}

function getDialogElement(): HTMLElement | null {
	return (bodyEl.value?.closest('dialog') as HTMLElement | null) ?? null;
}

function clearViewportVars(dialogEl?: HTMLElement | null) {
	const target = dialogEl ?? getDialogElement();
	target?.style.removeProperty('--mini-vvh');
	target?.style.removeProperty('--mini-vv-top');
}

function syncViewportMetrics() {
	if (typeof window === 'undefined') return;
	const narrowed = narrowMql ? narrowMql.matches : Boolean(window.matchMedia?.(NARROW_MEDIA)?.matches);
	isNarrowViewport.value = narrowed;

	const vv = window.visualViewport;
	const layoutHeight = window.innerHeight || document.documentElement?.clientHeight || 0;
	const layoutWidth = window.innerWidth || document.documentElement?.clientWidth || 0;
	const isLandscape = layoutWidth > layoutHeight;
	const currentHeight = vv ? vv.height : layoutHeight;

	if (isLandscape !== lastIsLandscape) {
		lastIsLandscape = isLandscape;
		baselineHeight = currentHeight;
	} else if (!isTextEntryFocused.value && (!vv || vv.height >= layoutHeight - 2)) {
		if (baselineHeight === 0 || currentHeight >= baselineHeight * 0.9 || currentHeight > baselineHeight) {
			baselineHeight = currentHeight;
		}
	}

	const wasCompressed = isVisualViewportCompressed.value;
	const vvCompressed = Boolean(narrowed && vv && layoutHeight > 0 && vv.height < layoutHeight * 0.78);
	const layoutCompressed = Boolean(
		narrowed && baselineHeight > 0 && layoutHeight < baselineHeight * 0.78 && layoutHeight < 560,
	);
	const nextCompressed = vvCompressed || layoutCompressed;
	isVisualViewportCompressed.value = nextCompressed;

	if (wasCompressed && !nextCompressed) {
		keyboardPeekOverride.value = false;
	}

	const dialogEl = getDialogElement();
	if (dialogEl) {
		if (narrowed && vv && layoutHeight > 0 && vv.height < layoutHeight - 2) {
			dialogEl.style.setProperty('--mini-vvh', `${Math.round(vv.height)}px`);
			dialogEl.style.setProperty('--mini-vv-top', `${Math.max(0, Math.round(vv.offsetTop))}px`);
		} else {
			clearViewportVars(dialogEl);
		}
	}
}

async function onBodyFocusIn(ev: FocusEvent) {
	if (focusOutTimer !== null) {
		clearTimeout(focusOutTimer);
		focusOutTimer = null;
	}
	if (isNarrowViewport.value && isVirtualKeyboardTarget(ev.target)) {
		isTextEntryFocused.value = true;
		await nextTick();
		(ev.target as HTMLElement).scrollIntoView?.({ block: 'nearest' });
	}
}

function onBodyFocusOut() {
	if (focusOutTimer !== null) {
		clearTimeout(focusOutTimer);
	}
	focusOutTimer = setTimeout(() => {
		focusOutTimer = null;
		const active = typeof document !== 'undefined' ? document.activeElement : null;
		const insideBody = active instanceof HTMLElement && bodyEl.value?.contains(active);
		if (isNarrowViewport.value && insideBody && isVirtualKeyboardTarget(active)) {
			isTextEntryFocused.value = true;
			return;
		}
		isTextEntryFocused.value = false;
		keyboardPeekOverride.value = false;
		syncViewportMetrics();
	}, 60);
}

function togglePreviewCollapsed() {
	if (keyboardOpen.value) {
		keyboardPeekOverride.value = !keyboardPeekOverride.value;
	} else {
		userCollapsedPreview.value = !userCollapsedPreview.value;
	}
}

onMounted(() => {
	if (typeof window === 'undefined') return;
	narrowMql = window.matchMedia?.(NARROW_MEDIA) ?? null;
	lastIsLandscape = (window.innerWidth || 0) > (window.innerHeight || 0);
	syncViewportMetrics();
	narrowMql?.addEventListener?.('change', syncViewportMetrics);
	window.addEventListener('resize', syncViewportMetrics);
	window.visualViewport?.addEventListener?.('resize', syncViewportMetrics);
	window.visualViewport?.addEventListener?.('scroll', syncViewportMetrics);
});

onBeforeUnmount(() => {
	if (focusOutTimer !== null) {
		clearTimeout(focusOutTimer);
		focusOutTimer = null;
	}
	narrowMql?.removeEventListener?.('change', syncViewportMetrics);
	if (typeof window !== 'undefined') {
		window.removeEventListener('resize', syncViewportMetrics);
		window.visualViewport?.removeEventListener?.('resize', syncViewportMetrics);
		window.visualViewport?.removeEventListener?.('scroll', syncViewportMetrics);
	}
	clearViewportVars();
});
</script>

<template>
	<ModalDialog
		:open="true"
		label="Set Builder"
		dialog-class="trait-set-mini-dialog trait-set-mini"
		@close="emit('close')"
	>
		<header class="mini-header">
			<div class="mini-header-left">
				<span class="mini-header-icon" aria-hidden="true">
					<i class="fas fa-th-large"></i>
				</span>
				<h2 id="trait-set-mini-title" class="mini-title">Set Builder</h2>
			</div>
			<div class="mini-header-actions">
				<button
					v-if="props.character"
					type="button"
					class="btn-apply-sheet mini-header-apply-btn"
					@click="applyToCurrentSheet"
				>
					{{ props.applyLabel || 'Add to Sheet' }}
				</button>
				<button type="button" class="mini-close-btn" aria-label="Close dialog" @click="emit('close')">&times;</button>
			</div>
		</header>

		<div ref="bodyEl" class="mini-body" @focusin="onBodyFocusIn" @focusout="onBodyFocusOut">
			<section
				class="mini-card-preview-section"
				:class="{ 'is-collapsed': effectivePreviewCollapsed }"
				aria-label="Live Set Preview"
			>
				<div class="preview-mode-bar">
					<div class="preview-mode-heading">
						<span class="preview-mode-title">Preview</span>
						<span v-if="effectivePreviewCollapsed" class="preview-collapsed-summary">
							{{ workingSet?.name || 'Set' }}
						</span>
					</div>
					<div class="preview-mode-actions">
						<div
							v-show="!effectivePreviewCollapsed"
							class="preview-mode-toggles"
							role="group"
							aria-label="Preview mode"
						>
							<button
								v-for="m in [
									{ id: 'edit', label: 'Edit' },
									{ id: 'play', label: 'Play' },
									{ id: 'print', label: 'Print' },
								] as const"
								:key="m.id"
								type="button"
								class="mini-toggle-btn"
								:class="{ active: previewSubmode === m.id }"
								:aria-pressed="previewSubmode === m.id"
								@click="previewSubmode = m.id"
							>
								{{ m.label }}
							</button>
						</div>
						<button
							type="button"
							class="mini-preview-collapse-btn"
							:aria-expanded="!effectivePreviewCollapsed"
							aria-controls="mini-live-preview-frame"
							:aria-label="effectivePreviewCollapsed ? 'Show preview' : 'Hide preview'"
							@click="togglePreviewCollapsed"
						>
							<span>{{ effectivePreviewCollapsed ? 'Show' : 'Hide' }}</span>
							<i
								class="fas"
								:class="effectivePreviewCollapsed ? 'fa-chevron-down' : 'fa-chevron-up'"
								aria-hidden="true"
							></i>
						</button>
					</div>
				</div>

				<div id="mini-live-preview-frame" v-show="!effectivePreviewCollapsed" class="mini-preview-sheet-frame">
					<div class="character-sheet" :class="'submode-' + previewSubmode">
						<TraitSetBlock
							:character="workingCharacter"
							:traitSetID="0"
							:submode="previewSubmode"
							:editing="editing"
							@selectElement="onSelectElement"
							@updateCharacter="onUpdateCharacter"
							@addTrait="onAddTrait"
							@removeTrait="onRemoveTrait"
						/>
					</div>
				</div>
			</section>

			<div class="mini-authoring-column studio-panel-body mini-inspector-pane">
				<nav v-if="editingType !== 'traitSet'" class="studio-breadcrumb mini-breadcrumb" aria-label="Set breadcrumb">
					<template v-for="(c, idx) in crumbs" :key="idx">
						<span v-if="idx > 0" class="crumb-sep">›</span>
						<button v-if="c.selector" type="button" class="crumb-link" @click="onSelectElement(c.selector)">
							{{ c.label }}
						</button>
						<span v-else class="crumb-current">{{ c.label }}</span>
					</template>
				</nav>

				<TraitEditor
					v-if="(editingType === 'trait' || editingType === 'subtrait') && activeTraitNode"
					:key="editingType + '-0-' + traitPath.join('-')"
					:character="workingCharacter"
					:traitSetID="0"
					:traitID="traitID"
					:subtraitID="traitPath.length >= 2 ? subtraitID : undefined"
					:traitPath="traitPath"
					:isSetSubtrait="editingType === 'subtrait'"
					submode="edit"
					:open="true"
					@selectElement="onSelectElement"
					@updateCharacter="onUpdateCharacter"
					@removeTrait="onRemoveTrait"
				/>
				<TraitSetEditor
					v-else
					:character="workingCharacter"
					:traitSetID="0"
					:open="true"
					standalone
					@selectElement="onSelectElement"
					@updateCharacter="onUpdateCharacter"
				/>
			</div>

			<section class="mini-save-section" aria-label="Save Preset">
				<h3 class="mini-save-title">Preset &amp; JSON</h3>

				<div class="mini-save-fields">
					<label class="mini-field">
						<span class="mini-field-label">Preset Name</span>
						<input
							v-model="presetLabel"
							type="text"
							class="mini-input"
							placeholder="Preset name"
							aria-label="Preset Label"
						/>
						<div v-if="hasCollision" class="mini-collision-alert">
							A preset with ID "{{ derivedId }}" already exists.
						</div>
					</label>

					<label class="mini-field">
						<span class="mini-field-label">Blurb</span>
						<input
							v-model="presetBlurb"
							type="text"
							class="mini-input"
							placeholder="Short description"
							aria-label="Preset Blurb"
						/>
					</label>

					<div v-if="saveStatusMessage" class="mini-save-status success">
						<i class="fas fa-check-circle" aria-hidden="true"></i> {{ saveStatusMessage }}
					</div>
					<div v-if="saveErrorMessage" class="mini-save-status error">
						<i class="fas fa-exclamation-circle" aria-hidden="true"></i> {{ saveErrorMessage }}
					</div>
				</div>

				<div class="mini-save-actions">
					<button v-if="props.character" type="button" class="btn-apply-sheet" @click="applyToCurrentSheet">
						{{ props.applyLabel || 'Add to Sheet' }}
					</button>

					<button
						type="button"
						class="btn-save-preset mini-save-preset-btn"
						:disabled="!presetLabel.trim() || hasCollision"
						@click="saveAsPresetCard"
					>
						<i class="fas fa-bookmark" aria-hidden="true"></i> Save Preset
					</button>

					<div class="mini-json-card-actions">
						<button type="button" class="btn-json-action" title="Export standalone .json set" @click="exportCardJson">
							<i class="fas fa-file-download" aria-hidden="true"></i> Export JSON
						</button>

						<button
							type="button"
							class="btn-json-action"
							title="Import standalone .json set"
							@click="triggerImportCardJson"
						>
							<i class="fas fa-file-upload" aria-hidden="true"></i> Import JSON
						</button>
					</div>
				</div>
			</section>
		</div>

		<input
			ref="fileImportInput"
			type="file"
			accept=".json,application/json"
			class="sr-only"
			tabindex="-1"
			aria-label="Import trait set file"
			@change="onFileImportSelected"
		/>
	</ModalDialog>
</template>
