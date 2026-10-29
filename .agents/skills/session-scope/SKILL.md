---
name: session-scope
description: Keep an agent session to one phase and one narrow slice, honor stop signals, and never commit without the user's review. Use when starting a session, when scope grows, when work churns, or before handing work over. Prevents churn, scope creep, and unreviewed commits.
---

# Session scope

One phase at a time, one agent session per phase, one
narrow slice per session. Pushing past an agent's limit
produces churn, not progress. A fresh, narrower session
beats a long, churning one every time.

## Rules

1. Before starting, name the slice: one feature, one fix,
   one brief section. If the work needs two slices, it
   needs two sessions. Say so at the start, not after the
   first slice has sprawled into the second.
2. If the scope grows mid-session — a new requirement
   appears, a second feature attaches itself, a "while
   you're here" arrives — stop and split. Report the
   growth and the completed slice; do not absorb the new
   scope silently.
3. A stop signal is a stop. When the user says the agent
   is at its limit, or commits work as-is, or says stop:
   affirm the stop, leave the work as it stands, and do
   not push another round. Presentation debt left by a
   stop is for a fresh pass, not for more churn in this
   one.
4. No commit without the user's review. The user commits
   and pushes. Never commit, never push, never present
   committed work as reviewed when it was not. A handoff
   is work ready for review, not work already landed.
5. Check authorship before asserting it. The user's commit
   messages are plain sentence-case or terse lowercase,
   typos and all ("more play improvements", "not quite
   there yet frames"). Agent messages use conventional
   prefixes ("feat(a11y):", "fix(types):") or vague
   labels ("Mobile iteration"). Do not attribute agent
   work to the user or user work to an agent.
6. DECISIONS.md changes in your diff must be append-only:
   new entries appended, old entries untouched, corrections
   appended as new entries that name what they supersede.
   Check the diff before handing over.
7. One brief per session, handed over whole and
   self-contained. Never hand an agent a "re-ground it
   yourself" caveat, and never ask an agent to build past
   the brief's boundary (a correction brief's boundary, a
   step-1 boundary) without a new brief.

## When churn starts

Signs: the same defect reappearing across turns, fixes
that break adjacent behavior, growing diffs with shrinking
progress, repeated re-reads of the same files. When you
see them: stop, summarize what is done and what is not,
name the smallest next slice, and hand back. Do not
grind.

## Do not

- Commit or push on the user's behalf.
- Expand a slice into a phase, or a phase into a program,
  without saying so and getting a new brief.
- Treat a stop signal as an invitation to try once more
  with a different approach.
