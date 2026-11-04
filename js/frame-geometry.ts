/**
 * Pure Deterministic SVG Frame Geometry & Dynamic Positional Anchor Math (Phase 3c).
 * Zero DOM layout dependencies so all calculations can be unit-tested deterministically.
 */
import { getView } from './model.ts';

export type FrameShape = 'ring' | 'ellipse' | 'arc' | 'block' | 'line' | 'none';

export type FrameColor = 'primary' | 'accent' | 'muted' | 'strong' | 'black';

export interface RingConfig {
	arcAngle?: number;
	arcSpread?: number;
	arcDistance?: number;
	scaleAngle?: number;
	scaleDistance?: number;
	scaleDieX?: number;
	scaleDieY?: number;
	arcSlide?: number;
}

export interface FrameConfig {
	shape: FrameShape;
	span: [number, number];
	corner: number | 'cut';
	stroke: string;
	color: FrameColor;
	dash?: string;
	box?: boolean;
	path?: string | null;
	ringConfig?: RingConfig | null;
	legacyRing?: boolean;
}

export interface FrameAnchor {
	x: number;
	y: number;
	dock: 'left' | 'right' | 'top' | 'bottom';
	angle: number;
	offsetMm?: { x: number; y: number };
	nameStyle?: Record<string, string>;
}

/**
 * Normalizes traitSet.view.frame (or direct frame config / shorthand) to full FrameConfig.
 * Unifies legacy rings (view.ringTrait === true, set-level ringTrait, or legacyRing).
 */
export function resolveFrame(traitSetOrFrame: any): FrameConfig | null {
	if (!traitSetOrFrame) return null;
	const view = traitSetOrFrame.view !== undefined ? getView(traitSetOrFrame) : traitSetOrFrame;
	const raw = traitSetOrFrame.view !== undefined
		? view?.frame
		: (traitSetOrFrame.frame !== undefined ? traitSetOrFrame.frame : traitSetOrFrame);

	const isLegacyRing = Boolean(
		view?.ringTrait ||
		(traitSetOrFrame as any)?.ringTrait ||
		raw?.legacyRing
	);

	const rawRingCfg = view?.ringConfig || raw?.ringConfig || (traitSetOrFrame as any)?.ringConfig;
	const ringConfig: RingConfig | null = rawRingCfg ? {
		arcAngle: rawRingCfg.arcAngle ?? (rawRingCfg.arcSlide !== undefined ? rawRingCfg.arcSlide * 3 : -90),
		arcSpread: rawRingCfg.arcSpread ?? 100,
		arcDistance: rawRingCfg.arcDistance ?? 0,
		scaleAngle: rawRingCfg.scaleAngle ?? 0,
		scaleDistance: rawRingCfg.scaleDistance ?? 0,
		scaleDieX: rawRingCfg.scaleDieX ?? 0,
		scaleDieY: rawRingCfg.scaleDieY ?? 0
	} : null;

	if (!raw) {
		if (isLegacyRing) {
			return {
				shape: 'ring',
				span: [0, 360],
				corner: 8,
				stroke: '2px',
				color: 'primary',
				box: false,
				path: null,
				ringConfig: ringConfig || {
					arcAngle: -90,
					arcSpread: 100,
					arcDistance: 0,
					scaleAngle: 0,
					scaleDistance: 0,
					scaleDieX: 0,
					scaleDieY: 0
				},
				legacyRing: true
			};
		}
		return null;
	}

	if (typeof raw === 'string') {
		if (raw === 'none' || !raw.trim()) return null;
		const shape = raw.trim() as FrameShape;
		const hasLegacyRing = shape === 'ring' && Boolean((raw as any).legacyRing);
		return {
			shape,
			span: shape === 'arc' ? [-120, 120] : [0, 360],
			corner: 8,
			stroke: '2px',
			color: 'primary',
			box: false,
			path: null,
			ringConfig: hasLegacyRing ? (ringConfig || {
				arcAngle: -90,
				arcSpread: 100,
				arcDistance: 0,
				scaleAngle: 0,
				scaleDistance: 0,
				scaleDieX: 0,
				scaleDieY: 0
			}) : null,
			legacyRing: hasLegacyRing
		};
	}

	if (typeof raw === 'object' && !Array.isArray(raw)) {
		const shape = (raw.shape || (isLegacyRing ? 'ring' : 'block')) as FrameShape;
		if (shape === 'none') return null;
		const defaultSpan: [number, number] = shape === 'arc' ? [-120, 120] : [0, 360];
		const parseNum = (val: any, fallback: number): number => {
			const n = Number(val);
			return Number.isFinite(n) ? n : fallback;
		};
		const span: [number, number] = (Array.isArray(raw.span) && raw.span.length >= 2)
			? [parseNum(raw.span[0], defaultSpan[0]), parseNum(raw.span[1], defaultSpan[1])]
			: defaultSpan;
		const hasLegacyRing = shape === 'ring' && Boolean(raw.legacyRing || raw.ringConfig);
		const effectiveRingConfig = hasLegacyRing ? (raw.ringConfig || ringConfig || {
			arcAngle: -90,
			arcSpread: 100,
			arcDistance: 0,
			scaleAngle: 0,
			scaleDistance: 0,
			scaleDieX: 0,
			scaleDieY: 0
		}) : null;

		const color: FrameColor = typeof raw.color === 'string' && raw.color.trim() ? (raw.color.trim() as FrameColor) : 'primary';
		const stroke = typeof raw.stroke === 'string' && raw.stroke.trim() ? raw.stroke.trim() : '2px';
		const dash = typeof raw.dash === 'string' && raw.dash.trim() ? raw.dash.trim() : undefined;
		const box = Boolean(raw.box);

		return {
			shape,
			span,
			corner: raw.corner === 'cut' ? 'cut' : (Number.isFinite(Number(raw.corner)) ? Number(raw.corner) : 8),
			stroke,
			color,
			...(dash ? { dash } : {}),
			box,
			path: typeof raw.path === 'string' && raw.path.trim() ? raw.path.trim() : null,
			ringConfig: effectiveRingConfig,
			legacyRing: hasLegacyRing
		};
	}
	return null;
}

/**
 * Dynamically computes positional anchors around a frame for N visible traits.
 * Closed loops distribute across 360°; open arcs distribute along the span.
 * Outward quadrant docking ensures multi-part tracks never collide with frame interior.
 * When legacyRing is true, computes exact coordinates matching the getTraitAngle legacy formula.
 */
export function computeFrameAnchors(count: number, config: FrameConfig): FrameAnchor[] {
	if (config.shape === 'line' || config.shape === 'block' || count <= 0) {
		return [];
	}

	if (config.legacyRing) {
		const cfg = config.ringConfig || {};
		const baseArcAngle = cfg.arcAngle ?? (cfg.arcSlide !== undefined ? cfg.arcSlide * 3 : -90);
		const centerAngle = 90 + baseArcAngle;
		const spreadFactor = (cfg.arcSpread ?? 100) / 100;
		const totalSpan = 85 * spreadFactor;
		const arcDistance = cfg.arcDistance ?? 0;

		const anchors: FrameAnchor[] = [];
		for (let i = 0; i < count; i++) {
			const alpha = count === 1 ? 0.5 : i / (count - 1);
			const angleDeg = centerAngle + (alpha - 0.5) * totalSpan;
			const rad = angleDeg * (Math.PI / 180);
			const cos = Math.cos(rad);
			const sin = Math.sin(rad);

			const percentX = 50 + 50 * cos;
			const percentY = 50 + 50 * sin;

			let dock: 'left' | 'right' | 'top' | 'bottom';
			if (cos > 0.35) {
				dock = 'right';
			} else if (cos < -0.35) {
				dock = 'left';
			} else if (sin <= 0) {
				dock = 'top';
			} else {
				dock = 'bottom';
			}

			const anchor: FrameAnchor = {
				x: Math.round(percentX * 10000) / 10000,
				y: Math.round(percentY * 10000) / 10000,
				dock,
				angle: Math.round(angleDeg * 100) / 100
			};

			if (arcDistance !== 0) {
				anchor.offsetMm = {
					x: Math.round(arcDistance * cos * 10000) / 10000,
					y: Math.round(arcDistance * sin * 10000) / 10000
				};
			}

			const distMm = 6;
			const offX = cos * distMm;
			if (cos > 0.35) {
				anchor.nameStyle = {
					position: 'absolute',
					left: `calc(50% + ${offX.toFixed(2)}mm)`,
					top: '50%',
					transform: 'translate(0, -50%)',
					textAlign: 'left'
				};
			} else if (cos < -0.35) {
				anchor.nameStyle = {
					position: 'absolute',
					left: `calc(50% + ${offX.toFixed(2)}mm)`,
					top: '50%',
					transform: 'translate(-100%, -50%)',
					textAlign: 'right'
				};
			} else {
				const offY = sin * distMm;
				anchor.nameStyle = {
					position: 'absolute',
					left: '50%',
					top: `calc(50% + ${offY.toFixed(2)}mm)`,
					transform: 'translate(-50%, 0)',
					textAlign: 'center'
				};
			}

			anchors.push(anchor);
		}
		return anchors;
	}

	let rx = 27;
	let ry = 27;
	if (config.shape === 'ellipse') {
		rx = 31;
		ry = 23;
	} else if (config.shape === 'arc') {
		rx = 29;
		ry = 25;
	}

	const delta = config.span[1] - config.span[0];
	const isClosed = Math.abs(delta) >= 360;
	const anchors: FrameAnchor[] = [];

	for (let i = 0; i < count; i++) {
		let theta_i: number;
		if (isClosed) {
			const t_i = i / count;
			theta_i = config.span[0] + t_i * 360;
		} else {
			const t_i = count === 1 ? 0.5 : i / (count - 1);
			theta_i = config.span[0] + t_i * delta;
		}

		// Convert angle (0° = top dead center / -90° in standard trig)
		const rad = (theta_i - 90) * (Math.PI / 180);
		const xi = 50 + rx * Math.cos(rad);
		const yi = 50 + ry * Math.sin(rad);

		// Outward quadrant docking
		let dock: 'left' | 'right' | 'top' | 'bottom';
		if (xi < 40) {
			dock = 'left';
		} else if (xi > 60) {
			dock = 'right';
		} else if (yi <= 50) {
			dock = 'top';
		} else {
			dock = 'bottom';
		}

		anchors.push({
			x: Math.round(xi * 100) / 100,
			y: Math.round(yi * 100) / 100,
			dock,
			angle: Math.round(theta_i * 100) / 100
		});
	}

	return anchors;
}

/**
 * Builds the rectangular block perimeter path.
 */
		export function buildBlockPath(corner: number | 'cut' | undefined, width = 100, height = 100): string {
			if (corner === 'cut') {
				return `M 6,1 L ${width - 6},1 L ${width - 1},6 L ${width - 1},${height - 6} L ${width - 6},${height - 1} L 6,${height - 1} L 1,${height - 6} L 1,6 Z`;
			}
				let r = 4;
				if (typeof corner === 'number' && corner !== 8) {
					r = Math.min(Math.min((width - 2) / 2, (height - 2) / 2), Math.max(0, corner));
				}
				if (r <= 0) {
					return `M 1,1 L ${width - 1},1 L ${width - 1},${height - 1} L 1,${height - 1} Z`;
				}
				return `M ${1 + r},1 L ${width - 1 - r},1 Q ${width - 1},1 ${width - 1},${1 + r} L ${width - 1},${height - 1 - r} Q ${width - 1},${height - 1} ${width - 1 - r},${height - 1} L ${1 + r},${height - 1} Q 1,${height - 1} 1,${height - 1 - r} L 1,${1 + r} Q 1,1 ${1 + r},1 Z`;
			}

			/**
			 * Builds the radial shape path (ring, ellipse, or arc) in a 100x100 viewBox.
			 */
			export function buildRadialShapePath(config: FrameConfig): string {
				let rx = 26;
				let ry = 26;
				if (config.shape === 'ellipse') {
					rx = 30;
					ry = 22;
				} else if (config.shape === 'arc') {
					rx = 28;
					ry = 24;
				}

				const delta = config.span[1] - config.span[0];
				if (Math.abs(delta) >= 360) {
					return `M 50,${(50 - ry).toFixed(2)} A ${rx} ${ry} 0 1 1 49.99,${(50 - ry).toFixed(2)} Z`;
				}

				const theta0 = config.span[0];
				const theta1 = config.span[1];
				const rad0 = (theta0 - 90) * (Math.PI / 180);
				const rad1 = (theta1 - 90) * (Math.PI / 180);
				const x0 = 50 + rx * Math.cos(rad0);
				const y0 = 50 + ry * Math.sin(rad0);
				const x1 = 50 + rx * Math.cos(rad1);
				const y1 = 50 + ry * Math.sin(rad1);
				const largeArc = Math.abs(delta) > 180 ? 1 : 0;
				const sweep = delta >= 0 ? 1 : 0;

				return `M ${x0.toFixed(2)},${y0.toFixed(2)} A ${rx} ${ry} 0 ${largeArc} ${sweep} ${x1.toFixed(2)},${y1.toFixed(2)}`;
			}

			/**
			 * Deterministic SVG path generator for frame shapes inside a 100x100 (or 100x12 for line) viewBox.
			 */
			export function buildFrameSvgPath(config: FrameConfig): string {
				if (config.path) return config.path;

				if (config.shape === 'line') {
					return 'M 0,6 L 100,6';
				}

				if (config.shape === 'block') {
					return buildBlockPath(config.corner, 100, 100);
				}

				const radial = buildRadialShapePath(config);
				if (config.box && (config.shape === 'ring' || config.shape === 'ellipse' || config.shape === 'arc')) {
					const box = buildBlockPath(config.corner, 100, 100);
					return `${box} ${radial}`;
				}

				return radial;
			}

