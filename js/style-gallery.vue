<script setup lang="ts">
import { ref, watch } from 'vue';
import { cortexFunctions, cortexSetPresets, type SetPresetEntry } from './functions.ts';

/**
 * Style Gallery — visual side panel for adding trait sets.
 * Shows a live sample of every trait set style; adding copies the
 * style (with its default features) onto a new set on the sheet.
 */

interface StyleCard {
	id: string;
	name: string;
	sing: string;
	plur: string;
	blurb: string;
	preview: string;
	pipLabels?: boolean;
}

const STYLE_GALLERY_STYLES: StyleCard[] = [
	{
		id: 'default', name: 'New Trait Set', sing: 'Trait', plur: 'Traits',
		blurb: 'Classic rated rows with an optional description.',
		preview: '<div class="trait-set trait-set-style-default"><div class="trait-set-header"><div class="trait-set-header-inner"><div>VALUES</div></div></div><div class="trait-set-body"><div class="trait-list"><div class="trait"><div class="trait-inner"><h2 class="trait-title"><span class="trait-name">Courage</span><div class="trait-value single-die-value"><span class="c">4</span><span class="c active">6</span><span class="c">8</span></div></h2><div class="trait-description">Never back down.</div></div></div></div></div></div>'
	},
	{
		id: 'sfx-rows', name: 'SFX Rows', sing: 'Distinction', plur: 'Distinctions',
		blurb: 'Signature descriptive traits with Hinder and SFX.',
		preview: '<div class="trait-set trait-set-style-sfx-rows"><div class="trait-set-header"><div class="trait-set-header-inner"><div>DISTINCTIONS</div></div></div><div class="trait-set-body"><div class="trait-list"><div class="trait"><div class="trait-inner"><h2 class="trait-title"><span class="trait-name">Ship\'s Doctor</span><div class="trait-value single-die-value"><span class="c active">8</span></div></h2><ul class="trait-sfx"><li><span class="trait-sfx-name">Hinder</span>: <span class="trait-sfx-description">Gain a PP…</span></li></ul></div></div></div></div></div>'
	},
	{
		id: 'subtrait-columns', name: 'Subtrait Columns', sing: 'Skill', plur: 'Skills',
		blurb: 'Skills branched to specialties with connecting arrows. Specialties can be sub-traits or linked flat traits.',
		preview: '<div class="trait-set trait-set-style-subtrait-columns"><div class="trait-set-header"><div class="trait-set-header-inner"><div>SKILLS</div></div></div><div class="trait-set-body"><div class="trait-subtrait-columns"><div class="branch-head"><span>SKILL</span><span>SPECIALTIES</span></div><div class="branch-row"><div class="branch-main"><span class="trait-name">Guns</span><div class="trait-value single-die-value"><span class="c active">6</span></div></div><div class="branch-link"></div><div class="branch-side"><div class="branch-slot"><span class="subtrait-name">Pistol</span><div class="subtrait-value"><span class="c active">8</span></div></div></div></div></div></div></div>'
	},
	{
		id: 'boxed-rows', name: 'Boxed Rows', sing: 'Asset', plur: 'Assets',
		blurb: 'Compact rows with a colored header bar.',
		preview: '<div class="trait-set trait-set-style-boxed-rows"><div class="trait-set-header"><div class="trait-set-header-inner"><div>SIGNATURE ASSETS</div></div></div><div class="trait-set-body"><div class="trait-list"><div class="trait"><div class="trait-inner"><h2 class="trait-title"><span class="trait-name">Medkit</span><div class="trait-value single-die-value"><span class="c active">8</span></div></h2></div></div></div></div></div>'
	},
	{
		id: 'pool-rows', name: 'Pool Rows', sing: 'Resource', plur: 'Resources',
		blurb: 'Bulleted dice pools.',
		preview: '<div class="trait-set trait-set-style-pool-rows"><div class="trait-set-header"><div class="trait-set-header-inner"><div>RESOURCES</div></div></div><div class="trait-set-body"><div class="trait-list"><div class="trait"><div class="trait-inner"><h2 class="trait-title"><span class="trait-name">Crew</span><div class="trait-value single-die-value"><span class="c active">8</span></div></h2></div></div></div></div></div>'
	},
	{
		id: 'dice-count', name: 'Dice Count', sing: 'Resource', plur: 'Resources',
		blurb: 'Syndicate style: a rating die plus a 1–5 dice-count track.',
		preview: '<div class="trait-set trait-set-style-dice-count"><div class="trait-set-header"><div class="trait-set-header-inner"><div>RESOURCES</div></div></div><div class="trait-set-body"><div class="trait-dice-count"><div class="dice-count-row"><span class="trait-name">Crew</span><span class="dice-count-rating-label">RATING</span><div class="trait-value single-die-value"><span class="c active">8</span></div><span class="dice-count-count-label">/ DICE</span><div class="dice-count-track"><span class="dice-count-pip filled">1</span><span class="dice-count-pip filled">2</span><span class="dice-count-pip">3</span></div></div></div></div></div>'
	},
	{
		id: 'paired-slots', name: 'Paired Slots', sing: 'Standing', plur: 'Standings',
		blurb: 'Standing die with complication and bonus dice.',
		preview: '<div class="trait-set trait-set-style-paired-slots"><div class="trait-set-header"><div class="trait-set-header-inner"><div>STANDING</div></div></div><div class="trait-set-body"><div class="trait-paired-slots"><div class="paired-slot-main"><span class="trait-name">Cool Kids</span><div class="trait-value single-die-value"><span class="c active">6</span></div></div><div class="paired-slot-sub"><span class="paired-slot-sub-label">COMPLICATION</span><div class="subtrait-value"><span class="c active">8</span></div><span class="paired-slot-sub-label">BONUS</span><div class="subtrait-value"><span class="c active">6</span></div></div></div></div></div>'
	},
	{
		id: 'die-rows', name: 'Die Rows', sing: 'Badge', plur: 'Badges',
		blurb: 'Checklist rows with a die per row.',
		preview: '<div class="trait-set trait-set-style-die-rows"><div class="trait-set-header"><div class="trait-set-header-inner"><div>BADGES</div></div></div><div class="trait-set-body"><div class="trait-die-rows"><div class="die-row"><span class="die-row-name">Tracking</span><div class="trait-value single-die-value"><span class="c active">8</span></div></div><div class="die-row"><span class="die-row-name">Swimming</span><div class="trait-value single-die-value"><span class="c active">6</span></div></div></div></div></div>'
	},
	{
		id: 'three-column-table', name: 'Three Column Table', sing: 'Talent', plur: 'Talents',
		blurb: 'Talent / activation / effect rows. No dice.',
		preview: '<div class="trait-set trait-set-style-three-column-table"><div class="trait-set-header"><div class="trait-set-header-inner"><div>TALENTS</div></div></div><div class="trait-set-body"><div class="trait-three-column-table"><div class="three-col-head"><span>TALENT</span><span>ACTIVATION</span><span>EFFECT</span></div><div class="three-col-row"><span class="three-col-name">Trick Shot</span><span class="three-col-activation">When attacking…</span><span class="three-col-effect">Double Guns.</span></div></div></div></div>'
	},
	{
		id: 'dice-ladder', name: 'Dice Ladder', sing: 'Rung', plur: 'Rungs',
		blurb: 'Vertical die track for stepped ratings.',
		preview: '<div class="trait-set trait-set-style-dice-ladder"><div class="trait-set-header"><div class="trait-set-header-inner"><div>DICE LADDER</div></div></div><div class="trait-set-body"><div class="trait-dice-ladder"><div class="ladder-rung"><div class="trait-value single-die-value"><span class="c active">4</span></div></div><div class="ladder-rung"><div class="trait-value single-die-value"><span class="c active">6</span></div></div><div class="ladder-rung"><div class="trait-value single-die-value"><span class="c active">8</span></div></div></div></div></div>'
	},
	{
		id: 'labeled-fields', name: 'Labeled Fields', sing: 'Field', plur: 'Fields',
		blurb: 'Stacked labeled blocks. No dice.',
		preview: '<div class="trait-set trait-set-style-labeled-fields"><div class="trait-set-header"><div class="trait-set-header-inner"><div>FORCE</div></div></div><div class="trait-set-body"><div class="trait-labeled-fields"><div class="field-block"><span class="field-label">GOAL</span><span class="field-text">Gain as many members as possible.</span></div><div class="field-block"><span class="field-label">METHOD</span><span class="field-text">Offer peace and sanctuary.</span></div></div></div></div>'
	},
	{
		id: 'die-track', name: 'Die Track', sing: 'Stress', plur: 'Stress',
		blurb: 'Stepped die tracks with an optional Out marker.',
		preview: '<div class="trait-set trait-set-style-die-track"><div class="trait-set-header"><div class="trait-set-header-inner"><div>STRESS</div></div></div><div class="trait-set-body"><div class="trait-list"><div class="trait"><div class="trait-inner"><h2 class="trait-title"><span class="trait-name">Injured</span><div class="trait-value stress-value"><span class="c">4</span><span class="c active">6</span><span class="c">8</span></div></h2></div></div></div></div></div>'
	},
	{
		id: 'two-columns-compact', name: 'Two Columns Compact', sing: 'Trait', plur: 'Traits',
		blurb: 'Pill-style dice badges in a tight two-column grid.',
		preview: '<div class="trait-set trait-set-style-two-columns-compact"><div class="trait-set-header"><div class="trait-set-header-inner"><div>ATTRIBUTES</div></div></div><div class="trait-set-body"><div class="trait-list"><div class="trait"><div class="trait-inner"><h2 class="trait-title"><span class="trait-name">Mind</span><div class="trait-value"><span class="c active">8</span></div></h2></div></div></div></div></div>'
	},
	{
		id: 'two-columns-detailed', name: 'Two Columns Detailed', sing: 'Trait', plur: 'Traits',
		blurb: 'Full trait rows in a two-column grid.',
		preview: '<div class="trait-set trait-set-style-two-columns-detailed"><div class="trait-set-header"><div class="trait-set-header-inner"><div>ROLES</div></div></div><div class="trait-set-body"><div class="trait-list"><div class="trait"><div class="trait-inner"><h2 class="trait-title"><span class="trait-name">Brains</span><div class="trait-value"><span class="c active">8</span></div></h2></div></div></div></div></div>'
	},
	{
		id: 'list', name: 'List', sing: 'Entry', plur: 'Entries',
		blurb: 'Simple unrated bullet list. No dice.',
		preview: '<div class="trait-set trait-set-style-list"><div class="trait-set-header"><div class="trait-set-header-inner"><div>NOTES</div></div></div><div class="trait-set-body"><div class="trait-list"><div class="trait"><div class="trait-inner"><h2 class="trait-title"><span class="list-bullet">•</span><span class="trait-name">First entry</span></h2></div></div><div class="trait"><div class="trait-inner"><h2 class="trait-title"><span class="list-bullet">•</span><span class="trait-name">Second entry</span></h2></div></div></div></div></div>'
	},
	{
		id: 'notes', name: 'Notes', sing: 'Note', plur: 'Notes',
		blurb: 'Free-form text area with markdown support.',
		preview: '<div class="trait-set trait-set-style-notes"><div class="trait-set-header"><div class="trait-set-header-inner"><div>MILESTONES</div></div></div><div class="trait-set-body"><div class="trait-notes-body"><div class="notes-content"><p><strong>Personal:</strong> 1 XP when…</p></div></div></div></div>'
	},
	{
		id: 'image', name: 'Image', sing: 'Image', plur: 'Images',
		blurb: 'Illustration or portrait block with caption.',
		preview: '<div class="trait-set"><div class="trait-set-header"><div class="trait-set-header-inner"><div>ART</div></div></div><div class="trait-set-body"><div class="trait-image-body"><div class="image-set-container"><div class="image-set-placeholder"><i class="fas fa-image"></i><span>Illustration</span></div></div></div></div></div>'
	},
	{
		id: 'pips', name: 'Pips / Track', sing: 'Pip', plur: 'Pips',
		blurb: 'Connected bubble track.',
		preview: '<div class="trait-set"><div class="trait-set-header"><div class="trait-set-header-inner"><div>XP</div></div></div><div class="trait-set-body"><div class="trait-pips-body"><div class="pips-track-container connected"><div class="pip-row"><div class="pip-row-line"></div><div class="pip-bubble-wrap"><div class="pip-bubble filled"></div></div><div class="pip-bubble-wrap"><div class="pip-bubble filled"></div></div><div class="pip-bubble-wrap"><div class="pip-bubble"></div></div><div class="pip-bubble-wrap"><div class="pip-bubble"></div></div></div></div></div></div></div>'
	},
	{
		id: 'pips', name: 'Sessions', sing: 'Session', plur: 'Sessions', pipLabels: true,
		blurb: 'Checkable entries with names.',
		preview: '<div class="trait-set"><div class="trait-set-header"><div class="trait-set-header-inner"><div>SESSIONS</div></div></div><div class="trait-set-body"><div class="pip-label-list"><div class="pip-label-row"><div class="pip-bubble-wrap"><div class="pip-bubble filled"></div></div><span class="pip-label-name">Session 1</span></div><div class="pip-label-row"><div class="pip-bubble-wrap"><div class="pip-bubble"></div></div><span class="pip-label-name">Session 2</span></div></div></div></div>'
	},
	{
		id: 'portrait-ring', name: 'Portrait Ring', sing: 'Attribute', plur: 'Attributes',
		blurb: 'Dice ringed around the character portrait.',
		preview: '<div class="trait-set"><div class="trait-set-header"><div class="trait-set-header-inner"><div>ATTRIBUTES</div></div></div><div class="trait-set-body"><div class="gallery-ring-mock"><div class="gallery-ring"></div><span class="c gallery-ring-die" style="top:-6%;left:50%;">8</span><span class="c gallery-ring-die" style="top:50%;left:-4%;">6</span><span class="c gallery-ring-die" style="top:50%;left:96%;">0</span></div></div></div></div>'
	},
];

const props = defineProps<{
	open: boolean;
	columnCount: number;
	pageCount: number;
	allowCenter: boolean;
	initialPage: number;
	initialLocation: string;
}>();

const emit = defineEmits<{
	( e: 'close' ): void;
	( e: 'addGallerySet', st: StyleCard, location: string, page: number ): void;
	( e: 'addPresetSet', preset: SetPresetEntry, location: string, page: number ): void;
}>();

const styles = STYLE_GALLERY_STYLES;
const builtInPresets = Object.values( cortexSetPresets );
const customPresets = ref<SetPresetEntry[]>( [] );
const location = ref( 'left' );
const page = ref( 1 );

function refreshCustomPresets() {
	customPresets.value = cortexFunctions.getCustomSetPresets();
}

function removeCustomPreset( id: string ) {
	customPresets.value = cortexFunctions.deleteCustomSetPreset( id );
}

watch( () => props.open, ( isOpen ) => {
	if ( isOpen ) {
		refreshCustomPresets();
		page.value = props.initialPage >= 1 && props.initialPage <= Math.max( 1, props.pageCount || 1 ) ? props.initialPage : 1;
		location.value = props.initialLocation === 'center' && props.allowCenter ? 'center'
			: props.initialLocation === 'right' ? 'right' : 'left';
	}
} );
</script>

<template>
	<teleport to="body">
		<transition>
			<div class="modal-veil" v-if="open" @click.stop="emit('close')"></div>
		</transition>
		<transition>
			<aside class="modal modal-style-gallery" v-if="open">
				<div class="modal-close" @click.prevent="emit('close')"><i class="fas fa-times"></i></div>
				<div class="modal-inner">
					<h2><i class="fas fa-layer-group"></i> Add Trait Set</h2>
					<p class="gallery-sub">Pick a visual style — each card shows a live sample. It lands on the sheet with that style's defaults.</p>
					<div class="gallery-placement">
						<div class="editor-button-group">
							<button type="button" class="editor-group-btn" :class="{ active: location === 'left' }" @click.stop="location = 'left'">Left</button>
							<button type="button" class="editor-group-btn" v-if="allowCenter" :class="{ active: location === 'center' }" @click.stop="location = 'center'">Center</button>
							<button type="button" class="editor-group-btn" :class="{ active: location === 'right' }" @click.stop="location = 'right'">Right</button>
						</div>
						<div class="editor-button-group">
							<button type="button" class="editor-group-btn" v-for="n in Math.max(1, pageCount || 1)" :key="n" :class="{ active: page === n }" @click.stop="page = n">Page {{ n }}</button>
						</div>
					</div>
					<div class="gallery-presets-section">
						<div class="editor-label" style="margin-bottom: 0.4rem;">Set Presets</div>
						<div class="style-gallery-grid" style="margin-bottom: 1.25rem;">
							<div class="style-gallery-card" v-for="preset in builtInPresets" :key="'builtin-' + preset.id">
								<div class="style-gallery-name">{{ preset.label }}</div>
								<div class="style-gallery-blurb">{{ preset.blurb }}</div>
								<button type="button" class="btn-gallery-add" @click.stop="emit('addPresetSet', preset, location, page)">
									<i class="fas fa-plus"></i> Add Preset
								</button>
							</div>
							<div class="style-gallery-card" v-for="preset in customPresets" :key="'custom-' + preset.id">
								<div style="display: flex; align-items: center; justify-content: space-between; gap: 0.35rem;">
									<div class="style-gallery-name">{{ preset.label }}</div>
									<button type="button" class="editor-header-btn" title="Delete saved preset" @click.stop="removeCustomPreset(preset.id)">
										<i class="fas fa-trash-alt"></i>
									</button>
								</div>
								<div class="style-gallery-blurb">{{ preset.blurb || 'Saved custom set preset' }}</div>
								<button type="button" class="btn-gallery-add" @click.stop="emit('addPresetSet', preset, location, page)">
									<i class="fas fa-plus"></i> Add Preset
								</button>
							</div>
						</div>
					</div>
					<div class="editor-label" style="margin-bottom: 0.4rem;">Blank Styles</div>
					<div class="style-gallery-grid">
						<div class="style-gallery-card" v-for="st in styles" :key="st.name">
							<div class="style-gallery-preview"><div class="character-sheet spotlight-style" v-html="st.preview"></div></div>
							<div class="style-gallery-name">{{ st.name }}</div>
							<div class="style-gallery-blurb">{{ st.blurb }}</div>
							<button type="button" class="btn-gallery-add" @click.stop="emit('addGallerySet', st, location, page)">
								<i class="fas fa-plus"></i> Add to Sheet
							</button>
						</div>
					</div>
				</div>
			</aside>
		</transition>
	</teleport>
</template>
