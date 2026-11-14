<script setup lang="ts">
import { computed } from 'vue';
import { getView } from './model.ts';
import { injectTraitSet } from './use-trait-set.ts';

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
</script>

<template>
	<div
		class="trait-image-body"
		v-if="getView(traitSet)?.style?.body === 'image'"
		:role="submode === 'edit' ? 'button' : undefined"
		:tabindex="submode === 'edit' ? 0 : undefined"
		:aria-label="submode === 'edit' ? 'Edit image settings' : undefined"
		@click.stop="selectElement(['traitSet', s])"
		@keydown.enter.self.prevent="submode === 'edit' && selectElement(['traitSet', s])"
		@keydown.space.self.prevent="submode === 'edit' && selectElement(['traitSet', s])"
		title="Click to edit image settings"
	>
		<div
			class="image-set-container"
			:class="{ 'has-image': Boolean(effectiveUrl) }"
			:style="getImageSetContainerStyle(traitSet)"
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
			<div class="image-set-caption" v-if="isCaptionShown">
				{{ effectiveCaption }}
			</div>
		</div>
	</div>
</template>
