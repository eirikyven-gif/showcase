(() => {
  const issue497Version = 'v0.16.17-issue-497-consistent-fab-2026-06-29';
  const fabSelector = '#openIncidentModalButton';

  function hasUser() {
    return typeof state !== 'undefined' && !!state.user;
  }

  function hasBottomNav() {
    const nav = document.querySelector('#bottomNav');
    return !!nav && !nav.classList.contains('hidden') && !!nav.querySelector('.bottom-nav-button');
  }

  function hasOpenDialog() {
    return !!document.querySelector('dialog[open]');
  }

  function syncFab() {
    const button = document.querySelector(fabSelector);
    if (!button) return;
    const duplicateButtons = [...document.querySelectorAll('.floating-incident-button')]
      .filter((item) => item !== button);
    duplicateButtons.forEach((item) => item.classList.add('hidden'));

    button.classList.add('issue497-consistent-fab');
    button.setAttribute('aria-label', 'Meld hendelse');
    const canShow = hasUser() && hasBottomNav() && !hasOpenDialog();
    button.classList.toggle('hidden', !canShow);
  }

  function patchRenderShell() {
    if (typeof renderShell !== 'function' || renderShell.issue497Patched) return;
    const current = renderShell;
    renderShell = function issue497RenderShell(...args) {
      const result = current.apply(this, args);
      syncFab();
      return result;
    };
    renderShell.issue497Patched = true;
  }

  function patchRenderFloatingIncidentButton() {
    if (typeof renderFloatingIncidentButton !== 'function' || renderFloatingIncidentButton.issue497Patched) return;
    const current = renderFloatingIncidentButton;
    renderFloatingIncidentButton = function issue497RenderFloatingIncidentButton(...args) {
      const result = current.apply(this, args);
      syncFab();
      return result;
    };
    renderFloatingIncidentButton.issue497Patched = true;
  }

  let scheduled = false;
  function scheduleSync() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      patchRenderShell();
      patchRenderFloatingIncidentButton();
      syncFab();
    });
  }

  document.addEventListener('click', (event) => {
    if (event.target.closest('.bottom-nav-button')) scheduleSync();
  }, true);
  document.addEventListener('close', scheduleSync, true);

  const observer = new MutationObserver(scheduleSync);
  observer.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'data-issue425-active-tab'] });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', scheduleSync, { once: true });
  } else {
    scheduleSync();
  }

  window.arrangementsvaktIssue497 = { version: issue497Version, syncFab };
})();
