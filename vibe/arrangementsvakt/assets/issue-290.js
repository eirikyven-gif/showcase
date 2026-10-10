(() => {
  const issue290Version = 'v0.12.3-issue-290-team-user-readonly-2026-06-10';

  function issue290CanUseAdminUserEditSurface() {
    return state?.activeTab === 'admin'
      && typeof isPrimaryLeader === 'function'
      && isPrimaryLeader(state.user);
  }

  if (typeof canEditUser === 'function') {
    const issue290BaseCanEditUser = canEditUser;
    canEditUser = function issue290CanEditUser(user) {
      return issue290CanUseAdminUserEditSurface() && issue290BaseCanEditUser(user);
    };
  }

  function issue290RemoveTeamUserEditActions() {
    if (state?.detailModal?.type !== 'user' || issue290CanUseAdminUserEditSurface()) return;
    const body = $('#detailDialogBody');
    if (!body) return;

    $$('.user-edit-form', body).forEach((form) => {
      const heading = form.previousElementSibling;
      if (heading?.tagName === 'H3' && heading.textContent.trim() === 'Rediger bruker') {
        heading.remove();
      }
      form.remove();
    });

    $$('button', body).forEach((button) => {
      if (button.textContent.trim() === 'Regenerer PIN') {
        button.remove();
      }
    });
  }

  if (typeof renderDetailModal === 'function') {
    const issue290BaseRenderDetailModal = renderDetailModal;
    renderDetailModal = function issue290RenderDetailModal() {
      issue290BaseRenderDetailModal();
      issue290RemoveTeamUserEditActions();
    };
  }

  window.arrangementsvaktIssue290 = {
    version: issue290Version,
    canUseAdminUserEditSurface: issue290CanUseAdminUserEditSurface,
    removeTeamUserEditActions: issue290RemoveTeamUserEditActions,
  };
})();
