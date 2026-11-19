import { describe, it, expect, vi } from 'vitest';
import { defineComponent, h, nextTick, reactive, ref } from 'vue';
import { flushPromises, mount } from '@vue/test-utils';
import axe from 'axe-core';
import TraitSetBlock from '../js/trait-set-block.vue';
import DiceRoller from '../js/dice-roller.vue';
import TraitEditor from '../js/trait-editor.vue';
import TraitSetEditor from '../js/trait-set-editor.vue';
import AppHeader from '../js/app-header.vue';
import AppFooter from '../js/app-footer.vue';
import SessionNav from '../js/session-nav.vue';
import StudioPanel from '../js/studio-panel.vue';
import Character from '../js/character.vue';
import TraitSetMini from '../js/trait-set-mini.vue';
import PageLayoutMini from '../js/page-layout-mini.vue';
import CuriosityWebBar from '../js/curiosity-web-bar.vue';
import { CURIOSITY_GRAPH_KEY } from '../js/curiosity-graph.ts';
import { resolveFrame, computeFrameAnchors, buildFrameSvgPath } from '../js/frame-geometry.ts';
import { characterCurioFunctions, characterCurioSetPresets } from '../js/functions.ts';
import { dicePool, type DicePool } from '../js/dice-pool.ts';
import { useTraitSet, type TraitSetProps } from '../js/use-trait-set.ts';
import type { Character as CharacterModel, FrameShape, Trait, TraitSet } from '../js/model.ts';
import { makeCharacter, makePool, makeTrait, makeTraitSet } from './fixtures.ts';

// 1. Axe-core runner configured for JSDOM / Component testing
async function runAxeAudit(container: HTMLElement) {
	// Attach to document.body briefly so axe-core can resolve aria-labelledby / document context accurately
	document.body.appendChild(container);
	try {
		const results = await axe.run(container, {
			rules: {
				// JSDOM cannot compute real canvas/layout contrast; all structural & ARIA rules remain strictly enforced
				'color-contrast': { enabled: false },
				region: { enabled: false },
				// Critical interactive & ARIA rules
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

// 2. LLM DOM Semantics Contract Assertions
function assertLlmDomSemantics(container: HTMLElement) {
	// A. Trait Set landmark & data-set-index contract
	const sets = container.matches?.('.trait-set') ? [container] : Array.from(container.querySelectorAll('.trait-set'));
	expect(sets.length).toBeGreaterThan(0);
	sets.forEach((setEl) => {
		expect(setEl.getAttribute('data-set-index')).not.toBeNull();
		const label = setEl.getAttribute('aria-label') || setEl.getAttribute('data-set-name');
		expect(label?.trim().length, 'Every .trait-set must expose aria-label or data-set-name').toBeGreaterThan(0);
	});

	// B. Self-describing trait rows
	const traits = container.matches?.('.trait:not(.trait-placeholder-slot)')
		? [container]
		: Array.from(container.querySelectorAll('.trait:not(.trait-placeholder-slot)'));
	traits.forEach((traitEl) => {
		const name = traitEl.getAttribute('data-trait-name');
		expect(name?.trim().length, 'Rendered non-blank traits must expose data-trait-name').toBeGreaterThan(0);
	});

	// C. Zero nested interactive controls (hard check backing up axe)
	const nestedButtons = container.querySelectorAll(
		'[role="button"] [role="button"], [role="button"] button, button [role="button"], button button, [role="button"] [role="checkbox"], button [role="checkbox"]',
	);
	expect(
		nestedButtons.length,
		`Found nested interactive elements: ${Array.from(nestedButtons)
			.map((el) => el.outerHTML)
			.join(', ')}`,
	).toBe(0);

	// D. Interactive die controls must have accessible names
	const interactiveDice = container.querySelectorAll('.c[role="button"], button.c');
	interactiveDice.forEach((dieEl) => {
		const label = dieEl.getAttribute('aria-label') || dieEl.getAttribute('title');
		expect(label?.trim().length, `Interactive die glyph missing aria-label: ${dieEl.outerHTML}`).toBeGreaterThan(0);
	});
}

// 3. Fixture: Representative Character covering Rated Traits, Statements/Pips, Stress, Multi-Die Pools, and Play-Only Sets
function createTestCharacter(): CharacterModel {
	return makeCharacter({
		name: 'Valerie Vance',
		plotPoints: 2,
		traitSets: [
			makeTraitSet({
				name: 'Attributes',
				noun: 'Attribute',
				view: { pillar: 'prime', style: { body: 'default' } },
				traits: [
					{
						name: 'Agility',
						rating: { type: 'Die', value: [8], range: [4, 6, 8, 10, 12] },
						description: '',
						traits: [],
						tags: [],
						custom: {},
					},
					{
						name: 'Awareness',
						rating: { type: 'Die', value: [10], range: [4, 6, 8, 10, 12] },
						description: '',
						traits: [],
						tags: [],
						custom: {},
					},
				],
			}),
			makeTraitSet({
				name: 'Values',
				noun: 'Value',
				view: { pillar: 'prime' },
				traits: [
					{
						name: 'Justice',
						rating: { type: 'Die', value: [8], range: [4, 6, 8, 10, 12] },
						traits: [
							{
								name: 'No one gets left behind.',
								rating: { type: 'Pip', value: [true] },
							},
						],
						tags: [],
					},
				],
			}),
			makeTraitSet({
				name: 'Stress',
				noun: 'Stress',
				view: { pillar: 'play', style: { body: 'stress' }, outIndicator: true },
				traits: [
					{
						name: 'Physical',
						rating: { type: 'Die', value: [6], range: [4, 6, 8, 10, 12], out: true },
						isOut: false,
						traits: [],
						tags: [],
						custom: {},
					},
				],
			}),
			makeTraitSet({
				name: 'XP Milestone',
				noun: 'XP',
				rating: { type: 'Pip', value: [true, true, false, false, false], range: [5] },
				view: { pillar: 'plus', style: { body: 'pips' }, pips: { perRow: 5, connected: true, labels: false } },
				traits: [],
			}),
		],
	});
}

describe('WCAG 2.2 AA, WAI-ARIA 1.2, & LLM Semantics Suite', () => {
	it('audits TraitSetBlock across Edit and Play submodes with zero violations', async () => {
		const character = createTestCharacter();

		for (const submode of ['edit', 'play'] as const) {
			for (let s = 0; s < character.traitSets.length; s++) {
				const wrapper = mount(TraitSetBlock, {
					props: {
						character,
						traitSetID: s,
						submode,
						editing: [],
					},
				});

				await runAxeAudit(wrapper.element as HTMLElement);

				if (submode === 'play') {
					assertLlmDomSemantics(wrapper.element as HTMLElement);
				}
				wrapper.unmount();
			}
		}
	});

	it('verifies Pip Tracks expose spinbutton/checkbox ARIA roles and suppress 25-tab-stop traps in Play Mode', async () => {
		const character = createTestCharacter();
		const wrapper = mount(TraitSetBlock, {
			props: {
				character,
				traitSetID: 3, // XP Milestone pips set
				submode: 'play',
				editing: [],
			},
		});

		await runAxeAudit(wrapper.element as HTMLElement);

		const stepper = wrapper.element.querySelector('[role="spinbutton"], [role="slider"]');
		expect(stepper, 'Pure pip tracks must expose role="spinbutton" or role="slider" in Play Mode').not.toBeNull();
		expect(stepper?.getAttribute('aria-valuenow')).toBe('2');
		expect(stepper?.getAttribute('aria-valuemax')).toBe('5');
		wrapper.unmount();
	});

	it('audits DiceRoller staged chips and live-region output for screen readers & LLM scrapers', async () => {
		const mockPool = makePool([
			{ id: 'd1', size: 8, qty: 1, source: 'Agility', hitches: 1 },
			{ id: 'd2', size: 4, qty: 1, source: 'Distinction', hitches: 1, ppDelta: 1 },
		]);

		const wrapper = mount(DiceRoller, {
			props: {
				open: true,
				pool: mockPool,
				position: 'right',
			},
		});

		await runAxeAudit(wrapper.element as HTMLElement);

		const chips = wrapper.element.querySelectorAll('.roller-chip');
		expect(chips.length).toBe(2);
		expect(chips[0].getAttribute('data-die-size')).toBe('8');
		expect(chips[0].getAttribute('data-die-source')).toBe('Agility');

		// Trigger a roll and verify aria-live region updates
		const rollBtn = wrapper.find('.roller-roll-btn');
		if (rollBtn.exists()) {
			await rollBtn.trigger('click');
			const liveRegion = wrapper.element.querySelector('[aria-live="polite"]');
			expect(liveRegion, 'DiceRoller must include an aria-live="polite" status/output region').not.toBeNull();
			expect(liveRegion?.textContent?.trim().length).toBeGreaterThan(0);
		}

		wrapper.unmount();
	});

	it('DiceRoller Word Bank + Scale increments Keep and + Trait pre-search supports Dreamer traits, hinder, and shorthand', async () => {
		const raw = (await import('../data/templates/Dreamer_Architect.curio.json')).default;
		const dreamer = reactive(structuredClone(raw) as unknown as CharacterModel);
		const pool = new dicePool.DicePool();
		const wrapper = mount(DiceRoller, {
			props: {
				open: true,
				pool,
				character: dreamer,
			},
			attrs: {
				onSettlePP: (delta: number) => {
					dreamer.plotPoints = Math.max(0, (dreamer.plotPoints || 0) + delta);
				},
			},
		});

		// + Scale adds word pill and increments Keep without staging a die
		expect(wrapper.find('#keepValue').text()).toBe('2');
		await wrapper.find('.wb-scale-btn').trigger('click');
		expect(wrapper.find('#keepValue').text()).toBe('3');
		expect(wrapper.findAll('.word-bank-list .trait-chip').map((w) => w.text())).toContain('Scale ×');
		expect(wrapper.findAll('.roller-chip').length).toBe(0);

		// + Trait opens pre-search popover listing Dreamer traits including The Architect (1d10 & 3d10) + Distinction hinder
		await wrapper.find('.wb-trait-btn').trigger('click');
		expect(wrapper.find('#traitInputContainer').exists()).toBe(true);
		const rowsText = wrapper.findAll('.presearch-row').map((r) => r.text());
		expect(rowsText.some((t) => t.includes('The Architect') && t.includes('1d10'))).toBe(true);
		expect(rowsText.some((t) => t.includes('The Architect') && t.includes('3d10'))).toBe(true);

		const hinderBtn = wrapper.find('.presearch-hinder-btn');
		expect(hinderBtn.exists()).toBe(true);
		await hinderBtn.trigger('click');
		expect(wrapper.findAll('.roller-chip').some((c) => c.attributes('data-die-size') === '4')).toBe(true);
		expect(wrapper.find('.pp-pending-tag').text()).toBe('+1');
		expect(wrapper.find('.word-bank-list').text()).toContain('(Hinder)');

		// Shorthand input "Strength d6" stages Word Bank pill + d6 die
		const input = wrapper.find('.trait-shorthand-input');
		await input.setValue('Strength d6');
		await wrapper.find('.trait-submit-btn').trigger('click');
		expect(wrapper.find('.word-bank-list').text()).toContain('Strength');
		expect(wrapper.findAll('.roller-chip').some((c) => c.attributes('data-die-size') === '6')).toBe(true);

		await runAxeAudit(wrapper.element as HTMLElement);
		for (const el of wrapper.element.querySelectorAll('button, .roller-chip, .trait-chip')) {
			expect(el.getAttribute('style')).toBeNull();
		}

		wrapper.unmount();
	});

	it('DiceRoller 4-button selected die bar mutates dice independently from Word Bank', async () => {
		const pool = new dicePool.DicePool();
		pool.add([{ size: 8, qty: 1, source: 'Data' }]);
		const wrapper = mount(DiceRoller, {
			props: {
				open: true,
				pool,
			},
		});

		expect(wrapper.findAll('.word-bank-list .trait-chip').length).toBe(1);
		await wrapper.find('.roller-chip').trigger('click');
		expect(wrapper.find('.pool-action-bar').exists()).toBe(true);

		// Step Up d8 -> d10, Duplicate, and Remove one die without touching Word Bank
		await wrapper.find('.pool-act-step-up').trigger('click');
		expect(wrapper.find('.roller-chip').attributes('data-die-size')).toBe('10');
		expect(wrapper.findAll('.word-bank-list .trait-chip').length).toBe(1);

		await wrapper.find('.pool-act-dup').trigger('click');
		expect(wrapper.findAll('.roller-chip').length).toBe(2);
		expect(wrapper.findAll('.word-bank-list .trait-chip').length).toBe(1);

		await wrapper.find('.pool-act-remove').trigger('click');
		expect(wrapper.findAll('.roller-chip').length).toBe(1);
		expect(wrapper.findAll('.word-bank-list .trait-chip').length).toBe(1);

		// Removing the Word Bank pill leaves staged dice intact
		await wrapper.find('.trait-chip-remove').trigger('click');
		expect(wrapper.findAll('.word-bank-list .trait-chip').length).toBe(0);
		expect(wrapper.findAll('.roller-chip').length).toBe(1);

		wrapper.unmount();
	});

	it('DiceRoller Dual-Pool Auto-Contest, PP spend, and Hitch activation audit cleanly', async () => {
		const character = reactive(makeCharacter({ plotPoints: 2, traitSets: [] }));
		const playerPool = new dicePool.DicePool();
		const oppPool = new dicePool.DicePool();
		playerPool.add([{ size: 8, qty: 2, source: 'Data' }]);
		oppPool.add([{ size: 8, qty: 2, source: 'Guard' }]);

		const wrapper = mount(DiceRoller, {
			props: {
				open: true,
				pool: playerPool,
				oppositionPool: oppPool,
				character,
			},
			attrs: {
				onSettlePP: (delta: number) => {
					character.plotPoints = Math.max(0, (character.plotPoints || 0) + delta);
				},
			},
		});

		// PP Spend bar: 1 PP: +1 Keep & 1 PP: +d6
		const spendBtns = wrapper.findAll('.pp-spend-btn');
		expect(spendBtns.length).toBe(2);
		await spendBtns[0].trigger('click');
		expect(character.plotPoints).toBe(1);
		expect(wrapper.find('#keepValue').text()).toBe('3');
		expect(wrapper.find('.word-bank-list').text()).toContain('PP: +1 Keep');

		await spendBtns[1].trigger('click');
		expect(character.plotPoints).toBe(0);
		expect(wrapper.find('.word-bank-list').text()).toContain('PP: +d6');
		expect(playerPool.items.length).toBe(3);

		// Auto-Contest label and deterministic hitch roll
		const rollBtn = wrapper.find('.roller-roll-btn');
		expect(rollBtn.text()).toContain('ROLL CONTEST');

		const randomSpy = vi.spyOn(Math, 'random').mockReturnValueOnce(0.0).mockReturnValue(0.85);
		try {
			await rollBtn.trigger('click');
		} finally {
			randomSpy.mockRestore();
		}

		expect(wrapper.find('.roller-inline-outcome .contest-banner').exists()).toBe(true);
		const playerHitchBtn = wrapper.find('.hitch-act-player');
		expect(playerHitchBtn.exists()).toBe(true);
		await playerHitchBtn.trigger('click');
		expect(character.plotPoints).toBe(1);
		expect(wrapper.find('.word-bank-list').text()).toContain('Complication');

		await runAxeAudit(wrapper.element as HTMLElement);
		wrapper.unmount();
	});

	it('DiceRoller persists Session Roll Log in localStorage, updates active entry on re-evaluation, and clears cleanly', async () => {
		localStorage.removeItem('characterCurioRollLog');
		const pool = new dicePool.DicePool();
		pool.add([
			{ size: 8, qty: 1, source: 'Agility' },
			{ size: 10, qty: 1, source: 'Design' },
			{ size: 6, qty: 1, source: 'Distinction' },
		]);
		const wrapper = mount(DiceRoller, {
			props: {
				open: true,
				pool,
				character: { id: 'log-tester', name: 'Log Tester', traitSets: [] },
			},
		});

		const rollBtn = wrapper.find('.roller-roll-btn');
		const randomSpy = vi.spyOn(Math, 'random').mockReturnValueOnce(0.8).mockReturnValueOnce(0.5).mockReturnValue(0.9);
		try {
			await rollBtn.trigger('click');
		} finally {
			randomSpy.mockRestore();
		}

		expect(wrapper.find('.roller-log-section').exists()).toBe(true);
		expect(wrapper.findAll('.roller-log-entry').length).toBe(1);
		const storedAfterRoll = JSON.parse(localStorage.getItem('characterCurioRollLog') || '[]');
		expect(storedAfterRoll.length).toBe(1);
		expect(storedAfterRoll[0].characterName).toBe('Log Tester');

		// Switch preset / re-evaluate active roll: updates active entry in place rather than duplicating
		const effectBtn = wrapper.findAll('.preset-btn').find((b) => /best effect/i.test(b.text()));
		if (effectBtn) {
			await effectBtn.trigger('click');
			expect(wrapper.findAll('.roller-log-entry').length).toBe(1);
		}

		await runAxeAudit(wrapper.element as HTMLElement);
		wrapper.unmount();

		// Remount restores persisted roll log and Clear Log empties storage
		const reloaded = mount(DiceRoller, {
			props: {
				open: true,
				pool: new dicePool.DicePool(),
				character: { id: 'log-tester', name: 'Log Tester', traitSets: [] },
			},
		});
		expect(reloaded.findAll('.roller-log-entry').length).toBe(1);
		await reloaded.find('button[aria-label="Clear roll log"]').trigger('click');
		expect(reloaded.find('.roller-log-section').exists()).toBe(false);
		expect(JSON.parse(localStorage.getItem('characterCurioRollLog') || '[]')).toEqual([]);
		reloaded.unmount();
	});

	it('audits Play-scoped TraitEditor for label immutability and zero structural leaks', async () => {
		const character = createTestCharacter();
		const wrapper = mount(TraitEditor, {
			props: {
				character,
				traitSetID: 0,
				traitID: 0,
				open: true,
				submode: 'play',
			},
		});

		await runAxeAudit(wrapper.element as HTMLElement);

		// In Play Mode on a standard Prime set (Attributes), structural controls must not render
		expect(wrapper.find('.rating-scale-container').exists()).toBe(false);
		expect(wrapper.find('.editor-copy').exists()).toBe(false);
		expect(wrapper.find('input[name="traitName"]').exists()).toBe(false);

		wrapper.unmount();
	});

	it('audits Dark Mode toggle buttons and verifies zero hardcoded inline styles in DiceRoller', async () => {
		// 1. Verify DiceRoller has no inline styles on Word Bank / Quick Add / Die buttons
		const roller = mount(DiceRoller, {
			props: {
				open: true,
				pool: new dicePool.DicePool(),
			},
		});
		const scaleBtn = roller.find('.wb-scale-btn');
		expect(scaleBtn.exists()).toBe(true);
		expect(scaleBtn.attributes('style')).toBeUndefined();

		const sepBtn = roller.find('.sep-mode-toggle');
		expect(sepBtn.exists()).toBe(true);
		expect(sepBtn.attributes('style')).toBeUndefined();

		const dieBtns = roller.findAll('.die-btn');
		expect(dieBtns.length).toBe(5);
		for (const btn of dieBtns) {
			expect(btn.attributes('style')).toBeUndefined();
		}

		roller.unmount();

		// 2. Verify AppHeader dark mode toggle button
		const header = mount(AppHeader, {
			props: {
				mode: 'character',
				submode: 'play',
				hasCharacter: true,
				canUndo: false,
				canRedo: false,
				isDarkMode: true,
			},
		});
		const headerThemeBtn = header.find('.header-btn-theme');
		expect(headerThemeBtn.exists()).toBe(true);
		expect(headerThemeBtn.attributes('aria-label')).toBe('Switch to light mode');
		await runAxeAudit(header.element as HTMLElement);
		header.unmount();

		// 3. Verify SessionNav does NOT render theme toggle (per spec: toggle is header-only)
		const sessionNav = mount(SessionNav, {
			props: {
				openCharacters: [{ id: 'char1', name: 'Test', traitSets: [] }],
				characterID: 'char1',
				submode: 'play',
				playViewMode: 'split',
			},
		});
		expect(sessionNav.find('.sheet-bar-theme-toggle').exists()).toBe(false);
		await runAxeAudit(sessionNav.element as HTMLElement);
		sessionNav.unmount();
	});

	it('enforces WCAG 2.2 AA Color Contrast (Criterion 1.4.3 & 1.4.11) across Dark and Light mode tokens', () => {
		// Standard W3C relative luminance calculation: https://www.w3.org/WAI/GL/wiki/Relative_luminance
		function getLuminance(hex: string): number {
			const cleanHex = hex.replace('#', '');
			const r = parseInt(cleanHex.slice(0, 2), 16) / 255;
			const g = parseInt(cleanHex.slice(2, 4), 16) / 255;
			const b = parseInt(cleanHex.slice(4, 6), 16) / 255;

			const srgbToLin = (c: number) => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
			return 0.2126 * srgbToLin(r) + 0.7152 * srgbToLin(g) + 0.0722 * srgbToLin(b);
		}

		// WCAG Contrast Ratio formula: (L1 + 0.05) / (L2 + 0.05)
		function getContrastRatio(fgHex: string, bgHex: string): number {
			const l1 = getLuminance(fgHex);
			const l2 = getLuminance(bgHex);
			const lighter = Math.max(l1, l2);
			const darker = Math.min(l1, l2);
			return (lighter + 0.05) / (darker + 0.05);
		}

		// Dark Mode Palette tokens defined in _frame.scss
		const darkCardBg = '#111827';
		const darkElevatedBg = '#1e293b';
		const darkTextMain = '#f1f5f9';
		const darkTextSecondary = '#cbd5e1';
		const darkTextMuted = '#94a3b8';

		// WCAG 2.2 AA requirement: normal text >= 4.5:1, large/UI text >= 3.0:1
		expect(getContrastRatio(darkTextMain, darkCardBg)).toBeGreaterThanOrEqual(4.5);
		expect(getContrastRatio(darkTextMain, darkElevatedBg)).toBeGreaterThanOrEqual(4.5);
		expect(getContrastRatio(darkTextSecondary, darkCardBg)).toBeGreaterThanOrEqual(4.5);
		expect(getContrastRatio(darkTextSecondary, darkElevatedBg)).toBeGreaterThanOrEqual(4.5);
		expect(getContrastRatio(darkTextMuted, darkCardBg)).toBeGreaterThanOrEqual(4.5);
		expect(getContrastRatio(darkTextMuted, darkElevatedBg)).toBeGreaterThanOrEqual(4.5);

		// Light Mode Palette tokens
		const lightCardBg = '#ffffff';
		const lightElevatedBg = '#f8fafc';
		const lightTextMain = '#0f172a';
		const lightTextSecondary = '#334155';
		expect(getContrastRatio(lightTextMain, lightCardBg)).toBeGreaterThanOrEqual(4.5);
		expect(getContrastRatio(lightTextMain, lightElevatedBg)).toBeGreaterThanOrEqual(4.5);
		expect(getContrastRatio(lightTextSecondary, lightCardBg)).toBeGreaterThanOrEqual(4.5);
		expect(getContrastRatio(lightTextSecondary, lightElevatedBg)).toBeGreaterThanOrEqual(4.5);
	});

	it('TraitSetMini (Phase 3a): standalone authoring, companion track range, keyboard nudge, and preset round-trip', async () => {
		characterCurioFunctions.setCustomSetPresets([], { notify: false });

		const wrapper = mount(TraitSetMini, { attachTo: document.body });
		await runAxeAudit(wrapper.element as HTMLElement);

		// 1. Standalone parts miniature: keyboard resize & column swap via TraitSetEditorRowMini
		const nameBox = wrapper.find('[data-grid-part="name"]');
		expect(nameBox.exists()).toBe(true);
		const initialTitle = nameBox.attributes('title') || '';
		expect(nameBox.find('.row-mini-dims').text()).toBe('70%');
		await nameBox.trigger('click');
		await nameBox.trigger('keydown', { key: 'ArrowLeft', shiftKey: true });
		expect(wrapper.find('[data-grid-part="name"]').find('.row-mini-dims').text()).toBe('65%');
		await wrapper.find('[data-grid-part="name"]').trigger('keydown', { key: 'ArrowRight' });
		expect(wrapper.find('[data-grid-part="name"]').attributes('title')).not.toBe(initialTitle);

		// 2. Create companion track via TraitSetEditor -> drills into TraitEditor, set range to [6, 8, 10], return via breadcrumb
		const createSubBtn = wrapper.findAll('button.editor-button').find((b) => b.text().includes('Create subtrait'));
		expect(createSubBtn).toBeDefined();
		await createSubBtn!.trigger('click');

		const toggleD4 = wrapper.find('button[title="Exclude d4"]');
		const toggleD12 = wrapper.find('button[title="Exclude d12"]');
		expect(toggleD4.exists()).toBe(true);
		expect(toggleD12.exists()).toBe(true);
		await toggleD4.trigger('click');
		await toggleD12.trigger('click');

		const backCrumb = wrapper.find('.mini-breadcrumb .crumb-link');
		expect(backCrumb.exists()).toBe(true);
		await backCrumb.trigger('click');

		const sfxChip = wrapper.findAll('.row-mini-part-chip').find((b) => b.text().trim() === 'SFX');
		expect(sfxChip).toBeDefined();
		await sfxChip!.trigger('click');

		// Verify parts miniature renders trackLabel, track, and block with [6, 8, 10] scale
		expect(wrapper.find('[data-grid-part="trackLabel"]').exists()).toBe(true);
		expect(wrapper.find('[data-grid-part="track"]').exists()).toBe(true);
		expect(wrapper.find('[data-grid-part="block"]').exists()).toBe(true);

		// 3. Save as Preset: creator-typed label, derived ID, collision check, and round-trip across Play, Edit, and Print
		const labelInput = wrapper.find('input[aria-label="Preset Label"]');
		await labelInput.setValue('Pool'); // Collides with built-in preset
		expect(wrapper.find('.mini-collision-alert').exists()).toBe(true);
		const saveBtn = wrapper.find('.mini-save-preset-btn');
		expect((saveBtn.element as HTMLButtonElement).disabled).toBe(true);

		await labelInput.setValue('Overload Tracker');
		expect(wrapper.find('.mini-collision-alert').exists()).toBe(false);
		expect((saveBtn.element as HTMLButtonElement).disabled).toBe(false);

		await saveBtn.trigger('click');
		const savedEvents = wrapper.emitted('saved');
		expect(savedEvents && savedEvents.length).toBe(1);
		const savedPreset = savedEvents![0][0] as { id: string; label: string; preset: TraitSet };
		expect(savedPreset.id).toBe('overload-tracker');
		expect(savedPreset.label).toBe('Overload Tracker');
		expect(savedPreset.preset.view?.pillar).toBeUndefined();

		// Verify collision blocks saving duplicate custom preset
		expect(wrapper.find('.mini-collision-alert').exists()).toBe(true);

		// Instantiate saved preset onto a character and verify Play, Edit, and Print rendering
		const char = makeCharacter({ name: 'Tester', traitSets: [] });
		const addedSet = characterCurioFunctions.instantiateSetPreset(savedPreset, char, 1);
		char.traitSets.push(addedSet);
		expect(characterCurioFunctions.getTrackScale(addedSet)).toEqual([6, 8, 10]);

		for (const mode of ['play', 'edit', 'print']) {
			const block = mount(TraitSetBlock, {
				props: { character: char, traitSetID: 0, submode: mode },
			});
			expect(block.find('.trait-set').exists()).toBe(true);
			expect(block.find('.attached-stress-track').exists()).toBe(true);
			await runAxeAudit(block.element as HTMLElement);
			block.unmount();
		}

		wrapper.unmount();
		characterCurioFunctions.setCustomSetPresets([], { notify: false });
	});

	it('TraitSetMini mobile sticky preview: manual disclosure, text-input keyboard auto-collapse, peek override, and WCAG 2.2 AA audit', async () => {
		const originalMatchMedia = window.matchMedia;
		window.matchMedia = vi.fn((query: string) => ({
			matches: query.includes('56.25rem'),
			media: query,
			onchange: null,
			addListener: vi.fn(),
			removeListener: vi.fn(),
			addEventListener: vi.fn(),
			removeEventListener: vi.fn(),
			dispatchEvent: vi.fn(),
		})) as unknown as typeof window.matchMedia;

		const wrapper = mount(TraitSetMini, { attachTo: document.body });
		try {
			await nextTick();
			const collapseBtn = wrapper.find('.mini-preview-collapse-btn');
			expect(collapseBtn.exists()).toBe(true);
			expect(collapseBtn.attributes('aria-expanded')).toBe('true');
			expect(collapseBtn.attributes('aria-controls')).toBe('mini-live-preview-frame');
			expect(wrapper.find('.mini-card-preview-section').classes()).not.toContain('is-collapsed');

			// Focus text input inside .mini-inspector-pane -> auto-collapses mobile preview
			const nameInput = wrapper.find('input[name="traitSetName"]');
			expect(nameInput.exists()).toBe(true);
			(nameInput.element as HTMLInputElement).focus();
			await nameInput.trigger('focusin');
			await nextTick();

			expect(wrapper.find('.mini-card-preview-section').classes()).toContain('is-collapsed');
			expect(collapseBtn.attributes('aria-expanded')).toBe('false');
			expect(wrapper.find('.preview-collapsed-summary').text()).toBe('New Set');

			// Manual peek override while text input still holds focus
			await collapseBtn.trigger('click');
			await nextTick();
			expect(wrapper.find('.mini-card-preview-section').classes()).not.toContain('is-collapsed');
			expect(collapseBtn.attributes('aria-expanded')).toBe('true');

			// Focus leaves text inputs -> keyboard closes, preview remains expanded and manual toggle works
			(document.activeElement as HTMLElement | null)?.blur?.();
			await nameInput.trigger('focusout');
			await new Promise((r) => setTimeout(r, 80));
			await nextTick();
			expect(wrapper.find('.mini-card-preview-section').classes()).not.toContain('is-collapsed');
			expect(collapseBtn.attributes('aria-expanded')).toBe('true');

			await collapseBtn.trigger('click');
			await nextTick();
			expect(wrapper.find('.mini-card-preview-section').classes()).toContain('is-collapsed');
			expect(collapseBtn.attributes('aria-expanded')).toBe('false');

			await collapseBtn.trigger('click');
			await nextTick();
			expect(wrapper.find('.mini-card-preview-section').classes()).not.toContain('is-collapsed');
			expect(collapseBtn.attributes('aria-expanded')).toBe('true');
			await runAxeAudit(wrapper.element as HTMLElement);

			// Re-trigger text focus collapse and verify collapsed state passes WCAG 2.2 AA
			document.body.appendChild(wrapper.element);
			(nameInput.element as HTMLInputElement).focus();
			await nameInput.trigger('focusin');
			await nextTick();
			expect(wrapper.find('.mini-card-preview-section').classes()).toContain('is-collapsed');
			await runAxeAudit(wrapper.element as HTMLElement);
		} finally {
			wrapper.unmount();
			window.matchMedia = originalMatchMedia;
		}
	});

	it('supports trait-specific custom companion track names (Injured, Worried) with track fallback and T/L marker toggles', async () => {
		const customSet = makeTraitSet({
			name: 'Attributes',
			view: {
				labels: { track: 'Stress' },
				parts: {
					name: { left: '0%', top: 0, width: '40%', height: 1 },
					trackLabel: { left: '40%', top: 0, width: '25%', height: 1 },
					track: { left: '65%', top: 0, width: '35%', height: 1 },
				},
			},
			traits: [
				{
					name: 'Physical',
					rating: { type: 'Die', value: [8] },
					traits: [{ name: 'Injured', rating: { type: 'Die', value: [6], range: [4, 6, 8, 10, 12] } }],
				},
				{
					name: 'Mental',
					rating: { type: 'Die', value: [10] },
					traits: [{ name: 'Worried', rating: { type: 'Die', value: [8], range: [4, 6, 8, 10, 12] } }],
				},
				{
					name: 'Social',
					rating: { type: 'Die', value: [6] },
					traits: [
						// Fallback to set track label
						{ name: 'Stress', rating: { type: 'Die', value: [4], range: [4, 6, 8, 10, 12] } },
					],
				},
			],
		});

		const char = makeCharacter({ name: 'Custom Track Tester', traitSets: [customSet] });
		const block = mount(TraitSetBlock, {
			props: { character: char, traitSetID: 0, submode: 'play' },
		});

		const labels = block.findAll('.attached-stress-label').map((el) => el.text());
		expect(labels).toEqual(['Injured', 'Worried', 'Stress']);
		expect((customSet.view?.labels as Record<string, unknown> | undefined)?.stress).toBeUndefined();
		expect(customSet.view?.labels?.track).toBe('Stress');

		// Test TraitSetMini child marker toggle via unified RowMini behavior bar
		const mini = mount(TraitSetMini, {
			props: { initialSet: customSet },
		});

		const namePartBox = mini.find('[data-grid-part="name"]');
		expect(namePartBox.exists()).toBe(true);
		await namePartBox.trigger('click');
		expect(namePartBox.find('.row-mini-marker').text()).toBe('L');
		const textBtn = mini.findAll('.row-mini-behavior-bar .editor-group-btn').find((b) => b.text().trim() === 'Text');
		expect(textBtn).toBeDefined();
		await textBtn!.trigger('click');
		expect(mini.find('[data-grid-part="name"] .row-mini-marker').text()).toBe('T');

		mini.unmount();
		block.unmount();
	});

	describe('PageLayoutMini (Phase 4a & 4b)', () => {
		it('renders PageLayoutMini with placed boxes and stacked bands, maintaining accessibility', async () => {
			const char = makeCharacter({
				name: 'Layout Test Hero',
				view: { pageCount: 2 },
				traitSets: [
					makeTraitSet({
						name: 'Distinctions',
						view: { page: 1, place: { left: '0%', width: '100%', top: 0, height: 2 } },
						traits: [{ name: 'Ace Pilot' }],
					}),
					makeTraitSet({
						name: 'Attributes',
						view: { page: 1, place: { left: '0%', width: '50%', top: 2, height: 2 } },
						traits: [{ name: 'Physical' }],
					}),
					makeTraitSet({
						name: 'Skills',
						view: { page: 2 }, // unplaced band
						traits: [{ name: 'Fight' }],
					}),
				],
			});

			const wrapper = mount(PageLayoutMini, {
				props: { character: char },
				attachTo: document.body,
			});

			expect(wrapper.findAll('.place-mini').length).toBe(2);
			const boxes = wrapper.findAll('.place-mini-ghost');
			expect(boxes.length).toBeGreaterThanOrEqual(3);

			// Click to select
			await boxes[0].trigger('pointerdown');
			expect(wrapper.find('.place-mini-block').exists()).toBe(true);

			// Check Full Width button clears place
			const fullWidthBtn = wrapper.find('button[title="Full width, stacked in document order"]');
			expect(fullWidthBtn.exists()).toBe(true);
			await fullWidthBtn.trigger('click');
			expect(char.traitSets[0].view?.place).toBeUndefined();

			await runAxeAudit(wrapper.element as HTMLElement);
			wrapper.unmount();
		});

		it('commits place on release, while Escape key cancels gesture and leaves character model untouched', async () => {
			const initialPlace = { left: '0%', width: '100%', top: 0, height: 2 };
			const char = makeCharacter({
				name: 'Drag Cancel Hero',
				view: { pageCount: 1 },
				traitSets: [
					makeTraitSet({
						name: 'Distinctions',
						view: { page: 1, place: { ...initialPlace } },
						traits: [{ name: 'Hero' }],
					}),
				],
			});

			const wrapper = mount(PageLayoutMini, {
				props: { character: char },
				attachTo: document.body,
			});

			// Select the block
			const ghost = wrapper.find('.place-mini-ghost');
			await ghost.trigger('pointerdown');

			const block = wrapper.find('.place-mini-block');
			expect(block.exists()).toBe(true);

			// Start drag
			const pointerdownEv = new PointerEvent('pointerdown', { clientX: 50, clientY: 20 });
			block.element.dispatchEvent(pointerdownEv);

			// Move
			const pointermoveEv = new PointerEvent('pointermove', { clientX: 100, clientY: 20 });
			window.dispatchEvent(pointermoveEv);

			// Press Escape to cancel
			const escapeEv = new KeyboardEvent('keydown', { key: 'Escape' });
			window.dispatchEvent(escapeEv);

			// End pointerup
			const pointerupEv = new PointerEvent('pointerup', { clientX: 100, clientY: 20 });
			window.dispatchEvent(pointerupEv);

			// Verify place remains untouched
			expect(char.traitSets[0].view?.place?.left).toBe('0%');
			expect(char.traitSets[0].view?.place?.width).toBe('100%');

			wrapper.unmount();
		});

		it('starts drag on the first pointerdown on an unselected block and commits with 5% snap, with mouse and touch unified', async () => {
			const char = makeCharacter({
				name: 'Pointer Drag Hero',
				view: { pageCount: 1 },
				traitSets: [
					makeTraitSet({
						name: 'Unselected Set',
						view: { page: 1, place: { left: '10%', width: '40%', top: 0, height: 1 } },
						traits: [],
					}),
				],
			});

			const wrapper = mount(PageLayoutMini, {
				props: { character: char },
				attachTo: document.body,
			});

			const miniEl = wrapper.find('.place-mini').element as HTMLElement;
			vi.spyOn(miniEl, 'getBoundingClientRect').mockReturnValue({
				left: 0,
				top: 0,
				right: 500,
				bottom: 300,
				width: 500,
				height: 300,
				x: 0,
				y: 0,
				toJSON: () => {},
			} as DOMRect);

			// Find block: currently unselected (has ghost class, does NOT have place-mini-block)
			const block = wrapper.find('[data-index="0"]');
			expect(block.exists()).toBe(true);
			expect(block.classes()).toContain('place-mini-ghost');
			expect(block.classes()).not.toContain('place-mini-block');

			// Direct pointerdown (mouse) on unselected block without prior click, moving right by 75px (15% of 500px)
			const pointerdownMouse = new PointerEvent('pointerdown', { clientX: 50, clientY: 10, pointerType: 'mouse' });
			block.element.dispatchEvent(pointerdownMouse);
			await wrapper.vm.$nextTick();

			// It is now selected
			expect(block.classes()).toContain('place-mini-block');

			// Pointermove on window
			const pointermoveMouse = new PointerEvent('pointermove', { clientX: 125, clientY: 10, pointerType: 'mouse' });
			window.dispatchEvent(pointermoveMouse);

			// Pointerup commits new position with 5% snap (10% + 15% = 25%)
			const pointerupMouse = new PointerEvent('pointerup', { clientX: 125, clientY: 10, pointerType: 'mouse' });
			window.dispatchEvent(pointerupMouse);
			await wrapper.vm.$nextTick();

			expect(char.traitSets[0].view?.place?.left).toBe('25%');

			// Now test touch pointerType drag moving by 38px (7.6% of 500px, snaps to 10% -> 25% + 10% = 35%)
			const pointerdownTouch = new PointerEvent('pointerdown', { clientX: 125, clientY: 10, pointerType: 'touch' });
			block.element.dispatchEvent(pointerdownTouch);

			const pointermoveTouch = new PointerEvent('pointermove', { clientX: 163, clientY: 10, pointerType: 'touch' });
			window.dispatchEvent(pointermoveTouch);

			const pointerupTouch = new PointerEvent('pointerup', { clientX: 163, clientY: 10, pointerType: 'touch' });
			window.dispatchEvent(pointerupTouch);

			expect(char.traitSets[0].view?.place?.left).toBe('35%');

			// Verify openSet is not emitted
			expect(wrapper.emitted('openSet')).toBeUndefined();

			wrapper.unmount();
		});

		it('resizes width and height via pointer on resize edges with 5% snap', async () => {
			const char = makeCharacter({
				name: 'Resize Edge Hero',
				view: { pageCount: 1 },
				traitSets: [
					makeTraitSet({
						name: 'Resizable Set',
						view: { page: 1, place: { left: '10%', width: '40%', top: 0, height: 1 } },
						traits: [],
					}),
				],
			});

			const wrapper = mount(PageLayoutMini, {
				props: { character: char },
				attachTo: document.body,
			});

			const miniEl = wrapper.find('.place-mini').element as HTMLElement;
			vi.spyOn(miniEl, 'getBoundingClientRect').mockReturnValue({
				left: 0,
				top: 0,
				right: 500,
				bottom: 300,
				width: 500,
				height: 300,
				x: 0,
				y: 0,
				toJSON: () => {},
			} as DOMRect);

			// Select block so resize edges render
			const block = wrapper.find('[data-index="0"]');
			await block.trigger('pointerdown');

			const edgeE = wrapper.find('.place-mini-edge-e');
			expect(edgeE.exists()).toBe(true);

			// Drag width edge by +50px (+10% of 500px width -> 40% + 10% = 50%)
			edgeE.element.dispatchEvent(new PointerEvent('pointerdown', { clientX: 250, clientY: 10 }));
			window.dispatchEvent(new PointerEvent('pointermove', { clientX: 300, clientY: 10 }));
			window.dispatchEvent(new PointerEvent('pointerup', { clientX: 300, clientY: 10 }));

			expect(char.traitSets[0].view?.place?.width).toBe('50%');

			// Drag height edge down by 40px (2 rows of 20px -> 1 + 2 = 3)
			const edgeS = wrapper.find('.place-mini-edge-s');
			expect(edgeS.exists()).toBe(true);

			edgeS.element.dispatchEvent(new PointerEvent('pointerdown', { clientX: 250, clientY: 20 }));
			window.dispatchEvent(new PointerEvent('pointermove', { clientX: 250, clientY: 60 }));
			window.dispatchEvent(new PointerEvent('pointerup', { clientX: 250, clientY: 60 }));

			expect(char.traitSets[0].view?.place?.height).toBe(3);

			wrapper.unmount();
		});

		it('moves set across pages in PageLayoutMini, reordering array, updating view.page, and leaving view.pillar untouched', async () => {
			const char = makeCharacter({
				name: 'Pillar Hero',
				view: { pageCount: 2 },
				traitSets: [
					makeTraitSet({
						name: 'Set 1',
						view: { page: 1, pillar: 'prime', place: { left: '0%', width: '50%', top: 0, height: 1 } },
						traits: [],
					}),
					makeTraitSet({
						name: 'Set 2',
						view: { page: 2, pillar: 'identity', place: { left: '0%', width: '100%', top: 0, height: 1 } },
						traits: [],
					}),
				],
			});

			const wrapper = mount(PageLayoutMini, {
				props: { character: char },
				attachTo: document.body,
			});

			// Select Set 1
			const ghost = wrapper.findAll('.place-mini-ghost')[0];
			await ghost.trigger('pointerdown');

			// Click Page 2 button
			const pageButtons = wrapper.findAll('.editor-group-btn');
			const page2Btn = pageButtons.find((b) => b.text() === 'Page 2');
			expect(page2Btn).toBeDefined();
			await page2Btn!.trigger('click');

			expect(char.traitSets[0].view?.page).toBe(2);
			// Pillar must never be disturbed!
			expect(char.traitSets[0].view?.pillar).toBe('prime');
			expect(char.traitSets[1].view?.pillar).toBe('identity');

			wrapper.unmount();
		});

		it('supports keyboard navigation: arrows move, shift+arrows resize, enter/space opens block mini', async () => {
			const char = makeCharacter({
				name: 'Keyboard Hero',
				view: { pageCount: 1 },
				traitSets: [
					makeTraitSet({
						name: 'Movable Set',
						view: { page: 1, place: { left: '10%', width: '40%', top: 1, height: 2 } },
						traits: [],
					}),
				],
			});

			const wrapper = mount(PageLayoutMini, {
				props: { character: char },
				attachTo: document.body,
			});

			// Select Movable Set
			const ghost = wrapper.find('.place-mini-ghost');
			await ghost.trigger('pointerdown');

			const block = wrapper.find('.place-mini-block');

			// Move right (ArrowRight -> +5%)
			await block.trigger('keydown', { key: 'ArrowRight' });
			expect(char.traitSets[0].view?.place?.left).toBe('15%');

			// Resize width (Shift+ArrowRight -> +5%)
			await block.trigger('keydown', { key: 'ArrowRight', shiftKey: true });
			expect(char.traitSets[0].view?.place?.width).toBe('45%');

			// Move down (ArrowDown -> +1 row)
			await block.trigger('keydown', { key: 'ArrowDown' });
			expect(char.traitSets[0].view?.place?.top).toBe(2);

			// Resize height (Shift+ArrowDown -> +1 row)
			await block.trigger('keydown', { key: 'ArrowDown', shiftKey: true });
			expect(char.traitSets[0].view?.place?.height).toBe(3);

			// Enter selects the set in the docked editor without opening a modal
			await block.trigger('keydown', { key: 'Enter' });
			await wrapper.vm.$nextTick();
			expect(document.body.querySelector('.trait-set-mini')).toBeNull();
			expect(wrapper.emitted('selectElement')).toContainEqual([['traitSet', 0]]);

			wrapper.unmount();
		});

		it('acceptance case: stress-bearing set with track, trackLabel, block, and companion scale preserves structure through move/resize', async () => {
			const stressSet = makeTraitSet({
				name: 'Attributes',
				view: {
					place: { left: '0%', top: 0, width: '50%', height: 2 },
					labels: { track: 'Stress' },
					parts: {
						name: { left: '0%', top: 0, width: '40%', height: 1 },
						trackLabel: { left: '40%', top: 0, width: '25%', height: 1 },
						track: { left: '65%', top: 0, width: '35%', height: 1 },
						block: { left: '0%', top: 1, width: '100%', height: 1 },
					},
				},
				traits: [
					{
						name: 'Physical',
						rating: { type: 'Die', value: [8] },
						traits: [{ name: 'Stress', rating: { type: 'Die', value: [6], range: [4, 6, 8, 10, 12] } }],
					},
				],
			});

			const char = makeCharacter({
				name: 'Stress Acceptance Hero',
				view: { pageCount: 1 },
				traitSets: [stressSet],
			});

			const wrapper = mount(PageLayoutMini, {
				props: { character: char },
				attachTo: document.body,
			});

			// Select the stress set
			const ghost = wrapper.find('.place-mini-ghost');
			await ghost.trigger('pointerdown');

			const block = wrapper.find('.place-mini-block');

			// Move set right and down via keyboard
			await block.trigger('keydown', { key: 'ArrowRight' });
			await block.trigger('keydown', { key: 'ArrowDown' });

			// Verify place changed correctly
			expect(char.traitSets[0].view?.place?.left).toBe('5%');
			expect(char.traitSets[0].view?.place?.top).toBe(1);

			// Verify stress parts and companion scale remain 100% intact
			expect(char.traitSets[0].view?.parts?.track).toEqual({ left: '65%', top: 0, width: '35%', height: 1 });
			expect(char.traitSets[0].view?.parts?.trackLabel).toEqual({ left: '40%', top: 0, width: '25%', height: 1 });
			expect(char.traitSets[0].view?.parts?.block).toEqual({ left: '0%', top: 1, width: '100%', height: 1 });
			expect(char.traitSets[0].traits[0].traits?.[0].rating?.range).toEqual([4, 6, 8, 10, 12]);

			wrapper.unmount();
		});

		it('wires seamless Set Editor handoff from PageLayoutMini without modal overlay', async () => {
			const char = makeCharacter({
				name: 'Handoff Hero',
				view: { pageCount: 1 },
				traitSets: [
					makeTraitSet({
						name: 'Handoff Set',
						view: { page: 1, place: { left: '0%', width: '100%', top: 0, height: 1 } },
						traits: [{ name: 'Initial Trait' }],
					}),
				],
			});

			const wrapper = mount(PageLayoutMini, {
				props: { character: char },
				attachTo: document.body,
			});

			// Select the set
			const ghost = wrapper.find('.place-mini-ghost');
			await ghost.trigger('pointerdown');

			// Click "Edit Set" button
			const editSetBtn = wrapper.find('.btn-open-set-editor');
			expect(editSetBtn.exists()).toBe(true);
			await editSetBtn.trigger('click');
			await wrapper.vm.$nextTick();

			expect(document.body.querySelector('.trait-set-mini')).toBeNull();
			expect(wrapper.emitted('selectElement')).toContainEqual([['traitSet', 0]]);
			expect(wrapper.find('.place-mini-block').exists()).toBe(true);

			wrapper.unmount();
		});
	});

	describe('Phase 3c: SVG Frames, Dynamic Positional Anchors, & Mobile Fallback', () => {
		function createStressBearingFramedSet(shape: FrameShape | Record<string, unknown> = 'ring'): TraitSet {
			return makeTraitSet({
				name: 'Attributes',
				view: {
					frame:
						typeof shape === 'string'
							? shape
							: ({ stroke: 'primary', ...shape } as TraitSet['view'] extends infer V
									? V extends { frame?: infer F }
										? F
										: never
									: never),
					labels: { track: 'Stress' },
					parts: {
						name: { left: '0%', top: 0, width: '35%', height: 1 },
						rating: { left: '35%', top: 0, width: '15%', height: 1 },
						trackLabel: { left: '50%', top: 0, width: '20%', height: 1 },
						track: { left: '70%', top: 0, width: '30%', height: 1 },
					},
				},
				traits: [
					{
						name: 'Physical',
						rating: { type: 'Die', value: [8], range: [4, 6, 8, 10, 12] },
						traits: [{ name: 'Stress', rating: { type: 'Die', value: [6], range: [4, 6, 8, 10, 12] } }],
					},
					{
						name: 'Mental',
						rating: { type: 'Die', value: [10], range: [4, 6, 8, 10, 12] },
						traits: [{ name: 'Stress', rating: { type: 'Die', value: [8], range: [4, 6, 8, 10, 12] } }],
					},
					{
						name: 'Social',
						rating: { type: 'Die', value: [6], range: [4, 6, 8, 10, 12] },
						traits: [{ name: 'Stress', rating: { type: 'Die', value: [4], range: [4, 6, 8, 10, 12] } }],
					},
				],
			});
		}

		it('1. Stress-Bearing Framed Set: renders ring frame with visible, clickable rating die and stress track in Edit, Play, and Print', async () => {
			const set = createStressBearingFramedSet('ring');
			const char = makeCharacter({ name: 'Framed Hero', traitSets: [set] });

			for (const mode of ['play', 'edit', 'print']) {
				const block = mount(TraitSetBlock, {
					props: { character: char, traitSetID: 0, submode: mode },
					attachTo: document.body,
				});

				expect(block.find('.portrait').exists()).toBe(true);
				expect(block.find('.ring-grid').exists()).toBe(true);
				const svg = block.find('.trait-set-frame-svg.frame-radial-svg');
				expect(svg.exists()).toBe(true);
				expect(svg.attributes('aria-hidden')).toBe('true');
				expect(svg.attributes('focusable')).toBe('false');

				// All 3 traits rendered in logical DOM order
				const traits = block.findAll('.ring-trait');
				expect(traits.length).toBe(3);
				expect(traits[0].text()).toContain('Physical');
				expect(traits[1].text()).toContain('Mental');
				expect(traits[2].text()).toContain('Social');

				// Anchors present
				expect(traits[0].attributes('style')).toContain('left:');
				expect(traits[0].attributes('style')).toContain('top:');

				await runAxeAudit(block.element as HTMLElement);
				block.unmount();
			}
		});

		it('2. Circle -> Ellipse -> Block Morph: traits preserve 0..N-1 order and internal view.parts across all three shapes', async () => {
			const set = createStressBearingFramedSet('ring');
			const char = makeCharacter({ name: 'Morph Hero', traitSets: [set] });

			const wrapper = mount(TraitSetBlock, {
				props: { character: char, traitSetID: 0, submode: 'play' },
				attachTo: document.body,
			});

			// 1) Ring
			expect(wrapper.find('.portrait').exists()).toBe(true);
			expect(wrapper.find('.ring-grid').exists()).toBe(true);
			let names = wrapper.findAll('.ring-trait .ring-trait-name').map((t) => t.text().trim());
			expect(names).toEqual(['Physical', 'Mental', 'Social']);

			// 2) Morph to Ellipse (ellipse without ring body renders standard list)
			const ellipseSet = makeTraitSet({
				...set,
				view: { ...set.view, frame: { shape: 'ellipse' as FrameShape, span: [0, 360], stroke: 'accent', corner: 8 } },
			});
			await wrapper.setProps({
				character: makeCharacter({ id: 'morph-hero', name: 'Morph Hero', traitSets: [ellipseSet] }),
			});
			await wrapper.vm.$nextTick();
			expect(wrapper.find('.trait-list').exists()).toBe(true);
			names = wrapper.findAll('.trait').map((t) => t.attributes('data-trait-name') || '');
			expect(names).toEqual(['Physical', 'Mental', 'Social']);

			// 3) Morph to Block
			const blockSet = makeTraitSet({
				...set,
				view: {
					...set.view,
					border: { shape: 'block', corner: 'cut', stroke: 'primary' },
					frame: { shape: 'none', array: 'none' },
				},
			});
			await wrapper.setProps({
				character: makeCharacter({ id: 'morph-hero', name: 'Morph Hero', traitSets: [blockSet] }),
			});
			await wrapper.vm.$nextTick();
			expect(wrapper.find('.trait-set-body-framed').exists()).toBe(true);
			expect(wrapper.find('.frame-block-svg').exists()).toBe(true);
			// Non-positional: portrait ring is removed, normal view.parts stack rendered
			expect(wrapper.find('.portrait').exists()).toBe(false);
			names = wrapper.findAll('.trait').map((t) => t.attributes('data-trait-name') || '');
			expect(names).toEqual(['Physical', 'Mental', 'Social']);

			// Parts intact
			expect(set.view?.parts?.track).toBeDefined();
			expect(set.view?.parts?.name).toBeDefined();

			wrapper.unmount();
		});

		it('3. Dynamic Anchor Re-Derivation: recomputes positions dynamically on add/remove trait with zero stored anchor count in JSON', () => {
			const cfg = resolveFrame({ view: { frame: 'ring' } })!;
			expect(cfg).not.toBeNull();

			// 3 traits: 120° spacing
			const anchors3 = computeFrameAnchors(3, cfg);
			expect(anchors3.length).toBe(3);
			expect(anchors3[0].angle).toBe(0);
			expect(anchors3[1].angle).toBe(120);
			expect(anchors3[2].angle).toBe(240);

			// 4 traits: 90° spacing
			const anchors4 = computeFrameAnchors(4, cfg);
			expect(anchors4.length).toBe(4);
			expect(anchors4[0].angle).toBe(0);
			expect(anchors4[1].angle).toBe(90);
			expect(anchors4[2].angle).toBe(180);
			expect(anchors4[3].angle).toBe(270);

			// 2 traits open arc [45, 135] (1:30 to 4:30 centered at 3 o'clock)
			const arcCfg = resolveFrame({ view: { frame: { shape: 'arc', span: [45, 135] } } })!;
			const anchorsArc = computeFrameAnchors(2, arcCfg);
			expect(anchorsArc.length).toBe(2);
			expect(anchorsArc[0].angle).toBe(45);
			expect(anchorsArc[1].angle).toBe(135);
		});

		it('4. Bare-Path Section Line (border shape: "line"): renders crisp SVG section divider across Edit, Play, and Print', () => {
			const lineSet = makeTraitSet({
				name: 'Divider Section',
				view: { border: { shape: 'line', stroke: 'accent' } },
				traits: [{ name: 'Followup Trait' }],
			});
			const char = makeCharacter({ name: 'Line Hero', traitSets: [lineSet] });

			for (const mode of ['play', 'edit', 'print']) {
				const block = mount(TraitSetBlock, {
					props: { character: char, traitSetID: 0, submode: mode },
				});

				const lineSvg = block.find('.trait-set-frame-svg.frame-line-svg');
				expect(lineSvg.exists()).toBe(true);
				expect(lineSvg.attributes('viewBox')).toBe('0 0 100 12');
				expect(lineSvg.attributes('preserveAspectRatio')).toBe('none');
				expect(lineSvg.find('path').attributes('d')).toBe('M 0,6 L 100,6');

				// Content guarantee: header and trait still render
				expect(block.find('.trait-set-header').exists()).toBe(true);
				expect(block.find('.trait-set-header-name').text()).toBe('Divider Section');
				expect(block.find('.trait').exists()).toBe(true);
				block.unmount();
			}
		});

		it('5. Mobile Forced-Off & User Toggled-Off Fallback (Zero Overspill): turns off radial frame cleanly to view.parts stack', async () => {
			const set = createStressBearingFramedSet('ring');
			const char = makeCharacter({ name: 'Fallback Hero', traitSets: [set] });

			const wrapper = mount(TraitSetBlock, {
				props: { character: char, traitSetID: 0, submode: 'play' },
				attachTo: document.body,
			});

			expect(wrapper.find('.portrait').exists()).toBe(true);
			expect(wrapper.find('.frame-radial-svg').exists()).toBe(true);

			// 1. User selects "none" (or deletes frame in editor): turns frame off cleanly to view.parts
			const unframedSet = structuredClone(set);
			if (unframedSet.view) delete unframedSet.view.frame;
			await wrapper.setProps({
				character: makeCharacter({ id: 'fallback-hero', name: 'Fallback Hero', traitSets: [unframedSet] }),
			});
			expect(wrapper.find('.portrait').exists()).toBe(false);
			expect(wrapper.find('.frame-radial-svg').exists()).toBe(false);

			// Traits still render stacked with stress track intact
			const traits = wrapper.findAll('.trait');
			expect(traits.length).toBe(3);
			expect(wrapper.findAll('.attached-stress-track').length).toBe(3);

			// 2. User re-enables frame: restores frame cleanly
			const reframedSet = structuredClone(set);
			if (reframedSet.view) reframedSet.view.frame = { shape: 'ring', span: [0, 360] };
			await wrapper.setProps({
				character: makeCharacter({ id: 'fallback-hero', name: 'Fallback Hero', traitSets: [reframedSet] }),
			});
			expect(wrapper.find('.portrait').exists()).toBe(true);
			expect(wrapper.find('.frame-radial-svg').exists()).toBe(true);

			wrapper.unmount();
		});

		it('6. A11y & Sparse JSON Compliance: SVG contains zero text, DOM order is 0..N-1, and JSON is terse', async () => {
			const set = createStressBearingFramedSet({ shape: 'ring', span: [0, 360], stroke: 'primary', corner: 8 });
			const char = makeCharacter({ name: 'A11y Hero', traitSets: [set] });

			const wrapper = mount(TraitSetBlock, {
				props: { character: char, traitSetID: 0, submode: 'play' },
				attachTo: document.body,
			});

			const svg = wrapper.find('.trait-set-frame-svg');
			expect(svg.exists()).toBe(true);
			// Zero SVG <text> or <textPath> nodes!
			expect(svg.find('text').exists()).toBe(false);
			expect(svg.find('textPath').exists()).toBe(false);
			expect(svg.attributes('aria-hidden')).toBe('true');

			// DOM order strictly 0..N-1
			const traitElements = wrapper.findAll('.ring-trait');
			expect(traitElements[0].text()).toContain('Physical');
			expect(traitElements[1].text()).toContain('Mental');
			expect(traitElements[2].text()).toContain('Social');

			// Terse JSON compliance: no internal coordinates or IDs stored in JSON
			const cloned = JSON.parse(JSON.stringify(set));
			expect(cloned.view.frame).toEqual({ shape: 'ring', span: [0, 360], stroke: 'primary', corner: 8 });
			expect(cloned.view.frame.anchors).toBeUndefined();
			expect(cloned.view.frame.count).toBeUndefined();

			await runAxeAudit(wrapper.element as HTMLElement);
			wrapper.unmount();
		});

		it('7. Frame = Arc fan-out distribution on PortraitRing & radial stroke arc', async () => {
			const arcSet = makeTraitSet({
				name: 'Roles',
				view: {
					frame: { shape: 'circle', array: 'arc', span: [45, 135], traitsSpan: [45, 135] },
					ratingDisplay: 'rating',
				},
				traits: [
					{ name: 'Commander', rating: { type: 'Die', value: [6], range: [4, 6, 8, 10, 12] } },
					{ name: 'Engineer', rating: { type: 'Die', value: [8], range: [4, 6, 8, 10, 12] } },
					{ name: 'Navigator', rating: { type: 'Die', value: [10], range: [4, 6, 8, 10, 12] } },
				],
			});
			const char = makeCharacter({ name: 'Arc Hero', traitSets: [arcSet] });

			const wrapper = mount(TraitSetBlock, {
				props: { character: char, traitSetID: 0, submode: 'play' },
				attachTo: document.body,
			});

			// Portrait hub & radial arc rendered on PortraitRing
			expect(wrapper.find('.portrait.portrait-shape-circle').exists()).toBe(true);
			expect(wrapper.find('.ring-grid').exists()).toBe(true);
			const svg = wrapper.find('.trait-set-frame-svg.frame-radial-svg');
			expect(svg.exists()).toBe(true);
			const pathD = svg.find('path').attributes('d') || '';
			// Open arc path: M ... A ... with no Z (not closed circle)
			expect(pathD).toMatch(/^M [\d.]+,\s*[\d.]+ A /);
			expect(pathD.endsWith('Z')).toBe(false);

			// Radial traits render inside PortraitRing with die buttons
			const ringTraits = wrapper.findAll('.ring-trait');
			expect(ringTraits.length).toBe(3);
			expect(ringTraits.map((t) => t.find('.ring-trait-name').text().trim())).toEqual([
				'Commander',
				'Engineer',
				'Navigator',
			]);
			for (const rt of ringTraits) {
				expect(rt.findAll('.ring-trait-inner[role="button"]').length).toBe(1);
				expect(rt.find('svg.diecon').exists()).toBe(true);
			}

			wrapper.unmount();
		});
	});

	describe('Phase 4: Unified Set & Subtrait Editor (Rule of 3)', () => {
		it('renders identity (name line 1, description line 2) and unified rating types in TraitEditor for a subtrait', async () => {
			const char = makeCharacter({
				name: 'Test Hero',
				traitSets: [
					makeTraitSet({
						name: 'Skills',
						traits: [
							{
								name: 'Combat',
								traits: [{ name: 'Swords', rating: { type: 'Die', value: [8], range: [4, 6, 8, 10, 12] } }],
							},
						],
					}),
				],
			});

			const wrapper = mount(TraitEditor, {
				props: {
					character: char,
					traitSetID: 0,
					traitID: 0,
					subtraitID: 0,
					traitPath: [0, 0],
					open: true,
					submode: 'edit',
				},
				attachTo: document.body,
			});

			// 1. Identity order (Trait Name in field 0, Description in field 1)
			const fields = wrapper.findAll('.editor-field');
			expect(fields.length).toBeGreaterThanOrEqual(2);
			expect(fields[0].find('input[name="traitName"]').exists()).toBe(true);
			expect(fields[1].find('textarea[name="traitDescription"]').exists()).toBe(true);

			// 2. Rating type picker
			const typeButtons = wrapper.findAll('.editor-group-btn');
			const buttonTexts = typeButtons.map((b) => b.text());
			expect(buttonTexts).toContain('Die');
			expect(buttonTexts).toContain('Dice');
			expect(buttonTexts).toContain('Counter');
			expect(buttonTexts).toContain('Pip');

			// 3. Switch to Pip (statement / questioned)
			const pipBtn = typeButtons.find((b) => b.text() === 'Pip');
			expect(pipBtn).toBeDefined();
			await pipBtn!.trigger('click');
			expect(char.traitSets[0].traits[0].traits?.[0].rating?.type).toBe('Pip');

			wrapper.unmount();
		});

		it('derives counter column presence structurally from Counter rating traits without set flags', async () => {
			const { default: TraitSetBlock } = await import('../js/trait-set-block.vue');
			const char = makeCharacter({
				name: 'Counter Hero',
				traitSets: [
					makeTraitSet({
						name: 'Badges',
						view: { style: { body: 'die-rows' } },
						traits: [
							{
								name: 'XP Badge',
								rating: { type: 'Counter', value: [5], range: [0, 20] },
							},
						],
					}),
				],
			});

			const wrapper = mount(TraitSetBlock, {
				props: { character: char, traitSetID: 0, submode: 'play' },
				attachTo: document.body,
			});

			// Has counter column rendered structurally
			expect(wrapper.find('.die-row-counter').exists()).toBe(true);
			wrapper.unmount();
		});

		it('warns before rating-type change when child traits exist and confirms switch', async () => {
			const char = makeCharacter({
				name: 'Complex Trait Hero',
				traitSets: [
					makeTraitSet({
						name: 'Powers',
						traits: [
							{
								name: 'Sorcery',
								traits: [
									{
										name: 'Spell',
										rating: { type: 'Die', value: [8], range: [4, 6, 8, 10, 12] },
										traits: [
											{
												name: 'Subordinate FX',
												rating: { type: 'Die', value: [6] },
											},
										],
									},
								],
							},
						],
					}),
				],
			});

			const wrapper = mount(TraitEditor, {
				props: {
					character: char,
					traitSetID: 0,
					traitID: 0,
					subtraitID: 0,
					traitPath: [0, 0],
					open: true,
					submode: 'edit',
				},
				attachTo: document.body,
			});

			const typeButtons = wrapper.findAll('.editor-group-btn');
			const counterBtn = typeButtons.find((b) => b.text() === 'Counter');
			expect(counterBtn).toBeDefined();

			// Click Counter -> warning banner displayed
			await counterBtn!.trigger('click');
			expect(wrapper.find('.editor-warning-banner').exists()).toBe(true);
			expect(char.traitSets[0].traits[0].traits?.[0].rating?.type).toBe('Die');

			// Click Confirm in warning banner -> switches type to Counter
			const confirmBtn = wrapper.find('.btn-warning-confirm');
			expect(confirmBtn.exists()).toBe(true);
			await confirmBtn.trigger('click');
			expect(char.traitSets[0].traits[0].traits?.[0].rating?.type).toBe('Counter');

			wrapper.unmount();
		});

		it('supports statement child trait in Play mode with read-only name and interactive pip toggle', async () => {
			const char = makeCharacter({
				name: 'Statement Hero',
				traitSets: [
					makeTraitSet({
						name: 'Distinctions',
						traits: [
							{
								name: 'Bounty Hunter',
								traits: [
									{
										name: 'I always get my bounty.',
										rating: { type: 'Pip', value: [false] },
									},
								],
							},
						],
					}),
				],
			});

			const wrapper = mount(TraitEditor, {
				props: {
					character: char,
					traitSetID: 0,
					traitID: 0,
					subtraitID: 0,
					traitPath: [0, 0],
					open: true,
					submode: 'play',
				},
				attachTo: document.body,
			});

			// In Play mode, name is rendered read-only
			expect(wrapper.find('.editor-readonly-title').exists()).toBe(true);
			expect(wrapper.find('input[name="traitName"]').exists()).toBe(false);

			// Pip bubble is interactive and toggles questioned state
			const pipWrap = wrapper.find('.pip-bubble-wrap');
			expect(pipWrap.exists()).toBe(true);
			expect(pipWrap.attributes('aria-checked')).toBe('false');

			await pipWrap.trigger('click');
			expect((char.traitSets[0].traits[0].traits?.[0].rating?.value as unknown[])?.[0]).toBe(true);

			wrapper.unmount();
		});

		it('renders [OUT] toggle chip in the scale row and updates out state', async () => {
			const { default: TraitSetEditor } = await import('../js/trait-set-editor.vue');
			const char = makeCharacter({
				name: 'Out Hero',
				traitSets: [
					makeTraitSet({
						name: 'Stress',
						view: { style: { body: 'die-track' }, parts: { track: true } as unknown as Record<string, never> },
						traits: [{ name: 'Physical', rating: { type: 'Die', value: [6] } }],
					}),
				],
			});

			const wrapper = mount(TraitSetEditor, {
				props: {
					character: char,
					traitSetID: 0,
				},
				attachTo: document.body,
			});

			const outChip = wrapper.find('.rating-scale-chip-out');
			expect(outChip.exists()).toBe(true);
			expect(outChip.text()).toContain('OUT');

			// Click [OUT] -> toggles outIndicator
			await outChip.trigger('click');
			expect(outChip.classes()).toContain('active');

			wrapper.unmount();
		});

		it('creates a subtrait from set editor, drills into TraitEditor with breadcrumb, and surfaces subtrait parts on parent mini', async () => {
			const { default: TraitSetEditor } = await import('../js/trait-set-editor.vue');
			const { default: StudioPanel } = await import('../js/studio-panel.vue');
			const char = makeCharacter({
				name: 'Subtrait Hero',
				traitSets: [
					makeTraitSet({
						name: 'Attributes',
						noun: 'Attribute',
						view: {},
						traits: [
							{ name: 'Agility', rating: { type: 'Die', value: [8], range: [4, 6, 8, 10, 12] }, traits: [] },
							{ name: 'Brawn', rating: { type: 'Die', value: [6], range: [4, 6, 8, 10, 12] }, traits: [] },
						],
					}),
				],
			});

			// 1. Set editor offers "Create subtrait" (no SUBTRAIT SCALE or ATTACHED TRACK)
			const setEditor = mount(TraitSetEditor, {
				props: { character: char, traitSetID: 0 },
				attachTo: document.body,
			});
			expect(setEditor.text()).not.toContain('Subtrait scale');
			expect(setEditor.text()).not.toContain('Attached track');

			const createSubBtn = setEditor.findAll('button.editor-button').find((b) => b.text().includes('Create subtrait'));
			expect(createSubBtn).toBeDefined();
			await createSubBtn!.trigger('click');

			const selectedEvents = setEditor.emitted('selectElement');
			expect(selectedEvents).toBeTruthy();
			expect(selectedEvents![0][0]).toEqual(['subtrait', 0, 0, 0]);
			expect(characterCurioFunctions.hasTrackPart(char.traitSets[0])).toBe(true);
			setEditor.unmount();

			// 2. StudioPanel drills down into TraitEditor with breadcrumb "Sheet › Attributes › Track"
			const studio = mount(StudioPanel, {
				props: {
					character: char,
					editing: ['subtrait', 0, 0, 0],
					submode: 'edit',
				},
				attachTo: document.body,
			});
			await flushPromises();
			const crumbText = studio.find('.studio-breadcrumb').text();
			expect(crumbText).toContain('Attributes');
			expect(crumbText).toContain('Track');
			expect(crumbText).not.toContain('Subtrait Track');
			expect(studio.findComponent(TraitEditor).exists()).toBe(true);
			studio.unmount();

			// 3. Parent's mini surfaces both parent's parts and subtraits' parts labelled by owner trait
			const mini = mount(TraitSetMini, {
				props: {
					initialSet: {
						id: 'values',
						name: 'Values',
						noun: 'Value',
						view: { labels: { track: 'Stress' } },
						traits: [
							{
								name: 'Justice',
								rating: { type: 'Die', value: [8], range: [4, 6, 8, 10, 12] },
								traits: [
									{ name: 'Stress', noun: 'Stress', rating: { type: 'Die', value: [6], range: [4, 6, 8, 10, 12] } },
									{ name: 'Statement', noun: 'Statement', rating: { type: 'Pip', value: [false] } },
								],
							},
						],
					},
				},
				attachTo: document.body,
			});

			const namePart = mini.find('[data-grid-part="name"]');
			const ratingPart = mini.find('[data-grid-part="rating"]');
			const trackPart = mini.find('[data-grid-part="track"]');
			const statementPipPart = mini.find('[data-grid-part="child:Statement:rating"]');

			expect(namePart.exists()).toBe(true);
			expect(namePart.attributes('data-part-owner')).toBe('Value');
			expect(namePart.text()).toContain('Value · Name');

			expect(ratingPart.exists()).toBe(true);
			expect(ratingPart.attributes('data-part-owner')).toBe('Value');
			expect(ratingPart.text()).toContain('Value · Rating');

			expect(trackPart.exists()).toBe(true);
			expect(trackPart.attributes('data-part-owner')).toBe('Stress');
			expect(trackPart.text()).toContain('Stress · Rating');

			expect(statementPipPart.exists()).toBe(true);
			expect(statementPipPart.attributes('data-part-owner')).toBe('Statement');
			expect(statementPipPart.text()).toContain('Statement · Rating');

			mini.unmount();
		});

		it('supports multiple subtraits with drill-in buttons, Noun vs Trait Name labels, and 3-level recursion cap', async () => {
			const { default: TraitSetEditor } = await import('../js/trait-set-editor.vue');
			const { default: StudioPanel } = await import('../js/studio-panel.vue');
			const char = makeCharacter({
				name: 'Recursive Hero',
				traitSets: [
					makeTraitSet({
						name: 'Attributes',
						noun: 'Attribute',
						view: {},
						traits: [
							{
								name: 'Agility',
								rating: { type: 'Die', value: [8], range: [4, 6, 8, 10, 12] },
								traits: [
									{
										name: 'Stress',
										noun: 'Stress',
										rating: { type: 'Die', value: [6], range: [4, 6, 8, 10, 12] },
										traits: [],
									},
								],
							},
						],
					}),
				],
			});

			// 1. Set editor lists existing subtrait drill-in button AND Create subtrait button for adding more
			const setEditor = mount(TraitSetEditor, {
				props: { character: char, traitSetID: 0 },
				attachTo: document.body,
			});
			const drillBtns = setEditor.findAll('.editor-subtrait-drill');
			expect(drillBtns.length).toBe(1);
			expect(drillBtns[0].text()).toContain('Stress');

			const createSubBtn = setEditor.findAll('button.editor-button').find((b) => b.text().includes('Create subtrait'));
			expect(createSubBtn).toBeDefined();
			await createSubBtn!.trigger('click');
			expect(char.traitSets[0].traits[0].traits?.length).toBe(2);
			expect(char.traitSets[0].traits[0].traits?.[1].noun).toBe('Subtrait 2');
			setEditor.unmount();

			// 2. Set-level drilldown uses "Noun" label; instance drilldown uses "Trait Name" label
			const setSubEditor = mount(TraitEditor, {
				props: {
					character: char,
					traitSetID: 0,
					traitID: 0,
					subtraitID: 0,
					traitPath: [0, 0],
					isSetSubtrait: true,
					open: true,
					submode: 'edit',
				},
				attachTo: document.body,
			});
			expect(setSubEditor.find('label[for="trait-name-0"]').text()).toBe('Noun');
			setSubEditor.unmount();

			const instanceSubEditor = mount(TraitEditor, {
				props: {
					character: char,
					traitSetID: 0,
					traitID: 0,
					subtraitID: 0,
					traitPath: [0, 0],
					isSetSubtrait: false,
					open: true,
					submode: 'edit',
				},
				attachTo: document.body,
			});
			expect(instanceSubEditor.find('label[for="trait-name-0"]').text()).toBe('Trait Name');

			// 3. Level 2 (Child) allows creating a Level 3 (Grandchild) subtrait and drills into ['trait', 0, 0, 0, 0]
			const lvl2CreateBtn = instanceSubEditor
				.findAll('button.editor-button')
				.find((b) => b.text().includes('Create subtrait'));
			expect(lvl2CreateBtn).toBeDefined();
			expect(lvl2CreateBtn!.attributes('disabled')).toBeUndefined();
			await lvl2CreateBtn!.trigger('click');
			expect(instanceSubEditor.emitted('selectElement')![0][0]).toEqual(['trait', 0, 0, 0, 0]);
			instanceSubEditor.unmount();

			// 4. Level 3 (Grandchild) disables the "Create subtrait" button and StudioPanel renders 3-level breadcrumb
			const studioLvl3 = mount(StudioPanel, {
				props: {
					character: char,
					editing: ['trait', 0, 0, 0, 0],
					submode: 'edit',
				},
				attachTo: document.body,
			});
			await flushPromises();
			const crumbText = studioLvl3.find('.studio-breadcrumb').text();
			expect(crumbText).toContain('Attributes');
			expect(crumbText).toContain('Agility');
			expect(crumbText).toContain('Stress');
			expect(crumbText).toContain('New subtrait');

			const lvl3CreateBtn = studioLvl3
				.findAll('button.editor-button')
				.find((b) => b.text().includes('Create subtrait'));
			expect(lvl3CreateBtn).toBeDefined();
			expect(lvl3CreateBtn!.attributes('disabled')).toBeDefined();
			studioLvl3.unmount();
		});

		it('mirrors Range with OUT chip, applies range across the set automatically, and wires Attributes (4 rows) and Values (4 parts) in Section Layout mini', async () => {
			const { default: TraitSetEditor } = await import('../js/trait-set-editor.vue');
			const { VANGUARD_FRAME_SHOWCASE } = await import('../js/showcase-templates.ts');
			const char = structuredClone(VANGUARD_FRAME_SHOWCASE.character);

			// 1. Subtrait editor mirrors Range with OUT chip, inline Pool/Spendable, no Apply-to-all button, and auto-syncs range across set
			const subEditor = mount(TraitEditor, {
				props: {
					character: char,
					traitSetID: 0, // Attributes
					traitID: 0,
					subtraitID: 0, // Stress
					traitPath: [0, 0],
					isSetSubtrait: true,
					open: true,
					submode: 'edit',
				},
				attachTo: document.body,
			});
			expect(subEditor.text()).not.toContain('Apply to all');
			const outChip = subEditor.find('.rating-scale-chip-out');
			expect(outChip.exists()).toBe(true);
			await outChip.trigger('click');
			expect(char.traitSets[0].traits[0].traits?.[0].rating?.out).toBe(true);
			expect(char.traitSets[0].traits[4].traits?.[0].rating?.out).toBe(true);
			subEditor.unmount();

			// 2. Attributes Section Layout mini renders 4 stacked rows (Attribute · Name, Attribute · Rating, Stress · Label, Stress · Rating) with no Subtrait · Subtraits
			const attrEditor = mount(TraitSetEditor, {
				props: { character: char, traitSetID: 0 },
				attachTo: document.body,
			});
			const attrBoxes = attrEditor.findAll('.row-mini-box');
			expect(attrBoxes.length).toBe(4);
			expect(attrBoxes.map((b) => b.find('.row-mini-name').text())).toEqual([
				'Attribute · Name',
				'Attribute · Rating',
				'Stress · Label',
				'Stress · Rating',
			]);
			attrEditor.unmount();

			// 3. Values Section Layout mini renders 4 parts (Value · Name, Statement · Rating, Value · Rating, Statement · Label)
			const valEditor = mount(TraitSetEditor, {
				props: { character: char, traitSetID: 4 },
				attachTo: document.body,
			});
			const valBoxes = valEditor.findAll('.row-mini-box');
			expect(valBoxes.length).toBe(4);
			const valNames = valBoxes.map((b) => b.find('.row-mini-name').text());
			expect(valNames).toContain('Value · Name');
			expect(valNames).toContain('Statement · Rating');
			expect(valNames).toContain('Value · Rating');
			expect(valNames).toContain('Statement · Label');
			valEditor.unmount();

			// 4. Mini editor supports bottom header, removing header, and removing any trait element
			const distChar = makeCharacter({
				name: 'Tester',
				traitSets: [
					makeTraitSet({
						name: 'Distinctions',
						noun: 'Distinction',
						view: { header: 'top', headerAlign: 'center' },
						traits: [{ name: 'Clever', rating: { type: 'Die', value: [8], range: [4, 6, 8, 10, 12] } }],
					}),
				],
			});
			const distEditor = mount(TraitSetEditor, {
				props: { character: distChar, traitSetID: 0 },
				attachTo: document.body,
			});
			// Set Header Bottom Bar updates row-mini to render header below body
			const bottomBtn = distEditor.find('button[title="Bottom bar header"]');
			expect(bottomBtn.exists()).toBe(true);
			await bottomBtn.trigger('click');
			expect(distChar.traitSets[0].view?.header).toBe('bottom');
			expect(distEditor.find('.row-mini-headerbar-bottom').exists()).toBe(true);

			// Remove header via row-mini remove button -> header = 'none', renders + Header restore button
			const removeHeaderBtn = distEditor.find('.row-mini-header-remove');
			expect(removeHeaderBtn.exists()).toBe(true);
			await removeHeaderBtn.trigger('click');
			expect(distChar.traitSets[0].view?.header).toBe('none');
			expect(distEditor.find('.row-mini-headerbox').exists()).toBe(false);
			expect(distEditor.find('.row-mini-restore-header').exists()).toBe(true);

			// TraitSetBlock hides .trait-set-header when header === 'none'
			const hiddenHeaderBlock = mount(TraitSetBlock, {
				props: { character: distChar, traitSetID: 0, submode: 'play' },
			});
			expect(hiddenHeaderBlock.find('.trait-set-header').exists()).toBe(false);
			hiddenHeaderBlock.unmount();

			// Remove every trait element from row-mini one by one down to 0
			let miniRemovers = distEditor.findAll('.row-mini-box .row-mini-remove');
			expect(miniRemovers.length).toBe(2);
			await miniRemovers[1].trigger('click');
			expect(distEditor.findAll('.row-mini-box').length).toBe(1);
			miniRemovers = distEditor.findAll('.row-mini-box .row-mini-remove');
			await miniRemovers[0].trigger('click');
			expect(distEditor.findAll('.row-mini-box').length).toBe(0);
			expect(distChar.traitSets[0].view?.parts).toEqual({});
			distEditor.unmount();

			// 5. Card Builder modal also supports bottom header, none header, and removing all parts
			const modalMini = mount(TraitSetMini, {
				props: { initialSet: { id: 'dist', name: 'Distinctions', noun: 'Distinction', traits: [] } },
			});
			const modalBottomBtn = modalMini.find('button[title="Bottom bar header"]');
			const noneHeaderBtn = modalMini.find('.row-mini-header-remove');
			expect(modalBottomBtn.exists()).toBe(true);
			expect(noneHeaderBtn.exists()).toBe(true);
			await modalBottomBtn.trigger('click');
			expect(modalMini.find('.trait-set.trait-set-header-bottom').exists()).toBe(true);
			await noneHeaderBtn.trigger('click');
			expect(modalMini.find('.trait-set-header').exists()).toBe(false);

			let modalRemovers = modalMini.findAll('.row-mini-box .row-mini-remove');
			expect(modalRemovers.length).toBe(2);
			await modalRemovers[1].trigger('click');
			expect(modalMini.findAll('.row-mini-box').length).toBe(1);
			modalRemovers = modalMini.findAll('.row-mini-box .row-mini-remove');
			await modalRemovers[0].trigger('click');
			expect(modalMini.findAll('.row-mini-box').length).toBe(0);
			modalMini.unmount();

			// 6. Image block shows a resizable Image box in the section mini and applies stored width/height
			const imgChar = makeCharacter({
				name: 'Tester',
				traitSets: [
					makeTraitSet({
						name: 'Art',
						view: {
							style: { body: 'image' },
							imageConfig: { url: 'x.png', width: '50%', height: '180px' },
						},
						traits: [],
					}),
				],
			});
			const imgEditor = mount(TraitSetEditor, {
				props: { character: imgChar, traitSetID: 0 },
				attachTo: document.body,
			});
			expect(imgEditor.find('.row-mini-imagebox').exists()).toBe(true);
			expect(imgEditor.find('.row-mini-imagebox').attributes('style')).toContain('width: 50%');
			expect(imgEditor.find('.row-mini-imagebox').attributes('style')).toContain('height: 180px');
			imgEditor.unmount();
			const imgBlock = mount(TraitSetBlock, {
				props: { character: imgChar, traitSetID: 0, submode: 'play' },
			});
			expect(imgBlock.find('.image-set-container').attributes('style')).toContain('width: 50%');
			imgBlock.unmount();

			// 6b. Border: Line preserves the Image set graphic and passes axe-core in edit & play
			const imgLineChar = makeCharacter({
				name: 'Tester',
				traitSets: [
					makeTraitSet({
						name: 'Art',
						view: {
							style: { body: 'image' },
							border: { shape: 'line', stroke: '2px', color: 'primary' },
							imageConfig: { url: 'x.png', height: 180 },
						},
						traits: [],
					}),
				],
			});
			for (const submode of ['edit', 'play'] as const) {
				const lineBlock = mount(TraitSetBlock, {
					props: { character: imgLineChar, traitSetID: 0, submode, editing: [] },
				});
				expect(lineBlock.find('.frame-line-svg').exists()).toBe(true);
				expect(lineBlock.find('.image-set-container').exists()).toBe(true);
				expect(lineBlock.find('.image-set-graphic').exists()).toBe(true);
				await runAxeAudit(lineBlock.element as HTMLElement);
				lineBlock.unmount();
			}

			// 6c. Image set hosts trait parts & traits with Background/Above/Below layering in editor & sheet
			const imgOverlayChar = reactive<CharacterModel>(
				makeCharacter({
					name: 'Tester',
					traitSets: [
						makeTraitSet({
							name: 'Backdrop',
							noun: 'Trait',
							view: {
								style: { body: 'image' },
								imageConfig: { url: 'x.png', width: '50%', height: '180px' },
							},
							traits: [],
						}),
					],
				}),
			);
			const imgOverlayEditor = mount(TraitSetEditor, {
				props: { character: imgOverlayChar, traitSetID: 0 },
			});
			expect(imgOverlayEditor.find('.row-mini-parts-bar').exists()).toBe(true);
			const chipByLabel = (label: string) =>
				imgOverlayEditor.findAll('.row-mini-part-chip').find((b) => b.text().includes(label));
			await chipByLabel('Name')!.trigger('click');
			await chipByLabel('Rating')!.trigger('click');
			expect(imgOverlayChar.traitSets[0].view?.parts).toHaveProperty('name');
			expect(imgOverlayChar.traitSets[0].view?.parts).toHaveProperty('rating');
			expect(imgOverlayEditor.find('.row-mini-imagebox').exists()).toBe(true);
			expect(imgOverlayEditor.find('.row-mini-over-image .row-mini-box').exists()).toBe(true);
			const layerBtn = (label: string) =>
				imgOverlayEditor.findAll('.editor-group-btn').find((b) => b.text().trim() === label);
			await layerBtn('Above')!.trigger('click');
			expect(imgOverlayChar.traitSets[0].view?.imageConfig?.layout).toBe('above');
			expect(imgOverlayEditor.find('.image-mini-layout-above').exists()).toBe(true);
			await layerBtn('Below')!.trigger('click');
			expect(imgOverlayChar.traitSets[0].view?.imageConfig?.layout).toBe('below');
			expect(imgOverlayEditor.find('.image-mini-layout-below').exists()).toBe(true);
			await layerBtn('Background')!.trigger('click');
			expect(imgOverlayChar.traitSets[0].view?.imageConfig?.layout).toBeUndefined();
			expect(imgOverlayEditor.find('.image-mini-layout-overlay').exists()).toBe(true);
			expect(layerBtn('Background')!.attributes('aria-pressed')).toBe('true');
			await runAxeAudit(imgOverlayEditor.element as HTMLElement);
			imgOverlayEditor.unmount();

			imgOverlayChar.traitSets[0].traits.push({
				name: 'Vanguard',
				rating: { type: 'Die', value: [8], range: [4, 6, 8, 10, 12] },
				traits: [],
				tags: [],
				description: '',
			});
			for (const submode of ['edit', 'play'] as const) {
				const overlayBlock = mount(TraitSetBlock, {
					props: { character: imgOverlayChar, traitSetID: 0, submode, editing: [] },
				});
				expect(overlayBlock.find('.image-set-container.has-overlay-traits').exists()).toBe(true);
				expect(overlayBlock.find('.image-set-graphic').exists()).toBe(true);
				expect(overlayBlock.find('.image-set-overlay-traits .trait-parts').exists()).toBe(true);
				if (submode === 'play') {
					const dieBtn = overlayBlock.find(
						'.image-set-overlay-traits .trait-part-rating [role="button"][aria-label*="Stage d8"]',
					);
					expect(dieBtn.exists()).toBe(true);
					await dieBtn.trigger('click');
					expect(overlayBlock.emitted('addDieToRoller')?.length).toBe(1);
				}
				await runAxeAudit(overlayBlock.element as HTMLElement);
				overlayBlock.unmount();
			}

			// 7. Ring set with no stored parts previews name and rating inline, as it renders
			const ringChar = makeCharacter({
				name: 'Tester',
				traitSets: [
					makeTraitSet({
						name: 'Ring Set',
						noun: 'Distinction',
						view: { frame: { shape: 'ring' } },
						traits: [{ name: 'A', rating: { type: 'Die', value: [8], range: [4, 6, 8, 10, 12] } }],
					}),
				],
			});
			const ringEditor = mount(TraitSetEditor, {
				props: { character: ringChar, traitSetID: 0 },
				attachTo: document.body,
			});
			const ringBoxes = ringEditor.findAll('.row-mini-box');
			expect(ringBoxes.length).toBe(2);
			const rowOf = (b: { attributes: (name: string) => string | undefined }) =>
				(b.attributes('style') || '').match(/grid-row: (\d+)/)?.[1];
			expect(rowOf(ringBoxes[0])).toBe(rowOf(ringBoxes[1]));
			ringEditor.unmount();
		});

		it('renders Vanguard Values statement with zero duplication, places pip and box in dynamic grid cells, and renders Library card hero traits in 3 o clock arc distribution', async () => {
			const { default: TraitSetBlock } = await import('../js/trait-set-block.vue');
			const { default: PortraitRing } = await import('../js/portrait-ring.vue');
			const { VANGUARD_FRAME_SHOWCASE } = await import('../js/showcase-templates.ts');
			const char = structuredClone(VANGUARD_FRAME_SHOWCASE.character);

			// 1. Mount Values set: zero duplicate statements, pip in child:Statement:rating, box in child:Statement:label
			const valuesWrapper = mount(TraitSetBlock, {
				props: {
					character: char,
					traitSetID: 4, // Values
					submode: 'edit',
					editing: [],
				},
				attachTo: document.body,
			});

			const dutyRow = valuesWrapper.find('.trait[data-trait-name="Duty"]');
			expect(dutyRow.exists()).toBe(true);

			// Exactly one occurrence of the statement text
			const textMatches = dutyRow.text().match(/The crew comes home before the cargo\./g);
			expect(textMatches?.length).toBe(1);

			// Statement pip is in child:Statement:rating cell, not in name cell
			const pipInRatingCell = dutyRow.find('.trait-part-child-Statement-rating .pip');
			expect(pipInRatingCell.exists()).toBe(true);
			const pipInNameCell = dutyRow.find('.trait-part-name .pip');
			expect(pipInNameCell.exists()).toBe(false);

			// Clicking pip toggles questioned state
			expect((char.traitSets[4].traits[0].traits?.[0].rating?.value as unknown[])?.[0]).toBe(false);
			await pipInRatingCell.trigger('click');
			expect((char.traitSets[4].traits[0].traits?.[0].rating?.value as unknown[])?.[0]).toBe(true);

			// Statement box is in child:Statement:label cell, not in name cell
			const boxInLabelCell = dutyRow.find('.trait-part-child-Statement-label .trait-pip-box');
			expect(boxInLabelCell.exists()).toBe(true);
			const boxInNameCell = dutyRow.find('.trait-part-name .trait-pip-box');
			expect(boxInNameCell.exists()).toBe(false);

			valuesWrapper.unmount();

			// 2. Library card hero: arc distribution at 3 o'clock (1:30, 3:00, 4:30)
			const mockLibraryTmpl = {
				id: 'snowfall',
				title: 'Snowfall Initiative',
				subtitle: 'Cold War Espionage',
				listing: {
					image: 'data:image/png;base64,mock',
					setting: 'd10',
					complexity: 'd8',
					prep: 'd8',
				},
			};
			const ringChar = {
				name: mockLibraryTmpl.title,
				portrait: { url: mockLibraryTmpl.listing.image },
				traitSets: [
					{
						id: 'ratings',
						name: 'Ratings',
						traits: [
							{ name: 'Setting', rating: { type: 'Die', value: [10] }, dice: [] },
							{ name: 'Prep', rating: { type: 'Die', value: [8] }, dice: [] },
							{ name: 'Complexity', rating: { type: 'Die', value: [8] }, dice: [] },
						],
					},
				],
			};

			const ringWrapper = mount(PortraitRing, {
				props: {
					character: ringChar,
					editing: [],
					ringTraitID: 0,
				},
				attachTo: document.body,
			});

			const ringTraits = ringWrapper.findAll('.ring-trait');
			expect(ringTraits.length).toBe(3);

			// Prep: angle 0° (3 o'clock) -> sits at tighter right baseline at 3 o'clock (x=100%, y=50%)
			expect(ringTraits[1].find('.ring-trait-name').text()).toBe('Prep');
			const style1 = ringTraits[1].attributes('style') || '';
			expect(style1).toContain('left: calc(100%)');
			expect(style1).toContain('top: calc(50%)');

			ringWrapper.unmount();
		});

		it('supports on-sheet editable toggle for statements, rating selector die chips with OUT option, and set-level subtrait noun editing', async () => {
			const { default: TraitSetBlock } = await import('../js/trait-set-block.vue');
			const { VANGUARD_FRAME_SHOWCASE } = await import('../js/showcase-templates.ts');
			const char = structuredClone(VANGUARD_FRAME_SHOWCASE.character);
			const valuesSet = char.traitSets.find((ts) => ts.name === 'Values');
			expect(valuesSet).toBeDefined();

			// 1. With editableOnSheet true on Values trait, renders input on sheet
			const dutyTrait = valuesSet!.traits.find((t) => t.name === 'Duty')!;
			expect(dutyTrait).toBeDefined();
			dutyTrait.view = { editableOnSheet: true };

			const valuesWrapper = mount(TraitSetBlock, {
				props: {
					character: char,
					traitSetID: 4, // Values
					submode: 'play',
					editing: [],
				},
				attachTo: document.body,
			});

			const statementInput = valuesWrapper.find('.trait[data-trait-name="Duty"] input.trait-pip-input');
			expect(statementInput.exists()).toBe(true);
			expect((statementInput.element as HTMLInputElement).value).toBe('The crew comes home before the cargo.');

			// Typing in input updates statement text
			await statementInput.setValue('Protect the outpost.');
			const dutyStatementChild = dutyTrait.traits![0];
			expect(dutyStatementChild.name).toBe('Protect the outpost.');

			valuesWrapper.unmount();

			// 2. TraitEditor Rating Selector with die chips and Range OUT integration
			const traitEditorWrapper = mount(TraitEditor, {
				props: {
					character: char,
					traitSetID: 4,
					traitID: 0, // Duty
					open: true,
					submode: 'edit',
				},
				attachTo: document.body,
			});

			// Verify rating selector renders rating-scale-chips
			const ratingChips = traitEditorWrapper.findAll('.editor-field .rating-scale-chips .rating-scale-chip');
			expect(ratingChips.length).toBeGreaterThanOrEqual(5);

			// Initially OUT is not in rating chips
			const ratingOutChipBefore = traitEditorWrapper.find('.editor-rating-chips .rating-scale-chip-out');
			expect(ratingOutChipBefore.exists()).toBe(false);

			// Toggle OUT in Range section
			const rangeOutBtn = traitEditorWrapper.find(
				'.range-scale-container .rating-scale-chip-out, .rating-scale-chip-out',
			);
			expect(rangeOutBtn.exists()).toBe(true);
			await rangeOutBtn.trigger('click');

			// Now OUT is displayed in Rating chips!
			const ratingOutChipAfter = traitEditorWrapper.find('.editor-rating-chips .rating-scale-chip-out');
			expect(ratingOutChipAfter.exists()).toBe(true);

			// Click OUT in Rating chips
			await ratingOutChipAfter.trigger('click');
			expect(dutyTrait.isOut).toBe(true);

			traitEditorWrapper.unmount();

			// 3. Drill down into set-level subtrait from parent set: shows Noun: Statement, Plural: Statements
			const setSubEditor = mount(TraitEditor, {
				props: {
					character: char,
					traitSetID: 4,
					traitID: 0,
					subtraitID: 0,
					traitPath: [0, 0],
					isSetSubtrait: true,
					open: true,
					submode: 'edit',
				},
				attachTo: document.body,
			});

			// Displays Noun label and input with 'Statement', NOT instance text!
			expect(setSubEditor.find('label[for="trait-name-0"]').text()).toBe('Noun');
			const nounInput = setSubEditor.find('input[name="subtraitNoun"]');
			expect(nounInput.exists()).toBe(true);
			expect((nounInput.element as HTMLInputElement).value).toBe('Statement');

			const pluralInput = setSubEditor.find('input[name="subtraitPlural"]');
			expect(pluralInput.exists()).toBe(true);
			expect((pluralInput.element as HTMLInputElement).value).toBe('Statements');

			setSubEditor.unmount();
		});

		it('surfaces Distinctions SFX (Hinder) as child subtrait in TraitSetEditor and TraitEditor with delete and ratingDisplay options', async () => {
			const { default: TraitSetEditor } = await import('../js/trait-set-editor.vue');
			const { VANGUARD_FRAME_SHOWCASE } = await import('../js/showcase-templates.ts');
			const char = structuredClone(VANGUARD_FRAME_SHOWCASE.character);
			const distinctionsSetIdx = char.traitSets.findIndex((ts) => ts.name === 'Distinctions');
			expect(distinctionsSetIdx).toBeGreaterThanOrEqual(0);
			const distinctionsSet = char.traitSets[distinctionsSetIdx];

			// 1. Mount TraitSetEditor for Distinctions
			const setEditor = mount(TraitSetEditor, {
				props: {
					character: char,
					traitSetID: distinctionsSetIdx,
				},
				attachTo: document.body,
			});

			// Rating display button group is rendered right under Rating
			const ratingDisplayBtns = setEditor.findAll('.editor-field .editor-button-group .editor-group-btn');
			const displayTexts = ratingDisplayBtns.map((b) => b.text());
			expect(displayTexts).toContain('Full Track');
			expect(displayTexts).toContain('Single Die');

			// Clicking 'Full Track' or 'Single Die' toggles ratingDisplay
			const singleDieBtn = ratingDisplayBtns.find((b) => b.text() === 'Single Die');
			expect(singleDieBtn).toBeDefined();
			await singleDieBtn!.trigger('click');
			expect(distinctionsSet.view?.ratingDisplay).toBe('rating');

			// Subtraits section displays Hinder with SFX summary badge
			const subtraitRows = setEditor.findAll('.editor-subtrait-row');
			expect(subtraitRows.length).toBeGreaterThanOrEqual(1);
			const hinderRow = subtraitRows.find((r) => r.text().includes('Hinder'));
			expect(hinderRow).toBeDefined();
			expect(hinderRow!.find('.editor-subtrait-badge').text()).toBe('SFX');

			// Clicking delete on Hinder row removes Hinder from all distinctions in the set
			const deleteBtn = hinderRow!.find('.editor-subtrait-delete');
			expect(deleteBtn.exists()).toBe(true);
			await deleteBtn.trigger('click');

			// Check that traits no longer have SFX
			for (const tr of distinctionsSet.traits) {
				const hasHinder = tr.traits?.some((st) => st.name === 'Hinder' || st.name === 'SFX');
				expect(hasHinder).toBeFalsy();
			}

			setEditor.unmount();

			// 2. TraitEditor on an individual distinction also surfaces Hinder
			const charWithHinder = structuredClone(VANGUARD_FRAME_SHOWCASE.character);
			const traitEditor = mount(TraitEditor, {
				props: {
					character: charWithHinder,
					traitSetID: distinctionsSetIdx,
					traitID: 0, // Slipstream Test Pilot
					open: true,
					submode: 'edit',
				},
				attachTo: document.body,
			});

			const traitSubRows = traitEditor.findAll('.editor-subtrait-row');
			const traitHinderRow = traitSubRows.find((r) => r.text().includes('Hinder'));
			expect(traitHinderRow).toBeDefined();
			expect(traitHinderRow!.find('.editor-subtrait-badge').text()).toBe('SFX');

			// Delete on trait editor removes Hinder from this trait
			const traitDeleteBtn = traitHinderRow!.find('.editor-subtrait-delete');
			await traitDeleteBtn.trigger('click');
			const firstTrait = charWithHinder.traitSets[distinctionsSetIdx].traits[0];
			const stillHasHinder = firstTrait.traits?.some((st) => st.name === 'Hinder' || st.name === 'SFX');
			expect(stillHasHinder).toBeFalsy();

			traitEditor.unmount();
		});

		it('verifies Part A: ring into frame, frame images, zoom, and pointer events', async () => {
			const char = makeCharacter({
				name: 'Test Pilot',
				portrait: { url: 'https://example.com/portrait.jpg', view: { zoom: 1 } },
				traitSets: [
					// Set 0: frame shape ring
					makeTraitSet({
						name: 'Roles',
						noun: 'Role',
						view: {
							frame: {
								shape: 'ring',
								image: { url: 'https://example.com/frame-hub.jpg', zoom: 1.5 },
								ring: { arcAngle: -45, arcSpread: 120 },
							},
						},
						traits: [
							{ name: 'Pilot', rating: { type: 'Die', value: [8] } },
							{ name: 'Engineer', rating: { type: 'Die', value: [10] } },
						],
					}),
					// Set 1: style alias portrait-ring with frame.ring + imageConfig
					makeTraitSet({
						name: 'Alias Roles',
						noun: 'Role',
						view: {
							style: { body: 'portrait-ring' },
							frame: { shape: 'ring', ring: { arcAngle: -90, arcSpread: 100 } },
							imageConfig: { url: 'https://example.com/alias-hub.jpg', zoom: 0.75 },
						},
						traits: [{ name: 'Gunner', rating: { type: 'Die', value: [8] } }],
					}),
					// Set 2: block border + portrait circle frame with image
					makeTraitSet({
						name: 'Equipment',
						noun: 'Item',
						view: {
							border: 'block',
							frame: {
								shape: 'circle',
								image: { url: 'https://example.com/hero.jpg' },
							},
						},
						traits: [{ name: 'Blaster', rating: { type: 'Die', value: [6] } }],
					}),
					// Set 3: line border divider (no portrait hub)
					makeTraitSet({
						name: 'Divider Set',
						noun: 'Divider',
						view: {
							border: 'line',
						},
						traits: [{ name: 'Note', rating: { type: 'Die', value: [6] } }],
					}),
				],
			});

			// 1. Ring framed set renders inside its block
			const w0 = mount(TraitSetBlock, {
				props: { character: char, traitSetID: 0, submode: 'edit', editing: [] },
			});
			expect(w0.find('.portrait').exists()).toBe(true);
			expect(w0.findAll('.ring-trait').length).toBe(2);

			// Center circle uses frame.image.url and zoom 1.5 (150%)
			const circle0 = w0.find('.portrait-circle');
			expect(circle0.exists()).toBe(true);
			const style0 = circle0.attributes('style') || '';
			expect(style0).toContain('https://example.com/frame-hub.jpg');
			expect(style0).toContain('background-size: 150%');

			// Pointerdown drag test on ring trait
			const trait0 = w0.find('.ring-trait');
			expect(trait0.exists()).toBe(true);
			expect(trait0.attributes('onmousedown')).toBeUndefined();
			trait0.element.dispatchEvent(new Event('pointerdown'));
			w0.unmount();

			// 2. Style body alias portrait-ring renders ring with imageConfig
			const w1 = mount(TraitSetBlock, {
				props: { character: char, traitSetID: 1, submode: 'edit', editing: [] },
			});
			expect(w1.find('.portrait').exists()).toBe(true);
			const circle1 = w1.find('.portrait-circle');
			const style1 = circle1.attributes('style') || '';
			expect(style1).toContain('https://example.com/alias-hub.jpg');
			expect(style1).toContain('background-size: 75%');
			w1.unmount();

			// 3. Block border + portrait circle frame renders block border AND portrait hub
			const w2 = mount(TraitSetBlock, {
				props: { character: char, traitSetID: 2, submode: 'edit', editing: [] },
			});
			expect(w2.find('.trait-set-frame-svg.frame-block-svg').exists()).toBe(true);
			const circle2 = w2.find('.portrait-circle');
			expect(circle2.exists()).toBe(true);
			expect(circle2.attributes('style')).toContain('https://example.com/hero.jpg');
			w2.unmount();

			// 4. Line border renders line SVG without portrait hub
			const w3 = mount(TraitSetBlock, {
				props: { character: char, traitSetID: 3, submode: 'edit', editing: [] },
			});
			expect(w3.find('.trait-set-frame-svg.frame-line-svg').exists()).toBe(true);
			expect(w3.find('.portrait').exists()).toBe(false);
			w3.unmount();
		});

		it('verifies Part B: generic Pip-child path, removal of statement shortcuts, and editableOnSheet', async () => {
			const char = makeCharacter({
				name: 'Test Pilot',
				traitSets: [
					makeTraitSet({
						name: 'Values',
						noun: 'Value',
						view: {
							editableOnSheet: true,
						},
						traits: [
							{
								name: 'Duty',
								description: 'The crew comes home before the cargo.',
								rating: { type: 'Die', value: [8] },
								traits: [
									{
										name: 'Existing statement',
										description: '',
										tags: [],
										rating: { type: 'Pip', value: [false] },
										traits: [],
										view: {},
									},
								],
							},
							{
								name: 'Glory',
								description: 'No jump vector is impossible.',
								rating: { type: 'Die', value: [8] },
								// No pip child yet
							},
						],
					}),
				],
			});

			let tsApi!: ReturnType<typeof useTraitSet>;
			const TestHarness = defineComponent({
				props: { submode: { type: String, default: 'edit' } },
				setup(props, { emit }) {
					tsApi = useTraitSet(
						{ character: char, traitSetID: 0, submode: props.submode || 'edit' } as TraitSetProps,
						emit,
					);
					return () => h('div');
				},
			});

			const harness = mount(TestHarness, { props: { submode: 'edit' } });

			// 1. Statement shortcuts are gone from API, generic ones present
			const tsApiRecord = tsApi as unknown as Record<string, unknown>;
			expect(tsApiRecord.canEditStatement).toBeUndefined();
			expect(tsApiRecord.getStatementText).toBeUndefined();
			expect(tsApiRecord.setStatementText).toBeUndefined();
			expect(typeof tsApi.canEditChildOnSheet).toBe('function');
			expect(typeof tsApi.setPipChildName).toBe('function');

			// 2. canEditChildOnSheet gate logic
			expect(tsApi.canEditChildOnSheet(char.traitSets[0].traits[0], char.traitSets[0])).toBe(true);
			// In print mode, returns false
			let printTsApi!: ReturnType<typeof useTraitSet>;
			const PrintHarness = defineComponent({
				setup(_p, { emit }) {
					printTsApi = useTraitSet({ character: char, traitSetID: 0, submode: 'print' } as TraitSetProps, emit);
					return () => h('div');
				},
			});
			const printHarness = mount(PrintHarness);
			expect(printTsApi.canEditChildOnSheet(char.traitSets[0].traits[0], char.traitSets[0])).toBe(false);
			printHarness.unmount();

			// 3. getChildTraitByNoun has no statement branch and does not synthesize from description
			expect(tsApi.getChildTraitByNoun(char.traitSets[0].traits[1], 'statement')).toBeUndefined();

			// 4. togglePip on trait with NO child creates an UNNAMED child with empty view
			const gloryTrait = char.traitSets[0].traits[1];
			expect(tsApi.getPipChild(gloryTrait)).toBeUndefined();
			tsApi.togglePip(0, 1);
			const newPipChild = tsApi.getPipChild(gloryTrait)!;
			expect(newPipChild).toBeDefined();
			expect(newPipChild.name).toBe('');
			expect(newPipChild.view).toEqual({});
			expect(newPipChild.rating).toEqual({ type: 'Pip', value: [true] });

			// 5. setPipChildName updates child name and creates unnamed pip child if missing
			tsApi.setPipChildName(gloryTrait, 'Updated glory text');
			expect(tsApi.getPipChild(gloryTrait)?.name).toBe('Updated glory text');

			const newTraitWithoutChild = makeTrait({
				name: 'Justice',
				description: 'Justice description',
				rating: { type: 'Die', value: [8] },
			});
			tsApi.setPipChildName(newTraitWithoutChild, 'Freshly typed statement');
			const createdChild = tsApi.getPipChild(newTraitWithoutChild)!;
			expect(createdChild).toBeDefined();
			expect(createdChild.name).toBe('Freshly typed statement');
			expect(createdChild.view).toEqual({});
			expect(createdChild.rating).toEqual({ type: 'Pip', value: [false] });

			harness.unmount();

			// 6. Inline inputs in TraitSetBlock gate on editability and display fallback description
			const blockEditable = mount(TraitSetBlock, {
				props: { character: char, traitSetID: 0, submode: 'edit', editing: [] },
			});
			const inputs = blockEditable.findAll('input.trait-pip-input');
			expect(inputs.length).toBeGreaterThan(0);
			// First trait has existing pip child
			expect((inputs[0].element as HTMLInputElement).value).toBe('Existing statement');
			blockEditable.unmount();

			// Without editableOnSheet and playMutable, inputs do not render
			const nonEditableChar = structuredClone(char);
			if (nonEditableChar.traitSets[0].view) delete nonEditableChar.traitSets[0].view.editableOnSheet;
			const blockNonEditable = mount(TraitSetBlock, {
				props: { character: nonEditableChar, traitSetID: 0, submode: 'edit', editing: [] },
			});
			expect(blockNonEditable.findAll('input.trait-pip-input').length).toBe(0);
			blockNonEditable.unmount();
		});

		it('verifies trait editor has no dedicated statement field, Pip child is editable via Subtraits drill-in, and multidie badge has active without c', async () => {
			const char = makeCharacter({
				name: 'Test Character',
				traitSets: [
					makeTraitSet({
						name: 'Values',
						noun: 'Value',
						traits: [
							{
								name: 'Duty',
								rating: { type: 'Die', value: [8] },
								traits: [
									{
										name: 'Initial Statement',
										rating: { type: 'Pip', value: [false] },
									},
								],
							},
						],
					}),
					makeTraitSet({
						name: 'Assets',
						noun: 'Asset',
						traits: [
							{
								name: 'Vehicle',
								rating: { type: 'Dice', value: [6, 8] },
							},
						],
					}),
				],
			});

			// 1. TraitEditor on parent trait has NO dedicated statement field
			const traitEditor = mount(TraitEditor, {
				props: {
					character: char,
					traitSetID: 0,
					traitID: 0,
					open: true,
					submode: 'edit',
				},
				attachTo: document.body,
			});
			expect(traitEditor.find('input[name="traitStatement"]').exists()).toBe(false);
			expect(traitEditor.find('#trait-statement-0').exists()).toBe(false);

			// Subtrait row for the Pip child is listed in Subtraits drill-in list
			const subRows = traitEditor.findAll('.editor-subtrait-row');
			expect(subRows.length).toBe(1);
			expect(subRows[0].text()).toContain('Initial Statement');
			traitEditor.unmount();

			// 2. Subtrait is editable via TraitEditor subtrait mode
			const subtraitEditor = mount(TraitEditor, {
				props: {
					character: char,
					traitSetID: 0,
					traitID: 0,
					subtraitID: 0,
					open: true,
					submode: 'edit',
				},
				attachTo: document.body,
			});
			const nameInput = subtraitEditor.find('input[name="traitName"]');
			expect(nameInput.exists()).toBe(true);
			expect((nameInput.element as HTMLInputElement).value).toBe('Initial Statement');
			await nameInput.setValue('Edited via Drilldown');
			expect(char.traitSets[0].traits[0].traits?.[0].name).toBe('Edited via Drilldown');
			subtraitEditor.unmount();

			// 3. TraitSetBlock multidie badge: has 'active' class, NO 'c' class
			const block = mount(TraitSetBlock, {
				props: {
					character: char,
					traitSetID: 1,
					submode: 'edit',
					editing: [],
				},
			});
			const badges = block.findAll('.multidie-badge-wrap span');
			expect(badges.length).toBeGreaterThanOrEqual(1);
			for (const b of badges) {
				expect(b.classes()).toContain('active');
				expect(b.classes()).not.toContain('c');
			}
			block.unmount();
		});

		it('empty portrait-ring renders interactive drop-zone in edit mode only and passes axe-core', async () => {
			const char = makeCharacter({
				id: 'ring-empty-test',
				name: 'Empty Ring',
				portrait: { url: '', alt: '', tags: [] },
				traitSets: [
					makeTraitSet({
						id: 'attr-ring',
						name: 'Attributes',
						noun: 'Attribute',
						plural: 'Attributes',
						description: '',
						tags: [],
						traits: [{ name: 'Agility', rating: { type: 'Die', value: [8] }, traits: [], description: '', tags: [] }],
						view: {
							style: { body: 'portrait-ring', header: 'none' },
							frame: { shape: 'ring', span: [0, 360], color: 'primary', stroke: '2px' },
						},
					}),
				],
			});

			const editWrapper = mount(TraitSetBlock, {
				props: { character: char, traitSetID: 0, submode: 'edit', editing: [] },
			});
			expect(editWrapper.find('.ring-portrait-dropzone').exists()).toBe(true);
			expect(editWrapper.html()).not.toContain('cortex_prime_logo');
			await runAxeAudit(editWrapper.element as HTMLElement);
			editWrapper.unmount();

			const playWrapper = mount(TraitSetBlock, {
				props: { character: char, traitSetID: 0, submode: 'play', editing: [] },
			});
			expect(playWrapper.find('.ring-portrait-dropzone').exists()).toBe(false);
			expect(playWrapper.html()).not.toContain('cortex_prime_logo');
			playWrapper.unmount();
		});

		it('exposes inline Parts Palette, Label/Text toggle, and non-exclusive Portrait Ring presetting in TraitSetEditor with zero a11y violations', async () => {
			const char = reactive<CharacterModel>(
				makeCharacter({
					id: 'parts-palette-test',
					name: 'Palette Hero',
					traitSets: [
						makeTraitSet({
							id: 'dist',
							name: 'Distinctions',
							noun: 'Distinction',
							view: {
								header: 'top',
								border: { shape: 'block', corner: 8, color: 'primary' },
								parts: {
									name: { left: '0%', top: 0, width: '70%', height: 1, marker: 'L' },
									rating: { left: '70%', top: 0, width: '30%', height: 1 },
								},
							},
							traits: [{ name: 'Clever', rating: { type: 'Die', value: [8] }, traits: [] }],
						}),
						makeTraitSet({
							id: 'skills',
							name: 'Skills',
							noun: 'Skill',
							view: {
								header: 'top',
								style: { body: 'portrait-ring' },
								frame: { shape: 'circle', array: 'ring', color: 'primary' },
							},
							traits: [{ name: 'Fly', rating: { type: 'Die', value: [6] }, traits: [] }],
						}),
					],
				}),
			);

			const wrapper = mount(TraitSetEditor, {
				props: { character: char, traitSetID: 0, open: true },
				attachTo: document.body,
			});

			// Inline Parts Palette toggles view.parts directly inside docked editor
			const sfxChip = wrapper.findAll('.row-mini-parts-bar .row-mini-part-chip').find((b) => b.text().trim() === 'SFX');
			expect(sfxChip).toBeDefined();
			expect(sfxChip!.attributes('aria-pressed')).toBe('false');
			await sfxChip!.trigger('click');
			expect(char.traitSets[0].view?.parts?.block).toBeDefined();
			expect(sfxChip!.attributes('aria-pressed')).toBe('true');

			// Selecting Name box reveals Label/Text segmented behavior bar and toggles marker
			const nameBox = wrapper.findAll('.row-mini-box').find((el) => el.find('.row-mini-name').text().includes('Name'));
			expect(nameBox).toBeDefined();
			await nameBox!.trigger('click');
			const behaviorBar = wrapper.find('.row-mini-behavior-bar');
			expect(behaviorBar.exists()).toBe(true);
			const textBtn = behaviorBar.findAll('.editor-group-btn').find((b) => b.text().trim() === 'Text');
			expect(textBtn).toBeDefined();
			await textBtn!.trigger('click');
			expect((char.traitSets[0].view?.parts?.name as { marker?: string } | undefined)?.marker).toBe('T');

			// Style: Portrait Ring presets set 0 without mutating sibling set 1
			const styleSelect = wrapper.find('#trait-set-style-0');
			if (styleSelect.exists()) {
				await styleSelect.setValue('portrait-ring');
				const frame0 = char.traitSets[0].view?.frame as { shape?: string; array?: string } | undefined;
				expect(frame0?.shape).toBe('circle');
				expect(frame0?.array).toBe('ring');
				expect(char.traitSets[1].view?.style?.body).toBe('portrait-ring');
			}

			await runAxeAudit(wrapper.element as HTMLElement);
			wrapper.unmount();
		});
	});

	describe('Mobile Chrome Consolidation & Three-State Roller Drawer', () => {
		it('renders #mobile-sheet-menu in AppHeader with open-sheet switcher, session actions, and Play/Edit mode parity', async () => {
			const playHeader = mount(AppHeader, {
				props: {
					mode: 'character',
					submode: 'play',
					hasCharacter: true,
					canUndo: false,
					canRedo: false,
					openCharacters: [
						{ id: 'c1', name: 'Ariadne', traitSets: [] },
						{ id: 'c2', name: 'Mal', traitSets: [] },
					],
					characterID: 'c1',
					activeCharacterName: 'Ariadne',
					sessionDirty: true,
					isDarkMode: false,
					drawerState: 'staged',
				},
				attachTo: document.body,
			});

			expect(playHeader.find('header.header').attributes('data-mode')).toBe('character');
			expect(playHeader.find('header.header').attributes('data-submode')).toBe('play');
			expect(playHeader.find('header.header').attributes('data-drawer-state')).toBe('staged');

			const trigger = playHeader.find('.mobile-sheet-trigger');
			expect(trigger.exists()).toBe(true);
			await trigger.trigger('click');

			const menu = playHeader.find('#mobile-sheet-menu');
			expect(menu.exists()).toBe(true);

			const sheetItems = menu.findAll('.mobile-sheet-item');
			expect(sheetItems).toHaveLength(2);
			await sheetItems[1].trigger('click');
			expect(playHeader.emitted('focusCharacter')?.[0]).toEqual(['c2']);

			const openSheetBtn = menu.findAll('.mobile-sheet-action-btn').find((b) => b.text().includes('Open Sheet'));
			expect(openSheetBtn).toBeDefined();
			await openSheetBtn!.trigger('click');
			expect(playHeader.emitted('addCharacter')).toHaveLength(1);

			const saveBtn = menu.findAll('.mobile-sheet-action-btn').find((b) => b.text().includes('Save'));
			expect(saveBtn).toBeDefined();
			await saveBtn!.trigger('click');
			expect(playHeader.emitted('saveSession')).toHaveLength(1);

			const printBtn = menu.find('button[aria-label="Print"]');
			expect(printBtn.exists()).toBe(true);
			await printBtn.trigger('click');
			expect(playHeader.emitted('navigate')?.[0]).toEqual(['character', 'print']);

			const themeBtn = menu.find('button[aria-label="Switch to dark mode"]');
			expect(themeBtn.exists()).toBe(true);
			await themeBtn.trigger('click');
			expect(playHeader.emitted('toggleTheme')).toHaveLength(1);

			await runAxeAudit(playHeader.element as HTMLElement);
			playHeader.unmount();

			const editHeader = mount(AppHeader, {
				props: {
					mode: 'character',
					submode: 'edit',
					hasCharacter: true,
					openCharacters: [{ id: 'c1', name: 'Ariadne', traitSets: [] }],
					characterID: 'c1',
					activeCharacterName: 'Ariadne',
					canUndo: true,
					canRedo: false,
					isDarkMode: false,
					isStudioOpen: false,
				},
				attachTo: document.body,
			});

			const studioToggleBtn = editHeader.find('.header-btn-studio');
			expect(studioToggleBtn.exists()).toBe(true);
			expect(studioToggleBtn.attributes('aria-pressed')).toBe('false');
			await studioToggleBtn.trigger('click');
			expect(editHeader.emitted('toggleStudio')).toHaveLength(1);
			await editHeader.setProps({ isStudioOpen: true });
			expect(editHeader.find('.header-btn-studio').attributes('aria-pressed')).toBe('true');

			const editMenu = editHeader.find('#mobile-sheet-menu');
			const settingsBtn = editMenu.findAll('.mobile-sheet-action-btn').find((b) => b.text().includes('Sheet Settings'));
			expect(settingsBtn).toBeDefined();
			await settingsBtn!.trigger('click');
			expect(editHeader.emitted('openSheetProperties')).toHaveLength(1);

			const undoBtn = editMenu.findAll('.mobile-sheet-action-btn').find((b) => b.text().includes('Undo'));
			expect(undoBtn).toBeDefined();
			await undoBtn!.trigger('click');
			expect(editHeader.emitted('undo')).toHaveLength(1);

			await runAxeAudit(editHeader.element as HTMLElement);
			editHeader.unmount();
		});

		it('drives three-state drawer transitions and sticky .roller-action-bar inside StudioPanel Play mode', async () => {
			const pool = reactive(makePool([{ size: 8, source: 'Distinctive' }]));
			const oppPool = reactive(makePool());
			const char = reactive<CharacterModel>(
				makeCharacter({
					id: 'drawer-char',
					name: 'Drawer Hero',
					plotPoints: 2,
					traitSets: [],
				}),
			);

			const splitPanel = mount(StudioPanel, {
				props: {
					character: char,
					mode: 'character',
					submode: 'play',
					isOpen: true,
					panelTab: 'roller',
					drawerState: 'split',
					dicePool: pool,
					oppositionPool: oppPool,
					activePoolSide: 'player',
				},
				attachTo: document.body,
			});

			expect(splitPanel.find('.studio-panel.is-play').attributes('data-state')).toBe('split');
			expect(splitPanel.find('.studio-roller-heading').text()).toBe('Dice Pool');
			// Sticky action bar is outside .roller-body so it stays pinned at drawer bottom
			const actionBar = splitPanel.find('.roller-action-bar');
			expect(actionBar.exists()).toBe(true);
			expect(actionBar.find('.roller-roll-btn').exists()).toBe(true);
			expect(splitPanel.find('.roller-body .roller-roll-btn').exists()).toBe(false);

			const expandBtn = splitPanel.find('.studio-mobile-drawer-controls button[aria-label="Expand roller"]');
			expect(expandBtn.exists()).toBe(true);
			await expandBtn.trigger('click');
			expect(splitPanel.emitted('update:drawerState')?.[0]).toEqual(['full']);

			await splitPanel.setProps({ drawerState: 'full' });
			expect(splitPanel.find('.studio-panel.is-play').attributes('data-state')).toBe('full');

			const toSplitBtn = splitPanel.find('.studio-mobile-drawer-controls button[aria-label="Split roller"]');
			expect(toSplitBtn.exists()).toBe(true);
			await toSplitBtn.trigger('click');
			expect(splitPanel.emitted('update:drawerState')?.[1]).toEqual(['split']);

			const closeBtn = splitPanel.find('.studio-mobile-drawer-controls button[aria-label="Close roller"]');
			expect(closeBtn.exists()).toBe(true);
			await closeBtn.trigger('click');
			expect(splitPanel.emitted('update:drawerState')?.[2]).toEqual(['staged']);

			await runAxeAudit(splitPanel.element as HTMLElement);
			splitPanel.unmount();
		});

		it('switches sibling Trait Sets via .crumb-set-select and toggles split/full Create drawer height in StudioPanel', async () => {
			const char = reactive<CharacterModel>(
				makeCharacter({
					id: 'create-drawer-char',
					name: 'Creator Hero',
					plotPoints: 1,
					traitSets: [
						makeTraitSet({
							id: 'name',
							name: 'Name',
							noun: 'Trait',
							view: { style: { header: 'default', body: 'name' } },
							traits: [],
						}),
						makeTraitSet({
							id: 'attributes',
							name: 'Attributes',
							noun: 'Attribute',
							view: { pillar: 'prime', style: { header: 'default', body: 'list' } },
							traits: [],
						}),
						makeTraitSet({
							id: 'skills',
							name: 'Skills',
							noun: 'Skill',
							view: { pillar: 'plus', style: { header: 'default', body: 'list' } },
							traits: [],
						}),
					],
				}),
			);

			const editPanel = mount(StudioPanel, {
				props: {
					character: char,
					mode: 'character',
					submode: 'edit',
					isOpen: true,
					panelTab: 'properties',
					editing: ['traitSet', 1],
				},
				attachTo: document.body,
			});
			await flushPromises();

			const aside = editPanel.find('.studio-panel');
			expect(aside.attributes('data-edit-size')).toBe('split');

			const setSelect = editPanel.find('.studio-breadcrumb .crumb-set-select');
			expect(setSelect.exists()).toBe(true);
			expect(setSelect.findAll('option').map((o) => o.text())).toEqual(['Attributes', 'Skills']);

			await setSelect.setValue('2');
			expect(editPanel.emitted('selectElement')?.[0]).toEqual([['traitSet', 2]]);

			const expandEditBtn = editPanel.find('.studio-mobile-edit-controls button[aria-label="Expand panel"]');
			expect(expandEditBtn.exists()).toBe(true);
			await expandEditBtn.trigger('click');
			expect(aside.attributes('data-edit-size')).toBe('full');

			const splitEditBtn = editPanel.find('.studio-mobile-edit-controls button[aria-label="Split panel"]');
			expect(splitEditBtn.exists()).toBe(true);
			await splitEditBtn.trigger('click');
			expect(aside.attributes('data-edit-size')).toBe('split');

			await runAxeAudit(editPanel.element as HTMLElement);
			editPanel.unmount();
		});

		it('consolidates single-pillar Jump Strip in Character Play mode while preserving multi-pillar substack navigation', async () => {
			const singlePillarChar = reactive<CharacterModel>(
				makeCharacter({
					id: 'single-pillar-char',
					name: 'Solo Runner',
					game: 'Cortex Prime',
					plotPoints: 1,
					portrait: {},
					view: { pageCount: 1, sheetTheme: 'classic' },
					traitSets: [
						makeTraitSet({
							id: 'prime-dist',
							name: 'Distinctions',
							noun: 'Distinction',
							view: { page: 1, column: 1, pillar: 'prime', style: { body: 'list' } },
							traits: [{ id: 'd1', name: 'Scrappy', rating: { type: 'Die', value: [8] }, traits: [] }],
						}),
						makeTraitSet({
							id: 'prime-roles',
							name: 'Roles',
							noun: 'Role',
							view: { page: 1, column: 1, pillar: 'prime', style: { body: 'list' } },
							traits: [{ id: 'r1', name: 'Hacker', rating: { type: 'Die', value: [6] }, traits: [] }],
						}),
					],
				}),
			);

			const singleWrapper = mount(Character, {
				props: {
					character: singlePillarChar,
					submode: 'play',
					editing: [],
					isDesktopPillars: true,
				},
				attachTo: document.body,
			});

			const singleStrip = singleWrapper.find('.mobile-set-jump-strip');
			expect(singleStrip.exists()).toBe(true);
			expect(singleStrip.find('.jump-pillar-tag').exists()).toBe(true);
			expect(singleStrip.findAll('.jump-pill-sub').map((el) => el.text())).toEqual(['Distinctions', 'Roles']);
			expect(singleStrip.find('.jump-pill-add-card').exists()).toBe(true);
			expect(singleWrapper.find('.mobile-substack-bar').exists()).toBe(false);

			await runAxeAudit(singleWrapper.element as HTMLElement);
			singleWrapper.unmount();

			const multiPillarChar = reactive<CharacterModel>(
				makeCharacter({
					id: 'multi-pillar-char',
					name: 'Dual Hero',
					game: 'Cortex Prime',
					plotPoints: 2,
					portrait: {},
					view: { pageCount: 1, sheetTheme: 'classic' },
					traitSets: [
						{
							id: 'name',
							name: 'Name',
							noun: 'Trait',
							view: { page: 1, style: { header: 'default', body: 'name' } },
							traits: [],
						},
						{
							id: 'p-dist',
							name: 'Distinctions',
							noun: 'Distinction',
							view: { page: 1, column: 1, pillar: 'prime', style: { body: 'list' } },
							traits: [{ id: 'd1', name: 'Bold', rating: { type: 'Die', value: [8] }, traits: [] }],
						},
						{
							id: 'p-attrs',
							name: 'Attributes',
							noun: 'Attribute',
							view: { page: 1, column: 1, pillar: 'prime', style: { body: 'list' } },
							traits: [{ id: 'a1', name: 'Agility', rating: { type: 'Die', value: [8] }, traits: [] }],
						},
						{
							id: 's-skills',
							name: 'Skills',
							noun: 'Skill',
							view: { page: 1, column: 2, pillar: 'abilities', style: { body: 'list' } },
							traits: [{ id: 'k1', name: 'Fight', rating: { type: 'Die', value: [6] }, traits: [] }],
						},
					],
				}),
			);

			const multiWrapper = mount(Character, {
				props: {
					character: multiPillarChar,
					submode: 'play',
					editing: [],
					isDesktopPillars: true,
				},
				attachTo: document.body,
			});

			const multiStrip = multiWrapper.find('.mobile-set-jump-strip');
			expect(multiStrip.find('.jump-pillar-tag').exists()).toBe(false);
			const pillarKeys = multiStrip
				.findAll('.jump-pill[data-pillar-pill]')
				.map((el) => el.attributes('data-pillar-pill'));
			expect(pillarKeys).toEqual(['prime', 'abilities']);
			expect(multiWrapper.find('.mobile-pillar-column[data-pillar-key="prime"] .sheet-header-meta-box').exists()).toBe(
				true,
			);
			expect(multiWrapper.find('.mobile-substack-bar').exists()).toBe(true);

			await runAxeAudit(multiWrapper.element as HTMLElement);
			multiWrapper.unmount();
		});
	});

	describe('Sets, Pillars, Play Pools, & Individual Track Labels', () => {
		it('keeps organic Play sheet unified without surprise PLAY pillar, supports + Pillar inline form, and places sticky + Set in every pillar', async () => {
			const organicChar = reactive<CharacterModel>(
				makeCharacter({
					id: 'organic-play-sheet',
					name: 'Jimmy',
					plotPoints: 1,
					portrait: {},
					view: { pageCount: 1 },
					traitSets: [
						makeTraitSet({
							id: 'name',
							name: 'Name',
							noun: 'Trait',
							rating: { type: 'Die', value: [8], range: [4, 6, 8, 10, 12] },
							view: { style: { header: 'default', body: 'name' } },
							traits: [],
						}),
						makeTraitSet({
							id: 'traits',
							name: 'Traits',
							noun: 'Trait',
							view: { style: { header: 'default', body: 'list' } },
							traits: [{ id: 't1', name: 'Snitch', rating: { type: 'Die', value: [8] }, traits: [] }],
						}),
					],
				}),
			);

			const wrapper = mount(Character, {
				props: {
					character: organicChar,
					submode: 'play',
					editing: [],
					isDesktopPillars: true,
				},
				attachTo: document.body,
			});

			// Single unified pillar in Play mode with both + Set and + Pillar in the jump strip (and no noisy pillar tag)
			const strip = wrapper.find('.mobile-set-jump-strip');
			expect(strip.classes()).toContain('is-unified-sheet-strip');
			expect(strip.find('.jump-pillar-tag').exists()).toBe(false);
			expect(strip.find('.jump-pill-add-card').text()).toContain('Set');
			expect(strip.find('.jump-pill-add-pillar').text()).toContain('Pillar');
			expect(wrapper.findAll('.mobile-pillar-column').length).toBe(1);

			// Open Add Set gallery (teleported to body), verify framed-ring / divider-line / cut-corner-block are excluded in Play mode, and add Dice Pool
			await strip.find('.jump-pill-add-card').trigger('click');
			await nextTick();
			const modalEl = document.body.querySelector('dialog[aria-label="Add set"]')!;
			expect(modalEl).toBeTruthy();
			const presetTitles = Array.from(modalEl.querySelectorAll('.preset-gallery-name')).map((el) =>
				(el.textContent || '').trim(),
			);
			expect(presetTitles).toContain('Dice Pool');
			expect(presetTitles).toContain('Trait List');
			expect(presetTitles).toContain('Trait + Track');
			expect(presetTitles).not.toContain('Framed Ring');
			expect(presetTitles).not.toContain('Divider Line');
			expect(presetTitles).not.toContain('Cut-Corner Card');

			const poolCard = Array.from(modalEl.querySelectorAll('.preset-gallery-card')).find((c) =>
				(c.textContent || '').includes('Dice Pool'),
			)!;
			(poolCard.querySelector('.btn-preset-add') as HTMLButtonElement).click();
			await nextTick();

			// Adding a Play set does NOT split into a surprise PLAY pillar
			expect(wrapper.findAll('.mobile-pillar-column').length).toBe(1);
			expect(organicChar.traitSets[2].view?.playMutable).toBe(true);
			expect(organicChar.traitSets[2].view?.visibility).toBe('play-only');

			// Click + Pillar, submit "Scene", and verify existing sets stay unified in SHEET while Scene appears with sticky + Set
			await wrapper.find('.jump-pill-add-pillar').trigger('click');
			await nextTick();
			const pillarInput = wrapper.find('.pillar-inline-input');
			expect(pillarInput.exists()).toBe(true);
			await pillarInput.setValue('Scene');
			await wrapper.find('.pillar-inline-form').trigger('submit');
			await nextTick();

			const cols = wrapper.findAll('.mobile-pillar-column');
			expect(cols.length).toBe(2);
			expect(wrapper.findAll('.jump-pill[data-pillar-pill]').map((el) => el.text().trim())).toEqual(['Sheet', 'Scene']);
			expect(wrapper.findAll('.substack-pill-add-set').length).toBe(2);

			await runAxeAudit(wrapper.element as HTMLElement);
			wrapper.unmount();
		});

		it('adds dice to a Play pool on canvas and preserves Dice pool type when reduced to 1 die', async () => {
			const char = reactive<CharacterModel>(
				makeCharacter({
					id: 'pool-char',
					name: 'Pool Tester',
					plotPoints: 1,
					portrait: {},
					view: { pageCount: 1 },
					traitSets: [],
				}),
			);
			const poolPreset = characterCurioSetPresets['pool']!;
			const poolSet = characterCurioFunctions.instantiateSetPreset(poolPreset, char, 1);
			poolSet.spendable = false;
			poolSet.view = { ...(poolSet.view || {}), visibility: 'play-only', playMutable: true };
			char.traitSets.push(poolSet);

			const block = mount(TraitSetBlock, {
				props: { character: char, traitSetID: 0, submode: 'play' },
				attachTo: document.body,
			});

			const poolTrait = char.traitSets[0].traits[0];
			expect(poolTrait.rating?.type).toBe('Dice');
			expect(poolTrait.rating?.value).toEqual([6, 6]);

			// Open inline + die picker on canvas and append d10
			const addBtn = block.find('.btn-pool-add-die');
			expect(addBtn.exists()).toBe(true);
			await addBtn.trigger('click');
			await nextTick();

			const d10Btn = block
				.findAll('.pool-add-picker .btn-pool-die-option')
				.find((b) => b.attributes('title') === 'Add d10')!;
			expect(d10Btn).toBeTruthy();
			await d10Btn.trigger('click');
			await nextTick();
			expect(poolTrait.rating?.value).toEqual([6, 6, 10]);

			// Remove two dice so 1 remains, ensuring rating.type stays Dice
			const removeBtns = block.findAll('.btn-play-spend');
			expect(removeBtns.length).toBe(3);
			await removeBtns[0].trigger('click');
			await nextTick();
			await block.findAll('.btn-play-spend')[0].trigger('click');
			await nextTick();
			expect((poolTrait.rating?.value as unknown[])?.length).toBe(1);
			expect(poolTrait.rating?.type).toBe('Dice');
			expect(block.find('.btn-pool-add-die').exists()).toBe(true);

			await runAxeAudit(block.element as HTMLElement);
			block.unmount();
		});

		it('edits individual trait track labels in Play mode without mutating sibling tracks or set track noun', async () => {
			const char = reactive<CharacterModel>(
				makeCharacter({
					id: 'track-char',
					name: 'Track Tester',
					plotPoints: 1,
					portrait: {},
					view: { pageCount: 1 },
					traitSets: [],
				}),
			);
			const trackPreset = characterCurioSetPresets['trait-track']!;
			const trackSet = characterCurioFunctions.instantiateSetPreset(trackPreset, char, 1);
			trackSet.view = { ...(trackSet.view || {}), visibility: 'play-only', playMutable: true };
			trackSet.traits.push({
				id: 'second-trait',
				name: 'Second',
				rating: { type: 'Die', value: [8], range: [4, 6, 8, 10, 12] },
				traits: [],
			});
			char.traitSets.push(trackSet);

			const block = mount(TraitSetBlock, {
				props: { character: char, traitSetID: 0, submode: 'play' },
				attachTo: document.body,
			});

			const labelBtns = block.findAll('.attached-stress-label-btn');
			expect(labelBtns.length).toBe(2);
			expect(labelBtns[0].text().trim()).toBe('Track');
			expect(labelBtns[1].text().trim()).toBe('Track');

			await labelBtns[0].trigger('click');
			await nextTick();
			const input = block.find('.track-label-inline-input');
			expect(input.exists()).toBe(true);
			await input.setValue('Injured');
			await input.trigger('blur');
			await nextTick();

			const updatedBtns = block.findAll('.attached-stress-label-btn');
			expect(updatedBtns[0].text().trim()).toBe('Injured');
			expect(updatedBtns[1].text().trim()).toBe('Track');
			expect(char.traitSets[0].view?.labels?.track).toBeUndefined();
			expect(char.traitSets[0].traits[0].traits?.[0].name).toBe('Injured');
			expect((char.traitSets[0].traits[0].traits?.[0].view as Record<string, unknown> | undefined)?.part).toBe('track');

			await runAxeAudit(block.element as HTMLElement);
			block.unmount();
		});
	});

	describe('Multi-Pool Named-Owner Roller & Per-Owner PP (Slice 2)', () => {
		it('stages traits from any Curiosity into the active owner pool, shows every pool-owning entity PP in Roller, and syncs active owner PP to Footer', async () => {
			const kira = reactive({
				id: 'cur-kira',
				name: 'Kira',
				plotPoints: 2,
				traitSets: [
					{
						id: 'skills',
						name: 'Skills',
						noun: 'Skill',
						traits: [{ id: 'sneak', name: 'Sneak', rating: { type: 'Die', value: [8], range: [4, 6, 8, 10, 12] } }],
					},
				],
			});
			const rival = reactive({
				id: 'cur-rival',
				name: 'Vex',
				plotPoints: 3,
				traitSets: [
					{
						id: 'roles',
						name: 'Roles',
						noun: 'Role',
						traits: [
							{ id: 'enforcer', name: 'Enforcer', rating: { type: 'Die', value: [10], range: [4, 6, 8, 10, 12] } },
						],
					},
				],
			});
			const location = reactive({
				id: 'cur-vault',
				name: 'Laser Vault',
				// No plotPoints — optional PP!
				traitSets: [
					{
						id: 'hazards',
						name: 'Hazards',
						noun: 'Hazard',
						traits: [
							{ id: 'turrets', name: 'Auto-Turrets', rating: { type: 'Die', value: [6], range: [4, 6, 8, 10, 12] } },
						],
					},
				],
			});

			const pools = reactive([
				dicePool.createNamedPool('Kira', 'cur-kira'),
				dicePool.createNamedPool('Vex', 'cur-rival'),
				dicePool.createNamedPool('Opposition', null, undefined, 'opposition'),
			]);
			const state = reactive({ activeId: pools[0].id });

			const settlePoolPP = (delta: number, poolId?: string) => {
				const target = pools.find((p) => p.id === (poolId || state.activeId));
				if (!target) return;
				const owner = [kira, rival, location].find((c) => c.id === target.ownerId) as
					{ plotPoints?: number } | undefined;
				if (owner && typeof owner.plotPoints === 'number') {
					owner.plotPoints = Math.max(0, owner.plotPoints + delta);
				} else if (typeof target.plotPoints === 'number') {
					target.plotPoints = Math.max(0, target.plotPoints + delta);
				}
			};

			const roller = mount(DiceRoller, {
				props: {
					open: true,
					namedPools: pools,
					activePoolId: state.activeId,
					curiosities: [kira, rival, location] as CharacterModel[],
					character: kira as CharacterModel,
					'onUpdate:activePoolId': (id: string) => {
						state.activeId = id;
						roller.setProps({ activePoolId: id });
					},
					onAddNamedPool: (payload: { ownerId: string | null; ownerName: string; withPP?: boolean }) => {
						const created = dicePool.createNamedPool(
							payload.ownerName,
							payload.ownerId,
							payload.withPP ? 1 : undefined,
						);
						pools.push(created);
						state.activeId = created.id;
						roller.setProps({ activePoolId: created.id });
					},
					onSettlePP: settlePoolPP,
				},
			});

			// 1. Both PP-owning entities (Kira & Vex) show their PP steppers inside the Roller; Opposition (no PP) does not
			const ppTrackers = roller.findAll('.roller-owners-pp-bar .pp-tracker');
			expect(ppTrackers.length).toBe(2);
			expect(ppTrackers[0].text()).toContain('Kira PP');
			expect(ppTrackers[0].text()).toContain('2');
			expect(ppTrackers[1].text()).toContain('Vex PP');
			expect(ppTrackers[1].text()).toContain('3');

			// 2. Active pool is Kira -> Kira can stage Auto-Turrets from Laser Vault (cross-Curiosity staging!)
			await roller.find('.wb-trait-btn').trigger('click');
			const turretRow = roller.findAll('.presearch-item-btn').find((b) => b.text().includes('Auto-Turrets'));
			expect(turretRow, '+ Trait combobox must include traits from all Curiosities in graph').toBeDefined();
			await turretRow!.trigger('click');
			expect(pools[0].pool.items.length).toBe(1);
			expect(pools[0].pool.items[0].source).toBe('Auto-Turrets');

			// 3. Switch active pool to Vex and stage Vex's Enforcer d10 + spend 1 of Vex's PP
			const vexTab = roller.findAll('[role="tab"]').find((t) => t.text().includes('Vex'))!;
			await vexTab.trigger('click');
			await nextTick();
			expect(state.activeId).toBe(pools[1].id);
			await roller.findAll('.roller-adhoc-btn')[3].trigger('click'); // Add d10
			await roller.findAll('.pp-spend-btn')[0].trigger('click'); // 1 PP: +1 Keep for Vex
			expect(rival.plotPoints).toBe(2);
			expect(kira.plotPoints).toBe(2);

			// 4. Add a 4th pool via + Pool (ad-hoc "Guards" without PP; IME-safe Enter guard respected)
			await roller.find('.btn-add-pool').trigger('click');
			// Unpooled Curiosity quick-pick chip for Laser Vault appears
			expect(roller.find('.add-pool-curiosity-chip').text()).toContain('Laser Vault');
			const poolInput = roller.find('.add-pool-input');
			await poolInput.setValue('Guards');
			// Simulate IME composition Enter (keyCode 229) -> must NOT submit prematurely
			await poolInput.trigger('keydown', { key: 'Enter', isComposing: true, keyCode: 229 });
			expect(pools.length).toBe(3);
			// Real Enter submits
			await poolInput.trigger('keydown', { key: 'Enter' });
			expect(pools.length).toBe(4);
			expect(pools[3].ownerName).toBe('Guards');
			expect(state.activeId).toBe(pools[3].id);

			// Stage d8 into Guards pool so we have a 3-way contest (Kira vs Vex vs Guards)
			await nextTick();
			await roller.findAll('.roller-adhoc-btn')[2].trigger('click');
			await roller.findAll('.roller-adhoc-btn')[2].trigger('click');

			// Footer visibility contract: Guards has no PP -> showPlotPoints is false; Kira has PP -> showPlotPoints is true
			const activeOwnerHasPP = () => {
				const cur = pools.find((p) => p.id === state.activeId);
				const ent = [kira, rival, location].find((c) => c.id === cur?.ownerId) as { plotPoints?: number } | undefined;
				return ent ? typeof ent.plotPoints === 'number' : typeof cur?.plotPoints === 'number';
			};
			expect(activeOwnerHasPP()).toBe(false);
			const footerHidden = mount(AppFooter, {
				props: { mode: 'character', year: 2026, showPlotPoints: activeOwnerHasPP(), plotPoints: 0 },
			});
			expect(footerHidden.find('.footer-pp-badge').exists()).toBe(false);
			footerHidden.unmount();

			// Switch back to Kira -> active owner PP shows in footer
			await roller.findAll('[role="tab"]')[0].trigger('click');
			await nextTick();
			expect(activeOwnerHasPP()).toBe(true);
			const footerVisible = mount(AppFooter, {
				props: {
					mode: 'character',
					year: 2026,
					showPlotPoints: activeOwnerHasPP(),
					plotPoints: kira.plotPoints,
					plotPointsLabel: 'Kira PP',
				},
			});
			expect(footerVisible.find('.footer-pp-badge').text()).toContain('Kira PP');
			expect(footerVisible.find('.pp-count').text()).toBe('2');
			footerVisible.unmount();

			// 5. Roll 3-pool contest (Kira, Vex, Guards) and audit WCAG 2.2 AA
			expect(roller.find('.roller-roll-btn').text()).toContain('ROLL CONTEST');
			const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.75);
			try {
				await roller.find('.roller-roll-btn').trigger('click');
			} finally {
				randomSpy.mockRestore();
			}
			expect(roller.findAll('.roller-inline-outcome .outcome-pool-section').length).toBe(3);

			await runAxeAudit(roller.element as HTMLElement);
			roller.unmount();
		});
	});

	describe('Slice 3: Non-Linear Curiosity Graph, Trait/Set ref Edges & CuriosityWebBar', () => {
		it('renders TraitSetCuriosity setup, spawns embedded Curiosity with IME-safe Enter, stages dice in Play, and passes axe', async () => {
			const char = reactive<CharacterModel>(
				makeCharacter({
					id: 'root-adv',
					name: 'Starfall Sector',
					version: '0.2',
					traitSets: [
						makeTraitSet({ id: 'name', name: 'Starfall Sector', view: { style: { body: 'name' } }, traits: [] }),
						characterCurioFunctions.instantiateSetPreset(characterCurioSetPresets.curiosity, null),
					],
					curiosities: {
						'existing-npc': makeCharacter({
							id: 'existing-npc',
							name: 'Captain Vane',
							version: '0.2',
							traitSets: [
								makeTraitSet({
									id: 'name',
									name: 'Captain Vane',
									rating: { type: 'Die', value: [8] },
									view: { style: { body: 'name' } },
									traits: [{ name: 'Description', description: 'Smuggler of [[Rust Port]]' }],
								}),
								makeTraitSet({
									id: 'roles',
									name: 'Roles',
									traits: [{ name: 'Pilot', rating: { type: 'Die', value: [10] } }],
								}),
							],
						}),
					},
				}),
			);

			const stagedPayloads: Array<Record<string, unknown>> = [];
			const wrapper = mount(TraitSetBlock, {
				props: {
					character: char,
					traitSetID: 1,
					submode: 'play',
					onAddDieToRoller: (p: Record<string, unknown>) => stagedPayloads.push(p),
					onUpdateCharacter: (next: CharacterModel) => Object.assign(char, next),
				} as unknown as InstanceType<typeof TraitSetBlock>['$props'],
			});

			// 1. Unlinked setup state passes WCAG 2.2 AA & LLM DOM semantics
			expect(wrapper.find('.curiosity-empty-setup').exists()).toBe(true);
			expect(wrapper.find('.curiosity-existing-chip').text()).toContain('Captain Vane');
			await runAxeAudit(wrapper.element as HTMLElement);
			assertLlmDomSemantics(wrapper.element as HTMLElement);

			// 2. IME composition Enter (keyCode 229) must NOT prematurely create
			const nameInput = wrapper.find('.curiosity-set-input');
			await nameInput.setValue('Rust Port');
			await nameInput.trigger('keydown', { key: 'Enter', isComposing: true, keyCode: 229 });
			expect(char.traitSets[1].ref ?? null).toBeNull();

			// 3. Clean Enter spawns embedded Curiosity and links traitSet.ref
			await nameInput.trigger('keydown', { key: 'Enter' });
			await nextTick();
			const spawnedId = char.traitSets[1].ref;
			expect(typeof spawnedId).toBe('string');
			expect(char.curiosities?.[spawnedId!]?.name).toBe('Rust Port');
			expect(wrapper.find('.curiosity-card-name').text()).toBe('Rust Port');

			// 4. Unlink and link existing Captain Vane -> stage Name d8 and Pilot d10 directly into Active Pool
			await wrapper.find('.btn-curiosity-unlink').trigger('click');
			await nextTick();
			await wrapper.find('.curiosity-existing-chip').trigger('click');
			await nextTick();
			expect(wrapper.find('.curiosity-card-name').text()).toBe('Captain Vane');
			expect(wrapper.find('.curiosity-card-subtitle .curio-wikilink').attributes('data-curio-ref')).toBe('Rust Port');

			await wrapper.find('.curiosity-card-die[role="button"]').trigger('click');
			await wrapper.find('.curiosity-trait-pill').trigger('click');
			expect(stagedPayloads.length).toBe(2);
			expect(stagedPayloads[0]).toMatchObject({ size: 8, source: 'Captain Vane' });
			expect(stagedPayloads[1]).toMatchObject({ size: 10, source: 'Pilot' });

			await runAxeAudit(wrapper.element as HTMLElement);
			wrapper.unmount();
		});

		it('renders sibling trait-explore-btn (fa-lightbulb) for trait.ref without nested-interactive axe violations', async () => {
			const exploredIds: string[] = [];
			const char = reactive<CharacterModel>(
				makeCharacter({
					id: 'root-1',
					name: 'Expedition',
					version: '0.2',
					traitSets: [
						makeTraitSet({
							id: 'prime-contacts',
							name: 'Contacts',
							rating: { type: 'Die', value: [], range: [4, 6, 8, 10, 12] },
							traits: [{ name: 'Archivist Sera', ref: 'npc-sera', rating: { type: 'Die', value: [8] } }],
						}),
					],
					curiosities: {
						'npc-sera': makeCharacter({
							id: 'npc-sera',
							name: 'Archivist Sera',
							version: '0.2',
							traitSets: [
								makeTraitSet({ id: 'name', name: 'Archivist Sera', view: { style: { body: 'name' } }, traits: [] }),
							],
						}),
					},
				}),
			);

			const wrapper = mount(TraitSetBlock, {
				props: {
					character: char,
					traitSetID: 0,
					submode: 'play',
				},
				global: {
					provide: {
						[CURIOSITY_GRAPH_KEY as symbol]: {
							activeNode: ref(char),
							activeHostRoot: ref(null),
							resolveCuriosity: (id: string) => char.curiosities?.[id] || null,
							linkableCuriosities: ref([char.curiosities!['npc-sera']]),
							exploreCuriosity: (id: string) => {
								exploredIds.push(id);
								return true;
							},
							spawnCuriosity: () => null,
							popOutCuriosity: () => false,
							pullInCuriosity: () => false,
						},
					},
				},
			});

			const exploreBtn = wrapper.find('button.trait-explore-btn');
			expect(exploreBtn.exists()).toBe(true);
			// Must be a sibling of button.trait-title-btn, never nested inside it
			expect(wrapper.find('button.trait-title-btn button').exists()).toBe(false);

			await exploreBtn.trigger('click');
			expect(exploredIds).toEqual(['npc-sera']);

			await runAxeAudit(wrapper.element as HTMLElement);
			wrapper.unmount();
		});

		it('renders CuriosityWebBar breadcrumbs (aria-current="page", middle collapse), backlinks, and Pop Out with zero axe violations', async () => {
			const navigated: string[] = [];
			const popped: string[] = [];
			const spawned: Array<{ name: string; navigate: boolean }> = [];

			const webBar = mount(CuriosityWebBar, {
				props: {
					activeNode: { id: 'n5', name: 'Inner Sanctum', traitSets: [] },
					hostRoot: { id: 'n1', name: 'Sunken Citadel', traitSets: [] },
					trail: [
						{ id: 'n1', name: 'Sunken Citadel' },
						{ id: 'n2', name: 'Outer Gate' },
						{ id: 'n3', name: 'Flooded Hall' },
						{ id: 'n4', name: 'Vault Door' },
						{ id: 'n5', name: 'Inner Sanctum' },
					],
					incomingBacklinks: [{ id: 'n4', name: 'Vault Door', via: 'trait' }],
					outgoingLinks: [{ id: 'n6', name: 'Oracle Core', via: 'wiki' }],
					pullableCuriosities: [{ id: 'ext-1', name: 'Wandering Knight', traitSets: [] }],
					submode: 'play',
				},
				attrs: {
					onNavigate: (id: string) => navigated.push(id),
					onPopOut: (id: string) => popped.push(id),
					onSpawnPeer: (payload: { name: string; navigate: boolean }) => spawned.push(payload),
				},
			});

			// 1. Trail > 4 collapses middle crumbs to ellipsis button keeping first + last 2
			const navEl = webBar.find('nav[aria-label="Curiosity trail"]');
			expect(navEl.exists()).toBe(true);
			expect(webBar.findAll('.curiosity-crumb-link').length).toBe(3);
			expect(webBar.find('.curiosity-crumb-link[aria-current="page"]').text()).toBe('Inner Sanctum');

			await runAxeAudit(webBar.element as HTMLElement);

			// 2. Expand middle crumbs via ellipsis button -> all 5 crumbs visible
			await webBar.find('.curiosity-crumb-more').trigger('click');
			expect(webBar.findAll('.curiosity-crumb-link').length).toBe(5);

			// 3. Backlinks, outgoing links, Pop Out, and + Curiosity drawer work cleanly
			await webBar.find('.curiosity-edge-chip.is-backlink').trigger('click');
			await webBar.find('.curiosity-edge-chip.is-outgoing').trigger('click');
			expect(navigated).toEqual(['n4', 'n6']);

			const actionBtns = webBar.findAll('.curiosity-web-btn');
			await actionBtns[0].trigger('click'); // Pop Out
			expect(popped).toEqual(['n5']);

			await actionBtns[1].trigger('click'); // + Curiosity drawer
			expect(webBar.find('.curiosity-web-drawer').exists()).toBe(true);
			await runAxeAudit(webBar.element as HTMLElement);

			const peerInput = webBar.find('.curiosity-web-drawer .curiosity-set-input');
			await peerInput.setValue('Altar Guardian');
			await peerInput.trigger('keydown', { key: 'Enter', isComposing: true, keyCode: 229 });
			expect(spawned.length).toBe(0);
			await peerInput.trigger('keydown', { key: 'Enter' });
			expect(spawned).toEqual([{ name: 'Altar Guardian', navigate: true }]);

			webBar.unmount();
		});
	});
});
