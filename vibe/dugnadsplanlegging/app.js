const roster = ['Deltaker A', 'Deltaker B', 'Deltaker C', 'Deltaker D'];
const initialShifts = [
  { id: 'rigg', name: 'Klargjøring', time: '09.00–11.00', person: 'Deltaker A' },
  { id: 'vertskap', name: 'Vertskap', time: '11.00–13.00', person: 'Deltaker B' },
  { id: 'rydd', name: 'Opprydding', time: '13.00–15.00', person: 'Deltaker C' },
];
let shifts = initialShifts.map((shift) => ({ ...shift }));
const shiftList = document.querySelector('#shift-list');
const planStatus = document.querySelector('#plan-status');

function renderShifts() {
  shiftList.replaceChildren();
  for (const shift of shifts) {
    const row = document.createElement('article');
    row.className = 'shift';
    const title = document.createElement('div');
    title.className = 'shift-title';
    title.textContent = shift.name;
    const time = document.createElement('span');
    time.className = 'shift-time';
    time.textContent = shift.time;
    title.append(time);
    const assigned = document.createElement('p');
    assigned.className = 'assignment';
    assigned.textContent = `Oppdiktet deltaker: ${shift.person}`;
    const label = document.createElement('label');
    label.htmlFor = `participant-${shift.id}`;
    label.append(document.createTextNode('Velg oppdiktet deltaker'));
    const select = document.createElement('select');
    select.id = `participant-${shift.id}`;
    select.setAttribute('aria-label', `${shift.name}: velg oppdiktet deltaker`);
    for (const person of roster) {
      const option = document.createElement('option');
      option.value = person;
      option.textContent = person;
      option.selected = person === shift.person;
      select.append(option);
    }
    select.addEventListener('change', () => {
      shift.person = select.value;
      assigned.textContent = `Oppdiktet deltaker: ${shift.person}`;
      planStatus.textContent = `${shift.name} er nå tildelt ${shift.person}. Endringen er bare i denne visningen.`;
    });
    label.append(select);
    row.append(title, assigned, label);
    shiftList.append(row);
  }
}

document.querySelector('#reset-plan').addEventListener('click', () => {
  shifts = initialShifts.map((shift) => ({ ...shift }));
  renderShifts();
  planStatus.textContent = 'Eksempelplanen er nullstilt.';
});

renderShifts();
