---
name: <slug>
kind: library
language: ts
path: packages/ts
twin_of: <slug> (py)
publishable: true
---

# <slug> (ts)

<subject>. TypeScript twin of `packages/py/`. Behavior is canonical
per the repo-root [`SPEC.md`](../../SPEC.md).

## Install

```bash
npm i <scope-prefix><slug>
```

ESM-only. Requires Node ≥ 20.

## Import Surface

Re-exported from `src/index.ts`:

- _List the public symbols here as they land. Keep this list in sync
  with `__all__` in the Python twin's `__init__.py`._

## Canonical Usage

```ts
import { /* surface */ } from '<scope-prefix><slug>';

// Replace with a representative call. Match the example shown in the
// Python twin's `.agent.md` for parity readability.
```

## Integration

- **Depends on (monorepo):** none.
- **Depends on (external):** dev-only — `typescript`, `tsx`,
  `@types/node`.
- **Environment:** document any env vars the surface reads here.

## CI & Tests

- `make test` — node:test suite (`test/**/*.test.ts`).
- `make lint` — `tsc --noEmit`.
- `make build` — emits `./dist/`.
- `make ci` — `ci-install → lint → test → build`.

## Twin

- Python twin: [`packages/py/.agent.md`](../py/.agent.md). Cross-language
  parity is enforced by [`tests/parity/fixtures.json`](../../tests/parity/fixtures.json).
