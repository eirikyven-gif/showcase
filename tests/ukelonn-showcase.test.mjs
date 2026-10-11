import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const app = path.join(repo, 'vibe/ukelonn');
const routes = [
  '', 'logg-inn/', 'registrer/', 'min-oversikt/', 'historikk/', 'admin/',
  'admin/logg-inn/', 'admin/gjoremal/', 'admin/brukere/', 'admin/brukere/historikk/',
  'admin/registreringer/', 'admin/forslag/', 'admin/perioder/', 'admin/utbetalinger/',
];

test('app pages and assets are present as direct static routes', () => {
  for (const route of routes) assert.ok(existsSync(path.join(app, route, 'index.html')), `direct route ${route || '/'}`);
  for (const script of ['demo-api.js', 'shell.js', 'ukelonn.js', 'overview.js', 'history.js', 'admin-dashboard.js', 'tasks-admin.js', 'auth.js', 'suggestions.js', 'suggestions-admin.js', 'periods-admin.js', 'payments-admin.js', 'payout-claims-admin.js', 'admin-registrations.js', 'user-history-admin.js']) {
    assert.ok(existsSync(path.join(app, 'assets', script)), `${script} exists`);
  }
  assert.ok(existsSync(path.join(app, 'assets/tasks-excel.js')));
  assert.ok(existsSync(path.join(app, 'assets/synthetic-attachment.svg')));
});

test('demo has synthetic personas, explicit local storage/reset, no auth fields, PHP or external service references', () => {
  const html = routes.map(route => readFileSync(path.join(app, route, 'index.html'), 'utf8')).join('\n');
  const scripts = [...(function* walk(dir) { for (const entry of readdirSync(dir, { withFileTypes: true })) { const full = path.join(dir, entry.name); if (entry.isDirectory()) yield* walk(full); else if (full.endsWith('.js')) yield full; } })(app)].map(file => readFileSync(file, 'utf8')).join('\n');
  assert.match(html, /Voksen A/);
  assert.match(html, /Ingen PIN eller innlogging brukes/);
  assert.doesNotMatch(html, /type=["']password["']|name=["']pin["']/i);
  assert.match(scripts, /localStorage\.setItem/);
  assert.match(scripts, /localStorage\.removeItem\(key\)/);
  assert.match(scripts, /Nullstill alle demoendringer/);
  assert.match(scripts, /window\.fetch\s*=\s*async/);
  assert.match(scripts, /throw new TypeError\('Ukelønn-demoen tillater bare lokale simuleringer/);
  assert.doesNotMatch(`${html}\n${scripts}`, /document\.cookie|sessionStorage|indexedDB|XMLHttpRequest|sendBeacon/i);
  assert.doesNotMatch(html, /(?:href|src)=["']https?:\/\//i, 'pages do not load external resources');
  const scriptWithoutXmlNamespaces = scripts.replace(/(?:xmlns(?::[\w-]+)?|Type)="https?:\/\/[^"]+"/g, '');
  assert.doesNotMatch(scriptWithoutXmlNamespaces, /https?:\/\//i, 'scripts do not call external endpoints');
  assert.equal(existsSync(path.join(app, 'api')), false, 'no source API/server code is copied');
});
