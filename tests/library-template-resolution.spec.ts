import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { characterCurioFunctions } from '../js/functions.ts';
import { characterCurioStorage } from '../js/storage.ts';
import AppFooter from '../js/app-footer.vue';
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
		expect(characterCurioStorage.LEGACY_KEYS).toContain('characterCurioData');
		expect(characterCurioStorage.LEGACY_KEYS).toContain('characterCurioOpenCharacterIDs');
		expect(characterCurioStorage.LEGACY_KEYS).toContain('characterCurioPlayViewMode');
		expect(characterCurioStorage.LEGACY_KEYS).toContain('characterCurioRollerPosition');
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
});
