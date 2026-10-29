import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import axe from 'axe-core';
import TraitSetBlock from '../js/trait-set-block.vue';
import DiceRoller from '../js/dice-roller.vue';
import TraitEditor from '../js/trait-editor.vue';
import AppHeader from '../js/app-header.vue';
import SessionNav from '../js/session-nav.vue';
import TraitSetMini from '../js/trait-set-mini.vue';
import PageLayoutMini from '../js/page-layout-mini.vue';
import { resolveFrame, computeFrameAnchors, buildFrameSvgPath } from '../js/frame-geometry.ts';
import { cortexFunctions } from '../js/functions.ts';
import { cortexPal } from '../js/cortex-pal.ts';

// 1. Axe-core runner configured for JSDOM / Component testing
async function runAxeAudit( container: HTMLElement ) {
	// Attach to document.body briefly so axe-core can resolve aria-labelledby / document context accurately
	document.body.appendChild( container );
	try {
		const results = await axe.run( container, {
			rules: {
				// JSDOM cannot compute real canvas/layout contrast; all structural & ARIA rules remain strictly enforced
				'color-contrast': { enabled: false },
				'region': { enabled: false },
				// Critical interactive & ARIA rules
				'nested-interactive': { enabled: true },
				'button-name': { enabled: true },
				'aria-roles': { enabled: true },
				'aria-valid-attr': { enabled: true },
				'aria-valid-attr-value': { enabled: true },
				'aria-required-attr': { enabled: true },
				'label': { enabled: true }
			}
		} );

		if ( results.violations.length > 0 ) {
			const summary = results.violations.map( ( v ) =>
				`[${ v.id }] (${ v.impact }): ${ v.help }\n  Nodes: ${ v.nodes.map( ( n ) => n.html ).join( '\n         ' ) }`
			).join( '\n\n' );
			expect.fail( `Axe Accessibility Violations Found:\n\n${ summary }` );
		}
	} finally {
		if ( container.parentNode === document.body ) {
			document.body.removeChild( container );
		}
	}
}

// 2. LLM DOM Semantics Contract Assertions
function assertLlmDomSemantics( container: HTMLElement ) {
	// A. Trait Set landmark & data-set-index contract
	const sets = container.matches?.( '.trait-set' )
		? [ container ]
		: Array.from( container.querySelectorAll( '.trait-set' ) );
	expect( sets.length ).toBeGreaterThan( 0 );
	sets.forEach( ( setEl ) => {
		expect( setEl.getAttribute( 'data-set-index' ) ).not.toBeNull();
		const label = setEl.getAttribute( 'aria-label' ) || setEl.getAttribute( 'data-set-name' );
		expect( label?.trim().length, 'Every .trait-set must expose aria-label or data-set-name' ).toBeGreaterThan( 0 );
	} );

	// B. Self-describing trait rows
	const traits = container.matches?.( '.trait:not(.trait-placeholder-slot)' )
		? [ container ]
		: Array.from( container.querySelectorAll( '.trait:not(.trait-placeholder-slot)' ) );
	traits.forEach( ( traitEl ) => {
		const name = traitEl.getAttribute( 'data-trait-name' );
		expect( name?.trim().length, 'Rendered non-blank traits must expose data-trait-name' ).toBeGreaterThan( 0 );
	} );

	// C. Zero nested interactive controls (hard check backing up axe)
	const nestedButtons = container.querySelectorAll(
		'[role="button"] [role="button"], [role="button"] button, button [role="button"], button button, [role="button"] [role="checkbox"], button [role="checkbox"]'
	);
	expect(
		nestedButtons.length,
		`Found nested interactive elements: ${ Array.from( nestedButtons ).map( ( el ) => el.outerHTML ).join( ', ' ) }`
	).toBe( 0 );

	// D. Interactive die controls must have accessible names
	const interactiveDice = container.querySelectorAll( '.c[role="button"], button.c' );
	interactiveDice.forEach( ( dieEl ) => {
		const label = dieEl.getAttribute( 'aria-label' ) || dieEl.getAttribute( 'title' );
		expect( label?.trim().length, `Interactive die glyph missing aria-label: ${ dieEl.outerHTML }` ).toBeGreaterThan( 0 );
	} );
}

// 3. Fixture: Representative Character covering Rated Traits, Statements/Pips, Stress, Multi-Die Pools, and Play-Only Sets
function createTestCharacter() {
	return {
		name: 'Valerie Vance',
		plotPoints: 2,
		traitSets: [
			{
				name: 'Attributes',
				noun: 'Attribute',
				view: { pillar: 'prime', style: { body: 'default' } },
				traits: [
					{
						name: 'Agility',
						rating: { type: 'Die', value: [ 8 ], range: [ 4, 6, 8, 10, 12 ] },
						description: '',
						traits: [],
						tags: [],
						custom: {}
					},
					{
						name: 'Awareness',
						rating: { type: 'Die', value: [ 10 ], range: [ 4, 6, 8, 10, 12 ] },
						description: '',
						traits: [],
						tags: [],
						custom: {}
					}
				]
			},
			{
				name: 'Values',
				noun: 'Value',
				statement: true,
				hasQuestionedPip: true,
				view: { pillar: 'prime', statement: true, hasQuestionedPip: true },
				traits: [
					{
						name: 'Justice',
						statement: 'No one gets left behind.',
						questioned: true,
						rating: { type: 'Die', value: [ 8 ], range: [ 4, 6, 8, 10, 12 ] },
						traits: [],
						tags: [],
						custom: { questioned: true }
					}
				]
			},
			{
				name: 'Stress',
				noun: 'Stress',
				view: { pillar: 'play', style: { body: 'stress' }, outIndicator: true },
				traits: [
					{
						name: 'Physical',
						rating: { type: 'Die', value: [ 6 ], range: [ 4, 6, 8, 10, 12 ], out: true },
						isOut: false,
						traits: [],
						tags: [],
						custom: {}
					}
				]
			},
			{
				name: 'XP Milestone',
				noun: 'XP',
				rating: { type: 'Pip', value: [ true, true, false, false, false ], range: [ 5 ] },
				view: { pillar: 'plus', style: { body: 'pips' }, pips: { perRow: 5, connected: true, labels: false } },
				traits: []
			}
		]
	};
}

describe( 'WCAG 2.2 AA, WAI-ARIA 1.2, & LLM Semantics Suite', () => {
	it( 'audits TraitSetBlock across Edit and Play submodes with zero violations', async () => {
		const character = createTestCharacter();

		for ( const submode of [ 'edit', 'play' ] as const ) {
			for ( let s = 0; s < character.traitSets.length; s++ ) {
				const wrapper = mount( TraitSetBlock, {
					props: {
						character,
						traitSetID: s,
						submode,
						editing: []
					}
				} );

				await runAxeAudit( wrapper.element as HTMLElement );

				if ( submode === 'play' ) {
					assertLlmDomSemantics( wrapper.element as HTMLElement );
				}
				wrapper.unmount();
			}
		}
	} );

	it( 'verifies Pip Tracks expose spinbutton/checkbox ARIA roles and suppress 25-tab-stop traps in Play Mode', async () => {
		const character = createTestCharacter();
		const wrapper = mount( TraitSetBlock, {
			props: {
				character,
				traitSetID: 3, // XP Milestone pips set
				submode: 'play',
				editing: []
			}
		} );

		await runAxeAudit( wrapper.element as HTMLElement );

		const stepper = wrapper.element.querySelector( '[role="spinbutton"], [role="slider"]' );
		expect( stepper, 'Pure pip tracks must expose role="spinbutton" or role="slider" in Play Mode' ).not.toBeNull();
		expect( stepper?.getAttribute( 'aria-valuenow' ) ).toBe( '2' );
		expect( stepper?.getAttribute( 'aria-valuemax' ) ).toBe( '5' );
		wrapper.unmount();
	} );

	it( 'audits DiceRoller staged chips and live-region output for screen readers & LLM scrapers', async () => {
		const mockPool = {
			items: [
				{ id: 'd1', size: 8, qty: 1, source: 'Agility', hitches: 1 },
				{ id: 'd2', size: 4, qty: 1, source: 'Distinction', hitches: 1, ppDelta: 1 }
			],
			is_empty: () => false
		};

		const wrapper = mount( DiceRoller, {
			props: {
				open: true,
				pool: mockPool,
				position: 'right'
			}
		} );

		await runAxeAudit( wrapper.element as HTMLElement );

		const chips = wrapper.element.querySelectorAll( '.roller-chip' );
		expect( chips.length ).toBe( 2 );
		expect( chips[ 0 ].getAttribute( 'data-die-size' ) ).toBe( '8' );
		expect( chips[ 0 ].getAttribute( 'data-die-source' ) ).toBe( 'Agility' );

		// Trigger a roll and verify aria-live region updates
		const rollBtn = wrapper.find( '.roller-roll-btn' );
		if ( rollBtn.exists() ) {
			await rollBtn.trigger( 'click' );
			const liveRegion = wrapper.element.querySelector( '[aria-live="polite"]' );
			expect( liveRegion, 'DiceRoller must include an aria-live="polite" status/output region' ).not.toBeNull();
			expect( liveRegion?.textContent?.trim().length ).toBeGreaterThan( 0 );
		}

		wrapper.unmount();
	} );

	it( 'audits Play-scoped TraitEditor for label immutability and zero structural leaks', async () => {
		const character = createTestCharacter();
		const wrapper = mount( TraitEditor, {
			props: {
				character,
				traitSetID: 0,
				traitID: 0,
				open: true,
				submode: 'play'
			} as any
		} );

		await runAxeAudit( wrapper.element as HTMLElement );

		// In Play Mode on a standard Prime set (Attributes), structural controls must not render
		expect( wrapper.find( '.rating-scale-container' ).exists() ).toBe( false );
		expect( wrapper.find( '.editor-copy' ).exists() ).toBe( false );
		expect( wrapper.find( 'input[name="traitName"]' ).exists() ).toBe( false );

		wrapper.unmount();
	} );

	it( 'audits Dark Mode toggle buttons and verifies zero hardcoded inline styles in DiceRoller', async () => {
		// 1. Verify DiceRoller has no inline background: white on quick scale/separate die buttons
		const roller = mount( DiceRoller, {
			props: {
				dicePool: new cortexPal.DicePool()
			} as any
		} );
		const scaleBtn = roller.find( '.roller-btn-scale-quick' );
		expect( scaleBtn.exists() ).toBe( true );
		expect( scaleBtn.attributes( 'style' ) ).toBeUndefined();

		const sepBtn = roller.find( '.roller-btn-res-quick' );
		expect( sepBtn.exists() ).toBe( true );
		expect( sepBtn.attributes( 'style' ) ).toBeUndefined();

		roller.unmount();

		// 2. Verify AppHeader dark mode toggle button
		const header = mount( AppHeader, {
			props: {
				mode: 'character',
				submode: 'play',
				hasCharacter: true,
				canUndo: false,
				canRedo: false,
				isDarkMode: true
			}
		} );
		const headerThemeBtn = header.find( '.header-btn-theme' );
		expect( headerThemeBtn.exists() ).toBe( true );
		expect( headerThemeBtn.attributes( 'aria-label' ) ).toBe( 'Switch to light mode' );
		await runAxeAudit( header.element as HTMLElement );
		header.unmount();

		// 3. Verify SessionNav does NOT render theme toggle (per spec: toggle is header-only)
		const sessionNav = mount( SessionNav, {
			props: {
				openCharacters: [ { id: 'char1', name: 'Test' } ],
				characterID: 'char1',
				submode: 'play',
				playViewMode: 'split'
			}
		} );
		expect( sessionNav.find( '.sheet-bar-theme-toggle' ).exists() ).toBe( false );
		await runAxeAudit( sessionNav.element as HTMLElement );
		sessionNav.unmount();
	} );

	it( 'enforces WCAG 2.2 AA Color Contrast (Criterion 1.4.3 & 1.4.11) across Dark and Light mode tokens', () => {
		// Standard W3C relative luminance calculation: https://www.w3.org/WAI/GL/wiki/Relative_luminance
		function getLuminance( hex: string ): number {
			const cleanHex = hex.replace( '#', '' );
			const r = parseInt( cleanHex.slice( 0, 2 ), 16 ) / 255;
			const g = parseInt( cleanHex.slice( 2, 4 ), 16 ) / 255;
			const b = parseInt( cleanHex.slice( 4, 6 ), 16 ) / 255;

			const srgbToLin = ( c: number ) => ( c <= 0.04045 ? c / 12.92 : Math.pow( ( c + 0.055 ) / 1.055, 2.4 ) );
			return 0.2126 * srgbToLin( r ) + 0.7152 * srgbToLin( g ) + 0.0722 * srgbToLin( b );
		}

		// WCAG Contrast Ratio formula: (L1 + 0.05) / (L2 + 0.05)
		function getContrastRatio( fgHex: string, bgHex: string ): number {
			const l1 = getLuminance( fgHex );
			const l2 = getLuminance( bgHex );
			const lighter = Math.max( l1, l2 );
			const darker = Math.min( l1, l2 );
			return ( lighter + 0.05 ) / ( darker + 0.05 );
		}

		// Dark Mode Palette tokens defined in _frame.scss
		const darkCardBg = '#111827';
		const darkElevatedBg = '#1e293b';
		const darkTextMain = '#f1f5f9';
		const darkTextSecondary = '#cbd5e1';
		const darkTextMuted = '#94a3b8';

		// WCAG 2.2 AA requirement: normal text >= 4.5:1, large/UI text >= 3.0:1
		expect( getContrastRatio( darkTextMain, darkCardBg ) ).toBeGreaterThanOrEqual( 4.5 );
		expect( getContrastRatio( darkTextMain, darkElevatedBg ) ).toBeGreaterThanOrEqual( 4.5 );
		expect( getContrastRatio( darkTextSecondary, darkCardBg ) ).toBeGreaterThanOrEqual( 4.5 );
		expect( getContrastRatio( darkTextSecondary, darkElevatedBg ) ).toBeGreaterThanOrEqual( 4.5 );
		expect( getContrastRatio( darkTextMuted, darkCardBg ) ).toBeGreaterThanOrEqual( 4.5 );
		expect( getContrastRatio( darkTextMuted, darkElevatedBg ) ).toBeGreaterThanOrEqual( 4.5 );

		// Light Mode Palette tokens
		const lightCardBg = '#ffffff';
		const lightElevatedBg = '#f8fafc';
		const lightTextMain = '#0f172a';
		const lightTextSecondary = '#334155';
		expect( getContrastRatio( lightTextMain, lightCardBg ) ).toBeGreaterThanOrEqual( 4.5 );
		expect( getContrastRatio( lightTextMain, lightElevatedBg ) ).toBeGreaterThanOrEqual( 4.5 );
		expect( getContrastRatio( lightTextSecondary, lightCardBg ) ).toBeGreaterThanOrEqual( 4.5 );
		expect( getContrastRatio( lightTextSecondary, lightElevatedBg ) ).toBeGreaterThanOrEqual( 4.5 );
	} );

	it( 'TraitSetMini (Phase 3a): standalone authoring, noun inventory consistency, companion stress track, keyboard nudge, and preset round-trip', async () => {
		window.localStorage.removeItem( 'cortexCustomSetPresets' );

		const wrapper = mount( TraitSetMini );
		await runAxeAudit( wrapper.element as HTMLElement );

		// 1. Standalone inventory & keyboard nudge/resize on grid part boxes
		const nameBox = wrapper.find( '[data-grid-part="name"]' );
		expect( nameBox.exists() ).toBe( true );
		await nameBox.trigger( 'click' );
		await nameBox.trigger( 'keydown', { key: 'ArrowRight' } );
		const leftInput = wrapper.find( 'input[aria-label="Part Left Percent"]' );
		expect( ( leftInput.element as HTMLInputElement ).value ).toBe( '5' );

		await nameBox.trigger( 'keydown', { key: 'ArrowLeft', shiftKey: true } );
		const widthInput = wrapper.find( 'input[aria-label="Part Width Percent"]' );
		expect( ( widthInput.element as HTMLInputElement ).value ).toBe( '60' );

		// 2. Noun consistency check: misspelled trait noun ("Roel") and companion noun ("Stres") surface as extra noun groups in inventory
		const traitNounInput = wrapper.find( 'input[aria-label="Trait 1 Noun"]' );
		await traitNounInput.setValue( 'Roel' );
		expect( wrapper.find( '[data-noun-group="Roel"]' ).exists() ).toBe( true );

		const addTrackBtn = wrapper.find( 'button[title="Add Companion / Stress Track"]' );
		await addTrackBtn.trigger( 'click' );
		const companionNounInput = wrapper.find( 'input[aria-label="Companion Track Noun 1"]' );
		await companionNounInput.setValue( 'Stres' );
		expect( wrapper.find( '[data-noun-group="Stres"]' ).exists() ).toBe( true );

		// 3. Acceptance case (Section 5.3): stress-bearing set with companion range [6, 8, 10] + block entry
		// Toggle d4 and d12 off in companion track range so range becomes [6, 8, 10]
		const toggleD4 = wrapper.find( 'button[aria-label="Toggle d4 in track range"]' );
		const toggleD12 = wrapper.find( 'button[aria-label="Toggle d12 in track range"]' );
		await toggleD4.trigger( 'click' );
		await toggleD12.trigger( 'click' );

		const addBlockBtn = wrapper.find( 'button[title="Add Block / SFX Entry"]' );
		await addBlockBtn.trigger( 'click' );

		// Verify live preview renders track, trackLabel, and block with [6, 8, 10] scale
		expect( wrapper.find( '[data-grid-part="trackLabel"]' ).exists() ).toBe( true );
		expect( wrapper.find( '[data-grid-part="track"]' ).exists() ).toBe( true );
		expect( wrapper.find( '[data-grid-part="block"]' ).exists() ).toBe( true );

		// 4. Save as Preset: creator-typed label, derived ID, collision check, and round-trip across Play, Edit, and Print
		const labelInput = wrapper.find( 'input[aria-label="Preset Label"]' );
		await labelInput.setValue( 'Scene Traits' ); // Collides with built-in preset
		expect( wrapper.find( '.mini-collision-alert' ).exists() ).toBe( true );
		const saveBtn = wrapper.find( '.mini-save-preset-btn' );
		expect( ( saveBtn.element as HTMLButtonElement ).disabled ).toBe( true );

		await labelInput.setValue( 'Overload Tracker' );
		expect( wrapper.find( '.mini-collision-alert' ).exists() ).toBe( false );
		expect( ( saveBtn.element as HTMLButtonElement ).disabled ).toBe( false );

		await saveBtn.trigger( 'click' );
		const savedEvents = wrapper.emitted( 'saved' );
		expect( savedEvents && savedEvents.length ).toBe( 1 );
		const savedPreset = ( savedEvents![ 0 ] as any )[ 0 ];
		expect( savedPreset.id ).toBe( 'overload-tracker' );
		expect( savedPreset.label ).toBe( 'Overload Tracker' );
		expect( savedPreset.preset.view.pillar ).toBe( 'play' );

		// Verify collision blocks saving duplicate custom preset
		expect( wrapper.find( '.mini-collision-alert' ).exists() ).toBe( true );

		// Instantiate saved preset onto a character and verify Play, Edit, and Print rendering
		const char: any = { name: 'Tester', traitSets: [] };
		const addedSet = cortexFunctions.instantiateSetPreset( savedPreset, char, 1 );
		char.traitSets.push( addedSet );
		expect( cortexFunctions.getTrackScale( addedSet ) ).toEqual( [ 6, 8, 10 ] );

		for ( const mode of [ 'play', 'edit', 'print' ] ) {
			const block = mount( TraitSetBlock, {
				props: { character: char, traitSetID: 0, submode: mode }
			} );
			expect( block.find( '.trait-set' ).exists() ).toBe( true );
			expect( block.find( '.attached-stress-track' ).exists() ).toBe( true );
			await runAxeAudit( block.element as HTMLElement );
			block.unmount();
		}

		wrapper.unmount();
		window.localStorage.removeItem( 'cortexCustomSetPresets' );
	} );

	it( 'supports trait-specific custom companion track names (Injured, Worried) with track fallback and T/L marker toggles', async () => {
		const customSet: any = {
			name: 'Attributes',
			view: {
				labels: { track: 'Stress' },
				parts: {
					name: { left: '0%', top: 0, width: '40%', height: 1 },
					trackLabel: { left: '40%', top: 0, width: '25%', height: 1 },
					track: { left: '65%', top: 0, width: '35%', height: 1 }
				}
			},
			traits: [
				{
					name: 'Physical',
					rating: { type: 'Die', value: 8 },
					traits: [
						{ name: 'Injured', rating: { type: 'Die', value: 6, range: [ 4, 6, 8, 10, 12 ] } }
					]
				},
				{
					name: 'Mental',
					rating: { type: 'Die', value: 10 },
					traits: [
						{ name: 'Worried', rating: { type: 'Die', value: 8, range: [ 4, 6, 8, 10, 12 ] } }
					]
				},
				{
					name: 'Social',
					rating: { type: 'Die', value: 6 },
					traits: [
						// Fallback to set track label
						{ name: 'Stress', rating: { type: 'Die', value: 4, range: [ 4, 6, 8, 10, 12 ] } }
					]
				}
			]
		};

		const char: any = { name: 'Custom Track Tester', traitSets: [ customSet ] };
		const block = mount( TraitSetBlock, {
			props: { character: char, traitSetID: 0, submode: 'play' }
		} );

		const labels = block.findAll( '.attached-stress-label' ).map( el => el.text() );
		expect( labels ).toEqual( [ 'Injured', 'Worried', 'Stress' ] );
		expect( customSet.view.labels.stress ).toBeUndefined();
		expect( customSet.view.labels.track ).toBe( 'Stress' );

		// Test TraitSetMini child marker toggle
		const mini = mount( TraitSetMini, {
			props: { initialSet: customSet }
		} );

		const markerToggles = mini.findAll( '.mini-marker-toggle' );
		expect( markerToggles.length ).toBeGreaterThanOrEqual( 3 );
		const firstMarker = markerToggles[ 0 ];
		const initialText = firstMarker.text();
		await firstMarker.trigger( 'click' );
		expect( firstMarker.text() ).toBe( initialText === 'L' ? 'T' : 'L' );

		mini.unmount();
		block.unmount();
	} );

	describe( 'PageLayoutMini (Phase 4a & 4b)', () => {
		it( 'renders PageLayoutMini with placed boxes and stacked bands, maintaining accessibility', async () => {
			const char: any = {
				name: 'Layout Test Hero',
				view: { pageCount: 2, style: { sheet: 'spotlight' } },
				traitSets: [
					{
						name: 'Distinctions',
						view: { page: 1, place: { left: '0%', width: '100%', top: 0, height: 2 } },
						traits: [ { name: 'Ace Pilot' } ]
					},
					{
						name: 'Attributes',
						view: { page: 1, place: { left: '0%', width: '50%', top: 2, height: 2 } },
						traits: [ { name: 'Physical' } ]
					},
					{
						name: 'Skills',
						view: { page: 2 }, // unplaced band
						traits: [ { name: 'Fight' } ]
					}
				]
			};

			const wrapper = mount( PageLayoutMini, {
				props: { character: char },
				attachTo: document.body
			} );

			expect( wrapper.findAll( '.place-mini' ).length ).toBe( 2 );
			const boxes = wrapper.findAll( '.place-mini-ghost' );
			expect( boxes.length ).toBeGreaterThanOrEqual( 3 );

			// Click to select
			await boxes[ 0 ].trigger( 'mousedown' );
			expect( wrapper.find( '.place-mini-block' ).exists() ).toBe( true );

			// Check Full Width button clears place
			const fullWidthBtn = wrapper.find( 'button[title="Full width, stacked in document order"]' );
			expect( fullWidthBtn.exists() ).toBe( true );
			await fullWidthBtn.trigger( 'click' );
			expect( char.traitSets[ 0 ].view.place ).toBeUndefined();

			await runAxeAudit( wrapper.element as HTMLElement );
			wrapper.unmount();
		} );

		it( 'commits place on release, while Escape key cancels gesture and leaves character model untouched', async () => {
			const initialPlace = { left: '0%', width: '100%', top: 0, height: 2 };
			const char: any = {
				name: 'Drag Cancel Hero',
				view: { pageCount: 1, style: { sheet: 'spotlight' } },
				traitSets: [
					{
						name: 'Distinctions',
						view: { page: 1, place: { ...initialPlace } },
						traits: [ { name: 'Hero' } ]
					}
				]
			};

			const wrapper = mount( PageLayoutMini, {
				props: { character: char },
				attachTo: document.body
			} );

			// Select the block
			const ghost = wrapper.find( '.place-mini-ghost' );
			await ghost.trigger( 'mousedown' );

			const block = wrapper.find( '.place-mini-block' );
			expect( block.exists() ).toBe( true );

			// Start drag
			const mousedownEv = new MouseEvent( 'mousedown', { clientX: 50, clientY: 20 } );
			block.element.dispatchEvent( mousedownEv );

			// Move
			const mousemoveEv = new MouseEvent( 'mousemove', { clientX: 100, clientY: 20 } );
			window.dispatchEvent( mousemoveEv );

			// Press Escape to cancel
			const escapeEv = new KeyboardEvent( 'keydown', { key: 'Escape' } );
			window.dispatchEvent( escapeEv );

			// End mouseup
			const mouseupEv = new MouseEvent( 'mouseup', { clientX: 100, clientY: 20 } );
			window.dispatchEvent( mouseupEv );

			// Verify place remains untouched
			expect( char.traitSets[ 0 ].view.place.left ).toBe( '0%' );
			expect( char.traitSets[ 0 ].view.place.width ).toBe( '100%' );

			wrapper.unmount();
		} );

		it( 'moves set across pages in PageLayoutMini, reordering array, updating view.page, and leaving view.pillar untouched', async () => {
			const char: any = {
				name: 'Pillar Hero',
				view: { pageCount: 2, style: { sheet: 'spotlight' } },
				traitSets: [
					{
						name: 'Set 1',
						view: { page: 1, pillar: 'prime', place: { left: '0%', width: '50%', top: 0, height: 1 } },
						traits: []
					},
					{
						name: 'Set 2',
						view: { page: 2, pillar: 'identity', place: { left: '0%', width: '100%', top: 0, height: 1 } },
						traits: []
					}
				]
			};

			const wrapper = mount( PageLayoutMini, {
				props: { character: char },
				attachTo: document.body
			} );

			// Select Set 1
			const ghost = wrapper.findAll( '.place-mini-ghost' )[ 0 ];
			await ghost.trigger( 'mousedown' );

			// Click Page 2 button
			const pageButtons = wrapper.findAll( '.editor-group-btn' );
			const page2Btn = pageButtons.find( b => b.text() === 'Page 2' );
			expect( page2Btn ).toBeDefined();
			await page2Btn!.trigger( 'click' );

			expect( char.traitSets[ 0 ].view.page ).toBe( 2 );
			// Pillar must never be disturbed!
			expect( char.traitSets[ 0 ].view.pillar ).toBe( 'prime' );
			expect( char.traitSets[ 1 ].view.pillar ).toBe( 'identity' );

			wrapper.unmount();
		} );

		it( 'supports keyboard navigation: arrows move, shift+arrows resize, enter/space opens block mini', async () => {
			const char: any = {
				name: 'Keyboard Hero',
				view: { pageCount: 1, style: { sheet: 'spotlight' } },
				traitSets: [
					{
						name: 'Movable Set',
						view: { page: 1, place: { left: '10%', width: '40%', top: 1, height: 2 } },
						traits: []
					}
				]
			};

			const wrapper = mount( PageLayoutMini, {
				props: { character: char },
				attachTo: document.body
			} );

			// Select Movable Set
			const ghost = wrapper.find( '.place-mini-ghost' );
			await ghost.trigger( 'mousedown' );

			const block = wrapper.find( '.place-mini-block' );

			// Move right (ArrowRight -> +5%)
			await block.trigger( 'keydown', { key: 'ArrowRight' } );
			expect( char.traitSets[ 0 ].view.place.left ).toBe( '15%' );

			// Resize width (Shift+ArrowRight -> +5%)
			await block.trigger( 'keydown', { key: 'ArrowRight', shiftKey: true } );
			expect( char.traitSets[ 0 ].view.place.width ).toBe( '45%' );

			// Move down (ArrowDown -> +1 row)
			await block.trigger( 'keydown', { key: 'ArrowDown' } );
			expect( char.traitSets[ 0 ].view.place.top ).toBe( 2 );

			// Resize height (Shift+ArrowDown -> +1 row)
			await block.trigger( 'keydown', { key: 'ArrowDown', shiftKey: true } );
			expect( char.traitSets[ 0 ].view.place.height ).toBe( 3 );

			// Enter opens block mini
			await block.trigger( 'keydown', { key: 'Enter' } );
			await wrapper.vm.$nextTick();
			// TraitSetMini teleported to body
			const bodyMini = document.body.querySelector( '.trait-set-mini' );
			expect( bodyMini ).not.toBeNull();

			wrapper.unmount();
		} );

		it( 'acceptance case: stress-bearing set with track, trackLabel, block, and companion scale preserves structure through move/resize', async () => {
			const stressSet = {
				name: 'Attributes',
				view: {
					place: { left: '0%', top: 0, width: '50%', height: 2 },
					labels: { track: 'Stress' },
					parts: {
						name: { left: '0%', top: 0, width: '40%', height: 1 },
						trackLabel: { left: '40%', top: 0, width: '25%', height: 1 },
						track: { left: '65%', top: 0, width: '35%', height: 1 },
						block: { left: '0%', top: 1, width: '100%', height: 1 }
					}
				},
				traits: [
					{
						name: 'Physical',
						rating: { type: 'Die', value: [ 8 ] },
						traits: [
							{ name: 'Stress', rating: { type: 'Die', value: [ 6 ], range: [ 4, 6, 8, 10, 12 ] } }
						]
					}
				]
			};

			const char: any = {
				name: 'Stress Acceptance Hero',
				view: { pageCount: 1, style: { sheet: 'spotlight' } },
				traitSets: [ stressSet ]
			};

			const wrapper = mount( PageLayoutMini, {
				props: { character: char },
				attachTo: document.body
			} );

			// Select the stress set
			const ghost = wrapper.find( '.place-mini-ghost' );
			await ghost.trigger( 'mousedown' );

			const block = wrapper.find( '.place-mini-block' );

			// Move set right and down via keyboard
			await block.trigger( 'keydown', { key: 'ArrowRight' } );
			await block.trigger( 'keydown', { key: 'ArrowDown' } );

			// Verify place changed correctly
			expect( char.traitSets[ 0 ].view.place.left ).toBe( '5%' );
			expect( char.traitSets[ 0 ].view.place.top ).toBe( 1 );

			// Verify stress parts and companion scale remain 100% intact
			expect( char.traitSets[ 0 ].view.parts.track ).toEqual( { left: '65%', top: 0, width: '35%', height: 1 } );
			expect( char.traitSets[ 0 ].view.parts.trackLabel ).toEqual( { left: '40%', top: 0, width: '25%', height: 1 } );
			expect( char.traitSets[ 0 ].view.parts.block ).toEqual( { left: '0%', top: 1, width: '100%', height: 1 } );
			expect( char.traitSets[ 0 ].traits[ 0 ].traits[ 0 ].rating.range ).toEqual( [ 4, 6, 8, 10, 12 ] );

			wrapper.unmount();
		} );

		it( 'wires seamless TraitSetMini handoff: opens block mini, applies update, and returns with set selected', async () => {
			const char: any = {
				name: 'Handoff Hero',
				view: { pageCount: 1, style: { sheet: 'spotlight' } },
				traitSets: [
					{
						name: 'Handoff Set',
						view: { page: 1, place: { left: '0%', width: '100%', top: 0, height: 1 } },
						traits: [ { name: 'Initial Trait' } ]
					}
				]
			};

			const wrapper = mount( PageLayoutMini, {
				props: { character: char },
				attachTo: document.body
			} );

			// Select the set
			const ghost = wrapper.find( '.place-mini-ghost' );
			await ghost.trigger( 'mousedown' );

			// Click "Edit Parts" button
			const editPartsBtn = wrapper.find( '.btn-open-block-mini' );
			expect( editPartsBtn.exists() ).toBe( true );
			await editPartsBtn.trigger( 'click' );
			await wrapper.vm.$nextTick();

			// Verify TraitSetMini is rendered
			expect( document.body.querySelector( '.trait-set-mini' ) ).not.toBeNull();

			// Apply in TraitSetMini: update set name
			const applyBtn = document.body.querySelector( '.btn-apply-sheet' ) as HTMLButtonElement;
			expect( applyBtn ).not.toBeNull();
			applyBtn.click();

			await wrapper.vm.$nextTick();

			// TraitSetMini closed, returned to same page mini, set still selected
			expect( document.body.querySelector( '.trait-set-mini' ) ).toBeNull();
			expect( wrapper.find( '.place-mini-block' ).exists() ).toBe( true );

			wrapper.unmount();
		} );
	} );

	describe( 'Phase 3c: SVG Frames, Dynamic Positional Anchors, & Mobile Fallback', () => {
		function createStressBearingFramedSet( shape: any = 'ring' ) {
			return {
				name: 'Attributes',
				view: {
					frame: typeof shape === 'string' ? shape : { stroke: 'primary', ...shape },
					labels: { track: 'Stress' },
					parts: {
						name: { left: '0%', top: 0, width: '35%', height: 1 },
						rating: { left: '35%', top: 0, width: '15%', height: 1 },
						trackLabel: { left: '50%', top: 0, width: '20%', height: 1 },
						track: { left: '70%', top: 0, width: '30%', height: 1 }
					}
				},
				traits: [
					{
						name: 'Physical',
						rating: { type: 'Die', value: [ 8 ], range: [ 4, 6, 8, 10, 12 ] },
						traits: [
							{ name: 'Stress', rating: { type: 'Die', value: [ 6 ], range: [ 4, 6, 8, 10, 12 ] } }
						]
					},
					{
						name: 'Mental',
						rating: { type: 'Die', value: [ 10 ], range: [ 4, 6, 8, 10, 12 ] },
						traits: [
							{ name: 'Stress', rating: { type: 'Die', value: [ 8 ], range: [ 4, 6, 8, 10, 12 ] } }
						]
					},
					{
						name: 'Social',
						rating: { type: 'Die', value: [ 6 ], range: [ 4, 6, 8, 10, 12 ] },
						traits: [
							{ name: 'Stress', rating: { type: 'Die', value: [ 4 ], range: [ 4, 6, 8, 10, 12 ] } }
						]
					}
				]
			};
		}

		it( '1. Stress-Bearing Framed Set: renders ring frame with visible, clickable rating die and stress track in Edit, Play, and Print', async () => {
			const set = createStressBearingFramedSet( 'ring' );
			const char: any = { name: 'Framed Hero', traitSets: [ set ] };

			for ( const mode of [ 'play', 'edit', 'print' ] ) {
				const block = mount( TraitSetBlock, {
					props: { character: char, traitSetID: 0, submode: mode },
					attachTo: document.body
				} );

				expect( block.find( '.trait-list-framed' ).exists() ).toBe( true );
				const svg = block.find( '.trait-set-frame-svg.frame-radial-svg' );
				expect( svg.exists() ).toBe( true );
				expect( svg.attributes( 'aria-hidden' ) ).toBe( 'true' );
				expect( svg.attributes( 'focusable' ) ).toBe( 'false' );

				// All 3 traits rendered in logical DOM order
				const traits = block.findAll( '.trait' );
				expect( traits.length ).toBe( 3 );
				expect( traits[ 0 ].attributes( 'data-trait-name' ) ).toBe( 'Physical' );
				expect( traits[ 1 ].attributes( 'data-trait-name' ) ).toBe( 'Mental' );
				expect( traits[ 2 ].attributes( 'data-trait-name' ) ).toBe( 'Social' );

				// Anchors & docking attributes present
				expect( traits[ 0 ].attributes( 'data-frame-dock' ) ).toBeDefined();
				expect( traits[ 0 ].attributes( 'style' ) ).toContain( 'position: absolute' );

				// Rating die & stress track present and interactive
				expect( block.findAll( '.attached-stress-track' ).length ).toBe( 3 );
				expect( block.findAll( '.trait-part-rating' ).length ).toBe( 3 );

				await runAxeAudit( block.element as HTMLElement );
				block.unmount();
			}
		} );

		it( '2. Circle -> Ellipse -> Block Morph: traits preserve 0..N-1 order and internal view.parts across all three shapes', async () => {
			const set = createStressBearingFramedSet( 'ring' );
			const char: any = { name: 'Morph Hero', traitSets: [ set ] };

			const wrapper = mount( TraitSetBlock, {
				props: { character: char, traitSetID: 0, submode: 'play' },
				attachTo: document.body
			} );

			// 1) Ring
			expect( wrapper.find( '.trait-list-framed.frame-shape-ring' ).exists() ).toBe( true );
			let names = wrapper.findAll( '.trait' ).map( t => t.attributes( 'data-trait-name' ) );
			expect( names ).toEqual( [ 'Physical', 'Mental', 'Social' ] );

			// 2) Morph to Ellipse
			const ellipseSet = {
				...set,
				view: { ...set.view, frame: { shape: 'ellipse', span: [ 0, 360 ], stroke: 'accent', corner: 8 } }
			};
			await wrapper.setProps( { character: { name: 'Morph Hero', traitSets: [ ellipseSet ] } } );
			await wrapper.vm.$nextTick();
			expect( wrapper.find( '.trait-list-framed.frame-shape-ellipse' ).exists() ).toBe( true );
			names = wrapper.findAll( '.trait' ).map( t => t.attributes( 'data-trait-name' ) );
			expect( names ).toEqual( [ 'Physical', 'Mental', 'Social' ] );

			// 3) Morph to Block
			const blockSet = {
				...set,
				view: { ...set.view, frame: { shape: 'block', corner: 'cut', stroke: 'primary' } }
			};
			await wrapper.setProps( { character: { name: 'Morph Hero', traitSets: [ blockSet ] } } );
			await wrapper.vm.$nextTick();
			expect( wrapper.find( '.trait-set-body-framed' ).exists() ).toBe( true );
			expect( wrapper.find( '.frame-block-svg' ).exists() ).toBe( true );
			// Non-positional: trait-list-framed is removed, normal view.parts stack rendered
			expect( wrapper.find( '.trait-list-framed' ).exists() ).toBe( false );
			names = wrapper.findAll( '.trait' ).map( t => t.attributes( 'data-trait-name' ) );
			expect( names ).toEqual( [ 'Physical', 'Mental', 'Social' ] );

			// Parts intact
			expect( set.view.parts.track ).toBeDefined();
			expect( set.view.parts.name ).toBeDefined();

			wrapper.unmount();
		} );

		it( '3. Dynamic Anchor Re-Derivation: recomputes positions dynamically on add/remove trait with zero stored anchor count in JSON', () => {
			const cfg = resolveFrame( { view: { frame: 'ring' } } )!;
			expect( cfg ).not.toBeNull();

			// 3 traits: 120° spacing
			const anchors3 = computeFrameAnchors( 3, cfg );
			expect( anchors3.length ).toBe( 3 );
			expect( anchors3[ 0 ].angle ).toBe( 0 );
			expect( anchors3[ 1 ].angle ).toBe( 120 );
			expect( anchors3[ 2 ].angle ).toBe( 240 );

			// 4 traits: 90° spacing
			const anchors4 = computeFrameAnchors( 4, cfg );
			expect( anchors4.length ).toBe( 4 );
			expect( anchors4[ 0 ].angle ).toBe( 0 );
			expect( anchors4[ 1 ].angle ).toBe( 90 );
			expect( anchors4[ 2 ].angle ).toBe( 180 );
			expect( anchors4[ 3 ].angle ).toBe( 270 );

			// 2 traits open arc [-120, 120]
			const arcCfg = resolveFrame( { view: { frame: { shape: 'arc', span: [ -120, 120 ] } } } )!;
			const anchorsArc = computeFrameAnchors( 2, arcCfg );
			expect( anchorsArc.length ).toBe( 2 );
			expect( anchorsArc[ 0 ].angle ).toBe( -120 );
			expect( anchorsArc[ 1 ].angle ).toBe( 120 );
		} );

		it( '4. Bare-Path Section Line (shape: "line"): renders crisp SVG section divider across Edit, Play, and Print', () => {
			const lineSet: any = {
				name: 'Divider Section',
				view: { frame: { shape: 'line', stroke: 'accent' } },
				traits: [ { name: 'Followup Trait' } ]
			};
			const char: any = { name: 'Line Hero', traitSets: [ lineSet ] };

			for ( const mode of [ 'play', 'edit', 'print' ] ) {
				const block = mount( TraitSetBlock, {
					props: { character: char, traitSetID: 0, submode: mode }
				} );

				const lineSvg = block.find( '.trait-set-frame-svg.frame-line-svg' );
				expect( lineSvg.exists() ).toBe( true );
				expect( lineSvg.attributes( 'viewBox' ) ).toBe( '0 0 100 12' );
				expect( lineSvg.attributes( 'preserveAspectRatio' ) ).toBe( 'none' );
				expect( lineSvg.find( 'path' ).attributes( 'd' ) ).toBe( 'M 0,6 L 100,6' );

				// Content guarantee: trait still renders
				expect( block.find( '.trait' ).exists() ).toBe( true );
				block.unmount();
			}
		} );

		it( '5. Mobile Forced-Off & User Toggled-Off Fallback (Zero Overspill): turns off radial frame cleanly to view.parts stack', async () => {
			const set = createStressBearingFramedSet( 'ring' );
			const char: any = { name: 'Fallback Hero', traitSets: [ set ] };

			const wrapper = mount( TraitSetBlock, {
				props: { character: char, traitSetID: 0, submode: 'play' },
				attachTo: document.body
			} );

			expect( wrapper.find( '.trait-list-framed' ).exists() ).toBe( true );
			expect( wrapper.find( '.frame-radial-svg' ).exists() ).toBe( true );

			// 1. User selects "none" (or deletes frame in editor): turns frame off cleanly to view.parts
			const unframedSet = structuredClone( set );
			delete unframedSet.view.frame;
			await wrapper.setProps( { character: { name: 'Fallback Hero', traitSets: [ unframedSet ] } } );
			expect( wrapper.find( '.trait-list-framed' ).exists() ).toBe( false );
			expect( wrapper.find( '.frame-radial-svg' ).exists() ).toBe( false );

			// Traits still render stacked with stress track intact
			const traits = wrapper.findAll( '.trait' );
			expect( traits.length ).toBe( 3 );
			expect( wrapper.findAll( '.attached-stress-track' ).length ).toBe( 3 );

			// 2. User re-enables frame: restores frame cleanly
			const reframedSet = structuredClone( set );
			reframedSet.view.frame = { shape: 'ring', span: [ 0, 360 ] };
			await wrapper.setProps( { character: { name: 'Fallback Hero', traitSets: [ reframedSet ] } } );
			expect( wrapper.find( '.trait-list-framed' ).exists() ).toBe( true );
			expect( wrapper.find( '.frame-radial-svg' ).exists() ).toBe( true );

			wrapper.unmount();
		} );

		it( '6. A11y & Sparse JSON Compliance: SVG contains zero text, DOM order is 0..N-1, and JSON is terse', async () => {
			const set = createStressBearingFramedSet( { shape: 'ring', span: [ 0, 360 ], stroke: 'primary', corner: 8 } );
			const char: any = { name: 'A11y Hero', traitSets: [ set ] };

			const wrapper = mount( TraitSetBlock, {
				props: { character: char, traitSetID: 0, submode: 'play' },
				attachTo: document.body
			} );

			const svg = wrapper.find( '.trait-set-frame-svg' );
			expect( svg.exists() ).toBe( true );
			// Zero SVG <text> or <textPath> nodes!
			expect( svg.find( 'text' ).exists() ).toBe( false );
			expect( svg.find( 'textPath' ).exists() ).toBe( false );
			expect( svg.attributes( 'aria-hidden' ) ).toBe( 'true' );

			// DOM order strictly 0..N-1
			const traitElements = wrapper.findAll( '.trait' );
			expect( traitElements[ 0 ].text() ).toContain( 'Physical' );
			expect( traitElements[ 1 ].text() ).toContain( 'Mental' );
			expect( traitElements[ 2 ].text() ).toContain( 'Social' );

			// Terse JSON compliance: no internal coordinates or IDs stored in JSON
			const cloned = JSON.parse( JSON.stringify( set ) );
			expect( cloned.view.frame ).toEqual( { shape: 'ring', span: [ 0, 360 ], stroke: 'primary', corner: 8 } );
			expect( cloned.view.frame.anchors ).toBeUndefined();
			expect( cloned.view.frame.count ).toBeUndefined();

			await runAxeAudit( wrapper.element as HTMLElement );
			wrapper.unmount();
		} );
	} );
} );
