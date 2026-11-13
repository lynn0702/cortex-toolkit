import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import axe from 'axe-core';
import ColorPicker from '../js/color-picker.vue';
import NameEditor from '../js/name-editor.vue';
import TraitSetBlock from '../js/trait-set-block.vue';
import TraitSetFrame from '../js/trait-set-frame.vue';
import TraitSetEditor from '../js/trait-set-editor.vue';
import TraitEditor from '../js/trait-editor.vue';
import {
	CURIO_PALETTE,
	DICE_PRESETS,
	SHEET_THEME_PRESETS,
	getCharacterColorTokens,
	resolveFrameColorPresentation,
} from '../js/color-palette.ts';
import { normalizeRingSize, resolveFrame } from '../js/frame-geometry.ts';
import { DREAMER_ARCHITECT_SHOWCASE, VANGUARD_FRAME_SHOWCASE } from '../js/showcase-templates.ts';
import { inferFontFamilyFromUrl, parseExternalFontUrl, sanitizeFontFamilyName } from '../js/font-url.ts';

function cloneSampleCharacter(): any {
	return structuredClone(VANGUARD_FRAME_SHOWCASE.character);
}

async function runAxeAudit(container: HTMLElement) {
	document.body.appendChild(container);
	try {
		const results = await axe.run(container, {
			rules: {
				'color-contrast': { enabled: false },
				region: { enabled: false },
				'nested-interactive': { enabled: true },
				'button-name': { enabled: true },
				'aria-roles': { enabled: true },
				'aria-valid-attr': { enabled: true },
				'aria-valid-attr-value': { enabled: true },
				'aria-required-attr': { enabled: true },
				label: { enabled: true },
			},
		});
		if (results.violations.length > 0) {
			const summary = results.violations
				.map((v) => `[${v.id}] (${v.impact}): ${v.help}\n  Nodes: ${v.nodes.map((n) => n.html).join('\n         ')}`)
				.join('\n\n');
			expect.fail(`Axe Accessibility Violations Found:\n\n${summary}`);
		}
	} finally {
		if (container.parentNode === document.body) {
			document.body.removeChild(container);
		}
	}
}

describe('Color Choice Glow-Up & Frame Custom Colors', () => {
	it('resolves token frame colors, custom hex frame colors, and unknown fallback tokens', () => {
		expect(resolveFrameColorPresentation('primary')).toEqual({ className: 'frame-color-primary' });
		expect(resolveFrameColorPresentation('secondary')).toEqual({ className: 'frame-color-secondary' });
		expect(resolveFrameColorPresentation('#f59e0b')).toEqual({
			className: 'frame-color-custom',
			customColor: '#f59e0b',
		});
		expect(resolveFrameColorPresentation('#abc')).toEqual({
			className: 'frame-color-custom',
			customColor: '#abc',
		});
		expect(resolveFrameColorPresentation('unknown-neon')).toEqual({
			className: 'frame-color-primary',
			unknownToken: 'unknown-neon',
		});
	});

	it('applies .frame-color-custom and --frame-color on TraitSetFrame and TraitSetBlock portrait ring', () => {
		const character = cloneSampleCharacter();
		character.traitSets.push({
			id: 'ring-test',
			name: 'The Architect',
			traits: [],
			view: {
				style: { body: 'portrait-ring', header: 'default' },
				frame: { shape: 'ring', color: '#f59e0b' },
			},
		});
		const idx = character.traitSets.length - 1;

		const frameWrapper = mount(TraitSetFrame, {
			props: { traitSet: character.traitSets[idx] },
		});
		expect(frameWrapper.classes()).toContain('frame-color-custom');
		expect((frameWrapper.element as SVGSVGElement).style.getPropertyValue('--frame-color')).toBe('#f59e0b');
		frameWrapper.unmount();

		const blockWrapper = mount(TraitSetBlock, {
			props: { character, traitSetID: idx, submode: 'edit', editing: [] },
		});
		expect(blockWrapper.classes()).toContain('frame-color-custom');
		expect((blockWrapper.element as HTMLElement).style.getPropertyValue('--frame-color')).toBe('#f59e0b');
		blockWrapper.unmount();
	});

	it('supports token selection, palette swatches, hex input, clear action, and passes axe-core', async () => {
		const character = cloneSampleCharacter();
		character.view = { primaryColor: '#be123c', accentColor: '#0284c7', secondaryColor: '#ffe4e6' };
		const tokens = getCharacterColorTokens(character, 'frame');

		const wrapper = mount(ColorPicker, {
			props: {
				modelValue: 'primary',
				inputId: 'test-frame-color',
				label: 'Frame Color',
				tokens,
				allowClear: true,
			},
		});

		await wrapper.findAll('.color-token-chip')[2].trigger('click');
		expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['secondary']);

		await wrapper.findAll('.color-swatch-chip')[3].trigger('click');
		expect(wrapper.emitted('update:modelValue')?.[1]).toEqual([CURIO_PALETTE[3].hex]);

		const hexInput = wrapper.find('#test-frame-color-hex');
		await hexInput.setValue('#7c3aed');
		await hexInput.trigger('change');
		expect(wrapper.emitted('update:modelValue')?.slice(-1)[0]).toEqual(['#7c3aed']);

		await wrapper.find('.color-clear-btn').trigger('click');
		expect(wrapper.emitted('clear')).toHaveLength(1);

		await runAxeAudit(wrapper.element as HTMLElement);
		wrapper.unmount();
	});

	it('uses human-authored preset names and exposes all 3 sheet theme colors & unfilled dice colors in NameEditor', async () => {
		const bannedAiPhrases =
			/cyberpunk|noir|solar flare|arcane|forge|curio sky|crimson ruby|indigo purple|amber gold|rose coral|teal cyan|slate dark/i;
		expect(CURIO_PALETTE).toHaveLength(11);
		expect(CURIO_PALETTE[0]).toEqual({ name: 'White', hex: '#ffffff' });
		expect(CURIO_PALETTE.some((s) => s.name === 'Rose')).toBe(false);
		for (const p of DICE_PRESETS) {
			expect(p.name).not.toMatch(bannedAiPhrases);
			expect(p.backgroundType).toBe('solid');
		}
		for (const p of SHEET_THEME_PRESETS) {
			expect(p.name).not.toMatch(bannedAiPhrases);
		}

		const character = cloneSampleCharacter();
		const wrapper = mount(NameEditor, {
			props: { character, open: true, tab: 'theme' },
		});

		expect(wrapper.text()).not.toMatch(bannedAiPhrases);
		expect(wrapper.text()).not.toContain('Match Sheet');
		expect(wrapper.find('.editor-dice-preview-card').exists()).toBe(false);
		expect(wrapper.text()).not.toContain('Live Dice Appearance Preview');
		expect(wrapper.find('.font-picker-preview').exists()).toBe(false);
		expect(wrapper.find('#char-primary-color-picker').exists()).toBe(true);
		expect(wrapper.find('#char-accent-color-picker').exists()).toBe(true);
		expect(wrapper.find('#char-secondary-color-picker').exists()).toBe(true);
		expect(wrapper.find('#char-field-dice-unfilled-border-picker').exists()).toBe(true);
		expect(wrapper.find('#char-field-dice-unfilled-numeral-picker').exists()).toBe(true);

		const modeBtns = wrapper.findAll('.editor-dice-mode-btn');
		expect(modeBtns).toHaveLength(2);
		expect(modeBtns[0].text()).toBe('Solid');
		expect(modeBtns[0].attributes('aria-pressed')).toBe('true');
		expect(modeBtns[1].text()).toBe('Gradient');
		expect(modeBtns[1].attributes('aria-pressed')).toBe('false');

		const presetBtns = wrapper.findAll('.editor-dice-preset-btn');
		expect(presetBtns).toHaveLength(DICE_PRESETS.length);
		presetBtns.forEach((btn, i) => {
			expect(btn.attributes('title')).toBe(DICE_PRESETS[i].name);
			expect(btn.attributes('aria-label')).toBe(DICE_PRESETS[i].name);
			expect(btn.text()).not.toContain(DICE_PRESETS[i].name);
			expect(btn.text()).toBe('4681012');
			expect(btn.html()).not.toContain('linearGradient');
			const dice = btn.findAll('.editor-dice-preset-die');
			expect(dice).toHaveLength(5);
			expect(dice[0].find('.diecon-d4.diecon-unfilled').exists()).toBe(true);
			expect(dice[1].find('.diecon-d6.diecon-filled').exists()).toBe(true);
			expect(dice[2].find('.diecon-d8.diecon-filled').exists()).toBe(true);
			expect(dice[3].find('.diecon-d10.diecon-filled').exists()).toBe(true);
			expect(dice[4].find('.diecon-d12.diecon-unfilled').exists()).toBe(true);
		});

		await wrapper.findAll('.sheet-palette-btn')[1].trigger('click');
		expect(character.view.primaryColor).toBe(SHEET_THEME_PRESETS[1].primary);
		expect(character.view.accentColor).toBe(SHEET_THEME_PRESETS[1].accent);
		expect(character.view.secondaryColor).toBe(SHEET_THEME_PRESETS[1].secondary);

		await presetBtns[2].trigger('click');
		expect(character.view.diceConfig.backgroundType).toBe('solid');
		expect(character.view.diceConfig.backgroundColor1).toBe(DICE_PRESETS[2].backgroundColor1);
		expect(presetBtns[2].attributes('aria-pressed')).toBe('true');

		await modeBtns[1].trigger('click');
		expect(modeBtns[1].attributes('aria-pressed')).toBe('true');
		expect(character.view.diceConfig.backgroundType).toBe('gradient');
		expect(presetBtns[2].attributes('aria-pressed')).toBe('true');
		wrapper.findAll('.editor-dice-preset-btn').forEach((btn) => {
			expect(btn.html()).toContain('linearGradient');
		});

		const unfilledHex = wrapper.find('#char-field-dice-unfilled-border-hex');
		await unfilledHex.setValue('#be123c');
		await unfilledHex.trigger('change');
		expect(character.view.diceConfig.unfilledBorder).toBe('#be123c');

		await runAxeAudit(wrapper.element as HTMLElement);
		wrapper.unmount();
	});

	it('renders fixed-token swatch chips without custom hex inputs for trait badges', async () => {
		const character = cloneSampleCharacter();
		character.traitSets[0].traits = [
			{
				name: 'Heroic',
				rating: { type: 'Die', value: [8] },
				traits: [{ name: 'SFX', traits: [{ name: 'Hinder', description: 'Gain a PP.' }] }],
				view: { badge: { shape: 'pill', color: 'black', text: 'SFX' } },
			},
		];
		const wrapper = mount(TraitEditor, {
			props: { character, traitSetID: 0, traitID: 0, open: true },
		});

		const primaryBadgeChip = wrapper.findAll('.color-token-chip').find((btn) => btn.text().includes('Primary'));
		expect(primaryBadgeChip).toBeDefined();
		await primaryBadgeChip!.trigger('click');
		expect(character.traitSets[0].traits[0].view.badge.color).toBe('primary');
		expect(wrapper.find('#trait-0-0-badge-color-picker').exists()).toBe(false);

		wrapper.unmount();
	});

	it('provides unified FontPicker comboboxes that preserve backspacing, filter options, apply custom Google fonts, and pass axe-core', async () => {
		const character = cloneSampleCharacter();
		const wrapper = mount(NameEditor, {
			props: { character, open: true, tab: 'theme' },
		});

		expect(wrapper.find('.editor-dice-preview-card').exists()).toBe(false);
		expect(wrapper.find('.font-picker-preview').exists()).toBe(false);

		const headingInput = wrapper.find('#char-field-heading-font');
		const bodyInput = wrapper.find('#char-field-body-font');
		const secondaryInput = wrapper.find('#char-field-secondary-font');
		expect(headingInput.attributes('role')).toBe('combobox');
		expect(bodyInput.attributes('role')).toBe('combobox');
		expect(secondaryInput.attributes('role')).toBe('combobox');

		// Focus opens unfiltered catalog showing all fonts even while "Open Sans" is in the input
		await bodyInput.trigger('focus');
		expect(bodyInput.attributes('aria-expanded')).toBe('true');
		const bodyListbox = wrapper.find('#char-field-body-font-listbox');
		expect(bodyListbox.attributes('hidden')).toBeUndefined();
		const initialOptionCount = bodyListbox.findAll('[role="option"]').length;
		expect(initialOptionCount).toBeGreaterThan(20);

		// Audit accessibility while dropdown listbox is expanded
		await runAxeAudit(wrapper.element as HTMLElement);

		// Backspacing must NOT snap back to "Open Sans"
		await bodyInput.setValue('Open San');
		expect((bodyInput.element as HTMLInputElement).value).toBe('Open San');
		await bodyInput.setValue('Open');
		expect((bodyInput.element as HTMLInputElement).value).toBe('Open');
		await bodyInput.setValue('');
		expect((bodyInput.element as HTMLInputElement).value).toBe('');
		expect(bodyListbox.findAll('[role="option"]').length).toBe(initialOptionCount);

		// Filtering narrows options and mousedown selects the font
		await bodyInput.setValue('Cin');
		const cinOptions = bodyListbox.findAll('[role="option"]');
		expect(cinOptions.some((o) => o.text().includes('Cinzel'))).toBe(true);
		const cinzelOpt = cinOptions.find((o) => o.text().includes('Cinzel'));
		await cinzelOpt!.trigger('mousedown');
		expect(character.view.theme.fonts.primary).toBe('Cinzel');
		expect((bodyInput.element as HTMLInputElement).value).toBe('Cinzel');
		expect(bodyInput.attributes('aria-expanded')).toBe('false');

		// Typing an arbitrary Google Font and pressing Enter applies it
		await bodyInput.trigger('focus');
		await bodyInput.setValue('MedievalSharp');
		await bodyInput.trigger('keydown', { key: 'Enter', isComposing: false });
		expect(character.view.theme.fonts.primary).toBe('MedievalSharp');
		expect((bodyInput.element as HTMLInputElement).value).toBe('MedievalSharp');

		// Reset button restores the default font and clears theme.fonts.primary
		const resetBtn = wrapper.find('button[aria-label="Reset Body Font to Open Sans"]');
		expect(resetBtn.exists()).toBe(true);
		await resetBtn.trigger('click');
		expect(character.view.theme.fonts.primary).toBeUndefined();
		expect((bodyInput.element as HTMLInputElement).value).toBe('Open Sans');

		await runAxeAudit(wrapper.element as HTMLElement);
		wrapper.unmount();
	});

	it('parses HTTPS external font URLs, infers non-Google families, and rejects unsafe schemes', () => {
		expect(parseExternalFontUrl('https://cdn.example.com/fonts/Beleren-Bold.woff2')).toMatchObject({
			kind: 'file',
			format: 'woff2',
			shortFormat: 'woff2',
			host: 'cdn.example.com',
		});
		expect(parseExternalFontUrl('https://cdn.example.com/font.woff')?.format).toBe('woff');
		expect(parseExternalFontUrl('https://cdn.example.com/font.ttf')?.format).toBe('truetype');
		expect(parseExternalFontUrl('https://cdn.example.com/font.otf')?.format).toBe('opentype');
		expect(inferFontFamilyFromUrl('https://cdn.example.com/fonts/Beleren-Bold.woff2')).toBe('Beleren Bold');

		expect(parseExternalFontUrl('https://api.fontshare.com/v2/css?f[]=clash-display@400,700&display=swap')?.kind).toBe(
			'stylesheet',
		);
		expect(inferFontFamilyFromUrl('https://api.fontshare.com/v2/css?f[]=clash-display@400,700&display=swap')).toBe(
			'Clash Display',
		);
		expect(inferFontFamilyFromUrl('https://fonts.bunny.net/css?family=cinzel-decorative:400')).toBe(
			'Cinzel Decorative',
		);
		expect(inferFontFamilyFromUrl('https://fonts.cdnfonts.com/css/futura-pt')).toBe('Futura Pt');
		expect(inferFontFamilyFromUrl('https://use.typekit.net/abc1234.css')).toBe('');

		expect(parseExternalFontUrl('http://insecure.example.com/font.woff2')).toBeNull();
		expect(parseExternalFontUrl('data:font/woff2;base64,AAAA')).toBeNull();
		expect(parseExternalFontUrl('javascript:alert(1)')).toBeNull();
		expect(sanitizeFontFamilyName(`My "Evil"; {Font}\n`)).toBe('My Evil Font');
	});

	it('replaces font upload with HTTPS External Fonts URL retrieval, picker integration, removal, and axe-core compliance', async () => {
		document.head
			.querySelectorAll('style[id^="cfont-"], link[id^="cfont-"], link[id^="gfont-"]')
			.forEach((el) => el.remove());

		const character = cloneSampleCharacter();
		const wrapper = mount(NameEditor, {
			props: { character, open: true, tab: 'theme' },
		});

		expect(wrapper.find('#char-field-font-upload').exists()).toBe(false);
		expect(wrapper.text()).not.toContain('Choose Font File');
		expect(wrapper.text()).not.toContain('Upload Custom Font');

		const urlInput = wrapper.find('#char-field-font-url');
		const nameInput = wrapper.find('#char-field-font-url-name');
		const addBtn = wrapper.find('.external-font-add-btn');

		// Unsafe scheme rejected with accessible alert
		await urlInput.setValue('http://insecure.example.com/font.woff2');
		await addBtn.trigger('click');
		expect(wrapper.find('[role="alert"]').text()).toContain('https://');
		expect(urlInput.attributes('aria-invalid')).toBe('true');

		await runAxeAudit(wrapper.element as HTMLElement);

		// Valid direct webfont file URL auto-infers family name and injects @font-face style
		await urlInput.setValue('https://cdn.example.com/fonts/Beleren-Bold.woff2');
		expect(wrapper.find('[role="alert"]').exists()).toBe(false);
		expect((nameInput.element as HTMLInputElement).value).toBe('Beleren Bold');
		await addBtn.trigger('click');

		expect(character.view.customFonts).toEqual([
			{ name: 'Beleren Bold', url: 'https://cdn.example.com/fonts/Beleren-Bold.woff2' },
		]);
		const styleEl = document.head.querySelector('#cfont-beleren-bold');
		expect(styleEl?.tagName).toBe('STYLE');
		expect(styleEl?.textContent).toContain("format('woff2')");
		expect(wrapper.findAll('.external-font-item')).toHaveLength(1);

		// Valid non-Google CSS stylesheet URL injects <link rel="stylesheet">
		await urlInput.setValue('https://api.fontshare.com/v2/css?f[]=clash-display@400,700&display=swap');
		expect((nameInput.element as HTMLInputElement).value).toBe('Clash Display');
		await addBtn.trigger('click');

		const linkEl = document.head.querySelector('#cfont-clash-display') as HTMLLinkElement | null;
		expect(linkEl?.tagName).toBe('LINK');
		expect(linkEl?.rel).toBe('stylesheet');
		expect(linkEl?.href).toContain('api.fontshare.com');

		// Selecting Clash Display in Heading Font sets theme.fonts.heading WITHOUT requesting Google Fonts
		const headingInput = wrapper.find('#char-field-heading-font');
		await headingInput.trigger('focus');
		const headingListbox = wrapper.find('#char-field-heading-font-listbox');
		const clashOpt = headingListbox.findAll('[role="option"]').find((o) => o.text().includes('Clash Display'));
		expect(clashOpt).toBeDefined();
		expect(clashOpt!.text()).toContain('URL');
		await clashOpt!.trigger('mousedown');
		expect(character.view.theme.fonts.heading).toBe('Clash Display');
		expect(document.head.querySelector('#gfont-clash-display')).toBeNull();

		// Pasting an HTTPS URL directly into a FontPicker combobox and pressing Enter registers & applies it
		const bodyInput = wrapper.find('#char-field-body-font');
		await bodyInput.trigger('focus');
		await bodyInput.setValue('https://fonts.bunny.net/css?family=alegreya:400,700');
		await bodyInput.trigger('keydown', { key: 'Enter', isComposing: false });
		expect(character.view.theme.fonts.primary).toBe('Alegreya');
		expect(character.view.customFonts.some((f: any) => f.name === 'Alegreya')).toBe(true);

		await runAxeAudit(wrapper.element as HTMLElement);

		// Removing Clash Display removes view.customFonts entry, head <link>, and resets Heading Font slot
		const removeClashBtn = wrapper.find('button[aria-label="Remove external font Clash Display"]');
		await removeClashBtn.trigger('click');
		expect(character.view.customFonts.some((f: any) => f.name === 'Clash Display')).toBe(false);
		expect(document.head.querySelector('#cfont-clash-display')).toBeNull();
		expect(character.view.theme.fonts.heading).toBeUndefined();

		wrapper.unmount();
		document.head
			.querySelectorAll('style[id^="cfont-"], link[id^="cfont-"], link[id^="gfont-"]')
			.forEach((el) => el.remove());
	});

	it('normalizes frame.size and emits --portrait-size on TraitSetBlock for The Architect vs The Dreamer', () => {
		expect(normalizeRingSize(50)).toBe(80);
		expect(normalizeRingSize(600)).toBe(520);
		expect(normalizeRingSize(289.6)).toBe(290);
		expect(normalizeRingSize('bad')).toBeUndefined();
		expect(normalizeRingSize(null)).toBeUndefined();

		const character = structuredClone(DREAMER_ARCHITECT_SHOWCASE.character) as any;
		const architectIdx = character.traitSets.findIndex((s: any) => s.name === 'The Architect');
		const dreamerIdx = character.traitSets.findIndex((s: any) => s.name === 'The Dreamer');
		expect(resolveFrame(character.traitSets[architectIdx])?.size).toBe(190);
		expect(resolveFrame(character.traitSets[dreamerIdx])?.size).toBe(290);

		const architectBlock = mount(TraitSetBlock, {
			props: { character, traitSetID: architectIdx, submode: 'edit', editing: [] },
		});
		expect((architectBlock.element as HTMLElement).style.getPropertyValue('--portrait-size')).toBe('11.875rem');
		architectBlock.unmount();

		const dreamerBlock = mount(TraitSetBlock, {
			props: { character, traitSetID: dreamerIdx, submode: 'edit', editing: [] },
		});
		expect((dreamerBlock.element as HTMLElement).style.getPropertyValue('--portrait-size')).toBe('18.125rem');
		dreamerBlock.unmount();
	});

	it('exposes Portrait Size, Portrait Position, Bookmark vs .editor-close, filled/unfilled die chips, and passes axe-core in TraitSetEditor', async () => {
		const character = structuredClone(DREAMER_ARCHITECT_SHOWCASE.character) as any;
		const dreamerIdx = character.traitSets.findIndex((s: any) => s.name === 'The Dreamer');

		const wrapper = mount(TraitSetEditor, {
			props: { character, traitSetID: dreamerIdx, open: true },
		});

		// Bookmark action stays separate from .editor-close so studio panel hides only Close
		const bookmarkBtn = wrapper.find(
			'.editor-controls button[aria-label*="Bookmark"], .editor-controls button[aria-label*="Preset"]',
		);
		const closeBtn = wrapper.find('.editor-controls button.editor-close');
		expect(bookmarkBtn.exists()).toBe(true);
		expect(bookmarkBtn.classes()).not.toContain('editor-close');
		expect(closeBtn.exists()).toBe(true);

		// Range and Single Die chips expose aria-pressed, omit redundant d4-d12 text, and render filled/unfilled SVGs
		const rangeBtns = wrapper.findAll('.editor-field .rating-scale-chips button[aria-pressed]');
		expect(rangeBtns.length).toBeGreaterThanOrEqual(6);
		const d4Include = wrapper.find('button[aria-label$=" d4"]');
		expect(d4Include.attributes('aria-pressed')).toBe('true');
		expect(d4Include.text()).not.toContain('d4');
		expect(d4Include.find('.diecon-filled').exists()).toBe(true);

		await d4Include.trigger('click');
		expect(d4Include.attributes('aria-pressed')).toBe('false');
		expect(d4Include.find('.diecon-unfilled').exists()).toBe(true);

		// Portrait Size slider updates view.frame.size and Auto resets it
		const sizeInput = wrapper.find('input[type="range"][aria-label="Portrait Size"]');
		expect(sizeInput.exists()).toBe(true);
		await sizeInput.setValue('310');
		await sizeInput.trigger('input');
		expect(character.traitSets[dreamerIdx].view.frame.size).toBe(310);

		const autoResetBtn = wrapper.find('button[aria-label="Reset portrait size"]');
		expect(autoResetBtn.exists()).toBe(true);
		await autoResetBtn.trigger('click');
		expect(character.traitSets[dreamerIdx].view.frame.size).toBeUndefined();

		// Portrait Position switches between Left, Center, Right with aria-pressed
		const ringPosField = wrapper
			.findAll('.editor-field')
			.find((f) => f.find('.editor-label').exists() && f.find('.editor-label').text().trim() === 'Portrait Position');
		expect(ringPosField).toBeDefined();
		const posButtons = ringPosField!.findAll('.editor-group-btn');
		const leftPosBtn = posButtons.find((b) => b.text().trim() === 'Left');
		const centerPosBtn = posButtons.find((b) => b.text().trim() === 'Center');
		const rightPosBtn = posButtons.find((b) => b.text().trim() === 'Right');
		expect(leftPosBtn).toBeDefined();
		expect(centerPosBtn).toBeDefined();
		expect(rightPosBtn?.attributes('aria-pressed')).toBe('true');
		await centerPosBtn!.trigger('click');
		expect(character.traitSets[dreamerIdx].view.frame.position).toBe('center');
		expect(centerPosBtn!.attributes('aria-pressed')).toBe('true');
		await leftPosBtn!.trigger('click');
		expect(character.traitSets[dreamerIdx].view.frame.position).toBeUndefined();
		expect(leftPosBtn!.attributes('aria-pressed')).toBe('true');

		await runAxeAudit(wrapper.element as HTMLElement);
		wrapper.unmount();
	});

	it('renders multi-die pool tray, compact rows, and portrait ring controls on The Architect', async () => {
		const character = structuredClone(DREAMER_ARCHITECT_SHOWCASE.character) as any;
		const architectIdx = character.traitSets.findIndex((s: any) => s.name === 'The Architect');
		const wrapper = mount(TraitSetEditor, {
			props: { character, traitSetID: architectIdx, open: true, viewY: 0 },
		});

		expect(wrapper.findAll('.editor-die-steppers .die-stepper-item').length).toBeGreaterThanOrEqual(5);
		expect(wrapper.findAll('.multidie-chip').length).toBe(3);
		expect(wrapper.text()).toContain('Pool (3)');

		const subtraitBtn = wrapper.findAll('button.editor-button').find((b) => b.text().includes('Create subtrait'));
		expect(subtraitBtn).toBeDefined();

		const optionChecks = wrapper.findAll('.editor-checkbox-row input[type="checkbox"]');
		expect(optionChecks.length).toBeGreaterThanOrEqual(3);

		const printSlotsInput = wrapper.find('input[aria-label="Reserved slots for print"]');
		expect(printSlotsInput.exists()).toBe(true);
		const printSlotsRow = wrapper
			.findAll('.editor-row-between')
			.find((r) => r.find('label').exists() && r.find('label').text().trim() === 'Print Slots');
		expect(printSlotsRow).toBeDefined();

		const hitchesRow = wrapper
			.findAll('.editor-row-between')
			.find((r) => r.find('label').exists() && r.find('label').text().trim() === 'Hitches on');
		expect(hitchesRow).toBeDefined();
		expect(hitchesRow!.find('input[aria-label="Hitches on"]').exists()).toBe(true);

		await runAxeAudit(wrapper.element as HTMLElement);
		wrapper.unmount();
	});
});
