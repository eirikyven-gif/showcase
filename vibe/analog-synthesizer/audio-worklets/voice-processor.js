class VoiceProcessor extends AudioWorkletProcessor {
  static get parameterDescriptors() {
    return [
      { name: 'pitch', defaultValue: 0, minValue: -12, maxValue: 12, automationRate: 'k-rate' },
      { name: 'ringRate', defaultValue: 0, minValue: 0, maxValue: 120, automationRate: 'k-rate' },
      { name: 'ringMix', defaultValue: 0, minValue: 0, maxValue: 1, automationRate: 'k-rate' },
      { name: 'drive', defaultValue: 0.05, minValue: 0, maxValue: 1, automationRate: 'k-rate' },
      { name: 'gate', defaultValue: -52, minValue: -70, maxValue: -20, automationRate: 'k-rate' },
      { name: 'wet', defaultValue: 0.08, minValue: 0, maxValue: 1, automationRate: 'k-rate' },
    ];
  }

  constructor() {
    super();
    this.bufferSize = 16384;
    this.windowSize = 2048;
    this.minDelay = 256;
    this.buffers = [new Float32Array(this.bufferSize), new Float32Array(this.bufferSize)];
    this.writeIndex = 0;
    this.phase = 0;
    this.ringPhase = 0;
    this.envelope = 0;
  }

  read(buffer, position) {
    const wrapped = ((position % this.bufferSize) + this.bufferSize) % this.bufferSize;
    const left = Math.floor(wrapped);
    const right = (left + 1) % this.bufferSize;
    const fraction = wrapped - left;
    return buffer[left] + ((buffer[right] - buffer[left]) * fraction);
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];
    const output = outputs[0];
    if (!output?.length) return true;
    const pitch = parameters.pitch[0] || 0;
    const ratio = 2 ** (pitch / 12);
    const ringRate = parameters.ringRate[0] || 0;
    const ringMix = parameters.ringMix[0] || 0;
    const drive = 1 + ((parameters.drive[0] || 0) * 18);
    const gateLinear = 10 ** ((parameters.gate[0] || -52) / 20);
    const wet = parameters.wet[0] || 0;

    for (let frame = 0; frame < output[0].length; frame += 1) {
      const mono = input?.length ? input.reduce((sum, channel) => sum + (channel[frame] || 0), 0) / input.length : 0;
      this.envelope += ((Math.abs(mono) > this.envelope ? 0.08 : 0.006) * (Math.abs(mono) - this.envelope));
      const gateGain = this.envelope >= gateLinear ? 1 : Math.max(0, this.envelope / Math.max(gateLinear, 0.00001));
      this.ringPhase = (this.ringPhase + ((Math.PI * 2 * ringRate) / sampleRate)) % (Math.PI * 2);

      for (let channelIndex = 0; channelIndex < output.length; channelIndex += 1) {
        const channelInput = input?.[channelIndex]?.[frame] ?? mono;
        const buffer = this.buffers[Math.min(channelIndex, 1)];
        buffer[this.writeIndex] = channelInput;
        let shifted = channelInput;
        if (Math.abs(pitch) > 0.01) {
          const phaseB = (this.phase + 0.5) % 1;
          const readA = this.writeIndex - this.minDelay - (this.phase * this.windowSize);
          const readB = this.writeIndex - this.minDelay - (phaseB * this.windowSize);
          const weightA = 0.5 - (0.5 * Math.cos(this.phase * Math.PI * 2));
          const weightB = 0.5 - (0.5 * Math.cos(phaseB * Math.PI * 2));
          shifted = ((this.read(buffer, readA) * weightA) + (this.read(buffer, readB) * weightB)) / Math.max(0.2, weightA + weightB);
        }
        const ringed = shifted * Math.sin(this.ringPhase);
        const robot = (shifted * (1 - ringMix)) + (ringed * ringMix);
        const driven = Math.tanh(robot * drive) / Math.tanh(drive);
        const processed = driven * gateGain;
        output[channelIndex][frame] = (channelInput * (1 - wet)) + (processed * wet);
      }
      this.writeIndex = (this.writeIndex + 1) % this.bufferSize;
      this.phase = (this.phase + ((1 - ratio) / this.windowSize) + 1) % 1;
    }
    return true;
  }
}

registerProcessor('voice-processor', VoiceProcessor);
