# Reference Structure — Polyglot Library Layout

Field-by-field inventory of the canonical polyglot library this skill
scaffolds. The shape is a two-language package — TypeScript twin
under `packages/ts/`, Python twin under `packages/py/`, single
behavioral spec, single cross-language parity fixture, side-by-side
examples.

This document explains **what each file is for** and **why it exists**.
For copy-paste sources, see `templates/`.

## Layered view

| Layer       | Files                                                                                                                  | Purpose                                                               |
| ----------- | ---------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| Root        | `README.md`, `SPEC.md`, `LICENSE`, `Makefile`, `package.json`, `pyproject.toml`, `.gitignore`, `.agent.md`, `.agent.json` | Single source of truth for behavior + the orchestrator               |
| Per-package | `packages/{ts,py}/...`                                                                                                 | The publishable artifacts — one per language                          |
| Parity      | `tests/parity/fixtures.json`                                                                                           | Cross-language behavior contract — both ports load it                 |
| Examples    | `examples/{sdk,api}/...`                                                                                               | User-facing usage docs — programmatic embedding + per-function ref    |
| Agent docs  | `.agents/parity.md`, `packages/{ts,py}/.agent.md`                                                                      | LLM-readable index: what's in the repo, where parity lives            |

## Root files

### `README.md`

Repo intro, quick-start blocks for both languages, link to `SPEC.md`,
link to the parity fixtures, quick `make ci` recipe.

### `SPEC.md`

Canonical behavior. Both ports MUST conform. Conventional sections:

- **Function inventory** — table mapping concept → TypeScript signature
  → Python signature.
- **Algorithm** — pseudocode of the core behavior, in language-agnostic
  form.
- **Drift catalog** — bookkeeping of caller-visible differences that
  existed during early development. Each row is `D<n>: concern → canonical
  rule → which side needed the change`. Once both ports conform, the
  drift becomes a parity fixture.

### `LICENSE`

MIT by default. The skill writes MIT only if no `LICENSE` already exists.

### `Makefile`

Root orchestrator. Three load-bearing targets:

- `make ci` — runs `ci-ts` then `ci-py` fail-fast.
- `make ci-ts` — `cd packages/ts && make ci`.
- `make ci-py` — `cd packages/py && make ci`.
- `make clean` — fans out to both packages.
- `make ci-install` — runs `ci-install` in both packages.

### `package.json`

Root npm workspace marker. Always `private: true`. Single `workspaces`
entry: `["packages/ts"]`. No build scripts at the root — those live in
the leaf package.

### `pyproject.toml`

Root Python layout marker. Not a build target itself. Carries
metadata: `python-package-root`, `typescript-package-root`, `spec`,
`parity-fixtures`. The actual `[project]` block lives in
`packages/py/pyproject.toml`.

### `.gitignore`

Combined Node + Python + IDE/OS + env ignores. Covers
`node_modules/`, `dist/`, `coverage/`, `__pycache__/`, `.venv/`,
`*.egg-info/`, `.ruff_cache/`, `.mypy_cache/`, `.pytest_cache/`,
`.DS_Store`, `.idea/`, `.vscode/`, `.env*`, lockfile staging.

### `.agent.md`

LLM entry reference for the repo. Tells downstream agents:

- The repo is a polyglot library with N packages across 2 languages.
- Where the spec lives.
- Where parity is enforced.
- Where per-package skill files live.

### `.agent.json`

Machine-readable mirror of `.agent.md`. Used by tooling that wants a
structured view of the repo without parsing markdown.

### `.agents/parity.md`

The twin drift catalog. Same content as the `SPEC.md` drift table, but
with a "current state" view per drift entry: which side already
conforms, which side still needs alignment, link to the fixture that
proves it.

## Per-package files — TypeScript

### `packages/ts/package.json`

The publishable npm package. Key fields:

- `name`: `<scope>/<slug>` if scoped, else `<slug>`.
- `type`: `"module"`. ESM-only.
- `main` + `exports`: point at `./dist/index.js`.
- `types`: `./dist/index.d.ts`.
- `files`: `["dist/", "README.md", "LICENSE"]`. Tarball is
  source-free.
- `scripts.test`: `node --test --import tsx 'test/**/*.test.ts'`.
- `engines.node`: `>=20`.
- `devDependencies`: `typescript`, `tsx`, `@types/node`.

### `packages/ts/tsconfig.json`

Strict TypeScript config:

- `target: "ES2022"`, `module: "NodeNext"`,
  `moduleResolution: "NodeNext"`.
- `strict: true`, `noImplicitOverride: true`,
  `noUncheckedIndexedAccess: true`, `exactOptionalPropertyTypes: true`.
- `outDir: "./dist"`, `rootDir: "./src"`.
- `declaration: true`, `declarationMap: true`, `sourceMap: true`.

### `packages/ts/Makefile`

Standard 10-target wrapper around `npm` + `tsc` + `node:test`:

`help`, `print-env`, `install`, `ci-install`, `test`, `test-watch`,
`lint` (= `tsc --noEmit`), `build`, `pack`, `clean`, `distclean`,
`ci` (= `ci-install lint test build`).

### `packages/ts/.agent.md`

Per-package skill file:

- Frontmatter with `name`, `kind: library`, `language: ts`, `path`,
  `twin_of`, `publishable: true`.
- Sections: Install, Import Surface, Canonical Usage, Integration, CI &
  Tests, Twin pointer.

### `packages/ts/src/index.ts`

The public surface. Re-exports only — implementation lives in
sibling modules under `src/`. Keeps the import surface stable across
internal refactors.

### `packages/ts/test/smoke.test.ts`

Asserts the package loads and the named exports are present. Catches
typos in re-exports + broken builds. Uses `node:test`.

### `packages/ts/test/parity.test.ts`

Loads `../../tests/parity/fixtures.json`, iterates cases,
dispatches to the function named in each case, asserts
`expected === actual`. The single rule: if either port deviates, the
local test fails.

## Per-package files — Python

### `packages/py/pyproject.toml`

The publishable PyPI package. Hatchling-backed:

- `[project] name`: `<slug>` (no scope; PyPI doesn't have scopes).
- `requires-python`: `>=3.11,<3.13`.
- `[project.optional-dependencies] dev`: `pytest`, `mypy`, `ruff`,
  `build`.
- `[tool.hatch.build.targets.wheel] packages = ["<snake_pkg>"]`.
- `[tool.pytest.ini_options] testpaths = ["tests"]`.
- `[tool.mypy] strict = true`.
- `[tool.ruff.lint] select = ["E", "F", "W", "I", "N", "UP", "B", "C4", "SIM"]`.

### `packages/py/Makefile`

Same target surface as the TS Makefile, but uv-aware: prefers `uv` for
install/test/lint/build when present, falls back to plain
`python -m pip` + `pytest` + `python -m build` on bare CI runners.

### `packages/py/README.md`

One-line pointer to the TS twin. The publishable README of the
Python package — keep it lean; the canonical behavior lives in
`SPEC.md` at the repo root.

### `packages/py/.agent.md`

Per-package skill file. Same shape as the TS `.agent.md`, with
language-appropriate import + install snippets.

### `packages/py/<snake_pkg>/__init__.py`

Public surface. Re-exports only. Sets `__all__` explicitly and
alphabetized — keeps dunder-tooling happy and import errors
discoverable.

### `packages/py/<snake_pkg>/py.typed`

PEP 561 marker (empty file). Tells downstream tooling the package
ships type information.

### `packages/py/tests/__init__.py`

Empty file — makes pytest treat `tests/` as a package and lets
`_helpers` import deterministically.

### `packages/py/tests/_helpers.py`

Shared test utilities. Canonical contents: an `env_isolated`
context-manager that snapshots `os.environ`, lets the test mutate
it, restores on exit. Both `test_smoke.py` and `test_parity.py` use
it.

### `packages/py/tests/test_smoke.py`

Asserts the package imports and the named exports are present.
Mirror of the TS smoke test.

### `packages/py/tests/test_parity.py`

Loads `../../tests/parity/fixtures.json`, iterates cases,
dispatches by `case["function"]`, asserts `expected == actual`.
Mirror of the TS parity test.

## Parity fixtures

### `tests/parity/fixtures.json`

The cross-language behavior contract. Each entry:

```jsonc
{
  "id": "C1-arg-tier-wins",
  "function": "resolve",
  "inputs": { /* function-shaped — both ports decode it the same way */ },
  "expected": <value the spec says the function returns>,
  "notes": "Short rationale; ties back to a SPEC.md row"
}
```

Both `parity.test.ts` and `test_parity.py` load this file at test
time. A drift on either side fails locally — no CI mediation needed.

The skill ships with a placeholder fixture (`C0-placeholder`) so the
parity tests parse but assert nothing meaningful. Replace it during
implementation.

## Examples

### `examples/README.md`

Top of the examples tree. Describes the two surface kinds — `sdk/`
(programmatic embedding) and `api/` (per-function contract reference).
Sets the convention that every scenario shows TS and Python
side-by-side.

### `examples/sdk/README.md`

Programmatic embedding scenarios. Each scenario is a numbered file:
`01-<name>.md`, `02-<name>.md`. The scenario template expects a
**Goal**, **Prerequisites**, **Code** (TS + Python), **Expected
outcome** sections.

### `examples/api/README.md`

Per-function contract reference. One entry per public function:
**Signature** (TS + Python), **Inputs**, **Returns**, **Errors**,
**Notes**. Useful for downstream LLMs that need the function-level
contract without parsing source.

## How the pieces hold together

- The user edits `SPEC.md`. That document is the only thing both ports
  must conform to.
- Both ports implement the surface and re-export from
  `src/index.ts` / `<snake_pkg>/__init__.py`.
- Drifts the user discovers go into `SPEC.md`'s drift table and become
  fixtures in `tests/parity/fixtures.json`.
- Both `parity.test.ts` and `test_parity.py` consume the fixtures.
  They prove the spec is honored on both sides — every test run.
- `.agent.md` files are descriptive, not prescriptive. They make the
  surface readable to LLMs and downstream tooling without re-deriving
  it from source.
- `examples/` makes the same surface readable to humans.
- `Makefile` orchestrates the loop: `make ci` runs both per-package
  pipelines fail-fast.
