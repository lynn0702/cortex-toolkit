import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import axe from 'axe-core';
import CharacterView from '../js/character.vue';
import NameEditor from '../js/name-editor.vue';
import TraitSetEditor from '../js/trait-set-editor.vue';
import { characterCurioFunctions } from '../js/functions.ts';
import { getRating, getView, isNameSet, type Character } from '../js/model.ts';

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
			range: [4, 6, 8, 10, 12],
		});

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

		// 1. + Trait creates a clean headerless TraitSet with compact ratingDisplay ('rating') and stays calmly on canvas
		await builderButtons[0].trigger('click');
		expect(ch.traitSets).toHaveLength(2);
		expect(getView(ch.traitSets[1])?.header).toBe('none');
		expect(getView(ch.traitSets[1])?.ratingDisplay).toBe('rating');
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
		expect(getView(ch.traitSets[2])?.ratingDisplay).toBe('rating');
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
			range: [4, 6, 8, 10, 12],
		});
		const rematTraitsSet = (rematerialized.traitSets ?? []).find((s: any) => s.name === 'Traits');
		expect((rematTraitsSet?.traits ?? []).map((t: any) => t.name)).toEqual(['New Trait', 'New Trait 2']);

		wrapper.unmount();
	});
});
