---
name: workshop-recaps-consolidate
description: Consolidate multiple workshop-session recap Markdown files (typically produced by the workshop-session-pdf-recap-next skill) into a single unified report. Merges and deduplicates learnings across sessions and emits six sections — Consolidated Recap, Follow-ups, Action Items, Next Steps, Possible Enhancements, and Industry / External Viewpoint. The last section supplements the attendees' material with current external perspective via web research. Use when the user has a set of per-session recap files and wants one portfolio-level summary with an outside-in lens ("consolidate these recaps", "merge my workshop notes", "cross-session summary", "roll up action items").
allowed-tools: Read, Glob, Grep, Bash, Write, WebSearch, WebFetch
argument-hint: "<recap_path_or_glob> [<recap_path_or_glob> ...] [--output <path>] [--no-web]"
disable-model-invocation: false
---

# Workshop Recaps — Consolidate

Ingest two or more per-session recap Markdown files and emit a single unified report that answers the portfolio-level question: *across all these sessions, what did we learn, what must we do, what should we explore next, and how does this map to what the rest of the industry is doing?*

This skill is **read-only** with respect to the input recaps. It produces one new Markdown file.

## Inputs

Arguments are parsed positionally with optional flags at the end:

- `<recap_path_or_glob>` (required, one or more) — absolute path(s) to per-session recap Markdown files, or glob patterns that expand to them (e.g., `/Users/me/recaps/*-recap-*.md`). At least **one** file must resolve. If only one resolves, proceed but flag the output as "single-session consolidation" — cross-session deduplication is N/A.
- `--output <path>` (optional) — absolute path for the consolidated report. If omitted, derive a unique default:
  - Path: `<common_parent_of_inputs>/consolidated-recap-<YYYYMMDD-HHMMSS>-<UUID8>.md`
  - `YYYYMMDD-HHMMSS` from `Bash` with `date +%Y%m%d-%H%M%S` (generated once per run and reused).
  - `UUID8` from `Bash` with `uuidgen | tr -d '-' | cut -c1-8 | tr A-Z a-z`.
  - `<common_parent_of_inputs>` is the longest shared directory prefix of all resolved inputs; fall back to the first input's dirname if the tree is split.
  - Announce the resolved output path to the user before writing.
- `--no-web` (optional) — disables the Industry / External Viewpoint web-research phase. The section is still emitted, but populated only from model knowledge (clearly labelled) and a note that web research was skipped.

If zero input files resolve, or any named path is not a regular readable `.md` file, stop and ask the user to correct the inputs before ingesting anything.

## Expected Input Shape

This skill expects recap files that follow the schema produced by the companion skill `workshop-session-pdf-recap-next`:

- `## Session` — frame block (title, presenters, date, format, page count, scope).
- `## Learning Recap` — grouped `L-00X` entries with page evidence.
- `## Next Steps` — `N-00X` entries tagged Explicit / Implicit / Referenced with effort sizing.
- `## Enhancement Opportunities` — `E-00X` entries anchored to an `L-00X`.
- `## Traceability Index` — table of every ID → evidence.

If a file is missing one or more of these sections, ingest what is present and record the missing section in the consolidated report's provenance table — do not synthesize or backfill missing content.

## Execution Protocol

Run the six phases in order. Each phase's output feeds the next — do not skip.

### Phase 1 — Input Resolution & Session Roster

1. Expand every `<recap_path_or_glob>` via `Glob`. Deduplicate the resolved set (same path listed twice = one entry).
2. For each resolved file, verify via `Bash` with `ls -l` that it is a regular readable `.md`. Reject anything else and stop.
3. Read each file with `Read`. Extract the `## Session` block to build a **Session Roster** — a table of `<session_slug> | title | date | source_file`. Derive `session_slug` deterministically from the file's basename (strip the `-recap-<timestamp>-<uuid>.md` suffix if present; otherwise use the basename without extension). Session slugs must be unique; if two collide, disambiguate with a numeric suffix.
4. Record which sections each file contains (`L`, `N`, `E`, `Traceability`). Missing sections are non-fatal — just tracked.

### Phase 2 — Parse & ID Rewrite

Parse each file's `L-00X`, `N-00X`, and `E-00X` entries into in-memory records. Because IDs from different sessions collide (every file starts at `L-001`), rewrite every ID to be globally unique using the pattern `<session_slug>:<original_id>` (e.g., `claude-agents-workshop:L-004`). Preserve every field from the original entry (category, evidence, source, effort, anchor) plus the new `session` field pointing to its slug.

This rewrite is bookkeeping only — the original per-session files are not modified.

### Phase 3 — Cross-Session Consolidation

For each of the four source categories (Learning, Next Step, Enhancement, plus the new Follow-up and Action Item categorization that this skill derives), deduplicate and group across sessions:

1. **Group by conceptual equivalence**, not string equality. Two entries are the "same" when they describe the same concept, tool, or action even if worded differently. Err toward **splitting** when unsure — conflating distinct items loses information; listing near-duplicates is recoverable by the reader.
2. For each conceptual group, emit **one consolidated entry** with:
   - A new cross-session ID: `CL-00X` (learning), `CF-00X` (follow-up), `CA-00X` (action item), `CN-00X` (next step), `CE-00X` (enhancement).
   - A canonical one-line description (your synthesized phrasing — favor the most specific wording from the source entries).
   - `Sources:` a list of the original globally-unique IDs that rolled into this group (e.g., `claude-agents-workshop:L-004, prompt-caching-session:L-002`).
   - Any source-specific fields preserved: category, effort, anchors — reconcile conflicts by picking the most stringent (e.g., if one source says "Quick" and another says "Medium", keep "Medium").

### Phase 4 — Reclassify Next Steps into Follow-ups, Action Items, and Next Steps

The per-session recaps collapse everything forward-looking into `## Next Steps`. The consolidated report splits this into three distinct buckets so the reader knows what type of response each item calls for. Reclassify every consolidated next-step entry into **exactly one** of:

- **Follow-up** (`CF-00X`) — passive items: resources to read, links to check, questions left unanswered, people to contact. No deliverable. Typical triggers: `Source: Referenced`, or entries whose verb is "read", "review", "watch", "skim", "check out".
- **Action Item** (`CA-00X`) — concrete, assignable work with a clear definition of done. Usually has an owner or deadline implied in the source. Typical triggers: `Source: Explicit` with an imperative verb and a concrete artifact ("complete the lab", "submit the exercise", "build the tool").
- **Next Step** (`CN-00X`) — the learner's progressive path forward: practice, deepen, apply. No fixed deadline, but implies sequential growth. Typical triggers: `Source: Implicit`, or explicit steps framed as "practice", "apply to your own project", "try".

Rules:
- Every consolidated forward-looking entry must land in exactly one bucket. If genuinely ambiguous, prefer **Action Item** over **Next Step** over **Follow-up** (most concrete wins).
- Do **not** invent new items during reclassification. Only redistribute what already exists.

### Phase 5 — Possible Enhancements (Consolidated)

Roll up the `E-00X` entries across sessions under `CE-00X` IDs, grouped by the same categories (Depth / Breadth / Applied / Tooling). Each consolidated enhancement must still anchor to at least one learning — update the anchor to reference the new `CL-00X` ID(s) that subsume the original `L-00X`(s). Unanchored enhancements are dropped (same rule as the source skill).

### Phase 6 — Industry / External Viewpoint

Produce a section that situates the consolidated learnings against current industry perspective. This is the only phase that sources content outside the input files.

1. Identify **3–6 themes** from the consolidated learnings (`CL-00X`) that are worth external comparison. Themes should be broad enough to yield web results (e.g., "agent loop patterns", "prompt caching economics") — not so narrow that no outside signal exists.
2. For each theme, if `--no-web` is **not** set, run `WebSearch` with a focused query. Use `WebFetch` on 1–2 high-signal results (documentation, engineering blog posts, reputable conference talks — prefer primary sources over aggregators). Summarize what the external source adds, contradicts, or confirms in **1–3 sentences**.
3. For each theme, emit:
   ```
   I-00X — <theme name>
     Internal position: <1 sentence summarizing what the sessions taught on this theme, citing CL-00X ID(s)>
     External signal: <1–3 sentences summarizing current industry perspective>
     Sources: [<url> — <publisher>, <url> — <publisher>, …]  (or "model knowledge (no web)" if --no-web)
     Alignment: [Aligned | Diverges | Extends | Contested]
   ```
4. If `--no-web` is set, replace each `External signal` with a model-knowledge summary and label the section header with a note: *"(web research skipped; external signal reflects model knowledge as of the training cutoff)"*.
5. Do **not** fabricate URLs or citations. If `WebSearch` returns nothing relevant for a theme, drop that theme or mark its sources as `none found`.

## Output Contract

Write the consolidated report to `--output` (or the derived default) as a single Markdown document with these top-level sections, in this order:

1. `## Portfolio` — a short frame block: number of sessions consolidated, date range, total unique learnings / follow-ups / action items / next steps / enhancements, web-research on/off.
2. `## Session Roster` — table of every input session (slug, title, date, source file, sections present).
3. `## Consolidated Recap` — `CL-00X` entries grouped by Concepts / Tools / Examples / Quoted Takeaways.
4. `## Follow-ups` — `CF-00X` entries, ordered by source count (items appearing in more sessions first).
5. `## Action Items` — `CA-00X` entries, ordered by Effort (Quick → Deep) within each, source count as tiebreaker.
6. `## Next Steps` — `CN-00X` entries, ordered as a progressive path (foundational practice first, advanced application last — use your judgment based on the learnings they build on).
7. `## Possible Enhancements` — `CE-00X` entries grouped by Depth / Breadth / Applied / Tooling.
8. `## Industry / External Viewpoint` — `I-00X` entries from Phase 6.
9. `## Provenance` — table mapping every new `CL / CF / CA / CN / CE / I` ID to the original globally-unique IDs (and session slugs) that rolled into it, plus a row per input file noting any missing sections.

After writing the file, print a short summary to the conversation: the output file path, per-section counts, date range of the sessions, and the count of industry themes covered (and whether web research ran). Do not repeat the full document inline.

## Operational Boundaries

- **Do not modify the input recap files** or any file in their directories other than the output.
- **Do not invent content.** Every `CL / CF / CA / CN / CE` entry must trace to at least one original `L / N / E` entry via the Provenance table. Every `I-00X` entry must cite a real source URL (or be labelled as model knowledge under `--no-web`).
- **Do not include content beyond the six section types** above (no executive summary, no sentiment analysis, no presenter critiques) unless the user explicitly asks.
- **Do not expand scope to other files.** Only the files resolved in Phase 1 are in play — no sibling scanning, no reading the source PDFs the recaps were derived from.
- **Respect `--no-web`.** When set, make zero web tool calls.
- **Stop and ask** when: zero input files resolve, any input is not a readable `.md`, or the inputs are clearly not workshop-recap shaped (e.g., none of them contain a `## Learning Recap` section — they may be unrelated Markdown).

## Example Invocation

```
/workshop-recaps-consolidate /Users/me/Downloads/recaps/*.md --output /Users/me/Downloads/consolidated.md
```

Or with defaults and a mix of explicit paths and globs:

```
/workshop-recaps-consolidate /Users/me/recaps/agents-*.md /Users/me/recaps/caching-workshop-recap-*.md
```

Expected output skeleton:

```
## Portfolio
- Sessions consolidated: 3
- Date range: 2026-02-14 → 2026-04-02
- Unique learnings: 11 (CL), follow-ups: 4 (CF), action items: 5 (CA), next steps: 6 (CN), enhancements: 7 (CE)
- Industry themes: 4 (I)
- Web research: enabled

## Session Roster
| Slug                        | Title                                 | Date       | File                                    | Sections present  |
|-----------------------------|---------------------------------------|------------|-----------------------------------------|-------------------|
| claude-agents-workshop      | Building Claude Agents — Hands-On     | 2026-02-14 | /Users/me/recaps/agents-recap-*.md      | L, N, E, Trace    |
| prompt-caching-session      | Prompt Caching Deep Dive              | 2026-03-05 | /Users/me/recaps/caching-recap-*.md     | L, N, E, Trace    |
| tool-use-advanced           | Advanced Tool Use Patterns            | 2026-04-02 | /Users/me/recaps/tooluse-recap-*.md     | L, N, Trace (no E)|

## Consolidated Recap

### Concepts & Frameworks
CL-001 — Agent loop: plan → act → observe → reflect
  Sources: claude-agents-workshop:L-001, tool-use-advanced:L-002

### Tools & Techniques
CL-002 — Deferred tool schemas via ToolSearch
  Sources: claude-agents-workshop:L-003, tool-use-advanced:L-005

…

## Follow-ups
CF-001 — Read the Agent SDK reference sections listed on the decks
  Sources: claude-agents-workshop:N-002, tool-use-advanced:N-004

…

## Action Items
CA-001 — Complete the post-workshop lab (build a 3-tool research agent)
  Effort: Medium
  Sources: claude-agents-workshop:N-001

…

## Next Steps
CN-001 — Practice defining tool schemas from scratch before reaching for library helpers
  Sources: claude-agents-workshop:N-003

…

## Possible Enhancements

### Applied
CE-001 — Adapt the agent loop to PR-review against a real repo
  Anchor: CL-001
  Sources: claude-agents-workshop:E-002

…

## Industry / External Viewpoint
I-001 — Agent loop patterns
  Internal position: Sessions teach the classic plan → act → observe → reflect loop (CL-001).
  External signal: Recent industry write-ups emphasize explicit critique/reflection steps and checkpointed observations to reduce hallucinated actions; some teams also introduce a dedicated "verify" phase before acting on tool output.
  Sources: [https://example.com/agents-in-production — ExampleCo Engineering, https://example.com/reflection-patterns — Research Lab]
  Alignment: Extends

…

## Provenance
| Consolidated ID | Original IDs                                        | Notes                          |
|-----------------|-----------------------------------------------------|--------------------------------|
| CL-001          | claude-agents-workshop:L-001, tool-use-advanced:L-002 |                                |
| CA-001          | claude-agents-workshop:N-001                        |                                |
| I-001           | CL-001                                              | External sources: 2            |
…
| File notes      | tool-use-advanced-recap-*.md                        | Missing ## Enhancement section |
```

## Notes on Consolidation Quality

- **Split over splat.** When two entries *might* be the same concept, keeping them separate is safer than merging — the reader can skim duplicates, but lost distinctions are invisible.
- **Cite generously in Provenance.** Every consolidated ID should be reverse-traceable to the exact original ID(s) and session. Without this, the reader cannot verify or drill back into the source PDF.
- **Let the Industry section stay small.** 3–6 themes is the target. More dilutes signal; less understates breadth. Prefer a few well-researched themes over many thin ones.
- **When `--no-web` is set, say so loudly.** Label the section header and every `Sources:` line as model-knowledge so readers do not mistake it for primary research.
