<script setup lang="ts">
import { computed } from 'vue';
import { getView, ensureView, isNameSet, resolveVisibility } from './model.ts';
import { cortexFunctions } from './functions.ts';
import { injectTraitSet } from './use-trait-set.ts';

const {
	traitSet,
	character,
	s,
	submode,
	selectElement,
	updateCharacter,
	getImageSetContainerStyle,
	getImageSetGraphicStyle,
} = injectTraitSet();

const isName = computed(() => isNameSet(traitSet.value));

const effectiveUrl = computed(() => {
	const cfgUrl = getView(traitSet.value)?.imageConfig?.url;
	if (cfgUrl) return cfgUrl;
	if (isName.value) return character.value?.portrait?.url || '';
	return '';
});

const effectiveAlignment = computed(() => {
	return (
		getView(traitSet.value)?.imageConfig?.alignment ||
		(isName.value ? getView(character.value?.portrait)?.alignment : undefined) ||
		'center'
	);
});

const effectiveCaption = computed(() => {
	const cfgCap = getView(traitSet.value)?.imageConfig?.caption;
	if (cfgCap !== undefined) return cfgCap;
	if (isName.value) {
		const t = cortexFunctions.getNameTrait(character.value, 'caption');
		return typeof t?.label === 'string' ? t.label : '';
	}
	return '';
});

const isCaptionShown = computed(() => {
	if (!effectiveCaption.value) return false;
	if (!isName.value) return true;
	const t = cortexFunctions.getNameTrait(character.value, 'caption');
	if (!t) return true;
	const vis = resolveVisibility(t);
	if (vis === 'hidden') return false;
	if (vis === 'play-only') return submode.value !== 'print';
	if (vis === 'editor-only') return submode.value === 'edit';
	return true;
});

function clearImage() {
	const v = ensureView(traitSet.value);
	if (v.imageConfig) {
		v.imageConfig.url = '';
	}
	if (isName.value && character.value) {
		if (!character.value.portrait) character.value.portrait = {};
		character.value.portrait.url = '';
	}
	if (character.value) {
		updateCharacter(character.value);
	}
}
</script>

<template>
	<div
		class="trait-image-body"
		v-if="getView(traitSet)?.style?.body === 'image' || isName"
		@click.stop="selectElement(['traitSet', s])"
		title="Click to edit image settings"
	>
		<div
			class="image-set-container"
			:class="{ 'sheet-header-portrait-box': isName, 'has-image': Boolean(effectiveUrl) }"
			:style="getImageSetContainerStyle(traitSet)"
		>
			<div
				v-if="effectiveUrl"
				class="image-set-graphic"
				:class="'portrait-alignment-' + effectiveAlignment"
				:style="getImageSetGraphicStyle(traitSet)"
			></div>
			<div v-else-if="!isName" class="image-set-placeholder">
				<i class="fas fa-image"></i>
				<span>Click to add illustration or image</span>
			</div>
			<button
				v-if="isName && effectiveUrl && submode === 'edit'"
				type="button"
				class="btn-remove-header-portrait"
				@click.stop="clearImage"
				title="Remove image"
			>
				<i class="fas fa-trash-alt"></i>
			</button>
			<div class="image-set-caption" :class="{ 'sheet-portrait-caption': isName }" v-if="isCaptionShown">
				{{ effectiveCaption }}
			</div>
		</div>
	</div>
</template>
