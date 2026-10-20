<script setup lang="ts">
import { useTraitSetEditor } from './use-trait-set-editor.ts';
import TraitSetEditorRing from './trait-set-editor-ring.vue';
import TraitSetEditorLayout from './trait-set-editor-layout.vue';
import TraitSetEditorDice from './trait-set-editor-dice.vue';
import TraitSetEditorImage from './trait-set-editor-image.vue';
import TraitSetEditorSfx from './trait-set-editor-sfx.vue';
import TraitSetEditorConfirm from './trait-set-editor-confirm.vue';

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
	name, traitSetID, isRing, headerRight, styleBody, styleOptions, branchArrows, headerMode, headerAlign,
	styleLabel, setStyleLabel, description, includeOut,
	notesContent, sharedHinder, sharedHinderText, allowsTraitColumns, traitColumns, needsDiceUI,
	hasAttachedStress, attachedStressLabel,
	pipCount, pipsPerRow, pipsFilled, pipsConnected,
	sessionRecordCount, sessionRecordOrientation, clearAllSessionBubbles, fillAllSessionBubbles,
	nounSingular, nounPlural, reservedSlots, featureDescription, featureSubtraits, featureSFX,
	ratingPosition, labelPosition, isStatementSet, hasQuestionedPip, hasCounterColumn, counterLabel,
	restorableTraitNames, restoreTrait,
	selectElement, duplicateTraitSet, promptDeleteTraitSet, targetValue
} = api;
</script>

<template>
	<aside :class="cssClass" @click.stop="" ref="rootEl">

		<div class="editor-arrow"></div>

		<div class="editor-controls">
			<button type="button" @click.stop="selectElement([])"><i class="fas fa-times"></i></button>
			<button type="button" class="editor-copy" @click.stop="duplicateTraitSet" title="Duplicate trait set"><i class="fas fa-copy"></i></button>
			<button type="button" class="editor-delete" @click.stop="promptDeleteTraitSet" title="Delete trait set"><i class="fas fa-trash"></i></button>
		</div>

		<div class="editor-inner">
			<div @scroll="checkScrollPosition">

				<div class="editor-fields">

					<div class="editor-field">
						<label :for="'trait-set-name-' + traitSetID">Trait Set Name</label>
						<input type="text" :id="'trait-set-name-' + traitSetID" name="traitSetName" v-model="name" ref="inputName">
					</div>

					<div class="editor-field" v-if="!isRing">
						<label :for="'trait-set-header-right-' + traitSetID">Right header</label>
						<input type="text" :id="'trait-set-header-right-' + traitSetID" name="headerRight" v-model="headerRight" placeholder="Character File">
					</div>

					<div class="editor-field">
						<label :for="'trait-set-style-select-' + traitSetID">Style</label>
						<select :id="'trait-set-style-select-' + traitSetID" name="traitSetStyle" v-model="styleBody">
							<option v-for="option in styleOptions" :value="option.id" :selected="option.id === styleBody">{{ option.label }}</option>
						</select>
						<div class="editor-checkbox-row" v-if="styleBody === 'subtrait-columns'" style="display: flex; align-items: center; gap: 0.4rem; margin-top: 0.4rem;">
							<input type="checkbox" :id="'trait-set-' + traitSetID + '-branch-arrows'" name="branchArrows" v-model="branchArrows">
							<label :for="'trait-set-' + traitSetID + '-branch-arrows'" style="margin: 0; font-size: 0.8rem; cursor: pointer;">Show connecting arrows</label>
						</div>
						<div v-if="styleBody === 'subtrait-columns'" style="display: flex; gap: 0.5rem; margin-top: 0.4rem;">
							<div style="flex: 1;">
								<label :for="'trait-set-' + traitSetID + '-sub-left'" style="font-size: 0.7rem; color: #94a3b8; display: block; margin-bottom: 0.2rem;">Left Heading</label>
								<input type="text" :id="'trait-set-' + traitSetID + '-sub-left'" name="subHeadingLeft" :value="styleLabel('left')" @change="setStyleLabel('left', targetValue($event))" :placeholder="styleLabel('left')">
							</div>
							<div style="flex: 1;">
								<label :for="'trait-set-' + traitSetID + '-sub-right'" style="font-size: 0.7rem; color: #94a3b8; display: block; margin-bottom: 0.2rem;">Right Heading</label>
								<input type="text" :id="'trait-set-' + traitSetID + '-sub-right'" name="subHeadingRight" :value="styleLabel('right')" @change="setStyleLabel('right', targetValue($event))" :placeholder="styleLabel('right')">
							</div>
							<div style="flex: 1;" v-if="styleBody === 'subtrait-columns'">
								<label :for="'trait-set-' + traitSetID + '-sub-center'" style="font-size: 0.7rem; color: #94a3b8; display: block; margin-bottom: 0.2rem;">Center Heading</label>
								<input type="text" :id="'trait-set-' + traitSetID + '-sub-center'" name="subHeadingCenter" :value="styleLabel('center')" @change="setStyleLabel('center', targetValue($event))" :placeholder="styleLabel('center')">
							</div>
						</div>
						<div v-if="styleBody === 'three-column-table'" style="display: flex; gap: 0.5rem; margin-top: 0.4rem;">
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
						<div v-if="styleBody === 'dice-count'" style="display: flex; gap: 0.5rem; margin-top: 0.4rem;">
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

					<!-- SET HEADER PLACEMENT + ALIGNMENT -->
					<div class="editor-field">
						<div class="editor-label">Set Header</div>
						<div class="editor-button-group">
							<button type="button" class="editor-group-btn" :class="{ active: headerMode === 'sidebar' }" @click.stop="headerMode = 'sidebar'">Sidebar</button>
							<button type="button" class="editor-group-btn" :class="{ active: headerMode === 'top' }" @click.stop="headerMode = 'top'">Top Bar</button>
						</div>
						<div class="editor-button-group" style="margin-top: 0.35rem;">
							<button type="button" class="editor-group-btn" :class="{ active: headerAlign === 'left' }" @click.stop="headerAlign = 'left'">Left</button>
							<button type="button" class="editor-group-btn" :class="{ active: headerAlign === 'center' }" @click.stop="headerAlign = 'center'">Center</button>
							<button type="button" class="editor-group-btn" :class="{ active: headerAlign === 'right' }" @click.stop="headerAlign = 'right'">Right</button>
						</div>
					</div>

					<TraitSetEditorRing />

					<TraitSetEditorLayout />

					<div class="editor-field">
						<label :for="'trait-set-desc-' + traitSetID">Description</label>
						<textarea :id="'trait-set-desc-' + traitSetID" name="traitSetDescription" v-model="description"></textarea>
					</div>

					<!-- OUT MARKER (generic stepped-track indicator, default off) -->
					<div class="editor-field" v-if="styleBody === 'stress' || styleBody === 'default'">
						<div class="editor-label">Out Marker</div>
						<div class="editor-toggles">
							<div><input type="checkbox" :id="'trait-set-' + traitSetID + '-stress-out'" name="stressOut" :true-value="true" :false-value="false" v-model="includeOut"></div>
							<div><label :for="'trait-set-' + traitSetID + '-stress-out'">Include 💥 Out Marker</label></div>
						</div>
					</div>

					<TraitSetEditorDice />

					<TraitSetEditorImage />

					<!-- NOTES CONTENT -->
					<div class="editor-field" v-if="styleBody === 'notes'">
						<label :for="'trait-set-notes-' + traitSetID">Notes Content</label>
						<textarea :id="'trait-set-notes-' + traitSetID" name="notesContent" v-model="notesContent" placeholder="Enter notes or text here..." rows="6"></textarea>
					</div>

					<!-- DISTINCTIONS COMPACT SFX & SHARED HINDER -->
					<div class="editor-field" v-if="styleBody === 'distinctions'">
						<div class="editor-label">Distinctions Layout</div>
						<div class="editor-checkbox-row" style="display: flex; align-items: center; gap: 0.4rem; margin-bottom: 0.4rem;">
							<input type="checkbox" :id="'trait-set-' + traitSetID + '-shared-hinder'" name="sharedHinder" v-model="sharedHinder">
							<label :for="'trait-set-' + traitSetID + '-shared-hinder'" style="margin: 0; font-size: 0.8rem; cursor: pointer;">Shared hinder</label>
						</div>
						<div v-if="sharedHinder" style="margin-top: 0.35rem;">
							<label :for="'trait-set-' + traitSetID + '-hinder-text'" style="font-size: 0.7rem; color: #64748b; display: block; margin-bottom: 0.2rem;">Hinder text</label>
							<textarea :id="'trait-set-' + traitSetID + '-hinder-text'" name="sharedHinderText" v-model="sharedHinderText" placeholder="Gain a PP when you trade out your distinction's [d8] rating for a [d4]." rows="2"></textarea>
						</div>
					</div>

					<!-- COLUMNS WITHIN SET -->
					<div class="editor-field" v-if="allowsTraitColumns && styleBody !== 'notes' && styleBody !== 'image' && styleBody !== 'pips' && styleBody !== 'session-record' && styleBody !== 'angled-lines'">
						<label :for="'trait-set-' + traitSetID + '-columns'">Columns Within Set</label>
						<select :id="'trait-set-' + traitSetID + '-columns'" name="traitColumns" v-model.number="traitColumns">
							<option :value="1">1 Column</option>
							<option :value="2">2 Columns</option>
							<option :value="3">3 Columns</option>
						</select>
					</div>

					<!-- ATTACHED STRESS / TRACK -->
					<div class="editor-field" v-if="allowsTraitColumns && styleBody !== 'notes' && styleBody !== 'image' && styleBody !== 'pips' && styleBody !== 'stress' && styleBody !== 'session-record' && styleBody !== 'angled-lines'">
						<div class="editor-label">Attached Stress / Track</div>
						<div class="editor-checkbox-row" style="display: flex; align-items: center; gap: 0.4rem; margin-bottom: 0.4rem;">
							<input type="checkbox" :id="'trait-set-' + traitSetID + '-attached-stress'" name="hasAttachedStress" v-model="hasAttachedStress">
							<label :for="'trait-set-' + traitSetID + '-attached-stress'" style="margin: 0; font-size: 0.8rem; cursor: pointer;">Enable Attached Stress to Traits</label>
						</div>
						<div v-if="hasAttachedStress" style="margin-top: 0.4rem; background: #0f172a; padding: 0.5rem; border-radius: 4px; border: 1px solid #334155;">
							<div>
								<label :for="'trait-set-' + traitSetID + '-stress-label'" style="font-size: 0.7rem; color: #94a3b8; display: block; margin-bottom: 0.2rem;">Track Label</label>
								<input type="text" :id="'trait-set-' + traitSetID + '-stress-label'" name="attachedStressLabel" v-model="attachedStressLabel" placeholder="Stress">
							</div>
						</div>
					</div>

					<!-- PIPS TRACK SETTINGS -->
					<div class="editor-field" v-if="styleBody === 'pips'">
						<div class="editor-label">Pip Track Settings</div>
						<div style="display: flex; gap: 0.5rem; margin-bottom: 0.5rem;">
							<div style="flex: 1;">
								<label :for="'trait-set-' + traitSetID + '-pip-count'" style="font-size: 0.7rem; color: #64748b; display: block; margin-bottom: 0.2rem;">Total Pips</label>
								<input type="number" :id="'trait-set-' + traitSetID + '-pip-count'" name="pipCount" min="1" max="100" v-model.number="pipCount">
							</div>
							<div style="flex: 1;">
								<label :for="'trait-set-' + traitSetID + '-pip-per-row'" style="font-size: 0.7rem; color: #64748b; display: block; margin-bottom: 0.2rem;">Pips Per Row</label>
								<input type="number" :id="'trait-set-' + traitSetID + '-pip-per-row'" name="pipsPerRow" min="1" max="20" v-model.number="pipsPerRow">
							</div>
						</div>
						<div style="margin-bottom: 0.5rem;">
							<label :for="'trait-set-' + traitSetID + '-pip-filled'" style="font-size: 0.7rem; color: #64748b; display: block; margin-bottom: 0.2rem;">Filled Pips</label>
							<input type="number" :id="'trait-set-' + traitSetID + '-pip-filled'" name="pipsFilled" min="0" :max="pipCount" v-model.number="pipsFilled">
						</div>
						<div class="editor-checkbox-row" style="display: flex; align-items: center; gap: 0.4rem;">
							<input type="checkbox" :id="'trait-set-' + traitSetID + '-pips-connected'" name="pipsConnected" v-model="pipsConnected">
							<label :for="'trait-set-' + traitSetID + '-pips-connected'" style="margin: 0; font-size: 0.8rem; cursor: pointer;">Connect Pips with Horizontal Line</label>
						</div>
					</div>

					<!-- SESSION RECORD (ANGLED LINES / LEAF) SETTINGS -->
					<div class="editor-field" v-if="styleBody === 'session-record' || styleBody === 'angled-lines'">
						<div class="editor-label">Session Record Settings</div>
						<div style="margin-bottom: 0.5rem;">
							<label :for="'trait-set-' + traitSetID + '-session-count'" style="font-size: 0.7rem; color: #64748b; display: block; margin-bottom: 0.2rem;">Milestones</label>
							<input type="number" :id="'trait-set-' + traitSetID + '-session-count'" name="sessionRecordCount" min="1" max="40" v-model.number="sessionRecordCount">
						</div>
						<div class="rating-scale-presets" style="margin-bottom: 0.5rem;">
							<span class="preset-label">Presets:</span>
							<button type="button" class="btn-scale-preset" :class="{ active: sessionRecordCount === 10 }" @click.stop="sessionRecordCount = 10">10</button>
							<button type="button" class="btn-scale-preset" :class="{ active: sessionRecordCount === 15 }" @click.stop="sessionRecordCount = 15">15</button>
							<button type="button" class="btn-scale-preset" :class="{ active: sessionRecordCount === 20 }" @click.stop="sessionRecordCount = 20">20</button>
						</div>
						<div style="margin-bottom: 0.5rem;">
							<div class="editor-label" style="font-size: 0.7rem; color: #64748b; display: block; margin-bottom: 0.2rem;">Orientation</div>
							<div class="editor-button-group">
								<button type="button" class="editor-group-btn" :class="{ active: sessionRecordOrientation !== 'horizontal' }" @click.stop="sessionRecordOrientation = 'vertical'">
									Vertical
								</button>
								<button type="button" class="editor-group-btn" :class="{ active: sessionRecordOrientation === 'horizontal' }" @click.stop="sessionRecordOrientation = 'horizontal'">
									Horizontal
								</button>
							</div>
						</div>
						<div style="display: flex; gap: 0.5rem;">
							<button type="button" class="btn-scale-preset" style="flex: 1; padding: 0.35rem 0.5rem;" @click.stop="clearAllSessionBubbles">
								<i class="fas fa-undo"></i> Clear All Bubbles
							</button>
							<button type="button" class="btn-scale-preset" style="flex: 1; padding: 0.35rem 0.5rem;" @click.stop="fillAllSessionBubbles">
								<i class="fas fa-check"></i> Fill All
							</button>
						</div>
					</div>

					<div class="editor-field" v-if="styleBody !== 'notes' && styleBody !== 'image' && styleBody !== 'pips' && styleBody !== 'session-record' && styleBody !== 'angled-lines'">
						<label :for="'trait-set-noun-singular-' + traitSetID">Singular Noun</label>
						<input type="text" :id="'trait-set-noun-singular-' + traitSetID" name="nounSingular" v-model="nounSingular" placeholder="Trait">
					</div>

					<div class="editor-field" v-if="styleBody !== 'notes' && styleBody !== 'image' && styleBody !== 'pips' && styleBody !== 'session-record' && styleBody !== 'angled-lines'">
						<label :for="'trait-set-noun-plural-' + traitSetID">Plural Noun</label>
						<input type="text" :id="'trait-set-noun-plural-' + traitSetID" name="nounPlural" v-model="nounPlural" placeholder="Traits">
					</div>

					<div class="editor-field" v-if="styleBody !== 'notes' && styleBody !== 'image' && styleBody !== 'pips' && styleBody !== 'session-record' && styleBody !== 'angled-lines'">
						<label :for="'trait-set-reserved-slots-' + traitSetID"><i class="fas fa-pencil-alt"></i> Reserved Slots for Print</label>
						<input type="number" :id="'trait-set-reserved-slots-' + traitSetID" name="reservedSlots" min="0" max="25" v-model.number="reservedSlots" placeholder="Automatic (matches current traits)">
					</div>

					<div class="editor-field" v-if="styleBody !== 'notes' && styleBody !== 'image' && styleBody !== 'pips' && styleBody !== 'session-record' && styleBody !== 'angled-lines'">
						<div class="editor-label">Trait Features</div>
						<div class="editor-toggles">

							<div><input type="checkbox" :id="'trait-set-' + traitSetID + '-feature-description'" name="featureDescription" :true-value="true" :false-value="false" v-model="featureDescription"></div>
							<div><label :for="'trait-set-' + traitSetID + '-feature-description'">Description</label></div>

							<div v-if="styleBody !== 'list'"><input type="checkbox" :id="'trait-set-' + traitSetID + '-feature-subtraits'" name="featureSubtraits" :true-value="true" :false-value="false" v-model="featureSubtraits"></div>
							<div v-if="styleBody !== 'list'"><label :for="'trait-set-' + traitSetID + '-feature-subtraits'">Sub-Traits</label></div>

							<div><input type="checkbox" :id="'trait-set-' + traitSetID + '-feature-sfx'" name="featureSFX" :true-value="true" :false-value="false" v-model="featureSFX"></div>
							<div><label :for="'trait-set-' + traitSetID + '-feature-sfx'">SFX</label></div>

						</div>
					</div>

					<!-- RATING POSITION -->
					<div class="editor-field" v-if="needsDiceUI && styleBody !== 'notes' && styleBody !== 'image' && styleBody !== 'pips' && styleBody !== 'session-record' && styleBody !== 'angled-lines'">
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

					<!-- STATEMENT MODE -->
					<div class="editor-field" v-if="styleBody !== 'notes' && styleBody !== 'image' && styleBody !== 'pips' && styleBody !== 'session-record' && styleBody !== 'angled-lines' && styleBody !== 'three-column-table' && styleBody !== 'paired-slots'">
						<div class="editor-label">Statements</div>
						<div class="editor-checkbox-row" style="display: flex; align-items: center; gap: 0.4rem; margin-bottom: 0.35rem;">
							<input type="checkbox" :id="'trait-set-' + traitSetID + '-statement-mode'" name="statementMode" v-model="isStatementSet">
							<label :for="'trait-set-' + traitSetID + '-statement-mode'" style="margin: 0; font-size: 0.8rem; cursor: pointer;">Enable Statement Field on Traits</label>
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
							<label :for="'trait-set-' + traitSetID + '-counter-col'" style="margin: 0; font-size: 0.8rem; cursor: pointer;">Enable Counter / XP Column</label>
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

				</div>

			</div>
		</div>

		<TraitSetEditorConfirm />

	</aside>
</template>
