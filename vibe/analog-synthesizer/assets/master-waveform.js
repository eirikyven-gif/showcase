export function flatWaveformPath(width = 640, height = 90) {
  return `M0 ${Number(height) / 2}H${Number(width)}`;
}

export function waveformLevel(data) {
  if (!data?.length) return -Infinity;
  let sum = 0;
  for (const value of data) {
    const normalized = (Number(value) - 128) / 128;
    sum += normalized * normalized;
  }
  const rms = Math.sqrt(sum / data.length);
  return rms > 0 ? 20 * Math.log10(rms) : -Infinity;
}

export function masterWaveformPath(data, {
  width = 640,
  height = 90,
  stride = 4,
  silenceThresholdDb = -60,
} = {}) {
  if (!data?.length || waveformLevel(data) <= silenceThresholdDb) return flatWaveformPath(width, height);
  const safeStride = Math.max(1, Math.floor(Number(stride) || 1));
  const points = [];
  for (let index = 0; index < data.length; index += safeStride) {
    const x = (index / Math.max(1, data.length - 1)) * width;
    const y = (Number(data[index]) / 255) * height;
    points.push(`${points.length ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`);
  }
  return points.join('') || flatWaveformPath(width, height);
}

export function resolveMasterWaveformStatus({
  playbackState = 'initial',
  hasData = false,
  level = -Infinity,
} = {}) {
  if (playbackState === 'running') {
    if (!hasData) return 'Masteranalyse utilgjengelig · flat linje';
    return Number.isFinite(level) && level > -60 ? 'Live masterutgang' : 'Masterutgang er stille · flat linje';
  }
  if (playbackState === 'suspended') return 'Stoppet · flat linje';
  if (playbackState === 'interrupted') return 'Avbrutt · flat linje';
  if (playbackState === 'error' || playbackState === 'closed') return 'Utilgjengelig · flat linje';
  if (playbackState === 'stopping') return 'Stopper · flat linje';
  return 'Venter på lyd · flat linje';
}
