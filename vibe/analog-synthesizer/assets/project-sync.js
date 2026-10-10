const PROJECTS_KEY = 'analog-synthesizer:local-projects:v1';
const CURRENT_KEY = 'analog-synthesizer:local-project:v1';
const readProjects = () => { try { return JSON.parse(localStorage.getItem(PROJECTS_KEY)) || {}; } catch { return {}; } };
const writeProjects = (projects) => localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
export class ProjectSync {
  constructor({ onState, onStatus, onError }) { this.onState = onState; this.onStatus = onStatus; this.onError = onError; this.projectId = localStorage.getItem(CURRENT_KEY) || ''; this.revision = 0; this.timer = 0; this.applyingRemote = false; }
  setLocalProject(projectId) { this.projectId = String(projectId || '').trim().toUpperCase(); if(this.projectId)localStorage.setItem(CURRENT_KEY,this.projectId); }
  forget() { this.projectId = ''; localStorage.removeItem(CURRENT_KEY); clearTimeout(this.timer); this.onStatus?.('Kun lokalt', false); }
  schedule(state) { if (!this.projectId || this.applyingRemote) return; clearTimeout(this.timer); this.timer = setTimeout(() => this.save(state).catch((e) => this.fail(e)), 500); }
  cancelScheduledSave() { clearTimeout(this.timer); }
  async create(state) { const id = `LOCAL-${crypto.randomUUID().slice(0, 8).toUpperCase()}`; this.setLocalProject(id); const projects = readProjects(); projects[id] = { state, updatedAt: new Date().toISOString() }; writeProjects(projects); this.onStatus?.('Lagret lokalt', true); return { projectId: id, revision: 1 }; }
  async load(projectId = this.projectId) { this.setLocalProject(projectId); const project = readProjects()[this.projectId]; if (!project) throw new Error('Fant ikke et lokalt prosjekt på denne enheten.'); await new Promise(resolve => setTimeout(resolve, 0)); this.applyingRemote = true; try { await this.onState?.(project.state); } finally { this.applyingRemote = false; } this.onStatus?.('Lokalt prosjekt', true); return { state: project.state, revision: 1 }; }
  async save(state) { if (!this.projectId) throw new Error('Opprett eller velg et lokalt prosjekt først.'); const projects = readProjects(); if (!projects[this.projectId]) throw new Error('Fant ikke det lokale prosjektet.'); projects[this.projectId] = { state, updatedAt: new Date().toISOString() }; writeProjects(projects); this.onStatus?.('Lagret lokalt', true); return { revision: 1 }; }
  fail(error) { this.onStatus?.('Kun lokalt', false); this.onError?.(error); }
}
