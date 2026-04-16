---
name: agent-creation
description: Scaffold and validate agent skill directories that conform to SKILL_SPEC.md. Use when the user asks to create a new agent skill, generate a SKILL.md file, scaffold a skill directory, or validate that existing skill directories meet the spec (frontmatter, naming rules, structure).
---

# Agent Creation

Scaffold a new agent skill OR validate an existing one against `SKILL_SPEC.md`.

This skill mirrors the slash commands `/agent-skill-create` and `/agent-skill-validate`. Use this skill when a model does not auto-load slash commands or when the user invokes the skill explicitly.

## Mode Selection

Pick a mode based on the user's request:

- **create** — user wants to make a new skill ("create a skill", "scaffold a new skill", "new agent skill")
- **validate** — user wants to check existing skills ("validate skill X", "check if this skill meets the spec", "audit skills")

If ambiguous, ask the user which mode before proceeding.

---

## Create Mode

### Input

Expected args: `<skill-name>` or `<skill-name> <short description>`.
- If only a name is given, ask for a description before proceeding.
- If empty, ask for both.

### Step 1: Validate the Skill Name

Check against SKILL_SPEC Section 3.1:

- 1–64 characters
- Lowercase alphanumeric (`a-z`, `0-9`) and hyphens (`-`) only
- Cannot start or end with a hyphen
- Cannot contain consecutive hyphens (`--`)

If invalid, explain why and suggest a corrected version. Do not proceed until valid.

### Step 2: Determine Skill Location

The skill directory should be created at the repository root (sibling to other skill directories). Confirm the target path with the user:

```
<repo-root>/<skill-name>/
```

### Step 3: Gather Skill Details

Ask the user (if not provided):

1. **Description** (required) — what it does and when to trigger it
2. **Instructions** — step-by-step body content for the agent
3. **Optional directories** — `scripts/`, `references/`, `assets/`
4. **Optional frontmatter** — `license`, `compatibility`, `metadata`, `allowed-tools`

### Step 4: Create the Directory Structure

```
<skill-name>/
├── SKILL.md
├── scripts/       # only if requested
├── references/    # only if requested
└── assets/        # only if requested
```

### Step 5: Generate SKILL.md

```markdown
---
name: <skill-name>
description: <description>
---

# <Skill Title>

<Body: instructions, examples, edge cases>
```

Include any optional frontmatter the user specified. Keep the body under 500 lines.

### Step 6: Validate

Run the **validate mode** mentally against the new skill and report any issues.

### Output

```
## Created: <skill-name>

Location: <full-path>

### Structure
<tree output>

### SKILL.md Preview
<first 20 lines>

Status: All validation checks passed.
```

---

## Validate Mode

### Input

Expected args: path to a skill directory, OR empty / `.` to scan the current working directory for all skill directories (any directory containing `SKILL.md`).

### Step 1: Structural Validation

- [ ] Skill directory exists
- [ ] `SKILL.md` file exists inside

### Step 2: Frontmatter Validation

Parse the YAML frontmatter block (between `---` delimiters) and check:

**Required:**
- [ ] `name` exists and is 1–64 characters
- [ ] `name` uses only lowercase alphanumeric (`a-z`, `0-9`) and hyphens (`-`)
- [ ] `name` does not start or end with a hyphen
- [ ] `name` does not contain consecutive hyphens (`--`)
- [ ] `name` exactly matches the parent directory name
- [ ] `description` exists, is non-empty, and is 1–1024 characters

**Optional (if present):**
- [ ] `license` — short string
- [ ] `compatibility` — max 500 characters
- [ ] `metadata` — string-to-string key-value map
- [ ] `allowed-tools` — space-delimited string

### Step 3: Body Content Validation

- [ ] Markdown body exists after the frontmatter
- [ ] Body is under 500 lines (warn if exceeded)
- [ ] File references use relative paths (no absolute paths like `/foo/bar`)

### Step 4: Optional Directory Checks

If present, verify non-empty:

- [ ] `scripts/` — executable or recognized script extensions
- [ ] `references/` — `.md` or documentation files
- [ ] `assets/` — resource files

### Output

```
## Validation: <skill-name>

Status: PASS | FAIL | WARN

### Results
- [x] Check that passed
- [ ] Check that failed — reason

### Summary
X/Y checks passed. Z warnings.
```

For multiple skills, append a summary table:

```
| Skill | Status | Passed | Warnings | Errors |
|-------|--------|--------|----------|--------|
```

## Reference

Full spec: `SKILL_SPEC.md` at the repo root.
Source commands: `.claude/commands/agent-skill-create.md`, `.claude/commands/agent-skill-validate.md`.
