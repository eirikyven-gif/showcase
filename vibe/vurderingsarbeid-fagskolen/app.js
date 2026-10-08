(() => {
  const checks = [...document.querySelectorAll('#checklist input[type="checkbox"]')];
  const status = document.querySelector('#check-status');
  const update = () => {
    const count = checks.filter((check) => check.checked).length;
    status.textContent = count === 0 ? 'Ingen punkter valgt' : `${count} av ${checks.length} punkter valgt`;
  };
  checks.forEach((check) => check.addEventListener('change', update));
})();
