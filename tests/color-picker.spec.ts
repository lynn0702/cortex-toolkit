import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import axe from 'axe-core';
import ColorPicker from '../js/color-picker.vue';
import NameEditor from '../js/name-editor.vue';
import TraitSetBlock from '../js/trait-set-block.vue';
import TraitSetFrame from '../js/trait-set-frame.vue';
import TraitEditor from '../js/trait-editor.vue';
import {
	CURIO_PALETTE,
	DICE_PRESETS,
	SHEET_THEME_PRESETS,
	getCharacterColorTokens,
	resolveFrameColorPresentation,
} from '../js/color-palette.ts';
import { VANGUARD_FRAME_SHOWCASE } from '../js/showcase-templates.ts';

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
		for (const p of DICE_PRESETS) {
			expect(p.name).not.toMatch(bannedAiPhrases);
		}
		for (const p of SHEET_THEME_PRESETS) {
			expect(p.name).not.toMatch(bannedAiPhrases);
		}

		const character = cloneSampleCharacter();
		const wrapper = mount(NameEditor, {
			props: { character, open: true, tab: 'theme' },
		});

		expect(wrapper.text()).not.toMatch(bannedAiPhrases);
		expect(wrapper.find('#char-primary-color-picker').exists()).toBe(true);
		expect(wrapper.find('#char-accent-color-picker').exists()).toBe(true);
		expect(wrapper.find('#char-secondary-color-picker').exists()).toBe(true);
		expect(wrapper.find('#char-field-dice-unfilled-border-picker').exists()).toBe(true);
		expect(wrapper.find('#char-field-dice-unfilled-numeral-picker').exists()).toBe(true);

		await wrapper.findAll('.sheet-palette-btn')[1].trigger('click');
		expect(character.view.primaryColor).toBe(SHEET_THEME_PRESETS[1].primary);
		expect(character.view.accentColor).toBe(SHEET_THEME_PRESETS[1].accent);
		expect(character.view.secondaryColor).toBe(SHEET_THEME_PRESETS[1].secondary);

		const matchBtn = wrapper.findAll('button').find((b) => b.text().includes('Match Sheet'));
		expect(matchBtn).toBeDefined();
		await matchBtn!.trigger('click');
		expect(character.view.diceConfig.backgroundColor1).toBe(SHEET_THEME_PRESETS[1].primary);

		const unfilledHex = wrapper.find('#char-field-dice-unfilled-border-hex');
		await unfilledHex.setValue('#be123c');
		await unfilledHex.trigger('change');
		expect(character.view.diceConfig.unfilledBorder).toBe('#be123c');

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
});
