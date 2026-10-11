(() => {
  const root = window.Ukelonn?.root || '../../';
  const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[char]));
  const formatMoney = ore => (Number(ore || 0) / 100).toFixed(2).replace('.', ',') + ' kr';
  const formatTimestamp = value => {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? String(value || '') : new Intl.DateTimeFormat('nb-NO', {
      timeZone: 'Europe/Oslo', dateStyle: 'short', timeStyle: 'short',
    }).format(date);
  };

  fetch(root + 'api/admin/registrations.php', { credentials: 'same-origin' })
    .then(async response => {
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || 'Kunne ikke hente registreringer.');
      return payload;
    })
    .then(payload => {
      const target = document.querySelector('[data-admin-registrations]');
      if (!target) return;
      const items = payload.registrations || [];
      if (!items.length) {
        target.innerHTML = '<p class="empty-state">Ingen aktive registreringer.</p>';
        return;
      }

      target.innerHTML = '<div class="table-wrap"><table class="admin-registration-table"><caption class="sr-only">Gjøremålsregistreringer</caption><thead><tr><th scope="col">Gjøremål</th><th scope="col">Bruker</th><th scope="col">Beløp</th><th scope="col">Registrert</th><th scope="col">Dokumentasjon</th></tr></thead><tbody>' + items.map(item => {
        const attachments = (item.attachments || []).filter(id => typeof id === 'string');
        const attachmentLinks = attachments.length ? attachments.map((_, index) => '<a href="' + root + 'assets/synthetic-attachment.svg" target="_blank" rel="noopener" aria-label="Åpne syntetisk bildevedlegg ' + (index + 1) + '">Syntetisk bilde ' + (index + 1) + '</a>').join(', ') : 'Ingen bilder';
        return '<tr><th scope="row">' + escapeHtml(item.task_name || '') + '</th><td>' + escapeHtml(item.user_name || '') + '</td><td>' + escapeHtml(formatMoney(item.payment_ore)) + '</td><td>' + escapeHtml(formatTimestamp(item.submitted_at)) + '</td><td>' + attachmentLinks + '</td></tr>';
      }).join('') + '</tbody></table></div>';
    })
    .catch(error => {
      const target = document.querySelector('[data-admin-registrations]');
      if (target) target.innerHTML = '<p class="form-message" role="alert">' + escapeHtml(error.message) + '</p>';
    });
})();
