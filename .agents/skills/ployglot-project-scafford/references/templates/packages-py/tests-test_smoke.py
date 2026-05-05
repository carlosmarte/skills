"""Smoke test — proves the package imports and the public surface is
accessible. Mirrors ``packages/ts/test/smoke.test.ts``."""

from __future__ import annotations

import <snake_pkg>


def test_version_is_string() -> None:
    assert isinstance(<snake_pkg>.VERSION, str)


def test_public_surface_has_at_least_one_export() -> None:
    exports = [name for name in <snake_pkg>.__all__ if not name.startswith("_")]
    assert len(exports) >= 1, "expected at least one public export"
