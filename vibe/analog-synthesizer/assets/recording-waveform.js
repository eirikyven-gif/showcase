const SILENCE_EPSILON = 0.0005;

export function createRecordingWaveformHistory(length = 192) {
  return new Float32Array(Math.max(1, Math.floor(Number(length) || 1)));
}

export function resetRecordingWaveformHistory(history) {
  history?.fill?.(0);
  return history;
}

export function appendRecordingWaveformFrame(history, samples, columns = 4) {
  if (!(history instanceof Float32Array) || history.length === 0) return history;
  const columnCount = Math.max(1, Math.min(history.length, Math.floor(Number(columns) || 1)));
  history.copyWithin(0, columnCount);
  const sampleCount = samples?.length || 0;
  const samplesPerColumn = Math.max(1, Math.ceil(sampleCount / columnCount));

  for (let column = 0; column < columnCount; column += 1) {
    const start = column * samplesPerColumn;
    const end = Math.min(sampleCount, start + samplesPerColumn);
    let peak = 0;
    for (let index = start; index < end; index += 1) {
      const value = Math.abs(Number(samples[index]) || 0);
      if (value > peak) peak = value;
    }
    history[history.length - columnCount + column] = Math.min(1, peak);
  }
  return history;
}

export function recordingWaveformPath(
  peaks,
  { width = 1000, midpoint = 120, amplitude = 108 } = {},
) {
  if (!peaks?.length || !Array.from(peaks).some((peak) => peak > SILENCE_EPSILON)) {
    return `M0 ${midpoint}H${width}`;
  }
  const divisor = Math.max(1, peaks.length - 1);
  const points = Array.from(peaks, (peak, index) => ({
    x: (index / divisor) * width,
    peak: Math.max(0, Math.min(1, Number(peak) || 0)),
  }));
  const top = points.map(({ x, peak }, index) => (
    `${index ? 'L' : 'M'}${x.toFixed(1)} ${(midpoint - peak * amplitude).toFixed(1)}`
  ));
  const bottom = points.slice().reverse().map(({ x, peak }) => (
    `L${x.toFixed(1)} ${(midpoint + peak * amplitude).toFixed(1)}`
  ));
  return `${top.join('')} ${bottom.join('')} Z`;
}
