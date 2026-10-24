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
      "traitSets": [
        {
          "id": "name",
          "name": "Name",
          "traits": [
            {
              "name": "name",
              "traits": [],
              "sfx": [],
              "label": "Name"
            },
            {
              "name": "player",
              "traits": [],
              "sfx": [],
              "label": "Player"
            },
            {
              "name": "nickname",
              "traits": [],
              "sfx": [],
              "label": "Nickname"
            },
            {
              "name": "pronouns",
              "traits": [],
              "sfx": [],
              "label": "Pronouns"
            },
            {
              "name": "description",
              "traits": [],
              "sfx": [],
              "label": "Description"
            },
            {
              "name": "game",
              "traits": [],
              "sfx": [],
              "label": "Game",
              "view": {
                "visibility": "hidden"
              }
            },
            {
              "name": "portrait",
              "traits": [],
              "sfx": []
            },
            {
              "name": "caption",
              "traits": [],
              "sfx": []
            },
            {
              "name": "plotPoints",
              "traits": [],
              "sfx": [],
              "label": "PP",
              "view": {
                "visibility": "hidden"
              },
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
              "spendable": true
            },
            {
              "name": "notes",
              "traits": [],
              "sfx": [],
              "view": {
                "visibility": "hidden"
              }
            }
          ],
          "sfx": [],
          "view": {
            "style": {
              "header": "default",
              "body": "name"
            },
            "page": 1
          }
        },
        {
          "id": "distinctions",
          "name": "Distinctions",
          "description": "Core alien background, job, and personality",
          "traits": [
            {
              "name": "Alien Background:",
              "traits": [],
              "sfx": [
                "hinder"
              ]
            },
            {
              "name": "Alien Role/Job:",
              "traits": [],
              "sfx": [
                "hinder"
              ]
            },
            {
              "name": "Personality/Quirk:",
              "traits": [],
              "sfx": [
                "hinder"
              ]
            }
          ],
          "sfx": [],
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
              "header": "distinctions",
              "body": "distinctions"
            },
            "multiDie": false,
            "ratingScale": [
              8
            ],
            "notes": "",
            "reservedSlots": 3
          },
          "noun": "Distinction",
          "plural": "Distinctions"
        },
        {
          "id": "subtrait-columns",
          "name": "Skills & Specialties",
          "description": "Core baseline d6 skills with branching d8+ specialties",
          "traits": [
            {
              "name": "Bout",
              "traits": [
                {
                  "name": "",
                  "traits": [],
                  "sfx": [],
                  "view": {
                    "branchSide": "left"
                  }
                },
                {
                  "name": "",
                  "traits": [],
                  "sfx": [],
                  "view": {
                    "branchSide": "right"
                  }
                }
              ],
              "sfx": []
            },
            {
              "name": "Chat",
              "traits": [
                {
                  "name": "",
                  "traits": [],
                  "sfx": [],
                  "view": {
                    "branchSide": "left"
                  }
                },
                {
                  "name": "",
                  "traits": [],
                  "sfx": [],
                  "view": {
                    "branchSide": "right"
                  }
                }
              ],
              "sfx": []
            },
            {
              "name": "Find",
              "traits": [
                {
                  "name": "",
                  "traits": [],
                  "sfx": [],
                  "view": {
                    "branchSide": "left"
                  }
                },
                {
                  "name": "",
                  "traits": [],
                  "sfx": [],
                  "view": {
                    "branchSide": "right"
                  }
                }
              ],
              "sfx": []
            },
            {
              "name": "Make",
              "traits": [
                {
                  "name": "",
                  "traits": [],
                  "sfx": [],
                  "view": {
                    "branchSide": "left"
                  }
                },
                {
                  "name": "",
                  "traits": [],
                  "sfx": [],
                  "view": {
                    "branchSide": "right"
                  }
                }
              ],
              "sfx": []
            },
            {
              "name": "Play",
              "traits": [
                {
                  "name": "",
                  "traits": [],
                  "sfx": [],
                  "view": {
                    "branchSide": "left"
                  }
                },
                {
                  "name": "",
                  "traits": [],
                  "sfx": [],
                  "view": {
                    "branchSide": "right"
                  }
                }
              ],
              "sfx": []
            },
            {
              "name": "Operate",
              "traits": [
                {
                  "name": "",
                  "traits": [],
                  "sfx": [],
                  "view": {
                    "branchSide": "left"
                  }
                },
                {
                  "name": "",
                  "traits": [],
                  "sfx": [],
                  "view": {
                    "branchSide": "right"
                  }
                }
              ],
              "sfx": []
            },
            {
              "name": "Work",
              "traits": [
                {
                  "name": "",
                  "traits": [],
                  "sfx": [],
                  "view": {
                    "branchSide": "left"
                  }
                },
                {
                  "name": "",
                  "traits": [],
                  "sfx": [],
                  "view": {
                    "branchSide": "right"
                  }
                }
              ],
              "sfx": []
            }
          ],
          "sfx": [],
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
            "reservedSlots": 7
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
          "plural": "Skills"
        },
        {
          "id": "values",
          "name": "Values",
          "description": "Alien worldview versus human conditioning",
          "statement": true,
          "traits": [
            {
              "name": "Alien",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Conformity",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Materialism",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Paranoia",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Patriotism",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Secrecy",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Spirituality",
              "traits": [],
              "sfx": []
            }
          ],
          "sfx": [],
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
            }
          },
          "noun": "Value",
          "plural": "Values"
        },
        {
          "id": "talents",
          "name": "Talents",
          "description": "Specialized alien abilities and tech modules",
          "traits": [],
          "sfx": [],
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
            }
          },
          "noun": "Talent",
          "plural": "Talents"
        },
        {
          "id": "signature-assets-tech",
          "name": "Signature Assets / Tech",
          "description": "Alien equipment and concealed devices",
          "traits": [],
          "sfx": [],
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
            }
          },
          "noun": "Signature Asset / Tech",
          "plural": "Signature Assets / Tech"
        },
        {
          "id": "relationships",
          "name": "Relationships",
          "description": "Connections to human contacts, superiors, and rivals",
          "traits": [],
          "sfx": [],
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
            }
          },
          "noun": "Relationship",
          "plural": "Relationships"
        },
        {
          "id": "session-record",
          "name": "Session Record",
          "description": "Session track and progression log",
          "traits": [],
          "sfx": [],
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
            }
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
            ],
            "range": [
              20
            ]
          },
          "noun": "Session",
          "plural": "Sessions"
        }
      ],
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
      }
    },
    "listing": {
      "url": "https://legacy.drivethrurpg.com/product/572304/Alien-Us?manufacturers_id=31866",
      "quote": "You crashed here forty years ago. You learned the language, the customs, the clothes, the way they smile with their teeth showing even when they don’t mean it.",
      "genre": "Cold War Sci-Fi Drama",
      "setting": "d6",
      "prep": "d6",
      "complexity": "d8",
      "image": "https://legacy.drivethrurpg.com/images/31866/572304.jpg"
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
      "traitSets": [
        {
          "id": "name",
          "name": "Name",
          "traits": [
            {
              "name": "name",
              "traits": [],
              "sfx": [],
              "label": "Name"
            },
            {
              "name": "player",
              "traits": [],
              "sfx": [],
              "label": "Player"
            },
            {
              "name": "nickname",
              "traits": [],
              "sfx": [],
              "label": "Nickname"
            },
            {
              "name": "pronouns",
              "traits": [],
              "sfx": [],
              "label": "Pronouns"
            },
            {
              "name": "description",
              "traits": [],
              "sfx": [],
              "label": "Description"
            },
            {
              "name": "game",
              "traits": [],
              "sfx": [],
              "label": "Game",
              "view": {
                "visibility": "hidden"
              }
            },
            {
              "name": "portrait",
              "traits": [],
              "sfx": []
            },
            {
              "name": "caption",
              "traits": [],
              "sfx": []
            },
            {
              "name": "plotPoints",
              "traits": [],
              "sfx": [],
              "label": "PP",
              "view": {
                "visibility": "hidden"
              },
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
              "spendable": true
            },
            {
              "name": "notes",
              "traits": [],
              "sfx": [],
              "view": {
                "visibility": "hidden"
              }
            }
          ],
          "sfx": [],
          "view": {
            "style": {
              "header": "default",
              "body": "name"
            },
            "page": 1
          }
        },
        {
          "id": "distinctions",
          "name": "Distinctions",
          "description": "Crew role, quality, and personal drive",
          "traits": [
            {
              "name": "Purpose:",
              "traits": [],
              "sfx": [
                "hinder"
              ],
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
              }
            },
            {
              "name": "Quality:",
              "traits": [],
              "sfx": [
                "hinder"
              ],
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
              }
            },
            {
              "name": "",
              "traits": [],
              "sfx": [
                "hinder"
              ],
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
              }
            }
          ],
          "sfx": [],
          "view": {
            "features": {
              "description": true,
              "sfx": true,
              "subtraits": false
            },
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
            "notes": "",
            "reservedSlots": 3,
            "place": {
              "left": "0%",
              "top": 0,
              "width": "64%",
              "height": 1
            }
          },
          "noun": "Distinction",
          "plural": "Distinctions"
        },
        {
          "id": "values",
          "name": "Values",
          "description": "Guiding philosophies paired with personal statements",
          "statement": true,
          "traits": [
            {
              "name": "Courage",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Curiosity",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Hope",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Logic",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Peace",
              "traits": [],
              "sfx": []
            }
          ],
          "sfx": [],
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
            }
          },
          "noun": "Value",
          "plural": "Values"
        },
        {
          "id": "relationships",
          "name": "Relationships",
          "description": "Crew connections and ties to shipmates",
          "statement": true,
          "traits": [],
          "sfx": [],
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
            }
          },
          "noun": "Relationship",
          "plural": "Relationships"
        },
        {
          "id": "signature-assets",
          "name": "Signature Assets",
          "description": "Specialized starship equipment and personal gear",
          "traits": [],
          "sfx": [],
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
            }
          },
          "noun": "Signature Asset",
          "plural": "Signature Assets"
        },
        {
          "id": "personal-milestones",
          "name": "Personal Milestones",
          "traits": [
            {
              "name": "1 XP",
              "traits": [],
              "sfx": []
            },
            {
              "name": "3 XP",
              "traits": [],
              "sfx": []
            },
            {
              "name": "10 XP",
              "traits": [],
              "sfx": []
            }
          ],
          "sfx": [],
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
            }
          },
          "noun": "Milestone",
          "plural": "Milestones"
        },
        {
          "id": "group-milestones",
          "name": "Group Milestones",
          "traits": [
            {
              "name": "1 XP",
              "traits": [],
              "sfx": []
            },
            {
              "name": "3 XP",
              "traits": [],
              "sfx": []
            },
            {
              "name": "10 XP",
              "traits": [],
              "sfx": []
            }
          ],
          "sfx": [],
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
            }
          },
          "noun": "Milestone",
          "plural": "Milestones"
        },
        {
          "id": "xp",
          "name": "XP",
          "description": "Experience points bubble track",
          "traits": [],
          "sfx": [],
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
            }
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
            ],
            "range": [
              25
            ]
          },
          "noun": "XP",
          "plural": "XP"
        }
      ],
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
      }
    },
    "listing": {
      "url": "https://legacy.drivethrurpg.com/product/568411/Brighter-Stars?manufacturers_id=31866",
      "quote": "The mission was supposed to last ten years. There were supposed to be answers at the end of it.",
      "genre": "Aspirational space opera",
      "setting": "d6",
      "prep": "d6",
      "complexity": "d6",
      "image": "https://legacy.drivethrurpg.com/images/31866/568411.jpg"
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
      "traitSets": [
        {
          "id": "name",
          "name": "Name",
          "traits": [
            {
              "name": "name",
              "traits": [],
              "sfx": [],
              "label": "Name"
            },
            {
              "name": "player",
              "traits": [],
              "sfx": [],
              "label": "Player"
            },
            {
              "name": "nickname",
              "traits": [],
              "sfx": [],
              "label": "Nickname"
            },
            {
              "name": "pronouns",
              "traits": [],
              "sfx": [],
              "label": "Pronouns"
            },
            {
              "name": "description",
              "traits": [],
              "sfx": [],
              "label": "Description"
            },
            {
              "name": "game",
              "traits": [],
              "sfx": [],
              "label": "Game",
              "view": {
                "visibility": "hidden"
              }
            },
            {
              "name": "portrait",
              "traits": [],
              "sfx": []
            },
            {
              "name": "caption",
              "traits": [],
              "sfx": []
            },
            {
              "name": "plotPoints",
              "traits": [],
              "sfx": [],
              "label": "PP",
              "view": {
                "visibility": "hidden"
              },
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
              "spendable": true
            },
            {
              "name": "notes",
              "traits": [],
              "sfx": [],
              "view": {
                "visibility": "hidden"
              }
            }
          ],
          "sfx": [],
          "view": {
            "style": {
              "header": "default",
              "body": "name"
            },
            "page": 1
          }
        },
        {
          "id": "distinctions",
          "name": "Distinctions",
          "description": "Camp background, camper reputation, and hidden destiny",
          "traits": [
            {
              "name": "HERITAGE:",
              "statement": "",
              "traits": [],
              "sfx": [
                {
                  "name": "Heritage",
                  "description": "Spend a PP to step up an attribute when you connect to your heritage."
                }
              ],
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
              }
            },
            {
              "name": "DESTINY:",
              "statement": "",
              "traits": [],
              "sfx": [
                {
                  "name": "Destiny",
                  "description": "Spend a PP to reroll your dice when you embrace your destiny."
                }
              ],
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
              }
            },
            {
              "name": "CAMP REPUTATION:",
              "statement": "",
              "traits": [],
              "sfx": [
                {
                  "name": "Camp Reputation",
                  "description": "Spend a PP to create a d8 asset linked to the thing you're known for."
                }
              ],
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
              }
            }
          ],
          "sfx": [],
          "view": {
            "features": {
              "description": true,
              "sfx": true,
              "subtraits": false
            },
            "page": 1,
            "style": {
              "header": "distinctions",
              "body": "distinctions"
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
              "sfx": {
                "left": "0%",
                "top": 2,
                "width": "100%",
                "height": 1
              }
            }
          },
          "noun": "Distinction",
          "plural": "Distinctions"
        },
        {
          "id": "values",
          "name": "Values",
          "description": "Camper ideals and loyalties",
          "statement": true,
          "hasQuestionedPip": true,
          "traits": [
            {
              "name": "Bravery",
              "statement": "",
              "questioned": false,
              "traits": [],
              "sfx": []
            },
            {
              "name": "Community",
              "statement": "",
              "questioned": false,
              "traits": [],
              "sfx": []
            },
            {
              "name": "Curiosity",
              "statement": "",
              "questioned": false,
              "traits": [],
              "sfx": []
            },
            {
              "name": "Friendship",
              "statement": "",
              "questioned": false,
              "traits": [],
              "sfx": []
            },
            {
              "name": "Mischief",
              "statement": "",
              "questioned": false,
              "traits": [],
              "sfx": []
            }
          ],
          "sfx": [],
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
            }
          },
          "noun": "Value",
          "plural": "Values"
        },
        {
          "id": "signature-assets",
          "name": "Signature Assets",
          "description": "Treasured camper keepsakes and scavenged relics",
          "traits": [],
          "sfx": [],
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
            }
          },
          "noun": "Signature Asset",
          "plural": "Signature Assets"
        },
        {
          "id": "attributes",
          "name": "Attributes",
          "description": "Core camper capability ratings",
          "traits": [
            {
              "name": "Mental",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Physical",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Social",
              "traits": [],
              "sfx": []
            }
          ],
          "sfx": [],
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
            "attributesRing": false,
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
            }
          },
          "noun": "Attribute",
          "plural": "Attributes"
        },
        {
          "id": "paired-slots",
          "name": "Standing",
          "description": "Camp social standing with complication and bonus dice",
          "statement": true,
          "ratingPosition": "inline",
          "traits": [
            {
              "name": "",
              "statement": "",
              "traits": [
                {
                  "name": "COMPLICATION",
                  "traits": [],
                  "sfx": []
                },
                {
                  "name": "BONUS",
                  "traits": [],
                  "sfx": []
                }
              ],
              "sfx": []
            },
            {
              "name": "",
              "statement": "",
              "traits": [
                {
                  "name": "COMPLICATION",
                  "traits": [],
                  "sfx": []
                },
                {
                  "name": "BONUS",
                  "traits": [],
                  "sfx": []
                }
              ],
              "sfx": []
            },
            {
              "name": "",
              "statement": "",
              "traits": [
                {
                  "name": "COMPLICATION",
                  "traits": [],
                  "sfx": []
                },
                {
                  "name": "BONUS",
                  "traits": [],
                  "sfx": []
                }
              ],
              "sfx": []
            },
            {
              "name": "",
              "statement": "",
              "traits": [
                {
                  "name": "COMPLICATION",
                  "traits": [],
                  "sfx": []
                },
                {
                  "name": "BONUS",
                  "traits": [],
                  "sfx": []
                }
              ],
              "sfx": []
            },
            {
              "name": "",
              "statement": "",
              "traits": [
                {
                  "name": "COMPLICATION",
                  "traits": [],
                  "sfx": []
                },
                {
                  "name": "BONUS",
                  "traits": [],
                  "sfx": []
                }
              ],
              "sfx": []
            },
            {
              "name": "",
              "statement": "",
              "traits": [
                {
                  "name": "COMPLICATION",
                  "traits": [],
                  "sfx": []
                },
                {
                  "name": "BONUS",
                  "traits": [],
                  "sfx": []
                }
              ],
              "sfx": []
            }
          ],
          "sfx": [],
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
            }
          },
          "noun": "Standing",
          "plural": "Standings"
        },
        {
          "id": "badges",
          "name": "Badges",
          "description": "Merit badges earned at camp",
          "hasCounterColumn": true,
          "counterLabel": "XP",
          "traits": [],
          "sfx": [],
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
            }
          },
          "noun": "Badge",
          "plural": "Badges"
        },
        {
          "id": "talents",
          "name": "Talents",
          "description": "Camper knacks and signature tricks",
          "traits": [],
          "sfx": [],
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
            }
          },
          "noun": "Talent",
          "plural": "Talents"
        }
      ],
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
      }
    },
    "listing": {
      "url": "https://legacy.drivethrurpg.com/product/574554/Camp-Bewilderwood?manufacturers_id=31866",
      "quote": "Someone has decided you’re destined for great things. You’re twelve.",
      "genre": "Supernatural summer camp / YA adventure",
      "setting": "d8",
      "prep": "d6",
      "complexity": "d8",
      "image": "https://legacy.drivethrurpg.com/images/31866/574554.jpg"
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
      "traitSets": [
        {
          "id": "name",
          "name": "Name",
          "traits": [
            {
              "name": "name",
              "traits": [],
              "sfx": [],
              "label": "Name"
            },
            {
              "name": "player",
              "traits": [],
              "sfx": [],
              "label": "Player"
            },
            {
              "name": "nickname",
              "traits": [],
              "sfx": [],
              "label": "Nickname"
            },
            {
              "name": "pronouns",
              "traits": [],
              "sfx": [],
              "label": "Pronouns"
            },
            {
              "name": "description",
              "traits": [],
              "sfx": [],
              "label": "Description"
            },
            {
              "name": "game",
              "traits": [],
              "sfx": [],
              "label": "Game",
              "view": {
                "visibility": "hidden"
              }
            },
            {
              "name": "portrait",
              "traits": [],
              "sfx": []
            },
            {
              "name": "caption",
              "traits": [],
              "sfx": []
            },
            {
              "name": "plotPoints",
              "traits": [],
              "sfx": [],
              "label": "PP",
              "view": {
                "visibility": "hidden"
              },
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
              "spendable": true
            },
            {
              "name": "notes",
              "traits": [],
              "sfx": [],
              "view": {
                "visibility": "hidden"
              }
            }
          ],
          "sfx": [],
          "view": {
            "style": {
              "header": "default",
              "body": "name"
            },
            "page": 1
          }
        },
        {
          "id": "distinctions",
          "name": "Distinctions",
          "description": "Origins and syndicate reputation (Distinction Stress: Shaken, Rattled, Broken)",
          "traits": [
            {
              "name": "Neighborhood",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Crew",
              "traits": [],
              "sfx": []
            },
            {
              "name": "The Family",
              "traits": [],
              "sfx": []
            }
          ],
          "sfx": [],
          "view": {
            "features": {
              "description": true,
              "sfx": false,
              "subtraits": false
            },
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
              "stressLabel": {
                "left": "60%",
                "top": 0,
                "width": "13%",
                "height": 1
              },
              "stress": {
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
            }
          },
          "noun": "Distinction",
          "plural": "Distinctions"
        },
        {
          "id": "resources",
          "name": "Resources",
          "description": "Syndicate operational pools and assets",
          "traits": [],
          "sfx": [],
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
            }
          },
          "noun": "Resource",
          "plural": "Resources"
        },
        {
          "id": "drives",
          "name": "Drives",
          "description": "Gain a PP when you use a drive rated at d4.",
          "traits": [
            {
              "name": "Corruption",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Greed",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Omerta",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Retribution",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Violence",
              "traits": [],
              "sfx": []
            }
          ],
          "sfx": [],
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
            }
          },
          "noun": "Drive",
          "plural": "Drives"
        },
        {
          "id": "signature-assets",
          "name": "Signature Assets",
          "description": "Personal weapons, vehicles, and syndicate perks",
          "traits": [],
          "sfx": [],
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
            }
          },
          "noun": "Signature Asset",
          "plural": "Signature Assets"
        },
        {
          "id": "roles-specialties",
          "name": "Roles & Specialties",
          "description": "Syndicate roles with specialized criminal expertise",
          "traits": [
            {
              "name": "Big Shot",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Brains",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Enforcer",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Thief",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Wheelman",
              "traits": [],
              "sfx": []
            }
          ],
          "sfx": [],
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
            }
          },
          "noun": "Role",
          "plural": "Roles"
        },
        {
          "id": "session-record",
          "name": "Session Record",
          "description": "Session tracking and milestone progression",
          "traits": [],
          "sfx": [],
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
            }
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
            ],
            "range": [
              15
            ]
          },
          "noun": "Session",
          "plural": "Sessions"
        },
        {
          "id": "role-sfx",
          "name": "Role SFX",
          "traits": [],
          "sfx": [],
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
            }
          },
          "noun": "SFX",
          "plural": "SFX"
        }
      ],
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
      }
    },
    "listing": {
      "url": "https://legacy.drivethrurpg.com/product/572308/Cosa-Nostra?manufacturers_id=31866",
      "quote": "The Castellammarese War is coming. Everyone in the Five Families knows it.",
      "genre": "Historical Crime Drama",
      "setting": "d8",
      "prep": "d6",
      "complexity": "d8",
      "image": "https://legacy.drivethrurpg.com/images/31866/572308.jpg"
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
      "traitSets": [
        {
          "id": "name",
          "name": "Name",
          "traits": [
            {
              "name": "name",
              "traits": [],
              "sfx": [],
              "label": "Name"
            },
            {
              "name": "player",
              "traits": [],
              "sfx": [],
              "label": "Player"
            },
            {
              "name": "nickname",
              "traits": [],
              "sfx": [],
              "label": "Nickname"
            },
            {
              "name": "pronouns",
              "traits": [],
              "sfx": [],
              "label": "Pronouns"
            },
            {
              "name": "description",
              "traits": [],
              "sfx": [],
              "label": "Description"
            },
            {
              "name": "game",
              "traits": [],
              "sfx": [],
              "label": "Game",
              "view": {
                "visibility": "hidden"
              }
            },
            {
              "name": "portrait",
              "traits": [],
              "sfx": []
            },
            {
              "name": "caption",
              "traits": [],
              "sfx": []
            },
            {
              "name": "plotPoints",
              "traits": [],
              "sfx": [],
              "label": "PP",
              "view": {
                "visibility": "hidden"
              },
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
              "spendable": true
            },
            {
              "name": "notes",
              "traits": [],
              "sfx": [],
              "view": {
                "visibility": "hidden"
              }
            }
          ],
          "sfx": [],
          "view": {
            "style": {
              "header": "default",
              "body": "name"
            },
            "page": 1
          }
        },
        {
          "id": "roles",
          "name": "Roles",
          "description": "Prime vocations and endarch callings",
          "traits": [
            {
              "name": "Warrior",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Priest",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Scout",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Other",
              "traits": [],
              "sfx": []
            }
          ],
          "sfx": [],
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
            }
          },
          "noun": "Role",
          "plural": "Roles"
        },
        {
          "id": "attributes",
          "name": "Attributes",
          "description": "Elemental selfhood with highlight circles and stress",
          "hasQuestionedPip": true,
          "traits": [
            {
              "name": "Courage",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Grace",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Guile",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Reason",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Vigor",
              "traits": [],
              "sfx": []
            }
          ],
          "sfx": [],
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
            "attributesRing": false,
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
              "stressLabel": {
                "left": "0%",
                "top": 2,
                "width": "100%",
                "height": 1
              },
              "stress": {
                "left": "0%",
                "top": 3,
                "width": "100%",
                "height": 1
              }
            },
            "labels": {
              "stress": "STRESS"
            }
          },
          "noun": "Attribute",
          "plural": "Attributes"
        },
        {
          "id": "endarch-distinction",
          "name": "Endarch Distinction",
          "description": "Ancestral endarch patron and its three bound powers",
          "traits": [
            {
              "name": "",
              "traits": [
                {
                  "name": "Power 1",
                  "traits": [],
                  "sfx": [],
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
                  }
                },
                {
                  "name": "Power 2",
                  "traits": [],
                  "sfx": [],
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
                  }
                },
                {
                  "name": "Power 3",
                  "traits": [],
                  "sfx": [],
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
                  }
                }
              ],
              "sfx": [
                {
                  "name": "Hinder",
                  "description": "Gain a PP when you switch out your endarch distinction's rating of d8 for a d4."
                },
                {
                  "name": "Summon",
                  "description": "Shut down this endarch distinction to summon your Eidolon on your next turn."
                }
              ],
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
              }
            }
          ],
          "sfx": [],
          "view": {
            "features": {
              "description": true,
              "sfx": true,
              "subtraits": true
            },
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
            "notes": "",
            "reservedSlots": 1,
            "place": {
              "left": "30%",
              "top": 0,
              "width": "60%",
              "height": 1
            }
          },
          "noun": "Endarch Distinction",
          "plural": "Endarch Distinctions"
        },
        {
          "id": "summoned-eidolon",
          "name": "Summoned Eidolon",
          "description": "Manifested eidolon form: base trait, scale, powers, highlights",
          "traits": [
            {
              "name": "Base Trait",
              "description": "d10 d10 or d4 d4",
              "traits": [],
              "sfx": [],
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
              "spendable": true
            },
            {
              "name": "Scale",
              "traits": [],
              "sfx": [],
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
              }
            },
            {
              "name": "Power 1",
              "traits": [],
              "sfx": [],
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
              }
            },
            {
              "name": "Power 2",
              "traits": [],
              "sfx": [],
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
              }
            },
            {
              "name": "Power 3",
              "traits": [],
              "sfx": [],
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
              }
            },
            {
              "name": "Highlight Attribute 1",
              "traits": [],
              "sfx": [],
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
              }
            },
            {
              "name": "Highlight Attribute 2",
              "traits": [],
              "sfx": [],
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
              }
            }
          ],
          "sfx": [],
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
            }
          },
          "noun": "Eidolon Trait",
          "plural": "Eidolon Traits"
        },
        {
          "id": "role-freeform-distinctions",
          "name": "Role & Freeform Distinctions",
          "description": "Chosen calling and personal definition",
          "traits": [
            {
              "name": "Role Distinction",
              "traits": [],
              "sfx": [
                "hinder"
              ],
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
              }
            },
            {
              "name": "Freeform Distinction",
              "traits": [],
              "sfx": [
                "hinder"
              ],
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
              }
            }
          ],
          "sfx": [],
          "view": {
            "features": {
              "description": true,
              "sfx": true,
              "subtraits": false
            },
            "page": 1,
            "style": {
              "header": "distinctions",
              "body": "distinctions"
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
            }
          },
          "noun": "Distinction",
          "plural": "Distinctions"
        },
        {
          "id": "xp",
          "name": "XP",
          "description": "Experience points bubble track",
          "traits": [],
          "sfx": [],
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
            }
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
            ],
            "range": [
              20
            ]
          },
          "noun": "XP",
          "plural": "XP"
        }
      ],
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
      }
    },
    "listing": {
      "url": "https://legacy.drivethrurpg.com/product/567041/Cortex-Prime-Game-Handbook-2nd-Edition?manufacturers_id=31866"
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
      "traitSets": [
        {
          "id": "name",
          "name": "Name",
          "traits": [
            {
              "name": "name",
              "traits": [],
              "sfx": [],
              "label": "Name"
            },
            {
              "name": "player",
              "traits": [],
              "sfx": [],
              "label": "Player"
            },
            {
              "name": "nickname",
              "traits": [],
              "sfx": [],
              "label": "Nickname"
            },
            {
              "name": "pronouns",
              "traits": [],
              "sfx": [],
              "label": "Pronouns"
            },
            {
              "name": "description",
              "traits": [],
              "sfx": [],
              "label": "Description"
            },
            {
              "name": "game",
              "traits": [],
              "sfx": [],
              "label": "Game",
              "view": {
                "visibility": "hidden"
              }
            },
            {
              "name": "portrait",
              "traits": [],
              "sfx": []
            },
            {
              "name": "caption",
              "traits": [],
              "sfx": []
            },
            {
              "name": "plotPoints",
              "traits": [],
              "sfx": [],
              "label": "PP",
              "view": {
                "visibility": "hidden"
              },
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
              "spendable": true
            },
            {
              "name": "notes",
              "traits": [],
              "sfx": [],
              "view": {
                "visibility": "hidden"
              }
            }
          ],
          "sfx": [],
          "view": {
            "style": {
              "header": "default",
              "body": "name"
            },
            "page": 1
          }
        },
        {
          "id": "attributes",
          "name": "Attributes",
          "description": "Body, mind, and presence under pressure",
          "traits": [
            {
              "name": "Physical",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Mental",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Social",
              "traits": [],
              "sfx": []
            }
          ],
          "sfx": [],
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
            "attributesRing": false,
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
              "stressLabel": {
                "left": "0%",
                "top": 2,
                "width": "100%",
                "height": 1
              },
              "stress": {
                "left": "0%",
                "top": 3,
                "width": "100%",
                "height": 1
              }
            },
            "labels": {
              "stress": "STRESS"
            }
          },
          "noun": "Attribute",
          "plural": "Attributes"
        },
        {
          "id": "training-packages",
          "name": "Training Packages",
          "description": "Rescue disciplines and vehicle qualifications",
          "traits": [
            {
              "name": "Crowd Control",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Emergency Medical",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Firefighting",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Hammerhead Pilot",
              "traits": [],
              "sfx": []
            },
            {
              "name": "HAZMAT",
              "traits": [],
              "sfx": []
            },
            {
              "name": "High-Altitude Recovery",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Legal Specialist",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Logistics",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Marine Recovery",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Network Specialist",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Mechanic",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Tactical Response",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Technical Analyst",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Urban Recovery",
              "traits": [],
              "sfx": []
            }
          ],
          "sfx": [],
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
            }
          },
          "noun": "Training Package",
          "plural": "Training Packages"
        },
        {
          "id": "distinctions",
          "name": "Distinctions",
          "description": "Origin, true nature, and defining quirk",
          "traits": [
            {
              "name": "Your Life Before:",
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
              ],
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
              }
            },
            {
              "name": "Your Approach/Attitude:",
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
              ],
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
              }
            },
            {
              "name": "Your Quirk/Quality:",
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
              ],
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
              }
            }
          ],
          "sfx": [],
          "view": {
            "features": {
              "description": true,
              "sfx": true,
              "subtraits": false
            },
            "page": 1,
            "style": {
              "header": "distinctions",
              "body": "distinctions"
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
            }
          },
          "noun": "Distinction",
          "plural": "Distinctions"
        },
        {
          "id": "relationships",
          "name": "Relationships",
          "description": "Crew bonds, debts, and troublemakers",
          "statement": true,
          "traits": [
            {
              "name": "",
              "description": "saved my life",
              "statement": "saved my life",
              "traits": [],
              "sfx": []
            },
            {
              "name": "",
              "description": "owes me big",
              "statement": "owes me big",
              "traits": [],
              "sfx": []
            },
            {
              "name": "",
              "description": "is a troublemaker",
              "statement": "is a troublemaker",
              "traits": [],
              "sfx": []
            },
            {
              "name": "",
              "description": "knows their stuff",
              "statement": "knows their stuff",
              "traits": [],
              "sfx": []
            },
            {
              "name": "",
              "description": "is a liability",
              "statement": "is a liability",
              "traits": [],
              "sfx": []
            },
            {
              "name": "",
              "description": "is dependable",
              "statement": "is dependable",
              "traits": [],
              "sfx": []
            },
            {
              "name": "",
              "description": "is good for a laugh",
              "statement": "is good for a laugh",
              "traits": [],
              "sfx": []
            }
          ],
          "sfx": [],
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
            }
          },
          "noun": "Relationship",
          "plural": "Relationships"
        },
        {
          "id": "xp",
          "name": "XP",
          "description": "Experience points bubble track",
          "traits": [],
          "sfx": [],
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
            }
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
            ],
            "range": [
              20
            ]
          },
          "noun": "XP",
          "plural": "XP"
        },
        {
          "id": "crisis-pools",
          "name": "Crisis Pools",
          "description": "Threat clocks and escalating disaster pools",
          "traits": [],
          "sfx": [],
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
            }
          },
          "noun": "Crisis Pool",
          "plural": "Crisis Pools"
        }
      ],
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
      }
    },
    "listing": {
      "url": "https://legacy.drivethrurpg.com/product/567041/Cortex-Prime-Game-Handbook-2nd-Edition?manufacturers_id=31866"
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
      "traitSets": [
        {
          "id": "name",
          "name": "Name",
          "traits": [
            {
              "name": "name",
              "traits": [],
              "sfx": [],
              "label": "Name"
            },
            {
              "name": "player",
              "traits": [],
              "sfx": [],
              "label": "Player"
            },
            {
              "name": "nickname",
              "traits": [],
              "sfx": [],
              "label": "Nickname"
            },
            {
              "name": "pronouns",
              "traits": [],
              "sfx": [],
              "label": "Pronouns"
            },
            {
              "name": "description",
              "traits": [],
              "sfx": [],
              "label": "Description"
            },
            {
              "name": "game",
              "traits": [],
              "sfx": [],
              "label": "Game",
              "view": {
                "visibility": "hidden"
              }
            },
            {
              "name": "portrait",
              "traits": [],
              "sfx": []
            },
            {
              "name": "caption",
              "traits": [],
              "sfx": []
            },
            {
              "name": "plotPoints",
              "traits": [],
              "sfx": [],
              "label": "PP",
              "view": {
                "visibility": "hidden"
              },
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
              "spendable": true
            },
            {
              "name": "notes",
              "traits": [],
              "sfx": [],
              "view": {
                "visibility": "hidden"
              }
            }
          ],
          "sfx": [],
          "view": {
            "style": {
              "header": "default",
              "body": "name"
            },
            "page": 1
          }
        },
        {
          "id": "hammerhead-attributes",
          "name": "Hammerhead Attributes",
          "description": "Rescue craft airframes, systems, and handling",
          "traits": [
            {
              "name": "Hammerhead One",
              "description": "More agile, possesses more precise sensors and instruments.",
              "traits": [
                {
                  "name": "Systems",
                  "traits": [],
                  "sfx": [],
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
                  }
                },
                {
                  "name": "Engines",
                  "traits": [],
                  "sfx": [],
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
                  }
                },
                {
                  "name": "Frame",
                  "traits": [],
                  "sfx": [],
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
                  }
                }
              ],
              "sfx": []
            },
            {
              "name": "Hammerhead Two",
              "description": "Faster, more power and range.",
              "traits": [
                {
                  "name": "Systems",
                  "traits": [],
                  "sfx": [],
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
                  }
                },
                {
                  "name": "Engines",
                  "traits": [],
                  "sfx": [],
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
                  }
                },
                {
                  "name": "Frame",
                  "traits": [],
                  "sfx": [],
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
                  }
                }
              ],
              "sfx": []
            },
            {
              "name": "Hammerhead Three",
              "description": "Bigger, tougher, and more rugged.",
              "traits": [
                {
                  "name": "Systems",
                  "traits": [],
                  "sfx": [],
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
                  }
                },
                {
                  "name": "Engines",
                  "traits": [],
                  "sfx": [],
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
                  }
                },
                {
                  "name": "Frame",
                  "traits": [],
                  "sfx": [],
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
                  }
                }
              ],
              "sfx": []
            }
          ],
          "sfx": [],
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
            }
          },
          "noun": "Hammerhead Attribute",
          "plural": "Hammerhead Attributes"
        },
        {
          "id": "vehicle-distinctions",
          "name": "Vehicle Distinctions",
          "description": "Factory blessings and fleet reputation",
          "traits": [
            {
              "name": "Resource Support Vehicle",
              "traits": [],
              "sfx": [],
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
              }
            },
            {
              "name": "Top of the Line",
              "traits": [],
              "sfx": [],
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
              }
            },
            {
              "name": "Broad-Spectrum Sensors",
              "traits": [],
              "sfx": [],
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
              }
            }
          ],
          "sfx": [],
          "view": {
            "features": {
              "description": false,
              "sfx": false,
              "subtraits": false
            },
            "page": 1,
            "style": {
              "header": "distinctions",
              "body": "distinctions"
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
            }
          },
          "noun": "Vehicle Distinction",
          "plural": "Vehicle Distinctions"
        },
        {
          "id": "resource-pools",
          "name": "Resource Pools",
          "description": "Staged supplies, support teams, and fleet backup",
          "traits": [
            {
              "name": "Unassigned Resources",
              "traits": [],
              "sfx": [],
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
              "hitches": 0
            },
            {
              "name": "Tactical Support",
              "traits": [],
              "sfx": [],
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
              "hitches": 0
            },
            {
              "name": "Medical Supplies",
              "traits": [],
              "sfx": [],
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
              "hitches": 0
            },
            {
              "name": "IT/Network Support",
              "traits": [],
              "sfx": [],
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
              "hitches": 0
            },
            {
              "name": "Food/Shelter",
              "traits": [],
              "sfx": [],
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
              "hitches": 0
            },
            {
              "name": "Land/Sea/Air Support",
              "traits": [],
              "sfx": [],
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
              "hitches": 0
            }
          ],
          "sfx": [],
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
            }
          },
          "noun": "Resource Pool",
          "plural": "Resource Pools"
        }
      ],
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
      }
    },
    "listing": {
      "url": "https://legacy.drivethrurpg.com/product/567041/Cortex-Prime-Game-Handbook-2nd-Edition?manufacturers_id=31866"
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
      "traitSets": [
        {
          "id": "name",
          "name": "Name",
          "traits": [
            {
              "name": "name",
              "traits": [],
              "sfx": [],
              "label": "Name"
            },
            {
              "name": "player",
              "traits": [],
              "sfx": [],
              "label": "Player"
            },
            {
              "name": "nickname",
              "traits": [],
              "sfx": [],
              "label": "Nickname"
            },
            {
              "name": "pronouns",
              "traits": [],
              "sfx": [],
              "label": "Pronouns"
            },
            {
              "name": "description",
              "traits": [],
              "sfx": [],
              "label": "Description"
            },
            {
              "name": "game",
              "traits": [],
              "sfx": [],
              "label": "Game",
              "view": {
                "visibility": "hidden"
              }
            },
            {
              "name": "portrait",
              "traits": [],
              "sfx": []
            },
            {
              "name": "caption",
              "traits": [],
              "sfx": []
            },
            {
              "name": "plotPoints",
              "traits": [],
              "sfx": [],
              "label": "PP",
              "view": {
                "visibility": "hidden"
              },
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
              "spendable": true
            },
            {
              "name": "notes",
              "traits": [],
              "sfx": [],
              "view": {
                "visibility": "hidden"
              }
            }
          ],
          "sfx": [],
          "view": {
            "style": {
              "header": "default",
              "body": "name"
            },
            "page": 1
          }
        },
        {
          "id": "attributes",
          "name": "Attributes",
          "description": "Gain a PP when you include your d4 attribute in your dice pool.",
          "traits": [
            {
              "name": "Action",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Heritage",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Science",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Weird",
              "traits": [],
              "sfx": []
            }
          ],
          "sfx": [],
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
            "attributesRing": false,
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
            }
          },
          "noun": "Attribute",
          "plural": "Attributes"
        },
        {
          "id": "stress",
          "name": "Stress",
          "traits": [],
          "sfx": [],
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
            }
          },
          "noun": "Stress",
          "plural": "Stress"
        },
        {
          "id": "distinctions",
          "name": "Distinctions",
          "description": "Bloodline heritage, archetype, and personal stance",
          "traits": [
            {
              "name": "Family Tree",
              "traits": [],
              "sfx": [
                "hinder",
                {
                  "name": "Family Ties",
                  "description": "Spend a PP to get aid or advice from a member of your family tree in the form of a d8 asset."
                }
              ],
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
              }
            },
            {
              "name": "Approach to Conflict",
              "traits": [],
              "sfx": [
                "hinder"
              ],
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
              }
            },
            {
              "name": "Personality/Quirk",
              "traits": [],
              "sfx": [
                "hinder"
              ],
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
              }
            }
          ],
          "sfx": [],
          "view": {
            "features": {
              "description": true,
              "sfx": true,
              "subtraits": false
            },
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
            "notes": "",
            "reservedSlots": 3,
            "place": {
              "left": "28%",
              "top": 0,
              "width": "72%",
              "height": 1
            }
          },
          "noun": "Distinction",
          "plural": "Distinctions"
        },
        {
          "id": "inherited-abilities",
          "name": "Abilities",
          "description": "Powers granted by bloodline and relics",
          "traits": [
            {
              "name": "",
              "traits": [
                {
                  "name": "Effect Tags:",
                  "traits": [],
                  "sfx": []
                },
                {
                  "name": "Limit:",
                  "traits": [],
                  "sfx": []
                }
              ],
              "sfx": []
            },
            {
              "name": "",
              "traits": [
                {
                  "name": "Effect Tags:",
                  "traits": [],
                  "sfx": []
                },
                {
                  "name": "Limit:",
                  "traits": [],
                  "sfx": []
                }
              ],
              "sfx": []
            },
            {
              "name": "",
              "traits": [
                {
                  "name": "Effect Tags:",
                  "traits": [],
                  "sfx": []
                },
                {
                  "name": "Limit:",
                  "traits": [],
                  "sfx": []
                }
              ],
              "sfx": []
            }
          ],
          "sfx": [],
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
              "sfx": {
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
            }
          },
          "noun": "Ability",
          "plural": "Abilities"
        },
        {
          "id": "skills",
          "name": "Skills",
          "description": "Training and mundane competencies",
          "traits": [
            {
              "name": "Acquire",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Build",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Charm",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Fight",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Investigate",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Move",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Perform",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Pilot",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Shoot",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Sneak",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Study",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Survive",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Treat",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Trick",
              "traits": [],
              "sfx": []
            }
          ],
          "sfx": [],
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
            }
          },
          "noun": "Skill",
          "plural": "Skills"
        },
        {
          "id": "heirlooms-milestones",
          "name": "Heirlooms",
          "description": "Item: Oh, There It Is. Spend a PP to declare that the item, if you didn't have it at the beginning of the scene, is now in your possession despite it being narratively improbable.\nVehicle: I'm Here! Spend a PP to use a vehicle to enter any scene that the vehicle can get you to.\nBase: Resourceful. Spend a PP to reveal that you have brought something useful from your base, thus allowing you to roll the heirloom in subsequent related actions.\nPet: Proxy. Spend a PP to affect a scene where you aren't physically present but your pet is. While you build your dice pool as normal, you're limited to actions your pet can perform.",
          "traits": [],
          "sfx": [],
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
            }
          },
          "noun": "Heirloom",
          "plural": "Heirlooms"
        },
        {
          "id": "personal-milestones",
          "name": "Personal Milestones",
          "traits": [
            {
              "name": "1 XP",
              "description": "when ",
              "traits": [],
              "sfx": []
            },
            {
              "name": "3 XP",
              "description": "when ",
              "traits": [],
              "sfx": []
            },
            {
              "name": "10 XP",
              "description": "when ",
              "traits": [],
              "sfx": []
            }
          ],
          "sfx": [],
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
            }
          },
          "noun": "Milestone",
          "plural": "Milestones"
        },
        {
          "id": "group-milestones",
          "name": "Group Milestones",
          "traits": [
            {
              "name": "1 XP",
              "description": "when ",
              "traits": [],
              "sfx": []
            },
            {
              "name": "3 XP",
              "description": "when ",
              "traits": [],
              "sfx": []
            },
            {
              "name": "10 XP",
              "description": "when ",
              "traits": [],
              "sfx": []
            }
          ],
          "sfx": [],
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
            }
          },
          "noun": "Milestone",
          "plural": "Milestones"
        },
        {
          "id": "xp",
          "name": "XP",
          "traits": [],
          "sfx": [],
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
            }
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
            ],
            "range": [
              25
            ]
          },
          "noun": "Pip",
          "plural": "Pips"
        }
      ],
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
      }
    },
    "listing": {
      "url": "https://legacy.drivethrurpg.com/product/572309/Inheritors?manufacturers_id=31866",
      "quote": "Your grandfather stopped an immortal warlord using nothing but a biplane and a stolen amulet. Your great-aunt discovered a lost civilization and barely made it out with her notes.",
      "genre": "Modern Pulp Action-Adventure",
      "setting": "d6",
      "prep": "d10",
      "complexity": "d8",
      "image": "https://legacy.drivethrurpg.com/images/31866/572309.jpg"
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
      "traitSets": [
        {
          "id": "name",
          "name": "Name",
          "traits": [
            {
              "name": "name",
              "traits": [],
              "sfx": [],
              "label": "Name"
            },
            {
              "name": "player",
              "traits": [],
              "sfx": [],
              "label": "Player"
            },
            {
              "name": "nickname",
              "traits": [],
              "sfx": [],
              "label": "Nickname"
            },
            {
              "name": "pronouns",
              "traits": [],
              "sfx": [],
              "label": "Pronouns"
            },
            {
              "name": "description",
              "traits": [],
              "sfx": [],
              "label": "Description"
            },
            {
              "name": "game",
              "traits": [],
              "sfx": [],
              "label": "Game",
              "view": {
                "visibility": "hidden"
              }
            },
            {
              "name": "portrait",
              "traits": [],
              "sfx": []
            },
            {
              "name": "caption",
              "traits": [],
              "sfx": []
            },
            {
              "name": "plotPoints",
              "traits": [],
              "sfx": [],
              "label": "PP",
              "view": {
                "visibility": "hidden"
              },
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
              "spendable": true
            },
            {
              "name": "notes",
              "traits": [],
              "sfx": [],
              "view": {
                "visibility": "hidden"
              }
            }
          ],
          "sfx": [],
          "view": {
            "style": {
              "header": "default",
              "body": "name"
            },
            "page": 1
          }
        },
        {
          "id": "your-generation",
          "name": "Your Generation",
          "traits": [
            {
              "name": "Name",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Description",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Fame",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Features",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Deed",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Current Fate",
              "traits": [],
              "sfx": []
            }
          ],
          "sfx": [],
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
            }
          },
          "noun": "Detail",
          "plural": "Details"
        },
        {
          "id": "parents-generation-a",
          "name": "Parents' Generation",
          "traits": [
            {
              "name": "Name",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Description",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Fame",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Features",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Deed",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Current Fate",
              "traits": [],
              "sfx": []
            }
          ],
          "sfx": [],
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
            }
          },
          "noun": "Detail",
          "plural": "Details"
        },
        {
          "id": "parents-generation-b",
          "name": "Parents' Generation",
          "traits": [
            {
              "name": "Name",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Description",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Fame",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Features",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Deed",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Current Fate",
              "traits": [],
              "sfx": []
            }
          ],
          "sfx": [],
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
            }
          },
          "noun": "Detail",
          "plural": "Details"
        },
        {
          "id": "grandparents-generation-a",
          "name": "Grandparents' Generation",
          "traits": [
            {
              "name": "Name",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Description",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Fame",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Features",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Deed",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Current Fate",
              "traits": [],
              "sfx": []
            }
          ],
          "sfx": [],
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
            }
          },
          "noun": "Detail",
          "plural": "Details"
        },
        {
          "id": "grandparents-generation-b",
          "name": "Grandparents' Generation",
          "traits": [
            {
              "name": "Name",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Description",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Fame",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Features",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Deed",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Current Fate",
              "traits": [],
              "sfx": []
            }
          ],
          "sfx": [],
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
            }
          },
          "noun": "Detail",
          "plural": "Details"
        },
        {
          "id": "wild-card-a",
          "name": "Wild Card Branch",
          "traits": [
            {
              "name": "Name",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Description",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Fame",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Features",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Deed",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Current Fate",
              "traits": [],
              "sfx": []
            }
          ],
          "sfx": [],
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
            }
          },
          "noun": "Detail",
          "plural": "Details"
        },
        {
          "id": "wild-card-b",
          "name": "Wild Card Branch",
          "traits": [
            {
              "name": "Name",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Description",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Fame",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Features",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Deed",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Current Fate",
              "traits": [],
              "sfx": []
            }
          ],
          "sfx": [],
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
            }
          },
          "noun": "Detail",
          "plural": "Details"
        },
        {
          "id": "wild-card-c",
          "name": "Wild Card Branch",
          "traits": [
            {
              "name": "Name",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Description",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Fame",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Features",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Deed",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Current Fate",
              "traits": [],
              "sfx": []
            }
          ],
          "sfx": [],
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
            }
          },
          "noun": "Detail",
          "plural": "Details"
        },
        {
          "id": "wild-card-d",
          "name": "Wild Card Branch",
          "traits": [
            {
              "name": "Name",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Description",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Fame",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Features",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Deed",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Current Fate",
              "traits": [],
              "sfx": []
            }
          ],
          "sfx": [],
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
            }
          },
          "noun": "Detail",
          "plural": "Details"
        },
        {
          "id": "wild-card-e",
          "name": "Wild Card Branch",
          "traits": [
            {
              "name": "Name",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Description",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Fame",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Features",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Deed",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Current Fate",
              "traits": [],
              "sfx": []
            }
          ],
          "sfx": [],
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
            }
          },
          "noun": "Detail",
          "plural": "Details"
        },
        {
          "id": "gmc-a",
          "name": "GMC",
          "traits": [
            {
              "name": "Name",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Relationship to PCs",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Relationship to GMCs",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Description",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Fame",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Features",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Deed",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Current Fate",
              "traits": [],
              "sfx": []
            }
          ],
          "sfx": [],
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
            }
          },
          "noun": "Detail",
          "plural": "Details"
        },
        {
          "id": "gmc-b",
          "name": "GMC",
          "traits": [
            {
              "name": "Name",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Relationship to PCs",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Relationship to GMCs",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Description",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Fame",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Features",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Deed",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Current Fate",
              "traits": [],
              "sfx": []
            }
          ],
          "sfx": [],
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
            }
          },
          "noun": "Detail",
          "plural": "Details"
        },
        {
          "id": "gmc-c",
          "name": "GMC",
          "traits": [
            {
              "name": "Name",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Relationship to PCs",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Relationship to GMCs",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Description",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Fame",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Features",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Deed",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Current Fate",
              "traits": [],
              "sfx": []
            }
          ],
          "sfx": [],
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
            }
          },
          "noun": "Detail",
          "plural": "Details"
        },
        {
          "id": "gmc-d",
          "name": "GMC",
          "traits": [
            {
              "name": "Name",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Relationship to PCs",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Relationship to GMCs",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Description",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Fame",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Features",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Deed",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Current Fate",
              "traits": [],
              "sfx": []
            }
          ],
          "sfx": [],
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
            }
          },
          "noun": "Detail",
          "plural": "Details"
        },
        {
          "id": "gmc-e",
          "name": "GMC",
          "traits": [
            {
              "name": "Name",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Relationship to PCs",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Relationship to GMCs",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Description",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Fame",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Features",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Deed",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Current Fate",
              "traits": [],
              "sfx": []
            }
          ],
          "sfx": [],
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
            }
          },
          "noun": "Detail",
          "plural": "Details"
        },
        {
          "id": "gmc-f",
          "name": "GMC",
          "traits": [
            {
              "name": "Name",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Relationship to PCs",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Relationship to GMCs",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Description",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Fame",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Features",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Deed",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Current Fate",
              "traits": [],
              "sfx": []
            }
          ],
          "sfx": [],
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
            }
          },
          "noun": "Detail",
          "plural": "Details"
        }
      ],
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
      }
    },
    "listing": {
      "url": "https://legacy.drivethrurpg.com/product/572309/Inheritors?manufacturers_id=31866",
      "quote": "Your grandfather stopped an immortal warlord using nothing but a biplane and a stolen amulet. Your great-aunt discovered a lost civilization and barely made it out with her notes.",
      "genre": "Modern Pulp Action-Adventure",
      "setting": "d6",
      "prep": "d10",
      "complexity": "d8",
      "image": "https://legacy.drivethrurpg.com/images/31866/572309.jpg"
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
      "traitSets": [
        {
          "id": "name",
          "name": "Name",
          "traits": [
            {
              "name": "name",
              "traits": [],
              "sfx": [],
              "label": "Name"
            },
            {
              "name": "player",
              "traits": [],
              "sfx": [],
              "label": "Player"
            },
            {
              "name": "nickname",
              "traits": [],
              "sfx": [],
              "label": "Nickname"
            },
            {
              "name": "pronouns",
              "traits": [],
              "sfx": [],
              "label": "Pronouns"
            },
            {
              "name": "description",
              "traits": [],
              "sfx": [],
              "label": "Description"
            },
            {
              "name": "game",
              "traits": [],
              "sfx": [],
              "label": "Game",
              "view": {
                "visibility": "hidden"
              }
            },
            {
              "name": "portrait",
              "traits": [],
              "sfx": []
            },
            {
              "name": "caption",
              "traits": [],
              "sfx": []
            },
            {
              "name": "plotPoints",
              "traits": [],
              "sfx": [],
              "label": "PP",
              "view": {
                "visibility": "hidden"
              },
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
              "spendable": true
            },
            {
              "name": "notes",
              "traits": [],
              "sfx": [],
              "view": {
                "visibility": "hidden"
              }
            }
          ],
          "sfx": [],
          "view": {
            "style": {
              "header": "default",
              "body": "name"
            },
            "page": 1
          }
        },
        {
          "id": "distinctions",
          "name": "Distinctions",
          "description": "Origin, motivation, and crime-fighting persona",
          "traits": [
            {
              "name": "Personality:",
              "traits": [],
              "sfx": [
                "hinder"
              ],
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
              }
            },
            {
              "name": "Past:",
              "traits": [],
              "sfx": [
                "hinder"
              ],
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
              }
            },
            {
              "name": "Quirk:",
              "traits": [],
              "sfx": [
                "hinder"
              ],
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
              }
            }
          ],
          "sfx": [],
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
              "header": "distinctions",
              "body": "distinctions"
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
            }
          },
          "noun": "Distinction",
          "plural": "Distinctions"
        },
        {
          "id": "affiliations",
          "name": "Affiliations",
          "description": "Operating mode ratings",
          "traits": [
            {
              "name": "Personal:",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Group:",
              "traits": [],
              "sfx": []
            },
            {
              "name": "World:",
              "traits": [],
              "sfx": []
            }
          ],
          "sfx": [],
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
            }
          },
          "noun": "Affiliation",
          "plural": "Affiliations"
        },
        {
          "id": "specialties",
          "name": "Specialties",
          "description": "Master and expert professional skills",
          "traits": [],
          "sfx": [],
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
            }
          },
          "noun": "Specialty",
          "plural": "Specialties"
        },
        {
          "id": "signature-assets",
          "name": "Signature Assets",
          "description": "Heroic gear and vehicles",
          "traits": [],
          "sfx": [],
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
            }
          },
          "noun": "Signature Asset",
          "plural": "Signature Assets"
        },
        {
          "id": "stress",
          "name": "Stress",
          "traits": [
            {
              "name": "Physical",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Mental",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Social",
              "traits": [],
              "sfx": []
            }
          ],
          "sfx": [],
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
            }
          },
          "noun": "Stress",
          "plural": "Stress"
        },
        {
          "id": "growth-pool",
          "name": "Growth Pool",
          "traits": [
            {
              "name": "D4",
              "traits": [],
              "sfx": [],
              "view": {
                "poolCount": 1
              },
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
              "hitches": 0
            },
            {
              "name": "D6",
              "traits": [],
              "sfx": [],
              "view": {
                "poolCount": 1
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
              "spendable": true,
              "hitches": 0
            },
            {
              "name": "D8",
              "traits": [],
              "sfx": [],
              "view": {
                "poolCount": 1
              },
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
              "hitches": 0
            },
            {
              "name": "D10",
              "traits": [],
              "sfx": [],
              "view": {
                "poolCount": 1
              },
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
              "hitches": 0
            },
            {
              "name": "D12",
              "traits": [],
              "sfx": [],
              "view": {
                "poolCount": 1
              },
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
              "hitches": 0
            }
          ],
          "sfx": [],
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
            }
          },
          "pool": true,
          "noun": "Growth Die",
          "plural": "Growth Dice"
        },
        {
          "id": "power-set",
          "name": "Power Set 1",
          "description": "Modular powers, SFX triggers, and shutdown limits",
          "traits": [
            {
              "name": "Powers",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Limits",
              "traits": [],
              "sfx": []
            }
          ],
          "sfx": [],
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
            "reservedSlots": 3
          },
          "noun": "Power Set",
          "plural": "Power Sets"
        },
        {
          "id": "power-set-2",
          "name": "Power Set 2",
          "traits": [
            {
              "name": "Powers",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Limits",
              "traits": [],
              "sfx": []
            }
          ],
          "sfx": [],
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
            }
          },
          "noun": "Power",
          "plural": "Powers"
        },
        {
          "id": "power-set-3",
          "name": "Power Set 3",
          "traits": [
            {
              "name": "Powers",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Limits",
              "traits": [],
              "sfx": []
            }
          ],
          "sfx": [],
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
            }
          },
          "noun": "Power",
          "plural": "Powers"
        }
      ],
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
      }
    },
    "listing": {
      "url": "https://legacy.drivethrurpg.com/product/568416/Kit-Bash?manufacturers_id=31866",
      "quote": "You want to run a superhero campaign, but you’re sick of starting with someone else’s universe. What if the table built the world together, from scratch, before the first punch is thrown?",
      "genre": "Superhero",
      "setting": "d6",
      "prep": "d12",
      "complexity": "d8",
      "image": "https://legacy.drivethrurpg.com/images/31866/568416.jpg"
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
      "traitSets": [
        {
          "id": "name",
          "name": "Name",
          "traits": [
            {
              "name": "name",
              "traits": [],
              "sfx": [],
              "label": "Name"
            },
            {
              "name": "player",
              "traits": [],
              "sfx": [],
              "label": "Player"
            },
            {
              "name": "nickname",
              "traits": [],
              "sfx": [],
              "label": "Nickname"
            },
            {
              "name": "pronouns",
              "traits": [],
              "sfx": [],
              "label": "Pronouns"
            },
            {
              "name": "description",
              "traits": [],
              "sfx": [],
              "label": "Description"
            },
            {
              "name": "game",
              "traits": [],
              "sfx": [],
              "label": "Game",
              "view": {
                "visibility": "hidden"
              }
            },
            {
              "name": "portrait",
              "traits": [],
              "sfx": []
            },
            {
              "name": "caption",
              "traits": [],
              "sfx": []
            },
            {
              "name": "plotPoints",
              "traits": [],
              "sfx": [],
              "label": "PP",
              "view": {
                "visibility": "hidden"
              },
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
              "spendable": true
            },
            {
              "name": "notes",
              "traits": [],
              "sfx": [],
              "view": {
                "visibility": "hidden"
              }
            }
          ],
          "sfx": [],
          "view": {
            "style": {
              "header": "default",
              "body": "name"
            },
            "page": 1
          }
        },
        {
          "id": "team-base",
          "name": "Team Base",
          "description": "As a group, decide on the following information.",
          "traits": [
            {
              "name": "Name",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Location",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Description",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Benefits",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Drawbacks",
              "traits": [],
              "sfx": []
            }
          ],
          "sfx": [],
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
            }
          },
          "noun": "Detail",
          "plural": "Details"
        },
        {
          "id": "team-resources",
          "name": "Team Resources",
          "traits": [],
          "sfx": [],
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
            }
          },
          "noun": "Resource",
          "plural": "Resources"
        }
      ],
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
      }
    },
    "listing": {
      "url": "https://legacy.drivethrurpg.com/product/568416/Kit-Bash?manufacturers_id=31866",
      "quote": "You want to run a superhero campaign, but you’re sick of starting with someone else’s universe. What if the table built the world together, from scratch, before the first punch is thrown?",
      "genre": "Superhero",
      "setting": "d6",
      "prep": "d12",
      "complexity": "d8",
      "image": "https://legacy.drivethrurpg.com/images/31866/568416.jpg"
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
      "traitSets": [
        {
          "id": "name",
          "name": "Name",
          "traits": [
            {
              "name": "name",
              "traits": [],
              "sfx": [],
              "label": "Name"
            },
            {
              "name": "player",
              "traits": [],
              "sfx": [],
              "label": "Player"
            },
            {
              "name": "nickname",
              "traits": [],
              "sfx": [],
              "label": "Nickname"
            },
            {
              "name": "pronouns",
              "traits": [],
              "sfx": [],
              "label": "Pronouns"
            },
            {
              "name": "description",
              "traits": [],
              "sfx": [],
              "label": "Description"
            },
            {
              "name": "game",
              "traits": [],
              "sfx": [],
              "label": "Game",
              "view": {
                "visibility": "hidden"
              }
            },
            {
              "name": "portrait",
              "traits": [],
              "sfx": []
            },
            {
              "name": "caption",
              "traits": [],
              "sfx": []
            },
            {
              "name": "plotPoints",
              "traits": [],
              "sfx": [],
              "label": "PP",
              "view": {
                "visibility": "hidden"
              },
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
              "spendable": true
            },
            {
              "name": "notes",
              "traits": [],
              "sfx": [],
              "view": {
                "visibility": "hidden"
              }
            }
          ],
          "sfx": [],
          "view": {
            "style": {
              "header": "default",
              "body": "name"
            },
            "page": 1
          }
        },
        {
          "id": "distinctions",
          "name": "Distinctions",
          "description": "Coastal heritage, town role, and personal quirk",
          "traits": [
            {
              "name": "Extraordinary:",
              "traits": [],
              "sfx": [
                "hinder"
              ]
            },
            {
              "name": "Backstory:",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Role:",
              "traits": [],
              "sfx": []
            }
          ],
          "sfx": [],
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
              "header": "distinctions",
              "body": "distinctions"
            },
            "multiDie": false,
            "notes": "",
            "reservedSlots": 3,
            "place": {
              "left": "0%",
              "top": 0,
              "width": "64%",
              "height": 1
            }
          },
          "noun": "Distinction",
          "plural": "Distinctions"
        },
        {
          "id": "signature-assets-curios",
          "name": "Signature Assets",
          "description": "Heirlooms and keepsakes from the misty coast",
          "traits": [],
          "sfx": [],
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
            }
          },
          "noun": "Signature Asset",
          "plural": "Signature Assets"
        },
        {
          "id": "emotional-attributes-stress",
          "name": "Attributes",
          "description": "Core emotional drives with corresponding statements and stress",
          "statement": true,
          "traits": [
            {
              "name": "Anger",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Desire",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Fear",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Joy",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Sorrow",
              "traits": [],
              "sfx": []
            }
          ],
          "sfx": [],
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
            "attributesRing": false,
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
              "stressLabel": {
                "left": "60%",
                "top": 0,
                "width": "13%",
                "height": 1
              },
              "stress": {
                "left": "73%",
                "top": 0,
                "width": "27%",
                "height": 1
              }
            },
            "labels": {
              "stress": "STRESS"
            }
          },
          "noun": "Attribute",
          "plural": "Attributes"
        },
        {
          "id": "town-relationships",
          "name": "Relationships",
          "description": "Bonds and rivalries with local residents",
          "traits": [],
          "sfx": [],
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
            }
          },
          "noun": "Relationship",
          "plural": "Relationships"
        },
        {
          "id": "growth-pool",
          "name": "Growth Pool",
          "traits": [
            {
              "name": "D4",
              "traits": [],
              "sfx": [],
              "view": {
                "poolCount": 1
              },
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
              "hitches": 0
            },
            {
              "name": "D6",
              "traits": [],
              "sfx": [],
              "view": {
                "poolCount": 1
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
              "spendable": true,
              "hitches": 0
            },
            {
              "name": "D8",
              "traits": [],
              "sfx": [],
              "view": {
                "poolCount": 1
              },
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
              "hitches": 0
            },
            {
              "name": "D10",
              "traits": [],
              "sfx": [],
              "view": {
                "poolCount": 1
              },
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
              "hitches": 0
            },
            {
              "name": "D12",
              "traits": [],
              "sfx": [],
              "view": {
                "poolCount": 1
              },
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
              "hitches": 0
            }
          ],
          "sfx": [],
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
            }
          },
          "pool": true,
          "noun": "Growth Die",
          "plural": "Growth Dice"
        },
        {
          "id": "complications",
          "name": "Complications",
          "traits": [],
          "sfx": [],
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
            }
          },
          "noun": "Complication",
          "plural": "Complications"
        }
      ],
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
      }
    },
    "listing": {
      "url": "https://legacy.drivethrurpg.com/product/568414/Misty-Cove?manufacturers_id=31866",
      "quote": "The town knows you’re different. They always have.",
      "genre": "Small-town supernatural drama",
      "setting": "d6",
      "prep": "d6",
      "complexity": "d8",
      "image": "https://legacy.drivethrurpg.com/images/31866/568414.jpg"
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
      "traitSets": [
        {
          "id": "name",
          "name": "Name",
          "traits": [
            {
              "name": "name",
              "traits": [],
              "sfx": [],
              "label": "Name"
            },
            {
              "name": "player",
              "traits": [],
              "sfx": [],
              "label": "Player"
            },
            {
              "name": "nickname",
              "traits": [],
              "sfx": [],
              "label": "Nickname"
            },
            {
              "name": "pronouns",
              "traits": [],
              "sfx": [],
              "label": "Pronouns"
            },
            {
              "name": "description",
              "traits": [],
              "sfx": [],
              "label": "Description"
            },
            {
              "name": "game",
              "traits": [],
              "sfx": [],
              "label": "Game",
              "view": {
                "visibility": "hidden"
              }
            },
            {
              "name": "portrait",
              "traits": [],
              "sfx": []
            },
            {
              "name": "caption",
              "traits": [],
              "sfx": []
            },
            {
              "name": "plotPoints",
              "traits": [],
              "sfx": [],
              "label": "PP",
              "view": {
                "visibility": "hidden"
              },
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
              "spendable": true
            },
            {
              "name": "notes",
              "traits": [],
              "sfx": [],
              "view": {
                "visibility": "hidden"
              }
            }
          ],
          "sfx": [],
          "view": {
            "style": {
              "header": "default",
              "body": "name"
            },
            "page": 1
          }
        },
        {
          "id": "distinctions",
          "name": "Distinctions",
          "description": "Occult lineage, taboo practice, and philosophical motivation",
          "traits": [
            {
              "name": "Job:",
              "traits": [],
              "sfx": [
                "hinder"
              ],
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
              }
            },
            {
              "name": "Necromancy:",
              "traits": [],
              "sfx": [
                "hinder"
              ],
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
              }
            },
            {
              "name": "Desire:",
              "traits": [],
              "sfx": [
                "hinder"
              ],
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
              }
            }
          ],
          "sfx": [],
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
              "header": "distinctions",
              "body": "distinctions"
            },
            "multiDie": false,
            "notes": "",
            "reservedSlots": 3
          },
          "noun": "Distinction",
          "plural": "Distinctions"
        },
        {
          "id": "affiliations",
          "name": "Affiliations",
          "description": "Operating configuration dice and statements",
          "statement": true,
          "traits": [
            {
              "name": "My Life",
              "traits": [],
              "sfx": []
            },
            {
              "name": "The World",
              "traits": [],
              "sfx": []
            },
            {
              "name": "The Demi-Monde",
              "traits": [],
              "sfx": []
            }
          ],
          "sfx": [],
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
            }
          },
          "noun": "Affiliation",
          "plural": "Affiliations"
        },
        {
          "id": "roles-specialties",
          "name": "Roles",
          "description": "Dark magical callings and practices",
          "traits": [
            {
              "name": "Diplomat",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Fighter",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Guardian",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Healer",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Sneak",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Transporter",
              "traits": [],
              "sfx": []
            }
          ],
          "sfx": [],
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
            }
          },
          "noun": "Role",
          "plural": "Roles"
        },
        {
          "id": "signature-assets",
          "name": "Signature Assets",
          "description": "Occult relics, grimoires, and dark instruments",
          "traits": [],
          "sfx": [],
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
            }
          },
          "noun": "Signature Asset",
          "plural": "Signature Assets"
        },
        {
          "id": "necromantic-arts",
          "name": "Ability",
          "description": "EFFECT TAGS: ATTACK • SENSORY • MOVEMENT • CONTROL • DEFENSE • ENHANCEMENT",
          "traits": [
            {
              "name": "Necromancy",
              "traits": [
                {
                  "name": "Descriptor Tags:",
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
                }
              ]
            }
          ],
          "sfx": [],
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
            }
          },
          "noun": "Ability",
          "plural": "Abilities"
        },
        {
          "id": "session-record",
          "name": "Session Record",
          "traits": [],
          "sfx": [],
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
            }
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
            ],
            "range": [
              10
            ]
          },
          "noun": "Session",
          "plural": "Sessions"
        },
        {
          "id": "complications",
          "name": "Complications",
          "traits": [
            {
              "name": "Deathmark",
              "description": "Deathmark",
              "traits": [],
              "sfx": []
            }
          ],
          "sfx": [],
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
            }
          },
          "noun": "Complication",
          "plural": "Complications"
        }
      ],
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
      }
    },
    "listing": {
      "url": "https://legacy.drivethrurpg.com/product/574557/Necromancer?manufacturers_id=31866",
      "quote": "You didn’t ask for this. You were just trying to live your life.",
      "genre": "Urban fantasy",
      "setting": "d8",
      "prep": "d6",
      "complexity": "d8",
      "image": "https://legacy.drivethrurpg.com/images/31866/574557.jpg"
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
      "traitSets": [
        {
          "id": "name",
          "name": "Name",
          "traits": [
            {
              "name": "name",
              "traits": [],
              "sfx": [],
              "label": "Name"
            },
            {
              "name": "player",
              "traits": [],
              "sfx": [],
              "label": "Player"
            },
            {
              "name": "nickname",
              "traits": [],
              "sfx": [],
              "label": "Nickname"
            },
            {
              "name": "pronouns",
              "traits": [],
              "sfx": [],
              "label": "Pronouns"
            },
            {
              "name": "description",
              "traits": [],
              "sfx": [],
              "label": "Description"
            },
            {
              "name": "game",
              "traits": [],
              "sfx": [],
              "label": "Game",
              "view": {
                "visibility": "hidden"
              }
            },
            {
              "name": "portrait",
              "traits": [],
              "sfx": []
            },
            {
              "name": "caption",
              "traits": [],
              "sfx": []
            },
            {
              "name": "plotPoints",
              "traits": [],
              "sfx": [],
              "label": "PP",
              "view": {
                "visibility": "hidden"
              },
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
              "spendable": true
            },
            {
              "name": "notes",
              "traits": [],
              "sfx": [],
              "view": {
                "visibility": "hidden"
              }
            }
          ],
          "sfx": [],
          "view": {
            "style": {
              "header": "default",
              "body": "name"
            },
            "page": 1
          }
        },
        {
          "id": "values",
          "name": "Values",
          "description": "Enduring principles of the golden era",
          "traits": [
            {
              "name": "Allegiance",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Glory",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Integrity",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Knowledge",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Novelty",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Power",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Riches",
              "traits": [],
              "sfx": []
            }
          ],
          "sfx": [],
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
            }
          },
          "noun": "Value",
          "plural": "Values"
        },
        {
          "id": "distinctions",
          "name": "Distinctions",
          "description": "Past glory, modern civilian life, and the call to return",
          "traits": [
            {
              "name": "Archetype",
              "traits": [],
              "sfx": [
                "hinder"
              ],
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
              }
            },
            {
              "name": "Retirement",
              "traits": [],
              "sfx": [
                "hinder"
              ],
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
              }
            },
            {
              "name": "Satisfaction",
              "traits": [],
              "sfx": [
                "hinder"
              ],
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
              }
            }
          ],
          "sfx": [],
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
              "header": "distinctions",
              "body": "distinctions"
            },
            "multiDie": false,
            "notes": "",
            "reservedSlots": 3,
            "place": {
              "left": "28%",
              "top": 0,
              "width": "72%",
              "height": 1
            }
          },
          "noun": "Distinction",
          "plural": "Distinctions"
        },
        {
          "id": "vintage-resources-assets",
          "name": "Resources",
          "description": "Stashed tech, vintage vehicles, and old connections (5d6 each)",
          "traits": [
            {
              "name": "",
              "traits": [],
              "sfx": [],
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
              "hitches": 0
            },
            {
              "name": "",
              "traits": [],
              "sfx": [],
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
              "hitches": 0
            },
            {
              "name": "",
              "traits": [],
              "sfx": [],
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
              "hitches": 0
            },
            {
              "name": "",
              "traits": [],
              "sfx": [],
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
              "hitches": 0
            },
            {
              "name": "",
              "traits": [],
              "sfx": [],
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
              "hitches": 0
            }
          ],
          "sfx": [],
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
            }
          },
          "noun": "Resource",
          "plural": "Resources"
        },
        {
          "id": "signature-assets",
          "name": "Signature Assets",
          "traits": [],
          "sfx": [],
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
            }
          },
          "noun": "Asset",
          "plural": "Assets"
        },
        {
          "id": "aging-complications",
          "name": "Aging Complications",
          "traits": [],
          "sfx": [],
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
            }
          },
          "noun": "Complication",
          "plural": "Complications"
        },
        {
          "id": "subtrait-columns",
          "name": "Skills & Specialties",
          "description": "Mundane d4-d6 skills stepped up by d8-d12 veteran specialties",
          "traits": [
            {
              "name": "Craft",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Fight",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Fly",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Focus",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Influence",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Know",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Labor",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Move",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Notice",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Perform",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Sneak",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Survive",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Throw",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Tinker",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Treat",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Trick",
              "traits": [],
              "sfx": []
            }
          ],
          "sfx": [],
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
            }
          },
          "noun": "Skill",
          "plural": "Skills"
        }
      ],
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
      }
    },
    "listing": {
      "url": "https://legacy.drivethrurpg.com/product/567044/Retired-No-More?manufacturers_id=31866",
      "quote": "You had a good run. Crystal artifacts recovered, sky pirates outwitted, ancient ruins plundered.",
      "genre": "Pulp adventure",
      "setting": "d8",
      "prep": "d6",
      "complexity": "d8",
      "image": "https://legacy.drivethrurpg.com/images/31866/567044.jpg"
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
      "traitSets": [
        {
          "id": "name",
          "name": "Name",
          "traits": [
            {
              "name": "name",
              "traits": [],
              "sfx": [],
              "label": "Name"
            },
            {
              "name": "player",
              "traits": [],
              "sfx": [],
              "label": "Player"
            },
            {
              "name": "nickname",
              "traits": [],
              "sfx": [],
              "label": "Nickname"
            },
            {
              "name": "pronouns",
              "traits": [],
              "sfx": [],
              "label": "Pronouns"
            },
            {
              "name": "description",
              "traits": [],
              "sfx": [],
              "label": "Description"
            },
            {
              "name": "game",
              "traits": [],
              "sfx": [],
              "label": "Game",
              "view": {
                "visibility": "hidden"
              }
            },
            {
              "name": "portrait",
              "traits": [],
              "sfx": []
            },
            {
              "name": "caption",
              "traits": [],
              "sfx": []
            },
            {
              "name": "plotPoints",
              "traits": [],
              "sfx": [],
              "label": "PP",
              "view": {
                "visibility": "hidden"
              },
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
              "spendable": true
            },
            {
              "name": "notes",
              "traits": [],
              "sfx": [],
              "view": {
                "visibility": "hidden"
              }
            }
          ],
          "sfx": [],
          "view": {
            "style": {
              "header": "default",
              "body": "name"
            },
            "page": 1
          }
        },
        {
          "id": "values",
          "name": "Values",
          "description": "The aviator's code and sky ethics",
          "traits": [
            {
              "name": "Allegiance",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Glory",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Integrity",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Knowledge",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Novelty",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Power",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Riches",
              "traits": [],
              "sfx": []
            }
          ],
          "sfx": [],
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
            }
          },
          "noun": "Value",
          "plural": "Values"
        },
        {
          "id": "distinctions",
          "name": "Distinctions",
          "description": "Aerial legend and grounded retirement",
          "traits": [
            {
              "name": "Archetype:",
              "traits": [],
              "sfx": [
                "hinder"
              ],
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
              }
            },
            {
              "name": "Retirement:",
              "traits": [],
              "sfx": [
                "hinder"
              ],
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
              }
            }
          ],
          "sfx": [],
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
              "header": "distinctions",
              "body": "distinctions"
            },
            "multiDie": false,
            "notes": "",
            "reservedSlots": 2,
            "place": {
              "left": "28%",
              "top": 0,
              "width": "72%",
              "height": 1
            }
          },
          "noun": "Distinction",
          "plural": "Distinctions"
        },
        {
          "id": "vintage-plane-signature-assets",
          "name": "Resources",
          "description": "Custom aircraft and aviator resources (5d6 each)",
          "traits": [
            {
              "name": "",
              "traits": [],
              "sfx": [],
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
              "hitches": 0
            },
            {
              "name": "",
              "traits": [],
              "sfx": [],
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
              "hitches": 0
            },
            {
              "name": "",
              "traits": [],
              "sfx": [],
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
              "hitches": 0
            }
          ],
          "sfx": [],
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
            }
          },
          "noun": "Resource",
          "plural": "Resources"
        },
        {
          "id": "signature-asset",
          "name": "Signature Asset",
          "traits": [],
          "sfx": [],
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
            }
          },
          "noun": "Asset",
          "plural": "Assets"
        },
        {
          "id": "subtrait-columns",
          "name": "Skills & Specialties",
          "description": "Flight and tactical skills (d4-d6) with veteran specialties (d8-d12)",
          "traits": [],
          "sfx": [],
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
            }
          },
          "noun": "Skill",
          "plural": "Skills"
        },
        {
          "id": "session-record",
          "name": "Session Record",
          "description": "1: Training • 2: Adventuring Triumph • 3: Retirement",
          "traits": [
            {
              "name": "Training",
              "description": "Training",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Adventuring Triumph",
              "description": "Adventuring Triumph",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Retirement",
              "description": "Retirement",
              "traits": [],
              "sfx": []
            }
          ],
          "sfx": [],
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
            }
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
            ],
            "range": [
              20
            ]
          },
          "noun": "Session",
          "plural": "Sessions"
        }
      ],
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
      }
    },
    "listing": {
      "url": "https://legacy.drivethrurpg.com/product/567044/Retired-No-More?manufacturers_id=31866",
      "quote": "You had a good run. Crystal artifacts recovered, sky pirates outwitted, ancient ruins plundered.",
      "genre": "Pulp adventure",
      "setting": "d8",
      "prep": "d6",
      "complexity": "d8",
      "image": "https://legacy.drivethrurpg.com/images/31866/567044.jpg"
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
      "traitSets": [
        {
          "id": "name",
          "name": "Name",
          "traits": [
            {
              "name": "name",
              "traits": [],
              "sfx": [],
              "label": "Name"
            },
            {
              "name": "player",
              "traits": [],
              "sfx": [],
              "label": "Player"
            },
            {
              "name": "nickname",
              "traits": [],
              "sfx": [],
              "label": "Nickname"
            },
            {
              "name": "pronouns",
              "traits": [],
              "sfx": [],
              "label": "Pronouns"
            },
            {
              "name": "description",
              "traits": [],
              "sfx": [],
              "label": "Description"
            },
            {
              "name": "game",
              "traits": [],
              "sfx": [],
              "label": "Game",
              "view": {
                "visibility": "hidden"
              }
            },
            {
              "name": "portrait",
              "traits": [],
              "sfx": []
            },
            {
              "name": "caption",
              "traits": [],
              "sfx": []
            },
            {
              "name": "plotPoints",
              "traits": [],
              "sfx": [],
              "label": "PP",
              "view": {
                "visibility": "hidden"
              },
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
              "spendable": true
            },
            {
              "name": "notes",
              "traits": [],
              "sfx": [],
              "view": {
                "visibility": "hidden"
              }
            }
          ],
          "sfx": [],
          "view": {
            "style": {
              "header": "default",
              "body": "name"
            },
            "page": 1
          }
        },
        {
          "id": "distinctions",
          "name": "Distinctions",
          "description": "Pre-fall life, current survival role, and future hope",
          "traits": [
            {
              "name": "Before:",
              "traits": [],
              "sfx": [
                "hinder"
              ],
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
              }
            },
            {
              "name": "Now:",
              "traits": [],
              "sfx": [
                "hinder"
              ],
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
              }
            },
            {
              "name": "Future:",
              "traits": [],
              "sfx": [
                "hinder"
              ],
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
              }
            }
          ],
          "sfx": [],
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
              "header": "distinctions",
              "body": "distinctions"
            },
            "multiDie": false,
            "notes": "",
            "reservedSlots": 3
          },
          "noun": "Distinction",
          "plural": "Distinctions"
        },
        {
          "id": "subtrait-columns",
          "name": "Skills & Specialties",
          "description": "Practical survival disciplines (d4-d6) with specialized traits (d8-d12)",
          "traits": [
            {
              "name": "Animals",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Athletics",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Big Guns",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Covert",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Craft",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Creativity",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Drive",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Focus",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Guns",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Influence",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Knowledge",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Mechanic",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Melee",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Notice",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Operate",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Pilot",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Survival",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Thrown",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Treatment",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Unarmed",
              "traits": [],
              "sfx": []
            }
          ],
          "sfx": [],
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
            }
          },
          "noun": "Skill",
          "plural": "Skills"
        },
        {
          "id": "attributes",
          "name": "Attributes",
          "description": "Core survival attributes",
          "traits": [
            {
              "name": "Analytical",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Forceful",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Quiet",
              "traits": [],
              "sfx": []
            }
          ],
          "sfx": [],
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
            "attributesRing": false,
            "place": {
              "left": "66.663%",
              "top": 1,
              "width": "33.334%",
              "height": 1
            }
          },
          "noun": "Attribute",
          "plural": "Attributes"
        },
        {
          "id": "relationships",
          "name": "Relationships",
          "description": "Ties to fellow survivors in the camp",
          "traits": [],
          "sfx": [],
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
            }
          },
          "noun": "Relationship",
          "plural": "Relationships"
        },
        {
          "id": "stress",
          "name": "Stress",
          "description": "Survivor stress and trauma",
          "traits": [
            {
              "name": "Injured",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Isolated",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Sick",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Tired",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Upset",
              "traits": [],
              "sfx": []
            }
          ],
          "sfx": [],
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
            "notes": "",
            "reservedSlots": 5,
            "place": {
              "left": "66.66%",
              "top": 3,
              "width": "33.334%",
              "height": 1
            }
          },
          "noun": "Stress",
          "plural": "Stress"
        },
        {
          "id": "talents",
          "name": "Talents",
          "description": "Survivor tricks and knacks",
          "traits": [],
          "sfx": [],
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
            }
          },
          "noun": "Talent",
          "plural": "Talents"
        },
        {
          "id": "growth-pool",
          "name": "Growth Pool",
          "description": "Survivor growth dice",
          "traits": [
            {
              "name": "D4",
              "traits": [],
              "sfx": [],
              "view": {
                "poolCount": 1
              },
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
              "hitches": 0
            },
            {
              "name": "D6",
              "traits": [],
              "sfx": [],
              "view": {
                "poolCount": 1
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
              "spendable": true,
              "hitches": 0
            },
            {
              "name": "D8",
              "traits": [],
              "sfx": [],
              "view": {
                "poolCount": 1
              },
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
              "hitches": 0
            },
            {
              "name": "D10",
              "traits": [],
              "sfx": [],
              "view": {
                "poolCount": 1
              },
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
              "hitches": 0
            },
            {
              "name": "D12",
              "traits": [],
              "sfx": [],
              "view": {
                "poolCount": 1
              },
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
              "hitches": 0
            }
          ],
          "sfx": [],
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
            }
          },
          "pool": true,
          "noun": "Growth Die",
          "plural": "Growth Dice"
        }
      ],
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
      }
    },
    "listing": {
      "url": "https://legacy.drivethrurpg.com/product/574559/Safe-Zone?manufacturers_id=31866",
      "quote": "The Rot took the world. The Rotters are still out there, but they’re not the problem anymore.",
      "genre": "Post-apocalyptic zombie survival | Base-building",
      "setting": "d8",
      "prep": "d8",
      "complexity": "d8",
      "image": "https://legacy.drivethrurpg.com/images/31866/574559.jpg"
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
      "traitSets": [
        {
          "id": "name",
          "name": "Name",
          "traits": [
            {
              "name": "name",
              "traits": [],
              "sfx": [],
              "label": "Name"
            },
            {
              "name": "player",
              "traits": [],
              "sfx": [],
              "label": "Player"
            },
            {
              "name": "nickname",
              "traits": [],
              "sfx": [],
              "label": "Nickname"
            },
            {
              "name": "pronouns",
              "traits": [],
              "sfx": [],
              "label": "Pronouns"
            },
            {
              "name": "description",
              "traits": [],
              "sfx": [],
              "label": "Description"
            },
            {
              "name": "game",
              "traits": [],
              "sfx": [],
              "label": "Game",
              "view": {
                "visibility": "hidden"
              }
            },
            {
              "name": "portrait",
              "traits": [],
              "sfx": []
            },
            {
              "name": "caption",
              "traits": [],
              "sfx": []
            },
            {
              "name": "plotPoints",
              "traits": [],
              "sfx": [],
              "label": "PP",
              "view": {
                "visibility": "hidden"
              },
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
              "spendable": true
            },
            {
              "name": "notes",
              "traits": [],
              "sfx": [],
              "view": {
                "visibility": "hidden"
              }
            }
          ],
          "sfx": [],
          "view": {
            "style": {
              "header": "default",
              "body": "name"
            },
            "page": 1
          }
        },
        {
          "id": "essential-stockpiles",
          "name": "Essential Stockpiles",
          "description": "Building Benefits:",
          "traits": [
            {
              "name": "Food",
              "traits": [],
              "sfx": [],
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
              "spendable": true
            },
            {
              "name": "Water",
              "traits": [],
              "sfx": [],
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
              "spendable": true
            },
            {
              "name": "Shelter",
              "traits": [],
              "sfx": [],
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
              "spendable": true
            }
          ],
          "sfx": [],
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
            "reservedSlots": 3
          },
          "noun": "Essential Stockpile",
          "plural": "Essential Stockpiles"
        },
        {
          "id": "non-essential-stockpiles",
          "name": "Non-Essential Stockpiles",
          "description": "Building Benefits:",
          "traits": [
            {
              "name": "Medicine",
              "traits": [],
              "sfx": [],
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
              "spendable": true
            },
            {
              "name": "Protection",
              "traits": [],
              "sfx": [],
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
              "spendable": true
            },
            {
              "name": "Tools",
              "traits": [],
              "sfx": [],
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
              "spendable": true
            }
          ],
          "sfx": [],
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
            "reservedSlots": 3
          },
          "noun": "Non-Essential Stockpile",
          "plural": "Non-Essential Stockpiles"
        },
        {
          "id": "building-1",
          "name": "Building 1",
          "traits": [
            {
              "name": "Name:",
              "traits": [
                {
                  "name": "d6 Benefit:",
                  "traits": [],
                  "sfx": [],
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
                  }
                },
                {
                  "name": "d8 Benefit:",
                  "traits": [],
                  "sfx": [],
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
                  }
                },
                {
                  "name": "d10 Benefit:",
                  "traits": [],
                  "sfx": [],
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
                  }
                },
                {
                  "name": "d12 Benefit:",
                  "traits": [],
                  "sfx": [],
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
                  }
                }
              ],
              "sfx": []
            }
          ],
          "sfx": [],
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
            }
          },
          "noun": "Building",
          "plural": "Buildings"
        },
        {
          "id": "building-2",
          "name": "Building 2",
          "traits": [
            {
              "name": "Name:",
              "traits": [
                {
                  "name": "d6 Benefit:",
                  "traits": [],
                  "sfx": [],
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
                  }
                },
                {
                  "name": "d8 Benefit:",
                  "traits": [],
                  "sfx": [],
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
                  }
                },
                {
                  "name": "d10 Benefit:",
                  "traits": [],
                  "sfx": [],
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
                  }
                },
                {
                  "name": "d12 Benefit:",
                  "traits": [],
                  "sfx": [],
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
                  }
                }
              ],
              "sfx": []
            }
          ],
          "sfx": [],
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
            }
          },
          "noun": "Building",
          "plural": "Buildings"
        },
        {
          "id": "building-3",
          "name": "Building 3",
          "traits": [
            {
              "name": "Name:",
              "traits": [
                {
                  "name": "d6 Benefit:",
                  "traits": [],
                  "sfx": [],
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
                  }
                },
                {
                  "name": "d8 Benefit:",
                  "traits": [],
                  "sfx": [],
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
                  }
                },
                {
                  "name": "d10 Benefit:",
                  "traits": [],
                  "sfx": [],
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
                  }
                },
                {
                  "name": "d12 Benefit:",
                  "traits": [],
                  "sfx": [],
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
                  }
                }
              ],
              "sfx": []
            }
          ],
          "sfx": [],
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
            }
          },
          "noun": "Building",
          "plural": "Buildings"
        },
        {
          "id": "building-4",
          "name": "Building 4",
          "traits": [
            {
              "name": "Name:",
              "traits": [
                {
                  "name": "d6 Benefit:",
                  "traits": [],
                  "sfx": [],
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
                  }
                },
                {
                  "name": "d8 Benefit:",
                  "traits": [],
                  "sfx": [],
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
                  }
                },
                {
                  "name": "d10 Benefit:",
                  "traits": [],
                  "sfx": [],
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
                  }
                },
                {
                  "name": "d12 Benefit:",
                  "traits": [],
                  "sfx": [],
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
                  }
                }
              ],
              "sfx": []
            }
          ],
          "sfx": [],
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
            }
          },
          "noun": "Building",
          "plural": "Buildings"
        },
        {
          "id": "building-5",
          "name": "Building 5",
          "traits": [
            {
              "name": "Name:",
              "traits": [
                {
                  "name": "d6 Benefit:",
                  "traits": [],
                  "sfx": [],
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
                  }
                },
                {
                  "name": "d8 Benefit:",
                  "traits": [],
                  "sfx": [],
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
                  }
                },
                {
                  "name": "d10 Benefit:",
                  "traits": [],
                  "sfx": [],
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
                  }
                },
                {
                  "name": "d12 Benefit:",
                  "traits": [],
                  "sfx": [],
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
                  }
                }
              ],
              "sfx": []
            }
          ],
          "sfx": [],
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
            }
          },
          "noun": "Building",
          "plural": "Buildings"
        },
        {
          "id": "building-6",
          "name": "Building 6",
          "traits": [
            {
              "name": "Name:",
              "traits": [
                {
                  "name": "d6 Benefit:",
                  "traits": [],
                  "sfx": [],
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
                  }
                },
                {
                  "name": "d8 Benefit:",
                  "traits": [],
                  "sfx": [],
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
                  }
                },
                {
                  "name": "d10 Benefit:",
                  "traits": [],
                  "sfx": [],
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
                  }
                },
                {
                  "name": "d12 Benefit:",
                  "traits": [],
                  "sfx": [],
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
                  }
                }
              ],
              "sfx": []
            }
          ],
          "sfx": [],
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
            }
          },
          "noun": "Building",
          "plural": "Buildings"
        },
        {
          "id": "survivor-1",
          "name": "Survivor 1",
          "hasQuestionedPip": true,
          "traits": [
            {
              "name": "Morale",
              "questioned": false,
              "traits": [],
              "sfx": []
            },
            {
              "name": "",
              "traits": [],
              "sfx": [],
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
              }
            }
          ],
          "sfx": [],
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
            }
          },
          "noun": "Survivor",
          "plural": "Survivors"
        },
        {
          "id": "survivor-2",
          "name": "Survivor 2",
          "hasQuestionedPip": true,
          "traits": [
            {
              "name": "Morale",
              "questioned": false,
              "traits": [],
              "sfx": []
            },
            {
              "name": "",
              "traits": [],
              "sfx": [],
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
              }
            }
          ],
          "sfx": [],
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
            }
          },
          "noun": "Survivor",
          "plural": "Survivors"
        },
        {
          "id": "survivor-3",
          "name": "Survivor 3",
          "hasQuestionedPip": true,
          "traits": [
            {
              "name": "Morale",
              "questioned": false,
              "traits": [],
              "sfx": []
            },
            {
              "name": "",
              "traits": [],
              "sfx": [],
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
              }
            }
          ],
          "sfx": [],
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
            }
          },
          "noun": "Survivor",
          "plural": "Survivors"
        },
        {
          "id": "survivor-4",
          "name": "Survivor 4",
          "hasQuestionedPip": true,
          "traits": [
            {
              "name": "Morale",
              "questioned": false,
              "traits": [],
              "sfx": []
            },
            {
              "name": "",
              "traits": [],
              "sfx": [],
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
              }
            }
          ],
          "sfx": [],
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
            }
          },
          "noun": "Survivor",
          "plural": "Survivors"
        },
        {
          "id": "survivor-5",
          "name": "Survivor 5",
          "hasQuestionedPip": true,
          "traits": [
            {
              "name": "Morale",
              "questioned": false,
              "traits": [],
              "sfx": []
            },
            {
              "name": "",
              "traits": [],
              "sfx": [],
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
              }
            }
          ],
          "sfx": [],
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
            }
          },
          "noun": "Survivor",
          "plural": "Survivors"
        },
        {
          "id": "survivor-6",
          "name": "Survivor 6",
          "hasQuestionedPip": true,
          "traits": [
            {
              "name": "Morale",
              "questioned": false,
              "traits": [],
              "sfx": []
            },
            {
              "name": "",
              "traits": [],
              "sfx": [],
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
              }
            }
          ],
          "sfx": [],
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
            }
          },
          "noun": "Survivor",
          "plural": "Survivors"
        },
        {
          "id": "survivor-7",
          "name": "Survivor 7",
          "hasQuestionedPip": true,
          "traits": [
            {
              "name": "Morale",
              "questioned": false,
              "traits": [],
              "sfx": []
            },
            {
              "name": "",
              "traits": [],
              "sfx": [],
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
              }
            }
          ],
          "sfx": [],
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
            }
          },
          "noun": "Survivor",
          "plural": "Survivors"
        },
        {
          "id": "survivor-8",
          "name": "Survivor 8",
          "hasQuestionedPip": true,
          "traits": [
            {
              "name": "Morale",
              "questioned": false,
              "traits": [],
              "sfx": []
            },
            {
              "name": "",
              "traits": [],
              "sfx": [],
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
              }
            }
          ],
          "sfx": [],
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
            }
          },
          "noun": "Survivor",
          "plural": "Survivors"
        },
        {
          "id": "survivor-9",
          "name": "Survivor 9",
          "hasQuestionedPip": true,
          "traits": [
            {
              "name": "Morale",
              "questioned": false,
              "traits": [],
              "sfx": []
            },
            {
              "name": "",
              "traits": [],
              "sfx": [],
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
              }
            }
          ],
          "sfx": [],
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
            }
          },
          "noun": "Survivor",
          "plural": "Survivors"
        },
        {
          "id": "colony-projects",
          "name": "Notes",
          "traits": [],
          "sfx": [],
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
            "notes": ""
          },
          "noun": "Note",
          "plural": "Notes"
        }
      ],
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
      }
    },
    "listing": {
      "url": "https://legacy.drivethrurpg.com/product/574559/Safe-Zone?manufacturers_id=31866",
      "quote": "The Rot took the world. The Rotters are still out there, but they’re not the problem anymore.",
      "genre": "Post-apocalyptic zombie survival | Base-building",
      "setting": "d8",
      "prep": "d8",
      "complexity": "d8",
      "image": "https://legacy.drivethrurpg.com/images/31866/574559.jpg"
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
      "traitSets": [
        {
          "id": "name",
          "name": "Name",
          "traits": [
            {
              "name": "name",
              "traits": [],
              "sfx": [],
              "label": "Name"
            },
            {
              "name": "player",
              "traits": [],
              "sfx": [],
              "label": "Player"
            },
            {
              "name": "nickname",
              "traits": [],
              "sfx": [],
              "label": "Nickname"
            },
            {
              "name": "pronouns",
              "traits": [],
              "sfx": [],
              "label": "Pronouns"
            },
            {
              "name": "description",
              "traits": [],
              "sfx": [],
              "label": "Description"
            },
            {
              "name": "game",
              "traits": [],
              "sfx": [],
              "label": "Game",
              "view": {
                "visibility": "hidden"
              }
            },
            {
              "name": "portrait",
              "traits": [],
              "sfx": []
            },
            {
              "name": "caption",
              "traits": [],
              "sfx": []
            },
            {
              "name": "plotPoints",
              "traits": [],
              "sfx": [],
              "label": "PP",
              "view": {
                "visibility": "hidden"
              },
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
              "spendable": true
            },
            {
              "name": "notes",
              "traits": [],
              "sfx": [],
              "view": {
                "visibility": "hidden"
              }
            }
          ],
          "sfx": [],
          "view": {
            "style": {
              "header": "default",
              "body": "name"
            },
            "page": 1
          }
        },
        {
          "id": "distinctions",
          "name": "Distinctions",
          "description": "Cover identity, espionage specialization, and personal objective",
          "traits": [
            {
              "name": "Role",
              "traits": [],
              "sfx": [
                "hinder"
              ],
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
              }
            },
            {
              "name": "Background",
              "traits": [],
              "sfx": [
                "hinder"
              ],
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
              }
            },
            {
              "name": "Personality",
              "traits": [],
              "sfx": [
                "hinder"
              ],
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
              }
            }
          ],
          "sfx": [],
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
              "header": "distinctions",
              "body": "distinctions"
            },
            "multiDie": false,
            "notes": "",
            "reservedSlots": 3
          },
          "noun": "Distinction",
          "plural": "Distinctions"
        },
        {
          "id": "affiliations",
          "name": "Affiliations",
          "description": "Operational deployment modes",
          "traits": [
            {
              "name": "Diplomacy",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Discovery",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Defense",
              "traits": [],
              "sfx": []
            }
          ],
          "sfx": [],
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
            }
          },
          "noun": "Affiliation",
          "plural": "Affiliations"
        },
        {
          "id": "complications",
          "name": "Complications",
          "traits": [
            {
              "name": "Frostbite",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Hypothermia",
              "traits": [],
              "sfx": []
            }
          ],
          "sfx": [],
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
            }
          },
          "noun": "Complication",
          "plural": "Complications"
        },
        {
          "id": "attributes-stress",
          "name": "Attributes & Stress",
          "description": "Core operative capabilities and physical resilience",
          "traits": [
            {
              "name": "Brawn",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Endurance",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Grace",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Grit",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Mettle",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Smarts",
              "traits": [],
              "sfx": []
            }
          ],
          "sfx": [],
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
            "attributesRing": false,
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
              "stressLabel": {
                "left": "60%",
                "top": 0,
                "width": "13%",
                "height": 1
              },
              "stress": {
                "left": "73%",
                "top": 0,
                "width": "27%",
                "height": 1
              }
            }
          },
          "noun": "Attribute",
          "plural": "Attributes"
        },
        {
          "id": "subtrait-columns",
          "name": "Skills & Specialties",
          "description": "Black-ops competencies and d6 specialties",
          "traits": [
            {
              "name": "Craft",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Drive",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Fight",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Fix",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Fly",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Focus",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Influence",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Know",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Labor",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Move",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Notice",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Operate",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Perform",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Shoot",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Sneak",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Survive",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Throw",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Treat",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Trick",
              "traits": [],
              "sfx": []
            }
          ],
          "sfx": [],
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
            "reservedSlots": 19
          },
          "noun": "Skill",
          "plural": "Skills"
        },
        {
          "id": "signature-assets-gifts",
          "name": "Signature Assets",
          "description": "Classified spy gear and experimental equipment",
          "traits": [],
          "sfx": [],
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
            }
          },
          "noun": "Signature Asset",
          "plural": "Signature Assets"
        },
        {
          "id": "talents",
          "name": "Talents",
          "traits": [],
          "sfx": [],
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
            }
          },
          "noun": "Talent",
          "plural": "Talents"
        },
        {
          "id": "gifts",
          "name": "Gifts",
          "traits": [
            {
              "name": "Gift of",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Gift of~2",
              "traits": [],
              "sfx": []
            }
          ],
          "sfx": [],
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
            }
          },
          "noun": "Gift",
          "plural": "Gifts"
        },
        {
          "id": "milestones",
          "name": "Milestones",
          "traits": [
            {
              "name": "1 XP",
              "description": "when ",
              "traits": [],
              "sfx": []
            },
            {
              "name": "3 XP",
              "description": "when ",
              "traits": [],
              "sfx": []
            },
            {
              "name": "10 XP",
              "description": "when ",
              "traits": [],
              "sfx": []
            }
          ],
          "sfx": [],
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
            }
          },
          "noun": "Milestone",
          "plural": "Milestones"
        },
        {
          "id": "milestones-b",
          "name": "Milestones",
          "traits": [
            {
              "name": "1 XP",
              "description": "when ",
              "traits": [],
              "sfx": []
            },
            {
              "name": "3 XP",
              "description": "when ",
              "traits": [],
              "sfx": []
            },
            {
              "name": "10 XP",
              "description": "when ",
              "traits": [],
              "sfx": []
            }
          ],
          "sfx": [],
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
            }
          },
          "noun": "Milestone",
          "plural": "Milestones"
        },
        {
          "id": "xp",
          "name": "XP",
          "traits": [],
          "sfx": [],
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
            }
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
            ],
            "range": [
              20
            ]
          },
          "noun": "Pip",
          "plural": "Pips"
        }
      ],
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
      }
    },
    "listing": {
      "url": "https://legacy.drivethrurpg.com/product/574560/Snowfall-Initiative?manufacturers_id=31866",
      "quote": "Earth is freezing. Not metaphorically—glaciers are advancing on major cities, temperatures are dropping, and a new ice age has begun.",
      "genre": "Military sci-fi / Norse portal fantasy",
      "setting": "d10",
      "prep": "d8",
      "complexity": "d8",
      "image": "https://legacy.drivethrurpg.com/images/31866/574560.jpg"
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
      "traitSets": [
        {
          "id": "name",
          "name": "Name",
          "traits": [
            {
              "name": "name",
              "traits": [],
              "sfx": [],
              "label": "Name"
            },
            {
              "name": "player",
              "traits": [],
              "sfx": [],
              "label": "Player"
            },
            {
              "name": "nickname",
              "traits": [],
              "sfx": [],
              "label": "Nickname"
            },
            {
              "name": "pronouns",
              "traits": [],
              "sfx": [],
              "label": "Pronouns"
            },
            {
              "name": "description",
              "traits": [],
              "sfx": [],
              "label": "Description"
            },
            {
              "name": "game",
              "traits": [],
              "sfx": [],
              "label": "Game",
              "view": {
                "visibility": "hidden"
              }
            },
            {
              "name": "portrait",
              "traits": [],
              "sfx": []
            },
            {
              "name": "caption",
              "traits": [],
              "sfx": []
            },
            {
              "name": "plotPoints",
              "traits": [],
              "sfx": [],
              "label": "PP",
              "view": {
                "visibility": "hidden"
              },
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
              "spendable": true
            },
            {
              "name": "notes",
              "traits": [],
              "sfx": [],
              "view": {
                "visibility": "hidden"
              }
            }
          ],
          "sfx": [],
          "view": {
            "style": {
              "header": "default",
              "body": "name"
            },
            "page": 1
          }
        },
        {
          "id": "attributes",
          "name": "Attributes",
          "description": "SolarPunk holistic community attributes",
          "traits": [
            {
              "name": "Mind",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Body",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Connection",
              "traits": [],
              "sfx": []
            }
          ],
          "sfx": [],
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
            "attributesRing": false,
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
            }
          },
          "noun": "Attribute",
          "plural": "Attributes"
        },
        {
          "id": "session-record",
          "name": "Session Record",
          "traits": [],
          "sfx": [],
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
            }
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
            ],
            "range": [
              15
            ]
          },
          "noun": "Session",
          "plural": "Sessions"
        },
        {
          "id": "distinctions",
          "name": "Distinctions",
          "description": "Ecological calling, community role, and personal purpose",
          "traits": [
            {
              "name": "Identity:",
              "traits": [],
              "sfx": [
                "hinder"
              ],
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
              }
            },
            {
              "name": "Community:",
              "traits": [],
              "sfx": [
                "hinder"
              ],
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
              }
            },
            {
              "name": "Purpose:",
              "traits": [],
              "sfx": [
                "hinder"
              ],
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
              }
            }
          ],
          "sfx": [],
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
              "header": "distinctions",
              "body": "distinctions"
            },
            "multiDie": false,
            "notes": "",
            "reservedSlots": 3,
            "place": {
              "left": "28%",
              "top": 0,
              "width": "72%",
              "height": 1
            }
          },
          "noun": "Distinction",
          "plural": "Distinctions"
        },
        {
          "id": "signature-assets",
          "name": "Signature Assets",
          "description": "Sustainable tech, tools, and eco-craft",
          "traits": [],
          "sfx": [],
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
              "sfx": {
                "left": "0%",
                "top": 2,
                "width": "100%",
                "height": 1
              }
            }
          },
          "noun": "Signature Asset",
          "plural": "Signature Assets"
        },
        {
          "id": "subtrait-columns",
          "name": "Skills & Specialties",
          "description": "Ecological competencies (d4-d12) and d6 craft specialties",
          "traits": [
            {
              "name": "Craft",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Drive",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Fight",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Fix",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Fly",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Focus",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Influence",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Know",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Labor",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Move",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Notice",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Operate",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Perform",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Shoot",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Sneak",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Survive",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Throw",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Treat",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Trick",
              "traits": [],
              "sfx": []
            }
          ],
          "sfx": [],
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
            }
          },
          "noun": "Skill",
          "plural": "Skills"
        }
      ],
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
      }
    },
    "listing": {
      "url": "https://legacy.drivethrurpg.com/product/568415/Solarpunk?manufacturers_id=31866",
      "quote": "The corporations took everything. The land, the water, the air.",
      "genre": "Near-future eco-punk / hopepunk",
      "setting": "d8",
      "prep": "d6",
      "complexity": "d8",
      "image": "https://legacy.drivethrurpg.com/images/31866/568415.jpg"
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
      "traitSets": [
        {
          "id": "name",
          "name": "Name",
          "traits": [
            {
              "name": "name",
              "traits": [],
              "sfx": [],
              "label": "Name"
            },
            {
              "name": "player",
              "traits": [],
              "sfx": [],
              "label": "Player"
            },
            {
              "name": "nickname",
              "traits": [],
              "sfx": [],
              "label": "Nickname"
            },
            {
              "name": "pronouns",
              "traits": [],
              "sfx": [],
              "label": "Pronouns"
            },
            {
              "name": "description",
              "traits": [],
              "sfx": [],
              "label": "Description"
            },
            {
              "name": "game",
              "traits": [],
              "sfx": [],
              "label": "Game",
              "view": {
                "visibility": "hidden"
              }
            },
            {
              "name": "portrait",
              "traits": [],
              "sfx": []
            },
            {
              "name": "caption",
              "traits": [],
              "sfx": []
            },
            {
              "name": "plotPoints",
              "traits": [],
              "sfx": [],
              "label": "PP",
              "view": {
                "visibility": "hidden"
              },
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
              "spendable": true
            },
            {
              "name": "notes",
              "traits": [],
              "sfx": [],
              "view": {
                "visibility": "hidden"
              }
            }
          ],
          "sfx": [],
          "view": {
            "style": {
              "header": "default",
              "body": "name"
            },
            "page": 1
          }
        },
        {
          "id": "commune-attributes",
          "name": "Attributes",
          "description": "Collective settlement strengths",
          "traits": [
            {
              "name": "Resources",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Security",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Connections",
              "traits": [],
              "sfx": []
            }
          ],
          "sfx": [],
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
            "attributesRing": false,
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
            }
          },
          "noun": "Attribute",
          "plural": "Attributes"
        },
        {
          "id": "commune-distinctions",
          "name": "Distinctions",
          "description": "Settlement unity, organization, and morale",
          "traits": [
            {
              "name": "Unity:",
              "traits": [],
              "sfx": [
                "hinder"
              ],
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
              }
            },
            {
              "name": "Organization:",
              "traits": [],
              "sfx": [
                "hinder"
              ],
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
              }
            },
            {
              "name": "Morale:",
              "traits": [],
              "sfx": [
                "hinder"
              ],
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
              }
            }
          ],
          "sfx": [],
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
              "header": "distinctions",
              "body": "distinctions"
            },
            "multiDie": false,
            "notes": "",
            "reservedSlots": 3,
            "place": {
              "left": "28%",
              "top": 0,
              "width": "72%",
              "height": 1
            }
          },
          "noun": "Distinction",
          "plural": "Distinctions"
        },
        {
          "id": "signature-assets",
          "name": "Signature Assets",
          "traits": [
            {
              "name": "",
              "traits": [],
              "sfx": [],
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
              }
            },
            {
              "name": "",
              "traits": [],
              "sfx": [],
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
              }
            },
            {
              "name": "",
              "traits": [],
              "sfx": [],
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
              }
            },
            {
              "name": "",
              "traits": [],
              "sfx": [],
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
              }
            }
          ],
          "sfx": [],
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
            }
          },
          "noun": "Asset",
          "plural": "Assets"
        },
        {
          "id": "skills",
          "name": "Skills",
          "traits": [],
          "sfx": [],
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
            }
          },
          "noun": "Skill",
          "plural": "Skills"
        }
      ],
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
      }
    },
    "listing": {
      "url": "https://legacy.drivethrurpg.com/product/568415/Solarpunk?manufacturers_id=31866",
      "quote": "The corporations took everything. The land, the water, the air.",
      "genre": "Near-future eco-punk / hopepunk",
      "setting": "d8",
      "prep": "d6",
      "complexity": "d8",
      "image": "https://legacy.drivethrurpg.com/images/31866/568415.jpg"
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
      "traitSets": [
        {
          "id": "name",
          "name": "Name",
          "traits": [
            {
              "name": "name",
              "traits": [],
              "sfx": [],
              "label": "Name"
            },
            {
              "name": "player",
              "traits": [],
              "sfx": [],
              "label": "Player"
            },
            {
              "name": "nickname",
              "traits": [],
              "sfx": [],
              "label": "Nickname"
            },
            {
              "name": "pronouns",
              "traits": [],
              "sfx": [],
              "label": "Pronouns"
            },
            {
              "name": "description",
              "traits": [],
              "sfx": [],
              "label": "Description"
            },
            {
              "name": "game",
              "traits": [],
              "sfx": [],
              "label": "Game",
              "view": {
                "visibility": "hidden"
              }
            },
            {
              "name": "portrait",
              "traits": [],
              "sfx": []
            },
            {
              "name": "caption",
              "traits": [],
              "sfx": []
            },
            {
              "name": "plotPoints",
              "traits": [],
              "sfx": [],
              "label": "PP",
              "view": {
                "visibility": "hidden"
              },
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
              "spendable": true
            },
            {
              "name": "notes",
              "traits": [],
              "sfx": [],
              "view": {
                "visibility": "hidden"
              }
            }
          ],
          "sfx": [],
          "view": {
            "style": {
              "header": "default",
              "body": "name"
            },
            "page": 1
          }
        },
        {
          "id": "growth-pool",
          "name": "Growth Pool",
          "traits": [
            {
              "name": "D4",
              "traits": [],
              "sfx": [],
              "view": {
                "poolCount": 1
              },
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
              "hitches": 0
            },
            {
              "name": "D6",
              "traits": [],
              "sfx": [],
              "view": {
                "poolCount": 1
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
              "spendable": true,
              "hitches": 0
            },
            {
              "name": "D8",
              "traits": [],
              "sfx": [],
              "view": {
                "poolCount": 1
              },
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
              "hitches": 0
            },
            {
              "name": "D10",
              "traits": [],
              "sfx": [],
              "view": {
                "poolCount": 1
              },
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
              "hitches": 0
            },
            {
              "name": "D12",
              "traits": [],
              "sfx": [],
              "view": {
                "poolCount": 1
              },
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
              "hitches": 0
            }
          ],
          "sfx": [],
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
            }
          },
          "pool": true,
          "noun": "Growth Die",
          "plural": "Growth Dice"
        },
        {
          "id": "distinctions",
          "name": "Distinctions",
          "description": "Origin of the magical calamity and personal burden",
          "traits": [
            {
              "name": "",
              "traits": [],
              "sfx": [
                "hinder"
              ],
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
              }
            },
            {
              "name": "",
              "traits": [],
              "sfx": [
                "hinder"
              ],
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
              }
            },
            {
              "name": "",
              "traits": [],
              "sfx": [
                "hinder"
              ],
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
              }
            }
          ],
          "sfx": [],
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
              "header": "distinctions",
              "body": "distinctions"
            },
            "multiDie": false,
            "notes": "",
            "reservedSlots": 3,
            "place": {
              "left": "22%",
              "top": 0,
              "width": "78%",
              "height": 1
            }
          },
          "noun": "Distinction",
          "plural": "Distinctions"
        },
        {
          "id": "values",
          "name": "Values",
          "description": "Gain a PP when you use your d4 value.",
          "statement": true,
          "traits": [
            {
              "name": "Ambition",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Responsibility",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Belonging",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Popularity",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Empathy",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Secrecy",
              "traits": [],
              "sfx": []
            }
          ],
          "sfx": [],
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
            }
          },
          "noun": "Value",
          "plural": "Values"
        },
        {
          "id": "signature-assets",
          "name": "Signature Assets",
          "traits": [],
          "sfx": [],
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
            }
          },
          "noun": "Asset",
          "plural": "Assets"
        },
        {
          "id": "affiliations",
          "name": "Affiliations",
          "description": "When Worlds Collide: When two affiliations are in the same scene, add a d6 to the doom pool and a d4 to your dice pool to include both affiliations in your pool.",
          "statement": true,
          "traits": [
            {
              "name": "Self",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Family",
              "traits": [],
              "sfx": []
            },
            {
              "name": "School",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Coven",
              "traits": [],
              "sfx": []
            }
          ],
          "sfx": [],
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
            }
          },
          "noun": "Affiliation",
          "plural": "Affiliations"
        },
        {
          "id": "stress",
          "name": "Stress",
          "traits": [
            {
              "name": "Angry",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Depressed",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Exhausted",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Insecure",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Injured",
              "traits": [],
              "sfx": []
            }
          ],
          "sfx": [],
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
            }
          },
          "noun": "Stress",
          "plural": "Stress"
        },
        {
          "id": "arcane-crafts-sfx",
          "name": "Crafts",
          "description": "Mutated magical expressions and spellcasting disciplines",
          "traits": [
            {
              "name": "Azure Sympathy",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Black Wards",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Bronze Mending",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Crimson Passion",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Golden Inspiration",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Orange Flare",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Pink Fidelity",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Purple Veils",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Verdant Conjuration",
              "traits": [],
              "sfx": []
            },
            {
              "name": "White Purification",
              "traits": [],
              "sfx": []
            }
          ],
          "sfx": [],
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
            }
          },
          "noun": "Craft",
          "plural": "Crafts"
        },
        {
          "id": "sfx",
          "name": "SFX",
          "traits": [],
          "sfx": [],
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
            "reservedSlots": 4
          },
          "noun": "SFX",
          "plural": "SFX"
        }
      ],
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
      }
    },
    "listing": {
      "url": "https://legacy.drivethrurpg.com/product/572310/Spellcaught?manufacturers_id=31866",
      "quote": "High school is already a crucible. Add magic, and someone’s going to get burned.",
      "genre": "Teenage witches / high school drama",
      "setting": "d6",
      "prep": "d6",
      "complexity": "d8",
      "image": "https://legacy.drivethrurpg.com/images/31866/572310.jpg"
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
      "traitSets": [
        {
          "id": "name",
          "name": "Name",
          "traits": [
            {
              "name": "name",
              "traits": [],
              "sfx": [],
              "label": "Name"
            },
            {
              "name": "player",
              "traits": [],
              "sfx": [],
              "label": "Player"
            },
            {
              "name": "nickname",
              "traits": [],
              "sfx": [],
              "label": "Nickname"
            },
            {
              "name": "pronouns",
              "traits": [],
              "sfx": [],
              "label": "Ruin"
            },
            {
              "name": "description",
              "traits": [],
              "sfx": [],
              "label": "Description"
            },
            {
              "name": "game",
              "traits": [],
              "sfx": [],
              "label": "Game",
              "view": {
                "visibility": "hidden"
              }
            },
            {
              "name": "portrait",
              "traits": [],
              "sfx": []
            },
            {
              "name": "caption",
              "traits": [],
              "sfx": []
            },
            {
              "name": "plotPoints",
              "traits": [],
              "sfx": [],
              "label": "PP",
              "view": {
                "visibility": "hidden"
              },
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
              "spendable": true
            },
            {
              "name": "notes",
              "traits": [],
              "sfx": [],
              "view": {
                "visibility": "hidden"
              }
            }
          ],
          "sfx": [],
          "view": {
            "style": {
              "header": "default",
              "body": "name"
            },
            "page": 1
          }
        },
        {
          "id": "attributes",
          "name": "Attributes",
          "description": "Core attributes",
          "traits": [
            {
              "name": "Mental",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Physical",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Social",
              "traits": [],
              "sfx": []
            }
          ],
          "sfx": [],
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
            "attributesRing": false,
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
            }
          },
          "noun": "Attribute",
          "plural": "Attributes"
        },
        {
          "id": "distinctions",
          "name": "Distinctions",
          "description": "Mundane, Offbeat, and Strange facets of town life",
          "traits": [],
          "sfx": [],
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
              "header": "distinctions",
              "body": "distinctions"
            },
            "multiDie": false,
            "reservedSlots": 3,
            "place": {
              "left": "28%",
              "top": 0,
              "width": "72%",
              "height": 1
            }
          },
          "noun": "Distinction",
          "plural": "Distinctions"
        },
        {
          "id": "roles",
          "name": "Roles",
          "description": "Town archetypes and societal roles",
          "traits": [
            {
              "name": "Enforcer",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Entrepreneur",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Rebel",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Sage",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Shepherd",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Townie",
              "traits": [],
              "sfx": []
            }
          ],
          "sfx": [],
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
            }
          },
          "noun": "Role",
          "plural": "Roles"
        },
        {
          "id": "relationships-strange-die",
          "name": "Relationships",
          "description": "Bonds and ties within the town",
          "traits": [],
          "sfx": [],
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
            }
          },
          "noun": "Relationship",
          "plural": "Relationships"
        },
        {
          "id": "signature-assets",
          "name": "Signature Assets",
          "traits": [
            {
              "name": "",
              "traits": [],
              "sfx": [],
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
              }
            },
            {
              "name": "",
              "traits": [],
              "sfx": [],
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
              }
            }
          ],
          "sfx": [],
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
            }
          },
          "noun": "Asset",
          "plural": "Assets"
        },
        {
          "id": "complications",
          "name": "Complications",
          "traits": [],
          "sfx": [],
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
            }
          },
          "noun": "Complication",
          "plural": "Complications"
        },
        {
          "id": "strange-die",
          "name": "Strange Die",
          "traits": [],
          "sfx": [],
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
            }
          },
          "noun": "Die",
          "plural": "Dice"
        }
      ],
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
      }
    },
    "listing": {
      "url": "https://legacy.drivethrurpg.com/product/567043/Strange-Towns?manufacturers_id=31866",
      "quote": "There’s something wrong with this town. Maybe it’s the sheriff who never blinks.",
      "genre": "Weird horror / small-town mystery",
      "setting": "d6",
      "prep": "d6",
      "complexity": "d6",
      "image": "https://legacy.drivethrurpg.com/images/31866/567043.jpg"
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
      "traitSets": [
        {
          "id": "name",
          "name": "Name",
          "traits": [
            {
              "name": "name",
              "traits": [],
              "sfx": [],
              "label": "Name"
            },
            {
              "name": "player",
              "traits": [],
              "sfx": [],
              "label": "Player"
            },
            {
              "name": "nickname",
              "traits": [],
              "sfx": [],
              "label": "Nickname"
            },
            {
              "name": "pronouns",
              "traits": [],
              "sfx": [],
              "label": "Pronouns"
            },
            {
              "name": "description",
              "traits": [],
              "sfx": [],
              "label": "Description"
            },
            {
              "name": "game",
              "traits": [],
              "sfx": [],
              "label": "Game",
              "view": {
                "visibility": "hidden"
              }
            },
            {
              "name": "portrait",
              "traits": [],
              "sfx": []
            },
            {
              "name": "caption",
              "traits": [],
              "sfx": []
            },
            {
              "name": "plotPoints",
              "traits": [],
              "sfx": [],
              "label": "PP",
              "view": {
                "visibility": "hidden"
              },
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
              "spendable": true
            },
            {
              "name": "notes",
              "traits": [],
              "sfx": [],
              "view": {
                "visibility": "hidden"
              }
            }
          ],
          "sfx": [],
          "view": {
            "style": {
              "header": "default",
              "body": "name"
            },
            "page": 1
          }
        },
        {
          "id": "attributes",
          "name": "Attributes",
          "description": "Core hero ratings with Vitality and Willpower",
          "traits": [
            {
              "name": "Agility",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Alertness",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Intelligence",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Strength",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Vitality",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Willpower",
              "traits": [],
              "sfx": []
            }
          ],
          "sfx": [],
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
            "attributesRing": false,
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
            }
          },
          "noun": "Attribute",
          "plural": "Attributes"
        },
        {
          "id": "distinctions",
          "name": "Distinctions",
          "description": "Multiversal origin, champion archetype, and personal drive",
          "traits": [
            {
              "name": "",
              "traits": [],
              "sfx": [
                "hinder"
              ],
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
              }
            },
            {
              "name": "",
              "traits": [],
              "sfx": [
                "hinder"
              ],
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
              }
            },
            {
              "name": "",
              "traits": [],
              "sfx": [
                "hinder"
              ],
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
              }
            }
          ],
          "sfx": [],
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
              "header": "distinctions",
              "body": "distinctions"
            },
            "multiDie": false,
            "reservedSlots": 6,
            "place": {
              "left": "28%",
              "top": 0,
              "width": "72%",
              "height": 1
            }
          },
          "noun": "Distinction",
          "plural": "Distinctions"
        },
        {
          "id": "signature-assets",
          "name": "Signature Assets",
          "description": "Artifacts and multiversal gear",
          "traits": [],
          "sfx": [],
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
            }
          },
          "noun": "Signature Asset",
          "plural": "Signature Assets"
        },
        {
          "id": "subtrait-columns",
          "name": "Skills & Specialties",
          "description": "Multiverse capabilities (d4-d6) and specialized proficiencies (d8-d12)",
          "traits": [
            {
              "name": "Craft",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Drive",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Fight",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Fix",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Fly",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Focus",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Influence",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Know",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Labor",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Move",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Notice",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Operate",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Perform",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Shoot",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Sneak",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Survive",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Throw",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Treat",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Trick",
              "traits": [],
              "sfx": []
            }
          ],
          "sfx": [],
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
            }
          },
          "noun": "Skill",
          "plural": "Skills"
        },
        {
          "id": "initiative",
          "name": "Initiative",
          "ratingPosition": "vertical",
          "traits": [],
          "sfx": [],
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
            }
          },
          "noun": "Die",
          "plural": "Dice"
        },
        {
          "id": "hero-dice",
          "name": "Hero Dice",
          "ratingPosition": "vertical",
          "traits": [],
          "sfx": [],
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
            }
          },
          "noun": "Die",
          "plural": "Dice"
        },
        {
          "id": "life-points",
          "name": "Life Points",
          "description": "Vitality (12 → 1, Injured!) • Ø • Willpower (1 → 12, Dazed!)",
          "traits": [],
          "sfx": [],
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
            }
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
            ],
            "range": [
              24
            ]
          },
          "noun": "Point",
          "plural": "Points"
        },
        {
          "id": "power-set-1",
          "name": "Power Set 1",
          "description": "SFX: • SFX: • Limit:",
          "traits": [
            {
              "name": "",
              "traits": [],
              "sfx": [
                {
                  "name": "SFX 1"
                },
                {
                  "name": "SFX 2"
                },
                {
                  "name": "Limit"
                }
              ]
            }
          ],
          "sfx": [],
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
            }
          },
          "noun": "Power",
          "plural": "Powers"
        },
        {
          "id": "power-set-2",
          "name": "Power Set 2",
          "description": "SFX: • SFX: • Limit:",
          "traits": [
            {
              "name": "",
              "traits": [],
              "sfx": [
                {
                  "name": "SFX 1"
                },
                {
                  "name": "SFX 2"
                },
                {
                  "name": "Limit"
                }
              ]
            }
          ],
          "sfx": [],
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
            }
          },
          "noun": "Power",
          "plural": "Powers"
        },
        {
          "id": "power-set-3",
          "name": "Power Set 3",
          "description": "SFX: • SFX: • Limit:",
          "traits": [
            {
              "name": "",
              "traits": [],
              "sfx": [
                {
                  "name": "SFX 1"
                },
                {
                  "name": "SFX 2"
                },
                {
                  "name": "Limit"
                }
              ]
            }
          ],
          "sfx": [],
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
            }
          },
          "noun": "Power",
          "plural": "Powers"
        },
        {
          "id": "talents-growth-options",
          "name": "Talents",
          "description": "Name, Activation, and Effect",
          "traits": [],
          "sfx": [],
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
            }
          },
          "noun": "Talent",
          "plural": "Talents"
        },
        {
          "id": "session-record",
          "name": "Session Record",
          "traits": [],
          "sfx": [],
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
            }
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
            ],
            "range": [
              12
            ]
          },
          "noun": "Session",
          "plural": "Sessions"
        },
        {
          "id": "leveling-up",
          "name": "Leveling Up",
          "traits": [],
          "sfx": [],
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
            }
          },
          "noun": "Option",
          "plural": "Options"
        }
      ],
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
      }
    },
    "listing": {
      "url": "https://legacy.drivethrurpg.com/product/567047/Terraverse?manufacturers_id=31866",
      "quote": "Every world is a version of this one. Some are close — a step to the left, a slightly different history.",
      "genre": "Science fantasy / multiverse adventure",
      "setting": "d10",
      "prep": "d10",
      "complexity": "d10",
      "image": "https://legacy.drivethrurpg.com/images/31866/567047.jpg"
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
      "traitSets": [
        {
          "id": "name",
          "name": "Name",
          "traits": [
            {
              "name": "name",
              "traits": [],
              "sfx": [],
              "label": "Name"
            },
            {
              "name": "player",
              "traits": [],
              "sfx": [],
              "label": "Player"
            },
            {
              "name": "nickname",
              "traits": [],
              "sfx": [],
              "label": "Nickname"
            },
            {
              "name": "pronouns",
              "traits": [],
              "sfx": [],
              "label": "Pronouns"
            },
            {
              "name": "description",
              "traits": [],
              "sfx": [],
              "label": "Description"
            },
            {
              "name": "game",
              "traits": [],
              "sfx": [],
              "label": "Game",
              "view": {
                "visibility": "hidden"
              }
            },
            {
              "name": "portrait",
              "traits": [],
              "sfx": []
            },
            {
              "name": "caption",
              "traits": [],
              "sfx": []
            },
            {
              "name": "plotPoints",
              "traits": [],
              "sfx": [],
              "label": "PP",
              "view": {
                "visibility": "hidden"
              },
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
              "spendable": true
            },
            {
              "name": "notes",
              "traits": [],
              "sfx": [],
              "view": {
                "visibility": "hidden"
              }
            }
          ],
          "sfx": [],
          "view": {
            "style": {
              "header": "default",
              "body": "name"
            },
            "page": 1
          }
        },
        {
          "id": "handler-attributes",
          "name": "Attributes",
          "description": "Neural synchronization and handler capabilities",
          "traits": [
            {
              "name": "Prowess",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Control",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Renown",
              "traits": [],
              "sfx": []
            }
          ],
          "sfx": [],
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
            "attributesRing": false,
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
            }
          },
          "noun": "Attribute",
          "plural": "Attributes"
        },
        {
          "id": "roles",
          "name": "Roles",
          "description": "Combat roles and tactical responsibilities",
          "traits": [
            {
              "name": "Backup",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Blaster",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Boss",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Brain",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Brawler",
              "traits": [],
              "sfx": []
            }
          ],
          "sfx": [],
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
            }
          },
          "noun": "Role",
          "plural": "Roles"
        },
        {
          "id": "distinctions",
          "name": "Distinctions",
          "description": "Personal identity, public persona, and driving aspiration",
          "traits": [
            {
              "name": "Identity:",
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
              ],
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
              }
            },
            {
              "name": "Persona:",
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
              ],
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
              }
            },
            {
              "name": "Aspiration:",
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
              ],
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
              }
            }
          ],
          "sfx": [],
          "view": {
            "features": {
              "description": true,
              "sfx": true,
              "subtraits": false
            },
            "page": 1,
            "style": {
              "header": "distinctions",
              "body": "distinctions"
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
            }
          },
          "noun": "Distinction",
          "plural": "Distinctions"
        },
        {
          "id": "signature-assets",
          "name": "Signature Assets",
          "description": "Handler cockpit gear and personal assets",
          "traits": [],
          "sfx": [],
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
            }
          },
          "noun": "Signature Asset",
          "plural": "Signature Assets"
        },
        {
          "id": "complications",
          "name": "Complications",
          "traits": [],
          "sfx": [],
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
            "reservedSlots": 2
          },
          "noun": "Complication",
          "plural": "Complications"
        }
      ],
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
      }
    },
    "listing": {
      "url": "https://legacy.drivethrurpg.com/product/567042/Titans-vs-Leviathans?manufacturers_id=31866",
      "quote": "The city shakes. The bay churns.",
      "genre": "Kaiju / mech action",
      "setting": "d8",
      "prep": "d6",
      "complexity": "d6",
      "image": "https://legacy.drivethrurpg.com/images/31866/567042.jpg"
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
      "traitSets": [
        {
          "id": "name",
          "name": "Name",
          "traits": [
            {
              "name": "name",
              "traits": [],
              "sfx": [],
              "label": "Name"
            },
            {
              "name": "player",
              "traits": [],
              "sfx": [],
              "label": "Player"
            },
            {
              "name": "nickname",
              "traits": [],
              "sfx": [],
              "label": "Nickname"
            },
            {
              "name": "pronouns",
              "traits": [],
              "sfx": [],
              "label": "Pronouns"
            },
            {
              "name": "description",
              "traits": [],
              "sfx": [],
              "label": "Description"
            },
            {
              "name": "game",
              "traits": [],
              "sfx": [],
              "label": "Game",
              "view": {
                "visibility": "hidden"
              }
            },
            {
              "name": "portrait",
              "traits": [],
              "sfx": []
            },
            {
              "name": "caption",
              "traits": [],
              "sfx": []
            },
            {
              "name": "plotPoints",
              "traits": [],
              "sfx": [],
              "label": "PP",
              "view": {
                "visibility": "hidden"
              },
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
              "spendable": true
            },
            {
              "name": "notes",
              "traits": [],
              "sfx": [],
              "view": {
                "visibility": "hidden"
              }
            }
          ],
          "sfx": [],
          "view": {
            "style": {
              "header": "default",
              "body": "name"
            },
            "page": 1
          }
        },
        {
          "id": "titan-attributes-stress",
          "name": "Attributes",
          "description": "Heavy mechanized systems with stress tracks",
          "ratingPosition": "below",
          "traits": [
            {
              "name": "Prowess",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Control",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Renown",
              "traits": [],
              "sfx": []
            }
          ],
          "sfx": [],
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
            "notes": "",
            "reservedSlots": 3,
            "attributesRing": false,
            "place": {
              "left": "0%",
              "top": 0,
              "width": "28%",
              "height": 1
            }
          },
          "noun": "Attribute",
          "plural": "Attributes"
        },
        {
          "id": "titan-distinctions",
          "name": "Distinctions",
          "description": "Chassis type, operational history, and battle stance",
          "traits": [
            {
              "name": "Type:",
              "traits": [],
              "sfx": [],
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
              }
            },
            {
              "name": "History:",
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
              ],
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
              }
            },
            {
              "name": "Battle:",
              "traits": [],
              "sfx": [],
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
              }
            }
          ],
          "sfx": [],
          "view": {
            "features": {
              "description": true,
              "sfx": true,
              "subtraits": false
            },
            "page": 1,
            "style": {
              "header": "distinctions",
              "body": "distinctions"
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
            }
          },
          "noun": "Distinction",
          "plural": "Distinctions"
        },
        {
          "id": "power-set",
          "name": "Power Set",
          "description": "Colossal kaiju-annihilation weaponry",
          "traits": [],
          "sfx": [],
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
            }
          },
          "noun": "Power",
          "plural": "Powers"
        },
        {
          "id": "power-set-2",
          "name": "Power Set",
          "description": "Secondary titan systems and ordnance",
          "traits": [],
          "sfx": [],
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
            }
          },
          "noun": "Power",
          "plural": "Powers"
        },
        {
          "id": "session-record",
          "name": "Session Record",
          "traits": [],
          "sfx": [],
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
            "reservedSlots": 0
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
            ],
            "range": [
              15
            ]
          },
          "noun": "Session",
          "plural": "Sessions"
        }
      ],
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
      }
    },
    "listing": {
      "url": "https://legacy.drivethrurpg.com/product/567042/Titans-vs-Leviathans?manufacturers_id=31866",
      "quote": "The city shakes. The bay churns.",
      "genre": "Kaiju / mech action",
      "setting": "d8",
      "prep": "d6",
      "complexity": "d6",
      "image": "https://legacy.drivethrurpg.com/images/31866/567042.jpg"
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
      "traitSets": [
        {
          "id": "name",
          "name": "Name",
          "traits": [
            {
              "name": "name",
              "traits": [],
              "sfx": [],
              "label": "Name"
            },
            {
              "name": "player",
              "traits": [],
              "sfx": [],
              "label": "Player"
            },
            {
              "name": "nickname",
              "traits": [],
              "sfx": [],
              "label": "Nickname"
            },
            {
              "name": "pronouns",
              "traits": [],
              "sfx": [],
              "label": "Pronouns"
            },
            {
              "name": "description",
              "traits": [],
              "sfx": [],
              "label": "Description"
            },
            {
              "name": "game",
              "traits": [],
              "sfx": [],
              "label": "Game",
              "view": {
                "visibility": "hidden"
              }
            },
            {
              "name": "portrait",
              "traits": [],
              "sfx": []
            },
            {
              "name": "caption",
              "traits": [],
              "sfx": []
            },
            {
              "name": "plotPoints",
              "traits": [],
              "sfx": [],
              "label": "PP",
              "view": {
                "visibility": "hidden"
              },
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
              "spendable": true
            },
            {
              "name": "notes",
              "traits": [],
              "sfx": [],
              "view": {
                "visibility": "hidden"
              }
            }
          ],
          "sfx": [],
          "view": {
            "style": {
              "header": "default",
              "body": "name"
            },
            "page": 1
          }
        },
        {
          "id": "affiliations",
          "name": "Affiliations",
          "description": "Team configuration ratings",
          "traits": [
            {
              "name": "Solo",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Partner",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Squad",
              "traits": [],
              "sfx": []
            }
          ],
          "sfx": [],
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
            }
          },
          "noun": "Affiliation",
          "plural": "Affiliations"
        },
        {
          "id": "roles",
          "name": "Roles",
          "description": "Civic investigation disciplines",
          "traits": [
            {
              "name": "Forensics",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Investigation",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Legal",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Medicine",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Psychology",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Tactics",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Technology",
              "traits": [],
              "sfx": []
            }
          ],
          "sfx": [],
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
            }
          },
          "noun": "Role",
          "plural": "Roles"
        },
        {
          "id": "resources",
          "name": "Resources",
          "description": "Civic assets, contacts, and backup",
          "traits": [
            {
              "name": "",
              "traits": [],
              "sfx": [],
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
              "hitches": 0
            },
            {
              "name": "",
              "traits": [],
              "sfx": [],
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
              "hitches": 0
            },
            {
              "name": "",
              "traits": [],
              "sfx": [],
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
              "hitches": 0
            },
            {
              "name": "",
              "traits": [],
              "sfx": [],
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
              "hitches": 0
            }
          ],
          "sfx": [],
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
            }
          },
          "noun": "Resource",
          "plural": "Resources"
        },
        {
          "id": "distinctions",
          "name": "Distinctions",
          "description": "Defining history, drive, and complication",
          "traits": [
            {
              "name": "Distinction #1:",
              "traits": [],
              "sfx": [
                "hinder"
              ],
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
              }
            },
            {
              "name": "Distinction #2:",
              "traits": [],
              "sfx": [
                "hinder"
              ],
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
              }
            },
            {
              "name": "Distinction #3:",
              "traits": [],
              "sfx": [
                "hinder"
              ],
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
              }
            }
          ],
          "sfx": [],
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
              "header": "distinctions",
              "body": "distinctions"
            },
            "multiDie": false,
            "notes": "",
            "reservedSlots": 3,
            "place": {
              "left": "30%",
              "top": 0,
              "width": "70%",
              "height": 1
            }
          },
          "noun": "Distinction",
          "plural": "Distinctions"
        },
        {
          "id": "talents",
          "name": "Talents",
          "description": "Training tricks and case-cracking knacks",
          "traits": [
            {
              "name": "Talent #1:",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Talent #2:",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Talent #3:",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Talent #4:",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Talent #5:",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Talent #6:",
              "traits": [],
              "sfx": []
            }
          ],
          "sfx": [],
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
            }
          },
          "noun": "Talent",
          "plural": "Talents"
        },
        {
          "id": "stress",
          "name": "Stress",
          "description": "Emotional and physical pressure tracks",
          "traits": [
            {
              "name": "Afraid",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Angry",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Anxious",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Exhausted",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Injured",
              "traits": [],
              "sfx": []
            }
          ],
          "sfx": [],
          "view": {
            "features": {
              "description": false,
              "sfx": false,
              "subtraits": false
            },
            "page": 1,
            "style": {
              "header": "default",
              "body": "stress"
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
            }
          },
          "noun": "Stress",
          "plural": "Stress"
        },
        {
          "id": "growth-pool",
          "name": "Growth Pool",
          "description": "Base d6 d6",
          "traits": [
            {
              "name": "D4",
              "traits": [],
              "sfx": [],
              "view": {
                "poolCount": 0
              },
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
              "hitches": 0
            },
            {
              "name": "D6",
              "traits": [],
              "sfx": [],
              "view": {
                "poolCount": 2
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
              "spendable": true,
              "hitches": 0
            },
            {
              "name": "D8",
              "traits": [],
              "sfx": [],
              "view": {
                "poolCount": 0
              },
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
              "hitches": 0
            },
            {
              "name": "D10",
              "traits": [],
              "sfx": [],
              "view": {
                "poolCount": 0
              },
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
              "hitches": 0
            },
            {
              "name": "D12",
              "traits": [],
              "sfx": [],
              "view": {
                "poolCount": 0
              },
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
              "hitches": 0
            }
          ],
          "sfx": [],
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
            }
          },
          "pool": true,
          "noun": "Growth Die",
          "plural": "Growth Dice"
        }
      ],
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
      }
    },
    "listing": {
      "url": "https://legacy.drivethrurpg.com/product/567041/Cortex-Prime-Game-Handbook-2nd-Edition?manufacturers_id=31866"
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
      "traitSets": [
        {
          "id": "name",
          "name": "Name",
          "traits": [
            {
              "name": "name",
              "traits": [],
              "sfx": [],
              "label": "Name"
            },
            {
              "name": "player",
              "traits": [],
              "sfx": [],
              "label": "Player"
            },
            {
              "name": "nickname",
              "traits": [],
              "sfx": [],
              "label": "Nickname"
            },
            {
              "name": "pronouns",
              "traits": [],
              "sfx": [],
              "label": "Pronouns"
            },
            {
              "name": "description",
              "traits": [],
              "sfx": [],
              "label": "Description"
            },
            {
              "name": "game",
              "traits": [],
              "sfx": [],
              "label": "Game",
              "view": {
                "visibility": "hidden"
              }
            },
            {
              "name": "portrait",
              "traits": [],
              "sfx": []
            },
            {
              "name": "caption",
              "traits": [],
              "sfx": []
            },
            {
              "name": "plotPoints",
              "traits": [],
              "sfx": [],
              "label": "PP",
              "view": {
                "visibility": "hidden"
              },
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
              "spendable": true
            },
            {
              "name": "notes",
              "traits": [],
              "sfx": [],
              "view": {
                "visibility": "hidden"
              }
            }
          ],
          "sfx": [],
          "view": {
            "style": {
              "header": "default",
              "body": "name"
            },
            "page": 1
          }
        },
        {
          "id": "ks-distinctions",
          "name": "Distinctions",
          "traits": [
            {
              "name": "Walking Style Guide",
              "description": "Every layout edge case deserves a test.",
              "traits": [],
              "sfx": [
                "hinder",
                {
                  "name": "Pixel Parity",
                  "description": "Spend 1 PP to step up or double a die when testing visual alignment against a reference PDF."
                }
              ],
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
              }
            },
            {
              "name": "",
              "traits": [],
              "sfx": [
                "hinder"
              ],
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
              }
            },
            {
              "name": "",
              "traits": [],
              "sfx": [
                "hinder"
              ],
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
              }
            }
          ],
          "sfx": [],
          "view": {
            "page": 1,
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
              "sfx": {
                "left": "0%",
                "top": 2,
                "width": "100%",
                "height": 1
              }
            }
          },
          "noun": "Distinction",
          "plural": "Distinctions"
        },
        {
          "id": "ks-values-statements",
          "name": "Values",
          "statement": true,
          "hasQuestionedPip": true,
          "traits": [
            {
              "name": "Craft",
              "description": "Form and function are inseparable.",
              "traits": [],
              "sfx": [],
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
              }
            },
            {
              "name": "Speed",
              "description": "Ship early, refine relentlessly.",
              "questioned": true,
              "traits": [],
              "sfx": [],
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
              }
            },
            {
              "name": "Clarity",
              "traits": [],
              "sfx": [],
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
              }
            }
          ],
          "sfx": [],
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
            }
          },
          "noun": "Value",
          "plural": "Values"
        },
        {
          "id": "ks-subtrait-columns",
          "name": "Skills",
          "traits": [
            {
              "name": "Engineering",
              "traits": [
                {
                  "name": "Clockwork",
                  "traits": [],
                  "sfx": [],
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
                  }
                },
                {
                  "name": "Aetherics",
                  "traits": [],
                  "sfx": [],
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
                  }
                }
              ],
              "sfx": [],
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
              }
            },
            {
              "name": "Navigation",
              "traits": [
                {
                  "name": "Star Charts",
                  "traits": [],
                  "sfx": [],
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
                  }
                }
              ],
              "sfx": [],
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
              }
            },
            {
              "name": "Diplomacy",
              "traits": [],
              "sfx": [],
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
              }
            }
          ],
          "sfx": [],
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
            }
          },
          "noun": "Skill",
          "plural": "Skills"
        },
        {
          "id": "ks-paired-slots",
          "name": "Standing",
          "statement": true,
          "traits": [
            {
              "name": "The Guild",
              "description": "They owe me a drydock bay.",
              "traits": [
                {
                  "name": "Complication",
                  "traits": [],
                  "sfx": [],
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
                  }
                },
                {
                  "name": "Bonus",
                  "traits": [],
                  "sfx": [],
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
                  }
                }
              ],
              "sfx": [],
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
              }
            }
          ],
          "sfx": [],
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
            "reservedSlots": 2
          },
          "noun": "Standing",
          "plural": "Standings"
        },
        {
          "id": "ks-die-rows",
          "name": "Badges",
          "hasCounterColumn": true,
          "counterLabel": "XP",
          "traits": [
            {
              "name": "First Responder",
              "xp": 3,
              "traits": [],
              "sfx": [],
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
              }
            },
            {
              "name": "Trailblazer",
              "xp": 1,
              "traits": [],
              "sfx": [],
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
              }
            }
          ],
          "sfx": [],
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
            }
          },
          "noun": "Badge",
          "plural": "Badges"
        },
        {
          "id": "ks-three-col-table",
          "name": "Talents",
          "traits": [
            {
              "name": "Overclock",
              "description": "Spend 1 PP when rolling Engineering.",
              "traits": [],
              "sfx": [
                {
                  "name": "Effect",
                  "description": "Step up your Effect die by one step for the scene."
                }
              ]
            }
          ],
          "sfx": [],
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
            }
          },
          "noun": "Talent",
          "plural": "Talents"
        },
        {
          "id": "ks-dice-count",
          "name": "Resources",
          "traits": [
            {
              "name": "Salvage Cache",
              "traits": [],
              "sfx": [],
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
              "hitches": 0
            },
            {
              "name": "Contacts",
              "traits": [],
              "sfx": [],
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
              "hitches": 0
            }
          ],
          "sfx": [],
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
            }
          },
          "noun": "Resource",
          "plural": "Resources"
        },
        {
          "id": "ks-stress",
          "name": "Stress",
          "traits": [
            {
              "name": "Physical",
              "traits": [],
              "sfx": [],
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
              }
            },
            {
              "name": "Mental",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Social",
              "traits": [],
              "sfx": [],
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
              }
            }
          ],
          "sfx": [],
          "view": {
            "page": 1,
            "style": {
              "header": "default",
              "body": "stress"
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
            }
          },
          "noun": "Stress",
          "plural": "Stress"
        },
        {
          "id": "ks-dice-ladder",
          "name": "Growth Ladder",
          "traits": [
            {
              "name": "Novice",
              "traits": [],
              "sfx": [],
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
              }
            },
            {
              "name": "Adept",
              "traits": [],
              "sfx": [],
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
              }
            },
            {
              "name": "Master",
              "traits": [],
              "sfx": [],
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
              }
            }
          ],
          "sfx": [],
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
            }
          },
          "noun": "Rung",
          "plural": "Rungs"
        },
        {
          "id": "ks-labeled-fields",
          "name": "Dossier",
          "traits": [
            {
              "name": "Origin",
              "description": "Outer Rim Shipyard #4",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Drive",
              "description": "Restore the lost fleet",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Quirk",
              "traits": [],
              "sfx": []
            }
          ],
          "sfx": [],
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
            }
          },
          "noun": "Field",
          "plural": "Fields"
        },
        {
          "id": "ks-pips",
          "name": "Progress Track",
          "traits": [],
          "sfx": [],
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
            }
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
            ],
            "range": [
              10
            ]
          },
          "noun": "Pip",
          "plural": "Pips"
        },
        {
          "id": "ks-session-record",
          "name": "Session Record",
          "traits": [
            {
              "name": "Session 1: The Awakening",
              "traits": [],
              "sfx": [],
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
              }
            },
            {
              "name": "Session 2: Crossing the Threshold",
              "traits": [],
              "sfx": []
            }
          ],
          "sfx": [],
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
            }
          },
          "rating": {
            "type": "Pip",
            "value": [
              false,
              false,
              false
            ],
            "range": [
              3
            ]
          },
          "noun": "Session",
          "plural": "Sessions"
        },
        {
          "id": "ks-two-col-compact",
          "name": "Roles (Compact Two-Column)",
          "traits": [
            {
              "name": "Tactician",
              "traits": [],
              "sfx": [],
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
              }
            },
            {
              "name": "Outrider",
              "traits": [],
              "sfx": [],
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
              }
            },
            {
              "name": "Scholar",
              "traits": [],
              "sfx": [],
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
              }
            },
            {
              "name": "Sentinel",
              "traits": [],
              "sfx": [],
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
              }
            }
          ],
          "sfx": [],
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
            }
          },
          "noun": "Role",
          "plural": "Roles"
        },
        {
          "id": "ks-notes",
          "name": "Notes",
          "traits": [],
          "sfx": [],
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
            }
          },
          "noun": "Note",
          "plural": "Notes"
        },
        {
          "id": "ks-detailed-columns",
          "name": "Detailed Columns",
          "traits": [
            {
              "name": "Alpha",
              "description": "First detailed entry.",
              "traits": [],
              "sfx": [],
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
              }
            },
            {
              "name": "Beta",
              "description": "Second detailed entry.",
              "traits": [],
              "sfx": [],
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
              }
            },
            {
              "name": "Gamma",
              "description": "Third detailed entry.",
              "traits": [],
              "sfx": [],
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
              }
            },
            {
              "name": "Delta",
              "description": "Fourth detailed entry.",
              "traits": [],
              "sfx": [],
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
              }
            }
          ],
          "sfx": [],
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
            }
          },
          "noun": "Entry",
          "plural": "Entries"
        },
        {
          "id": "ks-resource-pool",
          "name": "Resource Pool",
          "traits": [
            {
              "name": "Supply",
              "traits": [
                {
                  "name": "Ammo",
                  "traits": [],
                  "sfx": [],
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
                  }
                }
              ],
              "sfx": [],
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
              "hitches": 0
            },
            {
              "name": "Fuel",
              "traits": [],
              "sfx": [],
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
              "hitches": 0
            },
            {
              "name": "Intel",
              "traits": [],
              "sfx": [],
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
              "hitches": 0
            }
          ],
          "sfx": [],
          "view": {
            "page": 3,
            "style": {
              "header": "resources",
              "body": "resources"
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
            }
          },
          "noun": "Resource",
          "plural": "Resources"
        },
        {
          "id": "ks-assets",
          "name": "Signature Assets",
          "traits": [
            {
              "name": "Custom Sidearm",
              "traits": [],
              "sfx": [],
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
              }
            },
            {
              "name": "Survey Kit",
              "traits": [],
              "sfx": [],
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
              }
            },
            {
              "name": "Encrypted Comms",
              "traits": [],
              "sfx": [],
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
              }
            }
          ],
          "sfx": [],
          "view": {
            "page": 3,
            "style": {
              "header": "assets",
              "body": "assets"
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
            }
          },
          "noun": "Asset",
          "plural": "Assets"
        },
        {
          "id": "ks-list",
          "name": "Simple List",
          "traits": [
            {
              "name": "Item One",
              "traits": [],
              "sfx": [],
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
              }
            },
            {
              "name": "Item Two",
              "traits": [],
              "sfx": [],
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
              }
            },
            {
              "name": "Item Three",
              "traits": [],
              "sfx": [],
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
              }
            }
          ],
          "sfx": [],
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
            }
          },
          "noun": "Item",
          "plural": "Items"
        },
        {
          "id": "ks-image",
          "name": "Image Set",
          "traits": [],
          "sfx": [],
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
            }
          },
          "noun": "Image",
          "plural": "Images"
        }
      ],
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
      }
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
      "traitSets": [
        {
          "id": "name",
          "name": "Name",
          "traits": [
            {
              "name": "name",
              "traits": [],
              "sfx": [],
              "label": "Name"
            },
            {
              "name": "player",
              "traits": [],
              "sfx": [],
              "label": "Player"
            },
            {
              "name": "nickname",
              "traits": [],
              "sfx": [],
              "label": "Nickname"
            },
            {
              "name": "pronouns",
              "traits": [],
              "sfx": [],
              "label": "Pronouns"
            },
            {
              "name": "description",
              "traits": [],
              "sfx": [],
              "label": "Description"
            },
            {
              "name": "game",
              "traits": [],
              "sfx": [],
              "label": "Game",
              "view": {
                "visibility": "hidden"
              }
            },
            {
              "name": "portrait",
              "traits": [],
              "sfx": []
            },
            {
              "name": "caption",
              "traits": [],
              "sfx": []
            },
            {
              "name": "plotPoints",
              "traits": [],
              "sfx": [],
              "label": "PP",
              "view": {
                "visibility": "hidden"
              },
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
              "spendable": true
            },
            {
              "name": "notes",
              "traits": [],
              "sfx": [],
              "view": {
                "visibility": "hidden"
              }
            }
          ],
          "sfx": [],
          "view": {
            "style": {
              "header": "default",
              "body": "name"
            },
            "page": 1
          }
        },
        {
          "id": "ls-roles",
          "name": "Roles & Masteries",
          "traits": [
            {
              "name": "Commander",
              "description": "Direct allies and coordinate tactical movement.",
              "traits": [],
              "sfx": [
                {
                  "name": "Lead from the Front",
                  "description": "Spend 1 PP to step up an ally's die when acting on your order."
                }
              ],
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
              }
            },
            {
              "name": "Infiltrator",
              "description": "Bypass security systems and move undetected.",
              "traits": [],
              "sfx": [
                {
                  "name": "Ghost Protocol",
                  "description": "Spend 1 PP to borrow a die from the challenge pool for stealth."
                }
              ],
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
              }
            },
            {
              "name": "Specialist",
              "description": "Analyze technical anomalies and reverse-engineer artifacts.",
              "traits": [],
              "sfx": [
                {
                  "name": "Tactical Insight",
                  "description": "Spend 1 PP to reroll a die when analyzing enemy technology."
                }
              ],
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
              }
            }
          ],
          "sfx": [],
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
            "headerAlign": "center"
          },
          "noun": "Role",
          "plural": "Roles"
        },
        {
          "id": "ls-skills",
          "name": "Skills & Specialties",
          "traits": [
            {
              "name": "Engineering",
              "traits": [
                {
                  "name": "Clockwork",
                  "traits": [],
                  "sfx": [],
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
                  }
                },
                {
                  "name": "Aetherics",
                  "traits": [],
                  "sfx": [],
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
                  }
                }
              ],
              "sfx": [],
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
              }
            },
            {
              "name": "Navigation",
              "traits": [
                {
                  "name": "Star Charts",
                  "traits": [],
                  "sfx": [],
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
                  }
                },
                {
                  "name": "Sub-Light",
                  "traits": [],
                  "sfx": [],
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
                  }
                }
              ],
              "sfx": [],
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
              }
            },
            {
              "name": "Diplomacy",
              "traits": [
                {
                  "name": "High Society",
                  "traits": [],
                  "sfx": [],
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
                  }
                },
                {
                  "name": "Street Smart",
                  "traits": [],
                  "sfx": [],
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
                  }
                }
              ],
              "sfx": [],
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
              }
            }
          ],
          "sfx": [],
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
            }
          },
          "noun": "Skill",
          "plural": "Skills"
        },
        {
          "id": "ls-standing",
          "name": "Standing",
          "traits": [
            {
              "name": "The Syndicate",
              "statement": "Debts are never forgotten.",
              "traits": [
                {
                  "name": "Complication",
                  "traits": [],
                  "sfx": [],
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
                  }
                },
                {
                  "name": "Bonus",
                  "traits": [],
                  "sfx": [],
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
                  }
                }
              ],
              "sfx": [],
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
              }
            },
            {
              "name": "The Vanguard",
              "statement": "Honor bound to protect.",
              "traits": [
                {
                  "name": "Complication",
                  "traits": [],
                  "sfx": [],
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
                  }
                },
                {
                  "name": "Bonus",
                  "traits": [],
                  "sfx": [],
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
                  }
                }
              ],
              "sfx": [],
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
              }
            }
          ],
          "sfx": [],
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
            }
          },
          "noun": "Standing",
          "plural": "Standings"
        },
        {
          "id": "ls-values",
          "name": "Values",
          "traits": [
            {
              "name": "Craft",
              "description": "Form and function are inseparable.",
              "statement": "Form and function are inseparable.",
              "traits": [],
              "sfx": [],
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
              }
            },
            {
              "name": "Speed",
              "description": "Ship early, refine relentlessly.",
              "statement": "Ship early, refine relentlessly.",
              "traits": [],
              "sfx": [],
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
              }
            },
            {
              "name": "Clarity",
              "description": "Truth cuts through ambiguity.",
              "statement": "Truth cuts through ambiguity.",
              "traits": [],
              "sfx": [],
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
              }
            }
          ],
          "sfx": [],
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
            }
          },
          "noun": "Value",
          "plural": "Values"
        },
        {
          "id": "ls-distinctions",
          "name": "Distinctions",
          "traits": [
            {
              "name": "Voidborn Pioneer",
              "description": "Accustomed to zero-G and cold vacuum.",
              "traits": [],
              "sfx": [
                {
                  "name": "Zero-G Maneuver",
                  "description": "Spend 1 PP to ignore difficult terrain in micro-gravity environments."
                }
              ],
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
              }
            },
            {
              "name": "Cybernetic Maverick",
              "description": "Upgraded with experimental neural cyberware.",
              "traits": [],
              "sfx": [
                {
                  "name": "Overclock",
                  "description": "Spend 1 PP to double an Engineering die when hotwiring security."
                }
              ],
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
              }
            }
          ],
          "sfx": [],
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
            }
          },
          "noun": "Distinction",
          "plural": "Distinctions"
        },
        {
          "id": "ls-growth",
          "name": "Growth Pool",
          "traits": [
            {
              "name": "D4",
              "traits": [],
              "sfx": [],
              "view": {
                "poolCount": 1
              },
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
              "hitches": 0
            },
            {
              "name": "D6",
              "traits": [],
              "sfx": [],
              "view": {
                "poolCount": 1
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
              "spendable": true,
              "hitches": 0
            },
            {
              "name": "D8",
              "traits": [],
              "sfx": [],
              "view": {
                "poolCount": 1
              },
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
              "hitches": 0
            },
            {
              "name": "D10",
              "traits": [],
              "sfx": [],
              "view": {
                "poolCount": 1
              },
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
              "hitches": 0
            },
            {
              "name": "D12",
              "traits": [],
              "sfx": [],
              "view": {
                "poolCount": 1
              },
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
              "hitches": 0
            }
          ],
          "sfx": [],
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
            }
          },
          "pool": true,
          "noun": "Growth Die",
          "plural": "Growth Dice"
        },
        {
          "id": "ls-badges",
          "name": "Badges & Commendations",
          "traits": [
            {
              "name": "Fleet Veteran",
              "traits": [],
              "sfx": [],
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
              }
            },
            {
              "name": "High Jump",
              "traits": [],
              "sfx": [],
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
              }
            },
            {
              "name": "Master Hacker",
              "traits": [],
              "sfx": [],
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
              }
            }
          ],
          "sfx": [],
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
            }
          },
          "noun": "Badge",
          "plural": "Badges"
        },
        {
          "id": "ls-resources",
          "name": "Resources & Supplies",
          "traits": [
            {
              "name": "Crew Complement",
              "traits": [],
              "sfx": [],
              "view": {
                "poolCount": 4
              },
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
              "hitches": 0
            },
            {
              "name": "Emergency Fuel",
              "traits": [],
              "sfx": [],
              "view": {
                "poolCount": 3
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
              "spendable": true,
              "hitches": 0
            },
            {
              "name": "Intel Network",
              "traits": [],
              "sfx": [],
              "view": {
                "poolCount": 2
              },
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
              "hitches": 0
            }
          ],
          "sfx": [],
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
            }
          },
          "noun": "Resource",
          "plural": "Resources"
        },
        {
          "id": "ls-dossier",
          "name": "Personnel Dossier",
          "traits": [
            {
              "name": "Homeworld",
              "description": "Kepler-452b Core Colony",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Security Clearance",
              "description": "Level 5 Special Access",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Affiliation",
              "description": "Independent Free-Trader Collective",
              "traits": [],
              "sfx": []
            }
          ],
          "sfx": [],
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
            }
          },
          "noun": "Field",
          "plural": "Fields"
        },
        {
          "id": "ls-stress",
          "name": "Stress",
          "traits": [
            {
              "name": "Physical",
              "traits": [],
              "sfx": [],
              "view": {
                "pipCount": 5,
                "pips": 1
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
              }
            },
            {
              "name": "Mental",
              "traits": [],
              "sfx": [],
              "view": {
                "pipCount": 5,
                "pips": 0
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
              }
            }
          ],
          "sfx": [],
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
            }
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
            ],
            "range": [
              10
            ]
          },
          "noun": "Stress",
          "plural": "Stress"
        },
        {
          "id": "ls-notes",
          "name": "Field Notes",
          "traits": [],
          "sfx": [],
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
            }
          },
          "noun": "Note",
          "plural": "Notes"
        },
        {
          "id": "ls-session-record",
          "name": "Mission Chronicle",
          "traits": [
            {
              "name": "",
              "traits": [],
              "sfx": [],
              "rating": {
                "type": "Pip",
                "value": [
                  true
                ],
                "range": [
                  1
                ]
              }
            },
            {
              "name": "",
              "traits": [],
              "sfx": [],
              "rating": {
                "type": "Pip",
                "value": [
                  true
                ],
                "range": [
                  1
                ]
              }
            },
            {
              "name": "",
              "traits": [],
              "sfx": [],
              "rating": {
                "type": "Pip",
                "value": [
                  true
                ],
                "range": [
                  1
                ]
              }
            }
          ],
          "sfx": [],
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
            }
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
            ],
            "range": [
              12
            ]
          },
          "noun": "Session",
          "plural": "Sessions"
        }
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
      }
    }
  }
];

if (typeof module !== "undefined" && module.exports) {
	module.exports = cortexSpotlightTemplates;
}
