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
    `(?:const|let|var)\\s+(\\w+)\\s*=\\s*document\\.(?:querySelector\\(\\s*['"]#${escapedId}['"]\\s*\\)|getElementById\\(\\s*['"]${escapedId}['"]\\s*\\))`,
  );
  const formVariable = pageScripts.match(selectorPattern)?.[1];
  if (!formVariable) return false;
  const submitPattern = new RegExp(
    `\\b${formVariable}\\.addEventListener\\(\\s*['"]submit['"]\\s*,\\s*\\(\\s*\\w+\\s*\\)\\s*=>\\s*\\w+\\.preventDefault\\(\\)`,
  );
  return submitPattern.test(pageScripts);
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
  const runtimeFiles = filesUnder(vibeRoot).filter((file) => /\.(?:html|js|css|json)$/i.test(file));
  const secretPatterns = [
    /\bAKIA[0-9A-Z]{16}\b/,
    /\bgh[pousr]_[A-Za-z0-9]{20,}\b/,
    /\bAIza[0-9A-Za-z_-]{30,}\b/,
  ];
  const hubScript = path.join(vibeRoot, 'assets/hub.js');

  for (const file of runtimeFiles) {
    const source = readFileSync(file, 'utf8');
    assert.doesNotMatch(source, /\b(?:localStorage|sessionStorage|indexedDB)\b/, `${file} has no browser persistence`);
    assert.doesNotMatch(source, /\bdocument\.cookie\b/, `${file} does not read/write cookies`);
    assert.doesNotMatch(source, /\b(?:XMLHttpRequest|sendBeacon)\b/, `${file} has no alternate network transport`);
    assert.doesNotMatch(source, /<input\b[^>]*\btype\s*=\s*['"]password['"]/i, `${file} has no real password field`);
    assert.doesNotMatch(source, /\b(?:Authorization\s*:\s*['"]?Bearer|credentials\s*:\s*['"]include)/i, `${file} has no authenticated network request`);
    assert.doesNotMatch(source, /https?:\/\//i, `${file} has no external runtime URL`);
    for (const secretPattern of secretPatterns) {
      assert.doesNotMatch(source, secretPattern, `${file} has no recognizable secret pattern`);
    }
    if (file.endsWith('.js') && file !== hubScript) {
      assert.doesNotMatch(source, /\bfetch\s*\(/, `${file} makes no API/network call`);
    }
  }

  const hub = readFileSync(hubScript, 'utf8');
  assert.match(hub, /fetch\s*\(\s*['"]\/vibe\/catalog\.json['"]/, 'hub only fetches the static catalog');
});

test('Nedtelling e-post is a local canvas preview with an accessible direct route', () => {
  const html = read('vibe/nedtelling-epost/index.html');
  const script = read('vibe/nedtelling-epost/app.js');
  const app = catalog.apps.find((entry) => entry.slug === 'nedtelling-epost');
  assert.ok(app, 'candidate remains in the broad catalog');
  assert.match(html, /href="\/vibe\/nedtelling-epost\/"/, 'route has a canonical direct URL');
  assert.match(html, /href="\/vibe\/"/g, 'route links back to the hub');
  assert.match(html, /<canvas\b[^>]*\brole="img"[^>]*\baria-label=/i, 'canvas has an accessible text alternative');
  assert.match(html, /Syntetisk eksempel/, 'preview is marked as synthetic');
  assert.match(script, /getContext\(['"]2d['"]\)/, 'preview is drawn locally on canvas');
  assert.match(script, /preventDefault\(\)/, 'form submit is explicitly blocked');
  assert.match(script, /addEventListener\(['"]click['"]/, 'reset control is interactive');
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
      assert.doesNotMatch(match[1], /\b(?:action|method)\s*=/i, `${file} has no form action or network method`);
      const linkedScripts = [...html.matchAll(/<script\b[^>]*\bsrc=['"]([^'"]+)['"]/gi)]
        .map((scriptMatch) => scriptMatch[1]);
      const pageScripts = linkedScripts.map((src) => {
        const relativePath = src.startsWith('/vibe/')
          ? src.slice('/vibe/'.length)
          : path.posix.join(path.posix.dirname(path.relative(vibeRoot, file)), src);
        const scriptPath = path.join(vibeRoot, relativePath);
        return statSync(scriptPath).isFile() ? readFileSync(scriptPath, 'utf8') : '';
      }).join('\n');
      assert.ok(formHasSubmitGuard(match[1], pageScripts), `${file} prevents submission for its form`);
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
