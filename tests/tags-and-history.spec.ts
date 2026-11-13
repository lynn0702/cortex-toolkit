import { afterEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { computed, nextTick, ref } from 'vue';
import axe from 'axe-core';
import TagEditor from '../js/tag-editor.vue';
import { useHistory } from '../js/use-history.ts';
import { characterCurioFunctions } from '../js/functions.ts';

describe('TagEditor, tag search, and edit-mode history snapshots', () => {
	afterEach(() => {
		vi.useRealTimers();
	});

	it('validates tags against schema regex, supports add/remove/Backspace, and passes axe-core', async () => {
		let tags = ['alpha'];
		const wrapper = mount(TagEditor, {
			attachTo: document.body,
			props: {
				modelValue: tags,
				inputId: 'test-tags-input',
				label: 'Tags',
				'onUpdate:modelValue': async (next: string[]) => {
					tags = next;
					await wrapper.setProps({ modelValue: next });
				},
			},
		});

		const input = wrapper.find('#test-tags-input');

		// Invalid tag with spaces is rejected with inline alert
		await input.setValue('bad tag!');
		await input.trigger('keydown', { key: 'Enter' });
		expect(wrapper.find('.tag-editor-error').exists()).toBe(true);
		expect(tags).toEqual(['alpha']);

		// Valid tag with allowed schema punctuation (- . /) is accepted cleanly (strips leading #)
		await input.setValue('#hero/tier-2.v1');
		await input.trigger('keydown', { key: 'Enter' });
		expect(wrapper.find('.tag-editor-error').exists()).toBe(false);
		expect(tags).toEqual(['alpha', 'hero/tier-2.v1']);

		// Audit rendered component + chips with axe-core while attached to document.body
		const results = await axe.run(wrapper.element as HTMLElement, {
			rules: {
				'color-contrast': { enabled: false },
				region: { enabled: false },
			},
		});
		expect(results.violations).toEqual([]);

		// Backspace on empty input removes last tag
		await input.trigger('keydown', { key: 'Backspace' });
		expect(tags).toEqual(['alpha']);

		// Remove button deletes specific tag
		await wrapper.find('.tag-chip-remove').trigger('click');
		expect(tags).toEqual([]);

		wrapper.unmount();
	});

	it('characterMatchesTagQuery searches character, portrait, traitSet, trait, and nested subtrait tags', () => {
		const sample: any = {
			name: 'Dreamer',
			tags: ['solo'],
			portrait: { url: '', alt: '', tags: ['tarot-portrait'] },
			traitSets: [
				{
					id: 'set-1',
					name: 'Values',
					tags: ['core-set'],
					traits: [
						{
							name: 'Design',
							tags: ['craft'],
							traits: [{ name: 'Blueprint', tags: ['nested-sub'] }],
						},
					],
				},
			],
		};

		expect(characterCurioFunctions.characterMatchesTagQuery(sample, 'solo')).toBe(true);
		expect(characterCurioFunctions.characterMatchesTagQuery(sample, 'tarot')).toBe(true);
		expect(characterCurioFunctions.characterMatchesTagQuery(sample, 'core-set')).toBe(true);
		expect(characterCurioFunctions.characterMatchesTagQuery(sample, 'craft')).toBe(true);
		expect(characterCurioFunctions.characterMatchesTagQuery(sample, 'nested-sub')).toBe(true);
		expect(characterCurioFunctions.characterMatchesTagQuery(sample, 'missing-tag')).toBe(false);
	});

	it('useHistory scheduleHistorySnapshot records debounced steps while editing is non-empty', async () => {
		vi.useFakeTimers();
		const mode = ref('character');
		const characters = ref<any[]>([{ id: 'c1', name: 'Original', traitSets: [] }]);
		const characterIndex = computed(() => 0);
		const character = computed(() => characters.value[characterIndex.value]);
		const editing = ref<any[]>(['name']);
		const isNavigatingHistory = ref(false);
		const history = ref<string[]>([]);
		const historyIndex = ref(-1);
		const saveCalls: number[] = [];

		const { canUndo, canRedo, initHistory, scheduleHistorySnapshot, markDirty, undo, redo } = useHistory({
			mode,
			character,
			characters,
			characterIndex,
			editing,
			isNavigatingHistory,
			history,
			historyIndex,
			saveLocalData: () => saveCalls.push(Date.now()),
			showToast: () => {},
		});

		initHistory();
		expect(canUndo.value).toBe(false);

		// First burst of typing inside open editor -> coalesced after 400ms into 1 undo step
		characters.value[0].name = 'Edited';
		markDirty();
		scheduleHistorySnapshot(400);
		characters.value[0].name = 'Edited Once';
		scheduleHistorySnapshot(400);

		vi.advanceTimersByTime(400);
		expect(canUndo.value).toBe(true);

		// Second distinct edit after pause -> creates a second undo step
		characters.value[0].name = 'Edited Twice';
		markDirty();
		scheduleHistorySnapshot(400);
		vi.advanceTimersByTime(400);

		undo();
		await nextTick();
		expect(characters.value[0].name).toBe('Edited Once');
		expect(canRedo.value).toBe(true);

		undo();
		await nextTick();
		expect(characters.value[0].name).toBe('Original');

		redo();
		await nextTick();
		expect(characters.value[0].name).toBe('Edited Once');
		expect(saveCalls.length).toBeGreaterThanOrEqual(3);
	});
});
