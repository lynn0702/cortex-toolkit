import { describe, it, expect } from 'vitest';
import { nextTick, reactive } from 'vue';
import { flushPromises, mount } from '@vue/test-utils';
import axe from 'axe-core';
import CharacterView from '../js/character.vue';
import NameEditor from '../js/name-editor.vue';
import TraitSetBlock from '../js/trait-set-block.vue';
import TraitSetEditor from '../js/trait-set-editor.vue';
import TraitEditor from '../js/trait-editor.vue';
import JsonEditor from '../js/json-editor.vue';
import PresetGalleryCard from '../js/preset-gallery-card.vue';
import StudioPanel from '../js/studio-panel.vue';
import App from '../js/app.vue';
import { characterCurioFunctions, characterCurioSetPresets } from '../js/functions.ts';
import {
	getRating,
	getView,
	hasPlotPoints,
	isNameSet,
	resolvePlotPoints,
	resolveRange,
	type Character,
} from '../js/model.ts';

function freshBlankCharacter(id = 'jimmy-1'): Character {
	const ch = structuredClone(characterCurioFunctions.defaultCharacter) as unknown as Character;
	ch.id = id;
	characterCurioFunctions.ensureTraitSetIds(ch);
	characterCurioFunctions.assignLids(ch);
	return ch;
}

describe('Organic New Sheet ("Jimmy the Snitch d8")', () => {
	it('starts minimal with Name + d8 rating, compact header, inline name input, and zero starter sets to delete', async () => {
		const ch = freshBlankCharacter();
		expect(ch.traitSets).toHaveLength(1);
		expect(isNameSet(ch.traitSets[0])).toBe(true);
		expect(getRating(ch.traitSets[0])).toEqual({
			type: 'Die',
			value: [8],
			range: [],
		});
		expect(resolveRange(ch.traitSets[0])).toEqual([4, 6, 8, 10, 12]);
		expect(hasPlotPoints(ch)).toBe(false);
		expect(resolvePlotPoints(ch)).toBe(0);

		const wrapper = mount(CharacterView, {
			attachTo: document.body,
			props: {
				character: ch,
				submode: 'edit',
				editing: [],
			},
		});

		expect(wrapper.find('.page-header-inner.is-compact-header').exists()).toBe(true);
		expect(wrapper.find('.sheet-header-desc-box').exists()).toBe(false);
		expect(wrapper.find('.sheet-meta-pronoun-cell').exists()).toBe(false);

		const nameInput = wrapper.find('input.sheet-name-inline-input');
		expect(nameInput.exists()).toBe(true);
		await nameInput.setValue('Jimmy the Snitch');
		expect(ch.name).toBe('Jimmy the Snitch');

		// Compact single-die trigger (not a permanent 5-die array) opens InlineRatingBar on tap
		expect(wrapper.findAll('.sheet-name-die-chip')).toHaveLength(0);
		const ratingTrigger = wrapper.find('button.sheet-name-rating-trigger');
		expect(ratingTrigger.exists()).toBe(true);
		expect(wrapper.find('.inline-rating-bar').exists()).toBe(false);

		await ratingTrigger.trigger('click');
		expect(wrapper.find('.inline-rating-bar').exists()).toBe(true);

		const inlineAxe = await axe.run(wrapper.element);
		expect(inlineAxe.violations).toHaveLength(0);

		// Switch rating to d10 inline, then None, then Pip, then Counter, then back to d8
		await wrapper.find('.inline-rating-bar button[aria-label="Set d10"]').trigger('click');
		expect(getRating(ch.traitSets[0])?.value).toEqual([10]);

		const modeButtons = () => wrapper.findAll('.inline-rating-bar .inline-rating-mode-btn');
		await modeButtons()
			.find((b) => b.text() === 'None')!
			.trigger('click');
		expect(getRating(ch.traitSets[0])).toBeUndefined();

		await modeButtons()
			.find((b) => b.text() === 'Pip')!
			.trigger('click');
		expect(getRating(ch.traitSets[0])?.type).toBe('Pip');
		expect(getRating(ch.traitSets[0])?.value).toEqual([false, false, false]);

		await modeButtons()
			.find((b) => b.text() === 'Counter')!
			.trigger('click');
		expect(getRating(ch.traitSets[0])?.type).toBe('Counter');

		await modeButtons()
			.find((b) => b.text() === 'Die')!
			.trigger('click');
		await wrapper.find('.inline-rating-bar button[aria-label="Set d8"]').trigger('click');
		expect(getRating(ch.traitSets[0])?.value).toEqual([8]);

		await wrapper.find('.inline-rating-bar button[aria-label="Close rating picker"]').trigger('click');
		expect(wrapper.find('.inline-rating-bar').exists()).toBe(false);

		const editAxe = await axe.run(wrapper.element);
		expect(editAxe.violations).toHaveLength(0);
		wrapper.unmount();
	});

	it('stages sheet d8 rating in Play mode and syncs Sheet Rating in NameEditor', async () => {
		const ch = freshBlankCharacter();
		ch.name = 'Jimmy the Snitch';

		const playWrapper = mount(CharacterView, {
			attachTo: document.body,
			props: {
				character: ch,
				submode: 'play',
				editing: [],
				dicePool: { items: [{ size: 8, qty: 1, source: 'Jimmy the Snitch' }] },
			},
		});

		const stageBadge = playWrapper.find('[aria-label="Stage d8 Jimmy the Snitch"]');
		expect(stageBadge.exists()).toBe(true);
		await stageBadge.trigger('click');
		expect(playWrapper.emitted('addDieToRoller')?.[0]?.[0]).toEqual({
			size: 8,
			qty: 1,
			source: 'Jimmy the Snitch',
			hitches: 1,
			ppDelta: 0,
		});

		const playAxe = await axe.run(playWrapper.element);
		expect(playAxe.violations).toHaveLength(0);
		playWrapper.unmount();

		const nameEditor = mount(NameEditor, {
			props: {
				character: ch,
				open: true,
				tab: 'sheet',
			},
		});
		const ratingButtons = nameEditor.findAll('.editor-die-chip');
		expect(ratingButtons).toHaveLength(6); // None + d4..d12
		expect(ratingButtons[3].classes()).toContain('active'); // d8
		await ratingButtons[0].trigger('click'); // None
		expect(getRating(ch.traitSets[0])).toBeUndefined();
		await ratingButtons[2].trigger('click'); // d6
		expect(getRating(ch.traitSets[0])?.value).toEqual([6]);
		nameEditor.unmount();
	});

	it('grows organically via Name + Trait / Name Parts, per-trait + Part, + Set, and + Pillar, and deletes empty sets in 1 click', async () => {
		const ch = freshBlankCharacter();
		ch.name = 'Jimmy the Snitch';

		const wrapper = mount(CharacterView, {
			attachTo: document.body,
			props: {
				character: ch,
				submode: 'edit',
				editing: [],
			},
		});

		const builderButtons = wrapper.findAll('.sheet-organic-builder .btn-sheet-add');
		expect(builderButtons.map((b) => b.text().trim())).toEqual(['Set', 'Presets', 'Pillar']);

		// 1. + Trait inside Name adds directly inside Name without creating a separate Traits set
		const nameTraitBtn = wrapper.find('.sheet-name-organic-actions .preview-button');
		await nameTraitBtn.trigger('click');
		expect(ch.traitSets).toHaveLength(1);
		expect(ch.traitSets[0].traits.map((t) => t.name)).toEqual(['New Trait']);
		expect(getRating(ch.traitSets[0].traits[0])?.type).toBe('Die');
		expect(getRating(ch.traitSets[0].traits[0])?.value).toEqual([6]);
		expect(wrapper.find('.sheet-header-custom-traits').exists()).toBe(true);
		expect(wrapper.find('.sheet-header-custom-traits input.trait-name-inline-input').exists()).toBe(true);
		expect(wrapper.emitted('selectElement')).toBeUndefined();
		expect(wrapper.emitted('closeDrawer')?.length).toBeGreaterThanOrEqual(1);

		// Per-trait + Part appears directly under the active trait with 5 quick parts + More
		const perTraitPartBtn = wrapper.find('.trait-active-part-bar .btn-trait-part-toggle');
		expect(perTraitPartBtn.exists()).toBe(true);
		await perTraitPartBtn.trigger('click');
		const traitPartChips = wrapper.findAll('[aria-label="Trait parts"] .organic-part-chip');
		expect(traitPartChips.map((c) => c.text().trim())).toEqual([
			'Description',
			'Subtrait',
			'SFX',
			'Track',
			'Badge',
			'More',
		]);
		await traitPartChips.find((c) => c.text().includes('Description'))!.trigger('click');
		const descInput = wrapper.find('input.trait-desc-inline-input');
		expect(descInput.exists()).toBe(true);
		await descInput.setValue('Trusted informant');
		expect(ch.traitSets[0].traits[0].description).toBe('Trusted informant');
		await traitPartChips.find((c) => c.text().includes('Subtrait'))!.trigger('click');
		expect(ch.traitSets[0].traits[0].traits).toHaveLength(1);
		expect(wrapper.find('input.subtrait-name-inline-input').exists()).toBe(true);

		// 2. + Part inside Name card opens Name Parts (PP, Notes, Description, Portrait, Pronouns...)
		const namePartBtn = wrapper.find('.sheet-name-organic-actions .preview-button-secondary');
		await namePartBtn.trigger('click');
		expect(wrapper.find('.name-inline-part-drawer').exists()).toBe(true);
		const namePartChips = wrapper.findAll('[aria-label="Name parts"] .organic-part-chip');
		expect(namePartChips.map((c) => c.text().trim())).toEqual([
			'Rating',
			'PP',
			'Notes',
			'Description',
			'Portrait',
			'Pronouns',
			'Nickname',
			'Game',
			'Player',
		]);
		const ppChip = namePartChips.find((c) => c.text().trim() === 'PP')!;
		expect(ppChip.classes()).not.toContain('active');
		await ppChip.trigger('click');
		expect(hasPlotPoints(ch)).toBe(true);
		expect(ch.plotPoints).toBe(1);
		await ppChip.trigger('click');
		expect(hasPlotPoints(ch)).toBe(false);
		expect(ch.plotPoints).toBeUndefined();
		const pronounsChip = namePartChips.find((c) => c.text().includes('Pronouns'))!;
		expect(pronounsChip.classes()).not.toContain('active');
		await pronounsChip.trigger('click');
		const pronounsTrait = characterCurioFunctions.getNameTrait(ch, 'pronouns');
		expect(getView(pronounsTrait)?.visibility).toBeUndefined();
		expect(wrapper.find('.sheet-meta-pronoun-cell input.sheet-part-inline-input').exists()).toBe(true);

		// 3. + Set creates a unique empty set calmly inline on canvas; empty set deletes in 1 click without confirm modal
		await builderButtons[0].trigger('click');
		expect(ch.traitSets).toHaveLength(2);
		expect(ch.traitSets[1].name).toBe('New Set');
		expect(ch.traitSets[1].traits).toHaveLength(0);
		expect(getView(ch.traitSets[1])?.header).toBe('top');
		expect(getView(ch.traitSets[1])?.ratingDisplay).toBeUndefined();
		expect(wrapper.emitted('selectElement')).toBeUndefined();
		expect(wrapper.find('input.trait-set-name-inline-input').exists()).toBe(true);
		expect(wrapper.find('[data-set-index="1"] .trait-set-header .set-header-settings-btn').exists()).toBe(true);
		expect(wrapper.find('[data-set-index="1"] .trait-set-header button[aria-label="Delete set"]').exists()).toBe(true);

		// Add two traits into the standalone set and verify Dice pool & Counter interactions
		const setAddTraitBtn = wrapper.find('[data-set-index="1"] .set-organic-actions .preview-button');
		await setAddTraitBtn.trigger('click');
		await setAddTraitBtn.trigger('click');
		expect(ch.traitSets[1].traits.map((t) => t.name)).toEqual(['New Trait', 'New Trait 2']);
		expect(wrapper.find('[data-set-index="1"] .trait-set-header button[aria-label="Delete set"]').exists()).toBe(false);
		expect(wrapper.find('[data-set-index="1"] .preview-button-icon').exists()).toBe(false);
		// Single active die rendered per trait on canvas, NOT a 5-die full array
		expect(wrapper.find('[data-set-index="1"] .trait').findAll('.single-die-value [role="button"]')).toHaveLength(1);

		await wrapper
			.findAll('[data-set-index="1"] .trait .inline-rating-bar .inline-rating-mode-btn')
			.find((b) => b.text() === 'Dice')!
			.trigger('click');
		await wrapper.find('.inline-pool-die-chip').trigger('click');
		await wrapper.find('.inline-pool-die-chip').trigger('click');
		await wrapper.find('.inline-dice-palette button[aria-label="Add d10"]').trigger('click');
		await wrapper.find('.inline-dice-palette button[aria-label="Add d10"]').trigger('click');
		expect(getRating(ch.traitSets[1].traits[1])?.value).toEqual([10, 10]);
		await wrapper.find('.trait .inline-rating-bar button[aria-label="Close rating picker"]').trigger('click');
		expect(wrapper.find('.trait .inline-rating-bar').exists()).toBe(false);

		const secondSetTraits = wrapper.findAll('[data-set-index="1"] .trait');
		const multiDieBadges = secondSetTraits[1].findAll('.multidie-badge-wrap > span[role="button"]');
		expect(multiDieBadges).toHaveLength(2);
		await multiDieBadges[0].trigger('click');
		expect(wrapper.find('.trait .inline-rating-bar').exists()).toBe(true);
		await wrapper.find('.inline-pool-die-chip[aria-label="Remove d10"]').trigger('click');
		expect(getRating(ch.traitSets[1].traits[1])?.value).toEqual([10]);
		await wrapper.find('.inline-dice-palette button[aria-label="Add d8"]').trigger('click');
		expect(getRating(ch.traitSets[1].traits[1])?.value).toEqual([10, 8]);

		await wrapper
			.findAll('.trait .inline-rating-bar .inline-rating-mode-btn')
			.find((b) => b.text() === 'Counter')!
			.trigger('click');
		await wrapper.find('.trait .inline-rating-bar button[aria-label="Close rating picker"]').trigger('click');
		await wrapper.find('[data-set-index="1"] .counter-value button[aria-label*="Increase"]').trigger('click');
		expect(getRating(ch.traitSets[1].traits[1])?.value).toEqual([1]);

		// Add SFX on the active trait via per-trait + Part
		await wrapper.find('[data-set-index="1"] .trait .single-die-value [role="button"]').trigger('click');
		await wrapper.find('[data-set-index="1"] .trait-active-part-bar .btn-trait-part-toggle').trigger('click');
		const sfxChip = wrapper
			.findAll('[data-set-index="1"] [aria-label="Trait parts"] .organic-part-chip')
			.find((c) => c.text().includes('SFX'))!;
		await sfxChip.trigger('click');
		expect(ch.traitSets[1].traits[0].traits?.length).toBeGreaterThan(0);

		// Empty set (create a 3rd set) deletes in 1 click without confirm modal
		await builderButtons[0].trigger('click');
		expect(ch.traitSets).toHaveLength(3);
		const emptySetEditor = mount(TraitSetEditor, {
			props: {
				character: ch,
				traitSetID: 2,
				open: true,
			},
		});
		await emptySetEditor.find('button.editor-delete').trigger('click');
		expect(emptySetEditor.emitted('removeTraitSet')?.[0]).toEqual([2]);
		emptySetEditor.unmount();

		// Non-empty set (index 1) still prompts confirmation before deletion
		const populatedSetEditor = mount(TraitSetEditor, {
			props: {
				character: ch,
				traitSetID: 1,
				open: true,
			},
		});
		await populatedSetEditor.find('button.editor-delete').trigger('click');
		expect(populatedSetEditor.emitted('removeTraitSet')).toBeUndefined();
		populatedSetEditor.unmount();

		// 4. Lossless layered round-trip (custom trait inside Name survives cleanly!)
		const layered = characterCurioFunctions.toLayeredEntity(ch);
		const rematerialized = characterCurioFunctions.materializeCharacter(layered, null);
		expect(rematerialized.name).toBe('Jimmy the Snitch');
		const rematNameSet = (rematerialized.traitSets ?? []).find((s: any) => isNameSet(s));
		expect(getRating(rematNameSet)).toEqual({
			type: 'Die',
			value: [8],
			range: [],
		});
		expect((rematNameSet?.traits ?? []).some((t: any) => t.name === 'New Trait')).toBe(true);
		const rematTraitsSet = (rematerialized.traitSets ?? []).find((s: any) => s.name === 'New Set');
		expect((rematTraitsSet?.traits ?? []).map((t: any) => t.name)).toEqual(['New Trait', 'New Trait 2']);

		wrapper.unmount();
	});

	it('defaults unconfigured sets to Single Die display and treats OUT as a range step without extra badge in single-die mode', async () => {
		const ch = reactive(freshBlankCharacter('out-step-test'));
		ch.traitSets.push({
			id: 'traits',
			name: 'Traits',
			noun: 'Trait',
			plural: 'Traits',
			tags: [],
			// Deliberately omit view.ratingDisplay to test default behavior
			view: { outIndicator: true, style: { header: 'default', body: 'default' } },
			traits: [
				{
					name: 'New Trait 2',
					description: '',
					tags: [],
					traits: [],
					rating: { type: 'Die', value: [6], range: [4, 6, 8, 10, 12] },
				},
			],
		} as any);

		const wrapper = mount(CharacterView, {
			attachTo: document.body,
			props: {
				character: ch,
				submode: 'edit',
				editing: [],
			},
		});

		const traitValue = wrapper.find('.trait-set[data-set-index="1"] .single-die-value');
		expect(traitValue.exists()).toBe(true);
		// Single die by default (1 die glyph, not 5) and NO extra OUT badge alongside d6
		expect(traitValue.findAll('.diecon')).toHaveLength(1);
		expect(traitValue.find('.out-badge').exists()).toBe(false);

		// Open inline rating bar on canvas: OUT is offered at the end of the die row
		await traitValue.find('[role="button"]').trigger('click');
		const outInlineBtn = wrapper.find('.inline-rating-bar .inline-rating-out-btn');
		expect(outInlineBtn.exists()).toBe(true);
		await outInlineBtn.trigger('click');

		// Once stepped to OUT, OUT replaces the die in single-die mode (0 die glyphs, 1 active OUT badge)
		expect((ch.traitSets[1].traits![0] as any).isOut).toBe(true);
		expect(traitValue.findAll('.diecon')).toHaveLength(0);
		expect(traitValue.findAll('.out-badge.active')).toHaveLength(1);

		// TraitEditor also shows OUT in its Die row when inherited from set outIndicator
		const traitEditor = mount(TraitEditor, {
			attachTo: document.body,
			props: {
				character: ch,
				traitSetID: 1,
				traitID: 0,
				open: true,
				submode: 'edit',
			},
		});
		expect(traitEditor.find('.editor-rating-chips .rating-scale-chip-out.active').exists()).toBe(true);
		traitEditor.unmount();

		// Switching to Play mode and clicking the active OUT badge opens inspector rather than staging a phantom d14
		await wrapper.setProps({ submode: 'play' });
		await wrapper.find('.trait-set[data-set-index="1"] .single-die-value .out-badge.active').trigger('click');
		expect(wrapper.emitted('addDieToRoller')).toBeUndefined();
		expect(wrapper.emitted('selectElement')?.at(-1)).toEqual([['trait', 1, 0]]);

		// TraitSetEditor persists explicit 'track' when Full Track is chosen
		const setEditor = mount(TraitSetEditor, {
			attachTo: document.body,
			props: {
				character: ch,
				traitSetID: 1,
				open: true,
			},
		});
		const fullTrackBtn = setEditor.findAll('.editor-group-btn').find((b) => b.text().trim() === 'Full Track')!;
		await fullTrackBtn.trigger('click');
		expect(getView(ch.traitSets[1])?.ratingDisplay).toBe('track');
		setEditor.unmount();

		wrapper.unmount();
	});

	it('keeps organic single-column sheets in one unified Play column while surfacing Pillar in TraitSetEditor Content', async () => {
		const ch = reactive(freshBlankCharacter('unified-play-test'));
		ch.name = 'Jimmy the Snitch';
		ch.traitSets.push(
			{
				id: 'traits',
				name: 'Traits',
				noun: 'Trait',
				plural: 'Traits',
				tags: [],
				view: { ratingDisplay: 'rating', style: { header: 'default', body: 'default' } },
				traits: [{ name: 'Streetwise', description: '', tags: [], traits: [], rating: { type: 'Die', value: [8] } }],
			} as any,
			{
				id: 'new-set',
				name: 'New Set',
				noun: 'Trait',
				plural: 'Traits',
				tags: [],
				view: { ratingDisplay: 'rating', style: { header: 'default', body: 'default' } },
				traits: [],
			} as any,
		);

		const wrapper = mount(CharacterView, {
			attachTo: document.body,
			props: {
				character: ch,
				submode: 'play',
				editing: [],
				isDesktopPillars: true,
			},
		});

		// Unified single-column Play view: Name, Traits, and New Set stay together in 1 column with no IDENTITY / PLUS split
		const cols = wrapper.findAll('.mobile-pillar-column');
		expect(cols).toHaveLength(1);
		expect(cols[0].attributes('data-pillar-key')).toBe('sheet');
		expect(wrapper.find('.mobile-pillar-track.is-single-pillar').exists()).toBe(true);
		expect(wrapper.find('.jump-pillar-tag').exists()).toBe(false);
		expect(cols[0].findAll('.trait-set')).toHaveLength(3);

		const playAxe = await axe.run(wrapper.element);
		expect(playAxe.violations).toHaveLength(0);

		// TraitSetEditor surfaces Pillar in top Content group with Auto default
		const setEditor = mount(TraitSetEditor, {
			attachTo: document.body,
			props: {
				character: ch,
				traitSetID: 1,
				open: true,
			},
		});
		const contentGroup = setEditor.find('details.editor-group');
		expect(contentGroup.find('.editor-group-title').text().trim()).toBe('Content');
		const pillarSelect = contentGroup.find('select[aria-label="Pillar"]');
		expect(pillarSelect.exists()).toBe(true);
		expect((pillarSelect.element as HTMLSelectElement).value).toBe('');

		// Assigning an explicit pillar opts the sheet into multi-pillar Play columns
		await pillarSelect.setValue('plus');
		expect(getView(ch.traitSets[1])?.pillar).toBe('plus');
		expect(wrapper.findAll('.mobile-pillar-column').length).toBeGreaterThan(1);

		setEditor.unmount();
		wrapper.unmount();
	});

	it('defaults Rating Dice to Pool, forces type Dice when Pool is enabled, and clears child overrides when set Rating switches to Pip', async () => {
		const ch = reactive(freshBlankCharacter('dice-pool-invariants'));
		ch.traitSets.push({
			id: 'traits',
			name: 'Traits',
			noun: 'Trait',
			plural: 'Traits',
			tags: [],
			view: { ratingDisplay: 'rating', style: { header: 'default', body: 'default' } },
			traits: [
				{
					name: 'New Trait',
					description: '',
					tags: [],
					traits: [],
					rating: { type: 'Die', value: [8] },
				},
			],
		} as any);

		const wrapper = mount(CharacterView, {
			attachTo: document.body,
			props: {
				character: ch,
				submode: 'edit',
				editing: [],
			},
		});

		// 1. Canvas InlineRatingBar: switching to Dice sets pool = true; switching back to Die deletes pool
		await wrapper.find('.trait-set[data-set-index="1"] .single-die-value [role="button"]').trigger('click');
		const diceModeBtn = wrapper
			.findAll('.inline-rating-bar .inline-rating-mode-btn')
			.find((b) => b.text().trim() === 'Dice')!;
		await diceModeBtn.trigger('click');
		expect(ch.traitSets[1].traits![0].rating?.type).toBe('Dice');
		expect((ch.traitSets[1].traits![0] as any).pool).toBe(true);
		expect(
			wrapper
				.findAll('.inline-dice-option-chip')
				.find((b) => b.text().trim() === 'Pool')!
				.classes(),
		).toContain('active');

		const dieModeBtn = wrapper
			.findAll('.inline-rating-bar .inline-rating-mode-btn')
			.find((b) => b.text().trim() === 'Die')!;
		await dieModeBtn.trigger('click');
		expect(ch.traitSets[1].traits![0].rating?.type).toBe('Die');
		expect((ch.traitSets[1].traits![0] as any).pool).toBeUndefined();

		// 2. TraitEditor: enabling Pool on a Die trait forces type: 'Dice'
		const traitEditor = mount(TraitEditor, {
			attachTo: document.body,
			props: {
				character: ch,
				traitSetID: 1,
				traitID: 0,
				open: true,
				submode: 'edit',
			},
		});
		const traitPoolCheckbox = traitEditor.find('input[type="checkbox"][id$="-pool"]');
		await traitPoolCheckbox.setValue(true);
		expect((ch.traitSets[1].traits![0] as any).pool).toBe(true);
		expect(ch.traitSets[1].traits![0].rating?.type).toBe('Dice');
		traitEditor.unmount();

		// 3. TraitSetEditor: connects Range & Rating Display under Rating for Die/Dice,
		//    hides Range & Rating Display for Pip and Counter (including child-inferred Pip),
		//    renders Pip count stepper inline inside .pip-editor-row, and checking Pool forces type: 'Dice'
		const setEditor = mount(TraitSetEditor, {
			attachTo: document.body,
			props: {
				character: ch,
				traitSetID: 1,
				open: true,
			},
		});
		expect(setEditor.find('.rating-connected-group').exists()).toBe(true);
		expect(setEditor.find('[role="group"][aria-label="Range"]').exists()).toBe(true);

		const pipTypeBtn = setEditor.findAll('.editor-group-btn').find((b) => b.text().trim() === 'Pip')!;
		await pipTypeBtn.trigger('click');
		const proceedBtn = setEditor.find('.btn-warning-confirm');
		if (proceedBtn.exists()) {
			await proceedBtn.trigger('click');
		}
		expect(ch.traitSets[1].rating?.type).toBe('Pip');
		expect(ch.traitSets[1].traits![0].rating).toEqual({ value: [false] });
		expect(setEditor.find('.rating-connected-group').exists()).toBe(false);
		expect(setEditor.find('[role="group"][aria-label="Range"]').exists()).toBe(false);
		expect(setEditor.find('[role="group"][aria-label="Rating Display"]').exists()).toBe(false);
		expect(setEditor.find('.pip-editor-row .pip-editor-bubbles').exists()).toBe(true);
		expect(setEditor.find('.pip-editor-row .pip-count-stepper').exists()).toBe(true);
		expect(wrapper.find('.trait-set[data-set-index="1"] .pip-value').exists()).toBe(true);
		expect(wrapper.findAll('.trait-set[data-set-index="1"] .pip-value .pip-bubble')).toHaveLength(1);

		const moreBubblesBtn = setEditor.find('.pip-editor-row .pip-count-stepper button[aria-label="More bubbles"]');
		expect(moreBubblesBtn.exists()).toBe(true);
		await moreBubblesBtn.trigger('click');
		expect(wrapper.findAll('.trait-set[data-set-index="1"] .pip-value .pip-bubble')).toHaveLength(2);

		// Switching to Counter also hides Range and Rating Display
		const counterTypeBtn = setEditor.findAll('.editor-group-btn').find((b) => b.text().trim() === 'Counter')!;
		await counterTypeBtn.trigger('click');
		const proceedCounterBtn = setEditor.find('.btn-warning-confirm');
		if (proceedCounterBtn.exists()) {
			await proceedCounterBtn.trigger('click');
		}
		expect(ch.traitSets[1].rating?.type).toBe('Counter');
		expect(setEditor.find('[role="group"][aria-label="Range"]').exists()).toBe(false);
		expect(setEditor.find('[role="group"][aria-label="Rating Display"]').exists()).toBe(false);

		const setPoolCheckbox = setEditor.find('input[type="checkbox"][id$="-pool"]');
		await setPoolCheckbox.setValue(true);
		expect((ch.traitSets[1] as any).pool).toBe(true);
		expect(ch.traitSets[1].rating?.type).toBe('Dice');
		expect(setEditor.find('[role="group"][aria-label="Range"]').exists()).toBe(true);

		setEditor.unmount();
		wrapper.unmount();
	});

	it('emits minimal, layperson-approachable JSON with date/version/$schema last and preserves defaults on null/omitted fields', async () => {
		const ch = freshBlankCharacter('minimal-json-1');
		const now = '2026-11-15T16:38:26.913Z';
		ch.dateCreated = now;
		ch.dateModified = now;
		ch.dateTouched = now;

		const layered = characterCurioFunctions.toLayeredEntity(ch);
		expect(Object.keys(layered)).toEqual([
			'name',
			'sets',
			'id',
			'dateCreated',
			'dateModified',
			'dateTouched',
			'version',
			'$schema',
		]);
		expect(layered).toEqual({
			name: '',
			sets: {
				Name: {
					id: 'name',
					rating: {
						type: 'Die',
						value: [8],
					},
				},
			},
			id: 'minimal-json-1',
			dateCreated: now,
			dateModified: now,
			dateTouched: now,
			version: '0.2',
			$schema: '../schema/0.2/curiosity.schema.json',
		});

		// Toggling Pronouns on and back off via Name Parts leaves zero hidden-trait clutter
		const viewWrapper = mount(CharacterView, {
			props: {
				character: ch,
				submode: 'edit',
				editing: [],
			},
		});
		const partBtn = viewWrapper.find('.sheet-name-organic-actions .preview-button-secondary');
		await partBtn.trigger('click');
		const pronounsChip = () =>
			viewWrapper.findAll('[aria-label="Name parts"] .organic-part-chip').find((c) => c.text().includes('Pronouns'))!;
		await pronounsChip().trigger('click');
		expect(viewWrapper.find('.sheet-meta-pronoun-cell').exists()).toBe(true);
		await pronounsChip().trigger('click');
		expect(viewWrapper.find('.sheet-meta-pronoun-cell').exists()).toBe(false);
		const afterToggleLayered = characterCurioFunctions.toLayeredEntity(ch) as Record<string, any>;
		expect(afterToggleLayered.sets.Name.traits).toBeUndefined();
		viewWrapper.unmount();

		// JsonEditor shows clean JSON and accepts hand-edited minimal/null-valued JSON (preserving open id if omitted)
		const jsonWrapper = mount(JsonEditor, {
			props: {
				character: ch,
				open: true,
			},
		});
		await jsonWrapper.vm.$nextTick();
		const textarea = jsonWrapper.find('textarea.json-text');
		expect(textarea.exists()).toBe(true);
		const initialText = (textarea.element as HTMLTextAreaElement).value;
		expect(initialText.split('\n').length).toBeLessThanOrEqual(22);
		expect(initialText.trimStart().startsWith('{\n  "name": ""')).toBe(true);
		expect(initialText.trimEnd().endsWith('"$schema": "../schema/0.2/curiosity.schema.json"\n}')).toBe(true);

		const handEdited = JSON.stringify(
			{
				name: 'Jimmy the Snitch',
				plotPoints: null,
				sets: {
					Name: {
						id: 'name',
						rating: {
							type: 'Die',
							value: [10],
						},
					},
					Skills: {
						traits: {
							Sneak: {
								rating: {
									type: 'Die',
									value: [8],
								},
							},
						},
					},
				},
			},
			null,
			2,
		);
		await textarea.setValue(handEdited);
		const applyBtn = jsonWrapper.findAll('.editor-button').find((b) => b.text().includes('Apply'))!;
		await applyBtn.trigger('click');

		const applied = jsonWrapper.emitted('applyJson')?.[0]?.[0] as Record<string, any>;
		expect(applied.id).toBe('minimal-json-1');
		expect(characterCurioFunctions.isValidCurrentCharacter(applied)).toBe(true);

		const materialized = characterCurioFunctions.materializeCharacter(applied, null) as unknown as Character;
		expect(materialized.name).toBe('Jimmy the Snitch');
		expect(hasPlotPoints(materialized)).toBe(false);
		expect(resolvePlotPoints(materialized)).toBe(0);
		expect(resolvePlotPoints({ plotPoints: 2 })).toBe(2);
		const matNameSet = materialized.traitSets.find((s) => isNameSet(s));
		expect(getRating(matNameSet)?.value).toEqual([10]);
		const matSkills = materialized.traitSets.find((s) => s.name === 'Skills');
		expect(getRating(matSkills?.traits[0])?.value).toEqual([8]);

		jsonWrapper.unmount();
	});

	it('renders Name Pip bubbles interactively in Edit and Play and unifies Name controls in NameEditor / StudioPanel', async () => {
		const ch = freshBlankCharacter('name-pip-1');
		ch.name = 'Pip Hero';
		(ch.traitSets[0] as any).rating = { type: 'Pip', value: [true, false, false] };

		const editWrap = mount(CharacterView, {
			attachTo: document.body,
			props: {
				character: ch,
				submode: 'edit',
				editing: [],
			},
		});
		const pipGroup = editWrap.find('.pip-value.sheet-name-pip-group');
		expect(pipGroup.exists()).toBe(true);
		const pipButtons = pipGroup.findAll('.inline-pip-btn');
		expect(pipButtons).toHaveLength(3);
		expect(pipButtons[0].find('.pip-bubble.filled').exists()).toBe(true);
		await pipButtons[2].trigger('click');
		expect((ch.traitSets[0] as any).rating.value).toEqual([true, false, true]);
		expect(editWrap.find('button.sheet-name-rating-trigger').exists()).toBe(true);
		editWrap.unmount();

		const playWrap = mount(CharacterView, {
			attachTo: document.body,
			props: {
				character: ch,
				submode: 'play',
				editing: [],
			},
		});
		expect(playWrap.findAll('.sheet-name-pip-group .pip-bubble.filled')).toHaveLength(2);
		playWrap.unmount();

		const nameEd = mount(NameEditor, {
			props: {
				character: ch,
				open: true,
				tab: 'sheet',
			},
		});
		expect(nameEd.text()).not.toContain('Configure Name Set');
		expect(nameEd.find('.pip-editor-row').exists()).toBe(true);
		await nameEd.find('button[aria-label="Increase sheet pip count"]').trigger('click');
		expect((ch.traitSets[0] as any).rating.value).toHaveLength(4);
		const lineBtn = nameEd.findAll('.editor-group-btn').find((b) => b.text().trim() === 'Line')!;
		await lineBtn.trigger('click');
		expect(getView(ch.traitSets[0])?.border).toBe('line');
		nameEd.unmount();

		const studio = mount(StudioPanel, {
			props: {
				open: true,
				tab: 'properties',
				submode: 'edit',
				character: ch,
				editing: ['traitSet', 0],
				dicePool: { dice: [null, null, null, null, null], items: [], wordBank: [] },
			},
		});
		await flushPromises();
		await nextTick();
		expect(studio.findComponent(NameEditor).exists()).toBe(true);
		studio.unmount();
	});

	it('supports Edit-mode + Pillar creation, set-header pillar chips, and accessible visual PresetGalleryCards', async () => {
		const ch = freshBlankCharacter('edit-pillar-1');
		ch.traitSets.push({ name: 'Roles', noun: 'Role', traits: [] } as any);

		const wrapper = mount(CharacterView, {
			attachTo: document.body,
			props: {
				character: ch,
				submode: 'edit',
				editing: [],
			},
		});
		expect(wrapper.find('.set-header-pillar-chip').exists()).toBe(false);

		await wrapper.find('.sheet-organic-builder .btn-pillar-toggle').trigger('click');
		expect(wrapper.emitted('closeDrawer')?.length).toBeGreaterThanOrEqual(1);
		const pInput = wrapper.find('.inline-add-pillar-area input.pillar-inline-input');
		await pInput.setValue('Scene');
		await wrapper.find('.inline-add-pillar-area form').trigger('submit');
		await nextTick();

		expect(getView(ch)?.pillars).toEqual(['sheet', 'scene']);
		const chips = wrapper.findAll('.set-header-pillar-chip');
		expect(chips.length).toBeGreaterThanOrEqual(2);
		expect(wrapper.findAll('.trait-set')).toHaveLength(2);
		wrapper.unmount();

		const cardHost = document.createElement('div');
		document.body.appendChild(cardHost);
		const cardWrap = mount(PresetGalleryCard, {
			attachTo: cardHost,
			props: {
				preset: characterCurioSetPresets['trait-track'],
				deletable: true,
			},
		});
		expect(cardWrap.find('.preset-card-preview[data-preview-kind="track"]').exists()).toBe(true);
		expect(cardWrap.find('.btn-preset-add .preset-gallery-name').text().trim()).toBe('Trait + Track');
		expect(cardWrap.findAll('button button')).toHaveLength(0);
		const cardAxe = await axe.run(cardWrap.element);
		expect(cardAxe.violations).toHaveLength(0);
		cardWrap.unmount();
		cardHost.remove();
	});

	it('places mobile Play pill clear next to dice, Roll on right, and offers Undo recovery on clear', async () => {
		const ch = freshBlankCharacter('mobile-pill-undo-1');
		ch.name = 'Jimmy';
		ch.traitSets.push({
			name: 'Skills',
			noun: 'Skill',
			traits: [{ name: 'Sneak', rating: { type: 'Die', value: [8] } }],
		} as any);
		localStorage.setItem(
			'characterCurioData',
			JSON.stringify({ '0.1': { characters: [ch], prefs: { version: 1, global: {}, characters: {} } } }),
		);

		const app = mount(App, { attachTo: document.body });
		await flushPromises();
		const vm = app.vm as any;
		if (!vm.characters.some((c: any) => c?.id === ch.id)) {
			vm.characters.push(ch);
		}
		vm.loadCharacter(ch.id, 'play');
		await flushPromises();
		await nextTick();

		const sheetComp = app.findComponent(CharacterView);
		expect(sheetComp.exists()).toBe(true);
		sheetComp.vm.$emit('addDieToRoller', { size: 8, qty: 1, source: 'Sneak' });
		await nextTick();

		const stagedGroup = app.find('.mobile-roller-pill-staged-group');
		expect(stagedGroup.exists()).toBe(true);
		expect(stagedGroup.find('.mobile-roller-pill-left').exists()).toBe(true);
		expect(stagedGroup.find('.btn-pill-clear').exists()).toBe(true);

		const rightGroupButtons = app.findAll('.mobile-roller-pill-right button');
		expect(rightGroupButtons.map((b) => b.classes()[0])).toEqual(['btn-pill-expand', 'btn-pill-roll']);

		await app.find('.btn-pill-clear').trigger('click');
		await nextTick();
		expect(app.find('.pill-die').exists()).toBe(false);
		const undoBtn = app.find('.toast-action-btn');
		expect(undoBtn.exists()).toBe(true);
		expect(undoBtn.text()).toBe('Undo');
		expect(app.find('.toast-notification').attributes('aria-hidden')).toBeUndefined();

		await undoBtn.trigger('click');
		await nextTick();
		expect(app.find('.pill-die').exists()).toBe(true);
		expect(app.find('.toast-notification').exists()).toBe(false);
		void vm;
		app.unmount();
	});

	it('avoids hidden game defaults (blank Counter header, explicit blank labels, neutral defaults) and keeps per-trait + Part persistent', async () => {
		const ch = reactive(freshBlankCharacter('slice-1a-defaults')) as any;
		ch.traitSets.push({
			name: 'Progress',
			noun: 'Step',
			plural: 'Steps',
			view: { header: 'top', outIndicator: true, style: { header: 'default', body: 'default' } },
			traits: [
				{ name: 'Clock', rating: { type: 'Counter', value: [2], range: [0, 10] } },
				{ name: 'Risk', rating: { type: 'Die', value: [8], range: [4, 6, 8, 10, 12] } },
			],
		});
		ch.traitSets.push({
			name: 'Branches',
			noun: 'Branch',
			view: { header: 'top', style: { header: 'default', body: 'subtrait-columns' } },
			traits: [{ name: 'Craft', rating: { type: 'Die', value: [6], range: [4, 6, 8, 10, 12] }, traits: [] }],
		});
		ch.traitSets.push({
			name: 'Pips',
			view: { header: 'top', style: { header: 'default', body: 'pips' } },
			traits: [],
		});

		const wrapper = mount(CharacterView, {
			attachTo: document.body,
			props: {
				character: ch,
				submode: 'edit',
				editing: [],
			},
		});

		// 1. Counter header is blank by default (never 'XP'); pips default to 5; subtrait-columns defaults to TRAIT / SUBTRAITS
		expect(wrapper.find('[data-set-index="1"] .trait-set-header-counter').exists()).toBe(false);
		expect(wrapper.findAll('[data-set-index="2"] .branch-head-col').map((n) => n.text().trim())).toEqual([
			'TRAIT',
			'SUBTRAITS',
		]);
		expect(wrapper.findAll('[data-set-index="3"] .pip-bubble')).toHaveLength(5);

		// 2. Per-trait + Part stays visible in Edit mode even while set header is focused or rating bar is closed
		await wrapper.find('[data-set-index="1"] .trait-set-header-inner').trigger('click');
		expect(wrapper.find('input.trait-set-name-inline-input').exists()).toBe(true);
		const partToggles = wrapper.findAll('[data-set-index="1"] .btn-trait-part-toggle');
		expect(partToggles).toHaveLength(2);
		expect(partToggles[0].attributes('aria-label')).toContain('Part');
		expect((await axe.run(wrapper.element)).violations).toHaveLength(0);

		// Toggling + Badge on a trait with no SFX reveals Badge editor (without Prefix) inside TraitEditor
		await partToggles[0].trigger('click');
		const badgeChip = wrapper
			.findAll('[data-set-index="1"] [aria-label="Trait parts"] .organic-part-chip')
			.find((c) => c.text().includes('Badge'))!;
		await badgeChip.trigger('click');
		expect(getView(ch.traitSets[1].traits[0])?.badge).toBeTruthy();

		const traitEd = mount(TraitEditor, {
			props: {
				character: ch,
				traitSetID: 1,
				traitID: 0,
				open: true,
				submode: 'edit',
			},
		});
		expect(traitEd.find('.editor-field .editor-label').exists()).toBe(true);
		expect(traitEd.text()).toContain('Badge');
		expect(traitEd.text()).not.toContain('Prefix');
		traitEd.unmount();

		// 3. TraitSetEditor stores counter label under view.labels.counter and clears labels to explicit ""
		const setEd = mount(TraitSetEditor, {
			props: { character: ch, traitSetID: 1, open: true },
		});
		const counterInput = setEd.find('input[name="counterLabel"]');
		expect(counterInput.exists()).toBe(true);
		expect((counterInput.element as HTMLInputElement).value).toBe('');
		await counterInput.setValue('Marks');
		await counterInput.trigger('change');
		expect(getView(ch.traitSets[1])?.labels?.counter).toBe('Marks');
		expect((ch.traitSets[1] as any).counterLabel).toBeUndefined();
		await nextTick();
		expect(wrapper.find('[data-set-index="1"] .trait-set-header-counter').text().trim()).toBe('Marks');

		await counterInput.setValue('');
		await counterInput.trigger('change');
		await nextTick();
		expect(getView(ch.traitSets[1])?.labels?.counter).toBeUndefined();
		expect(wrapper.find('[data-set-index="1"] .trait-set-header-counter').exists()).toBe(false);
		setEd.unmount();

		const branchEd = mount(TraitSetEditor, {
			props: { character: ch, traitSetID: 2, open: true },
		});
		const leftHeading = branchEd.find('input[name="subHeadingLeft"]');
		await leftHeading.setValue('');
		await leftHeading.trigger('change');
		await nextTick();
		expect(getView(ch.traitSets[2])?.labels?.left).toBe('');
		expect(wrapper.findAll('[data-set-index="2"] .branch-head-col')[0].text().trim()).toBe('');
		branchEd.unmount();

		wrapper.unmount();
	});

	it('guards populated traitless sets from 1-click deletion and avoids nested interactive buttons on set-header dice in Edit mode', async () => {
		const ch = freshBlankCharacter('slice-1b-header');
		ch.traitSets.push({
			name: 'Showcase Pool',
			noun: 'Die',
			rating: { type: 'Dice', value: [10, 10, 10] },
			view: { header: 'top', style: { header: 'default', body: 'default' } },
			traits: [],
		} as any);

		const blockWrap = mount(TraitSetBlock, {
			attachTo: document.body,
			props: {
				character: ch,
				traitSetID: 1,
				submode: 'edit',
				editing: [],
			},
		});

		expect(blockWrap.find('button[aria-label="Delete set"]').exists()).toBe(false);
		expect(blockWrap.findAll('.trait-set-header-inner [role="button"]')).toHaveLength(0);
		expect((await axe.run(blockWrap.element)).violations).toHaveLength(0);
		blockWrap.unmount();

		const populatedEditor = mount(TraitSetEditor, {
			props: { character: ch, traitSetID: 1, open: true },
		});
		await populatedEditor.find('button.editor-delete').trigger('click');
		expect(populatedEditor.emitted('removeTraitSet')).toBeUndefined();
		populatedEditor.unmount();
	});
});
