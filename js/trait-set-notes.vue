<script setup lang="ts">
import { injectTraitSet } from './use-trait-set.ts';

const { traitSet, s, selectElement, renderNotesText } = injectTraitSet();
</script>

<template>
	<div class="trait-notes-body"
		v-if="traitSet?.custom?.cortexToolkit?.style?.body === 'notes'"
		@click.stop="selectElement([ 'traitSet', s ])"
	>
		<div class="notes-content" v-html="renderNotesText(traitSet?.custom?.cortexToolkit?.notes || traitSet?.description || 'Click to edit notes...')"></div>
	</div>
</template>
