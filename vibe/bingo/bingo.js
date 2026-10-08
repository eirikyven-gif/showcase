(() => {
  const cells = document.getElementById('cells');
  const status = document.getElementById('status');
  const reset = document.getElementById('reset');
  const columns = [
    [4, 11, 2, 14, 8], [23, 19, 28, 17, 25], [35, 42, 'FRI', 31, 38],
    [53, 47, 59, 50, 45], [68, 74, 63, 71, 66],
  ];
  const buttons = [];
  for (let row = 0; row < 5; row += 1) {
    for (let col = 0; col < 5; col += 1) {
      const value = columns[col][row];
      const button = document.createElement('button');
      const free = value === 'FRI';
      button.type = 'button';
      button.textContent = free ? 'FRI RUTE' : String(value);
      button.setAttribute('aria-label', free ? 'Fri rute, alltid markert' : `${'BINGO'[col]} ${value}`);
      button.setAttribute('aria-pressed', free ? 'true' : 'false');
      if (free) { button.className = 'free'; button.disabled = true; }
      else button.addEventListener('click', () => {
        const marked = button.getAttribute('aria-pressed') !== 'true';
        button.setAttribute('aria-pressed', String(marked));
        const markedCount = buttons.filter((item) => item.getAttribute('aria-pressed') === 'true').length - 1;
        status.textContent = `${markedCount} ${markedCount === 1 ? 'rute' : 'ruter'} markert.`;
      });
      buttons.push(button);
      cells.append(button);
    }
  }
  reset.addEventListener('click', () => {
    for (const button of buttons) if (!button.disabled) button.setAttribute('aria-pressed', 'false');
    status.textContent = 'Brettet er nullstilt. Velg en rute for å markere den.';
    buttons[0].focus();
  });
})();
