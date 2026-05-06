# Elicitation Playbook — Phase-1 Question Bank and Vague-Answer Follow-Ups

The Phase-1 questions are batched intentionally. When a user's answer is too vague to map cleanly into the three target formats, do not guess — ask a follow-up. This playbook lists the most common vague-answer patterns and the follow-up question that disambiguates them.

## Yellow-Flag Phrase Catalog

If the user's answer contains any of these phrases, treat it as vague and ask a follow-up:

- "the usual thing"
- "you know, deploy it"
- "do all the standard checks"
- "handle errors gracefully"
- "the normal stuff"
- "everything"
- "make it smart"
- "automatically"
- "just / simply / easily"
- "best practices"
- "make sure it works"

These phrases compress real procedural detail into a single token. The follow-up's job is to expand them.

## Follow-Up Patterns by Question Category

### Q1: Scope & Role

**Goal:** establish the single capability the skill provides, with explicit boundaries.

| If the user says | Ask |
|------------------|-----|
| "Just helps with deploys" | Which step in the deploy lifecycle — provisioning, build, smoke-test, rollback? Pick one. |
| "Handles testing" | Unit, integration, smoke, performance, or accessibility? One per skill. |
| "Manages our PRs" | Which PR action — opening, reviewing, merging, labeling, closing? |
| "Helps with the codebase" | What concrete output does it produce — a file, a comment, a pass/fail verdict, a refactor patch? |

**Universal follow-up:** "If a teammate read only the `description` field, would they know whether to invoke this skill or a different one? If not, what's the disambiguating phrase?"

### Q2: Trigger Conditions

**Goal:** capture the exact user requests, file types, or system states that should activate the skill.

| If the user says | Ask |
|------------------|-----|
| "When someone asks about X" | Give me three example user phrasings. The skill's `description` field is matched against intent — exact phrasings sharpen the match. |
| "Whenever appropriate" | What cue, observable in the user's message or the project state, distinguishes "appropriate" from "inappropriate"? |
| "On every PR" | Every PR, or PRs touching specific paths, with specific labels, or matching specific authors? |
| "When CI runs" | Triggered by a CI webhook, by a CLI flag, by a chat command, or by file change detection? |

### Q3: Step Sequence

**Goal:** convert narrative into a numbered, ordered, atomic step list.

| If the user says | Ask |
|------------------|-----|
| "It deploys and tests" | Walk me through it as if narrating to a colleague. What command runs first? What does it produce? What's read next? |
| "Run the standard checks" | Name each check. One sentence per check is fine. |
| "Then it figures out what to do" | What signal does it inspect to decide? What are the possible decisions? |
| "Loops until done" | What is the exit condition? What is the maximum iteration count? |

**Always ask:** "Are any steps optional? If so, what condition makes them fire?"

**Always ask:** "If a step fails, does the workflow halt, retry, or branch to a recovery path?"

### Q4: Environmental Dependencies

**Goal:** populate `metadata.requires.env`, `metadata.requires.bins`, and `environmental_constraints.paths`.

| If the user says | Ask |
|------------------|-----|
| "It uses our internal API" | Which auth method — API key in env var, OAuth token, mTLS cert? What's the env-var name? |
| "It needs to run tests" | What test runner binary — `pytest`, `jest`, `vitest`, `go test`? Any plugins required? |
| "Reads the config" | What's the file path, relative to the working directory? What format — JSON, YAML, TOML? |
| "Talks to the database" | Which DB? Connection string from env var? Which env-var name? |

**Universal follow-up:** "Are there any binaries the skill expects on `$PATH` that aren't in a vanilla developer setup?"

**Universal follow-up:** "Does the skill require write access outside the project working directory? If so, name the path and the reason."

### Q5: Failure Modes & Boundaries

**Goal:** populate `failure_modes` array and the `## Notes` section of SKILL.md.

| If the user says | Ask |
|------------------|-----|
| "Don't break anything" | Name the three things you'd most regret if the skill broke them. |
| "Handle errors well" | When the upstream API returns 500, should the skill retry, queue, or fail-fast? When it returns 4xx? When it times out? |
| "Be safe" | Which file paths are off-limits? Which env vars must never be logged or transmitted? |
| "We had an incident before" | What happened? What single rule, if enforced, would have prevented it? |

### Q6: Validation Criteria

**Goal:** populate the `success_criteria` arrays in SKILL.yml and JSONL.

| If the user says | Ask |
|------------------|-----|
| "It works" | What observable signal tells you the step succeeded — exit code 0, file present, HTTP 200, output matches regex? |
| "Output looks right" | Describe one good output and one bad output. The difference is the validation criterion. |
| "Tests pass" | Which test command? What output indicates pass — JUnit XML, exit code, stdout pattern? |
| "Deploy succeeds" | What does the deploy tool emit on success? URL? Status code? Exit code? Log line pattern? |

## Synthesis Checklist (before exiting Phase 1)

Before writing the "Confirmed Requirements" summary, verify you have:

- [ ] One-sentence skill intent (for `description` and `skill_intent`)
- [ ] At least three concrete trigger phrasings (for `description` semantic routing)
- [ ] An atomic, ordered step list with no compound steps
- [ ] Every env var named explicitly with `UPPER_SNAKE_CASE`
- [ ] Every required binary named exactly as it appears on `$PATH`
- [ ] Every required path named relative to the project root
- [ ] At least one failure mode if the user described any constraint
- [ ] At least one success criterion per step

If any item is incomplete, ask one more batched question round before moving to Phase 2.

## Confirmation Pattern

Phase 1 closes with a numbered summary in this exact form:

```
Confirmed Requirements

1. Skill name (working): <name>
2. Intent: <one sentence>
3. Triggers: <bullet list of 3+ phrasings>
4. Steps:
   1. <step>
   2. <step>
   ...
5. Dependencies:
   - env: [...]
   - bins: [...]
   - paths: [...]
6. Failure modes: <bullet list>
7. Success criteria per step: <bullet list, indexed by step number>

Reply "approved" to proceed to generation, or list edits.
```

Do not generate any of the three artifacts until the user replies with "approved" or an equivalent unambiguous confirmation. "Looks good" is acceptable. "Maybe" is not — ask what's missing.
