/* eslint-disable */
/* AUTO-GENERATED from schema/0.1/*.schema.json by scripts/gen-types.mjs. Do not edit — run `npm run types`. */

/**
 * A list of taxonomy tags attached to this entity. Tags may include letters, numbers, hyphens, periods, and forward slashes (for namespacing).
 */
export type Tags = string[] | null;
/**
 * App presentation and view settings (layout, placement, style, features).
 */
export type View = {
  [k: string]: unknown;
} | null;
/**
 * An open-ended object where apps and services can add custom data to this entity. It is strongly recommended that developers compartmentalize their app’s custom data under a unique key to avoid conflicts and generally be good neighbors.
 */
export type Custom = {
  [k: string]: unknown;
} | null;

/**
 * A JSON schema for a Character Curio player character sheet.
 */
export interface Character {
  /**
   * The character’s name.
   */
  name: string;
  /**
   * An optional nickname or callsign for the character.
   */
  nickname?: string | null;
  /**
   * The character’s preferred pronouns.
   */
  pronouns?: string | null;
  /**
   * A short summary or subtitle for the character.
   */
  description?: string | null;
  /**
   * The player’s name.
   */
  player?: string | null;
  /**
   * The name of the game or campaign that the character belongs to.
   */
  game?: string | null;
  /**
   * The character’s current number of plot points. Defaults to 1 when omitted or null.
   */
  plotPoints?: number | null;
  /**
   * Any additional notes about the character. Format: plaintext or Markdown.
   */
  notes?: string | null;
  tags?: Tags;
  /**
   * An image to represent the character.
   */
  portrait?: {
    url?: string | null;
    /**
     * A description of the image.
     */
    alt?: string | null;
    tags?: Tags;
    view?: View;
    custom?: Custom;
  } | null;
  view?: View;
  custom?: Custom;
  /**
   * Layered name-keyed map of the character’s trait sets.
   */
  sets?: {
    [k: string]: unknown;
  } | null;
  /**
   * The character’s trait sets (array render shape).
   */
  traitSets?: TraitSet[] | null;
  /**
   * File-traveling arrangement (name-keyed set/trait order + declined template versions). Present only when the user rearranged; live prefs stay app-local.
   */
  prefs?: {
    setOrder?: unknown[];
    traitOrders?: {};
    declinedTemplateVersions?: {};
    [k: string]: unknown;
  } | null;
  /**
   * Layout resolution: template names the sheet template whose values fill in anything not set locally (live: bare { id }; file export: full embedded template object).
   */
  sheet?: {
    /**
     * Sheet template reference (live) or embedded template object (export).
     */
    template: {
      id: string;
      [k: string]: unknown;
    };
  } | null;
  /**
   * Pinned sheet template reference in layered form.
   */
  template?: {} | string | null;
  /**
   * A unique identifier for the character.
   */
  id: string;
  /**
   * Whether this character represents a reusable template.
   */
  isTemplate?: boolean | null;
  /**
   * The date and time when the character was first created.
   */
  dateCreated?: string | null;
  /**
   * The date and time when the character was last changed.
   */
  dateModified?: string | null;
  /**
   * The date and time when the character was last loaded, viewed or interacted with.
   */
  dateTouched?: string | null;
  /**
   * Version of character.schema.json to use.
   */
  version?: "0.1" | null;
  /**
   * JSON schema URI for character.schema.json.
   */
  $schema?: string | null;
}
export interface TraitSet {
  /**
   * Stable identifier joining this set to its sheet template layout. Assigned once and never regenerated.
   */
  id: string | null;
  /**
   * The name of the trait set.
   */
  name: string;
  /**
   * A description of the trait set.
   */
  description?: string | null;
  /**
   * The singular noun used to describe a trait in this set.
   */
  noun?: string | null;
  /**
   * The plural noun used to describe multiple traits in this set.
   */
  plural?: string | null;
  /**
   * The traits in the trait set.
   */
  traits?: Trait[] | null;
  /**
   * Label for the secondary counter column header, e.g. 'XP'.
   */
  counterLabel?: string | null;
  tags?: Tags;
  rating?: Rating;
  /**
   * Staging behaviour: adding a trait stages its whole array of available dice.
   */
  pool?: boolean | null;
  /**
   * Spend control for the set's traits unless a trait overrides it.
   */
  spendable?: boolean | null;
  /**
   * Top of the hitches inheritance chain. Sparse; base default 1.
   */
  hitches?: number | null;
  /**
   * Plot Point delta applied when staging or rolling a die from this set (positive gains PP, negative spends PP) unless overridden on the trait.
   */
  ppDelta?: number | null;
  view?: View;
  custom?: Custom;
}
export interface Trait {
  /**
   * The name of the trait.
   */
  name: string;
  /**
   * Display label for the trait. Name-block traits render this instead of the name.
   */
  label?: string | null;
  /**
   * Category singular label for this trait or child trait.
   */
  noun?: string | null;
  /**
   * Category plural label for this trait or child trait.
   */
  plural?: string | null;
  rating?: Rating;
  /**
   * Staging behaviour: adding the node to the roller stages its whole array of available dice.
   */
  pool?: boolean | null;
  /**
   * Spend control: spend a single die (or unit) at a time, marking it unavailable. Spent state lives beside the rating, never in it.
   */
  spendable?: boolean | null;
  /**
   * Faces 1..hitches hitch. Sparse: absent inherits from the nearest ancestor that sets it; base default 1. Only 0 is special — the exemption, which rolls separately.
   */
  hitches?: number | null;
  /**
   * Extra dice kept toward the total when rolled.
   */
  keepsExtra?: number | null;
  /**
   * Plot Point delta applied when staging or rolling this trait's die (positive gains PP, negative spends PP).
   */
  ppDelta?: number | null;
  /**
   * A description of the trait.
   */
  description?: string | null;
  /**
   * XP or numeral counter value for this trait.
   */
  xp?: number | string | null;
  /**
   * Alternative counter value for this trait.
   */
  counter?: number | string | null;
  /**
   * Any child traits attached this parent trait.
   */
  traits?: Trait[] | null;
  tags?: Tags;
  view?: View;
  custom?: Custom;
}
/**
 * The node's rating: { type: Counter | Die | Dice | Pip, value: [], range: [] }. Value is always a list; range is the ladder it may take. Absent means unrated.
 */
export interface Rating {
  /**
   * Counter = scalar number in value[0]. Die = single-die size in value[0]. Dice = die list in value. Pip = boolean array of checkboxes/bubbles in value. Optional when a child node inherits its rating type from an enclosing trait or set.
   */
  type?: "Counter" | "Die" | "Dice" | "Pip" | null;
  /**
   * Always a list: die sizes for Die/Dice, a number for Counter, booleans for Pip.
   */
  value: (number | boolean)[];
  /**
   * The ladder: die scale for Die/Dice, [min, max] for Counter, [count] for Pip. Pip may omit it (a lone bubble's [true, false] pair is derived).
   */
  range?: number[];
  /**
   * Out is part of this rating's range (one step past the top). Default off; most ratings lack it.
   */
  out?: boolean | null;
}

/**
 * A reusable sheet layout: { id (static), version, updatedAt, character: {...} } with Library listing metadata stored on character.view.listing. Trait sets carry stable ids joining character overrides to template layout. Imports dedupe by static id.
 */
export interface SheetTemplate {
  /**
   * Static template identifier. Assigned once, never regenerated; imports replace the same id instead of duplicating.
   */
  id: string;
  /**
   * Character-shaped blank carrying the layout (view at sheet and set level) plus blank traits.
   */
  character: {};
  updatedAt?: string;
  /**
   * Template format version.
   */
  version?: number;
  /**
   * JSON schema URI for sheet-template.schema.json.
   */
  $schema?: string;
  [k: string]: unknown;
}

