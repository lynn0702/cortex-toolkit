<script setup lang="ts">
import {
	ensureView,
	getView,
	isNameSet,
	isRingBadgeTrait,
	resolveSetPillar,
	type Character,
	type FrameConfig,
	type TraitSet,
} from './model.ts';
import { characterCurioFunctions } from './functions.ts';
import { computed, inject, nextTick, ref, onMounted, watch, type Component } from 'vue';
import { useTraitSet, type StagedDiePayload } from './use-trait-set.ts';
import type { EditingPath } from './use-history.ts';
import TraitSetImage from './trait-set-image.vue';
import TraitSetPips from './trait-set-pips.vue';
import TraitSetSubtraitColumns from './trait-set-subtrait-columns.vue';
import TraitSetDieRows from './trait-set-die-rows.vue';
import TraitSetDiceCount from './trait-set-dice-count.vue';
import TraitSetList from './trait-set-list.vue';
import TraitSetFrame from './trait-set-frame.vue';
import TraitSetName from './trait-set-name.vue';
import TraitSetCuriosity from './trait-set-curiosity.vue';
import PortraitRing from './portrait-ring.vue';

const props = defineProps<{
	character: Character;
	traitSetID?: number;
	submode?: string | null;
	editing?: EditingPath | null;
	viewY?: number | null;
	printBlank?: boolean;
}>();

const emit = defineEmits<{
	(e: 'selectElement', selector: EditingPath): void;
	(e: 'updateCharacter', character: Character): void;
	(e: 'removeTrait', traitSetID: number, traitID: number): void;
	(e: 'removeTraitSet', traitSetID: number): void;
	(e: 'addTrait', traitSetID: number): void;
	(e: 'addDieToRoller', die: StagedDiePayload | StagedDiePayload[]): void;
}>();

const ts = useTraitSet(props, emit);

const {
	traitSet,
	s,
	submode,
	viewY,
	character,
	getTraitSetClasses,
	isSelected,
	renderText,
	selectElement,
	updateCharacter,
	addTrait,
	removeTrait,
	removeTraitSet,
	getRating,
	renderDieValue,
	getCounterLabel,
	hasTraitCounter,
	isHiddenIn,
	resolvedBorder,
	resolvedFrame,
	traitArrayMode,
	portraitFrameShape,
	showPortraitHub,
	ratingDice,
	traitSetFrameStyle,
	effectiveImageUrl,
	effectiveAlignment,
	effectiveZoom,
	effectivePortraitStyle,
	isCanvasSetActive,
	openCanvasSet,
	closeCanvasSet,
	isPlayMutableSet,
} = ts;

const isName = computed(() => isNameSet(traitSet.value));
const pillarCtx = inject<{
	sheetUsesPillars: { value: boolean };
	pillarOptions: { value: ReadonlyArray<{ key: string; label: string }> };
	setSetPillar: (ts: TraitSet | null | undefined, val: string) => void;
} | null>('curioPillarContext', null);

const rawSetPillar = computed(() => {
	const raw = getView(traitSet.value)?.pillar;
	return typeof raw === 'string' ? raw.trim() : '';
});

function onSetPillarChange(event: Event) {
	if (!traitSet.value || !pillarCtx) return;
	pillarCtx.setSetPillar(traitSet.value, (event.target as HTMLSelectElement).value);
}

const isHeaderInteractive = computed(
	() =>
		submode.value === 'edit' ||
		(submode.value === 'play' && Boolean(traitSet.value && isPlayMutableSet(traitSet.value))),
);

function onHeaderActivate() {
	if (submode.value === 'edit') {
		if (headerMode.value === 'top') {
			openCanvasSet(s.value);
			nextTick(() => {
				rootEl.value?.querySelector<HTMLInputElement>('input.trait-set-name-inline-input')?.focus();
			});
			return;
		}
		selectElement(['traitSet', s.value]);
		return;
	}
	if (submode.value === 'play' && traitSet.value && isPlayMutableSet(traitSet.value)) {
		openCanvasSet(s.value);
		nextTick(() => {
			rootEl.value?.querySelector<HTMLInputElement>('input.trait-set-name-inline-input')?.focus();
		});
	}
}

function onHeaderDiePlayActivate(event: Event, dieSize: number) {
	if (submode.value !== 'play') return;
	if (event.type === 'keydown') {
		event.preventDefault();
	}
	event.stopPropagation();
	emit('addDieToRoller', {
		size: dieSize,
		qty: 1,
		source: traitSet.value?.name,
	});
}

function onSetNameInlineInput(event: Event) {
	if (!traitSet.value) return;
	traitSet.value.name = (event.target as HTMLInputElement).value;
	updateCharacter(props.character);
}

function onSetNameInlineEnter(event: KeyboardEvent) {
	if (event.isComposing || event.keyCode === 229) return;
	if (traitSet.value && !String(traitSet.value.name || '').trim()) {
		traitSet.value.name = 'New Set';
		updateCharacter(props.character);
	}
	closeCanvasSet();
}

function onSetNameInlineBlur() {
	if (traitSet.value && !String(traitSet.value.name || '').trim()) {
		traitSet.value.name = 'New Set';
		updateCharacter(props.character);
	}
	closeCanvasSet();
}

const canRemoveSetInPlay = computed(() => {
	if (isName.value) return false;
	const v = getView(traitSet.value);
	return Boolean(v?.playMutable || v?.visibility === 'play-only');
});

const headerTop = computed(() => getView(traitSet.value)?.header === 'top');
const headerMode = computed(() => {
	const h = getView(traitSet.value)?.header;
	return h === 'top' || h === 'bottom' || h === 'none' ? h : 'sidebar';
});
const hasHeader = computed(
	() =>
		!isName.value &&
		(Boolean(traitSet.value?.name) || isCanvasSetActive(s.value)) &&
		getView(traitSet.value)?.header !== 'none',
);

const showRingActions = computed(() => {
	if (!hasTraitArray.value || submode.value !== 'edit') return false;
	if (!shouldRenderBodyComponent.value) return true;
	const v = getView(traitSet.value);
	if (v?.ringNoun) return true;
	return Boolean(traitSet.value?.traits?.some((t) => Boolean(getView(t)?.ring)));
});

const setSfxEntries = computed(() => {
	const subs = traitSet.value?.traits;
	if (!Array.isArray(subs)) return [];
	return subs.filter((c) => Boolean(c && typeof c === 'object' && getView(c)?.part === 'block'));
});

const isSetTrulyEmpty = computed(() => {
	const setNode = traitSet.value;
	if (!setNode || isName.value) return false;
	if (Array.isArray(setNode.traits) && setNode.traits.length > 0) return false;
	const r = getRating(setNode);
	if (
		r &&
		(ratingDice(r).length > 0 ||
			(r.type === 'Pip' && Array.isArray(r.value) && r.value.length > 0) ||
			r.type === 'Counter')
	) {
		return false;
	}
	if (effectiveImageUrl.value) return false;
	if (setNode.ref) return false;
	if (setSfxEntries.value.length > 0) return false;
	if (typeof setNode.description === 'string' && setNode.description.trim().length > 0) return false;
	return true;
});

const BODY_COMPONENTS: Record<string, Component> = {
	name: TraitSetName,
	curiosity: TraitSetCuriosity,
	image: TraitSetImage,
	pips: TraitSetPips,
	'subtrait-columns': TraitSetSubtraitColumns,
	'die-rows': TraitSetDieRows,
	'dice-count': TraitSetDiceCount,
};

const bodyComponent = computed(() => {
	if (isName.value) return TraitSetName;
	const style = getView(traitSet.value)?.style?.body;
	if (style === 'curiosity' || (!style && traitSet.value?.ref)) return TraitSetCuriosity;
	return (style && BODY_COMPONENTS[style]) || TraitSetList;
});

const hasTraitArray = computed(() => traitArrayMode.value !== 'none');

const shouldRenderBodyComponent = computed(() => {
	if (isName.value) return true;
	const view = getView(traitSet.value);
	const bodyStyle = view?.style?.body;
	if (bodyStyle === 'image' || bodyStyle === 'pips' || bodyStyle === 'curiosity' || Boolean(traitSet.value?.ref)) {
		return true;
	}
	if (
		resolvedBorder.value.shape === 'line' &&
		!showPortraitHub.value &&
		!view?.imageConfig?.url &&
		(!traitSet.value?.traits || !traitSet.value.traits.length)
	) {
		return false;
	}
	if (hasTraitArray.value) {
		const all = traitSet.value?.traits || [];
		const hasExplicitRingTraits = all.some((t) => Boolean(getView(t)?.ring));
		if (!hasExplicitRingTraits) return false;
		return all.some((t) => !getView(t)?.ring && !isRingBadgeTrait(t));
	}
	if (
		showPortraitHub.value &&
		(!traitSet.value?.traits || traitSet.value.traits.length === 0) &&
		submode.value !== 'edit'
	) {
		return false;
	}
	return true;
});

const rootEl = ref<HTMLElement | null>(null);
const ringFileInput = ref<HTMLInputElement | null>(null);
const isRingDragOver = ref(false);

function applyRingImageFile(file: File) {
	if (!file || !character.value || !traitSet.value) return;
	characterCurioFunctions.processImageFile(file, 1280, 0.85).then(
		(dataURL: string) => {
			const v = ensureView(traitSet.value);
			const f: Partial<FrameConfig> = typeof v.frame === 'object' && v.frame !== null ? (v.frame as FrameConfig) : {};
			v.frame = {
				...f,
				shape: f.shape || 'circle',
				image: {
					...(f.image || {}),
					url: dataURL,
				},
			};
			updateCharacter(character.value);
			selectElement(['traitSet', s.value]);
		},
		() => {},
	);
}

function onRingDropzoneClick() {
	selectElement(['traitSet', s.value]);
	ringFileInput.value?.click();
}

function onRingFileChange(event: Event) {
	const input = event.target as HTMLInputElement;
	const file = input.files?.[0];
	if (file) applyRingImageFile(file);
	input.value = '';
}

function onRingDrop(event: DragEvent) {
	isRingDragOver.value = false;
	const file = event.dataTransfer?.files?.[0];
	if (file && file.type.startsWith('image/')) {
		applyRingImageFile(file);
	}
}

onMounted(() => {
	ts.observeContainer(rootEl.value);
});
watch(rootEl, (el) => {
	ts.observeContainer(el);
});
</script>

<template>
	<section
		ref="rootEl"
		v-if="traitSet && !isHiddenIn(traitSet, submode)"
		:class="getTraitSetClasses(traitSet)"
		:style="traitSetFrameStyle"
		:data-set-index="s"
		:data-set-name="traitSet.name || undefined"
		:aria-label="traitSet.name || 'Trait Set'"
	>
		<!-- Block border SVG enclosing entire trait set (header + body) -->
		<TraitSetFrame
			v-if="!isName && resolvedBorder.shape === 'block' && resolvedBorder.explicit"
			mode="border"
			:trait-set="traitSet"
			:header-mode="headerMode"
			:has-header="hasHeader"
		/>

		<button
			v-if="submode === 'play' && canRemoveSetInPlay"
			type="button"
			class="trait-set-play-remove-btn"
			title="Remove set"
			aria-label="Remove set"
			@click.stop="removeTraitSet(s)"
		>
			<i class="fas fa-times" aria-hidden="true"></i>
		</button>

		<div class="trait-set-header" v-if="hasHeader && headerMode !== 'bottom'">
			<div v-if="isCanvasSetActive(s) && headerMode === 'top'" class="trait-set-header-inline-edit" @click.stop>
				<input
					type="text"
					class="trait-set-name-inline-input"
					:value="traitSet.name"
					placeholder="Set name"
					aria-label="Set name"
					@input="onSetNameInlineInput"
					@keydown.enter="onSetNameInlineEnter"
					@keydown.escape.stop.prevent="closeCanvasSet()"
					@blur="onSetNameInlineBlur"
				/>
			</div>
			<transition v-else appear>
				<div
					:class="{ 'trait-set-header-inner': true, selected: isSelected(['traitSet', s]) }"
					:role="isHeaderInteractive ? 'button' : undefined"
					:tabindex="isHeaderInteractive ? 0 : undefined"
					:aria-label="
						submode === 'edit'
							? 'Edit ' + (traitSet.name || 'trait set')
							: isHeaderInteractive
								? 'Rename ' + (traitSet.name || 'set')
								: undefined
					"
					@keydown.enter.prevent="isHeaderInteractive ? onHeaderActivate() : null"
					@keydown.space.prevent="isHeaderInteractive ? onHeaderActivate() : null"
					@click.stop="isHeaderInteractive ? onHeaderActivate() : null"
				>
					<div class="trait-set-header-name">{{ traitSet.name }}</div>
					<span
						v-if="traitSet.rating && getRating(traitSet)?.type === 'Die' && ratingDice(getRating(traitSet)).length > 0"
						class="trait-set-header-rating diecon-wrapper"
						v-html="renderDieValue((getRating(traitSet)?.value?.[0] as number) || 8, true)"
						:role="submode === 'play' ? 'button' : undefined"
						:tabindex="submode === 'play' ? 0 : undefined"
						:aria-label="
							submode === 'play'
								? `Stage d${(getRating(traitSet)?.value?.[0] as number) || 8} ${traitSet.name}`
								: undefined
						"
						@click="onHeaderDiePlayActivate($event, (getRating(traitSet)?.value?.[0] as number) || 8)"
						@keydown.enter="onHeaderDiePlayActivate($event, (getRating(traitSet)?.value?.[0] as number) || 8)"
						@keydown.space="onHeaderDiePlayActivate($event, (getRating(traitSet)?.value?.[0] as number) || 8)"
					></span>
					<span
						v-else-if="
							traitSet.rating &&
							getRating(traitSet)?.type === 'Dice' &&
							ratingDice(getRating(traitSet)).length > 0 &&
							traitArrayMode === 'none'
						"
						class="trait-set-header-dice"
					>
						<span
							v-for="(dieSize, dIdx) in ratingDice(getRating(traitSet))"
							:key="'hdr-d-' + dIdx"
							class="trait-set-header-rating diecon-wrapper"
							v-html="renderDieValue(dieSize, true)"
							:role="submode === 'play' ? 'button' : undefined"
							:tabindex="submode === 'play' ? 0 : undefined"
							:aria-label="submode === 'play' ? `Stage d${dieSize} ${traitSet.name}` : undefined"
							@click="onHeaderDiePlayActivate($event, dieSize)"
							@keydown.enter="onHeaderDiePlayActivate($event, dieSize)"
							@keydown.space="onHeaderDiePlayActivate($event, dieSize)"
						></span>
					</span>
					<div
						class="trait-set-header-counter"
						v-if="headerTop && traitSet.traits?.some((t) => hasTraitCounter(t)) && getCounterLabel(traitSet).length > 0"
					>
						{{ getCounterLabel(traitSet) }}
					</div>
				</div>
			</transition>
			<div
				v-if="headerMode === 'top' && (submode === 'edit' || isCanvasSetActive(s))"
				class="trait-set-header-actions"
				@click.stop
			>
				<select
					v-if="submode === 'edit' && pillarCtx?.sheetUsesPillars.value"
					class="set-header-pillar-chip"
					:aria-label="'Pillar for ' + (traitSet.name || 'trait set')"
					:value="rawSetPillar"
					@click.stop
					@keydown.stop
					@change.stop="onSetPillarChange"
				>
					<option v-for="opt in pillarCtx.pillarOptions.value" :key="'set-pil-' + opt.key" :value="opt.key">
						{{ opt.key ? opt.label : `Auto (${resolveSetPillar(traitSet)})` }}
					</option>
				</select>
				<button
					v-if="isSetTrulyEmpty && (submode === 'edit' || isCanvasSetActive(s))"
					type="button"
					class="sheet-header-settings-btn set-header-action-btn is-danger"
					title="Delete set"
					aria-label="Delete set"
					@mousedown.prevent
					@click.stop="
						closeCanvasSet();
						removeTraitSet(s);
					"
				>
					<i class="fas fa-trash" aria-hidden="true"></i>
				</button>
				<button
					v-if="submode === 'edit'"
					type="button"
					class="sheet-header-settings-btn set-header-action-btn set-header-settings-btn"
					title="Set options"
					:aria-label="'Configure ' + (traitSet.name || 'trait set')"
					@mousedown.prevent
					@click.stop="
						closeCanvasSet();
						selectElement(['traitSet', s]);
					"
				>
					<i class="fas fa-sliders" aria-hidden="true"></i>
				</button>
			</div>
		</div>

		<div
			class="trait-set-body"
			:class="{ 'trait-set-body-framed': resolvedBorder.explicit || hasTraitArray || portraitFrameShape !== 'none' }"
		>
			<!-- Section line border divider -->
			<TraitSetFrame v-if="!isName && resolvedBorder.shape === 'line'" mode="border" :trait-set="traitSet" />

			<div
				v-if="!isName && !(hasHeader && headerMode === 'top') && (submode === 'edit' || isCanvasSetActive(s))"
				class="trait-set-top-controls"
				@click.stop
			>
				<input
					v-if="isCanvasSetActive(s)"
					type="text"
					class="trait-set-name-inline-input"
					:value="traitSet.name"
					placeholder="Set name"
					aria-label="Set name"
					@input="onSetNameInlineInput"
					@keydown.enter="onSetNameInlineEnter"
					@keydown.escape.stop.prevent="closeCanvasSet()"
					@blur="onSetNameInlineBlur"
				/>
				<div class="trait-set-header-actions" @click.stop>
					<select
						v-if="submode === 'edit' && pillarCtx?.sheetUsesPillars.value"
						class="set-header-pillar-chip"
						:aria-label="'Pillar for ' + (traitSet.name || 'trait set')"
						:value="rawSetPillar"
						@click.stop
						@keydown.stop
						@change.stop="onSetPillarChange"
					>
						<option v-for="opt in pillarCtx.pillarOptions.value" :key="'set-pil-' + opt.key" :value="opt.key">
							{{ opt.key ? opt.label : `Auto (${resolveSetPillar(traitSet)})` }}
						</option>
					</select>
					<button
						v-if="isSetTrulyEmpty && (submode === 'edit' || isCanvasSetActive(s))"
						type="button"
						class="sheet-header-settings-btn set-header-action-btn is-danger"
						title="Delete set"
						aria-label="Delete set"
						@mousedown.prevent
						@click.stop="
							closeCanvasSet();
							removeTraitSet(s);
						"
					>
						<i class="fas fa-trash" aria-hidden="true"></i>
					</button>
					<button
						v-if="submode === 'edit'"
						type="button"
						class="sheet-header-settings-btn set-header-action-btn set-header-settings-btn"
						title="Set options"
						:aria-label="'Configure ' + (traitSet.name || 'trait set')"
						@mousedown.prevent
						@click.stop="
							closeCanvasSet();
							selectElement(['traitSet', s]);
						"
					>
						<i class="fas fa-sliders" aria-hidden="true"></i>
					</button>
				</div>
			</div>

			<!-- Set-level Dice fallback when header is none and Trait Array is None -->
			<div
				v-if="
					!hasHeader &&
					traitSet.rating &&
					getRating(traitSet)?.type === 'Dice' &&
					ratingDice(getRating(traitSet)).length > 0 &&
					traitArrayMode === 'none'
				"
				class="trait-set-body-dice"
			>
				<span
					v-for="(dieSize, dIdx) in ratingDice(getRating(traitSet))"
					:key="'body-d-' + dIdx"
					class="trait-set-header-rating diecon-wrapper"
					v-html="renderDieValue(dieSize, true)"
					role="button"
					tabindex="0"
					:aria-label="`Stage d${dieSize} ${traitSet.name || 'Trait Set'}`"
					@click.stop="
						submode === 'play'
							? emit('addDieToRoller', {
									size: dieSize,
									qty: 1,
									source: traitSet.name || traitSet.noun || 'Pool',
								})
							: null
					"
				></span>
			</div>

			<!-- Set portrait hub with optional vector frame and optional radial Trait Array -->
			<div class="portrait" v-if="showPortraitHub" :class="'portrait-shape-' + portraitFrameShape">
				<div
					:class="{ 'portrait-inner': true, selected: isSelected(['traitSet', s]) }"
					@click.stop="submode === 'edit' ? selectElement(['traitSet', s]) : null"
				>
					<div
						:class="'portrait-circle portrait-alignment-' + effectiveAlignment"
						width="100%"
						height="100%"
						:style="effectivePortraitStyle"
					>
						<template v-if="!effectiveImageUrl && submode === 'edit'">
							<button
								type="button"
								class="ring-portrait-dropzone"
								:class="{ 'is-dragover': isRingDragOver }"
								aria-label="Upload or drop portrait image"
								@click.stop="onRingDropzoneClick"
								@dragenter.prevent="isRingDragOver = true"
								@dragover.prevent="isRingDragOver = true"
								@dragleave.prevent="isRingDragOver = false"
								@drop.prevent="onRingDrop"
							>
								<i class="fas fa-image" aria-hidden="true"></i>
								<span>Drop or upload</span>
							</button>
							<input
								ref="ringFileInput"
								type="file"
								:id="'ring-portrait-file-' + s"
								:name="'ringPortraitFile_' + s"
								class="sr-only"
								accept="image/*"
								aria-label="Upload ring portrait image"
								@change="onRingFileChange"
							/>
						</template>
					</div>
					<TraitSetFrame v-if="portraitFrameShape !== 'none'" mode="portrait" :trait-set="traitSet" />
				</div>
				<PortraitRing
					v-if="hasTraitArray"
					:character="character"
					:editing="editing"
					:submode="submode"
					:viewY="viewY"
					:ringTraitID="s"
					@selectElement="selectElement"
					@updateCharacter="updateCharacter"
					@addDieToRoller="emit('addDieToRoller', $event)"
					@removeTrait="removeTrait"
				/>
			</div>

			<component :is="bodyComponent" v-if="shouldRenderBodyComponent" />

			<div class="ring-actions" v-if="showRingActions">
				<div class="preview-button-container">
					<div class="preview-button-container-inner">
						<button type="button" class="preview-button" @click.stop="addTrait(s)">
							<span
								><i class="fas fa-plus" aria-hidden="true"></i>
								{{ (getView(traitSet)?.ringNoun as string) || traitSet?.noun || 'Trait' }}</span
							>
						</button>
					</div>
				</div>
			</div>

			<ul class="sfx" v-if="!isName && setSfxEntries.length">
				<li v-for="(sfx, sfId) in setSfxEntries" :key="(sfx && sfx._lid) || 'sfx' + sfId">
					<span class="sfx-name">{{ sfx.name }}</span
					>:
					<span class="sfx-description" v-html="renderText(sfx.description)"></span>
				</li>
			</ul>
		</div>

		<div class="trait-set-header" v-if="hasHeader && headerMode === 'bottom'">
			<transition appear>
				<div
					:class="{ 'trait-set-header-inner': true, selected: isSelected(['traitSet', s]) }"
					:role="submode === 'edit' ? 'button' : undefined"
					:tabindex="submode === 'edit' ? 0 : undefined"
					:aria-label="submode === 'edit' ? 'Edit ' + (traitSet.name || 'trait set') : undefined"
					@keydown.enter.prevent="submode === 'edit' ? selectElement(['traitSet', s]) : null"
					@keydown.space.prevent="submode === 'edit' ? selectElement(['traitSet', s]) : null"
					@click.stop="submode === 'edit' ? selectElement(['traitSet', s]) : null"
				>
					<div class="trait-set-header-name">{{ traitSet.name }}</div>
					<span
						v-if="traitSet.rating && getRating(traitSet)?.type === 'Die' && ratingDice(getRating(traitSet)).length > 0"
						class="trait-set-header-rating diecon-wrapper"
						v-html="renderDieValue((getRating(traitSet)?.value?.[0] as number) || 8, true)"
						:role="submode === 'play' ? 'button' : undefined"
						:tabindex="submode === 'play' ? 0 : undefined"
						:aria-label="
							submode === 'play'
								? `Stage d${(getRating(traitSet)?.value?.[0] as number) || 8} ${traitSet.name}`
								: undefined
						"
						@click="onHeaderDiePlayActivate($event, (getRating(traitSet)?.value?.[0] as number) || 8)"
						@keydown.enter="onHeaderDiePlayActivate($event, (getRating(traitSet)?.value?.[0] as number) || 8)"
						@keydown.space="onHeaderDiePlayActivate($event, (getRating(traitSet)?.value?.[0] as number) || 8)"
					></span>
					<span
						v-else-if="
							traitSet.rating &&
							getRating(traitSet)?.type === 'Dice' &&
							ratingDice(getRating(traitSet)).length > 0 &&
							traitArrayMode === 'none'
						"
						class="trait-set-header-dice"
					>
						<span
							v-for="(dieSize, dIdx) in ratingDice(getRating(traitSet))"
							:key="'btm-hdr-d-' + dIdx"
							class="trait-set-header-rating diecon-wrapper"
							v-html="renderDieValue(dieSize, true)"
							:role="submode === 'play' ? 'button' : undefined"
							:tabindex="submode === 'play' ? 0 : undefined"
							:aria-label="submode === 'play' ? `Stage d${dieSize} ${traitSet.name}` : undefined"
							@click="onHeaderDiePlayActivate($event, dieSize)"
							@keydown.enter="onHeaderDiePlayActivate($event, dieSize)"
							@keydown.space="onHeaderDiePlayActivate($event, dieSize)"
						></span>
					</span>
					<div
						class="trait-set-header-counter"
						v-if="headerTop && traitSet.traits?.some((t) => hasTraitCounter(t)) && getCounterLabel(traitSet).length > 0"
					>
						{{ getCounterLabel(traitSet) }}
					</div>
				</div>
			</transition>
		</div>
	</section>
</template>
