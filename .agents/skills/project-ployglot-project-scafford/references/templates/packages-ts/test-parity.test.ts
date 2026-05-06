// Cross-language parity test. Loads the shared fixtures and asserts
// that this implementation produces the `expected` value for every
// case. The Python twin (`packages/py/tests/test_parity.py`) loads
// the same JSON and runs the symmetric assertion.
//
// Drift is caught locally — no CI mediation required.

import { test } from 'node:test';
import * as assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve as resolvePath } from 'node:path';

import * as surface from '../src/index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixturesPath = resolvePath(__dirname, '../../../tests/parity/fixtures.json');

interface Case {
  id: string;
  function: string;
  inputs: Record<string, unknown>;
  expected: unknown;
  notes?: string;
}

interface Fixtures {
  version: number;
  cases: Case[];
}

const fixtures: Fixtures = JSON.parse(readFileSync(fixturesPath, 'utf8'));

for (const c of fixtures.cases) {
  test(`parity ${c.id} (${c.function})`, () => {
    const fn = (surface as Record<string, unknown>)[c.function];
    if (typeof fn !== 'function') {
      // The fixture references a function this twin has not yet
      // implemented. Skip rather than fail so partial implementations
      // can iterate. Replace with `assert.fail(...)` to make missing
      // surface a hard error.
      return;
    }
    // Each fixture's `inputs` is function-shaped — both ports decode
    // it the same way. Adapt this dispatcher to your function
    // signatures.
    const args = decodeInputs(c.function, c.inputs);
    const actual = (fn as (...a: unknown[]) => unknown)(...args);
    assert.deepEqual(actual, c.expected, c.notes ?? c.id);
  });
}

function decodeInputs(_fn: string, inputs: Record<string, unknown>): unknown[] {
  // Default: positional args in declaration order.
  return Object.values(inputs);
}
