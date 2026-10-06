/**
 * Style Gallery — visual side panel for adding trait sets.
 * Shows a live sample of every trait set style; adding copies the
 * style (with its default features) onto a new set on the sheet.
 */
const STYLE_GALLERY_STYLES = [
	{
		id: 'default', name: 'New Trait Set', sing: 'Trait', plur: 'Traits',
		blurb: 'Classic rated rows with an optional description.',
		preview: '<div class="trait-set trait-set-style-default"><div class="trait-set-header"><div class="trait-set-header-inner"><div>VALUES</div></div></div><div class="trait-set-body"><div class="trait-list"><div class="trait"><div class="trait-inner"><h2 class="trait-title"><span class="trait-name">Courage</span><div class="trait-value single-die-value"><span class="c">4</span><span class="c active">6</span><span class="c">8</span></div></h2><div class="trait-description">Never back down.</div></div></div></div></div></div>'
	},
	{
		id: 'distinctions', name: 'Distinctions', sing: 'Distinction', plur: 'Distinctions',
		blurb: 'Signature descriptive traits with Hinder and SFX.',
		preview: '<div class="trait-set trait-set-style-distinctions"><div class="trait-set-header"><div class="trait-set-header-inner"><div>DISTINCTIONS</div></div></div><div class="trait-set-body"><div class="trait-list"><div class="trait"><div class="trait-inner"><h2 class="trait-title"><span class="trait-name">Ship\'s Doctor</span><div class="trait-value single-die-value"><span class="c active">8</span></div></h2><ul class="trait-sfx"><li><span class="trait-sfx-name">Hinder</span>: <span class="trait-sfx-description">Gain a PP…</span></li></ul></div></div></div></div></div>'
	},
	{
		id: 'skills-specialties', name: 'Skills & Specialties', sing: 'Skill', plur: 'Skills',
		blurb: 'Skills branched to specialties with connecting arrows. Specialties can be sub-traits or linked flat traits.',
		preview: '<div class="trait-set trait-set-style-skills-specialties"><div class="trait-set-header"><div class="trait-set-header-inner"><div>SKILLS</div></div></div><div class="trait-set-body"><div class="trait-skills-branch"><div class="skills-branch-head"><span>SKILL</span><span>SPECIALTIES</span></div><div class="skill-branch-row"><div class="skill-branch-skill"><span class="trait-name">Guns</span><div class="trait-value single-die-value"><span class="c active">6</span></div></div><div class="skill-branch-link"></div><div class="skill-branch-specialties"><div class="specialty-row"><span class="subtrait-name">Pistol</span><div class="subtrait-value"><span class="c active">8</span></div></div></div></div></div></div></div>'
	},
	{
		id: 'assets', name: 'Assets', sing: 'Asset', plur: 'Assets',
		blurb: 'Compact gear rows with a colored header bar.',
		preview: '<div class="trait-set trait-set-style-assets"><div class="trait-set-header"><div class="trait-set-header-inner"><div>SIGNATURE ASSETS</div></div></div><div class="trait-set-body"><div class="trait-list"><div class="trait"><div class="trait-inner"><h2 class="trait-title"><span class="trait-name">Medkit</span><div class="trait-value single-die-value"><span class="c active">8</span></div></h2></div></div></div></div></div>'
	},
	{
		id: 'resources', name: 'Resources', sing: 'Resource', plur: 'Resources',
		blurb: 'Bulleted pools with multi-die support.',
		preview: '<div class="trait-set trait-set-style-resources"><div class="trait-set-header"><div class="trait-set-header-inner"><div>RESOURCES</div></div></div><div class="trait-set-body"><div class="trait-list"><div class="trait"><div class="trait-inner"><h2 class="trait-title"><span class="trait-name">Crew</span><div class="trait-value single-die-value"><span class="c active">8</span></div></h2></div></div></div></div></div>'
	},
	{
		id: 'resources-count', name: 'Resources + Count', sing: 'Resource', plur: 'Resources',
		blurb: 'Syndicate style: a rating die plus a 1–5 dice-count track.',
		preview: '<div class="trait-set trait-set-style-resources-count"><div class="trait-set-header"><div class="trait-set-header-inner"><div>RESOURCES</div></div></div><div class="trait-set-body"><div class="trait-resources-count"><div class="resource-row"><span class="trait-name">Crew</span><span class="resource-rating-label">RATING</span><div class="trait-value single-die-value"><span class="c active">8</span></div><span class="resource-count-label">/ DICE</span><div class="resource-count"><span class="count-pip filled">1</span><span class="count-pip filled">2</span><span class="count-pip">3</span></div></div></div></div></div>'
	},
	{
		id: 'standing', name: 'Standing', sing: 'Standing', plur: 'Standings',
		blurb: 'Standing die with complication and bonus dice.',
		preview: '<div class="trait-set trait-set-style-standing"><div class="trait-set-header"><div class="trait-set-header-inner"><div>STANDING</div></div></div><div class="trait-set-body"><div class="trait-standing"><div class="standing-main"><span class="trait-name">Cool Kids</span><div class="trait-value single-die-value"><span class="c active">6</span></div></div><div class="standing-sub"><span class="standing-sub-label">COMPLICATION</span><div class="subtrait-value"><span class="c active">8</span></div><span class="standing-sub-label">BONUS</span><div class="subtrait-value"><span class="c active">6</span></div></div></div></div></div>'
	},
	{
		id: 'badges-table', name: 'Badges Table', sing: 'Badge', plur: 'Badges',
		blurb: 'Checklist rows with a die per row.',
		preview: '<div class="trait-set trait-set-style-badges-table"><div class="trait-set-header"><div class="trait-set-header-inner"><div>BADGES</div></div></div><div class="trait-set-body"><div class="trait-badges-table"><div class="badge-row"><span class="badge-name">Tracking</span><div class="trait-value single-die-value"><span class="c active">8</span></div></div><div class="badge-row"><span class="badge-name">Swimming</span><div class="trait-value single-die-value"><span class="c active">6</span></div></div></div></div></div>'
	},
	{
		id: 'talents-table', name: 'Talents Table', sing: 'Talent', plur: 'Talents',
		blurb: 'Talent / activation / effect rows. No dice.',
		preview: '<div class="trait-set trait-set-style-talents-table"><div class="trait-set-header"><div class="trait-set-header-inner"><div>TALENTS</div></div></div><div class="trait-set-body"><div class="trait-talents-table"><div class="talents-head"><span>TALENT</span><span>ACTIVATION</span><span>EFFECT</span></div><div class="talent-row"><span class="talent-name">Trick Shot</span><span class="talent-activation">When attacking…</span><span class="talent-effect">Double Guns.</span></div></div></div></div>'
	},
	{
		id: 'growth-ladder', name: 'Growth Ladder', sing: 'Growth Die', plur: 'Growth Dice',
		blurb: 'Vertical die track, e.g. a growth or XP pool.',
		preview: '<div class="trait-set trait-set-style-growth-ladder"><div class="trait-set-header"><div class="trait-set-header-inner"><div>GROWTH POOL</div></div></div><div class="trait-set-body"><div class="trait-growth-ladder"><div class="growth-rung"><div class="trait-value single-die-value"><span class="c active">4</span></div></div><div class="growth-rung"><div class="trait-value single-die-value"><span class="c active">6</span></div></div><div class="growth-rung"><div class="trait-value single-die-value"><span class="c active">8</span></div></div></div></div></div>'
	},
	{
		id: 'dossier-fields', name: 'Dossier Fields', sing: 'Field', plur: 'Fields',
		blurb: 'Stacked labeled blocks, e.g. faction dossiers. No dice.',
		preview: '<div class="trait-set trait-set-style-dossier-fields"><div class="trait-set-header"><div class="trait-set-header-inner"><div>FORCE</div></div></div><div class="trait-set-body"><div class="trait-dossier"><div class="dossier-field"><span class="dossier-label">GOAL</span><span class="dossier-text">Gain as many members as possible.</span></div><div class="dossier-field"><span class="dossier-label">METHOD</span><span class="dossier-text">Offer peace and sanctuary.</span></div></div></div></div>'
	},
	{
		id: 'stress', name: 'Stress', sing: 'Stress', plur: 'Stress',
		blurb: 'Stepped stress tracks with an optional Out marker.',
		preview: '<div class="trait-set trait-set-style-stress"><div class="trait-set-header"><div class="trait-set-header-inner"><div>STRESS</div></div></div><div class="trait-set-body"><div class="trait-list"><div class="trait"><div class="trait-inner"><h2 class="trait-title"><span class="trait-name">Injured</span><div class="trait-value stress-value"><span class="c">4</span><span class="c active">6</span><span class="c">8</span></div></h2></div></div></div></div></div>'
	},
	{
		id: 'two-columns-compact', name: 'Two Columns (Compact)', sing: 'Trait', plur: 'Traits',
		blurb: 'Pill-style dice badges in a tight two-column grid.',
		preview: '<div class="trait-set trait-set-style-two-columns-compact"><div class="trait-set-header"><div class="trait-set-header-inner"><div>ATTRIBUTES</div></div></div><div class="trait-set-body"><div class="trait-list"><div class="trait"><div class="trait-inner"><h2 class="trait-title"><span class="trait-name">Mind</span><div class="trait-value"><span class="c active">8</span></div></h2></div></div></div></div></div>'
	},
	{
		id: 'two-columns-detailed', name: 'Two Columns (Detailed)', sing: 'Trait', plur: 'Traits',
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
		blurb: 'Connected bubble track, e.g. XP.',
		preview: '<div class="trait-set"><div class="trait-set-header"><div class="trait-set-header-inner"><div>XP</div></div></div><div class="trait-set-body"><div class="trait-pips-body"><div class="pips-track-container connected"><div class="pip-row"><div class="pip-row-line"></div><div class="pip-bubble-wrap"><div class="pip-bubble filled"></div></div><div class="pip-bubble-wrap"><div class="pip-bubble filled"></div></div><div class="pip-bubble-wrap"><div class="pip-bubble"></div></div><div class="pip-bubble-wrap"><div class="pip-bubble"></div></div></div></div></div></div></div>'
	},
	{
		id: 'session-record', name: 'Session Record', sing: 'Milestone', plur: 'Milestones',
		blurb: 'Angled session lines with check bubbles.',
		preview: '<div class="trait-set"><div class="trait-set-header"><div class="trait-set-header-inner"><div>SESSION RECORD</div></div></div><div class="trait-set-body"><div class="gallery-session-mock"><div class="gallery-session-line"></div><div class="gallery-session-line"></div><div class="gallery-session-line"></div></div></div></div>'
	},
	{
		id: 'halo', name: 'Portrait Halo', sing: 'Attribute', plur: 'Attributes',
		blurb: 'Dice ringed around the character portrait.',
		preview: '<div class="trait-set"><div class="trait-set-header"><div class="trait-set-header-inner"><div>ATTRIBUTES</div></div></div><div class="trait-set-body"><div class="gallery-halo-mock"><div class="gallery-halo-ring"></div><span class="c gallery-halo-die" style="top:-6%;left:50%;">8</span><span class="c gallery-halo-die" style="top:50%;left:-4%;">6</span><span class="c gallery-halo-die" style="top:50%;left:96%;">0</span></div></div></div></div>'
	},
];

const StyleGallery = {

	props: {
		open:        Boolean,
		columnCount: Number,
		pageCount:   Number,
		allowCenter: Boolean,
	},

	emits: [ 'close', 'addGallerySet' ],

	data() {
		return {
			styles:   STYLE_GALLERY_STYLES,
			location: 'left',
			page:     1,
		}
	},

	watch: {
		open( isOpen ) {
			if ( isOpen ) {
				this.page = 1;
				if ( this.location === 'center' && !this.allowCenter ) {
					this.location = 'left';
				}
			}
		}
	},

	/*html*/
	template: `<teleport to="body">
		<transition>
			<div class="modal-veil" v-if="open" @click.stop="$emit('close')"></div>
		</transition>
		<transition>
			<aside class="modal modal-style-gallery" v-if="open">
				<div class="modal-close" @click.prevent="$emit('close')"><i class="fas fa-times"></i></div>
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
					<div class="style-gallery-grid">
						<div class="style-gallery-card" v-for="st in styles" :key="st.id">
							<div class="style-gallery-preview"><div class="character-sheet spotlight-style" v-html="st.preview"></div></div>
							<div class="style-gallery-name">{{ st.name }}</div>
							<div class="style-gallery-blurb">{{ st.blurb }}</div>
							<button type="button" class="btn-gallery-add" @click.stop="$emit('addGallerySet', st, location, page)">
								<i class="fas fa-plus"></i> Add to Sheet
							</button>
						</div>
					</div>
				</div>
			</aside>
		</transition>
	</teleport>`,

};
