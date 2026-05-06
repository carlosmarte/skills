# SKILL.yml — Normative Schema

Pure YAML configuration. Stripped of markdown narrative entirely, optimized for CI pipelines and headless execution environments. No comments outside YAML syntax. No prose. Four root keys.

## Root Keys

| Key | Type | Required | Purpose |
|-----|------|----------|---------|
| `skill_intent` | string | yes | Single-sentence statement of the skill's primary objective. |
| `environmental_constraints` | object | conditional | Required iff dependencies were elicited. Omit if none. |
| `failure_modes` | array of strings | conditional | Required iff the user stated negative constraints. Omit if none. |
| `execution_steps` | array of objects | yes | Ordered list of atomic steps. Must be non-empty. |

The skill's `name` is implicit from the directory; do not duplicate it as a top-level key.

## `skill_intent`

A single string. The user's primary objective, distilled. No more than 200 characters. Imperative or descriptive — both acceptable.

```yaml
skill_intent: Run a Vercel preview-deploy smoke test on PR open and return a markdown reachability report.
```

## `environmental_constraints`

Object with up to three array fields. Omit any sub-key with no entries. Omit the entire block if all sub-keys would be empty.

```yaml
environmental_constraints:
  env:
    - VERCEL_TOKEN
    - GITHUB_TOKEN
  bins:
    - vercel
    - curl
    - jq
  paths:
    - ./.vercel/
    - ./reports/
```

| Sub-key | Item type | Use for |
|---------|-----------|---------|
| `env` | string | Required environment variable names (no values). |
| `bins` | string | Required executable names on `$PATH`. |
| `paths` | string | Required file or directory paths the skill reads or writes. |

## `failure_modes`

Array of strings. Each entry is a single negative constraint or recovery directive. Imperative voice.

```yaml
failure_modes:
  - Do not retry on 4xx HTTP responses; fail fast and surface the response body.
  - Do not write to paths outside the project working directory.
  - On Vercel API rate-limit, queue the request and resume after the Retry-After interval.
```

Negative constraints come from the user's "what should this never do" answers. Recovery directives come from the "what happens when it fails" answers.

## `execution_steps`

Ordered array. Each item is an object with four required fields.

```yaml
execution_steps:
  - id: 1
    action: resolve_preview_url
    parameters:
      pr_number: <int>
      vercel_token: ${VERCEL_TOKEN}
    success_criteria:
      - URL resolved and returned a 200 status from the Vercel API.
      - URL matches the pattern `https://*.vercel.app`.
  - id: 2
    action: probe_url
    parameters:
      url: ${resolved_url}
      timeout_seconds: 10
    success_criteria:
      - HTTP status is in the 2xx range.
      - Response received within the timeout.
```

### Item field definitions

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | integer | yes | Sequential, starts at 1, increments by 1, no gaps. |
| `action` | string | yes | snake_case verb_noun phrase. Must match the action_directive verb in the corresponding JSONL line (see `jsonl-instruction-schema.md`). |
| `parameters` | object | yes | Key-value pairs. Use `${VAR}` notation for env-var interpolation, `<int>`, `<string>`, `<path>` for caller-supplied placeholders. |
| `success_criteria` | array of strings | yes | One bullet per criterion. Allows the executing agent to self-correct. |

## Cross-File Consistency

`execution_steps[i].id` must equal the `step_id` of the corresponding JSONL line at index `i`. The total `len(execution_steps)` must equal the JSONL line count. The `action` snake_case must map to the `action_directive` imperative-verb form (e.g., `resolve_preview_url` ↔ `"Resolve preview URL"`).

If the cross-file identifiers diverge, both files are considered invalid by downstream tooling.

## Mapping Table — Conversational Input → YAML Node

| User dialogue | YAML destination |
|---------------|------------------|
| "It deploys the preview and checks if it's up." | `skill_intent` |
| "It needs the Vercel token." | `environmental_constraints.env: [VERCEL_TOKEN]` |
| "Don't retry on 4xx." | `failure_modes: ["Do not retry on 4xx ..."]` |
| "First it gets the URL, then it pings it." | `execution_steps` array, two entries |
| "It should never write outside the repo." | `failure_modes: ["Do not write to paths ..."]` |
| "If it succeeds, return a markdown report." | last `execution_steps` item; `success_criteria` references the report. |

## Common Pitfalls

- **Empty arrays:** Do not emit `env: []`. Omit the key entirely.
- **Multi-line strings:** Use the YAML folded scalar `>-` only when necessary; prefer single-line strings.
- **Indentation:** Two-space indents, no tabs. YAML rejects mixed indentation silently — many parsers fail without clear errors.
- **Booleans and numbers as strings:** Quote `"true"` and `"1.0"` only when they must be strings; otherwise leave unquoted.
- **Quoting:** Single quotes for literal strings with special chars. Double quotes when escape sequences are needed.

## Minimum-Valid Stub

```yaml
skill_intent: Codify a workflow into a reusable agent skill artifact.
execution_steps:
  - id: 1
    action: elicit_workflow
    parameters: {}
    success_criteria:
      - User has confirmed the workflow scope and steps.
```

This is the smallest legal `SKILL.yml`. Any further reduction makes it invalid.
