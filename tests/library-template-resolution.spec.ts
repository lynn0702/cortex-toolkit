import { describe, it, expect, beforeEach } from 'vitest';
import { cortexFunctions } from '../js/functions.ts';
import type { Character, SheetTemplate } from '../js/model.ts';

describe('Library and Template Resolution Suite', () => {
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
		(window as any).cortexLibraryTemplates = mockLibrary;
		(globalThis as any).cortexLibraryTemplates = mockLibrary;
	});

	it('finds library templates via findLibraryTemplate', () => {
		const found = cortexFunctions.findLibraryTemplate('alien-us');
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

		const resolvedAlien = cortexFunctions.resolveTemplateFor(characterWithAlien, localTemplates);
		expect(resolvedAlien).not.toBeNull();
		expect(resolvedAlien?.name).toBe('Local Alien Us Override');

		const characterWithHammerheads = {
			sheet: {
				template: 'hammerheads-character',
			},
		} as unknown as Character;

		const resolvedHammerheads = cortexFunctions.resolveTemplateFor(characterWithHammerheads, localTemplates);
		expect(resolvedHammerheads).not.toBeNull();
		expect(resolvedHammerheads?.name).toBe('Hammerheads Character');
	});
});
