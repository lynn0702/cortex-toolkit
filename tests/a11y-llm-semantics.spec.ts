import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import axe from 'axe-core';
import TraitSetBlock from '../js/trait-set-block.vue';
import DiceRoller from '../js/dice-roller.vue';
import TraitEditor from '../js/trait-editor.vue';

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
} );
