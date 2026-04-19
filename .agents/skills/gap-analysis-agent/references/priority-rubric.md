# Priority Classification Rubric

Use this rubric when a gap's tier is ambiguous. When in doubt, escalate (pick the higher-urgency tier) — under-classifying a real blocker is worse than over-classifying a minor one, because P0/P1 bubble up for human review.

## P0 — Critical Execution Blocker

A gap is P0 if **any** of the following is true:

- The system cannot build, start, or serve its primary function.
- A security boundary is missing or broken (unauthenticated access to protected data, secrets in source, SQL/command injection, broken auth).
- Data is at risk of loss or corruption (missing migrations on a schema change, unbounded deletes, race conditions on persistence).
- A core user-visible flow hard-fails (payment fails in a payment app, login fails in an auth app).
- Legal / compliance violation (PII mishandling, license violation on a dependency).

P0 implies: **no release proceeds until resolved**. Dispatch synchronously. Block P1/P2 work in the same plan.

## P1 — High-Value Feature Gap

A gap is P1 if:

- A spec'd feature is missing or materially incorrect, but the system still runs.
- A core module lacks test coverage and the Target State requires it.
- A documented performance target is missed but the flow still completes.
- A secondary user flow is degraded.

P1 is the normal backlog. Dispatch in parallel where dependencies allow.

## P2 — Low-Risk Utility / Hygiene

A gap is P2 if:

- Code style, naming, or formatting inconsistency.
- Minor duplication with no correctness impact.
- Missing non-required docs, comments, or README sections.
- Refactor opportunity with no behavioral change.

P2 is safe to defer. Include only if visible during Phase 1 ingestion — do not go hunting for P2 items.

## Tie-Breakers

- **P0 vs P1**: if the system *runs* but produces *wrong* output in the critical flow → P0. If it produces *missing* output in a secondary flow → P1.
- **P1 vs P2**: if the Target State explicitly names the capability → P1. If the Target State is silent and it's a code-quality observation → P2.
- **Security**: any exploitable vector → P0, even if the exploit is "theoretical." Do not downgrade security gaps to P1 on the grounds of "low likelihood."

## Anti-Patterns

- Do not tag every gap P0 to seem thorough. A plan where everything is P0 has no priority signal.
- Do not create P2 entries for things outside `<location>`. Scope discipline matters.
- Do not merge multiple gaps into one ID to reduce the count — each distinct fix gets its own ID so dependencies can be tracked.
