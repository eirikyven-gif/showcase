export function createPadActivationController({
  isLoopMode,
  isActive,
  start,
  stop,
} = {}) {
  if (![isLoopMode, isActive, start, stop].every((callback) => typeof callback === 'function')) {
    throw new TypeError('Padaktivering krever isLoopMode, isActive, start og stop.');
  }

  const queues = new Map();
  const versions = new Map();
  const currentVersion = (index) => versions.get(index) || 0;

  function cancel(index) {
    versions.set(index, currentVersion(index) + 1);
  }

  function cancelAll(count) {
    for (let index = 0; index < count; index += 1) cancel(index);
  }

  function activate(index, velocity = 1) {
    const padIndex = Number(index);
    const activationVersion = currentVersion(padIndex);
    const isCurrent = () => activationVersion === currentVersion(padIndex);
    const previous = queues.get(padIndex) || Promise.resolve();
    let activation;
    activation = previous
      .catch(() => false)
      .then(async () => {
        if (!isCurrent()) return false;
        if (isLoopMode(padIndex) && isActive(padIndex)) {
          stop(padIndex);
          return false;
        }
        return Boolean(await start(padIndex, velocity, isCurrent));
      })
      .finally(() => {
        if (queues.get(padIndex) === activation) queues.delete(padIndex);
      });
    queues.set(padIndex, activation);
    return activation;
  }

  return {
    activate,
    cancel,
    cancelAll,
  };
}
