const DB='analog-synthesizer-local-library';
export function normalizeLibraryTargetSlot(v){const s=String(v||'');return s==='A'||s==='B'||/^pad:(?:[0-9]|1[01])$/.test(s)?s:''}
export function getLibraryLoadTargets(v){const s=normalizeLibraryTargetSlot(v);return s?[s]:['A','B']}
function open(){return new Promise((ok,no)=>{const r=indexedDB.open(DB,1);r.onupgradeneeded=()=>r.result.createObjectStore('files',{keyPath:'id'});r.onsuccess=()=>ok(r.result);r.onerror=()=>no(r.error)})}
async function run(mode,fn){const db=await open();return new Promise((ok,no)=>{const tx=db.transaction('files',mode),s=tx.objectStore('files');let req;try{req=fn(s)}catch(e){db.close();no(e);return}req.onsuccess=()=>ok(req.result);req.onerror=()=>no(req.error);tx.oncomplete=()=>db.close();tx.onerror=()=>no(tx.error)})}
export async function localLibraryList(){return (await run('readonly',s=>s.getAll())).sort((a,b)=>b.createdAt.localeCompare(a.createdAt)).map(({blob,...x})=>x)}
export function localLibraryPut(file){const id=crypto.randomUUID();return run('readwrite',s=>s.put({id,name:file.name,size:file.size,type:file.type,createdAt:new Date().toISOString(),blob:file}))}
export function localLibraryGet(id){return run('readonly',s=>s.get(id))}
export function localLibraryDelete(id){return run('readwrite',s=>s.delete(id))}
