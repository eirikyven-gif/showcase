import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const vibeRoot = path.join(repoRoot, 'vibe');
const read = (relativePath) => readFileSync(path.join(repoRoot, relativePath), 'utf8');
const catalog = JSON.parse(read('vibe/catalog.json'));

function filesUnder(directory) {
  return readdirSync(directory).flatMap((name) => {
    const fullPath = path.join(directory, name);
    return statSync(fullPath).isDirectory() ? filesUnder(fullPath) : [fullPath];
  });
}

function formHasSubmitGuard(formAttributes, pageScripts) {
  const formId = formAttributes.match(/\bid\s*=\s*['"]([^'"]+)['"]/i)?.[1];
  if (!formId) return false;
  const escapedId = formId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const selectorPattern = new RegExp(
    `(?:const|let|var)\\s+(\\w+)\\s*=\\s*(?:document\\.(?:querySelector\\(\\s*['"]#${escapedId}['"]\\s*\\)|getElementById\\(\\s*['"]${escapedId}['"]\\s*\\))|\\$\\(\\s*['"]${escapedId}['"]\\s*\\))`,
  );
  const formVariable = pageScripts.match(selectorPattern)?.[1];
  if (!formVariable) {
    const direct = new RegExp(`\\$\\(\\s*['"]#${escapedId}['"]\\s*\\)\\.addEventListener\\(\\s*['"]submit['"]\\s*,\\s*async?\\s*\\(\\s*(\\w+)\\s*\\)\\s*=>\\s*\\1\\.preventDefault\\(\\)`);
    return direct.test(pageScripts);
  }
  const submitPattern = new RegExp(
    `\\b${formVariable}\\.addEventListener\\(\\s*['"]submit['"]\\s*,\\s*\\(\\s*(\\w+)\\s*\\)\\s*=>\\s*(?:\\{\\s*)?\\1\\.preventDefault\\(\\)`,
  );
  if (submitPattern.test(pageScripts)) return true;
  const handlerName = pageScripts.match(new RegExp(`${formVariable}\\.addEventListener\\(\\s*['\"]submit['\"]\\s*,\\s*(\\w+)`))?.[1];
  if (!handlerName) return false;
  const handlerPattern = new RegExp(`(?:const|let|var)\\s+${handlerName}\\s*=\\s*function\\s*\\(\\s*(\\w+)\\s*\\)\\s*\\{[\\s\\S]*?\\1\\.preventDefault\\(\\)`);
  return handlerPattern.test(pageScripts);
}

test('hub assets and catalog exist', () => {
  for (const relativePath of [
    'vibe/index.html',
    'vibe/assets/hub.css',
    'vibe/assets/hub.js',
    'vibe/catalog.json',
  ]) {
    assert.ok(statSync(path.join(repoRoot, relativePath)).isFile(), `${relativePath} exists`);
  }
  assert.ok(Array.isArray(catalog.apps), 'catalog.apps is an array');
});

test('catalog fields are complete and slugs are unique, stable route segments', () => {
  const slugs = new Set();
  for (const app of catalog.apps) {
    assert.match(app.slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/, `valid slug: ${app.slug}`);
    assert.ok(!slugs.has(app.slug), `unique slug: ${app.slug}`);
    slugs.add(app.slug);
    assert.equal(typeof app.name, 'string');
    assert.ok(app.name.trim(), `${app.slug} has a name`);
    assert.equal(typeof app.useCase, 'string');
    assert.ok(app.useCase.trim(), `${app.slug} has a use case`);
    assert.equal(typeof app.category, 'string');
    assert.ok(app.category.trim(), `${app.slug} has a category`);
    assert.ok(Array.isArray(app.audience) && app.audience.length > 0, `${app.slug} has audience metadata`);
    assert.ok(app.audience.every((item) => typeof item === 'string' && item.trim()), `${app.slug} audience values are text`);
    const route = path.join(vibeRoot, app.slug, 'index.html');
    assert.ok(statSync(route).isFile(), `${app.slug} has a direct-route index`);
  }
});

test('Soundscape keeps its full synthetic route, local profile, and isolated controls', () => {
  const app = catalog.apps.find((entry) => entry.slug === 'soundscape');
  const html = read('vibe/soundscape/index.html');
  const script = read('vibe/soundscape/app.js');
  const styles = read('vibe/soundscape/style.css');
  const docs = read('vibe/soundscape/README.md');

  assert.ok(app, 'Soundscape remains in the broad candidate catalog');
  assert.equal(catalog.apps.filter((entry) => entry.slug === 'soundscape').length, 1);
  for (const field of ['status', 'source', 'sourceStack', 'sourceTests', 'sourceApiAuthStoragePrivacy', 'rightsUncertainty', 'purpose', 'demoValue', 'simplifications', 'risk', 'scope', 'routeState']) {
    assert.equal(typeof app[field], 'string', `Soundscape records ${field}`);
    assert.ok(app[field].trim(), `Soundscape ${field} is not empty`);
  }
  assert.match(app.source, /v0\.8\.0/);
  assert.match(app.purpose, /SSoT/);
  assert.match(app.simplifications, /syntetisk runtime/i);
  assert.match(app.rightsUncertainty, /uavklart/i);
  assert.match(app.routeState, /Eksisterende \/vibe\/soundscape/);
  assert.match(docs, /ikke kildeappens produksjonsruntime/);
  assert.match(docs, /ikke kildens live- eller målte 24-timershistorikk/);
  assert.match(docs, /gjenbruksrettigheter.*ikke dokumentert/i);
  assert.match(html, /href="\/vibe\/soundscape\/"/);
  assert.match(html, /href="\/vibe\/"/);
  assert.match(html, /45 signaler/);
  assert.match(html, /43 lydmål/);
  assert.match(html, /id="demo-role"/);
  assert.match(html, /id="save-snapshot"/);
  assert.match(html, /id="rollback-snapshot"/);
  assert.match(html, /id="reset-all"/);
  assert.match(html, /syntetiske demonstrasjonsdata/i);
  assert.match(html, /profilen autosaves bare lokalt/i);
  assert.match(docs, /full nullstilling/i);
  assert.match(docs, /localStorage/);
  assert.match(html, /<button(?=[^>]*\bid="play")(?=[^>]*\btype="button")[^>]*>/);
  assert.match(html, /role="status" aria-live="polite"/);
  assert.match(script, /window\.AudioContext/);
  assert.match(script, /audio\.ctx\.suspend\(\)/);
  assert.match(script, /localStorage\.setItem\(STORAGE_KEY/);
  assert.match(script, /localStorage\.removeItem\(STORAGE_KEY\)/);
  assert.doesNotMatch(`${html}\n${script}`, /\b(?:fetch|XMLHttpRequest|sendBeacon|sessionStorage|indexedDB|document\.cookie|credentials\s*:)/i);
  assert.match(script, /localStorage\.setItem\(STORAGE_KEY/);
  assert.doesNotMatch(`${html}\n${script}`, /https?:\/\//i);
  assert.match(styles, /:focus-visible|prefers-reduced-motion/);
});

test('Ticker candidate assessment documents source uncertainty and its existing isolated route', () => {
  const app = catalog.apps.find((entry) => entry.slug === 'ticker');
  const html = read('vibe/ticker/index.html');
  const script = read('vibe/ticker/app.js');
  const css = read('vibe/ticker/style.css');
  const docs = read('vibe/ticker/README.md');

  assert.ok(app, 'Ticker remains in the broad candidate catalog');
  for (const field of ['status', 'sourceUncertainty', 'purpose', 'demoValue', 'simplifications', 'risk', 'scope', 'source', 'sourceStack', 'sourceTests', 'sourceApiAuthStoragePrivacy', 'rightsUncertainty', 'routeState']) {
    assert.equal(typeof app[field], 'string', `Ticker records ${field}`);
    assert.ok(app[field].trim(), `Ticker ${field} is not empty`);
  }
  assert.match(app.status, /Beholdt i bred førstegangsrunde/);
  assert.match(app.routeState, /Eksisterende rute/);
  assert.match(docs, /fantes allerede i `main`/);
  assert.match(html, /href="\/vibe\/ticker\/"/);
  assert.match(html, /href="\/vibe\/"/);
  assert.match(html, /aria-pressed="false"/);
  assert.match(html, /id="ticker-text"/);
  assert.match(html, /id="ticker-speed"/);
  assert.match(script, /textInput\.addEventListener\('input'/);
  assert.match(script, /speedInput\.addEventListener\('input'/);
  assert.match(script, /toggle\.addEventListener\('click'/);
  assert.equal(formHasSubmitGuard('id=\"ticker-form\"', script), true, 'Enter cannot submit ticker text to the server');
  assert.match(css, /prefers-reduced-motion/);
});

test('Klokke candidate assessment documents source, scope, risk, and broad-round status', () => {
  const app = catalog.apps.find((entry) => entry.slug === 'klokke');
  assert.ok(app, 'Klokke remains in the candidate catalog');
  for (const field of ['status', 'sourceUncertainty', 'purpose', 'demoValue', 'simplifications', 'risk', 'scope', 'source']) {
    assert.equal(typeof app[field], 'string', `Klokke has ${field} assessment metadata`);
    assert.ok(app[field].trim(), `Klokke ${field} metadata is not empty`);
  }
  assert.match(app.status, /Beholdt i bred førstegangsvurdering/);
  assert.match(app.source, /diverse-apper.*apps\/klokke/);
  assert.match(read('vibe/klokke/README.md'), /lisens|rettighetsgrunnlaget/i);
  assert.match(read('vibe/klokke/README.md'), /ingen.*API|ingen API/i);
});

test('Hegra Cup Live assessment records evidence without presenting a live app', () => {
  const app = catalog.apps.find((entry) => entry.slug === 'hegra-cup-live');
  const html = read('vibe/hegra-cup-live/index.html');
  const docs = read('vibe/hegra-cup-live/README.md');

  assert.ok(app, 'Hegra Cup Live remains in the broad first-round catalog');
  for (const field of ['status', 'source', 'sourceStack', 'sourceTests', 'sourceApiAuthStoragePrivacy', 'rightsUncertainty', 'purpose', 'demoValue', 'simplifications', 'risk', 'scope', 'routeState']) {
    assert.equal(typeof app[field], 'string', `Hegra Cup Live records ${field}`);
    assert.ok(app[field].trim(), `Hegra Cup Live ${field} is not empty`);
  }
  assert.match(app.status, /Beholdt i bred førstegangsrunde/);
  assert.match(app.sourceStack, /ingen implementert runtime-stack/i);
  assert.match(app.sourceApiAuthStoragePrivacy, /ikke verifisert/i);
  assert.match(app.rightsUncertainty, /uavklart/i);
  assert.match(app.routeState, /Ingen eksisterende/);
  assert.match(docs, /assessment-only/i);
  assert.match(docs, /Ingen merge eller deploy/);
  assert.match(html, /assessment-only side/i);
  assert.match(html, /ingen implementert app-runtime/i);
  assert.match(html, /href="\/vibe\/"/);
  assert.doesNotMatch(html, /Hegra IL|Stjørdal FK|Lånke IL|Vinne SK/);
  assert.doesNotMatch(html, /<script\b|<form\b|<input\b/i);
});

test('hub search covers every catalog field and renders values as text', () => {
  const script = read('vibe/assets/hub.js');
  for (const field of ['app.name', 'app.useCase', 'app.category', 'app.audience']) {
    assert.ok(script.includes(field), `search includes ${field}`);
  }
  assert.match(script, /\.textContent\s*=/, 'catalog values are rendered as text');
  assert.match(script, /catalog\.json/, 'catalog is loaded from the same static repository');
});

test('hub provides labeled search, focus visibility, and a small-screen layout', () => {
  const html = read('vibe/index.html');
  const css = read('vibe/assets/hub.css');
  assert.match(html, /<label[^>]+for="app-search"/i);
  assert.match(html, /id="app-search"[^>]+aria-describedby=/i);
  assert.match(css, /:focus-visible/);
  assert.match(css, /@media\s*\(max-width:/);
  assert.match(css, /prefers-reduced-motion/);
});

test('catalog and demo runtime have no browser persistence, login fields, recognizable secrets, or external runtime URL', () => {
  // Catalog prose can name technologies while documenting an assessed source;
  // scan executable assets here and validate catalog metadata separately.
  const runtimeFiles = filesUnder(vibeRoot).filter((file) => /\.(?:html|js|css)$/i.test(file));
  const secretPatterns = [
    /\bAKIA[0-9A-Z]{16}\b/,
    /\bgh[pousr]_[A-Za-z0-9]{20,}\b/,
    /\bAIza[0-9A-Za-z_-]{30,}\b/,
  ];
  const hubScript = path.join(vibeRoot, 'assets/hub.js');

  for (const file of runtimeFiles) {
    const source = readFileSync(file, 'utf8');
    const routeSlug = path.relative(vibeRoot, file).split(path.sep)[0];
    const routeEntry = catalog.apps.find((entry) => entry.slug === routeSlug);
    const allowsLocalStorage = /localStorage|nettleserlagring|nettleserens lokale lagring/i.test(routeEntry?.scope || '');
    const allowsIndexedDb = /indexeddb/i.test(routeEntry?.scope || '');
    const allowsLocalStaticFetch = /same-origin requests for this app's own static shell/i.test(routeEntry?.scope || '');
    if (!allowsIndexedDb) assert.doesNotMatch(source, /\bindexedDB\b/, `${file} does not use undeclared IndexedDB`);
    assert.doesNotMatch(source, /\bsessionStorage\b/, `${file} does not use sessionStorage`);
    if (!allowsLocalStorage) assert.doesNotMatch(source, /\blocalStorage\b/, `${file} has no undeclared browser persistence`);
    if (routeSlug === 'bingo' && file.endsWith('.js')) {
      assert.match(source, /localStorage/, `${file} uses local-only Bingo workflow persistence`);
      assert.match(source, /localStorage\.removeItem\(STORE_KEY\)/, `${file} has a full local reset`);
    }
    if (file === path.join(vibeRoot, 'fagquizer/app.js')) {
      assert.match(source, /localStorage\.setItem\(STORE/, 'Fagquizer stores only its local demo state');
      assert.match(source, /localStorage\.removeItem\(STORE\)/, 'Fagquizer offers a full local reset');
    }
    assert.doesNotMatch(source, /\bdocument\.cookie\b/, `${file} does not read/write cookies`);
    assert.doesNotMatch(source, /\b(?:XMLHttpRequest|sendBeacon)\b/, `${file} has no alternate network transport`);
    assert.doesNotMatch(source, /<input\b[^>]*\btype\s*=\s*['"]password['"]/i, `${file} has no real password field`);
    assert.doesNotMatch(source, /\b(?:Authorization\s*:\s*['"]?Bearer|credentials\s*:\s*['"]include)/i, `${file} has no authenticated network request`);
    const runtimeSource = routeSlug === 'arrangementsvakt' ? source.replaceAll('http://www.w3.org/2000/svg', '') : source;
    assert.doesNotMatch(runtimeSource, /https?:\/\//i, `${file} has no external runtime URL`);
    for (const secretPattern of secretPatterns) {
      assert.doesNotMatch(source, secretPattern, `${file} has no recognizable secret pattern`);
    }
    if (file.endsWith('.js') && file !== hubScript && routeSlug !== 'ukelonn' && !allowsLocalStaticFetch) {
      assert.doesNotMatch(source, /\bfetch\s*\(/, `${file} makes no API/network call`);
    }
  }

  const hub = readFileSync(hubScript, 'utf8');
  assert.match(hub, /fetch\s*\(\s*['"]\/vibe\/catalog\.json['"]/, 'hub only fetches the static catalog');
  const reserveringHtml = read('vibe/reservering/index.html');
  const reserveringScript = read('vibe/reservering/app.js');
  assert.match(reserveringHtml, /lagres kun lokalt i denne nettleseren/);
  assert.match(reserveringHtml, /id="reset-demo"/);
  assert.match(reserveringScript, /localStorage\.setItem\(storageKey/);
  assert.match(reserveringScript, /localStorage\.removeItem\(storageKey/);
  assert.doesNotMatch(reserveringScript, /\b(?:fetch|XMLHttpRequest|sendBeacon|sessionStorage|indexedDB|document\.cookie)\b|https?:\/\//i);
});

test('Nedtelling e-post preserves signature generation in isolated local storage', () => {
  const html = read('vibe/nedtelling-epost/index.html');
  const script = read('vibe/nedtelling-epost/app.js');
  const css = read('vibe/nedtelling-epost/style.css');
  const app = catalog.apps.find((entry) => entry.slug === 'nedtelling-epost');
  assert.ok(app, 'candidate remains in the broad catalog');
  assert.match(app.status, /tro kopi/i);
  for (const field of ['purpose', 'demoValue', 'simplifications', 'risk', 'scope', 'source', 'sourceUncertainty', 'sourceStack', 'sourceTests', 'sourceApiAuthStoragePrivacy', 'rightsUncertainty', 'routeState']) {
    assert.ok(app[field], `assessment includes ${field}`);
  }
  assert.match(html, /href="\/vibe\/nedtelling-epost\/"/, 'route has a canonical direct URL');
  assert.match(html, /href="\/vibe\/"/g, 'route links back to the hub');
  assert.match(html, /<canvas\b[^>]*\brole="img"[^>]*\baria-label=/i, 'canvas has an accessible text alternative');
  for (const field of ['name', 'title', 'date', 'time', 'format']) assert.match(html, new RegExp(`id="${field}"`), `${field} input is present`);
  assert.match(html, /Lagre og generer/);
  assert.match(html, /Kort bilde-URL/);
  assert.match(html, /HTML for signatur/);
  assert.match(html, /bare i denne nettleseren/);
  assert.match(html, /Nullstill demoen/);
  assert.match(script, /getContext\(['"]2d['"]\)/, 'preview is drawn locally on canvas');
  assert.match(script, /preventDefault\(\)/, 'form submit does not send data to a server');
  assert.match(script, /data:image\/gif;base64/);
  assert.match(script, /canvas\.toDataURL\('image\/png'\)/);
  assert.match(script, /localStorage\.setItem\(STORAGE_KEY/);
  assert.match(script, /localStorage\.removeItem\(STORAGE_KEY\)/, 'full local reset removes the app store');
  assert.match(script, /NETSCAPE2\.0/, 'GIF generation is animated');
  assert.doesNotMatch(html + script, /\b(?:fetch|XMLHttpRequest|sendBeacon|sessionStorage|indexedDB|document\.cookie)\b|https?:\/\//i, 'demo makes no external request');
  assert.match(css, /@media\s*\(max-width:\s*760px\)/);
  assert.match(css, /:focus-visible/);
  assert.match(css, /border:\s*1px solid #806b70/i, 'form control boundaries meet the 3:1 non-text contrast threshold');
  assert.match(read('vibe/nedtelling-epost/README.md'), /Kilde-HTML-en har ingen separat adminflate/i);
});

test('Ukelønn is a source-faithful synthetic demo with explicitly local persistence', () => {
  const app = catalog.apps.find((entry) => entry.slug === 'ukelonn');
  const html = read('vibe/ukelonn/index.html');
  const css = read('vibe/ukelonn/assets/ukelonn.css');
  const runtime = read('vibe/ukelonn/assets/demo-api.js');
  const docs = read('vibe/ukelonn/README.md');

  assert.ok(app, 'Ukelønn remains in the broad candidate catalog');
  for (const field of ['status', 'sourceUncertainty', 'purpose', 'demoValue', 'simplifications', 'risk', 'scope', 'source', 'sourceStack', 'sourceTests', 'sourceApiAuthStoragePrivacy', 'rightsUncertainty', 'routeState']) {
    assert.equal(typeof app[field], 'string', `Ukelønn records ${field}`);
    assert.ok(app[field].trim(), `Ukelønn ${field} is documented`);
  }
  assert.match(app.status, /Kvalitetskorreksjon/);
  assert.match(app.source, /apps\/ukelonn.*0\.17\.0/);
  assert.match(app.routeState, /eksisterende/i);
  assert.match(html, /href="registrer\/"/);
  assert.match(html, /href="\/vibe\/"/);
  assert.match(html, /syntetiske demo-data/i);
  assert.match(html, /Voksen A/);
  assert.doesNotMatch(html, /type="password"|name="pin"|<script[^>]+src="https?:/i);
  assert.match(css, /\.demo-notice/);
  assert.match(runtime, /localStorage\.setItem/);
  assert.match(runtime, /localStorage\.removeItem\(key\)/);
  assert.match(runtime, /window\.fetch\s*=\s*async/);
  assert.match(docs, /SSoT-presisering – Ukelønn v0\.14 LÅST/);
  assert.match(docs, /Nullstill alle demoendringer/);
});

test('Stoppeklokke candidate assessment is complete and retained in the broad review', () => {
  const app = catalog.apps.find((entry) => entry.slug === 'stoppeklokke');
  assert.ok(app, 'Stoppeklokke remains in the catalog');
  for (const field of ['status', 'source', 'sourceUncertainty', 'purpose', 'demoValue', 'simplifications', 'risk', 'scope']) {
    assert.equal(typeof app[field], 'string', `${field} is documented`);
    assert.ok(app[field].trim(), `${field} is not empty`);
  }
  assert.match(app.status, /broad first-round candidate review/i);
  assert.match(app.source, /v1\.2\.0/);
  assert.match(app.scope, /No authentication, server, API, external calls, browser storage/i);
  assert.match(app.sourceUncertainty, /rights remain unverified/i);

  const readme = read('vibe/stoppeklokke/README.md');
  for (const heading of ['Candidate assessment', 'Demo assessment', 'QA', 'Issue #2 progress']) {
    assert.ok(readme.includes(`## ${heading}`), `route README includes ${heading}`);
  }
  assert.match(readme, /0900ffe48fa92dcefae1c6d0bbee8e0d02eec530/);
  assert.match(readme, /rights to reuse source materials remain unverified/i);
  assert.match(readme, /Deployment and live-host QA have not been performed/i);
});

test('Timer faithful copy has source assessment, source controls, and accessible memory-only behavior', () => {
  const html = read('vibe/timer/index.html');
  const script = read('vibe/timer/app.js');
  const css = read('vibe/timer/style.css');
  const docs = read('vibe/timer/README.md');
  const app = catalog.apps.find((entry) => entry.slug === 'timer');

  assert.ok(app, 'timer candidate remains in the broad catalog');
  for (const field of ['status', 'sourceUncertainty', 'purpose', 'demoValue', 'simplifications', 'risk', 'scope']) {
    assert.equal(typeof app[field], 'string', `catalog records ${field}`);
    assert.ok(app[field].trim(), `catalog ${field} is documented`);
  }
  assert.match(html, /href="\/vibe\/timer\/"/, 'route declares its canonical URL');
  assert.match(html, /href="\/vibe\/"/g, 'route links back to the hub');
  assert.match(html, /Timer v1\.2\.0/, 'copied app version is identified');
  assert.match(html, /role="status"[^>]*aria-live="polite"/, 'status is announced accessibly');
  assert.match(html, /id="secs"[^>]*type="number"[^>]*min="1"[^>]*value="60"/, 'source duration input is preserved');
  for (const id of ['start', 'pause', 'reset']) assert.match(html, new RegExp(`id="${id}"`), `${id} control is present`);
  assert.match(script, /setInterval\(render, 200\)/, 'source countdown tick is preserved');
  assert.match(script, /remainingMs = getConfiguredMs\(\)/, 'reset returns to the currently configured duration');
  assert.doesNotMatch(script, /localStorage|sessionStorage|indexedDB|fetch\s*\(/, 'timer uses no storage or network');
  assert.match(css, /:focus-within|:focus-visible/, 'keyboard focus is visible');
  assert.match(css, /@media\s*\(max-width:/, 'layout adapts to small screens');
  assert.match(docs, /ingen automatiserte tester/i, 'source test uncertainty is recorded');
  assert.match(docs, /Kildeappen lagrer ikke timerverdien/i, 'source privacy behavior is explicit');
});

test('HTML-only app routes are valid deployment targets', () => {
  const htmlOnly = read('vibe/backyard-stats/index.html');
  assert.ok(statSync(path.join(vibeRoot, 'backyard-stats', 'index.html')).isFile());
  assert.doesNotMatch(htmlOnly, /<script\b/i);
  assert.doesNotMatch(htmlOnly, /<link[^>]+stylesheet/i);
  const workflow = read('.github/workflows/deploy-vibe-onecom.yml');
  assert.match(workflow, /Missing index\.html for/);
  assert.match(workflow, /\[ -f "vibe\/\$slug\/\$asset" \] \|\| continue/);
  assert.doesNotMatch(workflow, /test -f "\$stage\/\$slug\/app\.js"/);
  assert.doesNotMatch(workflow, /test -f "\$stage\/\$slug\/style\.css"/);
});

test('Bilag v5 showcase keeps PDF and ZIP workflow as a synthetic, status-only demo', () => {
  const html = read('vibe/bilag-v5/index.html');
  const styles = read('vibe/bilag-v5/style.css');
  const app = catalog.apps.find((entry) => entry.slug === 'bilag-v5');
  assert.ok(app, 'Bilag v5 remains in the broad catalog');
  assert.match(html, /href="\/vibe\/bilag-v5\/style\.css"/);
  assert.match(html, /<h2 id="pdf-title">PDF-behandling<\/h2>/);
  assert.match(html, /<h2 id="zip-title">ZIP-import<\/h2>/);
  assert.match(html, /Ikke en revisjonslogg/);
  assert.match(html, /Oppdiktet filnavn/);
  assert.match(html, /Oppdiktet pakkenavn/);
  assert.match(html, /ingen filer velges, leses, pakkes ut, konverteres, flyttes eller lastes ned/i);
  assert.match(html, /class="skip-link" href="#main"/);
  assert.match(styles, /@media\s*\(max-width:/);
  assert.match(read('vibe/assets/hub.css'), /:focus-visible/);
  assert.doesNotMatch(html, /<input\b|<form\b|<button\b/i);
});

test('Inntekter og kostnader audits the existing route without duplicating it', () => {
  const html = read('vibe/inntekter-kostnader/index.html');
  const script = read('vibe/inntekter-kostnader/app.js');
  const styles = read('vibe/inntekter-kostnader/style.css');
  const docs = read('vibe/inntekter-kostnader/README.md');
  const matches = catalog.apps.filter((entry) => entry.slug === 'inntekter-kostnader');

  assert.equal(matches.length, 1, 'the existing route has exactly one catalog entry');
  assert.equal(matches[0].name, 'Inntekter og kostnader');
  for (const field of ['status', 'sourceUncertainty', 'purpose', 'demoValue', 'simplifications', 'risk', 'scope', 'source', 'separation']) {
    assert.equal(typeof matches[0][field], 'string', `catalog records ${field}`);
    assert.ok(matches[0][field].trim(), `catalog ${field} is not empty`);
  }
  assert.match(html, /href="\/vibe\/inntekter-kostnader\/"/, 'direct route has a canonical URL');
  assert.match(html, /href="\/vibe\/"/, 'route links back to the hub');
  assert.match(html, /for="month-select"/, 'month selection has a visible label');
  assert.match(html, /Syntetiske eksempeldata/, 'the UI identifies synthetic finance examples');
  assert.match(html, /<a class="skip-link" href="#overview">/, 'keyboard users can skip to the demo');
  assert.doesNotMatch(script, /localStorage|sessionStorage|indexedDB/, 'month changes are not persisted');
  assert.match(script, /textContent\s*=/, 'rendered entry text uses textContent');
  assert.match(script, /income\s*-\s*data\.expenses/, 'balance is computed from example totals');
  assert.match(styles, /@media\s*\(max-width:/, 'layout adapts to narrow screens');
  assert.match(read('vibe/assets/hub.css') + styles, /:focus-visible|:focus-within/, 'interactive focus styling is present');
  assert.match(docs, /0900ffe48fa92dcefae1c6d0bbee8e0d02eec530/, 'source snapshot is recorded');
  assert.match(docs, /Ingen appversjon eller release-tag funnet/);
  assert.match(docs, /Ingen lisensfil eller uttrykkelig gjenbrukstillatelse/);
  assert.match(docs, /Ingen egne testfiler eller testkommando/);
  assert.match(docs, /Ingen innlogging eller brukeridentiteter/);
  assert.match(docs, /Issue #2:\*\* Delvis løst/);
});

test('Nedtelling candidate documents source uncertainty and keeps its existing route local and accessible', () => {
  const html = read('vibe/nedtelling/index.html');
  const script = read('vibe/nedtelling/app.js');
  const styles = read('vibe/nedtelling/style.css');
  const notes = read('vibe/nedtelling/README.md');
  const app = catalog.apps.find((entry) => entry.slug === 'nedtelling');

  assert.ok(app, 'candidate remains in the broad catalog');
  assert.equal(catalog.apps.filter((entry) => entry.slug === 'nedtelling').length, 1, 'slug is not duplicated');
  assert.match(app.status, /bred førstegangsvurdering/i);
  assert.match(app.sourceUncertainty, /ikke tilgjengelig/i);
  assert.match(notes, /Kildeversjon og kilde-stack:.*Ikke verifisert/s);
  assert.match(notes, /\*\*Rettigheter:\*\*\s*Uavklart/i);
  assert.match(html, /<main\b[^>]*id="builder"/i, 'route has a skip-link target');
  assert.match(html, /<a class="skip-link" href="#builder"/i, 'route exposes a keyboard skip link');
  assert.match(html, /<label for="title"/i, 'editable title has a visible label');
  assert.match(script, /addEventListener\(['"]submit['"],\s*\(event\)\s*=>\s*event\.preventDefault\(\)/);
  assert.doesNotMatch(script, /\b(?:fetch|localStorage|sessionStorage|indexedDB)\b/);
  assert.match(styles, /@media\s*\(max-width:\s*760px\)/, 'layout collapses on smaller screens');
  assert.match(styles, /prefers-reduced-motion:\s*reduce/, 'motion preference is respected');
});

test('route inventory has no duplicate app directory names', () => {
  const routeDirs = readdirSync(vibeRoot)
    .filter((name) => statSync(path.join(vibeRoot, name)).isDirectory() && name !== 'assets');
  const slugSet = new Set(catalog.apps.map((app) => app.slug));
  for (const route of routeDirs) {
    assert.ok(slugSet.has(route), `route folder ${route} has a catalog entry`);
  }
  assert.equal(routeDirs.length, slugSet.size, 'each catalog slug maps to exactly one route directory');
  for (const slug of slugSet) {
    assert.ok(routeDirs.includes(slug), `catalog slug ${slug} maps to a route directory`);
  }
});

test('demo routes stay static and form data cannot fall through to a GET or POST', () => {
  const allFiles = filesUnder(vibeRoot);
  const forbiddenServerExtensions = /\.(?:php|gs|sql|py|rb|pl|sh|env)$/i;
  const htmlFiles = allFiles.filter((file) => file.endsWith('.html'));
  const scriptFiles = allFiles.filter((file) => file.endsWith('.js'));
  const scripts = scriptFiles.map((file) => readFileSync(file, 'utf8')).join('\n');

  for (const file of allFiles) {
    assert.doesNotMatch(file, forbiddenServerExtensions, `${file} is not a server-side source/storage file`);
  }

  for (const file of htmlFiles) {
    const html = readFileSync(file, 'utf8');
    for (const match of html.matchAll(/<form\b([^>]*)>/gi)) {
      assert.doesNotMatch(match[1], /\baction\s*=/i, `${file} has no form action`);
      assert.doesNotMatch(match[1], /\bmethod\s*=\s*['"]?(?:get|post|put|delete)/i, `${file} has no network form method`);
      const linkedScripts = [...html.matchAll(/<script\b[^>]*\bsrc=['"]([^'"]+)['"]/gi)]
        .map((scriptMatch) => scriptMatch[1]);
      const pageScripts = linkedScripts.map((src) => {
        const relativePath = src.startsWith('/vibe/')
          ? src.slice('/vibe/'.length)
          : path.posix.join(path.posix.dirname(path.relative(vibeRoot, file)), src);
        const scriptPath = path.join(vibeRoot, relativePath.split('?')[0]);
        return statSync(scriptPath).isFile() ? readFileSync(scriptPath, 'utf8') : '';
      }).join('\n') + [...html.matchAll(/<script\b(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)].map((scriptMatch) => scriptMatch[1]).join('\n');
      if (path.relative(vibeRoot, file).startsWith(`arrangementsvakt${path.sep}`)) {
        assert.match(pageScripts, /preventDefault\(\)/, `${file} registers local submit handling`);
        assert.match(pageScripts, /demoApi/, `${file} routes actions to local simulation`);
      } else if (file.includes(`${path.sep}ukelonn${path.sep}`)) {
        assert.match(pageScripts, /addEventListener\(['"]submit['"]/i, `${file} handles forms in browser JavaScript`);
        assert.match(pageScripts, /preventDefault\(\)/, `${file} prevents browser form navigation`);
      } else {
        assert.ok(formHasSubmitGuard(match[1], pageScripts), `${file} prevents submission for its form`);
      }
    }
  }
});

test('form submission guard must target that exact form and prevent its default action', () => {
  const form = 'id="countdown-form"';
  assert.equal(formHasSubmitGuard(form, `const form = document.querySelector('#countdown-form'); form.addEventListener('submit', (event) => event.preventDefault());`), true);
  assert.equal(formHasSubmitGuard(form, `const other = document.querySelector('#other-form'); other.addEventListener('submit', (event) => event.preventDefault());`), false);
  assert.equal(formHasSubmitGuard(form, `const form = document.querySelector('#countdown-form'); form.addEventListener('submit', () => {});`), false);
  assert.equal(formHasSubmitGuard(form, `const form = document.getElementById('countdown-form'); form.addEventListener('submit', (event) => event.preventDefault());`), true);
  assert.equal(formHasSubmitGuard('id="form.one"', `const form = document.getElementById('form.one'); form.addEventListener('submit', (event) => event.preventDefault());`), true);
});

test('Gruppegenerator is a faithful synthetic local copy of the source workflow', () => {
  const app = catalog.apps.find((entry) => entry.slug === 'gruppegenerator');
  const html = read('vibe/gruppegenerator/index.html');
  const script = read('vibe/gruppegenerator/app.js');
  const css = read('vibe/gruppegenerator/style.css');
  const docs = read('vibe/gruppegenerator/README.md');

  assert.ok(app, 'candidate remains in the broad first-round catalog');
  for (const field of ['status', 'source', 'sourceUncertainty', 'sourceStack', 'sourceTests', 'sourceApiAuthStoragePrivacy', 'rightsUncertainty', 'purpose', 'demoValue', 'simplifications', 'risk', 'scope', 'routeState']) {
    assert.equal(typeof app[field], 'string', `${field} is documented`);
    assert.ok(app[field].trim(), `${field} is not empty`);
  }
  assert.match(app.status, /Beholdt i bred førstegangsrunde/);
  assert.match(app.source, /92379f1108ec71013a06c4e5976a6fe79de81a3e/);
  assert.match(html, /href="\/vibe\/"/);
  for (const id of ['names', 'method', 'amount', 'preview', 'generate', 'again', 'export', 'reset', 'move-controls', 'selected-student', 'target-group', 'move-selected', 'groups', 'status']) {
    assert.match(html, new RegExp(`id="${id}"`), `${id} workflow control exists`);
  }
  assert.match(html, /<label[^>]+for="names"/);
  assert.match(html, /Deltaker A[\s\S]*Deltaker H/);
  assert.match(html, /Kun lokal behandling/);
  assert.match(html, /role="status"/);
  for (const behavior of ['parseNames', 'plannedDistribution', 'makeGroups', 'makeXlsx', 'downloadXlsx', 'moveMember', 'shuffle', 'updatePreview']) {
    assert.match(script, new RegExp(`function ${behavior}\\(`), `${behavior} behavior exists`);
  }
  assert.match(script, /addEventListener\('keydown'/, 'manual moves work by keyboard');
  assert.match(script, /addEventListener\('drop'/, 'drag and drop workflow exists');
  assert.match(script, /updateMoveControls\(\)/, 'move controls refresh after a move');
  assert.match(css, /:focus-visible/);
  assert.match(css, /--red:\s*#a9283c/i);
  assert.match(css, /--red-dark:\s*#791b2b/i);
  assert.match(css, /--rose:\s*#f8e8e9/i);
  assert.match(css, /background:var\(--red\)/i);
  assert.match(css, /prefers-reduced-motion/);
  assert.match(css, /min-width:\s*320px/);
  assert.match(docs, /localStorage/);
  assert.match(docs, /Ingen merge, deploy/);
  assert.doesNotMatch(html + script, /fetch\s*\(|XMLHttpRequest|localStorage|sessionStorage|indexedDB|document\.cookie|https?:\/\//i);
});
