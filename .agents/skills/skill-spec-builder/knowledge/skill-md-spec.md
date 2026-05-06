# SKILL.md — Normative Specification

This file is the single source of truth for `SKILL.md` format compliance. Consult it whenever a user asks whether a value is allowed, or when generating frontmatter and body sections.

## File Structure

A valid `SKILL.md` consists of two parts in this exact order:

1. **YAML frontmatter** — opened and closed by `---` on its own line.
2. **Markdown body** — everything after the closing `---`.

```
---
name: <name>
description: <description>
metadata:
  ...
---
## When to Use
...
## Steps
...
```

A file missing either delimiter is invalid. A file with content before the opening `---` is invalid. A file with no body is technically parseable but rejected by most CI validators.

## Frontmatter Fields

### `name` (required)

- **Type:** string
- **Length:** 1–64 characters
- **Pattern:** `^[a-z0-9]+(-[a-z0-9]+)*$`
- **Constraints:**
  - Strictly lowercase ASCII letters and digits
  - Single hyphens permitted between alphanumeric segments
  - No leading hyphen, no trailing hyphen, no consecutive hyphens
  - No underscores, no dots, no spaces, no uppercase
- **Critical rule:** must equal the directory name in which `SKILL.md` resides. The skill registry (Anthropic, Vercel, OpenClaw all enforce this) refuses to load skills where directory and `name` disagree.

| Input | Valid? | Reason |
|-------|--------|--------|
| `vercel-preview-smoke-test` | ✓ | All lowercase, single hyphens, alphanumeric. |
| `Vercel-Preview-Smoke-Test` | ✗ | Uppercase rejected. |
| `vercel_preview_smoke_test` | ✗ | Underscores rejected. |
| `vercel--preview` | ✗ | Consecutive hyphens. |
| `-vercel-preview` | ✗ | Leading hyphen. |
| `1-skill` | ✓ | Digits allowed in any position. |
| `skill.v2` | ✗ | Dots rejected. |

### `description` (required)

- **Type:** string
- **Length:** 1–1024 characters
- **Constraints:**
  - Non-empty
  - No newlines (use YAML folded scalar `>-` if multi-line is genuinely needed)
- **Semantic role:** the host agent uses this string as the primary routing trigger. Write it as an explicit activation cue, not a marketing blurb.

**Good:** "Use when a user opens a pull request and asks for a preview-deploy smoke test against the Vercel preview URL. Generates HTTP probe results plus a markdown report."

**Bad:** "An awesome smoke testing tool for your deploys!"

### `metadata` (optional)

Top-level object. Two recognized sub-keys.

#### `metadata.requires`

Object containing dependency arrays. Used by host platforms for pre-flight capability checks.

- `env` (array of strings) — required environment variable names. Example: `["VERCEL_TOKEN", "GITHUB_TOKEN"]`
- `bins` (array of strings) — required executables on `$PATH`. Example: `["vercel", "curl", "jq"]`

Omit the entire `requires` block (and `metadata` itself if empty) when no dependencies were elicited. Do not emit empty arrays.

#### `metadata.internal`

Boolean. Set to `true` only when the user marked the skill as developer-only or sandbox-only. Hidden from default discovery; activates only with explicit override env var.

## Body Sections

The body is markdown. Two sections are canonical and required; three are optional.

### `## When to Use` (required)

Bullet list of explicit trigger scenarios. One bullet per scenario. Imperative or declarative voice — never narrative.

```markdown
## When to Use
- The user opens a pull request and requests a preview-deploy smoke test.
- A CI pipeline emits a "preview ready" webhook and the agent must verify reachability.
- The user pastes a Vercel preview URL and asks "is this live?"
```

### `## Steps` (required)

Numbered, ordered, imperative. Each step is a single action verb plus its target. No nested steps. Branching is captured via separate "If X, then…" steps, not indented bullets.

```markdown
## Steps
1. Read the PR number from the user's request and resolve the matching Vercel preview URL via the Vercel API.
2. Issue a `GET` against the preview URL with a 10-second timeout.
3. If the response status is 2xx, run the configured probe list and collect results.
4. Format results as a markdown table and return to the user.
```

### `## Inputs` (optional)

Used when the skill expects structured input beyond the user's free-form request. Bullet list of `name — description` pairs.

### `## Outputs` (optional)

Used when the skill produces a deterministic structured output. Bullet list of `name — description` pairs.

### `## Notes` (optional)

Free-form caveats, edge cases, known limitations. Keep terse.

## Style Rules

- Imperative voice in `## Steps`. Not "The skill will read…" but "Read…"
- No narrative or marketing prose anywhere in the body.
- No code fences in `## When to Use` or `## Steps` (those belong in `## Notes` or external knowledge files).
- No HTML, no embedded images, no inline links to private resources.

## Minimum-Valid Stub

```markdown
---
name: example-skill
description: Use when a user describes a workflow that needs to be codified into an agent skill artifact.
---
## When to Use
- The user requests a new agent skill.

## Steps
1. Elicit the workflow.
2. Generate the artifact.
```

This is the smallest legal `SKILL.md`. Any further reduction (missing frontmatter, missing body section, missing required field) makes it invalid.

## Validation Pseudocode

```
parse opening "---" delimiter
parse YAML block until closing "---"
assert "name" matches /^[a-z0-9]+(-[a-z0-9]+)*$/ and len <= 64
assert "description" present and len <= 1024
parse markdown body
assert "## When to Use" header present
assert "## Steps" header present
```

If your Phase-3 output passes this pseudocode check, it will pass standard CI validators.
