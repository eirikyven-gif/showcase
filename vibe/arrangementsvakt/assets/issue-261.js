(() => {
  const issue261Version = 'v0.9.10-admin-details-forms-2026-06-08';
  const managedControlAttr = 'data-issue-261-managed-disabled';
  const boundAttr = 'data-issue-261-bound';

  function detailsSummary(details) {
    return [...details.children].find((child) => child.tagName === 'SUMMARY') || null;
  }

  function detailsContent(details, summary) {
    return [...details.children].filter((child) => child !== summary);
  }

  function ensureStateBadge(summary) {
    let badge = summary.querySelector('.admin-create-state');
    if (!badge) {
      badge = document.createElement('span');
      badge.className = 'admin-create-state';
      summary.append(badge);
    }
    return badge;
  }

  function controlElements(details) {
    return [...details.querySelectorAll('input, select, textarea, button')];
  }

  function setContentAvailability(details, isOpen) {
    const summary = detailsSummary(details);
    if (!summary) return;

    details.dataset.state = isOpen ? 'open' : 'closed';
    summary.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    ensureStateBadge(summary).textContent = isOpen ? 'Skjema klart' : 'Lukket';

    detailsContent(details, summary).forEach((element) => {
      element.inert = !isOpen;
      element.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
    });

    controlElements(details).forEach((control) => {
      if (summary.contains(control)) return;
      if (isOpen) {
        if (control.hasAttribute(managedControlAttr)) {
          control.disabled = false;
          control.removeAttribute(managedControlAttr);
        }
        return;
      }
      if (!control.disabled) {
        control.setAttribute(managedControlAttr, 'true');
        control.disabled = true;
      }
    });
  }

  function syncAdminDetailsState(details) {
    setContentAvailability(details, details.open === true);
  }

  function closeDetailsAfterSuccessfulReset(details) {
    window.setTimeout(() => {
      if (!details.isConnected || !details.open) return;
      details.open = false;
      syncAdminDetailsState(details);
    }, 0);
  }

  function bindAdminDetails(details) {
    if (details.getAttribute(boundAttr) === 'true') {
      syncAdminDetailsState(details);
      return;
    }

    details.setAttribute(boundAttr, 'true');
    details.addEventListener('toggle', () => syncAdminDetailsState(details));
    details.querySelectorAll('form').forEach((form) => {
      form.addEventListener('submit', (event) => {
        if (details.open) return;
        event.preventDefault();
        details.open = true;
        syncAdminDetailsState(details);
        detailsSummary(details)?.focus();
      }, true);
      form.addEventListener('reset', () => closeDetailsAfterSuccessfulReset(details));
    });
    syncAdminDetailsState(details);
  }

  function syncAdminCreateDetails() {
    document.querySelectorAll('.admin-create-details').forEach(bindAdminDetails);
  }

  if (typeof renderShell === 'function') {
    const issue261RenderShellBase = renderShell;
    renderShell = function patchedIssue261RenderShell() {
      issue261RenderShellBase();
      syncAdminCreateDetails();
    };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', syncAdminCreateDetails, { once: true });
  } else {
    syncAdminCreateDetails();
  }

  window.arrangementsvaktIssue261 = {
    version: issue261Version,
    syncAdminCreateDetails,
    syncAdminDetailsState,
  };
})();
