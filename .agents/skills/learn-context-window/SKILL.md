---
name: learn-context-window
description: Distill the current conversation into a reusable command or skill artifact. Use when the user wants to capture a workflow they just executed (create a reusable slash command) or formalize a resolution/mistake/correction into a reusable skill so the same class of issue never recurs.
---

# Learn from Context Window

Turn what just happened in this conversation into a reusable artifact — either a **command** (captures an implementation workflow to replay) or a **skill** (captures a pattern of mistake/resolution to detect and prevent).

This skill mirrors the slash commands `/learn-a-command` and `/learn-a-skill`. Use it when a model does not auto-load slash commands or the user invokes the skill explicitly.

## Mode Selection

Pick a mode based on the user's intent:

- **command** — "make this repeatable", "turn this into a command", "I want to redo this workflow later" → capture the ordered steps that produced a result
- **skill** — "we missed this", "this went wrong", "make sure this doesn't happen again", "formalize this fix" → capture the generic pattern behind a specific incident

If ambiguous, ask the user which they want before proceeding.

---

## Command Mode

### Input

The current conversation is the primary input. Extract:
- **Goal**: what the user set out to accomplish
- **Steps**: ordered actions (file reads, edits, shell commands, decisions)
- **Inputs**: variable parts that would change across invocations

If goal or key decisions are ambiguous, ask before proceeding.

### Step 1: Analyze the Conversation

Identify:
- The **repeatable workflow** — ordered steps that produced the result
- The **variable inputs** — parts that differ each time (these become arguments)
- The **fixed patterns** — parts that stay the same (these become instructions)
- The **decision points** — where judgment was applied (becomes guidance in the prompt)

### Step 2: Name the Command

Short kebab-case name prefixed with `fn-` that reflects the **action**, not the specific instance.

- Good: `fn-scaffold-api-route`, `fn-add-db-migration`, `fn-wire-up-component`
- Bad: `fn-fix-auth`, `fn-that-thing-from-tuesday`, `fn-task-123`

Confirm the name with the user before writing.

### Step 3: Generate the Command File

Write to `./.claude/commands/fn-<command-name>.md`:

```markdown
# <Command Title>

<One-line description.>

## Arguments

$ARGUMENTS

<!-- Describe each expected argument -->

## Prerequisites

- <Prerequisite 1>

## Instructions

### Step 1: <Action Title>

<Detailed instructions — files to read/edit, patterns to follow, commands to run>

### Step 2: <Action Title>

### Step N: Verify

<How to confirm the implementation is correct>

## Reference Implementation

<Concrete snippet or file listing showing what the end result looks like.>

## Notes

- <Edge cases, gotchas, decision guidance>
```

### Step 4: Confirm

Report: command name, file path, brief summary, how to invoke (`/fn-<name> <args>`), and the argument list.

---

## Skill Mode

### Input

User provides one or more of:
- **Context**: what was being done when the issue surfaced
- **Finding**: what went wrong, what was missed, or what broke
- **Resolution**: how it was fixed

If any are missing, ask before proceeding.

### Step 1: Analyze the Resolution

Identify the **generic pattern** behind the specific incident:
- **Category**: config drift, API misuse, missing validation, wrong abstraction, dependency issue, platform quirk, etc.
- **Detection signals**: observable symptoms that indicate this class of issue
- **Root cause pattern**: the structural reason, not the specific bug

### Step 2: Name the Skill

Short kebab-case name that reflects the **pattern**, not the incident.

- Good: `validate-package-exports`, `detect-config-schema-drift`, `audit-dependency-constraints`
- Bad: `fix-auth-bug`, `tuesday-hotfix`, `issue-423`

Confirm with the user.

### Step 3: Generate the Skill File

Write to `./.claude/agents/<skill-name>.md`:

```markdown
---
name: <skill-name>
description: <One line — what this detects, validates, or prevents. Specific enough to match on.>
tools: Read, Glob, Grep, Bash
model: sonnet
---

# <Skill Title>

## Pattern Summary

<2-3 sentences: class of issue, why it recurs, cost when missed.>

## Root Cause

<The structural reason this class of issue occurs.>

## Detection Signals

- <Signal 1 — observable in code, logs, config, or behavior>
- <Signal 2>

## Validation Steps

1. <Specific file to read, command to run, or pattern to grep for>
2. <Step>

## Remediation Actions

1. <Specific change to make, with rationale>
2. <Action>

## Prevention Guardrails

- <CI check, linter rule, config constraint, review checklist item, or architectural rule>

## Cross-Project Application

1. <What to look for in an unfamiliar codebase to detect this pattern>
2. <Step>

## Usage

1. Run Detection Signals against the target
2. For each signal that fires, execute Validation Steps
3. If confirmed, apply Remediation Actions
4. Recommend applicable Prevention Guardrails
5. Report: PASS (no signals), WARN (signals, not confirmed), FAIL (confirmed + remediated)
```

### Step 4: Register the Skill

Update the project's `CLAUDE.md` (create if absent) to add the new agent to a Sub-agents table so it is discoverable in future conversations.

### Step 5: Confirm

Report: skill name, file path, pattern captured, how to invoke (`use the <skill-name> agent to audit <target>`).

## Reference

Source commands: `.claude/commands/learn-a-command.md`, `.claude/commands/learn-a-skill.md`.
