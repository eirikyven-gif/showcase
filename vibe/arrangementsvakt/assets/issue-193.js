(function () {
  function rewriteHendelseText(value) {
    if (typeof value !== 'string' || value === '') return value;
    return value
      .replace(/Alvorlighetsgraden/g, 'Hendelse-valget')
      .replace(/alvorlighetsgraden/g, 'Hendelse-valget')
      .replace(/Alvorlighetsgrader/g, 'Hendelse')
      .replace(/alvorlighetsgrader/g, 'Hendelse-valg')
      .replace(/Alvorlighetsgrad/g, 'Hendelse')
      .replace(/alvorlighetsgrad/g, 'Hendelse-valg')
      .replace(/Inaktiv grad/g, 'Inaktivt Hendelse-valg')
      .replace(/Ny grad/g, 'Nytt Hendelse-valg')
      .replace(/\bGrad\b/g, 'Hendelse');
  }

  function setText(element, text) {
    if (element && element.textContent !== text) {
      element.textContent = text;
    }
  }

  function rewriteTextNodes(root) {
    if (!root || typeof document.createTreeWalker !== 'function') return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach((node) => {
      const next = rewriteHendelseText(node.nodeValue);
      if (next !== node.nodeValue) node.nodeValue = next;
    });
  }

  const baseSetStatus = setStatus;
  setStatus = function patchedIssue193SetStatus(message, type = 'info') {
    return baseSetStatus(rewriteHendelseText(message), type);
  };

  const baseEmptyState = emptyState;
  emptyState = function patchedIssue193EmptyState(message) {
    return baseEmptyState(rewriteHendelseText(message));
  };

  const baseRowMetaChip = rowMetaChip;
  rowMetaChip = function patchedIssue193RowMetaChip(text, tone) {
    return baseRowMetaChip(rewriteHendelseText(text), tone);
  };

  const baseMetaChip = metaChip;
  metaChip = function patchedIssue193MetaChip(text, type, tone) {
    return baseMetaChip(rewriteHendelseText(text), type, tone);
  };

  const baseRowButton = rowButton;
  rowButton = function patchedIssue193RowButton(className, label, ariaLabel, onClick) {
    return baseRowButton(className, rewriteHendelseText(label), rewriteHendelseText(ariaLabel), onClick);
  };

  const baseStructuredRow = structuredRow;
  structuredRow = function patchedIssue193StructuredRow(config = {}) {
    const nextConfig = { ...config };
    nextConfig.title = rewriteHendelseText(nextConfig.title);
    nextConfig.eyebrow = rewriteHendelseText(nextConfig.eyebrow);
    nextConfig.foot = rewriteHendelseText(nextConfig.foot);
    nextConfig.ariaLabel = rewriteHendelseText(nextConfig.ariaLabel);
    nextConfig.meta = Array.isArray(nextConfig.meta)
      ? nextConfig.meta.map((item) => ({ ...item, text: rewriteHendelseText(item.text) }))
      : nextConfig.meta;
    return baseStructuredRow(nextConfig);
  };

  const baseIncidentMetaItems = incidentMetaItems;
  incidentMetaItems = function patchedIssue193IncidentMetaItems(incident) {
    return baseIncidentMetaItems(incident).map((item) => ({
      ...item,
      text: rewriteHendelseText(item.text),
    }));
  };

  function syncSeverityAdminTerminology() {
    const section = $('#severityAdminSection');
    if (section) {
      rewriteTextNodes(section);
      setText($('.section-heading .eyebrow', section), '');
      setText($('.section-heading h3', section), 'Hendelse');
      setText($('#newSeverityButton'), 'Nytt Hendelse-valg');

      const formTitle = $('[data-severity-form-title]', section);
      if (formTitle) {
        setText(formTitle, /^rediger/i.test(formTitle.textContent) ? 'Rediger Hendelse-valg' : 'Nytt Hendelse-valg');
      }

      const submit = $('[data-severity-submit]', section);
      if (submit) {
        setText(submit, /^lagre/i.test(submit.textContent) ? 'Lagre Hendelse-valg' : 'Opprett Hendelse-valg');
      }

      setText($('.severity-table-head span:first-child', section), 'Hendelse');
    }

    $$('[name="severity"] option').forEach((option) => {
      const next = rewriteHendelseText(option.textContent);
      if (next !== option.textContent) option.textContent = next;
    });
  }

  let observer = null;
  let scheduled = false;
  function scheduleSync() {
    if (scheduled) return;
    scheduled = true;
    queueMicrotask(() => {
      scheduled = false;
      syncSeverityAdminTerminology();
    });
  }

  function ensureAdminObserver() {
    const admin = $('#adminPanel');
    if (!admin || observer || typeof MutationObserver !== 'function') return;
    observer = new MutationObserver(scheduleSync);
    observer.observe(admin, { childList: true, subtree: true, characterData: true });
  }

  const baseRenderShell = renderShell;
  renderShell = function patchedIssue193RenderShell() {
    baseRenderShell();
    ensureAdminObserver();
    syncSeverityAdminTerminology();
  };

  ensureAdminObserver();
  syncSeverityAdminTerminology();
}());
