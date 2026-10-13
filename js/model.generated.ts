/* eslint-disable */
/* AUTO-GENERATED from schema/0.1/*.schema.json by scripts/gen-types.mjs. Do not edit — run `npm run types`. */

/**
 * A list of taxonomy tags attached to this entity. Tags may include letters, numbers, hyphens, periods, and forward slashes (for namespacing).
 */
export type Tags = string[];
/**
 * Represents the “Hinder” core SFX.
 */
export type SfxHinder = "hinder";

/**
 * A JSON schema for a Cortex Prime player character sheet.
 */
export interface Character {
  /**
   * JSON schema URI for character.schema.json.
   */
  $schema?: string | null;
  /**
   * Version of character.schema.json to use.
   */
  version: "0.1";
  /**
   * Whether this character represents a reusable template.
   */
  isTemplate?: boolean | null;
  /**
   * A unique identifier for the character.
   */
  id: string;
  /**
   * The date and time when the character was first created.
   */
  dateCreated: string;
  /**
   * The date and time when the character was last changed.
   */
  dateModified: string;
  /**
   * The date and time when the character was last loaded, viewed or interacted with.
   */
  dateTouched: string;
  /**
   * The character’s name.
   */
  name: string;
  /**
   * The name of the game or campaign that the character belongs to.
   */
  game: string;
  /**
   * The character’s preferred pronouns.
   */
  pronouns: string;
  /**
   * A short summary or subtitle for the character.
   */
  description: string;
  /**
   * The character’s trait sets.
   */
  traitSets: TraitSet[];
  /**
   * An image to represent the character.
   */
  portrait: {
    url: string;
    /**
     * A description of the image.
     */
    alt: string;
    tags: Tags;
    custom: Custom;
  };
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
   * File-traveling arrangement (name-keyed set/trait order + declined template versions). Present only when the user rearranged; live prefs stay app-local.
   */
  prefs?: {
    setOrder?: unknown[];
    traitOrders?: {};
    declinedTemplateVersions?: {};
    [k: string]: unknown;
  } | null;
  /**
   * The character’s current number of plot points.
   */
  plotPoints: number;
  /**
   * Any additional notes about the character. Format: plaintext, Markdown or HTML.
   */
  notes: string;
  tags: Tags;
  custom: Custom;
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
  description: string;
  /**
   * The singular noun used to describe a trait in this set.
   */
  nounSingular: string;
  /**
   * The plural noun used to describe multiple traits in this set.
   */
  nounPlural: string;
  /**
   * The traits in the trait set.
   */
  traits: Trait[];
  /**
   * Any SFX attached directly to this trait set.
   */
  sfx: Sfx[];
  /**
   * Placement of trait rating dice relative to trait labels.
   */
  ratingPosition?: ("inline" | "above" | "below" | "none") | null;
  /**
   * Whether traits in this set feature a statement box alongside the trait name.
   */
  statement?: boolean | null;
  /**
   * Whether statement traits feature a toggleable questioned pip.
   */
  hasQuestionedPip?: boolean | null;
  /**
   * Whether this trait set renders a secondary counter column (e.g. Badges XP).
   */
  hasCounterColumn?: boolean | null;
  /**
   * Label for the secondary counter column header, e.g. 'XP'.
   */
  counterLabel?: string | null;
  tags: Tags;
  custom: Custom;
}
export interface Trait {
  /**
   * The name of the trait.
   */
  name: string;
  /**
   * The die value of the trait. For example, `2` for d2, `6` for a d6, etc. For unrated traits, use `0` or null.
   */
  value: number | null;
  /**
   * Array of die values for multi-die traits (e.g. [6, 6, 6] or [8, 8, 6, 4]).
   */
  dice?: number[] | null;
  /**
   * A description of the trait, or the trait statement.
   */
  description: string;
  /**
   * The trait statement (synonym for description).
   */
  statement?: string | null;
  /**
   * Whether this trait statement is questioned or challenged.
   */
  questioned?: boolean | null;
  /**
   * XP or numeral counter value for this trait.
   */
  xp?: number | string | null;
  /**
   * Alternative counter value for this trait.
   */
  counter?: number | string | null;
  /**
   * Override for rating dice placement on this trait.
   */
  ratingPosition?: ("inline" | "above" | "below" | "none") | null;
  /**
   * Any child traits attached this parent trait.
   */
  traits: Trait[];
  /**
   * Any SFX attached to this trait.
   */
  sfx: (Sfx | SfxHinder)[];
  tags: Tags;
  custom: Custom;
}
export interface Sfx {
  /**
   * The name of the SFX.
   */
  name: string;
  /**
   * A description of the SFX.
   */
  description: string;
  tags: Tags;
  custom: Custom;
}
/**
 * An open-ended object where apps and services can add custom data to this entity. It is strongly recommended that developers compartmentalize their app’s custom data under a unique key to avoid conflicts and generally be good neighbors.
 */
export interface Custom {
  [k: string]: unknown;
}

/**
 * A reusable sheet layout: same shape as a character entry ({ id (static), title, ..., character: {...} }). Trait sets carry stable ids joining character overrides to template layout. Imports dedupe by static id.
 */
export interface SheetTemplate {
  /**
   * JSON schema URI for sheet-template.schema.json.
   */
  $schema?: string;
  /**
   * Static template identifier. Assigned once, never regenerated; imports replace the same id instead of duplicating.
   */
  id: string;
  /**
   * Human-readable template title.
   */
  title?: string;
  subtitle?: string;
  spotlight?: string;
  variant?: string;
  pages?: number;
  genre?: string;
  description?: string;
  /**
   * Template format version.
   */
  version?: number;
  updatedAt?: string;
  /**
   * Character-shaped blank carrying the layout (custom.cortexToolkit at sheet and set level) plus blank traits.
   */
  character: {};
  [k: string]: unknown;
}

