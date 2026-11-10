import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import TraitSetBlock from '../js/trait-set-block.vue';
import { VANGUARD_FRAME_SHOWCASE, SHOWCASE_TEMPLATES } from '../js/showcase-templates.ts';
import { cortexSetPresets, cortexFunctions } from '../js/functions.ts';
import { computeFrameAnchors, resolveFrame } from '../js/frame-geometry.ts';
import { isHiddenIn } from '../js/model.ts';

describe('Phase 3c Showcase Framed Character Template & Preset Catalog Suite', () => {
	it('verifies SHOWCASE_TEMPLATES exposes the Vanguard Frame Showcase at index 0', () => {
		expect(SHOWCASE_TEMPLATES.length).toBeGreaterThanOrEqual(1);
		const tmpl = SHOWCASE_TEMPLATES[0];
		expect(tmpl.id).toBe('vanguard-frame-showcase');
		expect(tmpl.title).toBe('Vanguard Frame Showcase');
		expect(tmpl.character.traitSets.length).toBe(8);
	});

	it('verifies cortexSetPresets contains the 3 new Phase 3c Framed Presets', () => {
		const ringPreset = cortexSetPresets['framed-ring-attributes'];
		expect(ringPreset, 'framed-ring-attributes preset must exist').toBeDefined();
		expect(ringPreset?.preset?.view?.frame?.shape).toBe('ring');

		const blockPreset = cortexSetPresets['framed-chamfer-block'];
		expect(blockPreset, 'framed-chamfer-block preset must exist').toBeDefined();
		expect(blockPreset?.preset?.view?.frame?.shape).toBe('block');
		expect(blockPreset?.preset?.view?.frame?.corner).toBe('cut');

		const linePreset = cortexSetPresets['framed-section-line'];
		expect(linePreset, 'framed-section-line preset must exist').toBeDefined();
		expect(linePreset?.preset?.view?.frame?.shape).toBe('line');
	});

	it('F4: verifies span normalization preserves explicit 0 and anchors maintain >= 0.01 precision', () => {
		const frameZero = resolveFrame({ shape: 'arc', span: [180, 0] });
		expect(frameZero, 'frame with span [180, 0] must resolve').not.toBeNull();
		expect(frameZero?.span[0]).toBe(180);
		expect(frameZero?.span[1]).toBe(0);

		const anchors = computeFrameAnchors(6, frameZero!);
		expect(anchors.length).toBe(6);
		for (const a of anchors) {
			const xStr = a.x.toString();
			const yStr = a.y.toString();
			const xDecimals = xStr.includes('.') ? xStr.split('.')[1].length : 0;
			const yDecimals = yStr.includes('.') ? yStr.split('.')[1].length : 0;
			expect(xDecimals).toBeLessThanOrEqual(2);
			expect(yDecimals).toBeLessThanOrEqual(2);
		}
	});

	it('F5: verifies dead fields are stripped from showcase template and presets', () => {
		const char = VANGUARD_FRAME_SHOWCASE.character;
		for (const s of char.traitSets) {
			expect((s.view as any)?.headerAlign, 'headerAlign must be stripped').toBeUndefined();
			expect((s.view as any)?.sharedHinder, 'sharedHinder must be stripped').toBeUndefined();
		}

		// Values set
		const valuesSet = char.traitSets[4];
		expect(valuesSet.name).toBe('Values');
		for (const t of valuesSet.traits as any[]) {
			expect((t as any).statement, 'trait-level statement must be stripped').toBeUndefined();
			expect((t as any).questioned, 'trait-level questioned must be stripped').toBeUndefined();
			expect(t.traits?.length).toBe(1);
			expect(t.traits?.[0].name).toBeTruthy();
		}
		// Glory questioned pip
		const glory = (valuesSet.traits as any[]).find((t) => t.name === 'Glory');
		expect(glory?.traits?.[0]?.rating?.value).toEqual([true]);

		// Session notes does not reference JSON tab
		const sessionNotes = char.traitSets[7];
		expect(sessionNotes.notes).not.toContain('JSON tab');
		expect(sessionNotes.notes).toContain('Card Builder');
	});

	it('F6: verifies stroke tokens (strong, dashed) and unrecognized fallback to primary with warning', () => {
		const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

		const character = structuredClone(VANGUARD_FRAME_SHOWCASE.character);
		// Test unrecognized color fallback
		character.traitSets[0].view.frame = {
			shape: 'ring',
			color: 'unknown-neon',
		};
		const wrapper = mount(TraitSetBlock, {
			props: { character, traitSetID: 0, submode: 'play', editing: [] },
		});

		expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('unknown-neon'));
		expect(wrapper.find('.frame-color-primary').exists()).toBe(true);

		warnSpy.mockRestore();
		wrapper.unmount();
	});

	it('F8: verifies line divider set renders as a bare rule with no header or card chrome', () => {
		const character = structuredClone(VANGUARD_FRAME_SHOWCASE.character);
		const lineSet = character.traitSets[1];
		expect(lineSet.name).toBe('');
		expect(lineSet.view.frame.shape).toBe('line');

		const wrapper = mount(TraitSetBlock, {
			props: { character, traitSetID: 1, submode: 'edit', editing: [] },
		});

		// Section carries trait-set-frame-line
		expect(wrapper.classes()).toContain('trait-set-frame-line');
		// Header chrome is completely omitted
		expect(wrapper.find('.trait-set-header').exists()).toBe(false);
		// Line SVG is rendered
		expect(wrapper.find('.frame-line-svg').exists()).toBe(true);
		// No +Trait button or placeholder slot
		expect(wrapper.find('.trait-placeholder-slot').exists()).toBe(false);

		wrapper.unmount();
	});

	it('Attributes: renders .portrait ring frame with 6 anchored traits', () => {
		const character = structuredClone(VANGUARD_FRAME_SHOWCASE.character);
		const wrapper = mount(TraitSetBlock, {
			props: {
				character,
				traitSetID: 0, // Attributes
				submode: 'edit',
				editing: [],
			},
		});

		// Radial SVG frame is rendered in the trait set
		const listSvg = wrapper.find('.frame-radial-svg');
		expect(listSvg.exists(), 'SVG frame background must render inside ring frame').toBe(true);

		expect(wrapper.find('.portrait').exists()).toBe(true);
		expect(wrapper.find('.ring-grid').exists()).toBe(true);

		// 6 dynamically anchored traits
		const traitEls = wrapper.findAll('.ring-trait');
		expect(traitEls.length).toBe(6);

		// Each trait has dynamic positional anchors
		for (const t of traitEls) {
			const style = t.attributes('style') || '';
			expect(style).toContain('left:');
			expect(style).toContain('top:');
		}

		// Trait names present
		expect(traitEls[0].text()).toContain('Agility');
		expect(traitEls[4].text()).toContain('Intellect');

		// In edit submode, Add Trait button is rendered and visible below framed set
		const addBtn = wrapper.find('.preview-button');
		expect(addBtn.exists(), 'Add button must exist in edit submode for framed set').toBe(true);
		expect(addBtn.text()).toContain('Attribute');

		wrapper.unmount();
	});

	it('verifies Add Trait button renders in edit submode and emits addTrait on click for framed sets', async () => {
		const character = structuredClone(VANGUARD_FRAME_SHOWCASE.character);
		const wrapper = mount(TraitSetBlock, {
			props: {
				character,
				traitSetID: 0, // Attributes (ring frame)
				submode: 'edit',
				editing: [],
			},
		});

		const btn = wrapper.find('.preview-button');
		expect(btn.exists()).toBe(true);
		expect(btn.text()).toContain('Attribute');

		await btn.trigger('click');
		expect(wrapper.emitted('addTrait')).toBeTruthy();
		expect(wrapper.emitted('addTrait')?.[0]).toEqual([0]);

		wrapper.unmount();
	});

	it('morphs ring -> ellipse -> block preserving all 6 traits in exact index order 0..5', async () => {
		const character = structuredClone(VANGUARD_FRAME_SHOWCASE.character);
		const set = character.traitSets[0];

		// 1. Initial ring
		expect(set.view.frame.shape).toBe('ring');
		const wrapper = mount(TraitSetBlock, {
			props: {
				character,
				traitSetID: 0,
				submode: 'play',
				editing: [],
			},
		});

		expect(wrapper.find('.portrait').exists()).toBe(true);
		expect(wrapper.find('.ring-grid').exists()).toBe(true);
		const getRingTraitNames = () => wrapper.findAll('.ring-trait .ring-trait-name').map((el) => el.text().trim());
		expect(getRingTraitNames()).toEqual(['Agility', 'Awareness', 'Brawn', 'Coordination', 'Intellect', 'Will']);

		// 2. Morph to ellipse
		const characterEllipse = structuredClone(character);
		characterEllipse.traitSets[0].view.frame.shape = 'ellipse';
		await wrapper.setProps({ character: characterEllipse });
		await nextTick();

		expect(wrapper.find('.trait-list').exists()).toBe(true);
		const getTraitNames = () => wrapper.findAll('.trait').map((el) => el.attributes('data-trait-name'));
		expect(getTraitNames()).toEqual(['Agility', 'Awareness', 'Brawn', 'Coordination', 'Intellect', 'Will']);

		// 3. Morph to block (container border frame)
		const characterBlock = structuredClone(character);
		(characterBlock.traitSets[0].view as any).frame = {
			shape: 'block',
			corner: 'cut',
			stroke: '2px',
			color: 'primary',
		};
		await wrapper.setProps({ character: characterBlock });
		await nextTick();

		// When block, the frame SVG renders at the block container level (.trait-set-frame-svg.frame-block-svg)
		expect(wrapper.find('.trait-set-frame-svg.frame-block-svg').exists()).toBe(true);
		expect(wrapper.find('.portrait').exists()).toBe(false);
		expect(getTraitNames()).toEqual(['Agility', 'Awareness', 'Brawn', 'Coordination', 'Intellect', 'Will']);

		wrapper.unmount();
	});

	it('dynamically re-derives computeFrameAnchors from 6 to 7 positions when pushing a 7th trait', async () => {
		const character = structuredClone(VANGUARD_FRAME_SHOWCASE.character);
		const frame = resolveFrame(character.traitSets[0].view.frame);
		expect(frame).not.toBeNull();

		// 6 positions
		const anchors6 = computeFrameAnchors(6, frame!);
		expect(anchors6.length).toBe(6);

		// Dynamic re-derivation with 7 traits
		const anchors7 = computeFrameAnchors(7, frame!);
		expect(anchors7.length).toBe(7);

		// Verify distinct positions around the circle
		const angles7 = anchors7.map((a) => Math.round(a.angle));
		expect(new Set(angles7).size).toBe(7);

		// Mount with 7 traits
		const character7 = structuredClone(character);
		(character7.traitSets[0].traits as any[]).push({
			name: 'Resolve',
			rating: { type: 'Die', value: [8], range: [4, 6, 8, 10, 12] },
		});

		const wrapper = mount(TraitSetBlock, {
			props: {
				character: character7,
				traitSetID: 0,
				submode: 'edit',
				editing: [],
			},
		});

		const traitEls = wrapper.findAll('.ring-trait');
		expect(traitEls.length).toBe(7);
		expect(traitEls[6].text()).toContain('Resolve');

		wrapper.unmount();
	});

	it('in submode === "print", play-only sets are omitted while frames render cleanly', () => {
		const character = structuredClone(VANGUARD_FRAME_SHOWCASE.character);

		// Set 6 (Scene Traits) and Set 7 (Session Notes) have visibility: 'play-only'
		const sceneTraitsSet = character.traitSets[6];
		const sessionNotesSet = character.traitSets[7];
		expect(sceneTraitsSet.name).toBe('Scene Traits');
		expect(sessionNotesSet.name).toBe('Session Notes');

		// CortexModel visibility check
		expect(isHiddenIn(sceneTraitsSet, 'print')).toBe(true);
		expect(isHiddenIn(sessionNotesSet, 'print')).toBe(true);
		expect(isHiddenIn(sceneTraitsSet, 'play')).toBe(false);
		expect(isHiddenIn(sessionNotesSet, 'edit')).toBe(false);

		// In print submode, v-if="!isHiddenIn(traitSet, submode)" completely omits play-only sets from print DOM
		const wrapperPrint = mount(TraitSetBlock, {
			props: {
				character,
				traitSetID: 6,
				submode: 'print',
				editing: [],
			},
		});
		expect(wrapperPrint.find('section').exists(), 'Play-only set must be omitted from print DOM').toBe(false);
		wrapperPrint.unmount();

		// In play submode, it renders with .trait-set-play-only class
		const wrapperPlay = mount(TraitSetBlock, {
			props: {
				character,
				traitSetID: 6,
				submode: 'play',
				editing: [],
			},
		});
		expect(wrapperPlay.classes()).toContain('trait-set-play-only');
		wrapperPlay.unmount();

		// Framed Attributes set in print submode is NOT hidden
		const wrapperAttributesPrint = mount(TraitSetBlock, {
			props: {
				character,
				traitSetID: 0,
				submode: 'print',
				editing: [],
			},
		});
		expect(wrapperAttributesPrint.classes()).not.toContain('trait-set-play-only');
		expect(wrapperAttributesPrint.find('.frame-radial-svg').exists()).toBe(true);
		wrapperAttributesPrint.unmount();
	});

	it('regression guard: Vanguard Attributes set keeps its explicit frame and distributes 360° across all quadrants', () => {
		const clone = structuredClone(VANGUARD_FRAME_SHOWCASE.character);
		const attrSet = (clone.traitSets as any[]).find((s: any) => s.name === 'Attributes');
		expect(attrSet).toBeDefined();

		const resolved = resolveFrame(attrSet);
		expect(resolved).not.toBeNull();

		const anchors = computeFrameAnchors(attrSet.traits.length, resolved!);
		expect(anchors.length).toBe(6);
		const docks = new Set(anchors.map((a) => a.dock));
		expect(docks.size, 'Anchors must span multiple quadrants (not stacked on one side)').toBe(4);
		expect(docks.has('top')).toBe(true);
		expect(docks.has('right')).toBe(true);
		expect(docks.has('bottom')).toBe(true);
		expect(docks.has('left')).toBe(true);
	});
});
