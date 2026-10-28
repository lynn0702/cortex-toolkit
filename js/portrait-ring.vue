<script setup lang="ts">
import { computed, ref, toRaw } from 'vue';
import { cortexFunctions } from './functions.ts';
import { getView, ensureView, getRating, ratingDice, resolveHitches, keepsExtraDice, type Character, type Trait } from './model.ts';

const props = defineProps<{
	character?: Partial<Character> | Record<string, any>;
	editing: any;
	submode?: string | null;
	viewY?: number | null;
	ringTraitID: number;
}>();

const emit = defineEmits<{
	( e: 'selectElement', selector: any[] ): void;
	( e: 'updateCharacter', character: Character ): void;
	( e: 'addDieToRoller', die: any ): void;
	( e: 'removeTrait', traitSetID: number, traitID: number ): void;
}>();

const rootEl = ref<HTMLElement | null>( null );

const isRingDragging = ref( false );
const dragArcAngle = ref<number | null>( null );
const dragScaleAngle = ref<number | null>( null );

const ringTraitSet = computed( () => props.character?.traitSets?.[ props.ringTraitID ] ?? null );
const scaleTrait = computed( () => {
	const ringSet = ringTraitSet.value;
	if ( !ringSet || !Array.isArray( ringSet.traits ) ) return null;
	return ringSet.traits.find( ( t: any ) => t.name?.trim().toLowerCase() === 'scale' );
} );
const traits = computed<Trait[]>( () => {
	const all = ( ringTraitSet.value?.traits || [] ) as Trait[];
	return all.filter( ( t: any ) => !( t.name?.trim().toLowerCase() === 'scale' ) );
} );
const isRingPool = computed( () => {
	const ts = ringTraitSet.value;
	const node = ( ts && typeof ts === 'object' ? ts : undefined ) as { pool?: unknown } | undefined;
	if ( node && typeof node.pool === 'boolean' ) return node.pool;
	return Boolean( getView( ts )?.pool );
} );
const scaleDieValue = computed( () => {
	const st = scaleTrait.value;
	if ( st ) return ratingDice( getRating( st ) )[0] || 8;
	const ringSet = ringTraitSet.value;
	if ( getView( ringSet )?.scaleDie ) {
		return Number( getView( ringSet )?.scaleDie );
	}
	if ( getView( props.character )?.scale ) {
		return Number( getView( props.character )?.scale );
	}
	return 0;
} );
const isTraitEditorOpen = computed( () => Boolean( props.editing && props.editing[ 0 ] === 'trait' && props.editing[ 1 ] === props.ringTraitID ) );
const isOtherEditorOpen = computed( () => Boolean( props.editing && props.editing.length > 0 && !isSelected( [ 'scaleDie' ] ) ) );

const ringConfig = computed( () => {
	const ringSet = ringTraitSet.value;
	const cfg = getView( ringSet )?.ringConfig;
	const baseArcAngle = cfg?.arcAngle ?? ( cfg?.arcSlide !== undefined ? cfg.arcSlide * 3 : -90 );
	const baseScaleAngle = cfg?.scaleAngle ?? 0;
	return {
		arcAngle: dragArcAngle.value !== null ? dragArcAngle.value : baseArcAngle,
		arcSpread: cfg?.arcSpread ?? 100,
		arcDistance: cfg?.arcDistance ?? 0,
		scaleAngle: dragScaleAngle.value !== null ? dragScaleAngle.value : baseScaleAngle,
		scaleDistance: cfg?.scaleDistance ?? 0,
		scaleDieX: cfg?.scaleDieX ?? 0,
		scaleDieY: cfg?.scaleDieY ?? 0
	};
} );

function isSelected( selector: any[] ) {
	return cortexFunctions.arraysMatch( props.editing, selector );
}

function selectElement( selector: any[] ) {
	emit( 'selectElement', selector );
}

function updateCharacter( character: any ) {
	emit( 'updateCharacter', character );
}

function renderDieValue( value: any ) {
	return cortexFunctions.getDieDisplayValue( value );
}

function getTraitAngle( t: number | string ) {
	const idx = Number( t );
	const cfg = ringConfig.value;
	const centerAngle = 90 + ( cfg.arcAngle ?? -90 );
	const spreadFactor = ( cfg.arcSpread ?? 100 ) / 100;
	const totalSpan = 85 * spreadFactor;

	let alpha: number;
	if ( traits.value.length === 1 ) {
		alpha = 0.5;
	} else {
		alpha = idx / ( traits.value.length - 1 );
	}

	return centerAngle + ( alpha - 0.5 ) * totalSpan;
}

function getTraitStyle( t: number | string ) {
	const cfg = ringConfig.value;
	const angleDeg = getTraitAngle( t );
	const rad = angleDeg * Math.PI / 180;
	const cos = Math.cos( rad );
	const sin = Math.sin( rad );
	const arcDistance = cfg.arcDistance ?? 0;

	const percentX = ( 50 * cos ).toFixed( 4 );
	const percentY = ( 50 * sin ).toFixed( 4 );

	if ( arcDistance !== 0 ) {
		const mmX = ( arcDistance * cos ).toFixed( 4 );
		const mmY = ( arcDistance * sin ).toFixed( 4 );
		return `left: calc(50% + ${percentX}% + ${mmX}mm); top: calc(50% + ${percentY}% + ${mmY}mm);`;
	}

	return `left: calc(50% + ${percentX}%); top: calc(50% + ${percentY}%);`;
}

function getTraitNameStyle( t: number | string ) {
	const angleDeg = getTraitAngle( t );
	const rad = angleDeg * Math.PI / 180;

	const cos = Math.cos( rad );

	const distMm = 6;
	const offX = cos * distMm;

	if ( cos > 0.35 ) {
		return `position: absolute; left: calc(50% + ${offX.toFixed( 2 )}mm); top: 50%; transform: translate(0, -50%); text-align: left;`;
	} else if ( cos < -0.35 ) {
		return `position: absolute; left: calc(50% + ${offX.toFixed( 2 )}mm); top: 50%; transform: translate(-100%, -50%); text-align: right;`;
	}

	const sin = Math.sin( rad );
	const offY = sin * distMm;
	return `position: absolute; left: 50%; top: calc(50% + ${offY.toFixed( 2 )}mm); transform: translate(-50%, 0); text-align: center;`;
}

function ringDie( trait: any ) {
	return ratingDice( getRating( trait ) )[0] || 0;
}

function handleTraitClick( ringTraitIDVal: number | string, t: number | string, trait: any ) {
	if ( isRingDragging.value ) return;
	const traitIdx = Number( t );
	const setIdx = Number( ringTraitIDVal );
	if ( props.submode === 'play' ) {
		const ts = props.character?.traitSets?.[ setIdx ];
		if ( isRingPool.value ) {
			const diceToAdd: any[] = [];
			const poolName = ts?.name || props.character?.name || 'Pool';
			for ( const tr of traits.value ) {
				const first = ratingDice( getRating( tr ) )[0];
				if ( first && first > 0 ) {
					diceToAdd.push( {
						size: first,
						qty: 1,
						source: tr.name || poolName,
						hitches: resolveHitches( tr, [ ts ] ),
						keepsExtra: keepsExtraDice( tr )
					} );
				}
			}
			if ( diceToAdd.length > 0 ) {
				emit( 'addDieToRoller', diceToAdd );
			}
		} else {
			const first = ratingDice( getRating( trait ) )[0];
			if ( first ) {
				emit( 'addDieToRoller', {
					size: first,
					qty: 1,
					source: trait.name,
					hitches: resolveHitches( trait, [ ts ] ),
					keepsExtra: keepsExtraDice( trait )
				} );
			}
		}
	} else {
		selectElement( [ 'trait', setIdx, traitIdx ] );
	}
}

function handleScaleDieClick() {
	if ( isRingDragging.value ) return;
	if ( props.submode === 'play' ) {
		if ( scaleDieValue.value > 0 ) {
			emit( 'addDieToRoller', {
				size: scaleDieValue.value,
				qty: 1,
				source: 'Scale',
				isScale: true
			} );
		}
	} else {
		if ( isOtherEditorOpen.value ) {
			return;
		}
		if ( scaleTrait.value ) {
			const ringSetID = props.ringTraitID;
			const traitIdx = ( props.character?.traitSets?.[ ringSetID ]?.traits || [] ).indexOf( scaleTrait.value );
			if ( traitIdx !== -1 ) {
				selectElement( [ 'trait', ringSetID, traitIdx ] );
				return;
			}
		}
		selectElement( [ 'scaleDie' ] );
	}
}

function startRingDrag( event: any, targetType: string ) {
	if ( props.submode !== 'edit' ) return;

	const host = rootEl.value?.closest( '.portrait' ) || rootEl.value;
	if ( !host || typeof host.querySelector !== 'function' ) return;
	const portraitEl = host.querySelector( '.portrait-circle' ) || host.querySelector( '.portrait-inner' );
	if ( !portraitEl ) return;

	const pRect = portraitEl.getBoundingClientRect();
	const centerX = pRect.left + pRect.width / 2;
	const centerY = pRect.top + pRect.height / 2;

	const startX = event.clientX ?? event.touches?.[ 0 ]?.clientX;
	const startY = event.clientY ?? event.touches?.[ 0 ]?.clientY;

	const initialRad = Math.atan2( startY - centerY, startX - centerX );
	const initialDeg = initialRad * 180 / Math.PI;

	const startArcAngle = ringConfig.value.arcAngle ?? -90;
	const startScaleAngle = ringConfig.value.scaleAngle ?? 0;

	let hasMoved = false;

	const onMove = ( e: any ) => {
		const clientX = e.clientX ?? e.touches?.[ 0 ]?.clientX;
		const clientY = e.clientY ?? e.touches?.[ 0 ]?.clientY;
		if ( clientX === undefined || clientY === undefined ) return;

		const dist = Math.hypot( clientX - startX, clientY - startY );
		if ( dist > 4 ) {
			hasMoved = true;
			isRingDragging.value = true;
		}

		if ( !hasMoved ) return;

		e.preventDefault();

		const currRad = Math.atan2( clientY - centerY, clientX - centerX );
		const currDeg = currRad * 180 / Math.PI;

		let deltaDeg = currDeg - initialDeg;
		while ( deltaDeg > 180 ) deltaDeg -= 360;
		while ( deltaDeg < -180 ) deltaDeg += 360;

		if ( targetType === 'traits' ) {
			let newAngle = Math.round( startArcAngle + deltaDeg );
			while ( newAngle > 180 ) newAngle -= 360;
			while ( newAngle < -180 ) newAngle += 360;
			dragArcAngle.value = newAngle;
		} else if ( targetType === 'scale' ) {
			let newAngle = Math.round( startScaleAngle + deltaDeg );
			while ( newAngle > 180 ) newAngle -= 360;
			while ( newAngle < -180 ) newAngle += 360;
			dragScaleAngle.value = newAngle;
		}
	};

	const onUp = () => {
		window.removeEventListener( 'mousemove', onMove );
		window.removeEventListener( 'mouseup', onUp );
		window.removeEventListener( 'touchmove', onMove );
		window.removeEventListener( 'touchend', onUp );

		if ( hasMoved ) {
			if ( targetType === 'traits' && dragArcAngle.value !== null ) {
				setRingConfigProp( 'arcAngle', dragArcAngle.value );
			} else if ( targetType === 'scale' && dragScaleAngle.value !== null ) {
				setRingConfigProp( 'scaleAngle', dragScaleAngle.value );
			}
			dragArcAngle.value = null;
			dragScaleAngle.value = null;
			updateCharacter( structuredClone( toRaw( props.character ) ) );
			setTimeout( () => {
				isRingDragging.value = false;
			}, 60 );
		} else {
			dragArcAngle.value = null;
			dragScaleAngle.value = null;
			isRingDragging.value = false;
		}
	};

	window.addEventListener( 'mousemove', onMove, { passive: false } );
	window.addEventListener( 'mouseup', onUp );
	window.addEventListener( 'touchmove', onMove, { passive: false } );
	window.addEventListener( 'touchend', onUp );
}

function setRingConfigProp( key: string, value: any ) {
	const ringSet = ringTraitSet.value;
	if ( ringSet ) {
		const view = ensureView( ringSet );
		if ( !view.ringConfig ) {
			view.ringConfig = {
				arcAngle: -90,
				arcSpread: 100,
				arcDistance: 0,
				scaleAngle: 0,
				scaleDistance: 0,
				scaleDieX: 0,
				scaleDieY: 0
			};
		}
		( view.ringConfig as any )[ key ] = value;
	}
}

function setScaleDieValue( val: any ) {
	const num = Number( val ) || 0;
	const ringSet = ringTraitSet.value;
	if ( ringSet ) {
		ensureView( ringSet ).scaleDie = num;

		const stIndex = ringSet.traits.findIndex( ( t: any ) => t.name?.trim().toLowerCase() === 'scale' );
		if ( num === 0 ) {
			if ( stIndex !== -1 ) {
				ringSet.traits.splice( stIndex, 1 );
			}
		} else if ( stIndex !== -1 ) {
			const st = ringSet.traits[ stIndex ] as unknown as Record<string, any>;
			st.rating = { type: 'Die', value: [ num ], range: [ 4, 6, 8, 10, 12 ] };
			// Scale remains a trait name; its effect is keepsExtra.
			st.keepsExtra = 1;
		}
	}
	ensureView( props.character ).scale = num;
	updateCharacter( structuredClone( toRaw( props.character ) ) );
}

function getScaleDieStyle() {
	const cfg = ringConfig.value;
	const R_percent = ( 29 / 84 ) * 100;
	const angleDeg = 90 + ( cfg.scaleAngle ?? 0 );
	const rad = angleDeg * Math.PI / 180;
	const cos = Math.cos( rad );
	const sin = Math.sin( rad );

	const percentX = ( R_percent * cos ).toFixed( 4 );
	const percentY = ( R_percent * sin ).toFixed( 4 );

	const extraMmX = ( ( cfg.scaleDistance ?? 0 ) * cos + ( cfg.scaleDieX ?? 0 ) ).toFixed( 4 );
	const extraMmY = ( ( cfg.scaleDistance ?? 0 ) * sin + ( cfg.scaleDieY ?? 0 ) ).toFixed( 4 );

	return `left: calc(50% + ${percentX}% + ${extraMmX}mm); top: calc(50% + ${percentY}% + ${extraMmY}mm);`;
}

defineExpose( { setScaleDieValue, handleTraitClick, handleScaleDieClick, scaleDieValue } );
</script>

<template>
	<div ref="rootEl" class="attributes-grid">
		<div class="attributes-items"
			:class="{ 'has-open-editor': isTraitEditorOpen }"
		>
			<div v-for="( trait, t ) in traits"
				class="attribute"
				:class="{ 'has-open-editor': isSelected(['trait', ringTraitID, Number(t)]), 'is-draggable': submode === 'edit' }"
				:style="getTraitStyle( Number(t) )"
				@mousedown="startRingDrag($event, 'traits')"
				@touchstart="startRingDrag($event, 'traits')"
			>

				<div class="attribute-inner"
					:class="{ 'attribute-inner': true, 'selected': isSelected(['trait', ringTraitID, Number(t)]) }"
					role="button"
					tabindex="0"
					:aria-label="trait.name ? (`Stage d${ringDie(trait) || 8} ${trait.name}`) : (ringTraitSet?.noun || 'Trait')"
					@click.stop="handleTraitClick( ringTraitID, Number(t), trait )"
					@keydown.enter.prevent="handleTraitClick( ringTraitID, Number(t), trait )"
					@keydown.space.prevent="handleTraitClick( ringTraitID, Number(t), trait )"
					:title="submode === 'play' ? (isRingPool ? 'Pool: Click to add all dice to roller' : 'Click to add d' + ringDie(trait) + ' to roller') : ''"
				>

					<span class="c"
						:class="['die-' + (ringDie(trait) || 8), { 'die-empty': !ringDie(trait) }]"
						v-html="renderDieValue(ringDie(trait))"
						:title="!ringDie(trait) && submode === 'edit' ? 'Unrated — click to set a die rating' : ''"
						aria-hidden="true"
					></span>

					<div class="attribute-name"
						:style="getTraitNameStyle( Number(t) )"
					>{{ trait.name }}</div>

				</div>

			</div>

		</div>

		<!-- SCALE DIE -->
		<div
			class="scale-die"
			:class="{ 'under-editor': isOtherEditorOpen, 'is-draggable': submode === 'edit' }"
			v-if="scaleDieValue > 0"
			:style="getScaleDieStyle()"
			@mousedown="startRingDrag($event, 'scale')"
			@touchstart="startRingDrag($event, 'scale')"
		>
			<div
				class="scale-die-inner"
				:class="{ 'selected': isSelected(['scaleDie']) }"
				role="button"
				tabindex="0"
				:aria-label="submode === 'play' ? ('Stage d' + scaleDieValue + ' Scale die') : 'Edit Scale die'"
				@click.stop="handleScaleDieClick()"
				@keydown.enter.prevent="handleScaleDieClick()"
				@keydown.space.prevent="handleScaleDieClick()"
				:title="submode === 'play' ? 'Click to add d' + scaleDieValue + ' Scale die to pool (Keep 3)' : 'Click to edit Scale die'"
			>
				<span class="c" :class="'die-' + (scaleDieValue || 8)" v-html="renderDieValue(scaleDieValue)" aria-hidden="true"></span>
				<div class="scale-name">SCALE</div>
			</div>

			<transition name="editor" appear>
				<aside
					class="editor scale-die-editor open"
					v-show="submode === 'edit' && isSelected(['scaleDie'])"
					@click.stop
				>
					<div class="editor-arrow"></div>
					<div class="editor-controls">
						<button type="button" @click.stop="selectElement([])"><i class="fas fa-times"></i></button>
						<button type="button" class="editor-delete" @click.stop="setScaleDieValue(0); selectElement([])" title="Remove Scale Die"><i class="fas fa-trash"></i></button>
					</div>
					<div class="editor-fields">
						<div class="editor-field">
							<label>Scale Die Rating</label>
							<div class="scale-stepper">
								<button
									v-for="s in [4, 6, 8, 10, 12]"
									:key="'scale-' + s"
									type="button"
									class="btn-step"
									:class="{ active: scaleDieValue === s }"
									@click.stop="setScaleDieValue(s)"
								>
									<span class="c">{{ renderDieValue(s) }}</span>
									<span class="step-label">d{{ s }}</span>
								</button>
							</div>
						</div>
					</div>
				</aside>
			</transition>
		</div>
	</div>
</template>

