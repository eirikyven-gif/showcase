const months = ['Januar', 'Februar', 'Mars', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Desember'];
const categories = [
  { name: 'Eksempel: lønn', type: 'Inntekt' }, { name: 'Eksempel: småoppdrag', type: 'Inntekt' },
  { name: 'Eksempel: bolig', type: 'Utgift' }, { name: 'Eksempel: mat', type: 'Utgift' },
  { name: 'Eksempel: transport', type: 'Utgift' },
];
const examples = [];
const incomeAmounts = [38500, 38500, 38500, 38500, 38500, 38500, 38500, 38500, 38500, 38500, 38500, 38500];
const extraIncome = [1300, 2100, 1800, 2500, 2700, 4300, 3200, 1900, 2800, 1600, 2200, 3500];
const foodCosts = [3300, 4100, 3700, 3300, 5400, 4650, 3900, 4200, 4600, 3900, 4400, 5100];
const synthetic = (month, category, type, amount, day) => examples.push({ id: `sample-${examples.length}`, year: 2026, month, category, type, amount, day });
months.forEach((_, month) => {
  synthetic(month, 'Eksempel: lønn', 'Inntekt', incomeAmounts[month], 1);
  synthetic(month, 'Eksempel: småoppdrag', 'Inntekt', extraIncome[month], 12);
  synthetic(month, 'Eksempel: bolig', 'Utgift', 12500, 1);
  synthetic(month, 'Eksempel: mat', 'Utgift', foodCosts[month], 8);
  synthetic(month, 'Eksempel: transport', 'Utgift', 2600, 15);
});

const state = {
  year: 2026,
  month: 5,
  entries: examples,
  recurring: [
    { type: 'Utgift', category: 'Eksempel: bolig', amount: 12500, day: 1 },
    { type: 'Utgift', category: 'Eksempel: mobil', amount: 350, day: 12 },
    { type: 'Inntekt', category: 'Eksempel: småoppdrag', amount: 1500, day: 15 },
  ],
  nextId: 1,
  editingId: null,
};
const form = document.getElementById('entry-form');
const monthSelect = document.getElementById('month-select');
const money = new Intl.NumberFormat('nb-NO', { style: 'currency', currency: 'NOK', maximumFractionDigits: 0 });
const amountText = (amount) => money.format(amount);
const monthEntries = () => state.entries.filter((entry) => entry.year === state.year && entry.month === state.month);

function updateCategoryOptions() {
  const list = document.getElementById('category-options');
  list.replaceChildren(...categories.map((category) => {
    const option = document.createElement('option');
    option.value = category.name;
    option.label = category.type;
    return option;
  }));
}

function totalsFor(year, month, type) {
  return state.entries.filter((entry) => entry.year === year && entry.month === month && entry.type === type)
    .reduce((sum, entry) => sum + entry.amount, 0);
}

function renderSummary() {
  const income = totalsFor(state.year, state.month, 'Inntekt');
  const expenses = totalsFor(state.year, state.month, 'Utgift');
  const balance = income - expenses;
  document.getElementById('income-total').textContent = amountText(income);
  document.getElementById('expense-total').textContent = amountText(expenses);
  document.getElementById('balance-total').textContent = amountText(balance);
  const today = new Date();
  const daysLeft = today.getFullYear() === state.year && today.getMonth() === state.month
    ? Math.max(1, new Date(state.year, state.month + 1, 0).getDate() - today.getDate() + 1)
    : new Date(state.year, state.month + 1, 0).getDate();
  document.getElementById('daily-balance').textContent = `Omtrent ${amountText(balance / daysLeft)} per dag (${daysLeft} dager)`;
  document.getElementById('year-label').textContent = state.year;
  document.getElementById('month-status').textContent = `${months[state.month]} ${state.year}`;
}

function renderEntries() {
  const rows = monthEntries().slice().sort((a, b) => (a.type === b.type ? a.day - b.day : a.type === 'Inntekt' ? -1 : 1));
  const body = document.getElementById('entries-body');
  body.replaceChildren(...rows.map((entry) => {
    const row = document.createElement('tr');
    const date = document.createElement('td');
    const category = document.createElement('th');
    const type = document.createElement('td');
    const amount = document.createElement('td');
    const actions = document.createElement('td');
    date.textContent = `${String(entry.day).padStart(2, '0')}.${String(entry.month + 1).padStart(2, '0')}.${entry.year}`;
    category.scope = 'row';
    category.textContent = entry.category;
    type.textContent = entry.type;
    amount.textContent = `${entry.type === 'Utgift' ? '−' : '+'}${amountText(entry.amount)}`;
    amount.className = entry.type === 'Utgift' ? 'amount-negative' : 'amount-positive';
    const edit = document.createElement('button');
    edit.type = 'button'; edit.className = 'row-action'; edit.textContent = 'Endre';
    edit.setAttribute('aria-label', `Endre ${entry.category}, ${amountText(entry.amount)}`);
    edit.addEventListener('click', () => beginEdit(entry));
    const remove = document.createElement('button');
    remove.type = 'button'; remove.className = 'row-action remove-action'; remove.textContent = 'Slett';
    remove.setAttribute('aria-label', `Slett ${entry.category}, ${amountText(entry.amount)}`);
    remove.addEventListener('click', () => {
      state.entries = state.entries.filter((candidate) => candidate.id !== entry.id);
      if (state.editingId === entry.id) cancelEdit();
      render(); announce('Eksempelposten er slettet fra denne visningen.');
    });
    actions.append(edit, remove);
    row.append(date, category, type, amount, actions);
    return row;
  }));
  document.getElementById('entry-count').textContent = `${rows.length} poster`;
  document.getElementById('empty-month').hidden = rows.length > 0;
}

function renderMonthlyTotals() {
  const head = document.getElementById('totals-head');
  const header = document.createElement('tr');
  ['Type', 'Kategori', ...months, 'Året'].forEach((label) => {
    const cell = document.createElement('th'); cell.scope = 'col'; cell.textContent = label; header.append(cell);
  });
  head.replaceChildren(header);
  const body = document.getElementById('totals-body');
  const seen = new Map();
  state.entries.filter((entry) => entry.year === state.year).forEach((entry) => {
    const key = `${entry.type}\u0000${entry.category}`;
    if (!seen.has(key)) seen.set(key, { type: entry.type, category: entry.category, values: Array(12).fill(0) });
    seen.get(key).values[entry.month] += entry.type === 'Utgift' ? -entry.amount : entry.amount;
  });
  const rows = [...seen.values()].sort((a, b) => (a.type === b.type ? a.category.localeCompare(b.category, 'nb') : a.type === 'Inntekt' ? -1 : 1));
  body.replaceChildren(...rows.map((item) => {
    const row = document.createElement('tr');
    [item.type, item.category, ...item.values.map((value) => value ? amountText(value) : '—'), amountText(item.values.reduce((sum, value) => sum + value, 0))].forEach((value, index) => {
      const cell = document.createElement(index < 2 ? 'th' : 'td');
      if (index < 2) cell.scope = 'row';
      cell.textContent = value;
      if (index > 1 && value !== '—') cell.className = item.type === 'Utgift' ? 'amount-negative' : 'amount-positive';
      row.append(cell);
    });
    return row;
  }));
  document.getElementById('year-total').textContent = `${rows.length} kategorier`;
}

function renderRecurring() {
  const list = document.getElementById('recurring-list');
  list.replaceChildren(...state.recurring.map((item, index) => {
    const row = document.createElement('li');
    const summary = document.createElement('span');
    summary.textContent = `${item.type} · ${item.category} · dag ${item.day} · ${amountText(item.amount)}`;
    const add = document.createElement('button');
    add.type = 'button'; add.className = 'row-action'; add.textContent = 'Legg inn i måneden';
    add.setAttribute('aria-label', `Legg ${item.category} inn i ${months[state.month]} ${state.year}`);
    add.addEventListener('click', () => {
      const lastDay = new Date(state.year, state.month + 1, 0).getDate();
      state.entries.push({ id: `entry-${state.nextId++}`, year: state.year, month: state.month, day: Math.min(item.day, lastDay), category: item.category, type: item.type, amount: item.amount });
      render(); announce(`Fiktiv fast post lagt inn én gang i ${months[state.month]}.`);
    });
    const remove = document.createElement('button');
    remove.type = 'button'; remove.className = 'row-action remove-action'; remove.textContent = 'Fjern';
    remove.setAttribute('aria-label', `Fjern fast post ${item.category}`);
    remove.addEventListener('click', () => { state.recurring.splice(index, 1); renderRecurring(); announce('Fast eksempelpost fjernet.'); });
    row.append(summary, add, remove);
    return row;
  }));
}

function beginEdit(entry) {
  state.editingId = entry.id;
  document.getElementById('entry-date').value = `${entry.year}-${String(entry.month + 1).padStart(2, '0')}-${String(entry.day).padStart(2, '0')}`;
  document.getElementById('entry-category').value = entry.category;
  document.getElementById('entry-amount').value = entry.amount;
  form.elements.type.value = entry.type;
  form.querySelector('button[type="submit"]').textContent = 'Lagre endring';
  document.getElementById('cancel-edit').hidden = false;
  document.getElementById('entry-category').focus();
  announce(`Endrer eksempelpost: ${entry.category}.`);
}

function cancelEdit() {
  state.editingId = null;
  form.reset();
  document.getElementById('entry-date').value = `${state.year}-${String(state.month + 1).padStart(2, '0')}-15`;
  form.querySelector('button[type="submit"]').textContent = 'Registrer';
  document.getElementById('cancel-edit').hidden = true;
}

function render() {
  renderSummary(); renderEntries(); renderMonthlyTotals(); renderRecurring(); updateCategoryOptions();
}

function announce(message) { document.getElementById('activity-status').textContent = message; }

monthSelect.replaceChildren(...months.map((month, index) => {
  const option = document.createElement('option'); option.value = index; option.textContent = month; return option;
}));
monthSelect.value = state.month;
document.getElementById('entry-date').value = `${state.year}-06-15`;
monthSelect.addEventListener('change', () => { state.month = Number(monthSelect.value); cancelEdit(); render(); });
form.addEventListener('submit', (event) => {
  event.preventDefault();
  const date = new Date(`${document.getElementById('entry-date').value}T12:00:00`);
  const category = document.getElementById('entry-category').value.trim();
  const amount = Number(document.getElementById('entry-amount').value);
  const type = form.elements.type.value;
  if (!category || !Number.isFinite(amount) || amount <= 0 || Number.isNaN(date.valueOf())) return;
  const existingCategory = categories.find((item) => item.name.toLocaleLowerCase('nb') === category.toLocaleLowerCase('nb'));
  if (!existingCategory) categories.push({ name: category, type });
  else if (existingCategory.type !== type && !state.entries.some((entry) => entry.category === existingCategory.name && entry.type === existingCategory.type)) existingCategory.type = type;
  const entry = { id: state.editingId || `entry-${state.nextId++}`, year: date.getFullYear(), month: date.getMonth(), day: date.getDate(), category, type, amount };
  if (state.editingId) state.entries = state.entries.map((candidate) => candidate.id === state.editingId ? entry : candidate);
  else state.entries.push(entry);
  state.year = entry.year; state.month = entry.month; monthSelect.value = state.month;
  const wasEditing = Boolean(state.editingId);
  cancelEdit(); render();
  announce(wasEditing ? 'Eksempelposten er endret lokalt.' : 'Eksempelpost registrert lokalt.');
});

document.getElementById('new-year').addEventListener('click', () => {
  state.year += 1;
  state.month = 0;
  monthSelect.value = state.month;
  state.recurring.forEach((item) => {
    const lastDay = new Date(state.year, state.month + 1, 0).getDate();
    state.entries.push({ id: `entry-${state.nextId++}`, year: state.year, month: state.month, day: Math.min(item.day, lastDay), category: item.category, type: item.type, amount: item.amount });
  });
  cancelEdit(); render(); announce(`Nytt tomt årsark for ${state.year} opprettet. Faste eksempelposter er lagt inn i januar.`);
});

document.getElementById('recurring-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const category = String(data.get('category')).trim();
  const amount = Number(data.get('amount'));
  const day = Number(data.get('day'));
  if (!category || !Number.isFinite(amount) || amount <= 0 || day < 1 || day > 31) return;
  const type = String(data.get('type'));
  state.recurring.push({ type, category, amount, day });
  if (!categories.some((item) => item.name.toLocaleLowerCase('nb') === category.toLocaleLowerCase('nb'))) categories.push({ name: category, type });
  event.currentTarget.reset();
  render(); announce('Fast eksempelpost lagt til. Den oppretter ikke poster automatisk.');
});

const cancelButton = document.createElement('button');
cancelButton.id = 'cancel-edit'; cancelButton.type = 'button'; cancelButton.className = 'secondary-button'; cancelButton.textContent = 'Avbryt endring'; cancelButton.hidden = true;
form.append(cancelButton);
cancelButton.addEventListener('click', () => { cancelEdit(); announce('Endring avbrutt.'); });
render();
