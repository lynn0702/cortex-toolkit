---
name: provenance-labels
description: >-
  Label every claim in specs, briefs, plans, and design reviews as DECIDED, SUGGESTION, or OPEN, and uphold DECISIONS.md and positive-law documentation rules. Use when authoring or reviewing design docs, briefs, or decision records.
---

# Provenance Labels

Prevent unratified suggestions or guesses from hardening into settled law by attaching explicit provenance labels to every design claim.

## Claim labels

- **`[DECIDED]`**: Explicitly backed by a ratified entry in `design/DECISIONS.md` or direct user confirmation in the current session. Cite the decision section/date.
- **`[SUGGESTION]`**: A proposed option, trade-off, or recommended default that the author has not yet ratified. Must remain changeable without friction.
- **`[OPEN]`**: An unresolved question or ambiguity requiring an author decision or targeted measurement before implementation.

Never present a `[SUGGESTION]` or `[OPEN]` item as `[DECIDED]`. When unsure, ask one focused question instead of guessing.

## Authoritative source: `design/DECISIONS.md`

- Always read `design/DECISIONS.md` through all sections before proposing or changing architecture.
- **Never autonomously modify `design/DECISIONS.md`.** Agents MUST NEVER create, modify, append to, or rewrite `design/DECISIONS.md` on their own initiative. Edit `design/DECISIONS.md` ONLY when the user explicitly instructs an edit to `design/DECISIONS.md` in that prompt and approves the wording. Propose candidate decisions in chat as `[SUGGESTION]` or `[OPEN]`.

## Positive-law rule outside `design/DECISIONS.md`

- Code, comments, tests, templates, and active developer docs state **current law positively** — describe what IS valid, supported, and allowed.
- Do not add tombstone comments or "do not use X" memorials for retired features inside application code or general docs. (When a design critique or schema spec must illustrate a superseded trap or forbidden pattern for review contrast, frame it explicitly as a historical trap example and keep shipped code/JSON purely in the current format.)
