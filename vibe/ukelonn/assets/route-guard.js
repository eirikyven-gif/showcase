(() => {
  const root = document.body.dataset.appRoot || './';
  const role = document.body.dataset.role;
  const login = document.body.dataset.login || root + 'logg-inn/';
  let active = true;

  const showTechnicalError = () => {
    if (!active || document.querySelector('[data-route-guard-message]')) return;
    const target = document.querySelector('main');
    if (!target) return;
    const message = document.createElement('p');
    message.className = 'form-message';
    message.dataset.routeGuardMessage = '';
    message.setAttribute('role', 'status');
    message.textContent = 'Kunne ikke kontrollere innloggingen. Prøv igjen.';
    target.prepend(message);
  };

  window.addEventListener('pagehide', () => { active = false; }, { once: true });

  const session = window.Ukelonn?.session
    ? window.Ukelonn.session()
    : fetch(root + 'api/auth.php', { credentials: 'same-origin' })
      .then(async (response) => ({ response, payload: await response.json().catch(() => ({})) }));

  session.then(({ response, payload }) => {
    if (!active) return;
    if (response.status === 401 || response.status === 403 || (response.ok && (!payload.authenticated || payload.identity?.role !== role))) {
      location.replace(login);
      return;
    }
    if (!response.ok) showTechnicalError();
  }).catch((error) => {
    if (!active || error?.name === 'AbortError') return;
    showTechnicalError();
  });
})();