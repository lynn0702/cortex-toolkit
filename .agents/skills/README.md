# Cortex Toolkit Agent Skills

Seven repo skills for the `character-curio` / `cortex-toolkit` codebase. Each folder under `.agents/skills/` contains a single focused `SKILL.md` grounded in `design/DECISIONS.md`, `AGENTS.md`, `schema/0.1/`, `scripts/validate.js`, and `scripts/gate.js`.

| Skill | Purpose |
| --- | --- |
| `measure-before-you-build` | Verify constants, CSS tokens, schema keys, validator rules, and FA subset coverage against the current repo tree before writing code or JSON. |
| `provenance-labels` | Label design claims `[DECIDED]`, `[SUGGESTION]`, or `[OPEN]`, preserve `design/DECISIONS.md` history, and keep code/docs in positive current law. |
| `vocabulary-check` | Validate every JSON key, `view` property, `KNOWN_PARTS` token, `style.body` ID, and `tags` value against current Character Curio vocabulary. |
| `paired-corpus-and-gates` | Keep paired templates, generated model types, font/icon subsets, Vite graph imports, and `v-html` sanitizers synced, and pass all 7 `npm run gate` steps. |
| `session-scope` | Enforce §0 baseline preconditions, single-phase narrow slices, stop signals, per-slice checkpoints, and clean handoff without unreviewed commits. |
| `mobile-verdict-separation` | Keep desktop `npm run gate`, runtime `npm run smoke`, and visual/geometric verdicts (`--shots` or DOM measurement) strictly separate. |
| `style-controls` | Enforce the 9 CSS and template controls (no static inline styles, `--z-*` / `<dialog>`, `!important` <= 4, shallow selectors, tokens, units, Prettier, self-hosted fonts/icons). |

## Repository layout note

- The canonical home-grown skills live directly in `.agents/skills/` inside this repository — edit them here and keep their YAML frontmatter valid (`name` matching the directory name and folded `description: >-` under 1024 characters).
- Third-party installed skills (such as `modern-web-guidance`, tracked via `skills-lock.json` and ignored by `.gitignore`) may live alongside them in `.agents/skills/` and must not be modified when maintaining repo skills.

## `AGENTS.md` skill summary snippet

```markdown
## Skills (load before acting)

- measure-before-you-build — starting from a brief/spec, or using any asserted constant, key, or formula.
- provenance-labels — writing or reviewing a spec, brief, or design doc.
- vocabulary-check — writing or reviewing JSON data (templates, presets, trait sets, view data).
- paired-corpus-and-gates — changing paired files, adding a file, or finishing any change.
- session-scope — starting a session, when scope grows, when work churns, before handing over.
- mobile-verdict-separation — verifying mobile, responsive, print, or geometric work, or when writing rendering claims.
- style-controls — writing or changing CSS, a Vue template, or any style-adjacent code.
```
