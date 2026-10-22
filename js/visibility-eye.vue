<script setup lang="ts">
// Two-state visibility eye: open = shown on the sheet, slashed = hidden
// (data retained). There is no third state.
const props = withDefaults( defineProps<{
	visible: boolean;
	title?: string;
}>(), {
	title: '',
} );

const emit = defineEmits<{
	( e: 'toggle' ): void;
}>();
</script>

<template>
	<button
		type="button"
		class="visibility-eye"
		:class="{ off: !props.visible }"
		@click.stop="emit('toggle')"
		:title="props.title || (props.visible ? 'Shown — click to hide' : 'Hidden — click to show')"
		:aria-label="props.visible ? 'Shown — click to hide' : 'Hidden — click to show'"
		:aria-pressed="props.visible"
	>
		<i :class="props.visible ? 'fas fa-eye' : 'fas fa-eye-slash'"></i>
	</button>
</template>
