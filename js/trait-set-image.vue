<script setup lang="ts">
import { getView } from './model.ts';
import { injectTraitSet } from './use-trait-set.ts';

const { traitSet, s, selectElement, getImageSetContainerStyle, getImageSetGraphicStyle } = injectTraitSet();
</script>

<template>
	<div class="trait-image-body"
		v-if="getView(traitSet)?.style?.body === 'image'"
		@click.stop="selectElement([ 'traitSet', s ])"
		title="Click to edit image settings"
	>
		<div class="image-set-container" :style="getImageSetContainerStyle(traitSet)">
			<div
				v-if="getView(traitSet)?.imageConfig?.url"
				class="image-set-graphic"
				:class="'portrait-alignment-' + (getView(traitSet)?.imageConfig?.alignment || 'center')"
				:style="getImageSetGraphicStyle(traitSet)"
			></div>
			<div v-else class="image-set-placeholder">
				<i class="fas fa-image"></i>
				<span>Click to add illustration or image</span>
			</div>
			<div class="image-set-caption" v-if="getView(traitSet)?.imageConfig?.caption">
				{{ getView(traitSet)?.imageConfig?.caption || '' }}
			</div>
		</div>
	</div>
</template>
