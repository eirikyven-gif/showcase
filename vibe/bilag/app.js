(() => {
  'use strict';

  const STORAGE_KEY = 'vibe.bilag.demo.v1';
  const initialState = () => ({
    stopped: false,
    queue: [
      { id: 'sample-01', file: 'DEMO_faktura_traktorfilter.pdf', type: 'Faktura', date: '2026-09-12', status: 'Venter', result: '—' },
      { id: 'sample-02', file: 'DEMO_kvittering_gjodsel.pdf', type: 'Kvittering', date: '2026-09-08', status: 'Venter', result: '—' },
      { id: 'sample-03', file: 'DEMO_service_pumpe.pdf', type: 'Faktura', date: '2026-09-02', status: 'Venter', result: '—' },
      { id: 'sample-04', file: 'DEMO_justering_emballasje.pdf', type: 'Kreditnota', date: '2026-08-28', status: 'Venter', result: '—' }
    ],
    sheets: { losore: [], drift: [] },
    log: []
  });
  const samples = {
    'sample-01': [{ date: '2026-09-12', supplier: 'Eksempel Maskin AS', product: 'Hydraulikkfilter H-204', quantity: '2', cost: 840, category: 'Maskiner og utstyr', why: 'Fysisk reservedel dokumentert i eksempelbilaget.', sheet: 'losore' }],
    'sample-02': [{ date: '2026-09-08', supplier: 'Fiktiv Gårdsbutikk', product: 'Såvare bygg, 25 kg', quantity: '4', cost: 1296, category: 'Fôr, gjødsel og såvarer', why: 'Fysisk innsatsvare i eksempelbilaget.', sheet: 'losore' }],
    'sample-03': [{ date: '2026-09-02', supplier: 'Demo Verksted', product: 'Service på vannpumpe', quantity: '1', cost: 2150, category: 'Arbeid og tjenester', why: 'Arbeid/service uten fysisk varelinje.', sheet: 'drift' }],
    'sample-04': [{ date: '2026-08-28', supplier: 'Fiktiv Emballasje', product: 'Til manuell kontroll', quantity: '', cost: '', category: 'Til manuell kontroll', why: 'Eksempelpost uten tilstrekkelig produktanker; må kontrolleres av menneske.', sheet: 'losore' }]
  };
  let state = loadState();
  let busy = false;

  function loadState() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (parsed && Array.isArray(parsed.queue) && parsed.sheets && Array.isArray(parsed.log)) return parsed;
    } catch (_) { /* Ugyldig lokal demotilstand erstattes av ferske syntetiske data. */ }
    return initialState();
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (_) {
      announce('Nettleseren kunne ikke lagre demoen. Denne økten fortsetter i minnet.');
    }
  }

  function announce(message) {
    document.querySelector('#live-message').textContent = message;
  }

  function countLabel(count, noun) { return `${count} ${noun}${count === 1 ? '' : 'er'}`; }

  function render() {
    renderQueue();
    renderSheet('losore');
    renderSheet('drift');
    renderLog();
    const remaining = state.queue.filter((item) => item.status === 'Venter').length;
    document.querySelector('#queue-count').textContent = `${remaining} gjenstår`;
    document.querySelector('#run-state').textContent = busy ? 'Sorterer syntetiske eksempler …' : state.stopped ? 'Stoppet · fremdrift beholdt' : remaining ? 'Klar · syntetisk kø' : 'Ferdig · alle eksempler gjennomgått';
    document.querySelector('#start-run').disabled = busy || remaining === 0;
    document.querySelector('#stop-run').disabled = !busy;
    saveState();
  }

  function renderQueue() {
    const body = document.querySelector('#queue-rows');
    body.replaceChildren();
    state.queue.forEach((item) => {
      const row = document.createElement('tr');
      [item.file, item.type, item.date, item.status, item.result].forEach((value) => {
        const cell = document.createElement('td');
        cell.textContent = value;
        row.append(cell);
      });
      body.append(row);
    });
  }

  function renderSheet(sheetName) {
    const rows = state.sheets[sheetName];
    const body = document.querySelector(`#${sheetName}-rows`);
    body.replaceChildren();
    rows.forEach((item) => {
      const row = document.createElement('tr');
      row.dataset.rowId = item.id;
      [item.included, item.excluded, item.move].forEach((checked, index) => {
        const cell = document.createElement('td');
        const input = document.createElement('input');
        input.type = 'checkbox';
        input.checked = Boolean(checked);
        input.setAttribute('aria-label', ['Omfattes (X)', 'Omfattes ikke (X)', 'Flytt (X)'][index]);
        input.addEventListener('change', () => {
          item[['included', 'excluded', 'move'][index]] = input.checked;
          saveState();
          announce(index === 2 ? 'Flyttemarkering oppdatert. Velg Flytt markerte for å endre arbeidsfane.' : 'Eksempelmarkering endret av deg; demoen vurderer aldri skade eller eierskap.');
        });
        cell.append(input);
        row.append(cell);
      });
      [item.date, item.supplier, item.product, item.quantity, item.cost === '' ? '' : formatCurrency(item.cost), item.category, item.why].forEach((value) => {
        const cell = document.createElement('td');
        cell.textContent = value;
        row.append(cell);
      });
      body.append(row);
    });
    document.querySelector(`#${sheetName}-count`).textContent = countLabel(rows.length, 'varelinje');
  }

  function renderLog() {
    const body = document.querySelector('#log-rows');
    body.replaceChildren();
    [...state.log].reverse().forEach((entry) => {
      const row = document.createElement('tr');
      [entry.date, entry.time, entry.reviewed, entry.losore, entry.drift, entry.errors, entry.status].forEach((value) => {
        const cell = document.createElement('td');
        cell.textContent = value;
        row.append(cell);
      });
      body.append(row);
    });
  }

  function formatCurrency(value) {
    return new Intl.NumberFormat('nb-NO', { maximumFractionDigits: 0 }).format(value) + ' kr';
  }

  function addLog(reviewed, losore, drift, errors, status) {
    const now = new Date();
    state.log.push({ date: new Intl.DateTimeFormat('nb-NO').format(now), time: new Intl.DateTimeFormat('nb-NO', { hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(now), reviewed, losore, drift, errors, status });
  }

  function startRun() {
    if (busy) return;
    const next = state.queue.find((item) => item.status === 'Venter');
    if (!next) return;
    busy = true;
    state.stopped = false;
    addLog('0', '0', '0', '—', 'Startet');
    render();
    processNext(0, 0);
  }

  function processNext(addedLosore, addedDrift) {
    if (!busy) return;
    const next = state.queue.find((item) => item.status === 'Venter');
    if (!next) {
      busy = false;
      state.stopped = false;
      addLog(String(addedLosore + addedDrift), String(addedLosore), String(addedDrift), '—', 'Ferdig');
      announce('Køen er ferdig. Resultatene er syntetiske, og ingen eksterne tjenester ble brukt.');
      render();
      return;
    }
    next.status = 'Behandler';
    render();
    window.setTimeout(() => {
      if (!busy) return;
      const products = samples[next.id];
      products.forEach((product, index) => {
        const target = state.sheets[product.sheet];
        const fingerprint = `${next.id}-${index}`;
        if (!target.some((existing) => existing.id === fingerprint)) {
          target.push({ ...product, id: fingerprint, included: false, excluded: false, move: false });
        }
      });
      next.status = 'Ferdig';
      next.result = products.map((product) => product.sheet === 'losore' ? 'Løsøre' : 'Drift').join(', ');
      processNext(addedLosore + products.filter((product) => product.sheet === 'losore').length, addedDrift + products.filter((product) => product.sheet === 'drift').length);
    }, 420);
  }

  function stopRun() {
    if (!busy) return;
    busy = false;
    state.stopped = true;
    const inProgress = state.queue.find((item) => item.status === 'Behandler');
    if (inProgress) inProgress.status = 'Venter';
    addLog('0', '0', '0', '—', 'Stoppet · fremdrift beholdt');
    announce('Sorteringen er stoppet. Uferdige syntetiske eksempler kan fortsettes senere.');
    render();
  }

  function moveMarked(sourceName) {
    const targetName = sourceName === 'losore' ? 'drift' : 'losore';
    const selected = state.sheets[sourceName].filter((item) => item.move);
    if (!selected.length) {
      announce('Ingen rader er markert for flytting.');
      return;
    }
    const conflicts = selected.filter((item) => state.sheets[targetName].some((existing) => existing.id === item.id));
    if (conflicts.length) {
      addLog('0', '0', '0', `${conflicts.length} Rad-ID-konflikt(er)`, 'Konflikt · rad beholdt');
      announce('En rad finnes allerede i målfanen. Kilderaden er beholdt for å unngå duplikat.');
      render();
      return;
    }
    selected.forEach((item) => {
      item.move = false;
      state.sheets[targetName].push(item);
    });
    state.sheets[sourceName] = state.sheets[sourceName].filter((item) => !item.move);
    addLog('0', '0', '0', '—', `Manuell flytting · ${selected.length} rad(er)`);
    announce(`${selected.length} syntetisk rad flyttet til ${targetName === 'losore' ? 'Løsøre' : 'Drift'}. X-markeringene for menneskelig vurdering fulgte raden.`);
    render();
  }

  function resetDemo() {
    if (!window.confirm('Nullstille demoen? Syntetiske rader og køfremdrift slettes. Kjøringsloggen beholdes.')) return;
    const preservedLog = state.log;
    state = initialState();
    state.log = preservedLog;
    addLog('0', '0', '0', '—', 'Demo nullstilt · logg bevart');
    announce('Demoen er nullstilt. Kjøringsloggen er bevart, som i kildearbeidsflyten.');
    render();
  }

  document.querySelector('#start-run').addEventListener('click', startRun);
  document.querySelector('#stop-run').addEventListener('click', stopRun);
  document.querySelector('#reset-demo').addEventListener('click', resetDemo);
  document.querySelectorAll('[data-move]').forEach((button) => button.addEventListener('click', () => moveMarked(button.dataset.move)));
  render();
})();
