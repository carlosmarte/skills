# <slug>

Polyglot library — TypeScript and Python twin packages that share a single
canonical spec. <subject>.

## Layout

```
.
├── packages/
│   ├── ts/                    # TypeScript package (<scope-prefix><slug>)
│   │   ├── src/index.ts
│   │   └── test/
│   └── py/                    # Python package (<slug>)
│       ├── <snake_pkg>/
│       └── tests/
├── tests/
│   └── parity/
│       └── fixtures.json      # Shared cross-language behavior fixtures
├── examples/
│   ├── sdk/                   # Programmatic embedding scenarios
│   └── api/                   # Per-function contract reference
├── SPEC.md                    # Canonical behavior — both ports MUST conform
├── package.json               # npm workspace marker
├── pyproject.toml             # Python layout marker
└── Makefile                   # Root orchestrator (ci-ts, ci-py, ci)
```

## Spec

See [`SPEC.md`](SPEC.md) — every behavioral question is answered there.

## Quick start

**TypeScript**

```bash
npm install --workspaces                 # at repo root
cd packages/ts && npm test
```

**Python**

```bash
cd packages/py
python -m pip install -e ".[dev]"
pytest -q
```

## Running CI

`make ci` at the repo root runs both per-package pipelines fail-fast:

```bash
make ci          # both languages
make ci-ts       # TypeScript only
make ci-py       # Python only
```

## Cross-language parity

Cross-language behavior is enforced by the shared fixtures at
[`tests/parity/fixtures.json`](tests/parity/fixtures.json), consumed by:

- [`packages/ts/test/parity.test.ts`](packages/ts/test/parity.test.ts)
- [`packages/py/tests/test_parity.py`](packages/py/tests/test_parity.py)

If either side's output diverges from the fixture's `expected` value,
the local test fails.

## License

MIT — see [`LICENSE`](LICENSE).
