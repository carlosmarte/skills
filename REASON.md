# REASON: `tier` is a top-level frontmatter field, not nested under `metadata`

## Decision

The `tier` field (`org | team | app | project`) is defined as a **required top-level
field** in `SKILL.md` frontmatter, alongside `name` and `description`. It is *not*
placed under the `metadata` map.

## Context

The `agentskills.io.md` SPEC defines two relevant frontmatter slots (§3.1):

- **Top-level fields** (`name`, `description`, `tier`, `license`, `compatibility`,
  `allowed-tools`, `dependencies`) — each has explicit type, validation rules, and
  required/optional status. Validators MUST enforce them.
- **`metadata`** — "arbitrary string-to-string key-value mapping" for advisory hints
  (e.g., `author`, `version`). The SPEC sets no schema on its keys.

`tier` governs:

1. Lifecycle and release cadence (`org` is slow, `project` is fast).
2. The dependency-direction rule: `project → app → team → org`. Inversions are
   forbidden and rejected by the validator.

## Reasons

1. **Enforceability.** Top-level fields have a defined contract the validator can
   gate CI on. `metadata` is "arbitrary string-to-string" by spec; a validator that
   special-cased `metadata.tier` would be reinventing a top-level field one nesting
   level deeper, with no benefit.

2. **Dependency resolution depends on it.** The inversion rule is the structural
   value of having tiers at all. It only holds if `tier` is structurally guaranteed.
   Demoting it to `metadata` turns "tier missing" into a soft warning and lets a
   typo like `metadata.tier: ap` pass silently — exactly the failure mode tiering
   exists to prevent.

3. **Tooling cost.** Any registry, CLI, or CI step that filters or sorts by tier
   (`npx skills list --tier=org`, dependency graph rendering, "promote app→team"
   workflows) reads top-level fields directly. Nesting it under `metadata` adds a
   second parse layer and a convention every consumer has to know about.

4. **Concept separation.** `metadata` is the right home for advisory, operational,
   or extension-specific hints — `author`, `version`, `model_tier` (compute
   routing), `last-reviewed`, etc. `tier` is structural governance, not a hint.
   Mixing them blurs the contract.

## Alternative considered: move `tier` under `metadata`

Rejected. The only argument for moving it is keeping the SPEC §3.1 required-field
list shorter, which is an aesthetic preference. The cost is:

- Validator can no longer treat tier as required without carving `metadata.tier`
  out as a reserved key — i.e., reintroducing a top-level field by another name.
- The inversion rule becomes advisory rather than enforceable.
- Cross-tool integration costs more (every reader has to traverse `metadata`).

If a future SPEC revision wants tier-as-metadata, the change must come paired with
explicit reserved-key semantics in §3.1 (e.g., "the `tier` key inside `metadata`
is reserved, required, and constrained to {org, team, app, project}"). Until then,
tier stays top-level.

## Consequences

- Adding a tier requires a SPEC §3.1 row update and a validator change. This is
  the intended cost — tiers are a governance contract, not a free-form taxonomy.
- Other top-level fields (`dependencies`, future fields like `provides`,
  `replaces`) follow the same pattern: structural contracts at the top level,
  advisory hints under `metadata`.
- Skill authors wanting per-skill compute hints (e.g., "use a fast model")
  should put those under `metadata` (e.g., `metadata.model_tier: fast`), not
  promote them to top-level.
