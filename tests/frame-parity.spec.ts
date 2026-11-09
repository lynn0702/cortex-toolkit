import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import TraitSetBlock from '../js/trait-set-block.vue';
import TraitSetFrame from '../js/trait-set-frame.vue';
import { resolveFrame, computeFrameAnchors, type FrameConfig } from '../js/frame-geometry.ts';

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

			// Check framed suppression classes (disables legacy CSS border)
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

		it('verifies frame anchors distribute equidistantly across 360° for closed ring', () => {
			const frameConfig: FrameConfig = {
				shape: 'ring',
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

		it('resolves frame defaults: { shape: arc } resolves to color primary, stroke 2px, no dash, box false', () => {
			const res = resolveFrame({ shape: 'arc' });
			expect(res).toEqual({
				shape: 'arc',
				span: [-120, 120],
				corner: 8,
				stroke: '2px',
				color: 'primary',
				box: false,
				path: null,
				ringConfig: null,
			});
			expect('dash' in res!).toBe(false);
		});
	});
});
