const examples = {
  juni: {
    income: 42800,
    expenses: 19750,
    entries: [
      { description: 'Eksempel: lønn', type: 'Inntekt', amount: 38500 },
      { description: 'Eksempel: småoppdrag', type: 'Inntekt', amount: 4300 },
      { description: 'Eksempel: bolig', type: 'Kostnad', amount: -12500 },
      { description: 'Eksempel: mat', type: 'Kostnad', amount: -4650 },
      { description: 'Eksempel: transport', type: 'Kostnad', amount: -2600 },
    ],
    recurring: [['Eksempel: bolig', 12500], ['Eksempel: mobil', 350], ['Eksempel: sparing', 1500]],
  },
  mai: {
    income: 41200,
    expenses: 20500,
    entries: [
      { description: 'Eksempel: lønn', type: 'Inntekt', amount: 38500 },
      { description: 'Eksempel: småoppdrag', type: 'Inntekt', amount: 2700 },
      { description: 'Eksempel: bolig', type: 'Kostnad', amount: -12500 },
      { description: 'Eksempel: mat', type: 'Kostnad', amount: -5400 },
      { description: 'Eksempel: transport', type: 'Kostnad', amount: -2600 },
    ],
    recurring: [['Eksempel: bolig', 12500], ['Eksempel: mobil', 350], ['Eksempel: sparing', 1500]],
  },
  april: {
    income: 39800,
    expenses: 18400,
    entries: [
      { description: 'Eksempel: lønn', type: 'Inntekt', amount: 38500 },
      { description: 'Eksempel: småoppdrag', type: 'Inntekt', amount: 1300 },
      { description: 'Eksempel: bolig', type: 'Kostnad', amount: -12500 },
      { description: 'Eksempel: mat', type: 'Kostnad', amount: -3300 },
      { description: 'Eksempel: transport', type: 'Kostnad', amount: -2600 },
    ],
    recurring: [['Eksempel: bolig', 12500], ['Eksempel: mobil', 350], ['Eksempel: sparing', 1500]],
  },
};

const monthSelect = document.getElementById('month-select');
const currency = new Intl.NumberFormat('nb-NO', { style: 'currency', currency: 'NOK', maximumFractionDigits: 0 });
const formatAmount = (amount) => currency.format(Math.abs(amount));

function renderMonth(month) {
  const data = examples[month];
  const balance = data.income - data.expenses;
  document.getElementById('income-total').textContent = formatAmount(data.income);
  document.getElementById('expense-total').textContent = formatAmount(data.expenses);
  document.getElementById('balance-total').textContent = formatAmount(balance);

  const entries = document.getElementById('entries-body');
  entries.replaceChildren(...data.entries.map((entry) => {
    const row = document.createElement('tr');
    const description = document.createElement('th');
    const type = document.createElement('td');
    const amount = document.createElement('td');
    description.scope = 'row';
    description.textContent = entry.description;
    type.textContent = entry.type;
    amount.textContent = `${entry.amount < 0 ? '−' : '+'}${formatAmount(entry.amount)}`;
    amount.className = entry.amount < 0 ? 'amount-negative' : 'amount-positive';
    row.append(description, type, amount);
    return row;
  }));
  document.getElementById('entry-count').textContent = `${data.entries.length} eksempelposter`;

  const recurring = document.getElementById('recurring-list');
  recurring.replaceChildren(...data.recurring.map(([descriptionText, amountValue]) => {
    const item = document.createElement('li');
    const description = document.createElement('span');
    const amount = document.createElement('strong');
    description.textContent = descriptionText;
    amount.textContent = formatAmount(amountValue);
    item.append(description, amount);
    return item;
  }));
  document.getElementById('activity-status').textContent = `Viser ${monthSelect.selectedOptions[0].textContent}. Eksempeltallene er bare endret på denne siden.`;
}

monthSelect.addEventListener('change', (event) => renderMonth(event.currentTarget.value));
renderMonth(monthSelect.value);
