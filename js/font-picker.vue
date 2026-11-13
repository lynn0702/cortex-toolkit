<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue';
import { characterCurioFunctions } from './functions.ts';
import { inferFontFamilyFromUrl, parseExternalFontUrl } from './font-url.ts';

interface FontOption {
	family: string;
	tag: string;
	isCustomOption: boolean;
	externalUrl?: string;
}

const BUNDLED_SHEET_FONTS = ['Josefin Sans', 'Open Sans', 'Alegreya Sans SC'] as const;

const CURATED_GOOGLE_FONTS: ReadonlyArray<{ family: string; category: 'Sans' | 'Serif' | 'Slab' | 'Display' }> = [
	{ family: 'Cinzel', category: 'Display' },
	{ family: 'Cormorant Garamond', category: 'Serif' },
	{ family: 'Crimson Pro', category: 'Serif' },
	{ family: 'EB Garamond', category: 'Serif' },
	{ family: 'Exo 2', category: 'Sans' },
	{ family: 'Fira Sans', category: 'Sans' },
	{ family: 'Fraunces', category: 'Serif' },
	{ family: 'IM Fell English', category: 'Serif' },
	{ family: 'Inter', category: 'Sans' },
	{ family: 'Lato', category: 'Sans' },
	{ family: 'Libre Baskerville', category: 'Serif' },
	{ family: 'Lora', category: 'Serif' },
	{ family: 'Marcellus', category: 'Serif' },
	{ family: 'Merriweather', category: 'Serif' },
	{ family: 'Montserrat', category: 'Sans' },
	{ family: 'Oswald', category: 'Display' },
	{ family: 'Playfair Display', category: 'Serif' },
	{ family: 'Plus Jakarta Sans', category: 'Sans' },
	{ family: 'Rajdhani', category: 'Sans' },
	{ family: 'Raleway', category: 'Sans' },
	{ family: 'Roboto', category: 'Sans' },
	{ family: 'Roboto Condensed', category: 'Sans' },
	{ family: 'Roboto Slab', category: 'Slab' },
	{ family: 'Source Sans 3', category: 'Sans' },
	{ family: 'Source Serif 4', category: 'Serif' },
	{ family: 'Space Grotesk', category: 'Sans' },
	{ family: 'Spectral', category: 'Serif' },
	{ family: 'Teko', category: 'Display' },
	{ family: 'Work Sans', category: 'Sans' },
];

function ensureCatalogFontsLoaded() {
	if (typeof document === 'undefined') return;
	const id = 'gfont-curio-catalog';
	if (document.getElementById(id)) return;
	const params = CURATED_GOOGLE_FONTS.map((f) => `family=${encodeURIComponent(f.family)}:wght@400;700`).join('&');
	const link = document.createElement('link');
	link.id = id;
	link.rel = 'stylesheet';
	link.href = `https://fonts.googleapis.com/css2?${params}&display=swap`;
	document.head.appendChild(link);
}

const props = withDefaults(
	defineProps<{
		modelValue: string;
		defaultFont: string;
		inputId: string;
		name: string;
		label: string;
		customFonts?: string[];
		describedBy?: string;
	}>(),
	{
		customFonts: () => [],
		describedBy: '',
	},
);

const emit = defineEmits<{
	(e: 'update:modelValue', family: string): void;
	(e: 'reset'): void;
	(e: 'addExternalFont', payload: { name: string; url: string }): void;
	(e: 'prefillExternalUrl', url: string): void;
}>();

const rootRef = ref<HTMLElement | null>(null);
const inputRef = ref<HTMLInputElement | null>(null);
const listboxRef = ref<HTMLUListElement | null>(null);

const isOpen = ref(false);
const isEditing = ref(false);
const draftQuery = ref(props.modelValue || props.defaultFont);
const hasTypedFilter = ref(false);
const activeIndex = ref(-1);

watch(
	() => props.modelValue,
	(val) => {
		if (!isEditing.value) {
			draftQuery.value = val || props.defaultFont;
		}
	},
);

const listboxId = computed(() => `${props.inputId}-listbox`);
const effectiveModelValue = computed(() => (props.modelValue || props.defaultFont).trim() || props.defaultFont);
const isDefaultSelected = computed(
	() => effectiveModelValue.value.toLowerCase() === props.defaultFont.trim().toLowerCase(),
);

const allOptions = computed<FontOption[]>(() => {
	const seen = new Set<string>();
	const options: FontOption[] = [];

	const addOption = (family: string, tag: string) => {
		const trimmed = (family || '').trim();
		if (!trimmed) return;
		const key = trimmed.toLowerCase();
		if (seen.has(key)) return;
		seen.add(key);
		options.push({ family: trimmed, tag, isCustomOption: false });
	};

	for (const cf of props.customFonts || []) {
		addOption(cf, 'URL');
	}

	for (const bf of BUNDLED_SHEET_FONTS) {
		const tag = bf.toLowerCase() === props.defaultFont.trim().toLowerCase() ? 'Default' : 'Bundled';
		addOption(bf, tag);
	}

	const curatedKeys = new Set(CURATED_GOOGLE_FONTS.map((f) => f.family.toLowerCase()));
	if (
		effectiveModelValue.value &&
		!seen.has(effectiveModelValue.value.toLowerCase()) &&
		!curatedKeys.has(effectiveModelValue.value.toLowerCase())
	) {
		addOption(effectiveModelValue.value, 'Google');
	}

	for (const gf of CURATED_GOOGLE_FONTS) {
		addOption(gf.family, gf.category);
	}

	return options;
});

function isUrlLike(text: string): boolean {
	return /^(?:https?|data|javascript|blob|file):/i.test(text.trim());
}

const filteredOptions = computed<FontOption[]>(() => {
	if (!hasTypedFilter.value) {
		return allOptions.value;
	}
	const raw = draftQuery.value.trim();
	const q = raw.toLowerCase();
	if (!q) {
		return allOptions.value;
	}

	const parsedUrl = parseExternalFontUrl(raw);
	if (parsedUrl) {
		const inferred = inferFontFamilyFromUrl(parsedUrl.url);
		if (inferred) {
			return [
				{
					family: inferred,
					tag: `${parsedUrl.host} · ${parsedUrl.shortFormat}`,
					isCustomOption: true,
					externalUrl: parsedUrl.url,
				},
			];
		}
		return [
			{
				family: parsedUrl.host,
				tag: 'Set family below',
				isCustomOption: true,
				externalUrl: parsedUrl.url,
			},
		];
	}

	if (isUrlLike(raw)) {
		return [];
	}

	const matches = allOptions.value.filter(
		(opt) => opt.family.toLowerCase().includes(q) || opt.tag.toLowerCase().includes(q),
	);
	const exactMatch = allOptions.value.some((opt) => opt.family.toLowerCase() === q);
	if (!exactMatch) {
		matches.push({
			family: raw,
			tag: 'Google Font',
			isCustomOption: true,
		});
	}
	return matches;
});

const activeOptionId = computed(() => {
	if (!isOpen.value || activeIndex.value < 0 || activeIndex.value >= filteredOptions.value.length) {
		return '';
	}
	return `${props.inputId}-opt-${activeIndex.value}`;
});

const displayValue = computed(() => (isEditing.value ? draftQuery.value : effectiveModelValue.value));

const activePreviewFamily = computed(() => {
	if (isOpen.value && activeIndex.value >= 0 && activeIndex.value < filteredOptions.value.length) {
		const opt = filteredOptions.value[activeIndex.value];
		if (opt && !opt.isCustomOption) {
			return opt.family;
		}
	}
	if (isEditing.value) {
		const q = draftQuery.value.trim().toLowerCase();
		if (q) {
			const match = allOptions.value.find((opt) => opt.family.toLowerCase() === q);
			if (match) return match.family;
		}
		return effectiveModelValue.value;
	}
	return effectiveModelValue.value;
});

const activePreviewFontStack = computed(
	() => `'${activePreviewFamily.value.replace(/'/g, '')}', 'Open Sans', sans-serif`,
);

function optionFontStack(opt: FontOption): string {
	if (opt.isCustomOption) {
		return `'Open Sans', sans-serif`;
	}
	return `'${opt.family.replace(/'/g, '')}', 'Open Sans', sans-serif`;
}

function isSelected(family: string): boolean {
	return effectiveModelValue.value.toLowerCase() === family.trim().toLowerCase();
}

function scrollActiveOptionIntoView() {
	nextTick(() => {
		if (!listboxRef.value || activeIndex.value < 0) return;
		const el = listboxRef.value.children.item(activeIndex.value) as HTMLElement | null;
		el?.scrollIntoView?.({ block: 'nearest' });
	});
}

function openDropdown() {
	const wasOpen = isOpen.value;
	isOpen.value = true;
	ensureCatalogFontsLoaded();
	if (!wasOpen) {
		const selectedIdx = filteredOptions.value.findIndex((opt) => !opt.isCustomOption && isSelected(opt.family));
		activeIndex.value = selectedIdx >= 0 ? selectedIdx : filteredOptions.value.length > 0 ? 0 : -1;
	} else if (activeIndex.value >= filteredOptions.value.length) {
		activeIndex.value = filteredOptions.value.length > 0 ? 0 : -1;
	}
	scrollActiveOptionIntoView();
}

function closeDropdown() {
	isOpen.value = false;
	activeIndex.value = -1;
	hasTypedFilter.value = false;
}

function selectOption(opt: FontOption) {
	if (opt.externalUrl) {
		const inferred = inferFontFamilyFromUrl(opt.externalUrl);
		if (inferred) {
			draftQuery.value = inferred;
			isEditing.value = false;
			closeDropdown();
			emit('addExternalFont', { name: inferred, url: opt.externalUrl });
			emit('update:modelValue', inferred);
		} else {
			draftQuery.value = effectiveModelValue.value;
			isEditing.value = false;
			closeDropdown();
			emit('prefillExternalUrl', opt.externalUrl);
		}
		return;
	}
	selectFamily(opt.family);
}

function commitDraftText(raw: string) {
	const trimmed = (raw || '').trim();
	if (!trimmed) {
		resetToDefault();
		return;
	}
	const parsedUrl = parseExternalFontUrl(trimmed);
	if (parsedUrl) {
		selectOption({
			family: trimmed,
			tag: parsedUrl.host,
			isCustomOption: true,
			externalUrl: parsedUrl.url,
		});
		return;
	}
	if (isUrlLike(trimmed)) {
		draftQuery.value = effectiveModelValue.value;
		isEditing.value = false;
		closeDropdown();
		return;
	}
	selectFamily(trimmed);
}

function selectFamily(family: string) {
	const trimmed = (family || '').trim();
	if (!trimmed) {
		resetToDefault();
		return;
	}
	draftQuery.value = trimmed;
	isEditing.value = false;
	closeDropdown();

	const isUploadedCustom = (props.customFonts || []).some((cf) => cf.trim().toLowerCase() === trimmed.toLowerCase());
	if (!isUploadedCustom && typeof characterCurioFunctions !== 'undefined' && characterCurioFunctions.loadGoogleFont) {
		characterCurioFunctions.loadGoogleFont(trimmed);
	}
	emit('update:modelValue', trimmed);
}

function clearDraft() {
	isEditing.value = true;
	draftQuery.value = '';
	hasTypedFilter.value = true;
	if (!isOpen.value) {
		openDropdown();
	}
	activeIndex.value = filteredOptions.value.length > 0 ? 0 : -1;
	inputRef.value?.focus();
}

function resetToDefault() {
	isEditing.value = false;
	draftQuery.value = props.defaultFont;
	closeDropdown();
	emit('reset');
}

function toggleDropdown() {
	if (isOpen.value) {
		isEditing.value = false;
		draftQuery.value = effectiveModelValue.value;
		closeDropdown();
		return;
	}
	inputRef.value?.focus();
	if (!isOpen.value) {
		onInputFocus();
	}
}

function onInputFocus() {
	if (!isEditing.value) {
		isEditing.value = true;
		draftQuery.value = effectiveModelValue.value;
		hasTypedFilter.value = false;
	}
	openDropdown();
}

function onInput(e: Event) {
	isEditing.value = true;
	draftQuery.value = (e.target as HTMLInputElement).value;
	hasTypedFilter.value = true;
	if (!isOpen.value) {
		openDropdown();
	}
	activeIndex.value = filteredOptions.value.length > 0 ? 0 : -1;
}

function onKeydown(e: KeyboardEvent) {
	if (e.isComposing) return;

	if (e.key === 'ArrowDown') {
		e.preventDefault();
		if (!isOpen.value) {
			openDropdown();
			return;
		}
		const len = filteredOptions.value.length;
		if (len > 0) {
			activeIndex.value = activeIndex.value < 0 ? 0 : (activeIndex.value + 1) % len;
			scrollActiveOptionIntoView();
		}
		return;
	}

	if (e.key === 'ArrowUp') {
		e.preventDefault();
		if (!isOpen.value) {
			openDropdown();
			return;
		}
		const len = filteredOptions.value.length;
		if (len > 0) {
			activeIndex.value = activeIndex.value < 0 ? len - 1 : (activeIndex.value - 1 + len) % len;
			scrollActiveOptionIntoView();
		}
		return;
	}

	if (e.key === 'Enter') {
		e.preventDefault();
		if (isOpen.value && activeIndex.value >= 0 && activeIndex.value < filteredOptions.value.length) {
			selectOption(filteredOptions.value[activeIndex.value]);
			return;
		}
		commitDraftText(draftQuery.value);
		return;
	}

	if (e.key === 'Escape') {
		if (isOpen.value || isEditing.value) {
			e.preventDefault();
			e.stopPropagation();
			isEditing.value = false;
			draftQuery.value = effectiveModelValue.value;
			closeDropdown();
		}
	}
}

function onFocusOut(e: FocusEvent) {
	const next = e.relatedTarget as Node | null;
	if (next && rootRef.value?.contains(next)) return;

	if (isEditing.value) {
		const trimmed = draftQuery.value.trim();
		if (!trimmed) {
			resetToDefault();
		} else if (trimmed !== effectiveModelValue.value) {
			commitDraftText(trimmed);
		} else {
			isEditing.value = false;
			closeDropdown();
		}
	} else {
		closeDropdown();
	}
}
</script>

<template>
	<div ref="rootRef" class="font-picker" @focusout="onFocusOut">
		<div class="font-picker-control" :class="{ 'is-open': isOpen }">
			<span class="font-picker-ag" aria-hidden="true" :style="{ fontFamily: activePreviewFontStack }">Ag</span>
			<input
				ref="inputRef"
				type="text"
				class="font-picker-input"
				:id="inputId"
				:name="name"
				role="combobox"
				aria-autocomplete="list"
				:aria-expanded="isOpen ? 'true' : 'false'"
				:aria-controls="listboxId"
				:aria-activedescendant="activeOptionId || undefined"
				:aria-describedby="describedBy || undefined"
				autocomplete="off"
				autocorrect="off"
				autocapitalize="none"
				spellcheck="false"
				enterkeyhint="done"
				:placeholder="defaultFont"
				:style="{ fontFamily: activePreviewFontStack }"
				:value="displayValue"
				@focus="onInputFocus"
				@input="onInput"
				@keydown="onKeydown"
			/>
			<button
				v-if="isEditing && draftQuery.length > 0"
				type="button"
				class="font-picker-icon-btn font-picker-clear-btn"
				:aria-label="'Clear ' + label"
				@mousedown.prevent
				@click.stop="clearDraft"
			>
				<i class="fas fa-xmark" aria-hidden="true"></i>
			</button>
			<button
				v-else-if="!isDefaultSelected"
				type="button"
				class="font-picker-icon-btn font-picker-reset-btn"
				:title="'Reset to ' + defaultFont"
				:aria-label="'Reset ' + label + ' to ' + defaultFont"
				@mousedown.prevent
				@click.stop="resetToDefault"
			>
				<i class="fas fa-rotate-left" aria-hidden="true"></i>
			</button>
			<button
				type="button"
				tabindex="-1"
				class="font-picker-icon-btn font-picker-toggle-btn"
				:aria-label="label + ' list'"
				:aria-expanded="isOpen ? 'true' : 'false'"
				:aria-controls="listboxId"
				@mousedown.prevent
				@click.stop="toggleDropdown"
			>
				<i class="fas fa-chevron-right font-picker-chevron" :class="{ open: isOpen }" aria-hidden="true"></i>
			</button>
		</div>
		<ul
			ref="listboxRef"
			:id="listboxId"
			class="font-picker-listbox"
			role="listbox"
			:aria-label="label + ' options'"
			:hidden="!isOpen"
		>
			<li
				v-for="(opt, idx) in filteredOptions"
				:key="opt.family + (opt.isCustomOption ? '-custom' : '')"
				:id="inputId + '-opt-' + idx"
				role="option"
				class="font-picker-option"
				:class="{
					'is-selected': isSelected(opt.family) && !opt.isCustomOption,
					'is-active': idx === activeIndex,
				}"
				:aria-selected="isSelected(opt.family) && !opt.isCustomOption ? 'true' : 'false'"
				@mouseenter="activeIndex = idx"
				@mousedown.prevent="selectOption(opt)"
			>
				<span class="font-picker-opt-ag" aria-hidden="true" :style="{ fontFamily: optionFontStack(opt) }">Ag</span>
				<span class="font-picker-opt-name" :style="{ fontFamily: optionFontStack(opt) }">
					{{ opt.isCustomOption ? 'Use "' + opt.family + '"' : opt.family }}
				</span>
				<span class="font-picker-opt-tag">{{ opt.tag }}</span>
				<i
					v-if="isSelected(opt.family) && !opt.isCustomOption"
					class="fas fa-check font-picker-opt-check"
					aria-hidden="true"
				></i>
			</li>
		</ul>
	</div>
</template>
