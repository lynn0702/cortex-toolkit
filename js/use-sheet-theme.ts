import { computed, nextTick, ref, watch, type ComputedRef, type Ref } from 'vue';
import { characterCurioFunctions } from './functions.ts';
import { ensureView, getView, type Character, type DiceConfig } from './model.ts';
import { inferFontFamilyFromUrl, parseExternalFontUrl, sanitizeFontFamilyName } from './font-url.ts';
import {
	DICE_PRESETS,
	SHEET_THEME_PRESETS,
	expandHex6,
	type DicePreset,
	type SheetThemePreset,
} from './color-palette.ts';

export const DICE_PREVIEW_SIZES = [4, 6, 8, 10, 12] as const;

export interface UseSheetThemeDeps {
	character: ComputedRef<Character>;
	updateCharacter: (character: Character) => void;
	fontUrlInput: Ref<HTMLInputElement | null>;
	fontUrlNameInput: Ref<HTMLInputElement | null>;
}

export function useSheetTheme(deps: UseSheetThemeDeps) {
	const { character, updateCharacter, fontUrlInput, fontUrlNameInput } = deps;

	const externalFontUrlDraft = ref('');
	const externalFontNameDraft = ref('');
	const externalFontNameTouched = ref(false);
	const fontUrlError = ref('');
	const fontUrlFieldError = ref<'url' | 'name' | ''>('');
	const dicePresets = DICE_PRESETS;
	const sheetThemePresets = SHEET_THEME_PRESETS;

	const rawAccentColor = computed(() => getView(character.value)?.accentColor || '');
	const rawPrimaryColor = computed(() => getView(character.value)?.primaryColor || '');
	const rawSecondaryColor = computed(() => getView(character.value)?.secondaryColor || '');
	const effectivePrimaryHex = computed(() => expandHex6(rawPrimaryColor.value || rawAccentColor.value || '#e11d48'));
	const effectiveAccentHex = computed(() => expandHex6(rawAccentColor.value || '#0ea5e9'));
	const effectiveSecondaryHex = computed(() => expandHex6(rawSecondaryColor.value || '#d0efda'));
	const hasCustomSheetTheme = computed(() =>
		Boolean(rawPrimaryColor.value || rawAccentColor.value || rawSecondaryColor.value),
	);

	const customFontEntries = computed(() =>
		(getView(character.value)?.customFonts || []).filter((f): f is { name: string; url: string } =>
			Boolean(f?.name && f?.url && parseExternalFontUrl(f.url)),
		),
	);
	const customFontsList = computed(() => customFontEntries.value.map((f) => f.name));

	function setThemeFont(target: 'heading' | 'primary' | 'secondary', fontName: string) {
		if (!character.value) return;
		const view = ensureView(character.value);
		if (!view.theme) view.theme = {};
		if (!view.theme.fonts) view.theme.fonts = {};
		view.theme.fonts[target] = fontName;
		const isCustom = customFontEntries.value.some((f) => f.name.trim().toLowerCase() === fontName.trim().toLowerCase());
		if (!isCustom && typeof characterCurioFunctions !== 'undefined' && characterCurioFunctions.loadGoogleFont) {
			characterCurioFunctions.loadGoogleFont(fontName);
		}
		updateCharacter(character.value);
	}

	function resetThemeFont(target: 'heading' | 'primary' | 'secondary') {
		if (!character.value) return;
		const view = getView(character.value);
		if (view?.theme?.fonts && target in view.theme.fonts) {
			delete (view.theme.fonts as Record<string, unknown>)[target];
			updateCharacter(character.value);
		}
	}

	const headingFont = computed({
		get() {
			return getView(character.value)?.theme?.fonts?.heading || 'Josefin Sans';
		},
		set(val: string) {
			setThemeFont('heading', val);
		},
	});

	const primaryFont = computed({
		get() {
			return getView(character.value)?.theme?.fonts?.primary || 'Open Sans';
		},
		set(val: string) {
			setThemeFont('primary', val);
		},
	});

	const secondaryFont = computed({
		get() {
			return getView(character.value)?.theme?.fonts?.secondary || 'Alegreya Sans SC';
		},
		set(val: string) {
			setThemeFont('secondary', val);
		},
	});

	const diceConfig = computed({
		get() {
			return (
				getView(character.value)?.diceConfig || {
					style: 'default',
					backgroundType: 'solid',
					backgroundColor1: '#ffffff',
					backgroundColor2: '#f1f5f9',
					gradientAngle: 135,
					numeralColor: '#000000',
					borderColor: '#000000',
					borderWidth: 1.7,
					unfilledBackground: 'none',
					unfilledNumeral: '#000000',
					unfilledBorder: '#000000',
				}
			);
		},
		set(cfg: DiceConfig) {
			if (!character.value) return;
			ensureView(character.value).diceConfig = { ...cfg };
			if (typeof window !== 'undefined') {
				(window as Window & { __characterCurioActiveDiceConfig?: DiceConfig }).__characterCurioActiveDiceConfig = {
					...cfg,
				};
			}
			updateCharacter(character.value);
		},
	});

	function setPrimaryColor(hex: string) {
		if (!character.value) return;
		ensureView(character.value).primaryColor = hex;
		updateCharacter(character.value);
	}

	function resetPrimary() {
		if (!character.value) return;
		delete ensureView(character.value).primaryColor;
		updateCharacter(character.value);
	}

	function setAccentColor(hex: string) {
		if (!character.value) return;
		ensureView(character.value).accentColor = hex;
		updateCharacter(character.value);
	}

	function resetAccent() {
		if (!character.value) return;
		delete ensureView(character.value).accentColor;
		updateCharacter(character.value);
	}

	function setSecondaryColor(hex: string) {
		if (!character.value) return;
		ensureView(character.value).secondaryColor = hex;
		updateCharacter(character.value);
	}

	function resetSecondary() {
		if (!character.value) return;
		delete ensureView(character.value).secondaryColor;
		updateCharacter(character.value);
	}

	function isPaletteActive(p: SheetThemePreset): boolean {
		if (!rawPrimaryColor.value && !rawAccentColor.value && !rawSecondaryColor.value) return false;
		return (
			expandHex6(rawPrimaryColor.value) === p.primary &&
			expandHex6(rawAccentColor.value) === p.accent &&
			expandHex6(rawSecondaryColor.value) === p.secondary
		);
	}

	function applySheetPalette(p: SheetThemePreset) {
		if (!character.value) return;
		const v = ensureView(character.value);
		v.primaryColor = p.primary;
		v.accentColor = p.accent;
		v.secondaryColor = p.secondary;
		updateCharacter(character.value);
	}

	function resetSheetPalette() {
		if (!character.value) return;
		const v = ensureView(character.value);
		delete v.primaryColor;
		delete v.accentColor;
		delete v.secondaryColor;
		updateCharacter(character.value);
	}

	function onExternalFontUrlInput() {
		fontUrlError.value = '';
		fontUrlFieldError.value = '';
		if (!externalFontUrlDraft.value.trim()) {
			externalFontNameTouched.value = false;
			externalFontNameDraft.value = '';
			return;
		}
		if (!externalFontNameTouched.value) {
			const inferred = inferFontFamilyFromUrl(externalFontUrlDraft.value);
			if (inferred) {
				externalFontNameDraft.value = inferred;
			}
		}
	}

	function onExternalFontNameInput() {
		fontUrlError.value = '';
		fontUrlFieldError.value = '';
		externalFontNameTouched.value = externalFontNameDraft.value.trim().length > 0;
	}

	function upsertCustomFontEntry(name: string, url: string): boolean {
		if (!character.value) return false;
		const cleanName = sanitizeFontFamilyName(name);
		const parsed = parseExternalFontUrl(url);
		if (!cleanName || !parsed) return false;

		if (typeof characterCurioFunctions !== 'undefined' && characterCurioFunctions.applyCustomFont) {
			characterCurioFunctions.applyCustomFont(cleanName, parsed.url);
		}
		const view = ensureView(character.value);
		const existing = Array.isArray(view.customFonts)
			? view.customFonts.filter((f) => f?.name && f?.url && f.name.trim().toLowerCase() !== cleanName.toLowerCase())
			: [];
		existing.push({ name: cleanName, url: parsed.url });
		view.customFonts = existing;
		updateCharacter(character.value);
		return true;
	}

	function addExternalFont() {
		const parsed = parseExternalFontUrl(externalFontUrlDraft.value);
		if (!parsed) {
			fontUrlError.value = 'Enter an https:// font or stylesheet URL.';
			fontUrlFieldError.value = 'url';
			fontUrlInput.value?.focus();
			return;
		}
		const cleanName = sanitizeFontFamilyName(externalFontNameDraft.value || inferFontFamilyFromUrl(parsed.url));
		if (!cleanName) {
			fontUrlError.value = 'Enter the font family name.';
			fontUrlFieldError.value = 'name';
			fontUrlNameInput.value?.focus();
			return;
		}
		if (upsertCustomFontEntry(cleanName, parsed.url)) {
			externalFontUrlDraft.value = '';
			externalFontNameDraft.value = '';
			externalFontNameTouched.value = false;
			fontUrlError.value = '';
			fontUrlFieldError.value = '';
		}
	}

	function onExternalFontEnter(e: KeyboardEvent) {
		if (e.isComposing) return;
		e.preventDefault();
		addExternalFont();
	}

	function removeExternalFont(fontName: string) {
		if (!character.value) return;
		if (typeof characterCurioFunctions !== 'undefined' && characterCurioFunctions.removeCustomFont) {
			characterCurioFunctions.removeCustomFont(fontName);
		}
		const view = getView(character.value);
		if (view && Array.isArray(view.customFonts)) {
			const target = fontName.trim().toLowerCase();
			const remaining = view.customFonts.filter((f) => (f?.name || '').trim().toLowerCase() !== target);
			if (remaining.length) {
				view.customFonts = remaining;
			} else {
				delete view.customFonts;
			}
			if (view.theme?.fonts) {
				for (const slot of ['heading', 'primary', 'secondary'] as const) {
					if ((view.theme.fonts[slot] || '').trim().toLowerCase() === target) {
						delete view.theme.fonts[slot];
					}
				}
			}
			updateCharacter(character.value);
		}
	}

	function handlePrefillExternalUrl(url: string) {
		externalFontUrlDraft.value = url;
		externalFontNameTouched.value = false;
		externalFontNameDraft.value = inferFontFamilyFromUrl(url);
		fontUrlError.value = '';
		fontUrlFieldError.value = '';
		nextTick(() => fontUrlNameInput.value?.focus());
	}

	function updateDiceProp(key: string, val: unknown) {
		const newCfg: DiceConfig = { ...diceConfig.value, style: 'custom', [key]: val };
		diceConfig.value = newCfg;
	}

	const presetFillMode = ref<'solid' | 'gradient'>(
		diceConfig.value?.backgroundType === 'gradient' ? 'gradient' : 'solid',
	);

	watch(
		() => diceConfig.value?.backgroundType,
		(bgType) => {
			presetFillMode.value = bgType === 'gradient' ? 'gradient' : 'solid';
		},
	);

	function presetWithMode(p: DicePreset, mode: 'solid' | 'gradient' = presetFillMode.value): DicePreset {
		return { ...p, backgroundType: mode };
	}

	function applyDicePreset(preset: DicePreset) {
		const resolved = presetWithMode(preset);
		const newCfg = { ...diceConfig.value, ...resolved, style: 'custom' };
		diceConfig.value = newCfg;
	}

	function setPresetFillMode(mode: 'solid' | 'gradient') {
		presetFillMode.value = mode;
		if (diceConfig.value?.style === 'custom') {
			updateDiceProp('backgroundType', mode);
		}
	}

	function resetDiceConfig() {
		const defaultCfg = {
			style: 'default',
			backgroundType: 'solid',
			backgroundColor1: '#ffffff',
			backgroundColor2: '#f1f5f9',
			gradientAngle: 135,
			numeralColor: '#000000',
			borderColor: '#000000',
			borderWidth: 1,
			unfilledBackground: 'none',
			unfilledNumeral: '#000000',
			unfilledBorder: '#000000',
		};
		diceConfig.value = defaultCfg;
	}

	function renderDicePreview(size: number, isFilled: boolean, cfgOverride?: DiceConfig | null) {
		if (typeof characterCurioFunctions !== 'undefined' && characterCurioFunctions.renderDieconSVG) {
			return characterCurioFunctions.renderDieconSVG(size, isFilled, '', cfgOverride ?? diceConfig.value);
		}
		return String(size);
	}

	function isDicePresetActive(p: DicePreset): boolean {
		const resolved = presetWithMode(p);
		const cfg = diceConfig.value;
		if (!cfg || cfg.style !== 'custom') return false;
		return (
			cfg.backgroundType === resolved.backgroundType &&
			expandHex6(cfg.backgroundColor1) === expandHex6(resolved.backgroundColor1) &&
			(resolved.backgroundType !== 'gradient' ||
				expandHex6(cfg.backgroundColor2) === expandHex6(resolved.backgroundColor2)) &&
			expandHex6(cfg.numeralColor) === expandHex6(resolved.numeralColor) &&
			expandHex6(cfg.borderColor) === expandHex6(resolved.borderColor) &&
			expandHex6(cfg.unfilledBorder) === expandHex6(resolved.unfilledBorder) &&
			expandHex6(cfg.unfilledNumeral) === expandHex6(resolved.unfilledNumeral)
		);
	}

	return {
		DICE_PREVIEW_SIZES,
		externalFontUrlDraft,
		externalFontNameDraft,
		fontUrlError,
		fontUrlFieldError,
		dicePresets,
		sheetThemePresets,
		rawAccentColor,
		rawPrimaryColor,
		rawSecondaryColor,
		effectivePrimaryHex,
		effectiveAccentHex,
		effectiveSecondaryHex,
		hasCustomSheetTheme,
		headingFont,
		primaryFont,
		secondaryFont,
		customFontEntries,
		customFontsList,
		diceConfig,
		setPrimaryColor,
		resetPrimary,
		setAccentColor,
		resetAccent,
		setSecondaryColor,
		resetSecondary,
		isPaletteActive,
		applySheetPalette,
		resetSheetPalette,
		setThemeFont,
		resetThemeFont,
		onExternalFontUrlInput,
		onExternalFontNameInput,
		upsertCustomFontEntry,
		addExternalFont,
		onExternalFontEnter,
		removeExternalFont,
		handlePrefillExternalUrl,
		updateDiceProp,
		applyDicePreset,
		presetFillMode,
		presetWithMode,
		setPresetFillMode,
		resetDiceConfig,
		renderDicePreview,
		isDicePresetActive,
	};
}
