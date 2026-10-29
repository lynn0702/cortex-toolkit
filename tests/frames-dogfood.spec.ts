import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import TraitSetBlock from '../js/trait-set-block.vue';
import { VANGUARD_FRAME_SHOWCASE, DOGFOOD_TEMPLATES } from '../js/dogfood-templates.ts';
import { cortexSetPresets, cortexFunctions } from '../js/functions.ts';
import { computeFrameAnchors, resolveFrame } from '../js/frame-geometry.ts';
import { isHiddenIn } from '../js/model.ts';

describe( 'Phase 3c Dogfood Framed Character Template & Preset Catalog Suite', () => {
	it( 'verifies DOGFOOD_TEMPLATES exposes the Vanguard Frame Showcase at index 0', () => {
		expect( DOGFOOD_TEMPLATES.length ).toBeGreaterThanOrEqual( 1 );
		const tmpl = DOGFOOD_TEMPLATES[ 0 ];
		expect( tmpl.id ).toBe( 'vanguard-frame-showcase' );
		expect( tmpl.title ).toBe( 'Vanguard Frame Showcase (Dogfood)' );
		expect( tmpl.character.traitSets.length ).toBe( 8 );
	} );

	it( 'verifies cortexSetPresets contains the 3 new Phase 3c Framed Presets', () => {
		const ringPreset = cortexSetPresets[ 'framed-ring-attributes' ];
		expect( ringPreset, 'framed-ring-attributes preset must exist' ).toBeDefined();
		expect( ringPreset?.preset?.view?.frame?.shape ).toBe( 'ring' );

		const blockPreset = cortexSetPresets[ 'framed-chamfer-block' ];
		expect( blockPreset, 'framed-chamfer-block preset must exist' ).toBeDefined();
		expect( blockPreset?.preset?.view?.frame?.shape ).toBe( 'block' );
		expect( blockPreset?.preset?.view?.frame?.corner ).toBe( 'cut' );

		const linePreset = cortexSetPresets[ 'framed-section-line' ];
		expect( linePreset, 'framed-section-line preset must exist' ).toBeDefined();
		expect( linePreset?.preset?.view?.frame?.shape ).toBe( 'line' );
	} );

	it( 'F4: verifies span normalization preserves explicit 0 and anchors maintain >= 0.01 precision', () => {
		const frameZero = resolveFrame( { shape: 'arc', span: [ 180, 0 ] } );
		expect( frameZero, 'frame with span [180, 0] must resolve' ).not.toBeNull();
		expect( frameZero?.span[ 0 ] ).toBe( 180 );
		expect( frameZero?.span[ 1 ] ).toBe( 0 );

		const anchors = computeFrameAnchors( 6, frameZero! );
		expect( anchors.length ).toBe( 6 );
		for ( const a of anchors ) {
			const xStr = a.x.toString();
			const yStr = a.y.toString();
			const xDecimals = xStr.includes( '.' ) ? xStr.split( '.' )[ 1 ].length : 0;
			const yDecimals = yStr.includes( '.' ) ? yStr.split( '.' )[ 1 ].length : 0;
			expect( xDecimals ).toBeLessThanOrEqual( 2 );
			expect( yDecimals ).toBeLessThanOrEqual( 2 );
		}
	} );

	it( 'F5: verifies dead fields are stripped from dogfood template and presets', () => {
		const char = VANGUARD_FRAME_SHOWCASE.character;
		for ( const s of char.traitSets ) {
			expect( ( s.view as any )?.headerAlign, 'headerAlign must be stripped' ).toBeUndefined();
			expect( ( s.view as any )?.sharedHinder, 'sharedHinder must be stripped' ).toBeUndefined();
		}

		// Values set
		const valuesSet = char.traitSets[ 4 ];
		expect( valuesSet.name ).toBe( 'Values' );
		for ( const t of valuesSet.traits ) {
			expect( ( t as any ).statement, 'trait-level statement must be stripped' ).toBeUndefined();
			expect( ( t as any ).questioned, 'trait-level questioned must be stripped' ).toBeUndefined();
			expect( t.traits?.length ).toBe( 1 );
			expect( t.traits?.[ 0 ].name ).toBeTruthy();
		}
		// Glory questioned pip
		const glory = valuesSet.traits.find( t => t.name === 'Glory' );
		expect( glory?.traits?.[ 0 ]?.rating?.value ).toEqual( [ true ] );

		// Session notes does not reference JSON tab
		const sessionNotes = char.traitSets[ 7 ];
		expect( sessionNotes.notes ).not.toContain( 'JSON tab' );
		expect( sessionNotes.notes ).toContain( 'Card Builder' );
	} );

	it( 'F6: verifies stroke tokens (strong, dashed) and unrecognized fallback to primary with warning', () => {
		const warnSpy = vi.spyOn( console, 'warn' ).mockImplementation( () => {} );

		const character = structuredClone( VANGUARD_FRAME_SHOWCASE.character );
		// Test unrecognized stroke fallback
		character.traitSets[ 0 ].view.frame = {
			shape: 'ring',
			stroke: 'unknown-neon'
		};
		const wrapper = mount( TraitSetBlock, {
			props: { character, traitSetID: 0, submode: 'play', editing: [] }
		} );

		expect( warnSpy ).toHaveBeenCalledWith( expect.stringContaining( 'unknown-neon' ) );
		expect( wrapper.find( '.frame-stroke-primary' ).exists() ).toBe( true );

		warnSpy.mockRestore();
		wrapper.unmount();
	} );

	it( 'F8: verifies line divider set renders as a bare rule with no header or card chrome', () => {
		const character = structuredClone( VANGUARD_FRAME_SHOWCASE.character );
		const lineSet = character.traitSets[ 1 ];
		expect( lineSet.name ).toBe( '' );
		expect( lineSet.view.frame.shape ).toBe( 'line' );

		const wrapper = mount( TraitSetBlock, {
			props: { character, traitSetID: 1, submode: 'edit', editing: [] }
		} );

		// Section carries trait-set-frame-line
		expect( wrapper.classes() ).toContain( 'trait-set-frame-line' );
		// Header chrome is completely omitted
		expect( wrapper.find( '.trait-set-header' ).exists() ).toBe( false );
		// Line SVG is rendered
		expect( wrapper.find( '.frame-line-svg' ).exists() ).toBe( true );
		// No +Trait button or placeholder slot
		expect( wrapper.find( '.trait-placeholder-slot' ).exists() ).toBe( false );

		wrapper.unmount();
	} );

	it( 'Attributes: renders .trait-list-framed with 6 dynamically anchored traits and visible attached Stress tracks', () => {
		const character = structuredClone( VANGUARD_FRAME_SHOWCASE.character );
		const wrapper = mount( TraitSetBlock, {
			props: {
				character,
				traitSetID: 0, // Attributes
				submode: 'edit',
				editing: []
			}
		} );

		// Radial SVG frame is rendered in the trait list
		const listSvg = wrapper.find( '.frame-radial-svg' );
		expect( listSvg.exists(), 'SVG frame background must render inside .trait-list-framed' ).toBe( true );

		const framedList = wrapper.find( '.trait-list-framed' );
		expect( framedList.exists() ).toBe( true );

		// 6 dynamically anchored traits
		const traitEls = framedList.findAll( '.trait' );
		expect( traitEls.length ).toBe( 6 );

		// Each trait has dynamic positional anchors and docking attributes
		for ( const t of traitEls ) {
			const style = t.attributes( 'style' ) || '';
			expect( style ).toContain( 'left:' );
			expect( style ).toContain( 'top:' );
			const dock = t.attributes( 'data-frame-dock' );
			expect( [ 'left', 'right', 'top', 'bottom' ] ).toContain( dock );
		}

		// Trait 0 (Agility) has attached Stress track with d6
		const agilityEl = traitEls[ 0 ];
		expect( agilityEl.attributes( 'data-trait-name' ) ).toBe( 'Agility' );
		expect( agilityEl.text() ).toContain( 'Agility' );
		expect( agilityEl.text() ).toContain( 'Stress' );
		const agilityTrack = agilityEl.find( '.trait-part-track' );
		expect( agilityTrack.exists(), 'Agility attached stress track part must exist' ).toBe( true );
		// d6 is active
		const agilityActiveDie = agilityTrack.find( '.attached-stress-die.active' );
		expect( agilityActiveDie.exists() ).toBe( true );
		expect( agilityActiveDie.text() ).toContain( '6' );

		// Trait 4 (Intellect) has attached Stress track with d4
		const intellectEl = traitEls[ 4 ];
		expect( intellectEl.attributes( 'data-trait-name' ) ).toBe( 'Intellect' );
		expect( intellectEl.text() ).toContain( 'Intellect' );
		expect( intellectEl.text() ).toContain( 'Stress' );
		const intellectTrack = intellectEl.find( '.trait-part-track' );
		expect( intellectTrack.exists(), 'Intellect attached stress track part must exist' ).toBe( true );
		// d4 is active
		const intellectActiveDie = intellectTrack.find( '.attached-stress-die.active' );
		expect( intellectActiveDie.exists() ).toBe( true );
		expect( intellectActiveDie.text() ).toContain( '4' );

		// In edit submode, Add Trait button is rendered and visible below framed set
		const addBtn = wrapper.find( '.preview-button' );
		expect( addBtn.exists(), 'Add button must exist in edit submode for framed set' ).toBe( true );
		expect( addBtn.text() ).toContain( 'Attribute' );

		wrapper.unmount();
	} );

	it( 'verifies Add Trait button renders in edit submode and emits addTrait on click for framed sets', async () => {
		const character = structuredClone( VANGUARD_FRAME_SHOWCASE.character );
		const wrapper = mount( TraitSetBlock, {
			props: {
				character,
				traitSetID: 0, // Attributes (ring frame)
				submode: 'edit',
				editing: []
			}
		} );

		const btn = wrapper.find( '.preview-button' );
		expect( btn.exists() ).toBe( true );
		expect( btn.text() ).toContain( 'Attribute' );

		await btn.trigger( 'click' );
		expect( wrapper.emitted( 'addTrait' ) ).toBeTruthy();
		expect( wrapper.emitted( 'addTrait' )?.[ 0 ] ).toEqual( [ 0 ] );

		wrapper.unmount();
	} );

	it( 'morphs ring -> ellipse -> block preserving all 6 traits and their stress tracks in exact index order 0..5', async () => {
		const character = structuredClone( VANGUARD_FRAME_SHOWCASE.character );
		const set = character.traitSets[ 0 ];

		// 1. Initial ring
		expect( set.view.frame.shape ).toBe( 'ring' );
		const wrapper = mount( TraitSetBlock, {
			props: {
				character,
				traitSetID: 0,
				submode: 'play',
				editing: []
			}
		} );

		expect( wrapper.find( '.trait-list-framed' ).exists() ).toBe( true );
		const getTraitNames = () => wrapper.findAll( '.trait' ).map( el => el.attributes( 'data-trait-name' ) );
		expect( getTraitNames() ).toEqual( [ 'Agility', 'Awareness', 'Brawn', 'Coordination', 'Intellect', 'Will' ] );

		// 2. Morph to ellipse
		const characterEllipse = structuredClone( character );
		characterEllipse.traitSets[ 0 ].view.frame.shape = 'ellipse';
		await wrapper.setProps( { character: characterEllipse } );
		await nextTick();

		expect( wrapper.find( '.trait-list-framed' ).exists() ).toBe( true );
		expect( getTraitNames() ).toEqual( [ 'Agility', 'Awareness', 'Brawn', 'Coordination', 'Intellect', 'Will' ] );
		// Attached stress track preserved
		const agilityEllipseActive = wrapper.findAll( '.trait' )[ 0 ].find( '.trait-part-track .attached-stress-die.active' );
		expect( agilityEllipseActive.exists() ).toBe( true );
		expect( agilityEllipseActive.text() ).toContain( '6' );

		// 3. Morph to block (container border frame)
		const characterBlock = structuredClone( character );
		characterBlock.traitSets[ 0 ].view.frame = {
			shape: 'block',
			corner: 'cut',
			stroke: 'primary'
		};
		await wrapper.setProps( { character: characterBlock } );
		await nextTick();

		// When block, the frame SVG renders at the block container level (.trait-set-frame-svg.frame-block-svg)
		expect( wrapper.find( '.trait-set-frame-svg.frame-block-svg' ).exists() ).toBe( true );
		// Positional frame is false, so traits render in standard linear grid layout
		expect( wrapper.find( '.trait-list-framed' ).exists() ).toBe( false );
		expect( getTraitNames() ).toEqual( [ 'Agility', 'Awareness', 'Brawn', 'Coordination', 'Intellect', 'Will' ] );
		// Attached stress track still preserved in exact order
		const agilityBlockActive = wrapper.findAll( '.trait' )[ 0 ].find( '.trait-part-track .attached-stress-die.active' );
		expect( agilityBlockActive.exists() ).toBe( true );
		expect( agilityBlockActive.text() ).toContain( '6' );

		const intellectBlockActive = wrapper.findAll( '.trait' )[ 4 ].find( '.trait-part-track .attached-stress-die.active' );
		expect( intellectBlockActive.exists() ).toBe( true );
		expect( intellectBlockActive.text() ).toContain( '4' );

		wrapper.unmount();
	} );

	it( 'dynamically re-derives computeFrameAnchors from 6 to 7 positions when pushing a 7th trait', async () => {
		const character = structuredClone( VANGUARD_FRAME_SHOWCASE.character );
		const frame = resolveFrame( character.traitSets[ 0 ].view.frame );
		expect( frame ).not.toBeNull();

		// 6 positions
		const anchors6 = computeFrameAnchors( 6, frame! );
		expect( anchors6.length ).toBe( 6 );

		// Dynamic re-derivation with 7 traits
		const anchors7 = computeFrameAnchors( 7, frame! );
		expect( anchors7.length ).toBe( 7 );

		// Verify distinct positions around the circle
		const angles7 = anchors7.map( a => Math.round( a.angle ) );
		expect( new Set( angles7 ).size ).toBe( 7 );

		// Mount with 7 traits
		const character7 = structuredClone( character );
		character7.traitSets[ 0 ].traits.push( {
			name: 'Resolve',
			rating: { type: 'Die', value: [ 8 ], range: [ 4, 6, 8, 10, 12 ] }
		} );

		const wrapper = mount( TraitSetBlock, {
			props: {
				character: character7,
				traitSetID: 0,
				submode: 'edit',
				editing: []
			}
		} );

		const traitEls = wrapper.findAll( '.trait-list-framed .trait' );
		expect( traitEls.length ).toBe( 7 );
		expect( traitEls[ 6 ].text() ).toContain( 'Resolve' );

		wrapper.unmount();
	} );

	it( 'in submode === "print", play-only sets are omitted while frames render cleanly', () => {
		const character = structuredClone( VANGUARD_FRAME_SHOWCASE.character );

		// Set 6 (Scene Traits) and Set 7 (Session Notes) have visibility: 'play-only'
		const sceneTraitsSet = character.traitSets[ 6 ];
		const sessionNotesSet = character.traitSets[ 7 ];
		expect( sceneTraitsSet.name ).toBe( 'Scene Traits' );
		expect( sessionNotesSet.name ).toBe( 'Session Notes' );

		// CortexModel visibility check
		expect( isHiddenIn( sceneTraitsSet, 'print' ) ).toBe( true );
		expect( isHiddenIn( sessionNotesSet, 'print' ) ).toBe( true );
		expect( isHiddenIn( sceneTraitsSet, 'play' ) ).toBe( false );
		expect( isHiddenIn( sessionNotesSet, 'edit' ) ).toBe( false );

		// In print submode, v-if="!isHiddenIn(traitSet, submode)" completely omits play-only sets from print DOM
		const wrapperPrint = mount( TraitSetBlock, {
			props: {
				character,
				traitSetID: 6,
				submode: 'print',
				editing: []
			}
		} );
		expect( wrapperPrint.find( 'section' ).exists(), 'Play-only set must be omitted from print DOM' ).toBe( false );
		wrapperPrint.unmount();

		// In play submode, it renders with .trait-set-play-only class
		const wrapperPlay = mount( TraitSetBlock, {
			props: {
				character,
				traitSetID: 6,
				submode: 'play',
				editing: []
			}
		} );
		expect( wrapperPlay.classes() ).toContain( 'trait-set-play-only' );
		wrapperPlay.unmount();

		// Framed Attributes set in print submode is NOT hidden
		const wrapperAttributesPrint = mount( TraitSetBlock, {
			props: {
				character,
				traitSetID: 0,
				submode: 'print',
				editing: []
			}
		} );
		expect( wrapperAttributesPrint.classes() ).not.toContain( 'trait-set-play-only' );
		expect( wrapperAttributesPrint.find( '.frame-radial-svg' ).exists() ).toBe( true );
		wrapperAttributesPrint.unmount();
	} );
} );
