(() => {
  const issue494Version = 'v0.16.20-issue-509-qa-restpoints-2026-06-30';
  const SVG_NS = 'http://www.w3.org/2000/svg';

  const iconPaths = {
    admin: ['M12 3l7 3v5c0 4.7-3 8.7-7 10-4-1.3-7-5.3-7-10V6l7-3z', 'M9 12l2 2 4-4'],
    alertTriangle: ['M12 3l10 18H2L12 3z', 'M12 9v5', 'M12 17h.01'],
    arrowLeft: ['M19 12H5', 'M12 19l-7-7 7-7'],
    bell: ['M18 8a6 6 0 0 0-12 0c0 7-3 8-3 8h18s-3-1-3-8', 'M10 20a2 2 0 0 0 4 0'],
    calendar: ['M8 3v4', 'M16 3v4', 'M4 9h16', 'M5 5h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z'],
    checkCircle: ['M22 11.1V12a10 10 0 1 1-5.9-9.1', 'M22 4 12 14.01l-3-3'],
    clipboard: ['M9 5h6', 'M9 3h6v4H9z', 'M8 5H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2'],
    download: ['M12 3v12', 'M7 10l5 5 5-5', 'M5 21h14'],
    home: ['M3 11.5 12 4l9 7.5', 'M5 10.5V20h14v-9.5', 'M9 20v-6h6v6'],
    logout: ['M10 17l5-5-5-5', 'M15 12H3', 'M21 4v16a2 2 0 0 1-2 2h-7'],
    messageCircle: ['M21 11.5a8.5 8.5 0 0 1-12.6 7.4L3 21l2.1-5.2A8.5 8.5 0 1 1 21 11.5z'],
    mail: ['M4 6h16v12H4z', 'M4 7l8 6 8-6'],
    plus: ['M12 5v14', 'M5 12h14'],
    refresh: ['M21 12a9 9 0 0 1-15.4 6.4L3 16', 'M3 21v-5h5', 'M3 12a9 9 0 0 1 15.4-6.4L21 8', 'M21 3v5h-5'],
    search: ['M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16z', 'M21 21l-4.35-4.35'],
    send: ['M22 2 11 13', 'M22 2l-7 20-4-9-9-4 20-7z'],
    settings: ['M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z', 'M19.4 15a1.8 1.8 0 0 0 .36 2l.05.05a2 2 0 1 1-2.83 2.83l-.05-.05a1.8 1.8 0 0 0-2-.36 1.8 1.8 0 0 0-1.1 1.65V21a2 2 0 1 1-4 0v-.08a1.8 1.8 0 0 0-1.1-1.65 1.8 1.8 0 0 0-2 .36l-.05.05a2 2 0 1 1-2.83-2.83l.05-.05a1.8 1.8 0 0 0 .36-2 1.8 1.8 0 0 0-1.65-1.1H3a2 2 0 1 1 0-4h.08a1.8 1.8 0 0 0 1.65-1.1 1.8 1.8 0 0 0-.36-2l-.05-.05a2 2 0 1 1 2.83-2.83l.05.05a1.8 1.8 0 0 0 2 .36 1.8 1.8 0 0 0 1.1-1.65V3a2 2 0 1 1 4 0v.08a1.8 1.8 0 0 0 1.1 1.65 1.8 1.8 0 0 0 2-.36l.05-.05a2 2 0 1 1 2.83 2.83l-.05.05a1.8 1.8 0 0 0-.36 2 1.8 1.8 0 0 0 1.65 1.1H21a2 2 0 1 1 0 4h-.08A1.8 1.8 0 0 0 19.4 15z'],
    upload: ['M12 21V9', 'M7 14l5-5 5 5', 'M5 3h14'],
    users: ['M16 21v-2a4 4 0 0 0-8 0v2', 'M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z', 'M22 21v-2a4 4 0 0 0-3-3.87', 'M2 21v-2a4 4 0 0 1 3-3.87'],
    wifiOff: ['M2 2l20 20', 'M8.5 16.5a5 5 0 0 1 7 0', 'M5 13a10 10 0 0 1 5.2-2.7', 'M14.5 10.3A10 10 0 0 1 19 13', 'M2 8.8a15 15 0 0 1 5.5-3.1', 'M16.5 5.7A15 15 0 0 1 22 8.8', 'M12 20h.01'],
  };

  const tabIcons = {
    admin: 'settings',
    chat: 'messageCircle',
    incidents: 'alertTriangle',
    members: 'users',
    offline: 'wifiOff',
    overview: 'home',
    teams: 'users',
  };

  const tabIconAliases = {
    admin: 'settings',
    chat: 'messageCircle',
    group: 'users',
    groups: 'users',
    home: 'home',
    incident: 'alertTriangle',
    incidents: 'alertTriangle',
    member: 'users',
    members: 'users',
    message: 'messageCircle',
    messages: 'messageCircle',
    offline: 'wifiOff',
    overview: 'home',
    team: 'users',
    teams: 'users',
  };

  const messageKind = {
    broadcast: { label: 'Varsel', icon: 'bell' },
    direct: { label: 'Direkte melding', icon: 'mail' },
    team: { label: 'Varsel', icon: 'bell' },
    teamchat: { label: 'Chat', icon: 'messageCircle' },
    thread: { label: 'Hendelse', icon: 'alertTriangle' },
  };

  const adminHeadings = {
    adminEventTitle: 'calendar',
    adminTeamTitle: 'users',
    adminUserTitle: 'users',
    adminImportTitle: 'upload',
    adminPushTitle: 'bell',
    adminExportTitle: 'download',
  };

  function text(value) {
    return String(value ?? '').trim();
  }

  function createIcon(name, className = 'issue494-icon') {
    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    svg.classList.add(className);
    (iconPaths[name] || iconPaths.clipboard).forEach((pathData) => {
      const path = document.createElementNS(SVG_NS, 'path');
      path.setAttribute('d', pathData);
      svg.append(path);
    });
    return svg;
  }

  function iconLabel(iconName, label, className = 'issue494-icon-label') {
    const wrap = document.createElement('span');
    wrap.className = className;
    const labelText = document.createElement('span');
    labelText.textContent = label;
    wrap.append(createIcon(iconName), labelText);
    return wrap;
  }

  function setIconOnlyLabel(element, iconName, label, options = {}) {
    if (!element || element.dataset.issue494Label === label && element.dataset.issue494Icon === iconName) return;
    const preserved = options.preserve ? options.preserve(element) : [];
    element.replaceChildren(iconLabel(iconName, label), ...preserved);
    element.dataset.issue494Label = label;
    element.dataset.issue494Icon = iconName;
  }

  function decorateBottomNav() {
    document.querySelectorAll('.bottom-nav-button').forEach((button) => {
      const tabId = button.dataset.tabId || '';
      const dataIcon = button.dataset.icon || '';
      const currentLabel = button.querySelector('.app-shell-nav-label, .nav-label, .issue494-nav-label')?.textContent;
      const label = text(currentLabel || button.getAttribute('aria-label') || button.textContent).replace(/\s+\(\d+\)$/, '') || 'Fane';
      const normalizedLabel = label.toLocaleLowerCase('nb-NO');
      const icon = tabIcons[tabId]
        || tabIconAliases[dataIcon]
        || (/admin/.test(normalizedLabel) ? 'settings' : '')
        || (/melding|chat/.test(normalizedLabel) ? 'messageCircle' : '')
        || (/hendelse/.test(normalizedLabel) ? 'alertTriangle' : '')
        || (/gruppe|team|medl/.test(normalizedLabel) ? 'users' : '')
        || (/ikke sendt|offline/.test(normalizedLabel) ? 'wifiOff' : '')
        || (/oversikt|hjem/.test(normalizedLabel) ? 'home' : '')
        || 'home';
      const badges = [...button.querySelectorAll('.app-shell-nav-badge, .nav-unread-badge')];
      if (button.dataset.issue494Label === label && button.dataset.issue494Icon === icon) return;
      const labelEl = document.createElement('span');
      labelEl.className = 'issue494-nav-label';
      labelEl.textContent = label;
      button.replaceChildren(createIcon(icon, 'issue494-nav-icon'), labelEl, ...badges);
      button.removeAttribute('data-icon');
      button.dataset.issue494Label = label;
      button.dataset.issue494Icon = icon;
    });
  }

  function decorateSearchField(label) {
    if (!label || label.dataset.issue494Search === 'true') return;
    label.classList.add('issue494-search-field');
    const input = label.querySelector('input[type="search"]');
    if (!input) return;
    const icon = createIcon('search', 'issue494-search-icon');
    label.insertBefore(icon, input);
    label.dataset.issue494Search = 'true';
  }

  function decorateSearch() {
    document.querySelectorAll('.issue437-shell-search, .issue427-search, .member-search').forEach(decorateSearchField);
  }

  function decorateGlobalSearchPlaceholder() {
    document.querySelectorAll('.issue437-shell-search-input').forEach((input) => {
      if (input.getAttribute('placeholder') !== 'Søk') input.setAttribute('placeholder', 'Søk');
      if (!input.getAttribute('aria-label')) input.setAttribute('aria-label', 'Søk team, melding eller hendelse');
    });
  }

  function decorateSimpleButton(selector, iconName, fallbackLabel, preserveSelector = null) {
    document.querySelectorAll(selector).forEach((button) => {
      const label = text(button.textContent || button.getAttribute('aria-label') || fallbackLabel) || fallbackLabel;
      const preserve = preserveSelector
        ? (element) => [...element.querySelectorAll(preserveSelector)]
        : () => [];
      setIconOnlyLabel(button, iconName, label, { preserve });
      if (!button.getAttribute('aria-label')) button.setAttribute('aria-label', label);
    });
  }

  function decorateActions() {
    decorateSimpleButton('#logoutButton:not(.hidden), .issue437-shell-logout', 'logout', 'Logg ut');
    decorateSimpleButton('#adminShortcutButton', 'admin', 'Gå til admin');
    document.querySelectorAll('.issue437-shell-action-admin').forEach((button) => {
      setIconOnlyLabel(button, 'admin', 'Admin');
      button.setAttribute('aria-label', 'Åpne admin');
    });
    decorateSimpleButton('#refreshMessagesButton', 'refresh', 'Oppdater');
    decorateSimpleButton('.issue427-input-row button[type="submit"]', 'send', 'Send');
  }

  function decorateFab() {
    const button = document.querySelector('#openIncidentModalButton');
    if (!button) return;
    setIconOnlyLabel(button, 'plus', 'Meld');
    button.setAttribute('aria-label', 'Meld hendelse');
  }

  function decorateBackButton() {
    document.querySelectorAll('.issue427-back').forEach((button) => {
      setIconOnlyLabel(button, 'arrowLeft', 'Tilbake');
      button.setAttribute('aria-label', 'Tilbake til samtaleliste');
    });
  }

  function setMarkerIcon(marker, iconName) {
    if (!marker || marker.dataset.issue494Icon === iconName) return;
    marker.replaceChildren(createIcon(iconName, 'issue494-card-icon'));
    marker.dataset.issue494Icon = iconName;
  }

  function overviewMessageIcon(row) {
    const title = text(row.querySelector('.issue438-row-top strong')?.textContent).toLocaleLowerCase('nb-NO');
    if (/direkte/.test(title)) return 'mail';
    if (/varsel|felles/.test(title)) return 'bell';
    if (/hendelse/.test(title)) return 'alertTriangle';
    if (/chat/.test(title)) return 'messageCircle';
    return 'messageCircle';
  }

  function decorateSemanticCardMarkers() {
    document.querySelectorAll('.issue438-row').forEach((row) => {
      const marker = row.querySelector('.issue438-row-icon');
      const kind = row.dataset.kind || '';
      if (kind === 'incident') setMarkerIcon(marker, 'alertTriangle');
      if (kind === 'message') setMarkerIcon(marker, overviewMessageIcon(row));
      if (kind === 'offline') setMarkerIcon(marker, 'wifiOff');
    });
    document.querySelectorAll('.issue441-team-row .issue441-team-marker').forEach((marker) => {
      setMarkerIcon(marker, 'users');
    });
  }

  function kindInfo(kind) {
    return messageKind[kind] || { label: 'Melding', icon: 'clipboard' };
  }

  function decorateChip(chip, kind) {
    if (!chip) return;
    const info = kindInfo(kind);
    if (chip.dataset.issue494Label === info.label && chip.dataset.issue494Icon === info.icon) return;
    chip.replaceChildren(iconLabel(info.icon, info.label, 'issue494-chip-label'));
    chip.dataset.issue494Label = info.label;
    chip.dataset.issue494Icon = info.icon;
    chip.setAttribute('aria-label', info.label);
  }

  function selectedConversationKind() {
    return document.querySelector('.issue427-conversation[data-active="true"]')?.dataset.kind || '';
  }

  function decorateMessageKinds() {
    document.querySelectorAll('.issue427-conversation').forEach((conversation) => {
      decorateChip(conversation.querySelector('.issue427-type-chip'), conversation.dataset.kind);
    });
    const selectedKind = selectedConversationKind();
    if (selectedKind) {
      decorateChip(document.querySelector('.issue427-thread-head > .issue427-chip'), selectedKind);
    }
    document.querySelectorAll('.message-row[data-type="controlled"] .row-main strong').forEach((title) => {
      const normalized = text(title.textContent);
      if (/direkte/i.test(normalized) && title.dataset.issue494Label !== 'Direkte melding') {
        title.replaceChildren(iconLabel('mail', 'Direkte melding'));
        title.dataset.issue494Label = 'Direkte melding';
      } else if (/varsel|felles/i.test(normalized) && title.dataset.issue494Label !== 'Varsel') {
        title.replaceChildren(iconLabel('bell', 'Varsel'));
        title.dataset.issue494Label = 'Varsel';
      }
    });
    document.querySelectorAll('.row-chip').forEach((chip) => {
      const label = text(chip.textContent);
      if (/^(Lest|Bekreftet)$/.test(label) && chip.dataset.issue494Label !== label) {
        chip.replaceChildren(iconLabel('checkCircle', label, 'issue494-chip-label'));
        chip.dataset.issue494Label = label;
      }
    });
  }

  function decorateAdmin() {
    Object.entries(adminHeadings).forEach(([id, icon]) => {
      const heading = document.getElementById(id);
      if (!heading || heading.dataset.issue494Icon === icon) return;
      const label = text(heading.textContent);
      heading.replaceChildren(iconLabel(icon, label, 'issue494-heading-label'));
      heading.dataset.issue494Icon = icon;
    });
    const severityHeading = document.querySelector('#severityAdminSection .section-heading h3');
    if (severityHeading && severityHeading.dataset.issue494Icon !== 'alertTriangle') {
      const label = text(severityHeading.textContent || 'Hendelse');
      severityHeading.replaceChildren(iconLabel('alertTriangle', label, 'issue494-heading-label'));
      severityHeading.dataset.issue494Icon = 'alertTriangle';
    }
  }

  function decorateAll() {
    decorateBottomNav();
    decorateSearch();
    decorateGlobalSearchPlaceholder();
    decorateActions();
    decorateFab();
    decorateBackButton();
    decorateSemanticCardMarkers();
    decorateMessageKinds();
    decorateAdmin();
  }

  function patchRenderShell() {
    if (typeof renderShell !== 'function' || renderShell.issue494Patched) return;
    const baseRenderShell = renderShell;
    renderShell = function issue494RenderShell(...args) {
      const result = baseRenderShell.apply(this, args);
      decorateAll();
      return result;
    };
    renderShell.issue494Patched = true;
  }

  function patchRenderMessages() {
    if (typeof renderMessages !== 'function' || renderMessages.issue494Patched) return;
    const baseRenderMessages = renderMessages;
    renderMessages = function issue494RenderMessages(...args) {
      const result = baseRenderMessages.apply(this, args);
      decorateAll();
      return result;
    };
    renderMessages.issue494Patched = true;
  }

  let scheduled = false;
  function scheduleDecorate() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      patchRenderShell();
      patchRenderMessages();
      decorateAll();
    });
  }

  const observer = new MutationObserver(scheduleDecorate);
  observer.observe(document.documentElement, { childList: true, subtree: true });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', scheduleDecorate, { once: true });
  } else {
    scheduleDecorate();
  }

  window.arrangementsvaktIssue494 = { version: issue494Version, decorate: decorateAll };
})();
