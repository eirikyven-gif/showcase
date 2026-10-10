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
