const decks = {
  student: [
    ['01 · Fiktivt eksempel','Slik virker en drivhussensor','En sensor kan måle temperatur og luftfuktighet gjennom dagen.'],
    ['02 · Se etter mønstre','Målinger får mening over tid','Sammenlign målinger fra morgen, middag og kveld før du beskriver en endring.'],
    ['03 · Undersøk videre','Hva kan påvirke resultatet?','Plassering, skygge og ventilasjon kan endre målingen. Noter forholdene rundt sensoren.'],
  ],
  larer: [
    ['01 · Undervisernotat','Start med en undersøkbar idé','Be gruppa formulere hva den vil finne ut, og hvilke observasjoner som kan gi et svar.'],
    ['02 · Sammenlign','Skill observasjon fra forklaring','La studentene beskrive målingene først. Samle mulige forklaringer etterpå.'],
    ['03 · Oppsummer','Bruk evidens i konklusjonen','En god oppsummering viser både mønsteret i dataene og usikkerheten i målingene.'],
  ],
};
const labels = { student: 'Studentvisning', larer: 'Lærervisning' };
const stage = document.querySelector('#stage');
const counter = document.querySelector('#counter');
const clock = document.querySelector('#clock');
let view = 'student';
let index = 0;
let slideSeconds = 30;
let manifestSeconds = 60;
let advanceTimer;
let manifestTimer;
let previewTimer;
let previewEnd;
let bingoMode = false;
let revision = 1;

function draw() {
  const slides = decks[view];
  const [kicker, title, copy] = slides[index];
  stage.setAttribute('aria-label', labels[view]);
  stage.innerHTML = `<article class="slide"><p class="slide-kicker"></p><h2></h2><p class="slide-copy"></p><div class="illustration" aria-hidden="true"><span></span><span></span><span></span><b></b></div></article>`;
  stage.querySelector('.slide-kicker').textContent = kicker;
  stage.querySelector('h2').textContent = title;
  stage.querySelector('.slide-copy').textContent = copy;
  counter.textContent = `Lysbilde ${index + 1} av ${slides.length}`;
  document.querySelector('#view-label').textContent = labels[view];
  document.querySelector('#previous').disabled = slides.length < 2;
  document.querySelector('#next').disabled = slides.length < 2;
  clearTimeout(advanceTimer);
  if (!bingoMode) advanceTimer = setTimeout(() => move(1), slideSeconds * 1000);
}
function move(delta) { index = (index + delta + decks[view].length) % decks[view].length; draw(); }
function scheduleManifestCheck() {
  clearTimeout(manifestTimer);
  manifestTimer = setTimeout(() => {
    // Lokale dekker står fast; polling simulerer kildevisningens versjonskontroll.
    revision += 1;
    document.querySelector('#preview-status').textContent = ` Lokal versjonskontroll ${revision} · sist sjekket nå.`;
    scheduleManifestCheck();
  }, manifestSeconds * 1000);
}
function bingoPhase(date) {
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone:'Europe/Oslo', weekday:'long', hour:'2-digit', minute:'2-digit', hourCycle:'h23' }).formatToParts(date);
  const values = Object.fromEntries(parts.map(p => [p.type,p.value]));
  const minutes = Number(values.hour) * 60 + Number(values.minute);
  return values.weekday === 'Wednesday' && minutes >= 705 && minutes < 735 ? (minutes < 720 ? 'countdown' : 'active') : 'inactive';
}
function countdownSeconds(date) {
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone:'Europe/Oslo', hour:'2-digit', minute:'2-digit', second:'2-digit', hourCycle:'h23' }).formatToParts(date);
  const values = Object.fromEntries(parts.map(p => [p.type,p.value]));
  return Math.max(0, 43200 - Number(values.hour) * 3600 - Number(values.minute) * 60 - Number(values.second));
}
function paintClock() {
  const now = new Date();
  clock.textContent = new Intl.DateTimeFormat('nb-NO', { timeZone:'Europe/Oslo', hour:'2-digit', minute:'2-digit', second:'2-digit' }).format(now);
  if (!previewEnd && bingoPhase(now) !== 'inactive') showBingo(bingoPhase(now), now);
  else if (previewEnd && now >= previewEnd) stopBingo();
  else if (bingoMode) showBingo('active', now);
  setTimeout(paintClock, 1000);
}
function showBingo(phase, now) {
  bingoMode = true;
  clearTimeout(advanceTimer);
  const remain = countdownSeconds(now);
  const title = phase === 'countdown' ? `Bingo starter om ${String(Math.floor(remain / 60)).padStart(2,'0')}:${String(remain % 60).padStart(2,'0')}` : 'Bingo pågår';
  stage.innerHTML = '<section class="bingo-surface"><h2></h2><div><p class="bingo-label">FIKTIV DEMO · IKKE EN BETALING</p><p class="bingo-code">DEMO-000</p><p>Oppdiktet eksempel · 0 kr</p></div></section>';
  stage.querySelector('h2').textContent = title;
  counter.textContent = 'Automatisk lysbildefremdrift er pauset';
}
function stopBingo() {
  bingoMode = false;
  previewEnd = null;
  clearInterval(previewTimer);
  document.querySelector('#bingo-preview').hidden = false;
  document.querySelector('#stop-preview').hidden = true;
  document.querySelector('#preview-status').textContent = ' Demo avsluttet.';
  draw();
}
document.querySelectorAll('[data-view]').forEach(button => button.addEventListener('click', () => {
  view = button.dataset.view; index = 0;
  document.querySelectorAll('[data-view]').forEach(tab => tab.setAttribute('aria-pressed', String(tab === button)));
  draw();
}));
document.querySelector('#previous').addEventListener('click', () => move(-1));
document.querySelector('#next').addEventListener('click', () => move(1));
document.addEventListener('keydown', event => {
  if (event.altKey || event.ctrlKey || event.metaKey || event.target.closest('input,textarea,select,[contenteditable="true"]')) return;
  if (event.key === 'ArrowLeft') move(-1);
  if (event.key === 'ArrowRight') move(1);
});
document.querySelector('#fullscreen').addEventListener('click', async () => {
  try { if (document.fullscreenElement) await document.exitFullscreen(); else await document.querySelector('.stage-wrap').requestFullscreen(); }
  catch { document.querySelector('#settings-message').textContent = 'Fullskjerm støttes ikke av denne nettleseren.'; }
});
document.querySelector('#save-settings').addEventListener('click', () => {
  const slide = Number(document.querySelector('#slide-seconds').value);
  const manifest = Number(document.querySelector('#manifest-seconds').value);
  if (!Number.isInteger(slide) || slide < 5 || slide > 3600 || !Number.isInteger(manifest) || manifest < 15 || manifest > 3600) {
    document.querySelector('#settings-message').textContent = 'Bruk hele sekunder: lysbilde 5–3600, versjonskontroll 15–3600.'; return;
  }
  slideSeconds = slide; manifestSeconds = manifest; draw(); scheduleManifestCheck();
  document.querySelector('#settings-message').textContent = 'Innstillingene er aktive for denne nettleserøkten. De er ikke lagret.';
});
document.querySelector('#reset-settings').addEventListener('click', () => {
  slideSeconds = 30; manifestSeconds = 60;
  document.querySelector('#slide-seconds').value = '30'; document.querySelector('#manifest-seconds').value = '60';
  draw(); scheduleManifestCheck(); document.querySelector('#settings-message').textContent = 'Standardverdier gjenopprettet for denne økten.';
});
document.querySelector('#bingo-preview').addEventListener('click', () => {
  previewEnd = new Date(Date.now() + 20000); showBingo('active', new Date());
  document.querySelector('#bingo-preview').hidden = true; document.querySelector('#stop-preview').hidden = false;
  document.querySelector('#preview-status').textContent = ' Eksempel aktivt i opptil 20 sekunder.';
});
document.querySelector('#stop-preview').addEventListener('click', stopBingo);
draw(); scheduleManifestCheck(); paintClock();
