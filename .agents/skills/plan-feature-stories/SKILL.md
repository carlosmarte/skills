---
name: plan-feature-stories
description: Decompose a piece of work into a 3-tier Feature > Story > Task plan tree, written to disk as self-contained markdown files. Use when the user asks to plan a feature, break down work, write an implementation plan, or create a task tree for a larger effort.
---

# Plan: Feature > Stories > Tasks

Decompose work into a **3-tier hierarchy** written to disk. Each file is self-contained and independently actionable.

This skill mirrors the slash command `/plan-feature-story-task`. Use it when a model does not auto-load slash commands or the user invokes the skill explicitly.

## Input

The user provides a description of work to be done. It may be vague or detailed. Understand it deeply before decomposing.

## Workflow

### Phase 0: Name the Plan Directory

Format: `<suggested_name>-<date>-<session_id>`

1. **`<suggested_name>`** — short kebab-case slug (max 4 words) derived from the work (e.g., `auth-middleware-rewrite`, `api-rate-limiting`)
2. **`<date>`** — today's date in `YYYYMMDD` (e.g., `20260416`)
3. **`<session_id>`** — short UUID v4 prefix, 8 hex chars (e.g., `a1b2c3d4`)

Example: `auth-middleware-rewrite-20260416-a1b2c3d4`

Place under the project root at `./plans/<suggested_name>-<date>-<session_id>/`. All references below to `<plan-dir>/` point here. If the user specifies a different location, use that instead.

### Phase 1: Understand

1. Read the user's request carefully.
2. Explore the codebase to understand relevant code, architecture, patterns.
3. Ask clarifying questions if scope, goals, or constraints are ambiguous. Do not proceed until context is sufficient.

### Phase 2: Decompose

Three levels:

**Feature** — a distinct, deliverable capability. _"What does the user/system gain when this is done?"_
- Independently shippable
- Named by capability delivered, not implementation detail

**Story** — a behavior slice within a feature. _"What specific behavior changes when this story is complete?"_
- One observable change (user-facing or system-facing)
- Orderable by dependency within a feature
- Completable in a single focused session

**Task** — an atomic implementation step within a story. _"What exact code change do I make, and how do I verify it worked?"_
- Targets specific files with specific changes
- Minutes to hours, not days
- Includes verification steps (test, behavior check, command)

### Phase 3: Write the Plan

Create this tree under `./plans/<plan-dir>/`:

```
<plan-dir>/
├── README.md
├── features/
│   ├── 01-<feature-name>.md
│   └── 02-<feature-name>.md
├── stories/
│   ├── 01/
│   │   ├── 01-<story-name>.md
│   │   └── 02-<story-name>.md
│   └── 02/
│       └── 01-<story-name>.md
└── tasks/
    ├── 01/
    │   ├── 01/
    │   │   ├── 01-<task-name>.md
    │   │   └── 02-<task-name>.md
    │   └── 02/
    │       └── 01-<task-name>.md
    └── 02/
        └── 01/
            └── 01-<task-name>.md
```

Naming: `<NN>-<kebab-case-name>.md`. Numeric prefix preserves ordering. Stories and tasks are grouped by their parent's feature number.

## File Templates

### `<plan-dir>/README.md`

```markdown
# Plan: <Plan Title>

## Goal

<What this plan achieves — 2-3 sentences>

## Scope

<In scope and explicitly out of scope>

## Features

| #   | Feature                                     | Stories | Description      |
| --- | ------------------------------------------- | ------- | ---------------- |
| 01  | [Feature Name](features/01-feature-name.md) | N       | One-line summary |

## Execution Order

<Recommended order, noting dependencies>
```

### `<plan-dir>/features/NN-feature-name.md`

```markdown
# Feature: <Feature Title>

## Goal

<Capability this feature delivers — 1-2 sentences>

## Acceptance Criteria

- [ ] <Observable outcome 1>
- [ ] <Observable outcome 2>

## Stories

| #   | Story                                        | Tasks | Description      |
| --- | -------------------------------------------- | ----- | ---------------- |
| 01  | [Story Name](../stories/NN/01-story-name.md) | N     | One-line summary |

## Notes

<Architectural decisions, constraints, context specific to this feature>
```

### `<plan-dir>/stories/NN/NN-story-name.md`

```markdown
# Story: <Story Title>

**Feature:** [<Parent Feature Name>](../../features/NN-feature-name.md)

## Context

<Why this story exists and what behavior it changes — enough to understand without reading the parent>

## Acceptance Criteria

- [ ] <Testable behavior 1>

## Dependencies

- <Other stories this depends on, with paths, or "None">

## Tasks

| #   | Task                                           | Description      |
| --- | ---------------------------------------------- | ---------------- |
| 01  | [Task Name](../../tasks/NN/NN/01-task-name.md) | One-line summary |
```

### `<plan-dir>/tasks/NN/NN/NN-task-name.md`

```markdown
# Task: <Task Title>

**Story:** [<Parent Story Name>](../../../stories/NN/NN-story-name.md)

## Context

<What this task accomplishes and why — enough to execute without reading parent files>

## Target Files

- `<path/to/file.ext>` — <what changes>

## Changes

<Specific code changes. Concrete: function names, data structures, logic flow.>

## Verification

- [ ] <Command to run, test to check, behavior to observe>
```

## Rules

1. **Self-contained files** — every file includes enough context to act on independently.
2. **Relative links** — all cross-references use relative markdown links.
3. **No empty shells** — every field has real content. If you cannot fill a field, decomposition is not detailed enough — investigate further.
4. **Concrete tasks** — name specific files and describe specific changes. "Update the config" is not a task. "Add `rateLimitPool` field to `src/config/schema.mjs` with Zod enum validation" is a task.
5. **Verify before writing** — confirm file paths, function names, and patterns by reading actual code before referencing them.

## After Writing

Summarize to the user:

- Total count: N features, N stories, N tasks
- Recommended execution order
- Risks, open questions, or decisions needing user input

## Reference

Source command: `.claude/commands/plan-feature-story-task.md`.
