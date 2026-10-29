# cortex-toolkit agent skills

Six distilled skills, one per folder, in the open Agent
Skills format: each folder holds a `SKILL.md` with YAML
frontmatter (`name` + `description`) and Markdown
instructions. They encode the lessons from the
lessons-learned register as loadable procedures, so the
next agent session starts from them instead of relearning
them from churn.

## The six skills

| Skill | Load it when... |
|---|---|
| `measure-before-you-build` | Starting from a brief/spec, or using any asserted constant, key, or formula |
| `provenance-labels` | Writing or reviewing a spec, brief, or design doc |
| `vocabulary-check` | Writing or reviewing JSON data (templates, presets, trait sets, view data) |
| `paired-corpus-and-gates` | Changing paired files, adding a file, or finishing any change |
| `session-scope` | Starting a session, when scope grows, when work churns, before handing over |
| `mobile-verdict-separation` | Verifying mobile, responsive, print, or geometric work, or writing rendering claims |

No scripts are bundled: every procedure uses the agent's
own tools (grep, read, test runs, browser). That keeps the
skills portable across tools with nothing to install.

## Install (project — recommended)

Copy the six folders into the repo, at the project root:

```
<repo>/.agents/skills/
```

So the tree reads `.agents/skills/measure-before-you-build/SKILL.md`,
and so on. This one location is read by both tools in use:
OpenCode reads `.agents/skills/` (alongside
`.opencode/skills/` and `.claude/skills/`), and Antigravity
reads `.agents/skills/` in the project. Because the skills
live in the repo, they are versioned with the project, and
the repo copy becomes canonical — edit them there, not in
this package.

Then restart (or start a new) agent session. The agent sees
each skill's name and description at startup and loads the
full instructions when a task matches the description.

## Global install (optional)

If you want the skills available in every project instead
of this one:

- OpenCode: `~/.config/opencode/skills/` (or the shared
  `~/.agents/skills/`).
- Antigravity: `~/.gemini/config/skills/` per its docs.
  Note: some guides list `~/.gemini/antigravity/skills/`
  instead for the global path. If a global install does
  not appear in the agent's skill list, check the other
  path before assuming the skill is broken.

Project install is recommended over global: these skills
reference cortex-toolkit paths (`design/DECISIONS.md`,
`js/templates.js`, `data/templates/`, `validate.js`), so
they only make sense inside this repo.

## AGENTS.md wiring (belt and braces)

The repo's `AGENTS.md` is read at session start. Paste
this section into it so the skills are found even if a
tool's skill discovery is off or a session starts without
them loaded:

```markdown
## Skills (load before acting)

This repo ships six skills in `.agents/skills/`. When a
task matches a skill's trigger, load that skill's SKILL.md
first and follow it; do not paraphrase it from memory.

- measure-before-you-build — starting from a brief/spec,
  or using any asserted constant, key, or formula.
- provenance-labels — writing or reviewing a spec, brief,
  or design doc.
- vocabulary-check — writing or reviewing JSON data
  (templates, presets, trait sets, view data).
- paired-corpus-and-gates — changing paired files, adding
  a file, or finishing any change.
- session-scope — starting a session, when scope grows,
  when work churns, before handing over.
- mobile-verdict-separation — verifying mobile,
  responsive, print, or geometric work, or writing
  rendering claims.

If skill discovery is unavailable in your tool, read the
SKILL.md file directly from `.agents/skills/<name>/`.
```

## Validate after install

- Every folder contains a `SKILL.md`, and the frontmatter
  `name` matches the folder name exactly (lowercase
  letters, digits, single hyphens, 64 characters max).
- Every `description` is under 1,024 characters and says
  both what the skill does and when to use it.
- Ask the agent to list its loaded skills and confirm all
  six appear. If one is missing, check the folder name
  and frontmatter first — that is the usual cause.

## Version

Distilled 2026-10-29 from the cortex-toolkit
lessons-learned register (back-to-basics item 3). When a
lesson changes, update the skill that encodes it and the
register together.
