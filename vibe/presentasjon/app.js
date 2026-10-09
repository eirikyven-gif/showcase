const slides = [
  {
    kicker: '01 · Se etter mønstre',
    title: 'Været forteller en historie',
    copy: 'En enkelt måling er et øyeblikksbilde. Flere målinger over tid gjør det lettere å se hva som forandrer seg.',
  },
  {
    kicker: '02 · Legg merke til omgivelsene',
    title: 'Små tegn gir nyttige spørsmål',
    copy: 'Er det skydekke, vind eller regn? Noter det du faktisk ser, og skill observasjoner fra gjetninger.',
  },
  {
    kicker: '03 · Del det dere lærer',
    title: 'Sammenlign før dere konkluderer',
    copy: 'Når gruppa samler målinger på samme måte, blir endringer lettere å oppdage og forklare.',
  },
];

const kicker = document.querySelector('#slide-kicker');
const title = document.querySelector('#slide-title');
const copy = document.querySelector('#slide-copy');
const counter = document.querySelector('#counter');
const previous = document.querySelector('#previous');
const next = document.querySelector('#next');
let current = 0;

function showSlide(index) {
  current = Math.max(0, Math.min(index, slides.length - 1));
  const slide = slides[current];
  kicker.textContent = slide.kicker;
  title.textContent = slide.title;
  copy.textContent = slide.copy;
  counter.textContent = `Lysbilde ${current + 1} av ${slides.length}`;
  previous.disabled = current === 0;
  next.disabled = current === slides.length - 1;
}

previous.addEventListener('click', () => showSlide(current - 1));
next.addEventListener('click', () => showSlide(current + 1));
document.addEventListener('keydown', (event) => {
  if (event.altKey || event.ctrlKey || event.metaKey || event.target.closest('input, textarea, select, [contenteditable="true"]')) return;
  if (event.key === 'ArrowLeft') showSlide(current - 1);
  if (event.key === 'ArrowRight') showSlide(current + 1);
});

showSlide(current);
