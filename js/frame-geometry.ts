/**
 * Pure Deterministic SVG Frame Geometry & Dynamic Positional Anchor Math (Phase 3c).
 * Zero DOM layout dependencies so all calculations can be unit-tested deterministically.
 */
import { getView } from './model.ts';

export type BorderShape = 'none' | 'block' | 'line';

export type PortraitFrameShape = 'none' | 'circle' | 'square' | 'round' | 'cut';

export type TraitArrayMode = 'none' | 'ring' | 'arc';

export type FrameShape = PortraitFrameShape | 'ring' | 'arc' | 'block' | 'line';

export type FrameColor = 'primary' | 'secondary' | 'accent' | 'muted' | 'strong' | 'black' | (string & {});

export interface BorderConfig {
	shape: BorderShape;
	explicit: boolean;
	stroke: string;
	color: FrameColor;
	corner: number | 'cut';
	dash?: string;
	tint?: string;
}

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
	portraitShape: PortraitFrameShape;
	array: TraitArrayMode;
	span: [number, number];
	traitsSpan?: [number, number];
	size?: number;
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
 * Normalizes a stored image zoom multiplier.
 */
export function normalizeZoom(value: unknown): number | undefined {
	if (typeof value !== 'number' || !Number.isFinite(value)) return undefined;
	return Math.round(value * 1000) / 1000;
}

/**
 * Normalizes a ring or radial frame diameter in px.
 */
export function normalizeRingSize(value: unknown): number | undefined {
	if (typeof value !== 'number' || !Number.isFinite(value)) return undefined;
	return Math.min(520, Math.max(80, Math.round(value)));
}

function parseFrameStrokeAndColor(raw: any): { color: FrameColor; stroke: string; dash?: string } {
	let color: FrameColor = 'primary';
	let stroke = '2px';
	let dash = typeof raw?.dash === 'string' && raw.dash.trim() ? raw.dash.trim() : undefined;

	if (typeof raw?.color === 'string' && raw.color.trim()) {
		color = raw.color.trim() as FrameColor;
		stroke = typeof raw.stroke === 'string' && raw.stroke.trim() ? raw.stroke.trim() : '2px';
	} else if (typeof raw?.stroke === 'string' && raw.stroke.trim()) {
		const sVal = raw.stroke.trim();
		if (sVal === 'dashed') {
			color = 'primary';
			stroke = '2px';
			dash = dash || '6 3';
		} else if (sVal === 'muted') {
			color = 'muted';
			stroke = '1.5px';
		} else if (['primary', 'accent', 'strong', 'black', 'secondary'].includes(sVal)) {
			color = sVal as FrameColor;
			stroke = '2px';
		} else {
			stroke = sVal;
		}
	}
	return { color, stroke, ...(dash ? { dash } : {}) };
}

function parseCorner(rawCorner: unknown, fallback = 8): number | 'cut' {
	if (rawCorner === 'cut') return 'cut';
	if (rawCorner === 'square') return 0;
	if (rawCorner === 'round') return 8;
	if (rawCorner !== undefined && rawCorner !== null && Number.isFinite(Number(rawCorner))) {
		return Number(rawCorner);
	}
	return fallback;
}

/**
 * Resolves section container border (`view.border`: `'none' | 'block' | 'line'`).
 * Preserves classic card borders for Library sets without explicit `view.border`,
 * `borderless`, or portrait/radial frame declarations.
 */
export function resolveBorder(traitSetOrView: any): BorderConfig {
	const fallbackClassic: BorderConfig = { shape: 'block', explicit: false, stroke: '2px', color: 'strong', corner: 0 };
	if (!traitSetOrView || typeof traitSetOrView !== 'object') return fallbackClassic;
	const view = traitSetOrView.view !== undefined ? getView(traitSetOrView) : traitSetOrView;
	if (!view || typeof view !== 'object') return fallbackClassic;

	const viewTint = typeof view.tint === 'string' && view.tint.trim() ? view.tint.trim() : undefined;
	const rawBorder = (view as any).border;
	if (typeof rawBorder === 'string' && rawBorder.trim()) {
		const shape = rawBorder.trim() as BorderShape;
		if (shape === 'none' || shape === 'block' || shape === 'line') {
			return {
				shape,
				explicit: true,
				stroke: '2px',
				color: 'primary',
				corner: 8,
				...(viewTint ? { tint: viewTint } : {}),
			};
		}
	}
	if (rawBorder && typeof rawBorder === 'object' && !Array.isArray(rawBorder)) {
		const shape: BorderShape =
			rawBorder.shape === 'none' || rawBorder.shape === 'line' || rawBorder.shape === 'block'
				? rawBorder.shape
				: 'block';
		const sc = parseFrameStrokeAndColor(rawBorder);
		const tint = typeof rawBorder.tint === 'string' && rawBorder.tint.trim() ? rawBorder.tint.trim() : viewTint;
		return {
			shape,
			explicit: true,
			stroke: sc.stroke,
			color: sc.color,
			corner: parseCorner(rawBorder.corner, 8),
			...(sc.dash ? { dash: sc.dash } : {}),
			...(tint ? { tint } : {}),
		};
	}

	// Legacy fallbacks: frame.shape = 'block' | 'line', frame.box = true, or view.borderless = true
	const rawFrame = view.frame as any;
	if (typeof rawFrame === 'string' && (rawFrame === 'block' || rawFrame === 'line')) {
		return {
			shape: rawFrame,
			explicit: true,
			stroke: '2px',
			color: 'primary',
			corner: 8,
			...(viewTint ? { tint: viewTint } : {}),
		};
	}
	if (
		rawFrame &&
		typeof rawFrame === 'object' &&
		(rawFrame.shape === 'block' || rawFrame.shape === 'line' || rawFrame.box)
	) {
		const shape: BorderShape = rawFrame.shape === 'line' ? 'line' : 'block';
		const sc = parseFrameStrokeAndColor(rawFrame);
		return {
			shape,
			explicit: true,
			stroke: sc.stroke,
			color: sc.color,
			corner: parseCorner(rawFrame.corner, 8),
			...(sc.dash ? { dash: sc.dash } : {}),
			...(viewTint ? { tint: viewTint } : {}),
		};
	}
	if (view.borderless === true) {
		return { shape: 'none', explicit: true, stroke: '2px', color: 'primary', corner: 8 };
	}
	if (view.style?.body === 'name' || view.style?.body === 'portrait-ring') {
		return { shape: 'none', explicit: false, stroke: '2px', color: 'primary', corner: 8 };
	}
	if (rawFrame && typeof rawFrame === 'object' && rawFrame.shape && rawFrame.shape !== 'none') {
		return { shape: 'none', explicit: false, stroke: '2px', color: 'primary', corner: 8 };
	}
	if (typeof rawFrame === 'string' && rawFrame && rawFrame !== 'none') {
		return { shape: 'none', explicit: false, stroke: '2px', color: 'primary', corner: 8 };
	}

	return fallbackClassic;
}

function toPortraitShape(shape: string | undefined): PortraitFrameShape {
	if (shape === 'none') return 'none';
	if (shape === 'square') return 'square';
	if (shape === 'round') return 'round';
	if (shape === 'cut') return 'cut';
	if (shape === 'circle' || shape === 'ring' || shape === 'arc') return 'circle';
	return 'none';
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
	const ringSize = normalizeRingSize(rawObj?.size ?? (view?.frame as any)?.size);
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

	const hasExplicitRingTraits =
		Array.isArray(traitSetOrFrame?.traits) && traitSetOrFrame.traits.some((t: any) => Boolean(getView(t)?.ring));
	const setRatingType = traitSetOrFrame?.rating?.type;

	if (!raw) {
		if (view?.style?.body === 'portrait-ring') {
			return {
				shape: 'circle',
				portraitShape: 'circle',
				array: 'ring',
				span: [0, 360],
				...(ringSize !== undefined ? { size: ringSize } : {}),
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
		if (view?.style?.body !== 'image' && view?.style?.body !== 'name' && view?.imageConfig?.url) {
			return {
				shape: 'circle',
				portraitShape: 'circle',
				array: 'none',
				span: [0, 360],
				...(ringSize !== undefined ? { size: ringSize } : {}),
				corner: 8,
				stroke: '2px',
				color: 'primary',
				box: false,
				path: null,
				image: {
					url: String(view.imageConfig.url).trim(),
					...(view.imageConfig.alignment ? { alignment: String(view.imageConfig.alignment) } : {}),
					...(normalizeZoom(view.imageConfig.zoom) !== undefined ? { zoom: normalizeZoom(view.imageConfig.zoom) } : {}),
				},
				ringConfig: null,
			};
		}
		return null;
	}

	if (typeof raw === 'string') {
		if (raw === 'none' || raw === 'line' || !raw.trim()) return null;
		const normalized = raw.trim() === 'ellipse' ? 'circle' : raw.trim();
		const shape = normalized as FrameShape;
		const portraitShape = toPortraitShape(shape);
		const array: TraitArrayMode = shape === 'arc' ? 'arc' : shape === 'ring' ? 'ring' : 'none';
		return {
			shape,
			portraitShape,
			array,
			span: shape === 'arc' ? [45, 135] : [0, 360],
			corner: 8,
			stroke: '2px',
			color: 'primary',
			box: false,
			path: null,
			...(frameImage ? { image: frameImage } : {}),
			...(array !== 'none' ? { ring: ringConfig, ringConfig } : { ringConfig: null }),
		};
	}

	if (typeof raw === 'object' && !Array.isArray(raw)) {
		const rawShape = raw.shape === 'ellipse' ? 'circle' : raw.shape;
		const shape = (rawShape || 'none') as FrameShape;
		if ((shape as string) === 'line') return null;
		const explicitArray: TraitArrayMode | undefined =
			raw.array === 'none' || raw.array === 'ring' || raw.array === 'arc' ? raw.array : undefined;
		const position =
			raw.position === 'left' || raw.position === 'right' || raw.position === 'center' ? raw.position : undefined;

		if (
			shape === 'none' &&
			(!explicitArray || explicitArray === 'none') &&
			!frameImage &&
			ringSize === undefined &&
			!position
		) {
			return null;
		}

		const defaultSpan: [number, number] = shape === 'arc' || explicitArray === 'arc' ? [45, 135] : [0, 360];
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
		const isDomeSpan =
			shape === 'arc' &&
			(Math.abs(rawSpan[1] - rawSpan[0]) > 180 ||
				rawSpan[0] < 0 ||
				(rawSpan[0] === -110 && rawSpan[1] === 110) ||
				(rawSpan[0] === -120 && rawSpan[1] === 120));
		const span: [number, number] = isDomeSpan ? defaultSpan : (rawSpan as [number, number]);

		let array: TraitArrayMode;
		if (explicitArray !== undefined) {
			array = explicitArray;
		} else if (traitsSpan || shape === 'arc') {
			array = 'arc';
		} else if (shape === 'ring' || view?.style?.body === 'portrait-ring') {
			if (frameImage?.url && !raw.ring && !raw.ringConfig && !hasExplicitRingTraits && setRatingType !== 'Dice') {
				array = 'none';
			} else {
				array = 'ring';
			}
		} else {
			array = 'none';
		}

		const portraitShape: PortraitFrameShape =
			shape === 'block' || shape === 'line'
				? frameImage?.url || ringSize !== undefined || array !== 'none'
					? 'circle'
					: 'none'
				: toPortraitShape(shape);

		const effectiveRingConfig = array !== 'none' ? rawObj?.ring || rawObj?.ringConfig || ringConfig || null : null;
		const sc = parseFrameStrokeAndColor(raw);
		const box = Boolean(raw.box);

		return {
			shape,
			portraitShape,
			array,
			span,
			...(traitsSpan ? { traitsSpan } : {}),
			...(ringSize !== undefined ? { size: ringSize } : {}),
			corner: parseCorner(raw.corner, 8),
			stroke: sc.stroke,
			color: sc.color,
			...(sc.dash ? { dash: sc.dash } : {}),
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
 */
export function computeFrameAnchors(count: number, config: FrameConfig): FrameAnchor[] {
	if (config.shape === 'line' || config.shape === 'block' || count <= 0) {
		return [];
	}

	const rx = config.shape === 'arc' ? 28 : 27;
	const ry = config.shape === 'arc' ? 28 : 27;

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
 * Builds the portrait frame perimeter path inside a 100x100 viewBox
 * matching `.portrait-inner` aspect-ratio 1:1.
 */
export function buildPortraitFramePath(portraitShape: PortraitFrameShape, span: [number, number] = [0, 360]): string {
	if (portraitShape === 'none') return '';
	if (portraitShape === 'square') {
		return 'M 1,1 L 99,1 L 99,99 L 1,99 Z';
	}
	if (portraitShape === 'round') {
		return buildBlockPath(14, 100, 100);
	}
	if (portraitShape === 'cut') {
		return 'M 12,1 L 88,1 L 99,12 L 99,88 L 88,99 L 12,99 L 1,88 L 1,12 Z';
	}
	// 'circle'
	const delta = span[1] - span[0];
	if (Math.abs(delta) >= 360) {
		return 'M 50,1 A 49 49 0 1 1 49.99,1 Z';
	}
	const rad0 = (span[0] - 90) * (Math.PI / 180);
	const rad1 = (span[1] - 90) * (Math.PI / 180);
	const x0 = 50 + 49 * Math.cos(rad0);
	const y0 = 50 + 49 * Math.sin(rad0);
	const x1 = 50 + 49 * Math.cos(rad1);
	const y1 = 50 + 49 * Math.sin(rad1);
	const largeArc = Math.abs(delta) > 180 ? 1 : 0;
	const sweep = delta >= 0 ? 1 : 0;
	return `M ${x0.toFixed(2)},${y0.toFixed(2)} A 49 49 0 ${largeArc} ${sweep} ${x1.toFixed(2)},${y1.toFixed(2)}`;
}

/**
 * Builds the radial shape path (ring or arc) in a 100x100 viewBox.
 */
export function buildRadialShapePath(config: FrameConfig): string {
	const rx = config.shape === 'arc' ? 28 : 26;
	const ry = config.shape === 'arc' ? 28 : 26;

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
	if (config.box && (config.shape === 'ring' || config.shape === 'arc')) {
		const box = buildBlockPath(config.corner, 100, 100);
		return `${box} ${radial}`;
	}

	return radial;
}
