<script setup lang="ts">
import { ensureView, getView, isNameSet } from './model.ts';
import { characterCurioFunctions } from './functions.ts';
import { computed, ref, onMounted, watch } from 'vue';
import { useTraitSet } from './use-trait-set.ts';
import TraitSetImage from './trait-set-image.vue';
import TraitSetPips from './trait-set-pips.vue';
import TraitSetSubtraitColumns from './trait-set-subtrait-columns.vue';
import TraitSetDieRows from './trait-set-die-rows.vue';
import TraitSetDiceCount from './trait-set-dice-count.vue';
import TraitSetList from './trait-set-list.vue';
import TraitSetFrame from './trait-set-frame.vue';
import TraitSetName from './trait-set-name.vue';
import PortraitRing from './portrait-ring.vue';

const props = defineProps<{
	character: any;
	traitSetID?: number;
	submode?: string | null;
	editing?: any;
	viewY?: number | null;
	printBlank?: boolean;
}>();

const emit = defineEmits<{
	(e: 'selectElement', selector: any[]): void;
	(e: 'updateCharacter', character: any): void;
	(e: 'removeTrait', traitSetID: number, traitID: number): void;
	(e: 'removeTraitSet', traitSetID: number): void;
	(e: 'addTrait', traitSetID: number): void;
	(e: 'addDieToRoller', die: any): void;
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
	resolveTraitRating,
	getRating,
	renderDieValue,
	getCounterLabel,
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
} = ts;

const isName = computed(() => isNameSet(traitSet.value));

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
	() => !isName.value && Boolean(traitSet.value?.name) && getView(traitSet.value)?.header !== 'none',
);

const showRingActions = computed(() => {
	if (!hasTraitArray.value || submode.value !== 'edit') return false;
	if (!shouldRenderBodyComponent.value) return true;
	const v = getView(traitSet.value);
	if (v?.ringNoun) return true;
	return Boolean(traitSet.value?.traits?.some((t: any) => Boolean(getView(t)?.ring)));
});

const setSfxEntries = computed(() => characterCurioFunctions.sfxChildren(traitSet.value));

const BODY_COMPONENTS: Record<string, any> = {
	name: TraitSetName,
	image: TraitSetImage,
	pips: TraitSetPips,
	'subtrait-columns': TraitSetSubtraitColumns,
	'die-rows': TraitSetDieRows,
	'dice-count': TraitSetDiceCount,
};

const bodyComponent = computed(() => {
	const style = getView(traitSet.value)?.style?.body;
	return (style && BODY_COMPONENTS[style]) || TraitSetList;
});

const hasTraitArray = computed(() => traitArrayMode.value !== 'none');

const shouldRenderBodyComponent = computed(() => {
	if (isName.value) return true;
	if (
		resolvedBorder.value.shape === 'line' &&
		!showPortraitHub.value &&
		(!traitSet.value?.traits || !traitSet.value.traits.length)
	) {
		return false;
	}
	if (hasTraitArray.value) {
		const all = traitSet.value?.traits || [];
		const hasExplicitRingTraits = all.some((t: any) => Boolean(getView(t)?.ring));
		if (!hasExplicitRingTraits) return false;
		return all.some((t: any) => !getView(t)?.ring && t.name?.trim().toLowerCase() !== 'scale');
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
			const f = typeof v.frame === 'object' && v.frame !== null ? (v.frame as any) : {};
			v.frame = {
				shape: f.shape && f.shape !== 'block' && f.shape !== 'line' ? f.shape : 'circle',
				...f,
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
			v-if="resolvedBorder.shape === 'block' && resolvedBorder.explicit"
			mode="border"
			:trait-set="traitSet"
			:header-mode="headerMode"
			:has-header="hasHeader"
		/>

		<div class="trait-set-header" v-if="hasHeader && headerMode !== 'bottom'">
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
						role="button"
						tabindex="0"
						:aria-label="`Stage d${(getRating(traitSet)?.value?.[0] as number) || 8} ${traitSet.name}`"
						@click.stop="
							submode === 'play'
								? emit('addDieToRoller', {
										size: (getRating(traitSet)?.value?.[0] as number) || 8,
										qty: 1,
										source: traitSet.name,
									})
								: null
						"
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
							role="button"
							tabindex="0"
							:aria-label="`Stage d${dieSize} ${traitSet.name}`"
							@click.stop="
								submode === 'play'
									? emit('addDieToRoller', {
											size: dieSize,
											qty: 1,
											source: traitSet.name,
										})
									: null
							"
						></span>
					</span>
					<div
						class="trait-set-header-counter"
						v-if="headerTop && traitSet.traits?.some((t: any) => resolveTraitRating(t)?.type === 'Counter')"
					>
						{{ getCounterLabel(traitSet) }}
					</div>
					<button
						v-if="submode === 'play' && canRemoveSetInPlay"
						type="button"
						class="trait-set-play-remove-btn"
						title="Remove card from session"
						aria-label="Remove card from session"
						@click.stop="removeTraitSet(s)"
					>
						<i class="fas fa-times" aria-hidden="true"></i>
					</button>
				</div>
			</transition>
		</div>

		<div
			class="trait-set-body"
			:class="{ 'trait-set-body-framed': resolvedBorder.explicit || hasTraitArray || portraitFrameShape !== 'none' }"
		>
			<!-- Section line border divider -->
			<TraitSetFrame v-if="resolvedBorder.shape === 'line'" mode="border" :trait-set="traitSet" />

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
						role="button"
						tabindex="0"
						:aria-label="`Stage d${(getRating(traitSet)?.value?.[0] as number) || 8} ${traitSet.name}`"
						@click.stop="
							submode === 'play'
								? emit('addDieToRoller', {
										size: (getRating(traitSet)?.value?.[0] as number) || 8,
										qty: 1,
										source: traitSet.name,
									})
								: null
						"
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
							role="button"
							tabindex="0"
							:aria-label="`Stage d${dieSize} ${traitSet.name}`"
							@click.stop="
								submode === 'play'
									? emit('addDieToRoller', {
											size: dieSize,
											qty: 1,
											source: traitSet.name,
										})
									: null
							"
						></span>
					</span>
					<div
						class="trait-set-header-counter"
						v-if="headerTop && traitSet.traits?.some((t: any) => resolveTraitRating(t)?.type === 'Counter')"
					>
						{{ getCounterLabel(traitSet) }}
					</div>
					<button
						v-if="submode === 'play' && canRemoveSetInPlay"
						type="button"
						class="trait-set-play-remove-btn"
						title="Remove card from session"
						aria-label="Remove card from session"
						@click.stop="removeTraitSet(s)"
					>
						<i class="fas fa-times" aria-hidden="true"></i>
					</button>
				</div>
			</transition>
		</div>
	</section>
</template>
