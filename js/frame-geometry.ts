/**
 * Pure Deterministic SVG Frame Geometry & Dynamic Positional Anchor Math (Phase 3c).
 * Zero DOM layout dependencies so all calculations can be unit-tested deterministically.
 */
import { getView } from './model.ts';

export type FrameShape = 'ring' | 'ellipse' | 'arc' | 'block' | 'line' | 'none';

export interface FrameConfig {
	shape: FrameShape;
	span: [ number, number ];
	corner: number | 'cut';
	stroke: string;
	path?: string | null;
}

export interface FrameAnchor {
	x: number;
	y: number;
	dock: 'left' | 'right' | 'top' | 'bottom';
	angle: number;
}

/**
 * Normalizes traitSet.view.frame (or direct frame config / shorthand) to full FrameConfig.
 */
export function resolveFrame( traitSetOrFrame: any ): FrameConfig | null {
	if ( !traitSetOrFrame ) return null;
	const raw = traitSetOrFrame.view !== undefined
		? getView( traitSetOrFrame )?.frame
		: ( traitSetOrFrame.frame !== undefined ? traitSetOrFrame.frame : traitSetOrFrame );
	if ( !raw ) return null;
	if ( typeof raw === 'string' ) {
		if ( raw === 'none' || !raw.trim() ) return null;
		const shape = raw.trim() as FrameShape;
		return {
			shape,
			span: shape === 'arc' ? [ -120, 120 ] : [ 0, 360 ],
			corner: 8,
			stroke: 'primary',
			path: null
		};
	}
	if ( typeof raw === 'object' && !Array.isArray( raw ) ) {
		const shape = ( raw.shape || 'block' ) as FrameShape;
		if ( shape === 'none' ) return null;
		const defaultSpan: [ number, number ] = shape === 'arc' ? [ -120, 120 ] : [ 0, 360 ];
		const span: [ number, number ] = ( Array.isArray( raw.span ) && raw.span.length >= 2 )
			? [ Number( raw.span[ 0 ] ) || 0, Number( raw.span[ 1 ] ) || 360 ]
			: defaultSpan;
		return {
			shape,
			span,
			corner: raw.corner === 'cut' ? 'cut' : ( Number.isFinite( Number( raw.corner ) ) ? Number( raw.corner ) : 8 ),
			stroke: typeof raw.stroke === 'string' && raw.stroke.trim() ? raw.stroke.trim() : 'primary',
			path: typeof raw.path === 'string' && raw.path.trim() ? raw.path.trim() : null
		};
	}
	return null;
}

/**
 * Dynamically computes positional anchors around a frame for N visible traits.
 * Closed loops distribute across 360°; open arcs distribute along the span.
 * Outward quadrant docking ensures multi-part tracks never collide with frame interior.
 */
export function computeFrameAnchors( count: number, config: FrameConfig ): FrameAnchor[] {
	if ( config.shape === 'line' || config.shape === 'block' || count <= 0 ) {
		return [];
	}

	let rx = 34;
	let ry = 34;
	if ( config.shape === 'ellipse' ) {
		rx = 40;
		ry = 28;
	} else if ( config.shape === 'arc' ) {
		rx = 38;
		ry = 32;
	}

	const delta = config.span[ 1 ] - config.span[ 0 ];
	const isClosed = Math.abs( delta ) >= 360;
	const anchors: FrameAnchor[] = [];

	for ( let i = 0; i < count; i++ ) {
		let theta_i: number;
		if ( isClosed ) {
			const t_i = i / count;
			theta_i = config.span[ 0 ] + t_i * 360;
		} else {
			const t_i = count === 1 ? 0.5 : i / ( count - 1 );
			theta_i = config.span[ 0 ] + t_i * delta;
		}

		// Convert angle (0° = top dead center / -90° in standard trig)
		const rad = ( theta_i - 90 ) * ( Math.PI / 180 );
		const xi = 50 + rx * Math.cos( rad );
		const yi = 50 + ry * Math.sin( rad );

		// Outward quadrant docking
		let dock: 'left' | 'right' | 'top' | 'bottom';
		if ( xi < 42 ) {
			dock = 'left';
		} else if ( xi > 58 ) {
			dock = 'right';
		} else if ( yi <= 50 ) {
			dock = 'top';
		} else {
			dock = 'bottom';
		}

		anchors.push( {
			x: Math.round( xi * 10 ) / 10,
			y: Math.round( yi * 10 ) / 10,
			dock,
			angle: Math.round( theta_i )
		} );
	}

	return anchors;
}

/**
 * Deterministic SVG path generator for frame shapes inside a 100x100 (or 100x12 for line) viewBox.
 */
export function buildFrameSvgPath( config: FrameConfig ): string {
	if ( config.path ) return config.path;

	if ( config.shape === 'line' ) {
		return 'M 0,6 L 100,6';
	}

	if ( config.shape === 'block' ) {
		if ( config.corner === 'cut' ) {
			return 'M 6,1 L 94,1 L 99,6 L 99,94 L 94,99 L 6,99 L 1,94 L 1,6 Z';
		}
		const r = Math.min( 48, Math.max( 0, Number( config.corner ) || 8 ) );
		if ( r <= 0 ) {
			return 'M 1,1 L 99,1 L 99,99 L 1,99 Z';
		}
		return `M ${1 + r},1 L ${99 - r},1 Q 99,1 99,${1 + r} L 99,${99 - r} Q 99,99 ${99 - r},99 L ${1 + r},99 Q 1,99 1,${99 - r} L 1,${1 + r} Q 1,1 ${1 + r},1 Z`;
	}

	let rx = 34;
	let ry = 34;
	if ( config.shape === 'ellipse' ) {
		rx = 40;
		ry = 28;
	} else if ( config.shape === 'arc' ) {
		rx = 38;
		ry = 32;
	}

	const delta = config.span[ 1 ] - config.span[ 0 ];
	if ( Math.abs( delta ) >= 360 ) {
		return `M 50,${( 50 - ry ).toFixed( 2 )} A ${rx} ${ry} 0 1 1 49.99,${( 50 - ry ).toFixed( 2 )} Z`;
	}

	const theta0 = config.span[ 0 ];
	const theta1 = config.span[ 1 ];
	const rad0 = ( theta0 - 90 ) * ( Math.PI / 180 );
	const rad1 = ( theta1 - 90 ) * ( Math.PI / 180 );
	const x0 = 50 + rx * Math.cos( rad0 );
	const y0 = 50 + ry * Math.sin( rad0 );
	const x1 = 50 + rx * Math.cos( rad1 );
	const y1 = 50 + ry * Math.sin( rad1 );
	const largeArc = Math.abs( delta ) > 180 ? 1 : 0;
	const sweep = delta >= 0 ? 1 : 0;

	return `M ${x0.toFixed( 2 )},${y0.toFixed( 2 )} A ${rx} ${ry} 0 ${largeArc} ${sweep} ${x1.toFixed( 2 )},${y1.toFixed( 2 )}`;
}

