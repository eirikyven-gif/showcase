const temperature = document.querySelector('#temperature');
const wind = document.querySelector('#wind');
const volume = document.querySelector('#volume');
const status = document.querySelector('#status');
const toggle = document.querySelector('#toggle');
const tempValue = document.querySelector('#temp-value');
const windValue = document.querySelector('#wind-value');
const volumeValue = document.querySelector('#volume-value');
const toneIndicator = document.querySelector('#tone-indicator');

let audioContext;
let oscillator;
let gain;

function syncReadouts() {
  tempValue.value = temperature.value;
  windValue.value = wind.value;
  volumeValue.value = `${volume.value} %`;
  toneIndicator.style.width = `${12 + Number(wind.value) * 3.8}%`;
  if (oscillator && audioContext) {
    oscillator.frequency.setTargetAtTime(180 + (Number(temperature.value) + 5) * 5, audioContext.currentTime, 0.12);
    gain.gain.setTargetAtTime(Number(volume.value) / 1000, audioContext.currentTime, 0.12);
  }
}

async function startSound() {
  const AudioContextType = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextType) {
    status.textContent = 'Nettleseren støtter ikke Web Audio.';
    return;
  }
  try {
    audioContext ??= new AudioContextType();
    await audioContext.resume();
    oscillator ??= audioContext.createOscillator();
    if (!gain) {
      gain = audioContext.createGain();
      oscillator.type = 'sine';
      oscillator.connect(gain);
      gain.connect(audioContext.destination);
      oscillator.start();
    }
    syncReadouts();
    status.textContent = 'Lokal tone spiller. Juster verdiene for å forme den.';
    toggle.textContent = 'Stopp lyd';
    toggle.setAttribute('aria-pressed', 'true');
  } catch {
    status.textContent = 'Lyden kunne ikke startes. Prøv igjen med Start lyd.';
  }
}

async function stopSound() {
  if (audioContext?.state === 'running') await audioContext.suspend();
  status.textContent = 'Lyden er av. Verdiene er fortsatt bare i denne fanen.';
  toggle.textContent = 'Start lyd';
  toggle.setAttribute('aria-pressed', 'false');
}

temperature.addEventListener('input', syncReadouts);
wind.addEventListener('input', syncReadouts);
volume.addEventListener('input', syncReadouts);
toggle.addEventListener('click', () => audioContext?.state === 'running' ? stopSound() : startSound());
syncReadouts();
