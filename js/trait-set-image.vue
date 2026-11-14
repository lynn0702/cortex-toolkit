<script setup lang="ts">
import { computed } from 'vue';
import { getView } from './model.ts';
import { injectTraitSet } from './use-trait-set.ts';
import TraitSetList from './trait-set-list.vue';

const { traitSet, s, submode, selectElement, getImageSetContainerStyle, getImageSetGraphicStyle } = injectTraitSet();

const effectiveUrl = computed(() => getView(traitSet.value)?.imageConfig?.url || '');

const effectiveAlignment = computed(() => getView(traitSet.value)?.imageConfig?.alignment || 'center');

const alignmentClass = computed(() => {
	const a = effectiveAlignment.value;
	return typeof a === 'string' && /^(top|center|bottom)(-(left|center|right))?$/.test(a)
		? `portrait-alignment-${a}`
		: undefined;
});

const effectiveCaption = computed(() => getView(traitSet.value)?.imageConfig?.caption ?? '');

const isCaptionShown = computed(() => Boolean(effectiveCaption.value));

const effectiveLayout = computed(() => getView(traitSet.value)?.imageConfig?.layout || 'overlay');

const hasActiveParts = computed(() => {
	const p = getView(traitSet.value)?.parts;
	return Boolean(p && typeof p === 'object' && !Array.isArray(p) && Object.keys(p).length > 0);
});

const showTraitLayer = computed(
	() =>
		Boolean(traitSet.value?.traits?.length) ||
		Number(getView(traitSet.value)?.reservedSlots) > 0 ||
		(hasActiveParts.value && submode.value === 'edit'),
);

function onSurfaceClick() {
	if (submode.value === 'edit') {
		selectElement(['traitSet', s.value]);
	}
}
</script>

<template>
	<div
		class="trait-image-body"
		v-if="getView(traitSet)?.style?.body === 'image'"
		:class="'image-layout-' + effectiveLayout"
	>
		<div v-if="effectiveLayout === 'below' && showTraitLayer" class="image-set-traits">
			<TraitSetList />
		</div>
		<div
			class="image-set-container"
			:class="{
				'has-image': Boolean(effectiveUrl),
				'has-overlay-traits': effectiveLayout === 'overlay' && showTraitLayer,
			}"
			:style="getImageSetContainerStyle(traitSet)"
		>
			<div
				class="image-set-surface"
				:role="submode === 'edit' ? 'button' : undefined"
				:tabindex="submode === 'edit' ? 0 : undefined"
				:aria-label="submode === 'edit' ? 'Edit image settings' : undefined"
				:title="submode === 'edit' ? 'Click to edit image settings' : undefined"
				@click.stop="onSurfaceClick"
				@keydown.enter.self.prevent="onSurfaceClick"
				@keydown.space.self.prevent="onSurfaceClick"
			>
				<div
					v-if="effectiveUrl"
					class="image-set-graphic"
					:class="alignmentClass"
					:style="getImageSetGraphicStyle(traitSet)"
				></div>
				<div v-else class="image-set-placeholder">
					<i class="fas fa-image" aria-hidden="true"></i>
					<span>Click to add illustration or image</span>
				</div>
			</div>
			<div v-if="effectiveLayout === 'overlay' && showTraitLayer" class="image-set-overlay-traits">
				<TraitSetList />
			</div>
			<div class="image-set-caption" v-if="isCaptionShown">
				{{ effectiveCaption }}
			</div>
		</div>
		<div v-if="effectiveLayout === 'above' && showTraitLayer" class="image-set-traits">
			<TraitSetList />
		</div>
	</div>
</template>
