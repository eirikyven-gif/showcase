import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const read = (file) => readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
const catalog = JSON.parse(read('vibe/catalog.json'));

test('Dugnadsplanlegging retains its full source assessment and one direct route', () => {
  const matches=catalog.apps.filter(a=>a.slug==='dugnadsplanlegging'); assert.equal(matches.length,1);
  const app=matches[0];
  for(const field of ['source','sourceStack','sourceTests','sourceApiAuthStoragePrivacy','rightsUncertainty','purpose','demoValue','simplifications','risk','scope','routeState']) assert.ok(app[field],field);
  assert.match(app.source,/0900ffe48fa92dcefae1c6d0bbee8e0d02eec530/);
  assert.match(app.status,/tro, trygg showcase-kopi/);
  assert.match(app.scope,/localStorage/);
});
test('The copy includes the original admin workflow and local synthetic public surfaces',()=>{
 const html=read('vibe/dugnadsplanlegging/index.html'), js=read('vibe/dugnadsplanlegging/app.js'), pub=read('vibe/dugnadsplanlegging/public.js'), css=read('vibe/dugnadsplanlegging/style.css');
 for(const label of ['Vaktplan','Oppslag','Oppgavesøk','SMS','Oversikt','Påmelding','Offentlig oversikt','Dugnader og roller']) assert.ok(html.includes(label)||pub.includes(label),label);
 for(const term of ['saveContact','saveShift','saveAssignment','importBackup','exportBackup','resetData','coverageSummary']) assert.ok(js.includes(term),term);
 assert.match(pub,/id="demo-signup"/); assert.match(pub,/Syntetisk demo-påmelding/); assert.match(pub,/Offentlig oversikt/); assert.match(pub,/Syntetisk påmeldt/);
 assert.match(js,/Deltaker A/); assert.match(js,/demo-shift-4/); assert.match(js,/localStorage\.removeItem\(key\)/);
 assert.match(html,/Syntetisk demo · lagres bare på denne enheten/); assert.match(html,/href="\/vibe\/"/);
 assert.match(css,/--accent:#a9283c/); assert.match(css,/:focus-visible/); assert.match(css,/@media \(max-width:700px\)/);
});
test('Demo has no server calls, secrets, auth, cookies, or real SMS execution',()=>{
 const files=['index.html','app.js','public.js','timeline.js','issue320.js','issue322.js','norsk.js','style.css'].map(f=>read(`vibe/dugnadsplanlegging/${f}`)).join('\n');
 assert.doesNotMatch(files,/fetch\s*\(|XMLHttpRequest|sendBeacon|https?:\/\/|document\.cookie|sessionStorage|indexedDB/);
 assert.doesNotMatch(files,/type=["']password|Authorization\s*:|credentials\s*:/i);
 assert.doesNotMatch(files,/AKIA[0-9A-Z]{16}|gh[pousr]_[A-Za-z0-9]{20,}|AIza[0-9A-Za-z_-]{30,}/);
 assert.doesNotMatch(files,/send smsMessage to targetBuddy|AppleScript kjort/);
 assert.match(files,/localStorage/);
});
test('All forms are client handled and runtime assets remain local',()=>{
 const html=read('vibe/dugnadsplanlegging/index.html');
 assert.match(html,/class="vibe-skip" href="#main"/);
 assert.match(html,/src="app.js" defer/);
 for(const match of html.matchAll(/<form\b([^>]*)>/gi)) assert.doesNotMatch(match[1],/\b(action|method)\s*=/i);
});
