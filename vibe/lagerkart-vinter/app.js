(() => {
  const rows = [
    { id: 'A', length: 48, blocked: [{ start: 0, length: 3, label: 'Port' }] },
    { id: 'B', length: 48, blocked: [] },
    { id: 'C', length: 42, blocked: [{ start: 38, length: 4, label: 'Gang' }] },
    { id: 'D', length: 42, blocked: [] }
  ];
  // Fictional examples; the page has no connection to the source app or its data.
  const units = [
    { id: 'u1', label: 'SNØ-014', type: 'Snøscooter', row: 'A', start: 5, length: 3.2, color: 'orange' },
    { id: 'u2', label: 'BÅT-208', type: 'Båt på henger', row: 'A', start: 14, length: 6.8, color: 'blue' },
    { id: 'u3', label: 'ATV-031', type: 'ATV', row: 'A', start: 28, length: 2.4, color: 'green' },
    { id: 'u4', label: 'SNØ-027', type: 'Snøscooter', row: 'B', start: 7, length: 3.4, color: 'orange' },
    { id: 'u5', label: 'BÅT-115', type: 'Båt på henger', row: 'C', start: 4, length: 7.2, color: 'blue' },
    { id: 'u6', label: 'ATV-046', type: 'ATV', row: 'D', start: null, length: 2.8, color: 'green' },
    { id: 'u7', label: 'SNØ-039', type: 'Snøscooter', row: 'D', start: null, length: 3.1, color: 'orange' }
  ];
  const map = document.querySelector('#map');
  const bank = document.querySelector('#bank-list');
  const search = document.querySelector('#search');
  const selection = document.querySelector('#selection');
  let selected = null;
  const placed = () => units.filter(unit => unit.row && Number.isFinite(unit.start));
  const freeMeters = () => rows.reduce((sum, row) => sum + row.length - row.blocked.reduce((n, item) => n + item.length, 0) - placed().filter(unit => unit.row === row.id).reduce((n, unit) => n + unit.length, 0), 0);

  function render() {
    const inMap = placed();
    document.querySelector('#placed-count').textContent = inMap.length;
    document.querySelector('#free-meters').textContent = `${freeMeters().toFixed(1).replace('.', ',')} m`;
    document.querySelector('#waiting-count').textContent = units.length - inMap.length;
    document.querySelector('#bank-count').textContent = units.length - inMap.length;
    map.replaceChildren(...rows.map(row => {
      const line = document.createElement('section');
      line.className = 'row';
      line.setAttribute('aria-label', `Rad ${row.id}, ${row.length} meter`);
      const label = document.createElement('div'); label.className = 'row-name'; label.innerHTML = `<strong>${row.id}</strong><span>RAD</span>`;
      const track = document.createElement('div'); track.className = 'track'; track.setAttribute('role', 'group'); track.setAttribute('aria-label', `Plasseringer på rad ${row.id}`);
      const scale = document.createElement('div'); scale.className = 'scale'; scale.innerHTML = `<span>0 m</span><span>${row.length} m</span>`;
      row.blocked.forEach(item => { const block = document.createElement('div'); block.className = 'block'; block.style.left = `${item.start / row.length * 100}%`; block.style.width = `${item.length / row.length * 100}%`; block.title = item.label; block.setAttribute('aria-label', `${item.label}, sperret område`); track.append(block); });
      inMap.filter(unit => unit.row === row.id).forEach(unit => {
        const button = document.createElement('button'); button.type = 'button'; button.className = `unit ${unit.color}${selected === unit.id ? ' selected' : ''}`; button.style.left = `${unit.start / row.length * 100}%`; button.style.width = `${unit.length / row.length * 100}%`; button.setAttribute('aria-pressed', String(selected === unit.id)); button.setAttribute('aria-label', `${unit.label}, ${unit.type}, rad ${row.id}, fra ${unit.start} meter. Velg for detaljer.`); button.title = `${unit.label} · ${unit.type}`; const shortLabel = `${unit.label[0]}${unit.label.split('-')[1].slice(-2)}`; button.innerHTML = `<span>${shortLabel}</span><small>${unit.length.toLocaleString('no-NO')} m</small>`; button.addEventListener('click', () => { selected = selected === unit.id ? null : unit.id; render(); }); track.append(button);
      });
      line.append(label, track, scale); return line;
    }));
    const query = search.value.trim().toLocaleLowerCase('no');
    const unplaced = units.filter(unit => !unit.row || !Number.isFinite(unit.start)).filter(unit => `${unit.label} ${unit.type}`.toLocaleLowerCase('no').includes(query));
    bank.replaceChildren(...unplaced.map(unit => { const card = document.createElement('article'); card.className = 'bank-item'; card.innerHTML = `<span class="swatch ${unit.color}" aria-hidden="true"></span><div><strong>${unit.label}</strong><span>${unit.type} · ${unit.length.toLocaleString('no-NO')} m</span></div><button type="button" aria-label="Plasser ${unit.label} på første ledige plass" title="Plasser på første ledige plass">＋</button>`; card.querySelector('button').addEventListener('click', () => placeUnit(unit)); return card; }));
    document.querySelector('#empty-state').hidden = unplaced.length > 0 || !query;
    renderSelection();
  }
  function fits(row, unit, start) {
    const obstacles = [...row.blocked, ...placed().filter(other => other.id !== unit.id && other.row === row.id)];
    return start >= 0 && start + unit.length <= row.length && obstacles.every(item => start + unit.length <= item.start || start >= item.start + item.length);
  }
  function placeUnit(unit) {
    const row = rows.find(candidate => { for (let pos = 0; pos + unit.length <= candidate.length; pos += .5) if (fits(candidate, unit, pos)) return true; return false; });
    if (!row) { selection.querySelector('p').textContent = `Fant ikke plass til ${unit.label} i eksempelkartet.`; return; }
    let start = 0; while (!fits(row, unit, start)) start += .5;
    unit.row = row.id; unit.start = start; selected = unit.id; render();
  }
  function nudge(unit, delta) {
    const row = rows.find(item => item.id === unit.row); if (!row) return;
    const target = Math.round((unit.start + delta) * 2) / 2;
    if (fits(row, unit, target)) { unit.start = target; render(); }
    else selection.querySelector('p').textContent = 'Der er ikke nok sammenhengende plass der. Prøv et mindre steg.';
  }
  function renderSelection() {
    const unit = units.find(item => item.id === selected && item.row);
    if (!unit) { selection.innerHTML = '<span class="selection-icon" aria-hidden="true">i</span><p>Velg et kjøretøy på kartet for å se detaljer og flytte det.</p>'; return; }
    selection.innerHTML = `<div class="selected-info"><span class="eyebrow">VALGT ENHET</span><strong>${unit.label}</strong><span>${unit.type} · ${unit.length.toLocaleString('no-NO')} m · rad ${unit.row} fra ${unit.start.toLocaleString('no-NO')} m</span></div><div class="move-controls"><button type="button" data-step="-1" aria-label="Flytt en meter bakover">−1 m</button><button type="button" data-step="1" aria-label="Flytt en meter fremover">+1 m</button><button type="button" data-unplace>Ta ut av kartet</button></div>`;
    selection.querySelectorAll('[data-step]').forEach(button => button.addEventListener('click', () => nudge(unit, Number(button.dataset.step))));
    selection.querySelector('[data-unplace]').addEventListener('click', () => { unit.row = null; unit.start = null; selected = null; render(); });
  }
  search.addEventListener('input', render);
  render();
})();
