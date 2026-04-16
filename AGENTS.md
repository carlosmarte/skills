# Repository AI Directives

## Execution Routing

Your capabilities and architectural constraints are defined as declarative markdown Standard Operating Procedures (SOPs) in the `.agents/commands/` directory.

**MANDATORY PRE-FLIGHT CHECK:**
Before beginning _any_ scaffolding, feature generation, or refactoring, you MUST list the contents of `.agents/commands/` and read the relevant `[skill-name].md` files to understand the required schemas, validation steps, and coding constraints.

## Global Architectural Baselines

**Defensive Programming:** Treat all inputs as malicious. Fail fast and validate explicitly.
