'use strict';

const STORAGE_KEY = 'vibe.gardsbehov.synthetic.v1';
const seedCases = [
  { id: 'GB-104', title: 'Portlås trenger justering', context: 'Verksted · fiktivt', category: 'Vedlikehold', description: 'En port i det oppdiktede verkstedet går tregt igjen. Låsen ser hel ut, men bør kontrolleres.', impact: 3, urgency: 2, safety: false, status: 'Under vurdering', assignee: 'Ikke tildelt', due: 'Ingen frist', events: [{ label: 'Behov meldt', text: 'Syntetisk eksempel opprettet.', when: '12. mai · 09:20' }, { label: 'Vurdering startet', text: 'Venter på prioritering og ansvarlig.', when: '12. mai · 09:24' }] },
  { id: 'GB-105', title: 'Lysrør har sluttet å virke', context: 'Driftsbygning · fiktivt', category: 'Vedlikehold', description: 'Belysningen i et oppdiktet rom bør skiftes ved anledning.', impact: 1, urgency: 1, safety: false, status: 'Pågår', assignee: 'Eksempelrolle · Utførende', due: '20. mai', events: [{ label: 'Behov meldt', text: 'Syntetisk eksempel opprettet.', when: '13. mai · 10:05' }, { label: 'Tildelt', text: 'Eksempelrolle · Utførende', when: '13. mai · 10:12' }, { label: 'Pågår', text: 'Arbeid startet i eksempelet.', when: '14. mai · 08:00' }] },
  { id: 'GB-099', title: 'Hylle er kontrollert', context: 'Verksted · fiktivt', category: 'Forbedring', description: 'Et avsluttet, oppdiktet eksempel for å vise arkivvisningen.', impact: 1, urgency: 1, safety: false, status: 'Lukket', assignee: 'Eksempelrolle · Utførende', due: '18. mai', events: [{ label: 'Behov meldt', text: 'Syntetisk eksempel opprettet.', when: '08. mai · 11:10' }, { label: 'Ferdig', text: 'Kontroll fullført i eksempelet.', when: '09. mai · 14:10' }, { label: 'Lukket', text: 'Gjennomgått av eksempelrolle · Driftsansvarlig.', when: '10. mai · 09:15' }] },
];
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
let cases = loadCases();
let activeCaseId = null;

function loadCases() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (Array.isArray(stored) && stored.every((item) => item && typeof item.id === 'string' && Array.isArray(item.events))) return stored;
  } catch { /* Private browsing or disabled storage: the in-memory demo still works. */ }
  return structuredClone(seedCases);
}
function persist() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(cases)); }
  catch { announce('Nettleseren blokkerte lokal lagring. Endringene finnes bare til siden lukkes.'); }
}
function announce(message) { $('#notice').textContent = message; }
function priority(item) { return Number(item.impact) * Number(item.urgency) + Number(item.safety || 0); }
function priorityName(score) { return score >= 6 ? 'Høy' : score >= 3 ? 'Middels' : score > 0 ? 'Lav' : 'Ingen utslag'; }
function active(item) { return !['Lukket', 'Avvist'].includes(item.status); }
function escapeText(value) { return String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]); }

function card(item) {
  const score = priority(item);
  return `<button class="case-card" type="button" data-case="${escapeText(item.id)}"><span class="case-card-top"><span class="case-id">${escapeText(item.id)}</span><span class="priority ${priorityName(score).toLowerCase().replaceAll(' ', '-')}">${priorityName(score)} · ${score}</span></span><strong>${escapeText(item.title)}</strong><span>${escapeText(item.context)} · ${escapeText(item.category)}</span><span class="case-card-bottom">${escapeText(item.status)}<span>${escapeText(item.assignee)}</span></span></button>`;
}
function renderList(kind) {
  const target = kind === 'mine' ? $('#mine-list') : kind === 'oversikt' ? $('#oversikt-list') : $('#archive-list');
  const query = ($(`[data-filter="${kind}"]`)?.value || '').trim().toLocaleLowerCase('nb');
  const status = $(`[data-status-filter="${kind}"]`)?.value;
  let result = cases.filter((item) => kind === 'arkiv' ? !active(item) : active(item));
  result = result.filter((item) => `${item.id} ${item.title} ${item.context}`.toLocaleLowerCase('nb').includes(query));
  if (status) result = result.filter((item) => item.status === status);
  if (kind === 'oversikt' && $('[data-priority-filter]').value) result = result.filter((item) => priorityName(priority(item)) === $('[data-priority-filter]').value);
  target.innerHTML = result.length ? result.map(card).join('') : '<p class="empty">Ingen saker passer til utvalget.</p>';
}
function renderAll() { ['mine', 'oversikt', 'arkiv'].forEach(renderList); }
function showView(name) {
  $('#case-panel').hidden = true;
  $$('.view').forEach((view) => { view.hidden = view.id !== `view-${name}`; });
  $$('[data-view]').forEach((tab) => tab.setAttribute('aria-current', tab.dataset.view === name ? 'page' : 'false'));
}
function eventMarkup(item) {
  return item.events.map((event) => `<li><span class="event-dot" aria-hidden="true"></span><div><strong>${escapeText(event.label)}</strong><p>${escapeText(event.text)}</p><time>${escapeText(event.when)}</time></div></li>`).join('');
}
function detail(item) {
  if (!item) return;
  activeCaseId = item.id;
  $$('.view').forEach((view) => { view.hidden = true; });
  $$('.tabs [data-view]').forEach((tab) => tab.setAttribute('aria-current', 'false'));
  const score = priority(item);
  const role = $('#role').value;
  const canAssess = role === 'Driftsansvarlig' || role === 'Utvikler';
  const canWork = role === 'Utførende' || canAssess;
  const actions = active(item) ? `<div class="case-actions">${canAssess ? `<label>Tildel til<select id="assignee"><option>Ikke tildelt</option><option>Eksempelrolle · Utførende</option><option>Ekstern aktør · Verkstedservice</option></select></label><button type="button" class="button secondary" data-action="assign">Lagre tildeling</button>` : ''}${canWork ? `<label>Oppdater status<select id="next-status">${['Under vurdering','Tildelt','Pågår','Ferdig','Avvist','Lukket'].map((s) => `<option ${s === item.status ? 'selected' : ''}>${s}</option>`).join('')}</select></label><button type="button" class="button secondary" data-action="status">Lagre status</button>` : ''}<label>Hendelsesnotat<select id="note"><option>Kontroll planlagt i eksempelet.</option><option>Venter på deler i eksempelet.</option><option>Arbeid kontrollert i eksempelet.</option></select></label><button type="button" class="button secondary" data-action="note">Legg til notat</button></div>` : '<p class="help">Saken er avsluttet og vises skrivebeskyttet i arkivet.</p>';
  $('#case-content').innerHTML = `<div class="case-detail-heading"><div><p class="case-id">SAK ${escapeText(item.id)} · SYNTETISK</p><h2 id="case-panel-title">${escapeText(item.title)}</h2></div><span class="status-badge">${escapeText(item.status)}</span></div><p class="case-description">${escapeText(item.description)}</p><dl class="facts"><div><dt>Sted/objekt</dt><dd>${escapeText(item.context)}</dd></div><div><dt>Sakstype</dt><dd>${escapeText(item.category)}</dd></div><div><dt>Ansvarlig</dt><dd>${escapeText(item.assignee)}</dd></div><div><dt>Frist</dt><dd>${escapeText(item.due)}</dd></div></dl><section class="assessment"><div class="assessment-heading"><h3>Prioriteringsgrunnlag</h3><span class="score">${score} <small>/ 12</small></span></div><div class="score-track"><span style="width:${Math.min(100, score / 12 * 100)}%"></span></div><div class="score-key"><span>Produksjon/drift <strong>${item.impact} / 3</strong></span><span>Hast <strong>${item.urgency} / 3</strong></span><span>HMS/sikkerhet <strong>${item.safety || 0} / 3</strong></span></div><p class="formula-note">Kildens modell: produksjon/drift × hast + HMS/sikkerhet. Prioritet: 0 ingen utslag, 1–2 lav, 3–5 middels, 6–12 høy.</p></section><section class="timeline"><div class="timeline-heading"><h3>Hendelseshistorikk</h3><span>${item.events.length} syntetiske hendelser</span></div><ol class="events">${eventMarkup(item)}</ol></section>${actions}`;
  $('#case-panel').hidden = false;
  $('#case-panel').scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
}
function log(item, label, text) {
  item.events.push({ label, text, when: 'Nå · demo' });
  persist(); renderAll(); detail(item);
}

$$('[data-view]').forEach((tab) => tab.addEventListener('click', () => showView(tab.dataset.view)));
$$('[data-open]').forEach((button) => button.addEventListener('click', () => showView(button.dataset.open)));
$$('[data-filter]').forEach((input) => input.addEventListener('input', () => renderList(input.dataset.filter)));
$$('[data-status-filter], [data-priority-filter]').forEach((select) => select.addEventListener('change', () => renderList(select.dataset.statusFilter ? 'mine' : 'oversikt')));
document.addEventListener('click', (event) => {
  const caseButton = event.target.closest('[data-case]');
  if (caseButton) detail(cases.find((item) => item.id === caseButton.dataset.case));
  const action = event.target.closest('[data-action]')?.dataset.action;
  if (!action) return;
  const item = cases.find((candidate) => candidate.id === activeCaseId);
  if (!item) return;
  if (action === 'assign') { item.assignee = $('#assignee').value; log(item, 'Tildeling endret', item.assignee); }
  if (action === 'status') {
    const next = $('#next-status').value;
    if (next === 'Lukket' && $('#role').value !== 'Driftsansvarlig' && $('#role').value !== 'Utvikler') return announce('I kilden lukker Driftsansvarlig etter kontroll. Velg den simulerte rollen for å se denne overgangen.');
    item.status = next; log(item, `Status: ${next}`, 'Statusovergang simulert i nettleseren.');
  }
  if (action === 'note') log(item, 'Notat lagt til', $('#note').value);
});
$('#role').addEventListener('change', () => { if (activeCaseId) detail(cases.find((item) => item.id === activeCaseId)); });
$('#back-to-list').addEventListener('click', () => showView('mine'));
const reportForm = document.querySelector('#report-form');
reportForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const item = { id: `GB-${String(Math.max(105, ...cases.map((entry) => Number(entry.id.slice(3)) || 0) + 1)).padStart(3, '0')}`, title: $('#new-description').value, context: $('#new-context').value, category: $('#new-category').value, description: 'Oppdiktet eksempelmelding opprettet i denne nettleseren.', impact: Number($('#impact').value), urgency: Number($('#urgency').value), safety: Number($('#safety').value), status: 'Ny', assignee: 'Ikke tildelt', due: 'Ingen frist', events: [{ label: 'Behov meldt', text: 'Syntetisk eksempel opprettet lokalt.', when: 'Nå · demo' }] };
  cases.unshift(item); persist(); renderAll(); $('#report-form').reset(); announce(`${item.id} lagt til lokalt som syntetisk eksempel.`); showView('mine'); detail(item);
});
$('#reset-demo').addEventListener('click', () => {
  try { localStorage.removeItem(STORAGE_KEY); } catch { /* Storage may be unavailable. */ }
  cases = structuredClone(seedCases); activeCaseId = null; renderAll(); showView('mine'); announce('Demoen er nullstilt til de opprinnelige eksempeldataene.');
});
renderAll();
