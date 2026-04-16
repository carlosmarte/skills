# Learn from Resolution — Create Reusable Skill

You are being asked to formalize a resolution into a reusable, named skill artifact. This skill captures the patterns behind a missed feature, mistake, or correction so the same class of issue never recurs — in this project or any other.

## Input

The user will provide one or more of:
- **Context**: what was being done when the issue surfaced
- **Finding**: what went wrong, what was missed, or what broke
- **Resolution**: how it was fixed or corrected

If any of these are missing, ask the user before proceeding.

## Your Task

### 1. Analyze the Resolution

Identify the **generic pattern** behind the specific incident:
- What category of mistake is this? (config drift, API misuse, missing validation, wrong abstraction, dependency issue, platform quirk, etc.)
- What are the **detection signals** — observable symptoms that indicate this class of issue?
- What is the **root cause pattern** — not the specific bug, but the structural reason it happened?

### 2. Name the Skill

Choose a short, descriptive kebab-case name that reflects the **pattern**, not the specific incident.
Good: `validate-package-exports`, `detect-config-schema-drift`, `audit-dependency-constraints`
Bad: `fix-auth-bug`, `tuesday-hotfix`, `issue-423`

Ask the user to confirm or adjust the name before writing.

### 3. Generate the Skill File

Write the skill to `./.claude/agents/<skill-name>.md` using this structure:

```markdown
---
name: <skill-name>
description: <One line — what this skill detects, validates, or prevents. Must be specific enough to match on.>
tools: Read, Glob, Grep, Bash
model: sonnet
---

# <Skill Title>

## Pattern Summary

<2-3 sentences: the class of issue this skill addresses, why it recurs, and what it costs when missed.>

## Root Cause

<The structural reason this class of issue occurs — not the specific bug, but the underlying pattern.
Example: "Build tools silently drop exports when the `exports` map in package.json doesn't match the actual file paths, causing downstream consumers to get undefined imports at runtime.">

## Detection Signals

Symptoms that suggest this issue may be present:

- <Signal 1 — what you'd observe in code, logs, config, or behavior>
- <Signal 2>
- <Signal 3>

## Validation Steps

Concrete checks to confirm or rule out the issue:

1. <Step — a specific file to read, command to run, or pattern to grep for>
2. <Step>
3. <Step>

## Remediation Actions

How to fix when the issue is confirmed:

1. <Action — specific change to make, with rationale>
2. <Action>
3. <Action>

## Prevention Guardrails

Controls to prevent recurrence:

- <Guardrail — CI check, linter rule, config constraint, review checklist item, or architectural rule>
- <Guardrail>

## Cross-Project Application

How to apply this skill to assess other packages or projects for the same risk:

1. <Step — what to look for in an unfamiliar codebase to detect this pattern>
2. <Step>
3. <Step>

## Usage

When invoked against a target project or package:

1. Run the **Detection Signals** checks against the target
2. For each signal that fires, execute the **Validation Steps**
3. If confirmed, apply **Remediation Actions**
4. Recommend applicable **Prevention Guardrails**
5. Report findings as: PASS (no signals), WARN (signals but not confirmed), or FAIL (confirmed issue + remediation applied)
```

### 4. Register the Skill

After writing the skill file, update the project's `CLAUDE.md` (or create one if it does not exist) to add the new agent to a Sub-agents table so it's discoverable in future conversations.

### 5. Confirm to the User

Report:
- Skill name and file path
- Brief summary of the pattern it captures
- How to invoke it: `use the <skill-name> agent to audit <target>`
