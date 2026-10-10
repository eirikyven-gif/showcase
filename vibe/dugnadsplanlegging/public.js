(() => {
  'use strict';
  const shell = document.querySelector('#public-surface');
  const admin = document.querySelector('main');
  const nav = document.querySelector('#demo-surfaces');
  const activeKey = 'vibe-active-dugnad';
  const eventKey = 'vibe-dugnad-events:v1';
  const listKey = () => `vibe-dugnadsplanlegging:v1:${localStorage.getItem(activeKey) || 'hell-lopefestival'}`;
  const sampleEvents = [{ id: 'hell-lopefestival', name: 'Hell Løpefestival', description: 'Syntetisk eksempeldugnad', slug: 'hell-lopefestival' }];
  const events = () => { try { const v=JSON.parse(localStorage.getItem(eventKey)||'null'); return Array.isArray(v)&&v.length?v:sampleEvents; } catch { return sampleEvents; } };
  const state = () => { try { return JSON.parse(localStorage.getItem(listKey())||'{}'); } catch { return {}; } };
  const esc = (v) => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const currentEvent = () => events().find(x => x.id === (localStorage.getItem(activeKey)||'hell-lopefestival')) || events()[0];
  const recordEvents = (next) => localStorage.setItem(eventKey, JSON.stringify(next));
  const openSurface = (name) => {
    if (name === 'signup' || name === 'overview' || name === 'superadmin' || name === 'admin') history.replaceState(null, '', name === 'admin' ? location.pathname : `${location.pathname}#${name}`);
    admin.hidden = name !== 'admin'; shell.hidden = name === 'admin';
    nav.querySelectorAll('[data-surface]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.surface===name)));
    if (name !== 'admin') render(name);
    if (name === 'admin') window.location.reload();
    window.scrollTo(0,0);
  };
  nav.addEventListener('click', e => { const b=e.target.closest('[data-surface]'); if (b) openSurface(b.dataset.surface); });
  const role = document.querySelector('#demo-role');
  role.addEventListener('change', () => document.querySelector('#role-note').textContent = `Visningsrolle: ${role.value}. Dette er en simulering uten autentisering eller tilgangskontroll.`);
  document.querySelector('#resetButton')?.addEventListener('click', () => { localStorage.removeItem(eventKey); localStorage.removeItem(activeKey); });
  document.querySelector('#saveStatus')?.setAttribute('aria-live','polite');
  const roleWrap = document.createElement('label');
  roleWrap.className = 'event-picker'; roleWrap.innerHTML = `Aktiv dugnad <select id="active-event" aria-label="Velg aktiv syntetisk dugnad"></select>`;
  nav.insertBefore(roleWrap, document.querySelector('#demo-role').parentElement);
  const picker = roleWrap.querySelector('select');
  function updatePicker() {
    picker.replaceChildren(...events().map(ev => { const o=document.createElement('option'); o.value=ev.id; o.textContent=ev.name; o.selected=ev.id===(localStorage.getItem(activeKey)||'hell-lopefestival'); return o; }));
  }
  picker.addEventListener('change', () => { localStorage.setItem(activeKey,picker.value); location.reload(); });
  updatePicker();
  function render(name) {
    const ev=currentEvent(), data=state(), shifts=Array.isArray(data.shifts)?data.shifts:[], contacts=Array.isArray(data.contacts)?data.contacts:[];
    if(name==='signup') {
      const demoContacts=contacts.filter(c=>/^Deltaker [A-H]$/.test(c.name)); const eligible=shifts.filter(s => (s.assignments||[]).length < Number(s.capacity||1));
      shell.innerHTML=`<section class="panel public-panel"><p class="eyebrow">${esc(ev.name)} · Åpen flate</p><h1>Påmelding</h1><p>Velg én eller flere ledige oppgaver. Denne demoen bruker bare syntetiske deltakeretiketter; ingen kontaktopplysninger trengs.</p><form id="demo-signup"><fieldset><legend>Ledige oppgaver og tidspunkt</legend>${eligible.length?eligible.map(s=>`<label class="signup-option"><input type="checkbox" name="shift" value="${esc(s.id)}"><span><strong>${esc(s.title)}</strong><br>${esc(s.startAt?.replace('T',' ')||'Tid ikke angitt')}–${esc(s.endAt?.replace('T',' ')||'')} · ${esc(s.location||'Sted ikke angitt')}</span></label>`).join(''):'<p>Ingen ledige oppgaver i eksempelplanen.</p>'}</fieldset><label>Deltaker i eksempelet<select name="contact" required>${demoContacts.map(c=>`<option value="${esc(c.id)}">${esc(c.name)}</option>`).join('')}</select></label><button type="submit" ${eligible.length?'':'disabled'}>Registrer syntetisk påmelding</button><p id="signup-status" role="status" aria-live="polite"></p></form></section>`;
      shell.querySelector('form')?.addEventListener('submit', e=>{e.preventDefault();const form=e.currentTarget;const who=demoContacts.find(c=>c.id===form.elements.contact.value);const ids=[...form.querySelectorAll('input[name="shift"]:checked')].map(i=>i.value);if(!ids.length){form.querySelector('#signup-status').textContent='Velg minst én oppgave.';return;}const next=state();next.shifts=(next.shifts||[]).map(s=>ids.includes(s.id)?({...s,assignments:[...(s.assignments||[]),{id:`signup-${Date.now()}-${s.id}`,shiftId:s.id,contactId:who?.id||'',startAt:s.startAt,endAt:s.endAt,notes:'Syntetisk demo-påmelding'}]}):s);localStorage.setItem(listKey(),JSON.stringify(next));form.querySelector('#signup-status').textContent=`${who?.name||'Deltaker'} er registrert lokalt på ${ids.length} oppgave(r). Ingen data ble sendt.`;});
    } else if(name==='overview') {
      shell.innerHTML=`<section class="panel public-panel"><p class="eyebrow">${esc(ev.name)} · Offentlig oversikt</p><h1>Vaktoversikt</h1><p>Offentlig flate viser bare oppgaver, tid, sted og bemanningsgrad. Kontaktopplysninger og notater er skjult.</p><div class="list">${shifts.length?shifts.map(s=>{const count=(s.assignments||[]).length,cap=Number(s.capacity||1);const names=(s.assignments||[]).map(a=>contacts.find(c=>c.id===a.contactId)?.name||'').filter(n=>/^Deltaker [A-H]$/.test(n));return `<article class="row"><h2>${esc(s.title)}</h2><p>${esc((s.startAt||'').replace('T',' '))}–${esc((s.endAt||'').replace('T',' '))} · ${esc(s.location||'')}</p><p>${count>=cap?'Dekket':count?'Delvis dekket':'Ledig'} · ${count} av ${cap} plasser</p>${names.length?`<p>Syntetisk påmeldt: ${names.map(esc).join(', ')}</p>`:''}</article>`}).join(''):'<p>Ingen vakter er opprettet ennå.</p>'}</div></section>`;
    } else {
      const all=events(); shell.innerHTML=`<section class="panel public-panel"><p class="eyebrow">Simulert superadminflate</p><h1>Dugnader og roller</h1><p>Ingen konto eller reell rolleautorisasjon. Opprett og rediger syntetiske dugnadstitler lokalt; aktive planer lagres separat per dugnad.</p><form id="event-form"><input type="hidden" name="id"><label>Navn<input name="name" required></label><label>Slug<input name="slug" pattern="[a-z0-9-]+" required></label><label>Beskrivelse<textarea name="description" rows="2"></textarea></label><button type="submit">Opprett dugnad</button><button type="button" class="secondary" id="event-cancel" hidden>Avbryt redigering</button><p id="event-status" role="status" aria-live="polite"></p></form><div class="list">${all.map(x=>`<article class="row"><h2>${esc(x.name)}</h2><p>${esc(x.description||'Syntetisk eksempel')} · /${esc(x.slug)}/</p><button type="button" class="secondary" data-edit-event="${esc(x.id)}">Rediger</button><button type="button" class="secondary" data-open-event="${esc(x.id)}">Velg aktiv dugnad</button></article>`).join('')}</div></section>`;
      const form=shell.querySelector('#event-form');
      form.addEventListener('submit',e=>{e.preventDefault();const fd=new FormData(form),id=String(fd.get('id')||`demo-${Date.now()}`),name=String(fd.get('name')).trim(),slug=String(fd.get('slug')).trim();let latest=events();if(latest.some(x=>x.slug===slug&&x.id!==id)){shell.querySelector('#event-status').textContent='Sluggen er allerede brukt.';return;}const entry={id,name,slug,description:String(fd.get('description')||'')};latest=latest.some(x=>x.id===id)?latest.map(x=>x.id===id?entry:x):[...latest,entry];recordEvents(latest);render('superadmin');updatePicker();});
      shell.querySelectorAll('[data-edit-event]').forEach(b=>b.addEventListener('click',()=>{const x=events().find(v=>v.id===b.dataset.editEvent);form.elements.id.value=x.id;form.elements.name.value=x.name;form.elements.slug.value=x.slug;form.elements.description.value=x.description||'';form.querySelector('button[type=submit]').textContent='Lagre endringer';form.querySelector('#event-cancel').hidden=false;}));
      shell.querySelector('#event-cancel').addEventListener('click',()=>{form.reset();form.elements.id.value='';});
      shell.querySelectorAll('[data-open-event]').forEach(b=>b.addEventListener('click',()=>{localStorage.setItem(activeKey,b.dataset.openEvent);location.reload();}));
    }
  }
  const routeSurface=location.hash.slice(1);
  if(['signup','overview','superadmin'].includes(routeSurface)) openSurface(routeSurface);
})();
