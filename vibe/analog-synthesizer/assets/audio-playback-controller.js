const CONTEXT_STATES = new Set(['running', 'suspended', 'interrupted', 'closed']);

function normalizeContextState(contextState) {
  return CONTEXT_STATES.has(contextState) ? contextState : 'none';
}

export function resolveSequencerResumeStep(pendingSteps, currentStep, contextTime) {
  const nextPending = Array.from(pendingSteps || [])
    .find((entry) => Number(entry?.time) >= Number(contextTime) && Number.isInteger(entry?.step));
  return nextPending?.step ?? currentStep;
}

export function resolveAudioPlaybackView({
  contextState = 'none',
  phase = 'idle',
  sampleRate = 0,
  error = '',
} = {}) {
  const normalizedContextState = normalizeContextState(contextState);
  const sampleRateLabel = sampleRate ? `${Math.round(sampleRate / 100) / 10} kHz` : '';

  if (phase === 'starting') {
    return {
      state: 'starting',
      running: false,
      busy: true,
      startLabel: 'Starter…',
      startDisabled: true,
      stopDisabled: true,
      topStatus: 'Lyd starter…',
      playerTitle: 'Starter lyd',
      playerCopy: 'Lydmotoren aktiveres.',
      waveformLive: false,
      waveformStatus: 'Venter på lyd',
    };
  }

  if (phase === 'stopping') {
    return {
      state: 'stopping',
      running: false,
      busy: true,
      startLabel: 'Start lyd',
      startDisabled: true,
      stopDisabled: true,
      topStatus: 'Lyd stopper…',
      playerTitle: 'Stopper lyd',
      playerCopy: 'Lydmotoren suspenderes uten å nullstille økten.',
      waveformLive: false,
      waveformStatus: 'Stopper · flat linje',
    };
  }

  if (phase === 'error') {
    return {
      state: 'error',
      running: normalizedContextState === 'running',
      busy: false,
      startLabel: normalizedContextState === 'running' ? 'Lyd på' : 'Prøv igjen',
      startDisabled: normalizedContextState === 'closed',
      stopDisabled: normalizedContextState !== 'running',
      topStatus: 'Lydfeil',
      playerTitle: 'Lydfeil',
      playerCopy: error || 'Lydmotoren svarte ikke som forventet.',
      waveformLive: normalizedContextState === 'running',
      waveformStatus: normalizedContextState === 'running' ? 'Live masterutgang' : 'Utilgjengelig · flat linje',
    };
  }

  if (normalizedContextState === 'running') {
    return {
      state: 'running',
      running: true,
      busy: false,
      startLabel: 'Lyd på',
      startDisabled: false,
      stopDisabled: false,
      topStatus: `Lyd på${sampleRateLabel ? ` · ${sampleRateLabel}` : ''}`,
      playerTitle: 'Spiller',
      playerCopy: 'Masterutgang i sanntid.',
      waveformLive: true,
      waveformStatus: 'Live masterutgang',
    };
  }

  if (normalizedContextState === 'interrupted') {
    return {
      state: 'interrupted',
      running: false,
      busy: false,
      startLabel: 'Gjenoppta',
      startDisabled: false,
      stopDisabled: true,
      topStatus: 'Lyd avbrutt',
      playerTitle: 'Avbrutt av enheten',
      playerCopy: 'Trykk Gjenoppta når enheten er klar.',
      waveformLive: false,
      waveformStatus: 'Avbrutt · flat linje',
    };
  }

  if (normalizedContextState === 'closed') {
    return {
      state: 'closed',
      running: false,
      busy: false,
      startLabel: 'Lyd lukket',
      startDisabled: true,
      stopDisabled: true,
      topStatus: 'Lydmotor lukket',
      playerTitle: 'Lydmotor lukket',
      playerCopy: 'Last inn appen på nytt for å starte lydmotoren.',
      waveformLive: false,
      waveformStatus: 'Utilgjengelig · flat linje',
    };
  }

  if (normalizedContextState === 'suspended') {
    return {
      state: 'suspended',
      running: false,
      busy: false,
      startLabel: 'Gjenoppta',
      startDisabled: false,
      stopDisabled: true,
      topStatus: 'Lyd stoppet',
      playerTitle: 'Stoppet',
      playerCopy: 'Innstillinger og avspillingstilstand er bevart.',
      waveformLive: false,
      waveformStatus: 'Stoppet · flat linje',
    };
  }

  return {
    state: 'initial',
    running: false,
    busy: false,
    startLabel: 'Start lyd',
    startDisabled: false,
    stopDisabled: true,
    topStatus: 'Lyd er av',
    playerTitle: 'Klar',
    playerCopy: 'Trykk Start lyd for å aktivere lydmotoren.',
    waveformLive: false,
    waveformStatus: 'Venter på lyd · flat linje',
  };
}

export function createAudioPlaybackController({
  engine,
  getState,
  onPause,
  onResume,
  onChange,
  onError,
}) {
  if (!engine || typeof engine.start !== 'function' || typeof engine.suspend !== 'function') {
    throw new Error('Lydkontrolleren mangler en gyldig lydmotor.');
  }

  let phase = 'idle';
  let errorMessage = '';
  let observedContext = null;
  let operation = Promise.resolve();

  const render = () => {
    const view = resolveAudioPlaybackView({
      contextState: engine.context?.state,
      phase,
      sampleRate: engine.context?.sampleRate,
      error: errorMessage,
    });
    onChange?.(view);
    return view;
  };

  const handleContextState = () => {
    if (phase !== 'idle') return;
    const contextState = engine.context?.state;
    if (contextState === 'running' && engine.hasPendingPlaybackResume?.()) {
      phase = 'starting';
      errorMessage = '';
      render();
      void enqueue(async () => {
        try {
          await engine.restorePlaybackAfterResume(getState?.());
          phase = 'idle';
          onResume?.();
          render();
          return true;
        } catch (error) {
          return reportError(error);
        }
      });
      return;
    }
    if (contextState === 'running') onResume?.();
    else if (CONTEXT_STATES.has(contextState)) {
      engine.capturePlaybackResumeSnapshot?.();
      onPause?.();
    }
    render();
  };

  const observeContext = () => {
    if (observedContext === engine.context) return;
    observedContext?.removeEventListener?.('statechange', handleContextState);
    observedContext = engine.context;
    observedContext?.addEventListener?.('statechange', handleContextState);
  };

  const enqueue = (task) => {
    const result = operation.then(task, task);
    operation = result.catch(() => false);
    return result;
  };

  const reportError = (error) => {
    const normalized = error instanceof Error ? error : new Error(String(error || 'Ukjent lydfeil.'));
    errorMessage = normalized.message;
    phase = 'error';
    onError?.(normalized);
    render();
    return false;
  };

  const start = () => enqueue(async () => {
    if (engine.context?.state === 'running' && !engine.hasPendingPlaybackResume?.()) {
      observeContext();
      phase = 'idle';
      errorMessage = '';
      onResume?.();
      render();
      return true;
    }

    phase = 'starting';
    errorMessage = '';
    render();
    try {
      await engine.start(getState?.());
      observeContext();
      if (engine.context?.state !== 'running') throw new Error('Lydmotoren kunne ikke gå til aktiv tilstand.');
      phase = 'idle';
      onResume?.();
      render();
      return true;
    } catch (error) {
      return reportError(error);
    }
  });

  const stop = () => enqueue(async () => {
    observeContext();
    if (!engine.context || engine.context.state !== 'running') {
      if (engine.context) onPause?.();
      phase = 'idle';
      errorMessage = '';
      render();
      return true;
    }

    phase = 'stopping';
    errorMessage = '';
    render();
    onPause?.();
    try {
      await engine.suspend();
      if (engine.context?.state === 'running') throw new Error('Lydmotoren kunne ikke stoppes.');
      phase = 'idle';
      render();
      return true;
    } catch (error) {
      if (engine.context?.state === 'running') onResume?.();
      return reportError(error);
    }
  });

  const destroy = () => {
    observedContext?.removeEventListener?.('statechange', handleContextState);
    observedContext = null;
  };

  render();
  return { start, stop, render, destroy };
}
