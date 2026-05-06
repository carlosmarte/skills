# Scaffolding templates

Copy-paste sources for every load-bearing file the
`ployglot-project-scafford` skill writes. Each template mirrors a
canonical file in the reference layout (see
`../reference-structure.md`).

Templates use `<placeholder>` tokens that the skill substitutes at
write time. Substitute every occurrence — leftover placeholders are
treated as a scaffolding bug.

## Placeholder map

| Token            | Meaning                                              | Example                       |
| ---------------- | ---------------------------------------------------- | ----------------------------- |
| `<slug>`         | Kebab-case package name (npm + PyPI)                 | `my-lib`                      |
| `<snake_pkg>`    | Python module / import name                          | `my_lib`                      |
| `<scope>`        | npm scope, with leading `@`. Drop entirely if absent | `@your-org` or empty          |
| `<scope-prefix>` | `<scope>/` if scoped, else empty (used in `name`)    | `@your-org/`                  |
| `<repo-name>`    | Top-level repo folder name                           | `my-lib`                      |
| `<author>`       | Author name in package metadata                      | `Jane Doe`                    |
| `<subject>`      | One-phrase domain descriptor                         | `concise tagline of behavior` |
| `<surface-list>` | Comma-separated public symbols (used in `.agent.md`) | `doThing, doOtherThing, ...`  |
| `<year>`         | Current year (for `LICENSE`)                         | `2026`                        |

## Source → target path map

Files in this tree have flat names because some target paths use dots
or slashes that are inconvenient on disk. The skill writes them to the
target path shown.

### Root

| Source                       | Target              |
| ---------------------------- | ------------------- |
| `root-README.md`             | `README.md`         |
| `root-SPEC.md`               | `SPEC.md`           |
| `root-LICENSE`               | `LICENSE`           |
| `root-Makefile`              | `Makefile`          |
| `root-package.json`          | `package.json`      |
| `root-pyproject.toml`        | `pyproject.toml`    |
| `root-gitignore`             | `.gitignore`        |
| `root-agent.md`              | `.agent.md`         |
| `root-agent.json`            | `.agent.json`       |
| `root-agents-parity.md`      | `.agents/parity.md` |

### TypeScript package

| Source                              | Target                              |
| ----------------------------------- | ----------------------------------- |
| `packages-ts/package.json`          | `packages/ts/package.json`          |
| `packages-ts/tsconfig.json`         | `packages/ts/tsconfig.json`         |
| `packages-ts/Makefile`              | `packages/ts/Makefile`              |
| `packages-ts/agent.md`              | `packages/ts/.agent.md`             |
| `packages-ts/src-index.ts`          | `packages/ts/src/index.ts`          |
| `packages-ts/test-smoke.test.ts`    | `packages/ts/test/smoke.test.ts`    |
| `packages-ts/test-parity.test.ts`   | `packages/ts/test/parity.test.ts`   |

### Python package

| Source                                | Target                                            |
| ------------------------------------- | ------------------------------------------------- |
| `packages-py/pyproject.toml`          | `packages/py/pyproject.toml`                      |
| `packages-py/Makefile`                | `packages/py/Makefile`                            |
| `packages-py/README.md`               | `packages/py/README.md`                           |
| `packages-py/agent.md`                | `packages/py/.agent.md`                           |
| `packages-py/snake_pkg-__init__.py`   | `packages/py/<snake_pkg>/__init__.py`             |
| `packages-py/snake_pkg-py.typed`      | `packages/py/<snake_pkg>/py.typed`                |
| `packages-py/tests-__init__.py`       | `packages/py/tests/__init__.py`                   |
| `packages-py/tests-_helpers.py`       | `packages/py/tests/_helpers.py`                   |
| `packages-py/tests-test_smoke.py`     | `packages/py/tests/test_smoke.py`                 |
| `packages-py/tests-test_parity.py`    | `packages/py/tests/test_parity.py`                |

### Parity + examples

| Source                                | Target                                |
| ------------------------------------- | ------------------------------------- |
| `tests-parity/fixtures.json`          | `tests/parity/fixtures.json`          |
| `examples/README.md`                  | `examples/README.md`                  |
| `examples/sdk-README.md`              | `examples/sdk/README.md`              |
| `examples/api-README.md`              | `examples/api/README.md`              |

## Substitution rules

1. The skill walks the template content and replaces every
   `<placeholder>` token with the resolved value.
2. `<scope>` and `<scope-prefix>` interact: when no scope is supplied,
   both expand to the empty string. This keeps generated package
   names valid even without a scope.
3. `<snake_pkg>` is always derived from `<slug>` by replacing dashes
   with underscores. The skill never asks the user to spell it.
4. Filenames that contain the literal `<snake_pkg>` token are
   renamed at write time too — `packages-py/snake_pkg-__init__.py`
   becomes `packages/py/<resolved_snake>/__init__.py`.
