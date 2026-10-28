# Trait Set Mini & Play/Notes Card Expansion — Architecture & Code Review Package

## 1. Context & Architectural Overview

The **Trait Set Mini** is a specialized, self-contained authoring surface for **one trait set**. A creator opens the mini, builds a single trait set from parts using an interactive drag-and-place layout grid, previews the rendered set in real time, and can either apply it to the active character sheet or ship it as a standalone preset card (persisting in the preset card library).

### Core Responsibilities
- **Preset Cards as First-Class Citizens**: Enables lower-effort contributions than full-sheet authoring; cards can be applied with a single tap.
- **Visual Drag & Place Grid**: Trait block parts (`name`, `rating`, `description`, `block`, `subtraits`, `trackLabel`, `track`) are dragged and resized on an 8-column visual canvas.
- **Companion Stress / Injuries Track**: Built-in attached track authoring with per-trait companion nouns (e.g., Physical → "Injured", Mental → "Worried") and fallback to the set's track label.
- **Recycled Cortex Diecons**: Renders standard `.c` cortex icon font glyphs without custom overlay drift.

---

## 2. Outstanding Feedback & Architectural Scope for Review

The user requested an external agent review specifically examining:
1. **L/T Marker Scope**: The user notes: *"I should only be able to toggle the type L T in the drag and place grid or on the parts adder above not custom per trait at the bottom."*
2. **Multi-Trait / Rating Types (Pip, Pool, etc.)**: The user notes: *"I still don't see where I can customize and add a second trait with pip for instance or change the rating type to be a pip or a pool. We're still lacking the full features."*
3. **Storage Portability**: Confirming preset card portability across devices (IndexedDB vs. localStorage) and export/import archive format.
4. **Glyph Centering (Resolved)**: Fixed the die glyph centering issue where ascent/descent asymmetry in `cortex-icons` (ascent 960, descent 64) caused glyphs to draw 3px (~0.15em) too low inside buttons. Resolved via `display: inline-block; transform: translateY(-0.15em);`.

---

## 3. Integration Points

### Opener in `js/trait-set-editor-layout.vue`
```vue
<script setup lang="ts">
import { injectTraitSetEditor } from './use-trait-set-editor.ts';
import TraitSetEditorRowMini from './trait-set-editor-row-mini.vue';

const {
	isRing, isSpotlightSheet,
	isPartsPreview, hasParts, hasCustomParts, hasCustomBranch, resetParts,
	openBlockMini
} = injectTraitSetEditor();
</script>

<template>
	<!-- SECTION LAYOUT (set header always; trait-row cells for every row body) -->
	<div class="editor-field" v-if="!isRing && isSpotlightSheet">
		<div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.35rem;">
			<div class="editor-label" style="margin: 0;">Section Layout</div>
			<button
				type="button"
				class="editor-group-btn"
				style="font-size: 0.74rem; padding: 0.22rem 0.55rem; background: rgba(56, 189, 248, 0.16); border: 1px solid #38bdf8; color: #38bdf8; border-radius: 4px; cursor: pointer;"
				@click.stop="openBlockMini"
				title="Open full Trait Block Mini (2D drag & drop, inventory, preset builder)"
			>
				<i class="fas fa-th-large" aria-hidden="true"></i> Trait Block Mini
			</button>
		</div>
		<div class="editor-field-hint" v-if="isPartsPreview" style="font-size: 0.72rem; color: #94a3b8; margin-bottom: 0.4rem;">
			Preset row — dragging any box writes the row layout shown here.
		</div>
		<div class="editor-button-group" style="margin-bottom: 0.4rem;" v-if="hasCustomParts || hasCustomBranch">
			<button
				type="button"
				class="editor-group-btn"
				@click.stop="resetParts"
				title="Restore the preset arrangement"
			>
				Reset
			</button>
		</div>
		<TraitSetEditorRowMini />
	</div>
</template>

```

---

## 4. Main Component: `js/trait-set-mini.vue`

```vue
<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { getView, ensureView } from './model.ts';
import { cortexFunctions } from './functions.ts';
import { formatPct, parsePct, type PartName } from './spotlight-grid.ts';
import VisibilityEye from './visibility-eye.vue';
import TraitSetBlock from './trait-set-block.vue';

export interface PartBoxEntry {
	kind: PartName;
	left: string;
	top: number;
	width: string;
	height: number;
}

const props = defineProps<{
	initialSet?: any;
}>();

const emit = defineEmits<{
	( e: 'close' ): void;
	( e: 'saved', preset: any ): void;
	( e: 'applyToSet', updatedSet: any ): void;
}>();

function createDefaultWorkingSet( source?: any ): any {
	if ( source ) {
		const copy = cortexFunctions.cloneDeep( source );
		const v = ensureView( copy );
		if ( !v.pillar ) v.pillar = 'play';
		if ( !v.parts || typeof v.parts !== 'object' || Array.isArray( v.parts ) ) {
			v.parts = {
				name: { left: '0%', top: 0, width: '65%', height: 1 },
				rating: { left: '65%', top: 0, width: '35%', height: 1 }
			};
		}
		return copy;
	}
	return {
		id: cortexFunctions.generateUUID(),
		name: 'New Card',
		noun: 'Trait',
		plural: 'Traits',
		traits: [
			{
				id: cortexFunctions.generateUUID(),
				name: 'Example Trait',
				rating: { type: 'Die', values: [ 8 ] },
				traits: []
			}
		],
		view: {
			pillar: 'play',
			playMutable: true,
			features: {},
			parts: {
				name: { left: '0%', top: 0, width: '65%', height: 1 },
				rating: { left: '65%', top: 0, width: '35%', height: 1 }
			}
		}
	};
}

const workingSet = ref<any>( createDefaultWorkingSet( props.initialSet ) );

watch( () => props.initialSet, ( next ) => {
	if ( next ) {
		workingSet.value = createDefaultWorkingSet( next );
	}
} );

const previewSubmode = ref<'play' | 'edit'>( 'play' );
const selectedPartKey = ref<PartName>( 'name' );
const draggingKey = ref<PartName | null>( null );
const dragMode = ref<'move' | 'resize-e' | 'resize-s' | null>( null );
const dragStart = ref<{ x: number; y: number; left: number; width: number; top: number; height: number } | null>( null );
const gridEl = ref<HTMLElement | null>( null );

// Preset saving state — creator types label and optional blurb; never auto-generated
const presetLabel = ref<string>( '' );
const presetBlurb = ref<string>( '' );
const saveStatusMessage = ref<string>( '' );
const saveErrorMessage = ref<string>( '' );
const savedVersion = ref<number>( 0 );

const derivedId = computed( () => cortexFunctions.derivePresetId( presetLabel.value ) );
const hasCollision = computed( () => {
	void savedVersion.value;
	if ( !derivedId.value ) return false;
	return cortexFunctions.hasPresetCollision( derivedId.value );
} );

function ensurePartsMap(): Record<string, { left: string; top: number; width: string; height: number }> {
	const v = ensureView( workingSet.value );
	if ( !v.parts || typeof v.parts !== 'object' || Array.isArray( v.parts ) || Object.keys( v.parts ).length === 0 ) {
		v.parts = {
			name: { left: '0%', top: 0, width: '65%', height: 1 },
			rating: { left: '65%', top: 0, width: '35%', height: 1 }
		};
	}
	return v.parts as Record<string, { left: string; top: number; width: string; height: number }>;
}

const activeParts = computed<PartBoxEntry[]>( () => {
	const v = getView( workingSet.value );
	const raw = v?.parts;
	if ( raw && typeof raw === 'object' && !Array.isArray( raw ) && Object.keys( raw ).length > 0 ) {
		return ( Object.keys( raw ) as PartName[] ).map( ( kind ) => {
			const cell = raw[ kind ]!;
			return {
				kind,
				left: cell.left || '0%',
				top: Number( cell.top ) || 0,
				width: cell.width || '100%',
				height: Number( cell.height ) || 1
			};
		} );
	}
	return [
		{ kind: 'name', left: '0%', top: 0, width: '65%', height: 1 },
		{ kind: 'rating', left: '65%', top: 0, width: '35%', height: 1 }
	];
} );

const selectedPart = computed<PartBoxEntry | null>( () => {
	const list = activeParts.value;
	return list.find( p => p.kind === selectedPartKey.value ) || list[ 0 ] || null;
} );

const maxRowCount = computed( () => {
	let max = 2;
	for ( const p of activeParts.value ) {
		const bottom = ( Number( p.top ) || 0 ) + ( Number( p.height ) || 1 );
		if ( bottom + 1 > max ) max = bottom + 1;
	}
	return Math.max( 2, Math.min( 8, max ) );
} );

const isNotesCard = computed( {
	get: () => getView( workingSet.value )?.style?.body === 'notes',
	set: ( val: boolean ) => {
		const v = ensureView( workingSet.value );
		if ( !v.style ) v.style = {};
		if ( val ) {
			v.style.body = 'notes';
			if ( typeof workingSet.value.notes !== 'string' ) {
				workingSet.value.notes = '';
			}
		} else if ( v.style.body === 'notes' ) {
			delete v.style.body;
		}
	}
} );

const playMutable = computed( {
	get: () => Boolean( getView( workingSet.value )?.playMutable ),
	set: ( val: boolean ) => {
		const v = ensureView( workingSet.value );
		if ( val ) v.playMutable = true;
		else delete v.playMutable;
	}
} );

const setPillar = computed( {
	get: () => {
		const raw = getView( workingSet.value )?.pillar;
		return ( typeof raw === 'string' && raw.trim() ) ? raw.trim() : 'play';
	},
	set: ( val: string ) => {
		const v = ensureView( workingSet.value );
		const trimmed = ( val || '' ).trim().toLowerCase();
		v.pillar = trimmed || 'play';
	}
} );

const customPillarLabel = computed( {
	get: () => {
		const key = setPillar.value;
		return getView( workingSet.value )?.labels?.pillars?.[ key ] || '';
	},
	set: ( val: string ) => {
		const key = setPillar.value;
		const v = ensureView( workingSet.value );
		const trimmed = ( val || '' ).trim();
		if ( trimmed ) {
			if ( !v.labels ) v.labels = {};
			if ( !v.labels.pillars ) v.labels.pillars = {};
			v.labels.pillars[ key ] = trimmed;
		} else if ( v.labels?.pillars ) {
			delete v.labels.pillars[ key ];
		}
	}
} );

const trackLabelText = computed( {
	get: () => getView( workingSet.value )?.labels?.track || '',
	set: ( val: string ) => {
		const v = ensureView( workingSet.value );
		const trimmed = ( val || '' ).trim();
		if ( trimmed ) {
			if ( !v.labels ) v.labels = {};
			v.labels.track = trimmed;
		} else if ( v.labels ) {
			delete v.labels.track;
		}
		delete ( v.labels as any )?.stress;
	}
} );

function getChildMarker( sub: any ): 'T' | 'L' {
	if ( sub && ( sub.marker === 'T' || sub.marker === 'L' ) ) return sub.marker;
	if ( sub && ( sub.rating?.type === 'SFX' || sub.rating?.type === 'Statement' || sub.description ) ) return 'T';
	return 'L';
}

function toggleChildMarker( sub: any ) {
	sub.marker = getChildMarker( sub ) === 'L' ? 'T' : 'L';
}

const outIndicator = computed( {
	get: () => Boolean( getView( workingSet.value )?.outIndicator ),
	set: ( val: boolean ) => {
		const v = ensureView( workingSet.value );
		if ( val ) {
			v.outIndicator = true;
		} else {
			delete v.outIndicator;
		}
	}
} );

const headerPlacement = computed( () => getView( workingSet.value )?.header === 'top' ? 'top' : 'sidebar' );
const headerAlign = computed( () => getView( workingSet.value )?.headerAlign || 'center' );

function setHeaderPlacement( placement: 'sidebar' | 'top', align?: 'left' | 'center' | 'right' ) {
	const v = ensureView( workingSet.value );
	if ( placement === 'top' ) {
		v.header = 'top';
		v.headerAlign = align || 'center';
	} else {
		delete v.header;
		delete v.headerAlign;
	}
}

// Icon language helpers (Section 4a: T = text, L = label, single die SVG, bundle of dice SVG, .pip-bubble)
const singleDieSVG = computed( () => cortexFunctions.renderDieGeometrySVG( 8, false, 'mini-icon-die' ) );
const bundleDiceSVG = computed( () => (
	cortexFunctions.renderDieGeometrySVG( 6, false, 'mini-icon-die mini-bundle-1' ) +
	cortexFunctions.renderDieGeometrySVG( 8, true, 'mini-icon-die mini-bundle-2' ) +
	cortexFunctions.renderDieGeometrySVG( 10, false, 'mini-icon-die mini-bundle-3' )
) );

function resolveRatingKindForSet(): 'Die' | 'Dice' | 'Pip' | 'Counter' | 'None' {
	const firstTrait = workingSet.value?.traits?.[ 0 ];
	const tType = firstTrait?.rating?.type;
	if ( tType === 'Die' || tType === 'Dice' || tType === 'Pip' || tType === 'Counter' || tType === 'None' ) {
		return tType;
	}
	return 'Die';
}

function getPartMarkerType( kind: PartName ): 'T' | 'L' | 'die' | 'pool' | 'pip' {
	if ( kind === 'trackLabel' ) return 'L';
	if ( kind === 'name' ) return playMutable.value ? 'T' : 'L';
	if ( kind === 'description' || kind === 'block' ) return 'T';
	if ( kind === 'track' ) return 'die';
	if ( kind === 'subtraits' ) return 'pool';
	if ( kind === 'rating' ) {
		const rKind = resolveRatingKindForSet();
		if ( rKind === 'Dice' ) return 'pool';
		if ( rKind === 'Pip' ) return 'pip';
		return 'die';
	}
	return 'T';
}

// Inventory groups by noun — surfaces any misspelled trait or companion noun as an extra group without validation gates
interface InventoryTile {
	kind: PartName;
	label: string;
	noun: string;
	marker: 'T' | 'L' | 'die' | 'pool' | 'pip';
}

interface InventoryNounGroup {
	noun: string;
	category: 'primary' | 'companion';
	tiles: InventoryTile[];
}

const inventoryGroups = computed<InventoryNounGroup[]>( () => {
	const groups: InventoryNounGroup[] = [];
	const primaryNouns = new Set<string>();
	const baseNoun = ( workingSet.value?.noun || 'Trait' ).trim() || 'Trait';
	primaryNouns.add( baseNoun );

	for ( const t of ( workingSet.value?.traits || [] ) ) {
		const tNoun = ( t?.noun || ( getView( t ) as any )?.noun || '' ).trim();
		if ( tNoun ) primaryNouns.add( tNoun );
	}

	for ( const noun of primaryNouns ) {
		groups.push( {
			noun,
			category: 'primary',
			tiles: [
				{ kind: 'name', label: `${noun} Name`, noun, marker: getPartMarkerType( 'name' ) },
				{ kind: 'rating', label: `${noun} Rating`, noun, marker: getPartMarkerType( 'rating' ) },
				{ kind: 'description', label: `${noun} Description`, noun, marker: 'T' },
				{ kind: 'block', label: `${noun} Block`, noun, marker: 'T' },
				{ kind: 'subtraits', label: `${noun} Subtraits`, noun, marker: 'pool' }
			]
		} );
	}

	const companionNouns = new Set<string>();
	const configuredTrack = ( getView( workingSet.value )?.labels?.track || '' ).trim();
	if ( configuredTrack ) companionNouns.add( configuredTrack );

	for ( const t of ( workingSet.value?.traits || [] ) ) {
		for ( const sub of ( t?.traits || [] ) ) {
			const subType = sub?.rating?.type;
			if ( subType && subType !== 'SFX' && subType !== 'Statement' && subType !== 'None' ) {
				const sName = ( sub?.name || '' ).trim();
				if ( sName ) companionNouns.add( sName );
			}
		}
	}

	if ( companionNouns.size === 0 ) {
		companionNouns.add( 'Stress' );
	}

	for ( const cNoun of companionNouns ) {
		groups.push( {
			noun: cNoun,
			category: 'companion',
			tiles: [
				{ kind: 'trackLabel', label: `${cNoun} Track Label`, noun: cNoun, marker: 'L' },
				{ kind: 'track', label: `${cNoun} Track`, noun: cNoun, marker: 'die' }
			]
		} );
	}

	return groups;
} );

function isPartActive( kind: PartName ): boolean {
	return activeParts.value.some( p => p.kind === kind );
}

function addOrFocusPart( kind: PartName, noun?: string ) {
	const map = ensurePartsMap();
	const v = ensureView( workingSet.value );
	if ( !v.features || typeof v.features !== 'object' || Array.isArray( v.features ) ) {
		v.features = {};
	}

	if ( kind === 'description' ) v.features.description = true;
	if ( kind === 'block' ) v.features.sfx = true;
	if ( kind === 'subtraits' ) v.features.subtraits = true;

	if ( ( kind === 'track' || kind === 'trackLabel' ) && noun ) {
		if ( !v.labels ) v.labels = {};
		if ( !v.labels.track ) v.labels.track = noun;
		delete ( v.labels as any )?.stress;
		ensureCompanionTrackOnTraits( noun );
	}

	if ( map[ kind ] ) {
		selectedPartKey.value = kind;
		return;
	}

	let nextTop = 0;
	for ( const k of Object.keys( map ) ) {
		const cell = map[ k ];
		const bottom = ( Number( cell.top ) || 0 ) + ( Number( cell.height ) || 1 );
		if ( bottom > nextTop ) nextTop = bottom;
	}

	if ( kind === 'trackLabel' ) {
		map.trackLabel = { left: '0%', top: nextTop, width: '30%', height: 1 };
	} else if ( kind === 'track' ) {
		const labelRow = map.trackLabel ? map.trackLabel.top : nextTop;
		map.track = { left: '30%', top: labelRow, width: '70%', height: 1 };
	} else {
		map[ kind ] = { left: '0%', top: nextTop, width: '100%', height: 1 };
	}

	selectedPartKey.value = kind;
}

function removePartByKey( kind: PartName ) {
	const map = ensurePartsMap();
	if ( Object.keys( map ).length <= 1 || !map[ kind ] ) return;
	delete map[ kind ];
	const remaining = Object.keys( map ) as PartName[];
	if ( selectedPartKey.value === kind && remaining.length > 0 ) {
		selectedPartKey.value = remaining[ 0 ];
	}
	const v = ensureView( workingSet.value );
	if ( v.features && typeof v.features === 'object' && !Array.isArray( v.features ) ) {
		if ( kind === 'description' ) delete v.features.description;
		if ( kind === 'block' ) delete v.features.sfx;
		if ( kind === 'subtraits' ) delete v.features.subtraits;
	}
}

function ensureCompanionTrackOnTraits( companionNoun: string ) {
	const traits = workingSet.value.traits || [];
	for ( const t of traits ) {
		if ( !Array.isArray( t.traits ) ) t.traits = [];
		const hasTrackSub = t.traits.some( ( sub: any ) =>
			sub?.rating?.type && sub.rating.type !== 'SFX' && sub.rating.type !== 'Statement' && sub.rating.type !== 'None'
		);
		if ( !hasTrackSub ) {
			t.traits.push( {
				id: cortexFunctions.generateUUID(),
				name: companionNoun || 'Stress',
				rating: {
					type: 'Die',
					value: 0,
					values: [],
					range: [ 4, 6, 8, 10, 12 ]
				}
			} );
		}
	}
}

// Inventory HTML5 drag onto grid canvas
const draggedInventoryTile = ref<{ kind: PartName; noun: string } | null>( null );

function onInventoryDragStart( ev: DragEvent, tile: InventoryTile ) {
	draggedInventoryTile.value = { kind: tile.kind, noun: tile.noun };
	if ( ev.dataTransfer ) {
		ev.dataTransfer.effectAllowed = 'copyMove';
		ev.dataTransfer.setData( 'text/plain', tile.kind );
	}
}

function onGridDragOver( ev: DragEvent ) {
	ev.preventDefault();
	if ( ev.dataTransfer ) ev.dataTransfer.dropEffect = 'copy';
}

function onGridDrop( ev: DragEvent ) {
	ev.preventDefault();
	const tile = draggedInventoryTile.value;
	draggedInventoryTile.value = null;
	if ( !tile ) return;

	addOrFocusPart( tile.kind, tile.noun );
	const map = ensurePartsMap();
	const cell = map[ tile.kind ];
	if ( cell && gridEl.value ) {
		const rect = gridEl.value.getBoundingClientRect();
		if ( rect.width > 0 && rect.height > 0 ) {
			const relX = Math.max( 0, Math.min( 0.9, ( ev.clientX - rect.left ) / rect.width ) );
			const relY = Math.max( 0, ( ev.clientY - rect.top ) / 38 );
			const snappedLeft = Math.round( ( relX * 100 ) / 5 ) * 5;
			const curWidth = parsePct( cell.width ) || 35;
			cell.left = formatPct( Math.min( 100 - curWidth, snappedLeft ) );
			cell.top = Math.max( 0, Math.min( 7, Math.floor( relY ) ) );
		}
	}
}

// Pointer drag & edge-grab resize on part boxes
function onPartPointerDown( ev: PointerEvent, kind: PartName, mode: 'move' | 'resize-e' | 'resize-s' ) {
	ev.stopPropagation();
	selectedPartKey.value = kind;
	const map = ensurePartsMap();
	const cell = map[ kind ];
	if ( !cell ) return;

	draggingKey.value = kind;
	dragMode.value = mode;
	dragStart.value = {
		x: ev.clientX,
		y: ev.clientY,
		left: parsePct( cell.left ) ?? 0,
		width: parsePct( cell.width ) ?? 100,
		top: Number( cell.top ) || 0,
		height: Number( cell.height ) || 1
	};

	window.addEventListener( 'pointermove', onWindowPointerMove );
	window.addEventListener( 'pointerup', onWindowPointerUp );
}

function onWindowPointerMove( ev: PointerEvent ) {
	if ( !draggingKey.value || !dragStart.value || !gridEl.value ) return;
	const map = ensurePartsMap();
	const cell = map[ draggingKey.value ];
	if ( !cell ) return;

	const rect = gridEl.value.getBoundingClientRect();
	const dxPct = rect.width > 0 ? ( ( ev.clientX - dragStart.value.x ) / rect.width ) * 100 : 0;
	const dyRows = Math.round( ( ev.clientY - dragStart.value.y ) / 38 );

	if ( dragMode.value === 'move' ) {
		const rawLeft = Math.round( ( dragStart.value.left + dxPct ) / 5 ) * 5;
		const clampedLeft = Math.max( 0, Math.min( 100 - dragStart.value.width, rawLeft ) );
		const clampedTop = Math.max( 0, Math.min( 7, dragStart.value.top + dyRows ) );
		cell.left = formatPct( clampedLeft );
		cell.top = clampedTop;
	} else if ( dragMode.value === 'resize-e' ) {
		const rawWidth = Math.round( ( dragStart.value.width + dxPct ) / 5 ) * 5;
		const clampedWidth = Math.max( 10, Math.min( 100 - dragStart.value.left, rawWidth ) );
		cell.width = formatPct( clampedWidth );
	} else if ( dragMode.value === 'resize-s' ) {
		const clampedHeight = Math.max( 1, Math.min( 6, dragStart.value.height + dyRows ) );
		cell.height = clampedHeight;
	}
}

function onWindowPointerUp() {
	draggingKey.value = null;
	dragMode.value = null;
	dragStart.value = null;
	window.removeEventListener( 'pointermove', onWindowPointerMove );
	window.removeEventListener( 'pointerup', onWindowPointerUp );
}

// Keyboard nudge & resize on part boxes (Arrow = move, Shift+Arrow = resize, Delete = remove)
function onPartKeyDown( ev: KeyboardEvent, kind: PartName ) {
	const map = ensurePartsMap();
	const cell = map[ kind ];
	if ( !cell ) return;

	const curLeft = parsePct( cell.left ) ?? 0;
	const curWidth = parsePct( cell.width ) ?? 100;
	const curTop = Number( cell.top ) || 0;
	const curHeight = Number( cell.height ) || 1;

	if ( ev.key === 'Delete' || ev.key === 'Backspace' ) {
		ev.preventDefault();
		removePartByKey( kind );
		return;
	}

	if ( ev.shiftKey ) {
		if ( ev.key === 'ArrowRight' ) {
			ev.preventDefault();
			cell.width = formatPct( Math.min( 100 - curLeft, curWidth + 5 ) );
		} else if ( ev.key === 'ArrowLeft' ) {
			ev.preventDefault();
			cell.width = formatPct( Math.max( 10, curWidth - 5 ) );
		} else if ( ev.key === 'ArrowDown' ) {
			ev.preventDefault();
			cell.height = Math.min( 6, curHeight + 1 );
		} else if ( ev.key === 'ArrowUp' ) {
			ev.preventDefault();
			cell.height = Math.max( 1, curHeight - 1 );
		}
		return;
	}

	if ( ev.key === 'ArrowRight' ) {
		ev.preventDefault();
		cell.left = formatPct( Math.min( 100 - curWidth, curLeft + 5 ) );
	} else if ( ev.key === 'ArrowLeft' ) {
		ev.preventDefault();
		cell.left = formatPct( Math.max( 0, curLeft - 5 ) );
	} else if ( ev.key === 'ArrowDown' ) {
		ev.preventDefault();
		cell.top = Math.min( 7, curTop + 1 );
	} else if ( ev.key === 'ArrowUp' ) {
		ev.preventDefault();
		cell.top = Math.max( 0, curTop - 1 );
	}
}

// Numeric readout getters/setters for the selected part
const selectedLeftNum = computed( {
	get: () => parsePct( selectedPart.value?.left ) ?? 0,
	set: ( val: number ) => {
		const map = ensurePartsMap();
		const cell = map[ selectedPartKey.value ];
		if ( !cell ) return;
		const w = parsePct( cell.width ) ?? 100;
		const clamped = Math.max( 0, Math.min( 100 - w, Math.round( Number( val ) || 0 ) ) );
		cell.left = formatPct( clamped );
	}
} );

const selectedWidthNum = computed( {
	get: () => parsePct( selectedPart.value?.width ) ?? 100,
	set: ( val: number ) => {
		const map = ensurePartsMap();
		const cell = map[ selectedPartKey.value ];
		if ( !cell ) return;
		const l = parsePct( cell.left ) ?? 0;
		const clamped = Math.max( 10, Math.min( 100 - l, Math.round( Number( val ) || 10 ) ) );
		cell.width = formatPct( clamped );
	}
} );

const selectedTopNum = computed( {
	get: () => Number( selectedPart.value?.top ) || 0,
	set: ( val: number ) => {
		const map = ensurePartsMap();
		const cell = map[ selectedPartKey.value ];
		if ( !cell ) return;
		cell.top = Math.max( 0, Math.min( 7, Math.round( Number( val ) || 0 ) ) );
	}
} );

const selectedHeightNum = computed( {
	get: () => Number( selectedPart.value?.height ) || 1,
	set: ( val: number ) => {
		const map = ensurePartsMap();
		const cell = map[ selectedPartKey.value ];
		if ( !cell ) return;
		cell.height = Math.max( 1, Math.min( 6, Math.round( Number( val ) || 1 ) ) );
	}
} );

function getPartBoxStyle( part: PartBoxEntry ) {
	const left = parsePct( part.left ) ?? 0;
	const width = parsePct( part.width ) ?? 100;
	const top = Number( part.top ) || 0;
	const height = Number( part.height ) || 1;
	return {
		left: `${left}%`,
		width: `${width}%`,
		top: `${top * 38}px`,
		height: `${height * 38 - 4}px`
	};
}

// Trait & Companion authoring helpers (logical trait order)
const DIE_SIDES = [ 4, 6, 8, 10, 12 ];

function addTraitRow() {
	if ( !Array.isArray( workingSet.value.traits ) ) workingSet.value.traits = [];
	const rKind = resolveRatingKindForSet();
	const newTrait: any = {
		id: cortexFunctions.generateUUID(),
		name: `New ${workingSet.value.noun || 'Trait'}`,
		rating: rKind === 'Pip'
			? { type: 'Pip', value: 1, max: 5 }
			: rKind === 'Dice'
				? { type: 'Dice', values: [ 6, 8 ] }
				: rKind === 'None'
					? { type: 'None', values: [] }
					: { type: 'Die', values: [ 8 ] },
		traits: []
	};
	if ( isPartActive( 'track' ) || isPartActive( 'trackLabel' ) ) {
		newTrait.traits.push( {
			id: cortexFunctions.generateUUID(),
			name: trackLabelText.value || 'Stress',
			rating: {
				type: 'Die',
				value: 0,
				values: [],
				range: [ 4, 6, 8, 10, 12 ]
			}
		} );
	}
	workingSet.value.traits.push( newTrait );
}

function removeTraitRow( tIdx: number ) {
	if ( !Array.isArray( workingSet.value.traits ) ) return;
	workingSet.value.traits.splice( tIdx, 1 );
}

function setTraitRatingType( trait: any, nextType: string ) {
	if ( !trait.rating ) trait.rating = {};
	trait.rating.type = nextType;
	if ( nextType === 'Die' ) {
		trait.rating.values = [ trait.rating.values?.[ 0 ] || 8 ];
	} else if ( nextType === 'Dice' ) {
		trait.rating.values = Array.isArray( trait.rating.values ) && trait.rating.values.length > 0
			? trait.rating.values
			: [ 6, 8 ];
	} else if ( nextType === 'Pip' ) {
		trait.rating.value = typeof trait.rating.value === 'number' ? trait.rating.value : 1;
		trait.rating.max = typeof trait.rating.max === 'number' ? trait.rating.max : 5;
	} else if ( nextType === 'None' ) {
		trait.rating.values = [];
	}
}

function setTraitDieValue( trait: any, dieVal: number ) {
	if ( !trait.rating ) trait.rating = { type: 'Die', values: [ dieVal ] };
	if ( trait.rating.type === 'Dice' ) {
		if ( !Array.isArray( trait.rating.values ) ) trait.rating.values = [];
		const idx = trait.rating.values.indexOf( dieVal );
		if ( idx >= 0 && trait.rating.values.length > 1 ) {
			trait.rating.values.splice( idx, 1 );
		} else {
			trait.rating.values.push( dieVal );
		}
	} else {
		trait.rating.values = [ dieVal ];
		trait.rating.value = dieVal;
	}
}

function addTraitBlockEntry( trait: any ) {
	if ( !Array.isArray( trait.traits ) ) trait.traits = [];
	trait.traits.push( {
		id: cortexFunctions.generateUUID(),
		name: 'Effect',
		description: 'Spend a PP to do something cool.',
		rating: { type: 'SFX' }
	} );
	addOrFocusPart( 'block' );
}

function addTraitCompanion( trait: any ) {
	if ( !Array.isArray( trait.traits ) ) trait.traits = [];
	const cNoun = trackLabelText.value || 'Stress';
	trait.traits.push( {
		id: cortexFunctions.generateUUID(),
		name: cNoun,
		rating: {
			type: 'Die',
			value: 0,
			values: [],
			range: [ 4, 6, 8, 10, 12 ]
		}
	} );
	addOrFocusPart( 'trackLabel', cNoun );
	addOrFocusPart( 'track', cNoun );
}

function toggleCompanionRangeDie( sub: any, side: number ) {
	if ( !sub.rating ) sub.rating = { type: 'Die', value: 0, values: [], range: [ 4, 6, 8, 10, 12 ] };
	const curRange: number[] = Array.isArray( sub.rating.range ) && sub.rating.range.length > 0
		? [ ...sub.rating.range ]
		: [ 4, 6, 8, 10, 12 ];
	const idx = curRange.indexOf( side );
	if ( idx >= 0 ) {
		if ( curRange.length > 1 ) curRange.splice( idx, 1 );
	} else {
		curRange.push( side );
		curRange.sort( ( a, b ) => a - b );
	}
	sub.rating.range = curRange;
}

function setCompanionActiveDie( sub: any, side: number ) {
	if ( !sub.rating ) sub.rating = { type: 'Die', value: 0, values: [], range: [ 4, 6, 8, 10, 12 ] };
	if ( sub.rating.value === side ) {
		sub.rating.value = 0;
		sub.rating.values = [];
	} else {
		sub.rating.value = side;
		sub.rating.values = [ side ];
	}
}

function removeSubtrait( trait: any, subIdx: number ) {
	if ( !Array.isArray( trait.traits ) ) return;
	trait.traits.splice( subIdx, 1 );
}

// Live preview character wrapper so TraitSetBlock renders standalone without any open sheet
const previewCharacter = computed( () => ( {
	name: 'Preview',
	traitSets: [ workingSet.value ],
	view: {
		labels: getView( workingSet.value )?.labels
			? cortexFunctions.cloneDeep( getView( workingSet.value )?.labels )
			: {}
	}
} ) );

// Save as Preset action
function handleSaveAsPreset() {
	saveStatusMessage.value = '';
	saveErrorMessage.value = '';

	const trimmedLabel = presetLabel.value.trim();
	if ( !trimmedLabel ) {
		saveErrorMessage.value = 'Enter a Preset Label before saving.';
		return;
	}
	if ( hasCollision.value ) {
		saveErrorMessage.value = `Preset ID "${derivedId.value}" already exists. Choose a different Preset Label.`;
		return;
	}

	if ( !isNotesCard.value ) {
		ensurePartsMap();
	}

	const saved = cortexFunctions.saveCustomSetPreset( workingSet.value, {
		label: trimmedLabel,
		blurb: presetBlurb.value.trim() || undefined
	} );

	if ( !saved ) {
		saveErrorMessage.value = `Preset "${derivedId.value}" collides with an existing preset. Enter a different label.`;
		return;
	}

	savedVersion.value++;
	saveStatusMessage.value = `Saved preset "${saved.label}" (${saved.id}) under pillar "${setPillar.value}".`;
	emit( 'saved', saved );
}

function handleApplyToSet() {
	if ( !isNotesCard.value ) {
		ensurePartsMap();
	}
	emit( 'applyToSet', cortexFunctions.cloneDeep( workingSet.value ) );
}
</script>

<template>
	<div class="modal-backdrop trait-set-mini-backdrop" @click.self="emit('close')">
		<div class="modal-dialog trait-set-mini-dialog" role="dialog" aria-modal="true" aria-labelledby="trait-set-mini-title">
			<header class="modal-header trait-set-mini-header">
				<div class="trait-set-mini-title-group">
					<h3 id="trait-set-mini-title">
						<i class="fas fa-th-large" aria-hidden="true"></i>
						Trait Block Mini
					</h3>
					<span class="trait-set-mini-subtitle">Build one trait set from parts &amp; ship as a preset card</span>
				</div>
				<div class="trait-set-mini-header-actions">
					<VisibilityEye :node="workingSet" />
					<button type="button" class="button-close" aria-label="Close Trait Block Mini" @click="emit('close')">
						<i class="fas fa-times" aria-hidden="true"></i>
					</button>
				</div>
			</header>

			<div class="modal-body trait-set-mini-body">
				<!-- Top Metadata Bar: Set Name, Noun, Card Mode (Block vs Notes), Play Mutable -->
				<section class="mini-meta-bar" aria-label="Card Properties">
					<label class="mini-field">
						<span class="mini-field-label">Set Name</span>
						<input
							v-model="workingSet.name"
							type="text"
							class="mini-input"
							placeholder="Set Name"
							aria-label="Set Name"
						/>
					</label>
					<label class="mini-field">
						<span class="mini-field-label">Primary Noun</span>
						<input
							v-model="workingSet.noun"
							type="text"
							class="mini-input"
							placeholder="Trait"
							aria-label="Primary Noun"
						/>
					</label>
					<div class="mini-field">
						<span class="mini-field-label">Card Type</span>
						<div class="mini-segmented" role="group" aria-label="Card Type">
							<button
								type="button"
								class="mini-seg-btn"
								:class="{ active: !isNotesCard }"
								@click="isNotesCard = false"
							>Trait Block</button>
							<button
								type="button"
								class="mini-seg-btn"
								:class="{ active: isNotesCard }"
								@click="isNotesCard = true"
							>Notes Card</button>
						</div>
					</div>
					<div class="mini-field">
						<span class="mini-field-label">Play Mutable</span>
						<button
							type="button"
							class="mini-toggle-btn"
							:class="{ active: playMutable }"
							:aria-pressed="playMutable ? 'true' : 'false'"
							@click="playMutable = !playMutable"
						>
							<span class="mini-marker-badge" :class="{ 'marker-label': !playMutable }">{{ playMutable ? 'T' : 'L' }}</span>
							{{ playMutable ? 'Mutable in Play' : 'Locked Label (L)' }}
						</button>
					</div>
				</section>

				<!-- Icon Legend -->
				<div class="mini-icon-legend" aria-label="Part Icon Legend">
					<span class="legend-item"><strong class="mini-marker-badge">T</strong> Text</span>
					<span class="legend-item"><strong class="mini-marker-badge marker-label">L</strong> Label (Edit-only)</span>
					<span class="legend-item"><span class="legend-svg" v-html="singleDieSVG"></span> Rating (Die)</span>
					<span class="legend-item"><span class="legend-svg legend-bundle" v-html="bundleDiceSVG"></span> Pool</span>
					<span class="legend-item"><span class="pip-bubble" aria-hidden="true"></span> Pip</span>
				</div>

				<div class="mini-workspace">
					<!-- Left Column: Inventory Grid grouped by Noun + 2D Block Canvas -->
					<div class="mini-canvas-column">
						<template v-if="!isNotesCard">
							<!-- Inventory Grid grouped by Noun (surfaces misspelled nouns automatically) -->
							<section class="block-mini-inventory" aria-label="Part Inventory Grid">
								<div class="mini-section-title">Inventory Grid (Drag or Tap to Add Part)</div>
								<div
									v-for="group in inventoryGroups"
									:key="group.category + ':' + group.noun"
									class="inventory-noun-group"
									:data-noun-group="group.noun"
									:data-noun-category="group.category"
								>
									<div class="inventory-noun-header">
										<span class="inventory-noun-title">{{ group.noun }}</span>
										<span class="inventory-noun-tag">{{ group.category === 'companion' ? 'Companion / Track' : 'Trait Noun' }}</span>
									</div>
									<div class="inventory-tiles-row">
										<button
											v-for="tile in group.tiles"
											:key="group.noun + ':' + tile.kind"
											type="button"
											class="inventory-part-tile"
											:class="{ active: isPartActive( tile.kind ) }"
											:data-part-kind="tile.kind"
											:data-part-noun="tile.noun"
											draggable="true"
											@dragstart="onInventoryDragStart( $event, tile )"
											@click="addOrFocusPart( tile.kind, tile.noun )"
										>
											<span v-if="tile.marker === 'T'" class="mini-marker-badge">T</span>
											<span v-else-if="tile.marker === 'L'" class="mini-marker-badge marker-label">L</span>
											<span v-else-if="tile.marker === 'die'" class="mini-tile-svg" v-html="singleDieSVG"></span>
											<span v-else-if="tile.marker === 'pool'" class="mini-tile-svg mini-bundle" v-html="bundleDiceSVG"></span>
											<span v-else-if="tile.marker === 'pip'" class="pip-bubble" aria-hidden="true"></span>
											<span class="inventory-tile-text">{{ tile.label }}</span>
										</button>
									</div>
								</div>
							</section>

							<!-- 2D Trait-Block Grid Canvas -->
							<section class="block-mini-canvas-section" aria-label="Trait Block Grid Canvas">
								<div class="mini-header-placement-bar">
									<span class="mini-section-title">Header Placement:</span>
									<button
										type="button"
										class="mini-chip"
										:class="{ active: headerPlacement === 'sidebar' }"
										@click="setHeaderPlacement('sidebar')"
									><strong class="mini-marker-badge marker-label">L</strong> Left Sidebar</button>
									<button
										type="button"
										class="mini-chip"
										:class="{ active: headerPlacement === 'top' && headerAlign === 'left' }"
										@click="setHeaderPlacement('top', 'left')"
									><strong class="mini-marker-badge marker-label">L</strong> Top Left</button>
									<button
										type="button"
										class="mini-chip"
										:class="{ active: headerPlacement === 'top' && headerAlign === 'center' }"
										@click="setHeaderPlacement('top', 'center')"
									><strong class="mini-marker-badge marker-label">L</strong> Top Center</button>
									<button
										type="button"
										class="mini-chip"
										:class="{ active: headerPlacement === 'top' && headerAlign === 'right' }"
										@click="setHeaderPlacement('top', 'right')"
									><strong class="mini-marker-badge marker-label">L</strong> Top Right</button>
								</div>

								<div class="block-mini-shell" :class="'header-' + headerPlacement">
									<div
										class="block-mini-header-box"
										:class="'align-' + headerAlign"
										title="Set Header Label"
									>
										<span class="mini-marker-badge marker-label">L</span>
										<span class="block-mini-header-text">{{ workingSet.name || 'HEADER' }}</span>
									</div>

									<div
										ref="gridEl"
										class="block-mini-grid"
										:style="{ height: (maxRowCount * 38) + 'px' }"
										@dragover="onGridDragOver"
										@drop="onGridDrop"
									>
										<div
											v-for="part in activeParts"
											:key="part.kind"
											class="block-mini-part-box"
											:class="{ selected: part.kind === selectedPartKey }"
											:data-grid-part="part.kind"
											:style="getPartBoxStyle( part )"
											tabindex="0"
											role="group"
											:aria-label="`Part ${part.kind}: Left ${part.left}, Width ${part.width}, Row ${part.top || 0}, Span ${part.height || 1}. Use arrow keys to move, Shift+Arrow to resize, Delete to remove.`"
											@pointerdown="onPartPointerDown( $event, part.kind, 'move' )"
											@click.stop="selectedPartKey = part.kind"
											@keydown="onPartKeyDown( $event, part.kind )"
										>
											<div class="block-mini-part-inner">
												<span v-if="getPartMarkerType( part.kind ) === 'T'" class="mini-marker-badge">T</span>
												<span v-else-if="getPartMarkerType( part.kind ) === 'L'" class="mini-marker-badge marker-label">L</span>
												<span v-else-if="getPartMarkerType( part.kind ) === 'die'" class="mini-tile-svg" v-html="singleDieSVG"></span>
												<span v-else-if="getPartMarkerType( part.kind ) === 'pool'" class="mini-tile-svg mini-bundle" v-html="bundleDiceSVG"></span>
												<span v-else-if="getPartMarkerType( part.kind ) === 'pip'" class="pip-bubble" aria-hidden="true"></span>
												<span class="block-mini-part-name">{{ part.kind }}</span>
												<span class="block-mini-part-coords">{{ part.left }} · {{ part.width }}</span>
											</div>
											<button
												v-if="activeParts.length > 1"
												type="button"
												class="block-mini-part-remove"
												:aria-label="`Remove ${part.kind} part`"
												@pointerdown.stop
												@click.stop="removePartByKey( part.kind )"
											>&times;</button>
											<span
												class="block-mini-edge block-mini-edge-e"
												title="Drag right edge to resize width"
												@pointerdown.stop="onPartPointerDown( $event, part.kind, 'resize-e' )"
											></span>
											<span
												class="block-mini-edge block-mini-edge-s"
												title="Drag bottom edge to resize height"
												@pointerdown.stop="onPartPointerDown( $event, part.kind, 'resize-s' )"
											></span>
										</div>
									</div>
								</div>

								<!-- Synced Numeric Readout for Selected Part -->
								<div v-if="selectedPart" class="block-mini-readout" aria-label="Selected Part Coordinates">
									<span class="readout-part-title">Part: <strong>{{ selectedPart.kind }}</strong></span>
									<label class="readout-field">
										<span>Left %</span>
										<input v-model.number="selectedLeftNum" type="number" min="0" max="90" step="5" aria-label="Part Left Percent" />
									</label>
									<label class="readout-field">
										<span>Width %</span>
										<input v-model.number="selectedWidthNum" type="number" min="10" max="100" step="5" aria-label="Part Width Percent" />
									</label>
									<label class="readout-field">
										<span>Row</span>
										<input v-model.number="selectedTopNum" type="number" min="0" max="7" step="1" aria-label="Part Row" />
									</label>
									<label class="readout-field">
										<span>Span</span>
										<input v-model.number="selectedHeightNum" type="number" min="1" max="6" step="1" aria-label="Part Row Span" />
									</label>
								</div>
							</section>
						</template>

						<!-- Notes Card Authoring Surface -->
						<section v-else class="block-mini-notes-editor" aria-label="Notes Card Content">
							<div class="mini-section-title">
								<span class="mini-marker-badge">T</span> Notes Card Content (Markdown Supported)
							</div>
							<textarea
								v-model="workingSet.notes"
								class="mini-notes-textarea"
								rows="6"
								placeholder="Enter default notes template or session prompt..."
								aria-label="Notes Card Text"
							></textarea>
						</section>

						<!-- Trait & Companion Rows (in logical DOM trait order) -->
						<section v-if="!isNotesCard" class="mini-traits-section" aria-label="Traits in Set">
							<div class="mini-traits-header">
								<span class="mini-section-title">Traits (Logical Order)</span>
								<label class="mini-inline-label">
									<span>Track Label:</span>
									<input
										v-model="trackLabelText"
										type="text"
										class="mini-input mini-input-sm"
										placeholder="Stress"
										aria-label="Track Label"
									/>
								</label>
								<label class="mini-inline-label">
									<input
										v-model="outIndicator"
										type="checkbox"
										aria-label="Out Indicator"
									/>
									<span>Out Marker</span>
								</label>
								<button type="button" class="mini-btn-add" @click="addTraitRow">
									+ {{ workingSet.noun || 'Trait' }}
								</button>
							</div>

							<div class="mini-traits-list">
								<article
									v-for="(trait, tIdx) in (workingSet.traits || [])"
									:key="trait.id || tIdx"
									class="mini-trait-card"
									:data-trait-index="tIdx"
								>
									<div class="mini-trait-row-main">
										<span class="mini-marker-badge" :class="{ 'marker-label': !playMutable }">
											{{ playMutable ? 'T' : 'L' }}
										</span>
										<input
											v-model="trait.name"
											type="text"
											class="mini-input mini-trait-name-input"
											placeholder="Trait Name"
											:aria-label="`Trait ${tIdx + 1} Name`"
										/>
										<input
											v-model="trait.noun"
											type="text"
											class="mini-input mini-trait-noun-input"
											:placeholder="workingSet.noun || 'Trait'"
											:aria-label="`Trait ${tIdx + 1} Noun`"
											title="Trait Noun (misspellings surface in Inventory Grid)"
										/>
										<select
											:value="trait.rating?.type || 'Die'"
											class="mini-select-sm"
											:aria-label="`Trait ${tIdx + 1} Rating Type`"
											@change="setTraitRatingType( trait, ($event.target as HTMLSelectElement).value )"
										>
											<option value="Die">Die</option>
											<option value="Dice">Pool (Dice)</option>
											<option value="Pip">Pips</option>
											<option value="None">None</option>
										</select>

										<!-- Die / Dice selector using real die SVG geometry -->
										<div v-if="trait.rating?.type === 'Die' || trait.rating?.type === 'Dice'" class="mini-die-picker">
											<button
												v-for="side in DIE_SIDES"
												:key="side"
												type="button"
												class="mini-die-chip"
												:class="{ active: (trait.rating?.values || []).includes( side ) }"
												:aria-label="`d${side}`"
												@click="setTraitDieValue( trait, side )"
											>
												<span class="mini-chip-svg" v-html="cortexFunctions.renderDieGeometrySVG( side, (trait.rating?.values || []).includes( side ) )"></span>
												<span class="mini-chip-num">{{ side }}</span>
											</button>
										</div>

										<!-- Pip count selector using real .pip-bubble -->
										<div v-else-if="trait.rating?.type === 'Pip'" class="mini-pip-picker">
											<button
												v-for="p in (trait.rating?.max || 5)"
												:key="p"
												type="button"
												class="mini-pip-btn"
												:aria-label="`Set ${p} pips`"
												@click="trait.rating.value = p"
											>
												<span class="pip-bubble" :class="{ filled: p <= (trait.rating?.value || 0) }" aria-hidden="true"></span>
											</button>
										</div>

										<button
											type="button"
											class="mini-icon-btn"
											title="Add Companion / Stress Track"
											:aria-label="`Add Companion Track to ${trait.name || 'trait'}`"
											@click="addTraitCompanion( trait )"
										>+Track</button>
										<button
											type="button"
											class="mini-icon-btn"
											title="Add Block / SFX Entry"
											:aria-label="`Add Block Entry to ${trait.name || 'trait'}`"
											@click="addTraitBlockEntry( trait )"
										>+Block</button>
										<button
											type="button"
											class="mini-icon-btn mini-btn-danger"
											:aria-label="`Remove ${trait.name || 'trait'}`"
											@click="removeTraitRow( tIdx )"
										>&times;</button>
									</div>

									<!-- Optional Description -->
									<div v-if="isPartActive('description') || trait.description" class="mini-trait-subrow">
										<span class="mini-marker-badge">T</span>
										<input
											v-model="trait.description"
											type="text"
											class="mini-input"
											placeholder="Trait description..."
											:aria-label="`Trait ${tIdx + 1} Description`"
										/>
									</div>

									<!-- Companion tracks & Block entries -->
									<div
										v-for="(sub, sIdx) in (trait.traits || [])"
										:key="sub.id || sIdx"
										class="mini-trait-subrow"
									>
										<template v-if="sub.rating?.type === 'SFX' || sub.rating?.type === 'Statement' || sub.description">
											<button
												type="button"
												class="mini-marker-badge mini-marker-toggle"
												:class="getChildMarker( sub ) === 'L' ? 'marker-label' : 'marker-text'"
												@click="toggleChildMarker( sub )"
												:title="`Flag as ${getChildMarker( sub ) === 'L' ? 'Text (T)' : 'Label (L)'}`"
											>{{ getChildMarker( sub ) }}</button>
											<input
												v-model="sub.name"
												type="text"
												class="mini-input mini-input-sm mini-subrow-noun"
												placeholder="Block Label"
												:aria-label="`Block Label ${sIdx + 1}`"
											/>
											<input
												v-model="sub.description"
												type="text"
												class="mini-input"
												placeholder="Block text..."
												:aria-label="`Block Text ${sIdx + 1}`"
											/>
											<button type="button" class="mini-icon-btn mini-btn-danger mini-subrow-remove" aria-label="Remove Block Entry" @click="removeSubtrait( trait, sIdx )">&times;</button>
										</template>
										<template v-else>
											<button
												type="button"
												class="mini-marker-badge mini-marker-toggle"
												:class="getChildMarker( sub ) === 'T' ? 'marker-text' : 'marker-label'"
												@click="toggleChildMarker( sub )"
												:title="`Flag as ${getChildMarker( sub ) === 'T' ? 'Text (T)' : 'Label (L)'}`"
											>{{ getChildMarker( sub ) }}</button>
											<input
												v-model="sub.name"
												type="text"
												class="mini-input mini-input-sm mini-subrow-noun"
												:placeholder="trackLabelText || 'Stress'"
												:aria-label="`Companion Track Noun ${sIdx + 1}`"
												title="Companion Noun (e.g. Injured, Worried)"
											/>
											<span class="mini-subrow-caption">Range:</span>
											<div class="mini-die-picker" role="group" aria-label="Companion Track Range">
												<button
													v-for="side in DIE_SIDES"
													:key="'range-' + side"
													type="button"
													class="mini-die-chip"
													:class="{ active: (sub.rating?.range || [4,6,8,10,12]).includes( side ) }"
													:aria-label="`Toggle d${side} in track range`"
													@click="toggleCompanionRangeDie( sub, side )"
												>
													<span class="c" v-html="cortexFunctions.getDieDisplayValue(side)"></span>
												</button>
											</div>
											<span class="mini-subrow-caption">Rating:</span>
											<div class="mini-die-picker" role="group" aria-label="Companion Track Rating">
												<button
													v-for="side in (sub.rating?.range || [4,6,8,10,12])"
													:key="'val-' + side"
													type="button"
													class="mini-die-chip"
													:class="{ active: sub.rating?.value === side }"
													:aria-label="`Set track rating d${side}`"
													@click="setCompanionActiveDie( sub, side )"
												>
													<span class="c" v-html="cortexFunctions.getDieDisplayValue(side)"></span>
												</button>
											</div>
											<button type="button" class="mini-icon-btn mini-btn-danger mini-subrow-remove" aria-label="Remove Companion Track" @click="removeSubtrait( trait, sIdx )">&times;</button>
										</template>
									</div>
								</article>
							</div>
						</section>
					</div>

					<!-- Right Column: Live Rendered Block Preview + Save as Preset Card -->
					<div class="mini-preview-column">
						<section class="mini-live-preview-section" aria-label="Live Card Preview">
							<div class="mini-preview-toolbar">
								<span class="mini-section-title">Live Card Preview</span>
								<div class="mini-segmented" role="group" aria-label="Preview Mode">
									<button
										type="button"
										class="mini-seg-btn"
										:class="{ active: previewSubmode === 'play' }"
										@click="previewSubmode = 'play'"
									>Play</button>
									<button
										type="button"
										class="mini-seg-btn"
										:class="{ active: previewSubmode === 'edit' }"
										@click="previewSubmode = 'edit'"
									>Edit</button>
								</div>
							</div>
							<div class="mini-live-preview-canvas">
								<TraitSetBlock
									:character="previewCharacter"
									:traitSetID="0"
									:submode="previewSubmode"
									:editing="null"
								/>
							</div>
						</section>

						<!-- Save as Preset Section (Section 4b) -->
						<section class="mini-save-preset-section" aria-label="Save as Preset">
							<div class="mini-section-title">Save as Preset Card</div>

							<div class="mini-save-grid">
								<label class="mini-field">
									<span class="mini-field-label">Preset Label (Required)</span>
									<input
										v-model="presetLabel"
										type="text"
										class="mini-input"
										placeholder="Enter preset label..."
										aria-label="Preset Label"
									/>
									<span v-if="derivedId" class="mini-derived-id">
										ID: <code>{{ derivedId }}</code>
									</span>
								</label>

								<label class="mini-field">
									<span class="mini-field-label">Blurb (Optional)</span>
									<input
										v-model="presetBlurb"
										type="text"
										class="mini-input"
										placeholder="Optional one-line summary..."
										aria-label="Preset Blurb"
									/>
								</label>

								<div class="mini-field">
									<label for="mini-pillar-key-input" class="mini-field-label">Pillar Key (Open String)</label>
									<input
										id="mini-pillar-key-input"
										v-model="setPillar"
										type="text"
										class="mini-input"
										placeholder="play"
										aria-label="Pillar Key"
									/>
									<div class="mini-pillar-chips" role="group" aria-label="Quick Pillar Keys">
										<button
											v-for="pKey in ['play', 'prime', 'plus', 'identity']"
											:key="pKey"
											type="button"
											class="mini-chip"
											:class="{ active: setPillar === pKey }"
											@click="setPillar = pKey"
										>{{ pKey }}</button>
									</div>
								</div>

								<label class="mini-field">
									<span class="mini-field-label">Pillar Display Label (Optional)</span>
									<input
										v-model="customPillarLabel"
										type="text"
										class="mini-input"
										:placeholder="setPillar.toUpperCase()"
										aria-label="Pillar Display Label"
									/>
								</label>
							</div>

							<div v-if="hasCollision" class="mini-collision-alert" role="alert">
								A preset with ID <code>{{ derivedId }}</code> already exists. Enter a different Preset Label to save without overwriting.
							</div>
							<div v-if="saveErrorMessage" class="mini-collision-alert" role="alert">
								{{ saveErrorMessage }}
							</div>
							<div v-if="saveStatusMessage" class="mini-save-success" role="status">
								{{ saveStatusMessage }}
							</div>

							<div class="mini-save-actions">
								<button
									v-if="props.initialSet"
									type="button"
									class="button-secondary mini-apply-btn"
									@click="handleApplyToSet"
								>Apply to Current Sheet</button>
								<button
									type="button"
									class="button-primary mini-save-preset-btn"
									:disabled="!presetLabel.trim() || hasCollision"
									@click="handleSaveAsPreset"
								>
									<i class="fas fa-bookmark" aria-hidden="true"></i>
									Save as Preset Card
								</button>
							</div>
						</section>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

```

---

## 5. CSS Stylesheet: Mini Rules from `css/_editor.scss`

```scss
.trait-set-mini-backdrop {
	position: fixed;
	inset: 0;
	background: rgba(15, 23, 42, 0.72);
	z-index: 2500;
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 1rem;
}

.trait-set-mini-dialog {
	background: #1e293b;
	color: #f1f5f9;
	border: 1px solid rgba(255, 255, 255, 0.16);
	border-radius: 10px;
	width: 100%;
	max-width: 1120px;
	max-height: 92vh;
	display: flex;
	flex-direction: column;
	box-shadow: 0 20px 45px rgba(0, 0, 0, 0.55);
	overflow: hidden;
}

.trait-set-mini-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 0.75rem 1.1rem;
	background: #0f172a;
	border-bottom: 1px solid rgba(255, 255, 255, 0.12);

	.trait-set-mini-title-group {
		display: flex;
		align-items: baseline;
		gap: 0.75rem;
		flex-wrap: wrap;

		h3 {
			margin: 0;
			font-size: 1.05rem;
			font-weight: 800;
			color: #f8fafc;
			display: inline-flex;
			align-items: center;
			gap: 0.45rem;
		}

		.trait-set-mini-subtitle {
			font-size: 0.78rem;
			color: #cbd5e1;
		}
	}

	.trait-set-mini-header-actions {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.button-close {
		background: transparent;
		border: 1px solid rgba(255, 255, 255, 0.2);
		color: #f1f5f9;
		border-radius: 6px;
		width: 2rem;
		height: 2rem;
		cursor: pointer;
		display: inline-flex;
		align-items: center;
		justify-content: center;

		&:hover {
			background: rgba(255, 255, 255, 0.1);
		}
	}
}

.trait-set-mini-body {
	padding: 0.9rem 1.1rem;
	overflow-y: auto;
	display: flex;
	flex-direction: column;
	gap: 0.85rem;

	.mini-meta-bar {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
		gap: 0.65rem;
		background: rgba(15, 23, 42, 0.55);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 8px;
		padding: 0.65rem 0.8rem;
	}

	.mini-field {
		display: flex;
		flex-direction: column;
		gap: 0.28rem;

		.mini-field-label {
			font-size: 0.7rem;
			font-weight: 700;
			text-transform: uppercase;
			letter-spacing: 0.04em;
			color: #cbd5e1;
		}
	}

	.mini-input,
	.mini-select-sm,
	.mini-notes-textarea {
		background: #0f172a;
		border: 1px solid #475569;
		border-radius: 5px;
		color: #f8fafc;
		padding: 0.36rem 0.55rem;
		font-size: 0.84rem;

		&:focus {
			outline: 2px solid #38bdf8;
			border-color: #38bdf8;
		}
	}

	.mini-input-sm {
		width: 7rem;
		padding: 0.25rem 0.45rem;
		font-size: 0.78rem;
	}

	.mini-segmented {
		display: inline-flex;
		background: #0f172a;
		border: 1px solid #475569;
		border-radius: 6px;
		overflow: hidden;

		.mini-seg-btn {
			flex: 1;
			background: transparent;
			border: none;
			color: #cbd5e1;
			font-size: 0.78rem;
			font-weight: 700;
			padding: 0.35rem 0.65rem;
			cursor: pointer;

			&.active {
				background: #0284c7;
				color: #ffffff;
			}
		}
	}

	.mini-toggle-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		background: #0f172a;
		border: 1px solid #475569;
		color: #e2e8f0;
		border-radius: 6px;
		padding: 0.32rem 0.6rem;
		font-size: 0.78rem;
		font-weight: 600;
		cursor: pointer;

		&.active {
			border-color: #38bdf8;
			background: rgba(56, 189, 248, 0.14);
		}
	}

	.mini-marker-badge {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: 1.25rem;
		height: 1.25rem;
		padding: 0 0.25rem;
		border-radius: 4px;
		background: #0284c7;
		color: #ffffff;
		font-size: 0.7rem;
		font-weight: 800;
		font-family: monospace;
		line-height: 1;

		&.marker-label {
			background: #64748b;
		}
	}

	.mini-icon-legend {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.9rem;
		padding: 0.4rem 0.75rem;
		background: rgba(15, 23, 42, 0.4);
		border-radius: 6px;
		font-size: 0.76rem;
		color: #cbd5e1;

		.legend-item {
			display: inline-flex;
			align-items: center;
			gap: 0.35rem;
		}

		.legend-svg,
		.mini-tile-svg {
			display: inline-flex;
			align-items: center;

			svg {
				width: 1.1rem;
				height: 1.1rem;

				.diecon-stroke {
					fill: #f8fafc;
				}
				.diecon-fill {
					fill: #0284c7;
				}
			}
		}

		.pip-bubble {
			display: inline-block;
			width: 0.75rem;
			height: 0.75rem;
			border-radius: 50%;
			border: 2px solid #f8fafc;
			background: transparent;

			&.filled {
				background: #38bdf8;
				border-color: #38bdf8;
			}
		}
	}

	.mini-workspace {
		display: grid;
		grid-template-columns: 1.25fr 1fr;
		gap: 1rem;
		align-items: start;

		@media (max-width: 900px) {
			grid-template-columns: 1fr;
		}
	}

	.mini-canvas-column,
	.mini-preview-column {
		display: flex;
		flex-direction: column;
		gap: 0.85rem;
	}

	.mini-section-title {
		font-size: 0.74rem;
		font-weight: 800;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: #94a3b8;
		margin-bottom: 0.35rem;
	}

	.block-mini-inventory,
	.block-mini-canvas-section,
	.block-mini-notes-editor,
	.mini-traits-section,
	.mini-live-preview-section,
	.mini-save-preset-section {
		background: rgba(15, 23, 42, 0.55);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 8px;
		padding: 0.7rem 0.85rem;
	}

	.inventory-noun-group {
		margin-top: 0.45rem;
		padding-top: 0.45rem;
		border-top: 1px dashed rgba(255, 255, 255, 0.1);

		&:first-of-type {
			margin-top: 0.2rem;
			padding-top: 0;
			border-top: none;
		}

		.inventory-noun-header {
			display: flex;
			align-items: center;
			justify-content: space-between;
			margin-bottom: 0.3rem;

			.inventory-noun-title {
				font-size: 0.8rem;
				font-weight: 800;
				color: #38bdf8;
			}

			.inventory-noun-tag {
				font-size: 0.68rem;
				color: #94a3b8;
				background: rgba(255, 255, 255, 0.06);
				padding: 0.1rem 0.4rem;
				border-radius: 4px;
			}
		}

		.inventory-tiles-row {
			display: flex;
			flex-wrap: wrap;
			gap: 0.4rem;
		}
	}

	.inventory-part-tile {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		background: #1e293b;
		border: 1px solid #475569;
		color: #f1f5f9;
		border-radius: 6px;
		padding: 0.3rem 0.55rem;
		font-size: 0.76rem;
		font-weight: 600;
		cursor: grab;

		&.active {
			border-color: #38bdf8;
			background: rgba(56, 189, 248, 0.16);
		}

		&:focus-visible {
			outline: 2px solid #38bdf8;
		}

		.mini-tile-svg svg {
			width: 1rem;
			height: 1rem;

			.diecon-stroke {
				fill: #f8fafc;
			}
			.diecon-fill {
				fill: #0284c7;
			}
		}

		.pip-bubble {
			display: inline-block;
			width: 0.7rem;
			height: 0.7rem;
			border-radius: 50%;
			border: 2px solid #f8fafc;
		}
	}

	.mini-header-placement-bar {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.4rem;
		margin-bottom: 0.55rem;
	}

	.mini-chip {
		display: inline-flex;
		align-items: center;
		gap: 0.28rem;
		background: #0f172a;
		border: 1px solid #475569;
		color: #cbd5e1;
		border-radius: 5px;
		padding: 0.22rem 0.5rem;
		font-size: 0.74rem;
		font-weight: 600;
		cursor: pointer;

		&.active {
			border-color: #38bdf8;
			background: rgba(56, 189, 248, 0.18);
			color: #ffffff;
		}
	}

	.block-mini-shell {
		display: flex;
		border: 1px solid #475569;
		border-radius: 6px;
		background: #0f172a;
		overflow: hidden;

		&.header-top {
			flex-direction: column;

			.block-mini-header-box {
				width: 100%;
				writing-mode: horizontal-tb;
				transform: none;
				border-right: none;
				border-bottom: 1px solid #475569;
				padding: 0.3rem 0.6rem;

				&.align-left {
					justify-content: flex-start;
				}
				&.align-center {
					justify-content: center;
				}
				&.align-right {
					justify-content: flex-end;
				}
			}
		}

		&.header-sidebar {
			flex-direction: row;

			.block-mini-header-box {
				width: 2rem;
				writing-mode: vertical-rl;
				transform: rotate(180deg);
				border-left: 1px solid #475569;
				justify-content: center;
				padding: 0.4rem 0.2rem;
			}
		}
	}

	.block-mini-header-box {
		display: flex;
		align-items: center;
		gap: 0.35rem;
		background: rgba(197, 8, 82, 0.22);
		color: #f8fafc;
		font-size: 0.74rem;
		font-weight: 800;
		text-transform: uppercase;
		letter-spacing: 0.06em;
	}

	.block-mini-grid {
		position: relative;
		flex: 1;
		min-height: 76px;
		background-image: linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
			linear-gradient(to bottom, rgba(255, 255, 255, 0.06) 1px, transparent 1px);
		background-size: 10% 38px;
	}

	.block-mini-part-box {
		position: absolute;
		box-sizing: border-box;
		background: rgba(30, 41, 59, 0.92);
		border: 1.5px solid #64748b;
		border-radius: 5px;
		padding: 0.25rem 0.45rem;
		display: flex;
		align-items: center;
		justify-content: space-between;
		cursor: move;
		user-select: none;

		&.selected,
		&:focus-visible {
			border-color: #38bdf8;
			box-shadow: 0 0 0 2px rgba(56, 189, 248, 0.35);
			outline: none;
			z-index: 2;
		}

		.block-mini-part-inner {
			display: inline-flex;
			align-items: center;
			gap: 0.35rem;
			overflow: hidden;
		}

		.block-mini-part-name {
			font-size: 0.76rem;
			font-weight: 700;
			color: #f8fafc;
		}

		.block-mini-part-coords {
			font-size: 0.68rem;
			color: #94a3b8;
		}

		.block-mini-part-remove {
			background: transparent;
			border: none;
			color: #cbd5e1;
			font-size: 0.9rem;
			cursor: pointer;
			padding: 0 0.2rem;

			&:hover {
				color: #f87171;
			}
		}

		.block-mini-edge-e {
			position: absolute;
			top: 0;
			right: -3px;
			width: 8px;
			height: 100%;
			cursor: ew-resize;
		}

		.block-mini-edge-s {
			position: absolute;
			left: 0;
			bottom: -3px;
			width: 100%;
			height: 7px;
			cursor: ns-resize;
		}

		.mini-tile-svg svg {
			width: 1rem;
			height: 1rem;

			.diecon-stroke {
				fill: #f8fafc;
			}
			.diecon-fill {
				fill: #0284c7;
			}
		}
	}

	.block-mini-readout {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.65rem;
		margin-top: 0.55rem;
		padding-top: 0.5rem;
		border-top: 1px solid rgba(255, 255, 255, 0.1);
		font-size: 0.76rem;

		.readout-field {
			display: inline-flex;
			align-items: center;
			gap: 0.3rem;

			input {
				width: 3.6rem;
				background: #0f172a;
				border: 1px solid #475569;
				border-radius: 4px;
				color: #f8fafc;
				padding: 0.2rem 0.35rem;
				font-size: 0.76rem;
			}
		}
	}

	.mini-traits-header {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
		margin-bottom: 0.55rem;

		.mini-inline-label {
			display: inline-flex;
			align-items: center;
			gap: 0.3rem;
			font-size: 0.74rem;
			color: #cbd5e1;
		}
	}

	.mini-btn-add {
		background: #0284c7;
		border: none;
		color: #ffffff;
		border-radius: 5px;
		padding: 0.28rem 0.65rem;
		font-size: 0.76rem;
		font-weight: 700;
		cursor: pointer;
	}

	.mini-traits-list {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.mini-trait-card {
		background: rgba(30, 41, 59, 0.75);
		border: 1px solid rgba(255, 255, 255, 0.12);
		border-radius: 6px;
		padding: 0.45rem 0.55rem;
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
	}

	.mini-trait-row-main {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.38rem;
	}

	.mini-trait-subrow {
		display: flex;
		flex-wrap: nowrap;
		align-items: center;
		gap: 0.38rem;
		width: 100%;
		box-sizing: border-box;

		.mini-subrow-noun {
			width: 6.2rem;
			flex: 0 0 auto;
			min-width: 0;
		}

		.mini-subrow-caption {
			font-size: 0.7rem;
			font-weight: 700;
			color: #94a3b8;
			text-transform: uppercase;
			flex: 0 0 auto;
		}

		.mini-die-picker {
			flex: 0 0 auto;
			display: inline-flex;
			align-items: center;
			gap: 0.15rem;
		}

		.mini-subrow-remove {
			flex: 0 0 auto;
			margin-left: auto;
		}
	}

	.mini-trait-name-input {
		flex: 1;
		min-width: 110px;
	}

	.mini-trait-noun-input {
		width: 5.5rem;
		font-size: 0.75rem;
	}

	.mini-die-picker,
	.mini-pip-picker {
		display: inline-flex;
		align-items: center;
		gap: 0.2rem;
	}

	.mini-die-chip {
		position: relative;
		width: 1.55rem;
		height: 1.55rem;
		padding: 0;
		background: transparent;
		border: 1px solid transparent;
		border-radius: 4px;
		cursor: pointer;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		user-select: none;
		transition: background-color 0.15s ease, border-color 0.15s ease;

		.c {
			display: inline-block;
			font-size: 1.25rem;
			line-height: 1;
			color: #64748b;
			transform: translateY(-0.15em);
			transition: color 0.15s ease;
		}

		&:hover {
			background: rgba(255, 255, 255, 0.08);
			.c {
				color: #f8fafc;
			}
		}

		&.active {
			background: color-mix(in srgb, var(--color-primary, #0284c7) 20%, transparent);
			border-color: var(--color-primary, #0284c7);

			.c {
				color: var(--color-primary, #0284c7);
			}
		}
	}

	.mini-marker-badge {
		cursor: pointer;
		user-select: none;
		transition: transform 0.1s ease, filter 0.15s ease;

		&:hover {
			filter: brightness(1.2);
			transform: scale(1.05);
		}
	}

	.mini-pip-btn {
		background: transparent;
		border: none;
		padding: 0.15rem;
		cursor: pointer;

		.pip-bubble {
			display: inline-block;
			width: 0.8rem;
			height: 0.8rem;
			border-radius: 50%;
			border: 2px solid #94a3b8;

			&.filled {
				background: #38bdf8;
				border-color: #38bdf8;
			}
		}
	}

	.mini-icon-btn {
		background: rgba(255, 255, 255, 0.08);
		border: 1px solid rgba(255, 255, 255, 0.16);
		color: #e2e8f0;
		border-radius: 4px;
		padding: 0.2rem 0.45rem;
		font-size: 0.72rem;
		cursor: pointer;

		&.mini-btn-danger:hover {
			background: rgba(239, 68, 68, 0.25);
			border-color: #f87171;
			color: #fca5a5;
		}
	}

	.mini-subrow-caption {
		font-size: 0.7rem;
		color: #94a3b8;
	}

	.mini-preview-toolbar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 0.5rem;
	}

	.mini-live-preview-canvas {
		background: #ffffff;
		color: #0f172a;
		border-radius: 6px;
		padding: 0.65rem;
		border: 1px solid #cbd5e1;
	}

	.mini-save-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.6rem;
		margin-bottom: 0.65rem;

		@media (max-width: 600px) {
			grid-template-columns: 1fr;
		}
	}

	.mini-derived-id {
		font-size: 0.7rem;
		color: #94a3b8;
	}

	.mini-pillar-chips {
		display: flex;
		flex-wrap: wrap;
		gap: 0.25rem;
		margin-top: 0.2rem;
	}

	.mini-collision-alert {
		background: rgba(239, 68, 68, 0.18);
		border: 1px solid #f87171;
		color: #fecaca;
		border-radius: 6px;
		padding: 0.45rem 0.65rem;
		font-size: 0.78rem;
		margin-bottom: 0.55rem;
	}

	.mini-save-success {
		background: rgba(16, 185, 129, 0.18);
		border: 1px solid #34d399;
		color: #a7f3d0;
		border-radius: 6px;
		padding: 0.45rem 0.65rem;
		font-size: 0.78rem;
		margin-bottom: 0.55rem;
	}

	.mini-save-actions {
		display: flex;
		justify-content: flex-end;
		gap: 0.55rem;

		.button-primary,
		.button-secondary {
			padding: 0.45rem 0.9rem;
			border-radius: 6px;
			font-size: 0.82rem;
			font-weight: 700;
			cursor: pointer;
		}

		.button-primary {
			background: #0284c7;
			border: 1px solid #38bdf8;
			color: #ffffff;

			&:disabled {
				opacity: 0.45;
				cursor: not-allowed;
			}
		}

		.button-secondary {
			background: transparent;
			border: 1px solid #64748b;
			color: #e2e8f0;
		}
	}
}



```
