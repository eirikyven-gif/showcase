const DB='analog-synthesizer-local-recordings';
function open(){return new Promise((ok,no)=>{const r=indexedDB.open(DB,1);r.onupgradeneeded=()=>r.result.createObjectStore('recordings',{keyPath:'id'});r.onsuccess=()=>ok(r.result);r.onerror=()=>no(r.error)})}
async function run(mode,fn){const db=await open();return new Promise((ok,no)=>{const tx=db.transaction('recordings',mode),s=tx.objectStore('recordings');let r;try{r=fn(s)}catch(e){db.close();no(e);return}r.onsuccess=()=>ok(r.result);r.onerror=()=>no(r.error);tx.oncomplete=()=>db.close();tx.onerror=()=>no(tx.error)})}
export class SharedRecordingLibrary {
 async list(){const files=await run('readonly',s=>s.getAll());return {files:files.map(({blob,...f})=>f),usage:files.reduce((a,f)=>a+f.size,0),limits:{bytes:25*1024*1024}}}
 async upload(blob,{name,duration,source}){const id=crypto.randomUUID();await run('readwrite',s=>s.put({id,name,duration,source,size:blob.size,createdAt:new Date().toISOString(),blob}));return {id}}
 async download(id){const r=await run('readonly',s=>s.get(id));if(!r)throw new Error('Opptaket finnes ikke lokalt.');return r.blob}
 async remove(id){return run('readwrite',s=>s.delete(id))}
}
