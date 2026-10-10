(() => {
  const issue425Version = 'v0.14.3-issue-425-app-shell-ssot-v2-2026-06-23';
  const baseRenderShell = renderShell;

  const iconPaths = {
    home: ['M3 11l9-8 9 8', 'M5 10v10h14V10', 'M9 20v-6h6v6'],
    incident: ['M4 4h16v16H4z', 'M8 8h8', 'M8 12h8', 'M8 16h5'],
    message: ['M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z'],
    team: ['M16 21v-2a4 4 0 0 0-8 0v2', 'M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z', 'M22 21v-2a4 4 0 0 0-3-3.87', 'M2 21v-2a4 4 0 0 1 3-3.87'],
    offline: ['M12 3v18', 'M5 8h14', 'M7 16h10', 'M8 12h8'],
    admin: ['M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z', 'M4 21a8 8 0 0 1 16 0', 'M19 5v4', 'M17 7h4'],
    plus: ['M12 5v14', 'M5 12h14'],
  };

  function createSvgIcon(name, className) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    svg.classList.add(className);
    (iconPaths[name] || iconPaths.home).forEach((pathData) => {
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', pathData);
      svg.append(path);
    });
    return svg;
  }

  function shellTabIcon(tabId) {
    if (tabId === 'overview') return 'home';
    if (tabId === 'incidents') return 'incident';
    if (tabId === 'chat') return 'message';
    if (tabId === 'teams' || tabId === 'members') return 'team';
    if (tabId === 'offline') return 'offline';
    if (tabId === 'admin') return 'admin';
    return 'home';
  }

  function shellTabLabel(tab) {
    if (tab.id === 'overview') return 'Hjem';
    if (tab.id === 'chat') return 'Meldinger';
    if (tab.id === 'members') return 'Medl.';
    return tab.shortLabel || tab.label;
  }

  function shellTabBadge(tabId) {
    if (tabId === 'chat') return state.messageUnreadCount || state.messages.filter((message) => message.read === false).length;
    if (tabId === 'incidents') return typeof priorityIncidentCount === 'function' ? priorityIncidentCount() : 0;
    if (tabId === 'offline') return offlineIncidents().length;
    return 0;
  }

  function currentTabLabel() {
    return roleTabs().find((tab) => tab.id === state.activeTab)?.label || 'Hjem';
  }

  function ensureTopbarShell() {
    const topbar = $('.topbar');
    if (!topbar) return;
    topbar.classList.add('app-shell-topbar');
    const brand = topbar.firstElementChild;
    if (!brand) return;
    brand.classList.add('app-shell-brand');
    let mark = $('.app-shell-mark', brand);
    if (!mark) {
      mark = document.createElement('span');
      mark.className = 'app-shell-mark';
      mark.setAttribute('aria-hidden', 'true');
      mark.textContent = 'A';
      brand.prepend(mark);
    }
    let titleWrap = $('.app-shell-title', brand);
    const heading = $('h1', brand);
    if (!titleWrap && heading) {
      titleWrap = document.createElement('div');
      titleWrap.className = 'app-shell-title';
      heading.replaceWith(titleWrap);
      titleWrap.append(heading);
    }
    let context = $('#appShellContext', brand);
    if (!context && titleWrap) {
      context = document.createElement('p');
      context.id = 'appShellContext';
      context.className = 'app-shell-context';
      titleWrap.append(context);
    }
  }

  function syncTopbarShell() {
    ensureTopbarShell();
    const context = $('#appShellContext');
    if (!context) return;
    if (!state.user) {
      context.textContent = 'Operativ app';
      return;
    }
    context.textContent = [currentTabLabel(), displayRoleLabel(state.user), activeEventName()].filter(Boolean).join(' · ');
  }

  function syncFabShell() {
    const button = $('#openIncidentModalButton');
    if (!button) return;
    button.classList.add('app-shell-fab');
    if (button.dataset.issue425Fab === 'true') return;
    const label = document.createElement('span');
    label.textContent = 'Meld';
    button.replaceChildren(createSvgIcon('plus', 'app-shell-fab-icon'), label);
    button.dataset.issue425Fab = 'true';
  }

  function syncShellAttributes() {
    document.body?.toggleAttribute('data-issue425-shell', !!state.user);
    document.body?.setAttribute('data-issue425-active-tab', state.activeTab || '');
    $('#appView')?.setAttribute('data-app-shell', 'issue-425');
  }

  renderBottomNav = function issue425RenderBottomNav() {
    const nav = $('#bottomNav');
    if (!nav) return;
    const tabs = roleTabs();
    nav.classList.add('app-shell-bottom-nav');
    nav.replaceChildren(...tabs.map((tab) => {
      const button = document.createElement('button');
      const labelText = shellTabLabel(tab);
      const badge = shellTabBadge(tab.id);
      button.type = 'button';
      button.className = 'bottom-nav-button app-shell-nav-item';
      button.dataset.tabId = tab.id;
      button.dataset.icon = shellTabIcon(tab.id);
      button.setAttribute('aria-label', tab.label);
      button.setAttribute('aria-current', tab.id === state.activeTab ? 'page' : 'false');
      const label = document.createElement('span');
      label.className = 'app-shell-nav-label';
      label.textContent = labelText;
      button.append(createSvgIcon(shellTabIcon(tab.id), 'app-shell-nav-icon'), label);
      if (badge > 0) {
        const badgeEl = document.createElement('span');
        badgeEl.className = 'app-shell-nav-badge';
        badgeEl.textContent = badge > 9 ? '9+' : String(badge);
        button.append(badgeEl);
      }
      button.addEventListener('click', () => {
        state.activeTab = tab.id;
        renderShell();
      });
      return button;
    }));
  };

  renderShell = function issue425RenderShell() {
    baseRenderShell();
    syncShellAttributes();
    syncTopbarShell();
    syncFabShell();
    renderBottomNav();
  };

  syncTopbarShell();
  syncFabShell();
  if (state.user) {
    syncShellAttributes();
    syncTopbarShell();
    syncFabShell();
    renderBottomNav();
    renderFloatingIncidentButton();
  }
  window.arrangementsvaktIssue425 = { version: issue425Version };
})();

(() => {
  const issue426Version = 'v0.14.4-issue-426-home-inbox-feed-2026-06-23';

  function loadIssue426HomeFeed() {
    const cssHref = `assets/issue-426-home-inbox-feed.css?v=${encodeURIComponent(issue426Version)}`;
    if (!document.querySelector('link[data-issue426-home-feed="style"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = cssHref;
      link.dataset.issue426HomeFeed = 'style';
      document.head.append(link);
    }

    if (document.querySelector('script[data-issue426-home-feed="script"]')) return;
    const script = document.createElement('script');
    script.src = `assets/issue-426-home-inbox-feed.js?v=${encodeURIComponent(issue426Version)}`;
    script.defer = true;
    script.dataset.issue426HomeFeed = 'script';
    document.head.append(script);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadIssue426HomeFeed, { once: true });
  } else {
    loadIssue426HomeFeed();
  }
})();

(() => {
  const issue427Version = 'v0.14.5-issue-427-messages-chat-thread-2026-06-23';

  function loadIssue427Messages() {
    const cssHref = `assets/issue-427-messages-chat-thread.css?v=${encodeURIComponent(issue427Version)}`;
    if (!document.querySelector('link[data-issue427-messages="style"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = cssHref;
      link.dataset.issue427Messages = 'style';
      document.head.append(link);
    }

    if (document.querySelector('script[data-issue427-messages="script"]')) return;
    const script = document.createElement('script');
    script.src = `assets/issue-427-messages-chat-thread.js?v=${encodeURIComponent(issue427Version)}`;
    script.defer = true;
    script.dataset.issue427Messages = 'script';
    document.head.append(script);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadIssue427Messages, { once: true });
  } else {
    loadIssue427Messages();
  }
})();

(() => {
  const issue428Version = 'v0.14.6-issue-428-incidents-inbox-list-2026-06-23';

  function loadIssue428Incidents() {
    const cssHref = `assets/issue-428-incidents-inbox-list.css?v=${encodeURIComponent(issue428Version)}`;
    if (!document.querySelector('link[data-issue428-incidents="style"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = cssHref;
      link.dataset.issue428Incidents = 'style';
      document.head.append(link);
    }

    if (document.querySelector('script[data-issue428-incidents="script"]')) return;
    const script = document.createElement('script');
    script.src = `assets/issue-428-incidents-inbox-list.js?v=${encodeURIComponent(issue428Version)}`;
    script.defer = true;
    script.dataset.issue428Incidents = 'script';
    document.head.append(script);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadIssue428Incidents, { once: true });
  } else {
    loadIssue428Incidents();
  }
})();

(() => {
  const issue429Version = 'v0.14.7-issue-429-compact-secondary-surfaces-2026-06-23';

  function loadIssue429SecondarySurfaces() {
    const cssHref = `assets/issue-429-compact-secondary-surfaces.css?v=${encodeURIComponent(issue429Version)}`;
    if (!document.querySelector('link[data-issue429-secondary-surfaces="style"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = cssHref;
      link.dataset.issue429SecondarySurfaces = 'style';
      document.head.append(link);
    }

    if (document.querySelector('script[data-issue429-secondary-surfaces="script"]')) return;
    const script = document.createElement('script');
    script.src = `assets/issue-429-compact-secondary-surfaces.js?v=${encodeURIComponent(issue429Version)}`;
    script.defer = true;
    script.dataset.issue429SecondarySurfaces = 'script';
    document.head.append(script);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadIssue429SecondarySurfaces, { once: true });
  } else {
    loadIssue429SecondarySurfaces();
  }
})();
