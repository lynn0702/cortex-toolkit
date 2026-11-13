import { getView } from './model.ts';

export interface ColorSwatch {
	name: string;
	hex: string;
}

export interface ColorTokenOption {
	id: string;
	label: string;
	previewColor: string;
}

export interface SheetThemePreset {
	name: string;
	primary: string;
	accent: string;
	secondary: string;
}

export interface DicePreset {
	name: string;
	style: string;
	backgroundType: string;
	backgroundColor1: string;
	backgroundColor2: string;
	numeralColor: string;
	borderColor: string;
	borderWidth: number;
	gradientAngle?: number;
	unfilledBackground: string;
	unfilledNumeral: string;
	unfilledBorder: string;
	[key: string]: unknown;
}

export const CURIO_PALETTE: ColorSwatch[] = [
	{ name: 'Crimson', hex: '#be123c' },
	{ name: 'Rose', hex: '#e11d48' },
	{ name: 'Amber', hex: '#d97706' },
	{ name: 'Forest', hex: '#059669' },
	{ name: 'Teal', hex: '#0d9488' },
	{ name: 'Sky', hex: '#0284c7' },
	{ name: 'Cobalt', hex: '#2563eb' },
	{ name: 'Indigo', hex: '#4f46e5' },
	{ name: 'Violet', hex: '#7c3aed' },
	{ name: 'Slate', hex: '#475569' },
	{ name: 'Ink', hex: '#0f172a' },
	{ name: 'White', hex: '#ffffff' },
];

export const SHEET_THEME_PRESETS: SheetThemePreset[] = [
	{ name: 'Crimson', primary: '#be123c', accent: '#0284c7', secondary: '#ffe4e6' },
	{ name: 'Cobalt', primary: '#1d4ed8', accent: '#0ea5e9', secondary: '#dbeafe' },
	{ name: 'Teal', primary: '#0f766e', accent: '#14b8a6', secondary: '#ccfbf1' },
	{ name: 'Forest', primary: '#15803d', accent: '#10b981', secondary: '#dcfce7' },
	{ name: 'Amber', primary: '#b45309', accent: '#f59e0b', secondary: '#fef3c7' },
	{ name: 'Violet', primary: '#6d28d9', accent: '#8b5cf6', secondary: '#ede9fe' },
	{ name: 'Slate', primary: '#334155', accent: '#0ea5e9', secondary: '#e2e8f0' },
	{ name: 'Ink', primary: '#0f172a', accent: '#e11d48', secondary: '#f1f5f9' },
];

export const DICE_PRESETS: DicePreset[] = [
	{
		name: 'White',
		style: 'custom',
		backgroundType: 'solid',
		backgroundColor1: '#ffffff',
		backgroundColor2: '#f1f5f9',
		numeralColor: '#000000',
		borderColor: '#000000',
		borderWidth: 1.4,
		unfilledBackground: 'none',
		unfilledNumeral: '#475569',
		unfilledBorder: '#475569',
	},
	{
		name: 'Black',
		style: 'custom',
		backgroundType: 'solid',
		backgroundColor1: '#0f172a',
		backgroundColor2: '#1e293b',
		numeralColor: '#ffffff',
		borderColor: '#cbd5e1',
		borderWidth: 1.6,
		unfilledBackground: 'none',
		unfilledNumeral: '#64748b',
		unfilledBorder: '#64748b',
	},
	{
		name: 'Crimson',
		style: 'custom',
		backgroundType: 'gradient',
		backgroundColor1: '#e11d48',
		backgroundColor2: '#9f1239',
		gradientAngle: 135,
		numeralColor: '#ffffff',
		borderColor: '#be123c',
		borderWidth: 1.6,
		unfilledBackground: 'none',
		unfilledNumeral: '#be123c',
		unfilledBorder: '#be123c',
	},
	{
		name: 'Cobalt',
		style: 'custom',
		backgroundType: 'gradient',
		backgroundColor1: '#2563eb',
		backgroundColor2: '#1e40af',
		gradientAngle: 135,
		numeralColor: '#ffffff',
		borderColor: '#1d4ed8',
		borderWidth: 1.6,
		unfilledBackground: 'none',
		unfilledNumeral: '#2563eb',
		unfilledBorder: '#2563eb',
	},
	{
		name: 'Amber',
		style: 'custom',
		backgroundType: 'gradient',
		backgroundColor1: '#f59e0b',
		backgroundColor2: '#b45309',
		gradientAngle: 135,
		numeralColor: '#ffffff',
		borderColor: '#d97706',
		borderWidth: 1.6,
		unfilledBackground: 'none',
		unfilledNumeral: '#d97706',
		unfilledBorder: '#d97706',
	},
	{
		name: 'Forest',
		style: 'custom',
		backgroundType: 'gradient',
		backgroundColor1: '#10b981',
		backgroundColor2: '#047857',
		gradientAngle: 135,
		numeralColor: '#ffffff',
		borderColor: '#059669',
		borderWidth: 1.6,
		unfilledBackground: 'none',
		unfilledNumeral: '#059669',
		unfilledBorder: '#059669',
	},
	{
		name: 'Violet',
		style: 'custom',
		backgroundType: 'gradient',
		backgroundColor1: '#8b5cf6',
		backgroundColor2: '#5b21b6',
		gradientAngle: 135,
		numeralColor: '#ffffff',
		borderColor: '#7c3aed',
		borderWidth: 1.6,
		unfilledBackground: 'none',
		unfilledNumeral: '#7c3aed',
		unfilledBorder: '#7c3aed',
	},
	{
		name: 'Slate',
		style: 'custom',
		backgroundType: 'gradient',
		backgroundColor1: '#475569',
		backgroundColor2: '#1e293b',
		gradientAngle: 135,
		numeralColor: '#ffffff',
		borderColor: '#334155',
		borderWidth: 1.6,
		unfilledBackground: 'none',
		unfilledNumeral: '#475569',
		unfilledBorder: '#475569',
	},
];

export const VALID_FRAME_COLOR_TOKENS = ['primary', 'secondary', 'accent', 'muted', 'strong', 'black'] as const;

const HEX_COLOR_RE = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;

/**
 * Checks whether a value is a valid 3-, 6-, or 8-digit CSS hex color.
 */
export function isHexColor(val: unknown): val is string {
	return typeof val === 'string' && HEX_COLOR_RE.test(val.trim());
}

/**
 * Expands shorthand #rgb (or strips alpha from #rrggbbaa) to lowercase #rrggbb for native `<input type="color">`.
 */
export function expandHex6(val: unknown, fallback = '#e11d48'): string {
	const safeFallback = HEX_COLOR_RE.test(fallback.trim()) ? fallback.trim().toLowerCase() : '#e11d48';
	if (!isHexColor(val)) {
		return safeFallback.length === 4
			? `#${safeFallback[1]}${safeFallback[1]}${safeFallback[2]}${safeFallback[2]}${safeFallback[3]}${safeFallback[3]}`
			: safeFallback.slice(0, 7);
	}
	const s = val.trim().toLowerCase();
	if (s.length === 4) {
		return `#${s[1]}${s[1]}${s[2]}${s[2]}${s[3]}${s[3]}`;
	}
	return s.slice(0, 7);
}

/**
 * Returns true when a hex color is bright enough to need dark foreground iconography.
 */
export function isLightHex(val: string): boolean {
	const hex = expandHex6(val, '#000000').slice(1);
	const r = parseInt(hex.slice(0, 2), 16) / 255;
	const g = parseInt(hex.slice(2, 4), 16) / 255;
	const b = parseInt(hex.slice(4, 6), 16) / 255;
	const lin = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
	const lum = 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
	return lum > 0.45;
}

export interface FrameColorPresentation {
	className: string;
	customColor?: string;
	unknownToken?: string;
}

/**
 * Resolves `view.frame.color` to either a semantic `.frame-color-*` token class,
 * `.frame-color-custom` + inline `--frame-color` hex, or fallback to `.frame-color-primary` with warning token.
 */
export function resolveFrameColorPresentation(rawColor: string | undefined | null): FrameColorPresentation {
	const raw = (rawColor || 'primary').trim();
	if ((VALID_FRAME_COLOR_TOKENS as readonly string[]).includes(raw)) {
		return { className: 'frame-color-' + raw };
	}
	if (isHexColor(raw)) {
		return { className: 'frame-color-custom', customColor: raw };
	}
	return { className: 'frame-color-primary', unknownToken: raw };
}

/**
 * Builds semantic token swatches resolved from the active character's theme tokens.
 */
export function getCharacterColorTokens(character: any, mode: 'frame' | 'badge'): ColorTokenOption[] {
	const ctk = getView(character) || {};
	const primary = ctk.primaryColor || ctk.accentColor || '#e11d48';
	const accent = ctk.accentColor || '#0ea5e9';
	const secondary = ctk.secondaryColor || '#d0efda';

	if (mode === 'badge') {
		return [
			{ id: 'black', label: 'Black', previewColor: '#000000' },
			{ id: 'primary', label: 'Primary', previewColor: primary },
			{ id: 'secondary', label: 'Secondary', previewColor: secondary },
			{ id: 'interactive', label: 'Accent', previewColor: accent },
			{ id: 'muted', label: 'Muted', previewColor: '#94a3b8' },
		];
	}

	return [
		{ id: 'primary', label: 'Primary', previewColor: primary },
		{ id: 'accent', label: 'Accent', previewColor: accent },
		{ id: 'secondary', label: 'Secondary', previewColor: secondary },
		{ id: 'muted', label: 'Muted', previewColor: '#94a3b8' },
		{ id: 'strong', label: 'Strong', previewColor: '#1e293b' },
		{ id: 'black', label: 'Black', previewColor: '#000000' },
	];
}
