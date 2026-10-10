import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=file=>readFileSync(path.join(root,file),'utf8');
test('Arrangementsvakt is a faithful local copy with privacy boundaries and full reset',()=>{
 const html=read('vibe/arrangementsvakt/index.html'), app=read('vibe/arrangementsvakt/assets/app.js'), api=read('vibe/arrangementsvakt/assets/demo-api.js'), css=read('vibe/arrangementsvakt/assets/showcase.css'), docs=read('vibe/arrangementsvakt/README.md'), cat=JSON.parse(read('vibe/catalog.json'));
 const entry=cat.apps.find(x=>x.slug==='arrangementsvakt'); assert.ok(entry);
 for(const k of ['source','sourceStack','sourceTests','sourceApiAuthStoragePrivacy','rightsUncertainty','purpose','demoValue','simplifications','risk','scope','routeState']) assert.ok(entry[k]);
 assert.match(html,/href="\/vibe\/arrangementsvakt\/"/);assert.match(html,/href="\/vibe\/"/);assert.match(html,/id="demoReset"/);assert.match(html,/Syntetiske eksempler/);
 for(const feature of ['Løpsleder','Ledelse','Teamleder','Medlem','Hendelser','Grupper','Meldinger','Administrasjon']) assert.ok(html.includes(feature),`source surface ${feature}`);
 assert.match(api,/localStorage\.setItem\(KEY/);assert.match(api,/localStorage\.removeItem\(KEY/);assert.match(api,/000000000/);assert.match(app,/vibe\.arrangementsvakt\.offlineIncidents/);
 for(const file of [html,app,api]) assert.doesNotMatch(file,/\bfetch\s*\(|XMLHttpRequest|sendBeacon|document\.cookie|https?:\/\//i);
 assert.doesNotMatch(api,/api\/[a-z-]+\.php/i); assert.match(css,/:focus-visible/);assert.match(css,/@media\(max-width:640px\)/);assert.match(docs,/Issue #2/);assert.match(docs,/Nullstill all demoaktivitet/);
});
