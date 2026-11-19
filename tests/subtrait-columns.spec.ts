import { describe, it, expect } from 'vitest';
import { reactive } from 'vue';
import { mount } from '@vue/test-utils';
import axe from 'axe-core';
import TraitSetBlock from '../js/trait-set-block.vue';
import { materializeCharacter } from '../js/layered-materialize.ts';
import type { Character, TraitSet } from '../js/model.ts';
import kitchenSinkRaw from '../data/templates/kitchen-sink.template.layered.json';
import retiredCrystallineRaw from '../data/templates/retired-crystalline.template.layered.json';
import alienUsRaw from '../data/templates/alien-us.template.layered.json';
import solarpunkCitizenRaw from '../data/templates/solarpunk-citizen.template.layered.json';

function materializeTemplateChar(raw: { character: Record<string, unknown> }): Character {
	return reactive(materializeCharacter(raw.character) as unknown as Character) as Character;
}

function findSetIndex(character: Character, predicate: (set: TraitSet) => boolean): number {
	return (character.traitSets || []).findIndex(predicate);
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
			expect.fail(`Axe Violations:\n\n${summary}`);
		}
	} finally {
		if (container.parentNode === document.body) {
			document.body.removeChild(container);
		}
	}
}

describe('subtrait-columns layout, connectors & print parity', () => {
	it('renders 3-cell .branch-head and distinguishes multi / single / none connectors on Kitchen Sink', async () => {
		const character = materializeTemplateChar(kitchenSinkRaw as { character: Record<string, unknown> });
		const s = findSetIndex(character, (set) => set.id === 'ks-subtrait-columns');
		expect(s).toBeGreaterThanOrEqual(0);

		const wrapper = mount(TraitSetBlock, {
			props: { character, traitSetID: s, submode: 'play', editing: [], printBlank: false },
		});

		const headChildren = wrapper.findAll('.branch-head > span');
		expect(headChildren.map((el) => el.attributes('class'))).toEqual([
			'branch-head-col',
			'branch-head-gutter',
			'branch-head-col',
		]);

		const rows = wrapper.findAll('.branch-row');
		expect(rows.length).toBe(3);

		// Engineering: 2 subtraits -> multi
		expect(rows[0].find('.branch-link').classes()).toContain('branch-conn-multi');
		expect(rows[0].find('.branch-side').classes()).toContain('branch-side-multi');
		expect(rows[0].findAll('.branch-slot-conn').length).toBe(2);

		// Navigation: 1 subtrait -> single
		expect(rows[1].find('.branch-link').classes()).toContain('branch-conn-single');
		expect(rows[1].find('.branch-side').classes()).toContain('branch-side-single');
		expect(rows[1].findAll('.branch-slot-conn').length).toBe(1);

		// Diplomacy: 0 subtraits -> none
		expect(rows[2].find('.branch-link').classes()).toContain('branch-conn-none');
		expect(rows[2].find('.branch-side').classes()).toContain('branch-side-none');
		expect(rows[2].findAll('.branch-slot-conn').length).toBe(0);

		await runAxeAudit(wrapper.element as HTMLElement);
		wrapper.unmount();
	});

	it('renders .branch-slot-blank with conn-none in print mode and preserves fixed names on printBlank', () => {
		const character = materializeTemplateChar(retiredCrystallineRaw as { character: Record<string, unknown> });
		const s = findSetIndex(character, (set) => set.view?.style?.body === 'subtrait-columns');
		expect(s).toBeGreaterThanOrEqual(0);

		const flyTrait = (character.traitSets[s].traits || []).find((t) => t.name === 'Fly');
		expect(flyTrait).toBeDefined();
		flyTrait!.traits = [{ name: 'Roc', rating: { type: 'Die', value: [8], range: [8, 10, 12] } }];

		const printFilled = mount(TraitSetBlock, {
			props: { character, traitSetID: s, submode: 'print', editing: [], printBlank: false },
		});

		expect(printFilled.find('.trait-subtrait-columns').classes()).not.toContain('branch-fixed-names');
		const filledRows = printFilled.findAll('.branch-row');
		const craftRow = filledRows.find((r) => r.text().includes('Craft'));
		const flyRow = filledRows.find((r) => r.text().includes('Fly'));
		expect(craftRow).toBeDefined();
		expect(flyRow).toBeDefined();

		expect(craftRow!.find('.branch-link').classes()).toContain('branch-conn-none');
		expect(craftRow!.findAll('.branch-slot.branch-slot-blank').length).toBe(1);
		expect(craftRow!.findAll('.branch-slot-conn').length).toBe(0);

		expect(flyRow!.find('.branch-link').classes()).toContain('branch-conn-single');
		expect(flyRow!.find('.branch-slot').text()).toContain('Roc');
		expect(flyRow!.findAll('.branch-slot-conn').length).toBe(1);
		printFilled.unmount();

		const printBlank = mount(TraitSetBlock, {
			props: { character, traitSetID: s, submode: 'print', editing: [], printBlank: true },
		});
		const blankText = printBlank.text();
		expect(blankText).toContain('Craft');
		expect(blankText).toContain('Fly');
		expect(blankText).not.toContain('Roc');
		expect(printBlank.findAll('.branch-slot-conn').length).toBe(0);
		expect(printBlank.findAll('.branch-conn-single, .branch-conn-multi').length).toBe(0);
		expect(printBlank.findAll('.branch-slot.branch-slot-blank').length).toBe(filledRows.length);
		printBlank.unmount();
	});

	it('renders 5-track split grid on Alien, Us with symmetric gutters and respects view.branch', async () => {
		const character = materializeTemplateChar(alienUsRaw as { character: Record<string, unknown> });
		const s = findSetIndex(character, (set) => set.view?.style?.body === 'subtrait-columns');
		expect(s).toBeGreaterThanOrEqual(0);

		const targetSet = character.traitSets[s];
		targetSet.view = { ...(targetSet.view || {}), branch: { left: 2, center: 1, right: 2 } };

		// Pre-seeded empty specialty entries alongside a rated right-side specialty
		const traits = targetSet.traits;
		traits[0].traits = [
			{ name: '', view: { branchSide: 'left' } },
			{ name: '', view: { branchSide: 'right' } },
		];
		traits[1].traits = [
			{ name: 'Debate', rating: { type: 'Die', value: [8], range: [8, 10, 12] }, view: { branchSide: 'right' } },
		];

		const wrapper = mount(TraitSetBlock, {
			props: { character, traitSetID: s, submode: 'print', editing: [], printBlank: false },
		});

		const splitHead = wrapper.find('.branch-head.branch-split-head');
		expect(splitHead.exists()).toBe(true);
		expect(splitHead.element.children.length).toBe(5);
		expect(splitHead.attributes('style')).toContain('--branch-split-left: minmax(0, 2fr)');
		expect(splitHead.attributes('style')).toContain('--branch-split-center: minmax(0, 1fr)');
		expect(splitHead.attributes('style')).toContain('--branch-split-right: minmax(0, 2fr)');

		const splitRow = wrapper.find('.branch-row.branch-split-row');
		expect(splitRow.exists()).toBe(true);
		expect(splitRow.element.children.length).toBe(5);
		expect(splitRow.attributes('style')).toContain('--branch-split-left: minmax(0, 2fr)');
		expect(splitRow.attributes('style')).toContain('--branch-split-center: minmax(0, 1fr)');
		expect(splitRow.attributes('style')).toContain('--branch-split-right: minmax(0, 2fr)');

		// Filled specialty on Chat emits an arrow connector; empty slots never emit one
		expect(wrapper.findAll('.branch-slot-conn').length).toBe(1);
		for (const slot of wrapper.findAll('.branch-slot')) {
			const hasName = Boolean(slot.find('.subtrait-name').text().trim());
			if (!hasName) {
				expect(slot.find('.branch-slot-conn').exists()).toBe(false);
			}
		}

		await runAxeAudit(wrapper.element as HTMLElement);
		wrapper.unmount();
	});

	it('renders Solarpunk Citizen flank layout with left -> center -> right DOM order and header d6', async () => {
		const character = materializeTemplateChar(solarpunkCitizenRaw as { character: Record<string, unknown> });
		const s = findSetIndex(character, (set) => set.view?.style?.body === 'subtrait-columns');
		expect(s).toBeGreaterThanOrEqual(0);

		const wrapper = mount(TraitSetBlock, {
			props: { character, traitSetID: s, submode: 'play', editing: [], printBlank: false },
		});

		const flankHead = wrapper.find('.branch-head.branch-flank-head');
		expect(flankHead.exists()).toBe(true);
		expect(flankHead.find('.branch-head-center .set-rating-die').exists()).toBe(true);

		const grid = wrapper.find('.branch-flank-grid');
		expect(grid.exists()).toBe(true);
		const colClasses = Array.from(grid.element.children).map((el) => el.className);
		expect(colClasses[0]).toContain('branch-flank-col-left');
		expect(colClasses[1]).toContain('branch-flank-center');
		expect(colClasses[2]).toContain('branch-flank-col-right');

		await runAxeAudit(wrapper.element as HTMLElement);
		wrapper.unmount();
	});

	it('enforces 1.5rem screen die scale floor and mobile single-column sheet override order', async () => {
		const fsMod = 'node:fs';
		const pathMod = 'node:path';
		const { readFileSync } = await import(/* @vite-ignore */ fsMod);
		const { resolve } = await import(/* @vite-ignore */ pathMod);
		const variantsCss: string = readFileSync(resolve('css/variants.css'), 'utf8');
		const subtraitBlock = variantsCss.slice(
			variantsCss.indexOf('.trait-set-style-subtrait-columns {'),
			variantsCss.indexOf('/* TALENTS TABLE'),
		);
		expect(subtraitBlock).toContain('--diecon-scale-size: 1.5rem;');
		expect(subtraitBlock).not.toContain('--diecon-scale-size: 1rem;');
		expect(subtraitBlock).not.toContain('font-size: 0.65rem;');
		expect(subtraitBlock).toContain('container-name: subtrait-col subtrait-screen;');
		expect(subtraitBlock).toContain('@container subtrait-screen (max-width: 32rem)');
		expect(subtraitBlock).toContain('@container subtrait-screen (max-width: 26rem)');

		const printCss = readFileSync(resolve('css/print.css'), 'utf8');
		const desktopGridRule = '.classic-grid-sections .columns.sheet-columns.sheet-grid';
		const mobileOverrideRule =
			'.character-sheet:not(.submode-print) .classic-grid-sections > .columns.sheet-columns.sheet-grid';
		const desktopIdx = printCss.lastIndexOf(desktopGridRule);
		const mobileIdx = printCss.indexOf(mobileOverrideRule);
		expect(desktopIdx).toBeGreaterThan(0);
		expect(mobileIdx).toBeGreaterThan(desktopIdx);
		expect(printCss.slice(mobileIdx, mobileIdx + 220)).toContain('display: flex');
		expect(printCss.slice(mobileIdx, mobileIdx + 450)).toContain('flex: 0 0 auto;');
	});
});
