import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (file) => readFileSync(path.join(root, file), 'utf8');
const route = 'vibe/vinterlagring-fornes/';
const page = (name) => read(`${route}${name}`);
const home = page('index.html');
const registration = page('registrer/index.html');
const customer = page('kunde/index.html');
const admin = page('admin/index.html');
const css = page('assets/css/app.css');
const js = page('assets/js/app.js');
const config = page('assets/js/config.js');
const readme = page('README.md');

test('Vinterlagring catalog records source fidelity, scope, and safety', () => {
  const catalog = JSON.parse(read('vibe/catalog.json'));
  const entry = catalog.apps.find((app) => app.slug === 'vinterlagring-fornes');
  assert.ok(entry);
  for (const field of ['name', 'useCase', 'category', 'status', 'demoValue', 'simplifications', 'risk', 'scope', 'source', 'sourceStack', 'sourceApiAuthStoragePrivacy']) {
    assert.equal(typeof entry[field], 'string', `${field} is documented`);
    assert.ok(entry[field].length > 0, `${field} is not empty`);
  }
  assert.match(entry.source, /a26c5e99183bded5549bcb4c1ebd03cf2973cf90/);
  assert.match(entry.scope, /registrer.*kunde.*admin/i);
  assert.match(entry.risk, /magiske lenker/i);
  assert.match(entry.sourceApiAuthStoragePrivacy, /syntetiske mockverdier/i);
  assert.match(readme, /Issue #2 delvis/);
  assert.match(read('VERSION').trim(), /^\d+\.\d+\.\d+$/);
  assert.equal(read('VERSION').trim(), '0.58.0');
});

test('route retains the source home and three placeholder areas', () => {
  for (const html of [home, registration, customer, admin]) assert.match(html, /<html lang="no">/);
  assert.match(home, /href="registrer\/"/);
  assert.match(home, /href="kunde\/"/);
  assert.match(home, /href="admin\/"/);
  assert.match(registration, /Meld inn vinterlagring/);
  assert.match(registration, /Ingen data sendes eller lagres/);
  assert.match(customer, /magisk lenke/i);
  assert.match(admin, /Driftsoversikt/);
  assert.match(js, /Frontendlogikk kommer i senere issues/);
  assert.match(config, /apiBasePath: '\/api'/);
  assert.match(readme, /apiBasePath.*ubrukt/);
});

test('all displayed mock values are synthetic and no persistence or network behavior is added', () => {
  const combined = [home, registration, customer, admin, css, js, config].join('\n');
  assert.match(registration, /mock@eksempel\.invalid/);
  assert.match(customer, /MOCK 1/);
  assert.doesNotMatch(combined, /fetch\s*\(|XMLHttpRequest|sendBeacon|localStorage|sessionStorage|indexedDB|document\.cookie|PHPSESSID/i);
  assert.doesNotMatch(combined, /https?:\/\/|<iframe\b/i);
  assert.doesNotMatch(combined, /password\s*[:=]|Bearer\s+[A-Za-z0-9._-]+/i);
  assert.match(readme, /syntetiske eksempelverdier/);
});

test('local styles and scripts are linked without external dependencies', () => {
  for (const html of [home, registration, customer, admin]) {
    assert.match(html, /<main\b/);
    assert.match(html, /assets\/css\/app\.css/);
  }
  assert.match(css, /:focus-visible/);
  assert.match(css, /@media \(max-width: 880px\)/);
  assert.match(home, /assets\/js\/config\.js/);
  assert.match(home, /assets\/js\/app\.js/);
});
