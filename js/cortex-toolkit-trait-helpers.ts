// cortex-toolkit trait helpers — TypeScript pilot.
// Core functions for the layered trait model: maps + recursion, no dependencies.
//
// Model recap:
//   entity: { name, game, type, challenge?, sets: { [setName]: set } }
//   set:    { description?, select?, requiresSelect?, usableBy?, traits: { [name]: trait } }
//   trait:  "d8"  (shorthand)  or  { value?, description?, cost?, usableBy?, traits? }
// Merge: mergeLayers(...layers), later wins — absent inherits, null clears.

export const DIE_SIZES = [4, 6, 8, 10, 12, 20] as const;
export type DieSize = (typeof DIE_SIZES)[number];
export type DieString = `d${DieSize}`;

export type UsableBy = "owner" | "anyone" | "opposition";
export type SelectMode = "one" | "any";
export type StepDir = "up" | "down";
export type Party = "owner" | "opposition";

export interface Cost {
  plotPoints?: number;
  stepUp?: string;
  stepDown?: string;
  [key: string]: unknown;
}

export interface TraitObject {
	value?: string | null;
	description?: string;
  cost?: Cost;
  usableBy?: UsableBy;
  /** Multi-die traits roll every die into the roller on add. */
  pool?: boolean;
  traits?: Record<string, TraitRaw>;
  [key: string]: unknown;
}

/** A trait is either shorthand ("d12") or a full object. */
export type TraitRaw = string | TraitObject;

export interface SetObject {
  description?: string;
  select?: SelectMode;
  requiresSelect?: boolean;
  usableBy?: UsableBy;
  traits: Record<string, TraitRaw>;
  [key: string]: unknown;
}

export interface Portrait {
  url: string;
  alt?: string;
  [key: string]: unknown;
}

/** A reference to any layer by field — template today, game/type/campaign/scene tomorrow. */
export interface LayerRef {
  id: string;
  version?: number;
  [key: string]: unknown;
}

/** Phase-1 freeze: envelope stays file-level; entity carries top-level fields. */
export interface Entity {
  name: string;
  game?: string;
  type?: string;
  challenge?: string;
  template?: LayerRef;
  pronouns?: string;
  description?: string;
  portrait?: Portrait;
  plotPoints?: number;
  notes?: string;
  tags?: string[];
  sets: Record<string, SetObject>;
  [key: string]: unknown;
}

/** A layer is an ordered trait-tree; the merge only needs it to be an object. */
export type Layer = Record<string, unknown>;

/** Normalize the string|object duality: "d12" -> { value: "d12" }. Objects pass through. */
export function asTrait(raw: TraitRaw | null | undefined): TraitObject {
  if (typeof raw === "string") return { value: raw };
  return raw ?? {};
}

const isObj = (v: unknown): v is Record<string, unknown> =>
  v !== null && typeof v === "object" && !Array.isArray(v);

function deepClone<T>(v: T): T {
  if (Array.isArray(v)) return v.map(deepClone) as T;
  if (isObj(v))
    return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, deepClone(x)])) as T;
  return v;
}

/**
 * mergeLayers(...layers) — later wins. Never mutates inputs.
 *
 * Three-state per key: absent → inherit from lower layer,
 * null → explicitly clear, concrete value → local override.
 * Only the name-keyed maps (`sets`, `traits`) merge recursively —
 * everything else (cost objects, value, description, arrays…) replaces.
 * Trait shorthand ("d12") normalizes to { value: "d12" } in a first pass,
 * but ONLY under a `traits` map, so top-level strings like name/game/challenge
 * are untouched. That means { value: "d12" } merged with { description: "Big!" }
 * keeps the die instead of dropping it.
 */
export function mergeLayers(...layers: Layer[]): Layer {
  const out: Layer = {};
  for (const layer of layers) {
    if (isObj(layer)) {
      const normalized = normalizeTree(layer);
      if (isObj(normalized)) mergeInto(out, normalized);
    }
  }
  return out;
}

// Pass 1 — deep clone + convert trait shorthand ("d8" -> { value: "d8" })
// under `traits` maps. Null/undefined pass through untouched
// (null = clear, undefined = inherit).
function normalizeTree(node: unknown): unknown {
  if (Array.isArray(node)) return node.map(normalizeTree);
  if (!isObj(node)) return node;
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(node)) {
    if (k === "traits" && isObj(v)) {
      out[k] = Object.fromEntries(
        Object.entries(v).map(([tk, tv]): [string, unknown] => [
          tk,
          tv === null || tv === undefined ? tv : normalizeTree(asTrait(tv as TraitRaw)),
        ]),
      );
    } else {
      out[k] = normalizeTree(v);
    }
  }
  return out;
}

// Pass 2 — pure three-state merge on normalized trees.
function mergeInto(target: Record<string, unknown>, source: Record<string, unknown>): void {
  for (const [k, v] of Object.entries(source)) {
    if (v === null) {
      delete target[k];
      continue; // explicitly cleared
    }
    if (v === undefined) continue; // absent → inherit
    if ((k === "sets" || k === "traits") && isObj(v)) {
      const tt: Record<string, unknown> = isObj(target[k]) ? (target[k] as Record<string, unknown>) : ((target[k] = {}) as Record<string, unknown>);
      for (const [sk, sv] of Object.entries(v)) {
        if (sv === null) {
          delete tt[sk];
          continue;
        }
        if (sv === undefined) continue;
        const ctv = tt[sk];
        if (isObj(sv) && isObj(ctv)) mergeInto(ctv, sv);
        else tt[sk] = deepClone(sv);
      }
      continue;
    }
    target[k] = deepClone(v); // replace wholesale
  }
}

export interface WiredNode {
  path: string[];
  name: string;
  raw: unknown;
}

/**
 * walkTraits(node) — every set and trait at every depth.
 * Yields { path, name, raw }. path is the join-safe address, e.g.
 * ["Distinctions", "Chief Engineer", "SFX"]. Call asTrait(raw) for the
 * trait view. Accepts an entity, a set, or a trait.
 */
export function* walkTraits(node: unknown, path: string[] = []): Generator<WiredNode> {
  const n = node as { sets?: Record<string, unknown>; traits?: Record<string, unknown> } | null;
  const kids = n?.sets ?? n?.traits ?? {};
  for (const [name, child] of Object.entries(kids)) {
    const here = [...path, name];
    yield { path: here, name, raw: child };
    yield* walkTraits(child, here);
  }
}

/**
 * getByPath(root, pathArray) — path-scoped lookup. This is what makes the
 * SFX "collision" a non-issue: ["Distinctions","SFX"] and
 * ["Distinctions","Chief Engineer","SFX"] are different addresses.
 * Returns the raw node (string | object | undefined); wrap with asTrait().
 */
export function getByPath(root: unknown, path: string[]): unknown {
  let node: unknown = root;
  for (const seg of path) {
    const n = node as { sets?: Record<string, unknown>; traits?: Record<string, unknown> } | null;
    const kids = n?.sets ?? n?.traits;
    if (!kids || !(seg in kids)) return undefined;
    node = kids[seg];
  }
  return node;
}

const DIE_RE = /(\d*)d(4|6|8|10|12|20) ?/g;

/** parseDice("2d10 d8") -> ["d10","d10","d8"]. Spaces optional, tokenizes on known die sizes. */
export function parseDice(s: string | null | undefined): string[] {
  return [...String(s ?? "").matchAll(DIE_RE)].flatMap(m =>
    Array(Number(m[1] || 1)).fill(`d${m[2]}`),
  );
}

/** formatDice(["d10","d10","d8"]) -> "2d10d8". Canonical: descending size, count prefix. */
export function formatDice(dice: string[]): string {
  const counts = new Map<string, number>();
  for (const d of dice) counts.set(d, (counts.get(d) ?? 0) + 1);
  return [...counts.entries()]
    .sort((a, b) => parseInt(b[0].slice(1), 10) - parseInt(a[0].slice(1), 10))
    .map(([d, n]) => (n > 1 ? n : "") + d)
    .join("");
}

/**
 * stepDie("d10") -> "d8"; stepDie("d8", "up") -> "d10".
 * Floors at d4, caps at d20. Unknown input passes through untouched.
 */
export function stepDie(die: string, dir: StepDir = "down"): string {
  const i = (DIE_SIZES as readonly number[]).indexOf(parseInt(String(die).slice(1), 10));
  if (i < 0) return die;
  const j = dir === "down" ? Math.max(0, i - 1) : Math.min(DIE_SIZES.length - 1, i + 1);
  return `d${DIE_SIZES[j]}`;
}

/**
 * usableBy(trait, set, layer) — outward fallback: trait → set → layer → "owner".
 * Pass the trait's enclosing set and layer; first defined value wins.
 */
export function usableBy(trait: unknown, ...scopes: unknown[]): UsableBy {
  for (const s of [trait, ...scopes]) {
    const u = (s as { usableBy?: UsableBy } | null)?.usableBy;
    if (u) return u;
  }
  return "owner";
}

export interface SetPickDef {
  name?: string;
  select?: SelectMode;
  requiresSelect?: boolean;
  usableBy?: UsableBy;
}

/**
 * checkSetPick(set, n, party) — one set's take against its selection rules.
 * n: count or array of picked names; party: who is picking.
 * Returns [] when ok, else human-readable issues. Empty = good.
 */
export function checkSetPick(
  set: SetPickDef | null | undefined,
  n: number | string[],
  party: Party = "owner",
): string[] {
  const issues: string[] = [];
  const count = Array.isArray(n) ? n.length : n;
  const who: UsableBy = set?.usableBy ?? "owner";
  if (who !== "anyone" && party !== who) issues.push(`${set?.name ?? "set"} is usable by ${who}`);
  if ((set?.select ?? "any") === "one" && count > 1)
    issues.push("select at most one die from this set");
  if (set?.requiresSelect && count < 1) issues.push("must select at least one die from this set");
  return issues;
}
