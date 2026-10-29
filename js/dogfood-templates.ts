/**
 * Dogfood Showcase Templates (Phase 3c).
 * Pre-authored reference characters immediately selectable in the Template Library.
 */
export const VANGUARD_FRAME_SHOWCASE = {
	id: 'vanguard-frame-showcase',
	title: 'Vanguard Frame Showcase (Dogfood)',
	subtitle: 'Phase 3c SVG Frames & Attached Stress Reference',
	blurb: 'Reference character demonstrating SVG frames (ring, arc, ellipse, chamfered block, bare line), attached stress on a ring, and mobile unframed fallback.',
	genre: 'Sci-Fi / Reference',
	pages: 2,
	listing: {
		genre: 'Sci-Fi / Reference',
		quote: 'Horizon Vanguard recon pilot testing experimental frame telemetry across ring, arc, ellipse, and chamfered blocks.',
		setting: 'd8',
		prep: 'd6',
		complexity: 'd10'
	},
	character: {
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
			sheetStyle: 'spotlight',
			columns: 2,
			labels: {
				pillars: {
					identity: 'Bio',
					prime: 'Prime',
					plus: 'Plus',
					play: 'Session'
				}
			}
		},
		traitSets: [
			{
				name: 'Attributes',
				noun: 'Attribute',
				view: {
					pillar: 'prime',
					span: 2,
					header: 'top',
					headerAlign: 'center',
					frame: {
						shape: 'ring',
						span: [ 0, 360 ],
						stroke: 'primary'
					},
					labels: {
						track: 'Stress',
						out: 'OUT'
					},
					parts: {
						name: { left: '0%', top: 0, width: '60%', height: 1, marker: 'L' },
						rating: { left: '60%', top: 0, width: '40%', height: 1, ratingType: 'Die', range: [ 4, 6, 8, 10, 12 ] },
						trackLabel: { left: '0%', top: 1, width: '30%', height: 1, marker: 'L' },
						track: { left: '30%', top: 1, width: '70%', height: 1, ratingType: 'Die', range: [ 4, 6, 8, 10, 12 ] }
					}
				},
				traits: [
					{
						name: 'Agility',
						rating: { type: 'Die', value: [ 8 ], range: [ 4, 6, 8, 10, 12 ] },
						traits: [
							{ name: 'Stress', rating: { type: 'Die', value: [ 6 ], range: [ 4, 6, 8, 10, 12 ] } }
						]
					},
					{
						name: 'Awareness',
						rating: { type: 'Die', value: [ 10 ], range: [ 4, 6, 8, 10, 12 ] },
						traits: []
					},
					{
						name: 'Brawn',
						rating: { type: 'Die', value: [ 6 ], range: [ 4, 6, 8, 10, 12 ] },
						traits: []
					},
					{
						name: 'Coordination',
						rating: { type: 'Die', value: [ 8 ], range: [ 4, 6, 8, 10, 12 ] },
						traits: []
					},
					{
						name: 'Intellect',
						rating: { type: 'Die', value: [ 8 ], range: [ 4, 6, 8, 10, 12 ] },
						traits: [
							{ name: 'Stress', rating: { type: 'Die', value: [ 4 ], range: [ 4, 6, 8, 10, 12 ] } }
						]
					},
					{
						name: 'Will',
						rating: { type: 'Die', value: [ 6 ], range: [ 4, 6, 8, 10, 12 ] },
						traits: []
					}
				]
			},
			{
				name: '',
				view: {
					pillar: 'prime',
					span: 2,
					frame: {
						shape: 'line',
						stroke: 'accent'
					}
				},
				traits: []
			},
			{
				name: 'Distinctions',
				noun: 'Distinction',
				view: {
					pillar: 'prime',
					span: 2,
					header: 'top',
					headerAlign: 'center',
					sharedHinder: true,
					style: { body: 'sfx-rows' },
					features: { sfx: true },
					frame: {
						shape: 'arc',
						span: [ -110, 110 ],
						stroke: 'accent'
					},
					parts: {
						name: { left: '0%', top: 0, width: '70%', height: 1, marker: 'L' },
						rating: { left: '70%', top: 0, width: '30%', height: 1, ratingType: 'Die', range: [ 4, 8 ] },
						block: { left: '0%', top: 1, width: '100%', height: 1, marker: 'T' }
					}
				},
				traits: [
					{
						name: 'Slipstream Test Pilot',
						rating: { type: 'Die', value: [ 8 ], range: [ 4, 8 ] },
						traits: [
							{
								name: 'SFX',
								traits: [
									{ name: 'Hinder', description: 'Gain a PP when you switch out this distinction\'s d8 for a d4.' },
									{ name: 'Redline', description: 'Step up or double a Pilot or Coordination die in a high-speed stunt, then step down that trait for the scene.' }
								]
							}
						]
					},
					{
						name: 'Jury-Rigged Telemetry',
						rating: { type: 'Die', value: [ 8 ], range: [ 4, 8 ] },
						traits: [
							{
								name: 'SFX',
								traits: [
									{ name: 'Hinder', description: 'Gain a PP when you switch out this distinction\'s d8 for a d4.' }
								]
							}
						]
					},
					{
						name: 'Haunted by the Outer Rim',
						rating: { type: 'Die', value: [ 8 ], range: [ 4, 8 ] },
						traits: [
							{
								name: 'SFX',
								traits: [
									{ name: 'Hinder', description: 'Gain a PP when you switch out this distinction\'s d8 for a d4.' }
								]
							}
						]
					}
				]
			},
			{
				name: 'Roles',
				noun: 'Role',
				view: {
					pillar: 'prime',
					span: 1,
					header: 'top',
					frame: {
						shape: 'block',
						corner: 'cut',
						stroke: 'primary'
					},
					parts: {
						name: { left: '0%', top: 0, width: '55%', height: 1, marker: 'L' },
						rating: { left: '55%', top: 0, width: '45%', height: 1, ratingType: 'Die', range: [ 4, 6, 8, 10, 12 ] }
					}
				},
				traits: [
					{ name: 'Commander', rating: { type: 'Die', value: [ 6 ], range: [ 4, 6, 8, 10, 12 ] } },
					{ name: 'Engineer', rating: { type: 'Die', value: [ 8 ], range: [ 4, 6, 8, 10, 12 ] } },
					{ name: 'Navigator', rating: { type: 'Die', value: [ 10 ], range: [ 4, 6, 8, 10, 12 ] } },
					{ name: 'Scoundrel', rating: { type: 'Die', value: [ 6 ], range: [ 4, 6, 8, 10, 12 ] } },
					{ name: 'Tactician', rating: { type: 'Die', value: [ 6 ], range: [ 4, 6, 8, 10, 12 ] } }
				]
			},
			{
				name: 'Values',
				noun: 'Value',
				statement: true,
				hasQuestionedPip: true,
				view: {
					pillar: 'plus',
					span: 1,
					header: 'top',
					statement: true,
					hasQuestionedPip: true,
					frame: {
						shape: 'ellipse',
						span: [ 0, 360 ],
						stroke: 'muted'
					},
					parts: {
						name: { left: '0%', top: 0, width: '55%', height: 1, marker: 'L' },
						rating: { left: '55%', top: 0, width: '45%', height: 1, ratingType: 'Die', range: [ 4, 6, 8, 10, 12 ] }
					}
				},
				traits: [
					{
						name: 'Duty',
						statement: 'The crew comes home before the cargo.',
						rating: { type: 'Die', value: [ 8 ], range: [ 4, 6, 8, 10, 12 ] },
						traits: [
							{ name: 'The crew comes home before the cargo.', rating: { type: 'Pip', value: [ false ], range: [ 1 ] } }
						]
					},
					{
						name: 'Glory',
						statement: 'No jump vector is impossible.',
						questioned: true,
						rating: { type: 'Die', value: [ 6 ], range: [ 4, 6, 8, 10, 12 ] },
						traits: [
							{ name: 'No jump vector is impossible.', rating: { type: 'Pip', value: [ true ], range: [ 1 ] } }
						]
					},
					{
						name: 'Justice',
						statement: 'The Syndicate doesn\'t own the sky.',
						rating: { type: 'Die', value: [ 8 ], range: [ 4, 6, 8, 10, 12 ] },
						traits: [
							{ name: 'The Syndicate doesn\'t own the sky.', rating: { type: 'Pip', value: [ false ], range: [ 1 ] } }
						]
					},
					{
						name: 'Truth',
						statement: 'Every signal leaves a ghost in the static.',
						rating: { type: 'Die', value: [ 10 ], range: [ 4, 6, 8, 10, 12 ] },
						traits: [
							{ name: 'Every signal leaves a ghost in the static.', rating: { type: 'Pip', value: [ false ], range: [ 1 ] } }
						]
					}
				]
			},
			{
				name: 'Signature Assets',
				noun: 'Asset',
				view: {
					pillar: 'plus',
					span: 2,
					header: 'top',
					frame: {
						shape: 'block',
						corner: 12,
						stroke: 'double'
					},
					parts: {
						name: { left: '0%', top: 0, width: '65%', height: 1, marker: 'L' },
						rating: { left: '65%', top: 0, width: '35%', height: 1, ratingType: 'Dice', range: [ 4, 6, 8, 10, 12 ] }
					}
				},
				traits: [
					{
						name: 'Chronos-IV Interceptor',
						rating: { type: 'Dice', value: [ 8, 6 ], range: [ 4, 6, 8, 10, 12 ] }
					},
					{
						name: 'Phase-Locked Grapple',
						rating: { type: 'Die', value: [ 6 ], range: [ 4, 6, 8, 10, 12 ] }
					}
				]
			},
			{
				name: 'Scene Traits',
				noun: 'Scene Trait',
				view: {
					pillar: 'play',
					visibility: 'play-only',
					playMutable: true,
					outIndicator: true,
					reservedSlots: 2,
					header: 'top',
					frame: {
						shape: 'block',
						corner: 'cut',
						stroke: 'accent'
					},
					parts: {
						name: { left: '0%', top: 0, width: '60%', height: 1, marker: 'T' },
						rating: { left: '60%', top: 0, width: '40%', height: 1, ratingType: 'Die', range: [ 4, 6, 8, 10, 12 ] }
					}
				},
				traits: [
					{
						name: 'Sensor Lock',
						rating: { type: 'Die', value: [ 6 ], range: [ 4, 6, 8, 10, 12 ] }
					},
					{
						name: 'Hull Breach',
						rating: { type: 'Die', value: [ 8 ], range: [ 4, 6, 8, 10, 12 ], out: true }
					}
				]
			},
			{
				name: 'Session Notes',
				noun: 'Note',
				notes: '### Telemetry Log\n- **Sector 7 Beacon:** Signal encrypted with pre-launch keys.\n- Try morphing `Attributes` from `ring` to `ellipse` or `block` in the JSON tab or Trait Block Mini!',
				view: {
					pillar: 'play',
					visibility: 'play-only',
					playMutable: true,
					style: { body: 'notes' },
					frame: {
						shape: 'block',
						corner: 8,
						stroke: 'muted'
					}
				},
				traits: []
			}
		]
	}
};

export const DOGFOOD_TEMPLATES = [ VANGUARD_FRAME_SHOWCASE ];
