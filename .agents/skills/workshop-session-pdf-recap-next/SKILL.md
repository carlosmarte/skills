---
name: workshop-session-pdf-recap-next
description: Extract content from a workshop session PDF and produce a structured recap focused on (1) what was learned, (2) next steps, and (3) possible enhancements. Ingests a single PDF file path, parses session material (slides, transcripts, exercises, Q&A), and emits a Markdown report with Learning Recap, Next Steps, and Enhancement Opportunities sections with page-level traceability. Use when the user asks to "summarize a workshop", "recap a training PDF", "pull next steps from a session deck", or provides a workshop/seminar/tutorial PDF and wants a learn-and-act summary.
allowed-tools: Read, Glob, Bash, Write
argument-hint: "<pdf_path> [output_path]"
disable-model-invocation: false
---

# Workshop Session PDF — Recap & Next Steps

Extract content from a single workshop session PDF and produce a focused recap organized around three questions:

1. **What was learned?** — the durable takeaways, concepts, tools, and techniques surfaced in the session.
2. **What are the next steps?** — the actions, follow-ups, and practice work the attendee should do after the session.
3. **What enhancements could be added?** — improvements, extensions, or deeper explorations beyond the material presented.

This skill is **read-only** with respect to the input PDF. It produces a Markdown report and does not modify the source file.

## Inputs

Arguments are parsed positionally:

- `<pdf_path>` (required) — absolute path to a single `.pdf` file containing workshop session material (slides, handouts, transcript, lab guide, or any combination).
- `[output_path]` (optional) — absolute path where the recap Markdown should be written. If omitted, derive a unique default so repeated runs never overwrite a prior recap:
  - Path: `<pdf_path_dirname>/<pdf_basename>-recap-<YYYYMMDD-HHMMSS>-<UUID8>.md`
  - `YYYYMMDD-HHMMSS` is the local-time timestamp at the start of the run (generate once via `Bash` with `date +%Y%m%d-%H%M%S` and reuse).
  - `UUID8` is an 8-hex-char random suffix (generate via `Bash` with `uuidgen | tr -d '-' | cut -c1-8 | tr A-Z a-z`).
  - Announce the resolved output path to the user before writing.

If `<pdf_path>` is missing, not a file, not readable, or does not end in `.pdf`, stop and ask the user to supply a valid path. Do not attempt to infer the PDF from nearby files.

## Execution Protocol

Run the five phases in order. Each phase's output feeds the next — do not skip.

### Phase 1 — PDF Ingestion

1. Verify the PDF exists and is readable (`Bash` with `ls -l <pdf_path>` is sufficient).
2. Determine the page count before reading. Use `Bash` with `mdls -name kMDItemNumberOfPages <pdf_path>` on macOS, or fall back to reading the PDF incrementally.
3. Read the PDF content via the `Read` tool:
   - For PDFs ≤ 10 pages: read without the `pages` parameter.
   - For PDFs > 10 pages: read in ranges of up to 20 pages per call (e.g., `pages: "1-20"`, then `pages: "21-40"`, …) until all pages are consumed. The Read tool requires the `pages` parameter for PDFs longer than 10 pages.
4. While reading, capture page-anchored notes in a working scratchpad:
   - Session title, presenter(s), date, venue (if shown on cover/footer).
   - Agenda or table of contents (if present).
   - Per-section topics, key terms, diagrams, and code/lab references, each tagged with its page number(s).
   - Explicit "takeaways", "key points", "summary", "homework", "next steps", "further reading" slides — these are primary source material for the recap and must be captured verbatim or near-verbatim.
5. Do **not** fabricate content. If a detail is not visible in the PDF, mark it `NOT IN SOURCE` rather than inferring from training data or prior conversations.

### Phase 2 — Session Frame

Produce a short session frame block (emitted later as `## Session`) capturing:

- **Title** — from the cover slide or document metadata; `NOT IN SOURCE` if absent.
- **Presenter(s)** — as printed; `NOT IN SOURCE` if absent.
- **Date / Event** — as printed; `NOT IN SOURCE` if absent.
- **Format** — e.g., slide deck, lab guide, workbook, transcript, hybrid (infer from the structure you observed, not the filename).
- **Page count** — total pages read.
- **Scope** — one sentence describing the stated subject of the session.

### Phase 3 — Learning Recap Extraction

Under `## Learning Recap`, extract what was actually taught. Each entry must be traceable.

Group by:

- **Concepts & Frameworks** — ideas, models, mental frameworks introduced.
- **Tools & Techniques** — specific tools, commands, libraries, or step-by-step techniques demonstrated.
- **Examples & Exercises** — worked examples, labs, demos, or exercises walked through.
- **Quoted Takeaways** — any explicit "key point", "remember this", or summary bullets from the source, quoted near-verbatim.

For each entry emit:

```
L-00X — <one-line description of the learning>
  Evidence: <pdf_basename>:p<page>[, p<page>…]
  Category: [Concept | Tool | Example | Takeaway]
```

Do not include every bullet on every slide — select the items that a motivated attendee would transcribe into their own notes. Aim for a dense but curated list, not an exhaustive transcript.

### Phase 4 — Next Steps Extraction

Under `## Next Steps`, capture the actions the session implies or prescribes for the attendee. Sources of next steps, in priority order:

1. **Explicit** — slides literally titled "Next Steps", "Homework", "Action Items", "Try This", "Further Reading", "Exercises to Do". These are authoritative and must be captured.
2. **Implicit** — actions the material strongly implies (e.g., a tool was introduced but not practiced → "practice with <tool>"; a concept was taught with a promised follow-up → "review <topic>").
3. **Referenced resources** — links, books, docs, repos, or papers cited in the deck that the attendee should consult.

For each entry emit:

```
N-00X — <imperative action starting with a verb>
  Source: [Explicit | Implicit | Referenced]
  Evidence: <pdf_basename>:p<page> (or "derived from p<page> — <reason>" for Implicit)
  Effort: [Quick (<1h) | Medium (half-day) | Deep (multi-day)]
```

If the session prescribed zero explicit next steps and you cannot defensibly derive any implicit ones, say so — do not manufacture tasks.

### Phase 5 — Enhancement Opportunities

Under `## Enhancement Opportunities`, propose extensions **beyond** the material. These are your recommendations, not content from the PDF. Each proposal must be anchored to something the session did present — this prevents drift into unrelated territory.

Categorize each as:

- **Depth** — go deeper on a topic the session introduced but did not fully develop.
- **Breadth** — explore an adjacent topic the session gestured at but did not cover.
- **Applied** — apply the learning to a realistic project or scenario not used in the session.
- **Tooling** — automate, script, or templatize a manual process demonstrated in the session.

For each entry emit:

```
E-00X — <proposed enhancement>
  Category: [Depth | Breadth | Applied | Tooling]
  Anchor: <which learning this builds on — reference an L-00X ID from Phase 3>
  Rationale: <one sentence: why this adds value beyond the session>
```

If an enhancement cannot be anchored to an L-00X ID, drop it — unanchored suggestions are out of scope.

## Output Contract

Write the recap to `<output_path>` (or the default derived path) as a single Markdown document with these top-level sections, in this order:

1. `## Session` — frame block from Phase 2.
2. `## Learning Recap` — grouped L-00X entries from Phase 3.
3. `## Next Steps` — N-00X entries from Phase 4, ordered: all Explicit first, then Implicit, then Referenced.
4. `## Enhancement Opportunities` — E-00X entries from Phase 5, grouped by category.
5. `## Traceability Index` — a table mapping every L / N / E ID to its page reference (or anchor ID for enhancements) and its category, so each row is verifiable against the source PDF.

After writing the file, print a one-paragraph summary to the conversation: the output file path, the counts of L / N / E entries, and one sentence naming the session's central theme. Do not repeat the full document inline.

## Operational Boundaries

- **Do not modify the source PDF** or any file in its directory other than the output recap.
- **Do not read files other than the specified PDF.** No sibling scanning, no prior-session comparisons, no repo exploration. The input is one PDF; the output is one Markdown file.
- **Do not invent content.** Every L-00X and N-00X (Explicit/Referenced) entry must cite a page. Implicit next steps must name the page that implied them. Enhancements must anchor to an L-00X ID.
- **Do not expand scope beyond recap + next steps + enhancements.** Resist adding glossaries, cheat sheets, quizzes, or presenter critiques unless the user explicitly asks.
- **Stop and ask** when: the PDF is unreadable, encrypted, empty, image-only with no extractable text (OCR is out of scope), or clearly not workshop material (e.g., a legal contract, invoice, novel).

## Example Invocation

```
/workshop-session-pdf-recap-next /Users/me/Downloads/claude-agents-workshop.pdf
```

Expected output skeleton (written to, e.g., `/Users/me/Downloads/claude-agents-workshop-recap-20260421-143522-a1b2c3d4.md`):

```
## Session
- Title: Building Claude Agents — Hands-On Workshop
- Presenter(s): J. Doe, A. Smith
- Date / Event: 2026-03-14, Anthropic DevDay
- Format: Slide deck + lab guide (hybrid)
- Page count: 42
- Scope: Introduces the Agent SDK and walks attendees through building a research agent end-to-end.

## Learning Recap

### Concepts & Frameworks
L-001 — Agent loop: plan → act → observe → reflect
  Evidence: claude-agents-workshop.pdf:p4, p5
  Category: Concept

L-002 — Tool-use contract: schema-first tool definitions
  Evidence: claude-agents-workshop.pdf:p11
  Category: Concept

### Tools & Techniques
L-003 — Using `ToolSearch` to defer schema loading until needed
  Evidence: claude-agents-workshop.pdf:p17, p18
  Category: Tool

### Examples & Exercises
L-004 — Lab: build a 3-tool research agent that summarizes a URL
  Evidence: claude-agents-workshop.pdf:p22-p27
  Category: Example

### Quoted Takeaways
L-005 — "Prefer small, composable tools over one monolithic tool." (slide 31)
  Evidence: claude-agents-workshop.pdf:p31
  Category: Takeaway

## Next Steps
N-001 — Complete the post-workshop lab in the provided repo
  Source: Explicit
  Evidence: claude-agents-workshop.pdf:p40
  Effort: Medium (half-day)

N-002 — Read the Agent SDK reference docs sections listed on slide 41
  Source: Referenced
  Evidence: claude-agents-workshop.pdf:p41
  Effort: Quick (<1h)

N-003 — Practice defining a new tool schema from scratch
  Source: Implicit
  Evidence: derived from p11 — tool-use contract was introduced but not rehearsed by the attendee
  Effort: Quick (<1h)

## Enhancement Opportunities

### Depth
E-001 — Add structured output (JSON schema) to the research agent from the lab
  Category: Depth
  Anchor: L-004
  Rationale: The lab stops at free-text output; JSON output unlocks downstream automation.

### Applied
E-002 — Adapt the agent loop to a PR-review use case against a real repo
  Category: Applied
  Anchor: L-001
  Rationale: The session used a research example; porting the loop to code review tests generalization.

### Tooling
E-003 — Package the 3-tool stack as a reusable npm module with tests
  Category: Tooling
  Anchor: L-003
  Rationale: Turns one-off lab code into a durable library the attendee can reuse.

## Traceability Index
| ID    | Type        | Category / Source  | Evidence                                |
|-------|-------------|--------------------|-----------------------------------------|
| L-001 | Learning    | Concept            | claude-agents-workshop.pdf:p4, p5       |
| L-002 | Learning    | Concept            | claude-agents-workshop.pdf:p11          |
| L-003 | Learning    | Tool               | claude-agents-workshop.pdf:p17, p18     |
| L-004 | Learning    | Example            | claude-agents-workshop.pdf:p22-p27      |
| L-005 | Learning    | Takeaway           | claude-agents-workshop.pdf:p31          |
| N-001 | Next Step   | Explicit           | claude-agents-workshop.pdf:p40          |
| N-002 | Next Step   | Referenced         | claude-agents-workshop.pdf:p41          |
| N-003 | Next Step   | Implicit           | derived from p11                        |
| E-001 | Enhancement | Depth → L-004      | anchor only                             |
| E-002 | Enhancement | Applied → L-001    | anchor only                             |
| E-003 | Enhancement | Tooling → L-003    | anchor only                             |
```

## Notes on PDF Handling

- The `Read` tool natively supports PDF. For PDFs > 10 pages, the `pages` parameter is **required** (max 20 pages per call). Plan your reads before starting so you cover every page exactly once.
- If the PDF is image-only (scanned slides with no text layer), the `Read` tool will return little or no text. In that case, stop and report — OCR is out of scope for this skill.
- Treat the PDF basename (without extension) as the default slug when constructing the output path and when labelling evidence.
