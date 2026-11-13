---
name: session-scope
description: >-
  Keep each session to one phase and one narrow slice, enforce baseline preconditions, honor stop signals, and prevent unreviewed commits. Use when starting a session, handling multi-slice work, encountering scope growth or churn, or preparing handoff.
---

# Session Scope

Disciplined scope prevents half-finished refactors, silent baseline drift, and accidental commits.

## Core rules

1. **Verify baseline preconditions first (§0)**: When a brief specifies a baseline commit or clean working tree, check `git rev-parse HEAD` and `git status --short` before touching any file. If HEAD differs or unrelated uncommitted changes exist, **STOP** and report the state — never silently reground a brief or absorb someone else's work-in-progress.
2. **One phase per session**: Keep planning/research separate from large refactors, or clearly finish one approved slice before starting the next.
3. **One narrow slice per change**: Resist expanding a focused fix into unrelated cleanup, opportunistic renames, or speculative abstractions.
4. **Stop signals require an immediate pause**:
   - A verification check fails twice on the same assumption.
   - An asserted file, key, or behavior does not match the repo tree.
   - Carrying out the task requires editing outside approved files or inventing an unratified design choice.
   - Work begins churning (repeating similar edits without forward test progress).
5. **Multi-slice and per-item checkpoints**: When working an explicitly approved multi-slice plan or numbered brief, run verification (`npm run gate` and/or slice smoke) at each slice or item checkpoint and report progress before advancing.
6. **Never commit or push unasked**: Leave commits and pushes for explicit user review and approval (local pre-commit/pre-push hooks also expect `npm run gate` to be green).
7. **Pre-handoff verification**:
   - Check `git diff design/DECISIONS.md` to verify no accidental deletions occurred.
   - Run `npm run gate` after the very last edit and report only observed results.
   - Report untouched/untested tiers explicitly.
