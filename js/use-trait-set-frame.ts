import { computed, toRaw, type ComputedRef, type Ref } from 'vue';
import { characterCurioFunctions } from './functions.ts';
import {
	getRingBadgeDie,
	getView,
	setRingBadgeDie,
	type Character,
	type CharacterCurioCustom,
	type ImageConfig,
	type ImageLayoutMode,
	type RingConfig,
	type TraitSet,
} from './model.ts';
import {
	normalizeRingSize,
	normalizeZoom,
	resolveBorder,
	resolveFrame,
	type BorderConfig,
	type BorderShape,
	type FrameConfig,
	type PortraitFrameShape,
	type TraitArrayMode,
} from './frame-geometry.ts';
import { getCharacterColorTokens } from './color-palette.ts';

export type MutableFrameConfig = Partial<FrameConfig> & {
	ring?: RingConfig | null;
	image?: { url?: string; alignment?: string; zoom?: number } | null;
	[k: string]: unknown;
};

export type MutableBorderConfig = Partial<BorderConfig> & Record<string, unknown>;

export interface UseTraitSetFrameDeps {
	character: ComputedRef<Character>;
	traitSetID: ComputedRef<number>;
	traitSet: ComputedRef<TraitSet | null>;
	styleBody: ComputedRef<string>;
	imageFileInput: Ref<HTMLInputElement | null>;
	uploadError: Ref<string>;
	ctkFor: (s: number) => CharacterCurioCustom;
	updateCharacter: (character?: Character) => void;
}

export function useTraitSetFrame(deps: UseTraitSetFrameDeps) {
	const { character, traitSetID, traitSet, styleBody, imageFileInput, uploadError, ctkFor, updateCharacter } = deps;

	function getFrameRing(view: CharacterCurioCustom | undefined): RingConfig | null {
		const f = view?.frame;
		if (!f || typeof f !== 'object') return null;
		return f.ring ?? null;
	}

	function normalizedFrameBase(): MutableFrameConfig {
		const raw = getView(traitSet.value)?.frame;
		const res = resolveFrame(traitSet.value);
		if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
			const copy = structuredClone(toRaw(raw)) as MutableFrameConfig;
			if (res) {
				copy.shape = res.portraitShape;
				copy.array = res.array;
			}
			return copy;
		}
		if (res) {
			return {
				shape: res.portraitShape,
				array: res.array,
				span: [...res.span],
				...(res.traitsSpan ? { traitsSpan: [...res.traitsSpan] } : {}),
				color: res.color,
				stroke: res.stroke,
				...(res.size !== undefined ? { size: res.size } : {}),
				...(res.position ? { position: res.position } : {}),
				...(res.image ? { image: structuredClone(res.image) } : {}),
				...(res.ring ? { ring: structuredClone(res.ring) } : {}),
			};
		}
		return {
			shape: 'none',
			array: 'none',
			span: [0, 360],
			color: 'primary',
			stroke: '2px',
		};
	}

	function syncArcTraitsSpan(ctk: CharacterCurioCustom, angle: number, spread: number) {
		const frameObj = typeof ctk.frame === 'object' && ctk.frame !== null ? (ctk.frame as MutableFrameConfig) : null;
		if (!frameObj || frameObj.array !== 'arc') return;
		const centerClock = angle + 180;
		const totalSpan = Math.max(15, (spread / 100) * 360);
		const nextSpan: [number, number] = [
			Math.round(centerClock - totalSpan / 2),
			Math.round(centerClock + totalSpan / 2),
		];
		frameObj.traitsSpan = nextSpan;
		if (Array.isArray(frameObj.span) && Math.abs((frameObj.span[1] ?? 360) - (frameObj.span[0] ?? 0)) < 360) {
			frameObj.span = [...nextSpan];
		}
	}

	function setRingConfig<K extends keyof RingConfig>(key: K, value: RingConfig[K]) {
		const ctk = ctkFor(traitSetID.value);
		const frameObj = normalizedFrameBase();
		const existingRing = frameObj.ring;
		frameObj.ring ??= {
			arcAngle: existingRing?.arcAngle ?? -90,
			arcSpread: existingRing?.arcSpread ?? 100,
			arcDistance: existingRing?.arcDistance ?? 0,
			scaleAngle: existingRing?.scaleAngle ?? 0,
			scaleDistance: existingRing?.scaleDistance ?? 0,
			scaleDieX: existingRing?.scaleDieX ?? 0,
			scaleDieY: existingRing?.scaleDieY ?? 0,
		};
		frameObj.ring[key] = value;
		ctk.frame = frameObj;
		updateCharacter(structuredClone(toRaw(character.value)));
	}

	function resetRingPlacement() {
		const ctk = ctkFor(traitSetID.value);
		const frameObj = normalizedFrameBase();
		frameObj.ring = {
			arcAngle: -90,
			arcSpread: 100,
			arcDistance: 0,
			scaleAngle: 0,
			scaleDistance: 0,
			scaleDieX: 0,
			scaleDieY: 0,
		};
		ctk.frame = frameObj;
		updateCharacter(structuredClone(toRaw(character.value)));
	}

	const ringSpread = computed({
		get: () => {
			const res = resolveFrame(traitSet.value);
			if (res?.array === 'arc' && res.traitsSpan) {
				const raw = ((res.traitsSpan[1] - res.traitsSpan[0]) / 360) * 100;
				return Math.max(10, Math.min(100, Math.round(raw)));
			}
			return getFrameRing(getView(traitSet.value))?.arcSpread ?? 100;
		},
		set: (val: number) => {
			const num = Number(val);
			setRingConfig('arcSpread', num);
			const ctk = ctkFor(traitSetID.value);
			syncArcTraitsSpan(ctk, ringAngle.value, num);
			updateCharacter(structuredClone(toRaw(character.value)));
		},
	});

	const ringDistance = computed({
		get: () => getFrameRing(getView(traitSet.value))?.arcDistance ?? 0,
		set: (val: number) => {
			setRingConfig('arcDistance', Number(val));
		},
	});

	const ringAngle = computed({
		get: () => {
			const res = resolveFrame(traitSet.value);
			if (res?.array === 'arc' && res.traitsSpan) {
				let a = Math.round((res.traitsSpan[0] + res.traitsSpan[1]) / 2 - 180);
				while (a > 180) a -= 360;
				while (a < -180) a += 360;
				return a;
			}
			const cfg = getFrameRing(getView(traitSet.value));
			return cfg?.arcAngle ?? -90;
		},
		set: (val: number) => {
			const num = Number(val);
			setRingConfig('arcAngle', num);
			const ctk = ctkFor(traitSetID.value);
			syncArcTraitsSpan(ctk, num, ringSpread.value);
			updateCharacter(structuredClone(toRaw(character.value)));
		},
	});

	const ringAngleLabel = computed(() => {
		const a = ringAngle.value;
		if (a === 0) return 'Bottom';
		if (a === -90) return 'Right';
		if (a === 90) return 'Left';
		if (a === 180 || a === -180) return 'Top';
		return (a > 0 ? '+' + a : a) + '°';
	});

	const scaleAngle = computed({
		get: () => getFrameRing(getView(traitSet.value))?.scaleAngle ?? 0,
		set: (val: number) => {
			setRingConfig('scaleAngle', Number(val));
		},
	});

	const scaleAngleLabel = computed(() => {
		const a = scaleAngle.value;
		if (a === 0) return 'Bottom';
		if (a === -90) return 'Right';
		if (a === 90) return 'Left';
		if (a === 180 || a === -180) return 'Top';
		return (a > 0 ? '+' + a : a) + '°';
	});

	const scaleDistance = computed({
		get: () => getFrameRing(getView(traitSet.value))?.scaleDistance ?? 0,
		set: (val: number) => {
			setRingConfig('scaleDistance', Number(val));
		},
	});

	const ringScaleY = computed({
		get: () => getFrameRing(getView(traitSet.value))?.scaleDieY ?? 0,
		set: (val: number) => {
			setRingConfig('scaleDieY', Number(val));
		},
	});

	const ringScaleX = computed({
		get: () => getFrameRing(getView(traitSet.value))?.scaleDieX ?? 0,
		set: (val: number) => {
			setRingConfig('scaleDieX', Number(val));
		},
	});

	const scaleDieValue = computed({
		get: () => getRingBadgeDie(traitSet.value),
		set: (val: number) => {
			if (!traitSet.value) return;
			setRingBadgeDie(traitSet.value, val);
			updateCharacter(character.value);
		},
	});

	function setImageConfig<K extends keyof ImageConfig>(key: K, value: ImageConfig[K]) {
		const ctk = ctkFor(traitSetID.value);
		ctk.imageConfig ??= {};
		if (value === undefined) {
			delete ctk.imageConfig[key];
		} else {
			ctk.imageConfig[key] = value;
		}
		updateCharacter(character.value);
	}

	const imageURL = computed({
		get: () => getView(traitSet.value)?.imageConfig?.url ?? '',
		set: (val: string) => {
			setImageConfig('url', val);
		},
	});

	const imageAlignment = computed({
		get: () => getView(traitSet.value)?.imageConfig?.alignment ?? 'center',
		set: (val: string) => {
			setImageConfig('alignment', val);
		},
	});

	const imageHeight = computed({
		get: () => getView(traitSet.value)?.imageConfig?.height ?? 'auto',
		set: (val: string) => {
			setImageConfig('height', val);
		},
	});

	const imageWidth = computed({
		get: () => getView(traitSet.value)?.imageConfig?.width ?? '100%',
		set: (val: string) => {
			setImageConfig('width', val);
		},
	});

	const imageCaption = computed({
		get: () => getView(traitSet.value)?.imageConfig?.caption ?? '',
		set: (val: string) => {
			setImageConfig('caption', val);
		},
	});

	const imageZoom = computed({
		get: () => {
			const cfgZoom = normalizeZoom(getView(traitSet.value)?.imageConfig?.zoom);
			return typeof cfgZoom === 'number' ? cfgZoom : 1;
		},
		set: (val: number) => {
			setImageConfig('zoom', Number(val));
		},
	});

	const imageLayout = computed<ImageLayoutMode>({
		get: () => {
			const l = getView(traitSet.value)?.imageConfig?.layout;
			return l === 'above' || l === 'below' ? l : 'overlay';
		},
		set: (val: ImageLayoutMode) => {
			setImageConfig('layout', val === 'overlay' ? undefined : val);
		},
	});

	function uploadImageStart() {
		if (imageFileInput.value) {
			imageFileInput.value.click();
		}
	}

	function uploadImageProcess(event: Event) {
		uploadError.value = '';
		const input = event.target as HTMLInputElement | null;
		if (!input?.files || !input.files.length) {
			imageURL.value = '';
			return;
		}
		characterCurioFunctions.processImageFile(input.files[0], 1280, 0.85).then(
			(dataURL: string) => {
				imageURL.value = dataURL;
				input.value = '';
			},
			(error: unknown) => {
				uploadError.value = error instanceof Error ? error.message : 'Could not process that image.';
				input.value = '';
			},
		);
	}

	function removeImage() {
		imageURL.value = '';
	}

	function setFrameImage(key: 'url' | 'alignment' | 'zoom', value: string | number | undefined) {
		const ctk = ctkFor(traitSetID.value);
		const frameObj = normalizedFrameBase();
		if (key === 'url' && value && (!frameObj.shape || frameObj.shape === 'none')) {
			frameObj.shape = 'circle';
		}
		frameObj.image ??= {};
		if (value === '' || value === undefined) {
			delete frameObj.image[key];
			if (key === 'url' && ctk.imageConfig && typeof ctk.imageConfig === 'object') {
				delete ctk.imageConfig.url;
			}
			if (Object.keys(frameObj.image).length === 0) {
				delete frameObj.image;
			}
		} else {
			(frameObj.image as Record<string, unknown>)[key] = value;
		}
		ctk.frame = frameObj;
		updateCharacter(character.value);
	}

	const frameImageUrl = computed({
		get: () => {
			const res = resolveFrame(traitSet.value);
			return res?.image?.url || getView(traitSet.value)?.imageConfig?.url || '';
		},
		set: (val: string) => {
			setFrameImage('url', val);
		},
	});

	const frameImageAlignment = computed({
		get: () => {
			const res = resolveFrame(traitSet.value);
			return res?.image?.alignment || getView(traitSet.value)?.imageConfig?.alignment || 'center';
		},
		set: (val: string) => {
			setFrameImage('alignment', val);
		},
	});

	const frameImageZoom = computed({
		get: () => {
			const res = resolveFrame(traitSet.value);
			const z = normalizeZoom(res?.image?.zoom ?? getView(traitSet.value)?.imageConfig?.zoom);
			return typeof z === 'number' ? z : 1;
		},
		set: (val: number) => {
			setFrameImage('zoom', Number(val));
		},
	});

	function uploadPortraitImageProcess(event: Event) {
		uploadError.value = '';
		const input = event.target as HTMLInputElement | null;
		const files = input?.files;
		if (!files || !files.length) return;
		characterCurioFunctions.processImageFile(files[0], 1280, 0.85).then(
			(dataURL: string) => {
				frameImageUrl.value = dataURL;
				if (input) input.value = '';
			},
			(error: unknown) => {
				uploadError.value = error instanceof Error ? error.message : 'Could not process that image.';
				if (input) input.value = '';
			},
		);
	}

	const frameColorTokens = computed(() => getCharacterColorTokens(character.value, 'frame'));

	const borderOptions = [
		{ id: 'none', label: 'None' },
		{ id: 'block', label: 'Block' },
		{ id: 'line', label: 'Line' },
	];

	const resolvedBorder = computed(() => resolveBorder(traitSet.value));

	function normalizedBorderObj(defaultShape: BorderShape): MutableBorderConfig {
		const cur = resolveBorder(character.value.traitSets[traitSetID.value]);
		const obj: MutableBorderConfig = {
			shape: defaultShape,
			color: cur.color || (defaultShape === 'line' ? 'strong' : 'primary'),
			stroke: cur.stroke || '2px',
		};
		if (defaultShape === 'block') {
			obj.corner = cur.corner === 'cut' ? 'cut' : cur.corner === 0 ? 0 : 8;
		}
		if (cur.dash) {
			obj.dash = cur.dash;
		}
		return obj;
	}

	function setBorderShape(shape: BorderShape) {
		const ctk = ctkFor(traitSetID.value);
		ctk.border = shape === 'none' ? 'none' : normalizedBorderObj(shape);
		updateCharacter(structuredClone(toRaw(character.value)));
	}

	const borderShape = computed<BorderShape>({
		get: () => resolvedBorder.value.shape,
		set: (shape: BorderShape) => setBorderShape(shape),
	});

	function setBorderProp(key: string, value: unknown) {
		const ctk = ctkFor(traitSetID.value);
		const shape = resolvedBorder.value.shape === 'none' ? 'block' : resolvedBorder.value.shape;
		const obj = normalizedBorderObj(shape);
		if (value === undefined || value === '') {
			delete obj[key];
		} else {
			obj[key] = value;
		}
		ctk.border = obj;
		updateCharacter(structuredClone(toRaw(character.value)));
	}

	const borderWidth = computed({
		get: () => resolvedBorder.value.stroke || '2px',
		set: (stroke: string) => setBorderProp('stroke', stroke && stroke.trim() ? stroke.trim() : '2px'),
	});

	const borderColor = computed({
		get: () => resolvedBorder.value.color || 'primary',
		set: (color: string) => setBorderProp('color', color || 'primary'),
	});

	const borderCorner = computed<'square' | 'round' | 'cut'>({
		get: () => {
			const c = resolvedBorder.value.corner;
			if (c === 'cut') return 'cut';
			if (c === 0) return 'square';
			return 'round';
		},
		set: (val: 'square' | 'round' | 'cut') => {
			const mapped = val === 'cut' ? 'cut' : val === 'square' ? 0 : 8;
			setBorderProp('corner', mapped);
		},
	});

	const borderDash = computed({
		get: () => resolvedBorder.value.dash || '',
		set: (dash: string) => setBorderProp('dash', dash.trim() || undefined),
	});

	function setFrameTint(tint: string) {
		const ctk = ctkFor(traitSetID.value);
		const trimmed = String(tint || '').trim();
		if (trimmed) {
			ctk.tint = trimmed;
		} else {
			delete ctk.tint;
		}
		updateCharacter(structuredClone(toRaw(character.value)));
	}

	const frameTint = computed<string>({
		get: () => {
			const t = getView(traitSet.value)?.tint;
			return typeof t === 'string' ? t : '';
		},
		set: (tint: string) => {
			setFrameTint(tint);
		},
	});

	const portraitFrameOptions = [
		{ id: 'none', label: 'None' },
		{ id: 'circle', label: 'Circle' },
		{ id: 'square', label: 'Square' },
		{ id: 'round', label: 'Round' },
		{ id: 'cut', label: 'Cut' },
	];

	const traitArrayOptions = [
		{ id: 'none', label: 'None' },
		{ id: 'ring', label: 'Ring' },
		{ id: 'arc', label: 'Arc' },
	];

	const portraitFrameShape = computed<PortraitFrameShape>({
		get: () => resolveFrame(traitSet.value)?.portraitShape ?? 'none',
		set: (shape: PortraitFrameShape) => {
			const ctk = ctkFor(traitSetID.value);
			const f = normalizedFrameBase();
			f.shape = shape;
			if (!f.array) f.array = 'none';
			ctk.frame = f;
			updateCharacter(structuredClone(toRaw(character.value)));
		},
	});

	const traitArrayMode = computed<TraitArrayMode>({
		get: () => resolveFrame(traitSet.value)?.array ?? 'none',
		set: (mode: TraitArrayMode) => {
			const ctk = ctkFor(traitSetID.value);
			const f = normalizedFrameBase();
			f.array = mode;
			if (mode === 'ring') {
				if (!f.shape || (f.shape as string) === 'block' || (f.shape as string) === 'line') {
					f.shape = 'circle';
				}
				f.span = [0, 360];
				delete f.traitsSpan;
			} else if (mode === 'arc') {
				if (!f.shape || (f.shape as string) === 'block' || (f.shape as string) === 'line') {
					f.shape = 'circle';
				}
				if (!Array.isArray(f.traitsSpan) || f.traitsSpan.length < 2) {
					f.traitsSpan = [45, 135];
				}
				f.ring ??= {};
				let a = Math.round((f.traitsSpan[0] + f.traitsSpan[1]) / 2 - 180);
				while (a > 180) a -= 360;
				while (a < -180) a += 360;
				f.ring.arcAngle = a;
				f.ring.arcSpread = Math.max(10, Math.min(100, Math.round(((f.traitsSpan[1] - f.traitsSpan[0]) / 360) * 100)));
				f.span ??= [0, 360];
			} else {
				if (f.shape === 'ring' || f.shape === 'arc') {
					f.shape = 'circle';
				}
			}
			ctk.frame = f;
			updateCharacter(structuredClone(toRaw(character.value)));
		},
	});

	const arcStrokeMode = computed<'full' | 'arc'>({
		get: () => {
			const res = resolveFrame(traitSet.value);
			return res && Math.abs((res.span?.[1] ?? 360) - (res.span?.[0] ?? 0)) < 360 ? 'arc' : 'full';
		},
		set: (val: 'full' | 'arc') => {
			const ctk = ctkFor(traitSetID.value);
			const f = normalizedFrameBase();
			if (val === 'arc') {
				const tSpan = Array.isArray(f.traitsSpan) && f.traitsSpan.length >= 2 ? f.traitsSpan : [45, 135];
				f.span = [Number(tSpan[0]) || 45, Number(tSpan[1]) || 135];
			} else {
				f.span = [0, 360];
			}
			ctk.frame = f;
			updateCharacter(structuredClone(toRaw(character.value)));
		},
	});

	function setFrameWidth(stroke: string) {
		const ctk = ctkFor(traitSetID.value);
		const f = normalizedFrameBase();
		if (stroke && stroke.trim() && stroke.trim() !== '2px') {
			f.stroke = stroke.trim();
		} else {
			delete f.stroke;
		}
		ctk.frame = f;
		updateCharacter(structuredClone(toRaw(character.value)));
	}

	const frameWidth = computed({
		get: () => resolveFrame(traitSet.value)?.stroke ?? '2px',
		set: (stroke: string) => setFrameWidth(stroke),
	});

	function setFrameColor(color: string) {
		const ctk = ctkFor(traitSetID.value);
		const f = normalizedFrameBase();
		if (color && color !== 'primary') {
			f.color = color;
		} else {
			delete f.color;
		}
		ctk.frame = f;
		updateCharacter(structuredClone(toRaw(character.value)));
	}

	const frameColor = computed({
		get: () => resolveFrame(traitSet.value)?.color ?? 'primary',
		set: (color: string) => setFrameColor(color),
	});

	function setFrameDash(dash: string) {
		const ctk = ctkFor(traitSetID.value);
		const f = normalizedFrameBase();
		if (dash && dash.trim()) {
			f.dash = dash.trim();
		} else {
			delete f.dash;
		}
		ctk.frame = f;
		updateCharacter(structuredClone(toRaw(character.value)));
	}

	const frameDash = computed({
		get: () => resolveFrame(traitSet.value)?.dash ?? '',
		set: (dash: string) => setFrameDash(dash),
	});

	function setFrameSize(size: number | null) {
		const ctk = ctkFor(traitSetID.value);
		const f = normalizedFrameBase();
		const normalized = size === null ? undefined : normalizeRingSize(size);
		if (normalized !== undefined) {
			f.size = normalized;
		} else {
			delete f.size;
		}
		ctk.frame = f;
		updateCharacter(structuredClone(toRaw(character.value)));
	}

	const frameSize = computed<number | null>({
		get: () => {
			const res = resolveFrame(traitSet.value);
			return typeof res?.size === 'number' ? res.size : null;
		},
		set: (size: number | null) => setFrameSize(size),
	});

	function setFramePosition(pos: 'left' | 'center' | 'right') {
		const ctk = ctkFor(traitSetID.value);
		const f = normalizedFrameBase();
		if (pos === 'center' || pos === 'right') {
			f.position = pos;
		} else {
			delete f.position;
		}
		ctk.frame = f;
		updateCharacter(structuredClone(toRaw(character.value)));
	}

	const framePosition = computed<'left' | 'center' | 'right'>({
		get: () => {
			const res = resolveFrame(traitSet.value);
			return res?.position === 'center' || res?.position === 'right' ? res.position : 'left';
		},
		set: (pos: 'left' | 'center' | 'right') => setFramePosition(pos),
	});

	const hasPortraitOrArray = computed(
		() =>
			portraitFrameShape.value !== 'none' ||
			Boolean(frameImageUrl.value) ||
			traitArrayMode.value !== 'none' ||
			styleBody.value === 'portrait-ring',
	);

	return {
		ringSpread,
		ringDistance,
		ringAngle,
		ringAngleLabel,
		scaleAngle,
		scaleAngleLabel,
		scaleDistance,
		ringScaleY,
		ringScaleX,
		scaleDieValue,
		setRingConfig,
		resetRingPlacement,
		imageURL,
		imageAlignment,
		imageHeight,
		imageWidth,
		imageCaption,
		imageZoom,
		imageLayout,
		setImageConfig,
		uploadImageStart,
		uploadImageProcess,
		removeImage,
		normalizedFrameBase,
		frameImageUrl,
		frameImageAlignment,
		frameImageZoom,
		setFrameImage,
		uploadPortraitImageProcess,
		frameColorTokens,
		borderOptions,
		resolvedBorder,
		borderShape,
		setBorderShape,
		borderWidth,
		borderColor,
		borderCorner,
		borderDash,
		setBorderProp,
		frameTint,
		setFrameTint,
		portraitFrameOptions,
		traitArrayOptions,
		portraitFrameShape,
		traitArrayMode,
		arcStrokeMode,
		frameWidth,
		setFrameWidth,
		frameColor,
		setFrameColor,
		frameDash,
		setFrameDash,
		frameSize,
		setFrameSize,
		framePosition,
		setFramePosition,
		hasPortraitOrArray,
	};
}
