document.getElementById('demo-reset').addEventListener('click', function () {
  if (!window.confirm('Slett alle lokale demoendringer og last inn eksempeldata på nytt?')) return;
  try {
    localStorage.removeItem('HUL_MOCK_DB_v1');
    ['hul:', 'hul_'].forEach(function (prefix) {
      for (var i = localStorage.length - 1; i >= 0; i--) {
        var key = localStorage.key(i);
        if (key && key.indexOf(prefix) === 0) localStorage.removeItem(key);
      }
      for (var j = sessionStorage.length - 1; j >= 0; j--) {
        var sessionKey = sessionStorage.key(j);
        if (sessionKey && sessionKey.indexOf(prefix) === 0) sessionStorage.removeItem(sessionKey);
      }
    });
  } catch (_error) { /* Private browsing may disable storage. */ }
  window.location.reload();
});

// The source frontend's dynamically rendered cart quantity fields have no
// associated label. Add a contextual accessible name without changing its
// pinned source bundle or changing the cart interaction.
(function labelOrderQuantityFields() {
  function applyLabels(root) {
    var fields = root.querySelectorAll ? root.querySelectorAll('[data-order-line-qty]:not([aria-label])') : [];
    fields.forEach(function (field) {
      var row = field.closest('li');
      var name = row && row.querySelector('p') ? row.querySelector('p').textContent.trim() : '';
      field.setAttribute('aria-label', 'Antall for ' + (name || 'bestillingsvare'));
    });
  }
  applyLabels(document);
  new MutationObserver(function (records) {
    records.forEach(function (record) {
      record.addedNodes.forEach(function (node) {
        if (node.nodeType === 1) applyLabels(node);
      });
    });
  }).observe(document.body, { childList: true, subtree: true });
})();
