# Create Agent Skill

Scaffold a new agent skill directory that conforms to the SKILL_SPEC.md specification.

## Input

The user provides: `$ARGUMENTS`
- Expected format: `<skill-name>` or `<skill-name> <short description>`
- If only a name is given, ask the user for a description before proceeding.
- If empty, ask the user for both a name and description.

## Instructions

### Step 1: Validate the Skill Name

Before creating anything, validate the provided name against SKILL_SPEC Section 3.1:

- 1–64 characters
- Lowercase alphanumeric (`a-z`, `0-9`) and hyphens (`-`) only
- Cannot start or end with a hyphen
- Cannot contain consecutive hyphens (`--`)

If the name is invalid, explain why and suggest a corrected version. Do not proceed until the name is valid.

### Step 2: Determine Skill Location

The skill directory should be created at the repository root level (sibling to other skill directories). Confirm the target path with the user:

```
<repo-root>/<skill-name>/
```

### Step 3: Gather Skill Details

Ask the user (if not already provided) for these details to populate the SKILL.md:

1. **Description** (required) — what the skill does and when to trigger it
2. **Instructions** — the step-by-step body content for the agent
3. **Optional directories needed** — `scripts/`, `references/`, `assets/`
4. **Optional frontmatter** — `license`, `compatibility`, `metadata`, `allowed-tools`

### Step 4: Create the Directory Structure

Create the skill directory and its contents:

```
<skill-name>/
├── SKILL.md
├── scripts/       # only if requested
├── references/    # only if requested
└── assets/        # only if requested
```

### Step 5: Generate SKILL.md

Write the `SKILL.md` file with proper YAML frontmatter and Markdown body:

```markdown
---
name: <skill-name>
description: <description>
---

# <Skill Title>

<Body content: instructions, examples, edge cases>
```

Include any optional frontmatter fields the user specified. The body should contain:

- A clear purpose statement
- Step-by-step instructions for the agent
- Input/output examples where helpful
- Edge cases or caveats

Keep the body under 500 lines.

### Step 6: Validate

After creation, run `/validate-skill <skill-name>` mentally (check all the same rules) and report any issues. Confirm to the user that the skill passes validation.

## Output

After creation, display:

```
## Created: <skill-name>

Location: <full-path>

### Structure
<tree output>

### SKILL.md Preview
<first 20 lines of the generated SKILL.md>

Status: All validation checks passed.
```
