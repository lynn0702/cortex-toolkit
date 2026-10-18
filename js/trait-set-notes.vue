<script setup lang="ts">
import { getView } from './model.ts';
import { injectTraitSet } from './use-trait-set.ts';

const { traitSet, s, selectElement, renderNotesText } = injectTraitSet();
</script>

<template>
	<div class="trait-notes-body"
		v-if="getView(traitSet)?.style?.body === 'notes'"
		@click.stop="selectElement([ 'traitSet', s ])"
	>
		<div class="notes-content" v-html="renderNotesText(getView(traitSet)?.notes || traitSet?.description || 'Click to edit notes...')"></div>
	</div>
</template>
