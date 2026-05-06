# Twin Drift Catalog

Source of truth: [`/SPEC.md`](../SPEC.md). The fixtures at
[`/tests/parity/fixtures.json`](../tests/parity/fixtures.json) execute
every aligned drift on both sides; if either port deviates, that
side's local test fails.

## Pair: <slug> (ts) ↔ <slug> (py)

Both ports implement the same public surface. Naming differs by
language convention (camelCase ↔ snake_case); behavior is identical
by spec.

### Surface

| Concept            | TypeScript      | Python          |
| ------------------ | --------------- | --------------- |
| _Fill in once the surface is defined. One row per public symbol._   ||

### Aligned drifts

Caller-visible drifts that existed between the two ports during
development. Once both ports conform, each drift becomes a fixture in
`/tests/parity/fixtures.json`.

| ID  | Concern         | Canonical rule | Side that needed the change |
| --- | --------------- | -------------- | --------------------------- |
| _Replace this row with concrete drift entries as they are discovered._ ||

### Intentional asymmetries

Differences that are **not** bugs — language-idiomatic choices the
spec explicitly allows. Document them so future contributors don't
"fix" them.

- _Replace this list with concrete intentional asymmetries as the
  surface stabilizes._

### Drift watch

Any future change to a behavior rule MUST update
[`/tests/parity/fixtures.json`](../tests/parity/fixtures.json) in the
same change. The parity suite is the contract; if the fixture and
the implementation diverge, both sides flag it locally.
