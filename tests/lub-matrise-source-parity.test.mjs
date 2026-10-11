import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const html = await readFile(new URL('../vibe/lub-matrise/index.html', import.meta.url), 'utf8');

test('LUB demo retains the source workflow and complete 28-plan dataset', () => {
  assert.match(html, /28 katalogoppføringer|28 offentlige studieplaner/);
  assert.equal((html.match(/"catalogId":"thyf-/g) ?? []).length, 28);
  for (const feature of ['programSearch', 'programSelect', 'matrixContainer', 'overviewContainer', 'noteDialog', 'addCourse', 'addOutcome', 'downloadExcel', 'downloadExcelTemplate', 'importExcel']) {
    assert.match(html, new RegExp(feature));
  }
});

test('demo storage is local, isolated, clearly disclosed, and resettable', () => {
  assert.match(html, /vibeLubPilotV1/);
  assert.doesNotMatch(html, /localStorage\.(?:getItem|setItem|removeItem)\(['"]lubPilotV1['"]/);
  assert.match(html, /resetDemoData/);
  assert.match(html, /Ikke skriv inn personopplysninger/);
  assert.match(html, /Ingen data sendes til server/);
  assert.doesNotMatch(html, /\b(?:fetch\s*\(|XMLHttpRequest|sendBeacon\s*\()/);
});

test('route links back to hub and keeps the source reliability warning', () => {
  assert.match(html, /href="\/vibe\/"/);
  assert.match(html, /Kontroller innholdet mot gjeldende studieplan/);
});
