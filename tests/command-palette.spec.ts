import { describe, it, expect, beforeAll } from 'vitest';
import { mount } from '@vue/test-utils';
import axe from 'axe-core';
import CommandPalette from '../js/command-palette.vue';

beforeAll(() => {
	if (typeof HTMLDialogElement !== 'undefined') {
		if (!HTMLDialogElement.prototype.showModal) {
			HTMLDialogElement.prototype.showModal = function () {
				this.setAttribute('open', '');
			};
		}
		if (!HTMLDialogElement.prototype.close) {
			HTMLDialogElement.prototype.close = function () {
				this.removeAttribute('open');
			};
		}
	}
});

function sampleCharacter() {
	return {
		id: 'char-1',
		name: 'Dreamer & Architect',
		game: 'Showcase',
		tags: ['showcase', 'hero'],
		traitSets: [
			{
				id: 'name',
				name: 'Identity',
				view: { style: { body: 'name' } },
				traits: [],
			},
			{
				id: 'distinctions',
				name: 'Distinctions',
				noun: 'Distinction',
				tags: ['core'],
				traits: [
					{
						id: 'd1',
						name: 'Function Before Form',
						rating: { type: 'Die', value: [8], range: [4, 6, 8, 10, 12] },
						description: 'Methodical craft above ornament.',
						tags: ['craft'],
						traits: [
							{
								name: 'Measure Twice',
								noun: 'SFX',
								description: 'Step up a die when drafting or planning.',
								tags: ['planning'],
							},
							{
								name: 'Hinder',
								noun: 'SFX',
								rating: { type: 'Die', value: [4], range: [4] },
								ppDelta: 1,
								description: 'Gain a PP when you step down this Distinction to a d4.',
							},
						],
					},
				],
			},
			{
				id: 'values',
				name: 'Values',
				noun: 'Value',
				traits: [
					{
						id: 'v1',
						name: 'Data',
						rating: { type: 'Die', value: [8], range: [4, 6, 8, 10, 12] },
						description: 'Belongs to the people, not the builders.',
						tags: ['truth'],
						traits: [],
					},
				],
			},
		],
	};
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

describe('CommandPalette', () => {
	it('indexes traits, searches SFX prose, and filters by #tag', async () => {
		const ch = sampleCharacter();
		const wrapper = mount(CommandPalette, {
			props: {
				open: true,
				character: ch,
				characters: [ch],
				mode: 'character',
				submode: 'play',
				activePoolSide: 'player',
				playerPoolCount: 0,
				oppositionPoolCount: 0,
				isDarkMode: false,
			},
		});

		const input = wrapper.find('#command-palette-input');
		expect(input.exists()).toBe(true);

		// SFX prose search ("drafting")
		await input.setValue('drafting');
		const optionsAfterProse = wrapper.findAll('[role="option"]');
		expect(optionsAfterProse.length).toBeGreaterThanOrEqual(1);
		expect(optionsAfterProse[0].text()).toContain('Measure Twice');

		// #tag filtering ("#truth")
		await input.setValue('#truth');
		const optionsAfterTag = wrapper.findAll('[role="option"]');
		expect(optionsAfterTag.length).toBe(1);
		expect(optionsAfterTag[0].text()).toContain('Data');

		wrapper.unmount();
	});

	it('stages dice in Play mode with Enter, Shift+Enter, Alt+P, and Hinder d4', async () => {
		const ch = sampleCharacter();
		const wrapper = mount(CommandPalette, {
			props: {
				open: true,
				character: ch,
				characters: [ch],
				mode: 'character',
				submode: 'play',
				activePoolSide: 'player',
				playerPoolCount: 0,
				oppositionPoolCount: 0,
				isDarkMode: false,
			},
		});

		const input = wrapper.find('#command-palette-input');

		// Shift+Enter stages without closing
		await input.setValue('Data');
		await input.trigger('keydown', { key: 'Enter', shiftKey: true });
		expect(wrapper.emitted('addDie')?.[0]?.[0]).toMatchObject({ size: 8, source: 'Data' });
		expect(wrapper.emitted('close')).toBeFalsy();

		// Alt+P emits togglePoolSide
		await input.trigger('keydown', { key: 'p', altKey: true });
		expect(wrapper.emitted('togglePoolSide')?.length).toBe(1);

		// Hinder SFX Enter stages d4 with ppDelta: 1 and closes
		await input.setValue('Hinder');
		await input.trigger('keydown', { key: 'Enter' });
		expect(wrapper.emitted('addDie')?.[1]?.[0]).toMatchObject({
			size: 4,
			source: 'Function Before Form (Hinder)',
			ppDelta: 1,
			ppCommitted: false,
		});
		expect(wrapper.emitted('close')?.length).toBe(1);

		wrapper.unmount();
	});

	it('selects traits in Edit mode and passes axe-core WCAG 2.2 AA with 0 violations', async () => {
		const ch = sampleCharacter();
		const wrapper = mount(CommandPalette, {
			props: {
				open: true,
				character: ch,
				characters: [ch],
				mode: 'character',
				submode: 'edit',
				activePoolSide: 'player',
				playerPoolCount: 0,
				oppositionPoolCount: 0,
				isDarkMode: false,
			},
		});

		const input = wrapper.find('#command-palette-input');
		await input.setValue('Function Before Form');
		await input.trigger('keydown', { key: 'Enter' });
		expect(wrapper.emitted('selectElement')?.[0]?.[0]).toEqual(['trait', 1, 0]);
		expect(wrapper.emitted('close')?.length).toBe(1);

		await input.setValue('');
		await runAxeAudit(wrapper.element as HTMLElement);

		wrapper.unmount();
	});
});
