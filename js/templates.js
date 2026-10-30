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
    "listing": {
      "url": "https://legacy.drivethrurpg.com/product/572304/Alien-Us?manufacturers_id=31866",
      "quote": "You crashed here forty years ago. You learned the language, the customs, the clothes, the way they smile with their teeth showing even when they don’t mean it.",
      "genre": "Cold War Sci-Fi Drama",
      "setting": "d6",
      "prep": "d6",
      "complexity": "d8",
      "image": "https://legacy.drivethrurpg.com/images/31866/572304.jpg"
    },
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
      "player": "",
      "portrait": {
        "url": "",
        "view": {
          "size": "spotlight",
          "location": "header"
        }
      },
      "view": {
        "pageCount": 2,
        "spotlight": "Alien, Us",
        "style": {
          "sheet": "spotlight"
        },
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
      },
      "traitSets": [
        {
          "id": "name",
          "name": "Name",
          "view": {
            "style": {
              "header": "default",
              "body": "name"
            },
            "page": 1
          },
          "traits": [
            {
              "name": "name",
              "label": "Name",
              "traits": []
            },
            {
              "name": "player",
              "label": "Player",
              "traits": []
            },
            {
              "name": "nickname",
              "label": "Nickname",
              "traits": []
            },
            {
              "name": "pronouns",
              "label": "Pronouns",
              "traits": []
            },
            {
              "name": "description",
              "label": "Description",
              "traits": []
            },
            {
              "name": "game",
              "label": "Game",
              "view": {
                "visibility": "hidden"
              },
              "traits": []
            },
            {
              "name": "portrait",
              "traits": []
            },
            {
              "name": "caption",
              "traits": []
            },
            {
              "name": "plotPoints",
              "rating": {
                "type": "Counter",
                "value": [
                  1
                ],
                "range": [
                  0,
                  20
                ]
              },
              "label": "PP",
              "spendable": true,
              "view": {
                "visibility": "hidden"
              },
              "traits": []
            },
            {
              "name": "notes",
              "view": {
                "visibility": "hidden"
              },
              "traits": []
            }
          ]
        },
        {
          "id": "distinctions",
          "name": "Distinctions",
          "description": "Core alien background, job, and personality",
          "view": {
            "features": {
              "description": true,
              "sfx": false,
              "subtraits": false
            },
            "sharedHinder": true,
            "sharedHinderText": "Gain a PP when you trade out your distinction's d8 rating for a d4.",
            "page": 1,
            "style": {
              "header": "sfx-rows",
              "body": "sfx-rows"
            },
            "multiDie": false,
            "ratingScale": [
              8
            ],
            "notes": "",
            "reservedSlots": 3,
            "pillar": "prime"
          },
          "noun": "Distinction",
          "plural": "Distinctions",
          "traits": [
            {
              "name": "Alien Background:",
              "traits": [
                {
                  "name": "SFX",
                  "traits": [
                    {
                      "name": "Hinder",
                      "rating": { "type": "Die", "value": [4], "range": [4] },
                      "traits": []
                    }
                  ]
                }
              ]
            },
            {
              "name": "Alien Role/Job:",
              "traits": [
                {
                  "name": "SFX",
                  "traits": [
                    {
                      "name": "Hinder",
                      "rating": { "type": "Die", "value": [4], "range": [4] },
                      "traits": []
                    }
                  ]
                }
              ]
            },
            {
              "name": "Personality/Quirk:",
              "traits": [
                {
                  "name": "SFX",
                  "traits": [
                    {
                      "name": "Hinder",
                      "rating": { "type": "Die", "value": [4], "range": [4] },
                      "traits": []
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "id": "subtrait-columns",
          "name": "Skills & Specialties",
          "description": "Core baseline d6 skills with branching d8+ specialties",
          "view": {
            "header": "top",
            "headerAlign": "center",
            "features": {
              "description": false,
              "sfx": false,
              "subtraits": true
            },
            "page": 1,
            "style": {
              "header": "default",
              "body": "subtrait-columns"
            },
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
            "notes": "",
            "reservedSlots": 7,
            "pillar": "prime"
          },
          "rating": {
            "type": "Die",
            "value": [
              6
            ],
            "range": [
              4,
              6,
              8,
              10,
              12
            ]
          },
          "noun": "Skill",
          "plural": "Skills",
          "traits": [
            {
              "name": "Bout",
              "traits": [
                {
                  "name": "",
                  "view": {
                    "branchSide": "left"
                  },
                  "traits": []
                },
                {
                  "name": "",
                  "view": {
                    "branchSide": "right"
                  },
                  "traits": []
                }
              ]
            },
            {
              "name": "Chat",
              "traits": [
                {
                  "name": "",
                  "view": {
                    "branchSide": "left"
                  },
                  "traits": []
                },
                {
                  "name": "",
                  "view": {
                    "branchSide": "right"
                  },
                  "traits": []
                }
              ]
            },
            {
              "name": "Find",
              "traits": [
                {
                  "name": "",
                  "view": {
                    "branchSide": "left"
                  },
                  "traits": []
                },
                {
                  "name": "",
                  "view": {
                    "branchSide": "right"
                  },
                  "traits": []
                }
              ]
            },
            {
              "name": "Make",
              "traits": [
                {
                  "name": "",
                  "view": {
                    "branchSide": "left"
                  },
                  "traits": []
                },
                {
                  "name": "",
                  "view": {
                    "branchSide": "right"
                  },
                  "traits": []
                }
              ]
            },
            {
              "name": "Play",
              "traits": [
                {
                  "name": "",
                  "view": {
                    "branchSide": "left"
                  },
                  "traits": []
                },
                {
                  "name": "",
                  "view": {
                    "branchSide": "right"
                  },
                  "traits": []
                }
              ]
            },
            {
              "name": "Operate",
              "traits": [
                {
                  "name": "",
                  "view": {
                    "branchSide": "left"
                  },
                  "traits": []
                },
                {
                  "name": "",
                  "view": {
                    "branchSide": "right"
                  },
                  "traits": []
                }
              ]
            },
            {
              "name": "Work",
              "traits": [
                {
                  "name": "",
                  "view": {
                    "branchSide": "left"
                  },
                  "traits": []
                },
                {
                  "name": "",
                  "view": {
                    "branchSide": "right"
                  },
                  "traits": []
                }
              ]
            }
          ]
        },
        {
          "id": "values",
          "name": "Values",
          "description": "Alien worldview versus human conditioning",
          "statement": true,
          "view": {
            "header": "top",
            "headerAlign": "left",
            "traitColumns": 2,
            "features": {
              "description": true,
              "sfx": false,
              "subtraits": false
            },
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
            "notes": "",
            "reservedSlots": 7,
            "parts": {
              "rating": {
                "left": "0%",
                "top": 0,
                "width": "100%",
                "height": 1
              },
              "name": {
                "left": "0%",
                "top": 1,
                "width": "100%",
                "height": 1
              }
            },
            "pillar": "prime"
          },
          "noun": "Value",
          "plural": "Values",
          "traits": [
            {
              "name": "Alien",
              "traits": []
            },
            {
              "name": "Conformity",
              "traits": []
            },
            {
              "name": "Materialism",
              "traits": []
            },
            {
              "name": "Paranoia",
              "traits": []
            },
            {
              "name": "Patriotism",
              "traits": []
            },
            {
              "name": "Secrecy",
              "traits": []
            },
            {
              "name": "Spirituality",
              "traits": []
            }
          ]
        },
        {
          "id": "talents",
          "name": "Talents",
          "description": "Specialized alien abilities and tech modules",
          "view": {
            "features": {
              "description": true,
              "sfx": true,
              "subtraits": false
            },
            "page": 1,
            "style": {
              "header": "default",
              "body": "three-column-table"
            },
            "multiDie": false,
            "notes": "",
            "reservedSlots": 4,
            "place": {
              "left": "50%",
              "top": 3,
              "width": "50%",
              "height": 1
            },
            "labels": {
              "col1": "TALENT",
              "col2": "ACTIVATION",
              "col3": "EFFECT"
            },
            "pillar": "plus"
          },
          "noun": "Talent",
          "plural": "Talents",
          "traits": []
        },
        {
          "id": "signature-assets-tech",
          "name": "Signature Assets / Tech",
          "description": "Alien equipment and concealed devices",
          "view": {
            "header": "top",
            "headerAlign": "left",
            "features": {
              "description": true,
              "sfx": false,
              "subtraits": false
            },
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
            "notes": "",
            "reservedSlots": 3,
            "parts": {
              "name": {
                "left": "0%",
                "top": 0,
                "width": "76%",
                "height": 1
              },
              "rating": {
                "left": "76%",
                "top": 0,
                "width": "24%",
                "height": 1
              },
              "description": {
                "left": "0%",
                "top": 1,
                "width": "100%",
                "height": 1
              }
            },
            "pillar": "plus"
          },
          "noun": "Signature Asset / Tech",
          "plural": "Signature Assets / Tech",
          "traits": []
        },
        {
          "id": "relationships",
          "name": "Relationships",
          "description": "Connections to human contacts, superiors, and rivals",
          "view": {
            "header": "top",
            "headerAlign": "left",
            "traitColumns": 2,
            "features": {
              "description": true,
              "sfx": false,
              "subtraits": false
            },
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
            "notes": "",
            "reservedSlots": 10,
            "parts": {
              "rating": {
                "left": "0%",
                "top": 0,
                "width": "100%",
                "height": 1
              },
              "name": {
                "left": "0%",
                "top": 1,
                "width": "100%",
                "height": 1
              }
            },
            "pillar": "prime"
          },
          "noun": "Relationship",
          "plural": "Relationships",
          "traits": []
        },
        {
          "id": "session-record",
          "name": "Session Record",
          "description": "Session track and progression log",
          "view": {
            "header": "top",
            "headerAlign": "left",
            "features": {
              "description": false,
              "sfx": false,
              "subtraits": false
            },
            "page": 2,
            "style": {
              "header": "default",
              "body": "pips"
            },
            "multiDie": false,
            "notes": "",
            "reservedSlots": 20,
            "place": {
              "left": "50%",
              "top": 2,
              "width": "50%",
              "height": 1
            },
            "pips": {
              "labels": true,
              "perRow": 20
            },
            "pillar": "play"
          },
          "rating": {
            "type": "Pip",
            "value": [
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
              false
            ]
          },
          "noun": "Session",
          "plural": "Sessions",
          "traits": []
        }
      ]
    }
  },
  {
    "id": "spotlight-brighter-stars",
    "version": 1,
    "title": "Brighter Stars",
    "subtitle": "Hopepunk Starship Exploration",
    "spotlight": "Brighter Stars",
    "variant": "Character File",
    "pages": 1,
    "genre": "Sci-Fi / Space Exploration",
    "listing": {
      "url": "https://legacy.drivethrurpg.com/product/568411/Brighter-Stars?manufacturers_id=31866",
      "quote": "The mission was supposed to last ten years. There were supposed to be answers at the end of it.",
      "genre": "Aspirational space opera",
      "setting": "d6",
      "prep": "d6",
      "complexity": "d6",
      "image": "https://legacy.drivethrurpg.com/images/31866/568411.jpg"
    },
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
      "player": "",
      "portrait": {
        "url": "",
        "view": {
          "size": "spotlight",
          "location": "header"
        }
      },
      "view": {
        "pageCount": 1,
        "spotlight": "BrighterStars",
        "style": {
          "sheet": "spotlight"
        },
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
      },
      "traitSets": [
        {
          "id": "name",
          "name": "Name",
          "view": {
            "style": {
              "header": "default",
              "body": "name"
            },
            "page": 1
          },
          "traits": [
            {
              "name": "name",
              "label": "Name",
              "traits": []
            },
            {
              "name": "player",
              "label": "Player",
              "traits": []
            },
            {
              "name": "nickname",
              "label": "Nickname",
              "traits": []
            },
            {
              "name": "pronouns",
              "label": "Pronouns",
              "traits": []
            },
            {
              "name": "description",
              "label": "Description",
              "traits": []
            },
            {
              "name": "game",
              "label": "Game",
              "view": {
                "visibility": "hidden"
              },
              "traits": []
            },
            {
              "name": "portrait",
              "traits": []
            },
            {
              "name": "caption",
              "traits": []
            },
            {
              "name": "plotPoints",
              "rating": {
                "type": "Counter",
                "value": [
                  1
                ],
                "range": [
                  0,
                  20
                ]
              },
              "label": "PP",
              "spendable": true,
              "view": {
                "visibility": "hidden"
              },
              "traits": []
            },
            {
              "name": "notes",
              "view": {
                "visibility": "hidden"
              },
              "traits": []
            }
          ]
        },
        {
          "id": "distinctions",
          "name": "Distinctions",
          "description": "Crew role, quality, and personal drive",
          "view": {
            "features": {
              "description": true,
              "sfx": true,
              "subtraits": false
            },
            "page": 1,
            "style": {
              "header": "sfx-rows",
              "body": "sfx-rows"
            },
            "sharedHinder": true,
            "sharedHinderText": "Gain a PP when you trade out your distinction's d8 rating for a d4.",
            "multiDie": false,
            "ratingScale": [
              8
            ],
            "notes": "",
            "reservedSlots": 3,
            "place": {
              "left": "0%",
              "top": 0,
              "width": "64%",
              "height": 1
            },
            "pillar": "prime"
          },
          "noun": "Distinction",
          "plural": "Distinctions",
          "traits": [
            {
              "name": "Purpose:",
              "rating": {
                "type": "Die",
                "value": [
                  8
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "traits": [
                {
                  "name": "SFX",
                  "traits": [
                    {
                      "name": "Hinder",
                      "rating": { "type": "Die", "value": [4], "range": [4] },
                      "traits": []
                    }
                  ]
                }
              ]
            },
            {
              "name": "Quality:",
              "rating": {
                "type": "Die",
                "value": [
                  8
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "traits": [
                {
                  "name": "SFX",
                  "traits": [
                    {
                      "name": "Hinder",
                      "rating": { "type": "Die", "value": [4], "range": [4] },
                      "traits": []
                    }
                  ]
                }
              ]
            },
            {
              "name": "",
              "rating": {
                "type": "Die",
                "value": [
                  8
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "traits": [
                {
                  "name": "SFX",
                  "traits": [
                    {
                      "name": "Hinder",
                      "rating": { "type": "Die", "value": [4], "range": [4] },
                      "traits": []
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "id": "values",
          "name": "Values",
          "description": "Guiding philosophies paired with personal statements",
          "statement": true,
          "hasQuestionedPip": true,
          "view": {
            "features": {
              "description": true,
              "sfx": false,
              "subtraits": false
            },
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
            "notes": "",
            "reservedSlots": 5,
            "place": {
              "left": "0%",
              "top": 1,
              "width": "64%",
              "height": 1
            },
            "pillar": "prime"
          },
          "noun": "Value",
          "plural": "Values",
          "traits": [
            {
              "name": "Courage",
              "traits": []
            },
            {
              "name": "Curiosity",
              "traits": []
            },
            {
              "name": "Hope",
              "traits": []
            },
            {
              "name": "Logic",
              "traits": []
            },
            {
              "name": "Peace",
              "traits": []
            }
          ]
        },
        {
          "id": "relationships",
          "name": "Relationships",
          "description": "Crew connections and ties to shipmates",
          "statement": true,
          "view": {
            "header": "top",
            "headerAlign": "left",
            "features": {
              "description": true,
              "sfx": false,
              "subtraits": false
            },
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
            "notes": "",
            "reservedSlots": 8,
            "place": {
              "left": "0%",
              "top": 2,
              "width": "64%",
              "height": 1
            },
            "parts": {
              "name": {
                "left": "0%",
                "top": 0,
                "width": "100%",
                "height": 1
              },
              "rating": {
                "left": "0%",
                "top": 1,
                "width": "100%",
                "height": 1
              }
            },
            "pillar": "prime"
          },
          "noun": "Relationship",
          "plural": "Relationships",
          "traits": []
        },
        {
          "id": "signature-assets",
          "name": "Signature Assets",
          "description": "Specialized starship equipment and personal gear",
          "view": {
            "features": {
              "description": true,
              "sfx": false,
              "subtraits": false
            },
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
            "notes": "",
            "reservedSlots": 3,
            "place": {
              "left": "64%",
              "top": 0,
              "width": "36%",
              "height": 1
            },
            "parts": {
              "rating": {
                "left": "0%",
                "top": 0,
                "width": "100%",
                "height": 1
              },
              "name": {
                "left": "0%",
                "top": 1,
                "width": "100%",
                "height": 1
              }
            },
            "pillar": "plus"
          },
          "noun": "Signature Asset",
          "plural": "Signature Assets",
          "traits": []
        },
        {
          "id": "personal-milestones",
          "name": "Personal Milestones",
          "view": {
            "header": "top",
            "headerAlign": "left",
            "features": {
              "description": true,
              "sfx": false,
              "subtraits": false
            },
            "page": 1,
            "style": {
              "header": "default",
              "body": "default"
            },
            "multiDie": false,
            "ratingScale": [],
            "reservedSlots": 3,
            "place": {
              "left": "64%",
              "top": 1,
              "width": "36%",
              "height": 1
            },
            "parts": {
              "name": {
                "left": "0%",
                "top": 0,
                "width": "100%",
                "height": 1
              },
              "description": {
                "left": "0%",
                "top": 1,
                "width": "100%",
                "height": 1
              }
            },
            "pillar": "plus"
          },
          "noun": "Milestone",
          "plural": "Milestones",
          "traits": [
            {
              "name": "1 XP",
              "traits": []
            },
            {
              "name": "3 XP",
              "traits": []
            },
            {
              "name": "10 XP",
              "traits": []
            }
          ]
        },
        {
          "id": "group-milestones",
          "name": "Group Milestones",
          "view": {
            "header": "top",
            "headerAlign": "left",
            "features": {
              "description": true,
              "sfx": false,
              "subtraits": false
            },
            "page": 1,
            "style": {
              "header": "default",
              "body": "default"
            },
            "multiDie": false,
            "ratingScale": [],
            "reservedSlots": 3,
            "place": {
              "left": "64%",
              "top": 2,
              "width": "36%",
              "height": 1
            },
            "parts": {
              "name": {
                "left": "0%",
                "top": 0,
                "width": "100%",
                "height": 1
              },
              "description": {
                "left": "0%",
                "top": 1,
                "width": "100%",
                "height": 1
              }
            },
            "pillar": "plus"
          },
          "noun": "Milestone",
          "plural": "Milestones",
          "traits": [
            {
              "name": "1 XP",
              "traits": []
            },
            {
              "name": "3 XP",
              "traits": []
            },
            {
              "name": "10 XP",
              "traits": []
            }
          ]
        },
        {
          "id": "xp",
          "name": "XP",
          "description": "Experience points bubble track",
          "view": {
            "features": {
              "description": false,
              "sfx": false,
              "subtraits": false
            },
            "page": 1,
            "style": {
              "header": "default",
              "body": "pips"
            },
            "pips": {
              "perRow": 5,
              "connected": true
            },
            "reservedSlots": 0,
            "place": {
              "left": "64%",
              "top": 3,
              "width": "36%",
              "height": 1
            },
            "pillar": "play"
          },
          "rating": {
            "type": "Pip",
            "value": [
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
              false
            ]
          },
          "noun": "XP",
          "plural": "XP",
          "traits": []
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
    "listing": {
      "url": "https://legacy.drivethrurpg.com/product/574554/Camp-Bewilderwood?manufacturers_id=31866",
      "quote": "Someone has decided you’re destined for great things. You’re twelve.",
      "genre": "Supernatural summer camp / YA adventure",
      "setting": "d8",
      "prep": "d6",
      "complexity": "d8",
      "image": "https://legacy.drivethrurpg.com/images/31866/574554.jpg"
    },
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
      "player": "",
      "portrait": {
        "url": "",
        "view": {
          "size": "spotlight",
          "location": "header"
        }
      },
      "view": {
        "pageCount": 1,
        "spotlight": "Camp Bewilderwood",
        "style": {
          "sheet": "spotlight"
        },
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
      },
      "traitSets": [
        {
          "id": "name",
          "name": "Name",
          "view": {
            "style": {
              "header": "default",
              "body": "name"
            },
            "page": 1
          },
          "traits": [
            {
              "name": "name",
              "label": "Name",
              "traits": []
            },
            {
              "name": "player",
              "label": "Player",
              "traits": []
            },
            {
              "name": "nickname",
              "label": "Nickname",
              "traits": []
            },
            {
              "name": "pronouns",
              "label": "Pronouns",
              "traits": []
            },
            {
              "name": "description",
              "label": "Description",
              "traits": []
            },
            {
              "name": "game",
              "label": "Game",
              "view": {
                "visibility": "hidden"
              },
              "traits": []
            },
            {
              "name": "portrait",
              "traits": []
            },
            {
              "name": "caption",
              "traits": []
            },
            {
              "name": "plotPoints",
              "rating": {
                "type": "Counter",
                "value": [
                  1
                ],
                "range": [
                  0,
                  20
                ]
              },
              "label": "PP",
              "spendable": true,
              "view": {
                "visibility": "hidden"
              },
              "traits": []
            },
            {
              "name": "notes",
              "view": {
                "visibility": "hidden"
              },
              "traits": []
            }
          ]
        },
        {
          "id": "distinctions",
          "name": "Distinctions",
          "description": "Camp background, camper reputation, and hidden destiny",
          "view": {
            "features": {
              "description": true,
              "sfx": true,
              "subtraits": false
            },
            "page": 1,
            "style": {
              "header": "sfx-rows",
              "body": "sfx-rows"
            },
            "sharedHinder": true,
            "sharedHinderText": "Hinder: Gain a PP when you trade out your distinction's d8 rating for a d4.",
            "multiDie": false,
            "notes": "",
            "reservedSlots": 3,
            "place": {
              "left": "0%",
              "top": 0,
              "width": "66%",
              "height": 1
            },
            "parts": {
              "name": {
                "left": "0%",
                "top": 0,
                "width": "70%",
                "height": 1
              },
              "rating": {
                "left": "70%",
                "top": 0,
                "width": "30%",
                "height": 1
              },
              "description": {
                "left": "0%",
                "top": 1,
                "width": "100%",
                "height": 1
              },
              "block": {
                "left": "0%",
                "top": 2,
                "width": "100%",
                "height": 1
              }
            },
            "pillar": "prime"
          },
          "noun": "Distinction",
          "plural": "Distinctions",
          "traits": [
            {
              "name": "HERITAGE:",
              "rating": {
                "type": "Die",
                "value": [
                  8
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "traits": [
                {
                  "name": "SFX",
                  "traits": [
                    {
                      "name": "Heritage",
                      "description": "Spend a PP to step up an attribute when you connect to your heritage.",
                      "traits": []
                    }
                  ]
                }
              ]
            },
            {
              "name": "DESTINY:",
              "rating": {
                "type": "Die",
                "value": [
                  8
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "traits": [
                {
                  "name": "SFX",
                  "traits": [
                    {
                      "name": "Destiny",
                      "description": "Spend a PP to reroll your dice when you embrace your destiny.",
                      "traits": []
                    }
                  ]
                }
              ]
            },
            {
              "name": "CAMP REPUTATION:",
              "rating": {
                "type": "Die",
                "value": [
                  8
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "traits": [
                {
                  "name": "SFX",
                  "traits": [
                    {
                      "name": "Camp Reputation",
                      "description": "Spend a PP to create a d8 asset linked to the thing you're known for.",
                      "traits": []
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "id": "values",
          "name": "Values",
          "description": "Camper ideals and loyalties",
          "statement": true,
          "hasQuestionedPip": true,
          "view": {
            "features": {
              "description": true,
              "sfx": false,
              "subtraits": false
            },
            "page": 1,
            "style": {
              "header": "default",
              "body": "default"
            },
            "statement": true,
            "hasQuestionedPip": true,
            "ratingScale": [
              4,
              6,
              8,
              10,
              12
            ],
            "multiDie": false,
            "notes": "",
            "reservedSlots": 5,
            "place": {
              "left": "0%",
              "top": 1,
              "width": "66%",
              "height": 1
            },
            "parts": {
              "name": {
                "left": "0%",
                "top": 0,
                "width": "70%",
                "height": 1
              },
              "rating": {
                "left": "70%",
                "top": 0,
                "width": "30%",
                "height": 1
              }
            },
            "pillar": "prime"
          },
          "noun": "Value",
          "plural": "Values",
          "traits": [
            {
              "name": "Bravery",
              "traits": []
            },
            {
              "name": "Community",
              "traits": []
            },
            {
              "name": "Curiosity",
              "traits": []
            },
            {
              "name": "Friendship",
              "traits": []
            },
            {
              "name": "Mischief",
              "traits": []
            }
          ]
        },
        {
          "id": "signature-assets",
          "name": "Signature Assets",
          "description": "Treasured camper keepsakes and scavenged relics",
          "view": {
            "features": {
              "description": true,
              "sfx": false,
              "subtraits": false
            },
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
            "notes": "",
            "reservedSlots": 3,
            "place": {
              "left": "66%",
              "top": 0,
              "width": "34%",
              "height": 1
            },
            "parts": {
              "rating": {
                "left": "0%",
                "top": 0,
                "width": "100%",
                "height": 1
              },
              "name": {
                "left": "0%",
                "top": 1,
                "width": "100%",
                "height": 1
              }
            },
            "pillar": "plus"
          },
          "noun": "Signature Asset",
          "plural": "Signature Assets",
          "traits": []
        },
        {
          "id": "attributes",
          "name": "Attributes",
          "description": "Core camper capability ratings",
          "view": {
            "features": {
              "description": false,
              "sfx": false,
              "subtraits": false
            },
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
            "notes": "",
            "reservedSlots": 3,
            "ringTrait": false,
            "place": {
              "left": "66%",
              "top": 1,
              "width": "34%",
              "height": 1
            },
            "parts": {
              "name": {
                "left": "0%",
                "top": 0,
                "width": "100%",
                "height": 1
              },
              "rating": {
                "left": "0%",
                "top": 1,
                "width": "100%",
                "height": 1
              }
            },
            "pillar": "prime"
          },
          "noun": "Attribute",
          "plural": "Attributes",
          "traits": [
            {
              "name": "Mental",
              "traits": []
            },
            {
              "name": "Physical",
              "traits": []
            },
            {
              "name": "Social",
              "traits": []
            }
          ]
        },
        {
          "id": "paired-slots",
          "name": "Standing",
          "description": "Camp social standing with complication and bonus dice",
          "statement": true,
          "ratingPosition": "inline",
          "view": {
            "features": {
              "description": true,
              "sfx": false,
              "subtraits": true
            },
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
            "notes": "",
            "reservedSlots": 6,
            "place": {
              "left": "0%",
              "top": 2,
              "width": "40%",
              "height": 1
            },
            "labels": {
              "slot0": "COMPLICATION",
              "slot1": "BONUS"
            },
            "pillar": "plus"
          },
          "noun": "Standing",
          "plural": "Standings",
          "traits": [
            {
              "name": "",
              "traits": [
                {
                  "name": "COMPLICATION",
                  "traits": []
                },
                {
                  "name": "BONUS",
                  "traits": []
                }
              ]
            },
            {
              "name": "",
              "traits": [
                {
                  "name": "COMPLICATION",
                  "traits": []
                },
                {
                  "name": "BONUS",
                  "traits": []
                }
              ]
            },
            {
              "name": "",
              "traits": [
                {
                  "name": "COMPLICATION",
                  "traits": []
                },
                {
                  "name": "BONUS",
                  "traits": []
                }
              ]
            },
            {
              "name": "",
              "traits": [
                {
                  "name": "COMPLICATION",
                  "traits": []
                },
                {
                  "name": "BONUS",
                  "traits": []
                }
              ]
            },
            {
              "name": "",
              "traits": [
                {
                  "name": "COMPLICATION",
                  "traits": []
                },
                {
                  "name": "BONUS",
                  "traits": []
                }
              ]
            },
            {
              "name": "",
              "traits": [
                {
                  "name": "COMPLICATION",
                  "traits": []
                },
                {
                  "name": "BONUS",
                  "traits": []
                }
              ]
            }
          ]
        },
        {
          "id": "badges",
          "name": "Badges",
          "description": "Merit badges earned at camp",
          "hasCounterColumn": true,
          "counterLabel": "XP",
          "view": {
            "features": {
              "description": false,
              "sfx": false,
              "subtraits": false
            },
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
            "notes": "",
            "reservedSlots": 17,
            "place": {
              "left": "40%",
              "top": 2,
              "width": "60%",
              "height": 1
            },
            "pillar": "plus"
          },
          "noun": "Badge",
          "plural": "Badges",
          "traits": []
        },
        {
          "id": "talents",
          "name": "Talents",
          "description": "Camper knacks and signature tricks",
          "view": {
            "features": {
              "description": true,
              "sfx": true,
              "subtraits": false
            },
            "page": 1,
            "style": {
              "header": "default",
              "body": "three-column-table"
            },
            "multiDie": false,
            "notes": "",
            "reservedSlots": 2,
            "labels": {
              "col1": "TALENT",
              "col2": "ACTIVATION",
              "col3": "EFFECT"
            },
            "pillar": "plus"
          },
          "noun": "Talent",
          "plural": "Talents",
          "traits": []
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
    "listing": {
      "url": "https://legacy.drivethrurpg.com/product/572308/Cosa-Nostra?manufacturers_id=31866",
      "quote": "The Castellammarese War is coming. Everyone in the Five Families knows it.",
      "genre": "Historical Crime Drama",
      "setting": "d8",
      "prep": "d6",
      "complexity": "d8",
      "image": "https://legacy.drivethrurpg.com/images/31866/572308.jpg"
    },
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
      "player": "",
      "portrait": {
        "url": "",
        "view": {
          "size": "spotlight",
          "location": "header"
        }
      },
      "view": {
        "pageCount": 1,
        "spotlight": "Cosa Nostra",
        "style": {
          "sheet": "spotlight"
        },
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
      },
      "traitSets": [
        {
          "id": "name",
          "name": "Name",
          "view": {
            "style": {
              "header": "default",
              "body": "name"
            },
            "page": 1
          },
          "traits": [
            {
              "name": "name",
              "label": "Name",
              "traits": []
            },
            {
              "name": "player",
              "label": "Player",
              "traits": []
            },
            {
              "name": "nickname",
              "label": "Nickname",
              "traits": []
            },
            {
              "name": "pronouns",
              "label": "Pronouns",
              "traits": []
            },
            {
              "name": "description",
              "label": "Description",
              "traits": []
            },
            {
              "name": "game",
              "label": "Game",
              "view": {
                "visibility": "hidden"
              },
              "traits": []
            },
            {
              "name": "portrait",
              "traits": []
            },
            {
              "name": "caption",
              "traits": []
            },
            {
              "name": "plotPoints",
              "rating": {
                "type": "Counter",
                "value": [
                  1
                ],
                "range": [
                  0,
                  20
                ]
              },
              "label": "PP",
              "spendable": true,
              "view": {
                "visibility": "hidden"
              },
              "traits": []
            },
            {
              "name": "notes",
              "view": {
                "visibility": "hidden"
              },
              "traits": []
            }
          ]
        },
        {
          "id": "distinctions",
          "name": "Distinctions",
          "description": "Origins and syndicate reputation (Distinction Stress: Shaken, Rattled, Broken)",
          "view": {
            "features": {
              "description": true,
              "sfx": false,
              "subtraits": false
            },
            "traitColumns": 3,
            "page": 1,
            "style": {
              "header": "sfx-rows",
              "body": "sfx-rows"
            },
            "ratingScale": [
              8,
              10,
              12
            ],
            "sharedHinder": true,
            "sharedHinderText": "Gain a PP when you trade out your distinction's die rating for a d4.\nShaken: When a distinction's stress rating is higher than its die rating, you may only keep one die for your result when using that distinction.",
            "multiDie": false,
            "notes": "",
            "reservedSlots": 3,
            "parts": {
              "name": {
                "left": "0%",
                "top": 0,
                "width": "42%",
                "height": 1
              },
              "rating": {
                "left": "42%",
                "top": 0,
                "width": "18%",
                "height": 1
              },
              "trackLabel": {
                "left": "60%",
                "top": 0,
                "width": "13%",
                "height": 1
              },
              "track": {
                "left": "73%",
                "top": 0,
                "width": "27%",
                "height": 1
              },
              "description": {
                "left": "0%",
                "top": 1,
                "width": "100%",
                "height": 1
              }
            },
            "pillar": "prime"
          },
          "noun": "Distinction",
          "plural": "Distinctions",
          "traits": [
            {
              "name": "Neighborhood",
              "traits": []
            },
            {
              "name": "Crew",
              "traits": []
            },
            {
              "name": "The Family",
              "traits": []
            }
          ]
        },
        {
          "id": "resources",
          "name": "Resources",
          "description": "Syndicate operational pools and assets",
          "view": {
            "features": {
              "description": true,
              "sfx": false,
              "subtraits": false
            },
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
            "notes": "",
            "reservedSlots": 6,
            "place": {
              "left": "0%",
              "top": 1,
              "width": "66.663%",
              "height": 1
            },
            "labels": {
              "rating": "RATING",
              "dice": "/ DICE"
            },
            "pillar": "plus"
          },
          "noun": "Resource",
          "plural": "Resources",
          "traits": []
        },
        {
          "id": "drives",
          "name": "Drives",
          "description": "Gain a PP when you use a drive rated at d4.",
          "view": {
            "header": "top",
            "headerAlign": "center",
            "features": {
              "description": false,
              "sfx": false,
              "subtraits": false
            },
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
            "notes": "",
            "reservedSlots": 5,
            "place": {
              "left": "0%",
              "top": 2,
              "width": "33.333%",
              "height": 1
            },
            "parts": {
              "name": {
                "left": "0%",
                "top": 0,
                "width": "100%",
                "height": 1
              },
              "rating": {
                "left": "0%",
                "top": 1,
                "width": "100%",
                "height": 1
              }
            },
            "pillar": "prime"
          },
          "noun": "Drive",
          "plural": "Drives",
          "traits": [
            {
              "name": "Corruption",
              "traits": []
            },
            {
              "name": "Greed",
              "traits": []
            },
            {
              "name": "Omerta",
              "traits": []
            },
            {
              "name": "Retribution",
              "traits": []
            },
            {
              "name": "Violence",
              "traits": []
            }
          ]
        },
        {
          "id": "signature-assets",
          "name": "Signature Assets",
          "description": "Personal weapons, vehicles, and syndicate perks",
          "view": {
            "header": "top",
            "headerAlign": "center",
            "features": {
              "description": false,
              "sfx": false,
              "subtraits": false
            },
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
            "notes": "",
            "reservedSlots": 3,
            "place": {
              "left": "0%",
              "top": 3,
              "width": "33.333%",
              "height": 1
            },
            "parts": {
              "name": {
                "left": "0%",
                "top": 0,
                "width": "76%",
                "height": 1
              },
              "rating": {
                "left": "76%",
                "top": 0,
                "width": "24%",
                "height": 1
              }
            },
            "pillar": "plus"
          },
          "noun": "Signature Asset",
          "plural": "Signature Assets",
          "traits": []
        },
        {
          "id": "roles-specialties",
          "name": "Roles & Specialties",
          "description": "Syndicate roles with specialized criminal expertise",
          "view": {
            "header": "top",
            "headerAlign": "center",
            "features": {
              "description": false,
              "sfx": false,
              "subtraits": true
            },
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
            "notes": "",
            "reservedSlots": 5,
            "place": {
              "left": "33.333%",
              "top": 2,
              "width": "66.667%",
              "height": 1
            },
            "labels": {
              "left": "SKILL",
              "right": "SPECIALTIES"
            },
            "pillar": "prime"
          },
          "noun": "Role",
          "plural": "Roles",
          "traits": [
            {
              "name": "Big Shot",
              "traits": []
            },
            {
              "name": "Brains",
              "traits": []
            },
            {
              "name": "Enforcer",
              "traits": []
            },
            {
              "name": "Thief",
              "traits": []
            },
            {
              "name": "Wheelman",
              "traits": []
            }
          ]
        },
        {
          "id": "session-record",
          "name": "Session Record",
          "description": "Session tracking and milestone progression",
          "view": {
            "header": "top",
            "headerAlign": "left",
            "features": {
              "description": false,
              "sfx": false,
              "subtraits": false
            },
            "page": 1,
            "style": {
              "header": "default",
              "body": "pips"
            },
            "multiDie": false,
            "notes": "",
            "reservedSlots": 15,
            "place": {
              "left": "66.663%",
              "top": 1,
              "width": "33.334%",
              "height": 1
            },
            "pips": {
              "labels": true,
              "perRow": 1
            },
            "pillar": "play"
          },
          "rating": {
            "type": "Pip",
            "value": [
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
              false
            ]
          },
          "noun": "Session",
          "plural": "Sessions",
          "traits": []
        },
        {
          "id": "role-sfx",
          "name": "Role SFX",
          "view": {
            "header": "top",
            "headerAlign": "center",
            "features": {
              "description": true,
              "sfx": false,
              "subtraits": false
            },
            "page": 1,
            "style": {
              "header": "default",
              "body": "default"
            },
            "reservedSlots": 3,
            "place": {
              "left": "33.333%",
              "top": 3,
              "width": "66.667%",
              "height": 1
            },
            "pillar": "plus"
          },
          "noun": "SFX",
          "plural": "SFX",
          "traits": []
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
    "listing": {
      "url": "https://legacy.drivethrurpg.com/product/567041/Cortex-Prime-Game-Handbook-2nd-Edition?manufacturers_id=31866"
    },
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
      "player": "",
      "portrait": {
        "url": "",
        "view": {
          "size": "spotlight",
          "location": "header"
        }
      },
      "view": {
        "pageCount": 1,
        "spotlight": "Eidolon Alpha",
        "style": {
          "sheet": "spotlight"
        },
        "columnAlignment": "top-base",
        "columnOffsets": {
          "left": 0,
          "center": 0,
          "right": 0
        }
      },
      "traitSets": [
        {
          "id": "name",
          "name": "Name",
          "view": {
            "style": {
              "header": "default",
              "body": "name"
            },
            "page": 1
          },
          "traits": [
            {
              "name": "name",
              "label": "Name",
              "traits": []
            },
            {
              "name": "player",
              "label": "Player",
              "traits": []
            },
            {
              "name": "nickname",
              "label": "Nickname",
              "traits": []
            },
            {
              "name": "pronouns",
              "label": "Pronouns",
              "traits": []
            },
            {
              "name": "description",
              "label": "Description",
              "traits": []
            },
            {
              "name": "game",
              "label": "Game",
              "view": {
                "visibility": "hidden"
              },
              "traits": []
            },
            {
              "name": "portrait",
              "traits": []
            },
            {
              "name": "caption",
              "traits": []
            },
            {
              "name": "plotPoints",
              "rating": {
                "type": "Counter",
                "value": [
                  1
                ],
                "range": [
                  0,
                  20
                ]
              },
              "label": "PP",
              "spendable": true,
              "view": {
                "visibility": "hidden"
              },
              "traits": []
            },
            {
              "name": "notes",
              "view": {
                "visibility": "hidden"
              },
              "traits": []
            }
          ]
        },
        {
          "id": "roles",
          "name": "Roles",
          "description": "Prime vocations and endarch callings",
          "view": {
            "features": {
              "description": false,
              "sfx": false,
              "subtraits": false
            },
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
            "notes": "",
            "reservedSlots": 4,
            "place": {
              "left": "0%",
              "top": 0,
              "width": "30%",
              "height": 1
            },
            "parts": {
              "name": {
                "left": "0%",
                "top": 0,
                "width": "100%",
                "height": 1
              },
              "rating": {
                "left": "0%",
                "top": 1,
                "width": "100%",
                "height": 1
              }
            },
            "pillar": "prime"
          },
          "noun": "Role",
          "plural": "Roles",
          "traits": [
            {
              "name": "Warrior",
              "traits": []
            },
            {
              "name": "Priest",
              "traits": []
            },
            {
              "name": "Scout",
              "traits": []
            },
            {
              "name": "Other",
              "traits": []
            }
          ]
        },
        {
          "id": "attributes",
          "name": "Attributes",
          "description": "Elemental selfhood with highlight circles and stress",
          "hasQuestionedPip": true,
          "view": {
            "features": {
              "description": false,
              "sfx": false,
              "subtraits": false
            },
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
            "notes": "",
            "reservedSlots": 5,
            "ringTrait": false,
            "place": {
              "left": "0%",
              "top": 1,
              "width": "30%",
              "height": 1
            },
            "parts": {
              "name": {
                "left": "0%",
                "top": 0,
                "width": "100%",
                "height": 1
              },
              "rating": {
                "left": "0%",
                "top": 1,
                "width": "100%",
                "height": 1
              },
              "trackLabel": {
                "left": "0%",
                "top": 2,
                "width": "100%",
                "height": 1
              },
              "track": {
                "left": "0%",
                "top": 3,
                "width": "100%",
                "height": 1
              }
            },
            "labels": {
              "stress": "STRESS"
            },
            "pillar": "prime"
          },
          "noun": "Attribute",
          "plural": "Attributes",
          "traits": [
            {
              "name": "Courage",
              "traits": []
            },
            {
              "name": "Grace",
              "traits": []
            },
            {
              "name": "Guile",
              "traits": []
            },
            {
              "name": "Reason",
              "traits": []
            },
            {
              "name": "Vigor",
              "traits": []
            }
          ]
        },
        {
          "id": "endarch-distinction",
          "name": "Endarch Distinction",
          "description": "Ancestral endarch patron and its three bound powers",
          "view": {
            "features": {
              "description": true,
              "sfx": true,
              "subtraits": true
            },
            "page": 1,
            "style": {
              "header": "sfx-rows",
              "body": "sfx-rows"
            },
            "multiDie": false,
            "ratingScale": [
              8
            ],
            "subtraitRatingScale": [
              8
            ],
            "notes": "",
            "reservedSlots": 1,
            "place": {
              "left": "30%",
              "top": 0,
              "width": "60%",
              "height": 1
            },
            "pillar": "prime"
          },
          "noun": "Endarch Distinction",
          "plural": "Endarch Distinctions",
          "traits": [
            {
              "name": "",
              "rating": {
                "type": "Die",
                "value": [
                  8
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "traits": [
                {
                  "name": "Power 1",
                  "rating": {
                    "type": "Die",
                    "value": [
                      8
                    ],
                    "range": [
                      4,
                      6,
                      8,
                      10,
                      12
                    ]
                  },
                  "traits": []
                },
                {
                  "name": "Power 2",
                  "rating": {
                    "type": "Die",
                    "value": [
                      8
                    ],
                    "range": [
                      4,
                      6,
                      8,
                      10,
                      12
                    ]
                  },
                  "traits": []
                },
                {
                  "name": "Power 3",
                  "rating": {
                    "type": "Die",
                    "value": [
                      8
                    ],
                    "range": [
                      4,
                      6,
                      8,
                      10,
                      12
                    ]
                  },
                  "traits": []
                },
                {
                  "name": "SFX",
                  "traits": [
                    {
                      "name": "Hinder",
                      "rating": { "type": "Die", "value": [4], "range": [4] },
                      "description": "Gain a PP when you switch out your endarch distinction's rating of d8 for a d4.",
                      "traits": []
                    },
                    {
                      "name": "Summon",
                      "description": "Shut down this endarch distinction to summon your Eidolon on your next turn.",
                      "traits": []
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "id": "summoned-eidolon",
          "name": "Summoned Eidolon",
          "description": "Manifested eidolon form: base trait, scale, powers, highlights",
          "view": {
            "header": "top",
            "headerAlign": "center",
            "features": {
              "description": true,
              "sfx": false,
              "subtraits": true
            },
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
            "notes": "",
            "reservedSlots": 5,
            "traitColumns": 3,
            "place": {
              "left": "30%",
              "top": 1,
              "width": "60%",
              "height": 1
            },
            "pillar": "plus"
          },
          "noun": "Eidolon Trait",
          "plural": "Eidolon Traits",
          "traits": [
            {
              "name": "Base Trait",
              "rating": {
                "type": "Dice",
                "value": [
                  10,
                  10
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "description": "d10 d10 or d4 d4",
              "spendable": true,
              "traits": []
            },
            {
              "name": "Scale",
              "rating": {
                "type": "Die",
                "value": [
                  8
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "traits": []
            },
            {
              "name": "Power 1",
              "rating": {
                "type": "Die",
                "value": [
                  12
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "traits": []
            },
            {
              "name": "Power 2",
              "rating": {
                "type": "Die",
                "value": [
                  12
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "traits": []
            },
            {
              "name": "Power 3",
              "rating": {
                "type": "Die",
                "value": [
                  12
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "traits": []
            },
            {
              "name": "Highlight Attribute 1",
              "rating": {
                "type": "Die",
                "value": [
                  12
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "traits": []
            },
            {
              "name": "Highlight Attribute 2",
              "rating": {
                "type": "Die",
                "value": [
                  12
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "traits": []
            }
          ]
        },
        {
          "id": "role-freeform-distinctions",
          "name": "Role & Freeform Distinctions",
          "description": "Chosen calling and personal definition",
          "view": {
            "features": {
              "description": true,
              "sfx": true,
              "subtraits": false
            },
            "page": 1,
            "style": {
              "header": "sfx-rows",
              "body": "sfx-rows"
            },
            "multiDie": false,
            "ratingScale": [
              8
            ],
            "notes": "",
            "reservedSlots": 2,
            "place": {
              "left": "30%",
              "top": 2,
              "width": "60%",
              "height": 1
            },
            "pillar": "prime"
          },
          "noun": "Distinction",
          "plural": "Distinctions",
          "traits": [
            {
              "name": "Role Distinction",
              "rating": {
                "type": "Die",
                "value": [
                  8
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "traits": [
                {
                  "name": "SFX",
                  "traits": [
                    {
                      "name": "Hinder",
                      "rating": { "type": "Die", "value": [4], "range": [4] },
                      "traits": []
                    }
                  ]
                }
              ]
            },
            {
              "name": "Freeform Distinction",
              "rating": {
                "type": "Die",
                "value": [
                  8
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "traits": [
                {
                  "name": "SFX",
                  "traits": [
                    {
                      "name": "Hinder",
                      "rating": { "type": "Die", "value": [4], "range": [4] },
                      "traits": []
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "id": "xp",
          "name": "XP",
          "description": "Experience points bubble track",
          "view": {
            "header": "top",
            "headerAlign": "center",
            "features": {
              "description": false,
              "sfx": false,
              "subtraits": false
            },
            "page": 1,
            "style": {
              "header": "default",
              "body": "pips"
            },
            "multiDie": false,
            "notes": "",
            "reservedSlots": 0,
            "pips": {
              "perRow": 1,
              "connected": false
            },
            "place": {
              "left": "90%",
              "top": 0,
              "width": "10%",
              "height": 3
            },
            "pillar": "play"
          },
          "rating": {
            "type": "Pip",
            "value": [
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
              false
            ]
          },
          "noun": "XP",
          "plural": "XP",
          "traits": []
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
    "listing": {
      "url": "https://legacy.drivethrurpg.com/product/567041/Cortex-Prime-Game-Handbook-2nd-Edition?manufacturers_id=31866"
    },
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
      "player": "",
      "portrait": {
        "url": "",
        "view": {
          "size": "spotlight",
          "location": "header"
        }
      },
      "view": {
        "pageCount": 2,
        "spotlight": "Hammerheads",
        "style": {
          "sheet": "spotlight"
        },
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
      },
      "traitSets": [
        {
          "id": "name",
          "name": "Name",
          "view": {
            "style": {
              "header": "default",
              "body": "name"
            },
            "page": 1
          },
          "traits": [
            {
              "name": "name",
              "label": "Name",
              "traits": []
            },
            {
              "name": "player",
              "label": "Player",
              "traits": []
            },
            {
              "name": "nickname",
              "label": "Nickname",
              "traits": []
            },
            {
              "name": "pronouns",
              "label": "Pronouns",
              "traits": []
            },
            {
              "name": "description",
              "label": "Description",
              "traits": []
            },
            {
              "name": "game",
              "label": "Game",
              "view": {
                "visibility": "hidden"
              },
              "traits": []
            },
            {
              "name": "portrait",
              "traits": []
            },
            {
              "name": "caption",
              "traits": []
            },
            {
              "name": "plotPoints",
              "rating": {
                "type": "Counter",
                "value": [
                  1
                ],
                "range": [
                  0,
                  20
                ]
              },
              "label": "PP",
              "spendable": true,
              "view": {
                "visibility": "hidden"
              },
              "traits": []
            },
            {
              "name": "notes",
              "view": {
                "visibility": "hidden"
              },
              "traits": []
            }
          ]
        },
        {
          "id": "attributes",
          "name": "Attributes",
          "description": "Body, mind, and presence under pressure",
          "view": {
            "features": {
              "description": false,
              "sfx": false,
              "subtraits": false
            },
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
            "notes": "",
            "reservedSlots": 3,
            "ringTrait": false,
            "place": {
              "left": "0%",
              "top": 0,
              "width": "36%",
              "height": 1
            },
            "parts": {
              "name": {
                "left": "0%",
                "top": 0,
                "width": "100%",
                "height": 1
              },
              "rating": {
                "left": "0%",
                "top": 1,
                "width": "100%",
                "height": 1
              },
              "trackLabel": {
                "left": "0%",
                "top": 2,
                "width": "100%",
                "height": 1
              },
              "track": {
                "left": "0%",
                "top": 3,
                "width": "100%",
                "height": 1
              }
            },
            "labels": {
              "stress": "STRESS"
            },
            "pillar": "prime"
          },
          "noun": "Attribute",
          "plural": "Attributes",
          "traits": [
            {
              "name": "Physical",
              "traits": []
            },
            {
              "name": "Mental",
              "traits": []
            },
            {
              "name": "Social",
              "traits": []
            }
          ]
        },
        {
          "id": "training-packages",
          "name": "Training Packages",
          "description": "Rescue disciplines and vehicle qualifications",
          "view": {
            "features": {
              "description": false,
              "sfx": false,
              "subtraits": false
            },
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
            "notes": "",
            "reservedSlots": 14,
            "place": {
              "left": "0%",
              "top": 1,
              "width": "36%",
              "height": 1
            },
            "parts": {
              "name": {
                "left": "0%",
                "top": 0,
                "width": "100%",
                "height": 1
              },
              "rating": {
                "left": "0%",
                "top": 1,
                "width": "100%",
                "height": 1
              }
            },
            "pillar": "prime"
          },
          "noun": "Training Package",
          "plural": "Training Packages",
          "traits": [
            {
              "name": "Crowd Control",
              "traits": []
            },
            {
              "name": "Emergency Medical",
              "traits": []
            },
            {
              "name": "Firefighting",
              "traits": []
            },
            {
              "name": "Hammerhead Pilot",
              "traits": []
            },
            {
              "name": "HAZMAT",
              "traits": []
            },
            {
              "name": "High-Altitude Recovery",
              "traits": []
            },
            {
              "name": "Legal Specialist",
              "traits": []
            },
            {
              "name": "Logistics",
              "traits": []
            },
            {
              "name": "Marine Recovery",
              "traits": []
            },
            {
              "name": "Network Specialist",
              "traits": []
            },
            {
              "name": "Mechanic",
              "traits": []
            },
            {
              "name": "Tactical Response",
              "traits": []
            },
            {
              "name": "Technical Analyst",
              "traits": []
            },
            {
              "name": "Urban Recovery",
              "traits": []
            }
          ]
        },
        {
          "id": "distinctions",
          "name": "Distinctions",
          "description": "Origin, true nature, and defining quirk",
          "view": {
            "features": {
              "description": true,
              "sfx": true,
              "subtraits": false
            },
            "page": 1,
            "style": {
              "header": "sfx-rows",
              "body": "sfx-rows"
            },
            "ratingScale": [
              8
            ],
            "multiDie": false,
            "notes": "",
            "reservedSlots": 3,
            "place": {
              "left": "36%",
              "top": 0,
              "width": "64%",
              "height": 1
            },
            "pillar": "prime"
          },
          "noun": "Distinction",
          "plural": "Distinctions",
          "traits": [
            {
              "name": "Your Life Before:",
              "rating": {
                "type": "Die",
                "value": [
                  8
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "traits": [
                {
                  "name": "SFX",
                  "traits": [
                    {
                      "name": "Hinder",
                      "rating": { "type": "Die", "value": [4], "range": [4] },
                      "description": "Gain a PP when you switch out your distinction's rating of d8 for a d4.",
                      "traits": []
                    },
                    {
                      "name": "Connect",
                      "description": "Spend a PP to step up an attribute when you connect to your old life.",
                      "traits": []
                    },
                    {
                      "name": "Overdrive",
                      "description": "Add d6 to the crisis pool to double your attribute die when you connect to your old life.",
                      "traits": []
                    }
                  ]
                }
              ]
            },
            {
              "name": "Your Approach/Attitude:",
              "rating": {
                "type": "Die",
                "value": [
                  8
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "traits": [
                {
                  "name": "SFX",
                  "traits": [
                    {
                      "name": "Hinder",
                      "rating": { "type": "Die", "value": [4], "range": [4] },
                      "description": "Gain a PP when you switch out your distinction's rating of d8 for a d4.",
                      "traits": []
                    },
                    {
                      "name": "True Nature",
                      "description": "Spend a PP to reroll your dice when you align with your true nature.",
                      "traits": []
                    },
                    {
                      "name": "Push Limits",
                      "description": "Add d6 to the crisis pool to step up your training package die when you align with your true nature.",
                      "traits": []
                    }
                  ]
                }
              ]
            },
            {
              "name": "Your Quirk/Quality:",
              "rating": {
                "type": "Die",
                "value": [
                  8
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "traits": [
                {
                  "name": "SFX",
                  "traits": [
                    {
                      "name": "Hinder",
                      "rating": { "type": "Die", "value": [4], "range": [4] },
                      "description": "Gain a PP when you switch out your distinction's rating of d8 for a d4.",
                      "traits": []
                    },
                    {
                      "name": "Embrace",
                      "description": "Spend a PP to double your relationship die when your assistance embraces your quirk or quality.",
                      "traits": []
                    },
                    {
                      "name": "Escalate",
                      "description": "Add d6 to the crisis pool to step up a relationship die you include in your pool when you embrace your quirk or quality.",
                      "traits": []
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "id": "relationships",
          "name": "Relationships",
          "description": "Crew bonds, debts, and troublemakers",
          "statement": true,
          "view": {
            "features": {
              "description": true,
              "sfx": false,
              "subtraits": false
            },
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
            "notes": "",
            "reservedSlots": 7,
            "place": {
              "left": "36%",
              "top": 1,
              "width": "64%",
              "height": 1
            },
            "parts": {
              "name": {
                "left": "0%",
                "top": 0,
                "width": "70%",
                "height": 1
              },
              "rating": {
                "left": "70%",
                "top": 0,
                "width": "30%",
                "height": 1
              }
            },
            "pillar": "prime"
          },
          "noun": "Relationship",
          "plural": "Relationships",
          "traits": [
            {
              "name": "",
              "description": "saved my life",
              "traits": [
                {
                  "name": "Statement",
                  "traits": [
                    {
                      "name": "saved my life",
                      "rating": {
                        "type": "Pip",
                        "value": [
                          false
                        ]
                      },
                      "traits": []
                    }
                  ]
                }
              ]
            },
            {
              "name": "",
              "description": "owes me big",
              "traits": [
                {
                  "name": "Statement",
                  "traits": [
                    {
                      "name": "owes me big",
                      "rating": {
                        "type": "Pip",
                        "value": [
                          false
                        ]
                      },
                      "traits": []
                    }
                  ]
                }
              ]
            },
            {
              "name": "",
              "description": "is a troublemaker",
              "traits": [
                {
                  "name": "Statement",
                  "traits": [
                    {
                      "name": "is a troublemaker",
                      "rating": {
                        "type": "Pip",
                        "value": [
                          false
                        ]
                      },
                      "traits": []
                    }
                  ]
                }
              ]
            },
            {
              "name": "",
              "description": "knows their stuff",
              "traits": [
                {
                  "name": "Statement",
                  "traits": [
                    {
                      "name": "knows their stuff",
                      "rating": {
                        "type": "Pip",
                        "value": [
                          false
                        ]
                      },
                      "traits": []
                    }
                  ]
                }
              ]
            },
            {
              "name": "",
              "description": "is a liability",
              "traits": [
                {
                  "name": "Statement",
                  "traits": [
                    {
                      "name": "is a liability",
                      "rating": {
                        "type": "Pip",
                        "value": [
                          false
                        ]
                      },
                      "traits": []
                    }
                  ]
                }
              ]
            },
            {
              "name": "",
              "description": "is dependable",
              "traits": [
                {
                  "name": "Statement",
                  "traits": [
                    {
                      "name": "is dependable",
                      "rating": {
                        "type": "Pip",
                        "value": [
                          false
                        ]
                      },
                      "traits": []
                    }
                  ]
                }
              ]
            },
            {
              "name": "",
              "description": "is good for a laugh",
              "traits": [
                {
                  "name": "Statement",
                  "traits": [
                    {
                      "name": "is good for a laugh",
                      "rating": {
                        "type": "Pip",
                        "value": [
                          false
                        ]
                      },
                      "traits": []
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "id": "xp",
          "name": "XP",
          "description": "Experience points bubble track",
          "view": {
            "header": "top",
            "headerAlign": "center",
            "features": {
              "description": false,
              "sfx": false,
              "subtraits": false
            },
            "page": 1,
            "style": {
              "header": "default",
              "body": "pips"
            },
            "multiDie": false,
            "notes": "",
            "reservedSlots": 0,
            "pips": {
              "perRow": 10,
              "connected": true
            },
            "place": {
              "left": "36%",
              "top": 2,
              "width": "64%",
              "height": 1
            },
            "pillar": "play"
          },
          "rating": {
            "type": "Pip",
            "value": [
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
              false
            ]
          },
          "noun": "XP",
          "plural": "XP",
          "traits": []
        },
        {
          "id": "crisis-pools",
          "name": "Crisis Pools",
          "description": "Threat clocks and escalating disaster pools",
          "view": {
            "header": "top",
            "headerAlign": "left",
            "traitColumns": 2,
            "features": {
              "description": true,
              "sfx": false,
              "subtraits": false
            },
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
            "notes": "",
            "reservedSlots": 4,
            "parts": {
              "rating": {
                "left": "0%",
                "top": 0,
                "width": "100%",
                "height": 1
              },
              "name": {
                "left": "0%",
                "top": 1,
                "width": "100%",
                "height": 1
              }
            },
            "pillar": "play"
          },
          "noun": "Crisis Pool",
          "plural": "Crisis Pools",
          "traits": []
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
    "listing": {
      "url": "https://legacy.drivethrurpg.com/product/567041/Cortex-Prime-Game-Handbook-2nd-Edition?manufacturers_id=31866"
    },
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
      "player": "",
      "portrait": {
        "url": "",
        "view": {
          "size": "spotlight",
          "location": "header"
        }
      },
      "view": {
        "pageCount": 1,
        "spotlight": "Hammerheads",
        "style": {
          "sheet": "spotlight"
        },
        "columnAlignment": "top-base",
        "columnOffsets": {
          "left": 0,
          "center": 0,
          "right": 0
        }
      },
      "traitSets": [
        {
          "id": "name",
          "name": "Name",
          "view": {
            "style": {
              "header": "default",
              "body": "name"
            },
            "page": 1
          },
          "traits": [
            {
              "name": "name",
              "label": "Name",
              "traits": []
            },
            {
              "name": "player",
              "label": "Player",
              "traits": []
            },
            {
              "name": "nickname",
              "label": "Nickname",
              "traits": []
            },
            {
              "name": "pronouns",
              "label": "Pronouns",
              "traits": []
            },
            {
              "name": "description",
              "label": "Description",
              "traits": []
            },
            {
              "name": "game",
              "label": "Game",
              "view": {
                "visibility": "hidden"
              },
              "traits": []
            },
            {
              "name": "portrait",
              "traits": []
            },
            {
              "name": "caption",
              "traits": []
            },
            {
              "name": "plotPoints",
              "rating": {
                "type": "Counter",
                "value": [
                  1
                ],
                "range": [
                  0,
                  20
                ]
              },
              "label": "PP",
              "spendable": true,
              "view": {
                "visibility": "hidden"
              },
              "traits": []
            },
            {
              "name": "notes",
              "view": {
                "visibility": "hidden"
              },
              "traits": []
            }
          ]
        },
        {
          "id": "hammerhead-attributes",
          "name": "Hammerhead Attributes",
          "description": "Rescue craft airframes, systems, and handling",
          "view": {
            "features": {
              "description": true,
              "sfx": false,
              "subtraits": true
            },
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
            "notes": "",
            "reservedSlots": 3,
            "place": {
              "left": "0%",
              "top": 0,
              "width": "25%",
              "height": 1
            },
            "pillar": "prime"
          },
          "noun": "Hammerhead Attribute",
          "plural": "Hammerhead Attributes",
          "traits": [
            {
              "name": "Hammerhead One",
              "description": "More agile, possesses more precise sensors and instruments.",
              "traits": [
                {
                  "name": "Systems",
                  "rating": {
                    "type": "Die",
                    "value": [
                      10
                    ],
                    "range": [
                      4,
                      6,
                      8,
                      10,
                      12
                    ]
                  },
                  "traits": []
                },
                {
                  "name": "Engines",
                  "rating": {
                    "type": "Die",
                    "value": [
                      8
                    ],
                    "range": [
                      4,
                      6,
                      8,
                      10,
                      12
                    ]
                  },
                  "traits": []
                },
                {
                  "name": "Frame",
                  "rating": {
                    "type": "Die",
                    "value": [
                      8
                    ],
                    "range": [
                      4,
                      6,
                      8,
                      10,
                      12
                    ]
                  },
                  "traits": []
                }
              ]
            },
            {
              "name": "Hammerhead Two",
              "description": "Faster, more power and range.",
              "traits": [
                {
                  "name": "Systems",
                  "rating": {
                    "type": "Die",
                    "value": [
                      8
                    ],
                    "range": [
                      4,
                      6,
                      8,
                      10,
                      12
                    ]
                  },
                  "traits": []
                },
                {
                  "name": "Engines",
                  "rating": {
                    "type": "Die",
                    "value": [
                      10
                    ],
                    "range": [
                      4,
                      6,
                      8,
                      10,
                      12
                    ]
                  },
                  "traits": []
                },
                {
                  "name": "Frame",
                  "rating": {
                    "type": "Die",
                    "value": [
                      8
                    ],
                    "range": [
                      4,
                      6,
                      8,
                      10,
                      12
                    ]
                  },
                  "traits": []
                }
              ]
            },
            {
              "name": "Hammerhead Three",
              "description": "Bigger, tougher, and more rugged.",
              "traits": [
                {
                  "name": "Systems",
                  "rating": {
                    "type": "Die",
                    "value": [
                      8
                    ],
                    "range": [
                      4,
                      6,
                      8,
                      10,
                      12
                    ]
                  },
                  "traits": []
                },
                {
                  "name": "Engines",
                  "rating": {
                    "type": "Die",
                    "value": [
                      8
                    ],
                    "range": [
                      4,
                      6,
                      8,
                      10,
                      12
                    ]
                  },
                  "traits": []
                },
                {
                  "name": "Frame",
                  "rating": {
                    "type": "Die",
                    "value": [
                      10
                    ],
                    "range": [
                      4,
                      6,
                      8,
                      10,
                      12
                    ]
                  },
                  "traits": []
                }
              ]
            }
          ]
        },
        {
          "id": "vehicle-distinctions",
          "name": "Vehicle Distinctions",
          "description": "Factory blessings and fleet reputation",
          "view": {
            "features": {
              "description": false,
              "sfx": false,
              "subtraits": false
            },
            "page": 1,
            "style": {
              "header": "sfx-rows",
              "body": "sfx-rows"
            },
            "ratingScale": [
              8
            ],
            "multiDie": false,
            "notes": "",
            "reservedSlots": 3,
            "sharedHinder": true,
            "sharedHinderText": "Gain a PP when you switch out your distinction's rating of d8 for a d4.",
            "place": {
              "left": "25%",
              "top": 0,
              "width": "50%",
              "height": 1
            },
            "pillar": "prime"
          },
          "noun": "Vehicle Distinction",
          "plural": "Vehicle Distinctions",
          "traits": [
            {
              "name": "Resource Support Vehicle",
              "rating": {
                "type": "Die",
                "value": [
                  8
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "traits": []
            },
            {
              "name": "Top of the Line",
              "rating": {
                "type": "Die",
                "value": [
                  8
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "traits": []
            },
            {
              "name": "Broad-Spectrum Sensors",
              "rating": {
                "type": "Die",
                "value": [
                  8
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "traits": []
            }
          ]
        },
        {
          "id": "resource-pools",
          "name": "Resource Pools",
          "description": "Staged supplies, support teams, and fleet backup",
          "view": {
            "traitColumns": 2,
            "features": {
              "description": false,
              "sfx": false,
              "subtraits": false
            },
            "page": 1,
            "style": {
              "header": "default",
              "body": "dice-count"
            },
            "ratingScale": [
              6
            ],
            "multiDie": true,
            "notes": "",
            "reservedSlots": 6,
            "place": {
              "left": "75%",
              "top": 0,
              "width": "25%",
              "height": 1
            },
            "labels": {
              "rating": "RATING",
              "dice": "/ DICE"
            },
            "pillar": "plus"
          },
          "noun": "Resource Pool",
          "plural": "Resource Pools",
          "traits": [
            {
              "name": "Unassigned Resources",
              "rating": {
                "type": "Dice",
                "value": [
                  6,
                  6,
                  6,
                  6,
                  6,
                  6,
                  6
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "spendable": true,
              "hitches": 0,
              "traits": []
            },
            {
              "name": "Tactical Support",
              "rating": {
                "type": "Dice",
                "value": [
                  6,
                  6,
                  6,
                  6
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "spendable": true,
              "hitches": 0,
              "traits": []
            },
            {
              "name": "Medical Supplies",
              "rating": {
                "type": "Dice",
                "value": [
                  6,
                  6,
                  6,
                  6
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "spendable": true,
              "hitches": 0,
              "traits": []
            },
            {
              "name": "IT/Network Support",
              "rating": {
                "type": "Dice",
                "value": [
                  6,
                  6,
                  6,
                  6
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "spendable": true,
              "hitches": 0,
              "traits": []
            },
            {
              "name": "Food/Shelter",
              "rating": {
                "type": "Dice",
                "value": [
                  6,
                  6,
                  6,
                  6
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "spendable": true,
              "hitches": 0,
              "traits": []
            },
            {
              "name": "Land/Sea/Air Support",
              "rating": {
                "type": "Dice",
                "value": [
                  6,
                  6,
                  6,
                  6
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "spendable": true,
              "hitches": 0,
              "traits": []
            }
          ]
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
    "listing": {
      "url": "https://legacy.drivethrurpg.com/product/572309/Inheritors?manufacturers_id=31866",
      "quote": "Your grandfather stopped an immortal warlord using nothing but a biplane and a stolen amulet. Your great-aunt discovered a lost civilization and barely made it out with her notes.",
      "genre": "Modern Pulp Action-Adventure",
      "setting": "d6",
      "prep": "d10",
      "complexity": "d8",
      "image": "https://legacy.drivethrurpg.com/images/31866/572309.jpg"
    },
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
      "player": "",
      "portrait": {
        "url": "",
        "view": {
          "size": "spotlight",
          "location": "header"
        }
      },
      "view": {
        "pageCount": 1,
        "spotlight": "Inheritors",
        "style": {
          "sheet": "spotlight"
        },
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
      },
      "traitSets": [
        {
          "id": "name",
          "name": "Name",
          "view": {
            "style": {
              "header": "default",
              "body": "name"
            },
            "page": 1
          },
          "traits": [
            {
              "name": "name",
              "label": "Name",
              "traits": []
            },
            {
              "name": "player",
              "label": "Player",
              "traits": []
            },
            {
              "name": "nickname",
              "label": "Nickname",
              "traits": []
            },
            {
              "name": "pronouns",
              "label": "Pronouns",
              "traits": []
            },
            {
              "name": "description",
              "label": "Description",
              "traits": []
            },
            {
              "name": "game",
              "label": "Game",
              "view": {
                "visibility": "hidden"
              },
              "traits": []
            },
            {
              "name": "portrait",
              "traits": []
            },
            {
              "name": "caption",
              "traits": []
            },
            {
              "name": "plotPoints",
              "rating": {
                "type": "Counter",
                "value": [
                  1
                ],
                "range": [
                  0,
                  20
                ]
              },
              "label": "PP",
              "spendable": true,
              "view": {
                "visibility": "hidden"
              },
              "traits": []
            },
            {
              "name": "notes",
              "view": {
                "visibility": "hidden"
              },
              "traits": []
            }
          ]
        },
        {
          "id": "attributes",
          "name": "Attributes",
          "description": "Gain a PP when you include your d4 attribute in your dice pool.",
          "view": {
            "features": {
              "description": false,
              "sfx": false,
              "subtraits": false
            },
            "page": 1,
            "style": {
              "header": "default",
              "body": "default"
            },
            "ratingScale": [
              4,
              6,
              8,
              10
            ],
            "multiDie": false,
            "notes": "",
            "reservedSlots": 4,
            "ringTrait": false,
            "place": {
              "left": "0%",
              "top": 0,
              "width": "28%",
              "height": 1
            },
            "parts": {
              "name": {
                "left": "0%",
                "top": 0,
                "width": "100%",
                "height": 1
              },
              "rating": {
                "left": "0%",
                "top": 1,
                "width": "100%",
                "height": 1
              }
            },
            "pillar": "prime"
          },
          "noun": "Attribute",
          "plural": "Attributes",
          "traits": [
            {
              "name": "Action",
              "traits": []
            },
            {
              "name": "Heritage",
              "traits": []
            },
            {
              "name": "Science",
              "traits": []
            },
            {
              "name": "Weird",
              "traits": []
            }
          ]
        },
        {
          "id": "stress",
          "name": "Stress",
          "view": {
            "header": "top",
            "headerAlign": "left",
            "features": {
              "description": false,
              "sfx": false,
              "subtraits": false
            },
            "page": 1,
            "style": {
              "header": "die-track",
              "body": "die-track"
            },
            "ratingScale": [
              4,
              6,
              8,
              10,
              12
            ],
            "reservedSlots": 1,
            "place": {
              "left": "0%",
              "top": 1,
              "width": "28%",
              "height": 1
            },
            "parts": {
              "name": {
                "left": "0%",
                "top": 0,
                "width": "100%",
                "height": 1
              },
              "rating": {
                "left": "0%",
                "top": 1,
                "width": "100%",
                "height": 1
              }
            },
            "pillar": "play"
          },
          "noun": "Stress",
          "plural": "Stress",
          "traits": []
        },
        {
          "id": "distinctions",
          "name": "Distinctions",
          "description": "Bloodline heritage, archetype, and personal stance",
          "view": {
            "features": {
              "description": true,
              "sfx": true,
              "subtraits": false
            },
            "page": 1,
            "style": {
              "header": "sfx-rows",
              "body": "sfx-rows"
            },
            "sharedHinder": true,
            "sharedHinderText": "Gain a PP when you trade out your distinction's d8 rating for a d4.",
            "ratingScale": [
              8
            ],
            "multiDie": false,
            "notes": "",
            "reservedSlots": 3,
            "place": {
              "left": "28%",
              "top": 0,
              "width": "72%",
              "height": 1
            },
            "pillar": "prime"
          },
          "noun": "Distinction",
          "plural": "Distinctions",
          "traits": [
            {
              "name": "Family Tree",
              "rating": {
                "type": "Die",
                "value": [
                  8
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "traits": [
                {
                  "name": "SFX",
                  "traits": [
                    {
                      "name": "Hinder",
                      "rating": { "type": "Die", "value": [4], "range": [4] },
                      "traits": []
                    },
                    {
                      "name": "Family Ties",
                      "description": "Spend a PP to get aid or advice from a member of your family tree in the form of a d8 asset.",
                      "traits": []
                    }
                  ]
                }
              ]
            },
            {
              "name": "Approach to Conflict",
              "rating": {
                "type": "Die",
                "value": [
                  8
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "traits": [
                {
                  "name": "SFX",
                  "traits": [
                    {
                      "name": "Hinder",
                      "rating": { "type": "Die", "value": [4], "range": [4] },
                      "traits": []
                    }
                  ]
                }
              ]
            },
            {
              "name": "Personality/Quirk",
              "rating": {
                "type": "Die",
                "value": [
                  8
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "traits": [
                {
                  "name": "SFX",
                  "traits": [
                    {
                      "name": "Hinder",
                      "rating": { "type": "Die", "value": [4], "range": [4] },
                      "traits": []
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "id": "inherited-abilities",
          "name": "Abilities",
          "description": "Powers granted by bloodline and relics",
          "view": {
            "traitColumns": 3,
            "features": {
              "description": true,
              "sfx": true,
              "subtraits": true
            },
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
            "notes": "",
            "reservedSlots": 3,
            "parts": {
              "name": {
                "left": "0%",
                "top": 0,
                "width": "100%",
                "height": 1
              },
              "rating": {
                "left": "0%",
                "top": 1,
                "width": "100%",
                "height": 1
              },
              "description": {
                "left": "0%",
                "top": 2,
                "width": "100%",
                "height": 1
              },
              "block": {
                "left": "0%",
                "top": 3,
                "width": "100%",
                "height": 1
              },
              "subtraits": {
                "left": "0%",
                "top": 4,
                "width": "100%",
                "height": 1
              }
            },
            "pillar": "plus"
          },
          "noun": "Ability",
          "plural": "Abilities",
          "traits": [
            {
              "name": "",
              "traits": [
                {
                  "name": "Effect Tags:",
                  "traits": []
                },
                {
                  "name": "Limit:",
                  "traits": []
                }
              ]
            },
            {
              "name": "",
              "traits": [
                {
                  "name": "Effect Tags:",
                  "traits": []
                },
                {
                  "name": "Limit:",
                  "traits": []
                }
              ]
            },
            {
              "name": "",
              "traits": [
                {
                  "name": "Effect Tags:",
                  "traits": []
                },
                {
                  "name": "Limit:",
                  "traits": []
                }
              ]
            }
          ]
        },
        {
          "id": "skills",
          "name": "Skills",
          "description": "Training and mundane competencies",
          "view": {
            "header": "top",
            "headerAlign": "left",
            "features": {
              "description": false,
              "sfx": false,
              "subtraits": false
            },
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
            "notes": "",
            "reservedSlots": 14,
            "place": {
              "left": "0%",
              "top": 3,
              "width": "25%",
              "height": 1
            },
            "pillar": "prime"
          },
          "noun": "Skill",
          "plural": "Skills",
          "traits": [
            {
              "name": "Acquire",
              "traits": []
            },
            {
              "name": "Build",
              "traits": []
            },
            {
              "name": "Charm",
              "traits": []
            },
            {
              "name": "Fight",
              "traits": []
            },
            {
              "name": "Investigate",
              "traits": []
            },
            {
              "name": "Move",
              "traits": []
            },
            {
              "name": "Perform",
              "traits": []
            },
            {
              "name": "Pilot",
              "traits": []
            },
            {
              "name": "Shoot",
              "traits": []
            },
            {
              "name": "Sneak",
              "traits": []
            },
            {
              "name": "Study",
              "traits": []
            },
            {
              "name": "Survive",
              "traits": []
            },
            {
              "name": "Treat",
              "traits": []
            },
            {
              "name": "Trick",
              "traits": []
            }
          ]
        },
        {
          "id": "heirlooms-milestones",
          "name": "Heirlooms",
          "description": "Item: Oh, There It Is. Spend a PP to declare that the item, if you didn't have it at the beginning of the scene, is now in your possession despite it being narratively improbable.\nVehicle: I'm Here! Spend a PP to use a vehicle to enter any scene that the vehicle can get you to.\nBase: Resourceful. Spend a PP to reveal that you have brought something useful from your base, thus allowing you to roll the heirloom in subsequent related actions.\nPet: Proxy. Spend a PP to affect a scene where you aren't physically present but your pet is. While you build your dice pool as normal, you're limited to actions your pet can perform.",
          "view": {
            "header": "top",
            "headerAlign": "left",
            "features": {
              "description": true,
              "sfx": false,
              "subtraits": false
            },
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
            "notes": "",
            "reservedSlots": 4,
            "place": {
              "left": "25%",
              "top": 3,
              "width": "50%",
              "height": 1
            },
            "pillar": "plus"
          },
          "noun": "Heirloom",
          "plural": "Heirlooms",
          "traits": []
        },
        {
          "id": "personal-milestones",
          "name": "Personal Milestones",
          "view": {
            "header": "top",
            "headerAlign": "left",
            "features": {
              "description": true,
              "sfx": false,
              "subtraits": false
            },
            "page": 1,
            "style": {
              "header": "default",
              "body": "default"
            },
            "multiDie": false,
            "ratingScale": [],
            "reservedSlots": 3,
            "place": {
              "left": "75%",
              "top": 3,
              "width": "25%",
              "height": 1
            },
            "parts": {
              "name": {
                "left": "0%",
                "top": 0,
                "width": "100%",
                "height": 1
              },
              "description": {
                "left": "0%",
                "top": 1,
                "width": "100%",
                "height": 1
              }
            },
            "pillar": "plus"
          },
          "noun": "Milestone",
          "plural": "Milestones",
          "traits": [
            {
              "name": "1 XP",
              "description": "when ",
              "traits": []
            },
            {
              "name": "3 XP",
              "description": "when ",
              "traits": []
            },
            {
              "name": "10 XP",
              "description": "when ",
              "traits": []
            }
          ]
        },
        {
          "id": "group-milestones",
          "name": "Group Milestones",
          "view": {
            "header": "top",
            "headerAlign": "left",
            "features": {
              "description": true,
              "sfx": false,
              "subtraits": false
            },
            "page": 1,
            "style": {
              "header": "default",
              "body": "default"
            },
            "multiDie": false,
            "ratingScale": [],
            "reservedSlots": 3,
            "place": {
              "left": "75%",
              "top": 4,
              "width": "25%",
              "height": 1
            },
            "parts": {
              "name": {
                "left": "0%",
                "top": 0,
                "width": "100%",
                "height": 1
              },
              "description": {
                "left": "0%",
                "top": 1,
                "width": "100%",
                "height": 1
              }
            },
            "pillar": "plus"
          },
          "noun": "Milestone",
          "plural": "Milestones",
          "traits": [
            {
              "name": "1 XP",
              "description": "when ",
              "traits": []
            },
            {
              "name": "3 XP",
              "description": "when ",
              "traits": []
            },
            {
              "name": "10 XP",
              "description": "when ",
              "traits": []
            }
          ]
        },
        {
          "id": "xp",
          "name": "XP",
          "view": {
            "features": {
              "description": false,
              "sfx": false,
              "subtraits": false
            },
            "page": 1,
            "style": {
              "header": "default",
              "body": "pips"
            },
            "pips": {
              "perRow": 5,
              "connected": true
            },
            "place": {
              "left": "75%",
              "top": 5,
              "width": "25%",
              "height": 1
            },
            "pillar": "play"
          },
          "rating": {
            "type": "Pip",
            "value": [
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
              false
            ]
          },
          "noun": "Pip",
          "plural": "Pips",
          "traits": []
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
    "listing": {
      "url": "https://legacy.drivethrurpg.com/product/572309/Inheritors?manufacturers_id=31866",
      "quote": "Your grandfather stopped an immortal warlord using nothing but a biplane and a stolen amulet. Your great-aunt discovered a lost civilization and barely made it out with her notes.",
      "genre": "Modern Pulp Action-Adventure",
      "setting": "d6",
      "prep": "d10",
      "complexity": "d8",
      "image": "https://legacy.drivethrurpg.com/images/31866/572309.jpg"
    },
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
      "player": "",
      "portrait": {
        "url": "",
        "view": {
          "size": "spotlight",
          "location": "header"
        }
      },
      "view": {
        "pageCount": 2,
        "spotlight": "Inheritors",
        "style": {
          "sheet": "spotlight"
        },
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
      },
      "traitSets": [
        {
          "id": "name",
          "name": "Name",
          "view": {
            "style": {
              "header": "default",
              "body": "name"
            },
            "page": 1
          },
          "traits": [
            {
              "name": "name",
              "label": "Name",
              "traits": []
            },
            {
              "name": "player",
              "label": "Player",
              "traits": []
            },
            {
              "name": "nickname",
              "label": "Nickname",
              "traits": []
            },
            {
              "name": "pronouns",
              "label": "Pronouns",
              "traits": []
            },
            {
              "name": "description",
              "label": "Description",
              "traits": []
            },
            {
              "name": "game",
              "label": "Game",
              "view": {
                "visibility": "hidden"
              },
              "traits": []
            },
            {
              "name": "portrait",
              "traits": []
            },
            {
              "name": "caption",
              "traits": []
            },
            {
              "name": "plotPoints",
              "rating": {
                "type": "Counter",
                "value": [
                  1
                ],
                "range": [
                  0,
                  20
                ]
              },
              "label": "PP",
              "spendable": true,
              "view": {
                "visibility": "hidden"
              },
              "traits": []
            },
            {
              "name": "notes",
              "view": {
                "visibility": "hidden"
              },
              "traits": []
            }
          ]
        },
        {
          "id": "your-generation",
          "name": "Your Generation",
          "view": {
            "header": "top",
            "headerAlign": "left",
            "features": {
              "description": true,
              "sfx": false,
              "subtraits": false
            },
            "page": 1,
            "style": {
              "header": "labeled-fields",
              "body": "labeled-fields"
            },
            "pillar": "plus"
          },
          "noun": "Detail",
          "plural": "Details",
          "traits": [
            {
              "name": "Name",
              "traits": []
            },
            {
              "name": "Description",
              "traits": []
            },
            {
              "name": "Fame",
              "traits": []
            },
            {
              "name": "Features",
              "traits": []
            },
            {
              "name": "Deed",
              "traits": []
            },
            {
              "name": "Current Fate",
              "traits": []
            }
          ]
        },
        {
          "id": "parents-generation-a",
          "name": "Parents' Generation",
          "view": {
            "header": "top",
            "headerAlign": "left",
            "features": {
              "description": true,
              "sfx": false,
              "subtraits": false
            },
            "page": 1,
            "style": {
              "header": "labeled-fields",
              "body": "labeled-fields"
            },
            "place": {
              "left": "0%",
              "top": 1,
              "width": "50%",
              "height": 1
            },
            "pillar": "plus"
          },
          "noun": "Detail",
          "plural": "Details",
          "traits": [
            {
              "name": "Name",
              "traits": []
            },
            {
              "name": "Description",
              "traits": []
            },
            {
              "name": "Fame",
              "traits": []
            },
            {
              "name": "Features",
              "traits": []
            },
            {
              "name": "Deed",
              "traits": []
            },
            {
              "name": "Current Fate",
              "traits": []
            }
          ]
        },
        {
          "id": "parents-generation-b",
          "name": "Parents' Generation",
          "view": {
            "header": "top",
            "headerAlign": "left",
            "features": {
              "description": true,
              "sfx": false,
              "subtraits": false
            },
            "page": 1,
            "style": {
              "header": "labeled-fields",
              "body": "labeled-fields"
            },
            "place": {
              "left": "50%",
              "top": 1,
              "width": "50%",
              "height": 1
            },
            "pillar": "plus"
          },
          "noun": "Detail",
          "plural": "Details",
          "traits": [
            {
              "name": "Name",
              "traits": []
            },
            {
              "name": "Description",
              "traits": []
            },
            {
              "name": "Fame",
              "traits": []
            },
            {
              "name": "Features",
              "traits": []
            },
            {
              "name": "Deed",
              "traits": []
            },
            {
              "name": "Current Fate",
              "traits": []
            }
          ]
        },
        {
          "id": "grandparents-generation-a",
          "name": "Grandparents' Generation",
          "view": {
            "header": "top",
            "headerAlign": "left",
            "features": {
              "description": true,
              "sfx": false,
              "subtraits": false
            },
            "page": 1,
            "style": {
              "header": "labeled-fields",
              "body": "labeled-fields"
            },
            "place": {
              "left": "0%",
              "top": 2,
              "width": "50%",
              "height": 1
            },
            "pillar": "plus"
          },
          "noun": "Detail",
          "plural": "Details",
          "traits": [
            {
              "name": "Name",
              "traits": []
            },
            {
              "name": "Description",
              "traits": []
            },
            {
              "name": "Fame",
              "traits": []
            },
            {
              "name": "Features",
              "traits": []
            },
            {
              "name": "Deed",
              "traits": []
            },
            {
              "name": "Current Fate",
              "traits": []
            }
          ]
        },
        {
          "id": "grandparents-generation-b",
          "name": "Grandparents' Generation",
          "view": {
            "header": "top",
            "headerAlign": "left",
            "features": {
              "description": true,
              "sfx": false,
              "subtraits": false
            },
            "page": 1,
            "style": {
              "header": "labeled-fields",
              "body": "labeled-fields"
            },
            "place": {
              "left": "50%",
              "top": 2,
              "width": "50%",
              "height": 1
            },
            "pillar": "plus"
          },
          "noun": "Detail",
          "plural": "Details",
          "traits": [
            {
              "name": "Name",
              "traits": []
            },
            {
              "name": "Description",
              "traits": []
            },
            {
              "name": "Fame",
              "traits": []
            },
            {
              "name": "Features",
              "traits": []
            },
            {
              "name": "Deed",
              "traits": []
            },
            {
              "name": "Current Fate",
              "traits": []
            }
          ]
        },
        {
          "id": "wild-card-a",
          "name": "Wild Card Branch",
          "view": {
            "header": "top",
            "headerAlign": "left",
            "features": {
              "description": true,
              "sfx": false,
              "subtraits": false
            },
            "page": 1,
            "style": {
              "header": "labeled-fields",
              "body": "labeled-fields"
            },
            "pillar": "plus"
          },
          "noun": "Detail",
          "plural": "Details",
          "traits": [
            {
              "name": "Name",
              "traits": []
            },
            {
              "name": "Description",
              "traits": []
            },
            {
              "name": "Fame",
              "traits": []
            },
            {
              "name": "Features",
              "traits": []
            },
            {
              "name": "Deed",
              "traits": []
            },
            {
              "name": "Current Fate",
              "traits": []
            }
          ]
        },
        {
          "id": "wild-card-b",
          "name": "Wild Card Branch",
          "view": {
            "header": "top",
            "headerAlign": "left",
            "features": {
              "description": true,
              "sfx": false,
              "subtraits": false
            },
            "page": 1,
            "style": {
              "header": "labeled-fields",
              "body": "labeled-fields"
            },
            "place": {
              "left": "0%",
              "top": 4,
              "width": "50%",
              "height": 1
            },
            "pillar": "plus"
          },
          "noun": "Detail",
          "plural": "Details",
          "traits": [
            {
              "name": "Name",
              "traits": []
            },
            {
              "name": "Description",
              "traits": []
            },
            {
              "name": "Fame",
              "traits": []
            },
            {
              "name": "Features",
              "traits": []
            },
            {
              "name": "Deed",
              "traits": []
            },
            {
              "name": "Current Fate",
              "traits": []
            }
          ]
        },
        {
          "id": "wild-card-c",
          "name": "Wild Card Branch",
          "view": {
            "header": "top",
            "headerAlign": "left",
            "features": {
              "description": true,
              "sfx": false,
              "subtraits": false
            },
            "page": 1,
            "style": {
              "header": "labeled-fields",
              "body": "labeled-fields"
            },
            "place": {
              "left": "50%",
              "top": 4,
              "width": "50%",
              "height": 1
            },
            "pillar": "plus"
          },
          "noun": "Detail",
          "plural": "Details",
          "traits": [
            {
              "name": "Name",
              "traits": []
            },
            {
              "name": "Description",
              "traits": []
            },
            {
              "name": "Fame",
              "traits": []
            },
            {
              "name": "Features",
              "traits": []
            },
            {
              "name": "Deed",
              "traits": []
            },
            {
              "name": "Current Fate",
              "traits": []
            }
          ]
        },
        {
          "id": "wild-card-d",
          "name": "Wild Card Branch",
          "view": {
            "header": "top",
            "headerAlign": "left",
            "features": {
              "description": true,
              "sfx": false,
              "subtraits": false
            },
            "page": 1,
            "style": {
              "header": "labeled-fields",
              "body": "labeled-fields"
            },
            "place": {
              "left": "0%",
              "top": 5,
              "width": "50%",
              "height": 1
            },
            "pillar": "plus"
          },
          "noun": "Detail",
          "plural": "Details",
          "traits": [
            {
              "name": "Name",
              "traits": []
            },
            {
              "name": "Description",
              "traits": []
            },
            {
              "name": "Fame",
              "traits": []
            },
            {
              "name": "Features",
              "traits": []
            },
            {
              "name": "Deed",
              "traits": []
            },
            {
              "name": "Current Fate",
              "traits": []
            }
          ]
        },
        {
          "id": "wild-card-e",
          "name": "Wild Card Branch",
          "view": {
            "header": "top",
            "headerAlign": "left",
            "features": {
              "description": true,
              "sfx": false,
              "subtraits": false
            },
            "page": 1,
            "style": {
              "header": "labeled-fields",
              "body": "labeled-fields"
            },
            "place": {
              "left": "50%",
              "top": 5,
              "width": "50%",
              "height": 1
            },
            "pillar": "plus"
          },
          "noun": "Detail",
          "plural": "Details",
          "traits": [
            {
              "name": "Name",
              "traits": []
            },
            {
              "name": "Description",
              "traits": []
            },
            {
              "name": "Fame",
              "traits": []
            },
            {
              "name": "Features",
              "traits": []
            },
            {
              "name": "Deed",
              "traits": []
            },
            {
              "name": "Current Fate",
              "traits": []
            }
          ]
        },
        {
          "id": "gmc-a",
          "name": "GMC",
          "view": {
            "header": "top",
            "headerAlign": "left",
            "features": {
              "description": true,
              "sfx": false,
              "subtraits": false
            },
            "page": 2,
            "style": {
              "header": "labeled-fields",
              "body": "labeled-fields"
            },
            "place": {
              "left": "0%",
              "top": 0,
              "width": "50%",
              "height": 1
            },
            "pillar": "plus"
          },
          "noun": "Detail",
          "plural": "Details",
          "traits": [
            {
              "name": "Name",
              "traits": []
            },
            {
              "name": "Relationship to PCs",
              "traits": []
            },
            {
              "name": "Relationship to GMCs",
              "traits": []
            },
            {
              "name": "Description",
              "traits": []
            },
            {
              "name": "Fame",
              "traits": []
            },
            {
              "name": "Features",
              "traits": []
            },
            {
              "name": "Deed",
              "traits": []
            },
            {
              "name": "Current Fate",
              "traits": []
            }
          ]
        },
        {
          "id": "gmc-b",
          "name": "GMC",
          "view": {
            "header": "top",
            "headerAlign": "left",
            "features": {
              "description": true,
              "sfx": false,
              "subtraits": false
            },
            "page": 2,
            "style": {
              "header": "labeled-fields",
              "body": "labeled-fields"
            },
            "place": {
              "left": "50%",
              "top": 0,
              "width": "50%",
              "height": 1
            },
            "pillar": "plus"
          },
          "noun": "Detail",
          "plural": "Details",
          "traits": [
            {
              "name": "Name",
              "traits": []
            },
            {
              "name": "Relationship to PCs",
              "traits": []
            },
            {
              "name": "Relationship to GMCs",
              "traits": []
            },
            {
              "name": "Description",
              "traits": []
            },
            {
              "name": "Fame",
              "traits": []
            },
            {
              "name": "Features",
              "traits": []
            },
            {
              "name": "Deed",
              "traits": []
            },
            {
              "name": "Current Fate",
              "traits": []
            }
          ]
        },
        {
          "id": "gmc-c",
          "name": "GMC",
          "view": {
            "header": "top",
            "headerAlign": "left",
            "features": {
              "description": true,
              "sfx": false,
              "subtraits": false
            },
            "page": 2,
            "style": {
              "header": "labeled-fields",
              "body": "labeled-fields"
            },
            "place": {
              "left": "0%",
              "top": 1,
              "width": "50%",
              "height": 1
            },
            "pillar": "plus"
          },
          "noun": "Detail",
          "plural": "Details",
          "traits": [
            {
              "name": "Name",
              "traits": []
            },
            {
              "name": "Relationship to PCs",
              "traits": []
            },
            {
              "name": "Relationship to GMCs",
              "traits": []
            },
            {
              "name": "Description",
              "traits": []
            },
            {
              "name": "Fame",
              "traits": []
            },
            {
              "name": "Features",
              "traits": []
            },
            {
              "name": "Deed",
              "traits": []
            },
            {
              "name": "Current Fate",
              "traits": []
            }
          ]
        },
        {
          "id": "gmc-d",
          "name": "GMC",
          "view": {
            "header": "top",
            "headerAlign": "left",
            "features": {
              "description": true,
              "sfx": false,
              "subtraits": false
            },
            "page": 2,
            "style": {
              "header": "labeled-fields",
              "body": "labeled-fields"
            },
            "place": {
              "left": "50%",
              "top": 1,
              "width": "50%",
              "height": 1
            },
            "pillar": "plus"
          },
          "noun": "Detail",
          "plural": "Details",
          "traits": [
            {
              "name": "Name",
              "traits": []
            },
            {
              "name": "Relationship to PCs",
              "traits": []
            },
            {
              "name": "Relationship to GMCs",
              "traits": []
            },
            {
              "name": "Description",
              "traits": []
            },
            {
              "name": "Fame",
              "traits": []
            },
            {
              "name": "Features",
              "traits": []
            },
            {
              "name": "Deed",
              "traits": []
            },
            {
              "name": "Current Fate",
              "traits": []
            }
          ]
        },
        {
          "id": "gmc-e",
          "name": "GMC",
          "view": {
            "header": "top",
            "headerAlign": "left",
            "features": {
              "description": true,
              "sfx": false,
              "subtraits": false
            },
            "page": 2,
            "style": {
              "header": "labeled-fields",
              "body": "labeled-fields"
            },
            "place": {
              "left": "0%",
              "top": 2,
              "width": "50%",
              "height": 1
            },
            "pillar": "plus"
          },
          "noun": "Detail",
          "plural": "Details",
          "traits": [
            {
              "name": "Name",
              "traits": []
            },
            {
              "name": "Relationship to PCs",
              "traits": []
            },
            {
              "name": "Relationship to GMCs",
              "traits": []
            },
            {
              "name": "Description",
              "traits": []
            },
            {
              "name": "Fame",
              "traits": []
            },
            {
              "name": "Features",
              "traits": []
            },
            {
              "name": "Deed",
              "traits": []
            },
            {
              "name": "Current Fate",
              "traits": []
            }
          ]
        },
        {
          "id": "gmc-f",
          "name": "GMC",
          "view": {
            "header": "top",
            "headerAlign": "left",
            "features": {
              "description": true,
              "sfx": false,
              "subtraits": false
            },
            "page": 2,
            "style": {
              "header": "labeled-fields",
              "body": "labeled-fields"
            },
            "place": {
              "left": "50%",
              "top": 2,
              "width": "50%",
              "height": 1
            },
            "pillar": "plus"
          },
          "noun": "Detail",
          "plural": "Details",
          "traits": [
            {
              "name": "Name",
              "traits": []
            },
            {
              "name": "Relationship to PCs",
              "traits": []
            },
            {
              "name": "Relationship to GMCs",
              "traits": []
            },
            {
              "name": "Description",
              "traits": []
            },
            {
              "name": "Fame",
              "traits": []
            },
            {
              "name": "Features",
              "traits": []
            },
            {
              "name": "Deed",
              "traits": []
            },
            {
              "name": "Current Fate",
              "traits": []
            }
          ]
        }
      ]
    }
  },
  {
    "id": "spotlight-kitbash-hero",
    "version": 1,
    "title": "Kit Bash!",
    "subtitle": "Modular Comic Book Superheroes",
    "spotlight": "Kit Bash!",
    "variant": "Hero File",
    "pages": 1,
    "genre": "Comic Book / Superhero",
    "listing": {
      "url": "https://legacy.drivethrurpg.com/product/568416/Kit-Bash?manufacturers_id=31866",
      "quote": "You want to run a superhero campaign, but you’re sick of starting with someone else’s universe. What if the table built the world together, from scratch, before the first punch is thrown?",
      "genre": "Superhero",
      "setting": "d6",
      "prep": "d12",
      "complexity": "d8",
      "image": "https://legacy.drivethrurpg.com/images/31866/568416.jpg"
    },
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
      "player": "",
      "portrait": {
        "url": "",
        "view": {
          "size": "spotlight",
          "location": "header"
        }
      },
      "view": {
        "pageCount": 1,
        "spotlight": "KitBash",
        "style": {
          "sheet": "spotlight"
        },
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
      },
      "traitSets": [
        {
          "id": "name",
          "name": "Name",
          "view": {
            "style": {
              "header": "default",
              "body": "name"
            },
            "page": 1
          },
          "traits": [
            {
              "name": "name",
              "label": "Name",
              "traits": []
            },
            {
              "name": "player",
              "label": "Player",
              "traits": []
            },
            {
              "name": "nickname",
              "label": "Nickname",
              "traits": []
            },
            {
              "name": "pronouns",
              "label": "Pronouns",
              "traits": []
            },
            {
              "name": "description",
              "label": "Description",
              "traits": []
            },
            {
              "name": "game",
              "label": "Game",
              "view": {
                "visibility": "hidden"
              },
              "traits": []
            },
            {
              "name": "portrait",
              "traits": []
            },
            {
              "name": "caption",
              "traits": []
            },
            {
              "name": "plotPoints",
              "rating": {
                "type": "Counter",
                "value": [
                  1
                ],
                "range": [
                  0,
                  20
                ]
              },
              "label": "PP",
              "spendable": true,
              "view": {
                "visibility": "hidden"
              },
              "traits": []
            },
            {
              "name": "notes",
              "view": {
                "visibility": "hidden"
              },
              "traits": []
            }
          ]
        },
        {
          "id": "distinctions",
          "name": "Distinctions",
          "description": "Origin, motivation, and crime-fighting persona",
          "view": {
            "header": "top",
            "headerAlign": "left",
            "features": {
              "description": true,
              "sfx": false,
              "subtraits": false
            },
            "sharedHinder": true,
            "sharedHinderText": "Gain a PP when you trade out your distinction's d8 rating for a d4.",
            "page": 1,
            "style": {
              "header": "sfx-rows",
              "body": "sfx-rows"
            },
            "ratingScale": [
              8
            ],
            "multiDie": false,
            "notes": "",
            "reservedSlots": 3,
            "place": {
              "left": "0%",
              "top": 0,
              "width": "33.333%",
              "height": 1
            },
            "pillar": "prime"
          },
          "noun": "Distinction",
          "plural": "Distinctions",
          "traits": [
            {
              "name": "Personality:",
              "rating": {
                "type": "Die",
                "value": [
                  8
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "traits": [
                {
                  "name": "SFX",
                  "traits": [
                    {
                      "name": "Hinder",
                      "rating": { "type": "Die", "value": [4], "range": [4] },
                      "traits": []
                    }
                  ]
                }
              ]
            },
            {
              "name": "Past:",
              "rating": {
                "type": "Die",
                "value": [
                  8
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "traits": [
                {
                  "name": "SFX",
                  "traits": [
                    {
                      "name": "Hinder",
                      "rating": { "type": "Die", "value": [4], "range": [4] },
                      "traits": []
                    }
                  ]
                }
              ]
            },
            {
              "name": "Quirk:",
              "rating": {
                "type": "Die",
                "value": [
                  8
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "traits": [
                {
                  "name": "SFX",
                  "traits": [
                    {
                      "name": "Hinder",
                      "rating": { "type": "Die", "value": [4], "range": [4] },
                      "traits": []
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "id": "affiliations",
          "name": "Affiliations",
          "description": "Operating mode ratings",
          "view": {
            "header": "top",
            "headerAlign": "left",
            "features": {
              "description": false,
              "sfx": false,
              "subtraits": false
            },
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
            "multiDie": false,
            "notes": "",
            "reservedSlots": 3,
            "place": {
              "left": "33.333%",
              "top": 0,
              "width": "33.333%",
              "height": 1
            },
            "parts": {
              "name": {
                "left": "0%",
                "top": 0,
                "width": "100%",
                "height": 1
              },
              "rating": {
                "left": "0%",
                "top": 1,
                "width": "100%",
                "height": 1
              }
            },
            "pillar": "prime"
          },
          "noun": "Affiliation",
          "plural": "Affiliations",
          "traits": [
            {
              "name": "Personal:",
              "traits": []
            },
            {
              "name": "Group:",
              "traits": []
            },
            {
              "name": "World:",
              "traits": []
            }
          ]
        },
        {
          "id": "specialties",
          "name": "Specialties",
          "description": "Master and expert professional skills",
          "view": {
            "header": "top",
            "headerAlign": "left",
            "features": {
              "description": false,
              "sfx": false,
              "subtraits": false
            },
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
            "notes": "",
            "reservedSlots": 5,
            "place": {
              "left": "66.666%",
              "top": 0,
              "width": "33.334%",
              "height": 1
            },
            "pillar": "prime"
          },
          "noun": "Specialty",
          "plural": "Specialties",
          "traits": []
        },
        {
          "id": "signature-assets",
          "name": "Signature Assets",
          "description": "Heroic gear and vehicles",
          "view": {
            "header": "top",
            "headerAlign": "left",
            "features": {
              "description": false,
              "sfx": false,
              "subtraits": false
            },
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
            "notes": "",
            "reservedSlots": 3,
            "place": {
              "left": "0%",
              "top": 1,
              "width": "33.333%",
              "height": 1
            },
            "pillar": "plus"
          },
          "noun": "Signature Asset",
          "plural": "Signature Assets",
          "traits": []
        },
        {
          "id": "stress",
          "name": "Stress",
          "view": {
            "header": "top",
            "headerAlign": "left",
            "features": {
              "description": false,
              "sfx": false,
              "subtraits": false
            },
            "page": 1,
            "style": {
              "header": "die-track",
              "body": "die-track"
            },
            "ratingScale": [
              4,
              6,
              8,
              10,
              12
            ],
            "reservedSlots": 3,
            "place": {
              "left": "33.333%",
              "top": 1,
              "width": "33.333%",
              "height": 1
            },
            "parts": {
              "name": {
                "left": "0%",
                "top": 0,
                "width": "100%",
                "height": 1
              },
              "rating": {
                "left": "0%",
                "top": 1,
                "width": "100%",
                "height": 1
              }
            },
            "pillar": "play"
          },
          "noun": "Stress",
          "plural": "Stress",
          "traits": [
            {
              "name": "Physical",
              "traits": []
            },
            {
              "name": "Mental",
              "traits": []
            },
            {
              "name": "Social",
              "traits": []
            }
          ]
        },
        {
          "id": "growth-pool",
          "name": "Growth Pool",
          "view": {
            "header": "top",
            "headerAlign": "left",
            "features": {
              "description": false,
              "sfx": false,
              "subtraits": false
            },
            "page": 1,
            "style": {
              "header": "default",
              "body": "dice-count"
            },
            "ratingScale": [
              4,
              6,
              8,
              10,
              12
            ],
            "multiDie": true,
            "reservedSlots": 5,
            "place": {
              "left": "66.666%",
              "top": 1,
              "width": "33.334%",
              "height": 1
            },
            "labels": {
              "rating": "RATING",
              "dice": "/ DICE"
            },
            "pillar": "play"
          },
          "pool": true,
          "noun": "Growth Die",
          "plural": "Growth Dice",
          "traits": [
            {
              "name": "D4",
              "rating": {
                "type": "Die",
                "value": [
                  4
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "spendable": true,
              "hitches": 0,
              "view": {
                "poolCount": 1
              },
              "traits": []
            },
            {
              "name": "D6",
              "rating": {
                "type": "Die",
                "value": [
                  6
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "spendable": true,
              "hitches": 0,
              "view": {
                "poolCount": 1
              },
              "traits": []
            },
            {
              "name": "D8",
              "rating": {
                "type": "Die",
                "value": [
                  8
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "spendable": true,
              "hitches": 0,
              "view": {
                "poolCount": 1
              },
              "traits": []
            },
            {
              "name": "D10",
              "rating": {
                "type": "Die",
                "value": [
                  10
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "spendable": true,
              "hitches": 0,
              "view": {
                "poolCount": 1
              },
              "traits": []
            },
            {
              "name": "D12",
              "rating": {
                "type": "Die",
                "value": [
                  12
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "spendable": true,
              "hitches": 0,
              "view": {
                "poolCount": 1
              },
              "traits": []
            }
          ]
        },
        {
          "id": "power-set",
          "name": "Power Set 1",
          "description": "Modular powers, SFX triggers, and shutdown limits",
          "view": {
            "header": "top",
            "headerAlign": "left",
            "traitColumns": 2,
            "features": {
              "description": true,
              "sfx": false,
              "subtraits": false
            },
            "page": 1,
            "style": {
              "header": "labeled-fields",
              "body": "labeled-fields"
            },
            "multiDie": false,
            "notes": "",
            "reservedSlots": 3,
            "pillar": "plus"
          },
          "noun": "Power Set",
          "plural": "Power Sets",
          "traits": [
            {
              "name": "Powers",
              "traits": []
            },
            {
              "name": "Limits",
              "traits": []
            }
          ]
        },
        {
          "id": "power-set-2",
          "name": "Power Set 2",
          "view": {
            "header": "top",
            "headerAlign": "left",
            "traitColumns": 2,
            "features": {
              "description": true,
              "sfx": false,
              "subtraits": false
            },
            "page": 1,
            "style": {
              "header": "labeled-fields",
              "body": "labeled-fields"
            },
            "pillar": "plus"
          },
          "noun": "Power",
          "plural": "Powers",
          "traits": [
            {
              "name": "Powers",
              "traits": []
            },
            {
              "name": "Limits",
              "traits": []
            }
          ]
        },
        {
          "id": "power-set-3",
          "name": "Power Set 3",
          "view": {
            "header": "top",
            "headerAlign": "left",
            "traitColumns": 2,
            "features": {
              "description": true,
              "sfx": false,
              "subtraits": false
            },
            "page": 1,
            "style": {
              "header": "labeled-fields",
              "body": "labeled-fields"
            },
            "pillar": "plus"
          },
          "noun": "Power",
          "plural": "Powers",
          "traits": [
            {
              "name": "Powers",
              "traits": []
            },
            {
              "name": "Limits",
              "traits": []
            }
          ]
        }
      ]
    }
  },
  {
    "id": "spotlight-kitbash-team",
    "version": 1,
    "title": "Kit Bash! - Team File",
    "subtitle": "Modular Comic Book Superheroes",
    "spotlight": "Kit Bash!",
    "variant": "Team Roster File",
    "pages": 1,
    "genre": "Comic Book / Superhero",
    "listing": {
      "url": "https://legacy.drivethrurpg.com/product/568416/Kit-Bash?manufacturers_id=31866",
      "quote": "You want to run a superhero campaign, but you’re sick of starting with someone else’s universe. What if the table built the world together, from scratch, before the first punch is thrown?",
      "genre": "Superhero",
      "setting": "d6",
      "prep": "d12",
      "complexity": "d8",
      "image": "https://legacy.drivethrurpg.com/images/31866/568416.jpg"
    },
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
      "player": "",
      "portrait": {
        "url": "",
        "view": {
          "size": "spotlight",
          "location": "header"
        }
      },
      "view": {
        "pageCount": 1,
        "spotlight": "KitBash",
        "style": {
          "sheet": "spotlight"
        },
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
      },
      "traitSets": [
        {
          "id": "name",
          "name": "Name",
          "view": {
            "style": {
              "header": "default",
              "body": "name"
            },
            "page": 1
          },
          "traits": [
            {
              "name": "name",
              "label": "Name",
              "traits": []
            },
            {
              "name": "player",
              "label": "Player",
              "traits": []
            },
            {
              "name": "nickname",
              "label": "Nickname",
              "traits": []
            },
            {
              "name": "pronouns",
              "label": "Pronouns",
              "traits": []
            },
            {
              "name": "description",
              "label": "Description",
              "traits": []
            },
            {
              "name": "game",
              "label": "Game",
              "view": {
                "visibility": "hidden"
              },
              "traits": []
            },
            {
              "name": "portrait",
              "traits": []
            },
            {
              "name": "caption",
              "traits": []
            },
            {
              "name": "plotPoints",
              "rating": {
                "type": "Counter",
                "value": [
                  1
                ],
                "range": [
                  0,
                  20
                ]
              },
              "label": "PP",
              "spendable": true,
              "view": {
                "visibility": "hidden"
              },
              "traits": []
            },
            {
              "name": "notes",
              "view": {
                "visibility": "hidden"
              },
              "traits": []
            }
          ]
        },
        {
          "id": "team-base",
          "name": "Team Base",
          "description": "As a group, decide on the following information.",
          "view": {
            "header": "top",
            "headerAlign": "left",
            "features": {
              "description": true,
              "sfx": false,
              "subtraits": false
            },
            "page": 1,
            "style": {
              "header": "labeled-fields",
              "body": "labeled-fields"
            },
            "pillar": "plus"
          },
          "noun": "Detail",
          "plural": "Details",
          "traits": [
            {
              "name": "Name",
              "traits": []
            },
            {
              "name": "Location",
              "traits": []
            },
            {
              "name": "Description",
              "traits": []
            },
            {
              "name": "Benefits",
              "traits": []
            },
            {
              "name": "Drawbacks",
              "traits": []
            }
          ]
        },
        {
          "id": "team-resources",
          "name": "Team Resources",
          "view": {
            "header": "top",
            "headerAlign": "left",
            "traitColumns": 2,
            "features": {
              "description": true,
              "sfx": false,
              "subtraits": false
            },
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
            "reservedSlots": 20,
            "labels": {
              "rating": "RATING",
              "dice": "/ DICE"
            },
            "pillar": "plus"
          },
          "noun": "Resource",
          "plural": "Resources",
          "traits": []
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
    "listing": {
      "url": "https://legacy.drivethrurpg.com/product/568414/Misty-Cove?manufacturers_id=31866",
      "quote": "The town knows you’re different. They always have.",
      "genre": "Small-town supernatural drama",
      "setting": "d6",
      "prep": "d6",
      "complexity": "d8",
      "image": "https://legacy.drivethrurpg.com/images/31866/568414.jpg"
    },
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
      "player": "",
      "portrait": {
        "url": "",
        "view": {
          "size": "spotlight",
          "location": "header"
        }
      },
      "view": {
        "pageCount": 1,
        "spotlight": "Misty Cove",
        "style": {
          "sheet": "spotlight"
        },
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
      },
      "traitSets": [
        {
          "id": "name",
          "name": "Name",
          "view": {
            "style": {
              "header": "default",
              "body": "name"
            },
            "page": 1
          },
          "traits": [
            {
              "name": "name",
              "label": "Name",
              "traits": []
            },
            {
              "name": "player",
              "label": "Player",
              "traits": []
            },
            {
              "name": "nickname",
              "label": "Nickname",
              "traits": []
            },
            {
              "name": "pronouns",
              "label": "Pronouns",
              "traits": []
            },
            {
              "name": "description",
              "label": "Description",
              "traits": []
            },
            {
              "name": "game",
              "label": "Game",
              "view": {
                "visibility": "hidden"
              },
              "traits": []
            },
            {
              "name": "portrait",
              "traits": []
            },
            {
              "name": "caption",
              "traits": []
            },
            {
              "name": "plotPoints",
              "rating": {
                "type": "Counter",
                "value": [
                  1
                ],
                "range": [
                  0,
                  20
                ]
              },
              "label": "PP",
              "spendable": true,
              "view": {
                "visibility": "hidden"
              },
              "traits": []
            },
            {
              "name": "notes",
              "view": {
                "visibility": "hidden"
              },
              "traits": []
            }
          ]
        },
        {
          "id": "distinctions",
          "name": "Distinctions",
          "description": "Coastal heritage, town role, and personal quirk",
          "view": {
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
            "page": 1,
            "style": {
              "header": "sfx-rows",
              "body": "sfx-rows"
            },
            "multiDie": false,
            "notes": "",
            "reservedSlots": 3,
            "place": {
              "left": "0%",
              "top": 0,
              "width": "64%",
              "height": 1
            },
            "pillar": "prime"
          },
          "noun": "Distinction",
          "plural": "Distinctions",
          "traits": [
            {
              "name": "Extraordinary:",
              "traits": [
                {
                  "name": "SFX",
                  "traits": [
                    {
                      "name": "Hinder",
                      "rating": { "type": "Die", "value": [4], "range": [4] },
                      "traits": []
                    }
                  ]
                }
              ]
            },
            {
              "name": "Backstory:",
              "traits": []
            },
            {
              "name": "Role:",
              "traits": []
            }
          ]
        },
        {
          "id": "signature-assets-curios",
          "name": "Signature Assets",
          "description": "Heirlooms and keepsakes from the misty coast",
          "view": {
            "features": {
              "description": true,
              "sfx": false,
              "subtraits": false
            },
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
            "notes": "",
            "reservedSlots": 3,
            "place": {
              "left": "64%",
              "top": 0,
              "width": "36%",
              "height": 1
            },
            "parts": {
              "rating": {
                "left": "0%",
                "top": 0,
                "width": "100%",
                "height": 1
              },
              "name": {
                "left": "0%",
                "top": 1,
                "width": "100%",
                "height": 1
              }
            },
            "pillar": "plus"
          },
          "noun": "Signature Asset",
          "plural": "Signature Assets",
          "traits": []
        },
        {
          "id": "emotional-attributes-stress",
          "name": "Attributes",
          "description": "Core emotional drives with corresponding statements and stress",
          "statement": true,
          "view": {
            "features": {
              "description": true,
              "sfx": false,
              "subtraits": false
            },
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
            "notes": "",
            "reservedSlots": 5,
            "ringTrait": false,
            "parts": {
              "name": {
                "left": "0%",
                "top": 0,
                "width": "30%",
                "height": 1
              },
              "rating": {
                "left": "30%",
                "top": 0,
                "width": "30%",
                "height": 1
              },
              "trackLabel": {
                "left": "60%",
                "top": 0,
                "width": "13%",
                "height": 1
              },
              "track": {
                "left": "73%",
                "top": 0,
                "width": "27%",
                "height": 1
              }
            },
            "labels": {
              "stress": "STRESS"
            },
            "pillar": "prime"
          },
          "noun": "Attribute",
          "plural": "Attributes",
          "traits": [
            {
              "name": "Anger",
              "traits": []
            },
            {
              "name": "Desire",
              "traits": []
            },
            {
              "name": "Fear",
              "traits": []
            },
            {
              "name": "Joy",
              "traits": []
            },
            {
              "name": "Sorrow",
              "traits": []
            }
          ]
        },
        {
          "id": "town-relationships",
          "name": "Relationships",
          "description": "Bonds and rivalries with local residents",
          "view": {
            "header": "top",
            "headerAlign": "left",
            "features": {
              "description": true,
              "sfx": false,
              "subtraits": false
            },
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
            "notes": "",
            "reservedSlots": 10,
            "place": {
              "left": "0%",
              "top": 2,
              "width": "64%",
              "height": 1
            },
            "parts": {
              "name": {
                "left": "0%",
                "top": 0,
                "width": "70%",
                "height": 1
              },
              "rating": {
                "left": "70%",
                "top": 0,
                "width": "30%",
                "height": 1
              },
              "description": {
                "left": "0%",
                "top": 1,
                "width": "100%",
                "height": 1
              }
            },
            "pillar": "prime"
          },
          "noun": "Relationship",
          "plural": "Relationships",
          "traits": []
        },
        {
          "id": "growth-pool",
          "name": "Growth Pool",
          "view": {
            "header": "top",
            "headerAlign": "left",
            "features": {
              "description": false,
              "sfx": false,
              "subtraits": false
            },
            "page": 1,
            "style": {
              "header": "default",
              "body": "dice-count"
            },
            "ratingScale": [
              4,
              6,
              8,
              10,
              12
            ],
            "multiDie": true,
            "reservedSlots": 5,
            "place": {
              "left": "64%",
              "top": 2,
              "width": "36%",
              "height": 1
            },
            "labels": {
              "rating": "RATING",
              "dice": "/ DICE"
            },
            "pillar": "play"
          },
          "pool": true,
          "noun": "Growth Die",
          "plural": "Growth Dice",
          "traits": [
            {
              "name": "D4",
              "rating": {
                "type": "Die",
                "value": [
                  4
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "spendable": true,
              "hitches": 0,
              "view": {
                "poolCount": 1
              },
              "traits": []
            },
            {
              "name": "D6",
              "rating": {
                "type": "Die",
                "value": [
                  6
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "spendable": true,
              "hitches": 0,
              "view": {
                "poolCount": 1
              },
              "traits": []
            },
            {
              "name": "D8",
              "rating": {
                "type": "Die",
                "value": [
                  8
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "spendable": true,
              "hitches": 0,
              "view": {
                "poolCount": 1
              },
              "traits": []
            },
            {
              "name": "D10",
              "rating": {
                "type": "Die",
                "value": [
                  10
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "spendable": true,
              "hitches": 0,
              "view": {
                "poolCount": 1
              },
              "traits": []
            },
            {
              "name": "D12",
              "rating": {
                "type": "Die",
                "value": [
                  12
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "spendable": true,
              "hitches": 0,
              "view": {
                "poolCount": 1
              },
              "traits": []
            }
          ]
        },
        {
          "id": "complications",
          "name": "Complications",
          "view": {
            "features": {
              "description": true,
              "sfx": false,
              "subtraits": false
            },
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
            "reservedSlots": 5,
            "place": {
              "left": "64%",
              "top": 3,
              "width": "36%",
              "height": 1
            },
            "parts": {
              "rating": {
                "left": "0%",
                "top": 0,
                "width": "100%",
                "height": 1
              },
              "name": {
                "left": "0%",
                "top": 1,
                "width": "100%",
                "height": 1
              }
            },
            "playMutable": true,
            "pillar": "play"
          },
          "noun": "Complication",
          "plural": "Complications",
          "traits": []
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
    "listing": {
      "url": "https://legacy.drivethrurpg.com/product/574557/Necromancer?manufacturers_id=31866",
      "quote": "You didn’t ask for this. You were just trying to live your life.",
      "genre": "Urban fantasy",
      "setting": "d8",
      "prep": "d6",
      "complexity": "d8",
      "image": "https://legacy.drivethrurpg.com/images/31866/574557.jpg"
    },
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
      "player": "",
      "portrait": {
        "url": "",
        "view": {
          "size": "spotlight",
          "location": "header"
        }
      },
      "view": {
        "pageCount": 1,
        "spotlight": "Necromancer",
        "style": {
          "sheet": "spotlight"
        },
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
      },
      "traitSets": [
        {
          "id": "name",
          "name": "Name",
          "view": {
            "style": {
              "header": "default",
              "body": "name"
            },
            "page": 1
          },
          "traits": [
            {
              "name": "name",
              "label": "Name",
              "traits": []
            },
            {
              "name": "player",
              "label": "Player",
              "traits": []
            },
            {
              "name": "nickname",
              "label": "Nickname",
              "traits": []
            },
            {
              "name": "pronouns",
              "label": "Pronouns",
              "traits": []
            },
            {
              "name": "description",
              "label": "Description",
              "traits": []
            },
            {
              "name": "game",
              "label": "Game",
              "view": {
                "visibility": "hidden"
              },
              "traits": []
            },
            {
              "name": "portrait",
              "traits": []
            },
            {
              "name": "caption",
              "traits": []
            },
            {
              "name": "plotPoints",
              "rating": {
                "type": "Counter",
                "value": [
                  1
                ],
                "range": [
                  0,
                  20
                ]
              },
              "label": "PP",
              "spendable": true,
              "view": {
                "visibility": "hidden"
              },
              "traits": []
            },
            {
              "name": "notes",
              "view": {
                "visibility": "hidden"
              },
              "traits": []
            }
          ]
        },
        {
          "id": "distinctions",
          "name": "Distinctions",
          "description": "Occult lineage, taboo practice, and philosophical motivation",
          "view": {
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
            "page": 1,
            "style": {
              "header": "sfx-rows",
              "body": "sfx-rows"
            },
            "multiDie": false,
            "notes": "",
            "reservedSlots": 3,
            "pillar": "prime"
          },
          "noun": "Distinction",
          "plural": "Distinctions",
          "traits": [
            {
              "name": "Job:",
              "rating": {
                "type": "Die",
                "value": [
                  8
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "traits": [
                {
                  "name": "SFX",
                  "traits": [
                    {
                      "name": "Hinder",
                      "rating": { "type": "Die", "value": [4], "range": [4] },
                      "traits": []
                    }
                  ]
                }
              ]
            },
            {
              "name": "Necromancy:",
              "rating": {
                "type": "Die",
                "value": [
                  8
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "traits": [
                {
                  "name": "SFX",
                  "traits": [
                    {
                      "name": "Hinder",
                      "rating": { "type": "Die", "value": [4], "range": [4] },
                      "traits": []
                    }
                  ]
                }
              ]
            },
            {
              "name": "Desire:",
              "rating": {
                "type": "Die",
                "value": [
                  8
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "traits": [
                {
                  "name": "SFX",
                  "traits": [
                    {
                      "name": "Hinder",
                      "rating": { "type": "Die", "value": [4], "range": [4] },
                      "traits": []
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "id": "affiliations",
          "name": "Affiliations",
          "description": "Operating configuration dice and statements",
          "statement": true,
          "view": {
            "header": "top",
            "headerAlign": "center",
            "features": {
              "description": true,
              "sfx": false,
              "subtraits": false
            },
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
            "notes": "",
            "reservedSlots": 3,
            "parts": {
              "name": {
                "left": "0%",
                "top": 0,
                "width": "70%",
                "height": 1
              },
              "rating": {
                "left": "70%",
                "top": 0,
                "width": "30%",
                "height": 1
              }
            },
            "pillar": "prime"
          },
          "noun": "Affiliation",
          "plural": "Affiliations",
          "traits": [
            {
              "name": "My Life",
              "traits": []
            },
            {
              "name": "The World",
              "traits": []
            },
            {
              "name": "The Demi-Monde",
              "traits": []
            }
          ]
        },
        {
          "id": "roles-specialties",
          "name": "Roles",
          "description": "Dark magical callings and practices",
          "view": {
            "header": "top",
            "headerAlign": "center",
            "features": {
              "description": false,
              "sfx": false,
              "subtraits": false
            },
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
            "notes": "",
            "reservedSlots": 6,
            "place": {
              "left": "0%",
              "top": 2,
              "width": "38%",
              "height": 1
            },
            "pillar": "prime"
          },
          "noun": "Role",
          "plural": "Roles",
          "traits": [
            {
              "name": "Diplomat",
              "traits": []
            },
            {
              "name": "Fighter",
              "traits": []
            },
            {
              "name": "Guardian",
              "traits": []
            },
            {
              "name": "Healer",
              "traits": []
            },
            {
              "name": "Sneak",
              "traits": []
            },
            {
              "name": "Transporter",
              "traits": []
            }
          ]
        },
        {
          "id": "signature-assets",
          "name": "Signature Assets",
          "description": "Occult relics, grimoires, and dark instruments",
          "view": {
            "header": "top",
            "headerAlign": "center",
            "features": {
              "description": true,
              "sfx": false,
              "subtraits": false
            },
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
            "notes": "",
            "reservedSlots": 3,
            "place": {
              "left": "0%",
              "top": 3,
              "width": "38%",
              "height": 1
            },
            "parts": {
              "rating": {
                "left": "0%",
                "top": 0,
                "width": "100%",
                "height": 1
              },
              "name": {
                "left": "0%",
                "top": 1,
                "width": "100%",
                "height": 1
              }
            },
            "pillar": "plus"
          },
          "noun": "Signature Asset",
          "plural": "Signature Assets",
          "traits": []
        },
        {
          "id": "necromantic-arts",
          "name": "Ability",
          "description": "EFFECT TAGS: ATTACK • SENSORY • MOVEMENT • CONTROL • DEFENSE • ENHANCEMENT",
          "view": {
            "header": "top",
            "headerAlign": "center",
            "features": {
              "description": true,
              "sfx": true,
              "subtraits": true
            },
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
            "notes": "",
            "reservedSlots": 1,
            "place": {
              "left": "38%",
              "top": 2,
              "width": "62%",
              "height": 1
            },
            "pillar": "plus"
          },
          "noun": "Ability",
          "plural": "Abilities",
          "traits": [
            {
              "name": "Necromancy",
              "traits": [
                {
                  "name": "Descriptor Tags:",
                  "traits": []
                },
                {
                  "name": "SFX",
                  "traits": [
                    {
                      "name": "Been There",
                      "description": "When you are resurrecting a ______________, double your Necromancy.",
                      "traits": []
                    },
                    {
                      "name": "Done That",
                      "description": "When a ______________ you resurrected creates or exacerbates a problem, earn a PP.",
                      "traits": []
                    },
                    {
                      "name": "Limit — Dammit",
                      "description": "When you injure, maim, or kill with Necromancy or kill by any means, gain the Deathmark complication at d4 or step it up. When your Deathmark steps up past d12, add the d12 to the doom pool and lose access to your Necromancy for the duration of the scene.",
                      "traits": []
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "id": "session-record",
          "name": "Session Record",
          "view": {
            "header": "top",
            "headerAlign": "left",
            "features": {
              "description": false,
              "sfx": false,
              "subtraits": false
            },
            "page": 1,
            "style": {
              "header": "default",
              "body": "pips"
            },
            "reservedSlots": 10,
            "place": {
              "left": "0%",
              "top": 4,
              "width": "62%",
              "height": 1
            },
            "pips": {
              "labels": true,
              "perRow": 10
            },
            "pillar": "play"
          },
          "rating": {
            "type": "Pip",
            "value": [
              false,
              false,
              false,
              false,
              false,
              false,
              false,
              false,
              false,
              false
            ]
          },
          "noun": "Session",
          "plural": "Sessions",
          "traits": []
        },
        {
          "id": "complications",
          "name": "Complications",
          "view": {
            "header": "top",
            "headerAlign": "center",
            "features": {
              "description": true,
              "sfx": false,
              "subtraits": false
            },
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
            "reservedSlots": 3,
            "place": {
              "left": "62%",
              "top": 4,
              "width": "38%",
              "height": 1
            },
            "parts": {
              "rating": {
                "left": "0%",
                "top": 0,
                "width": "100%",
                "height": 1
              },
              "name": {
                "left": "0%",
                "top": 1,
                "width": "100%",
                "height": 1
              }
            },
            "playMutable": true,
            "pillar": "play"
          },
          "noun": "Complication",
          "plural": "Complications",
          "traits": [
            {
              "name": "Deathmark",
              "description": "Deathmark",
              "traits": []
            }
          ]
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
    "listing": {
      "url": "https://legacy.drivethrurpg.com/product/567044/Retired-No-More?manufacturers_id=31866",
      "quote": "You had a good run. Crystal artifacts recovered, sky pirates outwitted, ancient ruins plundered.",
      "genre": "Pulp adventure",
      "setting": "d8",
      "prep": "d6",
      "complexity": "d8",
      "image": "https://legacy.drivethrurpg.com/images/31866/567044.jpg"
    },
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
      "player": "",
      "portrait": {
        "url": "",
        "view": {
          "size": "spotlight",
          "location": "header"
        }
      },
      "view": {
        "pageCount": 1,
        "spotlight": "Retired No More",
        "style": {
          "sheet": "spotlight"
        },
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
      },
      "traitSets": [
        {
          "id": "name",
          "name": "Name",
          "view": {
            "style": {
              "header": "default",
              "body": "name"
            },
            "page": 1
          },
          "traits": [
            {
              "name": "name",
              "label": "Name",
              "traits": []
            },
            {
              "name": "player",
              "label": "Player",
              "traits": []
            },
            {
              "name": "nickname",
              "label": "Nickname",
              "traits": []
            },
            {
              "name": "pronouns",
              "label": "Pronouns",
              "traits": []
            },
            {
              "name": "description",
              "label": "Description",
              "traits": []
            },
            {
              "name": "game",
              "label": "Game",
              "view": {
                "visibility": "hidden"
              },
              "traits": []
            },
            {
              "name": "portrait",
              "traits": []
            },
            {
              "name": "caption",
              "traits": []
            },
            {
              "name": "plotPoints",
              "rating": {
                "type": "Counter",
                "value": [
                  1
                ],
                "range": [
                  0,
                  20
                ]
              },
              "label": "PP",
              "spendable": true,
              "view": {
                "visibility": "hidden"
              },
              "traits": []
            },
            {
              "name": "notes",
              "view": {
                "visibility": "hidden"
              },
              "traits": []
            }
          ]
        },
        {
          "id": "values",
          "name": "Values",
          "description": "Enduring principles of the golden era",
          "view": {
            "features": {
              "description": false,
              "sfx": false,
              "subtraits": false
            },
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
            "notes": "",
            "reservedSlots": 7,
            "place": {
              "left": "0%",
              "top": 0,
              "width": "28%",
              "height": 1
            },
            "parts": {
              "name": {
                "left": "0%",
                "top": 0,
                "width": "100%",
                "height": 1
              },
              "rating": {
                "left": "0%",
                "top": 1,
                "width": "100%",
                "height": 1
              }
            },
            "pillar": "prime"
          },
          "noun": "Value",
          "plural": "Values",
          "traits": [
            {
              "name": "Allegiance",
              "traits": []
            },
            {
              "name": "Glory",
              "traits": []
            },
            {
              "name": "Integrity",
              "traits": []
            },
            {
              "name": "Knowledge",
              "traits": []
            },
            {
              "name": "Novelty",
              "traits": []
            },
            {
              "name": "Power",
              "traits": []
            },
            {
              "name": "Riches",
              "traits": []
            }
          ]
        },
        {
          "id": "distinctions",
          "name": "Distinctions",
          "description": "Past glory, modern civilian life, and the call to return",
          "view": {
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
            "page": 1,
            "style": {
              "header": "sfx-rows",
              "body": "sfx-rows"
            },
            "multiDie": false,
            "notes": "",
            "reservedSlots": 3,
            "place": {
              "left": "28%",
              "top": 0,
              "width": "72%",
              "height": 1
            },
            "pillar": "prime"
          },
          "noun": "Distinction",
          "plural": "Distinctions",
          "traits": [
            {
              "name": "Archetype",
              "rating": {
                "type": "Die",
                "value": [
                  8
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "traits": [
                {
                  "name": "SFX",
                  "traits": [
                    {
                      "name": "Hinder",
                      "rating": { "type": "Die", "value": [4], "range": [4] },
                      "traits": []
                    }
                  ]
                }
              ]
            },
            {
              "name": "Retirement",
              "rating": {
                "type": "Die",
                "value": [
                  8
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "traits": [
                {
                  "name": "SFX",
                  "traits": [
                    {
                      "name": "Hinder",
                      "rating": { "type": "Die", "value": [4], "range": [4] },
                      "traits": []
                    }
                  ]
                }
              ]
            },
            {
              "name": "Satisfaction",
              "rating": {
                "type": "Die",
                "value": [
                  8
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "traits": [
                {
                  "name": "SFX",
                  "traits": [
                    {
                      "name": "Hinder",
                      "rating": { "type": "Die", "value": [4], "range": [4] },
                      "traits": []
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "id": "vintage-resources-assets",
          "name": "Resources",
          "description": "Stashed tech, vintage vehicles, and old connections (5d6 each)",
          "view": {
            "header": "top",
            "headerAlign": "center",
            "features": {
              "description": true,
              "sfx": false,
              "subtraits": false
            },
            "page": 1,
            "style": {
              "header": "default",
              "body": "default"
            },
            "ratingScale": [
              6
            ],
            "multiDie": true,
            "notes": "",
            "reservedSlots": 5,
            "place": {
              "left": "0%",
              "top": 1,
              "width": "28%",
              "height": 1
            },
            "parts": {
              "name": {
                "left": "0%",
                "top": 0,
                "width": "100%",
                "height": 1
              },
              "rating": {
                "left": "0%",
                "top": 1,
                "width": "100%",
                "height": 1
              },
              "description": {
                "left": "0%",
                "top": 2,
                "width": "100%",
                "height": 1
              }
            },
            "pillar": "plus"
          },
          "noun": "Resource",
          "plural": "Resources",
          "traits": [
            {
              "name": "",
              "rating": {
                "type": "Dice",
                "value": [
                  6,
                  6,
                  6,
                  6,
                  6
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "spendable": true,
              "hitches": 0,
              "traits": []
            },
            {
              "name": "",
              "rating": {
                "type": "Dice",
                "value": [
                  6,
                  6,
                  6,
                  6,
                  6
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "spendable": true,
              "hitches": 0,
              "traits": []
            },
            {
              "name": "",
              "rating": {
                "type": "Dice",
                "value": [
                  6,
                  6,
                  6,
                  6,
                  6
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "spendable": true,
              "hitches": 0,
              "traits": []
            },
            {
              "name": "",
              "rating": {
                "type": "Dice",
                "value": [
                  6,
                  6,
                  6,
                  6,
                  6
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "spendable": true,
              "hitches": 0,
              "traits": []
            },
            {
              "name": "",
              "rating": {
                "type": "Dice",
                "value": [
                  6,
                  6,
                  6,
                  6,
                  6
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "spendable": true,
              "hitches": 0,
              "traits": []
            }
          ]
        },
        {
          "id": "signature-assets",
          "name": "Signature Assets",
          "view": {
            "header": "top",
            "headerAlign": "center",
            "features": {
              "description": true,
              "sfx": false,
              "subtraits": false
            },
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
            "reservedSlots": 2,
            "place": {
              "left": "0%",
              "top": 2,
              "width": "28%",
              "height": 1
            },
            "parts": {
              "name": {
                "left": "0%",
                "top": 0,
                "width": "100%",
                "height": 1
              },
              "rating": {
                "left": "0%",
                "top": 1,
                "width": "100%",
                "height": 1
              },
              "description": {
                "left": "0%",
                "top": 2,
                "width": "100%",
                "height": 1
              }
            },
            "pillar": "plus"
          },
          "noun": "Asset",
          "plural": "Assets",
          "traits": []
        },
        {
          "id": "aging-complications",
          "name": "Aging Complications",
          "view": {
            "header": "top",
            "headerAlign": "center",
            "features": {
              "description": true,
              "sfx": false,
              "subtraits": false
            },
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
            "reservedSlots": 2,
            "place": {
              "left": "0%",
              "top": 3,
              "width": "28%",
              "height": 1
            },
            "parts": {
              "name": {
                "left": "0%",
                "top": 0,
                "width": "100%",
                "height": 1
              },
              "rating": {
                "left": "0%",
                "top": 1,
                "width": "100%",
                "height": 1
              },
              "description": {
                "left": "0%",
                "top": 2,
                "width": "100%",
                "height": 1
              }
            },
            "playMutable": true,
            "pillar": "play"
          },
          "noun": "Complication",
          "plural": "Complications",
          "traits": []
        },
        {
          "id": "subtrait-columns",
          "name": "Skills & Specialties",
          "description": "Mundane d4-d6 skills stepped up by d8-d12 veteran specialties",
          "view": {
            "header": "top",
            "headerAlign": "center",
            "features": {
              "description": false,
              "sfx": false,
              "subtraits": true
            },
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
            "notes": "",
            "reservedSlots": 16,
            "place": {
              "left": "28%",
              "top": 1,
              "width": "72%",
              "height": 1
            },
            "pillar": "prime"
          },
          "noun": "Skill",
          "plural": "Skills",
          "traits": [
            {
              "name": "Craft",
              "traits": []
            },
            {
              "name": "Fight",
              "traits": []
            },
            {
              "name": "Fly",
              "traits": []
            },
            {
              "name": "Focus",
              "traits": []
            },
            {
              "name": "Influence",
              "traits": []
            },
            {
              "name": "Know",
              "traits": []
            },
            {
              "name": "Labor",
              "traits": []
            },
            {
              "name": "Move",
              "traits": []
            },
            {
              "name": "Notice",
              "traits": []
            },
            {
              "name": "Perform",
              "traits": []
            },
            {
              "name": "Sneak",
              "traits": []
            },
            {
              "name": "Survive",
              "traits": []
            },
            {
              "name": "Throw",
              "traits": []
            },
            {
              "name": "Tinker",
              "traits": []
            },
            {
              "name": "Treat",
              "traits": []
            },
            {
              "name": "Trick",
              "traits": []
            }
          ]
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
    "listing": {
      "url": "https://legacy.drivethrurpg.com/product/567044/Retired-No-More?manufacturers_id=31866",
      "quote": "You had a good run. Crystal artifacts recovered, sky pirates outwitted, ancient ruins plundered.",
      "genre": "Pulp adventure",
      "setting": "d8",
      "prep": "d6",
      "complexity": "d8",
      "image": "https://legacy.drivethrurpg.com/images/31866/567044.jpg"
    },
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
      "player": "",
      "portrait": {
        "url": "",
        "view": {
          "size": "spotlight",
          "location": "header"
        }
      },
      "view": {
        "pageCount": 1,
        "spotlight": "Retired No More",
        "style": {
          "sheet": "spotlight"
        },
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
      },
      "traitSets": [
        {
          "id": "name",
          "name": "Name",
          "view": {
            "style": {
              "header": "default",
              "body": "name"
            },
            "page": 1
          },
          "traits": [
            {
              "name": "name",
              "label": "Name",
              "traits": []
            },
            {
              "name": "player",
              "label": "Player",
              "traits": []
            },
            {
              "name": "nickname",
              "label": "Nickname",
              "traits": []
            },
            {
              "name": "pronouns",
              "label": "Pronouns",
              "traits": []
            },
            {
              "name": "description",
              "label": "Description",
              "traits": []
            },
            {
              "name": "game",
              "label": "Game",
              "view": {
                "visibility": "hidden"
              },
              "traits": []
            },
            {
              "name": "portrait",
              "traits": []
            },
            {
              "name": "caption",
              "traits": []
            },
            {
              "name": "plotPoints",
              "rating": {
                "type": "Counter",
                "value": [
                  1
                ],
                "range": [
                  0,
                  20
                ]
              },
              "label": "PP",
              "spendable": true,
              "view": {
                "visibility": "hidden"
              },
              "traits": []
            },
            {
              "name": "notes",
              "view": {
                "visibility": "hidden"
              },
              "traits": []
            }
          ]
        },
        {
          "id": "values",
          "name": "Values",
          "description": "The aviator's code and sky ethics",
          "view": {
            "features": {
              "description": false,
              "sfx": false,
              "subtraits": false
            },
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
            "notes": "",
            "reservedSlots": 7,
            "place": {
              "left": "0%",
              "top": 0,
              "width": "28%",
              "height": 1
            },
            "parts": {
              "name": {
                "left": "0%",
                "top": 0,
                "width": "100%",
                "height": 1
              },
              "rating": {
                "left": "0%",
                "top": 1,
                "width": "100%",
                "height": 1
              }
            },
            "pillar": "prime"
          },
          "noun": "Value",
          "plural": "Values",
          "traits": [
            {
              "name": "Allegiance",
              "traits": []
            },
            {
              "name": "Glory",
              "traits": []
            },
            {
              "name": "Integrity",
              "traits": []
            },
            {
              "name": "Knowledge",
              "traits": []
            },
            {
              "name": "Novelty",
              "traits": []
            },
            {
              "name": "Power",
              "traits": []
            },
            {
              "name": "Riches",
              "traits": []
            }
          ]
        },
        {
          "id": "distinctions",
          "name": "Distinctions",
          "description": "Aerial legend and grounded retirement",
          "view": {
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
            "page": 1,
            "style": {
              "header": "sfx-rows",
              "body": "sfx-rows"
            },
            "multiDie": false,
            "notes": "",
            "reservedSlots": 2,
            "place": {
              "left": "28%",
              "top": 0,
              "width": "72%",
              "height": 1
            },
            "pillar": "prime"
          },
          "noun": "Distinction",
          "plural": "Distinctions",
          "traits": [
            {
              "name": "Archetype:",
              "rating": {
                "type": "Die",
                "value": [
                  8
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "traits": [
                {
                  "name": "SFX",
                  "traits": [
                    {
                      "name": "Hinder",
                      "rating": { "type": "Die", "value": [4], "range": [4] },
                      "traits": []
                    }
                  ]
                }
              ]
            },
            {
              "name": "Retirement:",
              "rating": {
                "type": "Die",
                "value": [
                  8
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "traits": [
                {
                  "name": "SFX",
                  "traits": [
                    {
                      "name": "Hinder",
                      "rating": { "type": "Die", "value": [4], "range": [4] },
                      "traits": []
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "id": "vintage-plane-signature-assets",
          "name": "Resources",
          "description": "Custom aircraft and aviator resources (5d6 each)",
          "view": {
            "header": "top",
            "headerAlign": "center",
            "features": {
              "description": true,
              "sfx": false,
              "subtraits": false
            },
            "page": 1,
            "style": {
              "header": "default",
              "body": "default"
            },
            "ratingScale": [
              6
            ],
            "multiDie": true,
            "notes": "",
            "reservedSlots": 3,
            "place": {
              "left": "0%",
              "top": 1,
              "width": "28%",
              "height": 1
            },
            "parts": {
              "name": {
                "left": "0%",
                "top": 0,
                "width": "100%",
                "height": 1
              },
              "rating": {
                "left": "0%",
                "top": 1,
                "width": "100%",
                "height": 1
              },
              "description": {
                "left": "0%",
                "top": 2,
                "width": "100%",
                "height": 1
              }
            },
            "pillar": "plus"
          },
          "noun": "Resource",
          "plural": "Resources",
          "traits": [
            {
              "name": "",
              "rating": {
                "type": "Dice",
                "value": [
                  6,
                  6,
                  6,
                  6,
                  6
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "spendable": true,
              "hitches": 0,
              "traits": []
            },
            {
              "name": "",
              "rating": {
                "type": "Dice",
                "value": [
                  6,
                  6,
                  6,
                  6,
                  6
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "spendable": true,
              "hitches": 0,
              "traits": []
            },
            {
              "name": "",
              "rating": {
                "type": "Dice",
                "value": [
                  6,
                  6,
                  6,
                  6,
                  6
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "spendable": true,
              "hitches": 0,
              "traits": []
            }
          ]
        },
        {
          "id": "signature-asset",
          "name": "Signature Asset",
          "view": {
            "header": "top",
            "headerAlign": "center",
            "features": {
              "description": true,
              "sfx": false,
              "subtraits": false
            },
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
            "reservedSlots": 1,
            "place": {
              "left": "0%",
              "top": 2,
              "width": "28%",
              "height": 1
            },
            "parts": {
              "name": {
                "left": "0%",
                "top": 0,
                "width": "100%",
                "height": 1
              },
              "rating": {
                "left": "0%",
                "top": 1,
                "width": "100%",
                "height": 1
              },
              "description": {
                "left": "0%",
                "top": 2,
                "width": "100%",
                "height": 1
              }
            },
            "pillar": "plus"
          },
          "noun": "Asset",
          "plural": "Assets",
          "traits": []
        },
        {
          "id": "subtrait-columns",
          "name": "Skills & Specialties",
          "description": "Flight and tactical skills (d4-d6) with veteran specialties (d8-d12)",
          "view": {
            "header": "top",
            "headerAlign": "center",
            "features": {
              "description": false,
              "sfx": false,
              "subtraits": true
            },
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
            "notes": "",
            "reservedSlots": 9,
            "place": {
              "left": "28%",
              "top": 1,
              "width": "72%",
              "height": 1
            },
            "pillar": "prime"
          },
          "noun": "Skill",
          "plural": "Skills",
          "traits": []
        },
        {
          "id": "session-record",
          "name": "Session Record",
          "description": "1: Training • 2: Adventuring Triumph • 3: Retirement",
          "view": {
            "header": "top",
            "headerAlign": "left",
            "features": {
              "description": false,
              "sfx": false,
              "subtraits": false
            },
            "page": 1,
            "style": {
              "header": "default",
              "body": "pips"
            },
            "reservedSlots": 20,
            "pips": {
              "labels": true,
              "perRow": 20
            },
            "pillar": "play"
          },
          "rating": {
            "type": "Pip",
            "value": [
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
              false
            ]
          },
          "noun": "Session",
          "plural": "Sessions",
          "traits": [
            {
              "name": "Training",
              "description": "Training",
              "traits": []
            },
            {
              "name": "Adventuring Triumph",
              "description": "Adventuring Triumph",
              "traits": []
            },
            {
              "name": "Retirement",
              "description": "Retirement",
              "traits": []
            }
          ]
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
    "listing": {
      "url": "https://legacy.drivethrurpg.com/product/574559/Safe-Zone?manufacturers_id=31866",
      "quote": "The Rot took the world. The Rotters are still out there, but they’re not the problem anymore.",
      "genre": "Post-apocalyptic zombie survival | Base-building",
      "setting": "d8",
      "prep": "d8",
      "complexity": "d8",
      "image": "https://legacy.drivethrurpg.com/images/31866/574559.jpg"
    },
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
      "player": "",
      "portrait": {
        "url": "",
        "view": {
          "size": "spotlight",
          "location": "header"
        }
      },
      "view": {
        "pageCount": 1,
        "spotlight": "Safe Zone",
        "style": {
          "sheet": "spotlight"
        },
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
      },
      "traitSets": [
        {
          "id": "name",
          "name": "Name",
          "view": {
            "style": {
              "header": "default",
              "body": "name"
            },
            "page": 1
          },
          "traits": [
            {
              "name": "name",
              "label": "Name",
              "traits": []
            },
            {
              "name": "player",
              "label": "Player",
              "traits": []
            },
            {
              "name": "nickname",
              "label": "Nickname",
              "traits": []
            },
            {
              "name": "pronouns",
              "label": "Pronouns",
              "traits": []
            },
            {
              "name": "description",
              "label": "Description",
              "traits": []
            },
            {
              "name": "game",
              "label": "Game",
              "view": {
                "visibility": "hidden"
              },
              "traits": []
            },
            {
              "name": "portrait",
              "traits": []
            },
            {
              "name": "caption",
              "traits": []
            },
            {
              "name": "plotPoints",
              "rating": {
                "type": "Counter",
                "value": [
                  1
                ],
                "range": [
                  0,
                  20
                ]
              },
              "label": "PP",
              "spendable": true,
              "view": {
                "visibility": "hidden"
              },
              "traits": []
            },
            {
              "name": "notes",
              "view": {
                "visibility": "hidden"
              },
              "traits": []
            }
          ]
        },
        {
          "id": "distinctions",
          "name": "Distinctions",
          "description": "Pre-fall life, current survival role, and future hope",
          "view": {
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
            "page": 1,
            "style": {
              "header": "sfx-rows",
              "body": "sfx-rows"
            },
            "multiDie": false,
            "notes": "",
            "reservedSlots": 3,
            "pillar": "prime"
          },
          "noun": "Distinction",
          "plural": "Distinctions",
          "traits": [
            {
              "name": "Before:",
              "rating": {
                "type": "Die",
                "value": [
                  8
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "traits": [
                {
                  "name": "SFX",
                  "traits": [
                    {
                      "name": "Hinder",
                      "rating": { "type": "Die", "value": [4], "range": [4] },
                      "traits": []
                    }
                  ]
                }
              ]
            },
            {
              "name": "Now:",
              "rating": {
                "type": "Die",
                "value": [
                  8
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "traits": [
                {
                  "name": "SFX",
                  "traits": [
                    {
                      "name": "Hinder",
                      "rating": { "type": "Die", "value": [4], "range": [4] },
                      "traits": []
                    }
                  ]
                }
              ]
            },
            {
              "name": "Future:",
              "rating": {
                "type": "Die",
                "value": [
                  8
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "traits": [
                {
                  "name": "SFX",
                  "traits": [
                    {
                      "name": "Hinder",
                      "rating": { "type": "Die", "value": [4], "range": [4] },
                      "traits": []
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "id": "subtrait-columns",
          "name": "Skills & Specialties",
          "description": "Practical survival disciplines (d4-d6) with specialized traits (d8-d12)",
          "view": {
            "header": "top",
            "headerAlign": "center",
            "features": {
              "description": false,
              "sfx": false,
              "subtraits": true
            },
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
            "notes": "",
            "reservedSlots": 20,
            "place": {
              "left": "0%",
              "top": 1,
              "width": "66.663%",
              "height": 1
            },
            "pillar": "prime"
          },
          "noun": "Skill",
          "plural": "Skills",
          "traits": [
            {
              "name": "Animals",
              "traits": []
            },
            {
              "name": "Athletics",
              "traits": []
            },
            {
              "name": "Big Guns",
              "traits": []
            },
            {
              "name": "Covert",
              "traits": []
            },
            {
              "name": "Craft",
              "traits": []
            },
            {
              "name": "Creativity",
              "traits": []
            },
            {
              "name": "Drive",
              "traits": []
            },
            {
              "name": "Focus",
              "traits": []
            },
            {
              "name": "Guns",
              "traits": []
            },
            {
              "name": "Influence",
              "traits": []
            },
            {
              "name": "Knowledge",
              "traits": []
            },
            {
              "name": "Mechanic",
              "traits": []
            },
            {
              "name": "Melee",
              "traits": []
            },
            {
              "name": "Notice",
              "traits": []
            },
            {
              "name": "Operate",
              "traits": []
            },
            {
              "name": "Pilot",
              "traits": []
            },
            {
              "name": "Survival",
              "traits": []
            },
            {
              "name": "Thrown",
              "traits": []
            },
            {
              "name": "Treatment",
              "traits": []
            },
            {
              "name": "Unarmed",
              "traits": []
            }
          ]
        },
        {
          "id": "attributes",
          "name": "Attributes",
          "description": "Core survival attributes",
          "view": {
            "header": "top",
            "headerAlign": "center",
            "features": {
              "description": false,
              "sfx": false,
              "subtraits": false
            },
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
            "notes": "",
            "reservedSlots": 3,
            "ringTrait": false,
            "place": {
              "left": "66.663%",
              "top": 1,
              "width": "33.334%",
              "height": 1
            },
            "pillar": "prime"
          },
          "noun": "Attribute",
          "plural": "Attributes",
          "traits": [
            {
              "name": "Analytical",
              "traits": []
            },
            {
              "name": "Forceful",
              "traits": []
            },
            {
              "name": "Quiet",
              "traits": []
            }
          ]
        },
        {
          "id": "relationships",
          "name": "Relationships",
          "description": "Ties to fellow survivors in the camp",
          "view": {
            "header": "top",
            "headerAlign": "center",
            "features": {
              "description": false,
              "sfx": false,
              "subtraits": false
            },
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
            "notes": "",
            "reservedSlots": 10,
            "place": {
              "left": "66.66%",
              "top": 2,
              "width": "33.334%",
              "height": 1
            },
            "pillar": "prime"
          },
          "noun": "Relationship",
          "plural": "Relationships",
          "traits": []
        },
        {
          "id": "stress",
          "name": "Stress",
          "description": "Survivor stress and trauma",
          "view": {
            "header": "top",
            "headerAlign": "center",
            "features": {
              "description": false,
              "sfx": false,
              "subtraits": false
            },
            "page": 1,
            "style": {
              "header": "default",
              "body": "die-track"
            },
            "ratingScale": [
              4,
              6,
              8,
              10,
              12
            ],
            "multiDie": false,
            "notes": "",
            "reservedSlots": 5,
            "place": {
              "left": "66.66%",
              "top": 3,
              "width": "33.334%",
              "height": 1
            },
            "pillar": "play"
          },
          "noun": "Stress",
          "plural": "Stress",
          "traits": [
            {
              "name": "Injured",
              "traits": []
            },
            {
              "name": "Isolated",
              "traits": []
            },
            {
              "name": "Sick",
              "traits": []
            },
            {
              "name": "Tired",
              "traits": []
            },
            {
              "name": "Upset",
              "traits": []
            }
          ]
        },
        {
          "id": "talents",
          "name": "Talents",
          "description": "Survivor tricks and knacks",
          "view": {
            "features": {
              "description": true,
              "sfx": true,
              "subtraits": false
            },
            "page": 1,
            "style": {
              "header": "default",
              "body": "three-column-table"
            },
            "multiDie": false,
            "notes": "",
            "reservedSlots": 3,
            "place": {
              "left": "0%",
              "top": 4,
              "width": "66.663%",
              "height": 1
            },
            "labels": {
              "col1": "TALENT",
              "col2": "ACTIVATION",
              "col3": "EFFECT"
            },
            "pillar": "plus"
          },
          "noun": "Talent",
          "plural": "Talents",
          "traits": []
        },
        {
          "id": "growth-pool",
          "name": "Growth Pool",
          "description": "Survivor growth dice",
          "view": {
            "header": "top",
            "headerAlign": "center",
            "features": {
              "description": false,
              "sfx": false,
              "subtraits": false
            },
            "page": 1,
            "style": {
              "header": "default",
              "body": "dice-count"
            },
            "ratingScale": [
              4,
              6,
              8,
              10,
              12
            ],
            "multiDie": true,
            "reservedSlots": 5,
            "place": {
              "left": "66.663%",
              "top": 4,
              "width": "33.334%",
              "height": 1
            },
            "labels": {
              "rating": "RATING",
              "dice": "/ DICE"
            },
            "pillar": "play"
          },
          "pool": true,
          "noun": "Growth Die",
          "plural": "Growth Dice",
          "traits": [
            {
              "name": "D4",
              "rating": {
                "type": "Die",
                "value": [
                  4
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "spendable": true,
              "hitches": 0,
              "view": {
                "poolCount": 1
              },
              "traits": []
            },
            {
              "name": "D6",
              "rating": {
                "type": "Die",
                "value": [
                  6
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "spendable": true,
              "hitches": 0,
              "view": {
                "poolCount": 1
              },
              "traits": []
            },
            {
              "name": "D8",
              "rating": {
                "type": "Die",
                "value": [
                  8
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "spendable": true,
              "hitches": 0,
              "view": {
                "poolCount": 1
              },
              "traits": []
            },
            {
              "name": "D10",
              "rating": {
                "type": "Die",
                "value": [
                  10
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "spendable": true,
              "hitches": 0,
              "view": {
                "poolCount": 1
              },
              "traits": []
            },
            {
              "name": "D12",
              "rating": {
                "type": "Die",
                "value": [
                  12
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "spendable": true,
              "hitches": 0,
              "view": {
                "poolCount": 1
              },
              "traits": []
            }
          ]
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
    "listing": {
      "url": "https://legacy.drivethrurpg.com/product/574559/Safe-Zone?manufacturers_id=31866",
      "quote": "The Rot took the world. The Rotters are still out there, but they’re not the problem anymore.",
      "genre": "Post-apocalyptic zombie survival | Base-building",
      "setting": "d8",
      "prep": "d8",
      "complexity": "d8",
      "image": "https://legacy.drivethrurpg.com/images/31866/574559.jpg"
    },
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
      "player": "",
      "portrait": {
        "url": "",
        "view": {
          "size": "spotlight",
          "location": "header"
        }
      },
      "view": {
        "pageCount": 2,
        "spotlight": "Safe Zone",
        "style": {
          "sheet": "spotlight"
        },
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
      },
      "traitSets": [
        {
          "id": "name",
          "name": "Name",
          "view": {
            "style": {
              "header": "default",
              "body": "name"
            },
            "page": 1
          },
          "traits": [
            {
              "name": "name",
              "label": "Name",
              "traits": []
            },
            {
              "name": "player",
              "label": "Player",
              "traits": []
            },
            {
              "name": "nickname",
              "label": "Nickname",
              "traits": []
            },
            {
              "name": "pronouns",
              "label": "Pronouns",
              "traits": []
            },
            {
              "name": "description",
              "label": "Description",
              "traits": []
            },
            {
              "name": "game",
              "label": "Game",
              "view": {
                "visibility": "hidden"
              },
              "traits": []
            },
            {
              "name": "portrait",
              "traits": []
            },
            {
              "name": "caption",
              "traits": []
            },
            {
              "name": "plotPoints",
              "rating": {
                "type": "Counter",
                "value": [
                  1
                ],
                "range": [
                  0,
                  20
                ]
              },
              "label": "PP",
              "spendable": true,
              "view": {
                "visibility": "hidden"
              },
              "traits": []
            },
            {
              "name": "notes",
              "view": {
                "visibility": "hidden"
              },
              "traits": []
            }
          ]
        },
        {
          "id": "essential-stockpiles",
          "name": "Essential Stockpiles",
          "description": "Building Benefits:",
          "view": {
            "header": "top",
            "headerAlign": "left",
            "traitColumns": 3,
            "features": {
              "description": false,
              "sfx": false,
              "subtraits": false
            },
            "page": 1,
            "style": {
              "header": "default",
              "body": "default"
            },
            "ratingScale": [
              6
            ],
            "multiDie": true,
            "notes": "",
            "reservedSlots": 3,
            "pillar": "plus"
          },
          "noun": "Essential Stockpile",
          "plural": "Essential Stockpiles",
          "traits": [
            {
              "name": "Food",
              "rating": {
                "type": "Dice",
                "value": [
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
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "spendable": true,
              "traits": []
            },
            {
              "name": "Water",
              "rating": {
                "type": "Dice",
                "value": [
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
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "spendable": true,
              "traits": []
            },
            {
              "name": "Shelter",
              "rating": {
                "type": "Dice",
                "value": [
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
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "spendable": true,
              "traits": []
            }
          ]
        },
        {
          "id": "non-essential-stockpiles",
          "name": "Non-Essential Stockpiles",
          "description": "Building Benefits:",
          "view": {
            "header": "top",
            "headerAlign": "left",
            "traitColumns": 3,
            "features": {
              "description": false,
              "sfx": false,
              "subtraits": false
            },
            "page": 1,
            "style": {
              "header": "default",
              "body": "default"
            },
            "ratingScale": [
              6
            ],
            "multiDie": true,
            "notes": "",
            "reservedSlots": 3,
            "pillar": "plus"
          },
          "noun": "Non-Essential Stockpile",
          "plural": "Non-Essential Stockpiles",
          "traits": [
            {
              "name": "Medicine",
              "rating": {
                "type": "Dice",
                "value": [
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
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "spendable": true,
              "traits": []
            },
            {
              "name": "Protection",
              "rating": {
                "type": "Dice",
                "value": [
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
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "spendable": true,
              "traits": []
            },
            {
              "name": "Tools",
              "rating": {
                "type": "Dice",
                "value": [
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
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "spendable": true,
              "traits": []
            }
          ]
        },
        {
          "id": "building-1",
          "name": "Building 1",
          "view": {
            "header": "top",
            "headerAlign": "left",
            "features": {
              "description": true,
              "sfx": false,
              "subtraits": true
            },
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
            "reservedSlots": 1,
            "place": {
              "left": "0%",
              "top": 2,
              "width": "50%",
              "height": 1
            },
            "pillar": "plus"
          },
          "noun": "Building",
          "plural": "Buildings",
          "traits": [
            {
              "name": "Name:",
              "traits": [
                {
                  "name": "d6 Benefit:",
                  "rating": {
                    "type": "Die",
                    "value": [
                      6
                    ],
                    "range": [
                      4,
                      6,
                      8,
                      10,
                      12
                    ]
                  },
                  "traits": []
                },
                {
                  "name": "d8 Benefit:",
                  "rating": {
                    "type": "Die",
                    "value": [
                      8
                    ],
                    "range": [
                      4,
                      6,
                      8,
                      10,
                      12
                    ]
                  },
                  "traits": []
                },
                {
                  "name": "d10 Benefit:",
                  "rating": {
                    "type": "Die",
                    "value": [
                      10
                    ],
                    "range": [
                      4,
                      6,
                      8,
                      10,
                      12
                    ]
                  },
                  "traits": []
                },
                {
                  "name": "d12 Benefit:",
                  "rating": {
                    "type": "Die",
                    "value": [
                      12
                    ],
                    "range": [
                      4,
                      6,
                      8,
                      10,
                      12
                    ]
                  },
                  "traits": []
                }
              ]
            }
          ]
        },
        {
          "id": "building-2",
          "name": "Building 2",
          "view": {
            "header": "top",
            "headerAlign": "left",
            "features": {
              "description": true,
              "sfx": false,
              "subtraits": true
            },
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
            "reservedSlots": 1,
            "place": {
              "left": "50%",
              "top": 2,
              "width": "50%",
              "height": 1
            },
            "pillar": "plus"
          },
          "noun": "Building",
          "plural": "Buildings",
          "traits": [
            {
              "name": "Name:",
              "traits": [
                {
                  "name": "d6 Benefit:",
                  "rating": {
                    "type": "Die",
                    "value": [
                      6
                    ],
                    "range": [
                      4,
                      6,
                      8,
                      10,
                      12
                    ]
                  },
                  "traits": []
                },
                {
                  "name": "d8 Benefit:",
                  "rating": {
                    "type": "Die",
                    "value": [
                      8
                    ],
                    "range": [
                      4,
                      6,
                      8,
                      10,
                      12
                    ]
                  },
                  "traits": []
                },
                {
                  "name": "d10 Benefit:",
                  "rating": {
                    "type": "Die",
                    "value": [
                      10
                    ],
                    "range": [
                      4,
                      6,
                      8,
                      10,
                      12
                    ]
                  },
                  "traits": []
                },
                {
                  "name": "d12 Benefit:",
                  "rating": {
                    "type": "Die",
                    "value": [
                      12
                    ],
                    "range": [
                      4,
                      6,
                      8,
                      10,
                      12
                    ]
                  },
                  "traits": []
                }
              ]
            }
          ]
        },
        {
          "id": "building-3",
          "name": "Building 3",
          "view": {
            "header": "top",
            "headerAlign": "left",
            "features": {
              "description": true,
              "sfx": false,
              "subtraits": true
            },
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
            "reservedSlots": 1,
            "place": {
              "left": "0%",
              "top": 3,
              "width": "50%",
              "height": 1
            },
            "pillar": "plus"
          },
          "noun": "Building",
          "plural": "Buildings",
          "traits": [
            {
              "name": "Name:",
              "traits": [
                {
                  "name": "d6 Benefit:",
                  "rating": {
                    "type": "Die",
                    "value": [
                      6
                    ],
                    "range": [
                      4,
                      6,
                      8,
                      10,
                      12
                    ]
                  },
                  "traits": []
                },
                {
                  "name": "d8 Benefit:",
                  "rating": {
                    "type": "Die",
                    "value": [
                      8
                    ],
                    "range": [
                      4,
                      6,
                      8,
                      10,
                      12
                    ]
                  },
                  "traits": []
                },
                {
                  "name": "d10 Benefit:",
                  "rating": {
                    "type": "Die",
                    "value": [
                      10
                    ],
                    "range": [
                      4,
                      6,
                      8,
                      10,
                      12
                    ]
                  },
                  "traits": []
                },
                {
                  "name": "d12 Benefit:",
                  "rating": {
                    "type": "Die",
                    "value": [
                      12
                    ],
                    "range": [
                      4,
                      6,
                      8,
                      10,
                      12
                    ]
                  },
                  "traits": []
                }
              ]
            }
          ]
        },
        {
          "id": "building-4",
          "name": "Building 4",
          "view": {
            "header": "top",
            "headerAlign": "left",
            "features": {
              "description": true,
              "sfx": false,
              "subtraits": true
            },
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
            "reservedSlots": 1,
            "place": {
              "left": "50%",
              "top": 3,
              "width": "50%",
              "height": 1
            },
            "pillar": "plus"
          },
          "noun": "Building",
          "plural": "Buildings",
          "traits": [
            {
              "name": "Name:",
              "traits": [
                {
                  "name": "d6 Benefit:",
                  "rating": {
                    "type": "Die",
                    "value": [
                      6
                    ],
                    "range": [
                      4,
                      6,
                      8,
                      10,
                      12
                    ]
                  },
                  "traits": []
                },
                {
                  "name": "d8 Benefit:",
                  "rating": {
                    "type": "Die",
                    "value": [
                      8
                    ],
                    "range": [
                      4,
                      6,
                      8,
                      10,
                      12
                    ]
                  },
                  "traits": []
                },
                {
                  "name": "d10 Benefit:",
                  "rating": {
                    "type": "Die",
                    "value": [
                      10
                    ],
                    "range": [
                      4,
                      6,
                      8,
                      10,
                      12
                    ]
                  },
                  "traits": []
                },
                {
                  "name": "d12 Benefit:",
                  "rating": {
                    "type": "Die",
                    "value": [
                      12
                    ],
                    "range": [
                      4,
                      6,
                      8,
                      10,
                      12
                    ]
                  },
                  "traits": []
                }
              ]
            }
          ]
        },
        {
          "id": "building-5",
          "name": "Building 5",
          "view": {
            "header": "top",
            "headerAlign": "left",
            "features": {
              "description": true,
              "sfx": false,
              "subtraits": true
            },
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
            "reservedSlots": 1,
            "place": {
              "left": "0%",
              "top": 4,
              "width": "50%",
              "height": 1
            },
            "pillar": "plus"
          },
          "noun": "Building",
          "plural": "Buildings",
          "traits": [
            {
              "name": "Name:",
              "traits": [
                {
                  "name": "d6 Benefit:",
                  "rating": {
                    "type": "Die",
                    "value": [
                      6
                    ],
                    "range": [
                      4,
                      6,
                      8,
                      10,
                      12
                    ]
                  },
                  "traits": []
                },
                {
                  "name": "d8 Benefit:",
                  "rating": {
                    "type": "Die",
                    "value": [
                      8
                    ],
                    "range": [
                      4,
                      6,
                      8,
                      10,
                      12
                    ]
                  },
                  "traits": []
                },
                {
                  "name": "d10 Benefit:",
                  "rating": {
                    "type": "Die",
                    "value": [
                      10
                    ],
                    "range": [
                      4,
                      6,
                      8,
                      10,
                      12
                    ]
                  },
                  "traits": []
                },
                {
                  "name": "d12 Benefit:",
                  "rating": {
                    "type": "Die",
                    "value": [
                      12
                    ],
                    "range": [
                      4,
                      6,
                      8,
                      10,
                      12
                    ]
                  },
                  "traits": []
                }
              ]
            }
          ]
        },
        {
          "id": "building-6",
          "name": "Building 6",
          "view": {
            "header": "top",
            "headerAlign": "left",
            "features": {
              "description": true,
              "sfx": false,
              "subtraits": true
            },
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
            "reservedSlots": 1,
            "place": {
              "left": "50%",
              "top": 4,
              "width": "50%",
              "height": 1
            },
            "pillar": "plus"
          },
          "noun": "Building",
          "plural": "Buildings",
          "traits": [
            {
              "name": "Name:",
              "traits": [
                {
                  "name": "d6 Benefit:",
                  "rating": {
                    "type": "Die",
                    "value": [
                      6
                    ],
                    "range": [
                      4,
                      6,
                      8,
                      10,
                      12
                    ]
                  },
                  "traits": []
                },
                {
                  "name": "d8 Benefit:",
                  "rating": {
                    "type": "Die",
                    "value": [
                      8
                    ],
                    "range": [
                      4,
                      6,
                      8,
                      10,
                      12
                    ]
                  },
                  "traits": []
                },
                {
                  "name": "d10 Benefit:",
                  "rating": {
                    "type": "Die",
                    "value": [
                      10
                    ],
                    "range": [
                      4,
                      6,
                      8,
                      10,
                      12
                    ]
                  },
                  "traits": []
                },
                {
                  "name": "d12 Benefit:",
                  "rating": {
                    "type": "Die",
                    "value": [
                      12
                    ],
                    "range": [
                      4,
                      6,
                      8,
                      10,
                      12
                    ]
                  },
                  "traits": []
                }
              ]
            }
          ]
        },
        {
          "id": "survivor-1",
          "name": "Survivor 1",
          "hasQuestionedPip": true,
          "view": {
            "header": "top",
            "headerAlign": "left",
            "features": {
              "description": false,
              "sfx": false,
              "subtraits": false
            },
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
            "reservedSlots": 5,
            "place": {
              "left": "0%",
              "top": 0,
              "width": "33.333%",
              "height": 1
            },
            "pillar": "plus"
          },
          "noun": "Survivor",
          "plural": "Survivors",
          "traits": [
            {
              "name": "Morale",
              "traits": []
            },
            {
              "name": "",
              "rating": {
                "type": "Die",
                "value": [
                  6
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "traits": []
            }
          ]
        },
        {
          "id": "survivor-2",
          "name": "Survivor 2",
          "hasQuestionedPip": true,
          "view": {
            "header": "top",
            "headerAlign": "left",
            "features": {
              "description": false,
              "sfx": false,
              "subtraits": false
            },
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
            "reservedSlots": 5,
            "place": {
              "left": "33.333%",
              "top": 0,
              "width": "33.333%",
              "height": 1
            },
            "pillar": "plus"
          },
          "noun": "Survivor",
          "plural": "Survivors",
          "traits": [
            {
              "name": "Morale",
              "traits": []
            },
            {
              "name": "",
              "rating": {
                "type": "Die",
                "value": [
                  6
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "traits": []
            }
          ]
        },
        {
          "id": "survivor-3",
          "name": "Survivor 3",
          "hasQuestionedPip": true,
          "view": {
            "header": "top",
            "headerAlign": "left",
            "features": {
              "description": false,
              "sfx": false,
              "subtraits": false
            },
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
            "reservedSlots": 5,
            "place": {
              "left": "66.666%",
              "top": 0,
              "width": "33.334%",
              "height": 1
            },
            "pillar": "plus"
          },
          "noun": "Survivor",
          "plural": "Survivors",
          "traits": [
            {
              "name": "Morale",
              "traits": []
            },
            {
              "name": "",
              "rating": {
                "type": "Die",
                "value": [
                  6
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "traits": []
            }
          ]
        },
        {
          "id": "survivor-4",
          "name": "Survivor 4",
          "hasQuestionedPip": true,
          "view": {
            "header": "top",
            "headerAlign": "left",
            "features": {
              "description": false,
              "sfx": false,
              "subtraits": false
            },
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
            "reservedSlots": 5,
            "place": {
              "left": "0%",
              "top": 1,
              "width": "33.333%",
              "height": 1
            },
            "pillar": "plus"
          },
          "noun": "Survivor",
          "plural": "Survivors",
          "traits": [
            {
              "name": "Morale",
              "traits": []
            },
            {
              "name": "",
              "rating": {
                "type": "Die",
                "value": [
                  6
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "traits": []
            }
          ]
        },
        {
          "id": "survivor-5",
          "name": "Survivor 5",
          "hasQuestionedPip": true,
          "view": {
            "header": "top",
            "headerAlign": "left",
            "features": {
              "description": false,
              "sfx": false,
              "subtraits": false
            },
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
            "reservedSlots": 5,
            "place": {
              "left": "33.333%",
              "top": 1,
              "width": "33.333%",
              "height": 1
            },
            "pillar": "plus"
          },
          "noun": "Survivor",
          "plural": "Survivors",
          "traits": [
            {
              "name": "Morale",
              "traits": []
            },
            {
              "name": "",
              "rating": {
                "type": "Die",
                "value": [
                  6
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "traits": []
            }
          ]
        },
        {
          "id": "survivor-6",
          "name": "Survivor 6",
          "hasQuestionedPip": true,
          "view": {
            "header": "top",
            "headerAlign": "left",
            "features": {
              "description": false,
              "sfx": false,
              "subtraits": false
            },
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
            "reservedSlots": 5,
            "place": {
              "left": "66.666%",
              "top": 1,
              "width": "33.334%",
              "height": 1
            },
            "pillar": "plus"
          },
          "noun": "Survivor",
          "plural": "Survivors",
          "traits": [
            {
              "name": "Morale",
              "traits": []
            },
            {
              "name": "",
              "rating": {
                "type": "Die",
                "value": [
                  6
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "traits": []
            }
          ]
        },
        {
          "id": "survivor-7",
          "name": "Survivor 7",
          "hasQuestionedPip": true,
          "view": {
            "header": "top",
            "headerAlign": "left",
            "features": {
              "description": false,
              "sfx": false,
              "subtraits": false
            },
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
            "reservedSlots": 5,
            "place": {
              "left": "0%",
              "top": 2,
              "width": "33.333%",
              "height": 1
            },
            "pillar": "plus"
          },
          "noun": "Survivor",
          "plural": "Survivors",
          "traits": [
            {
              "name": "Morale",
              "traits": []
            },
            {
              "name": "",
              "rating": {
                "type": "Die",
                "value": [
                  6
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "traits": []
            }
          ]
        },
        {
          "id": "survivor-8",
          "name": "Survivor 8",
          "hasQuestionedPip": true,
          "view": {
            "header": "top",
            "headerAlign": "left",
            "features": {
              "description": false,
              "sfx": false,
              "subtraits": false
            },
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
            "reservedSlots": 5,
            "place": {
              "left": "33.333%",
              "top": 2,
              "width": "33.333%",
              "height": 1
            },
            "pillar": "plus"
          },
          "noun": "Survivor",
          "plural": "Survivors",
          "traits": [
            {
              "name": "Morale",
              "traits": []
            },
            {
              "name": "",
              "rating": {
                "type": "Die",
                "value": [
                  6
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "traits": []
            }
          ]
        },
        {
          "id": "survivor-9",
          "name": "Survivor 9",
          "hasQuestionedPip": true,
          "view": {
            "header": "top",
            "headerAlign": "left",
            "features": {
              "description": false,
              "sfx": false,
              "subtraits": false
            },
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
            "reservedSlots": 5,
            "place": {
              "left": "66.666%",
              "top": 2,
              "width": "33.334%",
              "height": 1
            },
            "pillar": "plus"
          },
          "noun": "Survivor",
          "plural": "Survivors",
          "traits": [
            {
              "name": "Morale",
              "traits": []
            },
            {
              "name": "",
              "rating": {
                "type": "Die",
                "value": [
                  6
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "traits": []
            }
          ]
        },
        {
          "id": "colony-projects",
          "name": "Notes",
          "view": {
            "header": "top",
            "headerAlign": "left",
            "features": {
              "description": false,
              "sfx": false,
              "subtraits": false
            },
            "page": 2,
            "style": {
              "header": "default",
              "body": "notes"
            },
            "notes": "",
            "pillar": "play"
          },
          "noun": "Note",
          "plural": "Notes",
          "traits": []
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
    "listing": {
      "url": "https://legacy.drivethrurpg.com/product/574560/Snowfall-Initiative?manufacturers_id=31866",
      "quote": "Earth is freezing. Not metaphorically—glaciers are advancing on major cities, temperatures are dropping, and a new ice age has begun.",
      "genre": "Military sci-fi / Norse portal fantasy",
      "setting": "d10",
      "prep": "d8",
      "complexity": "d8",
      "image": "https://legacy.drivethrurpg.com/images/31866/574560.jpg"
    },
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
      "player": "",
      "portrait": {
        "url": "",
        "view": {
          "size": "spotlight",
          "location": "header"
        }
      },
      "view": {
        "pageCount": 1,
        "spotlight": "Snowfall Initiative",
        "style": {
          "sheet": "spotlight"
        },
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
      },
      "traitSets": [
        {
          "id": "name",
          "name": "Name",
          "view": {
            "style": {
              "header": "default",
              "body": "name"
            },
            "page": 1
          },
          "traits": [
            {
              "name": "name",
              "label": "Name",
              "traits": []
            },
            {
              "name": "player",
              "label": "Player",
              "traits": []
            },
            {
              "name": "nickname",
              "label": "Nickname",
              "traits": []
            },
            {
              "name": "pronouns",
              "label": "Pronouns",
              "traits": []
            },
            {
              "name": "description",
              "label": "Description",
              "traits": []
            },
            {
              "name": "game",
              "label": "Game",
              "view": {
                "visibility": "hidden"
              },
              "traits": []
            },
            {
              "name": "portrait",
              "traits": []
            },
            {
              "name": "caption",
              "traits": []
            },
            {
              "name": "plotPoints",
              "rating": {
                "type": "Counter",
                "value": [
                  1
                ],
                "range": [
                  0,
                  20
                ]
              },
              "label": "PP",
              "spendable": true,
              "view": {
                "visibility": "hidden"
              },
              "traits": []
            },
            {
              "name": "notes",
              "view": {
                "visibility": "hidden"
              },
              "traits": []
            }
          ]
        },
        {
          "id": "distinctions",
          "name": "Distinctions",
          "description": "Cover identity, espionage specialization, and personal objective",
          "view": {
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
            "page": 1,
            "style": {
              "header": "sfx-rows",
              "body": "sfx-rows"
            },
            "multiDie": false,
            "notes": "",
            "reservedSlots": 3,
            "pillar": "prime"
          },
          "noun": "Distinction",
          "plural": "Distinctions",
          "traits": [
            {
              "name": "Role",
              "rating": {
                "type": "Die",
                "value": [
                  8
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "traits": [
                {
                  "name": "SFX",
                  "traits": [
                    {
                      "name": "Hinder",
                      "rating": { "type": "Die", "value": [4], "range": [4] },
                      "traits": []
                    }
                  ]
                }
              ]
            },
            {
              "name": "Background",
              "rating": {
                "type": "Die",
                "value": [
                  8
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "traits": [
                {
                  "name": "SFX",
                  "traits": [
                    {
                      "name": "Hinder",
                      "rating": { "type": "Die", "value": [4], "range": [4] },
                      "traits": []
                    }
                  ]
                }
              ]
            },
            {
              "name": "Personality",
              "rating": {
                "type": "Die",
                "value": [
                  8
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "traits": [
                {
                  "name": "SFX",
                  "traits": [
                    {
                      "name": "Hinder",
                      "rating": { "type": "Die", "value": [4], "range": [4] },
                      "traits": []
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "id": "affiliations",
          "name": "Affiliations",
          "description": "Operational deployment modes",
          "view": {
            "header": "top",
            "headerAlign": "center",
            "features": {
              "description": false,
              "sfx": false,
              "subtraits": false
            },
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
            "notes": "",
            "reservedSlots": 3,
            "place": {
              "left": "0%",
              "top": 1,
              "width": "23%",
              "height": 1
            },
            "parts": {
              "name": {
                "left": "0%",
                "top": 0,
                "width": "100%",
                "height": 1
              },
              "rating": {
                "left": "0%",
                "top": 1,
                "width": "100%",
                "height": 1
              }
            },
            "pillar": "prime"
          },
          "noun": "Affiliation",
          "plural": "Affiliations",
          "traits": [
            {
              "name": "Diplomacy",
              "traits": []
            },
            {
              "name": "Discovery",
              "traits": []
            },
            {
              "name": "Defense",
              "traits": []
            }
          ]
        },
        {
          "id": "complications",
          "name": "Complications",
          "view": {
            "header": "top",
            "headerAlign": "center",
            "features": {
              "description": false,
              "sfx": false,
              "subtraits": false
            },
            "page": 1,
            "style": {
              "header": "die-track",
              "body": "die-track"
            },
            "ratingScale": [
              4,
              6,
              8,
              10,
              12
            ],
            "reservedSlots": 2,
            "place": {
              "left": "23%",
              "top": 1,
              "width": "25%",
              "height": 1
            },
            "parts": {
              "name": {
                "left": "0%",
                "top": 0,
                "width": "100%",
                "height": 1
              },
              "rating": {
                "left": "0%",
                "top": 1,
                "width": "100%",
                "height": 1
              }
            },
            "playMutable": true,
            "pillar": "play"
          },
          "noun": "Complication",
          "plural": "Complications",
          "traits": [
            {
              "name": "Frostbite",
              "traits": []
            },
            {
              "name": "Hypothermia",
              "traits": []
            }
          ]
        },
        {
          "id": "attributes-stress",
          "name": "Attributes & Stress",
          "description": "Core operative capabilities and physical resilience",
          "view": {
            "header": "top",
            "headerAlign": "center",
            "features": {
              "description": false,
              "sfx": false,
              "subtraits": false
            },
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
            "notes": "",
            "reservedSlots": 6,
            "ringTrait": false,
            "place": {
              "left": "48%",
              "top": 1,
              "width": "52%",
              "height": 1
            },
            "parts": {
              "name": {
                "left": "0%",
                "top": 0,
                "width": "30%",
                "height": 1
              },
              "rating": {
                "left": "30%",
                "top": 0,
                "width": "30%",
                "height": 1
              },
              "trackLabel": {
                "left": "60%",
                "top": 0,
                "width": "13%",
                "height": 1
              },
              "track": {
                "left": "73%",
                "top": 0,
                "width": "27%",
                "height": 1
              }
            },
            "pillar": "prime"
          },
          "noun": "Attribute",
          "plural": "Attributes",
          "traits": [
            {
              "name": "Brawn",
              "traits": []
            },
            {
              "name": "Endurance",
              "traits": []
            },
            {
              "name": "Grace",
              "traits": []
            },
            {
              "name": "Grit",
              "traits": []
            },
            {
              "name": "Mettle",
              "traits": []
            },
            {
              "name": "Smarts",
              "traits": []
            }
          ]
        },
        {
          "id": "subtrait-columns",
          "name": "Skills & Specialties",
          "description": "Black-ops competencies and d6 specialties",
          "view": {
            "header": "top",
            "headerAlign": "center",
            "traitColumns": 2,
            "features": {
              "description": false,
              "sfx": false,
              "subtraits": true
            },
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
            "notes": "",
            "reservedSlots": 19,
            "pillar": "prime"
          },
          "noun": "Skill",
          "plural": "Skills",
          "traits": [
            {
              "name": "Craft",
              "traits": []
            },
            {
              "name": "Drive",
              "traits": []
            },
            {
              "name": "Fight",
              "traits": []
            },
            {
              "name": "Fix",
              "traits": []
            },
            {
              "name": "Fly",
              "traits": []
            },
            {
              "name": "Focus",
              "traits": []
            },
            {
              "name": "Influence",
              "traits": []
            },
            {
              "name": "Know",
              "traits": []
            },
            {
              "name": "Labor",
              "traits": []
            },
            {
              "name": "Move",
              "traits": []
            },
            {
              "name": "Notice",
              "traits": []
            },
            {
              "name": "Operate",
              "traits": []
            },
            {
              "name": "Perform",
              "traits": []
            },
            {
              "name": "Shoot",
              "traits": []
            },
            {
              "name": "Sneak",
              "traits": []
            },
            {
              "name": "Survive",
              "traits": []
            },
            {
              "name": "Throw",
              "traits": []
            },
            {
              "name": "Treat",
              "traits": []
            },
            {
              "name": "Trick",
              "traits": []
            }
          ]
        },
        {
          "id": "signature-assets-gifts",
          "name": "Signature Assets",
          "description": "Classified spy gear and experimental equipment",
          "view": {
            "header": "top",
            "headerAlign": "center",
            "features": {
              "description": true,
              "sfx": false,
              "subtraits": false
            },
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
            "notes": "",
            "reservedSlots": 3,
            "place": {
              "left": "0%",
              "top": 3,
              "width": "35%",
              "height": 1
            },
            "parts": {
              "name": {
                "left": "0%",
                "top": 0,
                "width": "76%",
                "height": 1
              },
              "rating": {
                "left": "76%",
                "top": 0,
                "width": "24%",
                "height": 1
              },
              "description": {
                "left": "0%",
                "top": 1,
                "width": "100%",
                "height": 1
              }
            },
            "pillar": "plus"
          },
          "noun": "Signature Asset",
          "plural": "Signature Assets",
          "traits": []
        },
        {
          "id": "talents",
          "name": "Talents",
          "view": {
            "features": {
              "description": true,
              "sfx": true,
              "subtraits": false
            },
            "page": 1,
            "style": {
              "header": "three-column-table",
              "body": "three-column-table"
            },
            "reservedSlots": 3,
            "place": {
              "left": "35%",
              "top": 3,
              "width": "65%",
              "height": 1
            },
            "labels": {
              "col1": "TALENT",
              "col2": "ACTIVATION",
              "col3": "EFFECT"
            },
            "pillar": "plus"
          },
          "noun": "Talent",
          "plural": "Talents",
          "traits": []
        },
        {
          "id": "gifts",
          "name": "Gifts",
          "view": {
            "header": "top",
            "headerAlign": "center",
            "features": {
              "description": true,
              "sfx": false,
              "subtraits": false
            },
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
            "place": {
              "left": "0%",
              "top": 4,
              "width": "25%",
              "height": 1
            },
            "parts": {
              "name": {
                "left": "0%",
                "top": 0,
                "width": "100%",
                "height": 1
              },
              "rating": {
                "left": "0%",
                "top": 1,
                "width": "100%",
                "height": 1
              },
              "description": {
                "left": "0%",
                "top": 2,
                "width": "100%",
                "height": 1
              }
            },
            "pillar": "plus"
          },
          "noun": "Gift",
          "plural": "Gifts",
          "traits": [
            {
              "name": "Gift of",
              "traits": []
            },
            {
              "name": "Gift of~2",
              "traits": []
            }
          ]
        },
        {
          "id": "milestones",
          "name": "Milestones",
          "view": {
            "header": "top",
            "headerAlign": "center",
            "features": {
              "description": true,
              "sfx": false,
              "subtraits": false
            },
            "page": 1,
            "style": {
              "header": "default",
              "body": "default"
            },
            "multiDie": false,
            "ratingScale": [],
            "reservedSlots": 3,
            "place": {
              "left": "25%",
              "top": 4,
              "width": "50%",
              "height": 1
            },
            "parts": {
              "name": {
                "left": "0%",
                "top": 0,
                "width": "100%",
                "height": 1
              },
              "description": {
                "left": "0%",
                "top": 1,
                "width": "100%",
                "height": 1
              }
            },
            "pillar": "plus"
          },
          "noun": "Milestone",
          "plural": "Milestones",
          "traits": [
            {
              "name": "1 XP",
              "description": "when ",
              "traits": []
            },
            {
              "name": "3 XP",
              "description": "when ",
              "traits": []
            },
            {
              "name": "10 XP",
              "description": "when ",
              "traits": []
            }
          ]
        },
        {
          "id": "milestones-b",
          "name": "Milestones",
          "view": {
            "header": "top",
            "headerAlign": "center",
            "features": {
              "description": true,
              "sfx": false,
              "subtraits": false
            },
            "page": 1,
            "style": {
              "header": "default",
              "body": "default"
            },
            "multiDie": false,
            "ratingScale": [],
            "reservedSlots": 3,
            "place": {
              "left": "25%",
              "top": 5,
              "width": "50%",
              "height": 1
            },
            "parts": {
              "name": {
                "left": "0%",
                "top": 0,
                "width": "100%",
                "height": 1
              },
              "description": {
                "left": "0%",
                "top": 1,
                "width": "100%",
                "height": 1
              }
            },
            "pillar": "plus"
          },
          "noun": "Milestone",
          "plural": "Milestones",
          "traits": [
            {
              "name": "1 XP",
              "description": "when ",
              "traits": []
            },
            {
              "name": "3 XP",
              "description": "when ",
              "traits": []
            },
            {
              "name": "10 XP",
              "description": "when ",
              "traits": []
            }
          ]
        },
        {
          "id": "xp",
          "name": "XP",
          "view": {
            "features": {
              "description": false,
              "sfx": false,
              "subtraits": false
            },
            "page": 1,
            "style": {
              "header": "default",
              "body": "pips"
            },
            "pips": {
              "perRow": 4,
              "connected": false
            },
            "place": {
              "left": "75%",
              "top": 4,
              "width": "25%",
              "height": 1
            },
            "pillar": "play"
          },
          "rating": {
            "type": "Pip",
            "value": [
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
              false
            ]
          },
          "noun": "Pip",
          "plural": "Pips",
          "traits": []
        }
      ]
    }
  },
  {
    "id": "spotlight-solarpunk-citizen",
    "version": 1,
    "title": "Solarpunk",
    "subtitle": "Ecological Hope & Community Technology",
    "spotlight": "Solarpunk",
    "variant": "Citizen File",
    "pages": 1,
    "genre": "SolarPunk / Sci-Fi / Community",
    "listing": {
      "url": "https://legacy.drivethrurpg.com/product/568415/Solarpunk?manufacturers_id=31866",
      "quote": "The corporations took everything. The land, the water, the air.",
      "genre": "Near-future eco-punk / hopepunk",
      "setting": "d8",
      "prep": "d6",
      "complexity": "d8",
      "image": "https://legacy.drivethrurpg.com/images/31866/568415.jpg"
    },
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
      "player": "",
      "portrait": {
        "url": "",
        "view": {
          "size": "spotlight",
          "location": "header"
        }
      },
      "view": {
        "pageCount": 1,
        "spotlight": "SolarPunk",
        "style": {
          "sheet": "spotlight"
        },
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
      },
      "traitSets": [
        {
          "id": "name",
          "name": "Name",
          "view": {
            "style": {
              "header": "default",
              "body": "name"
            },
            "page": 1
          },
          "traits": [
            {
              "name": "name",
              "label": "Name",
              "traits": []
            },
            {
              "name": "player",
              "label": "Player",
              "traits": []
            },
            {
              "name": "nickname",
              "label": "Nickname",
              "traits": []
            },
            {
              "name": "pronouns",
              "label": "Pronouns",
              "traits": []
            },
            {
              "name": "description",
              "label": "Description",
              "traits": []
            },
            {
              "name": "game",
              "label": "Game",
              "view": {
                "visibility": "hidden"
              },
              "traits": []
            },
            {
              "name": "portrait",
              "traits": []
            },
            {
              "name": "caption",
              "traits": []
            },
            {
              "name": "plotPoints",
              "rating": {
                "type": "Counter",
                "value": [
                  1
                ],
                "range": [
                  0,
                  20
                ]
              },
              "label": "PP",
              "spendable": true,
              "view": {
                "visibility": "hidden"
              },
              "traits": []
            },
            {
              "name": "notes",
              "view": {
                "visibility": "hidden"
              },
              "traits": []
            }
          ]
        },
        {
          "id": "attributes",
          "name": "Attributes",
          "description": "SolarPunk holistic community attributes",
          "view": {
            "features": {
              "description": false,
              "sfx": false,
              "subtraits": false
            },
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
            "notes": "",
            "reservedSlots": 3,
            "ringTrait": false,
            "place": {
              "left": "0%",
              "top": 0,
              "width": "28%",
              "height": 1
            },
            "parts": {
              "name": {
                "left": "0%",
                "top": 0,
                "width": "100%",
                "height": 1
              },
              "rating": {
                "left": "0%",
                "top": 1,
                "width": "100%",
                "height": 1
              }
            },
            "pillar": "prime"
          },
          "noun": "Attribute",
          "plural": "Attributes",
          "traits": [
            {
              "name": "Mind",
              "traits": []
            },
            {
              "name": "Body",
              "traits": []
            },
            {
              "name": "Connection",
              "traits": []
            }
          ]
        },
        {
          "id": "session-record",
          "name": "Session Record",
          "view": {
            "features": {
              "description": false,
              "sfx": false,
              "subtraits": false
            },
            "page": 1,
            "style": {
              "header": "default",
              "body": "pips"
            },
            "pips": {
              "perRow": 5,
              "connected": true
            },
            "reservedSlots": 0,
            "place": {
              "left": "0%",
              "top": 1,
              "width": "28%",
              "height": 1
            },
            "pillar": "play"
          },
          "rating": {
            "type": "Pip",
            "value": [
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
              false
            ]
          },
          "noun": "Session",
          "plural": "Sessions",
          "traits": []
        },
        {
          "id": "distinctions",
          "name": "Distinctions",
          "description": "Ecological calling, community role, and personal purpose",
          "view": {
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
            "page": 1,
            "style": {
              "header": "sfx-rows",
              "body": "sfx-rows"
            },
            "multiDie": false,
            "notes": "",
            "reservedSlots": 3,
            "place": {
              "left": "28%",
              "top": 0,
              "width": "72%",
              "height": 1
            },
            "pillar": "prime"
          },
          "noun": "Distinction",
          "plural": "Distinctions",
          "traits": [
            {
              "name": "Identity:",
              "rating": {
                "type": "Die",
                "value": [
                  8
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "traits": [
                {
                  "name": "SFX",
                  "traits": [
                    {
                      "name": "Hinder",
                      "rating": { "type": "Die", "value": [4], "range": [4] },
                      "traits": []
                    }
                  ]
                }
              ]
            },
            {
              "name": "Community:",
              "rating": {
                "type": "Die",
                "value": [
                  8
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "traits": [
                {
                  "name": "SFX",
                  "traits": [
                    {
                      "name": "Hinder",
                      "rating": { "type": "Die", "value": [4], "range": [4] },
                      "traits": []
                    }
                  ]
                }
              ]
            },
            {
              "name": "Purpose:",
              "rating": {
                "type": "Die",
                "value": [
                  8
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "traits": [
                {
                  "name": "SFX",
                  "traits": [
                    {
                      "name": "Hinder",
                      "rating": { "type": "Die", "value": [4], "range": [4] },
                      "traits": []
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "id": "signature-assets",
          "name": "Signature Assets",
          "description": "Sustainable tech, tools, and eco-craft",
          "view": {
            "header": "top",
            "headerAlign": "center",
            "traitColumns": 2,
            "features": {
              "description": true,
              "sfx": true,
              "subtraits": false
            },
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
            "notes": "",
            "reservedSlots": 2,
            "parts": {
              "name": {
                "left": "0%",
                "top": 0,
                "width": "76%",
                "height": 1
              },
              "rating": {
                "left": "76%",
                "top": 0,
                "width": "24%",
                "height": 1
              },
              "description": {
                "left": "0%",
                "top": 1,
                "width": "100%",
                "height": 1
              },
              "block": {
                "left": "0%",
                "top": 2,
                "width": "100%",
                "height": 1
              }
            },
            "pillar": "plus"
          },
          "noun": "Signature Asset",
          "plural": "Signature Assets",
          "traits": []
        },
        {
          "id": "subtrait-columns",
          "name": "Skills & Specialties",
          "description": "Ecological competencies (d4-d12) and d6 craft specialties",
          "view": {
            "header": "top",
            "headerAlign": "center",
            "traitColumns": 2,
            "features": {
              "description": false,
              "sfx": false,
              "subtraits": true
            },
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
            "subtraitRatingScale": [
              6
            ],
            "multiDie": false,
            "notes": "",
            "reservedSlots": 19,
            "labels": {
              "left": "SKILL",
              "right": "SPECIALTIES"
            },
            "pillar": "prime"
          },
          "noun": "Skill",
          "plural": "Skills",
          "traits": [
            {
              "name": "Craft",
              "traits": []
            },
            {
              "name": "Drive",
              "traits": []
            },
            {
              "name": "Fight",
              "traits": []
            },
            {
              "name": "Fix",
              "traits": []
            },
            {
              "name": "Fly",
              "traits": []
            },
            {
              "name": "Focus",
              "traits": []
            },
            {
              "name": "Influence",
              "traits": []
            },
            {
              "name": "Know",
              "traits": []
            },
            {
              "name": "Labor",
              "traits": []
            },
            {
              "name": "Move",
              "traits": []
            },
            {
              "name": "Notice",
              "traits": []
            },
            {
              "name": "Operate",
              "traits": []
            },
            {
              "name": "Perform",
              "traits": []
            },
            {
              "name": "Shoot",
              "traits": []
            },
            {
              "name": "Sneak",
              "traits": []
            },
            {
              "name": "Survive",
              "traits": []
            },
            {
              "name": "Throw",
              "traits": []
            },
            {
              "name": "Treat",
              "traits": []
            },
            {
              "name": "Trick",
              "traits": []
            }
          ]
        }
      ]
    }
  },
  {
    "id": "spotlight-solarpunk-commune",
    "version": 1,
    "title": "Solarpunk - Commune File",
    "subtitle": "Ecological Hope & Community Technology",
    "spotlight": "Solarpunk",
    "variant": "Commune File",
    "pages": 1,
    "genre": "SolarPunk / Settlement",
    "listing": {
      "url": "https://legacy.drivethrurpg.com/product/568415/Solarpunk?manufacturers_id=31866",
      "quote": "The corporations took everything. The land, the water, the air.",
      "genre": "Near-future eco-punk / hopepunk",
      "setting": "d8",
      "prep": "d6",
      "complexity": "d8",
      "image": "https://legacy.drivethrurpg.com/images/31866/568415.jpg"
    },
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
      "player": "",
      "portrait": {
        "url": "",
        "view": {
          "size": "spotlight",
          "location": "header"
        }
      },
      "view": {
        "pageCount": 1,
        "spotlight": "SolarPunk",
        "style": {
          "sheet": "spotlight"
        },
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
      },
      "traitSets": [
        {
          "id": "name",
          "name": "Name",
          "view": {
            "style": {
              "header": "default",
              "body": "name"
            },
            "page": 1
          },
          "traits": [
            {
              "name": "name",
              "label": "Name",
              "traits": []
            },
            {
              "name": "player",
              "label": "Player",
              "traits": []
            },
            {
              "name": "nickname",
              "label": "Nickname",
              "traits": []
            },
            {
              "name": "pronouns",
              "label": "Pronouns",
              "traits": []
            },
            {
              "name": "description",
              "label": "Description",
              "traits": []
            },
            {
              "name": "game",
              "label": "Game",
              "view": {
                "visibility": "hidden"
              },
              "traits": []
            },
            {
              "name": "portrait",
              "traits": []
            },
            {
              "name": "caption",
              "traits": []
            },
            {
              "name": "plotPoints",
              "rating": {
                "type": "Counter",
                "value": [
                  1
                ],
                "range": [
                  0,
                  20
                ]
              },
              "label": "PP",
              "spendable": true,
              "view": {
                "visibility": "hidden"
              },
              "traits": []
            },
            {
              "name": "notes",
              "view": {
                "visibility": "hidden"
              },
              "traits": []
            }
          ]
        },
        {
          "id": "commune-attributes",
          "name": "Attributes",
          "description": "Collective settlement strengths",
          "view": {
            "features": {
              "description": false,
              "sfx": false,
              "subtraits": false
            },
            "page": 1,
            "style": {
              "header": "default",
              "body": "default"
            },
            "ratingScale": [
              4,
              6,
              8
            ],
            "multiDie": false,
            "notes": "",
            "reservedSlots": 3,
            "ringTrait": false,
            "place": {
              "left": "0%",
              "top": 0,
              "width": "28%",
              "height": 1
            },
            "parts": {
              "name": {
                "left": "0%",
                "top": 0,
                "width": "100%",
                "height": 1
              },
              "rating": {
                "left": "0%",
                "top": 1,
                "width": "100%",
                "height": 1
              }
            },
            "pillar": "prime"
          },
          "noun": "Attribute",
          "plural": "Attributes",
          "traits": [
            {
              "name": "Resources",
              "traits": []
            },
            {
              "name": "Security",
              "traits": []
            },
            {
              "name": "Connections",
              "traits": []
            }
          ]
        },
        {
          "id": "commune-distinctions",
          "name": "Distinctions",
          "description": "Settlement unity, organization, and morale",
          "view": {
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
            "page": 1,
            "style": {
              "header": "sfx-rows",
              "body": "sfx-rows"
            },
            "multiDie": false,
            "notes": "",
            "reservedSlots": 3,
            "place": {
              "left": "28%",
              "top": 0,
              "width": "72%",
              "height": 1
            },
            "pillar": "prime"
          },
          "noun": "Distinction",
          "plural": "Distinctions",
          "traits": [
            {
              "name": "Unity:",
              "rating": {
                "type": "Die",
                "value": [
                  8
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "traits": [
                {
                  "name": "SFX",
                  "traits": [
                    {
                      "name": "Hinder",
                      "rating": { "type": "Die", "value": [4], "range": [4] },
                      "traits": []
                    }
                  ]
                }
              ]
            },
            {
              "name": "Organization:",
              "rating": {
                "type": "Die",
                "value": [
                  8
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "traits": [
                {
                  "name": "SFX",
                  "traits": [
                    {
                      "name": "Hinder",
                      "rating": { "type": "Die", "value": [4], "range": [4] },
                      "traits": []
                    }
                  ]
                }
              ]
            },
            {
              "name": "Morale:",
              "rating": {
                "type": "Die",
                "value": [
                  8
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "traits": [
                {
                  "name": "SFX",
                  "traits": [
                    {
                      "name": "Hinder",
                      "rating": { "type": "Die", "value": [4], "range": [4] },
                      "traits": []
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "id": "signature-assets",
          "name": "Signature Assets",
          "view": {
            "header": "top",
            "headerAlign": "center",
            "traitColumns": 2,
            "features": {
              "description": true,
              "sfx": false,
              "subtraits": false
            },
            "page": 1,
            "style": {
              "header": "default",
              "body": "default"
            },
            "ratingScale": [
              6
            ],
            "reservedSlots": 4,
            "parts": {
              "name": {
                "left": "0%",
                "top": 0,
                "width": "94%",
                "height": 1
              },
              "rating": {
                "left": "94%",
                "top": 0,
                "width": "6%",
                "height": 1
              },
              "description": {
                "left": "0%",
                "top": 1,
                "width": "100%",
                "height": 1
              }
            },
            "pillar": "plus"
          },
          "noun": "Asset",
          "plural": "Assets",
          "traits": [
            {
              "name": "",
              "rating": {
                "type": "Die",
                "value": [
                  6
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "traits": []
            },
            {
              "name": "",
              "rating": {
                "type": "Die",
                "value": [
                  6
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "traits": []
            },
            {
              "name": "",
              "rating": {
                "type": "Die",
                "value": [
                  6
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "traits": []
            },
            {
              "name": "",
              "rating": {
                "type": "Die",
                "value": [
                  6
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "traits": []
            }
          ]
        },
        {
          "id": "skills",
          "name": "Skills",
          "view": {
            "header": "top",
            "headerAlign": "left",
            "features": {
              "description": false,
              "sfx": false,
              "subtraits": true
            },
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
            "labels": {
              "left": "SKILL",
              "right": "SPECIALTIES"
            },
            "pillar": "prime"
          },
          "noun": "Skill",
          "plural": "Skills",
          "traits": []
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
    "listing": {
      "url": "https://legacy.drivethrurpg.com/product/572310/Spellcaught?manufacturers_id=31866",
      "quote": "High school is already a crucible. Add magic, and someone’s going to get burned.",
      "genre": "Teenage witches / high school drama",
      "setting": "d6",
      "prep": "d6",
      "complexity": "d8",
      "image": "https://legacy.drivethrurpg.com/images/31866/572310.jpg"
    },
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
      "player": "",
      "portrait": {
        "url": "",
        "view": {
          "size": "spotlight",
          "location": "header"
        }
      },
      "view": {
        "pageCount": 1,
        "spotlight": "Spellcaught",
        "style": {
          "sheet": "spotlight"
        },
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
      },
      "traitSets": [
        {
          "id": "name",
          "name": "Name",
          "view": {
            "style": {
              "header": "default",
              "body": "name"
            },
            "page": 1
          },
          "traits": [
            {
              "name": "name",
              "label": "Name",
              "traits": []
            },
            {
              "name": "player",
              "label": "Player",
              "traits": []
            },
            {
              "name": "nickname",
              "label": "Nickname",
              "traits": []
            },
            {
              "name": "pronouns",
              "label": "Pronouns",
              "traits": []
            },
            {
              "name": "description",
              "label": "Description",
              "traits": []
            },
            {
              "name": "game",
              "label": "Game",
              "view": {
                "visibility": "hidden"
              },
              "traits": []
            },
            {
              "name": "portrait",
              "traits": []
            },
            {
              "name": "caption",
              "traits": []
            },
            {
              "name": "plotPoints",
              "rating": {
                "type": "Counter",
                "value": [
                  1
                ],
                "range": [
                  0,
                  20
                ]
              },
              "label": "PP",
              "spendable": true,
              "view": {
                "visibility": "hidden"
              },
              "traits": []
            },
            {
              "name": "notes",
              "view": {
                "visibility": "hidden"
              },
              "traits": []
            }
          ]
        },
        {
          "id": "growth-pool",
          "name": "Growth Pool",
          "view": {
            "features": {
              "description": false,
              "sfx": false,
              "subtraits": false
            },
            "page": 1,
            "style": {
              "header": "default",
              "body": "dice-count"
            },
            "ratingScale": [
              4,
              6,
              8,
              10,
              12
            ],
            "multiDie": true,
            "reservedSlots": 5,
            "place": {
              "left": "0%",
              "top": 0,
              "width": "22%",
              "height": 1
            },
            "labels": {
              "rating": "RATING",
              "dice": "/ DICE"
            },
            "pillar": "play"
          },
          "pool": true,
          "noun": "Growth Die",
          "plural": "Growth Dice",
          "traits": [
            {
              "name": "D4",
              "rating": {
                "type": "Die",
                "value": [
                  4
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "spendable": true,
              "hitches": 0,
              "view": {
                "poolCount": 1
              },
              "traits": []
            },
            {
              "name": "D6",
              "rating": {
                "type": "Die",
                "value": [
                  6
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "spendable": true,
              "hitches": 0,
              "view": {
                "poolCount": 1
              },
              "traits": []
            },
            {
              "name": "D8",
              "rating": {
                "type": "Die",
                "value": [
                  8
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "spendable": true,
              "hitches": 0,
              "view": {
                "poolCount": 1
              },
              "traits": []
            },
            {
              "name": "D10",
              "rating": {
                "type": "Die",
                "value": [
                  10
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "spendable": true,
              "hitches": 0,
              "view": {
                "poolCount": 1
              },
              "traits": []
            },
            {
              "name": "D12",
              "rating": {
                "type": "Die",
                "value": [
                  12
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "spendable": true,
              "hitches": 0,
              "view": {
                "poolCount": 1
              },
              "traits": []
            }
          ]
        },
        {
          "id": "distinctions",
          "name": "Distinctions",
          "description": "Origin of the magical calamity and personal burden",
          "view": {
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
            "page": 1,
            "style": {
              "header": "sfx-rows",
              "body": "sfx-rows"
            },
            "multiDie": false,
            "notes": "",
            "reservedSlots": 3,
            "place": {
              "left": "22%",
              "top": 0,
              "width": "78%",
              "height": 1
            },
            "pillar": "prime"
          },
          "noun": "Distinction",
          "plural": "Distinctions",
          "traits": [
            {
              "name": "",
              "rating": {
                "type": "Die",
                "value": [
                  8
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "traits": [
                {
                  "name": "SFX",
                  "traits": [
                    {
                      "name": "Hinder",
                      "rating": { "type": "Die", "value": [4], "range": [4] },
                      "traits": []
                    }
                  ]
                }
              ]
            },
            {
              "name": "",
              "rating": {
                "type": "Die",
                "value": [
                  8
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "traits": [
                {
                  "name": "SFX",
                  "traits": [
                    {
                      "name": "Hinder",
                      "rating": { "type": "Die", "value": [4], "range": [4] },
                      "traits": []
                    }
                  ]
                }
              ]
            },
            {
              "name": "",
              "rating": {
                "type": "Die",
                "value": [
                  8
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "traits": [
                {
                  "name": "SFX",
                  "traits": [
                    {
                      "name": "Hinder",
                      "rating": { "type": "Die", "value": [4], "range": [4] },
                      "traits": []
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "id": "values",
          "name": "Values",
          "description": "Gain a PP when you use your d4 value.",
          "statement": true,
          "view": {
            "features": {
              "description": true,
              "sfx": false,
              "subtraits": false
            },
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
            "notes": "",
            "reservedSlots": 6,
            "place": {
              "left": "0%",
              "top": 1,
              "width": "61%",
              "height": 1
            },
            "parts": {
              "name": {
                "left": "0%",
                "top": 0,
                "width": "70%",
                "height": 1
              },
              "rating": {
                "left": "70%",
                "top": 0,
                "width": "30%",
                "height": 1
              }
            },
            "pillar": "prime"
          },
          "noun": "Value",
          "plural": "Values",
          "traits": [
            {
              "name": "Ambition",
              "traits": []
            },
            {
              "name": "Responsibility",
              "traits": []
            },
            {
              "name": "Belonging",
              "traits": []
            },
            {
              "name": "Popularity",
              "traits": []
            },
            {
              "name": "Empathy",
              "traits": []
            },
            {
              "name": "Secrecy",
              "traits": []
            }
          ]
        },
        {
          "id": "signature-assets",
          "name": "Signature Assets",
          "view": {
            "features": {
              "description": true,
              "sfx": false,
              "subtraits": false
            },
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
            "reservedSlots": 6,
            "place": {
              "left": "61%",
              "top": 1,
              "width": "39%",
              "height": 1
            },
            "parts": {
              "rating": {
                "left": "0%",
                "top": 0,
                "width": "100%",
                "height": 1
              },
              "name": {
                "left": "0%",
                "top": 1,
                "width": "100%",
                "height": 1
              }
            },
            "pillar": "plus"
          },
          "noun": "Asset",
          "plural": "Assets",
          "traits": []
        },
        {
          "id": "affiliations",
          "name": "Affiliations",
          "description": "When Worlds Collide: When two affiliations are in the same scene, add a d6 to the doom pool and a d4 to your dice pool to include both affiliations in your pool.",
          "statement": true,
          "view": {
            "features": {
              "description": true,
              "sfx": false,
              "subtraits": false
            },
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
            "notes": "",
            "reservedSlots": 4,
            "place": {
              "left": "0%",
              "top": 2,
              "width": "100%",
              "height": 1
            },
            "parts": {
              "name": {
                "left": "0%",
                "top": 0,
                "width": "70%",
                "height": 1
              },
              "rating": {
                "left": "70%",
                "top": 0,
                "width": "30%",
                "height": 1
              }
            },
            "pillar": "prime"
          },
          "noun": "Affiliation",
          "plural": "Affiliations",
          "traits": [
            {
              "name": "Self",
              "traits": []
            },
            {
              "name": "Family",
              "traits": []
            },
            {
              "name": "School",
              "traits": []
            },
            {
              "name": "Coven",
              "traits": []
            }
          ]
        },
        {
          "id": "stress",
          "name": "Stress",
          "view": {
            "header": "top",
            "headerAlign": "left",
            "features": {
              "description": false,
              "sfx": false,
              "subtraits": false
            },
            "page": 1,
            "style": {
              "header": "die-track",
              "body": "die-track"
            },
            "ratingScale": [
              4,
              6,
              8,
              10,
              12
            ],
            "reservedSlots": 5,
            "place": {
              "left": "0%",
              "top": 3,
              "width": "24%",
              "height": 1
            },
            "parts": {
              "name": {
                "left": "0%",
                "top": 0,
                "width": "100%",
                "height": 1
              },
              "rating": {
                "left": "0%",
                "top": 1,
                "width": "100%",
                "height": 1
              }
            },
            "pillar": "play"
          },
          "noun": "Stress",
          "plural": "Stress",
          "traits": [
            {
              "name": "Angry",
              "traits": []
            },
            {
              "name": "Depressed",
              "traits": []
            },
            {
              "name": "Exhausted",
              "traits": []
            },
            {
              "name": "Insecure",
              "traits": []
            },
            {
              "name": "Injured",
              "traits": []
            }
          ]
        },
        {
          "id": "arcane-crafts-sfx",
          "name": "Crafts",
          "description": "Mutated magical expressions and spellcasting disciplines",
          "view": {
            "features": {
              "description": false,
              "sfx": false,
              "subtraits": false
            },
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
            "notes": "",
            "reservedSlots": 10,
            "place": {
              "left": "24%",
              "top": 3,
              "width": "48%",
              "height": 1
            },
            "pillar": "plus"
          },
          "noun": "Craft",
          "plural": "Crafts",
          "traits": [
            {
              "name": "Azure Sympathy",
              "traits": []
            },
            {
              "name": "Black Wards",
              "traits": []
            },
            {
              "name": "Bronze Mending",
              "traits": []
            },
            {
              "name": "Crimson Passion",
              "traits": []
            },
            {
              "name": "Golden Inspiration",
              "traits": []
            },
            {
              "name": "Orange Flare",
              "traits": []
            },
            {
              "name": "Pink Fidelity",
              "traits": []
            },
            {
              "name": "Purple Veils",
              "traits": []
            },
            {
              "name": "Verdant Conjuration",
              "traits": []
            },
            {
              "name": "White Purification",
              "traits": []
            }
          ]
        },
        {
          "id": "sfx",
          "name": "SFX",
          "view": {
            "place": {
              "left": "72%",
              "top": 3,
              "width": "28%",
              "height": 1
            },
            "parts": {
              "rating": {
                "left": "0%",
                "top": 0,
                "width": "100%",
                "height": 1
              },
              "name": {
                "left": "0%",
                "top": 1,
                "width": "100%",
                "height": 1
              }
            },
            "reservedSlots": 4,
            "pillar": "plus"
          },
          "noun": "SFX",
          "plural": "SFX",
          "traits": []
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
    "listing": {
      "url": "https://legacy.drivethrurpg.com/product/567043/Strange-Towns?manufacturers_id=31866",
      "quote": "There’s something wrong with this town. Maybe it’s the sheriff who never blinks.",
      "genre": "Weird horror / small-town mystery",
      "setting": "d6",
      "prep": "d6",
      "complexity": "d6",
      "image": "https://legacy.drivethrurpg.com/images/31866/567043.jpg"
    },
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
      "player": "",
      "portrait": {
        "url": "",
        "view": {
          "size": "spotlight",
          "location": "header"
        }
      },
      "view": {
        "pageCount": 1,
        "spotlight": "Strange Towns",
        "style": {
          "sheet": "spotlight"
        },
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
      },
      "traitSets": [
        {
          "id": "name",
          "name": "Name",
          "view": {
            "style": {
              "header": "default",
              "body": "name"
            },
            "page": 1
          },
          "traits": [
            {
              "name": "name",
              "label": "Name",
              "traits": []
            },
            {
              "name": "player",
              "label": "Player",
              "traits": []
            },
            {
              "name": "nickname",
              "label": "Nickname",
              "traits": []
            },
            {
              "name": "pronouns",
              "label": "Ruin",
              "traits": []
            },
            {
              "name": "description",
              "label": "Description",
              "traits": []
            },
            {
              "name": "game",
              "label": "Game",
              "view": {
                "visibility": "hidden"
              },
              "traits": []
            },
            {
              "name": "portrait",
              "traits": []
            },
            {
              "name": "caption",
              "traits": []
            },
            {
              "name": "plotPoints",
              "rating": {
                "type": "Counter",
                "value": [
                  1
                ],
                "range": [
                  0,
                  20
                ]
              },
              "label": "PP",
              "spendable": true,
              "view": {
                "visibility": "hidden"
              },
              "traits": []
            },
            {
              "name": "notes",
              "view": {
                "visibility": "hidden"
              },
              "traits": []
            }
          ]
        },
        {
          "id": "attributes",
          "name": "Attributes",
          "description": "Core attributes",
          "view": {
            "features": {
              "description": false,
              "sfx": false,
              "subtraits": false
            },
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
            "multiDie": false,
            "notes": "",
            "reservedSlots": 3,
            "ringTrait": false,
            "place": {
              "left": "0%",
              "top": 0,
              "width": "28%",
              "height": 1
            },
            "parts": {
              "name": {
                "left": "0%",
                "top": 0,
                "width": "100%",
                "height": 1
              },
              "rating": {
                "left": "0%",
                "top": 1,
                "width": "100%",
                "height": 1
              }
            },
            "pillar": "prime"
          },
          "noun": "Attribute",
          "plural": "Attributes",
          "traits": [
            {
              "name": "Mental",
              "traits": []
            },
            {
              "name": "Physical",
              "traits": []
            },
            {
              "name": "Social",
              "traits": []
            }
          ]
        },
        {
          "id": "distinctions",
          "name": "Distinctions",
          "description": "Mundane, Offbeat, and Strange facets of town life",
          "view": {
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
            "page": 1,
            "style": {
              "header": "sfx-rows",
              "body": "sfx-rows"
            },
            "multiDie": false,
            "reservedSlots": 3,
            "place": {
              "left": "28%",
              "top": 0,
              "width": "72%",
              "height": 1
            },
            "pillar": "prime"
          },
          "noun": "Distinction",
          "plural": "Distinctions",
          "traits": []
        },
        {
          "id": "roles",
          "name": "Roles",
          "description": "Town archetypes and societal roles",
          "view": {
            "features": {
              "description": false,
              "sfx": false,
              "subtraits": false
            },
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
            "notes": "",
            "reservedSlots": 6,
            "place": {
              "left": "0%",
              "top": 1,
              "width": "28%",
              "height": 1
            },
            "parts": {
              "name": {
                "left": "0%",
                "top": 0,
                "width": "100%",
                "height": 1
              },
              "rating": {
                "left": "0%",
                "top": 1,
                "width": "100%",
                "height": 1
              }
            },
            "pillar": "prime"
          },
          "noun": "Role",
          "plural": "Roles",
          "traits": [
            {
              "name": "Enforcer",
              "traits": []
            },
            {
              "name": "Entrepreneur",
              "traits": []
            },
            {
              "name": "Rebel",
              "traits": []
            },
            {
              "name": "Sage",
              "traits": []
            },
            {
              "name": "Shepherd",
              "traits": []
            },
            {
              "name": "Townie",
              "traits": []
            }
          ]
        },
        {
          "id": "relationships-strange-die",
          "name": "Relationships",
          "description": "Bonds and ties within the town",
          "view": {
            "features": {
              "description": false,
              "sfx": false,
              "subtraits": false
            },
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
            "reservedSlots": 6,
            "place": {
              "left": "28%",
              "top": 1,
              "width": "72%",
              "height": 1
            },
            "pillar": "prime"
          },
          "noun": "Relationship",
          "plural": "Relationships",
          "traits": []
        },
        {
          "id": "signature-assets",
          "name": "Signature Assets",
          "view": {
            "features": {
              "description": true,
              "sfx": false,
              "subtraits": false
            },
            "page": 1,
            "style": {
              "header": "default",
              "body": "default"
            },
            "ratingScale": [
              8
            ],
            "reservedSlots": 2,
            "place": {
              "left": "0%",
              "top": 2,
              "width": "25%",
              "height": 1
            },
            "parts": {
              "name": {
                "left": "0%",
                "top": 0,
                "width": "100%",
                "height": 1
              },
              "rating": {
                "left": "0%",
                "top": 1,
                "width": "100%",
                "height": 1
              },
              "description": {
                "left": "0%",
                "top": 2,
                "width": "100%",
                "height": 1
              }
            },
            "pillar": "plus"
          },
          "noun": "Asset",
          "plural": "Assets",
          "traits": [
            {
              "name": "",
              "rating": {
                "type": "Die",
                "value": [
                  8
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "traits": []
            },
            {
              "name": "",
              "rating": {
                "type": "Die",
                "value": [
                  8
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "traits": []
            }
          ]
        },
        {
          "id": "complications",
          "name": "Complications",
          "view": {
            "features": {
              "description": true,
              "sfx": false,
              "subtraits": false
            },
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
            "reservedSlots": 3,
            "place": {
              "left": "25%",
              "top": 2,
              "width": "50%",
              "height": 1
            },
            "parts": {
              "name": {
                "left": "0%",
                "top": 0,
                "width": "100%",
                "height": 1
              },
              "rating": {
                "left": "0%",
                "top": 1,
                "width": "100%",
                "height": 1
              },
              "description": {
                "left": "0%",
                "top": 2,
                "width": "100%",
                "height": 1
              }
            },
            "playMutable": true,
            "pillar": "play"
          },
          "noun": "Complication",
          "plural": "Complications",
          "traits": []
        },
        {
          "id": "strange-die",
          "name": "Strange Die",
          "view": {
            "features": {
              "description": false,
              "sfx": false,
              "subtraits": false
            },
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
            "reservedSlots": 1,
            "place": {
              "left": "75%",
              "top": 2,
              "width": "25%",
              "height": 1
            },
            "pillar": "plus"
          },
          "noun": "Die",
          "plural": "Dice",
          "traits": []
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
    "listing": {
      "url": "https://legacy.drivethrurpg.com/product/567047/Terraverse?manufacturers_id=31866",
      "quote": "Every world is a version of this one. Some are close — a step to the left, a slightly different history.",
      "genre": "Science fantasy / multiverse adventure",
      "setting": "d10",
      "prep": "d10",
      "complexity": "d10",
      "image": "https://legacy.drivethrurpg.com/images/31866/567047.jpg"
    },
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
      "player": "",
      "portrait": {
        "url": "",
        "view": {
          "size": "spotlight",
          "location": "header"
        }
      },
      "view": {
        "pageCount": 2,
        "spotlight": "Terraverse",
        "style": {
          "sheet": "spotlight"
        },
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
      },
      "traitSets": [
        {
          "id": "name",
          "name": "Name",
          "view": {
            "style": {
              "header": "default",
              "body": "name"
            },
            "page": 1
          },
          "traits": [
            {
              "name": "name",
              "label": "Name",
              "traits": []
            },
            {
              "name": "player",
              "label": "Player",
              "traits": []
            },
            {
              "name": "nickname",
              "label": "Nickname",
              "traits": []
            },
            {
              "name": "pronouns",
              "label": "Pronouns",
              "traits": []
            },
            {
              "name": "description",
              "label": "Description",
              "traits": []
            },
            {
              "name": "game",
              "label": "Game",
              "view": {
                "visibility": "hidden"
              },
              "traits": []
            },
            {
              "name": "portrait",
              "traits": []
            },
            {
              "name": "caption",
              "traits": []
            },
            {
              "name": "plotPoints",
              "rating": {
                "type": "Counter",
                "value": [
                  1
                ],
                "range": [
                  0,
                  20
                ]
              },
              "label": "PP",
              "spendable": true,
              "view": {
                "visibility": "hidden"
              },
              "traits": []
            },
            {
              "name": "notes",
              "view": {
                "visibility": "hidden"
              },
              "traits": []
            }
          ]
        },
        {
          "id": "attributes",
          "name": "Attributes",
          "description": "Core hero ratings with Vitality and Willpower",
          "view": {
            "features": {
              "description": false,
              "sfx": false,
              "subtraits": false
            },
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
            "notes": "",
            "reservedSlots": 6,
            "ringTrait": false,
            "place": {
              "left": "0%",
              "top": 0,
              "width": "28%",
              "height": 1
            },
            "parts": {
              "name": {
                "left": "0%",
                "top": 0,
                "width": "100%",
                "height": 1
              },
              "rating": {
                "left": "0%",
                "top": 1,
                "width": "100%",
                "height": 1
              }
            },
            "pillar": "prime"
          },
          "noun": "Attribute",
          "plural": "Attributes",
          "traits": [
            {
              "name": "Agility",
              "traits": []
            },
            {
              "name": "Alertness",
              "traits": []
            },
            {
              "name": "Intelligence",
              "traits": []
            },
            {
              "name": "Strength",
              "traits": []
            },
            {
              "name": "Vitality",
              "traits": []
            },
            {
              "name": "Willpower",
              "traits": []
            }
          ]
        },
        {
          "id": "distinctions",
          "name": "Distinctions",
          "description": "Multiversal origin, champion archetype, and personal drive",
          "view": {
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
            "page": 1,
            "style": {
              "header": "sfx-rows",
              "body": "sfx-rows"
            },
            "multiDie": false,
            "reservedSlots": 6,
            "place": {
              "left": "28%",
              "top": 0,
              "width": "72%",
              "height": 1
            },
            "pillar": "prime"
          },
          "noun": "Distinction",
          "plural": "Distinctions",
          "traits": [
            {
              "name": "",
              "rating": {
                "type": "Die",
                "value": [
                  8
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "traits": [
                {
                  "name": "SFX",
                  "traits": [
                    {
                      "name": "Hinder",
                      "rating": { "type": "Die", "value": [4], "range": [4] },
                      "traits": []
                    }
                  ]
                }
              ]
            },
            {
              "name": "",
              "rating": {
                "type": "Die",
                "value": [
                  8
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "traits": [
                {
                  "name": "SFX",
                  "traits": [
                    {
                      "name": "Hinder",
                      "rating": { "type": "Die", "value": [4], "range": [4] },
                      "traits": []
                    }
                  ]
                }
              ]
            },
            {
              "name": "",
              "rating": {
                "type": "Die",
                "value": [
                  8
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "traits": [
                {
                  "name": "SFX",
                  "traits": [
                    {
                      "name": "Hinder",
                      "rating": { "type": "Die", "value": [4], "range": [4] },
                      "traits": []
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "id": "signature-assets",
          "name": "Signature Assets",
          "description": "Artifacts and multiversal gear",
          "view": {
            "features": {
              "description": false,
              "sfx": false,
              "subtraits": false
            },
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
            "notes": "",
            "reservedSlots": 4,
            "place": {
              "left": "0%",
              "top": 1,
              "width": "28%",
              "height": 1
            },
            "pillar": "plus"
          },
          "noun": "Signature Asset",
          "plural": "Signature Assets",
          "traits": []
        },
        {
          "id": "subtrait-columns",
          "name": "Skills & Specialties",
          "description": "Multiverse capabilities (d4-d6) and specialized proficiencies (d8-d12)",
          "view": {
            "header": "top",
            "headerAlign": "center",
            "features": {
              "description": false,
              "sfx": false,
              "subtraits": true
            },
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
            "reservedSlots": 19,
            "place": {
              "left": "28%",
              "top": 1,
              "width": "72%",
              "height": 1
            },
            "pillar": "prime"
          },
          "noun": "Skill",
          "plural": "Skills",
          "traits": [
            {
              "name": "Craft",
              "traits": []
            },
            {
              "name": "Drive",
              "traits": []
            },
            {
              "name": "Fight",
              "traits": []
            },
            {
              "name": "Fix",
              "traits": []
            },
            {
              "name": "Fly",
              "traits": []
            },
            {
              "name": "Focus",
              "traits": []
            },
            {
              "name": "Influence",
              "traits": []
            },
            {
              "name": "Know",
              "traits": []
            },
            {
              "name": "Labor",
              "traits": []
            },
            {
              "name": "Move",
              "traits": []
            },
            {
              "name": "Notice",
              "traits": []
            },
            {
              "name": "Operate",
              "traits": []
            },
            {
              "name": "Perform",
              "traits": []
            },
            {
              "name": "Shoot",
              "traits": []
            },
            {
              "name": "Sneak",
              "traits": []
            },
            {
              "name": "Survive",
              "traits": []
            },
            {
              "name": "Throw",
              "traits": []
            },
            {
              "name": "Treat",
              "traits": []
            },
            {
              "name": "Trick",
              "traits": []
            }
          ]
        },
        {
          "id": "initiative",
          "name": "Initiative",
          "ratingPosition": "vertical",
          "view": {
            "features": {
              "description": false,
              "sfx": false,
              "subtraits": false
            },
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
            "labelPosition": "vertical",
            "reservedSlots": 2,
            "place": {
              "left": "0%",
              "top": 2,
              "width": "50%",
              "height": 1
            },
            "pillar": "plus"
          },
          "noun": "Die",
          "plural": "Dice",
          "traits": []
        },
        {
          "id": "hero-dice",
          "name": "Hero Dice",
          "ratingPosition": "vertical",
          "view": {
            "features": {
              "description": false,
              "sfx": false,
              "subtraits": false
            },
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
            "labelPosition": "vertical",
            "reservedSlots": 1,
            "place": {
              "left": "0%",
              "top": 3,
              "width": "50%",
              "height": 1
            },
            "pillar": "plus"
          },
          "noun": "Die",
          "plural": "Dice",
          "traits": []
        },
        {
          "id": "life-points",
          "name": "Life Points",
          "description": "Vitality (12 → 1, Injured!) • Ø • Willpower (1 → 12, Dazed!)",
          "view": {
            "header": "top",
            "headerAlign": "left",
            "features": {
              "description": false,
              "sfx": false,
              "subtraits": false
            },
            "page": 1,
            "style": {
              "header": "default",
              "body": "pips"
            },
            "pips": {
              "perRow": 12,
              "connected": true
            },
            "pillar": "play"
          },
          "rating": {
            "type": "Pip",
            "value": [
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
              false
            ]
          },
          "noun": "Point",
          "plural": "Points",
          "traits": []
        },
        {
          "id": "power-set-1",
          "name": "Power Set 1",
          "description": "SFX: • SFX: • Limit:",
          "view": {
            "header": "top",
            "headerAlign": "center",
            "features": {
              "description": true,
              "sfx": true,
              "subtraits": false
            },
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
            "notes": "",
            "reservedSlots": 3,
            "place": {
              "left": "0%",
              "top": 0,
              "width": "33.333%",
              "height": 1
            },
            "pillar": "plus"
          },
          "noun": "Power",
          "plural": "Powers",
          "traits": [
            {
              "name": "",
              "traits": [
                {
                  "name": "SFX",
                  "traits": [
                    {
                      "name": "SFX 1",
                      "traits": []
                    },
                    {
                      "name": "SFX 2",
                      "traits": []
                    },
                    {
                      "name": "Limit",
                      "traits": []
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "id": "power-set-2",
          "name": "Power Set 2",
          "description": "SFX: • SFX: • Limit:",
          "view": {
            "header": "top",
            "headerAlign": "center",
            "features": {
              "description": true,
              "sfx": true,
              "subtraits": false
            },
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
            "notes": "",
            "reservedSlots": 3,
            "place": {
              "left": "33.333%",
              "top": 0,
              "width": "33.333%",
              "height": 1
            },
            "pillar": "plus"
          },
          "noun": "Power",
          "plural": "Powers",
          "traits": [
            {
              "name": "",
              "traits": [
                {
                  "name": "SFX",
                  "traits": [
                    {
                      "name": "SFX 1",
                      "traits": []
                    },
                    {
                      "name": "SFX 2",
                      "traits": []
                    },
                    {
                      "name": "Limit",
                      "traits": []
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "id": "power-set-3",
          "name": "Power Set 3",
          "description": "SFX: • SFX: • Limit:",
          "view": {
            "header": "top",
            "headerAlign": "center",
            "features": {
              "description": true,
              "sfx": true,
              "subtraits": false
            },
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
            "notes": "",
            "reservedSlots": 3,
            "place": {
              "left": "66.666%",
              "top": 0,
              "width": "33.334%",
              "height": 1
            },
            "pillar": "plus"
          },
          "noun": "Power",
          "plural": "Powers",
          "traits": [
            {
              "name": "",
              "traits": [
                {
                  "name": "SFX",
                  "traits": [
                    {
                      "name": "SFX 1",
                      "traits": []
                    },
                    {
                      "name": "SFX 2",
                      "traits": []
                    },
                    {
                      "name": "Limit",
                      "traits": []
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "id": "talents-growth-options",
          "name": "Talents",
          "description": "Name, Activation, and Effect",
          "view": {
            "features": {
              "description": true,
              "sfx": true,
              "subtraits": false
            },
            "page": 2,
            "style": {
              "header": "default",
              "body": "three-column-table"
            },
            "multiDie": false,
            "notes": "",
            "reservedSlots": 4,
            "place": {
              "left": "0%",
              "top": 1,
              "width": "66.663%",
              "height": 1
            },
            "labels": {
              "col1": "TALENT",
              "col2": "ACTIVATION",
              "col3": "EFFECT"
            },
            "pillar": "plus"
          },
          "noun": "Talent",
          "plural": "Talents",
          "traits": []
        },
        {
          "id": "session-record",
          "name": "Session Record",
          "view": {
            "features": {
              "description": false,
              "sfx": false,
              "subtraits": false
            },
            "page": 2,
            "style": {
              "header": "default",
              "body": "pips"
            },
            "pips": {
              "perRow": 6,
              "connected": true
            },
            "reservedSlots": 0,
            "place": {
              "left": "66.663%",
              "top": 1,
              "width": "33.334%",
              "height": 1
            },
            "pillar": "play"
          },
          "rating": {
            "type": "Pip",
            "value": [
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
              false
            ]
          },
          "noun": "Session",
          "plural": "Sessions",
          "traits": []
        },
        {
          "id": "leveling-up",
          "name": "Leveling Up",
          "view": {
            "header": "top",
            "headerAlign": "center",
            "features": {
              "description": false,
              "sfx": false,
              "subtraits": false
            },
            "page": 2,
            "style": {
              "header": "default",
              "body": "notes"
            },
            "notes": "**1 Session:** Turn an asset from a session into a signature asset at d6 • Switch out a distinction for a new one\n**2 Sessions:** Step up a signature asset • Add a new specialty to a skill • Add a new SFX to a power set\n**3 Sessions:** Step up a skill from d4 to d6, or add a power at d6 • Add a new talent from your archetype list or general list • Add a second power set (with one d8 power, one SFX, one limit)\n**4 Sessions:** Step up one attribute and step down another",
            "place": {
              "left": "66.66%",
              "top": 2,
              "width": "33.334%",
              "height": 1
            },
            "pillar": "play"
          },
          "noun": "Option",
          "plural": "Options",
          "traits": []
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
    "listing": {
      "url": "https://legacy.drivethrurpg.com/product/567042/Titans-vs-Leviathans?manufacturers_id=31866",
      "quote": "The city shakes. The bay churns.",
      "genre": "Kaiju / mech action",
      "setting": "d8",
      "prep": "d6",
      "complexity": "d6",
      "image": "https://legacy.drivethrurpg.com/images/31866/567042.jpg"
    },
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
      "player": "",
      "portrait": {
        "url": "",
        "view": {
          "size": "spotlight",
          "location": "header"
        }
      },
      "view": {
        "pageCount": 1,
        "spotlight": "Titans vs Leviathans",
        "style": {
          "sheet": "spotlight"
        },
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
      },
      "traitSets": [
        {
          "id": "name",
          "name": "Name",
          "view": {
            "style": {
              "header": "default",
              "body": "name"
            },
            "page": 1
          },
          "traits": [
            {
              "name": "name",
              "label": "Name",
              "traits": []
            },
            {
              "name": "player",
              "label": "Player",
              "traits": []
            },
            {
              "name": "nickname",
              "label": "Nickname",
              "traits": []
            },
            {
              "name": "pronouns",
              "label": "Pronouns",
              "traits": []
            },
            {
              "name": "description",
              "label": "Description",
              "traits": []
            },
            {
              "name": "game",
              "label": "Game",
              "view": {
                "visibility": "hidden"
              },
              "traits": []
            },
            {
              "name": "portrait",
              "traits": []
            },
            {
              "name": "caption",
              "traits": []
            },
            {
              "name": "plotPoints",
              "rating": {
                "type": "Counter",
                "value": [
                  1
                ],
                "range": [
                  0,
                  20
                ]
              },
              "label": "PP",
              "spendable": true,
              "view": {
                "visibility": "hidden"
              },
              "traits": []
            },
            {
              "name": "notes",
              "view": {
                "visibility": "hidden"
              },
              "traits": []
            }
          ]
        },
        {
          "id": "handler-attributes",
          "name": "Attributes",
          "description": "Neural synchronization and handler capabilities",
          "view": {
            "features": {
              "description": false,
              "sfx": false,
              "subtraits": false
            },
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
            "multiDie": false,
            "notes": "",
            "reservedSlots": 3,
            "ringTrait": false,
            "place": {
              "left": "0%",
              "top": 0,
              "width": "28%",
              "height": 1
            },
            "parts": {
              "name": {
                "left": "0%",
                "top": 0,
                "width": "100%",
                "height": 1
              },
              "rating": {
                "left": "0%",
                "top": 1,
                "width": "100%",
                "height": 1
              }
            },
            "pillar": "prime"
          },
          "noun": "Attribute",
          "plural": "Attributes",
          "traits": [
            {
              "name": "Prowess",
              "traits": []
            },
            {
              "name": "Control",
              "traits": []
            },
            {
              "name": "Renown",
              "traits": []
            }
          ]
        },
        {
          "id": "roles",
          "name": "Roles",
          "description": "Combat roles and tactical responsibilities",
          "view": {
            "features": {
              "description": false,
              "sfx": false,
              "subtraits": false
            },
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
            "notes": "",
            "reservedSlots": 5,
            "place": {
              "left": "0%",
              "top": 1,
              "width": "28%",
              "height": 1
            },
            "parts": {
              "name": {
                "left": "0%",
                "top": 0,
                "width": "100%",
                "height": 1
              },
              "rating": {
                "left": "0%",
                "top": 1,
                "width": "100%",
                "height": 1
              }
            },
            "pillar": "prime"
          },
          "noun": "Role",
          "plural": "Roles",
          "traits": [
            {
              "name": "Backup",
              "traits": []
            },
            {
              "name": "Blaster",
              "traits": []
            },
            {
              "name": "Boss",
              "traits": []
            },
            {
              "name": "Brain",
              "traits": []
            },
            {
              "name": "Brawler",
              "traits": []
            }
          ]
        },
        {
          "id": "distinctions",
          "name": "Distinctions",
          "description": "Personal identity, public persona, and driving aspiration",
          "view": {
            "features": {
              "description": true,
              "sfx": true,
              "subtraits": false
            },
            "page": 1,
            "style": {
              "header": "sfx-rows",
              "body": "sfx-rows"
            },
            "ratingScale": [
              8
            ],
            "multiDie": false,
            "notes": "",
            "reservedSlots": 3,
            "place": {
              "left": "28%",
              "top": 0,
              "width": "72%",
              "height": 1
            },
            "pillar": "prime"
          },
          "noun": "Distinction",
          "plural": "Distinctions",
          "traits": [
            {
              "name": "Identity:",
              "rating": {
                "type": "Die",
                "value": [
                  8
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "traits": [
                {
                  "name": "SFX",
                  "traits": [
                    {
                      "name": "Hinder",
                      "rating": { "type": "Die", "value": [4], "range": [4] },
                      "description": "Gain a PP when you switch out your distinction's rating of d8 for a d4.",
                      "traits": []
                    },
                    {
                      "name": "Affirmation",
                      "description": "Spend a PP to step up an attribute for an action or reaction when acting in line with your personal identity.",
                      "traits": []
                    },
                    {
                      "name": "Authenticity",
                      "description": "Step up a complication to reroll one or all of your dice, even hitches, when acting in line with your personal identity.",
                      "traits": []
                    }
                  ]
                }
              ]
            },
            {
              "name": "Persona:",
              "rating": {
                "type": "Die",
                "value": [
                  8
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "traits": [
                {
                  "name": "SFX",
                  "traits": [
                    {
                      "name": "Hinder",
                      "rating": { "type": "Die", "value": [4], "range": [4] },
                      "description": "Gain a PP when you switch out your distinction's rating of d8 for a d4.",
                      "traits": []
                    },
                    {
                      "name": "Shake it Off",
                      "description": "Spend a PP to recover a complication when acting in line with your public persona.",
                      "traits": []
                    },
                    {
                      "name": "Double Down",
                      "description": "Step up a complication to double an attribute for an action or reaction when acting in line with your public persona.",
                      "traits": []
                    }
                  ]
                }
              ]
            },
            {
              "name": "Aspiration:",
              "rating": {
                "type": "Die",
                "value": [
                  8
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "traits": [
                {
                  "name": "SFX",
                  "traits": [
                    {
                      "name": "Hinder",
                      "rating": { "type": "Die", "value": [4], "range": [4] },
                      "description": "Gain a PP when you switch out your distinction's rating of d8 for a d4.",
                      "traits": []
                    },
                    {
                      "name": "Cards on the Table",
                      "description": "Spend a PP to double an attribute for an action or reaction when you're pursuing your aspiration.",
                      "traits": []
                    },
                    {
                      "name": "Hurts for a Minute",
                      "description": "Step up a complication to step down one of your titan's stress die ratings when you're pursuing your aspiration.",
                      "traits": []
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "id": "signature-assets",
          "name": "Signature Assets",
          "description": "Handler cockpit gear and personal assets",
          "view": {
            "header": "top",
            "headerAlign": "left",
            "features": {
              "description": true,
              "sfx": false,
              "subtraits": false
            },
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
            "notes": "",
            "reservedSlots": 2,
            "place": {
              "left": "28%",
              "top": 1,
              "width": "72%",
              "height": 1
            },
            "pillar": "plus"
          },
          "noun": "Signature Asset",
          "plural": "Signature Assets",
          "traits": []
        },
        {
          "id": "complications",
          "name": "Complications",
          "view": {
            "header": "top",
            "headerAlign": "left",
            "features": {
              "description": true,
              "sfx": false,
              "subtraits": false
            },
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
            "playMutable": true,
            "pillar": "play"
          },
          "noun": "Complication",
          "plural": "Complications",
          "traits": []
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
    "listing": {
      "url": "https://legacy.drivethrurpg.com/product/567042/Titans-vs-Leviathans?manufacturers_id=31866",
      "quote": "The city shakes. The bay churns.",
      "genre": "Kaiju / mech action",
      "setting": "d8",
      "prep": "d6",
      "complexity": "d6",
      "image": "https://legacy.drivethrurpg.com/images/31866/567042.jpg"
    },
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
      "player": "",
      "portrait": {
        "url": "",
        "view": {
          "size": "spotlight",
          "location": "header"
        }
      },
      "view": {
        "pageCount": 1,
        "spotlight": "Titans vs Leviathans",
        "style": {
          "sheet": "spotlight"
        },
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
      },
      "traitSets": [
        {
          "id": "name",
          "name": "Name",
          "view": {
            "style": {
              "header": "default",
              "body": "name"
            },
            "page": 1
          },
          "traits": [
            {
              "name": "name",
              "label": "Name",
              "traits": []
            },
            {
              "name": "player",
              "label": "Player",
              "traits": []
            },
            {
              "name": "nickname",
              "label": "Nickname",
              "traits": []
            },
            {
              "name": "pronouns",
              "label": "Pronouns",
              "traits": []
            },
            {
              "name": "description",
              "label": "Description",
              "traits": []
            },
            {
              "name": "game",
              "label": "Game",
              "view": {
                "visibility": "hidden"
              },
              "traits": []
            },
            {
              "name": "portrait",
              "traits": []
            },
            {
              "name": "caption",
              "traits": []
            },
            {
              "name": "plotPoints",
              "rating": {
                "type": "Counter",
                "value": [
                  1
                ],
                "range": [
                  0,
                  20
                ]
              },
              "label": "PP",
              "spendable": true,
              "view": {
                "visibility": "hidden"
              },
              "traits": []
            },
            {
              "name": "notes",
              "view": {
                "visibility": "hidden"
              },
              "traits": []
            }
          ]
        },
        {
          "id": "titan-attributes-stress",
          "name": "Attributes",
          "description": "Heavy mechanized systems with stress tracks",
          "view": {
            "features": {
              "description": false,
              "sfx": false,
              "subtraits": false
            },
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
            "notes": "",
            "reservedSlots": 3,
            "ringTrait": false,
            "place": {
              "left": "0%",
              "top": 0,
              "width": "28%",
              "height": 1
            },
            "labels": {
              "stress": "STRESS"
            },
            "parts": {
              "name": {
                "left": "0%",
                "top": 0,
                "width": "100%",
                "height": 1
              },
              "rating": {
                "left": "0%",
                "top": 1,
                "width": "100%",
                "height": 1
              },
              "trackLabel": {
                "left": "0%",
                "top": 2,
                "width": "100%",
                "height": 1
              },
              "track": {
                "left": "0%",
                "top": 3,
                "width": "100%",
                "height": 1
              }
            },
            "pillar": "prime"
          },
          "noun": "Attribute",
          "plural": "Attributes",
          "traits": [
            {
              "name": "Prowess",
              "traits": [
                {
                  "name": "STRESS",
                  "rating": {
                    "type": "Die",
                    "value": [],
                    "range": [
                      6,
                      8,
                      10,
                      12
                    ]
                  },
                  "traits": []
                }
              ]
            },
            {
              "name": "Control",
              "traits": [
                {
                  "name": "STRESS",
                  "rating": {
                    "type": "Die",
                    "value": [],
                    "range": [
                      6,
                      8,
                      10,
                      12
                    ]
                  },
                  "traits": []
                }
              ]
            },
            {
              "name": "Renown",
              "traits": [
                {
                  "name": "STRESS",
                  "rating": {
                    "type": "Die",
                    "value": [],
                    "range": [
                      6,
                      8,
                      10,
                      12
                    ]
                  },
                  "traits": []
                }
              ]
            }
          ]
        },
        {
          "id": "titan-distinctions",
          "name": "Distinctions",
          "description": "Chassis type, operational history, and battle stance",
          "view": {
            "features": {
              "description": true,
              "sfx": true,
              "subtraits": false
            },
            "page": 1,
            "style": {
              "header": "sfx-rows",
              "body": "sfx-rows"
            },
            "ratingScale": [
              8
            ],
            "multiDie": false,
            "notes": "",
            "reservedSlots": 3,
            "place": {
              "left": "28%",
              "top": 0,
              "width": "72%",
              "height": 1
            },
            "pillar": "prime"
          },
          "noun": "Distinction",
          "plural": "Distinctions",
          "traits": [
            {
              "name": "Type:",
              "rating": {
                "type": "Die",
                "value": [
                  8
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "traits": []
            },
            {
              "name": "History:",
              "rating": {
                "type": "Die",
                "value": [
                  8
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "traits": [
                {
                  "name": "SFX",
                  "traits": [
                    {
                      "name": "Underscore",
                      "description": "Spend a PP to double a titan attribute for your next action or reaction when drawing on your titan's history.",
                      "traits": []
                    },
                    {
                      "name": "Overcompensate",
                      "description": "Step up one stress and reroll one or all of your dice pool when taking an action or reaction that draws on your titan's history.",
                      "traits": []
                    }
                  ]
                }
              ]
            },
            {
              "name": "Battle:",
              "rating": {
                "type": "Die",
                "value": [
                  8
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "traits": []
            }
          ]
        },
        {
          "id": "power-set",
          "name": "Power Set",
          "description": "Colossal kaiju-annihilation weaponry",
          "view": {
            "features": {
              "description": true,
              "sfx": true,
              "subtraits": false
            },
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
            "notes": "",
            "reservedSlots": 4,
            "place": {
              "left": "0%",
              "top": 1,
              "width": "50%",
              "height": 1
            },
            "pillar": "plus"
          },
          "noun": "Power",
          "plural": "Powers",
          "traits": []
        },
        {
          "id": "power-set-2",
          "name": "Power Set",
          "description": "Secondary titan systems and ordnance",
          "view": {
            "features": {
              "description": true,
              "sfx": true,
              "subtraits": false
            },
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
            "notes": "",
            "reservedSlots": 4,
            "place": {
              "left": "50%",
              "top": 1,
              "width": "50%",
              "height": 1
            },
            "pillar": "plus"
          },
          "noun": "Power",
          "plural": "Powers",
          "traits": []
        },
        {
          "id": "session-record",
          "name": "Session Record",
          "view": {
            "header": "top",
            "headerAlign": "right",
            "features": {
              "description": false,
              "sfx": false,
              "subtraits": false
            },
            "page": 1,
            "style": {
              "header": "default",
              "body": "pips"
            },
            "pips": {
              "perRow": 15,
              "connected": true
            },
            "reservedSlots": 0,
            "pillar": "play"
          },
          "rating": {
            "type": "Pip",
            "value": [
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
              false
            ]
          },
          "noun": "Session",
          "plural": "Sessions",
          "traits": []
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
    "listing": {
      "url": "https://legacy.drivethrurpg.com/product/567041/Cortex-Prime-Game-Handbook-2nd-Edition?manufacturers_id=31866"
    },
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
      "player": "",
      "portrait": {
        "url": "",
        "view": {
          "size": "spotlight",
          "location": "header"
        }
      },
      "view": {
        "pageCount": 1,
        "spotlight": "TRACE 2.0",
        "style": {
          "sheet": "spotlight"
        },
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
      },
      "traitSets": [
        {
          "id": "name",
          "name": "Name",
          "view": {
            "style": {
              "header": "default",
              "body": "name"
            },
            "page": 1
          },
          "traits": [
            {
              "name": "name",
              "label": "Name",
              "traits": []
            },
            {
              "name": "player",
              "label": "Player",
              "traits": []
            },
            {
              "name": "nickname",
              "label": "Nickname",
              "traits": []
            },
            {
              "name": "pronouns",
              "label": "Pronouns",
              "traits": []
            },
            {
              "name": "description",
              "label": "Description",
              "traits": []
            },
            {
              "name": "game",
              "label": "Game",
              "view": {
                "visibility": "hidden"
              },
              "traits": []
            },
            {
              "name": "portrait",
              "traits": []
            },
            {
              "name": "caption",
              "traits": []
            },
            {
              "name": "plotPoints",
              "rating": {
                "type": "Counter",
                "value": [
                  1
                ],
                "range": [
                  0,
                  20
                ]
              },
              "label": "PP",
              "spendable": true,
              "view": {
                "visibility": "hidden"
              },
              "traits": []
            },
            {
              "name": "notes",
              "view": {
                "visibility": "hidden"
              },
              "traits": []
            }
          ]
        },
        {
          "id": "affiliations",
          "name": "Affiliations",
          "description": "Team configuration ratings",
          "view": {
            "features": {
              "description": false,
              "sfx": false,
              "subtraits": false
            },
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
            "notes": "",
            "reservedSlots": 3,
            "place": {
              "left": "0%",
              "top": 0,
              "width": "30%",
              "height": 1
            },
            "parts": {
              "name": {
                "left": "0%",
                "top": 0,
                "width": "100%",
                "height": 1
              },
              "rating": {
                "left": "0%",
                "top": 1,
                "width": "100%",
                "height": 1
              }
            },
            "pillar": "prime"
          },
          "noun": "Affiliation",
          "plural": "Affiliations",
          "traits": [
            {
              "name": "Solo",
              "traits": []
            },
            {
              "name": "Partner",
              "traits": []
            },
            {
              "name": "Squad",
              "traits": []
            }
          ]
        },
        {
          "id": "roles",
          "name": "Roles",
          "description": "Civic investigation disciplines",
          "view": {
            "features": {
              "description": false,
              "sfx": false,
              "subtraits": false
            },
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
            "notes": "",
            "reservedSlots": 7,
            "place": {
              "left": "0%",
              "top": 1,
              "width": "30%",
              "height": 1
            },
            "pillar": "prime"
          },
          "noun": "Role",
          "plural": "Roles",
          "traits": [
            {
              "name": "Forensics",
              "traits": []
            },
            {
              "name": "Investigation",
              "traits": []
            },
            {
              "name": "Legal",
              "traits": []
            },
            {
              "name": "Medicine",
              "traits": []
            },
            {
              "name": "Psychology",
              "traits": []
            },
            {
              "name": "Tactics",
              "traits": []
            },
            {
              "name": "Technology",
              "traits": []
            }
          ]
        },
        {
          "id": "resources",
          "name": "Resources",
          "description": "Civic assets, contacts, and backup",
          "view": {
            "features": {
              "description": false,
              "sfx": false,
              "subtraits": false
            },
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
            "notes": "",
            "reservedSlots": 8,
            "place": {
              "left": "0%",
              "top": 2,
              "width": "30%",
              "height": 1
            },
            "parts": {
              "name": {
                "left": "0%",
                "top": 0,
                "width": "82%",
                "height": 1
              },
              "rating": {
                "left": "82%",
                "top": 0,
                "width": "18%",
                "height": 1
              }
            },
            "pillar": "plus"
          },
          "noun": "Resource",
          "plural": "Resources",
          "traits": [
            {
              "name": "",
              "rating": {
                "type": "Dice",
                "value": [
                  10,
                  10
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "spendable": true,
              "hitches": 0,
              "traits": []
            },
            {
              "name": "",
              "rating": {
                "type": "Dice",
                "value": [
                  8,
                  8
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "spendable": true,
              "hitches": 0,
              "traits": []
            },
            {
              "name": "",
              "rating": {
                "type": "Dice",
                "value": [
                  6,
                  6
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "spendable": true,
              "hitches": 0,
              "traits": []
            },
            {
              "name": "",
              "rating": {
                "type": "Dice",
                "value": [
                  6,
                  6
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "spendable": true,
              "hitches": 0,
              "traits": []
            }
          ]
        },
        {
          "id": "distinctions",
          "name": "Distinctions",
          "description": "Defining history, drive, and complication",
          "view": {
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
            "page": 1,
            "style": {
              "header": "sfx-rows",
              "body": "sfx-rows"
            },
            "multiDie": false,
            "notes": "",
            "reservedSlots": 3,
            "place": {
              "left": "30%",
              "top": 0,
              "width": "70%",
              "height": 1
            },
            "pillar": "prime"
          },
          "noun": "Distinction",
          "plural": "Distinctions",
          "traits": [
            {
              "name": "Distinction #1:",
              "rating": {
                "type": "Die",
                "value": [
                  8
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "traits": [
                {
                  "name": "SFX",
                  "traits": [
                    {
                      "name": "Hinder",
                      "rating": { "type": "Die", "value": [4], "range": [4] },
                      "traits": []
                    }
                  ]
                }
              ]
            },
            {
              "name": "Distinction #2:",
              "rating": {
                "type": "Die",
                "value": [
                  8
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "traits": [
                {
                  "name": "SFX",
                  "traits": [
                    {
                      "name": "Hinder",
                      "rating": { "type": "Die", "value": [4], "range": [4] },
                      "traits": []
                    }
                  ]
                }
              ]
            },
            {
              "name": "Distinction #3:",
              "rating": {
                "type": "Die",
                "value": [
                  8
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "traits": [
                {
                  "name": "SFX",
                  "traits": [
                    {
                      "name": "Hinder",
                      "rating": { "type": "Die", "value": [4], "range": [4] },
                      "traits": []
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "id": "talents",
          "name": "Talents",
          "description": "Training tricks and case-cracking knacks",
          "view": {
            "features": {
              "description": true,
              "sfx": false,
              "subtraits": false
            },
            "page": 1,
            "style": {
              "header": "default",
              "body": "default"
            },
            "ratingScale": [],
            "multiDie": false,
            "notes": "",
            "reservedSlots": 6,
            "place": {
              "left": "30%",
              "top": 1,
              "width": "70%",
              "height": 1
            },
            "pillar": "plus"
          },
          "noun": "Talent",
          "plural": "Talents",
          "traits": [
            {
              "name": "Talent #1:",
              "traits": []
            },
            {
              "name": "Talent #2:",
              "traits": []
            },
            {
              "name": "Talent #3:",
              "traits": []
            },
            {
              "name": "Talent #4:",
              "traits": []
            },
            {
              "name": "Talent #5:",
              "traits": []
            },
            {
              "name": "Talent #6:",
              "traits": []
            }
          ]
        },
        {
          "id": "stress",
          "name": "Stress",
          "description": "Emotional and physical pressure tracks",
          "view": {
            "features": {
              "description": false,
              "sfx": false,
              "subtraits": false
            },
            "page": 1,
            "style": {
              "header": "default",
              "body": "die-track"
            },
            "multiDie": false,
            "notes": "",
            "reservedSlots": 5,
            "ratingScale": [
              4,
              6,
              8,
              10,
              12
            ],
            "place": {
              "left": "30%",
              "top": 2,
              "width": "50%",
              "height": 1
            },
            "pillar": "play"
          },
          "noun": "Stress",
          "plural": "Stress",
          "traits": [
            {
              "name": "Afraid",
              "traits": []
            },
            {
              "name": "Angry",
              "traits": []
            },
            {
              "name": "Anxious",
              "traits": []
            },
            {
              "name": "Exhausted",
              "traits": []
            },
            {
              "name": "Injured",
              "traits": []
            }
          ]
        },
        {
          "id": "growth-pool",
          "name": "Growth Pool",
          "description": "Base d6 d6",
          "view": {
            "header": "top",
            "headerAlign": "center",
            "features": {
              "description": false,
              "sfx": false,
              "subtraits": false
            },
            "page": 1,
            "style": {
              "header": "default",
              "body": "dice-count"
            },
            "ratingScale": [
              4,
              6,
              8,
              10,
              12
            ],
            "multiDie": true,
            "reservedSlots": 5,
            "place": {
              "left": "80%",
              "top": 2,
              "width": "20%",
              "height": 1
            },
            "labels": {
              "rating": "RATING",
              "dice": "/ DICE"
            },
            "pillar": "play"
          },
          "pool": true,
          "noun": "Growth Die",
          "plural": "Growth Dice",
          "traits": [
            {
              "name": "D4",
              "rating": {
                "type": "Die",
                "value": [
                  4
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "spendable": true,
              "hitches": 0,
              "view": {
                "poolCount": 0
              },
              "traits": []
            },
            {
              "name": "D6",
              "rating": {
                "type": "Die",
                "value": [
                  6
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "spendable": true,
              "hitches": 0,
              "view": {
                "poolCount": 2
              },
              "traits": []
            },
            {
              "name": "D8",
              "rating": {
                "type": "Die",
                "value": [
                  8
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "spendable": true,
              "hitches": 0,
              "view": {
                "poolCount": 0
              },
              "traits": []
            },
            {
              "name": "D10",
              "rating": {
                "type": "Die",
                "value": [
                  10
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "spendable": true,
              "hitches": 0,
              "view": {
                "poolCount": 0
              },
              "traits": []
            },
            {
              "name": "D12",
              "rating": {
                "type": "Die",
                "value": [
                  12
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "spendable": true,
              "hitches": 0,
              "view": {
                "poolCount": 0
              },
              "traits": []
            }
          ]
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
    "pages": 3,
    "genre": "Reference",
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
        "view": {
          "alignment": "center-center",
          "size": "spotlight",
          "location": "header"
        }
      },
      "view": {
        "nickname": "The Everything Sheet",
        "pageCount": 3,
        "columnAlignment": "top-base",
        "columnOffsets": {
          "left": 0,
          "center": 0,
          "right": 0
        },
        "style": {
          "sheet": "spotlight"
        }
      },
      "traitSets": [
        {
          "id": "name",
          "name": "Name",
          "view": {
            "style": {
              "header": "default",
              "body": "name"
            },
            "page": 1
          },
          "traits": [
            {
              "name": "name",
              "label": "Name",
              "traits": []
            },
            {
              "name": "player",
              "label": "Player",
              "traits": []
            },
            {
              "name": "nickname",
              "label": "Nickname",
              "traits": []
            },
            {
              "name": "pronouns",
              "label": "Pronouns",
              "traits": []
            },
            {
              "name": "description",
              "label": "Description",
              "traits": []
            },
            {
              "name": "game",
              "label": "Game",
              "view": {
                "visibility": "hidden"
              },
              "traits": []
            },
            {
              "name": "portrait",
              "traits": []
            },
            {
              "name": "caption",
              "traits": []
            },
            {
              "name": "plotPoints",
              "rating": {
                "type": "Counter",
                "value": [
                  3
                ],
                "range": [
                  0,
                  20
                ]
              },
              "label": "PP",
              "spendable": true,
              "view": {
                "visibility": "hidden"
              },
              "traits": []
            },
            {
              "name": "notes",
              "view": {
                "visibility": "hidden"
              },
              "traits": []
            }
          ]
        },
        {
          "id": "ks-distinctions",
          "name": "Distinctions",
          "view": {
            "page": 1,
            "style": {
              "header": "sfx-rows",
              "body": "sfx-rows"
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
            ],
            "place": {
              "left": "0%",
              "top": 0,
              "width": "50%",
              "height": 1
            },
            "parts": {
              "name": {
                "left": "0%",
                "top": 0,
                "width": "94%",
                "height": 1
              },
              "rating": {
                "left": "94%",
                "top": 0,
                "width": "6%",
                "height": 1
              },
              "description": {
                "left": "0%",
                "top": 1,
                "width": "100%",
                "height": 1
              },
              "block": {
                "left": "0%",
                "top": 2,
                "width": "100%",
                "height": 1
              }
            },
            "pillar": "prime"
          },
          "noun": "Distinction",
          "plural": "Distinctions",
          "traits": [
            {
              "name": "Walking Style Guide",
              "rating": {
                "type": "Die",
                "value": [
                  8
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "description": "Every layout edge case deserves a test.",
              "traits": [
                {
                  "name": "SFX",
                  "traits": [
                    {
                      "name": "Hinder",
                      "rating": { "type": "Die", "value": [4], "range": [4] },
                      "traits": []
                    },
                    {
                      "name": "Pixel Parity",
                      "description": "Spend 1 PP to step up or double a die when testing visual alignment against a reference PDF.",
                      "traits": []
                    }
                  ]
                }
              ]
            },
            {
              "name": "",
              "rating": {
                "type": "Die",
                "value": [
                  8
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "traits": [
                {
                  "name": "SFX",
                  "traits": [
                    {
                      "name": "Hinder",
                      "rating": { "type": "Die", "value": [4], "range": [4] },
                      "traits": []
                    }
                  ]
                }
              ]
            },
            {
              "name": "",
              "rating": {
                "type": "Die",
                "value": [
                  8
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "traits": [
                {
                  "name": "SFX",
                  "traits": [
                    {
                      "name": "Hinder",
                      "rating": { "type": "Die", "value": [4], "range": [4] },
                      "traits": []
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "id": "ks-values-statements",
          "name": "Values",
          "statement": true,
          "hasQuestionedPip": true,
          "view": {
            "page": 1,
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
            ],
            "place": {
              "left": "50%",
              "top": 0,
              "width": "50%",
              "height": 1
            },
            "parts": {
              "name": {
                "left": "0%",
                "top": 0,
                "width": "70%",
                "height": 1
              },
              "rating": {
                "left": "70%",
                "top": 0,
                "width": "30%",
                "height": 1
              }
            },
            "pillar": "prime"
          },
          "noun": "Value",
          "plural": "Values",
          "traits": [
            {
              "name": "Craft",
              "rating": {
                "type": "Die",
                "value": [
                  10
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "description": "Form and function are inseparable.",
              "traits": [
                {
                  "name": "Statement",
                  "traits": [
                    {
                      "name": "Form and function are inseparable.",
                      "rating": {
                        "type": "Pip",
                        "value": [
                          false
                        ]
                      },
                      "traits": []
                    }
                  ]
                }
              ]
            },
            {
              "name": "Speed",
              "rating": {
                "type": "Die",
                "value": [
                  8
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "description": "Ship early, refine relentlessly.",
              "traits": [
                {
                  "name": "Statement",
                  "traits": [
                    {
                      "name": "Ship early, refine relentlessly.",
                      "rating": {
                        "type": "Pip",
                        "value": [
                          true
                        ]
                      },
                      "traits": []
                    }
                  ]
                }
              ]
            },
            {
              "name": "Clarity",
              "rating": {
                "type": "Die",
                "value": [
                  6
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "traits": []
            }
          ]
        },
        {
          "id": "ks-subtrait-columns",
          "name": "Skills",
          "view": {
            "page": 1,
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
            },
            "place": {
              "left": "0%",
              "top": 1,
              "width": "50%",
              "height": 1
            },
            "pillar": "prime"
          },
          "noun": "Skill",
          "plural": "Skills",
          "traits": [
            {
              "name": "Engineering",
              "rating": {
                "type": "Die",
                "value": [
                  10
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "traits": [
                {
                  "name": "Clockwork",
                  "rating": {
                    "type": "Die",
                    "value": [
                      8
                    ],
                    "range": [
                      4,
                      6,
                      8,
                      10,
                      12
                    ]
                  },
                  "traits": []
                },
                {
                  "name": "Aetherics",
                  "rating": {
                    "type": "Die",
                    "value": [
                      6
                    ],
                    "range": [
                      4,
                      6,
                      8,
                      10,
                      12
                    ]
                  },
                  "traits": []
                }
              ]
            },
            {
              "name": "Navigation",
              "rating": {
                "type": "Die",
                "value": [
                  8
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "traits": [
                {
                  "name": "Star Charts",
                  "rating": {
                    "type": "Die",
                    "value": [
                      6
                    ],
                    "range": [
                      4,
                      6,
                      8,
                      10,
                      12
                    ]
                  },
                  "traits": []
                }
              ]
            },
            {
              "name": "Diplomacy",
              "rating": {
                "type": "Die",
                "value": [
                  6
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "traits": []
            }
          ]
        },
        {
          "id": "ks-paired-slots",
          "name": "Standing",
          "statement": true,
          "view": {
            "page": 1,
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
            ],
            "place": {
              "left": "50%",
              "top": 1,
              "width": "50%",
              "height": 1
            },
            "reservedSlots": 2,
            "pillar": "plus"
          },
          "noun": "Standing",
          "plural": "Standings",
          "traits": [
            {
              "name": "The Guild",
              "rating": {
                "type": "Die",
                "value": [
                  8
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "description": "They owe me a drydock bay.",
              "traits": [
                {
                  "name": "Complication",
                  "rating": {
                    "type": "Die",
                    "value": [
                      6
                    ],
                    "range": [
                      4,
                      6,
                      8,
                      10,
                      12
                    ]
                  },
                  "traits": []
                },
                {
                  "name": "Bonus",
                  "rating": {
                    "type": "Die",
                    "value": [
                      8
                    ],
                    "range": [
                      4,
                      6,
                      8,
                      10,
                      12
                    ]
                  },
                  "traits": []
                },
                {
                  "name": "Statement",
                  "traits": [
                    {
                      "name": "They owe me a drydock bay.",
                      "rating": {
                        "type": "Pip",
                        "value": [
                          false
                        ]
                      },
                      "traits": []
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "id": "ks-die-rows",
          "name": "Badges",
          "hasCounterColumn": true,
          "counterLabel": "XP",
          "view": {
            "page": 1,
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
            "reservedSlots": 3,
            "cluster": "badges-resources",
            "place": {
              "left": "0%",
              "top": 2,
              "width": "50%",
              "height": 1
            },
            "pillar": "plus"
          },
          "noun": "Badge",
          "plural": "Badges",
          "traits": [
            {
              "name": "First Responder",
              "rating": {
                "type": "Die",
                "value": [
                  8
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "xp": 3,
              "traits": []
            },
            {
              "name": "Trailblazer",
              "rating": {
                "type": "Die",
                "value": [
                  6
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "xp": 1,
              "traits": []
            }
          ]
        },
        {
          "id": "ks-three-col-table",
          "name": "Talents",
          "view": {
            "page": 1,
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
            "reservedSlots": 2,
            "place": {
              "left": "50%",
              "top": 2,
              "width": "50%",
              "height": 1
            },
            "pillar": "plus"
          },
          "noun": "Talent",
          "plural": "Talents",
          "traits": [
            {
              "name": "Overclock",
              "description": "Spend 1 PP when rolling Engineering.",
              "traits": [
                {
                  "name": "SFX",
                  "traits": [
                    {
                      "name": "Effect",
                      "description": "Step up your Effect die by one step for the scene.",
                      "traits": []
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "id": "ks-dice-count",
          "name": "Resources",
          "view": {
            "page": 1,
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
            },
            "cluster": "badges-resources",
            "place": {
              "left": "0%",
              "top": 3,
              "width": "50%",
              "height": 1
            },
            "pillar": "plus"
          },
          "noun": "Resource",
          "plural": "Resources",
          "traits": [
            {
              "name": "Salvage Cache",
              "rating": {
                "type": "Dice",
                "value": [
                  8,
                  8,
                  8
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "spendable": true,
              "hitches": 0,
              "traits": []
            },
            {
              "name": "Contacts",
              "rating": {
                "type": "Dice",
                "value": [
                  6,
                  6
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "spendable": true,
              "hitches": 0,
              "traits": []
            }
          ]
        },
        {
          "id": "ks-stress",
          "name": "Stress",
          "view": {
            "page": 1,
            "style": {
              "header": "default",
              "body": "die-track"
            },
            "features": {
              "description": false,
              "sfx": false,
              "subtraits": false
            },
            "outIndicator": true,
            "ratingScale": [
              6,
              8,
              10,
              12
            ],
            "place": {
              "left": "50%",
              "top": 3,
              "width": "50%",
              "height": 1
            },
            "pillar": "play"
          },
          "noun": "Stress",
          "plural": "Stress",
          "traits": [
            {
              "name": "Physical",
              "rating": {
                "type": "Die",
                "value": [
                  8
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "traits": []
            },
            {
              "name": "Mental",
              "traits": []
            },
            {
              "name": "Social",
              "rating": {
                "type": "Die",
                "value": [
                  12
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "traits": []
            }
          ]
        },
        {
          "id": "ks-dice-ladder",
          "name": "Growth Ladder",
          "view": {
            "page": 2,
            "style": {
              "header": "default",
              "body": "dice-ladder"
            },
            "features": {
              "description": false,
              "sfx": false,
              "subtraits": false
            },
            "place": {
              "left": "0%",
              "top": 0,
              "width": "50%",
              "height": 1
            },
            "pillar": "play"
          },
          "noun": "Rung",
          "plural": "Rungs",
          "traits": [
            {
              "name": "Novice",
              "rating": {
                "type": "Die",
                "value": [
                  6
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "traits": []
            },
            {
              "name": "Adept",
              "rating": {
                "type": "Die",
                "value": [
                  8
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "traits": []
            },
            {
              "name": "Master",
              "rating": {
                "type": "Die",
                "value": [
                  10
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "traits": []
            }
          ]
        },
        {
          "id": "ks-labeled-fields",
          "name": "Dossier",
          "view": {
            "page": 2,
            "style": {
              "header": "default",
              "body": "labeled-fields"
            },
            "features": {
              "description": true,
              "sfx": false,
              "subtraits": false
            },
            "place": {
              "left": "50%",
              "top": 0,
              "width": "50%",
              "height": 1
            },
            "pillar": "plus"
          },
          "noun": "Field",
          "plural": "Fields",
          "traits": [
            {
              "name": "Origin",
              "description": "Outer Rim Shipyard #4",
              "traits": []
            },
            {
              "name": "Drive",
              "description": "Restore the lost fleet",
              "traits": []
            },
            {
              "name": "Quirk",
              "traits": []
            }
          ]
        },
        {
          "id": "ks-pips",
          "name": "Progress Track",
          "view": {
            "page": 2,
            "style": {
              "header": "default",
              "body": "pips"
            },
            "pips": {
              "perRow": 5,
              "connected": true
            },
            "place": {
              "left": "0%",
              "top": 1,
              "width": "50%",
              "height": 1
            },
            "pillar": "play"
          },
          "rating": {
            "type": "Pip",
            "value": [
              true,
              true,
              true,
              true,
              false,
              false,
              false,
              false,
              false,
              false
            ]
          },
          "noun": "Pip",
          "plural": "Pips",
          "traits": []
        },
        {
          "id": "ks-session-record",
          "name": "Session Record",
          "view": {
            "page": 2,
            "style": {
              "header": "default",
              "body": "pips"
            },
            "place": {
              "left": "50%",
              "top": 1,
              "width": "50%",
              "height": 1
            },
            "reservedSlots": 3,
            "pips": {
              "labels": true,
              "perRow": 1
            },
            "pillar": "play"
          },
          "rating": {
            "type": "Pip",
            "value": [
              false,
              false,
              false
            ]
          },
          "noun": "Session",
          "plural": "Sessions",
          "traits": [
            {
              "name": "Session 1: The Awakening",
              "rating": {
                "type": "Die",
                "value": [
                  6
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "traits": []
            },
            {
              "name": "Session 2: Crossing the Threshold",
              "traits": []
            }
          ]
        },
        {
          "id": "ks-two-col-compact",
          "name": "Roles (Compact Two-Column)",
          "view": {
            "page": 2,
            "style": {
              "header": "two-columns-compact",
              "body": "two-columns-compact"
            },
            "features": {
              "description": false,
              "sfx": false,
              "subtraits": false
            },
            "place": {
              "left": "0%",
              "top": 2,
              "width": "50%",
              "height": 1
            },
            "pillar": "prime"
          },
          "noun": "Role",
          "plural": "Roles",
          "traits": [
            {
              "name": "Tactician",
              "rating": {
                "type": "Die",
                "value": [
                  8
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "traits": []
            },
            {
              "name": "Outrider",
              "rating": {
                "type": "Die",
                "value": [
                  6
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "traits": []
            },
            {
              "name": "Scholar",
              "rating": {
                "type": "Die",
                "value": [
                  10
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "traits": []
            },
            {
              "name": "Sentinel",
              "rating": {
                "type": "Die",
                "value": [
                  4
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "traits": []
            }
          ]
        },
        {
          "id": "ks-notes",
          "name": "Notes",
          "view": {
            "page": 2,
            "style": {
              "header": "default",
              "body": "notes"
            },
            "notes": "### Gear & Inventory\n- **Chrono-Compass** (d8): Points toward temporal anomalies.\n- **Reserve Cells**: Spend 1 PP to recharge.\n> *\"Never fly without a backup spanner.\"*",
            "place": {
              "left": "50%",
              "top": 2,
              "width": "50%",
              "height": 1
            },
            "pillar": "play"
          },
          "noun": "Note",
          "plural": "Notes",
          "traits": []
        },
        {
          "id": "ks-detailed-columns",
          "name": "Detailed Columns",
          "view": {
            "page": 3,
            "style": {
              "header": "default",
              "body": "two-columns-detailed"
            },
            "features": {
              "description": true,
              "sfx": false,
              "subtraits": false
            },
            "place": {
              "left": "0%",
              "top": 0,
              "width": "50%",
              "height": 1
            },
            "pillar": "plus"
          },
          "noun": "Entry",
          "plural": "Entries",
          "traits": [
            {
              "name": "Alpha",
              "rating": {
                "type": "Die",
                "value": [
                  8
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "description": "First detailed entry.",
              "traits": []
            },
            {
              "name": "Beta",
              "rating": {
                "type": "Die",
                "value": [
                  6
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "description": "Second detailed entry.",
              "traits": []
            },
            {
              "name": "Gamma",
              "rating": {
                "type": "Die",
                "value": [
                  10
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "description": "Third detailed entry.",
              "traits": []
            },
            {
              "name": "Delta",
              "rating": {
                "type": "Die",
                "value": [
                  8
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "description": "Fourth detailed entry.",
              "traits": []
            }
          ]
        },
        {
          "id": "ks-resource-pool",
          "name": "Resource Pool",
          "view": {
            "page": 3,
            "style": {
              "header": "pool-rows",
              "body": "pool-rows"
            },
            "features": {
              "description": false,
              "sfx": false,
              "subtraits": true
            },
            "place": {
              "left": "50%",
              "top": 0,
              "width": "50%",
              "height": 1
            },
            "pillar": "plus"
          },
          "noun": "Resource",
          "plural": "Resources",
          "traits": [
            {
              "name": "Supply",
              "rating": {
                "type": "Die",
                "value": [
                  8
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "spendable": true,
              "hitches": 0,
              "traits": [
                {
                  "name": "Ammo",
                  "rating": {
                    "type": "Die",
                    "value": [
                      6
                    ],
                    "range": [
                      4,
                      6,
                      8,
                      10,
                      12
                    ]
                  },
                  "traits": []
                }
              ]
            },
            {
              "name": "Fuel",
              "rating": {
                "type": "Die",
                "value": [
                  6
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "spendable": true,
              "hitches": 0,
              "traits": []
            },
            {
              "name": "Intel",
              "rating": {
                "type": "Die",
                "value": [
                  10
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "spendable": true,
              "hitches": 0,
              "traits": []
            }
          ]
        },
        {
          "id": "ks-assets",
          "name": "Signature Assets",
          "view": {
            "page": 3,
            "style": {
              "header": "boxed-rows",
              "body": "boxed-rows"
            },
            "features": {
              "description": false,
              "sfx": false,
              "subtraits": false
            },
            "place": {
              "left": "0%",
              "top": 1,
              "width": "50%",
              "height": 1
            },
            "pillar": "plus"
          },
          "noun": "Asset",
          "plural": "Assets",
          "traits": [
            {
              "name": "Custom Sidearm",
              "rating": {
                "type": "Die",
                "value": [
                  8
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "traits": []
            },
            {
              "name": "Survey Kit",
              "rating": {
                "type": "Die",
                "value": [
                  6
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "traits": []
            },
            {
              "name": "Encrypted Comms",
              "rating": {
                "type": "Die",
                "value": [
                  8
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "traits": []
            }
          ]
        },
        {
          "id": "ks-list",
          "name": "Simple List",
          "view": {
            "page": 3,
            "style": {
              "header": "list",
              "body": "list"
            },
            "features": {
              "description": false,
              "sfx": false,
              "subtraits": false
            },
            "place": {
              "left": "50%",
              "top": 1,
              "width": "50%",
              "height": 1
            },
            "pillar": "plus"
          },
          "noun": "Item",
          "plural": "Items",
          "traits": [
            {
              "name": "Item One",
              "rating": {
                "type": "Die",
                "value": [
                  8
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "traits": []
            },
            {
              "name": "Item Two",
              "rating": {
                "type": "Die",
                "value": [
                  6
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "traits": []
            },
            {
              "name": "Item Three",
              "rating": {
                "type": "Die",
                "value": [
                  8
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "traits": []
            }
          ]
        },
        {
          "id": "ks-image",
          "name": "Image Set",
          "view": {
            "page": 3,
            "style": {
              "header": "default",
              "body": "image"
            },
            "features": {
              "description": false,
              "sfx": false,
              "subtraits": false
            },
            "imageConfig": {
              "url": "",
              "height": 120,
              "alignment": "center",
              "caption": "Image set caption"
            },
            "place": {
              "left": "0%",
              "top": 2,
              "width": "100%",
              "height": 1
            },
            "pillar": "plus"
          },
          "noun": "Image",
          "plural": "Images",
          "traits": []
        }
      ]
    }
  },
  {
    "id": "spotlight-landscape-showcase",
    "version": 1,
    "title": "Landscape Style Showcase",
    "subtitle": "3-Column Landscape Layout & Spanning Showcase",
    "spotlight": "Toolkit Reference",
    "variant": "Showcase",
    "pages": 2,
    "genre": "Reference",
    "character": {
      "$schema": "https://cortex.engard.me/schema/0.1/character.schema.json",
      "version": "0.1",
      "id": "template-spotlight-landscape-showcase",
      "isTemplate": true,
      "name": "Landscape Showcase",
      "game": "Landscape Style Showcase",
      "description": "Visual layout showcase exercising 3-column landscape layout and column spanning across 1, 2, and 3 columns.",
      "pronouns": "",
      "plotPoints": 1,
      "notes": "",
      "portrait": {
        "url": "",
        "view": {
          "size": "spotlight",
          "location": "header"
        }
      },
      "player": "Layout Reference",
      "tags": [
        "showcase",
        "landscape"
      ],
      "view": {
        "nickname": "The Panorama Sheet",
        "pageOrientation": "landscape",
        "pageCount": 2,
        "columnAlignment": "top-base",
        "columnOffsets": {
          "left": 0,
          "center": 0,
          "right": 0
        },
        "style": {
          "sheet": "spotlight"
        }
      },
      "traitSets": [
        {
          "id": "name",
          "name": "Name",
          "view": {
            "style": {
              "header": "default",
              "body": "name"
            },
            "page": 1
          },
          "traits": [
            {
              "name": "name",
              "label": "Name",
              "traits": []
            },
            {
              "name": "player",
              "label": "Player",
              "traits": []
            },
            {
              "name": "nickname",
              "label": "Nickname",
              "traits": []
            },
            {
              "name": "pronouns",
              "label": "Pronouns",
              "traits": []
            },
            {
              "name": "description",
              "label": "Description",
              "traits": []
            },
            {
              "name": "game",
              "label": "Game",
              "view": {
                "visibility": "hidden"
              },
              "traits": []
            },
            {
              "name": "portrait",
              "traits": []
            },
            {
              "name": "caption",
              "traits": []
            },
            {
              "name": "plotPoints",
              "rating": {
                "type": "Counter",
                "value": [
                  1
                ],
                "range": [
                  0,
                  20
                ]
              },
              "label": "PP",
              "spendable": true,
              "view": {
                "visibility": "hidden"
              },
              "traits": []
            },
            {
              "name": "notes",
              "view": {
                "visibility": "hidden"
              },
              "traits": []
            }
          ]
        },
        {
          "id": "ls-roles",
          "name": "Roles & Masteries",
          "view": {
            "page": 1,
            "style": {
              "header": "default",
              "body": "default"
            },
            "traitColumns": 3,
            "features": {
              "description": true,
              "sfx": true,
              "subtraits": false
            },
            "header": "top",
            "headerAlign": "center",
            "pillar": "prime"
          },
          "noun": "Role",
          "plural": "Roles",
          "traits": [
            {
              "name": "Commander",
              "rating": {
                "type": "Die",
                "value": [
                  8
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "description": "Direct allies and coordinate tactical movement.",
              "traits": [
                {
                  "name": "SFX",
                  "traits": [
                    {
                      "name": "Lead from the Front",
                      "description": "Spend 1 PP to step up an ally's die when acting on your order.",
                      "traits": []
                    }
                  ]
                }
              ]
            },
            {
              "name": "Infiltrator",
              "rating": {
                "type": "Die",
                "value": [
                  8
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "description": "Bypass security systems and move undetected.",
              "traits": [
                {
                  "name": "SFX",
                  "traits": [
                    {
                      "name": "Ghost Protocol",
                      "description": "Spend 1 PP to borrow a die from the challenge pool for stealth.",
                      "traits": []
                    }
                  ]
                }
              ]
            },
            {
              "name": "Specialist",
              "rating": {
                "type": "Die",
                "value": [
                  8
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "description": "Analyze technical anomalies and reverse-engineer artifacts.",
              "traits": [
                {
                  "name": "SFX",
                  "traits": [
                    {
                      "name": "Tactical Insight",
                      "description": "Spend 1 PP to reroll a die when analyzing enemy technology.",
                      "traits": []
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "id": "ls-skills",
          "name": "Skills & Specialties",
          "view": {
            "page": 1,
            "style": {
              "header": "default",
              "body": "subtrait-columns"
            },
            "features": {
              "description": false,
              "sfx": false,
              "subtraits": true
            },
            "place": {
              "left": "0%",
              "top": 1,
              "width": "66.666%",
              "height": 1
            },
            "labels": {
              "left": "SKILL",
              "right": "SPECIALTIES"
            },
            "pillar": "prime"
          },
          "noun": "Skill",
          "plural": "Skills",
          "traits": [
            {
              "name": "Engineering",
              "rating": {
                "type": "Die",
                "value": [
                  8
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "traits": [
                {
                  "name": "Clockwork",
                  "rating": {
                    "type": "Die",
                    "value": [
                      8
                    ],
                    "range": [
                      4,
                      6,
                      8,
                      10,
                      12
                    ]
                  },
                  "traits": []
                },
                {
                  "name": "Aetherics",
                  "rating": {
                    "type": "Die",
                    "value": [
                      10
                    ],
                    "range": [
                      4,
                      6,
                      8,
                      10,
                      12
                    ]
                  },
                  "traits": []
                }
              ]
            },
            {
              "name": "Navigation",
              "rating": {
                "type": "Die",
                "value": [
                  8
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "traits": [
                {
                  "name": "Star Charts",
                  "rating": {
                    "type": "Die",
                    "value": [
                      8
                    ],
                    "range": [
                      4,
                      6,
                      8,
                      10,
                      12
                    ]
                  },
                  "traits": []
                },
                {
                  "name": "Sub-Light",
                  "rating": {
                    "type": "Die",
                    "value": [
                      10
                    ],
                    "range": [
                      4,
                      6,
                      8,
                      10,
                      12
                    ]
                  },
                  "traits": []
                }
              ]
            },
            {
              "name": "Diplomacy",
              "rating": {
                "type": "Die",
                "value": [
                  8
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "traits": [
                {
                  "name": "High Society",
                  "rating": {
                    "type": "Die",
                    "value": [
                      8
                    ],
                    "range": [
                      4,
                      6,
                      8,
                      10,
                      12
                    ]
                  },
                  "traits": []
                },
                {
                  "name": "Street Smart",
                  "rating": {
                    "type": "Die",
                    "value": [
                      6
                    ],
                    "range": [
                      4,
                      6,
                      8,
                      10,
                      12
                    ]
                  },
                  "traits": []
                }
              ]
            }
          ]
        },
        {
          "id": "ls-standing",
          "name": "Standing",
          "view": {
            "page": 1,
            "style": {
              "header": "default",
              "body": "paired-slots"
            },
            "features": {
              "description": true,
              "sfx": false,
              "subtraits": true
            },
            "place": {
              "left": "66.666%",
              "top": 1,
              "width": "33.334%",
              "height": 1
            },
            "labels": {
              "slot0": "COMPLICATION",
              "slot1": "BONUS"
            },
            "pillar": "plus"
          },
          "noun": "Standing",
          "plural": "Standings",
          "traits": [
            {
              "name": "The Syndicate",
              "rating": {
                "type": "Die",
                "value": [
                  8
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "traits": [
                {
                  "name": "Complication",
                  "rating": {
                    "type": "Die",
                    "value": [
                      8
                    ],
                    "range": [
                      4,
                      6,
                      8,
                      10,
                      12
                    ]
                  },
                  "traits": []
                },
                {
                  "name": "Bonus",
                  "rating": {
                    "type": "Die",
                    "value": [
                      6
                    ],
                    "range": [
                      4,
                      6,
                      8,
                      10,
                      12
                    ]
                  },
                  "traits": []
                },
                {
                  "name": "Statement",
                  "traits": [
                    {
                      "name": "Debts are never forgotten.",
                      "rating": {
                        "type": "Pip",
                        "value": [
                          false
                        ]
                      },
                      "traits": []
                    }
                  ]
                }
              ]
            },
            {
              "name": "The Vanguard",
              "rating": {
                "type": "Die",
                "value": [
                  6
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "traits": [
                {
                  "name": "Complication",
                  "rating": {
                    "type": "Die",
                    "value": [
                      6
                    ],
                    "range": [
                      4,
                      6,
                      8,
                      10,
                      12
                    ]
                  },
                  "traits": []
                },
                {
                  "name": "Bonus",
                  "rating": {
                    "type": "Die",
                    "value": [
                      8
                    ],
                    "range": [
                      4,
                      6,
                      8,
                      10,
                      12
                    ]
                  },
                  "traits": []
                },
                {
                  "name": "Statement",
                  "traits": [
                    {
                      "name": "Honor bound to protect.",
                      "rating": {
                        "type": "Pip",
                        "value": [
                          false
                        ]
                      },
                      "traits": []
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "id": "ls-values",
          "name": "Values",
          "view": {
            "page": 1,
            "style": {
              "header": "default",
              "body": "three-column-table"
            },
            "features": {
              "description": true,
              "sfx": false,
              "subtraits": false
            },
            "place": {
              "left": "0%",
              "top": 2,
              "width": "33.333%",
              "height": 1
            },
            "labels": {
              "col1": "TALENT",
              "col2": "ACTIVATION",
              "col3": "EFFECT"
            },
            "pillar": "prime"
          },
          "noun": "Value",
          "plural": "Values",
          "traits": [
            {
              "name": "Craft",
              "rating": {
                "type": "Die",
                "value": [
                  8
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "description": "Form and function are inseparable.",
              "traits": [
                {
                  "name": "Statement",
                  "traits": [
                    {
                      "name": "Form and function are inseparable.",
                      "rating": {
                        "type": "Pip",
                        "value": [
                          false
                        ]
                      },
                      "traits": []
                    }
                  ]
                }
              ]
            },
            {
              "name": "Speed",
              "rating": {
                "type": "Die",
                "value": [
                  8
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "description": "Ship early, refine relentlessly.",
              "traits": [
                {
                  "name": "Statement",
                  "traits": [
                    {
                      "name": "Ship early, refine relentlessly.",
                      "rating": {
                        "type": "Pip",
                        "value": [
                          false
                        ]
                      },
                      "traits": []
                    }
                  ]
                }
              ]
            },
            {
              "name": "Clarity",
              "rating": {
                "type": "Die",
                "value": [
                  6
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "description": "Truth cuts through ambiguity.",
              "traits": [
                {
                  "name": "Statement",
                  "traits": [
                    {
                      "name": "Truth cuts through ambiguity.",
                      "rating": {
                        "type": "Pip",
                        "value": [
                          false
                        ]
                      },
                      "traits": []
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "id": "ls-distinctions",
          "name": "Distinctions",
          "view": {
            "page": 1,
            "style": {
              "header": "default",
              "body": "default"
            },
            "sharedHinder": true,
            "sharedHinderText": "Gain a PP when you trade out your distinction's rating for a d4.",
            "features": {
              "description": true,
              "sfx": true,
              "subtraits": false
            },
            "place": {
              "left": "33.333%",
              "top": 2,
              "width": "66.667%",
              "height": 1
            },
            "pillar": "prime"
          },
          "noun": "Distinction",
          "plural": "Distinctions",
          "traits": [
            {
              "name": "Voidborn Pioneer",
              "rating": {
                "type": "Die",
                "value": [
                  8
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "description": "Accustomed to zero-G and cold vacuum.",
              "traits": [
                {
                  "name": "SFX",
                  "traits": [
                    {
                      "name": "Zero-G Maneuver",
                      "description": "Spend 1 PP to ignore difficult terrain in micro-gravity environments.",
                      "traits": []
                    }
                  ]
                }
              ]
            },
            {
              "name": "Cybernetic Maverick",
              "rating": {
                "type": "Die",
                "value": [
                  8
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "description": "Upgraded with experimental neural cyberware.",
              "traits": [
                {
                  "name": "SFX",
                  "traits": [
                    {
                      "name": "Overclock",
                      "description": "Spend 1 PP to double an Engineering die when hotwiring security.",
                      "traits": []
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "id": "ls-growth",
          "name": "Growth Pool",
          "view": {
            "page": 2,
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
            "place": {
              "left": "0%",
              "top": 0,
              "width": "33.333%",
              "height": 1
            },
            "labels": {
              "rating": "RATING",
              "dice": "/ DICE"
            },
            "pillar": "play"
          },
          "pool": true,
          "noun": "Growth Die",
          "plural": "Growth Dice",
          "traits": [
            {
              "name": "D4",
              "rating": {
                "type": "Die",
                "value": [
                  4
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "spendable": true,
              "hitches": 0,
              "view": {
                "poolCount": 1
              },
              "traits": []
            },
            {
              "name": "D6",
              "rating": {
                "type": "Die",
                "value": [
                  6
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "spendable": true,
              "hitches": 0,
              "view": {
                "poolCount": 1
              },
              "traits": []
            },
            {
              "name": "D8",
              "rating": {
                "type": "Die",
                "value": [
                  8
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "spendable": true,
              "hitches": 0,
              "view": {
                "poolCount": 1
              },
              "traits": []
            },
            {
              "name": "D10",
              "rating": {
                "type": "Die",
                "value": [
                  10
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "spendable": true,
              "hitches": 0,
              "view": {
                "poolCount": 1
              },
              "traits": []
            },
            {
              "name": "D12",
              "rating": {
                "type": "Die",
                "value": [
                  12
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "spendable": true,
              "hitches": 0,
              "view": {
                "poolCount": 1
              },
              "traits": []
            }
          ]
        },
        {
          "id": "ls-badges",
          "name": "Badges & Commendations",
          "view": {
            "page": 2,
            "style": {
              "header": "default",
              "body": "die-rows"
            },
            "features": {
              "description": false,
              "sfx": false,
              "subtraits": false
            },
            "place": {
              "left": "33.333%",
              "top": 0,
              "width": "33.333%",
              "height": 1
            },
            "pillar": "plus"
          },
          "noun": "Badge",
          "plural": "Badges",
          "traits": [
            {
              "name": "Fleet Veteran",
              "rating": {
                "type": "Die",
                "value": [
                  8
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "traits": []
            },
            {
              "name": "High Jump",
              "rating": {
                "type": "Die",
                "value": [
                  6
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "traits": []
            },
            {
              "name": "Master Hacker",
              "rating": {
                "type": "Die",
                "value": [
                  10
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "traits": []
            }
          ]
        },
        {
          "id": "ls-resources",
          "name": "Resources & Supplies",
          "view": {
            "page": 2,
            "style": {
              "header": "default",
              "body": "dice-count"
            },
            "features": {
              "description": false,
              "sfx": false,
              "subtraits": false
            },
            "place": {
              "left": "66.666%",
              "top": 0,
              "width": "33.334%",
              "height": 1
            },
            "labels": {
              "rating": "RATING",
              "dice": "/ DICE"
            },
            "pillar": "plus"
          },
          "noun": "Resource",
          "plural": "Resources",
          "traits": [
            {
              "name": "Crew Complement",
              "rating": {
                "type": "Die",
                "value": [
                  8
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "spendable": true,
              "hitches": 0,
              "view": {
                "poolCount": 4
              },
              "traits": []
            },
            {
              "name": "Emergency Fuel",
              "rating": {
                "type": "Die",
                "value": [
                  6
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "spendable": true,
              "hitches": 0,
              "view": {
                "poolCount": 3
              },
              "traits": []
            },
            {
              "name": "Intel Network",
              "rating": {
                "type": "Die",
                "value": [
                  8
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "spendable": true,
              "hitches": 0,
              "view": {
                "poolCount": 2
              },
              "traits": []
            }
          ]
        },
        {
          "id": "ls-dossier",
          "name": "Personnel Dossier",
          "view": {
            "page": 2,
            "style": {
              "header": "default",
              "body": "labeled-fields"
            },
            "features": {
              "description": true,
              "sfx": false,
              "subtraits": false
            },
            "place": {
              "left": "0%",
              "top": 1,
              "width": "66.666%",
              "height": 1
            },
            "pillar": "plus"
          },
          "noun": "Field",
          "plural": "Fields",
          "traits": [
            {
              "name": "Homeworld",
              "description": "Kepler-452b Core Colony",
              "traits": []
            },
            {
              "name": "Security Clearance",
              "description": "Level 5 Special Access",
              "traits": []
            },
            {
              "name": "Affiliation",
              "description": "Independent Free-Trader Collective",
              "traits": []
            }
          ]
        },
        {
          "id": "ls-stress",
          "name": "Stress",
          "view": {
            "page": 2,
            "style": {
              "header": "default",
              "body": "pips"
            },
            "features": {
              "description": false,
              "sfx": false,
              "subtraits": false
            },
            "pips": {
              "perRow": 5,
              "connected": true
            },
            "place": {
              "left": "66.666%",
              "top": 1,
              "width": "33.334%",
              "height": 1
            },
            "pillar": "play"
          },
          "rating": {
            "type": "Pip",
            "value": [
              true,
              false,
              false,
              false,
              false,
              false,
              false,
              false,
              false,
              false
            ]
          },
          "noun": "Stress",
          "plural": "Stress",
          "traits": [
            {
              "name": "Physical",
              "rating": {
                "type": "Die",
                "value": [
                  6
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "view": {
                "pipCount": 5,
                "pips": 1
              },
              "traits": []
            },
            {
              "name": "Mental",
              "rating": {
                "type": "Die",
                "value": [
                  6
                ],
                "range": [
                  4,
                  6,
                  8,
                  10,
                  12
                ]
              },
              "view": {
                "pipCount": 5,
                "pips": 0
              },
              "traits": []
            }
          ]
        },
        {
          "id": "ls-notes",
          "name": "Field Notes",
          "view": {
            "page": 2,
            "style": {
              "header": "default",
              "body": "notes"
            },
            "notes": "### Equipment\n- **Jump Drive Matrix** (d8)\n- **Thermal Scanner**: Spend 1 PP to detect cloaked ships.",
            "place": {
              "left": "66.66%",
              "top": 2,
              "width": "33.334%",
              "height": 1
            },
            "pillar": "play"
          },
          "noun": "Note",
          "plural": "Notes",
          "traits": []
        },
        {
          "id": "ls-session-record",
          "name": "Mission Chronicle",
          "view": {
            "page": 2,
            "style": {
              "header": "default",
              "body": "pips"
            },
            "reservedSlots": 12,
            "header": "top",
            "headerAlign": "right",
            "pips": {
              "labels": true,
              "perRow": 12
            },
            "pillar": "play"
          },
          "rating": {
            "type": "Pip",
            "value": [
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
              false
            ]
          },
          "noun": "Session",
          "plural": "Sessions",
          "traits": [
            {
              "name": "",
              "rating": {
                "type": "Pip",
                "value": [
                  true
                ]
              },
              "traits": []
            },
            {
              "name": "",
              "rating": {
                "type": "Pip",
                "value": [
                  true
                ]
              },
              "traits": []
            },
            {
              "name": "",
              "rating": {
                "type": "Pip",
                "value": [
                  true
                ]
              },
              "traits": []
            }
          ]
        }
      ]
    }
  }
];

if (typeof module !== "undefined" && module.exports) {
	module.exports = cortexSpotlightTemplates;
}
