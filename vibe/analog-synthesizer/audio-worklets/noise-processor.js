class AnalogNoiseProcessor extends AudioWorkletProcessor {
  static get parameterDescriptors() {
    return [
      { name: 'color', defaultValue: 0, minValue: 0, maxValue: 2, automationRate: 'k-rate' },
      { name: 'width', defaultValue: 0.45, minValue: 0, maxValue: 1, automationRate: 'k-rate' },
    ];
  }

  constructor() {
    super();
    this.pink0 = [0, 0];
    this.pink1 = [0, 0];
    this.pink2 = [0, 0];
    this.brown = [0, 0];
  }

  nextSample(channelIndex, color) {
    const channel = Math.min(channelIndex, 1);
    const white = (Math.random() * 2) - 1;
    this.pink0[channel] = (0.99765 * this.pink0[channel]) + (white * 0.099046);
    this.pink1[channel] = (0.963 * this.pink1[channel]) + (white * 0.2965164);
    this.pink2[channel] = (0.57 * this.pink2[channel]) + (white * 1.0526913);
    const pink = (this.pink0[channel] + this.pink1[channel] + this.pink2[channel] + (white * 0.1848)) * 0.05;
    this.brown[channel] = Math.max(-1, Math.min(1, this.brown[channel] + (white * 0.02)));
    // Equal-power-ish endpoint trim keeps white, pink and brown noise at useful,
    // comparable perceived levels before the user-controlled Noise gain.
    const normalizedWhite = white * 0.55;
    const normalizedPink = Math.max(-1, Math.min(1, pink * 3.2));
    const normalizedBrown = this.brown[channel] * 0.5;
    const pinkMix = Math.min(1, color);
    const brownMix = Math.max(0, color - 1);
    const whitePink = (normalizedWhite * (1 - pinkMix)) + (normalizedPink * pinkMix);
    return (whitePink * (1 - brownMix)) + (normalizedBrown * brownMix);
  }

  process(_inputs, outputs, parameters) {
    const color = parameters.color[0] || 0;
    const width = parameters.width[0] ?? 0.45;
    for (const output of outputs) {
      for (let frame = 0; frame < (output[0]?.length || 0); frame += 1) {
        const left = this.nextSample(0, color);
        const right = output.length > 1 ? this.nextSample(1, color) : left;
        output[0][frame] = left;
        if (output[1]) output[1][frame] = (left * (1 - width)) + (right * width);
      }
    }
    return true;
  }
}

registerProcessor('analog-noise', AnalogNoiseProcessor);
