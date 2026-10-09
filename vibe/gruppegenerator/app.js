(() => {
  const sample = ['Deltaker A', 'Deltaker B', 'Deltaker C', 'Deltaker D', 'Deltaker E', 'Deltaker F', 'Deltaker G', 'Deltaker H'];
  const countSelect = document.querySelector('#group-count');
  const groupsEl = document.querySelector('#groups');
  const summaryEl = document.querySelector('#summary');
  const statusEl = document.querySelector('#status');

  function makeGroups(count, shuffle = true) {
    const names = [...sample];
    if (shuffle) {
      for (let i = names.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [names[i], names[j]] = [names[j], names[i]];
      }
    }
    const groups = Array.from({ length: count }, (_, i) => ({ name: `Gruppe ${i + 1}`, members: [] }));
    names.forEach((name, index) => groups[index % count].members.push(name));
    return groups;
  }

  function render(groups) {
    groupsEl.replaceChildren();
    groups.forEach((group) => {
      const card = document.createElement('article');
      card.className = 'group';
      const heading = document.createElement('div');
      heading.className = 'group-head';
      const title = document.createElement('h3');
      title.textContent = group.name;
      const size = document.createElement('span');
      size.className = 'group-count';
      size.textContent = `${group.members.length} deltakere`;
      heading.append(title, size);
      card.append(heading);
      group.members.forEach((name) => {
        const row = document.createElement('div');
        row.className = 'member';
        const mark = document.createElement('span');
        mark.className = 'member-mark';
        mark.setAttribute('aria-hidden', 'true');
        mark.textContent = name.slice(-1);
        const label = document.createElement('span');
        label.className = 'member-name';
        label.textContent = name;
        row.append(mark, label);
        card.append(row);
      });
      groupsEl.append(card);
    });
    const total = groups.reduce((sum, group) => sum + group.members.length, 0);
    summaryEl.textContent = `${groups.length} grupper · ${total} deltakere`;
  }

  function shuffleGroups() {
    render(makeGroups(Number(countSelect.value)));
    statusEl.textContent = 'Gruppene er blandet på nytt. Eksempeldataene finnes bare i denne fanen.';
  }

  document.querySelector('#generate').addEventListener('click', shuffleGroups);
  countSelect.addEventListener('change', shuffleGroups);
  document.querySelector('#reset').addEventListener('click', () => {
    countSelect.value = '3';
    render(makeGroups(3, false));
    statusEl.textContent = 'Eksempelet er nullstilt til tre grupper.';
  });
  render(makeGroups(3, false));
})();
