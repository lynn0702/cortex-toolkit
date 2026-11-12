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

export interface FrameImageConfig {
	url?: string;
	alignment?: string;
	zoom?: number;
}

export interface FrameConfig {
	shape: FrameShape;
	span: [number, number];
	traitsSpan?: [number, number];
	corner: number | 'cut';
	stroke: string;
	color: FrameColor;
	dash?: string;
	box?: boolean;
	path?: string | null;
	image?: FrameImageConfig | null;
	ring?: RingConfig | null;
	ringConfig?: RingConfig | null;
	position?: 'left' | 'right' | 'center';
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
 * Normalizes a stored image zoom to a multiplier. Legacy files stored zoom as
 * a percentage (100 = 1x), which rendered as 10000%. Values above 10 are
 * treated as percentages.
 */
export function normalizeZoom(value: unknown): number | undefined {
	if (typeof value !== 'number' || !Number.isFinite(value)) return undefined;
	const zoom = value > 10 ? value / 100 : value;
	return Math.round(zoom * 1000) / 1000;
}

/**
 * Normalizes traitSet.view.frame (or direct frame config / shorthand) to full FrameConfig.
 */
export function resolveFrame(traitSetOrFrame: any): FrameConfig | null {
	if (!traitSetOrFrame) return null;
	const view = traitSetOrFrame.view !== undefined ? getView(traitSetOrFrame) : traitSetOrFrame;
	const raw =
		traitSetOrFrame.view !== undefined
			? view?.frame
			: traitSetOrFrame.frame !== undefined
				? traitSetOrFrame.frame
				: traitSetOrFrame.traits !== undefined || traitSetOrFrame.name !== undefined || traitSetOrFrame.id !== undefined
					? null
					: traitSetOrFrame;

	const rawObj = typeof raw === 'object' && raw ? (raw as any) : null;
	const rawImage = rawObj?.image || (view?.frame as any)?.image;
	const imageZoom = normalizeZoom(rawImage?.zoom);
	const frameImage: FrameImageConfig | null =
		rawImage && typeof rawImage === 'object' && (rawImage.url || rawImage.alignment || rawImage.zoom !== undefined)
			? {
					...(rawImage.url ? { url: String(rawImage.url).trim() } : {}),
					...(rawImage.alignment ? { alignment: String(rawImage.alignment).trim() } : {}),
					...(imageZoom !== undefined ? { zoom: imageZoom } : {}),
				}
			: null;
	const rawRingCfg =
		rawObj?.ring ||
		(view?.frame as any)?.ring ||
		view?.ringConfig ||
		rawObj?.ringConfig ||
		(traitSetOrFrame as any)?.ringConfig;
	const ringConfig: RingConfig | null = rawRingCfg
		? {
				arcAngle: rawRingCfg.arcAngle ?? (rawRingCfg.arcSlide !== undefined ? rawRingCfg.arcSlide * 3 : -90),
				arcSpread: rawRingCfg.arcSpread ?? 100,
				arcDistance: rawRingCfg.arcDistance ?? 0,
				scaleAngle: rawRingCfg.scaleAngle ?? 0,
				scaleDistance: rawRingCfg.scaleDistance ?? 0,
				scaleDieX: rawRingCfg.scaleDieX ?? 0,
				scaleDieY: rawRingCfg.scaleDieY ?? 0,
			}
		: null;

	if (!raw) {
		if (view?.style?.body === 'portrait-ring') {
			return {
				shape: 'ring',
				span: [0, 360],
				corner: 8,
				stroke: '2px',
				color: 'primary',
				box: false,
				path: null,
				...(frameImage ? { image: frameImage } : {}),
				ring: ringConfig,
				ringConfig,
			};
		}
		return null;
	}

	if (typeof raw === 'string') {
		if (raw === 'none' || !raw.trim()) return null;
		const shape = raw.trim() as FrameShape;
		return {
			shape,
			span: shape === 'arc' ? [45, 135] : [0, 360],
			corner: 8,
			stroke: '2px',
			color: 'primary',
			box: false,
			path: null,
			...(frameImage ? { image: frameImage } : {}),
			...(shape === 'ring' ? { ring: ringConfig, ringConfig } : { ringConfig: null }),
		};
	}

	if (typeof raw === 'object' && !Array.isArray(raw)) {
		const shape = (raw.shape || 'block') as FrameShape;
		if (shape === 'none') return null;
		const defaultSpan: [number, number] = shape === 'arc' ? [45, 135] : [0, 360];
		const parseNum = (val: any, fallback: number): number => {
			const n = Number(val);
			return Number.isFinite(n) ? n : fallback;
		};
		const rawSpan =
			Array.isArray(raw.span) && raw.span.length >= 2
				? [parseNum(raw.span[0], defaultSpan[0]), parseNum(raw.span[1], defaultSpan[1])]
				: defaultSpan;
		const traitsSpan: [number, number] | undefined =
			Array.isArray(raw.traitsSpan) && raw.traitsSpan.length >= 2
				? [parseNum(raw.traitsSpan[0], defaultSpan[0]), parseNum(raw.traitsSpan[1], defaultSpan[1])]
				: undefined;
		// For open arc shape, prevent 360° full-circle collapse and normalize legacy dome spans (e.g. [-110, 110])
		const isLegacyArcSpan =
			shape === 'arc' &&
			(Math.abs(rawSpan[1] - rawSpan[0]) > 180 ||
				rawSpan[0] < 0 ||
				(rawSpan[0] === -110 && rawSpan[1] === 110) ||
				(rawSpan[0] === -120 && rawSpan[1] === 120));
		const span: [number, number] = isLegacyArcSpan ? defaultSpan : (rawSpan as [number, number]);
		const effectiveRingConfig =
			shape === 'ring' || view?.style?.body === 'portrait-ring'
				? rawObj?.ring || rawObj?.ringConfig || ringConfig || null
				: null;

		let color: FrameColor = 'primary';
		let stroke = '2px';
		let dash = typeof raw.dash === 'string' && raw.dash.trim() ? raw.dash.trim() : undefined;

		if (typeof raw.color === 'string' && raw.color.trim()) {
			color = raw.color.trim() as FrameColor;
			stroke = typeof raw.stroke === 'string' && raw.stroke.trim() ? raw.stroke.trim() : '2px';
		} else if (typeof raw.stroke === 'string' && raw.stroke.trim()) {
			const sVal = raw.stroke.trim();
			if (sVal === 'dashed') {
				color = 'primary';
				stroke = '2px';
				dash = dash || '6 3';
			} else if (sVal === 'muted') {
				color = 'muted';
				stroke = '1.5px';
			} else if (['primary', 'accent', 'strong', 'black'].includes(sVal)) {
				color = sVal as FrameColor;
				stroke = '2px';
			} else {
				stroke = sVal;
			}
		}
		const box = Boolean(raw.box);

		const position =
			raw.position === 'left' || raw.position === 'right' || raw.position === 'center' ? raw.position : undefined;

		return {
			shape,
			span,
			...(traitsSpan ? { traitsSpan } : {}),
			corner: raw.corner === 'cut' ? 'cut' : Number.isFinite(Number(raw.corner)) ? Number(raw.corner) : 8,
			stroke,
			color,
			...(dash ? { dash } : {}),
			box,
			path: typeof raw.path === 'string' && raw.path.trim() ? raw.path.trim() : null,
			...(frameImage ? { image: frameImage } : {}),
			...(position ? { position } : {}),
			...(effectiveRingConfig ? { ring: effectiveRingConfig, ringConfig: effectiveRingConfig } : { ringConfig: null }),
		};
	}
	return null;
}

/**
 * Dynamically computes positional anchors around a frame for N visible traits.
 * Closed loops distribute across 360°; open arcs distribute along the span.
 * Outward quadrant docking ensures multi-part tracks never collide with frame interior.
 */
export function computeFrameAnchors(count: number, config: FrameConfig): FrameAnchor[] {
	if (config.shape === 'line' || config.shape === 'block' || count <= 0) {
		return [];
	}

	let rx = 27;
	let ry = 27;
	if (config.shape === 'ellipse') {
		rx = 31;
		ry = 23;
	} else if (config.shape === 'arc') {
		rx = 28;
		ry = 28;
	}

	const effectiveSpan = config.traitsSpan || config.span;
	const delta = effectiveSpan[1] - effectiveSpan[0];
	const isClosed = Math.abs(delta) >= 360;
	const anchors: FrameAnchor[] = [];

	for (let i = 0; i < count; i++) {
		let theta_i: number;
		if (isClosed) {
			const t_i = i / count;
			theta_i = effectiveSpan[0] + t_i * 360;
		} else {
			const t_i = count === 1 ? 0.5 : i / (count - 1);
			theta_i = effectiveSpan[0] + t_i * delta;
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
			angle: Math.round(theta_i * 100) / 100,
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
		ry = 28;
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
