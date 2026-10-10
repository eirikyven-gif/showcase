(() => {
  'use strict';
  const STORE_KEY = 'vibe-bingo-demo-v1';
  const syntheticPools = {
    B: ['Eksempelnavn B-01', 'Eksempelnavn B-02', 'Eksempelnavn B-03', 'Eksempelnavn B-04', 'Eksempelnavn B-05', 'Eksempelnavn B-06'],
    I: ['Eksempelnavn I-01', 'Eksempelnavn I-02', 'Eksempelnavn I-03', 'Eksempelnavn I-04', 'Eksempelnavn I-05', 'Eksempelnavn I-06'],
    N: ['Eksempelnavn N-01', 'Eksempelnavn N-02', 'Eksempelnavn N-03', 'Eksempelnavn N-04', 'Eksempelnavn N-05', 'Eksempelnavn N-06'],
    G: ['Eksempelnavn G-01', 'Eksempelnavn G-02', 'Eksempelnavn G-03', 'Eksempelnavn G-04', 'Eksempelnavn G-05', 'Eksempelnavn G-06'],
    O: ['Eksempelnavn O-01', 'Eksempelnavn O-02', 'Eksempelnavn O-03', 'Eksempelnavn O-04', 'Eksempelnavn O-05', 'Eksempelnavn O-06'],
  };
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const defaults = () => ({
    paymentInfo: 'Syntetisk eksempel: betaling er ikke aktiv.\nIkke bruk ekte kontonummer eller betalingsopplysninger.',
    qr: '', logo: '', generatedAt: '', samplePublishedAt: new Date().toISOString(), publishedWeek: currentIsoWeek(),
  });
  const validLocalImage = value => typeof value === 'string' && value.length <= 410000 && /^data:image\/(?:png|jpeg|svg\+xml);base64,[A-Za-z0-9+/]+=*$/.test(value);
  const readState = () => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORE_KEY) || 'null');
      if (!saved || typeof saved !== 'object') return defaults();
      const initial = defaults();
      const isDate = value => typeof value === 'string' && Number.isFinite(Date.parse(value));
      return {
        paymentInfo: typeof saved.paymentInfo === 'string' ? saved.paymentInfo.slice(0, 240) : initial.paymentInfo,
        qr: validLocalImage(saved.qr) ? saved.qr : '',
        logo: validLocalImage(saved.logo) ? saved.logo : '',
        generatedAt: isDate(saved.generatedAt) ? saved.generatedAt : '',
        samplePublishedAt: isDate(saved.samplePublishedAt) ? saved.samplePublishedAt : initial.samplePublishedAt,
        publishedWeek: typeof saved.publishedWeek === 'string' && /^\d{4}-W\d{2}$/.test(saved.publishedWeek) ? saved.publishedWeek : initial.publishedWeek,
      };
    } catch { return defaults(); }
  };
  let state = readState();
  let adminOpen = false;
  let selectedTallBoard = 0;
  let selectedNameBoard = 0;

  function saveState() {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(state));
      return true;
    } catch {
      $('#admin-message').textContent = 'Nettleseren kunne ikke lagre lokalt. Fjern et stort bilde eller nullstill demodata.';
      return false;
    }
  }
  function currentIsoWeek() {
    const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Oslo', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date());
    const get = type => Number(parts.find(part => part.type === type).value);
    const date = new Date(Date.UTC(get('year'), get('month') - 1, get('day')));
    date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    const week = Math.ceil((((date - yearStart) / 86400000) + 1) / 7);
    return `${date.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
  }
  function seeded(seed) {
    let value = seed >>> 0;
    return () => { value = (value * 1664525 + 1013904223) >>> 0; return value / 4294967296; };
  }
  function tallBoards() {
    return Array.from({ length: 30 }, (_, boardIndex) => {
      const random = seeded(4700 + boardIndex * 97);
      const columns = Array.from({ length: 5 }, (_, columnIndex) => {
        const min = columnIndex * 15 + 1;
        const values = Array.from({ length: 15 }, (_, i) => min + i);
        for (let i = values.length - 1; i > 0; i--) {
          const j = Math.floor(random() * (i + 1));
          [values[i], values[j]] = [values[j], values[i]];
        }
        return values.slice(0, 5).sort((a, b) => a - b);
      });
      return Array.from({ length: 5 }, (_, row) => columns.map((column, col) => row === 2 && col === 2 ? 'FRI RUTE' : String(column[row])));
    });
  }
  function nameBoards() {
    return Array.from({ length: 30 }, (_, boardIndex) => Object.entries(syntheticPools).map(([letter, pool], col) =>
      Array.from({ length: 6 }, (_, row) => pool[(row + boardIndex + col) % pool.length])));
  }
  const numbers = tallBoards();
  const names = nameBoards();
  const esc = value => String(value).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]);
  const safeWeek = () => /^\d{4}-W\d{2}$/.test(state.publishedWeek) ? state.publishedWeek : currentIsoWeek();
  const formatDate = value => new Intl.DateTimeFormat('nb-NO', { dateStyle: 'long', timeStyle: 'short', timeZone: 'Europe/Oslo' }).format(new Date(value));

  function boardMarkup(kind, index) {
    const isTall = kind === 'tall';
    const columns = isTall ? ['B', 'I', 'N', 'G', 'O'] : Object.keys(syntheticPools);
    const rows = isTall ? numbers[index] : null;
    const content = isTall
      ? `<table class="number-grid" aria-label="Tallbrett med B, I, N, G og O-kolonner"><thead class="board-letters"><tr>${columns.map(letter => `<th scope="col">${letter}</th>`).join('')}</tr></thead><tbody>${rows.map(row => `<tr>${row.map(cell => `<td class="board-cell${cell === 'FRI RUTE' ? ' free-cell' : ''}">${esc(cell)}</td>`).join('')}</tr>`).join('')}</tbody></table>`
      : `<table class="name-board" aria-label="Navnebrett med syntetiske navn sortert etter B, I, N, G og O"><thead class="name-head"><tr><th scope="col">#</th>${columns.map(letter => `<th scope="col">${letter}</th>`).join('')}</tr></thead><tbody>${Array.from({ length: 6 }, (_, row) => `<tr class="name-row"><th class="name-index" scope="row">${String(row + 1).padStart(2, '0')}</th>${names[index].map(pool => `<td>${esc(pool[row])}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
    const qr = state.qr ? `<img class="asset-image qr-image" src="${esc(state.qr)}" alt="Syntetisk eksempel på QR-bilde">` : '<span class="asset-placeholder qr-placeholder">QR · EKSEMPEL</span>';
    const logo = state.logo ? `<img class="asset-image logo-image" src="${esc(state.logo)}" alt="Syntetisk eksempel på Bingo-logo">` : '<span class="asset-placeholder logo-placeholder">BINGO · EKSEMPEL</span>';
    const localDate = new Intl.DateTimeFormat('nb-NO', { timeZone: 'Europe/Oslo' }).format(new Date());
    return `<div class="paper-meta"><strong>${isTall ? 'Tallbrett' : 'Navnebrett'}</strong><span>Uke ${safeWeek()} · ${localDate}</span></div><p class="paper-payment">${esc(state.paymentInfo).replace(/\n/g, '<br>')}</p>${content}<div class="paper-bottom">${qr}${isTall ? logo : ''}<span class="fixture-stamp">SYNTHETISK DEMO · BRETT ${index + 1} AV 30</span></div>`;
  }
  function setPreview(id, kind, index) {
    const node = document.getElementById(id);
    if (node) node.innerHTML = boardMarkup(kind, index);
  }
  function render() {
    $('#week-public').textContent = safeWeek();
    const publishedAt = state.generatedAt || state.samplePublishedAt;
    $('#published-at').textContent = `${formatDate(publishedAt)} (Europe/Oslo)`;
    $('#expires-at').textContent = `${formatDate(new Date(new Date(publishedAt).getTime() + 7 * 86400000).toISOString())} (Europe/Oslo)`;
    $('#admin-summary').textContent = `1 syntetisk publisert uke, 3 syntetiske aktive mottakere · ${safeWeek()} · 30 tallbrett og 30 navnebrett.`;
    $('#payment-info').value = state.paymentInfo;
    setPreview('public-number-preview', 'tall', selectedTallBoard);
    setPreview('public-name-preview', 'name', selectedNameBoard);
    setPreview('admin-number-preview', 'tall', selectedTallBoard);
    setPreview('admin-name-preview', 'name', selectedNameBoard);
    ['tall-index', 'admin-tall-index'].forEach(id => { const node = document.getElementById(id); if (node) node.textContent = `Brett ${selectedTallBoard + 1} av 30`; });
    ['name-index', 'admin-name-index'].forEach(id => { const node = document.getElementById(id); if (node) node.textContent = `Brett ${selectedNameBoard + 1} av 30`; });
    $('#admin-locked').hidden = adminOpen;
    $('#admin-workspace').hidden = !adminOpen;
  }
  function switchView(view) {
    const isAdmin = view === 'admin';
    $('#public-view').hidden = isAdmin;
    $('#admin-view').hidden = !isAdmin;
    $('#public-tab').classList.toggle('is-active', !isAdmin);
    $('#admin-tab').classList.toggle('is-active', isAdmin);
    $('#public-tab').setAttribute('aria-pressed', String(!isAdmin));
    $('#admin-tab').setAttribute('aria-pressed', String(isAdmin));
    if (isAdmin) $('#admin-title').focus({ preventScroll: true });
  }
  function rotate(kind, delta) {
    if (kind === 'tall') selectedTallBoard = (selectedTallBoard + delta + 30) % 30;
    else selectedNameBoard = (selectedNameBoard + delta + 30) % 30;
    render();
  }
  function downloadPdf(kind) {
    const doc = document.createElement('section');
    doc.className = `print-document ${kind === 'tall' ? 'print-landscape' : 'print-portrait'}`;
    const count = 30;
    for (let i = 0; i < count; i++) {
      const page = document.createElement('article');
      page.className = 'print-page';
      page.innerHTML = boardMarkup(kind, i);
      doc.append(page);
    }
    const previous = $('#print-output');
    if (previous) previous.remove();
    doc.id = 'print-output';
    document.body.append(doc);
    const title = document.title;
    document.title = `Bingobrett_${kind === 'tall' ? 'Tall' : 'Navn'}_uke_${safeWeek()}_Syntetisk`;
    window.print();
    document.title = title;
    window.setTimeout(() => doc.remove(), 1000);
  }
  async function storeImage(file, key, input) {
    if (!file) return;
    if (file.size > 300_000) {
      $('#admin-message').textContent = 'Velg en bildefil under 300 kB for lokal nettleserlagring.';
      input.value = '';
      return;
    }
    if (!['image/png', 'image/jpeg', 'image/svg+xml'].includes(file.type)) {
      $('#admin-message').textContent = 'Velg PNG, JPEG eller SVG.';
      input.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const data = String(reader.result || '');
      if (file.type === 'image/svg+xml' && /<script|on\w+\s*=|\b(?:href|src)\s*=|url\s*\(/i.test(data)) {
        $('#admin-message').textContent = 'SVG-eksempelet må være selvstendig og uten skript eller eksterne ressurser.';
        input.value = '';
        return;
      }
      state[key] = data;
      if (saveState()) {
        render();
        $('#admin-message').textContent = `${key === 'qr' ? 'QR-bildet' : 'Logoen'} er lagret lokalt og oppdatert i begge malene.`;
      }
    };
    reader.onerror = () => { $('#admin-message').textContent = 'Bildet kunne ikke leses lokalt.'; };
    reader.readAsDataURL(file);
  }

  $('#public-tab').addEventListener('click', () => switchView('public'));
  $('#admin-tab').addEventListener('click', () => switchView('admin'));
  $('#open-admin').addEventListener('click', () => { adminOpen = true; render(); $('#payment-info').focus(); });
  $('#close-admin').addEventListener('click', () => { adminOpen = false; render(); $('#open-admin').focus(); });
  $('#save-settings').addEventListener('click', () => {
    state.paymentInfo = $('#payment-info').value;
    if (saveState()) { render(); $('#admin-message').textContent = 'Betalingsteksten er oppdatert og lagret bare i denne nettleseren.'; }
  });
  $('#qr-file').addEventListener('change', event => storeImage(event.target.files[0], 'qr', event.target));
  $('#logo-file').addEventListener('change', event => storeImage(event.target.files[0], 'logo', event.target));
  $('#generate-week').addEventListener('click', () => {
    if (!window.confirm('Erstatt den lokale syntetiske publiseringen for aktiv uke?')) return;
    state.publishedWeek = currentIsoWeek();
    state.generatedAt = new Date().toISOString();
    state.samplePublishedAt = state.generatedAt;
    if (saveState()) {
      render();
      $('#admin-message').textContent = `Simulert publisering for ${safeWeek()}: 30 tallbrett og 30 navnebrett klare som lokale eksempelutskrifter. GAS/One.com ble ikke kontaktet.`;
    }
  });
  function resetDemo() {
    if (!window.confirm('Fjern alle Bingo-demo-innstillinger, bilder og publiseringsstatus fra denne nettleseren?')) return;
    const onPublicView = !$('#public-view').hidden;
    localStorage.removeItem(STORE_KEY);
    state = defaults(); adminOpen = false; selectedTallBoard = 0; selectedNameBoard = 0;
    $('#admin-message').textContent = 'Alle Bingo-demodata i denne nettleseren er nullstilt.';
    render();
    if (onPublicView) $('#reset-demo-public').focus();
    else $('#open-admin').focus();
  }
  $('#reset-demo').addEventListener('click', resetDemo);
  $('#reset-demo-public').addEventListener('click', resetDemo);
  $$('[data-step]').forEach(button => button.addEventListener('click', () => rotate(button.dataset.step, Number(button.dataset.delta))));
  $('#print-board').addEventListener('click', () => downloadPdf('tall'));
  $$('[data-download]').forEach(button => button.addEventListener('click', () => downloadPdf(button.dataset.download)));
  render();
})();
