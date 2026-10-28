<script setup lang="ts">
import { computed } from 'vue';
import type { VisibilityState } from './model.ts';
// Four-state visibility cycle: shown (eye) -> play-only (gamepad) ->
// editor-only (pencil) -> hidden (slashed eye). Clicking cycles. Data is always retained.
const props = withDefaults( defineProps<{
	state?: VisibilityState;
	visible?: boolean;
	title?: string;
}>(), {
	state: undefined,
	visible: true,
	title: '',
} );

const emit = defineEmits<{
	( e: 'toggle' ): void;
}>();

const resolved = computed<VisibilityState>( () => {
	if ( props.state === 'hidden' || props.state === 'editor-only' || props.state === 'play-only' || props.state === 'shown' ) return props.state;
	return props.visible ? 'shown' : 'hidden';
} );

const icon = computed( () => {
	if ( resolved.value === 'hidden' ) return 'fas fa-eye-slash';
	if ( resolved.value === 'editor-only' ) return 'fas fa-pencil';
	if ( resolved.value === 'play-only' ) return 'fas fa-gamepad';
	return 'fas fa-eye';
} );

const hint = computed( () => {
	if ( props.title ) return props.title;
	if ( resolved.value === 'hidden' ) return 'Hidden — click to show';
	if ( resolved.value === 'editor-only' ) return 'Edit only — click to hide';
	if ( resolved.value === 'play-only' ) return 'Play & Edit only (hidden on Print)';
	return 'Shown — click for play & edit only';
} );
</script>

<template>
	<button
		type="button"
		class="visibility-eye"
		:class="{ off: resolved === 'hidden', half: resolved === 'editor-only', 'play-only': resolved === 'play-only' }"
		@click.stop="emit('toggle')"
		:title="hint"
		:aria-label="hint"
		:aria-pressed="resolved === 'shown'"
	>
		<i :class="icon"></i>
	</button>
</template>
