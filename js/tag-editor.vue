<script setup lang="ts">
import { computed, ref } from 'vue';

const TAG_PATTERN = /^[A-Za-z0-9-./]+$/;

const props = withDefaults(
	defineProps<{
		modelValue?: string[];
		inputId: string;
		label?: string;
		placeholder?: string;
	}>(),
	{
		modelValue: () => [],
		label: 'Tags',
		placeholder: 'Add tag',
	},
);

const emit = defineEmits<{
	(e: 'update:modelValue', value: string[]): void;
}>();

const draft = ref('');
const errorMsg = ref('');

const tags = computed(() => (Array.isArray(props.modelValue) ? props.modelValue : []));

function normalizeTagInput(raw: string): string {
	return raw.trim().replace(/^#+/, '').replace(/,+$/, '').trim();
}

function addTag(raw?: string) {
	const candidate = normalizeTagInput(raw ?? draft.value);
	if (!candidate) {
		errorMsg.value = '';
		return;
	}
	if (!TAG_PATTERN.test(candidate)) {
		errorMsg.value = 'Letters, numbers, -, ., / only';
		return;
	}
	errorMsg.value = '';
	const exists = tags.value.some((t) => t.toLowerCase() === candidate.toLowerCase());
	if (!exists) {
		emit('update:modelValue', [...tags.value, candidate]);
	}
	draft.value = '';
}

function removeTag(index: number) {
	const next = tags.value.filter((_, i) => i !== index);
	emit('update:modelValue', next);
	errorMsg.value = '';
}

function onKeydown(event: KeyboardEvent) {
	if (event.key === 'Enter' || event.key === ',') {
		event.preventDefault();
		addTag();
	} else if (event.key === 'Backspace' && draft.value.length === 0 && tags.value.length > 0) {
		removeTag(tags.value.length - 1);
	}
}

function onInput() {
	if (errorMsg.value) errorMsg.value = '';
}
</script>

<template>
	<div class="tag-editor">
		<label :for="inputId">
			<i class="fas fa-tags" aria-hidden="true"></i>
			<span>{{ label }}</span>
		</label>
		<ul class="tag-chip-list" v-if="tags.length > 0">
			<li class="tag-chip" v-for="(tag, idx) in tags" :key="tag + '-' + idx">
				<span>{{ tag }}</span>
				<button type="button" class="tag-chip-remove" :aria-label="'Remove tag ' + tag" @click.stop="removeTag(idx)">
					<i class="fas fa-times" aria-hidden="true"></i>
				</button>
			</li>
		</ul>
		<div class="tag-editor-input-row">
			<input
				type="text"
				:id="inputId"
				name="tagInput"
				v-model="draft"
				:placeholder="placeholder"
				:aria-invalid="errorMsg.length > 0 ? 'true' : undefined"
				@keydown="onKeydown"
				@input="onInput"
			/>
			<button type="button" class="editor-button tag-add-btn" @click.stop="addTag()">
				<span><i class="fas fa-tag" aria-hidden="true"></i> Add</span>
			</button>
		</div>
		<div class="tag-editor-error" role="alert" v-if="errorMsg">{{ errorMsg }}</div>
	</div>
</template>
