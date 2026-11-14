<script setup lang="ts">
import { computed, ref, toRaw } from 'vue';
import { characterCurioFunctions } from './functions.ts';
import { resolveFrame } from './frame-geometry.ts';
import {
	getView,
	ensureView,
	getRating,
	resolveRating,
	ratingDice,
	resolveHitches,
	keepsExtraDice,
	isRingBadgeTrait,
	type Character,
	type Trait,
} from './model.ts';

const props = defineProps<{
	character?: Partial<Character> | Record<string, any>;
	editing: any;
	submode?: string | null;
	viewY?: number | null;
	ringTraitID: number;
}>();

const emit = defineEmits<{
	(e: 'selectElement', selector: any[]): void;
	(e: 'updateCharacter', character: Character): void;
	(e: 'addDieToRoller', die: any): void;
	(e: 'removeTrait', traitSetID: number, traitID: number): void;
}>();

const rootEl = ref<HTMLElement | null>(null);

const isRingDragging = ref(false);
const dragArcAngle = ref<number | null>(null);
const dragScaleAngle = ref<number | null>(null);

const ringSet = computed(() => props.character?.traitSets?.[props.ringTraitID] ?? null);
const ringBadgeTrait = computed(() => {
	const setNode = ringSet.value;
	if (!setNode || !Array.isArray(setNode.traits)) return null;
	return setNode.traits.find((t: any) => isRingBadgeTrait(t)) ?? null;
});
const traits = computed<Trait[]>(() => {
	const frameCfg = resolveFrame(ringSet.value);
	if (frameCfg && frameCfg.array === 'none') {
		return [];
	}
	const all = (ringSet.value?.traits || []) as Trait[];
	const nonBadge = all.filter((t: any) => !isRingBadgeTrait(t));
	const ringOnly = nonBadge.filter((t: any) => Boolean(getView(t)?.ring));
	if (ringOnly.length > 0) return ringOnly;
	const hasExplicitRing = all.some((t: any) => Boolean(getView(t)?.ring));
	if (hasExplicitRing) return [];
	return nonBadge;
});
const isRingPool = computed(() => {
	const ts = ringSet.value;
	const node = (ts && typeof ts === 'object' ? ts : undefined) as { pool?: unknown } | undefined;
	if (node && typeof node.pool === 'boolean') return node.pool;
	return Boolean(getView(ts)?.pool);
});

interface RingSlot {
	key: string;
	trait: Trait | null;
	traitIdx: number;
	dieIndex: number;
	dieSize: number;
	label: string;
	source: string;
	isSetLevel: boolean;
}

/** Expand multi-die ring traits (and set-level Dice rings) into individual die positions along the arc. */
const ringSlots = computed<RingSlot[]>(() => {
	const allTraits = (ringSet.value?.traits || []) as Trait[];
	const slots: RingSlot[] = [];
	const isSingleMultiDieTraitSpread =
		traits.value.length === 1 &&
		(resolveRating(traits.value[0], [ringSet.value])?.type === 'Dice' ||
			ratingDice(resolveRating(traits.value[0], [ringSet.value])).length > 1);
	for (const trait of traits.value) {
		const traitIdx = allTraits.indexOf(trait);
		const dice = ratingDice(resolveRating(trait, [ringSet.value]));
		const label = isSingleMultiDieTraitSpread ? '' : trait.name || '';
		const source = (getView(trait)?.noun as string) || (getView(ringSet.value)?.ringNoun as string) || trait.name || '';
		if (dice.length === 0) {
			slots.push({
				key: `t-${traitIdx}-0`,
				trait,
				traitIdx,
				dieIndex: 0,
				dieSize: 0,
				label,
				source,
				isSetLevel: false,
			});
		} else {
			dice.forEach((dieSize, dieIndex) => {
				slots.push({
					key: `t-${traitIdx}-${dieIndex}`,
					trait,
					traitIdx,
					dieIndex,
					dieSize,
					label,
					source,
					isSetLevel: false,
				});
			});
		}
	}
	const activeFrame = resolveFrame(ringSet.value);
	if (activeFrame && activeFrame.array === 'none') {
		return slots;
	}
	if (slots.length === 0 && ringSet.value) {
		const setRating = getRating(ringSet.value);
		const hasRingConfig = Boolean(activeFrame?.ring || activeFrame?.ringConfig || activeFrame?.traitsSpan);
		if (setRating && (setRating.type === 'Dice' || hasRingConfig)) {
			const dice = ratingDice(setRating);
			const sourceLabel =
				(getView(ringSet.value)?.ringNoun as string) || ringSet.value.noun || ringSet.value.name || '';
			dice.forEach((dieSize, dieIndex) => {
				slots.push({
					key: `s-${dieIndex}`,
					trait: null,
					traitIdx: -1,
					dieIndex,
					dieSize,
					label: '',
					source: sourceLabel || 'Pool',
					isSetLevel: true,
				});
			});
		}
	}
	return slots;
});
const badgeLabel = computed(() => {
	const st = ringBadgeTrait.value;
	return (st && (st.name?.trim() || (getView(st)?.noun as string))) || 'Scale';
});
const badgeKeepCount = computed(() => {
	const extra = ringBadgeTrait.value ? keepsExtraDice(ringBadgeTrait.value) : 1;
	return 2 + (extra > 0 ? extra : 1);
});
const scaleDieValue = computed(() => {
	const st = ringBadgeTrait.value;
	if (st) return ratingDice(resolveRating(st, [ringSet.value]))[0] || 8;
	const setNode = ringSet.value;
	if (getView(setNode)?.scaleDie) {
		return Number(getView(setNode)?.scaleDie);
	}
	if (getView(props.character)?.scale) {
		return Number(getView(props.character)?.scale);
	}
	return 0;
});
const isTraitEditorOpen = computed(() =>
	Boolean(props.editing && props.editing[0] === 'trait' && props.editing[1] === props.ringTraitID),
);
const isScaleSelected = computed(() => isSelected(['scaleDie', props.ringTraitID]) || isSelected(['scaleDie']));

const ringConfig = computed(() => {
	const setNode = ringSet.value;
	const frameCfg = resolveFrame(setNode);
	const cfg = frameCfg?.ringConfig;
	const baseArcAngle = cfg?.arcAngle ?? -90;
	const baseScaleAngle = cfg?.scaleAngle ?? 0;
	return {
		arcAngle: dragArcAngle.value !== null ? dragArcAngle.value : baseArcAngle,
		arcSpread: cfg?.arcSpread ?? 100,
		arcDistance: cfg?.arcDistance ?? 0,
		scaleAngle: dragScaleAngle.value !== null ? dragScaleAngle.value : baseScaleAngle,
		scaleDistance: cfg?.scaleDistance ?? 0,
		scaleDieX: cfg?.scaleDieX ?? 0,
		scaleDieY: cfg?.scaleDieY ?? 0,
	};
});

function isSelected(selector: any[]) {
	return characterCurioFunctions.arraysMatch(props.editing, selector);
}

function selectElement(selector: any[]) {
	emit('selectElement', selector);
}

function updateCharacter(character: any) {
	emit('updateCharacter', character);
}

function renderDieValue(value: any, isFilled = true) {
	return characterCurioFunctions.renderDieconSVG(value, isFilled, '', getView(props.character)?.diceConfig ?? null);
}

function getTraitAngle(t: number | string) {
	const idx = Number(t);
	const count = ringSlots.value.length;
	if (count <= 0) return 0;

	const frameCfg = resolveFrame(ringSet.value);
	if (frameCfg?.array === 'arc') {
		let s0: number;
		let s1: number;
		if (dragArcAngle.value !== null) {
			const centerClock = dragArcAngle.value + 180;
			const half = frameCfg.traitsSpan
				? (frameCfg.traitsSpan[1] - frameCfg.traitsSpan[0]) / 2
				: (((ringConfig.value.arcSpread ?? 25) / 100) * 360) / 2;
			s0 = centerClock - half;
			s1 = centerClock + half;
		} else if (frameCfg.traitsSpan) {
			s0 = frameCfg.traitsSpan[0];
			s1 = frameCfg.traitsSpan[1];
		} else {
			const arcSpread = ringConfig.value.arcSpread ?? 25;
			const totalSpan = (arcSpread / 100) * 360;
			const centerClock = (ringConfig.value.arcAngle ?? -90) + 180;
			s0 = centerClock - totalSpan / 2;
			s1 = centerClock + totalSpan / 2;
		}
		const baseAngle = s0 - 90;
		const delta = s1 - s0;
		const alpha = count === 1 ? 0.5 : idx / (count - 1);
		return baseAngle + alpha * delta;
	}

	const cfg = ringConfig.value;
	if (frameCfg?.array === 'ring') {
		const spreadPct = cfg.arcSpread ?? 100;
		if (spreadPct >= 99.9) {
			const baseAngle =
				dragArcAngle.value !== null
					? dragArcAngle.value
					: (frameCfg.ringConfig?.arcAngle ?? (frameCfg.span[0] ?? 0) - 90);
			return baseAngle + (idx / count) * 360;
		}
	}

	const centerAngle = 90 + (cfg.arcAngle ?? -90);
	const spreadFactor = (cfg.arcSpread ?? 100) / 100;
	const totalSpan = 85 * spreadFactor;

	let alpha: number;
	if (count === 1) {
		alpha = 0.5;
	} else {
		alpha = idx / (count - 1);
	}

	return centerAngle + (alpha - 0.5) * totalSpan;
}

function getTraitStyle(t: number | string) {
	const cfg = ringConfig.value;
	const angleDeg = getTraitAngle(t);
	const rad = (angleDeg * Math.PI) / 180;
	const cos = Math.cos(rad);
	const sin = Math.sin(rad);
	const arcDistance = cfg.arcDistance ?? 0;

	const percentX = (50 * cos).toFixed(4);
	const percentY = (50 * sin).toFixed(4);

	if (arcDistance !== 0) {
		const mmX = (arcDistance * cos).toFixed(4);
		const mmY = (arcDistance * sin).toFixed(4);
		return `left: calc(50% + ${percentX}% + ${mmX}mm); top: calc(50% + ${percentY}% + ${mmY}mm);`;
	}

	return `left: calc(50% + ${percentX}%); top: calc(50% + ${percentY}%);`;
}

function getTraitNameStyle(t: number | string) {
	const angleDeg = getTraitAngle(t);
	const rad = (angleDeg * Math.PI) / 180;

	const cos = Math.cos(rad);

	const distMm = 6;
	const offX = cos * distMm;

	if (cos > 0.35) {
		return `position: absolute; left: calc(50% + ${offX.toFixed(2)}mm); top: 50%; transform: translate(0, -50%); text-align: left;`;
	} else if (cos < -0.35) {
		return `position: absolute; left: calc(50% + ${offX.toFixed(2)}mm); top: 50%; transform: translate(-100%, -50%); text-align: right;`;
	}

	const sin = Math.sin(rad);
	const offY = sin * distMm;
	return `position: absolute; left: 50%; top: calc(50% + ${offY.toFixed(2)}mm); transform: translate(-50%, 0); text-align: center;`;
}

function isSlotSelected(slot: RingSlot) {
	return slot.isSetLevel
		? isSelected(['traitSet', props.ringTraitID])
		: isSelected(['trait', props.ringTraitID, slot.traitIdx]);
}

function handleSlotClick(slot: RingSlot) {
	if (isRingDragging.value) return;
	const setIdx = Number(props.ringTraitID);
	if (props.submode === 'play') {
		const ts = props.character?.traitSets?.[setIdx];
		if (isRingPool.value) {
			const diceToAdd: any[] = [];
			const poolName = (getView(ts)?.ringNoun as string) || ts?.name || props.character?.name || 'Pool';
			for (const s of ringSlots.value) {
				if (s.dieSize > 0) {
					const node = s.trait || ts;
					diceToAdd.push({
						size: s.dieSize,
						qty: 1,
						source: s.source || poolName,
						hitches: s.trait ? resolveHitches(s.trait, [ts]) : resolveHitches(ts, []),
						keepsExtra: node ? keepsExtraDice(node) : 0,
					});
				}
			}
			if (diceToAdd.length > 0) {
				emit('addDieToRoller', diceToAdd);
			}
		} else if (slot.dieSize > 0) {
			const node = slot.trait || ts;
			emit('addDieToRoller', {
				size: slot.dieSize,
				qty: 1,
				source: slot.source,
				hitches: slot.trait ? resolveHitches(slot.trait, [ts]) : resolveHitches(ts, []),
				keepsExtra: node ? keepsExtraDice(node) : 0,
			});
		}
	} else if (slot.isSetLevel) {
		selectElement(['traitSet', setIdx]);
	} else {
		selectElement(['trait', setIdx, slot.traitIdx]);
	}
}

function handleTraitClick(ringTraitIDVal: number | string, t: number | string, trait: any) {
	if (isRingDragging.value) return;
	const traitIdx = Number(t);
	const setIdx = Number(ringTraitIDVal);
	const matching = ringSlots.value.find((s) => s.trait === trait || (!s.isSetLevel && s.traitIdx === traitIdx));
	if (matching) {
		handleSlotClick(matching);
		return;
	}
	if (props.submode === 'play') {
		const ts = props.character?.traitSets?.[setIdx];
		const first = ratingDice(resolveRating(trait, [ts]))[0];
		if (first) {
			emit('addDieToRoller', {
				size: first,
				qty: 1,
				source: (getView(trait)?.noun as string) || (getView(ts)?.ringNoun as string) || trait.name,
				hitches: resolveHitches(trait, [ts]),
				keepsExtra: keepsExtraDice(trait),
			});
		}
	} else {
		selectElement(['trait', setIdx, traitIdx]);
	}
}

function handleScaleDieClick() {
	if (isRingDragging.value) return;
	if (props.submode === 'play') {
		if (scaleDieValue.value > 0) {
			const st = ringBadgeTrait.value;
			const extra = st ? keepsExtraDice(st) : 1;
			emit('addDieToRoller', {
				size: scaleDieValue.value,
				qty: 1,
				source: badgeLabel.value,
				hitches: st ? resolveHitches(st, [ringSet.value]) : resolveHitches(ringSet.value, []),
				keepsExtra: extra > 0 ? extra : 1,
			});
		}
	} else {
		if (ringBadgeTrait.value) {
			const ringSetID = props.ringTraitID;
			const traitIdx = (props.character?.traitSets?.[ringSetID]?.traits || []).indexOf(ringBadgeTrait.value);
			if (traitIdx !== -1) {
				selectElement(['trait', ringSetID, traitIdx]);
				return;
			}
		}
		selectElement(['scaleDie', props.ringTraitID]);
	}
}

function startRingDrag(event: PointerEvent, targetType: string) {
	if (props.submode !== 'edit') return;
	if (event.button !== undefined && event.button !== 0) return;

	const host = rootEl.value?.closest('.portrait') || rootEl.value;
	if (!host || typeof host.querySelector !== 'function') return;
	const portraitEl = host.querySelector('.portrait-circle') || host.querySelector('.portrait-inner');
	if (!portraitEl) return;

	const pRect = portraitEl.getBoundingClientRect();
	const centerX = pRect.left + pRect.width / 2;
	const centerY = pRect.top + pRect.height / 2;

	const startX = event.clientX;
	const startY = event.clientY;

	const initialRad = Math.atan2(startY - centerY, startX - centerX);
	const initialDeg = (initialRad * 180) / Math.PI;

	const startFrameCfg = resolveFrame(ringSet.value);
	const startArcAngle =
		startFrameCfg?.array === 'arc' && startFrameCfg?.traitsSpan
			? (startFrameCfg.traitsSpan[0] + startFrameCfg.traitsSpan[1]) / 2 - 180
			: (ringConfig.value.arcAngle ?? -90);
	const startScaleAngle = ringConfig.value.scaleAngle ?? 0;

	let hasMoved = false;

	const cleanup = () => {
		window.removeEventListener('pointermove', onMove);
		window.removeEventListener('pointerup', onUp);
		window.removeEventListener('pointercancel', onCancel);
		window.removeEventListener('keydown', onKeyDown);
	};

	const onMove = (e: PointerEvent) => {
		const clientX = e.clientX;
		const clientY = e.clientY;

		const dist = Math.hypot(clientX - startX, clientY - startY);
		if (dist > 4) {
			hasMoved = true;
			isRingDragging.value = true;
		}

		if (!hasMoved) return;

		e.preventDefault();

		const currRad = Math.atan2(clientY - centerY, clientX - centerX);
		const currDeg = (currRad * 180) / Math.PI;

		let deltaDeg = currDeg - initialDeg;
		while (deltaDeg > 180) deltaDeg -= 360;
		while (deltaDeg < -180) deltaDeg += 360;

		if (targetType === 'traits') {
			let newAngle = Math.round(startArcAngle + deltaDeg);
			while (newAngle > 180) newAngle -= 360;
			while (newAngle < -180) newAngle += 360;
			dragArcAngle.value = newAngle;
		} else if (targetType === 'scale') {
			let newAngle = Math.round(startScaleAngle + deltaDeg);
			while (newAngle > 180) newAngle -= 360;
			while (newAngle < -180) newAngle += 360;
			dragScaleAngle.value = newAngle;
		}
	};

	const onCancel = () => {
		cleanup();
		dragArcAngle.value = null;
		dragScaleAngle.value = null;
		isRingDragging.value = false;
	};

	const onKeyDown = (e: KeyboardEvent) => {
		if (e.key === 'Escape') {
			onCancel();
		}
	};

	const onUp = () => {
		cleanup();

		if (hasMoved) {
			if (targetType === 'traits' && dragArcAngle.value !== null) {
				setRingConfigProp('arcAngle', dragArcAngle.value);
				const node = ringSet.value;
				const fCfg = resolveFrame(node);
				if (node && fCfg?.array === 'arc') {
					const v = ensureView(node);
					const frameObj = typeof v.frame === 'object' && v.frame !== null ? (v.frame as any) : {};
					const half = fCfg.traitsSpan
						? (fCfg.traitsSpan[1] - fCfg.traitsSpan[0]) / 2
						: (((ringConfig.value.arcSpread ?? 25) / 100) * 360) / 2;
					const centerClock = dragArcAngle.value + 180;
					frameObj.traitsSpan = [Math.round(centerClock - half), Math.round(centerClock + half)];
					if (Math.abs((fCfg.span?.[1] ?? 360) - (fCfg.span?.[0] ?? 0)) < 360) {
						frameObj.span = [...frameObj.traitsSpan];
					}
					v.frame = frameObj;
				}
			} else if (targetType === 'scale' && dragScaleAngle.value !== null) {
				setRingConfigProp('scaleAngle', dragScaleAngle.value);
			}
			dragArcAngle.value = null;
			dragScaleAngle.value = null;
			updateCharacter(structuredClone(toRaw(props.character)));
			setTimeout(() => {
				isRingDragging.value = false;
			}, 60);
		} else {
			dragArcAngle.value = null;
			dragScaleAngle.value = null;
			isRingDragging.value = false;
		}
	};

	window.addEventListener('pointermove', onMove, { passive: false });
	window.addEventListener('pointerup', onUp);
	window.addEventListener('pointercancel', onCancel);
	window.addEventListener('keydown', onKeyDown);
}

function setRingConfigProp(key: string, value: any) {
	const ringSetNode = ringSet.value;
	if (ringSetNode) {
		const view = ensureView(ringSetNode);
		view.frame ??= { shape: 'ring' };
		const frameObj =
			typeof view.frame === 'object' && view.frame !== null ? (view.frame as any) : { shape: view.frame };
		view.frame = frameObj;
		const existingRing = frameObj.ring || view.ringConfig;
		frameObj.ring ??= {
			arcAngle: existingRing?.arcAngle ?? (existingRing?.arcSlide !== undefined ? existingRing.arcSlide * 3 : -90),
			arcSpread: existingRing?.arcSpread ?? 100,
			arcDistance: existingRing?.arcDistance ?? 0,
			scaleAngle: existingRing?.scaleAngle ?? 0,
			scaleDistance: existingRing?.scaleDistance ?? 0,
			scaleDieX: existingRing?.scaleDieX ?? 0,
			scaleDieY: existingRing?.scaleDieY ?? 0,
		};
		(frameObj.ring as any)[key] = value;
	}
}

function setScaleDieValue(val: any) {
	const num = Number(val) || 0;
	const ringSetNode = ringSet.value;
	if (ringSetNode) {
		ensureView(ringSetNode).scaleDie = num;

		const traitsList = Array.isArray(ringSetNode.traits) ? ringSetNode.traits : [];
		const stIndex = traitsList.findIndex((t: any) => isRingBadgeTrait(t));
		if (num === 0) {
			if (stIndex !== -1) {
				traitsList.splice(stIndex, 1);
			}
		} else if (stIndex !== -1) {
			const st = traitsList[stIndex] as unknown as Record<string, any>;
			st.rating = { type: 'Die', value: [num], range: [4, 6, 8, 10, 12] };
			if (!keepsExtraDice(st)) st.keepsExtra = 1;
		}
	}
	ensureView(props.character).scale = num;
	updateCharacter(structuredClone(toRaw(props.character)));
}

function getScaleDieStyle() {
	const cfg = ringConfig.value;
	const R_percent = (29 / 84) * 100;
	const angleDeg = 90 + (cfg.scaleAngle ?? 0);
	const rad = (angleDeg * Math.PI) / 180;
	const cos = Math.cos(rad);
	const sin = Math.sin(rad);

	const percentX = (R_percent * cos).toFixed(4);
	const percentY = (R_percent * sin).toFixed(4);

	const extraMmX = ((cfg.scaleDistance ?? 0) * cos + (cfg.scaleDieX ?? 0)).toFixed(4);
	const extraMmY = ((cfg.scaleDistance ?? 0) * sin + (cfg.scaleDieY ?? 0)).toFixed(4);

	return `left: calc(50% + ${percentX}% + ${extraMmX}mm); top: calc(50% + ${percentY}% + ${extraMmY}mm);`;
}

defineExpose({ setScaleDieValue, handleTraitClick, handleScaleDieClick, scaleDieValue });
</script>

<template>
	<div ref="rootEl" class="ring-grid">
		<div class="ring-items" :class="{ 'has-open-editor': isTraitEditorOpen }">
			<div
				v-for="(slot, t) in ringSlots"
				:key="slot.key"
				class="ring-trait"
				:class="{
					'has-open-editor': isSlotSelected(slot),
					'is-draggable': submode === 'edit',
				}"
				:style="getTraitStyle(Number(t))"
				@pointerdown="startRingDrag($event, 'traits')"
			>
				<div
					class="ring-trait-inner"
					:class="{ selected: isSlotSelected(slot) }"
					role="button"
					tabindex="0"
					:aria-label="
						slot.label
							? `Stage d${slot.dieSize || 8} ${slot.label}`
							: slot.dieSize
								? `Stage d${slot.dieSize} ${slot.source || 'Trait'}`
								: slot.source || 'Trait'
					"
					@click.stop="handleSlotClick(slot)"
					@keydown.enter.prevent="handleSlotClick(slot)"
					@keydown.space.prevent="handleSlotClick(slot)"
					:title="
						submode === 'play'
							? isRingPool
								? 'Pool: Click to add all dice to roller'
								: 'Click to add d' + slot.dieSize + ' to roller'
							: ''
					"
				>
					<span
						:class="['die-' + (slot.dieSize || 8), { 'die-empty': !slot.dieSize }]"
						v-html="renderDieValue(slot.dieSize)"
						:title="!slot.dieSize && submode === 'edit' ? 'Unrated — click to set a die rating' : ''"
						aria-hidden="true"
					></span>

					<div v-if="slot.label" class="ring-trait-name" :style="getTraitNameStyle(Number(t))">{{ slot.label }}</div>
				</div>
			</div>
		</div>

		<!-- RING BADGE DIE -->
		<div
			class="scale-die"
			:class="{ 'is-draggable': submode === 'edit' }"
			v-if="scaleDieValue > 0"
			:style="getScaleDieStyle()"
			@pointerdown="startRingDrag($event, 'scale')"
		>
			<div
				class="scale-die-inner"
				:class="{ selected: isScaleSelected }"
				role="button"
				tabindex="0"
				:aria-label="submode === 'play' ? `Stage d${scaleDieValue} ${badgeLabel}` : `Edit ${badgeLabel}`"
				@click.stop="handleScaleDieClick()"
				@keydown.enter.prevent="handleScaleDieClick()"
				@keydown.space.prevent="handleScaleDieClick()"
				:title="
					submode === 'play'
						? `Click to add d${scaleDieValue} ${badgeLabel} to pool (Keep ${badgeKeepCount})`
						: `Click to edit ${badgeLabel}`
				"
			>
				<span :class="'die-' + (scaleDieValue || 8)" v-html="renderDieValue(scaleDieValue)" aria-hidden="true"></span>
				<div class="scale-name">{{ badgeLabel.toUpperCase() }}</div>
			</div>
		</div>
	</div>
</template>
