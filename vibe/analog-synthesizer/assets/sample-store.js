import { PAD_COUNT, SAMPLE_SLOTS } from './state.js?build=2026-10-10.1';

const DB_NAME = 'analog-synthesizer-samples';
const DB_VERSION = 1;
const STORE_NAME = 'samples';

function assertSlot(slot) {
  if (!SAMPLE_SLOTS.includes(slot)) throw new Error(`Ugyldig sampleplass: ${slot}`);
}

export function padSampleStorageKey(index) {
  const normalized = Number(index);
  if (!Number.isInteger(normalized) || normalized < 0 || normalized >= PAD_COUNT) {
    throw new Error(`Ugyldig pad: ${index}`);
  }
  return `pad:${String(normalized + 1).padStart(2, '0')}`;
}

function openDatabase() {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in globalThis)) {
      reject(new Error('IndexedDB støttes ikke av nettleseren.'));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error || new Error('Kunne ikke åpne samplelageret.'));
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) database.createObjectStore(STORE_NAME, { keyPath: 'slot' });
    };
    request.onsuccess = () => resolve(request.result);
  });
}

function transact(mode, operation) {
  return openDatabase().then((database) => new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, mode);
    const store = transaction.objectStore(STORE_NAME);
    let request;
    try { request = operation(store); } catch (error) { database.close(); reject(error); return; }
    request.onerror = () => reject(request.error || new Error('Samplelager-operasjonen feilet.'));
    request.onsuccess = () => resolve(request.result);
    transaction.oncomplete = () => database.close();
    transaction.onerror = () => { database.close(); reject(transaction.error || new Error('Samplelager-transaksjonen feilet.')); };
  }));
}

export function putSample(slot, blob, metadata = {}) {
  assertSlot(slot);
  if (!(blob instanceof Blob)) return Promise.reject(new TypeError('Sampledata må være en Blob.'));
  return transact('readwrite', (store) => store.put({ slot, blob, metadata, savedAt: new Date().toISOString() }));
}

export function getSample(slot) {
  assertSlot(slot);
  return transact('readonly', (store) => store.get(slot));
}

export function deleteSample(slot) {
  assertSlot(slot);
  return transact('readwrite', (store) => store.delete(slot));
}

export function putPadSample(index, blob, metadata = {}) {
  const slot = padSampleStorageKey(index);
  if (!(blob instanceof Blob)) return Promise.reject(new TypeError('Sampledata må være en Blob.'));
  return transact('readwrite', (store) => store.put({ slot, blob, metadata, savedAt: new Date().toISOString() }));
}

export function getPadSample(index) {
  return transact('readonly', (store) => store.get(padSampleStorageKey(index)));
}

export function deletePadSample(index) {
  return transact('readwrite', (store) => store.delete(padSampleStorageKey(index)));
}

export async function listSamples() {
  const database = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, 'readonly');
    const request = transaction.objectStore(STORE_NAME).getAll();
    request.onerror = () => reject(request.error || new Error('Kunne ikke lese samplelageret.'));
    request.onsuccess = () => resolve(request.result || []);
    transaction.oncomplete = () => database.close();
  });
}
