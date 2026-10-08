'use strict';

// The single example selector intentionally has no data-loading behavior.
const exampleCase = document.querySelector('#case-selector');
exampleCase.addEventListener('click', () => {
  document.querySelector('#case-detail').scrollIntoView({ behavior: 'smooth', block: 'start' });
});
