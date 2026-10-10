import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const read = (p) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const html=read('vibe/wp-varelager/index.html'), js=read('vibe/wp-varelager/app.js'), css=read('vibe/wp-varelager/style.css');
const catalog=JSON.parse(read('vibe/catalog.json'));
test('WP Varelager route records archive provenance and a static synthetic scope',()=>{
 const app=catalog.apps.find(x=>x.slug==='wp-varelager');assert.ok(app);assert.match(app.source,/e080136b7b0bc20e1885c9c9456f7143ca170861/);assert.match(app.sourceUncertainty,/7506300fcd587546f7772e1cab4d55293bd7b947/);assert.match(app.status,/avgrenset/);assert.match(html,/Syntetisk demonstrasjon/);assert.match(html,/forsvinner når siden lastes på nytt/);
});
test('the route has local inventory actions and all seven source portal areas',()=>{
 for(const label of ['Utstyr','Utleie','Rapporter','Delte lister','Import/eksport','Lageropptelling','Innstillinger'])assert.match(html,new RegExp(label.replace('/','\\/')));
 for(const action of ['edit','adjust','delete','count','export','share'])assert.match(js,new RegExp(`['"]${action}['"]`));
 assert.match(js,/addEventListener\(['"]submit['"]/);assert.match(js,/preventDefault\(\)/);
});
test('no persistence, credentials, APIs, uploads or external assets are included',()=>{
 for(const source of [html,js,css]){assert.doesNotMatch(source,/https?:\/\//i);assert.doesNotMatch(source,/\b(fetch|XMLHttpRequest|localStorage|sessionStorage|indexedDB|document\.cookie)\b/);assert.doesNotMatch(source,/wp_ajax|wp_remote_|wp_nonce|password|secret/i)}
 assert.doesNotMatch(html,/type="file"/ , 'no hidden upload input');assert.match(html,/href="\/vibe\/assets\/hub\.css"/);
});
