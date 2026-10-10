(function () {
  function currentUserText() {
    if (!state.user) return '';
    const displayName = safeText(state.user.displayName || state.user.fullName).trim() || 'Innlogget bruker';
    const role = (typeof displayRoleLabel === 'function' ? displayRoleLabel(state.user) : ((typeof displayRoleLabel === 'function' ? displayRoleLabel(state.user) : (roleLabels[state.user.role] || state.user.role)) || 'Rolle ukjent'));
    return `${displayName} · ${role}`;
  }

  function syncCurrentUserLabel() {
    const label = $('#currentUserLabel');
    if (!label) return;
    const text = currentUserText();
    label.textContent = text;
    label.title = text;
    label.classList.toggle('hidden', !text);
  }

  function closeOtherAdminDetails(opened) {
    $$('.admin-create-details[open]').forEach((details) => {
      if (details !== opened) details.open = false;
    });
  }

  function openSeverityEditor() {
    const details = $('.severity-create-details');
    if (!details) return;
    details.open = true;
    closeOtherAdminDetails(details);
  }

  function bindAdminDetails() {
    $$('.admin-create-details').forEach((details) => {
      if (details.dataset.issue198Bound === 'true') return;
      details.dataset.issue198Bound = 'true';
      details.addEventListener('toggle', () => {
        if (details.open) closeOtherAdminDetails(details);
      });
    });
  }

  function bindSeverityActions() {
    const list = $('#severityAdminList');
    if (list && list.dataset.issue198Bound !== 'true') {
      list.dataset.issue198Bound = 'true';
      list.addEventListener('click', (event) => {
        if (event.target?.closest('button')) openSeverityEditor();
      }, true);
    }

    const newButton = $('#newSeverityButton');
    if (newButton && newButton.dataset.issue198Bound !== 'true') {
      newButton.dataset.issue198Bound = 'true';
      newButton.addEventListener('click', openSeverityEditor);
    }
  }

  function wrapSeverityForm() {
    const form = $('#severityForm');
    if (!form || form.closest('.admin-create-details')) return;
    const details = document.createElement('details');
    details.className = 'admin-create-details severity-create-details';
    const summary = document.createElement('summary');
    summary.textContent = 'Nytt eller rediger Hendelse-valg';
    form.before(details);
    details.append(summary, form);
  }

  function syncSeverityAdminSection() {
    const section = $('#severityAdminSection');
    const sections = $('#adminPanel .admin-sections');
    if (!section || !sections) return;

    section.classList.add('admin-section');
    section.setAttribute('aria-labelledby', 'adminSeverityTitle');

    const heading = $('.section-heading', section);
    if (heading) heading.classList.add('admin-section-head');
    const eyebrow = $('.eyebrow', section);
    if (eyebrow) eyebrow.textContent = '';
    const title = $('.section-heading h3', section);
    if (title) {
      title.id = 'adminSeverityTitle';
      title.textContent = 'Hendelse';
    }

    wrapSeverityForm();
    bindSeverityActions();
    const exportSection = $('#adminExportTitle')?.closest('.admin-section');
    if (exportSection && section.parentElement !== sections) {
      sections.insertBefore(section, exportSection);
    } else if (exportSection && section.nextElementSibling !== exportSection) {
      sections.insertBefore(section, exportSection);
    } else if (section.parentElement !== sections) {
      sections.append(section);
    }
  }

  function syncAdminLayout() {
    syncSeverityAdminSection();
    bindAdminDetails();
  }

  const issue198RenderShellBase = renderShell;
  renderShell = function patchedIssue198RenderShell() {
    issue198RenderShellBase();
    syncCurrentUserLabel();
    syncAdminLayout();
  };

  syncCurrentUserLabel();
  syncAdminLayout();
}());
