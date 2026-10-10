import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=(p)=>readFileSync(path.join(root,p),'utf8');
const route='vibe/analog-synthesizer/';
const catalog=JSON.parse(read('vibe/catalog.json'));
test('catalog records the source, local-only adaptation, and unresolved rights/deploy uncertainty',()=>{
 const matches=catalog.apps.filter(x=>x.slug==='analog-synthesizer'); assert.equal(matches.length,1);
 const app=matches[0]; assert.match(app.status,/partially resolved/i); assert.match(app.source,/0900ffe48fa92dcefae1c6d0bbee8e0d02eec530/);
 assert.match(app.sourceApiAuthStoragePrivacy,/localStorage/); assert.match(app.sourceApiAuthStoragePrivacy,/IndexedDB/);
 assert.match(app.risk,/sensitive/); assert.match(app.routeState,/not merged|ikke/i);
});
test('route preserves major instrument workflows and gives a local-only disclosure/reset',()=>{
 const html=read(route+'index.html'), app=read(route+'assets/app.js'), docs=read(route+'README.md');
 for(const label of ['Sequencer','Mikrofon','Voice FX','Sample A','Sample B','Pad Sampler','MIDI-oppsett','Opptaker','Rediger moduler']) assert.ok(html.includes(label),`route has ${label}`);
 assert.match(html,/Kun på denne enheten/); assert.match(html,/Slett alle lokale data/);
 assert.match(app,/getUserMedia|startMicrophone/); assert.match(app,/requestMIDIAccess/); assert.match(app,/MediaRecorder|startSupportRecording/);
 assert.match(docs,/0900ffe48fa92dcefae1c6d0bbee8e0d02eec530/); assert.match(docs,/No PHP endpoints/);
});
test('projects, samples and recordings persist only in browser storage; remote auth/APIs are absent',()=>{
 const sourceFiles=['index.html',...readdirSync(path.join(root,route+'assets')).filter(x=>x.endsWith('.js')).map(x=>'assets/'+x)].map(x=>read(route+x)).join('\n');
 assert.match(read(route+'assets/project-sync.js'),/localStorage/);
 assert.match(read(route+'assets/local-library.js'),/indexedDB/); assert.match(read(route+'assets/shared-recording-library.js'),/indexedDB/);
 assert.match(read(route+'assets/local-data.js'),/deleteDatabase/); assert.doesNotMatch(read(route+'assets/project-sync.js'),/fetch\s*\(|PIN|credential/i);
 assert.doesNotMatch(read(route+'assets/local-library.js')+read(route+'assets/shared-recording-library.js'),/fetch\s*\(|https?:\/\//i);
 assert.doesNotMatch(sourceFiles,/api\/(?:projects|sample-library|recording-library)\.php|Authorization\s*:/i);
 assert.ok(!readdirSync(path.join(root,route)).some(x=>x==='api'));
});
test('local project create, save and reopen round-trip without a credential',async()=>{
 const original=globalThis.localStorage; const rows=new Map();
 globalThis.localStorage={getItem:key=>rows.get(key)??null,setItem:(key,value)=>rows.set(key,String(value)),removeItem:key=>rows.delete(key)};
 try {
  const {ProjectSync}=await import('../vibe/analog-synthesizer/assets/project-sync.js');
  let loaded=null; const project=new ProjectSync({onState:async state=>{loaded=state}});
  const created=await project.create({pattern:'synthetic'}); assert.match(created.projectId,/^LOCAL-/);
  await project.save({pattern:'updated'}); await project.load(created.projectId);
  assert.deepEqual(loaded,{pattern:'updated'}); assert.equal(rows.get('analog-synthesizer:local-project:v1'),created.projectId);
  assert.equal([...rows.keys()].some(key=>/pin|token|credential/i.test(key)),false);
 } finally { if(original===undefined) delete globalThis.localStorage; else globalThis.localStorage=original; }
});
