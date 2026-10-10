export async function resetLocalData(){
 for(const key of Object.keys(localStorage)) if(key.startsWith('analog-synthesizer:')||key.startsWith('analog-synth:')) localStorage.removeItem(key);
 for(const name of ['analog-synthesizer-samples','analog-synthesizer-local-library','analog-synthesizer-local-recordings']) await new Promise(resolve=>{const req=indexedDB.deleteDatabase(name);req.onsuccess=req.onerror=req.onblocked=()=>resolve()});
 if('caches' in window){for(const key of await caches.keys())if(key.startsWith('analog-synthesizer-'))await caches.delete(key)}
}
