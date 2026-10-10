(() => {
  const issue452Version = 'v0.16.7-issue-465-admin-compact-status-2026-06-27';
  const baseRenderShell = renderShell;
  const compactStatusTabs = new Set(['overview', 'chat', 'incidents', 'teams', 'admin']);

  function pushServerSetupMissing(active) {
    if (active) return false;
    return !!state.push.needsServerKey
      || state.push.hasPublicKey === false
      || state.push.vapidPublicKeyStatus === 'missing'
      || (!state.push.publicKey && state.push.hasPublicKey !== true);
  }

  function pushStatusModel() {
    const active = !!state.push?.enabled;
    if (active) {
      return {
        key: 'on',
        label: 'Varsler på',
        tone: 'ok',
        detail: 'Denne enheten mottar relevante varsler for rollen din.',
      };
    }
    if (!pushApiSupported()) {
      return {
        key: 'unsupported',
        label: 'Varsler støttes ikke',
        tone: 'warning',
        detail: 'Varsler støttes ikke på denne enheten. Følg med i Meldinger og Hendelser.',
      };
    }
    if (Notification.permission === 'denied' || pushServerSetupMissing(active)) {
      return {
        key: 'off',
        label: 'Varsler av',
        tone: 'warning',
        detail: 'Varsler støttes ikke på denne enheten. Følg med i Meldinger og Hendelser.',
      };
    }
    return {
      key: 'off',
      label: 'Varsler av',
      tone: 'warning',
      detail: 'Varsler støttes ikke på denne enheten. Følg med i Meldinger og Hendelser.',
    };
  }

  function ensureStatusDialog() {
    let dialog = $('#issue452StatusDialog');
    if (dialog) return dialog;
    dialog = document.createElement('dialog');
    dialog.id = 'issue452StatusDialog';
    dialog.className = 'issue452-status-dialog';
    dialog.innerHTML = `
      <form method="dialog" class="issue452-status-dialog-card">
        <p class="eyebrow">Status</p>
        <h2 id="issue452StatusDialogTitle"></h2>
        <p id="issue452StatusDialogText"></p>
        <button type="submit" class="secondary">Lukk</button>
      </form>
    `;
    document.body.append(dialog);
    return dialog;
  }

  function openStatusDialog(title, detail) {
    const dialog = ensureStatusDialog();
    $('#issue452StatusDialogTitle', dialog).textContent = title;
    $('#issue452StatusDialogText', dialog).textContent = detail;
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else setStatus(`${title}: ${detail}`);
  }

  function statusChip({ label, tone, detail }) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'issue452-status-chip';
    button.dataset.tone = tone || 'neutral';
    button.textContent = label;
    button.setAttribute('aria-label', `${label}. Vis kort forklaring.`);
    button.title = detail;
    button.addEventListener('click', () => openStatusDialog(label, detail));
    return button;
  }

  function ensureStatusRow(shell) {
    let row = $('.issue452-operative-status-row', shell);
    if (row) return row;
    row = document.createElement('div');
    row.className = 'issue452-operative-status-row';
    row.setAttribute('aria-label', 'Kort status');
    $('.issue437-shell-search', shell)?.after(row);
    return row;
  }

  function syncOperativeStatusChips() {
    const shell = $('#issue437AppShell');
    const activeCompactStatusSurface = !!state.user && compactStatusTabs.has(state.activeTab);
    $('#pushOnboardingPanel')?.classList.toggle('hidden', activeCompactStatusSurface || !state.user);
    $('#testModeBanner')?.classList.toggle('hidden', activeCompactStatusSurface || !state.testMode);
    if (!shell) return;
    const row = ensureStatusRow(shell);
    row.classList.toggle('hidden', !activeCompactStatusSurface);
    if (!activeCompactStatusSurface) {
      row.replaceChildren();
      return;
    }
    const chips = [statusChip(pushStatusModel())];
    if (state.testMode) {
      chips.unshift(statusChip({
        label: 'Testmodus',
        tone: 'warning',
        detail: 'Testmodus er aktiv. Ikke bruk dette som produksjonsdata.',
      }));
    }
    row.replaceChildren(...chips);
  }

  renderShell = function issue452RenderShell() {
    baseRenderShell();
    syncOperativeStatusChips();
  };

  if (state.user) syncOperativeStatusChips();

  window.arrangementsvaktIssue452 = { version: issue452Version };
})();
