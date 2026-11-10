<script setup lang="ts">
import { getView, isNameSet } from './model.ts';
import { cortexFunctions } from './functions.ts';
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
	getRating,
	getCounterLabel,
	isHiddenIn,
	resolvedFrame,
	isFrameActive,
	isFrameForcedOff,
	frameToggledOff,
	frameSvgPath,
	frameStrokeClass,
	frameStrokeStyle,
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

const setSfxEntries = computed(() => cortexFunctions.sfxChildren(traitSet.value));

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

const isRing = computed(() => {
	const shape = resolvedFrame.value?.shape;
	return shape === 'ring' || getView(traitSet.value)?.style?.body === 'portrait-ring';
});

const rootEl = ref<HTMLElement | null>(null);
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
		:data-set-index="s"
		:data-set-name="traitSet.name || undefined"
		:aria-label="traitSet.name || 'Trait Set'"
	>
		<!-- Block frame SVG enclosing entire trait set (header + body) -->
		<TraitSetFrame
			v-if="isFrameActive && resolvedFrame?.shape === 'block'"
			:trait-set="traitSet"
			:header-mode="headerTop ? 'top' : 'sidebar'"
			:has-header="Boolean(traitSet.name)"
		/>

		<!-- Block frame hero header image -->
		<div
			v-if="resolvedFrame?.shape === 'block' && resolvedFrame?.image?.url"
			class="frame-header-image"
			:class="'portrait-alignment-' + effectiveAlignment"
			:style="effectivePortraitStyle"
		>
			<img class="sr-only" :src="effectiveImageUrl" alt="" />
		</div>

		<div class="trait-set-header" v-if="!isName && traitSet.name">
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
					<div
						class="trait-set-header-counter"
						v-if="headerTop && traitSet.traits?.some((t: any) => getRating(t)?.type === 'Counter')"
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
						<i class="fas fa-times"></i>
					</button>
				</div>
			</transition>
		</div>

		<div class="trait-set-body" :class="{ 'trait-set-body-framed': isFrameActive }">
			<!-- Bare-path divider if line -->
			<TraitSetFrame v-if="resolvedFrame?.shape === 'line'" :trait-set="traitSet" />

			<!-- Radial frame SVG (ring, ellipse, arc, path) -->
			<TraitSetFrame
				v-if="
					isFrameActive &&
					(resolvedFrame?.shape === 'ring' ||
						resolvedFrame?.shape === 'ellipse' ||
						resolvedFrame?.shape === 'arc' ||
						(resolvedFrame?.shape as any) === 'path')
				"
				:trait-set="traitSet"
			/>

			<!-- Ring / Ellipse / Arc / portrait-ring body -->
			<div class="portrait" v-if="isRing">
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
						<img
							class="portrait-placeholder"
							v-if="!effectiveImageUrl"
							src="/images/cortex_prime_logo_light_transparent.png"
							alt="Portrait placeholder"
						/>
					</div>
				</div>
				<PortraitRing
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

			<component
				:is="bodyComponent"
				v-else-if="isName || !(resolvedFrame?.shape === 'line' && (!traitSet.traits || !traitSet.traits.length))"
			/>

			<div class="ring-actions" v-if="isRing && submode === 'edit'">
				<div class="preview-button-container">
					<div class="preview-button-container-inner">
						<div class="preview-button" @click.stop="addTrait(s)">
							<span><i class="fas fa-plus"></i> {{ traitSet?.noun || 'Trait' }}</span>
						</div>
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
	</section>
</template>
