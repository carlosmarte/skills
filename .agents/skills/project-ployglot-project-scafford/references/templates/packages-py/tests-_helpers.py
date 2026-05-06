"""Shared test utilities for <slug>'s Python test suite."""

from __future__ import annotations

import os
from contextlib import contextmanager
from typing import Iterator, Mapping


@contextmanager
def env_isolated(overrides: Mapping[str, str | None] | None = None) -> Iterator[None]:
    """Snapshot ``os.environ``, apply overrides, restore on exit.

    Pass ``None`` as a value to *unset* the matching key for the
    duration of the block.
    """
    original = dict(os.environ)
    try:
        if overrides:
            for key, value in overrides.items():
                if value is None:
                    os.environ.pop(key, None)
                else:
                    os.environ[key] = value
        yield
    finally:
        os.environ.clear()
        os.environ.update(original)
