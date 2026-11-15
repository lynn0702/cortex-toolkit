import { describe, it, expect } from 'vitest';
import { reactive } from 'vue';
import { mount } from '@vue/test-utils';
import axe from 'axe-core';
import CharacterView from '../js/character.vue';
import NameEditor from '../js/name-editor.vue';
import TraitSetEditor from '../js/trait-set-editor.vue';
import TraitEditor from '../js/trait-editor.vue';
import JsonEditor from '../js/json-editor.vue';
import { characterCurioFunctions } from '../js/functions.ts';
import { getRating, getView, isNameSet, resolvePlotPoints, resolveRange, type Character } from '../js/model.ts';

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
		expect(resolvePlotPoints(ch)).toBe(1);

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

	it('grows organically via + Trait, + Part, and + Set, round-trips losslessly, and deletes empty sets in 1 click', async () => {
		const ch = freshBlankCharacter();
		ch.name = 'Jimmy the Snitch';

		const wrapper = mount(CharacterView, {
			props: {
				character: ch,
				submode: 'edit',
				editing: [],
			},
		});

		const builderButtons = wrapper.findAll('.sheet-organic-builder .btn-sheet-add');
		expect(builderButtons.map((b) => b.text().trim())).toEqual(['Trait', 'Part', 'Set', 'Presets']);

		// 1. + Trait creates a clean headerless TraitSet with compact default rating display and stays calmly on canvas
		await builderButtons[0].trigger('click');
		expect(ch.traitSets).toHaveLength(2);
		expect(getView(ch.traitSets[1])?.header).toBe('none');
		expect(getView(ch.traitSets[1])?.ratingDisplay).toBeUndefined();
		expect(ch.traitSets[1].traits.map((t) => t.name)).toEqual(['New Trait']);
		expect(wrapper.emitted('selectElement')).toBeUndefined();
		expect(wrapper.find('input.trait-name-inline-input').exists()).toBe(true);
		expect(wrapper.find('.trait .inline-rating-bar').exists()).toBe(true);
		// Single active die rendered per trait on canvas, NOT a 5-die full array
		expect(wrapper.find('.trait').findAll('.single-die-value [role="button"]')).toHaveLength(1);

		await builderButtons[0].trigger('click');
		expect(ch.traitSets[1].traits.map((t) => t.name)).toEqual(['New Trait', 'New Trait 2']);
		expect(wrapper.emitted('selectElement')).toBeUndefined();

		// Switch New Trait 2 to multi-die ('Dice': [10, 10]) via InlineRatingBar, close, then tap multi-die directly on canvas
		await wrapper
			.findAll('.trait .inline-rating-bar .inline-rating-mode-btn')
			.find((b) => b.text() === 'Dice')!
			.trigger('click');
		// Clear the default 2x d6 and add 2x d10
		await wrapper.find('.inline-pool-die-chip').trigger('click');
		await wrapper.find('.inline-pool-die-chip').trigger('click');
		await wrapper.find('.inline-dice-palette button[aria-label="Add d10"]').trigger('click');
		await wrapper.find('.inline-dice-palette button[aria-label="Add d10"]').trigger('click');
		expect(getRating(ch.traitSets[1].traits[1])?.value).toEqual([10, 10]);
		await wrapper.find('.trait .inline-rating-bar button[aria-label="Close rating picker"]').trigger('click');
		expect(wrapper.find('.trait .inline-rating-bar').exists()).toBe(false);

		const secondTrait = wrapper.findAll('.trait')[1];
		const multiDieBadges = secondTrait.findAll('.multidie-badge-wrap > span[role="button"]');
		expect(multiDieBadges).toHaveLength(2);
		await multiDieBadges[0].trigger('click');
		expect(wrapper.emitted('selectElement')).toBeUndefined();
		expect(wrapper.find('.trait .inline-rating-bar').exists()).toBe(true);

		// Remove one d10 and add a d8 right from the main canvas
		await wrapper.find('.inline-pool-die-chip[aria-label="Remove d10"]').trigger('click');
		expect(getRating(ch.traitSets[1].traits[1])?.value).toEqual([10]);
		await wrapper.find('.inline-dice-palette button[aria-label="Add d8"]').trigger('click');
		expect(getRating(ch.traitSets[1].traits[1])?.value).toEqual([10, 8]);

		// Switch that trait to Counter and step directly from the canvas
		await wrapper
			.findAll('.trait .inline-rating-bar .inline-rating-mode-btn')
			.find((b) => b.text() === 'Counter')!
			.trigger('click');
		await wrapper.find('.trait .inline-rating-bar button[aria-label="Close rating picker"]').trigger('click');
		await wrapper.find('.counter-value button[aria-label*="Increase"]').trigger('click');
		expect(getRating(ch.traitSets[1].traits[1])?.value).toEqual([1]);

		// 2. + Part toggles Sheet Parts (Notes ordered second; no duplicate Trait Parts inside Sheet Parts)
		await builderButtons[1].trigger('click');
		expect(wrapper.find('.inline-add-part-area').exists()).toBe(true);
		expect(wrapper.find('.inline-add-part-area [aria-label="Trait parts"]').exists()).toBe(false);
		const sheetPartChips = wrapper.findAll('[aria-label="Sheet parts"] .organic-part-chip');
		expect(sheetPartChips.map((c) => c.text().trim())).toEqual([
			'Rating',
			'Notes',
			'Description',
			'Portrait',
			'Pronouns',
			'Nickname',
			'Game',
			'Player',
		]);
		const pronounsChip = sheetPartChips.find((c) => c.text().includes('Pronouns'))!;
		expect(pronounsChip.classes()).not.toContain('active');
		await pronounsChip.trigger('click');
		const pronounsTrait = characterCurioFunctions.getNameTrait(ch, 'pronouns');
		expect(getView(pronounsTrait)?.visibility).toBeUndefined();
		expect(wrapper.find('.sheet-meta-pronoun-cell input.sheet-part-inline-input').exists()).toBe(true);

		// Set-level + Part opens its own distinct Trait Parts drawer
		const setPartBtn = wrapper.findAll('.set-organic-actions button').find((b) => b.text().trim() === 'Part')!;
		await setPartBtn.trigger('click');
		expect(wrapper.find('.set-inline-part-drawer').exists()).toBe(true);
		const traitPartChips = wrapper.findAll('.set-inline-part-drawer [aria-label="Trait parts"] .organic-part-chip');
		const sfxChip = traitPartChips.find((c) => c.text().includes('SFX'))!;
		await sfxChip.trigger('click');
		expect(Boolean((getView(ch.traitSets[1])?.parts as any)?.block)).toBe(true);

		// 3. + Set creates unique empty sets calmly inline on canvas; empty set deletes in 1 click without confirm modal
		await builderButtons[2].trigger('click');
		expect(ch.traitSets).toHaveLength(3);
		expect(ch.traitSets[2].name).toBe('New Set');
		expect(ch.traitSets[2].traits).toHaveLength(0);
		expect(getView(ch.traitSets[2])?.ratingDisplay).toBeUndefined();
		expect(wrapper.emitted('selectElement')).toBeUndefined();
		expect(wrapper.find('input.trait-set-name-inline-input').exists()).toBe(true);

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

		// 4. Lossless layered round-trip
		const layered = characterCurioFunctions.toLayeredEntity(ch);
		const rematerialized = characterCurioFunctions.materializeCharacter(layered, null);
		expect(rematerialized.name).toBe('Jimmy the Snitch');
		const rematNameSet = (rematerialized.traitSets ?? []).find((s: any) => isNameSet(s));
		expect(getRating(rematNameSet)).toEqual({
			type: 'Die',
			value: [8],
			range: [],
		});
		expect(resolveRange(rematNameSet)).toEqual([4, 6, 8, 10, 12]);
		const rematTraitsSet = (rematerialized.traitSets ?? []).find((s: any) => s.name === 'Traits');
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
			version: '0.1',
			$schema: '../schema/0.1/character.schema.json',
		});

		// Toggling Pronouns on and back off when empty leaves zero hidden-trait clutter
		const viewWrapper = mount(CharacterView, {
			props: {
				character: ch,
				submode: 'edit',
				editing: [],
			},
		});
		const partBtn = viewWrapper
			.findAll('.sheet-organic-builder .btn-sheet-add')
			.find((b) => b.text().trim() === 'Part')!;
		await partBtn.trigger('click');
		const pronounsChip = () =>
			viewWrapper.findAll('[aria-label="Sheet parts"] .organic-part-chip').find((c) => c.text().includes('Pronouns'))!;
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
		expect(initialText.trimEnd().endsWith('"$schema": "../schema/0.1/character.schema.json"\n}')).toBe(true);

		const handEdited = JSON.stringify(
			{
				name: 'Jimmy the Snitch',
				plotPoints: null,
				pronouns: null,
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
		expect(resolvePlotPoints(materialized)).toBe(1);
		expect(resolvePlotPoints({ plotPoints: 0 })).toBe(0);
		const matNameSet = materialized.traitSets.find((s) => isNameSet(s));
		expect(getRating(matNameSet)?.value).toEqual([10]);
		const matSkills = materialized.traitSets.find((s) => s.name === 'Skills');
		expect(getRating(matSkills?.traits[0])?.value).toEqual([8]);

		jsonWrapper.unmount();
	});
});
