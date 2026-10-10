import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const catalog = JSON.parse(read('vibe/catalog.json'));

 test('Reservering is a faithful isolated booking and admin demo with synthetic data', () => {
  const matches = catalog.apps.filter((app) => app.slug === 'reservering');
  assert.equal(matches.length, 1);
  const app = matches[0];
  for (const field of ['name', 'useCase', 'category', 'audience', 'status', 'purpose', 'demoValue', 'simplifications', 'risk', 'scope', 'source', 'sourceStack', 'sourceTests', 'sourceApiAuthStoragePrivacy', 'rightsUncertainty', 'routeState']) assert.ok(app[field], `${field} is documented`);
  assert.match(app.sourceStack, /WordPress\/PHP/);
  assert.match(app.sourceApiAuthStoragePrivacy, /telefon/);
  assert.match(app.sourceApiAuthStoragePrivacy, /nonce/);
  assert.match(app.rightsUncertainty, /GPL-2\.0-or-later/);
  const html = read('vibe/reservering/index.html');
  const js = read('vibe/reservering/app.js');
  const css = read('vibe/reservering/style.css');
  const readme = read('vibe/reservering/README.md');
  for (const label of ['Kundebooking', 'Administrasjon', 'Bekreft reservasjon', 'Eksporter CSV', 'Ukentlig tilgjengelighet', 'Blokker periode', 'E-postinnstillinger', 'Demorolle']) assert.match(html, new RegExp(label));
  for (const behavior of ['renderCalendar', 'renderTimes', 'renderReservations', 'renderWeeklyHours', 'renderBlockouts', 'createObjectURL', 'showModal', 'cancel-booking']) assert.match(js, new RegExp(behavior));
  assert.match(html, /example\.invalid/);
  assert.match(js, /example\.invalid/);
  assert.match(js, /window\.confirm/);
  assert.match(css, /:focus-visible/);
  assert.match(css, /max-width:600px/);
  assert.match(readme, /forsvinner ved refresh/);
  assert.doesNotMatch(`${html}\n${js}`, /fetch\s*\(|XMLHttpRequest|localStorage|sessionStorage|indexedDB|document\.cookie|sendBeacon|https?:\/\//i);
});
