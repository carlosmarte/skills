# <slug> specification

Canonical reference for the behavior of `<slug>`. Both the TypeScript
implementation (`packages/ts/`) and the Python implementation
(`packages/py/`) MUST conform to this document. Any divergence is a
bug, not a language idiom.

> This file is a **stub** produced by the `ployglot-project-scafford`
> skill. Replace each placeholder section with the real behavior of
> your library. The structure below — function inventory, algorithm,
> drift catalog — is the convention every twin library this skill
> produces follows.

## Function inventory

| Concept            | TypeScript                      | Python                          |
| ------------------ | ------------------------------- | ------------------------------- |
| _Replace these rows with one entry per public symbol_                                                          ||
| Primary entry      | `primaryEntry(...)`             | `primary_entry(...)`            |

## Algorithm

Document the canonical behavior in language-agnostic pseudocode. The
goal is that an implementer in **either** language can read this section
and produce a conformant port — the source code is the implementation,
this is the contract.

```
primary_entry(input):
    1. ...
    2. ...
    3. return ...
```

## Drift catalog

Caller-visible differences that existed between the two ports during
early development. Each row picks a canonical rule; both ports
conform to that rule. Once aligned, a drift becomes a parity fixture
in `tests/parity/fixtures.json`.

| ID  | Concern               | Canonical rule | Side that needed the change |
| --- | --------------------- | -------------- | --------------------------- |
| D1  | _example: nullish handling_ | _example: treat both `None` and `undefined`/`null` as unset_ | _example: TS already conformed; Python added an explicit `is None` guard_ |

When a drift is reconciled, add a fixture to
`tests/parity/fixtures.json` that exercises both the conformant path
and the rejected path. The fixture file is the contract that proves
the spec is alive.
