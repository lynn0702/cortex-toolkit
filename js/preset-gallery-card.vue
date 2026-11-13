<script setup lang="ts">
defineProps<{
	preset: { id: string; label: string; blurb?: string };
	actionLabel: string;
	deletable?: boolean;
	deleteLabel?: string;
}>();

const emit = defineEmits<{
	(e: 'add'): void;
	(e: 'delete'): void;
}>();
</script>

<template>
	<div class="preset-gallery-card">
		<div class="preset-gallery-card-header">
			<div class="preset-gallery-name">{{ preset.label }}</div>
			<button
				v-if="deletable"
				type="button"
				class="btn-preset-delete"
				:title="deleteLabel || 'Delete saved preset'"
				:aria-label="deleteLabel || 'Delete saved preset'"
				@click.stop="emit('delete')"
			>
				<i class="fas fa-trash-alt" aria-hidden="true"></i>
			</button>
		</div>
		<div class="preset-gallery-blurb" v-if="preset.blurb">{{ preset.blurb }}</div>
		<button type="button" class="btn-preset-add" @click.stop="emit('add')">
			<i class="fas fa-plus" aria-hidden="true"></i> {{ actionLabel }}
		</button>
	</div>
</template>
