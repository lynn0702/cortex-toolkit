/**
 * Character Curio - Library Templates Repository (Blank Sheets)
 */
const characterCurioLibraryTemplates = [
	{
		id: 'alien-us',
		version: 1,
		character: {
			$schema: '../schema/0.1/character.schema.json',
			version: '0.1',
			id: 'template-alien-us',
			isTemplate: true,
			name: '',
			game: 'Alien, Us',
			description: '',
			pronouns: '',
			plotPoints: 1,
			notes: '',
			player: '',
			portrait: {
				url: '',
				view: {
					location: 'header',
				},
			},
			view: {
				pageCount: 2,
				template: 'Alien, Us',
				watermark: {
					enabled: true,
					url: 'images/cortex_prime_logo_light_transparent.png',
					opacity: 0.08,
					scale: 70,
					page: 'all',
				},
				columnAlignment: 'full-width',
				columnOffsets: {
					left: 0,
					center: 0,
					right: 0,
				},
				listing: {
					subtitle: 'Sci-Fi Infiltration & Paranoia',
					genre: 'Cold War Sci-Fi Drama',
					url: 'https://legacy.drivethrurpg.com/product/572304/Alien-Us?manufacturers_id=31866',
					image: 'https://legacy.drivethrurpg.com/images/31866/572304.jpg',
					quote:
						'You crashed here forty years ago. You learned the language, the customs, the clothes, the way they smile with their teeth showing even when they don’t mean it.',
					setting: 'd6',
					prep: 'd6',
					complexity: 'd8',
				},
			},
			traitSets: [
				{
					id: 'name',
					name: 'Name',
					view: {
						style: {
							header: 'default',
							body: 'name',
						},
						page: 1,
					},
					traits: [
						{
							name: 'name',
							label: 'Name',
							traits: [],
						},
						{
							name: 'player',
							label: 'Player',
							traits: [],
						},
						{
							name: 'nickname',
							label: 'Nickname',
							traits: [],
						},
						{
							name: 'pronouns',
							label: 'Pronouns',
							traits: [],
						},
						{
							name: 'description',
							label: 'Description',
							traits: [],
						},
						{
							name: 'game',
							label: 'Game',
							view: {
								visibility: 'hidden',
							},
							traits: [],
						},
						{
							name: 'portrait',
							traits: [],
						},
						{
							name: 'caption',
							traits: [],
						},
						{
							name: 'plotPoints',
							rating: {
								type: 'Counter',
								value: [1],
								range: [0, 20],
							},
							label: 'PP',
							spendable: true,
							view: {
								visibility: 'hidden',
							},
							traits: [],
						},
						{
							name: 'notes',
							view: {
								visibility: 'hidden',
							},
							traits: [],
						},
					],
				},
				{
					id: 'distinctions',
					name: 'Distinctions',
					description: 'Core alien background, job, and personality',
					view: {
						features: {
							description: true,
							sfx: false,
							subtraits: false,
						},
						page: 1,
						multiDie: false,
						ratingLadder: [8],
						notes: "Gain a PP when you trade out your distinction's d8 rating for a d4.",
						reservedSlots: 3,
						pillar: 'prime',
						altRoll: {
							die: 4,
							ppDelta: 1,
							label: 'Hinder',
						},
					},
					noun: 'Distinction',
					plural: 'Distinctions',
					traits: [
						{
							name: 'Alien Background:',
							traits: [
								{
									name: 'Hinder',
									rating: {
										type: 'Die',
										value: [4],
										range: [4],
									},
									traits: [],
									noun: 'SFX',
									ppDelta: 1,
								},
							],
							view: {
								badge: {
									text: 'SFX',
									shape: 'vertical-bar',
									color: 'black',
								},
								prompt: true,
							},
						},
						{
							name: 'Alien Role/Job:',
							traits: [
								{
									name: 'Hinder',
									rating: {
										type: 'Die',
										value: [4],
										range: [4],
									},
									traits: [],
									noun: 'SFX',
									ppDelta: 1,
								},
							],
							view: {
								badge: {
									text: 'SFX',
									shape: 'vertical-bar',
									color: 'black',
								},
								prompt: true,
							},
						},
						{
							name: 'Personality/Quirk:',
							traits: [
								{
									name: 'Hinder',
									rating: {
										type: 'Die',
										value: [4],
										range: [4],
									},
									traits: [],
									noun: 'SFX',
									ppDelta: 1,
								},
							],
							view: {
								badge: {
									text: 'SFX',
									shape: 'vertical-bar',
									color: 'black',
								},
								prompt: true,
							},
						},
					],
				},
				{
					id: 'subtrait-columns',
					name: 'Skills & Specialties',
					description: 'Core baseline d6 skills with branching d8+ specialties',
					view: {
						header: 'top',
						headerAlign: 'center',
						features: {
							description: false,
							sfx: false,
							subtraits: true,
						},
						page: 1,
						style: {
							header: 'default',
							body: 'subtrait-columns',
						},
						subtraitRatingLadder: [8, 10, 12],
						labels: {
							left: 'Specialties',
							center: 'Skills',
							right: 'Specialties',
						},
						multiDie: false,
						notes: '',
						reservedSlots: 7,
						pillar: 'prime',
						fixedNames: true,
					},
					rating: {
						type: 'Die',
						value: [6],
						range: [4, 6, 8, 10, 12],
					},
					noun: 'Skill',
					plural: 'Skills',
					traits: [
						{
							name: 'Bout',
							traits: [
								{
									name: '',
									view: {
										branchSide: 'left',
									},
									traits: [],
								},
								{
									name: '',
									view: {
										branchSide: 'right',
									},
									traits: [],
								},
							],
						},
						{
							name: 'Chat',
							traits: [
								{
									name: '',
									view: {
										branchSide: 'left',
									},
									traits: [],
								},
								{
									name: '',
									view: {
										branchSide: 'right',
									},
									traits: [],
								},
							],
						},
						{
							name: 'Find',
							traits: [
								{
									name: '',
									view: {
										branchSide: 'left',
									},
									traits: [],
								},
								{
									name: '',
									view: {
										branchSide: 'right',
									},
									traits: [],
								},
							],
						},
						{
							name: 'Make',
							traits: [
								{
									name: '',
									view: {
										branchSide: 'left',
									},
									traits: [],
								},
								{
									name: '',
									view: {
										branchSide: 'right',
									},
									traits: [],
								},
							],
						},
						{
							name: 'Play',
							traits: [
								{
									name: '',
									view: {
										branchSide: 'left',
									},
									traits: [],
								},
								{
									name: '',
									view: {
										branchSide: 'right',
									},
									traits: [],
								},
							],
						},
						{
							name: 'Operate',
							traits: [
								{
									name: '',
									view: {
										branchSide: 'left',
									},
									traits: [],
								},
								{
									name: '',
									view: {
										branchSide: 'right',
									},
									traits: [],
								},
							],
						},
						{
							name: 'Work',
							traits: [
								{
									name: '',
									view: {
										branchSide: 'left',
									},
									traits: [],
								},
								{
									name: '',
									view: {
										branchSide: 'right',
									},
									traits: [],
								},
							],
						},
					],
				},
				{
					id: 'values',
					name: 'Values',
					description: 'Alien worldview versus human conditioning',
					statement: true,
					view: {
						header: 'top',
						headerAlign: 'left',
						traitColumns: 2,
						features: {
							description: true,
							sfx: false,
							subtraits: false,
						},
						page: 1,
						style: {
							header: 'default',
							body: 'default',
						},
						multiDie: false,
						ratingLadder: [4, 6, 8, 10, 12],
						notes: '',
						reservedSlots: 7,
						parts: {
							rating: {
								left: '0%',
								top: 0,
								width: '100%',
								height: 1,
							},
							name: {
								left: '0%',
								top: 1,
								width: '100%',
								height: 1,
							},
						},
						pillar: 'prime',
						fixedNames: true,
					},
					noun: 'Value',
					plural: 'Values',
					traits: [
						{
							name: 'Alien',
							traits: [],
						},
						{
							name: 'Conformity',
							traits: [],
						},
						{
							name: 'Materialism',
							traits: [],
						},
						{
							name: 'Paranoia',
							traits: [],
						},
						{
							name: 'Patriotism',
							traits: [],
						},
						{
							name: 'Secrecy',
							traits: [],
						},
						{
							name: 'Spirituality',
							traits: [],
						},
					],
				},
				{
					id: 'talents',
					name: 'Talents',
					description: 'Specialized alien abilities and tech modules',
					view: {
						features: {
							description: true,
							sfx: true,
							subtraits: false,
						},
						page: 1,
						multiDie: false,
						notes: '',
						reservedSlots: 4,
						place: {
							left: '50%',
							top: 3,
							width: '50%',
							height: 1,
						},
						labels: {
							col1: 'TALENT',
							col2: 'ACTIVATION',
							col3: 'EFFECT',
						},
						pillar: 'plus',
						parts: {
							name: {
								left: '0%',
								top: 0,
								width: '28%',
								height: 1,
							},
							description: {
								left: '28%',
								top: 0,
								width: '33%',
								height: 1,
							},
							'child:SFX': {
								left: '61%',
								top: 0,
								width: '39%',
								height: 1,
							},
						},
					},
					noun: 'Talent',
					plural: 'Talents',
					traits: [],
				},
				{
					id: 'signature-assets-tech',
					name: 'Signature Assets / Tech',
					description: 'Alien equipment and concealed devices',
					view: {
						header: 'top',
						headerAlign: 'left',
						features: {
							description: true,
							sfx: false,
							subtraits: false,
						},
						page: 2,
						style: {
							header: 'default',
							body: 'default',
						},
						multiDie: false,
						ratingLadder: [6, 8, 10, 12],
						notes: '',
						reservedSlots: 3,
						parts: {
							name: {
								left: '0%',
								top: 0,
								width: '76%',
								height: 1,
							},
							rating: {
								left: '76%',
								top: 0,
								width: '24%',
								height: 1,
							},
							description: {
								left: '0%',
								top: 1,
								width: '100%',
								height: 1,
							},
						},
						pillar: 'plus',
					},
					noun: 'Signature Asset / Tech',
					plural: 'Signature Assets / Tech',
					traits: [],
				},
				{
					id: 'relationships',
					name: 'Relationships',
					description: 'Connections to human contacts, superiors, and rivals',
					view: {
						header: 'top',
						headerAlign: 'left',
						traitColumns: 2,
						features: {
							description: true,
							sfx: false,
							subtraits: false,
						},
						page: 2,
						style: {
							header: 'default',
							body: 'default',
						},
						multiDie: false,
						ratingLadder: [4, 6, 8, 10, 12],
						notes: '',
						reservedSlots: 10,
						parts: {
							rating: {
								left: '0%',
								top: 0,
								width: '100%',
								height: 1,
							},
							name: {
								left: '0%',
								top: 1,
								width: '100%',
								height: 1,
							},
						},
						pillar: 'prime',
					},
					noun: 'Relationship',
					plural: 'Relationships',
					traits: [],
				},
				{
					id: 'session-record',
					name: 'Session Record',
					description: 'Session track and progression log',
					view: {
						header: 'top',
						headerAlign: 'left',
						features: {
							description: false,
							sfx: false,
							subtraits: false,
						},
						page: 2,
						style: {
							header: 'default',
							body: 'pips',
						},
						multiDie: false,
						notes: '',
						reservedSlots: 20,
						place: {
							left: '50%',
							top: 2,
							width: '50%',
							height: 1,
						},
						pips: {
							labels: true,
							perRow: 20,
						},
						pillar: 'play',
					},
					rating: {
						type: 'Pip',
						value: [
							false,
							false,
							false,
							false,
							false,
							false,
							false,
							false,
							false,
							false,
							false,
							false,
							false,
							false,
							false,
							false,
							false,
							false,
							false,
							false,
						],
					},
					noun: 'Session',
					plural: 'Sessions',
					traits: [],
				},
			],
		},
	},
	{
		id: 'brighter-stars',
		version: 1,
		character: {
			$schema: '../schema/0.1/character.schema.json',
			version: '0.1',
			id: 'template-brighter-stars',
			isTemplate: true,
			name: '',
			game: 'Brighter Stars',
			description: '',
			pronouns: '',
			plotPoints: 1,
			notes: '',
			player: '',
			portrait: {
				url: '',
				view: {
					location: 'header',
				},
			},
			view: {
				pageCount: 1,
				template: 'Brighter Stars',
				watermark: {
					enabled: true,
					url: 'images/cortex_prime_logo_light_transparent.png',
					opacity: 0.08,
					scale: 70,
					page: 'all',
				},
				columnAlignment: 'top-base',
				columnOffsets: {
					left: 0,
					center: 0,
					right: 0,
				},
				listing: {
					subtitle: 'Hopepunk Starship Exploration',
					genre: 'Aspirational space opera',
					url: 'https://legacy.drivethrurpg.com/product/568411/Brighter-Stars?manufacturers_id=31866',
					image: 'https://legacy.drivethrurpg.com/images/31866/568411.jpg',
					quote: 'The mission was supposed to last ten years. There were supposed to be answers at the end of it.',
					setting: 'd6',
					prep: 'd6',
					complexity: 'd6',
				},
			},
			traitSets: [
				{
					id: 'name',
					name: 'Name',
					view: {
						style: {
							header: 'default',
							body: 'name',
						},
						page: 1,
					},
					traits: [
						{
							name: 'name',
							label: 'Name',
							traits: [],
						},
						{
							name: 'player',
							label: 'Player',
							traits: [],
						},
						{
							name: 'nickname',
							label: 'Nickname',
							traits: [],
						},
						{
							name: 'pronouns',
							label: 'Pronouns',
							traits: [],
						},
						{
							name: 'description',
							label: 'Description',
							traits: [],
						},
						{
							name: 'game',
							label: 'Game',
							view: {
								visibility: 'hidden',
							},
							traits: [],
						},
						{
							name: 'portrait',
							traits: [],
						},
						{
							name: 'caption',
							traits: [],
						},
						{
							name: 'plotPoints',
							rating: {
								type: 'Counter',
								value: [1],
								range: [0, 20],
							},
							label: 'PP',
							spendable: true,
							view: {
								visibility: 'hidden',
							},
							traits: [],
						},
						{
							name: 'notes',
							view: {
								visibility: 'hidden',
							},
							traits: [],
						},
					],
				},
				{
					id: 'distinctions',
					name: 'Distinctions',
					description: 'Crew role, quality, and personal drive',
					view: {
						features: {
							description: true,
							sfx: true,
							subtraits: false,
						},
						page: 1,
						multiDie: false,
						ratingLadder: [8],
						notes: "Gain a PP when you trade out your distinction's d8 rating for a d4.",
						reservedSlots: 3,
						place: {
							left: '0%',
							top: 0,
							width: '64%',
							height: 1,
						},
						pillar: 'prime',
						altRoll: {
							die: 4,
							ppDelta: 1,
							label: 'Hinder',
						},
					},
					noun: 'Distinction',
					plural: 'Distinctions',
					traits: [
						{
							name: 'Purpose:',
							rating: {
								type: 'Die',
								value: [8],
								range: [4, 6, 8, 10, 12],
							},
							traits: [
								{
									name: 'Hinder',
									rating: {
										type: 'Die',
										value: [4],
										range: [4],
									},
									traits: [],
									noun: 'SFX',
									ppDelta: 1,
								},
							],
							view: {
								badge: {
									text: 'SFX',
									shape: 'vertical-bar',
									color: 'black',
								},
								prompt: true,
							},
						},
						{
							name: 'Quality:',
							rating: {
								type: 'Die',
								value: [8],
								range: [4, 6, 8, 10, 12],
							},
							traits: [
								{
									name: 'Hinder',
									rating: {
										type: 'Die',
										value: [4],
										range: [4],
									},
									traits: [],
									noun: 'SFX',
									ppDelta: 1,
								},
							],
							view: {
								badge: {
									text: 'SFX',
									shape: 'vertical-bar',
									color: 'black',
								},
								prompt: true,
							},
						},
						{
							name: '',
							rating: {
								type: 'Die',
								value: [8],
								range: [4, 6, 8, 10, 12],
							},
							traits: [
								{
									name: 'Hinder',
									rating: {
										type: 'Die',
										value: [4],
										range: [4],
									},
									traits: [],
									noun: 'SFX',
									ppDelta: 1,
								},
							],
							view: {
								badge: {
									text: 'SFX',
									shape: 'vertical-bar',
									color: 'black',
								},
							},
						},
					],
				},
				{
					id: 'values',
					name: 'Values',
					description: 'Guiding philosophies paired with personal statements',
					statement: true,
					hasQuestionedPip: true,
					view: {
						features: {
							description: true,
							sfx: false,
							subtraits: false,
						},
						page: 1,
						style: {
							header: 'default',
							body: 'default',
						},
						multiDie: false,
						ratingLadder: [4, 6, 8, 10, 12],
						notes: '',
						reservedSlots: 5,
						place: {
							left: '0%',
							top: 1,
							width: '64%',
							height: 1,
						},
						pillar: 'prime',
						fixedNames: true,
					},
					noun: 'Value',
					plural: 'Values',
					traits: [
						{
							name: 'Courage',
							traits: [],
						},
						{
							name: 'Curiosity',
							traits: [],
						},
						{
							name: 'Hope',
							traits: [],
						},
						{
							name: 'Logic',
							traits: [],
						},
						{
							name: 'Peace',
							traits: [],
						},
					],
				},
				{
					id: 'relationships',
					name: 'Relationships',
					description: 'Crew connections and ties to shipmates',
					statement: true,
					view: {
						header: 'top',
						headerAlign: 'left',
						features: {
							description: true,
							sfx: false,
							subtraits: false,
						},
						page: 1,
						style: {
							header: 'default',
							body: 'default',
						},
						multiDie: false,
						ratingLadder: [4, 6, 8, 10, 12],
						notes: '',
						reservedSlots: 8,
						place: {
							left: '0%',
							top: 2,
							width: '64%',
							height: 1,
						},
						parts: {
							name: {
								left: '0%',
								top: 0,
								width: '100%',
								height: 1,
							},
							rating: {
								left: '0%',
								top: 1,
								width: '100%',
								height: 1,
							},
						},
						pillar: 'prime',
					},
					noun: 'Relationship',
					plural: 'Relationships',
					traits: [],
				},
				{
					id: 'signature-assets',
					name: 'Signature Assets',
					description: 'Specialized starship equipment and personal gear',
					view: {
						features: {
							description: true,
							sfx: false,
							subtraits: false,
						},
						page: 1,
						style: {
							header: 'default',
							body: 'default',
						},
						multiDie: false,
						ratingLadder: [6, 8, 10, 12],
						notes: '',
						reservedSlots: 3,
						place: {
							left: '64%',
							top: 0,
							width: '36%',
							height: 1,
						},
						parts: {
							rating: {
								left: '0%',
								top: 0,
								width: '100%',
								height: 1,
							},
							name: {
								left: '0%',
								top: 1,
								width: '100%',
								height: 1,
							},
						},
						pillar: 'plus',
					},
					noun: 'Signature Asset',
					plural: 'Signature Assets',
					traits: [],
				},
				{
					id: 'personal-milestones',
					name: 'Personal Milestones',
					view: {
						header: 'top',
						headerAlign: 'left',
						features: {
							description: true,
							sfx: false,
							subtraits: false,
						},
						page: 1,
						style: {
							header: 'default',
							body: 'default',
						},
						multiDie: false,
						ratingLadder: [],
						reservedSlots: 3,
						place: {
							left: '64%',
							top: 1,
							width: '36%',
							height: 1,
						},
						parts: {
							rating: {
								left: '0%',
								top: 0,
								width: '10%',
								height: 1,
							},
							name: {
								left: '10%',
								top: 0,
								width: '90%',
								height: 1,
							},
							description: {
								left: '0%',
								top: 1,
								width: '100%',
								height: 1,
							},
						},
						pillar: 'plus',
					},
					noun: 'Milestone',
					plural: 'Milestones',
					traits: [
						{
							name: '1 XP',
							rating: {
								type: 'Pip',
								value: [false],
							},
							traits: [],
						},
						{
							name: '3 XP',
							rating: {
								type: 'Pip',
								value: [false],
							},
							traits: [],
						},
						{
							name: '10 XP',
							rating: {
								type: 'Pip',
								value: [false],
							},
							traits: [],
						},
					],
				},
				{
					id: 'group-milestones',
					name: 'Group Milestones',
					view: {
						header: 'top',
						headerAlign: 'left',
						features: {
							description: true,
							sfx: false,
							subtraits: false,
						},
						page: 1,
						style: {
							header: 'default',
							body: 'default',
						},
						multiDie: false,
						ratingLadder: [],
						reservedSlots: 3,
						place: {
							left: '64%',
							top: 2,
							width: '36%',
							height: 1,
						},
						parts: {
							rating: {
								left: '0%',
								top: 0,
								width: '10%',
								height: 1,
							},
							name: {
								left: '10%',
								top: 0,
								width: '90%',
								height: 1,
							},
							description: {
								left: '0%',
								top: 1,
								width: '100%',
								height: 1,
							},
						},
						pillar: 'plus',
					},
					noun: 'Milestone',
					plural: 'Milestones',
					traits: [
						{
							name: '1 XP',
							rating: {
								type: 'Pip',
								value: [false],
							},
							traits: [],
						},
						{
							name: '3 XP',
							rating: {
								type: 'Pip',
								value: [false],
							},
							traits: [],
						},
						{
							name: '10 XP',
							rating: {
								type: 'Pip',
								value: [false],
							},
							traits: [],
						},
					],
				},
				{
					id: 'xp',
					name: 'XP',
					description: 'Experience points bubble track',
					view: {
						features: {
							description: false,
							sfx: false,
							subtraits: false,
						},
						page: 1,
						style: {
							header: 'default',
							body: 'pips',
						},
						pips: {
							perRow: 5,
							connected: true,
						},
						reservedSlots: 0,
						place: {
							left: '64%',
							top: 3,
							width: '36%',
							height: 1,
						},
						pillar: 'play',
					},
					rating: {
						type: 'Pip',
						value: [
							false,
							false,
							false,
							false,
							false,
							false,
							false,
							false,
							false,
							false,
							false,
							false,
							false,
							false,
							false,
							false,
							false,
							false,
							false,
							false,
							false,
							false,
							false,
							false,
							false,
						],
					},
					noun: 'XP',
					plural: 'XP',
					traits: [],
				},
			],
		},
	},
	{
		id: 'camp-bewilderwood',
		version: 1,
		character: {
			$schema: '../schema/0.1/character.schema.json',
			version: '0.1',
			id: 'template-camp-bewilderwood',
			isTemplate: true,
			name: '',
			game: 'Camp Bewilderwood',
			description: '',
			pronouns: '',
			plotPoints: 1,
			notes: '',
			player: '',
			portrait: {
				url: '',
				view: {
					location: 'header',
				},
			},
			view: {
				pageCount: 1,
				template: 'Camp Bewilderwood',
				watermark: {
					enabled: true,
					url: 'images/cortex_prime_logo_light_transparent.png',
					opacity: 0.08,
					scale: 70,
					page: 'all',
				},
				columnAlignment: 'top-base',
				columnOffsets: {
					left: 0,
					center: 0,
					right: 0,
				},
				listing: {
					subtitle: 'Cryptid Summer Camp Mystery',
					genre: 'Supernatural summer camp / YA adventure',
					variant: 'Camper File',
					url: 'https://legacy.drivethrurpg.com/product/574554/Camp-Bewilderwood?manufacturers_id=31866',
					image: 'https://legacy.drivethrurpg.com/images/31866/574554.jpg',
					quote: 'Someone has decided you’re destined for great things. You’re twelve.',
					setting: 'd8',
					prep: 'd6',
					complexity: 'd8',
				},
			},
			traitSets: [
				{
					id: 'name',
					name: 'Name',
					view: {
						style: {
							header: 'default',
							body: 'name',
						},
						page: 1,
					},
					traits: [
						{
							name: 'name',
							label: 'Name',
							traits: [],
						},
						{
							name: 'player',
							label: 'Player',
							traits: [],
						},
						{
							name: 'nickname',
							label: 'Nickname',
							traits: [],
						},
						{
							name: 'pronouns',
							label: 'Pronouns',
							traits: [],
						},
						{
							name: 'description',
							label: 'Description',
							traits: [],
						},
						{
							name: 'game',
							label: 'Game',
							view: {
								visibility: 'hidden',
							},
							traits: [],
						},
						{
							name: 'portrait',
							traits: [],
						},
						{
							name: 'caption',
							traits: [],
						},
						{
							name: 'plotPoints',
							rating: {
								type: 'Counter',
								value: [1],
								range: [0, 20],
							},
							label: 'PP',
							spendable: true,
							view: {
								visibility: 'hidden',
							},
							traits: [],
						},
						{
							name: 'notes',
							view: {
								visibility: 'hidden',
							},
							traits: [],
						},
					],
				},
				{
					id: 'distinctions',
					name: 'Distinctions',
					description: 'Camp background, camper reputation, and hidden destiny',
					view: {
						features: {
							description: true,
							sfx: true,
							subtraits: false,
						},
						page: 1,
						multiDie: false,
						notes: "Hinder: Gain a PP when you trade out your distinction's d8 rating for a d4.",
						reservedSlots: 3,
						place: {
							left: '0%',
							top: 0,
							width: '66%',
							height: 1,
						},
						parts: {
							name: {
								left: '0%',
								top: 0,
								width: '70%',
								height: 1,
							},
							rating: {
								left: '70%',
								top: 0,
								width: '30%',
								height: 1,
							},
							description: {
								left: '0%',
								top: 1,
								width: '100%',
								height: 1,
							},
							block: {
								left: '0%',
								top: 3,
								width: '100%',
								height: 1,
							},
							badge: {
								left: '0%',
								top: 2,
								width: '100%',
								height: 1,
							},
						},
						pillar: 'prime',
						altRoll: {
							die: 4,
							ppDelta: 1,
							label: 'Hinder',
						},
					},
					noun: 'Distinction',
					plural: 'Distinctions',
					traits: [
						{
							name: 'HERITAGE:',
							rating: {
								type: 'Die',
								value: [8],
								range: [4, 6, 8, 10, 12],
							},
							traits: [
								{
									name: 'Heritage',
									description: 'Spend a PP to step up an attribute when you connect to your heritage.',
									traits: [],
									noun: 'SFX',
								},
							],
							view: {
								badge: {
									text: 'SFX',
									shape: 'vertical-bar',
									color: 'black',
								},
								prompt: true,
							},
						},
						{
							name: 'DESTINY:',
							rating: {
								type: 'Die',
								value: [8],
								range: [4, 6, 8, 10, 12],
							},
							traits: [
								{
									name: 'Destiny',
									description: 'Spend a PP to reroll your dice when you embrace your destiny.',
									traits: [],
									noun: 'SFX',
								},
							],
							view: {
								badge: {
									text: 'SFX',
									shape: 'vertical-bar',
									color: 'black',
								},
								prompt: true,
							},
						},
						{
							name: 'CAMP REPUTATION:',
							rating: {
								type: 'Die',
								value: [8],
								range: [4, 6, 8, 10, 12],
							},
							traits: [
								{
									name: 'Camp Reputation',
									description: "Spend a PP to create a d8 asset linked to the thing you're known for.",
									traits: [],
									noun: 'SFX',
								},
							],
							view: {
								badge: {
									text: 'SFX',
									shape: 'vertical-bar',
									color: 'black',
								},
								prompt: true,
							},
						},
					],
				},
				{
					id: 'values',
					name: 'Values',
					description: 'Camper ideals and loyalties',
					statement: true,
					hasQuestionedPip: true,
					view: {
						features: {
							description: true,
							sfx: false,
							subtraits: false,
						},
						page: 1,
						style: {
							header: 'default',
							body: 'default',
						},
						ratingLadder: [4, 6, 8, 10, 12],
						multiDie: false,
						notes: '',
						reservedSlots: 5,
						place: {
							left: '0%',
							top: 1,
							width: '66%',
							height: 1,
						},
						parts: {
							name: {
								left: '0%',
								top: 0,
								width: '70%',
								height: 1,
							},
							rating: {
								left: '70%',
								top: 0,
								width: '30%',
								height: 1,
							},
						},
						pillar: 'prime',
						fixedNames: true,
					},
					noun: 'Value',
					plural: 'Values',
					traits: [
						{
							name: 'Bravery',
							traits: [],
						},
						{
							name: 'Community',
							traits: [],
						},
						{
							name: 'Curiosity',
							traits: [],
						},
						{
							name: 'Friendship',
							traits: [],
						},
						{
							name: 'Mischief',
							traits: [],
						},
					],
				},
				{
					id: 'signature-assets',
					name: 'Signature Assets',
					description: 'Treasured camper keepsakes and scavenged relics',
					view: {
						features: {
							description: true,
							sfx: false,
							subtraits: false,
						},
						page: 1,
						style: {
							header: 'default',
							body: 'default',
						},
						ratingLadder: [6, 8, 10, 12],
						multiDie: false,
						notes: '',
						reservedSlots: 3,
						place: {
							left: '66%',
							top: 0,
							width: '34%',
							height: 1,
						},
						parts: {
							rating: {
								left: '0%',
								top: 0,
								width: '100%',
								height: 1,
							},
							name: {
								left: '0%',
								top: 1,
								width: '100%',
								height: 1,
							},
						},
						pillar: 'plus',
					},
					noun: 'Signature Asset',
					plural: 'Signature Assets',
					traits: [],
				},
				{
					id: 'attributes',
					name: 'Attributes',
					description: 'Core camper capability ratings',
					view: {
						features: {
							description: false,
							sfx: false,
							subtraits: false,
						},
						page: 1,
						style: {
							header: 'default',
							body: 'default',
						},
						ratingLadder: [6, 8, 10, 12],
						multiDie: false,
						notes: '',
						reservedSlots: 3,
						place: {
							left: '66%',
							top: 1,
							width: '34%',
							height: 1,
						},
						parts: {
							name: {
								left: '0%',
								top: 0,
								width: '100%',
								height: 1,
							},
							rating: {
								left: '0%',
								top: 1,
								width: '100%',
								height: 1,
							},
						},
						pillar: 'prime',
						fixedNames: true,
					},
					noun: 'Attribute',
					plural: 'Attributes',
					traits: [
						{
							name: 'Mental',
							traits: [],
						},
						{
							name: 'Physical',
							traits: [],
						},
						{
							name: 'Social',
							traits: [],
						},
					],
				},
				{
					id: 'paired-slots',
					name: 'Standing',
					description: 'Camp social standing with complication and bonus dice',
					statement: true,
					view: {
						features: {
							description: true,
							sfx: false,
							subtraits: true,
						},
						page: 1,
						ratingLadder: [4, 6, 8, 10, 12],
						subtraitRatingLadder: [4, 6, 8, 10, 12],
						multiDie: false,
						notes: '',
						reservedSlots: 6,
						place: {
							left: '0%',
							top: 2,
							width: '40%',
							height: 1,
						},
						labels: {
							slot0: 'COMPLICATION',
							slot1: 'BONUS',
						},
						pillar: 'plus',
						parts: {
							name: {
								left: '0%',
								top: 0,
								width: '50%',
								height: 1,
							},
							'child:Statement': {
								left: '50%',
								top: 0,
								width: '50%',
								height: 1,
							},
						},
					},
					noun: 'Standing',
					plural: 'Standings',
					traits: [
						{
							name: '',
							traits: [
								{
									name: 'COMPLICATION',
									traits: [],
								},
								{
									name: 'BONUS',
									traits: [],
								},
							],
						},
						{
							name: '',
							traits: [
								{
									name: 'COMPLICATION',
									traits: [],
								},
								{
									name: 'BONUS',
									traits: [],
								},
							],
						},
						{
							name: '',
							traits: [
								{
									name: 'COMPLICATION',
									traits: [],
								},
								{
									name: 'BONUS',
									traits: [],
								},
							],
						},
						{
							name: '',
							traits: [
								{
									name: 'COMPLICATION',
									traits: [],
								},
								{
									name: 'BONUS',
									traits: [],
								},
							],
						},
						{
							name: '',
							traits: [
								{
									name: 'COMPLICATION',
									traits: [],
								},
								{
									name: 'BONUS',
									traits: [],
								},
							],
						},
						{
							name: '',
							traits: [
								{
									name: 'COMPLICATION',
									traits: [],
								},
								{
									name: 'BONUS',
									traits: [],
								},
							],
						},
					],
				},
				{
					id: 'badges',
					name: 'Badges',
					description: 'Merit badges earned at camp',
					counterLabel: 'XP',
					view: {
						features: {
							description: false,
							sfx: false,
							subtraits: false,
						},
						header: 'top',
						page: 1,
						style: {
							header: 'default',
							body: 'die-rows',
						},
						counterLabel: 'XP',
						ratingLadder: [6, 8, 10, 12],
						multiDie: false,
						notes: '',
						reservedSlots: 17,
						place: {
							left: '40%',
							top: 2,
							width: '60%',
							height: 1,
						},
						pillar: 'plus',
					},
					noun: 'Badge',
					plural: 'Badges',
					traits: [],
				},
				{
					id: 'talents',
					name: 'Talents',
					description: 'Camper knacks and signature tricks',
					view: {
						features: {
							description: true,
							sfx: true,
							subtraits: false,
						},
						page: 1,
						multiDie: false,
						notes: '',
						reservedSlots: 2,
						labels: {
							col1: 'TALENT',
							col2: 'ACTIVATION',
							col3: 'EFFECT',
						},
						pillar: 'plus',
						parts: {
							name: {
								left: '0%',
								top: 0,
								width: '28%',
								height: 1,
							},
							description: {
								left: '28%',
								top: 0,
								width: '33%',
								height: 1,
							},
							'child:SFX': {
								left: '61%',
								top: 0,
								width: '39%',
								height: 1,
							},
						},
					},
					noun: 'Talent',
					plural: 'Talents',
					traits: [],
				},
			],
		},
	},
	{
		id: 'cosa-nostra',
		version: 1,
		character: {
			$schema: '../schema/0.1/character.schema.json',
			version: '0.1',
			id: 'template-cosa-nostra',
			isTemplate: true,
			name: '',
			game: 'Cosa Nostra',
			description: '',
			pronouns: '',
			plotPoints: 1,
			notes: '',
			player: '',
			portrait: {
				url: '',
				view: {
					location: 'header',
				},
			},
			view: {
				pageCount: 1,
				template: 'Cosa Nostra',
				hasNickname: true,
				watermark: {
					enabled: true,
					url: 'images/cortex_prime_logo_light_transparent.png',
					opacity: 0.08,
					scale: 70,
					page: 'all',
				},
				columnAlignment: 'top-base',
				columnOffsets: {
					left: 0,
					center: 0,
					right: 0,
				},
				listing: {
					subtitle: 'Historical Crime Syndicate Drama',
					genre: 'Historical Crime Drama',
					variant: 'Mobster File',
					url: 'https://legacy.drivethrurpg.com/product/572308/Cosa-Nostra?manufacturers_id=31866',
					image: 'https://legacy.drivethrurpg.com/images/31866/572308.jpg',
					quote: 'The Castellammarese War is coming. Everyone in the Five Families knows it.',
					setting: 'd8',
					prep: 'd6',
					complexity: 'd8',
				},
			},
			traitSets: [
				{
					id: 'name',
					name: 'Name',
					view: {
						style: {
							header: 'default',
							body: 'name',
						},
						page: 1,
					},
					traits: [
						{
							name: 'name',
							label: 'Name',
							traits: [],
						},
						{
							name: 'player',
							label: 'Player',
							traits: [],
						},
						{
							name: 'nickname',
							label: 'Nickname',
							traits: [],
						},
						{
							name: 'pronouns',
							label: 'Pronouns',
							traits: [],
						},
						{
							name: 'description',
							label: 'Description',
							traits: [],
						},
						{
							name: 'game',
							label: 'Game',
							view: {
								visibility: 'hidden',
							},
							traits: [],
						},
						{
							name: 'portrait',
							traits: [],
						},
						{
							name: 'caption',
							traits: [],
						},
						{
							name: 'plotPoints',
							rating: {
								type: 'Counter',
								value: [1],
								range: [0, 20],
							},
							label: 'PP',
							spendable: true,
							view: {
								visibility: 'hidden',
							},
							traits: [],
						},
						{
							name: 'notes',
							view: {
								visibility: 'hidden',
							},
							traits: [],
						},
					],
				},
				{
					id: 'distinctions',
					name: 'Distinctions',
					description: 'Origins and syndicate reputation (Distinction Stress: Shaken, Rattled, Broken)',
					view: {
						features: {
							description: true,
							sfx: false,
							subtraits: false,
						},
						traitColumns: 3,
						page: 1,
						ratingLadder: [8, 10, 12],
						multiDie: false,
						notes:
							"Gain a PP when you trade out your distinction's die rating for a d4.\nShaken: When a distinction's stress rating is higher than its die rating, you may only keep one die for your result when using that distinction.",
						reservedSlots: 3,
						parts: {
							name: {
								left: '0%',
								top: 0,
								width: '42%',
								height: 1,
							},
							rating: {
								left: '42%',
								top: 0,
								width: '18%',
								height: 1,
							},
							trackLabel: {
								left: '60%',
								top: 0,
								width: '13%',
								height: 1,
							},
							track: {
								left: '73%',
								top: 0,
								width: '27%',
								height: 1,
							},
							description: {
								left: '0%',
								top: 1,
								width: '100%',
								height: 1,
							},
						},
						pillar: 'prime',
						altRoll: {
							die: 4,
							ppDelta: 1,
							label: 'Hinder',
						},
					},
					noun: 'Distinction',
					plural: 'Distinctions',
					traits: [
						{
							name: 'Neighborhood',
							traits: [],
						},
						{
							name: 'Crew',
							traits: [],
						},
						{
							name: 'The Family',
							traits: [],
						},
					],
				},
				{
					id: 'resources',
					name: 'Resources',
					description: 'Syndicate operational pools and assets',
					view: {
						features: {
							description: true,
							sfx: false,
							subtraits: false,
						},
						page: 1,
						style: {
							header: 'default',
							body: 'dice-count',
						},
						ratingLadder: [6, 8, 10, 12],
						multiDie: true,
						notes: '',
						reservedSlots: 6,
						place: {
							left: '0%',
							top: 1,
							width: '66.663%',
							height: 1,
						},
						labels: {
							rating: 'RATING',
							dice: '/ DICE',
						},
						pillar: 'plus',
					},
					noun: 'Resource',
					plural: 'Resources',
					traits: [],
				},
				{
					id: 'drives',
					name: 'Drives',
					description: 'Gain a PP when you use a drive rated at d4.',
					view: {
						header: 'top',
						headerAlign: 'center',
						features: {
							description: false,
							sfx: false,
							subtraits: false,
						},
						page: 1,
						style: {
							header: 'default',
							body: 'default',
						},
						ratingLadder: [4, 6, 8, 10, 12],
						multiDie: false,
						notes: '',
						reservedSlots: 5,
						place: {
							left: '0%',
							top: 2,
							width: '33.333%',
							height: 1,
						},
						parts: {
							name: {
								left: '0%',
								top: 0,
								width: '100%',
								height: 1,
							},
							rating: {
								left: '0%',
								top: 1,
								width: '100%',
								height: 1,
							},
						},
						pillar: 'prime',
						fixedNames: true,
					},
					noun: 'Drive',
					plural: 'Drives',
					traits: [
						{
							name: 'Corruption',
							traits: [],
						},
						{
							name: 'Greed',
							traits: [],
						},
						{
							name: 'Omerta',
							traits: [],
						},
						{
							name: 'Retribution',
							traits: [],
						},
						{
							name: 'Violence',
							traits: [],
						},
					],
				},
				{
					id: 'signature-assets',
					name: 'Signature Assets',
					description: 'Personal weapons, vehicles, and syndicate perks',
					view: {
						header: 'top',
						headerAlign: 'center',
						features: {
							description: false,
							sfx: false,
							subtraits: false,
						},
						page: 1,
						style: {
							header: 'default',
							body: 'default',
						},
						ratingLadder: [6, 8, 10, 12],
						multiDie: false,
						notes: '',
						reservedSlots: 3,
						place: {
							left: '0%',
							top: 3,
							width: '33.333%',
							height: 1,
						},
						parts: {
							name: {
								left: '0%',
								top: 0,
								width: '76%',
								height: 1,
							},
							rating: {
								left: '76%',
								top: 0,
								width: '24%',
								height: 1,
							},
						},
						pillar: 'plus',
					},
					noun: 'Signature Asset',
					plural: 'Signature Assets',
					traits: [],
				},
				{
					id: 'roles-specialties',
					name: 'Roles & Specialties',
					description: 'Syndicate roles with specialized criminal expertise',
					view: {
						header: 'top',
						headerAlign: 'center',
						features: {
							description: false,
							sfx: false,
							subtraits: true,
						},
						page: 1,
						style: {
							header: 'default',
							body: 'subtrait-columns',
						},
						ratingLadder: [4, 6, 8, 10, 12],
						multiDie: false,
						notes: '',
						reservedSlots: 5,
						place: {
							left: '33.333%',
							top: 2,
							width: '66.667%',
							height: 1,
						},
						labels: {
							left: 'SKILL',
							right: 'SPECIALTIES',
						},
						pillar: 'prime',
						fixedNames: true,
					},
					noun: 'Role',
					plural: 'Roles',
					traits: [
						{
							name: 'Big Shot',
							traits: [],
						},
						{
							name: 'Brains',
							traits: [],
						},
						{
							name: 'Enforcer',
							traits: [],
						},
						{
							name: 'Thief',
							traits: [],
						},
						{
							name: 'Wheelman',
							traits: [],
						},
					],
				},
				{
					id: 'session-record',
					name: 'Session Record',
					description: 'Session tracking and milestone progression',
					view: {
						header: 'top',
						headerAlign: 'left',
						features: {
							description: false,
							sfx: false,
							subtraits: false,
						},
						page: 1,
						style: {
							header: 'default',
							body: 'pips',
						},
						multiDie: false,
						notes: '',
						reservedSlots: 15,
						place: {
							left: '66.663%',
							top: 1,
							width: '33.334%',
							height: 1,
						},
						pips: {
							labels: true,
							perRow: 1,
						},
						pillar: 'play',
					},
					rating: {
						type: 'Pip',
						value: [
							false,
							false,
							false,
							false,
							false,
							false,
							false,
							false,
							false,
							false,
							false,
							false,
							false,
							false,
							false,
						],
					},
					noun: 'Session',
					plural: 'Sessions',
					traits: [],
				},
				{
					id: 'role-sfx',
					name: 'Role SFX',
					view: {
						header: 'top',
						headerAlign: 'center',
						features: {
							description: true,
							sfx: false,
							subtraits: false,
						},
						page: 1,
						style: {
							header: 'default',
							body: 'default',
						},
						reservedSlots: 3,
						place: {
							left: '33.333%',
							top: 3,
							width: '66.667%',
							height: 1,
						},
						pillar: 'plus',
					},
					noun: 'SFX',
					plural: 'SFX',
					traits: [],
				},
			],
		},
	},
	{
		id: 'eidolon-alpha',
		version: 1,
		character: {
			$schema: '../schema/0.1/character.schema.json',
			version: '0.1',
			id: 'template-eidolon-alpha',
			isTemplate: true,
			name: '',
			game: 'Eidolon Alpha',
			description: '',
			pronouns: '',
			plotPoints: 1,
			notes: '',
			player: '',
			portrait: {
				url: '',
				view: {
					location: 'header',
				},
			},
			view: {
				pageCount: 1,
				template: 'Eidolon Alpha',
				columnAlignment: 'top-base',
				columnOffsets: {
					left: 0,
					center: 0,
					right: 0,
				},
				listing: {
					subtitle: 'Mythic Summoners & Living Eidolons',
					genre: 'Fantasy / Summoning / Mythic',
					url: 'https://legacy.drivethrurpg.com/product/567041/Cortex-Prime-Game-Handbook-2nd-Edition?manufacturers_id=31866',
				},
			},
			traitSets: [
				{
					id: 'name',
					name: 'Name',
					view: {
						style: {
							header: 'default',
							body: 'name',
						},
						page: 1,
					},
					traits: [
						{
							name: 'name',
							label: 'Name',
							traits: [],
						},
						{
							name: 'player',
							label: 'Player',
							traits: [],
						},
						{
							name: 'nickname',
							label: 'Nickname',
							traits: [],
						},
						{
							name: 'pronouns',
							label: 'Pronouns',
							traits: [],
						},
						{
							name: 'description',
							label: 'Description',
							traits: [],
						},
						{
							name: 'game',
							label: 'Game',
							view: {
								visibility: 'hidden',
							},
							traits: [],
						},
						{
							name: 'portrait',
							traits: [],
						},
						{
							name: 'caption',
							traits: [],
						},
						{
							name: 'plotPoints',
							rating: {
								type: 'Counter',
								value: [1],
								range: [0, 20],
							},
							label: 'PP',
							spendable: true,
							view: {
								visibility: 'hidden',
							},
							traits: [],
						},
						{
							name: 'notes',
							view: {
								visibility: 'hidden',
							},
							traits: [],
						},
					],
				},
				{
					id: 'roles',
					name: 'Roles',
					description: 'Prime vocations and endarch callings',
					view: {
						features: {
							description: false,
							sfx: false,
							subtraits: false,
						},
						page: 1,
						style: {
							header: 'default',
							body: 'default',
						},
						multiDie: false,
						ratingLadder: [4, 6, 8, 10, 12],
						notes: '',
						reservedSlots: 4,
						place: {
							left: '0%',
							top: 0,
							width: '30%',
							height: 1,
						},
						parts: {
							name: {
								left: '0%',
								top: 0,
								width: '100%',
								height: 1,
							},
							rating: {
								left: '0%',
								top: 1,
								width: '100%',
								height: 1,
							},
						},
						pillar: 'prime',
						fixedNames: true,
					},
					noun: 'Role',
					plural: 'Roles',
					traits: [
						{
							name: 'Warrior',
							traits: [],
						},
						{
							name: 'Priest',
							traits: [],
						},
						{
							name: 'Scout',
							traits: [],
						},
						{
							name: 'Other',
							traits: [],
						},
					],
				},
				{
					id: 'attributes',
					name: 'Attributes',
					description: 'Elemental selfhood with highlight circles and stress',
					hasQuestionedPip: true,
					view: {
						features: {
							description: false,
							sfx: false,
							subtraits: false,
						},
						page: 1,
						style: {
							header: 'default',
							body: 'default',
						},
						multiDie: false,
						ratingLadder: [4, 6, 8, 10, 12],
						notes: '',
						reservedSlots: 5,
						place: {
							left: '0%',
							top: 1,
							width: '30%',
							height: 1,
						},
						parts: {
							name: {
								left: '0%',
								top: 0,
								width: '100%',
								height: 1,
							},
							rating: {
								left: '0%',
								top: 1,
								width: '100%',
								height: 1,
							},
							trackLabel: {
								left: '0%',
								top: 2,
								width: '100%',
								height: 1,
							},
							track: {
								left: '0%',
								top: 3,
								width: '100%',
								height: 1,
							},
						},
						labels: {
							stress: 'STRESS',
						},
						pillar: 'prime',
						fixedNames: true,
					},
					noun: 'Attribute',
					plural: 'Attributes',
					traits: [
						{
							name: 'Courage',
							traits: [],
						},
						{
							name: 'Grace',
							traits: [],
						},
						{
							name: 'Guile',
							traits: [],
						},
						{
							name: 'Reason',
							traits: [],
						},
						{
							name: 'Vigor',
							traits: [],
						},
					],
				},
				{
					id: 'endarch-distinction',
					name: 'Endarch Distinction',
					description: 'Ancestral endarch patron and its three bound powers',
					view: {
						features: {
							description: true,
							sfx: true,
							subtraits: true,
						},
						page: 1,
						multiDie: false,
						ratingLadder: [8],
						subtraitRatingLadder: [8],
						notes: '',
						reservedSlots: 1,
						place: {
							left: '30%',
							top: 0,
							width: '60%',
							height: 1,
						},
						pillar: 'prime',
					},
					noun: 'Endarch Distinction',
					plural: 'Endarch Distinctions',
					traits: [
						{
							name: '',
							rating: {
								type: 'Die',
								value: [8],
								range: [4, 6, 8, 10, 12],
							},
							traits: [
								{
									name: 'Power 1',
									rating: {
										type: 'Die',
										value: [8],
										range: [4, 6, 8, 10, 12],
									},
									traits: [],
								},
								{
									name: 'Power 2',
									rating: {
										type: 'Die',
										value: [8],
										range: [4, 6, 8, 10, 12],
									},
									traits: [],
								},
								{
									name: 'Power 3',
									rating: {
										type: 'Die',
										value: [8],
										range: [4, 6, 8, 10, 12],
									},
									traits: [],
								},
								{
									name: 'Hinder',
									rating: {
										type: 'Die',
										value: [4],
										range: [4],
									},
									description: "Gain a PP when you switch out your endarch distinction's rating of d8 for a d4.",
									traits: [],
									noun: 'SFX',
									ppDelta: 1,
								},
								{
									name: 'Summon',
									description: 'Shut down this endarch distinction to summon your Eidolon on your next turn.',
									traits: [],
									noun: 'SFX',
								},
							],
							view: {
								badge: {
									text: 'SFX',
									shape: 'vertical-bar',
									color: 'black',
								},
							},
						},
					],
				},
				{
					id: 'summoned-eidolon',
					name: 'Summoned Eidolon',
					description: 'Manifested eidolon form: base trait, scale, powers, highlights',
					view: {
						header: 'top',
						headerAlign: 'center',
						features: {
							description: true,
							sfx: false,
							subtraits: true,
						},
						page: 1,
						style: {
							header: 'default',
							body: 'default',
						},
						multiDie: true,
						ratingLadder: [4, 8, 10, 12],
						notes: '',
						reservedSlots: 5,
						traitColumns: 3,
						place: {
							left: '30%',
							top: 1,
							width: '60%',
							height: 1,
						},
						pillar: 'plus',
						fixedNames: true,
					},
					noun: 'Eidolon Trait',
					plural: 'Eidolon Traits',
					traits: [
						{
							name: 'Base Trait',
							rating: {
								type: 'Dice',
								value: [10, 10],
								range: [4, 6, 8, 10, 12],
							},
							description: 'd10 d10 or d4 d4',
							spendable: true,
							traits: [],
						},
						{
							name: 'Scale',
							rating: {
								type: 'Die',
								value: [8],
								range: [4, 6, 8, 10, 12],
							},
							traits: [],
							keepsExtra: 1,
							view: {
								ringBadge: true,
							},
						},
						{
							name: 'Power 1',
							rating: {
								type: 'Die',
								value: [12],
								range: [4, 6, 8, 10, 12],
							},
							traits: [],
						},
						{
							name: 'Power 2',
							rating: {
								type: 'Die',
								value: [12],
								range: [4, 6, 8, 10, 12],
							},
							traits: [],
						},
						{
							name: 'Power 3',
							rating: {
								type: 'Die',
								value: [12],
								range: [4, 6, 8, 10, 12],
							},
							traits: [],
						},
						{
							name: 'Highlight Attribute 1',
							rating: {
								type: 'Die',
								value: [12],
								range: [4, 6, 8, 10, 12],
							},
							traits: [],
						},
						{
							name: 'Highlight Attribute 2',
							rating: {
								type: 'Die',
								value: [12],
								range: [4, 6, 8, 10, 12],
							},
							traits: [],
						},
					],
				},
				{
					id: 'role-freeform-distinctions',
					name: 'Role & Freeform Distinctions',
					description: 'Chosen calling and personal definition',
					view: {
						features: {
							description: true,
							sfx: true,
							subtraits: false,
						},
						page: 1,
						multiDie: false,
						ratingLadder: [8],
						notes: '',
						reservedSlots: 2,
						place: {
							left: '30%',
							top: 2,
							width: '60%',
							height: 1,
						},
						pillar: 'prime',
						fixedNames: true,
					},
					noun: 'Distinction',
					plural: 'Distinctions',
					traits: [
						{
							name: 'Role Distinction',
							rating: {
								type: 'Die',
								value: [8],
								range: [4, 6, 8, 10, 12],
							},
							traits: [
								{
									name: 'Hinder',
									rating: {
										type: 'Die',
										value: [4],
										range: [4],
									},
									traits: [],
									noun: 'SFX',
									ppDelta: 1,
								},
							],
							view: {
								badge: {
									text: 'SFX',
									shape: 'vertical-bar',
									color: 'black',
								},
							},
						},
						{
							name: 'Freeform Distinction',
							rating: {
								type: 'Die',
								value: [8],
								range: [4, 6, 8, 10, 12],
							},
							traits: [
								{
									name: 'Hinder',
									rating: {
										type: 'Die',
										value: [4],
										range: [4],
									},
									traits: [],
									noun: 'SFX',
									ppDelta: 1,
								},
							],
							view: {
								badge: {
									text: 'SFX',
									shape: 'vertical-bar',
									color: 'black',
								},
							},
						},
					],
				},
				{
					id: 'xp',
					name: 'XP',
					description: 'Experience points bubble track',
					view: {
						header: 'top',
						headerAlign: 'center',
						features: {
							description: false,
							sfx: false,
							subtraits: false,
						},
						page: 1,
						style: {
							header: 'default',
							body: 'pips',
						},
						multiDie: false,
						notes: '',
						reservedSlots: 0,
						pips: {
							perRow: 1,
							connected: false,
						},
						place: {
							left: '90%',
							top: 0,
							width: '10%',
							height: 3,
						},
						pillar: 'play',
					},
					rating: {
						type: 'Pip',
						value: [
							false,
							false,
							false,
							false,
							false,
							false,
							false,
							false,
							false,
							false,
							false,
							false,
							false,
							false,
							false,
							false,
							false,
							false,
							false,
							false,
						],
					},
					noun: 'XP',
					plural: 'XP',
					traits: [],
				},
			],
		},
	},
	{
		id: 'hammerheads-character',
		version: 1,
		character: {
			$schema: '../schema/0.1/character.schema.json',
			version: '0.1',
			id: 'template-hammerheads-character',
			isTemplate: true,
			name: '',
			game: 'Hammerheads',
			description: '',
			pronouns: '',
			plotPoints: 1,
			notes: '',
			player: '',
			portrait: {
				url: '',
				view: {
					location: 'header',
				},
			},
			view: {
				pageCount: 2,
				template: 'Hammerheads',
				watermark: {
					enabled: true,
					url: 'images/cortex_prime_logo_light_transparent.png',
					opacity: 0.08,
					scale: 70,
					page: 'all',
				},
				columnAlignment: 'top-base',
				columnOffsets: {
					left: 0,
					center: 0,
					right: 0,
				},
				listing: {
					subtitle: 'Disaster Response & Rescue Pilots',
					genre: 'Action / Rescue / Drama',
					url: 'https://legacy.drivethrurpg.com/product/567041/Cortex-Prime-Game-Handbook-2nd-Edition?manufacturers_id=31866',
				},
			},
			traitSets: [
				{
					id: 'name',
					name: 'Name',
					view: {
						style: {
							header: 'default',
							body: 'name',
						},
						page: 1,
					},
					traits: [
						{
							name: 'name',
							label: 'Name',
							traits: [],
						},
						{
							name: 'player',
							label: 'Player',
							traits: [],
						},
						{
							name: 'nickname',
							label: 'Nickname',
							traits: [],
						},
						{
							name: 'pronouns',
							label: 'Pronouns',
							traits: [],
						},
						{
							name: 'description',
							label: 'Description',
							traits: [],
						},
						{
							name: 'game',
							label: 'Game',
							view: {
								visibility: 'hidden',
							},
							traits: [],
						},
						{
							name: 'portrait',
							traits: [],
						},
						{
							name: 'caption',
							traits: [],
						},
						{
							name: 'plotPoints',
							rating: {
								type: 'Counter',
								value: [1],
								range: [0, 20],
							},
							label: 'PP',
							spendable: true,
							view: {
								visibility: 'hidden',
							},
							traits: [],
						},
						{
							name: 'notes',
							view: {
								visibility: 'hidden',
							},
							traits: [],
						},
					],
				},
				{
					id: 'attributes',
					name: 'Attributes',
					description: 'Body, mind, and presence under pressure',
					view: {
						features: {
							description: false,
							sfx: false,
							subtraits: false,
						},
						page: 1,
						style: {
							header: 'default',
							body: 'default',
						},
						ratingLadder: [4, 6, 8, 10, 12],
						multiDie: false,
						notes: '',
						reservedSlots: 3,
						place: {
							left: '0%',
							top: 0,
							width: '36%',
							height: 1,
						},
						parts: {
							name: {
								left: '0%',
								top: 0,
								width: '100%',
								height: 1,
							},
							rating: {
								left: '0%',
								top: 1,
								width: '100%',
								height: 1,
							},
							trackLabel: {
								left: '0%',
								top: 2,
								width: '100%',
								height: 1,
							},
							track: {
								left: '0%',
								top: 3,
								width: '100%',
								height: 1,
							},
						},
						labels: {
							stress: 'STRESS',
						},
						pillar: 'prime',
						fixedNames: true,
					},
					noun: 'Attribute',
					plural: 'Attributes',
					traits: [
						{
							name: 'Physical',
							traits: [],
						},
						{
							name: 'Mental',
							traits: [],
						},
						{
							name: 'Social',
							traits: [],
						},
					],
				},
				{
					id: 'training-packages',
					name: 'Training Packages',
					description: 'Rescue disciplines and vehicle qualifications',
					view: {
						features: {
							description: false,
							sfx: false,
							subtraits: false,
						},
						page: 1,
						style: {
							header: 'default',
							body: 'default',
						},
						ratingLadder: [4, 6, 8, 10, 12],
						multiDie: false,
						notes: '',
						reservedSlots: 14,
						place: {
							left: '0%',
							top: 1,
							width: '36%',
							height: 1,
						},
						parts: {
							name: {
								left: '0%',
								top: 0,
								width: '100%',
								height: 1,
							},
							rating: {
								left: '0%',
								top: 1,
								width: '100%',
								height: 1,
							},
						},
						pillar: 'prime',
					},
					noun: 'Training Package',
					plural: 'Training Packages',
					traits: [
						{
							name: 'Crowd Control',
							traits: [],
						},
						{
							name: 'Emergency Medical',
							traits: [],
						},
						{
							name: 'Firefighting',
							traits: [],
						},
						{
							name: 'Hammerhead Pilot',
							traits: [],
						},
						{
							name: 'HAZMAT',
							traits: [],
						},
						{
							name: 'High-Altitude Recovery',
							traits: [],
						},
						{
							name: 'Legal Specialist',
							traits: [],
						},
						{
							name: 'Logistics',
							traits: [],
						},
						{
							name: 'Marine Recovery',
							traits: [],
						},
						{
							name: 'Network Specialist',
							traits: [],
						},
						{
							name: 'Mechanic',
							traits: [],
						},
						{
							name: 'Tactical Response',
							traits: [],
						},
						{
							name: 'Technical Analyst',
							traits: [],
						},
						{
							name: 'Urban Recovery',
							traits: [],
						},
					],
				},
				{
					id: 'distinctions',
					name: 'Distinctions',
					description: 'Origin, true nature, and defining quirk',
					view: {
						features: {
							description: true,
							sfx: true,
							subtraits: false,
						},
						page: 1,
						ratingLadder: [8],
						multiDie: false,
						notes: '',
						reservedSlots: 3,
						place: {
							left: '36%',
							top: 0,
							width: '64%',
							height: 1,
						},
						pillar: 'prime',
					},
					noun: 'Distinction',
					plural: 'Distinctions',
					traits: [
						{
							name: 'Your Life Before:',
							rating: {
								type: 'Die',
								value: [8],
								range: [4, 6, 8, 10, 12],
							},
							traits: [
								{
									name: 'Hinder',
									rating: {
										type: 'Die',
										value: [4],
										range: [4],
									},
									description: "Gain a PP when you switch out your distinction's rating of d8 for a d4.",
									traits: [],
									noun: 'SFX',
									ppDelta: 1,
								},
								{
									name: 'Connect',
									description: 'Spend a PP to step up an attribute when you connect to your old life.',
									traits: [],
									noun: 'SFX',
								},
								{
									name: 'Overdrive',
									description:
										'Add d6 to the crisis pool to double your attribute die when you connect to your old life.',
									traits: [],
									noun: 'SFX',
								},
							],
							view: {
								badge: {
									text: 'SFX',
									shape: 'vertical-bar',
									color: 'black',
								},
								prompt: true,
							},
						},
						{
							name: 'Your Approach/Attitude:',
							rating: {
								type: 'Die',
								value: [8],
								range: [4, 6, 8, 10, 12],
							},
							traits: [
								{
									name: 'Hinder',
									rating: {
										type: 'Die',
										value: [4],
										range: [4],
									},
									description: "Gain a PP when you switch out your distinction's rating of d8 for a d4.",
									traits: [],
									noun: 'SFX',
									ppDelta: 1,
								},
								{
									name: 'True Nature',
									description: 'Spend a PP to reroll your dice when you align with your true nature.',
									traits: [],
									noun: 'SFX',
								},
								{
									name: 'Push Limits',
									description:
										'Add d6 to the crisis pool to step up your training package die when you align with your true nature.',
									traits: [],
									noun: 'SFX',
								},
							],
							view: {
								badge: {
									text: 'SFX',
									shape: 'vertical-bar',
									color: 'black',
								},
								prompt: true,
							},
						},
						{
							name: 'Your Quirk/Quality:',
							rating: {
								type: 'Die',
								value: [8],
								range: [4, 6, 8, 10, 12],
							},
							traits: [
								{
									name: 'Hinder',
									rating: {
										type: 'Die',
										value: [4],
										range: [4],
									},
									description: "Gain a PP when you switch out your distinction's rating of d8 for a d4.",
									traits: [],
									noun: 'SFX',
									ppDelta: 1,
								},
								{
									name: 'Embrace',
									description:
										'Spend a PP to double your relationship die when your assistance embraces your quirk or quality.',
									traits: [],
									noun: 'SFX',
								},
								{
									name: 'Escalate',
									description:
										'Add d6 to the crisis pool to step up a relationship die you include in your pool when you embrace your quirk or quality.',
									traits: [],
									noun: 'SFX',
								},
							],
							view: {
								badge: {
									text: 'SFX',
									shape: 'vertical-bar',
									color: 'black',
								},
								prompt: true,
							},
						},
					],
				},
				{
					id: 'relationships',
					name: 'Relationships',
					description: 'Crew bonds, debts, and troublemakers',
					statement: true,
					view: {
						features: {
							description: true,
							sfx: false,
							subtraits: false,
						},
						page: 1,
						style: {
							header: 'default',
							body: 'default',
						},
						ratingLadder: [4, 6, 8, 10, 12],
						multiDie: false,
						notes: '',
						reservedSlots: 7,
						place: {
							left: '36%',
							top: 1,
							width: '64%',
							height: 1,
						},
						parts: {
							name: {
								left: '0%',
								top: 0,
								width: '70%',
								height: 1,
							},
							rating: {
								left: '70%',
								top: 0,
								width: '30%',
								height: 1,
							},
						},
						pillar: 'prime',
					},
					noun: 'Relationship',
					plural: 'Relationships',
					traits: [
						{
							name: '',
							description: 'saved my life',
							traits: [
								{
									name: 'saved my life',
									rating: {
										type: 'Pip',
										value: [false],
									},
									traits: [],
									noun: 'Statement',
								},
							],
						},
						{
							name: '',
							description: 'owes me big',
							traits: [
								{
									name: 'owes me big',
									rating: {
										type: 'Pip',
										value: [false],
									},
									traits: [],
									noun: 'Statement',
								},
							],
						},
						{
							name: '',
							description: 'is a troublemaker',
							traits: [
								{
									name: 'is a troublemaker',
									rating: {
										type: 'Pip',
										value: [false],
									},
									traits: [],
									noun: 'Statement',
								},
							],
						},
						{
							name: '',
							description: 'knows their stuff',
							traits: [
								{
									name: 'knows their stuff',
									rating: {
										type: 'Pip',
										value: [false],
									},
									traits: [],
									noun: 'Statement',
								},
							],
						},
						{
							name: '',
							description: 'is a liability',
							traits: [
								{
									name: 'is a liability',
									rating: {
										type: 'Pip',
										value: [false],
									},
									traits: [],
									noun: 'Statement',
								},
							],
						},
						{
							name: '',
							description: 'is dependable',
							traits: [
								{
									name: 'is dependable',
									rating: {
										type: 'Pip',
										value: [false],
									},
									traits: [],
									noun: 'Statement',
								},
							],
						},
						{
							name: '',
							description: 'is good for a laugh',
							traits: [
								{
									name: 'is good for a laugh',
									rating: {
										type: 'Pip',
										value: [false],
									},
									traits: [],
									noun: 'Statement',
								},
							],
						},
					],
				},
				{
					id: 'xp',
					name: 'XP',
					description: 'Experience points bubble track',
					view: {
						header: 'top',
						headerAlign: 'center',
						features: {
							description: false,
							sfx: false,
							subtraits: false,
						},
						page: 1,
						style: {
							header: 'default',
							body: 'pips',
						},
						multiDie: false,
						notes: '',
						reservedSlots: 0,
						pips: {
							perRow: 10,
							connected: true,
						},
						place: {
							left: '36%',
							top: 2,
							width: '64%',
							height: 1,
						},
						pillar: 'play',
					},
					rating: {
						type: 'Pip',
						value: [
							false,
							false,
							false,
							false,
							false,
							false,
							false,
							false,
							false,
							false,
							false,
							false,
							false,
							false,
							false,
							false,
							false,
							false,
							false,
							false,
						],
					},
					noun: 'XP',
					plural: 'XP',
					traits: [],
				},
				{
					id: 'crisis-pools',
					name: 'Crisis Pools',
					description: 'Threat clocks and escalating disaster pools',
					view: {
						header: 'top',
						headerAlign: 'left',
						traitColumns: 2,
						features: {
							description: true,
							sfx: false,
							subtraits: false,
						},
						page: 2,
						style: {
							header: 'default',
							body: 'default',
						},
						ratingLadder: [6, 8, 10, 12],
						multiDie: true,
						notes: '',
						reservedSlots: 4,
						parts: {
							rating: {
								left: '0%',
								top: 0,
								width: '100%',
								height: 1,
							},
							name: {
								left: '0%',
								top: 1,
								width: '100%',
								height: 1,
							},
						},
						pillar: 'play',
					},
					noun: 'Crisis Pool',
					plural: 'Crisis Pools',
					traits: [],
				},
			],
		},
	},
	{
		id: 'hammerheads-vehicle',
		version: 1,
		character: {
			$schema: '../schema/0.1/character.schema.json',
			version: '0.1',
			id: 'template-hammerheads-vehicle',
			isTemplate: true,
			name: '',
			game: 'Hammerheads',
			description: '',
			pronouns: '',
			plotPoints: 1,
			notes: '',
			player: '',
			portrait: {
				url: '',
				view: {
					location: 'header',
				},
			},
			view: {
				pageCount: 1,
				template: 'Hammerheads',
				columnAlignment: 'top-base',
				columnOffsets: {
					left: 0,
					center: 0,
					right: 0,
				},
				listing: {
					title: 'Hammerheads - Vehicle File',
					subtitle: 'Rescue Craft & Fleet Support',
					genre: 'Action / Rescue / Vehicles',
					variant: 'Vehicle File',
					url: 'https://legacy.drivethrurpg.com/product/567041/Cortex-Prime-Game-Handbook-2nd-Edition?manufacturers_id=31866',
				},
			},
			traitSets: [
				{
					id: 'name',
					name: 'Name',
					view: {
						style: {
							header: 'default',
							body: 'name',
						},
						page: 1,
					},
					traits: [
						{
							name: 'name',
							label: 'Name',
							traits: [],
						},
						{
							name: 'player',
							label: 'Player',
							traits: [],
						},
						{
							name: 'nickname',
							label: 'Nickname',
							traits: [],
						},
						{
							name: 'pronouns',
							label: 'Pronouns',
							traits: [],
						},
						{
							name: 'description',
							label: 'Description',
							traits: [],
						},
						{
							name: 'game',
							label: 'Game',
							view: {
								visibility: 'hidden',
							},
							traits: [],
						},
						{
							name: 'portrait',
							traits: [],
						},
						{
							name: 'caption',
							traits: [],
						},
						{
							name: 'plotPoints',
							rating: {
								type: 'Counter',
								value: [1],
								range: [0, 20],
							},
							label: 'PP',
							spendable: true,
							view: {
								visibility: 'hidden',
							},
							traits: [],
						},
						{
							name: 'notes',
							view: {
								visibility: 'hidden',
							},
							traits: [],
						},
					],
				},
				{
					id: 'hammerhead-attributes',
					name: 'Hammerhead Attributes',
					description: 'Rescue craft airframes, systems, and handling',
					view: {
						features: {
							description: true,
							sfx: false,
							subtraits: true,
						},
						page: 1,
						style: {
							header: 'default',
							body: 'default',
						},
						ratingLadder: [8, 10],
						subtraitRatingLadder: [8, 10],
						multiDie: false,
						notes: '',
						reservedSlots: 3,
						place: {
							left: '0%',
							top: 0,
							width: '25%',
							height: 1,
						},
						pillar: 'prime',
						fixedNames: true,
					},
					noun: 'Hammerhead Attribute',
					plural: 'Hammerhead Attributes',
					traits: [
						{
							name: 'Hammerhead One',
							description: 'More agile, possesses more precise sensors and instruments.',
							traits: [
								{
									name: 'Systems',
									rating: {
										type: 'Die',
										value: [10],
										range: [4, 6, 8, 10, 12],
									},
									traits: [],
								},
								{
									name: 'Engines',
									rating: {
										type: 'Die',
										value: [8],
										range: [4, 6, 8, 10, 12],
									},
									traits: [],
								},
								{
									name: 'Frame',
									rating: {
										type: 'Die',
										value: [8],
										range: [4, 6, 8, 10, 12],
									},
									traits: [],
								},
							],
						},
						{
							name: 'Hammerhead Two',
							description: 'Faster, more power and range.',
							traits: [
								{
									name: 'Systems',
									rating: {
										type: 'Die',
										value: [8],
										range: [4, 6, 8, 10, 12],
									},
									traits: [],
								},
								{
									name: 'Engines',
									rating: {
										type: 'Die',
										value: [10],
										range: [4, 6, 8, 10, 12],
									},
									traits: [],
								},
								{
									name: 'Frame',
									rating: {
										type: 'Die',
										value: [8],
										range: [4, 6, 8, 10, 12],
									},
									traits: [],
								},
							],
						},
						{
							name: 'Hammerhead Three',
							description: 'Bigger, tougher, and more rugged.',
							traits: [
								{
									name: 'Systems',
									rating: {
										type: 'Die',
										value: [8],
										range: [4, 6, 8, 10, 12],
									},
									traits: [],
								},
								{
									name: 'Engines',
									rating: {
										type: 'Die',
										value: [8],
										range: [4, 6, 8, 10, 12],
									},
									traits: [],
								},
								{
									name: 'Frame',
									rating: {
										type: 'Die',
										value: [10],
										range: [4, 6, 8, 10, 12],
									},
									traits: [],
								},
							],
						},
					],
				},
				{
					id: 'vehicle-distinctions',
					name: 'Vehicle Distinctions',
					description: 'Factory blessings and fleet reputation',
					view: {
						features: {
							description: false,
							sfx: false,
							subtraits: false,
						},
						page: 1,
						ratingLadder: [8],
						multiDie: false,
						notes: "Gain a PP when you switch out your distinction's rating of d8 for a d4.",
						reservedSlots: 3,
						place: {
							left: '25%',
							top: 0,
							width: '50%',
							height: 1,
						},
						pillar: 'prime',
						altRoll: {
							die: 4,
							ppDelta: 1,
							label: 'Hinder',
						},
					},
					noun: 'Vehicle Distinction',
					plural: 'Vehicle Distinctions',
					traits: [
						{
							name: 'Resource Support Vehicle',
							rating: {
								type: 'Die',
								value: [8],
								range: [4, 6, 8, 10, 12],
							},
							traits: [],
						},
						{
							name: 'Top of the Line',
							rating: {
								type: 'Die',
								value: [8],
								range: [4, 6, 8, 10, 12],
							},
							traits: [],
						},
						{
							name: 'Broad-Spectrum Sensors',
							rating: {
								type: 'Die',
								value: [8],
								range: [4, 6, 8, 10, 12],
							},
							traits: [],
						},
					],
				},
				{
					id: 'resource-pools',
					name: 'Resource Pools',
					description: 'Staged supplies, support teams, and fleet backup',
					view: {
						traitColumns: 2,
						features: {
							description: false,
							sfx: false,
							subtraits: false,
						},
						page: 1,
						style: {
							header: 'default',
							body: 'dice-count',
						},
						ratingLadder: [6],
						multiDie: true,
						notes: '',
						reservedSlots: 6,
						place: {
							left: '75%',
							top: 0,
							width: '25%',
							height: 1,
						},
						labels: {
							rating: 'RATING',
							dice: '/ DICE',
						},
						pillar: 'plus',
					},
					noun: 'Resource Pool',
					plural: 'Resource Pools',
					traits: [
						{
							name: 'Unassigned Resources',
							rating: {
								type: 'Dice',
								value: [6, 6, 6, 6, 6, 6, 6],
								range: [4, 6, 8, 10, 12],
							},
							spendable: true,
							hitches: 0,
							traits: [],
						},
						{
							name: 'Tactical Support',
							rating: {
								type: 'Dice',
								value: [6, 6, 6, 6],
								range: [4, 6, 8, 10, 12],
							},
							spendable: true,
							hitches: 0,
							traits: [],
						},
						{
							name: 'Medical Supplies',
							rating: {
								type: 'Dice',
								value: [6, 6, 6, 6],
								range: [4, 6, 8, 10, 12],
							},
							spendable: true,
							hitches: 0,
							traits: [],
						},
						{
							name: 'IT/Network Support',
							rating: {
								type: 'Dice',
								value: [6, 6, 6, 6],
								range: [4, 6, 8, 10, 12],
							},
							spendable: true,
							hitches: 0,
							traits: [],
						},
						{
							name: 'Food/Shelter',
							rating: {
								type: 'Dice',
								value: [6, 6, 6, 6],
								range: [4, 6, 8, 10, 12],
							},
							spendable: true,
							hitches: 0,
							traits: [],
						},
						{
							name: 'Land/Sea/Air Support',
							rating: {
								type: 'Dice',
								value: [6, 6, 6, 6],
								range: [4, 6, 8, 10, 12],
							},
							spendable: true,
							hitches: 0,
							traits: [],
						},
					],
				},
			],
		},
	},
	{
		id: 'inheritors-character',
		version: 1,
		character: {
			$schema: '../schema/0.1/character.schema.json',
			version: '0.1',
			id: 'template-inheritors-char',
			isTemplate: true,
			name: '',
			game: 'Inheritors',
			description: '',
			pronouns: '',
			plotPoints: 1,
			notes: '',
			player: '',
			portrait: {
				url: '',
				view: {
					location: 'header',
				},
			},
			view: {
				pageCount: 1,
				template: 'Inheritors',
				watermark: {
					enabled: true,
					url: 'images/cortex_prime_logo_light_transparent.png',
					opacity: 0.08,
					scale: 70,
					page: 'all',
				},
				columnAlignment: 'top-base',
				columnOffsets: {
					left: 0,
					center: 0,
					right: 0,
				},
				listing: {
					subtitle: 'Superpowered Dynasty Heritage',
					genre: 'Modern Pulp Action-Adventure',
					url: 'https://legacy.drivethrurpg.com/product/572309/Inheritors?manufacturers_id=31866',
					image: 'https://legacy.drivethrurpg.com/images/31866/572309.jpg',
					quote:
						'Your grandfather stopped an immortal warlord using nothing but a biplane and a stolen amulet. Your great-aunt discovered a lost civilization and barely made it out with her notes.',
					setting: 'd6',
					prep: 'd10',
					complexity: 'd8',
				},
			},
			traitSets: [
				{
					id: 'name',
					name: 'Name',
					view: {
						style: {
							header: 'default',
							body: 'name',
						},
						page: 1,
					},
					traits: [
						{
							name: 'name',
							label: 'Name',
							traits: [],
						},
						{
							name: 'player',
							label: 'Player',
							traits: [],
						},
						{
							name: 'nickname',
							label: 'Nickname',
							traits: [],
						},
						{
							name: 'pronouns',
							label: 'Pronouns',
							traits: [],
						},
						{
							name: 'description',
							label: 'Description',
							traits: [],
						},
						{
							name: 'game',
							label: 'Game',
							view: {
								visibility: 'hidden',
							},
							traits: [],
						},
						{
							name: 'portrait',
							traits: [],
						},
						{
							name: 'caption',
							traits: [],
						},
						{
							name: 'plotPoints',
							rating: {
								type: 'Counter',
								value: [1],
								range: [0, 20],
							},
							label: 'PP',
							spendable: true,
							view: {
								visibility: 'hidden',
							},
							traits: [],
						},
						{
							name: 'notes',
							view: {
								visibility: 'hidden',
							},
							traits: [],
						},
					],
				},
				{
					id: 'attributes',
					name: 'Attributes',
					description: 'Gain a PP when you include your d4 attribute in your dice pool.',
					view: {
						features: {
							description: false,
							sfx: false,
							subtraits: false,
						},
						page: 1,
						style: {
							header: 'default',
							body: 'default',
						},
						ratingLadder: [4, 6, 8, 10],
						multiDie: false,
						notes: '',
						reservedSlots: 4,
						place: {
							left: '0%',
							top: 0,
							width: '28%',
							height: 1,
						},
						parts: {
							name: {
								left: '0%',
								top: 0,
								width: '100%',
								height: 1,
							},
							rating: {
								left: '0%',
								top: 1,
								width: '100%',
								height: 1,
							},
						},
						pillar: 'prime',
						fixedNames: true,
					},
					noun: 'Attribute',
					plural: 'Attributes',
					traits: [
						{
							name: 'Action',
							traits: [],
						},
						{
							name: 'Heritage',
							traits: [],
						},
						{
							name: 'Science',
							traits: [],
						},
						{
							name: 'Weird',
							traits: [],
						},
					],
				},
				{
					id: 'stress',
					name: 'Stress',
					view: {
						header: 'top',
						headerAlign: 'left',
						features: {
							description: false,
							sfx: false,
							subtraits: false,
						},
						page: 1,
						style: {
							header: 'die-track',
							body: 'die-track',
						},
						ratingLadder: [4, 6, 8, 10, 12],
						reservedSlots: 1,
						place: {
							left: '0%',
							top: 1,
							width: '28%',
							height: 1,
						},
						parts: {
							name: {
								left: '0%',
								top: 0,
								width: '100%',
								height: 1,
							},
							rating: {
								left: '0%',
								top: 1,
								width: '100%',
								height: 1,
							},
						},
						pillar: 'play',
					},
					noun: 'Stress',
					plural: 'Stress',
					traits: [],
				},
				{
					id: 'distinctions',
					name: 'Distinctions',
					description: 'Bloodline heritage, archetype, and personal stance',
					view: {
						features: {
							description: true,
							sfx: true,
							subtraits: false,
						},
						page: 1,
						ratingLadder: [8],
						multiDie: false,
						notes: "Gain a PP when you trade out your distinction's d8 rating for a d4.",
						reservedSlots: 3,
						place: {
							left: '28%',
							top: 0,
							width: '72%',
							height: 1,
						},
						pillar: 'prime',
						altRoll: {
							die: 4,
							ppDelta: 1,
							label: 'Hinder',
						},
					},
					noun: 'Distinction',
					plural: 'Distinctions',
					traits: [
						{
							name: 'Family Tree',
							rating: {
								type: 'Die',
								value: [8],
								range: [4, 6, 8, 10, 12],
							},
							traits: [
								{
									name: 'Hinder',
									rating: {
										type: 'Die',
										value: [4],
										range: [4],
									},
									traits: [],
									noun: 'SFX',
									ppDelta: 1,
								},
								{
									name: 'Family Ties',
									description:
										'Spend a PP to get aid or advice from a member of your family tree in the form of a d8 asset.',
									traits: [],
									noun: 'SFX',
								},
							],
							view: {
								badge: {
									text: 'SFX',
									shape: 'vertical-bar',
									color: 'black',
								},
							},
						},
						{
							name: 'Approach to Conflict',
							rating: {
								type: 'Die',
								value: [8],
								range: [4, 6, 8, 10, 12],
							},
							traits: [
								{
									name: 'Hinder',
									rating: {
										type: 'Die',
										value: [4],
										range: [4],
									},
									traits: [],
									noun: 'SFX',
									ppDelta: 1,
								},
							],
							view: {
								badge: {
									text: 'SFX',
									shape: 'vertical-bar',
									color: 'black',
								},
							},
						},
						{
							name: 'Personality/Quirk',
							rating: {
								type: 'Die',
								value: [8],
								range: [4, 6, 8, 10, 12],
							},
							traits: [
								{
									name: 'Hinder',
									rating: {
										type: 'Die',
										value: [4],
										range: [4],
									},
									traits: [],
									noun: 'SFX',
									ppDelta: 1,
								},
							],
							view: {
								badge: {
									text: 'SFX',
									shape: 'vertical-bar',
									color: 'black',
								},
							},
						},
					],
				},
				{
					id: 'inherited-abilities',
					name: 'Abilities',
					description: 'Powers granted by bloodline and relics',
					view: {
						traitColumns: 3,
						features: {
							description: true,
							sfx: true,
							subtraits: true,
						},
						page: 1,
						style: {
							header: 'default',
							body: 'default',
						},
						ratingLadder: [6, 8, 10, 12],
						multiDie: false,
						notes: '',
						reservedSlots: 3,
						parts: {
							name: {
								left: '0%',
								top: 0,
								width: '100%',
								height: 1,
							},
							rating: {
								left: '0%',
								top: 1,
								width: '100%',
								height: 1,
							},
							description: {
								left: '0%',
								top: 2,
								width: '100%',
								height: 1,
							},
							block: {
								left: '0%',
								top: 3,
								width: '100%',
								height: 1,
							},
							subtraits: {
								left: '0%',
								top: 4,
								width: '100%',
								height: 1,
							},
						},
						pillar: 'plus',
					},
					noun: 'Ability',
					plural: 'Abilities',
					traits: [
						{
							name: '',
							traits: [
								{
									name: 'Effect Tags:',
									traits: [],
								},
								{
									name: 'Limit:',
									traits: [],
								},
							],
						},
						{
							name: '',
							traits: [
								{
									name: 'Effect Tags:',
									traits: [],
								},
								{
									name: 'Limit:',
									traits: [],
								},
							],
						},
						{
							name: '',
							traits: [
								{
									name: 'Effect Tags:',
									traits: [],
								},
								{
									name: 'Limit:',
									traits: [],
								},
							],
						},
					],
				},
				{
					id: 'skills',
					name: 'Skills',
					description: 'Training and mundane competencies',
					view: {
						header: 'top',
						headerAlign: 'left',
						features: {
							description: false,
							sfx: false,
							subtraits: false,
						},
						page: 1,
						style: {
							header: 'default',
							body: 'default',
						},
						ratingLadder: [4, 6, 8, 10, 12],
						multiDie: false,
						notes: '',
						reservedSlots: 14,
						place: {
							left: '0%',
							top: 3,
							width: '25%',
							height: 1,
						},
						pillar: 'prime',
						fixedNames: true,
					},
					noun: 'Skill',
					plural: 'Skills',
					traits: [
						{
							name: 'Acquire',
							traits: [],
						},
						{
							name: 'Build',
							traits: [],
						},
						{
							name: 'Charm',
							traits: [],
						},
						{
							name: 'Fight',
							traits: [],
						},
						{
							name: 'Investigate',
							traits: [],
						},
						{
							name: 'Move',
							traits: [],
						},
						{
							name: 'Perform',
							traits: [],
						},
						{
							name: 'Pilot',
							traits: [],
						},
						{
							name: 'Shoot',
							traits: [],
						},
						{
							name: 'Sneak',
							traits: [],
						},
						{
							name: 'Study',
							traits: [],
						},
						{
							name: 'Survive',
							traits: [],
						},
						{
							name: 'Treat',
							traits: [],
						},
						{
							name: 'Trick',
							traits: [],
						},
					],
				},
				{
					id: 'heirlooms-milestones',
					name: 'Heirlooms',
					description:
						"Item: Oh, There It Is. Spend a PP to declare that the item, if you didn't have it at the beginning of the scene, is now in your possession despite it being narratively improbable.\nVehicle: I'm Here! Spend a PP to use a vehicle to enter any scene that the vehicle can get you to.\nBase: Resourceful. Spend a PP to reveal that you have brought something useful from your base, thus allowing you to roll the heirloom in subsequent related actions.\nPet: Proxy. Spend a PP to affect a scene where you aren't physically present but your pet is. While you build your dice pool as normal, you're limited to actions your pet can perform.",
					view: {
						header: 'top',
						headerAlign: 'left',
						features: {
							description: true,
							sfx: false,
							subtraits: false,
						},
						page: 1,
						style: {
							header: 'default',
							body: 'default',
						},
						ratingLadder: [6, 8, 10, 12],
						multiDie: false,
						notes: '',
						reservedSlots: 4,
						place: {
							left: '25%',
							top: 3,
							width: '50%',
							height: 1,
						},
						pillar: 'plus',
					},
					noun: 'Heirloom',
					plural: 'Heirlooms',
					traits: [],
				},
				{
					id: 'personal-milestones',
					name: 'Personal Milestones',
					view: {
						header: 'top',
						headerAlign: 'left',
						features: {
							description: true,
							sfx: false,
							subtraits: false,
						},
						page: 1,
						style: {
							header: 'default',
							body: 'default',
						},
						multiDie: false,
						ratingLadder: [],
						reservedSlots: 3,
						place: {
							left: '75%',
							top: 3,
							width: '25%',
							height: 1,
						},
						parts: {
							rating: {
								left: '0%',
								top: 0,
								width: '10%',
								height: 1,
							},
							name: {
								left: '10%',
								top: 0,
								width: '90%',
								height: 1,
							},
							description: {
								left: '0%',
								top: 1,
								width: '100%',
								height: 1,
							},
						},
						pillar: 'plus',
					},
					noun: 'Milestone',
					plural: 'Milestones',
					traits: [
						{
							name: '1 XP',
							description: 'when ',
							rating: {
								type: 'Pip',
								value: [false],
							},
							traits: [],
						},
						{
							name: '3 XP',
							description: 'when ',
							rating: {
								type: 'Pip',
								value: [false],
							},
							traits: [],
						},
						{
							name: '10 XP',
							description: 'when ',
							rating: {
								type: 'Pip',
								value: [false],
							},
							traits: [],
						},
					],
				},
				{
					id: 'group-milestones',
					name: 'Group Milestones',
					view: {
						header: 'top',
						headerAlign: 'left',
						features: {
							description: true,
							sfx: false,
							subtraits: false,
						},
						page: 1,
						style: {
							header: 'default',
							body: 'default',
						},
						multiDie: false,
						ratingLadder: [],
						reservedSlots: 3,
						place: {
							left: '75%',
							top: 4,
							width: '25%',
							height: 1,
						},
						parts: {
							rating: {
								left: '0%',
								top: 0,
								width: '10%',
								height: 1,
							},
							name: {
								left: '10%',
								top: 0,
								width: '90%',
								height: 1,
							},
							description: {
								left: '0%',
								top: 1,
								width: '100%',
								height: 1,
							},
						},
						pillar: 'plus',
					},
					noun: 'Milestone',
					plural: 'Milestones',
					traits: [
						{
							name: '1 XP',
							description: 'when ',
							rating: {
								type: 'Pip',
								value: [false],
							},
							traits: [],
						},
						{
							name: '3 XP',
							description: 'when ',
							rating: {
								type: 'Pip',
								value: [false],
							},
							traits: [],
						},
						{
							name: '10 XP',
							description: 'when ',
							rating: {
								type: 'Pip',
								value: [false],
							},
							traits: [],
						},
					],
				},
				{
					id: 'xp',
					name: 'XP',
					view: {
						features: {
							description: false,
							sfx: false,
							subtraits: false,
						},
						page: 1,
						style: {
							header: 'default',
							body: 'pips',
						},
						pips: {
							perRow: 5,
							connected: true,
						},
						place: {
							left: '75%',
							top: 5,
							width: '25%',
							height: 1,
						},
						pillar: 'play',
					},
					rating: {
						type: 'Pip',
						value: [
							false,
							false,
							false,
							false,
							false,
							false,
							false,
							false,
							false,
							false,
							false,
							false,
							false,
							false,
							false,
							false,
							false,
							false,
							false,
							false,
							false,
							false,
							false,
							false,
							false,
						],
					},
					noun: 'Pip',
					plural: 'Pips',
					traits: [],
				},
			],
		},
	},
	{
		id: 'inheritors-family',
		version: 1,
		character: {
			$schema: '../schema/0.1/character.schema.json',
			version: '0.1',
			id: 'template-inheritors-family',
			isTemplate: true,
			name: '',
			game: 'Inheritors',
			description: '',
			pronouns: '',
			plotPoints: 1,
			notes: '',
			player: '',
			portrait: {
				url: '',
				view: {
					location: 'header',
				},
			},
			view: {
				pageCount: 2,
				template: 'Inheritors',
				watermark: {
					enabled: true,
					url: 'images/cortex_prime_logo_light_transparent.png',
					opacity: 0.08,
					scale: 70,
					page: 'all',
				},
				columnAlignment: 'top-base',
				columnOffsets: {
					left: 0,
					center: 0,
					right: 0,
				},
				listing: {
					title: 'Inheritors - Family & GMCs',
					subtitle: 'Superpowered Dynasty Heritage',
					genre: 'Modern Pulp Action-Adventure',
					variant: 'Family Tree File',
					url: 'https://legacy.drivethrurpg.com/product/572309/Inheritors?manufacturers_id=31866',
					image: 'https://legacy.drivethrurpg.com/images/31866/572309.jpg',
					quote:
						'Your grandfather stopped an immortal warlord using nothing but a biplane and a stolen amulet. Your great-aunt discovered a lost civilization and barely made it out with her notes.',
					setting: 'd6',
					prep: 'd10',
					complexity: 'd8',
				},
			},
			traitSets: [
				{
					id: 'name',
					name: 'Name',
					view: {
						style: {
							header: 'default',
							body: 'name',
						},
						page: 1,
					},
					traits: [
						{
							name: 'name',
							label: 'Name',
							traits: [],
						},
						{
							name: 'player',
							label: 'Player',
							traits: [],
						},
						{
							name: 'nickname',
							label: 'Nickname',
							traits: [],
						},
						{
							name: 'pronouns',
							label: 'Pronouns',
							traits: [],
						},
						{
							name: 'description',
							label: 'Description',
							traits: [],
						},
						{
							name: 'game',
							label: 'Game',
							view: {
								visibility: 'hidden',
							},
							traits: [],
						},
						{
							name: 'portrait',
							traits: [],
						},
						{
							name: 'caption',
							traits: [],
						},
						{
							name: 'plotPoints',
							rating: {
								type: 'Counter',
								value: [1],
								range: [0, 20],
							},
							label: 'PP',
							spendable: true,
							view: {
								visibility: 'hidden',
							},
							traits: [],
						},
						{
							name: 'notes',
							view: {
								visibility: 'hidden',
							},
							traits: [],
						},
					],
				},
				{
					id: 'your-generation',
					name: 'Your Generation',
					view: {
						header: 'top',
						headerAlign: 'left',
						features: {
							description: true,
							sfx: false,
							subtraits: false,
						},
						page: 1,
						pillar: 'plus',
						parts: {
							name: {
								left: '0%',
								top: 0,
								width: '100%',
								height: 1,
							},
							description: {
								left: '0%',
								top: 1,
								width: '100%',
								height: 1,
							},
						},
					},
					noun: 'Detail',
					plural: 'Details',
					traits: [
						{
							name: 'Name',
							traits: [],
						},
						{
							name: 'Description',
							traits: [],
						},
						{
							name: 'Fame',
							traits: [],
						},
						{
							name: 'Features',
							traits: [],
						},
						{
							name: 'Deed',
							traits: [],
						},
						{
							name: 'Current Fate',
							traits: [],
						},
					],
				},
				{
					id: 'parents-generation-a',
					name: "Parents' Generation",
					view: {
						header: 'top',
						headerAlign: 'left',
						features: {
							description: true,
							sfx: false,
							subtraits: false,
						},
						page: 1,
						place: {
							left: '0%',
							top: 1,
							width: '50%',
							height: 1,
						},
						pillar: 'plus',
						parts: {
							name: {
								left: '0%',
								top: 0,
								width: '100%',
								height: 1,
							},
							description: {
								left: '0%',
								top: 1,
								width: '100%',
								height: 1,
							},
						},
					},
					noun: 'Detail',
					plural: 'Details',
					traits: [
						{
							name: 'Name',
							traits: [],
						},
						{
							name: 'Description',
							traits: [],
						},
						{
							name: 'Fame',
							traits: [],
						},
						{
							name: 'Features',
							traits: [],
						},
						{
							name: 'Deed',
							traits: [],
						},
						{
							name: 'Current Fate',
							traits: [],
						},
					],
				},
				{
					id: 'parents-generation-b',
					name: "Parents' Generation",
					view: {
						header: 'top',
						headerAlign: 'left',
						features: {
							description: true,
							sfx: false,
							subtraits: false,
						},
						page: 1,
						place: {
							left: '50%',
							top: 1,
							width: '50%',
							height: 1,
						},
						pillar: 'plus',
						parts: {
							name: {
								left: '0%',
								top: 0,
								width: '100%',
								height: 1,
							},
							description: {
								left: '0%',
								top: 1,
								width: '100%',
								height: 1,
							},
						},
					},
					noun: 'Detail',
					plural: 'Details',
					traits: [
						{
							name: 'Name',
							traits: [],
						},
						{
							name: 'Description',
							traits: [],
						},
						{
							name: 'Fame',
							traits: [],
						},
						{
							name: 'Features',
							traits: [],
						},
						{
							name: 'Deed',
							traits: [],
						},
						{
							name: 'Current Fate',
							traits: [],
						},
					],
				},
				{
					id: 'grandparents-generation-a',
					name: "Grandparents' Generation",
					view: {
						header: 'top',
						headerAlign: 'left',
						features: {
							description: true,
							sfx: false,
							subtraits: false,
						},
						page: 1,
						place: {
							left: '0%',
							top: 2,
							width: '50%',
							height: 1,
						},
						pillar: 'plus',
						parts: {
							name: {
								left: '0%',
								top: 0,
								width: '100%',
								height: 1,
							},
							description: {
								left: '0%',
								top: 1,
								width: '100%',
								height: 1,
							},
						},
					},
					noun: 'Detail',
					plural: 'Details',
					traits: [
						{
							name: 'Name',
							traits: [],
						},
						{
							name: 'Description',
							traits: [],
						},
						{
							name: 'Fame',
							traits: [],
						},
						{
							name: 'Features',
							traits: [],
						},
						{
							name: 'Deed',
							traits: [],
						},
						{
							name: 'Current Fate',
							traits: [],
						},
					],
				},
				{
					id: 'grandparents-generation-b',
					name: "Grandparents' Generation",
					view: {
						header: 'top',
						headerAlign: 'left',
						features: {
							description: true,
							sfx: false,
							subtraits: false,
						},
						page: 1,
						place: {
							left: '50%',
							top: 2,
							width: '50%',
							height: 1,
						},
						pillar: 'plus',
						parts: {
							name: {
								left: '0%',
								top: 0,
								width: '100%',
								height: 1,
							},
							description: {
								left: '0%',
								top: 1,
								width: '100%',
								height: 1,
							},
						},
					},
					noun: 'Detail',
					plural: 'Details',
					traits: [
						{
							name: 'Name',
							traits: [],
						},
						{
							name: 'Description',
							traits: [],
						},
						{
							name: 'Fame',
							traits: [],
						},
						{
							name: 'Features',
							traits: [],
						},
						{
							name: 'Deed',
							traits: [],
						},
						{
							name: 'Current Fate',
							traits: [],
						},
					],
				},
				{
					id: 'wild-card-a',
					name: 'Wild Card Branch',
					view: {
						header: 'top',
						headerAlign: 'left',
						features: {
							description: true,
							sfx: false,
							subtraits: false,
						},
						page: 1,
						pillar: 'plus',
						parts: {
							name: {
								left: '0%',
								top: 0,
								width: '100%',
								height: 1,
							},
							description: {
								left: '0%',
								top: 1,
								width: '100%',
								height: 1,
							},
						},
						fixedNames: true,
					},
					noun: 'Detail',
					plural: 'Details',
					traits: [
						{
							name: 'Name',
							traits: [],
						},
						{
							name: 'Description',
							traits: [],
						},
						{
							name: 'Fame',
							traits: [],
						},
						{
							name: 'Features',
							traits: [],
						},
						{
							name: 'Deed',
							traits: [],
						},
						{
							name: 'Current Fate',
							traits: [],
						},
					],
				},
				{
					id: 'wild-card-b',
					name: 'Wild Card Branch',
					view: {
						header: 'top',
						headerAlign: 'left',
						features: {
							description: true,
							sfx: false,
							subtraits: false,
						},
						page: 1,
						place: {
							left: '0%',
							top: 4,
							width: '50%',
							height: 1,
						},
						pillar: 'plus',
						parts: {
							name: {
								left: '0%',
								top: 0,
								width: '100%',
								height: 1,
							},
							description: {
								left: '0%',
								top: 1,
								width: '100%',
								height: 1,
							},
						},
						fixedNames: true,
					},
					noun: 'Detail',
					plural: 'Details',
					traits: [
						{
							name: 'Name',
							traits: [],
						},
						{
							name: 'Description',
							traits: [],
						},
						{
							name: 'Fame',
							traits: [],
						},
						{
							name: 'Features',
							traits: [],
						},
						{
							name: 'Deed',
							traits: [],
						},
						{
							name: 'Current Fate',
							traits: [],
						},
					],
				},
				{
					id: 'wild-card-c',
					name: 'Wild Card Branch',
					view: {
						header: 'top',
						headerAlign: 'left',
						features: {
							description: true,
							sfx: false,
							subtraits: false,
						},
						page: 1,
						place: {
							left: '50%',
							top: 4,
							width: '50%',
							height: 1,
						},
						pillar: 'plus',
						parts: {
							name: {
								left: '0%',
								top: 0,
								width: '100%',
								height: 1,
							},
							description: {
								left: '0%',
								top: 1,
								width: '100%',
								height: 1,
							},
						},
						fixedNames: true,
					},
					noun: 'Detail',
					plural: 'Details',
					traits: [
						{
							name: 'Name',
							traits: [],
						},
						{
							name: 'Description',
							traits: [],
						},
						{
							name: 'Fame',
							traits: [],
						},
						{
							name: 'Features',
							traits: [],
						},
						{
							name: 'Deed',
							traits: [],
						},
						{
							name: 'Current Fate',
							traits: [],
						},
					],
				},
				{
					id: 'wild-card-d',
					name: 'Wild Card Branch',
					view: {
						header: 'top',
						headerAlign: 'left',
						features: {
							description: true,
							sfx: false,
							subtraits: false,
						},
						page: 1,
						place: {
							left: '0%',
							top: 5,
							width: '50%',
							height: 1,
						},
						pillar: 'plus',
						parts: {
							name: {
								left: '0%',
								top: 0,
								width: '100%',
								height: 1,
							},
							description: {
								left: '0%',
								top: 1,
								width: '100%',
								height: 1,
							},
						},
						fixedNames: true,
					},
					noun: 'Detail',
					plural: 'Details',
					traits: [
						{
							name: 'Name',
							traits: [],
						},
						{
							name: 'Description',
							traits: [],
						},
						{
							name: 'Fame',
							traits: [],
						},
						{
							name: 'Features',
							traits: [],
						},
						{
							name: 'Deed',
							traits: [],
						},
						{
							name: 'Current Fate',
							traits: [],
						},
					],
				},
				{
					id: 'wild-card-e',
					name: 'Wild Card Branch',
					view: {
						header: 'top',
						headerAlign: 'left',
						features: {
							description: true,
							sfx: false,
							subtraits: false,
						},
						page: 1,
						place: {
							left: '50%',
							top: 5,
							width: '50%',
							height: 1,
						},
						pillar: 'plus',
						parts: {
							name: {
								left: '0%',
								top: 0,
								width: '100%',
								height: 1,
							},
							description: {
								left: '0%',
								top: 1,
								width: '100%',
								height: 1,
							},
						},
						fixedNames: true,
					},
					noun: 'Detail',
					plural: 'Details',
					traits: [
						{
							name: 'Name',
							traits: [],
						},
						{
							name: 'Description',
							traits: [],
						},
						{
							name: 'Fame',
							traits: [],
						},
						{
							name: 'Features',
							traits: [],
						},
						{
							name: 'Deed',
							traits: [],
						},
						{
							name: 'Current Fate',
							traits: [],
						},
					],
				},
				{
					id: 'gmc-a',
					name: 'GMC',
					view: {
						header: 'top',
						headerAlign: 'left',
						features: {
							description: true,
							sfx: false,
							subtraits: false,
						},
						page: 2,
						place: {
							left: '0%',
							top: 0,
							width: '50%',
							height: 1,
						},
						pillar: 'plus',
						parts: {
							name: {
								left: '0%',
								top: 0,
								width: '100%',
								height: 1,
							},
							description: {
								left: '0%',
								top: 1,
								width: '100%',
								height: 1,
							},
						},
					},
					noun: 'Detail',
					plural: 'Details',
					traits: [
						{
							name: 'Name',
							traits: [],
						},
						{
							name: 'Relationship to PCs',
							traits: [],
						},
						{
							name: 'Relationship to GMCs',
							traits: [],
						},
						{
							name: 'Description',
							traits: [],
						},
						{
							name: 'Fame',
							traits: [],
						},
						{
							name: 'Features',
							traits: [],
						},
						{
							name: 'Deed',
							traits: [],
						},
						{
							name: 'Current Fate',
							traits: [],
						},
					],
				},
				{
					id: 'gmc-b',
					name: 'GMC',
					view: {
						header: 'top',
						headerAlign: 'left',
						features: {
							description: true,
							sfx: false,
							subtraits: false,
						},
						page: 2,
						place: {
							left: '50%',
							top: 0,
							width: '50%',
							height: 1,
						},
						pillar: 'plus',
						parts: {
							name: {
								left: '0%',
								top: 0,
								width: '100%',
								height: 1,
							},
							description: {
								left: '0%',
								top: 1,
								width: '100%',
								height: 1,
							},
						},
					},
					noun: 'Detail',
					plural: 'Details',
					traits: [
						{
							name: 'Name',
							traits: [],
						},
						{
							name: 'Relationship to PCs',
							traits: [],
						},
						{
							name: 'Relationship to GMCs',
							traits: [],
						},
						{
							name: 'Description',
							traits: [],
						},
						{
							name: 'Fame',
							traits: [],
						},
						{
							name: 'Features',
							traits: [],
						},
						{
							name: 'Deed',
							traits: [],
						},
						{
							name: 'Current Fate',
							traits: [],
						},
					],
				},
				{
					id: 'gmc-c',
					name: 'GMC',
					view: {
						header: 'top',
						headerAlign: 'left',
						features: {
							description: true,
							sfx: false,
							subtraits: false,
						},
						page: 2,
						place: {
							left: '0%',
							top: 1,
							width: '50%',
							height: 1,
						},
						pillar: 'plus',
						parts: {
							name: {
								left: '0%',
								top: 0,
								width: '100%',
								height: 1,
							},
							description: {
								left: '0%',
								top: 1,
								width: '100%',
								height: 1,
							},
						},
					},
					noun: 'Detail',
					plural: 'Details',
					traits: [
						{
							name: 'Name',
							traits: [],
						},
						{
							name: 'Relationship to PCs',
							traits: [],
						},
						{
							name: 'Relationship to GMCs',
							traits: [],
						},
						{
							name: 'Description',
							traits: [],
						},
						{
							name: 'Fame',
							traits: [],
						},
						{
							name: 'Features',
							traits: [],
						},
						{
							name: 'Deed',
							traits: [],
						},
						{
							name: 'Current Fate',
							traits: [],
						},
					],
				},
				{
					id: 'gmc-d',
					name: 'GMC',
					view: {
						header: 'top',
						headerAlign: 'left',
						features: {
							description: true,
							sfx: false,
							subtraits: false,
						},
						page: 2,
						place: {
							left: '50%',
							top: 1,
							width: '50%',
							height: 1,
						},
						pillar: 'plus',
						parts: {
							name: {
								left: '0%',
								top: 0,
								width: '100%',
								height: 1,
							},
							description: {
								left: '0%',
								top: 1,
								width: '100%',
								height: 1,
							},
						},
					},
					noun: 'Detail',
					plural: 'Details',
					traits: [
						{
							name: 'Name',
							traits: [],
						},
						{
							name: 'Relationship to PCs',
							traits: [],
						},
						{
							name: 'Relationship to GMCs',
							traits: [],
						},
						{
							name: 'Description',
							traits: [],
						},
						{
							name: 'Fame',
							traits: [],
						},
						{
							name: 'Features',
							traits: [],
						},
						{
							name: 'Deed',
							traits: [],
						},
						{
							name: 'Current Fate',
							traits: [],
						},
					],
				},
				{
					id: 'gmc-e',
					name: 'GMC',
					view: {
						header: 'top',
						headerAlign: 'left',
						features: {
							description: true,
							sfx: false,
							subtraits: false,
						},
						page: 2,
						place: {
							left: '0%',
							top: 2,
							width: '50%',
							height: 1,
						},
						pillar: 'plus',
						parts: {
							name: {
								left: '0%',
								top: 0,
								width: '100%',
								height: 1,
							},
							description: {
								left: '0%',
								top: 1,
								width: '100%',
								height: 1,
							},
						},
					},
					noun: 'Detail',
					plural: 'Details',
					traits: [
						{
							name: 'Name',
							traits: [],
						},
						{
							name: 'Relationship to PCs',
							traits: [],
						},
						{
							name: 'Relationship to GMCs',
							traits: [],
						},
						{
							name: 'Description',
							traits: [],
						},
						{
							name: 'Fame',
							traits: [],
						},
						{
							name: 'Features',
							traits: [],
						},
						{
							name: 'Deed',
							traits: [],
						},
						{
							name: 'Current Fate',
							traits: [],
						},
					],
				},
				{
					id: 'gmc-f',
					name: 'GMC',
					view: {
						header: 'top',
						headerAlign: 'left',
						features: {
							description: true,
							sfx: false,
							subtraits: false,
						},
						page: 2,
						place: {
							left: '50%',
							top: 2,
							width: '50%',
							height: 1,
						},
						pillar: 'plus',
						parts: {
							name: {
								left: '0%',
								top: 0,
								width: '100%',
								height: 1,
							},
							description: {
								left: '0%',
								top: 1,
								width: '100%',
								height: 1,
							},
						},
					},
					noun: 'Detail',
					plural: 'Details',
					traits: [
						{
							name: 'Name',
							traits: [],
						},
						{
							name: 'Relationship to PCs',
							traits: [],
						},
						{
							name: 'Relationship to GMCs',
							traits: [],
						},
						{
							name: 'Description',
							traits: [],
						},
						{
							name: 'Fame',
							traits: [],
						},
						{
							name: 'Features',
							traits: [],
						},
						{
							name: 'Deed',
							traits: [],
						},
						{
							name: 'Current Fate',
							traits: [],
						},
					],
				},
			],
		},
	},
	{
		id: 'kitbash-hero',
		version: 1,
		character: {
			$schema: '../schema/0.1/character.schema.json',
			version: '0.1',
			id: 'template-kitbash-hero',
			isTemplate: true,
			name: '',
			game: 'Kit Bash!',
			description: '',
			pronouns: '',
			plotPoints: 1,
			notes: '',
			player: '',
			portrait: {
				url: '',
				view: {
					location: 'header',
				},
			},
			view: {
				pageCount: 1,
				template: 'Kit Bash!',
				watermark: {
					enabled: true,
					url: 'images/cortex_prime_logo_light_transparent.png',
					opacity: 0.08,
					scale: 70,
					page: 'all',
				},
				columnAlignment: 'top-base',
				columnOffsets: {
					left: 0,
					center: 0,
					right: 0,
				},
				listing: {
					subtitle: 'Modular Comic Book Superheroes',
					genre: 'Superhero',
					variant: 'Hero File',
					url: 'https://legacy.drivethrurpg.com/product/568416/Kit-Bash?manufacturers_id=31866',
					image: 'https://legacy.drivethrurpg.com/images/31866/568416.jpg',
					quote:
						'You want to run a superhero campaign, but you’re sick of starting with someone else’s universe. What if the table built the world together, from scratch, before the first punch is thrown?',
					setting: 'd6',
					prep: 'd12',
					complexity: 'd8',
				},
			},
			traitSets: [
				{
					id: 'name',
					name: 'Name',
					view: {
						style: {
							header: 'default',
							body: 'name',
						},
						page: 1,
					},
					traits: [
						{
							name: 'name',
							label: 'Name',
							traits: [],
						},
						{
							name: 'player',
							label: 'Player',
							traits: [],
						},
						{
							name: 'nickname',
							label: 'Nickname',
							traits: [],
						},
						{
							name: 'pronouns',
							label: 'Pronouns',
							traits: [],
						},
						{
							name: 'description',
							label: 'Description',
							traits: [],
						},
						{
							name: 'game',
							label: 'Game',
							view: {
								visibility: 'hidden',
							},
							traits: [],
						},
						{
							name: 'portrait',
							traits: [],
						},
						{
							name: 'caption',
							traits: [],
						},
						{
							name: 'plotPoints',
							rating: {
								type: 'Counter',
								value: [1],
								range: [0, 20],
							},
							label: 'PP',
							spendable: true,
							view: {
								visibility: 'hidden',
							},
							traits: [],
						},
						{
							name: 'notes',
							view: {
								visibility: 'hidden',
							},
							traits: [],
						},
					],
				},
				{
					id: 'distinctions',
					name: 'Distinctions',
					description: 'Origin, motivation, and crime-fighting persona',
					view: {
						header: 'top',
						headerAlign: 'left',
						features: {
							description: true,
							sfx: false,
							subtraits: false,
						},
						page: 1,
						ratingLadder: [8],
						multiDie: false,
						notes: "Gain a PP when you trade out your distinction's d8 rating for a d4.",
						reservedSlots: 3,
						place: {
							left: '0%',
							top: 0,
							width: '33.333%',
							height: 1,
						},
						pillar: 'prime',
						altRoll: {
							die: 4,
							ppDelta: 1,
							label: 'Hinder',
						},
					},
					noun: 'Distinction',
					plural: 'Distinctions',
					traits: [
						{
							name: 'Personality:',
							rating: {
								type: 'Die',
								value: [8],
								range: [4, 6, 8, 10, 12],
							},
							traits: [
								{
									name: 'Hinder',
									rating: {
										type: 'Die',
										value: [4],
										range: [4],
									},
									traits: [],
									noun: 'SFX',
									ppDelta: 1,
								},
							],
							view: {
								badge: {
									text: 'SFX',
									shape: 'vertical-bar',
									color: 'black',
								},
								prompt: true,
							},
						},
						{
							name: 'Past:',
							rating: {
								type: 'Die',
								value: [8],
								range: [4, 6, 8, 10, 12],
							},
							traits: [
								{
									name: 'Hinder',
									rating: {
										type: 'Die',
										value: [4],
										range: [4],
									},
									traits: [],
									noun: 'SFX',
									ppDelta: 1,
								},
							],
							view: {
								badge: {
									text: 'SFX',
									shape: 'vertical-bar',
									color: 'black',
								},
								prompt: true,
							},
						},
						{
							name: 'Quirk:',
							rating: {
								type: 'Die',
								value: [8],
								range: [4, 6, 8, 10, 12],
							},
							traits: [
								{
									name: 'Hinder',
									rating: {
										type: 'Die',
										value: [4],
										range: [4],
									},
									traits: [],
									noun: 'SFX',
									ppDelta: 1,
								},
							],
							view: {
								badge: {
									text: 'SFX',
									shape: 'vertical-bar',
									color: 'black',
								},
								prompt: true,
							},
						},
					],
				},
				{
					id: 'affiliations',
					name: 'Affiliations',
					description: 'Operating mode ratings',
					view: {
						header: 'top',
						headerAlign: 'left',
						features: {
							description: false,
							sfx: false,
							subtraits: false,
						},
						page: 1,
						style: {
							header: 'default',
							body: 'default',
						},
						ratingLadder: [6, 8, 10],
						multiDie: false,
						notes: '',
						reservedSlots: 3,
						place: {
							left: '33.333%',
							top: 0,
							width: '33.333%',
							height: 1,
						},
						parts: {
							name: {
								left: '0%',
								top: 0,
								width: '100%',
								height: 1,
							},
							rating: {
								left: '0%',
								top: 1,
								width: '100%',
								height: 1,
							},
						},
						pillar: 'prime',
						fixedNames: true,
					},
					noun: 'Affiliation',
					plural: 'Affiliations',
					traits: [
						{
							name: 'Personal:',
							traits: [],
							view: {
								prompt: true,
							},
						},
						{
							name: 'Group:',
							traits: [],
							view: {
								prompt: true,
							},
						},
						{
							name: 'World:',
							traits: [],
							view: {
								prompt: true,
							},
						},
					],
				},
				{
					id: 'specialties',
					name: 'Specialties',
					description: 'Master and expert professional skills',
					view: {
						header: 'top',
						headerAlign: 'left',
						features: {
							description: false,
							sfx: false,
							subtraits: false,
						},
						page: 1,
						style: {
							header: 'default',
							body: 'default',
						},
						ratingLadder: [8, 10, 12],
						multiDie: false,
						notes: '',
						reservedSlots: 5,
						place: {
							left: '66.666%',
							top: 0,
							width: '33.334%',
							height: 1,
						},
						pillar: 'prime',
					},
					noun: 'Specialty',
					plural: 'Specialties',
					traits: [],
				},
				{
					id: 'signature-assets',
					name: 'Signature Assets',
					description: 'Heroic gear and vehicles',
					view: {
						header: 'top',
						headerAlign: 'left',
						features: {
							description: false,
							sfx: false,
							subtraits: false,
						},
						page: 1,
						style: {
							header: 'default',
							body: 'default',
						},
						ratingLadder: [6, 8, 10, 12],
						multiDie: false,
						notes: '',
						reservedSlots: 3,
						place: {
							left: '0%',
							top: 1,
							width: '33.333%',
							height: 1,
						},
						pillar: 'plus',
					},
					noun: 'Signature Asset',
					plural: 'Signature Assets',
					traits: [],
				},
				{
					id: 'stress',
					name: 'Stress',
					view: {
						header: 'top',
						headerAlign: 'left',
						features: {
							description: false,
							sfx: false,
							subtraits: false,
						},
						page: 1,
						style: {
							header: 'die-track',
							body: 'die-track',
						},
						ratingLadder: [4, 6, 8, 10, 12],
						reservedSlots: 3,
						place: {
							left: '33.333%',
							top: 1,
							width: '33.333%',
							height: 1,
						},
						parts: {
							name: {
								left: '0%',
								top: 0,
								width: '100%',
								height: 1,
							},
							rating: {
								left: '0%',
								top: 1,
								width: '100%',
								height: 1,
							},
						},
						pillar: 'play',
					},
					noun: 'Stress',
					plural: 'Stress',
					traits: [
						{
							name: 'Physical',
							traits: [],
						},
						{
							name: 'Mental',
							traits: [],
						},
						{
							name: 'Social',
							traits: [],
						},
					],
				},
				{
					id: 'growth-pool',
					name: 'Growth Pool',
					view: {
						header: 'top',
						headerAlign: 'left',
						features: {
							description: false,
							sfx: false,
							subtraits: false,
						},
						page: 1,
						style: {
							header: 'default',
							body: 'dice-count',
						},
						ratingLadder: [4, 6, 8, 10, 12],
						multiDie: true,
						reservedSlots: 5,
						place: {
							left: '66.666%',
							top: 1,
							width: '33.334%',
							height: 1,
						},
						labels: {
							rating: 'RATING',
							dice: '/ DICE',
						},
						pillar: 'play',
					},
					pool: true,
					noun: 'Growth Die',
					plural: 'Growth Dice',
					traits: [
						{
							name: 'D4',
							rating: {
								type: 'Die',
								value: [4],
								range: [4, 6, 8, 10, 12],
							},
							spendable: true,
							hitches: 0,
							view: {
								poolCount: 1,
							},
							traits: [],
						},
						{
							name: 'D6',
							rating: {
								type: 'Die',
								value: [6],
								range: [4, 6, 8, 10, 12],
							},
							spendable: true,
							hitches: 0,
							view: {
								poolCount: 1,
							},
							traits: [],
						},
						{
							name: 'D8',
							rating: {
								type: 'Die',
								value: [8],
								range: [4, 6, 8, 10, 12],
							},
							spendable: true,
							hitches: 0,
							view: {
								poolCount: 1,
							},
							traits: [],
						},
						{
							name: 'D10',
							rating: {
								type: 'Die',
								value: [10],
								range: [4, 6, 8, 10, 12],
							},
							spendable: true,
							hitches: 0,
							view: {
								poolCount: 1,
							},
							traits: [],
						},
						{
							name: 'D12',
							rating: {
								type: 'Die',
								value: [12],
								range: [4, 6, 8, 10, 12],
							},
							spendable: true,
							hitches: 0,
							view: {
								poolCount: 1,
							},
							traits: [],
						},
					],
				},
				{
					id: 'power-set',
					name: 'Power Set 1',
					description: 'Modular powers, SFX triggers, and shutdown limits',
					view: {
						header: 'top',
						headerAlign: 'left',
						traitColumns: 2,
						features: {
							description: true,
							sfx: false,
							subtraits: false,
						},
						page: 1,
						multiDie: false,
						notes: '',
						reservedSlots: 3,
						pillar: 'plus',
						parts: {
							name: {
								left: '0%',
								top: 0,
								width: '100%',
								height: 1,
							},
							description: {
								left: '0%',
								top: 1,
								width: '100%',
								height: 1,
							},
						},
						fixedNames: true,
					},
					noun: 'Power Set',
					plural: 'Power Sets',
					traits: [
						{
							name: 'Powers',
							traits: [],
						},
						{
							name: 'Limits',
							traits: [],
						},
					],
				},
				{
					id: 'power-set-2',
					name: 'Power Set 2',
					view: {
						header: 'top',
						headerAlign: 'left',
						traitColumns: 2,
						features: {
							description: true,
							sfx: false,
							subtraits: false,
						},
						page: 1,
						pillar: 'plus',
						parts: {
							name: {
								left: '0%',
								top: 0,
								width: '100%',
								height: 1,
							},
							description: {
								left: '0%',
								top: 1,
								width: '100%',
								height: 1,
							},
						},
						fixedNames: true,
					},
					noun: 'Power',
					plural: 'Powers',
					traits: [
						{
							name: 'Powers',
							traits: [],
						},
						{
							name: 'Limits',
							traits: [],
						},
					],
				},
				{
					id: 'power-set-3',
					name: 'Power Set 3',
					view: {
						header: 'top',
						headerAlign: 'left',
						traitColumns: 2,
						features: {
							description: true,
							sfx: false,
							subtraits: false,
						},
						page: 1,
						pillar: 'plus',
						parts: {
							name: {
								left: '0%',
								top: 0,
								width: '100%',
								height: 1,
							},
							description: {
								left: '0%',
								top: 1,
								width: '100%',
								height: 1,
							},
						},
						fixedNames: true,
					},
					noun: 'Power',
					plural: 'Powers',
					traits: [
						{
							name: 'Powers',
							traits: [],
						},
						{
							name: 'Limits',
							traits: [],
						},
					],
				},
			],
		},
	},
	{
		id: 'kitbash-team',
		version: 1,
		character: {
			$schema: '../schema/0.1/character.schema.json',
			version: '0.1',
			id: 'template-kitbash-team',
			isTemplate: true,
			name: '',
			game: 'Kit Bash!',
			description: '',
			pronouns: '',
			plotPoints: 1,
			notes: '',
			player: '',
			portrait: {
				url: '',
				view: {
					location: 'header',
				},
			},
			view: {
				pageCount: 1,
				template: 'Kit Bash!',
				watermark: {
					enabled: true,
					url: 'images/cortex_prime_logo_light_transparent.png',
					opacity: 0.08,
					scale: 70,
					page: 'all',
				},
				columnAlignment: 'top-base',
				columnOffsets: {
					left: 0,
					center: 0,
					right: 0,
				},
				listing: {
					title: 'Kit Bash! - Team File',
					subtitle: 'Modular Comic Book Superheroes',
					genre: 'Superhero',
					variant: 'Team Roster File',
					url: 'https://legacy.drivethrurpg.com/product/568416/Kit-Bash?manufacturers_id=31866',
					image: 'https://legacy.drivethrurpg.com/images/31866/568416.jpg',
					quote:
						'You want to run a superhero campaign, but you’re sick of starting with someone else’s universe. What if the table built the world together, from scratch, before the first punch is thrown?',
					setting: 'd6',
					prep: 'd12',
					complexity: 'd8',
				},
			},
			traitSets: [
				{
					id: 'name',
					name: 'Name',
					view: {
						style: {
							header: 'default',
							body: 'name',
						},
						page: 1,
					},
					traits: [
						{
							name: 'name',
							label: 'Name',
							traits: [],
						},
						{
							name: 'player',
							label: 'Player',
							traits: [],
						},
						{
							name: 'nickname',
							label: 'Nickname',
							traits: [],
						},
						{
							name: 'pronouns',
							label: 'Pronouns',
							traits: [],
						},
						{
							name: 'description',
							label: 'Description',
							traits: [],
						},
						{
							name: 'game',
							label: 'Game',
							view: {
								visibility: 'hidden',
							},
							traits: [],
						},
						{
							name: 'portrait',
							traits: [],
						},
						{
							name: 'caption',
							traits: [],
						},
						{
							name: 'plotPoints',
							rating: {
								type: 'Counter',
								value: [1],
								range: [0, 20],
							},
							label: 'PP',
							spendable: true,
							view: {
								visibility: 'hidden',
							},
							traits: [],
						},
						{
							name: 'notes',
							view: {
								visibility: 'hidden',
							},
							traits: [],
						},
					],
				},
				{
					id: 'team-base',
					name: 'Team Base',
					description: 'As a group, decide on the following information.',
					view: {
						header: 'top',
						headerAlign: 'left',
						features: {
							description: true,
							sfx: false,
							subtraits: false,
						},
						page: 1,
						pillar: 'plus',
						parts: {
							name: {
								left: '0%',
								top: 0,
								width: '100%',
								height: 1,
							},
							description: {
								left: '0%',
								top: 1,
								width: '100%',
								height: 1,
							},
						},
					},
					noun: 'Detail',
					plural: 'Details',
					traits: [
						{
							name: 'Name',
							traits: [],
						},
						{
							name: 'Location',
							traits: [],
						},
						{
							name: 'Description',
							traits: [],
						},
						{
							name: 'Benefits',
							traits: [],
						},
						{
							name: 'Drawbacks',
							traits: [],
						},
					],
				},
				{
					id: 'team-resources',
					name: 'Team Resources',
					view: {
						header: 'top',
						headerAlign: 'left',
						traitColumns: 2,
						features: {
							description: true,
							sfx: false,
							subtraits: false,
						},
						page: 1,
						style: {
							header: 'default',
							body: 'dice-count',
						},
						ratingLadder: [6, 8, 10, 12],
						multiDie: true,
						reservedSlots: 20,
						labels: {
							rating: 'RATING',
							dice: '/ DICE',
						},
						pillar: 'plus',
					},
					noun: 'Resource',
					plural: 'Resources',
					traits: [],
				},
			],
		},
	},
	{
		id: 'misty-cove',
		version: 1,
		character: {
			$schema: '../schema/0.1/character.schema.json',
			version: '0.1',
			id: 'template-misty-cove',
			isTemplate: true,
			name: '',
			game: 'Misty Cove',
			description: '',
			pronouns: '',
			plotPoints: 1,
			notes: '',
			player: '',
			portrait: {
				url: '',
				view: {
					location: 'header',
				},
			},
			view: {
				pageCount: 1,
				template: 'Misty Cove',
				watermark: {
					enabled: true,
					url: 'images/cortex_prime_logo_light_transparent.png',
					opacity: 0.08,
					scale: 70,
					page: 'all',
				},
				columnAlignment: 'top-base',
				columnOffsets: {
					left: 0,
					center: 0,
					right: 0,
				},
				listing: {
					subtitle: 'Emotional Gothic Mystery',
					genre: 'Small-town supernatural drama',
					url: 'https://legacy.drivethrurpg.com/product/568414/Misty-Cove?manufacturers_id=31866',
					image: 'https://legacy.drivethrurpg.com/images/31866/568414.jpg',
					quote: 'The town knows you’re different. They always have.',
					setting: 'd6',
					prep: 'd6',
					complexity: 'd8',
				},
			},
			traitSets: [
				{
					id: 'name',
					name: 'Name',
					view: {
						style: {
							header: 'default',
							body: 'name',
						},
						page: 1,
					},
					traits: [
						{
							name: 'name',
							label: 'Name',
							traits: [],
						},
						{
							name: 'player',
							label: 'Player',
							traits: [],
						},
						{
							name: 'nickname',
							label: 'Nickname',
							traits: [],
						},
						{
							name: 'pronouns',
							label: 'Pronouns',
							traits: [],
						},
						{
							name: 'description',
							label: 'Description',
							traits: [],
						},
						{
							name: 'game',
							label: 'Game',
							view: {
								visibility: 'hidden',
							},
							traits: [],
						},
						{
							name: 'portrait',
							traits: [],
						},
						{
							name: 'caption',
							traits: [],
						},
						{
							name: 'plotPoints',
							rating: {
								type: 'Counter',
								value: [1],
								range: [0, 20],
							},
							label: 'PP',
							spendable: true,
							view: {
								visibility: 'hidden',
							},
							traits: [],
						},
						{
							name: 'notes',
							view: {
								visibility: 'hidden',
							},
							traits: [],
						},
					],
				},
				{
					id: 'distinctions',
					name: 'Distinctions',
					description: 'Coastal heritage, town role, and personal quirk',
					view: {
						features: {
							description: true,
							sfx: true,
							subtraits: false,
						},
						ratingLadder: [8, 10, 12],
						page: 1,
						multiDie: false,
						notes: "Gain a PP when you trade out your distinction's die rating for a d4.",
						reservedSlots: 3,
						place: {
							left: '0%',
							top: 0,
							width: '64%',
							height: 1,
						},
						pillar: 'prime',
						altRoll: {
							die: 4,
							ppDelta: 1,
							label: 'Hinder',
						},
					},
					noun: 'Distinction',
					plural: 'Distinctions',
					traits: [
						{
							name: 'Extraordinary:',
							traits: [
								{
									name: 'Hinder',
									rating: {
										type: 'Die',
										value: [4],
										range: [4],
									},
									traits: [],
									noun: 'SFX',
									ppDelta: 1,
								},
							],
							view: {
								badge: {
									text: 'SFX',
									shape: 'vertical-bar',
									color: 'black',
								},
								prompt: true,
							},
						},
						{
							name: 'Backstory:',
							traits: [],
							view: {
								prompt: true,
							},
						},
						{
							name: 'Role:',
							traits: [],
							view: {
								prompt: true,
							},
						},
					],
				},
				{
					id: 'signature-assets-curios',
					name: 'Signature Assets',
					description: 'Heirlooms and keepsakes from the misty coast',
					view: {
						features: {
							description: true,
							sfx: false,
							subtraits: false,
						},
						page: 1,
						style: {
							header: 'default',
							body: 'default',
						},
						ratingLadder: [6, 8, 10, 12],
						multiDie: false,
						notes: '',
						reservedSlots: 3,
						place: {
							left: '64%',
							top: 0,
							width: '36%',
							height: 1,
						},
						parts: {
							rating: {
								left: '0%',
								top: 0,
								width: '100%',
								height: 1,
							},
							name: {
								left: '0%',
								top: 1,
								width: '100%',
								height: 1,
							},
						},
						pillar: 'plus',
					},
					noun: 'Signature Asset',
					plural: 'Signature Assets',
					traits: [],
				},
				{
					id: 'emotional-attributes-stress',
					name: 'Attributes',
					description: 'Core emotional drives with corresponding statements and stress',
					statement: true,
					view: {
						features: {
							description: true,
							sfx: false,
							subtraits: false,
						},
						page: 1,
						style: {
							header: 'default',
							body: 'default',
						},
						ratingLadder: [4, 6, 8, 10, 12],
						multiDie: false,
						notes: '',
						reservedSlots: 5,
						parts: {
							name: {
								left: '0%',
								top: 0,
								width: '30%',
								height: 1,
							},
							rating: {
								left: '30%',
								top: 0,
								width: '30%',
								height: 1,
							},
							trackLabel: {
								left: '60%',
								top: 0,
								width: '13%',
								height: 1,
							},
							track: {
								left: '73%',
								top: 0,
								width: '27%',
								height: 1,
							},
						},
						labels: {
							stress: 'STRESS',
						},
						pillar: 'prime',
						fixedNames: true,
					},
					noun: 'Attribute',
					plural: 'Attributes',
					traits: [
						{
							name: 'Anger',
							traits: [],
						},
						{
							name: 'Desire',
							traits: [],
						},
						{
							name: 'Fear',
							traits: [],
						},
						{
							name: 'Joy',
							traits: [],
						},
						{
							name: 'Sorrow',
							traits: [],
						},
					],
				},
				{
					id: 'town-relationships',
					name: 'Relationships',
					description: 'Bonds and rivalries with local residents',
					view: {
						header: 'top',
						headerAlign: 'left',
						features: {
							description: true,
							sfx: false,
							subtraits: false,
						},
						page: 1,
						style: {
							header: 'default',
							body: 'default',
						},
						ratingLadder: [4, 6, 8, 10, 12],
						multiDie: false,
						notes: '',
						reservedSlots: 10,
						place: {
							left: '0%',
							top: 2,
							width: '64%',
							height: 1,
						},
						parts: {
							name: {
								left: '0%',
								top: 0,
								width: '70%',
								height: 1,
							},
							rating: {
								left: '70%',
								top: 0,
								width: '30%',
								height: 1,
							},
							description: {
								left: '0%',
								top: 1,
								width: '100%',
								height: 1,
							},
						},
						pillar: 'prime',
					},
					noun: 'Relationship',
					plural: 'Relationships',
					traits: [],
				},
				{
					id: 'growth-pool',
					name: 'Growth Pool',
					view: {
						header: 'top',
						headerAlign: 'left',
						features: {
							description: false,
							sfx: false,
							subtraits: false,
						},
						page: 1,
						style: {
							header: 'default',
							body: 'dice-count',
						},
						ratingLadder: [4, 6, 8, 10, 12],
						multiDie: true,
						reservedSlots: 5,
						place: {
							left: '64%',
							top: 2,
							width: '36%',
							height: 1,
						},
						labels: {
							rating: 'RATING',
							dice: '/ DICE',
						},
						pillar: 'play',
					},
					pool: true,
					noun: 'Growth Die',
					plural: 'Growth Dice',
					traits: [
						{
							name: 'D4',
							rating: {
								type: 'Die',
								value: [4],
								range: [4, 6, 8, 10, 12],
							},
							spendable: true,
							hitches: 0,
							view: {
								poolCount: 1,
							},
							traits: [],
						},
						{
							name: 'D6',
							rating: {
								type: 'Die',
								value: [6],
								range: [4, 6, 8, 10, 12],
							},
							spendable: true,
							hitches: 0,
							view: {
								poolCount: 1,
							},
							traits: [],
						},
						{
							name: 'D8',
							rating: {
								type: 'Die',
								value: [8],
								range: [4, 6, 8, 10, 12],
							},
							spendable: true,
							hitches: 0,
							view: {
								poolCount: 1,
							},
							traits: [],
						},
						{
							name: 'D10',
							rating: {
								type: 'Die',
								value: [10],
								range: [4, 6, 8, 10, 12],
							},
							spendable: true,
							hitches: 0,
							view: {
								poolCount: 1,
							},
							traits: [],
						},
						{
							name: 'D12',
							rating: {
								type: 'Die',
								value: [12],
								range: [4, 6, 8, 10, 12],
							},
							spendable: true,
							hitches: 0,
							view: {
								poolCount: 1,
							},
							traits: [],
						},
					],
				},
				{
					id: 'complications',
					name: 'Complications',
					view: {
						features: {
							description: true,
							sfx: false,
							subtraits: false,
						},
						page: 1,
						style: {
							header: 'default',
							body: 'default',
						},
						ratingLadder: [6, 8, 10, 12],
						reservedSlots: 5,
						place: {
							left: '64%',
							top: 3,
							width: '36%',
							height: 1,
						},
						parts: {
							rating: {
								left: '0%',
								top: 0,
								width: '100%',
								height: 1,
							},
							name: {
								left: '0%',
								top: 1,
								width: '100%',
								height: 1,
							},
						},
						playMutable: true,
						pillar: 'play',
					},
					noun: 'Complication',
					plural: 'Complications',
					traits: [],
				},
			],
		},
	},
	{
		id: 'necromancer',
		version: 1,
		character: {
			$schema: '../schema/0.1/character.schema.json',
			version: '0.1',
			id: 'template-necromancer',
			isTemplate: true,
			name: '',
			game: 'Necromancer',
			description: '',
			pronouns: '',
			plotPoints: 1,
			notes: '',
			player: '',
			portrait: {
				url: '',
				view: {
					location: 'header',
				},
			},
			view: {
				pageCount: 1,
				template: 'Necromancer',
				watermark: {
					enabled: true,
					url: 'images/cortex_prime_logo_light_transparent.png',
					opacity: 0.08,
					scale: 70,
					page: 'all',
				},
				columnAlignment: 'top-base',
				columnOffsets: {
					left: 0,
					center: 0,
					right: 0,
				},
				listing: {
					subtitle: 'Dark Fantasy Grimoire & Undead Arts',
					genre: 'Urban fantasy',
					variant: 'Caster File',
					url: 'https://legacy.drivethrurpg.com/product/574557/Necromancer?manufacturers_id=31866',
					image: 'https://legacy.drivethrurpg.com/images/31866/574557.jpg',
					quote: 'You didn’t ask for this. You were just trying to live your life.',
					setting: 'd8',
					prep: 'd6',
					complexity: 'd8',
				},
			},
			traitSets: [
				{
					id: 'name',
					name: 'Name',
					view: {
						style: {
							header: 'default',
							body: 'name',
						},
						page: 1,
					},
					traits: [
						{
							name: 'name',
							label: 'Name',
							traits: [],
						},
						{
							name: 'player',
							label: 'Player',
							traits: [],
						},
						{
							name: 'nickname',
							label: 'Nickname',
							traits: [],
						},
						{
							name: 'pronouns',
							label: 'Pronouns',
							traits: [],
						},
						{
							name: 'description',
							label: 'Description',
							traits: [],
						},
						{
							name: 'game',
							label: 'Game',
							view: {
								visibility: 'hidden',
							},
							traits: [],
						},
						{
							name: 'portrait',
							traits: [],
						},
						{
							name: 'caption',
							traits: [],
						},
						{
							name: 'plotPoints',
							rating: {
								type: 'Counter',
								value: [1],
								range: [0, 20],
							},
							label: 'PP',
							spendable: true,
							view: {
								visibility: 'hidden',
							},
							traits: [],
						},
						{
							name: 'notes',
							view: {
								visibility: 'hidden',
							},
							traits: [],
						},
					],
				},
				{
					id: 'distinctions',
					name: 'Distinctions',
					description: 'Occult lineage, taboo practice, and philosophical motivation',
					view: {
						features: {
							description: true,
							sfx: false,
							subtraits: false,
						},
						ratingLadder: [8],
						page: 1,
						multiDie: false,
						notes: "Gain a PP when you trade out your distinction's d8 rating for a d4.",
						reservedSlots: 3,
						pillar: 'prime',
						altRoll: {
							die: 4,
							ppDelta: 1,
							label: 'Hinder',
						},
					},
					noun: 'Distinction',
					plural: 'Distinctions',
					traits: [
						{
							name: 'Job:',
							rating: {
								type: 'Die',
								value: [8],
								range: [4, 6, 8, 10, 12],
							},
							traits: [
								{
									name: 'Hinder',
									rating: {
										type: 'Die',
										value: [4],
										range: [4],
									},
									traits: [],
									noun: 'SFX',
									ppDelta: 1,
								},
							],
							view: {
								badge: {
									text: 'SFX',
									shape: 'vertical-bar',
									color: 'black',
								},
								prompt: true,
							},
						},
						{
							name: 'Necromancy:',
							rating: {
								type: 'Die',
								value: [8],
								range: [4, 6, 8, 10, 12],
							},
							traits: [
								{
									name: 'Hinder',
									rating: {
										type: 'Die',
										value: [4],
										range: [4],
									},
									traits: [],
									noun: 'SFX',
									ppDelta: 1,
								},
							],
							view: {
								badge: {
									text: 'SFX',
									shape: 'vertical-bar',
									color: 'black',
								},
								prompt: true,
							},
						},
						{
							name: 'Desire:',
							rating: {
								type: 'Die',
								value: [8],
								range: [4, 6, 8, 10, 12],
							},
							traits: [
								{
									name: 'Hinder',
									rating: {
										type: 'Die',
										value: [4],
										range: [4],
									},
									traits: [],
									noun: 'SFX',
									ppDelta: 1,
								},
							],
							view: {
								badge: {
									text: 'SFX',
									shape: 'vertical-bar',
									color: 'black',
								},
								prompt: true,
							},
						},
					],
				},
				{
					id: 'affiliations',
					name: 'Affiliations',
					description: 'Operating configuration dice and statements',
					statement: true,
					view: {
						header: 'top',
						headerAlign: 'center',
						features: {
							description: true,
							sfx: false,
							subtraits: false,
						},
						page: 1,
						style: {
							header: 'default',
							body: 'default',
						},
						ratingLadder: [4, 6, 8, 10, 12],
						multiDie: false,
						notes: '',
						reservedSlots: 3,
						parts: {
							name: {
								left: '0%',
								top: 0,
								width: '70%',
								height: 1,
							},
							rating: {
								left: '70%',
								top: 0,
								width: '30%',
								height: 1,
							},
						},
						pillar: 'prime',
						fixedNames: true,
					},
					noun: 'Affiliation',
					plural: 'Affiliations',
					traits: [
						{
							name: 'My Life',
							traits: [],
						},
						{
							name: 'The World',
							traits: [],
						},
						{
							name: 'The Demi-Monde',
							traits: [],
						},
					],
				},
				{
					id: 'roles-specialties',
					name: 'Roles',
					description: 'Dark magical callings and practices',
					view: {
						header: 'top',
						headerAlign: 'center',
						features: {
							description: false,
							sfx: false,
							subtraits: false,
						},
						page: 1,
						style: {
							header: 'default',
							body: 'default',
						},
						ratingLadder: [4, 6, 8, 10, 12],
						multiDie: false,
						notes: '',
						reservedSlots: 6,
						place: {
							left: '0%',
							top: 2,
							width: '38%',
							height: 1,
						},
						pillar: 'prime',
						fixedNames: true,
					},
					noun: 'Role',
					plural: 'Roles',
					traits: [
						{
							name: 'Diplomat',
							traits: [],
						},
						{
							name: 'Fighter',
							traits: [],
						},
						{
							name: 'Guardian',
							traits: [],
						},
						{
							name: 'Healer',
							traits: [],
						},
						{
							name: 'Sneak',
							traits: [],
						},
						{
							name: 'Transporter',
							traits: [],
						},
					],
				},
				{
					id: 'signature-assets',
					name: 'Signature Assets',
					description: 'Occult relics, grimoires, and dark instruments',
					view: {
						header: 'top',
						headerAlign: 'center',
						features: {
							description: true,
							sfx: false,
							subtraits: false,
						},
						page: 1,
						style: {
							header: 'default',
							body: 'default',
						},
						ratingLadder: [6, 8, 10, 12],
						multiDie: false,
						notes: '',
						reservedSlots: 3,
						place: {
							left: '0%',
							top: 3,
							width: '38%',
							height: 1,
						},
						parts: {
							rating: {
								left: '0%',
								top: 0,
								width: '100%',
								height: 1,
							},
							name: {
								left: '0%',
								top: 1,
								width: '100%',
								height: 1,
							},
						},
						pillar: 'plus',
					},
					noun: 'Signature Asset',
					plural: 'Signature Assets',
					traits: [],
				},
				{
					id: 'necromantic-arts',
					name: 'Ability',
					description: 'EFFECT TAGS: ATTACK • SENSORY • MOVEMENT • CONTROL • DEFENSE • ENHANCEMENT',
					view: {
						header: 'top',
						headerAlign: 'center',
						features: {
							description: true,
							sfx: true,
							subtraits: true,
						},
						page: 1,
						style: {
							header: 'default',
							body: 'default',
						},
						ratingLadder: [8, 10, 12],
						multiDie: false,
						notes: '',
						reservedSlots: 1,
						place: {
							left: '38%',
							top: 2,
							width: '62%',
							height: 1,
						},
						pillar: 'plus',
					},
					noun: 'Ability',
					plural: 'Abilities',
					traits: [
						{
							name: 'Necromancy',
							traits: [
								{
									name: 'Descriptor Tags:',
									traits: [],
								},
								{
									name: 'Been There',
									description: 'When you are resurrecting a ______________, double your Necromancy.',
									traits: [],
									noun: 'SFX',
								},
								{
									name: 'Done That',
									description: 'When a ______________ you resurrected creates or exacerbates a problem, earn a PP.',
									traits: [],
									noun: 'SFX',
								},
								{
									name: 'Limit — Dammit',
									description:
										'When you injure, maim, or kill with Necromancy or kill by any means, gain the Deathmark complication at d4 or step it up. When your Deathmark steps up past d12, add the d12 to the doom pool and lose access to your Necromancy for the duration of the scene.',
									traits: [],
									noun: 'SFX',
								},
							],
							view: {
								badge: {
									text: 'SFX',
									shape: 'vertical-bar',
									color: 'black',
								},
							},
						},
					],
				},
				{
					id: 'session-record',
					name: 'Session Record',
					view: {
						header: 'top',
						headerAlign: 'left',
						features: {
							description: false,
							sfx: false,
							subtraits: false,
						},
						page: 1,
						style: {
							header: 'default',
							body: 'pips',
						},
						reservedSlots: 10,
						place: {
							left: '0%',
							top: 4,
							width: '62%',
							height: 1,
						},
						pips: {
							labels: true,
							perRow: 10,
						},
						pillar: 'play',
					},
					rating: {
						type: 'Pip',
						value: [false, false, false, false, false, false, false, false, false, false],
					},
					noun: 'Session',
					plural: 'Sessions',
					traits: [],
				},
				{
					id: 'complications',
					name: 'Complications',
					view: {
						header: 'top',
						headerAlign: 'center',
						features: {
							description: true,
							sfx: false,
							subtraits: false,
						},
						page: 1,
						style: {
							header: 'default',
							body: 'default',
						},
						ratingLadder: [4, 6, 8, 10, 12],
						reservedSlots: 3,
						place: {
							left: '62%',
							top: 4,
							width: '38%',
							height: 1,
						},
						parts: {
							rating: {
								left: '0%',
								top: 0,
								width: '100%',
								height: 1,
							},
							name: {
								left: '0%',
								top: 1,
								width: '100%',
								height: 1,
							},
						},
						playMutable: true,
						pillar: 'play',
					},
					noun: 'Complication',
					plural: 'Complications',
					traits: [
						{
							name: 'Deathmark',
							description: 'Deathmark',
							traits: [],
						},
					],
				},
			],
		},
	},
	{
		id: 'retired-crystalline',
		version: 1,
		character: {
			$schema: '../schema/0.1/character.schema.json',
			version: '0.1',
			id: 'template-retired-crystalline',
			isTemplate: true,
			name: '',
			game: 'Retired No More',
			description: '',
			pronouns: '',
			plotPoints: 1,
			notes: '',
			player: '',
			portrait: {
				url: '',
				view: {
					location: 'header',
				},
			},
			view: {
				pageCount: 1,
				template: 'Retired No More',
				watermark: {
					enabled: true,
					url: 'images/cortex_prime_logo_light_transparent.png',
					opacity: 0.08,
					scale: 70,
					page: 'all',
				},
				columnAlignment: 'top-base',
				columnOffsets: {
					left: 0,
					center: 0,
					right: 0,
				},
				listing: {
					title: 'Retired No More - Crystalline Age',
					subtitle: 'Aging Veteran Heroes',
					genre: 'Pulp adventure',
					variant: 'Crystalline Age',
					url: 'https://legacy.drivethrurpg.com/product/567044/Retired-No-More?manufacturers_id=31866',
					image: 'https://legacy.drivethrurpg.com/images/31866/567044.jpg',
					quote: 'You had a good run. Crystal artifacts recovered, sky pirates outwitted, ancient ruins plundered.',
					setting: 'd8',
					prep: 'd6',
					complexity: 'd8',
				},
			},
			traitSets: [
				{
					id: 'name',
					name: 'Name',
					view: {
						style: {
							header: 'default',
							body: 'name',
						},
						page: 1,
					},
					traits: [
						{
							name: 'name',
							label: 'Name',
							traits: [],
						},
						{
							name: 'player',
							label: 'Player',
							traits: [],
						},
						{
							name: 'nickname',
							label: 'Nickname',
							traits: [],
						},
						{
							name: 'pronouns',
							label: 'Pronouns',
							traits: [],
						},
						{
							name: 'description',
							label: 'Description',
							traits: [],
						},
						{
							name: 'game',
							label: 'Game',
							view: {
								visibility: 'hidden',
							},
							traits: [],
						},
						{
							name: 'portrait',
							traits: [],
						},
						{
							name: 'caption',
							traits: [],
						},
						{
							name: 'plotPoints',
							rating: {
								type: 'Counter',
								value: [1],
								range: [0, 20],
							},
							label: 'PP',
							spendable: true,
							view: {
								visibility: 'hidden',
							},
							traits: [],
						},
						{
							name: 'notes',
							view: {
								visibility: 'hidden',
							},
							traits: [],
						},
					],
				},
				{
					id: 'values',
					name: 'Values',
					description: 'Enduring principles of the golden era',
					view: {
						features: {
							description: false,
							sfx: false,
							subtraits: false,
						},
						page: 1,
						style: {
							header: 'default',
							body: 'default',
						},
						ratingLadder: [4, 6, 8, 10, 12],
						multiDie: false,
						notes: '',
						reservedSlots: 7,
						place: {
							left: '0%',
							top: 0,
							width: '28%',
							height: 1,
						},
						parts: {
							name: {
								left: '0%',
								top: 0,
								width: '100%',
								height: 1,
							},
							rating: {
								left: '0%',
								top: 1,
								width: '100%',
								height: 1,
							},
						},
						pillar: 'prime',
						fixedNames: true,
					},
					noun: 'Value',
					plural: 'Values',
					traits: [
						{
							name: 'Allegiance',
							traits: [],
						},
						{
							name: 'Glory',
							traits: [],
						},
						{
							name: 'Integrity',
							traits: [],
						},
						{
							name: 'Knowledge',
							traits: [],
						},
						{
							name: 'Novelty',
							traits: [],
						},
						{
							name: 'Power',
							traits: [],
						},
						{
							name: 'Riches',
							traits: [],
						},
					],
				},
				{
					id: 'distinctions',
					name: 'Distinctions',
					description: 'Past glory, modern civilian life, and the call to return',
					view: {
						features: {
							description: true,
							sfx: true,
							subtraits: false,
						},
						ratingLadder: [8],
						page: 1,
						multiDie: false,
						notes: "Gain a PP when you trade out your distinction's d8 rating for a d4.",
						reservedSlots: 3,
						place: {
							left: '28%',
							top: 0,
							width: '72%',
							height: 1,
						},
						pillar: 'prime',
						altRoll: {
							die: 4,
							ppDelta: 1,
							label: 'Hinder',
						},
					},
					noun: 'Distinction',
					plural: 'Distinctions',
					traits: [
						{
							name: 'Archetype',
							rating: {
								type: 'Die',
								value: [8],
								range: [4, 6, 8, 10, 12],
							},
							traits: [
								{
									name: 'Hinder',
									rating: {
										type: 'Die',
										value: [4],
										range: [4],
									},
									traits: [],
									noun: 'SFX',
									ppDelta: 1,
								},
							],
							view: {
								badge: {
									text: 'SFX',
									shape: 'vertical-bar',
									color: 'black',
								},
							},
						},
						{
							name: 'Retirement',
							rating: {
								type: 'Die',
								value: [8],
								range: [4, 6, 8, 10, 12],
							},
							traits: [
								{
									name: 'Hinder',
									rating: {
										type: 'Die',
										value: [4],
										range: [4],
									},
									traits: [],
									noun: 'SFX',
									ppDelta: 1,
								},
							],
							view: {
								badge: {
									text: 'SFX',
									shape: 'vertical-bar',
									color: 'black',
								},
							},
						},
						{
							name: 'Satisfaction',
							rating: {
								type: 'Die',
								value: [8],
								range: [4, 6, 8, 10, 12],
							},
							traits: [
								{
									name: 'Hinder',
									rating: {
										type: 'Die',
										value: [4],
										range: [4],
									},
									traits: [],
									noun: 'SFX',
									ppDelta: 1,
								},
							],
							view: {
								badge: {
									text: 'SFX',
									shape: 'vertical-bar',
									color: 'black',
								},
							},
						},
					],
				},
				{
					id: 'vintage-resources-assets',
					name: 'Resources',
					description: 'Stashed tech, vintage vehicles, and old connections (5d6 each)',
					view: {
						header: 'top',
						headerAlign: 'center',
						features: {
							description: true,
							sfx: false,
							subtraits: false,
						},
						page: 1,
						style: {
							header: 'default',
							body: 'default',
						},
						ratingLadder: [6],
						multiDie: true,
						notes: '',
						reservedSlots: 5,
						place: {
							left: '0%',
							top: 1,
							width: '28%',
							height: 1,
						},
						parts: {
							name: {
								left: '0%',
								top: 0,
								width: '100%',
								height: 1,
							},
							rating: {
								left: '0%',
								top: 1,
								width: '100%',
								height: 1,
							},
							description: {
								left: '0%',
								top: 2,
								width: '100%',
								height: 1,
							},
						},
						pillar: 'plus',
					},
					noun: 'Resource',
					plural: 'Resources',
					traits: [
						{
							name: '',
							rating: {
								type: 'Dice',
								value: [6, 6, 6, 6, 6],
								range: [4, 6, 8, 10, 12],
							},
							spendable: true,
							hitches: 0,
							traits: [],
						},
						{
							name: '',
							rating: {
								type: 'Dice',
								value: [6, 6, 6, 6, 6],
								range: [4, 6, 8, 10, 12],
							},
							spendable: true,
							hitches: 0,
							traits: [],
						},
						{
							name: '',
							rating: {
								type: 'Dice',
								value: [6, 6, 6, 6, 6],
								range: [4, 6, 8, 10, 12],
							},
							spendable: true,
							hitches: 0,
							traits: [],
						},
						{
							name: '',
							rating: {
								type: 'Dice',
								value: [6, 6, 6, 6, 6],
								range: [4, 6, 8, 10, 12],
							},
							spendable: true,
							hitches: 0,
							traits: [],
						},
						{
							name: '',
							rating: {
								type: 'Dice',
								value: [6, 6, 6, 6, 6],
								range: [4, 6, 8, 10, 12],
							},
							spendable: true,
							hitches: 0,
							traits: [],
						},
					],
				},
				{
					id: 'signature-assets',
					name: 'Signature Assets',
					view: {
						header: 'top',
						headerAlign: 'center',
						features: {
							description: true,
							sfx: false,
							subtraits: false,
						},
						page: 1,
						style: {
							header: 'default',
							body: 'default',
						},
						ratingLadder: [6, 8, 10, 12],
						reservedSlots: 2,
						place: {
							left: '0%',
							top: 2,
							width: '28%',
							height: 1,
						},
						parts: {
							name: {
								left: '0%',
								top: 0,
								width: '100%',
								height: 1,
							},
							rating: {
								left: '0%',
								top: 1,
								width: '100%',
								height: 1,
							},
							description: {
								left: '0%',
								top: 2,
								width: '100%',
								height: 1,
							},
						},
						pillar: 'plus',
					},
					noun: 'Asset',
					plural: 'Assets',
					traits: [],
				},
				{
					id: 'aging-complications',
					name: 'Aging Complications',
					view: {
						header: 'top',
						headerAlign: 'center',
						features: {
							description: true,
							sfx: false,
							subtraits: false,
						},
						page: 1,
						style: {
							header: 'default',
							body: 'default',
						},
						ratingLadder: [6, 8, 10, 12],
						reservedSlots: 2,
						place: {
							left: '0%',
							top: 3,
							width: '28%',
							height: 1,
						},
						parts: {
							name: {
								left: '0%',
								top: 0,
								width: '100%',
								height: 1,
							},
							rating: {
								left: '0%',
								top: 1,
								width: '100%',
								height: 1,
							},
							description: {
								left: '0%',
								top: 2,
								width: '100%',
								height: 1,
							},
						},
						playMutable: true,
						pillar: 'play',
					},
					noun: 'Complication',
					plural: 'Complications',
					traits: [],
				},
				{
					id: 'subtrait-columns',
					name: 'Skills & Specialties',
					description: 'Mundane d4-d6 skills stepped up by d8-d12 veteran specialties',
					view: {
						header: 'top',
						headerAlign: 'center',
						features: {
							description: false,
							sfx: false,
							subtraits: true,
						},
						page: 1,
						style: {
							header: 'default',
							body: 'subtrait-columns',
						},
						ratingLadder: [4, 6],
						subtraitRatingLadder: [8, 10, 12],
						labels: {
							left: 'Skills',
							right: 'Specialties',
						},
						multiDie: false,
						notes: '',
						reservedSlots: 16,
						place: {
							left: '28%',
							top: 1,
							width: '72%',
							height: 1,
						},
						pillar: 'prime',
						fixedNames: true,
					},
					noun: 'Skill',
					plural: 'Skills',
					traits: [
						{
							name: 'Craft',
							traits: [],
						},
						{
							name: 'Fight',
							traits: [],
						},
						{
							name: 'Fly',
							traits: [],
						},
						{
							name: 'Focus',
							traits: [],
						},
						{
							name: 'Influence',
							traits: [],
						},
						{
							name: 'Know',
							traits: [],
						},
						{
							name: 'Labor',
							traits: [],
						},
						{
							name: 'Move',
							traits: [],
						},
						{
							name: 'Notice',
							traits: [],
						},
						{
							name: 'Perform',
							traits: [],
						},
						{
							name: 'Sneak',
							traits: [],
						},
						{
							name: 'Survive',
							traits: [],
						},
						{
							name: 'Throw',
							traits: [],
						},
						{
							name: 'Tinker',
							traits: [],
						},
						{
							name: 'Treat',
							traits: [],
						},
						{
							name: 'Trick',
							traits: [],
						},
					],
				},
			],
		},
	},
	{
		id: 'retired-aerial',
		version: 1,
		character: {
			$schema: '../schema/0.1/character.schema.json',
			version: '0.1',
			id: 'template-retired-aerial',
			isTemplate: true,
			name: '',
			game: 'Retired No More',
			description: '',
			pronouns: '',
			plotPoints: 1,
			notes: '',
			player: '',
			portrait: {
				url: '',
				view: {
					location: 'header',
				},
			},
			view: {
				pageCount: 1,
				template: 'Retired No More',
				watermark: {
					enabled: true,
					url: 'images/cortex_prime_logo_light_transparent.png',
					opacity: 0.08,
					scale: 70,
					page: 'all',
				},
				columnAlignment: 'top-base',
				columnOffsets: {
					left: 0,
					center: 0,
					right: 0,
				},
				listing: {
					title: 'Retired No More - Aerial Age',
					subtitle: 'Aging Veteran Heroes',
					genre: 'Pulp adventure',
					variant: 'Aerial Age',
					url: 'https://legacy.drivethrurpg.com/product/567044/Retired-No-More?manufacturers_id=31866',
					image: 'https://legacy.drivethrurpg.com/images/31866/567044.jpg',
					quote: 'You had a good run. Crystal artifacts recovered, sky pirates outwitted, ancient ruins plundered.',
					setting: 'd8',
					prep: 'd6',
					complexity: 'd8',
				},
			},
			traitSets: [
				{
					id: 'name',
					name: 'Name',
					view: {
						style: {
							header: 'default',
							body: 'name',
						},
						page: 1,
					},
					traits: [
						{
							name: 'name',
							label: 'Name',
							traits: [],
						},
						{
							name: 'player',
							label: 'Player',
							traits: [],
						},
						{
							name: 'nickname',
							label: 'Nickname',
							traits: [],
						},
						{
							name: 'pronouns',
							label: 'Pronouns',
							traits: [],
						},
						{
							name: 'description',
							label: 'Description',
							traits: [],
						},
						{
							name: 'game',
							label: 'Game',
							view: {
								visibility: 'hidden',
							},
							traits: [],
						},
						{
							name: 'portrait',
							traits: [],
						},
						{
							name: 'caption',
							traits: [],
						},
						{
							name: 'plotPoints',
							rating: {
								type: 'Counter',
								value: [1],
								range: [0, 20],
							},
							label: 'PP',
							spendable: true,
							view: {
								visibility: 'hidden',
							},
							traits: [],
						},
						{
							name: 'notes',
							view: {
								visibility: 'hidden',
							},
							traits: [],
						},
					],
				},
				{
					id: 'values',
					name: 'Values',
					description: "The aviator's code and sky ethics",
					view: {
						features: {
							description: false,
							sfx: false,
							subtraits: false,
						},
						page: 1,
						style: {
							header: 'default',
							body: 'default',
						},
						ratingLadder: [4, 6, 8, 10, 12],
						multiDie: false,
						notes: '',
						reservedSlots: 7,
						place: {
							left: '0%',
							top: 0,
							width: '28%',
							height: 1,
						},
						parts: {
							name: {
								left: '0%',
								top: 0,
								width: '100%',
								height: 1,
							},
							rating: {
								left: '0%',
								top: 1,
								width: '100%',
								height: 1,
							},
						},
						pillar: 'prime',
						fixedNames: true,
					},
					noun: 'Value',
					plural: 'Values',
					traits: [
						{
							name: 'Allegiance',
							traits: [],
						},
						{
							name: 'Glory',
							traits: [],
						},
						{
							name: 'Integrity',
							traits: [],
						},
						{
							name: 'Knowledge',
							traits: [],
						},
						{
							name: 'Novelty',
							traits: [],
						},
						{
							name: 'Power',
							traits: [],
						},
						{
							name: 'Riches',
							traits: [],
						},
					],
				},
				{
					id: 'distinctions',
					name: 'Distinctions',
					description: 'Aerial legend and grounded retirement',
					view: {
						features: {
							description: true,
							sfx: true,
							subtraits: false,
						},
						ratingLadder: [8],
						page: 1,
						multiDie: false,
						notes: "Gain a PP when you trade out your distinction's d8 rating for a d4.",
						reservedSlots: 2,
						place: {
							left: '28%',
							top: 0,
							width: '72%',
							height: 1,
						},
						pillar: 'prime',
						altRoll: {
							die: 4,
							ppDelta: 1,
							label: 'Hinder',
						},
					},
					noun: 'Distinction',
					plural: 'Distinctions',
					traits: [
						{
							name: 'Archetype:',
							rating: {
								type: 'Die',
								value: [8],
								range: [4, 6, 8, 10, 12],
							},
							traits: [
								{
									name: 'Hinder',
									rating: {
										type: 'Die',
										value: [4],
										range: [4],
									},
									traits: [],
									noun: 'SFX',
									ppDelta: 1,
								},
							],
							view: {
								badge: {
									text: 'SFX',
									shape: 'vertical-bar',
									color: 'black',
								},
								prompt: true,
							},
						},
						{
							name: 'Retirement:',
							rating: {
								type: 'Die',
								value: [8],
								range: [4, 6, 8, 10, 12],
							},
							traits: [
								{
									name: 'Hinder',
									rating: {
										type: 'Die',
										value: [4],
										range: [4],
									},
									traits: [],
									noun: 'SFX',
									ppDelta: 1,
								},
							],
							view: {
								badge: {
									text: 'SFX',
									shape: 'vertical-bar',
									color: 'black',
								},
								prompt: true,
							},
						},
					],
				},
				{
					id: 'vintage-plane-signature-assets',
					name: 'Resources',
					description: 'Custom aircraft and aviator resources (5d6 each)',
					view: {
						header: 'top',
						headerAlign: 'center',
						features: {
							description: true,
							sfx: false,
							subtraits: false,
						},
						page: 1,
						style: {
							header: 'default',
							body: 'default',
						},
						ratingLadder: [6],
						multiDie: true,
						notes: '',
						reservedSlots: 3,
						place: {
							left: '0%',
							top: 1,
							width: '28%',
							height: 1,
						},
						parts: {
							name: {
								left: '0%',
								top: 0,
								width: '100%',
								height: 1,
							},
							rating: {
								left: '0%',
								top: 1,
								width: '100%',
								height: 1,
							},
							description: {
								left: '0%',
								top: 2,
								width: '100%',
								height: 1,
							},
						},
						pillar: 'plus',
					},
					noun: 'Resource',
					plural: 'Resources',
					traits: [
						{
							name: '',
							rating: {
								type: 'Dice',
								value: [6, 6, 6, 6, 6],
								range: [4, 6, 8, 10, 12],
							},
							spendable: true,
							hitches: 0,
							traits: [],
						},
						{
							name: '',
							rating: {
								type: 'Dice',
								value: [6, 6, 6, 6, 6],
								range: [4, 6, 8, 10, 12],
							},
							spendable: true,
							hitches: 0,
							traits: [],
						},
						{
							name: '',
							rating: {
								type: 'Dice',
								value: [6, 6, 6, 6, 6],
								range: [4, 6, 8, 10, 12],
							},
							spendable: true,
							hitches: 0,
							traits: [],
						},
					],
				},
				{
					id: 'signature-asset',
					name: 'Signature Asset',
					view: {
						header: 'top',
						headerAlign: 'center',
						features: {
							description: true,
							sfx: false,
							subtraits: false,
						},
						page: 1,
						style: {
							header: 'default',
							body: 'default',
						},
						ratingLadder: [6, 8, 10, 12],
						reservedSlots: 1,
						place: {
							left: '0%',
							top: 2,
							width: '28%',
							height: 1,
						},
						parts: {
							name: {
								left: '0%',
								top: 0,
								width: '100%',
								height: 1,
							},
							rating: {
								left: '0%',
								top: 1,
								width: '100%',
								height: 1,
							},
							description: {
								left: '0%',
								top: 2,
								width: '100%',
								height: 1,
							},
						},
						pillar: 'plus',
					},
					noun: 'Asset',
					plural: 'Assets',
					traits: [],
				},
				{
					id: 'subtrait-columns',
					name: 'Skills & Specialties',
					description: 'Flight and tactical skills (d4-d6) with veteran specialties (d8-d12)',
					view: {
						header: 'top',
						headerAlign: 'center',
						features: {
							description: false,
							sfx: false,
							subtraits: true,
						},
						page: 1,
						style: {
							header: 'default',
							body: 'subtrait-columns',
						},
						ratingLadder: [4, 6],
						subtraitRatingLadder: [8, 10, 12],
						labels: {
							left: 'Skills',
							right: 'Specialties',
						},
						multiDie: false,
						notes: '',
						reservedSlots: 9,
						place: {
							left: '28%',
							top: 1,
							width: '72%',
							height: 1,
						},
						pillar: 'prime',
						fixedNames: true,
					},
					noun: 'Skill',
					plural: 'Skills',
					traits: [],
				},
				{
					id: 'session-record',
					name: 'Session Record',
					description: '1: Training • 2: Adventuring Triumph • 3: Retirement',
					view: {
						header: 'top',
						headerAlign: 'left',
						features: {
							description: false,
							sfx: false,
							subtraits: false,
						},
						page: 1,
						style: {
							header: 'default',
							body: 'pips',
						},
						reservedSlots: 20,
						pips: {
							labels: true,
							perRow: 20,
						},
						pillar: 'play',
					},
					rating: {
						type: 'Pip',
						value: [
							false,
							false,
							false,
							false,
							false,
							false,
							false,
							false,
							false,
							false,
							false,
							false,
							false,
							false,
							false,
							false,
							false,
							false,
							false,
							false,
						],
					},
					noun: 'Session',
					plural: 'Sessions',
					traits: [
						{
							name: 'Training',
							description: 'Training',
							traits: [],
						},
						{
							name: 'Adventuring Triumph',
							description: 'Adventuring Triumph',
							traits: [],
						},
						{
							name: 'Retirement',
							description: 'Retirement',
							traits: [],
						},
					],
				},
			],
		},
	},
	{
		id: 'safe-zone-survivor',
		version: 1,
		character: {
			$schema: '../schema/0.1/character.schema.json',
			version: '0.1',
			id: 'template-safe-zone-survivor',
			isTemplate: true,
			name: '',
			game: 'Safe Zone',
			description: '',
			pronouns: '',
			plotPoints: 1,
			notes: '',
			player: '',
			portrait: {
				url: '',
				view: {
					location: 'header',
				},
			},
			view: {
				pageCount: 1,
				template: 'Safe Zone',
				watermark: {
					enabled: true,
					url: 'images/cortex_prime_logo_light_transparent.png',
					opacity: 0.08,
					scale: 70,
					page: 'all',
				},
				columnAlignment: 'top-base',
				columnOffsets: {
					left: 0,
					center: 0,
					right: 0,
				},
				listing: {
					subtitle: 'Post-Apocalyptic Survival & Colony',
					genre: 'Post-apocalyptic zombie survival | Base-building',
					variant: 'Survivor File',
					url: 'https://legacy.drivethrurpg.com/product/574559/Safe-Zone?manufacturers_id=31866',
					image: 'https://legacy.drivethrurpg.com/images/31866/574559.jpg',
					quote: 'The Rot took the world. The Rotters are still out there, but they’re not the problem anymore.',
					setting: 'd8',
					prep: 'd8',
					complexity: 'd8',
				},
			},
			traitSets: [
				{
					id: 'name',
					name: 'Name',
					view: {
						style: {
							header: 'default',
							body: 'name',
						},
						page: 1,
					},
					traits: [
						{
							name: 'name',
							label: 'Name',
							traits: [],
						},
						{
							name: 'player',
							label: 'Player',
							traits: [],
						},
						{
							name: 'nickname',
							label: 'Nickname',
							traits: [],
						},
						{
							name: 'pronouns',
							label: 'Pronouns',
							traits: [],
						},
						{
							name: 'description',
							label: 'Description',
							traits: [],
						},
						{
							name: 'game',
							label: 'Game',
							view: {
								visibility: 'hidden',
							},
							traits: [],
						},
						{
							name: 'portrait',
							traits: [],
						},
						{
							name: 'caption',
							traits: [],
						},
						{
							name: 'plotPoints',
							rating: {
								type: 'Counter',
								value: [1],
								range: [0, 20],
							},
							label: 'PP',
							spendable: true,
							view: {
								visibility: 'hidden',
							},
							traits: [],
						},
						{
							name: 'notes',
							view: {
								visibility: 'hidden',
							},
							traits: [],
						},
					],
				},
				{
					id: 'distinctions',
					name: 'Distinctions',
					description: 'Pre-fall life, current survival role, and future hope',
					view: {
						features: {
							description: true,
							sfx: false,
							subtraits: false,
						},
						ratingLadder: [8],
						page: 1,
						multiDie: false,
						notes: "Gain a PP when you trade out your distinction's d8 rating for a d4.",
						reservedSlots: 3,
						pillar: 'prime',
						altRoll: {
							die: 4,
							ppDelta: 1,
							label: 'Hinder',
						},
					},
					noun: 'Distinction',
					plural: 'Distinctions',
					traits: [
						{
							name: 'Before:',
							rating: {
								type: 'Die',
								value: [8],
								range: [4, 6, 8, 10, 12],
							},
							traits: [
								{
									name: 'Hinder',
									rating: {
										type: 'Die',
										value: [4],
										range: [4],
									},
									traits: [],
									noun: 'SFX',
									ppDelta: 1,
								},
							],
							view: {
								badge: {
									text: 'SFX',
									shape: 'vertical-bar',
									color: 'black',
								},
								prompt: true,
							},
						},
						{
							name: 'Now:',
							rating: {
								type: 'Die',
								value: [8],
								range: [4, 6, 8, 10, 12],
							},
							traits: [
								{
									name: 'Hinder',
									rating: {
										type: 'Die',
										value: [4],
										range: [4],
									},
									traits: [],
									noun: 'SFX',
									ppDelta: 1,
								},
							],
							view: {
								badge: {
									text: 'SFX',
									shape: 'vertical-bar',
									color: 'black',
								},
								prompt: true,
							},
						},
						{
							name: 'Future:',
							rating: {
								type: 'Die',
								value: [8],
								range: [4, 6, 8, 10, 12],
							},
							traits: [
								{
									name: 'Hinder',
									rating: {
										type: 'Die',
										value: [4],
										range: [4],
									},
									traits: [],
									noun: 'SFX',
									ppDelta: 1,
								},
							],
							view: {
								badge: {
									text: 'SFX',
									shape: 'vertical-bar',
									color: 'black',
								},
								prompt: true,
							},
						},
					],
				},
				{
					id: 'subtrait-columns',
					name: 'Skills & Specialties',
					description: 'Practical survival disciplines (d4-d6) with specialized traits (d8-d12)',
					view: {
						header: 'top',
						headerAlign: 'center',
						features: {
							description: false,
							sfx: false,
							subtraits: true,
						},
						page: 1,
						style: {
							header: 'default',
							body: 'subtrait-columns',
						},
						ratingLadder: [4, 6],
						subtraitRatingLadder: [8, 10, 12],
						labels: {
							left: 'Skills',
							right: 'Specialties',
						},
						multiDie: false,
						notes: '',
						reservedSlots: 20,
						place: {
							left: '0%',
							top: 1,
							width: '66.663%',
							height: 1,
						},
						pillar: 'prime',
						fixedNames: true,
					},
					noun: 'Skill',
					plural: 'Skills',
					traits: [
						{
							name: 'Animals',
							traits: [],
						},
						{
							name: 'Athletics',
							traits: [],
						},
						{
							name: 'Big Guns',
							traits: [],
						},
						{
							name: 'Covert',
							traits: [],
						},
						{
							name: 'Craft',
							traits: [],
						},
						{
							name: 'Creativity',
							traits: [],
						},
						{
							name: 'Drive',
							traits: [],
						},
						{
							name: 'Focus',
							traits: [],
						},
						{
							name: 'Guns',
							traits: [],
						},
						{
							name: 'Influence',
							traits: [],
						},
						{
							name: 'Knowledge',
							traits: [],
						},
						{
							name: 'Mechanic',
							traits: [],
						},
						{
							name: 'Melee',
							traits: [],
						},
						{
							name: 'Notice',
							traits: [],
						},
						{
							name: 'Operate',
							traits: [],
						},
						{
							name: 'Pilot',
							traits: [],
						},
						{
							name: 'Survival',
							traits: [],
						},
						{
							name: 'Thrown',
							traits: [],
						},
						{
							name: 'Treatment',
							traits: [],
						},
						{
							name: 'Unarmed',
							traits: [],
						},
					],
				},
				{
					id: 'attributes',
					name: 'Attributes',
					description: 'Core survival attributes',
					view: {
						header: 'top',
						headerAlign: 'center',
						features: {
							description: false,
							sfx: false,
							subtraits: false,
						},
						page: 1,
						style: {
							header: 'default',
							body: 'default',
						},
						ratingLadder: [4, 6, 8, 10, 12],
						multiDie: false,
						notes: '',
						reservedSlots: 3,
						place: {
							left: '66.663%',
							top: 1,
							width: '33.334%',
							height: 1,
						},
						pillar: 'prime',
						fixedNames: true,
					},
					noun: 'Attribute',
					plural: 'Attributes',
					traits: [
						{
							name: 'Analytical',
							traits: [],
						},
						{
							name: 'Forceful',
							traits: [],
						},
						{
							name: 'Quiet',
							traits: [],
						},
					],
				},
				{
					id: 'relationships',
					name: 'Relationships',
					description: 'Ties to fellow survivors in the camp',
					view: {
						header: 'top',
						headerAlign: 'center',
						features: {
							description: false,
							sfx: false,
							subtraits: false,
						},
						page: 1,
						style: {
							header: 'default',
							body: 'default',
						},
						ratingLadder: [4, 6, 8, 10, 12],
						multiDie: false,
						notes: '',
						reservedSlots: 10,
						place: {
							left: '66.66%',
							top: 2,
							width: '33.334%',
							height: 1,
						},
						pillar: 'prime',
					},
					noun: 'Relationship',
					plural: 'Relationships',
					traits: [],
				},
				{
					id: 'stress',
					name: 'Stress',
					description: 'Survivor stress and trauma',
					view: {
						header: 'top',
						headerAlign: 'center',
						features: {
							description: false,
							sfx: false,
							subtraits: false,
						},
						page: 1,
						style: {
							header: 'default',
							body: 'die-track',
						},
						ratingLadder: [4, 6, 8, 10, 12],
						multiDie: false,
						notes: '',
						reservedSlots: 5,
						place: {
							left: '66.66%',
							top: 3,
							width: '33.334%',
							height: 1,
						},
						pillar: 'play',
					},
					noun: 'Stress',
					plural: 'Stress',
					traits: [
						{
							name: 'Injured',
							traits: [],
						},
						{
							name: 'Isolated',
							traits: [],
						},
						{
							name: 'Sick',
							traits: [],
						},
						{
							name: 'Tired',
							traits: [],
						},
						{
							name: 'Upset',
							traits: [],
						},
					],
				},
				{
					id: 'talents',
					name: 'Talents',
					description: 'Survivor tricks and knacks',
					view: {
						features: {
							description: true,
							sfx: true,
							subtraits: false,
						},
						page: 1,
						multiDie: false,
						notes: '',
						reservedSlots: 3,
						place: {
							left: '0%',
							top: 4,
							width: '66.663%',
							height: 1,
						},
						labels: {
							col1: 'TALENT',
							col2: 'ACTIVATION',
							col3: 'EFFECT',
						},
						pillar: 'plus',
						parts: {
							name: {
								left: '0%',
								top: 0,
								width: '28%',
								height: 1,
							},
							description: {
								left: '28%',
								top: 0,
								width: '33%',
								height: 1,
							},
							'child:SFX': {
								left: '61%',
								top: 0,
								width: '39%',
								height: 1,
							},
						},
					},
					noun: 'Talent',
					plural: 'Talents',
					traits: [],
				},
				{
					id: 'growth-pool',
					name: 'Growth Pool',
					description: 'Survivor growth dice',
					view: {
						header: 'top',
						headerAlign: 'center',
						features: {
							description: false,
							sfx: false,
							subtraits: false,
						},
						page: 1,
						style: {
							header: 'default',
							body: 'dice-count',
						},
						ratingLadder: [4, 6, 8, 10, 12],
						multiDie: true,
						reservedSlots: 5,
						place: {
							left: '66.663%',
							top: 4,
							width: '33.334%',
							height: 1,
						},
						labels: {
							rating: 'RATING',
							dice: '/ DICE',
						},
						pillar: 'play',
					},
					pool: true,
					noun: 'Growth Die',
					plural: 'Growth Dice',
					traits: [
						{
							name: 'D4',
							rating: {
								type: 'Die',
								value: [4],
								range: [4, 6, 8, 10, 12],
							},
							spendable: true,
							hitches: 0,
							view: {
								poolCount: 1,
							},
							traits: [],
						},
						{
							name: 'D6',
							rating: {
								type: 'Die',
								value: [6],
								range: [4, 6, 8, 10, 12],
							},
							spendable: true,
							hitches: 0,
							view: {
								poolCount: 1,
							},
							traits: [],
						},
						{
							name: 'D8',
							rating: {
								type: 'Die',
								value: [8],
								range: [4, 6, 8, 10, 12],
							},
							spendable: true,
							hitches: 0,
							view: {
								poolCount: 1,
							},
							traits: [],
						},
						{
							name: 'D10',
							rating: {
								type: 'Die',
								value: [10],
								range: [4, 6, 8, 10, 12],
							},
							spendable: true,
							hitches: 0,
							view: {
								poolCount: 1,
							},
							traits: [],
						},
						{
							name: 'D12',
							rating: {
								type: 'Die',
								value: [12],
								range: [4, 6, 8, 10, 12],
							},
							spendable: true,
							hitches: 0,
							view: {
								poolCount: 1,
							},
							traits: [],
						},
					],
				},
			],
		},
	},
	{
		id: 'safe-zone-colony',
		version: 1,
		character: {
			$schema: '../schema/0.1/character.schema.json',
			version: '0.1',
			id: 'template-safe-zone-colony',
			isTemplate: true,
			name: '',
			game: 'Safe Zone',
			description: '',
			pronouns: '',
			plotPoints: 1,
			notes: '',
			player: '',
			portrait: {
				url: '',
				view: {
					location: 'header',
				},
			},
			view: {
				pageCount: 2,
				template: 'Safe Zone',
				watermark: {
					enabled: true,
					url: 'images/cortex_prime_logo_light_transparent.png',
					opacity: 0.08,
					scale: 70,
					page: 'all',
				},
				columnAlignment: 'top-base',
				columnOffsets: {
					left: 0,
					center: 0,
					right: 0,
				},
				listing: {
					title: 'Safe Zone - Colony File',
					subtitle: 'Post-Apocalyptic Survival & Colony',
					genre: 'Post-apocalyptic zombie survival | Base-building',
					variant: 'Colony File',
					url: 'https://legacy.drivethrurpg.com/product/574559/Safe-Zone?manufacturers_id=31866',
					image: 'https://legacy.drivethrurpg.com/images/31866/574559.jpg',
					quote: 'The Rot took the world. The Rotters are still out there, but they’re not the problem anymore.',
					setting: 'd8',
					prep: 'd8',
					complexity: 'd8',
				},
			},
			traitSets: [
				{
					id: 'name',
					name: 'Name',
					view: {
						style: {
							header: 'default',
							body: 'name',
						},
						page: 1,
					},
					traits: [
						{
							name: 'name',
							label: 'Name',
							traits: [],
						},
						{
							name: 'player',
							label: 'Player',
							traits: [],
						},
						{
							name: 'nickname',
							label: 'Nickname',
							traits: [],
						},
						{
							name: 'pronouns',
							label: 'Pronouns',
							traits: [],
						},
						{
							name: 'description',
							label: 'Description',
							traits: [],
						},
						{
							name: 'game',
							label: 'Game',
							view: {
								visibility: 'hidden',
							},
							traits: [],
						},
						{
							name: 'portrait',
							traits: [],
						},
						{
							name: 'caption',
							traits: [],
						},
						{
							name: 'plotPoints',
							rating: {
								type: 'Counter',
								value: [1],
								range: [0, 20],
							},
							label: 'PP',
							spendable: true,
							view: {
								visibility: 'hidden',
							},
							traits: [],
						},
						{
							name: 'notes',
							view: {
								visibility: 'hidden',
							},
							traits: [],
						},
					],
				},
				{
					id: 'essential-stockpiles',
					name: 'Essential Stockpiles',
					description: 'Building Benefits:',
					view: {
						header: 'top',
						headerAlign: 'left',
						traitColumns: 3,
						features: {
							description: false,
							sfx: false,
							subtraits: false,
						},
						page: 1,
						style: {
							header: 'default',
							body: 'default',
						},
						ratingLadder: [6],
						multiDie: true,
						notes: '',
						reservedSlots: 3,
						pillar: 'plus',
					},
					noun: 'Essential Stockpile',
					plural: 'Essential Stockpiles',
					traits: [
						{
							name: 'Food',
							rating: {
								type: 'Dice',
								value: [6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6],
								range: [4, 6, 8, 10, 12],
							},
							spendable: true,
							traits: [],
						},
						{
							name: 'Water',
							rating: {
								type: 'Dice',
								value: [6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6],
								range: [4, 6, 8, 10, 12],
							},
							spendable: true,
							traits: [],
						},
						{
							name: 'Shelter',
							rating: {
								type: 'Dice',
								value: [6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6],
								range: [4, 6, 8, 10, 12],
							},
							spendable: true,
							traits: [],
						},
					],
				},
				{
					id: 'non-essential-stockpiles',
					name: 'Non-Essential Stockpiles',
					description: 'Building Benefits:',
					view: {
						header: 'top',
						headerAlign: 'left',
						traitColumns: 3,
						features: {
							description: false,
							sfx: false,
							subtraits: false,
						},
						page: 1,
						style: {
							header: 'default',
							body: 'default',
						},
						ratingLadder: [6],
						multiDie: true,
						notes: '',
						reservedSlots: 3,
						pillar: 'plus',
					},
					noun: 'Non-Essential Stockpile',
					plural: 'Non-Essential Stockpiles',
					traits: [
						{
							name: 'Medicine',
							rating: {
								type: 'Dice',
								value: [6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6],
								range: [4, 6, 8, 10, 12],
							},
							spendable: true,
							traits: [],
						},
						{
							name: 'Protection',
							rating: {
								type: 'Dice',
								value: [6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6],
								range: [4, 6, 8, 10, 12],
							},
							spendable: true,
							traits: [],
						},
						{
							name: 'Tools',
							rating: {
								type: 'Dice',
								value: [6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6],
								range: [4, 6, 8, 10, 12],
							},
							spendable: true,
							traits: [],
						},
					],
				},
				{
					id: 'building-1',
					name: 'Building 1',
					view: {
						header: 'top',
						headerAlign: 'left',
						features: {
							description: true,
							sfx: false,
							subtraits: true,
						},
						page: 1,
						style: {
							header: 'default',
							body: 'default',
						},
						ratingLadder: [4, 6, 8, 10, 12],
						subtraitRatingLadder: [6, 8, 10, 12],
						reservedSlots: 1,
						place: {
							left: '0%',
							top: 2,
							width: '50%',
							height: 1,
						},
						pillar: 'plus',
					},
					noun: 'Building',
					plural: 'Buildings',
					traits: [
						{
							name: 'Name:',
							traits: [
								{
									name: 'd6 Benefit:',
									rating: {
										type: 'Die',
										value: [6],
										range: [4, 6, 8, 10, 12],
									},
									traits: [],
								},
								{
									name: 'd8 Benefit:',
									rating: {
										type: 'Die',
										value: [8],
										range: [4, 6, 8, 10, 12],
									},
									traits: [],
								},
								{
									name: 'd10 Benefit:',
									rating: {
										type: 'Die',
										value: [10],
										range: [4, 6, 8, 10, 12],
									},
									traits: [],
								},
								{
									name: 'd12 Benefit:',
									rating: {
										type: 'Die',
										value: [12],
										range: [4, 6, 8, 10, 12],
									},
									traits: [],
								},
							],
							view: {
								prompt: true,
							},
						},
					],
				},
				{
					id: 'building-2',
					name: 'Building 2',
					view: {
						header: 'top',
						headerAlign: 'left',
						features: {
							description: true,
							sfx: false,
							subtraits: true,
						},
						page: 1,
						style: {
							header: 'default',
							body: 'default',
						},
						ratingLadder: [4, 6, 8, 10, 12],
						subtraitRatingLadder: [6, 8, 10, 12],
						reservedSlots: 1,
						place: {
							left: '50%',
							top: 2,
							width: '50%',
							height: 1,
						},
						pillar: 'plus',
					},
					noun: 'Building',
					plural: 'Buildings',
					traits: [
						{
							name: 'Name:',
							traits: [
								{
									name: 'd6 Benefit:',
									rating: {
										type: 'Die',
										value: [6],
										range: [4, 6, 8, 10, 12],
									},
									traits: [],
								},
								{
									name: 'd8 Benefit:',
									rating: {
										type: 'Die',
										value: [8],
										range: [4, 6, 8, 10, 12],
									},
									traits: [],
								},
								{
									name: 'd10 Benefit:',
									rating: {
										type: 'Die',
										value: [10],
										range: [4, 6, 8, 10, 12],
									},
									traits: [],
								},
								{
									name: 'd12 Benefit:',
									rating: {
										type: 'Die',
										value: [12],
										range: [4, 6, 8, 10, 12],
									},
									traits: [],
								},
							],
							view: {
								prompt: true,
							},
						},
					],
				},
				{
					id: 'building-3',
					name: 'Building 3',
					view: {
						header: 'top',
						headerAlign: 'left',
						features: {
							description: true,
							sfx: false,
							subtraits: true,
						},
						page: 1,
						style: {
							header: 'default',
							body: 'default',
						},
						ratingLadder: [4, 6, 8, 10, 12],
						subtraitRatingLadder: [6, 8, 10, 12],
						reservedSlots: 1,
						place: {
							left: '0%',
							top: 3,
							width: '50%',
							height: 1,
						},
						pillar: 'plus',
					},
					noun: 'Building',
					plural: 'Buildings',
					traits: [
						{
							name: 'Name:',
							traits: [
								{
									name: 'd6 Benefit:',
									rating: {
										type: 'Die',
										value: [6],
										range: [4, 6, 8, 10, 12],
									},
									traits: [],
								},
								{
									name: 'd8 Benefit:',
									rating: {
										type: 'Die',
										value: [8],
										range: [4, 6, 8, 10, 12],
									},
									traits: [],
								},
								{
									name: 'd10 Benefit:',
									rating: {
										type: 'Die',
										value: [10],
										range: [4, 6, 8, 10, 12],
									},
									traits: [],
								},
								{
									name: 'd12 Benefit:',
									rating: {
										type: 'Die',
										value: [12],
										range: [4, 6, 8, 10, 12],
									},
									traits: [],
								},
							],
							view: {
								prompt: true,
							},
						},
					],
				},
				{
					id: 'building-4',
					name: 'Building 4',
					view: {
						header: 'top',
						headerAlign: 'left',
						features: {
							description: true,
							sfx: false,
							subtraits: true,
						},
						page: 1,
						style: {
							header: 'default',
							body: 'default',
						},
						ratingLadder: [4, 6, 8, 10, 12],
						subtraitRatingLadder: [6, 8, 10, 12],
						reservedSlots: 1,
						place: {
							left: '50%',
							top: 3,
							width: '50%',
							height: 1,
						},
						pillar: 'plus',
					},
					noun: 'Building',
					plural: 'Buildings',
					traits: [
						{
							name: 'Name:',
							traits: [
								{
									name: 'd6 Benefit:',
									rating: {
										type: 'Die',
										value: [6],
										range: [4, 6, 8, 10, 12],
									},
									traits: [],
								},
								{
									name: 'd8 Benefit:',
									rating: {
										type: 'Die',
										value: [8],
										range: [4, 6, 8, 10, 12],
									},
									traits: [],
								},
								{
									name: 'd10 Benefit:',
									rating: {
										type: 'Die',
										value: [10],
										range: [4, 6, 8, 10, 12],
									},
									traits: [],
								},
								{
									name: 'd12 Benefit:',
									rating: {
										type: 'Die',
										value: [12],
										range: [4, 6, 8, 10, 12],
									},
									traits: [],
								},
							],
							view: {
								prompt: true,
							},
						},
					],
				},
				{
					id: 'building-5',
					name: 'Building 5',
					view: {
						header: 'top',
						headerAlign: 'left',
						features: {
							description: true,
							sfx: false,
							subtraits: true,
						},
						page: 1,
						style: {
							header: 'default',
							body: 'default',
						},
						ratingLadder: [4, 6, 8, 10, 12],
						subtraitRatingLadder: [6, 8, 10, 12],
						reservedSlots: 1,
						place: {
							left: '0%',
							top: 4,
							width: '50%',
							height: 1,
						},
						pillar: 'plus',
					},
					noun: 'Building',
					plural: 'Buildings',
					traits: [
						{
							name: 'Name:',
							traits: [
								{
									name: 'd6 Benefit:',
									rating: {
										type: 'Die',
										value: [6],
										range: [4, 6, 8, 10, 12],
									},
									traits: [],
								},
								{
									name: 'd8 Benefit:',
									rating: {
										type: 'Die',
										value: [8],
										range: [4, 6, 8, 10, 12],
									},
									traits: [],
								},
								{
									name: 'd10 Benefit:',
									rating: {
										type: 'Die',
										value: [10],
										range: [4, 6, 8, 10, 12],
									},
									traits: [],
								},
								{
									name: 'd12 Benefit:',
									rating: {
										type: 'Die',
										value: [12],
										range: [4, 6, 8, 10, 12],
									},
									traits: [],
								},
							],
							view: {
								prompt: true,
							},
						},
					],
				},
				{
					id: 'building-6',
					name: 'Building 6',
					view: {
						header: 'top',
						headerAlign: 'left',
						features: {
							description: true,
							sfx: false,
							subtraits: true,
						},
						page: 1,
						style: {
							header: 'default',
							body: 'default',
						},
						ratingLadder: [4, 6, 8, 10, 12],
						subtraitRatingLadder: [6, 8, 10, 12],
						reservedSlots: 1,
						place: {
							left: '50%',
							top: 4,
							width: '50%',
							height: 1,
						},
						pillar: 'plus',
					},
					noun: 'Building',
					plural: 'Buildings',
					traits: [
						{
							name: 'Name:',
							traits: [
								{
									name: 'd6 Benefit:',
									rating: {
										type: 'Die',
										value: [6],
										range: [4, 6, 8, 10, 12],
									},
									traits: [],
								},
								{
									name: 'd8 Benefit:',
									rating: {
										type: 'Die',
										value: [8],
										range: [4, 6, 8, 10, 12],
									},
									traits: [],
								},
								{
									name: 'd10 Benefit:',
									rating: {
										type: 'Die',
										value: [10],
										range: [4, 6, 8, 10, 12],
									},
									traits: [],
								},
								{
									name: 'd12 Benefit:',
									rating: {
										type: 'Die',
										value: [12],
										range: [4, 6, 8, 10, 12],
									},
									traits: [],
								},
							],
							view: {
								prompt: true,
							},
						},
					],
				},
				{
					id: 'survivor-1',
					name: 'Survivor 1',
					hasQuestionedPip: true,
					view: {
						header: 'top',
						headerAlign: 'left',
						features: {
							description: false,
							sfx: false,
							subtraits: false,
						},
						page: 2,
						style: {
							header: 'default',
							body: 'default',
						},
						ratingLadder: [6, 8, 10, 12],
						reservedSlots: 5,
						place: {
							left: '0%',
							top: 0,
							width: '33.333%',
							height: 1,
						},
						pillar: 'plus',
					},
					noun: 'Survivor',
					plural: 'Survivors',
					traits: [
						{
							name: 'Morale',
							traits: [],
						},
						{
							name: '',
							rating: {
								type: 'Die',
								value: [6],
								range: [4, 6, 8, 10, 12],
							},
							traits: [],
						},
					],
				},
				{
					id: 'survivor-2',
					name: 'Survivor 2',
					hasQuestionedPip: true,
					view: {
						header: 'top',
						headerAlign: 'left',
						features: {
							description: false,
							sfx: false,
							subtraits: false,
						},
						page: 2,
						style: {
							header: 'default',
							body: 'default',
						},
						ratingLadder: [6, 8, 10, 12],
						reservedSlots: 5,
						place: {
							left: '33.333%',
							top: 0,
							width: '33.333%',
							height: 1,
						},
						pillar: 'plus',
					},
					noun: 'Survivor',
					plural: 'Survivors',
					traits: [
						{
							name: 'Morale',
							traits: [],
						},
						{
							name: '',
							rating: {
								type: 'Die',
								value: [6],
								range: [4, 6, 8, 10, 12],
							},
							traits: [],
						},
					],
				},
				{
					id: 'survivor-3',
					name: 'Survivor 3',
					hasQuestionedPip: true,
					view: {
						header: 'top',
						headerAlign: 'left',
						features: {
							description: false,
							sfx: false,
							subtraits: false,
						},
						page: 2,
						style: {
							header: 'default',
							body: 'default',
						},
						ratingLadder: [6, 8, 10, 12],
						reservedSlots: 5,
						place: {
							left: '66.666%',
							top: 0,
							width: '33.334%',
							height: 1,
						},
						pillar: 'plus',
					},
					noun: 'Survivor',
					plural: 'Survivors',
					traits: [
						{
							name: 'Morale',
							traits: [],
						},
						{
							name: '',
							rating: {
								type: 'Die',
								value: [6],
								range: [4, 6, 8, 10, 12],
							},
							traits: [],
						},
					],
				},
				{
					id: 'survivor-4',
					name: 'Survivor 4',
					hasQuestionedPip: true,
					view: {
						header: 'top',
						headerAlign: 'left',
						features: {
							description: false,
							sfx: false,
							subtraits: false,
						},
						page: 2,
						style: {
							header: 'default',
							body: 'default',
						},
						ratingLadder: [6, 8, 10, 12],
						reservedSlots: 5,
						place: {
							left: '0%',
							top: 1,
							width: '33.333%',
							height: 1,
						},
						pillar: 'plus',
					},
					noun: 'Survivor',
					plural: 'Survivors',
					traits: [
						{
							name: 'Morale',
							traits: [],
						},
						{
							name: '',
							rating: {
								type: 'Die',
								value: [6],
								range: [4, 6, 8, 10, 12],
							},
							traits: [],
						},
					],
				},
				{
					id: 'survivor-5',
					name: 'Survivor 5',
					hasQuestionedPip: true,
					view: {
						header: 'top',
						headerAlign: 'left',
						features: {
							description: false,
							sfx: false,
							subtraits: false,
						},
						page: 2,
						style: {
							header: 'default',
							body: 'default',
						},
						ratingLadder: [6, 8, 10, 12],
						reservedSlots: 5,
						place: {
							left: '33.333%',
							top: 1,
							width: '33.333%',
							height: 1,
						},
						pillar: 'plus',
					},
					noun: 'Survivor',
					plural: 'Survivors',
					traits: [
						{
							name: 'Morale',
							traits: [],
						},
						{
							name: '',
							rating: {
								type: 'Die',
								value: [6],
								range: [4, 6, 8, 10, 12],
							},
							traits: [],
						},
					],
				},
				{
					id: 'survivor-6',
					name: 'Survivor 6',
					hasQuestionedPip: true,
					view: {
						header: 'top',
						headerAlign: 'left',
						features: {
							description: false,
							sfx: false,
							subtraits: false,
						},
						page: 2,
						style: {
							header: 'default',
							body: 'default',
						},
						ratingLadder: [6, 8, 10, 12],
						reservedSlots: 5,
						place: {
							left: '66.666%',
							top: 1,
							width: '33.334%',
							height: 1,
						},
						pillar: 'plus',
					},
					noun: 'Survivor',
					plural: 'Survivors',
					traits: [
						{
							name: 'Morale',
							traits: [],
						},
						{
							name: '',
							rating: {
								type: 'Die',
								value: [6],
								range: [4, 6, 8, 10, 12],
							},
							traits: [],
						},
					],
				},
				{
					id: 'survivor-7',
					name: 'Survivor 7',
					hasQuestionedPip: true,
					view: {
						header: 'top',
						headerAlign: 'left',
						features: {
							description: false,
							sfx: false,
							subtraits: false,
						},
						page: 2,
						style: {
							header: 'default',
							body: 'default',
						},
						ratingLadder: [6, 8, 10, 12],
						reservedSlots: 5,
						place: {
							left: '0%',
							top: 2,
							width: '33.333%',
							height: 1,
						},
						pillar: 'plus',
					},
					noun: 'Survivor',
					plural: 'Survivors',
					traits: [
						{
							name: 'Morale',
							traits: [],
						},
						{
							name: '',
							rating: {
								type: 'Die',
								value: [6],
								range: [4, 6, 8, 10, 12],
							},
							traits: [],
						},
					],
				},
				{
					id: 'survivor-8',
					name: 'Survivor 8',
					hasQuestionedPip: true,
					view: {
						header: 'top',
						headerAlign: 'left',
						features: {
							description: false,
							sfx: false,
							subtraits: false,
						},
						page: 2,
						style: {
							header: 'default',
							body: 'default',
						},
						ratingLadder: [6, 8, 10, 12],
						reservedSlots: 5,
						place: {
							left: '33.333%',
							top: 2,
							width: '33.333%',
							height: 1,
						},
						pillar: 'plus',
					},
					noun: 'Survivor',
					plural: 'Survivors',
					traits: [
						{
							name: 'Morale',
							traits: [],
						},
						{
							name: '',
							rating: {
								type: 'Die',
								value: [6],
								range: [4, 6, 8, 10, 12],
							},
							traits: [],
						},
					],
				},
				{
					id: 'survivor-9',
					name: 'Survivor 9',
					hasQuestionedPip: true,
					view: {
						header: 'top',
						headerAlign: 'left',
						features: {
							description: false,
							sfx: false,
							subtraits: false,
						},
						page: 2,
						style: {
							header: 'default',
							body: 'default',
						},
						ratingLadder: [6, 8, 10, 12],
						reservedSlots: 5,
						place: {
							left: '66.666%',
							top: 2,
							width: '33.334%',
							height: 1,
						},
						pillar: 'plus',
					},
					noun: 'Survivor',
					plural: 'Survivors',
					traits: [
						{
							name: 'Morale',
							traits: [],
						},
						{
							name: '',
							rating: {
								type: 'Die',
								value: [6],
								range: [4, 6, 8, 10, 12],
							},
							traits: [],
						},
					],
				},
				{
					id: 'colony-projects',
					name: 'Notes',
					view: {
						header: 'top',
						headerAlign: 'left',
						features: {
							description: false,
							sfx: false,
							subtraits: false,
						},
						page: 2,
						pillar: 'play',
					},
					noun: 'Note',
					plural: 'Notes',
					traits: [],
				},
			],
		},
	},
	{
		id: 'snowfall-initiative',
		version: 1,
		character: {
			$schema: '../schema/0.1/character.schema.json',
			version: '0.1',
			id: 'template-snowfall',
			isTemplate: true,
			name: '',
			game: 'Snowfall Initiative',
			description: '',
			pronouns: '',
			plotPoints: 1,
			notes: '',
			player: '',
			portrait: {
				url: '',
				view: {
					location: 'header',
				},
			},
			view: {
				pageCount: 1,
				template: 'Snowfall Initiative',
				watermark: {
					enabled: true,
					url: 'images/cortex_prime_logo_light_transparent.png',
					opacity: 0.08,
					scale: 70,
					page: 'all',
				},
				columnAlignment: 'top-base',
				columnOffsets: {
					left: 0,
					center: 0,
					right: 0,
				},
				listing: {
					subtitle: 'Cold War Espionage & Super-Spies',
					genre: 'Military sci-fi / Norse portal fantasy',
					variant: 'Agent File',
					url: 'https://legacy.drivethrurpg.com/product/574560/Snowfall-Initiative?manufacturers_id=31866',
					image: 'https://legacy.drivethrurpg.com/images/31866/574560.jpg',
					quote:
						'Earth is freezing. Not metaphorically—glaciers are advancing on major cities, temperatures are dropping, and a new ice age has begun.',
					setting: 'd10',
					prep: 'd8',
					complexity: 'd8',
				},
			},
			traitSets: [
				{
					id: 'name',
					name: 'Name',
					view: {
						style: {
							header: 'default',
							body: 'name',
						},
						page: 1,
					},
					traits: [
						{
							name: 'name',
							label: 'Name',
							traits: [],
						},
						{
							name: 'player',
							label: 'Player',
							traits: [],
						},
						{
							name: 'nickname',
							label: 'Nickname',
							traits: [],
						},
						{
							name: 'pronouns',
							label: 'Pronouns',
							traits: [],
						},
						{
							name: 'description',
							label: 'Description',
							traits: [],
						},
						{
							name: 'game',
							label: 'Game',
							view: {
								visibility: 'hidden',
							},
							traits: [],
						},
						{
							name: 'portrait',
							traits: [],
						},
						{
							name: 'caption',
							traits: [],
						},
						{
							name: 'plotPoints',
							rating: {
								type: 'Counter',
								value: [1],
								range: [0, 20],
							},
							label: 'PP',
							spendable: true,
							view: {
								visibility: 'hidden',
							},
							traits: [],
						},
						{
							name: 'notes',
							view: {
								visibility: 'hidden',
							},
							traits: [],
						},
					],
				},
				{
					id: 'distinctions',
					name: 'Distinctions',
					description: 'Cover identity, espionage specialization, and personal objective',
					view: {
						features: {
							description: true,
							sfx: false,
							subtraits: false,
						},
						ratingLadder: [8],
						page: 1,
						multiDie: false,
						notes: "Gain a PP when you trade out your distinction's d8 rating for a d4.",
						reservedSlots: 3,
						pillar: 'prime',
						altRoll: {
							die: 4,
							ppDelta: 1,
							label: 'Hinder',
						},
					},
					noun: 'Distinction',
					plural: 'Distinctions',
					traits: [
						{
							name: 'Role',
							rating: {
								type: 'Die',
								value: [8],
								range: [4, 6, 8, 10, 12],
							},
							traits: [
								{
									name: 'Hinder',
									rating: {
										type: 'Die',
										value: [4],
										range: [4],
									},
									traits: [],
									noun: 'SFX',
									ppDelta: 1,
								},
							],
							view: {
								badge: {
									text: 'SFX',
									shape: 'vertical-bar',
									color: 'black',
								},
							},
						},
						{
							name: 'Background',
							rating: {
								type: 'Die',
								value: [8],
								range: [4, 6, 8, 10, 12],
							},
							traits: [
								{
									name: 'Hinder',
									rating: {
										type: 'Die',
										value: [4],
										range: [4],
									},
									traits: [],
									noun: 'SFX',
									ppDelta: 1,
								},
							],
							view: {
								badge: {
									text: 'SFX',
									shape: 'vertical-bar',
									color: 'black',
								},
							},
						},
						{
							name: 'Personality',
							rating: {
								type: 'Die',
								value: [8],
								range: [4, 6, 8, 10, 12],
							},
							traits: [
								{
									name: 'Hinder',
									rating: {
										type: 'Die',
										value: [4],
										range: [4],
									},
									traits: [],
									noun: 'SFX',
									ppDelta: 1,
								},
							],
							view: {
								badge: {
									text: 'SFX',
									shape: 'vertical-bar',
									color: 'black',
								},
							},
						},
					],
				},
				{
					id: 'affiliations',
					name: 'Affiliations',
					description: 'Operational deployment modes',
					view: {
						header: 'top',
						headerAlign: 'center',
						features: {
							description: false,
							sfx: false,
							subtraits: false,
						},
						page: 1,
						style: {
							header: 'default',
							body: 'default',
						},
						ratingLadder: [4, 6, 8, 10, 12],
						multiDie: false,
						notes: '',
						reservedSlots: 3,
						place: {
							left: '0%',
							top: 1,
							width: '23%',
							height: 1,
						},
						parts: {
							name: {
								left: '0%',
								top: 0,
								width: '100%',
								height: 1,
							},
							rating: {
								left: '0%',
								top: 1,
								width: '100%',
								height: 1,
							},
						},
						pillar: 'prime',
						fixedNames: true,
					},
					noun: 'Affiliation',
					plural: 'Affiliations',
					traits: [
						{
							name: 'Diplomacy',
							traits: [],
						},
						{
							name: 'Discovery',
							traits: [],
						},
						{
							name: 'Defense',
							traits: [],
						},
					],
				},
				{
					id: 'complications',
					name: 'Complications',
					view: {
						header: 'top',
						headerAlign: 'center',
						features: {
							description: false,
							sfx: false,
							subtraits: false,
						},
						page: 1,
						style: {
							header: 'die-track',
							body: 'die-track',
						},
						ratingLadder: [4, 6, 8, 10, 12],
						reservedSlots: 2,
						place: {
							left: '23%',
							top: 1,
							width: '25%',
							height: 1,
						},
						parts: {
							name: {
								left: '0%',
								top: 0,
								width: '100%',
								height: 1,
							},
							rating: {
								left: '0%',
								top: 1,
								width: '100%',
								height: 1,
							},
						},
						playMutable: true,
						pillar: 'play',
					},
					noun: 'Complication',
					plural: 'Complications',
					traits: [
						{
							name: 'Frostbite',
							traits: [],
						},
						{
							name: 'Hypothermia',
							traits: [],
						},
					],
				},
				{
					id: 'attributes-stress',
					name: 'Attributes & Stress',
					description: 'Core operative capabilities and physical resilience',
					view: {
						header: 'top',
						headerAlign: 'center',
						features: {
							description: false,
							sfx: false,
							subtraits: false,
						},
						page: 1,
						style: {
							header: 'default',
							body: 'default',
						},
						ratingLadder: [4, 6, 8, 10, 12],
						multiDie: false,
						notes: '',
						reservedSlots: 6,
						place: {
							left: '48%',
							top: 1,
							width: '52%',
							height: 1,
						},
						parts: {
							name: {
								left: '0%',
								top: 0,
								width: '30%',
								height: 1,
							},
							rating: {
								left: '30%',
								top: 0,
								width: '30%',
								height: 1,
							},
							trackLabel: {
								left: '60%',
								top: 0,
								width: '13%',
								height: 1,
							},
							track: {
								left: '73%',
								top: 0,
								width: '27%',
								height: 1,
							},
						},
						pillar: 'prime',
						fixedNames: true,
					},
					noun: 'Attribute',
					plural: 'Attributes',
					traits: [
						{
							name: 'Brawn',
							traits: [],
						},
						{
							name: 'Endurance',
							traits: [],
						},
						{
							name: 'Grace',
							traits: [],
						},
						{
							name: 'Grit',
							traits: [],
						},
						{
							name: 'Mettle',
							traits: [],
						},
						{
							name: 'Smarts',
							traits: [],
						},
					],
				},
				{
					id: 'subtrait-columns',
					name: 'Skills & Specialties',
					description: 'Black-ops competencies and d6 specialties',
					view: {
						header: 'top',
						headerAlign: 'center',
						traitColumns: 2,
						features: {
							description: false,
							sfx: false,
							subtraits: true,
						},
						page: 1,
						style: {
							header: 'default',
							body: 'default',
						},
						ratingLadder: [4, 6, 8, 10, 12],
						subtraitRatingLadder: [6],
						multiDie: false,
						notes: '',
						reservedSlots: 19,
						pillar: 'prime',
						fixedNames: true,
					},
					noun: 'Skill',
					plural: 'Skills',
					traits: [
						{
							name: 'Craft',
							traits: [],
						},
						{
							name: 'Drive',
							traits: [],
						},
						{
							name: 'Fight',
							traits: [],
						},
						{
							name: 'Fix',
							traits: [],
						},
						{
							name: 'Fly',
							traits: [],
						},
						{
							name: 'Focus',
							traits: [],
						},
						{
							name: 'Influence',
							traits: [],
						},
						{
							name: 'Know',
							traits: [],
						},
						{
							name: 'Labor',
							traits: [],
						},
						{
							name: 'Move',
							traits: [],
						},
						{
							name: 'Notice',
							traits: [],
						},
						{
							name: 'Operate',
							traits: [],
						},
						{
							name: 'Perform',
							traits: [],
						},
						{
							name: 'Shoot',
							traits: [],
						},
						{
							name: 'Sneak',
							traits: [],
						},
						{
							name: 'Survive',
							traits: [],
						},
						{
							name: 'Throw',
							traits: [],
						},
						{
							name: 'Treat',
							traits: [],
						},
						{
							name: 'Trick',
							traits: [],
						},
					],
				},
				{
					id: 'signature-assets-gifts',
					name: 'Signature Assets',
					description: 'Classified spy gear and experimental equipment',
					view: {
						header: 'top',
						headerAlign: 'center',
						features: {
							description: true,
							sfx: false,
							subtraits: false,
						},
						page: 1,
						style: {
							header: 'default',
							body: 'default',
						},
						ratingLadder: [6, 8, 10, 12],
						multiDie: false,
						notes: '',
						reservedSlots: 3,
						place: {
							left: '0%',
							top: 3,
							width: '35%',
							height: 1,
						},
						parts: {
							name: {
								left: '0%',
								top: 0,
								width: '76%',
								height: 1,
							},
							rating: {
								left: '76%',
								top: 0,
								width: '24%',
								height: 1,
							},
							description: {
								left: '0%',
								top: 1,
								width: '100%',
								height: 1,
							},
						},
						pillar: 'plus',
					},
					noun: 'Signature Asset',
					plural: 'Signature Assets',
					traits: [],
				},
				{
					id: 'talents',
					name: 'Talents',
					view: {
						features: {
							description: true,
							sfx: true,
							subtraits: false,
						},
						page: 1,
						reservedSlots: 3,
						place: {
							left: '35%',
							top: 3,
							width: '65%',
							height: 1,
						},
						labels: {
							col1: 'TALENT',
							col2: 'ACTIVATION',
							col3: 'EFFECT',
						},
						pillar: 'plus',
						parts: {
							name: {
								left: '0%',
								top: 0,
								width: '28%',
								height: 1,
							},
							description: {
								left: '28%',
								top: 0,
								width: '33%',
								height: 1,
							},
							'child:SFX': {
								left: '61%',
								top: 0,
								width: '39%',
								height: 1,
							},
						},
					},
					noun: 'Talent',
					plural: 'Talents',
					traits: [],
				},
				{
					id: 'gifts',
					name: 'Gifts',
					view: {
						header: 'top',
						headerAlign: 'center',
						features: {
							description: true,
							sfx: false,
							subtraits: false,
						},
						page: 1,
						style: {
							header: 'default',
							body: 'default',
						},
						ratingLadder: [4, 6, 8, 10, 12],
						reservedSlots: 2,
						place: {
							left: '0%',
							top: 4,
							width: '25%',
							height: 1,
						},
						parts: {
							name: {
								left: '0%',
								top: 0,
								width: '100%',
								height: 1,
							},
							rating: {
								left: '0%',
								top: 1,
								width: '100%',
								height: 1,
							},
							description: {
								left: '0%',
								top: 2,
								width: '100%',
								height: 1,
							},
						},
						pillar: 'plus',
					},
					noun: 'Gift',
					plural: 'Gifts',
					traits: [
						{
							name: 'Gift of',
							traits: [],
						},
						{
							name: 'Gift of~2',
							traits: [],
						},
					],
				},
				{
					id: 'milestones',
					name: 'Milestones',
					view: {
						header: 'top',
						headerAlign: 'center',
						features: {
							description: true,
							sfx: false,
							subtraits: false,
						},
						page: 1,
						style: {
							header: 'default',
							body: 'default',
						},
						multiDie: false,
						ratingLadder: [],
						reservedSlots: 3,
						place: {
							left: '25%',
							top: 4,
							width: '50%',
							height: 1,
						},
						parts: {
							rating: {
								left: '0%',
								top: 0,
								width: '10%',
								height: 1,
							},
							name: {
								left: '10%',
								top: 0,
								width: '90%',
								height: 1,
							},
							description: {
								left: '0%',
								top: 1,
								width: '100%',
								height: 1,
							},
						},
						pillar: 'plus',
					},
					noun: 'Milestone',
					plural: 'Milestones',
					traits: [
						{
							name: '1 XP',
							description: 'when ',
							rating: {
								type: 'Pip',
								value: [false],
							},
							traits: [],
						},
						{
							name: '3 XP',
							description: 'when ',
							rating: {
								type: 'Pip',
								value: [false],
							},
							traits: [],
						},
						{
							name: '10 XP',
							description: 'when ',
							rating: {
								type: 'Pip',
								value: [false],
							},
							traits: [],
						},
					],
				},
				{
					id: 'milestones-b',
					name: 'Milestones',
					view: {
						header: 'top',
						headerAlign: 'center',
						features: {
							description: true,
							sfx: false,
							subtraits: false,
						},
						page: 1,
						style: {
							header: 'default',
							body: 'default',
						},
						multiDie: false,
						ratingLadder: [],
						reservedSlots: 3,
						place: {
							left: '25%',
							top: 5,
							width: '50%',
							height: 1,
						},
						parts: {
							rating: {
								left: '0%',
								top: 0,
								width: '10%',
								height: 1,
							},
							name: {
								left: '10%',
								top: 0,
								width: '90%',
								height: 1,
							},
							description: {
								left: '0%',
								top: 1,
								width: '100%',
								height: 1,
							},
						},
						pillar: 'plus',
					},
					noun: 'Milestone',
					plural: 'Milestones',
					traits: [
						{
							name: '1 XP',
							description: 'when ',
							rating: {
								type: 'Pip',
								value: [false],
							},
							traits: [],
						},
						{
							name: '3 XP',
							description: 'when ',
							rating: {
								type: 'Pip',
								value: [false],
							},
							traits: [],
						},
						{
							name: '10 XP',
							description: 'when ',
							rating: {
								type: 'Pip',
								value: [false],
							},
							traits: [],
						},
					],
				},
				{
					id: 'xp',
					name: 'XP',
					view: {
						features: {
							description: false,
							sfx: false,
							subtraits: false,
						},
						page: 1,
						style: {
							header: 'default',
							body: 'pips',
						},
						pips: {
							perRow: 4,
							connected: false,
						},
						place: {
							left: '75%',
							top: 4,
							width: '25%',
							height: 1,
						},
						pillar: 'play',
					},
					rating: {
						type: 'Pip',
						value: [
							false,
							false,
							false,
							false,
							false,
							false,
							false,
							false,
							false,
							false,
							false,
							false,
							false,
							false,
							false,
							false,
							false,
							false,
							false,
							false,
						],
					},
					noun: 'Pip',
					plural: 'Pips',
					traits: [],
				},
			],
		},
	},
	{
		id: 'solarpunk-citizen',
		version: 1,
		character: {
			$schema: '../schema/0.1/character.schema.json',
			version: '0.1',
			id: 'template-solarpunk-citizen',
			isTemplate: true,
			name: '',
			game: 'Solarpunk',
			description: '',
			pronouns: '',
			plotPoints: 1,
			notes: '',
			player: '',
			portrait: {
				url: '',
				view: {
					location: 'header',
				},
			},
			view: {
				pageCount: 1,
				template: 'Solarpunk',
				watermark: {
					enabled: true,
					url: 'images/cortex_prime_logo_light_transparent.png',
					opacity: 0.08,
					scale: 70,
					page: 'all',
				},
				columnAlignment: 'top-base',
				columnOffsets: {
					left: 0,
					center: 0,
					right: 0,
				},
				listing: {
					subtitle: 'Ecological Hope & Community Technology',
					genre: 'Near-future eco-punk / hopepunk',
					variant: 'Citizen File',
					url: 'https://legacy.drivethrurpg.com/product/568415/Solarpunk?manufacturers_id=31866',
					image: 'https://legacy.drivethrurpg.com/images/31866/568415.jpg',
					quote: 'The corporations took everything. The land, the water, the air.',
					setting: 'd8',
					prep: 'd6',
					complexity: 'd8',
				},
			},
			traitSets: [
				{
					id: 'name',
					name: 'Name',
					view: {
						style: {
							header: 'default',
							body: 'name',
						},
						page: 1,
					},
					traits: [
						{
							name: 'name',
							label: 'Name',
							traits: [],
						},
						{
							name: 'player',
							label: 'Player',
							traits: [],
						},
						{
							name: 'nickname',
							label: 'Nickname',
							traits: [],
						},
						{
							name: 'pronouns',
							label: 'Pronouns',
							traits: [],
						},
						{
							name: 'description',
							label: 'Description',
							traits: [],
						},
						{
							name: 'game',
							label: 'Game',
							view: {
								visibility: 'hidden',
							},
							traits: [],
						},
						{
							name: 'portrait',
							traits: [],
						},
						{
							name: 'caption',
							traits: [],
						},
						{
							name: 'plotPoints',
							rating: {
								type: 'Counter',
								value: [1],
								range: [0, 20],
							},
							label: 'PP',
							spendable: true,
							view: {
								visibility: 'hidden',
							},
							traits: [],
						},
						{
							name: 'notes',
							view: {
								visibility: 'hidden',
							},
							traits: [],
						},
					],
				},
				{
					id: 'attributes',
					name: 'Attributes',
					description: 'SolarPunk holistic community attributes',
					view: {
						features: {
							description: false,
							sfx: false,
							subtraits: false,
						},
						page: 1,
						style: {
							header: 'default',
							body: 'default',
						},
						ratingLadder: [4, 6, 8, 10, 12],
						multiDie: false,
						notes: '',
						reservedSlots: 3,
						place: {
							left: '0%',
							top: 0,
							width: '28%',
							height: 1,
						},
						parts: {
							name: {
								left: '0%',
								top: 0,
								width: '100%',
								height: 1,
							},
							rating: {
								left: '0%',
								top: 1,
								width: '100%',
								height: 1,
							},
						},
						pillar: 'prime',
						fixedNames: true,
					},
					noun: 'Attribute',
					plural: 'Attributes',
					traits: [
						{
							name: 'Mind',
							traits: [],
						},
						{
							name: 'Body',
							traits: [],
						},
						{
							name: 'Connection',
							traits: [],
						},
					],
				},
				{
					id: 'session-record',
					name: 'Session Record',
					view: {
						features: {
							description: false,
							sfx: false,
							subtraits: false,
						},
						page: 1,
						style: {
							header: 'default',
							body: 'pips',
						},
						pips: {
							perRow: 5,
							connected: true,
						},
						reservedSlots: 0,
						place: {
							left: '0%',
							top: 1,
							width: '28%',
							height: 1,
						},
						pillar: 'play',
					},
					rating: {
						type: 'Pip',
						value: [
							false,
							false,
							false,
							false,
							false,
							false,
							false,
							false,
							false,
							false,
							false,
							false,
							false,
							false,
							false,
						],
					},
					noun: 'Session',
					plural: 'Sessions',
					traits: [],
				},
				{
					id: 'distinctions',
					name: 'Distinctions',
					description: 'Ecological calling, community role, and personal purpose',
					view: {
						features: {
							description: true,
							sfx: true,
							subtraits: false,
						},
						ratingLadder: [8],
						page: 1,
						multiDie: false,
						notes: "Gain a PP when you trade out your distinction's d8 rating for a d4.",
						reservedSlots: 3,
						place: {
							left: '28%',
							top: 0,
							width: '72%',
							height: 1,
						},
						pillar: 'prime',
						altRoll: {
							die: 4,
							ppDelta: 1,
							label: 'Hinder',
						},
					},
					noun: 'Distinction',
					plural: 'Distinctions',
					traits: [
						{
							name: 'Identity:',
							rating: {
								type: 'Die',
								value: [8],
								range: [4, 6, 8, 10, 12],
							},
							traits: [
								{
									name: 'Hinder',
									rating: {
										type: 'Die',
										value: [4],
										range: [4],
									},
									traits: [],
									noun: 'SFX',
									ppDelta: 1,
								},
							],
							view: {
								badge: {
									text: 'SFX',
									shape: 'vertical-bar',
									color: 'black',
								},
								prompt: true,
							},
						},
						{
							name: 'Community:',
							rating: {
								type: 'Die',
								value: [8],
								range: [4, 6, 8, 10, 12],
							},
							traits: [
								{
									name: 'Hinder',
									rating: {
										type: 'Die',
										value: [4],
										range: [4],
									},
									traits: [],
									noun: 'SFX',
									ppDelta: 1,
								},
							],
							view: {
								badge: {
									text: 'SFX',
									shape: 'vertical-bar',
									color: 'black',
								},
								prompt: true,
							},
						},
						{
							name: 'Purpose:',
							rating: {
								type: 'Die',
								value: [8],
								range: [4, 6, 8, 10, 12],
							},
							traits: [
								{
									name: 'Hinder',
									rating: {
										type: 'Die',
										value: [4],
										range: [4],
									},
									traits: [],
									noun: 'SFX',
									ppDelta: 1,
								},
							],
							view: {
								badge: {
									text: 'SFX',
									shape: 'vertical-bar',
									color: 'black',
								},
								prompt: true,
							},
						},
					],
				},
				{
					id: 'signature-assets',
					name: 'Signature Assets',
					description: 'Sustainable tech, tools, and eco-craft',
					view: {
						header: 'top',
						headerAlign: 'center',
						traitColumns: 2,
						features: {
							description: true,
							sfx: true,
							subtraits: false,
						},
						page: 1,
						style: {
							header: 'default',
							body: 'default',
						},
						ratingLadder: [6, 8, 10, 12],
						multiDie: false,
						notes: '',
						reservedSlots: 2,
						parts: {
							name: {
								left: '0%',
								top: 0,
								width: '76%',
								height: 1,
							},
							rating: {
								left: '76%',
								top: 0,
								width: '24%',
								height: 1,
							},
							description: {
								left: '0%',
								top: 1,
								width: '100%',
								height: 1,
							},
							block: {
								left: '0%',
								top: 2,
								width: '100%',
								height: 1,
							},
						},
						pillar: 'plus',
					},
					noun: 'Signature Asset',
					plural: 'Signature Assets',
					traits: [],
				},
				{
					id: 'subtrait-columns',
					name: 'Skills & Specialties',
					description: 'Ecological competencies (d4-d12) and d6 craft specialties',
					view: {
						header: 'top',
						headerAlign: 'center',
						traitColumns: 2,
						features: {
							description: false,
							sfx: false,
							subtraits: true,
						},
						page: 1,
						style: {
							header: 'default',
							body: 'subtrait-columns',
						},
						ratingLadder: [4, 6, 8, 10, 12],
						subtraitRatingLadder: [6],
						multiDie: false,
						notes: '',
						reservedSlots: 19,
						labels: {
							left: 'SKILL',
							right: 'SPECIALTIES',
						},
						pillar: 'prime',
						fixedNames: true,
					},
					noun: 'Skill',
					plural: 'Skills',
					traits: [
						{
							name: 'Craft',
							traits: [],
						},
						{
							name: 'Drive',
							traits: [],
						},
						{
							name: 'Fight',
							traits: [],
						},
						{
							name: 'Fix',
							traits: [],
						},
						{
							name: 'Fly',
							traits: [],
						},
						{
							name: 'Focus',
							traits: [],
						},
						{
							name: 'Influence',
							traits: [],
						},
						{
							name: 'Know',
							traits: [],
						},
						{
							name: 'Labor',
							traits: [],
						},
						{
							name: 'Move',
							traits: [],
						},
						{
							name: 'Notice',
							traits: [],
						},
						{
							name: 'Operate',
							traits: [],
						},
						{
							name: 'Perform',
							traits: [],
						},
						{
							name: 'Shoot',
							traits: [],
						},
						{
							name: 'Sneak',
							traits: [],
						},
						{
							name: 'Survive',
							traits: [],
						},
						{
							name: 'Throw',
							traits: [],
						},
						{
							name: 'Treat',
							traits: [],
						},
						{
							name: 'Trick',
							traits: [],
						},
					],
				},
			],
		},
	},
	{
		id: 'solarpunk-commune',
		version: 1,
		character: {
			$schema: '../schema/0.1/character.schema.json',
			version: '0.1',
			id: 'template-solarpunk-commune',
			isTemplate: true,
			name: '',
			game: 'Solarpunk',
			description: '',
			pronouns: '',
			plotPoints: 1,
			notes: '',
			player: '',
			portrait: {
				url: '',
				view: {
					location: 'header',
				},
			},
			view: {
				pageCount: 1,
				template: 'Solarpunk',
				watermark: {
					enabled: true,
					url: 'images/cortex_prime_logo_light_transparent.png',
					opacity: 0.08,
					scale: 70,
					page: 'all',
				},
				columnAlignment: 'top-base',
				columnOffsets: {
					left: 0,
					center: 0,
					right: 0,
				},
				listing: {
					title: 'Solarpunk - Commune File',
					subtitle: 'Ecological Hope & Community Technology',
					genre: 'Near-future eco-punk / hopepunk',
					variant: 'Commune File',
					url: 'https://legacy.drivethrurpg.com/product/568415/Solarpunk?manufacturers_id=31866',
					image: 'https://legacy.drivethrurpg.com/images/31866/568415.jpg',
					quote: 'The corporations took everything. The land, the water, the air.',
					setting: 'd8',
					prep: 'd6',
					complexity: 'd8',
				},
			},
			traitSets: [
				{
					id: 'name',
					name: 'Name',
					view: {
						style: {
							header: 'default',
							body: 'name',
						},
						page: 1,
					},
					traits: [
						{
							name: 'name',
							label: 'Name',
							traits: [],
						},
						{
							name: 'player',
							label: 'Player',
							traits: [],
						},
						{
							name: 'nickname',
							label: 'Nickname',
							traits: [],
						},
						{
							name: 'pronouns',
							label: 'Pronouns',
							traits: [],
						},
						{
							name: 'description',
							label: 'Description',
							traits: [],
						},
						{
							name: 'game',
							label: 'Game',
							view: {
								visibility: 'hidden',
							},
							traits: [],
						},
						{
							name: 'portrait',
							traits: [],
						},
						{
							name: 'caption',
							traits: [],
						},
						{
							name: 'plotPoints',
							rating: {
								type: 'Counter',
								value: [1],
								range: [0, 20],
							},
							label: 'PP',
							spendable: true,
							view: {
								visibility: 'hidden',
							},
							traits: [],
						},
						{
							name: 'notes',
							view: {
								visibility: 'hidden',
							},
							traits: [],
						},
					],
				},
				{
					id: 'commune-attributes',
					name: 'Attributes',
					description: 'Collective settlement strengths',
					view: {
						features: {
							description: false,
							sfx: false,
							subtraits: false,
						},
						page: 1,
						style: {
							header: 'default',
							body: 'default',
						},
						ratingLadder: [4, 6, 8],
						multiDie: false,
						notes: '',
						reservedSlots: 3,
						place: {
							left: '0%',
							top: 0,
							width: '28%',
							height: 1,
						},
						parts: {
							name: {
								left: '0%',
								top: 0,
								width: '100%',
								height: 1,
							},
							rating: {
								left: '0%',
								top: 1,
								width: '100%',
								height: 1,
							},
						},
						pillar: 'prime',
						fixedNames: true,
					},
					noun: 'Attribute',
					plural: 'Attributes',
					traits: [
						{
							name: 'Resources',
							traits: [],
						},
						{
							name: 'Security',
							traits: [],
						},
						{
							name: 'Connections',
							traits: [],
						},
					],
				},
				{
					id: 'commune-distinctions',
					name: 'Distinctions',
					description: 'Settlement unity, organization, and morale',
					view: {
						features: {
							description: true,
							sfx: false,
							subtraits: false,
						},
						ratingLadder: [8],
						page: 1,
						multiDie: false,
						notes: "Gain a PP when you trade out your distinction's d8 rating for a d4.",
						reservedSlots: 3,
						place: {
							left: '28%',
							top: 0,
							width: '72%',
							height: 1,
						},
						pillar: 'prime',
						altRoll: {
							die: 4,
							ppDelta: 1,
							label: 'Hinder',
						},
					},
					noun: 'Distinction',
					plural: 'Distinctions',
					traits: [
						{
							name: 'Unity:',
							rating: {
								type: 'Die',
								value: [8],
								range: [4, 6, 8, 10, 12],
							},
							traits: [
								{
									name: 'Hinder',
									rating: {
										type: 'Die',
										value: [4],
										range: [4],
									},
									traits: [],
									noun: 'SFX',
									ppDelta: 1,
								},
							],
							view: {
								badge: {
									text: 'SFX',
									shape: 'vertical-bar',
									color: 'black',
								},
								prompt: true,
							},
						},
						{
							name: 'Organization:',
							rating: {
								type: 'Die',
								value: [8],
								range: [4, 6, 8, 10, 12],
							},
							traits: [
								{
									name: 'Hinder',
									rating: {
										type: 'Die',
										value: [4],
										range: [4],
									},
									traits: [],
									noun: 'SFX',
									ppDelta: 1,
								},
							],
							view: {
								badge: {
									text: 'SFX',
									shape: 'vertical-bar',
									color: 'black',
								},
								prompt: true,
							},
						},
						{
							name: 'Morale:',
							rating: {
								type: 'Die',
								value: [8],
								range: [4, 6, 8, 10, 12],
							},
							traits: [
								{
									name: 'Hinder',
									rating: {
										type: 'Die',
										value: [4],
										range: [4],
									},
									traits: [],
									noun: 'SFX',
									ppDelta: 1,
								},
							],
							view: {
								badge: {
									text: 'SFX',
									shape: 'vertical-bar',
									color: 'black',
								},
								prompt: true,
							},
						},
					],
				},
				{
					id: 'signature-assets',
					name: 'Signature Assets',
					view: {
						header: 'top',
						headerAlign: 'center',
						traitColumns: 2,
						features: {
							description: true,
							sfx: false,
							subtraits: false,
						},
						page: 1,
						style: {
							header: 'default',
							body: 'default',
						},
						ratingLadder: [6],
						reservedSlots: 4,
						parts: {
							name: {
								left: '0%',
								top: 0,
								width: '94%',
								height: 1,
							},
							rating: {
								left: '94%',
								top: 0,
								width: '6%',
								height: 1,
							},
							description: {
								left: '0%',
								top: 1,
								width: '100%',
								height: 1,
							},
						},
						pillar: 'plus',
					},
					noun: 'Asset',
					plural: 'Assets',
					traits: [
						{
							name: '',
							rating: {
								type: 'Die',
								value: [6],
								range: [4, 6, 8, 10, 12],
							},
							traits: [],
						},
						{
							name: '',
							rating: {
								type: 'Die',
								value: [6],
								range: [4, 6, 8, 10, 12],
							},
							traits: [],
						},
						{
							name: '',
							rating: {
								type: 'Die',
								value: [6],
								range: [4, 6, 8, 10, 12],
							},
							traits: [],
						},
						{
							name: '',
							rating: {
								type: 'Die',
								value: [6],
								range: [4, 6, 8, 10, 12],
							},
							traits: [],
						},
					],
				},
				{
					id: 'skills',
					name: 'Skills',
					view: {
						header: 'top',
						headerAlign: 'left',
						features: {
							description: false,
							sfx: false,
							subtraits: true,
						},
						page: 1,
						style: {
							header: 'default',
							body: 'subtrait-columns',
						},
						ratingLadder: [6, 8],
						subtraitRatingLadder: [],
						reservedSlots: 9,
						labels: {
							left: 'SKILL',
							right: 'SPECIALTIES',
						},
						pillar: 'prime',
						fixedNames: true,
					},
					noun: 'Skill',
					plural: 'Skills',
					traits: [],
				},
			],
		},
	},
	{
		id: 'spellcaught',
		version: 1,
		character: {
			$schema: '../schema/0.1/character.schema.json',
			version: '0.1',
			id: 'template-spellcaught',
			isTemplate: true,
			name: '',
			game: 'Spellcaught',
			description: '',
			pronouns: '',
			plotPoints: 1,
			notes: '',
			player: '',
			portrait: {
				url: '',
				view: {
					location: 'header',
				},
			},
			view: {
				pageCount: 1,
				template: 'Spellcaught',
				watermark: {
					enabled: true,
					url: 'images/cortex_prime_logo_light_transparent.png',
					opacity: 0.08,
					scale: 70,
					page: 'all',
				},
				columnAlignment: 'top-base',
				columnOffsets: {
					left: 0,
					center: 0,
					right: 0,
				},
				listing: {
					subtitle: 'Arcane Curses & Eldritch Magic',
					genre: 'Teenage witches / high school drama',
					url: 'https://legacy.drivethrurpg.com/product/572310/Spellcaught?manufacturers_id=31866',
					image: 'https://legacy.drivethrurpg.com/images/31866/572310.jpg',
					quote: 'High school is already a crucible. Add magic, and someone’s going to get burned.',
					setting: 'd6',
					prep: 'd6',
					complexity: 'd8',
				},
			},
			traitSets: [
				{
					id: 'name',
					name: 'Name',
					view: {
						style: {
							header: 'default',
							body: 'name',
						},
						page: 1,
					},
					traits: [
						{
							name: 'name',
							label: 'Name',
							traits: [],
						},
						{
							name: 'player',
							label: 'Player',
							traits: [],
						},
						{
							name: 'nickname',
							label: 'Nickname',
							traits: [],
						},
						{
							name: 'pronouns',
							label: 'Pronouns',
							traits: [],
						},
						{
							name: 'description',
							label: 'Description',
							traits: [],
						},
						{
							name: 'game',
							label: 'Game',
							view: {
								visibility: 'hidden',
							},
							traits: [],
						},
						{
							name: 'portrait',
							traits: [],
						},
						{
							name: 'caption',
							traits: [],
						},
						{
							name: 'plotPoints',
							rating: {
								type: 'Counter',
								value: [1],
								range: [0, 20],
							},
							label: 'PP',
							spendable: true,
							view: {
								visibility: 'hidden',
							},
							traits: [],
						},
						{
							name: 'notes',
							view: {
								visibility: 'hidden',
							},
							traits: [],
						},
					],
				},
				{
					id: 'growth-pool',
					name: 'Growth Pool',
					view: {
						features: {
							description: false,
							sfx: false,
							subtraits: false,
						},
						page: 1,
						style: {
							header: 'default',
							body: 'dice-count',
						},
						ratingLadder: [4, 6, 8, 10, 12],
						multiDie: true,
						reservedSlots: 5,
						place: {
							left: '0%',
							top: 0,
							width: '22%',
							height: 1,
						},
						labels: {
							rating: 'RATING',
							dice: '/ DICE',
						},
						pillar: 'play',
					},
					pool: true,
					noun: 'Growth Die',
					plural: 'Growth Dice',
					traits: [
						{
							name: 'D4',
							rating: {
								type: 'Die',
								value: [4],
								range: [4, 6, 8, 10, 12],
							},
							spendable: true,
							hitches: 0,
							view: {
								poolCount: 1,
							},
							traits: [],
						},
						{
							name: 'D6',
							rating: {
								type: 'Die',
								value: [6],
								range: [4, 6, 8, 10, 12],
							},
							spendable: true,
							hitches: 0,
							view: {
								poolCount: 1,
							},
							traits: [],
						},
						{
							name: 'D8',
							rating: {
								type: 'Die',
								value: [8],
								range: [4, 6, 8, 10, 12],
							},
							spendable: true,
							hitches: 0,
							view: {
								poolCount: 1,
							},
							traits: [],
						},
						{
							name: 'D10',
							rating: {
								type: 'Die',
								value: [10],
								range: [4, 6, 8, 10, 12],
							},
							spendable: true,
							hitches: 0,
							view: {
								poolCount: 1,
							},
							traits: [],
						},
						{
							name: 'D12',
							rating: {
								type: 'Die',
								value: [12],
								range: [4, 6, 8, 10, 12],
							},
							spendable: true,
							hitches: 0,
							view: {
								poolCount: 1,
							},
							traits: [],
						},
					],
				},
				{
					id: 'distinctions',
					name: 'Distinctions',
					description: 'Origin of the magical calamity and personal burden',
					view: {
						features: {
							description: true,
							sfx: false,
							subtraits: false,
						},
						ratingLadder: [8],
						page: 1,
						multiDie: false,
						notes: "Gain a PP when you trade out your distinction's d8 rating for a d4.",
						reservedSlots: 3,
						place: {
							left: '22%',
							top: 0,
							width: '78%',
							height: 1,
						},
						pillar: 'prime',
						altRoll: {
							die: 4,
							ppDelta: 1,
							label: 'Hinder',
						},
					},
					noun: 'Distinction',
					plural: 'Distinctions',
					traits: [
						{
							name: '',
							rating: {
								type: 'Die',
								value: [8],
								range: [4, 6, 8, 10, 12],
							},
							traits: [
								{
									name: 'Hinder',
									rating: {
										type: 'Die',
										value: [4],
										range: [4],
									},
									traits: [],
									noun: 'SFX',
									ppDelta: 1,
								},
							],
							view: {
								badge: {
									text: 'SFX',
									shape: 'vertical-bar',
									color: 'black',
								},
							},
						},
						{
							name: '',
							rating: {
								type: 'Die',
								value: [8],
								range: [4, 6, 8, 10, 12],
							},
							traits: [
								{
									name: 'Hinder',
									rating: {
										type: 'Die',
										value: [4],
										range: [4],
									},
									traits: [],
									noun: 'SFX',
									ppDelta: 1,
								},
							],
							view: {
								badge: {
									text: 'SFX',
									shape: 'vertical-bar',
									color: 'black',
								},
							},
						},
						{
							name: '',
							rating: {
								type: 'Die',
								value: [8],
								range: [4, 6, 8, 10, 12],
							},
							traits: [
								{
									name: 'Hinder',
									rating: {
										type: 'Die',
										value: [4],
										range: [4],
									},
									traits: [],
									noun: 'SFX',
									ppDelta: 1,
								},
							],
							view: {
								badge: {
									text: 'SFX',
									shape: 'vertical-bar',
									color: 'black',
								},
							},
						},
					],
				},
				{
					id: 'values',
					name: 'Values',
					description: 'Gain a PP when you use your d4 value.',
					statement: true,
					view: {
						features: {
							description: true,
							sfx: false,
							subtraits: false,
						},
						page: 1,
						style: {
							header: 'default',
							body: 'default',
						},
						ratingLadder: [4, 6, 8, 10, 12],
						multiDie: false,
						notes: '',
						reservedSlots: 6,
						place: {
							left: '0%',
							top: 1,
							width: '61%',
							height: 1,
						},
						parts: {
							name: {
								left: '0%',
								top: 0,
								width: '70%',
								height: 1,
							},
							rating: {
								left: '70%',
								top: 0,
								width: '30%',
								height: 1,
							},
						},
						pillar: 'prime',
						fixedNames: true,
					},
					noun: 'Value',
					plural: 'Values',
					traits: [
						{
							name: 'Ambition',
							traits: [],
						},
						{
							name: 'Responsibility',
							traits: [],
						},
						{
							name: 'Belonging',
							traits: [],
						},
						{
							name: 'Popularity',
							traits: [],
						},
						{
							name: 'Empathy',
							traits: [],
						},
						{
							name: 'Secrecy',
							traits: [],
						},
					],
				},
				{
					id: 'signature-assets',
					name: 'Signature Assets',
					view: {
						features: {
							description: true,
							sfx: false,
							subtraits: false,
						},
						page: 1,
						style: {
							header: 'default',
							body: 'default',
						},
						ratingLadder: [6, 8, 10, 12],
						reservedSlots: 6,
						place: {
							left: '61%',
							top: 1,
							width: '39%',
							height: 1,
						},
						parts: {
							rating: {
								left: '0%',
								top: 0,
								width: '100%',
								height: 1,
							},
							name: {
								left: '0%',
								top: 1,
								width: '100%',
								height: 1,
							},
						},
						pillar: 'plus',
					},
					noun: 'Asset',
					plural: 'Assets',
					traits: [],
				},
				{
					id: 'affiliations',
					name: 'Affiliations',
					description:
						'When Worlds Collide: When two affiliations are in the same scene, add a d6 to the doom pool and a d4 to your dice pool to include both affiliations in your pool.',
					statement: true,
					view: {
						features: {
							description: true,
							sfx: false,
							subtraits: false,
						},
						page: 1,
						style: {
							header: 'default',
							body: 'default',
						},
						ratingLadder: [4, 6, 8, 10, 12],
						multiDie: false,
						notes: '',
						reservedSlots: 4,
						place: {
							left: '0%',
							top: 2,
							width: '100%',
							height: 1,
						},
						parts: {
							name: {
								left: '0%',
								top: 0,
								width: '70%',
								height: 1,
							},
							rating: {
								left: '70%',
								top: 0,
								width: '30%',
								height: 1,
							},
						},
						pillar: 'prime',
						fixedNames: true,
					},
					noun: 'Affiliation',
					plural: 'Affiliations',
					traits: [
						{
							name: 'Self',
							traits: [],
						},
						{
							name: 'Family',
							traits: [],
						},
						{
							name: 'School',
							traits: [],
						},
						{
							name: 'Coven',
							traits: [],
						},
					],
				},
				{
					id: 'stress',
					name: 'Stress',
					view: {
						header: 'top',
						headerAlign: 'left',
						features: {
							description: false,
							sfx: false,
							subtraits: false,
						},
						page: 1,
						style: {
							header: 'die-track',
							body: 'die-track',
						},
						ratingLadder: [4, 6, 8, 10, 12],
						reservedSlots: 5,
						place: {
							left: '0%',
							top: 3,
							width: '24%',
							height: 1,
						},
						parts: {
							name: {
								left: '0%',
								top: 0,
								width: '100%',
								height: 1,
							},
							rating: {
								left: '0%',
								top: 1,
								width: '100%',
								height: 1,
							},
						},
						pillar: 'play',
					},
					noun: 'Stress',
					plural: 'Stress',
					traits: [
						{
							name: 'Angry',
							traits: [],
						},
						{
							name: 'Depressed',
							traits: [],
						},
						{
							name: 'Exhausted',
							traits: [],
						},
						{
							name: 'Insecure',
							traits: [],
						},
						{
							name: 'Injured',
							traits: [],
						},
					],
				},
				{
					id: 'arcane-crafts-sfx',
					name: 'Crafts',
					description: 'Mutated magical expressions and spellcasting disciplines',
					view: {
						features: {
							description: false,
							sfx: false,
							subtraits: false,
						},
						page: 1,
						style: {
							header: 'default',
							body: 'default',
						},
						ratingLadder: [4, 6, 8, 10, 12],
						multiDie: false,
						notes: '',
						reservedSlots: 10,
						place: {
							left: '24%',
							top: 3,
							width: '48%',
							height: 1,
						},
						pillar: 'plus',
					},
					noun: 'Craft',
					plural: 'Crafts',
					traits: [
						{
							name: 'Azure Sympathy',
							traits: [],
						},
						{
							name: 'Black Wards',
							traits: [],
						},
						{
							name: 'Bronze Mending',
							traits: [],
						},
						{
							name: 'Crimson Passion',
							traits: [],
						},
						{
							name: 'Golden Inspiration',
							traits: [],
						},
						{
							name: 'Orange Flare',
							traits: [],
						},
						{
							name: 'Pink Fidelity',
							traits: [],
						},
						{
							name: 'Purple Veils',
							traits: [],
						},
						{
							name: 'Verdant Conjuration',
							traits: [],
						},
						{
							name: 'White Purification',
							traits: [],
						},
					],
				},
				{
					id: 'sfx',
					name: 'SFX',
					view: {
						place: {
							left: '72%',
							top: 3,
							width: '28%',
							height: 1,
						},
						parts: {
							rating: {
								left: '0%',
								top: 0,
								width: '100%',
								height: 1,
							},
							name: {
								left: '0%',
								top: 1,
								width: '100%',
								height: 1,
							},
						},
						reservedSlots: 4,
						pillar: 'plus',
					},
					noun: 'SFX',
					plural: 'SFX',
					traits: [],
				},
			],
		},
	},
	{
		id: 'strange-towns',
		version: 1,
		character: {
			$schema: '../schema/0.1/character.schema.json',
			version: '0.1',
			id: 'template-strange-towns',
			isTemplate: true,
			name: '',
			game: 'Strange Towns',
			description: '',
			pronouns: '',
			plotPoints: 1,
			notes: '',
			player: '',
			portrait: {
				url: '',
				view: {
					location: 'header',
				},
			},
			view: {
				pageCount: 1,
				template: 'Strange Towns',
				watermark: {
					enabled: true,
					url: 'images/cortex_prime_logo_light_transparent.png',
					opacity: 0.08,
					scale: 70,
					page: 'all',
				},
				columnAlignment: 'top-base',
				columnOffsets: {
					left: 0,
					center: 0,
					right: 0,
				},
				listing: {
					subtitle: 'Small Town Supernatural Weirdness',
					genre: 'Weird horror / small-town mystery',
					variant: 'Townsperson File',
					url: 'https://legacy.drivethrurpg.com/product/567043/Strange-Towns?manufacturers_id=31866',
					image: 'https://legacy.drivethrurpg.com/images/31866/567043.jpg',
					quote: 'There’s something wrong with this town. Maybe it’s the sheriff who never blinks.',
					setting: 'd6',
					prep: 'd6',
					complexity: 'd6',
				},
			},
			traitSets: [
				{
					id: 'name',
					name: 'Name',
					view: {
						style: {
							header: 'default',
							body: 'name',
						},
						page: 1,
					},
					traits: [
						{
							name: 'name',
							label: 'Name',
							traits: [],
						},
						{
							name: 'player',
							label: 'Player',
							traits: [],
						},
						{
							name: 'nickname',
							label: 'Nickname',
							traits: [],
						},
						{
							name: 'pronouns',
							label: 'Ruin',
							traits: [],
						},
						{
							name: 'description',
							label: 'Description',
							traits: [],
						},
						{
							name: 'game',
							label: 'Game',
							view: {
								visibility: 'hidden',
							},
							traits: [],
						},
						{
							name: 'portrait',
							traits: [],
						},
						{
							name: 'caption',
							traits: [],
						},
						{
							name: 'plotPoints',
							rating: {
								type: 'Counter',
								value: [1],
								range: [0, 20],
							},
							label: 'PP',
							spendable: true,
							view: {
								visibility: 'hidden',
							},
							traits: [],
						},
						{
							name: 'notes',
							view: {
								visibility: 'hidden',
							},
							traits: [],
						},
					],
				},
				{
					id: 'attributes',
					name: 'Attributes',
					description: 'Core attributes',
					view: {
						features: {
							description: false,
							sfx: false,
							subtraits: false,
						},
						page: 1,
						style: {
							header: 'default',
							body: 'default',
						},
						ratingLadder: [6, 8, 10],
						multiDie: false,
						notes: '',
						reservedSlots: 3,
						place: {
							left: '0%',
							top: 0,
							width: '28%',
							height: 1,
						},
						parts: {
							name: {
								left: '0%',
								top: 0,
								width: '100%',
								height: 1,
							},
							rating: {
								left: '0%',
								top: 1,
								width: '100%',
								height: 1,
							},
						},
						pillar: 'prime',
						fixedNames: true,
					},
					noun: 'Attribute',
					plural: 'Attributes',
					traits: [
						{
							name: 'Mental',
							traits: [],
						},
						{
							name: 'Physical',
							traits: [],
						},
						{
							name: 'Social',
							traits: [],
						},
					],
				},
				{
					id: 'distinctions',
					name: 'Distinctions',
					description: 'Mundane, Offbeat, and Strange facets of town life',
					view: {
						features: {
							description: true,
							sfx: false,
							subtraits: false,
						},
						ratingLadder: [8],
						page: 1,
						multiDie: false,
						reservedSlots: 3,
						place: {
							left: '28%',
							top: 0,
							width: '72%',
							height: 1,
						},
						pillar: 'prime',
						altRoll: {
							die: 4,
							ppDelta: 1,
							label: 'Hinder',
						},
						notes: "Gain a PP when you trade out your distinction's d8 rating for a d4.",
					},
					noun: 'Distinction',
					plural: 'Distinctions',
					traits: [],
				},
				{
					id: 'roles',
					name: 'Roles',
					description: 'Town archetypes and societal roles',
					view: {
						features: {
							description: false,
							sfx: false,
							subtraits: false,
						},
						page: 1,
						style: {
							header: 'default',
							body: 'default',
						},
						ratingLadder: [4, 6, 8, 10, 12],
						multiDie: false,
						notes: '',
						reservedSlots: 6,
						place: {
							left: '0%',
							top: 1,
							width: '28%',
							height: 1,
						},
						parts: {
							name: {
								left: '0%',
								top: 0,
								width: '100%',
								height: 1,
							},
							rating: {
								left: '0%',
								top: 1,
								width: '100%',
								height: 1,
							},
						},
						pillar: 'prime',
						fixedNames: true,
					},
					noun: 'Role',
					plural: 'Roles',
					traits: [
						{
							name: 'Enforcer',
							traits: [],
						},
						{
							name: 'Entrepreneur',
							traits: [],
						},
						{
							name: 'Rebel',
							traits: [],
						},
						{
							name: 'Sage',
							traits: [],
						},
						{
							name: 'Shepherd',
							traits: [],
						},
						{
							name: 'Townie',
							traits: [],
						},
					],
				},
				{
					id: 'relationships-strange-die',
					name: 'Relationships',
					description: 'Bonds and ties within the town',
					view: {
						features: {
							description: false,
							sfx: false,
							subtraits: false,
						},
						page: 1,
						style: {
							header: 'default',
							body: 'default',
						},
						ratingLadder: [4, 6, 8, 10, 12],
						multiDie: false,
						reservedSlots: 6,
						place: {
							left: '28%',
							top: 1,
							width: '72%',
							height: 1,
						},
						pillar: 'prime',
					},
					noun: 'Relationship',
					plural: 'Relationships',
					traits: [],
				},
				{
					id: 'signature-assets',
					name: 'Signature Assets',
					view: {
						features: {
							description: true,
							sfx: false,
							subtraits: false,
						},
						page: 1,
						style: {
							header: 'default',
							body: 'default',
						},
						ratingLadder: [8],
						reservedSlots: 2,
						place: {
							left: '0%',
							top: 2,
							width: '25%',
							height: 1,
						},
						parts: {
							name: {
								left: '0%',
								top: 0,
								width: '100%',
								height: 1,
							},
							rating: {
								left: '0%',
								top: 1,
								width: '100%',
								height: 1,
							},
							description: {
								left: '0%',
								top: 2,
								width: '100%',
								height: 1,
							},
						},
						pillar: 'plus',
					},
					noun: 'Asset',
					plural: 'Assets',
					traits: [
						{
							name: '',
							rating: {
								type: 'Die',
								value: [8],
								range: [4, 6, 8, 10, 12],
							},
							traits: [],
						},
						{
							name: '',
							rating: {
								type: 'Die',
								value: [8],
								range: [4, 6, 8, 10, 12],
							},
							traits: [],
						},
					],
				},
				{
					id: 'complications',
					name: 'Complications',
					view: {
						features: {
							description: true,
							sfx: false,
							subtraits: false,
						},
						page: 1,
						style: {
							header: 'default',
							body: 'default',
						},
						ratingLadder: [4, 6, 8, 10, 12],
						reservedSlots: 3,
						place: {
							left: '25%',
							top: 2,
							width: '50%',
							height: 1,
						},
						parts: {
							name: {
								left: '0%',
								top: 0,
								width: '100%',
								height: 1,
							},
							rating: {
								left: '0%',
								top: 1,
								width: '100%',
								height: 1,
							},
							description: {
								left: '0%',
								top: 2,
								width: '100%',
								height: 1,
							},
						},
						playMutable: true,
						pillar: 'play',
					},
					noun: 'Complication',
					plural: 'Complications',
					traits: [],
				},
				{
					id: 'strange-die',
					name: 'Strange Die',
					view: {
						ladder: true,
						features: {
							description: false,
							sfx: false,
							subtraits: false,
						},
						page: 1,
						style: {
							header: 'default',
							body: 'die-rows',
						},
						ratingLadder: [4, 6, 8, 10, 12],
						reservedSlots: 1,
						place: {
							left: '75%',
							top: 2,
							width: '25%',
							height: 1,
						},
						pillar: 'plus',
					},
					noun: 'Die',
					plural: 'Dice',
					traits: [],
				},
			],
		},
	},
	{
		id: 'terraverse',
		version: 1,
		character: {
			$schema: '../schema/0.1/character.schema.json',
			version: '0.1',
			id: 'template-terraverse',
			isTemplate: true,
			name: '',
			game: 'Terraverse',
			description: '',
			pronouns: '',
			plotPoints: 1,
			notes: '',
			player: '',
			portrait: {
				url: '',
				view: {
					location: 'header',
				},
			},
			view: {
				pageCount: 2,
				template: 'Terraverse',
				watermark: {
					enabled: true,
					url: 'images/cortex_prime_logo_light_transparent.png',
					opacity: 0.08,
					scale: 70,
					page: 'all',
				},
				columnAlignment: 'top-base',
				columnOffsets: {
					left: 0,
					center: 0,
					right: 0,
				},
				listing: {
					subtitle: 'Epic Science-Fantasy Multiverse',
					genre: 'Science fantasy / multiverse adventure',
					url: 'https://legacy.drivethrurpg.com/product/567047/Terraverse?manufacturers_id=31866',
					image: 'https://legacy.drivethrurpg.com/images/31866/567047.jpg',
					quote:
						'Every world is a version of this one. Some are close — a step to the left, a slightly different history.',
					setting: 'd10',
					prep: 'd10',
					complexity: 'd10',
				},
			},
			traitSets: [
				{
					id: 'name',
					name: 'Name',
					view: {
						style: {
							header: 'default',
							body: 'name',
						},
						page: 1,
					},
					traits: [
						{
							name: 'name',
							label: 'Name',
							traits: [],
						},
						{
							name: 'player',
							label: 'Player',
							traits: [],
						},
						{
							name: 'nickname',
							label: 'Nickname',
							traits: [],
						},
						{
							name: 'pronouns',
							label: 'Pronouns',
							traits: [],
						},
						{
							name: 'description',
							label: 'Description',
							traits: [],
						},
						{
							name: 'game',
							label: 'Game',
							view: {
								visibility: 'hidden',
							},
							traits: [],
						},
						{
							name: 'portrait',
							traits: [],
						},
						{
							name: 'caption',
							traits: [],
						},
						{
							name: 'plotPoints',
							rating: {
								type: 'Counter',
								value: [1],
								range: [0, 20],
							},
							label: 'PP',
							spendable: true,
							view: {
								visibility: 'hidden',
							},
							traits: [],
						},
						{
							name: 'notes',
							view: {
								visibility: 'hidden',
							},
							traits: [],
						},
					],
				},
				{
					id: 'attributes',
					name: 'Attributes',
					description: 'Core hero ratings with Vitality and Willpower',
					view: {
						features: {
							description: false,
							sfx: false,
							subtraits: false,
						},
						page: 1,
						style: {
							header: 'default',
							body: 'default',
						},
						ratingLadder: [4, 6, 8, 10, 12],
						multiDie: false,
						notes: '',
						reservedSlots: 6,
						place: {
							left: '0%',
							top: 0,
							width: '28%',
							height: 1,
						},
						parts: {
							name: {
								left: '0%',
								top: 0,
								width: '100%',
								height: 1,
							},
							rating: {
								left: '0%',
								top: 1,
								width: '100%',
								height: 1,
							},
						},
						pillar: 'prime',
						fixedNames: true,
					},
					noun: 'Attribute',
					plural: 'Attributes',
					traits: [
						{
							name: 'Agility',
							traits: [],
						},
						{
							name: 'Alertness',
							traits: [],
						},
						{
							name: 'Intelligence',
							traits: [],
						},
						{
							name: 'Strength',
							traits: [],
						},
						{
							name: 'Vitality',
							traits: [],
						},
						{
							name: 'Willpower',
							traits: [],
						},
					],
				},
				{
					id: 'distinctions',
					name: 'Distinctions',
					description: 'Multiversal origin, champion archetype, and personal drive',
					view: {
						features: {
							description: true,
							sfx: false,
							subtraits: false,
						},
						ratingLadder: [8],
						page: 1,
						multiDie: false,
						reservedSlots: 6,
						place: {
							left: '28%',
							top: 0,
							width: '72%',
							height: 1,
						},
						pillar: 'prime',
						altRoll: {
							die: 4,
							ppDelta: 1,
							label: 'Hinder',
						},
						notes: "Gain a PP when you switch out your distinction's rating of d8 for a d4.",
					},
					noun: 'Distinction',
					plural: 'Distinctions',
					traits: [
						{
							name: '',
							rating: {
								type: 'Die',
								value: [8],
								range: [4, 6, 8, 10, 12],
							},
							traits: [
								{
									name: 'Hinder',
									rating: {
										type: 'Die',
										value: [4],
										range: [4],
									},
									traits: [],
									noun: 'SFX',
									ppDelta: 1,
								},
							],
							view: {
								badge: {
									text: 'SFX',
									shape: 'vertical-bar',
									color: 'black',
								},
							},
						},
						{
							name: '',
							rating: {
								type: 'Die',
								value: [8],
								range: [4, 6, 8, 10, 12],
							},
							traits: [
								{
									name: 'Hinder',
									rating: {
										type: 'Die',
										value: [4],
										range: [4],
									},
									traits: [],
									noun: 'SFX',
									ppDelta: 1,
								},
							],
							view: {
								badge: {
									text: 'SFX',
									shape: 'vertical-bar',
									color: 'black',
								},
							},
						},
						{
							name: '',
							rating: {
								type: 'Die',
								value: [8],
								range: [4, 6, 8, 10, 12],
							},
							traits: [
								{
									name: 'Hinder',
									rating: {
										type: 'Die',
										value: [4],
										range: [4],
									},
									traits: [],
									noun: 'SFX',
									ppDelta: 1,
								},
							],
							view: {
								badge: {
									text: 'SFX',
									shape: 'vertical-bar',
									color: 'black',
								},
							},
						},
					],
				},
				{
					id: 'signature-assets',
					name: 'Signature Assets',
					description: 'Artifacts and multiversal gear',
					view: {
						features: {
							description: false,
							sfx: false,
							subtraits: false,
						},
						page: 1,
						style: {
							header: 'default',
							body: 'default',
						},
						ratingLadder: [8, 10, 12],
						multiDie: false,
						notes: '',
						reservedSlots: 4,
						place: {
							left: '0%',
							top: 1,
							width: '28%',
							height: 1,
						},
						pillar: 'plus',
					},
					noun: 'Signature Asset',
					plural: 'Signature Assets',
					traits: [],
				},
				{
					id: 'subtrait-columns',
					name: 'Skills & Specialties',
					description: 'Multiverse capabilities (d4-d6) and specialized proficiencies (d8-d12)',
					view: {
						header: 'top',
						headerAlign: 'center',
						features: {
							description: false,
							sfx: false,
							subtraits: true,
						},
						page: 1,
						style: {
							header: 'default',
							body: 'subtrait-columns',
						},
						ratingLadder: [4, 6],
						subtraitRatingLadder: [8, 10, 12],
						labels: {
							left: 'Skills',
							right: 'Specialties',
						},
						multiDie: false,
						reservedSlots: 19,
						place: {
							left: '28%',
							top: 1,
							width: '72%',
							height: 1,
						},
						pillar: 'prime',
						fixedNames: true,
					},
					noun: 'Skill',
					plural: 'Skills',
					traits: [
						{
							name: 'Craft',
							traits: [],
						},
						{
							name: 'Drive',
							traits: [],
						},
						{
							name: 'Fight',
							traits: [],
						},
						{
							name: 'Fix',
							traits: [],
						},
						{
							name: 'Fly',
							traits: [],
						},
						{
							name: 'Focus',
							traits: [],
						},
						{
							name: 'Influence',
							traits: [],
						},
						{
							name: 'Know',
							traits: [],
						},
						{
							name: 'Labor',
							traits: [],
						},
						{
							name: 'Move',
							traits: [],
						},
						{
							name: 'Notice',
							traits: [],
						},
						{
							name: 'Operate',
							traits: [],
						},
						{
							name: 'Perform',
							traits: [],
						},
						{
							name: 'Shoot',
							traits: [],
						},
						{
							name: 'Sneak',
							traits: [],
						},
						{
							name: 'Survive',
							traits: [],
						},
						{
							name: 'Throw',
							traits: [],
						},
						{
							name: 'Treat',
							traits: [],
						},
						{
							name: 'Trick',
							traits: [],
						},
					],
				},
				{
					id: 'initiative',
					name: 'Initiative',
					view: {
						ladder: true,
						features: {
							description: false,
							sfx: false,
							subtraits: false,
						},
						page: 1,
						style: {
							header: 'default',
							body: 'die-rows',
						},
						ratingLadder: [4, 6, 8, 10, 12],
						labelPosition: 'vertical',
						reservedSlots: 2,
						place: {
							left: '0%',
							top: 2,
							width: '50%',
							height: 1,
						},
						pillar: 'plus',
					},
					noun: 'Die',
					plural: 'Dice',
					traits: [],
				},
				{
					id: 'hero-dice',
					name: 'Hero Dice',
					view: {
						ladder: true,
						features: {
							description: false,
							sfx: false,
							subtraits: false,
						},
						page: 1,
						style: {
							header: 'default',
							body: 'die-rows',
						},
						ratingLadder: [4, 6, 8, 10, 12],
						labelPosition: 'vertical',
						reservedSlots: 1,
						place: {
							left: '0%',
							top: 3,
							width: '50%',
							height: 1,
						},
						pillar: 'plus',
					},
					noun: 'Die',
					plural: 'Dice',
					traits: [],
				},
				{
					id: 'life-points',
					name: 'Life Points',
					description: 'Vitality (12 → 1, Injured!) • Ø • Willpower (1 → 12, Dazed!)',
					view: {
						header: 'top',
						headerAlign: 'left',
						features: {
							description: false,
							sfx: false,
							subtraits: false,
						},
						page: 1,
						style: {
							header: 'default',
							body: 'pips',
						},
						pips: {
							perRow: 12,
							connected: true,
						},
						pillar: 'play',
					},
					rating: {
						type: 'Pip',
						value: [
							false,
							false,
							false,
							false,
							false,
							false,
							false,
							false,
							false,
							false,
							false,
							false,
							false,
							false,
							false,
							false,
							false,
							false,
							false,
							false,
							false,
							false,
							false,
							false,
						],
					},
					noun: 'Point',
					plural: 'Points',
					traits: [],
				},
				{
					id: 'power-set-1',
					name: 'Power Set 1',
					description: 'SFX: • SFX: • Limit:',
					view: {
						header: 'top',
						headerAlign: 'center',
						features: {
							description: true,
							sfx: true,
							subtraits: false,
						},
						page: 2,
						style: {
							header: 'default',
							body: 'default',
						},
						ratingLadder: [6, 8, 10, 12],
						multiDie: false,
						notes: '',
						reservedSlots: 3,
						place: {
							left: '0%',
							top: 0,
							width: '33.333%',
							height: 1,
						},
						pillar: 'plus',
						fixedNames: true,
					},
					noun: 'Power',
					plural: 'Powers',
					traits: [
						{
							name: '',
							traits: [
								{
									name: 'SFX 1',
									traits: [],
									noun: 'SFX',
								},
								{
									name: 'SFX 2',
									traits: [],
									noun: 'SFX',
								},
								{
									name: 'Limit',
									traits: [],
									noun: 'SFX',
								},
							],
							view: {
								badge: {
									text: 'SFX',
									shape: 'vertical-bar',
									color: 'black',
								},
							},
						},
					],
				},
				{
					id: 'power-set-2',
					name: 'Power Set 2',
					description: 'SFX: • SFX: • Limit:',
					view: {
						header: 'top',
						headerAlign: 'center',
						features: {
							description: true,
							sfx: true,
							subtraits: false,
						},
						page: 2,
						style: {
							header: 'default',
							body: 'default',
						},
						ratingLadder: [6, 8, 10, 12],
						multiDie: false,
						notes: '',
						reservedSlots: 3,
						place: {
							left: '33.333%',
							top: 0,
							width: '33.333%',
							height: 1,
						},
						pillar: 'plus',
						fixedNames: true,
					},
					noun: 'Power',
					plural: 'Powers',
					traits: [
						{
							name: '',
							traits: [
								{
									name: 'SFX 1',
									traits: [],
									noun: 'SFX',
								},
								{
									name: 'SFX 2',
									traits: [],
									noun: 'SFX',
								},
								{
									name: 'Limit',
									traits: [],
									noun: 'SFX',
								},
							],
							view: {
								badge: {
									text: 'SFX',
									shape: 'vertical-bar',
									color: 'black',
								},
							},
						},
					],
				},
				{
					id: 'power-set-3',
					name: 'Power Set 3',
					description: 'SFX: • SFX: • Limit:',
					view: {
						header: 'top',
						headerAlign: 'center',
						features: {
							description: true,
							sfx: true,
							subtraits: false,
						},
						page: 2,
						style: {
							header: 'default',
							body: 'default',
						},
						ratingLadder: [6, 8, 10, 12],
						multiDie: false,
						notes: '',
						reservedSlots: 3,
						place: {
							left: '66.666%',
							top: 0,
							width: '33.334%',
							height: 1,
						},
						pillar: 'plus',
						fixedNames: true,
					},
					noun: 'Power',
					plural: 'Powers',
					traits: [
						{
							name: '',
							traits: [
								{
									name: 'SFX 1',
									traits: [],
									noun: 'SFX',
								},
								{
									name: 'SFX 2',
									traits: [],
									noun: 'SFX',
								},
								{
									name: 'Limit',
									traits: [],
									noun: 'SFX',
								},
							],
							view: {
								badge: {
									text: 'SFX',
									shape: 'vertical-bar',
									color: 'black',
								},
							},
						},
					],
				},
				{
					id: 'talents-growth-options',
					name: 'Talents',
					description: 'Name, Activation, and Effect',
					view: {
						features: {
							description: true,
							sfx: true,
							subtraits: false,
						},
						page: 2,
						multiDie: false,
						notes: '',
						reservedSlots: 4,
						place: {
							left: '0%',
							top: 1,
							width: '66.663%',
							height: 1,
						},
						labels: {
							col1: 'TALENT',
							col2: 'ACTIVATION',
							col3: 'EFFECT',
						},
						pillar: 'plus',
						parts: {
							name: {
								left: '0%',
								top: 0,
								width: '28%',
								height: 1,
							},
							description: {
								left: '28%',
								top: 0,
								width: '33%',
								height: 1,
							},
							'child:SFX': {
								left: '61%',
								top: 0,
								width: '39%',
								height: 1,
							},
						},
					},
					noun: 'Talent',
					plural: 'Talents',
					traits: [],
				},
				{
					id: 'session-record',
					name: 'Session Record',
					view: {
						features: {
							description: false,
							sfx: false,
							subtraits: false,
						},
						page: 2,
						style: {
							header: 'default',
							body: 'pips',
						},
						pips: {
							perRow: 6,
							connected: true,
						},
						reservedSlots: 0,
						place: {
							left: '66.663%',
							top: 1,
							width: '33.334%',
							height: 1,
						},
						pillar: 'play',
					},
					rating: {
						type: 'Pip',
						value: [false, false, false, false, false, false, false, false, false, false, false, false],
					},
					noun: 'Session',
					plural: 'Sessions',
					traits: [],
				},
				{
					id: 'leveling-up',
					name: 'Leveling Up',
					view: {
						header: 'top',
						headerAlign: 'center',
						features: {
							description: false,
							sfx: false,
							subtraits: false,
						},
						page: 2,
						place: {
							left: '66.66%',
							top: 2,
							width: '33.334%',
							height: 1,
						},
						pillar: 'play',
						parts: {
							description: {
								left: '0%',
								top: 0,
								width: '100%',
								height: 1,
							},
						},
					},
					noun: 'Option',
					plural: 'Options',
					traits: [
						{
							name: '',
							description:
								'**1 Session:** Turn an asset from a session into a signature asset at d6 • Switch out a distinction for a new one\n**2 Sessions:** Step up a signature asset • Add a new specialty to a skill • Add a new SFX to a power set\n**3 Sessions:** Step up a skill from d4 to d6, or add a power at d6 • Add a new talent from your archetype list or general list • Add a second power set (with one d8 power, one SFX, one limit)\n**4 Sessions:** Step up one attribute and step down another',
							traits: [],
						},
					],
				},
			],
		},
	},
	{
		id: 'titans-handler',
		version: 1,
		character: {
			$schema: '../schema/0.1/character.schema.json',
			version: '0.1',
			id: 'template-titans-handler',
			isTemplate: true,
			name: '',
			game: 'Titans vs Leviathans',
			description: '',
			pronouns: '',
			plotPoints: 1,
			notes: '',
			player: '',
			portrait: {
				url: '',
				view: {
					location: 'header',
				},
			},
			view: {
				pageCount: 1,
				template: 'Titans vs Leviathans',
				watermark: {
					enabled: true,
					url: 'images/cortex_prime_logo_light_transparent.png',
					opacity: 0.08,
					scale: 70,
					page: 'all',
				},
				columnAlignment: 'top-base',
				columnOffsets: {
					left: 0,
					center: 0,
					right: 0,
				},
				listing: {
					title: 'Titans vs Leviathans - Handler',
					subtitle: 'Giant Mech vs Kaiju Combat',
					genre: 'Kaiju / mech action',
					variant: 'Handler File',
					url: 'https://legacy.drivethrurpg.com/product/567042/Titans-vs-Leviathans?manufacturers_id=31866',
					image: 'https://legacy.drivethrurpg.com/images/31866/567042.jpg',
					quote: 'The city shakes. The bay churns.',
					setting: 'd8',
					prep: 'd6',
					complexity: 'd6',
				},
			},
			traitSets: [
				{
					id: 'name',
					name: 'Name',
					view: {
						style: {
							header: 'default',
							body: 'name',
						},
						page: 1,
					},
					traits: [
						{
							name: 'name',
							label: 'Name',
							traits: [],
						},
						{
							name: 'player',
							label: 'Player',
							traits: [],
						},
						{
							name: 'nickname',
							label: 'Nickname',
							traits: [],
						},
						{
							name: 'pronouns',
							label: 'Pronouns',
							traits: [],
						},
						{
							name: 'description',
							label: 'Description',
							traits: [],
						},
						{
							name: 'game',
							label: 'Game',
							view: {
								visibility: 'hidden',
							},
							traits: [],
						},
						{
							name: 'portrait',
							traits: [],
						},
						{
							name: 'caption',
							traits: [],
						},
						{
							name: 'plotPoints',
							rating: {
								type: 'Counter',
								value: [1],
								range: [0, 20],
							},
							label: 'PP',
							spendable: true,
							view: {
								visibility: 'hidden',
							},
							traits: [],
						},
						{
							name: 'notes',
							view: {
								visibility: 'hidden',
							},
							traits: [],
						},
					],
				},
				{
					id: 'handler-attributes',
					name: 'Attributes',
					description: 'Neural synchronization and handler capabilities',
					view: {
						features: {
							description: false,
							sfx: false,
							subtraits: false,
						},
						page: 1,
						style: {
							header: 'default',
							body: 'default',
						},
						ratingLadder: [6, 8, 10],
						multiDie: false,
						notes: '',
						reservedSlots: 3,
						place: {
							left: '0%',
							top: 0,
							width: '28%',
							height: 1,
						},
						parts: {
							name: {
								left: '0%',
								top: 0,
								width: '100%',
								height: 1,
							},
							rating: {
								left: '0%',
								top: 1,
								width: '100%',
								height: 1,
							},
						},
						pillar: 'prime',
						fixedNames: true,
					},
					noun: 'Attribute',
					plural: 'Attributes',
					traits: [
						{
							name: 'Prowess',
							traits: [],
						},
						{
							name: 'Control',
							traits: [],
						},
						{
							name: 'Renown',
							traits: [],
						},
					],
				},
				{
					id: 'roles',
					name: 'Roles',
					description: 'Combat roles and tactical responsibilities',
					view: {
						features: {
							description: false,
							sfx: false,
							subtraits: false,
						},
						page: 1,
						style: {
							header: 'default',
							body: 'default',
						},
						ratingLadder: [4, 6, 8, 10, 12],
						multiDie: false,
						notes: '',
						reservedSlots: 5,
						place: {
							left: '0%',
							top: 1,
							width: '28%',
							height: 1,
						},
						parts: {
							name: {
								left: '0%',
								top: 0,
								width: '100%',
								height: 1,
							},
							rating: {
								left: '0%',
								top: 1,
								width: '100%',
								height: 1,
							},
						},
						pillar: 'prime',
						fixedNames: true,
					},
					noun: 'Role',
					plural: 'Roles',
					traits: [
						{
							name: 'Backup',
							traits: [],
						},
						{
							name: 'Blaster',
							traits: [],
						},
						{
							name: 'Boss',
							traits: [],
						},
						{
							name: 'Brain',
							traits: [],
						},
						{
							name: 'Brawler',
							traits: [],
						},
					],
				},
				{
					id: 'distinctions',
					name: 'Distinctions',
					description: 'Personal identity, public persona, and driving aspiration',
					view: {
						features: {
							description: true,
							sfx: true,
							subtraits: false,
						},
						page: 1,
						ratingLadder: [8],
						multiDie: false,
						notes: '',
						reservedSlots: 3,
						place: {
							left: '28%',
							top: 0,
							width: '72%',
							height: 1,
						},
						pillar: 'prime',
					},
					noun: 'Distinction',
					plural: 'Distinctions',
					traits: [
						{
							name: 'Identity:',
							rating: {
								type: 'Die',
								value: [8],
								range: [4, 6, 8, 10, 12],
							},
							traits: [
								{
									name: 'Hinder',
									rating: {
										type: 'Die',
										value: [4],
										range: [4],
									},
									description: "Gain a PP when you switch out your distinction's rating of d8 for a d4.",
									traits: [],
									noun: 'SFX',
									ppDelta: 1,
								},
								{
									name: 'Affirmation',
									description:
										'Spend a PP to step up an attribute for an action or reaction when acting in line with your personal identity.',
									traits: [],
									noun: 'SFX',
								},
								{
									name: 'Authenticity',
									description:
										'Step up a complication to reroll one or all of your dice, even hitches, when acting in line with your personal identity.',
									traits: [],
									noun: 'SFX',
								},
							],
							view: {
								badge: {
									text: 'SFX',
									shape: 'vertical-bar',
									color: 'black',
								},
								prompt: true,
							},
						},
						{
							name: 'Persona:',
							rating: {
								type: 'Die',
								value: [8],
								range: [4, 6, 8, 10, 12],
							},
							traits: [
								{
									name: 'Hinder',
									rating: {
										type: 'Die',
										value: [4],
										range: [4],
									},
									description: "Gain a PP when you switch out your distinction's rating of d8 for a d4.",
									traits: [],
									noun: 'SFX',
									ppDelta: 1,
								},
								{
									name: 'Shake it Off',
									description: 'Spend a PP to recover a complication when acting in line with your public persona.',
									traits: [],
									noun: 'SFX',
								},
								{
									name: 'Double Down',
									description:
										'Step up a complication to double an attribute for an action or reaction when acting in line with your public persona.',
									traits: [],
									noun: 'SFX',
								},
							],
							view: {
								badge: {
									text: 'SFX',
									shape: 'vertical-bar',
									color: 'black',
								},
								prompt: true,
							},
						},
						{
							name: 'Aspiration:',
							rating: {
								type: 'Die',
								value: [8],
								range: [4, 6, 8, 10, 12],
							},
							traits: [
								{
									name: 'Hinder',
									rating: {
										type: 'Die',
										value: [4],
										range: [4],
									},
									description: "Gain a PP when you switch out your distinction's rating of d8 for a d4.",
									traits: [],
									noun: 'SFX',
									ppDelta: 1,
								},
								{
									name: 'Cards on the Table',
									description:
										"Spend a PP to double an attribute for an action or reaction when you're pursuing your aspiration.",
									traits: [],
									noun: 'SFX',
								},
								{
									name: 'Hurts for a Minute',
									description:
										"Step up a complication to step down one of your titan's stress die ratings when you're pursuing your aspiration.",
									traits: [],
									noun: 'SFX',
								},
							],
							view: {
								badge: {
									text: 'SFX',
									shape: 'vertical-bar',
									color: 'black',
								},
								prompt: true,
							},
						},
					],
				},
				{
					id: 'signature-assets',
					name: 'Signature Assets',
					description: 'Handler cockpit gear and personal assets',
					view: {
						header: 'top',
						headerAlign: 'left',
						features: {
							description: true,
							sfx: false,
							subtraits: false,
						},
						page: 1,
						style: {
							header: 'default',
							body: 'default',
						},
						ratingLadder: [6, 8, 10, 12],
						multiDie: false,
						notes: '',
						reservedSlots: 2,
						place: {
							left: '28%',
							top: 1,
							width: '72%',
							height: 1,
						},
						pillar: 'plus',
					},
					noun: 'Signature Asset',
					plural: 'Signature Assets',
					traits: [],
				},
				{
					id: 'complications',
					name: 'Complications',
					view: {
						header: 'top',
						headerAlign: 'left',
						features: {
							description: true,
							sfx: false,
							subtraits: false,
						},
						page: 1,
						style: {
							header: 'default',
							body: 'default',
						},
						ratingLadder: [4, 6, 8, 10, 12],
						reservedSlots: 2,
						playMutable: true,
						pillar: 'play',
					},
					noun: 'Complication',
					plural: 'Complications',
					traits: [],
				},
			],
		},
	},
	{
		id: 'titans-titan',
		version: 1,
		character: {
			$schema: '../schema/0.1/character.schema.json',
			version: '0.1',
			id: 'template-titans-titan',
			isTemplate: true,
			name: '',
			game: 'Titans vs Leviathans',
			description: '',
			pronouns: '',
			plotPoints: 1,
			notes: '',
			player: '',
			portrait: {
				url: '',
				view: {
					location: 'header',
				},
			},
			view: {
				pageCount: 1,
				template: 'Titans vs Leviathans',
				watermark: {
					enabled: true,
					url: 'images/cortex_prime_logo_light_transparent.png',
					opacity: 0.08,
					scale: 70,
					page: 'all',
				},
				columnAlignment: 'top-base',
				columnOffsets: {
					left: 0,
					center: 0,
					right: 0,
				},
				listing: {
					title: 'Titans vs Leviathans - Titan Mech',
					subtitle: 'Giant Mech vs Kaiju Combat',
					genre: 'Kaiju / mech action',
					variant: 'Titan Mech File',
					url: 'https://legacy.drivethrurpg.com/product/567042/Titans-vs-Leviathans?manufacturers_id=31866',
					image: 'https://legacy.drivethrurpg.com/images/31866/567042.jpg',
					quote: 'The city shakes. The bay churns.',
					setting: 'd8',
					prep: 'd6',
					complexity: 'd6',
				},
			},
			traitSets: [
				{
					id: 'name',
					name: 'Name',
					view: {
						style: {
							header: 'default',
							body: 'name',
						},
						page: 1,
					},
					traits: [
						{
							name: 'name',
							label: 'Name',
							traits: [],
						},
						{
							name: 'player',
							label: 'Player',
							traits: [],
						},
						{
							name: 'nickname',
							label: 'Nickname',
							traits: [],
						},
						{
							name: 'pronouns',
							label: 'Pronouns',
							traits: [],
						},
						{
							name: 'description',
							label: 'Description',
							traits: [],
						},
						{
							name: 'game',
							label: 'Game',
							view: {
								visibility: 'hidden',
							},
							traits: [],
						},
						{
							name: 'portrait',
							traits: [],
						},
						{
							name: 'caption',
							traits: [],
						},
						{
							name: 'plotPoints',
							rating: {
								type: 'Counter',
								value: [1],
								range: [0, 20],
							},
							label: 'PP',
							spendable: true,
							view: {
								visibility: 'hidden',
							},
							traits: [],
						},
						{
							name: 'notes',
							view: {
								visibility: 'hidden',
							},
							traits: [],
						},
					],
				},
				{
					id: 'titan-attributes-stress',
					name: 'Attributes',
					description: 'Heavy mechanized systems with stress tracks',
					view: {
						features: {
							description: false,
							sfx: false,
							subtraits: false,
						},
						page: 1,
						style: {
							header: 'default',
							body: 'default',
						},
						ratingLadder: [6, 8, 10, 12],
						multiDie: false,
						notes: '',
						reservedSlots: 3,
						place: {
							left: '0%',
							top: 0,
							width: '28%',
							height: 1,
						},
						labels: {
							stress: 'STRESS',
						},
						parts: {
							name: {
								left: '0%',
								top: 0,
								width: '100%',
								height: 1,
							},
							rating: {
								left: '0%',
								top: 1,
								width: '100%',
								height: 1,
							},
							trackLabel: {
								left: '0%',
								top: 2,
								width: '100%',
								height: 1,
							},
							track: {
								left: '0%',
								top: 3,
								width: '100%',
								height: 1,
							},
						},
						pillar: 'prime',
						fixedNames: true,
					},
					noun: 'Attribute',
					plural: 'Attributes',
					traits: [
						{
							name: 'Prowess',
							traits: [
								{
									name: 'STRESS',
									rating: {
										type: 'Die',
										value: [],
										range: [6, 8, 10, 12],
									},
									traits: [],
								},
							],
						},
						{
							name: 'Control',
							traits: [
								{
									name: 'STRESS',
									rating: {
										type: 'Die',
										value: [],
										range: [6, 8, 10, 12],
									},
									traits: [],
								},
							],
						},
						{
							name: 'Renown',
							traits: [
								{
									name: 'STRESS',
									rating: {
										type: 'Die',
										value: [],
										range: [6, 8, 10, 12],
									},
									traits: [],
								},
							],
						},
					],
				},
				{
					id: 'titan-distinctions',
					name: 'Distinctions',
					description: 'Chassis type, operational history, and battle stance',
					view: {
						features: {
							description: true,
							sfx: true,
							subtraits: false,
						},
						page: 1,
						ratingLadder: [8],
						multiDie: false,
						notes: '',
						reservedSlots: 3,
						place: {
							left: '28%',
							top: 0,
							width: '72%',
							height: 1,
						},
						pillar: 'prime',
					},
					noun: 'Distinction',
					plural: 'Distinctions',
					traits: [
						{
							name: 'Type:',
							rating: {
								type: 'Die',
								value: [8],
								range: [4, 6, 8, 10, 12],
							},
							traits: [],
							view: {
								prompt: true,
							},
						},
						{
							name: 'History:',
							rating: {
								type: 'Die',
								value: [8],
								range: [4, 6, 8, 10, 12],
							},
							traits: [
								{
									name: 'Underscore',
									description:
										"Spend a PP to double a titan attribute for your next action or reaction when drawing on your titan's history.",
									traits: [],
									noun: 'SFX',
								},
								{
									name: 'Overcompensate',
									description:
										"Step up one stress and reroll one or all of your dice pool when taking an action or reaction that draws on your titan's history.",
									traits: [],
									noun: 'SFX',
								},
							],
							view: {
								badge: {
									text: 'SFX',
									shape: 'vertical-bar',
									color: 'black',
								},
								prompt: true,
							},
						},
						{
							name: 'Battle:',
							rating: {
								type: 'Die',
								value: [8],
								range: [4, 6, 8, 10, 12],
							},
							traits: [],
							view: {
								prompt: true,
							},
						},
					],
				},
				{
					id: 'power-set',
					name: 'Power Set',
					description: 'Colossal kaiju-annihilation weaponry',
					view: {
						features: {
							description: true,
							sfx: true,
							subtraits: false,
						},
						page: 1,
						style: {
							header: 'default',
							body: 'default',
						},
						ratingLadder: [6, 8, 10, 12],
						multiDie: false,
						notes: '',
						reservedSlots: 4,
						place: {
							left: '0%',
							top: 1,
							width: '50%',
							height: 1,
						},
						pillar: 'plus',
						fixedNames: true,
					},
					noun: 'Power',
					plural: 'Powers',
					traits: [],
				},
				{
					id: 'power-set-2',
					name: 'Power Set',
					description: 'Secondary titan systems and ordnance',
					view: {
						features: {
							description: true,
							sfx: true,
							subtraits: false,
						},
						page: 1,
						style: {
							header: 'default',
							body: 'default',
						},
						ratingLadder: [6, 8, 10, 12],
						multiDie: false,
						notes: '',
						reservedSlots: 4,
						place: {
							left: '50%',
							top: 1,
							width: '50%',
							height: 1,
						},
						pillar: 'plus',
						fixedNames: true,
					},
					noun: 'Power',
					plural: 'Powers',
					traits: [],
				},
				{
					id: 'session-record',
					name: 'Session Record',
					view: {
						header: 'top',
						headerAlign: 'right',
						features: {
							description: false,
							sfx: false,
							subtraits: false,
						},
						page: 1,
						style: {
							header: 'default',
							body: 'pips',
						},
						pips: {
							perRow: 15,
							connected: true,
						},
						reservedSlots: 0,
						pillar: 'play',
					},
					rating: {
						type: 'Pip',
						value: [
							false,
							false,
							false,
							false,
							false,
							false,
							false,
							false,
							false,
							false,
							false,
							false,
							false,
							false,
							false,
						],
					},
					noun: 'Session',
					plural: 'Sessions',
					traits: [],
				},
			],
		},
	},
	{
		id: 'trace-20',
		version: 1,
		character: {
			$schema: '../schema/0.1/character.schema.json',
			version: '0.1',
			id: 'template-trace-20',
			isTemplate: true,
			name: '',
			game: 'TRACE 2.0',
			description: '',
			pronouns: '',
			plotPoints: 1,
			notes: '',
			player: '',
			portrait: {
				url: '',
				view: {
					location: 'header',
				},
			},
			view: {
				pageCount: 1,
				template: 'TRACE 2.0',
				watermark: {
					enabled: true,
					url: 'images/cortex_prime_logo_light_transparent.png',
					opacity: 0.08,
					scale: 70,
					page: 'all',
				},
				columnAlignment: 'top-base',
				columnOffsets: {
					left: 0,
					center: 0,
					right: 0,
				},
				listing: {
					subtitle: 'Civic Paranormal Investigation',
					genre: 'Mystery / Procedural / Urban Fantasy',
					url: 'https://legacy.drivethrurpg.com/product/567041/Cortex-Prime-Game-Handbook-2nd-Edition?manufacturers_id=31866',
				},
			},
			traitSets: [
				{
					id: 'name',
					name: 'Name',
					view: {
						style: {
							header: 'default',
							body: 'name',
						},
						page: 1,
					},
					traits: [
						{
							name: 'name',
							label: 'Name',
							traits: [],
						},
						{
							name: 'player',
							label: 'Player',
							traits: [],
						},
						{
							name: 'nickname',
							label: 'Nickname',
							traits: [],
						},
						{
							name: 'pronouns',
							label: 'Pronouns',
							traits: [],
						},
						{
							name: 'description',
							label: 'Description',
							traits: [],
						},
						{
							name: 'game',
							label: 'Game',
							view: {
								visibility: 'hidden',
							},
							traits: [],
						},
						{
							name: 'portrait',
							traits: [],
						},
						{
							name: 'caption',
							traits: [],
						},
						{
							name: 'plotPoints',
							rating: {
								type: 'Counter',
								value: [1],
								range: [0, 20],
							},
							label: 'PP',
							spendable: true,
							view: {
								visibility: 'hidden',
							},
							traits: [],
						},
						{
							name: 'notes',
							view: {
								visibility: 'hidden',
							},
							traits: [],
						},
					],
				},
				{
					id: 'affiliations',
					name: 'Affiliations',
					description: 'Team configuration ratings',
					view: {
						features: {
							description: false,
							sfx: false,
							subtraits: false,
						},
						page: 1,
						style: {
							header: 'default',
							body: 'default',
						},
						ratingLadder: [4, 6, 8, 10, 12],
						multiDie: false,
						notes: '',
						reservedSlots: 3,
						place: {
							left: '0%',
							top: 0,
							width: '30%',
							height: 1,
						},
						parts: {
							name: {
								left: '0%',
								top: 0,
								width: '100%',
								height: 1,
							},
							rating: {
								left: '0%',
								top: 1,
								width: '100%',
								height: 1,
							},
						},
						pillar: 'prime',
						fixedNames: true,
					},
					noun: 'Affiliation',
					plural: 'Affiliations',
					traits: [
						{
							name: 'Solo',
							traits: [],
						},
						{
							name: 'Partner',
							traits: [],
						},
						{
							name: 'Squad',
							traits: [],
						},
					],
				},
				{
					id: 'roles',
					name: 'Roles',
					description: 'Civic investigation disciplines',
					view: {
						features: {
							description: false,
							sfx: false,
							subtraits: false,
						},
						page: 1,
						style: {
							header: 'default',
							body: 'default',
						},
						ratingLadder: [4, 6, 8, 10, 12],
						multiDie: false,
						notes: '',
						reservedSlots: 7,
						place: {
							left: '0%',
							top: 1,
							width: '30%',
							height: 1,
						},
						pillar: 'prime',
						fixedNames: true,
					},
					noun: 'Role',
					plural: 'Roles',
					traits: [
						{
							name: 'Forensics',
							traits: [],
						},
						{
							name: 'Investigation',
							traits: [],
						},
						{
							name: 'Legal',
							traits: [],
						},
						{
							name: 'Medicine',
							traits: [],
						},
						{
							name: 'Psychology',
							traits: [],
						},
						{
							name: 'Tactics',
							traits: [],
						},
						{
							name: 'Technology',
							traits: [],
						},
					],
				},
				{
					id: 'resources',
					name: 'Resources',
					description: 'Civic assets, contacts, and backup',
					view: {
						features: {
							description: false,
							sfx: false,
							subtraits: false,
						},
						page: 1,
						style: {
							header: 'default',
							body: 'default',
						},
						ratingLadder: [6, 8, 10],
						multiDie: true,
						notes: '',
						reservedSlots: 8,
						place: {
							left: '0%',
							top: 2,
							width: '30%',
							height: 1,
						},
						parts: {
							name: {
								left: '0%',
								top: 0,
								width: '82%',
								height: 1,
							},
							rating: {
								left: '82%',
								top: 0,
								width: '18%',
								height: 1,
							},
						},
						pillar: 'plus',
					},
					noun: 'Resource',
					plural: 'Resources',
					traits: [
						{
							name: '',
							rating: {
								type: 'Dice',
								value: [10, 10],
								range: [4, 6, 8, 10, 12],
							},
							spendable: true,
							hitches: 0,
							traits: [],
						},
						{
							name: '',
							rating: {
								type: 'Dice',
								value: [8, 8],
								range: [4, 6, 8, 10, 12],
							},
							spendable: true,
							hitches: 0,
							traits: [],
						},
						{
							name: '',
							rating: {
								type: 'Dice',
								value: [6, 6],
								range: [4, 6, 8, 10, 12],
							},
							spendable: true,
							hitches: 0,
							traits: [],
						},
						{
							name: '',
							rating: {
								type: 'Dice',
								value: [6, 6],
								range: [4, 6, 8, 10, 12],
							},
							spendable: true,
							hitches: 0,
							traits: [],
						},
					],
				},
				{
					id: 'distinctions',
					name: 'Distinctions',
					description: 'Defining history, drive, and complication',
					view: {
						features: {
							description: true,
							sfx: false,
							subtraits: false,
						},
						ratingLadder: [8],
						page: 1,
						multiDie: false,
						notes: "Gain a PP when you switch out your distinction's rating of d8 for a d4.",
						reservedSlots: 3,
						place: {
							left: '30%',
							top: 0,
							width: '70%',
							height: 1,
						},
						pillar: 'prime',
						altRoll: {
							die: 4,
							ppDelta: 1,
							label: 'Hinder',
						},
					},
					noun: 'Distinction',
					plural: 'Distinctions',
					traits: [
						{
							name: 'Distinction #1:',
							rating: {
								type: 'Die',
								value: [8],
								range: [4, 6, 8, 10, 12],
							},
							traits: [
								{
									name: 'Hinder',
									rating: {
										type: 'Die',
										value: [4],
										range: [4],
									},
									traits: [],
									noun: 'SFX',
									ppDelta: 1,
								},
							],
							view: {
								badge: {
									text: 'SFX',
									shape: 'vertical-bar',
									color: 'black',
								},
								prompt: true,
							},
						},
						{
							name: 'Distinction #2:',
							rating: {
								type: 'Die',
								value: [8],
								range: [4, 6, 8, 10, 12],
							},
							traits: [
								{
									name: 'Hinder',
									rating: {
										type: 'Die',
										value: [4],
										range: [4],
									},
									traits: [],
									noun: 'SFX',
									ppDelta: 1,
								},
							],
							view: {
								badge: {
									text: 'SFX',
									shape: 'vertical-bar',
									color: 'black',
								},
								prompt: true,
							},
						},
						{
							name: 'Distinction #3:',
							rating: {
								type: 'Die',
								value: [8],
								range: [4, 6, 8, 10, 12],
							},
							traits: [
								{
									name: 'Hinder',
									rating: {
										type: 'Die',
										value: [4],
										range: [4],
									},
									traits: [],
									noun: 'SFX',
									ppDelta: 1,
								},
							],
							view: {
								badge: {
									text: 'SFX',
									shape: 'vertical-bar',
									color: 'black',
								},
								prompt: true,
							},
						},
					],
				},
				{
					id: 'talents',
					name: 'Talents',
					description: 'Training tricks and case-cracking knacks',
					view: {
						features: {
							description: true,
							sfx: false,
							subtraits: false,
						},
						page: 1,
						style: {
							header: 'default',
							body: 'default',
						},
						ratingLadder: [],
						multiDie: false,
						notes: '',
						reservedSlots: 6,
						place: {
							left: '30%',
							top: 1,
							width: '70%',
							height: 1,
						},
						pillar: 'plus',
					},
					noun: 'Talent',
					plural: 'Talents',
					traits: [
						{
							name: 'Talent #1:',
							traits: [],
							view: {
								prompt: true,
							},
						},
						{
							name: 'Talent #2:',
							traits: [],
							view: {
								prompt: true,
							},
						},
						{
							name: 'Talent #3:',
							traits: [],
							view: {
								prompt: true,
							},
						},
						{
							name: 'Talent #4:',
							traits: [],
							view: {
								prompt: true,
							},
						},
						{
							name: 'Talent #5:',
							traits: [],
							view: {
								prompt: true,
							},
						},
						{
							name: 'Talent #6:',
							traits: [],
							view: {
								prompt: true,
							},
						},
					],
				},
				{
					id: 'stress',
					name: 'Stress',
					description: 'Emotional and physical pressure tracks',
					view: {
						features: {
							description: false,
							sfx: false,
							subtraits: false,
						},
						page: 1,
						style: {
							header: 'default',
							body: 'die-track',
						},
						multiDie: false,
						notes: '',
						reservedSlots: 5,
						ratingLadder: [4, 6, 8, 10, 12],
						place: {
							left: '30%',
							top: 2,
							width: '50%',
							height: 1,
						},
						pillar: 'play',
					},
					noun: 'Stress',
					plural: 'Stress',
					traits: [
						{
							name: 'Afraid',
							traits: [],
						},
						{
							name: 'Angry',
							traits: [],
						},
						{
							name: 'Anxious',
							traits: [],
						},
						{
							name: 'Exhausted',
							traits: [],
						},
						{
							name: 'Injured',
							traits: [],
						},
					],
				},
				{
					id: 'growth-pool',
					name: 'Growth Pool',
					description: 'Base d6 d6',
					view: {
						header: 'top',
						headerAlign: 'center',
						features: {
							description: false,
							sfx: false,
							subtraits: false,
						},
						page: 1,
						style: {
							header: 'default',
							body: 'dice-count',
						},
						ratingLadder: [4, 6, 8, 10, 12],
						multiDie: true,
						reservedSlots: 5,
						place: {
							left: '80%',
							top: 2,
							width: '20%',
							height: 1,
						},
						labels: {
							rating: 'RATING',
							dice: '/ DICE',
						},
						pillar: 'play',
					},
					pool: true,
					noun: 'Growth Die',
					plural: 'Growth Dice',
					traits: [
						{
							name: 'D4',
							rating: {
								type: 'Die',
								value: [4],
								range: [4, 6, 8, 10, 12],
							},
							spendable: true,
							hitches: 0,
							view: {
								poolCount: 0,
							},
							traits: [],
						},
						{
							name: 'D6',
							rating: {
								type: 'Die',
								value: [6],
								range: [4, 6, 8, 10, 12],
							},
							spendable: true,
							hitches: 0,
							view: {
								poolCount: 2,
							},
							traits: [],
						},
						{
							name: 'D8',
							rating: {
								type: 'Die',
								value: [8],
								range: [4, 6, 8, 10, 12],
							},
							spendable: true,
							hitches: 0,
							view: {
								poolCount: 0,
							},
							traits: [],
						},
						{
							name: 'D10',
							rating: {
								type: 'Die',
								value: [10],
								range: [4, 6, 8, 10, 12],
							},
							spendable: true,
							hitches: 0,
							view: {
								poolCount: 0,
							},
							traits: [],
						},
						{
							name: 'D12',
							rating: {
								type: 'Die',
								value: [12],
								range: [4, 6, 8, 10, 12],
							},
							spendable: true,
							hitches: 0,
							view: {
								poolCount: 0,
							},
							traits: [],
						},
					],
				},
			],
		},
	},
	{
		id: 'kitchen-sink',
		version: 1,
		updatedAt: '2026-10-14T12:00:00.000Z',
		character: {
			$schema: '../schema/0.1/character.schema.json',
			version: '0.1',
			id: '00000000-0000-4000-8000-000000000001',
			isTemplate: true,
			dateCreated: '2026-10-14T12:00:00.000Z',
			dateModified: '2026-10-14T12:00:00.000Z',
			dateTouched: '2026-10-14T12:00:00.000Z',
			name: 'Kitchen Sink Showcase',
			player: 'Style Audit',
			game: 'Showcase',
			pronouns: 'They / Them',
			description:
				'Visual regression and layout showcase exercising every trait set style, header orientation, die rating (d4-d12), pool, subtrait branch, and track.',
			plotPoints: 3,
			notes: '### Sheet Notes\nSupports **bold**, *italics*, `code`, die glyphs like d4 d6 d8 d10 d12, and PP tokens.',
			tags: ['showcase', 'kitchen-sink'],
			portrait: {
				url: '',
				alt: 'Character Portrait',
				view: {
					alignment: 'center-center',
					location: 'header',
				},
			},
			view: {
				nickname: 'The Everything Sheet',
				pageCount: 3,
				columnAlignment: 'top-base',
				columnOffsets: {
					left: 0,
					center: 0,
					right: 0,
				},
				primaryColor: '#b45309',
				accentColor: '#f59e0b',
				secondaryColor: '#fef3c7',
				diceConfig: {
					style: 'custom',
					backgroundType: 'gradient',
					backgroundColor1: '#10b981',
					backgroundColor2: '#047857',
					gradientAngle: 135,
					numeralColor: '#ffffff',
					borderColor: '#059669',
					borderWidth: 1.6,
					unfilledBackground: 'none',
					unfilledNumeral: '#059669',
					unfilledBorder: '#059669',
					name: 'Forest',
				},
				theme: {
					fonts: {
						heading: 'Alegreya Sans SC',
					},
				},
				customFonts: [
					{
						name: 'Curio Display SC',
						url: 'https://characters.lynnjones.rocks/fonts/alegreya-sans-sc-normal-700-latin.woff2',
					},
				],
				listing: {
					title: 'Kitchen Sink Style Showcase',
					subtitle: 'All 17 Trait Set Styles & Features',
					genre: 'Reference',
				},
			},
			traitSets: [
				{
					id: 'name',
					name: 'Name',
					view: {
						style: {
							header: 'default',
							body: 'name',
						},
						page: 1,
					},
					traits: [
						{
							name: 'name',
							label: 'Name',
							traits: [],
						},
						{
							name: 'player',
							label: 'Player',
							traits: [],
						},
						{
							name: 'nickname',
							label: 'Nickname',
							traits: [],
						},
						{
							name: 'pronouns',
							label: 'Pronouns',
							traits: [],
						},
						{
							name: 'description',
							label: 'Description',
							traits: [],
						},
						{
							name: 'game',
							label: 'Game',
							view: {
								visibility: 'hidden',
							},
							traits: [],
						},
						{
							name: 'portrait',
							traits: [],
						},
						{
							name: 'caption',
							traits: [],
						},
						{
							name: 'plotPoints',
							rating: {
								type: 'Counter',
								value: [3],
								range: [0, 20],
							},
							label: 'PP',
							spendable: true,
							view: {
								visibility: 'hidden',
							},
							traits: [],
						},
						{
							name: 'notes',
							view: {
								visibility: 'hidden',
							},
							traits: [],
						},
					],
				},
				{
					id: 'ks-distinctions',
					name: 'Distinctions',
					view: {
						page: 1,
						features: {
							description: true,
							sfx: true,
							subtraits: false,
						},
						reservedSlots: 3,
						ratingLadder: [8],
						place: {
							left: '0%',
							top: 0,
							width: '50%',
							height: 1,
						},
						parts: {
							name: {
								left: '0%',
								top: 0,
								width: '72%',
								height: 1,
							},
							rating: {
								left: '72%',
								top: 0,
								width: '28%',
								height: 1,
							},
							description: {
								left: '0%',
								top: 1,
								width: '100%',
								height: 1,
							},
							block: {
								left: '0%',
								top: 3,
								width: '100%',
								height: 1,
							},
							badge: {
								left: '0%',
								top: 2,
								width: '100%',
								height: 1,
							},
						},
						pillar: 'prime',
						altRoll: {
							die: 4,
							ppDelta: 1,
							label: 'Hinder',
						},
					},
					noun: 'Distinction',
					plural: 'Distinctions',
					traits: [
						{
							name: 'Walking Style Guide',
							rating: {
								type: 'Die',
								value: [8],
								range: [4, 6, 8, 10, 12],
							},
							description: 'Every layout edge case deserves a test.',
							traits: [
								{
									name: 'Hinder',
									rating: {
										type: 'Die',
										value: [4],
										range: [4],
									},
									traits: [],
									noun: 'SFX',
									ppDelta: 1,
								},
								{
									name: 'Pixel Parity',
									description:
										'Spend 1 PP to step up or double a die when testing visual alignment against a reference PDF.',
									traits: [],
									noun: 'SFX',
								},
							],
							view: {
								badge: {
									text: 'SFX',
									shape: 'vertical-bar',
									color: 'black',
								},
							},
						},
						{
							name: '',
							rating: {
								type: 'Die',
								value: [8],
								range: [4, 6, 8, 10, 12],
							},
							traits: [
								{
									name: 'Hinder',
									rating: {
										type: 'Die',
										value: [4],
										range: [4],
									},
									traits: [],
									noun: 'SFX',
									ppDelta: 1,
								},
							],
							view: {
								badge: {
									text: 'SFX',
									shape: 'vertical-bar',
									color: 'black',
								},
							},
						},
						{
							name: '',
							rating: {
								type: 'Die',
								value: [8],
								range: [4, 6, 8, 10, 12],
							},
							traits: [
								{
									name: 'Hinder',
									rating: {
										type: 'Die',
										value: [4],
										range: [4],
									},
									traits: [],
									noun: 'SFX',
									ppDelta: 1,
								},
							],
							view: {
								badge: {
									text: 'SFX',
									shape: 'vertical-bar',
									color: 'black',
								},
							},
						},
					],
				},
				{
					id: 'ks-values-statements',
					name: 'Values',
					statement: true,
					hasQuestionedPip: true,
					view: {
						page: 1,
						style: {
							header: 'default',
							body: 'default',
						},
						features: {
							description: true,
							sfx: false,
							subtraits: false,
						},
						ratingLadder: [4, 6, 8, 10, 12],
						place: {
							left: '50%',
							top: 0,
							width: '50%',
							height: 1,
						},
						parts: {
							name: {
								left: '0%',
								top: 0,
								width: '70%',
								height: 1,
							},
							rating: {
								left: '70%',
								top: 0,
								width: '30%',
								height: 1,
							},
						},
						pillar: 'prime',
						fixedNames: true,
					},
					noun: 'Value',
					plural: 'Values',
					traits: [
						{
							name: 'Craft',
							rating: {
								type: 'Die',
								value: [10],
								range: [4, 6, 8, 10, 12],
							},
							description: 'Form and function are inseparable.',
							traits: [
								{
									name: 'Form and function are inseparable.',
									rating: {
										type: 'Pip',
										value: [false],
									},
									traits: [],
									noun: 'Statement',
								},
							],
						},
						{
							name: 'Speed',
							rating: {
								type: 'Die',
								value: [8],
								range: [4, 6, 8, 10, 12],
							},
							description: 'Ship early, refine relentlessly.',
							traits: [
								{
									name: 'Ship early, refine relentlessly.',
									rating: {
										type: 'Pip',
										value: [true],
									},
									traits: [],
									noun: 'Statement',
								},
							],
						},
						{
							name: 'Clarity',
							rating: {
								type: 'Die',
								value: [6],
								range: [4, 6, 8, 10, 12],
							},
							traits: [],
						},
					],
				},
				{
					id: 'ks-subtrait-columns',
					name: 'Skills',
					view: {
						page: 1,
						style: {
							header: 'default',
							body: 'subtrait-columns',
						},
						features: {
							description: false,
							sfx: false,
							subtraits: true,
						},
						labels: {
							left: 'SKILL',
							right: 'SPECIALTIES',
						},
						place: {
							left: '0%',
							top: 1,
							width: '50%',
							height: 1,
						},
						pillar: 'prime',
						fixedNames: true,
					},
					noun: 'Skill',
					plural: 'Skills',
					traits: [
						{
							name: 'Engineering',
							rating: {
								type: 'Die',
								value: [10],
								range: [4, 6, 8, 10, 12],
							},
							traits: [
								{
									name: 'Clockwork',
									rating: {
										type: 'Die',
										value: [8],
										range: [4, 6, 8, 10, 12],
									},
									traits: [],
								},
								{
									name: 'Aetherics',
									rating: {
										type: 'Die',
										value: [6],
										range: [4, 6, 8, 10, 12],
									},
									traits: [],
								},
							],
						},
						{
							name: 'Navigation',
							rating: {
								type: 'Die',
								value: [8],
								range: [4, 6, 8, 10, 12],
							},
							traits: [
								{
									name: 'Star Charts',
									rating: {
										type: 'Die',
										value: [6],
										range: [4, 6, 8, 10, 12],
									},
									traits: [],
								},
							],
						},
						{
							name: 'Diplomacy',
							rating: {
								type: 'Die',
								value: [6],
								range: [4, 6, 8, 10, 12],
							},
							traits: [],
						},
					],
				},
				{
					id: 'ks-paired-slots',
					name: 'Standing',
					statement: true,
					view: {
						page: 1,
						features: {
							description: true,
							sfx: false,
							subtraits: true,
						},
						labels: {
							slot0: 'COMPLICATION',
							slot1: 'BONUS',
						},
						ratingLadder: [6, 8, 10, 12],
						subtraitRatingLadder: [6, 8, 10, 12],
						place: {
							left: '50%',
							top: 1,
							width: '50%',
							height: 1,
						},
						reservedSlots: 2,
						pillar: 'plus',
						parts: {
							name: {
								left: '0%',
								top: 0,
								width: '50%',
								height: 1,
							},
							'child:Statement': {
								left: '50%',
								top: 0,
								width: '50%',
								height: 1,
							},
						},
					},
					noun: 'Standing',
					plural: 'Standings',
					traits: [
						{
							name: 'The Guild',
							rating: {
								type: 'Die',
								value: [8],
								range: [4, 6, 8, 10, 12],
							},
							description: 'They owe me a drydock bay.',
							traits: [
								{
									name: 'Complication',
									rating: {
										type: 'Die',
										value: [6],
										range: [4, 6, 8, 10, 12],
									},
									traits: [],
								},
								{
									name: 'Bonus',
									rating: {
										type: 'Die',
										value: [8],
										range: [4, 6, 8, 10, 12],
									},
									traits: [],
								},
								{
									name: 'They owe me a drydock bay.',
									rating: {
										type: 'Pip',
										value: [false],
									},
									traits: [],
									noun: 'Statement',
								},
							],
						},
					],
				},
				{
					id: 'ks-die-rows',
					name: 'Badges',
					counterLabel: 'XP',
					view: {
						page: 1,
						header: 'top',
						headerAlign: 'left',
						style: {
							header: 'default',
							body: 'die-rows',
						},
						features: {
							description: false,
							sfx: false,
							subtraits: false,
						},
						ratingLadder: [6, 8, 10, 12],
						reservedSlots: 3,
						cluster: 'badges-resources',
						place: {
							left: '0%',
							top: 2,
							width: '50%',
							height: 1,
						},
						pillar: 'plus',
					},
					noun: 'Badge',
					plural: 'Badges',
					traits: [
						{
							name: 'First Responder',
							rating: {
								type: 'Die',
								value: [8],
								range: [4, 6, 8, 10, 12],
							},
							xp: 3,
							traits: [],
						},
						{
							name: 'Trailblazer',
							rating: {
								type: 'Die',
								value: [6],
								range: [4, 6, 8, 10, 12],
							},
							xp: 1,
							traits: [],
						},
					],
				},
				{
					id: 'ks-three-col-table',
					name: 'Talents',
					view: {
						page: 1,
						features: {
							description: true,
							sfx: true,
							subtraits: false,
						},
						labels: {
							col1: 'TALENT',
							col2: 'ACTIVATION',
							col3: 'EFFECT',
						},
						reservedSlots: 2,
						place: {
							left: '50%',
							top: 2,
							width: '50%',
							height: 1,
						},
						pillar: 'plus',
						parts: {
							name: {
								left: '0%',
								top: 0,
								width: '28%',
								height: 1,
							},
							description: {
								left: '28%',
								top: 0,
								width: '33%',
								height: 1,
							},
							'child:SFX': {
								left: '61%',
								top: 0,
								width: '39%',
								height: 1,
							},
						},
					},
					noun: 'Talent',
					plural: 'Talents',
					traits: [
						{
							name: 'Overclock',
							description: 'Spend 1 PP when rolling Engineering.',
							traits: [
								{
									name: 'Effect',
									description: 'Step up your Effect die by one step for the scene.',
									traits: [],
									noun: 'SFX',
								},
							],
							view: {
								badge: {
									text: 'SFX',
									shape: 'vertical-bar',
									color: 'black',
								},
							},
						},
					],
				},
				{
					id: 'ks-dice-count',
					name: 'Resources',
					view: {
						page: 1,
						style: {
							header: 'default',
							body: 'dice-count',
						},
						features: {
							description: false,
							sfx: false,
							subtraits: false,
						},
						multiDie: true,
						labels: {
							rating: 'RATING',
							dice: '/ DICE',
						},
						cluster: 'badges-resources',
						place: {
							left: '0%',
							top: 3,
							width: '50%',
							height: 1,
						},
						pillar: 'plus',
					},
					noun: 'Resource',
					plural: 'Resources',
					traits: [
						{
							name: 'Salvage Cache',
							rating: {
								type: 'Dice',
								value: [8, 8, 8],
								range: [4, 6, 8, 10, 12],
							},
							spendable: true,
							hitches: 0,
							traits: [],
						},
						{
							name: 'Contacts',
							rating: {
								type: 'Dice',
								value: [6, 6],
								range: [4, 6, 8, 10, 12],
							},
							spendable: true,
							hitches: 0,
							traits: [],
						},
					],
				},
				{
					id: 'ks-stress',
					name: 'Stress',
					view: {
						page: 1,
						style: {
							header: 'default',
							body: 'die-track',
						},
						features: {
							description: false,
							sfx: false,
							subtraits: false,
						},
						outIndicator: true,
						ratingLadder: [6, 8, 10, 12],
						place: {
							left: '50%',
							top: 3,
							width: '50%',
							height: 1,
						},
						pillar: 'play',
					},
					noun: 'Stress',
					plural: 'Stress',
					traits: [
						{
							name: 'Physical',
							rating: {
								type: 'Die',
								value: [8],
								range: [4, 6, 8, 10, 12],
							},
							traits: [],
						},
						{
							name: 'Mental',
							traits: [],
						},
						{
							name: 'Social',
							rating: {
								type: 'Die',
								value: [12],
								range: [4, 6, 8, 10, 12],
							},
							traits: [],
						},
					],
				},
				{
					id: 'ks-dice-ladder',
					name: 'Growth Ladder',
					view: {
						ladder: true,
						page: 2,
						style: {
							header: 'default',
							body: 'die-rows',
						},
						features: {
							description: false,
							sfx: false,
							subtraits: false,
						},
						place: {
							left: '0%',
							top: 0,
							width: '50%',
							height: 1,
						},
						pillar: 'play',
					},
					noun: 'Rung',
					plural: 'Rungs',
					traits: [
						{
							name: 'Novice',
							rating: {
								type: 'Die',
								value: [6],
								range: [4, 6, 8, 10, 12],
							},
							traits: [],
						},
						{
							name: 'Adept',
							rating: {
								type: 'Die',
								value: [8],
								range: [4, 6, 8, 10, 12],
							},
							traits: [],
						},
						{
							name: 'Master',
							rating: {
								type: 'Die',
								value: [10],
								range: [4, 6, 8, 10, 12],
							},
							traits: [],
						},
					],
				},
				{
					id: 'ks-labeled-fields',
					name: 'Dossier',
					view: {
						page: 2,
						header: 'top',
						border: {
							color: 'primary',
							shape: 'line',
							stroke: '1.5px',
						},
						features: {
							description: true,
							sfx: false,
							subtraits: false,
						},
						place: {
							left: '50%',
							top: 0,
							width: '50%',
							height: 1,
						},
						pillar: 'plus',
						parts: {
							name: {
								left: '0%',
								top: 0,
								width: '100%',
								height: 1,
							},
							description: {
								left: '0%',
								top: 1,
								width: '100%',
								height: 1,
							},
						},
					},
					noun: 'Field',
					plural: 'Fields',
					traits: [
						{
							name: 'Origin',
							description: 'Outer Rim Shipyard #4',
							traits: [],
						},
						{
							name: 'Drive',
							description: 'Restore the lost fleet',
							traits: [],
						},
						{
							name: 'Quirk',
							traits: [],
						},
					],
				},
				{
					id: 'ks-pips',
					name: 'Progress Track',
					view: {
						page: 2,
						style: {
							header: 'default',
							body: 'pips',
						},
						pips: {
							perRow: 5,
							connected: true,
						},
						place: {
							left: '0%',
							top: 1,
							width: '50%',
							height: 1,
						},
						pillar: 'play',
					},
					rating: {
						type: 'Pip',
						value: [true, true, true, true, false, false, false, false, false, false],
					},
					noun: 'Pip',
					plural: 'Pips',
					traits: [],
				},
				{
					id: 'ks-session-record',
					name: 'Session Record',
					view: {
						page: 2,
						style: {
							header: 'default',
							body: 'pips',
						},
						place: {
							left: '50%',
							top: 1,
							width: '50%',
							height: 1,
						},
						reservedSlots: 3,
						pips: {
							labels: true,
							perRow: 1,
						},
						pillar: 'play',
					},
					rating: {
						type: 'Pip',
						value: [false, false, false],
					},
					noun: 'Session',
					plural: 'Sessions',
					traits: [
						{
							name: 'Session 1: The Awakening',
							rating: {
								type: 'Die',
								value: [6],
								range: [4, 6, 8, 10, 12],
							},
							traits: [],
						},
						{
							name: 'Session 2: Crossing the Threshold',
							traits: [],
						},
					],
				},
				{
					id: 'ks-two-col-compact',
					name: 'Roles (Compact Two-Column)',
					view: {
						page: 2,
						border: 'none',
						style: {
							header: 'two-columns-compact',
							body: 'two-columns-compact',
						},
						features: {
							description: false,
							sfx: false,
							subtraits: false,
						},
						place: {
							left: '0%',
							top: 2,
							width: '50%',
							height: 1,
						},
						pillar: 'prime',
						fixedNames: true,
					},
					noun: 'Role',
					plural: 'Roles',
					traits: [
						{
							name: 'Tactician',
							rating: {
								type: 'Die',
								value: [8],
								range: [4, 6, 8, 10, 12],
							},
							traits: [],
						},
						{
							name: 'Outrider',
							rating: {
								type: 'Die',
								value: [6],
								range: [4, 6, 8, 10, 12],
							},
							traits: [],
						},
						{
							name: 'Scholar',
							rating: {
								type: 'Die',
								value: [10],
								range: [4, 6, 8, 10, 12],
							},
							traits: [],
						},
						{
							name: 'Sentinel',
							rating: {
								type: 'Die',
								value: [4],
								range: [4, 6, 8, 10, 12],
							},
							traits: [],
						},
					],
				},
				{
					id: 'ks-notes',
					name: 'Notes',
					view: {
						page: 2,
						border: 'none',
						place: {
							left: '50%',
							top: 2,
							width: '50%',
							height: 1,
						},
						pillar: 'play',
						notesMarkdown: true,
						parts: {
							description: {
								left: '0%',
								top: 0,
								width: '100%',
								height: 1,
							},
						},
					},
					noun: 'Note',
					plural: 'Notes',
					traits: [
						{
							name: '',
							description:
								'### Gear & Inventory\n- **Chrono-Compass** (d8): Points toward temporal anomalies.\n- **Reserve Cells**: Spend 1 PP to recharge.\n> *"Never fly without a backup spanner."*',
							traits: [],
						},
					],
				},
				{
					id: 'ks-detailed-columns',
					name: 'Detailed Columns',
					view: {
						page: 3,
						style: {
							header: 'default',
							body: 'two-columns-detailed',
						},
						features: {
							description: true,
							sfx: false,
							subtraits: false,
						},
						place: {
							left: '0%',
							top: 0,
							width: '50%',
							height: 1,
						},
						pillar: 'plus',
					},
					noun: 'Entry',
					plural: 'Entries',
					traits: [
						{
							name: 'Alpha',
							rating: {
								type: 'Die',
								value: [8],
								range: [4, 6, 8, 10, 12],
							},
							description: 'First detailed entry.',
							traits: [],
						},
						{
							name: 'Beta',
							rating: {
								type: 'Die',
								value: [6],
								range: [4, 6, 8, 10, 12],
							},
							description: 'Second detailed entry.',
							traits: [],
						},
						{
							name: 'Gamma',
							rating: {
								type: 'Die',
								value: [10],
								range: [4, 6, 8, 10, 12],
							},
							description: 'Third detailed entry.',
							traits: [],
						},
						{
							name: 'Delta',
							rating: {
								type: 'Die',
								value: [8],
								range: [4, 6, 8, 10, 12],
							},
							description: 'Fourth detailed entry.',
							traits: [],
						},
					],
				},
				{
					id: 'ks-resource-pool',
					name: 'Crisis Pools',
					view: {
						page: 3,
						style: {
							header: 'pool-rows',
							body: 'pool-rows',
						},
						features: {
							description: false,
							sfx: false,
							subtraits: false,
						},
						place: {
							left: '50%',
							top: 0,
							width: '50%',
							height: 1,
						},
						pillar: 'plus',
					},
					noun: 'Pool',
					plural: 'Pools',
					pool: true,
					rating: {
						type: 'Dice',
						value: [],
					},
					traits: [
						{
							name: 'Hull Breach',
							rating: {
								type: 'Dice',
								value: [10, 8, 8],
								range: [4, 6, 8, 10, 12],
							},
							traits: [],
						},
						{
							name: 'Security Sweep',
							rating: {
								type: 'Dice',
								value: [8, 6, 6],
								range: [4, 6, 8, 10, 12],
							},
							traits: [],
						},
						{
							name: 'Failing Telemetry',
							rating: {
								type: 'Dice',
								value: [6, 6],
								range: [4, 6, 8, 10, 12],
							},
							traits: [],
						},
					],
				},
				{
					id: 'ks-assets',
					name: 'Signature Assets',
					view: {
						page: 3,
						features: {
							description: false,
							sfx: false,
							subtraits: true,
						},
						place: {
							left: '0%',
							top: 1,
							width: '50%',
							height: 1,
						},
						pillar: 'plus',
						border: {
							color: 'primary',
							shape: 'block',
							stroke: '2px',
						},
					},
					noun: 'Asset',
					plural: 'Assets',
					traits: [
						{
							name: 'Plasma Rifle',
							rating: {
								type: 'Die',
								value: [8],
								range: [4, 6, 8, 10, 12],
							},
							traits: [
								{
									name: 'Ammo',
									rating: {
										type: 'Die',
										value: [6],
										range: [4, 6, 8, 10, 12],
									},
									traits: [],
								},
							],
						},
						{
							name: 'Survey Kit',
							rating: {
								type: 'Die',
								value: [6],
								range: [4, 6, 8, 10, 12],
							},
							traits: [],
						},
						{
							name: 'Encrypted Comms',
							rating: {
								type: 'Die',
								value: [8],
								range: [4, 6, 8, 10, 12],
							},
							traits: [],
						},
					],
				},
				{
					id: 'ks-list',
					name: 'Simple List',
					view: {
						page: 3,
						style: {
							header: 'list',
							body: 'list',
						},
						features: {
							description: false,
							sfx: false,
							subtraits: false,
						},
						place: {
							left: '50%',
							top: 1,
							width: '50%',
							height: 1,
						},
						pillar: 'plus',
					},
					noun: 'Item',
					plural: 'Items',
					traits: [
						{
							name: 'Item One',
							rating: {
								type: 'Die',
								value: [8],
								range: [4, 6, 8, 10, 12],
							},
							traits: [],
						},
						{
							name: 'Item Two',
							rating: {
								type: 'Die',
								value: [6],
								range: [4, 6, 8, 10, 12],
							},
							traits: [],
						},
						{
							name: 'Item Three',
							rating: {
								type: 'Die',
								value: [8],
								range: [4, 6, 8, 10, 12],
							},
							traits: [],
						},
					],
				},
				{
					id: 'ks-image',
					name: 'Image Set',
					view: {
						page: 3,
						style: {
							header: 'default',
							body: 'image',
						},
						features: {
							description: false,
							sfx: false,
							subtraits: false,
						},
						imageConfig: {
							url: 'images/250px-De_bouwmeester__1919__Rijksmuseum_SK-A-4746.jpeg',
							height: '180px',
							width: '100%',
							zoom: 1.2,
							alignment: '95% 60%',
							caption: 'The House of the Architect',
						},
						place: {
							left: '0%',
							top: 2,
							width: '100%',
							height: 1,
						},
						pillar: 'plus',
					},
					noun: 'Image',
					plural: 'Images',
					traits: [],
				},
				{
					id: 'ks-portrait-cut',
					name: 'Cut Portrait',
					view: {
						page: 3,
						header: 'top',
						headerAlign: 'center',
						border: 'none',
						frame: {
							array: 'none',
							color: 'primary',
							image: {
								alignment: 'top-center',
								url: 'images/250px-Corot_-_The_Dreamer_at_the_Fountain__1855_63.jpg',
								zoom: 1,
							},
							position: 'center',
							shape: 'cut',
							size: 116,
							span: [0, 360],
							stroke: '2px',
						},
						place: {
							left: '0%',
							top: 3,
							width: '50%',
							height: 1,
						},
						pillar: 'plus',
					},
					noun: 'Portrait',
					plural: 'Portraits',
					traits: [],
				},
				{
					id: 'ks-portrait-round',
					name: 'Round Portrait',
					view: {
						page: 3,
						header: 'top',
						headerAlign: 'center',
						border: 'none',
						frame: {
							array: 'none',
							color: 'accent',
							image: {
								alignment: 'top-center',
								url: 'images/250px-Corot_-_The_Dreamer_at_the_Fountain__1855_63.jpg',
								zoom: 1.15,
							},
							position: 'center',
							shape: 'round',
							size: 116,
							span: [0, 360],
							stroke: '2px',
						},
						place: {
							left: '50%',
							top: 3,
							width: '50%',
							height: 1,
						},
						pillar: 'plus',
					},
					noun: 'Portrait',
					plural: 'Portraits',
					traits: [],
				},
				{
					id: 'ks-ring-array',
					name: 'Ring Array',
					view: {
						page: 3,
						header: 'top',
						headerAlign: 'center',
						border: 'none',
						frame: {
							array: 'ring',
							color: 'primary',
							image: {
								alignment: 'top-center',
								url: 'images/250px-Corot_-_The_Dreamer_at_the_Fountain__1855_63.jpg',
								zoom: 1.15,
							},
							ring: {
								arcAngle: -30,
							},
							shape: 'circle',
							size: 116,
							span: [0, 360],
							stroke: '2px',
						},
						place: {
							left: '0%',
							top: 4,
							width: '50%',
							height: 1,
						},
						pillar: 'prime',
					},
					noun: 'Trait',
					plural: 'Traits',
					rating: {
						type: 'Die',
						value: [],
						range: [4, 6, 8, 10, 12],
					},
					traits: [
						{
							name: 'Court',
							rating: {
								type: 'Die',
								value: [8],
								range: [4, 6, 8, 10, 12],
							},
							traits: [],
						},
						{
							name: 'Commons',
							rating: {
								type: 'Die',
								value: [10],
								range: [4, 6, 8, 10, 12],
							},
							traits: [],
						},
						{
							name: 'Church',
							rating: {
								type: 'Die',
								value: [12],
								range: [4, 6, 8, 10, 12],
							},
							traits: [],
						},
					],
				},
				{
					id: 'ks-arc-array',
					name: 'Arc Array',
					view: {
						page: 3,
						header: 'top',
						headerAlign: 'center',
						border: 'none',
						ringNoun: 'Array Die',
						frame: {
							array: 'arc',
							color: 'accent',
							image: {
								alignment: 'top-center',
								url: 'images/250px-De_bouwmeester__1919__Rijksmuseum_SK-A-4746.jpeg',
								zoom: 1,
							},
							shape: 'circle',
							size: 116,
							span: [0, 360],
							stroke: '2px',
							traitsSpan: [45, 135],
						},
						place: {
							left: '50%',
							top: 4,
							width: '50%',
							height: 1,
						},
						pillar: 'prime',
					},
					noun: 'Array Die',
					plural: 'Array Dice',
					rating: {
						type: 'Dice',
						value: [10, 10, 10],
						range: [4, 6, 8, 10, 12],
					},
					traits: [],
				},
			],
		},
	},
	{
		id: 'landscape-showcase',
		version: 1,
		character: {
			$schema: '../schema/0.1/character.schema.json',
			version: '0.1',
			id: 'template-landscape-showcase',
			isTemplate: true,
			name: 'Landscape Showcase',
			game: 'Showcase',
			description:
				'Visual layout showcase exercising 3-column landscape layout and column spanning across 1, 2, and 3 columns.',
			pronouns: '',
			plotPoints: 1,
			notes: '',
			portrait: {
				url: '',
				view: {
					location: 'header',
				},
			},
			player: 'Layout Reference',
			tags: ['showcase', 'landscape'],
			view: {
				nickname: 'The Panorama Sheet',
				pageOrientation: 'landscape',
				pageCount: 2,
				columnAlignment: 'top-base',
				columnOffsets: {
					left: 0,
					center: 0,
					right: 0,
				},
				listing: {
					title: 'Landscape Style Showcase',
					subtitle: '3-Column Landscape Layout & Spanning Showcase',
					genre: 'Reference',
				},
			},
			traitSets: [
				{
					id: 'name',
					name: 'Name',
					view: {
						style: {
							header: 'default',
							body: 'name',
						},
						page: 1,
					},
					traits: [
						{
							name: 'name',
							label: 'Name',
							traits: [],
						},
						{
							name: 'player',
							label: 'Player',
							traits: [],
						},
						{
							name: 'nickname',
							label: 'Nickname',
							traits: [],
						},
						{
							name: 'pronouns',
							label: 'Pronouns',
							traits: [],
						},
						{
							name: 'description',
							label: 'Description',
							traits: [],
						},
						{
							name: 'game',
							label: 'Game',
							view: {
								visibility: 'hidden',
							},
							traits: [],
						},
						{
							name: 'portrait',
							traits: [],
						},
						{
							name: 'caption',
							traits: [],
						},
						{
							name: 'plotPoints',
							rating: {
								type: 'Counter',
								value: [1],
								range: [0, 20],
							},
							label: 'PP',
							spendable: true,
							view: {
								visibility: 'hidden',
							},
							traits: [],
						},
						{
							name: 'notes',
							view: {
								visibility: 'hidden',
							},
							traits: [],
						},
					],
				},
				{
					id: 'ls-roles',
					name: 'Roles & Masteries',
					view: {
						page: 1,
						style: {
							header: 'default',
							body: 'default',
						},
						traitColumns: 3,
						features: {
							description: true,
							sfx: true,
							subtraits: false,
						},
						header: 'top',
						headerAlign: 'center',
						pillar: 'prime',
						fixedNames: true,
					},
					noun: 'Role',
					plural: 'Roles',
					traits: [
						{
							name: 'Commander',
							rating: {
								type: 'Die',
								value: [8],
								range: [4, 6, 8, 10, 12],
							},
							description: 'Direct allies and coordinate tactical movement.',
							traits: [
								{
									name: 'Lead from the Front',
									description: "Spend 1 PP to step up an ally's die when acting on your order.",
									traits: [],
									noun: 'SFX',
								},
							],
							view: {
								badge: {
									text: 'SFX',
									shape: 'vertical-bar',
									color: 'black',
								},
							},
						},
						{
							name: 'Infiltrator',
							rating: {
								type: 'Die',
								value: [8],
								range: [4, 6, 8, 10, 12],
							},
							description: 'Bypass security systems and move undetected.',
							traits: [
								{
									name: 'Ghost Protocol',
									description: 'Spend 1 PP to borrow a die from the challenge pool for stealth.',
									traits: [],
									noun: 'SFX',
								},
							],
							view: {
								badge: {
									text: 'SFX',
									shape: 'vertical-bar',
									color: 'black',
								},
							},
						},
						{
							name: 'Specialist',
							rating: {
								type: 'Die',
								value: [8],
								range: [4, 6, 8, 10, 12],
							},
							description: 'Analyze technical anomalies and reverse-engineer artifacts.',
							traits: [
								{
									name: 'Tactical Insight',
									description: 'Spend 1 PP to reroll a die when analyzing enemy technology.',
									traits: [],
									noun: 'SFX',
								},
							],
							view: {
								badge: {
									text: 'SFX',
									shape: 'vertical-bar',
									color: 'black',
								},
							},
						},
					],
				},
				{
					id: 'ls-skills',
					name: 'Skills & Specialties',
					view: {
						page: 1,
						style: {
							header: 'default',
							body: 'subtrait-columns',
						},
						features: {
							description: false,
							sfx: false,
							subtraits: true,
						},
						place: {
							left: '0%',
							top: 1,
							width: '66.666%',
							height: 1,
						},
						labels: {
							left: 'SKILL',
							right: 'SPECIALTIES',
						},
						pillar: 'prime',
						fixedNames: true,
					},
					noun: 'Skill',
					plural: 'Skills',
					traits: [
						{
							name: 'Engineering',
							rating: {
								type: 'Die',
								value: [8],
								range: [4, 6, 8, 10, 12],
							},
							traits: [
								{
									name: 'Clockwork',
									rating: {
										type: 'Die',
										value: [8],
										range: [4, 6, 8, 10, 12],
									},
									traits: [],
								},
								{
									name: 'Aetherics',
									rating: {
										type: 'Die',
										value: [10],
										range: [4, 6, 8, 10, 12],
									},
									traits: [],
								},
							],
						},
						{
							name: 'Navigation',
							rating: {
								type: 'Die',
								value: [8],
								range: [4, 6, 8, 10, 12],
							},
							traits: [
								{
									name: 'Star Charts',
									rating: {
										type: 'Die',
										value: [8],
										range: [4, 6, 8, 10, 12],
									},
									traits: [],
								},
								{
									name: 'Sub-Light',
									rating: {
										type: 'Die',
										value: [10],
										range: [4, 6, 8, 10, 12],
									},
									traits: [],
								},
							],
						},
						{
							name: 'Diplomacy',
							rating: {
								type: 'Die',
								value: [8],
								range: [4, 6, 8, 10, 12],
							},
							traits: [
								{
									name: 'High Society',
									rating: {
										type: 'Die',
										value: [8],
										range: [4, 6, 8, 10, 12],
									},
									traits: [],
								},
								{
									name: 'Street Smart',
									rating: {
										type: 'Die',
										value: [6],
										range: [4, 6, 8, 10, 12],
									},
									traits: [],
								},
							],
						},
					],
				},
				{
					id: 'ls-standing',
					name: 'Standing',
					view: {
						page: 1,
						features: {
							description: true,
							sfx: false,
							subtraits: true,
						},
						place: {
							left: '66.666%',
							top: 1,
							width: '33.334%',
							height: 1,
						},
						labels: {
							slot0: 'COMPLICATION',
							slot1: 'BONUS',
						},
						pillar: 'plus',
						parts: {
							name: {
								left: '0%',
								top: 0,
								width: '50%',
								height: 1,
							},
							'child:Statement': {
								left: '50%',
								top: 0,
								width: '50%',
								height: 1,
							},
						},
					},
					noun: 'Standing',
					plural: 'Standings',
					traits: [
						{
							name: 'The Syndicate',
							rating: {
								type: 'Die',
								value: [8],
								range: [4, 6, 8, 10, 12],
							},
							traits: [
								{
									name: 'Complication',
									rating: {
										type: 'Die',
										value: [8],
										range: [4, 6, 8, 10, 12],
									},
									traits: [],
								},
								{
									name: 'Bonus',
									rating: {
										type: 'Die',
										value: [6],
										range: [4, 6, 8, 10, 12],
									},
									traits: [],
								},
								{
									name: 'Debts are never forgotten.',
									rating: {
										type: 'Pip',
										value: [false],
									},
									traits: [],
									noun: 'Statement',
								},
							],
						},
						{
							name: 'The Vanguard',
							rating: {
								type: 'Die',
								value: [6],
								range: [4, 6, 8, 10, 12],
							},
							traits: [
								{
									name: 'Complication',
									rating: {
										type: 'Die',
										value: [6],
										range: [4, 6, 8, 10, 12],
									},
									traits: [],
								},
								{
									name: 'Bonus',
									rating: {
										type: 'Die',
										value: [8],
										range: [4, 6, 8, 10, 12],
									},
									traits: [],
								},
								{
									name: 'Honor bound to protect.',
									rating: {
										type: 'Pip',
										value: [false],
									},
									traits: [],
									noun: 'Statement',
								},
							],
						},
					],
				},
				{
					id: 'ls-values',
					name: 'Values',
					view: {
						page: 1,
						features: {
							description: true,
							sfx: false,
							subtraits: false,
						},
						place: {
							left: '0%',
							top: 2,
							width: '33.333%',
							height: 1,
						},
						labels: {
							col1: 'TALENT',
							col2: 'ACTIVATION',
							col3: 'EFFECT',
						},
						pillar: 'prime',
						parts: {
							name: {
								left: '0%',
								top: 0,
								width: '28%',
								height: 1,
							},
							description: {
								left: '28%',
								top: 0,
								width: '33%',
								height: 1,
							},
							'child:SFX': {
								left: '61%',
								top: 0,
								width: '39%',
								height: 1,
							},
						},
						fixedNames: true,
					},
					noun: 'Value',
					plural: 'Values',
					traits: [
						{
							name: 'Craft',
							rating: {
								type: 'Die',
								value: [8],
								range: [4, 6, 8, 10, 12],
							},
							description: 'Form and function are inseparable.',
							traits: [
								{
									name: 'Form and function are inseparable.',
									rating: {
										type: 'Pip',
										value: [false],
									},
									traits: [],
									noun: 'Statement',
								},
							],
						},
						{
							name: 'Speed',
							rating: {
								type: 'Die',
								value: [8],
								range: [4, 6, 8, 10, 12],
							},
							description: 'Ship early, refine relentlessly.',
							traits: [
								{
									name: 'Ship early, refine relentlessly.',
									rating: {
										type: 'Pip',
										value: [false],
									},
									traits: [],
									noun: 'Statement',
								},
							],
						},
						{
							name: 'Clarity',
							rating: {
								type: 'Die',
								value: [6],
								range: [4, 6, 8, 10, 12],
							},
							description: 'Truth cuts through ambiguity.',
							traits: [
								{
									name: 'Truth cuts through ambiguity.',
									rating: {
										type: 'Pip',
										value: [false],
									},
									traits: [],
									noun: 'Statement',
								},
							],
						},
					],
				},
				{
					id: 'ls-distinctions',
					name: 'Distinctions',
					view: {
						page: 1,
						style: {
							header: 'default',
							body: 'default',
						},
						features: {
							description: true,
							sfx: true,
							subtraits: false,
						},
						place: {
							left: '33.333%',
							top: 2,
							width: '66.667%',
							height: 1,
						},
						pillar: 'prime',
						altRoll: {
							die: 4,
							ppDelta: 1,
							label: 'Hinder',
						},
						notes: "Gain a PP when you trade out your distinction's rating for a d4.",
					},
					noun: 'Distinction',
					plural: 'Distinctions',
					traits: [
						{
							name: 'Voidborn Pioneer',
							rating: {
								type: 'Die',
								value: [8],
								range: [4, 6, 8, 10, 12],
							},
							description: 'Accustomed to zero-G and cold vacuum.',
							traits: [
								{
									name: 'Zero-G Maneuver',
									description: 'Spend 1 PP to ignore difficult terrain in micro-gravity environments.',
									traits: [],
									noun: 'SFX',
								},
							],
							view: {
								badge: {
									text: 'SFX',
									shape: 'vertical-bar',
									color: 'black',
								},
							},
						},
						{
							name: 'Cybernetic Maverick',
							rating: {
								type: 'Die',
								value: [8],
								range: [4, 6, 8, 10, 12],
							},
							description: 'Upgraded with experimental neural cyberware.',
							traits: [
								{
									name: 'Overclock',
									description: 'Spend 1 PP to double an Engineering die when hotwiring security.',
									traits: [],
									noun: 'SFX',
								},
							],
							view: {
								badge: {
									text: 'SFX',
									shape: 'vertical-bar',
									color: 'black',
								},
							},
						},
					],
				},
				{
					id: 'ls-growth',
					name: 'Growth Pool',
					view: {
						page: 2,
						style: {
							header: 'default',
							body: 'dice-count',
						},
						features: {
							description: false,
							sfx: false,
							subtraits: false,
						},
						multiDie: true,
						place: {
							left: '0%',
							top: 0,
							width: '33.333%',
							height: 1,
						},
						labels: {
							rating: 'RATING',
							dice: '/ DICE',
						},
						pillar: 'play',
					},
					pool: true,
					noun: 'Growth Die',
					plural: 'Growth Dice',
					traits: [
						{
							name: 'D4',
							rating: {
								type: 'Die',
								value: [4],
								range: [4, 6, 8, 10, 12],
							},
							spendable: true,
							hitches: 0,
							view: {
								poolCount: 1,
							},
							traits: [],
						},
						{
							name: 'D6',
							rating: {
								type: 'Die',
								value: [6],
								range: [4, 6, 8, 10, 12],
							},
							spendable: true,
							hitches: 0,
							view: {
								poolCount: 1,
							},
							traits: [],
						},
						{
							name: 'D8',
							rating: {
								type: 'Die',
								value: [8],
								range: [4, 6, 8, 10, 12],
							},
							spendable: true,
							hitches: 0,
							view: {
								poolCount: 1,
							},
							traits: [],
						},
						{
							name: 'D10',
							rating: {
								type: 'Die',
								value: [10],
								range: [4, 6, 8, 10, 12],
							},
							spendable: true,
							hitches: 0,
							view: {
								poolCount: 1,
							},
							traits: [],
						},
						{
							name: 'D12',
							rating: {
								type: 'Die',
								value: [12],
								range: [4, 6, 8, 10, 12],
							},
							spendable: true,
							hitches: 0,
							view: {
								poolCount: 1,
							},
							traits: [],
						},
					],
				},
				{
					id: 'ls-badges',
					name: 'Badges & Commendations',
					view: {
						page: 2,
						style: {
							header: 'default',
							body: 'die-rows',
						},
						features: {
							description: false,
							sfx: false,
							subtraits: false,
						},
						place: {
							left: '33.333%',
							top: 0,
							width: '33.333%',
							height: 1,
						},
						pillar: 'plus',
					},
					noun: 'Badge',
					plural: 'Badges',
					traits: [
						{
							name: 'Fleet Veteran',
							rating: {
								type: 'Die',
								value: [8],
								range: [4, 6, 8, 10, 12],
							},
							traits: [],
						},
						{
							name: 'High Jump',
							rating: {
								type: 'Die',
								value: [6],
								range: [4, 6, 8, 10, 12],
							},
							traits: [],
						},
						{
							name: 'Master Hacker',
							rating: {
								type: 'Die',
								value: [10],
								range: [4, 6, 8, 10, 12],
							},
							traits: [],
						},
					],
				},
				{
					id: 'ls-resources',
					name: 'Resources & Supplies',
					view: {
						page: 2,
						style: {
							header: 'default',
							body: 'dice-count',
						},
						features: {
							description: false,
							sfx: false,
							subtraits: false,
						},
						place: {
							left: '66.666%',
							top: 0,
							width: '33.334%',
							height: 1,
						},
						labels: {
							rating: 'RATING',
							dice: '/ DICE',
						},
						pillar: 'plus',
					},
					noun: 'Resource',
					plural: 'Resources',
					traits: [
						{
							name: 'Crew Complement',
							rating: {
								type: 'Die',
								value: [8],
								range: [4, 6, 8, 10, 12],
							},
							spendable: true,
							hitches: 0,
							view: {
								poolCount: 4,
							},
							traits: [],
						},
						{
							name: 'Emergency Fuel',
							rating: {
								type: 'Die',
								value: [6],
								range: [4, 6, 8, 10, 12],
							},
							spendable: true,
							hitches: 0,
							view: {
								poolCount: 3,
							},
							traits: [],
						},
						{
							name: 'Intel Network',
							rating: {
								type: 'Die',
								value: [8],
								range: [4, 6, 8, 10, 12],
							},
							spendable: true,
							hitches: 0,
							view: {
								poolCount: 2,
							},
							traits: [],
						},
					],
				},
				{
					id: 'ls-dossier',
					name: 'Personnel Dossier',
					view: {
						page: 2,
						features: {
							description: true,
							sfx: false,
							subtraits: false,
						},
						place: {
							left: '0%',
							top: 1,
							width: '66.666%',
							height: 1,
						},
						pillar: 'plus',
						parts: {
							name: {
								left: '0%',
								top: 0,
								width: '100%',
								height: 1,
							},
							description: {
								left: '0%',
								top: 1,
								width: '100%',
								height: 1,
							},
						},
					},
					noun: 'Field',
					plural: 'Fields',
					traits: [
						{
							name: 'Homeworld',
							description: 'Kepler-452b Core Colony',
							traits: [],
						},
						{
							name: 'Security Clearance',
							description: 'Level 5 Special Access',
							traits: [],
						},
						{
							name: 'Affiliation',
							description: 'Independent Free-Trader Collective',
							traits: [],
						},
					],
				},
				{
					id: 'ls-stress',
					name: 'Stress',
					view: {
						page: 2,
						style: {
							header: 'default',
							body: 'pips',
						},
						features: {
							description: false,
							sfx: false,
							subtraits: false,
						},
						pips: {
							perRow: 5,
							connected: true,
						},
						place: {
							left: '66.666%',
							top: 1,
							width: '33.334%',
							height: 1,
						},
						pillar: 'play',
					},
					rating: {
						type: 'Pip',
						value: [true, false, false, false, false, false, false, false, false, false],
					},
					noun: 'Stress',
					plural: 'Stress',
					traits: [
						{
							name: 'Physical',
							rating: {
								type: 'Die',
								value: [6],
								range: [4, 6, 8, 10, 12],
							},
							view: {
								pipCount: 5,
								pips: 1,
							},
							traits: [],
						},
						{
							name: 'Mental',
							rating: {
								type: 'Die',
								value: [6],
								range: [4, 6, 8, 10, 12],
							},
							view: {
								pipCount: 5,
								pips: 0,
							},
							traits: [],
						},
					],
				},
				{
					id: 'ls-notes',
					name: 'Field Notes',
					view: {
						page: 2,
						place: {
							left: '66.66%',
							top: 2,
							width: '33.334%',
							height: 1,
						},
						pillar: 'play',
						notesMarkdown: true,
						parts: {
							description: {
								left: '0%',
								top: 0,
								width: '100%',
								height: 1,
							},
						},
					},
					noun: 'Note',
					plural: 'Notes',
					traits: [
						{
							name: '',
							description:
								'### Equipment\n- **Jump Drive Matrix** (d8)\n- **Thermal Scanner**: Spend 1 PP to detect cloaked ships.',
							traits: [],
						},
					],
				},
				{
					id: 'ls-session-record',
					name: 'Mission Chronicle',
					view: {
						page: 2,
						style: {
							header: 'default',
							body: 'pips',
						},
						reservedSlots: 12,
						header: 'top',
						headerAlign: 'right',
						pips: {
							labels: true,
							perRow: 12,
						},
						pillar: 'play',
					},
					rating: {
						type: 'Pip',
						value: [false, false, false, false, false, false, false, false, false, false, false, false],
					},
					noun: 'Session',
					plural: 'Sessions',
					traits: [
						{
							name: '',
							rating: {
								type: 'Pip',
								value: [true],
							},
							traits: [],
						},
						{
							name: '',
							rating: {
								type: 'Pip',
								value: [true],
							},
							traits: [],
						},
						{
							name: '',
							rating: {
								type: 'Pip',
								value: [true],
							},
							traits: [],
						},
					],
				},
			],
		},
	},
];

if (typeof module !== 'undefined' && module.exports) {
	module.exports = characterCurioLibraryTemplates;
}
