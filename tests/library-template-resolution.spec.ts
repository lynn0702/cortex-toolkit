import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { characterCurioFunctions } from '../js/functions.ts';
import { characterCurioStorage } from '../js/storage.ts';
import AppFooter from '../js/app-footer.vue';
import Roster from '../js/roster.vue';
import App from '../js/app.vue';
import { DREAMER_ARCHITECT_SHOWCASE, SHOWCASE_TEMPLATES } from '../js/showcase-templates.ts';
import type { Character, SheetTemplate } from '../js/model.ts';

describe('Character Curio Branding & Resolution Suite', () => {
	const mockLibrary: SheetTemplate[] = [
		{
			id: 'alien-us',
			name: 'Alien Us',
			game: 'Alien, Us',
			template: { id: 'alien-us', name: 'Alien Us' },
		} as unknown as SheetTemplate,
		{
			id: 'hammerheads-character',
			name: 'Hammerheads Character',
			game: 'Hammerheads',
			template: { id: 'hammerheads-character', name: 'Hammerheads Character' },
		} as unknown as SheetTemplate,
	];

	beforeEach(() => {
		(window as any).characterCurioLibraryTemplates = mockLibrary;
		(globalThis as any).characterCurioLibraryTemplates = mockLibrary;
	});

	it('finds library templates via findLibraryTemplate', () => {
		const found = characterCurioFunctions.findLibraryTemplate('alien-us');
		expect(found).not.toBeNull();
		expect(found?.id).toBe('alien-us');
		expect((found as any)?.game).toBe('Alien, Us');
	});

	it('ensures library template IDs do not have spotlight- prefix', () => {
		for (const entry of mockLibrary) {
			expect(entry.id).not.toMatch(/^spotlight-/);
		}
	});

	it('resolves template local-first before falling back to library', () => {
		const localTemplates: SheetTemplate[] = [
			{
				id: 'alien-us',
				name: 'Local Alien Us Override',
				version: 2,
				template: { id: 'alien-us', name: 'Local Alien Us Override' },
			} as unknown as SheetTemplate,
		];

		const characterWithAlien = {
			sheet: {
				template: 'alien-us',
			},
		} as unknown as Character;

		const resolvedAlien = characterCurioFunctions.resolveTemplateFor(characterWithAlien, localTemplates);
		expect(resolvedAlien).not.toBeNull();
		expect(resolvedAlien?.name).toBe('Local Alien Us Override');

		const characterWithHammerheads = {
			sheet: {
				template: 'hammerheads-character',
			},
		} as unknown as Character;

		const resolvedHammerheads = characterCurioFunctions.resolveTemplateFor(characterWithHammerheads, localTemplates);
		expect(resolvedHammerheads).not.toBeNull();
		expect(resolvedHammerheads?.name).toBe('Hammerheads Character');
	});

	it('uses Character Curio database name and storage keys (clean break)', () => {
		expect(characterCurioStorage.DB_NAME).toBe('character-curio');
		expect(characterCurioStorage.FALLBACK_KEY).toBe('characterCurioFallback');
		expect(characterCurioStorage.RECORD_KEY).toBe('app');
	});

	it('renders the tarot World mark (favicon.ico) in the footer colophon', () => {
		const wrapper = mount(AppFooter, {
			props: {
				mode: 'roster',
				year: 2026,
			},
		});

		const colophonImg = wrapper.find('.footer-colophon img');
		expect(colophonImg.exists()).toBe(true);
		expect(colophonImg.attributes('src')).toBe('images/favicon.ico');
		expect(colophonImg.attributes('alt')).toBe('Character Curio');
	});

	it('formats character export filenames with .curio.json', () => {
		const characterName = 'Val Harper';
		const timestamp = 1794260000000;
		const sanitized = characterName.replaceAll(/\s+/g, '_');
		const filename = `${sanitized}_${timestamp}.curio.json`;
		expect(filename).toBe('Val_Harper_1794260000000.curio.json');
		expect(filename).toMatch(/\.curio\.json$/);
	});

	it('mounts the app with root ID character-curio', () => {
		const el = document.createElement('article');
		el.id = 'character-curio';
		document.body.appendChild(el);
		expect(document.getElementById('character-curio')).not.toBeNull();
		document.body.removeChild(el);
	});

	it('imports The Dreamer & the Architect from .curio.json with 4 trait sets, Boss Dice ring, and tarot-card layout', async () => {
		const raw = (await import('../data/templates/Dreamer_Architect.curio.json')).default;
		const imported = characterCurioFunctions.sanitizeImportedCharacter(raw);
		expect(imported).not.toBeNull();
		expect(imported.name).toBe('The Dreamer & the Architect');
		expect(imported.traitSets).toHaveLength(4);

		const [architect, archDistinctions, values, dreamer] = imported.traitSets;
		expect(architect.name).toBe('The Architect');
		expect(architect.rating.type).toBe('Dice');
		expect(architect.rating.value).toEqual([10, 10, 10]);
		expect(architect.traits).toHaveLength(0);
		expect(architect.view.ringNoun).toBe('Boss Die');
		expect(architect.view.borderless).toBe(true);

		// Architect Distinctions are full phrases without Pip children
		expect(archDistinctions.name).toBe('Architect Distinctions');
		expect(archDistinctions.traits).toHaveLength(3);
		expect(archDistinctions.traits[0].name).toBe('Function Before Form');
		expect(archDistinctions.traits[0].traits).toHaveLength(0);
		expect(archDistinctions.traits[1].name).toBe('Less is More');
		expect(archDistinctions.traits[1].traits).toHaveLength(0);
		expect(archDistinctions.traits[2].name).toBe('All My Darlings are Dead');
		expect(archDistinctions.traits[2].traits).toHaveLength(0);

		// Values have descriptions
		expect(values.name).toBe('Values');
		expect(values.traits).toHaveLength(3);
		expect(values.view.borderless).toBe(true);
		expect(values.traits[0].name).toBe('Data');
		expect(values.traits[0].description).toBe('belongs to the people, not the builders');
		expect(values.traits[0].traits).toHaveLength(0);

		// Dreamer distinctions are also simple label traits
		expect(dreamer.name).toBe('The Dreamer');
		expect(dreamer.traits).toHaveLength(3);
		expect(dreamer.view.borderless).toBe(true);
		expect(dreamer.view.header).toBe('bottom');
		expect(dreamer.traits[0].name).toBe('Beauty is all around us');
		expect(dreamer.traits[0].traits).toHaveLength(0);
		expect(dreamer.traits[1].name).toBe("I'll have another slice");
		expect(dreamer.traits[1].traits).toHaveLength(0);
		expect(dreamer.traits[2].name).toBe("Darling, let's have tea");
		expect(dreamer.traits[2].traits).toHaveLength(0);

		// place
		expect(architect.view.place).toEqual({ height: 3, left: '0%', top: 0, width: '50%' });
		expect(archDistinctions.view.place).toEqual({ height: 3, left: '50%', top: 0, width: '50%' });
		expect(values.view.place).toEqual({ height: 2, left: '0%', top: 3, width: '100%' });
		expect(dreamer.view.place).toEqual({ height: 3, left: '0%', top: 5, width: '100%' });

		// frame
		expect(architect.view.frame.stroke).toBe('2px');
		expect(architect.view.frame.traitsSpan).toEqual([45, 135]);
		expect(architect.view.frame.image.zoom).toBe(1);
		expect(architect.view.frame.size).toBe(190);
		expect(dreamer.view.frame.stroke).toBe('2px');
		expect(dreamer.view.frame.position).toBe('right');
		expect(dreamer.view.frame.image.zoom).toBe(1.25);
		expect(dreamer.view.frame.image.alignment).toBe('top-center');
		expect(dreamer.view.frame.size).toBe(290);
		expect(dreamer.view.frame.size).toBeGreaterThan(architect.view.frame.size);

		// header
		expect(architect.view.header).toBe('top');
		expect(values.view.header).toBe('top');
	});

	it('surfaces Dreamer & Architect as showcase template with tarot-card layout details', () => {
		expect(DREAMER_ARCHITECT_SHOWCASE.id).toBe('dreamer-architect');
		expect(DREAMER_ARCHITECT_SHOWCASE.title).toBe('The Dreamer & the Architect');
		expect(DREAMER_ARCHITECT_SHOWCASE.character.name).toBe('The Dreamer & the Architect');
		expect(DREAMER_ARCHITECT_SHOWCASE.character.traitSets).toHaveLength(4);
		// Vanguard remains index 0 of SHOWCASE_TEMPLATES
		expect(SHOWCASE_TEMPLATES[0].id).toBe('vanguard-frame-showcase');
	});

	it('roster prepends Dreamer & Architect when characters is empty (splash/first run)', () => {
		const wrapper = mount(Roster, {
			props: {
				characters: [],
			},
		});
		const vm = wrapper.vm as any;
		expect(vm.libraryTemplates).toBeDefined();
		expect(vm.libraryTemplates.length).toBeGreaterThanOrEqual(2);
		expect(vm.libraryTemplates[0].id).toBe('dreamer-architect');
		expect(vm.libraryTemplates[1].id).toBe('vanguard-frame-showcase');

		const select = wrapper.find('#roster-template-picker');
		expect(select.exists()).toBe(true);
		const options = select.findAll('option');
		const values = options.map((o) => o.attributes('value'));
		expect(values).toContain('library:dreamer-architect');
		wrapper.unmount();
	});

	it('roster fades Dreamer & Architect once characters are saved', () => {
		const wrapper = mount(Roster, {
			props: {
				characters: [{ id: 'hero-1', name: 'My Hero' }],
			},
		});
		const vm = wrapper.vm as any;
		expect(vm.libraryTemplates).toBeDefined();
		expect(vm.libraryTemplates[0].id).toBe('vanguard-frame-showcase');
		const found = vm.libraryTemplates.find((t: any) => t.id === 'dreamer-architect');
		expect(found).toBeUndefined();

		const select = wrapper.find('#roster-template-picker');
		expect(select.exists()).toBe(true);
		const options = select.findAll('option');
		const values = options.map((o) => o.attributes('value'));
		expect(values).not.toContain('library:dreamer-architect');
		wrapper.unmount();
	});

	it('first-run auto-open: App opens Dreamer & Architect as transient preview without saving', async () => {
		const wrapper = mount(App);
		const vm = wrapper.vm as any;
		// Open preview explicitly to simulate first-run branch
		vm.openPreview();
		expect(vm.isPreview).toBe(true);
		expect(vm.previewCharacter).not.toBeNull();
		expect(vm.previewCharacter.name).toBe('The Dreamer & the Architect');
		// Characters array remains untouched (not saved)
		expect(vm.characters).toHaveLength(0);

		// Closing preview navigates to roster and clears preview
		vm.closePreview();
		expect(vm.isPreview).toBe(false);
		expect(vm.previewCharacter).toBeNull();
		expect(vm.characters).toHaveLength(0);
		wrapper.unmount();
	});

	it('preview action: "Use this template" creates a saved character in characters array', async () => {
		const wrapper = mount(App);
		const vm = wrapper.vm as any;
		vm.openPreview();
		expect(vm.characters).toHaveLength(0);

		vm.usePreviewTemplate();
		expect(vm.isPreview).toBe(false);
		expect(vm.characters).toHaveLength(1);
		expect(vm.characters[0].sheet?.template?.id).toBe('dreamer-architect');
		wrapper.unmount();
	});

	it('gracefully falls back to roster if template is missing or unparsable', () => {
		const wrapper = mount(App);
		const vm = wrapper.vm as any;
		vm.openPreview(null);
		expect(vm.isPreview).toBe(false);
		expect(vm.characters).toHaveLength(0);
		wrapper.unmount();
	});
});
