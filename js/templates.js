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
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "Name"
            },
            {
              "name": "player",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "Player"
            },
            {
              "name": "nickname",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "Nickname"
            },
            {
              "name": "pronouns",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "Pronouns"
            },
            {
              "name": "description",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "Description"
            },
            {
              "name": "game",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "Game",
              "view": {
                "hidden": true
              }
            },
            {
              "name": "portrait",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "caption",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "plotPoints",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "PP",
              "view": {
                "hidden": true
              }
            },
            {
              "name": "notes",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "view": {
                "hidden": true
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
          "nounSingular": "Distinction",
          "nounPlural": "Distinctions",
          "traits": [
            {
              "name": "Alien Background:",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [
                "hinder"
              ]
            },
            {
              "name": "Alien Role/Job:",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [
                "hinder"
              ]
            },
            {
              "name": "Personality/Quirk:",
              "value": 0,
              "dice": [],
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
          }
        },
        {
          "id": "subtrait-columns",
          "name": "Skills & Specialties",
          "description": "Core baseline d6 skills with branching d8+ specialties",
          "nounSingular": "Skill",
          "nounPlural": "Skills",
          "traits": [
            {
              "name": "Bout",
              "value": 0,
              "dice": [],
              "traits": [
                {
                  "name": "",
                  "value": 0,
                  "dice": [],
                  "traits": [],
                  "sfx": [],
                  "view": {
                    "branchSide": "left"
                  }
                },
                {
                  "name": "",
                  "value": 0,
                  "dice": [],
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
              "value": 0,
              "dice": [],
              "traits": [
                {
                  "name": "",
                  "value": 0,
                  "dice": [],
                  "traits": [],
                  "sfx": [],
                  "view": {
                    "branchSide": "left"
                  }
                },
                {
                  "name": "",
                  "value": 0,
                  "dice": [],
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
              "value": 0,
              "dice": [],
              "traits": [
                {
                  "name": "",
                  "value": 0,
                  "dice": [],
                  "traits": [],
                  "sfx": [],
                  "view": {
                    "branchSide": "left"
                  }
                },
                {
                  "name": "",
                  "value": 0,
                  "dice": [],
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
              "value": 0,
              "dice": [],
              "traits": [
                {
                  "name": "",
                  "value": 0,
                  "dice": [],
                  "traits": [],
                  "sfx": [],
                  "view": {
                    "branchSide": "left"
                  }
                },
                {
                  "name": "",
                  "value": 0,
                  "dice": [],
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
              "value": 0,
              "dice": [],
              "traits": [
                {
                  "name": "",
                  "value": 0,
                  "dice": [],
                  "traits": [],
                  "sfx": [],
                  "view": {
                    "branchSide": "left"
                  }
                },
                {
                  "name": "",
                  "value": 0,
                  "dice": [],
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
              "value": 0,
              "dice": [],
              "traits": [
                {
                  "name": "",
                  "value": 0,
                  "dice": [],
                  "traits": [],
                  "sfx": [],
                  "view": {
                    "branchSide": "left"
                  }
                },
                {
                  "name": "",
                  "value": 0,
                  "dice": [],
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
              "value": 0,
              "dice": [],
              "traits": [
                {
                  "name": "",
                  "value": 0,
                  "dice": [],
                  "traits": [],
                  "sfx": [],
                  "view": {
                    "branchSide": "left"
                  }
                },
                {
                  "name": "",
                  "value": 0,
                  "dice": [],
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
            "notes": "",
            "reservedSlots": 7
          }
        },
        {
          "id": "values",
          "name": "Values",
          "description": "Alien worldview versus human conditioning",
          "nounSingular": "Value",
          "nounPlural": "Values",
          "statement": true,
          "traits": [
            {
              "name": "Alien",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Conformity",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Materialism",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Paranoia",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Patriotism",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Secrecy",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Spirituality",
              "value": 0,
              "dice": [],
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
          }
        },
        {
          "id": "talents",
          "name": "Talents",
          "description": "Specialized alien abilities and tech modules",
          "nounSingular": "Talent",
          "nounPlural": "Talents",
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
          }
        },
        {
          "id": "signature-assets-tech",
          "name": "Signature Assets / Tech",
          "description": "Alien equipment and concealed devices",
          "nounSingular": "Signature Asset / Tech",
          "nounPlural": "Signature Assets / Tech",
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
          }
        },
        {
          "id": "relationships",
          "name": "Relationships",
          "description": "Connections to human contacts, superiors, and rivals",
          "nounSingular": "Relationship",
          "nounPlural": "Relationships",
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
          }
        },
        {
          "id": "session-record",
          "name": "Session Record",
          "description": "Session track and progression log",
          "nounSingular": "Milestone",
          "nounPlural": "Milestones",
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
              "body": "session-record"
            },
            "sessionRecord": {
              "count": 20,
              "orientation": "horizontal"
            },
            "multiDie": false,
            "notes": "",
            "reservedSlots": 20,
            "place": {
              "left": "50%",
              "top": 2,
              "width": "50%",
              "height": 1
            }
          }
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
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "Name"
            },
            {
              "name": "player",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "Player"
            },
            {
              "name": "nickname",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "Nickname"
            },
            {
              "name": "pronouns",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "Pronouns"
            },
            {
              "name": "description",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "Description"
            },
            {
              "name": "game",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "Game",
              "view": {
                "hidden": true
              }
            },
            {
              "name": "portrait",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "caption",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "plotPoints",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "PP",
              "view": {
                "hidden": true
              }
            },
            {
              "name": "notes",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "view": {
                "hidden": true
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
          "nounSingular": "Distinction",
          "nounPlural": "Distinctions",
          "traits": [
            {
              "name": "Purpose:",
              "value": 8,
              "dice": [],
              "traits": [],
              "sfx": [
                "hinder"
              ]
            },
            {
              "name": "Quality:",
              "value": 8,
              "dice": [],
              "traits": [],
              "sfx": [
                "hinder"
              ]
            },
            {
              "name": "",
              "value": 8,
              "dice": [],
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
          }
        },
        {
          "id": "values",
          "name": "Values",
          "description": "Guiding philosophies paired with personal statements",
          "nounSingular": "Value",
          "nounPlural": "Values",
          "statement": true,
          "traits": [
            {
              "name": "Courage",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Curiosity",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Hope",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Logic",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Peace",
              "value": 0,
              "dice": [],
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
          }
        },
        {
          "id": "relationships",
          "name": "Relationships",
          "description": "Crew connections and ties to shipmates",
          "nounSingular": "Relationship",
          "nounPlural": "Relationships",
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
          }
        },
        {
          "id": "signature-assets",
          "name": "Signature Assets",
          "description": "Specialized starship equipment and personal gear",
          "nounSingular": "Signature Asset",
          "nounPlural": "Signature Assets",
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
          }
        },
        {
          "id": "personal-milestones",
          "name": "Personal Milestones",
          "nounSingular": "Milestone",
          "nounPlural": "Milestones",
          "traits": [
            {
              "name": "1 XP",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "3 XP",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "10 XP",
              "value": 0,
              "dice": [],
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
          }
        },
        {
          "id": "group-milestones",
          "name": "Group Milestones",
          "nounSingular": "Milestone",
          "nounPlural": "Milestones",
          "traits": [
            {
              "name": "1 XP",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "3 XP",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "10 XP",
              "value": 0,
              "dice": [],
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
          }
        },
        {
          "id": "xp",
          "name": "XP",
          "description": "Experience points bubble track",
          "nounSingular": "XP",
          "nounPlural": "XP",
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
              "count": 25,
              "perRow": 5,
              "connected": true,
              "filled": 0
            },
            "reservedSlots": 0,
            "place": {
              "left": "64%",
              "top": 3,
              "width": "36%",
              "height": 1
            }
          }
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
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "Name"
            },
            {
              "name": "player",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "Player"
            },
            {
              "name": "nickname",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "Nickname"
            },
            {
              "name": "pronouns",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "Pronouns"
            },
            {
              "name": "description",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "Description"
            },
            {
              "name": "game",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "Game",
              "view": {
                "hidden": true
              }
            },
            {
              "name": "portrait",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "caption",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "plotPoints",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "PP",
              "view": {
                "hidden": true
              }
            },
            {
              "name": "notes",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "view": {
                "hidden": true
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
          "nounSingular": "Distinction",
          "nounPlural": "Distinctions",
          "traits": [
            {
              "name": "HERITAGE:",
              "value": 8,
              "dice": [],
              "statement": "",
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
              "statement": "",
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
              "statement": "",
              "traits": [],
              "sfx": [
                {
                  "name": "Camp Reputation",
                  "description": "Spend a PP to create a d8 asset linked to the thing you're known for."
                }
              ]
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
          }
        },
        {
          "id": "values",
          "name": "Values",
          "description": "Camper ideals and loyalties",
          "nounSingular": "Value",
          "nounPlural": "Values",
          "statement": true,
          "hasQuestionedPip": true,
          "traits": [
            {
              "name": "Bravery",
              "value": 0,
              "dice": [],
              "statement": "",
              "questioned": false,
              "traits": [],
              "sfx": []
            },
            {
              "name": "Community",
              "value": 0,
              "dice": [],
              "statement": "",
              "questioned": false,
              "traits": [],
              "sfx": []
            },
            {
              "name": "Curiosity",
              "value": 0,
              "dice": [],
              "statement": "",
              "questioned": false,
              "traits": [],
              "sfx": []
            },
            {
              "name": "Friendship",
              "value": 0,
              "dice": [],
              "statement": "",
              "questioned": false,
              "traits": [],
              "sfx": []
            },
            {
              "name": "Mischief",
              "value": 0,
              "dice": [],
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
          }
        },
        {
          "id": "signature-assets",
          "name": "Signature Assets",
          "description": "Treasured camper keepsakes and scavenged relics",
          "nounSingular": "Signature Asset",
          "nounPlural": "Signature Assets",
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
          }
        },
        {
          "id": "attributes",
          "name": "Attributes",
          "description": "Core camper capability ratings",
          "nounSingular": "Attribute",
          "nounPlural": "Attributes",
          "traits": [
            {
              "name": "Mental",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Physical",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Social",
              "value": 0,
              "dice": [],
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
          }
        },
        {
          "id": "paired-slots",
          "name": "Standing",
          "description": "Camp social standing with complication and bonus dice",
          "nounSingular": "Standing",
          "nounPlural": "Standings",
          "statement": true,
          "ratingPosition": "inline",
          "traits": [
            {
              "name": "",
              "value": 0,
              "dice": [],
              "statement": "",
              "traits": [
                {
                  "name": "COMPLICATION",
                  "value": 0,
                  "dice": [],
                  "traits": [],
                  "sfx": []
                },
                {
                  "name": "BONUS",
                  "value": 0,
                  "dice": [],
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
              "statement": "",
              "traits": [
                {
                  "name": "COMPLICATION",
                  "value": 0,
                  "dice": [],
                  "traits": [],
                  "sfx": []
                },
                {
                  "name": "BONUS",
                  "value": 0,
                  "dice": [],
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
              "statement": "",
              "traits": [
                {
                  "name": "COMPLICATION",
                  "value": 0,
                  "dice": [],
                  "traits": [],
                  "sfx": []
                },
                {
                  "name": "BONUS",
                  "value": 0,
                  "dice": [],
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
              "statement": "",
              "traits": [
                {
                  "name": "COMPLICATION",
                  "value": 0,
                  "dice": [],
                  "traits": [],
                  "sfx": []
                },
                {
                  "name": "BONUS",
                  "value": 0,
                  "dice": [],
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
              "statement": "",
              "traits": [
                {
                  "name": "COMPLICATION",
                  "value": 0,
                  "dice": [],
                  "traits": [],
                  "sfx": []
                },
                {
                  "name": "BONUS",
                  "value": 0,
                  "dice": [],
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
              "statement": "",
              "traits": [
                {
                  "name": "COMPLICATION",
                  "value": 0,
                  "dice": [],
                  "traits": [],
                  "sfx": []
                },
                {
                  "name": "BONUS",
                  "value": 0,
                  "dice": [],
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
          }
        },
        {
          "id": "badges",
          "name": "Badges",
          "description": "Merit badges earned at camp",
          "nounSingular": "Badge",
          "nounPlural": "Badges",
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
          }
        },
        {
          "id": "talents",
          "name": "Talents",
          "description": "Camper knacks and signature tricks",
          "nounSingular": "Talent",
          "nounPlural": "Talents",
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
          }
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
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "Name"
            },
            {
              "name": "player",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "Player"
            },
            {
              "name": "nickname",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "Nickname"
            },
            {
              "name": "pronouns",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "Pronouns"
            },
            {
              "name": "description",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "Description"
            },
            {
              "name": "game",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "Game",
              "view": {
                "hidden": true
              }
            },
            {
              "name": "portrait",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "caption",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "plotPoints",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "PP",
              "view": {
                "hidden": true
              }
            },
            {
              "name": "notes",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "view": {
                "hidden": true
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
          "nounSingular": "Distinction",
          "nounPlural": "Distinctions",
          "traits": [
            {
              "name": "Neighborhood",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Crew",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "The Family",
              "value": 0,
              "dice": [],
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
          }
        },
        {
          "id": "resources",
          "name": "Resources",
          "description": "Syndicate operational pools and assets",
          "nounSingular": "Resource",
          "nounPlural": "Resources",
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
          }
        },
        {
          "id": "drives",
          "name": "Drives",
          "description": "Gain a PP when you use a drive rated at d4.",
          "nounSingular": "Drive",
          "nounPlural": "Drives",
          "traits": [
            {
              "name": "Corruption",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Greed",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Omerta",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Retribution",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Violence",
              "value": 0,
              "dice": [],
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
          }
        },
        {
          "id": "signature-assets",
          "name": "Signature Assets",
          "description": "Personal weapons, vehicles, and syndicate perks",
          "nounSingular": "Signature Asset",
          "nounPlural": "Signature Assets",
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
          }
        },
        {
          "id": "roles-specialties",
          "name": "Roles & Specialties",
          "description": "Syndicate roles with specialized criminal expertise",
          "nounSingular": "Role",
          "nounPlural": "Roles",
          "traits": [
            {
              "name": "Big Shot",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Brains",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Enforcer",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Thief",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Wheelman",
              "value": 0,
              "dice": [],
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
          }
        },
        {
          "id": "session-record",
          "name": "Session Record",
          "description": "Session tracking and milestone progression",
          "nounSingular": "Milestone",
          "nounPlural": "Milestones",
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
              "body": "session-record"
            },
            "sessionRecord": {
              "count": 15
            },
            "multiDie": false,
            "notes": "",
            "reservedSlots": 15,
            "place": {
              "left": "66.663%",
              "top": 1,
              "width": "33.334%",
              "height": 1
            }
          }
        },
        {
          "id": "role-sfx",
          "name": "Role SFX",
          "nounSingular": "SFX",
          "nounPlural": "SFX",
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
          }
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
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "Name"
            },
            {
              "name": "player",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "Player"
            },
            {
              "name": "nickname",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "Nickname"
            },
            {
              "name": "pronouns",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "Pronouns"
            },
            {
              "name": "description",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "Description"
            },
            {
              "name": "game",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "Game",
              "view": {
                "hidden": true
              }
            },
            {
              "name": "portrait",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "caption",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "plotPoints",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "PP",
              "view": {
                "hidden": true
              }
            },
            {
              "name": "notes",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "view": {
                "hidden": true
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
          "nounSingular": "Role",
          "nounPlural": "Roles",
          "traits": [
            {
              "name": "Warrior",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Priest",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Scout",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Other",
              "value": 0,
              "dice": [],
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
          }
        },
        {
          "id": "attributes",
          "name": "Attributes",
          "description": "Elemental selfhood with highlight circles and stress",
          "nounSingular": "Attribute",
          "nounPlural": "Attributes",
          "hasQuestionedPip": true,
          "traits": [
            {
              "name": "Courage",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Grace",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Guile",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Reason",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Vigor",
              "value": 0,
              "dice": [],
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
          }
        },
        {
          "id": "endarch-distinction",
          "name": "Endarch Distinction",
          "description": "Ancestral endarch patron and its three bound powers",
          "nounSingular": "Endarch Distinction",
          "nounPlural": "Endarch Distinctions",
          "traits": [
            {
              "name": "",
              "value": 8,
              "dice": [],
              "traits": [
                {
                  "name": "Power 1",
                  "value": 8,
                  "dice": [],
                  "traits": [],
                  "sfx": []
                },
                {
                  "name": "Power 2",
                  "value": 8,
                  "dice": [],
                  "traits": [],
                  "sfx": []
                },
                {
                  "name": "Power 3",
                  "value": 8,
                  "dice": [],
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
                  "name": "Summon",
                  "description": "Shut down this endarch distinction to summon your Eidolon on your next turn."
                }
              ]
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
          }
        },
        {
          "id": "summoned-eidolon",
          "name": "Summoned Eidolon",
          "description": "Manifested eidolon form: base trait, scale, powers, highlights",
          "nounSingular": "Eidolon Trait",
          "nounPlural": "Eidolon Traits",
          "traits": [
            {
              "name": "Base Trait",
              "value": 10,
              "dice": [
                10,
                10
              ],
              "description": "d10 d10 or d4 d4",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Scale",
              "value": 8,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Power 1",
              "value": 12,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Power 2",
              "value": 12,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Power 3",
              "value": 12,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Highlight Attribute 1",
              "value": 12,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Highlight Attribute 2",
              "value": 12,
              "dice": [],
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
          }
        },
        {
          "id": "role-freeform-distinctions",
          "name": "Role & Freeform Distinctions",
          "description": "Chosen calling and personal definition",
          "nounSingular": "Distinction",
          "nounPlural": "Distinctions",
          "traits": [
            {
              "name": "Role Distinction",
              "value": 8,
              "dice": [],
              "traits": [],
              "sfx": [
                "hinder"
              ]
            },
            {
              "name": "Freeform Distinction",
              "value": 8,
              "dice": [],
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
          }
        },
        {
          "id": "xp",
          "name": "XP",
          "description": "Experience points bubble track",
          "nounSingular": "XP",
          "nounPlural": "XP",
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
              "count": 20,
              "perRow": 1,
              "connected": false,
              "filled": 0
            },
            "place": {
              "left": "90%",
              "top": 0,
              "width": "10%",
              "height": 3
            }
          }
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
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "Name"
            },
            {
              "name": "player",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "Player"
            },
            {
              "name": "nickname",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "Nickname"
            },
            {
              "name": "pronouns",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "Pronouns"
            },
            {
              "name": "description",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "Description"
            },
            {
              "name": "game",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "Game",
              "view": {
                "hidden": true
              }
            },
            {
              "name": "portrait",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "caption",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "plotPoints",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "PP",
              "view": {
                "hidden": true
              }
            },
            {
              "name": "notes",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "view": {
                "hidden": true
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
          "nounSingular": "Attribute",
          "nounPlural": "Attributes",
          "traits": [
            {
              "name": "Physical",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Mental",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Social",
              "value": 0,
              "dice": [],
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
          }
        },
        {
          "id": "training-packages",
          "name": "Training Packages",
          "description": "Rescue disciplines and vehicle qualifications",
          "nounSingular": "Training Package",
          "nounPlural": "Training Packages",
          "traits": [
            {
              "name": "Crowd Control",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Emergency Medical",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Firefighting",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Hammerhead Pilot",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "HAZMAT",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "High-Altitude Recovery",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Legal Specialist",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Logistics",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Marine Recovery",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Network Specialist",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Mechanic",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Tactical Response",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Technical Analyst",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Urban Recovery",
              "value": 0,
              "dice": [],
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
          }
        },
        {
          "id": "distinctions",
          "name": "Distinctions",
          "description": "Origin, true nature, and defining quirk",
          "nounSingular": "Distinction",
          "nounPlural": "Distinctions",
          "traits": [
            {
              "name": "Your Life Before:",
              "value": 8,
              "dice": [],
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
          }
        },
        {
          "id": "relationships",
          "name": "Relationships",
          "description": "Crew bonds, debts, and troublemakers",
          "nounSingular": "Relationship",
          "nounPlural": "Relationships",
          "statement": true,
          "traits": [
            {
              "name": "",
              "value": 0,
              "dice": [],
              "description": "saved my life",
              "statement": "saved my life",
              "traits": [],
              "sfx": []
            },
            {
              "name": "",
              "value": 0,
              "dice": [],
              "description": "owes me big",
              "statement": "owes me big",
              "traits": [],
              "sfx": []
            },
            {
              "name": "",
              "value": 0,
              "dice": [],
              "description": "is a troublemaker",
              "statement": "is a troublemaker",
              "traits": [],
              "sfx": []
            },
            {
              "name": "",
              "value": 0,
              "dice": [],
              "description": "knows their stuff",
              "statement": "knows their stuff",
              "traits": [],
              "sfx": []
            },
            {
              "name": "",
              "value": 0,
              "dice": [],
              "description": "is a liability",
              "statement": "is a liability",
              "traits": [],
              "sfx": []
            },
            {
              "name": "",
              "value": 0,
              "dice": [],
              "description": "is dependable",
              "statement": "is dependable",
              "traits": [],
              "sfx": []
            },
            {
              "name": "",
              "value": 0,
              "dice": [],
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
          }
        },
        {
          "id": "xp",
          "name": "XP",
          "description": "Experience points bubble track",
          "nounSingular": "XP",
          "nounPlural": "XP",
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
              "count": 20,
              "perRow": 10,
              "connected": true,
              "filled": 0
            },
            "place": {
              "left": "36%",
              "top": 2,
              "width": "64%",
              "height": 1
            }
          }
        },
        {
          "id": "crisis-pools",
          "name": "Crisis Pools",
          "description": "Threat clocks and escalating disaster pools",
          "nounSingular": "Crisis Pool",
          "nounPlural": "Crisis Pools",
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
          }
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
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "Name"
            },
            {
              "name": "player",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "Player"
            },
            {
              "name": "nickname",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "Nickname"
            },
            {
              "name": "pronouns",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "Pronouns"
            },
            {
              "name": "description",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "Description"
            },
            {
              "name": "game",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "Game",
              "view": {
                "hidden": true
              }
            },
            {
              "name": "portrait",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "caption",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "plotPoints",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "PP",
              "view": {
                "hidden": true
              }
            },
            {
              "name": "notes",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "view": {
                "hidden": true
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
          "nounSingular": "Hammerhead Attribute",
          "nounPlural": "Hammerhead Attributes",
          "traits": [
            {
              "name": "Hammerhead One",
              "value": 0,
              "dice": [],
              "description": "More agile, possesses more precise sensors and instruments.",
              "traits": [
                {
                  "name": "Systems",
                  "value": 10,
                  "dice": [],
                  "traits": [],
                  "sfx": []
                },
                {
                  "name": "Engines",
                  "value": 8,
                  "dice": [],
                  "traits": [],
                  "sfx": []
                },
                {
                  "name": "Frame",
                  "value": 8,
                  "dice": [],
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
              "traits": [
                {
                  "name": "Systems",
                  "value": 8,
                  "dice": [],
                  "traits": [],
                  "sfx": []
                },
                {
                  "name": "Engines",
                  "value": 10,
                  "dice": [],
                  "traits": [],
                  "sfx": []
                },
                {
                  "name": "Frame",
                  "value": 8,
                  "dice": [],
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
              "traits": [
                {
                  "name": "Systems",
                  "value": 8,
                  "dice": [],
                  "traits": [],
                  "sfx": []
                },
                {
                  "name": "Engines",
                  "value": 8,
                  "dice": [],
                  "traits": [],
                  "sfx": []
                },
                {
                  "name": "Frame",
                  "value": 10,
                  "dice": [],
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
          }
        },
        {
          "id": "vehicle-distinctions",
          "name": "Vehicle Distinctions",
          "description": "Factory blessings and fleet reputation",
          "nounSingular": "Vehicle Distinction",
          "nounPlural": "Vehicle Distinctions",
          "traits": [
            {
              "name": "Resource Support Vehicle",
              "value": 8,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Top of the Line",
              "value": 8,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Broad-Spectrum Sensors",
              "value": 8,
              "dice": [],
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
          }
        },
        {
          "id": "resource-pools",
          "name": "Resource Pools",
          "description": "Staged supplies, support teams, and fleet backup",
          "nounSingular": "Resource Pool",
          "nounPlural": "Resource Pools",
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
              "traits": [],
              "sfx": []
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
          }
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
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "Name"
            },
            {
              "name": "player",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "Player"
            },
            {
              "name": "nickname",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "Nickname"
            },
            {
              "name": "pronouns",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "Pronouns"
            },
            {
              "name": "description",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "Description"
            },
            {
              "name": "game",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "Game",
              "view": {
                "hidden": true
              }
            },
            {
              "name": "portrait",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "caption",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "plotPoints",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "PP",
              "view": {
                "hidden": true
              }
            },
            {
              "name": "notes",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "view": {
                "hidden": true
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
          "nounSingular": "Attribute",
          "nounPlural": "Attributes",
          "traits": [
            {
              "name": "Action",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Heritage",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Science",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Weird",
              "value": 0,
              "dice": [],
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
          }
        },
        {
          "id": "stress",
          "name": "Stress",
          "nounSingular": "Stress",
          "nounPlural": "Stress",
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
          }
        },
        {
          "id": "distinctions",
          "name": "Distinctions",
          "description": "Bloodline heritage, archetype, and personal stance",
          "nounSingular": "Distinction",
          "nounPlural": "Distinctions",
          "traits": [
            {
              "name": "Family Tree",
              "value": 8,
              "dice": [],
              "traits": [],
              "sfx": [
                "hinder",
                {
                  "name": "Family Ties",
                  "description": "Spend a PP to get aid or advice from a member of your family tree in the form of a d8 asset."
                }
              ]
            },
            {
              "name": "Approach to Conflict",
              "value": 8,
              "dice": [],
              "traits": [],
              "sfx": [
                "hinder"
              ]
            },
            {
              "name": "Personality/Quirk",
              "value": 8,
              "dice": [],
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
          }
        },
        {
          "id": "inherited-abilities",
          "name": "Abilities",
          "description": "Powers granted by bloodline and relics",
          "nounSingular": "Ability",
          "nounPlural": "Abilities",
          "traits": [
            {
              "name": "",
              "value": 0,
              "dice": [],
              "traits": [
                {
                  "name": "Effect Tags:",
                  "value": 0,
                  "dice": [],
                  "traits": [],
                  "sfx": []
                },
                {
                  "name": "Limit:",
                  "value": 0,
                  "dice": [],
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
              "traits": [
                {
                  "name": "Effect Tags:",
                  "value": 0,
                  "dice": [],
                  "traits": [],
                  "sfx": []
                },
                {
                  "name": "Limit:",
                  "value": 0,
                  "dice": [],
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
              "traits": [
                {
                  "name": "Effect Tags:",
                  "value": 0,
                  "dice": [],
                  "traits": [],
                  "sfx": []
                },
                {
                  "name": "Limit:",
                  "value": 0,
                  "dice": [],
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
          }
        },
        {
          "id": "skills",
          "name": "Skills",
          "description": "Training and mundane competencies",
          "nounSingular": "Skill",
          "nounPlural": "Skills",
          "traits": [
            {
              "name": "Acquire",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Build",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Charm",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Fight",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Investigate",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Move",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Perform",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Pilot",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Shoot",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Sneak",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Study",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Survive",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Treat",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Trick",
              "value": 0,
              "dice": [],
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
          }
        },
        {
          "id": "heirlooms-milestones",
          "name": "Heirlooms",
          "description": "Item: Oh, There It Is. Spend a PP to declare that the item, if you didn't have it at the beginning of the scene, is now in your possession despite it being narratively improbable.\nVehicle: I'm Here! Spend a PP to use a vehicle to enter any scene that the vehicle can get you to.\nBase: Resourceful. Spend a PP to reveal that you have brought something useful from your base, thus allowing you to roll the heirloom in subsequent related actions.\nPet: Proxy. Spend a PP to affect a scene where you aren't physically present but your pet is. While you build your dice pool as normal, you're limited to actions your pet can perform.",
          "nounSingular": "Heirloom",
          "nounPlural": "Heirlooms",
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
          }
        },
        {
          "id": "personal-milestones",
          "name": "Personal Milestones",
          "nounSingular": "Milestone",
          "nounPlural": "Milestones",
          "traits": [
            {
              "name": "1 XP",
              "value": 0,
              "dice": [],
              "description": "when ",
              "traits": [],
              "sfx": []
            },
            {
              "name": "3 XP",
              "value": 0,
              "dice": [],
              "description": "when ",
              "traits": [],
              "sfx": []
            },
            {
              "name": "10 XP",
              "value": 0,
              "dice": [],
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
          }
        },
        {
          "id": "group-milestones",
          "name": "Group Milestones",
          "nounSingular": "Milestone",
          "nounPlural": "Milestones",
          "traits": [
            {
              "name": "1 XP",
              "value": 0,
              "dice": [],
              "description": "when ",
              "traits": [],
              "sfx": []
            },
            {
              "name": "3 XP",
              "value": 0,
              "dice": [],
              "description": "when ",
              "traits": [],
              "sfx": []
            },
            {
              "name": "10 XP",
              "value": 0,
              "dice": [],
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
          }
        },
        {
          "id": "xp",
          "name": "XP",
          "nounSingular": "Pip",
          "nounPlural": "Pips",
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
              "count": 25,
              "perRow": 5,
              "connected": true,
              "filled": 0
            },
            "place": {
              "left": "75%",
              "top": 5,
              "width": "25%",
              "height": 1
            }
          }
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
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "Name"
            },
            {
              "name": "player",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "Player"
            },
            {
              "name": "nickname",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "Nickname"
            },
            {
              "name": "pronouns",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "Pronouns"
            },
            {
              "name": "description",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "Description"
            },
            {
              "name": "game",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "Game",
              "view": {
                "hidden": true
              }
            },
            {
              "name": "portrait",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "caption",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "plotPoints",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "PP",
              "view": {
                "hidden": true
              }
            },
            {
              "name": "notes",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "view": {
                "hidden": true
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
          "nounSingular": "Detail",
          "nounPlural": "Details",
          "traits": [
            {
              "name": "Name",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Description",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Fame",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Features",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Deed",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Current Fate",
              "value": 0,
              "dice": [],
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
          }
        },
        {
          "id": "parents-generation-a",
          "name": "Parents' Generation",
          "nounSingular": "Detail",
          "nounPlural": "Details",
          "traits": [
            {
              "name": "Name",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Description",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Fame",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Features",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Deed",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Current Fate",
              "value": 0,
              "dice": [],
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
          }
        },
        {
          "id": "parents-generation-b",
          "name": "Parents' Generation",
          "nounSingular": "Detail",
          "nounPlural": "Details",
          "traits": [
            {
              "name": "Name",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Description",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Fame",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Features",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Deed",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Current Fate",
              "value": 0,
              "dice": [],
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
          }
        },
        {
          "id": "grandparents-generation-a",
          "name": "Grandparents' Generation",
          "nounSingular": "Detail",
          "nounPlural": "Details",
          "traits": [
            {
              "name": "Name",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Description",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Fame",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Features",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Deed",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Current Fate",
              "value": 0,
              "dice": [],
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
          }
        },
        {
          "id": "grandparents-generation-b",
          "name": "Grandparents' Generation",
          "nounSingular": "Detail",
          "nounPlural": "Details",
          "traits": [
            {
              "name": "Name",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Description",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Fame",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Features",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Deed",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Current Fate",
              "value": 0,
              "dice": [],
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
          }
        },
        {
          "id": "wild-card-a",
          "name": "Wild Card Branch",
          "nounSingular": "Detail",
          "nounPlural": "Details",
          "traits": [
            {
              "name": "Name",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Description",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Fame",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Features",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Deed",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Current Fate",
              "value": 0,
              "dice": [],
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
          }
        },
        {
          "id": "wild-card-b",
          "name": "Wild Card Branch",
          "nounSingular": "Detail",
          "nounPlural": "Details",
          "traits": [
            {
              "name": "Name",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Description",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Fame",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Features",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Deed",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Current Fate",
              "value": 0,
              "dice": [],
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
          }
        },
        {
          "id": "wild-card-c",
          "name": "Wild Card Branch",
          "nounSingular": "Detail",
          "nounPlural": "Details",
          "traits": [
            {
              "name": "Name",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Description",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Fame",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Features",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Deed",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Current Fate",
              "value": 0,
              "dice": [],
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
          }
        },
        {
          "id": "wild-card-d",
          "name": "Wild Card Branch",
          "nounSingular": "Detail",
          "nounPlural": "Details",
          "traits": [
            {
              "name": "Name",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Description",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Fame",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Features",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Deed",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Current Fate",
              "value": 0,
              "dice": [],
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
          }
        },
        {
          "id": "wild-card-e",
          "name": "Wild Card Branch",
          "nounSingular": "Detail",
          "nounPlural": "Details",
          "traits": [
            {
              "name": "Name",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Description",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Fame",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Features",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Deed",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Current Fate",
              "value": 0,
              "dice": [],
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
          }
        },
        {
          "id": "gmc-a",
          "name": "GMC",
          "nounSingular": "Detail",
          "nounPlural": "Details",
          "traits": [
            {
              "name": "Name",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Relationship to PCs",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Relationship to GMCs",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Description",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Fame",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Features",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Deed",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Current Fate",
              "value": 0,
              "dice": [],
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
          }
        },
        {
          "id": "gmc-b",
          "name": "GMC",
          "nounSingular": "Detail",
          "nounPlural": "Details",
          "traits": [
            {
              "name": "Name",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Relationship to PCs",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Relationship to GMCs",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Description",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Fame",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Features",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Deed",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Current Fate",
              "value": 0,
              "dice": [],
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
          }
        },
        {
          "id": "gmc-c",
          "name": "GMC",
          "nounSingular": "Detail",
          "nounPlural": "Details",
          "traits": [
            {
              "name": "Name",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Relationship to PCs",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Relationship to GMCs",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Description",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Fame",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Features",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Deed",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Current Fate",
              "value": 0,
              "dice": [],
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
          }
        },
        {
          "id": "gmc-d",
          "name": "GMC",
          "nounSingular": "Detail",
          "nounPlural": "Details",
          "traits": [
            {
              "name": "Name",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Relationship to PCs",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Relationship to GMCs",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Description",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Fame",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Features",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Deed",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Current Fate",
              "value": 0,
              "dice": [],
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
          }
        },
        {
          "id": "gmc-e",
          "name": "GMC",
          "nounSingular": "Detail",
          "nounPlural": "Details",
          "traits": [
            {
              "name": "Name",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Relationship to PCs",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Relationship to GMCs",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Description",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Fame",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Features",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Deed",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Current Fate",
              "value": 0,
              "dice": [],
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
          }
        },
        {
          "id": "gmc-f",
          "name": "GMC",
          "nounSingular": "Detail",
          "nounPlural": "Details",
          "traits": [
            {
              "name": "Name",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Relationship to PCs",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Relationship to GMCs",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Description",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Fame",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Features",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Deed",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Current Fate",
              "value": 0,
              "dice": [],
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
          }
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
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "Name"
            },
            {
              "name": "player",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "Player"
            },
            {
              "name": "nickname",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "Nickname"
            },
            {
              "name": "pronouns",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "Pronouns"
            },
            {
              "name": "description",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "Description"
            },
            {
              "name": "game",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "Game",
              "view": {
                "hidden": true
              }
            },
            {
              "name": "portrait",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "caption",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "plotPoints",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "PP",
              "view": {
                "hidden": true
              }
            },
            {
              "name": "notes",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "view": {
                "hidden": true
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
          "nounSingular": "Distinction",
          "nounPlural": "Distinctions",
          "traits": [
            {
              "name": "Personality:",
              "value": 8,
              "dice": [],
              "traits": [],
              "sfx": [
                "hinder"
              ]
            },
            {
              "name": "Past:",
              "value": 8,
              "dice": [],
              "traits": [],
              "sfx": [
                "hinder"
              ]
            },
            {
              "name": "Quirk:",
              "value": 8,
              "dice": [],
              "traits": [],
              "sfx": [
                "hinder"
              ]
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
          }
        },
        {
          "id": "affiliations",
          "name": "Affiliations",
          "description": "Operating mode ratings",
          "nounSingular": "Affiliation",
          "nounPlural": "Affiliations",
          "traits": [
            {
              "name": "Personal:",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Group:",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "World:",
              "value": 0,
              "dice": [],
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
          }
        },
        {
          "id": "specialties",
          "name": "Specialties",
          "description": "Master and expert professional skills",
          "nounSingular": "Specialty",
          "nounPlural": "Specialties",
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
          }
        },
        {
          "id": "signature-assets",
          "name": "Signature Assets",
          "description": "Heroic gear and vehicles",
          "nounSingular": "Signature Asset",
          "nounPlural": "Signature Assets",
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
          }
        },
        {
          "id": "stress",
          "name": "Stress",
          "nounSingular": "Stress",
          "nounPlural": "Stress",
          "traits": [
            {
              "name": "Physical",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Mental",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Social",
              "value": 0,
              "dice": [],
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
          }
        },
        {
          "id": "growth-pool",
          "name": "Growth Pool",
          "nounSingular": "Growth Die",
          "nounPlural": "Growth Dice",
          "traits": [
            {
              "name": "D4",
              "value": 4,
              "dice": [],
              "traits": [],
              "sfx": [],
              "view": {
                "poolCount": 1
              }
            },
            {
              "name": "D6",
              "value": 6,
              "dice": [],
              "traits": [],
              "sfx": [],
              "view": {
                "poolCount": 1
              }
            },
            {
              "name": "D8",
              "value": 8,
              "dice": [],
              "traits": [],
              "sfx": [],
              "view": {
                "poolCount": 1
              }
            },
            {
              "name": "D10",
              "value": 10,
              "dice": [],
              "traits": [],
              "sfx": [],
              "view": {
                "poolCount": 1
              }
            },
            {
              "name": "D12",
              "value": 12,
              "dice": [],
              "traits": [],
              "sfx": [],
              "view": {
                "poolCount": 1
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
            "pool": true,
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
          }
        },
        {
          "id": "power-set",
          "name": "Power Set 1",
          "description": "Modular powers, SFX triggers, and shutdown limits",
          "nounSingular": "Power Set",
          "nounPlural": "Power Sets",
          "traits": [
            {
              "name": "Powers",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Limits",
              "value": 0,
              "dice": [],
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
          }
        },
        {
          "id": "power-set-2",
          "name": "Power Set 2",
          "nounSingular": "Power",
          "nounPlural": "Powers",
          "traits": [
            {
              "name": "Powers",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Limits",
              "value": 0,
              "dice": [],
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
          }
        },
        {
          "id": "power-set-3",
          "name": "Power Set 3",
          "nounSingular": "Power",
          "nounPlural": "Powers",
          "traits": [
            {
              "name": "Powers",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Limits",
              "value": 0,
              "dice": [],
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
          }
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
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "Name"
            },
            {
              "name": "player",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "Player"
            },
            {
              "name": "nickname",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "Nickname"
            },
            {
              "name": "pronouns",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "Pronouns"
            },
            {
              "name": "description",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "Description"
            },
            {
              "name": "game",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "Game",
              "view": {
                "hidden": true
              }
            },
            {
              "name": "portrait",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "caption",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "plotPoints",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "PP",
              "view": {
                "hidden": true
              }
            },
            {
              "name": "notes",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "view": {
                "hidden": true
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
          "nounSingular": "Detail",
          "nounPlural": "Details",
          "traits": [
            {
              "name": "Name",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Location",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Description",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Benefits",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Drawbacks",
              "value": 0,
              "dice": [],
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
          }
        },
        {
          "id": "team-resources",
          "name": "Team Resources",
          "nounSingular": "Resource",
          "nounPlural": "Resources",
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
          }
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
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "Name"
            },
            {
              "name": "player",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "Player"
            },
            {
              "name": "nickname",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "Nickname"
            },
            {
              "name": "pronouns",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "Pronouns"
            },
            {
              "name": "description",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "Description"
            },
            {
              "name": "game",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "Game",
              "view": {
                "hidden": true
              }
            },
            {
              "name": "portrait",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "caption",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "plotPoints",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "PP",
              "view": {
                "hidden": true
              }
            },
            {
              "name": "notes",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "view": {
                "hidden": true
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
          "nounSingular": "Distinction",
          "nounPlural": "Distinctions",
          "traits": [
            {
              "name": "Extraordinary:",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [
                "hinder"
              ]
            },
            {
              "name": "Backstory:",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Role:",
              "value": 0,
              "dice": [],
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
          }
        },
        {
          "id": "signature-assets-curios",
          "name": "Signature Assets",
          "description": "Heirlooms and keepsakes from the misty coast",
          "nounSingular": "Signature Asset",
          "nounPlural": "Signature Assets",
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
          }
        },
        {
          "id": "emotional-attributes-stress",
          "name": "Attributes",
          "description": "Core emotional drives with corresponding statements and stress",
          "nounSingular": "Attribute",
          "nounPlural": "Attributes",
          "statement": true,
          "traits": [
            {
              "name": "Anger",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Desire",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Fear",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Joy",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Sorrow",
              "value": 0,
              "dice": [],
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
          }
        },
        {
          "id": "town-relationships",
          "name": "Relationships",
          "description": "Bonds and rivalries with local residents",
          "nounSingular": "Relationship",
          "nounPlural": "Relationships",
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
          }
        },
        {
          "id": "growth-pool",
          "name": "Growth Pool",
          "nounSingular": "Growth Die",
          "nounPlural": "Growth Dice",
          "traits": [
            {
              "name": "D4",
              "value": 4,
              "dice": [],
              "traits": [],
              "sfx": [],
              "view": {
                "poolCount": 1
              }
            },
            {
              "name": "D6",
              "value": 6,
              "dice": [],
              "traits": [],
              "sfx": [],
              "view": {
                "poolCount": 1
              }
            },
            {
              "name": "D8",
              "value": 8,
              "dice": [],
              "traits": [],
              "sfx": [],
              "view": {
                "poolCount": 1
              }
            },
            {
              "name": "D10",
              "value": 10,
              "dice": [],
              "traits": [],
              "sfx": [],
              "view": {
                "poolCount": 1
              }
            },
            {
              "name": "D12",
              "value": 12,
              "dice": [],
              "traits": [],
              "sfx": [],
              "view": {
                "poolCount": 1
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
            "pool": true,
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
          }
        },
        {
          "id": "complications",
          "name": "Complications",
          "nounSingular": "Complication",
          "nounPlural": "Complications",
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
          }
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
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "Name"
            },
            {
              "name": "player",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "Player"
            },
            {
              "name": "nickname",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "Nickname"
            },
            {
              "name": "pronouns",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "Pronouns"
            },
            {
              "name": "description",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "Description"
            },
            {
              "name": "game",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "Game",
              "view": {
                "hidden": true
              }
            },
            {
              "name": "portrait",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "caption",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "plotPoints",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "PP",
              "view": {
                "hidden": true
              }
            },
            {
              "name": "notes",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "view": {
                "hidden": true
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
          "nounSingular": "Distinction",
          "nounPlural": "Distinctions",
          "traits": [
            {
              "name": "Job:",
              "value": 8,
              "dice": [],
              "traits": [],
              "sfx": [
                "hinder"
              ]
            },
            {
              "name": "Necromancy:",
              "value": 8,
              "dice": [],
              "traits": [],
              "sfx": [
                "hinder"
              ]
            },
            {
              "name": "Desire:",
              "value": 8,
              "dice": [],
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
          }
        },
        {
          "id": "affiliations",
          "name": "Affiliations",
          "description": "Operating configuration dice and statements",
          "nounSingular": "Affiliation",
          "nounPlural": "Affiliations",
          "statement": true,
          "traits": [
            {
              "name": "My Life",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "The World",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "The Demi-Monde",
              "value": 0,
              "dice": [],
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
          }
        },
        {
          "id": "roles-specialties",
          "name": "Roles",
          "description": "Dark magical callings and practices",
          "nounSingular": "Role",
          "nounPlural": "Roles",
          "traits": [
            {
              "name": "Diplomat",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Fighter",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Guardian",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Healer",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Sneak",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Transporter",
              "value": 0,
              "dice": [],
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
          }
        },
        {
          "id": "signature-assets",
          "name": "Signature Assets",
          "description": "Occult relics, grimoires, and dark instruments",
          "nounSingular": "Signature Asset",
          "nounPlural": "Signature Assets",
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
          }
        },
        {
          "id": "necromantic-arts",
          "name": "Ability",
          "description": "EFFECT TAGS: ATTACK • SENSORY • MOVEMENT • CONTROL • DEFENSE • ENHANCEMENT",
          "nounSingular": "Ability",
          "nounPlural": "Abilities",
          "traits": [
            {
              "name": "Necromancy",
              "value": 0,
              "dice": [],
              "traits": [
                {
                  "name": "Descriptor Tags:",
                  "value": 0,
                  "dice": [],
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
          }
        },
        {
          "id": "session-record",
          "name": "Session Record",
          "nounSingular": "Milestone",
          "nounPlural": "Milestones",
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
              "body": "session-record"
            },
            "sessionRecord": {
              "count": 10,
              "orientation": "horizontal"
            },
            "reservedSlots": 10,
            "place": {
              "left": "0%",
              "top": 4,
              "width": "62%",
              "height": 1
            }
          }
        },
        {
          "id": "complications",
          "name": "Complications",
          "nounSingular": "Complication",
          "nounPlural": "Complications",
          "traits": [
            {
              "name": "Deathmark",
              "value": 0,
              "dice": [],
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
          }
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
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "Name"
            },
            {
              "name": "player",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "Player"
            },
            {
              "name": "nickname",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "Nickname"
            },
            {
              "name": "pronouns",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "Pronouns"
            },
            {
              "name": "description",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "Description"
            },
            {
              "name": "game",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "Game",
              "view": {
                "hidden": true
              }
            },
            {
              "name": "portrait",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "caption",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "plotPoints",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "PP",
              "view": {
                "hidden": true
              }
            },
            {
              "name": "notes",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "view": {
                "hidden": true
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
          "nounSingular": "Value",
          "nounPlural": "Values",
          "traits": [
            {
              "name": "Allegiance",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Glory",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Integrity",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Knowledge",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Novelty",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Power",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Riches",
              "value": 0,
              "dice": [],
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
          }
        },
        {
          "id": "distinctions",
          "name": "Distinctions",
          "description": "Past glory, modern civilian life, and the call to return",
          "nounSingular": "Distinction",
          "nounPlural": "Distinctions",
          "traits": [
            {
              "name": "Archetype",
              "value": 8,
              "dice": [],
              "traits": [],
              "sfx": [
                "hinder"
              ]
            },
            {
              "name": "Retirement",
              "value": 8,
              "dice": [],
              "traits": [],
              "sfx": [
                "hinder"
              ]
            },
            {
              "name": "Satisfaction",
              "value": 8,
              "dice": [],
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
          }
        },
        {
          "id": "vintage-resources-assets",
          "name": "Resources",
          "description": "Stashed tech, vintage vehicles, and old connections (5d6 each)",
          "nounSingular": "Resource",
          "nounPlural": "Resources",
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
          }
        },
        {
          "id": "signature-assets",
          "name": "Signature Assets",
          "nounSingular": "Asset",
          "nounPlural": "Assets",
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
          }
        },
        {
          "id": "aging-complications",
          "name": "Aging Complications",
          "nounSingular": "Complication",
          "nounPlural": "Complications",
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
          }
        },
        {
          "id": "subtrait-columns",
          "name": "Skills & Specialties",
          "description": "Mundane d4-d6 skills stepped up by d8-d12 veteran specialties",
          "nounSingular": "Skill",
          "nounPlural": "Skills",
          "traits": [
            {
              "name": "Craft",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Fight",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Fly",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Focus",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Influence",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Know",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Labor",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Move",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Notice",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Perform",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Sneak",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Survive",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Throw",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Tinker",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Treat",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Trick",
              "value": 0,
              "dice": [],
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
          }
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
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "Name"
            },
            {
              "name": "player",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "Player"
            },
            {
              "name": "nickname",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "Nickname"
            },
            {
              "name": "pronouns",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "Pronouns"
            },
            {
              "name": "description",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "Description"
            },
            {
              "name": "game",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "Game",
              "view": {
                "hidden": true
              }
            },
            {
              "name": "portrait",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "caption",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "plotPoints",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "PP",
              "view": {
                "hidden": true
              }
            },
            {
              "name": "notes",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "view": {
                "hidden": true
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
          "nounSingular": "Value",
          "nounPlural": "Values",
          "traits": [
            {
              "name": "Allegiance",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Glory",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Integrity",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Knowledge",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Novelty",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Power",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Riches",
              "value": 0,
              "dice": [],
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
          }
        },
        {
          "id": "distinctions",
          "name": "Distinctions",
          "description": "Aerial legend and grounded retirement",
          "nounSingular": "Distinction",
          "nounPlural": "Distinctions",
          "traits": [
            {
              "name": "Archetype:",
              "value": 8,
              "dice": [],
              "traits": [],
              "sfx": [
                "hinder"
              ]
            },
            {
              "name": "Retirement:",
              "value": 8,
              "dice": [],
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
          }
        },
        {
          "id": "vintage-plane-signature-assets",
          "name": "Resources",
          "description": "Custom aircraft and aviator resources (5d6 each)",
          "nounSingular": "Resource",
          "nounPlural": "Resources",
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
          }
        },
        {
          "id": "signature-asset",
          "name": "Signature Asset",
          "nounSingular": "Asset",
          "nounPlural": "Assets",
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
          }
        },
        {
          "id": "subtrait-columns",
          "name": "Skills & Specialties",
          "description": "Flight and tactical skills (d4-d6) with veteran specialties (d8-d12)",
          "nounSingular": "Skill",
          "nounPlural": "Skills",
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
          }
        },
        {
          "id": "session-record",
          "name": "Session Record",
          "description": "1: Training • 2: Adventuring Triumph • 3: Retirement",
          "nounSingular": "Milestone",
          "nounPlural": "Milestones",
          "traits": [
            {
              "name": "Training",
              "value": 0,
              "dice": [],
              "description": "Training",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Adventuring Triumph",
              "value": 0,
              "dice": [],
              "description": "Adventuring Triumph",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Retirement",
              "value": 0,
              "dice": [],
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
              "body": "session-record"
            },
            "sessionRecord": {
              "count": 20,
              "orientation": "horizontal"
            },
            "reservedSlots": 20
          }
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
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "Name"
            },
            {
              "name": "player",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "Player"
            },
            {
              "name": "nickname",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "Nickname"
            },
            {
              "name": "pronouns",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "Pronouns"
            },
            {
              "name": "description",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "Description"
            },
            {
              "name": "game",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "Game",
              "view": {
                "hidden": true
              }
            },
            {
              "name": "portrait",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "caption",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "plotPoints",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "PP",
              "view": {
                "hidden": true
              }
            },
            {
              "name": "notes",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "view": {
                "hidden": true
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
          "nounSingular": "Distinction",
          "nounPlural": "Distinctions",
          "traits": [
            {
              "name": "Before:",
              "value": 8,
              "dice": [],
              "traits": [],
              "sfx": [
                "hinder"
              ]
            },
            {
              "name": "Now:",
              "value": 8,
              "dice": [],
              "traits": [],
              "sfx": [
                "hinder"
              ]
            },
            {
              "name": "Future:",
              "value": 8,
              "dice": [],
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
          }
        },
        {
          "id": "subtrait-columns",
          "name": "Skills & Specialties",
          "description": "Practical survival disciplines (d4-d6) with specialized traits (d8-d12)",
          "nounSingular": "Skill",
          "nounPlural": "Skills",
          "traits": [
            {
              "name": "Animals",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Athletics",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Big Guns",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Covert",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Craft",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Creativity",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Drive",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Focus",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Guns",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Influence",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Knowledge",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Mechanic",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Melee",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Notice",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Operate",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Pilot",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Survival",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Thrown",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Treatment",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Unarmed",
              "value": 0,
              "dice": [],
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
          }
        },
        {
          "id": "attributes",
          "name": "Attributes",
          "description": "Core survival attributes",
          "nounSingular": "Attribute",
          "nounPlural": "Attributes",
          "traits": [
            {
              "name": "Analytical",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Forceful",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Quiet",
              "value": 0,
              "dice": [],
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
          }
        },
        {
          "id": "relationships",
          "name": "Relationships",
          "description": "Ties to fellow survivors in the camp",
          "nounSingular": "Relationship",
          "nounPlural": "Relationships",
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
          }
        },
        {
          "id": "stress",
          "name": "Stress",
          "description": "Survivor stress and trauma",
          "nounSingular": "Stress",
          "nounPlural": "Stress",
          "traits": [
            {
              "name": "Injured",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Isolated",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Sick",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Tired",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Upset",
              "value": 0,
              "dice": [],
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
          }
        },
        {
          "id": "talents",
          "name": "Talents",
          "description": "Survivor tricks and knacks",
          "nounSingular": "Talent",
          "nounPlural": "Talents",
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
          }
        },
        {
          "id": "growth-pool",
          "name": "Growth Pool",
          "description": "Survivor growth dice",
          "nounSingular": "Growth Die",
          "nounPlural": "Growth Dice",
          "traits": [
            {
              "name": "D4",
              "value": 4,
              "dice": [],
              "traits": [],
              "sfx": [],
              "view": {
                "poolCount": 1
              }
            },
            {
              "name": "D6",
              "value": 6,
              "dice": [],
              "traits": [],
              "sfx": [],
              "view": {
                "poolCount": 1
              }
            },
            {
              "name": "D8",
              "value": 8,
              "dice": [],
              "traits": [],
              "sfx": [],
              "view": {
                "poolCount": 1
              }
            },
            {
              "name": "D10",
              "value": 10,
              "dice": [],
              "traits": [],
              "sfx": [],
              "view": {
                "poolCount": 1
              }
            },
            {
              "name": "D12",
              "value": 12,
              "dice": [],
              "traits": [],
              "sfx": [],
              "view": {
                "poolCount": 1
              }
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
            "pool": true,
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
          }
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
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "Name"
            },
            {
              "name": "player",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "Player"
            },
            {
              "name": "nickname",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "Nickname"
            },
            {
              "name": "pronouns",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "Pronouns"
            },
            {
              "name": "description",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "Description"
            },
            {
              "name": "game",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "Game",
              "view": {
                "hidden": true
              }
            },
            {
              "name": "portrait",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "caption",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "plotPoints",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "PP",
              "view": {
                "hidden": true
              }
            },
            {
              "name": "notes",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "view": {
                "hidden": true
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
          "nounSingular": "Essential Stockpile",
          "nounPlural": "Essential Stockpiles",
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
              "traits": [],
              "sfx": []
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
          }
        },
        {
          "id": "non-essential-stockpiles",
          "name": "Non-Essential Stockpiles",
          "description": "Building Benefits:",
          "nounSingular": "Non-Essential Stockpile",
          "nounPlural": "Non-Essential Stockpiles",
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
              "traits": [],
              "sfx": []
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
          }
        },
        {
          "id": "building-1",
          "name": "Building 1",
          "nounSingular": "Building",
          "nounPlural": "Buildings",
          "traits": [
            {
              "name": "Name:",
              "value": 0,
              "dice": [],
              "traits": [
                {
                  "name": "d6 Benefit:",
                  "value": 6,
                  "dice": [],
                  "traits": [],
                  "sfx": []
                },
                {
                  "name": "d8 Benefit:",
                  "value": 8,
                  "dice": [],
                  "traits": [],
                  "sfx": []
                },
                {
                  "name": "d10 Benefit:",
                  "value": 10,
                  "dice": [],
                  "traits": [],
                  "sfx": []
                },
                {
                  "name": "d12 Benefit:",
                  "value": 12,
                  "dice": [],
                  "traits": [],
                  "sfx": []
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
          }
        },
        {
          "id": "building-2",
          "name": "Building 2",
          "nounSingular": "Building",
          "nounPlural": "Buildings",
          "traits": [
            {
              "name": "Name:",
              "value": 0,
              "dice": [],
              "traits": [
                {
                  "name": "d6 Benefit:",
                  "value": 6,
                  "dice": [],
                  "traits": [],
                  "sfx": []
                },
                {
                  "name": "d8 Benefit:",
                  "value": 8,
                  "dice": [],
                  "traits": [],
                  "sfx": []
                },
                {
                  "name": "d10 Benefit:",
                  "value": 10,
                  "dice": [],
                  "traits": [],
                  "sfx": []
                },
                {
                  "name": "d12 Benefit:",
                  "value": 12,
                  "dice": [],
                  "traits": [],
                  "sfx": []
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
          }
        },
        {
          "id": "building-3",
          "name": "Building 3",
          "nounSingular": "Building",
          "nounPlural": "Buildings",
          "traits": [
            {
              "name": "Name:",
              "value": 0,
              "dice": [],
              "traits": [
                {
                  "name": "d6 Benefit:",
                  "value": 6,
                  "dice": [],
                  "traits": [],
                  "sfx": []
                },
                {
                  "name": "d8 Benefit:",
                  "value": 8,
                  "dice": [],
                  "traits": [],
                  "sfx": []
                },
                {
                  "name": "d10 Benefit:",
                  "value": 10,
                  "dice": [],
                  "traits": [],
                  "sfx": []
                },
                {
                  "name": "d12 Benefit:",
                  "value": 12,
                  "dice": [],
                  "traits": [],
                  "sfx": []
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
          }
        },
        {
          "id": "building-4",
          "name": "Building 4",
          "nounSingular": "Building",
          "nounPlural": "Buildings",
          "traits": [
            {
              "name": "Name:",
              "value": 0,
              "dice": [],
              "traits": [
                {
                  "name": "d6 Benefit:",
                  "value": 6,
                  "dice": [],
                  "traits": [],
                  "sfx": []
                },
                {
                  "name": "d8 Benefit:",
                  "value": 8,
                  "dice": [],
                  "traits": [],
                  "sfx": []
                },
                {
                  "name": "d10 Benefit:",
                  "value": 10,
                  "dice": [],
                  "traits": [],
                  "sfx": []
                },
                {
                  "name": "d12 Benefit:",
                  "value": 12,
                  "dice": [],
                  "traits": [],
                  "sfx": []
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
          }
        },
        {
          "id": "building-5",
          "name": "Building 5",
          "nounSingular": "Building",
          "nounPlural": "Buildings",
          "traits": [
            {
              "name": "Name:",
              "value": 0,
              "dice": [],
              "traits": [
                {
                  "name": "d6 Benefit:",
                  "value": 6,
                  "dice": [],
                  "traits": [],
                  "sfx": []
                },
                {
                  "name": "d8 Benefit:",
                  "value": 8,
                  "dice": [],
                  "traits": [],
                  "sfx": []
                },
                {
                  "name": "d10 Benefit:",
                  "value": 10,
                  "dice": [],
                  "traits": [],
                  "sfx": []
                },
                {
                  "name": "d12 Benefit:",
                  "value": 12,
                  "dice": [],
                  "traits": [],
                  "sfx": []
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
          }
        },
        {
          "id": "building-6",
          "name": "Building 6",
          "nounSingular": "Building",
          "nounPlural": "Buildings",
          "traits": [
            {
              "name": "Name:",
              "value": 0,
              "dice": [],
              "traits": [
                {
                  "name": "d6 Benefit:",
                  "value": 6,
                  "dice": [],
                  "traits": [],
                  "sfx": []
                },
                {
                  "name": "d8 Benefit:",
                  "value": 8,
                  "dice": [],
                  "traits": [],
                  "sfx": []
                },
                {
                  "name": "d10 Benefit:",
                  "value": 10,
                  "dice": [],
                  "traits": [],
                  "sfx": []
                },
                {
                  "name": "d12 Benefit:",
                  "value": 12,
                  "dice": [],
                  "traits": [],
                  "sfx": []
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
          }
        },
        {
          "id": "survivor-1",
          "name": "Survivor 1",
          "nounSingular": "Survivor",
          "nounPlural": "Survivors",
          "hasQuestionedPip": true,
          "traits": [
            {
              "name": "Morale",
              "value": 0,
              "dice": [],
              "questioned": false,
              "traits": [],
              "sfx": []
            },
            {
              "name": "",
              "value": 6,
              "dice": [],
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
          }
        },
        {
          "id": "survivor-2",
          "name": "Survivor 2",
          "nounSingular": "Survivor",
          "nounPlural": "Survivors",
          "hasQuestionedPip": true,
          "traits": [
            {
              "name": "Morale",
              "value": 0,
              "dice": [],
              "questioned": false,
              "traits": [],
              "sfx": []
            },
            {
              "name": "",
              "value": 6,
              "dice": [],
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
          }
        },
        {
          "id": "survivor-3",
          "name": "Survivor 3",
          "nounSingular": "Survivor",
          "nounPlural": "Survivors",
          "hasQuestionedPip": true,
          "traits": [
            {
              "name": "Morale",
              "value": 0,
              "dice": [],
              "questioned": false,
              "traits": [],
              "sfx": []
            },
            {
              "name": "",
              "value": 6,
              "dice": [],
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
          }
        },
        {
          "id": "survivor-4",
          "name": "Survivor 4",
          "nounSingular": "Survivor",
          "nounPlural": "Survivors",
          "hasQuestionedPip": true,
          "traits": [
            {
              "name": "Morale",
              "value": 0,
              "dice": [],
              "questioned": false,
              "traits": [],
              "sfx": []
            },
            {
              "name": "",
              "value": 6,
              "dice": [],
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
          }
        },
        {
          "id": "survivor-5",
          "name": "Survivor 5",
          "nounSingular": "Survivor",
          "nounPlural": "Survivors",
          "hasQuestionedPip": true,
          "traits": [
            {
              "name": "Morale",
              "value": 0,
              "dice": [],
              "questioned": false,
              "traits": [],
              "sfx": []
            },
            {
              "name": "",
              "value": 6,
              "dice": [],
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
          }
        },
        {
          "id": "survivor-6",
          "name": "Survivor 6",
          "nounSingular": "Survivor",
          "nounPlural": "Survivors",
          "hasQuestionedPip": true,
          "traits": [
            {
              "name": "Morale",
              "value": 0,
              "dice": [],
              "questioned": false,
              "traits": [],
              "sfx": []
            },
            {
              "name": "",
              "value": 6,
              "dice": [],
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
          }
        },
        {
          "id": "survivor-7",
          "name": "Survivor 7",
          "nounSingular": "Survivor",
          "nounPlural": "Survivors",
          "hasQuestionedPip": true,
          "traits": [
            {
              "name": "Morale",
              "value": 0,
              "dice": [],
              "questioned": false,
              "traits": [],
              "sfx": []
            },
            {
              "name": "",
              "value": 6,
              "dice": [],
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
          }
        },
        {
          "id": "survivor-8",
          "name": "Survivor 8",
          "nounSingular": "Survivor",
          "nounPlural": "Survivors",
          "hasQuestionedPip": true,
          "traits": [
            {
              "name": "Morale",
              "value": 0,
              "dice": [],
              "questioned": false,
              "traits": [],
              "sfx": []
            },
            {
              "name": "",
              "value": 6,
              "dice": [],
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
          }
        },
        {
          "id": "survivor-9",
          "name": "Survivor 9",
          "nounSingular": "Survivor",
          "nounPlural": "Survivors",
          "hasQuestionedPip": true,
          "traits": [
            {
              "name": "Morale",
              "value": 0,
              "dice": [],
              "questioned": false,
              "traits": [],
              "sfx": []
            },
            {
              "name": "",
              "value": 6,
              "dice": [],
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
          }
        },
        {
          "id": "colony-projects",
          "name": "Notes",
          "nounSingular": "Note",
          "nounPlural": "Notes",
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
          }
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
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "Name"
            },
            {
              "name": "player",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "Player"
            },
            {
              "name": "nickname",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "Nickname"
            },
            {
              "name": "pronouns",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "Pronouns"
            },
            {
              "name": "description",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "Description"
            },
            {
              "name": "game",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "Game",
              "view": {
                "hidden": true
              }
            },
            {
              "name": "portrait",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "caption",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "plotPoints",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "PP",
              "view": {
                "hidden": true
              }
            },
            {
              "name": "notes",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "view": {
                "hidden": true
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
          "nounSingular": "Distinction",
          "nounPlural": "Distinctions",
          "traits": [
            {
              "name": "Role",
              "value": 8,
              "dice": [],
              "traits": [],
              "sfx": [
                "hinder"
              ]
            },
            {
              "name": "Background",
              "value": 8,
              "dice": [],
              "traits": [],
              "sfx": [
                "hinder"
              ]
            },
            {
              "name": "Personality",
              "value": 8,
              "dice": [],
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
          }
        },
        {
          "id": "affiliations",
          "name": "Affiliations",
          "description": "Operational deployment modes",
          "nounSingular": "Affiliation",
          "nounPlural": "Affiliations",
          "traits": [
            {
              "name": "Diplomacy",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Discovery",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Defense",
              "value": 0,
              "dice": [],
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
          }
        },
        {
          "id": "complications",
          "name": "Complications",
          "nounSingular": "Complication",
          "nounPlural": "Complications",
          "traits": [
            {
              "name": "Frostbite",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Hypothermia",
              "value": 0,
              "dice": [],
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
          }
        },
        {
          "id": "attributes-stress",
          "name": "Attributes & Stress",
          "description": "Core operative capabilities and physical resilience",
          "nounSingular": "Attribute",
          "nounPlural": "Attributes",
          "traits": [
            {
              "name": "Brawn",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Endurance",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Grace",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Grit",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Mettle",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Smarts",
              "value": 0,
              "dice": [],
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
          }
        },
        {
          "id": "subtrait-columns",
          "name": "Skills & Specialties",
          "description": "Black-ops competencies and d6 specialties",
          "nounSingular": "Skill",
          "nounPlural": "Skills",
          "traits": [
            {
              "name": "Craft",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Drive",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Fight",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Fix",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Fly",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Focus",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Influence",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Know",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Labor",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Move",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Notice",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Operate",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Perform",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Shoot",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Sneak",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Survive",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Throw",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Treat",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Trick",
              "value": 0,
              "dice": [],
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
          }
        },
        {
          "id": "signature-assets-gifts",
          "name": "Signature Assets",
          "description": "Classified spy gear and experimental equipment",
          "nounSingular": "Signature Asset",
          "nounPlural": "Signature Assets",
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
          }
        },
        {
          "id": "talents",
          "name": "Talents",
          "nounSingular": "Talent",
          "nounPlural": "Talents",
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
          }
        },
        {
          "id": "gifts",
          "name": "Gifts",
          "nounSingular": "Gift",
          "nounPlural": "Gifts",
          "traits": [
            {
              "name": "Gift of",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Gift of~2",
              "value": 0,
              "dice": [],
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
          }
        },
        {
          "id": "milestones",
          "name": "Milestones",
          "nounSingular": "Milestone",
          "nounPlural": "Milestones",
          "traits": [
            {
              "name": "1 XP",
              "value": 0,
              "dice": [],
              "description": "when ",
              "traits": [],
              "sfx": []
            },
            {
              "name": "3 XP",
              "value": 0,
              "dice": [],
              "description": "when ",
              "traits": [],
              "sfx": []
            },
            {
              "name": "10 XP",
              "value": 0,
              "dice": [],
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
          }
        },
        {
          "id": "milestones-b",
          "name": "Milestones",
          "nounSingular": "Milestone",
          "nounPlural": "Milestones",
          "traits": [
            {
              "name": "1 XP",
              "value": 0,
              "dice": [],
              "description": "when ",
              "traits": [],
              "sfx": []
            },
            {
              "name": "3 XP",
              "value": 0,
              "dice": [],
              "description": "when ",
              "traits": [],
              "sfx": []
            },
            {
              "name": "10 XP",
              "value": 0,
              "dice": [],
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
          }
        },
        {
          "id": "xp",
          "name": "XP",
          "nounSingular": "Pip",
          "nounPlural": "Pips",
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
              "count": 20,
              "perRow": 4,
              "connected": false,
              "filled": 0
            },
            "place": {
              "left": "75%",
              "top": 4,
              "width": "25%",
              "height": 1
            }
          }
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
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "Name"
            },
            {
              "name": "player",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "Player"
            },
            {
              "name": "nickname",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "Nickname"
            },
            {
              "name": "pronouns",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "Pronouns"
            },
            {
              "name": "description",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "Description"
            },
            {
              "name": "game",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "Game",
              "view": {
                "hidden": true
              }
            },
            {
              "name": "portrait",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "caption",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "plotPoints",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "PP",
              "view": {
                "hidden": true
              }
            },
            {
              "name": "notes",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "view": {
                "hidden": true
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
          "nounSingular": "Attribute",
          "nounPlural": "Attributes",
          "traits": [
            {
              "name": "Mind",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Body",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Connection",
              "value": 0,
              "dice": [],
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
          }
        },
        {
          "id": "session-record",
          "name": "Session Record",
          "nounSingular": "Session",
          "nounPlural": "Sessions",
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
              "count": 15,
              "perRow": 5,
              "connected": true,
              "filled": 0
            },
            "reservedSlots": 0,
            "place": {
              "left": "0%",
              "top": 1,
              "width": "28%",
              "height": 1
            }
          }
        },
        {
          "id": "distinctions",
          "name": "Distinctions",
          "description": "Ecological calling, community role, and personal purpose",
          "nounSingular": "Distinction",
          "nounPlural": "Distinctions",
          "traits": [
            {
              "name": "Identity:",
              "value": 8,
              "dice": [],
              "traits": [],
              "sfx": [
                "hinder"
              ]
            },
            {
              "name": "Community:",
              "value": 8,
              "dice": [],
              "traits": [],
              "sfx": [
                "hinder"
              ]
            },
            {
              "name": "Purpose:",
              "value": 8,
              "dice": [],
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
          }
        },
        {
          "id": "signature-assets",
          "name": "Signature Assets",
          "description": "Sustainable tech, tools, and eco-craft",
          "nounSingular": "Signature Asset",
          "nounPlural": "Signature Assets",
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
          }
        },
        {
          "id": "subtrait-columns",
          "name": "Skills & Specialties",
          "description": "Ecological competencies (d4-d12) and d6 craft specialties",
          "nounSingular": "Skill",
          "nounPlural": "Skills",
          "traits": [
            {
              "name": "Craft",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Drive",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Fight",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Fix",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Fly",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Focus",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Influence",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Know",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Labor",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Move",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Notice",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Operate",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Perform",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Shoot",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Sneak",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Survive",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Throw",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Treat",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Trick",
              "value": 0,
              "dice": [],
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
          }
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
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "Name"
            },
            {
              "name": "player",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "Player"
            },
            {
              "name": "nickname",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "Nickname"
            },
            {
              "name": "pronouns",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "Pronouns"
            },
            {
              "name": "description",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "Description"
            },
            {
              "name": "game",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "Game",
              "view": {
                "hidden": true
              }
            },
            {
              "name": "portrait",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "caption",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "plotPoints",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "PP",
              "view": {
                "hidden": true
              }
            },
            {
              "name": "notes",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "view": {
                "hidden": true
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
          "nounSingular": "Attribute",
          "nounPlural": "Attributes",
          "traits": [
            {
              "name": "Resources",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Security",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Connections",
              "value": 0,
              "dice": [],
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
          }
        },
        {
          "id": "commune-distinctions",
          "name": "Distinctions",
          "description": "Settlement unity, organization, and morale",
          "nounSingular": "Distinction",
          "nounPlural": "Distinctions",
          "traits": [
            {
              "name": "Unity:",
              "value": 8,
              "dice": [],
              "traits": [],
              "sfx": [
                "hinder"
              ]
            },
            {
              "name": "Organization:",
              "value": 8,
              "dice": [],
              "traits": [],
              "sfx": [
                "hinder"
              ]
            },
            {
              "name": "Morale:",
              "value": 8,
              "dice": [],
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
          }
        },
        {
          "id": "signature-assets",
          "name": "Signature Assets",
          "nounSingular": "Asset",
          "nounPlural": "Assets",
          "traits": [
            {
              "name": "",
              "value": 6,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "",
              "value": 6,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "",
              "value": 6,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "",
              "value": 6,
              "dice": [],
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
          }
        },
        {
          "id": "skills",
          "name": "Skills",
          "nounSingular": "Skill",
          "nounPlural": "Skills",
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
          }
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
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "Name"
            },
            {
              "name": "player",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "Player"
            },
            {
              "name": "nickname",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "Nickname"
            },
            {
              "name": "pronouns",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "Pronouns"
            },
            {
              "name": "description",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "Description"
            },
            {
              "name": "game",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "Game",
              "view": {
                "hidden": true
              }
            },
            {
              "name": "portrait",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "caption",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "plotPoints",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "PP",
              "view": {
                "hidden": true
              }
            },
            {
              "name": "notes",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "view": {
                "hidden": true
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
          "nounSingular": "Growth Die",
          "nounPlural": "Growth Dice",
          "traits": [
            {
              "name": "D4",
              "value": 4,
              "dice": [],
              "traits": [],
              "sfx": [],
              "view": {
                "poolCount": 1
              }
            },
            {
              "name": "D6",
              "value": 6,
              "dice": [],
              "traits": [],
              "sfx": [],
              "view": {
                "poolCount": 1
              }
            },
            {
              "name": "D8",
              "value": 8,
              "dice": [],
              "traits": [],
              "sfx": [],
              "view": {
                "poolCount": 1
              }
            },
            {
              "name": "D10",
              "value": 10,
              "dice": [],
              "traits": [],
              "sfx": [],
              "view": {
                "poolCount": 1
              }
            },
            {
              "name": "D12",
              "value": 12,
              "dice": [],
              "traits": [],
              "sfx": [],
              "view": {
                "poolCount": 1
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
            "pool": true,
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
          }
        },
        {
          "id": "distinctions",
          "name": "Distinctions",
          "description": "Origin of the magical calamity and personal burden",
          "nounSingular": "Distinction",
          "nounPlural": "Distinctions",
          "traits": [
            {
              "name": "",
              "value": 8,
              "dice": [],
              "traits": [],
              "sfx": [
                "hinder"
              ]
            },
            {
              "name": "",
              "value": 8,
              "dice": [],
              "traits": [],
              "sfx": [
                "hinder"
              ]
            },
            {
              "name": "",
              "value": 8,
              "dice": [],
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
          }
        },
        {
          "id": "values",
          "name": "Values",
          "description": "Gain a PP when you use your d4 value.",
          "nounSingular": "Value",
          "nounPlural": "Values",
          "statement": true,
          "traits": [
            {
              "name": "Ambition",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Responsibility",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Belonging",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Popularity",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Empathy",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Secrecy",
              "value": 0,
              "dice": [],
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
          }
        },
        {
          "id": "signature-assets",
          "name": "Signature Assets",
          "nounSingular": "Asset",
          "nounPlural": "Assets",
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
          }
        },
        {
          "id": "affiliations",
          "name": "Affiliations",
          "description": "When Worlds Collide: When two affiliations are in the same scene, add a d6 to the doom pool and a d4 to your dice pool to include both affiliations in your pool.",
          "nounSingular": "Affiliation",
          "nounPlural": "Affiliations",
          "statement": true,
          "traits": [
            {
              "name": "Self",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Family",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "School",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Coven",
              "value": 0,
              "dice": [],
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
          }
        },
        {
          "id": "stress",
          "name": "Stress",
          "nounSingular": "Stress",
          "nounPlural": "Stress",
          "traits": [
            {
              "name": "Angry",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Depressed",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Exhausted",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Insecure",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Injured",
              "value": 0,
              "dice": [],
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
          }
        },
        {
          "id": "arcane-crafts-sfx",
          "name": "Crafts",
          "description": "Mutated magical expressions and spellcasting disciplines",
          "nounSingular": "Craft",
          "nounPlural": "Crafts",
          "traits": [
            {
              "name": "Azure Sympathy",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Black Wards",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Bronze Mending",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Crimson Passion",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Golden Inspiration",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Orange Flare",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Pink Fidelity",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Purple Veils",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Verdant Conjuration",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "White Purification",
              "value": 0,
              "dice": [],
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
          }
        },
        {
          "id": "sfx",
          "name": "SFX",
          "nounSingular": "SFX",
          "nounPlural": "SFX",
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
          }
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
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "Name"
            },
            {
              "name": "player",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "Player"
            },
            {
              "name": "nickname",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "Nickname"
            },
            {
              "name": "pronouns",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "Ruin"
            },
            {
              "name": "description",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "Description"
            },
            {
              "name": "game",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "Game",
              "view": {
                "hidden": true
              }
            },
            {
              "name": "portrait",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "caption",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "plotPoints",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "PP",
              "view": {
                "hidden": true
              }
            },
            {
              "name": "notes",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "view": {
                "hidden": true
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
          "nounSingular": "Attribute",
          "nounPlural": "Attributes",
          "traits": [
            {
              "name": "Mental",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Physical",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Social",
              "value": 0,
              "dice": [],
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
          }
        },
        {
          "id": "distinctions",
          "name": "Distinctions",
          "description": "Mundane, Offbeat, and Strange facets of town life",
          "nounSingular": "Distinction",
          "nounPlural": "Distinctions",
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
          }
        },
        {
          "id": "roles",
          "name": "Roles",
          "description": "Town archetypes and societal roles",
          "nounSingular": "Role",
          "nounPlural": "Roles",
          "traits": [
            {
              "name": "Enforcer",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Entrepreneur",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Rebel",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Sage",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Shepherd",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Townie",
              "value": 0,
              "dice": [],
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
          }
        },
        {
          "id": "relationships-strange-die",
          "name": "Relationships",
          "description": "Bonds and ties within the town",
          "nounSingular": "Relationship",
          "nounPlural": "Relationships",
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
          }
        },
        {
          "id": "signature-assets",
          "name": "Signature Assets",
          "nounSingular": "Asset",
          "nounPlural": "Assets",
          "traits": [
            {
              "name": "",
              "value": 8,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "",
              "value": 8,
              "dice": [],
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
          }
        },
        {
          "id": "complications",
          "name": "Complications",
          "nounSingular": "Complication",
          "nounPlural": "Complications",
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
          }
        },
        {
          "id": "strange-die",
          "name": "Strange Die",
          "nounSingular": "Die",
          "nounPlural": "Dice",
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
          }
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
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "Name"
            },
            {
              "name": "player",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "Player"
            },
            {
              "name": "nickname",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "Nickname"
            },
            {
              "name": "pronouns",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "Pronouns"
            },
            {
              "name": "description",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "Description"
            },
            {
              "name": "game",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "Game",
              "view": {
                "hidden": true
              }
            },
            {
              "name": "portrait",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "caption",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "plotPoints",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "PP",
              "view": {
                "hidden": true
              }
            },
            {
              "name": "notes",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "view": {
                "hidden": true
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
          "nounSingular": "Attribute",
          "nounPlural": "Attributes",
          "traits": [
            {
              "name": "Agility",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Alertness",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Intelligence",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Strength",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Vitality",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Willpower",
              "value": 0,
              "dice": [],
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
          }
        },
        {
          "id": "distinctions",
          "name": "Distinctions",
          "description": "Multiversal origin, champion archetype, and personal drive",
          "nounSingular": "Distinction",
          "nounPlural": "Distinctions",
          "traits": [
            {
              "name": "",
              "value": 8,
              "dice": [],
              "traits": [],
              "sfx": [
                "hinder"
              ]
            },
            {
              "name": "",
              "value": 8,
              "dice": [],
              "traits": [],
              "sfx": [
                "hinder"
              ]
            },
            {
              "name": "",
              "value": 8,
              "dice": [],
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
          }
        },
        {
          "id": "signature-assets",
          "name": "Signature Assets",
          "description": "Artifacts and multiversal gear",
          "nounSingular": "Signature Asset",
          "nounPlural": "Signature Assets",
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
          }
        },
        {
          "id": "subtrait-columns",
          "name": "Skills & Specialties",
          "description": "Multiverse capabilities (d4-d6) and specialized proficiencies (d8-d12)",
          "nounSingular": "Skill",
          "nounPlural": "Skills",
          "traits": [
            {
              "name": "Craft",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Drive",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Fight",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Fix",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Fly",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Focus",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Influence",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Know",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Labor",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Move",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Notice",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Operate",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Perform",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Shoot",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Sneak",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Survive",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Throw",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Treat",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Trick",
              "value": 0,
              "dice": [],
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
          }
        },
        {
          "id": "initiative",
          "name": "Initiative",
          "nounSingular": "Die",
          "nounPlural": "Dice",
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
          }
        },
        {
          "id": "hero-dice",
          "name": "Hero Dice",
          "nounSingular": "Die",
          "nounPlural": "Dice",
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
          }
        },
        {
          "id": "life-points",
          "name": "Life Points",
          "description": "Vitality (12 → 1, Injured!) • Ø • Willpower (1 → 12, Dazed!)",
          "nounSingular": "Point",
          "nounPlural": "Points",
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
              "count": 24,
              "perRow": 12,
              "connected": true,
              "filled": 0
            }
          }
        },
        {
          "id": "power-set-1",
          "name": "Power Set 1",
          "description": "SFX: • SFX: • Limit:",
          "nounSingular": "Power",
          "nounPlural": "Powers",
          "traits": [
            {
              "name": "",
              "value": 0,
              "dice": [],
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
          }
        },
        {
          "id": "power-set-2",
          "name": "Power Set 2",
          "description": "SFX: • SFX: • Limit:",
          "nounSingular": "Power",
          "nounPlural": "Powers",
          "traits": [
            {
              "name": "",
              "value": 0,
              "dice": [],
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
          }
        },
        {
          "id": "power-set-3",
          "name": "Power Set 3",
          "description": "SFX: • SFX: • Limit:",
          "nounSingular": "Power",
          "nounPlural": "Powers",
          "traits": [
            {
              "name": "",
              "value": 0,
              "dice": [],
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
          }
        },
        {
          "id": "talents-growth-options",
          "name": "Talents",
          "description": "Name, Activation, and Effect",
          "nounSingular": "Talent",
          "nounPlural": "Talents",
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
          }
        },
        {
          "id": "session-record",
          "name": "Session Record",
          "nounSingular": "Session",
          "nounPlural": "Sessions",
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
              "count": 12,
              "perRow": 6,
              "connected": true,
              "filled": 0
            },
            "reservedSlots": 0,
            "place": {
              "left": "66.663%",
              "top": 1,
              "width": "33.334%",
              "height": 1
            }
          }
        },
        {
          "id": "leveling-up",
          "name": "Leveling Up",
          "nounSingular": "Option",
          "nounPlural": "Options",
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
          }
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
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "Name"
            },
            {
              "name": "player",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "Player"
            },
            {
              "name": "nickname",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "Nickname"
            },
            {
              "name": "pronouns",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "Pronouns"
            },
            {
              "name": "description",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "Description"
            },
            {
              "name": "game",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "Game",
              "view": {
                "hidden": true
              }
            },
            {
              "name": "portrait",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "caption",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "plotPoints",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "PP",
              "view": {
                "hidden": true
              }
            },
            {
              "name": "notes",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "view": {
                "hidden": true
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
          "nounSingular": "Attribute",
          "nounPlural": "Attributes",
          "traits": [
            {
              "name": "Prowess",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Control",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Renown",
              "value": 0,
              "dice": [],
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
          }
        },
        {
          "id": "roles",
          "name": "Roles",
          "description": "Combat roles and tactical responsibilities",
          "nounSingular": "Role",
          "nounPlural": "Roles",
          "traits": [
            {
              "name": "Backup",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Blaster",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Boss",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Brain",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Brawler",
              "value": 0,
              "dice": [],
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
          }
        },
        {
          "id": "distinctions",
          "name": "Distinctions",
          "description": "Personal identity, public persona, and driving aspiration",
          "nounSingular": "Distinction",
          "nounPlural": "Distinctions",
          "traits": [
            {
              "name": "Identity:",
              "value": 8,
              "dice": [],
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
          }
        },
        {
          "id": "signature-assets",
          "name": "Signature Assets",
          "description": "Handler cockpit gear and personal assets",
          "nounSingular": "Signature Asset",
          "nounPlural": "Signature Assets",
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
          }
        },
        {
          "id": "complications",
          "name": "Complications",
          "nounSingular": "Complication",
          "nounPlural": "Complications",
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
          }
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
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "Name"
            },
            {
              "name": "player",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "Player"
            },
            {
              "name": "nickname",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "Nickname"
            },
            {
              "name": "pronouns",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "Pronouns"
            },
            {
              "name": "description",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "Description"
            },
            {
              "name": "game",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "Game",
              "view": {
                "hidden": true
              }
            },
            {
              "name": "portrait",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "caption",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "plotPoints",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "PP",
              "view": {
                "hidden": true
              }
            },
            {
              "name": "notes",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "view": {
                "hidden": true
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
          "nounSingular": "Attribute",
          "nounPlural": "Attributes",
          "ratingPosition": "below",
          "traits": [
            {
              "name": "Prowess",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Control",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Renown",
              "value": 0,
              "dice": [],
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
          }
        },
        {
          "id": "titan-distinctions",
          "name": "Distinctions",
          "description": "Chassis type, operational history, and battle stance",
          "nounSingular": "Distinction",
          "nounPlural": "Distinctions",
          "traits": [
            {
              "name": "Type:",
              "value": 8,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "History:",
              "value": 8,
              "dice": [],
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
          }
        },
        {
          "id": "power-set",
          "name": "Power Set",
          "description": "Colossal kaiju-annihilation weaponry",
          "nounSingular": "Power",
          "nounPlural": "Powers",
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
          }
        },
        {
          "id": "power-set-2",
          "name": "Power Set",
          "description": "Secondary titan systems and ordnance",
          "nounSingular": "Power",
          "nounPlural": "Powers",
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
          }
        },
        {
          "id": "session-record",
          "name": "Session Record",
          "nounSingular": "Session",
          "nounPlural": "Sessions",
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
              "count": 15,
              "perRow": 15,
              "connected": true,
              "filled": 0
            },
            "reservedSlots": 0
          }
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
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "Name"
            },
            {
              "name": "player",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "Player"
            },
            {
              "name": "nickname",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "Nickname"
            },
            {
              "name": "pronouns",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "Pronouns"
            },
            {
              "name": "description",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "Description"
            },
            {
              "name": "game",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "Game",
              "view": {
                "hidden": true
              }
            },
            {
              "name": "portrait",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "caption",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "plotPoints",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "PP",
              "view": {
                "hidden": true
              }
            },
            {
              "name": "notes",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "view": {
                "hidden": true
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
          "nounSingular": "Affiliation",
          "nounPlural": "Affiliations",
          "traits": [
            {
              "name": "Solo",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Partner",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Squad",
              "value": 0,
              "dice": [],
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
          }
        },
        {
          "id": "roles",
          "name": "Roles",
          "description": "Civic investigation disciplines",
          "nounSingular": "Role",
          "nounPlural": "Roles",
          "traits": [
            {
              "name": "Forensics",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Investigation",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Legal",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Medicine",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Psychology",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Tactics",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Technology",
              "value": 0,
              "dice": [],
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
          }
        },
        {
          "id": "resources",
          "name": "Resources",
          "description": "Civic assets, contacts, and backup",
          "nounSingular": "Resource",
          "nounPlural": "Resources",
          "traits": [
            {
              "name": "",
              "value": 10,
              "dice": [
                10,
                10
              ],
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
          }
        },
        {
          "id": "distinctions",
          "name": "Distinctions",
          "description": "Defining history, drive, and complication",
          "nounSingular": "Distinction",
          "nounPlural": "Distinctions",
          "traits": [
            {
              "name": "Distinction #1:",
              "value": 8,
              "dice": [],
              "traits": [],
              "sfx": [
                "hinder"
              ]
            },
            {
              "name": "Distinction #2:",
              "value": 8,
              "dice": [],
              "traits": [],
              "sfx": [
                "hinder"
              ]
            },
            {
              "name": "Distinction #3:",
              "value": 8,
              "dice": [],
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
          }
        },
        {
          "id": "talents",
          "name": "Talents",
          "description": "Training tricks and case-cracking knacks",
          "nounSingular": "Talent",
          "nounPlural": "Talents",
          "traits": [
            {
              "name": "Talent #1:",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Talent #2:",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Talent #3:",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Talent #4:",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Talent #5:",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Talent #6:",
              "value": 0,
              "dice": [],
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
          }
        },
        {
          "id": "stress",
          "name": "Stress",
          "description": "Emotional and physical pressure tracks",
          "nounSingular": "Stress",
          "nounPlural": "Stress",
          "traits": [
            {
              "name": "Afraid",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Angry",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Anxious",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Exhausted",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Injured",
              "value": 0,
              "dice": [],
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
          }
        },
        {
          "id": "growth-pool",
          "name": "Growth Pool",
          "description": "Base d6 d6",
          "nounSingular": "Growth Die",
          "nounPlural": "Growth Dice",
          "traits": [
            {
              "name": "D4",
              "value": 4,
              "dice": [],
              "traits": [],
              "sfx": [],
              "view": {
                "poolCount": 0
              }
            },
            {
              "name": "D6",
              "value": 6,
              "dice": [],
              "traits": [],
              "sfx": [],
              "view": {
                "poolCount": 2
              }
            },
            {
              "name": "D8",
              "value": 8,
              "dice": [],
              "traits": [],
              "sfx": [],
              "view": {
                "poolCount": 0
              }
            },
            {
              "name": "D10",
              "value": 10,
              "dice": [],
              "traits": [],
              "sfx": [],
              "view": {
                "poolCount": 0
              }
            },
            {
              "name": "D12",
              "value": 12,
              "dice": [],
              "traits": [],
              "sfx": [],
              "view": {
                "poolCount": 0
              }
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
            "pool": true,
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
          }
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
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "Name"
            },
            {
              "name": "player",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "Player"
            },
            {
              "name": "nickname",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "Nickname"
            },
            {
              "name": "pronouns",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "Pronouns"
            },
            {
              "name": "description",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "Description"
            },
            {
              "name": "game",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "Game",
              "view": {
                "hidden": true
              }
            },
            {
              "name": "portrait",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "caption",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "plotPoints",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "PP",
              "view": {
                "hidden": true
              }
            },
            {
              "name": "notes",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "view": {
                "hidden": true
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
          "nounSingular": "Distinction",
          "nounPlural": "Distinctions",
          "traits": [
            {
              "name": "Walking Style Guide",
              "value": 8,
              "dice": [],
              "description": "Every layout edge case deserves a test.",
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
              "traits": [],
              "sfx": [
                "hinder"
              ]
            },
            {
              "name": "",
              "value": 8,
              "dice": [],
              "traits": [],
              "sfx": [
                "hinder"
              ]
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
          }
        },
        {
          "id": "ks-values-statements",
          "name": "Values",
          "nounSingular": "Value",
          "nounPlural": "Values",
          "statement": true,
          "hasQuestionedPip": true,
          "traits": [
            {
              "name": "Craft",
              "value": 10,
              "dice": [],
              "description": "Form and function are inseparable.",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Speed",
              "value": 8,
              "dice": [],
              "description": "Ship early, refine relentlessly.",
              "questioned": true,
              "traits": [],
              "sfx": []
            },
            {
              "name": "Clarity",
              "value": 6,
              "dice": [],
              "traits": [],
              "sfx": []
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
          }
        },
        {
          "id": "ks-subtrait-columns",
          "name": "Skills",
          "nounSingular": "Skill",
          "nounPlural": "Skills",
          "traits": [
            {
              "name": "Engineering",
              "value": 10,
              "dice": [],
              "traits": [
                {
                  "name": "Clockwork",
                  "value": 8,
                  "dice": [],
                  "traits": [],
                  "sfx": []
                },
                {
                  "name": "Aetherics",
                  "value": 6,
                  "dice": [],
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
              "traits": [
                {
                  "name": "Star Charts",
                  "value": 6,
                  "dice": [],
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
              "traits": [],
              "sfx": []
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
          }
        },
        {
          "id": "ks-paired-slots",
          "name": "Standing",
          "nounSingular": "Standing",
          "nounPlural": "Standings",
          "statement": true,
          "traits": [
            {
              "name": "The Guild",
              "value": 8,
              "dice": [],
              "description": "They owe me a drydock bay.",
              "traits": [
                {
                  "name": "Complication",
                  "value": 6,
                  "dice": [],
                  "traits": [],
                  "sfx": []
                },
                {
                  "name": "Bonus",
                  "value": 8,
                  "dice": [],
                  "traits": [],
                  "sfx": []
                }
              ],
              "sfx": []
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
          }
        },
        {
          "id": "ks-die-rows",
          "name": "Badges",
          "nounSingular": "Badge",
          "nounPlural": "Badges",
          "hasCounterColumn": true,
          "counterLabel": "XP",
          "traits": [
            {
              "name": "First Responder",
              "value": 8,
              "dice": [],
              "xp": 3,
              "traits": [],
              "sfx": []
            },
            {
              "name": "Trailblazer",
              "value": 6,
              "dice": [],
              "xp": 1,
              "traits": [],
              "sfx": []
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
          }
        },
        {
          "id": "ks-three-col-table",
          "name": "Talents",
          "nounSingular": "Talent",
          "nounPlural": "Talents",
          "traits": [
            {
              "name": "Overclock",
              "value": 0,
              "dice": [],
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
          }
        },
        {
          "id": "ks-dice-count",
          "name": "Resources",
          "nounSingular": "Resource",
          "nounPlural": "Resources",
          "traits": [
            {
              "name": "Salvage Cache",
              "value": 8,
              "dice": [
                8,
                8,
                8
              ],
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
              "traits": [],
              "sfx": []
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
          }
        },
        {
          "id": "ks-stress",
          "name": "Stress",
          "nounSingular": "Stress",
          "nounPlural": "Stress",
          "traits": [
            {
              "name": "Physical",
              "value": 8,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Mental",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Social",
              "value": 12,
              "dice": [],
              "traits": [],
              "sfx": []
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
          }
        },
        {
          "id": "ks-dice-ladder",
          "name": "Growth Ladder",
          "nounSingular": "Rung",
          "nounPlural": "Rungs",
          "traits": [
            {
              "name": "Novice",
              "value": 6,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Adept",
              "value": 8,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Master",
              "value": 10,
              "dice": [],
              "traits": [],
              "sfx": []
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
          }
        },
        {
          "id": "ks-labeled-fields",
          "name": "Dossier",
          "nounSingular": "Field",
          "nounPlural": "Fields",
          "traits": [
            {
              "name": "Origin",
              "value": 0,
              "dice": [],
              "description": "Outer Rim Shipyard #4",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Drive",
              "value": 0,
              "dice": [],
              "description": "Restore the lost fleet",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Quirk",
              "value": 0,
              "dice": [],
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
          }
        },
        {
          "id": "ks-pips",
          "name": "Progress Track",
          "nounSingular": "Pip",
          "nounPlural": "Pips",
          "traits": [],
          "sfx": [],
          "view": {
            "page": 2,
            "style": {
              "header": "default",
              "body": "pips"
            },
            "pips": {
              "count": 10,
              "perRow": 5,
              "connected": true,
              "filled": 4
            },
            "place": {
              "left": "0%",
              "top": 1,
              "width": "50%",
              "height": 1
            }
          }
        },
        {
          "id": "ks-session-record",
          "name": "Session Record",
          "nounSingular": "Session",
          "nounPlural": "Sessions",
          "traits": [
            {
              "name": "Session 1: The Awakening",
              "value": 6,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Session 2: Crossing the Threshold",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            }
          ],
          "sfx": [],
          "view": {
            "page": 2,
            "style": {
              "header": "default",
              "body": "session-record"
            },
            "sessionRecord": {
              "orientation": "vertical",
              "lines": 4
            },
            "place": {
              "left": "50%",
              "top": 1,
              "width": "50%",
              "height": 1
            },
            "reservedSlots": 3
          }
        },
        {
          "id": "ks-two-col-compact",
          "name": "Roles (Compact Two-Column)",
          "nounSingular": "Role",
          "nounPlural": "Roles",
          "traits": [
            {
              "name": "Tactician",
              "value": 8,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Outrider",
              "value": 6,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Scholar",
              "value": 10,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Sentinel",
              "value": 4,
              "dice": [],
              "traits": [],
              "sfx": []
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
          }
        },
        {
          "id": "ks-notes",
          "name": "Notes",
          "nounSingular": "Note",
          "nounPlural": "Notes",
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
          }
        },
        {
          "id": "ks-detailed-columns",
          "name": "Detailed Columns",
          "nounSingular": "Entry",
          "nounPlural": "Entries",
          "traits": [
            {
              "name": "Alpha",
              "value": 8,
              "dice": [],
              "description": "First detailed entry.",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Beta",
              "value": 6,
              "dice": [],
              "description": "Second detailed entry.",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Gamma",
              "value": 10,
              "dice": [],
              "description": "Third detailed entry.",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Delta",
              "value": 8,
              "dice": [],
              "description": "Fourth detailed entry.",
              "traits": [],
              "sfx": []
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
          }
        },
        {
          "id": "ks-resource-pool",
          "name": "Resource Pool",
          "nounSingular": "Resource",
          "nounPlural": "Resources",
          "traits": [
            {
              "name": "Supply",
              "value": 8,
              "dice": [],
              "traits": [
                {
                  "name": "Ammo",
                  "value": 6,
                  "dice": [],
                  "traits": [],
                  "sfx": []
                }
              ],
              "sfx": []
            },
            {
              "name": "Fuel",
              "value": 6,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Intel",
              "value": 10,
              "dice": [],
              "traits": [],
              "sfx": []
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
          }
        },
        {
          "id": "ks-assets",
          "name": "Signature Assets",
          "nounSingular": "Asset",
          "nounPlural": "Assets",
          "traits": [
            {
              "name": "Custom Sidearm",
              "value": 8,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Survey Kit",
              "value": 6,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Encrypted Comms",
              "value": 8,
              "dice": [],
              "traits": [],
              "sfx": []
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
          }
        },
        {
          "id": "ks-list",
          "name": "Simple List",
          "nounSingular": "Item",
          "nounPlural": "Items",
          "traits": [
            {
              "name": "Item One",
              "value": 8,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Item Two",
              "value": 6,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Item Three",
              "value": 8,
              "dice": [],
              "traits": [],
              "sfx": []
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
          }
        },
        {
          "id": "ks-image",
          "name": "Image Set",
          "nounSingular": "Image",
          "nounPlural": "Images",
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
          }
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
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "Name"
            },
            {
              "name": "player",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "Player"
            },
            {
              "name": "nickname",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "Nickname"
            },
            {
              "name": "pronouns",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "Pronouns"
            },
            {
              "name": "description",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "Description"
            },
            {
              "name": "game",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "Game",
              "view": {
                "hidden": true
              }
            },
            {
              "name": "portrait",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "caption",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "plotPoints",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "label": "PP",
              "view": {
                "hidden": true
              }
            },
            {
              "name": "notes",
              "value": 0,
              "dice": [],
              "traits": [],
              "sfx": [],
              "view": {
                "hidden": true
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
          "nounSingular": "Role",
          "nounPlural": "Roles",
          "traits": [
            {
              "name": "Commander",
              "value": 8,
              "dice": [],
              "description": "Direct allies and coordinate tactical movement.",
              "traits": [],
              "sfx": [
                {
                  "name": "Lead from the Front",
                  "description": "Spend 1 PP to step up an ally's die when acting on your order."
                }
              ]
            },
            {
              "name": "Infiltrator",
              "value": 8,
              "dice": [],
              "description": "Bypass security systems and move undetected.",
              "traits": [],
              "sfx": [
                {
                  "name": "Ghost Protocol",
                  "description": "Spend 1 PP to borrow a die from the challenge pool for stealth."
                }
              ]
            },
            {
              "name": "Specialist",
              "value": 8,
              "dice": [],
              "description": "Analyze technical anomalies and reverse-engineer artifacts.",
              "traits": [],
              "sfx": [
                {
                  "name": "Tactical Insight",
                  "description": "Spend 1 PP to reroll a die when analyzing enemy technology."
                }
              ]
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
          }
        },
        {
          "id": "ls-skills",
          "name": "Skills & Specialties",
          "nounSingular": "Skill",
          "nounPlural": "Skills",
          "traits": [
            {
              "name": "Engineering",
              "value": 8,
              "dice": [],
              "traits": [
                {
                  "name": "Clockwork",
                  "value": 8,
                  "dice": [],
                  "traits": [],
                  "sfx": []
                },
                {
                  "name": "Aetherics",
                  "value": 10,
                  "dice": [],
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
              "traits": [
                {
                  "name": "Star Charts",
                  "value": 8,
                  "dice": [],
                  "traits": [],
                  "sfx": []
                },
                {
                  "name": "Sub-Light",
                  "value": 10,
                  "dice": [],
                  "traits": [],
                  "sfx": []
                }
              ],
              "sfx": []
            },
            {
              "name": "Diplomacy",
              "value": 8,
              "dice": [],
              "traits": [
                {
                  "name": "High Society",
                  "value": 8,
                  "dice": [],
                  "traits": [],
                  "sfx": []
                },
                {
                  "name": "Street Smart",
                  "value": 6,
                  "dice": [],
                  "traits": [],
                  "sfx": []
                }
              ],
              "sfx": []
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
          }
        },
        {
          "id": "ls-standing",
          "name": "Standing",
          "nounSingular": "Standing",
          "nounPlural": "Standings",
          "traits": [
            {
              "name": "The Syndicate",
              "value": 8,
              "dice": [],
              "statement": "Debts are never forgotten.",
              "traits": [
                {
                  "name": "Complication",
                  "value": 8,
                  "dice": [],
                  "traits": [],
                  "sfx": []
                },
                {
                  "name": "Bonus",
                  "value": 6,
                  "dice": [],
                  "traits": [],
                  "sfx": []
                }
              ],
              "sfx": []
            },
            {
              "name": "The Vanguard",
              "value": 6,
              "dice": [],
              "statement": "Honor bound to protect.",
              "traits": [
                {
                  "name": "Complication",
                  "value": 6,
                  "dice": [],
                  "traits": [],
                  "sfx": []
                },
                {
                  "name": "Bonus",
                  "value": 8,
                  "dice": [],
                  "traits": [],
                  "sfx": []
                }
              ],
              "sfx": []
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
          }
        },
        {
          "id": "ls-values",
          "name": "Values",
          "nounSingular": "Value",
          "nounPlural": "Values",
          "traits": [
            {
              "name": "Craft",
              "value": 8,
              "dice": [],
              "description": "Form and function are inseparable.",
              "statement": "Form and function are inseparable.",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Speed",
              "value": 8,
              "dice": [],
              "description": "Ship early, refine relentlessly.",
              "statement": "Ship early, refine relentlessly.",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Clarity",
              "value": 6,
              "dice": [],
              "description": "Truth cuts through ambiguity.",
              "statement": "Truth cuts through ambiguity.",
              "traits": [],
              "sfx": []
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
          }
        },
        {
          "id": "ls-distinctions",
          "name": "Distinctions",
          "nounSingular": "Distinction",
          "nounPlural": "Distinctions",
          "traits": [
            {
              "name": "Voidborn Pioneer",
              "value": 8,
              "dice": [],
              "description": "Accustomed to zero-G and cold vacuum.",
              "traits": [],
              "sfx": [
                {
                  "name": "Zero-G Maneuver",
                  "description": "Spend 1 PP to ignore difficult terrain in micro-gravity environments."
                }
              ]
            },
            {
              "name": "Cybernetic Maverick",
              "value": 8,
              "dice": [],
              "description": "Upgraded with experimental neural cyberware.",
              "traits": [],
              "sfx": [
                {
                  "name": "Overclock",
                  "description": "Spend 1 PP to double an Engineering die when hotwiring security."
                }
              ]
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
          }
        },
        {
          "id": "ls-growth",
          "name": "Growth Pool",
          "nounSingular": "Growth Die",
          "nounPlural": "Growth Dice",
          "traits": [
            {
              "name": "D4",
              "value": 4,
              "dice": [],
              "traits": [],
              "sfx": [],
              "view": {
                "poolCount": 1
              }
            },
            {
              "name": "D6",
              "value": 6,
              "dice": [],
              "traits": [],
              "sfx": [],
              "view": {
                "poolCount": 1
              }
            },
            {
              "name": "D8",
              "value": 8,
              "dice": [],
              "traits": [],
              "sfx": [],
              "view": {
                "poolCount": 1
              }
            },
            {
              "name": "D10",
              "value": 10,
              "dice": [],
              "traits": [],
              "sfx": [],
              "view": {
                "poolCount": 1
              }
            },
            {
              "name": "D12",
              "value": 12,
              "dice": [],
              "traits": [],
              "sfx": [],
              "view": {
                "poolCount": 1
              }
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
            "pool": true,
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
          }
        },
        {
          "id": "ls-badges",
          "name": "Badges & Commendations",
          "nounSingular": "Badge",
          "nounPlural": "Badges",
          "traits": [
            {
              "name": "Fleet Veteran",
              "value": 8,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "High Jump",
              "value": 6,
              "dice": [],
              "traits": [],
              "sfx": []
            },
            {
              "name": "Master Hacker",
              "value": 10,
              "dice": [],
              "traits": [],
              "sfx": []
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
          }
        },
        {
          "id": "ls-resources",
          "name": "Resources & Supplies",
          "nounSingular": "Resource",
          "nounPlural": "Resources",
          "traits": [
            {
              "name": "Crew Complement",
              "value": 8,
              "dice": [],
              "traits": [],
              "sfx": [],
              "view": {
                "poolCount": 4
              }
            },
            {
              "name": "Emergency Fuel",
              "value": 6,
              "dice": [],
              "traits": [],
              "sfx": [],
              "view": {
                "poolCount": 3
              }
            },
            {
              "name": "Intel Network",
              "value": 8,
              "dice": [],
              "traits": [],
              "sfx": [],
              "view": {
                "poolCount": 2
              }
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
          }
        },
        {
          "id": "ls-dossier",
          "name": "Personnel Dossier",
          "nounSingular": "Field",
          "nounPlural": "Fields",
          "traits": [
            {
              "name": "Homeworld",
              "value": 0,
              "dice": [],
              "description": "Kepler-452b Core Colony",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Security Clearance",
              "value": 0,
              "dice": [],
              "description": "Level 5 Special Access",
              "traits": [],
              "sfx": []
            },
            {
              "name": "Affiliation",
              "value": 0,
              "dice": [],
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
          }
        },
        {
          "id": "ls-stress",
          "name": "Stress",
          "nounSingular": "Stress",
          "nounPlural": "Stress",
          "traits": [
            {
              "name": "Physical",
              "value": 6,
              "dice": [],
              "traits": [],
              "sfx": [],
              "view": {
                "pipCount": 5,
                "pips": 1
              }
            },
            {
              "name": "Mental",
              "value": 6,
              "dice": [],
              "traits": [],
              "sfx": [],
              "view": {
                "pipCount": 5,
                "pips": 0
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
              "count": 10,
              "perRow": 5,
              "connected": true,
              "filled": 1
            },
            "place": {
              "left": "66.666%",
              "top": 1,
              "width": "33.334%",
              "height": 1
            }
          }
        },
        {
          "id": "ls-notes",
          "name": "Field Notes",
          "nounSingular": "Note",
          "nounPlural": "Notes",
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
          }
        },
        {
          "id": "ls-session-record",
          "name": "Mission Chronicle",
          "nounSingular": "Session",
          "nounPlural": "Sessions",
          "traits": [],
          "sfx": [],
          "view": {
            "page": 2,
            "style": {
              "header": "default",
              "body": "session-record"
            },
            "sessionRecord": {
              "count": 12,
              "boxCount": 12,
              "orientation": "horizontal",
              "checked": [
                1,
                2,
                3
              ]
            },
            "reservedSlots": 12,
            "header": "top",
            "headerAlign": "right"
          }
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
