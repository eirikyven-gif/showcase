const APP_BUILD_VERSION = 'v0.8.11-push-diagnose-request-parsing-2026-06-07';
const PUSH_API_ENDPOINT = 'push.php';
const PUSH_DIAGNOSE_LABEL = `api/${PUSH_API_ENDPOINT} (POST action=diagnose, cache-bustet)`;

const state = {
  user: null,
  teams: [],
  users: [],
  events: [],
  settings: { activeEventId: null },
  incidents: [],
  messages: [],
  messageTargets: [],
  messageUnreadCount: 0,
  push: { enabled: false, subscriptionCount: 0, publicKey: '', needsServerKey: true, hasPublicKey: false, vapidPublicKeyStatus: 'missing', diagnostics: [], diagnosticSummary: {} },
  testMode: false,
  testUsers: [],
  activeTab: 'overview',
  lastFocusedElement: null,
  detailModal: { type: null, id: null },
  detailLastFocusedElement: null,
};

const roleLabels = { raceLead: 'Løpsleder', leadership: 'Ledelse', teamLead: 'Teamleder', member: 'Medlem' };
const severityLabels = { info: 'Info', followUp: 'Trenger oppfølging', urgent: 'Haster', critical: 'Kritisk' };
const statusLabels = { new: 'Ny', seen: 'Sett', working: 'Under arbeid', resolved: 'Løst', archived: 'Arkivert' };
const offlineKey = 'vibe.arrangementsvakt.offlineIncidents';
const pushUnsupportedMessage = 'Push støttes ikke i denne nettleseren. Bruk badge og prioritert visning i appen.';
const nonRetryableIncidentErrors = new Set([
  'missing_team',
  'team_not_allowed',
  'invalid_severity',
  'missing_title',
  'escalation_requires_lead',
]);

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

function setStatus(message, type = 'info') {
  const panel = $('#statusPanel');
  panel.textContent = message;
  panel.dataset.type = type;
  panel.classList.toggle('hidden', !message);
}

async function api(path, options = {}) {
  return window.demoApi(path, options);
}



function yesNo(value) {
  return value ? 'ja' : 'nei';
}

function presentMissing(value) {
  return value ? 'finnes' : 'mangler';
}

function pushDiagnosticSummaryRows() {
  const summary = state.push.diagnose || state.push.diagnosticSummary || {};
  const endpoint = summary.api_endpoint || summary.apiEndpoint;
  const method = summary.request_method || summary.requestMethod || summary.api_method || summary.apiMethod || 'POST';
  const action = summary.received_action || summary.receivedAction || summary.api_action || summary.apiAction || 'diagnose';
  const contentType = summary.content_type || summary.contentType || '(mangler i respons)';
  const rows = [
    ['API-endepunkt brukt', endpoint ? `api/${endpoint.replace(/^api\//, '')} (${method} action=${action})` : PUSH_DIAGNOSE_LABEL],
    ['Backendfil/handler', summary.backend_handler || '(mangler i respons)'],
    ['Mottatt action', summary.received_action || summary.receivedAction || '(mangler i respons)'],
    ['Request method', summary.request_method || summary.requestMethod || method || '(mangler i respons)'],
    ['Content-Type', contentType],
    ['Build/deploy-versjon', summary.build || APP_BUILD_VERSION],
    ['PHP __DIR__', summary.php_dir || summary.phpDir || '(mangler i respons)'],
    ['DOCUMENT_ROOT', summary.document_root || summary.documentRoot || '(tom)'],
    ['Konfigfil funnet', yesNo(!!(summary.config_found ?? summary.configFileFound))],
    ['Valgt konfigsti', summary.selected_config_path || summary.selectedConfigPath || 'ingen gyldig fil funnet'],
    ['Returnert VAPID-konfig er array', yesNo(!!(summary.config_returns_array ?? summary.returnsArray ?? summary.configFileIsArray))],
    ['VAPID subject', presentMissing(!!(summary.has_vapid_subject ?? summary.hasVapidSubject))],
    ['VAPID public key', presentMissing(!!(summary.has_vapid_public_key ?? summary.hasPublicKey))],
    ['VAPID private key', presentMissing(!!(summary.has_vapid_private_key ?? summary.hasPrivateKey))],
  ];
  const candidates = Array.isArray(summary.candidates) ? summary.candidates : (Array.isArray(summary.configCandidates) ? summary.configCandidates : []);
  candidates.forEach((candidate, index) => {
    const label = candidate.label || candidate.code || `Kandidat ${index + 1}`;
    const path = candidate.path || candidate.safe_path || '(mangler sti)';
    const fileExists = yesNo(!!(candidate.file_exists ?? candidate.fileExists));
    const isFile = yesNo(!!(candidate.is_file ?? candidate.isFile));
    const isReadable = yesNo(!!(candidate.is_readable ?? candidate.isReadable));
    const requireAttempted = !!(candidate.require_attempted ?? candidate.requireAttempted);
    const returnsArray = requireAttempted ? yesNo(!!(candidate.returns_array ?? candidate.returnsArray)) : 'ikke kjørt';
    rows.push([
      `Kandidatsti ${index + 1}`,
      `${label}: ${path} | file_exists: ${fileExists} | is_file: ${isFile} | is_readable: ${isReadable} | returns_array: ${returnsArray}`,
    ]);
  });
  return rows;
}

function renderPushDiagnosticsPanel() {
  const panel = $('#pushDiagnosticsPanel');
  if (!panel) return;
  const hidden = !state.user;
  panel.classList.toggle('hidden', hidden);
  if (hidden) {
    panel.replaceChildren();
    return;
  }
  const list = document.createElement('dl');
  list.className = 'push-diagnostics-list';
  for (const [label, value] of pushDiagnosticSummaryRows()) {
    const term = document.createElement('dt');
    term.textContent = label;
    const description = document.createElement('dd');
    description.textContent = value;
    list.append(term, description);
  }
  const heading = document.createElement('strong');
  heading.textContent = 'Pushdiagnose';
  const detail = document.createElement('small');
  detail.textContent = 'Private key vises aldri som verdi. Diagnose oppdateres fra serverresponsen.';
  panel.replaceChildren(heading, detail, list);
}

function pushApiSupported() { return false; }

function urlBase64ToUint8Array(value) {
  const padding = '='.repeat((4 - (value.length % 4)) % 4);
  const base64 = (value + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  return Uint8Array.from([...raw].map((char) => char.charCodeAt(0)));
}

function pushPublicKeyDiagnosticText() {
  const hasPublicKey = state.push.hasPublicKey || !!state.push.publicKey || state.push.vapidPublicKeyStatus === 'configured';
  return `VAPID public key: ${hasPublicKey ? 'finnes' : 'mangler'}`;
}

function pushDiagnosticsText() {
  const diagnostics = Array.isArray(state.push.diagnostics) ? state.push.diagnostics : [];
  return diagnostics.map((item) => `${item.ok ? 'OK' : 'Sjekk'}: ${item.message}`).join(' | ');
}

function pushServerKeyMissing() {
  return state.push.needsServerKey || !state.push.publicKey;
}

function pushTestUnavailableReason(supported, active) {
  if (!supported) return pushUnsupportedMessage;
  if (Notification.permission === 'denied') return 'Nettleseren blokkerer varsler. Endre tillatelsen før testvarsel kan vises.';
  if (pushServerKeyMissing()) return 'Kan ikke teste ennå: VAPID public key mangler på server. VAPID-konfigurasjon mangler i driftsmiljøet.';
  if (!active) return 'Aktiver push før testvarsel kan sendes.';
  return '';
}

function pushActivationErrorMessage(error) {
  const name = error?.name || '';
  if (name === 'NotAllowedError') return 'Push ble blokkert av nettleseren. Sjekk nettlesertillatelsen og prøv igjen.';
  if (name === 'InvalidCharacterError' || name === 'DataError') return 'Push kunne ikke aktiveres fordi servernøkkelen ikke er gyldig.';
  if (name === 'NotSupportedError') return pushUnsupportedMessage;
  return 'Push kunne ikke aktiveres. Kjør diagnose og prøv igjen.';
}

function pushRuleText() {
  if (!state.user) return '';
  if (state.user.role === 'member') return 'Medlem: push for relevante meldinger, ikke for alle hendelser.';
  if (state.user.role === 'teamLead') return 'Teamleder: push for egne teamhendelser og relevante meldinger.';
  return 'Ledelse/Leder: push for kritiske eller hevede hendelser og relevante meldinger.';
}

function renderPushStatus() {
  const chip = $('#pushStatusChip');
  const button = $('#pushToggleButton');
  const testButton = $('#pushTestButton');
  const testHint = $('#pushTestHint');
  if (!chip || !button || !testButton || !testHint) return;
  const hidden = !state.user;
  chip.classList.toggle('hidden', hidden);
  button.classList.toggle('hidden', hidden);
  testButton.classList.toggle('hidden', hidden);
  testHint.classList.toggle('hidden', hidden);
  renderPushDiagnosticsPanel();
  if (hidden) return;
  const supported = pushApiSupported();
  const active = !!state.push.enabled;
  const publicKeyDiagnostic = pushPublicKeyDiagnosticText();
  const diagnostics = pushDiagnosticsText();
  const testReason = pushTestUnavailableReason(supported, active);
  chip.textContent = active ? 'Push aktiv' : (supported ? 'Push av' : 'Visuelle varsler');
  chip.dataset.tone = active ? 'ok' : 'warning';
  chip.title = [publicKeyDiagnostic, diagnostics || pushRuleText()].filter(Boolean).join(' | ');
  button.textContent = active ? 'Deaktiver push' : 'Aktiver push';
  button.disabled = !supported || (!active && state.push.needsServerKey);
  button.title = !supported ? pushUnsupportedMessage : (state.push.needsServerKey ? 'VAPID public key må settes på server før nettleser-push kan aktiveres.' : pushRuleText());
  testButton.textContent = 'Send testvarsel til meg';
  testButton.disabled = !!testReason;
  testButton.setAttribute('aria-disabled', testReason ? 'true' : 'false');
  testButton.dataset.state = testReason ? 'unavailable' : 'ready';
  testButton.title = testReason || 'Send et testvarsel til denne enheten og logg det i pushkøen.';
  testHint.textContent = testReason || `${publicKeyDiagnostic}. Klar for testvarsel.`;
  testHint.dataset.tone = testReason ? 'warning' : 'ok';
  renderPushDiagnosticsPanel();
}

async function registerPushWorker() {
  return null; // Push/PWA worker is disabled in the local showcase copy.
}

async function diagnosePushNotifications() {
  const diagnosePath = `${PUSH_API_ENDPOINT}?t=${encodeURIComponent(Date.now())}`;
  const data = await api(diagnosePath, { method: 'POST', body: JSON.stringify({ action: 'diagnose' }) });
  const responseDiagnose = {
    build: data.build,
    backend_handler: data.backend_handler,
    api_endpoint: data.api_endpoint,
    api_method: data.api_method,
    api_action: data.api_action,
    received_action: data.received_action,
    request_method: data.request_method,
    content_type: data.content_type,
    php_dir: data.php_dir,
    document_root: data.document_root,
    candidates: data.candidates,
    selected_config_path: data.selected_config_path,
    config_found: data.config_found,
    config_returns_array: data.config_returns_array,
    has_vapid_subject: data.has_vapid_subject,
    has_vapid_public_key: data.has_vapid_public_key,
    has_vapid_private_key: data.has_vapid_private_key,
    public_key: data.public_key,
    subscription_active: data.subscription_active,
    candidate_count: data.candidate_count,
  };
  state.push = {
    ...state.push,
    ...(data.push || {}),
    publicKey: data.push?.publicKey || data.public_key || state.push.publicKey || '',
    hasPublicKey: data.push?.hasPublicKey ?? !!data.has_vapid_public_key,
    needsServerKey: data.push?.needsServerKey ?? !data.has_vapid_public_key,
    diagnose: responseDiagnose,
    diagnosticSummary: responseDiagnose,
  };
  renderPushStatus();
  return state.push;
}

async function enablePushNotifications() {
  if (!pushApiSupported()) {
    setStatus(pushUnsupportedMessage, 'warning');
    return;
  }
  try {
    await diagnosePushNotifications();
    if (!state.push.publicKey) {
      setStatus('Push mangler VAPID public key på server. VAPID-konfigurasjon mangler i driftsmiljøet, så appen bruker badge og prioritert visning som fallback.', 'warning');
      return;
    }
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      setStatus('Push er ikke aktivert fordi nettleseren ikke ga tillatelse.', 'warning');
      return;
    }
    const registration = await registerPushWorker();
    const existing = await registration.pushManager.getSubscription();
    const subscription = existing || await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(state.push.publicKey),
    });
    const data = await api(PUSH_API_ENDPOINT, { method: 'POST', body: JSON.stringify({ action: 'subscribe', subscription: subscription.toJSON() }) });
    state.push = data.push;
    renderPushStatus();
    setStatus('Pushvarsler er aktivert for rollen din. Bruk Test push for å verifisere enheten.', 'success');
  } catch (error) {
    await diagnosePushNotifications().catch(() => {});
    setStatus(pushActivationErrorMessage(error), 'error');
  }
}

async function disablePushNotifications() {
  let endpoint = '';
  if (pushApiSupported()) {
    const registration = await navigator.serviceWorker.ready.catch(() => null);
    const subscription = await registration?.pushManager.getSubscription();
    endpoint = subscription?.endpoint || '';
    if (subscription) await subscription.unsubscribe();
  }
  const data = await api(PUSH_API_ENDPOINT, { method: 'POST', body: JSON.stringify({ action: 'unsubscribe', endpoint }) });
  state.push = data.push;
  renderPushStatus();
  setStatus('Pushvarsler er deaktivert. Badge og prioritering vises fortsatt i appen.', 'info');
}

async function sendTestPushNotification() {
  const supported = pushApiSupported();
  let reason = pushTestUnavailableReason(supported, !!state.push.enabled);
  if (reason && supported && pushServerKeyMissing()) {
    await diagnosePushNotifications().catch(() => {});
    reason = pushTestUnavailableReason(supported, !!state.push.enabled);
  }
  if (reason) {
    setStatus(reason, supported && pushServerKeyMissing() ? 'warning' : 'info');
    return;
  }
  try {
    const registration = await registerPushWorker();
    const data = await api(PUSH_API_ENDPOINT, { method: 'POST', body: JSON.stringify({ action: 'test' }) });
    state.push = data.push;
    renderPushStatus();
    if (Notification.permission === 'granted') {
      await registration.showNotification('Testvarsel fra Arrangementsvakt', {
        body: 'Push er aktivert for denne brukeren og enheten.',
      });
    }
    setStatus('Testvarsel er sendt og logget i pushkøen.', 'success');
  } catch (error) {
    await diagnosePushNotifications().catch(() => {});
    setStatus('Testvarsel kunne ikke sendes. Sjekk diagnose i pushstatus og prøv igjen.', 'error');
  }
}

async function togglePushNotifications() {
  if (state.push.enabled) await disablePushNotifications();
  else await enablePushNotifications();
}

function formDataObject(form) {
  const data = new FormData(form);
  const result = {};
  for (const [key, value] of data.entries()) {
    if (key === 'teamIds' || key === 'image') continue;
    result[key] = value;
  }
  if ($('[name="teamIds"]', form)) {
    result.teamIds = $$('[name="teamIds"] option:checked', form)
      .map((option) => option.value)
      .filter(Boolean);
  }
  if ($('[type="checkbox"]', form)) {
    $$('[type="checkbox"]', form).forEach((input) => { result[input.name] = input.checked; });
  }
  return result;
}

function safeText(value) {
  return String(value ?? '');
}

function offlineIncidents() {
  try {
    const parsed = JSON.parse(localStorage.getItem(offlineKey) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch (_) {
    return [];
  }
}

function saveOfflineIncidents(incidents) {
  localStorage.setItem(offlineKey, JSON.stringify(incidents));
}

function emptyState(message) {
  const empty = document.createElement('p');
  empty.className = 'empty-state';
  empty.textContent = message;
  return empty;
}

function isQaTeam(team) {
  return /\b(test|qa|demo|prøve|prove)\b/i.test(team.name || '');
}

function sortTeamsForChoice(teams) {
  return [...teams].sort((a, b) => {
    const bucket = Number(isQaTeam(a)) - Number(isQaTeam(b));
    return bucket || safeText(a.name).localeCompare(safeText(b.name), 'nb');
  });
}

function isLeadershipUser(user = state.user) {
  return !!user && (user.role === 'raceLead' || user.role === 'leadership' || user.isLeadership === true);
}

function isPrimaryLeader(user = state.user) {
  return !!user && (user.role === 'raceLead' || user.isPrimaryLeader === true);
}

function displayRoleLabel(user) {
  const labels = [];
  if (isPrimaryLeader(user)) labels.push('Øverste Leder/Løpsleder');
  else if (isLeadershipUser(user)) labels.push('Ledelse');
  if (user?.role === 'teamLead') labels.push('Teamleder');
  if (user?.role === 'member') labels.push('Medlem');
  if (user?.role === 'leadership' && labels.length === 0) labels.push('Ledelse');
  return labels.join(' · ') || roleLabels[user?.role] || user?.role || 'Ukjent rolle';
}

function getAllowedTeams() {
  if (!state.user) return [];
  const activeTeams = state.teams.filter((team) => team.active !== false);
  if (isLeadershipUser()) return sortTeamsForChoice(activeTeams);
  if (state.user.role === 'teamLead') return sortTeamsForChoice(activeTeams);
  return sortTeamsForChoice(activeTeams.filter((team) => (state.user.teamIds || []).includes(team.id)));
}

function fillUserTeamSelects() {
  const allowedTeams = getAllowedTeams();
  $$('select[name="teamIds"]').forEach((select) => {
    if (select.closest('#incidentForm')) return;
    const current = new Set([...select.selectedOptions].map((option) => option.value));
    select.replaceChildren(...allowedTeams.map((team) => {
      const option = document.createElement('option');
      option.value = team.id;
      option.textContent = team.name;
      option.selected = current.has(team.id);
      return option;
    }));
  });
}

function fillIncidentTeamSelect() {
  const form = $('#incidentForm');
  const select = $('[name="teamIds"]', form);
  if (!select) return;
  const allowedTeams = getAllowedTeams();
  const current = new Set([...select.selectedOptions].map((option) => option.value).filter(Boolean));
  select.replaceChildren();
  select.multiple = allowedTeams.length !== 1;
  select.size = allowedTeams.length > 1 ? Math.min(Math.max(allowedTeams.length + 1, 3), 7) : 1;
  select.setAttribute('aria-label', 'Velg gruppe');

  if (!allowedTeams.length) {
    const option = document.createElement('option');
    option.textContent = 'Ingen tilgjengelige grupper';
    option.value = '';
    option.disabled = true;
    select.append(option);
    return;
  }

  if (allowedTeams.length > 1) {
    const placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.textContent = 'Velg gruppe';
    placeholder.disabled = true;
    select.append(placeholder);
  }

  allowedTeams.forEach((team) => {
    const option = document.createElement('option');
    option.value = team.id;
    option.textContent = team.name;
    option.selected = allowedTeams.length === 1 || current.has(team.id);
    select.append(option);
  });
}

function fillTeamSelects() {
  fillUserTeamSelects();
  fillIncidentTeamSelect();
}

function activeEventName() {
  const event = state.events.find((item) => item.id === state.settings.activeEventId);
  return event ? event.name : 'Ingen aktivt arrangement ennå';
}

function roleTabs() {
  if (!state.user) return [];
  if (isLeadershipUser()) {
    return [
      { id: 'overview', label: 'Oversikt' },
      { id: 'incidents', label: 'Hendelser' },
      { id: 'teams', label: 'Grupper' },
      { id: 'chat', label: 'Meldinger' },
      ...(isPrimaryLeader() ? [{ id: 'admin', label: 'Admin' }] : []),
    ];
  }
  if (state.user.role === 'teamLead') {
    return [
      { id: 'overview', label: 'Oversikt' },
      { id: 'incidents', label: 'Hendelser' },
      { id: 'teams', label: 'Mine grupper' },
      { id: 'chat', label: 'Meldinger' },
      { id: 'members', label: 'Medlemmer' },
    ];
  }
  return [
    { id: 'teams', label: 'Mine grupper' },
    { id: 'incidents', label: 'Hendelser' },
    { id: 'chat', label: 'Meldinger' },
    { id: 'offline', label: 'Ikke sendt' },
  ];
}

function normalizeActiveTab() {
  const tabs = roleTabs();
  if (!tabs.some((tab) => tab.id === state.activeTab)) {
    state.activeTab = tabs[0]?.id || 'overview';
  }
}

function tabPanelId(tabId) {
  return tabId === 'members' ? 'teams' : tabId;
}

function priorityIncidentCount() {
  return state.incidents.filter((incident) => incident.escalatedToRaceLead || ['urgent', 'critical'].includes(incident.severity)).length;
}

function renderBottomNav() {
  const nav = $('#bottomNav');
  const tabs = roleTabs();
  nav.replaceChildren(...tabs.map((tab) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'bottom-nav-button';
    const badge = tab.id === 'chat' ? state.messageUnreadCount : (tab.id === 'incidents' ? priorityIncidentCount() : 0);
    button.textContent = badge > 0 ? `${tab.label} (${badge})` : tab.label;
    button.setAttribute('aria-current', tab.id === state.activeTab ? 'page' : 'false');
    button.addEventListener('click', () => {
      state.activeTab = tab.id;
      renderShell();
    });
    return button;
  }));
}

function renderTabPanels() {
  const activePanel = tabPanelId(state.activeTab);
  $$('[data-tab-panel]').forEach((panel) => {
    panel.classList.toggle('hidden', panel.dataset.tabPanel !== activePanel);
  });
}

function openIncidentModal() {
  const dialog = $('#incidentDialog');
  state.lastFocusedElement = document.activeElement;
  $('#openIncidentModalButton').classList.add('hidden');
  fillTeamSelects();
  if (!dialog.open && typeof dialog.showModal === 'function') {
    dialog.showModal();
  } else if (!dialog.open) {
    dialog.setAttribute('open', '');
  }
  $('[name="title"]', dialog).focus();
}

function closeIncidentModal() {
  const dialog = $('#incidentDialog');
  if (dialog.open) dialog.close();
  renderFloatingIncidentButton();
  if (state.lastFocusedElement?.focus) state.lastFocusedElement.focus();
}

function openDetailModal(type, id) {
  const dialog = $('#detailDialog');
  state.detailModal = { type, id };
  state.detailLastFocusedElement = document.activeElement;
  renderDetailModal();
  if (!dialog.open && typeof dialog.showModal === 'function') {
    dialog.showModal();
  } else if (!dialog.open) {
    dialog.setAttribute('open', '');
  }
  $('#closeDetailModalButton').focus();
}

function closeDetailModal() {
  const dialog = $('#detailDialog');
  if (dialog.open) dialog.close();
  state.detailModal = { type: null, id: null };
  if (state.detailLastFocusedElement?.focus) state.detailLastFocusedElement.focus();
}

function rowButton(className, label, ariaLabel, onClick) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = className;
  button.textContent = label;
  button.setAttribute('aria-label', ariaLabel);
  button.addEventListener('click', onClick);
  return button;
}

function rowMetaChip(text, tone) {
  const chip = document.createElement('span');
  chip.className = 'row-chip';
  if (tone) chip.dataset.tone = tone;
  chip.textContent = text;
  return chip;
}

function structuredRow({ className = 'compact-row', title, eyebrow, meta = [], foot, ariaLabel, onClick, markerTone }) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = className;
  if (markerTone) button.dataset.marker = markerTone;
  button.setAttribute('aria-label', ariaLabel);
  button.addEventListener('click', onClick);

  const main = document.createElement('span');
  main.className = 'row-main';
  const titleElement = document.createElement('strong');
  titleElement.textContent = title;
  const eyebrowElement = document.createElement('small');
  eyebrowElement.textContent = eyebrow || '';
  main.replaceChildren(titleElement, eyebrowElement);

  const metaElement = document.createElement('span');
  metaElement.className = 'row-meta';
  metaElement.replaceChildren(...meta.map(({ text, tone }) => rowMetaChip(text, tone)));

  const footElement = document.createElement('small');
  footElement.className = 'row-foot';
  footElement.textContent = foot || '';

  button.replaceChildren(main, metaElement, footElement);
  return button;
}

function metaChip(text, type, tone) {
  const span = document.createElement('span');
  span.dataset.type = type;
  if (tone) span.dataset.tone = tone;
  span.textContent = text;
  return span;
}

function formatDateTime(value) {
  return value ? new Date(value).toLocaleString('no-NO') : 'Ukjent tid';
}

function incidentMetaItems(incident) {
  return [
    { text: severityLabels[incident.severity] || incident.severity, type: 'severity', tone: incident.severity },
    { text: statusLabels[incident.status] || incident.status, type: 'status', tone: incident.status },
    { text: teamNames(incident.teamIds || []), type: 'team' },
    { text: incident.location || 'Uten sted', type: 'location' },
    incident.escalatedToRaceLead ? { text: 'Hevet til Løpsleder', type: 'escalated', tone: 'warning' } : null,
  ].filter(Boolean);
}

function canManageIncident(incident) {
  if (!state.user) return false;
  if (isLeadershipUser()) return true;
  if (state.user.role !== 'teamLead') return false;
  const ledTeamIds = new Set(state.teams
    .filter((team) => (team.leaderIds || []).includes(state.user.id))
    .map((team) => team.id));
  return (incident.teamIds || []).some((teamId) => ledTeamIds.has(teamId));
}

function canEditUser(user) {
  return !!user && isLeadershipUser();
}

function userEditErrorMessage(error) {
  const messages = {
    cannot_deactivate_self: 'Du kan ikke deaktivere din egen bruker.',
    cannot_remove_own_primary_role: 'Du kan ikke fjerne din egen øverste lederrolle.',
    forbidden: 'Du har ikke tilgang til denne handlingen.',
    missing_name: 'Skriv inn navn.',
    primary_leader_already_exists: 'Det finnes allerede en aktiv øverste Leder/Løpsleder.',
    primary_leader_required: 'Minst én aktiv øverste Leder/Løpsleder må finnes.',
    primary_leader_requires_race_lead: 'Øverste leder må ha rollen Øverste Leder/Løpsleder.',
    user_not_found: 'Brukeren finnes ikke lenger.',
  };
  return messages[error?.code || error?.message] || 'Brukeren kunne ikke oppdateres.';
}

function fieldLabel(text, control) {
  const label = document.createElement('label');
  label.append(document.createTextNode(text));
  label.append(control);
  return label;
}

function userEditTeamOptions(user) {
  const selectedIds = new Set(user.teamIds || []);
  return sortTeamsForChoice(state.teams.filter((team) => team.active !== false || selectedIds.has(team.id)));
}

function createUserEditForm(user) {
  const form = document.createElement('form');
  form.className = 'card-form user-edit-form';

  const fullName = document.createElement('input');
  fullName.name = 'fullName';
  fullName.required = true;
  fullName.autocomplete = 'name';
  fullName.value = user.fullName || '';

  const displayName = document.createElement('input');
  displayName.name = 'displayName';
  displayName.autocomplete = 'nickname';
  displayName.value = user.displayName || '';

  const phone = document.createElement('input');
  phone.name = 'phone';
  phone.autocomplete = 'tel';
  phone.inputMode = 'tel';
  phone.value = user.phone || '';

  const role = document.createElement('select');
  role.name = 'role';
  [
    ['member', 'Medlem'],
    ['teamLead', 'Teamleder'],
    ['leadership', 'Ledelse'],
    ['raceLead', 'Øverste Leder/Løpsleder'],
  ].forEach(([value, label]) => {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = label;
    option.selected = user.role === value;
    role.append(option);
  });

  const leadership = document.createElement('input');
  leadership.type = 'checkbox';
  leadership.name = 'isLeadership';
  leadership.checked = user.isLeadership === true;
  const leadershipLabel = document.createElement('label');
  leadershipLabel.className = 'checkbox';
  leadershipLabel.append(leadership, document.createTextNode(' Del av Ledelse'));

  const primaryLeader = document.createElement('input');
  primaryLeader.type = 'checkbox';
  primaryLeader.name = 'isPrimaryLeader';
  primaryLeader.checked = user.isPrimaryLeader === true;
  const primaryLeaderLabel = document.createElement('label');
  primaryLeaderLabel.className = 'checkbox';
  primaryLeaderLabel.append(primaryLeader, document.createTextNode(' Øverste Leder/Løpsleder'));

  const teamIds = document.createElement('select');
  teamIds.name = 'teamIds';
  teamIds.multiple = true;
  teamIds.size = Math.min(Math.max(state.teams.length, 3), 8);
  const selectedTeamIds = new Set(user.teamIds || []);
  userEditTeamOptions(user).forEach((team) => {
    const option = document.createElement('option');
    option.value = team.id;
    option.textContent = team.active === false ? `${team.name} (inaktivt)` : team.name;
    option.selected = selectedTeamIds.has(team.id);
    teamIds.append(option);
  });

  const active = document.createElement('input');
  active.type = 'checkbox';
  active.name = 'active';
  active.checked = user.active !== false;
  if (user.id === state.user?.id) active.disabled = true;
  const activeLabel = document.createElement('label');
  activeLabel.className = 'checkbox';
  activeLabel.append(active, document.createTextNode(' Aktiv bruker'));

  const hint = document.createElement('p');
  hint.className = 'form-hint';
  hint.textContent = 'Deaktivering er standard slettemodell. Hendelser, meldinger og chat beholdes med brukerens historikk.';

  const submit = document.createElement('button');
  submit.type = 'submit';
  submit.textContent = 'Lagre bruker';

  form.replaceChildren(
    fieldLabel('Fullt navn ', fullName),
    fieldLabel('Visningsnavn ', displayName),
    fieldLabel('Telefon ', phone),
    fieldLabel('Rolle ', role),
    leadershipLabel,
    primaryLeaderLabel,
    fieldLabel('Grupper ', teamIds),
    activeLabel,
    hint,
    submit,
  );

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const payload = formDataObject(form);
    if (user.id === state.user?.id) payload.active = true;
    try {
      await api('users.php', { method: 'POST', body: JSON.stringify({ action: 'update', id: user.id, ...payload }) });
      setStatus('Brukeren er oppdatert. Historikk er bevart.');
      await refreshData();
    } catch (error) {
      setStatus(userEditErrorMessage(error), 'error');
    }
  });

  return form;
}

function teamLeaderNames(team) {
  const names = state.users
    .filter((user) => (team.leaderIds || []).includes(user.id))
    .map((user) => user.displayName || user.fullName)
    .filter(Boolean);
  return names.join(', ') || 'Ikke satt';
}

function renderDetailModal() {
  const dialog = $('#detailDialog');
  if (!dialog) return;
  const title = $('#detailDialogTitle');
  const eyebrow = $('#detailDialogEyebrow');
  const body = $('#detailDialogBody');
  body.replaceChildren();

  if (state.detailModal.type === 'incident') {
    const incident = state.incidents.find((item) => item.id === state.detailModal.id);
    if (!incident) {
      title.textContent = 'Hendelse ikke funnet';
      eyebrow.textContent = 'Detaljer';
      body.textContent = 'Hendelsen finnes ikke lenger i aktiv feed.';
      return;
    }
    const canManage = canManageIncident(incident);
    eyebrow.textContent = 'Hendelse';
    title.textContent = incident.title || 'Hendelse uten tittel';
    const detail = document.createElement('div');
    detail.className = 'detail-stack';
    const meta = document.createElement('div');
    meta.className = 'incident-meta';
    meta.replaceChildren(...incidentMetaItems(incident).map(({ text, type, tone }) => metaChip(text, type, tone)), metaChip(formatDateTime(incident.createdAt), 'time'));
    const description = document.createElement('p');
    description.className = 'detail-description';
    description.textContent = incident.description || 'Ingen beskrivelse.';
    const counts = document.createElement('p');
    counts.className = 'detail-counts';
    counts.textContent = `${incident.comments?.length || 0} kommentarer · ${incident.imageRefs?.length || 0} bilder`;

    const history = document.createElement('div');
    history.className = 'detail-history';
    const commentsTitle = document.createElement('h3');
    commentsTitle.textContent = 'Kommentarer';
    const comments = incident.comments?.length ? incident.comments.map((comment) => {
      const item = document.createElement('p');
      item.className = 'detail-comment';
      item.textContent = `${comment.displayName || 'Ukjent'} · ${formatDateTime(comment.createdAt)}: ${comment.comment}`;
      return item;
    }) : [Object.assign(document.createElement('p'), { className: 'message-empty', textContent: 'Ingen kommentarer ennå.' })];
    history.replaceChildren(commentsTitle, ...comments);

    detail.replaceChildren(meta, description, counts);
    if (canManage) {
      const actions = document.createElement('div');
      actions.className = 'incident-actions';
      const select = document.createElement('select');
      select.className = 'status-select';
      select.setAttribute('aria-label', `Endre status for ${incident.title || 'hendelse'}`);
      const statusOptions = isLeadershipUser() ? ['new', 'seen', 'working', 'resolved', 'archived'] : ['new', 'seen', 'working', 'resolved'];
      statusOptions.forEach((status) => {
        const option = document.createElement('option');
        option.value = status;
        option.textContent = statusLabels[status];
        option.selected = incident.status === status;
        select.append(option);
      });
      select.addEventListener('change', (event) => updateIncident(incident.id, { action: 'status', status: event.target.value }));
      actions.append(select);
      actions.append(rowButton('secondary', 'Hev', `Hev ${incident.title || 'hendelse'} til Løpsleder`, () => updateIncident(incident.id, { action: 'escalate' })));

      const commentForm = document.createElement('form');
      commentForm.className = 'comment-form';
      commentForm.innerHTML = '<input name="comment" placeholder="Kommentar" aria-label="Kommentar"><button type="submit">Kommenter</button>';
      commentForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const comment = $('[name="comment"]', event.currentTarget).value;
        await updateIncident(incident.id, { action: 'comment', comment });
        event.currentTarget.reset();
      });

      const uploadForm = document.createElement('form');
      uploadForm.className = 'upload-form';
      uploadForm.innerHTML = '<input name="image" type="file" accept="image/jpeg,image/png,image/webp" aria-label="Bilde"><button type="submit">Last opp bilde</button>';
      uploadForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const fileInput = $('[name="image"]', event.currentTarget);
        if (!fileInput.files.length) return;
        const payload = new FormData();
        payload.append('incidentId', incident.id);
        payload.append('image', fileInput.files[0]);
        await api('upload.php', { method: 'POST', body: payload });
        setStatus('Bilde lastet opp.');
        await refreshData();
      });
      detail.append(actions, commentForm, uploadForm);
    }
    detail.append(history);
    body.append(detail);
    return;
  }

  if (state.detailModal.type === 'team') {
    const team = state.teams.find((item) => item.id === state.detailModal.id);
    if (!team) return;
    eyebrow.textContent = 'Gruppe';
    title.textContent = team.name;
    const members = state.users.filter((user) => user.active !== false && (user.teamIds || []).includes(team.id));
    const teamIncidents = state.incidents.filter((incident) => (incident.teamIds || []).includes(team.id));
    const detail = document.createElement('div');
    detail.className = 'detail-stack';
    const description = document.createElement('p');
    description.className = 'detail-description';
    description.textContent = team.description || 'Ingen beskrivelse.';
    const count = document.createElement('p');
    count.className = 'detail-counts';
    count.textContent = `${members.length} brukere · ${team.active === false ? 'inaktiv' : 'aktiv'}`;
    const leaders = document.createElement('p');
    leaders.className = 'detail-counts';
    leaders.textContent = `Teamleder: ${teamLeaderNames(team)}`;
    const memberTitle = document.createElement('h3');
    memberTitle.textContent = 'Medlemmer';
    const memberList = document.createElement('div');
    memberList.className = 'compact-list';
    if (!members.length) {
      memberList.replaceChildren(emptyState('Ingen brukere er knyttet til denne gruppen ennå.'));
    } else {
      memberList.replaceChildren(...members.map((member) => structuredRow({
        title: member.displayName || member.fullName,
        eyebrow: member.fullName !== (member.displayName || member.fullName) ? member.fullName : 'Bruker',
        meta: [
          { text: displayRoleLabel(member) },
          { text: member.active === false ? 'Inaktiv' : 'Aktiv', tone: member.active === false ? 'archived' : 'ok' },
        ],
        ariaLabel: `Åpne bruker ${member.displayName || member.fullName}`,
        onClick: () => openDetailModal('user', member.id),
        markerTone: member.active === false ? 'archived' : 'info',
      })));
    }
    const incidentTitle = document.createElement('h3');
    incidentTitle.textContent = 'Hendelser';
    const incidentList = document.createElement('div');
    incidentList.className = 'compact-list';
    if (!teamIncidents.length) {
      incidentList.replaceChildren(emptyState('Ingen aktive hendelser for denne gruppen.'));
    } else {
      incidentList.replaceChildren(...teamIncidents.map((incident) => structuredRow({
        title: incident.title || 'Hendelse uten tittel',
        eyebrow: incident.location || 'Uten sted',
        meta: [
          { text: severityLabels[incident.severity] || incident.severity, tone: incident.severity },
          { text: statusLabels[incident.status] || incident.status, tone: incident.status },
        ],
        foot: formatDateTime(incident.createdAt),
        ariaLabel: `Åpne hendelse ${incident.title || 'uten tittel'}`,
        onClick: () => openDetailModal('incident', incident.id),
        markerTone: incident.escalatedToRaceLead ? 'warning' : incident.severity,
      })));
    }
    detail.replaceChildren(description, count, leaders, memberTitle, memberList, incidentTitle, incidentList);
    body.append(detail);
    return;
  }

  if (state.detailModal.type === 'user') {
    const user = state.users.find((item) => item.id === state.detailModal.id);
    if (!user) return;
    eyebrow.textContent = 'Bruker';
    title.textContent = user.displayName || user.fullName;
    const detail = document.createElement('div');
    detail.className = 'detail-stack';
    const meta = document.createElement('div');
    meta.className = 'incident-meta';
    meta.replaceChildren(metaChip(displayRoleLabel(user), 'role'), metaChip(teamNames(user.teamIds || []), 'team'), metaChip(user.active === false ? 'Inaktiv' : 'Aktiv', 'status', user.active === false ? 'archived' : 'resolved'));
    const fullName = document.createElement('p');
    fullName.className = 'detail-description';
    const phone = safeText(user.phone).trim();
    fullName.textContent = `Fullt navn: ${user.fullName}${phone ? ` · Telefon: ${phone}` : ''}`;
    detail.replaceChildren(meta, fullName);
    if (canEditUser(user)) {
      const editTitle = document.createElement('h3');
      editTitle.textContent = 'Rediger bruker';
      detail.append(editTitle, createUserEditForm(user));
    }
    if (isPrimaryLeader() && user.id !== state.user.id) {
      detail.append(rowButton('secondary', 'Regenerer PIN', `Regenerer PIN for ${user.displayName || user.fullName}`, async () => {
        const data = await api('users.php', { method: 'POST', body: JSON.stringify({ action: 'regeneratePin', id: user.id }) });
        setStatus(`Ny PIN for ${user.displayName || user.fullName}: ${data.pin}`);
      }));
    }
    body.append(detail);
    return;
  }

  if (state.detailModal.type === 'message') {
    const message = state.messages.find((item) => item.id === state.detailModal.id);
    if (!message) return;
    eyebrow.textContent = 'Melding';
    title.textContent = messageTypeLabel(message);
    const detail = document.createElement('div');
    detail.className = 'detail-stack';
    const meta = document.createElement('p');
    meta.className = 'message-meta';
    meta.textContent = [message.senderName, formatDateTime(message.createdAt)].filter(Boolean).join(' · ');
    const bodyText = document.createElement('p');
    bodyText.className = 'message-body';
    bodyText.textContent = message.body;
    detail.replaceChildren(meta, bodyText);
    body.append(detail);
  }
}

function renderFloatingIncidentButton() {
  const button = $('#openIncidentModalButton');
  const dialog = $('#incidentDialog');
  const canShow = !!state.user && !dialog.open && !['admin', 'offline', 'chat'].includes(state.activeTab);
  button.classList.toggle('hidden', !canShow);
}

function renderOverviewStats() {
  const stats = $('#overviewStats');
  const criticalCount = state.incidents.filter((incident) => ['critical', 'urgent'].includes(incident.severity)).length;
  const escalatedCount = state.incidents.filter((incident) => incident.escalatedToRaceLead).length;
  const workingCount = state.incidents.filter((incident) => incident.status === 'working').length;
  const offlineCount = offlineIncidents().length;
  const items = [
    { label: 'Haster/kritisk', value: criticalCount, tone: criticalCount ? 'urgent' : 'neutral' },
    { label: 'Hevet', value: escalatedCount, tone: escalatedCount ? 'warning' : 'neutral' },
    { label: 'Under arbeid', value: workingCount, tone: workingCount ? 'working' : 'neutral' },
    { label: 'Ikke sendt', value: offlineCount, tone: offlineCount ? 'warning' : 'neutral' },
  ];
  stats.replaceChildren(...items.map(({ label, value, tone }) => {
    const item = document.createElement('span');
    item.className = 'summary-pill';
    item.dataset.tone = tone;
    item.innerHTML = '<strong></strong><small></small>';
    $('strong', item).textContent = value;
    $('small', item).textContent = label;
    return item;
  }));
}

function renderShell() {
  $('#setupView').classList.add('hidden');
  $('#testModeView').classList.add('hidden');
  $('#loginView').classList.toggle('hidden', !!state.user);
  $('#appView').classList.toggle('hidden', !state.user);
  $('#logoutButton').classList.toggle('hidden', !state.user);
  $('#testModeBanner').classList.toggle('hidden', !state.testMode);
  $('#testModeChip').classList.toggle('hidden', !state.testMode);
  if (!state.user) {
    $('#openIncidentModalButton').classList.add('hidden');
    $('#currentUserLabel').classList.add('hidden');
    $('#pushStatusChip').classList.add('hidden');
    $('#pushToggleButton').classList.add('hidden');
    $('#pushTestButton').classList.add('hidden');
    $('#pushTestHint').classList.add('hidden');
    return;
  }
  normalizeActiveTab();
  $('#roleLabel').textContent = displayRoleLabel(state.user);
  $('#currentUserLabel').textContent = state.user.displayName || state.user.fullName || '';
  $('#currentUserLabel').classList.remove('hidden');
  $('#welcomeTitle').textContent = `Hei, ${state.user.displayName || state.user.fullName}`;
  $('#activeEventText').textContent = ` · Aktivt arrangement: ${activeEventName()}`;
  $('#eventForm').classList.toggle('hidden', !isPrimaryLeader());
  $('#teamForm').classList.toggle('hidden', !isPrimaryLeader());
  $('#exportActions').classList.toggle('hidden', !isPrimaryLeader());
  $('[name="role"]', $('#userForm')).closest('label').classList.toggle('hidden', !isPrimaryLeader());
  $('#leadershipField').classList.toggle('hidden', !isPrimaryLeader());
  $('#primaryLeaderField').classList.toggle('hidden', !isPrimaryLeader());
  $('#teamPanelTitle').textContent = isLeadershipUser() ? 'Grupper' : 'Mine grupper';
  $('#teamPanelEyebrow').textContent = isLeadershipUser() ? 'Gruppestatus' : 'Egne grupper';
  $('#memberOverviewTitle').textContent = 'Medlemmer';
  $('#memberOverviewBlock').classList.toggle('hidden', !(state.user.role === 'teamLead' && state.activeTab === 'members'));
  $('#adminShortcutButton').classList.toggle('hidden', !isPrimaryLeader() || state.activeTab !== 'teams');
  $('#escalateIncidentLabel').classList.toggle('hidden', state.user.role === 'member' && !isLeadershipUser());
  fillTeamSelects();
  renderPushStatus();
  renderOverviewStats();
  renderOverviewRows();
  renderOverview();
  renderIncidents();
  renderMessages();
  renderOffline();
  renderDetailModal();
  renderBottomNav();
  renderTabPanels();
  renderFloatingIncidentButton();
}


function renderTestModeStart() {
  $('#setupView').classList.add('hidden');
  $('#loginView').classList.add('hidden');
  $('#appView').classList.add('hidden');
  $('#logoutButton').classList.add('hidden');
  $('#openIncidentModalButton').classList.add('hidden');
  $('#testModeView').classList.remove('hidden');
  $('#testActiveEvent').textContent = `Aktivt testarrangement: ${activeEventName()}`;

  const groups = {
    raceLead: $('#testRaceLeadUsers'),
    leadership: $('#testLeadershipUsers'),
    teamLead: $('#testTeamLeadUsers'),
    member: $('#testMemberUsers'),
  };
  Object.values(groups).forEach((group) => group.replaceChildren());

  state.testUsers.forEach((user) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'test-user-button secondary';
    const teams = (user.teamNames || []).join(' + ') || 'Alle team og brukere';
    button.innerHTML = '<strong></strong><small></small>';
    $('strong', button).textContent = `${user.displayName || user.fullName} – ${displayRoleLabel(user)}`;
    $('small', button).textContent = isLeadershipUser(user) ? 'Innsyn i alle team og brukere' : teams;
    button.addEventListener('click', () => testLogin(user.id));
    const groupKey = isLeadershipUser(user) && !isPrimaryLeader(user) ? 'leadership' : user.role;
    groups[groupKey]?.append(button);
  });
}

async function testLogin(userId) {
  if (!state.testMode) return;
  const data = await api('login.php', { method: 'POST', body: JSON.stringify({ action: 'testLogin', userId }) });
  state.user = data.user;
  state.activeTab = roleTabs()[0]?.id || 'overview';
  setStatus('Testinnlogging ok. Testmodus er aktiv – ikke bruk dette i produksjon.', 'warning');
  await refreshData();
}

function teamNames(teamIds = []) {
  const names = teamIds
    .map((id) => state.teams.find((team) => team.id === id)?.name)
    .filter(Boolean);
  return names.join(', ') || 'Ingen grupper';
}


function fillChatControls() {
  const teamSelect = $('[name="teamId"]', $('#teamMessageForm'));
  const allowedTeams = getAllowedTeams();
  teamSelect.replaceChildren(...allowedTeams.map((team) => {
    const option = document.createElement('option');
    option.value = team.id;
    option.textContent = team.name;
    return option;
  }));

  const directForm = $('#directMessageForm');
  const directSelect = $('[name="targetUserId"]', directForm);
  const directTargets = state.messageTargets;
  directSelect.replaceChildren(...directTargets.map((user) => {
    const option = document.createElement('option');
    option.value = user.id;
    option.textContent = `${user.displayName || user.fullName} (${displayRoleLabel(user)})`;
    return option;
  }));
  directForm.classList.toggle('hidden', !state.user || (state.user.role === 'member' && !isLeadershipUser()) || directTargets.length === 0);
  $('#broadcastMessageForm').classList.toggle('hidden', !isLeadershipUser());
  $('#teamMessageForm').classList.toggle('hidden', allowedTeams.length === 0);
}

function messageTypeLabel(message) {
  if (message.type === 'broadcast') return 'Fellesmelding';
  if (message.type === 'directRaceLead') return `Direkte · ${message.targetUserName || 'Løpsleder'}`;
  return `Gruppe · ${message.teamName || 'Ukjent gruppe'}`;
}

function renderMessages() {
  fillChatControls();
  const list = $('#messageList');
  if (!list) return;
  if (!state.messages.length) {
    list.replaceChildren(emptyState('Ingen meldinger ennå.'));
    return;
  }

  list.replaceChildren(...state.messages.map((message) => {
    const created = message.createdAt ? new Date(message.createdAt).toLocaleString('no-NO') : '';
    const preview = safeText(message.body).slice(0, 96) || 'Tom melding';
    const item = structuredRow({
      className: 'compact-row message-row',
      title: messageTypeLabel(message),
      eyebrow: preview,
      meta: [
        { text: message.senderName || 'Ukjent avsender' },
        { text: created || 'Ukjent tid' },
        ...(message.read === false ? [{ text: 'Ulest', tone: 'warning' }] : []),
      ],
      ariaLabel: `Åpne melding fra ${message.senderName || 'ukjent avsender'}`,
      onClick: () => openDetailModal('message', message.id),
      markerTone: message.read === false ? 'warning' : (message.type === 'broadcast' ? 'warning' : (message.type === 'directRaceLead' ? 'info' : 'ok')),
    });
    item.dataset.type = message.type;
    return item;
  }));
}


function renderOverviewRows() {
  const list = $('#overviewRows');
  if (!list) return;
  const visibleTeams = getAllowedTeams();
  if (!visibleTeams.length) {
    list.replaceChildren(emptyState('Ingen grupper er tilgjengelige for denne rollen ennå.'));
    return;
  }
  const head = document.createElement('div');
  head.className = 'table-head';
  head.innerHTML = '<span>Område</span><span>Status</span><span>Siste hendelse</span><span>Åpne</span><span></span>';
  const rows = visibleTeams.map((team) => {
    const teamIncidents = state.incidents.filter((incident) => (incident.teamIds || []).includes(team.id));
    const latest = [...teamIncidents].sort((a, b) => safeText(b.createdAt).localeCompare(safeText(a.createdAt)))[0];
    const openCount = teamIncidents.filter((incident) => !['resolved', 'archived'].includes(incident.status)).length;
    return structuredRow({
      className: 'compact-row table-row',
      title: team.name,
      eyebrow: `${state.users.filter((user) => (user.teamIds || []).includes(team.id)).length} brukere · ${team.description || 'gruppe uten beskrivelse'}`,
      meta: [
        { text: team.active === false ? 'Inaktiv' : 'Aktiv', tone: team.active === false ? 'archived' : 'ok' },
        { text: latest?.title || 'Ingen hendelser' },
        { text: `${openCount} åpne`, tone: openCount ? 'warning' : 'ok' },
      ],
      ariaLabel: `Åpne gruppe ${team.name}`,
      onClick: () => openDetailModal('team', team.id),
      markerTone: openCount ? 'warning' : (team.active === false ? 'archived' : 'ok'),
    });
  });
  list.replaceChildren(head, ...rows);
}

function renderOverview() {
  const teamOverview = $('#teamOverview');
  const userOverview = $('#userOverview');
  if (!teamOverview || !userOverview) return;
  const visibleTeams = getAllowedTeams();
  if (!visibleTeams.length) {
    teamOverview.replaceChildren(emptyState('Ingen grupper er tilgjengelige for denne rollen ennå.'));
  } else {
    teamOverview.replaceChildren(...visibleTeams.map((team) => {
      const memberCount = state.users.filter((user) => (user.teamIds || []).includes(team.id)).length;
      const status = team.active === false ? 'Inaktiv' : 'Aktiv';
      return structuredRow({
        title: team.name,
        eyebrow: team.description || 'Gruppe uten beskrivelse',
        meta: [
          { text: `${memberCount} medlemmer` },
          { text: `Teamleder: ${teamLeaderNames(team)}` },
          { text: status, tone: team.active === false ? 'archived' : 'ok' },
        ],
        ariaLabel: `Åpne gruppe ${team.name}`,
        onClick: () => openDetailModal('team', team.id),
        markerTone: team.active === false ? 'archived' : 'ok',
      });
    }));
  }
  const activeUsers = state.users.filter((user) => user.active !== false);
  const visibleUsers = isLeadershipUser()
    ? activeUsers
    : activeUsers.filter((user) => (user.teamIds || []).some((id) => (state.user.teamIds || []).includes(id)));
  if (!visibleUsers.length) {
    userOverview.replaceChildren(emptyState('Ingen brukere er tilgjengelige for denne rollen ennå.'));
    return;
  }
  userOverview.replaceChildren(...visibleUsers.map((user) => {
    const name = user.displayName || user.fullName;
    return structuredRow({
      title: name,
      eyebrow: user.fullName !== name ? user.fullName : 'Bruker',
      meta: [
        { text: displayRoleLabel(user) },
        { text: teamNames(user.teamIds || []) },
        { text: user.active === false ? 'Inaktiv' : 'Aktiv', tone: user.active === false ? 'archived' : 'ok' },
      ],
      ariaLabel: `Åpne bruker ${name}`,
      onClick: () => openDetailModal('user', user.id),
      markerTone: user.active === false ? 'archived' : 'info',
    });
  }));
}

function renderOffline() {
  const offline = offlineIncidents();
  $('#retryOfflineButton').classList.toggle('hidden', offline.length === 0);
  if (!offline.length) {
    $('#offlineList').replaceChildren(emptyState('Ingen lokale hendelser venter på sending.'));
    return;
  }
  $('#offlineList').replaceChildren(...offline.map((incident) => {
    const item = document.createElement('div');
    item.className = 'offline-item';
    item.innerHTML = '<strong></strong><small></small>';
    $('strong', item).textContent = incident.title || 'Hendelse uten tittel';
    $('small', item).textContent = incident.savedAt ? `Lagret lokalt ${new Date(incident.savedAt).toLocaleString('no-NO')}` : 'Lagret lokalt';
    return item;
  }));
}

function renderIncidents() {
  const list = $('#incidentList');
  const sorted = [...state.incidents].sort((a, b) => {
    const priority = (incident) => (incident.escalatedToRaceLead ? 2 : 0) + (['critical', 'urgent'].includes(incident.severity) ? 1 : 0);
    return priority(b) - priority(a) || safeText(b.createdAt).localeCompare(safeText(a.createdAt));
  });
  if (!sorted.length) {
    list.replaceChildren(emptyState('Ingen aktive hendelser å vise.'));
    return;
  }

  list.replaceChildren(...sorted.map((incident) => {
    const row = structuredRow({
      className: 'incident-row',
      title: incident.title || 'Hendelse uten tittel',
      eyebrow: incident.location || 'Uten sted',
      meta: incidentMetaItems(incident).map(({ text, tone }) => ({ text, tone })),
      foot: `${formatDateTime(incident.createdAt)} · ${incident.comments?.length || 0} kommentarer · ${incident.imageRefs?.length || 0} bilder`,
      ariaLabel: `Åpne hendelse ${incident.title || 'uten tittel'}`,
      onClick: () => openDetailModal('incident', incident.id),
      markerTone: incident.escalatedToRaceLead ? 'warning' : incident.severity,
    });
    row.dataset.severity = incident.severity;
    row.dataset.escalated = String(!!incident.escalatedToRaceLead);
    return row;
  }));
}

async function refreshData() {
  if (!state.user) return;
  const [teams, users, events, incidents, messages, push] = await Promise.all([
    api('teams.php'), api('users.php'), api('events.php'), api('incidents.php'), api('messages.php'), api(PUSH_API_ENDPOINT),
  ]);
  state.teams = teams.teams;
  state.users = users.users;
  state.events = events.events;
  state.settings = events.settings;
  state.incidents = incidents.incidents;
  state.messages = messages.messages;
  state.messageTargets = messages.directTargets || [];
  state.messageUnreadCount = messages.unreadCount || 0;
  state.push = push.push || state.push;
  renderShell();
}

async function updateIncident(id, payload) {
  await api('incidents.php', { method: 'POST', body: JSON.stringify({ id, ...payload }) });
  await refreshData();
}

async function submitIncident(payload) {
  let createdIncident = null;
  try {
    const data = await api('incidents.php', { method: 'POST', body: JSON.stringify({ action: 'create', ...payload }) });
    createdIncident = data.incident;
    setStatus('Hendelsen er sendt.');
  } catch (error) {
    if (nonRetryableIncidentErrors.has(error.message)) {
      setStatus('Hendelsen kunne ikke sendes med valgte team eller rettigheter.', 'error');
      return false;
    }
    const offline = offlineIncidents();
    offline.push({ ...payload, savedAt: new Date().toISOString() });
    saveOfflineIncidents(offline);
    setStatus('Hendelsen ble lagret lokalt som ikke sendt.', 'warning');
  }
  await refreshData();
  return createdIncident;
}

async function retryOffline() {
  const offline = offlineIncidents();
  const remaining = [];
  for (const incident of offline) {
    try {
      await api('incidents.php', { method: 'POST', body: JSON.stringify({ action: 'create', ...incident }) });
    } catch (_) {
      remaining.push(incident);
    }
  }
  saveOfflineIncidents(remaining);
  setStatus(remaining.length ? 'Noen ikke-sendte hendelser ligger fortsatt lokalt.' : 'Alle ikke-sendte hendelser er sendt.');
  await refreshData();
}

async function init() {
  try {
    const setup = await api('setup.php');
    state.testMode = !!setup.testMode;
    state.testUsers = setup.testUsers || [];
    state.teams = setup.teams || [];
    state.events = setup.events || [];
    state.settings = { activeEventId: setup.activeEventId || null };
    if (state.testMode) {
      const session = await api('login.php');
      state.user = session.user;
      if (state.user) {
        renderShell();
        await refreshData();
      } else {
        renderTestModeStart();
      }
      return;
    }
    if (setup.setupRequired) {
      $('#setupView').classList.remove('hidden');
      $('#loginView').classList.add('hidden');
      $('#openIncidentModalButton').classList.add('hidden');
      return;
    }
    const session = await api('login.php');
    state.user = session.user;
    renderShell();
    await refreshData();
  } catch (error) {
    setStatus(`Feil ved oppstart: ${error.message}`, 'error');
  }
}

$('#setupForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  const data = await api('setup.php', { method: 'POST', body: JSON.stringify(formDataObject(event.currentTarget)) });
  state.user = data.user;
  state.activeTab = roleTabs()[0]?.id || 'overview';
  setStatus(`Løpsleder opprettet. PIN vises én gang: ${data.pin}`);
  await refreshData();
});

$('#loginForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  try {
    const data = await api('login.php', { method: 'POST', body: JSON.stringify(formDataObject(event.currentTarget)) });
    state.user = data.user;
    state.activeTab = roleTabs()[0]?.id || 'overview';
    setStatus('Innlogging ok.');
    await refreshData();
  } catch (error) {
    setStatus('Ugyldig PIN.', 'error');
  }
});

$('#pushToggleButton').addEventListener('click', togglePushNotifications);
$('#pushTestButton').addEventListener('click', sendTestPushNotification);

$('#logoutButton').addEventListener('click', async () => {
  await api('login.php?action=logout', { method: 'POST', body: JSON.stringify({}) });
  state.user = null;
  state.activeTab = 'overview';
  closeIncidentModal();
  if (state.testMode) {
    renderTestModeStart();
  } else {
    renderShell();
  }
});

$('#eventForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  await api('events.php', { method: 'POST', body: JSON.stringify({ action: 'create', ...formDataObject(event.currentTarget) }) });
  event.currentTarget.reset();
  await refreshData();
});

$('#teamForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  await api('teams.php', { method: 'POST', body: JSON.stringify({ action: 'create', ...formDataObject(event.currentTarget) }) });
  event.currentTarget.reset();
  await refreshData();
});

$('#userForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  const payload = formDataObject(event.currentTarget);
  if (!isPrimaryLeader() && state.user.role === 'teamLead') payload.role = 'member';
  const data = await api('users.php', { method: 'POST', body: JSON.stringify({ action: 'create', ...payload }) });
  setStatus(`Bruker opprettet. PIN vises én gang: ${data.pin}`);
  event.currentTarget.reset();
  await refreshData();
});

$('#incidentForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  const payload = formDataObject(event.currentTarget);
  const file = $('[name="image"]', event.currentTarget).files[0];
  const incident = await submitIncident(payload);
  if (incident === false) return;
  if (incident && file) {
    const body = new FormData();
    body.append('incidentId', incident.id);
    body.append('image', file);
    await api('upload.php', { method: 'POST', body });
    setStatus('Hendelsen er sendt med bilde.');
    await refreshData();
  } else if (!incident && file) {
    setStatus('Hendelsen ble lagret lokalt uten bildevedlegg. Last opp bildet etter at hendelsen er sendt.', 'warning');
  }
  event.currentTarget.reset();
  closeIncidentModal();
});

$('#openIncidentModalButton').addEventListener('click', openIncidentModal);
$('#closeIncidentModalButton').addEventListener('click', closeIncidentModal);
$('#cancelIncidentModalButton').addEventListener('click', closeIncidentModal);
$('#incidentDialog').addEventListener('close', renderFloatingIncidentButton);
$('#closeDetailModalButton').addEventListener('click', closeDetailModal);
$('#detailDialog').addEventListener('close', () => { state.detailModal = { type: null, id: null }; });
$('#adminShortcutButton').addEventListener('click', () => {
  state.activeTab = 'admin';
  renderShell();
});

async function sendMessage(type, payload, form) {
  await api('messages.php', { method: 'POST', body: JSON.stringify({ type, ...payload }) });
  form.reset();
  setStatus('Meldingen er sendt.');
  await refreshData();
}

$('#teamMessageForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  await sendMessage('team', { teamId: $('[name="teamId"]', form).value, body: $('[name="body"]', form).value }, form);
});

$('#directMessageForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  await sendMessage('directRaceLead', { targetUserId: $('[name="targetUserId"]', form).value, body: $('[name="body"]', form).value }, form);
});

$('#broadcastMessageForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  await sendMessage('broadcast', { body: $('[name="body"]', form).value }, form);
});

$('#refreshMessagesButton').addEventListener('click', refreshData);
$('#retryOfflineButton').addEventListener('click', retryOffline);
init();
