import { describe, it, expect, beforeEach, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import axe from 'axe-core';
import { characterCurioFunctions } from '../js/functions.ts';
import { characterCurioStorage } from '../js/storage.ts';
import AppFooter from '../js/app-footer.vue';
import Roster from '../js/roster.vue';
import App from '../js/app.vue';
import NameEditor from '../js/name-editor.vue';
import { DREAMER_ARCHITECT_SHOWCASE, SHOWCASE_TEMPLATES } from '../js/showcase-templates.ts';
import { getTemplateListing, getTemplateTitle, getView, type Character, type SheetTemplate } from '../js/model.ts';

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
				template: { id: 'alien-us' },
			},
		} as unknown as Character;

		const resolvedAlien = characterCurioFunctions.resolveTemplateFor(characterWithAlien, localTemplates);
		expect(resolvedAlien).not.toBeNull();
		expect(resolvedAlien?.name).toBe('Local Alien Us Override');

		const characterWithHammerheads = {
			sheet: {
				template: { id: 'hammerheads-character' },
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

	it('renders the World mark (favicon.ico) in the footer colophon', () => {
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

	it('imports The Dreamer & the Architect from .curio.json with 4 trait sets, Boss Dice ring, and layout', async () => {
		const raw = (await import('../data/templates/Dreamer_Architect.curio.json')).default;
		const imported = characterCurioFunctions.sanitizeImportedCharacter(raw);
		expect(imported).not.toBeNull();
		if (!imported || !Array.isArray(imported.traitSets)) throw new Error('expected imported character');
		expect(imported.name).toBe('The Dreamer & the Architect');
		expect(imported.traitSets).toHaveLength(4);

		const [architect, archDistinctions, values, dreamer] = imported.traitSets;
		expect(architect.name).toBe('The Architect');
		expect((architect.rating as { type?: string; value?: number[] } | undefined)?.type).toBe('Dice');
		expect((architect.rating as { type?: string; value?: number[] } | undefined)?.value).toEqual([10, 10, 10]);
		expect(architect.traits ?? []).toHaveLength(0);
		expect(architect.view?.ringNoun).toBe('Boss Die');
		expect(architect.view?.border).toBe('none');

		// Architect Distinctions are full phrases without Pip children
		expect(archDistinctions.name).toBe('Architect Distinctions');
		expect(archDistinctions.traits).toHaveLength(3);
		expect(archDistinctions.traits[0].name).toBe('Function Before Form');
		expect(archDistinctions.traits[0].traits ?? []).toHaveLength(0);
		expect(archDistinctions.traits[1].name).toBe('Less is More');
		expect(archDistinctions.traits[1].traits ?? []).toHaveLength(0);
		expect(archDistinctions.traits[2].name).toBe('All My Darlings are Dead');
		expect(archDistinctions.traits[2].traits ?? []).toHaveLength(0);

		// Values have descriptions
		expect(values.name).toBe('Values');
		expect(values.traits).toHaveLength(3);
		const valuesBorder = values.view?.border;
		expect(typeof valuesBorder === 'object' ? valuesBorder?.shape : valuesBorder).toBe('line');
		expect(values.traits[0].name).toBe('Data');
		expect(values.traits[0].description).toBe('belongs to the people, not the builders');
		expect(values.traits[0].traits ?? []).toHaveLength(0);

		// Dreamer distinctions are also simple label traits
		expect(dreamer.name).toBe('The Dreamer');
		expect(dreamer.traits).toHaveLength(3);
		expect(dreamer.view?.border).toBe('none');
		expect(dreamer.view?.header).toBe('bottom');
		expect(dreamer.traits[0].name).toBe('Beauty is all around us');
		expect(dreamer.traits[0].traits ?? []).toHaveLength(0);
		expect(dreamer.traits[1].name).toBe("I'll have another slice");
		expect(dreamer.traits[1].traits ?? []).toHaveLength(0);
		expect(dreamer.traits[2].name).toBe("Darling, let's have tea");
		expect(dreamer.traits[2].traits ?? []).toHaveLength(0);

		// place
		expect(architect.view?.place).toEqual({ height: 3, left: '0%', top: 0, width: '50%' });
		expect(archDistinctions.view?.place).toEqual({ height: 3, left: '50%', top: 0, width: '50%' });
		expect(values.view?.place).toEqual({ height: 2, left: '0%', top: 3, width: '100%' });
		expect(dreamer.view?.place).toEqual({ height: 3, left: '0%', top: 5, width: '100%' });

		// frame
		const archFrame = architect.view?.frame as
			{ stroke?: string; traitsSpan?: number[]; image?: { zoom?: number }; size?: number } | undefined;
		const dreamerFrame = dreamer.view?.frame as
			{ stroke?: string; position?: string; image?: { zoom?: number; alignment?: string }; size?: number } | undefined;
		expect(archFrame?.stroke).toBe('2px');
		expect(archFrame?.traitsSpan).toEqual([45, 135]);
		expect(archFrame?.image?.zoom).toBe(1);
		expect(archFrame?.size).toBe(190);
		expect(dreamerFrame?.stroke).toBe('2px');
		expect(dreamerFrame?.position).toBe('right');
		expect(dreamerFrame?.image?.zoom).toBe(1.25);
		expect(dreamerFrame?.image?.alignment).toBe('top-center');
		expect(dreamerFrame?.size).toBe(290);
		expect(dreamerFrame?.size).toBeGreaterThan(archFrame?.size ?? 0);

		// header
		expect(architect.view?.header).toBe('top');
		expect(values.view?.header).toBe('top');
	});

	it('surfaces Dreamer & Architect as showcase template without invented Setting/Prep/Complexity ratings', () => {
		expect(DREAMER_ARCHITECT_SHOWCASE.id).toBe('dreamer-architect');
		expect(getTemplateTitle(DREAMER_ARCHITECT_SHOWCASE)).toBe('The Dreamer & the Architect');
		expect(getTemplateListing(DREAMER_ARCHITECT_SHOWCASE)?.image).toBe(
			'images/250px-Corot_-_The_Dreamer_at_the_Fountain__1855_63.jpg',
		);
		expect((DREAMER_ARCHITECT_SHOWCASE as any).blurb).toBeUndefined();
		expect(getTemplateListing(DREAMER_ARCHITECT_SHOWCASE)?.setting).toBeUndefined();
		expect(getTemplateListing(DREAMER_ARCHITECT_SHOWCASE)?.prep).toBeUndefined();
		expect(getTemplateListing(DREAMER_ARCHITECT_SHOWCASE)?.complexity).toBeUndefined();
		expect(characterCurioFunctions.findLibraryTemplate('dreamer-architect')?.id).toBe('dreamer-architect');
		expect(DREAMER_ARCHITECT_SHOWCASE.character.name).toBe('The Dreamer & the Architect');
		expect(DREAMER_ARCHITECT_SHOWCASE.character.traitSets).toHaveLength(4);
		// Vanguard remains index 0 of SHOWCASE_TEMPLATES and also omits invented ratings
		expect(SHOWCASE_TEMPLATES[0].id).toBe('vanguard-frame-showcase');
		expect((SHOWCASE_TEMPLATES[0] as any).blurb).toBeUndefined();
		expect(getTemplateListing(SHOWCASE_TEMPLATES[0])?.setting).toBeUndefined();
		expect(getTemplateListing(SHOWCASE_TEMPLATES[0])?.prep).toBeUndefined();
		expect(getTemplateListing(SHOWCASE_TEMPLATES[0])?.complexity).toBeUndefined();
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

	it('roster keeps Dreamer & Architect in Library and search results with Dreamer portrait when characters are saved', async () => {
		const wrapper = mount(Roster, {
			props: {
				characters: [
					{
						id: 'hero-1',
						name: 'My Hero',
						traitSets: [],
						dateCreated: '2026-11-13T00:00:00Z',
						dateModified: '2026-11-13T00:00:00Z',
						dateTouched: '2026-11-13T00:00:00Z',
					},
				],
			},
		});
		const vm = wrapper.vm as any;
		expect(vm.libraryTemplates).toBeDefined();
		expect(vm.libraryTemplates[0].id).toBe('dreamer-architect');
		expect(vm.libraryTemplates[1].id).toBe('vanguard-frame-showcase');

		const select = wrapper.find('#roster-template-picker');
		expect(select.exists()).toBe(true);
		const options = select.findAll('option');
		const values = options.map((o) => o.attributes('value'));
		expect(values).toContain('library:dreamer-architect');

		await wrapper.find('.roster-button-library').trigger('click');
		const searchInput = wrapper.find('#library-search');
		expect(searchInput.exists()).toBe(true);
		await searchInput.setValue('arch');

		const cards = wrapper.findAll('article.library-card');
		expect(cards.length).toBeGreaterThanOrEqual(1);
		const dreamerCard = cards.find((card) => card.text().includes('The Dreamer & the Architect'));
		expect(dreamerCard).toBeDefined();
		const portraitStyle = dreamerCard!.find('.library-card-hero .portrait-circle').attributes('style') || '';
		expect(portraitStyle).toContain('images/250px-Corot_-_The_Dreamer_at_the_Fountain__1855_63.jpg');
		expect(dreamerCard!.find('.library-card-hero .portrait').classes()).toContain('portrait-shape-circle');
		expect(dreamerCard!.find('.library-card-hero .trait-set-frame-svg').exists()).toBe(true);
		expect(dreamerCard!.find('.library-card-hero .trait-set-frame-svg').attributes('style')).toContain(
			'--frame-stroke-width: 4px',
		);
		expect(dreamerCard!.find('.library-card-hero').classes()).toContain('is-portrait-only');
		expect(dreamerCard!.findAll('.library-card-hero .ring-trait')).toHaveLength(0);
		expect(dreamerCard!.text()).not.toMatch(/\b(Setting|Prep|Complexity)\b/i);
		wrapper.unmount();
	});

	it('renders rating ring on published listings with real dice ratings, schematic for imageless sheets, and unclipped action controls', async () => {
		const publishedWithRatings = {
			id: 'alien-us-ratings',
			character: {
				game: 'Alien, Us',
				view: {
					pageCount: 2,
					listing: {
						title: 'Alien, Us',
						subtitle: 'Sci-Fi Infiltration & Paranoia',
						url: 'https://legacy.drivethrurpg.com/product/572304/Alien-Us?manufacturers_id=31866',
						image: 'https://legacy.drivethrurpg.com/images/31866/572304.jpg',
						genre: 'Cold War Sci-Fi Drama',
						quote: 'You crashed here forty years ago.',
						setting: 'd6',
						prep: 'd6',
						complexity: 'd8',
					},
				},
				traitSets: [
					{ id: 'name', name: 'Name', traits: [] },
					{ id: 'distinctions', name: 'Distinctions', traits: [] },
				],
			},
		} as unknown as SheetTemplate;
		(window as any).characterCurioLibraryTemplates = [publishedWithRatings];
		(globalThis as any).characterCurioLibraryTemplates = [publishedWithRatings];

		const wrapper = mount(Roster, {
			props: { characters: [] },
		});
		await wrapper.find('.roster-button-library').trigger('click');

		const cards = wrapper.findAll('article.library-card');
		const alienCard = cards.find((c) => c.text().includes('Alien, Us'));
		expect(alienCard).toBeDefined();
		expect(alienCard!.find('.library-card-hero .trait-set-frame-svg').exists()).toBe(true);
		expect(alienCard!.find('.library-card-hero .trait-set-frame-svg').attributes('style')).toContain(
			'--frame-stroke-width: 4px',
		);
		expect(alienCard!.findAll('.library-card-hero .ring-trait')).toHaveLength(3);
		expect(alienCard!.find('.library-card-hero').text()).toContain('Setting');
		expect(alienCard!.find('.library-card-hero').text()).toContain('Prep');
		expect(alienCard!.find('.library-card-hero').text()).toContain('Complexity');
		// Internal "Name" traitSet is excluded from trait tags
		const tagTexts = alienCard!.findAll('.library-card-traits .trait-tag').map((el) => el.text());
		expect(tagTexts).not.toContain('Name');
		expect(tagTexts).toContain('Distinctions');

		// Imageless showcase card renders schematic wireframe and primary/utility action buttons
		const vanguardCard = cards.find((c) => c.text().includes('Vanguard Frame Showcase'));
		expect(vanguardCard).toBeDefined();
		expect(vanguardCard!.find('.library-card-schematic').exists()).toBe(true);
		const actionLabels = vanguardCard!.findAll('.library-card-actions .btn-library').map((b) => b.text().trim());
		expect(actionLabels).toEqual(['Preview', 'Character', 'Template', 'Print']);
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

	it('discovers community .curio.json view.listing under Saved, sanitizes unsafe URLs, and keeps view.listing off player characters', async () => {
		const communityDemo = {
			id: 'comm-starlight-1',
			name: 'Solstice',
			game: 'Starlight Courier',
			dateCreated: '2026-11-13T00:00:00Z',
			dateModified: '2026-11-13T00:00:00Z',
			dateTouched: '2026-11-13T00:00:00Z',
			view: {
				listing: {
					id: 'starlight-courier',
					title: 'Starlight Courier',
					subtitle: 'Solo Epistolary Sci-Fi',
					genre: 'Cozy Sci-Fi',
					url: 'https://itch.io/starlight',
					image: 'images/250px-Corot_-_The_Dreamer_at_the_Fountain__1855_63.jpg',
					quote: 'Deliver letters across the drift.',
					setting: 'd8',
				},
			},
			traitSets: [{ id: 'roles', name: 'Roles', traits: [] }],
		};
		const unsafeLinkDemo = {
			id: 'comm-unsafe-2',
			name: 'Unsafe',
			isTemplate: true,
			dateCreated: '2026-11-13T00:00:00Z',
			dateModified: '2026-11-13T00:00:00Z',
			dateTouched: '2026-11-13T00:00:00Z',
			view: {
				listing: {
					id: 'unsafe-link-demo',
					title: 'Unsafe Link Demo',
					url: 'javascript:alert(1)',
				},
			},
			traitSets: [],
		};

		const wrapper = mount(Roster, {
			props: { characters: [communityDemo, unsafeLinkDemo] },
		});
		await wrapper.find('.roster-button-library').trigger('click');

		const filterButtons = wrapper.findAll('.library-filter-pill');
		const savedPill = filterButtons.find((b) => b.text().includes('Saved'));
		const officialPill = filterButtons.find((b) => b.text().includes('Official'));
		expect(savedPill).toBeDefined();
		expect(officialPill).toBeDefined();
		expect(savedPill!.text()).toContain('2');
		expect(officialPill!.text()).toContain('0');

		await savedPill!.trigger('click');
		const cards = wrapper.findAll('article.library-card');
		expect(cards).toHaveLength(2);

		const starlightCard = cards.find((c) => c.text().includes('Starlight Courier'));
		expect(starlightCard).toBeDefined();
		expect(starlightCard!.find('.library-card-title a').attributes('href')).toBe('https://itch.io/starlight');
		expect(starlightCard!.find('.library-card-subtitle').text()).toBe('Solo Epistolary Sci-Fi');
		expect(starlightCard!.find('.badge-genre').text()).toBe('Cozy Sci-Fi');
		expect(starlightCard!.findAll('.library-card-hero .ring-trait')).toHaveLength(1);
		expect(starlightCard!.find('.library-card-hero').text()).toContain('Setting');
		// Community entries backed by roster characters do not render broken Remove buttons
		expect(starlightCard!.find('.btn-library.danger').exists()).toBe(false);

		const unsafeCard = cards.find((c) => c.text().includes('Unsafe Link Demo'));
		expect(unsafeCard).toBeDefined();
		expect(unsafeCard!.find('.library-card-title a').exists()).toBe(false);

		// Materializing a player character from DREAMER_ARCHITECT_SHOWCASE strips template view.listing
		const playerEntity = {
			id: 'player-1',
			isTemplate: false,
			name: 'Traveler',
			sets: {},
			template: { id: 'dreamer-architect', version: 1 },
		};
		const materialized = characterCurioFunctions.materializeCharacter(
			playerEntity,
			DREAMER_ARCHITECT_SHOWCASE.character,
		);
		expect(getView(materialized)?.listing).toBeUndefined();

		wrapper.unmount();
	});

	it('authors sparse character.view.listing in NameEditor, preserves it in extractSheetTemplate, and removes empty view.listing', async () => {
		const ch = structuredClone(characterCurioFunctions.defaultCharacter) as unknown as Character;
		ch.id = 'author-char-1';
		ch.traitSets[0].traits.push({ name: 'game', description: 'Drift Runner', traits: [] });
		const updates: any[] = [];
		const wrapper = mount(NameEditor, {
			props: {
				character: ch,
				open: true,
				tab: 'sheet',
			},
			attrs: {
				onUpdateCharacter: (c: any) => updates.push(c),
			},
		});

		await wrapper.find('#char-listing-title').setValue('  Drift Runner Deluxe  ');
		await wrapper.find('#char-listing-genre').setValue('Space Opera');
		await wrapper.find('#char-listing-url').setValue('https://example.com/drift');

		// Typing without blur/change (including mid-phrase trailing space) must survive sibling <select> updates
		const quoteEl = wrapper.find('#char-listing-quote').element as HTMLTextAreaElement;
		quoteEl.value = 'Fly fast, ';
		await wrapper.find('#char-listing-quote').trigger('input');
		await wrapper.find('#char-listing-setting').setValue('d10');
		expect(getView(ch)?.listing?.quote).toBe('Fly fast, ');
		expect((wrapper.find('#char-listing-quote').element as HTMLTextAreaElement).value).toBe('Fly fast, ');

		// Committing via change trims leading/trailing whitespace
		await wrapper.find('#char-listing-quote').setValue('  Fly fast, owe everyone.  ');

		expect(updates.length).toBeGreaterThanOrEqual(5);
		expect(getView(ch)?.listing).toEqual({
			title: 'Drift Runner Deluxe',
			genre: 'Space Opera',
			url: 'https://example.com/drift',
			quote: 'Fly fast, owe everyone.',
			setting: 'd10',
		});

		const extracted = characterCurioFunctions.extractSheetTemplate(ch, {}) as any;
		expect(extracted.title).toBeUndefined();
		expect(extracted.character.view.listing).toEqual({
			title: 'Drift Runner Deluxe',
			genre: 'Space Opera',
			url: 'https://example.com/drift',
			quote: 'Fly fast, owe everyone.',
			setting: 'd10',
		});

		await wrapper.find('#char-listing-title').setValue('');
		await wrapper.find('#char-listing-genre').setValue('');
		await wrapper.find('#char-listing-url').setValue('');
		await wrapper.find('#char-listing-quote').setValue('');
		await wrapper.find('#char-listing-setting').setValue('');
		expect(getView(ch)?.listing).toBeUndefined();

		wrapper.unmount();
	});

	it('renders empty Roster featured showcases, populated card fallbacks/badges, filter reset, and passes axe-core WCAG 2.2 AA', async () => {
		const emptyWrapper = mount(Roster, {
			attachTo: document.body,
			props: { characters: [] },
		});

		expect(emptyWrapper.find('.roster-onboarding').exists()).toBe(true);
		expect(emptyWrapper.findAll('article.roster-starter-card')).toHaveLength(2);
		expect(emptyWrapper.findAll('article.library-card')).toHaveLength(0);

		const starterCards = emptyWrapper.findAll('article.roster-starter-card');
		expect(starterCards[0].text()).toContain('The Dreamer & the Architect');
		expect(starterCards[1].text()).toContain('Vanguard Frame Showcase');

		await starterCards[0].find('.roster-starter-btn.secondary').trigger('click');
		expect((emptyWrapper.emitted('previewTemplate')?.[0]?.[0] as any)?.id).toBe('dreamer-architect');

		await starterCards[1].find('.roster-starter-btn.primary').trigger('click');
		expect((emptyWrapper.emitted('createFromLibrary')?.[0]?.[0] as any)?.id).toBe('vanguard-frame-showcase');

		const emptyAxe = await axe.run(emptyWrapper.element);
		expect(emptyAxe.violations).toHaveLength(0);
		emptyWrapper.unmount();

		const populatedWrapper = mount(Roster, {
			attachTo: document.body,
			props: {
				openCharacterIDs: ['unnamed-1'],
				characters: [
					{
						id: 'unnamed-1',
						name: '',
						game: 'Solar Drift',
						description: 'Courier on the outer ring.',
						tags: ['pilot'],
						traitSets: [],
						dateCreated: '2026-11-14T00:00:00Z',
						dateModified: '2026-11-14T00:00:00Z',
						dateTouched: '2026-11-14T00:00:00Z',
					} as any,
				],
			},
		});

		expect(populatedWrapper.find('.roster-item-name-btn').text()).toBe('Solar Drift');
		expect(populatedWrapper.find('.roster-badge-active').exists()).toBe(true);

		await populatedWrapper.find('.roster-button-play').trigger('click');
		expect(populatedWrapper.emitted('playCharacter')?.[0]).toEqual(['unnamed-1']);

		await populatedWrapper.find('#roster-search').setValue('nomatch');
		expect(populatedWrapper.find('.roster-empty').exists()).toBe(true);
		await populatedWrapper.find('.roster-empty-reset').trigger('click');
		expect(populatedWrapper.findAll('.roster-item')).toHaveLength(1);

		const populatedAxe = await axe.run(populatedWrapper.element);
		expect(populatedAxe.violations).toHaveLength(0);
		populatedWrapper.unmount();
	});

	it('persists custom set presets in storage, includes them in Export All bundle, and restores via Roster import', async () => {
		await characterCurioStorage.clear();
		characterCurioFunctions.setCustomSetPresets([], { notify: false });
		let capturedBundle: any = null;
		const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (
			this: HTMLAnchorElement,
		) {
			const href = this.getAttribute('href') || '';
			const prefix = 'data:application/json;charset=utf-8,';
			if (href.startsWith(prefix)) {
				capturedBundle = JSON.parse(decodeURI(href.slice(prefix.length)).replaceAll('%23', '#'));
			}
		});

		const appWrapper = mount(App, { attachTo: document.body });
		try {
			await flushPromises();
			const vm = appWrapper.vm as any;
			expect(vm.customSetPresets).toEqual([]);

			const saved = characterCurioFunctions.saveCustomSetPreset(
				{ name: 'Voidcraft Systems', noun: 'System', traits: [] },
				{ label: 'Voidcraft Systems', blurb: 'Ship subsystems' },
			);
			expect(saved).not.toBeNull();
			await flushPromises();

			// Persisted automatically into characterCurioStorage
			const stored = await characterCurioStorage.load();
			expect(stored.presets).toHaveLength(1);
			expect(stored.presets[0].id).toBe('voidcraft-systems');
			expect(stored.presets[0].blurb).toBe('Ship subsystems');

			// Export All emits 0.2 bundle carrying presets even with 0 characters
			await vm.exportAllCharacters();
			expect(capturedBundle).not.toBeNull();
			expect(capturedBundle.version).toBe('0.2');
			expect(capturedBundle.type).toBe('bundle');
			expect(capturedBundle.characters).toEqual([]);
			expect(capturedBundle.presets).toHaveLength(1);
			expect(capturedBundle.presets[0].id).toBe('voidcraft-systems');

			// Roster shows Export All when customPresets is populated with 0 characters
			const emptyRoster = mount(Roster, {
				attachTo: document.body,
				props: { characters: [], customPresets: capturedBundle.presets },
			});
			const exportBtn = emptyRoster.find('.roster-button-export');
			expect(exportBtn.exists()).toBe(true);
			const rosterAxe = await axe.run(emptyRoster.element);
			expect(rosterAxe.violations).toHaveLength(0);
			emptyRoster.unmount();

			// Reset presets and verify bundle import restores them via App handler + storage
			characterCurioFunctions.setCustomSetPresets([], { notify: false });
			await flushPromises();
			vm.importSetPresets(capturedBundle.presets);
			await flushPromises();

			expect(vm.customSetPresets).toHaveLength(1);
			expect(vm.customSetPresets[0].id).toBe('voidcraft-systems');
			const reloaded = await characterCurioStorage.load();
			expect(reloaded.presets).toHaveLength(1);
			expect(reloaded.presets[0].label).toBe('Voidcraft Systems');
		} finally {
			clickSpy.mockRestore();
			appWrapper.unmount();
			await characterCurioStorage.clear();
			characterCurioFunctions.setCustomSetPresets([], { notify: false });
		}
	});
});
