# Likelihood × Impact Rubric

Use this rubric when Likelihood or Impact is ambiguous. If a risk sits between two cells, escalate — under-scoring a real hazard is worse than over-scoring a minor one, because P0/P1 surface for human review.

## Likelihood Definitions

### High
- Exploit or failure path is reachable with default configuration, no special preconditions.
- Trigger happens on every request, every deploy, or every user action in the affected flow.
- Known attack class with public tooling (SQL injection on a string-concat query, hardcoded secret in a public repo).
- Migration that runs on live traffic without a reversible gate.

### Medium
- Requires a specific but plausible precondition (authenticated user, specific feature flag, peak load).
- Occurs on a subset of requests (a particular route, file type, region).
- Race condition possible under observed load, not guaranteed.
- Dependency upgrade with breaking changes documented in the changelog.

### Low
- Requires a contrived sequence of events or insider access.
- Has been present for a long time without incident, but the upcoming change exposes it.
- Theoretical attack class with no known exploit for this stack.

## Impact Definitions

### High
- Data loss, corruption, or unauthorized exposure of protected data (PII, PCI, PHI, secrets).
- Full outage of a critical user flow (cannot log in, cannot pay, cannot read own data).
- Irreversible state change (dropped table, deleted customer record, sent wrong email to every user).
- Compliance violation that triggers breach notification.
- Financial harm (duplicate charges, refund loop, revenue blocking).

### Medium
- Degraded performance on a core flow (slow but working, increased error rate under load).
- Partial feature outage that affects a subset of users.
- Recoverable data issue (stale cache, inconsistent read that self-heals).
- Observability gap that delays but does not prevent incident response.

### Low
- Cosmetic bugs, copy errors, minor UX jank.
- Code quality issues with no behavioral impact.
- Non-critical log noise.
- Duplicated helper or util with no correctness implication.

## Tie-Breakers

- **Security**: any exploitable vector against protected data gets minimum Impact = High. Do not downgrade on the grounds of "low probability of exploit" — move the Low probability into Likelihood instead.
- **Data loss**: any path that can destroy user-owned data gets minimum Impact = High, regardless of how often it triggers.
- **Cutover risk**: during migrations, risks that only exist during the transition window still count — score Likelihood based on how it behaves *during* the window, not after.
- **Absent controls**: a missing control (no auth, no validation, no retry ceiling) scores the same as a broken control. Do not give "it's just missing" credit.

## Anti-Patterns

- Do not tag everything P0 to appear thorough — a report where every risk is P0 has no signal.
- Do not downgrade a matrix-derived P0 to P1 because "the team is busy." The matrix is the answer; timeline is a mitigation question.
- Do not collapse multiple distinct risks into one entry to shorten the report — each risk gets its own R-ID so mitigations and residuals stay traceable.
- Do not invent risks for elements outside `<location>` or outside the Current → Target delta. Scope discipline matters.
