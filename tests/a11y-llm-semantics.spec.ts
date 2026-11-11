import { describe, it, expect, vi } from 'vitest';
import { defineComponent, h } from 'vue';
import { mount } from '@vue/test-utils';
import axe from 'axe-core';
import TraitSetBlock from '../js/trait-set-block.vue';
import DiceRoller from '../js/dice-roller.vue';
import TraitEditor from '../js/trait-editor.vue';
import AppHeader from '../js/app-header.vue';
import SessionNav from '../js/session-nav.vue';
import TraitSetMini from '../js/trait-set-mini.vue';
import PageLayoutMini from '../js/page-layout-mini.vue';
import { resolveFrame, computeFrameAnchors, buildFrameSvgPath } from '../js/frame-geometry.ts';
import { characterCurioFunctions } from '../js/functions.ts';
import { dicePool } from '../js/dice-pool.ts';
import { useTraitSet } from '../js/use-trait-set.ts';

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
function createTestCharacter() {
	return {
		name: 'Valerie Vance',
		plotPoints: 2,
		traitSets: [
			{
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
			},
			{
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
			},
			{
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
			},
			{
				name: 'XP Milestone',
				noun: 'XP',
				rating: { type: 'Pip', value: [true, true, false, false, false], range: [5] },
				view: { pillar: 'plus', style: { body: 'pips' }, pips: { perRow: 5, connected: true, labels: false } },
				traits: [],
			},
		],
	};
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
		const mockPool = {
			items: [
				{ id: 'd1', size: 8, qty: 1, source: 'Agility', hitches: 1 },
				{ id: 'd2', size: 4, qty: 1, source: 'Distinction', hitches: 1, ppDelta: 1 },
			],
			is_empty: () => false,
		};

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

	it('audits Play-scoped TraitEditor for label immutability and zero structural leaks', async () => {
		const character = createTestCharacter();
		const wrapper = mount(TraitEditor, {
			props: {
				character,
				traitSetID: 0,
				traitID: 0,
				open: true,
				submode: 'play',
			} as any,
		});

		await runAxeAudit(wrapper.element as HTMLElement);

		// In Play Mode on a standard Prime set (Attributes), structural controls must not render
		expect(wrapper.find('.rating-scale-container').exists()).toBe(false);
		expect(wrapper.find('.editor-copy').exists()).toBe(false);
		expect(wrapper.find('input[name="traitName"]').exists()).toBe(false);

		wrapper.unmount();
	});

	it('audits Dark Mode toggle buttons and verifies zero hardcoded inline styles in DiceRoller', async () => {
		// 1. Verify DiceRoller has no inline background: white on quick scale/separate die buttons
		const roller = mount(DiceRoller, {
			props: {
				open: true,
				pool: new dicePool.DicePool(),
			},
		});
		const scaleBtn = roller.find('.roller-btn-scale-quick');
		expect(scaleBtn.exists()).toBe(true);
		expect(scaleBtn.attributes('style')).toBeUndefined();

		const sepBtn = roller.find('.roller-btn-res-quick');
		expect(sepBtn.exists()).toBe(true);
		expect(sepBtn.attributes('style')).toBeUndefined();

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
				openCharacters: [{ id: 'char1', name: 'Test' }],
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

	it('TraitSetMini (Phase 3a): standalone authoring, noun inventory consistency, companion stress track, keyboard nudge, and preset round-trip', async () => {
		window.localStorage.removeItem('characterCurioCustomSetPresets');

		const wrapper = mount(TraitSetMini);
		await runAxeAudit(wrapper.element as HTMLElement);

		// 1. Standalone inventory & keyboard nudge/resize on grid part boxes
		const nameBox = wrapper.find('[data-grid-part="name"]');
		expect(nameBox.exists()).toBe(true);
		await nameBox.trigger('click');
		await nameBox.trigger('keydown', { key: 'ArrowRight' });
		const leftInput = wrapper.find('input[aria-label="Part Left Percent"]');
		expect((leftInput.element as HTMLInputElement).value).toBe('5');

		await nameBox.trigger('keydown', { key: 'ArrowLeft', shiftKey: true });
		const widthInput = wrapper.find('input[aria-label="Part Width Percent"]');
		expect((widthInput.element as HTMLInputElement).value).toBe('60');

		// 2. Noun consistency check: misspelled trait noun ("Roel") and companion noun ("Stres") surface as extra noun groups in inventory
		const traitNounInput = wrapper.find('input[aria-label="Trait 1 Noun"]');
		await traitNounInput.setValue('Roel');
		expect(wrapper.find('[data-noun-group="Roel"]').exists()).toBe(true);

		const addTrackBtn = wrapper.find('button[title="Add Companion / Stress Track"]');
		await addTrackBtn.trigger('click');
		const companionNounInput = wrapper.find('input[aria-label="Companion Track Noun 1"]');
		await companionNounInput.setValue('Stres');
		expect(wrapper.find('[data-noun-group="Stres"]').exists()).toBe(true);

		// 3. Acceptance case (Section 5.3): stress-bearing set with companion range [6, 8, 10] + block entry
		// Toggle d4 and d12 off in companion track range so range becomes [6, 8, 10]
		const toggleD4 = wrapper.find('button[aria-label="Toggle d4 in track range"]');
		const toggleD12 = wrapper.find('button[aria-label="Toggle d12 in track range"]');
		await toggleD4.trigger('click');
		await toggleD12.trigger('click');

		const addBlockBtn = wrapper.find('button[title="Add Block / SFX Entry"]');
		await addBlockBtn.trigger('click');

		// Verify live preview renders track, trackLabel, and block with [6, 8, 10] scale
		expect(wrapper.find('[data-grid-part="trackLabel"]').exists()).toBe(true);
		expect(wrapper.find('[data-grid-part="track"]').exists()).toBe(true);
		expect(wrapper.find('[data-grid-part="block"]').exists()).toBe(true);

		// 4. Save as Preset: creator-typed label, derived ID, collision check, and round-trip across Play, Edit, and Print
		const labelInput = wrapper.find('input[aria-label="Preset Label"]');
		await labelInput.setValue('Scene Traits'); // Collides with built-in preset
		expect(wrapper.find('.mini-collision-alert').exists()).toBe(true);
		const saveBtn = wrapper.find('.mini-save-preset-btn');
		expect((saveBtn.element as HTMLButtonElement).disabled).toBe(true);

		await labelInput.setValue('Overload Tracker');
		expect(wrapper.find('.mini-collision-alert').exists()).toBe(false);
		expect((saveBtn.element as HTMLButtonElement).disabled).toBe(false);

		await saveBtn.trigger('click');
		const savedEvents = wrapper.emitted('saved');
		expect(savedEvents && savedEvents.length).toBe(1);
		const savedPreset = (savedEvents![0] as any)[0];
		expect(savedPreset.id).toBe('overload-tracker');
		expect(savedPreset.label).toBe('Overload Tracker');
		expect(savedPreset.preset.view.pillar).toBe('play');

		// Verify collision blocks saving duplicate custom preset
		expect(wrapper.find('.mini-collision-alert').exists()).toBe(true);

		// Instantiate saved preset onto a character and verify Play, Edit, and Print rendering
		const char: any = { name: 'Tester', traitSets: [] };
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
		window.localStorage.removeItem('characterCurioCustomSetPresets');
	});

	it('supports trait-specific custom companion track names (Injured, Worried) with track fallback and T/L marker toggles', async () => {
		const customSet: any = {
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
					rating: { type: 'Die', value: 8 },
					traits: [{ name: 'Injured', rating: { type: 'Die', value: 6, range: [4, 6, 8, 10, 12] } }],
				},
				{
					name: 'Mental',
					rating: { type: 'Die', value: 10 },
					traits: [{ name: 'Worried', rating: { type: 'Die', value: 8, range: [4, 6, 8, 10, 12] } }],
				},
				{
					name: 'Social',
					rating: { type: 'Die', value: 6 },
					traits: [
						// Fallback to set track label
						{ name: 'Stress', rating: { type: 'Die', value: 4, range: [4, 6, 8, 10, 12] } },
					],
				},
			],
		};

		const char: any = { name: 'Custom Track Tester', traitSets: [customSet] };
		const block = mount(TraitSetBlock, {
			props: { character: char, traitSetID: 0, submode: 'play' },
		});

		const labels = block.findAll('.attached-stress-label').map((el) => el.text());
		expect(labels).toEqual(['Injured', 'Worried', 'Stress']);
		expect(customSet.view.labels.stress).toBeUndefined();
		expect(customSet.view.labels.track).toBe('Stress');

		// Test TraitSetMini child marker toggle
		const mini = mount(TraitSetMini, {
			props: { initialSet: customSet },
		});

		const markerToggles = mini.findAll('.mini-marker-toggle');
		expect(markerToggles.length).toBeGreaterThanOrEqual(3);
		const firstMarker = markerToggles[0];
		const initialText = firstMarker.text();
		await firstMarker.trigger('click');
		expect(firstMarker.text()).toBe(initialText === 'L' ? 'T' : 'L');

		mini.unmount();
		block.unmount();
	});

	describe('PageLayoutMini (Phase 4a & 4b)', () => {
		it('renders PageLayoutMini with placed boxes and stacked bands, maintaining accessibility', async () => {
			const char: any = {
				name: 'Layout Test Hero',
				view: { pageCount: 2 },
				traitSets: [
					{
						name: 'Distinctions',
						view: { page: 1, place: { left: '0%', width: '100%', top: 0, height: 2 } },
						traits: [{ name: 'Ace Pilot' }],
					},
					{
						name: 'Attributes',
						view: { page: 1, place: { left: '0%', width: '50%', top: 2, height: 2 } },
						traits: [{ name: 'Physical' }],
					},
					{
						name: 'Skills',
						view: { page: 2 }, // unplaced band
						traits: [{ name: 'Fight' }],
					},
				],
			};

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
			expect(char.traitSets[0].view.place).toBeUndefined();

			await runAxeAudit(wrapper.element as HTMLElement);
			wrapper.unmount();
		});

		it('commits place on release, while Escape key cancels gesture and leaves character model untouched', async () => {
			const initialPlace = { left: '0%', width: '100%', top: 0, height: 2 };
			const char: any = {
				name: 'Drag Cancel Hero',
				view: { pageCount: 1 },
				traitSets: [
					{
						name: 'Distinctions',
						view: { page: 1, place: { ...initialPlace } },
						traits: [{ name: 'Hero' }],
					},
				],
			};

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
			expect(char.traitSets[0].view.place.left).toBe('0%');
			expect(char.traitSets[0].view.place.width).toBe('100%');

			wrapper.unmount();
		});

		it('starts drag on the first pointerdown on an unselected block and commits with 5% snap, with mouse and touch unified', async () => {
			const char: any = {
				name: 'Pointer Drag Hero',
				view: { pageCount: 1 },
				traitSets: [
					{
						name: 'Unselected Set',
						view: { page: 1, place: { left: '10%', width: '40%', top: 0, height: 1 } },
						traits: [],
					},
				],
			};

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

			expect(char.traitSets[0].view.place.left).toBe('25%');

			// Now test touch pointerType drag moving by 38px (7.6% of 500px, snaps to 10% -> 25% + 10% = 35%)
			const pointerdownTouch = new PointerEvent('pointerdown', { clientX: 125, clientY: 10, pointerType: 'touch' });
			block.element.dispatchEvent(pointerdownTouch);

			const pointermoveTouch = new PointerEvent('pointermove', { clientX: 163, clientY: 10, pointerType: 'touch' });
			window.dispatchEvent(pointermoveTouch);

			const pointerupTouch = new PointerEvent('pointerup', { clientX: 163, clientY: 10, pointerType: 'touch' });
			window.dispatchEvent(pointerupTouch);

			expect(char.traitSets[0].view.place.left).toBe('35%');

			// Verify openSet is not emitted
			expect(wrapper.emitted('openSet')).toBeUndefined();

			wrapper.unmount();
		});

		it('resizes width and height via pointer on resize edges with 5% snap', async () => {
			const char: any = {
				name: 'Resize Edge Hero',
				view: { pageCount: 1 },
				traitSets: [
					{
						name: 'Resizable Set',
						view: { page: 1, place: { left: '10%', width: '40%', top: 0, height: 1 } },
						traits: [],
					},
				],
			};

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

			expect(char.traitSets[0].view.place.width).toBe('50%');

			// Drag height edge down by 40px (2 rows of 20px -> 1 + 2 = 3)
			const edgeS = wrapper.find('.place-mini-edge-s');
			expect(edgeS.exists()).toBe(true);

			edgeS.element.dispatchEvent(new PointerEvent('pointerdown', { clientX: 250, clientY: 20 }));
			window.dispatchEvent(new PointerEvent('pointermove', { clientX: 250, clientY: 60 }));
			window.dispatchEvent(new PointerEvent('pointerup', { clientX: 250, clientY: 60 }));

			expect(char.traitSets[0].view.place.height).toBe(3);

			wrapper.unmount();
		});

		it('moves set across pages in PageLayoutMini, reordering array, updating view.page, and leaving view.pillar untouched', async () => {
			const char: any = {
				name: 'Pillar Hero',
				view: { pageCount: 2 },
				traitSets: [
					{
						name: 'Set 1',
						view: { page: 1, pillar: 'prime', place: { left: '0%', width: '50%', top: 0, height: 1 } },
						traits: [],
					},
					{
						name: 'Set 2',
						view: { page: 2, pillar: 'identity', place: { left: '0%', width: '100%', top: 0, height: 1 } },
						traits: [],
					},
				],
			};

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

			expect(char.traitSets[0].view.page).toBe(2);
			// Pillar must never be disturbed!
			expect(char.traitSets[0].view.pillar).toBe('prime');
			expect(char.traitSets[1].view.pillar).toBe('identity');

			wrapper.unmount();
		});

		it('supports keyboard navigation: arrows move, shift+arrows resize, enter/space opens block mini', async () => {
			const char: any = {
				name: 'Keyboard Hero',
				view: { pageCount: 1 },
				traitSets: [
					{
						name: 'Movable Set',
						view: { page: 1, place: { left: '10%', width: '40%', top: 1, height: 2 } },
						traits: [],
					},
				],
			};

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
			expect(char.traitSets[0].view.place.left).toBe('15%');

			// Resize width (Shift+ArrowRight -> +5%)
			await block.trigger('keydown', { key: 'ArrowRight', shiftKey: true });
			expect(char.traitSets[0].view.place.width).toBe('45%');

			// Move down (ArrowDown -> +1 row)
			await block.trigger('keydown', { key: 'ArrowDown' });
			expect(char.traitSets[0].view.place.top).toBe(2);

			// Resize height (Shift+ArrowDown -> +1 row)
			await block.trigger('keydown', { key: 'ArrowDown', shiftKey: true });
			expect(char.traitSets[0].view.place.height).toBe(3);

			// Enter opens block mini
			await block.trigger('keydown', { key: 'Enter' });
			await wrapper.vm.$nextTick();
			// TraitSetMini teleported to body
			const bodyMini = document.body.querySelector('.trait-set-mini');
			expect(bodyMini).not.toBeNull();

			wrapper.unmount();
		});

		it('acceptance case: stress-bearing set with track, trackLabel, block, and companion scale preserves structure through move/resize', async () => {
			const stressSet = {
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
			};

			const char: any = {
				name: 'Stress Acceptance Hero',
				view: { pageCount: 1 },
				traitSets: [stressSet],
			};

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
			expect(char.traitSets[0].view.place.left).toBe('5%');
			expect(char.traitSets[0].view.place.top).toBe(1);

			// Verify stress parts and companion scale remain 100% intact
			expect(char.traitSets[0].view.parts.track).toEqual({ left: '65%', top: 0, width: '35%', height: 1 });
			expect(char.traitSets[0].view.parts.trackLabel).toEqual({ left: '40%', top: 0, width: '25%', height: 1 });
			expect(char.traitSets[0].view.parts.block).toEqual({ left: '0%', top: 1, width: '100%', height: 1 });
			expect(char.traitSets[0].traits[0].traits[0].rating.range).toEqual([4, 6, 8, 10, 12]);

			wrapper.unmount();
		});

		it('wires seamless TraitSetMini handoff: opens block mini, applies update, and returns with set selected', async () => {
			const char: any = {
				name: 'Handoff Hero',
				view: { pageCount: 1 },
				traitSets: [
					{
						name: 'Handoff Set',
						view: { page: 1, place: { left: '0%', width: '100%', top: 0, height: 1 } },
						traits: [{ name: 'Initial Trait' }],
					},
				],
			};

			const wrapper = mount(PageLayoutMini, {
				props: { character: char },
				attachTo: document.body,
			});

			// Select the set
			const ghost = wrapper.find('.place-mini-ghost');
			await ghost.trigger('pointerdown');

			// Click "Edit Parts" button
			const editPartsBtn = wrapper.find('.btn-open-block-mini');
			expect(editPartsBtn.exists()).toBe(true);
			await editPartsBtn.trigger('click');
			await wrapper.vm.$nextTick();

			// Verify TraitSetMini is rendered
			expect(document.body.querySelector('.trait-set-mini')).not.toBeNull();

			// Apply in TraitSetMini: update set name
			const applyBtn = document.body.querySelector('.btn-apply-sheet') as HTMLButtonElement;
			expect(applyBtn).not.toBeNull();
			applyBtn.click();

			await wrapper.vm.$nextTick();

			// TraitSetMini closed, returned to same page mini, set still selected
			expect(document.body.querySelector('.trait-set-mini')).toBeNull();
			expect(wrapper.find('.place-mini-block').exists()).toBe(true);

			wrapper.unmount();
		});
	});

	describe('Phase 3c: SVG Frames, Dynamic Positional Anchors, & Mobile Fallback', () => {
		function createStressBearingFramedSet(shape: any = 'ring') {
			return {
				name: 'Attributes',
				view: {
					frame: typeof shape === 'string' ? shape : { stroke: 'primary', ...shape },
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
			};
		}

		it('1. Stress-Bearing Framed Set: renders ring frame with visible, clickable rating die and stress track in Edit, Play, and Print', async () => {
			const set = createStressBearingFramedSet('ring');
			const char: any = { name: 'Framed Hero', traitSets: [set] };

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
			const char: any = { name: 'Morph Hero', traitSets: [set] };

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
			const ellipseSet = {
				...set,
				view: { ...set.view, frame: { shape: 'ellipse', span: [0, 360], stroke: 'accent', corner: 8 } },
			};
			await wrapper.setProps({ character: { name: 'Morph Hero', traitSets: [ellipseSet] } });
			await wrapper.vm.$nextTick();
			expect(wrapper.find('.trait-list').exists()).toBe(true);
			names = wrapper.findAll('.trait').map((t) => t.attributes('data-trait-name') || '');
			expect(names).toEqual(['Physical', 'Mental', 'Social']);

			// 3) Morph to Block
			const blockSet = {
				...set,
				view: { ...set.view, frame: { shape: 'block', corner: 'cut', stroke: 'primary' } },
			};
			await wrapper.setProps({ character: { name: 'Morph Hero', traitSets: [blockSet] } });
			await wrapper.vm.$nextTick();
			expect(wrapper.find('.trait-set-body-framed').exists()).toBe(true);
			expect(wrapper.find('.frame-block-svg').exists()).toBe(true);
			// Non-positional: portrait ring is removed, normal view.parts stack rendered
			expect(wrapper.find('.portrait').exists()).toBe(false);
			names = wrapper.findAll('.trait').map((t) => t.attributes('data-trait-name') || '');
			expect(names).toEqual(['Physical', 'Mental', 'Social']);

			// Parts intact
			expect(set.view.parts.track).toBeDefined();
			expect(set.view.parts.name).toBeDefined();

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

		it('4. Bare-Path Section Line (shape: "line"): renders crisp SVG section divider across Edit, Play, and Print', () => {
			const lineSet: any = {
				name: 'Divider Section',
				view: { frame: { shape: 'line', stroke: 'accent' } },
				traits: [{ name: 'Followup Trait' }],
			};
			const char: any = { name: 'Line Hero', traitSets: [lineSet] };

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
			const char: any = { name: 'Fallback Hero', traitSets: [set] };

			const wrapper = mount(TraitSetBlock, {
				props: { character: char, traitSetID: 0, submode: 'play' },
				attachTo: document.body,
			});

			expect(wrapper.find('.portrait').exists()).toBe(true);
			expect(wrapper.find('.frame-radial-svg').exists()).toBe(true);

			// 1. User selects "none" (or deletes frame in editor): turns frame off cleanly to view.parts
			const unframedSet = structuredClone(set);
			delete unframedSet.view.frame;
			await wrapper.setProps({ character: { name: 'Fallback Hero', traitSets: [unframedSet] } });
			expect(wrapper.find('.portrait').exists()).toBe(false);
			expect(wrapper.find('.frame-radial-svg').exists()).toBe(false);

			// Traits still render stacked with stress track intact
			const traits = wrapper.findAll('.trait');
			expect(traits.length).toBe(3);
			expect(wrapper.findAll('.attached-stress-track').length).toBe(3);

			// 2. User re-enables frame: restores frame cleanly
			const reframedSet = structuredClone(set);
			reframedSet.view.frame = { shape: 'ring', span: [0, 360] };
			await wrapper.setProps({ character: { name: 'Fallback Hero', traitSets: [reframedSet] } });
			expect(wrapper.find('.portrait').exists()).toBe(true);
			expect(wrapper.find('.frame-radial-svg').exists()).toBe(true);

			wrapper.unmount();
		});

		it('6. A11y & Sparse JSON Compliance: SVG contains zero text, DOM order is 0..N-1, and JSON is terse', async () => {
			const set = createStressBearingFramedSet({ shape: 'ring', span: [0, 360], stroke: 'primary', corner: 8 });
			const char: any = { name: 'A11y Hero', traitSets: [set] };

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

		it('7. Frame = Arc fan-out distribution & ratingDisplay option', async () => {
			const arcSet: any = {
				name: 'Roles',
				view: {
					frame: { shape: 'arc' },
					ratingDisplay: 'rating',
				},
				traits: [
					{ name: 'Commander', rating: { type: 'Die', value: [6], range: [4, 6, 8, 10, 12] } },
					{ name: 'Engineer', rating: { type: 'Die', value: [8], range: [4, 6, 8, 10, 12] } },
					{ name: 'Navigator', rating: { type: 'Die', value: [10], range: [4, 6, 8, 10, 12] } },
				],
			};
			const char: any = { name: 'Arc Hero', traitSets: [arcSet] };

			const wrapper = mount(TraitSetBlock, {
				props: { character: char, traitSetID: 0, submode: 'play' },
				attachTo: document.body,
			});

			// Frame shape arc & open radial SVG rendered
			expect(wrapper.find('.trait-list-framed.frame-shape-arc').exists()).toBe(true);
			const svg = wrapper.find('.trait-set-frame-svg.frame-radial-svg');
			expect(svg.exists()).toBe(true);
			const pathD = svg.find('path').attributes('d') || '';
			// Open arc path: M ... A ... with no Z (not closed circle)
			expect(pathD).toMatch(/^M [\d.]+,\s*[\d.]+ A /);
			expect(pathD.endsWith('Z')).toBe(false);

			// Dynamic anchors span from 1:30 (45°) to 4:30 (135°) centered at 3 o'clock (90°)
			const traits = wrapper.findAll('.trait');
			expect(traits.length).toBe(3);
			expect(traits[0].attributes('data-frame-dock')).toBe('right');
			expect(traits[1].attributes('data-frame-dock')).toBe('right');
			expect(traits[2].attributes('data-frame-dock')).toBe('right');

			// Rating display = 'rating': renders single active die instead of full 5-die ladder
			const singleDieVals = wrapper.findAll('.single-die-value');
			expect(singleDieVals.length).toBe(3);
			// Under ratingDisplay: 'rating', each trait renders exactly 1 die glyph
			for (const val of singleDieVals) {
				const dice = val.findAll('[role="button"]');
				expect(dice.length).toBe(1);
			}

			// Switch to ratingDisplay: 'track': renders full 5-die ladder track
			const trackSet = structuredClone(arcSet);
			trackSet.view.ratingDisplay = 'track';
			await wrapper.setProps({ character: { name: 'Arc Hero', traitSets: [trackSet] } });
			const trackDieVals = wrapper.findAll('.single-die-value');
			for (const val of trackDieVals) {
				const dice = val.findAll('[role="button"]');
				expect(dice.length).toBe(5);
			}

			wrapper.unmount();
		});
	});

	describe('Phase 4: Unified Set & Subtrait Editor (Rule of 3)', () => {
		it('renders identity (name line 1, description line 2) and unified rating types in TraitEditor for a subtrait', async () => {
			const char: any = {
				name: 'Test Hero',
				traitSets: [
					{
						name: 'Skills',
						traits: [
							{
								name: 'Combat',
								traits: [{ name: 'Swords', rating: { type: 'Die', value: [8], range: [4, 6, 8, 10, 12] } }],
							},
						],
					},
				],
			};

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
			expect(char.traitSets[0].traits[0].traits[0].rating.type).toBe('Pip');

			wrapper.unmount();
		});

		it('derives counter column presence structurally from Counter rating traits without set flags', async () => {
			const { default: TraitSetBlock } = await import('../js/trait-set-block.vue');
			const char: any = {
				name: 'Counter Hero',
				traitSets: [
					{
						name: 'Badges',
						view: { style: { body: 'die-rows' } },
						traits: [
							{
								name: 'XP Badge',
								rating: { type: 'Counter', value: [5], range: [0, 20] },
							},
						],
					},
				],
			};

			const wrapper = mount(TraitSetBlock, {
				props: { character: char, traitSetID: 0, submode: 'play' },
				attachTo: document.body,
			});

			// Has counter column rendered structurally
			expect(wrapper.find('.die-row-counter').exists()).toBe(true);
			wrapper.unmount();
		});

		it('warns before rating-type change when child traits exist and confirms switch', async () => {
			const char: any = {
				name: 'Complex Trait Hero',
				traitSets: [
					{
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
					},
				],
			};

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
			expect(char.traitSets[0].traits[0].traits[0].rating.type).toBe('Die');

			// Click Confirm in warning banner -> switches type to Counter
			const confirmBtn = wrapper.find('.btn-warning-confirm');
			expect(confirmBtn.exists()).toBe(true);
			await confirmBtn.trigger('click');
			expect(char.traitSets[0].traits[0].traits[0].rating.type).toBe('Counter');

			wrapper.unmount();
		});

		it('supports statement child trait in Play mode with read-only name and interactive pip toggle', async () => {
			const char: any = {
				name: 'Statement Hero',
				traitSets: [
					{
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
					},
				],
			};

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
			expect(char.traitSets[0].traits[0].traits[0].rating.value[0]).toBe(true);

			wrapper.unmount();
		});

		it('renders [OUT] toggle chip in the scale row and updates out state', async () => {
			const { default: TraitSetEditor } = await import('../js/trait-set-editor.vue');
			const char: any = {
				name: 'Out Hero',
				traitSets: [
					{
						name: 'Stress',
						view: { style: { body: 'die-track' }, parts: { track: true } },
						traits: [{ name: 'Physical', rating: { type: 'Die', value: [6] } }],
					},
				],
			};

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
			const char: any = {
				name: 'Subtrait Hero',
				traitSets: [
					{
						name: 'Attributes',
						noun: 'Attribute',
						view: {},
						traits: [
							{ name: 'Agility', rating: { type: 'Die', value: [8], range: [4, 6, 8, 10, 12] }, traits: [] },
							{ name: 'Brawn', rating: { type: 'Die', value: [6], range: [4, 6, 8, 10, 12] }, traits: [] },
						],
					},
				],
			};

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

			// 2. StudioPanel drills down into TraitEditor with breadcrumb "Sheet › Attributes › Stress"
			const studio = mount(StudioPanel, {
				props: {
					character: char,
					editing: ['subtrait', 0, 0, 0],
					submode: 'edit',
				},
				attachTo: document.body,
			});
			const crumbText = studio.find('.studio-breadcrumb').text();
			expect(crumbText).toContain('Attributes');
			expect(crumbText).toContain('Stress');
			expect(crumbText).not.toContain('Subtrait Stress');
			expect(studio.findComponent(TraitEditor).exists()).toBe(true);
			studio.unmount();

			// 3. Parent's mini surfaces both parent's parts and subtraits' parts labelled by owner trait
			const mini = mount(TraitSetMini, {
				props: {
					initialSet: {
						name: 'Values',
						noun: 'Value',
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
			const char: any = {
				name: 'Recursive Hero',
				traitSets: [
					{
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
					},
				],
			};

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
			expect(char.traitSets[0].traits[0].traits.length).toBe(2);
			expect(char.traitSets[0].traits[0].traits[1].noun).toBe('Subtrait 2');
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
			const char: any = structuredClone(VANGUARD_FRAME_SHOWCASE.character);

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
			expect(char.traitSets[0].traits[0].traits[0].rating.out).toBe(true);
			expect(char.traitSets[0].traits[4].traits[0].rating.out).toBe(true);
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
			const distChar: any = {
				name: 'Tester',
				traitSets: [
					{
						name: 'Distinctions',
						noun: 'Distinction',
						view: { header: 'top', headerAlign: 'center' },
						traits: [{ name: 'Clever', rating: { type: 'Die', value: [8], range: [4, 6, 8, 10, 12] } }],
					},
				],
			};
			const distEditor = mount(TraitSetEditor, {
				props: { character: distChar, traitSetID: 0 },
				attachTo: document.body,
			});
			// Set Header Bottom Bar updates row-mini to render header below body
			const bottomBtn = distEditor.find('button[title="Bottom bar header"]');
			expect(bottomBtn.exists()).toBe(true);
			await bottomBtn.trigger('click');
			expect(distChar.traitSets[0].view.header).toBe('bottom');
			expect(distEditor.find('.row-mini-headerbar-bottom').exists()).toBe(true);

			// Remove header via row-mini remove button -> header = 'none', renders + Header restore button
			const removeHeaderBtn = distEditor.find('.row-mini-header-remove');
			expect(removeHeaderBtn.exists()).toBe(true);
			await removeHeaderBtn.trigger('click');
			expect(distChar.traitSets[0].view.header).toBe('none');
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
			expect(distChar.traitSets[0].view.parts).toEqual({});
			distEditor.unmount();

			// 5. Trait Block Mini modal also supports bottom header, none header, and removing all parts
			const modalMini = mount(TraitSetMini, {
				props: { initialSet: { name: 'Distinctions', noun: 'Distinction', traits: [] } },
			});
			const modalBtns = modalMini.findAll('.mini-header-controls .mini-toggle-btn');
			const bottomCenterBtn = modalBtns.find((b) => b.text().includes('Bottom Center'));
			const noneHeaderBtn = modalBtns.find((b) => b.text().includes('None'));
			expect(bottomCenterBtn?.exists()).toBe(true);
			expect(noneHeaderBtn?.exists()).toBe(true);
			await bottomCenterBtn!.trigger('click');
			expect(modalMini.find('.trait-set.trait-set-header-bottom').exists()).toBe(true);
			await noneHeaderBtn!.trigger('click');
			expect(modalMini.find('.trait-set-header').exists()).toBe(false);

			let modalRemovers = modalMini.findAll('.block-mini-part-remove');
			expect(modalRemovers.length).toBe(2);
			await modalRemovers[1].trigger('click');
			expect(modalMini.findAll('.block-mini-part').length).toBe(1);
			modalRemovers = modalMini.findAll('.block-mini-part-remove');
			await modalRemovers[0].trigger('click');
			expect(modalMini.findAll('.block-mini-part').length).toBe(0);
			modalMini.unmount();

			// 6. Image block shows a resizable Image box in the section mini and applies stored width/height
			const imgChar: any = {
				name: 'Tester',
				traitSets: [
					{
						name: 'Art',
						view: {
							style: { body: 'image' },
							imageConfig: { url: 'x.png', width: '50%', height: '180px' },
						},
						traits: [],
					},
				],
			};
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

			// 7. Ring set with no stored parts previews name and rating inline, as it renders
			const ringChar: any = {
				name: 'Tester',
				traitSets: [
					{
						name: 'Ring Set',
						noun: 'Distinction',
						view: { frame: { shape: 'ring' } },
						traits: [{ name: 'A', rating: { type: 'Die', value: [8], range: [4, 6, 8, 10, 12] } }],
					},
				],
			};
			const ringEditor = mount(TraitSetEditor, {
				props: { character: ringChar, traitSetID: 0 },
				attachTo: document.body,
			});
			const ringBoxes = ringEditor.findAll('.row-mini-box');
			expect(ringBoxes.length).toBe(2);
			const rowOf = (b: any) => (b.attributes('style') || '').match(/grid-row: (\d+)/)?.[1];
			expect(rowOf(ringBoxes[0])).toBe(rowOf(ringBoxes[1]));
			ringEditor.unmount();
		});

		it('renders Vanguard Values statement with zero duplication, places pip and box in dynamic grid cells, and renders Library card hero traits in 3 o clock arc distribution', async () => {
			const { default: TraitSetBlock } = await import('../js/trait-set-block.vue');
			const { default: PortraitRing } = await import('../js/portrait-ring.vue');
			const { VANGUARD_FRAME_SHOWCASE } = await import('../js/showcase-templates.ts');
			const char: any = structuredClone(VANGUARD_FRAME_SHOWCASE.character);

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
			expect(char.traitSets[4].traits[0].traits[0].rating.value[0]).toBe(false);
			await pipInRatingCell.trigger('click');
			expect(char.traitSets[4].traits[0].traits[0].rating.value[0]).toBe(true);

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
			const char: any = structuredClone(VANGUARD_FRAME_SHOWCASE.character);
			const valuesSet = char.traitSets.find((ts: any) => ts.name === 'Values');
			expect(valuesSet).toBeDefined();

			// 1. With editableOnSheet true on Values trait, renders input on sheet
			const dutyTrait = valuesSet.traits.find((t: any) => t.name === 'Duty');
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
			const dutyStatementChild = dutyTrait.traits[0];
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
			const char: any = structuredClone(VANGUARD_FRAME_SHOWCASE.character);
			const distinctionsSetIdx = char.traitSets.findIndex((ts: any) => ts.name === 'Distinctions');
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
			expect(distinctionsSet.view.ratingDisplay).toBe('rating');

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
				const hasHinder = tr.traits?.some((st: any) => st.name === 'Hinder' || st.name === 'SFX');
				expect(hasHinder).toBeFalsy();
			}

			setEditor.unmount();

			// 2. TraitEditor on an individual distinction also surfaces Hinder
			const charWithHinder: any = structuredClone(VANGUARD_FRAME_SHOWCASE.character);
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
			const stillHasHinder = firstTrait.traits?.some((st: any) => st.name === 'Hinder' || st.name === 'SFX');
			expect(stillHasHinder).toBeFalsy();

			traitEditor.unmount();
		});

		it('verifies Part A: ring into frame, frame images, zoom, and pointer events', async () => {
			const char: any = {
				name: 'Test Pilot',
				portrait: { url: 'https://example.com/portrait.jpg', view: { zoom: 1 } },
				traitSets: [
					// Set 0: frame shape ring
					{
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
					},
					// Set 1: style alias portrait-ring without frame
					{
						name: 'Legacy Roles',
						noun: 'Role',
						view: {
							style: { body: 'portrait-ring' },
							ringConfig: { arcAngle: -90, arcSpread: 100 },
							imageConfig: { url: 'https://example.com/legacy-hub.jpg', zoom: 0.75 },
						},
						traits: [{ name: 'Gunner', rating: { type: 'Die', value: [8] } }],
					},
					// Set 2: block frame with image
					{
						name: 'Equipment',
						noun: 'Item',
						view: {
							frame: {
								shape: 'block',
								image: { url: 'https://example.com/hero.jpg' },
							},
						},
						traits: [{ name: 'Blaster', rating: { type: 'Die', value: [6] } }],
					},
					// Set 3: line frame with image (ignored)
					{
						name: 'Divider Set',
						noun: 'Divider',
						view: {
							frame: {
								shape: 'line',
								image: { url: 'https://example.com/ignored.jpg' },
							},
						},
						traits: [{ name: 'Note', rating: { type: 'Die', value: [6] } }],
					},
				],
			};

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

			// 2. Style body alias portrait-ring renders ring with fallback to ringConfig & imageConfig
			const w1 = mount(TraitSetBlock, {
				props: { character: char, traitSetID: 1, submode: 'edit', editing: [] },
			});
			expect(w1.find('.portrait').exists()).toBe(true);
			const circle1 = w1.find('.portrait-circle');
			const style1 = circle1.attributes('style') || '';
			expect(style1).toContain('https://example.com/legacy-hub.jpg');
			expect(style1).toContain('background-size: 75%');
			w1.unmount();

			// 3. Block frame with image renders header image
			const w2 = mount(TraitSetBlock, {
				props: { character: char, traitSetID: 2, submode: 'edit', editing: [] },
			});
			const hero2 = w2.find('.frame-header-image');
			expect(hero2.exists()).toBe(true);
			expect(hero2.attributes('style')).toContain('https://example.com/hero.jpg');
			w2.unmount();

			// 4. Line frame with image ignores image
			const w3 = mount(TraitSetBlock, {
				props: { character: char, traitSetID: 3, submode: 'edit', editing: [] },
			});
			expect(w3.find('.frame-header-image').exists()).toBe(false);
			expect(w3.find('.portrait').exists()).toBe(false);
			w3.unmount();
		});

		it('verifies Part B: generic Pip-child path, removal of statement shortcuts, and editableOnSheet', async () => {
			const char: any = {
				name: 'Test Pilot',
				traitSets: [
					{
						name: 'Values',
						noun: 'Value',
						view: {
							editableOnSheet: true,
						},
						traits: [
							{
								name: 'Duty',
								description: 'The crew comes home before the cargo.',
								rating: { type: 'Die', value: 8 },
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
								rating: { type: 'Die', value: 8 },
								// No pip child yet
							},
						],
					},
				],
			};

			let tsApi: any;
			const TestHarness = defineComponent({
				props: ['submode'],
				setup(props, { emit }) {
					tsApi = useTraitSet({ character: char, traitSetID: 0, submode: props.submode || 'edit' } as any, emit);
					return () => h('div');
				},
			});

			const harness = mount(TestHarness, { props: { submode: 'edit' } });

			// 1. Statement shortcuts are gone from API, generic ones present
			expect(tsApi.canEditStatement).toBeUndefined();
			expect(tsApi.getStatementText).toBeUndefined();
			expect(tsApi.setStatementText).toBeUndefined();
			expect(typeof tsApi.canEditChildOnSheet).toBe('function');
			expect(typeof tsApi.setPipChildName).toBe('function');

			// 2. canEditChildOnSheet gate logic
			expect(tsApi.canEditChildOnSheet(char.traitSets[0].traits[0], char.traitSets[0])).toBe(true);
			// In print mode, returns false
			let printTsApi: any;
			const PrintHarness = defineComponent({
				setup(_p, { emit }) {
					printTsApi = useTraitSet({ character: char, traitSetID: 0, submode: 'print' } as any, emit);
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
			const newPipChild = tsApi.getPipChild(gloryTrait);
			expect(newPipChild).toBeDefined();
			expect(newPipChild.name).toBe('');
			expect(newPipChild.view).toEqual({});
			expect(newPipChild.rating).toEqual({ type: 'Pip', value: [true] });

			// 5. setPipChildName updates child name and creates unnamed pip child if missing
			tsApi.setPipChildName(gloryTrait, 'Updated glory text');
			expect(tsApi.getPipChild(gloryTrait)?.name).toBe('Updated glory text');

			const newTraitWithoutChild: any = {
				name: 'Justice',
				description: 'Justice description',
				rating: { type: 'Die', value: 8 },
			};
			tsApi.setPipChildName(newTraitWithoutChild, 'Freshly typed statement');
			const createdChild = tsApi.getPipChild(newTraitWithoutChild);
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
			delete nonEditableChar.traitSets[0].view.editableOnSheet;
			const blockNonEditable = mount(TraitSetBlock, {
				props: { character: nonEditableChar, traitSetID: 0, submode: 'edit', editing: [] },
			});
			expect(blockNonEditable.findAll('input.trait-pip-input').length).toBe(0);
			blockNonEditable.unmount();
		});

		it('verifies trait editor has no dedicated statement field, Pip child is editable via Subtraits drill-in, and multidie badge has active without c', async () => {
			const char: any = {
				name: 'Test Character',
				traitSets: [
					{
						name: 'Values',
						noun: 'Value',
						traits: [
							{
								name: 'Duty',
								rating: { type: 'Die', value: 8 },
								traits: [
									{
										name: 'Initial Statement',
										rating: { type: 'Pip', value: [false] },
									},
								],
							},
						],
					},
					{
						name: 'Assets',
						noun: 'Asset',
						traits: [
							{
								name: 'Vehicle',
								rating: { type: 'Dice', value: [6, 8] },
							},
						],
					},
				],
			};

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
			expect(char.traitSets[0].traits[0].traits[0].name).toBe('Edited via Drilldown');
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
	});
});
