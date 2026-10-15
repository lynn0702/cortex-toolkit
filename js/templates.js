/**
 * Cortex Toolkit - Spotlight Templates Repository (Blank Spotlight Sheets)
 */
const cortexSpotlightTemplates = [
	{
		"id": "spotlight-alien-us",
		"version": 1,
		"title": "Alien, Us",
		"subtitle": "Sci-Fi Infiltration & Paranoia",
		"spotlight": "Alien, Us",
		"variant": "Character File",
		"pages": 2,
		"genre": "Sci-Fi / Espionage",
		"description": "Play extraterrestrial operatives living undercover on Earth. Includes Distinctions with Hinder, Skills (d6) with branching Specialties (d8-d12), Values, Talents, Signature Assets/Tech, Relationships, and a 20-step Session Record.",
		"character": {
			"$schema": "https://cortex.engard.me/schema/0.1/character.schema.json",
			"version": "0.1",
			"id": "template-spotlight-alien-us",
			"isTemplate": true,
			"name": "",
			"game": "Alien, Us",
			"description": "",
			"pronouns": "",
			"plotPoints": 1,
			"notes": "",
			"custom": {
				"cortexToolkit": {
					"pageCount": 2,
					"spotlight": "Alien, Us",
					"style": {
						"hasAttributes": false
					},
					"sheetStyle": "spotlight",
					"columns": 3,
					"watermark": {
						"enabled": true,
						"url": "images/cortex_prime_logo_light_transparent.png",
						"opacity": 0.08,
						"scale": 70,
						"page": "all"
					},
					"columnAlignment": "full-width",
					"columnOffsets": {
						"left": 0,
						"center": 0,
						"right": 0
					}
				}
			},
			"player": "",
			"portrait": {
				"url": "",
				"custom": {
					"cortexToolkit": {
						"size": "spotlight",
						"location": "header"
					}
				}
			},
			"traitSets": [
				{
					"id": "distinctions",
					"name": "Distinctions",
					"description": "Core alien background, job, and personality",
					"nounSingular": "Distinction",
					"nounPlural": "Distinctions",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"features": {
								"description": true,
								"sfx": false,
								"subtraits": false
							},
							"sharedHinder": true,
							"sharedHinderText": "Gain a PP when you trade out your distinction's d8 rating for a d4.",
							"location": "left",
							"page": 1,
							"style": {
								"header": "distinctions",
								"body": "distinctions"
							},
							"multiDie": false,
							"ratingScale": [
								8
							],
							"stressConfig": {
								"includeOut": true
							},
							"notes": "",
							"reservedSlots": 3,
							"colSpan": 3,
							"columnSpan": "full"
						}
					},
					"traits": [
						{
							"name": "Alien Background:",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": [
								"hinder"
							]
						},
						{
							"name": "Alien Role/Job:",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": [
								"hinder"
							]
						},
						{
							"name": "Personality/Quirk:",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": [
								"hinder"
							]
						}
					],
					"sfx": []
				},
				{
					"id": "subtrait-columns",
					"name": "Skills & Specialties",
					"description": "Core baseline d6 skills with branching d8+ specialties",
					"nounSingular": "Skill",
					"nounPlural": "Skills",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"header": "top",
							"headerAlign": "center",
							"features": {
								"description": false,
								"sfx": false,
								"subtraits": true
							},
							"location": "center",
							"page": 1,
							"style": {
								"header": "default",
								"body": "subtrait-columns"
							},
							"setDie": 6,
							"subtraitRatingScale": [
								8,
								10,
								12
							],
							"labels": {
								"left": "Specialties",
								"center": "Skills",
								"right": "Specialties"
							},
							"multiDie": false,
							"stressConfig": {
								"includeOut": true
							},
							"notes": "",
							"reservedSlots": 7,
							"colSpan": "full",
							"columnSpan": "full"
						}
					},
					"traits": [
						{
							"name": "Bout",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [
								{
									"name": "",
									"value": 0,
									"dice": [],
									"description": "",
									"tags": [],
									"custom": {
										"cortexToolkit": {
											"branchSide": "left"
										}
									},
									"traits": [],
									"sfx": []
								},
								{
									"name": "",
									"value": 0,
									"dice": [],
									"description": "",
									"tags": [],
									"custom": {
										"cortexToolkit": {
											"branchSide": "right"
										}
									},
									"traits": [],
									"sfx": []
								}
							],
							"sfx": []
						},
						{
							"name": "Chat",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [
								{
									"name": "",
									"value": 0,
									"dice": [],
									"description": "",
									"tags": [],
									"custom": {
										"cortexToolkit": {
											"branchSide": "left"
										}
									},
									"traits": [],
									"sfx": []
								},
								{
									"name": "",
									"value": 0,
									"dice": [],
									"description": "",
									"tags": [],
									"custom": {
										"cortexToolkit": {
											"branchSide": "right"
										}
									},
									"traits": [],
									"sfx": []
								}
							],
							"sfx": []
						},
						{
							"name": "Find",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [
								{
									"name": "",
									"value": 0,
									"dice": [],
									"description": "",
									"tags": [],
									"custom": {
										"cortexToolkit": {
											"branchSide": "left"
										}
									},
									"traits": [],
									"sfx": []
								},
								{
									"name": "",
									"value": 0,
									"dice": [],
									"description": "",
									"tags": [],
									"custom": {
										"cortexToolkit": {
											"branchSide": "right"
										}
									},
									"traits": [],
									"sfx": []
								}
							],
							"sfx": []
						},
						{
							"name": "Make",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [
								{
									"name": "",
									"value": 0,
									"dice": [],
									"description": "",
									"tags": [],
									"custom": {
										"cortexToolkit": {
											"branchSide": "left"
										}
									},
									"traits": [],
									"sfx": []
								},
								{
									"name": "",
									"value": 0,
									"dice": [],
									"description": "",
									"tags": [],
									"custom": {
										"cortexToolkit": {
											"branchSide": "right"
										}
									},
									"traits": [],
									"sfx": []
								}
							],
							"sfx": []
						},
						{
							"name": "Play",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [
								{
									"name": "",
									"value": 0,
									"dice": [],
									"description": "",
									"tags": [],
									"custom": {
										"cortexToolkit": {
											"branchSide": "left"
										}
									},
									"traits": [],
									"sfx": []
								},
								{
									"name": "",
									"value": 0,
									"dice": [],
									"description": "",
									"tags": [],
									"custom": {
										"cortexToolkit": {
											"branchSide": "right"
										}
									},
									"traits": [],
									"sfx": []
								}
							],
							"sfx": []
						},
						{
							"name": "Operate",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [
								{
									"name": "",
									"value": 0,
									"dice": [],
									"description": "",
									"tags": [],
									"custom": {
										"cortexToolkit": {
											"branchSide": "left"
										}
									},
									"traits": [],
									"sfx": []
								},
								{
									"name": "",
									"value": 0,
									"dice": [],
									"description": "",
									"tags": [],
									"custom": {
										"cortexToolkit": {
											"branchSide": "right"
										}
									},
									"traits": [],
									"sfx": []
								}
							],
							"sfx": []
						},
						{
							"name": "Work",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [
								{
									"name": "",
									"value": 0,
									"dice": [],
									"description": "",
									"tags": [],
									"custom": {
										"cortexToolkit": {
											"branchSide": "left"
										}
									},
									"traits": [],
									"sfx": []
								},
								{
									"name": "",
									"value": 0,
									"dice": [],
									"description": "",
									"tags": [],
									"custom": {
										"cortexToolkit": {
											"branchSide": "right"
										}
									},
									"traits": [],
									"sfx": []
								}
							],
							"sfx": []
						}
					],
					"sfx": []
				},
				{
					"id": "values",
					"name": "Values",
					"description": "Alien worldview versus human conditioning",
					"nounSingular": "Value",
					"nounPlural": "Values",
					"statement": true,
					"ratingPosition": "above",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"header": "top",
							"headerAlign": "left",
							"traitColumns": 2,
							"features": {
								"description": true,
								"sfx": false,
								"subtraits": false
							},
							"location": "left",
							"page": 1,
							"style": {
								"header": "default",
								"body": "default"
							},
							"multiDie": false,
							"ratingScale": [
								4,
								6,
								8,
								10,
								12
							],
							"stressConfig": {
								"includeOut": true
							},
							"notes": "",
							"reservedSlots": 7,
							"colSpan": "full",
							"columnSpan": "full"
						}
					},
					"traits": [
						{
							"name": "Alien",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Conformity",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Materialism",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Paranoia",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Patriotism",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Secrecy",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Spirituality",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						}
					],
					"sfx": []
				},
				{
					"id": "talents",
					"name": "Talents",
					"description": "Specialized alien abilities and tech modules",
					"nounSingular": "Talent",
					"nounPlural": "Talents",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"features": {
								"description": true,
								"sfx": true,
								"subtraits": false
							},
							"location": "right",
							"page": 1,
							"style": {
								"header": "default",
								"body": "three-column-table"
							},
							"multiDie": false,
							"stressConfig": {
								"includeOut": true
							},
							"notes": "",
							"reservedSlots": 4,
							"colSpan": "full",
							"columnSpan": "full"
						}
					},
					"traits": [
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						}
					],
					"sfx": []
				},
				{
					"id": "signature-assets-tech",
					"name": "Signature Assets / Tech",
					"description": "Alien equipment and concealed devices",
					"nounSingular": "Signature Asset / Tech",
					"nounPlural": "Signature Assets / Tech",
					"ratingPosition": "inline",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"header": "top",
							"headerAlign": "left",
							"features": {
								"description": true,
								"sfx": false,
								"subtraits": false
							},
							"location": "left",
							"page": 2,
							"style": {
								"header": "default",
								"body": "default"
							},
							"multiDie": false,
							"ratingScale": [
								6,
								8,
								10,
								12
							],
							"stressConfig": {
								"includeOut": true
							},
							"notes": "",
							"reservedSlots": 3,
							"colSpan": "full",
							"columnSpan": "full"
						}
					},
					"traits": [
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						}
					],
					"sfx": []
				},
				{
					"id": "relationships",
					"name": "Relationships",
					"description": "Connections to human contacts, superiors, and rivals",
					"nounSingular": "Relationship",
					"nounPlural": "Relationships",
					"ratingPosition": "above",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"header": "top",
							"headerAlign": "left",
							"traitColumns": 2,
							"features": {
								"description": true,
								"sfx": false,
								"subtraits": false
							},
							"location": "center",
							"page": 2,
							"style": {
								"header": "default",
								"body": "default"
							},
							"multiDie": false,
							"ratingScale": [
								4,
								6,
								8,
								10,
								12
							],
							"stressConfig": {
								"includeOut": true
							},
							"notes": "",
							"reservedSlots": 10,
							"colSpan": "full",
							"columnSpan": "full"
						}
					},
					"traits": [
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						}
					],
					"sfx": []
				},
				{
					"id": "session-record",
					"name": "Session Record",
					"description": "Session track and progression log",
					"nounSingular": "Milestone",
					"nounPlural": "Milestones",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"header": "top",
							"headerAlign": "left",
							"features": {
								"description": false,
								"sfx": false,
								"subtraits": false
							},
							"location": "right",
							"page": 2,
							"style": {
								"header": "default",
								"body": "session-record"
							},
							"sessionRecord": {
								"count": 20,
								"orientation": "horizontal"
							},
							"multiDie": false,
							"stressConfig": {
								"includeOut": true
							},
							"notes": "",
							"reservedSlots": 20,
							"colSpan": "full",
							"columnSpan": "full"
						}
					},
					"traits": [],
					"sfx": []
				}
			]
		}
	},
	{
		"id": "spotlight-brighter-stars",
		"version": 1,
		"title": "BrighterStars",
		"subtitle": "Hopepunk Starship Exploration",
		"spotlight": "BrighterStars",
		"variant": "Character File",
		"pages": 1,
		"genre": "Sci-Fi / Space Exploration",
		"description": "Crew members aboard the starship Diana venturing into unknown sectors. Features Distinctions with Hinder and SFX, Values with personal statements, Crew Relationships, Signature Assets, Milestones, and an XP bubble grid.",
		"character": {
			"$schema": "https://cortex.engard.me/schema/0.1/character.schema.json",
			"version": "0.1",
			"id": "template-spotlight-brighter-stars",
			"isTemplate": true,
			"name": "",
			"game": "BrighterStars",
			"description": "",
			"pronouns": "",
			"plotPoints": 1,
			"notes": "",
			"custom": {
				"cortexToolkit": {
					"pageCount": 1,
					"spotlight": "BrighterStars",
					"style": {
						"hasAttributes": false
					},
					"sheetStyle": "spotlight",
					"columns": 2,
					"watermark": {
						"enabled": true,
						"url": "images/cortex_prime_logo_light_transparent.png",
						"opacity": 0.08,
						"scale": 70,
						"page": "all"
					},
					"columnAlignment": "top-base",
					"columnOffsets": {
						"left": 0,
						"center": 0,
						"right": 0
					}
				}
			},
			"player": "",
			"portrait": {
				"url": "",
				"custom": {
					"cortexToolkit": {
						"size": "spotlight",
						"location": "header"
					}
				}
			},
			"traitSets": [
				{
					"id": "distinctions",
					"name": "Distinctions",
					"description": "Crew role, quality, and personal drive",
					"nounSingular": "Distinction",
					"nounPlural": "Distinctions",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"features": {
								"description": true,
								"sfx": true,
								"subtraits": false
							},
							"location": "left",
							"page": 1,
							"style": {
								"header": "distinctions",
								"body": "distinctions"
							},
							"sharedHinder": true,
							"sharedHinderText": "Gain a PP when you trade out your distinction's d8 rating for a d4.",
							"multiDie": false,
							"ratingScale": [
								8
							],
							"stressConfig": {
								"includeOut": true
							},
							"notes": "",
							"reservedSlots": 3,
							"colWidth": 64
						}
					},
					"traits": [
						{
							"name": "Purpose:",
							"value": 8,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": [
								"hinder",
								{
									"name": "",
									"description": "",
									"tags": [],
									"custom": {}
								}
							]
						},
						{
							"name": "Quality:",
							"value": 8,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": [
								"hinder",
								{
									"name": "",
									"description": "",
									"tags": [],
									"custom": {}
								}
							]
						},
						{
							"name": "",
							"value": 8,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": [
								"hinder",
								{
									"name": "",
									"description": "",
									"tags": [],
									"custom": {}
								}
							]
						}
					],
					"sfx": []
				},
				{
					"id": "values",
					"name": "Values",
					"description": "Guiding philosophies paired with personal statements",
					"nounSingular": "Value",
					"nounPlural": "Values",
					"statement": true,
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"features": {
								"description": true,
								"sfx": false,
								"subtraits": false
							},
							"location": "left",
							"page": 1,
							"style": {
								"header": "default",
								"body": "default"
							},
							"multiDie": false,
							"ratingScale": [
								4,
								6,
								8,
								10,
								12
							],
							"stressConfig": {
								"includeOut": true
							},
							"notes": "",
							"reservedSlots": 5,
							"colWidth": 64
						}
					},
					"traits": [
						{
							"name": "Courage",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Curiosity",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Hope",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Logic",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Peace",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						}
					],
					"sfx": []
				},
				{
					"id": "relationships",
					"name": "Relationships",
					"description": "Crew connections and ties to shipmates",
					"nounSingular": "Relationship",
					"nounPlural": "Relationships",
					"statement": true,
					"ratingPosition": "below",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"header": "top",
							"headerAlign": "left",
							"features": {
								"description": true,
								"sfx": false,
								"subtraits": false
							},
							"location": "left",
							"page": 1,
							"style": {
								"header": "default",
								"body": "default"
							},
							"multiDie": false,
							"ratingScale": [
								4,
								6,
								8,
								10,
								12
							],
							"stressConfig": {
								"includeOut": true
							},
							"notes": "",
							"reservedSlots": 8,
							"colWidth": 64
						}
					},
					"traits": [
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						}
					],
					"sfx": []
				},
				{
					"id": "signature-assets",
					"name": "Signature Assets",
					"description": "Specialized starship equipment and personal gear",
					"nounSingular": "Signature Asset",
					"nounPlural": "Signature Assets",
					"ratingPosition": "above",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"features": {
								"description": true,
								"sfx": false,
								"subtraits": false
							},
							"location": "right",
							"page": 1,
							"style": {
								"header": "default",
								"body": "default"
							},
							"multiDie": false,
							"ratingScale": [
								6,
								8,
								10,
								12
							],
							"stressConfig": {
								"includeOut": true
							},
							"notes": "",
							"reservedSlots": 3
						}
					},
					"traits": [
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						}
					],
					"sfx": []
				},
				{
					"id": "milestones",
					"name": "Milestones",
					"description": "",
					"nounSingular": "Milestone",
					"nounPlural": "Milestones",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"header": "top",
							"headerAlign": "left",
							"features": {
								"description": false,
								"sfx": false,
								"subtraits": false
							},
							"location": "right",
							"page": 1,
							"style": {
								"header": "default",
								"body": "notes"
							},
							"multiDie": false,
							"stressConfig": {
								"includeOut": true
							},
							"notes": "### PERSONAL:\n- **1 XP** when \n- **3 XP** when \n- **10 XP** when \n\n### GROUP:\n- **1 XP** when \n- **3 XP** when \n- **10 XP** when ",
							"reservedSlots": 0
						}
					},
					"traits": [],
					"sfx": []
				},
				{
					"id": "xp",
					"name": "XP",
					"description": "Experience points bubble track",
					"nounSingular": "XP",
					"nounPlural": "XP",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"features": {
								"description": false,
								"sfx": false,
								"subtraits": false
							},
							"location": "right",
							"page": 1,
							"style": {
								"header": "default",
								"body": "pips"
							},
							"pipsConfig": {
								"rows": 5,
								"perRow": 5,
								"filled": 0
							},
							"pips": {
								"count": 25,
								"perRow": 5,
								"connected": true,
								"filled": 0
							},
							"reservedSlots": 0
						}
					},
					"traits": [],
					"sfx": []
				}
			]
		}
	},
	{
		"id": "spotlight-camp-bewilderwood",
		"version": 1,
		"title": "Camp Bewilderwood",
		"subtitle": "Cryptid Summer Camp Mystery",
		"spotlight": "Camp Bewilderwood",
		"variant": "Camper File",
		"pages": 1,
		"genre": "Supernatural / Youth Mystery",
		"description": "Young campers uncovering bizarre woods, mythical creatures, and ancient folklore. Features Heritage, Destiny, and Reputation Distinctions, Attributes, Values, Standing dice, Badges, and Signature Assets.",
		"character": {
			"$schema": "https://cortex.engard.me/schema/0.1/character.schema.json",
			"version": "0.1",
			"id": "template-spotlight-camp-bewilderwood",
			"isTemplate": true,
			"name": "",
			"game": "Camp Bewilderwood",
			"description": "",
			"pronouns": "",
			"plotPoints": 1,
			"notes": "",
			"custom": {
				"cortexToolkit": {
					"pageCount": 1,
					"spotlight": "Camp Bewilderwood",
					"style": {
						"hasAttributes": false
					},
					"sheetStyle": "spotlight",
					"columns": 2,
					"watermark": {
						"enabled": true,
						"url": "images/cortex_prime_logo_light_transparent.png",
						"opacity": 0.08,
						"scale": 70,
						"page": "all"
					},
					"columnAlignment": "top-base",
					"columnOffsets": {
						"left": 0,
						"center": 0,
						"right": 0
					}
				}
			},
			"player": "",
			"portrait": {
				"url": "",
				"custom": {
					"cortexToolkit": {
						"size": "spotlight",
						"location": "header"
					}
				}
			},
			"traitSets": [
				{
					"id": "distinctions",
					"name": "Distinctions",
					"description": "Camp background, camper reputation, and hidden destiny",
					"nounSingular": "Distinction",
					"nounPlural": "Distinctions",
					"ratingPosition": "inline",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"features": {
								"description": true,
								"sfx": true,
								"subtraits": false
							},
							"location": "left",
							"page": 1,
							"style": {
								"header": "distinctions",
								"body": "distinctions"
							},
							"ratingPosition": "inline",
							"sharedHinder": true,
							"sharedHinderText": "Hinder: Gain a PP when you trade out your distinction's d8 rating for a d4.",
							"multiDie": false,
							"stressConfig": {
								"includeOut": true
							},
							"notes": "",
							"reservedSlots": 3,
							"colWidth": 66
						}
					},
					"traits": [
						{
							"name": "HERITAGE:",
							"value": 8,
							"dice": [],
							"description": "",
							"statement": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": [
								{
									"name": "Heritage",
									"description": "Spend a PP to step up an attribute when you connect to your heritage."
								}
							]
						},
						{
							"name": "DESTINY:",
							"value": 8,
							"dice": [],
							"description": "",
							"statement": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": [
								{
									"name": "Destiny",
									"description": "Spend a PP to reroll your dice when you embrace your destiny."
								}
							]
						},
						{
							"name": "CAMP REPUTATION:",
							"value": 8,
							"dice": [],
							"description": "",
							"statement": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": [
								{
									"name": "Camp Reputation",
									"description": "Spend a PP to create a d8 asset linked to the thing you're known for."
								}
							]
						}
					],
					"sfx": []
				},
				{
					"id": "values",
					"name": "Values",
					"description": "Camper ideals and loyalties",
					"nounSingular": "Value",
					"nounPlural": "Values",
					"statement": true,
					"hasQuestionedPip": true,
					"ratingPosition": "inline",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"features": {
								"description": true,
								"sfx": false,
								"subtraits": false
							},
							"location": "left",
							"page": 1,
							"style": {
								"header": "default",
								"body": "default"
							},
							"statement": true,
							"hasQuestionedPip": true,
							"ratingPosition": "inline",
							"ratingScale": [
								4,
								6,
								8,
								10,
								12
							],
							"multiDie": false,
							"stressConfig": {
								"includeOut": true
							},
							"notes": "",
							"reservedSlots": 5,
							"colWidth": 66
						}
					},
					"traits": [
						{
							"name": "Bravery",
							"value": 0,
							"dice": [],
							"description": "",
							"statement": "",
							"questioned": false,
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Community",
							"value": 0,
							"dice": [],
							"description": "",
							"statement": "",
							"questioned": false,
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Curiosity",
							"value": 0,
							"dice": [],
							"description": "",
							"statement": "",
							"questioned": false,
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Friendship",
							"value": 0,
							"dice": [],
							"description": "",
							"statement": "",
							"questioned": false,
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Mischief",
							"value": 0,
							"dice": [],
							"description": "",
							"statement": "",
							"questioned": false,
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						}
					],
					"sfx": []
				},
				{
					"id": "signature-assets",
					"name": "Signature Assets",
					"description": "Treasured camper keepsakes and scavenged relics",
					"nounSingular": "Signature Asset",
					"nounPlural": "Signature Assets",
					"ratingPosition": "above",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"features": {
								"description": true,
								"sfx": false,
								"subtraits": false
							},
							"location": "right",
							"page": 1,
							"style": {
								"header": "default",
								"body": "default"
							},
							"ratingPosition": "above",
							"ratingScale": [
								6,
								8,
								10,
								12
							],
							"multiDie": false,
							"stressConfig": {
								"includeOut": true
							},
							"notes": "",
							"reservedSlots": 3
						}
					},
					"traits": [
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"statement": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						}
					],
					"sfx": []
				},
				{
					"id": "attributes",
					"name": "Attributes",
					"description": "Core camper capability ratings",
					"nounSingular": "Attribute",
					"nounPlural": "Attributes",
					"ratingPosition": "below",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"features": {
								"description": false,
								"sfx": false,
								"subtraits": false
							},
							"location": "right",
							"page": 1,
							"style": {
								"header": "default",
								"body": "default"
							},
							"ratingPosition": "below",
							"ratingScale": [
								6,
								8,
								10,
								12
							],
							"multiDie": false,
							"stressConfig": {
								"includeOut": true
							},
							"notes": "",
							"reservedSlots": 3,
							"attributesRing": false
						}
					},
					"traits": [
						{
							"name": "Mental",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Physical",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Social",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						}
					],
					"sfx": []
				},
				{
					"id": "paired-slots",
					"name": "Standing",
					"description": "Camp social standing with complication and bonus dice",
					"nounSingular": "Standing",
					"nounPlural": "Standings",
					"statement": true,
					"ratingPosition": "inline",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"features": {
								"description": true,
								"sfx": false,
								"subtraits": true
							},
							"location": "left",
							"page": 1,
							"style": {
								"header": "default",
								"body": "paired-slots"
							},
							"ratingPosition": "inline",
							"ratingScale": [
								4,
								6,
								8,
								10,
								12
							],
							"subtraitRatingScale": [
								4,
								6,
								8,
								10,
								12
							],
							"multiDie": false,
							"stressConfig": {
								"includeOut": true
							},
							"notes": "",
							"reservedSlots": 6,
							"colWidth": 40,
							"rowBreak": true
						}
					},
					"traits": [
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"statement": "",
							"tags": [],
							"custom": {},
							"traits": [
								{
									"name": "COMPLICATION",
									"value": 0,
									"dice": [],
									"description": "",
									"tags": [],
									"custom": {},
									"traits": [],
									"sfx": []
								},
								{
									"name": "BONUS",
									"value": 0,
									"dice": [],
									"description": "",
									"tags": [],
									"custom": {},
									"traits": [],
									"sfx": []
								}
							],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"statement": "",
							"tags": [],
							"custom": {},
							"traits": [
								{
									"name": "COMPLICATION",
									"value": 0,
									"dice": [],
									"description": "",
									"tags": [],
									"custom": {},
									"traits": [],
									"sfx": []
								},
								{
									"name": "BONUS",
									"value": 0,
									"dice": [],
									"description": "",
									"tags": [],
									"custom": {},
									"traits": [],
									"sfx": []
								}
							],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"statement": "",
							"tags": [],
							"custom": {},
							"traits": [
								{
									"name": "COMPLICATION",
									"value": 0,
									"dice": [],
									"description": "",
									"tags": [],
									"custom": {},
									"traits": [],
									"sfx": []
								},
								{
									"name": "BONUS",
									"value": 0,
									"dice": [],
									"description": "",
									"tags": [],
									"custom": {},
									"traits": [],
									"sfx": []
								}
							],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"statement": "",
							"tags": [],
							"custom": {},
							"traits": [
								{
									"name": "COMPLICATION",
									"value": 0,
									"dice": [],
									"description": "",
									"tags": [],
									"custom": {},
									"traits": [],
									"sfx": []
								},
								{
									"name": "BONUS",
									"value": 0,
									"dice": [],
									"description": "",
									"tags": [],
									"custom": {},
									"traits": [],
									"sfx": []
								}
							],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"statement": "",
							"tags": [],
							"custom": {},
							"traits": [
								{
									"name": "COMPLICATION",
									"value": 0,
									"dice": [],
									"description": "",
									"tags": [],
									"custom": {},
									"traits": [],
									"sfx": []
								},
								{
									"name": "BONUS",
									"value": 0,
									"dice": [],
									"description": "",
									"tags": [],
									"custom": {},
									"traits": [],
									"sfx": []
								}
							],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"statement": "",
							"tags": [],
							"custom": {},
							"traits": [
								{
									"name": "COMPLICATION",
									"value": 0,
									"dice": [],
									"description": "",
									"tags": [],
									"custom": {},
									"traits": [],
									"sfx": []
								},
								{
									"name": "BONUS",
									"value": 0,
									"dice": [],
									"description": "",
									"tags": [],
									"custom": {},
									"traits": [],
									"sfx": []
								}
							],
							"sfx": []
						}
					],
					"sfx": []
				},
				{
					"id": "badges",
					"name": "Badges",
					"description": "Merit badges earned at camp",
					"nounSingular": "Badge",
					"nounPlural": "Badges",
					"hasCounterColumn": true,
					"counterLabel": "XP",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"features": {
								"description": false,
								"sfx": false,
								"subtraits": false
							},
							"location": "right",
							"header": "top",
							"page": 1,
							"style": {
								"header": "default",
								"body": "die-rows"
							},
							"hasCounterColumn": true,
							"counterLabel": "XP",
							"ratingScale": [
								6,
								8,
								10,
								12
							],
							"multiDie": false,
							"stressConfig": {
								"includeOut": true
							},
							"notes": "",
							"reservedSlots": 17
						}
					},
					"traits": [],
					"sfx": []
				},
				{
					"id": "talents",
					"name": "Talents",
					"description": "Camper knacks and signature tricks",
					"nounSingular": "Talent",
					"nounPlural": "Talents",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"features": {
								"description": true,
								"sfx": true,
								"subtraits": false
							},
							"location": "left",
							"page": 1,
							"style": {
								"header": "default",
								"body": "three-column-table"
							},
							"multiDie": false,
							"stressConfig": {
								"includeOut": true
							},
							"notes": "",
							"reservedSlots": 2,
							"colSpan": "full",
							"columnSpan": "full"
						}
					},
					"traits": [
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						}
					],
					"sfx": []
				}
			]
		}
	},
	{
		"id": "spotlight-cosa-nostra",
		"version": 1,
		"title": "Cosa Nostra",
		"subtitle": "Historical Crime Syndicate Drama",
		"spotlight": "Cosa Nostra",
		"variant": "Mobster File",
		"pages": 1,
		"genre": "Crime / Drama / Noir",
		"description": "Organized crime syndicate members climbing the ranks of the 1920s-1930s underworld. Features Distinctions with Distinction Stress, Drives, Roles with Specialties, Syndicate Resources, Signature Assets, and Session Record.",
		"character": {
			"$schema": "https://cortex.engard.me/schema/0.1/character.schema.json",
			"version": "0.1",
			"id": "template-spotlight-cosa-nostra",
			"isTemplate": true,
			"name": "",
			"game": "Cosa Nostra",
			"description": "",
			"pronouns": "",
			"plotPoints": 1,
			"notes": "",
			"custom": {
				"cortexToolkit": {
					"pageCount": 1,
					"spotlight": "Cosa Nostra",
					"style": {
						"hasAttributes": false
					},
					"sheetStyle": "spotlight",
					"columns": 3,
					"hasNickname": true,
					"watermark": {
						"enabled": true,
						"url": "images/cortex_prime_logo_light_transparent.png",
						"opacity": 0.08,
						"scale": 70,
						"page": "all"
					},
					"columnAlignment": "top-base",
					"columnOffsets": {
						"left": 0,
						"center": 0,
						"right": 0
					}
				}
			},
			"player": "",
			"portrait": {
				"url": "",
				"custom": {
					"cortexToolkit": {
						"size": "spotlight",
						"location": "header"
					}
				}
			},
			"traitSets": [
				{
					"id": "distinctions",
					"name": "Distinctions",
					"description": "Origins and syndicate reputation (Distinction Stress: Shaken, Rattled, Broken)",
					"nounSingular": "Distinction",
					"nounPlural": "Distinctions",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"features": {
								"description": true,
								"sfx": false,
								"subtraits": false
							},
							"location": "left",
							"colSpan": 3,
							"columnSpan": 3,
							"headerRight": "Character File",
							"traitColumns": 3,
							"page": 1,
							"style": {
								"header": "distinctions",
								"body": "distinctions"
							},
							"ratingScale": [
								8,
								10,
								12
							],
							"sharedHinder": true,
							"sharedHinderText": "Gain a PP when you trade out your distinction's die rating for a d4.\nShaken: When a distinction's stress rating is higher than its die rating, you may only keep one die for your result when using that distinction.",
							"attachedStress": {
								"enabled": true,
								"label": "Stress",
								"ratingScale": [
									4,
									6,
									8,
									10,
									12
								],
								"scale": [
									4,
									6,
									8,
									10,
									12
								],
								"includeOut": false
							},
							"multiDie": false,
							"notes": "",
							"reservedSlots": 3
						}
					},
					"traits": [
						{
							"name": "Neighborhood",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {
								"stress": 0
							},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Crew",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {
								"stress": 0
							},
							"traits": [],
							"sfx": []
						},
						{
							"name": "The Family",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {
								"stress": 0
							},
							"traits": [],
							"sfx": []
						}
					],
					"sfx": []
				},
				{
					"id": "resources",
					"name": "Resources",
					"description": "Syndicate operational pools and assets",
					"nounSingular": "Resource",
					"nounPlural": "Resources",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"features": {
								"description": true,
								"sfx": false,
								"subtraits": false
							},
							"location": "left",
							"page": 1,
							"style": {
								"header": "default",
								"body": "dice-count"
							},
							"ratingScale": [
								6,
								8,
								10,
								12
							],
							"multiDie": true,
							"stressConfig": {
								"includeOut": true
							},
							"notes": "",
							"reservedSlots": 6,
							"colSpan": 2,
							"columnSpan": 2
						}
					},
					"traits": [
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						}
					],
					"sfx": []
				},
				{
					"id": "drives",
					"name": "Drives",
					"description": "Gain a PP when you use a drive rated at d4.",
					"nounSingular": "Drive",
					"nounPlural": "Drives",
					"ratingPosition": "below",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"header": "top",
							"headerAlign": "center",
							"features": {
								"description": false,
								"sfx": false,
								"subtraits": false
							},
							"location": "left",
							"page": 1,
							"style": {
								"header": "default",
								"body": "default"
							},
							"ratingPosition": "below",
							"ratingScale": [
								4,
								6,
								8,
								10,
								12
							],
							"multiDie": false,
							"stressConfig": {
								"includeOut": true
							},
							"notes": "",
							"reservedSlots": 5
						}
					},
					"traits": [
						{
							"name": "Corruption",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Greed",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Omerta",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Retribution",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Violence",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						}
					],
					"sfx": []
				},
				{
					"id": "signature-assets",
					"name": "Signature Assets",
					"description": "Personal weapons, vehicles, and syndicate perks",
					"nounSingular": "Signature Asset",
					"nounPlural": "Signature Assets",
					"ratingPosition": "inline",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"header": "top",
							"headerAlign": "center",
							"features": {
								"description": false,
								"sfx": false,
								"subtraits": false
							},
							"location": "left",
							"page": 1,
							"style": {
								"header": "default",
								"body": "default"
							},
							"ratingScale": [
								6,
								8,
								10,
								12
							],
							"multiDie": false,
							"stressConfig": {
								"includeOut": true
							},
							"notes": "",
							"reservedSlots": 3
						}
					},
					"traits": [
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						}
					],
					"sfx": []
				},
				{
					"id": "roles-specialties",
					"name": "Roles & Specialties",
					"description": "Syndicate roles with specialized criminal expertise",
					"nounSingular": "Role",
					"nounPlural": "Roles",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"header": "top",
							"headerAlign": "center",
							"features": {
								"description": false,
								"sfx": false,
								"subtraits": true
							},
							"location": "center",
							"page": 1,
							"style": {
								"header": "default",
								"body": "subtrait-columns"
							},
							"ratingScale": [
								4,
								6,
								8,
								10,
								12
							],
							"multiDie": false,
							"stressConfig": {
								"includeOut": true
							},
							"notes": "",
							"reservedSlots": 5
						}
					},
					"traits": [
						{
							"name": "Big Shot",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [
								{
									"name": "",
									"value": 0,
									"dice": [],
									"description": "",
									"tags": [],
									"custom": {},
									"traits": [],
									"sfx": []
								}
							],
							"sfx": []
						},
						{
							"name": "Brains",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [
								{
									"name": "",
									"value": 0,
									"dice": [],
									"description": "",
									"tags": [],
									"custom": {},
									"traits": [],
									"sfx": []
								}
							],
							"sfx": []
						},
						{
							"name": "Enforcer",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [
								{
									"name": "",
									"value": 0,
									"dice": [],
									"description": "",
									"tags": [],
									"custom": {},
									"traits": [],
									"sfx": []
								}
							],
							"sfx": []
						},
						{
							"name": "Thief",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [
								{
									"name": "",
									"value": 0,
									"dice": [],
									"description": "",
									"tags": [],
									"custom": {},
									"traits": [],
									"sfx": []
								}
							],
							"sfx": []
						},
						{
							"name": "Wheelman",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [
								{
									"name": "",
									"value": 0,
									"dice": [],
									"description": "",
									"tags": [],
									"custom": {},
									"traits": [],
									"sfx": []
								}
							],
							"sfx": []
						}
					],
					"sfx": []
				},
				{
					"id": "session-record",
					"name": "Session Record",
					"description": "Session tracking and milestone progression",
					"nounSingular": "Milestone",
					"nounPlural": "Milestones",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"header": "top",
							"headerAlign": "left",
							"features": {
								"description": false,
								"sfx": false,
								"subtraits": false
							},
							"location": "right",
							"page": 1,
							"style": {
								"header": "default",
								"body": "session-record"
							},
							"sessionRecord": {
								"count": 15
							},
							"multiDie": false,
							"stressConfig": {
								"includeOut": true
							},
							"notes": "",
							"reservedSlots": 15
						}
					},
					"traits": [],
					"sfx": []
				},
				{
					"id": "role-sfx",
					"name": "Role SFX",
					"description": "",
					"nounSingular": "SFX",
					"nounPlural": "SFX",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"header": "top",
							"headerAlign": "center",
							"features": {
								"description": true,
								"sfx": false,
								"subtraits": false
							},
							"location": "center",
							"page": 1,
							"style": {
								"header": "default",
								"body": "default"
							},
							"reservedSlots": 3
						}
					},
					"traits": [
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						}
					],
					"sfx": []
				}
			]
		}
	},
	{
		"id": "spotlight-eidolon-alpha",
		"version": 1,
		"title": "Eidolon Alpha",
		"subtitle": "Mythic Summoners & Living Eidolons",
		"spotlight": "Eidolon Alpha",
		"variant": "Character File",
		"pages": 1,
		"genre": "Fantasy / Summoning / Mythic",
		"description": "Vessels of ancient endarchs who manifest living eidolons. Features Roles (Warrior, Priest, Scout, Other), Attributes with Highlight and Stress (Courage, Grace, Guile, Reason, Vigor), Endarch, Role and Freeform Distinctions with Hinder, Endarch SFX with the Summon rite, a Summoned Eidolon power block, and an XP track.",
		"character": {
			"$schema": "https://cortex.engard.me/schema/0.1/character.schema.json",
			"version": "0.1",
			"id": "template-spotlight-eidolon-alpha",
			"isTemplate": true,
			"name": "",
			"game": "Eidolon Alpha",
			"description": "",
			"pronouns": "",
			"plotPoints": 1,
			"notes": "",
			"custom": {
				"cortexToolkit": {
					"pageCount": 1,
					"spotlight": "Eidolon Alpha",
					"style": {
						"hasAttributes": false
					},
					"sheetStyle": "spotlight",
					"columns": 2,
					"columnAlignment": "top-base",
					"columnOffsets": {
						"left": 0,
						"center": 0,
						"right": 0
					}
				}
			},
			"player": "",
			"portrait": {
				"url": "",
				"custom": {
					"cortexToolkit": {
						"size": "spotlight",
						"location": "header"
					}
				}
			},
			"traitSets": [
				{
					"id": "roles",
					"name": "Roles",
					"description": "Prime vocations and endarch callings",
					"nounSingular": "Role",
					"nounPlural": "Roles",
					"ratingPosition": "below",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"features": {
								"description": false,
								"sfx": false,
								"subtraits": false
							},
							"location": "left",
							"page": 1,
							"style": {
								"header": "default",
								"body": "default"
							},
							"multiDie": false,
							"ratingScale": [
								4,
								6,
								8,
								10,
								12
							],
							"stressConfig": {
								"includeOut": true
							},
							"notes": "",
							"reservedSlots": 4,
							"colWidth": 33
						}
					},
					"traits": [
						{
							"name": "Warrior",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Priest",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Scout",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Other",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						}
					],
					"sfx": []
				},
				{
					"id": "attributes",
					"name": "Attributes",
					"description": "Elemental selfhood with highlight circles and stress",
					"nounSingular": "Attribute",
					"nounPlural": "Attributes",
					"ratingPosition": "below",
					"hasQuestionedPip": true,
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"features": {
								"description": false,
								"sfx": false,
								"subtraits": false
							},
							"location": "left",
							"page": 1,
							"style": {
								"header": "default",
								"body": "default"
							},
							"multiDie": false,
							"ratingScale": [
								4,
								6,
								8,
								10,
								12
							],
							"attachedStress": {
								"enabled": true,
								"label": "STRESS",
								"ratingScale": [
									4,
									6,
									8,
									10,
									12
								],
								"includeOut": false
							},
							"stressConfig": {
								"includeOut": false
							},
							"notes": "",
							"reservedSlots": 5,
							"attributesRing": false,
							"colWidth": 33
						}
					},
					"traits": [
						{
							"name": "Courage",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Grace",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Guile",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Reason",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Vigor",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						}
					],
					"sfx": []
				},
				{
					"id": "endarch-distinction",
					"name": "Endarch Distinction",
					"description": "Ancestral endarch patron and its three bound powers",
					"nounSingular": "Endarch Distinction",
					"nounPlural": "Endarch Distinctions",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"features": {
								"description": true,
								"sfx": true,
								"subtraits": true
							},
							"location": "right",
							"page": 1,
							"style": {
								"header": "distinctions",
								"body": "distinctions"
							},
							"multiDie": false,
							"ratingScale": [
								8
							],
							"subtraitRatingScale": [
								8
							],
							"stressConfig": {
								"includeOut": true
							},
							"notes": "",
							"reservedSlots": 1
						}
					},
					"traits": [
						{
							"name": "",
							"value": 8,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [
								{
									"name": "Power 1",
									"value": 8,
									"dice": [],
									"description": "",
									"tags": [],
									"custom": {},
									"traits": [],
									"sfx": []
								},
								{
									"name": "Power 2",
									"value": 8,
									"dice": [],
									"description": "",
									"tags": [],
									"custom": {},
									"traits": [],
									"sfx": []
								},
								{
									"name": "Power 3",
									"value": 8,
									"dice": [],
									"description": "",
									"tags": [],
									"custom": {},
									"traits": [],
									"sfx": []
								}
							],
							"sfx": [
								{
									"name": "Hinder",
									"description": "Gain a PP when you switch out your endarch distinction's rating of d8 for a d4."
								},
								{
									"name": "",
									"description": "",
									"tags": [],
									"custom": {}
								},
								{
									"name": "",
									"description": "",
									"tags": [],
									"custom": {}
								},
								{
									"name": "",
									"description": "",
									"tags": [],
									"custom": {}
								},
								{
									"name": "Summon",
									"description": "Shut down this endarch distinction to summon your Eidolon on your next turn."
								}
							]
						}
					],
					"sfx": []
				},
				{
					"id": "summoned-eidolon",
					"name": "Summoned Eidolon",
					"description": "Manifested eidolon form: base trait, scale, powers, highlights",
					"nounSingular": "Eidolon Trait",
					"nounPlural": "Eidolon Traits",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"header": "top",
							"headerAlign": "center",
							"features": {
								"description": true,
								"sfx": false,
								"subtraits": true
							},
							"location": "right",
							"page": 1,
							"style": {
								"header": "default",
								"body": "default"
							},
							"multiDie": true,
							"ratingScale": [
								4,
								8,
								10,
								12
							],
							"stressConfig": {
								"includeOut": true
							},
							"notes": "",
							"reservedSlots": 5
						}
					},
					"traits": [
						{
							"name": "Base Trait",
							"value": 10,
							"dice": [
								10,
								10
							],
							"description": "d10 d10 or d4 d4",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Scale",
							"value": 8,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Power 1",
							"value": 12,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Power 2",
							"value": 12,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Power 3",
							"value": 12,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Highlight Attribute 1",
							"value": 12,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Highlight Attribute 2",
							"value": 12,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						}
					],
					"sfx": []
				},
				{
					"id": "role-freeform-distinctions",
					"name": "Role & Freeform Distinctions",
					"description": "Chosen calling and personal definition",
					"nounSingular": "Distinction",
					"nounPlural": "Distinctions",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"features": {
								"description": true,
								"sfx": true,
								"subtraits": false
							},
							"location": "right",
							"page": 1,
							"style": {
								"header": "distinctions",
								"body": "distinctions"
							},
							"multiDie": false,
							"ratingScale": [
								8
							],
							"stressConfig": {
								"includeOut": true
							},
							"notes": "",
							"reservedSlots": 2
						}
					},
					"traits": [
						{
							"name": "Role Distinction",
							"value": 8,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": [
								"hinder"
							]
						},
						{
							"name": "Freeform Distinction",
							"value": 8,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": [
								"hinder"
							]
						}
					],
					"sfx": []
				},
				{
					"id": "xp",
					"name": "XP",
					"description": "Experience points bubble track",
					"nounSingular": "XP",
					"nounPlural": "XP",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"header": "top",
							"headerAlign": "center",
							"features": {
								"description": false,
								"sfx": false,
								"subtraits": false
							},
							"location": "right",
							"page": 1,
							"style": {
								"header": "default",
								"body": "pips"
							},
							"multiDie": false,
							"stressConfig": {
								"includeOut": true
							},
							"notes": "",
							"reservedSlots": 0,
							"pipsConfig": {
								"rows": 2,
								"perRow": 10,
								"filled": 0
							},
							"pips": {
								"count": 20,
								"perRow": 10,
								"connected": true,
								"filled": 0
							}
						}
					},
					"traits": [],
					"sfx": []
				}
			]
		}
	},
	{
		"id": "spotlight-hammerheads-character",
		"version": 1,
		"title": "Hammerheads",
		"subtitle": "Disaster Response & Rescue Pilots",
		"spotlight": "Hammerheads",
		"variant": "Character File",
		"pages": 2,
		"genre": "Action / Rescue / Drama",
		"description": "Hammerhead rescue pilots who run toward the crisis. Features Attributes with Stress (Physical, Mental, Social), 14 Training Packages, three Distinctions with Hinder and crisis-pool SFX, seven Relationships, an XP track, and page 2 Crisis Pools. Pair with the Hammerheads Vehicle File template.",
		"character": {
			"$schema": "https://cortex.engard.me/schema/0.1/character.schema.json",
			"version": "0.1",
			"id": "template-spotlight-hammerheads-character",
			"isTemplate": true,
			"name": "",
			"game": "Hammerheads",
			"description": "",
			"pronouns": "",
			"plotPoints": 1,
			"notes": "",
			"custom": {
				"cortexToolkit": {
					"pageCount": 2,
					"spotlight": "Hammerheads",
					"style": {
						"hasAttributes": false
					},
					"sheetStyle": "spotlight",
					"columns": 2,
					"watermark": {
						"enabled": true,
						"url": "images/cortex_prime_logo_light_transparent.png",
						"opacity": 0.08,
						"scale": 70,
						"page": "all"
					},
					"columnAlignment": "top-base",
					"columnOffsets": {
						"left": 0,
						"center": 0,
						"right": 0
					}
				}
			},
			"player": "",
			"portrait": {
				"url": "",
				"custom": {
					"cortexToolkit": {
						"size": "spotlight",
						"location": "header"
					}
				}
			},
			"traitSets": [
				{
					"id": "attributes",
					"name": "Attributes",
					"description": "Body, mind, and presence under pressure",
					"nounSingular": "Attribute",
					"nounPlural": "Attributes",
					"ratingPosition": "below",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"features": {
								"description": false,
								"sfx": false,
								"subtraits": false
							},
							"location": "left",
							"page": 1,
							"style": {
								"header": "default",
								"body": "default"
							},
							"ratingPosition": "below",
							"ratingScale": [
								4,
								6,
								8,
								10,
								12
							],
							"attachedStress": {
								"enabled": true,
								"label": "STRESS",
								"ratingScale": [
									4,
									6,
									8,
									10,
									12
								],
								"scale": [
									4,
									6,
									8,
									10,
									12
								],
								"includeOut": false
							},
							"multiDie": false,
							"stressConfig": {
								"includeOut": false
							},
							"notes": "",
							"reservedSlots": 3,
							"attributesRing": false,
							"colWidth": 36
						}
					},
					"traits": [
						{
							"name": "Physical",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Mental",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Social",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						}
					],
					"sfx": []
				},
				{
					"id": "training-packages",
					"name": "Training Packages",
					"description": "Rescue disciplines and vehicle qualifications",
					"nounSingular": "Training Package",
					"nounPlural": "Training Packages",
					"ratingPosition": "below",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"features": {
								"description": false,
								"sfx": false,
								"subtraits": false
							},
							"location": "left",
							"page": 1,
							"style": {
								"header": "default",
								"body": "default"
							},
							"ratingPosition": "below",
							"ratingScale": [
								4,
								6,
								8,
								10,
								12
							],
							"multiDie": false,
							"stressConfig": {
								"includeOut": true
							},
							"notes": "",
							"reservedSlots": 14,
							"colWidth": 36
						}
					},
					"traits": [
						{
							"name": "Crowd Control",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Emergency Medical",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Firefighting",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Hammerhead Pilot",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "HAZMAT",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "High-Altitude Recovery",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Legal Specialist",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Logistics",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Marine Recovery",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Network Specialist",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Mechanic",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Tactical Response",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Technical Analyst",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Urban Recovery",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						}
					],
					"sfx": []
				},
				{
					"id": "distinctions",
					"name": "Distinctions",
					"description": "Origin, true nature, and defining quirk",
					"nounSingular": "Distinction",
					"nounPlural": "Distinctions",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"features": {
								"description": true,
								"sfx": true,
								"subtraits": false
							},
							"location": "right",
							"page": 1,
							"style": {
								"header": "distinctions",
								"body": "distinctions"
							},
							"ratingScale": [
								8
							],
							"multiDie": false,
							"stressConfig": {
								"includeOut": true
							},
							"notes": "",
							"reservedSlots": 3
						}
					},
					"traits": [
						{
							"name": "Your Life Before:",
							"value": 8,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": [
								{
									"name": "Hinder",
									"description": "Gain a PP when you switch out your distinction's rating of d8 for a d4."
								},
								{
									"name": "Connect",
									"description": "Spend a PP to step up an attribute when you connect to your old life."
								},
								{
									"name": "Overdrive",
									"description": "Add d6 to the crisis pool to double your attribute die when you connect to your old life."
								}
							]
						},
						{
							"name": "Your Approach/Attitude:",
							"value": 8,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": [
								{
									"name": "Hinder",
									"description": "Gain a PP when you switch out your distinction's rating of d8 for a d4."
								},
								{
									"name": "True Nature",
									"description": "Spend a PP to reroll your dice when you align with your true nature."
								},
								{
									"name": "Push Limits",
									"description": "Add d6 to the crisis pool to step up your training package die when you align with your true nature."
								}
							]
						},
						{
							"name": "Your Quirk/Quality:",
							"value": 8,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": [
								{
									"name": "Hinder",
									"description": "Gain a PP when you switch out your distinction's rating of d8 for a d4."
								},
								{
									"name": "Embrace",
									"description": "Spend a PP to double your relationship die when your assistance embraces your quirk or quality."
								},
								{
									"name": "Escalate",
									"description": "Add d6 to the crisis pool to step up a relationship die you include in your pool when you embrace your quirk or quality."
								}
							]
						}
					],
					"sfx": []
				},
				{
					"id": "relationships",
					"name": "Relationships",
					"description": "Crew bonds, debts, and troublemakers",
					"nounSingular": "Relationship",
					"nounPlural": "Relationships",
					"statement": true,
					"ratingPosition": "inline",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"features": {
								"description": true,
								"sfx": false,
								"subtraits": false
							},
							"location": "right",
							"page": 1,
							"style": {
								"header": "default",
								"body": "default"
							},
							"ratingScale": [
								4,
								6,
								8,
								10,
								12
							],
							"multiDie": false,
							"stressConfig": {
								"includeOut": true
							},
							"notes": "",
							"reservedSlots": 7
						}
					},
					"traits": [
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "saved my life",
							"statement": "saved my life",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "owes me big",
							"statement": "owes me big",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "is a troublemaker",
							"statement": "is a troublemaker",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "knows their stuff",
							"statement": "knows their stuff",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "is a liability",
							"statement": "is a liability",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "is dependable",
							"statement": "is dependable",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "is good for a laugh",
							"statement": "is good for a laugh",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						}
					],
					"sfx": []
				},
				{
					"id": "xp",
					"name": "XP",
					"description": "Experience points bubble track",
					"nounSingular": "XP",
					"nounPlural": "XP",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"header": "top",
							"headerAlign": "center",
							"features": {
								"description": false,
								"sfx": false,
								"subtraits": false
							},
							"location": "right",
							"page": 1,
							"style": {
								"header": "default",
								"body": "pips"
							},
							"multiDie": false,
							"stressConfig": {
								"includeOut": true
							},
							"notes": "",
							"reservedSlots": 0,
							"pipsConfig": {
								"rows": 2,
								"perRow": 10,
								"filled": 0
							},
							"pips": {
								"count": 20,
								"perRow": 10,
								"connected": true,
								"filled": 0
							}
						}
					},
					"traits": [],
					"sfx": []
				},
				{
					"id": "crisis-pools",
					"name": "Crisis Pools",
					"description": "Threat clocks and escalating disaster pools",
					"nounSingular": "Crisis Pool",
					"nounPlural": "Crisis Pools",
					"ratingPosition": "above",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"header": "top",
							"headerAlign": "left",
							"traitColumns": 2,
							"features": {
								"description": true,
								"sfx": false,
								"subtraits": false
							},
							"location": "left",
							"page": 2,
							"style": {
								"header": "default",
								"body": "default"
							},
							"ratingScale": [
								6,
								8,
								10,
								12
							],
							"multiDie": true,
							"stressConfig": {
								"includeOut": true
							},
							"notes": "",
							"reservedSlots": 4,
							"colSpan": "full",
							"columnSpan": "full"
						}
					},
					"traits": [
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						}
					],
					"sfx": []
				}
			]
		}
	},
	{
		"id": "spotlight-hammerheads-vehicle",
		"version": 1,
		"title": "Hammerheads - Vehicle File",
		"subtitle": "Rescue Craft & Fleet Support",
		"spotlight": "Hammerheads",
		"variant": "Vehicle File",
		"pages": 1,
		"genre": "Action / Rescue / Vehicles",
		"description": "The three Hammerhead rescue craft and their fleet support web. Features Hammerhead Attributes (Systems/Engines/Frame for Hammerheads One, Two, and Three with fixed starting ratings), three Vehicle Distinctions with shared Hinder, and six multi-die Resource Pools (Unassigned, Tactical, Medical, IT/Network, Food/Shelter, Land/Sea/Air).",
		"character": {
			"$schema": "https://cortex.engard.me/schema/0.1/character.schema.json",
			"version": "0.1",
			"id": "template-spotlight-hammerheads-vehicle",
			"isTemplate": true,
			"name": "",
			"game": "Hammerheads",
			"description": "",
			"pronouns": "",
			"plotPoints": 1,
			"notes": "",
			"custom": {
				"cortexToolkit": {
					"pageCount": 1,
					"spotlight": "Hammerheads",
					"style": {
						"hasAttributes": false
					},
					"sheetStyle": "spotlight",
					"columns": 2,
					"columnAlignment": "top-base",
					"columnOffsets": {
						"left": 0,
						"center": 0,
						"right": 0
					}
				}
			},
			"player": "",
			"portrait": {
				"url": "",
				"custom": {
					"cortexToolkit": {
						"size": "spotlight",
						"location": "header"
					}
				}
			},
			"traitSets": [
				{
					"id": "hammerhead-attributes",
					"name": "Hammerhead Attributes",
					"description": "Rescue craft airframes, systems, and handling",
					"nounSingular": "Hammerhead Attribute",
					"nounPlural": "Hammerhead Attributes",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"features": {
								"description": true,
								"sfx": false,
								"subtraits": true
							},
							"location": "left",
							"page": 1,
							"style": {
								"header": "default",
								"body": "default"
							},
							"ratingScale": [
								8,
								10
							],
							"subtraitRatingScale": [
								8,
								10
							],
							"multiDie": false,
							"stressConfig": {
								"includeOut": true
							},
							"notes": "",
							"reservedSlots": 3,
							"colWidth": 32
						}
					},
					"traits": [
						{
							"name": "Hammerhead One",
							"value": 0,
							"dice": [],
							"description": "More agile, possesses more precise sensors and instruments.",
							"tags": [],
							"custom": {},
							"traits": [
								{
									"name": "Systems",
									"value": 10,
									"dice": [],
									"description": "",
									"tags": [],
									"custom": {},
									"traits": [],
									"sfx": []
								},
								{
									"name": "Engines",
									"value": 8,
									"dice": [],
									"description": "",
									"tags": [],
									"custom": {},
									"traits": [],
									"sfx": []
								},
								{
									"name": "Frame",
									"value": 8,
									"dice": [],
									"description": "",
									"tags": [],
									"custom": {},
									"traits": [],
									"sfx": []
								}
							],
							"sfx": []
						},
						{
							"name": "Hammerhead Two",
							"value": 0,
							"dice": [],
							"description": "Faster, more power and range.",
							"tags": [],
							"custom": {},
							"traits": [
								{
									"name": "Systems",
									"value": 8,
									"dice": [],
									"description": "",
									"tags": [],
									"custom": {},
									"traits": [],
									"sfx": []
								},
								{
									"name": "Engines",
									"value": 10,
									"dice": [],
									"description": "",
									"tags": [],
									"custom": {},
									"traits": [],
									"sfx": []
								},
								{
									"name": "Frame",
									"value": 8,
									"dice": [],
									"description": "",
									"tags": [],
									"custom": {},
									"traits": [],
									"sfx": []
								}
							],
							"sfx": []
						},
						{
							"name": "Hammerhead Three",
							"value": 0,
							"dice": [],
							"description": "Bigger, tougher, and more rugged.",
							"tags": [],
							"custom": {},
							"traits": [
								{
									"name": "Systems",
									"value": 8,
									"dice": [],
									"description": "",
									"tags": [],
									"custom": {},
									"traits": [],
									"sfx": []
								},
								{
									"name": "Engines",
									"value": 8,
									"dice": [],
									"description": "",
									"tags": [],
									"custom": {},
									"traits": [],
									"sfx": []
								},
								{
									"name": "Frame",
									"value": 10,
									"dice": [],
									"description": "",
									"tags": [],
									"custom": {},
									"traits": [],
									"sfx": []
								}
							],
							"sfx": []
						}
					],
					"sfx": []
				},
				{
					"id": "vehicle-distinctions",
					"name": "Vehicle Distinctions",
					"description": "Factory blessings and fleet reputation",
					"nounSingular": "Vehicle Distinction",
					"nounPlural": "Vehicle Distinctions",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"features": {
								"description": false,
								"sfx": false,
								"subtraits": false
							},
							"location": "right",
							"page": 1,
							"style": {
								"header": "distinctions",
								"body": "distinctions"
							},
							"ratingScale": [
								8
							],
							"multiDie": false,
							"stressConfig": {
								"includeOut": true
							},
							"notes": "",
							"reservedSlots": 3,
							"sharedHinder": true,
							"sharedHinderText": "Gain a PP when you switch out your distinction's rating of d8 for a d4."
						}
					},
					"traits": [
						{
							"name": "Resource Support Vehicle",
							"value": 8,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Top of the Line",
							"value": 8,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Broad-Spectrum Sensors",
							"value": 8,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						}
					],
					"sfx": []
				},
				{
					"id": "resource-pools",
					"name": "Resource Pools",
					"description": "Staged supplies, support teams, and fleet backup",
					"nounSingular": "Resource Pool",
					"nounPlural": "Resource Pools",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"traitColumns": 2,
							"features": {
								"description": false,
								"sfx": false,
								"subtraits": false
							},
							"location": "right",
							"page": 1,
							"style": {
								"header": "default",
								"body": "dice-count"
							},
							"ratingScale": [
								6
							],
							"multiDie": true,
							"stressConfig": {
								"includeOut": true
							},
							"notes": "",
							"reservedSlots": 6
						}
					},
					"traits": [
						{
							"name": "Unassigned Resources",
							"value": 6,
							"dice": [
								6,
								6,
								6,
								6,
								6,
								6,
								6
							],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Tactical Support",
							"value": 6,
							"dice": [
								6,
								6,
								6,
								6
							],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Medical Supplies",
							"value": 6,
							"dice": [
								6,
								6,
								6,
								6
							],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "IT/Network Support",
							"value": 6,
							"dice": [
								6,
								6,
								6,
								6
							],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Food/Shelter",
							"value": 6,
							"dice": [
								6,
								6,
								6,
								6
							],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Land/Sea/Air Support",
							"value": 6,
							"dice": [
								6,
								6,
								6,
								6
							],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						}
					],
					"sfx": []
				}
			]
		}
	},
	{
		"id": "spotlight-inheritors-character",
		"version": 1,
		"title": "Inheritors",
		"subtitle": "Superpowered Dynasty Heritage",
		"spotlight": "Inheritors",
		"variant": "Character File",
		"pages": 1,
		"genre": "Superhero / Dynastic Drama",
		"description": "Descendants inheriting superhuman abilities and ancestral duties from heroic lineages. Features Attributes (Action, Heritage, Science, Weird), Stress, Distinctions with Family Ties SFX, Inherited Abilities, 14 Skills, Heirlooms, Milestones, and an XP grid.",
		"character": {
			"$schema": "https://cortex.engard.me/schema/0.1/character.schema.json",
			"version": "0.1",
			"id": "template-spotlight-inheritors-char",
			"isTemplate": true,
			"name": "",
			"game": "Inheritors",
			"description": "",
			"pronouns": "",
			"plotPoints": 1,
			"notes": "",
			"custom": {
				"cortexToolkit": {
					"pageCount": 1,
					"spotlight": "Inheritors",
					"style": {
						"hasAttributes": false
					},
					"sheetStyle": "spotlight",
					"columns": 3,
					"watermark": {
						"enabled": true,
						"url": "images/cortex_prime_logo_light_transparent.png",
						"opacity": 0.08,
						"scale": 70,
						"page": "all"
					},
					"columnAlignment": "top-base",
					"columnOffsets": {
						"left": 0,
						"center": 0,
						"right": 0
					}
				}
			},
			"player": "",
			"portrait": {
				"url": "",
				"custom": {
					"cortexToolkit": {
						"size": "spotlight",
						"location": "header"
					}
				}
			},
			"traitSets": [
				{
					"id": "attributes",
					"name": "Attributes",
					"description": "Gain a PP when you include your d4 attribute in your dice pool.",
					"nounSingular": "Attribute",
					"nounPlural": "Attributes",
					"ratingPosition": "below",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"features": {
								"description": false,
								"sfx": false,
								"subtraits": false
							},
							"location": "left",
							"page": 1,
							"style": {
								"header": "default",
								"body": "default"
							},
							"ratingPosition": "below",
							"ratingScale": [
								4,
								6,
								8,
								10
							],
							"multiDie": false,
							"stressConfig": {
								"includeOut": true
							},
							"notes": "",
							"reservedSlots": 4,
							"attributesRing": false,
							"colWidth": 28
						}
					},
					"traits": [
						{
							"name": "Action",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Heritage",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Science",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Weird",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						}
					],
					"sfx": []
				},
				{
					"id": "stress",
					"name": "Stress",
					"description": "",
					"nounSingular": "Stress",
					"nounPlural": "Stress",
					"ratingPosition": "below",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"header": "top",
							"headerAlign": "left",
							"features": {
								"description": false,
								"sfx": false,
								"subtraits": false
							},
							"location": "left",
							"page": 1,
							"style": {
								"header": "stress",
								"body": "stress"
							},
							"ratingScale": [
								4,
								6,
								8,
								10,
								12
							],
							"stressConfig": {
								"includeD4": true,
								"includeOut": false
							},
							"reservedSlots": 1,
							"colWidth": 28
						}
					},
					"traits": [
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						}
					],
					"sfx": []
				},
				{
					"id": "distinctions",
					"name": "Distinctions",
					"description": "Bloodline heritage, archetype, and personal stance",
					"nounSingular": "Distinction",
					"nounPlural": "Distinctions",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"features": {
								"description": true,
								"sfx": true,
								"subtraits": false
							},
							"location": "center",
							"colSpan": 2,
							"columnSpan": 2,
							"page": 1,
							"style": {
								"header": "distinctions",
								"body": "distinctions"
							},
							"sharedHinder": true,
							"sharedHinderText": "Gain a PP when you trade out your distinction's d8 rating for a d4.",
							"ratingScale": [
								8
							],
							"multiDie": false,
							"stressConfig": {
								"includeOut": true
							},
							"notes": "",
							"reservedSlots": 3
						}
					},
					"traits": [
						{
							"name": "Family Tree",
							"value": 8,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": [
								"hinder",
								{
									"name": "Family Ties",
									"description": "Spend a PP to get aid or advice from a member of your family tree in the form of a d8 asset."
								},
								{
									"name": "",
									"description": "",
									"tags": [],
									"custom": {}
								}
							]
						},
						{
							"name": "Approach to Conflict",
							"value": 8,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": [
								"hinder",
								{
									"name": "",
									"description": "",
									"tags": [],
									"custom": {}
								},
								{
									"name": "",
									"description": "",
									"tags": [],
									"custom": {}
								}
							]
						},
						{
							"name": "Personality/Quirk",
							"value": 8,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": [
								"hinder",
								{
									"name": "",
									"description": "",
									"tags": [],
									"custom": {}
								},
								{
									"name": "",
									"description": "",
									"tags": [],
									"custom": {}
								}
							]
						}
					],
					"sfx": []
				},
				{
					"id": "inherited-abilities",
					"name": "Abilities",
					"description": "Powers granted by bloodline and relics",
					"nounSingular": "Ability",
					"nounPlural": "Abilities",
					"ratingPosition": "below",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"traitColumns": 3,
							"features": {
								"description": true,
								"sfx": true,
								"subtraits": true
							},
							"location": "left",
							"page": 1,
							"style": {
								"header": "default",
								"body": "default"
							},
							"ratingScale": [
								6,
								8,
								10,
								12
							],
							"multiDie": false,
							"stressConfig": {
								"includeOut": true
							},
							"notes": "",
							"reservedSlots": 3,
							"colSpan": "full",
							"columnSpan": "full"
						}
					},
					"traits": [
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [
								{
									"name": "Effect Tags:",
									"value": 0,
									"dice": [],
									"description": "",
									"tags": [],
									"custom": {},
									"traits": [],
									"sfx": []
								},
								{
									"name": "Limit:",
									"value": 0,
									"dice": [],
									"description": "",
									"tags": [],
									"custom": {},
									"traits": [],
									"sfx": []
								}
							],
							"sfx": [
								{
									"name": "",
									"description": "",
									"tags": [],
									"custom": {}
								},
								{
									"name": "",
									"description": "",
									"tags": [],
									"custom": {}
								}
							]
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [
								{
									"name": "Effect Tags:",
									"value": 0,
									"dice": [],
									"description": "",
									"tags": [],
									"custom": {},
									"traits": [],
									"sfx": []
								},
								{
									"name": "Limit:",
									"value": 0,
									"dice": [],
									"description": "",
									"tags": [],
									"custom": {},
									"traits": [],
									"sfx": []
								}
							],
							"sfx": [
								{
									"name": "",
									"description": "",
									"tags": [],
									"custom": {}
								},
								{
									"name": "",
									"description": "",
									"tags": [],
									"custom": {}
								}
							]
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [
								{
									"name": "Effect Tags:",
									"value": 0,
									"dice": [],
									"description": "",
									"tags": [],
									"custom": {},
									"traits": [],
									"sfx": []
								},
								{
									"name": "Limit:",
									"value": 0,
									"dice": [],
									"description": "",
									"tags": [],
									"custom": {},
									"traits": [],
									"sfx": []
								}
							],
							"sfx": [
								{
									"name": "",
									"description": "",
									"tags": [],
									"custom": {}
								},
								{
									"name": "",
									"description": "",
									"tags": [],
									"custom": {}
								}
							]
						}
					],
					"sfx": []
				},
				{
					"id": "skills",
					"name": "Skills",
					"description": "Training and mundane competencies",
					"nounSingular": "Skill",
					"nounPlural": "Skills",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"header": "top",
							"headerAlign": "left",
							"features": {
								"description": false,
								"sfx": false,
								"subtraits": false
							},
							"location": "left",
							"page": 1,
							"style": {
								"header": "default",
								"body": "default"
							},
							"ratingScale": [
								4,
								6,
								8,
								10,
								12
							],
							"multiDie": false,
							"stressConfig": {
								"includeOut": true
							},
							"notes": "",
							"reservedSlots": 14,
							"rowBreak": true
						}
					},
					"traits": [
						{
							"name": "Acquire",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Build",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Charm",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Fight",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Investigate",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Move",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Perform",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Pilot",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Shoot",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Sneak",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Study",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Survive",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Treat",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Trick",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						}
					],
					"sfx": []
				},
				{
					"id": "heirlooms-milestones",
					"name": "Heirlooms",
					"description": "Item: Oh, There It Is. Spend a PP to declare that the item, if you didn't have it at the beginning of the scene, is now in your possession despite it being narratively improbable.\nVehicle: I'm Here! Spend a PP to use a vehicle to enter any scene that the vehicle can get you to.\nBase: Resourceful. Spend a PP to reveal that you have brought something useful from your base, thus allowing you to roll the heirloom in subsequent related actions.\nPet: Proxy. Spend a PP to affect a scene where you aren't physically present but your pet is. While you build your dice pool as normal, you're limited to actions your pet can perform.",
					"nounSingular": "Heirloom",
					"nounPlural": "Heirlooms",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"header": "top",
							"headerAlign": "left",
							"features": {
								"description": true,
								"sfx": false,
								"subtraits": false
							},
							"location": "center",
							"page": 1,
							"style": {
								"header": "default",
								"body": "default"
							},
							"ratingScale": [
								6,
								8,
								10,
								12
							],
							"multiDie": false,
							"stressConfig": {
								"includeOut": true
							},
							"notes": "",
							"reservedSlots": 4
						}
					},
					"traits": [
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						}
					],
					"sfx": []
				},
				{
					"id": "milestones",
					"name": "Milestones",
					"description": "",
					"nounSingular": "Milestone",
					"nounPlural": "Milestones",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"header": "top",
							"headerAlign": "left",
							"features": {
								"description": false,
								"sfx": false,
								"subtraits": false
							},
							"location": "right",
							"page": 1,
							"style": {
								"header": "default",
								"body": "notes"
							},
							"notes": "### PERSONAL:\n- **1 XP** when \n- **3 XP** when \n- **10 XP** when \n\n### GROUP:\n- **1 XP** when \n- **3 XP** when \n- **10 XP** when "
						}
					},
					"traits": [],
					"sfx": []
				},
				{
					"id": "xp",
					"name": "XP",
					"description": "",
					"nounSingular": "Pip",
					"nounPlural": "Pips",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"features": {
								"description": false,
								"sfx": false,
								"subtraits": false
							},
							"location": "right",
							"page": 1,
							"style": {
								"header": "default",
								"body": "pips"
							},
							"pipsConfig": {
								"rows": 5,
								"perRow": 5,
								"filled": 0
							},
							"pips": {
								"count": 25,
								"perRow": 5,
								"connected": true,
								"filled": 0
							}
						}
					},
					"traits": [],
					"sfx": []
				}
			]
		}
	},
	{
		"id": "spotlight-inheritors-family",
		"version": 1,
		"title": "Inheritors - Family & GMCs",
		"subtitle": "Superpowered Dynasty Heritage",
		"spotlight": "Inheritors",
		"variant": "Family Tree File",
		"pages": 2,
		"genre": "Superhero / Dynastic Drama",
		"description": "Family tree worksheet and GMC roster for Inheritors dynasties. Tracks the First Five Branches, Wild Card Branches, and generation relations across PCs, Parents, Grandparents, and Group Family GMCs.",
		"character": {
			"$schema": "https://cortex.engard.me/schema/0.1/character.schema.json",
			"version": "0.1",
			"id": "template-spotlight-inheritors-family",
			"isTemplate": true,
			"name": "",
			"game": "Inheritors",
			"description": "",
			"pronouns": "",
			"plotPoints": 1,
			"notes": "",
			"custom": {
				"cortexToolkit": {
					"pageCount": 2,
					"spotlight": "Inheritors",
					"style": {
						"hasAttributes": false
					},
					"sheetStyle": "spotlight",
					"columns": 2,
					"watermark": {
						"enabled": true,
						"url": "images/cortex_prime_logo_light_transparent.png",
						"opacity": 0.08,
						"scale": 70,
						"page": "all"
					},
					"columnAlignment": "top-base",
					"columnOffsets": {
						"left": 0,
						"center": 0,
						"right": 0
					}
				}
			},
			"player": "",
			"portrait": {
				"url": "",
				"custom": {
					"cortexToolkit": {
						"size": "spotlight",
						"location": "header"
					}
				}
			},
			"traitSets": [
				{
					"id": "your-generation",
					"name": "Your Generation",
					"description": "",
					"nounSingular": "Detail",
					"nounPlural": "Details",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"header": "top",
							"headerAlign": "left",
							"features": {
								"description": true,
								"sfx": false,
								"subtraits": false
							},
							"location": "left",
							"page": 1,
							"style": {
								"header": "labeled-fields",
								"body": "labeled-fields"
							},
							"colSpan": "full",
							"columnSpan": "full"
						}
					},
					"traits": [
						{
							"name": "Name",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Description",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Fame",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Features",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Deed",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Current Fate",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						}
					],
					"sfx": []
				},
				{
					"id": "parents-generation-a",
					"name": "Parents' Generation",
					"description": "",
					"nounSingular": "Detail",
					"nounPlural": "Details",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"header": "top",
							"headerAlign": "left",
							"features": {
								"description": true,
								"sfx": false,
								"subtraits": false
							},
							"location": "left",
							"page": 1,
							"style": {
								"header": "labeled-fields",
								"body": "labeled-fields"
							}
						}
					},
					"traits": [
						{
							"name": "Name",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Description",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Fame",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Features",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Deed",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Current Fate",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						}
					],
					"sfx": []
				},
				{
					"id": "parents-generation-b",
					"name": "Parents' Generation",
					"description": "",
					"nounSingular": "Detail",
					"nounPlural": "Details",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"header": "top",
							"headerAlign": "left",
							"features": {
								"description": true,
								"sfx": false,
								"subtraits": false
							},
							"location": "right",
							"page": 1,
							"style": {
								"header": "labeled-fields",
								"body": "labeled-fields"
							}
						}
					},
					"traits": [
						{
							"name": "Name",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Description",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Fame",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Features",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Deed",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Current Fate",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						}
					],
					"sfx": []
				},
				{
					"id": "grandparents-generation-a",
					"name": "Grandparents' Generation",
					"description": "",
					"nounSingular": "Detail",
					"nounPlural": "Details",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"header": "top",
							"headerAlign": "left",
							"features": {
								"description": true,
								"sfx": false,
								"subtraits": false
							},
							"location": "left",
							"page": 1,
							"style": {
								"header": "labeled-fields",
								"body": "labeled-fields"
							}
						}
					},
					"traits": [
						{
							"name": "Name",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Description",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Fame",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Features",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Deed",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Current Fate",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						}
					],
					"sfx": []
				},
				{
					"id": "grandparents-generation-b",
					"name": "Grandparents' Generation",
					"description": "",
					"nounSingular": "Detail",
					"nounPlural": "Details",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"header": "top",
							"headerAlign": "left",
							"features": {
								"description": true,
								"sfx": false,
								"subtraits": false
							},
							"location": "right",
							"page": 1,
							"style": {
								"header": "labeled-fields",
								"body": "labeled-fields"
							}
						}
					},
					"traits": [
						{
							"name": "Name",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Description",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Fame",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Features",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Deed",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Current Fate",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						}
					],
					"sfx": []
				},
				{
					"id": "wild-card-a",
					"name": "Wild Card Branch",
					"description": "",
					"nounSingular": "Detail",
					"nounPlural": "Details",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"header": "top",
							"headerAlign": "left",
							"features": {
								"description": true,
								"sfx": false,
								"subtraits": false
							},
							"location": "left",
							"page": 1,
							"style": {
								"header": "labeled-fields",
								"body": "labeled-fields"
							},
							"colSpan": "full",
							"columnSpan": "full"
						}
					},
					"traits": [
						{
							"name": "Name",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Description",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Fame",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Features",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Deed",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Current Fate",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						}
					],
					"sfx": []
				},
				{
					"id": "wild-card-b",
					"name": "Wild Card Branch",
					"description": "",
					"nounSingular": "Detail",
					"nounPlural": "Details",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"header": "top",
							"headerAlign": "left",
							"features": {
								"description": true,
								"sfx": false,
								"subtraits": false
							},
							"location": "left",
							"page": 1,
							"style": {
								"header": "labeled-fields",
								"body": "labeled-fields"
							}
						}
					},
					"traits": [
						{
							"name": "Name",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Description",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Fame",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Features",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Deed",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Current Fate",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						}
					],
					"sfx": []
				},
				{
					"id": "wild-card-c",
					"name": "Wild Card Branch",
					"description": "",
					"nounSingular": "Detail",
					"nounPlural": "Details",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"header": "top",
							"headerAlign": "left",
							"features": {
								"description": true,
								"sfx": false,
								"subtraits": false
							},
							"location": "right",
							"page": 1,
							"style": {
								"header": "labeled-fields",
								"body": "labeled-fields"
							}
						}
					},
					"traits": [
						{
							"name": "Name",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Description",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Fame",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Features",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Deed",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Current Fate",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						}
					],
					"sfx": []
				},
				{
					"id": "wild-card-d",
					"name": "Wild Card Branch",
					"description": "",
					"nounSingular": "Detail",
					"nounPlural": "Details",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"header": "top",
							"headerAlign": "left",
							"features": {
								"description": true,
								"sfx": false,
								"subtraits": false
							},
							"location": "left",
							"page": 1,
							"style": {
								"header": "labeled-fields",
								"body": "labeled-fields"
							}
						}
					},
					"traits": [
						{
							"name": "Name",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Description",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Fame",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Features",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Deed",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Current Fate",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						}
					],
					"sfx": []
				},
				{
					"id": "wild-card-e",
					"name": "Wild Card Branch",
					"description": "",
					"nounSingular": "Detail",
					"nounPlural": "Details",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"header": "top",
							"headerAlign": "left",
							"features": {
								"description": true,
								"sfx": false,
								"subtraits": false
							},
							"location": "right",
							"page": 1,
							"style": {
								"header": "labeled-fields",
								"body": "labeled-fields"
							}
						}
					},
					"traits": [
						{
							"name": "Name",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Description",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Fame",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Features",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Deed",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Current Fate",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						}
					],
					"sfx": []
				},
				{
					"id": "gmc-a",
					"name": "GMC",
					"description": "",
					"nounSingular": "Detail",
					"nounPlural": "Details",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"header": "top",
							"headerAlign": "left",
							"features": {
								"description": true,
								"sfx": false,
								"subtraits": false
							},
							"location": "left",
							"page": 2,
							"style": {
								"header": "labeled-fields",
								"body": "labeled-fields"
							}
						}
					},
					"traits": [
						{
							"name": "Name",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Relationship to PCs",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Relationship to GMCs",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Description",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Fame",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Features",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Deed",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Current Fate",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						}
					],
					"sfx": []
				},
				{
					"id": "gmc-b",
					"name": "GMC",
					"description": "",
					"nounSingular": "Detail",
					"nounPlural": "Details",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"header": "top",
							"headerAlign": "left",
							"features": {
								"description": true,
								"sfx": false,
								"subtraits": false
							},
							"location": "right",
							"page": 2,
							"style": {
								"header": "labeled-fields",
								"body": "labeled-fields"
							}
						}
					},
					"traits": [
						{
							"name": "Name",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Relationship to PCs",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Relationship to GMCs",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Description",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Fame",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Features",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Deed",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Current Fate",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						}
					],
					"sfx": []
				},
				{
					"id": "gmc-c",
					"name": "GMC",
					"description": "",
					"nounSingular": "Detail",
					"nounPlural": "Details",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"header": "top",
							"headerAlign": "left",
							"features": {
								"description": true,
								"sfx": false,
								"subtraits": false
							},
							"location": "left",
							"page": 2,
							"style": {
								"header": "labeled-fields",
								"body": "labeled-fields"
							}
						}
					},
					"traits": [
						{
							"name": "Name",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Relationship to PCs",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Relationship to GMCs",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Description",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Fame",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Features",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Deed",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Current Fate",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						}
					],
					"sfx": []
				},
				{
					"id": "gmc-d",
					"name": "GMC",
					"description": "",
					"nounSingular": "Detail",
					"nounPlural": "Details",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"header": "top",
							"headerAlign": "left",
							"features": {
								"description": true,
								"sfx": false,
								"subtraits": false
							},
							"location": "right",
							"page": 2,
							"style": {
								"header": "labeled-fields",
								"body": "labeled-fields"
							}
						}
					},
					"traits": [
						{
							"name": "Name",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Relationship to PCs",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Relationship to GMCs",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Description",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Fame",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Features",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Deed",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Current Fate",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						}
					],
					"sfx": []
				},
				{
					"id": "gmc-e",
					"name": "GMC",
					"description": "",
					"nounSingular": "Detail",
					"nounPlural": "Details",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"header": "top",
							"headerAlign": "left",
							"features": {
								"description": true,
								"sfx": false,
								"subtraits": false
							},
							"location": "left",
							"page": 2,
							"style": {
								"header": "labeled-fields",
								"body": "labeled-fields"
							}
						}
					},
					"traits": [
						{
							"name": "Name",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Relationship to PCs",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Relationship to GMCs",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Description",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Fame",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Features",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Deed",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Current Fate",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						}
					],
					"sfx": []
				},
				{
					"id": "gmc-f",
					"name": "GMC",
					"description": "",
					"nounSingular": "Detail",
					"nounPlural": "Details",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"header": "top",
							"headerAlign": "left",
							"features": {
								"description": true,
								"sfx": false,
								"subtraits": false
							},
							"location": "right",
							"page": 2,
							"style": {
								"header": "labeled-fields",
								"body": "labeled-fields"
							}
						}
					},
					"traits": [
						{
							"name": "Name",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Relationship to PCs",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Relationship to GMCs",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Description",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Fame",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Features",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Deed",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Current Fate",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						}
					],
					"sfx": []
				}
			]
		}
	},
	{
		"id": "spotlight-kitbash-hero",
		"version": 1,
		"title": "KitBash",
		"subtitle": "Modular Comic Book Superheroes",
		"spotlight": "KitBash",
		"variant": "Hero File",
		"pages": 1,
		"genre": "Comic Book / Superhero",
		"description": "Comic book heroes customized with modular power sets, affiliations, distinctions, and specialties. Features Affiliations (Personal, Group, World), Distinctions (Personality, Past, Quirk), 3 Power Sets, Specialties, Signature Assets, Stress tracks, and Growth Pool.",
		"character": {
			"$schema": "https://cortex.engard.me/schema/0.1/character.schema.json",
			"version": "0.1",
			"id": "template-spotlight-kitbash-hero",
			"isTemplate": true,
			"name": "",
			"game": "KitBash",
			"description": "",
			"pronouns": "",
			"plotPoints": 1,
			"notes": "",
			"custom": {
				"cortexToolkit": {
					"pageCount": 1,
					"spotlight": "KitBash",
					"style": {
						"hasAttributes": false
					},
					"sheetStyle": "spotlight",
					"columns": 3,
					"watermark": {
						"enabled": true,
						"url": "images/cortex_prime_logo_light_transparent.png",
						"opacity": 0.08,
						"scale": 70,
						"page": "all"
					},
					"columnAlignment": "top-base",
					"columnOffsets": {
						"left": 0,
						"center": 0,
						"right": 0
					}
				}
			},
			"player": "",
			"portrait": {
				"url": "",
				"custom": {
					"cortexToolkit": {
						"size": "spotlight",
						"location": "header"
					}
				}
			},
			"traitSets": [
				{
					"id": "distinctions",
					"name": "Distinctions",
					"description": "Origin, motivation, and crime-fighting persona",
					"nounSingular": "Distinction",
					"nounPlural": "Distinctions",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"header": "top",
							"headerAlign": "left",
							"features": {
								"description": true,
								"sfx": false,
								"subtraits": false
							},
							"sharedHinder": true,
							"sharedHinderText": "Gain a PP when you trade out your distinction's d8 rating for a d4.",
							"location": "left",
							"page": 1,
							"style": {
								"header": "distinctions",
								"body": "distinctions"
							},
							"ratingScale": [
								8
							],
							"multiDie": false,
							"stressConfig": {
								"includeOut": true
							},
							"notes": "",
							"reservedSlots": 3
						}
					},
					"traits": [
						{
							"name": "Personality:",
							"value": 8,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": [
								"hinder"
							]
						},
						{
							"name": "Past:",
							"value": 8,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": [
								"hinder"
							]
						},
						{
							"name": "Quirk:",
							"value": 8,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": [
								"hinder"
							]
						}
					],
					"sfx": []
				},
				{
					"id": "affiliations",
					"name": "Affiliations",
					"description": "Operating mode ratings",
					"nounSingular": "Affiliation",
					"nounPlural": "Affiliations",
					"ratingPosition": "below",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"header": "top",
							"headerAlign": "left",
							"features": {
								"description": false,
								"sfx": false,
								"subtraits": false
							},
							"location": "center",
							"page": 1,
							"style": {
								"header": "default",
								"body": "default"
							},
							"ratingPosition": "below",
							"ratingScale": [
								6,
								8,
								10
							],
							"multiDie": false,
							"stressConfig": {
								"includeOut": true
							},
							"notes": "",
							"reservedSlots": 3
						}
					},
					"traits": [
						{
							"name": "Personal:",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Group:",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "World:",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						}
					],
					"sfx": []
				},
				{
					"id": "specialties",
					"name": "Specialties",
					"description": "Master and expert professional skills",
					"nounSingular": "Specialty",
					"nounPlural": "Specialties",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"header": "top",
							"headerAlign": "left",
							"features": {
								"description": false,
								"sfx": false,
								"subtraits": false
							},
							"location": "right",
							"page": 1,
							"style": {
								"header": "default",
								"body": "default"
							},
							"ratingScale": [
								8,
								10,
								12
							],
							"multiDie": false,
							"stressConfig": {
								"includeOut": true
							},
							"notes": "",
							"reservedSlots": 5
						}
					},
					"traits": [
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						}
					],
					"sfx": []
				},
				{
					"id": "signature-assets",
					"name": "Signature Assets",
					"description": "Heroic gear and vehicles",
					"nounSingular": "Signature Asset",
					"nounPlural": "Signature Assets",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"header": "top",
							"headerAlign": "left",
							"features": {
								"description": false,
								"sfx": false,
								"subtraits": false
							},
							"location": "left",
							"page": 1,
							"style": {
								"header": "default",
								"body": "default"
							},
							"ratingScale": [
								6,
								8,
								10,
								12
							],
							"multiDie": false,
							"stressConfig": {
								"includeOut": true
							},
							"notes": "",
							"reservedSlots": 3,
							"rowBreak": true
						}
					},
					"traits": [
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						}
					],
					"sfx": []
				},
				{
					"id": "stress",
					"name": "Stress",
					"description": "",
					"nounSingular": "Stress",
					"nounPlural": "Stress",
					"ratingPosition": "below",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"header": "top",
							"headerAlign": "left",
							"features": {
								"description": false,
								"sfx": false,
								"subtraits": false
							},
							"location": "center",
							"page": 1,
							"style": {
								"header": "stress",
								"body": "stress"
							},
							"ratingPosition": "below",
							"ratingScale": [
								4,
								6,
								8,
								10,
								12
							],
							"stressConfig": {
								"includeD4": true,
								"includeOut": false
							},
							"reservedSlots": 3
						}
					},
					"traits": [
						{
							"name": "Physical",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Mental",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Social",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						}
					],
					"sfx": []
				},
				{
					"id": "growth-pool",
					"name": "Growth Pool",
					"description": "",
					"nounSingular": "Growth Die",
					"nounPlural": "Growth Dice",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"header": "top",
							"headerAlign": "left",
							"features": {
								"description": false,
								"sfx": false,
								"subtraits": false
							},
							"location": "right",
							"page": 1,
							"style": {
								"header": "dice-ladder",
								"body": "dice-ladder"
							},
							"ratingScale": [
								4,
								6,
								8,
								10,
								12
							],
							"reservedSlots": 5
						}
					},
					"traits": [
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						}
					],
					"sfx": []
				},
				{
					"id": "power-set",
					"name": "Power Set 1",
					"description": "Modular powers, SFX triggers, and shutdown limits",
					"nounSingular": "Power Set",
					"nounPlural": "Power Sets",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"header": "top",
							"headerAlign": "left",
							"traitColumns": 2,
							"features": {
								"description": true,
								"sfx": false,
								"subtraits": false
							},
							"location": "left",
							"page": 1,
							"style": {
								"header": "labeled-fields",
								"body": "labeled-fields"
							},
							"multiDie": false,
							"stressConfig": {
								"includeOut": true
							},
							"notes": "",
							"reservedSlots": 3,
							"colSpan": "full",
							"columnSpan": "full"
						}
					},
					"traits": [
						{
							"name": "Powers",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Limits",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						}
					],
					"sfx": []
				},
				{
					"id": "power-set-2",
					"name": "Power Set 2",
					"description": "",
					"nounSingular": "Power",
					"nounPlural": "Powers",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"header": "top",
							"headerAlign": "left",
							"traitColumns": 2,
							"features": {
								"description": true,
								"sfx": false,
								"subtraits": false
							},
							"location": "left",
							"page": 1,
							"style": {
								"header": "labeled-fields",
								"body": "labeled-fields"
							},
							"colSpan": "full",
							"columnSpan": "full"
						}
					},
					"traits": [
						{
							"name": "Powers",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Limits",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						}
					],
					"sfx": []
				},
				{
					"id": "power-set-3",
					"name": "Power Set 3",
					"description": "",
					"nounSingular": "Power",
					"nounPlural": "Powers",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"header": "top",
							"headerAlign": "left",
							"traitColumns": 2,
							"features": {
								"description": true,
								"sfx": false,
								"subtraits": false
							},
							"location": "left",
							"page": 1,
							"style": {
								"header": "labeled-fields",
								"body": "labeled-fields"
							},
							"colSpan": "full",
							"columnSpan": "full"
						}
					},
					"traits": [
						{
							"name": "Powers",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Limits",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						}
					],
					"sfx": []
				}
			]
		}
	},
	{
		"id": "spotlight-kitbash-team",
		"version": 1,
		"title": "KitBash - Team File",
		"subtitle": "Modular Comic Book Superheroes",
		"spotlight": "KitBash",
		"variant": "Team Roster File",
		"pages": 1,
		"genre": "Comic Book / Superhero",
		"description": "Headquarters, team resources, and hero roster for superhero alliances in KitBash. Features Team Base details and 20 shared Team Resource boxes.",
		"character": {
			"$schema": "https://cortex.engard.me/schema/0.1/character.schema.json",
			"version": "0.1",
			"id": "template-spotlight-kitbash-team",
			"isTemplate": true,
			"name": "",
			"game": "KitBash",
			"description": "",
			"pronouns": "",
			"plotPoints": 1,
			"notes": "",
			"custom": {
				"cortexToolkit": {
					"pageCount": 1,
					"spotlight": "KitBash",
					"style": {
						"hasAttributes": false
					},
					"sheetStyle": "spotlight",
					"columns": 2,
					"watermark": {
						"enabled": true,
						"url": "images/cortex_prime_logo_light_transparent.png",
						"opacity": 0.08,
						"scale": 70,
						"page": "all"
					},
					"columnAlignment": "top-base",
					"columnOffsets": {
						"left": 0,
						"center": 0,
						"right": 0
					}
				}
			},
			"player": "",
			"portrait": {
				"url": "",
				"custom": {
					"cortexToolkit": {
						"size": "spotlight",
						"location": "header"
					}
				}
			},
			"traitSets": [
				{
					"id": "team-base",
					"name": "Team Base",
					"description": "As a group, decide on the following information.",
					"nounSingular": "Detail",
					"nounPlural": "Details",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"header": "top",
							"headerAlign": "left",
							"features": {
								"description": true,
								"sfx": false,
								"subtraits": false
							},
							"location": "left",
							"page": 1,
							"style": {
								"header": "labeled-fields",
								"body": "labeled-fields"
							},
							"colSpan": "full",
							"columnSpan": "full"
						}
					},
					"traits": [
						{
							"name": "Name",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Location",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Description",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Benefits",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Drawbacks",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						}
					],
					"sfx": []
				},
				{
					"id": "team-resources",
					"name": "Team Resources",
					"description": "Resources come from backgrounds (page 8) and are available for any PC to use.",
					"nounSingular": "Resource",
					"nounPlural": "Resources",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"header": "top",
							"headerAlign": "left",
							"traitColumns": 2,
							"features": {
								"description": true,
								"sfx": false,
								"subtraits": false
							},
							"location": "left",
							"page": 1,
							"style": {
								"header": "default",
								"body": "default"
							},
							"reservedSlots": 20,
							"colSpan": "full",
							"columnSpan": "full"
						}
					},
					"traits": [
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						}
					],
					"sfx": []
				}
			]
		}
	},
	{
		"id": "spotlight-misty-cove",
		"version": 1,
		"title": "Misty Cove",
		"subtitle": "Emotional Gothic Mystery",
		"spotlight": "Misty Cove",
		"variant": "Character File",
		"pages": 1,
		"genre": "Mystery / Drama / Supernatural",
		"description": "Residents of a foggy coastal town haunted by secrets and psychic tension. Features Distinctions (Extraordinary, Backstory, Role) with SFX, Emotional Attributes with Statements and Stress (Anger, Desire, Fear, Joy, Sorrow), Relationships, Signature Assets, Growth Pool, and Complications.",
		"character": {
			"$schema": "https://cortex.engard.me/schema/0.1/character.schema.json",
			"version": "0.1",
			"id": "template-spotlight-misty-cove",
			"isTemplate": true,
			"name": "",
			"game": "Misty Cove",
			"description": "",
			"pronouns": "",
			"plotPoints": 1,
			"notes": "",
			"custom": {
				"cortexToolkit": {
					"pageCount": 1,
					"spotlight": "Misty Cove",
					"style": {
						"hasAttributes": false
					},
					"sheetStyle": "spotlight",
					"columns": 2,
					"watermark": {
						"enabled": true,
						"url": "images/cortex_prime_logo_light_transparent.png",
						"opacity": 0.08,
						"scale": 70,
						"page": "all"
					},
					"columnAlignment": "top-base",
					"columnOffsets": {
						"left": 0,
						"center": 0,
						"right": 0
					}
				}
			},
			"player": "",
			"portrait": {
				"url": "",
				"custom": {
					"cortexToolkit": {
						"size": "spotlight",
						"location": "header"
					}
				}
			},
			"traitSets": [
				{
					"id": "distinctions",
					"name": "Distinctions",
					"description": "Coastal heritage, town role, and personal quirk",
					"nounSingular": "Distinction",
					"nounPlural": "Distinctions",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"features": {
								"description": true,
								"sfx": true,
								"subtraits": false
							},
							"sharedHinder": true,
							"sharedHinderText": "Gain a PP when you trade out your distinction's die rating for a d4.",
							"ratingScale": [
								8,
								10,
								12
							],
							"location": "left",
							"page": 1,
							"style": {
								"header": "distinctions",
								"body": "distinctions"
							},
							"multiDie": false,
							"stressConfig": {
								"includeOut": true
							},
							"notes": "",
							"reservedSlots": 3,
							"colWidth": 64
						}
					},
					"traits": [
						{
							"name": "Extraordinary:",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": [
								"hinder",
								{
									"name": "",
									"description": "",
									"tags": [],
									"custom": {}
								},
								{
									"name": "",
									"description": "",
									"tags": [],
									"custom": {}
								},
								{
									"name": "",
									"description": "",
									"tags": [],
									"custom": {}
								},
								{
									"name": "",
									"description": "",
									"tags": [],
									"custom": {}
								},
								{
									"name": "",
									"description": "",
									"tags": [],
									"custom": {}
								}
							]
						},
						{
							"name": "Backstory:",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Role:",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						}
					],
					"sfx": []
				},
				{
					"id": "signature-assets-curios",
					"name": "Signature Assets",
					"description": "Heirlooms and keepsakes from the misty coast",
					"nounSingular": "Signature Asset",
					"nounPlural": "Signature Assets",
					"ratingPosition": "above",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"features": {
								"description": true,
								"sfx": false,
								"subtraits": false
							},
							"location": "right",
							"page": 1,
							"style": {
								"header": "default",
								"body": "default"
							},
							"ratingPosition": "above",
							"ratingScale": [
								6,
								8,
								10,
								12
							],
							"multiDie": false,
							"stressConfig": {
								"includeOut": true
							},
							"notes": "",
							"reservedSlots": 3
						}
					},
					"traits": [
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						}
					],
					"sfx": []
				},
				{
					"id": "emotional-attributes-stress",
					"name": "Attributes",
					"description": "Core emotional drives with corresponding statements and stress",
					"nounSingular": "Attribute",
					"nounPlural": "Attributes",
					"statement": true,
					"ratingPosition": "inline",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"features": {
								"description": true,
								"sfx": false,
								"subtraits": false
							},
							"location": "left",
							"page": 1,
							"style": {
								"header": "default",
								"body": "default"
							},
							"statement": true,
							"ratingScale": [
								4,
								6,
								8,
								10,
								12
							],
							"attachedStress": {
								"enabled": true,
								"label": "STRESS",
								"ratingScale": [
									4,
									6,
									8,
									10,
									12
								],
								"scale": [
									4,
									6,
									8,
									10,
									12
								],
								"includeOut": false
							},
							"multiDie": false,
							"stressConfig": {
								"includeOut": true
							},
							"notes": "",
							"reservedSlots": 5,
							"attributesRing": false,
							"colSpan": "full",
							"columnSpan": "full"
						}
					},
					"traits": [
						{
							"name": "Anger",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Desire",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Fear",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Joy",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Sorrow",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						}
					],
					"sfx": []
				},
				{
					"id": "town-relationships",
					"name": "Relationships",
					"description": "Bonds and rivalries with local residents",
					"nounSingular": "Relationship",
					"nounPlural": "Relationships",
					"ratingPosition": "inline",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"header": "top",
							"headerAlign": "left",
							"features": {
								"description": true,
								"sfx": false,
								"subtraits": false
							},
							"location": "left",
							"page": 1,
							"style": {
								"header": "default",
								"body": "default"
							},
							"ratingScale": [
								4,
								6,
								8,
								10,
								12
							],
							"multiDie": false,
							"stressConfig": {
								"includeOut": true
							},
							"notes": "",
							"reservedSlots": 10,
							"colWidth": 64
						}
					},
					"traits": [
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						}
					],
					"sfx": []
				},
				{
					"id": "growth-pool",
					"name": "Growth Pool",
					"description": "",
					"nounSingular": "Growth Die",
					"nounPlural": "Growth Dice",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"header": "top",
							"headerAlign": "left",
							"features": {
								"description": false,
								"sfx": false,
								"subtraits": false
							},
							"location": "right",
							"page": 1,
							"style": {
								"header": "dice-ladder",
								"body": "dice-ladder"
							},
							"ratingScale": [
								4,
								6,
								8,
								10,
								12
							],
							"reservedSlots": 5
						}
					},
					"traits": [
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						}
					],
					"sfx": []
				},
				{
					"id": "complications",
					"name": "Complications",
					"description": "",
					"nounSingular": "Complication",
					"nounPlural": "Complications",
					"ratingPosition": "above",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"features": {
								"description": true,
								"sfx": false,
								"subtraits": false
							},
							"location": "right",
							"page": 1,
							"style": {
								"header": "default",
								"body": "default"
							},
							"ratingPosition": "above",
							"ratingScale": [
								6,
								8,
								10,
								12
							],
							"reservedSlots": 5
						}
					},
					"traits": [
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						}
					],
					"sfx": []
				}
			]
		}
	},
	{
		"id": "spotlight-necromancer",
		"version": 1,
		"title": "Necromancer",
		"subtitle": "Dark Fantasy Grimoire & Undead Arts",
		"spotlight": "Necromancer",
		"variant": "Caster File",
		"pages": 1,
		"genre": "Dark Fantasy / Occult",
		"description": "Practitioners of forbidden death magic navigating ancient covenants and terrifying bargains. Features Distinctions (Job, Necromancy, Desire), Affiliations (My Life, The World, The Demi-Monde) with statements, Roles, Necromancy Ability with Effect Tags, SFX and Limit, Signature Assets, Session Record, and Complications.",
		"character": {
			"$schema": "https://cortex.engard.me/schema/0.1/character.schema.json",
			"version": "0.1",
			"id": "template-spotlight-necromancer",
			"isTemplate": true,
			"name": "",
			"game": "Necromancer",
			"description": "",
			"pronouns": "",
			"plotPoints": 1,
			"notes": "",
			"custom": {
				"cortexToolkit": {
					"pageCount": 1,
					"spotlight": "Necromancer",
					"style": {
						"hasAttributes": false
					},
					"sheetStyle": "spotlight",
					"columns": 2,
					"watermark": {
						"enabled": true,
						"url": "images/cortex_prime_logo_light_transparent.png",
						"opacity": 0.08,
						"scale": 70,
						"page": "all"
					},
					"columnAlignment": "top-base",
					"columnOffsets": {
						"left": 0,
						"center": 0,
						"right": 0
					}
				}
			},
			"player": "",
			"portrait": {
				"url": "",
				"custom": {
					"cortexToolkit": {
						"size": "spotlight",
						"location": "header"
					}
				}
			},
			"traitSets": [
				{
					"id": "distinctions",
					"name": "Distinctions",
					"description": "Occult lineage, taboo practice, and philosophical motivation",
					"nounSingular": "Distinction",
					"nounPlural": "Distinctions",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"features": {
								"description": true,
								"sfx": false,
								"subtraits": false
							},
							"sharedHinder": true,
							"sharedHinderText": "Gain a PP when you trade out your distinction's d8 rating for a d4.",
							"ratingScale": [
								8
							],
							"location": "left",
							"page": 1,
							"style": {
								"header": "distinctions",
								"body": "distinctions"
							},
							"multiDie": false,
							"stressConfig": {
								"includeOut": true
							},
							"notes": "",
							"reservedSlots": 3,
							"colSpan": "full",
							"columnSpan": "full"
						}
					},
					"traits": [
						{
							"name": "Job:",
							"value": 8,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": [
								"hinder"
							]
						},
						{
							"name": "Necromancy:",
							"value": 8,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": [
								"hinder"
							]
						},
						{
							"name": "Desire:",
							"value": 8,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": [
								"hinder"
							]
						}
					],
					"sfx": []
				},
				{
					"id": "affiliations",
					"name": "Affiliations",
					"description": "Operating configuration dice and statements",
					"nounSingular": "Affiliation",
					"nounPlural": "Affiliations",
					"statement": true,
					"ratingPosition": "inline",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"header": "top",
							"headerAlign": "center",
							"features": {
								"description": true,
								"sfx": false,
								"subtraits": false
							},
							"location": "left",
							"page": 1,
							"style": {
								"header": "default",
								"body": "default"
							},
							"statement": true,
							"ratingScale": [
								4,
								6,
								8,
								10,
								12
							],
							"multiDie": false,
							"stressConfig": {
								"includeOut": true
							},
							"notes": "",
							"reservedSlots": 3,
							"colSpan": "full",
							"columnSpan": "full"
						}
					},
					"traits": [
						{
							"name": "My Life",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "The World",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "The Demi-Monde",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						}
					],
					"sfx": []
				},
				{
					"id": "roles-specialties",
					"name": "Roles",
					"description": "Dark magical callings and practices",
					"nounSingular": "Role",
					"nounPlural": "Roles",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"header": "top",
							"headerAlign": "center",
							"features": {
								"description": false,
								"sfx": false,
								"subtraits": false
							},
							"location": "left",
							"page": 1,
							"style": {
								"header": "default",
								"body": "default"
							},
							"ratingScale": [
								4,
								6,
								8,
								10,
								12
							],
							"multiDie": false,
							"stressConfig": {
								"includeOut": true
							},
							"notes": "",
							"reservedSlots": 6,
							"colWidth": 38
						}
					},
					"traits": [
						{
							"name": "Diplomat",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Fighter",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Guardian",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Healer",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Sneak",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Transporter",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						}
					],
					"sfx": []
				},
				{
					"id": "signature-assets",
					"name": "Signature Assets",
					"description": "Occult relics, grimoires, and dark instruments",
					"nounSingular": "Signature Asset",
					"nounPlural": "Signature Assets",
					"ratingPosition": "above",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"header": "top",
							"headerAlign": "center",
							"features": {
								"description": true,
								"sfx": false,
								"subtraits": false
							},
							"location": "left",
							"page": 1,
							"style": {
								"header": "default",
								"body": "default"
							},
							"ratingPosition": "above",
							"ratingScale": [
								6,
								8,
								10,
								12
							],
							"multiDie": false,
							"stressConfig": {
								"includeOut": true
							},
							"notes": "",
							"reservedSlots": 3,
							"colWidth": 38
						}
					},
					"traits": [
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						}
					],
					"sfx": []
				},
				{
					"id": "necromantic-arts",
					"name": "Ability",
					"description": "EFFECT TAGS: ATTACK • SENSORY • MOVEMENT • CONTROL • DEFENSE • ENHANCEMENT",
					"nounSingular": "Ability",
					"nounPlural": "Abilities",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"header": "top",
							"headerAlign": "center",
							"features": {
								"description": true,
								"sfx": true,
								"subtraits": true
							},
							"location": "right",
							"rowSpan": 2,
							"page": 1,
							"style": {
								"header": "default",
								"body": "default"
							},
							"ratingScale": [
								8,
								10,
								12
							],
							"multiDie": false,
							"stressConfig": {
								"includeOut": true
							},
							"notes": "",
							"reservedSlots": 1
						}
					},
					"traits": [
						{
							"name": "Necromancy",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [
								{
									"name": "Descriptor Tags:",
									"value": 0,
									"dice": [],
									"description": "",
									"tags": [],
									"custom": {},
									"traits": [],
									"sfx": []
								}
							],
							"sfx": [
								{
									"name": "Been There",
									"description": "When you are resurrecting a ______________, double your Necromancy."
								},
								{
									"name": "Done That",
									"description": "When a ______________ you resurrected creates or exacerbates a problem, earn a PP."
								},
								{
									"name": "Limit — Dammit",
									"description": "When you injure, maim, or kill with Necromancy or kill by any means, gain the Deathmark complication at d4 or step it up. When your Deathmark steps up past d12, add the d12 to the doom pool and lose access to your Necromancy for the duration of the scene."
								},
								{
									"name": "",
									"description": "",
									"tags": [],
									"custom": {}
								},
								{
									"name": "",
									"description": "",
									"tags": [],
									"custom": {}
								},
								{
									"name": "",
									"description": "",
									"tags": [],
									"custom": {}
								}
							]
						}
					],
					"sfx": []
				},
				{
					"id": "session-record",
					"name": "Session Record",
					"description": "",
					"nounSingular": "Milestone",
					"nounPlural": "Milestones",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"header": "top",
							"headerAlign": "left",
							"features": {
								"description": false,
								"sfx": false,
								"subtraits": false
							},
							"location": "left",
							"page": 1,
							"style": {
								"header": "default",
								"body": "session-record"
							},
							"sessionRecord": {
								"count": 10,
								"orientation": "horizontal"
							},
							"reservedSlots": 10,
							"colWidth": 62,
							"rowBreak": true
						}
					},
					"traits": [],
					"sfx": []
				},
				{
					"id": "complications",
					"name": "Complications",
					"description": "",
					"nounSingular": "Complication",
					"nounPlural": "Complications",
					"ratingPosition": "above",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"header": "top",
							"headerAlign": "center",
							"features": {
								"description": true,
								"sfx": false,
								"subtraits": false
							},
							"location": "right",
							"page": 1,
							"style": {
								"header": "default",
								"body": "default"
							},
							"ratingPosition": "above",
							"ratingScale": [
								4,
								6,
								8,
								10,
								12
							],
							"reservedSlots": 3
						}
					},
					"traits": [
						{
							"name": "Deathmark",
							"value": 0,
							"dice": [],
							"description": "Deathmark",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						}
					],
					"sfx": []
				}
			]
		}
	},
	{
		"id": "spotlight-retired-crystalline",
		"version": 1,
		"title": "Retired No More - Crystalline Age",
		"subtitle": "Aging Veteran Heroes",
		"spotlight": "Retired No More",
		"variant": "Crystalline Age",
		"pages": 1,
		"genre": "Superhero / Silver Age Nostalgia",
		"description": "Veteran heroes of the legendary Crystalline Age stepping back into action after decades of retirement. Features Values, 3 Distinctions (Archetype, Retirement, Satisfaction), 5 Era Resources (5d6), 16 Skills (d4-d6) & Specialties (d8-d12), Signature Assets, and Aging Complications.",
		"character": {
			"$schema": "https://cortex.engard.me/schema/0.1/character.schema.json",
			"version": "0.1",
			"id": "template-spotlight-retired-crystalline",
			"isTemplate": true,
			"name": "",
			"game": "Retired No More",
			"description": "",
			"pronouns": "",
			"plotPoints": 1,
			"notes": "",
			"custom": {
				"cortexToolkit": {
					"pageCount": 1,
					"spotlight": "Retired No More",
					"style": {
						"hasAttributes": false
					},
					"sheetStyle": "spotlight",
					"columns": 2,
					"watermark": {
						"enabled": true,
						"url": "images/cortex_prime_logo_light_transparent.png",
						"opacity": 0.08,
						"scale": 70,
						"page": "all"
					},
					"columnAlignment": "top-base",
					"columnOffsets": {
						"left": 0,
						"center": 0,
						"right": 0
					}
				}
			},
			"player": "",
			"portrait": {
				"url": "",
				"custom": {
					"cortexToolkit": {
						"size": "spotlight",
						"location": "header"
					}
				}
			},
			"traitSets": [
				{
					"id": "values",
					"name": "Values",
					"description": "Enduring principles of the golden era",
					"nounSingular": "Value",
					"nounPlural": "Values",
					"ratingPosition": "below",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"features": {
								"description": false,
								"sfx": false,
								"subtraits": false
							},
							"location": "left",
							"page": 1,
							"style": {
								"header": "default",
								"body": "default"
							},
							"ratingPosition": "below",
							"ratingScale": [
								4,
								6,
								8,
								10,
								12
							],
							"multiDie": false,
							"stressConfig": {
								"includeOut": true
							},
							"notes": "",
							"reservedSlots": 7,
							"colWidth": 28
						}
					},
					"traits": [
						{
							"name": "Allegiance",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Glory",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Integrity",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Knowledge",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Novelty",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Power",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Riches",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						}
					],
					"sfx": []
				},
				{
					"id": "distinctions",
					"name": "Distinctions",
					"description": "Past glory, modern civilian life, and the call to return",
					"nounSingular": "Distinction",
					"nounPlural": "Distinctions",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"features": {
								"description": true,
								"sfx": true,
								"subtraits": false
							},
							"sharedHinder": true,
							"sharedHinderText": "Gain a PP when you trade out your distinction's d8 rating for a d4.",
							"ratingScale": [
								8
							],
							"location": "right",
							"page": 1,
							"style": {
								"header": "distinctions",
								"body": "distinctions"
							},
							"multiDie": false,
							"stressConfig": {
								"includeOut": true
							},
							"notes": "",
							"reservedSlots": 3
						}
					},
					"traits": [
						{
							"name": "Archetype",
							"value": 8,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": [
								{
									"name": "",
									"description": "",
									"tags": [],
									"custom": {}
								},
								{
									"name": "",
									"description": "",
									"tags": [],
									"custom": {}
								},
								"hinder"
							]
						},
						{
							"name": "Retirement",
							"value": 8,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": [
								"hinder",
								{
									"name": "",
									"description": "",
									"tags": [],
									"custom": {}
								},
								{
									"name": "",
									"description": "",
									"tags": [],
									"custom": {}
								}
							]
						},
						{
							"name": "Satisfaction",
							"value": 8,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": [
								"hinder",
								{
									"name": "",
									"description": "",
									"tags": [],
									"custom": {}
								},
								{
									"name": "",
									"description": "",
									"tags": [],
									"custom": {}
								}
							]
						}
					],
					"sfx": []
				},
				{
					"id": "vintage-resources-assets",
					"name": "Resources",
					"description": "Stashed tech, vintage vehicles, and old connections (5d6 each)",
					"nounSingular": "Resource",
					"nounPlural": "Resources",
					"ratingPosition": "below",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"header": "top",
							"headerAlign": "center",
							"features": {
								"description": true,
								"sfx": false,
								"subtraits": false
							},
							"location": "left",
							"page": 1,
							"style": {
								"header": "default",
								"body": "default"
							},
							"ratingPosition": "below",
							"ratingScale": [
								6
							],
							"multiDie": true,
							"stressConfig": {
								"includeOut": true
							},
							"notes": "",
							"reservedSlots": 5,
							"colWidth": 28
						}
					},
					"traits": [
						{
							"name": "",
							"value": 6,
							"dice": [
								6,
								6,
								6,
								6,
								6
							],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 6,
							"dice": [
								6,
								6,
								6,
								6,
								6
							],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 6,
							"dice": [
								6,
								6,
								6,
								6,
								6
							],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 6,
							"dice": [
								6,
								6,
								6,
								6,
								6
							],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 6,
							"dice": [
								6,
								6,
								6,
								6,
								6
							],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						}
					],
					"sfx": []
				},
				{
					"id": "signature-assets",
					"name": "Signature Assets",
					"description": "",
					"nounSingular": "Asset",
					"nounPlural": "Assets",
					"ratingPosition": "below",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"header": "top",
							"headerAlign": "center",
							"features": {
								"description": true,
								"sfx": false,
								"subtraits": false
							},
							"location": "left",
							"page": 1,
							"style": {
								"header": "default",
								"body": "default"
							},
							"ratingPosition": "below",
							"ratingScale": [
								6,
								8,
								10,
								12
							],
							"reservedSlots": 2,
							"colWidth": 28
						}
					},
					"traits": [
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						}
					],
					"sfx": []
				},
				{
					"id": "aging-complications",
					"name": "Aging Complications",
					"description": "",
					"nounSingular": "Complication",
					"nounPlural": "Complications",
					"ratingPosition": "below",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"header": "top",
							"headerAlign": "center",
							"features": {
								"description": true,
								"sfx": false,
								"subtraits": false
							},
							"location": "left",
							"page": 1,
							"style": {
								"header": "default",
								"body": "default"
							},
							"ratingPosition": "below",
							"ratingScale": [
								6,
								8,
								10,
								12
							],
							"reservedSlots": 2,
							"colWidth": 28
						}
					},
					"traits": [
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						}
					],
					"sfx": []
				},
				{
					"id": "subtrait-columns",
					"name": "Skills & Specialties",
					"description": "Mundane d4-d6 skills stepped up by d8-d12 veteran specialties",
					"nounSingular": "Skill",
					"nounPlural": "Skills",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"header": "top",
							"headerAlign": "center",
							"features": {
								"description": false,
								"sfx": false,
								"subtraits": true
							},
							"location": "right",
							"page": 1,
							"style": {
								"header": "default",
								"body": "subtrait-columns"
							},
							"ratingScale": [
								4,
								6
							],
							"subtraitRatingScale": [
								8,
								10,
								12
							],
							"labels": {
								"left": "Skills",
								"right": "Specialties"
							},
							"multiDie": false,
							"stressConfig": {
								"includeOut": true
							},
							"notes": "",
							"reservedSlots": 16,
							"rowSpan": 3
						}
					},
					"traits": [
						{
							"name": "Craft",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [
								{
									"name": "",
									"value": 0,
									"dice": [],
									"description": "",
									"tags": [],
									"custom": {},
									"traits": [],
									"sfx": []
								}
							],
							"sfx": []
						},
						{
							"name": "Fight",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [
								{
									"name": "",
									"value": 0,
									"dice": [],
									"description": "",
									"tags": [],
									"custom": {},
									"traits": [],
									"sfx": []
								}
							],
							"sfx": []
						},
						{
							"name": "Fly",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [
								{
									"name": "",
									"value": 0,
									"dice": [],
									"description": "",
									"tags": [],
									"custom": {},
									"traits": [],
									"sfx": []
								}
							],
							"sfx": []
						},
						{
							"name": "Focus",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [
								{
									"name": "",
									"value": 0,
									"dice": [],
									"description": "",
									"tags": [],
									"custom": {},
									"traits": [],
									"sfx": []
								}
							],
							"sfx": []
						},
						{
							"name": "Influence",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [
								{
									"name": "",
									"value": 0,
									"dice": [],
									"description": "",
									"tags": [],
									"custom": {},
									"traits": [],
									"sfx": []
								}
							],
							"sfx": []
						},
						{
							"name": "Know",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [
								{
									"name": "",
									"value": 0,
									"dice": [],
									"description": "",
									"tags": [],
									"custom": {},
									"traits": [],
									"sfx": []
								}
							],
							"sfx": []
						},
						{
							"name": "Labor",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [
								{
									"name": "",
									"value": 0,
									"dice": [],
									"description": "",
									"tags": [],
									"custom": {},
									"traits": [],
									"sfx": []
								}
							],
							"sfx": []
						},
						{
							"name": "Move",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [
								{
									"name": "",
									"value": 0,
									"dice": [],
									"description": "",
									"tags": [],
									"custom": {},
									"traits": [],
									"sfx": []
								}
							],
							"sfx": []
						},
						{
							"name": "Notice",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [
								{
									"name": "",
									"value": 0,
									"dice": [],
									"description": "",
									"tags": [],
									"custom": {},
									"traits": [],
									"sfx": []
								}
							],
							"sfx": []
						},
						{
							"name": "Perform",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [
								{
									"name": "",
									"value": 0,
									"dice": [],
									"description": "",
									"tags": [],
									"custom": {},
									"traits": [],
									"sfx": []
								}
							],
							"sfx": []
						},
						{
							"name": "Sneak",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [
								{
									"name": "",
									"value": 0,
									"dice": [],
									"description": "",
									"tags": [],
									"custom": {},
									"traits": [],
									"sfx": []
								}
							],
							"sfx": []
						},
						{
							"name": "Survive",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [
								{
									"name": "",
									"value": 0,
									"dice": [],
									"description": "",
									"tags": [],
									"custom": {},
									"traits": [],
									"sfx": []
								}
							],
							"sfx": []
						},
						{
							"name": "Throw",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [
								{
									"name": "",
									"value": 0,
									"dice": [],
									"description": "",
									"tags": [],
									"custom": {},
									"traits": [],
									"sfx": []
								}
							],
							"sfx": []
						},
						{
							"name": "Tinker",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [
								{
									"name": "",
									"value": 0,
									"dice": [],
									"description": "",
									"tags": [],
									"custom": {},
									"traits": [],
									"sfx": []
								}
							],
							"sfx": []
						},
						{
							"name": "Treat",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [
								{
									"name": "",
									"value": 0,
									"dice": [],
									"description": "",
									"tags": [],
									"custom": {},
									"traits": [],
									"sfx": []
								}
							],
							"sfx": []
						},
						{
							"name": "Trick",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [
								{
									"name": "",
									"value": 0,
									"dice": [],
									"description": "",
									"tags": [],
									"custom": {},
									"traits": [],
									"sfx": []
								}
							],
							"sfx": []
						}
					],
					"sfx": []
				}
			]
		}
	},
	{
		"id": "spotlight-retired-aerial",
		"version": 1,
		"title": "Retired No More - Aerial Age",
		"subtitle": "Aging Veteran Heroes",
		"spotlight": "Retired No More",
		"variant": "Aerial Age",
		"pages": 1,
		"genre": "Dieselpunk / Aviation Adventure",
		"description": "Sky aces and airborne champions of the Aerial Age dusted off for one more dogfight. Features Values, Archetype & Retirement Distinctions, 5d6 Resources, a Signature Asset, 9 write-in Skills (d4-d6) & Specialties (d8-d12), and a 20-step Session Record.",
		"character": {
			"$schema": "https://cortex.engard.me/schema/0.1/character.schema.json",
			"version": "0.1",
			"id": "template-spotlight-retired-aerial",
			"isTemplate": true,
			"name": "",
			"game": "Retired No More",
			"description": "",
			"pronouns": "",
			"plotPoints": 1,
			"notes": "",
			"custom": {
				"cortexToolkit": {
					"pageCount": 1,
					"spotlight": "Retired No More",
					"style": {
						"hasAttributes": false
					},
					"sheetStyle": "spotlight",
					"columns": 2,
					"watermark": {
						"enabled": true,
						"url": "images/cortex_prime_logo_light_transparent.png",
						"opacity": 0.08,
						"scale": 70,
						"page": "all"
					},
					"columnAlignment": "top-base",
					"columnOffsets": {
						"left": 0,
						"center": 0,
						"right": 0
					}
				}
			},
			"player": "",
			"portrait": {
				"url": "",
				"custom": {
					"cortexToolkit": {
						"size": "spotlight",
						"location": "header"
					}
				}
			},
			"traitSets": [
				{
					"id": "values",
					"name": "Values",
					"description": "The aviator's code and sky ethics",
					"nounSingular": "Value",
					"nounPlural": "Values",
					"ratingPosition": "below",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"features": {
								"description": false,
								"sfx": false,
								"subtraits": false
							},
							"location": "left",
							"page": 1,
							"style": {
								"header": "default",
								"body": "default"
							},
							"ratingPosition": "below",
							"ratingScale": [
								4,
								6,
								8,
								10,
								12
							],
							"multiDie": false,
							"stressConfig": {
								"includeOut": true
							},
							"notes": "",
							"reservedSlots": 7,
							"colWidth": 28
						}
					},
					"traits": [
						{
							"name": "Allegiance",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Glory",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Integrity",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Knowledge",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Novelty",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Power",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Riches",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						}
					],
					"sfx": []
				},
				{
					"id": "distinctions",
					"name": "Distinctions",
					"description": "Aerial legend and grounded retirement",
					"nounSingular": "Distinction",
					"nounPlural": "Distinctions",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"features": {
								"description": true,
								"sfx": true,
								"subtraits": false
							},
							"sharedHinder": true,
							"sharedHinderText": "Gain a PP when you trade out your distinction's d8 rating for a d4.",
							"ratingScale": [
								8
							],
							"location": "right",
							"page": 1,
							"style": {
								"header": "distinctions",
								"body": "distinctions"
							},
							"multiDie": false,
							"stressConfig": {
								"includeOut": true
							},
							"notes": "",
							"reservedSlots": 2
						}
					},
					"traits": [
						{
							"name": "Archetype:",
							"value": 8,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": [
								"hinder",
								{
									"name": "",
									"description": "",
									"tags": [],
									"custom": {}
								},
								{
									"name": "",
									"description": "",
									"tags": [],
									"custom": {}
								}
							]
						},
						{
							"name": "Retirement:",
							"value": 8,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": [
								"hinder",
								{
									"name": "",
									"description": "",
									"tags": [],
									"custom": {}
								},
								{
									"name": "",
									"description": "",
									"tags": [],
									"custom": {}
								}
							]
						}
					],
					"sfx": []
				},
				{
					"id": "vintage-plane-signature-assets",
					"name": "Resources",
					"description": "Custom aircraft and aviator resources (5d6 each)",
					"nounSingular": "Resource",
					"nounPlural": "Resources",
					"ratingPosition": "below",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"header": "top",
							"headerAlign": "center",
							"features": {
								"description": true,
								"sfx": false,
								"subtraits": false
							},
							"location": "left",
							"page": 1,
							"style": {
								"header": "default",
								"body": "default"
							},
							"ratingPosition": "below",
							"ratingScale": [
								6
							],
							"multiDie": true,
							"stressConfig": {
								"includeOut": true
							},
							"notes": "",
							"reservedSlots": 3,
							"colWidth": 28
						}
					},
					"traits": [
						{
							"name": "",
							"value": 6,
							"dice": [
								6,
								6,
								6,
								6,
								6
							],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 6,
							"dice": [
								6,
								6,
								6,
								6,
								6
							],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 6,
							"dice": [
								6,
								6,
								6,
								6,
								6
							],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						}
					],
					"sfx": []
				},
				{
					"id": "signature-asset",
					"name": "Signature Asset",
					"description": "",
					"nounSingular": "Asset",
					"nounPlural": "Assets",
					"ratingPosition": "below",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"header": "top",
							"headerAlign": "center",
							"features": {
								"description": true,
								"sfx": false,
								"subtraits": false
							},
							"location": "left",
							"page": 1,
							"style": {
								"header": "default",
								"body": "default"
							},
							"ratingPosition": "below",
							"ratingScale": [
								6,
								8,
								10,
								12
							],
							"reservedSlots": 1,
							"colWidth": 28
						}
					},
					"traits": [
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						}
					],
					"sfx": []
				},
				{
					"id": "subtrait-columns",
					"name": "Skills & Specialties",
					"description": "Flight and tactical skills (d4-d6) with veteran specialties (d8-d12)",
					"nounSingular": "Skill",
					"nounPlural": "Skills",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"header": "top",
							"headerAlign": "center",
							"features": {
								"description": false,
								"sfx": false,
								"subtraits": true
							},
							"location": "right",
							"page": 1,
							"style": {
								"header": "default",
								"body": "subtrait-columns"
							},
							"ratingScale": [
								4,
								6
							],
							"subtraitRatingScale": [
								8,
								10,
								12
							],
							"labels": {
								"left": "Skills",
								"right": "Specialties"
							},
							"multiDie": false,
							"stressConfig": {
								"includeOut": true
							},
							"notes": "",
							"reservedSlots": 9,
							"rowSpan": 2
						}
					},
					"traits": [
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [
								{
									"name": "",
									"value": 0,
									"dice": [],
									"description": "",
									"tags": [],
									"custom": {},
									"traits": [],
									"sfx": []
								}
							],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [
								{
									"name": "",
									"value": 0,
									"dice": [],
									"description": "",
									"tags": [],
									"custom": {},
									"traits": [],
									"sfx": []
								}
							],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [
								{
									"name": "",
									"value": 0,
									"dice": [],
									"description": "",
									"tags": [],
									"custom": {},
									"traits": [],
									"sfx": []
								}
							],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [
								{
									"name": "",
									"value": 0,
									"dice": [],
									"description": "",
									"tags": [],
									"custom": {},
									"traits": [],
									"sfx": []
								}
							],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [
								{
									"name": "",
									"value": 0,
									"dice": [],
									"description": "",
									"tags": [],
									"custom": {},
									"traits": [],
									"sfx": []
								}
							],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [
								{
									"name": "",
									"value": 0,
									"dice": [],
									"description": "",
									"tags": [],
									"custom": {},
									"traits": [],
									"sfx": []
								}
							],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [
								{
									"name": "",
									"value": 0,
									"dice": [],
									"description": "",
									"tags": [],
									"custom": {},
									"traits": [],
									"sfx": []
								}
							],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [
								{
									"name": "",
									"value": 0,
									"dice": [],
									"description": "",
									"tags": [],
									"custom": {},
									"traits": [],
									"sfx": []
								}
							],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [
								{
									"name": "",
									"value": 0,
									"dice": [],
									"description": "",
									"tags": [],
									"custom": {},
									"traits": [],
									"sfx": []
								}
							],
							"sfx": []
						}
					],
					"sfx": []
				},
				{
					"id": "session-record",
					"name": "Session Record",
					"description": "1: Training • 2: Adventuring Triumph • 3: Retirement",
					"nounSingular": "Milestone",
					"nounPlural": "Milestones",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"header": "top",
							"headerAlign": "left",
							"features": {
								"description": false,
								"sfx": false,
								"subtraits": false
							},
							"location": "left",
							"page": 1,
							"style": {
								"header": "default",
								"body": "session-record"
							},
							"sessionRecord": {
								"count": 20,
								"orientation": "horizontal"
							},
							"reservedSlots": 20,
							"colSpan": "full",
							"columnSpan": "full"
						}
					},
					"traits": [
						{
							"name": "Training",
							"value": 0,
							"dice": [],
							"description": "Training",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Adventuring Triumph",
							"value": 0,
							"dice": [],
							"description": "Adventuring Triumph",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Retirement",
							"value": 0,
							"dice": [],
							"description": "Retirement",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						}
					],
					"sfx": []
				}
			]
		}
	},
	{
		"id": "spotlight-safe-zone-survivor",
		"version": 1,
		"title": "Safe Zone",
		"subtitle": "Post-Apocalyptic Survival & Colony",
		"spotlight": "Safe Zone",
		"variant": "Survivor File",
		"pages": 1,
		"genre": "Post-Apocalyptic / Survival",
		"description": "Hardened survivors holding the perimeter of the last safe zones against wasteland horrors. Features Distinctions (Before, Now, Future), 20 Skills (d4-d6) & Specialties (d8-d12), Attributes (Analytical, Forceful, Quiet), 10 Relationships, 5 Stress tracks (Injured, Isolated, Sick, Tired, Upset), Talents, and Growth Pool.",
		"character": {
			"$schema": "https://cortex.engard.me/schema/0.1/character.schema.json",
			"version": "0.1",
			"id": "template-spotlight-safe-zone-survivor",
			"isTemplate": true,
			"name": "",
			"game": "Safe Zone",
			"description": "",
			"pronouns": "",
			"plotPoints": 1,
			"notes": "",
			"custom": {
				"cortexToolkit": {
					"pageCount": 1,
					"spotlight": "Safe Zone",
					"style": {
						"hasAttributes": false
					},
					"sheetStyle": "spotlight",
					"columns": 3,
					"watermark": {
						"enabled": true,
						"url": "images/cortex_prime_logo_light_transparent.png",
						"opacity": 0.08,
						"scale": 70,
						"page": "all"
					},
					"columnAlignment": "top-base",
					"columnOffsets": {
						"left": 0,
						"center": 0,
						"right": 0
					}
				}
			},
			"player": "",
			"portrait": {
				"url": "",
				"custom": {
					"cortexToolkit": {
						"size": "spotlight",
						"location": "header"
					}
				}
			},
			"traitSets": [
				{
					"id": "distinctions",
					"name": "Distinctions",
					"description": "Pre-fall life, current survival role, and future hope",
					"nounSingular": "Distinction",
					"nounPlural": "Distinctions",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"features": {
								"description": true,
								"sfx": false,
								"subtraits": false
							},
							"sharedHinder": true,
							"sharedHinderText": "Gain a PP when you trade out your distinction's d8 rating for a d4.",
							"ratingScale": [
								8
							],
							"location": "left",
							"page": 1,
							"style": {
								"header": "distinctions",
								"body": "distinctions"
							},
							"multiDie": false,
							"stressConfig": {
								"includeOut": true
							},
							"notes": "",
							"reservedSlots": 3,
							"colSpan": "full",
							"columnSpan": "full"
						}
					},
					"traits": [
						{
							"name": "Before:",
							"value": 8,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": [
								"hinder"
							]
						},
						{
							"name": "Now:",
							"value": 8,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": [
								"hinder"
							]
						},
						{
							"name": "Future:",
							"value": 8,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": [
								"hinder"
							]
						}
					],
					"sfx": []
				},
				{
					"id": "subtrait-columns",
					"name": "Skills & Specialties",
					"description": "Practical survival disciplines (d4-d6) with specialized traits (d8-d12)",
					"nounSingular": "Skill",
					"nounPlural": "Skills",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"header": "top",
							"headerAlign": "center",
							"features": {
								"description": false,
								"sfx": false,
								"subtraits": true
							},
							"location": "left",
							"colSpan": 2,
							"columnSpan": 2,
							"rowSpan": 3,
							"page": 1,
							"style": {
								"header": "default",
								"body": "subtrait-columns"
							},
							"ratingScale": [
								4,
								6
							],
							"subtraitRatingScale": [
								8,
								10,
								12
							],
							"labels": {
								"left": "Skills",
								"right": "Specialties"
							},
							"multiDie": false,
							"stressConfig": {
								"includeOut": true
							},
							"notes": "",
							"reservedSlots": 20
						}
					},
					"traits": [
						{
							"name": "Animals",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [
								{
									"name": "",
									"value": 0,
									"dice": [],
									"description": "",
									"tags": [],
									"custom": {},
									"traits": [],
									"sfx": []
								}
							],
							"sfx": []
						},
						{
							"name": "Athletics",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [
								{
									"name": "",
									"value": 0,
									"dice": [],
									"description": "",
									"tags": [],
									"custom": {},
									"traits": [],
									"sfx": []
								}
							],
							"sfx": []
						},
						{
							"name": "Big Guns",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [
								{
									"name": "",
									"value": 0,
									"dice": [],
									"description": "",
									"tags": [],
									"custom": {},
									"traits": [],
									"sfx": []
								}
							],
							"sfx": []
						},
						{
							"name": "Covert",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [
								{
									"name": "",
									"value": 0,
									"dice": [],
									"description": "",
									"tags": [],
									"custom": {},
									"traits": [],
									"sfx": []
								}
							],
							"sfx": []
						},
						{
							"name": "Craft",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [
								{
									"name": "",
									"value": 0,
									"dice": [],
									"description": "",
									"tags": [],
									"custom": {},
									"traits": [],
									"sfx": []
								}
							],
							"sfx": []
						},
						{
							"name": "Creativity",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [
								{
									"name": "",
									"value": 0,
									"dice": [],
									"description": "",
									"tags": [],
									"custom": {},
									"traits": [],
									"sfx": []
								}
							],
							"sfx": []
						},
						{
							"name": "Drive",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [
								{
									"name": "",
									"value": 0,
									"dice": [],
									"description": "",
									"tags": [],
									"custom": {},
									"traits": [],
									"sfx": []
								}
							],
							"sfx": []
						},
						{
							"name": "Focus",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [
								{
									"name": "",
									"value": 0,
									"dice": [],
									"description": "",
									"tags": [],
									"custom": {},
									"traits": [],
									"sfx": []
								}
							],
							"sfx": []
						},
						{
							"name": "Guns",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [
								{
									"name": "",
									"value": 0,
									"dice": [],
									"description": "",
									"tags": [],
									"custom": {},
									"traits": [],
									"sfx": []
								}
							],
							"sfx": []
						},
						{
							"name": "Influence",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [
								{
									"name": "",
									"value": 0,
									"dice": [],
									"description": "",
									"tags": [],
									"custom": {},
									"traits": [],
									"sfx": []
								}
							],
							"sfx": []
						},
						{
							"name": "Knowledge",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [
								{
									"name": "",
									"value": 0,
									"dice": [],
									"description": "",
									"tags": [],
									"custom": {},
									"traits": [],
									"sfx": []
								}
							],
							"sfx": []
						},
						{
							"name": "Mechanic",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [
								{
									"name": "",
									"value": 0,
									"dice": [],
									"description": "",
									"tags": [],
									"custom": {},
									"traits": [],
									"sfx": []
								}
							],
							"sfx": []
						},
						{
							"name": "Melee",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [
								{
									"name": "",
									"value": 0,
									"dice": [],
									"description": "",
									"tags": [],
									"custom": {},
									"traits": [],
									"sfx": []
								}
							],
							"sfx": []
						},
						{
							"name": "Notice",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [
								{
									"name": "",
									"value": 0,
									"dice": [],
									"description": "",
									"tags": [],
									"custom": {},
									"traits": [],
									"sfx": []
								}
							],
							"sfx": []
						},
						{
							"name": "Operate",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [
								{
									"name": "",
									"value": 0,
									"dice": [],
									"description": "",
									"tags": [],
									"custom": {},
									"traits": [],
									"sfx": []
								}
							],
							"sfx": []
						},
						{
							"name": "Pilot",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [
								{
									"name": "",
									"value": 0,
									"dice": [],
									"description": "",
									"tags": [],
									"custom": {},
									"traits": [],
									"sfx": []
								}
							],
							"sfx": []
						},
						{
							"name": "Survival",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [
								{
									"name": "",
									"value": 0,
									"dice": [],
									"description": "",
									"tags": [],
									"custom": {},
									"traits": [],
									"sfx": []
								}
							],
							"sfx": []
						},
						{
							"name": "Thrown",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [
								{
									"name": "",
									"value": 0,
									"dice": [],
									"description": "",
									"tags": [],
									"custom": {},
									"traits": [],
									"sfx": []
								}
							],
							"sfx": []
						},
						{
							"name": "Treatment",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [
								{
									"name": "",
									"value": 0,
									"dice": [],
									"description": "",
									"tags": [],
									"custom": {},
									"traits": [],
									"sfx": []
								}
							],
							"sfx": []
						},
						{
							"name": "Unarmed",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [
								{
									"name": "",
									"value": 0,
									"dice": [],
									"description": "",
									"tags": [],
									"custom": {},
									"traits": [],
									"sfx": []
								}
							],
							"sfx": []
						}
					],
					"sfx": []
				},
				{
					"id": "attributes",
					"name": "Attributes",
					"description": "Core survival attributes",
					"nounSingular": "Attribute",
					"nounPlural": "Attributes",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"header": "top",
							"headerAlign": "center",
							"features": {
								"description": false,
								"sfx": false,
								"subtraits": false
							},
							"location": "right",
							"page": 1,
							"style": {
								"header": "default",
								"body": "default"
							},
							"ratingScale": [
								4,
								6,
								8,
								10,
								12
							],
							"multiDie": false,
							"stressConfig": {
								"includeOut": true
							},
							"notes": "",
							"reservedSlots": 3,
							"attributesRing": false
						}
					},
					"traits": [
						{
							"name": "Analytical",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Forceful",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Quiet",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						}
					],
					"sfx": []
				},
				{
					"id": "relationships",
					"name": "Relationships",
					"description": "Ties to fellow survivors in the camp",
					"nounSingular": "Relationship",
					"nounPlural": "Relationships",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"header": "top",
							"headerAlign": "center",
							"features": {
								"description": false,
								"sfx": false,
								"subtraits": false
							},
							"location": "right",
							"page": 1,
							"style": {
								"header": "default",
								"body": "default"
							},
							"ratingScale": [
								4,
								6,
								8,
								10,
								12
							],
							"multiDie": false,
							"stressConfig": {
								"includeOut": true
							},
							"notes": "",
							"reservedSlots": 10
						}
					},
					"traits": [
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						}
					],
					"sfx": []
				},
				{
					"id": "stress",
					"name": "Stress",
					"description": "Survivor stress and trauma",
					"nounSingular": "Stress",
					"nounPlural": "Stress",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"header": "top",
							"headerAlign": "center",
							"features": {
								"description": false,
								"sfx": false,
								"subtraits": false
							},
							"location": "right",
							"page": 1,
							"style": {
								"header": "default",
								"body": "stress"
							},
							"ratingScale": [
								4,
								6,
								8,
								10,
								12
							],
							"multiDie": false,
							"stressConfig": {
								"includeD4": true,
								"includeOut": false
							},
							"notes": "",
							"reservedSlots": 5
						}
					},
					"traits": [
						{
							"name": "Injured",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Isolated",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Sick",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Tired",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Upset",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						}
					],
					"sfx": []
				},
				{
					"id": "talents",
					"name": "Talents",
					"description": "Survivor tricks and knacks",
					"nounSingular": "Talent",
					"nounPlural": "Talents",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"features": {
								"description": true,
								"sfx": true,
								"subtraits": false
							},
							"location": "left",
							"page": 1,
							"style": {
								"header": "default",
								"body": "three-column-table"
							},
							"multiDie": false,
							"stressConfig": {
								"includeOut": true
							},
							"notes": "",
							"reservedSlots": 3,
							"colSpan": 2,
							"columnSpan": 2,
							"rowBreak": true
						}
					},
					"traits": [
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						}
					],
					"sfx": []
				},
				{
					"id": "growth-pool",
					"name": "Growth Pool",
					"description": "Survivor growth dice",
					"nounSingular": "Growth Die",
					"nounPlural": "Growth Dice",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"header": "top",
							"headerAlign": "center",
							"features": {
								"description": false,
								"sfx": false,
								"subtraits": false
							},
							"location": "right",
							"page": 1,
							"style": {
								"header": "default",
								"body": "dice-ladder"
							},
							"ratingScale": [
								4,
								6,
								8,
								10,
								12
							],
							"multiDie": false,
							"stressConfig": {
								"includeOut": true
							},
							"notes": "",
							"reservedSlots": 5
						}
					},
					"traits": [
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						}
					],
					"sfx": []
				}
			]
		}
	},
	{
		"id": "spotlight-safe-zone-colony",
		"version": 1,
		"title": "Safe Zone - Colony File",
		"subtitle": "Post-Apocalyptic Survival & Colony",
		"spotlight": "Safe Zone",
		"variant": "Colony File",
		"pages": 2,
		"genre": "Post-Apocalyptic / Base Building",
		"description": "Colony management and stockpile sheet for Safe Zone settlements. Tracks Essential Stockpiles (Food, Water, Shelter — 12d6 each), Non-Essential Stockpiles (Medicine, Protection, Tools — 12d6 each), 6 Colony Buildings with d6-d12 Benefits, 9 Colony Survivors (Morale & Skills/Specialties), and Colony Notes.",
		"character": {
			"$schema": "https://cortex.engard.me/schema/0.1/character.schema.json",
			"version": "0.1",
			"id": "template-spotlight-safe-zone-colony",
			"isTemplate": true,
			"name": "",
			"game": "Safe Zone",
			"description": "",
			"pronouns": "",
			"plotPoints": 1,
			"notes": "",
			"custom": {
				"cortexToolkit": {
					"pageCount": 2,
					"spotlight": "Safe Zone",
					"style": {
						"hasAttributes": false
					},
					"sheetStyle": "spotlight",
					"columns": 2,
					"watermark": {
						"enabled": true,
						"url": "images/cortex_prime_logo_light_transparent.png",
						"opacity": 0.08,
						"scale": 70,
						"page": "all"
					},
					"columnAlignment": "top-base",
					"columnOffsets": {
						"left": 0,
						"center": 0,
						"right": 0
					},
					"columnsPage2": 3
				}
			},
			"player": "",
			"portrait": {
				"url": "",
				"custom": {
					"cortexToolkit": {
						"size": "spotlight",
						"location": "header"
					}
				}
			},
			"traitSets": [
				{
					"id": "essential-stockpiles",
					"name": "Essential Stockpiles",
					"description": "Building Benefits:",
					"nounSingular": "Essential Stockpile",
					"nounPlural": "Essential Stockpiles",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"header": "top",
							"headerAlign": "left",
							"traitColumns": 3,
							"features": {
								"description": false,
								"sfx": false,
								"subtraits": false
							},
							"location": "left",
							"page": 1,
							"style": {
								"header": "default",
								"body": "default"
							},
							"ratingScale": [
								6
							],
							"multiDie": true,
							"stressConfig": {
								"includeOut": true
							},
							"notes": "",
							"reservedSlots": 3,
							"colSpan": "full",
							"columnSpan": "full"
						}
					},
					"traits": [
						{
							"name": "Food",
							"value": 6,
							"dice": [
								6,
								6,
								6,
								6,
								6,
								6,
								6,
								6,
								6,
								6,
								6,
								6
							],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Water",
							"value": 6,
							"dice": [
								6,
								6,
								6,
								6,
								6,
								6,
								6,
								6,
								6,
								6,
								6,
								6
							],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Shelter",
							"value": 6,
							"dice": [
								6,
								6,
								6,
								6,
								6,
								6,
								6,
								6,
								6,
								6,
								6,
								6
							],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						}
					],
					"sfx": []
				},
				{
					"id": "non-essential-stockpiles",
					"name": "Non-Essential Stockpiles",
					"description": "Building Benefits:",
					"nounSingular": "Non-Essential Stockpile",
					"nounPlural": "Non-Essential Stockpiles",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"header": "top",
							"headerAlign": "left",
							"traitColumns": 3,
							"features": {
								"description": false,
								"sfx": false,
								"subtraits": false
							},
							"location": "left",
							"page": 1,
							"style": {
								"header": "default",
								"body": "default"
							},
							"ratingScale": [
								6
							],
							"multiDie": true,
							"stressConfig": {
								"includeOut": true
							},
							"notes": "",
							"reservedSlots": 3,
							"colSpan": "full",
							"columnSpan": "full"
						}
					},
					"traits": [
						{
							"name": "Medicine",
							"value": 6,
							"dice": [
								6,
								6,
								6,
								6,
								6,
								6,
								6,
								6,
								6,
								6,
								6,
								6
							],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Protection",
							"value": 6,
							"dice": [
								6,
								6,
								6,
								6,
								6,
								6,
								6,
								6,
								6,
								6,
								6,
								6
							],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Tools",
							"value": 6,
							"dice": [
								6,
								6,
								6,
								6,
								6,
								6,
								6,
								6,
								6,
								6,
								6,
								6
							],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						}
					],
					"sfx": []
				},
				{
					"id": "building-1",
					"name": "Building 1",
					"description": "",
					"nounSingular": "Building",
					"nounPlural": "Buildings",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"header": "top",
							"headerAlign": "left",
							"features": {
								"description": true,
								"sfx": false,
								"subtraits": true
							},
							"location": "left",
							"page": 1,
							"style": {
								"header": "default",
								"body": "default"
							},
							"ratingScale": [
								4,
								6,
								8,
								10,
								12
							],
							"subtraitRatingScale": [
								6,
								8,
								10,
								12
							],
							"reservedSlots": 1
						}
					},
					"traits": [
						{
							"name": "Name:",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [
								{
									"name": "d6 Benefit:",
									"value": 6,
									"dice": [],
									"description": "",
									"tags": [],
									"custom": {},
									"traits": [],
									"sfx": []
								},
								{
									"name": "d8 Benefit:",
									"value": 8,
									"dice": [],
									"description": "",
									"tags": [],
									"custom": {},
									"traits": [],
									"sfx": []
								},
								{
									"name": "d10 Benefit:",
									"value": 10,
									"dice": [],
									"description": "",
									"tags": [],
									"custom": {},
									"traits": [],
									"sfx": []
								},
								{
									"name": "d12 Benefit:",
									"value": 12,
									"dice": [],
									"description": "",
									"tags": [],
									"custom": {},
									"traits": [],
									"sfx": []
								}
							],
							"sfx": []
						}
					],
					"sfx": []
				},
				{
					"id": "building-2",
					"name": "Building 2",
					"description": "",
					"nounSingular": "Building",
					"nounPlural": "Buildings",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"header": "top",
							"headerAlign": "left",
							"features": {
								"description": true,
								"sfx": false,
								"subtraits": true
							},
							"location": "right",
							"page": 1,
							"style": {
								"header": "default",
								"body": "default"
							},
							"ratingScale": [
								4,
								6,
								8,
								10,
								12
							],
							"subtraitRatingScale": [
								6,
								8,
								10,
								12
							],
							"reservedSlots": 1
						}
					},
					"traits": [
						{
							"name": "Name:",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [
								{
									"name": "d6 Benefit:",
									"value": 6,
									"dice": [],
									"description": "",
									"tags": [],
									"custom": {},
									"traits": [],
									"sfx": []
								},
								{
									"name": "d8 Benefit:",
									"value": 8,
									"dice": [],
									"description": "",
									"tags": [],
									"custom": {},
									"traits": [],
									"sfx": []
								},
								{
									"name": "d10 Benefit:",
									"value": 10,
									"dice": [],
									"description": "",
									"tags": [],
									"custom": {},
									"traits": [],
									"sfx": []
								},
								{
									"name": "d12 Benefit:",
									"value": 12,
									"dice": [],
									"description": "",
									"tags": [],
									"custom": {},
									"traits": [],
									"sfx": []
								}
							],
							"sfx": []
						}
					],
					"sfx": []
				},
				{
					"id": "building-3",
					"name": "Building 3",
					"description": "",
					"nounSingular": "Building",
					"nounPlural": "Buildings",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"header": "top",
							"headerAlign": "left",
							"features": {
								"description": true,
								"sfx": false,
								"subtraits": true
							},
							"location": "left",
							"page": 1,
							"style": {
								"header": "default",
								"body": "default"
							},
							"ratingScale": [
								4,
								6,
								8,
								10,
								12
							],
							"subtraitRatingScale": [
								6,
								8,
								10,
								12
							],
							"reservedSlots": 1
						}
					},
					"traits": [
						{
							"name": "Name:",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [
								{
									"name": "d6 Benefit:",
									"value": 6,
									"dice": [],
									"description": "",
									"tags": [],
									"custom": {},
									"traits": [],
									"sfx": []
								},
								{
									"name": "d8 Benefit:",
									"value": 8,
									"dice": [],
									"description": "",
									"tags": [],
									"custom": {},
									"traits": [],
									"sfx": []
								},
								{
									"name": "d10 Benefit:",
									"value": 10,
									"dice": [],
									"description": "",
									"tags": [],
									"custom": {},
									"traits": [],
									"sfx": []
								},
								{
									"name": "d12 Benefit:",
									"value": 12,
									"dice": [],
									"description": "",
									"tags": [],
									"custom": {},
									"traits": [],
									"sfx": []
								}
							],
							"sfx": []
						}
					],
					"sfx": []
				},
				{
					"id": "building-4",
					"name": "Building 4",
					"description": "",
					"nounSingular": "Building",
					"nounPlural": "Buildings",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"header": "top",
							"headerAlign": "left",
							"features": {
								"description": true,
								"sfx": false,
								"subtraits": true
							},
							"location": "right",
							"page": 1,
							"style": {
								"header": "default",
								"body": "default"
							},
							"ratingScale": [
								4,
								6,
								8,
								10,
								12
							],
							"subtraitRatingScale": [
								6,
								8,
								10,
								12
							],
							"reservedSlots": 1
						}
					},
					"traits": [
						{
							"name": "Name:",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [
								{
									"name": "d6 Benefit:",
									"value": 6,
									"dice": [],
									"description": "",
									"tags": [],
									"custom": {},
									"traits": [],
									"sfx": []
								},
								{
									"name": "d8 Benefit:",
									"value": 8,
									"dice": [],
									"description": "",
									"tags": [],
									"custom": {},
									"traits": [],
									"sfx": []
								},
								{
									"name": "d10 Benefit:",
									"value": 10,
									"dice": [],
									"description": "",
									"tags": [],
									"custom": {},
									"traits": [],
									"sfx": []
								},
								{
									"name": "d12 Benefit:",
									"value": 12,
									"dice": [],
									"description": "",
									"tags": [],
									"custom": {},
									"traits": [],
									"sfx": []
								}
							],
							"sfx": []
						}
					],
					"sfx": []
				},
				{
					"id": "building-5",
					"name": "Building 5",
					"description": "",
					"nounSingular": "Building",
					"nounPlural": "Buildings",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"header": "top",
							"headerAlign": "left",
							"features": {
								"description": true,
								"sfx": false,
								"subtraits": true
							},
							"location": "left",
							"page": 1,
							"style": {
								"header": "default",
								"body": "default"
							},
							"ratingScale": [
								4,
								6,
								8,
								10,
								12
							],
							"subtraitRatingScale": [
								6,
								8,
								10,
								12
							],
							"reservedSlots": 1
						}
					},
					"traits": [
						{
							"name": "Name:",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [
								{
									"name": "d6 Benefit:",
									"value": 6,
									"dice": [],
									"description": "",
									"tags": [],
									"custom": {},
									"traits": [],
									"sfx": []
								},
								{
									"name": "d8 Benefit:",
									"value": 8,
									"dice": [],
									"description": "",
									"tags": [],
									"custom": {},
									"traits": [],
									"sfx": []
								},
								{
									"name": "d10 Benefit:",
									"value": 10,
									"dice": [],
									"description": "",
									"tags": [],
									"custom": {},
									"traits": [],
									"sfx": []
								},
								{
									"name": "d12 Benefit:",
									"value": 12,
									"dice": [],
									"description": "",
									"tags": [],
									"custom": {},
									"traits": [],
									"sfx": []
								}
							],
							"sfx": []
						}
					],
					"sfx": []
				},
				{
					"id": "building-6",
					"name": "Building 6",
					"description": "",
					"nounSingular": "Building",
					"nounPlural": "Buildings",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"header": "top",
							"headerAlign": "left",
							"features": {
								"description": true,
								"sfx": false,
								"subtraits": true
							},
							"location": "right",
							"page": 1,
							"style": {
								"header": "default",
								"body": "default"
							},
							"ratingScale": [
								4,
								6,
								8,
								10,
								12
							],
							"subtraitRatingScale": [
								6,
								8,
								10,
								12
							],
							"reservedSlots": 1
						}
					},
					"traits": [
						{
							"name": "Name:",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [
								{
									"name": "d6 Benefit:",
									"value": 6,
									"dice": [],
									"description": "",
									"tags": [],
									"custom": {},
									"traits": [],
									"sfx": []
								},
								{
									"name": "d8 Benefit:",
									"value": 8,
									"dice": [],
									"description": "",
									"tags": [],
									"custom": {},
									"traits": [],
									"sfx": []
								},
								{
									"name": "d10 Benefit:",
									"value": 10,
									"dice": [],
									"description": "",
									"tags": [],
									"custom": {},
									"traits": [],
									"sfx": []
								},
								{
									"name": "d12 Benefit:",
									"value": 12,
									"dice": [],
									"description": "",
									"tags": [],
									"custom": {},
									"traits": [],
									"sfx": []
								}
							],
							"sfx": []
						}
					],
					"sfx": []
				},
				{
					"id": "survivor-1",
					"name": "Survivor 1",
					"description": "",
					"nounSingular": "Survivor",
					"nounPlural": "Survivors",
					"hasQuestionedPip": true,
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"header": "top",
							"headerAlign": "left",
							"features": {
								"description": false,
								"sfx": false,
								"subtraits": false
							},
							"location": "left",
							"page": 2,
							"style": {
								"header": "default",
								"body": "default"
							},
							"ratingScale": [
								6,
								8,
								10,
								12
							],
							"reservedSlots": 5
						}
					},
					"traits": [
						{
							"name": "Morale",
							"value": 0,
							"dice": [],
							"description": "",
							"questioned": false,
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 6,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						}
					],
					"sfx": []
				},
				{
					"id": "survivor-2",
					"name": "Survivor 2",
					"description": "",
					"nounSingular": "Survivor",
					"nounPlural": "Survivors",
					"hasQuestionedPip": true,
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"header": "top",
							"headerAlign": "left",
							"features": {
								"description": false,
								"sfx": false,
								"subtraits": false
							},
							"location": "center",
							"page": 2,
							"style": {
								"header": "default",
								"body": "default"
							},
							"ratingScale": [
								6,
								8,
								10,
								12
							],
							"reservedSlots": 5
						}
					},
					"traits": [
						{
							"name": "Morale",
							"value": 0,
							"dice": [],
							"description": "",
							"questioned": false,
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 6,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						}
					],
					"sfx": []
				},
				{
					"id": "survivor-3",
					"name": "Survivor 3",
					"description": "",
					"nounSingular": "Survivor",
					"nounPlural": "Survivors",
					"hasQuestionedPip": true,
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"header": "top",
							"headerAlign": "left",
							"features": {
								"description": false,
								"sfx": false,
								"subtraits": false
							},
							"location": "right",
							"page": 2,
							"style": {
								"header": "default",
								"body": "default"
							},
							"ratingScale": [
								6,
								8,
								10,
								12
							],
							"reservedSlots": 5
						}
					},
					"traits": [
						{
							"name": "Morale",
							"value": 0,
							"dice": [],
							"description": "",
							"questioned": false,
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 6,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						}
					],
					"sfx": []
				},
				{
					"id": "survivor-4",
					"name": "Survivor 4",
					"description": "",
					"nounSingular": "Survivor",
					"nounPlural": "Survivors",
					"hasQuestionedPip": true,
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"header": "top",
							"headerAlign": "left",
							"features": {
								"description": false,
								"sfx": false,
								"subtraits": false
							},
							"location": "left",
							"page": 2,
							"style": {
								"header": "default",
								"body": "default"
							},
							"ratingScale": [
								6,
								8,
								10,
								12
							],
							"reservedSlots": 5
						}
					},
					"traits": [
						{
							"name": "Morale",
							"value": 0,
							"dice": [],
							"description": "",
							"questioned": false,
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 6,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						}
					],
					"sfx": []
				},
				{
					"id": "survivor-5",
					"name": "Survivor 5",
					"description": "",
					"nounSingular": "Survivor",
					"nounPlural": "Survivors",
					"hasQuestionedPip": true,
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"header": "top",
							"headerAlign": "left",
							"features": {
								"description": false,
								"sfx": false,
								"subtraits": false
							},
							"location": "center",
							"page": 2,
							"style": {
								"header": "default",
								"body": "default"
							},
							"ratingScale": [
								6,
								8,
								10,
								12
							],
							"reservedSlots": 5
						}
					},
					"traits": [
						{
							"name": "Morale",
							"value": 0,
							"dice": [],
							"description": "",
							"questioned": false,
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 6,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						}
					],
					"sfx": []
				},
				{
					"id": "survivor-6",
					"name": "Survivor 6",
					"description": "",
					"nounSingular": "Survivor",
					"nounPlural": "Survivors",
					"hasQuestionedPip": true,
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"header": "top",
							"headerAlign": "left",
							"features": {
								"description": false,
								"sfx": false,
								"subtraits": false
							},
							"location": "right",
							"page": 2,
							"style": {
								"header": "default",
								"body": "default"
							},
							"ratingScale": [
								6,
								8,
								10,
								12
							],
							"reservedSlots": 5
						}
					},
					"traits": [
						{
							"name": "Morale",
							"value": 0,
							"dice": [],
							"description": "",
							"questioned": false,
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 6,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						}
					],
					"sfx": []
				},
				{
					"id": "survivor-7",
					"name": "Survivor 7",
					"description": "",
					"nounSingular": "Survivor",
					"nounPlural": "Survivors",
					"hasQuestionedPip": true,
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"header": "top",
							"headerAlign": "left",
							"features": {
								"description": false,
								"sfx": false,
								"subtraits": false
							},
							"location": "left",
							"page": 2,
							"style": {
								"header": "default",
								"body": "default"
							},
							"ratingScale": [
								6,
								8,
								10,
								12
							],
							"reservedSlots": 5
						}
					},
					"traits": [
						{
							"name": "Morale",
							"value": 0,
							"dice": [],
							"description": "",
							"questioned": false,
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 6,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						}
					],
					"sfx": []
				},
				{
					"id": "survivor-8",
					"name": "Survivor 8",
					"description": "",
					"nounSingular": "Survivor",
					"nounPlural": "Survivors",
					"hasQuestionedPip": true,
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"header": "top",
							"headerAlign": "left",
							"features": {
								"description": false,
								"sfx": false,
								"subtraits": false
							},
							"location": "center",
							"page": 2,
							"style": {
								"header": "default",
								"body": "default"
							},
							"ratingScale": [
								6,
								8,
								10,
								12
							],
							"reservedSlots": 5
						}
					},
					"traits": [
						{
							"name": "Morale",
							"value": 0,
							"dice": [],
							"description": "",
							"questioned": false,
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 6,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						}
					],
					"sfx": []
				},
				{
					"id": "survivor-9",
					"name": "Survivor 9",
					"description": "",
					"nounSingular": "Survivor",
					"nounPlural": "Survivors",
					"hasQuestionedPip": true,
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"header": "top",
							"headerAlign": "left",
							"features": {
								"description": false,
								"sfx": false,
								"subtraits": false
							},
							"location": "right",
							"page": 2,
							"style": {
								"header": "default",
								"body": "default"
							},
							"ratingScale": [
								6,
								8,
								10,
								12
							],
							"reservedSlots": 5
						}
					},
					"traits": [
						{
							"name": "Morale",
							"value": 0,
							"dice": [],
							"description": "",
							"questioned": false,
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 6,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						}
					],
					"sfx": []
				},
				{
					"id": "colony-projects",
					"name": "Notes",
					"description": "",
					"nounSingular": "Note",
					"nounPlural": "Notes",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"header": "top",
							"headerAlign": "left",
							"features": {
								"description": false,
								"sfx": false,
								"subtraits": false
							},
							"location": "left",
							"page": 2,
							"style": {
								"header": "default",
								"body": "notes"
							},
							"notes": "",
							"colSpan": "full",
							"columnSpan": "full"
						}
					},
					"traits": [],
					"sfx": []
				}
			]
		}
	},
	{
		"id": "spotlight-snowfall-initiative",
		"version": 1,
		"title": "Snowfall Initiative",
		"subtitle": "Cold War Espionage & Super-Spies",
		"spotlight": "Snowfall Initiative",
		"variant": "Agent File",
		"pages": 1,
		"genre": "Spy / Cold War / High-Tech",
		"description": "Elite operatives conducting clandestine black-ops missions in sub-zero locales. Features Distinctions (Role, Background, Personality), Affiliations (Diplomacy, Discovery, Defense), Complications (Frostbite, Hypothermia), Attributes with Stress (Brawn, Endurance, Grace, Grit, Mettle, Smarts), 19 Skills & d6 Specialties, Signature Assets, Talents, Gifts, Milestones, and an XP track.",
		"character": {
			"$schema": "https://cortex.engard.me/schema/0.1/character.schema.json",
			"version": "0.1",
			"id": "template-spotlight-snowfall",
			"isTemplate": true,
			"name": "",
			"game": "Snowfall Initiative",
			"description": "",
			"pronouns": "",
			"plotPoints": 1,
			"notes": "",
			"custom": {
				"cortexToolkit": {
					"pageCount": 1,
					"spotlight": "Snowfall Initiative",
					"style": {
						"hasAttributes": false
					},
					"sheetStyle": "spotlight",
					"columns": 3,
					"watermark": {
						"enabled": true,
						"url": "images/cortex_prime_logo_light_transparent.png",
						"opacity": 0.08,
						"scale": 70,
						"page": "all"
					},
					"columnAlignment": "top-base",
					"columnOffsets": {
						"left": 0,
						"center": 0,
						"right": 0
					}
				}
			},
			"player": "",
			"portrait": {
				"url": "",
				"custom": {
					"cortexToolkit": {
						"size": "spotlight",
						"location": "header"
					}
				}
			},
			"traitSets": [
				{
					"id": "distinctions",
					"name": "Distinctions",
					"description": "Cover identity, espionage specialization, and personal objective",
					"nounSingular": "Distinction",
					"nounPlural": "Distinctions",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"features": {
								"description": true,
								"sfx": false,
								"subtraits": false
							},
							"sharedHinder": true,
							"sharedHinderText": "Gain a PP when you trade out your distinction's d8 rating for a d4.",
							"ratingScale": [
								8
							],
							"location": "left",
							"page": 1,
							"style": {
								"header": "distinctions",
								"body": "distinctions"
							},
							"multiDie": false,
							"stressConfig": {
								"includeOut": true
							},
							"notes": "",
							"reservedSlots": 3,
							"colSpan": "full",
							"columnSpan": "full"
						}
					},
					"traits": [
						{
							"name": "Role",
							"value": 8,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": [
								"hinder"
							]
						},
						{
							"name": "Background",
							"value": 8,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": [
								"hinder"
							]
						},
						{
							"name": "Personality",
							"value": 8,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": [
								"hinder"
							]
						}
					],
					"sfx": []
				},
				{
					"id": "affiliations",
					"name": "Affiliations",
					"description": "Operational deployment modes",
					"nounSingular": "Affiliation",
					"nounPlural": "Affiliations",
					"ratingPosition": "below",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"header": "top",
							"headerAlign": "center",
							"features": {
								"description": false,
								"sfx": false,
								"subtraits": false
							},
							"location": "left",
							"page": 1,
							"style": {
								"header": "default",
								"body": "default"
							},
							"ratingPosition": "below",
							"ratingScale": [
								4,
								6,
								8,
								10,
								12
							],
							"multiDie": false,
							"stressConfig": {
								"includeOut": true
							},
							"notes": "",
							"reservedSlots": 3,
							"colWidth": 23
						}
					},
					"traits": [
						{
							"name": "Diplomacy",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Discovery",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Defense",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						}
					],
					"sfx": []
				},
				{
					"id": "complications",
					"name": "Complications",
					"description": "",
					"nounSingular": "Complication",
					"nounPlural": "Complications",
					"ratingPosition": "below",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"header": "top",
							"headerAlign": "center",
							"features": {
								"description": false,
								"sfx": false,
								"subtraits": false
							},
							"location": "center",
							"page": 1,
							"style": {
								"header": "stress",
								"body": "stress"
							},
							"ratingPosition": "below",
							"ratingScale": [
								4,
								6,
								8,
								10,
								12
							],
							"stressConfig": {
								"includeD4": true,
								"includeOut": false
							},
							"reservedSlots": 2,
							"colWidth": 25
						}
					},
					"traits": [
						{
							"name": "Frostbite",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Hypothermia",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						}
					],
					"sfx": []
				},
				{
					"id": "attributes-stress",
					"name": "Attributes & Stress",
					"description": "Core operative capabilities and physical resilience",
					"nounSingular": "Attribute",
					"nounPlural": "Attributes",
					"ratingPosition": "inline",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"header": "top",
							"headerAlign": "center",
							"features": {
								"description": false,
								"sfx": false,
								"subtraits": false
							},
							"location": "right",
							"page": 1,
							"style": {
								"header": "default",
								"body": "default"
							},
							"ratingScale": [
								4,
								6,
								8,
								10,
								12
							],
							"attachedStress": {
								"enabled": true,
								"label": "Stress",
								"ratingScale": [
									4,
									6,
									8,
									10,
									12
								],
								"scale": [
									4,
									6,
									8,
									10,
									12
								],
								"includeOut": false
							},
							"multiDie": false,
							"stressConfig": {
								"includeOut": false
							},
							"notes": "",
							"reservedSlots": 6,
							"attributesRing": false,
							"colWidth": 52
						}
					},
					"traits": [
						{
							"name": "Brawn",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Endurance",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Grace",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Grit",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Mettle",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Smarts",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						}
					],
					"sfx": []
				},
				{
					"id": "subtrait-columns",
					"name": "Skills & Specialties",
					"description": "Black-ops competencies and d6 specialties",
					"nounSingular": "Skill",
					"nounPlural": "Skills",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"header": "top",
							"headerAlign": "center",
							"traitColumns": 2,
							"features": {
								"description": false,
								"sfx": false,
								"subtraits": true
							},
							"location": "left",
							"page": 1,
							"style": {
								"header": "default",
								"body": "default"
							},
							"ratingScale": [
								4,
								6,
								8,
								10,
								12
							],
							"subtraitRatingScale": [
								6
							],
							"multiDie": false,
							"stressConfig": {
								"includeOut": true
							},
							"notes": "",
							"reservedSlots": 19,
							"colSpan": "full",
							"columnSpan": "full"
						}
					},
					"traits": [
						{
							"name": "Craft",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Drive",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Fight",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Fix",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Fly",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Focus",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Influence",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Know",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Labor",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Move",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Notice",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Operate",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Perform",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Shoot",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Sneak",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Survive",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Throw",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Treat",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Trick",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						}
					],
					"sfx": []
				},
				{
					"id": "signature-assets-gifts",
					"name": "Signature Assets",
					"description": "Classified spy gear and experimental equipment",
					"nounSingular": "Signature Asset",
					"nounPlural": "Signature Assets",
					"ratingPosition": "inline",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"header": "top",
							"headerAlign": "center",
							"features": {
								"description": true,
								"sfx": false,
								"subtraits": false
							},
							"location": "left",
							"page": 1,
							"style": {
								"header": "default",
								"body": "default"
							},
							"ratingScale": [
								6,
								8,
								10,
								12
							],
							"multiDie": false,
							"stressConfig": {
								"includeOut": true
							},
							"notes": "",
							"reservedSlots": 3,
							"colWidth": 35
						}
					},
					"traits": [
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						}
					],
					"sfx": []
				},
				{
					"id": "talents",
					"name": "Talents",
					"description": "",
					"nounSingular": "Talent",
					"nounPlural": "Talents",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"features": {
								"description": true,
								"sfx": true,
								"subtraits": false
							},
							"location": "center",
							"page": 1,
							"style": {
								"header": "three-column-table",
								"body": "three-column-table"
							},
							"reservedSlots": 3,
							"colSpan": 2,
							"columnSpan": 2
						}
					},
					"traits": [
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						}
					],
					"sfx": []
				},
				{
					"id": "gifts",
					"name": "Gifts",
					"description": "",
					"nounSingular": "Gift",
					"nounPlural": "Gifts",
					"ratingPosition": "below",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"header": "top",
							"headerAlign": "center",
							"features": {
								"description": true,
								"sfx": false,
								"subtraits": false
							},
							"location": "left",
							"page": 1,
							"style": {
								"header": "default",
								"body": "default"
							},
							"ratingPosition": "below",
							"ratingScale": [
								4,
								6,
								8,
								10,
								12
							],
							"reservedSlots": 2,
							"colWidth": 25,
							"rowBreak": true
						}
					},
					"traits": [
						{
							"name": "Gift of",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Gift of~2",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						}
					],
					"sfx": []
				},
				{
					"id": "milestones",
					"name": "Milestones",
					"description": "",
					"nounSingular": "Milestone",
					"nounPlural": "Milestones",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"header": "top",
							"headerAlign": "center",
							"traitColumns": 2,
							"features": {
								"description": false,
								"sfx": false,
								"subtraits": false
							},
							"location": "center",
							"page": 1,
							"style": {
								"header": "default",
								"body": "notes"
							},
							"notes": "- **1 XP** when \n- **3 XP** when \n- **10 XP** when \n- **1 XP** when \n- **3 XP** when \n- **10 XP** when ",
							"colWidth": 50
						}
					},
					"traits": [],
					"sfx": []
				},
				{
					"id": "xp",
					"name": "XP",
					"description": "",
					"nounSingular": "Pip",
					"nounPlural": "Pips",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"features": {
								"description": false,
								"sfx": false,
								"subtraits": false
							},
							"location": "right",
							"page": 1,
							"style": {
								"header": "default",
								"body": "pips"
							},
							"pipsConfig": {
								"rows": 5,
								"perRow": 4,
								"filled": 0
							},
							"pips": {
								"count": 20,
								"perRow": 4,
								"connected": false,
								"filled": 0
							},
							"colWidth": 25
						}
					},
					"traits": [],
					"sfx": []
				}
			]
		}
	},
	{
		"id": "spotlight-solarpunk-citizen",
		"version": 1,
		"title": "SolarPunk",
		"subtitle": "Ecological Hope & Community Technology",
		"spotlight": "SolarPunk",
		"variant": "Citizen File",
		"pages": 1,
		"genre": "SolarPunk / Sci-Fi / Community",
		"description": "Artisans, engineers, and ecologists building a flourishing, sustainable green future together. Features Attributes (Mind, Body, Connection), Distinctions (Identity, Community, Purpose) with SFX, a 20-pip Session Record grid, Signature Assets with SFX, and 19 Skills & d6 Specialties.",
		"character": {
			"$schema": "https://cortex.engard.me/schema/0.1/character.schema.json",
			"version": "0.1",
			"id": "template-spotlight-solarpunk-citizen",
			"isTemplate": true,
			"name": "",
			"game": "SolarPunk",
			"description": "",
			"pronouns": "",
			"plotPoints": 1,
			"notes": "",
			"custom": {
				"cortexToolkit": {
					"pageCount": 1,
					"spotlight": "SolarPunk",
					"style": {
						"hasAttributes": false
					},
					"sheetStyle": "spotlight",
					"columns": 2,
					"watermark": {
						"enabled": true,
						"url": "images/cortex_prime_logo_light_transparent.png",
						"opacity": 0.08,
						"scale": 70,
						"page": "all"
					},
					"columnAlignment": "top-base",
					"columnOffsets": {
						"left": 0,
						"center": 0,
						"right": 0
					}
				}
			},
			"player": "",
			"portrait": {
				"url": "",
				"custom": {
					"cortexToolkit": {
						"size": "spotlight",
						"location": "header"
					}
				}
			},
			"traitSets": [
				{
					"id": "attributes",
					"name": "Attributes",
					"description": "SolarPunk holistic community attributes",
					"nounSingular": "Attribute",
					"nounPlural": "Attributes",
					"ratingPosition": "below",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"features": {
								"description": false,
								"sfx": false,
								"subtraits": false
							},
							"location": "left",
							"page": 1,
							"style": {
								"header": "default",
								"body": "default"
							},
							"ratingPosition": "below",
							"ratingScale": [
								4,
								6,
								8,
								10,
								12
							],
							"multiDie": false,
							"stressConfig": {
								"includeOut": true
							},
							"notes": "",
							"reservedSlots": 3,
							"attributesRing": false,
							"colWidth": 28
						}
					},
					"traits": [
						{
							"name": "Mind",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Body",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Connection",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						}
					],
					"sfx": []
				},
				{
					"id": "session-record",
					"name": "Session Record",
					"description": "",
					"nounSingular": "Session",
					"nounPlural": "Sessions",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"features": {
								"description": false,
								"sfx": false,
								"subtraits": false
							},
							"location": "left",
							"page": 1,
							"style": {
								"header": "default",
								"body": "pips"
							},
							"pipsConfig": {
								"rows": 4,
								"perRow": 5,
								"filled": 0
							},
							"pips": {
								"count": 20,
								"perRow": 5,
								"connected": true,
								"filled": 0
							},
							"reservedSlots": 0,
							"colWidth": 28
						}
					},
					"traits": [],
					"sfx": []
				},
				{
					"id": "distinctions",
					"name": "Distinctions",
					"description": "Ecological calling, community role, and personal purpose",
					"nounSingular": "Distinction",
					"nounPlural": "Distinctions",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"features": {
								"description": true,
								"sfx": true,
								"subtraits": false
							},
							"sharedHinder": true,
							"sharedHinderText": "Gain a PP when you trade out your distinction's d8 rating for a d4.",
							"ratingScale": [
								8
							],
							"location": "right",
							"rowSpan": 2,
							"page": 1,
							"style": {
								"header": "distinctions",
								"body": "distinctions"
							},
							"multiDie": false,
							"stressConfig": {
								"includeOut": true
							},
							"notes": "",
							"reservedSlots": 3
						}
					},
					"traits": [
						{
							"name": "Identity:",
							"value": 8,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": [
								"hinder",
								{
									"name": "",
									"description": "",
									"tags": [],
									"custom": {}
								},
								{
									"name": "",
									"description": "",
									"tags": [],
									"custom": {}
								}
							]
						},
						{
							"name": "Community:",
							"value": 8,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": [
								"hinder",
								{
									"name": "",
									"description": "",
									"tags": [],
									"custom": {}
								},
								{
									"name": "",
									"description": "",
									"tags": [],
									"custom": {}
								}
							]
						},
						{
							"name": "Purpose:",
							"value": 8,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": [
								"hinder",
								{
									"name": "",
									"description": "",
									"tags": [],
									"custom": {}
								},
								{
									"name": "",
									"description": "",
									"tags": [],
									"custom": {}
								}
							]
						}
					],
					"sfx": []
				},
				{
					"id": "signature-assets",
					"name": "Signature Assets",
					"description": "Sustainable tech, tools, and eco-craft",
					"nounSingular": "Signature Asset",
					"nounPlural": "Signature Assets",
					"ratingPosition": "inline",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"header": "top",
							"headerAlign": "center",
							"traitColumns": 2,
							"features": {
								"description": true,
								"sfx": true,
								"subtraits": false
							},
							"location": "left",
							"page": 1,
							"style": {
								"header": "default",
								"body": "default"
							},
							"ratingScale": [
								6,
								8,
								10,
								12
							],
							"multiDie": false,
							"stressConfig": {
								"includeOut": true
							},
							"notes": "",
							"reservedSlots": 2,
							"colSpan": "full",
							"columnSpan": "full"
						}
					},
					"traits": [
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": [
								{
									"name": "",
									"description": "",
									"tags": [],
									"custom": {}
								}
							]
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": [
								{
									"name": "",
									"description": "",
									"tags": [],
									"custom": {}
								}
							]
						}
					],
					"sfx": []
				},
				{
					"id": "subtrait-columns",
					"name": "Skills & Specialties",
					"description": "Ecological competencies (d4-d12) and d6 craft specialties",
					"nounSingular": "Skill",
					"nounPlural": "Skills",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"header": "top",
							"headerAlign": "center",
							"traitColumns": 2,
							"features": {
								"description": false,
								"sfx": false,
								"subtraits": true
							},
							"location": "left",
							"page": 1,
							"style": {
								"header": "default",
								"body": "default"
							},
							"ratingScale": [
								4,
								6,
								8,
								10,
								12
							],
							"subtraitRatingScale": [
								6
							],
							"multiDie": false,
							"stressConfig": {
								"includeOut": true
							},
							"notes": "",
							"reservedSlots": 19,
							"colSpan": "full",
							"columnSpan": "full"
						}
					},
					"traits": [
						{
							"name": "Craft",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Drive",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Fight",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Fix",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Fly",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Focus",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Influence",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Know",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Labor",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Move",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Notice",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Operate",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Perform",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Shoot",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Sneak",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Survive",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Throw",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Treat",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Trick",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						}
					],
					"sfx": []
				}
			]
		}
	},
	{
		"id": "spotlight-solarpunk-commune",
		"version": 1,
		"title": "SolarPunk - Commune File",
		"subtitle": "Ecological Hope & Community Technology",
		"spotlight": "SolarPunk",
		"variant": "Commune File",
		"pages": 1,
		"genre": "SolarPunk / Settlement",
		"description": "Bioregional commune worksheet for SolarPunk settings. Tracks Commune Attributes (Resources, Security, Connections — d4 to d8), Commune Distinctions (Unity, Organization, Morale), 4 d6 Signature Assets, and 9 Commune Skills (d6-d8).",
		"character": {
			"$schema": "https://cortex.engard.me/schema/0.1/character.schema.json",
			"version": "0.1",
			"id": "template-spotlight-solarpunk-commune",
			"isTemplate": true,
			"name": "",
			"game": "SolarPunk",
			"description": "",
			"pronouns": "",
			"plotPoints": 1,
			"notes": "",
			"custom": {
				"cortexToolkit": {
					"pageCount": 1,
					"spotlight": "SolarPunk",
					"style": {
						"hasAttributes": false
					},
					"sheetStyle": "spotlight",
					"columns": 2,
					"watermark": {
						"enabled": true,
						"url": "images/cortex_prime_logo_light_transparent.png",
						"opacity": 0.08,
						"scale": 70,
						"page": "all"
					},
					"columnAlignment": "top-base",
					"columnOffsets": {
						"left": 0,
						"center": 0,
						"right": 0
					}
				}
			},
			"player": "",
			"portrait": {
				"url": "",
				"custom": {
					"cortexToolkit": {
						"size": "spotlight",
						"location": "header"
					}
				}
			},
			"traitSets": [
				{
					"id": "commune-attributes",
					"name": "Attributes",
					"description": "Collective settlement strengths",
					"nounSingular": "Attribute",
					"nounPlural": "Attributes",
					"ratingPosition": "below",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"features": {
								"description": false,
								"sfx": false,
								"subtraits": false
							},
							"location": "left",
							"page": 1,
							"style": {
								"header": "default",
								"body": "default"
							},
							"ratingPosition": "below",
							"ratingScale": [
								4,
								6,
								8
							],
							"multiDie": false,
							"stressConfig": {
								"includeOut": true
							},
							"notes": "",
							"reservedSlots": 3,
							"attributesRing": false,
							"colWidth": 28
						}
					},
					"traits": [
						{
							"name": "Resources",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Security",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Connections",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						}
					],
					"sfx": []
				},
				{
					"id": "commune-distinctions",
					"name": "Distinctions",
					"description": "Settlement unity, organization, and morale",
					"nounSingular": "Distinction",
					"nounPlural": "Distinctions",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"features": {
								"description": true,
								"sfx": false,
								"subtraits": false
							},
							"sharedHinder": true,
							"sharedHinderText": "Gain a PP when you trade out your distinction's d8 rating for a d4.",
							"ratingScale": [
								8
							],
							"location": "right",
							"page": 1,
							"style": {
								"header": "distinctions",
								"body": "distinctions"
							},
							"multiDie": false,
							"stressConfig": {
								"includeOut": true
							},
							"notes": "",
							"reservedSlots": 3
						}
					},
					"traits": [
						{
							"name": "Unity:",
							"value": 8,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": [
								"hinder"
							]
						},
						{
							"name": "Organization:",
							"value": 8,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": [
								"hinder"
							]
						},
						{
							"name": "Morale:",
							"value": 8,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": [
								"hinder"
							]
						}
					],
					"sfx": []
				},
				{
					"id": "signature-assets",
					"name": "Signature Assets",
					"description": "",
					"nounSingular": "Asset",
					"nounPlural": "Assets",
					"ratingPosition": "inline",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"header": "top",
							"headerAlign": "center",
							"traitColumns": 2,
							"features": {
								"description": true,
								"sfx": false,
								"subtraits": false
							},
							"location": "left",
							"page": 1,
							"style": {
								"header": "default",
								"body": "default"
							},
							"ratingScale": [
								6
							],
							"reservedSlots": 4,
							"colSpan": "full",
							"columnSpan": "full"
						}
					},
					"traits": [
						{
							"name": "",
							"value": 6,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 6,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 6,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 6,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						}
					],
					"sfx": []
				},
				{
					"id": "skills",
					"name": "Skills",
					"description": "",
					"nounSingular": "Skill",
					"nounPlural": "Skills",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"header": "top",
							"headerAlign": "left",
							"features": {
								"description": false,
								"sfx": false,
								"subtraits": true
							},
							"location": "left",
							"page": 1,
							"style": {
								"header": "default",
								"body": "subtrait-columns"
							},
							"ratingScale": [
								6,
								8
							],
							"subtraitRatingScale": [],
							"reservedSlots": 9,
							"colSpan": "full",
							"columnSpan": "full"
						}
					},
					"traits": [
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [
								{
									"name": "",
									"value": 0,
									"dice": [],
									"description": "",
									"tags": [],
									"custom": {},
									"traits": [],
									"sfx": []
								}
							],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [
								{
									"name": "",
									"value": 0,
									"dice": [],
									"description": "",
									"tags": [],
									"custom": {},
									"traits": [],
									"sfx": []
								}
							],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [
								{
									"name": "",
									"value": 0,
									"dice": [],
									"description": "",
									"tags": [],
									"custom": {},
									"traits": [],
									"sfx": []
								}
							],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [
								{
									"name": "",
									"value": 0,
									"dice": [],
									"description": "",
									"tags": [],
									"custom": {},
									"traits": [],
									"sfx": []
								}
							],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [
								{
									"name": "",
									"value": 0,
									"dice": [],
									"description": "",
									"tags": [],
									"custom": {},
									"traits": [],
									"sfx": []
								}
							],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [
								{
									"name": "",
									"value": 0,
									"dice": [],
									"description": "",
									"tags": [],
									"custom": {},
									"traits": [],
									"sfx": []
								}
							],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [
								{
									"name": "",
									"value": 0,
									"dice": [],
									"description": "",
									"tags": [],
									"custom": {},
									"traits": [],
									"sfx": []
								}
							],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [
								{
									"name": "",
									"value": 0,
									"dice": [],
									"description": "",
									"tags": [],
									"custom": {},
									"traits": [],
									"sfx": []
								}
							],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [
								{
									"name": "",
									"value": 0,
									"dice": [],
									"description": "",
									"tags": [],
									"custom": {},
									"traits": [],
									"sfx": []
								}
							],
							"sfx": []
						}
					],
					"sfx": []
				}
			]
		}
	},
	{
		"id": "spotlight-spellcaught",
		"version": 1,
		"title": "Spellcaught",
		"subtitle": "Arcane Curses & Eldritch Magic",
		"spotlight": "Spellcaught",
		"variant": "Character File",
		"pages": 1,
		"genre": "Fantasy / Eldritch / Arcane",
		"description": "Mortals touched, cursed, or mutated by runaway magical disasters. Features Growth Pool, Distinctions with Hinder, 6 Values with statements, 4 Affiliations (Self, Family, School, Coven) with statements, 6 Signature Assets, 5 Stress tracks, 10 Arcane Crafts, and 4 SFX boxes.",
		"character": {
			"$schema": "https://cortex.engard.me/schema/0.1/character.schema.json",
			"version": "0.1",
			"id": "template-spotlight-spellcaught",
			"isTemplate": true,
			"name": "",
			"game": "Spellcaught",
			"description": "",
			"pronouns": "",
			"plotPoints": 1,
			"notes": "",
			"custom": {
				"cortexToolkit": {
					"pageCount": 1,
					"spotlight": "Spellcaught",
					"style": {
						"hasAttributes": false
					},
					"sheetStyle": "spotlight",
					"columns": 3,
					"watermark": {
						"enabled": true,
						"url": "images/cortex_prime_logo_light_transparent.png",
						"opacity": 0.08,
						"scale": 70,
						"page": "all"
					},
					"columnAlignment": "top-base",
					"columnOffsets": {
						"left": 0,
						"center": 0,
						"right": 0
					}
				}
			},
			"player": "",
			"portrait": {
				"url": "",
				"custom": {
					"cortexToolkit": {
						"size": "spotlight",
						"location": "header"
					}
				}
			},
			"traitSets": [
				{
					"id": "growth-pool",
					"name": "Growth Pool",
					"description": "",
					"nounSingular": "Growth Die",
					"nounPlural": "Growth Dice",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"features": {
								"description": false,
								"sfx": false,
								"subtraits": false
							},
							"location": "left",
							"page": 1,
							"style": {
								"header": "dice-ladder",
								"body": "dice-ladder"
							},
							"ratingScale": [
								4,
								6,
								8,
								10,
								12
							],
							"reservedSlots": 5,
							"colWidth": 22
						}
					},
					"traits": [
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						}
					],
					"sfx": []
				},
				{
					"id": "distinctions",
					"name": "Distinctions",
					"description": "Origin of the magical calamity and personal burden",
					"nounSingular": "Distinction",
					"nounPlural": "Distinctions",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"features": {
								"description": true,
								"sfx": false,
								"subtraits": false
							},
							"sharedHinder": true,
							"sharedHinderText": "Gain a PP when you trade out your distinction's d8 rating for a d4.",
							"ratingScale": [
								8
							],
							"location": "center",
							"page": 1,
							"style": {
								"header": "distinctions",
								"body": "distinctions"
							},
							"multiDie": false,
							"stressConfig": {
								"includeOut": true
							},
							"notes": "",
							"reservedSlots": 3,
							"colSpan": 2,
							"columnSpan": 2
						}
					},
					"traits": [
						{
							"name": "",
							"value": 8,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": [
								"hinder"
							]
						},
						{
							"name": "",
							"value": 8,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": [
								"hinder"
							]
						},
						{
							"name": "",
							"value": 8,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": [
								"hinder"
							]
						}
					],
					"sfx": []
				},
				{
					"id": "values",
					"name": "Values",
					"description": "Gain a PP when you use your d4 value.",
					"nounSingular": "Value",
					"nounPlural": "Values",
					"statement": true,
					"ratingPosition": "inline",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"features": {
								"description": true,
								"sfx": false,
								"subtraits": false
							},
							"location": "left",
							"page": 1,
							"style": {
								"header": "default",
								"body": "default"
							},
							"statement": true,
							"ratingScale": [
								4,
								6,
								8,
								10,
								12
							],
							"multiDie": false,
							"stressConfig": {
								"includeOut": true
							},
							"notes": "",
							"reservedSlots": 6,
							"colSpan": 2,
							"columnSpan": 2
						}
					},
					"traits": [
						{
							"name": "Ambition",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Responsibility",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Belonging",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Popularity",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Empathy",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Secrecy",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						}
					],
					"sfx": []
				},
				{
					"id": "signature-assets",
					"name": "Signature Assets",
					"description": "",
					"nounSingular": "Asset",
					"nounPlural": "Assets",
					"ratingPosition": "above",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"features": {
								"description": true,
								"sfx": false,
								"subtraits": false
							},
							"location": "right",
							"rowSpan": 2,
							"page": 1,
							"style": {
								"header": "default",
								"body": "default"
							},
							"ratingPosition": "above",
							"ratingScale": [
								6,
								8,
								10,
								12
							],
							"reservedSlots": 6
						}
					},
					"traits": [
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						}
					],
					"sfx": []
				},
				{
					"id": "affiliations",
					"name": "Affiliations",
					"description": "When Worlds Collide: When two affiliations are in the same scene, add a d6 to the doom pool and a d4 to your dice pool to include both affiliations in your pool.",
					"nounSingular": "Affiliation",
					"nounPlural": "Affiliations",
					"statement": true,
					"ratingPosition": "inline",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"features": {
								"description": true,
								"sfx": false,
								"subtraits": false
							},
							"location": "left",
							"page": 1,
							"style": {
								"header": "default",
								"body": "default"
							},
							"statement": true,
							"ratingScale": [
								4,
								6,
								8,
								10,
								12
							],
							"multiDie": false,
							"stressConfig": {
								"includeOut": true
							},
							"notes": "",
							"reservedSlots": 4,
							"colSpan": 2,
							"columnSpan": 2
						}
					},
					"traits": [
						{
							"name": "Self",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Family",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "School",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Coven",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						}
					],
					"sfx": []
				},
				{
					"id": "stress",
					"name": "Stress",
					"description": "",
					"nounSingular": "Stress",
					"nounPlural": "Stress",
					"ratingPosition": "below",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"header": "top",
							"headerAlign": "left",
							"features": {
								"description": false,
								"sfx": false,
								"subtraits": false
							},
							"location": "left",
							"page": 1,
							"style": {
								"header": "stress",
								"body": "stress"
							},
							"ratingPosition": "below",
							"ratingScale": [
								4,
								6,
								8,
								10,
								12
							],
							"stressConfig": {
								"includeD4": true,
								"includeOut": false
							},
							"reservedSlots": 5,
							"colWidth": 24,
							"rowBreak": true
						}
					},
					"traits": [
						{
							"name": "Angry",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Depressed",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Exhausted",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Insecure",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Injured",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						}
					],
					"sfx": []
				},
				{
					"id": "arcane-crafts-sfx",
					"name": "Crafts",
					"description": "Mutated magical expressions and spellcasting disciplines",
					"nounSingular": "Craft",
					"nounPlural": "Crafts",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"features": {
								"description": false,
								"sfx": false,
								"subtraits": false
							},
							"location": "center",
							"page": 1,
							"style": {
								"header": "default",
								"body": "default"
							},
							"ratingScale": [
								4,
								6,
								8,
								10,
								12
							],
							"multiDie": false,
							"stressConfig": {
								"includeOut": true
							},
							"notes": "",
							"reservedSlots": 10,
							"colWidth": 48
						}
					},
					"traits": [
						{
							"name": "Azure Sympathy",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Black Wards",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Bronze Mending",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Crimson Passion",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Golden Inspiration",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Orange Flare",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Pink Fidelity",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Purple Veils",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Verdant Conjuration",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "White Purification",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						}
					],
					"sfx": []
				},
				{
					"id": "sfx",
					"name": "SFX",
					"nounSingular": "SFX",
					"nounPlural": "SFX",
					"ratingPosition": "above",
					"tags": [],
					"traits": [
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						}
					],
					"sfx": []
				}
			]
		}
	},
	{
		"id": "spotlight-strange-towns",
		"version": 1,
		"title": "Strange Towns",
		"subtitle": "Small Town Supernatural Weirdness",
		"spotlight": "Strange Towns",
		"variant": "Townsperson File",
		"pages": 1,
		"genre": "Horror / Small Town / Weird Fiction",
		"description": "Residents uncovering the bizarre, surreal, and terrifying secrets beneath their peaceful small town. Features Attributes (Mental, Physical, Social — d6 to d10), 6 Roles (Enforcer, Entrepreneur, Rebel, Sage, Shepherd, Townie), Distinctions (Mundane, Offbeat, Strange), 6 Relationships, d8 Signature Assets, Complications, and the Strange Die.",
		"character": {
			"$schema": "https://cortex.engard.me/schema/0.1/character.schema.json",
			"version": "0.1",
			"id": "template-spotlight-strange-towns",
			"isTemplate": true,
			"name": "",
			"game": "Strange Towns",
			"description": "",
			"pronouns": "",
			"plotPoints": 1,
			"notes": "",
			"custom": {
				"cortexToolkit": {
					"pageCount": 1,
					"spotlight": "Strange Towns",
					"style": {
						"hasAttributes": false
					},
					"sheetStyle": "spotlight",
					"columns": 3,
					"watermark": {
						"enabled": true,
						"url": "images/cortex_prime_logo_light_transparent.png",
						"opacity": 0.08,
						"scale": 70,
						"page": "all"
					},
					"columnAlignment": "top-base",
					"columnOffsets": {
						"left": 0,
						"center": 0,
						"right": 0
					}
				}
			},
			"player": "",
			"portrait": {
				"url": "",
				"custom": {
					"cortexToolkit": {
						"size": "spotlight",
						"location": "header"
					}
				}
			},
			"traitSets": [
				{
					"id": "attributes",
					"name": "Attributes",
					"description": "Core attributes",
					"nounSingular": "Attribute",
					"nounPlural": "Attributes",
					"ratingPosition": "below",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"features": {
								"description": false,
								"sfx": false,
								"subtraits": false
							},
							"location": "left",
							"page": 1,
							"style": {
								"header": "default",
								"body": "default"
							},
							"ratingPosition": "below",
							"ratingScale": [
								6,
								8,
								10
							],
							"multiDie": false,
							"stressConfig": {
								"includeOut": true
							},
							"notes": "",
							"reservedSlots": 3,
							"attributesRing": false,
							"colWidth": 28
						}
					},
					"traits": [
						{
							"name": "Mental",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Physical",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Social",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						}
					],
					"sfx": []
				},
				{
					"id": "distinctions",
					"name": "Distinctions",
					"description": "Mundane, Offbeat, and Strange facets of town life",
					"nounSingular": "Distinction",
					"nounPlural": "Distinctions",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"features": {
								"description": true,
								"sfx": false,
								"subtraits": false
							},
							"sharedHinder": true,
							"sharedHinderText": "Gain a PP when you trade out your distinction's d8 rating for a d4.",
							"ratingScale": [
								8
							],
							"location": "center",
							"colSpan": 2,
							"columnSpan": 2,
							"page": 1,
							"style": {
								"header": "distinctions",
								"body": "distinctions"
							},
							"multiDie": false,
							"stressConfig": {
								"includeOut": true
							},
							"notes": "",
							"reservedSlots": 3
						}
					},
					"traits": [
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {
								"traits": {
									"SFX": {
										"traits": {
											"Hinder": {}
										}
									}
								}
							},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {
								"traits": {
									"SFX": {
										"traits": {
											"Hinder": {}
										}
									}
								}
							},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Ruin:",
							"value": 8,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": [
								"hinder"
							]
						}
					],
					"sfx": []
				},
				{
					"id": "roles",
					"name": "Roles",
					"description": "Town archetypes and societal roles",
					"nounSingular": "Role",
					"nounPlural": "Roles",
					"ratingPosition": "below",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"features": {
								"description": false,
								"sfx": false,
								"subtraits": false
							},
							"location": "left",
							"page": 1,
							"style": {
								"header": "default",
								"body": "default"
							},
							"ratingPosition": "below",
							"ratingScale": [
								4,
								6,
								8,
								10,
								12
							],
							"multiDie": false,
							"stressConfig": {
								"includeOut": true
							},
							"notes": "",
							"reservedSlots": 6,
							"colWidth": 28,
							"rowBreak": true
						}
					},
					"traits": [
						{
							"name": "Enforcer",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Entrepreneur",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Rebel",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Sage",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Shepherd",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Townie",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						}
					],
					"sfx": []
				},
				{
					"id": "relationships-strange-die",
					"name": "Relationships",
					"description": "Bonds and ties within the town",
					"nounSingular": "Relationship",
					"nounPlural": "Relationships",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"features": {
								"description": false,
								"sfx": false,
								"subtraits": false
							},
							"location": "center",
							"colSpan": 2,
							"columnSpan": 2,
							"page": 1,
							"style": {
								"header": "default",
								"body": "default"
							},
							"ratingScale": [
								4,
								6,
								8,
								10,
								12
							],
							"multiDie": false,
							"stressConfig": {
								"includeOut": true
							},
							"notes": "",
							"reservedSlots": 6
						}
					},
					"traits": [
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						}
					],
					"sfx": []
				},
				{
					"id": "signature-assets",
					"name": "Signature Assets",
					"description": "",
					"nounSingular": "Asset",
					"nounPlural": "Assets",
					"ratingPosition": "below",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"features": {
								"description": true,
								"sfx": false,
								"subtraits": false
							},
							"location": "left",
							"page": 1,
							"style": {
								"header": "default",
								"body": "default"
							},
							"ratingPosition": "below",
							"ratingScale": [
								8
							],
							"reservedSlots": 2,
							"colWidth": 28,
							"rowBreak": true
						}
					},
					"traits": [
						{
							"name": "",
							"value": 8,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 8,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						}
					],
					"sfx": []
				},
				{
					"id": "complications",
					"name": "Complications",
					"description": "",
					"nounSingular": "Complication",
					"nounPlural": "Complications",
					"ratingPosition": "below",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"features": {
								"description": true,
								"sfx": false,
								"subtraits": false
							},
							"location": "center",
							"page": 1,
							"style": {
								"header": "default",
								"body": "default"
							},
							"ratingPosition": "below",
							"ratingScale": [
								4,
								6,
								8,
								10,
								12
							],
							"reservedSlots": 3,
							"colWidth": 52
						}
					},
					"traits": [
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						}
					],
					"sfx": []
				},
				{
					"id": "strange-die",
					"name": "Strange Die",
					"description": "",
					"nounSingular": "Die",
					"nounPlural": "Dice",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"features": {
								"description": false,
								"sfx": false,
								"subtraits": false
							},
							"location": "right",
							"page": 1,
							"style": {
								"header": "dice-ladder",
								"body": "dice-ladder"
							},
							"ratingScale": [
								4,
								6,
								8,
								10,
								12
							],
							"reservedSlots": 5,
							"colWidth": 20
						}
					},
					"traits": [
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						}
					],
					"sfx": []
				}
			]
		}
	},
	{
		"id": "spotlight-terraverse",
		"version": 1,
		"title": "Terraverse",
		"subtitle": "Epic Science-Fantasy Multiverse",
		"spotlight": "Terraverse",
		"variant": "Character File",
		"pages": 2,
		"genre": "Sci-Fi / Superhero / Multiverse",
		"description": "Multi-dimensional heroes and champions wielding cosmic power sets to save reality across the Terraverse. Features 2 complete pages: 6 Attributes (Agility through Willpower), Distinctions with Hinder, 19 Skills (d4-d6) & Specialties (d8-d12), Signature Assets (d8-d12), Initiative & Hero Dice ladders, Life Points Track, 3 Power Sets, Talents, Session Record, and Leveling Up table.",
		"character": {
			"$schema": "https://cortex.engard.me/schema/0.1/character.schema.json",
			"version": "0.1",
			"id": "template-spotlight-terraverse",
			"isTemplate": true,
			"name": "",
			"game": "Terraverse",
			"description": "",
			"pronouns": "",
			"plotPoints": 1,
			"notes": "",
			"custom": {
				"cortexToolkit": {
					"pageCount": 2,
					"spotlight": "Terraverse",
					"style": {
						"hasAttributes": false
					},
					"sheetStyle": "spotlight",
					"columns": 3,
					"watermark": {
						"enabled": true,
						"url": "images/cortex_prime_logo_light_transparent.png",
						"opacity": 0.08,
						"scale": 70,
						"page": "all"
					},
					"columnAlignment": "top-base",
					"columnOffsets": {
						"left": 0,
						"center": 0,
						"right": 0
					}
				}
			},
			"player": "",
			"portrait": {
				"url": "",
				"custom": {
					"cortexToolkit": {
						"size": "spotlight",
						"location": "header"
					}
				}
			},
			"traitSets": [
				{
					"id": "attributes",
					"name": "Attributes",
					"description": "Core hero ratings with Vitality and Willpower",
					"nounSingular": "Attribute",
					"nounPlural": "Attributes",
					"ratingPosition": "below",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"features": {
								"description": false,
								"sfx": false,
								"subtraits": false
							},
							"location": "left",
							"page": 1,
							"style": {
								"header": "default",
								"body": "default"
							},
							"ratingPosition": "below",
							"ratingScale": [
								4,
								6,
								8,
								10,
								12
							],
							"multiDie": false,
							"stressConfig": {
								"includeOut": true
							},
							"notes": "",
							"reservedSlots": 6,
							"attributesRing": false,
							"colWidth": 28
						}
					},
					"traits": [
						{
							"name": "Agility",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Alertness",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Intelligence",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Strength",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Vitality",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Willpower",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						}
					],
					"sfx": []
				},
				{
					"id": "distinctions",
					"name": "Distinctions",
					"description": "Multiversal origin, champion archetype, and personal drive",
					"nounSingular": "Distinction",
					"nounPlural": "Distinctions",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"features": {
								"description": true,
								"sfx": false,
								"subtraits": false
							},
							"sharedHinder": true,
							"sharedHinderText": "Gain a PP when you switch out your distinction's rating of d8 for a d4.",
							"ratingScale": [
								8
							],
							"location": "center",
							"page": 1,
							"style": {
								"header": "distinctions",
								"body": "distinctions"
							},
							"multiDie": false,
							"stressConfig": {
								"includeOut": true
							},
							"notes": "",
							"reservedSlots": 3,
							"colSpan": 2,
							"columnSpan": 2
						}
					},
					"traits": [
						{
							"name": "",
							"value": 8,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": [
								"hinder"
							]
						},
						{
							"name": "",
							"value": 8,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": [
								"hinder"
							]
						},
						{
							"name": "",
							"value": 8,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": [
								"hinder"
							]
						}
					],
					"sfx": []
				},
				{
					"id": "signature-assets",
					"name": "Signature Assets",
					"description": "Artifacts and multiversal gear",
					"nounSingular": "Signature Asset",
					"nounPlural": "Signature Assets",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"features": {
								"description": false,
								"sfx": false,
								"subtraits": false
							},
							"location": "left",
							"page": 1,
							"style": {
								"header": "default",
								"body": "default"
							},
							"ratingScale": [
								8,
								10,
								12
							],
							"multiDie": false,
							"stressConfig": {
								"includeOut": true
							},
							"notes": "",
							"reservedSlots": 4,
							"colWidth": 28
						}
					},
					"traits": [
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						}
					],
					"sfx": []
				},
				{
					"id": "subtrait-columns",
					"name": "Skills & Specialties",
					"description": "Multiverse capabilities (d4-d6) and specialized proficiencies (d8-d12)",
					"nounSingular": "Skill",
					"nounPlural": "Skills",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"header": "top",
							"headerAlign": "center",
							"features": {
								"description": false,
								"sfx": false,
								"subtraits": true
							},
							"location": "center",
							"rowSpan": 2,
							"page": 1,
							"style": {
								"header": "default",
								"body": "subtrait-columns"
							},
							"ratingScale": [
								4,
								6
							],
							"subtraitRatingScale": [
								8,
								10,
								12
							],
							"labels": {
								"left": "Skills",
								"right": "Specialties"
							},
							"multiDie": false,
							"stressConfig": {
								"includeOut": true
							},
							"notes": "",
							"reservedSlots": 19,
							"colSpan": 2,
							"columnSpan": 2
						}
					},
					"traits": [
						{
							"name": "Craft",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [
								{
									"name": "",
									"value": 0,
									"dice": [],
									"description": "",
									"tags": [],
									"custom": {},
									"traits": [],
									"sfx": []
								}
							],
							"sfx": []
						},
						{
							"name": "Drive",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [
								{
									"name": "",
									"value": 0,
									"dice": [],
									"description": "",
									"tags": [],
									"custom": {},
									"traits": [],
									"sfx": []
								}
							],
							"sfx": []
						},
						{
							"name": "Fight",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [
								{
									"name": "",
									"value": 0,
									"dice": [],
									"description": "",
									"tags": [],
									"custom": {},
									"traits": [],
									"sfx": []
								}
							],
							"sfx": []
						},
						{
							"name": "Fix",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [
								{
									"name": "",
									"value": 0,
									"dice": [],
									"description": "",
									"tags": [],
									"custom": {},
									"traits": [],
									"sfx": []
								}
							],
							"sfx": []
						},
						{
							"name": "Fly",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [
								{
									"name": "",
									"value": 0,
									"dice": [],
									"description": "",
									"tags": [],
									"custom": {},
									"traits": [],
									"sfx": []
								}
							],
							"sfx": []
						},
						{
							"name": "Focus",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [
								{
									"name": "",
									"value": 0,
									"dice": [],
									"description": "",
									"tags": [],
									"custom": {},
									"traits": [],
									"sfx": []
								}
							],
							"sfx": []
						},
						{
							"name": "Influence",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [
								{
									"name": "",
									"value": 0,
									"dice": [],
									"description": "",
									"tags": [],
									"custom": {},
									"traits": [],
									"sfx": []
								}
							],
							"sfx": []
						},
						{
							"name": "Know",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [
								{
									"name": "",
									"value": 0,
									"dice": [],
									"description": "",
									"tags": [],
									"custom": {},
									"traits": [],
									"sfx": []
								}
							],
							"sfx": []
						},
						{
							"name": "Labor",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [
								{
									"name": "",
									"value": 0,
									"dice": [],
									"description": "",
									"tags": [],
									"custom": {},
									"traits": [],
									"sfx": []
								}
							],
							"sfx": []
						},
						{
							"name": "Move",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [
								{
									"name": "",
									"value": 0,
									"dice": [],
									"description": "",
									"tags": [],
									"custom": {},
									"traits": [],
									"sfx": []
								}
							],
							"sfx": []
						},
						{
							"name": "Notice",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [
								{
									"name": "",
									"value": 0,
									"dice": [],
									"description": "",
									"tags": [],
									"custom": {},
									"traits": [],
									"sfx": []
								}
							],
							"sfx": []
						},
						{
							"name": "Operate",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [
								{
									"name": "",
									"value": 0,
									"dice": [],
									"description": "",
									"tags": [],
									"custom": {},
									"traits": [],
									"sfx": []
								}
							],
							"sfx": []
						},
						{
							"name": "Perform",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [
								{
									"name": "",
									"value": 0,
									"dice": [],
									"description": "",
									"tags": [],
									"custom": {},
									"traits": [],
									"sfx": []
								}
							],
							"sfx": []
						},
						{
							"name": "Shoot",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [
								{
									"name": "",
									"value": 0,
									"dice": [],
									"description": "",
									"tags": [],
									"custom": {},
									"traits": [],
									"sfx": []
								}
							],
							"sfx": []
						},
						{
							"name": "Sneak",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [
								{
									"name": "",
									"value": 0,
									"dice": [],
									"description": "",
									"tags": [],
									"custom": {},
									"traits": [],
									"sfx": []
								}
							],
							"sfx": []
						},
						{
							"name": "Survive",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [
								{
									"name": "",
									"value": 0,
									"dice": [],
									"description": "",
									"tags": [],
									"custom": {},
									"traits": [],
									"sfx": []
								}
							],
							"sfx": []
						},
						{
							"name": "Throw",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [
								{
									"name": "",
									"value": 0,
									"dice": [],
									"description": "",
									"tags": [],
									"custom": {},
									"traits": [],
									"sfx": []
								}
							],
							"sfx": []
						},
						{
							"name": "Treat",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [
								{
									"name": "",
									"value": 0,
									"dice": [],
									"description": "",
									"tags": [],
									"custom": {},
									"traits": [],
									"sfx": []
								}
							],
							"sfx": []
						},
						{
							"name": "Trick",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [
								{
									"name": "",
									"value": 0,
									"dice": [],
									"description": "",
									"tags": [],
									"custom": {},
									"traits": [],
									"sfx": []
								}
							],
							"sfx": []
						}
					],
					"sfx": []
				},
				{
					"id": "initiative",
					"name": "Initiative",
					"description": "",
					"nounSingular": "Die",
					"nounPlural": "Dice",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"features": {
								"description": false,
								"sfx": false,
								"subtraits": false
							},
							"location": "left",
							"page": 1,
							"style": {
								"header": "dice-ladder",
								"body": "dice-ladder"
							},
							"ratingScale": [
								4,
								6,
								8,
								10,
								12
							],
							"reservedSlots": 5,
							"colWidth": 14
						}
					},
					"traits": [
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						}
					],
					"sfx": []
				},
				{
					"id": "hero-dice",
					"name": "Hero Dice",
					"description": "",
					"nounSingular": "Die",
					"nounPlural": "Dice",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"features": {
								"description": false,
								"sfx": false,
								"subtraits": false
							},
							"location": "left",
							"page": 1,
							"style": {
								"header": "dice-ladder",
								"body": "dice-ladder"
							},
							"ratingScale": [
								4,
								6,
								8,
								10,
								12
							],
							"reservedSlots": 5,
							"colWidth": 14
						}
					},
					"traits": [
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						}
					],
					"sfx": []
				},
				{
					"id": "life-points",
					"name": "Life Points",
					"description": "Vitality (12 → 1, Injured!) • Ø • Willpower (1 → 12, Dazed!)",
					"nounSingular": "Point",
					"nounPlural": "Points",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"header": "top",
							"headerAlign": "left",
							"features": {
								"description": false,
								"sfx": false,
								"subtraits": false
							},
							"location": "left",
							"page": 1,
							"style": {
								"header": "default",
								"body": "pips"
							},
							"pipsConfig": {
								"rows": 2,
								"perRow": 12,
								"filled": 0
							},
							"pips": {
								"count": 24,
								"perRow": 12,
								"connected": true,
								"filled": 0
							},
							"colSpan": "full",
							"columnSpan": "full"
						}
					},
					"traits": [],
					"sfx": []
				},
				{
					"id": "power-set-1",
					"name": "Power Set 1",
					"description": "SFX: • SFX: • Limit:",
					"nounSingular": "Power",
					"nounPlural": "Powers",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"header": "top",
							"headerAlign": "center",
							"features": {
								"description": true,
								"sfx": true,
								"subtraits": false
							},
							"location": "left",
							"page": 2,
							"style": {
								"header": "default",
								"body": "default"
							},
							"ratingScale": [
								6,
								8,
								10,
								12
							],
							"multiDie": false,
							"stressConfig": {
								"includeOut": true
							},
							"notes": "",
							"reservedSlots": 3
						}
					},
					"traits": [
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": [
								{
									"name": "SFX 1",
									"description": ""
								},
								{
									"name": "SFX 2",
									"description": ""
								},
								{
									"name": "Limit",
									"description": ""
								}
							]
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						}
					],
					"sfx": []
				},
				{
					"id": "power-set-2",
					"name": "Power Set 2",
					"description": "SFX: • SFX: • Limit:",
					"nounSingular": "Power",
					"nounPlural": "Powers",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"header": "top",
							"headerAlign": "center",
							"features": {
								"description": true,
								"sfx": true,
								"subtraits": false
							},
							"location": "center",
							"page": 2,
							"style": {
								"header": "default",
								"body": "default"
							},
							"ratingScale": [
								6,
								8,
								10,
								12
							],
							"multiDie": false,
							"stressConfig": {
								"includeOut": true
							},
							"notes": "",
							"reservedSlots": 3
						}
					},
					"traits": [
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": [
								{
									"name": "SFX 1",
									"description": ""
								},
								{
									"name": "SFX 2",
									"description": ""
								},
								{
									"name": "Limit",
									"description": ""
								}
							]
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						}
					],
					"sfx": []
				},
				{
					"id": "power-set-3",
					"name": "Power Set 3",
					"description": "SFX: • SFX: • Limit:",
					"nounSingular": "Power",
					"nounPlural": "Powers",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"header": "top",
							"headerAlign": "center",
							"features": {
								"description": true,
								"sfx": true,
								"subtraits": false
							},
							"location": "right",
							"page": 2,
							"style": {
								"header": "default",
								"body": "default"
							},
							"ratingScale": [
								6,
								8,
								10,
								12
							],
							"multiDie": false,
							"stressConfig": {
								"includeOut": true
							},
							"notes": "",
							"reservedSlots": 3
						}
					},
					"traits": [
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": [
								{
									"name": "SFX 1",
									"description": ""
								},
								{
									"name": "SFX 2",
									"description": ""
								},
								{
									"name": "Limit",
									"description": ""
								}
							]
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						}
					],
					"sfx": []
				},
				{
					"id": "talents-growth-options",
					"name": "Talents",
					"description": "Name, Activation, and Effect",
					"nounSingular": "Talent",
					"nounPlural": "Talents",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"features": {
								"description": true,
								"sfx": true,
								"subtraits": false
							},
							"location": "left",
							"page": 2,
							"style": {
								"header": "default",
								"body": "three-column-table"
							},
							"multiDie": false,
							"stressConfig": {
								"includeOut": true
							},
							"notes": "",
							"reservedSlots": 4,
							"colSpan": 2,
							"columnSpan": 2
						}
					},
					"traits": [
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						}
					],
					"sfx": []
				},
				{
					"id": "session-record",
					"name": "Session Record",
					"description": "",
					"nounSingular": "Session",
					"nounPlural": "Sessions",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"features": {
								"description": false,
								"sfx": false,
								"subtraits": false
							},
							"location": "right",
							"page": 2,
							"style": {
								"header": "default",
								"body": "pips"
							},
							"pipsConfig": {
								"rows": 2,
								"perRow": 6,
								"filled": 0
							},
							"pips": {
								"count": 12,
								"perRow": 6,
								"connected": true,
								"filled": 0
							},
							"reservedSlots": 0
						}
					},
					"traits": [],
					"sfx": []
				},
				{
					"id": "leveling-up",
					"name": "Leveling Up",
					"description": "",
					"nounSingular": "Option",
					"nounPlural": "Options",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"header": "top",
							"headerAlign": "center",
							"features": {
								"description": false,
								"sfx": false,
								"subtraits": false
							},
							"location": "right",
							"page": 2,
							"style": {
								"header": "default",
								"body": "notes"
							},
							"notes": "**1 Session:** Turn an asset from a session into a signature asset at d6 • Switch out a distinction for a new one\n**2 Sessions:** Step up a signature asset • Add a new specialty to a skill • Add a new SFX to a power set\n**3 Sessions:** Step up a skill from d4 to d6, or add a power at d6 • Add a new talent from your archetype list or general list • Add a second power set (with one d8 power, one SFX, one limit)\n**4 Sessions:** Step up one attribute and step down another"
						}
					},
					"traits": [],
					"sfx": []
				}
			]
		}
	},
	{
		"id": "spotlight-titans-handler",
		"version": 1,
		"title": "Titans vs Leviathans - Handler",
		"subtitle": "Giant Mech vs Kaiju Combat",
		"spotlight": "Titans vs Leviathans",
		"variant": "Handler File",
		"pages": 1,
		"genre": "Mecha / Kaiju / Military",
		"description": "Pilots and tactical handlers neural-linked to colossal titan mechs defending humanity from titanic leviathans. Features Handler Attributes (Prowess, Control, Renown — d6 to d10), 5 Roles (Backup, Blaster, Boss, Brain, Brawler), Distinctions (Identity, Persona, Aspiration) with signature SFX, Signature Assets, Complications, and Session Record.",
		"character": {
			"$schema": "https://cortex.engard.me/schema/0.1/character.schema.json",
			"version": "0.1",
			"id": "template-spotlight-titans-handler",
			"isTemplate": true,
			"name": "",
			"game": "Titans vs Leviathans",
			"description": "",
			"pronouns": "",
			"plotPoints": 1,
			"notes": "",
			"custom": {
				"cortexToolkit": {
					"pageCount": 1,
					"spotlight": "Titans vs Leviathans",
					"style": {
						"hasAttributes": false
					},
					"sheetStyle": "spotlight",
					"columns": 2,
					"watermark": {
						"enabled": true,
						"url": "images/cortex_prime_logo_light_transparent.png",
						"opacity": 0.08,
						"scale": 70,
						"page": "all"
					},
					"columnAlignment": "top-base",
					"columnOffsets": {
						"left": 0,
						"center": 0,
						"right": 0
					}
				}
			},
			"player": "",
			"portrait": {
				"url": "",
				"custom": {
					"cortexToolkit": {
						"size": "spotlight",
						"location": "header"
					}
				}
			},
			"traitSets": [
				{
					"id": "handler-attributes",
					"name": "Attributes",
					"description": "Neural synchronization and handler capabilities",
					"nounSingular": "Attribute",
					"nounPlural": "Attributes",
					"ratingPosition": "below",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"features": {
								"description": false,
								"sfx": false,
								"subtraits": false
							},
							"location": "left",
							"page": 1,
							"style": {
								"header": "default",
								"body": "default"
							},
							"ratingPosition": "below",
							"ratingScale": [
								6,
								8,
								10
							],
							"multiDie": false,
							"stressConfig": {
								"includeOut": true
							},
							"notes": "",
							"reservedSlots": 3,
							"attributesRing": false,
							"colWidth": 28
						}
					},
					"traits": [
						{
							"name": "Prowess",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Control",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Renown",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						}
					],
					"sfx": []
				},
				{
					"id": "roles",
					"name": "Roles",
					"description": "Combat roles and tactical responsibilities",
					"nounSingular": "Role",
					"nounPlural": "Roles",
					"ratingPosition": "below",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"features": {
								"description": false,
								"sfx": false,
								"subtraits": false
							},
							"location": "left",
							"page": 1,
							"style": {
								"header": "default",
								"body": "default"
							},
							"ratingPosition": "below",
							"ratingScale": [
								4,
								6,
								8,
								10,
								12
							],
							"multiDie": false,
							"stressConfig": {
								"includeOut": true
							},
							"notes": "",
							"reservedSlots": 5,
							"colWidth": 28
						}
					},
					"traits": [
						{
							"name": "Backup",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Blaster",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Boss",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Brain",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Brawler",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						}
					],
					"sfx": []
				},
				{
					"id": "distinctions",
					"name": "Distinctions",
					"description": "Personal identity, public persona, and driving aspiration",
					"nounSingular": "Distinction",
					"nounPlural": "Distinctions",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"features": {
								"description": true,
								"sfx": true,
								"subtraits": false
							},
							"location": "right",
							"rowSpan": 2,
							"page": 1,
							"style": {
								"header": "distinctions",
								"body": "distinctions"
							},
							"ratingScale": [
								8
							],
							"multiDie": false,
							"stressConfig": {
								"includeOut": true
							},
							"notes": "",
							"reservedSlots": 3
						}
					},
					"traits": [
						{
							"name": "Identity:",
							"value": 8,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": [
								{
									"name": "Hinder",
									"description": "Gain a PP when you switch out your distinction's rating of d8 for a d4."
								},
								{
									"name": "Affirmation",
									"description": "Spend a PP to step up an attribute for an action or reaction when acting in line with your personal identity."
								},
								{
									"name": "Authenticity",
									"description": "Step up a complication to reroll one or all of your dice, even hitches, when acting in line with your personal identity."
								}
							]
						},
						{
							"name": "Persona:",
							"value": 8,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": [
								{
									"name": "Hinder",
									"description": "Gain a PP when you switch out your distinction's rating of d8 for a d4."
								},
								{
									"name": "Shake it Off",
									"description": "Spend a PP to recover a complication when acting in line with your public persona."
								},
								{
									"name": "Double Down",
									"description": "Step up a complication to double an attribute for an action or reaction when acting in line with your public persona."
								}
							]
						},
						{
							"name": "Aspiration:",
							"value": 8,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": [
								{
									"name": "Hinder",
									"description": "Gain a PP when you switch out your distinction's rating of d8 for a d4."
								},
								{
									"name": "Cards on the Table",
									"description": "Spend a PP to double an attribute for an action or reaction when you're pursuing your aspiration."
								},
								{
									"name": "Hurts for a Minute",
									"description": "Step up a complication to step down one of your titan's stress die ratings when you're pursuing your aspiration."
								}
							]
						}
					],
					"sfx": []
				},
				{
					"id": "signature-assets",
					"name": "Signature Assets",
					"description": "Handler cockpit gear and personal assets",
					"nounSingular": "Signature Asset",
					"nounPlural": "Signature Assets",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"header": "top",
							"headerAlign": "left",
							"features": {
								"description": true,
								"sfx": false,
								"subtraits": false
							},
							"location": "right",
							"page": 1,
							"style": {
								"header": "default",
								"body": "default"
							},
							"ratingScale": [
								6,
								8,
								10,
								12
							],
							"multiDie": false,
							"stressConfig": {
								"includeOut": true
							},
							"notes": "",
							"reservedSlots": 2
						}
					},
					"traits": [
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						}
					],
					"sfx": []
				},
				{
					"id": "complications",
					"name": "Complications",
					"description": "",
					"nounSingular": "Complication",
					"nounPlural": "Complications",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"header": "top",
							"headerAlign": "left",
							"features": {
								"description": true,
								"sfx": false,
								"subtraits": false
							},
							"location": "left",
							"page": 1,
							"style": {
								"header": "default",
								"body": "default"
							},
							"ratingScale": [
								4,
								6,
								8,
								10,
								12
							],
							"reservedSlots": 2,
							"colSpan": "full",
							"columnSpan": "full"
						}
					},
					"traits": [
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						}
					],
					"sfx": []
				}
			]
		}
	},
	{
		"id": "spotlight-titans-titan",
		"version": 1,
		"title": "Titans vs Leviathans - Titan Mech",
		"subtitle": "Giant Mech vs Kaiju Combat",
		"spotlight": "Titans vs Leviathans",
		"variant": "Titan Mech File",
		"pages": 1,
		"genre": "Mecha / Kaiju / Military",
		"description": "Colossal mechanical titan sheet equipped with Titan Attributes & Stress (Prowess, Control, Renown — d6 to d12), Titan Distinctions (Type, History with Underscore/Overcompensate SFX, Battle), 2 Power Set blocks, and a 15-pip Session Record.",
		"character": {
			"$schema": "https://cortex.engard.me/schema/0.1/character.schema.json",
			"version": "0.1",
			"id": "template-spotlight-titans-titan",
			"isTemplate": true,
			"name": "",
			"game": "Titans vs Leviathans",
			"description": "",
			"pronouns": "",
			"plotPoints": 1,
			"notes": "",
			"custom": {
				"cortexToolkit": {
					"pageCount": 1,
					"spotlight": "Titans vs Leviathans",
					"style": {
						"hasAttributes": false
					},
					"sheetStyle": "spotlight",
					"columns": 2,
					"watermark": {
						"enabled": true,
						"url": "images/cortex_prime_logo_light_transparent.png",
						"opacity": 0.08,
						"scale": 70,
						"page": "all"
					},
					"columnAlignment": "top-base",
					"columnOffsets": {
						"left": 0,
						"center": 0,
						"right": 0
					}
				}
			},
			"player": "",
			"portrait": {
				"url": "",
				"custom": {
					"cortexToolkit": {
						"size": "spotlight",
						"location": "header"
					}
				}
			},
			"traitSets": [
				{
					"id": "titan-attributes-stress",
					"name": "Attributes",
					"description": "Heavy mechanized systems with stress tracks",
					"nounSingular": "Attribute",
					"nounPlural": "Attributes",
					"ratingPosition": "below",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"features": {
								"description": false,
								"sfx": false,
								"subtraits": false
							},
							"location": "left",
							"page": 1,
							"style": {
								"header": "default",
								"body": "default"
							},
							"ratingPosition": "below",
							"ratingScale": [
								6,
								8,
								10,
								12
							],
							"attachedStress": {
								"enabled": true,
								"label": "STRESS",
								"ratingScale": [
									6,
									8,
									10,
									12
								],
								"scale": [
									6,
									8,
									10,
									12
								],
								"includeOut": false
							},
							"multiDie": false,
							"stressConfig": {
								"includeOut": false
							},
							"notes": "",
							"reservedSlots": 3,
							"attributesRing": false,
							"colWidth": 28
						}
					},
					"traits": [
						{
							"name": "Prowess",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Control",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Renown",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						}
					],
					"sfx": []
				},
				{
					"id": "titan-distinctions",
					"name": "Distinctions",
					"description": "Chassis type, operational history, and battle stance",
					"nounSingular": "Distinction",
					"nounPlural": "Distinctions",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"features": {
								"description": true,
								"sfx": true,
								"subtraits": false
							},
							"location": "right",
							"page": 1,
							"style": {
								"header": "distinctions",
								"body": "distinctions"
							},
							"ratingScale": [
								8
							],
							"multiDie": false,
							"stressConfig": {
								"includeOut": true
							},
							"notes": "",
							"reservedSlots": 3
						}
					},
					"traits": [
						{
							"name": "Type:",
							"value": 8,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": [
								{
									"name": "",
									"description": "",
									"tags": [],
									"custom": {}
								},
								{
									"name": "",
									"description": "",
									"tags": [],
									"custom": {}
								}
							]
						},
						{
							"name": "History:",
							"value": 8,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": [
								{
									"name": "Underscore",
									"description": "Spend a PP to double a titan attribute for your next action or reaction when drawing on your titan's history."
								},
								{
									"name": "Overcompensate",
									"description": "Step up one stress and reroll one or all of your dice pool when taking an action or reaction that draws on your titan's history."
								}
							]
						},
						{
							"name": "Battle:",
							"value": 8,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": [
								{
									"name": "",
									"description": "",
									"tags": [],
									"custom": {}
								}
							]
						}
					],
					"sfx": []
				},
				{
					"id": "power-set",
					"name": "Power Set",
					"description": "Colossal kaiju-annihilation weaponry",
					"nounSingular": "Power",
					"nounPlural": "Powers",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"features": {
								"description": true,
								"sfx": true,
								"subtraits": false
							},
							"location": "left",
							"page": 1,
							"style": {
								"header": "default",
								"body": "default"
							},
							"ratingScale": [
								6,
								8,
								10,
								12
							],
							"multiDie": false,
							"stressConfig": {
								"includeOut": true
							},
							"notes": "",
							"reservedSlots": 4,
							"colWidth": 50,
							"rowBreak": true
						}
					},
					"traits": [
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						}
					],
					"sfx": []
				},
				{
					"id": "power-set-2",
					"name": "Power Set",
					"description": "Secondary titan systems and ordnance",
					"nounSingular": "Power",
					"nounPlural": "Powers",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"features": {
								"description": true,
								"sfx": true,
								"subtraits": false
							},
							"location": "right",
							"page": 1,
							"style": {
								"header": "default",
								"body": "default"
							},
							"ratingScale": [
								6,
								8,
								10,
								12
							],
							"multiDie": false,
							"stressConfig": {
								"includeOut": true
							},
							"notes": "",
							"reservedSlots": 4
						}
					},
					"traits": [
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						}
					],
					"sfx": []
				},
				{
					"id": "session-record",
					"name": "Session Record",
					"description": "",
					"nounSingular": "Session",
					"nounPlural": "Sessions",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"header": "top",
							"headerAlign": "right",
							"features": {
								"description": false,
								"sfx": false,
								"subtraits": false
							},
							"location": "left",
							"page": 1,
							"style": {
								"header": "default",
								"body": "pips"
							},
							"pipsConfig": {
								"rows": 1,
								"perRow": 15,
								"filled": 0
							},
							"pips": {
								"count": 15,
								"perRow": 15,
								"connected": true,
								"filled": 0
							},
							"reservedSlots": 0,
							"colSpan": "full",
							"columnSpan": "full"
						}
					},
					"traits": [],
					"sfx": []
				}
			]
		}
	},
	{
		"id": "spotlight-trace-20",
		"version": 1,
		"title": "TRACE 2.0",
		"subtitle": "Civic Paranormal Investigation",
		"spotlight": "TRACE 2.0",
		"variant": "Character File",
		"pages": 1,
		"genre": "Mystery / Procedural / Urban Fantasy",
		"description": "Investigators of the City of Cortez probing the strange and uncanny. Features Affiliations (Solo, Partner, Squad), 7 Roles (Forensics through Technology), 8 multi-die Resources (starting with 2d10, 2d8, 2d6, 2d6), Distinctions with Hinder, 6 Talents, 5 Stress tracks (Afraid, Angry, Anxious, Exhausted, Injured), and a Growth Pool (Base 2d6).",
		"character": {
			"$schema": "https://cortex.engard.me/schema/0.1/character.schema.json",
			"version": "0.1",
			"id": "template-spotlight-trace-20",
			"isTemplate": true,
			"name": "",
			"game": "TRACE 2.0",
			"description": "",
			"pronouns": "",
			"plotPoints": 1,
			"notes": "",
			"custom": {
				"cortexToolkit": {
					"pageCount": 1,
					"spotlight": "TRACE 2.0",
					"style": {
						"hasAttributes": false
					},
					"sheetStyle": "spotlight",
					"columns": 3,
					"watermark": {
						"enabled": true,
						"url": "images/cortex_prime_logo_light_transparent.png",
						"opacity": 0.08,
						"scale": 70,
						"page": "all"
					},
					"columnAlignment": "top-base",
					"columnOffsets": {
						"left": 0,
						"center": 0,
						"right": 0
					}
				}
			},
			"player": "",
			"portrait": {
				"url": "",
				"custom": {
					"cortexToolkit": {
						"size": "spotlight",
						"location": "header"
					}
				}
			},
			"traitSets": [
				{
					"id": "affiliations",
					"name": "Affiliations",
					"description": "Team configuration ratings",
					"nounSingular": "Affiliation",
					"nounPlural": "Affiliations",
					"ratingPosition": "below",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"features": {
								"description": false,
								"sfx": false,
								"subtraits": false
							},
							"location": "left",
							"page": 1,
							"style": {
								"header": "default",
								"body": "default"
							},
							"ratingPosition": "below",
							"ratingScale": [
								4,
								6,
								8,
								10,
								12
							],
							"multiDie": false,
							"stressConfig": {
								"includeOut": true
							},
							"notes": "",
							"reservedSlots": 3,
							"colWidth": 28
						}
					},
					"traits": [
						{
							"name": "Solo",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Partner",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Squad",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						}
					],
					"sfx": []
				},
				{
					"id": "roles",
					"name": "Roles",
					"description": "Civic investigation disciplines",
					"nounSingular": "Role",
					"nounPlural": "Roles",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"features": {
								"description": false,
								"sfx": false,
								"subtraits": false
							},
							"location": "left",
							"page": 1,
							"style": {
								"header": "default",
								"body": "default"
							},
							"ratingScale": [
								4,
								6,
								8,
								10,
								12
							],
							"multiDie": false,
							"stressConfig": {
								"includeOut": true
							},
							"notes": "",
							"reservedSlots": 7,
							"colWidth": 28
						}
					},
					"traits": [
						{
							"name": "Forensics",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Investigation",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Legal",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Medicine",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Psychology",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Tactics",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Technology",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						}
					],
					"sfx": []
				},
				{
					"id": "resources",
					"name": "Resources",
					"description": "Civic assets, contacts, and backup",
					"nounSingular": "Resource",
					"nounPlural": "Resources",
					"ratingPosition": "inline",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"features": {
								"description": false,
								"sfx": false,
								"subtraits": false
							},
							"location": "left",
							"page": 1,
							"style": {
								"header": "default",
								"body": "default"
							},
							"ratingScale": [
								6,
								8,
								10
							],
							"multiDie": true,
							"stressConfig": {
								"includeOut": true
							},
							"notes": "",
							"reservedSlots": 8,
							"colWidth": 28
						}
					},
					"traits": [
						{
							"name": "",
							"value": 10,
							"dice": [
								10,
								10
							],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 8,
							"dice": [
								8,
								8
							],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 6,
							"dice": [
								6,
								6
							],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 6,
							"dice": [
								6,
								6
							],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						}
					],
					"sfx": []
				},
				{
					"id": "distinctions",
					"name": "Distinctions",
					"description": "Defining history, drive, and complication",
					"nounSingular": "Distinction",
					"nounPlural": "Distinctions",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"features": {
								"description": true,
								"sfx": false,
								"subtraits": false
							},
							"sharedHinder": true,
							"sharedHinderText": "Gain a PP when you switch out your distinction's rating of d8 for a d4.",
							"ratingScale": [
								8
							],
							"location": "center",
							"page": 1,
							"style": {
								"header": "distinctions",
								"body": "distinctions"
							},
							"multiDie": false,
							"stressConfig": {
								"includeOut": true
							},
							"notes": "",
							"reservedSlots": 3,
							"colSpan": 2,
							"columnSpan": 2
						}
					},
					"traits": [
						{
							"name": "Distinction #1:",
							"value": 8,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": [
								"hinder"
							]
						},
						{
							"name": "Distinction #2:",
							"value": 8,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": [
								"hinder"
							]
						},
						{
							"name": "Distinction #3:",
							"value": 8,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": [
								"hinder"
							]
						}
					],
					"sfx": []
				},
				{
					"id": "talents",
					"name": "Talents",
					"description": "Training tricks and case-cracking knacks",
					"nounSingular": "Talent",
					"nounPlural": "Talents",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"features": {
								"description": true,
								"sfx": false,
								"subtraits": false
							},
							"location": "center",
							"page": 1,
							"style": {
								"header": "default",
								"body": "default"
							},
							"ratingScale": [],
							"multiDie": false,
							"stressConfig": {
								"includeOut": true
							},
							"notes": "",
							"reservedSlots": 6,
							"colSpan": 2,
							"columnSpan": 2
						}
					},
					"traits": [
						{
							"name": "Talent #1:",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Talent #2:",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Talent #3:",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Talent #4:",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Talent #5:",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Talent #6:",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						}
					],
					"sfx": []
				},
				{
					"id": "stress",
					"name": "Stress",
					"description": "Emotional and physical pressure tracks",
					"nounSingular": "Stress",
					"nounPlural": "Stress",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"features": {
								"description": false,
								"sfx": false,
								"subtraits": false
							},
							"location": "center",
							"page": 1,
							"style": {
								"header": "default",
								"body": "stress"
							},
							"multiDie": false,
							"stressConfig": {
								"includeD4": true,
								"includeOut": false
							},
							"notes": "",
							"reservedSlots": 5,
							"ratingScale": [
								4,
								6,
								8,
								10,
								12
							],
							"colWidth": 52
						}
					},
					"traits": [
						{
							"name": "Afraid",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Angry",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Anxious",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Exhausted",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Injured",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						}
					],
					"sfx": []
				},
				{
					"id": "growth-pool",
					"name": "Growth Pool",
					"description": "Base d6 d6",
					"nounSingular": "Growth Die",
					"nounPlural": "Growth Dice",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"header": "top",
							"headerAlign": "center",
							"features": {
								"description": false,
								"sfx": false,
								"subtraits": false
							},
							"location": "right",
							"page": 1,
							"style": {
								"header": "default",
								"body": "dice-ladder"
							},
							"ratingScale": [
								4,
								6,
								8,
								10,
								12
							],
							"multiDie": true,
							"stressConfig": {
								"includeOut": true
							},
							"notes": "",
							"reservedSlots": 5,
							"colWidth": 20
						}
					},
					"traits": [
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						}
					],
					"sfx": []
				}
			]
		}
	},
	{
		"id": "spotlight-kitchen-sink",
		"title": "Kitchen Sink Style Showcase",
		"subtitle": "All 17 Trait Set Styles & Features",
		"spotlight": "Toolkit Reference",
		"variant": "Showcase",
		"pages": 2,
		"genre": "Reference",
		"description": "Visual regression and style reference template exercising every layout component, header orientation, and die mechanic.",
		"version": 1,
		"updatedAt": "2026-10-14T12:00:00.000Z",
		"character": {
			"$schema": "https://cortex.engard.me/schema/0.1/character.schema.json",
			"version": "0.1",
			"id": "00000000-0000-4000-8000-000000000001",
			"isTemplate": true,
			"dateCreated": "2026-10-14T12:00:00.000Z",
			"dateModified": "2026-10-14T12:00:00.000Z",
			"dateTouched": "2026-10-14T12:00:00.000Z",
			"name": "Kitchen Sink Showcase",
			"player": "Style Audit",
			"game": "Cortex Prime Style Catalog",
			"pronouns": "They / Them",
			"description": "Visual regression and layout showcase exercising every trait set style, header orientation, die rating (d4-d12), pool, subtrait branch, and track.",
			"plotPoints": 3,
			"notes": "### Sheet Notes\nSupports **bold**, *italics*, `code`, die glyphs like d4 d6 d8 d10 d12, and PP tokens.",
			"tags": [
				"showcase",
				"kitchen-sink"
			],
			"portrait": {
				"url": "",
				"alt": "Character Portrait",
				"tags": [],
				"custom": {
					"cortexToolkit": {
						"alignment": "center-center",
						"size": "spotlight",
						"location": "header"
					}
				}
			},
			"custom": {
				"cortexToolkit": {
					"nickname": "The Everything Sheet",
					"sheetStyle": "spotlight",
					"columns": 2,
					"pageCount": 2,
					"columnAlignment": "top-base",
					"columnOffsets": {
						"left": 0,
						"center": 0,
						"right": 0
					}
				}
			},
			"traitSets": [
				{
					"id": "ks-distinctions",
					"name": "Distinctions",
					"description": "",
					"nounSingular": "Distinction",
					"nounPlural": "Distinctions",
					"ratingPosition": "inline",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"page": 1,
							"location": "left",
							"style": {
								"header": "distinctions",
								"body": "distinctions"
							},
							"features": {
								"description": true,
								"sfx": true,
								"subtraits": false
							},
							"sharedHinder": true,
							"reservedSlots": 3,
							"ratingScale": [
								8
							]
						}
					},
					"traits": [
						{
							"name": "Walking Style Guide",
							"value": 8,
							"dice": [],
							"description": "Every layout edge case deserves a test.",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": [
								"hinder",
								{
									"name": "Pixel Parity",
									"description": "Spend 1 PP to step up or double a die when testing visual alignment against a reference PDF."
								}
							]
						},
						{
							"name": "",
							"value": 8,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": [
								"hinder",
								{
									"name": "",
									"description": "",
									"tags": [],
									"custom": {}
								}
							]
						},
						{
							"name": "",
							"value": 8,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": [
								"hinder"
							]
						}
					],
					"sfx": []
				},
				{
					"id": "ks-values-statements",
					"name": "Values",
					"description": "",
					"nounSingular": "Value",
					"nounPlural": "Values",
					"ratingPosition": "inline",
					"statement": true,
					"hasQuestionedPip": true,
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"page": 1,
							"location": "right",
							"style": {
								"header": "default",
								"body": "default"
							},
							"features": {
								"description": true,
								"sfx": false,
								"subtraits": false
							},
							"ratingScale": [
								4,
								6,
								8,
								10,
								12
							]
						}
					},
					"traits": [
						{
							"name": "Craft",
							"value": 10,
							"dice": [],
							"description": "Form and function are inseparable.",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Speed",
							"value": 8,
							"dice": [],
							"description": "Ship early, refine relentlessly.",
							"questioned": true,
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Clarity",
							"value": 6,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						}
					],
					"sfx": []
				},
				{
					"id": "ks-subtrait-columns",
					"name": "Skills",
					"description": "",
					"nounSingular": "Skill",
					"nounPlural": "Skills",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"page": 1,
							"location": "left",
							"style": {
								"header": "default",
								"body": "subtrait-columns"
							},
							"features": {
								"description": false,
								"sfx": false,
								"subtraits": true
							},
							"labels": {
								"left": "SKILL",
								"right": "SPECIALTIES"
							}
						}
					},
					"traits": [
						{
							"name": "Engineering",
							"value": 10,
							"dice": [],
							"tags": [],
							"custom": {},
							"traits": [
								{
									"name": "Clockwork",
									"value": 8,
									"dice": [],
									"description": "",
									"tags": [],
									"custom": {},
									"traits": [],
									"sfx": []
								},
								{
									"name": "Aetherics",
									"value": 6,
									"dice": [],
									"description": "",
									"tags": [],
									"custom": {},
									"traits": [],
									"sfx": []
								}
							],
							"sfx": []
						},
						{
							"name": "Navigation",
							"value": 8,
							"dice": [],
							"tags": [],
							"custom": {},
							"traits": [
								{
									"name": "Star Charts",
									"value": 6,
									"dice": [],
									"description": "",
									"tags": [],
									"custom": {},
									"traits": [],
									"sfx": []
								}
							],
							"sfx": []
						},
						{
							"name": "Diplomacy",
							"value": 6,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						}
					],
					"sfx": []
				},
				{
					"id": "ks-paired-slots",
					"name": "Standing",
					"description": "",
					"nounSingular": "Standing",
					"nounPlural": "Standings",
					"statement": true,
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"page": 1,
							"location": "right",
							"style": {
								"header": "default",
								"body": "paired-slots"
							},
							"features": {
								"description": true,
								"sfx": false,
								"subtraits": true
							},
							"labels": {
								"slot0": "COMPLICATION",
								"slot1": "BONUS"
							},
							"ratingScale": [
								6,
								8,
								10,
								12
							],
							"subtraitRatingScale": [
								6,
								8,
								10,
								12
							]
						}
					},
					"traits": [
						{
							"name": "The Guild",
							"value": 8,
							"dice": [],
							"description": "They owe me a drydock bay.",
							"tags": [],
							"custom": {},
							"traits": [
								{
									"name": "Complication",
									"value": 6,
									"dice": [],
									"description": "",
									"tags": [],
									"custom": {},
									"traits": [],
									"sfx": []
								},
								{
									"name": "Bonus",
									"value": 8,
									"dice": [],
									"description": "",
									"tags": [],
									"custom": {},
									"traits": [],
									"sfx": []
								}
							],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						}
					],
					"sfx": []
				},
				{
					"id": "ks-die-rows",
					"name": "Badges",
					"description": "",
					"nounSingular": "Badge",
					"nounPlural": "Badges",
					"hasCounterColumn": true,
					"counterLabel": "XP",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"page": 1,
							"location": "left",
							"header": "top",
							"headerAlign": "left",
							"style": {
								"header": "default",
								"body": "die-rows"
							},
							"features": {
								"description": false,
								"sfx": false,
								"subtraits": false
							},
							"ratingScale": [
								6,
								8,
								10,
								12
							],
							"reservedSlots": 3
						}
					},
					"traits": [
						{
							"name": "First Responder",
							"value": 8,
							"dice": [],
							"xp": 3,
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Trailblazer",
							"value": 6,
							"dice": [],
							"xp": 1,
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						}
					],
					"sfx": []
				},
				{
					"id": "ks-three-col-table",
					"name": "Talents",
					"description": "",
					"nounSingular": "Talent",
					"nounPlural": "Talents",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"page": 1,
							"location": "right",
							"style": {
								"header": "default",
								"body": "three-column-table"
							},
							"features": {
								"description": true,
								"sfx": true,
								"subtraits": false
							},
							"labels": {
								"col1": "TALENT",
								"col2": "ACTIVATION",
								"col3": "EFFECT"
							},
							"reservedSlots": 2
						}
					},
					"traits": [
						{
							"name": "Overclock",
							"value": 0,
							"dice": [],
							"description": "Spend 1 PP when rolling Engineering.",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": [
								{
									"name": "Effect",
									"description": "Step up your Effect die by one step for the scene."
								}
							]
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						}
					],
					"sfx": []
				},
				{
					"id": "ks-dice-count",
					"name": "Resources",
					"description": "",
					"nounSingular": "Resource",
					"nounPlural": "Resources",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"page": 1,
							"location": "left",
							"style": {
								"header": "default",
								"body": "dice-count"
							},
							"features": {
								"description": false,
								"sfx": false,
								"subtraits": false
							},
							"multiDie": true,
							"labels": {
								"rating": "RATING",
								"dice": "/ DICE"
							}
						}
					},
					"traits": [
						{
							"name": "Salvage Cache",
							"value": 8,
							"dice": [
								8,
								8,
								8
							],
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Contacts",
							"value": 6,
							"dice": [
								6,
								6
							],
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						}
					],
					"sfx": []
				},
				{
					"id": "ks-stress",
					"name": "Stress",
					"description": "",
					"nounSingular": "Stress",
					"nounPlural": "Stress",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"page": 1,
							"location": "right",
							"style": {
								"header": "default",
								"body": "stress"
							},
							"features": {
								"description": false,
								"sfx": false,
								"subtraits": false
							},
							"stressConfig": {
								"includeOut": true
							},
							"ratingScale": [
								6,
								8,
								10,
								12
							]
						}
					},
					"traits": [
						{
							"name": "Physical",
							"value": 8,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Mental",
							"value": 0,
							"dice": [],
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Social",
							"value": 12,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						}
					],
					"sfx": []
				},
				{
					"id": "ks-dice-ladder",
					"name": "Growth Ladder",
					"description": "",
					"nounSingular": "Rung",
					"nounPlural": "Rungs",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"page": 2,
							"location": "left",
							"style": {
								"header": "default",
								"body": "dice-ladder"
							},
							"features": {
								"description": false,
								"sfx": false,
								"subtraits": false
							}
						}
					},
					"traits": [
						{
							"name": "Novice",
							"value": 6,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Adept",
							"value": 8,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Master",
							"value": 10,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						}
					],
					"sfx": []
				},
				{
					"id": "ks-labeled-fields",
					"name": "Dossier",
					"description": "",
					"nounSingular": "Field",
					"nounPlural": "Fields",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"page": 2,
							"location": "right",
							"style": {
								"header": "default",
								"body": "labeled-fields"
							},
							"features": {
								"description": true,
								"sfx": false,
								"subtraits": false
							}
						}
					},
					"traits": [
						{
							"name": "Origin",
							"value": 0,
							"dice": [],
							"description": "Outer Rim Shipyard #4",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Drive",
							"value": 0,
							"dice": [],
							"description": "Restore the lost fleet",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Quirk",
							"value": 0,
							"dice": [],
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						}
					],
					"sfx": []
				},
				{
					"id": "ks-pips",
					"name": "Progress Track",
					"description": "",
					"nounSingular": "Pip",
					"nounPlural": "Pips",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"page": 2,
							"location": "left",
							"style": {
								"header": "default",
								"body": "pips"
							},
							"pipsConfig": {
								"rows": 2,
								"perRow": 5,
								"filled": 4
							}
						}
					},
					"traits": [],
					"sfx": []
				},
				{
					"id": "ks-session-record",
					"name": "Session Record",
					"description": "",
					"nounSingular": "Session",
					"nounPlural": "Sessions",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"page": 2,
							"location": "right",
							"style": {
								"header": "default",
								"body": "session-record"
							},
							"sessionRecord": {
								"orientation": "vertical",
								"lines": 4
							}
						}
					},
					"traits": [
						{
							"name": "Session 1: The Awakening",
							"value": 6,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Session 2: Crossing the Threshold",
							"value": 0,
							"dice": [],
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "",
							"value": 0,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						}
					],
					"sfx": []
				},
				{
					"id": "ks-two-col-compact",
					"name": "Roles (Compact Two-Column)",
					"description": "",
					"nounSingular": "Role",
					"nounPlural": "Roles",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"page": 2,
							"location": "left",
							"style": {
								"header": "two-columns-compact",
								"body": "two-columns-compact"
							},
							"features": {
								"description": false,
								"sfx": false,
								"subtraits": false
							}
						}
					},
					"traits": [
						{
							"name": "Tactician",
							"value": 8,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Outrider",
							"value": 6,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Scholar",
							"value": 10,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						},
						{
							"name": "Sentinel",
							"value": 4,
							"dice": [],
							"description": "",
							"tags": [],
							"custom": {},
							"traits": [],
							"sfx": []
						}
					],
					"sfx": []
				},
				{
					"id": "ks-notes",
					"name": "Notes",
					"description": "",
					"nounSingular": "Note",
					"nounPlural": "Notes",
					"tags": [],
					"custom": {
						"cortexToolkit": {
							"page": 2,
							"location": "right",
							"style": {
								"header": "default",
								"body": "notes"
							},
							"notes": "### Gear & Inventory\n- **Chrono-Compass** (d8): Points toward temporal anomalies.\n- **Reserve Cells**: Spend 1 PP to recharge.\n> *\"Never fly without a backup spanner.\"*"
						}
					},
					"traits": [],
					"sfx": []
				}
			]
		}
	}
];

if (typeof module !== "undefined" && module.exports) {
	module.exports = cortexSpotlightTemplates;
}
