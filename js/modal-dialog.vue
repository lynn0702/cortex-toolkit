<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref, watch } from 'vue';

const props = defineProps<{
	open: boolean;
	label: string;
	dialogClass?: string;
}>();

const emit = defineEmits<{
	(e: 'close'): void;
}>();

const dialogEl = ref<HTMLDialogElement | null>(null);

watch(
	() => props.open,
	async (open) => {
		await nextTick();
		const dialog = dialogEl.value;
		if (!dialog) return;
		if (open && !dialog.open) {
			dialog.showModal();
		} else if (!open && dialog.open) {
			dialog.close();
		}
	},
	{ immediate: true },
);

onBeforeUnmount(() => {
	if (dialogEl.value?.open) dialogEl.value.close();
});

function onCancel(event: Event) {
	event.preventDefault();
	emit('close');
}

function onBackdropClick(event: MouseEvent) {
	const dialog = dialogEl.value;
	if (!dialog || event.target !== dialog) return;
	const rect = dialog.getBoundingClientRect();
	const inside =
		event.clientX >= rect.left &&
		event.clientX <= rect.right &&
		event.clientY >= rect.top &&
		event.clientY <= rect.bottom;
	if (!inside) emit('close');
}
</script>

<template>
	<dialog
		ref="dialogEl"
		class="modal"
		:class="dialogClass"
		:aria-label="label"
		@cancel="onCancel"
		@click="onBackdropClick"
	>
		<slot />
	</dialog>
</template>
