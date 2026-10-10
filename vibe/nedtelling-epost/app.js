(() => {
  'use strict';

  const STORAGE_KEY = 'vibe.nedtelling-epost.v1';
  const form = document.getElementById('builder');
  const fields = Object.fromEntries(['name', 'title', 'date', 'time', 'format'].map((id) => [id, document.getElementById(id)]));
  const canvas = document.getElementById('preview');
  const ctx = canvas.getContext('2d');
  const status = document.getElementById('status');
  const description = document.getElementById('preview-description');
  const urlOutput = document.getElementById('image-url');
  const htmlOutput = document.getElementById('html-output');
  const copyUrl = document.getElementById('copy-url');
  const copyHtml = document.getElementById('copy-html');
  const buildButton = document.getElementById('build');
  const savedCount = document.getElementById('saved-count');
  const initial = { name: 'Ny e-postteller', title: 'Lansering', time: '12:00', format: 'gif' };
  let renderTimer;
  let generatedDataUrl = '';

  const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
  const localDate = () => {
    const date = new Date();
    const offset = date.getTimezoneOffset();
    return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 10);
  };
  const readSaved = () => {
    try {
      const entries = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      return Array.isArray(entries) ? entries.filter((entry) => entry && typeof entry === 'object') : [];
    } catch {
      return [];
    }
  };
  const setStatus = (message) => { status.textContent = message; };

  function countdown(date, time, offsetSeconds = 0) {
    const target = new Date(`${date}T${time || '12:00'}:00`);
    const remaining = Number.isNaN(target.getTime()) ? 0 : Math.max(0, Math.floor((target.getTime() - Date.now() - offsetSeconds * 1000) / 1000));
    return { days: Math.floor(remaining / 86400), hours: Math.floor((remaining % 86400) / 3600), minutes: Math.floor((remaining % 3600) / 60), seconds: remaining % 60 };
  }

  function draw(config, offsetSeconds = 0) {
    const { days, hours, minutes, seconds } = countdown(config.date, config.time, offsetSeconds);
    const { width: w, height: h } = canvas;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#17212b'; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#ffffff'; ctx.font = '700 14px Arial, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(config.title.slice(0, 70), w / 2, 17, w - 20);
    const labels = ['DAGER', 'TIMER', 'MIN', 'SEK'];
    const values = [String(days), String(hours).padStart(2, '0'), String(minutes).padStart(2, '0'), String(seconds).padStart(2, '0')];
    const margin = 15, gap = 6, boxW = (w - margin * 2 - gap * 3) / 4, boxY = 34, boxH = 47;
    for (let i = 0; i < 4; i += 1) {
      const x = margin + i * (boxW + gap);
      ctx.fillStyle = i === 3 ? '#2563eb' : '#454d59';
      ctx.beginPath(); ctx.roundRect(x, boxY, boxW, boxH, 6); ctx.fill();
      ctx.strokeStyle = '#ffffff70'; ctx.lineWidth = 1; ctx.stroke();
      ctx.fillStyle = '#ffffff'; ctx.font = '700 21px Arial, sans-serif'; ctx.fillText(values[i], x + boxW / 2, boxY + 19, boxW - 4);
      ctx.fillStyle = '#e5e7eb'; ctx.font = '700 7px Arial, sans-serif'; ctx.fillText(labels[i], x + boxW / 2, boxY + 37, boxW - 4);
    }
    const spoken = `${config.title}. ${days} dager, ${hours} timer, ${minutes} minutter og ${seconds} sekunder igjen.`;
    canvas.setAttribute('aria-label', spoken);
    description.textContent = `${spoken} Bildegenerering skjer lokalt.`;
  }

  const readFields = () => ({
    name: fields.name.value.trim().slice(0, 80) || initial.name,
    title: fields.title.value.trim().slice(0, 70) || 'Nedtelling',
    date: fields.date.value,
    time: fields.time.value || '12:00',
    format: fields.format.value === 'png' ? 'png' : 'gif'
  });

  function gifPalette() {
    const colors = [];
    for (let i = 0; i < 256; i += 1) colors.push((i >> 5) * 255 / 7, ((i >> 2) & 7) * 255 / 7, (i & 3) * 255 / 3);
    return colors;
  }

  function lzw(indices) {
    const clear = 256, end = 257;
    let dictionary, nextCode, codeSize, bitBuffer = 0, bitCount = 0;
    const output = [];
    const emit = (code) => {
      bitBuffer |= code << bitCount; bitCount += codeSize;
      while (bitCount >= 8) { output.push(bitBuffer & 255); bitBuffer >>>= 8; bitCount -= 8; }
    };
    const reset = () => { dictionary = new Map(); nextCode = 258; codeSize = 9; };
    reset(); emit(clear);
    let prefix = indices[0];
    for (let i = 1; i < indices.length; i += 1) {
      const pixel = indices[i], key = prefix * 256 + pixel;
      if (dictionary.has(key)) { prefix = dictionary.get(key); continue; }
      emit(prefix);
      if (nextCode < 4096) {
        dictionary.set(key, nextCode++);
        if (nextCode === (1 << codeSize) && codeSize < 12) codeSize += 1;
      } else { emit(clear); reset(); }
      prefix = pixel;
    }
    emit(prefix); emit(end);
    if (bitCount) output.push(bitBuffer & 255);
    return output;
  }

  function encodeGif(config) {
    const bytes = [];
    const byte = (...values) => bytes.push(...values);
    const word = (value) => byte(value & 255, (value >> 8) & 255);
    const text = (value) => { for (const char of value) byte(char.charCodeAt(0)); };
    const block = (data) => { for (let i = 0; i < data.length; i += 255) { const part = data.slice(i, i + 255); byte(part.length, ...part); } byte(0); };
    const w = canvas.width, h = canvas.height;
    text('GIF89a'); word(w); word(h); byte(0xf7, 0, 0); byte(...gifPalette());
    byte(0x21, 0xff, 0x0b); text('NETSCAPE2.0'); byte(3, 1, 0, 0, 0);
    for (let frame = 0; frame < 60; frame += 1) {
      draw(config, frame);
      const rgba = ctx.getImageData(0, 0, w, h).data, pixels = new Array(w * h);
      for (let i = 0, p = 0; i < rgba.length; i += 4, p += 1) pixels[p] = (rgba[i] >> 5) << 5 | (rgba[i + 1] >> 5) << 2 | (rgba[i + 2] >> 6);
      byte(0x21, 0xf9, 4, 0, 100, 0, 0, 0);
      byte(0x2c); word(0); word(0); word(w); word(h); byte(0);
      byte(8); block(lzw(pixels));
    }
    byte(0x3b);
    let binary = '';
    for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.slice(i, i + 0x8000));
    return `data:image/gif;base64,${btoa(binary)}`;
  }

  function saveConfig(config) {
    const entries = readSaved();
    const existing = entries.findIndex((entry) => entry.name.toLocaleLowerCase() === config.name.toLocaleLowerCase());
    const record = { ...config, updatedAt: new Date().toISOString() };
    if (existing >= 0) entries[existing] = record;
    else entries.push(record);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    renderSavedCount();
  }

  function renderSavedCount() {
    const count = readSaved().length;
    savedCount.textContent = count === 0 ? 'Ingen lagrede tellere' : `${count} ${count === 1 ? 'lagret teller' : 'lagrede tellere'}`;
  }

  async function generate(config, announce = true) {
    buildButton.disabled = true;
    buildButton.textContent = config.format === 'gif' ? 'Lager GIF …' : 'Lager bilde …';
    if (announce) setStatus(config.format === 'gif' ? 'Lager en lokal animert GIF med 60 ettsekundsrammer …' : 'Lager et lokalt PNG-bilde …');
    await new Promise((resolve) => requestAnimationFrame(() => setTimeout(resolve, 0)));
    try {
      draw(config);
      generatedDataUrl = config.format === 'gif' ? encodeGif(config) : canvas.toDataURL('image/png');
      const safeTitle = escapeHtml(config.title || 'Nedtelling');
      urlOutput.value = generatedDataUrl;
      htmlOutput.value = `<img src="${generatedDataUrl}" alt="${safeTitle}" />`;
      copyUrl.disabled = false; copyHtml.disabled = false;
      if (announce) setStatus(`Ferdig. ${config.format.toUpperCase()}-bildet og oppsettet er lagret lokalt. Kopier URL eller HTML.`);
    } catch (error) {
      generatedDataUrl = ''; urlOutput.value = ''; htmlOutput.value = '';
      copyUrl.disabled = true; copyHtml.disabled = true;
      setStatus(`Kunne ikke generere bildet i denne nettleseren: ${error.message}`);
    } finally {
      buildButton.disabled = false; buildButton.textContent = 'Lagre og generer';
      draw(config);
    }
  }

  async function copy(value, success) {
    if (!value) return setStatus('Ingen verdi å kopiere ennå.');
    try { await navigator.clipboard.writeText(value); setStatus(success); }
    catch { setStatus('Automatisk kopiering er ikke tilgjengelig. Marker teksten og kopier manuelt.'); }
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const config = readFields();
    saveConfig(config);
    void generate(config);
  });
  copyUrl.addEventListener('click', () => copy(urlOutput.value, 'Bilde-URL kopiert. Adressen fungerer bare lokalt i denne nettleseren.'));
  copyHtml.addEventListener('click', () => copy(htmlOutput.value, 'HTML kopiert. Bildeinnholdet er innebygd som en lokal dataadresse.'));
  document.getElementById('reset-all').addEventListener('click', () => {
    localStorage.removeItem(STORAGE_KEY);
    form.reset(); fields.date.value = localDate();
    urlOutput.value = ''; htmlOutput.value = ''; generatedDataUrl = '';
    copyUrl.disabled = true; copyHtml.disabled = true; renderSavedCount();
    draw(readFields()); setStatus('Demoen er nullstilt. Alle lokalt lagrede e-posttellere er slettet.'); fields.name.focus();
  });
  for (const field of Object.values(fields)) field.addEventListener('input', () => draw(readFields()));

  fields.date.value = localDate();
  const lastSaved = readSaved().at(-1);
  if (lastSaved) {
    for (const key of Object.keys(fields)) if (typeof lastSaved[key] === 'string') fields[key].value = lastSaved[key];
  }
  renderSavedCount();
  draw(readFields());
  if (lastSaved) {
    generate(readFields(), false).then(() => setStatus('Sist brukte teller er gjenopprettet fra lokal lagring.'));
  }
  renderTimer = window.setInterval(() => draw(readFields()), 1000);
  window.addEventListener('pagehide', () => window.clearInterval(renderTimer), { once: true });
})();
