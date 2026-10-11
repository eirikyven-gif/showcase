(() => {
  'use strict';
  const STORAGE_KEY = 'vibe.bilag-v5.demo.v2';
  const LIMIT = 25;
  const MAX_RUNTIME_MS = 240000;
  const MAX_ATTEMPTS = 3;
  const MIME = {
    pdf: 'application/pdf', doc: 'application/vnd.google-apps.document',
    sheet: 'application/vnd.google-apps.spreadsheet', image: 'image/jpeg',
    png: 'image/png', text: 'text/plain', unsupported: 'application/octet-stream'
  };
  const seed = () => ({
    pdf: [
      { id: 'demo-pdf-104', name: 'DEMO_bilag-traktorfilter.pdf', mime: MIME.pdf, stable: true, readable: true, folder: 'Innboks/Demo', status: 'Venter', attempts: 0 },
      { id: 'demo-doc-022', name: 'DEMO_verkstednotat.doc', mime: MIME.doc, stable: true, readable: true, folder: 'Innboks', status: 'Venter', attempts: 0 },
      { id: 'demo-img-018', name: 'DEMO_kvittering.jpg', mime: MIME.image, stable: true, readable: true, folder: 'Innboks/Demo', status: 'Venter', attempts: 0 },
      { id: 'demo-sheet-019', name: 'DEMO_driftstall', mime: MIME.sheet, stable: true, readable: true, folder: 'Innboks', status: 'Venter', attempts: 0 },
      { id: 'demo-text-020', name: 'DEMO_arbeidsnotat.txt', mime: MIME.text, stable: true, readable: true, folder: 'Innboks', status: 'Venter', attempts: 0 },
      { id: 'demo-unstable-1', name: 'DEMO_paagaaende.pdf', mime: MIME.pdf, stable: false, readable: true, folder: 'Innboks', status: 'Venter', attempts: 0 },
      { id: 'demo-unsupported-1', name: 'DEMO_notat.bin', mime: MIME.unsupported, stable: true, readable: true, folder: 'Innboks', status: 'Venter', attempts: 0 },
      { id: 'demo-fail-3', name: 'DEMO_konverteringsfeil.png', mime: MIME.png, stable: true, readable: true, folder: 'Innboks', status: 'Blokkert', attempts: 3 }
    ],
    zips: [
      { id: 'demo-zip-07', name: 'DEMO_innboks-pakke.zip', stable: true, entries: [
        { name: 'Faktura/DEMO_deler.pdf', stableId: 'synthetic-a', status: 'Venter' },
        { name: 'DEMO_kvittering.jpg', stableId: 'synthetic-b', status: 'Venter' },
        { name: '../DEMO_utenfor.txt', stableId: 'synthetic-c', status: 'Venter' },
        { name: 'DEMO_nestet.zip', stableId: 'synthetic-d', status: 'Venter' },
        { name: 'mappe/', stableId: 'synthetic-e', status: 'Venter' }
      ] },
      { id: 'demo-zip-unstable', name: 'DEMO_ny-pakke.zip', stable: false, entries: [{ name: 'DEMO_ny.txt', stableId: 'synthetic-f', status: 'Venter' }] },
      { id: 'demo-zip-corrupt', name: 'DEMO_korrupt.zip', stable: true, corrupt: true, entries: [] }
    ],
    inboxNames: ['DEMO_kvittering.jpg'],
    log: [], runs: { pdf: 0, zip: 0 }, lock: false
  });
  const clone = value => JSON.parse(JSON.stringify(value));
  function load() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (saved && Array.isArray(saved.pdf) && Array.isArray(saved.zips) && Array.isArray(saved.log)) return saved;
    } catch (_) { /* Damaged browser demo state starts from the synthetic seed. */ }
    return seed();
  }
  let state = load();
  const byId = id => document.getElementById(id);
  const escape = value => String(value).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]);
  function save() { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
  function time() { return new Intl.DateTimeFormat('nb-NO', { hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(new Date()); }
  function log(run, item, action, detail) { state.log.unshift({ time: time(), run, item, action, detail }); }
  function typeName(mime) { return mime === MIME.pdf ? 'PDF' : mime === MIME.doc ? 'Google-dokument' : mime === MIME.sheet ? 'Regneark' : mime === MIME.image || mime === MIME.png ? 'Bilde' : mime === MIME.text ? 'Ren tekst' : 'Ikke støttet'; }
  function render() {
    byId('pdf-queued').textContent = state.pdf.filter(f => f.status === 'Venter' || f.status === 'Feilet').length;
    byId('zip-queued').textContent = state.zips.filter(z => z.status !== 'Ferdig').length;
    byId('pdf-processed').textContent = state.runs.pdf;
    byId('zip-processed').textContent = state.runs.zip;
    byId('pdf-rows').innerHTML = state.pdf.map(f => `<tr><th scope="row">${escape(f.name)}<small>${escape(typeName(f.mime))} · ${escape(f.folder)}</small></th><td>${f.mime === MIME.pdf ? 'Flytt PDF' : 'Konverter → PDF'}</td><td><span class="table-status ${f.status === 'Ferdig' ? 'complete' : f.status === 'Blokkert' || f.status === 'Feilet' ? 'error' : ''}">${escape(f.status)}</span></td><td>${f.attempts} / ${MAX_ATTEMPTS}</td></tr>`).join('');
    byId('zip-rows').innerHTML = state.zips.flatMap(z => [
      `<tr class="zip-heading"><th colspan="2" scope="rowgroup">${escape(z.name)}${z.stable ? '' : ' · ustabil'}</th></tr>`,
      ...z.entries.map(e => `<tr><th scope="row">${escape(e.name)}${e.outputName ? `<small>Opprettet i Innboks som ${escape(e.outputName)}</small>` : ''}</th><td><span class="table-status ${e.status === 'OPPRETTET' ? 'complete' : e.status === 'HOPPET_OVER' || e.status === 'FEIL' ? 'error' : ''}">${escape(e.status)}</span></td></tr>`)
    ]).join('');
    byId('log-rows').innerHTML = state.log.length ? state.log.slice(0, 80).map(x => `<tr><td>${escape(x.time)}</td><td>${escape(x.run)}</td><td>${escape(x.item)}</td><td>${escape(x.action)}</td><td>${escape(x.detail)}</td></tr>`).join('') : '<tr><td colspan="5">Ingen kjøringer ennå. Velg en av de to separate batchknappene.</td></tr>';
    byId('pdf-state').textContent = state.lock ? 'Kjører' : 'Klar';
    byId('zip-state').textContent = state.lock ? 'Kjører' : 'Klar';
    ['run-pdf', 'run-zip'].forEach(id => { byId(id).disabled = state.lock; });
    const blocked = state.pdf.find(f => f.status === 'Blokkert');
    byId('retry-panel').hidden = !blocked;
    if (blocked) byId('retry-copy').textContent = `${blocked.name} er blokkert etter ${blocked.attempts} syntetiske feil. En eksplisitt retry nullstiller forsøksrekken og bevarer hendelsesloggen.`;
    byId('retry-file').dataset.fileId = blocked ? blocked.id : '';
    byId('notice').textContent = state.lock ? 'En demokjøring pågår.' : '';
  }
  function runPdf() {
    if (state.lock) return;
    state.lock = true; render();
    let processed = 0, skipped = 0, errors = 0;
    let failNext = byId('fail-next').checked;
    byId('fail-next').checked = false;
    const started = Date.now();
    for (const file of state.pdf) {
      if (processed >= LIMIT || Date.now() - started >= MAX_RUNTIME_MS) break;
      if (file.status === 'Ferdig') { skipped++; continue; }
      if (file.status === 'Blokkert' || file.attempts >= MAX_ATTEMPTS) { file.status = 'Blokkert'; skipped++; continue; }
      if (file.mime === MIME.unsupported) { file.status = 'Hoppet over'; skipped++; log('PDF-batch', file.name, 'HOPPET_OVER', 'MIME_TYPE_IKKE_STØTTET'); continue; }
      if (!file.stable || !file.readable) { file.attempts++; file.status = file.attempts >= MAX_ATTEMPTS ? 'Blokkert' : 'Feilet'; errors++; log('PDF-batch', file.name, 'KONVERTERING_FEIL', 'USTABIL_ELLER_UBAR'); continue; }
      if (file.mime !== MIME.pdf && failNext) { failNext = false; file.attempts++; file.status = file.attempts >= MAX_ATTEMPTS ? 'Blokkert' : 'Feilet'; errors++; log('PDF-batch', file.name, 'KONVERTERING_FEIL', 'PDF_VALIDERING_FEIL · simulert'); continue; }
      file.status = 'Ferdig'; file.target = 'Dokumentasjon';
      if (file.mime !== MIME.pdf) file.pdfName = `${file.name.replace(/\.[^.]+$/, '')}.pdf`;
      processed++; log('PDF-batch', file.name, file.mime === MIME.pdf ? 'FLYTTET' : 'KONVERTERT_OG_FLYTTET', file.mime === MIME.pdf ? 'Flyttet til Dokumentasjon' : `Syntetisk PDF validert i ${file.folder}, så flyttet til Dokumentasjon; original beholdes`);
    }
    state.runs.pdf += processed;
    log('PDF-batch', 'DEMO_KJORING', errors ? 'ERROR' : 'COMPLETED', `${processed} behandlet · ${skipped} hoppet over · ${errors} feil · grense ${LIMIT} / 4 min`);
    state.lock = false; save(); render();
  }
  function validateZipName(name) {
    const normalized = String(name || '').replace(/\\/g, '/'), trimmed = normalized.trim(), parts = trimmed.split('/');
    if (!trimmed) return { ok: false, reason: 'TOMT_FILNAVN' };
    if (trimmed.startsWith('/') || /^[A-Za-z]:\//.test(trimmed)) return { ok: false, reason: 'ABSOLUT_STI' };
    if (!parts[parts.length - 1].trim()) return { ok: false, reason: 'MAPPEOPPFORING' };
    if (parts.includes('..')) return { ok: false, reason: 'STIUTVIDELSE' };
    if (parts.includes('.')) return { ok: false, reason: 'UGYLDIG_STI' };
    return { ok: true, name: parts[parts.length - 1] };
  }
  function uniqueName(name) {
    const dot = name.lastIndexOf('.'), stem = dot > 0 ? name.slice(0, dot) : name, ext = dot > 0 ? name.slice(dot) : '';
    let candidate = name, n = 2;
    while (state.inboxNames.includes(candidate)) { candidate = `${stem} (${n++})${ext}`; }
    state.inboxNames.push(candidate); return candidate;
  }
  function runZip() {
    if (state.lock) return;
    state.lock = true; render();
    let processed = 0;
    const started = Date.now();
    for (const zip of state.zips) {
      if (processed >= LIMIT || Date.now() - started >= MAX_RUNTIME_MS) break;
      if (zip.status === 'Ferdig') continue;
      if (!zip.stable) { zip.status = 'Hoppet over'; log('ZIP-import', zip.name, 'HOPPET_OVER', 'USTABIL_ZIP'); continue; }
      if (zip.corrupt) { zip.status = 'Feil'; log('ZIP-import', zip.name, 'FEIL', 'UGYLDIG_ELLER_KORRUPT_ZIP · isolert fra neste pakke'); continue; }
      for (const entry of zip.entries) {
        if (processed >= LIMIT || Date.now() - started >= MAX_RUNTIME_MS) break;
        if (entry.status === 'OPPRETTET' || entry.status === 'HOPPET_OVER') continue;
        const check = validateZipName(entry.name), key = `${zip.id}|${entry.name.replace(/\\/g, '/')}|${entry.stableId}`;
        if (state.log.some(x => x.key === key && ['OPPRETTET', 'HOPPET_OVER'].includes(x.action))) { entry.status = 'HOPPET_OVER'; log('ZIP-import', entry.name, 'HOPPET_OVER', 'ALLEREDE_BEHANDLET'); state.log[0].key = key; continue; }
        if (!check.ok) { entry.status = 'HOPPET_OVER'; log('ZIP-import', entry.name, 'HOPPET_OVER', check.reason); state.log[0].key = key; continue; }
        if (/\.zip$/i.test(check.name)) { entry.status = 'HOPPET_OVER'; log('ZIP-import', entry.name, 'HOPPET_OVER', 'NESTET_ZIP_IKKE_STOTTET'); state.log[0].key = key; continue; }
        const output = uniqueName(check.name); entry.status = 'OPPRETTET'; entry.outputName = output; processed++;
        log('ZIP-import', entry.name, 'OPPRETTET', `${output} · syntetisk oppføring flatet ut til Innboks`); state.log[0].key = key;
      }
      if (zip.entries.every(e => e.status !== 'Venter')) zip.status = 'Ferdig';
    }
    state.runs.zip += processed;
    log('ZIP-import', 'DEMO_KJORING', 'COMPLETED', `${processed} opprettet · maks ${LIMIT} oppføringer / 4 min`);
    state.lock = false; save(); render();
  }
  byId('run-pdf').addEventListener('click', runPdf);
  byId('run-zip').addEventListener('click', runZip);
  byId('retry-file').addEventListener('click', event => {
    const file = state.pdf.find(item => item.id === event.currentTarget.dataset.fileId);
    if (!file || file.status !== 'Blokkert') return;
    file.attempts = 0; file.status = 'Venter'; log('PDF-batch', file.name, 'RETRY_REQUESTED', 'Eksplisitt retry-forespørsel · syntetisk SYSTEM'); save(); render();
  });
  byId('reset-demo').addEventListener('click', () => {
    state = seed(); localStorage.removeItem(STORAGE_KEY); render(); byId('notice').textContent = 'Demoen er nullstilt. Ingen serverforespørsel ble sendt.';
  });
  render();
})();
