---
name: <repo-name>
kind: polyglot-library-monorepo
schema: ployglot-agentmd-usages/v1
layout: packages
---

# <repo-name> — LLM Entry Reference

This repo ships **2 packages across 2 languages** — TypeScript and
Python twin implementations of `<slug>` (<subject>). Each package
has its own `.agent.md`; this file is the index.

The behavior contract that both ports conform to lives at the repo
root in [`SPEC.md`](./SPEC.md). Cross-language parity is enforced by
[`tests/parity/fixtures.json`](./tests/parity/fixtures.json) — every
drift fixture fails CI on either side if the implementations diverge.

## Languages

| Language | Package Count | Marker            |
|----------|---------------|-------------------|
| ts       | 1             | `tsconfig.json`   |
| py       | 1             | `pyproject.toml`  |

## Packages

| Key      | Language | Path           | Twin of           | `.agent.md`                       |
|----------|----------|----------------|-------------------|-----------------------------------|
| <slug>   | ts       | `packages/ts`  | <slug> (py)       | [link](./packages/ts/.agent.md)   |
| <slug>   | py       | `packages/py`  | <slug> (ts)       | [link](./packages/py/.agent.md)   |

Both packages are libraries (`publishable: true`).

## Spec & Examples

- [`SPEC.md`](./SPEC.md) — canonical algorithm and the drift catalog.
- [`examples/sdk/`](./examples/sdk/) — runnable scenarios with
  side-by-side TS + Python code.
- [`examples/api/`](./examples/api/) — per-function contract reference.
- [`tests/parity/fixtures.json`](./tests/parity/fixtures.json) — shared
  cross-language behavior fixtures.

## Cross-Cutting Notes

See [`.agents/`](./.agents/) for:

- [parity.md](./.agents/parity.md) — twin drift catalog and
  aligned-spec rationale.

## Build & CI

The repo-root `make ci` runs both pipelines fail-fast:

```bash
make ci          # both languages (ci-ts → ci-py)
make ci-ts       # TypeScript only
make ci-py       # Python only
```

Each per-package Makefile exposes the standard targets — see the
per-package `.agent.md` files for the full surface.
