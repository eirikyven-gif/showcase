import { getLibraryLoadTargets, normalizeLibraryTargetSlot } from './local-library.js';
export { getLibraryLoadTargets, normalizeLibraryTargetSlot };
export class LocalSampleLibrary {
  async list() { return { files: await localLibraryList(), limits: { files: 100, bytes: 200 * 1024 * 1024 } }; }
  async upload(fileList) { const files = Array.from(fileList || []); for (const file of files) await localLibraryPut(file); return { uploaded: files.length }; }
  async download(id) { const item = await localLibraryGet(id); if (!item) throw new Error('Fant ikke lydfilen i det lokale biblioteket.'); return item.blob; }
  async remove(id) { await localLibraryDelete(id); return { deleted: true }; }
}
import { localLibraryDelete, localLibraryGet, localLibraryList, localLibraryPut } from './local-library.js';
