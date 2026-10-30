<script setup lang="ts">
import { ref, computed } from 'vue';
import { useTraitSetEditor } from './use-trait-set-editor.ts';
import TraitSetEditorRing from './trait-set-editor-ring.vue';
import TraitSetEditorLayout from './trait-set-editor-layout.vue';
import TraitSetEditorDice from './trait-set-editor-dice.vue';
import TraitSetEditorImage from './trait-set-editor-image.vue';
import TraitSetEditorSfx from './trait-set-editor-sfx.vue';
import TraitSetEditorConfirm from './trait-set-editor-confirm.vue';
import VisibilityEye from './visibility-eye.vue';
import TraitSetMini from './trait-set-mini.vue';

const props = defineProps<{
	character: any;
	traitSetID: number;
	open?: boolean;
	viewY?: number | null;
}>();

const emit = defineEmits<{
	( e: 'selectElement', selector: any[] ): void;
	( e: 'updateCharacter', character: any ): void;
	( e: 'removeTraitSet', traitSetID: number ): void;
}>();

const api = useTraitSetEditor( props, emit );

const {
	rootEl, inputName, cssClass, checkScrollPosition,
	name, traitSetID, isRing, styleBody, styleOptions, branchArrows, headerMode, headerAlign,
	styleLabel, setStyleLabel, hasLabelContent, description, includeOut,
	notesContent, allowsTraitColumns, traitColumns, needsDiceUI,
	hasTrackPart, trackLabel,
	pipCount, pipsPerRow, pipsFilled, pipsConnected, pipLabels,
	noun, plural, reservedSlots,
	ratingPosition, labelPosition, isStatementSet, hasQuestionedPip, hasCounterColumn, counterLabel,
	restorableTraitNames, restoreTrait,
	setVisibility, cycleSetVisibility, setPillar, resolvedPillar, presetSaved,
	showBlockMini, openBlockMini, closeBlockMini, characterCustomPillars,
	selectElement, promptDeleteTraitSet, targetValue
} = api;

const STANDARD_PILLARS = [ 'prime', 'plus', 'play', 'identity' ];
const isCustomPillar = ref( false );

const selectedPillar = computed<string>( {
	get: () => {
		if ( isCustomPillar.value ) return '__custom__';
		const cur = ( setPillar.value || resolvedPillar.value || 'prime' ).toLowerCase().trim();
		if ( STANDARD_PILLARS.includes( cur ) || characterCustomPillars.value.includes( cur ) ) {
			return cur;
		}
		return '__custom__';
	},
	set: ( val: string ) => {
		if ( val === '__custom__' ) {
			isCustomPillar.value = true;
			if ( STANDARD_PILLARS.includes( setPillar.value.toLowerCase().trim() ) ) {
				setPillar.value = '';
			}
		} else {
			isCustomPillar.value = false;
			setPillar.value = val;
		}
	}
} );

function applyFromMini( updatedSet: any ) {
	if ( props.character && props.character.traitSets && props.character.traitSets[ props.traitSetID ] ) {
		props.character.traitSets[ props.traitSetID ] = updatedSet;
		emit( 'updateCharacter', props.character );
	}
	closeBlockMini();
}
</script>

<template>
	<aside :class="cssClass" @click.stop="" ref="rootEl">

		<div class="editor-arrow"></div>

		<div class="editor-controls">
			<button type="button" @click.stop="openBlockMini" title="Open in Trait Block Mini / Save as Preset"><i :class="presetSaved ? 'fas fa-check' : 'fas fa-bookmark'"></i></button>
			<button type="button" @click.stop="selectElement([])" title="Done"><i class="fas fa-times"></i></button>
			<button type="button" class="editor-delete" @click.stop="promptDeleteTraitSet" title="Delete trait set"><i class="fas fa-trash"></i></button>
		</div>

		<div class="editor-inner">
			<div @scroll="checkScrollPosition">

				<div class="editor-fields">

				<!-- CONTENT -->
				<details class="editor-group" open>
					<summary class="editor-group-title">Content</summary>

					<div class="editor-field">
						<div class="name-heading-row" style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.2rem;">
							<label :for="'trait-set-name-' + traitSetID" style="margin: 0;">Trait Set Name</label>
							<VisibilityEye :state="setVisibility" @toggle="cycleSetVisibility" />
						</div>
						<input type="text" :id="'trait-set-name-' + traitSetID" name="traitSetName" v-model="name" ref="inputName">
					</div>

					<div class="editor-field">
						<label :for="'trait-set-style-select-' + traitSetID">Style</label>
						<select :id="'trait-set-style-select-' + traitSetID" name="traitSetStyle" v-model="styleBody">
							<option v-for="option in styleOptions" :value="option.id" :selected="option.id === styleBody">{{ option.label }}</option>
						</select>
						<div class="editor-checkbox-row" v-if="styleBody === 'subtrait-columns'" style="display: flex; align-items: center; gap: 0.4rem; margin-top: 0.4rem;">
							<input type="checkbox" :id="'trait-set-' + traitSetID + '-branch-arrows'" name="branchArrows" v-model="branchArrows">
							<label :for="'trait-set-' + traitSetID + '-branch-arrows'" style="margin: 0; font-size: 0.8rem; cursor: pointer;">Connecting arrows</label>
						</div>
					</div>

					<!-- STYLE-CONDITIONAL SECTIONS (each exists only for the styles that summon it) -->
					<TraitSetEditorRing />

				<!-- OUT MARKER (generic stepped-track indicator, default off) -->
				<div class="editor-field" v-if="styleBody === 'die-track' || styleBody === 'default'">
					<div class="editor-label">Out Marker</div>
					<div class="editor-toggles">
						<div><input type="checkbox" :id="'trait-set-' + traitSetID + '-stress-out'" name="stressOut" :true-value="true" :false-value="false" v-model="includeOut"></div>
						<div><label :for="'trait-set-' + traitSetID + '-stress-out'">Out marker</label></div>
					</div>
					<div v-if="includeOut" style="display: flex; gap: 0.5rem; margin-top: 0.4rem;">
						<div style="flex: 1;">
							<label :for="'trait-set-' + traitSetID + '-out-word'" style="font-size: 0.7rem; color: #64748b; display: block; margin-bottom: 0.2rem;">Out Word</label>
							<input type="text" :id="'trait-set-' + traitSetID + '-out-word'" name="outWord" :value="styleLabel('out')" @change="setStyleLabel('out', targetValue($event))" :placeholder="styleLabel('out')">
						</div>
					</div>
				</div>

					<TraitSetEditorDice />

					<TraitSetEditorImage />

					<!-- NOTES CONTENT -->
					<div class="editor-field" v-if="styleBody === 'notes'">
						<label :for="'trait-set-notes-' + traitSetID">Notes Content</label>
						<textarea :id="'trait-set-notes-' + traitSetID" name="notesContent" v-model="notesContent" placeholder="Enter notes or text here..." rows="6"></textarea>
					</div>

					<!-- PIPS TRACK SETTINGS -->
					<div class="editor-field" v-if="styleBody === 'pips'">
						<div class="editor-label">Pip Track Settings</div>
						<div style="display: flex; gap: 0.5rem; margin-bottom: 0.5rem;">
							<div style="flex: 1;">
								<label :for="'trait-set-' + traitSetID + '-pip-count'" style="font-size: 0.7rem; color: #64748b; display: block; margin-bottom: 0.2rem;">Total Pips</label>
								<input type="number" :id="'trait-set-' + traitSetID + '-pip-count'" name="pipCount" min="1" max="100" v-model.number="pipCount" inputmode="numeric">
							</div>
							<div style="flex: 1;">
								<label :for="'trait-set-' + traitSetID + '-pip-per-row'" style="font-size: 0.7rem; color: #64748b; display: block; margin-bottom: 0.2rem;">Pips Per Row</label>
								<div class="num-stepper">
									<button type="button" class="btn-step" @click.stop="pipsPerRow = Math.max(1, pipsPerRow - 1)" :disabled="pipsPerRow <= 1" title="Fewer pips per row" aria-label="Fewer pips per row">-</button>
									<input type="number" :id="'trait-set-' + traitSetID + '-pip-per-row'" name="pipsPerRow" min="1" max="20" v-model.number="pipsPerRow" inputmode="numeric" aria-label="Pips per row">
									<button type="button" class="btn-step" @click.stop="pipsPerRow = Math.min(20, pipsPerRow + 1)" title="More pips per row" aria-label="More pips per row">+</button>
								</div>
							</div>
						</div>
						<div style="margin-bottom: 0.5rem;">
							<label :for="'trait-set-' + traitSetID + '-pip-filled'" style="font-size: 0.7rem; color: #64748b; display: block; margin-bottom: 0.2rem;">Filled Pips</label>
							<div class="num-stepper">
								<button type="button" class="btn-step" @click.stop="pipsFilled = Math.max(0, pipsFilled - 1)" :disabled="pipsFilled <= 0" title="Unfill a pip" aria-label="Unfill a pip">-</button>
								<input type="number" :id="'trait-set-' + traitSetID + '-pip-filled'" name="pipsFilled" min="0" :max="pipCount" v-model.number="pipsFilled" inputmode="numeric" aria-label="Filled pips">
								<button type="button" class="btn-step" @click.stop="pipsFilled = Math.min(pipCount, pipsFilled + 1)" title="Fill a pip" aria-label="Fill a pip">+</button>
							</div>
						</div>
						<div class="editor-checkbox-row" style="display: flex; align-items: center; gap: 0.4rem;">
							<input type="checkbox" :id="'trait-set-' + traitSetID + '-pips-connected'" name="pipsConnected" v-model="pipsConnected">
							<label :for="'trait-set-' + traitSetID + '-pips-connected'" style="margin: 0; font-size: 0.8rem; cursor: pointer;">Connect pips</label>
						</div>
						<div class="editor-checkbox-row" style="display: flex; align-items: center; gap: 0.4rem; margin-top: 0.35rem;">
							<input type="checkbox" :id="'trait-set-' + traitSetID + '-pip-labels'" name="pipLabels" v-model="pipLabels">
							<label :for="'trait-set-' + traitSetID + '-pip-labels'" style="margin: 0; font-size: 0.8rem; cursor: pointer;" title="Name a pip per row: rows render as bubble-plus-label entries">Labels</label>
						</div>
					</div>

					<div class="editor-field">
						<label :for="'trait-set-desc-' + traitSetID">Description</label>
						<textarea :id="'trait-set-desc-' + traitSetID" name="traitSetDescription" v-model="description"></textarea>
					</div>

					<div class="editor-field" v-if="styleBody !== 'notes' && styleBody !== 'image' && styleBody !== 'pips'">
						<label :for="'trait-set-reserved-slots-' + traitSetID"><i class="fas fa-pencil-alt"></i> Reserved Slots for Print</label>
						<div class="num-stepper">
							<button type="button" class="btn-step" @click.stop="reservedSlots = Math.max(0, (reservedSlots === '' || reservedSlots === null ? 1 : reservedSlots) - 1)" :disabled="reservedSlots === '' || reservedSlots === null || reservedSlots <= 0" title="Fewer reserved slots" aria-label="Fewer reserved slots">-</button>
							<input type="number" :id="'trait-set-reserved-slots-' + traitSetID" name="reservedSlots" min="0" max="25" v-model.number="reservedSlots" placeholder="Auto" inputmode="numeric" aria-label="Reserved slots for print">
							<button type="button" class="btn-step" @click.stop="reservedSlots = (reservedSlots === '' || reservedSlots === null ? 0 : reservedSlots) + 1" title="More reserved slots" aria-label="More reserved slots">+</button>
						</div>
					</div>


					<!-- STATEMENT MODE -->
					<div class="editor-field" v-if="styleBody !== 'notes' && styleBody !== 'image' && styleBody !== 'pips' && styleBody !== 'three-column-table' && styleBody !== 'paired-slots'">
						<div class="editor-checkbox-row" style="display: flex; align-items: center; gap: 0.4rem; margin-bottom: 0.35rem;">
							<input type="checkbox" :id="'trait-set-' + traitSetID + '-statement-mode'" name="statementMode" v-model="isStatementSet">
							<label :for="'trait-set-' + traitSetID + '-statement-mode'" style="margin: 0; font-size: 0.8rem; cursor: pointer;">Statement field</label>
						</div>
						<div class="editor-checkbox-row" v-if="isStatementSet" style="display: flex; align-items: center; gap: 0.4rem; margin-left: 1.25rem;">
							<input type="checkbox" :id="'trait-set-' + traitSetID + '-questioned-pip'" name="questionedPip" v-model="hasQuestionedPip">
							<label :for="'trait-set-' + traitSetID + '-questioned-pip'" style="margin: 0; font-size: 0.75rem; cursor: pointer;">Questioned</label>
						</div>
					</div>

					<!-- COUNTER COLUMN (e.g. BADGES XP) -->
					<div class="editor-field" v-if="styleBody === 'die-rows' || styleBody === 'default' || styleBody === 'list'">
						<div class="editor-label">Counter</div>
						<div class="editor-checkbox-row" style="display: flex; align-items: center; gap: 0.4rem; margin-bottom: 0.35rem;">
							<input type="checkbox" :id="'trait-set-' + traitSetID + '-counter-col'" name="counterCol" v-model="hasCounterColumn">
							<label :for="'trait-set-' + traitSetID + '-counter-col'" style="margin: 0; font-size: 0.8rem; cursor: pointer;">Counter column</label>
						</div>
						<div v-if="hasCounterColumn" style="display: flex; align-items: center; gap: 0.5rem; margin-top: 0.35rem;">
							<label :for="'trait-set-' + traitSetID + '-counter-label'" style="font-size: 0.75rem; color: #64748b; margin: 0;">Header Label:</label>
							<input type="text" :id="'trait-set-' + traitSetID + '-counter-label'" name="counterLabel" v-model="counterLabel" placeholder="XP" style="width: 5rem;">
						</div>
					</div>

					<TraitSetEditorSfx />

					<!-- RESTORE TEMPLATE TRAITS (D19) -->
					<div class="editor-field" v-if="restorableTraitNames.length">
						<div class="editor-label">Restore Removed Traits</div>
						<div class="editor-button-group" style="flex-wrap: wrap;">
							<button
								v-for="tname in restorableTraitNames"
								:key="'restore-' + tname"
								type="button"
								class="editor-group-btn"
								@click.stop="restoreTrait(tname)"
								:title="'Restore ‘' + tname + '’ from the template'"
							>
								<i class="fas fa-undo"></i> {{ tname }}
							</button>
						</div>
						<div class="editor-hint">Template traits not on this sheet — restoring clears the removal.</div>
					</div>

				</details>

				<!-- LABELS -->
				<details class="editor-group" open v-if="hasLabelContent">
					<summary class="editor-group-title">Labels</summary>

					<div class="editor-field" v-if="styleBody === 'subtrait-columns'">
						<div class="editor-label">Branch Headings</div>
						<div style="display: flex; gap: 0.5rem; margin-top: 0.4rem;">
							<div style="flex: 1;">
								<label :for="'trait-set-' + traitSetID + '-sub-left'" style="font-size: 0.7rem; color: #94a3b8; display: block; margin-bottom: 0.2rem;">Left Heading</label>
								<input type="text" :id="'trait-set-' + traitSetID + '-sub-left'" name="subHeadingLeft" :value="styleLabel('left')" @change="setStyleLabel('left', targetValue($event))" :placeholder="styleLabel('left')">
							</div>
							<div style="flex: 1;">
								<label :for="'trait-set-' + traitSetID + '-sub-right'" style="font-size: 0.7rem; color: #94a3b8; display: block; margin-bottom: 0.2rem;">Right Heading</label>
								<input type="text" :id="'trait-set-' + traitSetID + '-sub-right'" name="subHeadingRight" :value="styleLabel('right')" @change="setStyleLabel('right', targetValue($event))" :placeholder="styleLabel('right')">
							</div>
							<div style="flex: 1;">
								<label :for="'trait-set-' + traitSetID + '-sub-center'" style="font-size: 0.7rem; color: #94a3b8; display: block; margin-bottom: 0.2rem;">Center Heading</label>
								<input type="text" :id="'trait-set-' + traitSetID + '-sub-center'" name="subHeadingCenter" :value="styleLabel('center')" @change="setStyleLabel('center', targetValue($event))" :placeholder="styleLabel('center')">
							</div>
						</div>
					</div>
					<div class="editor-field" v-if="styleBody === 'three-column-table'">
						<div class="editor-label">Table Headings</div>
						<div style="display: flex; gap: 0.5rem; margin-top: 0.4rem;">
							<div style="flex: 1;">
								<label :for="'trait-set-' + traitSetID + '-col1'" style="font-size: 0.7rem; color: #94a3b8; display: block; margin-bottom: 0.2rem;">Column 1</label>
								<input type="text" :id="'trait-set-' + traitSetID + '-col1'" name="tableCol1" :value="styleLabel('col1')" @change="setStyleLabel('col1', targetValue($event))" :placeholder="styleLabel('col1')">
							</div>
							<div style="flex: 1;">
								<label :for="'trait-set-' + traitSetID + '-col2'" style="font-size: 0.7rem; color: #94a3b8; display: block; margin-bottom: 0.2rem;">Column 2</label>
								<input type="text" :id="'trait-set-' + traitSetID + '-col2'" name="tableCol2" :value="styleLabel('col2')" @change="setStyleLabel('col2', targetValue($event))" :placeholder="styleLabel('col2')">
							</div>
							<div style="flex: 1;">
								<label :for="'trait-set-' + traitSetID + '-col3'" style="font-size: 0.7rem; color: #94a3b8; display: block; margin-bottom: 0.2rem;">Column 3</label>
								<input type="text" :id="'trait-set-' + traitSetID + '-col3'" name="tableCol3" :value="styleLabel('col3')" @change="setStyleLabel('col3', targetValue($event))" :placeholder="styleLabel('col3')">
							</div>
						</div>
					</div>
					<div class="editor-field" v-if="styleBody === 'dice-count'">
						<div class="editor-label">Count Headings</div>
						<div style="display: flex; gap: 0.5rem; margin-top: 0.4rem;">
							<div style="flex: 1;">
								<label :for="'trait-set-' + traitSetID + '-rating-label'" style="font-size: 0.7rem; color: #94a3b8; display: block; margin-bottom: 0.2rem;">Rating Label</label>
								<input type="text" :id="'trait-set-' + traitSetID + '-rating-label'" name="diceCountRatingLabel" :value="styleLabel('rating')" @change="setStyleLabel('rating', targetValue($event))" :placeholder="styleLabel('rating')">
							</div>
							<div style="flex: 1;">
								<label :for="'trait-set-' + traitSetID + '-dice-label'" style="font-size: 0.7rem; color: #94a3b8; display: block; margin-bottom: 0.2rem;">Count Label</label>
								<input type="text" :id="'trait-set-' + traitSetID + '-dice-label'" name="diceCountDiceLabel" :value="styleLabel('dice')" @change="setStyleLabel('dice', targetValue($event))" :placeholder="styleLabel('dice')">
							</div>
						</div>
					</div>

					<div class="editor-field" v-if="styleBody !== 'notes' && styleBody !== 'image' && styleBody !== 'pips'">
						<div class="editor-label">Nouns</div>
						<div style="display: flex; gap: 0.5rem;">
							<div style="flex: 1;">
								<label :for="'trait-set-noun-singular-' + traitSetID" style="font-size: 0.7rem; color: #94a3b8; display: block; margin-bottom: 0.2rem;">Singular</label>
								<input type="text" :id="'trait-set-noun-singular-' + traitSetID" name="noun" v-model="noun" placeholder="Trait">
							</div>
							<div style="flex: 1;">
								<label :for="'trait-set-noun-plural-' + traitSetID" style="font-size: 0.7rem; color: #94a3b8; display: block; margin-bottom: 0.2rem;">Plural</label>
								<input type="text" :id="'trait-set-noun-plural-' + traitSetID" name="plural" v-model="plural" placeholder="Traits">
							</div>
						</div>
					</div>

					<div class="editor-field" v-if="hasTrackPart">
						<label :for="'trait-set-' + traitSetID + '-track-label-words'">Track Label</label>
						<input type="text" :id="'trait-set-' + traitSetID + '-track-label-words'" name="trackLabelWords" v-model="trackLabel" placeholder="Stress">
					</div>


				</details>

				<!-- LAYOUT -->
				<details class="editor-group" open>
					<summary class="editor-group-title">Layout</summary>

					<!-- SET HEADER PLACEMENT + ALIGNMENT -->
					<div class="editor-field">
						<div class="editor-label">Set Header</div>
						<div class="editor-button-group">
							<button type="button" class="editor-group-btn" :class="{ active: headerMode === 'sidebar' }" @click.stop="headerMode = 'sidebar'" title="Sidebar header"><i class="fas fa-grip-lines-vertical"></i> Sidebar</button>
							<button type="button" class="editor-group-btn" :class="{ active: headerMode === 'top' }" @click.stop="headerMode = 'top'" title="Top bar header"><i class="fas fa-grip-lines"></i> Top Bar</button>
						</div>
						<div class="editor-button-group" style="margin-top: 0.35rem;">
							<button type="button" class="editor-group-btn" :class="{ active: headerAlign === 'left' }" @click.stop="headerAlign = 'left'" title="Align left"><i class="fas fa-align-left"></i> Left</button>
							<button type="button" class="editor-group-btn" :class="{ active: headerAlign === 'center' }" @click.stop="headerAlign = 'center'" title="Align center"><i class="fas fa-align-center"></i> Center</button>
							<button type="button" class="editor-group-btn" :class="{ active: headerAlign === 'right' }" @click.stop="headerAlign = 'right'" title="Align right"><i class="fas fa-align-right"></i> Right</button>
						</div>
					</div>

					<TraitSetEditorLayout />

					<!-- PILLAR (DROPDOWN + EXPLICIT CUSTOM TEXT ENTRY) -->
					<div class="editor-field">
						<label :for="'trait-set-' + traitSetID + '-pillar-select'">Pillar</label>
						<div style="display: flex; gap: 0.4rem; align-items: center;">
							<select
								:id="'trait-set-' + traitSetID + '-pillar-select'"
								v-model="selectedPillar"
								class="editor-select"
								style="flex: 1;"
								aria-label="Pillar"
							>
								<option value="prime">Prime</option>
								<option value="plus">Plus</option>
								<option value="play">Play</option>
								<option value="identity">Identity</option>
								<option v-for="cp in characterCustomPillars" :key="cp" :value="cp">{{ cp.charAt(0).toUpperCase() + cp.slice(1) }}</option>
								<option value="__custom__">Custom...</option>
							</select>
							<input
								v-if="selectedPillar === '__custom__' || isCustomPillar"
								type="text"
								:id="'trait-set-' + traitSetID + '-pillar-custom'"
								name="setPillarCustom"
								v-model="setPillar"
								placeholder="Custom pillar name..."
								style="flex: 1;"
								aria-label="Custom pillar name"
							>
						</div>
					</div>

					<!-- COLUMNS WITHIN SET -->
					<div class="editor-field" v-if="allowsTraitColumns && styleBody !== 'notes' && styleBody !== 'image' && styleBody !== 'pips'">
						<label :for="'trait-set-' + traitSetID + '-columns'">Columns Within Set</label>
						<select :id="'trait-set-' + traitSetID + '-columns'" name="traitColumns" v-model.number="traitColumns">
							<option :value="1">1 Column</option>
							<option :value="2">2 Columns</option>
							<option :value="3">3 Columns</option>
						</select>
					</div>

					<!-- RATING POSITION -->
					<div class="editor-field" v-if="needsDiceUI && styleBody !== 'notes' && styleBody !== 'image' && styleBody !== 'pips'">
						<label :for="'trait-set-' + traitSetID + '-rating-position'">Rating Position</label>
						<select :id="'trait-set-' + traitSetID + '-rating-position'" name="ratingPosition" v-model="ratingPosition">
							<option value="inline">Inline</option>
							<option value="above">Above</option>
							<option value="below">Below</option>
							<option value="none">None</option>
							<option value="vertical">Vertical</option>
						</select>
					</div>

					<!-- LABEL POSITION (ladder rung names, horizontal or rotated vertical) -->
					<div class="editor-field" v-if="styleBody === 'dice-ladder'">
						<div class="editor-label">Label Position</div>
						<div class="editor-button-group">
							<button type="button" class="editor-group-btn" :class="{ active: labelPosition === 'horizontal' }" @click.stop="labelPosition = 'horizontal'">Horizontal</button>
							<button type="button" class="editor-group-btn" :class="{ active: labelPosition === 'vertical' }" @click.stop="labelPosition = 'vertical'">Vertical</button>
						</div>
					</div>

				</details>

				</div>

			</div>
		</div>

		<TraitSetEditorConfirm />

		<teleport to="body">
			<TraitSetMini
				v-if="showBlockMini"
				:initialSet="props.character?.traitSets?.[traitSetID]"
				@close="closeBlockMini"
				@applyToSet="applyFromMini"
				@saved="presetSaved = true"
			/>
		</teleport>

	</aside>
</template>
