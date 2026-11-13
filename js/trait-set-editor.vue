<script setup lang="ts">
import { ref, computed } from 'vue';
import { useTraitSetEditor } from './use-trait-set-editor.ts';
import TraitSetEditorRing from './trait-set-editor-ring.vue';
import TraitSetEditorLayout from './trait-set-editor-layout.vue';
import TraitSetEditorDice from './trait-set-editor-dice.vue';
import TraitSetEditorImage from './trait-set-editor-image.vue';
import TraitSetEditorConfirm from './trait-set-editor-confirm.vue';
import VisibilityEye from './visibility-eye.vue';
import TagEditor from './tag-editor.vue';

const props = defineProps<{
	character: any;
	traitSetID: number;
	open?: boolean;
	viewY?: number | null;
}>();

const emit = defineEmits<{
	(e: 'selectElement', selector: any[]): void;
	(e: 'updateCharacter', character: any): void;
	(e: 'removeTraitSet', traitSetID: number): void;
}>();

const api = useTraitSetEditor(props, emit);

const {
	rootEl,
	inputName,
	cssClass,
	checkScrollPosition,
	name,
	traitSetID,
	isName,
	styleBody,
	styleOptions,
	branchArrows,
	headerMode,
	headerAlign,
	verticalAlign,
	styleLabel,
	setStyleLabel,
	hasLabelContent,
	description,
	tags,
	includeOut,
	hasCounterTrait,
	allowsTraitColumns,
	traitColumns,
	needsDiceUI,
	hasTrackPart,
	trackLabel,
	pipCount,
	pipsPerRow,
	pipsFilled,
	pipsConnected,
	pipLabels,
	noun,
	plural,
	reservedSlots,
	ratingDisplay,
	labelPosition,
	counterLabel,
	restorableTraitNames,
	restoreTrait,
	setVisibility,
	cycleSetVisibility,
	setPillar,
	resolvedPillar,
	presetSaved,
	saveSetAsPreset,
	characterCustomPillars,
	selectElement,
	promptDeleteTraitSet,
	targetValue,
} = api;

const STANDARD_PILLARS = ['prime', 'plus', 'play', 'identity'];
const isCustomPillar = ref(false);

const selectedPillar = computed<string>({
	get: () => {
		if (isCustomPillar.value) return '__custom__';
		const cur = (setPillar.value || resolvedPillar.value || 'prime').toLowerCase().trim();
		if (STANDARD_PILLARS.includes(cur) || characterCustomPillars.value.includes(cur)) {
			return cur;
		}
		return '__custom__';
	},
	set: (val: string) => {
		if (val === '__custom__') {
			isCustomPillar.value = true;
			if (STANDARD_PILLARS.includes(setPillar.value.toLowerCase().trim())) {
				setPillar.value = '';
			}
		} else {
			isCustomPillar.value = false;
			setPillar.value = val;
		}
	},
});
</script>

<template>
	<aside :class="cssClass" @click.stop="" ref="rootEl">
		<div class="editor-controls">
			<button type="button" @click.stop="saveSetAsPreset" title="Save Set Preset" aria-label="Save Set Preset">
				<i :class="presetSaved ? 'fas fa-check' : 'fas fa-bookmark'" aria-hidden="true"></i>
				<span class="editor-control-label">{{ presetSaved ? 'Saved' : 'Save Preset' }}</span>
			</button>
			<button
				v-if="!isName"
				type="button"
				class="editor-delete"
				@click.stop="promptDeleteTraitSet"
				title="Delete trait set"
				aria-label="Delete trait set"
			>
				<i class="fas fa-trash" aria-hidden="true"></i>
				<span class="editor-control-label">Delete</span>
			</button>
		</div>

		<div class="editor-inner">
			<div @scroll="checkScrollPosition">
				<div class="editor-fields">
					<!-- CONTENT -->
					<details class="editor-group" open>
						<summary class="editor-group-title">Content</summary>

						<div class="editor-field">
							<div class="name-heading-row editor-row-between mb-xs">
								<label :for="'trait-set-name-' + traitSetID">Trait Set Name</label>
								<VisibilityEye :state="setVisibility" @toggle="cycleSetVisibility" />
							</div>
							<input
								type="text"
								:id="'trait-set-name-' + traitSetID"
								name="traitSetName"
								v-model="name"
								ref="inputName"
							/>
						</div>

						<div class="editor-field" v-if="!isName">
							<label :for="'trait-set-style-select-' + traitSetID">Style</label>
							<select :id="'trait-set-style-select-' + traitSetID" name="traitSetStyle" v-model="styleBody">
								<option v-for="option in styleOptions" :value="option.id" :selected="option.id === styleBody">
									{{ option.label }}
								</option>
							</select>
							<div class="editor-checkbox-row mt-sm" v-if="styleBody === 'subtrait-columns'">
								<input
									type="checkbox"
									:id="'trait-set-' + traitSetID + '-branch-arrows'"
									name="branchArrows"
									v-model="branchArrows"
								/>
								<label :for="'trait-set-' + traitSetID + '-branch-arrows'">Connecting arrows</label>
							</div>
						</div>

						<!-- STYLE-CONDITIONAL SECTIONS (each exists only for the styles that summon it) -->
						<TraitSetEditorDice />

						<TraitSetEditorImage />

						<!-- PIPS TRACK SETTINGS -->
						<div class="editor-field" v-if="styleBody === 'pips'">
							<div class="editor-label">Pip Track Settings</div>
							<div class="editor-row-inline mb-md">
								<div class="flex-1">
									<label :for="'trait-set-' + traitSetID + '-pip-count'" class="editor-sub-label">Total Pips</label>
									<input
										type="number"
										:id="'trait-set-' + traitSetID + '-pip-count'"
										name="pipCount"
										min="1"
										max="100"
										v-model.number="pipCount"
										inputmode="numeric"
									/>
								</div>
								<div class="flex-1">
									<label :for="'trait-set-' + traitSetID + '-pip-per-row'" class="editor-sub-label">Pips Per Row</label>
									<div class="num-stepper">
										<button
											type="button"
											class="btn-step"
											@click.stop="pipsPerRow = Math.max(1, pipsPerRow - 1)"
											:disabled="pipsPerRow <= 1"
											title="Fewer pips per row"
											aria-label="Fewer pips per row"
										>
											-
										</button>
										<input
											type="number"
											:id="'trait-set-' + traitSetID + '-pip-per-row'"
											name="pipsPerRow"
											min="1"
											max="20"
											v-model.number="pipsPerRow"
											inputmode="numeric"
											aria-label="Pips per row"
										/>
										<button
											type="button"
											class="btn-step"
											@click.stop="pipsPerRow = Math.min(20, pipsPerRow + 1)"
											title="More pips per row"
											aria-label="More pips per row"
										>
											+
										</button>
									</div>
								</div>
							</div>
							<div class="mb-md">
								<label :for="'trait-set-' + traitSetID + '-pip-filled'" class="editor-sub-label">Filled Pips</label>
								<div class="num-stepper">
									<button
										type="button"
										class="btn-step"
										@click.stop="pipsFilled = Math.max(0, pipsFilled - 1)"
										:disabled="pipsFilled <= 0"
										title="Unfill a pip"
										aria-label="Unfill a pip"
									>
										-
									</button>
									<input
										type="number"
										:id="'trait-set-' + traitSetID + '-pip-filled'"
										name="pipsFilled"
										min="0"
										:max="pipCount"
										v-model.number="pipsFilled"
										inputmode="numeric"
										aria-label="Filled pips"
									/>
									<button
										type="button"
										class="btn-step"
										@click.stop="pipsFilled = Math.min(pipCount, pipsFilled + 1)"
										title="Fill a pip"
										aria-label="Fill a pip"
									>
										+
									</button>
								</div>
							</div>
							<div class="editor-checkbox-row">
								<input
									type="checkbox"
									:id="'trait-set-' + traitSetID + '-pips-connected'"
									name="pipsConnected"
									v-model="pipsConnected"
								/>
								<label :for="'trait-set-' + traitSetID + '-pips-connected'">Connect pips</label>
							</div>
							<div class="editor-checkbox-row mt-sm">
								<input
									type="checkbox"
									:id="'trait-set-' + traitSetID + '-pip-labels'"
									name="pipLabels"
									v-model="pipLabels"
								/>
								<label
									:for="'trait-set-' + traitSetID + '-pip-labels'"
									title="Name a pip per row: rows render as bubble-plus-label entries"
									>Labels</label
								>
							</div>
						</div>

						<div class="editor-field" v-if="styleBody !== 'image' && styleBody !== 'pips' && !isName">
							<div class="editor-row-between">
								<label :for="'trait-set-reserved-slots-' + traitSetID" class="m-0">Print Slots</label>
								<div class="num-stepper">
									<button
										type="button"
										class="btn-step"
										@click.stop="
											reservedSlots = Math.max(
												0,
												(reservedSlots === '' || reservedSlots === null ? 1 : reservedSlots) - 1,
											)
										"
										:disabled="reservedSlots === '' || reservedSlots === null || reservedSlots <= 0"
										title="Fewer reserved slots"
										aria-label="Fewer reserved slots"
									>
										-
									</button>
									<input
										type="number"
										:id="'trait-set-reserved-slots-' + traitSetID"
										name="reservedSlots"
										min="0"
										max="25"
										v-model.number="reservedSlots"
										placeholder="Auto"
										inputmode="numeric"
										aria-label="Reserved slots for print"
									/>
									<button
										type="button"
										class="btn-step"
										@click.stop="
											reservedSlots = (reservedSlots === '' || reservedSlots === null ? 0 : reservedSlots) + 1
										"
										title="More reserved slots"
										aria-label="More reserved slots"
									>
										+
									</button>
								</div>
							</div>
						</div>

						<div class="editor-field">
							<label :for="'trait-set-desc-' + traitSetID">Description</label>
							<textarea
								:id="'trait-set-desc-' + traitSetID"
								name="traitSetDescription"
								v-model="description"
								rows="2"
							></textarea>
						</div>

						<div class="editor-field" v-if="!isName">
							<TagEditor v-model="tags" :input-id="'trait-set-tags-' + traitSetID" label="Tags" />
						</div>

						<!-- COUNTER COLUMN HEADER (shown when set has Counter traits) -->
						<div class="editor-field" v-if="hasCounterTrait">
							<div class="editor-label">Counter Column</div>
							<div class="editor-row-inline mt-sm">
								<label :for="'trait-set-' + traitSetID + '-counter-label'" class="editor-sub-label"
									>Header Label:</label
								>
								<input
									type="text"
									:id="'trait-set-' + traitSetID + '-counter-label'"
									name="counterLabel"
									v-model="counterLabel"
									placeholder="XP"
									class="editor-input-short"
								/>
							</div>
						</div>

						<!-- RESTORE TEMPLATE TRAITS (D19) -->
						<div class="editor-field" v-if="restorableTraitNames.length">
							<div class="editor-label">Restore Removed Traits</div>
							<div class="editor-button-group flex-wrap">
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
							<div class="editor-row-inline mt-sm">
								<div class="flex-1">
									<label :for="'trait-set-' + traitSetID + '-sub-left'" class="editor-sub-label">Left Heading</label>
									<input
										type="text"
										:id="'trait-set-' + traitSetID + '-sub-left'"
										name="subHeadingLeft"
										:value="styleLabel('left')"
										@change="setStyleLabel('left', targetValue($event))"
										:placeholder="styleLabel('left')"
									/>
								</div>
								<div class="flex-1">
									<label :for="'trait-set-' + traitSetID + '-sub-right'" class="editor-sub-label">Right Heading</label>
									<input
										type="text"
										:id="'trait-set-' + traitSetID + '-sub-right'"
										name="subHeadingRight"
										:value="styleLabel('right')"
										@change="setStyleLabel('right', targetValue($event))"
										:placeholder="styleLabel('right')"
									/>
								</div>
								<div class="flex-1">
									<label :for="'trait-set-' + traitSetID + '-sub-center'" class="editor-sub-label"
										>Center Heading</label
									>
									<input
										type="text"
										:id="'trait-set-' + traitSetID + '-sub-center'"
										name="subHeadingCenter"
										:value="styleLabel('center')"
										@change="setStyleLabel('center', targetValue($event))"
										:placeholder="styleLabel('center')"
									/>
								</div>
							</div>
						</div>
						<div class="editor-field" v-if="styleBody === 'dice-count'">
							<div class="editor-label">Count Headings</div>
							<div class="editor-row-inline mt-sm">
								<div class="flex-1">
									<label :for="'trait-set-' + traitSetID + '-rating-label'" class="editor-sub-label"
										>Rating Label</label
									>
									<input
										type="text"
										:id="'trait-set-' + traitSetID + '-rating-label'"
										name="diceCountRatingLabel"
										:value="styleLabel('rating')"
										@change="setStyleLabel('rating', targetValue($event))"
										:placeholder="styleLabel('rating')"
									/>
								</div>
								<div class="flex-1">
									<label :for="'trait-set-' + traitSetID + '-dice-label'" class="editor-sub-label">Count Label</label>
									<input
										type="text"
										:id="'trait-set-' + traitSetID + '-dice-label'"
										name="diceCountDiceLabel"
										:value="styleLabel('dice')"
										@change="setStyleLabel('dice', targetValue($event))"
										:placeholder="styleLabel('dice')"
									/>
								</div>
							</div>
						</div>

						<div class="editor-field" v-if="styleBody !== 'image' && styleBody !== 'pips'">
							<div class="editor-label">Nouns</div>
							<div class="editor-row-inline">
								<div class="flex-1">
									<label :for="'trait-set-noun-singular-' + traitSetID" class="editor-sub-label">Singular</label>
									<input
										type="text"
										:id="'trait-set-noun-singular-' + traitSetID"
										name="noun"
										v-model="noun"
										placeholder="Trait"
									/>
								</div>
								<div class="flex-1">
									<label :for="'trait-set-noun-plural-' + traitSetID" class="editor-sub-label">Plural</label>
									<input
										type="text"
										:id="'trait-set-noun-plural-' + traitSetID"
										name="plural"
										v-model="plural"
										placeholder="Traits"
									/>
								</div>
							</div>
						</div>

						<div class="editor-field" v-if="hasTrackPart">
							<label :for="'trait-set-' + traitSetID + '-track-label-words'">Track Label</label>
							<input
								type="text"
								:id="'trait-set-' + traitSetID + '-track-label-words'"
								name="trackLabelWords"
								v-model="trackLabel"
								placeholder="Stress"
							/>
						</div>
					</details>

					<!-- LAYOUT -->
					<details class="editor-group" open>
						<summary class="editor-group-title">Layout</summary>

						<!-- SET HEADER PLACEMENT + ALIGNMENT -->
						<div class="editor-field">
							<div class="editor-label">Set Header</div>
							<div class="editor-button-group">
								<button
									type="button"
									class="editor-group-btn"
									:class="{ active: headerMode === 'sidebar' }"
									:aria-pressed="headerMode === 'sidebar'"
									@click.stop="headerMode = 'sidebar'"
									title="Sidebar header"
								>
									<i class="fas fa-grip-lines-vertical" aria-hidden="true"></i> Sidebar
								</button>
								<button
									type="button"
									class="editor-group-btn"
									:class="{ active: headerMode === 'top' }"
									:aria-pressed="headerMode === 'top'"
									@click.stop="headerMode = 'top'"
									title="Top bar header"
								>
									<i class="fas fa-grip-lines" aria-hidden="true"></i> Top
								</button>
								<button
									type="button"
									class="editor-group-btn"
									:class="{ active: headerMode === 'bottom' }"
									:aria-pressed="headerMode === 'bottom'"
									@click.stop="headerMode = 'bottom'"
									title="Bottom bar header"
								>
									<i class="fas fa-grip-lines" aria-hidden="true"></i> Bottom
								</button>
								<button
									type="button"
									class="editor-group-btn"
									:class="{ active: headerMode === 'none' }"
									:aria-pressed="headerMode === 'none'"
									@click.stop="headerMode = 'none'"
									title="Remove header"
								>
									<i class="fas fa-eye-slash" aria-hidden="true"></i> None
								</button>
							</div>
							<div class="editor-button-group mt-sm">
								<button
									type="button"
									class="editor-group-btn"
									:class="{ active: headerAlign === 'left' }"
									:aria-pressed="headerAlign === 'left'"
									@click.stop="headerAlign = 'left'"
									title="Align left"
								>
									<i class="fas fa-align-left" aria-hidden="true"></i> Left
								</button>
								<button
									type="button"
									class="editor-group-btn"
									:class="{ active: headerAlign === 'center' }"
									:aria-pressed="headerAlign === 'center'"
									@click.stop="headerAlign = 'center'"
									title="Align center"
								>
									<i class="fas fa-align-center" aria-hidden="true"></i> Center
								</button>
								<button
									type="button"
									class="editor-group-btn"
									:class="{ active: headerAlign === 'right' }"
									:aria-pressed="headerAlign === 'right'"
									@click.stop="headerAlign = 'right'"
									title="Align right"
								>
									<i class="fas fa-align-right" aria-hidden="true"></i> Right
								</button>
							</div>
						</div>

						<!-- VERTICAL ALIGN -->
						<div class="editor-field">
							<div class="editor-label">Vertical Align</div>
							<div class="editor-button-group">
								<button
									type="button"
									class="editor-group-btn"
									:class="{ active: verticalAlign === 'top' }"
									:aria-pressed="verticalAlign === 'top'"
									@click.stop="verticalAlign = 'top'"
								>
									Top
								</button>
								<button
									type="button"
									class="editor-group-btn"
									:class="{ active: verticalAlign === 'center' }"
									:aria-pressed="verticalAlign === 'center'"
									@click.stop="verticalAlign = 'center'"
								>
									Center
								</button>
								<button
									type="button"
									class="editor-group-btn"
									:class="{ active: verticalAlign === 'bottom' }"
									:aria-pressed="verticalAlign === 'bottom'"
									@click.stop="verticalAlign = 'bottom'"
								>
									Bottom
								</button>
							</div>
						</div>

						<TraitSetEditorLayout />

						<TraitSetEditorRing />

						<!-- PILLAR & COLUMNS WITHIN SET -->
						<div
							class="editor-grid-2"
							v-if="
								allowsTraitColumns &&
								styleBody !== 'image' &&
								styleBody !== 'pips' &&
								selectedPillar !== '__custom__' &&
								!isCustomPillar
							"
						>
							<div class="editor-field">
								<label :for="'trait-set-' + traitSetID + '-pillar-select'">Pillar</label>
								<select
									:id="'trait-set-' + traitSetID + '-pillar-select'"
									v-model="selectedPillar"
									class="editor-select"
									aria-label="Pillar"
								>
									<option value="prime">Prime</option>
									<option value="plus">Plus</option>
									<option value="play">Play</option>
									<option value="identity">Identity</option>
									<option v-for="cp in characterCustomPillars" :key="cp" :value="cp">
										{{ cp.charAt(0).toUpperCase() + cp.slice(1) }}
									</option>
									<option value="__custom__">Custom...</option>
								</select>
							</div>
							<div class="editor-field">
								<label :for="'trait-set-' + traitSetID + '-columns'">Columns</label>
								<select :id="'trait-set-' + traitSetID + '-columns'" name="traitColumns" v-model.number="traitColumns">
									<option :value="1">1 Column</option>
									<option :value="2">2 Columns</option>
									<option :value="3">3 Columns</option>
								</select>
							</div>
						</div>
						<template v-else>
							<div class="editor-field">
								<label :for="'trait-set-' + traitSetID + '-pillar-select'">Pillar</label>
								<div class="editor-row-inline">
									<select
										:id="'trait-set-' + traitSetID + '-pillar-select'"
										v-model="selectedPillar"
										class="editor-select flex-1"
										aria-label="Pillar"
									>
										<option value="prime">Prime</option>
										<option value="plus">Plus</option>
										<option value="play">Play</option>
										<option value="identity">Identity</option>
										<option v-for="cp in characterCustomPillars" :key="cp" :value="cp">
											{{ cp.charAt(0).toUpperCase() + cp.slice(1) }}
										</option>
										<option value="__custom__">Custom...</option>
									</select>
									<input
										v-if="selectedPillar === '__custom__' || isCustomPillar"
										type="text"
										:id="'trait-set-' + traitSetID + '-pillar-custom'"
										name="setPillarCustom"
										v-model="setPillar"
										placeholder="Custom pillar name..."
										class="flex-1"
										aria-label="Custom pillar name"
									/>
								</div>
							</div>

							<div class="editor-field" v-if="allowsTraitColumns && styleBody !== 'image' && styleBody !== 'pips'">
								<label :for="'trait-set-' + traitSetID + '-columns'">Columns</label>
								<select :id="'trait-set-' + traitSetID + '-columns'" name="traitColumns" v-model.number="traitColumns">
									<option :value="1">1 Column</option>
									<option :value="2">2 Columns</option>
									<option :value="3">3 Columns</option>
								</select>
							</div>
						</template>

						<!-- LABEL POSITION (ladder rung names, horizontal or rotated vertical) -->
						<div class="editor-field" v-if="styleBody === 'die-rows'">
							<div class="editor-label">Label Position</div>
							<div class="editor-button-group">
								<button
									type="button"
									class="editor-group-btn"
									:class="{ active: labelPosition === 'horizontal' }"
									:aria-pressed="labelPosition === 'horizontal'"
									@click.stop="labelPosition = 'horizontal'"
								>
									Horizontal
								</button>
								<button
									type="button"
									class="editor-group-btn"
									:class="{ active: labelPosition === 'vertical' }"
									:aria-pressed="labelPosition === 'vertical'"
									@click.stop="labelPosition = 'vertical'"
								>
									Vertical
								</button>
							</div>
						</div>
					</details>
				</div>
			</div>
		</div>

		<TraitSetEditorConfirm />
	</aside>
</template>
