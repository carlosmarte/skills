# SDK Examples

Programmatic embedding of `<slug>` inside another codebase. Each
scenario shows TypeScript and Python side-by-side so the parity is
visible at a glance.

## Setup

### TypeScript

```bash
npm install <scope-prefix><slug>
```

```ts
import { /* surface */ } from '<scope-prefix><slug>';
```

### Python

```bash
pip install <slug>
```

```python
from <snake_pkg> import (
    # surface
)
```

## Scenarios

| #   | Scenario                            | Description                                   |
| --- | ----------------------------------- | --------------------------------------------- |
| _Add scenarios as numbered files in this directory: `01-<name>.md`, `02-<name>.md`, ..._ ||

## How to add a new scenario

1. Pick the next free number (`NN`) and a kebab-case slug for the
   scenario name.
2. Create `NN-<scenario-name>.md` with the conventional sections:
   - **Goal** — one sentence on what the scenario demonstrates.
   - **Prerequisites** — env vars, config, or other setup.
   - **Code** — TypeScript block, then Python block, identical
     behavior.
   - **Expected outcome** — what the program prints / returns.
3. Add a row to the table above.
