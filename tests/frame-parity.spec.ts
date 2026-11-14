import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import TraitSetBlock from '../js/trait-set-block.vue';
import TraitSetFrame from '../js/trait-set-frame.vue';
import {
	resolveBorder,
	resolveFrame,
	computeFrameAnchors,
	buildPortraitFramePath,
	normalizeZoom,
	type FrameConfig,
} from '../js/frame-geometry.ts';
import { characterCurioFunctions } from '../js/functions.ts';

describe('Step 1: Frame Chrome & Ring Parity Suite', () => {
	describe('Baseline 1: Classic Block Frame Chrome Parity', () => {
		it('renders TraitSetFrame, carries framed suppression classes, and draws perimeter + sidebar spine', () => {
			const character = {
				name: 'Test Character',
				traitSets: [
					{
						name: 'Attributes',
						noun: 'Attribute',
						view: {
							header: 'sidebar',
							frame: { shape: 'block', color: 'strong' },
						},
						traits: [{ name: 'Agility', rating: { type: 'Die', value: [8] } }],
					},
				],
			};

			const wrapper = mount(TraitSetBlock, {
				props: { character, traitSetID: 0, submode: 'play', editing: [] },
			});

			// Check framed suppression classes (disables box CSS border)
			expect(wrapper.classes()).toContain('trait-set-framed');
			expect(wrapper.classes()).toContain('trait-set-frame-block');

			// Check TraitSetFrame component rendered
			const frameSvg = wrapper.findComponent(TraitSetFrame);
			expect(frameSvg.exists()).toBe(true);
			expect(frameSvg.classes()).toContain('frame-block-svg');
			expect(frameSvg.classes()).toContain('frame-color-strong');

			// Check perimeter path exists
			const perimeter = frameSvg.find('.frame-perimeter-path');
			expect(perimeter.exists()).toBe(true);
			expect(perimeter.attributes('d')).toMatch(/^M \d+/);

			// Check vertical spine line exists for sidebar header mode
			const spine = frameSvg.find('.frame-spine-path');
			expect(spine.exists()).toBe(true);
			const spineD = spine.attributes('d') || '';
			expect(spineD).toMatch(/^M [\d.]+,1 L [\d.]+,/);

			wrapper.unmount();
		});

		it('renders horizontal spine line for top header mode', () => {
			const character = {
				name: 'Test Character',
				traitSets: [
					{
						name: 'Skills',
						noun: 'Skill',
						view: {
							header: 'top',
							frame: { shape: 'block', stroke: 'strong' },
						},
						traits: [{ name: 'Fight', rating: { type: 'Die', value: [6] } }],
					},
				],
			};

			const wrapper = mount(TraitSetBlock, {
				props: { character, traitSetID: 0, submode: 'play', editing: [] },
			});

			const frameSvg = wrapper.findComponent(TraitSetFrame);
			expect(frameSvg.exists()).toBe(true);

			const spine = frameSvg.find('.frame-spine-path');
			expect(spine.exists()).toBe(true);
			const spineD = spine.attributes('d') || '';
			// Top spine is horizontal: M 1,{hh} L {w-1},{hh}
			expect(spineD).toMatch(/^M 1,[\d.]+ L \d+,[\d.]+/);

			wrapper.unmount();
		});

		it('suppresses spine line when set has no header (empty name)', () => {
			const character = {
				name: 'Test Character',
				traitSets: [
					{
						name: '',
						noun: 'Trait',
						view: {
							header: 'top',
							frame: { shape: 'block', stroke: 'strong' },
						},
						traits: [{ name: 'Stealth', rating: { type: 'Die', value: [6] } }],
					},
				],
			};

			const wrapper = mount(TraitSetBlock, {
				props: { character, traitSetID: 0, submode: 'play', editing: [] },
			});

			// No header rendered
			expect(wrapper.find('.trait-set-header').exists()).toBe(false);

			const frameSvg = wrapper.findComponent(TraitSetFrame);
			expect(frameSvg.exists()).toBe(true);

			// No spine line drawn
			expect(frameSvg.find('.frame-spine-path').exists()).toBe(false);

			wrapper.unmount();
		});

		it('preserves custom set background tint in perimeter path fill', () => {
			const character = {
				name: 'Test Character',
				traitSets: [
					{
						name: 'Special Assets',
						noun: 'Asset',
						view: {
							tint: '#e0f2fe',
							frame: { shape: 'block', stroke: 'primary' },
						},
						traits: [{ name: 'Hoverbike', rating: { type: 'Die', value: [8] } }],
					},
				],
			};

			const wrapper = mount(TraitSetBlock, {
				props: { character, traitSetID: 0, submode: 'play', editing: [] },
			});

			const frameSvg = wrapper.findComponent(TraitSetFrame);
			const perimeter = frameSvg.find('.frame-perimeter-path');
			expect(perimeter.attributes('style')).toMatch(/fill:\s*(#e0f2fe|rgb\(224,\s*242,\s*254\))/);

			wrapper.unmount();
		});

		it('renders non-squashed corner radius with live pixel dimensions', () => {
			const traitSet = {
				name: 'Test Block',
				view: {
					frame: { shape: 'block', color: 'primary', corner: 4 },
				},
			};

			const wrapper = mount(TraitSetFrame, {
				props: {
					traitSet,
					width: 400,
					height: 200,
					headerWidth: 30.4,
					hasHeader: true,
				},
			});

			expect(wrapper.attributes('viewBox')).toBe('0 0 400 200');
			const d = wrapper.find('.frame-perimeter-path').attributes('d') || '';
			// Corner radius 4 in 400x200 box: M 5,1 L 395,1 Q 399,1 399,5 ...
			expect(d).toContain('M 5,1 L 395,1 Q 399,1 399,5');

			wrapper.unmount();
		});
	});

	describe('Baseline 2: Ring Parity Geometry (Equidistant Distribution)', () => {
		it('resolveFrame with view.attributesRing: true and no frame, and no ringConfig returns null', () => {
			const setWithAttrRing = {
				name: 'Attributes',
				view: {
					attributesRing: true,
				},
			};
			expect(resolveFrame(setWithAttrRing)).toBeNull();

			const setLevelAttrRing = {
				name: 'Attributes',
				attributesRing: true,
				view: {},
			};
			expect(resolveFrame(setLevelAttrRing)).toBeNull();
		});

		it('resolves frame ring carrying ringConfig', () => {
			const ringSet = {
				name: 'Attributes',
				view: {
					frame: { shape: 'ring' },
					ringConfig: {
						arcAngle: -90,
						arcSpread: 100,
						arcDistance: 0,
					},
				},
			};

			const resolved = resolveFrame(ringSet);
			expect(resolved).not.toBeNull();
			expect(resolved?.shape).toBe('ring');
			expect(resolved?.ringConfig).toBeDefined();
			expect(resolved?.ringConfig?.arcAngle).toBe(-90);
			expect(resolved?.ringConfig?.arcSpread).toBe(100);
		});

		it('normalizes image zoom multiplier to three decimal places', () => {
			expect(normalizeZoom(1)).toBe(1);
			expect(normalizeZoom(1.5)).toBe(1.5);
			expect(normalizeZoom(0.5)).toBe(0.5);
			expect(normalizeZoom(1.23456)).toBe(1.235);
			expect(normalizeZoom(undefined)).toBeUndefined();
			expect(normalizeZoom('1' as unknown as number)).toBeUndefined();

			const frameSet = {
				name: 'Portrait',
				view: { frame: { shape: 'ring', image: { url: 'x.png', zoom: 1.25 } } },
			};
			expect(resolveFrame(frameSet)?.image?.zoom).toBe(1.25);
		});

		it('resolves frame carrying traitsSpan separate from border span', () => {
			const architectSet = {
				name: 'The Architect',
				view: {
					frame: {
						shape: 'ring',
						span: [0, 360],
						traitsSpan: [45, 135],
					},
				},
			};

			const resolved = resolveFrame(architectSet);
			expect(resolved).not.toBeNull();
			expect(resolved?.shape).toBe('ring');
			expect(resolved?.span).toEqual([0, 360]);
			expect(resolved?.traitsSpan).toEqual([45, 135]);
		});

		it('distributes ring traits along traitsSpan on the right arc while border uses span', () => {
			const frameConfig: FrameConfig = {
				shape: 'ring',
				portraitShape: 'circle',
				array: 'arc',
				span: [0, 360],
				traitsSpan: [45, 135],
				corner: 8,
				stroke: '2px',
				color: 'primary',
			};

			const anchors = computeFrameAnchors(3, frameConfig);
			expect(anchors).toHaveLength(3);
			// 3 traits along [45, 135] -> 45, 90, 135
			expect(anchors[0].angle).toBe(45);
			expect(anchors[1].angle).toBe(90);
			expect(anchors[2].angle).toBe(135);
			// All traits are on right hemisphere (x > 50)
			expect(anchors[0].x).toBeGreaterThan(50);
			expect(anchors[1].x).toBeGreaterThan(50);
			expect(anchors[2].x).toBeGreaterThan(50);
			expect(anchors[0].dock).toBe('right');
			expect(anchors[1].dock).toBe('right');
			expect(anchors[2].dock).toBe('right');
		});

		it('verifies frame anchors distribute equidistantly across 360° for closed ring', () => {
			const frameConfig: FrameConfig = {
				shape: 'ring',
				portraitShape: 'circle',
				array: 'ring',
				span: [0, 360],
				corner: 8,
				stroke: '2px',
				color: 'primary',
			};

			const anchors4 = computeFrameAnchors(4, frameConfig);
			expect(anchors4.length).toBe(4);
			expect(anchors4[0].angle).toBe(0);
			expect(anchors4[0].dock).toBe('top');
			expect(anchors4[1].angle).toBe(90);
			expect(anchors4[1].dock).toBe('right');
			expect(anchors4[2].angle).toBe(180);
			expect(anchors4[2].dock).toBe('bottom');
			expect(anchors4[3].angle).toBe(270);
			expect(anchors4[3].dock).toBe('left');

			// Vanguard: 6 traits -> 60° increments
			const anchors6 = computeFrameAnchors(6, frameConfig);
			expect(anchors6.length).toBe(6);
			for (let i = 0; i < 6; i++) {
				expect(anchors6[i].angle).toBe(i * 60);
			}
		});

		it('resolves frame defaults: { shape: arc } resolves to portraitShape circle, array arc, color primary, stroke 2px', () => {
			const res = resolveFrame({ shape: 'arc' });
			expect(res).toEqual({
				shape: 'arc',
				portraitShape: 'circle',
				array: 'arc',
				span: [45, 135],
				corner: 8,
				stroke: '2px',
				color: 'primary',
				box: false,
				path: null,
				ringConfig: null,
			});
			expect('dash' in res!).toBe(false);
		});

		it('honors 2D view.parts layout alongside orthogonal block border and portrait frame (array: none)', () => {
			const character = {
				name: 'Horizon Vanguard',
				traitSets: [
					{
						name: 'Distinctions',
						noun: 'Distinction',
						view: {
							border: { shape: 'block', corner: 'cut', color: 'primary', stroke: '4px' },
							frame: { shape: 'round', array: 'none', color: 'primary', stroke: '4px' },
							parts: {
								rating: { left: '0%', width: '30%', top: 0, height: 1 },
								name: { left: '30%', width: '70%', top: 0, height: 1 },
								block: { left: '0%', width: '100%', top: 1, height: 1 },
							},
						},
						traits: [
							{
								name: 'Slipstream Test Pilot',
								rating: { type: 'Die', value: [8] },
								traits: [{ name: 'Hinder', noun: 'SFX', description: 'Gain a PP', ppDelta: 1 }],
							},
						],
					},
				],
			};

			const wrapper = mount(TraitSetBlock, {
				props: { character, traitSetID: 0, submode: 'play', editing: [] },
			});

			expect(wrapper.find('.frame-block-svg').exists()).toBe(true);
			expect(wrapper.find('.portrait.portrait-shape-round').exists()).toBe(true);
			const listEl = wrapper.find('.trait-list');
			expect(listEl.exists()).toBe(true);

			const traitInner = listEl.find('.trait .trait-inner.trait-parts');
			expect(traitInner.exists()).toBe(true);

			// Container style has 2-column grid tracks
			const innerStyle = traitInner.attributes('style') || '';
			expect(innerStyle).toContain('grid-template-columns:');

			// Rating cell: col 1 / span 1, row 1 / span 1
			const ratingPart = traitInner.find('.trait-part-rating');
			expect(ratingPart.exists()).toBe(true);
			const ratingStyle = ratingPart.attributes('style') || '';
			expect(ratingStyle).toContain('grid-column: 1 / span 1');
			expect(ratingStyle).toContain('grid-row: 1 / span 1');

			// Name cell: col 2 / span 1, row 1 / span 1
			const namePart = traitInner.find('.trait-part-name');
			expect(namePart.exists()).toBe(true);
			const nameStyle = namePart.attributes('style') || '';
			expect(nameStyle).toContain('grid-column: 2 / span 1');
			expect(nameStyle).toContain('grid-row: 1 / span 1');

			// Block cell: col 1 / span 2, row 2 / span 1
			const blockPart = traitInner.find('.trait-part-block');
			expect(blockPart.exists()).toBe(true);
			const blockStyle = blockPart.attributes('style') || '';
			expect(blockStyle).toContain('grid-column: 1 / span 2');
			expect(blockStyle).toContain('grid-row: 2 / span 1');

			wrapper.unmount();
		});

		it('Item 3: spreads multi-die ring trait and set-level Dice across ring arc without duplicating list distinctions', async () => {
			const raw = (await import('../data/templates/Dreamer_Architect.curio.json')).default;
			const character = structuredClone(raw);

			// Set 0 (The Architect): set-level Dice [10, 10, 10] spreads into 3 ring die nodes without repeated Boss Die labels
			const archWrapper = mount(TraitSetBlock, {
				props: { character, traitSetID: 0, submode: 'edit', editing: [] },
			});
			const ringTraits = archWrapper.findAll('.ring-trait');
			expect(ringTraits).toHaveLength(3);
			expect(archWrapper.findAll('.ring-trait-name')).toHaveLength(0);
			expect(archWrapper.findAll('.ring-trait-inner').map((el) => el.attributes('aria-label'))).toEqual([
				'Stage d10 Boss Die',
				'Stage d10 Boss Die',
				'Stage d10 Boss Die',
			]);
			const ringAngles = ringTraits.map((t) => t.attributes('style') || '');
			expect(new Set(ringAngles).size).toBe(3);
			archWrapper.unmount();

			// Set 1 (Architect Distinctions): 3 list traits
			const distWrapper = mount(TraitSetBlock, {
				props: { character, traitSetID: 1, submode: 'edit', editing: [] },
			});
			const listEl = distWrapper.findComponent({ name: 'TraitSetList' });
			expect(listEl.exists()).toBe(true);
			const listTraits = listEl.findAll('.trait');
			const listNames = listTraits.map((t) => t.find('.trait-name').text().trim());
			expect(listNames).toContain('Function Before Form');
			expect(listNames).toContain('Less is More');
			expect(listNames).toContain('All My Darlings are Dead');
			distWrapper.unmount();

			// Multi-die TRAIT on a ring also spreads all of its dice across the arc without repeating labels
			const multiDieTraitChar: any = structuredClone(raw);
			delete multiDieTraitChar.traitSets[0].rating;
			multiDieTraitChar.traitSets[0].traits = [
				{
					name: 'Boss Die',
					description: '',
					rating: { type: 'Dice', value: [10, 10, 10], range: [4, 6, 8, 10, 12] },
					traits: [],
					tags: [],
					view: { ring: true, noun: 'Boss Die' },
				},
			];
			const traitRingWrapper = mount(TraitSetBlock, {
				props: { character: multiDieTraitChar, traitSetID: 0, submode: 'edit', editing: [] },
			});
			const spreadTraits = traitRingWrapper.findAll('.ring-trait');
			expect(spreadTraits).toHaveLength(3);
			expect(traitRingWrapper.findAll('.ring-trait-name')).toHaveLength(0);
			expect(traitRingWrapper.findAll('.ring-trait-inner').map((el) => el.attributes('aria-label'))).toEqual([
				'Stage d10 Boss Die',
				'Stage d10 Boss Die',
				'Stage d10 Boss Die',
			]);
			const spreadStyles = spreadTraits.map((t) => t.attributes('style') || '');
			expect(new Set(spreadStyles).size).toBe(3);
			// Clicking any spread die selects the underlying Boss Die trait (index 0)
			await spreadTraits[1].find('.ring-trait-inner').trigger('click');
			const emitted = traitRingWrapper.emitted('selectElement');
			expect(emitted).toBeTruthy();
			expect(emitted![0][0]).toEqual(['trait', 0, 0]);
			traitRingWrapper.unmount();

			// Multi-trait ring still renders all individual trait names
			const { VANGUARD_FRAME_SHOWCASE } = await import('../js/showcase-templates.ts');
			const vanguardChar = structuredClone(VANGUARD_FRAME_SHOWCASE.character);
			const vanguardWrapper = mount(TraitSetBlock, {
				props: { character: vanguardChar, traitSetID: 0, submode: 'edit', editing: [] },
			});
			expect(vanguardWrapper.findAll('.ring-trait-name').map((n) => n.text())).toEqual([
				'Agility',
				'Awareness',
				'Brawn',
				'Coordination',
				'Intellect',
				'Will',
			]);
			vanguardWrapper.unmount();

			// Ring editor no longer exposes a manual Hide Ring Labels toggle
			const { default: TraitSetEditor } = await import('../js/trait-set-editor.vue');
			const ringEditor = mount(TraitSetEditor, {
				props: { character, traitSetID: 0 },
			});
			expect(ringEditor.text()).not.toContain('Hide Ring Labels');
			ringEditor.unmount();
		});

		it('Item 4: renders leader lines for Architect and Dreamer, but none for Vanguard', async () => {
			const raw = (await import('../data/templates/Dreamer_Architect.curio.json')).default;
			const character = structuredClone(raw);

			// Architect: set 0 (has image + name) -> renders leader line
			const archWrapper = mount(TraitSetBlock, {
				props: { character, traitSetID: 0, submode: 'edit', editing: [] },
			});
			const archLeader = archWrapper.find('.portrait-leader-line');
			expect(archLeader.exists()).toBe(false);
			archWrapper.unmount();

			// Dreamer: set 3 (has image + name) -> renders leader line
			const dreamerWrapper = mount(TraitSetBlock, {
				props: { character, traitSetID: 3, submode: 'edit', editing: [] },
			});
			const dreamerLeader = dreamerWrapper.find('.portrait-leader-line');
			expect(dreamerLeader.exists()).toBe(false);
			dreamerWrapper.unmount();

			// Vanguard: set 0 (no image) -> renders no leader line
			const { VANGUARD_FRAME_SHOWCASE } = await import('../js/showcase-templates.ts');
			const vanguardChar = structuredClone(VANGUARD_FRAME_SHOWCASE.character);
			const vanguardWrapper = mount(TraitSetBlock, {
				props: { character: vanguardChar, traitSetID: 0, submode: 'edit', editing: [] },
			});
			expect(vanguardWrapper.find('.portrait-leader-line').exists()).toBe(false);
			vanguardWrapper.unmount();
		});

		it('Item 6: verifies The Dreamer & the Architect composition across all 4 sets', async () => {
			const raw = (await import('../data/templates/Dreamer_Architect.curio.json')).default;
			const character = structuredClone(raw);

			// 1. Architect (set 0)
			const archWrapper = mount(TraitSetBlock, {
				props: { character, traitSetID: 0, submode: 'play', editing: [] },
			});
			expect(archWrapper.find('.portrait-circle').exists()).toBe(true);
			expect(archWrapper.find('.portrait-leader-line').exists()).toBe(false);
			const ringTraits = archWrapper.findAll('.ring-trait');
			expect(ringTraits).toHaveLength(3);
			archWrapper.unmount();

			// 2. Architect Distinctions (set 1)
			const archDistWrapper = mount(TraitSetBlock, {
				props: { character, traitSetID: 1, submode: 'play', editing: [] },
			});
			const archList = archDistWrapper.findComponent({ name: 'TraitSetList' });
			expect(archList.exists()).toBe(true);
			const archItems = archList.findAll('.trait');
			expect(archItems).toHaveLength(3);
			for (const item of archItems) {
				expect(item.find('.pip').exists()).toBe(false);
			}
			archDistWrapper.unmount();

			// 3. Values (set 2)
			const valuesWrapper = mount(TraitSetBlock, {
				props: { character, traitSetID: 2, submode: 'play', editing: [] },
			});
			const valuesList = valuesWrapper.findComponent({ name: 'TraitSetList' });
			expect(valuesList.exists()).toBe(true);
			const valItems = valuesList.findAll('.trait');
			expect(valItems).toHaveLength(3);
			const valNames = valItems.map((v) => v.find('.trait-name').text().trim());
			expect(valNames).toEqual(['Data', 'Design', 'Service']);
			expect(valItems[0].find('.trait-description').text()).toContain('belongs to the people, not the builders');
			expect(valItems[0].find('.pip').exists()).toBe(false);
			valuesWrapper.unmount();

			// 4. Dreamer (set 3): distinctions on left, portrait on right
			const dreamerWrapper = mount(TraitSetBlock, {
				props: { character, traitSetID: 3, submode: 'play', editing: [] },
			});
			expect(dreamerWrapper.find('.trait-set').classes()).toContain('portrait-pos-right');
			expect(dreamerWrapper.find('.portrait-circle').exists()).toBe(true);
			expect(dreamerWrapper.find('.portrait-leader-line').exists()).toBe(false);
			const dreamerList = dreamerWrapper.findComponent({ name: 'TraitSetList' });
			expect(dreamerList.exists()).toBe(true);
			const dreamerItems = dreamerList.findAll('.trait');
			expect(dreamerItems).toHaveLength(3);
			const dreamerNames = dreamerItems.map((v) => v.find('.trait-name').text().trim());
			expect(dreamerNames).toEqual(['Beauty is all around us', "I'll have another slice", "Darling, let's have tea"]);
			expect(dreamerItems[0].find('.pip').exists()).toBe(false);
			expect(dreamerItems[1].find('.pip').exists()).toBe(false);
			expect(dreamerItems[2].find('.pip').exists()).toBe(false);
			dreamerWrapper.unmount();

			// 5. Dreamer in edit mode does not duplicate "+ Distinction" in ring-actions
			const dreamerEdit = mount(TraitSetBlock, {
				props: { character, traitSetID: 3, submode: 'edit', editing: [] },
			});
			expect(dreamerEdit.find('.ring-actions').exists()).toBe(false);
			dreamerEdit.unmount();
		});

		it('Item 7: prevents inherited frame stroke from corrupting diecon numerals', async () => {
			for (const size of [4, 6, 8, 10, 12, 20]) {
				const svg = characterCurioFunctions.renderDieconSVG(size, true);
				expect(svg).toContain('<text ');
				expect(svg).toContain('stroke="none"');
			}

			const raw = (await import('../data/templates/Dreamer_Architect.curio.json')).default;
			const character = structuredClone(raw);
			for (const traitSetID of [0, 3]) {
				const wrapper = mount(TraitSetBlock, {
					props: { character, traitSetID, submode: 'play', editing: [] },
				});
				const numerals = wrapper.findAll('svg.diecon text');
				expect(numerals.length).toBeGreaterThan(0);
				for (const textEl of numerals) {
					expect(textEl.attributes('stroke')).toBe('none');
				}
				wrapper.unmount();
			}
		});

		it('Orthogonal model: resolveBorder, buildPortraitFramePath, non-exclusive Style presetting, and Dice array off', () => {
			// 1. resolveBorder handles explicit none/block/line and legacy borderless/frame fallbacks
			expect(resolveBorder({ view: { border: 'none' } }).shape).toBe('none');
			expect(resolveBorder({ view: { border: { shape: 'block', corner: 'cut' } } })).toMatchObject({
				shape: 'block',
				explicit: true,
				corner: 'cut',
			});
			expect(resolveBorder({ view: { border: { shape: 'line', color: 'strong' } } })).toMatchObject({
				shape: 'line',
				explicit: true,
				color: 'strong',
			});
			expect(resolveBorder({ view: { borderless: true } }).shape).toBe('none');

			// 2. buildPortraitFramePath generates distinct geometry for circle, square, round, cut, and none
			expect(buildPortraitFramePath('none')).toBe('');
			expect(buildPortraitFramePath('circle', [0, 360])).toContain('A 49 49');
			expect(buildPortraitFramePath('circle', [45, 135]).endsWith('Z')).toBe(false);
			expect(buildPortraitFramePath('square')).toContain('L 99,99');
			expect(buildPortraitFramePath('round')).toContain('Q 99,1 99,15');
			expect(buildPortraitFramePath('cut')).toContain('L 88,1 L 99,12');

			// 3. Orthogonal Block border + Round portrait + Arc trait array coexist
			const orthoChar = {
				name: 'Ortho Test',
				traitSets: [
					{
						name: 'Boss Set',
						noun: 'Boss Die',
						rating: { type: 'Dice', value: [10, 8, 6] },
						view: {
							header: 'top',
							border: { shape: 'block', corner: 8, color: 'primary' },
							frame: {
								shape: 'round',
								array: 'arc',
								color: 'accent',
								image: { url: 'images/test.jpg', zoom: 1 },
							},
						},
						traits: [],
					},
				],
			};
			const orthoWrap = mount(TraitSetBlock, {
				props: { character: orthoChar, traitSetID: 0, submode: 'play', editing: [] },
			});
			expect(orthoWrap.find('.frame-block-svg').exists()).toBe(true);
			expect(orthoWrap.find('.portrait.portrait-shape-round').exists()).toBe(true);
			expect(orthoWrap.find('.ring-grid').exists()).toBe(true);
			expect(orthoWrap.findAll('.ring-trait')).toHaveLength(3);
			expect(orthoWrap.find('.trait-set-header-dice').exists()).toBe(false);
			orthoWrap.unmount();

			// 4. When Trait Array = none on a set-level Dice set, dice render in header (and body when header=none)
			orthoChar.traitSets[0].view.frame.array = 'none';
			const hdrDiceWrap = mount(TraitSetBlock, {
				props: { character: orthoChar, traitSetID: 0, submode: 'play', editing: [] },
			});
			expect(hdrDiceWrap.find('.portrait.portrait-shape-round').exists()).toBe(true);
			expect(hdrDiceWrap.find('.ring-grid').exists()).toBe(false);
			expect(hdrDiceWrap.findAll('.trait-set-header-dice .diecon-wrapper')).toHaveLength(3);
			hdrDiceWrap.unmount();

			orthoChar.traitSets[0].view.header = 'none';
			const bodyDiceWrap = mount(TraitSetBlock, {
				props: { character: orthoChar, traitSetID: 0, submode: 'play', editing: [] },
			});
			expect(bodyDiceWrap.findAll('.trait-set-body-dice .diecon-wrapper')).toHaveLength(3);
			bodyDiceWrap.unmount();
		});
	});
});
