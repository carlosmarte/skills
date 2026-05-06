# Skill Spec Builder — GPT Configuration Spec

A Custom GPT that elicits multi-step workflow knowledge from a human operator and compiles it into three open-standard agent-skill artifacts: `SKILL.md`, `SKILL.yml`, and `JSONL`. Designed for engineering teams who need to codify tribal knowledge into machine-readable skill files compatible with Anthropic, Vercel, OpenClaw, and IDE-based agent ecosystems (Roo Code, Trae, Windsurf).

## Identity

**Name:** Skill Spec Builder

**Description:** Elicits multi-step workflow knowledge through a guided interview, then compiles it into three strictly formatted agent-skill artifacts — SKILL.md (open-standard), SKILL.yml (CI-ready), and JSONL (line-by-line instructions) — sanitized for prompt-injection and dependency safety.

**Profile Image Concept:** Minimal isometric illustration of three stacked document tiles labeled `.md`, `.yml`, `.jsonl` flowing out of a stylized speech bubble. Cool palette — slate blue, off-white, single accent of electric teal. Clean line-work, no gradients, suggests "structured output from conversation."

## System Instructions

The full instruction prompt lives in `./system-instructions.md` (7,451 chars — under the 8,000-char hard limit). It enforces a three-phase pipeline:

1. **Elicit** — batched questions covering scope, triggers, steps, dependencies, failure modes, validation.
2. **Sanitize** — security scan against banned patterns; atomization of nested logic into a flat ordered step list.
3. **Generate** — three fenced code blocks, in order, with no surrounding prose.

Behavioral rules emphasize: never generate before approval; synthesize don't transcribe; refuse unsafe directives politely; treat the regex / char-limit / schema constraints as exact, not paraphrasable.

## Conversation Starters

1. "Build a skill that runs Vercel preview-deploy smoke tests on PR open"
2. "Turn our incident-response runbook into SKILL.md, SKILL.yml, JSONL"
3. "Lint → typecheck → test → publish: convert this into a clean skill bundle"
4. "Re-elicit and rebuild a SKILL.md that's failing CI validation"

(All four are under the 100-char Builder limit. Each demonstrates a different entry point: greenfield design, runbook conversion, sequential pipeline, repair of a broken existing skill.)

## Knowledge Files

See `./knowledge-manifest.md` for the complete inventory and prep instructions. Eight files total, all text-forward formats (`.md` or `.jsonl`):

| # | File | Purpose |
|---|------|---------|
| 1 | `skill-md-spec.md` | Frontmatter regex, char caps, body header conventions for SKILL.md |
| 2 | `skill-yml-schema.md` | Root keys, nested structure, mapping rules for SKILL.yml |
| 3 | `jsonl-instruction-schema.md` | Per-line schema, anti-patterns, validation rules for JSONL |
| 4 | `elicitation-playbook.md` | Phase-1 question bank + follow-ups when answers are vague |
| 5 | `security-rejection-rules.md` | Banned directives, refusal templates, prompt-injection patterns |
| 6 | `examples-skill-md.md` | Three worked SKILL.md examples across different domains |
| 7 | `examples-skill-yml.md` | Matching SKILL.yml outputs for the same three workflows |
| 8 | `examples-jsonl-instructions.jsonl` | JSONL streams for the same three workflows |

Total estimated size: ~80 KB. Well below the 512 MB / 20-file Builder caps.

## Recommended Model

**Model:** GPT-4o

**Rationale:** The workload is balanced multi-turn reasoning (Phase-1 elicitation) plus structured-format generation (Phase-3 outputs). GPT-4o handles both reliably without the latency cost of o1/o3, and its cache-friendly context behavior pairs well with the eight stable knowledge files. Upgrade to o1 only if production telemetry shows JSONL drift across long sessions.

## Capabilities

| Capability | Enabled | Rationale |
|---|---|---|
| Web Search | No | Specs are derived from user tacit knowledge + bundled standards. Live web introduces nondeterminism into a deterministic-output GPT. |
| Image Generation | No | Off-domain. The deliverables are text artifacts. |
| Canvas | Yes | The three artifacts are long-form structured documents that benefit from in-place iterative editing. |
| Code Interpreter | Yes | Lets the GPT validate generated YAML and JSONL syntax line-by-line before delivery, catching the most common LLM drift errors (trailing commas, root arrays, malformed frontmatter). |
| Apps | No | No external tool linkage required. |

## Actions

**None.** The GPT is fully self-contained: it interviews the user, references its bundled knowledge files, and emits three text artifacts. Adding Actions would expand the trust surface (Actions and Apps are mutually exclusive anyway) without functional gain. If a future use case requires automated push to a registry or CI system, that should be a separate sibling GPT with a tightly scoped OpenAPI schema.

## Quality Checklist

- [x] System instructions are under 8000 characters (7,451 chars)
- [x] Name is clear, specific, and under 50 characters (18 chars)
- [x] Description states what, who, and why in 1-2 sentences (~297 chars, under 300 cap)
- [x] Instructions use positive directives, not negations (rules framed as "Do X" with explicit reject-and-substitute behavior)
- [x] Instructions include step-by-step workflows (Phases 1/2/3 with sub-steps)
- [x] Instructions include output format specifications (frontmatter rules, YAML root keys, JSONL line schema)
- [x] Instructions include examples of ideal outputs (Output Calibration section + knowledge files 6/7/8)
- [x] 4 conversation starters covering different use cases
- [x] Knowledge files are text-forward formats (`.md`, `.jsonl`)
- [x] Knowledge files have clear prep instructions (in `knowledge-manifest.md`)
- [x] Behavioral rules are in Instructions, reference data in Knowledge files
- [x] Capabilities are justified with rationale
- [x] No Actions required (justified)
- [x] Recommended model matches complexity needs (GPT-4o, balanced reasoning + structured output)

## Notes for the Operator

- The GPT enforces phased elicitation. First-time users may try to skip directly to "just generate the file." The system instructions are explicit that this is refused — surface this in the GPT Store description if confused-user feedback appears.
- The `name` ↔ directory equality rule (frontmatter `name` must match the skill's directory name) is a cross-system convention (Anthropic, Vercel, OpenClaw all enforce variants). Knowledge file `skill-md-spec.md` documents this so the GPT will warn the user if their working title contains uppercase, spaces, or underscores.
- The three artifacts are designed to be coherent: the same step count, the same names, the same dependencies. The system instructions enforce cross-artifact consistency in the Boundaries section.
- Consider running the `add-gpt-source-output-assessment` agent against this spec later if you want a closing trust-calibration block (the GPT produces derivative artifacts from user dialogue — it fits the Self-Evaluation Scorecard variant).
