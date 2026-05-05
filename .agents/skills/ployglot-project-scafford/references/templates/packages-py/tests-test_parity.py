"""Cross-language parity test. Loads the shared fixtures and asserts
that this implementation produces the ``expected`` value for every
case. The TypeScript twin (``packages/ts/test/parity.test.ts``) loads
the same JSON and runs the symmetric assertion.

Drift is caught locally — no CI mediation required.
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any, Callable, Mapping

import pytest

import <snake_pkg>

_FIXTURES_PATH = Path(__file__).resolve().parents[2] / "tests" / "parity" / "fixtures.json"


def _load_cases() -> list[Mapping[str, Any]]:
    raw = json.loads(_FIXTURES_PATH.read_text(encoding="utf-8"))
    return list(raw["cases"])


def _decode_inputs(_fn: str, inputs: Mapping[str, Any]) -> tuple[Any, ...]:
    """Default: positional args in declaration order."""
    return tuple(inputs.values())


@pytest.mark.parametrize("case", _load_cases(), ids=lambda c: c["id"])
def test_parity(case: Mapping[str, Any]) -> None:
    fn_name: str = case["function"]
    fn: Callable[..., Any] | None = getattr(<snake_pkg>, fn_name, None)
    if fn is None:
        # The fixture references a function this twin has not yet
        # implemented. Skip rather than fail so partial implementations
        # can iterate. Switch to ``pytest.fail`` to make missing
        # surface a hard error.
        pytest.skip(f"{fn_name} not implemented yet")

    args = _decode_inputs(fn_name, case["inputs"])
    actual = fn(*args)
    expected = case["expected"]
    assert actual == expected, case.get("notes", case["id"])
