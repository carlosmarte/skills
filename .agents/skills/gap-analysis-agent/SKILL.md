---
name: gap-analysis-agent
description: Perform a systematic gap analysis on a target codebase location against a user-specified goal. Ingests a <location>/* path, maps the Current State, parses the <prompt> into a Target State, extracts the delta, and emits a prioritized action plan classified into P0 (critical blockers), P1 (high-value features), and P2 (low-risk utility) with cross-reference traceability. Use when the user asks to "gap analyze", "audit", "compare current vs target", "prioritize gaps", or requests a P0/P1/P2 triage of a folder or repo against stated requirements.
allowed-tools: Bash, Read, Glob, Grep, Write, Agent
argument-hint: "<location>/* <prompt>"
disable-model-invocation: false
---

# Gap Analysis Agent

Produce a rigorous, cross-referenced gap analysis between a known **Current State** (the files under the user's `<location>`) and a defined **Target State** (the user's `<prompt>`), then emit a prioritized action plan using the P0/P1/P2 triage matrix.

## Inputs

Arguments are parsed positionally:

- `<location>` — a path, glob, or directory the agent must ingest as the Current State (e.g. `src/`, `./api/**/*.py`, `/repo/service`).
- `<prompt>` — the Target State description: the goal, requirement, PRD excerpt, or acceptance criteria the system must satisfy.

If either argument is missing or ambiguous, stop and ask the user to provide the missing piece before ingesting anything.

## Execution Protocol

Run the four phases in order. Do **not** skip phases — each phase's output is the input to the next.

### Phase 1 — Current State Ingestion

1. Resolve `<location>` using `Glob` to enumerate matching files. If the path does not exist or yields zero files, stop and report.
2. For large trees (>50 files), dispatch an `Agent` (subagent_type: `Explore`, thoroughness: `medium`) to produce a concise architectural map instead of reading every file yourself. This mirrors the pre-compute engine pattern — do it to reduce tool calls and preserve context.
3. Record, in a working section titled `## Current State`:
   - Canonical paths (source, tests, config, docs)
   - Detected languages, frameworks, package managers
   - Public entry points / exported symbols / routes
   - Existing test coverage signals (test files present? framework?)
   - Active dependencies (from `package.json`, `pyproject.toml`, `go.mod`, etc.)
4. Do **not** fabricate architecture. If a component is not visible in the files, mark it `UNKNOWN` rather than inferring from training data.

### Phase 2 — Target State Definition

Parse `<prompt>` into a structured Target State under `## Target State`. Each target requirement must be:

- **Specific** — names a concrete capability, file, behavior, or metric
- **Measurable** — has an observable pass/fail condition
- **Achievable** — expressible as code or config changes to the ingested location
- **Relevant** — tied to the user's stated goal
- **Time-bound** — scoped to this analysis (no open-ended "eventually")

If the prompt is too vague to yield S.M.A.R.T. requirements, stop and ask the user to clarify. Do not proceed with guessed requirements.

### Phase 3 — Delta Extraction

Under `## Gap Delta`, list every discrepancy between Current and Target. For each gap, capture:

- **ID** — `G-001`, `G-002`, … (stable IDs for cross-reference)
- **Description** — one sentence stating what is missing or incorrect
- **Current evidence** — file path(s) + line number(s) in `path:line` form, or `N/A (absent)`
- **Target reference** — which Target State requirement this bridges
- **Dependencies** — IDs of other gaps that must resolve first (enforces Dependency-First ordering)

Gaps with no evidence and no target reference are invalid — drop them.

### Phase 4 — Prioritized Action Plan

Classify every gap into exactly one priority tier and list them under `## Action Plan` grouped by tier. Use these definitions strictly:

- **P0 — Critical Execution Blocker.** System is broken, insecure, or cannot build/run. No release proceeds while open. Examples: build failure, missing auth on a protected route, data-loss bug, unhandled crash path in the critical flow.
- **P1 — High-Value Feature Gap.** Major feature malfunction or significant deviation from Target that degrades UX or capability, but system still runs. Examples: missing endpoint from the spec, incorrect business logic in a secondary flow, absent test coverage on a core module.
- **P2 — Low-Risk Utility / Hygiene.** Nice-to-have, refactor, docs, style, minor perf. Safe to defer. Examples: inconsistent naming, duplicated helper, missing README section.

For each entry emit:

```
[P0|P1|P2] G-00X — <one-line description>
  Fix: <concrete, executable step — e.g. "Add middleware in src/auth/guard.ts to verify JWT on /admin/*">
  Files: <path:line or new-file path>
  Blocks: <IDs that depend on this, or "none">
```

Order the plan by: all P0 first (in dependency order), then P1 (in dependency order), then P2. This enforces the **Continuous Working State Principle** — fix broken foundations before adding features.

## Output Contract

Emit exactly one Markdown document in the conversation with these top-level sections, in this order:

1. `## Current State`
2. `## Target State`
3. `## Gap Delta`
4. `## Action Plan`
5. `## Cross-Reference Matrix` — a table mapping `Gap ID → Target Requirement → Current Evidence → Priority`, so every row is traceable end-to-end.

Do **not** execute fixes. This skill is analysis-only — it produces the plan; a separate invocation executes it.

## Operational Boundaries

- **Do not mutate files** in `<location>`. Read-only analysis.
- **Do not run build, test, or deploy commands** unless the user explicitly asks for live verification.
- **Do not invent file paths, symbols, or dependencies.** If unknown, mark `UNKNOWN` and surface it as a gap if material.
- **Do not expand scope beyond `<prompt>`.** Tangential improvements belong in P2 only if directly visible during ingestion; otherwise omit.
- **Stop and ask** when `<location>` is empty, `<prompt>` is too vague for S.M.A.R.T. targets, or the two are mismatched (e.g. Python prompt against a Rust tree).

## Example Invocation

```
/gap-analysis-agent src/api "Service must expose POST /users with JWT auth, 100% handler test coverage, and OpenAPI docs"
```

Expected output skeleton:

```
## Current State
- Language: TypeScript (Node 20)
- Entry: src/api/index.ts
- Routes found: GET /users (src/api/routes/users.ts:12)
- Auth middleware: NONE detected
- Tests: src/api/__tests__/users.test.ts (1 test, GET only)
- OpenAPI: no spec file found

## Target State
T1. POST /users endpoint exists and persists a user
T2. All /users/* routes require valid JWT
T3. Handler test coverage = 100% for /users
T4. OpenAPI spec documents the endpoint

## Gap Delta
G-001 POST /users handler absent — evidence: N/A (absent) — target: T1 — deps: none
G-002 No JWT middleware — evidence: N/A (absent) — target: T2 — deps: none
G-003 No tests for POST — evidence: src/api/__tests__/users.test.ts — target: T3 — deps: G-001
G-004 No OpenAPI spec — evidence: N/A (absent) — target: T4 — deps: G-001

## Action Plan
[P0] G-002 — Add JWT auth middleware
  Fix: Create src/api/middleware/auth.ts and mount on /users/*
  Files: src/api/middleware/auth.ts (new), src/api/index.ts:~20
  Blocks: none

[P1] G-001 — Implement POST /users
  Fix: Add handler in src/api/routes/users.ts with validation + persistence
  Files: src/api/routes/users.ts
  Blocks: G-003, G-004

[P1] G-003 — Add handler tests for POST /users
  Fix: Extend src/api/__tests__/users.test.ts with success + auth-fail cases
  Files: src/api/__tests__/users.test.ts
  Blocks: none

[P2] G-004 — Publish OpenAPI spec
  Fix: Add openapi.yaml documenting POST /users
  Files: openapi.yaml (new)
  Blocks: none

## Cross-Reference Matrix
| Gap  | Target | Evidence                              | Priority |
|------|--------|---------------------------------------|----------|
| G-001| T1     | N/A (absent)                          | P1       |
| G-002| T2     | N/A (absent)                          | P0       |
| G-003| T3     | src/api/__tests__/users.test.ts       | P1       |
| G-004| T4     | N/A (absent)                          | P2       |
```

See `references/priority-rubric.md` for edge cases in priority classification.
