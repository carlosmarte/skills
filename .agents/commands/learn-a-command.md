# Learn from Context — Create Reusable Command

You are being asked to distill the current conversation into a reusable, named command file. This command captures the implementation steps behind work just completed so the same kind of task can be reproduced reliably from a single invocation.

## Input

The current conversation context is your primary input. From it, extract:
- **Goal**: what the user set out to accomplish
- **Steps**: the sequence of actions taken (file reads, edits, shell commands, decisions)
- **Inputs**: any variable parts that would change across invocations (file paths, names, config values, etc.)

If the goal or key decisions are ambiguous, ask the user before proceeding.

## Your Task

### 1. Analyze the Conversation

Review the full context window and identify:
- The **repeatable workflow** — the ordered steps that produced the result
- The **variable inputs** — parts that differ each time (these become arguments)
- The **fixed patterns** — parts that stay the same across invocations (these become instructions)
- The **decision points** — places where judgment was applied (these become guidance in the prompt)

### 2. Name the Command

Choose a short, descriptive kebab-case name prefixed with `fn-` that reflects the **action**, not the specific instance.
Good: `fn-scaffold-api-route`, `fn-add-db-migration`, `fn-wire-up-component`
Bad: `fn-fix-auth`, `fn-that-thing-from-tuesday`, `fn-task-123`

Ask the user to confirm or adjust the name before writing.

### 3. Generate the Command File

Write the command to `./.claude/commands/fn-<command-name>.md` using this structure:

```markdown
# <Command Title>

<One-line description of what this command does.>

## Arguments

$ARGUMENTS

<!-- Describe each expected argument and its purpose below -->
<!-- Example: Argument 1 — the target directory path -->
<!-- Example: Argument 2 — the resource name -->

## Prerequisites

<!-- Conditions that must be true before running this command -->

- <Prerequisite 1 — e.g., a specific dependency must be installed>
- <Prerequisite 2 — e.g., a config file must exist>

## Instructions

You are executing a reproducible implementation task. Follow the steps below precisely, adapting only the variable inputs provided via arguments.

### Step 1: <Action Title>

<Detailed instructions for this step. Include:
- Exact files to read, create, or edit
- Patterns to follow (with inline examples from the original implementation)
- Shell commands to run if applicable>

### Step 2: <Action Title>

<Next step...>

### Step N: Verify

<Verification steps — how to confirm the implementation is correct. Include:
- Commands to run (tests, type checks, linting)
- Expected outputs or behaviors to validate>

## Reference Implementation

<!-- A concrete example of the finished output from the original conversation, so the agent has a clear target to match -->

<Include a representative snippet or file listing showing what the end result looks like for one invocation.>

## Notes

- <Any edge cases, gotchas, or decision guidance discovered during the original implementation>
- <Constraints or conventions to respect>
```

### 4. Confirm to the User

Report:
- Command name and file path
- Brief summary of what it reproduces
- How to invoke it: `/fn-<command-name> <arguments description>`
- List the arguments it expects
