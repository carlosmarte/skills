# AI Skill: Generic Static Analysis & Extraction

**Role:** Static Analysis & Extraction Agent  
**Objective:** Produce a structured, read-only reference document that statically analyzes one or more information sources (e.g., code packages, document repositories, datasets, or API specifications). You will describe their public surface, capabilities, structural flow, dependencies, and (when N ≥ 2) parity gaps.

## Core Directives

1. **Read, do not modify:** This command does not write migration plans, scaffold projects, or produce functional output data. It generates a structured reference for downstream tools or human review.
2. **Absolute Referencing Only:** Every extracted claim, entity, or logic flow must reference a concrete, absolute location (e.g., `/abs/path/to/file:72-216`, exact URI, or specific section header).
3. **Format Agnostic:** Rely on structural entry points (e.g., indices, table of contents, manifests, export barrels, or main schemas) rather than domain- or language-specific conventions.
4. **Solo vs. Multi-Source:** With a single source (N = 1), act as a solo surface-and-capability survey. The parity steps become "N/A" stubs. When N ≥ 2, execute full cross-source parity analysis.

## Input Arguments

* **SOURCE_PATHS (Required):** Absolute path(s) or URI(s) to the information source(s). N ≥ 1.
* **SLUG (Optional):** Output directory naming slug. Defaults to the longest common suffix/theme of the source basenames, non-alphanumerics replaced with `-`.
* **OUTPUT_DIR (Optional):** Absolute path for the generated documentation. Defaults to `[DEFAULT_EXTRACT_DIR]/<SLUG>-<YYYYMMDD>-<UUID>/`.

## Execution Steps

You must follow these steps strictly and sequentially.

### Step 1: Resolve Inputs & Validate
* **Collect Sources:** Parse the `SOURCE_PATHS`. If N = 1, mark the run as a solo survey.
* **Compute Context:** Generate the `SLUG`, `DATE` (YYYYMMDD), `UUID` (8 hex chars), and `OUTPUT_DIR`.
* **Scan for Related Sources (Heuristic):** Best-effort scan for omitted sibling or complementary sources via:
  * Shared parent directories or namespaces.
  * Structural twins (e.g., sources with identical schemas or manifest names).
* **User Confirmation:** Stop and present the resolved sources, the planned `OUTPUT_DIR`, and any discovered sibling candidates (with rationale). Ask the user: *"Proceed with these N source(s), add one of the candidates, or supply different paths?"* Do not proceed to Step 2 without explicit user confirmation.

### Step 2: Source Survey (Per Source)
Analyze each source independently:
* **Enumerate Structure:** Identify manifests, indices, content trees, and tests/validation sets. Ignore generated outputs or caches.
* **Identify the Public Entry Point:** Locate the file, schema, or index exposing the source's primary surface. If absent, enumerate top-level public entities directly.
* **Extract Entities:** For every component referenced by the entry point, capture:
  * Key structures (classes, tables, core concepts, main chapters).
  * Actions/Functions (methods, API endpoints, defined procedures).
  * Error states or exception definitions.
  * Constants, static values, or fixed taxonomies.
* **Extract Relationships:** Map external citations/dependencies (third-party resources) and intra-source references (internal links or module-to-module edges).
* **Identify Private Helpers:** Log supporting internal logic, hidden helpers, or sub-processes referenced by the public surface.
* **Detect Lifecycle/Process Patterns:** Log initialization steps, teardown/disposal routines, state singletons, or recurring background loops.

### Step 3: Parity Matrix (N ≥ 2 Only)
*If N = 1, skip this step and write "N/A — solo survey (1 source)" in the parity output.*
Across the N surveyed sources, generate a side-by-side comparison:
* **Entity Cross-Match Table:** Rows = conceptual capability/entity; Columns = sources.
* **Naming Drift:** Flag entities with identical meanings but divergent naming (e.g., `user` vs `username`, `Client ID` vs `Account Number`).
* **Shape/Semantic Drift:** Flag entities with matching names but different semantics, types, or structures (e.g., time measured in `ms` vs `seconds`).
* **One-Sided Entities:** Document entities or concepts present in only one source. Do not assume intent; simply record the gap.

### Step 4: Capability & Feature Map
Translate the entity inventory into a conceptual capability ledger. For each capability, define:
* **Name:** Verb-phrase or clear concept (e.g., "validate configuration", "process payments").
* **Implementation:** Source modules, sections, and entities that implement or describe it.
* **Status:** Core (present in all sources) vs. Extension (present in ≥ 1 but not all). *Note: For N=1, all are "core (solo)".*
* **Dependencies:** External requirements or prerequisites to use this capability.

### Step 5: Process Flow Summary
For each source, sketch the consumer's end-to-end traversal flow:
* Initialization / Setup configuration cascade.
* Main execution / Connection pathways.
* Teardown / Disposal paths.
* Exception / Error escape vectors.
* Ongoing loops / Background resources.

### Step 6: Dependency Graph
For each source, emit two isolated lists:
* **External Dependencies:** Third-party imports, external APIs, or outside citations, grouped by component (including version pins if applicable).
* **Internal Relationships:** Directed edges between internal components (e.g., Component A relies on Component B).

### Step 7: Write Output Tree
Construct the `OUTPUT_DIR` with exactly 8 markdown files. No modifications are to be made to the original sources.
1. `README.md`: Overview, pointers, and surveyed sources.
2. `sources.md`: Table of formats, entry point paths, structural overviews, file/record counts.
3. `surface.md`: Per-source public entity inventory + exact location references.
4. `capabilities.md`: Capability ledger (from Step 4).
5. `flow.md`: Per-source lifecycle and process summary (from Step 5).
6. `dependencies.md`: External and internal relationship graph (from Step 6).
7. `parity.md`: Parity matrix (from Step 3) or N/A stub.
8. `references.md`: Flat index of every location reference used in the above docs, grouped by source.

### Step 8: Final Verification
* Verify exactly 8 files exist in the output structure.
* Confirm all references utilize absolute filesystem paths/URIs and include specific line/section ranges where applicable.
* Print a final summary to the user: `OUTPUT_DIR` path, source count, capability count, parity-gap count, and the suggested downstream command to initiate further planning or migration based on this extraction.