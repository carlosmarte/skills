---
name: project-ployglot-project-scafford
description: Scaffold a polyglot library project as TypeScript + Python twin packages under `packages/ts/` + `packages/py/`, with a shared `SPEC.md`, cross-language `tests/parity/fixtures.json`, side-by-side `examples/sdk/` + `examples/api/` documentation, per-package `Makefile`, and a root orchestrator that exposes `make ci`. Open-source friendly — no organization-specific paths or scopes baked in. Use when starting a new polyglot library, porting a single-language library to a twin, or auditing/regularizing an existing two-language repo against the canonical layout.
tier: project
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, AskUserQuestion
argument-hint: "<slug> [--scope @your-org] [--ts-only|--py-only|--both] [--dry-run]"
disable-model-invocation: false
---

# Polyglot Project Scaffold (TS + Python twins)

Generate the canonical layout for a polyglot library that ships as two
language twins — TypeScript (`packages/ts/`) and Python (`packages/py/`) —
governed by a single behavioral spec and proven by a shared cross-language
parity fixture.

The shape is intentionally open-source-friendly: no internal organization
scopes, no agent-runtime paths, no plan-tree dependencies. Every file
written is something a downstream user can publish to npm + PyPI or fork
into their own repo.

## When to use this skill

- Starting a new library and you want it to have **TypeScript + Python**
  surfaces from day one with parity enforced by tests, not vibes.
- Porting a single-language library to a twin (e.g. you have the TS but
  want the Python twin) and want the cross-language scaffolding —
  `SPEC.md`, parity fixtures, `examples/{sdk,api}/`, root `Makefile` —
  in place before the port.
- Auditing or normalizing an existing two-language repo: comparing the
  current state against `references/reference-structure.md` and writing
  the missing load-bearing files.

Skip when:

- The work needs more than two languages, or a non-library shape (CLI,
  service, multi-package monorepo). Use a different skill for those.
- The repo is already a polyglot SDK with full client/transport/
  middleware/retry layering — that's the SDK paradigms canon, not a
  library scaffold. Use `sdk-paradigms-scaffold` instead.
- You have a feature/story/task plan tree and want plan-driven
  implementation — use `implement-polyglot-project-plan` (sibling skill,
  not part of this open-source pattern).

## Reference structure

The canonical layout this skill produces:

```
<repo-root>/
├── README.md                       # repo intro + per-language quick start
├── SPEC.md                         # canonical behavior — both ports MUST conform
├── LICENSE                         # MIT (or user-supplied)
├── Makefile                        # root orchestrator: ci, ci-ts, ci-py, clean
├── package.json                    # npm workspace marker (workspaces: ["packages/ts"])
├── pyproject.toml                  # Python layout marker (no build, points at packages/py)
├── .gitignore                      # Node + Python + IDE/OS + env ignores
├── .agent.md                       # LLM entry reference (root index)
├── .agent.json                     # machine-readable counterpart of .agent.md
├── .agents/
│   └── parity.md                   # twin drift catalog + intentional asymmetries
├── packages/
│   ├── ts/
│   │   ├── package.json            # the publishable npm package
│   │   ├── tsconfig.json           # strict TS config
│   │   ├── Makefile                # help/install/ci-install/test/lint/build/pack/clean/distclean/ci
│   │   ├── .agent.md               # per-package LLM skill file
│   │   ├── src/
│   │   │   └── index.ts            # public surface — re-exports only
│   │   └── test/
│   │       ├── smoke.test.ts       # the package loads + exports the surface
│   │       └── parity.test.ts      # consumes ../../tests/parity/fixtures.json
│   └── py/
│       ├── pyproject.toml          # the publishable PyPI package
│       ├── Makefile                # uv-aware; falls back to pip+pytest on bare runners
│       ├── README.md               # 1-line pointer to the TS twin
│       ├── .agent.md               # per-package LLM skill file
│       ├── <snake_pkg>/
│       │   ├── __init__.py         # public surface — re-exports only
│       │   └── py.typed            # PEP 561 marker
│       └── tests/
│           ├── __init__.py
│           ├── _helpers.py         # env-isolation utilities for tests
│           ├── test_smoke.py       # the package loads + exports the surface
│           └── test_parity.py      # consumes ../../tests/parity/fixtures.json
├── tests/
│   └── parity/
│       └── fixtures.json           # shared cross-language behavior fixtures
└── examples/
    ├── README.md
    ├── sdk/
    │   ├── README.md               # programmatic embedding scenarios
    │   └── 01-<scenario>.md        # side-by-side TS + Python code per scenario
    └── api/
        ├── README.md               # per-function contract reference
        └── 01-<entry>.md           # signature, inputs, errors per entry
```

See `references/reference-structure.md` for the field-by-field inventory.

## Placeholders

Templates use these placeholders. Resolve every one before writing:

| Placeholder      | Meaning                                                | Example                       |
| ---------------- | ------------------------------------------------------ | ----------------------------- |
| `<slug>`         | Kebab-case package name (used for npm + PyPI names)    | `my-lib`                      |
| `<snake_pkg>`    | Python module directory / import name                  | `my_lib`                      |
| `<scope>`        | Optional npm scope (drop for a flat name)              | `@your-org` or empty          |
| `<repo-name>`    | Top-level repo folder name                             | `my-lib`                      |
| `<author>`       | Author name in package metadata                        | `Jane Doe`                    |
| `<subject>`      | One-phrase domain descriptor for README/SPEC intros    | `concise tagline of behavior` |
| `<surface-list>` | Comma-separated public symbols (used in `.agent.md`)   | `doThing, doOtherThing, ...`  |

Conventions:

- `<slug>` and the npm name match directly. With a scope, the npm name is
  `<scope>/<slug>` (e.g. `@your-org/<slug>`). Without a scope, both
  npm and PyPI publish as `<slug>`.
- `<snake_pkg>` is the Python import name — always derive it from `<slug>`
  by replacing dashes with underscores.
- The user can freely change these post-scaffold; this skill picks
  defaults so the repo boots immediately.

## Workflow

### Step 1 — Resolve scaffold parameters

1. Accept `$ARGUMENTS` of the form `<slug> [--scope @your-org] [--ts-only|--py-only|--both] [--dry-run]`.
2. If `<slug>` is missing, ask via `AskUserQuestion`. Validate it is
   kebab-case (`^[a-z][a-z0-9-]*$`); reject otherwise with a clear
   error.
3. Derive `<snake_pkg>` from `<slug>` (`s/-/_/g`).
4. Resolve `<scope>`: explicit `--scope` flag wins; otherwise leave
   empty (publishes as flat `<slug>`).
5. Default to `--both` packages. Honor `--ts-only` / `--py-only` to
   skip the other tree.
6. Confirm with the user before writing: print the resolved
   placeholders + the file list this run will write.

### Step 2 — Inspect the working directory

1. Run `Glob` on the cwd. If the directory is empty (or contains only
   `.git/`, `LICENSE`, `README.md`), proceed to a fresh scaffold.
2. If `packages/ts/` or `packages/py/` already exist, do **not** overwrite.
   Walk the layout in `references/reference-structure.md` and report
   missing files — write **only** the missing ones, leaving existing
   files untouched.
3. If the repo is clearly not a polyglot library candidate (has its own
   `src/`, monorepo manifest, foreign workspace shape), stop and ask.

### Step 3 — Write root files

In this order, from `references/templates/`:

1. `root-README.md` → `README.md`
2. `root-SPEC.md` → `SPEC.md` (intentionally a stub — the user fills the
   behavior; the structure is what this skill provides)
3. `root-LICENSE` → `LICENSE` (skip if already present)
4. `root-Makefile` → `Makefile`
5. `root-package.json` → `package.json`
6. `root-pyproject.toml` → `pyproject.toml`
7. `root-gitignore` → `.gitignore`
8. `root-agent.md` → `.agent.md`
9. `root-agent.json` → `.agent.json`
10. `root-agents-parity.md` → `.agents/parity.md`

If `--ts-only`, the root `package.json` is still written (it's the
workspace marker). If `--py-only`, write a minimal `package.json` with
empty `workspaces` so the root remains valid; the user can drop it
later.

### Step 4 — Write per-package files

For TypeScript (when `--both` or `--ts-only`):

| Source                                     | Target                                  |
| ------------------------------------------ | --------------------------------------- |
| `packages-ts/package.json`                 | `packages/ts/package.json`              |
| `packages-ts/tsconfig.json`                | `packages/ts/tsconfig.json`             |
| `packages-ts/Makefile`                     | `packages/ts/Makefile`                  |
| `packages-ts/agent.md`                     | `packages/ts/.agent.md`                 |
| `packages-ts/src-index.ts`                 | `packages/ts/src/index.ts`              |
| `packages-ts/test-smoke.test.ts`           | `packages/ts/test/smoke.test.ts`        |
| `packages-ts/test-parity.test.ts`          | `packages/ts/test/parity.test.ts`       |

For Python (when `--both` or `--py-only`):

| Source                                       | Target                                              |
| -------------------------------------------- | --------------------------------------------------- |
| `packages-py/pyproject.toml`                 | `packages/py/pyproject.toml`                        |
| `packages-py/Makefile`                       | `packages/py/Makefile`                              |
| `packages-py/README.md`                      | `packages/py/README.md`                             |
| `packages-py/agent.md`                       | `packages/py/.agent.md`                             |
| `packages-py/snake_pkg-__init__.py`          | `packages/py/<snake_pkg>/__init__.py`               |
| `packages-py/snake_pkg-py.typed`             | `packages/py/<snake_pkg>/py.typed` (empty file)     |
| `packages-py/tests-__init__.py`              | `packages/py/tests/__init__.py` (empty file)        |
| `packages-py/tests-_helpers.py`              | `packages/py/tests/_helpers.py`                     |
| `packages-py/tests-test_smoke.py`            | `packages/py/tests/test_smoke.py`                   |
| `packages-py/tests-test_parity.py`           | `packages/py/tests/test_parity.py`                  |

### Step 5 — Write parity + examples scaffolding

| Source                                       | Target                                  |
| -------------------------------------------- | --------------------------------------- |
| `tests-parity/fixtures.json`                 | `tests/parity/fixtures.json`            |
| `examples/README.md`                         | `examples/README.md`                    |
| `examples/sdk-README.md`                     | `examples/sdk/README.md`                |
| `examples/api-README.md`                     | `examples/api/README.md`                |

The `examples/sdk/01-<scenario>.md` and `examples/api/01-<entry>.md`
files are deliberately not auto-generated — they describe **specific
behavior** of the user's library, which this skill does not know.
The `examples/{sdk,api}/README.md` files include a "How to add a new
example" section the user follows.

### Step 6 — Verify the scaffold boots

After writing, run a smoke check:

```bash
make ci-install
make ci
```

The first run will fail at the parity test (the fixtures file is a
stub) and may fail at the smoke test (the public surface is empty).
That is expected — the skill produces a structurally complete repo,
not a behaviorally complete one. Report the failure clearly so the
user knows what to fill in next:

1. Edit `SPEC.md` to define the behavior contract.
2. Implement the public surface in `packages/ts/src/index.ts` and
   `packages/py/<snake_pkg>/__init__.py` (or sub-modules they
   re-export).
3. Replace the placeholder fixture in `tests/parity/fixtures.json`
   with cases that exercise the surface in both languages.
4. Add scenario files under `examples/sdk/` and `examples/api/`.

### Step 7 — Report

Emit a short summary:

- Resolved placeholders (`<slug>`, `<snake_pkg>`, `<scope>`).
- Files written (count, grouped by tree).
- Files skipped because they already existed.
- Smoke result (`make ci-install` exit, `make ci` exit, with the
  expected stub-failure note if applicable).
- Next-step checklist (the four-step "fill in" list from Step 6).

## Hard rules

- **Never write organization-specific or host-machine-absolute paths
  into a scaffolded file.** This skill is open-source. Use relative
  paths and generic scope placeholders. Do not embed `/Users/...`
  paths anywhere in template output.
- **Never overwrite an existing file** without confirming first. The
  scaffold is additive — if `pyproject.toml` already exists, leave
  it alone and report the skip.
- **Never collapse the twin layout** even if the user only wants one
  language today. Write the full root scaffold so the second twin can
  be added later without restructuring.
- **Never invent the SPEC.** The skill writes a `SPEC.md` stub that
  documents the *structure* of a spec (function inventory table,
  algorithm section, drift table). Concrete behavior is the user's
  job — do not put fake behavior in there.
- **Never skip parity-test wiring.** Even with empty fixtures, both
  `parity.test.ts` and `test_parity.py` must be written so adding a
  fixture entry later is the only required step to expand parity
  coverage.
- **Do not push, publish, tag, or open PRs** unless the user
  explicitly asks.

## Inputs and arguments

- `$ARGUMENTS` shape: `<slug> [--scope @your-org] [--ts-only|--py-only|--both] [--dry-run]`
- `--scope` — optional npm scope. Without it, the npm name is the bare
  `<slug>`.
- `--ts-only` / `--py-only` — write only one language tree. Default
  is both. The root scaffold (`Makefile`, `package.json`,
  `pyproject.toml`, `SPEC.md`, etc.) is always written.
- `--dry-run` — print the resolved placeholders and the source →
  target file map without calling `Write`. Useful to confirm the
  layout before committing to a scaffold.

## Examples

All examples below use `<your-slug>` as the placeholder for whatever
kebab-case name the user picks. Substitute it in real invocations.

**Bootstrap a fresh polyglot library, both languages, no scope:**

```
/ployglot-project-scafford <your-slug>
```

Writes the full layout. `package.json` declares the npm name as
`<your-slug>`. `pyproject.toml` declares the PyPI name as
`<your-slug>`. Python module derives by replacing dashes with
underscores.

**Bootstrap with an npm scope:**

```
/ployglot-project-scafford <your-slug> --scope @your-org
```

`package.json` becomes `@your-org/<your-slug>`; PyPI name stays the
unscoped `<your-slug>` (PyPI has no scopes).

**Add the Python twin to an existing TS-only repo:**

```
/ployglot-project-scafford <your-slug> --py-only
```

Skill detects the existing `packages/ts/` and only writes the
`packages/py/` tree, the Python-side entries in `tests/parity/`, and
the Python columns in `examples/`. Existing root files are left alone.

**Preview before writing:**

```
/ployglot-project-scafford <your-slug> --dry-run
```

Prints the source → target map for ~25 files and the resolved
placeholder values, without touching the disk.

## See also

- `references/reference-structure.md` — field-by-field inventory of the
  layout (what each file is for, why it exists).
- `references/templates/README.md` — the source → target-path map and
  placeholder substitution rules.
- Sibling skills: `sdk-paradigms` (canon for richer SDK shapes than a
  pure library), `ployglot-agentmd-usages` (regenerates `.agent.md`
  index after the surface evolves).
