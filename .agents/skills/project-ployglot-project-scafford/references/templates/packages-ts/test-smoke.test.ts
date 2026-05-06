// Smoke test — proves the package loads and the public surface is
// importable. Catches typos in re-exports + broken builds.

import { test } from 'node:test';
import * as assert from 'node:assert/strict';

import * as surface from '../src/index.js';

test('package exports VERSION', () => {
  assert.equal(typeof surface.VERSION, 'string');
});

test('public surface has at least one export', () => {
  const keys = Object.keys(surface).filter((k) => k !== 'default');
  assert.ok(keys.length >= 1, 'expected at least one named export');
});
