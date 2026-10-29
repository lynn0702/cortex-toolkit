---
name: provenance-labels
description: Label every claim in specs, briefs, and reviews as DECIDED, SUGGESTION, or OPEN, and never present a guess as a decision. Use when writing or reviewing a spec, brief, or design document, or when a document claims open questions are resolved. Prevents unratified choices from hardening into settled design.
---

# Provenance labels

Every claim in a spec, brief, or review carries a label.
There are exactly three, and they are never interchangeable.

- **DECIDED** — the user decided it. It names who decided
  and when. The repo's `design/DECISIONS.md` is the record;
  check it before asserting anything is decided.
- **SUGGESTION** — an agent (or the assistant) proposed it.
  It is a read, a sketch, or a recommendation. It stays
  labelled until the user adopts it.
- **OPEN** — nobody has decided it. It is a question, a
  gap, or a choice the user has not made.

## Rules

1. Read `design/DECISIONS.md` first, before any spec work.
   It is the repo's law, and it is append-only: corrections
   append a new entry, never edit an old one. Your diff
   must be append-only too — check before handing over.
2. Never stamp an OPEN or SUGGESTION item DECIDED. A spec
   that claims "all open questions resolved" must be
   checked claim by claim against DECISIONS.md and the
   user's own words. If a claim cannot be traced to a user
   decision, it is SUGGESTION or OPEN, whatever the spec
   says.
3. Never present a guess as a decision. When unsure, the
   repo rule is: ask one question, never present a guess as
   a decision. One question, not a questionnaire, and not a
   silent choice.
4. When you adopt a SUGGESTION in your own work, say so:
   "implemented per spec, pending the user's ratification."
   That sentence is the difference between a faithful
   execution and a false claim of settlement.
5. When a document you received mixes labels (a DECIDED
   stamp on an undecided item, a SUGGESTION written as
   settled), flag the specific items. Do not rewrite the
   whole document's labels silently, and do not carry the
   false stamp forward into your code, your tests, or your
   DECISIONS entry.

## Examples from this repo

- Arc shape, span angles, corner radius, stroke tokens,
  dock quadrants, and the frame-versus-grid resolution were
  never decided — a spec that stamped them DECIDED was
  wrong on every one of them, and the correction brief had
  to un-stamp them.
- A mobile-off rule, an arc resolution, and a
  zero-remounting claim entered DECISIONS.md as decided
  from an unratified spec; the follow-up entry had to
  correct the record to width-based forcing and
  implemented-per-spec-pending-ratification.
- The shape suggestion (shape name by default, custom path
  as escape hatch) is a SUGGESTION, not a decision, until
  the user says otherwise — even though it appears in a
  design bundle.

## Do not

- Write "decided" for anything the user did not decide.
- Let a spec's confidence substitute for a DECISIONS.md
  entry.
- Edit or delete a DECISIONS.md line. Append a correction
  that names what it supersedes.
