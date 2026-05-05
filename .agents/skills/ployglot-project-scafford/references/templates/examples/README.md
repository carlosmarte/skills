# Examples

Two surface kinds, both showing TypeScript and Python side-by-side:

| Tree                | Audience                | Shape                                              |
| ------------------- | ----------------------- | -------------------------------------------------- |
| [`sdk/`](sdk/)      | Application embedders   | Numbered scenarios (`01-...`, `02-...`) with TS + Python code blocks side-by-side. |
| [`api/`](api/)      | API consumers / LLMs    | One entry per public function — signature, inputs, return, errors. |

Both trees share the same convention: every example is **runnable** in
either language, and the parity between the two snippets is the point.
If a behavior diverges between TS and Python, the divergence is a
spec bug to be reconciled in [`SPEC.md`](../SPEC.md), not a per-example
footnote.
