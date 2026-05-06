---
name: <slug>
kind: library
language: py
path: packages/py
twin_of: <slug> (ts)
publishable: true
---

# <slug> (py)

<subject>. Python twin of `packages/ts/`. Behavior is canonical per
the repo-root [`SPEC.md`](../../SPEC.md).

## Install

```bash
pip install <slug>
```

Requires Python ≥ 3.11, < 3.13. PEP 561 typed (`py.typed` marker
shipped).

## Import Surface

Re-exported from `<snake_pkg>/__init__.py` (alphabetized for stable
diffs):

- _List the public symbols here as they land. Keep this list in sync
  with the TypeScript twin's `src/index.ts`._

## Canonical Usage

```python
from <snake_pkg> import (
    # surface
)

# Replace with a representative call. Match the example shown in the
# TypeScript twin's `.agent.md` for parity readability.
```

## Integration

- **Depends on (monorepo):** none.
- **Depends on (external):** dev-only — `pytest`, `mypy`, `ruff`,
  `build`.
- **Environment:** document any env vars the surface reads here.

## CI & Tests

- `make test` — pytest (`tests/`).
- `make lint` — `ruff check` + `mypy --strict`.
- `make build` — sdist + wheel into `./dist/`.
- `make ci` — `ci-install → lint → test → build`.

## Twin

- TypeScript twin: [`packages/ts/.agent.md`](../ts/.agent.md).
  Cross-language parity is enforced by
  [`tests/parity/fixtures.json`](../../tests/parity/fixtures.json).
