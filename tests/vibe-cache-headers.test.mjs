import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const headers = readFileSync(new URL('../vibe/.htaccess', import.meta.url), 'utf8');

test('Vibe responses prevent stale hub cards and removed routes from being cached', () => {
  assert.match(headers, /Header always set Cache-Control "no-store, no-cache, must-revalidate, max-age=0"/);
  assert.match(headers, /Header always set Pragma "no-cache"/);
  assert.match(headers, /Header always set Expires "0"/);
});
