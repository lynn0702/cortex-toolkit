import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import TraitSetBlock from '../js/trait-set-block.vue';
import TraitSetFrame from '../js/trait-set-frame.vue';
import { resolveFrame, computeFrameAnchors, type FrameConfig } from '../js/frame-geometry.ts';

/**
 * Independent oracle re-implemented strictly from §4.1 formula.
 * Must NOT import computeFrameAnchors or any production component.
 */
function independentLegacyOracle(
	count: number,
	config: { arcAngle?: number; arcSpread?: number; arcDistance?: number } = {}
) {
	const arcAngle = config.arcAngle ?? -90;
	const arcSpread = config.arcSpread ?? 100;
	const arcDistance = config.arcDistance ?? 0;

	const centerAngle = 90 + arcAngle;
	const totalSpan = 85 * ( arcSpread / 100 );

	const points: Array<{ left: number; top: number; angle: number; offsetMm?: { x: number; y: number } }> = [];
	for ( let idx = 0; idx < count; idx++ ) {
		const alpha = count === 1 ? 0.5 : idx / ( count - 1 );
		const angle = centerAngle + ( alpha - 0.5 ) * totalSpan;
		const rad = angle * ( Math.PI / 180 );
		const cos = Math.cos( rad );
		const sin = Math.sin( rad );

		const left = 50 + 50 * cos;
		const top = 50 + 50 * sin;

		const pt: { left: number; top: number; angle: number; offsetMm?: { x: number; y: number } } = {
			left,
			top,
			angle
		};
		if ( arcDistance !== 0 ) {
			pt.offsetMm = {
				x: arcDistance * cos,
				y: arcDistance * sin
			};
		}
		points.push( pt );
	}
	return points;
}

describe( 'Step 1: Frame Chrome & Ring Parity Suite', () => {

	describe( 'Baseline 1: Classic Block Frame Chrome Parity', () => {
		it( 'renders TraitSetFrame, carries framed suppression classes, and draws perimeter + sidebar spine', () => {
			const character = {
				name: 'Test Character',
				traitSets: [
					{
						name: 'Attributes',
						noun: 'Attribute',
						view: {
							header: 'sidebar',
							frame: { shape: 'block', stroke: 'strong' }
						},
						traits: [
							{ name: 'Agility', rating: { type: 'Die', value: [ 8 ] } }
						]
					}
				]
			};

			const wrapper = mount( TraitSetBlock, {
				props: { character, traitSetID: 0, submode: 'play', editing: [] }
			} );

			// Check framed suppression classes (disables legacy CSS border)
			expect( wrapper.classes() ).toContain( 'trait-set-framed' );
			expect( wrapper.classes() ).toContain( 'trait-set-frame-block' );

			// Check TraitSetFrame component rendered
			const frameSvg = wrapper.findComponent( TraitSetFrame );
			expect( frameSvg.exists() ).toBe( true );
			expect( frameSvg.classes() ).toContain( 'frame-block-svg' );
			expect( frameSvg.classes() ).toContain( 'frame-stroke-strong' );

			// Check perimeter path exists
			const perimeter = frameSvg.find( '.frame-perimeter-path' );
			expect( perimeter.exists() ).toBe( true );
			expect( perimeter.attributes( 'd' ) ).toMatch( /^M \d+/ );

			// Check vertical spine line exists for sidebar header mode
			const spine = frameSvg.find( '.frame-spine-path' );
			expect( spine.exists() ).toBe( true );
			const spineD = spine.attributes( 'd' ) || '';
			expect( spineD ).toMatch( /^M [\d.]+,1 L [\d.]+,/ );

			wrapper.unmount();
		} );

		it( 'renders horizontal spine line for top header mode', () => {
			const character = {
				name: 'Test Character',
				traitSets: [
					{
						name: 'Skills',
						noun: 'Skill',
						view: {
							header: 'top',
							frame: { shape: 'block', stroke: 'strong' }
						},
						traits: [
							{ name: 'Fight', rating: { type: 'Die', value: [ 6 ] } }
						]
					}
				]
			};

			const wrapper = mount( TraitSetBlock, {
				props: { character, traitSetID: 0, submode: 'play', editing: [] }
			} );

			const frameSvg = wrapper.findComponent( TraitSetFrame );
			expect( frameSvg.exists() ).toBe( true );

			const spine = frameSvg.find( '.frame-spine-path' );
			expect( spine.exists() ).toBe( true );
			const spineD = spine.attributes( 'd' ) || '';
			// Top spine is horizontal: M 1,{hh} L {w-1},{hh}
			expect( spineD ).toMatch( /^M 1,[\d.]+ L \d+,[\d.]+/ );

			wrapper.unmount();
		} );

		it( 'suppresses spine line when set has no header (empty name)', () => {
			const character = {
				name: 'Test Character',
				traitSets: [
					{
						name: '',
						noun: 'Trait',
						view: {
							header: 'top',
							frame: { shape: 'block', stroke: 'strong' }
						},
						traits: [
							{ name: 'Stealth', rating: { type: 'Die', value: [ 6 ] } }
						]
					}
				]
			};

			const wrapper = mount( TraitSetBlock, {
				props: { character, traitSetID: 0, submode: 'play', editing: [] }
			} );

			// No header rendered
			expect( wrapper.find( '.trait-set-header' ).exists() ).toBe( false );

			const frameSvg = wrapper.findComponent( TraitSetFrame );
			expect( frameSvg.exists() ).toBe( true );

			// No spine line drawn
			expect( frameSvg.find( '.frame-spine-path' ).exists() ).toBe( false );

			wrapper.unmount();
		} );

		it( 'preserves custom set background tint in perimeter path fill', () => {
			const character = {
				name: 'Test Character',
				traitSets: [
					{
						name: 'Special Assets',
						noun: 'Asset',
						view: {
							tint: '#e0f2fe',
							frame: { shape: 'block', stroke: 'primary' }
						},
						traits: [
							{ name: 'Hoverbike', rating: { type: 'Die', value: [ 8 ] } }
						]
					}
				]
			};

			const wrapper = mount( TraitSetBlock, {
				props: { character, traitSetID: 0, submode: 'play', editing: [] }
			} );

			const frameSvg = wrapper.findComponent( TraitSetFrame );
			const perimeter = frameSvg.find( '.frame-perimeter-path' );
			expect( perimeter.attributes( 'style' ) ).toMatch( /fill:\s*(#e0f2fe|rgb\(224,\s*242,\s*254\))/ );

			wrapper.unmount();
		} );

		it( 'renders non-squashed corner radius with live pixel dimensions', () => {
			const traitSet = {
				name: 'Test Block',
				view: {
					frame: { shape: 'block', stroke: 'primary', corner: 4 }
				}
			};

			const wrapper = mount( TraitSetFrame, {
				props: {
					traitSet,
					width: 400,
					height: 200,
					headerWidth: 30.4,
					hasHeader: true
				}
			} );

			expect( wrapper.attributes( 'viewBox' ) ).toBe( '0 0 400 200' );
			const d = wrapper.find( '.frame-perimeter-path' ).attributes( 'd' ) || '';
			// Corner radius 4 in 400x200 box: M 5,1 L 395,1 Q 399,1 399,5 ...
			expect( d ).toContain( 'M 5,1 L 395,1 Q 399,1 399,5' );

			wrapper.unmount();
		} );
	} );

	describe( 'Baseline 2: Ring Parity Geometry (Independent Oracle)', () => {
		it( 'unifies view.ringTrait === true to a frame ring carrying ringConfig', () => {
			const legacySet = {
				name: 'Attributes',
				view: {
					ringTrait: true,
					ringConfig: {
						arcAngle: -90,
						arcSpread: 100,
						arcDistance: 0
					}
				}
			};

			const resolved = resolveFrame( legacySet );
			expect( resolved ).not.toBeNull();
			expect( resolved?.shape ).toBe( 'ring' );
			expect( resolved?.legacyRing ).toBe( true );
			expect( resolved?.ringConfig ).toBeDefined();
			expect( resolved?.ringConfig?.arcAngle ).toBe( -90 );
			expect( resolved?.ringConfig?.arcSpread ).toBe( 100 );
		} );

		it( 'verifies frame anchors match independent oracle for N=3, 4, 5, 6 under 0.01 percentage points (default config)', () => {
			const ringConfig = { arcAngle: -90, arcSpread: 100, arcDistance: 0 };
			const frameConfig: FrameConfig = {
				shape: 'ring',
				span: [ 0, 360 ],
				corner: 8,
				stroke: 'primary',
				legacyRing: true,
				ringConfig
			};

			for ( const n of [ 3, 4, 5, 6 ] ) {
				const oracle = independentLegacyOracle( n, ringConfig );
				const anchors = computeFrameAnchors( n, frameConfig );

				expect( anchors.length ).toBe( n );
				for ( let i = 0; i < n; i++ ) {
					const deltaX = Math.abs( anchors[ i ].x - oracle[ i ].left );
					const deltaY = Math.abs( anchors[ i ].y - oracle[ i ].top );
					expect( deltaX, `N=${n} idx=${i} x delta must be < 0.01, got ${deltaX}` ).toBeLessThan( 0.01 );
					expect( deltaY, `N=${n} idx=${i} y delta must be < 0.01, got ${deltaY}` ).toBeLessThan( 0.01 );
				}
			}
		} );

		it( 'verifies frame anchors match independent oracle for N=3, 4, 5, 6 under 0.01 points (non-default config: arcAngle, arcSpread, arcDistance)', () => {
			const customConfig = { arcAngle: -45, arcSpread: 120, arcDistance: 6 };
			const frameConfig: FrameConfig = {
				shape: 'ring',
				span: [ 0, 360 ],
				corner: 8,
				stroke: 'strong',
				legacyRing: true,
				ringConfig: customConfig
			};

			for ( const n of [ 3, 4, 5, 6 ] ) {
				const oracle = independentLegacyOracle( n, customConfig );
				const anchors = computeFrameAnchors( n, frameConfig );

				expect( anchors.length ).toBe( n );
				for ( let i = 0; i < n; i++ ) {
					const deltaX = Math.abs( anchors[ i ].x - oracle[ i ].left );
					const deltaY = Math.abs( anchors[ i ].y - oracle[ i ].top );
					expect( deltaX, `N=${n} idx=${i} x delta must be < 0.01, got ${deltaX}` ).toBeLessThan( 0.01 );
					expect( deltaY, `N=${n} idx=${i} y delta must be < 0.01, got ${deltaY}` ).toBeLessThan( 0.01 );

					if ( oracle[ i ].offsetMm && anchors[ i ].offsetMm ) {
						const deltaMmX = Math.abs( anchors[ i ].offsetMm!.x - oracle[ i ].offsetMm!.x );
						const deltaMmY = Math.abs( anchors[ i ].offsetMm!.y - oracle[ i ].offsetMm!.y );
						expect( deltaMmX ).toBeLessThan( 0.01 );
						expect( deltaMmY ).toBeLessThan( 0.01 );
					}
				}
			}
		} );

		it( 'verifies name-offset styles reproduce 6mm offset with 0.35 cos threshold', () => {
			const frameConfig: FrameConfig = {
				shape: 'ring',
				span: [ 0, 360 ],
				corner: 8,
				stroke: 'primary',
				legacyRing: true,
				ringConfig: { arcAngle: -90, arcSpread: 100, arcDistance: 0 }
			};

			// N=3 traits: angles are -42.5°, 0°, +42.5°
			// cos(-42.5°) ≈ 0.737 (> 0.35) -> text-align: left
			// cos(0°) = 1 (> 0.35) -> text-align: left
			// cos(42.5°) ≈ 0.737 (> 0.35) -> text-align: left
			const anchors = computeFrameAnchors( 3, frameConfig );
			for ( const a of anchors ) {
				expect( a.nameStyle ).toBeDefined();
				expect( a.nameStyle?.textAlign ).toBe( 'left' );
				expect( a.nameStyle?.left ).toMatch( /calc\(50% \+ [\d.]+mm\)/ );
			}
		} );
	} );
} );
