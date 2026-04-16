# Validate Agent Skill

Validate an agent skill directory against the SKILL_SPEC.md specification.

## Input

The user provides: `$ARGUMENTS`
- If a path to a skill directory, validate that directory.
- If empty or `.`, scan the current working directory for skill directories (any directory containing a `SKILL.md` file) and validate all of them.

## Instructions

Read the full spec from `SKILL_SPEC.md` in the repository root for authoritative rules, then validate the target skill(s) against every requirement below.

### Step 1: Structural Validation

- [ ] Skill directory exists
- [ ] `SKILL.md` file exists inside the directory

### Step 2: Frontmatter Validation

Parse the YAML frontmatter block (between `---` delimiters) from `SKILL.md` and check:

**Required fields:**

- [ ] `name` field exists and is 1–64 characters
- [ ] `name` uses only lowercase alphanumeric (`a-z`, `0-9`) and hyphens (`-`)
- [ ] `name` does not start or end with a hyphen
- [ ] `name` does not contain consecutive hyphens (`--`)
- [ ] `name` exactly matches the parent directory name
- [ ] `description` field exists, is non-empty, and is 1–1024 characters

**Optional fields (validate if present):**

- [ ] `license` — should be a short string
- [ ] `compatibility` — maximum 500 characters
- [ ] `metadata` — must be a string-to-string key-value mapping
- [ ] `allowed-tools` — should be a space-delimited string

### Step 3: Body Content Validation

- [ ] Markdown body exists after the frontmatter
- [ ] Body is under 500 lines (warn if exceeded)
- [ ] File references use relative paths (no absolute paths like `/foo/bar`)

### Step 4: Optional Directory Checks

If any of these directories exist, verify they are non-empty:

- [ ] `scripts/` — files should be executable or have recognized script extensions
- [ ] `references/` — should contain `.md` or documentation files
- [ ] `assets/` — should contain resource files

## Output Format

For each skill validated, produce a report:

```
## Validation: <skill-name>

Status: PASS | FAIL | WARN

### Results
- [x] Check that passed
- [ ] Check that failed — reason

### Summary
X/Y checks passed. Z warnings.
```

If validating multiple skills, show a summary table at the end:

```
| Skill | Status | Passed | Warnings | Errors |
|-------|--------|--------|----------|--------|
```
