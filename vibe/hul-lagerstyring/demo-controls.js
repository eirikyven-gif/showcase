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
    var listName = root.querySelector ? root.querySelector('#list-name-input:not([aria-label])') : null;
    if (listName && !document.querySelector('label[for="list-name-input"]')) {
      listName.setAttribute('aria-label', 'Navn på ny liste');
    }
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

// Preserve the pinned source rendering while repairing its heading outline in
// the attachment subsection of the new-item form.
(function normalizeAttachmentHeadings() {
  function normalize(root) {
    var scope = root && root.querySelectorAll ? root : document;
    scope.querySelectorAll('#inventory-form-attachments-lists h4').forEach(function (heading) {
      var replacement = document.createElement('h3');
      Array.prototype.slice.call(heading.attributes).forEach(function (attribute) {
        replacement.setAttribute(attribute.name, attribute.value);
      });
      replacement.innerHTML = heading.innerHTML;
      heading.replaceWith(replacement);
    });
  }
  normalize(document);
  new MutationObserver(function (records) {
    records.forEach(function (record) {
      record.addedNodes.forEach(function (node) {
        if (node.nodeType === 1) normalize(node);
      });
    });
  }).observe(document.documentElement, { childList: true, subtree: true });
})();

// The source app closes its custom overlays, but did not move or contain
// keyboard focus. Keep keyboard users inside each modal and return focus to
// its opener when the overlay closes.
(function makeModalKeyboardAccessible() {
  var selectors = ['attachment-overlay', 'add-to-list-overlay', 'bestilling-variant-overlay'];
  var modalStates = new Map();
  var focusableSelector = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

  function visibleFocusable(modal) {
    return Array.prototype.filter.call(modal.querySelectorAll(focusableSelector), function (element) {
      return element.getClientRects().length > 0 && element.getAttribute('aria-hidden') !== 'true';
    });
  }

  function updateModal(modal) {
    var open = !modal.classList.contains('hidden');
    var state = modalStates.get(modal);
    if (open && !state) {
      state = { opener: document.activeElement };
      modalStates.set(modal, state);
      var first = visibleFocusable(modal)[0];
      if (first) first.focus();
    } else if (!open && state) {
      modalStates.delete(modal);
      if (state.opener && state.opener.isConnected && typeof state.opener.focus === 'function') state.opener.focus();
    }
  }

  function observe(root) {
    selectors.forEach(function (id) {
      var modal = root.id === id ? root : root.querySelector('#' + id);
      if (!modal || modal.dataset.keyboardA11yObserved) return;
      modal.dataset.keyboardA11yObserved = 'true';
      modalStates.set(modal, null);
      new MutationObserver(function () { updateModal(modal); }).observe(modal, { attributes: true, attributeFilter: ['class'] });
      updateModal(modal);
    });
  }

  observe(document);
  new MutationObserver(function (records) {
    records.forEach(function (record) {
      record.addedNodes.forEach(function (node) {
        if (node.nodeType === 1) observe(node);
      });
    });
  }).observe(document.documentElement, { childList: true, subtree: true });

  document.addEventListener('keydown', function (event) {
    if (event.key !== 'Tab') return;
    var modal = Array.from(modalStates.keys()).find(function (candidate) { return !candidate.classList.contains('hidden'); });
    if (!modal) return;
    var focusable = visibleFocusable(modal);
    if (!focusable.length) {
      event.preventDefault();
      modal.focus();
      return;
    }
    var first = focusable[0];
    var last = focusable[focusable.length - 1];
    if (event.shiftKey && (document.activeElement === first || !modal.contains(document.activeElement))) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && (document.activeElement === last || !modal.contains(document.activeElement))) {
      event.preventDefault();
      first.focus();
    }
  }, true);
})();
