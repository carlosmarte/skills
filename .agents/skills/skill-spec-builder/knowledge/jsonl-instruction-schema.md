# JSONL Instruction Stream — Normative Schema

JSONL = Newline-Delimited JSON. Every line is a complete, valid, self-contained JSON object. The format is optimized for streaming, append-only logging, and structure-to-structure fine-tuning datasets.

## File-Level Rules

1. **One object per line.** Each line is parseable as standalone JSON.
2. **No root array.** Do not wrap the file in `[ ... ]`. Do not write a single mega-object containing an array.
3. **No trailing commas.** Anywhere. Inside objects, between objects, at end of file.
4. **No blank lines** between objects. The terminal newline at end-of-file is optional but conventional.
5. **No comments.** JSONL has no comment syntax; embedding `//` or `#` makes the line invalid JSON.
6. **UTF-8 encoding.** ASCII subset preferred for action_directive strings to maximize tooling compatibility.

## Per-Line Schema

Every line follows exactly this shape:

```json
{"step_id": <integer>, "action_directive": "<string>", "operational_parameters": <string|object>, "validation_criteria": ["<string>", ...]}
```

### Field definitions

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `step_id` | integer | yes | Sequential, starts at 1, increments by 1, no gaps, no duplicates. |
| `action_directive` | string | yes | Imperative verb-object form. Title-cased verb, lowercase rest. Examples: `"Read file"`, `"Execute command"`, `"Format output"`. |
| `operational_parameters` | string OR object | yes | Either a single string (when one param suffices) or a flat key-value object. Avoid deep nesting. |
| `validation_criteria` | array of strings | yes | At least one criterion. Each criterion is a single sentence describing a success condition. |

### Optional fields (use sparingly)

| Field | Type | When to use |
|-------|------|-------------|
| `depends_on` | array of integer | When step ordering is non-linear and must reference prior step ids. |
| `on_failure` | string | When the recovery behavior is step-specific and not captured in `failure_modes`. |
| `tags` | array of string | When telemetry consumers need to filter steps by category. |

Do not add fields beyond this set. Downstream parsers (Bedrock batch jobs, Azure AI Projects, custom evaluators) reject unknown keys silently.

## Atomization Rule

One JSONL line = one logical step. A "logical step" is an action that:

- Has a single primary verb.
- Has a single primary target.
- Either succeeds or fails as a unit (no partial completion).

If a step in the user's narrative includes "first do X, then Y, then Z", split it into three lines. Each line is independently retryable.

## Step Ordering

`step_id` sequences from 1 upward. Lines must appear in `step_id` order in the file. If branching exists in the workflow, use `depends_on` to express the DAG and keep the file in topological order.

```jsonl
{"step_id": 1, "action_directive": "Read PR number", "operational_parameters": {"source": "user_request"}, "validation_criteria": ["PR number is a positive integer."]}
{"step_id": 2, "action_directive": "Resolve preview URL", "operational_parameters": {"pr_number": "<from_step_1>", "api": "vercel"}, "validation_criteria": ["URL matches https://*.vercel.app"], "depends_on": [1]}
```

## Action Directive Vocabulary

Use a constrained verb vocabulary for portability. Preferred verbs:

| Verb | Used for |
|------|----------|
| Read | Reading a file, env var, API response, or user input. |
| Write | Writing a file or stdout. |
| Execute | Running a CLI command or shell pipeline. |
| Resolve | Looking up a value via API or registry. |
| Probe | Issuing a network request to test reachability. |
| Validate | Checking a condition; on fail, surface error. |
| Transform | Mapping one structure to another. |
| Format | Producing the final output structure. |
| Notify | Sending a message to user or external system. |

When none of the above fit, use a clear English imperative verb. Avoid jargon ("frobnicate", "crunch", "munge").

## Validation Criteria Conventions

- Express as positive success conditions ("Status code is 200"), not failure cases.
- Be specific enough that an executor can self-check ("URL matches the pattern X" beats "URL is correct").
- One criterion per array element. Compound conditions become two elements.

## Common Pitfalls and Fixes

| Anti-pattern | Why broken | Fix |
|--------------|------------|-----|
| `[{...}, {...}, {...}]` | Root array — not JSONL. | Remove brackets and commas; one object per line. |
| `{...},\n{...},` | Trailing commas. | Strip the commas. |
| `{...}\n\n{...}` | Blank line. | Remove the empty line. |
| `// step 1\n{...}` | Inline comment. | Move comment to a separate doc; JSONL has no comments. |
| Deeply nested `operational_parameters` | Hard for streaming parsers. | Flatten to one level; reference outputs via `<from_step_N>` placeholders. |
| Skipped step_id (`1, 2, 4`) | Sequence gap. | Renumber sequentially. |
| Duplicate step_id | Ambiguous reference. | Renumber. |

## Validation Pseudocode

```python
import json

with open(path) as f:
    seen_ids = set()
    expected_id = 1
    for line in f:
        if not line.strip():
            raise ValueError("Blank line not allowed")
        obj = json.loads(line)  # raises if invalid
        assert obj["step_id"] == expected_id
        assert obj["step_id"] not in seen_ids
        seen_ids.add(obj["step_id"])
        assert obj["action_directive"]
        assert "operational_parameters" in obj
        assert isinstance(obj["validation_criteria"], list)
        assert obj["validation_criteria"]
        expected_id += 1
```

If your Phase-3 output passes this loop without exception, it is valid JSONL.

## Minimum-Valid Stub

```jsonl
{"step_id": 1, "action_directive": "Elicit workflow", "operational_parameters": "user_dialogue", "validation_criteria": ["User confirmed the workflow scope."]}
```

A single line is a complete, valid JSONL file.
