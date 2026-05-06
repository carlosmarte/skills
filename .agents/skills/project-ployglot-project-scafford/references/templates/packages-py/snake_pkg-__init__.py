"""Public surface of <slug>.

This module re-exports only — implementations live in sibling modules
inside this package. Keep ``__all__`` in lockstep with the named
exports in the TypeScript twin's ``src/index.ts``.
"""

from __future__ import annotations

VERSION: str = "0.1.0"

__all__ = [
    "VERSION",
]
