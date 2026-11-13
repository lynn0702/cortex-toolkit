<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import {
	CURIO_PALETTE,
	expandHex6,
	isHexColor,
	isLightHex,
	type ColorSwatch,
	type ColorTokenOption,
} from './color-palette.ts';

const props = withDefaults(
	defineProps<{
		modelValue: string;
		inputId: string;
		label?: string;
		tokens?: ColorTokenOption[];
		swatches?: ColorSwatch[];
		showSwatches?: boolean;
		allowCustom?: boolean;
		allowClear?: boolean;
		clearLabel?: string;
		fallbackHex?: string;
		compact?: boolean;
	}>(),
	{
		label: 'Color',
		swatches: () => CURIO_PALETTE,
		showSwatches: true,
		allowCustom: true,
		allowClear: false,
		clearLabel: 'Reset',
		fallbackHex: '#e11d48',
		compact: false,
	},
);

const emit = defineEmits<{
	(e: 'update:modelValue', value: string): void;
	(e: 'clear'): void;
}>();

const hexDraft = ref('');
const hexFocused = ref(false);

watch(
	() => props.modelValue,
	(val) => {
		if (!hexFocused.value) {
			hexDraft.value = isHexColor(val) ? val.trim() : '';
		}
	},
	{ immediate: true },
);

const resolvedPickerHex = computed(() => {
	if (isHexColor(props.modelValue)) {
		return expandHex6(props.modelValue, props.fallbackHex);
	}
	const tok = props.tokens?.find((t) => t.id === props.modelValue);
	if (tok && isHexColor(tok.previewColor)) {
		return expandHex6(tok.previewColor, props.fallbackHex);
	}
	return expandHex6(props.fallbackHex);
});

const hexInputValue = computed(() => {
	if (hexFocused.value) return hexDraft.value;
	return isHexColor(props.modelValue) ? props.modelValue.trim() : '';
});

function isSwatchActive(hex: string): boolean {
	if (!isHexColor(props.modelValue)) return false;
	return expandHex6(props.modelValue) === expandHex6(hex);
}

function selectToken(id: string) {
	emit('update:modelValue', id);
}

function selectSwatch(hex: string) {
	emit('update:modelValue', hex);
}

function onPickerInput(event: Event) {
	const val = (event.target as HTMLInputElement).value;
	if (isHexColor(val)) {
		hexDraft.value = val;
		emit('update:modelValue', val.toLowerCase());
	}
}

function onHexFocus() {
	hexFocused.value = true;
	hexDraft.value = isHexColor(props.modelValue) ? props.modelValue.trim() : '';
}

function onHexInput(event: Event) {
	const raw = (event.target as HTMLInputElement).value;
	hexDraft.value = raw;
	const trimmed = raw.trim();
	if (/^#[0-9a-fA-F]{6}$/.test(trimmed)) {
		emit('update:modelValue', trimmed.toLowerCase());
	}
}

function onHexCommit(event: Event) {
	hexFocused.value = false;
	const trimmed = (event.target as HTMLInputElement).value.trim();
	if (!trimmed) {
		if (props.allowClear) emit('clear');
		hexDraft.value = '';
		return;
	}
	if (isHexColor(trimmed)) {
		const normalized = trimmed.length === 9 ? trimmed.toLowerCase() : expandHex6(trimmed, props.fallbackHex);
		hexDraft.value = normalized;
		emit('update:modelValue', normalized);
		return;
	}
	hexDraft.value = isHexColor(props.modelValue) ? props.modelValue.trim() : '';
}
</script>

<template>
	<div class="color-picker" :class="{ 'color-picker-compact': compact }">
		<div v-if="tokens && tokens.length" class="color-token-chips" role="group" :aria-label="label + ' presets'">
			<button
				v-for="tok in tokens"
				:key="tok.id"
				type="button"
				class="color-token-chip"
				:class="{ active: modelValue === tok.id }"
				:aria-pressed="modelValue === tok.id"
				@click.stop="selectToken(tok.id)"
			>
				<span class="color-swatch-dot" :style="{ '--swatch-color': tok.previewColor }"></span>
				<span class="color-token-label">{{ tok.label }}</span>
				<i v-if="modelValue === tok.id" class="fas fa-check color-token-check" aria-hidden="true"></i>
			</button>
		</div>

		<div v-if="showSwatches && swatches.length" class="color-swatch-grid" role="group" :aria-label="label + ' palette'">
			<button
				v-for="s in swatches"
				:key="s.hex"
				type="button"
				class="color-swatch-chip"
				:class="{ active: isSwatchActive(s.hex), 'is-light': isLightHex(s.hex) }"
				:style="{ '--swatch-color': s.hex }"
				:title="s.name + ' (' + s.hex + ')'"
				:aria-label="s.name + ' (' + s.hex + ')'"
				:aria-pressed="isSwatchActive(s.hex)"
				@click.stop="selectSwatch(s.hex)"
			>
				<i v-if="isSwatchActive(s.hex)" class="fas fa-check" aria-hidden="true"></i>
			</button>
		</div>

		<div v-if="allowCustom" class="color-custom-row">
			<input
				type="color"
				:id="inputId + '-picker'"
				:name="inputId + 'Picker'"
				:aria-label="label + ' spectrum picker'"
				:value="resolvedPickerHex"
				@input="onPickerInput"
				class="editor-color-swatch-input"
			/>
			<input
				type="text"
				:id="inputId + '-hex'"
				:name="inputId + 'Hex'"
				:aria-label="label + ' hex value'"
				:value="hexInputValue"
				pattern="^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$"
				:placeholder="resolvedPickerHex"
				spellcheck="false"
				autocomplete="off"
				@focus="onHexFocus"
				@input="onHexInput"
				@change="onHexCommit"
				class="editor-hex-input"
			/>
			<button
				v-if="allowClear"
				type="button"
				class="editor-tab-btn editor-border-subtle color-clear-btn"
				:disabled="!modelValue"
				@click.stop="emit('clear')"
			>
				{{ clearLabel }}
			</button>
		</div>
	</div>
</template>
