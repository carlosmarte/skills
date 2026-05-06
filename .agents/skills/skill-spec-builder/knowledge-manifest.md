# Skill Spec Builder — Knowledge File Manifest

Eight reference files that anchor the GPT's structured outputs. Three are normative specs (the GPT consults them to enforce constraints), two are operational playbooks (security + elicitation), and three are calibration examples (one per output format). All files live in `./knowledge/` and are uploaded directly to the GPT Builder's Knowledge panel.

## File Manifest

| # | File Name | Format | Purpose | Size Est. |
|---|-----------|--------|---------|-----------|
| 1 | `skill-md-spec.md` | Markdown | Normative spec for SKILL.md frontmatter and body | ~6 KB |
| 2 | `skill-yml-schema.md` | Markdown | Normative schema for SKILL.yml root keys and nested fields | ~5 KB |
| 3 | `jsonl-instruction-schema.md` | Markdown | Normative spec for JSONL line schema and validation rules | ~5 KB |
| 4 | `elicitation-playbook.md` | Markdown | Phase-1 question bank with vague-answer follow-ups | ~7 KB |
| 5 | `security-rejection-rules.md` | Markdown | Banned-directive patterns + refusal templates | ~5 KB |
| 6 | `examples-skill-md.md` | Markdown | Three worked SKILL.md examples (deploy, debug, docs) | ~6 KB |
| 7 | `examples-skill-yml.md` | Markdown | Matching SKILL.yml outputs for the same three workflows | ~5 KB |
| 8 | `examples-jsonl-instructions.jsonl` | JSONL | Matching JSONL streams for the same three workflows | ~3 KB |

**Total:** ~42 KB across 8 files. Well under the 512 MB / 20-file Builder caps. All files use plain UTF-8, no embedded images, no PDFs — maximum retrieval fidelity.

## File Details

### 1. `skill-md-spec.md`

- **Purpose:** Single source of truth for the SKILL.md format. The GPT consults it whenever a user asks "is X allowed in the name field?" or "do I need a `metadata.requires` block?" The spec keeps these rules out of system instructions where every char counts toward the 8,000-char cap.
- **Content:** Frontmatter section (name regex, char limits, allowed metadata keys, optional `internal` flag), body section (canonical headers, imperative-voice rule, optional sections), and a worked-example "minimum-valid SKILL.md" stub.
- **Source:** Synthesized from the research document at `research/agent-skills-spec-creation/research.md` plus the public Anthropic / Vercel / OpenClaw conventions referenced therein.
- **Prep Instructions:** No prep needed — file is authored cleanly. If you update the spec later, regenerate this file and re-upload to Builder; the GPT does not auto-refresh.
- **Update Frequency:** When the upstream open standard changes (Anthropic / Vercel publish a v2). Audit annually.

### 2. `skill-yml-schema.md`

- **Purpose:** Defines the four root keys (`skill_intent`, `environmental_constraints`, `failure_modes`, `execution_steps`) plus nested item structure for `execution_steps`. The GPT consults it to keep the YAML deterministic and CI-pipeline friendly.
- **Content:** Root-key table with type and required/optional status, nested `execution_steps` item schema, mapping rules from conversational user input to YAML node placement, common pitfalls (multi-line scalars, list-item indentation).
- **Source:** Derived from the research document's "Dynamic Configuration" section, extended with concrete YAML examples.
- **Prep Instructions:** No prep needed.
- **Update Frequency:** Stable — change only when output format requirements shift.

### 3. `jsonl-instruction-schema.md`

- **Purpose:** Per-line schema and validation rules. Most LLM drift errors in JSONL output (trailing commas, root arrays, mid-stream blank lines) are correctable via this reference.
- **Content:** Line schema, atomization rules (one logical step → one line, no nesting), step-id sequencing, action-directive verb-object grammar, validation-criteria conventions, anti-pattern catalog with before/after fixes.
- **Source:** Derived from the research document's "JSONL Paradigm" section + standard JSONL conventions.
- **Prep Instructions:** No prep needed.
- **Update Frequency:** Stable.

### 4. `elicitation-playbook.md`

- **Purpose:** When a user answers a Phase-1 question vaguely ("just deploy it", "the usual stuff"), the GPT consults this playbook for a follow-up question pattern instead of guessing.
- **Content:** Per-question follow-up patterns for each of the six Phase-1 question categories (scope, triggers, steps, dependencies, failure modes, validation), plus a "yellow-flag" catalog of vague phrases that always require clarification.
- **Source:** Authored from the research document's "Elicitation Intermediary" section + interview-craft principles.
- **Prep Instructions:** No prep needed.
- **Update Frequency:** Refresh when production telemetry shows new vague-answer patterns the GPT failed to probe.

### 5. `security-rejection-rules.md`

- **Purpose:** Explicit catalog of banned directive patterns and the refusal templates the GPT uses when it encounters them. Prevents the GPT from rubber-stamping a workflow that would fail downstream security scans (Lakera Guard, gitleaks, multi-agent vetting).
- **Content:** Three sections — (1) banned shell patterns (`rm -rf`, `curl | sh`, `eval`), (2) banned data-flow patterns (env-var exfiltration, secret-leakage), (3) banned prompt-injection patterns ("ignore previous instructions" + variants). Each entry includes a one-line refusal template + a safer-alternative suggestion.
- **Source:** Synthesized from the research document's "Security and Constraint Mapping" section + standard agent-skill vetting checklists.
- **Prep Instructions:** No prep needed.
- **Update Frequency:** Update when new attack patterns emerge in the wild. Audit quarterly.

### 6. `examples-skill-md.md`

- **Purpose:** Calibration anchors. Three full SKILL.md files showing how Phase-1 inputs (the imagined user dialogue) translate into the final markdown.
- **Content:** Three examples — (a) `vercel-preview-smoke-test`, (b) `incident-response-runbook`, (c) `internal-package-publisher`. Each example includes the imagined user inputs in a comment block, then the actual SKILL.md output. Domains span CI/CD, ops/runbook, and registry-publish.
- **Source:** Authored to span the three most common skill archetypes a user is likely to bring.
- **Prep Instructions:** No prep needed.
- **Update Frequency:** Add a fourth example if a recurring use case appears that the existing three don't cover.

### 7. `examples-skill-yml.md`

- **Purpose:** Same three workflows as `examples-skill-md.md`, but in pure YAML form. Lets the GPT see the explicit translation between markdown body and YAML structure.
- **Content:** Three YAML configurations matching the three SKILL.md examples one-to-one. Same skill names, same step counts, same dependencies.
- **Source:** Generated by hand to match `examples-skill-md.md`.
- **Prep Instructions:** No prep needed. **Critical:** if you edit `examples-skill-md.md`, edit this file in lockstep — they must remain consistent.
- **Update Frequency:** Synchronized with `examples-skill-md.md`.

### 8. `examples-jsonl-instructions.jsonl`

- **Purpose:** Same three workflows in JSONL form. Demonstrates the atomization step (collapsing a multi-step process into a flat ordered line list).
- **Content:** Three JSONL blocks (each with a comment-line header in JSON to delimit them — the GPT can split on the `_skill` key). Step counts match the corresponding SKILL.yml `execution_steps` arrays exactly.
- **Source:** Hand-authored to match the other two example files.
- **Prep Instructions:** Validate every line parses as JSON before re-uploading: `python -c "import json,sys; [json.loads(l) for l in open('examples-jsonl-instructions.jsonl') if l.strip()]"`. If any line fails, fix before upload — broken examples poison the GPT's calibration.
- **Update Frequency:** Synchronized with `examples-skill-md.md` and `examples-skill-yml.md`.

## Upload Procedure

1. Open the GPT Builder, navigate to **Configure → Knowledge**.
2. Drag all eight files from `./knowledge/` into the upload panel.
3. Verify the GPT's preview pane shows all eight by name.
4. Test with the first conversation starter and confirm the GPT references the spec files in its Phase-3 output (it should produce frontmatter that matches `skill-md-spec.md`'s rules exactly).
5. If the GPT generates malformed YAML or JSONL on first run, re-validate the example files — drift in `examples-*` is the most common cause.

## Re-Validation Cadence

- **Annually:** Audit upstream skill standards (Anthropic, Vercel, OpenClaw) for breaking changes.
- **Quarterly:** Review `security-rejection-rules.md` against new attack patterns.
- **Per-incident:** When the GPT produces a malformed artifact in production, identify which knowledge file was responsible and update it; never patch the system instructions to compensate (that path leads to char-cap exhaustion).
