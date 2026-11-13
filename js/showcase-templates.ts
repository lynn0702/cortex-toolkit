import dreamerArchitectJson from '../data/templates/Dreamer_Architect.curio.json' with { type: 'json' };

/**
 * Showcase Templates (Phase 3c).
 * Pre-authored reference characters immediately selectable in the Template Library.
 */
export const DREAMER_ARCHITECT_SHOWCASE = {
	id: 'dreamer-architect',
	title: 'The Dreamer & the Architect',
	subtitle: 'Tarot-Card Layout Reference',
	blurb: 'Two minds, one sheet — a tarot-card display with dual circular portraits, leader lines, and shared values.',
	genre: 'Reference / Showcase',
	pages: 1,
	listing: {
		image: 'images/250px-Corot_-_The_Dreamer_at_the_Fountain__1855_63.jpg',
		genre: 'Reference / Showcase',
		quote: 'Two minds, one sheet — a tarot-card display with dual circular portraits, leader lines, and shared values.',
		setting: 'd8',
		prep: 'd6',
		complexity: 'd8',
	},
	character: dreamerArchitectJson,
};

export const VANGUARD_FRAME_SHOWCASE = {
	id: 'vanguard-frame-showcase',
	title: 'Vanguard Frame Showcase',
	subtitle: 'Phase 3c SVG Frames & Attached Stress Reference',
	blurb:
		'Reference character demonstrating SVG borders (chamfered block, bare line), portrait frames, trait arrays (ring, arc), attached stress on a ring, and mobile unframed fallback.',
	genre: 'Sci-Fi / Reference',
	pages: 2,
	listing: {
		genre: 'Sci-Fi / Reference',
		quote: 'Horizon Vanguard recon pilot testing experimental frame telemetry across ring, arc, and chamfered blocks.',
		setting: 'd8',
		prep: 'd6',
		complexity: 'd10',
	},
	character: {
		$schema: '../schema/0.1/character.schema.json',
		version: '0.1',
		id: 'kaelen-vos-frame-showcase',
		name: 'Kaelen Vos',
		game: 'Vanguard Frame Showcase',
		pronouns: 'they/them',
		description: 'Horizon Vanguard recon pilot testing experimental frame telemetry.',
		plotPoints: 2,
		portrait: null,
		notes: '',
		tags: [],
		view: {
			pageCount: 2,
			labels: {
				pillars: {
					identity: 'Bio',
					prime: 'Prime',
					plus: 'Plus',
					play: 'Session',
				},
			},
		},
		traitSets: [
			{
				name: 'Attributes',
				noun: 'Attribute',
				view: {
					pillar: 'prime',
					page: 1,
					place: { left: '0%', top: 0, width: '100%', height: 1 },
					header: 'top',
					border: 'none',
					frame: {
						shape: 'circle',
						array: 'ring',
						span: [0, 360],
						color: 'primary',
					},
					labels: {
						track: 'Stress',
						out: 'OUT',
					},
					parts: {
						name: { left: '0%', top: 0, width: '25%', height: 1, marker: 'L' },
						rating: { left: '25%', top: 0, width: '75%', height: 1, ratingType: 'Die', range: [4, 6, 8, 10, 12] },
						trackLabel: { left: '0%', top: 1, width: '25%', height: 1, marker: 'L' },
						track: { left: '25%', top: 1, width: '75%', height: 1, ratingType: 'Die', range: [4, 6, 8, 10, 12] },
					},
				},
				traits: [
					{
						name: 'Agility',
						rating: { type: 'Die', value: [8], range: [4, 6, 8, 10, 12] },
						traits: [{ name: 'Stress', rating: { type: 'Die', value: [6], range: [4, 6, 8, 10, 12] } }],
					},
					{
						name: 'Awareness',
						rating: { type: 'Die', value: [10], range: [4, 6, 8, 10, 12] },
						traits: [],
					},
					{
						name: 'Brawn',
						rating: { type: 'Die', value: [6], range: [4, 6, 8, 10, 12] },
						traits: [],
					},
					{
						name: 'Coordination',
						rating: { type: 'Die', value: [8], range: [4, 6, 8, 10, 12] },
						traits: [],
					},
					{
						name: 'Intellect',
						rating: { type: 'Die', value: [8], range: [4, 6, 8, 10, 12] },
						traits: [{ name: 'Stress', rating: { type: 'Die', value: [4], range: [4, 6, 8, 10, 12] } }],
					},
					{
						name: 'Will',
						rating: { type: 'Die', value: [6], range: [4, 6, 8, 10, 12] },
						traits: [],
					},
				],
			},
			{
				name: '',
				view: {
					pillar: 'prime',
					page: 1,
					place: { left: '0%', top: 1, width: '100%', height: 1 },
					border: {
						shape: 'line',
						color: 'accent',
					},
				},
				traits: [],
			},
			{
				name: 'Distinctions',
				noun: 'Distinction',
				view: {
					pillar: 'prime',
					page: 1,
					place: { left: '0%', top: 2, width: '100%', height: 2 },
					header: 'top',
					features: { sfx: true },
					ratingDisplay: 'rating',
					frame: {
						shape: 'circle',
						array: 'arc',
						span: [0, 360],
						traitsSpan: [45, 135],
						color: 'accent',
					},
					parts: {
						name: { left: '0%', top: 0, width: '70%', height: 1, marker: 'L' },
						rating: { left: '70%', top: 0, width: '30%', height: 1, ratingType: 'Die', range: [4, 8] },
						block: { left: '0%', top: 1, width: '100%', height: 1, marker: 'T' },
					},
				},
				traits: [
					{
						name: 'Slipstream Test Pilot',
						rating: { type: 'Die', value: [8], range: [4, 8] },
						traits: [
							{
								name: 'SFX',
								traits: [
									{
										name: 'Hinder',
										rating: { type: 'Die', value: [4], range: [4] },
										description: "Gain a PP when you switch out this distinction's d8 for a d4.",
									},
								],
							},
						],
					},
					{
						name: 'Jury-Rigged Telemetry',
						rating: { type: 'Die', value: [8], range: [4, 8] },
						traits: [
							{
								name: 'SFX',
								traits: [
									{
										name: 'Hinder',
										rating: { type: 'Die', value: [4], range: [4] },
										description: "Gain a PP when you switch out this distinction's d8 for a d4.",
									},
								],
							},
						],
					},
					{
						name: 'Haunted by the Outer Rim',
						rating: { type: 'Die', value: [8], range: [4, 8] },
						traits: [
							{
								name: 'SFX',
								traits: [
									{
										name: 'Hinder',
										rating: { type: 'Die', value: [4], range: [4] },
										description: "Gain a PP when you switch out this distinction's d8 for a d4.",
									},
								],
							},
						],
					},
				],
			},
			{
				name: 'Roles',
				noun: 'Role',
				view: {
					pillar: 'prime',
					page: 1,
					place: { left: '0%', top: 4, width: '50%', height: 1 },
					header: 'top',
					border: {
						shape: 'block',
						corner: 'cut',
						color: 'primary',
					},
					parts: {
						name: { left: '0%', top: 0, width: '55%', height: 1, marker: 'L' },
						rating: { left: '55%', top: 0, width: '45%', height: 1, ratingType: 'Die', range: [4, 6, 8, 10, 12] },
					},
				},
				traits: [
					{ name: 'Commander', rating: { type: 'Die', value: [6], range: [4, 6, 8, 10, 12] } },
					{ name: 'Engineer', rating: { type: 'Die', value: [8], range: [4, 6, 8, 10, 12] } },
					{ name: 'Navigator', rating: { type: 'Die', value: [10], range: [4, 6, 8, 10, 12] } },
					{ name: 'Scoundrel', rating: { type: 'Die', value: [6], range: [4, 6, 8, 10, 12] } },
					{ name: 'Tactician', rating: { type: 'Die', value: [6], range: [4, 6, 8, 10, 12] } },
				],
			},
			{
				name: 'Values',
				noun: 'Value',
				view: {
					pillar: 'plus',
					page: 1,
					place: { left: '50%', top: 4, width: '50%', height: 1 },
					header: 'top',
					border: {
						shape: 'block',
						corner: 8,
						color: 'muted',
						stroke: '1.5px',
					},
					parts: {
						name: { left: '0%', top: 0, width: '40%', height: 1, marker: 'L' },
						'child:Statement:rating': { left: '40%', top: 0, width: '10%', height: 1 },
						rating: { left: '50%', top: 0, width: '50%', height: 1, ratingType: 'Die', range: [4, 6, 8, 10, 12] },
						'child:Statement:label': { left: '0%', top: 1, width: '100%', height: 1 },
					},
				},
				traits: [
					{
						name: 'Duty',
						rating: { type: 'Die', value: [8], range: [4, 6, 8, 10, 12] },
						traits: [{ name: 'The crew comes home before the cargo.', rating: { type: 'Pip', value: [false] } }],
					},
					{
						name: 'Glory',
						rating: { type: 'Die', value: [6], range: [4, 6, 8, 10, 12] },
						traits: [{ name: 'No jump vector is impossible.', rating: { type: 'Pip', value: [true] } }],
					},
					{
						name: 'Justice',
						rating: { type: 'Die', value: [8], range: [4, 6, 8, 10, 12] },
						traits: [{ name: "The Syndicate doesn't own the sky.", rating: { type: 'Pip', value: [false] } }],
					},
					{
						name: 'Truth',
						rating: { type: 'Die', value: [10], range: [4, 6, 8, 10, 12] },
						traits: [{ name: 'Every signal leaves a ghost in the static.', rating: { type: 'Pip', value: [false] } }],
					},
				],
			},
			{
				name: 'Signature Assets',
				noun: 'Asset',
				view: {
					pillar: 'plus',
					page: 1,
					place: { left: '0%', top: 5, width: '100%', height: 1 },
					header: 'top',
					border: {
						shape: 'block',
						corner: 12,
						color: 'primary',
						dash: '6 3',
					},
					parts: {
						name: { left: '0%', top: 0, width: '65%', height: 1, marker: 'L' },
						rating: { left: '65%', top: 0, width: '35%', height: 1, ratingType: 'Dice', range: [4, 6, 8, 10, 12] },
					},
				},
				traits: [
					{
						name: 'Chronos-IV Interceptor',
						rating: { type: 'Dice', value: [8, 6], range: [4, 6, 8, 10, 12] },
					},
					{
						name: 'Phase-Locked Grapple',
						rating: { type: 'Die', value: [6], range: [4, 6, 8, 10, 12] },
					},
				],
			},
			{
				name: 'Scene Traits',
				noun: 'Scene Trait',
				view: {
					pillar: 'play',
					page: 2,
					place: { left: '0%', top: 0, width: '100%', height: 1 },
					visibility: 'play-only',
					playMutable: true,
					outIndicator: true,
					reservedSlots: 2,
					header: 'top',
					border: {
						shape: 'block',
						corner: 'cut',
						color: 'accent',
					},
					parts: {
						name: { left: '0%', top: 0, width: '60%', height: 1, marker: 'T' },
						rating: { left: '60%', top: 0, width: '40%', height: 1, ratingType: 'Die', range: [4, 6, 8, 10, 12] },
					},
				},
				traits: [
					{
						name: 'Sensor Lock',
						rating: { type: 'Die', value: [6], range: [4, 6, 8, 10, 12] },
					},
					{
						name: 'Hull Breach',
						rating: { type: 'Die', value: [8], range: [4, 6, 8, 10, 12], out: true },
					},
				],
			},
			{
				name: 'Session Notes',
				noun: 'Note',
				notes:
					'### Telemetry Log\n- **Sector 7 Beacon:** Signal encrypted with pre-launch keys.\n- Try morphing `Attributes` from `ring` to `arc` or a bordered `block` in the Set Editor!',
				view: {
					pillar: 'play',
					page: 2,
					place: { left: '0%', top: 1, width: '100%', height: 1 },
					visibility: 'play-only',
					playMutable: true,
					style: { body: 'notes' },
					border: {
						shape: 'block',
						corner: 8,
						color: 'muted',
						stroke: '1.5px',
					},
				},
				traits: [],
			},
		],
	},
};

export const SHOWCASE_TEMPLATES = [VANGUARD_FRAME_SHOWCASE];
