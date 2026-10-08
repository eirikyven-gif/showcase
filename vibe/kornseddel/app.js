const printButton = document.querySelector('#print-button');
const printStatus = document.querySelector('#print-status');

printButton.addEventListener('click', () => {
  printStatus.textContent = 'Utskriftsdialogen er åpnet. Bare det syntetiske eksempelet vises.';
  window.print();
});
