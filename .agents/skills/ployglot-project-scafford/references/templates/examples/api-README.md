# API Examples

The package's public surface contract — function signatures, parameter
semantics, return types, and the exhaustive list of failure modes.

## Surface kind

Document the surface kind here. For a pure-function library, it's
"synchronous function calls on a module export." For a class-based
SDK, it's "method calls on an instance returned by `createClient(...)`."
Match the description to whatever shape the user's library exposes.

Cross-language behavior is governed by
[`SPEC.md`](../../SPEC.md) and enforced by
[`tests/parity/fixtures.json`](../../tests/parity/fixtures.json).

## Entries

| #   | Entry                               | Description                                   |
| --- | ----------------------------------- | --------------------------------------------- |
| _Add entries as numbered files in this directory: `01-<name>.md`, `02-<name>.md`, ..._ ||

## How to add a new entry

1. Pick the next free number (`NN`) and a kebab-case slug for the
   entry. Match the public symbol's name (camelCase TS or
   snake_case Python — pick one and document the other in the
   entry).
2. Create `NN-<entry-name>.md` with the conventional sections:
   - **Signature** — TS line, then Python line.
   - **Inputs** — parameter table.
   - **Returns** — type + meaning.
   - **Errors** — what raises / throws and why.
   - **Notes** — any drift, intentional asymmetry, or links into
     `SPEC.md`.
3. Add a row to the table above.
